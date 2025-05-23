/**
 * Composizione di Operazioni Asincrone
 * Tecniche di composizione funzionale con codice asincrono
 */

// ========================================================================================
// FUNZIONI DI UTILITÀ PER LA COMPOSIZIONE
// ========================================================================================

// Funzione pipe per comporre funzioni da sinistra a destra
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

// Funzione compose per comporre funzioni da destra a sinistra
const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);

// ========================================================================================
// 1. COMPOSIZIONE CON PROMISE
// ========================================================================================

// API simulate
const fetchUserFromDb = id => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) {
        reject(new Error('Invalid user ID'));
        return;
      }
      
      resolve({ id, name: `User ${id}`, role: id % 2 === 0 ? 'admin' : 'user' });
    }, 200);
  });
};

const fetchUserPermissions = user => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!user) {
        reject(new Error('User not provided'));
        return;
      }
      
      const permissions = user.role === 'admin'
        ? ['read', 'write', 'delete']
        : ['read'];
        
      resolve({ ...user, permissions });
    }, 200);
  });
};

const fetchUserPreferences = user => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!user) {
        reject(new Error('User not provided'));
        return;
      }
      
      const preferences = {
        theme: user.id % 2 === 0 ? 'dark' : 'light',
        notifications: true,
        language: 'it-IT'
      };
      
      resolve({ ...user, preferences });
    }, 150);
  });
};

// -------- Promise chainable in modo funzionale --------

// Funzioni pure che operano su Promise
const getUser = id => fetchUserFromDb(id);
const addPermissions = userPromise => userPromise.then(fetchUserPermissions);
const addPreferences = userPromise => userPromise.then(fetchUserPreferences);
const logUser = userPromise => userPromise.then(user => {
  console.log('User data:', user);
  return user; // ritorna l'oggetto user per continuare la catena
});

// Approccio funzionale con pipe
console.log('=== COMPOSIZIONE CON PROMISE ===');

// Versione con nested then (tradizionale)
console.log('\n> Nested then:');
getUser(1)
  .then(user => {
    return fetchUserPermissions(user)
      .then(userWithPermissions => {
        return fetchUserPreferences(userWithPermissions);
      });
  })
  .then(finalUser => {
    console.log('Final user data:', finalUser);
  })
  .catch(error => console.error('Error:', error));

// Versione con flat chain (più funzionale)
console.log('\n> Flat promise chain:');
getUser(2)
  .then(fetchUserPermissions)
  .then(fetchUserPreferences)
  .then(finalUser => {
    console.log('Final user data:', finalUser);
  })
  .catch(error => console.error('Error:', error));

// Composizione funzionale di promise
console.log('\n> Funzionale con composizione di promise:');
pipe(
  getUser,
  addPermissions,
  addPreferences,
  logUser
)(3)
  .catch(error => console.error('Error:', error));

// ========================================================================================
// 2. COMPOSIZIONE CON ASYNC/AWAIT
// ========================================================================================

console.log('\n=== COMPOSIZIONE CON ASYNC/AWAIT ===');

// Funzioni pure che usano async/await
const getUserAsync = async id => await fetchUserFromDb(id);
const addPermissionsAsync = async user => await fetchUserPermissions(user);
const addPreferencesAsync = async user => await fetchUserPreferences(user);

// Funzione componibile per recuperare tutti i dati
const getUserDataRegular = async (id) => {
  const user = await getUserAsync(id);
  const userWithPermissions = await addPermissionsAsync(user);
  const userWithEverything = await addPreferencesAsync(userWithPermissions);
  return userWithEverything;
};

// Versione componibile più funzionale
const composeAsync = (...fns) => async (initialValue) => {
  return fns.reduce(
    async (value, fn) => fn(await value),
    Promise.resolve(initialValue)
  );
};

const getUserDataFunctional = id => 
  composeAsync(
    getUserAsync,
    addPermissionsAsync,
    addPreferencesAsync
  )(id);

// Dimostrazione delle funzioni
const showAsyncExample = async () => {
  console.log('\n> Regular async/await:');
  try {
    const userData = await getUserDataRegular(4);
    console.log('Final user data:', userData);
  } catch (error) {
    console.error('Error:', error);
  }
  
  console.log('\n> Functional async/await composition:');
  try {
    const userData = await getUserDataFunctional(5);
    console.log('Final user data:', userData);
  } catch (error) {
    console.error('Error:', error);
  }
};

showAsyncExample();

// ========================================================================================
// 3. COMPOSIZIONE CON TASK MONAD
// ========================================================================================

console.log('\n=== COMPOSIZIONE CON TASK MONAD ===');

// Implementazione semplificata Task monad
class Task {
  constructor(computation) {
    this.computation = computation;
  }
  
  // Esegue il task, chiamando le callback appropriate
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
  
  // Combina più Task in parallelo
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
  
  // Metodi statici factory
  static of(value) {
    return new Task((_, resolve) => resolve(value));
  }
  
  static rejected(error) {
    return new Task(reject => reject(error));
  }
  
  // Funzione di utilità per convertire Promise in Task
  static fromPromise(promise) {
    return new Task((reject, resolve) => {
      promise.then(resolve).catch(reject);
    });
  }
  
  static fromPromiseFn(promiseFn) {
    return (...args) => Task.fromPromise(promiseFn(...args));
  }
}

// Conversione delle nostre API Promise in Task
const getUserTask = id => Task.fromPromiseFn(fetchUserFromDb)(id);
const addPermissionsTask = user => Task.fromPromiseFn(fetchUserPermissions)(user);
const addPreferencesTask = user => Task.fromPromiseFn(fetchUserPreferences)(user);

// Composizione con Task usando chain - versione base
const getUserDataTask = id => {
  return getUserTask(id)
    .chain(addPermissionsTask)
    .chain(addPreferencesTask);
};

// Composizione con Task usando chain - versione con logging
const getUserDataTaskWithLogging = id => {
  return getUserTask(id)
    .map(user => {
      console.log('> Task: User fetched:', user.name);
      return user;
    })
    .chain(addPermissionsTask)
    .map(user => {
      console.log('> Task: Permissions added:', user.permissions);
      return user;
    })
    .chain(addPreferencesTask)
    .map(user => {
      console.log('> Task: Preferences added:', user.preferences);
      return user;
    });
};

// Esempio di esecuzione
console.log('\n> Task composition:');
getUserDataTaskWithLogging(6).fork(
  error => console.error('Task error:', error),
  result => console.log('Task final result:', result)
);

// ========================================================================================
// 4. COMPOSIZIONE ASINCRONA AVANZATA
// ========================================================================================

console.log('\n=== TECNICHE AVANZATE DI COMPOSIZIONE ASINCRONA ===');

// Una funzione helper generica per "liftare" una funzione ordinaria ad operare su Promise
const liftToPromise = fn => async (...args) => fn(...args);

// Trasformazioni di dati pure
const formatUserName = user => ({
  ...user,
  formattedName: `${user.name.toUpperCase()} (${user.role})`
});

const summarizePermissions = user => ({
  ...user,
  permissionSummary: `Has ${user.permissions.length} permissions: ${user.permissions.join(', ')}`
});

// Promise con trasformazioni di dati
console.log('\n> Composizione con trasformazioni:');
getUser(7)
  .then(fetchUserPermissions)
  .then(formatUserName)
  .then(summarizePermissions)
  .then(user => {
    console.log('Transformed user:', user);
  })
  .catch(error => console.error('Error:', error));

// Composizione asincrona con tradeoff
console.log('\n> Composizione con recupero errori incorporato:');

// Funzione robusta che gestisce gli errori internamente
const robustFetch = async (fetchFn, fallbackValue, ...args) => {
  try {
    return await fetchFn(...args);
  } catch (error) {
    console.warn(`Failed with error: ${error.message}. Using fallback.`);
    return fallbackValue;
  }
};

// Composizione con gestione errori
const getRobustUserData = async (id) => {
  // Fallback values
  const userFallback = { id, name: 'Guest', role: 'guest' };
  const permissionsFallback = { permissions: ['read'] };
  const preferencesFallback = { preferences: { theme: 'default', language: 'en-US' } };
  
  // Sequential fetching with fallbacks
  const user = await robustFetch(fetchUserFromDb, userFallback, id);
  const withPermissions = await robustFetch(fetchUserPermissions, { ...user, ...permissionsFallback }, user);
  const withPreferences = await robustFetch(fetchUserPreferences, { ...withPermissions, ...preferencesFallback }, withPermissions);
  
  return withPreferences;
};

// Dimostriamo il recupero dagli errori
const showRobustExample = async () => {
  // Con un ID invalido che causerebbe errori
  const userData = await getRobustUserData(-1);
  console.log('Robust user data despite errors:', userData);
};

showRobustExample();

// ========================================================================================
// CONCLUSIONI E BEST PRACTICES
// ========================================================================================

/**
 * PRINCIPALI PATTERN DI COMPOSIZIONE FUNZIONALE ASINCRONA:
 * 
 * 1. Promise chaining
 *    - .then() permette il flusso semplice di dati attraverso trasformazioni
 *    - Ideale per trasformazioni sequenziali di dati
 * 
 * 2. Async/Await con composizione
 *    - Più leggibile per operazioni sequenziali complesse
 *    - Si integra bene con funzioni di ordine superiore per la composizione
 * 
 * 3. Task monad
 *    - Massimo controllo e componibilità
 *    - Gestione esplicita degli errori e della valutazione
 * 
 * 4. Pattern ibridi
 *    - Combinano elementi di diversi approcci
 *    - Offrono flessibilità in scenari complessi
 * 
 * BEST PRACTICES:
 * 1. Favorire funzioni pure che trasformano i dati
 * 2. Isolare le operazioni con effetti collaterali
 * 3. Utilizzare funzioni di ordine superiore per pattern comuni
 * 4. Gestire gli errori in modo appropriato per ogni livello
 * 5. Considerare le performance nelle composizioni complesse
 */
