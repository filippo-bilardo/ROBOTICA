/**
 * Esercizio: Combinatori Monadici
 * 
 * In questo esercizio implementerai operatori avanzati per lavorare con monads,
 * spesso chiamati "combinatori monadici".
 */

// Importiamo le implementazioni di Maybe e Either
// Nota: se hai creato implementazioni diverse negli esercizi precedenti,
// puoi sostituire queste importazioni con le tue.
const Maybe = require('../esempi/01-ImplementazioniBase').Maybe;
const Either = require('../esempi/01-ImplementazioniBase').Either;

// ==========================================
// ESERCIZIO 1: Funzioni Higher-Order per Monads
// ==========================================

/**
 * Implementa le seguenti funzioni "higher-order" per lavorare con monads:
 * 
 * 1. lift: converte una funzione normale in una funzione che lavora con un monad
 *    lift :: (a -> b) -> (M a -> M b)
 *    
 * 2. liftA2: applica una funzione binaria a due monads
 *    liftA2 :: (a -> b -> c) -> M a -> M b -> M c
 *    
 * 3. sequence: converte un array di monads in un monad di array
 *    sequence :: [M a] -> M [a]
 *    
 * 4. traverse: mappa una funzione che ritorna un monad su un array e sequenzia il risultato
 *    traverse :: (a -> M b) -> [a] -> M [b]
 */

// lift :: (a -> b) -> (M a -> M b)
function lift(fn) {
  // TODO: implementa questa funzione
  // Suggerimento: dovrebbe ritornare una funzione che accetta un monad
  // e ritorna un nuovo monad con il risultato dell'applicazione di fn al valore
}

// liftA2 :: (a -> b -> c) -> M a -> M b -> M c
function liftA2(fn, m1, m2) {
  // TODO: implementa questa funzione
  // Suggerimento: estrai i valori dai monad, applica la funzione, e avvolgi il risultato
}

// sequence :: [M a] -> M [a]
function sequence(monads, MonadType) {
  // TODO: implementa questa funzione
  // Suggerimento: utilizza reduce per combinare tutti i monads in un singolo monad contenente un array
}

// traverse :: (a -> M b) -> [a] -> M [b]
function traverse(fn, array, MonadType) {
  // TODO: implementa questa funzione
  // Suggerimento: applica fn a ogni elemento e poi usa sequence
}

// ==========================================
// ESERCIZIO 2: Implementazione di combinatori monadici specializzati
// ==========================================

/**
 * Implementa i seguenti combinatori monadici specializzati:
 * 
 * 1. filterM: versione monadica di filter
 *    filterM :: (a -> M Boolean) -> [a] -> M [a]
 *    
 * 2. joinM: appiattisce un monad annidato
 *    joinM :: M (M a) -> M a
 *    
 * 3. composeM: composizione di funzioni monadiche (Kleisli composition)
 *    composeM :: (b -> M c) -> (a -> M b) -> (a -> M c)
 *    
 * 4. memoizeM: memoizza una funzione monadica
 *    memoizeM :: (a -> M b) -> (a -> M b)
 */

// filterM :: (a -> M Boolean) -> [a] -> M [a]
function filterM(predicateFn, array, MonadType) {
  // TODO: implementa questa funzione
}

// joinM :: M (M a) -> M a
function joinM(nestedMonad) {
  // TODO: implementa questa funzione
}

// composeM :: (b -> M c) -> (a -> M b) -> (a -> M c)
function composeM(f, g) {
  // TODO: implementa questa funzione
  // Suggerimento: questa è la "composizione di Kleisli"
}

// memoizeM :: (a -> M b) -> (a -> M b)
function memoizeM(fn) {
  // TODO: implementa questa funzione
  // Suggerimento: usa una mappa per memorizzare i risultati
}

// ==========================================
// ESERCIZIO 3: Creazione di una Do-notation simulata
// ==========================================

/**
 * Implementa una versione semplificata della Do-notation di Haskell per JavaScript.
 * Questa funzione dovrebbe consentire di scrivere codice monadico in modo più leggibile.
 * 
 * Esempio di utilizzo desiderato:
 * 
 * const result = doM(function*() {
 *   const a = yield Maybe.just(5);
 *   const b = yield Maybe.just(10);
 *   return a + b;
 * });
 * 
 * // result dovrebbe essere Maybe.just(15)
 */

function doM(generatorFn) {
  // TODO: implementa questa funzione
  // Suggerimento: usa i generatori di JavaScript per simulare la do-notation
}

// ==========================================
// ESERCIZIO 4: Utilizzo avanzato dei combinatori
// ==========================================

/**
 * In questo esercizio, userai i combinatori che hai implementato per risolvere
 * diversi problemi pratici.
 */

// Problema 1: Calcola la media dei numeri validi in un array.
// Alcuni valori potrebbero essere undefined o non numerici.
function calculateAverage(values) {
  // TODO: implementa questa funzione usando Maybe e i combinatori
  // Suggerimento: usa traverse con una funzione che converte valori in Maybe<number>
}

// Problema 2: Esegui una serie di validazioni utilizzando Either
// e ritorna tutti gli errori o il risultato finale.
function validateData(data) {
  // TODO: implementa questa funzione usando Either e i combinatori
  // Suggerimento: usa composeM per concatenare funzioni di validazione
}

// Problema 3: Implementa un sistema di cache per operazioni costose
// che potrebbero fallire.
function expensiveOperation(id) {
  console.log(`Esecuzione operazione costosa per id: ${id}`);
  if (Math.random() < 0.3) {
    return Either.left(new Error(`Fallimento per id=${id}`));
  }
  return Either.right(`Risultato per ${id}: ${Math.random().toFixed(4)}`);
}

// TODO: usa memoizeM per creare una versione con cache di expensiveOperation

// ==========================================
// Test delle tue implementazioni
// ==========================================

function runTests() {
  console.log("===== Test Combinatori Base =====");
  // TODO: aggiungi test per lift, liftA2, sequence e traverse
  
  console.log("\n===== Test Combinatori Specializzati =====");
  // TODO: aggiungi test per filterM, joinM, composeM e memoizeM
  
  console.log("\n===== Test Do-Notation =====");
  // TODO: aggiungi test per doM
  
  console.log("\n===== Test Utilizzo Avanzato =====");
  
  const testValues1 = [10, 20, undefined, 30, "not a number", 40];
  console.log(`Media dei valori validi in [${testValues1}]: ${calculateAverage(testValues1)}`);
  
  const testData = { name: "Test", age: "25", email: "test@example.com" };
  console.log("Validazione dati:", validateData(testData).toString());
  
  const cachedOperation = memoizeM(expensiveOperation);
  
  console.log("Prima chiamata per id=1:");
  console.log(cachedOperation(1).toString());
  
  console.log("Seconda chiamata per id=1 (dovrebbe usare la cache):");
  console.log(cachedOperation(1).toString());
  
  console.log("Chiamata per id=2:");
  console.log(cachedOperation(2).toString());
}

runTests();

// ==========================================
// BONUS: Implementazione di un Monad Writer
// ==========================================

/**
 * COMPITO BONUS:
 * Implementa un Writer monad che permette di accumulare un log durante l'esecuzione.
 * Writer è utile per debugging o per tenere traccia di operazioni.
 * 
 * Writer<T> rappresenta un calcolo che produce un valore di tipo T e un log.
 * 
 * Metodi da implementare:
 * - of(value): crea un Writer con il valore specificato e un log vuoto
 * - map(fn): applica una funzione al valore mantenendo il log
 * - chain(fn): applica una funzione che ritorna un Writer, concatenando i log
 * - tell(message): aggiunge un messaggio al log senza modificare il valore
 * - execute(): restituisce la coppia [valore, log]
 */

// TODO: implementa Writer monad
