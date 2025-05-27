const mongoose = require('mongoose')
const config = require('../config')
const logger = require('../utils/logger')

// Order projection schema for CQRS read model
const orderProjectionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    required: true,
    index: true
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  notes: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  createdAt: {
    type: Date,
    required: true,
    index: true
  },
  updatedAt: {
    type: Date,
    required: true
  },
  estimatedDelivery: Date,
  actualDelivery: Date
}, {
  timestamps: false,
  versionKey: false
})

// Indexes for efficient queries
orderProjectionSchema.index({ userId: 1, status: 1 })
orderProjectionSchema.index({ createdAt: -1 })
orderProjectionSchema.index({ 'items.productId': 1 })
orderProjectionSchema.index({ paymentStatus: 1, status: 1 })

// Event store schema for storing order events
const orderEventSchema = new mongoose.Schema({
  aggregateId: {
    type: String,
    required: true,
    index: true
  },
  aggregateType: {
    type: String,
    required: true,
    default: 'Order'
  },
  eventType: {
    type: String,
    required: true,
    index: true
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  eventMetadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  version: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  correlationId: String,
  causationId: String
}, {
  timestamps: false,
  versionKey: false
})

// Ensure unique version per aggregate
orderEventSchema.index({ aggregateId: 1, version: 1 }, { unique: true })
orderEventSchema.index({ eventType: 1, timestamp: 1 })

// Order aggregate snapshot schema for performance optimization
const orderSnapshotSchema = new mongoose.Schema({
  aggregateId: {
    type: String,
    required: true,
    unique: true
  },
  aggregateType: {
    type: String,
    required: true,
    default: 'Order'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: false,
  versionKey: false
})

const OrderProjection = mongoose.model('OrderProjection', orderProjectionSchema)
const OrderEvent = mongoose.model('OrderEvent', orderEventSchema)
const OrderSnapshot = mongoose.model('OrderSnapshot', orderSnapshotSchema)

// Database connection management
let connection = null

const connect = async () => {
  try {
    if (connection) {
      return connection
    }
    
    mongoose.set('strictQuery', false)
    
    connection = await mongoose.connect(config.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    })
    
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', { error: error.message })
    })
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected')
    })
    
    logger.info('MongoDB connected successfully')
    return connection
    
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error: error.message })
    throw error
  }
}

const disconnect = async () => {
  try {
    if (connection) {
      await mongoose.disconnect()
      connection = null
      logger.info('MongoDB disconnected')
    }
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', { error: error.message })
    throw error
  }
}

const isConnected = () => {
  return mongoose.connection.readyState === 1
}

module.exports = {
  connect,
  disconnect,
  isConnected,
  OrderProjection,
  OrderEvent,
  OrderSnapshot,
  mongoose
}
