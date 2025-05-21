/**
 * 04-ComposizioneFunzioni.js
 * 
 * Questo file esplora la composizione di funzioni, una tecnica fondamentale
 * della programmazione funzionale che permette di combinare più funzioni
 * per crearne di nuove più complesse.
 */

// --------------------------------------------------------
// PARTE 1: Concetti base di composizione
// --------------------------------------------------------

console.log("===== CONCETTI BASE DI COMPOSIZIONE =====");

/**
 * Nella composizione di funzioni, l'output di una funzione diventa
 * l'input della funzione successiva, permettendo di costruire
 * pipeline di trasformazione dei dati.
 */

// Funzioni semplici che possiamo comporre
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

// Composizione manuale
function manualCompose(x) {
  return square(double(addOne(x)));
}

console.log("Composizione manuale:", manualCompose(3)); // ((3 + 1) * 2)² = 64

// Funzione di composizione right-to-left (stile matematico)
// compose(f, g, h)(x) equivale a f(g(h(x)))
function compose(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

// Usiamo la funzione di composizione
const composed = compose(square, double, addOne);
console.log("Composizione con compose():", composed(3)); // ((3 + 1) * 2)² = 64

// Funzione pipe (left-to-right, più leggibile in certi casi)
// pipe(f, g, h)(x) equivale a h(g(f(x)))
function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

// Usiamo la funzione pipe (ordine invertito rispetto a compose)
const piped = pipe(addOne, double, square);
console.log("Composizione con pipe():", piped(3)); // ((3 + 1) * 2)² = 64

// --------------------------------------------------------
// PARTE 2: Composizione con funzioni multi-argomento
// --------------------------------------------------------

console.log("\n===== COMPOSIZIONE CON FUNZIONI MULTI-ARGOMENTO =====");

/**
 * Per comporre funzioni con più argomenti, spesso si usa
 * il currying per trasformarle in funzioni a singolo argomento.
 */

// Funzione helper per il currying
function curry(fn) {
  return function currified(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return function(...argsNext) {
      return currified(...args, ...argsNext);
    };
  };
}

// Funzione con più argomenti
function add(a, b) {
  return a + b;
}

// Curryfichiamo per poterla usare nella composizione
const curriedAdd = curry(add);

// Ora possiamo usarla nella composizione
const addFiveThenSquare = compose(square, curriedAdd(5));
console.log("Composizione con funzione currificata:", addFiveThenSquare(10)); // (10 + 5)² = 225

// --------------------------------------------------------
// PARTE 3: Point-free programming
// --------------------------------------------------------

console.log("\n===== POINT-FREE PROGRAMMING =====");

/**
 * Il point-free programming (o tacit programming) è uno stile in cui
 * non menzioniamo esplicitamente i parametri delle funzioni, rendendo
 * il codice più conciso e dichiarativo.
 */

// Esempio standard con parametri espliciti
const numbers = [1, 2, 3, 4, 5];

const sumOfSquaresExplicit = nums => {
  const squares = nums.map(n => n * n);
  return squares.reduce((acc, val) => acc + val, 0);
};

console.log("Con parametri espliciti:", sumOfSquaresExplicit(numbers)); // 55

// Versione point-free utilizzando funzioni curryficate e composizione
const map = curry((fn, arr) => arr.map(fn));
const reduce = curry((fn, initial, arr) => arr.reduce(fn, initial));
const sum = reduce((acc, n) => acc + n, 0);

// Point-free: parametri mai menzionati esplicitamente
const sumOfSquares = pipe(
  map(x => x * x),
  sum
);

console.log("Point-free style:", sumOfSquares(numbers)); // 55

// --------------------------------------------------------
// PARTE 4: Gestione degli Errori nella Composizione
// --------------------------------------------------------

console.log("\n===== GESTIONE ERRORI NELLA COMPOSIZIONE =====");

/**
 * La composizione può essere complicata quando le funzioni possono fallire.
 * Possiamo usare pattern come Either o flussi di controllo simili per gestire gli errori.
 */

// Funzione che può fallire
function divide(divisor) {
  return function(dividend) {
    if (divisor === 0) {
      throw new Error("Divisione per zero");
    }
    return dividend / divisor;
  };
}

// Helper per catturare gli errori
function tryCatch(fn) {
  return function(...args) {
    try {
      return { 
        success: true, 
        value: fn(...args) 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  };
}

// Composizione con gestione degli errori
const divideAndSquare = pipe(
  tryCatch(divide(2)),
  result => {
    if (!result.success) return result;
    return { 
      success: true, 
      value: square(result.value) 
    };
  }
);

console.log("Divisione sicura (success):", divideAndSquare(10));
  // Output: { success: true, value: 25 }

// Usando una divisione che fallirebbe
const divideByZeroAndSquare = pipe(
  tryCatch(divide(0)),
  result => {
    if (!result.success) return result;
    return { 
      success: true, 
      value: square(result.value) 
    };
  }
);

console.log("Divisione sicura (failure):", divideByZeroAndSquare(10));
  // Output: { success: false, error: "Divisione per zero" }

// --------------------------------------------------------
// PARTE 5: Esempi Pratici di Composizione
// --------------------------------------------------------

console.log("\n===== ESEMPI PRATICI DI COMPOSIZIONE =====");

/**
 * Vediamo alcuni esempi pratici di come la composizione può essere
 * utilizzata per costruire funzioni complesse.
 */

// Esempio 1: Elaborazione testo
const normalizeText = str => str.trim().toLowerCase();
const countWords = str => str.split(/\s+/).length;
const removeSpecialChars = str => str.replace(/[^a-zA-Z0-9\s]/g, '');

const countNormalizedWords = pipe(
  normalizeText,
  removeSpecialChars,
  countWords
);

console.log("Conteggio parole normalizzate:", 
  countNormalizedWords("  Hello, World! How are you?   ")); // 5

// Esempio 2: Manipolazione di array
const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 17, active: false },
  { name: "Charlie", age: 30, active: true },
  { name: "Dave", age: 22, active: false }
];

const prop = curry((key, obj) => obj[key]);
const filter = curry((predicate, arr) => arr.filter(predicate));
const sortBy = curry((key, arr) => [...arr].sort((a, b) => a[key] > b[key] ? 1 : -1));

const isActive = obj => obj.active;
const isAdult = obj => obj.age >= 18;

const getActiveAdultNames = pipe(
  filter(obj => isActive(obj) && isAdult(obj)),
  sortBy('name'),
  map(prop('name'))
);

console.log("Nomi degli utenti attivi adulti:", 
  getActiveAdultNames(users)); // ["Alice", "Charlie"]

// Esempio 3: Pipeline di elaborazione dati con logging
const log = curry((message, value) => {
  console.log(`${message}:`, value);
  return value;
});

const processData = pipe(
  log("Input raw data"),
  JSON.parse,
  log("After parsing"),
  data => data.items || [],
  log("Extracted items"),
  filter(item => item.price > 10),
  log("Filtered expensive items"),
  map(item => item.name),
  log("Extracted names")
);

try {
  processData('{"items": [{"name": "Book", "price": 15}, {"name": "Pen", "price": 5}, {"name": "Laptop", "price": 999}]}');
} catch (error) {
  console.error("Error in data processing:", error);
}

// --------------------------------------------------------
// PARTE 6: Composizione per scenari comuni
// --------------------------------------------------------

console.log("\n===== SCENARI COMUNI DI COMPOSIZIONE =====");

// Scenario 1: Formula di calcolo (prezzo con sconto e tasse)
const applyDiscount = curry((discountPercent, price) => 
  price * (1 - discountPercent / 100));
  
const applyTax = curry((taxPercent, price) => 
  price * (1 + taxPercent / 100));

const formatPrice = price => 
  `€${price.toFixed(2)}`;

const calculateFinalPrice = pipe(
  applyDiscount(20),  // 20% di sconto
  applyTax(22),       // 22% IVA
  formatPrice
);

console.log("Prezzo finale:", calculateFinalPrice(100)); // €97.60

// Scenario 2: Validazione di dati
const isNotEmpty = str => str.trim().length > 0;
const hasMinLength = curry((min, str) => str.length >= min);
const hasValidFormat = regex => str => regex.test(str);
const isValidEmail = hasValidFormat(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

const validateField = curry((validationFn, errorMsg, value) => {
  if (!validationFn(value)) {
    return { valid: false, error: errorMsg };
  }
  return { valid: true };
});

const validatePassword = pipe(
  value => [
    validateField(isNotEmpty, "La password non può essere vuota", value),
    validateField(hasMinLength(8), "La password deve avere almeno 8 caratteri", value)
  ],
  results => results.find(r => !r.valid) || { valid: true }
);

const validateEmailField = pipe(
  value => [
    validateField(isNotEmpty, "L'email non può essere vuota", value),
    validateField(isValidEmail, "Formato email non valido", value)
  ],
  results => results.find(r => !r.valid) || { valid: true }
);

console.log("Validazione password:", validatePassword("abc")); 
// { valid: false, error: "La password deve avere almeno 8 caratteri" }

console.log("Validazione email:", validateEmailField("user@example.com")); 
// { valid: true }

console.log("Validazione email (errore):", validateEmailField("invalidEmail")); 
// { valid: false, error: "Formato email non valido" }
