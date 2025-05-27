const { v4: uuidv4 } = require('uuid');
const { OrderSaga } = require('../models/Order');
const OrderService = require('./OrderService');
const KafkaPublisher = require('./KafkaPublisher');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

class SagaOrchestrator {
  constructor() {
    this.orderService = new OrderService();
    this.kafkaPublisher = new KafkaPublisher();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Start order processing saga
   */
  async startOrderSaga(orderId, correlationId = uuidv4()) {
    const sagaId = uuidv4();
    
    try {
      const saga = new OrderSaga({
        sagaId,
        orderId,
        currentStep: 'validate_order',
        status: 'started',
        steps: [
          { stepName: 'validate_order', status: 'pending' },
          { stepName: 'reserve_inventory', status: 'pending' },
          { stepName: 'process_payment', status: 'pending' },
          { stepName: 'confirm_order', status: 'pending' },
          { stepName: 'schedule_shipping', status: 'pending' }
        ],
        data: { correlationId }
      });

      await saga.save();
      
      // Start the saga
      await this.executeNextStep(sagaId);
      
      logger.info(`Order saga started`, { sagaId, orderId, correlationId });
      return sagaId;
    } catch (error) {
      logger.error('Error starting order saga', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Execute next step in saga
   */
  async executeNextStep(sagaId) {
    try {
      const saga = await OrderSaga.findOne({ sagaId });
      if (!saga) {
        throw new Error(`Saga ${sagaId} not found`);
      }

      const currentStep = saga.steps.find(step => step.stepName === saga.currentStep);
      if (!currentStep) {
        throw new Error(`Current step ${saga.currentStep} not found in saga ${sagaId}`);
      }

      // Mark step as started
      currentStep.status = 'started';
      currentStep.startedAt = new Date();
      saga.status = 'in_progress';
      await saga.save();

      // Execute step based on current step name
      switch (saga.currentStep) {
        case 'validate_order':
          await this.validateOrder(saga);
          break;
        case 'reserve_inventory':
          await this.reserveInventory(saga);
          break;
        case 'process_payment':
          await this.processPayment(saga);
          break;
        case 'confirm_order':
          await this.confirmOrder(saga);
          break;
        case 'schedule_shipping':
          await this.scheduleShipping(saga);
          break;
        default:
          throw new Error(`Unknown step: ${saga.currentStep}`);
      }
    } catch (error) {
      await this.handleStepFailure(sagaId, error);
    }
  }

  /**
   * Validate order step
   */
  async validateOrder(saga) {
    try {
      // Get order details
      const order = await this.orderService.getOrderById(saga.orderId);
      
      // Validate order data
      if (!order || !order.items || order.items.length === 0) {
        throw new Error('Invalid order data');
      }

      // Mark step as completed and move to next
      await this.completeStep(saga.sagaId, 'validate_order', 'reserve_inventory');
      
      logger.info(`Order validated in saga`, { sagaId: saga.sagaId, orderId: saga.orderId });
    } catch (error) {
      throw new Error(`Order validation failed: ${error.message}`);
    }
  }

  /**
   * Reserve inventory step
   */
  async reserveInventory(saga) {
    try {
      const order = await this.orderService.getOrderById(saga.orderId);
      
      // Publish inventory reservation request
      await this.kafkaPublisher.publishEvent('inventory.commands', {
        eventType: 'ReserveInventory',
        eventData: {
          orderId: saga.orderId,
          items: order.items,
          sagaId: saga.sagaId
        },
        correlationId: saga.data.correlationId
      });

      // Step will be completed when we receive InventoryReserved event
      logger.info(`Inventory reservation requested`, { sagaId: saga.sagaId, orderId: saga.orderId });
    } catch (error) {
      throw new Error(`Inventory reservation failed: ${error.message}`);
    }
  }

  /**
   * Process payment step
   */
  async processPayment(saga) {
    try {
      const order = await this.orderService.getOrderById(saga.orderId);
      
      // Publish payment processing request
      await this.kafkaPublisher.publishEvent('payment.commands', {
        eventType: 'ProcessPayment',
        eventData: {
          orderId: saga.orderId,
          amount: order.totalAmount,
          currency: order.currency,
          paymentMethod: order.paymentMethod,
          sagaId: saga.sagaId
        },
        correlationId: saga.data.correlationId
      });

      // Step will be completed when we receive PaymentProcessed event
      logger.info(`Payment processing requested`, { sagaId: saga.sagaId, orderId: saga.orderId });
    } catch (error) {
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  /**
   * Confirm order step
   */
  async confirmOrder(saga) {
    try {
      // Confirm the order
      await this.orderService.confirmOrder(saga.orderId, saga.data.correlationId);
      
      // Mark step as completed and move to next
      await this.completeStep(saga.sagaId, 'confirm_order', 'schedule_shipping');
      
      logger.info(`Order confirmed in saga`, { sagaId: saga.sagaId, orderId: saga.orderId });
    } catch (error) {
      throw new Error(`Order confirmation failed: ${error.message}`);
    }
  }

  /**
   * Schedule shipping step
   */
  async scheduleShipping(saga) {
    try {
      const order = await this.orderService.getOrderById(saga.orderId);
      
      // Publish shipping scheduling request
      await this.kafkaPublisher.publishEvent('shipping.commands', {
        eventType: 'ScheduleShipping',
        eventData: {
          orderId: saga.orderId,
          shippingAddress: order.shippingAddress,
          items: order.items,
          sagaId: saga.sagaId
        },
        correlationId: saga.data.correlationId
      });

      // Step will be completed when we receive ShippingScheduled event
      logger.info(`Shipping scheduling requested`, { sagaId: saga.sagaId, orderId: saga.orderId });
    } catch (error) {
      throw new Error(`Shipping scheduling failed: ${error.message}`);
    }
  }

  /**
   * Complete a saga step and move to next
   */
  async completeStep(sagaId, currentStepName, nextStepName = null) {
    try {
      const saga = await OrderSaga.findOne({ sagaId });
      if (!saga) {
        throw new Error(`Saga ${sagaId} not found`);
      }

      // Mark current step as completed
      const currentStep = saga.steps.find(step => step.stepName === currentStepName);
      if (currentStep) {
        currentStep.status = 'completed';
        currentStep.completedAt = new Date();
      }

      if (nextStepName) {
        // Move to next step
        saga.currentStep = nextStepName;
        await saga.save();
        
        // Execute next step
        await this.executeNextStep(sagaId);
      } else {
        // Saga completed
        saga.status = 'completed';
        await saga.save();
        
        metrics.sagasCompleted.inc();
        logger.info(`Saga completed successfully`, { sagaId });
      }
    } catch (error) {
      logger.error('Error completing saga step', { sagaId, currentStepName, error: error.message });
      throw error;
    }
  }

  /**
   * Handle step failure
   */
  async handleStepFailure(sagaId, error) {
    try {
      const saga = await OrderSaga.findOne({ sagaId });
      if (!saga) {
        logger.error(`Saga ${sagaId} not found for failure handling`);
        return;
      }

      const currentStep = saga.steps.find(step => step.stepName === saga.currentStep);
      if (currentStep) {
        currentStep.retryCount = (currentStep.retryCount || 0) + 1;
        currentStep.lastError = error.message;

        // Retry logic
        if (currentStep.retryCount <= this.maxRetries) {
          logger.warn(`Retrying saga step`, {
            sagaId,
            step: saga.currentStep,
            retryCount: currentStep.retryCount,
            error: error.message
          });

          await saga.save();
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * currentStep.retryCount));
          
          // Retry the step
          await this.executeNextStep(sagaId);
          return;
        } else {
          // Max retries exceeded, start compensation
          currentStep.status = 'failed';
          saga.status = 'compensating';
          await saga.save();
          
          await this.startCompensation(sagaId);
        }
      }

      metrics.sagaStepFailures.inc({ step: saga.currentStep });
      logger.error(`Saga step failed`, {
        sagaId,
        step: saga.currentStep,
        error: error.message
      });
    } catch (compensationError) {
      logger.error('Error handling saga step failure', {
        sagaId,
        originalError: error.message,
        compensationError: compensationError.message
      });
    }
  }

  /**
   * Start compensation (rollback) process
   */
  async startCompensation(sagaId) {
    try {
      const saga = await OrderSaga.findOne({ sagaId });
      if (!saga) {
        throw new Error(`Saga ${sagaId} not found`);
      }

      // Find completed steps in reverse order
      const completedSteps = saga.steps
        .filter(step => step.status === 'completed')
        .reverse();

      for (const step of completedSteps) {
        await this.compensateStep(saga, step.stepName);
      }

      // Cancel the order
      await this.orderService.cancelOrder(
        saga.orderId, 
        'Saga compensation - processing failed',
        saga.data.correlationId
      );

      saga.status = 'compensated';
      await saga.save();

      metrics.sagasCompensated.inc();
      logger.info(`Saga compensated successfully`, { sagaId });
    } catch (error) {
      saga.status = 'failed';
      await saga.save();
      
      metrics.sagasFailed.inc();
      logger.error('Error compensating saga', { sagaId, error: error.message });
    }
  }

  /**
   * Compensate a specific step
   */
  async compensateStep(saga, stepName) {
    try {
      switch (stepName) {
        case 'reserve_inventory':
          await this.kafkaPublisher.publishEvent('inventory.commands', {
            eventType: 'ReleaseInventory',
            eventData: {
              orderId: saga.orderId,
              sagaId: saga.sagaId
            },
            correlationId: saga.data.correlationId
          });
          break;
          
        case 'process_payment':
          await this.kafkaPublisher.publishEvent('payment.commands', {
            eventType: 'RefundPayment',
            eventData: {
              orderId: saga.orderId,
              sagaId: saga.sagaId
            },
            correlationId: saga.data.correlationId
          });
          break;
          
        case 'schedule_shipping':
          await this.kafkaPublisher.publishEvent('shipping.commands', {
            eventType: 'CancelShipping',
            eventData: {
              orderId: saga.orderId,
              sagaId: saga.sagaId
            },
            correlationId: saga.data.correlationId
          });
          break;
          
        default:
          logger.warn(`No compensation defined for step: ${stepName}`);
      }

      logger.info(`Compensated step: ${stepName}`, { sagaId: saga.sagaId });
    } catch (error) {
      logger.error(`Error compensating step: ${stepName}`, {
        sagaId: saga.sagaId,
        error: error.message
      });
    }
  }

  // Event handlers for external service responses

  async handleInventoryReserved(eventData) {
    const saga = await OrderSaga.findOne({ sagaId: eventData.sagaId });
    if (saga && saga.currentStep === 'reserve_inventory') {
      await this.completeStep(saga.sagaId, 'reserve_inventory', 'process_payment');
    }
  }

  async handleInventoryReservationFailed(eventData) {
    const saga = await OrderSaga.findOne({ sagaId: eventData.sagaId });
    if (saga) {
      await this.handleStepFailure(saga.sagaId, new Error('Inventory reservation failed'));
    }
  }

  async handlePaymentProcessed(eventData) {
    const saga = await OrderSaga.findOne({ sagaId: eventData.sagaId });
    if (saga && saga.currentStep === 'process_payment') {
      await this.completeStep(saga.sagaId, 'process_payment', 'confirm_order');
    }
  }

  async handlePaymentFailed(eventData) {
    const saga = await OrderSaga.findOne({ sagaId: eventData.sagaId });
    if (saga) {
      await this.handleStepFailure(saga.sagaId, new Error('Payment processing failed'));
    }
  }

  async handleShippingScheduled(eventData) {
    const saga = await OrderSaga.findOne({ sagaId: eventData.sagaId });
    if (saga && saga.currentStep === 'schedule_shipping') {
      await this.completeStep(saga.sagaId, 'schedule_shipping');
    }
  }

  async handleShippingFailed(eventData) {
    const saga = await OrderSaga.findOne({ sagaId: eventData.sagaId });
    if (saga) {
      await this.handleStepFailure(saga.sagaId, new Error('Shipping scheduling failed'));
    }
  }

  async handleShipmentCreated(eventData) {
    // Update order with shipping information
    await this.orderService.shipOrder(
      eventData.orderId,
      {
        trackingNumber: eventData.trackingNumber,
        carrier: eventData.carrier,
        estimatedDelivery: eventData.estimatedDelivery
      }
    );
  }

  async handleShipmentDelivered(eventData) {
    // Mark order as delivered
    await this.orderService.deliverOrder(eventData.orderId);
  }

  async handlePaymentRefunded(eventData) {
    logger.info('Payment refunded', {
      orderId: eventData.orderId,
      amount: eventData.amount
    });
  }
}

module.exports = SagaOrchestrator;
