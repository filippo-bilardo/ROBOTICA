const { OrderProjection } = require('../models/Order');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

class ProjectionService {
  constructor() {
    this.eventHandlers = {
      'OrderCreated': this.handleOrderCreated.bind(this),
      'OrderConfirmed': this.handleOrderConfirmed.bind(this),
      'OrderProcessingStarted': this.handleOrderProcessingStarted.bind(this),
      'OrderShipped': this.handleOrderShipped.bind(this),
      'OrderDelivered': this.handleOrderDelivered.bind(this),
      'OrderCancelled': this.handleOrderCancelled.bind(this),
      'OrderItemUpdated': this.handleOrderItemUpdated.bind(this)
    };
  }

  /**
   * Handle events and update projections
   */
  async handleEvent(event) {
    const handler = this.eventHandlers[event.eventType];
    
    if (!handler) {
      logger.warn(`No handler found for event type: ${event.eventType}`);
      return;
    }

    try {
      await handler(event);
      metrics.projectionUpdates.inc({ eventType: event.eventType });
      logger.debug(`Projection updated for event: ${event.eventType}`, {
        eventType: event.eventType,
        streamId: event.streamId
      });
    } catch (error) {
      metrics.projectionErrors.inc({ eventType: event.eventType });
      logger.error(`Error updating projection for event: ${event.eventType}`, {
        eventType: event.eventType,
        error: error.message,
        event
      });
      throw error;
    }
  }

  /**
   * Handle OrderCreated event
   */
  async handleOrderCreated(event) {
    const { eventData } = event;
    
    const orderProjection = new OrderProjection({
      orderId: eventData.orderId,
      userId: eventData.userId,
      status: 'pending',
      items: eventData.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      })),
      totalAmount: eventData.totalAmount,
      currency: eventData.currency,
      shippingAddress: eventData.shippingAddress,
      billingAddress: eventData.billingAddress,
      paymentMethod: eventData.paymentMethod,
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
      version: event.version
    });

    await orderProjection.save();
  }

  /**
   * Handle OrderConfirmed event
   */
  async handleOrderConfirmed(event) {
    const { eventData } = event;
    
    await OrderProjection.findOneAndUpdate(
      { orderId: eventData.orderId },
      {
        status: 'confirmed',
        updatedAt: event.timestamp,
        version: event.version
      }
    );
  }

  /**
   * Handle OrderProcessingStarted event
   */
  async handleOrderProcessingStarted(event) {
    const { eventData } = event;
    
    await OrderProjection.findOneAndUpdate(
      { orderId: eventData.orderId },
      {
        status: 'processing',
        updatedAt: event.timestamp,
        version: event.version
      }
    );
  }

  /**
   * Handle OrderShipped event
   */
  async handleOrderShipped(event) {
    const { eventData } = event;
    
    await OrderProjection.findOneAndUpdate(
      { orderId: eventData.orderId },
      {
        status: 'shipped',
        trackingNumber: eventData.trackingNumber,
        carrier: eventData.carrier,
        shippedAt: eventData.shippedAt,
        estimatedDelivery: eventData.estimatedDelivery,
        updatedAt: event.timestamp,
        version: event.version
      }
    );
  }

  /**
   * Handle OrderDelivered event
   */
  async handleOrderDelivered(event) {
    const { eventData } = event;
    
    await OrderProjection.findOneAndUpdate(
      { orderId: eventData.orderId },
      {
        status: 'delivered',
        deliveredAt: eventData.deliveredAt,
        updatedAt: event.timestamp,
        version: event.version
      }
    );
  }

  /**
   * Handle OrderCancelled event
   */
  async handleOrderCancelled(event) {
    const { eventData } = event;
    
    await OrderProjection.findOneAndUpdate(
      { orderId: eventData.orderId },
      {
        status: 'cancelled',
        cancelledAt: eventData.cancelledAt,
        cancellationReason: eventData.reason,
        updatedAt: event.timestamp,
        version: event.version
      }
    );
  }

  /**
   * Handle OrderItemUpdated event
   */
  async handleOrderItemUpdated(event) {
    const { eventData } = event;
    
    const order = await OrderProjection.findOne({ orderId: eventData.orderId });
    if (!order) {
      throw new Error(`Order projection not found: ${eventData.orderId}`);
    }

    // Update the specific item
    const updatedItems = order.items.map(item => {
      if (item.productId === eventData.productId) {
        return {
          ...item.toObject(),
          ...eventData.updates,
          totalPrice: (eventData.updates.quantity || item.quantity) * (eventData.updates.unitPrice || item.unitPrice)
        };
      }
      return item;
    });

    await OrderProjection.findOneAndUpdate(
      { orderId: eventData.orderId },
      {
        items: updatedItems,
        totalAmount: eventData.newTotalAmount,
        updatedAt: event.timestamp,
        version: event.version
      }
    );
  }

  /**
   * Get order by ID from projection
   */
  async getOrderById(orderId) {
    try {
      return await OrderProjection.findOne({ orderId }).lean();
    } catch (error) {
      logger.error('Error getting order projection by ID', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Get orders for a user with pagination
   */
  async getUserOrders(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [orders, total] = await Promise.all([
        OrderProjection.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        OrderProjection.countDocuments({ userId })
      ]);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting user orders', { userId, page, limit, error: error.message });
      throw error;
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [orders, total] = await Promise.all([
        OrderProjection.find({ status })
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        OrderProjection.countDocuments({ status })
      ]);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting orders by status', { status, page, limit, error: error.message });
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics() {
    try {
      const stats = await OrderProjection.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]);

      const result = {
        totalOrders: 0,
        totalRevenue: 0,
        byStatus: {}
      };

      for (const stat of stats) {
        result.totalOrders += stat.count;
        result.totalRevenue += stat.totalAmount;
        result.byStatus[stat._id] = {
          count: stat.count,
          totalAmount: stat.totalAmount
        };
      }

      return result;
    } catch (error) {
      logger.error('Error getting order statistics', { error: error.message });
      throw error;
    }
  }

  /**
   * Search orders by product ID
   */
  async getOrdersByProductId(productId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [orders, total] = await Promise.all([
        OrderProjection.find({ 'items.productId': productId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        OrderProjection.countDocuments({ 'items.productId': productId })
      ]);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting orders by product ID', { productId, page, limit, error: error.message });
      throw error;
    }
  }

  /**
   * Get recent orders (last 24 hours)
   */
  async getRecentOrders(limit = 50) {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      return await OrderProjection.find({
        createdAt: { $gte: yesterday }
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      logger.error('Error getting recent orders', { error: error.message });
      throw error;
    }
  }

  /**
   * Rebuild projection from events (for maintenance)
   */
  async rebuildProjection(orderId) {
    try {
      // Delete existing projection
      await OrderProjection.deleteOne({ orderId });
      
      // Get all events for this order
      const EventStore = require('./EventStore');
      const eventStore = new EventStore();
      const events = await eventStore.getEvents(`order-${orderId}`);
      
      // Replay events to rebuild projection
      for (const event of events) {
        await this.handleEvent(event);
      }
      
      logger.info(`Rebuilt projection for order ${orderId}`);
    } catch (error) {
      logger.error('Error rebuilding projection', { orderId, error: error.message });
      throw error;
    }
  }
}

module.exports = ProjectionService;
