/**
 * Ottimizzazione Performance
 * 
 * Questo file confronta approcci eager vs lazy per dimostrare
 * i vantaggi in termini di prestazioni della lazy evaluation.
 */

// Importiamo alcune utility dal file pattern di iterazione
const { LazyCollection } = require('./03-PatternIterazione');

// ========================================================
// 1. Confronto di Base: Tempo di Esecuzione
// ========================================================

console.log('=== Confronto Tempo di Esecuzione ===');

// Una funzione costosa che simula un'elaborazione intensiva
function expensiveOperation(x) {
  // Simuliamo un'operazione costosa con un loop
  let result = 0;
  for (let i = 0; i < 10000; i++) {
    result += Math.sin(x) * Math.cos(i);
  }
  return result;
}

// Test Function per misurare le prestazioni
function benchmarkTest(name, testFn) {
  console.log(`\nAvvio test: ${name}`);
  const start = process.hrtime.bigint();
  const result = testFn();
  const end = process.hrtime.bigint();
  
  const durationMs = Number(end - start) / 1_000_000;
  console.log(`Durata: ${durationMs.toFixed(2)} ms`);
  
  return { result, durationMs };
}

// 1.1 Approccio EAGER (tradizionale)
function eagerApproach() {
  const size = 10000;
  
  console.log('Generazione array...');
  const array = Array.from({ length: size }, (_, i) => i);
  
  console.log('Mappatura...');
  const doubled = array.map(x => x * 2);
  
  console.log('Filtraggio...');
  const filtered = doubled.filter(x => x % 3 === 0);
  
  console.log('Prendendo i primi 5...');
  const first5 = filtered.slice(0, 5);
  
  return first5;
}

// 1.2 Approccio LAZY
function lazyApproach() {
  const size = 10000;
  
  console.log('Creazione lazy sequence...');
  return LazyCollection.range(0, size - 1, 1)
    .map(x => x * 2)
    .filter(x => x % 3 === 0)
    .take(5)
    .toArray();
}

console.log('\n--- Benchmark Base ---');
const eagerResult = benchmarkTest('Approccio Eager', eagerApproach);
const lazyResult = benchmarkTest('Approccio Lazy', lazyApproach);

console.log('\nRisultati:');
console.log('Eager:', eagerResult.result);
console.log('Lazy:', lazyResult.result);
console.log(`Miglioramento: ${(eagerResult.durationMs / lazyResult.durationMs).toFixed(2)}x più veloce`);

// ========================================================
// 2. Benchmark con Calcoli Costosi
// ========================================================

console.log('\n=== Benchmark con Calcoli Costosi ===');

// 2.1 Approccio EAGER con calcoli costosi
function eagerWithExpensiveOps() {
  const array = Array.from({ length: 1000 }, (_, i) => i);
  
  // Ogni operazione viene eseguita per tutti gli elementi
  const mapped = array.map(x => {
    console.log(`Eager: elaborazione dell'elemento ${x}`);
    return expensiveOperation(x);
  });
  
  const filtered = mapped.filter(x => x > 0.5);
  return filtered.slice(0, 3);
}

// 2.2 Approccio LAZY con calcoli costosi
function lazyWithExpensiveOps() {
  return LazyCollection.range(0, 999, 1)
    .map(x => {
      console.log(`Lazy: elaborazione dell'elemento ${x}`);
      return expensiveOperation(x);
    })
    .filter(x => x > 0.5)
    .take(3)
    .toArray();
}

console.log('\n--- Benchmark con Operazioni Costose ---');
// Eseguiamo versioni ridotte per scopi dimostrativi - il vero benchmark sarebbe troppo lungo
function eagerWithExpensiveOpsMini() {
  const array = Array.from({ length: 20 }, (_, i) => i);
  
  const mapped = array.map(x => {
    console.log(`Eager: elaborazione dell'elemento ${x}`);
    return x * x; // Operazione semplificata per il benchmark ridotto
  });
  
  const filtered = mapped.filter(x => x > 50);
  return filtered.slice(0, 3);
}

function lazyWithExpensiveOpsMini() {
  return LazyCollection.range(0, 19, 1)
    .map(x => {
      console.log(`Lazy: elaborazione dell'elemento ${x}`);
      return x * x; // Operazione semplificata per il benchmark ridotto
    })
    .filter(x => x > 50)
    .take(3)
    .toArray();
}

console.log('\nVersione semplificata per dimostrare short-circuiting:');
const eagerExpensive = benchmarkTest('Approccio Eager con ops costose', eagerWithExpensiveOpsMini);
const lazyExpensive = benchmarkTest('Approccio Lazy con ops costose', lazyWithExpensiveOpsMini);

console.log('\nElementi elaborati:');
console.log('Eager: tutti gli elementi dell\'array');
console.log('Lazy: solo quelli necessari per produrre i 3 risultati richiesti');

// ========================================================
// 3. Benchmark sull'utilizzo della memoria
// ========================================================

console.log('\n=== Benchmark sull\'utilizzo della memoria ===');

// Questa funzione ci permette di osservare l'utilizzo della memoria
function getMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  return {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
  };
}

// 3.1 Generazione di una grande sequenza con approccio EAGER
function largeEagerSequence() {
  console.log('Memoria prima della creazione array eager:');
  console.log(getMemoryUsage());
  
  // Crea un array di 10 milioni di elementi
  const largeArray = Array.from({ length: 10000000 }, (_, i) => i);
  
  console.log('Memoria dopo la creazione array eager:');
  console.log(getMemoryUsage());
  
  // Calcola la somma degli elementi
  const sum = largeArray.reduce((acc, val) => acc + val, 0);
  
  return sum;
}

// 3.2 Generazione di una grande sequenza con approccio LAZY
function largeLazySequence() {
  console.log('Memoria prima della creazione sequenza lazy:');
  console.log(getMemoryUsage());
  
  // Crea una sequenza lazy di 10 milioni di elementi
  const lazyRange = LazyCollection.range(0, 9999999, 1);
  
  console.log('Memoria dopo la creazione sequenza lazy:');
  console.log(getMemoryUsage());
  
  // Calcola la somma degli elementi
  const sum = lazyRange.reduce((acc, val) => acc + val, 0);
  
  return sum;
}

console.log('\n--- Benchmark Utilizzo Memoria ---');
console.log('\nSequenza Lazy (esegue prima):');
const lazyMemResult = benchmarkTest('Approccio Lazy memoria', largeLazySequence);
console.log('\nSequenza Eager:');
const eagerMemResult = benchmarkTest('Approccio Eager memoria', largeEagerSequence);

console.log('\nRisultati:');
console.log(`Eager sum: ${eagerMemResult.result}`);
console.log(`Lazy sum: ${lazyMemResult.result}`);
console.log(`Differenza tempo: ${(eagerMemResult.durationMs / lazyMemResult.durationMs).toFixed(2)}x`);

// ========================================================
// 4. Infinite Sequences Benchmark
// ========================================================

console.log('\n=== Benchmark con Sequenze Infinite ===');

function* infiniteNaturalNumbers() {
  let n = 0;
  while (true) {
    yield n++;
  }
}

// 4.1 Filtraggio e trasformazione su una sequenza infinita
function infiniteSequenceTest() {
  const startTime = process.hrtime.bigint();
  
  // Prendi i primi 10 quadrati perfetti
  const perfectSquares = LazyCollection.from(infiniteNaturalNumbers())
    .map(n => n * n)
    .take(10)
    .toArray();
    
  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1_000_000;
  
  console.log(`Perfect squares: ${perfectSquares}`);
  console.log(`Tempo: ${duration.toFixed(2)} ms`);
  
  return perfectSquares;
}

console.log('\n--- Sequenze Infinite ---');
console.log('Test con sequenza infinita:');
infiniteSequenceTest();
// Lo stesso test con un approccio eager non potrebbe essere eseguito 
// con una sequenza realmente infinita

// ========================================================
// 5. Confronto con Memoization
// ========================================================

console.log('\n=== Confronto con Memoization ===');

// Implementazione della sequenza di Fibonacci senza memoization
function fibWithoutMemo(n) {
  if (n <= 1) return n;
  return fibWithoutMemo(n - 1) + fibWithoutMemo(n - 2);
}

// Implementazione con memoization
function fibWithMemo() {
  const cache = new Map();
  
  function fib(n) {
    // Controllo se il valore è già nella cache
    if (cache.has(n)) return cache.get(n);
    
    let result;
    if (n <= 1) {
      result = n;
    } else {
      result = fib(n - 1) + fib(n - 2);
    }
    
    // Memorizza per uso futuro
    cache.set(n, result);
    return result;
  }
  
  return fib;
}

// 5.1 Test di Fibonacci senza memoization
function testFibWithoutMemo() {
  console.log('Calcolo di Fibonacci(35) senza memoization:');
  const result = fibWithoutMemo(35);
  return result;
}

// 5.2 Test di Fibonacci con memoization
function testFibWithMemo() {
  console.log('Calcolo di Fibonacci(35) con memoization:');
  const memoFib = fibWithMemo();
  const result = memoFib(35);
  return result;
}

console.log('\n--- Benchmark Memoization ---');
const noMemoResult = benchmarkTest('Fibonacci senza memoization', testFibWithoutMemo);
const memoResult = benchmarkTest('Fibonacci con memoization', testFibWithMemo);

console.log('\nRisultati:');
console.log(`Senza memo: ${noMemoResult.result} (${noMemoResult.durationMs.toFixed(2)} ms)`);
console.log(`Con memo: ${memoResult.result} (${memoResult.durationMs.toFixed(2)} ms)`);
console.log(`Miglioramento: ${(noMemoResult.durationMs / memoResult.durationMs).toFixed(2)}x più veloce`);

// ========================================================
// 6. Key Takeaways - Riassunto
// ========================================================

console.log('\n=== Key Takeaways ===');
console.log(`
Dai benchmark possiamo trarre le seguenti conclusioni:

1. Lazy Evaluation:
   - Evita calcoli non necessari (short-circuiting)
   - Riduce significativamente l'uso di memoria per grandi collezioni
   - Permette di lavorare con sequenze potenzialmente infinite

2. Memoization:
   - Drammatico miglioramento per funzioni con pattern di chiamate ripetitive
   - Particolarmente utile per algoritmi ricorsivi come Fibonacci
   - Trade-off tra memoria e velocità

3. Quando usare Lazy Evaluation:
   - Quando lavori con grandi collezioni
   - Quando hai catene di trasformazione di dati
   - Quando filtri risultati prima di utilizzarli tutti
   - Quando hai bisogno di sequenze concettualmente infinite

4. Quando usare Eager Evaluation:
   - Quando hai bisogno di tutti gli elementi della collezione
   - Quando la collezione è piccola
   - Quando hai bisogno di accesso casuale agli elementi
   - Quando hai bisogno di multiple iterazioni sulla stessa collezione
`);

// ========================================================
// Esportazioni
// ========================================================

// Esporto alcune utility per gli esempi successivi
module.exports = {
  benchmarkTest,
  expensiveOperation,
  getMemoryUsage,
  fibWithMemo
};

console.log('\nBenchmark completato!');
