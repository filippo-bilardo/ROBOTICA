/**
 * Ricorsione Mutuale e Pattern Avanzati
 * 
 * Questo file esplora pattern ricorsivi più avanzati come la ricorsione mutuale,
 * le funzioni ad ordine superiore ricorsive, e altri pattern specializzati.
 */

// --------------------------------------------------------
// PARTE 1: Ricorsione Mutuale
// --------------------------------------------------------

console.log('===== RICORSIONE MUTUALE =====');

/**
 * La ricorsione mutuale è un pattern in cui due o più funzioni si chiamano
 * reciprocamente formando un ciclo di chiamate.
 */

// Esempio 1: Verifica numeri pari/dispari
function isEven(n) {
  n = Math.abs(n);
  if (n === 0) return true;
  return isOdd(n - 1);
}

function isOdd(n) {
  n = Math.abs(n);
  if (n === 0) return false;
  return isEven(n - 1);
}

console.log('isEven(10):', isEven(10));   // true
console.log('isOdd(10):', isOdd(10));     // false
console.log('isEven(15):', isEven(15));   // false
console.log('isOdd(15):', isOdd(15));     // true

// Esempio 2: Parser ricorsivo mutuale
function parseExpression(tokens, index = 0) {
  // Cerca di analizzare un termine
  const [term, nextIndex] = parseTerm(tokens, index);
  
  // Se il prossimo token è un operatore, abbiamo un'espressione composta
  if (nextIndex < tokens.length && ['+', '-'].includes(tokens[nextIndex])) {
    const operator = tokens[nextIndex];
    
    // Analizza ricorsivamente il resto dell'espressione
    const [right, finalIndex] = parseExpression(tokens, nextIndex + 1);
    
    return [{ type: 'binary', operator, left: term, right }, finalIndex];
  }
  
  // Altrimenti, abbiamo solo un termine
  return [term, nextIndex];
}

function parseTerm(tokens, index = 0) {
  // Cerca di analizzare un fattore
  const [factor, nextIndex] = parseFactor(tokens, index);
  
  // Se il prossimo token è un operatore di moltiplicazione o divisione
  if (nextIndex < tokens.length && ['*', '/'].includes(tokens[nextIndex])) {
    const operator = tokens[nextIndex];
    
    // Analizza ricorsivamente il resto del termine
    const [right, finalIndex] = parseTerm(tokens, nextIndex + 1);
    
    return [{ type: 'binary', operator, left: factor, right }, finalIndex];
  }
  
  // Altrimenti, abbiamo solo un fattore
  return [factor, nextIndex];
}

function parseFactor(tokens, index = 0) {
  // Gestisci le parentesi
  if (tokens[index] === '(') {
    const [expr, nextIndex] = parseExpression(tokens, index + 1);
    
    // Assicurati che ci sia una parentesi chiusa
    if (tokens[nextIndex] === ')') {
      return [expr, nextIndex + 1];
    }
    throw new Error('Parentesi non bilanciate');
  }
  
  // Gestisci i numeri
  if (/^\d+$/.test(tokens[index])) {
    return [{ type: 'number', value: parseInt(tokens[index], 10) }, index + 1];
  }
  
  // Gestisci le variabili
  if (/^[a-z]+$/i.test(tokens[index])) {
    return [{ type: 'variable', name: tokens[index] }, index + 1];
  }
  
  throw new Error(`Token non riconosciuto: ${tokens[index]}`);
}

// Esempio di utilizzo del parser
const expressionTokens = ['2', '+', '3', '*', '4', '+', '(', '5', '-', '1', ')'];
try {
  const [ast, finalIndex] = parseExpression(expressionTokens);
  console.log('AST dell\'espressione 2+3*4+(5-1):', JSON.stringify(ast, null, 2));
} catch (error) {
  console.error('Errore di parsing:', error.message);
}

// --------------------------------------------------------
// PARTE 2: Ricorsione con Higher-Order Functions
// --------------------------------------------------------

console.log('\n===== RICORSIONE CON HIGHER-ORDER FUNCTIONS =====');

/**
 * Pattern in cui una funzione ricorsiva accetta o restituisce altre funzioni.
 */

// Funzione che genera iteratori ricorsivi personalizzati
function makeRecursiveIterator(process, isBaseCase, getBaseValue, reduceStep) {
  return function iterator(data) {
    // Modifichiamo i dati secondo il processo definito
    const processed = process(data);
    
    // Controlliamo se siamo arrivati al caso base
    if (isBaseCase(processed)) {
      return getBaseValue(processed);
    }
    
    // Chiamata ricorsiva sul risultato ridotto
    const recursiveResult = iterator(reduceStep(processed));
    
    // Combiniamo i risultati
    return recursiveResult;
  };
}

// Esempio: creazione di un iteratore per calcolare il fattoriale
const factorialIterator = makeRecursiveIterator(
  n => n,                      // Nessuna trasformazione iniziale
  n => n <= 1,                 // Caso base: n ≤ 1
  n => 1,                      // Valore del caso base: 1
  n => ({ value: n - 1, acc: n })  // Riduzione: n-1 e accumula n
);

// Esempio: creazione di un iteratore per il massimo comun divisore
const gcdIterator = makeRecursiveIterator(
  pair => pair,                // Nessuna trasformazione iniziale
  pair => pair.b === 0,        // Caso base: b = 0
  pair => pair.a,              // Valore del caso base: a
  pair => ({ a: pair.b, b: pair.a % pair.b }) // Algoritmo di Euclide
);

// Test degli iteratori
console.log('Factorial(5) usando iterator:', factorialIterator(5));
console.log('GCD di 48 e 18:', gcdIterator({ a: 48, b: 18 }));
console.log('GCD di 17 e 5:', gcdIterator({ a: 17, b: 5 }));

// --------------------------------------------------------
// PARTE 3: Ricorsione con Accumulatori Multipli
// --------------------------------------------------------

console.log('\n===== RICORSIONE CON ACCUMULATORI MULTIPLI =====');

/**
 * Pattern che usa più accumulatori per evitare calcoli ripetuti
 * o per mantenere stato più complesso durante la ricorsione.
 */

// Fibonacci con accumlatori multipli (tail-recursive)
function fibonacciMultiAccum(n, a = 0, b = 1) {
  if (n === 0) return a;
  if (n === 1) return b;
  return fibonacciMultiAccum(n - 1, b, a + b);
}

// QuickSort tail-recursive con accumulatori multipli
function quickSortAccum(arr) {
  function sort(array, low, high, result = []) {
    if (low > high) {
      return result;
    }
    
    if (low === high) {
      result[low] = array[low];
      return result;
    }
    
    const pivotIndex = partition(array, low, high);
    
    // Ordina prima la parte sinistra
    result = sort(array, low, pivotIndex - 1, result);
    
    // Posiziona il pivot
    result[pivotIndex] = array[pivotIndex];
    
    // Ordina la parte destra
    return sort(array, pivotIndex + 1, high, result);
  }
  
  function partition(array, low, high) {
    const pivot = array[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      if (array[j] <= pivot) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    return i + 1;
  }
  
  // Crea una copia dell'array per non modificare l'originale
  const arrayCopy = [...arr];
  return sort(arrayCopy, 0, arrayCopy.length - 1, []);
}

// Calcolo del percorso più breve in un grafo con accumulatori multipli
function shortestPath(graph, start, end, visited = new Set(), path = [], shortestSoFar = { path: null, length: Infinity }) {
  // Aggiungiamo il nodo corrente al percorso e ai nodi visitati
  path.push(start);
  visited.add(start);
  
  // Caso base: abbiamo raggiunto la destinazione
  if (start === end) {
    // Aggiorniamo il percorso più breve se questo è più corto
    if (path.length < shortestSoFar.length) {
      shortestSoFar.path = [...path];
      shortestSoFar.length = path.length;
    }
  } else {
    // Esploriamo tutti i vicini non ancora visitati
    for (const neighbor of graph[start] || []) {
      if (!visited.has(neighbor)) {
        shortestPath(graph, neighbor, end, new Set(visited), [...path], shortestSoFar);
      }
    }
  }
  
  return shortestSoFar;
}

// Test con accumulatori multipli
console.log('Fibonacci(10) con accumulatori multipli:', fibonacciMultiAccum(10));
console.log('QuickSort con accumulatori:', quickSortAccum([5, 3, 8, 4, 2, 1, 7, 6]));

// Test di shortest path
const graphExample = {
  'A': ['B', 'C'],
  'B': ['A', 'D', 'E'],
  'C': ['A', 'F'],
  'D': ['B'],
  'E': ['B', 'F'],
  'F': ['C', 'E']
};

console.log('Percorso più breve da A a F:', shortestPath(graphExample, 'A', 'F').path.join(' -> '));

// --------------------------------------------------------
// PARTE 4: Pattern di Visita Completa e Lazy
// --------------------------------------------------------

console.log('\n===== PATTERN DI VISITA COMPLETA E LAZY =====');

/**
 * Questi pattern permettono di attraversare strutture dati complesse
 * in modo completo o lazy (on-demand).
 */

// Generazione di tutte le combinazioni di elementi
function generateCombinations(elements, k) {
  if (k === 0) {
    return [[]];
  }
  
  if (elements.length === 0) {
    return [];
  }
  
  const [head, ...tail] = elements;
  
  // Combinazioni che includono l'elemento head
  const withHead = generateCombinations(tail, k - 1).map(comb => [head, ...comb]);
  
  // Combinazioni che non includono head
  const withoutHead = generateCombinations(tail, k);
  
  return [...withHead, ...withoutHead];
}

// Generatore ricorsivo per attraversamento lazy
function* traverseTree(node) {
  if (!node) return;
  
  // Pre-order: visita la radice prima dei figli
  yield node.value;
  
  // Attraversa tutti i figli
  for (const child of node.children || []) {
    yield* traverseTree(child);
  }
}

// Ricerca esauriente con backtracking (pattern simile al sudoku solver)
function findAllSolutions(problem, partialSolution = []) {
  // Caso base: soluzione completa
  if (problem.isComplete(partialSolution)) {
    return [partialSolution];
  }
  
  // Ottieni le possibili mosse dalla posizione corrente
  const candidates = problem.getCandidates(partialSolution);
  const solutions = [];
  
  // Prova ogni candidato
  for (const candidate of candidates) {
    // Aggiungi il candidato alla soluzione parziale
    const newSolution = [...partialSolution, candidate];
    
    // Se la nuova soluzione è valida, continua la ricerca
    if (problem.isValid(newSolution)) {
      const newSolutions = findAllSolutions(problem, newSolution);
      solutions.push(...newSolutions);
    }
  }
  
  return solutions;
}

// Esempio di combinazioni
console.log('Tutte le combinazioni di 2 elementi da [1,2,3,4]:');
console.log(generateCombinations([1, 2, 3, 4], 2));

// Esempio di utilizzo del generatore
const treeExample = {
  value: 'A',
  children: [
    { value: 'B', children: [{ value: 'D' }, { value: 'E' }] },
    { value: 'C', children: [{ value: 'F' }] }
  ]
};

console.log('Attraversamento dell\'albero (lazy):');
const treeIterator = traverseTree(treeExample);
for (const value of treeIterator) {
  console.log(value);
}

// --------------------------------------------------------
// PARTE 5: Ricorsione Generica e Astrazioni di Alto Livello
// --------------------------------------------------------

console.log('\n===== RICORSIONE GENERICA E ASTRAZIONI =====');

/**
 * Pattern che creano astrazioni di alto livello per lavorare con strutture ricorsive.
 */

// Funzione generica per attraversare strutture annidate
function deepMapRecursive(data, mapFn, childrenFn) {
  // Applica la funzione di mapping al dato corrente
  const mapped = mapFn(data);
  
  // Se non ci sono figli o non siamo un oggetto/array, restituisci il valore mappato
  if (typeof data !== 'object' || data === null) {
    return mapped;
  }
  
  // Ottieni i figli usando la funzione childrenFn
  const children = childrenFn(data);
  
  // Se non ci sono figli, restituisci il valore mappato
  if (!children || children.length === 0) {
    return mapped;
  }
  
  // Attraversa ricorsivamente i figli
  if (Array.isArray(data)) {
    return children.map(child => deepMapRecursive(child, mapFn, childrenFn));
  } else {
    // Per oggetti, mantieni la struttura
    const result = {};
    for (const key in children) {
      result[key] = deepMapRecursive(children[key], mapFn, childrenFn);
    }
    return result;
  }
}

// Fixed-point combinator applicativo (AP combinator)
// Permette di definire funzioni ricorsive di ordine superiore
const AP = fn => {
  const g = f => f(f);
  return g(f => fn(x => f(f)(x)));
};

// Fixed-point combinator più leggibile per JavaScript
const fix = f => {
  return (...args) => {
    return f(fix(f))(...args);
  };
};

// Esempio di utilizzo di fix per definire il fattoriale
const factorialFix = fix(f => n => n <= 1 ? 1 : n * f(n - 1));

// Esempio di utilizzo del deepMapRecursive
const nestedData = {
  name: 'root',
  children: [
    { name: 'child1', value: 1, children: [] },
    { name: 'child2', value: 2, children: [
      { name: 'grandchild', value: 3 }
    ]}
  ]
};

const mappedData = deepMapRecursive(
  nestedData,
  node => typeof node === 'object' && node !== null ? { ...node } : node,
  node => node.children || []
);

console.log('Factorial usando fix:', factorialFix(5));
console.log('Deep mapped data (struttura astratta):', JSON.stringify(mappedData, null, 2));
