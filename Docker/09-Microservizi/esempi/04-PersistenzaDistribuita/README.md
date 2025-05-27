# Persistenza Distribuita nei Microservizi

Questo esempio dimostra i pattern di gestione dei dati distribuiti nei microservizi, includendo Database per Service, Event Sourcing, CQRS, e strategie di sincronizzazione.

## 🎯 Obiettivi

- Implementare Database per Service pattern
- Configurare Event Sourcing e CQRS
- Gestire consistenza eventuale
- Sincronizzare dati tra servizi
- Implementare strategie di backup e recovery

## 📋 Prerequisiti

- Docker e Docker Compose
- Comprensione di database relazionali e NoSQL
- Concetti di ACID vs BASE
- Familiarità con Event Sourcing

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                               │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
    ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
    │ User Service│     │Order Service│     │Catalog Srv  │
    │ PostgreSQL  │     │  MongoDB    │     │Elasticsearch│
    └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
           │                    │                    │
    ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
    │ Read Models │     │Event Store  │     │Search Index │
    │   Redis     │     │ EventStore  │     │    Cache    │
    └─────────────┘     └─────────────┘     └─────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Data Synchronization Bus                       │
│                  (Apache Kafka)                            │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Pattern Implementati

### 1. Database per Service
- **User Service**: PostgreSQL per dati transazionali
- **Order Service**: MongoDB per documenti flessibili  
- **Catalog Service**: Elasticsearch per ricerca full-text
- **Analytics Service**: ClickHouse per analytics

### 2. Event Sourcing & CQRS
- **Event Store**: Persistenza eventi immutabili
- **Command Models**: Gestione write operations
- **Read Models**: Proiezioni ottimizzate per query
- **Snapshots**: Ottimizzazione performance

### 3. Data Synchronization
- **Change Data Capture**: Debezium per CDC
- **Message Streaming**: Apache Kafka
- **Materialized Views**: Proiezioni aggiornate
- **Eventual Consistency**: Strategie di consistenza

## 📁 Struttura del Progetto

```
04-PersistenzaDistribuita/
├── README.md
├── docker-compose.yml
├── services/
│   ├── user-service/              # PostgreSQL + Redis
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── projections/
│   │   │   └── events/
│   │   └── migrations/
│   ├── order-service/             # MongoDB + Event Store
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── aggregates/
│   │   │   ├── events/
│   │   │   ├── projections/
│   │   │   └── snapshots/
│   │   └── schemas/
│   ├── catalog-service/           # Elasticsearch + Cache
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── indexers/
│   │   │   ├── search/
│   │   │   └── sync/
│   │   └── mappings/
│   ├── analytics-service/         # ClickHouse + Materialized Views
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── collectors/
│   │   │   ├── aggregators/
│   │   │   └── dashboards/
│   │   └── schemas/
│   └── sync-service/              # Data Synchronization
│       ├── Dockerfile
│       ├── src/
│       │   ├── connectors/
│       │   ├── processors/
│       │   └── transformers/
│       └── config/
├── infrastructure/
│   ├── kafka/
│   │   ├── docker-compose.kafka.yml
│   │   └── connect/
│   ├── databases/
│   │   ├── postgres/
│   │   ├── mongodb/
│   │   ├── elasticsearch/
│   │   └── clickhouse/
│   ├── eventstore/
│   │   └── docker-compose.eventstore.yml
│   └── monitoring/
│       ├── prometheus/
│       ├── grafana/
│       └── jaeger/
├── data-migration/
│   ├── scripts/
│   ├── seeders/
│   └── validators/
├── tests/
│   ├── integration/
│   ├── consistency/
│   └── performance/
└── docs/
    ├── data-models.md
    ├── consistency-patterns.md
    ├── migration-guide.md
    └── troubleshooting.md
```

## 🚀 Setup e Esecuzione

### Avvio Infrastruttura

```bash
# Avvia database e infrastruttura
docker-compose -f docker-compose.yml \
               -f infrastructure/kafka/docker-compose.kafka.yml \
               -f infrastructure/eventstore/docker-compose.eventstore.yml \
               up -d

# Verifica status
docker-compose ps

# Inizializza database
./scripts/init-databases.sh

# Esegui migrazioni
./scripts/run-migrations.sh
```

### Setup Event Sourcing

```bash
# Crea event store streams
./scripts/setup-eventstore.sh

# Configura proiezioni
./scripts/setup-projections.sh

# Avvia data sync
./scripts/start-sync.sh
```

## 📊 Modelli di Dati

### User Service (PostgreSQL)

```sql
-- Tabella principale utenti
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- Tabella eventi utente
CREATE TABLE user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Read model per profili
CREATE MATERIALIZED VIEW user_profiles AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.profile->>'firstName' as first_name,
    u.profile->>'lastName' as last_name,
    u.profile->>'avatar' as avatar_url,
    COUNT(ue.id) as total_events,
    MAX(ue.created_at) as last_activity
FROM users u
LEFT JOIN user_events ue ON u.id = ue.user_id
GROUP BY u.id, u.username, u.email, u.profile;

-- Indici per performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_type ON user_events(event_type);
CREATE INDEX idx_user_events_created_at ON user_events(created_at);
```

### Order Service (MongoDB + Event Store)

```javascript
// Order Aggregate Schema
const orderAggregateSchema = {
  _id: ObjectId,
  aggregateId: String,
  aggregateType: "Order",
  version: Number,
  state: {
    orderId: String,
    userId: Number,
    items: [{
      productId: String,
      name: String,
      price: Number,
      quantity: Number
    }],
    total: Number,
    status: String,
    shippingAddress: Object,
    paymentMethod: Object
  },
  lastEventId: String,
  createdAt: Date,
  updatedAt: Date
};

// Event Store Schema
const eventSchema = {
  _id: ObjectId,
  eventId: String,
  aggregateId: String,
  aggregateType: String,
  eventType: String,
  eventData: Object,
  metadata: {
    timestamp: Date,
    version: Number,
    causationId: String,
    correlationId: String,
    userId: String
  },
  position: Number
};

// Order Projection Schema (CQRS Read Model)
const orderProjectionSchema = {
  _id: ObjectId,
  orderId: String,
  userId: Number,
  customerInfo: {
    name: String,
    email: String
  },
  items: Array,
  summary: {
    itemCount: Number,
    totalAmount: Number,
    discountAmount: Number,
    taxAmount: Number,
    finalAmount: Number
  },
  timeline: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  currentStatus: String,
  estimatedDelivery: Date,
  trackingNumber: String,
  lastUpdated: Date
};
```

### Catalog Service (Elasticsearch)

```json
{
  "mappings": {
    "properties": {
      "productId": { "type": "keyword" },
      "name": { 
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      "description": { 
        "type": "text",
        "analyzer": "standard" 
      },
      "category": {
        "type": "nested",
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "path": { "type": "keyword" }
        }
      },
      "price": {
        "type": "object",
        "properties": {
          "amount": { "type": "double" },
          "currency": { "type": "keyword" },
          "discount": { "type": "double" }
        }
      },
      "inventory": {
        "type": "object",
        "properties": {
          "quantity": { "type": "integer" },
          "reserved": { "type": "integer" },
          "available": { "type": "integer" }
        }
      },
      "attributes": {
        "type": "nested",
        "properties": {
          "name": { "type": "keyword" },
          "value": { "type": "keyword" },
          "unit": { "type": "keyword" }
        }
      },
      "ratings": {
        "type": "object",
        "properties": {
          "average": { "type": "float" },
          "count": { "type": "integer" },
          "distribution": { "type": "integer" }
        }
      },
      "tags": { "type": "keyword" },
      "status": { "type": "keyword" },
      "createdAt": { "type": "date" },
      "updatedAt": { "type": "date" },
      "lastSyncAt": { "type": "date" }
    }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "product_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "product_synonyms"]
        }
      },
      "filter": {
        "product_synonyms": {
          "type": "synonym",
          "synonyms_path": "synonyms/products.txt"
        }
      }
    }
  }
}
```

## 🔄 Event Sourcing Implementation

### Event Store Operations

```javascript
class EventStore {
  async appendEvents(aggregateId, expectedVersion, events) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Check version for optimistic concurrency
        const currentVersion = await this.getCurrentVersion(aggregateId);
        if (currentVersion !== expectedVersion) {
          throw new OptimisticConcurrencyError(
            `Expected version ${expectedVersion}, but current is ${currentVersion}`
          );
        }

        // Append events
        const eventDocuments = events.map((event, index) => ({
          eventId: uuidv4(),
          aggregateId,
          aggregateType: event.aggregateType,
          eventType: event.type,
          eventData: event.data,
          metadata: {
            timestamp: new Date(),
            version: expectedVersion + index + 1,
            causationId: event.causationId,
            correlationId: event.correlationId,
            userId: event.userId
          },
          position: await this.getNextPosition()
        }));

        await Event.insertMany(eventDocuments, { session });
        
        // Update aggregate snapshot if needed
        await this.updateSnapshotIfNeeded(aggregateId, events);
        
        // Publish events to message bus
        await this.publishEvents(eventDocuments);
      });
    } finally {
      await session.endSession();
    }
  }

  async getEvents(aggregateId, fromVersion = 0) {
    return await Event.find({
      aggregateId,
      'metadata.version': { $gt: fromVersion }
    }).sort({ 'metadata.version': 1 });
  }

  async getEventsFromPosition(position, batchSize = 100) {
    return await Event.find({
      position: { $gt: position }
    })
    .sort({ position: 1 })
    .limit(batchSize);
  }
}
```

### CQRS Projections

```javascript
class OrderProjectionHandler {
  async handle(event) {
    switch (event.eventType) {
      case 'OrderCreated':
        await this.createOrderProjection(event);
        break;
      case 'OrderItemAdded':
        await this.updateOrderItems(event);
        break;
      case 'OrderStatusChanged':
        await this.updateOrderStatus(event);
        break;
      case 'PaymentProcessed':
        await this.updatePaymentInfo(event);
        break;
      case 'OrderShipped':
        await this.updateShippingInfo(event);
        break;
      default:
        console.log(`Unknown event type: ${event.eventType}`);
    }
  }

  async createOrderProjection(event) {
    const { orderId, userId, items, total } = event.eventData;
    
    // Get user info from User Service
    const userInfo = await this.userServiceClient.getUser(userId);
    
    const projection = new OrderProjection({
      orderId,
      userId,
      customerInfo: {
        name: `${userInfo.firstName} ${userInfo.lastName}`,
        email: userInfo.email
      },
      items,
      summary: {
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: total,
        discountAmount: 0,
        taxAmount: total * 0.08, // 8% tax
        finalAmount: total * 1.08
      },
      timeline: [{
        status: 'created',
        timestamp: event.metadata.timestamp,
        note: 'Order created'
      }],
      currentStatus: 'pending',
      lastUpdated: event.metadata.timestamp
    });

    await projection.save();
  }

  async updateOrderStatus(event) {
    const { orderId, status, note } = event.eventData;
    
    await OrderProjection.findOneAndUpdate(
      { orderId },
      {
        $set: {
          currentStatus: status,
          lastUpdated: event.metadata.timestamp
        },
        $push: {
          timeline: {
            status,
            timestamp: event.metadata.timestamp,
            note
          }
        }
      }
    );
  }
}
```

## 🔗 Data Synchronization

### Change Data Capture (Debezium)

```json
{
  "name": "postgres-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "tasks.max": "1",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.dbname": "userdb",
    "database.server.name": "userdb",
    "table.include.list": "public.users,public.user_events",
    "plugin.name": "pgoutput",
    "publication.autocreate.mode": "filtered",
    "transforms": "route",
    "transforms.route.type": "org.apache.kafka.connect.transforms.RegexRouter",
    "transforms.route.regex": "([^.]+)\\.([^.]+)\\.([^.]+)",
    "transforms.route.replacement": "$3"
  }
}
```

### Kafka Streams Processing

```javascript
const kafka = require('kafkajs');

class DataSyncProcessor {
  constructor() {
    this.kafka = kafka({
      clientId: 'data-sync-processor',
      brokers: ['kafka:9092']
    });
    
    this.consumer = this.kafka.consumer({ 
      groupId: 'data-sync-group' 
    });
  }

  async start() {
    await this.consumer.connect();
    
    await this.consumer.subscribe({ 
      topics: ['users', 'orders', 'products'],
      fromBeginning: false 
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        
        switch (topic) {
          case 'users':
            await this.syncUserData(data);
            break;
          case 'orders':
            await this.syncOrderData(data);
            break;
          case 'products':
            await this.syncProductData(data);
            break;
        }
      }
    });
  }

  async syncUserData(changeEvent) {
    const { op, after, before } = changeEvent;
    
    switch (op) {
      case 'c': // Create
        await this.createUserInReadModels(after);
        break;
      case 'u': // Update
        await this.updateUserInReadModels(after, before);
        break;
      case 'd': // Delete
        await this.deleteUserFromReadModels(before);
        break;
    }
  }

  async createUserInReadModels(userData) {
    // Update Redis cache
    await this.redis.setex(
      `user:${userData.id}`, 
      3600, 
      JSON.stringify(userData)
    );
    
    // Update Elasticsearch
    await this.elasticsearch.index({
      index: 'users',
      id: userData.id,
      body: {
        ...userData,
        lastSyncAt: new Date()
      }
    });
    
    // Update analytics database
    await this.clickhouse.insert('INSERT INTO users', [userData]);
  }
}
```

## 📈 Performance Optimization

### Materialized Views

```sql
-- Materialized view per order analytics
CREATE MATERIALIZED VIEW order_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_orders,
    SUM(total) as total_revenue,
    AVG(total) as avg_order_value,
    COUNT(DISTINCT user_id) as unique_customers,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders
FROM orders
GROUP BY DATE_TRUNC('day', created_at);

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_order_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY order_analytics;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh every hour
SELECT cron.schedule('refresh-analytics', '0 * * * *', 'SELECT refresh_order_analytics();');
```

### Caching Strategies

```javascript
class CacheManager {
  constructor() {
    this.l1Cache = new Map(); // In-memory cache
    this.l2Cache = redis.createClient(); // Redis cache
  }

  async get(key, fetcher, ttl = 300) {
    // L1 Cache check
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }

    // L2 Cache check
    const cached = await this.l2Cache.get(key);
    if (cached) {
      const data = JSON.parse(cached);
      this.l1Cache.set(key, data);
      return data;
    }

    // Fetch from source
    const data = await fetcher();
    
    // Store in both caches
    this.l1Cache.set(key, data);
    await this.l2Cache.setex(key, ttl, JSON.stringify(data));
    
    return data;
  }

  async invalidate(pattern) {
    // Clear L1 cache
    for (const key of this.l1Cache.keys()) {
      if (key.match(pattern)) {
        this.l1Cache.delete(key);
      }
    }

    // Clear L2 cache
    const keys = await this.l2Cache.keys(pattern);
    if (keys.length > 0) {
      await this.l2Cache.del(keys);
    }
  }
}
```

## 🛡️ Data Consistency

### Saga Pattern for Distributed Transactions

```javascript
class OrderSaga {
  async execute(orderData) {
    const sagaId = uuidv4();
    const saga = new SagaTransaction(sagaId);

    try {
      // Step 1: Reserve inventory
      const reservationId = await saga.addStep(
        'reserve-inventory',
        () => this.inventoryService.reserve(orderData.items),
        (reservationId) => this.inventoryService.release(reservationId)
      );

      // Step 2: Process payment
      const paymentId = await saga.addStep(
        'process-payment',
        () => this.paymentService.charge(orderData.payment),
        (paymentId) => this.paymentService.refund(paymentId)
      );

      // Step 3: Create order
      const orderId = await saga.addStep(
        'create-order',
        () => this.orderService.create(orderData),
        (orderId) => this.orderService.cancel(orderId)
      );

      // Step 4: Send confirmation
      await saga.addStep(
        'send-confirmation',
        () => this.notificationService.sendOrderConfirmation(orderId),
        () => this.notificationService.sendOrderCancellation(orderId)
      );

      await saga.complete();
      return orderId;

    } catch (error) {
      await saga.compensate();
      throw error;
    }
  }
}
```

### Eventual Consistency Monitoring

```javascript
class ConsistencyMonitor {
  async checkConsistency() {
    const checks = [
      this.checkUserConsistency(),
      this.checkOrderConsistency(),
      this.checkInventoryConsistency()
    ];

    const results = await Promise.all(checks);
    
    return {
      timestamp: new Date(),
      overallStatus: results.every(r => r.consistent) ? 'consistent' : 'inconsistent',
      checks: results,
      metrics: {
        totalEntities: results.reduce((sum, r) => sum + r.totalEntities, 0),
        inconsistentEntities: results.reduce((sum, r) => sum + r.inconsistentEntities, 0)
      }
    };
  }

  async checkUserConsistency() {
    // Compare user data between PostgreSQL and read models
    const postgresUsers = await this.postgres.query('SELECT id, email, updated_at FROM users');
    const redisUsers = await this.getAllUsersFromRedis();
    const elasticUsers = await this.getAllUsersFromElastic();

    const inconsistencies = [];

    for (const pgUser of postgresUsers) {
      const redisUser = redisUsers.find(u => u.id === pgUser.id);
      const elasticUser = elasticUsers.find(u => u.id === pgUser.id);

      if (!redisUser || !elasticUser) {
        inconsistencies.push({
          userId: pgUser.id,
          issue: 'Missing in read models',
          details: {
            inRedis: !!redisUser,
            inElastic: !!elasticUser
          }
        });
      } else if (pgUser.updated_at > redisUser.lastSyncAt) {
        inconsistencies.push({
          userId: pgUser.id,
          issue: 'Stale data in read models',
          details: {
            lastUpdate: pgUser.updated_at,
            lastSync: redisUser.lastSyncAt
          }
        });
      }
    }

    return {
      consistent: inconsistencies.length === 0,
      totalEntities: postgresUsers.length,
      inconsistentEntities: inconsistencies.length,
      inconsistencies
    };
  }
}
```

## 🧪 Testing Strategies

### Integration Tests

```javascript
describe('Data Consistency Tests', () => {
  it('should maintain consistency across user updates', async () => {
    // Create user in primary database
    const user = await userService.createUser({
      email: 'test@example.com',
      username: 'testuser'
    });

    // Wait for propagation
    await waitForEventPropagation();

    // Check read models
    const redisUser = await redis.get(`user:${user.id}`);
    const elasticUser = await elasticsearch.get({
      index: 'users',
      id: user.id
    });

    expect(JSON.parse(redisUser)).toMatchObject({
      id: user.id,
      email: 'test@example.com'
    });

    expect(elasticUser.body._source).toMatchObject({
      id: user.id,
      email: 'test@example.com'
    });
  });

  it('should handle concurrent updates correctly', async () => {
    const userId = 1;
    
    // Simulate concurrent updates
    const updates = Array.from({ length: 10 }, (_, i) => 
      userService.updateUser(userId, { 
        profile: { counter: i } 
      })
    );

    await Promise.all(updates);

    // Verify final state consistency
    const pgUser = await postgres.query('SELECT * FROM users WHERE id = $1', [userId]);
    const finalState = await waitForConsistency(userId);

    expect(finalState.redis.profile.counter).toBe(finalState.postgres.profile.counter);
    expect(finalState.elastic.profile.counter).toBe(finalState.postgres.profile.counter);
  });
});
```

### Performance Tests

```javascript
describe('Performance Tests', () => {
  it('should handle high write throughput', async () => {
    const startTime = Date.now();
    const operations = 1000;
    
    const promises = Array.from({ length: operations }, async (_, i) => {
      await orderService.createOrder({
        userId: Math.floor(Math.random() * 100) + 1,
        items: [{ productId: `prod-${i}`, quantity: 1, price: 10.00 }]
      });
    });

    await Promise.all(promises);
    
    const duration = Date.now() - startTime;
    const throughput = operations / (duration / 1000);

    expect(throughput).toBeGreaterThan(50); // 50 ops/sec minimum
    
    // Verify data consistency after high load
    await waitForEventPropagation();
    const consistencyReport = await consistencyMonitor.checkConsistency();
    expect(consistencyReport.overallStatus).toBe('consistent');
  });
});
```

## 📊 Monitoring e Observability

### Metrics Collection

```javascript
const promClient = require('prom-client');

// Database metrics
const dbOperationDuration = new promClient.Histogram({
  name: 'db_operation_duration_seconds',
  help: 'Database operation duration in seconds',
  labelNames: ['database', 'operation', 'table']
});

const eventProcessingLag = new promClient.Gauge({
  name: 'event_processing_lag_seconds',
  help: 'Event processing lag in seconds',
  labelNames: ['service', 'event_type']
});

const consistencyGauge = new promClient.Gauge({
  name: 'data_consistency_score',
  help: 'Data consistency score (0-1)',
  labelNames: ['service', 'entity_type']
});

// Data synchronization metrics
const syncLatency = new promClient.Histogram({
  name: 'data_sync_latency_seconds',
  help: 'Data synchronization latency',
  labelNames: ['source', 'target', 'entity_type']
});
```

### Health Checks

```javascript
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabaseHealth(),
      eventStore: await checkEventStoreHealth(),
      messageQueue: await checkMessageQueueHealth(),
      cache: await checkCacheHealth(),
      consistency: await checkDataConsistency()
    }
  };

  const isHealthy = Object.values(health.checks)
    .every(check => check.status === 'healthy');

  res.status(isHealthy ? 200 : 503).json(health);
});
```

## 🎓 Esercizi Pratici

1. **Event Store Optimization**: Implementa snapshot per aggregati con molti eventi
2. **Cross-Service Queries**: Crea API per query che attraversano più servizi
3. **Data Migration**: Sviluppa strumenti per migrare dati tra versioni schema
4. **Conflict Resolution**: Implementa strategie per risolvere conflitti di dati
5. **Backup Strategy**: Progetta backup distribuiti con recovery point-in-time

## 📚 Risorse Aggiuntive

- [Event Sourcing - Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Journey - Microsoft](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/jj554200(v=pandp.10))
- [Database per Service Pattern](https://microservices.io/patterns/data/database-per-service.html)
- [Eventual Consistency Primer](https://docs.microsoft.com/en-us/azure/architecture/primer/eventual-consistency)

## 🔗 Link Utili

- Modulo precedente: [03-ComunicazioneServizi](../03-ComunicazioneServizi/)
- [Teoria Microservizi](../../teoria/)
- [Corso Docker principale](../../../README.md)
