/**
 * Utilizzo Base di Reduce
 * 
 * La funzione reduce() esegue una funzione di callback su ogni elemento dell'array
 * per ridurlo ad un singolo valore risultante.
 */

// Esempio 1: Somma di numeri
const numeri = [1, 2, 3, 4, 5];

const somma = numeri.reduce((accumulatore, numero) => {
  console.log(`Accumulatore: ${accumulatore}, Numero corrente: ${numero}`);
  return accumulatore + numero;
}, 0);

console.log('Numeri originali:', numeri);
console.log('Somma dei numeri:', somma);

// Esempio 2: Calcolo del prodotto
const prodotto = numeri.reduce((acc, numero) => acc * numero, 1);
console.log('Prodotto dei numeri:', prodotto);

// Esempio 3: Trovare il massimo
const massimo = numeri.reduce((max, numero) => {
  return numero > max ? numero : max;
}, numeri[0]);
console.log('Valore massimo:', massimo);

// Esempio 4: Concatenazione di stringhe
const parole = ['Programmazione', 'funzionale', 'in', 'JavaScript'];

const frase = parole.reduce((acc, parola) => acc + ' ' + parola, '').trim();
console.log('Frase concatenata:', frase);

// Esempio 5: Conteggio delle occorrenze
const frutta = ['mela', 'banana', 'mela', 'arancia', 'banana', 'mela'];

const conteggio = frutta.reduce((acc, frutto) => {
  // Se il frutto è già stato contato, incrementa il contatore
  if (acc[frutto]) {
    acc[frutto]++;
  } else {
    // Altrimenti inizializza il contatore a 1
    acc[frutto] = 1;
  }
  return acc;
}, {});

console.log('Conteggio delle occorrenze:', conteggio);

// Esempio 6: Appiattimento di array annidati
const arrayAnnidato = [[1, 2], [3, 4], [5, 6]];

const appiattito = arrayAnnidato.reduce((acc, array) => {
  return acc.concat(array);
}, []);

console.log('Array appiattito:', appiattito);

// Esempio 7: Raggruppamento per una proprietà
const persone = [
  { nome: 'Alice', eta: 25, citta: 'Roma' },
  { nome: 'Bob', eta: 30, citta: 'Milano' },
  { nome: 'Carol', eta: 28, citta: 'Roma' },
  { nome: 'Dave', eta: 22, citta: 'Napoli' },
  { nome: 'Eve', eta: 35, citta: 'Milano' }
];

const perCitta = persone.reduce((acc, persona) => {
  // Se la chiave della città non esiste, crea un array vuoto
  if (!acc[persona.citta]) {
    acc[persona.citta] = [];
  }
  // Aggiungi la persona all'array della città
  acc[persona.citta].push(persona);
  return acc;
}, {});

console.log('Raggruppamento per città:', perCitta);

// Esempio 8: Pipeline di trasformazioni con reduce
const pipeline = [
  num => num + 10,   // Aggiungi 10
  num => num * 2,    // Moltiplica per 2
  num => num - 5     // Sottrai 5
];

const risultatoPipeline = pipeline.reduce((acc, fn) => {
  return fn(acc);
}, 5); // Valore iniziale: 5

console.log('Risultato della pipeline:', risultatoPipeline); // ((5 + 10) * 2) - 5 = 25

// Esempio 9: Rimozione dei duplicati con reduce
const conDuplicati = [1, 2, 2, 3, 4, 4, 5, 5, 5];

const senzaDuplicati = conDuplicati.reduce((acc, numero) => {
  if (!acc.includes(numero)) {
    acc.push(numero);
  }
  return acc;
}, []);

console.log('Array senza duplicati:', senzaDuplicati);

// Esempio 10: Implementazione manuale di reduce
Array.prototype.reducePersonalizzato = function(callback, valoreIniziale) {
  let accumulatore = valoreIniziale;
  let indiceIniziale = 0;
  
  // Se non è stato fornito un valore iniziale, usa il primo elemento come accumulatore
  if (arguments.length < 2) {
    if (this.length === 0) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulatore = this[0];
    indiceIniziale = 1;
  }
  
  for (let i = indiceIniziale; i < this.length; i++) {
    accumulatore = callback(accumulatore, this[i], i, this);
  }
  
  return accumulatore;
};

const sommaPersonalizzata = numeri.reducePersonalizzato((acc, num) => acc + num, 0);
console.log('Somma con implementazione personalizzata:', sommaPersonalizzata);
