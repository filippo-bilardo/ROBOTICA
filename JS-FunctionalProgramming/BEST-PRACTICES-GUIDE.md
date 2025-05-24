# Best Practices per Programmazione Funzionale in JavaScript

## 1. Principi Fondamentali

### 1.1 Purezza delle Funzioni

```javascript
// ❌ Impura - modifica stato esterno
let counter = 0;
function incrementCounter() {
  counter++;
  return counter;
}

// ✅ Pura - nessun side effect
function increment(value) {
  return value + 1;
}

// ✅ Gestione stato immutabile
function updateCounter(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, counter: state.counter + 1 };
    case 'DECREMENT':
      return { ...state, counter: state.counter - 1 };
    default:
      return state;
  }
}
```

### 1.2 Immutabilità Rigorosa

```javascript
// ❌ Mutazione diretta
function addItem(array, item) {
  array.push(item);
  return array;
}

// ✅ Immutabilità preservata
function addItem(array, item) {
  return [...array, item];
}

// ✅ Nested object immutability
function updateUser(user, updates) {
  return {
    ...user,
    profile: {
      ...user.profile,
      ...updates
    }
  };
}

// ✅ Utilizzo librerie per deep immutability
import { produce } from 'immer';

function updateNestedState(state, path, value) {
  return produce(state, draft => {
    draft[path[0]][path[1]] = value;
  });
}
```

## 2. Composizione di Funzioni

### 2.1 Pipeline Readable

```javascript
import { pipe, map, filter, reduce } from 'ramda';

// ✅ Pipeline chiara e leggibile
const processUsers = pipe(
  filter(user => user.isActive),
  map(user => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`
  })),
  filter(user => user.age >= 18),
  reduce((acc, user) => acc + user.salary, 0)
);

// ✅ Composizione modulare
const isAdult = user => user.age >= 18;
const isActive = user => user.isActive;
const addFullName = user => ({
  ...user,
  fullName: `${user.firstName} ${user.lastName}`
});
const sumSalaries = reduce((acc, user) => acc + user.salary, 0);

const processUsers = pipe(
  filter(isActive),
  map(addFullName),
  filter(isAdult),
  sumSalaries
);
```

### 2.2 Currying Strategico

```javascript
// ✅ Currying per riusabilità
const fetchWithConfig = curry((config, url) => 
  fetch(url, config).then(res => res.json())
);

const fetchJSON = fetchWithConfig({
  headers: { 'Content-Type': 'application/json' }
});

const fetchWithAuth = fetchWithConfig({
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

// ✅ Composizione di funzioni curried
const logAndFetch = pipe(
  tap(url => console.log(`Fetching: ${url}`)),
  fetchJSON
);
```

## 3. Error Handling Funzionale

### 3.1 Either/Maybe Patterns

```javascript
// Result type implementation
const Result = {
  Ok: (value) => ({ isOk: true, value, isErr: false }),
  Err: (error) => ({ isOk: false, isErr: true, error }),
  
  map: curry((fn, result) => 
    result.isOk ? Result.Ok(fn(result.value)) : result
  ),
  
  flatMap: curry((fn, result) =>
    result.isOk ? fn(result.value) : result
  ),
  
  fold: curry((onErr, onOk, result) =>
    result.isOk ? onOk(result.value) : onErr(result.error)
  )
};

// ✅ Error handling senza exceptions
const parseJSON = (str) => {
  try {
    return Result.Ok(JSON.parse(str));
  } catch (error) {
    return Result.Err(error.message);
  }
};

const processData = pipe(
  parseJSON,
  Result.map(data => data.users),
  Result.map(filter(user => user.isActive)),
  Result.fold(
    error => console.error('Processing failed:', error),
    users => console.log('Processed users:', users)
  )
);
```

### 3.2 Validation Chains

```javascript
// Validation helpers
const validate = (predicate, errorMessage) => (value) =>
  predicate(value) ? Result.Ok(value) : Result.Err(errorMessage);

const required = validate(x => x != null, 'Field is required');
const minLength = (min) => validate(
  x => x.length >= min, 
  `Minimum length is ${min}`
);
const email = validate(
  x => x.includes('@'), 
  'Invalid email format'
);

// ✅ Composable validation
const validateUser = (userData) => {
  return Result.Ok(userData)
    .flatMap(data => required(data.email).map(() => data))
    .flatMap(data => email(data.email).map(() => data))
    .flatMap(data => required(data.name).map(() => data))
    .flatMap(data => minLength(2)(data.name).map(() => data));
};
```

## 4. Performance Optimization

### 4.1 Lazy Evaluation

```javascript
// ✅ Lazy sequences
function* lazyMap(fn, iterable) {
  for (const item of iterable) {
    yield fn(item);
  }
}

function* lazyFilter(predicate, iterable) {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

function* lazyTake(n, iterable) {
  let count = 0;
  for (const item of iterable) {
    if (count >= n) break;
    yield item;
    count++;
  }
}

// Utilizzo efficiente
const processLargeDataset = (data) => {
  return lazyTake(10,
    lazyFilter(isExpensive,
      lazyMap(transform, data)
    )
  );
};
```

### 4.2 Memoization Intelligente

```javascript
// ✅ Memoization con cache LRU
const createMemoized = (fn, { maxSize = 100, ttl = 60000 } = {}) => {
  const cache = new Map();
  const accessTimes = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    const now = Date.now();
    
    // Check cache hit
    if (cache.has(key)) {
      const { value, timestamp } = cache.get(key);
      if (now - timestamp < ttl) {
        accessTimes.set(key, now);
        return value;
      }
      cache.delete(key);
      accessTimes.delete(key);
    }
    
    // Evict oldest if cache full
    if (cache.size >= maxSize) {
      const oldestKey = [...accessTimes.entries()]
        .sort(([,a], [,b]) => a - b)[0][0];
      cache.delete(oldestKey);
      accessTimes.delete(oldestKey);
    }
    
    // Compute and cache
    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });
    accessTimes.set(key, now);
    
    return result;
  };
};
```

## 5. Testing Best Practices

### 5.1 Property-Based Testing

```javascript
import fc from 'fast-check';

// ✅ Test delle proprietà matematiche
describe('Array operations', () => {
  test('map preserves length', () => {
    fc.assert(fc.property(
      fc.array(fc.anything()),
      fc.func(fc.anything()),
      (arr, fn) => {
        expect(arr.map(fn)).toHaveLength(arr.length);
      }
    ));
  });
  
  test('filter reduces or maintains length', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      fc.func(fc.boolean()),
      (arr, predicate) => {
        expect(arr.filter(predicate).length).toBeLessThanOrEqual(arr.length);
      }
    ));
  });
});

// ✅ Test delle leggi funzionali
describe('Functor laws', () => {
  test('identity law', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      (arr) => {
        expect(arr.map(x => x)).toEqual(arr);
      }
    ));
  });
  
  test('composition law', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      (arr) => {
        const f = x => x * 2;
        const g = x => x + 1;
        expect(arr.map(x => g(f(x)))).toEqual(arr.map(f).map(g));
      }
    ));
  });
});
```

### 5.2 Pure Function Testing

```javascript
// ✅ Test isolati per funzioni pure
describe('calculateTax', () => {
  test('should calculate correct tax for different rates', () => {
    expect(calculateTax(100, 0.1)).toBe(10);
    expect(calculateTax(200, 0.2)).toBe(40);
    expect(calculateTax(0, 0.1)).toBe(0);
  });
  
  test('should be deterministic', () => {
    const amount = 150;
    const rate = 0.15;
    const result1 = calculateTax(amount, rate);
    const result2 = calculateTax(amount, rate);
    expect(result1).toBe(result2);
  });
  
  test('should not modify inputs', () => {
    const originalAmount = 100;
    const originalRate = 0.1;
    calculateTax(originalAmount, originalRate);
    expect(originalAmount).toBe(100);
    expect(originalRate).toBe(0.1);
  });
});
```

## 6. Architecture Patterns

### 6.1 Redux-Style State Management

```javascript
// ✅ Pure reducers
const todosReducer = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, {
        id: action.id,
        text: action.text,
        completed: false
      }];
    
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.id
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    
    case 'REMOVE_TODO':
      return state.filter(todo => todo.id !== action.id);
    
    default:
      return state;
  }
};

// ✅ Action creators
const createTodo = (id, text) => ({
  type: 'ADD_TODO',
  id,
  text
});

const toggleTodo = (id) => ({
  type: 'TOGGLE_TODO',
  id
});
```

### 6.2 Command Pattern Funzionale

```javascript
// ✅ Command objects
const commands = {
  updateUser: (userId, updates) => ({
    type: 'UPDATE_USER',
    payload: { userId, updates },
    execute: (state) => ({
      ...state,
      users: state.users.map(user =>
        user.id === userId ? { ...user, ...updates } : user
      )
    }),
    undo: (state, previousState) => ({
      ...state,
      users: previousState.users
    })
  }),
  
  deleteUser: (userId) => ({
    type: 'DELETE_USER',
    payload: { userId },
    execute: (state) => ({
      ...state,
      users: state.users.filter(user => user.id !== userId)
    }),
    undo: (state, previousState) => ({
      ...state,
      users: previousState.users
    })
  })
};
```

## 7. Code Organization

### 7.1 Module Structure

```javascript
// ✅ Functional module organization
// users/index.js
export { 
  createUser,
  updateUser,
  deleteUser,
  findUserById,
  findUsersByRole
} from './user.model.js';

export {
  validateUser,
  validateEmail,
  validateAge
} from './user.validation.js';

export {
  userReducer,
  userSelectors
} from './user.state.js';

// ✅ Barrel exports with clear API
// api/index.js
export { createAPI } from './api.js';
export { createAuthService } from './auth.js';
export { createUserService } from './users.js';
export { createOrderService } from './orders.js';
```

### 7.2 Configuration Management

```javascript
// ✅ Environment-based configuration
const createConfig = (env) => {
  const base = {
    api: {
      timeout: 5000,
      retries: 3
    },
    cache: {
      ttl: 300000,
      maxSize: 1000
    }
  };
  
  const environments = {
    development: {
      ...base,
      api: { ...base.api, baseURL: 'http://localhost:3000' },
      logging: { level: 'debug' }
    },
    
    production: {
      ...base,
      api: { ...base.api, baseURL: 'https://api.example.com' },
      logging: { level: 'error' }
    }
  };
  
  return environments[env] || environments.development;
};
```

## 8. Debugging e Monitoring

### 8.1 Functional Debugging

```javascript
// ✅ Debug utilities
const trace = (label) => (value) => {
  console.log(`${label}:`, value);
  return value;
};

const tap = (fn) => (value) => {
  fn(value);
  return value;
};

// Utilizzo in pipeline
const processData = pipe(
  trace('Input'),
  filter(isValid),
  trace('After filter'),
  map(transform),
  trace('After transform'),
  reduce(accumulate, [])
);

// ✅ Error boundaries per debugging
const safeMap = (fn) => (arr) => {
  try {
    return arr.map((item, index) => {
      try {
        return fn(item);
      } catch (error) {
        console.error(`Error processing item at index ${index}:`, error);
        return item; // or some default value
      }
    });
  } catch (error) {
    console.error('Error in safeMap:', error);
    return arr;
  }
};
```

### 8.2 Performance Monitoring

```javascript
// ✅ Performance decorators
const withTiming = (name) => (fn) => (...args) => {
  const start = performance.now();
  const result = fn(...args);
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

const withMemoryTracking = (name) => (fn) => (...args) => {
  const before = performance.memory?.usedJSHeapSize || 0;
  const result = fn(...args);
  const after = performance.memory?.usedJSHeapSize || 0;
  console.log(`${name} memory delta: ${after - before} bytes`);
  return result;
};

// Utilizzo
const processLargeDataset = pipe(
  withTiming('data-processing'),
  withMemoryTracking('memory-usage'),
  actualProcessingFunction
);
```

## 9. Common Pitfalls da Evitare

### 9.1 Performance Anti-patterns

```javascript
// ❌ Creazione funzioni in render/loop
const Component = ({ items }) => {
  return items.map(item => (
    <Item 
      key={item.id}
      onClick={() => handleClick(item.id)} // ❌ Nuova funzione ogni render
    />
  ));
};

// ✅ Callback stabili
const Component = ({ items, onItemClick }) => {
  return items.map(item => (
    <Item 
      key={item.id}
      onClick={onItemClick}
      itemId={item.id}
    />
  ));
};

// ❌ Excessive chaining senza lazy evaluation
const inefficient = data
  .map(expensiveTransform)      // Elabora tutto
  .filter(complexPredicate)     // Filtra tutto
  .slice(0, 10);               // Prende solo 10

// ✅ Lazy evaluation per grandi dataset
const efficient = pipe(
  lazyMap(expensiveTransform),
  lazyFilter(complexPredicate),
  lazyTake(10),
  Array.from
)(data);
```

### 9.2 Memory Leaks

```javascript
// ❌ Closure che mantengono riferimenti
const createHandler = (largeObject) => {
  return (event) => {
    // Solo event.id è usato, ma largeObject rimane in memoria
    console.log(event.id);
  };
};

// ✅ Estrai solo ciò che serve
const createHandler = (id) => {
  return (event) => {
    console.log(id);
  };
};

// Utilizzo
const handler = createHandler(largeObject.id); // Solo l'ID è mantenuto
```

## 10. Team Guidelines

### 10.1 Code Review Checklist

```markdown
**Functional Programming Review Checklist:**

- [ ] Funzioni sono pure (no side effects)
- [ ] Immutabilità preservata
- [ ] Error handling con Result/Either pattern
- [ ] Composizione preferita all'inheritance
- [ ] Test delle proprietà matematiche
- [ ] Performance considerations documented
- [ ] Naming conventions followed
- [ ] TypeScript types sono precisi
```

### 10.2 Migration Strategy

```javascript
// ✅ Gradual migration approach
// 1. Start with utilities
const utils = {
  pipe,
  compose,
  curry,
  memoize
};

// 2. Convert pure business logic
const businessLogic = {
  calculateTax: pipe(
    validateInput,
    applyTaxRate,
    formatCurrency
  ),
  
  processOrder: pipe(
    validateOrder,
    calculateTotal,
    applyDiscounts,
    formatOrder
  )
};

// 3. Gradually refactor components
// Before: Class component with mutable state
// After: Functional component with hooks/reducers
```

Queste best practices forniscono una guida completa per scrivere codice JavaScript funzionale maintainible, performante e testabile in contesti professionali.
