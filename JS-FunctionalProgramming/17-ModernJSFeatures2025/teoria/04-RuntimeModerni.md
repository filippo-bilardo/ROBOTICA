# Runtime Moderni: Deno e Bun per Programmazione Funzionale

## Introduzione

I nuovi runtime JavaScript come Deno e Bun portano innovazioni significative che si integrano perfettamente con paradigmi di programmazione funzionale, offrendo performance migliori e API più moderne.

## 1. Deno e Programmazione Funzionale

### Caratteristiche Chiave di Deno

Deno offre vantaggi unici per FP:
- **Sicurezza by default** (permissions esplicite)
- **TypeScript nativo** (no setup)
- **Standard library ricca** con API funzionali
- **ES Modules only** (composizione più pulita)
- **Web APIs standard** (fetch, streams, etc.)

### Standard Library Funzionale

```javascript
// Importazione moduli da standard library
import { pipe } from "https://deno.land/std@0.200.0/async/mod.ts";
import { map, filter, reduce } from "https://deno.land/std@0.200.0/collections/mod.ts";
import { assertEquals } from "https://deno.land/std@0.200.0/testing/asserts.ts";

// Utilities funzionali native
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Composizione funzionale con std library
const processNumbers = pipe(
  data,
  (nums) => filter(nums, x => x % 2 === 0),      // numeri pari
  (nums) => map(nums, x => x * x),               // elevazione al quadrato
  (nums) => reduce(nums, (acc, x) => acc + x, 0) // somma
);

console.log(processNumbers); // 220
```

### Streams Funzionali in Deno

```javascript
// Stream processing con API native Deno
class FunctionalStreamProcessor {
  // Transform stream con pattern funzionali
  static createTransformStream(transformFn) {
    return new TransformStream({
      transform(chunk, controller) {
        const result = transformFn(chunk);
        controller.enqueue(result);
      }
    });
  }

  // Composizione di transform streams
  static pipe(...transforms) {
    return transforms.reduce((stream, transform) => 
      stream.pipeThrough(transform)
    );
  }

  // Esempio: processamento file JSON streaming
  static async processJsonStream(filePath) {
    const file = await Deno.open(filePath);
    
    const decoder = new TextDecoderStream();
    const jsonTransform = this.createTransformStream(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    });
    
    const filterTransform = this.createTransformStream(obj => 
      obj && obj.active === true ? obj : null
    );
    
    const mapTransform = this.createTransformStream(obj => 
      obj ? { id: obj.id, name: obj.name.toUpperCase() } : null
    );

    // Pipeline funzionale
    return this.pipe(
      file.readable,
      decoder,
      jsonTransform,
      filterTransform,
      mapTransform
    );
  }
}

// Utilizzo
const processedStream = await FunctionalStreamProcessor.processJsonStream('./data.json');

for await (const item of processedStream) {
  if (item) console.log(item);
}
```

### Permissions e Functional Security

```javascript
// Pattern di sicurezza funzionale con Deno permissions
class SecureFunctionalAPI {
  constructor(permissions = {}) {
    this.permissions = permissions;
  }

  // Wrapper sicuro per operazioni filesystem
  withFilePermission = (operation) => async (...args) => {
    try {
      // Verifica permessi runtime
      const status = await Deno.permissions.query({ name: "read" });
      if (status.state !== "granted") {
        throw new Error("File read permission required");
      }
      return await operation(...args);
    } catch (error) {
      return { error: error.message };
    }
  };

  // Funzioni pure per manipolazione dati
  processFileContent = this.withFilePermission(async (filePath, processors = []) => {
    const content = await Deno.readTextFile(filePath);
    
    // Applicazione funzionale dei processori
    return processors.reduce((data, processor) => processor(data), content);
  });

  // Composizione sicura per API network
  withNetworkPermission = (operation) => async (...args) => {
    const status = await Deno.permissions.query({ name: "net" });
    if (status.state !== "granted") {
      throw new Error("Network permission required");
    }
    return await operation(...args);
  };

  secureHttpGet = this.withNetworkPermission(async (url) => {
    const response = await fetch(url);
    return await response.json();
  });
}

// Utilizzo
const api = new SecureFunctionalAPI();

const processors = [
  (text) => text.split('\n'),
  (lines) => lines.filter(line => line.trim().length > 0),
  (lines) => lines.map(line => line.toUpperCase())
];

const result = await api.processFileContent('./input.txt', processors);
```

## 2. Bun e Performance Funzionale

### Caratteristiche di Bun per FP

Bun è ottimizzato per:
- **Performance estrema** (runtime in Zig)
- **Built-in bundler e test runner**
- **Package manager integrato**
- **APIs Web standard**
- **Compatibilità Node.js**

### Hot Reloading Funzionale

```javascript
// Hot reloading per sviluppo FP con Bun
// File: functional-dev-server.js

class FunctionalDevServer {
  constructor() {
    this.modules = new Map();
    this.watchers = new Map();
  }

  // Hot reload di moduli funzionali
  async watchModule(modulePath, onReload) {
    const watcher = Bun.watch(modulePath, {
      persistent: true
    });

    for await (const event of watcher) {
      if (event.eventType === 'change') {
        try {
          // Ricarica modulo
          delete require.cache[require.resolve(modulePath)];
          const newModule = await import(`${modulePath}?t=${Date.now()}`);
          
          // Notifica callback funzionale
          onReload(newModule);
          console.log(`♻️  Reloaded: ${modulePath}`);
        } catch (error) {
          console.error(`❌ Error reloading ${modulePath}:`, error);
        }
      }
    }
  }

  // Sistema di plugin funzionali
  createFunctionalPlugin = (name, transform) => ({
    name,
    setup(build) {
      build.onLoad({ filter: /\.fp\.js$/ }, async (args) => {
        const content = await Bun.file(args.path).text();
        const transformed = transform(content);
        return {
          contents: transformed,
          loader: 'js'
        };
      });
    }
  });

  // Build system funzionale
  async buildWithFunctionalOptimizations() {
    const result = await Bun.build({
      entrypoints: ['./src/index.js'],
      outdir: './dist',
      plugins: [
        this.createFunctionalPlugin('curry-optimizer', (code) => {
          // Ottimizzazione automatica di curry functions
          return code.replace(
            /curry\(([^)]+)\)/g,
            '(function(fn) { return function curried(...args) { return args.length >= fn.length ? fn(...args) : curried.bind(null, ...args); }})($1)'
          );
        }),
        
        this.createFunctionalPlugin('compose-optimizer', (code) => {
          // Ottimizzazione composizione funzioni
          return code.replace(
            /compose\(([^)]+)\)/g,
            '(function(...fns) { return function(value) { return fns.reduceRight((acc, fn) => fn(acc), value); }})($1)'
          );
        })
      ]
    });

    if (!result.success) {
      console.error('Build failed:', result.logs);
    }

    return result;
  }
}

// Utilizzo per sviluppo
const devServer = new FunctionalDevServer();

// Watch dei moduli funzionali
await devServer.watchModule('./src/utils/functional.js', (newModule) => {
  console.log('Functional utilities updated:', Object.keys(newModule));
});
```

### Testing Funzionale con Bun

```javascript
// File: functional.test.js
import { test, expect, describe } from "bun:test";

// Property-based testing helpers
const generateRandomArray = (length = 100) => 
  Array.from({ length }, () => Math.floor(Math.random() * 1000));

const generateRandomNumbers = (count = 50) =>
  Array.from({ length: count }, () => Math.random() * 100);

// Test utilities funzionali
const testCommutativity = (operation, values) => {
  const [a, b] = values;
  return operation(a, b) === operation(b, a);
};

const testAssociativity = (operation, values) => {
  const [a, b, c] = values;
  return operation(operation(a, b), c) === operation(a, operation(b, c));
};

const testIdentity = (operation, identity, value) => {
  return operation(value, identity) === value && operation(identity, value) === value;
};

describe("Functional Programming Properties", () => {
  // Test delle proprietà matematiche
  test("Addition is commutative", () => {
    const testCases = Array.from({ length: 100 }, () => 
      [Math.random() * 100, Math.random() * 100]
    );
    
    testCases.forEach(values => {
      expect(testCommutativity((a, b) => a + b, values)).toBe(true);
    });
  });

  test("Addition is associative", () => {
    const testCases = Array.from({ length: 100 }, () => 
      [Math.random() * 100, Math.random() * 100, Math.random() * 100]
    );
    
    testCases.forEach(values => {
      expect(testAssociativity((a, b) => a + b, values)).toBe(true);
    });
  });

  test("Zero is additive identity", () => {
    const testCases = Array.from({ length: 100 }, () => Math.random() * 100);
    
    testCases.forEach(value => {
      expect(testIdentity((a, b) => a + b, 0, value)).toBe(true);
    });
  });

  // Test di funzioni higher-order
  test("Map preserves array length", () => {
    const arrays = Array.from({ length: 50 }, () => generateRandomArray());
    
    arrays.forEach(arr => {
      const mapped = arr.map(x => x * 2);
      expect(mapped.length).toBe(arr.length);
    });
  });

  test("Filter reduces or maintains array length", () => {
    const arrays = Array.from({ length: 50 }, () => generateRandomArray());
    
    arrays.forEach(arr => {
      const filtered = arr.filter(x => x > 500);
      expect(filtered.length).toBeLessThanOrEqual(arr.length);
    });
  });

  // Test di composizione
  test("Function composition is associative", () => {
    const f = (x) => x * 2;
    const g = (x) => x + 10;
    const h = (x) => x - 5;
    
    const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);
    
    const testValues = generateRandomNumbers();
    
    testValues.forEach(value => {
      const result1 = compose(h, compose(g, f))(value);
      const result2 = compose(compose(h, g), f)(value);
      expect(result1).toBe(result2);
    });
  });

  // Benchmark test con Bun
  test("Performance: Pure vs Impure functions", async () => {
    const data = generateRandomArray(10000);
    
    // Funzione pura
    const pureSumSquares = (arr) => arr.map(x => x * x).reduce((a, b) => a + b, 0);
    
    // Funzione impura (mutante)
    const impureSumSquares = (arr) => {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i] * arr[i]; // mutazione!
        sum += arr[i];
      }
      return sum;
    };

    const start1 = performance.now();
    const result1 = pureSumSquares([...data]);
    const time1 = performance.now() - start1;

    const start2 = performance.now();
    const result2 = impureSumSquares([...data]);
    const time2 = performance.now() - start2;

    console.log(`Pure function: ${time1}ms`);
    console.log(`Impure function: ${time2}ms`);
    
    // La funzione pura dovrebbe essere ragionevolmente performante
    expect(time1).toBeLessThan(100); // Soglia arbitraria per questo test
  });
});

describe("Advanced Functional Patterns", () => {
  // Test di Monad laws
  test("Maybe Monad laws", () => {
    const Maybe = {
      of: (value) => ({ 
        value, 
        map: function(fn) { 
          return this.value != null ? Maybe.of(fn(this.value)) : this; 
        },
        flatMap: function(fn) { 
          return this.value != null ? fn(this.value) : this; 
        }
      }),
      nothing: () => ({ 
        value: null, 
        map: function() { return this; },
        flatMap: function() { return this; }
      })
    };

    const f = (x) => Maybe.of(x * 2);
    const g = (x) => Maybe.of(x + 10);

    // Left identity: M.of(a).flatMap(f) === f(a)
    const value = 5;
    expect(Maybe.of(value).flatMap(f).value).toBe(f(value).value);

    // Right identity: m.flatMap(M.of) === m
    const m = Maybe.of(42);
    expect(m.flatMap(Maybe.of).value).toBe(m.value);

    // Associativity: m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))
    const left = m.flatMap(f).flatMap(g);
    const right = m.flatMap(x => f(x).flatMap(g));
    expect(left.value).toBe(right.value);
  });
});
```

## 3. Runtime-Specific Optimizations

### Deno-Specific Patterns

```javascript
// Patterns specifici per Deno
class DenoFunctionalPatterns {
  // Utilizzo di Deno KV per caching funzionale
  static async withMemoization(fn, keyGenerator) {
    const kv = await Deno.openKv();
    
    return async (...args) => {
      const key = keyGenerator(...args);
      
      // Cerca in cache
      const cached = await kv.get([key]);
      if (cached.value !== null) {
        return cached.value;
      }
      
      // Calcola e salva in cache
      const result = await fn(...args);
      await kv.set([key], result);
      return result;
    };
  }

  // Web Workers funzionali
  static createFunctionalWorker(workerFunction) {
    const workerCode = `
      self.onmessage = async function(e) {
        const { id, args } = e.data;
        try {
          const result = await (${workerFunction.toString()})(...args);
          self.postMessage({ id, result });
        } catch (error) {
          self.postMessage({ id, error: error.message });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob), { type: 'module' });

    return {
      execute: (...args) => {
        return new Promise((resolve, reject) => {
          const id = Math.random().toString(36);
          
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
          worker.postMessage({ id, args });
        });
      },
      
      terminate: () => worker.terminate()
    };
  }

  // HTTP Server funzionale
  static createFunctionalServer(routes = {}) {
    return {
      get: (path, handler) => {
        routes[`GET:${path}`] = handler;
        return this;
      },
      
      post: (path, handler) => {
        routes[`POST:${path}`] = handler;
        return this;
      },

      // Middleware funzionale
      use: (middleware) => {
        const originalRoutes = { ...routes };
        Object.keys(originalRoutes).forEach(key => {
          const originalHandler = originalRoutes[key];
          routes[key] = async (req) => {
            const modifiedReq = await middleware(req);
            return originalHandler(modifiedReq);
          };
        });
        return this;
      },

      listen: (port = 8000) => {
        return Deno.serve({ port }, async (req) => {
          const url = new URL(req.url);
          const key = `${req.method}:${url.pathname}`;
          const handler = routes[key];

          if (handler) {
            try {
              const result = await handler(req);
              return new Response(JSON.stringify(result), {
                headers: { 'Content-Type': 'application/json' }
              });
            } catch (error) {
              return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }

          return new Response('Not Found', { status: 404 });
        });
      }
    };
  }
}

// Utilizzo
const memoizedFibonacci = await DenoFunctionalPatterns.withMemoization(
  (n) => n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2),
  (n) => `fib:${n}`
);

const server = DenoFunctionalPatterns.createFunctionalServer()
  .use(async (req) => ({ ...req, timestamp: Date.now() }))
  .get('/fibonacci/:n', async (req) => {
    const url = new URL(req.url);
    const n = parseInt(url.pathname.split('/')[2]);
    const result = await memoizedFibonacci(n);
    return { n, result, timestamp: req.timestamp };
  })
  .listen(8080);
```

### Bun-Specific Optimizations

```javascript
// Ottimizzazioni specifiche per Bun
class BunFunctionalOptimizations {
  // Fast path per operazioni matematiche
  static createOptimizedMathPipeline() {
    // Bun può ottimizzare questi pattern automaticamente
    const mathOps = {
      add: (a, b) => a + b,
      multiply: (a, b) => a * b,
      power: (a, b) => a ** b,
      sqrt: Math.sqrt,
      abs: Math.abs
    };

    return (operations) => (value) => {
      return operations.reduce((acc, op) => {
        if (typeof op === 'string') {
          return mathOps[op](acc);
        } else if (Array.isArray(op)) {
          const [opName, ...args] = op;
          return mathOps[opName](acc, ...args);
        }
        return op(acc);
      }, value);
    };
  }

  // Bundle-time optimizations
  static generateOptimizedFunctions() {
    // Queste funzioni possono essere ottimizzate a build-time da Bun
    const template = `
      export const fastMap = (arr, fn) => {
        const result = new Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
          result[i] = fn(arr[i], i);
        }
        return result;
      };

      export const fastFilter = (arr, predicate) => {
        const result = [];
        for (let i = 0; i < arr.length; i++) {
          if (predicate(arr[i], i)) {
            result.push(arr[i]);
          }
        }
        return result;
      };

      export const fastReduce = (arr, fn, initial) => {
        let acc = initial;
        for (let i = 0; i < arr.length; i++) {
          acc = fn(acc, arr[i], i);
        }
        return acc;
      };
    `;

    return template;
  }

  // Hot path per serializzazione
  static createFastSerializer() {
    return {
      serialize: (obj) => {
        // Bun ottimizza automaticamente JSON.stringify
        return JSON.stringify(obj);
      },
      
      deserialize: (str) => {
        // Bun ottimizza automaticamente JSON.parse
        return JSON.parse(str);
      },

      // Serializzazione custom per performance
      serializeFunctionalData: (data) => {
        if (Array.isArray(data)) {
          return `[${data.map(item => 
            typeof item === 'number' ? item : 
            typeof item === 'string' ? `"${item}"` : 
            JSON.stringify(item)
          ).join(',')}]`;
        }
        return JSON.stringify(data);
      }
    };
  }

  // File I/O ottimizzato
  static createStreamProcessor() {
    return {
      processFileStream: async (filePath, transforms = []) => {
        const file = Bun.file(filePath);
        const stream = file.stream();
        
        const textDecoder = new TextDecoderStream();
        const lineStream = new TransformStream({
          transform(chunk, controller) {
            const lines = chunk.split('\n');
            lines.forEach(line => {
              if (line.trim()) controller.enqueue(line);
            });
          }
        });

        // Applica transforms funzionali
        let processedStream = stream
          .pipeThrough(textDecoder)
          .pipeThrough(lineStream);

        for (const transform of transforms) {
          processedStream = processedStream.pipeThrough(transform);
        }

        return processedStream;
      },

      createTransform: (fn) => new TransformStream({
        transform(chunk, controller) {
          const result = fn(chunk);
          if (result !== null && result !== undefined) {
            controller.enqueue(result);
          }
        }
      })
    };
  }
}

// Utilizzo delle ottimizzazioni Bun
const mathPipeline = BunFunctionalOptimizations.createOptimizedMathPipeline();

const calculate = mathPipeline([
  ['multiply', 2],
  'sqrt',
  ['add', 10],
  'abs'
]);

console.log(calculate(16)); // Math.abs(Math.sqrt(16 * 2) + 10) = 15.66...

// Processamento file ottimizzato
const processor = BunFunctionalOptimizations.createStreamProcessor();

const jsonTransform = processor.createTransform(line => {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
});

const filterTransform = processor.createTransform(obj => 
  obj && obj.active ? obj : null
);

const processed = await processor.processFileStream('data.jsonl', [
  jsonTransform,
  filterTransform
]);

for await (const item of processed) {
  console.log(item);
}
```

## 4. Performance Comparison

```javascript
// Benchmark suite per confrontare runtime
class RuntimeBenchmark {
  static async benchmarkFunction(fn, iterations = 1000, ...args) {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      await fn(...args);
    }
    
    const end = performance.now();
    return (end - start) / iterations;
  }

  static async compareRuntimes() {
    const testData = Array.from({ length: 10000 }, (_, i) => i);
    
    // Test map/filter/reduce
    const functionalTest = (data) => 
      data
        .filter(x => x % 2 === 0)
        .map(x => x * x)
        .reduce((a, b) => a + b, 0);

    // Test con different patterns
    const imperativeTest = (data) => {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i] % 2 === 0) {
          sum += data[i] * data[i];
        }
      }
      return sum;
    };

    console.log('=== Runtime Performance Comparison ===');
    
    const functionalTime = await this.benchmarkFunction(functionalTest, 1000, testData);
    const imperativeTime = await this.benchmarkFunction(imperativeTest, 1000, testData);
    
    console.log(`Functional approach: ${functionalTime.toFixed(3)}ms per iteration`);
    console.log(`Imperative approach: ${imperativeTime.toFixed(3)}ms per iteration`);
    console.log(`Difference: ${((functionalTime / imperativeTime) * 100).toFixed(1)}%`);

    // Runtime-specific features
    const runtime = this.detectRuntime();
    console.log(`Current runtime: ${runtime}`);
    
    if (runtime === 'bun') {
      console.log('Bun optimizations available');
    } else if (runtime === 'deno') {
      console.log('Deno security features available');
    } else {
      console.log('Node.js compatibility mode');
    }
  }

  static detectRuntime() {
    if (typeof Bun !== 'undefined') return 'bun';
    if (typeof Deno !== 'undefined') return 'deno';
    return 'node';
  }
}

// Esegui benchmark
await RuntimeBenchmark.compareRuntimes();
```

## 5. Migration Guide

### Da Node.js a Deno

```javascript
// Prima (Node.js)
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Dopo (Deno)
// Nessuna importazione necessaria per API web standard

// Migration helper
class NodeToDenoMigration {
  // File system operations
  static async migrateFileOperations(nodeFsCode) {
    const migrations = {
      'fs.readFile': 'Deno.readTextFile',
      'fs.writeFile': 'Deno.writeTextFile',
      'fs.readdir': 'Deno.readDir',
      'path.join': 'path.join (from std/path)',
      'https.get': 'fetch'
    };

    let migratedCode = nodeFsCode;
    Object.entries(migrations).forEach(([old, replacement]) => {
      migratedCode = migratedCode.replace(new RegExp(old, 'g'), replacement);
    });

    return migratedCode;
  }

  // Package.json to deno.json
  static convertPackageJson(packageJson) {
    return {
      tasks: packageJson.scripts || {},
      imports: this.convertDependencies(packageJson.dependencies || {}),
      compilerOptions: {
        allowJs: true,
        lib: ["deno.window"],
        strict: true
      }
    };
  }

  static convertDependencies(deps) {
    const denoImports = {};
    Object.keys(deps).forEach(dep => {
      // Conversione automatica per pacchetti comuni
      if (dep === 'lodash') {
        denoImports['lodash/'] = 'https://deno.land/x/lodash@4.17.21/';
      } else if (dep === 'ramda') {
        denoImports['ramda/'] = 'https://deno.land/x/ramda@v0.27.2/';
      }
      // Aggiungi più conversioni secondo necessità
    });
    return denoImports;
  }
}
```

### Da Node.js a Bun

```javascript
// Migration helper per Bun
class NodeToBunMigration {
  // Mantenimento compatibilità Node.js
  static createCompatibilityLayer() {
    return {
      // Bun supporta nativamente la maggior parte delle API Node.js
      enhancedFeatures: {
        // Utilizzo del bundler integrato
        async buildProject(entryPoint) {
          return await Bun.build({
            entrypoints: [entryPoint],
            outdir: './dist',
            target: 'browser'
          });
        },

        // Test runner integrato
        async runTests(pattern = '**/*.test.js') {
          return await Bun.spawn(['bun', 'test', pattern]);
        },

        // Package manager veloce
        async installDependencies() {
          return await Bun.spawn(['bun', 'install']);
        }
      }
    };
  }

  // Ottimizzazioni specifiche Bun
  static createBunOptimizations() {
    return {
      // Utilizzo di Bun APIs native
      fastFileRead: async (path) => {
        const file = Bun.file(path);
        return await file.text();
      },

      fastJSONParsing: (text) => {
        // Bun ha JSON parsing ottimizzato
        return JSON.parse(text);
      },

      // Hot reloading per sviluppo
      enableHotReload: () => {
        if (process.env.NODE_ENV === 'development') {
          // Bun hot reload automatico
          return true;
        }
        return false;
      }
    };
  }
}
```

## Conclusioni

I runtime moderni Deno e Bun offrono vantaggi significativi per la programmazione funzionale:

### Deno
- **Sicurezza**: Permissions granulari
- **Standard**: API Web native
- **TypeScript**: Supporto nativo
- **Modern**: ES modules only

### Bun
- **Performance**: Runtime ultra-veloce
- **Tools**: Bundler/test runner integrati
- **Compatibility**: Drop-in replacement per Node.js
- **Developer Experience**: Hot reload e fast refresh

La scelta tra i due dipende dalle priorità del progetto:
- **Sicurezza e standard**: Deno
- **Performance e tooling**: Bun
- **Legacy compatibility**: Bun

Entrambi rappresentano il futuro dell'ecosistema JavaScript e si integrano perfettamente con paradigmi di programmazione funzionale.

## Risorse

- [Deno Manual](https://deno.land/manual)
- [Deno Standard Library](https://deno.land/std)
- [Bun Documentation](https://bun.sh/docs)
- [Bun Runtime APIs](https://bun.sh/docs/api)
- [Performance Comparisons](https://bun.sh/docs/benchmarks)
