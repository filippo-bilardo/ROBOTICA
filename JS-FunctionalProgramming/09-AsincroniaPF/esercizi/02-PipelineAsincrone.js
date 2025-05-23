/**
 * Esercizio 2: Pipeline Asincrone
 * 
 * In questo esercizio implementerai pipeline di trasformazione dati asincrone,
 * usando tecniche funzionali per mantenere il codice componibile e leggibile
 */

// ========================================================================================
// UTILITY E FUNZIONI HELPER
// ========================================================================================

// Funzione pipe per comporre funzioni da sinistra a destra
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

// Funzione compose per comporre funzioni da destra a sinistra
const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);

// Helper per debugging
const tap = fn => x => { fn(x); return x; };
const log = label => data => { console.log(`${label}:`, data); return data; };

// Promise di base per ritardare operazioni (utile per simulazioni)
const delay = ms => value => new Promise(resolve => setTimeout(() => resolve(value), ms));

// ========================================================================================
// DATI E API PER GLI ESERCIZI
// ========================================================================================

// API simulate per recuperare dati
const fetchArticles = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 1, title: 'Introduzione a FP', author: 'Mario Rossi', tags: ['functional', 'javascript'], content: 'La programmazione funzionale è un paradigma...' },
        { id: 2, title: 'Promise in JavaScript', author: 'Luigi Verdi', tags: ['javascript', 'async'], content: 'Le Promise sono un modo per gestire...' },
        { id: 3, title: 'Monad Pattern', author: 'Mario Rossi', tags: ['functional', 'patterns'], content: 'I monad sono strutture che incapsulano...' },
        { id: 4, title: 'Async/Await', author: 'Giovanna Bianchi', tags: ['javascript', 'async'], content: 'Async/await è una sintassi che permette...' },
        { id: 5, title: 'Pure Functions', author: 'Carlo Neri', tags: ['functional', 'javascript'], content: 'Le funzioni pure non hanno side effects...' }
      ]);
    }, 300);
  });
};

const fetchAuthorDetails = (authorName) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const authors = {
        'Mario Rossi': { name: 'Mario Rossi', email: 'mario@example.com', bio: 'Esperto di programmazione funzionale' },
        'Luigi Verdi': { name: 'Luigi Verdi', email: 'luigi@example.com', bio: 'Sviluppatore JavaScript' },
        'Giovanna Bianchi': { name: 'Giovanna Bianchi', email: 'giovanna@example.com', bio: 'Software Architect' },
        'Carlo Neri': { name: 'Carlo Neri', email: 'carlo@example.com', bio: 'Docente di informatica' }
      };
      
      resolve(authors[authorName] || { name: authorName, bio: 'Autore' });
    }, 200);
  });
};

const fetchComments = (articleId) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const comments = {
        1: [
          { id: 101, text: 'Ottimo articolo!', user: 'user1' },
          { id: 102, text: 'Molto chiaro', user: 'user2' }
        ],
        2: [
          { id: 201, text: 'Interessante', user: 'user3' }
        ],
        3: [
          { id: 301, text: 'Un po\' complicato', user: 'user2' },
          { id: 302, text: 'Utilissimo', user: 'user4' }
        ],
        4: [],
        5: [
          { id: 501, text: 'Concetti spiegati bene', user: 'user1' }
        ]
      };
      
      resolve(comments[articleId] || []);
    }, 150);
  });
};

// ========================================================================================
// ESERCIZIO 2.1: Creazione di una pipeline di trasformazione con Promise
// ========================================================================================

/**
 * COMPITO:
 * Implementa una pipeline di trasformazione che:
 * 
 * 1. Recupera tutti gli articoli
 * 2. Filtra solo quelli con tag 'functional'
 * 3. Per ogni articolo, arricchisce con i dettagli dell'autore
 * 4. Per ogni articolo, arricchisce con i commenti
 * 5. Formatta l'output per presentarlo (es: conta i commenti, tronca il contenuto)
 * 
 * Usa Promise e composizione funzionale.
 */

function createArticlePipeline() {
  // TODO: Implementa questa funzione
  
  // Suggerimento: queste potrebbero essere alcune delle tue funzioni componibili
  
  // const fetchAllArticles = () => fetchArticles();
  // const filterByTag = tag => articles => articles.filter(...);
  // const enrichWithAuthors = async articles => {...};
  // const enrichWithComments = async articles => {...};
  // const formatOutput = articles => {...};
  
  // return pipe(
  //   fetchAllArticles,
  //   ... altre funzioni ...
  // )();
}

// ========================================================================================
// ESERCIZIO 2.2: Pipeline parallela vs sequenziale
// ========================================================================================

/**
 * COMPITO:
 * Implementa due varianti della pipeline per arricchire gli articoli con dati aggiuntivi:
 * 
 * 1. Una versione che recupera i dettagli aggiuntivi in serie (un articolo alla volta)
 * 2. Una versione che recupera i dettagli aggiuntivi in parallelo (tutti gli articoli contemporaneamente)
 * 
 * Confronta le performance e rifletti sui pro e contro di ogni approccio
 */

// Versione sequenziale
async function enrichArticlesSequential(articles) {
  // TODO: Implementa questa funzione
  // Suggerimento: usa un for-loop o .reduce con async/await
}

// Versione parallela
async function enrichArticlesParallel(articles) {
  // TODO: Implementa questa funzione
  // Suggerimento: usa Promise.all
}

// Funzione per misurare e confrontare le performance
async function comparePerformance() {
  console.log('Comparing performance...');
  
  const articles = await fetchArticles();
  
  // Misura tempo per l'approccio sequenziale
  const sequentialStart = Date.now();
  const sequentialResults = await enrichArticlesSequential(articles);
  const sequentialTime = Date.now() - sequentialStart;
  
  console.log(`Sequential processing took ${sequentialTime}ms`);
  
  // Misura tempo per l'approccio parallelo
  const parallelStart = Date.now();
  const parallelResults = await enrichArticlesParallel(articles);
  const parallelTime = Date.now() - parallelStart;
  
  console.log(`Parallel processing took ${parallelTime}ms`);
  console.log(`Difference: ${sequentialTime - parallelTime}ms`);
  
  // Verifica che entrambi gli approcci producano lo stesso risultato
  console.log('Results are equivalent:',
    JSON.stringify(sequentialResults) === JSON.stringify(parallelResults)
  );
  
  return {
    sequentialTime,
    parallelTime,
    sequentialResults,
    parallelResults
  };
}

// ========================================================================================
// ESERCIZIO 2.3: Implementazione con Task monad
// ========================================================================================

/**
 * COMPITO:
 * Implementa la stessa pipeline dell'Esercizio 2.1, ma questa volta usando Task monad
 * per rappresentare le operazioni asincrone, ottenendo valutazione lazy e migliore componibilità
 */

// Implementazione semplificata di un Task monad
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
  
  // Execute multiple tasks in parallel
  static all(tasks) {
    return new Task((reject, resolve) => {
      const results = new Array(tasks.length);
      let completed = 0;
      
      tasks.forEach((task, i) => {
        task.fork(
          err => reject(err),
          value => {
            results[i] = value;
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

// TODO: Implementa versioni Task delle funzioni di fetch
// const fetchArticlesTask = () => Task.fromPromise(fetchArticles());
// const fetchAuthorDetailsTask = author => Task.fromPromise(fetchAuthorDetails(author));
// const fetchCommentsTask = articleId => Task.fromPromise(fetchComments(articleId));

// TODO: Implementa la pipeline con Task monad
function createArticlePipelineWithTask() {
  // Implementa questa funzione usando Task monad
}

// ========================================================================================
// ESERCIZIO 2.4: Pipeline con backpressure e controllo del flusso
// ========================================================================================

/**
 * COMPITO:
 * Le pipeline parallele possono sovraccaricare le risorse. Implementa una versione
 * che limita il numero di operazioni parallele attive contemporaneamente.
 * 
 * 1. Crea un "pool" di Promise che limita la concorrenza
 * 2. Implementa una funzione che elabora gli articoli limitando le operazioni parallele
 */

// Helper per limitare la concorrenza
async function promisePool(promiseFns, concurrency = 2) {
  // TODO: Implementa questa funzione
  // Suggerimento: mantieni una coda di lavori e massimo `concurrency` Promise attive
}

// Pipeline con controllo del flusso
async function processArticlesWithBackpressure(articles, concurrency = 2) {
  // TODO: Implementa questa funzione usando promisePool
}

// ========================================================================================
// ESECUZIONE DEGLI ESERCIZI
// ========================================================================================

async function runExercises() {
  try {
    // Esercizio 2.1
    console.log('=== ESERCIZIO 2.1 ===');
    // const articles = await createArticlePipeline();
    // console.log('Processed articles:', articles);
    
    // Esercizio 2.2
    console.log('\n=== ESERCIZIO 2.2 ===');
    // await comparePerformance();
    
    // Esercizio 2.3
    console.log('\n=== ESERCIZIO 2.3 ===');
    // const taskPipeline = createArticlePipelineWithTask();
    // taskPipeline.fork(
    //   error => console.error('Task error:', error),
    //   articles => console.log('Task processed articles:', articles)
    // );
    
    // Esercizio 2.4
    console.log('\n=== ESERCIZIO 2.4 ===');
    // const articles = await fetchArticles();
    // console.log('Starting backpressure processing...');
    // const processedArticles = await processArticlesWithBackpressure(articles, 2);
    // console.log('Processed with backpressure:', processedArticles);
    
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
// SOLUZIONE 2.1: Pipeline di trasformazione

function createArticlePipeline() {
  const fetchAllArticles = () => fetchArticles();
  
  const filterByTag = tag => articles => 
    articles.filter(article => article.tags.includes(tag));
  
  const enrichWithAuthors = async articles => {
    const articlesWithAuthors = await Promise.all(
      articles.map(async article => {
        const authorDetails = await fetchAuthorDetails(article.author);
        return { ...article, authorDetails };
      })
    );
    return articlesWithAuthors;
  };
  
  const enrichWithComments = async articles => {
    const articlesWithComments = await Promise.all(
      articles.map(async article => {
        const comments = await fetchComments(article.id);
        return { ...article, comments };
      })
    );
    return articlesWithComments;
  };
  
  const formatOutput = articles => articles.map(article => ({
    ...article,
    commentCount: article.comments.length,
    shortContent: article.content.substring(0, 50) + '...',
    authorBio: article.authorDetails.bio
  }));
  
  // Costruzione della pipeline
  return pipe(
    fetchAllArticles,
    // Osserva i dati che fluiscono nella pipeline
    tap(data => console.log('Fetched articles:', data.length)),
    // Filtra per tag
    filterByTag('functional'),
    tap(data => console.log('Filtered articles:', data.length)),
    // Arricchisci con dati aggiuntivi
    enrichWithAuthors,
    enrichWithComments,
    // Formatta l'output finale
    formatOutput
  )();
}

// SOLUZIONE 2.2: Pipeline parallela vs sequenziale

// Versione sequenziale
async function enrichArticlesSequential(articles) {
  const result = [];
  
  // Processa un articolo alla volta
  for (const article of articles) {
    // Recupera i dati dell'autore
    const authorDetails = await fetchAuthorDetails(article.author);
    
    // Recupera i commenti
    const comments = await fetchComments(article.id);
    
    // Aggiungi l'articolo arricchito ai risultati
    result.push({
      ...article,
      authorDetails,
      comments
    });
  }
  
  return result;
}

// Versione parallela
async function enrichArticlesParallel(articles) {
  // Processa tutti gli articoli contemporaneamente
  return Promise.all(articles.map(async article => {
    // Recupera i dati dell'autore e i commenti in parallelo
    const [authorDetails, comments] = await Promise.all([
      fetchAuthorDetails(article.author),
      fetchComments(article.id)
    ]);
    
    // Restituisci l'articolo arricchito
    return {
      ...article,
      authorDetails,
      comments
    };
  }));
}

// SOLUZIONE 2.3: Implementazione con Task monad

// Task wrappers per le funzioni di fetch
const fetchArticlesTask = () => Task.fromPromise(fetchArticles());
const fetchAuthorDetailsTask = author => Task.fromPromise(fetchAuthorDetails(author));
const fetchCommentsTask = articleId => Task.fromPromise(fetchComments(articleId));

function createArticlePipelineWithTask() {
  // Funzioni pure che lavorano con Task
  const filterArticlesByTag = tag => articles => 
    Task.of(articles.filter(article => article.tags.includes(tag)));
  
  const enrichArticleWithAuthor = article =>
    fetchAuthorDetailsTask(article.author)
      .map(authorDetails => ({ ...article, authorDetails }));
  
  const enrichArticleWithComments = article =>
    fetchCommentsTask(article.id)
      .map(comments => ({ ...article, comments }));
  
  // Combine both enrichments for an article
  const enrichArticle = article =>
    enrichArticleWithAuthor(article)
      .chain(enriched => enrichArticleWithComments(enriched));
  
  const enrichAllArticles = articles =>
    Task.all(articles.map(enrichArticle));
  
  const formatArticles = articles =>
    Task.of(articles.map(article => ({
      ...article,
      commentCount: article.comments.length,
      shortContent: article.content.substring(0, 50) + '...',
      authorBio: article.authorDetails.bio
    })));
  
  // Costruzione della pipeline con Task
  return fetchArticlesTask()
    .map(tap(articles => console.log('Fetched articles:', articles.length)))
    .chain(articles => filterArticlesByTag('functional')(articles))
    .map(tap(articles => console.log('Filtered articles:', articles.length)))
    .chain(enrichAllArticles)
    .chain(formatArticles);
}

// SOLUZIONE 2.4: Pipeline con backpressure

// Helper per limitare la concorrenza
async function promisePool(promiseFns, concurrency = 2) {
  const results = [];
  const executing = new Set();
  
  for (const promiseFn of promiseFns) {
    // Se abbiamo raggiunto il limite di concorrenza, attendiamo che una promessa termini
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
    
    // Creiamo e eseguiamo una nuova promessa
    const promise = promiseFn().then(result => {
      executing.delete(promise);
      return result;
    });
    
    // Aggiungiamo la promessa al set di quelle in esecuzione
    executing.add(promise);
    
    // Salviamo il risultato
    results.push(promise);
  }
  
  // Attendiamo che tutte le promesse ancora in esecuzione terminino
  return Promise.all(results);
}

// Pipeline con controllo del flusso
async function processArticlesWithBackpressure(articles, concurrency = 2) {
  console.log(`Processing ${articles.length} articles with concurrency ${concurrency}`);
  
  // Creazione delle funzioni che restituiscono Promise
  const enrichArticlePromiseFns = articles.map(article => {
    return () => {
      console.log(`Starting processing for article: ${article.id}`);
      
      return Promise.all([
        fetchAuthorDetails(article.author),
        fetchComments(article.id)
      ]).then(([authorDetails, comments]) => {
        console.log(`Completed processing for article: ${article.id}`);
        
        return {
          ...article,
          authorDetails,
          comments,
          commentCount: comments.length,
          processedAt: new Date().toISOString()
        };
      });
    };
  });
  
  // Esegui con concorrenza limitata
  return promisePool(enrichArticlePromiseFns, concurrency);
}
*/
