/**
 * Ottimizzazione della Ricorsione
 * 
 * Questo file esplora tecniche per ottimizzare funzioni ricorsive,
 * riducendo il consumo di memoria e migliorando le performance.
 */

// --------------------------------------------------------
// PARTE 1: Memoizzazione
// --------------------------------------------------------

console.log('===== MEMOIZZAZIONE =====');

// Fibonacci senza ottimizzazione
function fibNaive(n) {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

// Fibonacci con memoizzazione
function fibMemoized() {
  const memo = {};
  
  return function fib(n) {
    if (n <= 1) return n;
    
    if (memo[n] !== undefined) {
      return memo[n];
    }
    
    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
  };
}

// Helper generico per memoizzare qualsiasi funzione
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Applicazione della memoizzazione generica
const fibonacci = memoize(n => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

// Test di performance
console.time('Fibonacci naive (n=30)');
console.log('Fibonacci naive (30):', fibNaive(30));
console.timeEnd('Fibonacci naive (n=30)');

const fibMemo = fibMemoized();
console.time('Fibonacci memoized (n=30)');
console.log('Fibonacci memoized (30):', fibMemo(30));
console.timeEnd('Fibonacci memoized (n=30)');

console.time('Fibonacci memoize generic (n=30)');
console.log('Fibonacci memoize generic (30):', fibonacci(30));
console.timeEnd('Fibonacci memoize generic (n=30)');

// Test con valori più grandi possibili solo con memoizzazione
console.time('Fibonacci memoized (n=100)');
console.log('Fibonacci memoized (100):', fibMemo(100));
console.timeEnd('Fibonacci memoized (n=100)');

// --------------------------------------------------------
// PARTE 2: Tail Call Optimization (TCO)
// --------------------------------------------------------

console.log('\n===== TAIL CALL OPTIMIZATION =====');

// Fattoriale non ottimizzato (non tail-recursive)
function factorialNonTCO(n) {
  if (n <= 1) return 1;
  return n * factorialNonTCO(n - 1); // Non è tail-recursive
}

// Fattoriale con tail call optimization
function factorialTCO(n, accumulator = 1) {
  if (n <= 1) return accumulator;
  return factorialTCO(n - 1, n * accumulator); // È tail-recursive
}

// Fibonacci non ottimizzato (non tail-recursive)
function fibonacciNonTCO(n) {
  if (n <= 1) return n;
  return fibonacciNonTCO(n - 1) + fibonacciNonTCO(n - 2); // Non è tail-recursive
}

// Fibonacci con tail call optimization
function fibonacciTCO(n, a = 0, b = 1) {
  if (n === 0) return a;
  return fibonacciTCO(n - 1, b, a + b); // È tail-recursive
}

// Esempi di utilizzo
console.log('Factorial non-TCO (5):', factorialNonTCO(5));
console.log('Factorial TCO (5):', factorialTCO(5));
console.log('Fibonacci non-TCO (10):', fibonacciNonTCO(10));
console.log('Fibonacci TCO (10):', fibonacciTCO(10));

// Test limite con TCO (richiede un engine con TCO supportato, come Safari)
try {
  // Questo potrebbe causare stack overflow su engine senza TCO
  console.log('Factorial TCO (1000):', factorialTCO(1000));
} catch (e) {
  console.log('Stack overflow con Factorial TCO (1000). TCO non supportato in questo engine.');
}

// --------------------------------------------------------
// PARTE 3: Trampolino (Trampoline)
// --------------------------------------------------------

console.log('\n===== TRAMPOLINO =====');

/**
 * Implementazione del pattern "trampolino" che permette di
 * eseguire funzioni ricorsive profonde senza rischio di stack overflow.
 */
function trampoline(fn) {
  return function(...args) {
    let result = fn(...args);
    
    // Continua a chiamare il risultato finché è una funzione
    while (typeof result === 'function') {
      result = result();
    }
    
    return result;
  };
}

// Fattoriale trampolinato
function factorialTrampolined(n, acc = 1) {
  return n <= 1
    ? acc
    : () => factorialTrampolined(n - 1, n * acc);
}

const factorial = trampoline(factorialTrampolined);

// Fibonacci trampolinato
function fibonacciTrampolined(n, a = 0, b = 1) {
  return n === 0
    ? a
    : () => fibonacciTrampolined(n - 1, b, a + b);
}

const fib = trampoline(fibonacciTrampolined);

// Test con valori grandi che causerebbero stack overflow con ricorsione normale
console.log('Factorial trampolined (1000):', factorial(1000));
console.log('Fibonacci trampolined (100):', fib(100));

// --------------------------------------------------------
// PARTE 4: Ottimizzazione con Strutture Dati Ausiliari
// --------------------------------------------------------

console.log('\n===== STRUTTURE DATI AUSILIARI =====');

// Reverse di un array: versione ricorsiva non ottimizzata
function reverseArrayNaive(arr) {
  if (arr.length <= 1) return arr;
  return [arr[arr.length - 1], ...reverseArrayNaive(arr.slice(0, -1))];
}

// Reverse di un array: versione ottimizzata con accumulatore
function reverseArrayOptimized(arr, result = []) {
  if (arr.length === 0) return result;
  
  const [head, ...tail] = arr;
  return reverseArrayOptimized(tail, [head, ...result]);
}

// Reverse di un array: versione ottimizzata con indici
function reverseArrayWithIndices(arr, start = 0, end = arr.length - 1) {
  // Crea una copia dell'array per non modificare l'originale
  const result = [...arr];
  
  function reverseHelper(s, e) {
    if (s >= e) return result;
    
    // Scambia gli elementi
    [result[s], result[e]] = [result[e], result[s]];
    
    // Chiamata ricorsiva
    return reverseHelper(s + 1, e - 1);
  }
  
  return reverseHelper(start, end);
}

// Test su array piccoli
const smallArray = [1, 2, 3, 4, 5];
console.log('Reverse naive (small):', reverseArrayNaive(smallArray));
console.log('Reverse optimized (small):', reverseArrayOptimized(smallArray));
console.log('Reverse with indices (small):', reverseArrayWithIndices(smallArray));

// Test su array più grandi
const largeArray = Array.from({ length: 1000 }, (_, i) => i);
console.time('Reverse naive (1000 elements)');
try {
  reverseArrayNaive(largeArray);
} catch (e) {
  console.log('Stack overflow con reverse naive.');
}
console.timeEnd('Reverse naive (1000 elements)');

console.time('Reverse optimized (1000 elements)');
reverseArrayOptimized(largeArray);
console.timeEnd('Reverse optimized (1000 elements)');

console.time('Reverse with indices (1000 elements)');
reverseArrayWithIndices(largeArray);
console.timeEnd('Reverse with indices (1000 elements)');

// --------------------------------------------------------
// PARTE 5: Ricorsione Parallela e Asincrona
// --------------------------------------------------------

console.log('\n===== RICORSIONE PARALLELA E ASINCRONA =====');

// Ricorsione asincrona con Promise
async function asyncFactorial(n) {
  if (n <= 1) {
    return 1;
  }
  
  // Simula un'operazione asincrona
  await new Promise(resolve => setTimeout(resolve, 10));
  
  // Chiamata ricorsiva asincrona
  const subResult = await asyncFactorial(n - 1);
  return n * subResult;
}

// Ricorsione con Promise.all per operazioni parallele
async function sumArrayAsync(arr) {
  // Caso base
  if (arr.length === 0) {
    return 0;
  }
  
  if (arr.length === 1) {
    return arr[0];
  }
  
  // Dividi l'array in due metà
  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);
  
  // Calcola la somma delle due metà in parallelo
  const [leftSum, rightSum] = await Promise.all([
    sumArrayAsync(left),
    sumArrayAsync(right)
  ]);
  
  // Combina i risultati
  return leftSum + rightSum;
}

// Test di ricorsione asincrona
console.log('Avvio calcolo asincrono...');

asyncFactorial(5)
  .then(result => console.log('Factorial asincrono (5):', result))
  .catch(err => console.error('Errore:', err));

sumArrayAsync([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .then(result => console.log('Somma array asincrona:', result))
  .catch(err => console.error('Errore:', err));
