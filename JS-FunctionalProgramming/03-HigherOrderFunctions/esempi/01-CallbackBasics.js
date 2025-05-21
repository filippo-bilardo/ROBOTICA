/**
 * 01-CallbackBasics.js
 * 
 * Questo file mostra i principi fondamentali dei callback,
 * che sono uno dei pattern più comuni di higher-order functions
 * in JavaScript.
 */

// --------------------------------------------------------
// ESEMPIO 1: Callback semplice come funzione
// --------------------------------------------------------

// La funzione 'eseguiOperazione' accetta una funzione di callback
function eseguiOperazione(a, b, operazioneFn) {
  console.log(`Esecuzione dell'operazione su ${a} e ${b}`);
  const risultato = operazioneFn(a, b); // Invoca il callback passato come parametro
  return risultato;
}

// Definiamo alcune funzioni che eseguono operazioni specifiche
function somma(x, y) {
  return x + y;
}

function prodotto(x, y) {
  return x * y;
}

// Usiamo la higher-order function passando diverse funzioni di callback
console.log("Somma:", eseguiOperazione(5, 3, somma)); // Output: Somma: 8
console.log("Prodotto:", eseguiOperazione(5, 3, prodotto)); // Output: Prodotto: 15

// Possiamo anche usare funzioni anonime inline come callback
console.log("Differenza:", eseguiOperazione(5, 3, function(x, y) {
  return x - y;
})); // Output: Differenza: 2

// O usare arrow functions per callback più concisi
console.log("Divisione:", eseguiOperazione(10, 2, (x, y) => x / y)); // Output: Divisione: 5

// --------------------------------------------------------
// ESEMPIO 2: Callback con gestione degli errori
// --------------------------------------------------------

function divisioneConErrorHandling(a, b, onSuccess, onError) {
  if (b === 0) {
    onError("Divisione per zero non consentita"); // Callback di errore
  } else {
    const risultato = a / b;
    onSuccess(risultato); // Callback di successo
  }
}

divisioneConErrorHandling(10, 2,
  (risultato) => console.log("Risultato:", risultato),
  (errore) => console.error("Errore:", errore)
); // Output: Risultato: 5

divisioneConErrorHandling(10, 0,
  (risultato) => console.log("Risultato:", risultato),
  (errore) => console.error("Errore:", errore)
); // Output: Errore: Divisione per zero non consentita

// --------------------------------------------------------
// ESEMPIO 3: Callback asincroni
// --------------------------------------------------------

function elaboraDatiAsincroni(dati, callback) {
  console.log("Inizio elaborazione asincrona...");
  
  // Simuliamo un'operazione asincrona con setTimeout
  setTimeout(() => {
    const risultatiElaborati = dati.map(x => x * 2);
    console.log("Elaborazione completata");
    callback(risultatiElaborati); // Invoca il callback con i risultati
  }, 1000);
  
  console.log("La funzione è stata chiamata (ma l'elaborazione continua in background)");
}

console.log("Prima dell'elaborazione");

elaboraDatiAsincroni([1, 2, 3, 4], (risultati) => {
  console.log("Callback eseguito. Risultati:", risultati);
});

console.log("Dopo la chiamata di elaborazione (ma prima del completamento)");

/* Output atteso:
Prima dell'elaborazione
Inizio elaborazione asincrona...
La funzione è stata chiamata (ma l'elaborazione continua in background)
Dopo la chiamata di elaborazione (ma prima del completamento)
[dopo 1 secondo]
Elaborazione completata
Callback eseguito. Risultati: [2, 4, 6, 8]
*/

// --------------------------------------------------------
// ESEMPIO 4: Callback nella programmazione funzionale
// --------------------------------------------------------

// Array di numeri
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Usiamo i metodi array nativi che accettano callback
const pari = numeri.filter(num => num % 2 === 0);
console.log("Numeri pari:", pari); // Output: [2, 4, 6, 8, 10]

const quadrati = numeri.map(num => num * num);
console.log("Quadrati:", quadrati); // Output: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

const sommaNumeri = numeri.reduce((acc, num) => acc + num, 0);
console.log("Somma:", sommaNumeri); // Output: 55

// Concateniamo operazioni con callback 
const sommaPariQuadrati = numeri
  .filter(num => num % 2 === 0)     // Filtra i numeri pari
  .map(num => num * num)            // Calcola i quadrati
  .reduce((acc, num) => acc + num, 0); // Somma i risultati

console.log("Somma dei quadrati dei numeri pari:", sommaPariQuadrati); // Output: 220

// --------------------------------------------------------
// ESEMPIO 5: Creazione di funzioni che producono callback
// --------------------------------------------------------

// Generatore di funzioni di filtro
function creaFiltroMaggiore(soglia) {
  return function(numero) {
    return numero > soglia;
  };
}

const filtraMaggiore5 = creaFiltroMaggiore(5);
const filtraMaggiore8 = creaFiltroMaggiore(8);

console.log("Numeri > 5:", numeri.filter(filtraMaggiore5)); // Output: [6, 7, 8, 9, 10]
console.log("Numeri > 8:", numeri.filter(filtraMaggiore8)); // Output: [9, 10]
