/**
 * Esercizio 1: Funzioni Ricorsive Base
 * 
 * Implementa le funzioni ricorsive richieste seguendo le istruzioni.
 * Per ogni funzione, scrivi prima la tua soluzione e poi verifica
 * se funziona con i test forniti.
 */

/**
 * Esercizio 1.1: Somma dei primi N numeri naturali
 * 
 * Implementa una funzione ricorsiva che calcoli la somma dei primi n numeri naturali.
 * Esempio: sumN(5) deve restituire 15 (1 + 2 + 3 + 4 + 5)
 * 
 * @param {number} n - Il numero di elementi da sommare
 * @returns {number} - La somma dei primi n numeri naturali
 */
function sumN(n) {
  // Implementa la funzione
}

/**
 * Esercizio 1.2: Potenza
 * 
 * Implementa una funzione ricorsiva che calcoli base elevato a exponent.
 * Esempio: power(2, 3) deve restituire 8 (2^3)
 * 
 * @param {number} base - La base
 * @param {number} exponent - L'esponente (assumere che sia un intero non negativo)
 * @returns {number} - base elevato a exponent
 */
function power(base, exponent) {
  // Implementa la funzione
}

/**
 * Esercizio 1.3: Conta occorrenze
 * 
 * Implementa una funzione ricorsiva che conti quante volte un elemento
 * appare in un array.
 * Esempio: countOccurrences([1, 2, 3, 2, 4, 2], 2) deve restituire 3
 * 
 * @param {Array} arr - L'array da esaminare
 * @param {*} element - L'elemento da cercare
 * @returns {number} - Il numero di occorrenze dell'elemento nell'array
 */
function countOccurrences(arr, element) {
  // Implementa la funzione
}

/**
 * Esercizio 1.4: Prodotto degli elementi di un array
 * 
 * Implementa una funzione ricorsiva che calcoli il prodotto di tutti gli elementi
 * di un array di numeri.
 * Esempio: productArray([1, 2, 3, 4]) deve restituire 24 (1 * 2 * 3 * 4)
 * 
 * @param {number[]} arr - L'array di numeri
 * @returns {number} - Il prodotto degli elementi
 */
function productArray(arr) {
  // Implementa la funzione
}

/**
 * Esercizio 1.5: Verifica se una parola è un palindromo
 * 
 * Implementa una funzione ricorsiva che verifichi se una parola è un palindromo.
 * Un palindromo è una parola che si legge allo stesso modo da sinistra a destra e da destra a sinistra.
 * Esempio: isPalindrome("radar") deve restituire true, isPalindrome("hello") deve restituire false
 * 
 * @param {string} str - La stringa da verificare
 * @returns {boolean} - true se la stringa è un palindromo, false altrimenti
 */
function isPalindrome(str) {
  // Implementa la funzione
}

/**
 * Esercizio 1.6: Conversione da decimale a binario
 * 
 * Implementa una funzione ricorsiva che converta un numero decimale in una stringa binaria.
 * Esempio: decimalToBinary(13) deve restituire "1101"
 * 
 * @param {number} n - Il numero decimale da convertire
 * @returns {string} - La rappresentazione binaria come stringa
 */
function decimalToBinary(n) {
  // Implementa la funzione
}

/**
 * Esercizio 1.7: Flatten di un array annidato
 * 
 * Implementa una funzione ricorsiva che appiattisce un array annidato.
 * Esempio: flatten([1, [2, [3, 4], 5]]) deve restituire [1, 2, 3, 4, 5]
 * 
 * @param {Array} arr - L'array annidato da appiattire
 * @returns {Array} - L'array appiattito
 */
function flatten(arr) {
  // Implementa la funzione
}

/**
 * Esercizio 1.8: Calcolo del massimo comun divisore (GCD)
 * 
 * Implementa una funzione ricorsiva che calcoli il massimo comun divisore di due numeri
 * utilizzando l'algoritmo di Euclide.
 * Esempio: gcd(48, 18) deve restituire 6
 * 
 * @param {number} a - Primo numero
 * @param {number} b - Secondo numero
 * @returns {number} - Il massimo comun divisore
 */
function gcd(a, b) {
  // Implementa la funzione
}

// Test delle funzioni
function runTests() {
  console.log("=== Test esercizio 1.1: Somma dei primi N numeri naturali ===");
  console.log(`sumN(5) => ${sumN(5)} (atteso: 15)`);
  console.log(`sumN(10) => ${sumN(10)} (atteso: 55)`);
  console.log();

  console.log("=== Test esercizio 1.2: Potenza ===");
  console.log(`power(2, 3) => ${power(2, 3)} (atteso: 8)`);
  console.log(`power(5, 0) => ${power(5, 0)} (atteso: 1)`);
  console.log(`power(3, 4) => ${power(3, 4)} (atteso: 81)`);
  console.log();

  console.log("=== Test esercizio 1.3: Conta occorrenze ===");
  console.log(`countOccurrences([1, 2, 3, 2, 4, 2], 2) => ${countOccurrences([1, 2, 3, 2, 4, 2], 2)} (atteso: 3)`);
  console.log(`countOccurrences(['a', 'b', 'c', 'a'], 'a') => ${countOccurrences(['a', 'b', 'c', 'a'], 'a')} (atteso: 2)`);
  console.log(`countOccurrences([5, 6, 7], 8) => ${countOccurrences([5, 6, 7], 8)} (atteso: 0)`);
  console.log();

  console.log("=== Test esercizio 1.4: Prodotto degli elementi di un array ===");
  console.log(`productArray([1, 2, 3, 4]) => ${productArray([1, 2, 3, 4])} (atteso: 24)`);
  console.log(`productArray([]) => ${productArray([])} (atteso: 1)`);
  console.log(`productArray([5]) => ${productArray([5])} (atteso: 5)`);
  console.log();

  console.log("=== Test esercizio 1.5: Verifica se una parola è un palindromo ===");
  console.log(`isPalindrome("radar") => ${isPalindrome("radar")} (atteso: true)`);
  console.log(`isPalindrome("hello") => ${isPalindrome("hello")} (atteso: false)`);
  console.log(`isPalindrome("a") => ${isPalindrome("a")} (atteso: true)`);
  console.log(`isPalindrome("") => ${isPalindrome("")} (atteso: true)`);
  console.log();

  console.log("=== Test esercizio 1.6: Conversione da decimale a binario ===");
  console.log(`decimalToBinary(13) => ${decimalToBinary(13)} (atteso: "1101")`);
  console.log(`decimalToBinary(0) => ${decimalToBinary(0)} (atteso: "0")`);
  console.log(`decimalToBinary(1) => ${decimalToBinary(1)} (atteso: "1")`);
  console.log(`decimalToBinary(42) => ${decimalToBinary(42)} (atteso: "101010")`);
  console.log();

  console.log("=== Test esercizio 1.7: Flatten di un array annidato ===");
  console.log(`flatten([1, [2, [3, 4], 5]]) => ${JSON.stringify(flatten([1, [2, [3, 4], 5]]))} (atteso: [1, 2, 3, 4, 5])`);
  console.log(`flatten([]) => ${JSON.stringify(flatten([]))} (atteso: [])`);
  console.log(`flatten([1, 2, 3]) => ${JSON.stringify(flatten([1, 2, 3]))} (atteso: [1, 2, 3])`);
  console.log(`flatten([1, [2], [3, [4, [5]]]]) => ${JSON.stringify(flatten([1, [2], [3, [4, [5]]]]))} (atteso: [1, 2, 3, 4, 5])`);
  console.log();

  console.log("=== Test esercizio 1.8: Calcolo del massimo comun divisore (GCD) ===");
  console.log(`gcd(48, 18) => ${gcd(48, 18)} (atteso: 6)`);
  console.log(`gcd(17, 5) => ${gcd(17, 5)} (atteso: 1)`);
  console.log(`gcd(0, 5) => ${gcd(0, 5)} (atteso: 5)`);
  console.log(`gcd(48, 0) => ${gcd(48, 0)} (atteso: 48)`);
}

// Esegui i test
runTests();
