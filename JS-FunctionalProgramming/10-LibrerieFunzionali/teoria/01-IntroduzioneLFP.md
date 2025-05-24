# Introduzione alle Librerie Funzionali

L'ecosistema JavaScript offre numerose librerie che facilitano l'adozione dei paradigmi di programmazione funzionale. Queste librerie forniscono strumenti, utility e astrazioni che rendono più semplice scrivere codice funzionale idiomatico.

## Perché Usare Librerie Funzionali?

### 1. **Produttività Aumentata**
Le librerie funzionali offrono implementazioni ottimizzate di operazioni comuni:

```javascript
// Senza libreria
const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 30, active: false },
  { name: 'Charlie', age: 35, active: true }
];

const activeUserNames = users
  .filter(user => user.active)
  .map(user => user.name)
  .sort();

// Con Lodash/FP
import { pipe, filter, map, sortBy } from 'lodash/fp';

const getActiveUserNames = pipe(
  filter('active'),
  map('name'),
  sortBy(identity)
);

const activeUserNames = getActiveUserNames(users);
```

### 2. **Consistenza e Standardizzazione**
Le librerie stabiliscono convenzioni comuni per:
- Ordine dei parametri (data-last)
- Comportamento di curry
- Gestione di valori null/undefined
- Immutabilità

### 3. **Performance Ottimizzata**
Implementazioni native ottimizzate per:
- Operazioni su array e oggetti
- Gestione della memoria
- Lazy evaluation
- Structural sharing

## Panoramica delle Principali Librerie

### **Lodash / Lodash-FP**

**Caratteristiche:**
- Vasta collezione di utility functions
- Versione FP con curry automatico
- Eccellente performance
- Ampia adozione nella community

**Ideale per:**
- Manipolazione dati generici
- Trasformazioni di array e oggetti
- Progetti che necessitano di stabilità

```javascript
import _ from 'lodash/fp';

const processUsers = _.pipe(
  _.filter(_.matches({ active: true })),
  _.groupBy('department'),
  _.mapValues(_.sumBy('salary'))
);
```

### **Ramda**

**Caratteristiche:**
- Progettata specificamente per programmazione funzionale
- Tutte le funzioni sono pure e curried
- Emphasis su composizione e point-free style
- API consistente e predittibile

**Ideale per:**
- Logica di business complessa
- Composizione di funzioni elaborate
- Progetti puramente funzionali

```javascript
import * as R from 'ramda';

const calculateDiscount = R.pipe(
  R.prop('items'),
  R.map(R.prop('price')),
  R.sum,
  R.when(R.gt(R.__, 100), R.multiply(0.9))
);
```

### **Immutable.js**

**Caratteristiche:**
- Strutture dati persistenti e immutabili
- Structural sharing per performance
- Rich API per manipolazione dati
- Interoperabilità con JavaScript nativo

**Ideale per:**
- State management complesso
- Applicazioni con state condiviso
- Quando l'immutabilità è critica

```javascript
import { Map, List } from 'immutable';

const state = Map({
  users: List([
    Map({ id: 1, name: 'Alice' }),
    Map({ id: 2, name: 'Bob' })
  ])
});

const newState = state.updateIn(['users', 0, 'name'], name => name.toUpperCase());
```

### **RxJS**

**Caratteristiche:**
- Programmazione reattiva con Observable
- Vasto set di operatori funzionali
- Gestione elegante di asynchrony
- Composizione di stream di dati

**Ideale per:**
- Gestione eventi complessi
- Operazioni asincrone elaborate
- Real-time applications
- Gestione di stream di dati

```javascript
import { fromEvent, map, filter, debounceTime } from 'rxjs';

const searchInput$ = fromEvent(document.getElementById('search'), 'input')
  .pipe(
    map(event => event.target.value),
    filter(term => term.length > 2),
    debounceTime(300)
  );
```

## Criteri di Scelta

### **Dimensione del Bundle**
```
Lodash (full): ~70KB
Lodash (tree-shaken): ~10-20KB
Ramda: ~50KB
Immutable.js: ~60KB
RxJS: ~40KB
```

### **Curva di Apprendimento**
1. **Lodash**: Facile, API familiare
2. **Ramda**: Media, richiede comprensione FP
3. **Immutable.js**: Media, nuova API da imparare
4. **RxJS**: Difficile, paradigma reattivo complesso

### **Performance Considerations**

```javascript
// Benchmark esempio: filtraggio array 10000 elementi

// Native JavaScript
console.time('native');
const result1 = data.filter(x => x.value > 50).map(x => x.name);
console.timeEnd('native'); // ~2ms

// Lodash
console.time('lodash');
const result2 = _.pipe(_.filter(x => x.value > 50), _.map('name'))(data);
console.timeEnd('lodash'); // ~3ms

// Ramda
console.time('ramda');
const result3 = R.pipe(R.filter(R.propSatisfies(R.gt(R.__, 50), 'value')), R.pluck('name'))(data);
console.timeEnd('ramda'); // ~4ms
```

## Strategie di Adozione

### 1. **Approccio Graduale**
```javascript
// Inizia con utilities semplici
import { get, set, merge } from 'lodash/fp';

// Poi aggiungi composizione
import { pipe, flow } from 'lodash/fp';

// Infine pattern più avanzati
import { curry, partial } from 'lodash/fp';
```

### 2. **Tree Shaking**
```javascript
// Invece di
import _ from 'lodash';

// Usa importazioni specifiche
import { map, filter, reduce } from 'lodash/fp';
```

### 3. **Combinazione Strategica**
```javascript
// Lodash per utilities generali
import { debounce, throttle } from 'lodash';

// Ramda per logica di business
import * as R from 'ramda';

// RxJS per eventi asincroni
import { fromEvent, map } from 'rxjs';
```

## Pattern Comuni

### **Pipeline di Trasformazione**
```javascript
const processData = pipe(
  validate,
  normalize,
  transform,
  aggregate,
  format
);
```

### **Configurazione Funzionale**
```javascript
const createProcessor = (config) => pipe(
  when(config.shouldValidate, validate),
  when(config.shouldNormalize, normalize),
  when(config.shouldTransform, transform(config.transformOptions))
);
```

### **Error Handling Funzionale**
```javascript
const safeProcess = pipe(
  attempt,
  either(handleError, processSuccess)
);
```

## Best Practices

1. **Consistenza nell'uso**
2. **Comprensione delle performance implications**
3. **Tree shaking per ottimizzare bundle size**
4. **Documentazione delle scelte architetturali**
5. **Testing delle composizioni complesse**

## Prossimi Passi

Nel prossimo modulo esploreremo Lodash e Lodash/FP nel dettaglio, imparando come utilizzare questa libreria per scrivere codice JavaScript più funzionale ed espressivo.
