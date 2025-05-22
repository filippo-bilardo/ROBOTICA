/**
 * Implementazioni Base di Lazy Evaluation
 * 
 * Questo file fornisce esempi di base per implementare la lazy evaluation
 * in JavaScript utilizzando vari approcci.
 */

// ========================================================
// 1. Lazy Properties mediante Getter
// ========================================================

console.log('=== Lazy Properties ===');

class User {
  constructor(id) {
    this.id = id;
    console.log(`Utente ${id} creato`);
  }
  
  // Questa proprietà viene calcolata solo quando viene richiesta
  get details() {
    console.log(`Calcolo dettagli per utente ${this.id}...`);
    // Simuliamo una chiamata API o un calcolo costoso
    return {
      name: `Utente ${this.id}`,
      level: Math.floor(Math.random() * 100),
      created: new Date().toISOString()
    };
  }
}

const user = new User(42);
console.log('Utente creato, ma i dettagli non sono stati ancora calcolati');

// I dettagli vengono calcolati solo quando vi accediamo
console.log(user.details);
// Se accediamo di nuovo, vengono ricalcolati (non memorizzati)
console.log(user.details);

// ========================================================
// 2. Memo Properties - Lazy + Memoization
// ========================================================

console.log('\n=== Memo Properties ===');

class MemoUser {
  constructor(id) {
    this.id = id;
    // Utilizziamo un WeakMap invece di modificare l'oggetto direttamente
    this._cache = new Map();
    console.log(`MemoUtente ${id} creato`);
  }
  
  get details() {
    if (!this._cache.has('details')) {
      console.log(`Calcolo dettagli per MemoUtente ${this.id}...`);
      this._cache.set('details', {
        name: `Utente ${this.id}`,
        level: Math.floor(Math.random() * 100),
        created: new Date().toISOString()
      });
    } else {
      console.log('Recupero dettagli dalla cache');
    }
    return this._cache.get('details');
  }
}

const memoUser = new MemoUser(99);
console.log('Memo utente creato, ma i dettagli non sono stati ancora calcolati');

// I dettagli vengono calcolati la prima volta
console.log(memoUser.details);
// La seconda volta vengono recuperati dalla cache
console.log(memoUser.details);

// ========================================================
// 3. Thunks - Funzioni che incapsulano calcoli ritardati
// ========================================================

console.log('\n=== Thunks ===');

function createExpensiveCalculation(input) {
  console.log('Creazione della funzione di calcolo costoso...');
  
  // Ritorniamo una funzione che eseguirà il calcolo solo quando chiamata
  return function() {
    console.log(`Esecuzione del calcolo costoso con input ${input}...`);
    
    // Simuliamo un calcolo intensivo
    let result = 0;
    for (let i = 0; i < 100; i++) {
      result += Math.sin(input * i);
    }
    
    return result;
  };
}

// Creazione del thunk (nessun calcolo ancora)
const calculation = createExpensiveCalculation(42);
console.log('Thunk creato, ma il calcolo non è stato ancora eseguito');

// Il calcolo avviene solo quando il thunk viene chiamato
const result = calculation();
console.log(`Risultato: ${result}`);

// ========================================================
// 4. Valutazione Lazy mediante Proxy
// ========================================================

console.log('\n=== Lazy via Proxy ===');

function createLazyObject(initializer) {
  const cache = {};
  
  return new Proxy({}, {
    get(target, property) {
      if (!(property in cache)) {
        console.log(`Proprietà '${property}' richiesta per la prima volta`);
        cache[property] = initializer(property);
      } else {
        console.log(`Proprietà '${property}' recuperata dalla cache`);
      }
      return cache[property];
    }
  });
}

// Simula un oggetto con proprietà lazy-loaded
const lazyConfig = createLazyObject(key => {
  console.log(`Caricamento configurazione per ${key}...`);
  // Simuliamo il caricamento di una configurazione
  return `Valore per ${key}: ${Math.random().toFixed(4)}`;
});

// Le proprietà vengono calcolate on-demand
console.log(lazyConfig.database);
console.log(lazyConfig.api);
console.log(lazyConfig.database); // Usa la cache

// ========================================================
// 5. Lazy Arrays Base
// ========================================================

console.log('\n=== Lazy Arrays Base ===');

// Una versione semplificata di map lazy
function lazyMap(array, mapFn) {
  // Ritorna un iterabile, non un array
  return {
    [Symbol.iterator]: function* () {
      for (const item of array) {
        console.log(`Mapping elemento: ${item}`);
        yield mapFn(item);
      }
    }
  };
}

const baseArray = [1, 2, 3, 4, 5];
const lazyMapped = lazyMap(baseArray, x => x * 2);

console.log('Array mappato in modo lazy (ancora nessun calcolo eseguito)');

// Il mapping viene eseguito solo quando iteriamo
console.log('Inizio iterazione:');
for (const item of lazyMapped) {
  console.log(`Valore: ${item}`);
}

// ========================================================
// 6. Short-Circuit Evaluation - AND e OR
// ========================================================

console.log('\n=== Short-Circuit Evaluation ===');

function heavyProcessing() {
  console.log('Esecuzione di operazioni costose...');
  return Math.random() > 0.5;
}

// Con AND (&&), la seconda espressione viene valutata solo se la prima è true
console.log('Test AND:');
const condition = false;
const andResult = condition && heavyProcessing(); // heavyProcessing non viene eseguito
console.log(`Risultato AND: ${andResult}`);

// Con OR (||), la seconda espressione viene valutata solo se la prima è false
console.log('Test OR:');
const orResult = condition || heavyProcessing(); // heavyProcessing viene eseguito
console.log(`Risultato OR: ${orResult}`);

// ========================================================
// 7. Lazy Parameter Evaluation - Parametri di Default
// ========================================================

console.log('\n=== Lazy Parameter Evaluation ===');

function greet(name, message = (() => {
  console.log('Calcolo del messaggio di default...');
  return `Benvenuto nel ${new Date().getFullYear()}!`;
})()) {
  console.log(`Ciao ${name}, ${message}`);
}

greet('Mario', 'Lieto di vederti!'); // Il calcolo del default non avviene
greet('Luigi'); // Il calcolo del default avviene

// ========================================================
// 8. Operatore Nullish Coalescing per Lazy Fallback
// ========================================================

console.log('\n=== Nullish Coalescing ===');

function fetchUserPreference(key) {
  console.log(`Cercando la preferenza ${key} nel database...`);
  // Simuliamo un database di preferenze
  const preferences = { theme: 'dark' };
  return preferences[key];
}

function getSystemDefault(key) {
  console.log(`Generando il valore di default di sistema per ${key}...`);
  return key === 'theme' ? 'light' : 'default';
}

// Il fallback viene calcolato solo se necessario
const theme = fetchUserPreference('theme') ?? getSystemDefault('theme');
console.log(`Tema: ${theme}`);

const language = fetchUserPreference('language') ?? getSystemDefault('language');
console.log(`Lingua: ${language}`);

// ========================================================
// Esportazioni per uso in altri esempi
// ========================================================

module.exports = {
  User,
  MemoUser,
  createExpensiveCalculation,
  createLazyObject,
  lazyMap
};

console.log('\nTutti gli esempi completati!');
