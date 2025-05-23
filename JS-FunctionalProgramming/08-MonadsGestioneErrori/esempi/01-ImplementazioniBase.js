/**
 * Implementazioni Base di Monads
 * Questo file contiene le implementazioni di base di Maybe e Either monad
 */

// ==========================================
// Maybe Monad
// ==========================================

// Classe base Maybe (astratta)
class Maybe {
  static just(value) {
    return new Just(value);
  }

  static nothing() {
    return new Nothing();
  }

  static fromNullable(value) {
    return value === null || value === undefined 
      ? Maybe.nothing() 
      : Maybe.just(value);
  }

  // Operazioni monadiche (da implementare nelle sottoclassi)
  map(fn) { throw new Error('Da implementare'); }
  chain(fn) { throw new Error('Da implementare'); }
  getOrElse(defaultValue) { throw new Error('Da implementare'); }
  isJust() { throw new Error('Da implementare'); }
  isNothing() { throw new Error('Da implementare'); }
}

// Just: rappresenta un valore presente
class Just extends Maybe {
  constructor(value) {
    super();
    this._value = value;
  }

  map(fn) {
    return Maybe.fromNullable(fn(this._value));
  }

  chain(fn) {
    return fn(this._value);
  }

  getOrElse(_) {
    return this._value;
  }

  isJust() {
    return true;
  }

  isNothing() {
    return false;
  }

  toString() {
    return `Just(${this._value})`;
  }
}

// Nothing: rappresenta un valore assente
class Nothing extends Maybe {
  map(_) {
    return this;
  }

  chain(_) {
    return this;
  }

  getOrElse(defaultValue) {
    return defaultValue;
  }

  isJust() {
    return false;
  }

  isNothing() {
    return true;
  }

  toString() {
    return 'Nothing()';
  }
}

// ==========================================
// Either Monad
// ==========================================

// Classe base Either (astratta)
class Either {
  static left(value) {
    return new Left(value);
  }

  static right(value) {
    return new Right(value);
  }

  static fromTry(fn) {
    try {
      return Either.right(fn());
    } catch (error) {
      return Either.left(error);
    }
  }

  // Operazioni monadiche (da implementare nelle sottoclassi)
  map(fn) { throw new Error('Da implementare'); }
  chain(fn) { throw new Error('Da implementare'); }
  getOrElse(defaultValue) { throw new Error('Da implementare'); }
  isLeft() { throw new Error('Da implementare'); }
  isRight() { throw new Error('Da implementare'); }
}

// Right: rappresenta un'operazione riuscita
class Right extends Either {
  constructor(value) {
    super();
    this._value = value;
  }

  map(fn) {
    return Either.right(fn(this._value));
  }

  chain(fn) {
    return fn(this._value);
  }

  getOrElse(_) {
    return this._value;
  }

  isLeft() {
    return false;
  }

  isRight() {
    return true;
  }

  toString() {
    return `Right(${this._value})`;
  }
}

// Left: rappresenta un errore
class Left extends Either {
  constructor(value) {
    super();
    this._value = value;
  }

  map(_) {
    return this;
  }

  chain(_) {
    return this;
  }

  getOrElse(defaultValue) {
    return defaultValue;
  }

  isLeft() {
    return true;
  }

  isRight() {
    return false;
  }

  toString() {
    return `Left(${this._value})`;
  }
}

// ==========================================
// Esempi di utilizzo
// ==========================================

console.log('====== ESEMPI MAYBE MONAD ======');

const divide = (a, b) => {
  if (b === 0) return Maybe.nothing();
  return Maybe.just(a / b);
};

console.log(divide(10, 2).toString());  // Just(5)
console.log(divide(10, 0).toString());  // Nothing()

// Esempio: recupero di proprietà annidate in oggetti
const getStreetName = (user) => {
  return Maybe.fromNullable(user)
    .chain(u => Maybe.fromNullable(u.address))
    .chain(a => Maybe.fromNullable(a.street))
    .chain(s => Maybe.fromNullable(s.name))
    .getOrElse('Indirizzo non disponibile');
};

const user1 = { 
  name: 'Alice', 
  address: { 
    street: { name: 'Via Roma', number: 42 }, 
    city: 'Milano' 
  } 
};

const user2 = { 
  name: 'Bob', 
  address: null 
};

const user3 = null;

console.log(getStreetName(user1));  // Via Roma
console.log(getStreetName(user2));  // Indirizzo non disponibile
console.log(getStreetName(user3));  // Indirizzo non disponibile

console.log('====== ESEMPI EITHER MONAD ======');

const divideEither = (a, b) => {
  if (b === 0) return Either.left(new Error('Divisione per zero'));
  return Either.right(a / b);
};

console.log(divideEither(10, 2).toString());  // Right(5)
console.log(divideEither(10, 0).toString());  // Left(Error: Divisione per zero)

// Esempio: gestire errori di parsing JSON
const parseJSON = (json) => {
  return Either.fromTry(() => JSON.parse(json));
};

const validJSON = '{"name": "Alice", "age": 30}';
const invalidJSON = '{"name": "Alice", "age": }';

const handleResult = (result) => 
  result
    .map(data => `Nome: ${data.name}, Età: ${data.age}`)
    .getOrElse('JSON non valido');

console.log(handleResult(parseJSON(validJSON)));    // Nome: Alice, Età: 30
console.log(handleResult(parseJSON(invalidJSON)));  // JSON non valido

// Esempio: concatenazione di operazioni che potrebbero fallire
const readUserSettings = (settings) => {
  return Either.fromTry(() => {
    if (!settings || typeof settings !== 'object') {
      throw new Error('Impostazioni non valide');
    }
    return settings;
  });
};

const validateTheme = (settings) => {
  return settings.theme 
    ? Either.right(settings)
    : Either.left(new Error('Tema non specificato'));
};

const applyTheme = (settings) => {
  console.log(`Applico il tema: ${settings.theme}`);
  return Either.right(`Tema ${settings.theme} applicato correttamente`);
};

const processSettings = (settingsData) => {
  return readUserSettings(settingsData)
    .chain(validateTheme)
    .chain(applyTheme)
    .getOrElse('Impossibile applicare il tema');
};

const validSettings = { theme: 'dark', fontSize: 14 };
const invalidSettings = { fontSize: 14 }; // manca il tema
const invalidData = null;

console.log(processSettings(validSettings));     // Tema dark applicato correttamente
console.log(processSettings(invalidSettings));   // Impossibile applicare il tema
console.log(processSettings(invalidData));       // Impossibile applicare il tema

// Esportiamo le classi per l'utilizzo in altri file
module.exports = { Maybe, Just, Nothing, Either, Left, Right };
