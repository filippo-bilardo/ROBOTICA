# Monads in JavaScript

Nel corso dei precedenti capitoli, abbiamo implementato da zero vari monads per comprenderne il funzionamento interno. Tuttavia, in un progetto reale, raramente implementerai questi pattern manualmente. Esistono numerose librerie che forniscono monads e altre strutture funzionali ben testate e ottimizzate.

## Ecosistema di Librerie Funzionali in JavaScript

### 1. Fantasy Land

[Fantasy Land](https://github.com/fantasyland/fantasy-land) non è una libreria ma una specifica che definisce interfacce comuni per strutture algebriche in JavaScript. È il fondamento di molte librerie funzionali e garantisce interoperabilità tra di esse.

Le principali strutture definite includono:
- **Functor** (`map`)
- **Monad** (`of`, `chain`)
- **Applicative** (`ap`)

### 2. Librerie Principali con Monads

#### Folktale

[Folktale](https://folktale.origamitower.com/) offre strutture dati funzionali con implementazioni di Maybe, Either (chiamato Result), Task e altri:

```javascript
const { Result, Maybe } = require('folktale');

// Maybe
const maybeName = Maybe.fromNullable(user.name);
const greeting = maybeName
  .map(name => `Hello, ${name}!`)
  .getOrElse("Hello, Guest!");

// Result (Either)
const divide = (a, b) =>
  b === 0 
    ? Result.Error('Division by zero')
    : Result.Ok(a / b);

divide(10, 2).map(x => x + 1);  // Result.Ok(6)
divide(10, 0).map(x => x + 1);  // Result.Error('Division by zero')
```

#### Sanctuary

[Sanctuary](https://sanctuary.js.org/) è una libreria con forte ispirazione da Haskell che fornisce funzioni pure e tipi algebrici:

```javascript
const S = require('sanctuary');

// Maybe
const fullName = user =>
  S.pipe([
    S.get(S.is(S.String), 'name'),
    S.map(name => `${name} ${S.fromMaybe('', S.get(S.is(S.String), 'surname', user))}`),
    S.map(S.trim)
  ])(user);

// Either
const getPort = env =>
  S.pipe([
    S.get(S.is(S.String), 'PORT'),
    S.map(parseInt),
    S.chain(port => 
      isNaN(port) || port <= 0 || port > 65535
        ? S.Left('Invalid port')
        : S.Right(port))
  ])(env);
```

#### Crocks

[Crocks](https://github.com/evilsoft/crocks) offre implementazioni concrete delle ADT più comuni nella programmazione funzionale:

```javascript
const { Async, Maybe, Result, compose, safe, isNumber } = require('crocks');

// Async (simile a Task)
const fetchData = url => 
  Async((reject, resolve) => {
    fetch(url)
      .then(res => res.json())
      .then(resolve)
      .catch(reject);
  });

fetchData('https://api.example.com/users')
  .map(users => users.filter(user => user.active))
  .fork(
    err => console.error('Failed to fetch users', err),
    data => console.log('Active users:', data)
  );
```

#### Ramda Fantasy

[Ramda Fantasy](https://github.com/ramda/ramda-fantasy) è una raccolta di tipi di dati algebrici che si integrano con la libreria Ramda:

```javascript
const R = require('ramda');
const { Maybe, Either } = require('ramda-fantasy');

const { Just, Nothing } = Maybe;
const { Left, Right } = Either;

const findUser = (id, users) => {
  const user = users.find(user => user.id === id);
  return user ? Just(user) : Nothing();
};

const validateEmail = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? Right(email)
    : Left('Invalid email format');
```

### 3. Monads in Promise-based APIs

Le Promise native di JavaScript implementano un comportamento monadico (anche se non completamente conforme):

```javascript
// Promise come un monad
Promise.resolve(21)           // unit/of
  .then(x => Promise.resolve(x * 2))  // flatMap/chain con Promise
  .then(x => x + 1)           // map con valore puro
  .then(console.log);         // 43
```

### 4. RxJS e Programmazione Reattiva

[RxJS](https://rxjs-dev.firebaseapp.com/) implementa il pattern Observable che ha caratteristiche monadiche e si concentra sui flussi di dati:

```javascript
import { from, of } from 'rxjs';
import { map, filter, mergeMap, catchError } from 'rxjs/operators';

from(fetch('https://api.example.com/users').then(res => res.json()))
  .pipe(
    map(users => users.filter(user => user.active)),
    mergeMap(users => from(users)),
    filter(user => user.age > 18),
    map(user => user.name),
    catchError(err => of(`Error: ${err.message}`))
  )
  .subscribe({
    next: name => console.log(`Active user: ${name}`),
    error: err => console.error('Error:', err),
    complete: () => console.log('Processing complete')
  });
```

## Interoperabilità con Promise

Dato che le Promise sono native in JavaScript, è comune dover interfacciare monads personalizzati con Promise:

### Da Promise a Task

```javascript
// Con una libreria personalizzata
Task.fromPromise = promise => new Task((resolve, reject) => {
  promise.then(resolve).catch(reject);
});

// Con Folktale
const { task } = require('folktale');
const taskFromPromise = promise => 
  task(resolver => {
    promise.then(resolver.resolve).catch(resolver.reject);
  });

// Esempio
const fetchTask = url => Task.fromPromise(fetch(url).then(res => res.json()));
```

### Da Maybe/Either a Promise

```javascript
// Either to Promise
Either.prototype.toPromise = function() {
  return this.isRight()
    ? Promise.resolve(this._value)
    : Promise.reject(this._value);
};

// Maybe to Promise con valore di default o errore
Maybe.prototype.toPromise = function(defaultValue, errorMsg) {
  return this.isNothing()
    ? defaultValue !== undefined
      ? Promise.resolve(defaultValue)
      : Promise.reject(new Error(errorMsg || 'Value is Nothing'))
    : Promise.resolve(this._value);
};
```

## Best Practices nell'Uso dei Monads

### 1. Coerenza nei Tipi di Ritorno

Mantieni coerenza nei tipi di ritorno delle funzioni, evitando di mescolare stili diversi:

```javascript
// Approccio incoerente
function getUserName(userId) {
  if (validateId(userId)) {
    return fetchUser(userId).then(user => user.name);  // Promise
  }
  return null;  // null
}

// Approccio coerente con Maybe
function getUserName(userId) {
  return validateId(userId)
    ? Maybe.fromPromise(fetchUser(userId)).map(user => user.name)
    : Maybe.nothing();
}

// Approccio coerente con Promise
function getUserName(userId) {
  return validateId(userId)
    ? fetchUser(userId).then(user => user.name)
    : Promise.reject(new Error('Invalid ID'));
}
```

### 2. Evita Nesting Eccessivo

Usa `flatMap` (chain) invece di `map` quando lavori con funzioni che restituiscono monads:

```javascript
// Cattivo - nesting
Maybe.fromNullable(user)
  .map(user => Maybe.fromNullable(user.address))  // Maybe<Maybe<Address>>

// Buono - flatMap
Maybe.fromNullable(user)
  .flatMap(user => Maybe.fromNullable(user.address))  // Maybe<Address>
```

### 3. Usa Helper di Lifting

Crea helper per sollevare funzioni regolari in contesti monadici:

```javascript
// Lifting per Maybe
function liftMaybe2(fn) {
  return (ma, mb) => 
    ma.flatMap(a => mb.map(b => fn(a, b)));
}

const add = (a, b) => a + b;
const maybeAdd = liftMaybe2(add);

const result = maybeAdd(Maybe.just(5), Maybe.just(10));  // Maybe.just(15)
const noResult = maybeAdd(Maybe.just(5), Maybe.nothing());  // Maybe.nothing()
```

### 4. Componi Trasformazioni

Usa composizione per costruire pipeline di trasformazioni:

```javascript
const { compose, pipe } = require('ramda');

// Pipeline di validazione con Either
const validateUser = pipe(
  checkUsername,       // String -> Either Error String
  either => either.flatMap(checkEmail),  // Either Error String -> Either Error String
  either => either.flatMap(checkPassword)  // Either Error String -> Either Error String
);

// Alternativamente con operatori di composizione specifici
const validateUser = compose(
  chainEither(checkPassword),
  chainEither(checkEmail),
  checkUsername
);
```

### 5. Gestisci Conversioni di Contesto con Attenzione

Quando devi passare tra diversi contesti monadici, fallo in modo esplicito:

```javascript
// Da Maybe a Either
const maybeToEither = (maybe, errorMsg) =>
  maybe.isNothing()
    ? Either.left(new Error(errorMsg))
    : Either.right(maybe.value);

// Da async/await a Task
const asyncToTask = asyncFn => (...args) =>
  Task.fromPromise(asyncFn(...args));
```

## Quando Non Usare Monads

I monads sono potenti ma non sempre la soluzione migliore:

1. **Progetti piccoli** - In script semplici, l'overhead può non valere il beneficio
2. **Team non familiare** con concetti funzionali - La curva di apprendimento può rallentare il progresso
3. **Quando le API native** sono sufficienti - In molti casi, Promise e optional chaining sono adeguati

## Conclusione

I monads in JavaScript offrono un modo strutturato per gestire valori nei contesti, sia per errori che per effetti collaterali. Il ricco ecosistema di librerie rende accessibile questo pattern anche senza dover scrivere implementazioni personalizzate.

La scelta della libreria giusta dipende dalle esigenze specifiche del progetto:
- **Folktale** per un'implementazione pulita e leggera
- **Sanctuary** per un'esperienza simile a Haskell con type checking runtime
- **Promise native** per operazioni asincrone semplici
- **RxJS** per flussi di dati reattivi più complessi

Indipendentemente dalla libreria scelta, comprendere i principi dei monads vi permetterà di scrivere codice più composibile, dichiarativo e facile da ragionare anche quando si gestiscono errori ed effetti collaterali.
