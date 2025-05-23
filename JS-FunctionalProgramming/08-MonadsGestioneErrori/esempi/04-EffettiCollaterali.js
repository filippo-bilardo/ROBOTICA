/**
 * Effetti Collaterali
 * Gestione di IO e side effects in stile funzionale
 */

// ==========================================
// IO Monad
// ==========================================

/**
 * IO Monad: incapsula operazioni con effetti collaterali
 * permettendo di trattarle come valori puri e componibili
 */
class IO {
  constructor(effect) {
    if (typeof effect !== 'function') {
      throw new Error('IO richiede una funzione');
    }
    this.effect = effect;
  }

  static of(value) {
    return new IO(() => value);
  }

  map(fn) {
    return new IO(() => fn(this.effect()));
  }

  chain(fn) {
    return new IO(() => fn(this.effect()).effect());
  }

  // Esegue l'effetto collaterale
  run() {
    return this.effect();
  }
}

// ==========================================
// Task Monad (per operazioni asincrone)
// ==========================================

/**
 * Task Monad: simile a IO ma per operazioni asincrone.
 * Concettualmente simile a Promise, ma con semantica lazy.
 */
class Task {
  constructor(computation) {
    this.computation = computation;
  }

  static of(value) {
    return new Task((resolve, reject) => {
      resolve(value);
    });
  }

  static rejected(error) {
    return new Task((_, reject) => {
      reject(error);
    });
  }

  // Trasforma successo e fallimento con funzioni separate
  bimap(successFn, failureFn) {
    return new Task((resolve, reject) => {
      this.computation(
        value => resolve(successFn(value)),
        error => reject(failureFn(error))
      );
    });
  }

  // Trasforma solo i valori di successo
  map(fn) {
    return this.bimap(fn, error => error);
  }

  // Concatena con un'altra Task
  chain(fn) {
    return new Task((resolve, reject) => {
      this.computation(
        value => {
          try {
            fn(value).fork(resolve, reject);
          } catch (error) {
            reject(error);
          }
        },
        error => reject(error)
      );
    });
  }

  // Esegue la computazione asincrona
  fork(onSuccess, onError) {
    try {
      return this.computation(onSuccess, onError);
    } catch (error) {
      onError(error);
    }
  }
}

// ==========================================
// Esempi di utilizzo di IO Monad
// ==========================================

console.log('======== ESEMPI IO MONAD ========');

// Esempio 1: Lettura e scrittura nella console
const getInput = message => new IO(() => {
  console.log(message);
  // In un'applicazione reale, qui leggeremmo l'input dell'utente
  return 'Input simulato';
});

const writeOutput = message => new IO(() => {
  console.log(`Output: ${message}`);
  return message; // ritorna il messaggio per consentire la concatenazione
});

// Componiamo le operazioni IO
const interactWithUser = getInput('Inserisci il tuo nome:')
  .map(input => `Ciao, ${input}!`)
  .chain(writeOutput);

console.log('Simulazione interazione:');
interactWithUser.run();

// Esempio 2: Operazioni sul DOM (simulate)
const getElementValue = id => new IO(() => {
  // In un browser, sarebbe: document.getElementById(id).value
  console.log(`Simulazione lettura valore dell'elemento con id: ${id}`);
  return id === 'email' ? 'user@example.com' : 'User123';
});

const validateEmail = email => new IO(() => {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  console.log(`Validazione email ${email}: ${isValid ? 'valida' : 'non valida'}`);
  return isValid;
});

const setElementClass = (id, className) => new IO(() => {
  // In un browser, sarebbe: document.getElementById(id).className = className
  console.log(`Simulazione impostazione classe '${className}' sull'elemento con id: ${id}`);
  return id; // ritorniamo id per consentire ulteriori operazioni
});

// Componiamo le operazioni
const validateAndUpdateForm = getElementValue('email')
  .chain(email => 
    validateEmail(email).map(isValid => ({ email, isValid }))
  )
  .chain(({ email, isValid }) =>
    setElementClass('emailField', isValid ? 'valid' : 'invalid')
      .map(_ => ({ email, isValid }))
  );

console.log('\nSimulazione validazione form:');
validateAndUpdateForm.run();

// ==========================================
// Esempi di utilizzo di Task Monad
// ==========================================

console.log('\n======== ESEMPI TASK MONAD ========');

// Simuliamo una chiamata API
const fetchUserFromAPI = id => new Task((resolve, reject) => {
  console.log(`Simulazione chiamata API per l'utente con id: ${id}`);
  
  // Simuliamo una risposta asincrona
  setTimeout(() => {
    if (id === 1) {
      resolve({ id: 1, name: 'Alice', email: 'alice@example.com' });
    } else if (id === 2) {
      resolve({ id: 2, name: 'Bob', email: 'bob@example.com' });
    } else {
      reject(new Error(`Utente con id ${id} non trovato`));
    }
  }, 1000);
});

// Simuliamo un salvataggio nel database
const saveToDatabase = user => new Task((resolve, reject) => {
  console.log(`Simulazione salvataggio utente nel database: ${user.name}`);
  
  // Simuliamo un'operazione asincrona
  setTimeout(() => {
    // Esempio: fallisce con un utente specifico
    if (user.name === 'ErrorUser') {
      reject(new Error('Errore di salvataggio nel database'));
    } else {
      resolve({ ...user, savedAt: new Date().toISOString() });
    }
  }, 500);
});

// Utilizziamo Task per gestire operazioni asincrone in sequenza
console.log('\nEsempio 1: Utente esistente');
fetchUserFromAPI(1)
  .map(user => ({ ...user, lastLogin: new Date().toISOString() }))
  .chain(saveToDatabase)
  .fork(
    result => console.log('Successo:', result),
    error => console.error('Errore:', error.message)
  );

console.log('\nEsempio 2: Utente non esistente');
fetchUserFromAPI(999)
  .map(user => ({ ...user, lastLogin: new Date().toISOString() }))
  .chain(saveToDatabase)
  .fork(
    result => console.log('Successo:', result),
    error => console.error('Errore:', error.message)
  );

// ==========================================
// Interazione con API esterne (simulata)
// ==========================================

console.log('\n======== INTERAZIONE CON API ESTERNE ========');

// Simuliamo una risposta HTTP
const mockHttpResponse = (url, delay = 1000, shouldFail = false) => new Task((resolve, reject) => {
  console.log(`Chiamata API a ${url}...`);
  
  setTimeout(() => {
    if (shouldFail) {
      reject(new Error(`Errore nella chiamata a ${url}`));
      return;
    }
    
    // Restituisce dati in base all'URL
    if (url.includes('users')) {
      resolve([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ]);
    } else if (url.includes('products')) {
      resolve([
        { id: 101, name: 'Laptop', price: 999 },
        { id: 102, name: 'Smartphone', price: 699 }
      ]);
    } else {
      resolve({ message: 'Endpoint non riconosciuto' });
    }
  }, delay);
});

// Logger per debugging
const logTask = prefix => data => {
  console.log(`${prefix}:`, data);
  return data;
};

// Composizione di chiamate API in sequenza
const fetchUserAndProducts = mockHttpResponse('https://api.example.com/users')
  .map(logTask('Utenti ricevuti'))
  .chain(users => {
    // Prendiamo l'ID del primo utente
    const firstUserId = users[0].id;
    
    // Facciamo un'altra chiamata API basata sul risultato della prima
    return mockHttpResponse(`https://api.example.com/users/${firstUserId}/products`)
      .map(products => ({ user: users[0], products }));
  });

fetchUserAndProducts
  .fork(
    result => console.log('Dati completi:', JSON.stringify(result, null, 2)),
    error => console.error('Errore nelle API:', error.message)
  );

// Esempio di gestione degli errori in modo elegant
const fetchWithRetry = (url, retries = 3) => {
  const attempt = (retriesLeft) => new Task((resolve, reject) => {
    console.log(`Tentativo chiamata a ${url}, tentativi rimasti: ${retriesLeft}`);
    
    // Simuliamo una chiamata che fallisce il primo tentativo
    mockHttpResponse(url, 500, retriesLeft === retries)
      .fork(
        data => resolve(data),
        err => {
          if (retriesLeft <= 1) {
            reject(new Error(`Tutti i tentativi falliti: ${err.message}`));
          } else {
            console.log(`Tentativo fallito, riprovo...`);
            // Attesa esponenziale tra i tentativi
            setTimeout(() => {
              attempt(retriesLeft - 1).fork(resolve, reject);
            }, 1000 * (retries - retriesLeft + 1));
          }
        }
      );
  });
  
  return attempt(retries);
};

console.log('\nEsempio con retry:');
fetchWithRetry('https://api.example.com/products')
  .fork(
    result => console.log('Prodotti ricevuti dopo retry:', result),
    error => console.error('Errore finale:', error.message)
  );

// Esportiamo le classi per l'utilizzo in altri file
module.exports = { IO, Task };
