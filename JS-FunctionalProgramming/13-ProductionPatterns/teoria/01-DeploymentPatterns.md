# Deployment Patterns per Applicazioni Funzionali

## 1. Architetture Serverless Funzionali

### 1.1 Lambda Functions Pure

```javascript
// AWS Lambda handler funzionale
const { pipe, map, filter, reduce } = require('ramda');

// Handler puro con dependency injection
const createHandler = (dependencies) => async (event, context) => {
  const { logger, validator, processor, storage } = dependencies;
  
  return pipe(
    validateInput(validator),
    processData(processor),
    saveResults(storage),
    formatResponse
  )(event);
};

// Composizione delle dipendenze
const dependencies = {
  logger: createLogger({ level: 'info' }),
  validator: createValidator(schema),
  processor: createProcessor(),
  storage: createStorage({ 
    endpoint: process.env.STORAGE_ENDPOINT 
  })
};

exports.handler = createHandler(dependencies);
```

### 1.2 Cold Start Optimization

```javascript
// Precompilazione di funzioni pesanti
const memoize = require('lodash/memoize');
const { curry } = require('ramda');

// Cache globale per warm instances
const globalCache = new Map();

// Inizializzazione lazy
const getProcessor = memoize(() => {
  return pipe(
    parseInput,
    validateSchema,
    transformData,
    enrichWithMetadata
  );
});

// Curry per riutilizzo
const processWithConfig = curry((config, data) => {
  const processor = getProcessor();
  return processor({ ...data, config });
});

// Pre-warming
const preWarm = () => {
  getProcessor(); // Carica in cache
  return 'warmed';
};

// Export per Lambda
exports.handler = async (event) => {
  if (event.warmup) return preWarm();
  
  return processWithConfig(getConfig())(event.data);
};
```

## 2. Microservices Funzionali

### 2.1 Event-Driven Architecture

```javascript
// Event Store funzionale
const EventStore = {
  // Append-only store
  append: curry((stream, events) => 
    events.reduce((store, event) => [...store, {
      ...event,
      id: generateId(),
      timestamp: Date.now(),
      stream
    }], getStream(stream))
  ),
  
  // Event sourcing
  replay: curry((reducer, initialState, stream) =>
    getStream(stream).reduce(reducer, initialState)
  ),
  
  // Projections
  project: curry((projection, stream) =>
    getStream(stream).reduce(projection.reducer, projection.initialState)
  )
};

// Command handlers puri
const createUserHandler = (command) => {
  const validation = validateCreateUser(command);
  if (validation.isLeft()) return validation;
  
  return Right([{
    type: 'USER_CREATED',
    payload: {
      id: command.id,
      email: command.email,
      createdAt: Date.now()
    }
  }]);
};

// Event handlers
const userProjection = {
  initialState: new Map(),
  reducer: (state, event) => {
    switch (event.type) {
      case 'USER_CREATED':
        return state.set(event.payload.id, event.payload);
      case 'USER_UPDATED':
        return state.set(event.payload.id, {
          ...state.get(event.payload.id),
          ...event.payload
        });
      default:
        return state;
    }
  }
};
```

### 2.2 Service Communication

```javascript
// Circuit Breaker funzionale
const createCircuitBreaker = (options = {}) => {
  const {
    threshold = 5,
    timeout = 60000,
    monitor = console.error
  } = options;
  
  let state = { failures: 0, lastFailure: null, state: 'CLOSED' };
  
  return (serviceFn) => async (...args) => {
    // Check circuit state
    if (state.state === 'OPEN') {
      if (Date.now() - state.lastFailure > timeout) {
        state.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await serviceFn(...args);
      
      // Reset on success
      if (state.state === 'HALF_OPEN') {
        state = { failures: 0, lastFailure: null, state: 'CLOSED' };
      }
      
      return result;
    } catch (error) {
      state.failures++;
      state.lastFailure = Date.now();
      
      if (state.failures >= threshold) {
        state.state = 'OPEN';
        monitor(`Circuit breaker opened for ${serviceFn.name}`);
      }
      
      throw error;
    }
  };
};

// Retry con backoff esponenziale
const withRetry = curry((options, fn) => {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;
  
  return async (...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) break;
        
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt),
          maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
});
```

## 3. Container Orchestration

### 3.1 Docker per Applicazioni Funzionali

```dockerfile
# Multi-stage build per ottimizzazione
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Rimuovi dipendenze non necessarie
RUN npm prune --production

FROM node:18-alpine AS runtime

# Crea utente non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copia solo i file necessari
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

# Health check funzionale
COPY healthcheck.js .
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

```javascript
// healthcheck.js - Health check funzionale
const http = require('http');

const healthCheck = () => new Promise((resolve, reject) => {
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET',
    timeout: 2000
  }, (res) => {
    if (res.statusCode === 200) {
      resolve('OK');
    } else {
      reject(new Error(`Health check failed: ${res.statusCode}`));
    }
  });
  
  req.on('error', reject);
  req.on('timeout', () => reject(new Error('Health check timeout')));
  req.end();
});

healthCheck()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
```

### 3.2 Kubernetes Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: functional-app
  labels:
    app: functional-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: functional-app
  template:
    metadata:
      labels:
        app: functional-app
    spec:
      containers:
      - name: app
        image: functional-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "info"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: functional-app-service
spec:
  selector:
    app: functional-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

## 4. Database Patterns

### 4.1 Immutable Data Stores

```javascript
// Event Store con PostgreSQL
const EventStore = {
  appendEvents: curry(async (client, streamId, expectedVersion, events) => {
    const query = `
      INSERT INTO events (stream_id, version, event_type, event_data, metadata)
      VALUES ${events.map((_, i) => `($1, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}, $${i * 4 + 5})`).join(', ')}
    `;
    
    const values = [streamId].concat(
      events.flatMap((event, i) => [
        expectedVersion + i + 1,
        event.type,
        JSON.stringify(event.data),
        JSON.stringify(event.metadata || {})
      ])
    );
    
    try {
      await client.query('BEGIN');
      
      // Verifica versione corrente
      const versionCheck = await client.query(
        'SELECT COALESCE(MAX(version), 0) as current_version FROM events WHERE stream_id = $1',
        [streamId]
      );
      
      if (versionCheck.rows[0].current_version !== expectedVersion) {
        throw new Error('Concurrency conflict');
      }
      
      await client.query(query, values);
      await client.query('COMMIT');
      
      return Right(expectedVersion + events.length);
    } catch (error) {
      await client.query('ROLLBACK');
      return Left(error);
    }
  }),
  
  readEvents: curry(async (client, streamId, fromVersion = 0) => {
    const result = await client.query(`
      SELECT version, event_type, event_data, metadata, created_at
      FROM events 
      WHERE stream_id = $1 AND version > $2 
      ORDER BY version ASC
    `, [streamId, fromVersion]);
    
    return result.rows.map(row => ({
      version: row.version,
      type: row.event_type,
      data: JSON.parse(row.event_data),
      metadata: JSON.parse(row.metadata),
      createdAt: row.created_at
    }));
  })
};
```

### 4.2 CQRS con Read Models

```javascript
// Read Model Projections
const createProjectionBuilder = (eventStore) => ({
  build: curry(async (projectionName, eventHandlers) => {
    const checkpoint = await getCheckpoint(projectionName);
    const events = await eventStore.readAllEvents(checkpoint);
    
    const newCheckpoint = await events.reduce(async (accPromise, event) => {
      const acc = await accPromise;
      
      if (eventHandlers[event.type]) {
        await eventHandlers[event.type](event);
      }
      
      return event.position;
    }, Promise.resolve(checkpoint));
    
    await saveCheckpoint(projectionName, newCheckpoint);
    return newCheckpoint;
  }),
  
  continuous: curry((projectionName, eventHandlers) => {
    setInterval(async () => {
      try {
        await this.build(projectionName, eventHandlers);
      } catch (error) {
        console.error(`Projection ${projectionName} failed:`, error);
      }
    }, 1000);
  })
});

// User Read Model
const userProjectionHandlers = {
  USER_CREATED: async (event) => {
    await db.users.insert({
      id: event.data.id,
      email: event.data.email,
      createdAt: event.data.createdAt,
      version: event.version
    });
  },
  
  USER_EMAIL_CHANGED: async (event) => {
    await db.users.update(
      { id: event.data.id },
      { 
        email: event.data.newEmail,
        version: event.version
      }
    );
  }
};
```

## 5. Monitoring e Observability

### 5.1 Structured Logging

```javascript
// Logger funzionale
const createLogger = (config) => {
  const { level, service, version } = config;
  
  const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };
  const currentLevel = logLevels[level] || 2;
  
  const formatMessage = curry((level, message, context = {}) => ({
    timestamp: new Date().toISOString(),
    level,
    service,
    version,
    message,
    ...context,
    traceId: context.traceId || generateTraceId()
  }));
  
  const log = curry((level, message, context) => {
    if (logLevels[level] <= currentLevel) {
      console.log(JSON.stringify(formatMessage(level, message, context)));
    }
  });
  
  return {
    error: log('error'),
    warn: log('warn'),
    info: log('info'),
    debug: log('debug'),
    child: (childContext) => createLogger({
      ...config,
      ...childContext
    })
  };
};

// Middleware per tracing
const withTracing = (handler) => async (event, context) => {
  const traceId = event.headers?.['x-trace-id'] || generateTraceId();
  const logger = createLogger({ 
    service: 'api',
    version: process.env.VERSION 
  }).child({ traceId });
  
  logger.info('Request started', { 
    path: event.path,
    method: event.httpMethod 
  });
  
  try {
    const result = await handler({ ...event, logger }, context);
    
    logger.info('Request completed', { 
      statusCode: result.statusCode 
    });
    
    return result;
  } catch (error) {
    logger.error('Request failed', { 
      error: error.message,
      stack: error.stack 
    });
    throw error;
  }
};
```

### 5.2 Metrics Collection

```javascript
// Metrics funzionali
const createMetrics = () => {
  const counters = new Map();
  const histograms = new Map();
  const gauges = new Map();
  
  return {
    counter: curry((name, labels = {}, value = 1) => {
      const key = `${name}_${JSON.stringify(labels)}`;
      counters.set(key, (counters.get(key) || 0) + value);
    }),
    
    histogram: curry((name, labels = {}, value) => {
      const key = `${name}_${JSON.stringify(labels)}`;
      const values = histograms.get(key) || [];
      histograms.set(key, [...values, value]);
    }),
    
    gauge: curry((name, labels = {}, value) => {
      const key = `${name}_${JSON.stringify(labels)}`;
      gauges.set(key, value);
    }),
    
    export: () => ({
      counters: Object.fromEntries(counters),
      histograms: Object.fromEntries(histograms),
      gauges: Object.fromEntries(gauges)
    })
  };
};

// Middleware per metriche
const withMetrics = (metrics) => (handler) => async (event, context) => {
  const start = Date.now();
  
  metrics.counter('requests_total', {
    method: event.httpMethod,
    path: event.path
  });
  
  try {
    const result = await handler(event, context);
    
    metrics.counter('requests_success_total', {
      method: event.httpMethod,
      status: result.statusCode
    });
    
    metrics.histogram('request_duration_ms', {
      method: event.httpMethod
    }, Date.now() - start);
    
    return result;
  } catch (error) {
    metrics.counter('requests_error_total', {
      method: event.httpMethod,
      error: error.constructor.name
    });
    
    throw error;
  }
};
```

## 6. CI/CD Pipelines

### 6.1 GitHub Actions per FP

```yaml
# .github/workflows/deploy.yml
name: Deploy Functional App

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run property-based tests
        run: npm run test:property
      
      - name: Run mutation tests
        run: npm run test:mutation
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build -t functional-app:${{ github.sha }} .
          docker tag functional-app:${{ github.sha }} functional-app:latest
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push functional-app:${{ github.sha }}
          docker push functional-app:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/functional-app app=functional-app:${{ github.sha }}
          kubectl rollout status deployment/functional-app
```

## 7. Configuration Management

### 7.1 Environment-based Config

```javascript
// config/index.js
const { pipe, map, filter, fromPairs } = require('ramda');

const createConfig = (env = process.env) => {
  const required = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET'
  ];
  
  const optional = {
    PORT: 3000,
    LOG_LEVEL: 'info',
    NODE_ENV: 'development'
  };
  
  // Valida variabili richieste
  const missing = required.filter(key => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Combina required e optional
  const config = {
    ...optional,
    ...pipe(
      filter(key => required.includes(key) || optional.hasOwnProperty(key)),
      map(key => [key, env[key]]),
      fromPairs
    )(Object.keys(env))
  };
  
  return {
    ...config,
    isDevelopment: config.NODE_ENV === 'development',
    isProduction: config.NODE_ENV === 'production',
    database: parseConnectionString(config.DATABASE_URL),
    redis: parseConnectionString(config.REDIS_URL)
  };
};

module.exports = createConfig();
```

## 8. Security Patterns

### 8.1 JWT Authentication

```javascript
// JWT funzionale
const jwt = require('jsonwebtoken');
const { curry, pipe } = require('ramda');

const createJWTManager = (secret, options = {}) => {
  const defaultOptions = {
    expiresIn: '1h',
    issuer: 'functional-app',
    audience: 'api'
  };
  
  const config = { ...defaultOptions, ...options };
  
  return {
    sign: curry((payload, customOptions = {}) => 
      jwt.sign(payload, secret, { ...config, ...customOptions })
    ),
    
    verify: curry((token) => {
      try {
        const decoded = jwt.verify(token, secret, config);
        return Right(decoded);
      } catch (error) {
        return Left(error);
      }
    }),
    
    middleware: () => (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const result = this.verify(token);
      
      if (result.isLeft()) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      req.user = result.value;
      next();
    }
  };
};
```

Questo modulo fornisce pattern completi per il deployment di applicazioni funzionali in ambiente di produzione, coprendo dall'orchestrazione dei container alla sicurezza e al monitoraggio.
