# Effetti Collaterali

Gli effetti collaterali sono uno dei concetti più importanti da comprendere nella programmazione funzionale. In questo capitolo, esploreremo cosa sono gli effetti collaterali, perché sono problematici nella programmazione funzionale, e come gestirli in modo appropriato all'interno di un'applicazione JavaScript.

## Cosa sono gli Effetti Collaterali

Un **effetto collaterale** si verifica quando una funzione interagisce con il mondo esterno al suo scope, modificando qualcosa o dipendendo da qualcosa al di fuori dei suoi parametri di input. Gli effetti collaterali includono:

1. **Modifica di variabili esterne**
2. **Interazione con il sistema (I/O)**
3. **Modifica degli argomenti passati per riferimento**
4. **Dipendenza da stato globale o esterno**
5. **Lanciare eccezioni**
6. **Chiamare altre funzioni con effetti collaterali**

## Esempi di Effetti Collaterali

### 1. Modifica di Variabili Esterne

```javascript
let counter = 0;

function incrementCounter() {
  counter++; // Effetto collaterale: modifica una variabile esterna
  return counter;
}
```

### 2. Interazioni con il DOM

```javascript
function showMessage(message) {
  document.getElementById('message').innerText = message; // Effetto collaterale: modifica il DOM
}
```

### 3. Chiamate API

```javascript
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`); // Effetto collaterale: chiamata di rete
  return await response.json();
}
```

### 4. Operazioni sul File System (Node.js)

```javascript
const fs = require('fs');

function saveData(data, filename) {
  fs.writeFileSync(filename, JSON.stringify(data)); // Effetto collaterale: scrive su disco
}
```

### 5. Dipendenza da Date e Random

```javascript
function getCurrentYear() {
  return new Date().getFullYear(); // Effetto collaterale: dipende dal tempo di sistema
}

function getRandomNumber() {
  return Math.random(); // Effetto collaterale: genera un valore non deterministico
}
```

## Perché gli Effetti Collaterali sono Problematici

Gli effetti collaterali complicano lo sviluppo, il testing e la manutenzione del software per diversi motivi:

### 1. Compromettono la Prevedibilità

Le funzioni con effetti collaterali non sono prevedibili: il loro comportamento può variare anche con lo stesso input.

```javascript
// Non prevedibile: dipende dallo stato del contatore
function incrementAndCheck() {
  counter++;
  return counter > 10;
}
```

### 2. Rendono Difficile il Testing

I test per funzioni con effetti collaterali richiedono spesso complessi setup e mock per replicare lo stato del sistema.

```javascript
// Difficile da testare: richiede mock di fetch e controllo delle chiamate API
async function fetchAndProcessUser(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const user = await response.json();
  return {
    name: user.name.toUpperCase(),
    age: user.age
  };
}
```

### 3. Possono Causare Bug Difficili da Tracciare

Gli effetti collaterali nascosti possono causare bug difficili da riprodurre e diagnosticare.

```javascript
// Possibile fonte di bug: modifiche inaspettate all'oggetto originalData
function processData(originalData) {
  const data = originalData;
  data.processed = true;  // Modifica originalData anche se non sembrerebbe
  return data;
}
```

### 4. Complicano la Parallelizzazione

Il codice con effetti collaterali spesso dipende dall'ordine di esecuzione, rendendo difficile la parallelizzazione.

```javascript
// Difficile da parallelizzare: entrambe le funzioni modificano lo stato condiviso
function incrementCounter() { counter++; }
function doubleCounter() { counter *= 2; }
```

## Gestione degli Effetti Collaterali nella Programmazione Funzionale

Nella programmazione funzionale pura, l'ideale sarebbe eliminare completamente gli effetti collaterali. Tuttavia, nelle applicazioni reali, specialmente in JavaScript, gli effetti collaterali sono spesso necessari. Ecco alcune strategie per gestirli:

### 1. Isolare gli Effetti Collaterali

Concentrare gli effetti collaterali in aree specifiche dell'applicazione, mantenendo il resto del codice puro.

```javascript
// Isola l'effetto collaterale della chiamata API
function fetchUserApi(userId) {
  return fetch(`/api/users/${userId}`).then(res => res.json());
}

// Funzione pura per elaborare i dati
function processUserData(userData) {
  return {
    name: userData.name.toUpperCase(),
    age: userData.age
  };
}

// Composizione che separa chiaramente effetti collaterali e logica pura
async function getUserInfo(userId) {
  const userData = await fetchUserApi(userId);
  return processUserData(userData);
}
```

### 2. Rendere gli Effetti Collaterali Espliciti

Rendere chiari gli effetti collaterali attraverso i nomi delle funzioni o i commenti.

```javascript
// Il nome indica chiaramente l'effetto collaterale
function saveUserToLocalStorage(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}
```

### 3. Usare Monad e Container Funzionali

Utilizzare pattern come i Monad per incapsulare e gestire gli effetti collaterali in modo controllato.

```javascript
// Un semplice "IO Monad" per incapsulare gli effetti collaterali
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
  
  run() {
    return this.effect();
  }
}

// Uso
const readLocalStorage = (key) => new IO(() => localStorage.getItem(key));
const writeLocalStorage = (key, value) => new IO(() => localStorage.setItem(key, value));

const getUserPreferences = readLocalStorage('preferences')
  .map(prefs => prefs ? JSON.parse(prefs) : {})
  .map(prefs => ({...prefs, lastAccess: new Date().toISOString()}))
  .flatMap(prefs => 
    writeLocalStorage('preferences', JSON.stringify(prefs))
      .map(() => prefs)
  );

// L'effetto viene eseguito solo qui, in modo controllato
const preferences = getUserPreferences.run();
```

### 4. Utilizzo di Librerie Funzionali

Librerie come `RxJS`, `Redux` o `Redux-Saga` forniscono pattern e strumenti per gestire gli effetti collaterali in modo controllato e predicibile.

```javascript
// Esempio con Redux-Thunk
function fetchUserData(userId) {
  return function(dispatch) {
    dispatch({ type: 'FETCH_USER_START' });
    
    return fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(user => {
        dispatch({ type: 'FETCH_USER_SUCCESS', payload: user });
        return user;
      })
      .catch(error => {
        dispatch({ type: 'FETCH_USER_ERROR', error });
        throw error;
      });
  };
}
```

### 5. Dependency Injection

Passare le dipendenze esterne come argomenti rende le funzioni più pure e testabili.

```javascript
// Difficile da testare
function getUserData() {
  return fetch('/api/user').then(res => res.json());
}

// Più facile da testare con dependency injection
function getUserData(fetchApi) {
  return fetchApi('/api/user').then(res => res.json());
}

// In produzione
getUserData(fetch);

// Nei test
getUserData(mockFetch);
```

## Pattern per la Gestione degli Effetti Collaterali

### 1. Il Pattern "Ports and Adapters" (Architettura Esagonale)

Separare il core logico dell'applicazione (dominio) dalle interazioni con il mondo esterno (effetti collaterali) attraverso interfacce ben definite.

```javascript
// Core logico puro
const userDomain = {
  validateUser: (user) => {
    // Validazione pura
    return user.name && user.email;
  },
  
  formatUser: (user) => {
    // Trasformazione pura
    return {
      ...user,
      name: user.name.trim(),
      email: user.email.toLowerCase()
    };
  }
};

// Adattatore per l'effetto collaterale (API)
const userAdapter = {
  fetchUser: (id) => fetch(`/api/users/${id}`).then(res => res.json()),
  saveUser: (user) => fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(user)
  })
};

// Orchestrazione
async function processAndSaveUser(userId) {
  const rawUser = await userAdapter.fetchUser(userId);
  const isValid = userDomain.validateUser(rawUser);
  
  if (isValid) {
    const formattedUser = userDomain.formatUser(rawUser);
    return userAdapter.saveUser(formattedUser);
  }
  
  throw new Error('Invalid user data');
}
```

### 2. Architettura Funzionale con Stato Immutabile

Utilizzare uno stato immutabile centrale (come in Redux) e funzioni pure per le trasformazioni, confinando gli effetti collaterali nei middleware.

```javascript
// Reducer puro
function userReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_USER_SUCCESS':
      return { ...state, user: action.payload, loading: false };
    case 'FETCH_USER_START':
      return { ...state, loading: true };
    case 'FETCH_USER_ERROR':
      return { ...state, error: action.error, loading: false };
    default:
      return state;
  }
}

// Effetto collaterale isolato
function fetchUserEffect(userId) {
  return fetch(`/api/users/${userId}`).then(res => res.json());
}

// Action creator che collega l'effetto collaterale al sistema
function fetchUser(userId) {
  return async function(dispatch) {
    dispatch({ type: 'FETCH_USER_START' });
    try {
      const user = await fetchUserEffect(userId);
      dispatch({ type: 'FETCH_USER_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'FETCH_USER_ERROR', error });
    }
  };
}
```

## Conclusione

Gli effetti collaterali sono inevitabili in applicazioni reali, ma la programmazione funzionale ci insegna a gestirli in modo controllato e consapevole. Le strategie chiave sono:

1. **Isolare**: Separare chiaramente il codice con effetti collaterali dal codice puro
2. **Esplicitare**: Rendere evidenti e tracciabili gli effetti collaterali
3. **Incapsulare**: Utilizzare pattern per contenere e gestire gli effetti in modo controllato

Adottando queste strategie, è possibile godere dei vantaggi della programmazione funzionale (prevedibilità, testabilità, manutenibilità) anche in applicazioni JavaScript del mondo reale che inevitabilmente richiedono interazioni con stati esterni.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Funzioni Pure vs Impure](./01-FunzioniPureVsImpure.md)
- [➡️ Immutabilità e Pattern](./03-ImmutabilitaPattern.md)
