/**
 * Pattern di Iterazione
 * 
 * Questo file esplora vari pattern di iterazione lazy in JavaScript,
 * utilizzando iteratori e generatori per elaborazioni efficienti.
 */

// Importiamo alcune sequenze dal file precedente
const { 
  naturalNumbers, 
  fibonacci,
  take,
  mapGen,
  filterGen
} = require('./02-SequenzeNumeriche');

// ========================================================
// 1. Lazy Collection - Classe Base
// ========================================================

/**
 * LazyCollection fornisce un'interfaccia orientata agli oggetti
 * per lavorare con sequenze lazy.
 */
class LazyCollection {
  constructor(iterable) {
    this.iterable = iterable;
  }
  
  // Factory methods
  static from(iterable) {
    return new LazyCollection(iterable);
  }
  
  static range(start, end, step) {
    return new LazyCollection(function* () {
      let current = start;
      
      if (step > 0) {
        while (current <= end) {
          yield current;
          current += step;
        }
      } else if (step < 0) {
        while (current >= end) {
          yield current;
          current += step;
        }
      }
    }());
  }
  
  static repeat(value, times = Infinity) {
    return new LazyCollection(function* () {
      let count = 0;
      while (count < times) {
        yield value;
        count++;
      }
    }());
  }
  
  // Transformers - ritornano una nuova LazyCollection
  map(fn) {
    const source = this.iterable;
    return new LazyCollection(function* () {
      for (const item of source) {
        yield fn(item);
      }
    }());
  }
  
  filter(predicate) {
    const source = this.iterable;
    return new LazyCollection(function* () {
      for (const item of source) {
        if (predicate(item)) {
          yield item;
        }
      }
    }());
  }
  
  take(n) {
    const source = this.iterable;
    return new LazyCollection(function* () {
      let count = 0;
      for (const item of source) {
        if (count >= n) break;
        yield item;
        count++;
      }
    }());
  }
  
  skip(n) {
    const source = this.iterable;
    return new LazyCollection(function* () {
      let count = 0;
      for (const item of source) {
        if (count++ < n) continue;
        yield item;
      }
    }());
  }
  
  // Combinatori
  concat(...others) {
    const sources = [this.iterable, ...others.map(o => o.iterable || o)];
    return new LazyCollection(function* () {
      for (const source of sources) {
        yield* source;
      }
    }());
  }
  
  zip(other, combiner = (a, b) => [a, b]) {
    const source1 = this.iterable;
    const source2 = other.iterable || other;
    
    return new LazyCollection(function* () {
      const it1 = source1[Symbol.iterator]();
      const it2 = source2[Symbol.iterator]();
      
      while (true) {
        const { value: v1, done: d1 } = it1.next();
        const { value: v2, done: d2 } = it2.next();
        
        if (d1 || d2) break;
        yield combiner(v1, v2);
      }
    }());
  }
  
  // Terminatori - eseguono la computazione e restituiscono un risultato
  toArray() {
    return [...this.iterable];
  }
  
  forEach(fn) {
    for (const item of this.iterable) {
      fn(item);
    }
  }
  
  reduce(fn, initial) {
    let acc = initial;
    let firstItem = true;
    
    for (const item of this.iterable) {
      // Se non è stato fornito un valore iniziale, usa il primo elemento
      if (firstItem && arguments.length < 2) {
        acc = item;
        firstItem = false;
        continue;
      }
      
      acc = fn(acc, item);
      firstItem = false;
    }
    
    return acc;
  }
  
  find(predicate) {
    for (const item of this.iterable) {
      if (predicate(item)) {
        return item;
      }
    }
    return undefined;
  }
  
  every(predicate) {
    for (const item of this.iterable) {
      if (!predicate(item)) {
        return false;
      }
    }
    return true;
  }
  
  some(predicate) {
    for (const item of this.iterable) {
      if (predicate(item)) {
        return true;
      }
    }
    return false;
  }
  
  // Iterator protocol
  [Symbol.iterator]() {
    return this.iterable[Symbol.iterator]();
  }
}

// ========================================================
// 2. Esempi di utilizzo di LazyCollection
// ========================================================

console.log('=== LazyCollection Esempi ===');

// Esempio 1: Elaborazione base
console.log('\nEsempio 1: Quadrati dei primi 5 numeri naturali');
const squares = LazyCollection.from(naturalNumbers())
  .map(x => x * x)
  .take(5)
  .toArray();
console.log(squares);

// Esempio 2: Filtro
console.log('\nEsempio 2: Primi 5 numeri naturali pari');
const evens = LazyCollection.from(naturalNumbers())
  .filter(x => x % 2 === 0)
  .take(5)
  .toArray();
console.log(evens);

// Esempio 3: Range e reduce
console.log('\nEsempio 3: Somma dei numeri da 1 a 10');
const sum = LazyCollection.range(1, 10, 1)
  .reduce((acc, x) => acc + x, 0);
console.log(sum);

// Esempio 4: Concatenazione
console.log('\nEsempio 4: Concatenazione di sequenze');
const sequence = LazyCollection.range(1, 3, 1)
  .concat(LazyCollection.repeat('X', 2), [7, 8, 9])
  .toArray();
console.log(sequence);

// Esempio 5: Zip
console.log('\nEsempio 5: Zip di due sequenze');
const zipped = LazyCollection.from(naturalNumbers())
  .zip(fibonacci(), (a, b) => ({ index: a, fib: b }))
  .take(5)
  .toArray();
console.log(zipped);

// ========================================================
// 3. Generator Pipelines - Componibilità
// ========================================================

console.log('\n=== Generator Pipelines ===');

// Definiamo alcune utility functions per generator pipelines
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

function* takeWhile(iterable, predicate) {
  for (const item of iterable) {
    if (!predicate(item)) break;
    yield item;
  }
}

function* dropWhile(iterable, predicate) {
  let dropping = true;
  for (const item of iterable) {
    if (dropping && !predicate(item)) {
      dropping = false;
    }
    
    if (!dropping) {
      yield item;
    }
  }
}

function* scan(iterable, fn, initial) {
  let acc = initial;
  yield acc;
  
  for (const item of iterable) {
    acc = fn(acc, item);
    yield acc;
  }
}

console.log('\nEsempio Pipeline: Primi termini della sequenza di Fibonacci che sono < 1000');

// Creiamo una pipeline di generatori
const pipeline = pipe(
  iterable => takeWhile(iterable, n => n < 1000),
  iterable => mapGen(iterable, n => ({ value: n, isEven: n % 2 === 0 }))
);

const fibPipeline = pipeline(fibonacci());
const result = [];
for (const item of fibPipeline) {
  result.push(item);
}
console.log(result);

// ========================================================
// 4. State Machine con Generatori
// ========================================================

console.log('\n=== State Machine con Generatori ===');

function* trafficLight() {
  while (true) {
    yield 'red';
    yield 'yellow';
    yield 'green';
    yield 'yellow';
  }
}

console.log('Sequenza semaforo:');
const light = trafficLight();
for (let i = 0; i < 6; i++) {
  console.log(light.next().value);
}

// ========================================================
// 5. Ricorsione Lazy
// ========================================================

console.log('\n=== Ricorsione Lazy ===');

// TreeNode per alberi con nodi potenzialmente infiniti
class TreeNode {
  constructor(value, getChildren) {
    this.value = value;
    // getChildren è una funzione lazy che genera i figli solo quando necessario
    this.getChildren = getChildren;
  }
  
  // Attraversamento in profondità (DFS) lazy
  *dfs() {
    yield this.value;
    for (const child of this.getChildren()) {
      yield* child.dfs();
    }
  }
  
  // Attraversamento in ampiezza (BFS) lazy
  *bfs() {
    const queue = [this];
    
    while (queue.length > 0) {
      const node = queue.shift();
      yield node.value;
      
      for (const child of node.getChildren()) {
        queue.push(child);
      }
    }
  }
}

// Crea un albero infinito di numeri naturali dove ogni nodo ha come figli i suoi multipli
function createNumberTree(value) {
  return new TreeNode(value, function* () {
    // Genera i primi 3 multipli maggiori del nodo corrente
    for (let i = 1; i <= 3; i++) {
      yield createNumberTree(value * 10 + i);
    }
  });
}

console.log('\nDFS su albero numerico (primi 10 nodi):');
const tree = createNumberTree(0);
const dfsIterator = tree.dfs();
for (let i = 0; i < 10; i++) {
  console.log(dfsIterator.next().value);
}

console.log('\nBFS su albero numerico (primi 10 nodi):');
const bfsIterator = tree.bfs();
for (let i = 0; i < 10; i++) {
  console.log(bfsIterator.next().value);
}

// ========================================================
// 6. Comunicazione Bidirezionale con Generatori
// ========================================================

console.log('\n=== Comunicazione Bidirezionale ===');

function* dataProcessor() {
  let sum = 0;
  let count = 0;
  let value;
  
  while (true) {
    // Ricevi il valore e invia lo stato corrente
    value = yield {
      sum,
      count,
      average: count > 0 ? sum / count : 0,
      lastValue: value
    };
    
    if (value === null) break;
    
    sum += value;
    count++;
  }
  
  return {
    sum,
    count,
    average: count > 0 ? sum / count : 0
  };
}

const processor = dataProcessor();
// La prima chiamata a next() avvia il generatore, ma non viene processato nessun valore
console.log(processor.next());

// Inviamo valori e otteniamo statistiche aggiornate
console.log(processor.next(10));
console.log(processor.next(20));
console.log(processor.next(30));
console.log(processor.next(40));

// Terminiamo il generatore
console.log(processor.next(null));

// ========================================================
// Esportazione
// ========================================================

module.exports = {
  LazyCollection,
  takeWhile,
  dropWhile,
  scan,
  pipe,
  TreeNode,
  createNumberTree
};

console.log('\nTutti gli esempi di pattern di iterazione completati!');
