# Task Monad e Alternative

Il Task monad è una potente astrazione per gestire operazioni asincrone in modo funzionale. A differenza delle Promise native di JavaScript, il Task monad offre caratteristiche che lo rendono particolarmente adatto a una programmazione funzionale rigorosa: valutazione lazy, migliore componibilità, e spesso un supporto nativo per la cancellazione.

## Cos'è un Task Monad?

Un Task monad rappresenta una computazione asincrona che:

1. **Non viene eseguita finché non viene esplicitamente avviata** (lazy evaluation)
2. **Può completarsi con successo o fallire**
3. **Può essere composta con altre operazioni** tramite metodi come map, chain, ap
4. **Può essere cancellata** (a seconda dell'implementazione)

Concettualmente, possiamo pensare a Task come una funzione che produce una Promise quando viene eseguita.

## Implementazione base di Task

Ecco una semplice implementazione di Task:

```javascript
class Task {
  constructor(computation) {
    this.computation = computation;
  }
  
  // Esegue effettivamente la computazione
  fork(onRejected, onResolved) {
    return this.computation(onRejected, onResolved);
  }
  
  // Applicare una trasformazione al risultato (functor)
  map(fn) {
    return new Task((reject, resolve) => {
      return this.computation(reject, value => {
        try {
          resolve(fn(value));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  
  // Concatenazione di Task (monad)
  chain(fn) {
    return new Task((reject, resolve) => {
      return this.computation(reject, value => {
        try {
          fn(value).fork(reject, resolve);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  
  // Gestisce gli errori trasformandoli
  mapRejected(fn) {
    return new Task((reject, resolve) => {
      return this.computation(
        err => {
          try {
            reject(fn(err));
          } catch (e) {
            reject(e);
          }
        },
        resolve
      );
    });
  }
  
  // Metodi statici per creare Task
  static of(value) {
    return new Task((_, resolve) => resolve(value));
  }
  
  static rejected(error) {
    return new Task(reject => reject(error));
  }
  
  // Trasforma una funzione che ritorna una Promise in Task
  static fromPromise(promiseFn) {
    return (...args) => new Task((reject, resolve) => {
      promiseFn(...args)
        .then(resolve)
        .catch(reject);
    });
  }
}
```

## Confronto tra Task e Promise

| Caratteristica | Promise | Task |
|---------------|---------|------|
| Valutazione | Eager (esecuzione immediata) | Lazy (esecuzione differita) |
| Controllo | Limitato al momento di creazione | Totale fino all'esecuzione |
| Cancellazione | Non supportata nativamente | Spesso implementata |
| Componibilità | Buona via .then() | Eccellente via map/chain/ap |
| Trasparenza | Opaca (difficile da testare) | Trasparente (facile da testare) |
| Gestione errori | .catch() | Gestita via fork/mapRejected |

## Quando usare Task invece di Promise

Task è particolarmente vantaggioso nei seguenti scenari:

1. **Operazioni che devono essere posticipate** fino a un momento specifico
2. **Sequenze complesse** che beneficiano di alta componibilità
3. **Operazioni che potrebbero dover essere annullate**
4. **Test di codice asincrono** dove è necessario controllare il flusso di esecuzione
5. **Casi in cui l'effetto collaterale deve essere isolato** dalla definizione

## Esempi di utilizzo di Task

### Esempio base: operazioni in sequenza

```javascript
// Definizione delle operazioni (nessuna viene eseguita al momento della definizione)
const getUserTask = id => 
  new Task((reject, resolve) => {
    console.log(`Fetching user ${id}...`);
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(resolve)
      .catch(reject);
  });

const getPostsTask = userId => 
  new Task((reject, resolve) => {
    console.log(`Fetching posts for user ${userId}...`);
    fetch(`/api/users/${userId}/posts`)
      .then(res => res.json())
      .then(resolve)
      .catch(reject);
  });

// Composizione (ancora nessuna esecuzione)
const getUserWithPostsTask = userId =>
  getUserTask(userId)
    .chain(user => 
      getPostsTask(user.id)
        .map(posts => ({ ...user, posts }))
    );

// Esecuzione solo quando decidiamo di farlo
getUserWithPostsTask(1).fork(
  error => console.error("Error:", error),
  data => console.log("Success:", data)
);

// Potremmo anche decidere di NON eseguirlo mai, ed è qui la differenza chiave
// rispetto a Promise, che viene eseguita immediatamente alla creazione
```

### Trasformare Promise in Task

```javascript
// Helper per convertire una Promise in Task
const fromPromise = promise => 
  new Task((reject, resolve) => {
    promise.then(resolve).catch(reject);
  });

// Helper per convertire funzioni che ritornano Promise in funzioni che ritornano Task
const taskify = promiseFn => (...args) => 
  fromPromise(promiseFn(...args));

// Esempio di utilizzo
const fetchData = url => fetch(url).then(res => res.json());
const fetchDataTask = taskify(fetchData);

fetchDataTask('/api/data')
  .map(data => data.filter(item => item.active))
  .fork(
    err => console.error("Failed to fetch:", err),
    filteredData => console.log("Filtered data:", filteredData)
  );
```

### Task con cancellazione

Una delle caratteristiche più potenti di Task è la possibilità di implementare la cancellazione:

```javascript
class CancellableTask extends Task {
  constructor(computation) {
    super(computation);
    this.cancel = () => {}; // Funzione di default
  }
  
  fork(onRejected, onResolved) {
    let cancelled = false;
    
    // Creiamo una funzione di cancellazione specifica per questa esecuzione
    const token = {
      isCancelled: () => cancelled,
      cancel: () => {
        cancelled = true;
        this.cancel(); // Esegue la cancellazione specifica dell'operazione
      }
    };
    
    // Override delle callback per controllare lo stato di cancellazione
    const safeOnResolved = value => {
      if (!cancelled) onResolved(value);
    };
    
    const safeOnRejected = error => {
      if (!cancelled) onRejected(error);
    };
    
    // Eseguiamo la computazione e otteniamo una funzione di cancellazione
    const cancelFn = this.computation(safeOnRejected, safeOnResolved);
    
    // Aggiorniamo la funzione di cancellazione
    if (typeof cancelFn === 'function') {
      this.cancel = cancelFn;
    }
    
    return token;
  }
  
  // Metodo statico per creare un task da una funzione che potrebbe richiedere cancellazione
  static fromCancellable(fn) {
    return new CancellableTask((reject, resolve) => {
      const cancelFn = fn(resolve, reject);
      return cancelFn;
    });
  }
}

// Esempio: HTTP request cancellabile
const fetchWithTimeout = (url, timeoutMs = 5000) => {
  return CancellableTask.fromCancellable((resolve, reject) => {
    const controller = new AbortController();
    const { signal } = controller;
    
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    
    fetch(url, { signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        resolve(data);
      })
      .catch(err => {
        clearTimeout(timeoutId);
        reject(err);
      });
      
    // Restituiamo la funzione di cancellazione
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  });
};

// Utilizzo
const task = fetchWithTimeout('/api/data');
const token = task.fork(
  error => console.error("Request failed:", error),
  data => console.log("Data received:", data)
);

// In un altro punto dell'applicazione potremmo cancellare la richiesta
setTimeout(() => {
  token.cancel();
  console.log("Request cancelled");
}, 2000);
```

## Librerie per Task monad

Diverse librerie implementano il Task monad in JavaScript:

### 1. Folktale

[Folktale](https://folktale.origamitower.com/) fornisce un'implementazione completa di Task:

```javascript
const { task } = require('folktale/concurrency/task');

const delayedGreeting = name =>
  task(resolver => {
    const timerId = setTimeout(() => {
      resolver.resolve(`Hello, ${name}!`);
    }, 1000);
    
    return () => clearTimeout(timerId); // cancellation function
  });

delayedGreeting('Alice')
  .map(greeting => greeting.toUpperCase())
  .run()
  .listen({
    onCancelled: () => console.log('Task was cancelled'),
    onRejected: error => console.error('Task failed with:', error),
    onResolved: value => console.log('Task succeeded with:', value)
  });
```

### 2. Fluture

[Fluture](https://github.com/fluture-js/Fluture) è una libreria alternativa ottimizzata per prestazioni e usabilità:

```javascript
const Future = require('fluture');

// Creazione di un Future/Task
const delayedValue = value =>
  Future.after(1000)(value);

// Composizione
const computation =
  delayedValue(21)
    .map(x => x * 2)
    .chain(x => 
      x > 40
        ? Future.reject(new Error('Value too large'))
        : Future.resolve(x)
    );

// Esecuzione
computation.fork(
  error => console.error('Error:', error),
  result => console.log('Result:', result)
);
```

### 3. RxJS

Sebbene RxJS sia incentrato su Observable, che è leggermente diverso da Task, fornisce modelli simili per il flusso asincrono:

```javascript
const { Observable } = require('rxjs');
const { map, catchError } = require('rxjs/operators');

const fetchUser = id =>
  new Observable(subscriber => {
    const controller = new AbortController();
    const { signal } = controller;
    
    fetch(`/api/users/${id}`, { signal })
      .then(response => response.json())
      .then(data => {
        subscriber.next(data);
        subscriber.complete();
      })
      .catch(error => subscriber.error(error));
    
    // Cleanup function when unsubscribed
    return () => controller.abort();
  });

const subscription = fetchUser(1)
  .pipe(
    map(user => ({ ...user, fullName: `${user.firstName} ${user.lastName}` })),
    catchError(error => {
      console.error('Error fetching user:', error);
      return [];
    })
  )
  .subscribe({
    next: user => console.log('User data:', user),
    complete: () => console.log('Fetch completed')
  });

// Cancellazione
setTimeout(() => {
  subscription.unsubscribe();
  console.log('Fetch cancelled');
}, 2000);
```

## Alternative a Task

Oltre a Task, esistono altre astrazioni funzionali per gestire l'asincronia:

### 1. IO Monad per operazioni sincrone con effetti collaterali

```javascript
class IO {
  constructor(effect) {
    this.effect = effect;
  }
  
  static of(value) {
    return new IO(() => value);
  }
  
  map(fn) {
    return new IO(() => fn(this.effect()));
  }
  
  chain(fn) {
    return new IO(() => fn(this.effect()).effect());
  }
  
  run() {
    return this.effect();
  }
}

// Esempio di utilizzo per effetti collaterali sincronici
const getRandomIO = new IO(() => Math.random());

const randomInRange = (min, max) =>
  getRandomIO
    .map(n => Math.floor(n * (max - min + 1)) + min);

console.log(randomInRange(1, 6).run()); // Lancia un dado
```

### 2. TaskEither: combinazione di Task e Either

TaskEither combina Task (per l'asincronia) ed Either (per la gestione deterministica degli errori):

```javascript
class TaskEither {
  constructor(computation) {
    this.computation = computation;
  }
  
  // Esegue la computazione
  fork(onLeft, onRight) {
    return this.computation(onLeft, onRight);
  }
  
  // Map sul caso di successo
  map(fn) {
    return new TaskEither((onLeft, onRight) => {
      return this.computation(onLeft, value => {
        try {
          onRight(fn(value));
        } catch (e) {
          onLeft(e);
        }
      });
    });
  }
  
  // Chain sul caso di successo
  chain(fn) {
    return new TaskEither((onLeft, onRight) => {
      return this.computation(onLeft, value => {
        try {
          fn(value).fork(onLeft, onRight);
        } catch (e) {
          onLeft(e);
        }
      });
    });
  }
  
  // Map sul caso di errore
  mapLeft(fn) {
    return new TaskEither((onLeft, onRight) => {
      return this.computation(
        error => onLeft(fn(error)),
        onRight
      );
    });
  }
  
  // Metodi statici per creare istanze
  static right(value) {
    return new TaskEither((_, onRight) => onRight(value));
  }
  
  static left(error) {
    return new TaskEither((onLeft) => onLeft(error));
  }
  
  static fromTask(task) {
    return new TaskEither((onLeft, onRight) => {
      return task.fork(onLeft, onRight);
    });
  }
  
  static fromPromise(promiseFn) {
    return (...args) => new TaskEither((onLeft, onRight) => {
      promiseFn(...args)
        .then(onRight)
        .catch(onLeft);
    });
  }
}

// Esempio di utilizzo
const fetchUser = id =>
  TaskEither.fromPromise(() => 
    fetch(`/api/users/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
  )();

fetchUser(1)
  .map(user => ({ ...user, fullName: `${user.firstName} ${user.lastName}` }))
  .mapLeft(error => new Error(`Failed to fetch user: ${error.message}`))
  .fork(
    error => console.error("Error:", error.message),
    user => console.log("User:", user)
  );
```

## Integrazione di Task in architetture più ampie

Task si integra bene in architetture funzionali più ampie:

### Architettura a strati con Task

```javascript
// Layer 1: Repository (I/O)
const userRepository = {
  findById: id => Task.fromPromise(() => fetch(`/api/users/${id}`).then(res => res.json()))(),
  update: user => Task.fromPromise(() => 
    fetch(`/api/users/${user.id}`, { 
      method: 'PUT', 
      body: JSON.stringify(user),
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
  )()
};

// Layer 2: Servizi (logica di business)
const userService = {
  updateUserPreferences: (userId, newPrefs) => 
    userRepository.findById(userId)
      .map(user => ({ ...user, preferences: { ...user.preferences, ...newPrefs } }))
      .chain(updatedUser => userRepository.update(updatedUser))
};

// Layer 3: Applicazione (orchestrazione)
const updateUserTheme = (userId, theme) => 
  userService.updateUserPreferences(userId, { theme })
    .map(user => `Theme updated to ${theme} for ${user.name}`)
    .fork(
      error => console.error("Failed to update theme:", error),
      message => console.log(message)
    );
```

## Conclusione

Il Task monad rappresenta un'astrazione potente per gestire operazioni asincrone in modo funzionale. Risolve molte delle limitazioni delle Promise native offrendo lazy evaluation, maggiore componibilità e supporto per la cancellazione.

Sebbene richieda una comprensione più profonda dei concetti funzionali, Task ripaga questo investimento con codice più testabile, manutenibile e ragionabile, specialmente in applicazioni complesse con molte operazioni asincrone interdipendenti.

Nel prossimo capitolo esploreremo strategie più generali per gestire gli effetti collaterali nel codice asincrono, applicando sia il Task monad che altre tecniche funzionali.
