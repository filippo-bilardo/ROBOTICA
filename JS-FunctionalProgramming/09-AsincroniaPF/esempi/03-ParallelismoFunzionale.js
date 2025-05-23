/**
 * Parallelismo Funzionale
 * Tecniche per eseguire e gestire operazioni asincrone in parallelo mantenendo un approccio funzionale
 */

// ========================================================================================
// FUNZIONI DI UTILITÀ
// ========================================================================================

// Log helper con timestamp
const log = (label, data) => {
  const timestamp = new Date().toISOString().substr(11, 8);
  console.log(`[${timestamp}] ${label}:`, data);
  return data; // permette di usare questa funzione in una pipeline
};

// Misuratore di tempo per operazioni
const timed = async (fn, label) => {
  const start = Date.now();
  try {
    const result = await fn();
    const elapsed = Date.now() - start;
    console.log(`[TIMING] ${label}: ${elapsed}ms`);
    return result;
  } catch (error) {
    const elapsed = Date.now() - start;
    console.log(`[TIMING-ERROR] ${label}: ${elapsed}ms`);
    throw error;
  }
};

// ========================================================================================
// 1. API SIMULATE PER TEST
// ========================================================================================

// Simulazione di API asincrone con ritardi variabili
const fetchUserDetails = (userId) => {
  return new Promise((resolve) => {
    const delay = 300 + Math.random() * 200;
    setTimeout(() => {
      resolve({
        id: userId,
        name: `User-${userId}`,
        email: `user${userId}@example.com`
      });
    }, delay);
  });
};

const fetchUserPosts = (userId) => {
  return new Promise((resolve) => {
    const delay = 200 + Math.random() * 300;
    setTimeout(() => {
      const postCount = userId % 5 + 1; // 1-5 posts
      const posts = Array.from({ length: postCount }, (_, i) => ({
        id: `post-${userId}-${i}`,
        title: `Post ${i} from User ${userId}`,
        date: new Date().toISOString().split('T')[0]
      }));
      resolve(posts);
    }, delay);
  });
};

const fetchUserFollowers = (userId) => {
  return new Promise((resolve) => {
    const delay = 250 + Math.random() * 350;
    setTimeout(() => {
      const followerCount = userId % 3 + 2; // 2-4 followers
      const followers = Array.from({ length: followerCount }, (_, i) => ({
        id: `user-${userId * 10 + i}`,
        name: `Follower ${i} of User ${userId}`
      }));
      resolve(followers);
    }, delay);
  });
};

// ========================================================================================
// 2. PARALLELO CON PROMISE STANDARD
// ========================================================================================

console.log('=== PARALLELO CON PROMISE NATIVE ===');

// Esecuzione sequenziale - per confronto
async function fetchUserDataSequential(userId) {
  log('Fetching user data sequentially', { userId });
  
  const userDetails = await timed(
    () => fetchUserDetails(userId), 
    'fetchUserDetails'
  );
  
  const userPosts = await timed(
    () => fetchUserPosts(userId),
    'fetchUserPosts'
  );
  
  const userFollowers = await timed(
    () => fetchUserFollowers(userId),
    'fetchUserFollowers'
  );
  
  return {
    user: userDetails,
    posts: userPosts,
    followers: userFollowers
  };
}

// Esecuzione in parallelo con Promise.all
async function fetchUserDataParallel(userId) {
  log('Fetching user data in parallel', { userId });
  
  const [userDetails, userPosts, userFollowers] = await timed(
    () => Promise.all([
      fetchUserDetails(userId),
      fetchUserPosts(userId),
      fetchUserFollowers(userId)
    ]),
    'Promise.all'
  );
  
  return {
    user: userDetails,
    posts: userPosts,
    followers: userFollowers
  };
}

// Versione più funzionale con mapping di funzioni
async function fetchUserDataParallelMap(userId) {
  log('Fetching user data with function mapping', { userId });
  
  // Array di funzioni da eseguire
  const fetchFunctions = [
    () => fetchUserDetails(userId),
    () => fetchUserPosts(userId),
    () => fetchUserFollowers(userId)
  ];
  
  // Esecuzione parallela con map
  const results = await timed(
    () => Promise.all(fetchFunctions.map(fn => fn())),
    'Promise.all with map'
  );
  
  return {
    user: results[0],
    posts: results[1],
    followers: results[2]
  };
}

// Funzione di ordine superiore per parallelizzare qualsiasi set di funzioni
const runParallel = (fns) => {
  return Promise.all(fns.map(fn => fn()));
};

// Versione ancora più funzionale con funzione di ordine superiore
async function fetchUserDataFunctional(userId) {
  log('Fetching user data with functional approach', { userId });
  
  const fetchFns = {
    user: () => fetchUserDetails(userId),
    posts: () => fetchUserPosts(userId),
    followers: () => fetchUserFollowers(userId)
  };
  
  const results = await timed(
    () => Promise.all(Object.values(fetchFns).map(fn => fn())),
    'Functional parallel'
  );
  
  // Creazione dell'oggetto risultato usando le chiavi originali
  const keys = Object.keys(fetchFns);
  return keys.reduce((acc, key, i) => ({ ...acc, [key]: results[i] }), {});
}

// ========================================================================================
// 3. PARALLELO CON PROMISE.allSettled E GESTIONE ERRORI
// ========================================================================================

console.log('\n=== GESTIONE ERRORI IN PARALLELO ===');

// API con possibilità di errore
const fetchWithPossibleError = (resource, shouldFail = false) => {
  return new Promise((resolve, reject) => {
    const delay = 200 + Math.random() * 300;
    
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`Failed to fetch ${resource}`));
      } else {
        resolve(`Data from ${resource}`);
      }
    }, delay);
  });
};

// Funzione che esegue richieste in parallelo con gestione errori
async function fetchResourcesWithErrorHandling() {
  log('Fetching resources with possible errors');
  
  const resourcePromises = [
    fetchWithPossibleError('resource1'),
    fetchWithPossibleError('resource2', true), // questa fallirà
    fetchWithPossibleError('resource3'),
    fetchWithPossibleError('resource4', true)  // questa fallirà
  ];
  
  try {
    // Promise.all si blocca al primo errore
    const results = await Promise.all(resourcePromises);
    log('Promise.all results', results);
  } catch (error) {
    log('Promise.all failed completely', error.message);
  }
  
  // Promise.allSettled procede anche in caso di errori
  const settledResults = await Promise.allSettled(resourcePromises);
  log('Promise.allSettled results', settledResults);
  
  // Estrazione dati e gestione errori in stile funzionale
  const processedResults = settledResults.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true, data: result.value };
    } else {
      return { success: false, error: result.reason.message };
    }
  });
  
  log('Processed results', processedResults);
  
  // Versione funzionale per estrarre i valori riusciti
  const successfulValues = settledResults
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
    
  log('Only successful values', successfulValues);
}

// Approccio funzionale per gestire Promise.allSettled in modo più elegante
const partitionResults = results => {
  return results.reduce(
    (acc, result) => {
      if (result.status === 'fulfilled') {
        acc.fulfilled.push(result.value);
      } else {
        acc.rejected.push(result.reason);
      }
      return acc;
    },
    { fulfilled: [], rejected: [] }
  );
};

async function fetchWithPartitioning() {
  log('Fetching with functional partitioning');
  
  const promises = [
    fetchWithPossibleError('resourceA'),
    fetchWithPossibleError('resourceB', true),
    fetchWithPossibleError('resourceC'),
    fetchWithPossibleError('resourceD', true)
  ];
  
  const results = await Promise.allSettled(promises);
  const { fulfilled, rejected } = partitionResults(results);
  
  log('Successful results', fulfilled);
  log('Failed results', rejected.map(err => err.message));
  
  return { successful: fulfilled, failed: rejected };
}

// ========================================================================================
// 4. PARALLELO CONTROLLATO - LIMITARE LA CONCORRENZA
// ========================================================================================

console.log('\n=== PARALLELO CONTROLLATO CON LIMITAZIONE ===');

// Simulazione di un'API con sovraccarico
const resourceIds = Array.from({ length: 10 }, (_, i) => i + 1);

const fetchResource = async (id) => {
  const delay = 200 + Math.random() * 300;
  await new Promise(resolve => setTimeout(resolve, delay));
  return `Resource ${id}`;
};

// Un semplice promisePool che limita la concorrenza
async function promisePool(promiseFns, concurrency) {
  const results = [];
  const executing = new Set();
  
  for (const promiseFn of promiseFns) {
    // Se stiamo già eseguendo il numero massimo di promesse, attendiamo
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
    
    // Crea ed esegue la promessa
    const promise = promiseFn().then(result => {
      executing.delete(promise);
      return result;
    });
    
    executing.add(promise);
    results.push(promise);
  }
  
  // Attendiamo tutte le promesse rimanenti in esecuzione
  return Promise.all(results);
}

// Funzione per dimostrare il pool di promesse
async function demonstratePromisePool() {
  console.log('\n> Running with limited concurrency (3):');
  const start = Date.now();
  
  const resourcePromiseFns = resourceIds.map(
    id => () => fetchResource(id).then(res => {
      const elapsed = Date.now() - start;
      console.log(`[${elapsed}ms] Fetched ${res}`);
      return res;
    })
  );
  
  const results = await promisePool(resourcePromiseFns, 3);
  const totalTime = Date.now() - start;
  console.log(`Completed all ${results.length} tasks in ${totalTime}ms`);
}

// ========================================================================================
// 5. TASK MONAD PER PARALLELISMO
// ========================================================================================

console.log('\n=== TASK MONAD PER OPERAZIONI PARALLELE ===');

// Implementazione base di Task monad
class Task {
  constructor(computation) {
    this.computation = computation;
  }
  
  fork(onRejected, onResolved) {
    return this.computation(onRejected, onResolved);
  }
  
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
  
  // Esecuzione parallela di più task
  static all(tasks) {
    return new Task((reject, resolve) => {
      const results = new Array(tasks.length);
      let completed = 0;
      let rejected = false;
      
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
  
  // Versione di Task.all che continua anche in caso di errori (come Promise.allSettled)
  static allSettled(tasks) {
    return new Task((reject, resolve) => {
      const results = new Array(tasks.length);
      let completed = 0;
      
      tasks.forEach((task, index) => {
        task.fork(
          err => {
            results[index] = { status: 'rejected', reason: err };
            completed += 1;
            
            if (completed === tasks.length) {
              resolve(results);
            }
          },
          value => {
            results[index] = { status: 'fulfilled', value };
            completed += 1;
            
            if (completed === tasks.length) {
              resolve(results);
            }
          }
        );
      });
    });
  }
}

// Creazione di Task dall'API simulata
const resourceTask = (id, shouldFail = false) => {
  return new Task((reject, resolve) => {
    const delay = 300 + Math.random() * 200;
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`Task ${id} failed`));
      } else {
        resolve(`Result from Task ${id}`);
      }
    }, delay);
  });
};

// Esempio di esecuzione parallela con Task
function demonstrateParallelTask() {
  console.log('\n> Task.all execution:');
  
  const tasks = [
    resourceTask(1),
    resourceTask(2),
    resourceTask(3)
  ];
  
  Task.all(tasks).fork(
    err => console.error('Task.all error:', err),
    results => console.log('Task.all results:', results)
  );
  
  console.log('\n> Task.allSettled execution:');
  
  const tasksWithFailure = [
    resourceTask(4),
    resourceTask(5, true),  // This will fail
    resourceTask(6)
  ];
  
  Task.allSettled(tasksWithFailure).fork(
    err => console.error('This should not happen:', err),
    results => {
      console.log('Task.allSettled results:', results);
      
      // Processing in functional style
      const { fulfilled, rejected } = results.reduce(
        (acc, result) => {
          if (result.status === 'fulfilled') {
            acc.fulfilled.push(result.value);
          } else {
            acc.rejected.push(result.reason);
          }
          return acc;
        },
        { fulfilled: [], rejected: [] }
      );
      
      console.log('Successful tasks:', fulfilled);
      console.log('Failed tasks:', rejected.map(err => err.message));
    }
  );
}

// ========================================================================================
// ESECUZIONE DEGLI ESEMPI
// ========================================================================================

async function runAllExamples() {
  try {
    // Promise standard examples
    const sequentialResult = await fetchUserDataSequential(1);
    log('Sequential result', sequentialResult);
    
    const parallelResult = await fetchUserDataParallel(2);
    log('Parallel result', parallelResult);
    
    const mapParallelResult = await fetchUserDataParallelMap(3);
    log('Map parallel result', mapParallelResult);
    
    const functionalResult = await fetchUserDataFunctional(4);
    log('Functional parallel result', functionalResult);
    
    // Error handling examples
    await fetchResourcesWithErrorHandling();
    await fetchWithPartitioning();
    
    // Controlled parallelism
    await demonstratePromisePool();
    
    // Task monad parallelism
    demonstrateParallelTask();
  } catch (error) {
    console.error('Example error:', error);
  }
}

runAllExamples();

// ========================================================================================
// CONCLUSIONI
// ========================================================================================

/**
 * CONFRONTO TRA DIVERSI APPROCCI AL PARALLELISMO:
 * 
 * Promise.all:
 * - PRO: Semplice, ben supportato, integrato in JavaScript
 * - CONTRO: Si interrompe completamente al primo errore
 * 
 * Promise.allSettled:
 * - PRO: Gestione più robusta, continua anche con errori
 * - CONTRO: Requires maggior lavoro per processare i risultati
 * 
 * Promise pool con limitazione:
 * - PRO: Previene sovraccarichi controllando il numero di operazioni simultanee
 * - CONTRO: Implementazione più complessa, non nativa
 * 
 * Task Monad:
 * - PRO: Massima flessibilità, lazy evaluation, composizione
 * - CONTRO: Richiede implementazione personalizzata, curva di apprendimento
 * 
 * PRINCIPI CHIAVE PER IL PARALLELISMO FUNZIONALE:
 * 
 * 1. Immutabilità: Mantieni i dati immutabili per evitare problemi di concorrenza
 * 2. Composizione: Componi operazioni parallele come faresti con funzioni pure
 * 3. Isolamento: Separa la logica degli effetti collaterali dal flusso di dati
 * 4. Idempotenza: Le operazioni parallele dovrebbero essere idempotenti quando possibile
 */
