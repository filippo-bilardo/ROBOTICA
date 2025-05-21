# Funzioni come Argomenti

Uno degli aspetti fondamentali delle higher-order functions è la capacità di accettare altre funzioni come argomenti. Questo capitolo esplora in dettaglio questo concetto, illustrando i pattern comuni e le applicazioni pratiche delle funzioni che accettano altre funzioni come input.

## Il Pattern dei Callback

Il pattern più comune per le funzioni che accettano altre funzioni come argomenti è il pattern dei callback. Un callback è una funzione che viene passata come argomento ad un'altra funzione e che viene eseguita dopo che si è verificato un certo evento o all'interno di quella funzione.

### Callback Sincroni

I callback sincroni sono eseguiti immediatamente durante l'esecuzione della funzione che li riceve.

```javascript
// Funzione che accetta un callback sincrono
function processArray(array, callback) {
  const results = [];
  for (let i = 0; i < array.length; i++) {
    // Chiama il callback su ogni elemento dell'array
    results.push(callback(array[i]));
  }
  return results;
}

// Utilizzo con diverse funzioni di callback
const numbers = [1, 2, 3, 4, 5];

// Callback per calcolare il quadrato
const squares = processArray(numbers, x => x * x);
console.log('Quadrati:', squares); // [1, 4, 9, 16, 25]

// Callback per calcolare il cubo
const cubes = processArray(numbers, x => x * x * x);
console.log('Cubi:', cubes); // [1, 8, 27, 64, 125]

// Callback per verificare se un numero è pari
const evenCheck = processArray(numbers, x => x % 2 === 0);
console.log('È pari?', evenCheck); // [false, true, false, true, false]
```

### Callback Asincroni

I callback asincroni sono particolarmente utili quando si lavora con operazioni che richiedono tempo, come le richieste di rete, l'accesso ai file o le operazioni di database.

```javascript
// Funzione con callback asincrono
function fetchData(url, successCallback, errorCallback) {
  fetch(url)
    .then(response => response.json())
    .then(data => successCallback(data))
    .catch(error => errorCallback(error));
}

// Utilizzo
fetchData(
  'https://api.example.com/data',
  data => {
    console.log('Dati ricevuti:', data);
    // Elabora i dati...
  },
  error => {
    console.error('Errore durante il recupero dei dati:', error);
    // Gestisci l'errore...
  }
);
```

## Pattern delle Funzioni Iteratrici

Le funzioni che operano su collezioni di dati spesso accettano funzioni come argomenti per specificare come elaborare ciascun elemento.

### Implementazione di Array Methods

Vediamo come potremmo implementare versioni semplificate dei metodi `map`, `filter` e `reduce` degli array:

```javascript
// Implementazione di map
function map(array, callback) {
  const results = [];
  for (let i = 0; i < array.length; i++) {
    results.push(callback(array[i], i, array));
  }
  return results;
}

// Implementazione di filter
function filter(array, predicate) {
  const results = [];
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      results.push(array[i]);
    }
  }
  return results;
}

// Implementazione di reduce
function reduce(array, callback, initialValue) {
  let accumulator = initialValue !== undefined ? initialValue : array[0];
  const startIndex = initialValue !== undefined ? 0 : 1;
  
  for (let i = startIndex; i < array.length; i++) {
    accumulator = callback(accumulator, array[i], i, array);
  }
  return accumulator;
}

// Uso delle implementazioni
const numbers = [1, 2, 3, 4, 5];

const doubled = map(numbers, n => n * 2);
console.log('Doubled:', doubled); // [2, 4, 6, 8, 10]

const evens = filter(numbers, n => n % 2 === 0);
console.log('Evens:', evens); // [2, 4]

const sum = reduce(numbers, (acc, n) => acc + n, 0);
console.log('Sum:', sum); // 15
```

## Funzioni di Ordinamento Personalizzate

Un altro uso comune delle funzioni come argomenti è definire criteri di ordinamento personalizzati.

```javascript
// Array di oggetti da ordinare
const people = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 },
  { name: 'Diana', age: 28 }
];

// Ordinamento per età (crescente)
people.sort((a, b) => a.age - b.age);
console.log('Ordinati per età crescente:', people);

// Ordinamento per nome (alfabetico)
people.sort((a, b) => a.name.localeCompare(b.name));
console.log('Ordinati per nome:', people);

// Funzione di ordinamento più complessa
function sortBy(property, direction = 'asc') {
  return function(a, b) {
    const aValue = a[property];
    const bValue = b[property];
    
    if (direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  };
}

// Utilizzo della funzione di ordinamento personalizzata
people.sort(sortBy('age', 'desc'));
console.log('Ordinati per età decrescente:', people);

people.sort(sortBy('name'));
console.log('Ordinati per nome crescente:', people);
```

## Event Handling e Listeners

Le funzioni come argomenti sono alla base del sistema di gestione degli eventi in JavaScript:

```javascript
// Nel browser, aggiungiamo un listener di eventi
document.getElementById('myButton').addEventListener('click', function(event) {
  console.log('Pulsante cliccato!', event);
});

// Creazione di un sistema di eventi semplice
class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return this; // Per concatenamento
  }
  
  emit(event, ...args) {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
    return this; // Per concatenamento
  }
  
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event]
        .filter(listener => listener !== callback);
    }
    return this; // Per concatenamento
  }
}

// Utilizzo dell'event emitter
const emitter = new EventEmitter();

function handleUserLogin(user) {
  console.log(`Utente ${user.name} ha effettuato l'accesso`);
}

function sendWelcomeEmail(user) {
  console.log(`Email di benvenuto inviata a ${user.email}`);
}

emitter
  .on('login', handleUserLogin)
  .on('login', sendWelcomeEmail);

// Simulazione di un login
emitter.emit('login', { name: 'Alice', email: 'alice@example.com' });
```

## Middleware e Pipeline di Processing

Le funzioni come argomenti sono utilizzate per creare pipeline di elaborazione o sistemi middleware, dove ogni funzione nella catena elabora i dati e li passa alla funzione successiva.

```javascript
// Implementazione di un sistema middleware simile a Express.js
function createApp() {
  const middlewares = [];
  
  // Aggiungi un middleware alla catena
  function use(middleware) {
    middlewares.push(middleware);
    return this; // Per concatenamento
  }
  
  // Esegui la catena dei middleware
  function run(input) {
    let index = 0;
    
    function next(err) {
      // Se c'è un errore, lo propaghiamo
      if (err) {
        console.error('Error in middleware:', err);
        return;
      }
      
      // Prossimo middleware nella catena
      const middleware = middlewares[index++];
      if (middleware) {
        try {
          middleware(input, next);
        } catch (error) {
          next(error);
        }
      }
    }
    
    // Avvia la catena
    next();
  }
  
  return { use, run };
}

// Utilizzo
const app = createApp();

app.use((data, next) => {
  console.log('Middleware 1: validazione dati');
  if (!data.username) {
    next(new Error('Username mancante'));
    return;
  }
  data.username = data.username.trim();
  next();
});

app.use((data, next) => {
  console.log('Middleware 2: aggiunta timestamp');
  data.timestamp = new Date().toISOString();
  next();
});

app.use((data, next) => {
  console.log('Middleware 3: output finale');
  console.log('Dati elaborati:', data);
  next();
});

// Esecuzione della pipeline
app.run({ username: 'alice', password: '12345' });
// app.run({ password: '12345' }); // Genererebbe un errore
```

## Trasformazione e Validazione di Dati

Le funzioni come argomenti possono essere utilizzate per definire routine di trasformazione e validazione dei dati:

```javascript
// Funzione per applicare una serie di trasformazioni a un valore
function pipe(value, ...transformations) {
  return transformations.reduce((result, transform) => transform(result), value);
}

// Utilizzo
const result = pipe(
  "   Hello, World!   ",
  str => str.trim(),
  str => str.toUpperCase(),
  str => str.replace("HELLO", "HI"),
  str => str.length
);

console.log(result); // 12

// Funzione per validare un oggetto in base a una serie di regole
function validate(object, ...validators) {
  const errors = [];
  
  validators.forEach(validator => {
    try {
      validator(object);
    } catch (error) {
      errors.push(error.message);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Funzioni di validazione
function requiredField(fieldName) {
  return object => {
    if (!object[fieldName]) {
      throw new Error(`Il campo "${fieldName}" è obbligatorio`);
    }
  };
}

function minLength(fieldName, min) {
  return object => {
    if (object[fieldName] && object[fieldName].length < min) {
      throw new Error(`Il campo "${fieldName}" deve contenere almeno ${min} caratteri`);
    }
  };
}

// Utilizzo
const user = { username: "al", email: "" };

const validation = validate(
  user,
  requiredField("username"),
  requiredField("email"),
  minLength("username", 3)
);

console.log('Validazione utente:', validation.isValid);
console.log('Errori:', validation.errors);
```

## Best Practices

Quando si utilizzano funzioni come argomenti, ci sono alcune pratiche da seguire per migliorare la manutenibilità e la comprensibilità del codice:

### 1. Usare Nomi Significativi per le Funzioni di Callback

```javascript
// ❌ Non chiaro cosa faccia la funzione
array.filter(x => x > 10);

// ✅ Chiaro e autodescrittivo
const isGreaterThanTen = x => x > 10;
array.filter(isGreaterThanTen);
```

### 2. Limitare il Numero di Parametri

```javascript
// ❌ Troppi parametri rendono difficile ricordare l'ordine
function processData(data, processFn, errorFn, completeFn, progressFn, options) {
  // ...
}

// ✅ Utilizzare un oggetto di opzioni per parametri complessi
function processData(data, { 
  onProcess, 
  onError, 
  onComplete, 
  onProgress,
  options = {}
}) {
  // ...
}
```

### 3. Gestire gli Errori nei Callback

```javascript
// ❌ Callback senza gestione degli errori
function fetchData(url, callback) {
  fetch(url)
    .then(res => res.json())
    .then(data => callback(data));
  // Se si verifica un errore, callback non viene mai chiamata
}

// ✅ Callback con gestione degli errori
function fetchData(url, successCallback, errorCallback) {
  fetch(url)
    .then(res => res.json())
    .then(data => successCallback(data))
    .catch(error => errorCallback(error));
}

// ✅ Oppure utilizzare un unico callback con schema di errore
function fetchData(url, callback) {
  fetch(url)
    .then(res => res.json())
    .then(data => callback(null, data))
    .catch(error => callback(error, null));
}
```

### 4. Evitare il Callback Hell

```javascript
// ❌ Callback hell
fetchUser(userId, function(user) {
  fetchPosts(user.id, function(posts) {
    fetchComments(posts[0].id, function(comments) {
      // Nidificazione profonda
    });
  });
});

// ✅ Funzioni nominate per ridurre la nidificazione
function handleComments(comments) {
  // Elabora commenti
}

function handlePosts(posts) {
  fetchComments(posts[0].id, handleComments);
}

function handleUser(user) {
  fetchPosts(user.id, handlePosts);
}

fetchUser(userId, handleUser);

// ✅ Oppure utilizzare Promise o async/await
```

## Conclusione

Le funzioni come argomenti sono un concetto potente che consente di creare codice flessibile, riutilizzabile e modulare. Questo pattern è alla base di molte caratteristiche moderne di JavaScript, dalle operazioni su array ai sistemi di middleware, dalla gestione degli eventi alla programmazione asincrona.

Padroneggiando questa tecnica, puoi costruire astrazioni eleganti che separano "cosa fare" da "come farlo", permettendo di scrivere codice più dichiarativo e manutenibile. Nel prossimo capitolo, esploreremo l'altro aspetto fondamentale delle higher-order functions: le funzioni che restituiscono altre funzioni.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Cos'è una Higher-Order Function](./01-CosaSonoHOF.md)
- [➡️ Funzioni che Restituiscono Funzioni](./03-FunzioniCheRestituisconoFunzioni.md)
