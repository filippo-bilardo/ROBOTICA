/**
 * Esempi Base di Ricorsione
 * 
 * Questo file contiene implementazioni di algoritmi ricorsivi fondamentali
 * per illustrare i concetti base della ricorsione.
 */

// --------------------------------------------------------
// PARTE 1: Fattoriale
// --------------------------------------------------------

console.log('===== FATTORIALE =====');

// Implementazione ricorsiva del fattoriale
function factorial(n) {
  // Caso base
  if (n <= 1) {
    return 1;
  }
  
  // Chiamata ricorsiva
  return n * factorial(n - 1);
}

// Esempi di utilizzo
console.log('factorial(0):', factorial(0));   // 1
console.log('factorial(1):', factorial(1));   // 1
console.log('factorial(5):', factorial(5));   // 120
console.log('factorial(10):', factorial(10)); // 3628800

// --------------------------------------------------------
// PARTE 2: Sequenza di Fibonacci
// --------------------------------------------------------

console.log('\n===== FIBONACCI =====');

// Implementazione ricorsiva base (inefficiente)
function fibonacci(n) {
  // Casi base
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  // Chiamata ricorsiva
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Esempi di utilizzo
console.log('fibonacci(0):', fibonacci(0));   // 0
console.log('fibonacci(1):', fibonacci(1));   // 1
console.log('fibonacci(7):', fibonacci(7));   // 13
console.log('fibonacci(10):', fibonacci(10)); // 55

// Fibonacci con memoizzazione (più efficiente)
function fibonacciMemoized() {
  const memo = {};
  
  function fib(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    // Controlla se il valore è già nella cache
    if (memo[n] !== undefined) {
      return memo[n];
    }
    
    // Calcolo ricorsivo e memorizzazione
    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
  }
  
  return fib;
}

const fastFib = fibonacciMemoized();
console.log('fibonacciMemoized(30):', fastFib(30)); // 832040 (molto più veloce)

// --------------------------------------------------------
// PARTE 3: Somma di Array
// --------------------------------------------------------

console.log('\n===== SOMMA DI ARRAY =====');

// Implementazione ricorsiva della somma di un array
function sum(arr) {
  // Caso base: array vuoto
  if (arr.length === 0) {
    return 0;
  }
  
  // Head: primo elemento
  const head = arr[0];
  // Tail: resto dell'array
  const tail = arr.slice(1);
  
  // Chiamata ricorsiva
  return head + sum(tail);
}

console.log('sum([]):', sum([]));                 // 0
console.log('sum([1]):', sum([1]));               // 1
console.log('sum([1, 2, 3, 4, 5]):', sum([1, 2, 3, 4, 5])); // 15

// Implementazione ricorsiva ottimizzata con indici
function sumOptimized(arr, index = 0) {
  // Caso base: abbiamo raggiunto la fine dell'array
  if (index >= arr.length) {
    return 0;
  }
  
  // Chiamata ricorsiva
  return arr[index] + sumOptimized(arr, index + 1);
}

console.log('sumOptimized([1, 2, 3, 4, 5]):', sumOptimized([1, 2, 3, 4, 5])); // 15

// --------------------------------------------------------
// PARTE 4: Potenza
// --------------------------------------------------------

console.log('\n===== CALCOLO POTENZA =====');

// Implementazione ricorsiva del calcolo della potenza
function power(base, exponent) {
  // Caso base
  if (exponent === 0) {
    return 1;
  }
  
  // Chiamata ricorsiva
  return base * power(base, exponent - 1);
}

console.log('power(2, 0):', power(2, 0));   // 1
console.log('power(2, 3):', power(2, 3));   // 8
console.log('power(5, 2):', power(5, 2));   // 25

// Ottimizzazione: potenza con approccio divide et impera
function fastPower(base, exponent) {
  // Casi base
  if (exponent === 0) return 1;
  if (exponent === 1) return base;
  
  // Se l'esponente è pari, calcoliamo (base^(exponent/2))^2
  if (exponent % 2 === 0) {
    const half = fastPower(base, exponent / 2);
    return half * half;
  }
  
  // Se dispari, calcoliamo base * (base^(exponent-1))
  return base * fastPower(base, exponent - 1);
}

console.log('fastPower(2, 10):', fastPower(2, 10)); // 1024
console.log('fastPower(3, 5):', fastPower(3, 5));   // 243

// --------------------------------------------------------
// PARTE 5: Inversione di Stringhe
// --------------------------------------------------------

console.log('\n===== INVERSIONE DI STRINGHE =====');

// Implementazione ricorsiva dell'inversione di una stringa
function reverseString(str) {
  // Caso base: stringa vuota o con un solo carattere
  if (str.length <= 1) {
    return str;
  }
  
  // Prendiamo il primo carattere e lo mettiamo alla fine
  // della versione invertita del resto della stringa
  return reverseString(str.slice(1)) + str[0];
}

console.log('reverseString(""):', reverseString(""));         // ""
console.log('reverseString("a"):', reverseString("a"));       // "a"
console.log('reverseString("hello"):', reverseString("hello")); // "olleh"
console.log('reverseString("javascript"):', reverseString("javascript")); // "tpircsavaj"

// --------------------------------------------------------
// PARTE 6: Palindromo
// --------------------------------------------------------

console.log('\n===== CONTROLLO PALINDROMO =====');

// Implementazione ricorsiva del controllo palindromo
function isPalindrome(str) {
  // Rimuoviamo spazi e caratteri non alfanumerici, convertiamo in minuscolo
  str = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Caso base: stringa vuota o con un solo carattere
  if (str.length <= 1) {
    return true;
  }
  
  // Controlla se il primo e l'ultimo carattere sono uguali
  if (str[0] !== str[str.length - 1]) {
    return false;
  }
  
  // Chiamata ricorsiva sul resto della stringa
  return isPalindrome(str.slice(1, -1));
}

console.log('isPalindrome(""):', isPalindrome(""));                     // true
console.log('isPalindrome("a"):', isPalindrome("a"));                   // true
console.log('isPalindrome("level"):', isPalindrome("level"));           // true
console.log('isPalindrome("A man, a plan, a canal: Panama"):', 
           isPalindrome("A man, a plan, a canal: Panama"));             // true
console.log('isPalindrome("hello"):', isPalindrome("hello"));           // false
