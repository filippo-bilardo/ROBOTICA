/**
 * Esercizio 1: Refactoring di Codice Asincrono
 * 
 * In questo esercizio, trasformerai gradualmente codice asincrono imperativo
 * in codice funzionale più componibile e manutenibile.
 */

// ========================================================================================
// API SIMULATE PER GLI ESERCIZI
// ========================================================================================

// Database simulato con delay
const DB = {
  users: [
    { id: 1, name: 'Mario Rossi', email: 'mario@example.com' },
    { id: 2, name: 'Giulia Bianchi', email: 'giulia@example.com' },
    { id: 3, name: 'Carlo Verdi', email: 'carlo@example.com' }
  ],
  
  posts: [
    { id: 101, userId: 1, title: 'Introduzione a JS', tags: ['javascript', 'beginner'] },
    { id: 102, userId: 1, title: 'Programmazione Funzionale', tags: ['javascript', 'functional'] },
    { id: 103, userId: 2, title: 'React Hooks', tags: ['react', 'javascript'] },
    { id: 104, userId: 3, title: 'Node.js Avanzato', tags: ['nodejs', 'javascript'] }
  ],
  
  comments: [
    { id: 1001, postId: 101, text: 'Ottimo articolo!' },
    { id: 1002, postId: 101, text: 'Molto utile per principianti' },
    { id: 1003, postId: 102, text: 'Mi piace la programmazione funzionale' },
    { id: 1004, postId: 103, text: 'I hooks hanno rivoluzionato React' }
  ],
  
  // Metodi di accesso con delay simulato
  findUserById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.find(u => u.id === id);
        if (user) {
          resolve(user);
        } else {
          reject(new Error(`User with id ${id} not found`));
        }
      }, 200);
    });
  },
  
  findPostsByUserId(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const posts = this.posts.filter(p => p.userId === userId);
        resolve(posts);
      }, 150);
    });
  },
  
  findCommentsByPostId(postId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const comments = this.comments.filter(c => c.postId === postId);
        resolve(comments);
      }, 100);
    });
  }
};

// ========================================================================================
// ESERCIZIO 1.1: Refactoring di Callback Hell
// ========================================================================================

/**
 * Questo codice utilizza callbacks annidate (callback hell) per ottenere i dati di un 
 * utente, i suoi post e i commenti per il primo post.
 * 
 * COMPITO: Refactoring in due fasi:
 * 1. Prima, converti tutto in Promise con .then() più piatto
 * 2. Poi, converti l'implementazione Promise in async/await
 */

// Versione con callback hell
function getUserContentWithCallbacks(userId, callback) {
  // Recupera informazioni sull'utente
  DB.findUserById(userId, (userError, user) => {
    if (userError) {
      callback(userError);
      return;
    }
    
    // Recupera i post dell'utente
    DB.findPostsByUserId(user.id, (postsError, posts) => {
      if (postsError) {
        callback(postsError);
        return;
      }
      
      if (posts.length === 0) {
        callback(null, { user, posts: [] });
        return;
      }
      
      const firstPost = posts[0];
      
      // Recupera i commenti del primo post
      DB.findCommentsByPostId(firstPost.id, (commentsError, comments) => {
        if (commentsError) {
          callback(commentsError);
          return;
        }
        
        // Assembla l'oggetto finale con i dati raccolti
        const result = {
          user,
          posts: [
            { ...firstPost, comments },
            ...posts.slice(1)
          ]
        };
        
        callback(null, result);
      });
    });
  });
}

// TODO: Implementa la versione con Promise
function getUserContentWithPromises(userId) {
  // Implementa la soluzione qui, usando Promise e .then()
}

// TODO: Implementa la versione con async/await
async function getUserContentWithAsyncAwait(userId) {
  // Implementa la soluzione qui, usando async/await
}

// ========================================================================================
// ESERCIZIO 1.2: Componibilità con Funzioni Pure
// ========================================================================================

/**
 * Spesso il codice asincrono è mescolato con logica di business, rendendo difficile
 * il testing e la manutenzione.
 * 
 * COMPITO: 
 * 1. Refactora la funzione impura in funzioni pure componibili
 * 2. Crea una pipeline funzionale che utilizzi queste funzioni pure
 */

// Versione con logica mescolata e imperativa
async function processUserStats(userId) {
  try {
    // Recupera i dati
    const user = await DB.findUserById(userId);
    const posts = await DB.findPostsByUserId(userId);
    
    // Calcola le statistiche (logica di business)
    let totalTags = 0;
    const tagFrequency = {};
    
    for (const post of posts) {
      totalTags += post.tags.length;
      
      for (const tag of post.tags) {
        if (tagFrequency[tag]) {
          tagFrequency[tag]++;
        } else {
          tagFrequency[tag] = 1;
        }
      }
    }
    
    // Trova i tag più comuni
    let mostCommonTag = null;
    let maxCount = 0;
    
    for (const tag in tagFrequency) {
      if (tagFrequency[tag] > maxCount) {
        mostCommonTag = tag;
        maxCount = tagFrequency[tag];
      }
    }
    
    // Calcola media dei tag per post
    const averageTagsPerPost = posts.length > 0 
      ? totalTags / posts.length 
      : 0;
    
    // Costruisce l'oggetto risultato
    const result = {
      user: {
        id: user.id,
        name: user.name
      },
      stats: {
        totalPosts: posts.length,
        totalTags,
        averageTagsPerPost: parseFloat(averageTagsPerPost.toFixed(2)),
        mostCommonTag: mostCommonTag || 'N/A',
        tagFrequency
      }
    };
    
    return result;
  } catch (error) {
    console.error('Error processing user stats:', error);
    throw error;
  }
}

// TODO: Implementa le funzioni pure
// Ad esempio:
// - fetchUserData(userId) - ritorna un oggetto Promise con user e posts
// - calculateTagStats(posts) - funzione pura che calcola le statistiche dei tag
// - formatUserStats(user, stats) - funzione pura che formatta il risultato

// TODO: Implementa la versione funzionale
function processUserStatsFunctional(userId) {
  // Implementa la soluzione qui, componendo funzioni pure
}

// ========================================================================================
// ESERCIZIO 1.3: Gestione Errori Funzionale
// ========================================================================================

/**
 * La gestione degli errori con try/catch è imperativa e difficile da comporre.
 * 
 * COMPITO:
 * Implementa una versione funzionale utilizzando Either monad o un approccio simile
 * per gestire gli errori in modo componibile.
 */

// Versione con try/catch ovunque
async function searchUsersByKeyword(keyword) {
  try {
    let results = [];
    
    // Cerca utenti che corrispondono alla keyword
    for (let i = 1; i <= 3; i++) {
      try {
        const user = await DB.findUserById(i);
        
        if (user.name.toLowerCase().includes(keyword.toLowerCase()) ||
            user.email.toLowerCase().includes(keyword.toLowerCase())) {
          
          // Cerca i post dell'utente
          try {
            const posts = await DB.findPostsByUserId(user.id);
            
            // Filtra i post che contengono la keyword
            const matchingPosts = posts.filter(post => 
              post.title.toLowerCase().includes(keyword.toLowerCase()) ||
              post.tags.some(tag => tag.includes(keyword.toLowerCase()))
            );
            
            if (matchingPosts.length > 0 || 
                user.name.toLowerCase().includes(keyword.toLowerCase())) {
              results.push({
                user,
                matchingPosts
              });
            }
          } catch (postsError) {
            console.error(`Could not fetch posts for user ${user.id}:`, postsError);
            // Aggiungi l'utente comunque, senza post
            results.push({
              user,
              matchingPosts: [],
              error: 'Failed to fetch posts'
            });
          }
        }
      } catch (userError) {
        console.error(`Could not fetch user ${i}:`, userError);
        // Continua con l'utente successivo
      }
    }
    
    return {
      keyword,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Unexpected error during search:', error);
    return {
      keyword,
      results: [],
      count: 0,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// TODO: Implementa una Either monad semplice o usa un approccio funzionale per gestire gli errori

// TODO: Implementa la versione funzionale con gestione errori componibile
function searchUsersByKeywordFunctional(keyword) {
  // Implementa la soluzione qui utilizzando tecniche funzionali per la gestione degli errori
}

// ========================================================================================
// ESERCIZIO 1.4: Task monad per massima componibilità
// ========================================================================================

/**
 * Implementa un Task monad per eseguire operazioni asincrone in modo componibile e lazy.
 * Poi refactora una delle funzioni precedenti per usare il Task monad.
 */

// TODO: Implementa una semplice Task monad
class Task {
  // Implementa qui il Task monad
}

// TODO: Refactora una delle funzioni precedenti per utilizzare Task
// Ad esempio, converti getUserContentWithPromises o processUserStatsFunctional

// ========================================================================================
// ESECUZIONE DEGLI ESERCIZI
// ========================================================================================

// Verifica le tue implementazioni, decommentando il codice qui sotto
// dopo aver completato gli esercizi

/*
// Esercizio 1.1
console.log('=== Esercizio 1.1 ===');
getUserContentWithPromises(1)
  .then(result => console.log('Promise result:', JSON.stringify(result, null, 2)))
  .catch(error => console.error('Promise error:', error));

getUserContentWithAsyncAwait(1)
  .then(result => console.log('Async/Await result:', JSON.stringify(result, null, 2)))
  .catch(error => console.error('Async/Await error:', error));

// Esercizio 1.2
console.log('\n=== Esercizio 1.2 ===');
processUserStats(1)
  .then(result => console.log('Original result:', JSON.stringify(result, null, 2)))
  .catch(error => console.error('Original error:', error));

processUserStatsFunctional(1)
  .then(result => console.log('Functional result:', JSON.stringify(result, null, 2)))
  .catch(error => console.error('Functional error:', error));

// Esercizio 1.3
console.log('\n=== Esercizio 1.3 ===');
searchUsersByKeyword('javascript')
  .then(result => console.log('Original search result:', JSON.stringify(result, null, 2)))
  .catch(error => console.error('Original search error:', error));

searchUsersByKeywordFunctional('javascript')
  .then(result => console.log('Functional search result:', JSON.stringify(result, null, 2)))
  .catch(error => console.error('Functional search error:', error));

// Esercizio 1.4
console.log('\n=== Esercizio 1.4 ===');
// Testa la tua implementazione Task qui
*/

// ========================================================================================
// SOLUZIONI AGLI ESERCIZI (NON GUARDARE FINCHÉ NON HAI PROVATO TU!)
// ========================================================================================

/*
// SOLUZIONE 1.1 - Refactoring di Callback Hell

// Soluzione con Promise
function getUserContentWithPromises(userId) {
  return DB.findUserById(userId)
    .then(user => {
      return DB.findPostsByUserId(user.id)
        .then(posts => {
          if (posts.length === 0) {
            return { user, posts: [] };
          }
          
          const firstPost = posts[0];
          
          return DB.findCommentsByPostId(firstPost.id)
            .then(comments => {
              return {
                user,
                posts: [
                  { ...firstPost, comments },
                  ...posts.slice(1)
                ]
              };
            });
        });
    });
}

// Soluzione con async/await
async function getUserContentWithAsyncAwait(userId) {
  // Recupera informazioni sull'utente
  const user = await DB.findUserById(userId);
  
  // Recupera i post dell'utente
  const posts = await DB.findPostsByUserId(user.id);
  
  // Se non ci sono post, ritorna subito
  if (posts.length === 0) {
    return { user, posts: [] };
  }
  
  // Recupera i commenti del primo post
  const firstPost = posts[0];
  const comments = await DB.findCommentsByPostId(firstPost.id);
  
  // Assembla l'oggetto finale con i dati raccolti
  return {
    user,
    posts: [
      { ...firstPost, comments },
      ...posts.slice(1)
    ]
  };
}

// SOLUZIONE 1.2 - Componibilità con Funzioni Pure

// Funzioni pure
const fetchUserData = async (userId) => {
  const user = await DB.findUserById(userId);
  const posts = await DB.findPostsByUserId(userId);
  return { user, posts };
};

const calculateTagStats = (posts) => {
  // Calcola le statistiche dei tag
  const tagFrequency = posts.reduce((freq, post) => {
    post.tags.forEach(tag => {
      freq[tag] = (freq[tag] || 0) + 1;
    });
    return freq;
  }, {});
  
  // Calcola numero totale di tag
  const totalTags = posts.reduce((sum, post) => sum + post.tags.length, 0);
  
  // Trova il tag più comune
  const mostCommonTag = Object.entries(tagFrequency)
    .reduce((max, [tag, count]) => 
      count > max.count ? { tag, count } : max,
      { tag: null, count: 0 }
    ).tag;
  
  // Calcola media dei tag per post
  const averageTagsPerPost = posts.length > 0 
    ? parseFloat((totalTags / posts.length).toFixed(2))
    : 0;
  
  return {
    totalTags,
    averageTagsPerPost,
    mostCommonTag: mostCommonTag || 'N/A',
    tagFrequency
  };
};

const formatUserStats = (userData, tagStats) => ({
  user: {
    id: userData.user.id,
    name: userData.user.name
  },
  stats: {
    totalPosts: userData.posts.length,
    ...tagStats
  }
});

// Implementazione funzionale con pipeline
function processUserStatsFunctional(userId) {
  return fetchUserData(userId)
    .then(userData => {
      const tagStats = calculateTagStats(userData.posts);
      return formatUserStats(userData, tagStats);
    });
}

// SOLUZIONE 1.3 - Gestione Errori Funzionale

// Implementazione di Either monad semplice
const Either = {
  Left: value => ({
    isLeft: true,
    isRight: false,
    value,
    map: fn => Either.Left(value),
    chain: fn => Either.Left(value),
    fold: (leftFn, rightFn) => leftFn(value)
  }),
  
  Right: value => ({
    isLeft: false,
    isRight: true,
    value,
    map: fn => {
      try {
        return Either.Right(fn(value));
      } catch (e) {
        return Either.Left(e);
      }
    },
    chain: fn => {
      try {
        return fn(value);
      } catch (e) {
        return Either.Left(e);
      }
    },
    fold: (leftFn, rightFn) => rightFn(value)
  }),
  
  fromPromise: promise =>
    promise
      .then(value => Either.Right(value))
      .catch(error => Either.Left(error)),
  
  fromNullable: value =>
    value != null ? Either.Right(value) : Either.Left(null)
};

// Funzioni pure con Either
const findUserSafely = (userId) => {
  return Either.fromPromise(DB.findUserById(userId));
};

const findPostsSafely = (userId) => {
  return Either.fromPromise(DB.findPostsByUserId(userId));
};

const userMatchesKeyword = (user, keyword) => {
  const lowerKeyword = keyword.toLowerCase();
  return user.name.toLowerCase().includes(lowerKeyword) ||
         user.email.toLowerCase().includes(lowerKeyword);
};

const findMatchingPosts = (posts, keyword) => {
  const lowerKeyword = keyword.toLowerCase();
  return posts.filter(post => 
    post.title.toLowerCase().includes(lowerKeyword) ||
    post.tags.some(tag => tag.includes(lowerKeyword))
  );
};

// Implementazione funzionale
async function searchUsersByKeywordFunctional(keyword) {
  const results = [];
  
  // Processa ogni utente in sequenza usando Either
  for (let i = 1; i <= 3; i++) {
    // Trova l'utente
    const userEither = await findUserSafely(i);
    
    // Processa solo se abbiamo trovato l'utente
    await userEither.fold(
      error => { /* Ignora l'errore e continua */ },
      async user => {
        // Controlla se l'utente corrisponde alla keyword
        if (userMatchesKeyword(user, keyword)) {
          // Trova i post
          const postsEither = await findPostsSafely(user.id);
          
          // Processa i post
          await postsEither.fold(
            error => {
              // Aggiungi l'utente senza post
              results.push({
                user,
                matchingPosts: [],
                error: 'Failed to fetch posts'
              });
            },
            posts => {
              const matchingPosts = findMatchingPosts(posts, keyword);
              
              if (matchingPosts.length > 0 || userMatchesKeyword(user, keyword)) {
                results.push({
                  user,
                  matchingPosts
                });
              }
            }
          );
        }
      }
    );
  }
  
  return {
    keyword,
    results,
    count: results.length,
    timestamp: new Date().toISOString()
  };
}

// SOLUZIONE 1.4 - Task monad

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

// Refactoring di getUserContent con Task
const findUserTask = (userId) => Task.fromPromise(DB.findUserById(userId));
const findPostsTask = (userId) => Task.fromPromise(DB.findPostsByUserId(userId));
const findCommentsTask = (postId) => Task.fromPromise(DB.findCommentsByPostId(postId));

const getUserContentWithTask = (userId) => {
  return findUserTask(userId)
    .chain(user => {
      return findPostsTask(user.id)
        .chain(posts => {
          if (posts.length === 0) {
            return Task.of({ user, posts: [] });
          }
          
          const firstPost = posts[0];
          
          return findCommentsTask(firstPost.id)
            .map(comments => ({
              user,
              posts: [
                { ...firstPost, comments },
                ...posts.slice(1)
              ]
            }));
        });
    });
};

// Test
getUserContentWithTask(1).fork(
  error => console.error('Task error:', error),
  result => console.log('Task result:', JSON.stringify(result, null, 2))
);
*/
