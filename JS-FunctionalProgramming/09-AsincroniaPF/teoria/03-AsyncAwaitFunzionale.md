# Async/Await in Contesto Funzionale

Async/await è un'estensione sintattica di JavaScript che rende più leggibile il codice asincrono basato su Promise. Introdotto in ES2017 (ES8), questo costrutto permette di scrivere codice asincrono che appare e si comporta come codice sincrono, semplificando enormemente la lettura e la manutenzione.

In questo capitolo, esploreremo come utilizzare async/await in modo funzionale, mantenendo i principi di purezza, componibilità e gestione degli errori.

## Fondamenti di Async/Await

Prima di tutto, è importante ricordare che async/await è semplicemente "syntactic sugar" sopra le Promise. Non introduce un nuovo modello di asincronia, ma migliora l'espressività di quello esistente.

```javascript
// Una funzione asincrona restituisce sempre una Promise
async function fetchData() {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  return data;
}

// Equivalente a:
function fetchData() {
  return fetch('https://api.example.com/data')
    .then(response => response.json());
}
```

### Caratteristiche principali:

1. **`async`**: Dichiarare una funzione come `async` fa sì che restituisca implicitamente una Promise
2. **`await`**: Permette di "attendere" che una Promise venga risolta e ne estrae il valore
3. **Gestione errori**: Si può utilizzare la classica sintassi `try/catch` per gestire gli errori

## Utilizzo di async/await in modo funzionale

### Creare funzioni pure asincrone

Una funzione asincrona può essere considerata "pura" nel contesto funzionale se:
- Per gli stessi input (e stato del mondo esterno) produce sempre la stessa Promise
- Non modifica lo stato al di fuori del suo scope
- Isola correttamente gli effetti collaterali

```javascript
// Funzione asincrona pura
// La purezza è relativa all'output della Promise, non all'operazione async in sé
async function pureAsyncAdd(a, b) {
  await delay(100); // Simuliamo un'operazione asincrona
  return a + b; // Il risultato dipende solo dagli input
}

// Utility per creare un delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
```

### Componibilità con funzioni asincrone

Uno dei vantaggi di async/await è la possibilità di comporre funzioni asincrone in modo chiaro:

```javascript
// Comporre funzioni asincrone
async function processUserData(userId) {
  const user = await fetchUser(userId);
  const enrichedUser = await addUserMetadata(user);
  const permissions = await fetchUserPermissions(user.id);
  
  return {
    ...enrichedUser,
    permissions,
    lastProcessed: new Date()
  };
}
```

Per migliorare ulteriormente la componibilità, possiamo creare utility che supportano la composizione di funzioni async:

```javascript
// Comporre funzioni asincrone in stile point-free
const composeAsync = (...fns) => async (initialValue) => {
  return fns.reduceRight(
    async (value, fn) => fn(await value),
    Promise.resolve(initialValue)
  );
};

const pipeAsync = (...fns) => async (initialValue) => {
  return fns.reduce(
    async (value, fn) => fn(await value),
    Promise.resolve(initialValue)
  );
};

// Utilizzo
const processUser = pipeAsync(
  fetchUser,
  addUserMetadata,
  async user => ({
    ...user,
    permissions: await fetchUserPermissions(user.id)
  })
);

// Esecuzione
processUser(1).then(console.log).catch(console.error);
```

## Gestione degli errori

Con async/await, possiamo usare il tradizionale `try/catch` per gestire gli errori, il che rende il codice più leggibile rispetto alle catene di `.catch()`.

### Approccio base con try/catch

```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return { error: true, message: error.message };
  }
}
```

### Approccio funzionale alla gestione degli errori

Per una gestione degli errori più in linea con i principi funzionali, possiamo utilizzare Either o Result pattern:

```javascript
// Definizione di un semplice tipo Result
const Result = {
  ok: value => ({ ok: true, value, isError: false }),
  error: error => ({ ok: false, error, isError: true })
};

// Funzione wrapper per catturare errori in modo funzionale
async function safeAsync(fn, ...args) {
  try {
    const result = await fn(...args);
    return Result.ok(result);
  } catch (error) {
    return Result.error(error);
  }
}

// Utilizzo
async function processDataSafely() {
  const dataResult = await safeAsync(fetchData);
  
  if (dataResult.isError) {
    // Gestisci l'errore in modo funzionale
    return handleError(dataResult.error);
  }
  
  // Procedi con il dato valido
  return transformData(dataResult.value);
}
```

## Mantenere la purezza con async/await

### Isolamento degli effetti collaterali

Per mantenere una buona architettura funzionale con async/await, è consigliabile isolare gli effetti collaterali ai bordi del sistema:

```javascript
// Architettura a cipolla con effetti collaterali isolati

// Layer esterno: effetti collaterali
async function fetchUserFromAPI(id) {
  const response = await fetch(`https://api.example.com/users/${id}`);
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  return response.json();
}

// Layer intermedio: funzioni pure che gestiscono dati
function normalizeUser(userData) {
  return {
    id: userData.id,
    fullName: `${userData.firstName} ${userData.lastName}`,
    email: userData.email.toLowerCase(),
    isActive: Boolean(userData.status === 'active')
  };
}

// Layer di orchestrazione: collega effetti collaterali e logica pura
async function getUser(id) {
  const userData = await fetchUserFromAPI(id);
  return normalizeUser(userData);
}
```

### Dependency Injection per testabilità

Per rendere il codice asincrono più testabile, possiamo utilizzare la dependency injection:

```javascript
// Versione testabile con dependency injection
async function processOrder(orderId, { fetchOrder, calculateTax, saveOrder }) {
  const order = await fetchOrder(orderId);
  const taxedOrder = calculateTax(order);  // Funzione pura
  return await saveOrder(taxedOrder);
}

// In produzione
processOrder('123', { 
  fetchOrder: realFetchOrder, 
  calculateTax: realCalculateTax,
  saveOrder: realSaveOrder 
});

// Nei test
test('processOrder applies tax correctly', async () => {
  const mockOrder = { id: '123', total: 100 };
  const mockFetchOrder = async () => mockOrder;
  const mockSaveOrder = async order => order;
  
  const result = await processOrder('123', {
    fetchOrder: mockFetchOrder,
    calculateTax: order => ({ ...order, total: order.total * 1.1, tax: order.total * 0.1 }),
    saveOrder: mockSaveOrder
  });
  
  expect(result.total).toBe(110);
  expect(result.tax).toBe(10);
});
```

## Pattern avanzati con async/await

### Concorrenza controllata

Esecuzione di operazioni parallele ma con controllo:

```javascript
// Esecuzione concorrente di più operazioni
async function fetchAllUserData(userId) {
  // Avvia tutte le Promise in parallelo
  const [profile, posts, followers] = await Promise.all([
    fetchUserProfile(userId),
    fetchUserPosts(userId),
    fetchUserFollowers(userId)
  ]);
  
  return { profile, posts, followers };
}

// Esecuzione concorrente con limite
async function processItems(items, concurrency = 5) {
  const results = [];
  
  // Processa gli item in gruppi per limitare la concorrenza
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map(item => processItem(item))
    );
    results.push(...chunkResults);
  }
  
  return results;
}
```

### Pattern sequenziali con riduzione asincrona

Elaborazione sequenziale di array con funzioni asincrone:

```javascript
// Riduzione asincrona sequenziale
async function asyncReduce(array, asyncReducer, initialValue) {
  let accumulator = initialValue;
  
  for (const item of array) {
    accumulator = await asyncReducer(accumulator, item);
  }
  
  return accumulator;
}

// Esempio di utilizzo
async function calculateTotalWithAPI(items) {
  return asyncReduce(items, async (total, item) => {
    const priceInfo = await fetchPriceFromAPI(item.id);
    return total + (priceInfo.price * item.quantity);
  }, 0);
}
```

### Throttling e rate-limiting

Gestire chiamate API con limitazioni di frequenza:

```javascript
// Funzione per limitare la frequenza delle chiamate API
async function throttleAsync(fn, delay) {
  let lastCall = 0;
  
  return async function(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall < delay) {
      // Aspetta il tempo necessario
      await delay(delay - timeSinceLastCall);
    }
    
    lastCall = Date.now();
    return fn(...args);
  };
}

// Utilizzo
const throttledApiCall = throttleAsync(fetchData, 1000); // Max 1 richiesta al secondo

for (const id of userIds) {
  const data = await throttledApiCall(id);
  processData(data);
}
```

## Limitazioni di async/await

Nonostante la sua eleganza, async/await ha alcune limitazioni:

1. **Eager evaluation**: Come le Promise, le funzioni async vengono eseguite immediatamente quando chiamate
2. **Cancellazione**: Non esiste un meccanismo nativo per annullare un'operazione async/await in corso
3. **Gestione del contesto**: L'operatore `this` può causare confusione nelle funzioni async

## Confronto tra Promise e async/await

| Caratteristica | Promise | async/await |
|---------------|---------|-------------|
| Sintassi | Basata su metodi (.then, .catch) | Appare sincrona |
| Leggibilità | Buona per catene semplici | Eccellente, specialmente per flussi complessi |
| Gestione errori | .catch() | try/catch |
| Debugging | Difficile tracciare gli stack | Migliore tracciabilità degli stack |
| Parallelismo | Promise.all, Promise.race | Usati con await Promise.all() |

## Best practice

1. **Preferisci async/await** per la leggibilità, ma ricorda che sono Promise sotto il cofano
2. **Isola gli effetti collaterali** in funzioni specifiche e mantieni pure le funzioni di trasformazione
3. **Utilizza Promise.all** per operazioni parallele quando possibile
4. **Gestisci sempre gli errori**, sia con try/catch che con pattern funzionali
5. **Non abusare di await** quando non necessario (es. per Promise indipendenti)

## Conclusione

Async/await è un potente strumento che può essere utilizzato in armonia con i principi della programmazione funzionale. Combinando la semplicità sintattica di async/await con i pattern funzionali come la separazione di effetti collaterali e logica pura, possiamo creare codice asincrono che è leggibile, manutenibile e testabile.

Nel prossimo capitolo esploreremo il Task monad, che affronta alcune limitazioni delle Promise come l'eager evaluation e la mancanza di supporto nativo per la cancellazione.
