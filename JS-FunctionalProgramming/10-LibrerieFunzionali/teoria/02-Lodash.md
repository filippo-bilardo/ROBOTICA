# Lodash e Lodash/FP

**Lodash** è una delle librerie JavaScript più popolari, che fornisce utility functions per la manipolazione di dati. **Lodash/FP** è la versione funzionale che abbraccia completamente i paradigmi della programmazione funzionale.

## Lodash Tradizionale vs Lodash/FP

### Lodash Tradizionale
```javascript
import _ from 'lodash';

const users = [
  { name: 'Alice', age: 25, posts: 10 },
  { name: 'Bob', age: 30, posts: 5 },
  { name: 'Charlie', age: 35, posts: 15 }
];

// Stile object-oriented
const result = _(users)
  .filter(user => user.age > 25)
  .map(user => ({ ...user, status: 'active' }))
  .sortBy('posts')
  .value();
```

### Lodash/FP
```javascript
import { pipe, filter, map, sortBy } from 'lodash/fp';

const users = [
  { name: 'Alice', age: 25, posts: 10 },
  { name: 'Bob', age: 30, posts: 5 },
  { name: 'Charlie', age: 35, posts: 15 }
];

// Stile funzionale
const processUsers = pipe(
  filter(user => user.age > 25),
  map(user => ({ ...user, status: 'active' })),
  sortBy('posts')
);

const result = processUsers(users);
```

## Caratteristiche di Lodash/FP

### 1. **Auto-Curried Functions**
Tutte le funzioni sono automaticamente curried:

```javascript
import { get, map, filter } from 'lodash/fp';

// Curry automatico
const getName = get('name');
const getNames = map(getName);
const activeUsers = filter({ active: true });

// Composizione naturale
const getActiveUserNames = pipe(
  activeUsers,
  getNames
);
```

### 2. **Data-Last Parameter Order**
I dati vengono sempre passati come ultimo parametro:

```javascript
// Lodash tradizionale (data-first)
_.map(users, 'name');
_.filter(users, { active: true });

// Lodash/FP (data-last)
map('name')(users);
filter({ active: true })(users);

// Facilita la composizione
const processUsers = pipe(
  filter({ active: true }),
  map('name'),
  sortBy(identity)
);
```

### 3. **Immutabilità per Default**
Tutte le operazioni sono immutabili:

```javascript
import { set, update, merge } from 'lodash/fp';

const user = { name: 'Alice', age: 25, profile: { bio: 'Developer' } };

// Non modifica l'oggetto originale
const updatedUser = pipe(
  set('age', 26),
  update('profile.bio', bio => bio.toUpperCase()),
  merge({ lastLogin: new Date() })
)(user);

console.log(user.age); // 25 (immutato)
console.log(updatedUser.age); // 26
```

## Utility Functions Principali

### **Manipolazione Array**

```javascript
import { 
  map, filter, reduce, find, some, every,
  take, drop, chunk, flatten, uniq, groupBy
} from 'lodash/fp';

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Operazioni base
const doubled = map(x => x * 2)(numbers);
const evens = filter(x => x % 2 === 0)(numbers);
const sum = reduce((acc, x) => acc + x, 0)(numbers);

// Operazioni avanzate
const first3 = take(3)(numbers); // [1, 2, 3]
const skip2 = drop(2)(numbers); // [3, 4, 5, 6, 7, 8, 9, 10]
const groups = chunk(3)(numbers); // [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]

// Con oggetti
const users = [
  { name: 'Alice', department: 'IT', salary: 5000 },
  { name: 'Bob', department: 'IT', salary: 6000 },
  { name: 'Charlie', department: 'HR', salary: 4500 }
];

const byDepartment = groupBy('department')(users);
const names = map('name')(users);
const itEmployee = find({ department: 'IT' })(users);
```

### **Manipolazione Oggetti**

```javascript
import { 
  get, set, has, omit, pick, merge, 
  keys, values, toPairs, fromPairs,
  mapKeys, mapValues, defaults
} from 'lodash/fp';

const user = {
  id: 1,
  name: 'Alice',
  profile: {
    email: 'alice@example.com',
    preferences: {
      theme: 'dark',
      notifications: true
    }
  }
};

// Accesso sicuro ai dati
const getEmail = get('profile.email');
const getTheme = get('profile.preferences.theme');

// Trasformazioni immutabili
const updateTheme = set('profile.preferences.theme', 'light');
const addLastLogin = set('lastLogin', new Date());

// Selezione e omissione di proprietà
const publicProfile = pick(['id', 'name'])(user);
const withoutId = omit(['id'])(user);

// Merge di oggetti
const defaultPrefs = { theme: 'light', language: 'en' };
const withDefaults = merge(user)({ profile: { preferences: defaultPrefs } });
```

### **Predicati e Condizioni**

```javascript
import { 
  matches, matchesProperty, conforms, 
  isArray, isObject, isString, isNumber,
  isEmpty, isNil, stubTrue, stubFalse
} from 'lodash/fp';

const users = [
  { name: 'Alice', age: 25, active: true, role: 'admin' },
  { name: 'Bob', age: 30, active: false, role: 'user' },
  { name: 'Charlie', age: 35, active: true, role: 'user' }
];

// Predicati di matching
const isAdmin = matches({ role: 'admin' });
const isActive = matchesProperty('active', true);
const isAdult = conforms({ age: age => age >= 18 });

// Filtering con predicati
const admins = filter(isAdmin)(users);
const activeUsers = filter(isActive)(users);
const adults = filter(isAdult)(users);

// Predicati composti
const activeAdmins = filter(user => isAdmin(user) && isActive(user))(users);

// O usando every per composizione
import { every } from 'lodash/fp';
const isActiveAdmin = every([isAdmin, isActive]);
const activeAdmins2 = filter(isActiveAdmin)(users);
```

## Composizione con Pipe e Flow

### **Pipe vs Flow**

```javascript
import { pipe, flow } from 'lodash/fp';

// pipe: left-to-right
const processWithPipe = pipe(
  filter({ active: true }),
  map('name'),
  sortBy(identity),
  take(5)
);

// flow: alias di pipe (più leggibile per alcuni)
const processWithFlow = flow(
  filter({ active: true }),
  map('name'),
  sortBy(identity),
  take(5)
);

// Sono identici
console.log(processWithPipe === flow); // true
```

### **Composizione Complessa**

```javascript
import { 
  pipe, map, filter, groupBy, mapValues, 
  sortBy, reverse, take, sumBy
} from 'lodash/fp';

const salesData = [
  { rep: 'Alice', region: 'North', amount: 1000, month: 'Jan' },
  { rep: 'Bob', region: 'South', amount: 1500, month: 'Jan' },
  { rep: 'Alice', region: 'North', amount: 1200, month: 'Feb' },
  { rep: 'Charlie', region: 'East', amount: 800, month: 'Jan' }
];

// Pipeline complessa di analisi
const getTopPerformers = pipe(
  filter(sale => sale.amount > 900), // Solo vendite significative
  groupBy('rep'), // Raggruppa per rappresentante
  mapValues(sumBy('amount')), // Somma per rappresentante
  toPairs, // Converti in array di [nome, totale]
  map(([rep, total]) => ({ rep, total })), // Trasforma in oggetti
  sortBy('total'), // Ordina per totale
  reverse, // Dal più alto al più basso
  take(3) // Top 3
);

const topPerformers = getTopPerformers(salesData);
```

## Pattern Avanzati

### **Conditional Processing**

```javascript
import { when, unless, cond, constant } from 'lodash/fp';

// when/unless per logica condizionale
const processUser = pipe(
  when(get('active'), set('lastProcessed', new Date())),
  unless(get('verified'), set('needsVerification', true)),
  when(user => user.age < 18, set('requiresGuardian', true))
);

// cond per switch-like logic
const getUserStatus = cond([
  [get('banned'), constant('BANNED')],
  [get('suspended'), constant('SUSPENDED')],
  [matches({ active: true, verified: true }), constant('ACTIVE')],
  [stubTrue, constant('INACTIVE')]
]);
```

### **Error Handling**

```javascript
import { attempt, isError } from 'lodash/fp';

// Gestione sicura di operazioni che possono fallire
const safeParseJSON = attempt(JSON.parse);

const processConfig = pipe(
  safeParseJSON,
  when(isError, () => ({ error: 'Invalid JSON' })),
  unless(isError, set('parsed', true))
);

const result1 = processConfig('{"valid": true}'); // { valid: true, parsed: true }
const result2 = processConfig('invalid json'); // Error object
```

### **Dynamic Function Creation**

```javascript
import { curry, partial, rearg } from 'lodash/fp';

// Creazione dinamica di funzioni
const createValidator = (rules) => (data) => {
  return pipe(
    toPairs,
    map(([key, value]) => ({
      field: key,
      value,
      valid: rules[key] ? rules[key](value) : true
    })),
    filter(result => !result.valid)
  )(data);
};

const userRules = {
  name: name => name && name.length > 2,
  email: email => email && email.includes('@'),
  age: age => age && age >= 18
};

const validateUser = createValidator(userRules);
```

## Performance e Ottimizzazioni

### **Lazy Evaluation**

```javascript
import { chain } from 'lodash/fp';

// chain per lazy evaluation su operazioni multiple
const processLargeDataset = chain
  .filter(item => item.active)
  .map(item => ({ ...item, processed: true }))
  .groupBy('category')
  .mapValues(items => items.length)
  .value();

// La valutazione avviene solo quando si chiama .value()
```

### **Tree Shaking**

```javascript
// Import specifici per ottimizzare il bundle
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import pipe from 'lodash/fp/pipe';

// Invece di
import { map, filter, pipe } from 'lodash/fp';
```

## Best Practices

1. **Usa import specifici** per ottimizzare il bundle size
2. **Favorisci la composizione** rispetto a logica procedurale
3. **Crea utility functions riusabili** con curry e partial
4. **Documenta pipeline complesse** con commenti descrittivi
5. **Testa le composizioni** unitariamente

## Quando Usare Lodash/FP

✅ **Usa Lodash/FP quando:**
- Manipoli frequentemente array e oggetti
- Vuoi codice più leggibile e manutenibile
- Il team ha familiarità con JavaScript
- Performance non è critica per operazioni specifiche

❌ **Evita Lodash/FP quando:**
- Il bundle size è estremamente critico
- Il team preferisce JavaScript nativo
- Hai bisogno di performance massime su operazioni semplici

Nel prossimo modulo esploreremo **Ramda**, una libreria progettata specificamente per la programmazione funzionale pura.
