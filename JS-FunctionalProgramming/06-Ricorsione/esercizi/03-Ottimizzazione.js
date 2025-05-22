/**
 * Esercizio 3: Ottimizzazione di Funzioni Ricorsive
 * 
 * In questo esercizio, ottimizzerai funzioni ricorsive utilizzando tecniche
 * come memoizzazione, tail call optimization, e altre strategie.
 */

/**
 * Esercizio 3.1: Memoizzazione di Fibonacci
 * 
 * La funzione fibonacciNaive è un'implementazione inefficiente della sequenza di Fibonacci.
 * Implementa fibonacciMemo che utilizza la memoizzazione per ottimizzarla.
 * 
 * @param {number} n - Il numero di Fibonacci da calcolare
 * @returns {number} - L'n-esimo numero della sequenza di Fibonacci
 */
function fibonacciNaive(n) {
  if (n <= 1) return n;
  return fibonacciNaive(n - 1) + fibonacciNaive(n - 2);
}

function fibonacciMemo(n) {
  // Implementa una versione memoizzata della funzione
}

/**
 * Esercizio 3.2: Tail Call Optimization di Fattoriale
 * 
 * Implementa una versione ottimizzata per tail call del fattoriale.
 * 
 * @param {number} n - Il numero di cui calcolare il fattoriale
 * @returns {number} - Il fattoriale di n
 */
function factorialNaive(n) {
  if (n <= 1) return 1;
  return n * factorialNaive(n - 1);
}

function factorialTCO(n, acc = 1) {
  // Implementa una versione ottimizzata per tail call
}

/**
 * Esercizio 3.3: Implementazione di un Helper Generico per Memoizzazione
 * 
 * Crea una funzione helper 'memoize' che accetta una funzione come parametro
 * e restituisce una versione memoizzata di essa.
 * 
 * @param {Function} fn - La funzione da memoizzare
 * @returns {Function} - La versione memoizzata della funzione
 */
function memoize(fn) {
  // Implementa la funzione di memoizzazione generica
}

/**
 * Esercizio 3.4: Implementazione del Trampolino
 * 
 * Il trampolino (trampoline) è un pattern che permette di eseguire
 * ricorsioni arbitrariamente profonde senza rischio di stack overflow.
 * Implementa la funzione 'trampoline'.
 * 
 * @param {Function} fn - Una funzione che può restituire una funzione o un valore
 * @returns {Function} - Una funzione "trampolino" che esegue fn senza stack overflow
 */
function trampoline(fn) {
  // Implementa il pattern trampolino
}

/**
 * Esercizio 3.5: Conversione di una Funzione Ricorsiva a Trampolino
 * 
 * Converti la funzione sumArray in una versione che utilizza il trampolino.
 * Utilizza la funzione trampoline implementata nell'esercizio precedente.
 */
function sumArray(arr) {
  if (arr.length === 0) return 0;
  return arr[0] + sumArray(arr.slice(1));
}

// Versione trampolinata della funzione sumArray
function sumArrayTrampoline(arr) {
  // Implementa una versione che utilizza il trampolino
}

/**
 * Esercizio 3.6: Ottimizzazione dell'attraversamento di un albero con Divide et Impera
 * 
 * Ottimizza la funzione treeSum applicando l'approccio divide et impera,
 * che è più efficiente per alberi grandi e bilanciati.
 */
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

// Versione naive
function treeSumNaive(root) {
  if (!root) return 0;
  
  // Attraversa tutto l'albero in un unico processo
  let sum = 0;
  
  function traverse(node) {
    if (!node) return;
    sum += node.value;
    traverse(node.left);
    traverse(node.right);
  }
  
  traverse(root);
  return sum;
}

// Versione ottimizzata con divide et impera
function treeSumOptimized(root) {
  // Implementa l'approccio divide et impera
}

/**
 * Esercizio 3.7: Ricorsione di coda per attraversamento BST
 * 
 * Implementa una versione tail-recursive dell'attraversamento in ordine
 * di un albero binario di ricerca (BST) che accumuli il risultato.
 * 
 * @param {TreeNode} root - La radice dell'albero BST
 * @returns {number[]} - I valori dell'albero in ordine crescente
 */
function inOrderTraversalTCO(root) {
  // Implementa la funzione con ricorsione in coda
}

/**
 * Esercizio 3.8: Implementazione di quicksort ottimizzato
 * 
 * Implementa una versione ottimizzata di quicksort che:
 * 1. Usa insertion sort per array piccoli
 * 2. Sceglie un pivot migliore (ad esempio la mediana di tre elementi)
 * 3. Evita la ricorsione per il partizionamento
 * 
 * @param {number[]} arr - L'array da ordinare
 * @returns {number[]} - L'array ordinato
 */
function quicksortOptimized(arr) {
  // Implementa quicksort ottimizzato
}

// Helper di insertion sort per l'esercizio 3.8
function insertionSort(arr, left, right) {
  for (let i = left + 1; i <= right; i++) {
    const temp = arr[i];
    let j = i - 1;
    while (j >= left && arr[j] > temp) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = temp;
  }
  return arr;
}

// Test delle funzioni
function runTests() {
  // Per benchmark
  function benchmark(fn, ...args) {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    return { result, time: end - start };
  }

  // Test per esercizio 3.1
  console.log("=== Test esercizio 3.1: Memoizzazione di Fibonacci ===");
  const n = 35;
  console.log(`Calcolo di fibonacci(${n}):`);
  
  const naiveBenchmark = benchmark(fibonacciNaive, n);
  console.log(`- Versione naive: ${naiveBenchmark.result} (${naiveBenchmark.time.toFixed(2)} ms)`);
  
  const memoBenchmark = benchmark(fibonacciMemo, n);
  console.log(`- Versione memoizzata: ${memoBenchmark.result} (${memoBenchmark.time.toFixed(2)} ms)`);
  
  console.log(`Speedup: ${(naiveBenchmark.time / memoBenchmark.time).toFixed(2)}x`);
  console.log();

  // Test per esercizio 3.2
  console.log("=== Test esercizio 3.2: Tail Call Optimization di Fattoriale ===");
  const factN = 10;
  console.log(`factorialNaive(${factN}): ${factorialNaive(factN)}`);
  console.log(`factorialTCO(${factN}): ${factorialTCO(factN)}`);
  
  try {
    const largeN = 10000; // Un valore alto che probabilmente causerebbe stack overflow in versione naive
    console.log(`factorialTCO(${largeN}) completa senza stack overflow: ${factorialTCO(largeN) !== undefined}`);
  } catch (e) {
    console.log(`factorialTCO ha generato un errore con input grande: ${e.message}`);
  }
  console.log();

  // Test per esercizio 3.3
  console.log("=== Test esercizio 3.3: Helper Generico per Memoizzazione ===");
  
  const expensiveFunction = (n) => {
    console.log(`Calcolo costoso per ${n}`);
    return n * 2;
  };
  
  const memoExpensive = memoize(expensiveFunction);
  
  console.log("Prima chiamata con input 5:");
  console.log(`Risultato: ${memoExpensive(5)}`);
  
  console.log("Seconda chiamata con stesso input 5 (dovrebbe usare la cache):");
  console.log(`Risultato: ${memoExpensive(5)}`);
  
  console.log("Chiamata con input diverso 10:");
  console.log(`Risultato: ${memoExpensive(10)}`);
  console.log();

  // Test per esercizio 3.4 e 3.5
  console.log("=== Test esercizi 3.4 e 3.5: Trampolino ===");
  
  const largeArray = Array.from({ length: 10000 }, (_, i) => i);
  
  try {
    // Questa chiamata potrebbe causare stack overflow
    console.log(`sumArray su array di lunghezza ${largeArray.length}: ${sumArray(largeArray.slice(0, 5))}...`);
    console.log("(L'array completo probabilmente causerebbe stack overflow)");
  } catch (e) {
    console.log(`sumArray ha generato un errore: ${e.message}`);
  }
  
  try {
    console.log(`sumArrayTrampoline su array di lunghezza ${largeArray.length}: ${sumArrayTrampoline(largeArray)}`);
    console.log("Completato con successo usando il trampolino");
  } catch (e) {
    console.log(`sumArrayTrampoline ha generato un errore: ${e.message}`);
  }
  console.log();

  // Test per esercizio 3.6
  console.log("=== Test esercizio 3.6: Ottimizzazione dell'attraversamento di un albero ===");
  
  function createBalancedTree(depth) {
    if (depth === 0) return null;
    
    const node = new TreeNode(1);
    node.left = createBalancedTree(depth - 1);
    node.right = createBalancedTree(depth - 1);
    
    return node;
  }
  
  const balancedTree = createBalancedTree(10); // 2^10 - 1 nodi
  
  console.log("Somma dell'albero bilanciato:");
  
  const naiveTreeBenchmark = benchmark(treeSumNaive, balancedTree);
  console.log(`- Versione naive: ${naiveTreeBenchmark.result} (${naiveTreeBenchmark.time.toFixed(2)} ms)`);
  
  const optimizedTreeBenchmark = benchmark(treeSumOptimized, balancedTree);
  console.log(`- Versione optimized: ${optimizedTreeBenchmark.result} (${optimizedTreeBenchmark.time.toFixed(2)} ms)`);
  
  console.log(`Speedup: ${(naiveTreeBenchmark.time / optimizedTreeBenchmark.time).toFixed(2)}x`);
  console.log();

  // Test per esercizio 3.7
  console.log("=== Test esercizio 3.7: Ricorsione di coda per attraversamento BST ===");
  
  function createBST() {
    const root = new TreeNode(8);
    root.left = new TreeNode(3);
    root.right = new TreeNode(10);
    root.left.left = new TreeNode(1);
    root.left.right = new TreeNode(6);
    root.left.right.left = new TreeNode(4);
    root.left.right.right = new TreeNode(7);
    root.right.right = new TreeNode(14);
    root.right.right.left = new TreeNode(13);
    return root;
  }
  
  const bst = createBST();
  
  console.log("In-order traversal utilizzando TCO:");
  console.log(inOrderTraversalTCO(bst).join(', '));
  console.log("Risultato atteso: 1, 3, 4, 6, 7, 8, 10, 13, 14");
  console.log();

  // Test per esercizio 3.8
  console.log("=== Test esercizio 3.8: Quicksort ottimizzato ===");
  
  function createRandomArray(size) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
  }
  
  const arrayToSort = createRandomArray(10000);
  const arrayToSortCopy = [...arrayToSort];
  
  console.log("Ordinamento di un array di 10000 elementi:");
  
  console.time("Standard sort");
  arrayToSortCopy.sort((a, b) => a - b);
  console.timeEnd("Standard sort");
  
  console.time("Quicksort ottimizzato");
  quicksortOptimized(arrayToSort);
  console.timeEnd("Quicksort ottimizzato");
  
  // Verifica che l'array sia ordinato correttamente
  const isCorrectlySorted = arrayToSort.every((val, i) => i === 0 || val >= arrayToSort[i - 1]);
  console.log(`Array ordinato correttamente: ${isCorrectlySorted}`);
}

// Esegui i test
runTests();
