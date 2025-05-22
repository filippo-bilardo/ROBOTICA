/**
 * Soluzioni per il Modulo 07 - Lazy Evaluation
 * 
 * Questo file contiene le implementazioni per tutti gli esercizi del modulo.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');
const { EventEmitter } = require('events');

// ----- Esercizio 1: Sequenze Base ----- //

/**
 * Implementa un generatore che produce una sequenza di numeri
 * da start a end (inclusi) con il passo specificato.
 */
function* range(start, end, step = 1) {
  if ((step > 0 && start <= end) || (step < 0 && start >= end)) {
    let current = start;
    if (step > 0) {
      while (current <= end) {
        yield current;
        current += step;
      }
    } else {
      while (current >= end) {
        yield current;
        current += step;
      }
    }
  }
}

/**
 * Crea un generatore che produca i numeri della sequenza di Fibonacci.
 */
function* fibonacci() {
  let [a, b] = [0, 1];
  yield a;
  yield b;
  while (true) {
    const next = a + b;
    yield next;
    [a, b] = [b, next];
  }
}

/**
 * Implementa un generatore che prende i primi n elementi da un iterabile.
 */
function* take(iterable, n) {
  let count = 0;
  for (const item of iterable) {
    if (count >= n) break;
    yield item;
    count++;
  }
}

/**
 * Crea un generatore che cicla indefinitamente sugli elementi di un iterabile.
 */
function* cycle(iterable) {
  // Memorizza gli elementi per poterli ciclare
  const items = [...iterable];
  if (items.length === 0) return;
  
  while (true) {
    for (const item of items) {
      yield item;
    }
  }
}

/**
 * Crea un generatore che combina elementi corrispondenti di più iterabili.
 */
function* zip(...iterables) {
  // Crea un array di iteratori da tutti gli iterabili
  const iterators = iterables.map(iterable => iterable[Symbol.iterator]());
  
  while (true) {
    // Ottieni il prossimo valore da ogni iteratore
    const values = iterators.map(iterator => iterator.next());
    
    // Se uno qualsiasi degli iteratori ha terminato, termina la zip
    if (values.some(result => result.done)) {
      return;
    }
    
    // Yield un array dei valori correnti
    yield values.map(result => result.value);
  }
}

/**
 * Crea un generatore che appiattisce un array annidato a qualsiasi profondità.
 */
function* flatten(nestedArray) {
  for (const item of nestedArray) {
    if (Array.isArray(item)) {
      // Se l'elemento è un array, lo attraversiamo ricorsivamente
      yield* flatten(item);
    } else {
      yield item;
    }
  }
}

// ----- Esercizio 2: Operatori su Sequenze ----- //

/**
 * Implementa un generatore che applica una funzione a ciascun elemento di un iterabile.
 */
function* map(iterable, mapFn) {
  for (const item of iterable) {
    yield mapFn(item);
  }
}

/**
 * Implementa un generatore che filtra gli elementi di un iterabile in base a un predicato.
 */
function* filter(iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

/**
 * Implementa un generatore che preleva elementi da un iterabile fino a quando
 * un predicato restituisce false.
 */
function* takeWhile(iterable, predicate) {
  for (const item of iterable) {
    if (!predicate(item)) {
      return;
    }
    yield item;
  }
}

/**
 * Implementa un generatore che scarta elementi da un iterabile fino a quando
 * un predicato restituisce false, poi produce tutti gli elementi rimanenti.
 */
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

/**
 * Implementa una funzione che applica una funzione di riduzione
 * agli elementi di un iterabile.
 */
function reduce(iterable, reducer, initialValue) {
  let accumulator = initialValue;
  let iterator = iterable[Symbol.iterator]();
  let result = iterator.next();
  
  // Se non è stato fornito un valore iniziale e l'iterabile non è vuoto,
  // usa il primo elemento come valore iniziale
  if (initialValue === undefined) {
    if (result.done) {
      throw new TypeError('Reduce of empty iterable with no initial value');
    }
    accumulator = result.value;
    result = iterator.next();
  }
  
  // Applica il reducer a ciascun elemento
  while (!result.done) {
    accumulator = reducer(accumulator, result.value);
    result = iterator.next();
  }
  
  return accumulator;
}

/**
 * Implementa un generatore che produce i risultati intermedi dell'applicazione
 * di una funzione di riduzione a un iterabile.
 */
function* scan(iterable, reducer, initialValue) {
  let accumulator = initialValue;
  yield accumulator;
  
  for (const item of iterable) {
    accumulator = reducer(accumulator, item);
    yield accumulator;
  }
}

/**
 * Implementa un generatore che raggruppa elementi consecutivi di un iterabile
 * in array in base a un predicato di uguaglianza.
 */
function* chunkBy(iterable, equalityFn = (a, b) => a === b) {
  const iterator = iterable[Symbol.iterator]();
  const first = iterator.next();
  
  if (first.done) return;
  
  let currentChunk = [first.value];
  let lastValue = first.value;
  
  for (const value of {[Symbol.iterator]() { return iterator; }}) {
    if (equalityFn(lastValue, value)) {
      currentChunk.push(value);
    } else {
      yield currentChunk;
      currentChunk = [value];
    }
    lastValue = value;
  }
  
  // Non dimenticare l'ultimo chunk
  if (currentChunk.length > 0) {
    yield currentChunk;
  }
}

/**
 * Implementa una funzione che concatena più iterabili in un'unica sequenza.
 */
function* chain(...iterables) {
  for (const iterable of iterables) {
    yield* iterable;
  }
}

/**
 * Implementa una funzione pipe che prende un iterabile e una sequenza di funzioni
 * generatori, e restituisce un nuovo iterabile che è il risultato dell'applicazione
 * di tutte le funzioni generatori in sequenza.
 */
function pipe(iterable, ...fns) {
  return fns.reduce((result, fn) => fn(result), iterable);
}

// ----- Esercizio 3: Generatori Avanzati ----- //

/**
 * Implementa una funzione generatore che attraversa un albero in modo DFS (profondità).
 */
function* traverseTree(tree) {
  if (!tree) return;
  
  yield tree.value;
  
  if (tree.children && tree.children.length) {
    for (const child of tree.children) {
      yield* traverseTree(child);
    }
  }
}

/**
 * Implementa una funzione generatore che attraversa un albero in modo BFS (ampiezza).
 */
function* traverseTreeBFS(tree) {
  if (!tree) return;
  
  // Utilizziamo una coda per l'attraversamento BFS
  const queue = [tree];
  
  while (queue.length > 0) {
    const node = queue.shift();
    yield node.value;
    
    if (node.children && node.children.length) {
      for (const child of node.children) {
        queue.push(child);
      }
    }
  }
}

/**
 * Implementa un generatore che riceve valori tramite next() e li elabora.
 * Il generatore deve mantenere una somma corrente e restituire statistiche.
 */
function* statefulGenerator() {
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  
  // Prima yield senza alcun input
  let input = yield { sum, min, max };
  
  while (true) {
    // Aggiorna le statistiche con l'input
    sum += input;
    min = Math.min(min, input);
    max = Math.max(max, input);
    
    // Yield del risultato e attesa del prossimo input
    input = yield { sum, min, max };
  }
}

/**
 * Implementa un generatore che applica una funzione map a tutti gli elementi
 * prodotti da più generatori usando yield*.
 */
function* mapAllGenerators(mapFn, ...generators) {
  for (const generator of generators) {
    yield* map(generator, mapFn);
  }
}

/**
 * Implementa una funzione che crea un generatore con memoization
 * per calcoli costosi.
 */
function* memoizedGenerator(calculationFn, inputGen) {
  // Cache per i risultati calcolati
  const cache = new Map();
  
  for (const input of inputGen) {
    // Controlla se il risultato è già in cache
    if (!cache.has(input)) {
      // Se non è in cache, esegui il calcolo e memorizzalo
      cache.set(input, calculationFn(input));
    }
    
    // Yield del valore memorizzato
    yield cache.get(input);
  }
}

/**
 * Implementa un sistema di coroutine usando generatori che permetta
 * l'esecuzione cooperativa di più task.
 */
class Scheduler {
  constructor() {
    this.tasks = [];
    this.currentTask = 0;
  }
  
  addTask(generatorFn) {
    this.tasks.push(generatorFn());
    return this.tasks.length - 1; // Restituisce l'indice del task
  }
  
  run(maxSteps = Infinity) {
    let steps = 0;
    
    while (steps < maxSteps && this.tasks.length > 0) {
      // Ottieni il task corrente
      const taskIndex = this.currentTask % this.tasks.length;
      const task = this.tasks[taskIndex];
      
      // Esegui un passo del task
      const result = task.next();
      
      // Rimuovi il task se è completo
      if (result.done) {
        this.tasks.splice(taskIndex, 1);
        
        // Assicurati che l'indice del task corrente sia ancora valido
        if (this.tasks.length === 0) break;
        this.currentTask = this.currentTask % this.tasks.length;
      } else {
        // Passa al task successivo
        this.currentTask = (this.currentTask + 1) % this.tasks.length;
      }
      
      steps++;
    }
    
    return this.tasks.length > 0; // Restituisce true se ci sono ancora task in esecuzione
  }
}

// ----- Esercizio 4: Casi d'Uso Reali ----- //

/**
 * Implementa una funzione che legge un file in modo lazy, riga per riga,
 * senza caricare l'intero file in memoria.
 */
async function* lazyFileReader(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });
  
  for await (const line of rl) {
    yield line;
  }
}

/**
 * Implementa una funzione che trasforma un EventEmitter in uno stream lazy
 * di eventi, con possibilità di filtro.
 */
async function* eventStream(emitter, eventName, filterFn = null) {
  // Crea una promise che si risolve quando l'evento viene emesso
  const nextEvent = () => new Promise(resolve => {
    emitter.once(eventName, resolve);
  });
  
  while (true) {
    // Attendi il prossimo evento
    const event = await nextEvent();
    
    // Se è stato fornito un filtro, verifica che l'evento lo soddisfi
    if (!filterFn || filterFn(event)) {
      yield event;
    }
  }
}

/**
 * Implementa un client API che recupera dati in modo paginato e li espone
 * come un singolo stream lazy.
 */
async function* lazyPaginatedApi(baseUrl, queryParams = {}, pageSize = 10) {
  let page = 1;
  let hasMoreData = true;
  
  while (hasMoreData) {
    // Simulazione di una chiamata API paginata
    const data = await simulateApiCall(baseUrl, { ...queryParams, page, pageSize });
    
    // Se non ci sono più dati, interrompi
    if (!data.items || data.items.length === 0) {
      hasMoreData = false;
      continue;
    }
    
    // Yield di ciascun elemento della pagina corrente
    for (const item of data.items) {
      yield item;
    }
    
    // Passa alla pagina successiva
    page++;
  }
}

// Funzione helper per simulare chiamate API
async function simulateApiCall(baseUrl, params) {
  // Simula un ritardo di rete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simula dati paginati
  const { page, pageSize } = params;
  const totalItems = 50; // Simulazione: abbiamo 50 risultati totali
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  
  // Se abbiamo superato il numero totale di elementi, restituisce un array vuoto
  if (startIdx >= totalItems) {
    return { items: [] };
  }
  
  // Crea un array di elementi fittizi
  const items = Array.from({ length: endIdx - startIdx }, (_, idx) => ({
    id: startIdx + idx + 1,
    name: `Item ${startIdx + idx + 1}`,
    category: params.category || 'general'
  }));
  
  return {
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize)
    }
  };
}

/**
 * Implementa una pipeline di trasformazione dati lazy che prende un flusso di
 * oggetti dati, li filtra, trasforma, raggruppa e produce un risultato.
 */
async function* dataTransformPipeline(dataStream, options = {}) {
  const {
    filterFn = () => true,
    mapFn = item => item,
    groupByFn = null,
    limit = Infinity
  } = options;
  
  let count = 0;
  const groupedData = new Map();
  
  for await (const item of dataStream) {
    // Controlla il limite
    if (count >= limit) break;
    
    // Applica il filtro
    if (!filterFn(item)) continue;
    
    // Applica la trasformazione
    const transformedItem = mapFn(item);
    
    // Se è richiesto il raggruppamento
    if (groupByFn) {
      const key = groupByFn(transformedItem);
      if (!groupedData.has(key)) {
        groupedData.set(key, []);
      }
      groupedData.get(key).push(transformedItem);
    } else {
      // Altrimenti, yield direttamente l'elemento trasformato
      yield transformedItem;
      count++;
    }
  }
  
  // Se abbiamo raggruppato i dati, yield i gruppi
  if (groupByFn) {
    for (const [key, items] of groupedData.entries()) {
      if (count >= limit) break;
      yield { key, items };
      count++;
    }
  }
}

/**
 * Implementa un crawler di directory lazy che attraversa ricorsivamente
 * una struttura di directory e produce tutti i file che corrispondono a un pattern.
 */
async function* lazyCrawlDirectory(rootDir, pattern) {
  // Leggi il contenuto della directory corrente
  const entries = await fs.promises.readdir(rootDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    
    if (entry.isDirectory()) {
      // Se è una directory, attraversala ricorsivamente
      yield* lazyCrawlDirectory(fullPath, pattern);
    } else if (entry.isFile() && pattern.test(entry.name)) {
      // Se è un file che corrisponde al pattern, yield il suo percorso
      yield fullPath;
    }
  }
}

/**
 * Implementa un gestore di cache lazy che carica risorse in modo lazy
 * e le espelle in base a una politica LRU (Least Recently Used).
 */
class LazyCacheManager {
  constructor(options = {}) {
    // Dimensione massima della cache (default: 100)
    this.maxSize = options.maxSize || 100;
    
    // Cache per le risorse
    this.cache = new Map();
    
    // Ordine di utilizzo per LRU
    this.usageOrder = [];
  }
  
  /**
   * Ottiene una risorsa dalla cache, caricandola se necessario
   */
  async get(key, loader) {
    // Controlla se esiste già nella cache
    if (this.cache.has(key)) {
      // Aggiorna l'ordine di utilizzo (MRU)
      this._updateUsageOrder(key);
      return this.cache.get(key);
    }
    
    // Carica la risorsa
    const resource = await loader(key);
    
    // Salva nella cache
    this.cache.set(key, resource);
    this.usageOrder.push(key);
    
    // Pulisce la cache se necessario
    if (this.cache.size > this.maxSize) {
      this.cleanup();
    }
    
    return resource;
  }
  
  /**
   * Invalida una risorsa nella cache
   */
  invalidate(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.usageOrder = this.usageOrder.filter(k => k !== key);
      return true;
    }
    return false;
  }
  
  /**
   * Pulisce la cache secondo la politica LRU
   */
  cleanup() {
    // Rimuovi le risorse meno recentemente utilizzate
    while (this.cache.size > this.maxSize) {
      const lruKey = this.usageOrder.shift();
      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }
  }
  
  /**
   * Aggiorna l'ordine di utilizzo per LRU
   */
  _updateUsageOrder(key) {
    this.usageOrder = this.usageOrder.filter(k => k !== key);
    this.usageOrder.push(key);
  }
}

// Esporta tutte le funzioni e classi
module.exports = {
  // Esercizio 1
  range,
  fibonacci,
  take,
  cycle,
  zip,
  flatten,
  
  // Esercizio 2
  map,
  filter,
  takeWhile,
  dropWhile,
  reduce,
  scan,
  chunkBy,
  chain,
  pipe,
  
  // Esercizio 3
  traverseTree,
  traverseTreeBFS,
  statefulGenerator,
  mapAllGenerators,
  memoizedGenerator,
  Scheduler,
  
  // Esercizio 4
  lazyFileReader,
  eventStream,
  lazyPaginatedApi,
  dataTransformPipeline,
  lazyCrawlDirectory,
  LazyCacheManager
};
