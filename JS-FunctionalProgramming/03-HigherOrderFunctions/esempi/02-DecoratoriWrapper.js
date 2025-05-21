/**
 * 02-DecoratoriWrapper.js
 * 
 * Questo file dimostra l'uso di decoratori e wrapper, un pattern potente
 * basato sulle higher-order functions che permette di aggiungere funzionalità
 * a funzioni esistenti senza modificarle.
 */

// --------------------------------------------------------
// ESEMPIO 1: Decoratore di base
// --------------------------------------------------------

// Funzione originale che vogliamo decorare
function saluta(nome) {
  return `Ciao, ${nome}!`;
}

// Decoratore che aggiunge la data e ora corrente al messaggio
function conTimestamp(funzione) {
  // Restituisce una nuova funzione che "avvolge" (wraps) quella originale
  return function(...args) {
    const timestamp = new Date().toISOString();
    const risultatoOriginale = funzione(...args);
    return `[${timestamp}] ${risultatoOriginale}`;
  };
}

// Creiamo una nuova funzione applicando il decoratore
const salutaConTimestamp = conTimestamp(saluta);

console.log(saluta("Mario")); // Output: Ciao, Mario!
console.log(salutaConTimestamp("Mario")); // Output: [2023-08-24T14:23:05.123Z] Ciao, Mario!

// --------------------------------------------------------
// ESEMPIO 2: Decoratori multipli in cascata
// --------------------------------------------------------

// Decoratore che converte il messaggio in maiuscolo
function inMaiuscolo(funzione) {
  return function(...args) {
    const risultatoOriginale = funzione(...args);
    return risultatoOriginale.toUpperCase();
  };
}

// Decoratore che aggiunge enfasi al messaggio
function conEnfasi(funzione) {
  return function(...args) {
    const risultatoOriginale = funzione(...args);
    return `*** ${risultatoOriginale} ***`;
  };
}

// Applichiamo una catena di decoratori alla funzione originale
const salutaFancy = conEnfasi(inMaiuscolo(conTimestamp(saluta)));

console.log(salutaFancy("Luigi")); 
// Output: *** [2023-08-24T14:23:05.456Z] CIAO, LUIGI! ***

// --------------------------------------------------------
// ESEMPIO 3: Decoratore per il logging
// --------------------------------------------------------

// Decoratore che aggiunge il logging prima e dopo l'esecuzione
function conLogging(funzione) {
  return function(...args) {
    console.log(`⬇️ Chiamata ${funzione.name} con argomenti: ${JSON.stringify(args)}`);
    const inizioEsecuzione = performance.now();
    
    const risultato = funzione(...args);
    
    const tempoEsecuzione = performance.now() - inizioEsecuzione;
    console.log(`⬆️ ${funzione.name} ha restituito: ${JSON.stringify(risultato)} (${tempoEsecuzione.toFixed(2)}ms)`);
    
    return risultato;
  };
}

// Funzione che simula un'operazione costosa
function calcolaFibonacci(n) {
  if (n <= 1) return n;
  return calcolaFibonacci(n - 1) + calcolaFibonacci(n - 2);
}

// Applichiamo il decoratore di logging
const fibonacciConLog = conLogging(calcolaFibonacci);

fibonacciConLog(10); // Vedremo il log dell'inizio e della fine con il tempo trascorso

// --------------------------------------------------------
// ESEMPIO 4: Decoratore per la memorizzazione (memoization)
// --------------------------------------------------------

// Decoratore che memorizza i risultati per riutilizzarli
function conMemoization(funzione) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log(`🎯 Cache hit per ${funzione.name}(${args})`);
      return cache.get(key);
    }
    
    console.log(`🔍 Cache miss per ${funzione.name}(${args}), calcolo in corso...`);
    const risultato = funzione(...args);
    cache.set(key, risultato);
    return risultato;
  };
}

// Applichiamo il decoratore di memorizzazione
const fibonacciMemoizzato = conMemoization(calcolaFibonacci);

console.time('Prima chiamata');
console.log(`Fibonacci(20) = ${fibonacciMemoizzato(20)}`);
console.timeEnd('Prima chiamata');

console.time('Seconda chiamata');
console.log(`Fibonacci(20) = ${fibonacciMemoizzato(20)}`); // Questa sarà molto più veloce
console.timeEnd('Seconda chiamata');

// --------------------------------------------------------
// ESEMPIO 5: Decoratore per la gestione degli errori
// --------------------------------------------------------

// Decoratore che aggiunge gestione degli errori a una funzione
function conGestioneErrori(funzione, messaggioErrore = "Si è verificato un errore") {
  return function(...args) {
    try {
      return funzione(...args);
    } catch (errore) {
      console.error(`🛑 ${messaggioErrore}: ${errore.message}`);
      return null; // O un altro valore predefinito
    }
  };
}

// Funzione che potrebbe generare errori
function dividi(a, b) {
  if (b === 0) throw new Error("Divisione per zero");
  return a / b;
}

// Applichiamo il decoratore per la gestione degli errori
const dividiSafe = conGestioneErrori(dividi, "Errore durante la divisione");

console.log(dividiSafe(10, 2)); // Output: 5
console.log(dividiSafe(10, 0)); // Output: 🛑 Errore durante la divisione: Divisione per zero

// --------------------------------------------------------
// ESEMPIO 6: Utilizzo pratico dei decoratori in un contesto reale
// --------------------------------------------------------

// Simulazione di una funzione che fa una chiamata API
function recuperaDatiUtente(id) {
  console.log(`Recupero dati per l'utente ${id} dal server...`);
  
  // Simulazione recupero dati
  if (id < 0) throw new Error("ID utente non valido");
  
  // Simula un ritardo di rete
  const inizio = Date.now();
  while (Date.now() - inizio < 100) {} // Busy wait di 100ms
  
  return {
    id,
    nome: `Utente ${id}`,
    email: `utente${id}@esempio.com`
  };
}

// Creiamo una versione migliorata con tutti i nostri decoratori
const recuperaDatiUtenteMigliorato = conGestioneErrori(
  conMemoization(
    conLogging(
      recuperaDatiUtente
    )
  ),
  "Errore nel recupero dei dati utente"
);

// Test della funzione
console.log("Primo recupero dati utente:");
const utente1 = recuperaDatiUtenteMigliorato(42);
console.log(utente1);

console.log("\nSecondo recupero (dati in cache):");
const utente2 = recuperaDatiUtenteMigliorato(42);
console.log(utente2);

console.log("\nRecupero con errore:");
const utenteErrore = recuperaDatiUtenteMigliorato(-1);
console.log(utenteErrore);
