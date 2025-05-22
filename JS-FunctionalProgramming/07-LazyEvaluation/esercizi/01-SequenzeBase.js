/**
 * Esercizio 1: Sequenze Base
 * 
 * Implementa le seguenti funzioni per creare e manipolare sequenze lazy.
 * Per ogni esercizio, completa la funzione fornita seguendo le istruzioni.
 */

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
 * Esercizio 1.1: Range
 * 
 * Implementa un generatore che produce una sequenza di numeri
 * da start a end (inclusi) con il passo specificato.
 * 
 * @param {number} start - Il valore iniziale
 * @param {number} end - Il valore finale (incluso)
 * @param {number} step - L'incremento tra i valori (default 1)
 * @yields {number} - I numeri nella sequenza
 */
function* range(start, end, step = 1) {
  // Implementa la funzione
}

/**
 * Esercizio 1.2: Sequenza di Fibonacci
 * 
 * Crea un generatore che produca i numeri della sequenza di Fibonacci.
 * La sequenza inizia con 0, 1 e ogni numero successivo è la somma dei due precedenti.
 * 
 * @yields {number} - Il prossimo numero di Fibonacci
 */
function* fibonacci() {
  // Implementa la funzione
}

/**
 * Esercizio 1.3: Take
 * 
 * Implementa un generatore che prende i primi n elementi da un iterabile.
 * 
 * @param {Iterable} iterable - L'iterabile di origine
 * @param {number} n - Il numero di elementi da prendere
 * @yields {*} - Gli elementi presi dall'iterabile
 */
function* take(iterable, n) {
  // Implementa la funzione
}

/**
 * Esercizio 1.4: Cycle
 * 
 * Crea un generatore che cicla indefinitamente sugli elementi di un iterabile.
 * Esempio: cycle([1, 2, 3]) produce 1, 2, 3, 1, 2, 3, 1, 2, 3, ...
 * 
 * @param {Iterable} iterable - L'iterabile da ciclare
 * @yields {*} - Gli elementi dell'iterabile, ciclati
 */
function* cycle(iterable) {
  // Implementa la funzione
}

/**
 * Esercizio 1.5: Zip
 * 
 * Crea un generatore che combina elementi corrispondenti di più iterabili.
 * Il generatore si ferma quando uno qualsiasi degli iterabili termina.
 * 
 * @param {...Iterable} iterables - Gli iterabili da combinare
 * @yields {Array} - Un array contenente gli elementi corrispondenti di ciascun iterabile
 */
function* zip(...iterables) {
  // Implementa la funzione
}

// Test delle funzioni

console.log('Test range:');
console.log(testSequence(() => range(1, 10, 2))); // [1, 3, 5, 7, 9]
console.log(testSequence(() => range(10, 1, -2))); // [10, 8, 6, 4, 2]

console.log('\nTest fibonacci:');
console.log(testSequence(() => fibonacci())); // [0, 1, 1, 2, 3]

console.log('\nTest take:');
console.log(testSequence(() => take(fibonacci(), 8), 8)); // [0, 1, 1, 2, 3, 5, 8, 13]

console.log('\nTest cycle:');
console.log(testSequence(() => cycle([1, 2, 3]))); // [1, 2, 3, 1, 2]

console.log('\nTest zip:');
console.log(testSequence(() => zip([1, 2, 3], ['a', 'b', 'c'], [true, false]))); // [[1, 'a', true], [2, 'b', false]]

/**
 * Esercizio 1.6 (Bonus): Implementa un generatore flatten
 * 
 * Crea un generatore che appiattisce un array annidato a qualsiasi profondità.
 * 
 * @param {Array} nestedArray - L'array annidato da appiattire
 * @yields {*} - Gli elementi dell'array appiattito
 */
function* flatten(nestedArray) {
  // Implementa la funzione
}

console.log('\nTest flatten:');
console.log(testSequence(() => flatten([1, [2, [3, 4]], 5, [[6]]]))); // [1, 2, 3, 4, 5, 6]

module.exports = {
  range,
  fibonacci,
  take,
  cycle,
  zip,
  flatten,
};
