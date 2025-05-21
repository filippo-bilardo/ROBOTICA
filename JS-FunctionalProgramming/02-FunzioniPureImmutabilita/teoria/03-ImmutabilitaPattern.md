# Immutabilità e Pattern

L'immutabilità è un principio fondamentale della programmazione funzionale che richiede che i dati non vengano modificati dopo la loro creazione. In questo capitolo, esploreremo il concetto di immutabilità, i suoi vantaggi e i pattern per implementarlo efficacemente in JavaScript.

## Cosa significa Immutabilità

L'immutabilità si riferisce allo stato di un oggetto che non può essere modificato dopo la sua creazione. In una programmazione puramente funzionale:

- Non si modificano mai i valori esistenti
- Si creano invece nuovi valori basati su quelli vecchi
- Le variabili sono in realtà costanti (riferimenti immutabili a valori)

In JavaScript, alcuni tipi primitivi sono naturalmente immutabili:
- Number
- String
- Boolean
- Symbol
- null
- undefined

Tuttavia, gli oggetti e gli array sono mutabili di default:

```javascript
// I tipi primitivi sono immutabili
let nome = "Alice";
nome.toUpperCase(); // Crea una NUOVA stringa, non modifica l'originale
console.log(nome); // Ancora "Alice"

// Gli oggetti sono mutabili
const utente = { nome: "Alice", età: 30 };
utente.età = 31; // Modifica l'oggetto originale
console.log(utente); // { nome: "Alice", età: 31 }
```

## Perché l'Immutabilità è Importante

L'immutabilità offre diversi vantaggi significativi:

### 1. Prevedibilità

Con dati immutabili, non c'è rischio che il valore di un oggetto cambi inaspettatamente tra un'operazione e l'altra.

### 2. Sicurezza nei Contesti Concorrenti

L'immutabilità elimina il rischio di race conditions tra thread o processi che accedono agli stessi dati.

### 3. Debugging Semplificato

Quando un dato non può cambiare, è più facile tracciare quando e dove viene creato un nuovo valore, rendendo il debug più semplice.

### 4. Facilitazione di Tecniche Avanzate di Ottimizzazione

Strutture dati immutabili possono utilizzare tecniche come la persistent data structure e la structural sharing per ottimizzare l'uso della memoria.

### 5. Supporta il Change Detection Efficiente

Frameworks come React possono utilizzare il confronto di referenze (shallow comparison) per determinare se un componente deve essere ri-renderizzato.

## Pattern di Immutabilità in JavaScript

JavaScript non ha costrutti nativi per l'immutabilità completa, ma possiamo utilizzare diversi pattern e tecniche per lavorare con dati immutabili.

### 1. Creazione di Copie invece di Mutazioni

Il pattern base per l'immutabilità è creare una nuova copia dei dati con le modifiche desiderate, invece di modificare direttamente i dati originali.

#### Per gli Array

```javascript
// ❌ Mutabile (da evitare in programmazione funzionale)
function aggiungiElementoMutabile(array, elemento) {
  array.push(elemento);
  return array;
}

// ✅ Immutabile
function aggiungiElementoImmutabile(array, elemento) {
  return [...array, elemento]; // Spread operator per creare un nuovo array
}

// Altri metodi immutabili per array
const originale = [1, 2, 3, 4, 5];

// Aggiungere elementi
const conNuovoElemento = [...originale, 6];

// Rimuovere elementi
const senzaPrimoElemento = originale.slice(1);
const senzaUltimoElemento = originale.slice(0, -1);

// Rimuovere un elemento specifico
const senzaElemento3 = originale.filter(x => x !== 3);

// Aggiornare un elemento specifico
const conElemento2Aggiornato = originale.map(x => x === 2 ? 20 : x);

// Inserire in una posizione specifica
const conNuovoElementoInMezzo = [
  ...originale.slice(0, 2),
  'nuovo',
  ...originale.slice(2)
];
```

#### Per gli Oggetti

```javascript
// ❌ Mutabile (da evitare in programmazione funzionale)
function aggiornaUtenteMutabile(utente, età) {
  utente.età = età;
  return utente;
}

// ✅ Immutabile
function aggiornaUtenteImmutabile(utente, età) {
  return { ...utente, età }; // Crea un nuovo oggetto con l'età aggiornata
}

// Altri metodi immutabili per oggetti
const utente = { nome: "Alice", età: 30, indirizzo: { città: "Roma", cap: "00100" } };

// Aggiornare un campo
const utenteConEtàAggiornata = { ...utente, età: 31 };

// Aggiungere un campo
const utenteConProfessione = { ...utente, professione: "Sviluppatore" };

// Rimuovere un campo
const { età, ...utenteSenzaEtà } = utente;

// Aggiornare un campo nidificato
const utenteConCapAggiornato = {
  ...utente,
  indirizzo: { ...utente.indirizzo, cap: "00153" }
};
```

### 2. Uso di Metodi Non-Mutanti

JavaScript offre sia metodi che mutano gli array originali, sia metodi che creano nuovi array. Nella programmazione funzionale, prediligiamo i secondi.

#### Metodi Array Mutanti (da evitare in programmazione funzionale)
- `push`, `pop`, `shift`, `unshift`
- `sort`, `reverse`
- `splice`

#### Metodi Array Non-Mutanti (da preferire)
- `concat`, `slice`
- `map`, `filter`, `reduce`
- `spread operator` (`[...array]`)

```javascript
// Anziché:
const numeri = [3, 1, 4, 1, 5];
numeri.sort(); // Modifica 'numeri'

// Preferire:
const numeri = [3, 1, 4, 1, 5];
const numeriOrdinati = [...numeri].sort(); // 'numeri' resta immutato
```

### 3. Deep Clone per Strutture Annidate

Lo spread operator (`...`) crea solo una copia superficiale (shallow copy). Per strutture nidificate più complesse, è necessario un deep clone:

```javascript
// Deep clone con JSON (funziona per strutture semplici)
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Deep clone ricorsivo (più flessibile)
function deepCloneRecursive(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepCloneRecursive(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepCloneRecursive(obj[key]);
    }
  }
  return cloned;
}
```

### 4. Freezing degli Oggetti

JavaScript offre `Object.freeze()` per rendere gli oggetti superficialmente immutabili:

```javascript
const punto = Object.freeze({ x: 10, y: 20 });
punto.x = 30; // In strict mode, genera un errore; altrimenti viene ignorato
console.log(punto.x); // Ancora 10

// Per un deep freeze:
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      deepFreeze(obj[prop]);
    }
  });
  
  return Object.freeze(obj);
}

const oggetto = deepFreeze({
  a: 1,
  b: {
    c: 2
  }
});
```

## Librerie per l'Immutabilità in JavaScript

Lavorare con l'immutabilità manuale può diventare verboso e soggetto a errori, specialmente con strutture dati complesse. Diverse librerie possono aiutare:

### 1. Immutable.js

[Immutable.js](https://immutable-js.com/) di Facebook offre strutture dati persistenti immutabili come `List`, `Map`, `Set`:

```javascript
const { Map } = require('immutable');
const map1 = Map({ a: 1, b: 2, c: 3 });
const map2 = map1.set('b', 50);
console.log(map1.get('b')); // 2
console.log(map2.get('b')); // 50
```

Vantaggi:
- Strutture dati veramente immutabili
- Ottimizzazioni per performance (structural sharing)
- API ricca

Svantaggi:
- Introduce un sistema di tipi separato da JavaScript
- Interoperabilità con codice JavaScript tradizionale richiede conversioni

### 2. Immer

[Immer](https://immerjs.github.io/immer/) permette di scrivere codice che sembra mutabile ma produce risultati immutabili:

```javascript
const produce = require('immer').produce;

const baseState = [
  { id: "todo1", done: false, text: "Studiare JS" },
  { id: "todo2", done: false, text: "Studiare React" }
];

const nextState = produce(baseState, draftState => {
  // Sembra mutabile, ma Immer garantisce l'immutabilità
  draftState[1].done = true;
  draftState.push({ id: "todo3", done: false, text: "Studiare TypeScript" });
});

// baseState non è stato modificato
console.log(baseState[1].done); // false
// nextState contiene le modifiche
console.log(nextState[1].done); // true
```

Vantaggi:
- Sintassi che sembra mutabile (familiare e meno verbosa)
- Integrazione trasparente con JavaScript nativo
- Performance ottimizzate

### 3. Ramda

[Ramda](https://ramdajs.com/) è una libreria funzionale con funzioni immutabili per operare su oggetti e array:

```javascript
const R = require('ramda');

const utente = { nome: "Alice", età: 30 };

// Aggiornare una proprietà in modo immutabile
const utenteAggiornato = R.assoc('età', 31, utente);

// Aggiornare una proprietà annidata
const utenteConIndirizzo = { 
  ...utente, 
  indirizzo: { città: "Roma", cap: "00100" }
};
const utenteConCapAggiornato = R.assocPath(['indirizzo', 'cap'], "00153", utenteConIndirizzo);

console.log(utente.età); // 30
console.log(utenteAggiornato.età); // 31
console.log(utenteConIndirizzo.indirizzo.cap); // "00100"
console.log(utenteConCapAggiornato.indirizzo.cap); // "00153"
```

## Pattern di Implementazione dell'Immutabilità

### 1. Il Pattern Copy-on-Write

Questo pattern prevede di creare una copia dei dati solo quando è necessario modificarli.

```javascript
function updateUser(user, updates) {
  // Crea una copia solo se ci sono aggiornamenti
  if (Object.keys(updates).length === 0) return user;
  
  // Altrimenti, crea un nuovo oggetto con gli aggiornamenti
  return { ...user, ...updates };
}

const user = { nome: "Alice", età: 30 };
const updatedUser = updateUser(user, { età: 31 });
```

### 2. Il Pattern Builder per Costruzione Immutabile

Un pattern Builder può rendere più fluido il processo di creazione di oggetti immutabili complessi.

```javascript
class UserBuilder {
  constructor(user = {}) {
    this._user = { ...user };
  }
  
  withName(name) {
    return new UserBuilder({ ...this._user, name });
  }
  
  withAge(age) {
    return new UserBuilder({ ...this._user, age });
  }
  
  withAddress(address) {
    return new UserBuilder({ ...this._user, address });
  }
  
  build() {
    return Object.freeze({ ...this._user });
  }
}

const user = new UserBuilder()
  .withName("Alice")
  .withAge(30)
  .withAddress({ city: "Roma", zip: "00100" })
  .build();
```

### 3. Lenti Funzionali

Le lenti sono un pattern funzionale che fornisce un modo elegante per lavorare con strutture dati immutabili nidificate.

```javascript
// Una semplice implementazione di lenti
const lens = (getter, setter) => ({
  get: obj => getter(obj),
  set: (val, obj) => setter(val, obj)
});

const nameLens = lens(
  obj => obj.name,
  (val, obj) => ({ ...obj, name: val })
);

const addressLens = lens(
  obj => obj.address,
  (val, obj) => ({ ...obj, address: val })
);

const zipLens = lens(
  obj => obj.zip,
  (val, obj) => ({ ...obj, zip: val })
);

// Composizione di lenti
const addressZipLens = {
  get: obj => zipLens.get(addressLens.get(obj)),
  set: (val, obj) => addressLens.set(
    zipLens.set(val, addressLens.get(obj)),
    obj
  )
};

// Utilizzo
const user = { name: "Alice", address: { city: "Roma", zip: "00100" } };
const updatedUser = addressZipLens.set("00153", user);

console.log(user.address.zip); // "00100"
console.log(updatedUser.address.zip); // "00153"
```

## Immutabilità e Performance

Una preoccupazione comune riguardo l'immutabilità è la performance: creare nuovi oggetti anziché modificare quelli esistenti può sembrare inefficiente. Tuttavia:

### 1. Structural Sharing

Le librerie moderne utilizzano la condivisione strutturale per minimizzare la copia di dati immutati:

```
Oggetto Originale:  [Riferimento A] -> { a: 1, b: [Riferimento B] }
                                              [Riferimento B] -> [1, 2, 3]

Dopo modifica di 'a': [Riferimento C] -> { a: 2, b: [Riferimento B] }
                                               [Riferimento B] -> [1, 2, 3]
```

Solo i nodi che cambiano vengono ricreati, mentre le parti immutate vengono riutilizzate.

### 2. Memoizzazione

L'immutabilità facilita la memoizzazione, poiché possiamo fidarci del fatto che gli input non cambieranno:

```javascript
const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Con dati immutabili, possiamo usare semplicemente l'identità degli oggetti
const memoizeWithIdentity = fn => {
  const cache = new WeakMap();
  return (arg) => {
    if (cache.has(arg)) return cache.get(arg);
    
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
};
```

### 3. Change Detection Ottimizzata

Con dati immutabili, il confronto di referenze (shallow equality) è sufficiente per determinare se qualcosa è cambiato.

```javascript
function hasChanged(prev, next) {
  return prev !== next; // Basta un semplice confronto di referenze
}

// Senza immutabilità, dovremmo fare un confronto profondo:
function hasChangedDeep(prev, next) {
  return JSON.stringify(prev) !== JSON.stringify(next); // Molto più costoso
}
```

## Conclusione

L'immutabilità è un pilastro fondamentale della programmazione funzionale che porta a codice più prevedibile, testabile e manutenibile. Sebbene JavaScript non supporti nativamente strutture dati completamente immutabili, abbiamo diverse tecniche e librerie per implementare l'immutabilità in modo efficiente.

Le chiavi del successo nell'utilizzo dell'immutabilità in JavaScript sono:

1. **Familiarizzare con i pattern immutabili** per operazioni comuni su oggetti e array
2. **Riconoscere e evitare i metodi mutanti** della libreria standard di JavaScript
3. **Considerare l'uso di librerie specializzate** quando si lavora con strutture dati complesse
4. **Bilanciare purezza e pragmatismo**, implementando l'immutabilità dove offre i maggiori benefici

Adottando questi principi, è possibile sfruttare i benefici della programmazione funzionale mantenendo codice chiaro ed efficiente.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Effetti Collaterali](./02-EffettiCollaterali.md)
- [➡️ Gestione dello Stato](./04-GestioneStato.md)
