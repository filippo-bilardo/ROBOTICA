# Performance e Ottimizzazioni nelle Higher-Order Functions

## Introduzione

Le Higher-Order Functions (HOF) offrono eleganza e composabilità, ma possono introdurre overhead di performance se non utilizzate correttamente. Questo documento esplora tecniche per ottimizzare le HOF mantenendo i benefici della programmazione funzionale.

## 🚀 Ottimizzazioni Fondamentali

### 1. **Lazy Evaluation e Short-Circuiting**

#### Array Methods Ottimizzati
```javascript
// Problema: elabora tutto l'array anche se trova subito il risultato
const findFirstAdult = users => 
    users
        .map(user => ({ ...user, isAdult: user.age >= 18 }))  // Processa TUTTI
        .filter(user => user.isAdult)                         // Filtra TUTTI
        .find(user => user.name.startsWith('A'));             // Trova il primo

// Soluzione: usa find per short-circuit
const findFirstAdultOptimized = users => 
    users.find(user => user.age >= 18 && user.name.startsWith('A'));

// Benchmark
const largeUsers = Array.from({length: 100000}, (_, i) => ({
    name: i === 50 ? 'Alice' : `User${i}`,
    age: 20 + (i % 50)
}));

console.time('non-optimized');
findFirstAdult(largeUsers);
console.timeEnd('non-optimized'); // ~15ms

console.time('optimized');
findFirstAdultOptimized(largeUsers);
console.timeEnd('optimized'); // ~0.1ms
```

#### Custom Lazy Implementations
```javascript
// Generatore per lazy evaluation
function* lazyMap(iterable, mapper) {
    for (const item of iterable) {
        yield mapper(item);
    }
}

function* lazyFilter(iterable, predicate) {
    for (const item of iterable) {
        if (predicate(item)) {
            yield item;
        }
    }
}

// Lazy pipeline
const lazyPipeline = function* (data) {
    yield* lazyFilter(
        lazyMap(data, user => ({ ...user, isAdult: user.age >= 18 })),
        user => user.isAdult
    );
};

// Utilizzo lazy - processa solo quando necessario
const processFirst = (users) => {
    const pipeline = lazyPipeline(users);
    return pipeline.next().value; // Solo il primo elemento processato
};
```

### 2. **Memoization Strategies**

#### Function-level Memoization
```javascript
const memoize = (fn, keyGenerator = JSON.stringify) => {
    const cache = new Map();
    const stats = { hits: 0, misses: 0 };
    
    const memoized = (...args) => {
        const key = keyGenerator(args);
        
        if (cache.has(key)) {
            stats.hits++;
            return cache.get(key);
        }
        
        stats.misses++;
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
    
    memoized.clearCache = () => cache.clear();
    memoized.getStats = () => ({ ...stats });
    
    return memoized;
};

// Esempio: expensive computation
const expensiveTransform = memoize((data) => {
    console.log('Computing expensive transformation...');
    return data.map(item => ({
        ...item,
        computed: Math.pow(item.value, 3) + Math.sin(item.value * Math.PI)
    }));
});

// Usage
const data = [{ value: 1 }, { value: 2 }, { value: 3 }];
expensiveTransform(data); // Computing... (cache miss)
expensiveTransform(data); // No computing (cache hit)
console.log(expensiveTransform.getStats()); // { hits: 1, misses: 1 }
```

#### LRU Cache per Memory Management
```javascript
class LRUCache {
    constructor(maxSize = 100) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }
    
    get(key) {
        if (this.cache.has(key)) {
            // Move to end (most recent)
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return undefined;
    }
    
    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Remove least recently used (first item)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}

const memoizeWithLRU = (fn, maxSize = 100) => {
    const cache = new LRUCache(maxSize);
    
    return (...args) => {
        const key = JSON.stringify(args);
        let result = cache.get(key);
        
        if (result === undefined) {
            result = fn(...args);
            cache.set(key, result);
        }
        
        return result;
    };
};
```

### 3. **Composition Optimization**

#### Function Composition Caching
```javascript
// Inefficient: creates new composition each time
const processUsers = (users) =>
    users
        .map(user => ({ ...user, fullName: `${user.first} ${user.last}` }))
        .filter(user => user.age >= 18)
        .map(user => ({ ...user, category: getCategory(user.age) }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName));

// Optimized: pre-composed pipeline
const createUserProcessor = () => {
    const addFullName = user => ({ ...user, fullName: `${user.first} ${user.last}` });
    const isAdult = user => user.age >= 18;
    const addCategory = user => ({ ...user, category: getCategory(user.age) });
    const sortByName = (a, b) => a.fullName.localeCompare(b.fullName);
    
    return (users) =>
        users
            .map(addFullName)
            .filter(isAdult)
            .map(addCategory)
            .sort(sortByName);
};

const processUsersOptimized = createUserProcessor();

// Reuse the same composed function
processUsersOptimized(users1);
processUsersOptimized(users2);
```

#### Pipeline Optimization
```javascript
// Combina operazioni simili
const optimizedPipeline = (data) =>
    data
        .map(item => ({
            // Combina multiple trasformazioni in una sola map
            ...item,
            fullName: `${item.first} ${item.last}`,
            isAdult: item.age >= 18,
            category: getCategory(item.age),
            score: calculateScore(item)
        }))
        .filter(item => item.isAdult && item.score > 50)
        .sort((a, b) => a.fullName.localeCompare(b.fullName));

// vs pipeline non ottimizzato
const unoptimizedPipeline = (data) =>
    data
        .map(item => ({ ...item, fullName: `${item.first} ${item.last}` }))
        .map(item => ({ ...item, isAdult: item.age >= 18 }))
        .map(item => ({ ...item, category: getCategory(item.age) }))
        .map(item => ({ ...item, score: calculateScore(item) }))
        .filter(item => item.isAdult)
        .filter(item => item.score > 50)
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
```

## ⚡ Transducers per Performance Massima

### Implementazione Basic Transducers
```javascript
// Transducer base
const map = (mapper) => (step) => (result, input) => 
    step(result, mapper(input));

const filter = (predicate) => (step) => (result, input) =>
    predicate(input) ? step(result, input) : result;

const take = (n) => (step) => {
    let taken = 0;
    return (result, input) => {
        if (taken < n) {
            taken++;
            return step(result, input);
        }
        return {
            '@@transducer/reduced': true,
            '@@transducer/value': result
        };
    };
};

// Composer di transducers
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

// Transduce function
const transduce = (transducer, reducer, initial, collection) => {
    const xf = transducer(reducer);
    let result = initial;
    
    for (const item of collection) {
        result = xf(result, item);
        if (result && result['@@transducer/reduced']) {
            return result['@@transducer/value'];
        }
    }
    
    return result;
};

// Utilizzo
const data = Array.from({length: 1000000}, (_, i) => i);

// Pipeline tradizionale (crea array intermedi)
console.time('traditional');
const traditional = data
    .map(x => x * 2)
    .filter(x => x % 4 === 0)
    .slice(0, 10);
console.timeEnd('traditional'); // ~50ms

// Pipeline con transducers (nessun array intermedio)
console.time('transducers');
const transduced = transduce(
    compose(
        map(x => x * 2),
        filter(x => x % 4 === 0),
        take(10)
    ),
    (acc, x) => [...acc, x],
    [],
    data
);
console.timeEnd('transducers'); // ~5ms
```

### Advanced Transducers Library
```javascript
class TransducerLibrary {
    static map(mapper) {
        return (step) => (result, input) => step(result, mapper(input));
    }
    
    static filter(predicate) {
        return (step) => (result, input) => 
            predicate(input) ? step(result, input) : result;
    }
    
    static take(n) {
        return (step) => {
            let taken = 0;
            return (result, input) => {
                if (taken < n) {
                    taken++;
                    const newResult = step(result, input);
                    return taken === n ? this.reduced(newResult) : newResult;
                }
                return this.reduced(result);
            };
        };
    }
    
    static reduced(value) {
        return {
            '@@transducer/reduced': true,
            '@@transducer/value': value
        };
    }
    
    static unreduced(result) {
        return result && result['@@transducer/reduced'] 
            ? result['@@transducer/value'] 
            : result;
    }
    
    static compose(...xfs) {
        return xfs.reduce((f, g) => (...args) => f(g(...args)));
    }
    
    static transduce(xf, reducer, init, coll) {
        const step = xf(reducer);
        let result = init;
        
        for (const item of coll) {
            result = step(result, item);
            if (result && result['@@transducer/reduced']) {
                return result['@@transducer/value'];
            }
        }
        
        return result;
    }
}

// Utilizzo avanzato
const { map, filter, take, compose, transduce } = TransducerLibrary;

const complexTransformation = compose(
    map(x => x * x),
    filter(x => x % 2 === 0),
    map(x => Math.sqrt(x)),
    take(5)
);

const result = transduce(
    complexTransformation,
    (acc, x) => acc + x,
    0,
    Array.from({length: 1000}, (_, i) => i + 1)
);
```

## 🔄 Partial Application e Currying Optimization

### Currying Optimization
```javascript
// Slow currying (creates functions each time)
const slowCurry = (fn) => {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return function(...nextArgs) {
            return curried.apply(this, args.concat(nextArgs));
        };
    };
};

// Fast currying (optimized)
const fastCurry = (fn, arity = fn.length) => {
    return function curried(...args) {
        if (args.length >= arity) {
            return fn(...args);
        }
        return fastCurry(fn.bind(null, ...args), arity - args.length);
    };
};

// Benchmark
const add3 = (a, b, c) => a + b + c;
const slowCurriedAdd = slowCurry(add3);
const fastCurriedAdd = fastCurry(add3);

console.time('slow curry');
for (let i = 0; i < 100000; i++) {
    slowCurriedAdd(1)(2)(3);
}
console.timeEnd('slow curry'); // ~50ms

console.time('fast curry');
for (let i = 0; i < 100000; i++) {
    fastCurriedAdd(1)(2)(3);
}
console.timeEnd('fast curry'); // ~20ms
```

### Partial Application Caching
```javascript
class PartialCache {
    constructor() {
        this.cache = new WeakMap();
    }
    
    partial(fn, ...args) {
        if (!this.cache.has(fn)) {
            this.cache.set(fn, new Map());
        }
        
        const fnCache = this.cache.get(fn);
        const key = JSON.stringify(args);
        
        if (!fnCache.has(key)) {
            fnCache.set(key, (...remainingArgs) => fn(...args, ...remainingArgs));
        }
        
        return fnCache.get(key);
    }
}

const partialCache = new PartialCache();

// Riutilizzo di partial applications
const add = (a, b, c) => a + b + c;
const add5 = partialCache.partial(add, 5);      // Cached
const add5Again = partialCache.partial(add, 5); // Same reference

console.log(add5 === add5Again); // true - stessa funzione cachata
```

## 📊 Performance Monitoring

### Benchmarking Utils
```javascript
class PerformanceProfiler {
    static benchmark(name, fn, iterations = 1000) {
        // Warm up
        for (let i = 0; i < 10; i++) fn();
        
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            fn();
        }
        const end = performance.now();
        
        const total = end - start;
        const average = total / iterations;
        
        console.log(`${name}:`);
        console.log(`  Total: ${total.toFixed(2)}ms`);
        console.log(`  Average: ${average.toFixed(4)}ms`);
        console.log(`  Operations/sec: ${(1000 / average).toFixed(0)}`);
        
        return { total, average, opsPerSec: 1000 / average };
    }
    
    static compare(tests) {
        const results = {};
        
        for (const [name, fn] of Object.entries(tests)) {
            results[name] = this.benchmark(name, fn);
        }
        
        const fastest = Object.entries(results)
            .sort((a, b) => a[1].average - b[1].average)[0];
        
        console.log(`\nFastest: ${fastest[0]}`);
        
        for (const [name, result] of Object.entries(results)) {
            const ratio = result.average / fastest[1].average;
            console.log(`${name}: ${ratio.toFixed(2)}x slower`);
        }
        
        return results;
    }
}

// Usage
const data = Array.from({length: 10000}, (_, i) => i);

PerformanceProfiler.compare({
    'Traditional Loop': () => {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i] % 2 === 0) {
                result.push(data[i] * 2);
            }
        }
        return result;
    },
    
    'Functional Chain': () => 
        data.filter(x => x % 2 === 0).map(x => x * 2),
    
    'Optimized Functional': () => 
        data.reduce((acc, x) => {
            if (x % 2 === 0) acc.push(x * 2);
            return acc;
        }, []),
    
    'Transducers': () => 
        TransducerLibrary.transduce(
            TransducerLibrary.compose(
                TransducerLibrary.filter(x => x % 2 === 0),
                TransducerLibrary.map(x => x * 2)
            ),
            (acc, x) => [...acc, x],
            [],
            data
        )
});
```

### Memory Usage Monitoring
```javascript
class MemoryProfiler {
    static measureMemory(name, fn) {
        if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
            const before = window.performance.memory.usedJSHeapSize;
            fn();
            const after = window.performance.memory.usedJSHeapSize;
            
            console.log(`${name} Memory Usage: ${(after - before) / 1024 / 1024} MB`);
            return after - before;
        } else if (typeof process !== 'undefined' && process.memoryUsage) {
            const before = process.memoryUsage().heapUsed;
            fn();
            const after = process.memoryUsage().heapUsed;
            
            console.log(`${name} Memory Usage: ${(after - before) / 1024 / 1024} MB`);
            return after - before;
        }
    }
}
```

## 🎯 Best Practices per Performance

### 1. **Scegliere il Tool Giusto**
```javascript
// Per piccoli dataset: readability over performance
const small = [1, 2, 3, 4, 5];
const result1 = small.map(x => x * 2).filter(x => x > 4);

// Per grandi dataset: performance-aware
const large = Array.from({length: 1000000}, (_, i) => i);
const result2 = large.reduce((acc, x) => {
    const doubled = x * 2;
    if (doubled > 4) acc.push(doubled);
    return acc;
}, []);
```

### 2. **Profile Before Optimize**
```javascript
// Sempre misura prima di ottimizzare
const profileFunction = (fn, name) => {
    console.time(name);
    const result = fn();
    console.timeEnd(name);
    return result;
};
```

### 3. **Balance Readability vs Performance**
```javascript
// Readable version
const processData = data =>
    data
        .filter(isValid)
        .map(normalize)
        .map(transform)
        .sort(compareFn);

// Performance version (when needed)
const processDataOptimized = data => {
    const result = [];
    for (const item of data) {
        if (isValid(item)) {
            const normalized = normalize(item);
            const transformed = transform(normalized);
            result.push(transformed);
        }
    }
    return result.sort(compareFn);
};

// Use readable version by default, optimize only when profiling shows bottlenecks
```

## 📈 Risultati Attesi

### Performance Improvements
- **Transducers**: 5-10x faster per pipeline complesse
- **Memoization**: 10-100x per funzioni costose ripetute
- **Lazy Evaluation**: 2-5x per early termination
- **Optimized Composition**: 20-50% miglioramento

### Memory Benefits
- **Transducers**: 60-80% riduzione uso memoria
- **Lazy Evaluation**: Uso memoria costante
- **LRU Cache**: Controllo predittibile della memoria

La chiave è **misurare sempre** e ottimizzare solo dove necessario, mantenendo un equilibrio tra performance e maintainability.
