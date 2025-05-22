# Modulo 7: Lazy Evaluation

## Obiettivi di Apprendimento
- Comprendere il concetto di lazy evaluation e i suoi vantaggi
- Implementare sequenze infinite in JavaScript
- Utilizzare tecniche lazy per ottimizzare le performance
- Creare iteratori e generatori per elaborazioni on-demand
- Applicare pattern lazy nel contesto della programmazione funzionale

## Struttura del Modulo

### Teoria
1. [Introduzione alla Lazy Evaluation](./teoria/01-IntroduzioneLazyEvaluation.md)
   - Concetto di valutazione lazy vs eager
   - Vantaggi e svantaggi della lazy evaluation
   - Casi d'uso appropriati

2. [Sequenze Infinite](./teoria/02-SequenzeInfinite.md)
   - Definizione e implementazione
   - Range infiniti e sequenze matematiche
   - Operazioni su sequenze infinite

3. [Iteratori e Generatori](./teoria/03-IteratoriGeneratori.md)
   - Protocollo iterabile in JavaScript
   - Creazione e utilizzo di generatori
   - Yield e delegazione

4. [Memoization e Thunking](./teoria/04-MemoizationThunking.md)
   - Concetto di thunk
   - Implementazione della memoization
   - Combinazione con lazy evaluation

5. [Lazy Evaluation in Librerie](./teoria/05-LibrerieLazy.md)
   - Lodash/fp e lazy sequences
   - Librerie specifiche per lazy evaluation
   - Integrazione con reattività (RxJS)

### Esempi
1. [Implementazioni Base](./esempi/01-ImplementazioniBase.js)
   - Esempi di lazy evaluation in JavaScript
   - Sequenze basic

2. [Sequenze Numeriche](./esempi/02-SequenzeNumeriche.js)
   - Range infiniti
   - Sequenze matematiche (Fibonacci, prime, etc.)

3. [Pattern di Iterazione](./esempi/03-PatternIterazione.js)
   - Utilizzo di iteratori e generatori
   - Composizione di sequenze

4. [Ottimizzazione Performance](./esempi/04-OttimizzazionePerformance.js)
   - Confronto eager vs lazy
   - Benchmarking

5. [Applicazioni Pratiche](./esempi/05-ApplicazioniPratiche.js)
   - Elaborazione dati streaming
   - Sequenze event-driven

### Esercizi
1. [Sequenze Base](./esercizi/01-SequenzeBase.js)
   - Implementazione di sequenze lazy fondamentali

2. [Operatori su Sequenze](./esercizi/02-OperatoriSequenze.js)
   - Map, filter, take, drop per lazy sequences

3. [Generatori Avanzati](./esercizi/03-GeneratoriAvanzati.js)
   - Pattern con yield e delegazione di generatori

4. [Casi d'Uso Reali](./esercizi/04-CasiUsoReali.js)
   - Applicazioni in scenari concreti

[Soluzioni](./esercizi/Soluzioni.js)

## Risorse Aggiuntive
- [Documentazione su Iteratori e Generatori](https://developer.mozilla.org/it/docs/Web/JavaScript/Guide/Iteratori_e_generatori)
- "Functional Programming in JavaScript" di Luis Atencio (Capitoli su Lazy Evaluation)

## Prossimo Modulo
Continua con il [Modulo 8: Monads e Gestione degli Errori](../08-MonadsGestioneErrori/README.md) per esplorare come la programmazione funzionale gestisce operazioni che potrebbero fallire.
