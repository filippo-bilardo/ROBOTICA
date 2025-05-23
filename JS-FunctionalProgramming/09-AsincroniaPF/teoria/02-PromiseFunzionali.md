# Promise in Stile Funzionale

Le Promise in JavaScript rappresentano un punto di svolta nella gestione dell'asincronia. Sebbene non siano state progettate specificamente con la programmazione funzionale in mente, possono essere utilizzate in modo da rispettare molti principi funzionali come la componibilità e la gestione degli effetti collaterali.

## Promise come contenitori di valori futuri

Dal punto di vista funzionale, una Promise può essere vista come un "contenitore" di un valore che potrebbe non essere ancora disponibile. Questo è concettualmente simile a monads come Maybe o Either, con alcune differenze fondamentali:

1. **Temporal behavior**: Una Promise rappresenta un valore nel tempo
2. **Eager evaluation**: Una Promise inizia la sua esecuzione immediatamente quando viene creata
3. **Single settlement**: Una Promise può essere risolta (o rigettata) una sola volta

## Proprietà funzionali delle Promise

### Immutabilità

Una volta creata, una Promise non può essere modificata dall'esterno. Il suo stato interno cambia una sola volta, da `pending` a `fulfilled` o `rejected`, dopodiché rimane immutabile.

```javascript
const promise = new Promise(resolve => {
  setTimeout(() => resolve(42), 1000);
});

// Non possiamo modificare il valore della Promise dall'esterno
// Queste chiamate non hanno effetto sulla Promise originale
promise.then(x => x * 2);
promise.catch(err => console.error(err));

// La Promise originale conterrà sempre 42 quando risolta
```

### Componibilità tramite `.then()`

Il metodo `.then()` è l'equivalente funzionale di `map` e `chain` (flatMap) combinati:

```javascript
// Componibilità con .then()
fetchUser(userId)
  .then(user => user.profile)           // map: trasforma il valore
  .then(profile => fetchPosts(profile))  // chain: restituisce una nuova Promise
  .then(posts => posts.filter(p => p.published))
  .catch(err => handleError(err));
```

### Funzioni helper funzionali

Possiamo creare funzioni helper che seguono principi funzionali:

```javascript
// Versione funzionale di Promise.all su un oggetto
const objectPromiseAll = obj => {
  const keys = Object.keys(obj);
  const promises = Object.values(obj);
  
  return Promise.all(promises)
    .then(values => {
      return keys.reduce((result, key, index) => {
        result[key] = values[index];
        return result;
      }, {});
    });
};

// Utilizzo
const data = {
  user: fetchUser(1),
  posts: fetchPosts(1),
  comments: fetchComments(1)
};

objectPromiseAll(data)
  .then(({ user, posts, comments }) => {
    // Ora abbiamo tutti i dati in un oggetto strutturato
  });
```

## Composizione di Promise

### Pipeline asincrone

Possiamo creare pipeline di trasformazione dei dati con Promise, simili a quelle che costruiremo con funzioni sincrone:

```javascript
// Funzioni pure che restituiscono Promise
const fetchUserById = id => 
  fetch(`/api/users/${id}`).then(res => res.json());

const fetchUserPosts = user => 
  fetch(`/api/users/${user.id}/posts`).then(res => res.json());

const fetchPostComments = post => 
  fetch(`/api/posts/${post.id}/comments`).then(res => res.json());

// Composizione di funzioni asincrone
const getUserPostsWithComments = userId => 
  fetchUserById(userId)
    .then(user => fetchUserPosts(user)
      .then(posts => Promise.all(
        posts.map(post => 
          fetchPostComments(post)
            .then(comments => ({ ...post, comments }))
        )
      ))
      .then(postsWithComments => ({ ...user, posts: postsWithComments }))
    );

// Utilizzo
getUserPostsWithComments(1)
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Point-free style con Promise

Possiamo utilizzare un approccio "point-free" anche con le Promise, sebbene richieda alcune utility functions:

```javascript
// Utility per lavorare in stile point-free con Promise
const pipeP = (...fns) => x => fns.reduce((y, f) => y.then(f), Promise.resolve(x));

const tapP = f => x => Promise.resolve(f(x)).then(() => x);

const logP = tapP(console.log);

// Utilizzo in stile point-free
const processUser = pipeP(
  fetchUserById,
  logP,  // Log intermedio
  user => ({ ...user, lastAccess: new Date() }),
  updateUser,
  logP    // Log del risultato finale
);

processUser(1).catch(console.error);
```

## Parallelismo funzionale con Promise.all e Promise.race

Le Promise offrono metodi statici che permettono di gestire operazioni parallele in modo funzionale:

### Promise.all - Esecuzione parallela con attesa di tutti i risultati

`Promise.all` permette di eseguire più operazioni asincrone in parallelo e attendere che siano tutte completate:

```javascript
// Recupero di dati da più fonti in parallelo
const getUserData = userId => {
  return Promise.all([
    fetchUserProfile(userId),
    fetchUserPosts(userId),
    fetchUserFollowers(userId)
  ]).then(([profile, posts, followers]) => ({
    profile,
    posts,
    followers,
    postCount: posts.length,
    followerCount: followers.length
  }));
};
```

Una versione funzionale migliorata potrebbe essere:

```javascript
// Map su Promise.all in stile funzionale
const traversePromise = (array, fn) => Promise.all(array.map(fn));

const processItems = items => 
  traversePromise(items, async item => {
    const result = await processItem(item);
    return transformResult(result);
  });
```

### Promise.race - Prima Promise a completarsi

`Promise.race` è utile per implementare pattern come timeout o selezione del risultato più veloce:

```javascript
const withTimeout = (promise, timeoutMs) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Operazione scaduta')), timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
};

// Utilizzo
withTimeout(fetchData('/api/slowendpoint'), 5000)
  .then(handleData)
  .catch(err => {
    if (err.message === 'Operazione scaduta') {
      // Gestione specifica del timeout
    } else {
      // Altri errori
    }
  });
```

### Promise.allSettled - Attendere tutti i risultati indipendentemente dal successo

`Promise.allSettled` (ES2020) ci permette di gestire un gruppo di Promise e ottenere tutti i risultati, sia successi che fallimenti:

```javascript
const attemptAllOperations = operations => {
  return Promise.allSettled(operations.map(op => op()))
    .then(results => {
      const successful = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);
      
      const failed = results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason);
      
      return { successful, failed };
    });
};
```

## Gestione errori funzionale

Le Promise offrono `.catch()` per gestire gli errori, ma possiamo adottare approcci più funzionali:

```javascript
// Funzione di recupero con gestione automatica dell'errore 
const safePromise = (promise, defaultValue) => 
  promise.catch(err => defaultValue);

// Funzione per recuperare più volte prima di fallire
const retryPromise = (fn, retries, delay = 300) => {
  return fn().catch(err => {
    if (retries <= 0) throw err;
    return new Promise(resolve => setTimeout(resolve, delay))
      .then(() => retryPromise(fn, retries - 1, delay * 1.5));
  });
};

// Utilizzo
retryPromise(() => fetchData('/api/unreliable'), 3)
  .then(handleData)
  .catch(handleError);
```

## Avvolgere API basate su callback

Per utilizzare un approccio funzionale con API legacy basate su callback, possiamo avvolgerle in Promise:

```javascript
// Promisify: trasforma una funzione basata su callback in una che ritorna una Promise
const promisify = fn => (...args) => {
  return new Promise((resolve, reject) => {
    fn(...args, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// Esempio con API di Node.js basate su callback
const fs = require('fs');
const readFile = promisify(fs.readFile);

// Ora readFile ritorna una Promise
readFile('file.txt', 'utf8')
  .then(content => console.log(content))
  .catch(err => console.error('Errore di lettura:', err));
```

## Limitazioni delle Promise

Nonostante i vantaggi, le Promise hanno alcune limitazioni dal punto di vista funzionale:

1. **Eager evaluation**: le Promise iniziano l'esecuzione immediatamente quando create
2. **Non cancellabili**: una volta iniziata, una Promise non può essere interrotta
3. **Effetti collaterali non controllati**: non esiste un meccanismo nativo per isolare gli effetti

Queste limitazioni verranno affrontate dal Task monad che vedremo più avanti.

## Conclusione

Le Promise sono un ottimo punto di partenza per la programmazione asincrona in stile funzionale in JavaScript. Offrono componibilità e gestione degli errori in modo più pulito rispetto ai callback tradizionali. Nei capitoli successivi vedremo come async/await migliora ulteriormente la leggibilità del codice, e come il Task monad risolve alcune delle limitazioni delle Promise dal punto di vista puramente funzionale.
