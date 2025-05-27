// MongoDB initialization script for microservices
// Creates databases and collections with proper indexes

// Switch to admin database
use admin

// Create application user
db.createUser({
  user: "app_user",
  pwd: "app_password",
  roles: [
    { role: "readWrite", db: "orders" },
    { role: "readWrite", db: "inventory" }
  ]
})

// Initialize orders database
use orders

// Create collections with validation
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "items", "status", "createdAt"],
      properties: {
        userId: {
          bsonType: "string",
          description: "User ID must be a string and is required"
        },
        items: {
          bsonType: "array",
          description: "Items must be an array and is required",
          items: {
            bsonType: "object",
            required: ["productId", "quantity", "price"],
            properties: {
              productId: { bsonType: "string" },
              quantity: { bsonType: "int", minimum: 1 },
              price: { bsonType: "double", minimum: 0 }
            }
          }
        },
        status: {
          enum: ["pending", "confirmed", "cancelled", "completed"],
          description: "Status must be one of the enum values"
        },
        totalAmount: {
          bsonType: "double",
          minimum: 0
        },
        paymentId: {
          bsonType: "string"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
})

// Create indexes for performance
db.orders.createIndex({ "userId": 1 })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "createdAt": -1 })
db.orders.createIndex({ "paymentId": 1 }, { sparse: true })

// Create events collection for event sourcing
db.createCollection("events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["eventType", "aggregateId", "data", "timestamp"],
      properties: {
        eventType: {
          bsonType: "string",
          description: "Event type must be a string"
        },
        aggregateId: {
          bsonType: "string",
          description: "Aggregate ID must be a string"
        },
        data: {
          bsonType: "object",
          description: "Event data must be an object"
        },
        timestamp: {
          bsonType: "date"
        },
        version: {
          bsonType: "int"
        }
      }
    }
  }
})

// Create indexes for events
db.events.createIndex({ "aggregateId": 1, "version": 1 }, { unique: true })
db.events.createIndex({ "eventType": 1 })
db.events.createIndex({ "timestamp": -1 })

// Sample data for testing
db.orders.insertMany([
  {
    _id: ObjectId(),
    userId: "user-1",
    items: [
      { productId: "prod-1", quantity: 2, price: 25.99 },
      { productId: "prod-2", quantity: 1, price: 15.50 }
    ],
    status: "pending",
    totalAmount: 67.48,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    userId: "user-2",
    items: [
      { productId: "prod-3", quantity: 1, price: 199.99 }
    ],
    status: "completed",
    totalAmount: 199.99,
    paymentId: "pay-123",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000)
  }
])

print("MongoDB initialization completed successfully")
