/**
 * Da Callbacks a Promise a Async/Await
 * Confronto tra diversi approcci asincroni in JavaScript e refactoring progressivo
 * verso uno stile più funzionale
 */

// ========================================================================================
// 1. APPROCCIO CON CALLBACKS - IL PUNTO DI PARTENZA
// ========================================================================================

// Simuliamo un'API per recuperare dati utente
function fetchUserCallback(userId, callback) {
  console.log(`Fetching user data for user ${userId}...`);
  
  // Simuliamo una chiamata API asincrona con setTimeout
  setTimeout(() => {
    // Simuliamo un database di utenti
    const users = {
      1: { id: 1, name: "Alice", email: "alice@example.com" },
      2: { id: 2, name: "Bob", email: "bob@example.com" },
      3: { id: 3, name: "Charlie", email: "charlie@example.com" }
    };
    
    const user = users[userId];
    
    if (user) {
      callback(null, user);
    } else {
      callback(new Error(`User with id ${userId} not found`));
    }
  }, 300);
}

// Simuliamo un'API per recuperare i post di un utente
function fetchUserPostsCallback(userId, callback) {
  console.log(`Fetching posts for user ${userId}...`);
  
  setTimeout(() => {
    // Database simulato di post
    const postsByUser = {
      1: [
        { id: 101, title: "First post", content: "Hello world" },
        { id: 102, title: "Second post", content: "Functional programming rocks" }
      ],
      2: [
        { id: 201, title: "My journey", content: "It was a dark and stormy night" }
      ],
      3: []
    };
    
    const posts = postsByUser[userId];
    
    if (posts) {
      callback(null, posts);
    } else {
      callback(new Error(`Posts for user ${userId} not found`));
    }
  }, 300);
}

// Simuliamo un'API per recuperare i commenti per un post
function fetchPostCommentsCallback(postId, callback) {
  console.log(`Fetching comments for post ${postId}...`);
  
  setTimeout(() => {
    // Database simulato di commenti
    const commentsByPost = {
      101: [
        { id: 1001, text: "Great post!", author: "User2" },
        { id: 1002, text: "Thanks for sharing", author: "User3" }
      ],
      102: [
        { id: 1003, text: "Interesting", author: "User3" }
      ],
      201: []
    };
    
    const comments = commentsByPost[postId] || [];
    callback(null, comments);
  }, 300);
}

// -------- Utilizzo del pattern callback - Callback hell! --------
function getUserDataWithCallbacks(userId) {
  console.log("=== ESEMPIO CON CALLBACKS ===");
  
  fetchUserCallback(userId, (userError, user) => {
    if (userError) {
      console.error("Error fetching user:", userError);
      return;
    }
    
    console.log("User found:", user);
    
    fetchUserPostsCallback(user.id, (postsError, posts) => {
      if (postsError) {
        console.error("Error fetching posts:", postsError);
        return;
      }
      
      console.log(`Found ${posts.length} posts for user ${user.name}`);
      
      // Aggiungiamo i post all'utente
      const userWithPosts = { ...user, posts };
      
      // Se non ci sono post, restituiamo immediatamente l'utente
      if (posts.length === 0) {
        console.log("Final result:", userWithPosts);
        return;
      }
      
      // Altrimenti, prendiamo i commenti del primo post
      const firstPost = posts[0];
      
      fetchPostCommentsCallback(firstPost.id, (commentsError, comments) => {
        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
          return;
        }
        
        console.log(`Found ${comments.length} comments for post "${firstPost.title}"`);
        
        // Aggiungiamo i commenti al primo post
        const postsWithComments = [
          { ...firstPost, comments },
          ...posts.slice(1)
        ];
        
        const fullUserData = {
          ...user,
          posts: postsWithComments
        };
        
        console.log("Final result:", fullUserData);
      });
    });
  });
}

// ========================================================================================
// 2. APPROCCIO CON PROMISE - UN MIGLIORAMENTO SIGNIFICATIVO
// ========================================================================================

// Convertiamo le funzioni precedenti in Promise
function fetchUser(userId) {
  console.log(`Fetching user data for user ${userId}...`);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = {
        1: { id: 1, name: "Alice", email: "alice@example.com" },
        2: { id: 2, name: "Bob", email: "bob@example.com" },
        3: { id: 3, name: "Charlie", email: "charlie@example.com" }
      };
      
      const user = users[userId];
      
      if (user) {
        resolve(user);
      } else {
        reject(new Error(`User with id ${userId} not found`));
      }
    }, 300);
  });
}

function fetchUserPosts(userId) {
  console.log(`Fetching posts for user ${userId}...`);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const postsByUser = {
        1: [
          { id: 101, title: "First post", content: "Hello world" },
          { id: 102, title: "Second post", content: "Functional programming rocks" }
        ],
        2: [
          { id: 201, title: "My journey", content: "It was a dark and stormy night" }
        ],
        3: []
      };
      
      const posts = postsByUser[userId];
      
      if (posts !== undefined) {
        resolve(posts);
      } else {
        reject(new Error(`Posts for user ${userId} not found`));
      }
    }, 300);
  });
}

function fetchPostComments(postId) {
  console.log(`Fetching comments for post ${postId}...`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const commentsByPost = {
        101: [
          { id: 1001, text: "Great post!", author: "User2" },
          { id: 1002, text: "Thanks for sharing", author: "User3" }
        ],
        102: [
          { id: 1003, text: "Interesting", author: "User3" }
        ],
        201: []
      };
      
      const comments = commentsByPost[postId] || [];
      resolve(comments);
    }, 300);
  });
}

// -------- Utilizzo del pattern Promise - Miglior composizione --------
function getUserDataWithPromises(userId) {
  console.log("\n=== ESEMPIO CON PROMISE ===");
  
  return fetchUser(userId)
    .then(user => {
      console.log("User found:", user);
      
      return fetchUserPosts(user.id)
        .then(posts => {
          console.log(`Found ${posts.length} posts for user ${user.name}`);
          
          // Aggiungiamo i post all'utente
          const userWithPosts = { ...user, posts };
          
          // Se non ci sono post, restituiamo immediatamente l'utente
          if (posts.length === 0) {
            return userWithPosts;
          }
          
          // Altrimenti, prendiamo i commenti del primo post
          const firstPost = posts[0];
          
          return fetchPostComments(firstPost.id)
            .then(comments => {
              console.log(`Found ${comments.length} comments for post "${firstPost.title}"`);
              
              // Aggiungiamo i commenti al primo post
              const postsWithComments = [
                { ...firstPost, comments },
                ...posts.slice(1)
              ];
              
              return {
                ...user,
                posts: postsWithComments
              };
            });
        });
    })
    .catch(error => {
      console.error("Error:", error);
      throw error; // rilanciamo l'errore
    });
}

// Versione alternativa con Promise più funzionale e componibile
function getUserDataWithPromisesFunctional(userId) {
  console.log("\n=== ESEMPIO CON PROMISE (STILE FUNZIONALE) ===");
  
  // Funzioni pure che accettano l'input e restituiscono una nuova Promise
  const addPostsToUser = user => {
    return fetchUserPosts(user.id)
      .then(posts => ({ ...user, posts }));
  };
  
  const addCommentsToFirstPost = userData => {
    if (userData.posts.length === 0) return userData;
    
    const firstPost = userData.posts[0];
    
    return fetchPostComments(firstPost.id)
      .then(comments => {
        const postsWithComments = [
          { ...firstPost, comments },
          ...userData.posts.slice(1)
        ];
        
        return { ...userData, posts: postsWithComments };
      });
  };
  
  // Pipelining funzionale
  return fetchUser(userId)
    .then(user => {
      console.log("User found:", user);
      return user;
    })
    .then(addPostsToUser)
    .then(userData => {
      console.log(`Found ${userData.posts.length} posts for user ${userData.name}`);
      return userData;
    })
    .then(addCommentsToFirstPost)
    .then(result => {
      const commentCount = result.posts.length > 0 && result.posts[0].comments 
        ? result.posts[0].comments.length 
        : 0;
        
      if (commentCount > 0) {
        console.log(`Found ${commentCount} comments for post "${result.posts[0].title}"`);
      }
      
      return result;
    })
    .catch(error => {
      console.error("Error:", error);
      throw error;
    });
}

// ========================================================================================
// 3. APPROCCIO CON ASYNC/AWAIT - MASSIMA LEGGIBILITÀ
// ========================================================================================

async function getUserDataWithAsyncAwait(userId) {
  console.log("\n=== ESEMPIO CON ASYNC/AWAIT ===");
  
  try {
    // Fetch user
    const user = await fetchUser(userId);
    console.log("User found:", user);
    
    // Fetch posts
    const posts = await fetchUserPosts(user.id);
    console.log(`Found ${posts.length} posts for user ${user.name}`);
    
    // Add posts to user
    const userWithPosts = { ...user, posts };
    
    // If no posts, return early
    if (posts.length === 0) {
      return userWithPosts;
    }
    
    // Get comments for the first post
    const firstPost = posts[0];
    const comments = await fetchPostComments(firstPost.id);
    console.log(`Found ${comments.length} comments for post "${firstPost.title}"`);
    
    // Add comments to the first post
    const postsWithComments = [
      { ...firstPost, comments },
      ...posts.slice(1)
    ];
    
    // Return the complete data
    return {
      ...user,
      posts: postsWithComments
    };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Versione funzionale con async/await
async function getUserDataWithAsyncAwaitFunctional(userId) {
  console.log("\n=== ESEMPIO CON ASYNC/AWAIT (STILE FUNZIONALE) ===");
  
  try {
    // Funzioni pure per ogni passo del processo
    const getUser = async (id) => await fetchUser(id);
    
    const addPosts = async (user) => {
      const posts = await fetchUserPosts(user.id);
      return { ...user, posts };
    };
    
    const addCommentsToFirstPost = async (userData) => {
      if (userData.posts.length === 0) return userData;
      
      const firstPost = userData.posts[0];
      const comments = await fetchPostComments(firstPost.id);
      
      const postsWithComments = [
        { ...firstPost, comments },
        ...userData.posts.slice(1)
      ];
      
      return { ...userData, posts: postsWithComments };
    };
    
    // Esecuzione sequenziale con logging
    const user = await getUser(userId);
    console.log("User found:", user);
    
    const userWithPosts = await addPosts(user);
    console.log(`Found ${userWithPosts.posts.length} posts for user ${user.name}`);
    
    const result = await addCommentsToFirstPost(userWithPosts);
    
    const firstPost = result.posts[0];
    if (firstPost && firstPost.comments) {
      console.log(`Found ${firstPost.comments.length} comments for post "${firstPost.title}"`);
    }
    
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// ========================================================================================
// 4. APPROCCIO MONADIC CON TASK - MASSIMO CONTROLLO
// ========================================================================================

// Implementazione semplificata di un Task monad
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
  
  // Metodi statici factory
  static of(value) {
    return new Task((_, resolve) => resolve(value));
  }
  
  static rejected(error) {
    return new Task(reject => reject(error));
  }
  
  // Converte una Promise in Task
  static fromPromise(promise) {
    return new Task((reject, resolve) => {
      promise.then(resolve).catch(reject);
    });
  }
  
  // Converte una funzione che ritorna Promise in una che ritorna Task
  static fromPromiseFn(promiseFn) {
    return (...args) => Task.fromPromise(promiseFn(...args));
  }
}

// Convertiamo le nostre funzioni che ritornano Promise in funzioni che ritornano Task
const fetchUserTask = id => Task.fromPromiseFn(fetchUser)(id);
const fetchUserPostsTask = id => Task.fromPromiseFn(fetchUserPosts)(id);
const fetchPostCommentsTask = id => Task.fromPromiseFn(fetchPostComments)(id);

// Implementazione con Task monad
function getUserDataWithTask(userId) {
  console.log("\n=== ESEMPIO CON TASK MONAD ===");
  
  // Definiamo la serie di operazioni (composizione lazy, non eseguita immediatamente)
  const userTask = fetchUserTask(userId)
    .chain(user => {
      console.log("User found:", user);
      
      return fetchUserPostsTask(user.id)
        .map(posts => {
          console.log(`Found ${posts.length} posts for user ${user.name}`);
          return { user, posts };
        });
    })
    .chain(({ user, posts }) => {
      // Add posts to user
      const userWithPosts = { ...user, posts };
      
      // If no posts, return early
      if (posts.length === 0) {
        return Task.of(userWithPosts);
      }
      
      // Get comments for the first post
      const firstPost = posts[0];
      
      return fetchPostCommentsTask(firstPost.id)
        .map(comments => {
          console.log(`Found ${comments.length} comments for post "${firstPost.title}"`);
          
          // Add comments to the first post
          const postsWithComments = [
            { ...firstPost, comments },
            ...posts.slice(1)
          ];
          
          // Return the complete data
          return {
            ...user,
            posts: postsWithComments
          };
        });
    });
  
  // Fork esegue effettivamente il Task
  userTask.fork(
    error => console.error("Task error:", error),
    result => console.log("Final result:", result)
  );
  
  return userTask; // Ritorniamo il task per composizioni successive
}

// ========================================================================================
// ESECUZIONE DEGLI ESEMPI
// ========================================================================================

// Esempio con callbacks
getUserDataWithCallbacks(1);

// Esempio con promise
getUserDataWithPromises(1)
  .then(result => console.log("Final result:", result))
  .catch(error => console.error("Final error:", error));

// Esempio con promise in stile funzionale
getUserDataWithPromisesFunctional(1)
  .then(result => console.log("Final result:", result))
  .catch(error => console.error("Final error:", error));

// Esempio con async/await
getUserDataWithAsyncAwait(1)
  .then(result => console.log("Final result:", result))
  .catch(error => console.error("Final error:", error));

// Esempio con async/await in stile funzionale
getUserDataWithAsyncAwaitFunctional(1)
  .then(result => console.log("Final result:", result))
  .catch(error => console.error("Final error:", error));

// Esempio con Task monad
getUserDataWithTask(1);

// ========================================================================================
// CONCLUSIONE E CONFRONTO
// ========================================================================================

/**
 * CONFRONTO TRA GLI APPROCCI:
 * 
 * 1. Callbacks:
 *    - PRO: Supporto universale, nessuna dipendenza
 *    - CONTRO: Callback hell, gestione errori complessa, non componibile
 * 
 * 2. Promise:
 *    - PRO: Migliore composizione, gestione centralizzata errori, chainability
 *    - CONTRO: Sintassi verbosa per flussi complessi, eager evaluation
 * 
 * 3. Async/Await:
 *    - PRO: Sintassi pulita e lineare, gestione errori con try/catch, debugging facile
 *    - CONTRO: Ancora eager evaluation, nessun supporto nativo per cancellazione
 * 
 * 4. Task Monad:
 *    - PRO: Lazy evaluation, alta componibilità, cancellabilità, isolamento effetti
 *    - CONTRO: Curva di apprendimento, verbosità, richiede libreria o implementazione
 * 
 * EVOLUZIONE DELLO STILE:
 * Callback (imperativo) → Promise (mix) → Async/Await (imperativo/dichiarativo) → Task (funzionale)
 */
