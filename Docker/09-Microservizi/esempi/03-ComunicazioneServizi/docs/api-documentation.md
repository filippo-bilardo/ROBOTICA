# API Documentation

This document provides comprehensive API documentation for all microservices in the communication example.

## 🎯 Service Overview

| Service | Technology | Port | Base URL | Database |
|---------|------------|------|----------|----------|
| User Service | Python/FastAPI | 3002 | http://localhost:3002 | PostgreSQL |
| Order Service | Node.js/Express | 3001 | http://localhost:3001 | MongoDB |
| Payment Service | Go/Gin | 3003 | http://localhost:3003 | Redis |
| Notification Service | Python Worker | - | Background Worker | - |

## 📚 User Service API

### Base URL: `http://localhost:3002`

#### Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

#### Endpoints

##### `POST /api/users`
Create a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "is_active": true,
  "is_verified": false,
  "created_at": "2023-01-01T00:00:00Z"
}
```

##### `GET /api/users/{user_id}`
Get user details by ID.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "is_active": true,
  "is_verified": true,
  "created_at": "2023-01-01T00:00:00Z",
  "profile": {
    "bio": "Software developer",
    "country": "USA",
    "city": "San Francisco"
  }
}
```

##### `PUT /api/users/{user_id}`
Update user information.

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567891"
}
```

##### `POST /api/users/{user_id}/verify`
Verify user account.

**Request Body:**
```json
{
  "verification_token": "abc123"
}
```

##### `GET /api/users/{user_id}/events`
Get user event history.

**Response:**
```json
{
  "events": [
    {
      "id": "event-1",
      "event_type": "user_created",
      "data": {...},
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

## 📦 Order Service API

### Base URL: `http://localhost:3001`

#### Endpoints

##### `POST /api/orders`
Create a new order.

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "items": [
    {
      "productId": "prod-1",
      "quantity": 2,
      "price": 29.99
    },
    {
      "productId": "prod-2",
      "quantity": 1,
      "price": 15.50
    }
  ]
}
```

**Response:**
```json
{
  "id": "order-123",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "items": [...],
  "status": "pending",
  "totalAmount": 75.48,
  "createdAt": "2023-01-01T00:00:00Z"
}
```

##### `GET /api/orders/{order_id}`
Get order details.

**Response:**
```json
{
  "id": "order-123",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "items": [...],
  "status": "confirmed",
  "totalAmount": 75.48,
  "paymentId": "pay-456",
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:05:00Z"
}
```

##### `GET /api/orders/user/{user_id}`
Get orders for a specific user.

**Query Parameters:**
- `status` (optional): Filter by order status
- `limit` (optional): Limit number of results (default: 10)
- `offset` (optional): Offset for pagination (default: 0)

##### `PUT /api/orders/{order_id}/status`
Update order status.

**Request Body:**
```json
{
  "status": "confirmed",
  "paymentId": "pay-456"
}
```

##### `POST /api/orders/{order_id}/cancel`
Cancel an order.

**Response:**
```json
{
  "id": "order-123",
  "status": "cancelled",
  "cancelledAt": "2023-01-01T00:10:00Z"
}
```

## 💳 Payment Service API

### Base URL: `http://localhost:3003`

#### Endpoints

##### `POST /api/payments`
Process a payment.

**Request Body:**
```json
{
  "orderId": "order-123",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "amount": 75.48,
  "currency": "USD",
  "paymentMethod": {
    "type": "credit_card",
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123"
  }
}
```

**Response:**
```json
{
  "id": "pay-456",
  "orderId": "order-123",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "amount": 75.48,
  "currency": "USD",
  "status": "processing",
  "createdAt": "2023-01-01T00:02:00Z"
}
```

##### `GET /api/payments/{payment_id}`
Get payment details.

**Response:**
```json
{
  "id": "pay-456",
  "orderId": "order-123",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "amount": 75.48,
  "currency": "USD",
  "status": "completed",
  "transactionId": "txn-789",
  "createdAt": "2023-01-01T00:02:00Z",
  "completedAt": "2023-01-01T00:02:30Z"
}
```

##### `POST /api/payments/{payment_id}/refund`
Refund a payment.

**Request Body:**
```json
{
  "amount": 75.48,
  "reason": "Order cancelled"
}
```

##### `GET /api/payments/user/{user_id}`
Get payments for a user.

##### `GET /api/circuit-breaker/status`
Get circuit breaker status for external service calls.

**Response:**
```json
{
  "user_service": {
    "state": "closed",
    "failure_count": 0,
    "last_failure": null
  },
  "order_service": {
    "state": "open",
    "failure_count": 5,
    "last_failure": "2023-01-01T00:01:00Z"
  }
}
```

## 🔄 Event Schemas

### User Events

#### `user_created`
```json
{
  "event_type": "user_created",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "data": {
    "email": "user@example.com",
    "username": "username",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

#### `user_verified`
```json
{
  "event_type": "user_verified",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "data": {
    "verified_at": "2023-01-01T00:05:00Z"
  }
}
```

### Order Events

#### `order_created`
```json
{
  "event_type": "order_created",
  "order_id": "order-123",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "data": {
    "total_amount": 75.48,
    "items": [...],
    "created_at": "2023-01-01T00:01:00Z"
  }
}
```

#### `order_confirmed`
```json
{
  "event_type": "order_confirmed",
  "order_id": "order-123",
  "data": {
    "payment_id": "pay-456",
    "confirmed_at": "2023-01-01T00:03:00Z"
  }
}
```

### Payment Events

#### `payment_completed`
```json
{
  "event_type": "payment_completed",
  "payment_id": "pay-456",
  "order_id": "order-123",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "data": {
    "amount": 75.48,
    "currency": "USD",
    "transaction_id": "txn-789",
    "completed_at": "2023-01-01T00:02:30Z"
  }
}
```

#### `payment_failed`
```json
{
  "event_type": "payment_failed",
  "payment_id": "pay-456",
  "order_id": "order-123",
  "data": {
    "reason": "Insufficient funds",
    "error_code": "INSUFFICIENT_FUNDS",
    "failed_at": "2023-01-01T00:02:30Z"
  }
}
```

## 🔍 Health Check Endpoints

All services provide health check endpoints:

- `GET /health` - Basic health check
- `GET /ready` - Readiness check (for load balancers)
- `GET /metrics` - Prometheus metrics

## 📊 Monitoring Endpoints

### Prometheus Metrics
All services expose metrics at `/metrics`:

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - HTTP request duration
- `events_published_total` - Total events published
- `database_connections_active` - Active database connections

### Custom Metrics by Service

#### User Service
- `user_registrations_total` - Total user registrations
- `user_verifications_total` - Total user verifications
- `database_queries_duration_seconds` - Database query duration

#### Order Service  
- `orders_created_total` - Total orders created
- `order_value_histogram` - Order value distribution
- `mongo_operations_duration_seconds` - MongoDB operation duration

#### Payment Service
- `payments_processed_total` - Total payments processed
- `payment_success_rate` - Payment success rate
- `circuit_breaker_state` - Circuit breaker states

## 🔐 Error Codes

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error
- `503` - Service Unavailable

### Service-Specific Error Codes

#### User Service
- `USER_001` - Email already exists
- `USER_002` - Username already exists
- `USER_003` - Invalid verification token
- `USER_004` - User not found

#### Order Service
- `ORDER_001` - Invalid user ID
- `ORDER_002` - Empty order items
- `ORDER_003` - Order not found
- `ORDER_004` - Order cannot be modified

#### Payment Service
- `PAY_001` - Invalid payment method
- `PAY_002` - Insufficient funds
- `PAY_003` - Payment already processed
- `PAY_004` - Refund not allowed
