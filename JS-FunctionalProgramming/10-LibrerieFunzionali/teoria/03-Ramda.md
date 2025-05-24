# Ramda: Programmazione Funzionale Pura

**Ramda** è una libreria JavaScript progettata specificamente per la programmazione funzionale. A differenza di Lodash, Ramda è stata costruita fin dall'inizio con i principi funzionali come fondamento, offrendo un'API consistente e puramente funzionale.

## Filosofia di Ramda

### **Principi Fondamentali**

1. **Immutabilità**: Tutte le funzioni preservano i dati originali
2. **Purezza**: Nessun side effect, risultati predicibili
3. **Curry automatico**: Tutte le funzioni sono curried di default
4. **Data-last**: I dati sono sempre l'ultimo parametro
5. **Composizione**: Progettata per facilitare la composizione di funzioni

```javascript
import * as R from 'ramda';

// Ramda abbraccia completamente il paradigma funzionale
const data = [1, 2, 3, 4, 5];

// Immutable: non modifica l'array originale
const doubled = R.map(x => x * 2, data);
console.log(data); // [1, 2, 3, 4, 5] - inalterato
console.log(doubled); // [2, 4, 6, 8, 10]

// Auto-curried: parziale applicazione naturale
const double = R.map(x => x * 2);
const doubledData = double(data);

// Data-last: facilita la composizione
const processNumbers = R.pipe(
  R.filter(x => x > 2),
  R.map(x => x * 2),
  R.sum
);
```

## Funzioni Core di Ramda

### **Manipolazione Liste**

```javascript
import * as R from 'ramda';

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const users = [
  { name: 'Alice', age: 25, department: 'IT' },
  { name: 'Bob', age: 30, department: 'IT' },
  { name: 'Charlie', age: 35, department: 'HR' }
];

// Operazioni base
const doubled = R.map(R.multiply(2), numbers);
const evens = R.filter(x => x % 2 === 0, numbers);
const sum = R.reduce(R.add, 0, numbers);

// Operazioni avanzate
const first3 = R.take(3, numbers); // [1, 2, 3]
const last3 = R.takeLast(3, numbers); // [8, 9, 10]
const skip2 = R.drop(2, numbers); // [3, 4, 5, 6, 7, 8, 9, 10]

// Ricerca e test
const findIT = R.find(R.propEq('department', 'IT'), users);
const hasIT = R.any(R.propEq('department', 'IT'), users);
const allAdults = R.all(R.propSatisfies(R.gte(R.__, 18), 'age'), users);

// Raggruppamento e aggregazione
const byDepartment = R.groupBy(R.prop('department'), users);
const departments = R.uniq(R.map(R.prop('department'), users));
```

### **Manipolazione Oggetti e Proprietà**

```javascript
import * as R from 'ramda';

const user = {
  id: 1,
  name: 'Alice',
  profile: {
    email: 'alice@example.com',
    settings: {
      theme: 'dark',
      notifications: true
    }
  }
};

// Accesso a proprietà
const getName = R.prop('name');
const getEmail = R.path(['profile', 'email']);
const getTheme = R.pathOr('light', ['profile', 'settings', 'theme']);

console.log(getName(user)); // 'Alice'
console.log(getEmail(user)); // 'alice@example.com'

// Modifiche immutabili
const setTheme = R.assocPath(['profile', 'settings', 'theme'], 'light');
const addLastLogin = R.assoc('lastLogin', new Date());
const updateAge = R.over(R.lensProp('age'), R.add(1));

const updatedUser = R.pipe(
  setTheme,
  addLastLogin,
  updateAge
)(user);

// Selezione e trasformazione
const publicData = R.pick(['id', 'name'], user);
const withoutId = R.omit(['id'], user);
const mappedValues = R.mapObjIndexed((value, key) => 
  typeof value === 'string' ? value.toUpperCase() : value, user);
```

### **Lenses per Manipolazione Immutabile**

Le **lenses** sono uno dei feature più potenti di Ramda per la manipolazione immutabile di strutture dati annidate:

```javascript
import * as R from 'ramda';

const state = {
  users: [
    { id: 1, name: 'Alice', profile: { email: 'alice@example.com' } },
    { id: 2, name: 'Bob', profile: { email: 'bob@example.com' } }
  ],
  settings: {
    theme: 'dark',
    language: 'en'
  }
};

// Definizione di lenses
const usersLens = R.lensProp('users');
const firstUserLens = R.lensPath(['users', 0]);
const firstUserNameLens = R.lensPath(['users', 0, 'name']);
const settingsThemeLens = R.lensPath(['settings', 'theme']);

// View: leggere attraverso una lens
const users = R.view(usersLens, state);
const firstName = R.view(firstUserNameLens, state);

// Set: impostare attraverso una lens
const withLightTheme = R.set(settingsThemeLens, 'light', state);

// Over: trasformare attraverso una lens
const withUppercaseName = R.over(firstUserNameLens, R.toUpper, state);

// Composizione di lenses
const userEmailLens = R.compose(
  R.lensIndex(0),
  R.lensProp('profile'),
  R.lensProp('email')
);

const firstUserEmail = R.view(userEmailLens, state.users);
const withNewEmail = R.set(userEmailLens, 'newemail@example.com', state.users);
```

## Composizione Avanzata

### **Pipe e Compose**

```javascript
import * as R from 'ramda';

const data = [
  { name: 'Product A', price: 100, category: 'electronics', inStock: true },
  { name: 'Product B', price: 50, category: 'books', inStock: false },
  { name: 'Product C', price: 200, category: 'electronics', inStock: true },
  { name: 'Product D', price: 30, category: 'books', inStock: true }
];

// pipe: composizione left-to-right (più naturale)
const getExpensiveInStockElectronics = R.pipe(
  R.filter(R.prop('inStock')),
  R.filter(R.propEq('category', 'electronics')),
  R.filter(R.propSatisfies(R.gt(R.__, 150), 'price')),
  R.map(R.pick(['name', 'price']))
);

// compose: composizione right-to-left (matematica)
const getExpensiveInStockElectronics2 = R.compose(
  R.map(R.pick(['name', 'price'])),
  R.filter(R.propSatisfies(R.gt(R.__, 150), 'price')),
  R.filter(R.propEq('category', 'electronics')),
  R.filter(R.prop('inStock'))
);

const result = getExpensiveInStockElectronics(data);
```

### **Transducers per Performance**

I transducers permettono di comporre trasformazioni efficienti:

```javascript
import * as R from 'ramda';

const largeDataset = R.range(1, 1000000);

// Senza transducers: multiple passaggi
const traditionalApproach = R.pipe(
  R.map(x => x * 2),
  R.filter(x => x > 1000),
  R.take(10)
);

// Con transducers: singolo passaggio
const transducerApproach = R.compose(
  R.map(x => x * 2),
  R.filter(x => x > 1000),
  R.take(10)
);

// Applica il transducer
const result = R.transduce(transducerApproach, R.flip(R.append), [], largeDataset);
```

## Pattern Funzionali Avanzati

### **Point-Free Style**

```javascript
import * as R from 'ramda';

const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 30, active: false },
  { name: 'Charlie', age: 35, active: true }
];

// Con parametri espliciti
const getActiveUserNames = (users) => {
  return users
    .filter(user => user.active)
    .map(user => user.name)
    .sort();
};

// Point-free style con Ramda
const getActiveUserNames2 = R.pipe(
  R.filter(R.prop('active')),
  R.map(R.prop('name')),
  R.sort(R.ascend(R.identity))
);

// Ancora più conciso
const getActiveUserNames3 = R.pipe(
  R.filter(R.prop('active')),
  R.pluck('name'),
  R.sort(R.ascend(R.identity))
);
```

### **Combinatori e Logic Functions**

```javascript
import * as R from 'ramda';

const users = [
  { name: 'Alice', age: 25, active: true, role: 'admin' },
  { name: 'Bob', age: 17, active: true, role: 'user' },
  { name: 'Charlie', age: 35, active: false, role: 'admin' }
];

// Predicati base
const isActive = R.prop('active');
const isAdmin = R.propEq('role', 'admin');
const isAdult = R.propSatisfies(R.gte(R.__, 18), 'age');

// Combinatori logici
const isActiveAdmin = R.both(isActive, isAdmin);
const isActiveOrAdmin = R.either(isActive, isAdmin);
const isNotActive = R.complement(isActive);

// Applicazione
const activeAdmins = R.filter(isActiveAdmin, users);
const inactiveUsers = R.filter(isNotActive, users);

// Combinatori complessi
const isValidUser = R.allPass([isActive, isAdult, R.prop('name')]);
const hasAnyIssue = R.anyPass([isNotActive, R.complement(isAdult)]);
```

### **Conditional Logic**

```javascript
import * as R from 'ramda';

// when/unless per logica condizionale
const processUser = R.pipe(
  R.when(R.prop('active'), R.assoc('lastProcessed', new Date())),
  R.unless(R.prop('verified'), R.assoc('needsVerification', true)),
  R.when(R.propSatisfies(R.lt(R.__, 18), 'age'), R.assoc('requiresGuardian', true))
);

// cond per logica switch-like
const getUserStatus = R.cond([
  [R.prop('banned'), R.always('BANNED')],
  [R.prop('suspended'), R.always('SUSPENDED')],
  [R.both(R.prop('active'), R.prop('verified')), R.always('ACTIVE')],
  [R.T, R.always('INACTIVE')] // R.T è sempre true (default case)
]);

// ifElse per logica binaria
const applyDiscount = R.ifElse(
  R.propSatisfies(R.gt(R.__, 100), 'total'),
  R.over(R.lensProp('total'), R.multiply(0.9)),
  R.identity
);
```

## Gestione Asincrona con Ramda

### **Promise Composition**

```javascript
import * as R from 'ramda';

// Utility per Promise
const pipeP = (...functions) => (value) => 
  functions.reduce((acc, fn) => acc.then(fn), Promise.resolve(value));

const composeP = (...functions) => 
  pipeP(...functions.reverse());

// Esempio di pipeline asincrona
const fetchUser = (id) => fetch(`/api/users/${id}`).then(r => r.json());
const fetchUserPosts = (user) => fetch(`/api/users/${user.id}/posts`).then(r => r.json());
const addPostsToUser = (posts) => (user) => ({ ...user, posts });

const getUserWithPosts = pipeP(
  fetchUser,
  R.tap(console.log), // Side effect per debugging
  fetchUserPosts,
  addPostsToUser
);

// Utilizzo
getUserWithPosts(1).then(console.log);
```

### **Error Handling Funzionale**

```javascript
import * as R from 'ramda';

// Either monad-like behavior
const tryCatch = (fn) => (...args) => {
  try {
    return { success: true, data: fn(...args) };
  } catch (error) {
    return { success: false, error };
  }
};

const safeJsonParse = tryCatch(JSON.parse);
const safeDivide = tryCatch((a, b) => a / b);

// Processing with error handling
const processConfig = R.pipe(
  safeJsonParse,
  R.ifElse(
    R.prop('success'),
    R.pipe(R.prop('data'), R.assoc('parsed', true)),
    R.prop('error')
  )
);
```

## Performance e Ottimizzazioni

### **Memoization**

```javascript
import * as R from 'ramda';

// Memoization per funzioni pure costose
const expensiveCalculation = R.memoizeWith(
  R.toString, // key function
  (n) => {
    console.log(`Calculating for ${n}`);
    return R.sum(R.range(1, n + 1));
  }
);

expensiveCalculation(1000); // Calcola
expensiveCalculation(1000); // Usa cache
```

### **Lazy Evaluation Patterns**

```javascript
import * as R from 'ramda';

// Lazy evaluation con generatori
const lazyMap = R.curry((fn, iterable) => {
  function* generator() {
    for (const item of iterable) {
      yield fn(item);
    }
  }
  return generator();
});

const lazyFilter = R.curry((predicate, iterable) => {
  function* generator() {
    for (const item of iterable) {
      if (predicate(item)) {
        yield item;
      }
    }
  }
  return generator();
});

// Pipeline lazy
const processLazilyy = R.pipe(
  lazyMap(x => x * 2),
  lazyFilter(x => x > 10),
  Array.from // Valutazione finale
);
```

## Ramda vs Altre Librerie

### **Confronto con Lodash/FP**

```javascript
// Ramda - più concisa per operazioni annidate
const ramdaWay = R.pipe(
  R.groupBy(R.prop('category')),
  R.mapObjIndexed(R.pipe(
    R.filter(R.prop('active')),
    R.length
  ))
);

// Lodash/FP - più verbosa ma familiare
import { pipe, groupBy, mapValues, filter, size } from 'lodash/fp';
const lodashWay = pipe(
  groupBy('category'),
  mapValues(pipe(
    filter('active'),
    size
  ))
);
```

## Best Practices

1. **Inizia con piccole composizioni** e costruisci gradualmente
2. **Usa lenses per manipolazioni immutabili complesse**
3. **Sfrutta il point-free style** per codice più leggibile
4. **Combina predicati** invece di scrivere logica complessa
5. **Considera le performance** per dataset molto grandi
6. **Documenta le composizioni complesse** con esempi

## Quando Usare Ramda

✅ **Usa Ramda quando:**
- Vuoi abbracciare completamente la programmazione funzionale
- Lavori con trasformazioni dati complesse
- La composizione è centrale nell'architettura
- Il team ha esperienza con FP

❌ **Evita Ramda quando:**
- Il team è nuovo alla programmazione funzionale
- Hai vincoli stretti di bundle size
- Lavori principalmente con DOM/eventi
- Hai bisogno di performance massime su operazioni semplici

Nel prossimo modulo esploreremo **Immutable.js** per la gestione di strutture dati immutabili complesse.
