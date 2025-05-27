const mongoose = require('mongoose');

// Event schema for Event Sourcing
const eventSchema = new mongoose.Schema({
  streamId: { type: String, required: true, index: true },
  eventType: { type: String, required: true },
  eventData: { type: mongoose.Schema.Types.Mixed, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  version: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  correlationId: { type: String },
  causationId: { type: String }
}, {
  collection: 'events'
});

// Compound index for stream ordering
eventSchema.index({ streamId: 1, version: 1 }, { unique: true });
eventSchema.index({ eventType: 1, timestamp: 1 });
eventSchema.index({ correlationId: 1 });

// Order projection schema for CQRS read model
const orderProjectionSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed']
  },
  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'EUR' },
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  billingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentMethod: {
    type: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer'] },
    details: mongoose.Schema.Types.Mixed
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  version: { type: Number, required: true, default: 1 }
}, {
  collection: 'order_projections'
});

orderProjectionSchema.index({ userId: 1, createdAt: -1 });
orderProjectionSchema.index({ status: 1, updatedAt: -1 });
orderProjectionSchema.index({ 'items.productId': 1 });

// Order saga state schema for distributed transactions
const orderSagaSchema = new mongoose.Schema({
  sagaId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  currentStep: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['started', 'in_progress', 'completed', 'compensating', 'compensated', 'failed']
  },
  steps: [{
    stepName: { type: String, required: true },
    status: { 
      type: String, 
      required: true,
      enum: ['pending', 'started', 'completed', 'failed', 'compensated']
    },
    startedAt: Date,
    completedAt: Date,
    retryCount: { type: Number, default: 0 },
    lastError: String
  }],
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'order_sagas'
});

orderSagaSchema.index({ status: 1, updatedAt: 1 });
orderSagaSchema.index({ orderId: 1 });

// Snapshot schema for performance optimization
const snapshotSchema = new mongoose.Schema({
  streamId: { type: String, required: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  version: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  collection: 'snapshots'
});

snapshotSchema.index({ streamId: 1, version: -1 });

const Event = mongoose.model('Event', eventSchema);
const OrderProjection = mongoose.model('OrderProjection', orderProjectionSchema);
const OrderSaga = mongoose.model('OrderSaga', orderSagaSchema);
const Snapshot = mongoose.model('Snapshot', snapshotSchema);

module.exports = {
  Event,
  OrderProjection,
  OrderSaga,
  Snapshot
};
