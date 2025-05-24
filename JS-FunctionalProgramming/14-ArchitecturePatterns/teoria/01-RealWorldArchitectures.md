# Architetture Real-world con Programmazione Funzionale

## 1. Domain-Driven Design Funzionale

### 1.1 Value Objects Immutabili

```javascript
// Value Objects con validazione
const createValueObject = (validations) => (value) => {
  const errors = validations
    .map(validate => validate(value))
    .filter(result => result !== null);
  
  if (errors.length > 0) {
    return Left(errors);
  }
  
  return Right(Object.freeze({
    value,
    equals: (other) => other.value === value,
    toString: () => value.toString()
  }));
};

// Email Value Object
const Email = createValueObject([
  (value) => typeof value !== 'string' ? 'Email must be a string' : null,
  (value) => !value.includes('@') ? 'Email must contain @' : null,
  (value) => value.length > 254 ? 'Email too long' : null
]);

// Money Value Object
const Money = createValueObject([
  (value) => typeof value.amount !== 'number' ? 'Amount must be number' : null,
  (value) => value.amount < 0 ? 'Amount cannot be negative' : null,
  (value) => !value.currency ? 'Currency is required' : null
]);

// Usage
const email = Email('user@example.com');
const price = Money({ amount: 99.99, currency: 'EUR' });

if (email.isRight() && price.isRight()) {
  // Safe to use
  console.log(email.value.toString());
}
```

### 1.2 Aggregates Funzionali

```javascript
// Order Aggregate
const createOrder = (state = null) => {
  const events = [];
  
  const apply = (event) => {
    events.push(event);
    return createOrder(orderReducer(state, event));
  };
  
  const getUncommittedEvents = () => events;
  const markEventsAsCommitted = () => events.length = 0;
  
  return {
    // Queries
    getId: () => state?.id,
    getTotal: () => state?.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0),
    getStatus: () => state?.status,
    
    // Commands
    create: (orderId, customerId) => {
      if (state) throw new Error('Order already exists');
      
      return apply({
        type: 'ORDER_CREATED',
        payload: { orderId, customerId, items: [], status: 'PENDING' }
      });
    },
    
    addItem: (product, quantity) => {
      if (!state) throw new Error('Order not created');
      if (state.status !== 'PENDING') throw new Error('Cannot modify confirmed order');
      
      return apply({
        type: 'ITEM_ADDED',
        payload: { 
          product: product.value,
          quantity,
          price: product.value.price
        }
      });
    },
    
    confirm: () => {
      if (!state) throw new Error('Order not created');
      if (state.items.length === 0) throw new Error('Cannot confirm empty order');
      
      return apply({
        type: 'ORDER_CONFIRMED',
        payload: { confirmedAt: Date.now() }
      });
    },
    
    // Event handling
    getUncommittedEvents,
    markEventsAsCommitted
  };
};

// Order Reducer
const orderReducer = (state, event) => {
  switch (event.type) {
    case 'ORDER_CREATED':
      return {
        id: event.payload.orderId,
        customerId: event.payload.customerId,
        items: [],
        status: 'PENDING',
        createdAt: Date.now()
      };
    
    case 'ITEM_ADDED':
      return {
        ...state,
        items: [...state.items, {
          id: generateId(),
          ...event.payload
        }]
      };
    
    case 'ORDER_CONFIRMED':
      return {
        ...state,
        status: 'CONFIRMED',
        confirmedAt: event.payload.confirmedAt
      };
    
    default:
      return state;
  }
};
```

## 2. Hexagonal Architecture

### 2.1 Ports e Adapters

```javascript
// Domain layer - Business logic
const createOrderService = (dependencies) => {
  const { orderRepository, paymentService, inventoryService, eventBus } = dependencies;
  
  return {
    createOrder: async (createOrderCommand) => {
      // Validate command
      const validation = validateCreateOrderCommand(createOrderCommand);
      if (validation.isLeft()) return validation;
      
      // Check inventory
      const inventoryCheck = await inventoryService.checkAvailability(
        createOrderCommand.items
      );
      if (inventoryCheck.isLeft()) return inventoryCheck;
      
      // Create aggregate
      const order = createOrder()
        .create(generateId(), createOrderCommand.customerId);
      
      createOrderCommand.items.forEach(item => {
        order.addItem(item.product, item.quantity);
      });
      
      // Save to repository
      await orderRepository.save(order);
      
      // Publish events
      order.getUncommittedEvents().forEach(event => {
        eventBus.publish(event);
      });
      
      order.markEventsAsCommitted();
      
      return Right(order.getId());
    },
    
    processPayment: async (orderId, paymentDetails) => {
      const order = await orderRepository.findById(orderId);
      if (!order) return Left('Order not found');
      
      const paymentResult = await paymentService.processPayment({
        amount: order.getTotal(),
        ...paymentDetails
      });
      
      if (paymentResult.isLeft()) return paymentResult;
      
      order.confirm();
      await orderRepository.save(order);
      
      return Right('Payment processed');
    }
  };
};

// Infrastructure layer - Adapters
const createPostgresOrderRepository = (db) => ({
  save: async (order) => {
    const events = order.getUncommittedEvents();
    
    await db.transaction(async (trx) => {
      // Upsert aggregate snapshot
      await trx('order_snapshots')
        .insert({
          id: order.getId(),
          data: JSON.stringify(order.getState()),
          version: events.length
        })
        .onConflict('id')
        .merge(['data', 'version']);
      
      // Append new events
      for (const event of events) {
        await trx('order_events').insert({
          aggregate_id: order.getId(),
          event_type: event.type,
          event_data: JSON.stringify(event.payload),
          sequence: event.sequence
        });
      }
    });
  },
  
  findById: async (id) => {
    const snapshot = await db('order_snapshots')
      .where('id', id)
      .first();
    
    if (!snapshot) return null;
    
    const events = await db('order_events')
      .where('aggregate_id', id)
      .where('sequence', '>', snapshot.version)
      .orderBy('sequence');
    
    let order = createOrder(JSON.parse(snapshot.data));
    
    events.forEach(event => {
      order = order.apply({
        type: event.event_type,
        payload: JSON.parse(event.event_data)
      });
    });
    
    return order;
  }
});

// Application layer - Use cases
const createOrderUseCases = (orderService, dependencies) => ({
  placeOrder: async (request) => {
    const command = mapRequestToCommand(request);
    const result = await orderService.createOrder(command);
    
    return result.fold(
      error => ({ success: false, error }),
      orderId => ({ success: true, orderId })
    );
  }
});
```

### 2.2 Dependency Injection

```javascript
// IoC Container funzionale
const createContainer = () => {
  const services = new Map();
  const singletons = new Map();
  
  return {
    register: (name, factory, { singleton = false } = {}) => {
      services.set(name, { factory, singleton });
      return this;
    },
    
    resolve: (name) => {
      if (!services.has(name)) {
        throw new Error(`Service ${name} not registered`);
      }
      
      const { factory, singleton } = services.get(name);
      
      if (singleton) {
        if (!singletons.has(name)) {
          singletons.set(name, factory(this));
        }
        return singletons.get(name);
      }
      
      return factory(this);
    },
    
    createScope: () => createContainer()
  };
};

// Service registration
const configureContainer = () => {
  const container = createContainer();
  
  // Infrastructure
  container.register('database', () => createDatabase(), { singleton: true });
  container.register('eventBus', () => createEventBus(), { singleton: true });
  
  // Repositories
  container.register('orderRepository', (c) => 
    createPostgresOrderRepository(c.resolve('database'))
  );
  
  // External services
  container.register('paymentService', () => createPaymentService());
  container.register('inventoryService', () => createInventoryService());
  
  // Domain services
  container.register('orderService', (c) => createOrderService({
    orderRepository: c.resolve('orderRepository'),
    paymentService: c.resolve('paymentService'),
    inventoryService: c.resolve('inventoryService'),
    eventBus: c.resolve('eventBus')
  }));
  
  // Use cases
  container.register('orderUseCases', (c) => 
    createOrderUseCases(c.resolve('orderService'))
  );
  
  return container;
};
```

## 3. Event Sourcing Architecture

### 3.1 Event Store Implementation

```javascript
// Event Store con Snapshots
const createEventStore = (storage) => {
  const appendToStream = async (streamId, expectedVersion, events) => {
    const currentVersion = await storage.getCurrentVersion(streamId);
    
    if (currentVersion !== expectedVersion) {
      throw new Error(`Concurrency conflict. Expected: ${expectedVersion}, Current: ${currentVersion}`);
    }
    
    const eventsWithMetadata = events.map((event, index) => ({
      ...event,
      streamId,
      version: expectedVersion + index + 1,
      eventId: generateId(),
      timestamp: Date.now()
    }));
    
    await storage.appendEvents(streamId, eventsWithMetadata);
    
    return expectedVersion + events.length;
  };
  
  const readStreamEvents = async (streamId, fromVersion = 0) => {
    return await storage.readEvents(streamId, fromVersion);
  };
  
  const createSnapshot = async (streamId, version, state) => {
    await storage.saveSnapshot(streamId, version, state);
  };
  
  const loadSnapshot = async (streamId) => {
    return await storage.loadSnapshot(streamId);
  };
  
  const loadAggregate = async (streamId, aggregateFactory) => {
    // Try to load from snapshot
    const snapshot = await loadSnapshot(streamId);
    const fromVersion = snapshot ? snapshot.version : 0;
    const initialState = snapshot ? snapshot.state : null;
    
    // Load events after snapshot
    const events = await readStreamEvents(streamId, fromVersion);
    
    // Rebuild aggregate
    let aggregate = aggregateFactory(initialState);
    
    events.forEach(event => {
      aggregate = aggregate.apply(event);
    });
    
    return aggregate;
  };
  
  return {
    appendToStream,
    readStreamEvents,
    createSnapshot,
    loadAggregate
  };
};

// Aggregate Repository
const createAggregateRepository = (eventStore, aggregateFactory) => ({
  save: async (aggregate) => {
    const events = aggregate.getUncommittedEvents();
    if (events.length === 0) return;
    
    const streamId = aggregate.getId();
    const expectedVersion = aggregate.getVersion() - events.length;
    
    await eventStore.appendToStream(streamId, expectedVersion, events);
    aggregate.markEventsAsCommitted();
    
    // Create snapshot every 10 events
    if (aggregate.getVersion() % 10 === 0) {
      await eventStore.createSnapshot(
        streamId,
        aggregate.getVersion(),
        aggregate.getState()
      );
    }
  },
  
  findById: async (id) => {
    return await eventStore.loadAggregate(id, aggregateFactory);
  }
});
```

### 3.2 Projection Engine

```javascript
// Projection Engine
const createProjectionEngine = (eventStore, projectionStorage) => {
  const projections = new Map();
  
  const registerProjection = (name, config) => {
    projections.set(name, {
      ...config,
      lastProcessedPosition: 0
    });
  };
  
  const processEvents = async () => {
    for (const [name, projection] of projections) {
      try {
        const events = await eventStore.readAllEvents(
          projection.lastProcessedPosition
        );
        
        for (const event of events) {
          if (projection.eventHandlers[event.type]) {
            await projection.eventHandlers[event.type](event, projectionStorage);
          }
          
          projection.lastProcessedPosition = event.globalPosition;
        }
        
        await projectionStorage.saveCheckpoint(name, projection.lastProcessedPosition);
      } catch (error) {
        console.error(`Projection ${name} failed:`, error);
      }
    }
  };
  
  const startContinuousProjection = (intervalMs = 1000) => {
    setInterval(processEvents, intervalMs);
  };
  
  return {
    registerProjection,
    processEvents,
    startContinuousProjection
  };
};

// User List Projection
const userListProjection = {
  eventHandlers: {
    USER_CREATED: async (event, storage) => {
      await storage.users.insert({
        id: event.payload.id,
        email: event.payload.email,
        createdAt: event.timestamp,
        isActive: true
      });
    },
    
    USER_DEACTIVATED: async (event, storage) => {
      await storage.users.update(
        { id: event.payload.id },
        { isActive: false }
      );
    },
    
    USER_EMAIL_CHANGED: async (event, storage) => {
      await storage.users.update(
        { id: event.payload.id },
        { email: event.payload.newEmail }
      );
    }
  }
};
```

## 4. CQRS Implementation

### 4.1 Command Side

```javascript
// Command Bus
const createCommandBus = () => {
  const handlers = new Map();
  const middlewares = [];
  
  const registerHandler = (commandType, handler) => {
    handlers.set(commandType, handler);
  };
  
  const addMiddleware = (middleware) => {
    middlewares.push(middleware);
  };
  
  const execute = async (command) => {
    const handler = handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.type}`);
    }
    
    // Apply middlewares
    const pipeline = middlewares.reduceRight(
      (next, middleware) => (cmd) => middleware(cmd, next),
      handler
    );
    
    return await pipeline(command);
  };
  
  return {
    registerHandler,
    addMiddleware,
    execute
  };
};

// Command Handlers
const createOrderCommandHandlers = (orderRepository, eventBus) => ({
  CREATE_ORDER: async (command) => {
    const order = createOrder()
      .create(command.orderId, command.customerId);
    
    command.items.forEach(item => {
      order.addItem(item.product, item.quantity);
    });
    
    await orderRepository.save(order);
    
    // Publish domain events
    order.getUncommittedEvents().forEach(event => {
      eventBus.publish(event);
    });
    
    return { success: true, orderId: order.getId() };
  },
  
  CONFIRM_ORDER: async (command) => {
    const order = await orderRepository.findById(command.orderId);
    if (!order) throw new Error('Order not found');
    
    order.confirm();
    await orderRepository.save(order);
    
    return { success: true };
  }
});

// Middleware examples
const validationMiddleware = (command, next) => {
  const validation = validateCommand(command);
  if (validation.isLeft()) {
    throw new Error(`Validation failed: ${validation.value}`);
  }
  return next(command);
};

const loggingMiddleware = (logger) => (command, next) => {
  logger.info('Executing command', { type: command.type });
  const start = Date.now();
  
  return next(command).then(result => {
    logger.info('Command executed', { 
      type: command.type,
      duration: Date.now() - start
    });
    return result;
  });
};
```

### 4.2 Query Side

```javascript
// Query Bus
const createQueryBus = () => {
  const handlers = new Map();
  
  const registerHandler = (queryType, handler) => {
    handlers.set(queryType, handler);
  };
  
  const execute = async (query) => {
    const handler = handlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler registered for query: ${query.type}`);
    }
    
    return await handler(query);
  };
  
  return {
    registerHandler,
    execute
  };
};

// Query Handlers
const createOrderQueryHandlers = (readModelStorage) => ({
  GET_ORDER_BY_ID: async (query) => {
    const order = await readModelStorage.orders.findById(query.orderId);
    if (!order) throw new Error('Order not found');
    return order;
  },
  
  GET_ORDERS_BY_CUSTOMER: async (query) => {
    return await readModelStorage.orders.findByCustomerId(
      query.customerId,
      {
        limit: query.limit || 20,
        offset: query.offset || 0
      }
    );
  },
  
  GET_ORDER_STATISTICS: async (query) => {
    const { startDate, endDate } = query;
    return await readModelStorage.orderStats.getStatistics(startDate, endDate);
  }
});

// Read Model Views
const createOrderViews = (db) => ({
  orderSummary: {
    findById: async (id) => {
      return await db.query(`
        SELECT o.id, o.customer_id, o.status, o.total,
               COUNT(oi.id) as item_count,
               o.created_at, o.confirmed_at
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1
        GROUP BY o.id
      `, [id]);
    },
    
    findByCustomer: async (customerId, pagination) => {
      return await db.query(`
        SELECT o.id, o.status, o.total, o.created_at
        FROM orders o
        WHERE o.customer_id = $1
        ORDER BY o.created_at DESC
        LIMIT $2 OFFSET $3
      `, [customerId, pagination.limit, pagination.offset]);
    }
  },
  
  orderDetails: {
    findById: async (id) => {
      const order = await db.query(`
        SELECT * FROM orders WHERE id = $1
      `, [id]);
      
      const items = await db.query(`
        SELECT * FROM order_items WHERE order_id = $1
      `, [id]);
      
      return {
        ...order[0],
        items
      };
    }
  }
});
```

## 5. Integration Patterns

### 5.1 Saga Pattern

```javascript
// Saga Implementation
const createSaga = (steps) => {
  let currentStep = 0;
  let completedSteps = [];
  let compensation = [];
  
  const execute = async (context) => {
    try {
      for (let i = currentStep; i < steps.length; i++) {
        const step = steps[i];
        
        console.log(`Executing step ${i}: ${step.name}`);
        
        const result = await step.execute(context);
        
        completedSteps.push({ step: i, result });
        compensation.unshift(step.compensate);
        currentStep = i + 1;
        
        context = { ...context, ...result };
      }
      
      return { success: true, context };
    } catch (error) {
      console.log(`Step ${currentStep} failed, starting compensation`);
      
      // Execute compensation in reverse order
      for (const compensateFn of compensation) {
        try {
          await compensateFn(context);
        } catch (compensationError) {
          console.error('Compensation failed:', compensationError);
        }
      }
      
      return { success: false, error, context };
    }
  };
  
  return { execute };
};

// Order Processing Saga
const createOrderProcessingSaga = (services) => {
  const steps = [
    {
      name: 'Reserve Inventory',
      execute: async (context) => {
        const reservation = await services.inventory.reserve(
          context.orderId,
          context.items
        );
        return { reservationId: reservation.id };
      },
      compensate: async (context) => {
        if (context.reservationId) {
          await services.inventory.cancelReservation(context.reservationId);
        }
      }
    },
    
    {
      name: 'Process Payment',
      execute: async (context) => {
        const payment = await services.payment.charge(
          context.customerId,
          context.amount
        );
        return { paymentId: payment.id };
      },
      compensate: async (context) => {
        if (context.paymentId) {
          await services.payment.refund(context.paymentId);
        }
      }
    },
    
    {
      name: 'Confirm Order',
      execute: async (context) => {
        await services.orders.confirm(context.orderId);
        return {};
      },
      compensate: async (context) => {
        await services.orders.cancel(context.orderId);
      }
    }
  ];
  
  return createSaga(steps);
};
```

### 5.2 Event-Driven Integration

```javascript
// Event-driven microservices integration
const createEventDrivenIntegration = (eventBus, services) => {
  // Order Events
  eventBus.subscribe('ORDER_CREATED', async (event) => {
    // Start inventory reservation
    await services.inventory.startReservation({
      orderId: event.payload.orderId,
      items: event.payload.items
    });
  });
  
  eventBus.subscribe('INVENTORY_RESERVED', async (event) => {
    // Process payment
    await services.payment.processPayment({
      orderId: event.payload.orderId,
      amount: event.payload.amount
    });
  });
  
  eventBus.subscribe('PAYMENT_PROCESSED', async (event) => {
    // Confirm order
    await services.orders.confirmOrder(event.payload.orderId);
  });
  
  // Error handling
  eventBus.subscribe('INVENTORY_RESERVATION_FAILED', async (event) => {
    await services.orders.cancelOrder(event.payload.orderId);
  });
  
  eventBus.subscribe('PAYMENT_FAILED', async (event) => {
    await services.inventory.cancelReservation(event.payload.orderId);
    await services.orders.cancelOrder(event.payload.orderId);
  });
};

// Outbox Pattern per affidabilità
const createOutboxProcessor = (db, eventBus) => {
  const processOutboxEvents = async () => {
    const events = await db.query(`
      SELECT * FROM outbox_events 
      WHERE processed_at IS NULL 
      ORDER BY created_at 
      LIMIT 100
    `);
    
    for (const event of events) {
      try {
        await eventBus.publish(JSON.parse(event.event_data));
        
        await db.query(`
          UPDATE outbox_events 
          SET processed_at = NOW() 
          WHERE id = $1
        `, [event.id]);
        
      } catch (error) {
        console.error(`Failed to process outbox event ${event.id}:`, error);
        
        await db.query(`
          UPDATE outbox_events 
          SET retry_count = retry_count + 1,
              last_error = $2
          WHERE id = $1
        `, [event.id, error.message]);
      }
    }
  };
  
  // Process outbox events every 5 seconds
  setInterval(processOutboxEvents, 5000);
  
  return { processOutboxEvents };
};
```

Questo modulo fornisce pattern architetturali completi per applicazioni enterprise utilizzando principi funzionali, coprendo DDD, Event Sourcing, CQRS e integration patterns.
