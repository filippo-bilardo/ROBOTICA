# Modulo 10: Librerie Funzionali

Questo modulo esplora le principali librerie funzionali in JavaScript e come utilizzarle per scrivere codice più espressivo e performante.

## Obiettivi di Apprendimento

Al termine di questo modulo, sarai in grado di:

- Utilizzare **Lodash/FP** per operazioni funzionali avanzate
- Implementare patterns funzionali con **Ramda**
- Gestire strutture dati immutabili con **Immutable.js**
- Utilizzare **RxJS** per programmazione reattiva funzionale
- Confrontare e scegliere la libreria appropriata per diversi casi d'uso

## Struttura del Modulo

### Teoria
- `01-IntroduzioneLFP.md` - Panoramica delle librerie funzionali
- `02-Lodash.md` - Lodash e Lodash/FP
- `03-Ramda.md` - Ramda per programmazione funzionale
- `04-ImmutableJS.md` - Gestione dati immutabili
- `05-RxJS.md` - Programmazione reattiva funzionale

### Esempi
- `01-LodashBasics.js` - Esempi base con Lodash/FP
- `02-RamdaOperations.js` - Operazioni avanzate con Ramda
- `03-ImmutableDataStructures.js` - Strutture dati immutabili
- `04-ReactiveStreams.js` - Stream reattivi con RxJS
- `05-LibraryComparison.js` - Confronto tra librerie

### Esercizi
- `01-LodashExercises.js` - Esercizi con Lodash/FP
- `02-RamdaPractice.js` - Pratica con Ramda
- `03-ImmutablePractice.js` - Esercizi con Immutable.js
- `04-RxJSExercises.js` - Esercizi di programmazione reattiva

## Prerequisiti

- Conoscenza dei concetti di programmazione funzionale
- Familiarità con Higher-Order Functions
- Comprensione di curry e composizione
- Esperienza con monads (opzionale ma utile)

## Installazione Dipendenze

```bash
npm install lodash lodash-fp ramda immutable rxjs
```

## Concetti Chiave

### Lodash/FP
- **Auto-curried functions**: Tutte le funzioni sono automaticamente curried
- **Immutable by default**: Operazioni che non modificano i dati originali
- **Data-last**: I dati vengono sempre passati come ultimo parametro

### Ramda
- **Puramente funzionale**: Tutte le funzioni sono pure
- **Automatically curried**: Curry automatico per tutte le funzioni
- **Function composition**: Eccellente supporto per la composizione

### Immutable.js
- **Persistent data structures**: Strutture dati persistenti e immutabili
- **Structural sharing**: Condivisione strutturale per performance
- **Rich API**: API ricca per manipolazione dati

### RxJS
- **Reactive programming**: Programmazione reattiva con Observable
- **Operators**: Vasto set di operatori funzionali
- **Asynchronous composition**: Composizione di operazioni asincrone

## Best Practices

1. **Scegli la libreria giusta**
   - Lodash/FP per utility generali
   - Ramda per logica funzionale pura
   - Immutable.js per stati complessi
   - RxJS per flussi asincroni

2. **Combina librerie strategicamente**
   - Non usare tutto insieme
   - Mantieni consistenza nel progetto
   - Considera il bundle size

3. **Performance considerations**
   - Immutable.js può essere pesante
   - Lodash ha ottimizzazioni native
   - RxJS richiede gestione subscriptions

## Progetti Pratici

### Progetto 1: Data Pipeline
Costruisci una pipeline di trasformazione dati utilizzando Ramda per processare e aggregare grandi dataset.

### Progetto 2: State Management
Implementa un sistema di gestione stato con Immutable.js per un'applicazione React complessa.

### Progetto 3: Real-time Dashboard
Crea una dashboard real-time utilizzando RxJS per gestire stream di dati asincroni.

## Approfondimenti

- **Fantasy Land Specification**: Standard per librerie funzionali JS
- **Point-free programming**: Stile di programmazione senza parametri espliciti
- **Transducers**: Pattern per trasformazioni composabili ed efficienti
- **Reactive Extensions**: Pattern per programmazione asincrona e basata su eventi

## Collegamenti Esterni

- [Lodash Documentation](https://lodash.com/docs)
- [Ramda Documentation](https://ramdajs.com/docs/)
- [Immutable.js Documentation](https://immutable-js.com/)
- [RxJS Documentation](https://rxjs.dev/)
- [Fantasy Land Specification](https://github.com/fantasyland/fantasy-land)

---

**Prossimo Modulo**: Progetto finale - Applicazione completa con paradigmi funzionali
