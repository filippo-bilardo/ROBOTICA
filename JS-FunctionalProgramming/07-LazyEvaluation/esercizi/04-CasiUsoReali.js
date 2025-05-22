/**
 * Esercizio 4: Casi d'Uso Reali
 * 
 * In questo esercizio, applicherai lazy evaluation a problemi reali.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { EventEmitter } = require('events');

// Alcuni operatori dai precedenti esercizi
const { map, filter, reduce, chain } = require('./02-OperatoriSequenze');
const { range, take } = require('./01-SequenzeBase');

/**
 * Esercizio 4.1: Stream Reader Lazy
 * 
 * Implementa una funzione che legge un file in modo lazy, riga per riga,
 * senza caricare l'intero file in memoria.
 * 
 * @param {string} filePath - Il percorso del file da leggere
 * @returns {AsyncGenerator} - Un generatore asincrono che produce le righe del file
 */
async function* lazyFileReader(filePath) {
  // Implementa la funzione
}

/**
 * Esercizio 4.2: Event Stream Processor
 * 
 * Implementa una funzione che trasforma un EventEmitter in uno stream lazy
 * di eventi, con possibilità di filtro.
 * 
 * @param {EventEmitter} emitter - L'emitter di eventi
 * @param {string} eventName - Il nome dell'evento da ascoltare
 * @param {Function} [filterFn] - Opzionale: funzione di filtro per gli eventi
 * @returns {AsyncGenerator} - Un generatore asincrono di eventi
 */
async function* eventStream(emitter, eventName, filterFn = null) {
  // Implementa la funzione
}

/**
 * Esercizio 4.3: Lazy Pagination API Client
 * 
 * Implementa un client API che recupera dati in modo paginato e li espone
 * come un singolo stream lazy.
 * 
 * @param {string} baseUrl - L'URL base dell'API
 * @param {Object} queryParams - Parametri di query per l'API
 * @param {number} pageSize - Dimensione di ciascuna pagina
 * @returns {AsyncGenerator} - Un generatore asincrono di elementi
 */
async function* lazyPaginatedApi(baseUrl, queryParams = {}, pageSize = 10) {
  // Implementa la funzione
  // Nota: per questo esercizio, simula le chiamate API invece di farle realmente
  // Esempio: simula una chiamata API che restituisce risultati paginati
}

/**
 * Esercizio 4.4: Lazy Data Transformation Pipeline
 * 
 * Implementa una pipeline di trasformazione dati lazy che prende un flusso di
 * oggetti dati, li filtra, trasforma, raggruppa e produce un risultato.
 * 
 * @param {AsyncIterable} dataStream - Lo stream di dati in ingresso
 * @param {Object} options - Opzioni di configurazione per la pipeline
 * @returns {AsyncGenerator} - Un generatore asincrono di risultati trasformati
 */
async function* dataTransformPipeline(dataStream, options = {}) {
  const {
    filterFn = () => true,
    mapFn = item => item,
    groupByFn = null,
    limit = Infinity
  } = options;
  
  // Implementa la funzione
}

/**
 * Esercizio 4.5: Lazy Tree Crawler
 * 
 * Implementa un crawler di directory lazy che attraversa ricorsivamente
 * una struttura di directory e produce tutti i file che corrispondono a un pattern.
 * 
 * @param {string} rootDir - La directory di partenza
 * @param {RegExp} pattern - Pattern per filtrare i file
 * @returns {AsyncGenerator} - Un generatore asincrono di percorsi di file
 */
async function* lazyCrawlDirectory(rootDir, pattern) {
  // Implementa la funzione
}

// Alcune funzioni per testare le implementazioni

/**
 * Crea un file di testo temporaneo per test
 */
async function createTempFile(lines = 100) {
  const tempDir = path.join(__dirname, 'temp');
  const filePath = path.join(tempDir, 'test_file.txt');
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  const stream = fs.createWriteStream(filePath);
  for (let i = 0; i < lines; i++) {
    stream.write(`Linea ${i + 1}: ${Math.random().toString(36).substring(2)}\n`);
  }
  
  await new Promise(resolve => {
    stream.end();
    stream.on('finish', resolve);
  });
  
  return filePath;
}

/**
 * Testa lazyFileReader
 */
async function testLazyFileReader() {
  console.log('\n=== Test lazyFileReader ===');
  
  try {
    const filePath = await createTempFile();
    console.log(`File creato: ${filePath}`);
    
    let count = 0;
    for await (const line of lazyFileReader(filePath)) {
      if (count < 5) {
        console.log(`Linea letta: ${line}`);
      }
      count++;
      if (count >= 10) break;
    }
    
    console.log(`Lette ${count} righe in totale`);
    
    // Pulisci il file temporaneo
    fs.unlinkSync(filePath);
    fs.rmdirSync(path.dirname(filePath));
  } catch (error) {
    console.error('Errore nel testLazyFileReader:', error);
  }
}

/**
 * Testa eventStream
 */
async function testEventStream() {
  console.log('\n=== Test eventStream ===');
  
  const emitter = new EventEmitter();
  let eventCount = 0;
  
  // Avvia lo stream di eventi
  const stream = eventStream(emitter, 'data', data => data.value > 0);
  
  // Pianifica l'emissione di alcuni eventi
  setTimeout(() => emitter.emit('data', { id: 1, value: 10 }), 100);
  setTimeout(() => emitter.emit('data', { id: 2, value: -5 }), 200);
  setTimeout(() => emitter.emit('data', { id: 3, value: 20 }), 300);
  setTimeout(() => emitter.emit('data', { id: 4, value: 0 }), 400);
  setTimeout(() => emitter.emit('data', { id: 5, value: 15 }), 500);
  
  // Leggi alcuni eventi
  console.log('Leggendo eventi...');
  for await (const event of stream) {
    console.log('Evento ricevuto:', event);
    eventCount++;
    if (eventCount >= 3) break;
  }
  
  console.log(`Ricevuti ${eventCount} eventi (dovrebbero essere 3 con valori positivi)`);
}

/**
 * Testa lazyPaginatedApi
 */
async function testLazyPaginatedApi() {
  console.log('\n=== Test lazyPaginatedApi ===');
  
  try {
    const api = lazyPaginatedApi('https://api.example.com/items', { category: 'books' }, 10);
    
    console.log('Recuperando i primi 15 elementi...');
    let count = 0;
    for await (const item of api) {
      console.log(`Item ${count + 1}:`, item.id);
      count++;
      if (count >= 15) break;
    }
    
    console.log(`Recuperati ${count} elementi`);
  } catch (error) {
    console.error('Errore nel testLazyPaginatedApi:', error);
  }
}

/**
 * Testa dataTransformPipeline
 */
async function testDataTransformPipeline() {
  console.log('\n=== Test dataTransformPipeline ===');
  
  // Crea uno stream di dati di esempio
  async function* sampleDataStream() {
    const data = [
      { id: 1, type: 'user', name: 'Alice', age: 25 },
      { id: 2, type: 'admin', name: 'Bob', age: 30 },
      { id: 3, type: 'user', name: 'Charlie', age: 35 },
      { id: 4, type: 'user', name: 'Diana', age: 28 },
      { id: 5, type: 'admin', name: 'Eve', age: 32 },
      { id: 6, type: 'user', name: 'Frank', age: 22 },
      { id: 7, type: 'guest', name: 'Grace', age: 27 }
    ];
    
    for (const item of data) {
      // Simula un ritardo di rete
      await new Promise(resolve => setTimeout(resolve, 50));
      yield item;
    }
  }
  
  // Configurazione della pipeline
  const options = {
    filterFn: item => item.age >= 25,
    mapFn: item => ({ 
      id: item.id,
      displayName: item.name.toUpperCase(),
      role: item.type,
      ageGroup: item.age < 30 ? 'young' : 'senior'
    }),
    limit: 5
  };
  
  // Esegui la pipeline
  try {
    const transformedData = [];
    for await (const item of dataTransformPipeline(sampleDataStream(), options)) {
      transformedData.push(item);
      console.log('Item trasformato:', item);
    }
    
    console.log(`Trasformati ${transformedData.length} elementi`);
  } catch (error) {
    console.error('Errore nel testDataTransformPipeline:', error);
  }
}

/**
 * Testa lazyCrawlDirectory
 */
async function testLazyCrawlDirectory() {
  console.log('\n=== Test lazyCrawlDirectory ===');
  
  // Crea una struttura di directory di test
  const tempDir = path.join(__dirname, 'temp_dir');
  const subDir1 = path.join(tempDir, 'subdir1');
  const subDir2 = path.join(tempDir, 'subdir2');
  const subDir3 = path.join(subDir1, 'subdir3');
  
  try {
    // Crea le directory
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    if (!fs.existsSync(subDir1)) fs.mkdirSync(subDir1);
    if (!fs.existsSync(subDir2)) fs.mkdirSync(subDir2);
    if (!fs.existsSync(subDir3)) fs.mkdirSync(subDir3);
    
    // Crea alcuni file
    fs.writeFileSync(path.join(tempDir, 'file1.txt'), 'test1');
    fs.writeFileSync(path.join(tempDir, 'file2.js'), 'test2');
    fs.writeFileSync(path.join(subDir1, 'file3.txt'), 'test3');
    fs.writeFileSync(path.join(subDir1, 'file4.js'), 'test4');
    fs.writeFileSync(path.join(subDir2, 'file5.txt'), 'test5');
    fs.writeFileSync(path.join(subDir3, 'file6.js'), 'test6');
    
    console.log('Struttura di test creata.');
    console.log('Cercando file .js...');
    
    // Test il crawler
    let count = 0;
    for await (const filePath of lazyCrawlDirectory(tempDir, /\.js$/)) {
      console.log('Trovato file JS:', filePath);
      count++;
    }
    
    console.log(`Trovati ${count} file .js (dovrebbero essere 3)`);
    
    // Pulisci i file temporanei
    fs.unlinkSync(path.join(tempDir, 'file1.txt'));
    fs.unlinkSync(path.join(tempDir, 'file2.js'));
    fs.unlinkSync(path.join(subDir1, 'file3.txt'));
    fs.unlinkSync(path.join(subDir1, 'file4.js'));
    fs.unlinkSync(path.join(subDir2, 'file5.txt'));
    fs.unlinkSync(path.join(subDir3, 'file6.js'));
    
    fs.rmdirSync(subDir3);
    fs.rmdirSync(subDir1);
    fs.rmdirSync(subDir2);
    fs.rmdirSync(tempDir);
    
    console.log('Struttura di test rimossa.');
  } catch (error) {
    console.error('Errore nel testLazyCrawlDirectory:', error);
  }
}

/**
 * Esercizio 4.6 (Bonus): Cache Manager Lazy
 * 
 * Implementa un gestore di cache lazy che carica risorse in modo lazy
 * e le espelle in base a una politica LRU (Least Recently Used).
 */
class LazyCacheManager {
  constructor(options = {}) {
    // Implementa il costruttore
  }
  
  /**
   * Ottiene una risorsa dalla cache, caricandola se necessario
   * @param {string} key - Chiave della risorsa
   * @param {Function} loader - Funzione per caricare la risorsa se non presente
   */
  async get(key, loader) {
    // Implementa il metodo
  }
  
  /**
   * Invalida una risorsa nella cache
   */
  invalidate(key) {
    // Implementa il metodo
  }
  
  /**
   * Pulisce la cache secondo la politica LRU
   */
  cleanup() {
    // Implementa il metodo
  }
}

// Test per LazyCacheManager
async function testLazyCacheManager() {
  console.log('\n=== Test LazyCacheManager ===');
  
  const cache = new LazyCacheManager({ maxSize: 3 });
  
  // Simula una funzione di caricamento costosa
  async function expensiveLoader(id) {
    console.log(`Caricamento risorsa ${id}...`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return { id, data: `Data for ${id}` };
  }
  
  console.log('Test di caricamento e caching:');
  console.log(await cache.get('A', () => expensiveLoader('A'))); // Caricamento
  console.log(await cache.get('B', () => expensiveLoader('B'))); // Caricamento
  console.log(await cache.get('A', () => expensiveLoader('A'))); // Cache hit
  console.log(await cache.get('C', () => expensiveLoader('C'))); // Caricamento
  console.log(await cache.get('D', () => expensiveLoader('D'))); // Caricamento + espulsione LRU
  console.log(await cache.get('B', () => expensiveLoader('B'))); // Dovrebbe essere un cache miss perché B è stato espulso
  
  console.log('Cache test completato.');
}

// Esegui tutti i test
async function runAllTests() {
  await testLazyFileReader();
  await testEventStream();
  await testLazyPaginatedApi();
  await testDataTransformPipeline();
  await testLazyCrawlDirectory();
  await testLazyCacheManager();
  
  console.log('\nTutti i test completati!');
}

// Esegui i test se questo file viene eseguito direttamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  lazyFileReader,
  eventStream,
  lazyPaginatedApi,
  dataTransformPipeline,
  lazyCrawlDirectory,
  LazyCacheManager
};
