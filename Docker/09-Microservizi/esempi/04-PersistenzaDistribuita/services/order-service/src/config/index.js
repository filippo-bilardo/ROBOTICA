require('dotenv').config()

module.exports = {
  // Server settings
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB settings
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://mongodb:27017/microservices_db',
  
  // EventStore settings
  EVENTSTORE_HOST: process.env.EVENTSTORE_HOST || 'eventstore',
  EVENTSTORE_PORT: process.env.EVENTSTORE_PORT || 1113,
  EVENTSTORE_USER: process.env.EVENTSTORE_USER || 'admin',
  EVENTSTORE_PASSWORD: process.env.EVENTSTORE_PASSWORD || 'changeit',
  
  // Redis settings
  REDIS_HOST: process.env.REDIS_HOST || 'redis',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || null,
  
  // Kafka settings
  KAFKA_BROKERS: process.env.KAFKA_BROKERS?.split(',') || ['kafka:9092'],
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || 'order-service',
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || 'order-service-group',
  KAFKA_TOPIC_PREFIX: process.env.KAFKA_TOPIC_PREFIX || 'microservices',
  
  // Monitoring settings
  JAEGER_ENDPOINT: process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces',
  JAEGER_SAMPLER_TYPE: process.env.JAEGER_SAMPLER_TYPE || 'const',
  JAEGER_SAMPLER_PARAM: parseFloat(process.env.JAEGER_SAMPLER_PARAM) || 1,
  
  // Service settings
  SERVICE_NAME: process.env.SERVICE_NAME || 'order-service',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Business settings
  ORDER_TIMEOUT_MINUTES: parseInt(process.env.ORDER_TIMEOUT_MINUTES) || 30,
  MAX_ORDER_ITEMS: parseInt(process.env.MAX_ORDER_ITEMS) || 50,
  
  // Security settings
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
}
