/**
 * 03-ApplicazioneParzialeCurrying.js
 * 
 * Questo file dimostra le tecniche di applicazione parziale e currying,
 * pattern importanti nella programmazione funzionale che sfruttano
 * le higher-order functions per creare funzioni più specializzate.
 */

// --------------------------------------------------------
// PARTE 1: Applicazione Parziale
// --------------------------------------------------------

console.log("===== APPLICAZIONE PARZIALE =====");

/**
 * L'applicazione parziale consiste nel pre-applicare alcuni argomenti
 * a una funzione, creando una nuova funzione che accetta gli
 * argomenti rimanenti.
 */

// Funzione originale con più parametri
function somma(a, b, c) {
  return a + b + c;
}

// Funzione di applicazione parziale generica
function applicaParzialmente(fn, ...argsPreapplicati) {
  return function(...argsRimanenti) {
    return fn(...argsPreapplicati, ...argsRimanenti);
  };
}

// Creiamo una versione parzialmente applicata di somma
const sommaPiuCinque = applicaParzialmente(somma, 5);
const sommaCinquePiuDieci = applicaParzialmente(somma, 5, 10);

console.log(somma(5, 10, 20)); // Output: 35
console.log(sommaPiuCinque(10, 20)); // Output: 35
console.log(sommaCinquePiuDieci(20)); // Output: 35

// Esempio pratico: formattatore di prezzi
function formattaPrezzo(valuta, decimali, prezzo) {
  return `${valuta}${prezzo.toFixed(decimali)}`;
}

// Creiamo formattatori specifici
const formattaEuro = applicaParzialmente(formattaPrezzo, '€', 2);
const formattaDollaro = applicaParzialmente(formattaPrezzo, '$', 2);
const formattaYen = applicaParzialmente(formattaPrezzo, '¥', 0);

console.log(formattaEuro(99.99)); // Output: €99.99
console.log(formattaDollaro(99.99)); // Output: $99.99
console.log(formattaYen(99.99)); // Output: ¥100

// --------------------------------------------------------
// PARTE 2: Currying
// --------------------------------------------------------

console.log("\n===== CURRYING =====");

/**
 * Il currying è la trasformazione di una funzione con più argomenti
 * in una sequenza di funzioni con un singolo argomento.
 */

// Funzione currificata manualmente
function sommaC(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

console.log(sommaC(5)(10)(20)); // Output: 35

// Function factory generica di currying
function curry(fn) {
  return function currificata(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return function(...altriArgs) {
      return currificata(...args, ...altriArgs);
    };
  };
}

// Trasformiamo la nostra funzione somma in una versione currificata
const sommaCC = curry(somma);

console.log(sommaCC(5)(10)(20)); // Output: 35
console.log(sommaCC(5, 10)(20)); // Output: 35
console.log(sommaCC(5)(10, 20)); // Output: 35
console.log(sommaCC(5, 10, 20)); // Output: 35

// Esempio pratico: filtro di array configurabile
const filtro = curry(function(predicato, array) {
  return array.filter(predicato);
});

const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const isPari = x => x % 2 === 0;
const isMaggioreDi = curry((soglia, x) => x > soglia);

const filtraPari = filtro(isPari);
const filtraMaggioriDi5 = filtro(isMaggioreDi(5));

console.log(filtraPari(numeri)); // Output: [2, 4, 6, 8, 10]
console.log(filtraMaggioriDi5(numeri)); // Output: [6, 7, 8, 9, 10]

// --------------------------------------------------------
// PARTE 3: Confronto e Combinazione delle tecniche
// --------------------------------------------------------

console.log("\n===== CONFRONTO E COMBINAZIONE =====");

// Funzione per calcolare il totale con sconto e tasse
function calcolaTotale(prezzoBase, percentualeSconto, percentualeTasse) {
  const prezzoScontato = prezzoBase * (1 - percentualeSconto / 100);
  const totaleConTasse = prezzoScontato * (1 + percentualeTasse / 100);
  return totaleConTasse;
}

// Versione con applicazione parziale
const calcolaOggiConTasseItaliane = applicaParzialmente(calcolaTotale, null, null, 22);

// Versione con currying
const calcolaC = curry(calcolaTotale);
const calcoloStagionale = calcolaC(null)(20); // Sconto del 20%
const calcoloStagionaleIVA = calcoloStagionale(22); // IVA al 22%

// Calcolare il totale per un prodotto da 100€
console.log("Totale con tasse italiane:", calcolaOggiConTasseItaliane(100, 10)); // Sconto 10%, IVA 22%
console.log("Totale stagionale con IVA:", calcoloStagionaleIVA(100)); // Prodotto da 100€

// --------------------------------------------------------
// PARTE 4: Applicazioni Avanzate
// --------------------------------------------------------

console.log("\n===== APPLICAZIONI AVANZATE =====");

// Composizione di funzioni con currying
const componi = function(...fns) {
  return fns.reduce((f, g) => (...args) => f(g(...args)));
};

const raddoppia = x => x * 2;
const incrementa = x => x + 1;
const quadrato = x => x * x;

// Creiamo una pipeline di funzioni
const pipeline = componi(quadrato, raddoppia, incrementa);
console.log(pipeline(3)); // ((3 + 1) * 2)² = 64

// Creazione di validatori modulari
const validatore = curry((regola, messaggioErrore, valore) => {
  return {
    valido: regola(valore),
    messaggio: regola(valore) ? null : messaggioErrore
  };
});

const isNonVuoto = s => s.trim().length > 0;
const hasLunghezzaMinima = min => s => s.length >= min;
const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const validaNonVuoto = validatore(isNonVuoto, "Il campo non può essere vuoto");
const validaPassword = validatore(hasLunghezzaMinima(8), "La password deve avere almeno 8 caratteri");
const validaEmail = validatore(isEmail, "Email non valida");

console.log(validaNonVuoto("ciao")); // { valido: true, messaggio: null }
console.log(validaPassword("abc")); // { valido: false, messaggio: "La password deve avere almeno 8 caratteri" }
console.log(validaEmail("user@example.com")); // { valido: true, messaggio: null }

// Esempio di PointFree style con currying
// Point-free significa che non menzioniamo esplicitamente i parametri della funzione
const moltiplicaPer = curry((a, b) => a * b);
const doppio = moltiplicaPer(2); // Non menzioniamo il parametro b
const triplo = moltiplicaPer(3);

console.log(doppio(5)); // Output: 10
console.log(triplo(5)); // Output: 15

// Pipeline complessa con funzioni curryficate
const map = curry((fn, arr) => arr.map(fn));
const filter = curry((fn, arr) => arr.filter(fn));
const reduce = curry((fn, initial, arr) => arr.reduce(fn, initial));

const sommaTutti = reduce((acc, val) => acc + val, 0);
const quadratiPari = componi(
  sommaTutti,
  map(x => x * x),
  filter(x => x % 2 === 0)
);

console.log(quadratiPari([1, 2, 3, 4, 5])); // Somma dei quadrati dei numeri pari: 20
