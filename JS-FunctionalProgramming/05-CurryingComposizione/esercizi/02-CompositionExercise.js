/**
 * MODULO 5: CURRYING E COMPOSIZIONE - ESERCIZIO 2
 * ===============================================
 * 
 * Implementazione e pratica della Composizione di Funzioni
 * 
 * OBIETTIVI:
 * - Comprendere la composizione di funzioni
 * - Implementare compose e pipe
 * - Creare pipeline di trasformazione
 * - Combinare currying e composizione
 */

console.log('=== ESERCIZI COMPOSIZIONE ===\n');

// ================================
// SEZIONE 1: COMPOSIZIONE BASE
// ================================

console.log('1. COMPOSIZIONE BASE');
console.log('====================');

/**
 * ESERCIZIO 1.1: Implementazione Compose
 * Implementa la funzione compose che applica funzioni da destra a sinistra
 */
console.log('\n1.1 Implementazione Compose:');

const compose = (...functions) => (value) => {
    return functions.reduceRight((acc, fn) => fn(acc), value);
};

// Funzioni base per test
const addOne = (x) => x + 1;
const multiplyByTwo = (x) => x * 2;
const square = (x) => x * x;

// Composizioni di esempio
const addOneThenDouble = compose(multiplyByTwo, addOne);
const squareThenDouble = compose(multiplyByTwo, square);
const complexComposition = compose(square, multiplyByTwo, addOne);

console.log('5 + 1 * 2 =', addOneThenDouble(5)); // (5 + 1) * 2 = 12
console.log('3² * 2 =', squareThenDouble(3)); // (3²) * 2 = 18
console.log('4 + 1 * 2 ² =', complexComposition(4)); // ((4 + 1) * 2)² = 100

/**
 * ESERCIZIO 1.2: Implementazione Pipe
 * Implementa la funzione pipe che applica funzioni da sinistra a destra
 */
console.log('\n1.2 Implementazione Pipe:');

const pipe = (...functions) => (value) => {
    return functions.reduce((acc, fn) => fn(acc), value);
};

// Stesse composizioni con pipe (ordine invertito)
const addOneThenDoublePipe = pipe(addOne, multiplyByTwo);
const squareThenDoublePipe = pipe(square, multiplyByTwo);
const complexCompositionPipe = pipe(addOne, multiplyByTwo, square);

console.log('5 + 1 * 2 =', addOneThenDoublePipe(5)); // (5 + 1) * 2 = 12
console.log('3² * 2 =', squareThenDoublePipe(3)); // (3²) * 2 = 18
console.log('4 + 1 * 2 ² =', complexCompositionPipe(4)); // ((4 + 1) * 2)² = 100

/**
 * ESERCIZIO 1.3: Composizione con Funzioni Pratiche
 * Applica composizione a trasformazioni di stringhe
 */
console.log('\n1.3 Composizione con Stringhe:');

// Funzioni per manipolazione stringhe
const trim = (str) => str.trim();
const toLowerCase = (str) => str.toLowerCase();
const removeSpaces = (str) => str.replace(/\s+/g, '');
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const addPrefix = (prefix) => (str) => `${prefix}${str}`;
const addSuffix = (suffix) => (str) => `${str}${suffix}`;

// Composizioni per normalizzazione
const normalizeString = pipe(
    trim,
    toLowerCase,
    removeSpaces
);

const createSlug = pipe(
    trim,
    toLowerCase,
    (str) => str.replace(/\s+/g, '-'),
    (str) => str.replace(/[^a-z0-9-]/g, '')
);

const formatTitle = pipe(
    trim,
    toLowerCase,
    (str) => str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
);

// Test trasformazioni
const testString = '  JavaScript Programming  ';
console.log('Originale:', `"${testString}"`);
console.log('Normalizzata:', `"${normalizeString(testString)}"`);
console.log('Slug:', `"${createSlug(testString)}"`);
console.log('Titolo:', `"${formatTitle(testString)}"`);

// ================================
// SEZIONE 2: COMPOSIZIONE AVANZATA
// ================================

console.log('\n\n2. COMPOSIZIONE AVANZATA');
console.log('=========================');

/**
 * ESERCIZIO 2.1: Composizione Asincrona
 * Implementa composizione per funzioni asincrone
 */
console.log('\n2.1 Composizione Asincrona:');

const composeAsync = (...functions) => (value) => {
    return functions.reduceRight(async (acc, fn) => {
        const resolvedAcc = await acc;
        return fn(resolvedAcc);
    }, Promise.resolve(value));
};

const pipeAsync = (...functions) => (value) => {
    return functions.reduce(async (acc, fn) => {
        const resolvedAcc = await acc;
        return fn(resolvedAcc);
    }, Promise.resolve(value));
};

// Funzioni asincrone simulate
const asyncAddOne = async (x) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return x + 1;
};

const asyncMultiplyByTwo = async (x) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return x * 2;
};

const asyncSquare = async (x) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return x * x;
};

// Test composizione asincrona
const asyncComposition = pipeAsync(asyncAddOne, asyncMultiplyByTwo, asyncSquare);

asyncComposition(3).then(result => {
    console.log('Risultato asincrono (3 + 1) * 2 ² =', result); // ((3 + 1) * 2)² = 64
});

/**
 * ESERCIZIO 2.2: Composizione con Validazione
 * Crea composizioni che gestiscono errori e validazioni
 */
console.log('\n2.2 Composizione con Validazione:');

// Result type per gestione errori
const Ok = (value) => ({ isOk: true, value, error: null });
const Err = (error) => ({ isOk: false, value: null, error });

const composeWithValidation = (...functions) => (value) => {
    return functions.reduce((acc, fn) => {
        if (!acc.isOk) return acc;
        try {
            const result = fn(acc.value);
            return result.isOk !== undefined ? result : Ok(result);
        } catch (error) {
            return Err(error.message);
        }
    }, Ok(value));
};

// Funzioni con validazione
const validatePositive = (x) => {
    if (x < 0) throw new Error('Il numero deve essere positivo');
    return x;
};

const validateInteger = (x) => {
    if (!Number.isInteger(x)) throw new Error('Il numero deve essere intero');
    return x;
};

const divideByTwo = (x) => x / 2;

// Pipeline con validazione
const safeProcess = composeWithValidation(
    validatePositive,
    validateInteger,
    divideByTwo
);

console.log('Processo valido (10):', safeProcess(10));
console.log('Processo non valido (-5):', safeProcess(-5));
console.log('Processo non valido (3.5):', safeProcess(3.5));

/**
 * ESERCIZIO 2.3: Composizione di Array Operations
 * Componi operazioni su array
 */
console.log('\n2.3 Composizione di Array Operations:');

// Curry delle operazioni array per composizione
const curry = (fn) => {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        } else {
            return function(...nextArgs) {
                return curried.apply(this, args.concat(nextArgs));
            };
        }
    };
};

const map = curry((fn, array) => array.map(fn));
const filter = curry((predicate, array) => array.filter(predicate));
const reduce = curry((fn, initial, array) => array.reduce(fn, initial));
const sort = curry((compareFn, array) => [...array].sort(compareFn));

// Pipeline di elaborazione dati
const processNumbers = pipe(
    filter(x => x > 0),           // Filtra positivi
    map(x => x * 2),              // Raddoppia
    filter(x => x < 20),          // Filtra < 20
    sort((a, b) => b - a)         // Ordina decrescente
);

const processStrings = pipe(
    filter(str => str.length > 3),              // Filtra stringhe lunghe
    map(str => str.toLowerCase()),              // Minuscolo
    map(str => str.charAt(0).toUpperCase() + str.slice(1)), // Capitalizza
    sort((a, b) => a.localeCompare(b))         // Ordina alfabeticamente
);

// Test pipeline
const numbers = [-2, 5, 12, 8, -1, 15, 3, 20];
const strings = ['Hello', 'JS', 'Programming', 'Fun', 'Code'];

console.log('Numeri originali:', numbers);
console.log('Numeri processati:', processNumbers(numbers));
console.log('Stringhe originali:', strings);
console.log('Stringhe processate:', processStrings(strings));

// ================================
// SEZIONE 3: CASI D'USO PRATICI
// ================================

console.log('\n\n3. CASI D\'USO PRATICI');
console.log('======================');

/**
 * ESERCIZIO 3.1: Pipeline di Validazione Form
 * Crea pipeline per validazione complessa di form
 */
console.log('\n3.1 Pipeline di Validazione Form:');

// Validatori individuali
const required = (fieldName) => (value) => {
    if (!value || value.trim() === '') {
        return Err(`${fieldName} è richiesto`);
    }
    return Ok(value);
};

const minLength = (min) => (fieldName) => (value) => {
    if (value.length < min) {
        return Err(`${fieldName} deve avere almeno ${min} caratteri`);
    }
    return Ok(value);
};

const maxLength = (max) => (fieldName) => (value) => {
    if (value.length > max) {
        return Err(`${fieldName} non può superare ${max} caratteri`);
    }
    return Ok(value);
};

const matchPattern = (pattern) => (fieldName) => (value) => {
    if (!pattern.test(value)) {
        return Err(`${fieldName} non ha un formato valido`);
    }
    return Ok(value);
};

// Pipeline specifiche
const validateEmail = composeWithValidation(
    required('Email'),
    matchPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)('Email')
);

const validatePassword = composeWithValidation(
    required('Password'),
    minLength(8)('Password'),
    matchPattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)('Password')
);

const validateUsername = composeWithValidation(
    required('Username'),
    minLength(3)('Username'),
    maxLength(20)('Username'),
    matchPattern(/^[a-zA-Z0-9_]+$/)('Username')
);

// Test validazioni
const testData = {
    email: 'user@example.com',
    password: 'Password123',
    username: 'user_123'
};

console.log('Validazione email:', validateEmail(testData.email));
console.log('Validazione password:', validatePassword(testData.password));
console.log('Validazione username:', validateUsername(testData.username));

/**
 * ESERCIZIO 3.2: Pipeline di Trasformazione Dati API
 * Crea pipeline per elaborare risposte API
 */
console.log('\n3.2 Pipeline di Trasformazione Dati API:');

// Simulazione risposta API
const apiResponse = {
    status: 'success',
    data: {
        users: [
            { id: 1, first_name: 'mario', last_name: 'rossi', email: 'MARIO@EXAMPLE.COM', created_at: '2024-01-15T10:30:00Z' },
            { id: 2, first_name: 'giulia', last_name: 'bianchi', email: 'GIULIA@EXAMPLE.COM', created_at: '2024-01-16T09:15:00Z' }
        ]
    }
};

// Trasformatori
const extractData = (response) => response.data;
const extractUsers = (data) => data.users;
const normalizeUser = (user) => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.replace(/\b\w/g, l => l.toUpperCase()),
    email: user.email.toLowerCase(),
    createdAt: new Date(user.created_at).toLocaleDateString('it-IT')
});

const normalizeUsers = map(normalizeUser);
const sortByName = sort((a, b) => a.name.localeCompare(b.name));

// Pipeline completa
const processApiResponse = pipe(
    extractData,
    extractUsers,
    normalizeUsers,
    sortByName
);

const processedUsers = processApiResponse(apiResponse);
console.log('Utenti processati:', processedUsers);

/**
 * ESERCIZIO 3.3: Pipeline di Analisi Dati
 * Crea pipeline per analisi e reporting
 */
console.log('\n3.3 Pipeline di Analisi Dati:');

// Dati di vendite
const salesData = [
    { id: 1, product: 'Laptop', amount: 1200, date: '2024-01-15', region: 'Nord' },
    { id: 2, product: 'Mouse', amount: 25, date: '2024-01-16', region: 'Sud' },
    { id: 3, product: 'Laptop', amount: 1200, date: '2024-01-17', region: 'Nord' },
    { id: 4, product: 'Keyboard', amount: 80, date: '2024-01-18', region: 'Centro' },
    { id: 5, product: 'Mouse', amount: 25, date: '2024-01-19', region: 'Sud' }
];

// Funzioni di analisi
const groupBy = (keyFn) => (array) => {
    return array.reduce((groups, item) => {
        const key = keyFn(item);
        groups[key] = groups[key] || [];
        groups[key].push(item);
        return groups;
    }, {});
};

const summarizeGroup = (group) => ({
    count: group.length,
    totalAmount: group.reduce((sum, item) => sum + item.amount, 0),
    averageAmount: group.reduce((sum, item) => sum + item.amount, 0) / group.length
});

const summarizeGroups = (groups) => {
    const result = {};
    for (const [key, group] of Object.entries(groups)) {
        result[key] = summarizeGroup(group);
    }
    return result;
};

// Pipeline di analisi per prodotto
const analyzeByProduct = pipe(
    groupBy(item => item.product),
    summarizeGroups
);

// Pipeline di analisi per regione
const analyzeByRegion = pipe(
    groupBy(item => item.region),
    summarizeGroups
);

console.log('Analisi per prodotto:', analyzeByProduct(salesData));
console.log('Analisi per regione:', analyzeByRegion(salesData));

// ================================
// SEZIONE 4: COMPOSIZIONE + CURRYING
// ================================

console.log('\n\n4. COMPOSIZIONE + CURRYING');
console.log('============================');

/**
 * ESERCIZIO 4.1: Combinare Currying e Composizione
 * Usa currying per preparare funzioni per la composizione
 */
console.log('\n4.1 Combinare Currying e Composizione:');

// Funzioni curry per operazioni comuni
const add = curry((a, b) => a + b);
const multiply = curry((a, b) => a * b);
const power = curry((exp, base) => Math.pow(base, exp));
const conditionalApply = curry((condition, fn, value) => condition(value) ? fn(value) : value);

// Predicati
const isEven = (x) => x % 2 === 0;
const isPositive = (x) => x > 0;

// Operazioni specifiche
const addTen = add(10);
const multiplyByThree = multiply(3);
const square = power(2);
const doubleIfEven = conditionalApply(isEven, multiplyByThree);

// Pipeline complessa
const complexCalculation = pipe(
    addTen,           // +10
    doubleIfEven,     // *3 se pari
    square,           // ^2
    conditionalApply(isPositive, add(100)) // +100 se positivo
);

console.log('Calcolo complesso (2):', complexCalculation(2)); // ((2+10)*3)^2 + 100 = 1396
console.log('Calcolo complesso (3):', complexCalculation(3)); // (3+10)^2 = 169

/**
 * ESERCIZIO 4.2: Factory di Pipeline
 * Crea factory per generare pipeline configurabili
 */
console.log('\n4.2 Factory di Pipeline:');

const createProcessingPipeline = (config) => {
    const operations = [];
    
    if (config.filter) {
        operations.push(filter(config.filter));
    }
    
    if (config.transform) {
        operations.push(map(config.transform));
    }
    
    if (config.sort) {
        operations.push(sort(config.sort));
    }
    
    if (config.limit) {
        operations.push(array => array.slice(0, config.limit));
    }
    
    return pipe(...operations);
};

// Configurazioni diverse
const topExpensiveProducts = createProcessingPipeline({
    filter: item => item.price > 100,
    sort: (a, b) => b.price - a.price,
    limit: 3
});

const cheapProductNames = createProcessingPipeline({
    filter: item => item.price < 100,
    transform: item => item.name.toUpperCase(),
    sort: (a, b) => a.localeCompare(b)
});

// Dati di test
const products = [
    { name: 'Laptop', price: 1200 },
    { name: 'Mouse', price: 25 },
    { name: 'Keyboard', price: 80 },
    { name: 'Monitor', price: 300 },
    { name: 'Webcam', price: 150 }
];

console.log('Top prodotti costosi:', topExpensiveProducts(products));
console.log('Nomi prodotti economici:', cheapProductNames(products));

console.log('\n=== FINE ESERCIZI COMPOSIZIONE ===');

/**
 * RIEPILOGO COMPOSIZIONE:
 * 
 * VANTAGGI:
 * - Codice modulare e riusabile
 * - Funzioni piccole e testabili
 * - Pipeline leggibili e dichiarative
 * - Composizione facilita debugging
 * - Point-free programming style
 * 
 * COMPOSE vs PIPE:
 * - Compose: f(g(h(x))) - da destra a sinistra
 * - Pipe: h(g(f(x))) - da sinistra a destra
 * - Pipe spesso più naturale da leggere
 * 
 * BEST PRACTICES:
 * - Usa currying per preparare funzioni
 * - Mantieni funzioni pure
 * - Nomi descrittivi per pipeline
 * - Gestisci errori appropriatamente
 * - Testa ogni step individualmente
 */
