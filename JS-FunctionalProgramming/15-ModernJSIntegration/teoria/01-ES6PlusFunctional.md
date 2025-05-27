# ES6+ Features per Programmazione Funzionale

## Introduzione

Le caratteristiche moderne di JavaScript (ES6+) offrono strumenti potenti per scrivere codice funzionale più elegante e conciso. Questo modulo esplora come integrare efficacemente i costrutti ES6+ con i principi della programmazione funzionale.

## 1. Arrow Functions e Funzioni Pure

### 1.1 Arrow Functions come Funzioni Pure

```javascript
// Funzioni pure con arrow syntax
const add = (a, b) => a + b;
const multiply = (x) => (y) => x * y;
const square = x => x * x;

// Composizione con arrow functions
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

const calculateTax = pipe(
  x => x * 1.1,           // Aggiungi markup
  x => Math.round(x * 100) / 100,  // Arrotonda
  x => x * 0.22           // Applica tassa
);

console.log(calculateTax(100)); // 24.2
```

### 1.2 Lexical Scope e Closures

```javascript
// Arrow functions preservano il lexical scope
const createCalculator = (baseValue) => ({
  add: (x) => baseValue + x,
  multiply: (x) => baseValue * x,
  pipe: (...operations) => operations.reduce((acc, op) => op(acc), baseValue)
});

const calc = createCalculator(10);
console.log(calc.add(5)); // 15
console.log(calc.multiply(3)); // 30
```

## 2. Destructuring per Data Transformation

### 2.1 Object Destructuring Funzionale

```javascript
// Estrazione di proprietà in stile funzionale
const extractUserInfo = ({ name, email, age, ...rest }) => ({
  displayName: name,
  contact: email,
  isAdult: age >= 18,
  metadata: rest
});

// Destructuring in pipeline
const processUsers = (users) => 
  users
    .map(({ id, profile: { name, email }, settings: { theme = 'light' } }) => ({
      id,
      name,
      email,
      theme
    }))
    .filter(({ name }) => name.length > 2);

const users = [
  { 
    id: 1, 
    profile: { name: 'Alice', email: 'alice@example.com' }, 
    settings: { theme: 'dark' } 
  },
  { 
    id: 2, 
    profile: { name: 'Bob', email: 'bob@example.com' }, 
    settings: {} 
  }
];

console.log(processUsers(users));
```

### 2.2 Array Destructuring e Pattern Matching

```javascript
// Pattern matching con destructuring
const processCoordinates = ([x, y, z = 0]) => ({
  x: x || 0,
  y: y || 0,
  z,
  distance: Math.sqrt(x*x + y*y + z*z)
});

// Head/tail pattern
const [head, ...tail] = [1, 2, 3, 4, 5];
const sum = (arr) => {
  if (arr.length === 0) return 0;
  const [first, ...rest] = arr;
  return first + sum(rest);
};

console.log(sum([1, 2, 3, 4, 5])); // 15
```

## 3. Template Literals per Function Composition

### 3.1 Template Literals Funzionali

```javascript
// Template literals come funzioni
const createTemplate = (template) => (data) => 
  template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || '');

const userTemplate = createTemplate('Hello {{name}}, welcome to {{platform}}!');
const welcomeMessage = userTemplate({ name: 'Alice', platform: 'FunctionalJS' });

// Query builders funzionali
const createQuery = (table) => ({
  select: (fields) => ({
    where: (condition) => ({
      orderBy: (field) => 
        `SELECT ${fields.join(', ')} FROM ${table} WHERE ${condition} ORDER BY ${field}`
    })
  })
});

const query = createQuery('users')
  .select(['name', 'email'])
  .where('age > 18')
  .orderBy('name');

console.log(query); // SELECT name, email FROM users WHERE age > 18 ORDER BY name
```

### 3.2 Tagged Template Literals

```javascript
// SQL builder funzionale
const sql = (strings, ...values) => ({
  query: strings.reduce((acc, str, i) => acc + str + (values[i] || ''), ''),
  execute: (db) => db.query(this.query, values)
});

const getUserQuery = (id) => sql`
  SELECT * FROM users 
  WHERE id = ${id} 
  AND active = true
`;

// HTML builder funzionale
const html = (strings, ...values) => 
  strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');

const createCard = ({ title, content, author }) => html`
  <div class="card">
    <h3>${title}</h3>
    <p>${content}</p>
    <footer>by ${author}</footer>
  </div>
`;
```

## 4. Spread e Rest Operators

### 4.1 Immutable Operations con Spread

```javascript
// Immutable array operations
const append = (arr, item) => [...arr, item];
const prepend = (arr, item) => [item, ...arr];
const removeAt = (arr, index) => [...arr.slice(0, index), ...arr.slice(index + 1)];
const updateAt = (arr, index, value) => [
  ...arr.slice(0, index),
  value,
  ...arr.slice(index + 1)
];

// Immutable object operations
const updateProperty = (obj, key, value) => ({ ...obj, [key]: value });
const mergeObjects = (...objects) => Object.assign({}, ...objects);
const omitProperty = (obj, key) => {
  const { [key]: omitted, ...rest } = obj;
  return rest;
};

// Functional object composition
const compose = (...transforms) => (obj) => 
  transforms.reduce((acc, transform) => ({ ...acc, ...transform(acc) }), obj);

const addTimestamp = (obj) => ({ timestamp: Date.now() });
const addId = (obj) => ({ id: Math.random().toString(36).substr(2, 9) });
const normalize = (obj) => ({ 
  ...obj, 
  name: obj.name?.toLowerCase(),
  email: obj.email?.toLowerCase() 
});

const processUser = compose(addTimestamp, addId, normalize);
console.log(processUser({ name: 'ALICE', email: 'ALICE@EXAMPLE.COM' }));
```

### 4.2 Rest Parameters per Variadic Functions

```javascript
// Variadic functions funzionali
const curry = (fn) => (...args) => 
  args.length >= fn.length 
    ? fn(...args)
    : (...nextArgs) => curry(fn)(...args, ...nextArgs);

const sum = (...numbers) => numbers.reduce((a, b) => a + b, 0);
const multiply = (...numbers) => numbers.reduce((a, b) => a * b, 1);

// Function composition con rest
const pipe = (first, ...rest) => (...args) => 
  rest.reduce((acc, fn) => fn(acc), first(...args));

const compose = (...fns) => (...args) => 
  fns.reduceRight((acc, fn) => fn(acc), fns.pop()(...args));

// Variadic data processing
const combineReducers = (...reducers) => (state, action) =>
  reducers.reduce((acc, reducer) => ({ ...acc, ...reducer(acc, action) }), state);
```

## 5. Optional Chaining e Nullish Coalescing

### 5.1 Safe Navigation in Functional Context

```javascript
// Safe property access
const getProp = (path) => (obj) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const getName = getProp('user.profile.name');
const getScore = getProp('game.stats.score');

const user = {
  user: {
    profile: { name: 'Alice' }
  }
};

console.log(getName(user)); // 'Alice'
console.log(getScore(user)); // undefined

// Optional chaining in pipelines
const processApiResponse = (response) => ({
  id: response?.data?.id ?? 'unknown',
  name: response?.data?.user?.name ?? 'Anonymous',
  score: response?.data?.stats?.score ?? 0,
  isValid: Boolean(response?.data?.id)
});

// Nullish coalescing for default values
const withDefaults = (defaults) => (obj) => ({
  ...defaults,
  ...Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value != null)
  )
});

const userDefaults = withDefaults({
  theme: 'light',
  language: 'en',
  notifications: true
});

console.log(userDefaults({ theme: null, language: 'it' }));
// { theme: 'light', language: 'it', notifications: true }
```

## 6. Async/Await Funzionale

### 6.1 Async Function Composition

```javascript
// Async pipe
const asyncPipe = (...fns) => async (value) => {
  let result = value;
  for (const fn of fns) {
    result = await fn(result);
  }
  return result;
};

// Async map
const asyncMap = (fn) => async (array) => 
  Promise.all(array.map(fn));

const asyncFilter = (predicate) => async (array) => {
  const results = await Promise.all(array.map(predicate));
  return array.filter((_, index) => results[index]);
};

// Example usage
const fetchUser = async (id) => ({ id, name: `User ${id}` });
const validateUser = async (user) => user.name.length > 0;
const transformUser = async (user) => ({ ...user, timestamp: Date.now() });

const processUsers = asyncPipe(
  asyncMap(fetchUser),
  asyncFilter(validateUser),
  asyncMap(transformUser)
);

// Usage
processUsers([1, 2, 3]).then(console.log);
```

### 6.2 Error Handling Funzionale con Async

```javascript
// Result type per async operations
const asyncTryCatch = (fn) => async (...args) => {
  try {
    const result = await fn(...args);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Async Either monad
class AsyncEither {
  constructor(value, isSuccess = true) {
    this.value = value;
    this.isSuccess = isSuccess;
  }
  
  static success(value) {
    return new AsyncEither(value, true);
  }
  
  static failure(error) {
    return new AsyncEither(error, false);
  }
  
  async map(fn) {
    if (!this.isSuccess) return this;
    try {
      const result = await fn(this.value);
      return AsyncEither.success(result);
    } catch (error) {
      return AsyncEither.failure(error);
    }
  }
  
  async flatMap(fn) {
    if (!this.isSuccess) return this;
    try {
      return await fn(this.value);
    } catch (error) {
      return AsyncEither.failure(error);
    }
  }
}

// Usage
const processUserData = (id) =>
  AsyncEither.success(id)
    .flatMap(fetchUser)
    .map(validateUser)
    .map(transformUser);
```

## 7. Modules e Tree Shaking

### 7.1 Functional Module Organization

```javascript
// math.js - Pure function module
export const add = (a) => (b) => a + b;
export const multiply = (a) => (b) => a * b;
export const divide = (a) => (b) => b !== 0 ? a / b : null;

// Composed operations
export const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
export const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);

// utils.js - Utility functions
export const curry = (fn) => (...args) => 
  args.length >= fn.length 
    ? fn(...args) 
    : (...nextArgs) => curry(fn)(...args, ...nextArgs);

export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// main.js - Main application
import { add, multiply, pipe } from './math.js';
import { curry, memoize } from './utils.js';

const calculate = pipe(
  add(10),
  multiply(2),
  memoize
);

export { calculate };
```

### 7.2 Dynamic Imports per Lazy Loading

```javascript
// Lazy loading di moduli funzionali
const lazyLoad = (modulePath) => (...args) => 
  import(modulePath).then(module => module.default(...args));

const processLargeDataset = lazyLoad('./data-processing.js');
const generateReport = lazyLoad('./report-generator.js');

// Conditional loading
const getProcessor = async (type) => {
  const modules = {
    csv: () => import('./csv-processor.js'),
    json: () => import('./json-processor.js'),
    xml: () => import('./xml-processor.js')
  };
  
  const module = await modules[type]();
  return module.default;
};

// Module federation per micro-frontends
const createRemoteModule = (remoteUrl) => (moduleName) => 
  import(`${remoteUrl}/${moduleName}`);

const userService = createRemoteModule('https://user-service.com/modules');
const paymentService = createRemoteModule('https://payment-service.com/modules');
```

## 8. Performance e Bundling

### 8.1 Tree Shaking Optimization

```javascript
// Struttura ottimizzata per tree shaking
// array-utils.js
export const map = (fn) => (array) => array.map(fn);
export const filter = (predicate) => (array) => array.filter(predicate);
export const reduce = (reducer) => (initial) => (array) => 
  array.reduce(reducer, initial);

// Solo le funzioni utilizzate vengono incluse nel bundle
import { map, filter } from './array-utils.js';

const processData = pipe(
  filter(x => x > 0),
  map(x => x * 2)
);
```

### 8.2 Code Splitting Funzionale

```javascript
// Route-based code splitting
const createRoute = (path, loader) => ({
  path,
  component: lazy(() => loader())
});

const routes = [
  createRoute('/dashboard', () => import('./Dashboard.js')),
  createRoute('/profile', () => import('./Profile.js')),
  createRoute('/settings', () => import('./Settings.js'))
];

// Feature-based splitting
const createFeature = (name) => ({
  async load() {
    const module = await import(`./features/${name}/index.js`);
    return module.default;
  },
  
  async getReducer() {
    const module = await import(`./features/${name}/reducer.js`);
    return module.default;
  }
});

const userFeature = createFeature('user');
const orderFeature = createFeature('orders');
```

## Conclusioni

L'integrazione di ES6+ features con la programmazione funzionale in JavaScript offre:

1. **Sintassi più concisa** per esprimere concetti funzionali
2. **Migliore immutabilità** con spread/rest operators
3. **Composizione più elegante** con arrow functions
4. **Gestione errori migliorata** con optional chaining
5. **Modularità avanzata** con ES modules
6. **Performance ottimizzate** con tree shaking e code splitting

Questi strumenti permettono di scrivere codice funzionale più leggibile, manutenibile e performante, rendendo JavaScript un linguaggio ancora più potente per la programmazione funzionale.

## Prossimi Passi

Nel prossimo modulo esploreremo come strutturare architetture modulari complete utilizzando questi pattern in applicazioni real-world.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Integrazione JavaScript Moderno](../README.md)
- [➡️ Architetture Modulari](./02-ModularArchitecture.md)
