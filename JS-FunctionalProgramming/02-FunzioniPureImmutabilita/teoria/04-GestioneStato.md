# Gestione dello Stato

La gestione dello stato è una delle sfide più importanti nello sviluppo di applicazioni. Nella programmazione funzionale, con la sua enfasi su immutabilità e funzioni pure, la gestione dello stato richiede approcci specifici. Questo capitolo esplora come gestire lo stato in modo funzionale in JavaScript.

## Il Problema dello Stato nelle Applicazioni

Lo **stato** si riferisce a qualsiasi dato che cambia nel tempo all'interno di un'applicazione. Include:

- Dati dell'utente
- Risultati di API
- Input dell'utente
- Configurazioni
- Stato dell'interfaccia utente (modalità, pannelli aperti, ecc.)

Nella programmazione tradizionale, lo stato viene spesso gestito attraverso variabili mutabili che vengono modificate in vari punti dell'applicazione. Questo approccio può portare a diversi problemi:

- **Imprevedibilità**: Diventa difficile prevedere lo stato in un dato momento
- **Bug difficili da tracciare**: Le modifiche allo stato possono avere effetti collaterali inaspettati
- **Difficoltà nel testing**: Testare codice che dipende da uno stato mutabile è complesso
- **Problemi di concorrenza**: Modifiche simultanee allo stato possono causare race conditions

## Principi Funzionali per la Gestione dello Stato

La programmazione funzionale propone diversi principi per gestire lo stato in modo più controllato:

### 1. Immutabilità dello Stato

Invece di modificare uno stato esistente, si crea sempre un nuovo stato basato sul precedente.

```javascript
// ❌ Approccio imperativo
function incrementCounter(state) {
  state.counter += 1;
  return state;
}

// ✅ Approccio funzionale
function incrementCounter(state) {
  return {
    ...state,
    counter: state.counter + 1
  };
}
```

### 2. Centralizzazione dello Stato

Mantenere lo stato in un luogo centralizzato, piuttosto che disperso in tutta l'applicazione.

### 3. Transizioni di Stato Esplicite

Rendere esplicite le transizioni da uno stato all'altro, attraverso funzioni pure che prendono lo stato corrente e restituiscono il nuovo stato.

### 4. Separare lo Stato dalla Logica

Separare chiaramente la logica di business (funzioni pure) dalla gestione dello stato.

## Pattern per la Gestione dello Stato in JavaScript

Esploriamo alcuni pattern che permettono di gestire lo stato in modo funzionale in JavaScript.

### 1. Reducer Pattern

Il pattern Reducer è stato reso popolare da Redux ma esiste indipendentemente ed è un concetto fondamentale nella programmazione funzionale.

Un reducer è una funzione pura che prende lo stato corrente e un'azione, e restituisce il nuovo stato:

```javascript
// Definizione dello stato iniziale
const initialState = { counter: 0, user: null };

// Reducer function
function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT_COUNTER':
      return {
        ...state,
        counter: state.counter + 1
      };
    case 'DECREMENT_COUNTER':
      return {
        ...state,
        counter: state.counter - 1
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
    default:
      return state;
  }
}

// Utilizzo
let currentState = initialState;

// Transizione di stato attraverso un'azione
const action1 = { type: 'INCREMENT_COUNTER' };
currentState = appReducer(currentState, action1);
console.log(currentState); // { counter: 1, user: null }

// Altra transizione di stato
const action2 = { type: 'SET_USER', payload: { name: 'Alice' } };
currentState = appReducer(currentState, action2);
console.log(currentState); // { counter: 1, user: { name: 'Alice' } }
```

Vantaggi del pattern Reducer:
- Transizioni di stato prevedibili e tracciabili
- Stato centralizzato
- Facilità di testing (i reducers sono funzioni pure)
- Time-travel debugging (possibilità di navigare avanti/indietro tra gli stati)

### 2. State Monad

Il concetto di Monad viene dalla teoria delle categorie in matematica ed è utilizzato in programmazione funzionale per incapsulare computazioni con effetti collaterali. Lo State Monad permette di lavorare con lo stato in modo funzionale:

```javascript
// Implementazione semplificata di uno State Monad
class State {
  constructor(runState) {
    this.runState = runState;
  }
  
  // Esegue lo state e restituisce il risultato e il nuovo stato
  run(state) {
    return this.runState(state);
  }
  
  // Map trasforma il valore risultante
  map(fn) {
    return new State(state => {
      const [value, newState] = this.run(state);
      return [fn(value), newState];
    });
  }
  
  // Chain (flatMap) permette di concatenare computazioni con stato
  chain(fn) {
    return new State(state => {
      const [value, newState] = this.run(state);
      return fn(value).run(newState);
    });
  }
  
  // Metodi di utilità
  static of(value) {
    return new State(state => [value, state]);
  }
  
  static get() {
    return new State(state => [state, state]);
  }
  
  static put(newState) {
    return new State(_ => [null, newState]);
  }
  
  static modify(fn) {
    return new State(state => [null, fn(state)]);
  }
}

// Esempio di utilizzo
const incrementCounter = State.modify(state => ({
  ...state,
  counter: state.counter + 1
}));

const getCounter = State.get().map(state => state.counter);

const program = incrementCounter
  .chain(() => incrementCounter)
  .chain(() => getCounter);

const initialState = { counter: 0 };
const [result, finalState] = program.run(initialState);

console.log(result);      // 2
console.log(finalState);  // { counter: 2 }
```

Questo pattern è più avanzato ma offre un modo elegante per gestire lo stato in modo puramente funzionale.

### 3. Lens Pattern

Le lenti sono un pattern funzionale per accedere e modificare parti di strutture dati immutabili complesse.

```javascript
// Implementazione semplificata di una lente
const lens = (getter, setter) => ({
  get: obj => getter(obj),
  set: (val, obj) => setter(val, obj)
});

// Funzioni di utilità per le lenti
const view = (lens, obj) => lens.get(obj);
const set = (lens, val, obj) => lens.set(val, obj);
const over = (lens, fn, obj) => lens.set(fn(lens.get(obj)), obj);

// Esempio: lenti per un oggetto utente
const userNameLens = lens(
  user => user.name,
  (name, user) => ({ ...user, name })
);

const userAddressLens = lens(
  user => user.address,
  (address, user) => ({ ...user, address })
);

const addressCityLens = lens(
  address => address.city,
  (city, address) => ({ ...address, city })
);

// Composizione di lenti
const compose = (lens1, lens2) => lens(
  obj => lens2.get(lens1.get(obj)),
  (val, obj) => lens1.set(lens2.set(val, lens1.get(obj)), obj)
);

const userCityLens = compose(userAddressLens, addressCityLens);

// Utilizzo
const user = {
  name: "Alice",
  address: {
    city: "Roma",
    zip: "00100"
  }
};

// Accesso ai dati
console.log(view(userNameLens, user)); // "Alice"
console.log(view(userCityLens, user)); // "Roma"

// Modifica immutabile
const updatedUser = set(userCityLens, "Milano", user);
console.log(updatedUser.address.city); // "Milano"
console.log(user.address.city); // "Roma" (l'originale non è modificato)

// Trasformazione
const upperCaseCity = over(userCityLens, city => city.toUpperCase(), user);
console.log(upperCaseCity.address.city); // "ROMA"
```

Le lenti sono particolarmente utili quando si lavora con strutture dati profondamente nidificate, rendendo le modifiche più composabili e leggibili.

### 4. Uso di Librerie per la Gestione dello Stato

Esistono diverse librerie che implementano pattern funzionali per la gestione dello stato:

#### Redux

[Redux](https://redux.js.org/) è una delle più popolari librerie per la gestione dello stato, basata sul pattern Reducer:

```javascript
import { createStore } from 'redux';

// Reducer
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { value: state.value + 1 };
    case 'counter/decremented':
      return { value: state.value - 1 };
    default:
      return state;
  }
}

// Store
const store = createStore(counterReducer);

// Subscribe per reagire ai cambiamenti di stato
store.subscribe(() => console.log(store.getState()));

// Dispatch di azioni che innescano transizioni di stato
store.dispatch({ type: 'counter/incremented' }); // {value: 1}
store.dispatch({ type: 'counter/incremented' }); // {value: 2}
store.dispatch({ type: 'counter/decremented' }); // {value: 1}
```

#### Immer

[Immer](https://immerjs.github.io/immer/) permette di scrivere codice che sembra mutabile ma produce risultati immutabili, facilitando enormemente la gestione dello stato immutabile:

```javascript
import produce from 'immer';

const baseState = [
  { id: "todo1", done: false, text: "Studiare JS" }
];

const nextState = produce(baseState, draftState => {
  // Sembra mutabile, ma è in realtà immutabile grazie a Immer
  draftState.push({ id: "todo2", done: false, text: "Studiare CSS" });
  draftState[0].done = true;
});

console.log(baseState[0].done); // false
console.log(nextState[0].done); // true
console.log(nextState[1].text); // "Studiare CSS"
```

#### MobX-State-Tree

[MobX-State-Tree](https://mobx-state-tree.js.org/) combina la mutabilità apparente di MobX con strutture dati immutabili e tipizzate:

```javascript
import { types, onSnapshot } from "mobx-state-tree";

// Definizione del modello
const Todo = types
  .model("Todo", {
    id: types.identifier,
    text: types.string,
    done: false
  })
  .actions(self => ({
    toggle() {
      self.done = !self.done;
    }
  }));

const Store = types
  .model("Store", {
    todos: types.array(Todo)
  })
  .actions(self => ({
    addTodo(text) {
      self.todos.push({
        id: Math.random().toString(),
        text
      });
    }
  }));

// Creazione dello store
const store = Store.create({
  todos: [{ id: "1", text: "Studiare JS", done: false }]
});

// Reagire ai cambiamenti
onSnapshot(store, snapshot => {
  console.log("Nuovo stato:", snapshot);
});

// Azioni che modificano lo stato
store.addTodo("Studiare CSS");
store.todos[0].toggle();
```

## Gestire lo Stato nei Frontend Frameworks

### React + Hooks

React ha abbracciato la programmazione funzionale con i Hooks, che offrono un modo elegante per gestire lo stato in componenti funzionali:

```javascript
import React, { useState, useReducer } from 'react';

// Esempio con useState
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Esempio con useReducer (più vicino al pattern funzionale)
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function CounterWithReducer() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
    </div>
  );
}
```

### Vue 3 + Composition API

Anche Vue ha introdotto un approccio più funzionale con la Composition API:

```javascript
import { reactive, computed } from 'vue';

export default {
  setup() {
    const state = reactive({
      count: 0
    });
    
    const doubleCount = computed(() => state.count * 2);
    
    function increment() {
      state.count++;
    }
    
    return {
      state,
      doubleCount,
      increment
    };
  }
};
```

## Sfide della Gestione dello Stato Funzionale

Nonostante i vantaggi, l'approccio funzionale alla gestione dello stato presenta alcune sfide:

### 1. Verbosità per Strutture Nidificate

Aggiornare strutture di dati profondamente nidificate in modo immutabile può risultare verboso senza l'aiuto di librerie:

```javascript
// Aggiornare un campo profondamente nidificato
const stato = {
  utente: {
    profilo: {
      indirizzo: {
        città: "Roma"
      }
    }
  }
};

// Senza librerie
const nuovoStato = {
  ...stato,
  utente: {
    ...stato.utente,
    profilo: {
      ...stato.utente.profilo,
      indirizzo: {
        ...stato.utente.profilo.indirizzo,
        città: "Milano"
      }
    }
  }
};
```

### 2. Overhead di Performance

La creazione continua di nuovi oggetti può avere un impatto sulla performance, specialmente con strutture dati di grandi dimensioni, se non si utilizzano tecniche come lo structural sharing.

### 3. Curva di Apprendimento

I pattern funzionali per la gestione dello stato possono avere una curva di apprendimento ripida per chi proviene da un background di programmazione imperativa.

## Best Practices per la Gestione dello Stato Funzionale

### 1. Normalizzazione dello Stato

Organizzare lo stato come un database normalizzato per evitare nidificazione profonda e duplicazione:

```javascript
// ❌ Stato profondamente nidificato
{
  posts: [
    {
      id: 1,
      title: "Post 1",
      author: {
        id: 1,
        name: "Alice"
      },
      comments: [...]
    }
  ]
}

// ✅ Stato normalizzato
{
  posts: {
    byId: {
      1: { id: 1, title: "Post 1", authorId: 1, commentIds: [1, 2] }
    },
    allIds: [1]
  },
  users: {
    byId: {
      1: { id: 1, name: "Alice" }
    },
    allIds: [1]
  },
  comments: {
    byId: {
      1: { id: 1, text: "Comment 1", postId: 1 },
      2: { id: 2, text: "Comment 2", postId: 1 }
    },
    allIds: [1, 2]
  }
}
```

### 2. Selettori per Accedere allo Stato

Utilizzare funzioni selettore per accedere a parti dello stato, aggiungendo un livello di indirezione che facilita le modifiche alla struttura:

```javascript
// Selettori
const selectPostById = (state, id) => state.posts.byId[id];
const selectPostAuthor = (state, postId) => {
  const post = selectPostById(state, postId);
  return state.users.byId[post.authorId];
};
const selectPostComments = (state, postId) => {
  const post = selectPostById(state, postId);
  return post.commentIds.map(id => state.comments.byId[id]);
};

// Utilizzo
const post = selectPostById(state, 1);
const author = selectPostAuthor(state, 1);
const comments = selectPostComments(state, 1);
```

### 3. Utilizzo di Librerie per Semplificare l'Immutabilità

Come abbiamo visto, librerie come Immer o Immutable.js possono semplificare notevolmente il lavoro con dati immutabili.

### 4. Dividere lo Stato in Domini

Suddividere lo stato in "fette" (slices) logicamente correlate, ciascuna con i propri reducer e selettori:

```javascript
// Reducer per utenti
function userReducer(state = initialUserState, action) {
  // ...
}

// Reducer per posts
function postReducer(state = initialPostState, action) {
  // ...
}

// Reducer per commenti
function commentReducer(state = initialCommentState, action) {
  // ...
}

// Combina i reducer
function rootReducer(state = {}, action) {
  return {
    users: userReducer(state.users, action),
    posts: postReducer(state.posts, action),
    comments: commentReducer(state.comments, action)
  };
}
```

### 5. Persistent Storage con Immutabilità

Quando si salva lo stato (ad es. in localStorage), l'immutabilità può essere molto vantaggiosa:

```javascript
// Salva lo stato
function saveState(state) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('appState', serializedState);
  } catch (err) {
    console.error('Could not save state', err);
  }
}

// Carica lo stato
function loadState() {
  try {
    const serializedState = localStorage.getItem('appState');
    if (!serializedState) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Could not load state', err);
    return undefined;
  }
}

// Sottoscrizione ai cambiamenti di stato
store.subscribe(() => {
  saveState(store.getState());
});
```

## Conclusione

La gestione dello stato in modo funzionale, con enfasi su immutabilità e transizioni di stato esplicite, offre numerosi vantaggi in termini di prevedibilità, testabilità e manutenibilità del codice. JavaScript, pur non essendo un linguaggio puramente funzionale, offre strumenti e pattern che permettono di adottare questi principi in modo efficace.

Le sfide associate a questo approccio, come la verbosità o le preoccupazioni di performance, possono essere superate con un mix di pattern funzionali ben progettati e librerie mirate. L'ecosistema JavaScript moderno offre numerose opzioni per implementare una gestione dello stato funzionale che sia sia elegante che pratica.

Indipendentemente dalle tecniche specifiche o dalle librerie utilizzate, i principi fondamentali rimangono gli stessi: immutabilità dei dati, transizioni di stato esplicite, e separazione tra logica pura e gestione dello stato. Adottando questi principi, è possibile costruire applicazioni più robuste, testabili e manutenibili.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Immutabilità e Pattern](./03-ImmutabilitaPattern.md)
- [➡️ Funzioni Pure e Immutabilità](../README.md)
