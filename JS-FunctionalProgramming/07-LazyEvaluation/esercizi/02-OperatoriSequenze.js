/**
 * Esercizio 2: Operatori su Sequenze
 * 
 * In questo esercizio, implementerai vari operatori funzionali per
 * manipolare sequenze lazy in stile map, filter, ecc.
 */

const { range, take } = require('./01-SequenzeBase');

// Utility di test
function testSequence(gen, count = 5) {
  const iterator = gen();
  const result = [];
  for (let i = 0; i < count; i++) {
    const next = iterator.next();
    if (next.done) break;
    result.push(next.value);
  }
  return result;
}

/**
 * Esercizio 2.1: Map
 * 
 * Implementa un generatore che applica una funzione a ciascun elemento di un iterabile.
 * 
 * @param {Iterable} iterable - L'iterabile di origine
 * @param {Function} mapFn - La funzione da applicare a ciascun elemento
 * @yields {*} - I risultati dell'applicazione della funzione
 */
function* map(iterable, mapFn) {
  // Implementa la funzione
}

/**
 * Esercizio 2.2: Filter
 * 
 * Implementa un generatore che filtra gli elementi di un iterabile in base a un predicato.
 * 
 * @param {Iterable} iterable - L'iterabile di origine
 * @param {Function} predicate - Funzione che determina se un elemento deve essere incluso
 * @yields {*} - Gli elementi che soddisfano il predicato
 */
function* filter(iterable, predicate) {
  // Implementa la funzione
}

/**
 * Esercizio 2.3: TakeWhile
 * 
 * Implementa un generatore che preleva elementi da un iterabile fino a quando
 * un predicato restituisce false.
 * 
 * @param {Iterable} iterable - L'iterabile di origine
 * @param {Function} predicate - La condizione per continuare a prendere elementi
 * @yields {*} - Gli elementi che soddisfano il predicato
 */
function* takeWhile(iterable, predicate) {
  // Implementa la funzione
}

/**
 * Esercizio 2.4: DropWhile
 * 
 * Implementa un generatore che scarta elementi da un iterabile fino a quando
 * un predicato restituisce false, poi produce tutti gli elementi rimanenti.
 * 
 * @param {Iterable} iterable - L'iterabile di origine
 * @param {Function} predicate - La condizione per continuare a scartare elementi
 * @yields {*} - Gli elementi rimanenti dopo che il predicato diventa false
 */
function* dropWhile(iterable, predicate) {
  // Implementa la funzione
}

/**
 * Esercizio 2.5: Reduce
 * 
 * Implementa una funzione (non un generatore) che applica una funzione di riduzione
 * agli elementi di un iterabile.
 * 
 * @param {Iterable} iterable - L'iterabile da ridurre
 * @param {Function} reducer - La funzione di riduzione
 * @param {*} initialValue - Il valore iniziale per la riduzione
 * @returns {*} - Il risultato della riduzione
 */
function reduce(iterable, reducer, initialValue) {
  // Implementa la funzione
}

/**
 * Esercizio 2.6: Scan
 * 
 * Implementa un generatore che produce i risultati intermedi dell'applicazione
 * di una funzione di riduzione a un iterabile. A differenza di reduce, scan
 * produce ogni valore intermedio nel processo di riduzione.
 * 
 * @param {Iterable} iterable - L'iterabile di origine
 * @param {Function} reducer - La funzione di riduzione
 * @param {*} initialValue - Il valore iniziale
 * @yields {*} - I risultati intermedi della riduzione
 */
function* scan(iterable, reducer, initialValue) {
  // Implementa la funzione
}

/**
 * Esercizio 2.7: ChunkBy
 * 
 * Implementa un generatore che raggruppa elementi consecutivi di un iterabile
 * in array in base a un predicato di uguaglianza.
 * 
 * @param {Iterable} iterable - L'iterabile di origine
 * @param {Function} equalityFn - Funzione che determina se due elementi adiacenti sono uguali
 * @yields {Array} - Array di elementi consecutivi considerati uguali
 */
function* chunkBy(iterable, equalityFn = (a, b) => a === b) {
  // Implementa la funzione
}

/**
 * Esercizio 2.8: Chain
 * 
 * Implementa una funzione che concatena più iterabili in un'unica sequenza.
 * 
 * @param {...Iterable} iterables - Gli iterabili da concatenare
 * @yields {*} - Gli elementi di tutti gli iterabili, nell'ordine
 */
function* chain(...iterables) {
  // Implementa la funzione
}

// Test delle funzioni

console.log('Test map:');
console.log(testSequence(() => map(range(1, 5), x => x * x))); // [1, 4, 9, 16, 25]

console.log('\nTest filter:');
console.log(testSequence(() => filter(range(1, 10), x => x % 2 === 0))); // [2, 4, 6, 8, 10]

console.log('\nTest takeWhile:');
console.log(testSequence(() => takeWhile(range(1, 100), x => x < 6))); // [1, 2, 3, 4, 5]

console.log('\nTest dropWhile:');
console.log(testSequence(() => dropWhile(range(1, 10), x => x < 6))); // [6, 7, 8, 9, 10]

console.log('\nTest reduce:');
console.log(reduce(range(1, 5), (acc, x) => acc + x, 0)); // 15

console.log('\nTest scan:');
console.log(testSequence(() => scan(range(1, 5), (acc, x) => acc + x, 0))); // [0, 1, 3, 6, 10, 15]

console.log('\nTest chunkBy:');
console.log(testSequence(() => chunkBy([1, 1, 2, 3, 3, 3, 2, 2, 1]))); // [[1, 1], [2], [3, 3, 3], [2, 2], [1]]

console.log('\nTest chain:');
console.log(testSequence(() => chain([1, 2], [3, 4], [5]))); // [1, 2, 3, 4, 5]

/**
 * Esercizio 2.9 (Bonus): Compose operatori
 * 
 * Implementa una funzione pipe che prende un iterabile e una sequenza di funzioni
 * generatori, e restituisce un nuovo iterabile che è il risultato dell'applicazione
 * di tutte le funzioni generatori in sequenza.
 * 
 * @param {Iterable} iterable - L'iterabile di origine
 * @param {...Function} fns - Le funzioni generatori da applicare
 * @returns {Generator} - Un generatore che produce i risultati della pipeline
 */
function pipe(iterable, ...fns) {
  // Implementa la funzione
}

// Test di compose
console.log('\nTest pipe:');
const composedGen = pipe(
  range(1, 100),
  iter => filter(iter, x => x % 2 === 0),
  iter => map(iter, x => x * x),
  iter => take(iter, 5)
);
console.log(testSequence(() => composedGen)); // [4, 16, 36, 64, 100]

module.exports = {
  map,
  filter,
  takeWhile,
  dropWhile,
  reduce,
  scan,
  chunkBy,
  chain,
  pipe
};
