const express = require('express')
const database = require('../database')
const redis = require('../redis')
const eventStore = require('../eventstore')
const kafka = require('../kafka')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      service: 'order-service',
      timestamp: new Date().toISOString(),
      version: require('../../package.json').version,
      uptime: process.uptime(),
      dependencies: {}
    }
    
    // Check MongoDB
    try {
      health.dependencies.mongodb = {
        status: database.isConnected() ? 'healthy' : 'unhealthy',
        responseTime: 0
      }
    } catch (error) {
      health.dependencies.mongodb = {
        status: 'unhealthy',
        error: error.message
      }
    }
    
    // Check Redis
    try {
      const start = Date.now()
      await redis.ping()
      health.dependencies.redis = {
        status: 'healthy',
        responseTime: Date.now() - start
      }
    } catch (error) {
      health.dependencies.redis = {
        status: 'unhealthy',
        error: error.message
      }
    }
    
    // Check EventStore
    try {
      health.dependencies.eventstore = {
        status: eventStore.isConnected() ? 'healthy' : 'unhealthy'
      }
    } catch (error) {
      health.dependencies.eventstore = {
        status: 'unhealthy',
        error: error.message
      }
    }
    
    // Check Kafka
    try {
      health.dependencies.kafka = {
        status: kafka.isConnected() ? 'healthy' : 'unhealthy'
      }
    } catch (error) {
      health.dependencies.kafka = {
        status: 'unhealthy',
        error: error.message
      }
    }
    
    // Determine overall status
    const allHealthy = Object.values(health.dependencies).every(dep => dep.status === 'healthy')
    health.status = allHealthy ? 'healthy' : 'degraded'
    
    const statusCode = allHealthy ? 200 : 503
    res.status(statusCode).json(health)
    
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'order-service',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

router.get('/ready', async (req, res) => {
  try {
    // Check if all critical dependencies are available
    const isReady = database.isConnected() && eventStore.isConnected()
    
    if (isReady) {
      res.status(200).json({
        status: 'ready',
        service: 'order-service',
        timestamp: new Date().toISOString()
      })
    } else {
      res.status(503).json({
        status: 'not ready',
        service: 'order-service',
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'order-service',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    service: 'order-service',
    timestamp: new Date().toISOString()
  })
})

module.exports = router
