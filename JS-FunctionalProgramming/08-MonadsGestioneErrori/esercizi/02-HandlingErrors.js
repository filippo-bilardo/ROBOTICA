/**
 * Esercizio: Handling Errors
 * 
 * In questo esercizio implementerai e utilizzerai l'Either monad
 * per gestire errori in modo funzionale.
 */

// ==========================================
// ESERCIZIO 1: Implementazione di Either Monad
// ==========================================

// Implementa l'Either monad secondo la specifica seguente:

/**
 * Either Monad - Classe base
 * Implementa i seguenti metodi:
 * - of(value): metodo statico che crea un Right con il valore specificato
 * - left(value): metodo statico che crea un Left con il valore di errore
 * - right(value): metodo statico che crea un Right con il valore specificato
 * - fromTry(fn): metodo statico che esegue una funzione e cattura eventuali eccezioni
 * - map(fn): applica una funzione al valore se Right, ritorna this se Left
 * - mapLeft(fn): applica una funzione al valore di errore se Left, ritorna this se Right
 * - chain(fn): applica una funzione che ritorna un Either al valore se Right
 * - fold(leftFn, rightFn): esegue leftFn sul valore se Left, rightFn sul valore se Right
 * - getOrElse(defaultValue): ritorna il valore o il default se Left
 * - toString(): rappresentazione stringa dell'Either
 */

// TODO: implementa Either, Left e Right

// ==========================================
// ESERCIZIO 2: Validazione e parsing di dati
// ==========================================

// Creiamo funzioni di validazione componibili utilizzando Either

/**
 * Implementa le seguenti funzioni di validazione:
 * 
 * 1. validateNonEmpty(str, errorMsg): verifica che la stringa non sia vuota
 * 2. validateMinLength(str, minLength, errorMsg): verifica che la stringa abbia una lunghezza minima
 * 3. validateMaxLength(str, maxLength, errorMsg): verifica che la stringa non superi una lunghezza massima
 * 4. validateNumeric(str, errorMsg): verifica che la stringa contenga solo numeri
 * 5. validateEmail(str, errorMsg): verifica che la stringa sia un'email valida
 * 6. validateRange(num, min, max, errorMsg): verifica che il numero sia nell'intervallo [min, max]
 * 7. parseInteger(str, errorMsg): converte una stringa in intero
 * 8. validateAnd(validators): combina più validatori in AND (tutti devono passare)
 * 
 * Ogni funzione dovrebbe ritornare un Either.
 */

function validateNonEmpty(str, errorMsg = 'Il valore non può essere vuoto') {
  // TODO: implementa questa funzione
}

function validateMinLength(str, minLength, errorMsg = `Il valore deve essere lungo almeno ${minLength} caratteri`) {
  // TODO: implementa questa funzione
}

function validateMaxLength(str, maxLength, errorMsg = `Il valore non può superare ${maxLength} caratteri`) {
  // TODO: implementa questa funzione
}

function validateNumeric(str, errorMsg = 'Il valore deve contenere solo numeri') {
  // TODO: implementa questa funzione
}

function validateEmail(str, errorMsg = 'Email non valida') {
  // TODO: implementa questa funzione
}

function validateRange(num, min, max, errorMsg = `Il valore deve essere compreso tra ${min} e ${max}`) {
  // TODO: implementa questa funzione
}

function parseInteger(str, errorMsg = 'Il valore deve essere un numero intero') {
  // TODO: implementa questa funzione
}

function validateAnd(validators) {
  // TODO: implementa questa funzione che combina più validatori
}

// ==========================================
// ESERCIZIO 3: Gestione completa validazione form
// ==========================================

/**
 * Form di registrazione utente con i seguenti campi:
 * - username: alfanumerico, 3-20 caratteri
 * - email: deve essere un'email valida
 * - password: almeno 8 caratteri, con almeno un numero
 * - age: deve essere un numero tra 18 e 120
 */

// Dati di esempio
const validUserData = {
  username: 'mario_rossi',
  email: 'mario@example.com',
  password: 'Password123',
  age: '35'
};

const invalidUserData = {
  username: 'mr',  // troppo corto
  email: 'non-email',
  password: 'pwd',  // troppo corta e senza numeri
  age: '15'  // troppo giovane
};

/**
 * Implementa queste funzioni di validazione specializzate:
 * 
 * 1. validateUsername: verifica che sia alfanumerico e tra 3-20 caratteri
 * 2. validateUserEmail: verifica che sia un'email valida
 * 3. validatePassword: verifica che sia almeno 8 caratteri con almeno un numero
 * 4. validateAge: verifica che sia un numero tra 18 e 120
 */

function validateUsername(username) {
  // TODO: implementa questa funzione usando i validatori di base
}

function validateUserEmail(email) {
  // TODO: implementa questa funzione usando i validatori di base
}

function validatePassword(password) {
  // TODO: implementa questa funzione
}

function validateAge(age) {
  // TODO: implementa questa funzione usando i validatori di base
}

/**
 * Implementa validateUserData che valida tutti i campi dell'utente
 * e restituisce Either<string, object> dove:
 * - Left contiene un messaggio di errore con tutti gli errori trovati
 * - Right contiene l'oggetto utente validato con age convertito in numero
 */
function validateUserData(userData) {
  // TODO: implementa questa funzione
  // Suggerimento: usa un oggetto per raccogliere gli errori per ogni campo
}

// ==========================================
// ESERCIZIO 4: Interazioni con API e gestione errori
// ==========================================

/**
 * Simuliamo interazioni con un'API che potrebbero generare errori.
 * Implementa le seguenti funzioni che gestiscono potenziali errori in modo funzionale:
 * 
 * 1. checkUserExists: verifica se un utente esiste
 * 2. registerUser: registra un nuovo utente (fallisce se già esiste)
 * 3. sendWelcomeEmail: invia un'email di benvenuto (potrebbe fallire)
 * 4. completeRegistration: orchestrazione dell'intero processo di registrazione
 */

// Database simulato
const usersDB = {
  'alice@example.com': { username: 'alice', email: 'alice@example.com', active: true },
  'bob@example.com': { username: 'bob', email: 'bob@example.com', active: false }
};

// API simulate
function checkUserExists(email) {
  console.log(`Controllo se l'utente ${email} esiste...`);
  
  // Simuliamo un errore casuale di rete
  if (Math.random() < 0.2) {
    return Either.left('Errore di connessione al database');
  }
  
  return email in usersDB
    ? Either.left(`L'utente con email ${email} esiste già`)
    : Either.right(email);
}

function registerUser(userData) {
  // TODO: implementa questa funzione che:
  // 1. Controlla se l'utente esiste già
  // 2. Se non esiste, lo aggiunge al DB e ritorna Either.right con i dati utente
  // 3. Se esiste già o c'è un errore, ritorna Either.left con il messaggio di errore
}

function sendWelcomeEmail(userData) {
  // TODO: implementa questa funzione che simula l'invio di un'email
  // con gestione degli errori usando Either
}

function completeRegistration(userData) {
  // TODO: implementa questa funzione che:
  // 1. Valida i dati utente usando validateUserData
  // 2. Registra l'utente usando registerUser
  // 3. Invia un'email di benvenuto usando sendWelcomeEmail
  // 4. Restituisce Either con risultato finale o errori
}

// ==========================================
// Test delle tue implementazioni
// ==========================================

// Funzione di test
function runTests() {
  console.log("===== Test Either Monad =====");
  // TODO: aggiungi test per la tua implementazione di Either
  
  console.log("\n===== Test Validatori Base =====");
  // TODO: testa i validatori di base
  
  console.log("\n===== Test Validazione Form =====");
  console.log("Dati validi:");
  const validResult = validateUserData(validUserData);
  console.log(validResult.toString());
  
  console.log("\nDati non validi:");
  const invalidResult = validateUserData(invalidUserData);
  console.log(invalidResult.toString());
  
  console.log("\n===== Test API Registrazione =====");
  // Crea dei dati utente da testare
  const newUser = {
    username: 'carlo',
    email: 'carlo@example.com',
    password: 'Carlo123!',
    age: '25'
  };
  
  const existingUser = {
    username: 'alice2',
    email: 'alice@example.com', // già presente nel DB
    password: 'Alice456!',
    age: '30'
  };
  
  console.log("\nRegistrazione utente nuovo:");
  const newUserResult = completeRegistration(newUser);
  console.log(newUserResult.toString());
  
  console.log("\nRegistrazione utente esistente:");
  const existingUserResult = completeRegistration(existingUser);
  console.log(existingUserResult.toString());
}

// Esegui i test
runTests();

// ==========================================
// BONUS: Gestione errori asincrona
// ==========================================

/**
 * COMPITO BONUS:
 * Implementa una versione di TaskEither che combina Task (per le operazioni asincrone)
 * ed Either (per la gestione degli errori).
 * 
 * Suggerimento: ispiratati al Task monad dell'esempio 04-EffettiCollaterali.js
 * ma incorpora la gestione degli errori tramite Left e Right.
 */

// TODO: implementa TaskEither
