// MongoDB Initialization Script for Order Service
// Implements Event Sourcing with CQRS pattern

// Switch to orders database
db = db.getSiblingDB('orders_db');

// Create application user
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    { role: 'readWrite', db: 'orders_db' },
    { role: 'dbAdmin', db: 'orders_db' }
  ]
});

// ============================================================================
// EVENT STORE COLLECTIONS
// ============================================================================

// Event store collection for all order events
db.createCollection('event_store', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['eventId', 'aggregateId', 'aggregateType', 'eventType', 'eventData', 'version', 'timestamp'],
      properties: {
        eventId: { bsonType: 'string', description: 'Unique event identifier' },
        aggregateId: { bsonType: 'string', description: 'Aggregate root identifier' },
        aggregateType: { bsonType: 'string', enum: ['Order', 'Cart', 'Inventory'] },
        eventType: { bsonType: 'string', description: 'Type of event' },
        eventData: { bsonType: 'object', description: 'Event payload' },
        metadata: { bsonType: 'object', description: 'Event metadata' },
        version: { bsonType: 'int', minimum: 1, description: 'Aggregate version' },
        position: { bsonType: 'long', description: 'Global event position' },
        timestamp: { bsonType: 'date', description: 'Event timestamp' },
        correlationId: { bsonType: 'string', description: 'Correlation identifier' },
        causationId: { bsonType: 'string', description: 'Causation identifier' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});

// Create indexes for event store
db.event_store.createIndex({ 'eventId': 1 }, { unique: true });
db.event_store.createIndex({ 'aggregateId': 1, 'version': 1 }, { unique: true });
db.event_store.createIndex({ 'aggregateId': 1, 'timestamp': 1 });
db.event_store.createIndex({ 'eventType': 1, 'timestamp': 1 });
db.event_store.createIndex({ 'position': 1 }, { unique: true });
db.event_store.createIndex({ 'correlationId': 1 });
db.event_store.createIndex({ 'timestamp': 1 });

// Snapshots collection for performance optimization
db.createCollection('snapshots', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['aggregateId', 'aggregateType', 'snapshotData', 'version', 'timestamp'],
      properties: {
        aggregateId: { bsonType: 'string' },
        aggregateType: { bsonType: 'string', enum: ['Order', 'Cart', 'Inventory'] },
        snapshotData: { bsonType: 'object' },
        version: { bsonType: 'int', minimum: 1 },
        timestamp: { bsonType: 'date' }
      }
    }
  }
});

db.snapshots.createIndex({ 'aggregateId': 1, 'version': -1 });
db.snapshots.createIndex({ 'timestamp': 1 });

// ============================================================================
// CQRS READ MODEL COLLECTIONS
// ============================================================================

// Order projections - optimized for queries
db.createCollection('order_projections', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['orderId', 'userId', 'status', 'createdAt'],
      properties: {
        orderId: { bsonType: 'string' },
        userId: { bsonType: 'string' },
        customerInfo: {
          bsonType: 'object',
          properties: {
            name: { bsonType: 'string' },
            email: { bsonType: 'string' },
            phone: { bsonType: 'string' }
          }
        },
        items: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['productId', 'name', 'price', 'quantity'],
            properties: {
              productId: { bsonType: 'string' },
              name: { bsonType: 'string' },
              price: { bsonType: 'decimal' },
              quantity: { bsonType: 'int', minimum: 1 },
              variant: { bsonType: 'object' }
            }
          }
        },
        summary: {
          bsonType: 'object',
          required: ['itemCount', 'subtotal', 'tax', 'total'],
          properties: {
            itemCount: { bsonType: 'int' },
            subtotal: { bsonType: 'decimal' },
            discountAmount: { bsonType: 'decimal' },
            taxAmount: { bsonType: 'decimal' },
            shippingCost: { bsonType: 'decimal' },
            total: { bsonType: 'decimal' }
          }
        },
        shippingAddress: {
          bsonType: 'object',
          properties: {
            street: { bsonType: 'string' },
            city: { bsonType: 'string' },
            state: { bsonType: 'string' },
            zipCode: { bsonType: 'string' },
            country: { bsonType: 'string' }
          }
        },
        paymentInfo: {
          bsonType: 'object',
          properties: {
            method: { bsonType: 'string' },
            transactionId: { bsonType: 'string' },
            status: { bsonType: 'string' }
          }
        },
        timeline: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['status', 'timestamp'],
            properties: {
              status: { bsonType: 'string' },
              timestamp: { bsonType: 'date' },
              note: { bsonType: 'string' },
              actor: { bsonType: 'string' }
            }
          }
        },
        status: { 
          bsonType: 'string', 
          enum: ['draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] 
        },
        estimatedDelivery: { bsonType: 'date' },
        trackingNumber: { bsonType: 'string' },
        tags: { bsonType: 'array', items: { bsonType: 'string' } },
        metadata: { bsonType: 'object' },
        version: { bsonType: 'int' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Indexes for order projections
db.order_projections.createIndex({ 'orderId': 1 }, { unique: true });
db.order_projections.createIndex({ 'userId': 1, 'createdAt': -1 });
db.order_projections.createIndex({ 'status': 1, 'createdAt': -1 });
db.order_projections.createIndex({ 'customerInfo.email': 1 });
db.order_projections.createIndex({ 'createdAt': -1 });
db.order_projections.createIndex({ 'summary.total': 1 });
db.order_projections.createIndex({ 'tags': 1 });

// Order analytics - aggregated data for reporting
db.createCollection('order_analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['date', 'period', 'metrics'],
      properties: {
        date: { bsonType: 'date' },
        period: { bsonType: 'string', enum: ['hourly', 'daily', 'weekly', 'monthly'] },
        metrics: {
          bsonType: 'object',
          properties: {
            totalOrders: { bsonType: 'int' },
            totalRevenue: { bsonType: 'decimal' },
            averageOrderValue: { bsonType: 'decimal' },
            uniqueCustomers: { bsonType: 'int' },
            statusBreakdown: { bsonType: 'object' },
            topProducts: { bsonType: 'array' },
            conversionRate: { bsonType: 'decimal' }
          }
        },
        dimensions: {
          bsonType: 'object',
          properties: {
            region: { bsonType: 'string' },
            channel: { bsonType: 'string' },
            category: { bsonType: 'string' }
          }
        }
      }
    }
  }
});

db.order_analytics.createIndex({ 'date': 1, 'period': 1 });
db.order_analytics.createIndex({ 'period': 1, 'date': -1 });

// Shopping carts collection
db.createCollection('carts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['cartId', 'userId', 'items', 'createdAt'],
      properties: {
        cartId: { bsonType: 'string' },
        userId: { bsonType: 'string' },
        sessionId: { bsonType: 'string' },
        items: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['productId', 'quantity', 'addedAt'],
            properties: {
              productId: { bsonType: 'string' },
              name: { bsonType: 'string' },
              price: { bsonType: 'decimal' },
              quantity: { bsonType: 'int', minimum: 1 },
              variant: { bsonType: 'object' },
              addedAt: { bsonType: 'date' }
            }
          }
        },
        summary: {
          bsonType: 'object',
          properties: {
            itemCount: { bsonType: 'int' },
            subtotal: { bsonType: 'decimal' }
          }
        },
        status: { bsonType: 'string', enum: ['active', 'abandoned', 'converted'] },
        expiresAt: { bsonType: 'date' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.carts.createIndex({ 'cartId': 1 }, { unique: true });
db.carts.createIndex({ 'userId': 1, 'status': 1 });
db.carts.createIndex({ 'sessionId': 1 });
db.carts.createIndex({ 'expiresAt': 1 });
db.carts.createIndex({ 'updatedAt': 1 });

// ============================================================================
// PROJECTION STATE TRACKING
// ============================================================================

// Track projection state for event replay
db.createCollection('projection_state', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['projectionName', 'lastProcessedPosition'],
      properties: {
        projectionName: { bsonType: 'string' },
        lastProcessedPosition: { bsonType: 'long' },
        lastProcessedEventId: { bsonType: 'string' },
        lastProcessedAt: { bsonType: 'date' },
        status: { bsonType: 'string', enum: ['running', 'stopped', 'error'] },
        errorCount: { bsonType: 'int' },
        lastError: { bsonType: 'string' }
      }
    }
  }
});

db.projection_state.createIndex({ 'projectionName': 1 }, { unique: true });

// ============================================================================
// AGGREGATE ROOT COLLECTIONS
// ============================================================================

// Order aggregates for command processing
db.createCollection('order_aggregates', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['aggregateId', 'aggregateType', 'version', 'state'],
      properties: {
        aggregateId: { bsonType: 'string' },
        aggregateType: { bsonType: 'string', enum: ['Order'] },
        version: { bsonType: 'int', minimum: 0 },
        state: { bsonType: 'object' },
        lastEventId: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.order_aggregates.createIndex({ 'aggregateId': 1 }, { unique: true });
db.order_aggregates.createIndex({ 'updatedAt': 1 });

// ============================================================================
// SAMPLE DATA
// ============================================================================

// Insert sample events
const sampleOrderId = 'order-' + new Date().getTime();
const sampleUserId = 'user-123';

// Order created event
db.event_store.insertOne({
  eventId: 'evt-' + new Date().getTime() + '-1',
  aggregateId: sampleOrderId,
  aggregateType: 'Order',
  eventType: 'OrderCreated',
  eventData: {
    orderId: sampleOrderId,
    userId: sampleUserId,
    items: [
      {
        productId: 'prod-laptop-001',
        name: 'Gaming Laptop',
        price: NumberDecimal('1299.99'),
        quantity: 1
      },
      {
        productId: 'prod-mouse-001',
        name: 'Wireless Mouse',
        price: NumberDecimal('49.99'),
        quantity: 2
      }
    ],
    total: NumberDecimal('1399.97')
  },
  metadata: {
    source: 'order-service',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.100'
  },
  version: 1,
  position: NumberLong(1),
  timestamp: new Date(),
  correlationId: 'corr-' + new Date().getTime(),
  causationId: null
});

// Order confirmed event
db.event_store.insertOne({
  eventId: 'evt-' + new Date().getTime() + '-2',
  aggregateId: sampleOrderId,
  aggregateType: 'Order',
  eventType: 'OrderConfirmed',
  eventData: {
    orderId: sampleOrderId,
    confirmedAt: new Date(),
    paymentMethod: 'credit_card'
  },
  metadata: {
    source: 'payment-service',
    transactionId: 'txn-123456'
  },
  version: 2,
  position: NumberLong(2),
  timestamp: new Date(),
  correlationId: 'corr-' + new Date().getTime(),
  causationId: 'evt-' + new Date().getTime() + '-1'
});

// Insert sample order projection
db.order_projections.insertOne({
  orderId: sampleOrderId,
  userId: sampleUserId,
  customerInfo: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123'
  },
  items: [
    {
      productId: 'prod-laptop-001',
      name: 'Gaming Laptop',
      price: NumberDecimal('1299.99'),
      quantity: 1,
      variant: { color: 'black', storage: '1TB' }
    },
    {
      productId: 'prod-mouse-001',
      name: 'Wireless Mouse',
      price: NumberDecimal('49.99'),
      quantity: 2,
      variant: { color: 'white' }
    }
  ],
  summary: {
    itemCount: 3,
    subtotal: NumberDecimal('1399.97'),
    discountAmount: NumberDecimal('0.00'),
    taxAmount: NumberDecimal('112.00'),
    shippingCost: NumberDecimal('15.00'),
    total: NumberDecimal('1526.97')
  },
  shippingAddress: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA'
  },
  paymentInfo: {
    method: 'credit_card',
    transactionId: 'txn-123456',
    status: 'paid'
  },
  timeline: [
    {
      status: 'created',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      note: 'Order created',
      actor: 'customer'
    },
    {
      status: 'confirmed',
      timestamp: new Date(),
      note: 'Payment confirmed',
      actor: 'system'
    }
  ],
  status: 'confirmed',
  estimatedDelivery: new Date(Date.now() + 7 * 24 * 3600000), // 7 days from now
  tags: ['electronics', 'gaming'],
  metadata: {
    channel: 'web',
    source: 'direct'
  },
  version: 2,
  createdAt: new Date(Date.now() - 3600000),
  updatedAt: new Date()
});

// Insert sample cart
db.carts.insertOne({
  cartId: 'cart-' + new Date().getTime(),
  userId: 'user-456',
  items: [
    {
      productId: 'prod-keyboard-001',
      name: 'Mechanical Keyboard',
      price: NumberDecimal('129.99'),
      quantity: 1,
      variant: { switches: 'blue', layout: 'full' },
      addedAt: new Date()
    }
  ],
  summary: {
    itemCount: 1,
    subtotal: NumberDecimal('129.99')
  },
  status: 'active',
  expiresAt: new Date(Date.now() + 7 * 24 * 3600000), // 7 days
  createdAt: new Date(),
  updatedAt: new Date()
});

// Insert projection state
db.projection_state.insertMany([
  {
    projectionName: 'order-projection',
    lastProcessedPosition: NumberLong(2),
    lastProcessedEventId: 'evt-' + new Date().getTime() + '-2',
    lastProcessedAt: new Date(),
    status: 'running',
    errorCount: 0
  },
  {
    projectionName: 'analytics-projection',
    lastProcessedPosition: NumberLong(2),
    lastProcessedEventId: 'evt-' + new Date().getTime() + '-2',
    lastProcessedAt: new Date(),
    status: 'running',
    errorCount: 0
  }
]);

// Insert sample analytics data
db.order_analytics.insertOne({
  date: new Date(),
  period: 'daily',
  metrics: {
    totalOrders: 15,
    totalRevenue: NumberDecimal('12450.00'),
    averageOrderValue: NumberDecimal('830.00'),
    uniqueCustomers: 12,
    statusBreakdown: {
      confirmed: 8,
      processing: 4,
      shipped: 2,
      delivered: 1
    },
    topProducts: [
      { productId: 'prod-laptop-001', sales: 5 },
      { productId: 'prod-mouse-001', sales: 8 }
    ],
    conversionRate: NumberDecimal('0.75')
  },
  dimensions: {
    region: 'US-West',
    channel: 'web'
  }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Function to get next global position
db.system.js.save({
  _id: 'getNextPosition',
  value: function() {
    var result = db.event_store.findOne({}, { position: 1 }, { sort: { position: -1 } });
    return result ? result.position + 1 : 1;
  }
});

// Function to rebuild projection from events
db.system.js.save({
  _id: 'rebuildOrderProjection',
  value: function(orderId) {
    var events = db.event_store.find({ aggregateId: orderId }).sort({ version: 1 });
    var projection = null;
    
    events.forEach(function(event) {
      if (event.eventType === 'OrderCreated') {
        projection = {
          orderId: event.eventData.orderId,
          userId: event.eventData.userId,
          items: event.eventData.items,
          status: 'created',
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          version: event.version
        };
      } else if (event.eventType === 'OrderConfirmed') {
        if (projection) {
          projection.status = 'confirmed';
          projection.paymentInfo = { method: event.eventData.paymentMethod };
          projection.updatedAt = event.timestamp;
          projection.version = event.version;
        }
      }
      // Add more event types as needed
    });
    
    if (projection) {
      db.order_projections.replaceOne(
        { orderId: orderId },
        projection,
        { upsert: true }
      );
    }
    
    return projection;
  }
});

print('MongoDB initialization completed successfully');
print('Collections created: event_store, snapshots, order_projections, order_analytics, carts, projection_state, order_aggregates');
print('Sample data inserted for testing');
print('Utility functions created for projection management');
