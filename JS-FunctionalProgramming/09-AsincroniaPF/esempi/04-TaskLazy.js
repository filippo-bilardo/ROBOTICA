/**
 * Task Monad e Lazy Evaluation
 * Esplorazione del pattern Task per operazioni asincrone con valutazione lazy
 */

// ========================================================================================
// 1. IMPLEMENTAZIONE DEL TASK MONAD
// ========================================================================================

class Task {
  constructor(computation) {
    this.computation = computation;
  }
  
  // Esegue effettivamente il task
  fork(onRejected, onResolved) {
    return this.computation(onRejected, onResolved);
  }
  
  // -- Functor interface --
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
  
  // -- Monad interface --
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
  
  // -- Applicative interface --
  ap(otherTask) {
    return this.chain(fn => otherTask.map(fn));
  }
  
  // Factory methods
  static of(value) {
    return new Task((_, resolve) => resolve(value));
  }
  
  static rejected(error) {
    return new Task(reject => reject(error));
  }
  
  // Promise utilities
  static fromPromise(promise) {
    return new Task((reject, resolve) => {
      promise.then(resolve).catch(reject);
    });
  }
  
  static fromPromiseFn(promiseFn) {
    return (...args) => Task.fromPromise(promiseFn(...args));
  }
  
  // Delay utility
  static delay(ms) {
    return new Task((_, resolve) => {
      setTimeout(() => resolve(ms), ms);
    });
  }
  
  // Parallel execution
  static all(tasks) {
    return new Task((reject, resolve) => {
      const results = new Array(tasks.length);
      let completed = 0;
      let rejected = false;
      
      if (tasks.length === 0) {
        resolve([]);
        return;
      }
      
      tasks.forEach((task, index) => {
        task.fork(
          err => {
            if (!rejected) {
              rejected = true;
              reject(err);
            }
          },
          value => {
            results[index] = value;
            completed += 1;
            
            if (completed === tasks.length) {
              resolve(results);
            }
          }
        );
      });
    });
  }
  
  // Memoization for caching results
  memoize() {
    let cache = null;
    let hasCached = false;
    
    return new Task((reject, resolve) => {
      if (hasCached) {
        resolve(cache);
        return;
      }
      
      this.fork(
        error => {
          reject(error);
        },
        value => {
          cache = value;
          hasCached = true;
          resolve(value);
        }
      );
    });
  }
}

// ========================================================================================
// 2. CONFRONTO TRA PROMISE E TASK
// ========================================================================================

console.log('=== CONFRONTO TRA PROMISE E TASK ===');

// Funzione di utility per misurare il tempo
const timed = (label, fn) => {
  console.time(label);
  const result = fn();
  console.timeEnd(label);
  return result;
};

// Esempio con Promise - eager evaluation
function demoPromiseEager() {
  console.log('\n> Promise (eager evaluation):');
  
  const slowOperation = () => {
    console.log('  - Esecuzione dell\'operazione lenta iniziata'); // Questa stampa avviene subito
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('  - Operazione lenta completata');
        resolve('Risultato dell\'operazione');
      }, 1000);
    });
  };
  
  console.log('Creazione della Promise...');
  const promise = timed('Creazione Promise', () => slowOperation());
  
  console.log('La Promise è già in esecuzione anche se non abbiamo chiamato .then()');
  console.log('Attendiamo 2 secondi prima di attaccare il handler...');
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Ora colleghiamo il handler alla Promise:');
      promise.then(result => {
        console.log('  Handler result:', result);
        resolve();
      });
    }, 2000);
  });
}

// Esempio con Task - lazy evaluation
function demoTaskLazy() {
  console.log('\n> Task (lazy evaluation):');
  
  const slowOperation = () => {
    return new Task((_, resolve) => {
      console.log('  - Esecuzione dell\'operazione lenta iniziata'); // Questa stampa avviene solo quando fork viene chiamato
      setTimeout(() => {
        console.log('  - Operazione lenta completata');
        resolve('Risultato dell\'operazione');
      }, 1000);
    });
  };
  
  console.log('Creazione del Task...');
  const task = timed('Creazione Task', () => slowOperation());
  
  console.log('Il Task non è ancora in esecuzione perché non abbiamo chiamato fork()');
  console.log('Attendiamo 2 secondi prima di avviare l\'esecuzione...');
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Ora avviamo l\'esecuzione con fork:');
      task.fork(
        error => console.error('  Task error:', error),
        result => {
          console.log('  Fork result:', result);
          resolve();
        }
      );
    }, 2000);
  });
}

// ========================================================================================
// 3. COMPOSIZIONE CON TASK
// ========================================================================================

console.log('\n=== COMPOSIZIONE CON TASK ===');

// API simulate con Task
const getUserTask = userId => {
  console.log(`Fetching user ${userId}...`);
  return new Task((_, resolve) => {
    setTimeout(() => {
      resolve({ id: userId, name: `User ${userId}`, role: userId % 2 === 0 ? 'admin' : 'user' });
    }, 300);
  });
};

const getUserPreferencesTask = user => {
  console.log(`Fetching preferences for ${user.name}...`);
  return new Task((_, resolve) => {
    setTimeout(() => {
      resolve({ 
        userId: user.id, 
        theme: user.id % 2 === 0 ? 'dark' : 'light', 
        notifications: true 
      });
    }, 200);
  });
};

const checkAccessTask = user => {
  console.log(`Checking access for ${user.name}...`);
  return new Task((reject, resolve) => {
    setTimeout(() => {
      if (user.role === 'admin') {
        resolve({ user, accessLevel: 'full' });
      } else {
        resolve({ user, accessLevel: 'limited' });
      }
    }, 150);
  });
};

// Composizione Task con chain
function composeWithChain(userId) {
  console.log('\n> Composizione con chain:');
  
  return getUserTask(userId)
    .chain(user => {
      console.log(`Dati utente recuperati: ${user.name}, ${user.role}`);
      
      // Ritorna un nuovo Task che incorpora il risultato del Task precedente
      return getUserPreferencesTask(user)
        .chain(preferences => {
          console.log(`Preferenze recuperate: ${preferences.theme}`);
          
          // Combina il risultato con l'utente
          const userWithPrefs = { ...user, preferences };
          
          // Ritorna un Task con il controllo accessi
          return checkAccessTask(user)
            .map(access => {
              // Combina tutti i risultati
              return {
                ...userWithPrefs,
                accessLevel: access.accessLevel
              };
            });
        });
    });
}

// ========================================================================================
// 4. LAZY PIPELINES CON TASK
// ========================================================================================

console.log('\n=== LAZY PIPELINES CON TASK ===');

// Operazioni pure con Task
const fetchDataTask = id => {
  return new Task((_, resolve) => {
    console.log(`Fetching data for ${id}...`);
    setTimeout(() => {
      resolve(`Data-${id}`);
    }, 300);
  });
};

const processDataTask = data => {
  return new Task((_, resolve) => {
    console.log(`Processing ${data}...`);
    setTimeout(() => {
      resolve(`Processed-${data}`);
    }, 200);
  });
};

const saveResultTask = result => {
  return new Task((_, resolve) => {
    console.log(`Saving ${result}...`);
    setTimeout(() => {
      resolve(`Saved-${result}`);
    }, 250);
  });
};

// Composizione utilizzando pipe
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

// Pipeline di Task - si definisce ma non si esegue fino a fork()
function defineLazyPipeline(id) {
  console.log('\n> Definizione pipeline:');
  
  const pipeline = pipe(
    fetchDataTask,
    task => task.chain(processDataTask),
    task => task.chain(saveResultTask)
  )(id);
  
  console.log('Pipeline definita ma NON eseguita');
  return pipeline;
}

function executePipeline(pipeline) {
  console.log('\n> Esecuzione pipeline:');
  return new Promise((resolve) => {
    pipeline.fork(
      error => {
        console.error('Pipeline error:', error);
        resolve(error);
      },
      result => {
        console.log('Pipeline result:', result);
        resolve(result);
      }
    );
  });
}

// ========================================================================================
// 5. UTILITÀ AVANZATE CON TASK
// ========================================================================================

console.log('\n=== UTILITÀ AVANZATE CON TASK ===');

// Ripetizione di un Task con backoff esponenziale
const retry = (task, maxRetries, delay = 500, factor = 2) => {
  return new Task((reject, resolve) => {
    let attempts = 0;
    
    const attempt = () => {
      task.fork(
        error => {
          attempts += 1;
          console.log(`Attempt ${attempts} failed:`, error.message || error);
          
          if (attempts >= maxRetries) {
            console.log(`All ${maxRetries} attempts failed`);
            reject(error);
            return;
          }
          
          const nextDelay = delay * Math.pow(factor, attempts - 1);
          console.log(`Retrying in ${nextDelay}ms...`);
          
          setTimeout(attempt, nextDelay);
        },
        result => {
          console.log(`Success on attempt ${attempts + 1}`);
          resolve(result);
        }
      );
    };
    
    attempt();
  });
};

// Operazione che fallisce casualmente
const unreliableOperation = (id, failRate = 0.7) => {
  return new Task((reject, resolve) => {
    setTimeout(() => {
      if (Math.random() < failRate) {
        reject(new Error(`Operation ${id} failed randomly`));
      } else {
        resolve(`Operation ${id} succeeded`);
      }
    }, 300);
  });
};

// Task con timeout
const withTimeout = (task, ms) => {
  return new Task((reject, resolve) => {
    let isResolved = false;
    let timeoutId;
    
    // Task originale
    task.fork(
      error => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutId);
          reject(error);
        }
      },
      value => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutId);
          resolve(value);
        }
      }
    );
    
    // Timeout
    timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        reject(new Error(`Operation timed out after ${ms}ms`));
      }
    }, ms);
  });
};

// Task che può essere cancellato
const cancellable = task => {
  let isCancelled = false;
  let cleanupFn = null;
  
  const wrappedTask = new Task((reject, resolve) => {
    if (isCancelled) {
      reject(new Error('Task was cancelled'));
      return;
    }
    
    const onRejected = error => {
      if (!isCancelled) {
        reject(error);
      }
    };
    
    const onResolved = value => {
      if (!isCancelled) {
        resolve(value);
      }
    };
    
    const cleanup = task.fork(onRejected, onResolved);
    
    if (typeof cleanup === 'function') {
      cleanupFn = cleanup;
    }
  });
  
  wrappedTask.cancel = () => {
    isCancelled = true;
    if (typeof cleanupFn === 'function') {
      cleanupFn();
    }
  };
  
  return wrappedTask;
};

// Esempio di Task cancellabile
const longRunningTask = new Task((_, resolve) => {
  console.log('Starting long operation...');
  
  const timerId = setTimeout(() => {
    console.log('Long operation completed');
    resolve('Long operation result');
  }, 5000);
  
  // Return cleanup function
  return () => {
    console.log('Cleaning up long operation');
    clearTimeout(timerId);
  };
});

// ========================================================================================
// ESECUZIONE DEGLI ESEMPI
// ========================================================================================

async function runExamples() {
  // Confronto tra Promise e Task
  await demoPromiseEager();
  await demoTaskLazy();
  
  // Composizione con Task
  console.log('\n> Esecuzione della composizione con Task:');
  composeWithChain(1).fork(
    error => console.error('Chain error:', error),
    result => console.log('Chain result:', result)
  );
  
  // Per non sovrapporre l'output delle operazioni
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Lazy pipeline
  const pipeline = defineLazyPipeline(42);
  await executePipeline(pipeline);
  
  // Retry con backoff
  console.log('\n> Retry con backoff esponenziale:');
  retry(unreliableOperation('test-retry'), 3).fork(
    error => console.error('Final retry error:', error),
    result => console.log('Retry succeeded:', result)
  );
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Timeout example
  console.log('\n> Task con timeout:');
  const slowTask = Task.delay(2000).map(() => 'Slow task completed');
  
  withTimeout(slowTask, 1000).fork(
    error => console.log('Timeout error:', error.message),
    result => console.log('This should not happen:', result)
  );
  
  withTimeout(slowTask, 3000).fork(
    error => console.log('This should not happen:', error),
    result => console.log('Task completed within timeout:', result)
  );
  
  // Cancellable task
  console.log('\n> Task cancellabile:');
  const cancellableTask = cancellable(longRunningTask);
  
  cancellableTask.fork(
    error => console.log('Task error:', error.message),
    result => console.log('Task result:', result)
  );
  
  // Cancel the task after 2 seconds
  setTimeout(() => {
    console.log('Cancelling the task...');
    cancellableTask.cancel();
  }, 2000);
}

runExamples();

// ========================================================================================
// CONCLUSIONI
// ========================================================================================

/**
 * VANTAGGI PRINCIPALI DEL TASK MONAD:
 * 
 * 1. Lazy Evaluation
 *    - Le operazioni vengono eseguite solo quando chiamate con fork()
 *    - Maggiore controllo sull'esecuzione e sull'utilizzo delle risorse
 * 
 * 2. Componibilità
 *    - Permette di comporre operazioni complesse prima dell'esecuzione
 *    - Separazione netta tra definizione ed esecuzione
 * 
 * 3. Controllo dell'Esecuzione
 *    - Possibilità di implementare retry, timeout, cancellazione
 *    - Gestione errori più esplicita e controllabile
 * 
 * 4. Prevedibilità
 *    - Comportamento deterministico rispetto a Promise (eager)
 *    - Riduce gli effetti collaterali accidentali
 * 
 * CASI D'USO IDEALI:
 * 
 * - Operazioni costose che possono non essere sempre necessarie
 * - Pipeline complesse che devono essere configurarate prima dell'esecuzione
 * - Scenari che richiedono retry, cancellazione o timeout avanzati
 * - Operazioni che potrebbero essere memoizzate/cachate
 * 
 * CONSIDERAZIONI PRATICHE:
 * 
 * - Curve di apprendimento più ripida rispetto a Promise
 * - In progetti reali, ci sono librerie che implementano Task (Fluture, Folktale, etc.)
 * - Può essere usato insieme a Promise per diversi livelli di astrazione
 */
