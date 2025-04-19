# Esercitazione 1: Introduzione a Node.js

## Descrizione

Questa prima esercitazione ti introdurrà a Node.js, spiegandone le caratteristiche fondamentali, i vantaggi e come configurare l'ambiente di sviluppo. Imparerai a eseguire il tuo primo script Node.js e comprenderai il funzionamento del modello asincrono basato su eventi.

## Obiettivi

- Comprendere cos'è Node.js e perché è importante
- Installare Node.js sul proprio sistema
- Eseguire il primo script "Hello World"
- Esplorare il modello di programmazione asincrona
- Utilizzare la console di Node.js (REPL)

## Esercizi Pratici

1. **Installazione di Node.js**
   - Scarica e installa Node.js dal sito ufficiale
   - Verifica l'installazione con i comandi `node -v` e `npm -v`

2. **Hello World**
   - Crea un file `hello.js` con il seguente contenuto:
     ```javascript
     console.log('Hello, Node.js!');
     ```
   - Eseguilo con il comando `node hello.js`

3. **Utilizzo del REPL**
   - Avvia il REPL digitando `node` nel terminale
   - Sperimenta con alcune espressioni JavaScript
   - Esplora i comandi speciali del REPL (`.help`, `.exit`, ecc.)

4. **Primo Script Asincrono**
   - Crea un file `async.js` con il seguente contenuto:
     ```javascript
     console.log('Inizio');
     
     setTimeout(() => {
       console.log('Operazione asincrona completata');
     }, 2000);
     
     console.log('Fine');
     ```
   - Eseguilo e osserva l'ordine di esecuzione

## Argomenti Teorici Collegati

- [1. Storia di Node.js](./teoria/01-storia.md)
- [2. Architettura di Node.js](./teoria/02-architettura.md)
- [3. Event Loop](./teoria/03-event-loop.md)
- [4. JavaScript Runtime](./teoria/04-javascript-runtime.md)
- [5. Programmazione Asincrona](./teoria/05-programmazione-asincrona.md)

## Risorse Aggiuntive

- [Documentazione ufficiale di Node.js](https://nodejs.org/docs/)
- [Node.js su GitHub](https://github.com/nodejs/node)
- [Guida interattiva a Node.js](https://nodeschool.io/)

## Prossima Esercitazione

Nella prossima esercitazione, esploreremo i moduli core di Node.js, che forniscono funzionalità essenziali per lo sviluppo di applicazioni.

[Prossima Esercitazione](./02-ModuliCore/README.md)