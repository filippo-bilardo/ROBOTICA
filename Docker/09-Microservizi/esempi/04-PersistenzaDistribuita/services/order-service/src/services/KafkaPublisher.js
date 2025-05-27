const { Kafka } = require('kafkajs');
const config = require('../config');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

class KafkaPublisher {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'order-service-publisher',
      brokers: config.kafka.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
    
    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000
    });
    
    this.isConnected = false;
  }

  /**
   * Initialize Kafka producer
   */
  async connect() {
    try {
      await this.producer.connect();
      this.isConnected = true;
      logger.info('Kafka producer connected successfully');
    } catch (error) {
      logger.error('Failed to connect Kafka producer', { error: error.message });
      throw error;
    }
  }

  /**
   * Disconnect Kafka producer
   */
  async disconnect() {
    try {
      if (this.isConnected) {
        await this.producer.disconnect();
        this.isConnected = false;
        logger.info('Kafka producer disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting Kafka producer', { error: error.message });
    }
  }

  /**
   * Publish event to Kafka topic
   */
  async publishEvent(topic, event) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const message = {
        topic,
        messages: [{
          key: event.streamId || event.eventData?.orderId,
          value: JSON.stringify({
            ...event,
            publishedAt: new Date().toISOString(),
            source: 'order-service'
          }),
          headers: {
            eventType: event.eventType,
            correlationId: event.correlationId,
            causationId: event.causationId,
            contentType: 'application/json'
          }
        }]
      };

      const result = await this.producer.send(message);
      
      metrics.kafkaMessagesPublished.inc({ topic, eventType: event.eventType });
      logger.debug('Event published to Kafka', {
        topic,
        eventType: event.eventType,
        correlationId: event.correlationId,
        partition: result[0].partition,
        offset: result[0].offset
      });

      return result;
    } catch (error) {
      metrics.kafkaPublishErrors.inc({ topic, eventType: event.eventType });
      logger.error('Failed to publish event to Kafka', {
        topic,
        eventType: event.eventType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Publish multiple events in a transaction
   */
  async publishEventsTransaction(events) {
    if (!this.isConnected) {
      await this.connect();
    }

    const transaction = await this.producer.transaction();
    
    try {
      for (const { topic, event } of events) {
        await transaction.send({
          topic,
          messages: [{
            key: event.streamId || event.eventData?.orderId,
            value: JSON.stringify({
              ...event,
              publishedAt: new Date().toISOString(),
              source: 'order-service'
            }),
            headers: {
              eventType: event.eventType,
              correlationId: event.correlationId,
              causationId: event.causationId,
              contentType: 'application/json'
            }
          }]
        });
      }

      await transaction.commit();
      
      events.forEach(({ topic, event }) => {
        metrics.kafkaMessagesPublished.inc({ topic, eventType: event.eventType });
      });
      
      logger.info(`Published ${events.length} events in transaction`);
    } catch (error) {
      await transaction.abort();
      
      events.forEach(({ topic, event }) => {
        metrics.kafkaPublishErrors.inc({ topic, eventType: event.eventType });
      });
      
      logger.error('Failed to publish events in transaction', { error: error.message });
      throw error;
    }
  }

  /**
   * Publish order created event
   */
  async publishOrderCreated(event) {
    return this.publishEvent('order.events', {
      ...event,
      eventType: 'OrderCreated'
    });
  }

  /**
   * Publish order confirmed event
   */
  async publishOrderConfirmed(event) {
    return this.publishEvent('order.events', {
      ...event,
      eventType: 'OrderConfirmed'
    });
  }

  /**
   * Publish order processing started event
   */
  async publishOrderProcessingStarted(event) {
    return this.publishEvent('order.events', {
      ...event,
      eventType: 'OrderProcessingStarted'
    });
  }

  /**
   * Publish order shipped event
   */
  async publishOrderShipped(event) {
    return this.publishEvent('order.events', {
      ...event,
      eventType: 'OrderShipped'
    });
  }

  /**
   * Publish order delivered event
   */
  async publishOrderDelivered(event) {
    return this.publishEvent('order.events', {
      ...event,
      eventType: 'OrderDelivered'
    });
  }

  /**
   * Publish order cancelled event
   */
  async publishOrderCancelled(event) {
    return this.publishEvent('order.events', {
      ...event,
      eventType: 'OrderCancelled'
    });
  }

  /**
   * Publish saga event
   */
  async publishSagaEvent(sagaId, eventType, eventData) {
    const event = {
      eventType,
      eventData: {
        sagaId,
        ...eventData
      },
      metadata: {
        sagaId,
        timestamp: new Date().toISOString()
      }
    };

    return this.publishEvent('order.saga', event);
  }

  /**
   * Health check for Kafka connection
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        throw new Error('Kafka producer not connected');
      }
      
      // Try to get metadata as a simple health check
      const admin = this.kafka.admin();
      await admin.connect();
      await admin.getTopicMetadata({ topics: ['order.events'] });
      await admin.disconnect();
      
      return { status: 'healthy', connected: true };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        connected: false, 
        error: error.message 
      };
    }
  }
}

module.exports = KafkaPublisher;
