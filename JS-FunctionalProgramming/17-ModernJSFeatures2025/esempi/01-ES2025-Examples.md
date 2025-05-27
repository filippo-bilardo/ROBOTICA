# Esempi Pratici - ES2022-2025 e Programmazione Funzionale

## 1. Top-level await con Programmazione Funzionale

### Esempio: Configuration Loader Funzionale

```javascript
// config-loader.js - Utilizzo di top-level await
import { pipe } from './utils/functional.js';

// Funzioni pure per processamento configurazione
const validateConfig = (config) => {
  if (!config.apiUrl) throw new Error('apiUrl is required');
  if (!config.environment) throw new Error('environment is required');
  return config;
};

const transformConfig = (config) => ({
  ...config,
  apiUrl: config.apiUrl.endsWith('/') ? config.apiUrl : `${config.apiUrl}/`,
  isProduction: config.environment === 'production',
  timestamp: Date.now()
});

const addDefaults = (config) => ({
  timeout: 5000,
  retries: 3,
  debug: false,
  ...config
});

// Composizione funzionale con top-level await
const config = await pipe(
  fetch('./config.json'),
  response => response.json(),
  validateConfig,
  addDefaults,
  transformConfig
);

// Configurazione disponibile immediatamente per altri moduli
export default config;

// other-module.js - Può importare direttamente
import config from './config-loader.js';
console.log('App starting with config:', config);
```

### Esempio: Async Data Pipeline

```javascript
// data-pipeline.js
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

// Funzioni async pure
const fetchUserData = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return await response.json();
};

const enrichUserData = async (user) => {
  const [profile, preferences] = await Promise.all([
    fetch(`/api/profiles/${user.id}`).then(r => r.json()),
    fetch(`/api/preferences/${user.id}`).then(r => r.json())
  ]);
  
  return { ...user, profile, preferences };
};

const validateUser = (user) => {
  if (!user.email) throw new Error('Invalid user: no email');
  return user;
};

// Top-level await per inizializzazione pipeline
const users = await Promise.all([1, 2, 3, 4, 5].map(async (id) => {
  return pipe(
    await fetchUserData(id),
    validateUser,
    enrichUserData
  );
}));

console.log('Processed users:', users.length);

// Export per altri moduli
export { users };
```

## 2. Record & Tuple per Immutabilità

### Esempio: State Management Immutabile

```javascript
// state-manager.js
// Record & Tuple per immutabilità garantita

// Definizione di record immutabili
const createUser = (name, email, age) => #{
  id: crypto.randomUUID(),
  name,
  email,
  age,
  createdAt: Date.now(),
  isActive: true
};

const createAppState = (users = #[], currentUser = null) => #{
  users,
  currentUser,
  loading: false,
  error: null,
  version: 1
};

// Funzioni pure per aggiornamento stato
const addUser = (state, user) => #{
  ...state,
  users: #[...state.users, user],
  version: state.version + 1
};

const updateUser = (state, userId, updates) => #{
  ...state,
  users: #[
    ...state.users.map(user => 
      user.id === userId ? #{ ...user, ...updates } : user
    )
  ],
  version: state.version + 1
};

const removeUser = (state, userId) => #{
  ...state,
  users: #[...state.users.filter(user => user.id !== userId)],
  version: state.version + 1
};

const setCurrentUser = (state, userId) => #{
  ...state,
  currentUser: state.users.find(user => user.id === userId) || null
};

const setError = (state, error) => #{
  ...state,
  error,
  loading: false
};

const setLoading = (state, loading) => #{
  ...state,
  loading,
  error: null
};

// Reducer funzionale con pattern matching
const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_USER':
      return addUser(state, action.payload);
    case 'UPDATE_USER':
      return updateUser(state, action.payload.id, action.payload.updates);
    case 'REMOVE_USER':
      return removeUser(state, action.payload.id);
    case 'SET_CURRENT_USER':
      return setCurrentUser(state, action.payload.id);
    case 'SET_ERROR':
      return setError(state, action.payload.error);
    case 'SET_LOADING':
      return setLoading(state, action.payload.loading);
    default:
      return state;
  }
};

// Store con immutabilità garantita
class FunctionalStore {
  constructor(initialState, reducer) {
    this._state = initialState;
    this._reducer = reducer;
    this._listeners = new Set();
  }

  getState() {
    return this._state;
  }

  dispatch(action) {
    const newState = this._reducer(this._state, action);
    
    // Record & Tuple garantiscono che non ci siano mutazioni accidentali
    if (newState !== this._state) {
      this._state = newState;
      this._listeners.forEach(listener => listener(newState));
    }
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  // Selector memoizzati con Record & Tuple
  createSelector(selectorFn) {
    let lastState = null;
    let lastResult = null;

    return () => {
      const currentState = this._state;
      
      // Record & Tuple permettono confronto per valore
      if (currentState !== lastState) {
        lastState = currentState;
        lastResult = selectorFn(currentState);
      }
      
      return lastResult;
    };
  }
}

// Utilizzo
const initialState = createAppState();
const store = new FunctionalStore(initialState, reducer);

// Selectors
const getUsersSelector = store.createSelector(state => state.users);
const getCurrentUserSelector = store.createSelector(state => state.currentUser);
const getActiveUsersSelector = store.createSelector(
  state => state.users.filter(user => user.isActive)
);

// Test del sistema
const user1 = createUser('Alice', 'alice@example.com', 30);
const user2 = createUser('Bob', 'bob@example.com', 25);

store.dispatch({ type: 'ADD_USER', payload: user1 });
store.dispatch({ type: 'ADD_USER', payload: user2 });
store.dispatch({ type: 'SET_CURRENT_USER', payload: { id: user1.id } });

console.log('Current state:', store.getState());
console.log('Active users:', getActiveUsersSelector());
```

### Esempio: Configurazione Immutabile

```javascript
// config-system.js
// Sistema di configurazione con Record & Tuple

const createConfigSection = (name, values) => #{
  name,
  values: #{...values},
  lastModified: Date.now()
};

const createConfig = (...sections) => #{
  sections: #[...sections],
  created: Date.now(),
  hash: crypto.randomUUID()
};

// Funzioni pure per manipolazione configurazione
const updateConfigSection = (config, sectionName, updates) => #{
  ...config,
  sections: #[
    ...config.sections.map(section =>
      section.name === sectionName
        ? #{ ...section, values: #{...section.values, ...updates}, lastModified: Date.now() }
        : section
    )
  ]
};

const addConfigSection = (config, section) => #{
  ...config,
  sections: #[...config.sections, section]
};

const removeConfigSection = (config, sectionName) => #{
  ...config,
  sections: #[...config.sections.filter(section => section.name !== sectionName)]
};

// Validazione configurazione
const validateConfig = (config) => {
  const requiredSections = #['database', 'api', 'security'];
  const presentSections = #[...config.sections.map(s => s.name)];
  
  const missingSections = #[
    ...requiredSections.filter(req => !presentSections.includes(req))
  ];
  
  if (missingSections.length > 0) {
    throw new Error(`Missing required sections: ${missingSections.join(', ')}`);
  }
  
  return config;
};

// Builder pattern funzionale
class ConfigBuilder {
  constructor() {
    this.config = createConfig();
  }

  database(host, port, name) {
    this.config = addConfigSection(
      this.config,
      createConfigSection('database', { host, port, name })
    );
    return this;
  }

  api(baseUrl, timeout, apiKey) {
    this.config = addConfigSection(
      this.config,
      createConfigSection('api', { baseUrl, timeout, apiKey })
    );
    return this;
  }

  security(secretKey, jwtExpiry, corsOrigins) {
    this.config = addConfigSection(
      this.config,
      createConfigSection('security', { secretKey, jwtExpiry, corsOrigins })
    );
    return this;
  }

  build() {
    return validateConfig(this.config);
  }
}

// Utilizzo
const appConfig = new ConfigBuilder()
  .database('localhost', 5432, 'myapp')
  .api('https://api.example.com', 5000, 'abc123')
  .security('secret-key', '24h', #['http://localhost:3000'])
  .build();

console.log('Configuration built:', appConfig);

// La configurazione è completamente immutabile
// Tentativo di modifica non avrà effetto
try {
  appConfig.sections[0].values.host = 'hacked'; // Non funziona con Record & Tuple
} catch (error) {
  console.log('Configuration is immutable:', error);
}
```

## 3. Pattern Matching Avanzato

### Esempio: HTTP Response Handler

```javascript
// response-handler.js
// Pattern matching per gestione risposte HTTP

// Utilizzo di pattern matching (proposal)
const handleResponse = (response) => {
  return match (response) {
    when ({ status: 200, data }) => ({
      success: true,
      data,
      message: 'Request successful'
    }),
    
    when ({ status: 201, data }) => ({
      success: true,
      data,
      message: 'Resource created successfully'
    }),
    
    when ({ status: 400, error }) => ({
      success: false,
      error,
      message: 'Bad request'
    }),
    
    when ({ status: 401 }) => ({
      success: false,
      error: 'Unauthorized',
      message: 'Please log in'
    }),
    
    when ({ status: 404 }) => ({
      success: false,
      error: 'Not found',
      message: 'Resource not found'
    }),
    
    when ({ status: (s) if s >= 500 }) => ({
      success: false,
      error: 'Server error',
      message: 'Internal server error'
    }),
    
    when (_) => ({
      success: false,
      error: 'Unknown status',
      message: 'Unexpected response'
    })
  };
};

// Pattern matching per validazione dati
const validateUser = (user) => {
  return match (user) {
    when ({ name: String, email: /\S+@\S+\.\S+/, age: Number if age >= 18 }) => 
      ({ valid: true, user }),
    
    when ({ name: String, email: String, age: Number if age < 18 }) => 
      ({ valid: false, error: 'User must be 18 or older' }),
    
    when ({ email: /\S+@\S+\.\S+/ }) => 
      ({ valid: false, error: 'Name and age are required' }),
    
    when ({ name: String }) => 
      ({ valid: false, error: 'Valid email is required' }),
    
    when (_) => 
      ({ valid: false, error: 'Invalid user data' })
  };
};

// API client con pattern matching
class APIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(method, path, data = null) {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : null
      });

      const responseData = await response.json();
      
      return handleResponse({
        status: response.status,
        data: responseData,
        error: responseData.error
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Network error'
      };
    }
  }

  // CRUD operations con pattern matching
  async get(path) {
    const result = await this.request('GET', path);
    
    return match (result) {
      when ({ success: true, data }) => data,
      when ({ success: false, error }) => { throw new Error(error); }
    };
  }

  async post(path, data) {
    const validation = validateUser(data);
    
    return match (validation) {
      when ({ valid: true, user }) => this.request('POST', path, user),
      when ({ valid: false, error }) => Promise.reject(new Error(error))
    };
  }
}

// Utilizzo
const api = new APIClient('https://api.example.com');

try {
  const users = await api.get('/users');
  console.log('Users:', users);
  
  const newUser = await api.post('/users', {
    name: 'Alice',
    email: 'alice@example.com',
    age: 25
  });
  console.log('Created user:', newUser);
} catch (error) {
  console.error('API Error:', error.message);
}
```

### Esempio: State Machine con Pattern Matching

```javascript
// state-machine.js
// State machine funzionale con pattern matching

const createState = (name, data = {}) => ({ name, data });

const createTransition = (from, to, event, guard = () => true) => ({
  from, to, event, guard
});

class FunctionalStateMachine {
  constructor(initialState, transitions) {
    this.state = initialState;
    this.transitions = transitions;
    this.listeners = new Set();
  }

  transition(event, payload = {}) {
    const currentStateName = this.state.name;
    
    // Pattern matching per trovare transizione valida
    const validTransition = match (event) {
      when (e) if (this.transitions.some(t => 
        t.from === currentStateName && 
        t.event === e && 
        t.guard(this.state, payload)
      )) => this.transitions.find(t => 
        t.from === currentStateName && 
        t.event === e && 
        t.guard(this.state, payload)
      ),
      
      when (_) => null
    };

    if (validTransition) {
      const newState = createState(validTransition.to, {
        ...this.state.data,
        ...payload,
        lastTransition: {
          from: currentStateName,
          to: validTransition.to,
          event,
          timestamp: Date.now()
        }
      });

      this.state = newState;
      this.listeners.forEach(listener => listener(newState, event));
      return newState;
    }

    throw new Error(`Invalid transition: ${event} from ${currentStateName}`);
  }

  can(event) {
    return this.transitions.some(t => 
      t.from === this.state.name && 
      t.event === event && 
      t.guard(this.state)
    );
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Pattern matching per stato corrente
  when(patterns) {
    return match (this.state) {
      ...patterns
    };
  }
}

// Esempio: Order State Machine
const orderStates = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const orderTransitions = [
  createTransition(orderStates.PENDING, orderStates.CONFIRMED, 'confirm'),
  createTransition(orderStates.PENDING, orderStates.CANCELLED, 'cancel'),
  createTransition(orderStates.CONFIRMED, orderStates.SHIPPED, 'ship'),
  createTransition(orderStates.CONFIRMED, orderStates.CANCELLED, 'cancel'),
  createTransition(orderStates.SHIPPED, orderStates.DELIVERED, 'deliver'),
  createTransition(orderStates.SHIPPED, orderStates.CANCELLED, 'cancel', 
    (state) => state.data.canCancelShipped || false)
];

const order = new FunctionalStateMachine(
  createState(orderStates.PENDING, { 
    orderId: 'ORD-001',
    amount: 99.99,
    items: ['item1', 'item2']
  }),
  orderTransitions
);

// Pattern matching per business logic
const getOrderActions = (orderStateMachine) => {
  return orderStateMachine.when({
    when ({ name: 'pending' }) => ['confirm', 'cancel'],
    when ({ name: 'confirmed' }) => ['ship', 'cancel'],
    when ({ name: 'shipped' }) => ['deliver'],
    when ({ name: 'delivered' }) => [],
    when ({ name: 'cancelled' }) => [],
    when (_) => []
  });
};

const getOrderStatus = (orderStateMachine) => {
  return orderStateMachine.when({
    when ({ name: 'pending' }) => 'Order is being processed',
    when ({ name: 'confirmed' }) => 'Order confirmed and preparing to ship',
    when ({ name: 'shipped' }) => 'Order is on the way',
    when ({ name: 'delivered' }) => 'Order has been delivered',
    when ({ name: 'cancelled' }) => 'Order has been cancelled',
    when (_) => 'Unknown status'
  });
};

// Utilizzo
console.log('Initial actions:', getOrderActions(order));
console.log('Initial status:', getOrderStatus(order));

order.transition('confirm');
console.log('After confirm:', getOrderActions(order));

order.transition('ship');
console.log('After ship:', getOrderActions(order));

order.transition('deliver');
console.log('Final status:', getOrderStatus(order));
```

## 4. Pipeline Operator e Composizione

### Esempio: Data Processing Pipeline

```javascript
// data-pipeline.js
// Utilizzo del pipeline operator (proposal)

// Funzioni pure per elaborazione dati
const parseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const validateRequired = (fields) => (obj) => {
  if (!obj) return null;
  const missing = fields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  return obj;
};

const transform = (transformers) => (obj) => {
  if (!obj) return null;
  return Object.entries(transformers).reduce(
    (acc, [key, transformer]) => ({
      ...acc,
      [key]: transformer(obj[key])
    }),
    obj
  );
};

const filter = (predicate) => (items) => items.filter(predicate);
const map = (fn) => (items) => items.map(fn);
const sortBy = (key) => (items) => [...items].sort((a, b) => a[key] - b[key]);
const take = (n) => (items) => items.slice(0, n);

// Pipeline con nuovo operator |> (proposal)
const processUserData = (rawData) => {
  return rawData
    |> parseJSON
    |> validateRequired(['id', 'name', 'email'])
    |> transform({
        name: name => name.trim().toLowerCase(),
        email: email => email.toLowerCase(),
        createdAt: () => Date.now()
      });
};

const processUserList = (rawUsers) => {
  return rawUsers
    |> map(processUserData)
    |> filter(user => user !== null)
    |> filter(user => user.email.includes('@'))
    |> sortBy('name')
    |> take(10);
};

// Alternativa con funzione pipe (compatibilità attuale)
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

const processUserDataCompat = pipe(
  parseJSON,
  validateRequired(['id', 'name', 'email']),
  transform({
    name: name => name.trim().toLowerCase(),
    email: email => email.toLowerCase(),
    createdAt: () => Date.now()
  })
);

const processUserListCompat = pipe(
  map(processUserDataCompat),
  filter(user => user !== null),
  filter(user => user.email.includes('@')),
  sortBy('name'),
  take(10)
);

// Esempio di utilizzo
const rawUserData = [
  '{"id":1,"name":" Alice ","email":"ALICE@EXAMPLE.COM"}',
  '{"id":2,"name":"Bob","email":"bob@example.com"}',
  '{"id":3,"name":"Charlie"}', // Missing email
  'invalid json',
  '{"id":4,"name":"Diana","email":"diana@example.com"}'
];

console.log('Processed users:', processUserListCompat(rawUserData));
```

### Esempio: Async Pipeline

```javascript
// async-pipeline.js
// Pipeline asincrono con error handling

const asyncPipe = (...fns) => (value) => 
  fns.reduce(async (acc, fn) => fn(await acc), Promise.resolve(value));

const asyncMap = (asyncFn) => async (items) => 
  Promise.all(items.map(asyncFn));

const asyncFilter = (asyncPredicate) => async (items) => {
  const results = await Promise.all(
    items.map(async item => ({
      item,
      keep: await asyncPredicate(item)
    }))
  );
  return results.filter(({ keep }) => keep).map(({ item }) => item);
};

const retry = (times, delay = 1000) => (asyncFn) => async (...args) => {
  for (let i = 0; i < times; i++) {
    try {
      return await asyncFn(...args);
    } catch (error) {
      if (i === times - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const withTimeout = (ms) => (asyncFn) => async (...args) => {
  return Promise.race([
    asyncFn(...args),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
};

// API functions
const fetchUser = async (id) => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error(`User ${id} not found`);
  return response.json();
};

const enrichWithProfile = async (user) => {
  const profile = await fetch(`/api/profiles/${user.id}`).then(r => r.json());
  return { ...user, profile };
};

const validateUser = async (user) => {
  if (!user.email || !user.name) {
    throw new Error('Invalid user data');
  }
  return user;
};

const saveToCache = async (user) => {
  await fetch('/api/cache', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  return user;
};

// Pipeline asincrono con error handling
const processUsers = asyncPipe(
  asyncMap(retry(3)(withTimeout(5000)(fetchUser))),
  asyncFilter(async user => {
    try {
      await validateUser(user);
      return true;
    } catch {
      return false;
    }
  }),
  asyncMap(enrichWithProfile),
  asyncMap(saveToCache)
);

// Utilizzo
const userIds = [1, 2, 3, 4, 5];

try {
  const processedUsers = await processUsers(userIds);
  console.log('Successfully processed users:', processedUsers.length);
} catch (error) {
  console.error('Pipeline failed:', error.message);
}

// Pipeline con monitoraggio
const withLogging = (name) => (fn) => async (...args) => {
  console.log(`Starting ${name}...`);
  const start = performance.now();
  try {
    const result = await fn(...args);
    const duration = performance.now() - start;
    console.log(`✅ ${name} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.log(`❌ ${name} failed after ${duration.toFixed(2)}ms:`, error.message);
    throw error;
  }
};

const monitoredProcessUsers = asyncPipe(
  withLogging('Fetch Users')(asyncMap(fetchUser)),
  withLogging('Validate Users')(asyncFilter(async user => {
    await validateUser(user);
    return true;
  })),
  withLogging('Enrich Users')(asyncMap(enrichWithProfile)),
  withLogging('Cache Users')(asyncMap(saveToCache))
);

// Test con monitoraggio
await monitoredProcessUsers([1, 2, 3]);
```

## 5. Temporal API per Date/Time Funzionale

### Esempio: Date Range Operations

```javascript
// temporal-date-operations.js
// Operazioni funzionali con Temporal API

import { Temporal } from '@js-temporal/polyfill';

// Funzioni pure per manipolazione date
const createDateRange = (start, end) => ({
  start: Temporal.PlainDate.from(start),
  end: Temporal.PlainDate.from(end)
});

const isDateInRange = (range) => (date) => {
  const checkDate = Temporal.PlainDate.from(date);
  return Temporal.PlainDate.compare(checkDate, range.start) >= 0 &&
         Temporal.PlainDate.compare(checkDate, range.end) <= 0;
};

const addDays = (days) => (date) => 
  Temporal.PlainDate.from(date).add({ days });

const addMonths = (months) => (date) => 
  Temporal.PlainDate.from(date).add({ months });

const getWeekday = (date) => 
  Temporal.PlainDate.from(date).dayOfWeek;

const isWeekend = (date) => {
  const weekday = getWeekday(date);
  return weekday === 6 || weekday === 7; // Saturday or Sunday
};

const formatDate = (format) => (date) => {
  const plainDate = Temporal.PlainDate.from(date);
  switch (format) {
    case 'iso':
      return plainDate.toString();
    case 'short':
      return plainDate.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    case 'long':
      return plainDate.toLocaleString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    default:
      return plainDate.toString();
  }
};

// Generatori per sequenze di date
function* dateRange(start, end, step = { days: 1 }) {
  let current = Temporal.PlainDate.from(start);
  const endDate = Temporal.PlainDate.from(end);
  
  while (Temporal.PlainDate.compare(current, endDate) <= 0) {
    yield current;
    current = current.add(step);
  }
}

function* businessDays(start, end) {
  for (const date of dateRange(start, end)) {
    if (!isWeekend(date)) {
      yield date;
    }
  }
}

// Funzioni di aggregazione temporale
const groupByMonth = (dates) => {
  return dates.reduce((groups, date) => {
    const plainDate = Temporal.PlainDate.from(date);
    const monthKey = `${plainDate.year}-${plainDate.month.toString().padStart(2, '0')}`;
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(plainDate);
    
    return groups;
  }, {});
};

const groupByWeek = (dates) => {
  return dates.reduce((groups, date) => {
    const plainDate = Temporal.PlainDate.from(date);
    const monday = plainDate.subtract({ days: plainDate.dayOfWeek - 1 });
    const weekKey = monday.toString();
    
    if (!groups[weekKey]) {
      groups[weekKey] = [];
    }
    groups[weekKey].push(plainDate);
    
    return groups;
  }, {});
};

// Business logic con Temporal
class WorkScheduler {
  constructor(workingHours = { start: 9, end: 17 }, timezone = 'America/New_York') {
    this.workingHours = workingHours;
    this.timezone = timezone;
  }

  createBusinessDateTime = (date, hour) => {
    return Temporal.PlainDate.from(date)
      .toPlainDateTime(Temporal.PlainTime.from({ hour }))
      .toZonedDateTime(this.timezone);
  };

  isBusinessHour = (zonedDateTime) => {
    const hour = zonedDateTime.hour;
    return hour >= this.workingHours.start && hour < this.workingHours.end;
  };

  getNextBusinessDay = (fromDate) => {
    let nextDay = Temporal.PlainDate.from(fromDate).add({ days: 1 });
    while (isWeekend(nextDay)) {
      nextDay = nextDay.add({ days: 1 });
    }
    return nextDay;
  };

  scheduleTask = (fromDateTime, durationMinutes) => {
    const startZoned = Temporal.ZonedDateTime.from(fromDateTime);
    const duration = Temporal.Duration.from({ minutes: durationMinutes });
    
    if (!this.isBusinessHour(startZoned)) {
      // Schedule for next business day at start of business hours
      const nextBusinessDay = this.getNextBusinessDay(startZoned.toPlainDate());
      const newStart = this.createBusinessDateTime(nextBusinessDay, this.workingHours.start);
      return this.scheduleTask(newStart, durationMinutes);
    }
    
    const endTime = startZoned.add(duration);
    
    // Check if task extends beyond business hours
    if (endTime.hour >= this.workingHours.end) {
      // Split task: remainder goes to next business day
      const remainingMinutes = endTime.since(
        this.createBusinessDateTime(startZoned.toPlainDate(), this.workingHours.end)
      ).total({ unit: 'minutes' });
      
      const todayEnd = this.createBusinessDateTime(startZoned.toPlainDate(), this.workingHours.end);
      const nextBusinessDay = this.getNextBusinessDay(startZoned.toPlainDate());
      const tomorrowContinuation = this.scheduleTask(
        this.createBusinessDateTime(nextBusinessDay, this.workingHours.start),
        remainingMinutes
      );
      
      return [
        { start: startZoned, end: todayEnd },
        ...tomorrowContinuation
      ];
    }
    
    return [{ start: startZoned, end: endTime }];
  };

  // Calculate business hours between two dates
  calculateBusinessHours = (startDateTime, endDateTime) => {
    const start = Temporal.ZonedDateTime.from(startDateTime);
    const end = Temporal.ZonedDateTime.from(endDateTime);
    
    let totalMinutes = 0;
    const startDate = start.toPlainDate();
    const endDate = end.toPlainDate();
    
    for (const date of businessDays(startDate, endDate)) {
      const dayStart = this.createBusinessDateTime(date, this.workingHours.start);
      const dayEnd = this.createBusinessDateTime(date, this.workingHours.end);
      
      const actualStart = Temporal.ZonedDateTime.compare(start, dayStart) > 0 ? start : dayStart;
      const actualEnd = Temporal.ZonedDateTime.compare(end, dayEnd) < 0 ? end : dayEnd;
      
      if (Temporal.ZonedDateTime.compare(actualStart, actualEnd) < 0) {
        const dayMinutes = actualEnd.since(actualStart).total({ unit: 'minutes' });
        totalMinutes += dayMinutes;
      }
    }
    
    return Temporal.Duration.from({ minutes: totalMinutes });
  };
}

// Utilizzo del scheduler
const scheduler = new WorkScheduler();

// Schedule a 3-hour task starting Friday at 4 PM
const taskStart = Temporal.ZonedDateTime.from('2024-01-05T16:00:00[America/New_York]');
const taskSlots = scheduler.scheduleTask(taskStart, 180); // 3 hours

console.log('Task scheduled in slots:');
taskSlots.forEach((slot, index) => {
  console.log(`Slot ${index + 1}: ${formatDate('long')(slot.start.toPlainDate())} 
    from ${slot.start.toPlainTime()} to ${slot.end.toPlainTime()}`);
});

// Calculate business hours in a period
const periodStart = Temporal.ZonedDateTime.from('2024-01-01T09:00:00[America/New_York]');
const periodEnd = Temporal.ZonedDateTime.from('2024-01-15T17:00:00[America/New_York]');
const businessHours = scheduler.calculateBusinessHours(periodStart, periodEnd);

console.log(`Business hours in period: ${businessHours.total({ unit: 'hours' })} hours`);

// Date range operations
const january2024 = createDateRange('2024-01-01', '2024-01-31');
const importantDates = [
  '2024-01-01', '2024-01-15', '2024-01-31', '2024-02-01'
];

const datesInJanuary = importantDates
  .filter(isDateInRange(january2024))
  .map(formatDate('long'));

console.log('Dates in January 2024:', datesInJanuary);

// Group dates by week
const randomDates = Array.from({ length: 20 }, (_, i) => 
  addDays(i * 3)('2024-01-01')
);

const weekGroups = groupByWeek(randomDates);
console.log('Grouped by week:', weekGroups);
```

Questi esempi dimostrano l'utilizzo pratico delle nuove funzionalità JavaScript 2022-2025 con paradigmi di programmazione funzionale, mostrando come le nuove API possano rendere il codice più espressivo, sicuro e maintainibile.
