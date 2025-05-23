/**
 * Esercizio 3: Gestione Errori Avanzata
 * 
 * In questo esercizio esplorerai pattern avanzati di gestione degli errori
 * nelle operazioni asincrone usando un approccio funzionale.
 */

// ========================================================================================
// UTILITY E FUNZIONI HELPER
// ========================================================================================

// Utility per logging
const log = (label) => (data) => { 
  console.log(`[${label}]`, data); 
  return data;
};

// ========================================================================================
// API SIMULATE PER GLI ESERCIZI
// ========================================================================================

// Simulazione di API con possibili errori
const api = {
  fetchUser: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simula errori casuali
        if (Math.random() < 0.3) {
          reject(new Error(`Network error fetching user ${id}`));
          return;
        }
        
        if (id <= 0) {
          reject(new Error(`Invalid user id: ${id}`));
          return;
        }
        
        if (id > 10) {
          reject(new Error(`User ${id} not found`));
          return;
        }
        
        resolve({
          id,
          name: `User ${id}`,
          email: `user${id}@example.com`
        });
      }, 300);
    });
  },
  
  fetchUserPermissions: (userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simula errori casuali
        if (Math.random() < 0.2) {
          reject(new Error(`Database error fetching permissions for user ${userId}`));
          return;
        }
        
        if (userId <= 0) {
          reject(new Error(`Invalid user id: ${userId}`));
          return;
        }
        
        // Utenti pari hanno permessi admin, dispari solo user
        resolve({
          userId,
          roles: userId % 2 === 0 ? ['user', 'admin'] : ['user'],
          canEdit: userId % 2 === 0
        });
      }, 200);
    });
  },
  
  fetchUserPosts: (userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simula errori casuali
        if (Math.random() < 0.2) {
          reject(new Error(`Service unavailable fetching posts for user ${userId}`));
          return;
        }
        
        if (userId <= 0) {
          reject(new Error(`Invalid user id: ${userId}`));
          return;
        }
        
        // Simula risultati - 3 post per utenti dispari, 2 per pari
        const postCount = userId % 2 === 0 ? 2 : 3;
        const posts = Array.from({ length: postCount }, (_, i) => ({
          id: `${userId}-${i+1}`,
          title: `Post ${i+1} by user ${userId}`,
          content: `Content of post ${i+1}`
        }));
        
        resolve(posts);
      }, 250);
    });
  }
};

// ========================================================================================
// ESERCIZIO 3.1: Implementazione di Either monad per gestione errori
// ========================================================================================

/**
 * COMPITO:
 * Implementa una versione completa di Either monad per gestire gli errori in modo funzionale.
 * Poi utilizza questa implementazione per gestire gli errori nelle chiamate API.
 */

// TODO: Implementa Either monad
const Either = {
  // Implementa Left e Right, insieme ai metodi map, chain, fold, ecc.
};

// TODO: Funzioni di utility per lavorare con Either
const tryCatch = (fn) => {
  // Implementa una funzione che prende una funzione che potrebbe lanciare un errore
  // e la trasforma in una funzione che restituisce un Either
};

// TODO: Versioni delle API che restituiscono Either
const fetchUserEither = (id) => {
  // Implementa con Either
};

const fetchUserPermissionsEither = (userId) => {
  // Implementa con Either
};

const fetchUserPostsEither = (userId) => {
  // Implementa con Either
};

// TODO: Implementa una funzione che usa le versioni Either delle API per recuperare
// informazioni complete dell'utente gestendo gli errori in modo funzionale
const getUserInfoWithEither = (userId) => {
  // Implementa con Either
};

// ========================================================================================
// ESERCIZIO 3.2: Pattern di retry con backoff esponenziale
// ========================================================================================

/**
 * COMPITO:
 * Implementa un pattern di retry con backoff esponenziale per le operazioni asincrone.
 * Il pattern dovrebbe tentare di nuovo l'operazione un numero specificato di volte,
 * aumentando il tempo di attesa tra un tentativo e l'altro.
 */

// TODO: Implementa una funzione che applica retry con backoff esponenziale
const withRetry = (asyncFn, { maxRetries = 3, baseDelay = 300, factor = 2 } = {}) => {
  // Implementa questa funzione
};

// TODO: Applica questo pattern alle chiamate API
const fetchUserWithRetry = (userId) => {
  // Implementa con withRetry
};

// ========================================================================================
// ESERCIZIO 3.3: Pattern di fallback e degradazione delle funzionalità
// ========================================================================================

/**
 * COMPITO:
 * Implementa un pattern di fallback che permetta di degradare le funzionalità
 * quando determinate operazioni falliscono.
 */

// TODO: Implementa una funzione withFallback
const withFallback = (asyncFn, fallbackFn) => {
  // Implementa questa funzione
};

// TODO: Implementa una versione delle API con fallback
const getUserWithFallback = (userId) => {
  // Se fetchUser fallisce, usa una versione limitata delle informazioni utente
};

// TODO: Implementa una funzione che compone varie API con strategia di fallback
const getUserDashboardData = (userId) => {
  // Implementa questa funzione usando withFallback per diverse parti dell'UI
};

// ========================================================================================
// ESERCIZIO 3.4: Task monad con gestione errori componibile
// ========================================================================================

/**
 * COMPITO:
 * Estendi l'implementazione di Task monad per includere metodi specializzati
 * per la gestione degli errori in modo componibile.
 */

// Implementazione base di Task
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
}

// TODO: Estendi la classe Task con metodi per gestione errori
// Ad esempio:
//  - orElse(fn) - se la task fallisce, esegue fn
//  - retry(times, delay) - riprova l'operazione in caso di fallimento
//  - timeout(ms) - fallisce se l'operazione impiega più di ms millisecondi
//  - recover(fn) - se la task fallisce, usa fn per provare a recuperare

// TODO: Utilizza Task esteso per implementare una pipeline robusta
const getUserDataWithTask = (userId) => {
  // Implementa questa funzione usando Task con gestione errori avanzata
};

// ========================================================================================
// ESECUZIONE DEGLI ESERCIZI
// ========================================================================================

async function runExercises() {
  try {
    // Esercizio 3.1
    console.log('=== ESERCIZIO 3.1: Either monad ===');
    // getUserInfoWithEither(2).fold(
    //   error => console.error('Either error:', error),
    //   result => console.log('Either result:', result)
    // );
    
    // Esercizio 3.2
    console.log('\n=== ESERCIZIO 3.2: Retry pattern ===');
    // try {
    //   const user = await fetchUserWithRetry(3);
    //   console.log('User after retry:', user);
    // } catch (error) {
    //   console.error('Still failed after retries:', error);
    // }
    
    // Esercizio 3.3
    console.log('\n=== ESERCIZIO 3.3: Fallback pattern ===');
    // try {
    //   const dashboardData = await getUserDashboardData(4);
    //   console.log('Dashboard data:', dashboardData);
    // } catch (error) {
    //   console.error('Failed to load dashboard:', error);
    // }
    
    // Esercizio 3.4
    console.log('\n=== ESERCIZIO 3.4: Task con gestione errori ===');
    // getUserDataWithTask(5).fork(
    //   error => console.error('Task error:', error),
    //   result => console.log('Task result:', result)
    // );
    
  } catch (error) {
    console.error('Error running exercises:', error);
  }
}

// Decommentare per eseguire gli esercizi
// runExercises();

// ========================================================================================
// SOLUZIONI AGLI ESERCIZI (NON GUARDARE FINCHÉ NON HAI PROVATO!)
// ========================================================================================

/*
// SOLUZIONE 3.1: Either monad per gestione errori

// Implementazione di Either monad
const Either = {
  Left: (value) => ({
    isLeft: true,
    isRight: false,
    value,
    map: (fn) => Either.Left(value),
    chain: (fn) => Either.Left(value),
    fold: (leftFn, rightFn) => leftFn(value),
    orElse: (fn) => fn(value),
    toString: () => `Left(${value})`,
  }),
  
  Right: (value) => ({
    isLeft: false,
    isRight: true,
    value,
    map: (fn) => {
      try {
        return Either.Right(fn(value));
      } catch (e) {
        return Either.Left(e);
      }
    },
    chain: (fn) => {
      try {
        return fn(value);
      } catch (e) {
        return Either.Left(e);
      }
    },
    fold: (leftFn, rightFn) => rightFn(value),
    orElse: () => Either.Right(value),
    toString: () => `Right(${JSON.stringify(value)})`,
  }),
  
  fromNullable: (value) => 
    value != null ? Either.Right(value) : Either.Left(new Error('Value is null or undefined')),
  
  tryCatch: (fn) => {
    try {
      return Either.Right(fn());
    } catch (e) {
      return Either.Left(e);
    }
  },
  
  fromPromise: async (promise) => {
    try {
      const result = await promise;
      return Either.Right(result);
    } catch (e) {
      return Either.Left(e);
    }
  }
};

// Funzioni di utility per Either
const tryCatch = (fn) => (...args) => {
  try {
    return Either.Right(fn(...args));
  } catch (e) {
    return Either.Left(e);
  }
};

const tryCatchAsync = (promiseFn) => (...args) => {
  return promiseFn(...args)
    .then(result => Either.Right(result))
    .catch(error => Either.Left(error));
};

// Versioni delle API che restituiscono Either
const fetchUserEither = (id) => 
  tryCatchAsync(api.fetchUser)(id);

const fetchUserPermissionsEither = (userId) => 
  tryCatchAsync(api.fetchUserPermissions)(userId);

const fetchUserPostsEither = (userId) => 
  tryCatchAsync(api.fetchUserPosts)(userId);

// Funzione che usa le versioni Either delle API
const getUserInfoWithEither = async (userId) => {
  // Funzione helper per processare la risposta di Either.fromPromise
  const processEither = (either) => {
    if (either.isLeft) {
      return Either.Left(either.value);
    }
    return Either.Right(either.value);
  };
  
  // Funzione che aggiunge i permessi all'utente
  const addPermissions = (user) => {
    return fetchUserPermissionsEither(user.id)
      .then(processEither)
      .then(permissionsEither => 
        permissionsEither.map(permissions => ({ ...user, permissions }))
      );
  };
  
  // Funzione che aggiunge i post all'utente
  const addPosts = (userWithPermissions) => {
    return fetchUserPostsEither(userWithPermissions.id)
      .then(processEither)
      .then(postsEither => 
        postsEither.map(posts => ({ ...userWithPermissions, posts }))
      );
  };
  
  // Pipeline di operazioni con Either
  const eitherUser = await fetchUserEither(userId)
    .then(processEither);
  
  if (eitherUser.isLeft) {
    return eitherUser;
  }
  
  const eitherWithPermissions = await addPermissions(eitherUser.value);
  
  if (eitherWithPermissions.isLeft) {
    // Fallback per i permessi se non possiamo ottenerli
    return Either.Right({
      ...eitherUser.value,
      permissions: { roles: ['guest'], canEdit: false },
      permissionsError: eitherWithPermissions.value.message
    });
  }
  
  const eitherComplete = await addPosts(eitherWithPermissions.value);
  
  if (eitherComplete.isLeft) {
    // Fallback per i post se non possiamo ottenerli
    return Either.Right({
      ...eitherWithPermissions.value,
      posts: [],
      postsError: eitherComplete.value.message
    });
  }
  
  return eitherComplete;
};

// SOLUZIONE 3.2: Retry con backoff esponenziale

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = (asyncFn, { maxRetries = 3, baseDelay = 300, factor = 2 } = {}) => {
  return async (...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Se è il primo tentativo, eseguiamo subito
        if (attempt > 0) {
          // Calcola il delay per questo tentativo (backoff esponenziale)
          const delay = baseDelay * Math.pow(factor, attempt - 1);
          console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
          await wait(delay);
        }
        
        return await asyncFn(...args);
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error.message);
        lastError = error;
        
        // Se è l'ultimo tentativo, lancia l'errore
        if (attempt === maxRetries) {
          throw new Error(`All ${maxRetries + 1} attempts failed. Last error: ${lastError.message}`);
        }
      }
    }
  };
};

const fetchUserWithRetry = withRetry(api.fetchUser, { 
  maxRetries: 3, 
  baseDelay: 500, 
  factor: 2 
});

const fetchUserPermissionsWithRetry = withRetry(api.fetchUserPermissions, {
  maxRetries: 2,
  baseDelay: 300,
  factor: 1.5
});

const fetchUserPostsWithRetry = withRetry(api.fetchUserPosts, {
  maxRetries: 2,
  baseDelay: 400,
  factor: 1.5
});

// SOLUZIONE 3.3: Pattern di fallback

const withFallback = (asyncFn, fallbackFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      console.log(`Operation failed, using fallback:`, error.message);
      return fallbackFn(...args, error);
    }
  };
};

const getUserWithFallback = withFallback(
  api.fetchUser,
  (userId, error) => {
    console.log(`Using fallback user data for user ${userId}`);
    return {
      id: userId,
      name: `Guest User ${userId}`,
      email: 'guest@example.com',
      isPartialData: true,
      error: error.message
    };
  }
);

const getUserPermissionsWithFallback = withFallback(
  api.fetchUserPermissions,
  (userId, error) => {
    console.log(`Using fallback permissions for user ${userId}`);
    return {
      userId,
      roles: ['guest'],
      canEdit: false,
      isPartialData: true,
      error: error.message
    };
  }
);

const getUserPostsWithFallback = withFallback(
  api.fetchUserPosts,
  (userId, error) => {
    console.log(`Using fallback posts for user ${userId}`);
    return [];
  }
);

const getUserDashboardData = async (userId) => {
  // Utilizziamo Promise.allSettled per eseguire tutte le richieste indipendentemente
  // dai fallimenti individuali. Per ciascuna, usiamo già la versione con fallback.
  const [userResult, permissionsResult, postsResult] = await Promise.all([
    getUserWithFallback(userId),
    getUserPermissionsWithFallback(userId),
    getUserPostsWithFallback(userId)
  ]);
  
  // Costruisci l'oggetto dashboard con i dati disponibili
  return {
    user: userResult,
    permissions: permissionsResult,
    posts: postsResult,
    dashboardReady: true,
    hasPartialData: userResult.isPartialData || 
                    permissionsResult.isPartialData || 
                    postsResult.length === 0,
    timestamp: new Date().toISOString()
  };
};

// SOLUZIONE 3.4: Task monad con gestione errori

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
  
  // Gestione degli errori avanzata
  orElse(fn) {
    return new Task((reject, resolve) => {
      this.computation(
        error => {
          try {
            fn(error).fork(reject, resolve);
          } catch (e) {
            reject(e);
          }
        },
        resolve
      );
    });
  }
  
  recover(fn) {
    return new Task((reject, resolve) => {
      this.computation(
        error => {
          try {
            resolve(fn(error));
          } catch (e) {
            reject(e);
          }
        },
        resolve
      );
    });
  }
  
  retry({ times = 3, delay = 300, factor = 2 } = {}) {
    return new Task((reject, resolve) => {
      const attempt = (remaining) => {
        this.fork(
          error => {
            if (remaining <= 0) {
              reject(error);
              return;
            }
            
            console.log(`Task retry: ${times - remaining + 1}/${times}`);
            setTimeout(() => attempt(remaining - 1), delay * Math.pow(factor, times - remaining));
          },
          resolve
        );
      };
      
      attempt(times);
    });
  }
  
  timeout(ms) {
    return new Task((reject, resolve) => {
      let completed = false;
      const timeoutId = setTimeout(() => {
        if (!completed) {
          completed = true;
          reject(new Error(`Task timed out after ${ms}ms`));
        }
      }, ms);
      
      this.fork(
        error => {
          if (!completed) {
            completed = true;
            clearTimeout(timeoutId);
            reject(error);
          }
        },
        value => {
          if (!completed) {
            completed = true;
            clearTimeout(timeoutId);
            resolve(value);
          }
        }
      );
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
  
  static fromCallback(fn) {
    return new Task((reject, resolve) => {
      fn((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  
  static all(tasks) {
    return new Task((reject, resolve) => {
      const results = new Array(tasks.length);
      let completed = 0;
      
      tasks.forEach((task, i) => {
        task.fork(
          err => reject(err),
          value => {
            results[i] = value;
            completed++;
            
            if (completed === tasks.length) {
              resolve(results);
            }
          }
        );
      });
    });
  }
}

// Utilizzo di Task esteso
const fetchUserTask = (userId) => Task.fromPromise(api.fetchUser(userId));
const fetchUserPermissionsTask = (userId) => Task.fromPromise(api.fetchUserPermissions(userId));
const fetchUserPostsTask = (userId) => Task.fromPromise(api.fetchUserPosts(userId));

// Helper per trasformare ogni API in una versione robusta con retry e fallback
const robustUserTask = (userId) => 
  fetchUserTask(userId)
    .retry({ times: 2 })
    .recover(error => ({
      id: userId,
      name: `Guest User ${userId}`,
      email: 'guest@example.com',
      isPartialData: true,
      error: error.message
    }));

const robustPermissionsTask = (userId) =>
  fetchUserPermissionsTask(userId)
    .retry({ times: 2 })
    .recover(error => ({
      userId,
      roles: ['guest'],
      canEdit: false,
      isPartialData: true,
      error: error.message
    }));

const robustPostsTask = (userId) =>
  fetchUserPostsTask(userId)
    .retry({ times: 2 })
    .recover(error => []);

const getUserDataWithTask = (userId) => {
  return Task.all([
    robustUserTask(userId),
    robustPermissionsTask(userId),
    robustPostsTask(userId)
  ]).map(([user, permissions, posts]) => {
    return {
      user,
      permissions,
      posts,
      hasPartialData: user.isPartialData || permissions.isPartialData || posts.length === 0,
      timestamp: new Date().toISOString()
    };
  }).timeout(5000);
};
*/
