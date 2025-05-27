const { v4: uuidv4 } = require('uuid');
const { Event, OrderProjection, Snapshot } = require('../models/Order');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

class EventStore {
  constructor() {
    this.snapshotFrequency = 10; // Take snapshot every 10 events
  }

  /**
   * Append events to the event store
   */
  async appendEvents(streamId, events, expectedVersion) {
    const session = await require('mongoose').startSession();
    
    try {
      await session.withTransaction(async () => {
        // Check for concurrency conflicts
        const lastEvent = await Event.findOne(
          { streamId },
          {},
          { sort: { version: -1 }, session }
        );

        const currentVersion = lastEvent ? lastEvent.version : 0;
        
        if (expectedVersion !== -1 && currentVersion !== expectedVersion) {
          throw new Error(`Concurrency conflict. Expected version ${expectedVersion}, but current version is ${currentVersion}`);
        }

        // Prepare events with incrementing versions
        const eventsToStore = events.map((event, index) => ({
          ...event,
          streamId,
          version: currentVersion + index + 1,
          timestamp: new Date()
        }));

        // Insert events
        await Event.insertMany(eventsToStore, { session });

        // Check if we need to create a snapshot
        const newVersion = currentVersion + events.length;
        if (newVersion % this.snapshotFrequency === 0) {
          await this.createSnapshot(streamId, newVersion, session);
        }

        metrics.eventStoreOperations.inc({ operation: 'append_events' });
        logger.info(`Appended ${events.length} events to stream ${streamId}`, {
          streamId,
          eventCount: events.length,
          newVersion
        });
      });
    } catch (error) {
      metrics.eventStoreErrors.inc({ operation: 'append_events' });
      logger.error('Error appending events', { streamId, error: error.message });
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get events from stream starting from a specific version
   */
  async getEvents(streamId, fromVersion = 0) {
    try {
      const events = await Event.find({
        streamId,
        version: { $gt: fromVersion }
      }).sort({ version: 1 });

      metrics.eventStoreOperations.inc({ operation: 'get_events' });
      
      return events.map(event => ({
        streamId: event.streamId,
        eventType: event.eventType,
        eventData: event.eventData,
        metadata: event.metadata,
        version: event.version,
        timestamp: event.timestamp,
        correlationId: event.correlationId,
        causationId: event.causationId
      }));
    } catch (error) {
      metrics.eventStoreErrors.inc({ operation: 'get_events' });
      logger.error('Error getting events', { streamId, fromVersion, error: error.message });
      throw error;
    }
  }

  /**
   * Get aggregate from events with optional snapshot optimization
   */
  async getAggregate(streamId, aggregateType = 'Order') {
    try {
      // Try to get the latest snapshot first
      const snapshot = await Snapshot.findOne(
        { streamId },
        {},
        { sort: { version: -1 } }
      );

      let aggregate = null;
      let fromVersion = 0;

      if (snapshot) {
        aggregate = this.deserializeAggregate(snapshot.data, aggregateType);
        fromVersion = snapshot.version;
      } else {
        aggregate = this.createEmptyAggregate(streamId, aggregateType);
      }

      // Get events after snapshot
      const events = await this.getEvents(streamId, fromVersion);
      
      // Apply events to rebuild aggregate state
      for (const event of events) {
        aggregate = this.applyEvent(aggregate, event);
      }

      metrics.eventStoreOperations.inc({ operation: 'get_aggregate' });
      
      return aggregate;
    } catch (error) {
      metrics.eventStoreErrors.inc({ operation: 'get_aggregate' });
      logger.error('Error getting aggregate', { streamId, error: error.message });
      throw error;
    }
  }

  /**
   * Create snapshot for performance optimization
   */
  async createSnapshot(streamId, version, session) {
    try {
      const aggregate = await this.getAggregate(streamId);
      
      const snapshot = new Snapshot({
        streamId,
        data: this.serializeAggregate(aggregate),
        version,
        timestamp: new Date()
      });

      await snapshot.save({ session });
      
      logger.info(`Created snapshot for stream ${streamId} at version ${version}`);
    } catch (error) {
      logger.error('Error creating snapshot', { streamId, version, error: error.message });
      // Don't throw here as snapshots are optimization, not critical
    }
  }

  /**
   * Apply event to aggregate
   */
  applyEvent(aggregate, event) {
    switch (event.eventType) {
      case 'OrderCreated':
        return {
          ...aggregate,
          id: event.eventData.orderId,
          userId: event.eventData.userId,
          items: event.eventData.items,
          totalAmount: event.eventData.totalAmount,
          currency: event.eventData.currency,
          status: 'pending',
          shippingAddress: event.eventData.shippingAddress,
          billingAddress: event.eventData.billingAddress,
          paymentMethod: event.eventData.paymentMethod,
          createdAt: event.timestamp,
          version: event.version
        };
      
      case 'OrderConfirmed':
        return {
          ...aggregate,
          status: 'confirmed',
          confirmedAt: event.timestamp,
          version: event.version
        };
      
      case 'OrderProcessingStarted':
        return {
          ...aggregate,
          status: 'processing',
          processingStartedAt: event.timestamp,
          version: event.version
        };
      
      case 'OrderShipped':
        return {
          ...aggregate,
          status: 'shipped',
          shippedAt: event.timestamp,
          trackingNumber: event.eventData.trackingNumber,
          carrier: event.eventData.carrier,
          version: event.version
        };
      
      case 'OrderDelivered':
        return {
          ...aggregate,
          status: 'delivered',
          deliveredAt: event.timestamp,
          version: event.version
        };
      
      case 'OrderCancelled':
        return {
          ...aggregate,
          status: 'cancelled',
          cancelledAt: event.timestamp,
          cancellationReason: event.eventData.reason,
          version: event.version
        };
      
      case 'OrderItemUpdated':
        return {
          ...aggregate,
          items: aggregate.items.map(item => 
            item.productId === event.eventData.productId 
              ? { ...item, ...event.eventData.updates }
              : item
          ),
          totalAmount: event.eventData.newTotalAmount,
          version: event.version
        };
      
      default:
        logger.warn(`Unknown event type: ${event.eventType}`);
        return aggregate;
    }
  }

  /**
   * Create empty aggregate
   */
  createEmptyAggregate(streamId, aggregateType) {
    return {
      id: streamId,
      type: aggregateType,
      version: 0
    };
  }

  /**
   * Serialize aggregate for snapshot storage
   */
  serializeAggregate(aggregate) {
    return JSON.stringify(aggregate);
  }

  /**
   * Deserialize aggregate from snapshot
   */
  deserializeAggregate(data, aggregateType) {
    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  /**
   * Get events by correlation ID for debugging
   */
  async getEventsByCorrelationId(correlationId) {
    try {
      const events = await Event.find({ correlationId }).sort({ timestamp: 1 });
      return events;
    } catch (error) {
      logger.error('Error getting events by correlation ID', { correlationId, error: error.message });
      throw error;
    }
  }

  /**
   * Get stream names (for administrative purposes)
   */
  async getStreamNames(limit = 100, offset = 0) {
    try {
      const streams = await Event.aggregate([
        { $group: { _id: '$streamId', eventCount: { $sum: 1 }, lastEvent: { $max: '$timestamp' } } },
        { $sort: { lastEvent: -1 } },
        { $skip: offset },
        { $limit: limit }
      ]);
      
      return streams.map(stream => ({
        streamId: stream._id,
        eventCount: stream.eventCount,
        lastEvent: stream.lastEvent
      }));
    } catch (error) {
      logger.error('Error getting stream names', { error: error.message });
      throw error;
    }
  }
}

module.exports = EventStore;
