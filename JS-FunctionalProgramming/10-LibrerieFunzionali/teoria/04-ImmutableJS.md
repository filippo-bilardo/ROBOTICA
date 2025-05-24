# Immutable.js: Strutture Dati Immutabili

**Immutable.js** è una libreria che fornisce strutture dati persistenti e immutabili per JavaScript. Sviluppata da Facebook, è progettata per garantire l'immutabilità a livello di struttura dati, offrendo performance ottimizzate attraverso la **structural sharing**.

## Introduzione a Immutable.js

### **Perché Immutable.js?**

JavaScript nativo non offre strutture dati immutabili built-in. Immutable.js risolve questo problema fornendo:

1. **Immutabilità garantita**: Impossibile modificare accidentalmente i dati
2. **Performance ottimizzate**: Structural sharing invece di deep cloning
3. **API ricca**: Metodi per manipolazione dati funzionale
4. **Debugging semplificato**: State changes tracciabili

```javascript
import { List, Map } from 'immutable';

// JavaScript nativo - mutabile
const nativeArray = [1, 2, 3];
nativeArray.push(4); // Modifica l'array originale
console.log(nativeArray); // [1, 2, 3, 4]

// Immutable.js - immutabile
const immutableList = List([1, 2, 3]);
const newList = immutableList.push(4); // Crea una nuova lista
console.log(immutableList.toArray()); // [1, 2, 3] - inalterato
console.log(newList.toArray()); // [1, 2, 3, 4]
```

## Strutture Dati Principali

### **List - Array Immutabili**

```javascript
import { List } from 'immutable';

// Creazione
const list1 = List([1, 2, 3, 4, 5]);
const list2 = List.of(1, 2, 3, 4, 5);
const emptyList = List();

// Accesso agli elementi
console.log(list1.get(0)); // 1
console.log(list1.first()); // 1
console.log(list1.last()); // 5
console.log(list1.size); // 5

// Modifiche (ritornano nuove istanze)
const added = list1.push(6).unshift(0);
const removed = list1.pop().shift();
const inserted = list1.insert(2, 'new');
const updated = list1.set(0, 'first');

// Operazioni funzionali
const doubled = list1.map(x => x * 2);
const evens = list1.filter(x => x % 2 === 0);
const sum = list1.reduce((acc, x) => acc + x, 0);

// Slice e concatenazione
const slice = list1.slice(1, 4); // elementi da index 1 a 3
const concatenated = list1.concat(List([6, 7, 8]));
```

### **Map - Oggetti Immutabili**

```javascript
import { Map } from 'immutable';

// Creazione
const map1 = Map({ name: 'Alice', age: 25, city: 'Rome' });
const map2 = Map([['name', 'Bob'], ['age', 30]]);
const emptyMap = Map();

// Accesso ai valori
console.log(map1.get('name')); // 'Alice'
console.log(map1.get('nonexistent', 'default')); // 'default'
console.log(map1.has('age')); // true
console.log(map1.size); // 3

// Modifiche
const updated = map1.set('age', 26);
const merged = map1.merge({ city: 'Milan', country: 'Italy' });
const deleted = map1.delete('city');
const cleared = map1.clear();

// Operazioni funzionali
const keys = map1.keys(); // Iterator delle chiavi
const values = map1.values(); // Iterator dei valori
const entries = map1.entries(); // Iterator delle coppie [key, value]

// Trasformazioni
const mapped = map1.map(value => typeof value === 'string' ? value.toUpperCase() : value);
const filtered = map1.filter((value, key) => key !== 'city');
```

### **OrderedMap - Map con Ordine Preservato**

```javascript
import { OrderedMap } from 'immutable';

const orderedMap = OrderedMap([
  ['first', 1],
  ['second', 2],
  ['third', 3]
]);

// L'ordine di inserimento è preservato
console.log(orderedMap.keys().toArray()); // ['first', 'second', 'third']
console.log(orderedMap.values().toArray()); // [1, 2, 3]

// Anche dopo modifiche
const modified = orderedMap.set('zero', 0);
console.log(modified.keys().toArray()); // ['first', 'second', 'third', 'zero']
```

### **Set - Insiemi Immutabili**

```javascript
import { Set, OrderedSet } from 'immutable';

// Set normale
const set1 = Set([1, 2, 3, 2, 1]); // duplicati automaticamente rimossi
console.log(set1.size); // 3

// Operazioni di insieme
const set2 = Set([3, 4, 5]);
const union = set1.union(set2); // Set {1, 2, 3, 4, 5}
const intersection = set1.intersect(set2); // Set {3}
const difference = set1.subtract(set2); // Set {1, 2}

// OrderedSet mantiene l'ordine di inserimento
const orderedSet = OrderedSet(['banana', 'apple', 'orange', 'apple']);
console.log(orderedSet.toArray()); // ['banana', 'apple', 'orange']
```

### **Stack e Record**

```javascript
import { Stack, Record } from 'immutable';

// Stack - LIFO (Last In, First Out)
const stack = Stack([1, 2, 3]);
const pushed = stack.push(4);
const popped = stack.pop();
console.log(stack.peek()); // 3 (top element)

// Record - strutture tipizzate
const PersonRecord = Record({
  name: '',
  age: 0,
  email: ''
}, 'Person');

const person = new PersonRecord({
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
});

console.log(person.name); // 'Alice'
console.log(person.get('age')); // 25

const olderPerson = person.set('age', 26);
```

## Nested Data Manipulation

### **Dati Annidati con setIn, getIn, updateIn**

```javascript
import { fromJS } from 'immutable';

const state = fromJS({
  user: {
    profile: {
      personal: {
        name: 'Alice',
        age: 25
      },
      preferences: {
        theme: 'dark',
        notifications: true
      }
    },
    posts: [
      { id: 1, title: 'First Post', tags: ['javascript', 'programming'] },
      { id: 2, title: 'Second Post', tags: ['react', 'frontend'] }
    ]
  }
});

// Accesso a dati annidati
const userName = state.getIn(['user', 'profile', 'personal', 'name']);
const firstPostTitle = state.getIn(['user', 'posts', 0, 'title']);

// Modifica di dati annidati
const withNewName = state.setIn(['user', 'profile', 'personal', 'name'], 'Bob');
const withUpdatedAge = state.updateIn(['user', 'profile', 'personal', 'age'], age => age + 1);

// Modifica in array annidati
const withNewPost = state.updateIn(['user', 'posts'], posts => 
  posts.push(fromJS({ id: 3, title: 'Third Post', tags: ['immutable'] }))
);

// Modifica condizionale
const updatePostTitle = state.updateIn(['user', 'posts'], posts =>
  posts.map(post =>
    post.get('id') === 1 ? post.set('title', 'Updated First Post') : post
  )
);
```

### **mergeIn e mergeDeepIn**

```javascript
import { fromJS } from 'immutable';

const state = fromJS({
  user: {
    profile: {
      name: 'Alice',
      settings: {
        theme: 'dark',
        language: 'en'
      }
    }
  }
});

// Merge superficiale
const withNewSettings = state.mergeIn(['user', 'profile'], {
  email: 'alice@example.com',
  settings: { notifications: true } // Sostituisce completamente settings
});

// Merge profondo
const withMergedSettings = state.mergeDeepIn(['user', 'profile'], {
  email: 'alice@example.com',
  settings: { notifications: true } // Merge con settings esistenti
});

console.log(withNewSettings.getIn(['user', 'profile', 'settings']));
// Map { "notifications": true } - theme e language persi

console.log(withMergedSettings.getIn(['user', 'profile', 'settings']));
// Map { "theme": "dark", "language": "en", "notifications": true }
```

## Interoperabilità con JavaScript

### **Conversione tra Immutable e JavaScript**

```javascript
import { fromJS, Map, List } from 'immutable';

// Da JavaScript a Immutable
const jsData = {
  users: [
    { name: 'Alice', posts: ['post1', 'post2'] },
    { name: 'Bob', posts: ['post3'] }
  ],
  settings: {
    theme: 'dark',
    features: { beta: true }
  }
};

const immutableData = fromJS(jsData);

// Da Immutable a JavaScript
const backToJS = immutableData.toJS();

// Conversioni parziali
const usersList = immutableData.get('users').toArray();
const settingsObj = immutableData.get('settings').toObject();

// Conversioni con trasformazioni
const userNames = immutableData
  .get('users')
  .map(user => user.get('name'))
  .toArray();
```

### **Working with APIs**

```javascript
import { fromJS } from 'immutable';

// Gestione response API
const handleApiResponse = (response) => {
  const immutableData = fromJS(response);
  
  return immutableData
    .update('users', users => 
      users.map(user => 
        user.set('fullName', `${user.get('firstName')} ${user.get('lastName')}`)
      )
    )
    .set('lastUpdated', new Date().toISOString());
};

// Preparazione per API calls
const prepareForApi = (immutableState) => {
  return immutableState
    .deleteIn(['user', 'temporaryData'])
    .updateIn(['user', 'posts'], posts => 
      posts.filter(post => post.get('published'))
    )
    .toJS();
};
```

## Performance e Structural Sharing

### **Come Funziona lo Structural Sharing**

```javascript
import { List } from 'immutable';

const list1 = List([1, 2, 3, 4, 5]);
const list2 = list1.push(6);
const list3 = list1.set(0, 'new');

// list1, list2 e list3 condividono la maggior parte della struttura interna
// Solo le parti modificate sono duplicate

console.log(list1 === list2); // false (istanze diverse)
console.log(list1.get(1) === list2.get(1)); // true (stesso oggetto interno)
```

### **Performance Comparisons**

```javascript
import { fromJS } from 'immutable';

// Benchmark: modifica di oggetto annidato grande
const largeObject = {
  level1: {
    level2: {
      level3: {
        data: new Array(10000).fill(0).map((_, i) => ({ id: i, value: i * 2 }))
      }
    }
  }
};

// Native JavaScript (deep clone)
console.time('native');
const nativeClone = JSON.parse(JSON.stringify(largeObject));
nativeClone.level1.level2.level3.data[0].value = 999;
console.timeEnd('native'); // ~50ms

// Immutable.js (structural sharing)
console.time('immutable');
const immutableObj = fromJS(largeObject);
const modified = immutableObj.setIn(['level1', 'level2', 'level3', 'data', 0, 'value'], 999);
console.timeEnd('immutable'); // ~2ms
```

## Pattern e Best Practices

### **State Management Pattern**

```javascript
import { Map, List, fromJS } from 'immutable';

// Redux-style reducer con Immutable.js
const initialState = fromJS({
  users: [],
  currentUser: null,
  loading: false,
  error: null
});

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOAD_USERS_START':
      return state.set('loading', true).set('error', null);
      
    case 'LOAD_USERS_SUCCESS':
      return state
        .set('loading', false)
        .set('users', fromJS(action.payload));
        
    case 'LOAD_USERS_ERROR':
      return state
        .set('loading', false)
        .set('error', action.error);
        
    case 'ADD_USER':
      return state.updateIn(['users'], users => 
        users.push(fromJS(action.user))
      );
      
    case 'UPDATE_USER':
      return state.updateIn(['users'], users =>
        users.map(user =>
          user.get('id') === action.id 
            ? user.merge(action.updates)
            : user
        )
      );
      
    case 'DELETE_USER':
      return state.updateIn(['users'], users =>
        users.filter(user => user.get('id') !== action.id)
      );
      
    default:
      return state;
  }
};
```

### **Validation Pattern**

```javascript
import { Map, List } from 'immutable';

const createValidator = (rules) => (data) => {
  return Object.keys(rules).reduce((errors, field) => {
    const value = data.get(field);
    const rule = rules[field];
    
    if (!rule(value)) {
      return errors.set(field, `Invalid ${field}`);
    }
    
    return errors;
  }, Map());
};

const userValidationRules = {
  name: (name) => name && name.length > 2,
  email: (email) => email && email.includes('@'),
  age: (age) => age && age >= 18
};

const validateUser = createValidator(userValidationRules);

const user = Map({ name: 'A', email: 'invalid', age: 16 });
const errors = validateUser(user);
console.log(errors.toJS()); // { name: 'Invalid name', email: 'Invalid email', age: 'Invalid age' }
```

### **Cursor Pattern per Components**

```javascript
import { fromJS } from 'immutable';

// Cursor-like pattern per React components
const createCursor = (data, path, onChange) => ({
  get: (subPath = []) => data.getIn([...path, ...subPath]),
  set: (subPath, value) => {
    const newData = data.setIn([...path, ...subPath], value);
    onChange(newData);
    return createCursor(newData, path, onChange);
  },
  update: (subPath, updater) => {
    const newData = data.updateIn([...path, ...subPath], updater);
    onChange(newData);
    return createCursor(newData, path, onChange);
  }
});

// Utilizzo in React component
const UserProfile = ({ appState, onStateChange }) => {
  const userCursor = createCursor(appState, ['user'], onStateChange);
  
  const handleNameChange = (newName) => {
    userCursor.set(['name'], newName);
  };
  
  const handleAgeIncrement = () => {
    userCursor.update(['age'], age => age + 1);
  };
  
  // ...render logic
};
```

## Advanced Features

### **Lazy Sequences**

```javascript
import { Seq } from 'immutable';

// Lazy evaluation per performance su grandi dataset
const largeRange = Seq(Array(1000000).keys());

const result = largeRange
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .take(10)
  .toArray(); // Solo qui avviene la valutazione

console.log(result); // [0, 4, 16, 36, 64, 100, 144, 196, 256, 324]
```

### **Custom Collections**

```javascript
import { Record, List } from 'immutable';

// Definizione di una collection custom
const TodoRecord = Record({
  id: null,
  text: '',
  completed: false,
  createdAt: null
}, 'Todo');

class TodoList extends List {
  addTodo(text) {
    const todo = new TodoRecord({
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date()
    });
    return this.push(todo);
  }
  
  toggleTodo(id) {
    return this.map(todo =>
      todo.id === id ? todo.set('completed', !todo.completed) : todo
    );
  }
  
  getCompleted() {
    return this.filter(todo => todo.completed);
  }
  
  getPending() {
    return this.filter(todo => !todo.completed);
  }
}

// Utilizzo
const todos = new TodoList()
  .addTodo('Learn Immutable.js')
  .addTodo('Build an app')
  .toggleTodo(todos.first().id);
```

## Best Practices e Performance Tips

### **Do's and Don'ts**

✅ **DO:**
```javascript
// Usa metodi immutabili
const newList = list.push(item);

// Usa fromJS per dati complessi
const immutableData = fromJS(complexJSObject);

// Chain operations per leggibilità
const result = data
  .filter(predicate)
  .map(transform)
  .sort(comparator);
```

❌ **DON'T:**
```javascript
// Non mutare direttamente
list.get(0).push(item); // ERRORE se list.get(0) è un array JS

// Non convertire troppo spesso
data.toJS().filter(...).map(...); // Costoso e perde immutabilità

// Non usare su dati semplici
const simple = Map({ count: 0 }); // Overkill per dati semplici
```

### **Memory Management**

```javascript
// Evita memory leaks con subscriptions
class Component {
  constructor() {
    this.state = fromJS({ data: [] });
  }
  
  // Pulisci riferimenti quando non necessari
  componentWillUnmount() {
    this.state = null;
  }
}

// Usa clear() per svuotare collections grandi
const cleared = hugeList.clear(); // Più efficiente di List()
```

## Quando Usare Immutable.js

✅ **Usa Immutable.js quando:**
- Gestisci state complesso e annidato
- L'immutabilità è critica per l'applicazione
- Hai problemi di performance con deep cloning
- Lavori con Redux o state management complesso

❌ **Evita Immutable.js quando:**
- Lavori con dati semplici e flat
- Il bundle size è estremamente critico
- Il team non ha familiarità con l'API
- Hai principalmente operazioni di lettura

Nel prossimo modulo esploreremo **RxJS** per la programmazione reattiva funzionale.
