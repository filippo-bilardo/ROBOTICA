# Pattern Ricorsivi Comuni

La ricorsione è particolarmente adatta per risolvere certi tipi di problemi. In questo documento esploreremo alcuni pattern ricorsivi comuni che rappresentano soluzioni eleganti a problemi frequenti.

## 1. Pattern Lineare (Head-Tail)

Il pattern più comune è la ricorsione lineare, dove una funzione si divide in:
- Una operazione sulla "testa" (primo elemento)
- Una chiamata ricorsiva sulla "coda" (resto degli elementi)

Questo pattern è particolarmente utile quando si lavora con strutture di dati lineari come array e liste.

### Esempio: Somma degli elementi di un array

```javascript
function sum(arr) {
  // Caso base: array vuoto
  if (arr.length === 0) {
    return 0;
  }
  
  // Head: primo elemento
  const head = arr[0];
  // Tail: resto dell'array
  const tail = arr.slice(1);
  
  // Operazione sulla testa + chiamata ricorsiva sulla coda
  return head + sum(tail);
}

console.log(sum([1, 2, 3, 4, 5])); // 15
```

## 2. Pattern Divide et Impera

Questo pattern divide il problema in sottoproblemi più piccoli, risolve ciascun sottoproblema ricorsivamente e poi combina i risultati. È efficace per problemi che possono essere suddivisi in parti simili.

### Esempio: Merge Sort

```javascript
function mergeSort(arr) {
  // Caso base: array con 0 o 1 elemento è già ordinato
  if (arr.length <= 1) {
    return arr;
  }
  
  // Divide: trova il punto medio e dividi l'array
  const middle = Math.floor(arr.length / 2);
  const left = arr.slice(0, middle);
  const right = arr.slice(middle);
  
  // Impera: ordina ricorsivamente le due metà
  const sortedLeft = mergeSort(left);
  const sortedRight = mergeSort(right);
  
  // Combina: unisci le due metà ordinate
  return merge(sortedLeft, sortedRight);
}

function merge(left, right) {
  let result = [];
  let leftIndex = 0;
  let rightIndex = 0;
  
  // Confronta elementi dalle due metà e inseriscili in ordine
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] < right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }
  
  // Aggiungi gli elementi rimanenti
  return result.concat(
    left.slice(leftIndex),
    right.slice(rightIndex)
  );
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10])); // [3, 9, 10, 27, 38, 43, 82]
```

## 3. Pattern a Backtracking

Il backtracking è un algoritmo che considera tutte le possibili soluzioni in modo sistematico, costruendo candidati e abbandonandoli quando determinano soluzioni non valide.

### Esempio: Generare tutte le permutazioni di una stringa

```javascript
function permutations(str) {
  // Caso base: stringa vuota o con un solo carattere
  if (str.length <= 1) {
    return [str];
  }
  
  const result = [];
  
  // Per ogni carattere nella stringa
  for (let i = 0; i < str.length; i++) {
    // Prendi il carattere corrente
    const current = str[i];
    
    // Ottieni il resto della stringa rimuovendo il carattere corrente
    const remaining = str.slice(0, i) + str.slice(i + 1);
    
    // Genera ricorsivamente tutte le permutazioni del resto
    const permsOfRemaining = permutations(remaining);
    
    // Aggiungi il carattere corrente a ogni permutazione e salva il risultato
    for (const perm of permsOfRemaining) {
      result.push(current + perm);
    }
  }
  
  return result;
}

console.log(permutations("abc")); // ["abc", "acb", "bac", "bca", "cab", "cba"]
```

## 4. Pattern di Attraversamento Ricorsivo

Questo pattern è utilizzato per attraversare strutture dati complesse come alberi e grafi.

### Esempio: Attraversamento di un albero binario

```javascript
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

// Attraversamento in ordine (inorder traversal)
function inorderTraversal(node, result = []) {
  // Caso base: nodo nullo
  if (node === null) {
    return result;
  }
  
  // Visita il sottoalbero sinistro
  inorderTraversal(node.left, result);
  
  // Visita il nodo corrente
  result.push(node.value);
  
  // Visita il sottoalbero destro
  inorderTraversal(node.right, result);
  
  return result;
}

// Esempio di utilizzo
const root = new TreeNode(4);
root.left = new TreeNode(2);
root.right = new TreeNode(6);
root.left.left = new TreeNode(1);
root.left.right = new TreeNode(3);
root.right.left = new TreeNode(5);
root.right.right = new TreeNode(7);

console.log(inorderTraversal(root)); // [1, 2, 3, 4, 5, 6, 7]
```

## 5. Pattern di Accumulo

Questo pattern utilizza un parametro aggiuntivo per accumulare i risultati durante le chiamate ricorsive.

### Esempio: Calcolare la somma dei numeri con accumulatore

```javascript
function sumWithAccumulator(arr, index = 0, accumulator = 0) {
  // Caso base: abbiamo processato tutti gli elementi
  if (index >= arr.length) {
    return accumulator;
  }
  
  // Aggiungiamo l'elemento corrente all'accumulatore
  const newAccumulator = accumulator + arr[index];
  
  // Chiamata ricorsiva con l'indice incrementato
  return sumWithAccumulator(arr, index + 1, newAccumulator);
}

console.log(sumWithAccumulator([1, 2, 3, 4, 5])); // 15
```

## 6. Pattern di Memoizzazione Ricorsiva

Questo pattern implementa la memoizzazione per evitare calcoli ripetuti durante la ricorsione.

### Esempio: Sequenza di Fibonacci con memoizzazione

```javascript
function fibonacciMemoized() {
  // Cache per memorizzare i risultati già calcolati
  const memo = {};
  
  // Funzione interna ricorsiva
  function fib(n) {
    // Caso base
    if (n <= 1) {
      return n;
    }
    
    // Controllo se il valore è già nella cache
    if (memo[n] !== undefined) {
      return memo[n];
    }
    
    // Calcolo ricorsivo e memorizzazione
    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
  }
  
  // Restituisci la funzione interna
  return fib;
}

const fib = fibonacciMemoized();
console.log(fib(10)); // 55
console.log(fib(40)); // 102334155 (molto più veloce rispetto alla versione non memoizzata)
```

## Conclusione

Questi pattern ricorsivi rappresentano approcci potenti per risolvere diverse categorie di problemi. Scegliere il pattern giusto dipende dalla natura del problema e dalla struttura dei dati su cui si sta lavorando.

La comprensione di questi pattern non solo migliora la capacità di scrivere soluzioni ricorsive eleganti, ma aiuta anche a riconoscere quando la ricorsione è l'approccio più appropriato per un problema.

## Navigazione del Corso
- [📑 Indice](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/README.md)
- [⬅️ Introduzione alla Ricorsione](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/06-Ricorsione/teoria/01-IntroduzioneRicorsione.md)
- [➡️ Tail Call Optimization](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/06-Ricorsione/teoria/03-TailCallOptimization.md)
