const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const { promisify } = require('util')

const config = require('./config')
const logger = require('./utils/logger')
const metrics = require('./utils/metrics')
const tracer = require('./utils/tracer')
const database = require('./database')

// Services
const KafkaConsumer = require('./services/KafkaConsumer')
const KafkaPublisher = require('./services/KafkaPublisher')

// Route imports
const orderRoutes = require('./routes/orders')
const healthRoutes = require('./routes/health')
const metricsRoutes = require('./routes/metrics')

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging and metrics
app.use((req, res, next) => {
  const start = Date.now()
  
  // Add tracing
  const span = tracer.startSpan(`${req.method} ${req.path}`)
  span.setTag('http.method', req.method)
  span.setTag('http.url', req.originalUrl)
  span.setTag('user.agent', req.get('User-Agent'))
  
  req.span = span
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    // Update metrics
    metrics.httpRequestsTotal.inc({
      method: req.method,
      status_code: res.statusCode,
      route: req.route?.path || req.path
    })
    
    metrics.httpRequestDuration.observe(
      {
        method: req.method,
        status_code: res.statusCode,
        route: req.route?.path || req.path
      },
      duration / 1000
    )
    
    // Update span
    span.setTag('http.status_code', res.statusCode)
    span.finish()
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    })
  })
  
  next()
})

// Routes
app.use('/health', healthRoutes)
app.use('/metrics', metricsRoutes)
app.use('/api/orders', orderRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  })
})

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  })
  
  if (req.span) {
    req.span.setTag('error', true)
    req.span.log({ 'error.message': err.message })
    req.span.finish()
  }
  
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString(),
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  })
})

async function startServer() {
  try {
    logger.info('Starting Order Service...')
    
    // Initialize database connections
    await database.connect()
    logger.info('MongoDB connected')
    
    await eventStore.connect()
    logger.info('EventStore connected')
    
    await redis.connect()
    logger.info('Redis connected')
    
    // Initialize Kafka
    await kafka.connect()
    logger.info('Kafka connected')
    
    // Start projection service
    const projectionService = require('./services/projectionService')
    await projectionService.start()
    logger.info('Projection service started')
    
    // Start HTTP server
    const server = app.listen(config.PORT, () => {
      logger.info(`Order Service listening on port ${config.PORT}`)
    })
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully')
      
      server.close(async () => {
        try {
          await projectionService.stop()
          await kafka.disconnect()
          await redis.disconnect()
          await eventStore.disconnect()
          await database.disconnect()
          
          logger.info('Server shut down successfully')
          process.exit(0)
        } catch (error) {
          logger.error('Error during shutdown', { error: error.message })
          process.exit(1)
        }
      })
    })
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully')
      
      server.close(async () => {
        try {
          await projectionService.stop()
          await kafka.disconnect()
          await redis.disconnect()
          await eventStore.disconnect()
          await database.disconnect()
          
          logger.info('Server shut down successfully')
          process.exit(0)
        } catch (error) {
          logger.error('Error during shutdown', { error: error.message })
          process.exit(1)
        }
      })
    })
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', {
        reason: reason,
        promise: promise
      })
    })
    
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      })
      process.exit(1)
    })
    
  } catch (error) {
    logger.error('Failed to start server', { error: error.message })
    process.exit(1)
  }
}

if (require.main === module) {
  startServer()
}

module.exports = app
