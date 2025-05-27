const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const OrderService = require('../services/OrderService');
const SagaOrchestrator = require('../services/SagaOrchestrator');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

const router = express.Router();
const orderService = new OrderService();
const sagaOrchestrator = new SagaOrchestrator();

/**
 * Validation middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Create a new order
 */
router.post('/',
  [
    body('items').isArray({ min: 1 }).withMessage('Items array is required'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.productName').notEmpty().withMessage('Product name is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
    body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be non-negative'),
    body('shippingAddress.street').notEmpty().withMessage('Shipping street is required'),
    body('shippingAddress.city').notEmpty().withMessage('Shipping city is required'),
    body('shippingAddress.postalCode').notEmpty().withMessage('Shipping postal code is required'),
    body('shippingAddress.country').notEmpty().withMessage('Shipping country is required'),
    body('paymentMethod.type').isIn(['credit_card', 'paypal', 'bank_transfer']).withMessage('Invalid payment method'),
    handleValidationErrors
  ],
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'User ID required in headers' });
      }

      const correlationId = req.headers['x-correlation-id'] || req.headers['x-request-id'];
      
      // Create order
      const result = await orderService.createOrder(req.body, userId, correlationId);
      
      // Start saga for order processing
      const sagaId = await sagaOrchestrator.startOrderSaga(result.orderId, correlationId);
      
      metrics.httpRequestDuration.observe(
        { method: 'POST', route: '/orders', status_code: '201' },
        (Date.now() - startTime) / 1000
      );

      res.status(201).json({
        ...result,
        sagaId,
        correlationId
      });
    } catch (error) {
      metrics.httpRequestDuration.observe(
        { method: 'POST', route: '/orders', status_code: '500' },
        (Date.now() - startTime) / 1000
      );
      
      logger.error('Error creating order', { error: error.message, body: req.body });
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get order by ID
 */
router.get('/:orderId',
  [
    param('orderId').isUUID().withMessage('Valid order ID is required'),
    handleValidationErrors
  ],
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const order = await orderService.getOrderById(req.params.orderId);
      
      metrics.httpRequestDuration.observe(
        { method: 'GET', route: '/orders/:id', status_code: '200' },
        (Date.now() - startTime) / 1000
      );

      res.json(order);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      metrics.httpRequestDuration.observe(
        { method: 'GET', route: '/orders/:id', status_code: statusCode.toString() },
        (Date.now() - startTime) / 1000
      );
      
      logger.error('Error getting order', { orderId: req.params.orderId, error: error.message });
      res.status(statusCode).json({ error: error.message });
    }
  }
);

/**
 * Get user orders
 */
router.get('/user/:userId',
  [
    param('userId').notEmpty().withMessage('User ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await orderService.getUserOrders(req.params.userId, page, limit);
      
      metrics.httpRequestDuration.observe(
        { method: 'GET', route: '/orders/user/:id', status_code: '200' },
        (Date.now() - startTime) / 1000
      );

      res.json(result);
    } catch (error) {
      metrics.httpRequestDuration.observe(
        { method: 'GET', route: '/orders/user/:id', status_code: '500' },
        (Date.now() - startTime) / 1000
      );
      
      logger.error('Error getting user orders', { userId: req.params.userId, error: error.message });
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Confirm order (manual confirmation)
 */
router.post('/:orderId/confirm',
  [
    param('orderId').isUUID().withMessage('Valid order ID is required'),
    handleValidationErrors
  ],
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const correlationId = req.headers['x-correlation-id'] || req.headers['x-request-id'];
      
      const result = await orderService.confirmOrder(req.params.orderId, correlationId);
      
      metrics.httpRequestDuration.observe(
        { method: 'POST', route: '/orders/:id/confirm', status_code: '200' },
        (Date.now() - startTime) / 1000
      );

      res.json(result);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      
      metrics.httpRequestDuration.observe(
        { method: 'POST', route: '/orders/:id/confirm', status_code: statusCode.toString() },
        (Date.now() - startTime) / 1000
      );
      
      logger.error('Error confirming order', { orderId: req.params.orderId, error: error.message });
      res.status(statusCode).json({ error: error.message });
    }
  }
);

/**
 * Cancel order
 */
router.post('/:orderId/cancel',
  [
    param('orderId').isUUID().withMessage('Valid order ID is required'),
    body('reason').notEmpty().withMessage('Cancellation reason is required'),
    handleValidationErrors
  ],
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const correlationId = req.headers['x-correlation-id'] || req.headers['x-request-id'];
      
      const result = await orderService.cancelOrder(
        req.params.orderId, 
        req.body.reason, 
        correlationId
      );
      
      metrics.httpRequestDuration.observe(
        { method: 'POST', route: '/orders/:id/cancel', status_code: '200' },
        (Date.now() - startTime) / 1000
      );

      res.json(result);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      
      metrics.httpRequestDuration.observe(
        { method: 'POST', route: '/orders/:id/cancel', status_code: statusCode.toString() },
        (Date.now() - startTime) / 1000
      );
      
      logger.error('Error cancelling order', { orderId: req.params.orderId, error: error.message });
      res.status(statusCode).json({ error: error.message });
    }
  }
);

/**
 * Ship order
 */
router.post('/:orderId/ship',
  [
    param('orderId').isUUID().withMessage('Valid order ID is required'),
    body('trackingNumber').notEmpty().withMessage('Tracking number is required'),
    body('carrier').notEmpty().withMessage('Carrier is required'),
    body('estimatedDelivery').optional().isISO8601().withMessage('Invalid estimated delivery date'),
    handleValidationErrors
  ],
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const correlationId = req.headers['x-correlation-id'] || req.headers['x-request-id'];
      
      const result = await orderService.shipOrder(
        req.params.orderId, 
        req.body, 
        correlationId
      );
      
      metrics.httpRequestDuration.observe(
        { method: 'POST', route: '/orders/:id/ship', status_code: '200' },
        (Date.now() - startTime) / 1000
      );

      res.json(result);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      
      metrics.httpRequestDuration.observe(
        { method: 'POST', route: '/orders/:id/ship', status_code: statusCode.toString() },
        (Date.now() - startTime) / 1000
      );
      
      logger.error('Error shipping order', { orderId: req.params.orderId, error: error.message });
      res.status(statusCode).json({ error: error.message });
    }
  }
);

/**
 * Mark order as delivered
 */
router.post('/:orderId/deliver',
  [
    param('orderId').isUUID().withMessage('Valid order ID is required'),
    handleValidationErrors
  ],
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const correlationId = req.headers['x-correlation-id'] || req.headers['x-request-id'];
      
      const result = await orderService.deliverOrder(req.params.orderId, correlationId);
      
      metrics.httpRequestDuration.observe(
        { method: 'POST', route: '/orders/:id/deliver', status_code: '200' },
        (Date.now() - startTime) / 1000
      );

      res.json(result);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      
      metrics.httpRequestDuration.observe(
        { method: 'POST', route: '/orders/:id/deliver', status_code: statusCode.toString() },
        (Date.now() - startTime) / 1000
      );
      
      logger.error('Error delivering order', { orderId: req.params.orderId, error: error.message });
      res.status(statusCode).json({ error: error.message });
    }
  }
);

/**
 * Get order history (events)
 */
router.get('/:orderId/history',
  [
    param('orderId').isUUID().withMessage('Valid order ID is required'),
    handleValidationErrors
  ],
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const history = await orderService.getOrderHistory(req.params.orderId);
      
      metrics.httpRequestDuration.observe(
        { method: 'GET', route: '/orders/:id/history', status_code: '200' },
        (Date.now() - startTime) / 1000
      );

      res.json({ events: history });
    } catch (error) {
      metrics.httpRequestDuration.observe(
        { method: 'GET', route: '/orders/:id/history', status_code: '500' },
        (Date.now() - startTime) / 1000
      );
      
      logger.error('Error getting order history', { orderId: req.params.orderId, error: error.message });
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get orders by status
 */
router.get('/status/:status',
  [
    param('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const projectionService = orderService.projectionService;
      const result = await projectionService.getOrdersByStatus(req.params.status, page, limit);
      
      metrics.httpRequestDuration.observe(
        { method: 'GET', route: '/orders/status/:status', status_code: '200' },
        (Date.now() - startTime) / 1000
      );

      res.json(result);
    } catch (error) {
      metrics.httpRequestDuration.observe(
        { method: 'GET', route: '/orders/status/:status', status_code: '500' },
        (Date.now() - startTime) / 1000
      );
      
      logger.error('Error getting orders by status', { status: req.params.status, error: error.message });
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get order statistics
 */
router.get('/admin/statistics',
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const projectionService = orderService.projectionService;
      const stats = await projectionService.getOrderStatistics();
      
      metrics.httpRequestDuration.observe(
        { method: 'GET', route: '/orders/admin/statistics', status_code: '200' },
        (Date.now() - startTime) / 1000
      );

      res.json(stats);
    } catch (error) {
      metrics.httpRequestDuration.observe(
        { method: 'GET', route: '/orders/admin/statistics', status_code: '500' },
        (Date.now() - startTime) / 1000
      );
      
      logger.error('Error getting order statistics', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
