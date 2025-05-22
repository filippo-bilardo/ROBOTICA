/**
 * Applicazioni Pratiche della Lazy Evaluation
 * 
 * Questo file dimostra casi d'uso reali della lazy evaluation
 * in contesti pratici come elaborazione dati, streaming, e UI.
 */

// Importiamo utility dai moduli precedenti
const { LazyCollection } = require('./03-PatternIterazione');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// ========================================================
// 1. Elaborazione di File di Grandi Dimensioni
// ========================================================

console.log('=== Elaborazione File di Grandi Dimensioni ===');

/**
 * Questa funzione legge un file di testo grande linea per linea
 * senza caricarlo interamente in memoria.
 * Per test, creiamo prima un file grande.
 */
function processLargeFile(filePath, lineFn) {
  const fileReader = {
    [Symbol.asyncIterator]: async function*() {
      const fileHandle = await fs.promises.open(filePath, 'r');
      try {
        const reader = fileHandle.createReadStream();
        let remainder = '';
        
        for await (const chunk of reader) {
          const content = remainder + chunk.toString();
          const lines = content.split('\n');
          remainder = lines.pop() || '';
          
          for (const line of lines) {
            yield line;
          }
        }
        
        if (remainder) {
          yield remainder;
        }
      } finally {
        await fileHandle.close();
      }
    }
  };
  
  return fileReader;
}

// Creiamo un file temporaneo di test
async function createLargeTestFile() {
  const tempFilePath = path.join(__dirname, 'large_test_file.txt');
  const writeStream = fs.createWriteStream(tempFilePath);
  
  console.log(`Creazione file di test: ${tempFilePath}`);
  for (let i = 0; i < 100000; i++) {
    writeStream.write(`Linea ${i + 1}: ${'x'.repeat(50)}\n`);
  }
  
  await new Promise(resolve => {
    writeStream.end();
    writeStream.on('finish', resolve);
  });
  
  console.log('File di test creato.');
  return tempFilePath;
}

async function demonstrateLargeFileProcessing() {
  console.log('\n--- Elaborazione file di grandi dimensioni ---');
  
  try {
    // Crea un file temporaneo per il test
    const tempFilePath = await createLargeTestFile();
    
    console.log('Inizio elaborazione lazy del file...');
    const startTime = Date.now();
    
    let count = 0;
    let linesFetch = 0;
    
    for await (const line of processLargeFile(tempFilePath)) {
      if (linesFetch < 5) {
        console.log(`Esempio linea: ${line.substring(0, 40)}...`);
      }
      
      linesFetch++;
      if (line.includes('Linea 5')) {
        count++;
      }
      
      // Interrompiamo dopo 100 linee per questo esempio
      if (linesFetch >= 100) break;
    }
    
    console.log(`Tempo di elaborazione: ${Date.now() - startTime}ms`);
    console.log(`Linee elaborate: ${linesFetch}`);
    console.log(`Occorrenze trovate: ${count}`);
    
    // Pulire dopo il test
    fs.unlinkSync(tempFilePath);
    console.log('File di test rimosso.');
    
  } catch (error) {
    console.error('Errore durante l\'elaborazione del file:', error);
  }
}

// ========================================================
// 2. Stream di Eventi UI
// ========================================================

console.log('\n=== Stream di Eventi UI ===');

// Simulazione di eventi UI utilizzando EventEmitter
class UIEventSimulator extends EventEmitter {
  constructor() {
    super();
    this.running = false;
  }
  
  start() {
    if (this.running) return;
    
    this.running = true;
    
    // Genera eventi casuali
    this.intervalId = setInterval(() => {
      const eventTypes = ['click', 'mousemove', 'keypress', 'scroll'];
      const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const position = { x: Math.floor(Math.random() * 1000), y: Math.floor(Math.random() * 600) };
      
      this.emit(randomEvent, { 
        type: randomEvent,
        timestamp: Date.now(),
        position
      });
    }, 100);
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.running = false;
    }
  }
}

/**
 * Crea uno stream lazy dagli eventi UI
 */
function createEventStream(emitter, eventType) {
  return {
    [Symbol.asyncIterator]: async function*() {
      let buffer = [];
      let resolver = null;
      
      // Handler per gli eventi
      const handler = (event) => {
        buffer.push(event);
        if (resolver) {
          const r = resolver;
          resolver = null;
          r();
        }
      };
      
      // Registra il listener
      emitter.on(eventType, handler);
      
      try {
        while (true) {
          if (buffer.length === 0) {
            // Se il buffer è vuoto, attende il prossimo evento
            await new Promise(resolve => {
              resolver = resolve;
            });
          }
          
          // Yield il prossimo evento dal buffer
          yield buffer.shift();
        }
      } finally {
        emitter.off(eventType, handler);
      }
    }
  };
}

// Dimostra l'elaborazione lazy di eventi
async function demonstrateEventStreaming() {
  console.log('\n--- Elaborazione di stream di eventi UI ---');
  
  const simulator = new UIEventSimulator();
  
  console.log('Avvio simulatore di eventi...');
  simulator.start();
  
  // Crea stream per diversi tipi di eventi
  const clickStream = createEventStream(simulator, 'click');
  const mouseMoveStream = createEventStream(simulator, 'mousemove');
  
  // Funzione per processare gli eventi con timeout
  async function processEvents(stream, label, count) {
    console.log(`Inizio elaborazione eventi ${label}...`);
    let processed = 0;
    
    for await (const event of stream) {
      console.log(`Evento ${label} #${processed + 1}:`, event);
      
      processed++;
      if (processed >= count) break;
    }
    
    console.log(`Completata elaborazione di ${processed} eventi ${label}`);
  }
  
  // Elabora alcuni eventi in modo asincrono
  await Promise.all([
    processEvents(clickStream, 'click', 2),
    processEvents(mouseMoveStream, 'mousemove', 3)
  ]);
  
  // Ferma il simulatore
  simulator.stop();
  console.log('Simulatore fermato.');
}

// ========================================================
// 3. Lazy Pagination API
// ========================================================

console.log('\n=== Lazy Pagination API ===');

// Simula un'API paginata che restituisce risultati di ricerca
class PaginatedAPI {
  constructor(totalItems = 1000, pageSize = 20) {
    this.totalItems = totalItems;
    this.pageSize = pageSize;
    this.delay = 500; // ms di ritardo per simulare latenza di rete
  }
  
  // Simula una chiamata API per ottenere una pagina di risultati
  async getPage(page) {
    console.log(`Fetching page ${page}...`);
    
    // Simula latenza di rete
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
    
    // Genera risultati fittizi
    const results = [];
    for (let i = startIndex; i < endIndex; i++) {
      results.push({
        id: i + 1,
        name: `Item ${i + 1}`,
        description: `Description for item ${i + 1}`
      });
    }
    
    return {
      page,
      pageSize: this.pageSize,
      total: this.totalItems,
      totalPages: Math.ceil(this.totalItems / this.pageSize),
      results
    };
  }
}

/**
 * Crea un iteratore lazy che carica i risultati pagina per pagina
 */
function lazyPaginatedResults(api) {
  return {
    [Symbol.asyncIterator]: async function*() {
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await api.getPage(currentPage);
        
        // Yield ogni risultato individualmente
        for (const item of response.results) {
          yield item;
        }
        
        // Controlla se ci sono altre pagine
        hasMore = currentPage < response.totalPages;
        currentPage++;
      }
    }
  };
}

// Dimostra il caricamento lazy di dati paginati
async function demonstrateLazyPagination() {
  console.log('\n--- Lazy Pagination API ---');
  
  const api = new PaginatedAPI();
  const allResults = lazyPaginatedResults(api);
  
  console.log('Inizio ricerca di elementi...');
  
  // Cerca il primo elemento con ID divisibile per 37
  let found = null;
  let itemsProcessed = 0;
  
  console.log('Cercando elementi con ID divisibile per 37...');
  for await (const item of allResults) {
    itemsProcessed++;
    
    if (item.id % 37 === 0) {
      found = item;
      console.log(`Elemento trovato dopo aver processato ${itemsProcessed} items:`, found);
      break;
    }
    
    // Mostriamo solo i primi pochi elementi per brevità
    if (itemsProcessed <= 5) {
      console.log(`Checking item ${item.id}`);
    } else if (itemsProcessed % 20 === 0) {
      console.log(`Processed ${itemsProcessed} items...`);
    }
  }
  
  console.log(`Ricerca completata. Elementi processati: ${itemsProcessed}`);
  if (found) {
    console.log(`Elemento trovato: ID=${found.id}, Nome=${found.name}`);
  } else {
    console.log('Nessun elemento trovato che soddisfa i criteri.');
  }
}

// ========================================================
// 4. Lazy Tree Traversal
// ========================================================

console.log('\n=== Lazy Tree Traversal ===');

// Struttura dati albero dei file
class FileTreeNode {
  constructor(name, isDirectory = false, children = [], size = 0) {
    this.name = name;
    this.isDirectory = isDirectory;
    this.children = children;
    this.size = size;
  }
}

// Crea un filesystem fittizio per il test
function createMockFileSystem() {
  return new FileTreeNode('root', true, [
    new FileTreeNode('documents', true, [
      new FileTreeNode('report.pdf', false, [], 1024 * 1024 * 2), // 2MB
      new FileTreeNode('presentation.pptx', false, [], 1024 * 1024 * 5), // 5MB
      new FileTreeNode('projects', true, [
        new FileTreeNode('project1', true, [
          new FileTreeNode('source.js', false, [], 1024 * 10), // 10KB
          new FileTreeNode('README.md', false, [], 1024 * 2) // 2KB
        ]),
        new FileTreeNode('project2', true, [
          new FileTreeNode('index.html', false, [], 1024 * 5), // 5KB
          new FileTreeNode('styles.css', false, [], 1024 * 3) // 3KB
        ])
      ])
    ]),
    new FileTreeNode('downloads', true, [
      new FileTreeNode('image.jpg', false, [], 1024 * 1024 * 3), // 3MB
      new FileTreeNode('video.mp4', false, [], 1024 * 1024 * 100) // 100MB
    ]),
    new FileTreeNode('config.json', false, [], 1024) // 1KB
  ]);
}

// Funzione ricorsiva che genera un iteratore per attraversare l'albero in profondità (DFS)
function* traverseTree(node, path = '') {
  const nodePath = path ? `${path}/${node.name}` : node.name;
  
  // Yield il nodo corrente
  yield { node, path: nodePath };
  
  // Se è una directory, attraversa ricorsivamente i figli
  if (node.isDirectory) {
    for (const child of node.children) {
      yield* traverseTree(child, nodePath);
    }
  }
}

// Dimostra l'attraversamento lazy dell'albero
function demonstrateTreeTraversal() {
  console.log('\n--- Lazy Tree Traversal ---');
  
  const fileSystem = createMockFileSystem();
  const treeTraversal = traverseTree(fileSystem);
  
  console.log('Attraversamento albero file (primi 10 nodi):');
  
  // Estrai primi 10 nodi dall'iteratore
  for (let i = 0; i < 10; i++) {
    const next = treeTraversal.next();
    if (next.done) break;
    
    const { node, path } = next.value;
    console.log(
      `${path}${node.isDirectory ? '/' : ''} ` + 
      `${node.isDirectory ? '(directory)' : '(' + formatSize(node.size) + ')'}`
    );
  }
  
  // Trova file di grandi dimensioni
  console.log('\nCercando file di grandi dimensioni (>10MB)...');
  const largeFileSearch = LazyCollection.from(traverseTree(fileSystem))
    .filter(item => !item.node.isDirectory && item.node.size > 10 * 1024 * 1024)
    .map(item => ({ 
      path: item.path, 
      size: formatSize(item.node.size) 
    }))
    .toArray();
    
  console.log('File di grandi dimensioni trovati:', largeFileSearch);
}

// Formatta byte in formato leggibile
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// ========================================================
// 5. Lazy Database Query
// ========================================================

console.log('\n=== Lazy Database Query ===');

// Simula un database con dati di grandi dimensioni
class MockDatabase {
  constructor(recordCount = 1000000) {
    this.recordCount = recordCount;
    console.log(`Database creato con ${recordCount} record.`);
  }
  
  // Simula una query con paginazione
  async *lazyQuery(options = {}) {
    const { 
      batchSize = 100,
      filter = () => true,
      maxProcessedRecords = Infinity
    } = options;
    
    let recordsProcessed = 0;
    let recordsReturned = 0;
    
    for (let i = 0; i < this.recordCount && recordsProcessed < maxProcessedRecords; i++) {
      recordsProcessed++;
      
      // Simuliamo la generazione di un record
      const record = this.generateRecord(i);
      
      // Applichiamo il filtro
      if (filter(record)) {
        recordsReturned++;
        yield record;
      }
      
      // Simuliamo la latenza di un database ogni batchSize record
      if (i % batchSize === 0 && i > 0) {
        console.log(`Batch processato. Record elaborati: ${recordsProcessed}, restituiti: ${recordsReturned}`);
        // Piccola pausa per simulare I/O del database
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    console.log(`Query completata. Totale record elaborati: ${recordsProcessed}, restituiti: ${recordsReturned}`);
  }
  
  // Genera un record fittizio
  generateRecord(id) {
    return {
      id: id + 1,
      name: `User ${id + 1}`,
      email: `user${id + 1}@example.com`,
      age: 20 + (id % 50),
      active: id % 3 === 0
    };
  }
}

// Dimostra query database lazy
async function demonstrateLazyDatabaseQuery() {
  console.log('\n--- Lazy Database Query ---');
  
  const db = new MockDatabase();
  
  console.log('Esecuzione query per trovare utenti attivi con età > 50...');
  const startTime = Date.now();
  
  // Creiamo una query che filtra utenti attivi con età > 50
  const query = db.lazyQuery({
    batchSize: 200,
    filter: record => record.active && record.age > 50,
    maxProcessedRecords: 1000 // Limitiamo per la dimostrazione
  });
  
  // Elaboriamo i primi 5 risultati
  const results = [];
  for await (const record of query) {
    results.push(record);
    
    if (results.length >= 5) break;
  }
  
  const duration = Date.now() - startTime;
  console.log(`Query eseguita in ${duration}ms`);
  console.log('Primi 5 risultati:', results);
}

// ========================================================
// Esecuzione delle dimostrazioni
// ========================================================

// Funzione principale che esegue tutte le dimostrazioni
async function runAllDemos() {
  console.log('Avvio dimostrazioni di applicazioni pratiche...\n');
  
  try {
    await demonstrateLargeFileProcessing();
    await demonstrateEventStreaming();
    await demonstrateLazyPagination();
    demonstrateTreeTraversal();
    await demonstrateLazyDatabaseQuery();
    
    console.log('\nTutte le dimostrazioni completate con successo!');
  } catch (error) {
    console.error('Errore durante l\'esecuzione delle dimostrazioni:', error);
  }
}

// Avvia le dimostrazioni se questo file viene eseguito direttamente
if (require.main === module) {
  runAllDemos().catch(console.error);
} else {
  console.log('Modulo caricato, usa runAllDemos() per eseguire le dimostrazioni.');
}

// ========================================================
// Esportazioni
// ========================================================

module.exports = {
  processLargeFile,
  createEventStream,
  lazyPaginatedResults,
  traverseTree,
  runAllDemos
};

console.log('\nCaricamento delle applicazioni pratiche completato!');
