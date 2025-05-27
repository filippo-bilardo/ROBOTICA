const { v4: uuidv4 } = require('uuid');
const EventStore = require('./EventStore');
const ProjectionService = require('./ProjectionService');
const KafkaPublisher = require('./KafkaPublisher');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

class OrderService {
  constructor() {
    this.eventStore = new EventStore();
    this.projectionService = new ProjectionService();
    this.kafkaPublisher = new KafkaPublisher();
  }

  /**
   * Create a new order
   */
  async createOrder(orderData, userId, correlationId = uuidv4()) {
    const orderId = uuidv4();
    const streamId = `order-${orderId}`;
    
    try {
      // Validate order data
      this.validateOrderData(orderData);
      
      // Calculate total amount
      const totalAmount = this.calculateTotalAmount(orderData.items);
      
      // Create order created event
      const orderCreatedEvent = {
        eventType: 'OrderCreated',
        eventData: {
          orderId,
          userId,
          items: orderData.items,
          totalAmount,
          currency: orderData.currency || 'EUR',
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress,
          paymentMethod: orderData.paymentMethod
        },
        metadata: {
          userId,
          correlationId,
          causationId: correlationId
        },
        correlationId,
        causationId: correlationId
      };

      // Append event to event store
      await this.eventStore.appendEvents(streamId, [orderCreatedEvent], 0);
      
      // Update projection
      await this.projectionService.handleEvent(orderCreatedEvent);
      
      // Publish event to Kafka
      await this.kafkaPublisher.publishEvent('order.created', orderCreatedEvent);
      
      metrics.ordersCreated.inc();
      logger.info(`Order created successfully`, { orderId, userId, correlationId });
      
      return { orderId, status: 'pending' };
    } catch (error) {
      metrics.orderErrors.inc({ operation: 'create' });
      logger.error('Error creating order', { orderData, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Confirm an order (typically after payment processing)
   */
  async confirmOrder(orderId, correlationId = uuidv4()) {
    const streamId = `order-${orderId}`;
    
    try {
      // Get current order state
      const order = await this.eventStore.getAggregate(streamId);
      
      if (!order.id) {
        throw new Error(`Order ${orderId} not found`);
      }
      
      if (order.status !== 'pending') {
        throw new Error(`Order ${orderId} cannot be confirmed. Current status: ${order.status}`);
      }

      const orderConfirmedEvent = {
        eventType: 'OrderConfirmed',
        eventData: {
          orderId,
          confirmedAt: new Date()
        },
        metadata: {
          correlationId,
          causationId: correlationId
        },
        correlationId,
        causationId: correlationId
      };

      await this.eventStore.appendEvents(streamId, [orderConfirmedEvent], order.version);
      await this.projectionService.handleEvent(orderConfirmedEvent);
      await this.kafkaPublisher.publishEvent('order.confirmed', orderConfirmedEvent);
      
      metrics.ordersConfirmed.inc();
      logger.info(`Order confirmed successfully`, { orderId, correlationId });
      
      return { orderId, status: 'confirmed' };
    } catch (error) {
      metrics.orderErrors.inc({ operation: 'confirm' });
      logger.error('Error confirming order', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Start processing an order
   */
  async startProcessing(orderId, correlationId = uuidv4()) {
    const streamId = `order-${orderId}`;
    
    try {
      const order = await this.eventStore.getAggregate(streamId);
      
      if (!order.id) {
        throw new Error(`Order ${orderId} not found`);
      }
      
      if (order.status !== 'confirmed') {
        throw new Error(`Order ${orderId} cannot be processed. Current status: ${order.status}`);
      }

      const processingStartedEvent = {
        eventType: 'OrderProcessingStarted',
        eventData: {
          orderId,
          processingStartedAt: new Date()
        },
        metadata: {
          correlationId,
          causationId: correlationId
        },
        correlationId,
        causationId: correlationId
      };

      await this.eventStore.appendEvents(streamId, [processingStartedEvent], order.version);
      await this.projectionService.handleEvent(processingStartedEvent);
      await this.kafkaPublisher.publishEvent('order.processing.started', processingStartedEvent);
      
      metrics.ordersProcessing.inc();
      logger.info(`Order processing started`, { orderId, correlationId });
      
      return { orderId, status: 'processing' };
    } catch (error) {
      metrics.orderErrors.inc({ operation: 'start_processing' });
      logger.error('Error starting order processing', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Ship an order
   */
  async shipOrder(orderId, shippingData, correlationId = uuidv4()) {
    const streamId = `order-${orderId}`;
    
    try {
      const order = await this.eventStore.getAggregate(streamId);
      
      if (!order.id) {
        throw new Error(`Order ${orderId} not found`);
      }
      
      if (order.status !== 'processing') {
        throw new Error(`Order ${orderId} cannot be shipped. Current status: ${order.status}`);
      }

      const orderShippedEvent = {
        eventType: 'OrderShipped',
        eventData: {
          orderId,
          trackingNumber: shippingData.trackingNumber,
          carrier: shippingData.carrier,
          shippedAt: new Date(),
          estimatedDelivery: shippingData.estimatedDelivery
        },
        metadata: {
          correlationId,
          causationId: correlationId
        },
        correlationId,
        causationId: correlationId
      };

      await this.eventStore.appendEvents(streamId, [orderShippedEvent], order.version);
      await this.projectionService.handleEvent(orderShippedEvent);
      await this.kafkaPublisher.publishEvent('order.shipped', orderShippedEvent);
      
      metrics.ordersShipped.inc();
      logger.info(`Order shipped successfully`, { orderId, trackingNumber: shippingData.trackingNumber, correlationId });
      
      return { orderId, status: 'shipped', trackingNumber: shippingData.trackingNumber };
    } catch (error) {
      metrics.orderErrors.inc({ operation: 'ship' });
      logger.error('Error shipping order', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Mark order as delivered
   */
  async deliverOrder(orderId, correlationId = uuidv4()) {
    const streamId = `order-${orderId}`;
    
    try {
      const order = await this.eventStore.getAggregate(streamId);
      
      if (!order.id) {
        throw new Error(`Order ${orderId} not found`);
      }
      
      if (order.status !== 'shipped') {
        throw new Error(`Order ${orderId} cannot be marked as delivered. Current status: ${order.status}`);
      }

      const orderDeliveredEvent = {
        eventType: 'OrderDelivered',
        eventData: {
          orderId,
          deliveredAt: new Date()
        },
        metadata: {
          correlationId,
          causationId: correlationId
        },
        correlationId,
        causationId: correlationId
      };

      await this.eventStore.appendEvents(streamId, [orderDeliveredEvent], order.version);
      await this.projectionService.handleEvent(orderDeliveredEvent);
      await this.kafkaPublisher.publishEvent('order.delivered', orderDeliveredEvent);
      
      metrics.ordersDelivered.inc();
      logger.info(`Order delivered successfully`, { orderId, correlationId });
      
      return { orderId, status: 'delivered' };
    } catch (error) {
      metrics.orderErrors.inc({ operation: 'deliver' });
      logger.error('Error delivering order', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId, reason, correlationId = uuidv4()) {
    const streamId = `order-${orderId}`;
    
    try {
      const order = await this.eventStore.getAggregate(streamId);
      
      if (!order.id) {
        throw new Error(`Order ${orderId} not found`);
      }
      
      if (['delivered', 'cancelled'].includes(order.status)) {
        throw new Error(`Order ${orderId} cannot be cancelled. Current status: ${order.status}`);
      }

      const orderCancelledEvent = {
        eventType: 'OrderCancelled',
        eventData: {
          orderId,
          reason,
          cancelledAt: new Date()
        },
        metadata: {
          correlationId,
          causationId: correlationId
        },
        correlationId,
        causationId: correlationId
      };

      await this.eventStore.appendEvents(streamId, [orderCancelledEvent], order.version);
      await this.projectionService.handleEvent(orderCancelledEvent);
      await this.kafkaPublisher.publishEvent('order.cancelled', orderCancelledEvent);
      
      metrics.ordersCancelled.inc();
      logger.info(`Order cancelled successfully`, { orderId, reason, correlationId });
      
      return { orderId, status: 'cancelled', reason };
    } catch (error) {
      metrics.orderErrors.inc({ operation: 'cancel' });
      logger.error('Error cancelling order', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Get order by ID from projection
   */
  async getOrderById(orderId) {
    try {
      const order = await this.projectionService.getOrderById(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }
      return order;
    } catch (error) {
      logger.error('Error getting order by ID', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Get orders for a user
   */
  async getUserOrders(userId, page = 1, limit = 10) {
    try {
      return await this.projectionService.getUserOrders(userId, page, limit);
    } catch (error) {
      logger.error('Error getting user orders', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get order history (events) for debugging
   */
  async getOrderHistory(orderId) {
    const streamId = `order-${orderId}`;
    try {
      return await this.eventStore.getEvents(streamId);
    } catch (error) {
      logger.error('Error getting order history', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Validate order data
   */
  validateOrderData(orderData) {
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    for (const item of orderData.items) {
      if (!item.productId || !item.productName || !item.quantity || !item.unitPrice) {
        throw new Error('Each order item must have productId, productName, quantity, and unitPrice');
      }
      if (item.quantity <= 0 || item.unitPrice < 0) {
        throw new Error('Quantity must be positive and unitPrice must be non-negative');
      }
    }

    if (!orderData.shippingAddress || !orderData.shippingAddress.street || !orderData.shippingAddress.city) {
      throw new Error('Shipping address is required');
    }

    if (!orderData.paymentMethod || !orderData.paymentMethod.type) {
      throw new Error('Payment method is required');
    }
  }

  /**
   * Calculate total amount from items
   */
  calculateTotalAmount(items) {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  }
}

module.exports = OrderService;
