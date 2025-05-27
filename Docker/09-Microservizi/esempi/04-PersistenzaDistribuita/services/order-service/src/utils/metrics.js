const client = require('prom-client')
const config = require('../config')

// Create a Registry
const register = new client.Registry()

// Add default metrics
client.collectDefaultMetrics({
  register,
  prefix: 'order_service_'
})

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'order_service_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status_code', 'route'],
  registers: [register]
})

const httpRequestDuration = new client.Histogram({
  name: 'order_service_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'status_code', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
})

const ordersTotal = new client.Counter({
  name: 'order_service_orders_total',
  help: 'Total number of orders',
  labelNames: ['status'],
  registers: [register]
})

const orderProcessingDuration = new client.Histogram({
  name: 'order_service_processing_duration_seconds',
  help: 'Duration of order processing in seconds',
  labelNames: ['operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register]
})

const eventsTotal = new client.Counter({
  name: 'order_service_events_total',
  help: 'Total number of events processed',
  labelNames: ['event_type', 'status'],
  registers: [register]
})

const mongodbOperations = new client.Counter({
  name: 'order_service_mongodb_operations_total',
  help: 'Total number of MongoDB operations',
  labelNames: ['operation', 'collection', 'status'],
  registers: [register]
})

const kafkaMessagesProduced = new client.Counter({
  name: 'order_service_kafka_messages_produced_total',
  help: 'Total number of Kafka messages produced',
  labelNames: ['topic', 'status'],
  registers: [register]
})

const kafkaMessagesConsumed = new client.Counter({
  name: 'order_service_kafka_messages_consumed_total',
  help: 'Total number of Kafka messages consumed',
  labelNames: ['topic', 'status'],
  registers: [register]
})

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  ordersTotal,
  orderProcessingDuration,
  eventsTotal,
  mongodbOperations,
  kafkaMessagesProduced,
  kafkaMessagesConsumed
}
