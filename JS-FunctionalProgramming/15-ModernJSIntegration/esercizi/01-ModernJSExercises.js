/**
 * ESERCIZI: Modern JavaScript + Functional Programming
 * 
 * Completa gli esercizi utilizzando ES6+ features e principi funzionali.
 * Ogni esercizio include test per verificare la correttezza della soluzione.
 */

console.log('=== ESERCIZI MODERN JS + FUNCTIONAL PROGRAMMING ===\n');

// ===== ESERCIZIO 1: ARROW FUNCTIONS E COMPOSIZIONE =====

console.log('ESERCIZIO 1: Arrow Functions e Composizione');

/**
 * Crea le seguenti funzioni usando arrow syntax e currying:
 * - multiply: (a) => (b) => a * b
 * - add: (a) => (b) => a + b  
 * - subtract: (a) => (b) => a - b
 * - compose: (...fns) => (value) => composizione da destra a sinistra
 * - pipe: (...fns) => (value) => composizione da sinistra a destra
 */

// TODO: Implementa le funzioni qui
const multiply = null; // (a) => (b) => a * b
const add = null;      // (a) => (b) => a + b
const subtract = null; // (a) => (b) => a - b
const compose = null;  // (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value)
const pipe = null;     // (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value)

// Test ESERCIZIO 1
const test1 = () => {
  try {
    const double = multiply(2);
    const addTen = add(10);
    const subtractFive = subtract(5);
    
    const result1 = double(5); // Should be 10
    const result2 = compose(addTen, double, subtractFive)(20); // Should be 40
    const result3 = pipe(subtractFive, double, addTen)(20); // Should be 40
    
    console.log('Test 1.1:', result1 === 10 ? 'PASS' : 'FAIL');
    console.log('Test 1.2:', result2 === 40 ? 'PASS' : 'FAIL');
    console.log('Test 1.3:', result3 === 40 ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('Test 1 Error:', error.message);
  }
};

// ===== ESERCIZIO 2: DESTRUCTURING E TRANSFORMATION =====

console.log('\nESERCIZIO 2: Destructuring e Data Transformation');

/**
 * Implementa le seguenti funzioni usando destructuring:
 * - extractPersonInfo: ({ name, age, city, ...rest }) => oggetto con solo le info rilevanti
 * - transformUsers: (users) => array di utenti trasformati con destructuring
 * - mergeUserPreferences: (user, preferences) => merge user con nuove preferenze
 */

const users = [
  { id: 1, name: 'Alice', age: 30, city: 'Milano', country: 'Italy', job: 'Developer', salary: 50000 },
  { id: 2, name: 'Bob', age: 25, city: 'Roma', country: 'Italy', job: 'Designer', salary: 45000 },
  { id: 3, name: 'Charlie', age: 35, city: 'Napoli', country: 'Italy', job: 'Manager', salary: 60000 }
];

// TODO: Implementa le funzioni usando destructuring
const extractPersonInfo = null; // ({ name, age, city, ...rest }) => ({ name, age, city, otherInfo: rest })

const transformUsers = null; // (users) => users.map(extractPersonInfo)

const mergeUserPreferences = null; // (user, preferences) => ({ ...user, preferences: { ...user.preferences, ...preferences } })

// Test ESERCIZIO 2
const test2 = () => {
  try {
    const sampleUser = users[0];
    const extractedInfo = extractPersonInfo(sampleUser);
    const transformedUsers = transformUsers(users);
    const mergedUser = mergeUserPreferences(sampleUser, { theme: 'dark', notifications: true });
    
    const hasCorrectKeys = extractedInfo && extractedInfo.name && extractedInfo.age && extractedInfo.city && extractedInfo.otherInfo;
    const hasCorrectLength = transformedUsers && transformedUsers.length === 3;
    const hasPreferences = mergedUser && mergedUser.preferences && mergedUser.preferences.theme === 'dark';
    
    console.log('Test 2.1:', hasCorrectKeys ? 'PASS' : 'FAIL');
    console.log('Test 2.2:', hasCorrectLength ? 'PASS' : 'FAIL');
    console.log('Test 2.3:', hasPreferences ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('Test 2 Error:', error.message);
  }
};

// ===== ESERCIZIO 3: TEMPLATE LITERALS E BUILDERS =====

console.log('\nESERCIZIO 3: Template Literals e Function Builders');

/**
 * Implementa:
 * - createEmailTemplate: (template) => (data) => sostituisce {{key}} con data[key]
 * - buildSQLQuery: funzione curried per costruire query SQL
 * - formatUserDisplay: (user) => stringa formattata con template literals
 */

// TODO: Implementa template string replacer
const createEmailTemplate = null; // (template) => (data) => template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || '')

// TODO: Implementa SQL query builder
const buildSQLQuery = null; // (table) => (fields) => (conditions) => `SELECT ${fields.join(', ')} FROM ${table} WHERE ${conditions}`

// TODO: Implementa user formatter
const formatUserDisplay = null; // (user) => `${user.name} (${user.age} anni) - ${user.city}`

// Test ESERCIZIO 3
const test3 = () => {
  try {
    const emailTemplate = createEmailTemplate('Ciao {{name}}, benvenuto in {{platform}}!');
    const emailResult = emailTemplate({ name: 'Alice', platform: 'FunctionalJS' });
    
    const sqlQuery = buildSQLQuery('users')(['name', 'email'])('age > 18');
    
    const userDisplay = formatUserDisplay(users[0]);
    
    const emailCorrect = emailResult === 'Ciao Alice, benvenuto in FunctionalJS!';
    const sqlCorrect = sqlQuery === 'SELECT name, email FROM users WHERE age > 18';
    const displayCorrect = userDisplay === 'Alice (30 anni) - Milano';
    
    console.log('Test 3.1:', emailCorrect ? 'PASS' : 'FAIL');
    console.log('Test 3.2:', sqlCorrect ? 'PASS' : 'FAIL');
    console.log('Test 3.3:', displayCorrect ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('Test 3 Error:', error.message);
  }
};

// ===== ESERCIZIO 4: SPREAD/REST E IMMUTABLE OPERATIONS =====

console.log('\nESERCIZIO 4: Spread/Rest e Immutable Operations');

/**
 * Implementa operazioni immutabili usando spread/rest:
 * - addToArray: (arr, item) => nuovo array con item aggiunto
 * - removeFromArray: (arr, index) => nuovo array senza elemento all'index
 * - updateObject: (obj, updates) => nuovo oggetto con updates
 * - mergeArrays: (...arrays) => array unificato
 */

// TODO: Implementa operazioni immutabili
const addToArray = null; // (arr, item) => [...arr, item]

const removeFromArray = null; // (arr, index) => [...arr.slice(0, index), ...arr.slice(index + 1)]

const updateObject = null; // (obj, updates) => ({ ...obj, ...updates })

const mergeArrays = null; // (...arrays) => arrays.flat()

// Test ESERCIZIO 4
const test4 = () => {
  try {
    const originalArray = [1, 2, 3];
    const originalObject = { a: 1, b: 2 };
    
    const newArray = addToArray(originalArray, 4);
    const removedArray = removeFromArray(originalArray, 1);
    const updatedObject = updateObject(originalObject, { c: 3, b: 20 });
    const mergedArray = mergeArrays([1, 2], [3, 4], [5, 6]);
    
    const arrayUnchanged = originalArray.length === 3;
    const objectUnchanged = originalObject.b === 2;
    const correctAddition = newArray.length === 4 && newArray[3] === 4;
    const correctRemoval = removedArray.length === 2 && removedArray[0] === 1 && removedArray[1] === 3;
    const correctUpdate = updatedObject.c === 3 && updatedObject.b === 20 && updatedObject.a === 1;
    const correctMerge = mergedArray.length === 6;
    
    console.log('Test 4.1:', arrayUnchanged && correctAddition ? 'PASS' : 'FAIL');
    console.log('Test 4.2:', correctRemoval ? 'PASS' : 'FAIL');
    console.log('Test 4.3:', objectUnchanged && correctUpdate ? 'PASS' : 'FAIL');
    console.log('Test 4.4:', correctMerge ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('Test 4 Error:', error.message);
  }
};

// ===== ESERCIZIO 5: OPTIONAL CHAINING E SAFE NAVIGATION =====

console.log('\nESERCIZIO 5: Optional Chaining e Safe Navigation');

/**
 * Implementa funzioni per safe navigation:
 * - safeGet: (path) => (obj) => valore al path o undefined
 * - safeCall: (fn) => (...args) => chiama fn solo se esiste
 * - withDefault: (defaultValue) => (value) => value ?? defaultValue
 */

const complexData = {
  user: {
    profile: {
      address: {
        city: 'Milano',
        street: 'Via Roma 1'
      },
      contacts: {
        email: 'user@example.com'
      }
    },
    settings: {
      theme: 'dark'
    }
  }
};

// TODO: Implementa safe navigation
const safeGet = null; // (path) => (obj) => path.split('.').reduce((current, key) => current?.[key], obj)

const safeCall = null; // (fn) => (...args) => fn ? fn(...args) : undefined

const withDefault = null; // (defaultValue) => (value) => value ?? defaultValue

// Test ESERCIZIO 5
const test5 = () => {
  try {
    const getCity = safeGet('user.profile.address.city');
    const getPhone = safeGet('user.profile.contacts.phone');
    
    const cityResult = getCity(complexData); // Should be 'Milano'
    const phoneResult = getPhone(complexData); // Should be undefined
    
    const maybeFunction = Math.random() > 0.5 ? ((x) => x * 2) : null;
    const safeResult = safeCall(maybeFunction)(10);
    
    const defaultValue = withDefault('Not provided')(phoneResult);
    
    const cityCorrect = cityResult === 'Milano';
    const phoneCorrect = phoneResult === undefined;
    const defaultCorrect = defaultValue === 'Not provided';
    
    console.log('Test 5.1:', cityCorrect ? 'PASS' : 'FAIL');
    console.log('Test 5.2:', phoneCorrect ? 'PASS' : 'FAIL');
    console.log('Test 5.3:', defaultCorrect ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('Test 5 Error:', error.message);
  }
};

// ===== ESERCIZIO 6: ASYNC/AWAIT FUNCTIONAL PATTERNS =====

console.log('\nESERCIZIO 6: Async/Await Functional Patterns');

/**
 * Implementa pattern async funzionali:
 * - asyncPipe: (...fns) => (value) => pipeline asincrono
 * - withRetry: (maxRetries) => (asyncFn) => riprova in caso di errore
 * - timeout: (ms) => (promise) => promise con timeout
 */

// Mock async functions per testing
const mockAsyncAdd = (delay) => async (x) => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return x + 1;
};

const mockAsyncMultiply = (delay) => async (x) => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return x * 2;
};

const unreliableAsyncFn = async (x) => {
  if (Math.random() > 0.7) throw new Error('Random failure');
  return x * 10;
};

// TODO: Implementa async patterns
const asyncPipe = null; // (...fns) => (value) => fns.reduce(async (acc, fn) => fn(await acc), Promise.resolve(value))

const withRetry = null; // (maxRetries) => (asyncFn) => async (...args) => { /* retry logic */ }

const timeout = null; // (ms) => (promise) => Promise.race([promise, timeoutPromise])

// Test ESERCIZIO 6
const test6 = async () => {
  try {
    // Test async pipe
    const asyncFlow = asyncPipe(
      mockAsyncAdd(10),
      mockAsyncMultiply(10)
    );
    
    const start = Date.now();
    const result = await asyncFlow(5); // Should be (5 + 1) * 2 = 12
    const duration = Date.now() - start;
    
    console.log('Test 6.1:', result === 12 && duration >= 20 ? 'PASS' : 'FAIL');
    
    // Test retry (comentato per non rallentare troppo)
    // const retryFn = withRetry(3)(unreliableAsyncFn);
    // const retryResult = await retryFn(2);
    // console.log('Test 6.2: SKIP (uncomment to test retry)');
    
    console.log('Test 6.2: SKIP (implementa per testare retry)');
    console.log('Test 6.3: SKIP (implementa per testare timeout)');
    
  } catch (error) {
    console.log('Test 6 Error:', error.message);
  }
};

// ===== ESERCIZIO 7: MODULAR DESIGN PATTERNS =====

console.log('\nESERCIZIO 7: Modular Design Patterns');

/**
 * Crea un sistema modulare per gestire todo items:
 * - createTodoModule: () => modulo con funzioni per gestire todos
 * - Deve supportare: add, remove, toggle, filter, getStats
 * - Usa closure per privacy e stato interno
 */

// TODO: Implementa il modulo TODO
const createTodoModule = null; 
/* () => {
  const todos = [];
  let idCounter = 1;

  return {
    add: (text) => { ... },
    remove: (id) => { ... },
    toggle: (id) => { ... },
    filter: (predicate) => { ... },
    getAll: () => { ... },
    getStats: () => { ... }
  };
}; */

// Test ESERCIZIO 7
const test7 = () => {
  try {
    const todoModule = createTodoModule();
    
    if (!todoModule) {
      console.log('Test 7: FAIL - createTodoModule non implementato');
      return;
    }
    
    // Add todos
    const todo1 = todoModule.add('Learn functional programming');
    const todo2 = todoModule.add('Build modular app');
    
    // Toggle completion
    todoModule.toggle(todo1.id);
    
    const allTodos = todoModule.getAll();
    const stats = todoModule.getStats();
    
    const correctCount = allTodos.length === 2;
    const correctToggle = allTodos.find(t => t.id === todo1.id).completed === true;
    const correctStats = stats.total === 2 && stats.completed === 1;
    
    console.log('Test 7.1:', correctCount ? 'PASS' : 'FAIL');
    console.log('Test 7.2:', correctToggle ? 'PASS' : 'FAIL');
    console.log('Test 7.3:', correctStats ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.log('Test 7 Error:', error.message);
  }
};

// ===== ESERCIZIO 8: PERFORMANCE OPTIMIZATION =====

console.log('\nESERCIZIO 8: Performance Optimization');

/**
 * Implementa ottimizzazioni delle performance:
 * - memoize: (fn) => versione memoizzata della funzione
 * - debounce: (fn, delay) => versione debounced della funzione
 * - throttle: (fn, interval) => versione throttled della funzione
 */

// TODO: Implementa performance optimizations
const memoize = null; 
/* (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}; */

const debounce = null; // (fn, delay) => { ... }

const throttle = null; // (fn, interval) => { ... }

// Test ESERCIZIO 8
const test8 = () => {
  try {
    let computeCount = 0;
    const expensiveCompute = (n) => {
      computeCount++;
      return n * n;
    };
    
    if (!memoize) {
      console.log('Test 8: FAIL - memoize non implementato');
      return;
    }
    
    const memoizedCompute = memoize(expensiveCompute);
    
    const result1 = memoizedCompute(5);
    const result2 = memoizedCompute(5); // Should use cache
    const result3 = memoizedCompute(10);
    
    const correctResults = result1 === 25 && result2 === 25 && result3 === 100;
    const correctMemoization = computeCount === 2; // Only computed twice
    
    console.log('Test 8.1:', correctResults ? 'PASS' : 'FAIL');
    console.log('Test 8.2:', correctMemoization ? 'PASS' : 'FAIL');
    console.log('Test 8.3: SKIP (implementa debounce per testare)');
    console.log('Test 8.4: SKIP (implementa throttle per testare)');
    
  } catch (error) {
    console.log('Test 8 Error:', error.message);
  }
};

// ===== ESECUZIONE DEI TEST =====

const runAllTests = async () => {
  console.log('\n' + '='.repeat(50));
  console.log('ESECUZIONE TESTS');
  console.log('='.repeat(50));
  
  test1();
  test2();
  test3();
  test4();
  test5();
  await test6();
  test7();
  test8();
  
  console.log('\n' + '='.repeat(50));
  console.log('TESTS COMPLETATI');
  console.log('='.repeat(50));
  console.log('\nRicorda:');
  console.log('- Implementa tutte le funzioni marcate con TODO');
  console.log('- Tutti i test dovrebbero passare (PASS)');
  console.log('- Usa ES6+ features e principi funzionali');
  console.log('- Mantieni le funzioni pure quando possibile');
};

// Esegui i test
runAllTests().catch(console.error);

// Export per uso in altri moduli
export {
  multiply,
  add,
  subtract,
  compose,
  pipe,
  extractPersonInfo,
  transformUsers,
  mergeUserPreferences,
  createEmailTemplate,
  buildSQLQuery,
  formatUserDisplay,
  addToArray,
  removeFromArray,
  updateObject,
  mergeArrays,
  safeGet,
  safeCall,
  withDefault,
  asyncPipe,
  withRetry,
  timeout,
  createTodoModule,
  memoize,
  debounce,
  throttle
};
