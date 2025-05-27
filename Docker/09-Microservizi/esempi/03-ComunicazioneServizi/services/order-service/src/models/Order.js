const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  sagaId: {
    type: String,
    required: true,
    index: true
  },
  events: [{
    type: {
      type: String,
      required: true
    },
    data: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ sagaId: 1 });

// Methods
orderSchema.methods.addEvent = function(eventType, eventData) {
  this.events.push({
    type: eventType,
    data: eventData,
    timestamp: new Date()
  });
  return this.save();
};

orderSchema.methods.canBeCancelled = function() {
  return !['shipped', 'delivered', 'cancelled'].includes(this.status);
};

orderSchema.methods.updateStatus = function(newStatus) {
  const previousStatus = this.status;
  this.status = newStatus;
  this.updatedAt = new Date();
  
  return this.addEvent('status_changed', {
    from: previousStatus,
    to: newStatus
  });
};

module.exports = mongoose.model('Order', orderSchema);
