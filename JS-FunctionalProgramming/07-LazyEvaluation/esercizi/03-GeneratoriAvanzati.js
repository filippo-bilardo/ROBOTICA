/**
 * Esercizio 3: Generatori Avanzati
 * 
 * In questo esercizio, esplorerai pattern avanzati con generatori e yield.
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
 * Esercizio 3.1: Tree Traversal con generatori
 * 
 * Implementa una funzione generatore che attraversa un albero in modo DFS (profondità).
 * 
 * @param {Object} tree - L'albero da attraversare, con proprietà 'value' e 'children'
 * @yields {*} - I valori dei nodi dell'albero
 */
function* traverseTree(tree) {
  // Implementa la funzione
}

/**
 * Esercizio 3.2: BFS (Breadth-First Search) con generatori
 * 
 * Implementa una funzione generatore che attraversa un albero in modo BFS (ampiezza).
 * 
 * @param {Object} tree - L'albero da attraversare, con proprietà 'value' e 'children'
 * @yields {*} - I valori dei nodi dell'albero
 */
function* traverseTreeBFS(tree) {
  // Implementa la funzione
}

/**
 * Esercizio 3.3: Generatori con comunicazione bidirezionale
 * 
 * Implementa un generatore che riceve valori tramite next() e li elabora.
 * Il generatore deve:
 * 1. Accettare numeri tramite next()
 * 2. Mantenere una somma corrente
 * 3. Restituire la somma corrente, il minimo e il massimo
 * 
 * @yields {Object} - Oggetto con le proprietà sum, min e max
 */
function* statefulGenerator() {
  // Implementa la funzione
}

/**
 * Esercizio 3.4: Generatori delegati (yield*)
 * 
 * Implementa un generatore che applica una funzione map a tutti gli elementi
 * prodotti da più generatori usando yield*.
 * 
 * @param {Function} mapFn - La funzione da applicare a ogni elemento
 * @param {...Generator} generators - I generatori da cui ottenere gli elementi
 * @yields {*} - Gli elementi mappati
 */
function* mapAllGenerators(mapFn, ...generators) {
  // Implementa la funzione
}

/**
 * Esercizio 3.5: Generatore con Memoization
 * 
 * Implementa una funzione che crea un generatore con memoization
 * per calcoli costosi. La funzione dovrebbe memorizzare i risultati 
 * già calcolati e riutilizzarli quando richiesto nuovamente.
 * 
 * @param {Function} calculationFn - La funzione costosa da memoizzare
 * @param {Generator} inputGen - Il generatore di input
 * @yields {*} - I risultati della funzione applicata agli input
 */
function* memoizedGenerator(calculationFn, inputGen) {
  // Implementa la funzione
}

// Crea una struttura ad albero per i test
const tree = {
  value: 'A',
  children: [
    {
      value: 'B',
      children: [
        { value: 'D', children: [] },
        { value: 'E', children: [] }
      ]
    },
    {
      value: 'C',
      children: [
        { value: 'F', children: [] },
        { value: 'G', children: [] }
      ]
    }
  ]
};

// Test per traverseTree
console.log('Test traverseTree:');
console.log(testSequence(() => traverseTree(tree))); // ['A', 'B', 'D', 'E', 'C']
console.log(Array.from(traverseTree(tree))); // ['A', 'B', 'D', 'E', 'C', 'F', 'G']

// Test per traverseTreeBFS
console.log('\nTest traverseTreeBFS:');
console.log(testSequence(() => traverseTreeBFS(tree))); // ['A', 'B', 'C', 'D', 'E']
console.log(Array.from(traverseTreeBFS(tree))); // ['A', 'B', 'C', 'D', 'E', 'F', 'G']

// Test per statefulGenerator
console.log('\nTest statefulGenerator:');
const statGen = statefulGenerator();
console.log(statGen.next()); // { value: { sum: 0, min: Infinity, max: -Infinity }, done: false }
console.log(statGen.next(5).value); // { sum: 5, min: 5, max: 5 }
console.log(statGen.next(3).value); // { sum: 8, min: 3, max: 5 }
console.log(statGen.next(8).value); // { sum: 16, min: 3, max: 8 }
console.log(statGen.next(-2).value); // { sum: 14, min: -2, max: 8 }

// Helper per testare mapAllGenerators
function* gen1() { yield* [1, 2, 3]; }
function* gen2() { yield* [4, 5]; }

// Test per mapAllGenerators
console.log('\nTest mapAllGenerators:');
console.log(Array.from(mapAllGenerators(x => x * x, gen1(), gen2()))); // [1, 4, 9, 16, 25]

// Test per memoizedGenerator
console.log('\nTest memoizedGenerator:');

// Funzione di test con console.log per verificare la memoization
function* testInputGen() {
  yield* [1, 2, 1, 3, 2, 4, 1];
}

function expensiveCalculation(x) {
  console.log(`Calcolando per ${x}...`);
  return x * x;
}

console.log(Array.from(memoizedGenerator(expensiveCalculation, testInputGen()))); 
// Output atteso:
// Calcolando per 1...
// Calcolando per 2...
// Calcolando per 3...
// Calcolando per 4...
// [1, 4, 1, 9, 4, 16, 1]
// Nota: dovrebbe calcolare solo una volta per ogni valore unico

/**
 * Esercizio 3.6 (Bonus): Coroutine con Generatori
 * 
 * Implementa un sistema di coroutine usando generatori che permetta
 * l'esecuzione cooperativa di più task.
 */
class Scheduler {
  constructor() {
    // Implementa il costruttore
  }
  
  addTask(generatorFn) {
    // Implementa il metodo
  }
  
  run(maxSteps = Infinity) {
    // Implementa il metodo
  }
}

// Test per Scheduler
console.log('\nTest Scheduler:');

function* task1() {
  for (let i = 0; i < 3; i++) {
    console.log(`Task 1, step ${i}`);
    yield;
  }
}

function* task2() {
  for (let i = 0; i < 2; i++) {
    console.log(`Task 2, step ${i}`);
    yield;
  }
}

const scheduler = new Scheduler();
scheduler.addTask(task1);
scheduler.addTask(task2);
scheduler.run(); // Dovrebbe alternare l'esecuzione dei task

module.exports = {
  traverseTree,
  traverseTreeBFS,
  statefulGenerator,
  mapAllGenerators,
  memoizedGenerator,
  Scheduler
};
