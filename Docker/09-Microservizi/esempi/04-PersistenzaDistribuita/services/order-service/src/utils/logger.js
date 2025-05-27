const winston = require('winston')
const config = require('../config')

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: config.SERVICE_NAME,
      ...meta
    })
  })
)

// Create logger instance
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: customFormat,
  defaultMeta: {
    service: config.SERVICE_NAME
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

// Add file transport in production
if (config.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: customFormat
  }))
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    format: customFormat
  }))
}

module.exports = logger
