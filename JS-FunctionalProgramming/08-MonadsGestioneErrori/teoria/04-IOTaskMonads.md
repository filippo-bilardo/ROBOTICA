# IO e Task Monads

Se **Maybe** e **Either** gestiscono valori potenzialmente assenti ed errori, i monads **IO** e **Task** affrontano un altro problema fondamentale della programmazione funzionale: gli **effetti collaterali**.

## Il Problema degli Effetti Collaterali

Le funzioni pure dovrebbero:
1. Dipendere solo dagli input (nessuna variabile esterna)
2. Non modificare lo stato al di fuori della funzione
3. Restituire sempre lo stesso output per gli stessi input

Tuttavia, le applicazioni reali richiedono interazioni con il mondo esterno:
- Lettura/scrittura di file
- Accesso a database
- Chiamate API
- Input dell'utente
- Generazione di numeri casuali

Queste operazioni sono effetti collaterali e violano i principi della purezza funzionale.

## L'Approccio IO Monad

Il **IO Monad** risolve questo problema **incapsulando** le operazioni impure:
- Invece di eseguire direttamente un effetto collaterale, lo descriviamo
- Costruiamo una struttura dati che rappresenta l'azione
- Eseguiamo l'azione solo quando necessario

Questo ci permette di:
1. Mantenere la maggior parte del codice pura
2. Rendere espliciti gli effetti collaterali
3. Comporre azioni impure come se fossero pure
4. Ritardare l'esecuzione degli effetti collaterali

## Implementazione Base dell'IO Monad

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
  
  flatMap(fn) {
    return new IO(() => fn(this.effect()).effect());
  }
  
  // Esegue effettivamente l'effetto collaterale
  run() {
    return this.effect();
  }
}
```

## Come Utilizzare IO

```javascript
// Funzioni di base per interagire con il mondo esterno
const getFromStorage = key => new IO(() => localStorage.getItem(key));
const setToStorage = (key, value) => new IO(() => localStorage.setItem(key, value));
const log = message => new IO(() => console.log(message));

// Programma che utilizza effetti collaterali in modo puro
const program = getFromStorage('username')
  .map(name => name || 'Utente anonimo')
  .flatMap(name => log(`Benvenuto, ${name}!`))
  .flatMap(() => setToStorage('lastLogin', new Date().toISOString()));

// Nessun effetto collaterale è stato ancora eseguito a questo punto!
// L'esecuzione avviene solo quando chiamiamo run()
program.run();
```

Il programma sopra costruisce una descrizione di ciò che dovrebbe accadere, ma non esegue nulla fino alla chiamata di `.run()`. Questo separa la descrizione da ciò che fa, permettendoci di trattare operazioni impure come valori.

## Il Task Monad per Operazioni Asincrone

L'**IO Monad** gestisce operazioni sincrone, ma molti effetti collaterali in JavaScript sono asincroni. Il **Task Monad** (a volte chiamato **Future** o **Async**) estende l'idea di IO per gestire operazioni asincrone:

```javascript
class Task {
  constructor(computation) {
    this.computation = computation;
  }
  
  static of(value) {
    return new Task(resolve => resolve(value));
  }
  
  static rejected(error) {
    return new Task((_, reject) => reject(error));
  }
  
  // Crea un Task da una Promise
  static fromPromise(promise) {
    return new Task((resolve, reject) => {
      promise.then(resolve).catch(reject);
    });
  }
  
  map(fn) {
    return new Task((resolve, reject) => {
      this.computation(
        value => resolve(fn(value)),
        reject
      );
    });
  }
  
  flatMap(fn) {
    return new Task((resolve, reject) => {
      this.computation(
        value => {
          try {
            fn(value).fork(resolve, reject);
          } catch (e) {
            reject(e);
          }
        },
        reject
      );
    });
  }
  
  // Gestione degli errori
  catch(fn) {
    return new Task((resolve, reject) => {
      this.computation(
        resolve,
        error => {
          try {
            fn(error).fork(resolve, reject);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }
  
  // Esecuzione del task
  fork(onSuccess, onFailure = err => { throw err; }) {
    try {
      this.computation(onSuccess, onFailure);
    } catch (e) {
      onFailure(e);
    }
  }
}
```

## Come Utilizzare Task

```javascript
// Funzioni helper per lavorare con API
const fetchData = url => Task.fromPromise(fetch(url).then(res => res.json()));
const saveToDb = data => Task.fromPromise(db.save(data));

// Programma che utilizza operazioni asincrone in modo funzionale
const program = fetchData('https://api.example.com/users')
  .map(users => users.filter(user => user.active))
  .flatMap(activeUsers => saveToDb(activeUsers))
  .map(result => `Salvati ${result.count} utenti attivi`);

// L'esecuzione avviene solo quando chiamiamo fork
program.fork(
  message => console.log('Successo:', message),
  error => console.error('Errore:', error)
);
```

## Task vs. Promise

JavaScript ha le Promise native. Perché usare Task?

**Similitudini**:
- Entrambi gestiscono computazioni asincrone
- Entrambi supportano concatenazione di operazioni
- Entrambi separano la definizione dall'esecuzione

**Differenze**:
1. **Eager vs. Lazy**: 
   - Le Promise sono eager (l'operazione inizia immediatamente alla creazione)
   - I Task sono lazy (l'operazione inizia solo quando si chiama fork)

2. **Cancellabilità**:
   - Le Promise non sono cancellabili una volta iniziate
   - I Task possono essere implementati per supportare la cancellazione

3. **Componibilità**:
   - I Task seguono più strettamente le leggi monadiche
   - I Task possono essere più facilmente composti con altri monads

```javascript
// Promise (eager)
const promise = new Promise((resolve) => {
  console.log('Effetto collaterale eseguito immediatamente!');
  resolve(42);
});

// Task (lazy)
const task = new Task((resolve) => {
  console.log('Effetto collaterale eseguito solo quando richiesto');
  resolve(42);
});

console.log('Prima dell'esecuzione');
// Con la promise, l'effetto è già stato eseguito
// Con task, l'effetto non è ancora stato eseguito

task.fork(x => console.log(x)); // Solo ora l'effetto viene eseguito
```

## Funzioni Utili per Task

### Parallelizzazione di Task

```javascript
Task.all = function(tasks) {
  return new Task((resolve, reject) => {
    const results = new Array(tasks.length);
    let completed = 0;
    let hasRejected = false;
    
    tasks.forEach((task, i) => {
      task.fork(
        value => {
          if (!hasRejected) {
            results[i] = value;
            completed++;
            
            if (completed === tasks.length) {
              resolve(results);
            }
          }
        },
        error => {
          if (!hasRejected) {
            hasRejected = true;
            reject(error);
          }
        }
      );
    });
  });
};
```

Utilizzo:

```javascript
const fetchUser = id => fetchData(`/users/${id}`);

// Esegui richieste in parallelo
Task.all([
  fetchUser(1),
  fetchUser(2),
  fetchUser(3)
]).fork(
  users => console.log('Utenti:', users),
  error => console.error('Errore:', error)
);
```

## Combinare IO e Task

In una applicazione reale, potremmo voler combinare entrambi i monads:

```javascript
// IO per operazioni sincrone impure
const getConfig = () => new IO(() => JSON.parse(localStorage.getItem('config') || '{}'));
const logToConsole = msg => new IO(() => console.log(msg));

// Task per operazioni asincrone
const fetchWithConfig = config => 
  new Task((resolve, reject) => {
    fetch(`${config.apiUrl}/data`, {
      headers: { 'Authorization': `Bearer ${config.token}` }
    })
    .then(res => res.json())
    .then(resolve)
    .catch(reject);
  });

// Combinare IO e Task
const program = getConfig()
  .map(config => {
    // Validazione di configurazione
    if (!config.apiUrl) throw new Error('API URL mancante');
    return config;
  })
  .flatMap(config => {
    // Trasforma l'IO in un Task
    return Task.of(config)
      .flatMap(fetchWithConfig)
      .map(data => ({ config, data }));
  });
```

## Gestire Effetti Collaterali in Modo Tipo

L'uso di IO e Task ci permette di avere una tipizzazione esplicita degli effetti collaterali:

```javascript
// Funzione pura
const addNumbers = (a, b) => a + b;  // number -> number -> number

// Funzione che accede al sistema di file (IO)
const readConfigFile = () => new IO(() => fs.readFileSync('config.json', 'utf8'));  
// () -> IO<string>

// Funzione che fa una chiamata di rete (Task)
const fetchUserData = userId => Task.fromPromise(fetch(`/users/${userId}`).then(r => r.json()));
// number -> Task<Error, User>
```

Questo approccio rende immediatamente chiaro quali funzioni hanno effetti collaterali e di che tipo.

## Conclusione

I monads **IO** e **Task** ci permettono di:

1. **Rendere espliciti** gli effetti collaterali nel tipo di ritorno
2. **Posticipare** l'esecuzione degli effetti collaterali
3. **Comporre** catene di operazioni impure mantenendo la purezza funzionale
4. **Separare** la descrizione dell'effetto dalla sua esecuzione

Adottare questi pattern ci porta verso una programmazione più dichiarativa, dove descriviamo *cosa* deve essere fatto piuttosto che *come* farlo, lasciando l'esecuzione effettiva al runtime.

Nel prossimo capitolo, esploreremo l'ecosistema di librerie che supportano questi pattern in JavaScript e come integrarli in progetti reali.
