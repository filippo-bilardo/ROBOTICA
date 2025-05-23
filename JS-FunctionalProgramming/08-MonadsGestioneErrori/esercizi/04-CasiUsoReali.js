/**
 * Esercizio: Casi d'Uso Reali
 * 
 * In questo esercizio applicherai i concetti di monads in scenari concreti
 * tipici dello sviluppo software quotidiano.
 */

// Importiamo i monads da utilizzare negli esercizi
const { Maybe, Either } = require('../esempi/01-ImplementazioniBase');
const { IO, Task } = require('../esempi/04-EffettiCollaterali');

// ==========================================
// ESERCIZIO 1: Sistema di configurazione sicura
// ==========================================

/**
 * Implementa un sistema di gestione della configurazione che:
 * 1. Legge in modo sicuro le configurazioni da diverse fonti
 * 2. Fornisce valori predefiniti quando necessario
 * 3. Valida le configurazioni prima dell'utilizzo
 * 
 * Usa Maybe e Either per gestire i valori mancanti e gli errori di validazione.
 */

// Configurazioni di esempio (simulano fonti diverse come file, env, etc)
const configSources = {
  // Configurazione principale
  main: {
    port: 3000,
    database: {
      host: 'localhost',
      port: 5432,
      name: 'appdb',
      // la password manca
    },
    logLevel: 'info'
  },
  
  // Override da variabili d'ambiente (simulato)
  env: {
    port: '8080', // Nota: è una stringa!
    database: {
      host: 'db.example.com'
    }
  },
  
  // Configurazioni da linea di comando (simulato)
  cli: {
    logLevel: 'debug'
  }
};

/**
 * Implementa la funzione getConfig che recupera una configurazione
 * dalle diverse fonti, con priorità: cli > env > main > default.
 * Utilizza Maybe per gestire i valori mancanti.
 */
function getConfig(path, defaultValue) {
  // TODO: implementa questa funzione
  // Suggerimento: la path potrebbe essere qualcosa come 'database.host'
}

/**
 * Implementa la funzione validateConfig che controlla se una configurazione
 * è valida secondo criteri specifici.
 * Utilizza Either per gestire gli errori di validazione.
 */
function validateConfig(config) {
  // TODO: implementa questa funzione
}

/**
 * Funzioni di validazione specializzate per diversi tipi di configurazione
 */

function validatePort(port) {
  // Deve essere un numero tra 0 e 65535
  // TODO: implementa questa funzione
}

function validateDatabaseConfig(dbConfig) {
  // Deve avere host, port e name
  // TODO: implementa questa funzione
}

function validateLogLevel(logLevel) {
  // Deve essere uno tra: debug, info, warn, error
  // TODO: implementa questa funzione
}

/**
 * Crea una configurazione completa unendo le diverse fonti e validandola
 */
function createAppConfig() {
  // TODO: implementa questa funzione che:
  // 1. Recupera tutti i valori di configurazione necessari
  // 2. Converte i tipi se necessario
  // 3. Valida l'intera configurazione
  // 4. Restituisce la configurazione completa o un errore
}

// ==========================================
// ESERCIZIO 2: Gestione di API e risorse esterne
// ==========================================

/**
 * Implementa funzioni che interagiscono con API esterne (simulate) utilizzando
 * Task monad per gestire l'asincronia ed Either per gli errori.
 */

// Stub per simulare chiamate API
function apiCall(endpoint, data, shouldFail = false, failRate = 0.2) {
  return new Task((resolve, reject) => {
    console.log(`Chiamata API a ${endpoint}${data ? ' con dati: ' + JSON.stringify(data) : ''}`);
    
    // Simuliamo un ritardo di rete
    setTimeout(() => {
      // Simuliamo un fallimento casuale o forzato
      if (shouldFail || Math.random() < failRate) {
        reject(new Error(`Errore nella chiamata API a ${endpoint}`));
        return;
      }
      
      // Restituisci dati diversi in base all'endpoint
      switch(endpoint) {
        case '/users':
          resolve([
            { id: 1, name: 'Alice', role: 'admin' },
            { id: 2, name: 'Bob', role: 'user' }
          ]);
          break;
        case '/users/1':
          resolve({ id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' });
          break;
        case '/users/2':
          resolve({ id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' });
          break;
        case '/posts':
          resolve([
            { id: 101, title: 'Intro a FP', userId: 1 },
            { id: 102, title: 'Monads in JS', userId: 1 },
            { id: 103, title: 'React Hooks', userId: 2 }
          ]);
          break;
        case '/login':
          if (data && data.username === 'alice' && data.password === 'secret') {
            resolve({ token: 'valid-jwt-token-for-alice', user: { id: 1, name: 'Alice' } });
          } else {
            reject(new Error('Credenziali non valide'));
          }
          break;
        default:
          resolve({ message: 'Endpoint non riconosciuto' });
      }
    }, 500 + Math.random() * 500); // Ritardo tra 500ms e 1s
  });
}

/**
 * Implementa una funzione che recupera i dettagli di un utente
 * e poi tutti i suoi post, gestendo errori e casi limite.
 */
function getUserWithPosts(userId) {
  // TODO: implementa questa funzione
}

/**
 * Implementa una funzione di login sicura che:
 * 1. Validate input (username, password)
 * 2. Tenta il login tramite API
 * 3. Salva il token JWT ricevuto
 * 4. Gestisce ogni possibile errore in modo elegante
 */
function secureLogin(username, password) {
  // TODO: implementa questa funzione
}

/**
 * Implementa un meccanismo di retry che ritenta una chiamata API
 * se fallisce, con un numero massimo di tentativi e delay esponenziale.
 */
function withRetry(apiFunction, maxRetries = 3) {
  // TODO: implementa questa funzione
}

// ==========================================
// ESERCIZIO 3: Sistema di elaborazione dati transazionale
// ==========================================

/**
 * Implementa un sistema che elabora dati importanti in modo transazionale,
 * assicurando che in caso di errore durante qualsiasi fase, nessun effetto collaterale
 * venga applicato (o vengano applicati solo effetti compensativi).
 * 
 * Usa una combinazione di Task, Either e tecniche funzionali.
 */

// Simuliamo un sistema di elaborazione pagamenti con diverse fasi

// 1. Verifica il saldo dell'utente
function checkBalance(userId, amount) {
  console.log(`Verifico il saldo per l'utente ${userId} per un importo di ${amount}`);
  return new Task((resolve, reject) => {
    setTimeout(() => {
      // Simuliamo diversi casi in base all'utente
      if (userId === 1) {
        // Utente con saldo sufficiente
        resolve({ userId, currentBalance: 1000, sufficient: true });
      } else if (userId === 2) {
        // Utente con saldo insufficiente
        resolve({ userId, currentBalance: 50, sufficient: false });
      } else {
        // Utente non trovato
        reject(new Error(`Utente ${userId} non trovato`));
      }
    }, 300);
  });
}

// 2. Autorizza il pagamento
function authorizePayment(paymentData) {
  console.log(`Autorizzo il pagamento: ${JSON.stringify(paymentData)}`);
  return new Task((resolve, reject) => {
    setTimeout(() => {
      // Simuliamo un errore casuale di rete o API
      if (Math.random() < 0.2) {
        reject(new Error('Errore durante l'autorizzazione del pagamento'));
        return;
      }
      
      resolve({
        ...paymentData,
        authorized: true,
        authCode: `AUTH-${Date.now()}`
      });
    }, 400);
  });
}

// 3. Aggiorna il saldo dell'utente
function updateBalance(userId, amount) {
  console.log(`Aggiorno il saldo per l'utente ${userId} di ${amount}`);
  return new Task((resolve, reject) => {
    setTimeout(() => {
      // Simuliamo un errore nel database
      if (Math.random() < 0.2) {
        reject(new Error('Errore nell'aggiornamento del saldo'));
        return;
      }
      
      resolve({ userId, newBalance: 1000 - amount, success: true });
    }, 350);
  });
}

// 4. Registra la transazione
function logTransaction(transactionData) {
  console.log(`Registro la transazione: ${JSON.stringify(transactionData)}`);
  return new Task((resolve, reject) => {
    setTimeout(() => {
      resolve({
        ...transactionData,
        timestamp: new Date().toISOString(),
        transactionId: `TRX-${Date.now()}`
      });
    }, 200);
  });
}

/**
 * Implementa processPayment che esegue l'intero flusso di pagamento,
 * assicurando che sia transazionale (all-or-nothing).
 */
function processPayment(userId, amount, description) {
  // TODO: implementa questa funzione
}

/**
 * Implementa anche un meccanismo per annullare le operazioni già eseguite
 * in caso di fallimento (es. se l'aggiornamento del saldo fallisce dopo
 * l'autorizzazione, l'autorizzazione dovrebbe essere annullata).
 */
function cancelAuthorization(authData) {
  console.log(`Annullo l'autorizzazione: ${authData.authCode}`);
  return new Task(resolve => {
    setTimeout(() => {
      resolve({ cancelled: true, authCode: authData.authCode });
    }, 250);
  });
}

// ==========================================
// Test dei tuoi esercizi
// ==========================================

function runTests() {
  console.log("===== Test Sistema di Configurazione =====");
  
  console.log("\nRecupero configurazioni:");
  console.log('port:', getConfig('port', 3000).getOrElse('Non trovato'));
  console.log('database.host:', getConfig('database.host', 'localhost').getOrElse('Non trovato'));
  console.log('database.password:', getConfig('database.password', null).getOrElse('Non trovato'));
  console.log('logLevel:', getConfig('logLevel', 'info').getOrElse('Non trovato'));
  
  console.log("\nConfigurazione completa:");
  const configResult = createAppConfig();
  console.log(configResult.toString());
  
  console.log("\n===== Test API e Risorse Esterne =====");
  
  console.log("\nTest recupero utente con post:");
  getUserWithPosts(1).fork(
    data => console.log("Utente con post:", JSON.stringify(data, null, 2)),
    err => console.error("Errore:", err.message)
  );
  
  console.log("\nTest login (credenziali valide):");
  secureLogin('alice', 'secret').fork(
    session => console.log("Login riuscito:", JSON.stringify(session, null, 2)),
    err => console.error("Login fallito:", err.message)
  );
  
  console.log("\nTest login (credenziali non valide):");
  secureLogin('alice', 'wrong').fork(
    session => console.log("Login riuscito:", JSON.stringify(session, null, 2)),
    err => console.error("Login fallito:", err.message)
  );
  
  console.log("\nTest API con retry:");
  // Forziamo un fallimento iniziale con shouldFail=true
  const apiWithRetry = withRetry(() => apiCall('/users', null, true, 1));
  apiWithRetry.fork(
    data => console.log("Risultato dopo retry:", data),
    err => console.error("Fallimento anche dopo retry:", err.message)
  );
  
  console.log("\n===== Test Sistema di Pagamento =====");
  
  console.log("\nTest pagamento valido:");
  processPayment(1, 100, 'Acquisto prodotto').fork(
    result => console.log("Pagamento completato:", JSON.stringify(result, null, 2)),
    err => console.error("Pagamento fallito:", err.message)
  );
  
  console.log("\nTest pagamento con saldo insufficiente:");
  processPayment(2, 100, 'Acquisto prodotto').fork(
    result => console.log("Pagamento completato:", JSON.stringify(result, null, 2)),
    err => console.error("Pagamento fallito:", err.message)
  );
}

// Esegui i test
runTests();
