# Comunicazione tra Microservizi

Questo esempio dimostra i diversi pattern di comunicazione tra microservizi utilizzando Docker, includendo comunicazione sincrona, asincrona, event-driven e message queues.

## 🎯 Obiettivi

- Implementare comunicazione sincrona (REST, gRPC)
- Configurare comunicazione asincrona (Message Queues)
- Gestire eventi con Event Bus
- Implementare pattern SAGA per transazioni distribuite
- Monitorare la comunicazione tra servizi

## 📋 Prerequisiti

- Docker e Docker Compose
- Comprensione di REST API
- Concetti base di message queues
- Familiarità con eventi asincroni

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                    Event Bus (Redis)                        │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
    ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
    │ Order Service│     │User Service │     │Payment Srv  │
    │   (Node.js)  │     │  (Python)   │     │    (Go)     │
    └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
           │                    │                    │
    ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
    │   MongoDB    │     │ PostgreSQL  │     │   Redis     │
    └─────────────┘     └─────────────┘     └─────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Message Queue (RabbitMQ)                       │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Pattern Implementati

### 1. Comunicazione Sincrona
- **REST API**: HTTP/JSON per operazioni CRUD
- **gRPC**: High-performance RPC per operazioni critiche
- **Circuit Breaker**: Resilienza nelle chiamate

### 2. Comunicazione Asincrona
- **Message Queues**: RabbitMQ per elaborazione asincrona
- **Event Bus**: Redis Streams per eventi real-time
- **Pub/Sub**: Pattern publisher/subscriber

### 3. Orchestrazione
- **SAGA Pattern**: Transazioni distribuite
- **Event Sourcing**: Storia degli eventi
- **CQRS**: Separazione command/query

## 📁 Struttura del Progetto

```
03-ComunicazioneServizi/
├── README.md
├── docker-compose.yml
├── services/
│   ├── order-service/           # Node.js + MongoDB
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/
│   │   │   ├── events/
│   │   │   └── saga/
│   │   └── grpc/
│   ├── user-service/            # Python + PostgreSQL
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── app.py
│   │   ├── events/
│   │   └── grpc_server/
│   ├── payment-service/         # Go + Redis
│   │   ├── Dockerfile
│   │   ├── go.mod
│   │   ├── main.go
│   │   ├── handlers/
│   │   └── events/
│   └── notification-service/    # Python + Email
│       ├── Dockerfile
│       ├── requirements.txt
│       ├── worker.py
│       └── templates/
├── infrastructure/
│   ├── rabbitmq/
│   │   └── rabbitmq.conf
│   ├── redis/
│   │   └── redis.conf
│   └── monitoring/
│       ├── prometheus.yml
│       └── grafana/
├── tests/
│   ├── integration/
│   ├── load/
│   └── e2e/
└── docs/
    ├── api-documentation.md
    ├── event-schemas.md
    └── communication-patterns.md
```

## 🔧 Setup e Esecuzione

### Avvio Rapido con Script

```bash
# Clona il repository
git clone <repository>
cd 03-ComunicazioneServizi

# Deploy completo con un comando
./scripts/deploy.sh deploy

# Verifica stato dei servizi
./scripts/deploy.sh status

# Visualizza logs in tempo reale
./scripts/deploy.sh logs

# Accesso al monitoring
./scripts/deploy.sh monitor
```

### Comandi Disponibili

```bash
# Deployment
./scripts/deploy.sh deploy      # Deploy completo
./scripts/deploy.sh stop        # Ferma i servizi
./scripts/deploy.sh destroy     # Rimuovi tutto
./scripts/deploy.sh status      # Stato servizi

# Testing
./scripts/deploy.sh test        # Test di integrazione
./scripts/deploy.sh load-test   # Test di carico
python run_tests.py            # Test orchestrator completo

# Development
./scripts/dev-utils.sh build    # Build servizi
./scripts/dev-utils.sh debug    # Debug mode
./scripts/dev-utils.sh lint     # Code linting
./scripts/dev-utils.sh security # Security scan
```

### Avvio Manuale (Opzionale)

```bash
# Avvia l'infrastruttura
docker-compose up -d

# Verifica stato servizi
docker-compose ps

# Visualizza logs
docker-compose logs -f
```

### Test Pattern di Comunicazione

```bash
# Test comunicazione sincrona (REST)
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "items": [{"productId": 1, "quantity": 2}]}'

# Test comunicazione asincrona (Events)
curl -X POST http://localhost:3001/orders/1/events \
  -H "Content-Type: application/json" \
  -d '{"event": "order_confirmed"}'

# Test gRPC
grpcurl -plaintext localhost:50051 user.UserService/GetUser
```

## 📡 Pattern di Comunicazione

### 1. REST API (Sincrono)

```javascript
// Order Service -> User Service
const getUserData = async (userId) => {
  try {
    const response = await axios.get(`http://user-service:3000/users/${userId}`);
    return response.data;
  } catch (error) {
    // Circuit breaker logic
    return await handleUserServiceError(error);
  }
};
```

### 2. Event Bus (Asincrono)

```javascript
// Pubblicazione evento
const publishEvent = async (eventType, data) => {
  await redis.xadd('events', '*', 
    'type', eventType,
    'data', JSON.stringify(data),
    'timestamp', Date.now()
  );
};

// Sottoscrizione eventi
const subscribeToEvents = async () => {
  const stream = redis.xread('BLOCK', 0, 'STREAMS', 'events', '$');
  // Process events...
};
```

### 3. Message Queue (RabbitMQ)

```python
# Publisher
import pika

def publish_message(queue_name, message):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters('rabbitmq')
    )
    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=True)
    
    channel.basic_publish(
        exchange='',
        routing_key=queue_name,
        body=json.dumps(message),
        properties=pika.BasicProperties(delivery_mode=2)
    )
    connection.close()

# Consumer
def process_message(ch, method, properties, body):
    message = json.loads(body)
    # Process message logic
    ch.basic_ack(delivery_tag=method.delivery_tag)
```

### 4. gRPC (High Performance)

```protobuf
// user.proto
syntax = "proto3";

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ValidateUser(ValidateUserRequest) returns (ValidateUserResponse);
}

message GetUserRequest {
  int32 user_id = 1;
}

message GetUserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
  bool verified = 4;
}
```

## 🔄 SAGA Pattern Implementation

### Order Processing SAGA

```javascript
class OrderSaga {
  async execute(orderData) {
    const saga = new SagaTransaction();
    
    try {
      // Step 1: Reserve inventory
      await saga.addStep(
        () => this.reserveInventory(orderData),
        () => this.releaseInventory(orderData)
      );
      
      // Step 2: Process payment
      await saga.addStep(
        () => this.processPayment(orderData),
        () => this.refundPayment(orderData)
      );
      
      // Step 3: Confirm order
      await saga.addStep(
        () => this.confirmOrder(orderData),
        () => this.cancelOrder(orderData)
      );
      
      await saga.execute();
      
    } catch (error) {
      await saga.compensate();
      throw error;
    }
  }
}
```

## 📊 Monitoraggio e Observability

### Stack di Monitoring Completo

Il sistema include monitoring production-ready con:

- **Prometheus**: Raccolta metriche da tutti i servizi
- **Grafana**: Dashboard visuali con metriche in tempo reale
- **Health Checks**: Controlli di salute automatici
- **Distributed Tracing**: Tracciamento end-to-end delle richieste

### Accesso ai Dashboard

```bash
# Prometheus - Metriche e alerting
http://localhost:9090

# Grafana - Dashboard visuali
http://localhost:3000
# Username: admin, Password: admin

# RabbitMQ Management
http://localhost:15672
# Username: guest, Password: guest

# Quick status check
./scripts/deploy.sh monitor
```

### Metriche Principali

```bash
# Performance metrics
curl http://localhost:9090/metrics | grep http_request_duration

# Event processing rates
curl http://localhost:9090/metrics | grep event_processing_rate

# Queue depths
curl http://localhost:9090/metrics | grep rabbitmq_queue_messages

# Service health
curl http://localhost:8001/health
curl http://localhost:8002/health  
curl http://localhost:8003/health
```

### Health Checks Automatici

Ogni servizio espone endpoint di health check completi:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "dependencies": {
    "database": {"status": "healthy", "latency": "5ms"},
    "redis": {"status": "healthy", "memory": "45%"},
    "rabbitmq": {"status": "healthy", "queues": 3},
    "external_apis": {"status": "healthy", "uptime": "99.9%"}
  }
}
```

## 🧪 Testing Completo

### Framework di Testing Multi-Livello

Il progetto include un framework di testing completo con:

```bash
# Test orchestrator unificato
python run_tests.py

# Test specifici
python run_tests.py --type unit           # Unit tests
python run_tests.py --type integration    # Integration tests
python run_tests.py --type load          # Load testing
python run_tests.py --type smoke         # Smoke tests
```

### Test di Integrazione

```bash
# Test del flusso completo utente-ordine-pagamento
cd tests/integration
python -m pytest test_microservices_flow.py -v

# Test con tracciamento eventi
python -m pytest test_microservices_flow.py::test_complete_order_flow -s
```

### Load Testing

```bash
# Test di carico configurabile
cd tests/load
python load_test.py --users 100 --duration 300

# Test con scenari multipli
python load_test.py --scenario mixed --users 50
```

### Test Pattern di Comunicazione

```bash
# Test comunicazione sincrona (REST)
curl -X POST http://localhost:8001/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Test comunicazione asincrona (Events)
curl -X POST http://localhost:8002/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123", "items": [{"productId": "prod-1", "quantity": 2}]}'

# Test gRPC
grpcurl -plaintext localhost:50051 payment.PaymentService/ProcessPayment
```

## ⚡ Performance Optimization

### Connection Pooling

```javascript
// Database connection pooling
const pool = new Pool({
  host: 'postgres',
  database: 'users',
  user: 'postgres',
  password: 'password',
  max: 20,           // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Caching Strategy

```javascript
// Multi-level caching
const getCachedUser = async (userId) => {
  // L1: In-memory cache
  let user = memoryCache.get(`user:${userId}`);
  if (user) return user;
  
  // L2: Redis cache
  user = await redis.get(`user:${userId}`);
  if (user) {
    memoryCache.set(`user:${userId}`, user, 300); // 5 min
    return JSON.parse(user);
  }
  
  // L3: Database
  user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (user) {
    await redis.setex(`user:${userId}`, 1800, JSON.stringify(user)); // 30 min
    memoryCache.set(`user:${userId}`, user, 300);
  }
  
  return user;
};
```

## 🛡️ Resilience Patterns

### Circuit Breaker

```javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const breaker = new CircuitBreaker(callExternalService, options);

breaker.on('open', () => console.log('Circuit breaker opened'));
breaker.on('halfOpen', () => console.log('Circuit breaker half-open'));
```

### Retry with Exponential Backoff

```javascript
const retry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

## 📚 Documentazione Completa

### Documentazione Dettagliata

Per una comprensione approfondita del sistema, consulta la documentazione specializzata:

- **[API Documentation](./docs/api-documentation.md)** - Documentazione completa delle API REST, endpoint, schemi request/response, codici di errore e esempi pratici
- **[Event Schemas](./docs/event-schemas.md)** - Schemi dettagliati degli eventi Redis Streams e messaggi RabbitMQ con esempi di flussi completi
- **[Communication Patterns](./docs/communication-patterns.md)** - Pattern di comunicazione implementati con esempi di codice, best practices e linee guida per la selezione

### Quick Reference

#### REST Endpoints Principali

| Service | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| User | POST | /users | Create new user |
| User | GET | /users/:id | Get user details |
| Order | POST | /orders | Create new order |
| Order | GET | /orders/:id | Get order details |
| Payment | POST | /payments | Process payment |
| Payment | GET | /payments/:id | Get payment status |

#### Event Types

```json
{
  "UserCreated": {
    "userId": "string",
    "email": "string", 
    "name": "string"
  },
  "OrderCreated": {
    "orderId": "string",
    "userId": "string",
    "items": "array",
    "totalAmount": "number"
  },
  "PaymentCompleted": {
    "paymentId": "string",
    "orderId": "string",
    "amount": "number",
    "status": "string"
  }
}
```

## 🎓 Esercizi Pratici e Learning Path

### Esercizi Guidati

1. **Pattern Sincrono**: Implementa un nuovo endpoint che combina dati da più servizi
2. **Event Sourcing**: Estendi l'event store per supportare snapshots
3. **Dead Letter Queue**: Implementa gestione avanzata dei messaggi falliti
4. **Circuit Breaker**: Configura soglie personalizzate per ogni servizio
5. **Distributed Locks**: Implementa coordinamento per operazioni critiche

### Laboratori Avanzati

```bash
# Lab 1: Implementa nuovo pattern di comunicazione
./scripts/dev-utils.sh lab1

# Lab 2: Estendi il sistema di monitoring
./scripts/dev-utils.sh lab2

# Lab 3: Aggiungi resilienza avanzata
./scripts/dev-utils.sh lab3
```

## 📊 Performance e Scalabilità

### Metriche di Performance

- **Throughput**: 1000+ ordini/secondo
- **Latency P99**: <50ms per operazioni sincrone
- **Event Processing**: <5ms per eventi Redis
- **Message Queue**: <100ms per elaborazione asincrona

### Capacità del Sistema

```bash
# Test di scalabilità
./scripts/deploy.sh load-test --users 1000 --duration 600

# Monitoraggio risorse
docker stats

# Analisi performance
./scripts/dev-utils.sh benchmark
```

## 🔧 Troubleshooting e Debug

### Debug Mode

```bash
# Avvia in modalità debug
./scripts/dev-utils.sh debug

# Debug specifico servizio
docker-compose -f docker-compose.debug.yml up user-service

# Attach debugger
# - Python: localhost:5678
# - Node.js: localhost:9229
# - Go: localhost:2345
```

### Problemi Comuni

```bash
# Verifica connessioni
./scripts/dev-utils.sh health-check

# Reset completo sistema
./scripts/deploy.sh destroy && ./scripts/deploy.sh deploy

# Analisi logs
./scripts/deploy.sh logs | grep ERROR

# Verifica eventi Redis
redis-cli XREAD STREAMS user-events order-events payment-events $ $ $
```

## 📖 Risorse e Approfondimenti

### Documentazione Tecnica

- **[API Documentation](./docs/api-documentation.md)** - Reference completo delle API
- **[Event Schemas](./docs/event-schemas.md)** - Formati eventi e messaggi
- **[Communication Patterns](./docs/communication-patterns.md)** - Pattern implementati

### Risorse Esterne

- [Microservices Patterns - Chris Richardson](https://microservices.io/patterns/)
- [Building Event-Driven Microservices - O'Reilly](https://www.oreilly.com/library/view/building-event-driven-microservices/9781492057888/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Redis Streams Tutorial](https://redis.io/topics/streams-intro)
- [Saga Pattern Implementation](https://microservices.io/patterns/data/saga.html)

### Community e Support

- [GitHub Issues](https://github.com/your-repo/issues)
- [Docker Community](https://forums.docker.com/)
- [Microservices Slack](https://microservices.slack.com/)

## 🔗 Navigazione Corso

- ⬅️ **Modulo precedente**: [02-APIGateway](../02-APIGateway/) - Gateway e routing
- ➡️ **Modulo successivo**: [04-PersistenzaDistribuita](../04-PersistenzaDistribuita/) - Database distribuiti
- 🏠 **Indice corso**: [Microservizi con Docker](../../) - Panoramica completa
- 📚 **Teoria**: [Concetti Microservizi](../../teoria/) - Background teorico

---

## 🏆 Completamento Modulo

✅ **Hai completato il modulo "Comunicazione tra Microservizi"!**

**Competenze acquisite**:
- Pattern di comunicazione sincrona e asincrona
- Event-driven architecture con Redis Streams
- Message queues con RabbitMQ
- Pattern SAGA per transazioni distribuite
- Monitoring e observability production-ready
- Testing completo di sistemi distribuiti

**Prossimi passi**: Procedi al modulo [04-PersistenzaDistribuita](../04-PersistenzaDistribuita/) per apprendere la gestione di database distribuiti in architetture microservizi.
