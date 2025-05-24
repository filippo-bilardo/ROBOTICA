# Ottimizzazione Avanzata per Codice Funzionale

## Profilazione e Misurazione delle Performance

### Benchmark-Driven Development

```javascript
// Setup per benchmark precisi
class FunctionalBenchmark {
  constructor(name) {
    this.name = name;
    this.results = [];
  }
  
  // Misurazione accurata con warm-up
  measure(fn, iterations = 10000, warmup = 1000) {
    // Warm-up per JIT compilation
    for (let i = 0; i < warmup; i++) {
      fn();
    }
    
    // Garbage collection prima del test
    if (global.gc) global.gc();
    
    const start = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to ms
    
    this.results.push(duration);
    return duration;
  }
  
  // Confronto statistico tra implementazioni
  compare(implementations, iterations = 10000) {
    const results = {};
    
    for (const [name, fn] of Object.entries(implementations)) {
      const times = [];
      
      // Esegui multipli run per ridurre il rumore
      for (let run = 0; run < 5; run++) {
        times.push(this.measure(fn, iterations));
      }
      
      results[name] = {
        mean: times.reduce((a, b) => a + b) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        std: this.standardDeviation(times)
      };
    }
    
    return results;
  }
  
  standardDeviation(values) {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b) / values.length;
    return Math.sqrt(variance);
  }
}

// Esempio: confronto tra implementazioni di map
const benchmark = new FunctionalBenchmark('Map Implementations');

const data = Array.from({ length: 10000 }, (_, i) => i);
const fn = x => x * 2;

const implementations = {
  'native-map': () => data.map(fn),
  'for-loop': () => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      result.push(fn(data[i]));
    }
    return result;
  },
  'reduce-map': () => data.reduce((acc, item) => [...acc, fn(item)], []),
  'functional-map': () => {
    const map = f => arr => arr.map(f);
    return map(fn)(data);
  }
};

console.log(benchmark.compare(implementations));
```

### Memory Profiling per Funzioni Pure

```javascript
// Strumenti per monitorare l'uso della memoria
class MemoryProfiler {
  static measureMemoryUsage(fn, label = 'Memory Usage') {
    const formatBytes = (bytes) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Byte';
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };
    
    if (global.gc) global.gc();
    const before = process.memoryUsage();
    
    const result = fn();
    
    if (global.gc) global.gc();
    const after = process.memoryUsage();
    
    const diff = {
      rss: after.rss - before.rss,
      heapTotal: after.heapTotal - before.heapTotal,
      heapUsed: after.heapUsed - before.heapUsed,
      external: after.external - before.external
    };
    
    console.log(`${label}:`);
    console.log(`  RSS: ${formatBytes(diff.rss)}`);
    console.log(`  Heap Total: ${formatBytes(diff.heapTotal)}`);
    console.log(`  Heap Used: ${formatBytes(diff.heapUsed)}`);
    console.log(`  External: ${formatBytes(diff.external)}`);
    
    return { result, memoryDiff: diff };
  }
  
  // Analisi di memory leaks in closures
  static analyzeClosureMemory() {
    const measurements = [];
    
    // Test con closure che cattura variabili
    const createClosure = (size) => {
      const largeArray = new Array(size).fill(0);
      return (x) => x + largeArray.length;
    };
    
    for (let i = 1000; i <= 10000; i += 1000) {
      const measurement = this.measureMemoryUsage(
        () => createClosure(i),
        `Closure with array size ${i}`
      );
      measurements.push({ size: i, memory: measurement.memoryDiff });
    }
    
    return measurements;
  }
}
```

## Ottimizzazioni Avanzate per Programmazione Funzionale

### Memoization Intelligente

```javascript
// Memoization con gestione avanzata della cache
class AdvancedMemoization {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || null; // Time to live in ms
    this.cache = new Map();
    this.accessTimes = new Map();
    this.hitCount = 0;
    this.missCount = 0;
  }
  
  // Memoization con LRU cache
  memoize(fn, keyGenerator = (...args) => JSON.stringify(args)) {
    return (...args) => {
      const key = keyGenerator(...args);
      const now = Date.now();
      
      // Check TTL
      if (this.ttl && this.accessTimes.has(key)) {
        const accessTime = this.accessTimes.get(key);
        if (now - accessTime > this.ttl) {
          this.cache.delete(key);
          this.accessTimes.delete(key);
        }
      }
      
      if (this.cache.has(key)) {
        this.hitCount++;
        this.accessTimes.set(key, now);
        return this.cache.get(key);
      }
      
      this.missCount++;
      
      // Evict least recently used if cache is full
      if (this.cache.size >= this.maxSize) {
        const lruKey = this.findLRUKey();
        this.cache.delete(lruKey);
        this.accessTimes.delete(lruKey);
      }
      
      const result = fn(...args);
      this.cache.set(key, result);
      this.accessTimes.set(key, now);
      
      return result;
    };
  }
  
  findLRUKey() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }
  
  // Memoization per funzioni ricorsive
  memoizeRecursive(fn) {
    const cache = new Map();
    
    const memoized = (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      // Passa la versione memoizzata alla funzione originale
      const result = fn(memoized, ...args);
      cache.set(key, result);
      return result;
    };
    
    return memoized;
  }
  
  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      hitRate: total > 0 ? (this.hitCount / total) * 100 : 0,
      cacheSize: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount
    };
  }
}

// Esempio: Fibonacci con memoization avanzata
const advancedMemo = new AdvancedMemoization({ maxSize: 50, ttl: 5000 });

const fibonacci = advancedMemo.memoizeRecursive((fib, n) => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

console.log(fibonacci(40)); // Veloce anche per valori alti
console.log(advancedMemo.getStats());
```

### Lazy Evaluation Avanzata

```javascript
// Lazy sequences con ottimizzazioni
class LazySequence {
  constructor(generator) {
    this.generator = generator;
    this._cached = false;
    this._cache = null;
  }
  
  static from(iterable) {
    return new LazySequence(function* () {
      yield* iterable;
    });
  }
  
  static range(start, end, step = 1) {
    return new LazySequence(function* () {
      for (let i = start; i < end; i += step) {
        yield i;
      }
    });
  }
  
  // Operazioni lazy
  map(fn) {
    const generator = this.generator;
    return new LazySequence(function* () {
      for (const value of generator()) {
        yield fn(value);
      }
    });
  }
  
  filter(predicate) {
    const generator = this.generator;
    return new LazySequence(function* () {
      for (const value of generator()) {
        if (predicate(value)) {
          yield value;
        }
      }
    });
  }
  
  take(count) {
    const generator = this.generator;
    return new LazySequence(function* () {
      let taken = 0;
      for (const value of generator()) {
        if (taken >= count) break;
        yield value;
        taken++;
      }
    });
  }
  
  // Chunking per processing parallelo
  chunk(size) {
    const generator = this.generator;
    return new LazySequence(function* () {
      let chunk = [];
      for (const value of generator()) {
        chunk.push(value);
        if (chunk.length === size) {
          yield chunk;
          chunk = [];
        }
      }
      if (chunk.length > 0) {
        yield chunk;
      }
    });
  }
  
  // Parallel processing con Worker Threads
  async parallelMap(fn, workerCount = 4) {
    const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
    
    if (!isMainThread) {
      // Worker code
      const { chunk, fnString } = workerData;
      const func = eval(`(${fnString})`);
      const result = chunk.map(func);
      parentPort.postMessage(result);
      return;
    }
    
    // Main thread code
    const chunks = this.chunk(Math.ceil(this.toArray().length / workerCount)).toArray();
    const workers = [];
    const results = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const worker = new Worker(__filename, {
        workerData: {
          chunk: chunks[i],
          fnString: fn.toString()
        }
      });
      
      workers.push(new Promise((resolve) => {
        worker.on('message', (result) => {
          results[i] = result;
          resolve();
        });
      }));
    }
    
    await Promise.all(workers);
    return new LazySequence(function* () {
      for (const result of results) {
        yield* result;
      }
    });
  }
  
  // Materialization con cache
  toArray() {
    if (this._cached) {
      return [...this._cache];
    }
    
    const result = [...this.generator()];
    this._cache = result;
    this._cached = true;
    return result;
  }
  
  // Operazioni terminali ottimizzate
  reduce(reducer, initialValue) {
    let accumulator = initialValue;
    for (const value of this.generator()) {
      accumulator = reducer(accumulator, value);
    }
    return accumulator;
  }
  
  // Early termination per predicati
  every(predicate) {
    for (const value of this.generator()) {
      if (!predicate(value)) {
        return false;
      }
    }
    return true;
  }
  
  some(predicate) {
    for (const value of this.generator()) {
      if (predicate(value)) {
        return true;
      }
    }
    return false;
  }
}

// Esempio di utilizzo ottimizzato
const numbers = LazySequence.range(0, 1000000)
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .take(100);

console.log('Prime 100 quadrati pari:', numbers.toArray());
```

### Transducers per Efficienza

```javascript
// Implementazione di transducers per evitare collections intermedie
const Transducers = {
  // Transducer base
  map: (fn) => (reducer) => (acc, input) => reducer(acc, fn(input)),
  
  filter: (predicate) => (reducer) => (acc, input) => 
    predicate(input) ? reducer(acc, input) : acc,
  
  take: (n) => (reducer) => {
    let taken = 0;
    return (acc, input) => {
      if (taken < n) {
        taken++;
        return reducer(acc, input);
      }
      return acc;
    };
  },
  
  // Composizione di transducers
  compose: (...transducers) => (reducer) => 
    transducers.reduceRight((acc, transducer) => transducer(acc), reducer),
  
  // Applicazione di transducers
  transduce: (transducer, reducer, seed, collection) => {
    const xf = transducer(reducer);
    return collection.reduce(xf, seed);
  },
  
  // Into - helper per materializzazione
  into: (to, transducer, from) => {
    const reducer = Array.isArray(to) 
      ? (acc, item) => (acc.push(item), acc)
      : (acc, item) => acc.add(item);
    
    return Transducers.transduce(
      transducer,
      reducer,
      Array.isArray(to) ? [] : new Set(),
      from
    );
  }
};

// Confronto performance: transducers vs chain operations
const data = Array.from({ length: 100000 }, (_, i) => i);

// Chain operations (crea array intermedi)
console.time('Chain Operations');
const chainResult = data
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .filter(x => x < 10000);
console.timeEnd('Chain Operations');

// Transducers (singolo pass)
console.time('Transducers');
const transducerResult = Transducers.into(
  [],
  Transducers.compose(
    Transducers.filter(x => x % 2 === 0),
    Transducers.map(x => x * x),
    Transducers.filter(x => x < 10000)
  ),
  data
);
console.timeEnd('Transducers');

console.log('Results equal:', JSON.stringify(chainResult) === JSON.stringify(transducerResult));
```

## Ottimizzazioni del Runtime JavaScript

### Tree Shaking per Librerie Funzionali

```javascript
// webpack.config.js per tree shaking ottimale
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false, // Importante per librerie funzionali pure
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        functional: {
          test: /[\\/]node_modules[\\/](ramda|lodash-fp|sanctuary)[\\/]/,
          name: 'functional-libs',
          chunks: 'all'
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false, // Mantieni ES modules per tree shaking
                targets: { node: '14' }
              }]
            ],
            plugins: [
              // Plugin per ottimizzazioni specifiche
              'babel-plugin-lodash', // Per lodash tree shaking
              ['ramda', { useES: true }] // Per ramda tree shaking
            ]
          }
        }
      }
    ]
  }
};
```

### JIT Optimization Hints

```javascript
// Patterns per aiutare il JIT compiler
class JITOptimization {
  // Monomorphic function calls (tipo stabile)
  static optimizeForMonomorphism() {
    // BAD: polymorphic - tipi diversi
    const badAdd = (a, b) => a + b;
    badAdd(1, 2);       // number + number
    badAdd("a", "b");   // string + string
    badAdd(1, "2");     // number + string
    
    // GOOD: monomorphic - tipo stabile
    const addNumbers = (a, b) => {
      // Type guards per mantenere monomorphismo
      if (typeof a !== 'number' || typeof b !== 'number') {
        throw new TypeError('Expected numbers');
      }
      return a + b;
    };
  }
  
  // Stable object shapes per property access ottimizzato
  static optimizeObjectShapes() {
    // BAD: changing shapes
    const createBadUser = (name, age, email) => {
      const user = { name };
      if (age) user.age = age;       // Shape change
      if (email) user.email = email; // Shape change
      return user;
    };
    
    // GOOD: stable shape
    const createGoodUser = (name, age = null, email = null) => ({
      name,
      age,
      email
    });
  }
  
  // Hidden class optimization per closures
  static optimizeClosures() {
    // Factory function che produce closures con shape stabile
    const createCounter = (initialValue = 0) => {
      let count = initialValue;
      
      // Ritorna sempre lo stesso set di metodi
      return {
        increment: () => ++count,
        decrement: () => --count,
        getValue: () => count,
        reset: () => { count = initialValue; }
      };
    };
    
    return createCounter;
  }
}
```

## Monitoraggio delle Performance in Produzione

```javascript
// Sistema di monitoraggio per applicazioni funzionali
class FunctionalPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = new Map();
  }
  
  // Wrapper per monitorare funzioni pure
  monitor(fn, name, threshold = 100) {
    this.thresholds.set(name, threshold);
    
    return (...args) => {
      const start = performance.now();
      
      try {
        const result = fn(...args);
        
        // Handle promises
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            this.recordMetric(name, performance.now() - start);
          });
        }
        
        this.recordMetric(name, performance.now() - start);
        return result;
      } catch (error) {
        this.recordError(name, error);
        throw error;
      }
    };
  }
  
  recordMetric(name, duration) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        calls: 0,
        totalTime: 0,
        maxTime: 0,
        minTime: Infinity,
        errors: 0,
        violations: 0
      });
    }
    
    const metric = this.metrics.get(name);
    metric.calls++;
    metric.totalTime += duration;
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.minTime = Math.min(metric.minTime, duration);
    
    // Check threshold violations
    const threshold = this.thresholds.get(name);
    if (duration > threshold) {
      metric.violations++;
      console.warn(`Performance threshold violated for ${name}: ${duration.toFixed(2)}ms > ${threshold}ms`);
    }
  }
  
  recordError(name, error) {
    if (this.metrics.has(name)) {
      this.metrics.get(name).errors++;
    }
  }
  
  getReport() {
    const report = {};
    
    for (const [name, metric] of this.metrics) {
      report[name] = {
        ...metric,
        avgTime: metric.calls > 0 ? metric.totalTime / metric.calls : 0,
        errorRate: metric.calls > 0 ? (metric.errors / metric.calls) * 100 : 0,
        violationRate: metric.calls > 0 ? (metric.violations / metric.calls) * 100 : 0
      };
    }
    
    return report;
  }
  
  // Adaptive threshold adjustment
  optimizeThresholds() {
    for (const [name, metric] of this.metrics) {
      if (metric.calls > 100) { // Sufficient sample size
        const avgTime = metric.totalTime / metric.calls;
        const newThreshold = avgTime * 2; // 2x average as threshold
        this.thresholds.set(name, newThreshold);
      }
    }
  }
}

// Utilizzo
const monitor = new FunctionalPerformanceMonitor();

const expensiveComputation = monitor.monitor(
  (data) => data.map(x => x * x).filter(x => x > 100),
  'expensiveComputation',
  50 // 50ms threshold
);

// Simulate usage
for (let i = 0; i < 1000; i++) {
  expensiveComputation(Array.from({length: 1000}, (_, i) => i));
}

console.log(monitor.getReport());
```

## Best Practices per Performance

### 1. Evitare Allocazioni Eccessive

```javascript
// BAD: Crea molti array intermedi
const processData = (data) =>
  data
    .map(x => x * 2)
    .filter(x => x > 10)
    .map(x => x + 1)
    .reduce((sum, x) => sum + x, 0);

// GOOD: Singolo pass con transducers o loop ottimizzato
const processDataOptimized = (data) => {
  let sum = 0;
  for (const x of data) {
    const doubled = x * 2;
    if (doubled > 10) {
      sum += doubled + 1;
    }
  }
  return sum;
};
```

### 2. Utilizzare Immutabilità Efficiente

```javascript
// Structural sharing per updates efficienti
const updateNestedObject = (obj, path, value) => {
  if (path.length === 1) {
    return { ...obj, [path[0]]: value };
  }
  
  const [head, ...tail] = path;
  return {
    ...obj,
    [head]: updateNestedObject(obj[head] || {}, tail, value)
  };
};

// Alternative con librerie ottimizzate
const { produce } = require('immer');
const updateWithImmer = (obj, path, value) =>
  produce(obj, draft => {
    let current = draft;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]] = current[path[i]] || {};
    }
    current[path[path.length - 1]] = value;
  });
```

## Conclusione

L'ottimizzazione del codice funzionale richiede:

1. **Misurazione accurata** con benchmark appropriati
2. **Comprensione del runtime** JavaScript e delle sue ottimizzazioni
3. **Patterns specifici** per codice funzionale (transducers, lazy evaluation)
4. **Monitoraggio continuo** in produzione
5. **Bilanciamento** tra purezza funzionale e performance

Questi strumenti permettono di scrivere codice funzionale che è sia elegante che performante.

## Navigazione del Corso

← [Fondamenti Matematici](01-CategorieTeoria.md) | [Successivo: Testing Avanzato](../12-TestingAvanzato/teoria/01-PropertyBasedTesting.md) →
