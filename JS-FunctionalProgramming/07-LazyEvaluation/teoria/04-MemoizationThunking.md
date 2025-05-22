# Memoization e Thunking

La memoization e il thunking sono tecniche che, combinate con la lazy evaluation, permettono di ottimizzare l'esecuzione del codice. Queste strategie sono particolarmente utili quando si lavora con funzioni pure e calcoli costosi che potrebbero essere riutilizzati.

## Thunking

### Il Concetto di Thunk

Un thunk è una funzione che incapsula un'espressione, ritardandone l'esecuzione fino a quando non è realmente necessaria. In altre parole, è un modo per convertire un calcolo immediato in un calcolo lazy.

```javascript
// Calcolo immediato (eager)
const result = expensiveOperation(42);

// Thunk (lazy)
const lazyResult = () => expensiveOperation(42);
// L'operazione costosa viene eseguita solo quando chiamiamo lazyResult()
```

### Casi d'Uso per i Thunk

I thunk sono particolarmente utili in diversi scenari:

1. **Ritardare calcoli costosi**:
   ```javascript
   const heavyComputation = n => {
     console.log('Esecuzione calcolo costoso...');
     // Simuliamo un calcolo intensivo
     let result = 0;
     for (let i = 0; i < n * 1000000; i++) {
       result += Math.sin(i);
     }
     return result;
   };

   // Versione thunk
   const lazyHeavyComputation = n => () => heavyComputation(n);

   console.log('Prima del thunk');
   const thunk = lazyHeavyComputation(10);
   console.log('Thunk creato, ma non ancora eseguito');
   console.log('Altre operazioni...');
   // Il calcolo avviene solo qui
   const result = thunk();
   console.log('Calcolo completato');
   ```

2. **Dependency injection**:
   ```javascript
   // Configurazione ritardata
   const createApiClient = config => {
     return () => {
       console.log('Inizializzazione client API con config:', config);
       // Inizializzazione e ritorno del client
       return { fetch: url => console.log(`Fetching ${url}...`) };
     };
   };

   const getApiClient = createApiClient({ baseUrl: 'https://api.example.com' });
   
   // L'inizializzazione avviene solo quando necessaria
   const apiClient = getApiClient();
   apiClient.fetch('/users');
   ```

3. **Gestione condizionale**:
   ```javascript
   // Esegui solo se necessario
   const ifThen = (condition, thenThunk, elseThunk) => {
     return condition ? thenThunk() : (elseThunk ? elseThunk() : undefined);
   };

   const result = ifThen(
     x > 10,
     () => expensiveOperationA(),
     () => expensiveOperationB()
   );
   ```

## Memoization

La memoization è una tecnica di ottimizzazione che memorizza i risultati di chiamate di funzione costose e restituisce il risultato memorizzato quando gli stessi input si verificano nuovamente.

### Implementazione Base della Memoization

```javascript
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log(`Risultato recuperato dalla cache per gli argomenti ${key}`);
      return cache.get(key);
    }
    
    console.log(`Calcolo risultato per gli argomenti ${key}`);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Esempio di utilizzo
const fibonacciNaive = n => {
  if (n <= 1) return n;
  return fibonacciNaive(n - 1) + fibonacciNaive(n - 2);
};

const fibonacciMemo = memoize(n => {
  if (n <= 1) return n;
  return fibonacciMemo(n - 1) + fibonacciMemo(n - 2);
});

console.time('naive');
console.log(fibonacciNaive(35)); // Molto lento
console.timeEnd('naive');

console.time('memoized');
console.log(fibonacciMemo(35)); // Molto più veloce
console.timeEnd('memoized');
```

### Memoization con Opzioni Avanzate

Una versione più avanzata con opzioni configurabili:

```javascript
function advancedMemoize(fn, options = {}) {
  const {
    maxSize = 100,  // Dimensione massima della cache
    ttl = Infinity, // Time-to-live in ms
    keyFn = (...args) => JSON.stringify(args) // Funzione di generazione chiave
  } = options;
  
  const cache = new Map();
  const timestamps = new Map();
  
  return function(...args) {
    const key = keyFn(...args);
    const now = Date.now();
    
    // Controlla se l'entry è scaduta
    if (timestamps.has(key) && now - timestamps.get(key) > ttl) {
      cache.delete(key);
      timestamps.delete(key);
    }
    
    // Recupera dalla cache se disponibile
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    // Calcola il risultato
    const result = fn.apply(this, args);
    
    // Gestisce la dimensione della cache
    if (cache.size >= maxSize) {
      // Strategia LRU semplificata: rimuovi la prima entry
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
      timestamps.delete(oldestKey);
    }
    
    // Memorizza risultato e timestamp
    cache.set(key, result);
    timestamps.set(key, now);
    
    return result;
  };
}
```

### Specializzazione di Funzioni con Memoization Parziale

La memoization può essere combinata con il currying per specializzare funzioni:

```javascript
const memoizedCalc = memoize((a, b, c) => {
  console.log('Calcolo costoso con', a, b, c);
  return a * b + c;
});

// Specializza la funzione per un valore di 'a' specifico
const specializedForA5 = (b, c) => memoizedCalc(5, b, c);

console.log(specializedForA5(2, 3)); // Calcolo: 5 * 2 + 3 = 13
console.log(specializedForA5(2, 3)); // Recuperato dalla cache: 13
console.log(specializedForA5(3, 4)); // Calcolo: 5 * 3 + 4 = 19
```

## Combinare Thunking e Memoization

La combinazione di thunking e memoization è particolarmente potente per implementare la lazy evaluation con risultati memorizzati:

### Lazy Loading con Memoization

```javascript
function lazyMemoize(thunk) {
  let computed = false;
  let result;
  
  return function() {
    if (!computed) {
      result = thunk();
      computed = true;
      // Rilasciamo il riferimento al thunk per permettere il garbage collection
      thunk = null;
    }
    return result;
  };
}

// Esempio
const expensiveData = lazyMemoize(() => {
  console.log('Caricamento dati...');
  return fetchLargeDataset(); // Ipotetica funzione costosa
});

// I dati vengono caricati solo alla prima chiamata
const data1 = expensiveData(); // Output: "Caricamento dati..."
const data2 = expensiveData(); // Nessun output, usa il risultato memorizzato
```

### Ricorsione Lazy con Memoization

```javascript
function lazyGraph(generateNodeFn) {
  const cache = new Map();
  
  function getNode(id) {
    if (!cache.has(id)) {
      // Creiamo un proxy per evitare ricorsione infinita durante la generazione
      const proxy = {};
      cache.set(id, proxy);
      
      // Genera il nodo effettivo
      const realNode = generateNodeFn(id, getNode);
      
      // Aggiorna il proxy con le proprietà del nodo reale
      Object.assign(proxy, realNode);
    }
    
    return cache.get(id);
  }
  
  return getNode;
}

// Esempio: Grafo di dipendenze
const dependencies = {
  'app': ['core', 'ui'],
  'core': ['utils', 'data'],
  'ui': ['utils'],
  'utils': [],
  'data': ['utils']
};

const getModuleDeps = lazyGraph((id, getNode) => {
  console.log(`Generazione dipendenze per ${id}`);
  
  const deps = dependencies[id] || [];
  return {
    id,
    dependencies: deps.map(getNode)
  };
});

// La generazione avviene on-demand e con caching
const appModule = getModuleDeps('app');
console.log(appModule.dependencies[0].id); // 'core'
console.log(appModule.dependencies[0].dependencies[0].id); // 'utils'

// Utils è già nella cache, non viene rigenerato
console.log(appModule.dependencies[1].dependencies[0].id); // 'utils'
```

## Performance e Ottimizzazioni

### Quando Usare la Memoization

La memoization è particolarmente utile quando:

1. **La funzione è pura** - produce lo stesso output per lo stesso input
2. **Le chiamate con gli stessi argomenti si ripetono** - altrimenti la cache è inutile
3. **Il calcolo è costoso** - il costo della memoization deve essere inferiore al risparmio
4. **Gli argomenti sono semplici** - la serializzazione di argomenti complessi potrebbe essere costosa

### Quando Usare il Thunking

Il thunking è particolarmente utile quando:

1. **Un calcolo potrebbe non essere necessario** - risparmia il calcolo se non viene mai usato
2. **Vuoi posticipare l'inizializzazione** - per ottimizzare il tempo di avvio
3. **Hai bisogno di implementare un valutazione lazy** - per sequenze o strutture dati infinite
4. **Stai implementando un sistema con dipendenze circolari** - per risolvere problemi di inizializzazione

### Limitazioni e Considerazioni

1. **Consumo di memoria**: la memoization può consumare molta memoria per grandi insiemi di input
2. **Funzioni impure**: la memoization non funziona correttamente con funzioni che hanno effetti collaterali
3. **Overhead di serializzazione**: la conversione di argomenti complessi in chiavi di cache può essere costosa
4. **Garbage Collection**: thunk che mantengono riferimenti a grandi oggetti possono causare problemi di memoria

## Implementazioni Pratiche

### Memoization con LRU Cache

```javascript
const LRU = require('lru-cache');

function memoizeWithLRU(fn, options = { max: 500 }) {
  const cache = new LRU(options);
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

### Auto-Memoization Ricorsiva

```javascript
function selfMemoize(fn) {
  const cache = new Map();
  
  const memoized = function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    // Sostituisce temporaneamente fn.memoized con la versione memoizzata
    const originalMemoized = fn.memoized;
    fn.memoized = memoized;
    
    try {
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    } finally {
      // Ripristina lo stato originale
      fn.memoized = originalMemoized;
    }
  };
  
  return memoized;
}

// Esempio di utilizzo
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci.memoized(n - 1) + fibonacci.memoized(n - 2);
}

fibonacci.memoized = selfMemoize(fibonacci);

console.log(fibonacci.memoized(40)); // Calcolo rapido
```

## Conclusione

Memoization e thunking sono tecniche potenti che, combinate con la lazy evaluation, possono migliorare significativamente le prestazioni del codice funzionale. La memoization evita calcoli ripetuti, mentre il thunking permette di ritardare calcoli potenzialmente non necessari.

Queste tecniche diventano particolarmente efficaci in applicazioni che:
- Eseguono calcoli intensivi
- Lavorano con strutture dati potenzialmente infinite
- Necessitano di ottimizzare l'utilizzo della memoria
- Implementano strategie di caching intelligenti

Nel prossimo capitolo, esploreremo come diverse librerie JavaScript implementano questi concetti e come integrarli efficacemente in progetti reali.
