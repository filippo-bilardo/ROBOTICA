# Pattern Funzionali Avanzati

Oltre alle tecniche base di currying, applicazione parziale e composizione, la programmazione funzionale offre una serie di pattern avanzati che possono essere utilizzati per risolvere problemi complessi in modo elegante. In questo capitolo, esploreremo alcuni di questi pattern e come possono essere applicati in JavaScript.

## Functors

Un Functor è semplicemente un tipo di dato che implementa una funzione `map`. Gli array in JavaScript sono un esempio nativo di Functor:

```javascript
const numeri = [1, 2, 3];
const raddoppiati = numeri.map(n => n * 2); // [2, 4, 6]
```

Possiamo creare i nostri Functor personalizzati:

```javascript
// Un semplice Functor Box
const Box = x => ({
  map: f => Box(f(x)),
  fold: f => f(x),
  toString: () => `Box(${x})`
});

const risultato = Box(5)
  .map(x => x + 1)
  .map(x => x * 2);

console.log(risultato.toString()); // Box(12)
console.log(risultato.fold(x => x)); // 12
```

Il vantaggio dei Functor è che ci permettono di concatenare operazioni mantenendo i valori in un "contenitore" sicuro.

## Monads

Le Monads sono Functor che implementano anche metodi aggiuntivi come `flatMap` (o `chain`, o `bind`). Permettono di concatenare operazioni che restituiscono valori già "contenuti":

```javascript
// Una semplice implementazione di Maybe
const Maybe = {
  just: x => ({
    map: f => Maybe.just(f(x)),
    flatMap: f => f(x),
    getOrElse: () => x,
    isNothing: () => false,
    toString: () => `Maybe.just(${x})`
  }),
  nothing: () => ({
    map: () => Maybe.nothing(),
    flatMap: () => Maybe.nothing(),
    getOrElse: defaultValue => defaultValue,
    isNothing: () => true,
    toString: () => 'Maybe.nothing'
  }),
  fromNullable: x => x != null ? Maybe.just(x) : Maybe.nothing()
};

// Utilizzo di Maybe per gestire errori in modo elegante
const dividiFun = (a, b) => b === 0 ? Maybe.nothing() : Maybe.just(a / b);

const risultato = dividiFun(10, 2)
  .map(x => x + 1)
  .flatMap(x => dividiFun(x, 0))
  .getOrElse('Errore di divisione');

console.log(risultato); // 'Errore di divisione'
```

## Lenti (Lenses)

Le lenti sono strumenti per lavorare con strutture dati immutabili, permettendo di concentrarsi su parti specifiche di strutture nidificate:

```javascript
// Implementazione base di una lente
const lensProp = prop => ({
  get: obj => obj[prop],
  set: (obj, val) => ({ ...obj, [prop]: val })
});

// Funzioni di utilità per lavorare con lenti
const view = lens => obj => lens.get(obj);
const set = lens => (obj, val) => lens.set(obj, val);
const over = lens => (obj, fn) => lens.set(obj, fn(lens.get(obj)));

// Esempio di utilizzo
const utente = {
  nome: 'Mario',
  indirizzo: {
    via: 'Via Roma',
    città: 'Milano'
  }
};

const lensNome = lensProp('nome');
const lensIndirizzo = lensProp('indirizzo');
const lensCittà = lensProp('città');

// Composizione di lenti
const lensIndirizzoCity = {
  get: obj => lensCittà.get(lensIndirizzo.get(obj)),
  set: (obj, val) => {
    const indirizzo = lensIndirizzo.get(obj);
    const nuovoIndirizzo = lensCittà.set(indirizzo, val);
    return lensIndirizzo.set(obj, nuovoIndirizzo);
  }
};

console.log(view(lensNome)(utente)); // 'Mario'
console.log(view(lensIndirizzoCity)(utente)); // 'Milano'

const nuovoUtente = set(lensIndirizzoCity)(utente, 'Roma');
console.log(nuovoUtente);
// { nome: 'Mario', indirizzo: { via: 'Via Roma', città: 'Roma' } }
```

## Transducer

I Transducer sono compositori di trasformazioni che operano su dati in una sola passata, combinando operazioni come `map` e `filter` per evitare iterazioni multiple:

```javascript
// Implementazioni base
const map = f => reducer => (acc, value) => reducer(acc, f(value));
const filter = predicate => reducer => (acc, value) => 
  predicate(value) ? reducer(acc, value) : acc;

// Composizione di transducer
const transducer = compose(
  map(x => x + 1),
  filter(x => x % 2 === 0)
);

// Funzione per applicare un transducer a un array
const transduce = (transducer, reducer, initial, array) => {
  const transformedReducer = transducer(reducer);
  return array.reduce(transformedReducer, initial);
};

// Utilizzo
const numeri = [1, 2, 3, 4, 5];
const risultato = transduce(
  transducer,
  (acc, x) => [...acc, x], // reducer
  [],                      // valore iniziale
  numeri                   // array da elaborare
);
console.log(risultato); // [2, 4, 6]
```

## Memoization

La memoization è una tecnica di ottimizzazione che memorizza i risultati di chiamate di funzioni costose, migliorando le prestazioni:

```javascript
// Funzione di memoization generica
const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Esempio: funzione di Fibonacci ricorsiva con memoization
const fibonacci = memoize(n => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.time('Fibonacci 40');
console.log(fibonacci(40));
console.timeEnd('Fibonacci 40'); // Molto veloce grazie alla memoization
```

## Pattern Matching

Sebbene JavaScript non supporti nativamente il pattern matching come altri linguaggi funzionali, possiamo implementare una versione semplice:

```javascript
// Implementazione base di pattern matching
const match = (value, patterns) => {
  for (const [predicate, transformer] of Object.entries(patterns)) {
    if (predicate === '_' || // caso di default
        (typeof predicate === 'function' && predicate(value)) ||
        value === predicate) {
      return typeof transformer === 'function' ? transformer(value) : transformer;
    }
  }
};

// Utilizzo
const factorial = n => match(n, {
  0: 1,
  _: n => n * factorial(n - 1)
});

console.log(factorial(5)); // 120

// Pattern matching più complesso
const tipoValore = val => match(val, {
  [v => typeof v === 'string']: 'È una stringa',
  [v => typeof v === 'number']: 'È un numero',
  [v => Array.isArray(v)]: 'È un array',
  _: 'Tipo non specificato'
});

console.log(tipoValore('hello')); // 'È una stringa'
console.log(tipoValore(123)); // 'È un numero'
console.log(tipoValore([1, 2, 3])); // 'È un array'
console.log(tipoValore({})); // 'Tipo non specificato'
```

## Gestione degli Effetti con Functors

Possiamo utilizzare Functors come `Task` per gestire operazioni asincrone e altri effetti collaterali in modo più funzionale:

```javascript
// Task Functor per operazioni asincrone
const Task = fork => ({
  fork,
  map: f => Task((reject, resolve) => fork(reject, x => resolve(f(x)))),
  chain: f => Task((reject, resolve) => fork(reject, x => f(x).fork(reject, resolve))),
  ap: other => Task((reject, resolve) => {
    let func;
    let val;
    let funcReady = false;
    let valReady = false;
    
    fork(reject, f => {
      func = f;
      funcReady = true;
      if (valReady) resolve(func(val));
    });
    
    other.fork(reject, v => {
      val = v;
      valReady = true;
      if (funcReady) resolve(func(val));
    });
  })
});

// Costruttori per Task
Task.of = x => Task((_, resolve) => resolve(x));
Task.rejected = x => Task((reject, _) => reject(x));
Task.fromPromise = promise => 
  Task((reject, resolve) => 
    promise.then(resolve).catch(reject)
  );

// Esempi di utilizzo
const fetchUser = id => 
  Task.fromPromise(
    fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
      .then(res => res.json())
  );

const getUsername = user => user.username;

fetchUser(1)
  .map(getUsername)
  .fork(
    err => console.error('Errore:', err),
    username => console.log('Username:', username)
  );
```

## Applicazione di Pattern Funzionali a Problemi Reali

### Gestione degli Errori con Either

```javascript
// Either Monad per gestione errori
const Either = {
  Left: x => ({
    map: () => Either.Left(x),
    chain: () => Either.Left(x),
    fold: (f, _) => f(x),
    toString: () => `Left(${x})`
  }),
  Right: x => ({
    map: f => Either.Right(f(x)),
    chain: f => f(x),
    fold: (_, g) => g(x),
    toString: () => `Right(${x})`
  }),
  fromNullable: x => x != null ? Either.Right(x) : Either.Left(null),
  tryCatch: (f, errorHandler = e => e) => {
    try {
      return Either.Right(f());
    } catch (e) {
      return Either.Left(errorHandler(e));
    }
  }
};

// Utilizzo in un'applicazione reale
const getUser = id => {
  if (id <= 0) return Either.Left('ID non valido');
  return Either.Right({ id, name: 'Mario' });
};

const getAddress = user => {
  if (!user.address) return Either.Left('Indirizzo mancante');
  return Either.Right(user.address);
};

const displayUserAddress = userId => 
  getUser(userId)
    .chain(getAddress)
    .fold(
      error => `Errore: ${error}`,
      address => `Indirizzo: ${address}`
    );

console.log(displayUserAddress(1)); // 'Errore: Indirizzo mancante'
console.log(displayUserAddress(0)); // 'Errore: ID non valido'
```

### Composizione di Funzioni Asincrone

```javascript
// Composizione di funzioni asincrone con Promise
const composeAsync = (...fns) => 
  initialValue => 
    fns.reduceRight(
      (accumulator, fn) => accumulator.then(fn), 
      Promise.resolve(initialValue)
    );

// Utilizzo pratico
const fetchUserData = id => 
  fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
    .then(res => res.json());

const fetchUserPosts = user => 
  fetch(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`)
    .then(res => res.json())
    .then(posts => ({ ...user, posts }));

const formatUserReport = user => ({
  nome: user.name,
  email: user.email,
  numeroPost: user.posts.length,
  titoli: user.posts.map(post => post.title)
});

const getUserReport = composeAsync(
  formatUserReport,
  fetchUserPosts,
  fetchUserData
);

getUserReport(1)
  .then(report => console.log('Report utente:', report))
  .catch(err => console.error('Errore:', err));
```

## Conclusione

I pattern funzionali avanzati offrono strumenti potenti per affrontare problemi complessi in modo modulare e composabile. Sebbene alcuni di questi pattern richiedano un cambio di mentalità se si proviene da un background di programmazione imperativa, i benefici in termini di correttezza del codice, manutenibilità e ragionamento possono essere significativi.

La chiave è iniziare incorporando gradualmente questi pattern nel proprio codice, partendo dalle tecniche più semplici come currying e composizione, e progressivamente adottando pattern più avanzati man mano che si acquisisce familiarità con l'approccio funzionale.
