/**
 * Utilizzo Base di Filter
 * 
 * La funzione filter() crea un nuovo array con tutti gli elementi
 * che superano il test implementato dalla funzione fornita.
 */

// Esempio 1: Filtraggio di numeri
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Filtrare i numeri pari
const numeriPari = numeri.filter(numero => numero % 2 === 0);
console.log('Numeri originali:', numeri);
console.log('Numeri pari:', numeriPari);

// Filtrare i numeri maggiori di 5
const maggioriDi5 = numeri.filter(numero => numero > 5);
console.log('Numeri maggiori di 5:', maggioriDi5);

// Filtrare i numeri primi
const isPrimo = num => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  
  let i = 5;
  while (i * i <= num) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
    i += 6;
  }
  return true;
};

const numeriPrimi = numeri.filter(isPrimo);
console.log('Numeri primi:', numeriPrimi);

// Esempio 2: Filtraggio di stringhe
const parole = ['mela', 'banana', 'arancia', 'kiwi', 'avocado', 'mango'];

// Filtrare parole con più di 5 lettere
const paroleLunghe = parole.filter(parola => parola.length > 5);
console.log('Parole con più di 5 lettere:', paroleLunghe);

// Filtrare parole che iniziano con 'a'
const paroleConA = parole.filter(parola => parola.startsWith('a'));
console.log('Parole che iniziano con a:', paroleConA);

// Esempio 3: Filtraggio con indice
const conIndice = numeri.filter((numero, indice) => {
  // Seleziona solo elementi in posizioni pari
  return indice % 2 === 0;
});
console.log('Elementi in posizioni pari:', conIndice);

// Esempio 4: Filtraggio di oggetti
const prodotti = [
  { nome: 'Laptop', prezzo: 1200, disponibile: true },
  { nome: 'Telefono', prezzo: 800, disponibile: false },
  { nome: 'Tablet', prezzo: 500, disponibile: true },
  { nome: 'Monitor', prezzo: 300, disponibile: true },
  { nome: 'Tastiera', prezzo: 100, disponibile: false }
];

// Filtrare prodotti disponibili
const prodottiDisponibili = prodotti.filter(prodotto => prodotto.disponibile);
console.log('Prodotti disponibili:', prodottiDisponibili);

// Filtrare prodotti costosi (prezzo > 500)
const prodottiCostosi = prodotti.filter(prodotto => prodotto.prezzo > 500);
console.log('Prodotti costosi:', prodottiCostosi);

// Esempio 5: Rimozione di valori falsy
const valoriMisti = [0, 1, false, 2, '', 3, null, undefined, 4, NaN];
const valoriFiltrati = valoriMisti.filter(Boolean);
console.log('Valori filtrati (solo truthy):', valoriFiltrati);

// Esempio 6: Rimozione dei duplicati
const conDuplicati = [1, 2, 2, 3, 4, 4, 5, 5, 5];
const senzaDuplicati = conDuplicati.filter(
  (valore, indice, array) => array.indexOf(valore) === indice
);
console.log('Array senza duplicati:', senzaDuplicati);

// Esempio 7: Ricerca in testo
const libri = [
  { titolo: 'Il Signore degli Anelli', autore: 'Tolkien', genere: 'Fantasy' },
  { titolo: 'Harry Potter', autore: 'Rowling', genere: 'Fantasy' },
  { titolo: '1984', autore: 'Orwell', genere: 'Distopia' },
  { titolo: 'Il Conte di Montecristo', autore: 'Dumas', genere: 'Avventura' }
];

function cercaLibri(query) {
  return libri.filter(libro => {
    const testoRicerca = `${libro.titolo} ${libro.autore} ${libro.genere}`.toLowerCase();
    return testoRicerca.includes(query.toLowerCase());
  });
}

console.log('Ricerca "Fantasy":', cercaLibri('Fantasy'));
console.log('Ricerca "Il":', cercaLibri('Il'));

// Esempio 8: Implementazione manuale di filter
Array.prototype.filterPersonalizzato = function(callback) {
  const risultato = [];
  for (let i = 0; i < this.length; i++) {
    if (callback(this[i], i, this)) {
      risultato.push(this[i]);
    }
  }
  return risultato;
};

const dispariConFilter = numeri.filterPersonalizzato(n => n % 2 !== 0);
console.log('Numeri dispari con implementazione personalizzata:', dispariConFilter);
