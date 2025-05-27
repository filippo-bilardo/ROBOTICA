# Modulo 9: Asincronia e Programmazione Funzionale

## Obiettivi di Apprendimento
- Comprendere come gestire operazioni asincrone in modo funzionale
- Applicare principi funzionali alle Promise e a async/await
- Implementare pattern asincroni funzionali come Task
- Utilizzare tecniche funzionali per gestire effetti collaterali in codice asincrono
- Confrontare approcci imperativi vs funzionali nell'asincronia

## Struttura del Modulo

### Teoria
1. [Introduzione all'Asincronia Funzionale](./teoria/01-IntroduzioneAsincronia.md)
   - Sfide dell'asincronia in programmazione funzionale
   - JavaScript: un linguaggio intrinsecamente asincrono
   - Evoluzione dei pattern asincroni in JavaScript

2. [Promise in Stile Funzionale](./teoria/02-PromiseFunzionali.md)
   - Promise come contenitori di valori futuri
   - Composizione di Promise
   - Parallelismo funzionale con Promise.all e Promise.race

3. [Async/Await in Contesto Funzionale](./teoria/03-AsyncAwaitFunzionale.md)
   - Utilizzo di async/await in modo funzionale
   - Gestione degli errori
   - Mantenere la purezza con async/await

4. [Task Monad e Alternative](./teoria/04-TaskMonad.md)
   - Task come astrazione per operazioni asincrone
   - Confronto tra Task e Promise
   - Implementazione e utilizzo di Task

5. [Gestione degli Effetti Collaterali](./teoria/05-EffettiCollaterali.md)
   - Strategie per isolare effetti collaterali nel codice asincrono
   - IO e Task combinati
   - Pattern per test e manutenibilità

### Esempi
1. [Da Callbacks a Promise a Async/Await](./esempi/01-EvoluzioneAsincrona.js)
   - Confronto tra diversi approcci asincroni
   - Refactoring progressivo verso uno stile più funzionale

2. [Composizione di Operazioni Asincrone](./esempi/02-ComposizioneAsincrona.js)
   - Pipeline asincrone
   - Gestione errori in catene asincrone

3. [Parallelismo Funzionale](./esempi/03-ParallelismoFunzionale.js)
   - Esecuzione parallela di operazioni asincrone
   - Pattern di concorrenza funzionale

4. [Task e Lazy Evaluation](./esempi/04-TaskLazy.js)
   - Implementazione di Task monad
   - Esempi di lazy evaluation in asincronia

5. [Applicazioni Pratiche](./esempi/05-ApplicazioniPratiche.js)
   - Pattern asincroni in applicazioni reali
   - Design funzionale per API asincrone

### Esercizi
1. [Refactoring Asincrono](./esercizi/01-RefactoringAsincrono.js)
   - Trasformare codice imperativo asincrono in stile funzionale

2. [Pipeline Asincrone](./esercizi/02-PipelineAsincrone.js)
   - Implementare pipeline di trasformazione dati con operazioni asincrone

3. [Gestione Errori Avanzata](./esercizi/03-GestioneErroriAvanzata.js)
   - Pattern funzionali per la gestione errori in codice asincrono

4. [Task e Cancellazione](./esercizi/04-TaskCancellazione.js)
   - Implementare e utilizzare Task con supporto alla cancellazione

## Risorse Aggiuntive
- [JavaScript Promise API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- ["Async JavaScript" di Trevor Burnham](https://pragprog.com/book/tbajs/async-javascript)
- ["JavaScript Allongé" di Reg Braithwaite](https://leanpub.com/javascriptallongesix)
- [Fantasy Land Specification - Task](https://github.com/fantasyland/fantasy-land#task)

## Collegamenti alle Funzionalità Moderne
Per una comprensione completa dell'asincronia moderna, consulta anche:
- [Modulo 17: JavaScript Moderno 2025](../17-ModernJSFeatures2025/README.md) per:
  - Top-level await (ES2022)
  - Array.at() per accesso asincrono agli array
  - Pattern moderni con Temporal API
  - Gestione asincrona con Record & Tuple

## Prossimo Modulo
Continua con il [Modulo 10: Librerie e Framework Funzionali](../10-LibrerieFunzionali/README.md) per esplorare le librerie che supportano la programmazione funzionale in JavaScript.
