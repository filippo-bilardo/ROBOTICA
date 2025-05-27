/**
 * E-Learning Platform - Backend App Template
 * Functional Programming Implementation
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Functional utilities
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);
const curry = (fn) => (...args) => args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args));

// Configuration
const config = require('./config/database');
const logger = require('./config/logger');

// Middleware factories
const createCorsMiddleware = () => cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
});

const createRateLimitMiddleware = () => rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

const createLoggingMiddleware = () => morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
});

// Error handling middleware
const errorHandler = (error, req, res, next) => {
  logger.error('Error occurred:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Route modules
const authRoutes = require('./interfaces/http/routes/auth');
const userRoutes = require('./interfaces/http/routes/users');
const courseRoutes = require('./interfaces/http/routes/courses');
const lessonRoutes = require('./interfaces/http/routes/lessons');
const enrollmentRoutes = require('./interfaces/http/routes/enrollments');
const progressRoutes = require('./interfaces/http/routes/progress');

// Application factory
const createApp = () => {
  const app = express();

  // Basic middleware
  app.use(helmet());
  app.use(compression());
  app.use(createCorsMiddleware());
  app.use(createRateLimitMiddleware());
  app.use(createLoggingMiddleware());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/enrollments', enrollmentRoutes);
  app.use('/api/progress', progressRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      path: req.originalUrl
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};

// Server startup
const startServer = async (port = process.env.PORT || 3000) => {
  try {
    const app = createApp();
    
    const server = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`Health check: http://localhost:${port}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

module.exports = {
  createApp,
  startServer
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}
