const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const EventBus = require('./events/eventBus');
const MessageQueue = require('./events/messageQueue');
const OrderService = require('./services/orderService');
const SagaOrchestrator = require('./saga/sagaOrchestrator');
const CircuitBreaker = require('./utils/circuitBreaker');
const { setupTracing } = require('./utils/tracing');
const { setupMetrics } = require('./utils/metrics');

// Initialize tracing
setupTracing('order-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Setup metrics
const { httpRequestDuration, eventCounter } = setupMetrics();

// Middleware to track HTTP requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  next();
});

// Initialize services
let eventBus, messageQueue, orderService, sagaOrchestrator;

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('📊 Connected to MongoDB');
  
  // Initialize event systems
  eventBus = new EventBus(process.env.REDIS_URL);
  messageQueue = new MessageQueue(process.env.RABBITMQ_URL);
  
  await eventBus.connect();
  await messageQueue.connect();
  
  // Initialize services
  orderService = new OrderService(eventBus, messageQueue);
  sagaOrchestrator = new SagaOrchestrator(eventBus, messageQueue);
  
  // Start consuming events
  await orderService.startEventConsumers();
  await sagaOrchestrator.startSagas();
  
  console.log('🚀 Order Service initialized');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Order Schema
const Order = require('./models/Order');

// Health check
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'order-service',
      version: '1.0.0',
      dependencies: {
        mongodb: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
        redis: eventBus ? await eventBus.ping() : 'disconnected',
        rabbitmq: messageQueue ? await messageQueue.ping() : 'disconnected'
      }
    };
    
    const isHealthy = Object.values(health.dependencies)
      .every(status => status === 'healthy');
    
    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  const promClient = require('prom-client');
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Get all orders
app.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (userId) query.userId = userId;
    
    const orders = await Order.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order (with SAGA)
app.post('/orders', async (req, res) => {
  try {
    const { userId, items, shippingAddress } = req.body;
    
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'userId and items array are required' 
      });
    }
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const order = new Order({
      userId,
      items,
      shippingAddress,
      total,
      status: 'pending',
      sagaId: uuidv4()
    });
    
    await order.save();
    
    // Start SAGA for order processing
    await sagaOrchestrator.startOrderSaga({
      orderId: order._id.toString(),
      userId,
      items,
      total,
      sagaId: order.sagaId
    });
    
    // Publish order created event
    await eventBus.publish('order.created', {
      orderId: order._id.toString(),
      userId,
      items,
      total,
      timestamp: new Date().toISOString()
    });
    
    eventCounter.labels('order.created').inc();
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Publish status change event
    await eventBus.publish('order.status_changed', {
      orderId: order._id.toString(),
      status,
      previousStatus: order.status,
      timestamp: new Date().toISOString()
    });
    
    eventCounter.labels('order.status_changed').inc();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
app.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ 
        error: 'Cannot cancel order that has been shipped or delivered' 
      });
    }
    
    order.status = 'cancelled';
    order.updatedAt = new Date();
    await order.save();
    
    // Start cancellation SAGA
    await sagaOrchestrator.startCancellationSaga({
      orderId: order._id.toString(),
      userId: order.userId,
      sagaId: order.sagaId
    });
    
    // Publish cancellation event
    await eventBus.publish('order.cancelled', {
      orderId: order._id.toString(),
      userId: order.userId,
      timestamp: new Date().toISOString()
    });
    
    eventCounter.labels('order.cancelled').inc();
    
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Event endpoint for testing
app.post('/orders/:id/events', async (req, res) => {
  try {
    const { event, data } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await eventBus.publish(event, {
      orderId: order._id.toString(),
      ...data,
      timestamp: new Date().toISOString()
    });
    
    eventCounter.labels(event).inc();
    
    res.json({ message: `Event ${event} published successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  
  if (eventBus) await eventBus.disconnect();
  if (messageQueue) await messageQueue.disconnect();
  await mongoose.connection.close();
  
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Order Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
});

module.exports = app;
