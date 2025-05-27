const { Kafka } = require('kafkajs');
const config = require('../config');
const ProjectionService = require('./ProjectionService');
const SagaOrchestrator = require('./SagaOrchestrator');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

class KafkaConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'order-service-consumer',
      brokers: config.kafka.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
    
    this.consumer = this.kafka.consumer({
      groupId: 'order-service-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });
    
    this.projectionService = new ProjectionService();
    this.sagaOrchestrator = new SagaOrchestrator();
    this.isRunning = false;
  }

  /**
   * Start consuming messages
   */
  async start() {
    try {
      await this.consumer.connect();
      
      // Subscribe to relevant topics
      await this.consumer.subscribe({
        topics: [
          'user.events',      // User service events
          'catalog.events',   // Catalog service events
          'payment.events',   // Payment service events
          'inventory.events', // Inventory service events
          'shipping.events'   // Shipping service events
        ],
        fromBeginning: false
      });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          await this.handleMessage(topic, partition, message);
        }
      });

      this.isRunning = true;
      logger.info('Kafka consumer started successfully');
    } catch (error) {
      logger.error('Failed to start Kafka consumer', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop consuming messages
   */
  async stop() {
    try {
      if (this.isRunning) {
        await this.consumer.disconnect();
        this.isRunning = false;
        logger.info('Kafka consumer stopped');
      }
    } catch (error) {
      logger.error('Error stopping Kafka consumer', { error: error.message });
    }
  }

  /**
   * Handle incoming Kafka message
   */
  async handleMessage(topic, partition, message) {
    try {
      const event = JSON.parse(message.value.toString());
      const eventType = message.headers?.eventType?.toString() || event.eventType;
      
      logger.debug('Received Kafka message', {
        topic,
        partition,
        offset: message.offset,
        eventType,
        correlationId: event.correlationId
      });

      // Route message to appropriate handler
      switch (topic) {
        case 'user.events':
          await this.handleUserEvent(event);
          break;
        case 'catalog.events':
          await this.handleCatalogEvent(event);
          break;
        case 'payment.events':
          await this.handlePaymentEvent(event);
          break;
        case 'inventory.events':
          await this.handleInventoryEvent(event);
          break;
        case 'shipping.events':
          await this.handleShippingEvent(event);
          break;
        default:
          logger.warn(`Unhandled topic: ${topic}`);
      }

      metrics.kafkaMessagesProcessed.inc({ topic, eventType });
    } catch (error) {
      metrics.kafkaProcessingErrors.inc({ topic });
      logger.error('Error processing Kafka message', {
        topic,
        partition,
        offset: message.offset,
        error: error.message
      });
      
      // Could implement dead letter queue here
      throw error;
    }
  }

  /**
   * Handle user service events
   */
  async handleUserEvent(event) {
    switch (event.eventType) {
      case 'UserCreated':
        logger.info('User created, no immediate action needed', {
          userId: event.eventData.userId,
          correlationId: event.correlationId
        });
        break;
        
      case 'UserUpdated':
        // Could update user information in order projections if needed
        logger.info('User updated', {
          userId: event.eventData.userId,
          correlationId: event.correlationId
        });
        break;
        
      default:
        logger.debug(`Unhandled user event: ${event.eventType}`);
    }
  }

  /**
   * Handle catalog service events
   */
  async handleCatalogEvent(event) {
    switch (event.eventType) {
      case 'ProductCreated':
        logger.info('Product created', {
          productId: event.eventData.productId,
          correlationId: event.correlationId
        });
        break;
        
      case 'ProductUpdated':
        // Update product information in existing orders if needed
        await this.handleProductUpdated(event.eventData);
        break;
        
      case 'ProductDeleted':
        // Handle product deletion - might need to prevent new orders
        logger.warn('Product deleted', {
          productId: event.eventData.productId,
          correlationId: event.correlationId
        });
        break;
        
      default:
        logger.debug(`Unhandled catalog event: ${event.eventType}`);
    }
  }

  /**
   * Handle payment service events
   */
  async handlePaymentEvent(event) {
    switch (event.eventType) {
      case 'PaymentProcessed':
        // Confirm order after successful payment
        await this.sagaOrchestrator.handlePaymentProcessed(event.eventData);
        break;
        
      case 'PaymentFailed':
        // Cancel order after payment failure
        await this.sagaOrchestrator.handlePaymentFailed(event.eventData);
        break;
        
      case 'PaymentRefunded':
        // Handle refund
        await this.sagaOrchestrator.handlePaymentRefunded(event.eventData);
        break;
        
      default:
        logger.debug(`Unhandled payment event: ${event.eventType}`);
    }
  }

  /**
   * Handle inventory service events
   */
  async handleInventoryEvent(event) {
    switch (event.eventType) {
      case 'InventoryReserved':
        // Continue with order processing
        await this.sagaOrchestrator.handleInventoryReserved(event.eventData);
        break;
        
      case 'InventoryReservationFailed':
        // Cancel order due to insufficient inventory
        await this.sagaOrchestrator.handleInventoryReservationFailed(event.eventData);
        break;
        
      case 'InventoryReleased':
        // Inventory released (e.g., after order cancellation)
        logger.info('Inventory released', {
          orderId: event.eventData.orderId,
          correlationId: event.correlationId
        });
        break;
        
      default:
        logger.debug(`Unhandled inventory event: ${event.eventType}`);
    }
  }

  /**
   * Handle shipping service events
   */
  async handleShippingEvent(event) {
    switch (event.eventType) {
      case 'ShippingScheduled':
        // Start shipping process
        await this.sagaOrchestrator.handleShippingScheduled(event.eventData);
        break;
        
      case 'ShipmentCreated':
        // Update order with shipping information
        await this.sagaOrchestrator.handleShipmentCreated(event.eventData);
        break;
        
      case 'ShipmentDelivered':
        // Mark order as delivered
        await this.sagaOrchestrator.handleShipmentDelivered(event.eventData);
        break;
        
      case 'ShippingFailed':
        // Handle shipping failure
        await this.sagaOrchestrator.handleShippingFailed(event.eventData);
        break;
        
      default:
        logger.debug(`Unhandled shipping event: ${event.eventType}`);
    }
  }

  /**
   * Handle product updated event
   */
  async handleProductUpdated(eventData) {
    try {
      // This could update product information in pending orders
      // For now, just log the event
      logger.info('Product updated, checking impact on pending orders', {
        productId: eventData.productId,
        changes: eventData.changes
      });
      
      // In a real implementation, you might:
      // 1. Find orders with this product that are still pending
      // 2. Check if price changes affect the orders
      // 3. Notify customers if needed
      // 4. Update order totals if prices changed significantly
      
    } catch (error) {
      logger.error('Error handling product updated event', {
        productId: eventData.productId,
        error: error.message
      });
    }
  }

  /**
   * Health check for Kafka consumer
   */
  async healthCheck() {
    try {
      if (!this.isRunning) {
        return { status: 'unhealthy', running: false };
      }
      
      // Check if consumer is still connected
      const admin = this.kafka.admin();
      await admin.connect();
      
      // Get consumer group metadata
      const groups = await admin.describeGroups(['order-service-group']);
      await admin.disconnect();
      
      return { 
        status: 'healthy', 
        running: true,
        groupState: groups.groups[0]?.state || 'unknown'
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        running: this.isRunning, 
        error: error.message 
      };
    }
  }

  /**
   * Get consumer lag information
   */
  async getConsumerLag() {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      const offsets = await admin.fetchOffsets({
        groupId: 'order-service-group',
        topics: [
          'user.events',
          'catalog.events', 
          'payment.events',
          'inventory.events',
          'shipping.events'
        ]
      });
      
      await admin.disconnect();
      return offsets;
    } catch (error) {
      logger.error('Error getting consumer lag', { error: error.message });
      throw error;
    }
  }
}

module.exports = KafkaConsumer;
