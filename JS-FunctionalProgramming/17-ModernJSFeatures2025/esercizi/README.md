# Esercizi - JavaScript Moderno 2025 e Programmazione Funzionale

## Esercizio 1: Top-level await e Configuration Management
**Difficoltà: ⭐⭐**

Crea un sistema di gestione configurazione che utilizza top-level await per caricare e validare configurazioni da multiple sorgenti.

### Requisiti:
1. Carica configurazioni da file JSON, variabili ambiente e API remote
2. Implementa validazione funzionale con compose/pipe
3. Usa top-level await per inizializzazione immediata
4. Gestisci errori in modo funzionale

### Template di partenza:

```javascript
// config-loader.js
// TODO: Implementa il loader di configurazione

// Funzioni di validazione
const validateRequired = (fields) => (config) => {
  // TODO: Implementa validazione campi richiesti
};

const validateTypes = (schema) => (config) => {
  // TODO: Implementa validazione tipi
};

const addDefaults = (defaults) => (config) => {
  // TODO: Aggiungi valori di default
};

// Loader per diverse sorgenti
const loadFromFile = async (path) => {
  // TODO: Carica da file JSON
};

const loadFromEnv = (prefix) => {
  // TODO: Carica da variabili ambiente
};

const loadFromAPI = async (url) => {
  // TODO: Carica da API remota
};

// Merger di configurazioni
const mergeConfigs = (...configs) => {
  // TODO: Unisci configurazioni con priorità
};

// Pipeline di configurazione
const createConfigPipeline = (...steps) => {
  // TODO: Implementa pipeline di elaborazione
};

// TODO: Usa top-level await per caricare configurazione
const config = await /* ... */;

export default config;
```

### Test case:
```javascript
// test-config.js
import config from './config-loader.js';

console.assert(config.database.host !== undefined, 'Database host should be defined');
console.assert(config.api.timeout > 0, 'API timeout should be positive');
console.assert(config.features.enableCache === true, 'Cache should be enabled');
```

---

## Esercizio 2: Record & Tuple State Management
**Difficoltà: ⭐⭐⭐**

Implementa un sistema di state management completamente immutabile usando Record & Tuple con pattern funzionali avanzati.

### Requisiti:
1. Crea uno store immutabile con Record & Tuple
2. Implementa reducer funzionale con pattern matching
3. Aggiungi sistema di middleware
4. Implementa selectors memoizzati
5. Gestisci side effects in modo funzionale

### Template di partenza:

```javascript
// state-management.js

// TODO: Definisci tipi di stato con Record & Tuple
const createInitialState = () => #{
  // TODO: Implementa stato iniziale
};

// TODO: Implementa azioni come Record immutabili
const createAction = (type, payload) => #{
  // TODO: Crea azione immutabile
};

// TODO: Reducer con pattern matching
const reducer = (state, action) => {
  // TODO: Implementa reducer funzionale
};

// TODO: Middleware system
const createMiddleware = (middlewareFn) => {
  // TODO: Implementa sistema middleware
};

// TODO: Store immutabile
class ImmutableStore {
  constructor(initialState, reducer, middlewares = []) {
    // TODO: Implementa store
  }

  getState() {
    // TODO: Ritorna stato corrente
  }

  dispatch(action) {
    // TODO: Implementa dispatch con middleware
  }

  subscribe(listener) {
    // TODO: Implementa subscription
  }

  // TODO: Selector memoizzato
  createSelector(selectorFn) {
    // TODO: Implementa selector con memoization
  }
}

// TODO: Actions creators
const actions = {
  addUser: (user) => /* TODO */,
  updateUser: (id, updates) => /* TODO */,
  removeUser: (id) => /* TODO */,
  setFilter: (filter) => /* TODO */
};

// TODO: Selectors
const selectors = {
  getUsers: /* TODO */,
  getActiveUsers: /* TODO */,
  getUsersByRole: (role) => /* TODO */,
  getFilteredUsers: /* TODO */
};
```

### Test case:
```javascript
// test-state.js
const store = new ImmutableStore(createInitialState(), reducer);

// Test immutabilità
const initialState = store.getState();
store.dispatch(actions.addUser({ id: 1, name: 'Alice' }));
console.assert(initialState !== store.getState(), 'State should be immutable');

// Test selectors
const users = selectors.getUsers()(store.getState());
console.assert(Array.isArray(users), 'Users should be array');
```

---

## Esercizio 3: Pattern Matching HTTP Client
**Difficoltà: ⭐⭐⭐**

Crea un HTTP client che utilizza pattern matching per gestire risposte, errori e retry logic in modo funzionale.

### Requisiti:
1. Implementa pattern matching per status codes
2. Gestisci retry automatico con backoff exponential
3. Implementa circuit breaker pattern
4. Usa composizione funzionale per middleware
5. Gestisci timeout e cancellazione

### Template di partenza:

```javascript
// http-client.js

// TODO: Pattern matching per risposte HTTP
const matchResponse = (response) => {
  return match (response) {
    // TODO: Implementa pattern per diversi status codes
  };
};

// TODO: Retry logic funzionale
const createRetryPolicy = (maxRetries, backoffMs) => {
  // TODO: Implementa retry con backoff exponential
};

// TODO: Circuit breaker
class CircuitBreaker {
  constructor(threshold, timeout) {
    // TODO: Implementa circuit breaker
  }

  async execute(fn) {
    // TODO: Esegui con circuit breaker
  }
}

// TODO: HTTP Client funzionale
class FunctionalHttpClient {
  constructor(baseUrl, options = {}) {
    // TODO: Inizializza client
  }

  // TODO: Middleware composition
  use(middleware) {
    // TODO: Aggiungi middleware
  }

  // TODO: Request con pattern matching
  async request(method, path, data, options) {
    // TODO: Implementa request con tutti i pattern
  }

  // TODO: Convenience methods
  get(path, options) {
    // TODO: GET request
  }

  post(path, data, options) {
    // TODO: POST request
  }

  put(path, data, options) {
    // TODO: PUT request
  }

  delete(path, options) {
    // TODO: DELETE request
  }
}

// TODO: Middleware predefiniti
const middlewares = {
  logging: () => /* TODO */,
  authentication: (token) => /* TODO */,
  rateLimiting: (requestsPerSecond) => /* TODO */,
  caching: (ttl) => /* TODO */
};
```

### Test case:
```javascript
// test-http-client.js
const client = new FunctionalHttpClient('https://api.example.com')
  .use(middlewares.logging())
  .use(middlewares.authentication('token-123'));

// Test success case
const result = await client.get('/users/1');
console.assert(result.success === true, 'Should handle success');

// Test error case
try {
  await client.get('/not-found');
} catch (error) {
  console.assert(error.status === 404, 'Should handle 404');
}
```

---

## Esercizio 4: Pipeline Operator e Data Processing
**Difficoltà: ⭐⭐⭐**

Implementa un sistema di data processing che simula il pipeline operator e gestisce trasformazioni complesse di dati.

### Requisiti:
1. Simula pipeline operator per sintassi fluida
2. Implementa operazioni async nella pipeline
3. Gestisci errori e fallback
4. Implementa lazy evaluation
5. Aggiungi monitoring e debugging

### Template di partenza:

```javascript
// data-pipeline.js

// TODO: Pipeline operator simulation
const pipe = (...fns) => {
  // TODO: Implementa pipe sync
};

const asyncPipe = (...fns) => {
  // TODO: Implementa pipe async
};

// TODO: Lazy pipeline
class LazyPipeline {
  constructor(data) {
    // TODO: Inizializza pipeline lazy
  }

  pipe(fn) {
    // TODO: Aggiungi operazione alla pipeline
  }

  execute() {
    // TODO: Esegui pipeline
  }
}

// TODO: Error handling nella pipeline
const withErrorHandling = (handler) => (fn) => {
  // TODO: Wrapper per error handling
};

const withFallback = (fallbackFn) => (fn) => {
  // TODO: Wrapper per fallback
};

// TODO: Monitoring
const withMonitoring = (name) => (fn) => {
  // TODO: Wrapper per monitoring performance
};

// TODO: Transformers predefiniti
const transformers = {
  map: (fn) => /* TODO */,
  filter: (predicate) => /* TODO */,
  reduce: (reducer, initial) => /* TODO */,
  groupBy: (keyFn) => /* TODO */,
  sortBy: (keyFn) => /* TODO */,
  take: (n) => /* TODO */,
  skip: (n) => /* TODO */,
  unique: () => /* TODO */,
  flatten: () => /* TODO */,
  chunk: (size) => /* TODO */
};

// TODO: Async transformers
const asyncTransformers = {
  asyncMap: (asyncFn) => /* TODO */,
  asyncFilter: (asyncPredicate) => /* TODO */,
  asyncReduce: (asyncReducer, initial) => /* TODO */,
  parallel: (concurrency) => /* TODO */,
  batch: (batchSize) => /* TODO */,
  throttle: (ratePerSecond) => /* TODO */
};

// TODO: Data validation
const validators = {
  required: (fields) => /* TODO */,
  type: (expectedType) => /* TODO */,
  range: (min, max) => /* TODO */,
  pattern: (regex) => /* TODO */,
  custom: (validatorFn) => /* TODO */
};
```

### Test case:
```javascript
// test-pipeline.js
const data = [
  { id: 1, name: 'Alice', age: 25, score: 85 },
  { id: 2, name: 'Bob', age: 30, score: 92 },
  { id: 3, name: 'Charlie', age: 22, score: 78 }
];

// Test sync pipeline
const result = pipe(
  transformers.filter(user => user.age >= 25),
  transformers.map(user => ({ ...user, grade: user.score >= 90 ? 'A' : 'B' })),
  transformers.sortBy('score')
)(data);

console.assert(result.length === 2, 'Should filter correctly');

// Test async pipeline
const asyncResult = await asyncPipe(
  asyncTransformers.asyncMap(async user => {
    // Simula API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return user;
  }),
  transformers.take(1)
)(data);

console.assert(asyncResult.length === 1, 'Should take correctly');
```

---

## Esercizio 5: Temporal API Time Management
**Difficoltà: ⭐⭐⭐⭐**

Crea un sistema completo di gestione del tempo usando Temporal API con pattern funzionali per scheduling e business logic.

### Requisiti:
1. Implementa business calendar con festività
2. Gestisci fusi orari multipli
3. Crea scheduler per task ricorrenti
4. Implementa SLA tracking
5. Gestisci time-based permissions

### Template di partenza:

```javascript
// temporal-management.js
import { Temporal } from '@js-temporal/polyfill';

// TODO: Business Calendar
class BusinessCalendar {
  constructor(holidays = [], workingDays = [1,2,3,4,5], workingHours = {start: 9, end: 17}) {
    // TODO: Implementa calendar
  }

  isBusinessDay(date) {
    // TODO: Verifica se è giorno lavorativo
  }

  isBusinessHour(dateTime) {
    // TODO: Verifica se è orario lavorativo
  }

  getNextBusinessDay(fromDate) {
    // TODO: Trova prossimo giorno lavorativo
  }

  calculateBusinessHours(startDateTime, endDateTime) {
    // TODO: Calcola ore lavorative tra due date
  }
}

// TODO: Multi-timezone manager
class TimezoneManager {
  constructor() {
    // TODO: Inizializza manager
  }

  convertTime(dateTime, fromTz, toTz) {
    // TODO: Converti tra timezone
  }

  scheduleGlobalMeeting(participants, duration, preferredTime) {
    // TODO: Trova orario ottimale per meeting globale
  }

  getBusinessOverlap(timezones) {
    // TODO: Trova sovrapposizione ore lavorative
  }
}

// TODO: Task Scheduler
class TaskScheduler {
  constructor(calendar, timezoneManager) {
    // TODO: Inizializza scheduler
  }

  scheduleRecurring(taskDef, startDate, recurrence) {
    // TODO: Programma task ricorrenti
  }

  scheduleDeadlineBased(task, deadline, estimatedDuration) {
    // TODO: Programma task con deadline
  }

  optimizeSchedule(tasks) {
    // TODO: Ottimizza programma task
  }

  getAvailableSlots(date, duration) {
    // TODO: Trova slot disponibili
  }
}

// TODO: SLA Tracker
class SLATracker {
  constructor(slaDefinitions) {
    // TODO: Inizializza tracker
  }

  trackEvent(eventType, timestamp, metadata) {
    // TODO: Traccia evento per SLA
  }

  calculateSLACompliance(period) {
    // TODO: Calcola compliance SLA
  }

  predictSLAViolation(currentEvents) {
    // TODO: Predici violazioni SLA
  }

  generateSLAReport(period) {
    // TODO: Genera report SLA
  }
}

// TODO: Time-based Permissions
class TimeBasedPermissions {
  constructor(permissionRules) {
    // TODO: Inizializza permissions
  }

  checkPermission(user, action, currentTime) {
    // TODO: Verifica permesso temporale
  }

  getPermissionWindow(user, action) {
    // TODO: Ottieni finestra temporale permesso
  }

  schedulePermissionChange(user, action, changeTime, newPermission) {
    // TODO: Programma cambio permesso
  }
}

// TODO: Utility functions
const temporalUtils = {
  createRecurrence: (pattern) => /* TODO */,
  findOptimalTime: (constraints) => /* TODO */,
  calculateDuration: (start, end, options) => /* TODO */,
  formatDuration: (duration, locale) => /* TODO */,
  createTimeRange: (start, end) => /* TODO */,
  intersectTimeRanges: (ranges) => /* TODO */,
  unionTimeRanges: (ranges) => /* TODO */
};
```

### Test case:
```javascript
// test-temporal.js
const calendar = new BusinessCalendar(['2024-01-01', '2024-12-25']);
const timezoneManager = new TimezoneManager();
const scheduler = new TaskScheduler(calendar, timezoneManager);

// Test business day calculation
const businessDay = calendar.getNextBusinessDay('2024-01-06'); // Saturday
console.assert(businessDay.dayOfWeek === 1, 'Should return Monday');

// Test timezone conversion
const nytime = Temporal.ZonedDateTime.from('2024-01-15T14:00:00[America/New_York]');
const londonTime = timezoneManager.convertTime(nytime, 'America/New_York', 'Europe/London');
console.assert(londonTime.hour === 19, 'Should convert correctly');

// Test task scheduling
const task = {
  name: 'Code Review',
  duration: 60, // minutes
  priority: 'high'
};

const slots = scheduler.getAvailableSlots('2024-01-15', 60);
console.assert(slots.length > 0, 'Should find available slots');
```

---

## Esercizio 6: Progetto Integrato - Modern FP Dashboard
**Difficoltà: ⭐⭐⭐⭐⭐**

Crea un dashboard completo che integra tutte le nuove funzionalità JavaScript 2025 con programmazione funzionale.

### Requisiti:
1. Usa top-level await per inizializzazione
2. State management con Record & Tuple
3. HTTP client con pattern matching
4. Data pipeline con operatori moderni
5. Time management con Temporal API
6. Real-time updates con WebSocket
7. Performance monitoring
8. Error boundaries funzionali

### Struttura del progetto:

```
modern-fp-dashboard/
├── src/
│   ├── core/
│   │   ├── config.js          # Top-level await config
│   │   ├── state.js           # Record & Tuple state
│   │   ├── http.js            # Pattern matching client
│   │   └── time.js            # Temporal API utils
│   ├── features/
│   │   ├── analytics/
│   │   ├── monitoring/
│   │   └── scheduling/
│   ├── ui/
│   │   ├── components/
│   │   └── hooks/
│   └── utils/
│       ├── pipeline.js        # Pipeline operators
│       ├── functional.js      # FP utilities
│       └── validation.js      # Validation logic
├── tests/
└── docs/
```

### Template principale:

```javascript
// src/main.js
// TODO: Implementa dashboard principale con tutte le funzionalità

// Top-level await per inizializzazione
const config = await import('./core/config.js');
const { createStore } = await import('./core/state.js');
const { createHttpClient } = await import('./core/http.js');

// TODO: Inizializzazione store
const store = createStore(/* TODO */);

// TODO: HTTP client configurato
const api = createHttpClient(config.apiUrl)
  .use(/* TODO: middleware */);

// TODO: Dashboard app
class ModernFPDashboard {
  constructor(store, api, config) {
    // TODO: Inizializza dashboard
  }

  async initialize() {
    // TODO: Inizializzazione asincrona
  }

  start() {
    // TODO: Avvia dashboard
  }
}

// TODO: Avvia applicazione
const dashboard = new ModernFPDashboard(store, api, config);
await dashboard.initialize();
dashboard.start();
```

### Criteri di valutazione:
- **Funzionalità (30%)**: Implementazione corretta di tutte le features
- **Architettura funzionale (25%)**: Uso appropriato di pattern FP
- **Utilizzo moderno JavaScript (20%)**: Integrazione features ES2025
- **Performance (15%)**: Ottimizzazioni e monitoring
- **Testing (10%)**: Coverage e qualità test

---

## Soluzioni e Suggerimenti

### Suggerimenti generali:
1. **Top-level await**: Usa per inizializzazione asincrona di moduli
2. **Record & Tuple**: Sfrutta l'immutabilità per performance e debugging
3. **Pattern matching**: Usa per gestione complessa di stati e dati
4. **Pipeline operators**: Crea composizioni leggibili e maintainibili
5. **Temporal API**: Preferisci sempre Temporal a Date per nuove applicazioni

### Debugging tips:
1. Usa `console.trace()` nelle pipeline per debug
2. Sfrutta l'immutabilità di Record & Tuple per time-travel debugging
3. Implementa logging funzionale con composizione
4. Usa performance marks per profiling pipeline

### Performance tips:
1. Memoizza selectors con Record & Tuple comparison
2. Usa lazy evaluation nelle pipeline lunghe
3. Implementa batching per operazioni async
4. Monitora memory usage con WeakMap caching

### Testing tips:
1. Testa pure functions isolatamente
2. Usa property-based testing per validare invarianti
3. Mock time con Temporal.now
4. Testa error boundaries con cases limite

---

## Risorse aggiuntive:
- [TC39 Proposals](https://github.com/tc39/proposals)
- [Temporal Cookbook](https://tc39.es/proposal-temporal/docs/cookbook.html)
- [Pattern Matching Examples](https://github.com/tc39/proposal-pattern-matching)
- [Record & Tuple Playground](https://rickbutton.github.io/record-tuple-playground/)
