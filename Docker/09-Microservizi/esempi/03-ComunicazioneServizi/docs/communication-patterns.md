# Communication Patterns Documentation

This document describes the communication patterns implemented in the microservices architecture, including synchronous, asynchronous, and event-driven patterns with practical examples and best practices.

## 📋 Overview

The microservices architecture implements multiple communication patterns to address different requirements:

- **Synchronous Communication**: REST APIs and gRPC for immediate responses
- **Asynchronous Messaging**: RabbitMQ for reliable message delivery
- **Event-Driven Architecture**: Redis Streams for real-time event propagation
- **Hybrid Patterns**: Combining multiple patterns for complex workflows

---

## 🔄 Synchronous Communication Patterns

### 1. Request-Response (REST API)

**Use Case**: Direct data retrieval and immediate operations

```typescript
// User Service API Call
const response = await fetch('http://user-service:8001/users/12345', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  }
});

const user = await response.json();
```

**Implementation Example**:
```python
# User Service - FastAPI
@app.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await user_repository.find_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

**Characteristics**:
- ✅ Immediate response
- ✅ Simple error handling  
- ✅ Strong consistency
- ❌ Tight coupling
- ❌ Synchronous blocking
- ❌ Cascade failures

### 2. Service-to-Service Calls

**Use Case**: Order service calling user service for validation

```javascript
// Order Service - Node.js
async function validateUser(userId) {
  try {
    const response = await axios.get(`http://user-service:8001/users/${userId}`, {
      timeout: 5000,
      headers: { 'X-Service': 'order-service' }
    });
    return response.data;
  } catch (error) {
    if (error.code === 'TIMEOUT') {
      throw new Error('User service timeout');
    }
    throw new Error('User validation failed');
  }
}
```

**Circuit Breaker Pattern**:
```javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const breaker = new CircuitBreaker(validateUser, options);

breaker.on('open', () => console.log('Circuit breaker opened'));
breaker.on('halfOpen', () => console.log('Circuit breaker half-open'));
```

### 3. gRPC Communication

**Use Case**: High-performance inter-service communication

```protobuf
// payment.proto
syntax = "proto3";

service PaymentService {
  rpc ProcessPayment(PaymentRequest) returns (PaymentResponse);
  rpc GetPaymentStatus(PaymentStatusRequest) returns (PaymentStatusResponse);
}

message PaymentRequest {
  string order_id = 1;
  string user_id = 2;
  double amount = 3;
  string currency = 4;
  string payment_method = 5;
}
```

**Go Implementation**:
```go
// Payment Service - Go
func (s *paymentServer) ProcessPayment(ctx context.Context, req *pb.PaymentRequest) (*pb.PaymentResponse, error) {
    payment := &Payment{
        OrderID:       req.OrderId,
        UserID:        req.UserId,
        Amount:        req.Amount,
        Currency:      req.Currency,
        PaymentMethod: req.PaymentMethod,
        Status:        "processing",
    }
    
    // Process payment logic
    result, err := s.paymentProcessor.Process(payment)
    if err != nil {
        return &pb.PaymentResponse{
            Success: false,
            Error:   err.Error(),
        }, nil
    }
    
    return &pb.PaymentResponse{
        Success:     true,
        PaymentId:   result.ID,
        Status:      result.Status,
        ProcessedAt: timestamppb.Now(),
    }, nil
}
```

---

## 📨 Asynchronous Messaging Patterns

### 1. Message Queues (RabbitMQ)

**Use Case**: Reliable background processing

```python
# Publisher - Order Service
import pika
import json

def publish_order_event(order_data):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters('rabbitmq')
    )
    channel = connection.channel()
    
    # Declare queue with durability
    channel.queue_declare(queue='order-processing', durable=True)
    
    message = {
        'orderId': order_data['id'],
        'userId': order_data['userId'],
        'amount': order_data['amount'],
        'timestamp': datetime.utcnow().isoformat()
    }
    
    channel.basic_publish(
        exchange='',
        routing_key='order-processing',
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,  # Make message persistent
            correlation_id=str(uuid.uuid4()),
            timestamp=int(time.time())
        )
    )
    
    connection.close()
```

```python
# Consumer - Payment Service
def process_order(ch, method, properties, body):
    try:
        order_data = json.loads(body)
        
        # Process payment
        payment_result = payment_processor.process(order_data)
        
        # Acknowledge message
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
        # Publish result
        publish_payment_result(payment_result)
        
    except Exception as e:
        logger.error(f"Payment processing failed: {e}")
        # Reject and requeue
        ch.basic_nack(
            delivery_tag=method.delivery_tag,
            requeue=True
        )

# Setup consumer
channel.basic_qos(prefetch_count=1)
channel.basic_consume(
    queue='order-processing',
    on_message_callback=process_order
)
```

**Message Priority Queue**:
```python
# High priority for urgent orders
channel.queue_declare(
    queue='urgent-orders',
    durable=True,
    arguments={'x-max-priority': 10}
)

channel.basic_publish(
    exchange='',
    routing_key='urgent-orders',
    body=json.dumps(urgent_order),
    properties=pika.BasicProperties(
        priority=9,  # High priority
        delivery_mode=2
    )
)
```

### 2. Work Queue Pattern

**Use Case**: Distributing work among multiple workers

```python
# Multiple workers processing from same queue
class OrderProcessor:
    def __init__(self, worker_id):
        self.worker_id = worker_id
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters('rabbitmq')
        )
        self.channel = self.connection.channel()
        
    def start_processing(self):
        self.channel.queue_declare(queue='order-processing', durable=True)
        self.channel.basic_qos(prefetch_count=1)  # Fair dispatch
        
        self.channel.basic_consume(
            queue='order-processing',
            on_message_callback=self.process_order
        )
        
        print(f'Worker {self.worker_id} waiting for orders...')
        self.channel.start_consuming()
        
    def process_order(self, ch, method, properties, body):
        order = json.loads(body)
        print(f'Worker {self.worker_id} processing order {order["orderId"]}')
        
        # Simulate processing time
        time.sleep(random.uniform(1, 5))
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
```

### 3. Dead Letter Queue Pattern

**Use Case**: Handling failed messages

```python
# Setup main queue with DLX
channel.queue_declare(
    queue='order-processing',
    durable=True,
    arguments={
        'x-dead-letter-exchange': 'dlx',
        'x-dead-letter-routing-key': 'failed-orders',
        'x-message-ttl': 300000  # 5 minutes TTL
    }
)

# Setup dead letter queue
channel.exchange_declare(exchange='dlx', exchange_type='direct')
channel.queue_declare(queue='failed-orders', durable=True)
channel.queue_bind(
    exchange='dlx',
    queue='failed-orders',
    routing_key='failed-orders'
)

# Message will go to DLQ after max retries
def process_with_retry(ch, method, properties, body):
    retry_count = properties.headers.get('x-retry-count', 0) if properties.headers else 0
    
    try:
        # Process message
        process_order(json.loads(body))
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        if retry_count < 3:
            # Republish with incremented retry count
            headers = {'x-retry-count': retry_count + 1}
            ch.basic_publish(
                exchange='',
                routing_key='order-processing',
                body=body,
                properties=pika.BasicProperties(headers=headers)
            )
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
```

---

## ⚡ Event-Driven Patterns (Redis Streams)

### 1. Event Bus Pattern

**Use Case**: Real-time event propagation across services

```python
# Event Publisher
import redis
import json
import uuid
from datetime import datetime

class EventBus:
    def __init__(self):
        self.redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
    
    def publish_event(self, stream, event_type, data):
        event = {
            'eventType': event_type,
            'eventId': str(uuid.uuid4()),
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0',
            'source': 'user-service',
            'data': json.dumps(data),
            'correlationId': data.get('correlationId', str(uuid.uuid4()))
        }
        
        # Add to stream
        message_id = self.redis_client.xadd(stream, event)
        return message_id

# Usage
event_bus = EventBus()
event_bus.publish_event(
    'user-events',
    'UserCreated',
    {
        'userId': '12345',
        'email': 'user@example.com',
        'name': 'John Doe'
    }
)
```

```python
# Event Consumer
class EventConsumer:
    def __init__(self, consumer_group, consumer_name):
        self.redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
        self.consumer_group = consumer_group
        self.consumer_name = consumer_name
        
    def setup_consumer_group(self, stream):
        try:
            self.redis_client.xgroup_create(stream, self.consumer_group, id='0', mkstream=True)
        except redis.exceptions.ResponseError as e:
            if "BUSYGROUP" not in str(e):
                raise
    
    def consume_events(self, streams, handler):
        while True:
            try:
                messages = self.redis_client.xreadgroup(
                    self.consumer_group,
                    self.consumer_name,
                    streams,
                    count=10,
                    block=1000
                )
                
                for stream, msgs in messages:
                    for msg_id, fields in msgs:
                        try:
                            handler(stream, msg_id, fields)
                            # Acknowledge message
                            self.redis_client.xack(stream, self.consumer_group, msg_id)
                        except Exception as e:
                            logger.error(f"Error processing message {msg_id}: {e}")
                            
            except Exception as e:
                logger.error(f"Consumer error: {e}")
                time.sleep(5)

# Event handler
def handle_user_event(stream, msg_id, fields):
    event_type = fields.get('eventType')
    event_data = json.loads(fields.get('data', '{}'))
    
    if event_type == 'UserCreated':
        # Send welcome email
        send_welcome_email(event_data)
    elif event_type == 'UserUpdated':
        # Update caches
        update_user_cache(event_data)
```

### 2. Event Sourcing Pattern

**Use Case**: Storing all state changes as events

```python
class EventStore:
    def __init__(self):
        self.redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
    
    def append_event(self, aggregate_id, event_type, event_data, expected_version=None):
        stream_name = f"aggregate-{aggregate_id}"
        
        event = {
            'eventType': event_type,
            'eventId': str(uuid.uuid4()),
            'timestamp': datetime.utcnow().isoformat(),
            'aggregateId': aggregate_id,
            'data': json.dumps(event_data),
            'version': self.get_next_version(stream_name)
        }
        
        # Optimistic concurrency check
        if expected_version is not None:
            current_version = self.get_current_version(stream_name)
            if current_version != expected_version:
                raise ConcurrencyError(f"Expected version {expected_version}, got {current_version}")
        
        return self.redis_client.xadd(stream_name, event)
    
    def get_events(self, aggregate_id, from_version=0):
        stream_name = f"aggregate-{aggregate_id}"
        events = self.redis_client.xrange(stream_name)
        
        return [
            {
                'id': event_id,
                'eventType': fields['eventType'],
                'data': json.loads(fields['data']),
                'timestamp': fields['timestamp'],
                'version': int(fields['version'])
            }
            for event_id, fields in events
            if int(fields['version']) > from_version
        ]

# Aggregate reconstruction
class OrderAggregate:
    def __init__(self, order_id):
        self.order_id = order_id
        self.version = 0
        self.status = None
        self.total_amount = 0
        self.items = []
        
    def load_from_events(self, events):
        for event in events:
            self.apply_event(event)
            self.version = event['version']
    
    def apply_event(self, event):
        event_type = event['eventType']
        data = event['data']
        
        if event_type == 'OrderCreated':
            self.status = 'pending'
            self.total_amount = data['totalAmount']
            self.items = data['items']
        elif event_type == 'OrderConfirmed':
            self.status = 'confirmed'
        elif event_type == 'OrderCancelled':
            self.status = 'cancelled'
```

### 3. CQRS Pattern

**Use Case**: Separating read and write models

```python
# Command side - Write model
class OrderCommandHandler:
    def __init__(self, event_store):
        self.event_store = event_store
    
    def handle_create_order(self, command):
        # Validate command
        self.validate_create_order(command)
        
        # Create events
        events = [
            {
                'eventType': 'OrderCreated',
                'data': {
                    'orderId': command['orderId'],
                    'userId': command['userId'],
                    'items': command['items'],
                    'totalAmount': command['totalAmount']
                }
            }
        ]
        
        # Store events
        for event in events:
            self.event_store.append_event(
                command['orderId'],
                event['eventType'],
                event['data']
            )

# Query side - Read model
class OrderQueryHandler:
    def __init__(self):
        self.mongo_client = pymongo.MongoClient('mongodb://mongodb:27017/')
        self.db = self.mongo_client.orders
    
    def get_order(self, order_id):
        return self.db.orders.find_one({'orderId': order_id})
    
    def get_user_orders(self, user_id):
        return list(self.db.orders.find({'userId': user_id}))

# Event handlers for read model updates
class OrderProjection:
    def __init__(self):
        self.mongo_client = pymongo.MongoClient('mongodb://mongodb:27017/')
        self.db = self.mongo_client.orders
    
    def handle_order_created(self, event_data):
        order_doc = {
            'orderId': event_data['orderId'],
            'userId': event_data['userId'],
            'items': event_data['items'],
            'totalAmount': event_data['totalAmount'],
            'status': 'pending',
            'createdAt': datetime.utcnow()
        }
        self.db.orders.insert_one(order_doc)
    
    def handle_order_status_changed(self, event_data):
        self.db.orders.update_one(
            {'orderId': event_data['orderId']},
            {
                '$set': {
                    'status': event_data['newStatus'],
                    'updatedAt': datetime.utcnow()
                }
            }
        )
```

---

## 🔄 Hybrid Patterns

### 1. Saga Pattern

**Use Case**: Distributed transactions across services

```python
# Choreography-based Saga
class OrderSaga:
    def __init__(self):
        self.event_bus = EventBus()
        self.state_store = redis.Redis(host='redis', port=6379)
    
    def handle_order_created(self, event):
        order_id = event['data']['orderId']
        
        # Start saga
        saga_state = {
            'orderId': order_id,
            'step': 'payment_initiated',
            'status': 'active',
            'compensations': []
        }
        
        self.state_store.set(f"saga:{order_id}", json.dumps(saga_state))
        
        # Initiate payment
        self.event_bus.publish_event(
            'payment-commands',
            'InitiatePayment',
            {
                'orderId': order_id,
                'amount': event['data']['totalAmount'],
                'sagaId': order_id
            }
        )
    
    def handle_payment_completed(self, event):
        order_id = event['data']['orderId']
        saga_state = json.loads(self.state_store.get(f"saga:{order_id}"))
        
        saga_state['step'] = 'inventory_reserved'
        self.state_store.set(f"saga:{order_id}", json.dumps(saga_state))
        
        # Reserve inventory
        self.event_bus.publish_event(
            'inventory-commands',
            'ReserveInventory',
            {
                'orderId': order_id,
                'items': event['data']['items'],
                'sagaId': order_id
            }
        )
    
    def handle_payment_failed(self, event):
        order_id = event['data']['orderId']
        
        # Cancel order
        self.event_bus.publish_event(
            'order-commands',
            'CancelOrder',
            {
                'orderId': order_id,
                'reason': 'payment_failed'
            }
        )
        
        # Mark saga as failed
        saga_state = json.loads(self.state_store.get(f"saga:{order_id}"))
        saga_state['status'] = 'failed'
        self.state_store.set(f"saga:{order_id}", json.dumps(saga_state))
```

### 2. Request-Reply with Async

**Use Case**: Async request with callback

```javascript
// Order Service - Async payment with callback
async function processOrderWithAsyncPayment(orderData) {
  const correlationId = uuidv4();
  
  // Store pending request
  await redis.set(`pending:${correlationId}`, JSON.stringify({
    orderId: orderData.id,
    status: 'waiting_payment',
    timestamp: new Date().toISOString()
  }), 'EX', 300); // 5 minutes expiry
  
  // Send async payment request
  await rabbitMQ.publish('payment-requests', {
    orderId: orderData.id,
    amount: orderData.totalAmount,
    correlationId: correlationId,
    replyTo: 'order-payment-replies'
  });
  
  return { correlationId, status: 'processing' };
}

// Handle payment reply
async function handlePaymentReply(message) {
  const { correlationId, paymentResult } = message;
  
  // Retrieve pending request
  const pendingRequest = await redis.get(`pending:${correlationId}`);
  if (!pendingRequest) {
    console.log('Request expired or not found');
    return;
  }
  
  const request = JSON.parse(pendingRequest);
  
  if (paymentResult.success) {
    // Update order status
    await updateOrderStatus(request.orderId, 'confirmed');
    
    // Notify client via WebSocket
    wsClients.get(request.orderId)?.send(JSON.stringify({
      type: 'order_confirmed',
      orderId: request.orderId
    }));
  } else {
    // Handle payment failure
    await updateOrderStatus(request.orderId, 'payment_failed');
  }
  
  // Cleanup
  await redis.del(`pending:${correlationId}`);
}
```

---

## 📊 Pattern Selection Guide

### When to Use Each Pattern

| Pattern | Use Case | Pros | Cons | Best For |
|---------|----------|------|------|----------|
| **REST API** | Simple CRUD operations | Easy to implement, widely supported | Synchronous, coupling | Simple queries, user interfaces |
| **gRPC** | High-performance RPC | Fast, type-safe, streaming | Complex setup, HTTP/2 only | Internal service communication |
| **Message Queues** | Background processing | Reliable, scalable, decoupled | Eventual consistency | Email sending, data processing |
| **Event Streams** | Real-time updates | Fast, ordered, replay | Memory intensive | Activity feeds, notifications |
| **Event Sourcing** | Audit trails | Complete history, debugging | Complex queries | Financial systems, compliance |
| **CQRS** | Different read/write needs | Optimized models | Data consistency | Reporting, analytics |
| **Saga** | Distributed transactions | Consistency, compensation | Complex orchestration | Order processing, bookings |

### Performance Characteristics

```
Latency (P99):
├── gRPC: 1-5ms
├── REST: 10-50ms  
├── Redis Streams: 5-20ms
├── RabbitMQ: 20-100ms
└── Database: 50-200ms

Throughput:
├── Redis Streams: 100K+ ops/sec
├── gRPC: 50K+ ops/sec
├── RabbitMQ: 20K+ messages/sec
├── REST: 10K+ requests/sec
└── Database: 5K+ queries/sec
```

---

## 🔧 Implementation Best Practices

### 1. Error Handling

```python
# Retry with exponential backoff
import asyncio
import random

async def retry_with_backoff(func, max_retries=3, base_delay=1):
    for attempt in range(max_retries):
        try:
            return await func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            await asyncio.sleep(delay)

# Circuit breaker implementation
class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = 'closed'  # closed, open, half-open
    
    async def call(self, func, *args, **kwargs):
        if self.state == 'open':
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = 'half-open'
            else:
                raise Exception("Circuit breaker is open")
        
        try:
            result = await func(*args, **kwargs)
            self.reset()
            return result
        except Exception as e:
            self.record_failure()
            raise
    
    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = 'open'
    
    def reset(self):
        self.failure_count = 0
        self.state = 'closed'
```

### 2. Monitoring and Observability

```python
# Distributed tracing
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

tracer = trace.get_tracer(__name__)

async def process_order_with_tracing(order_data):
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_data['id'])
        span.set_attribute("order.amount", order_data['amount'])
        
        # Process payment
        with tracer.start_as_current_span("process_payment") as payment_span:
            payment_result = await process_payment(order_data)
            payment_span.set_attribute("payment.status", payment_result.status)
        
        return payment_result

# Metrics collection
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('request_duration_seconds', 'Request duration')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active connections')

# Use metrics
@REQUEST_DURATION.time()
async def handle_request():
    REQUEST_COUNT.labels(method='POST', endpoint='/orders').inc()
    # Process request
```

### 3. Security Patterns

```python
# Service-to-service authentication
import jwt
import time

class ServiceAuth:
    def __init__(self, service_name, secret_key):
        self.service_name = service_name
        self.secret_key = secret_key
    
    def generate_token(self):
        payload = {
            'service': self.service_name,
            'iat': int(time.time()),
            'exp': int(time.time()) + 300  # 5 minutes
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_token(self, token):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload['service']
        except jwt.ExpiredSignatureError:
            raise Exception('Token expired')
        except jwt.InvalidTokenError:
            raise Exception('Invalid token')

# Message encryption
from cryptography.fernet import Fernet

class MessageEncryption:
    def __init__(self, key):
        self.cipher_suite = Fernet(key)
    
    def encrypt_message(self, message):
        return self.cipher_suite.encrypt(message.encode())
    
    def decrypt_message(self, encrypted_message):
        return self.cipher_suite.decrypt(encrypted_message).decode()
```

---

## 🧪 Testing Patterns

### 1. Integration Testing

```python
# Test event flow
async def test_order_creation_flow():
    # Create user
    user_response = await client.post("/users", json={
        "name": "Test User",
        "email": "test@example.com"
    })
    user_id = user_response.json()["id"]
    
    # Create order
    order_response = await client.post("/orders", json={
        "userId": user_id,
        "items": [{"productId": "prod-1", "quantity": 2}]
    })
    order_id = order_response.json()["id"]
    
    # Verify events were published
    events = await redis_client.xrange('order-events')
    assert len(events) > 0
    
    last_event = events[-1][1]
    assert last_event['eventType'] == 'OrderCreated'
    assert json.loads(last_event['data'])['orderId'] == order_id

# Test message processing
async def test_message_processing():
    # Send message
    await publish_message('test-queue', {
        'type': 'test_message',
        'data': {'key': 'value'}
    })
    
    # Verify processing
    await asyncio.sleep(1)  # Allow processing time
    
    processed_messages = await get_processed_messages()
    assert len(processed_messages) == 1
    assert processed_messages[0]['type'] == 'test_message'
```

### 2. Load Testing

```python
# Concurrent message publishing
import asyncio
import aiohttp

async def load_test_messages(concurrent_users=100, messages_per_user=10):
    async def publish_messages(session, user_id):
        for i in range(messages_per_user):
            async with session.post('http://localhost:8002/orders', json={
                'userId': f'user-{user_id}',
                'items': [{'productId': 'prod-1', 'quantity': 1}]
            }) as response:
                assert response.status == 201
    
    async with aiohttp.ClientSession() as session:
        tasks = [
            publish_messages(session, user_id)
            for user_id in range(concurrent_users)
        ]
        
        start_time = time.time()
        await asyncio.gather(*tasks)
        end_time = time.time()
        
        total_messages = concurrent_users * messages_per_user
        duration = end_time - start_time
        throughput = total_messages / duration
        
        print(f"Published {total_messages} messages in {duration:.2f}s")
        print(f"Throughput: {throughput:.2f} messages/second")
```

---

## 📚 Related Documentation

- [Event Schemas](./event-schemas.md)
- [API Documentation](./api-documentation.md)
- [Monitoring Guide](../monitoring/README.md)
- [Security Guide](../security/README.md)

---

## 🆘 Troubleshooting

### Common Issues

**Message Loss**
```bash
# Check RabbitMQ queues
rabbitmqctl list_queues name messages consumers

# Check Redis streams
redis-cli XINFO STREAM order-events
```

**High Latency**
```bash
# Monitor service response times
curl http://localhost:9090/metrics | grep http_request_duration

# Check database performance
docker exec mongodb mongosh --eval "db.runCommand({serverStatus:1}).metrics"
```

**Memory Issues**
```bash
# Monitor Redis memory
redis-cli INFO memory

# Check container resources
docker stats
```

**Event Ordering Issues**
```bash
# Check Redis stream ordering
redis-cli XRANGE order-events - + COUNT 10

# Verify consumer group status
redis-cli XINFO GROUPS order-events
```
