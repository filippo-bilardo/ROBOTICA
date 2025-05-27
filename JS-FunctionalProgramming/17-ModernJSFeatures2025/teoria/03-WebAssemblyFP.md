# WebAssembly e Programmazione Funzionale

## Introduzione

WebAssembly (WASM) rappresenta una nuova frontiera per l'esecuzione ad alte prestazioni nel browser, e si integra perfettamente con i paradigmi della programmazione funzionale per creare applicazioni web performanti.

## 1. Concetti Base di WebAssembly

### Cos'è WebAssembly

WebAssembly è:
- Un **formato binario** per codice eseguibile
- Un **target di compilazione** per linguaggi come C++, Rust, Go
- Un **complemento a JavaScript**, non un sostituto
- **Sandboxed** e sicuro per default

### Vantaggi per la Programmazione Funzionale

```javascript
// Caso d'uso: calcoli intensivi con FP
const functionalCalculations = {
  // Operazioni che beneficiano di WASM
  heavyMath: (data) => data.map(x => Math.pow(x, 3)).reduce((a, b) => a + b, 0),
  matrixOperations: (matrix) => matrix.map(row => row.map(cell => cell * 2)),
  complexTransforms: (data) => data
    .filter(x => x > 0)
    .map(x => Math.sqrt(x))
    .reduce((acc, val) => acc + val, 0)
};

// Versione ottimizzata con WASM
class WasmFunctionalCalculator {
  constructor() {
    this.wasmModule = null;
  }

  async init() {
    // Caricamento del modulo WASM
    const wasmModule = await WebAssembly.instantiateStreaming(
      fetch('/math-functions.wasm')
    );
    this.wasmModule = wasmModule.instance.exports;
  }

  // Wrapper funzionale per funzioni WASM
  heavyMath = (data) => {
    // Preparazione dati per WASM
    const inputPtr = this.allocateArray(data);
    const result = this.wasmModule.heavy_math(inputPtr, data.length);
    this.deallocateArray(inputPtr);
    return result;
  };

  // Composizione funzionale con WASM
  pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

  processDataPipeline = this.pipe(
    (data) => this.filterPositive(data),
    (data) => this.heavyMath(data),
    (result) => this.formatResult(result)
  );
}
```

## 2. Integrazione WASM-JavaScript Funzionale

### Memory Management Funzionale

```javascript
// Gestione memoria WASM con pattern funzionali
class WasmMemoryManager {
  constructor(wasmModule) {
    this.module = wasmModule;
    this.memory = wasmModule.memory;
  }

  // Wrapper funzionale per allocazione
  withMemory = (size, fn) => {
    const ptr = this.module.malloc(size);
    try {
      return fn(ptr);
    } finally {
      this.module.free(ptr);
    }
  };

  // Array utilities funzionali
  withArray = (jsArray, fn) => {
    const size = jsArray.length * 4; // 4 bytes per float32
    return this.withMemory(size, (ptr) => {
      // Copia dati da JS a WASM
      const wasmArray = new Float32Array(this.memory.buffer, ptr, jsArray.length);
      wasmArray.set(jsArray);
      
      const result = fn(ptr, jsArray.length);
      
      // Copia risultato da WASM a JS se necessario
      return result;
    });
  };

  // Map funzionale con WASM
  mapWithWasm = (jsArray, wasmFunction) => {
    return this.withArray(jsArray, (ptr, length) => {
      const resultPtr = this.module.malloc(length * 4);
      try {
        wasmFunction(ptr, resultPtr, length);
        const resultArray = new Float32Array(this.memory.buffer, resultPtr, length);
        return Array.from(resultArray);
      } finally {
        this.module.free(resultPtr);
      }
    });
  };
}
```

### Streaming e Lazy Evaluation

```javascript
// Combinazione di lazy evaluation e WASM
class WasmLazyProcessor {
  constructor(wasmModule) {
    this.wasm = wasmModule;
    this.memoryManager = new WasmMemoryManager(wasmModule);
  }

  // Generator per processamento lazy
  *lazyProcessChunks(data, chunkSize = 1000) {
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      yield this.memoryManager.mapWithWasm(chunk, this.wasm.process_chunk);
    }
  }

  // Stream processing con WASM
  createProcessingStream = (chunkSize = 1000) => {
    return new ReadableStream({
      start: (controller) => {
        this.controller = controller;
      },
      
      pull: (controller) => {
        return new Promise((resolve) => {
          // Simula arrivo dati
          setTimeout(() => {
            const chunk = this.generateDataChunk();
            const processed = this.memoryManager.mapWithWasm(
              chunk, 
              this.wasm.process_realtime
            );
            controller.enqueue(processed);
            resolve();
          }, 16); // ~60fps
        });
      }
    });
  };

  // Pipeline di transformazione con WASM
  createTransformPipeline = () => {
    return new TransformStream({
      transform: (chunk, controller) => {
        const processed = this.memoryManager.withArray(chunk, (ptr, length) => {
          return this.wasm.transform_data(ptr, length);
        });
        controller.enqueue(processed);
      }
    });
  };
}
```

## 3. Pattern Funzionali con WASM

### Functor Pattern con WASM

```javascript
// Implementazione Functor che usa WASM per computazioni
class WasmFunctor {
  constructor(value, wasmModule) {
    this.value = value;
    this.wasm = wasmModule;
    this.memoryManager = new WasmMemoryManager(wasmModule);
  }

  // Map che usa WASM per trasformazioni intensive
  map(wasmFunction, ...args) {
    if (Array.isArray(this.value)) {
      const result = this.memoryManager.mapWithWasm(this.value, wasmFunction);
      return new WasmFunctor(result, this.wasm);
    } else {
      const result = wasmFunction(this.value, ...args);
      return new WasmFunctor(result, this.wasm);
    }
  }

  // Chain per operazioni sequenziali
  chain(fn) {
    return fn(this.value);
  }

  // Applicative pattern
  ap(funcFunctor) {
    return funcFunctor.map(fn => fn(this.value));
  }

  // Estrazione del valore
  extract() {
    return this.value;
  }
}

// Utilizzo
const wasmCalculator = new WasmFunctor([1, 2, 3, 4, 5], wasmModule);

const result = wasmCalculator
  .map(wasmModule.square_array)     // WASM: eleva al quadrato
  .map(wasmModule.normalize_array)  // WASM: normalizza
  .map(wasmModule.apply_filter)     // WASM: applica filtro
  .extract();
```

### Monad Pattern per Error Handling

```javascript
// Monad per gestire errori in operazioni WASM
class WasmResult {
  constructor(value, isError = false, wasmModule = null) {
    this.value = value;
    this.isError = isError;
    this.wasm = wasmModule;
  }

  static of(value, wasmModule) {
    return new WasmResult(value, false, wasmModule);
  }

  static error(error) {
    return new WasmResult(error, true);
  }

  // Bind per operazioni WASM che possono fallire
  bind(wasmFunction) {
    if (this.isError) return this;
    
    try {
      const result = this.wasm.memoryManager.withArray(this.value, (ptr, length) => {
        // Chiamata WASM con gestione errori
        const errorCode = wasmFunction(ptr, length);
        if (errorCode !== 0) {
          throw new Error(`WASM Error: ${errorCode}`);
        }
        
        // Leggi risultato dalla memoria WASM
        const resultArray = new Float32Array(this.wasm.memory.buffer, ptr, length);
        return Array.from(resultArray);
      });
      
      return WasmResult.of(result, this.wasm);
    } catch (error) {
      return WasmResult.error(error.message);
    }
  }

  // Map sicuro
  map(fn) {
    return this.isError ? this : WasmResult.of(fn(this.value), this.wasm);
  }

  // Pattern matching
  match(patterns) {
    return this.isError 
      ? patterns.error(this.value)
      : patterns.success(this.value);
  }
}

// Utilizzo
const processData = (data) => 
  WasmResult.of(data, wasmModule)
    .bind(wasmModule.validate_input)
    .bind(wasmModule.process_data)
    .bind(wasmModule.optimize_result)
    .match({
      success: (result) => `Processed: ${result}`,
      error: (error) => `Error: ${error}`
    });
```

## 4. Performance Optimization

### Batch Processing

```javascript
// Ottimizzazione batch per ridurre overhead JS-WASM
class WasmBatchProcessor {
  constructor(wasmModule, batchSize = 10000) {
    this.wasm = wasmModule;
    this.batchSize = batchSize;
    this.memoryManager = new WasmMemoryManager(wasmModule);
  }

  // Processamento a batch per grandi dataset
  processBatches = (data, wasmFunction) => {
    const batches = this.chunk(data, this.batchSize);
    
    return batches.reduce((accumulator, batch) => {
      const batchResult = this.memoryManager.mapWithWasm(batch, wasmFunction);
      return accumulator.concat(batchResult);
    }, []);
  };

  // Utility per dividere in chunk
  chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  // Pipeline ottimizzata
  optimizedPipeline = (data, ...wasmFunctions) => {
    return wasmFunctions.reduce((acc, fn) => {
      return this.processBatches(acc, fn);
    }, data);
  };
}
```

### Worker Threads con WASM

```javascript
// Worker per WASM in background
class WasmWorkerManager {
  constructor() {
    this.workers = [];
    this.workerPool = [];
  }

  async createWorkerPool(size = 4) {
    for (let i = 0; i < size; i++) {
      const worker = new Worker('/wasm-worker.js');
      await this.initializeWorker(worker);
      this.workerPool.push(worker);
    }
  }

  initializeWorker(worker) {
    return new Promise((resolve) => {
      worker.postMessage({ type: 'init', wasmUrl: '/math-functions.wasm' });
      worker.onmessage = (e) => {
        if (e.data.type === 'initialized') {
          resolve();
        }
      };
    });
  }

  // Distribuzione funzionale del lavoro
  distributeWork = async (data, operation) => {
    const chunkSize = Math.ceil(data.length / this.workerPool.length);
    const chunks = this.chunk(data, chunkSize);
    
    const promises = chunks.map((chunk, index) => {
      const worker = this.workerPool[index % this.workerPool.length];
      return this.executeInWorker(worker, chunk, operation);
    });

    const results = await Promise.all(promises);
    return results.flat();
  };

  executeInWorker(worker, data, operation) {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);
      
      worker.postMessage({
        type: 'execute',
        id,
        data,
        operation
      });

      const handler = (e) => {
        if (e.data.id === id) {
          worker.removeEventListener('message', handler);
          if (e.data.error) {
            reject(new Error(e.data.error));
          } else {
            resolve(e.data.result);
          }
        }
      };

      worker.addEventListener('message', handler);
    });
  }

  chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Worker script (wasm-worker.js)
const workerScript = `
let wasmModule = null;

self.onmessage = async function(e) {
  const { type, data, operation, id } = e.data;
  
  switch (type) {
    case 'init':
      try {
        const wasm = await WebAssembly.instantiateStreaming(
          fetch(e.data.wasmUrl)
        );
        wasmModule = wasm.instance.exports;
        self.postMessage({ type: 'initialized' });
      } catch (error) {
        self.postMessage({ type: 'error', error: error.message });
      }
      break;
      
    case 'execute':
      try {
        // Preparazione memoria
        const inputPtr = wasmModule.malloc(data.length * 4);
        const inputArray = new Float32Array(wasmModule.memory.buffer, inputPtr, data.length);
        inputArray.set(data);
        
        // Esecuzione operazione WASM
        const resultPtr = wasmModule.malloc(data.length * 4);
        wasmModule[operation](inputPtr, resultPtr, data.length);
        
        // Lettura risultato
        const resultArray = new Float32Array(wasmModule.memory.buffer, resultPtr, data.length);
        const result = Array.from(resultArray);
        
        // Cleanup
        wasmModule.free(inputPtr);
        wasmModule.free(resultPtr);
        
        self.postMessage({ type: 'result', id, result });
      } catch (error) {
        self.postMessage({ type: 'result', id, error: error.message });
      }
      break;
  }
};
`;
```

## 5. Case Study: Image Processing

```javascript
// Sistema di image processing con WASM e FP
class WasmImageProcessor {
  constructor() {
    this.wasmModule = null;
    this.memoryManager = null;
  }

  async init() {
    const wasm = await WebAssembly.instantiateStreaming(
      fetch('/image-processing.wasm')
    );
    this.wasmModule = wasm.instance.exports;
    this.memoryManager = new WasmMemoryManager(this.wasmModule);
  }

  // Pipeline funzionale per elaborazione immagini
  createImagePipeline = (...filters) => (imageData) => {
    return filters.reduce((data, filter) => {
      return this.applyFilter(data, filter);
    }, imageData);
  };

  applyFilter = (imageData, filter) => {
    const { data, width, height } = imageData;
    
    return this.memoryManager.withMemory(data.length, (ptr) => {
      // Copia dati immagine in WASM
      const wasmData = new Uint8Array(this.wasmModule.memory.buffer, ptr, data.length);
      wasmData.set(data);
      
      // Applica filtro WASM
      this.wasmModule[filter.name](ptr, width, height, ...filter.params);
      
      // Crea nuova ImageData con risultato
      const resultData = new Uint8ClampedArray(wasmData);
      return new ImageData(resultData, width, height);
    });
  };

  // Filtri predefiniti
  filters = {
    blur: (radius = 1) => ({ name: 'gaussian_blur', params: [radius] }),
    sharpen: (intensity = 1) => ({ name: 'sharpen', params: [intensity] }),
    emboss: () => ({ name: 'emboss', params: [] }),
    grayscale: () => ({ name: 'grayscale', params: [] })
  };

  // Esempio di utilizzo
  processImage = this.createImagePipeline(
    this.filters.blur(2),
    this.filters.sharpen(1.5),
    this.filters.grayscale()
  );
}

// Utilizzo con Canvas
async function demonstrateImageProcessing() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  
  const processor = new WasmImageProcessor();
  await processor.init();
  
  // Carica immagine
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Elabora con pipeline WASM
    const processed = processor.processImage(imageData);
    ctx.putImageData(processed, 0, 0);
  };
  img.src = 'image.jpg';
}
```

## 6. Best Practices

### 1. Memory Management
- Usa sempre RAII pattern (Resource Acquisition Is Initialization)
- Implementa cleanup automatico con try/finally
- Monitora l'utilizzo memoria con performance tools

### 2. Performance
- Batch le operazioni per ridurre overhead
- Usa Worker threads per elaborazioni pesanti
- Pre-alloca buffer quando possibile

### 3. Error Handling
- Implementa error codes in WASM
- Usa Result/Either pattern per gestione errori
- Valida input prima di passarli a WASM

### 4. Testing
- Testa sia la logica WASM che l'integrazione JS
- Usa property-based testing per validare invarianti
- Benchmarka performance vs implementazioni JS pure

## Conclusioni

L'integrazione di WebAssembly con programmazione funzionale apre nuove possibilità per:

- **Performance**: Calcoli intensivi ottimizzati
- **Sicurezza**: Sandboxing naturale di WASM
- **Composabilità**: Pattern funzionali per orchestrare WASM
- **Scalabilità**: Worker pools per parallelizzazione

La combinazione di FP e WASM rappresenta il futuro delle applicazioni web ad alte prestazioni.

## Risorse

- [WebAssembly.org](https://webassembly.org/)
- [Emscripten Documentation](https://emscripten.org/docs/)
- [Rust and WebAssembly Book](https://rustwasm.github.io/docs/book/)
- [AssemblyScript](https://www.assemblyscript.org/) - TypeScript-like language that compiles to WASM
