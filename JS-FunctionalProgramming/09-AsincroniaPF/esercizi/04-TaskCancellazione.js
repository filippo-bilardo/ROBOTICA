/**
 * Esercizio 4: Task con Cancellazione
 * 
 * In questo esercizio implementerai e utilizzerai un Task monad con
 * supporto alla cancellazione, una funzionalità mancante nelle Promise native.
 */

// ========================================================================================
// UTILITY E HELPERS
// ========================================================================================

// Helper per logging colorato
const log = (label) => (data) => {
  const time = new Date().toISOString().substr(11, 8);
  console.log(`[${time}] [${label}] `, data);
  return data;
};

// Helper per creazione di un ID unico
const generateId = () => Math.random().toString(36).substr(2, 9);

// ========================================================================================
// IMPLEMENTAZIONE BASE DI TASK CON SUPPORTO ALLA CANCELLAZIONE
// ========================================================================================

/**
 * COMPITO:
 * Estendere questa implementazione base di Task per supportare la cancellazione.
 * La cancellazione dovrebbe:
 * 1. Interrompere l'esecuzione delle operazioni future nella catena
 * 2. Chiamare funzioni di pulizia (cleanup) per risorse quando necessario
 * 3. Segnalare adeguatamente che l'operazione è stata cancellata
 */

class Task {
  constructor(computation) {
    this.computation = computation;
  }
  
  // Esegue il task chiamando le callback appropriate
  fork(onRejected, onResolved) {
    return this.computation(onRejected, onResolved);
  }
  
  // Metodo map per trasformare il valore risultante (functor)
  map(fn) {
    return new Task((reject, resolve) => {
      this.computation(reject, value => {
        try {
          resolve(fn(value));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  
  // Metodo chain per sequenziare tasks (monad)
  chain(fn) {
    return new Task((reject, resolve) => {
      this.computation(reject, value => {
        try {
          fn(value).fork(reject, resolve);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  
  // Factory methods
  static of(value) {
    return new Task((_, resolve) => resolve(value));
  }
  
  static rejected(error) {
    return new Task(reject => reject(error));
  }
  
  static fromPromise(promise) {
    return new Task((reject, resolve) => {
      promise.then(resolve).catch(reject);
    });
  }
}

// ========================================================================================
// ESERCIZIO 4.1: Implementazione di CancellableTask
// ========================================================================================

/**
 * COMPITO:
 * Implementa una versione di Task che supporta la cancellazione.
 * La classe dovrebbe:
 * 1. Estendere Task o implementare un'interfaccia simile
 * 2. Aggiungere un metodo 'cancel()' che blocca l'esecuzione
 * 3. Accettare nel costruttore una funzione di pulizia (cleanup)
 */

// TODO: Implementa CancellableTask
class CancellableTask {
  // Implementa questa classe
}

// ========================================================================================
// API SIMULATE PER GLI ESERCIZI
// ========================================================================================

// Funzioni helper per simulare chiamate API con delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Funzioni simulate con supporto alla cancellazione
const fetchDataWithCancellation = (resourceId, delayMs = 1000) => {
  // Simula una chiamata API che può essere cancellata
  let isCancelled = false;
  let timeoutId = null;
  
  const promise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      if (!isCancelled) {
        resolve({
          id: resourceId,
          name: `Resource ${resourceId}`,
          timestamp: new Date().toISOString()
        });
      }
    }, delayMs);
  });
  
  // Funzione di pulizia
  const cleanup = () => {
    isCancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
    console.log(`Cancelled fetch for resource ${resourceId}`);
  };
  
  return { promise, cleanup };
};

const processDataWithCancellation = (data, delayMs = 800) => {
  // Simula processamento che può essere cancellato
  let isCancelled = false;
  let timeoutId = null;
  
  const promise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      if (!isCancelled) {
        resolve({
          ...data,
          processed: true,
          processedAt: new Date().toISOString()
        });
      }
    }, delayMs);
  });
  
  // Funzione di pulizia
  const cleanup = () => {
    isCancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
    console.log(`Cancelled processing for ${data.id}`);
  };
  
  return { promise, cleanup };
};

// ========================================================================================
// ESERCIZIO 4.2: Wrapper Task per API cancellabili
// ========================================================================================

/**
 * COMPITO:
 * Crea funzioni wrapper che convertono le nostre API cancellabili in CancellableTask.
 * Le funzioni dovrebbero:
 * 1. Accettare gli stessi parametri dell'API
 * 2. Restituire un CancellableTask
 * 3. Gestire correttamente la cancellazione passando la funzione di cleanup
 */

// TODO: Implementa funzioni wrapper
const fetchDataTask = (resourceId, delayMs) => {
  // Implementa questa funzione
};

const processDataTask = (data, delayMs) => {
  // Implementa questa funzione
};

// ========================================================================================
// ESERCIZIO 4.3: Pipeline di task cancellabile
// ========================================================================================

/**
 * COMPITO:
 * Crea una pipeline di task che:
 * 1. Recupera dati con fetchDataTask
 * 2. Processa i dati con processDataTask
 * 3. Può essere cancellata in qualsiasi punto
 * 
 * Dimostra come la cancellazione ad ogni step cancelli correttamente le risorse.
 */

// TODO: Implementa una funzione che crea una pipeline cancellabile
const createCancellablePipeline = (resourceId) => {
  // Implementa questa funzione
};

// ========================================================================================
// ESERCIZIO 4.4: Task con timeout cancellabile
// ========================================================================================

/**
 * COMPITO:
 * Implementa una funzione withTimeout che aggiunge un timeout ad un CancellableTask.
 * La funzione dovrebbe:
 * 1. Accettare un task e un tempo di timeout in millisecondi
 * 2. Restituire un nuovo task che fallisce se l'originale non completa entro il timeout
 * 3. Cancellare correttamente il task originale quando il timeout scatta
 */

// TODO: Implementa una funzione di timeout per CancellableTask
const withTimeout = (task, ms) => {
  // Implementa questa funzione
};

// ========================================================================================
// ESERCIZIO 4.5: Gestione di risorse multiple
// ========================================================================================

/**
 * COMPITO:
 * Implementa una funzione che esegue più task in parallelo e permette di cancellarli tutti.
 * La funzione dovrebbe:
 * 1. Accettare un array di CancellableTask
 * 2. Restituire un oggetto con:
 *    - Un metodo 'result()' che ritorna una Promise con tutti i risultati
 *    - Un metodo 'cancel()' che cancella tutti i task in esecuzione
 */

// TODO: Implementa una funzione per gestire più task cancellabili
const parallelWithCancellation = (tasks) => {
  // Implementa questa funzione
};

// ========================================================================================
// DIMOSTRAZIONE DEGLI ESERCIZI
// ========================================================================================

// Funzione per dimostrare la cancellazione di un task
function demonstrateTaskCancellation() {
  console.log('=== DIMOSTRAZIONE CANCELLAZIONE TASK ===');
  
  // TODO: Utilizza i task implementati per dimostrare la cancellazione
  // Ad esempio:
  // 1. Crea un task che richiede un po' di tempo
  // 2. Avvia l'esecuzione
  // 3. Dopo un breve periodo, cancella il task
  // 4. Mostra che la cancellazione funziona correttamente
}

// Funzione per dimostrare pipeline cancellabile
function demonstrateCancellablePipeline() {
  console.log('\n=== DIMOSTRAZIONE PIPELINE CANCELLABILE ===');
  
  // TODO: Utilizza la pipeline implementata per dimostrare la cancellazione
}

// Funzione per dimostrare timeout
function demonstrateTimeout() {
  console.log('\n=== DIMOSTRAZIONE TIMEOUT ===');
  
  // TODO: Utilizza withTimeout per dimostrare il timeout
}

// Funzione per dimostrare parallelWithCancellation
function demonstrateParallel() {
  console.log('\n=== DIMOSTRAZIONE TASK PARALLELI ===');
  
  // TODO: Utilizza parallelWithCancellation per dimostrare la cancellazione parallela
}

// Funzione principale che esegue tutte le dimostrazioni
async function runDemonstrations() {
  // Decommentare per eseguire le dimostrazioni
  // await demonstrateTaskCancellation();
  // await demonstrateCancellablePipeline();
  // await demonstrateTimeout();
  // await demonstrateParallel();
}

// Esegui le dimostrazioni
// runDemonstrations().catch(console.error);

// ========================================================================================
// SOLUZIONI AGLI ESERCIZI (NON GUARDARE FINCHÉ NON HAI PROVATO!)
// ========================================================================================

/*
// SOLUZIONE 4.1: Implementazione di CancellableTask

class CancellableTask extends Task {
  constructor(computation, cleanup = () => {}) {
    super((reject, resolve) => {
      // Stato per la cancellazione
      let cancelled = false;
      
      // Wrapper per reject che controlla se il task è stato cancellato
      const wrappedReject = (err) => {
        if (!cancelled) {
          reject(err);
        }
      };
      
      // Wrapper per resolve che controlla se il task è stato cancellato
      const wrappedResolve = (value) => {
        if (!cancelled) {
          resolve(value);
        }
      };
      
      // Esegui la computazione originale
      const result = computation(wrappedReject, wrappedResolve);
      
      // Funzione che sarà restituita da fork per permettere la cancellazione esterna
      return () => {
        cancelled = true;
        cleanup();
        
        // Chiama anche la funzione di cleanup restituita dalla computazione originale, se esiste
        if (typeof result === 'function') {
          result();
        }
      };
    });
    
    this.cleanup = cleanup;
    this._cancelled = false;
  }
  
  // Estendi fork per ritornare una funzione di cancellazione
  fork(onRejected, onResolved) {
    // Solo se il task non è già stato cancellato
    if (this._cancelled) {
      onRejected(new Error('Task was already cancelled'));
      return () => {};
    }
    
    const cancelFn = super.fork(onRejected, onResolved);
    
    return () => {
      this._cancelled = true;
      if (typeof cancelFn === 'function') {
        cancelFn();
      }
    };
  }
  
  // Metodo per cancellare il task senza fork
  cancel() {
    this._cancelled = true;
    this.cleanup();
  }
  
  // Override di map per mantenere la cancellabilità
  map(fn) {
    return new CancellableTask((reject, resolve) => {
      return this.computation((err) => reject(err), (value) => {
        try {
          resolve(fn(value));
        } catch (e) {
          reject(e);
        }
      });
    }, this.cleanup);
  }
  
  // Override di chain per mantenere la cancellabilità
  chain(fn) {
    return new CancellableTask((reject, resolve) => {
      let childCancelFn = null;
      
      const parentCancelFn = this.computation(
        reject,
        value => {
          try {
            const childTask = fn(value);
            childCancelFn = childTask.fork(reject, resolve);
          } catch (e) {
            reject(e);
          }
        }
      );
      
      // Restituisce una funzione di pulizia che cancella sia il parent che il child task
      return () => {
        if (typeof parentCancelFn === 'function') {
          parentCancelFn();
        }
        if (typeof childCancelFn === 'function') {
          childCancelFn();
        }
      };
    });
  }
  
  // Metodi statici factory
  static of(value) {
    return new CancellableTask((_, resolve) => resolve(value));
  }
  
  static rejected(error) {
    return new CancellableTask(reject => reject(error));
  }
  
  static fromPromise(promise) {
    return new CancellableTask((reject, resolve) => {
      promise.then(resolve).catch(reject);
    });
  }
  
  // Metodo per convertire un'API cancellabile
  static fromCancellable({ promise, cleanup }) {
    return new CancellableTask((reject, resolve) => {
      promise.then(resolve).catch(reject);
      return cleanup;
    }, cleanup);
  }
}

// SOLUZIONE 4.2: Wrapper Task per API cancellabili

const fetchDataTask = (resourceId, delayMs = 1000) => {
  // Ottieni promise e cleanup dall'API
  const { promise, cleanup } = fetchDataWithCancellation(resourceId, delayMs);
  
  // Crea un CancellableTask con la promise e la funzione di cleanup
  return CancellableTask.fromCancellable({ promise, cleanup });
};

const processDataTask = (data, delayMs = 800) => {
  // Ottieni promise e cleanup dall'API
  const { promise, cleanup } = processDataWithCancellation(data, delayMs);
  
  // Crea un CancellableTask con la promise e la funzione di cleanup
  return CancellableTask.fromCancellable({ promise, cleanup });
};

// SOLUZIONE 4.3: Pipeline di task cancellabile

const createCancellablePipeline = (resourceId) => {
  // Crea uno ID per la pipeline
  const pipelineId = generateId();
  
  // Crea il task per recuperare i dati
  const fetchTask = fetchDataTask(resourceId, 2000)
    .map(log(`Pipeline ${pipelineId} - Fetched`));
  
  // Concatena con il task per processare i dati
  const pipeline = fetchTask.chain(data => 
    processDataTask(data, 1500)
      .map(log(`Pipeline ${pipelineId} - Processed`))
  );
  
  // Oggetto risultato con metodi per eseguire e cancellare
  let cancelFn = null;
  
  return {
    execute: () => {
      console.log(`Starting pipeline ${pipelineId} for resource ${resourceId}`);
      
      return new Promise((resolve, reject) => {
        cancelFn = pipeline.fork(
          error => {
            console.log(`Pipeline ${pipelineId} failed:`, error.message);
            reject(error);
          },
          result => {
            console.log(`Pipeline ${pipelineId} completed successfully`);
            resolve(result);
          }
        );
      });
    },
    
    cancel: () => {
      if (cancelFn) {
        console.log(`Cancelling pipeline ${pipelineId}`);
        cancelFn();
        cancelFn = null;
      }
    },
    
    getId: () => pipelineId
  };
};

// SOLUZIONE 4.4: Task con timeout cancellabile

const withTimeout = (task, ms) => {
  return new CancellableTask((reject, resolve) => {
    // Crea un flag per tracciare se il timeout è scattato
    let isTimedOut = false;
    
    // Crea un timeout
    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      reject(new Error(`Task timed out after ${ms}ms`));
    }, ms);
    
    // Esegui il task originale
    const cancelTask = task.fork(
      (error) => {
        if (!isTimedOut) {
          clearTimeout(timeoutId);
          reject(error);
        }
      },
      (value) => {
        if (!isTimedOut) {
          clearTimeout(timeoutId);
          resolve(value);
        }
      }
    );
    
    // La funzione di cleanup cancella sia il timeout che il task originale
    return () => {
      clearTimeout(timeoutId);
      if (typeof cancelTask === 'function') {
        cancelTask();
      }
    };
  });
};

// SOLUZIONE 4.5: Gestione di risorse multiple

const parallelWithCancellation = (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('Expected at least one task');
  }
  
  // Tiene traccia delle funzioni di cancellazione
  const cancelFunctions = [];
  
  // Promise per i risultati
  let resolveResult, rejectResult;
  const resultPromise = new Promise((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });
  
  // Risultati parziali
  const results = new Array(tasks.length);
  let completed = 0;
  let isCancelled = false;
  
  // Avvia tutti i task
  tasks.forEach((task, index) => {
    const cancelFn = task.fork(
      (error) => {
        if (!isCancelled) {
          rejectResult(error);
          cancelAll(); // Cancella tutti gli altri task
        }
      },
      (value) => {
        if (!isCancelled) {
          results[index] = value;
          completed++;
          
          if (completed === tasks.length) {
            resolveResult(results);
          }
        }
      }
    );
    
    cancelFunctions.push(cancelFn);
  });
  
  // Funzione per cancellare tutti i task
  const cancelAll = () => {
    if (!isCancelled) {
      isCancelled = true;
      cancelFunctions.forEach(cancelFn => {
        if (typeof cancelFn === 'function') {
          cancelFn();
        }
      });
      
      // Se cancelliamo prima del completamento, rejetta la promise
      if (completed < tasks.length) {
        rejectResult(new Error('Tasks cancelled'));
      }
    }
  };
  
  // Ritorna un oggetto con la promise del risultato e la funzione di cancellazione
  return {
    result: () => resultPromise,
    cancel: cancelAll
  };
};

// Funzione per dimostrare la cancellazione di un task
function demonstrateTaskCancellation() {
  console.log('=== DIMOSTRAZIONE CANCELLAZIONE TASK ===');
  
  return new Promise(resolve => {
    // Crea un task che recupera dati
    const task = fetchDataTask("demo-resource", 3000);
    
    console.log("Starting task execution...");
    
    // Avvia il task
    const cancelTask = task.fork(
      error => console.log("Task error:", error),
      result => console.log("Task completed with result:", result)
    );
    
    // Cancella dopo un secondo
    setTimeout(() => {
      console.log("Cancelling task...");
      cancelTask();
      
      // Risolvi la promise per continuare la demo
      setTimeout(resolve, 1000);
    }, 1000);
  });
}

// Funzione per dimostrare pipeline cancellabile
function demonstrateCancellablePipeline() {
  console.log('\n=== DIMOSTRAZIONE PIPELINE CANCELLABILE ===');
  
  return new Promise(resolve => {
    // Crea una pipeline
    const pipeline = createCancellablePipeline("pipeline-resource");
    
    // Avvia la pipeline
    pipeline.execute().then(
      result => console.log("Pipeline complete:", result),
      error => console.log("Pipeline error:", error)
    );
    
    // Cancella la pipeline dopo 2.5 secondi (durante il secondo task)
    setTimeout(() => {
      console.log("Cancelling pipeline...");
      pipeline.cancel();
      
      // Risolvi la promise per continuare la demo
      setTimeout(resolve, 1000);
    }, 2500);
  });
}

// Funzione per dimostrare timeout
function demonstrateTimeout() {
  console.log('\n=== DIMOSTRAZIONE TIMEOUT ===');
  
  return new Promise(resolve => {
    // Crea un task che impiega 3 secondi
    const longTask = fetchDataTask("timeout-resource", 3000);
    
    // Aggiungi un timeout di 1.5 secondi
    const taskWithTimeout = withTimeout(longTask, 1500);
    
    console.log("Starting task with timeout of 1.5 seconds...");
    
    taskWithTimeout.fork(
      error => console.log("Task error:", error.message),
      result => console.log("Task result:", result)
    );
    
    // Aspetta un po' e risolvi
    setTimeout(resolve, 3500);
  });
}

// Funzione per dimostrare parallelWithCancellation
function demonstrateParallel() {
  console.log('\n=== DIMOSTRAZIONE TASK PARALLELI ===');
  
  return new Promise(resolve => {
    // Crea tre task con tempi diversi
    const tasks = [
      fetchDataTask("parallel-1", 1000),
      fetchDataTask("parallel-2", 2000),
      fetchDataTask("parallel-3", 3000)
    ];
    
    console.log("Starting 3 parallel tasks...");
    
    // Esegui in parallelo
    const operation = parallelWithCancellation(tasks);
    
    // Gestisci il risultato
    operation.result().then(
      results => console.log("All tasks completed:", results),
      error => console.log("Parallel operation error:", error.message)
    );
    
    // Cancella dopo 1.5 secondi (dopo il primo task ma prima degli altri)
    setTimeout(() => {
      console.log("Cancelling all tasks...");
      operation.cancel();
      
      // Risolvi la promise per terminare la demo
      setTimeout(resolve, 2000);
    }, 1500);
  });
}

// Funzione principale che esegue tutte le dimostrazioni in sequenza
async function runDemonstrations() {
  await demonstrateTaskCancellation();
  await demonstrateCancellablePipeline();
  await demonstrateTimeout();
  await demonstrateParallel();
  console.log("\nAll demonstrations completed!");
}
*/
