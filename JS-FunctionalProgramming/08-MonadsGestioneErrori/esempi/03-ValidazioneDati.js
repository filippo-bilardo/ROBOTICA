/**
 * Validazione Dati con Monads
 * Esempio di pattern di validazione funzionale utilizzando monads
 */

const { Either } = require('./01-ImplementazioniBase');

// ==========================================
// Esempio pratico: Validazione di un form utente
// ==========================================

// Dati di esempio (input da validare)
const validUserData = {
  username: 'alice_smith',
  email: 'alice@example.com',
  password: 'Secret123!',
  age: 28
};

const invalidUserData = {
  username: 'a',  // troppo corto
  email: 'not-an-email',  // non è un'email
  password: '12345',  // password troppo semplice
  age: 15  // età non sufficiente
};

// ==========================================
// Approccio funzionale: Validation Monad
// ==========================================

// Validation Monad specializzato per raccogliere più errori
// Questo è un adattamento del pattern Either che accumula errori invece di fermarsi al primo
class Validation {
  static success(value) {
    return new Success(value);
  }
  
  static failure(errors) {
    return new Failure(Array.isArray(errors) ? errors : [errors]);
  }

  // Applicazione funzionale dei validatori
  static applyValidators(value, validators) {
    return validators.reduce(
      (result, validator) => result.chain(v => validator(v)),
      Validation.success(value)
    );
  }
}

class Success {
  constructor(value) {
    this.value = value;
  }
  
  map(fn) {
    return Validation.success(fn(this.value));
  }
  
  chain(fn) {
    return fn(this.value);
  }
  
  concat(other) {
    return other.isSuccess()
      ? Validation.success(this.value) 
      : other;
  }
  
  isSuccess() {
    return true;
  }
  
  isFailure() {
    return false;
  }
  
  getOrElse(defaultValue) {
    return this.value;
  }
  
  toString() {
    return `Success(${JSON.stringify(this.value)})`;
  }
}

class Failure {
  constructor(errors) {
    this.errors = errors;
  }
  
  map(fn) {
    return this;
  }
  
  chain(fn) {
    return this;
  }
  
  // Concatena gli errori da diverse validazioni
  concat(other) {
    return other.isFailure()
      ? Validation.failure([...this.errors, ...other.errors])
      : this;
  }
  
  isSuccess() {
    return false;
  }
  
  isFailure() {
    return true;
  }
  
  getOrElse(defaultValue) {
    return defaultValue;
  }
  
  toString() {
    return `Failure(${JSON.stringify(this.errors)})`;
  }
}

// ==========================================
// Validation combinators - Funzioni di validazione riutilizzabili
// ==========================================

// Per il campo username
const validateUsername = (data) => {
  if (!data.username) {
    return Validation.failure('Username è obbligatorio');
  }
  
  if (data.username.length < 3) {
    return Validation.failure('Username deve essere di almeno 3 caratteri');
  }
  
  if (data.username.length > 20) {
    return Validation.failure('Username non può superare i 20 caratteri');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    return Validation.failure('Username può contenere solo lettere, numeri e underscore');
  }
  
  return Validation.success(data);
};

// Per il campo email
const validateEmail = (data) => {
  if (!data.email) {
    return Validation.failure('Email è obbligatoria');
  }
  
  // Regex semplificata per email (in produzione usare una regex più robusta)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return Validation.failure('Email non valida');
  }
  
  return Validation.success(data);
};

// Per il campo password
const validatePassword = (data) => {
  if (!data.password) {
    return Validation.failure('Password è obbligatoria');
  }
  
  if (data.password.length < 8) {
    return Validation.failure('Password deve essere di almeno 8 caratteri');
  }
  
  // Controllo di complessità della password con caratteri speciali, numeri e maiuscole
  if (!/[A-Z]/.test(data.password)) {
    return Validation.failure('Password deve contenere almeno una lettera maiuscola');
  }
  
  if (!/[0-9]/.test(data.password)) {
    return Validation.failure('Password deve contenere almeno un numero');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
    return Validation.failure('Password deve contenere almeno un carattere speciale');
  }
  
  return Validation.success(data);
};

// Per il campo age
const validateAge = (data) => {
  if (data.age === undefined || data.age === null) {
    return Validation.failure('Età è obbligatoria');
  }
  
  if (typeof data.age !== 'number') {
    return Validation.failure('Età deve essere un numero');
  }
  
  if (data.age < 18) {
    return Validation.failure('Devi avere almeno 18 anni');
  }
  
  if (data.age > 120) {
    return Validation.failure('Età non valida');
  }
  
  return Validation.success(data);
};

// ==========================================
// Combinazione dei validatori
// ==========================================

// Approccio sequenziale: ogni validatore viene applicato in sequenza
const validateUserSequential = (userData) => {
  return validateUsername(userData)
    .chain(validateEmail)
    .chain(validatePassword)
    .chain(validateAge);
};

// Simuliamo un approccio di validazione parallela (accumulando tutti gli errori)
// In una libreria più completa, questo utilizzerebbe applicative functors
const validateUserParallel = (userData) => {
  const results = [
    validateUsername({ ...userData }),
    validateEmail({ ...userData }),
    validatePassword({ ...userData }),
    validateAge({ ...userData })
  ];
  
  // Controlla se ci sono errori
  const failures = results.filter(r => r.isFailure());
  
  if (failures.length > 0) {
    // Accumula tutti gli errori
    const allErrors = failures.flatMap(f => f.errors);
    return Validation.failure(allErrors);
  }
  
  // Se tutto è valido, ritorna il dato originale
  return Validation.success(userData);
};

// ==========================================
// Esecuzione della validazione
// ==========================================

console.log('======== VALIDAZIONE SEQUENZIALE ========');
console.log('\nDati utente validi:');
console.log(validateUserSequential(validUserData).toString());

console.log('\nDati utente non validi (primo errore):');
console.log(validateUserSequential(invalidUserData).toString());

console.log('\n======== VALIDAZIONE PARALLELA ========');
console.log('\nDati utente validi:');
console.log(validateUserParallel(validUserData).toString());

console.log('\nDati utente non validi (tutti gli errori):');
console.log(validateUserParallel(invalidUserData).toString());

// ==========================================
// Esempio di utilizzo pratico
// ==========================================

const processUserRegistration = (userData) => {
  return validateUserParallel(userData)
    .map(data => {
      // Simuliamo il salvataggio nel database
      console.log('Utente registrato con successo:', data.username);
      return {
        success: true,
        message: 'Registrazione completata',
        user: {
          username: data.username,
          email: data.email,
          age: data.age
        }
      };
    })
    .getOrElse({
      success: false,
      message: 'Errore nella registrazione',
      errors: validateUserParallel(userData).isFailure() ? validateUserParallel(userData).errors : []
    });
};

console.log('\n======== REGISTRAZIONE UTENTE ========');
console.log('\nRegistrazione con dati validi:');
console.log(JSON.stringify(processUserRegistration(validUserData), null, 2));

console.log('\nRegistrazione con dati non validi:');
console.log(JSON.stringify(processUserRegistration(invalidUserData), null, 2));

// Esportiamo le classi per l'utilizzo in altri file
module.exports = { Validation, Success, Failure };
