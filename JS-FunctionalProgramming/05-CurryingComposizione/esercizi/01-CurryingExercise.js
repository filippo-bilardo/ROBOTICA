/**
 * MODULO 5: CURRYING E COMPOSIZIONE - ESERCIZIO 1
 * ===============================================
 * 
 * Implementazione e pratica del Currying
 * 
 * OBIETTIVI:
 * - Comprendere il concetto di currying
 * - Implementare funzioni curry personalizzate
 * - Praticare la trasformazione di funzioni
 * - Sfruttare i vantaggi del currying per riusabilità
 */

console.log('=== ESERCIZI CURRYING ===\n');

// ================================
// SEZIONE 1: CURRYING BASE
// ================================

console.log('1. CURRYING BASE');
console.log('================');

/**
 * ESERCIZIO 1.1: Implementazione Curry Manuale
 * Trasforma funzioni normali in versioni curry
 */
console.log('\n1.1 Implementazione Curry Manuale:');

// Funzione normale per addizione
const add = (a, b, c) => a + b + c;

// Versione curry manuale
const addCurried = (a) => (b) => (c) => a + b + c;

// Test delle due versioni
console.log('Addizione normale:', add(1, 2, 3));
console.log('Addizione curry:', addCurried(1)(2)(3));

// Applicazione parziale
const add5 = addCurried(5);
const add5And3 = add5(3);
console.log('Applicazione parziale:', add5And3(2)); // 5 + 3 + 2 = 10

/**
 * ESERCIZIO 1.2: Funzione Curry Generica
 * Implementa una funzione che trasforma qualsiasi funzione in curry
 */
console.log('\n1.2 Funzione Curry Generica:');

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

// Test con funzioni diverse
const multiply = (a, b, c) => a * b * c;
const curriedMultiply = curry(multiply);

console.log('Multiply normale:', multiply(2, 3, 4));
console.log('Multiply curry completo:', curriedMultiply(2)(3)(4));
console.log('Multiply curry parziale:', curriedMultiply(2, 3)(4));
console.log('Multiply curry misto:', curriedMultiply(2)(3, 4));

/**
 * ESERCIZIO 1.3: Currying con Funzioni Pratiche
 * Applica currying a funzioni utili
 */
console.log('\n1.3 Currying con Funzioni Pratiche:');

// Funzione per formattazione stringhe
const formatString = curry((template, ...values) => {
    return template.replace(/{(\d+)}/g, (match, index) => {
        return values[index] || match;
    });
});

// Template predefiniti
const greetTemplate = formatString('Ciao {0}, benvenuto in {1}!');
const errorTemplate = formatString('Errore {0}: {1}');

console.log('Saluto:', greetTemplate('Mario', 'JavaScript'));
console.log('Errore:', errorTemplate('404', 'Pagina non trovata'));

// Funzione per validazione
const isValid = curry((min, max, value) => {
    return value >= min && value <= max;
});

const isValidAge = isValid(0, 120);
const isValidPercentage = isValid(0, 100);

console.log('Età valida (25):', isValidAge(25));
console.log('Età valida (-5):', isValidAge(-5));
console.log('Percentuale valida (85):', isValidPercentage(85));
console.log('Percentuale valida (150):', isValidPercentage(150));

// ================================
// SEZIONE 2: CURRYING AVANZATO
// ================================

console.log('\n\n2. CURRYING AVANZATO');
console.log('====================');

/**
 * ESERCIZIO 2.1: Currying con Array Methods
 * Applica currying ai metodi degli array
 */
console.log('\n2.1 Currying con Array Methods:');

const map = curry((fn, array) => array.map(fn));
const filter = curry((predicate, array) => array.filter(predicate));
const reduce = curry((fn, initialValue, array) => array.reduce(fn, initialValue));

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Funzioni specializzate
const double = map(x => x * 2);
const square = map(x => x * x);
const isEven = filter(x => x % 2 === 0);
const isOdd = filter(x => x % 2 !== 0);
const sum = reduce((acc, curr) => acc + curr, 0);

console.log('Originali:', numbers);
console.log('Doppi:', double(numbers));
console.log('Quadrati:', square(numbers));
console.log('Pari:', isEven(numbers));
console.log('Dispari:', isOdd(numbers));
console.log('Somma:', sum(numbers));

/**
 * ESERCIZIO 2.2: Currying per Configurazioni
 * Usa currying per creare funzioni configurabili
 */
console.log('\n2.2 Currying per Configurazioni:');

// Funzione di fetch configurabile
const fetchData = curry((baseURL, endpoint, options) => {
    const url = `${baseURL}${endpoint}`;
    console.log(`Fetching from: ${url}`);
    console.log('Options:', options);
    return { url, options }; // Simulazione
});

// API specifiche
const apiV1 = fetchData('https://api.example.com/v1');
const apiV2 = fetchData('https://api.example.com/v2');

// Endpoint specifici
const getUsers = apiV1('/users');
const getProducts = apiV2('/products');

console.log('Get Users:', getUsers({ method: 'GET' }));
console.log('Get Products:', getProducts({ method: 'GET', cache: true }));

// Funzione di logging configurabile
const createLogger = curry((level, service, message) => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()} [${service}]: ${message}`;
});

const infoLogger = createLogger('info');
const errorLogger = createLogger('error');
const authServiceInfo = infoLogger('auth-service');
const dbServiceError = errorLogger('database-service');

console.log(authServiceInfo('User logged in successfully'));
console.log(dbServiceError('Connection timeout'));

/**
 * ESERCIZIO 2.3: Currying per Composizione
 * Prepara funzioni per essere composte facilmente
 */
console.log('\n2.3 Currying per Composizione:');

// Operazioni matematiche curry
const add2 = curry((a, b) => a + b);
const multiply2 = curry((a, b) => a * b);
const power = curry((base, exponent) => Math.pow(base, exponent));
const divide = curry((a, b) => a / b);

// Operazioni specializzate
const addTen = add2(10);
const multiplyByTwo = multiply2(2);
const square2 = power(2);
const halve = divide(2);

// Funzioni utili per array
const increment = map(addTen);
const doubleValues = map(multiplyByTwo);
const squareValues = map(square2);

const testNumbers = [1, 2, 3, 4, 5];
console.log('Originali:', testNumbers);
console.log('Incrementati (+10):', increment(testNumbers));
console.log('Raddoppiati:', doubleValues(testNumbers));
console.log('Al quadrato:', squareValues(testNumbers));

// ================================
// SEZIONE 3: CASI D'USO PRATICI
// ================================

console.log('\n\n3. CASI D\'USO PRATICI');
console.log('======================');

/**
 * ESERCIZIO 3.1: Sistema di Validazione
 * Crea un sistema di validazione modulare usando currying
 */
console.log('\n3.1 Sistema di Validazione:');

// Validatori base
const isRequired = curry((fieldName, value) => {
    return value !== null && value !== undefined && value !== '' 
        ? { valid: true } 
        : { valid: false, error: `${fieldName} è richiesto` };
});

const hasMinLength = curry((min, fieldName, value) => {
    return value && value.length >= min 
        ? { valid: true } 
        : { valid: false, error: `${fieldName} deve avere almeno ${min} caratteri` };
});

const hasMaxLength = curry((max, fieldName, value) => {
    return value && value.length <= max 
        ? { valid: true } 
        : { valid: false, error: `${fieldName} non può superare ${max} caratteri` };
});

const matchesPattern = curry((pattern, fieldName, value) => {
    return pattern.test(value) 
        ? { valid: true } 
        : { valid: false, error: `${fieldName} non ha un formato valido` };
});

// Validatori specifici
const validateRequired = isRequired;
const validateMinLength = hasMinLength(3);
const validateMaxLength = hasMaxLength(50);
const validateEmail = matchesPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

// Test validatori
const testData = {
    name: 'Mario',
    email: 'mario@example.com',
    password: 'ab'
};

console.log('Nome richiesto:', validateRequired('Nome')(testData.name));
console.log('Nome lunghezza minima:', validateMinLength('Nome')(testData.name));
console.log('Email formato:', validateEmail('Email')(testData.email));
console.log('Password lunghezza minima:', validateMinLength('Password')(testData.password));

/**
 * ESERCIZIO 3.2: Sistema di Permissions
 * Implementa un sistema di permessi usando currying
 */
console.log('\n3.2 Sistema di Permissions:');

const hasPermission = curry((requiredPermission, user, action) => {
    if (!user.permissions.includes(requiredPermission)) {
        throw new Error(`Permesso ${requiredPermission} richiesto per ${action}`);
    }
    return `${action} autorizzato per ${user.name}`;
});

// Permessi specifici
const requiresAdmin = hasPermission('admin');
const requiresWrite = hasPermission('write');
const requiresRead = hasPermission('read');

// Utenti di test
const adminUser = { name: 'Admin', permissions: ['admin', 'write', 'read'] };
const editorUser = { name: 'Editor', permissions: ['write', 'read'] };
const viewerUser = { name: 'Viewer', permissions: ['read'] };

// Test permessi
try {
    console.log(requiresRead(adminUser, 'visualizzare dati'));
    console.log(requiresWrite(editorUser, 'modificare articolo'));
    console.log(requiresAdmin(adminUser, 'eliminare utente'));
    // console.log(requiresAdmin(viewerUser, 'eliminare utente')); // Errore
} catch (error) {
    console.log('Errore permessi:', error.message);
}

/**
 * ESERCIZIO 3.3: Pipeline di Trasformazione Dati
 * Usa currying per creare pipeline riusabili
 */
console.log('\n3.3 Pipeline di Trasformazione Dati:');

// Trasformatori curry
const addField = curry((fieldName, getValue, obj) => ({
    ...obj,
    [fieldName]: getValue(obj)
}));

const removeField = curry((fieldName, obj) => {
    const { [fieldName]: removed, ...rest } = obj;
    return rest;
});

const transformField = curry((fieldName, transformer, obj) => ({
    ...obj,
    [fieldName]: transformer(obj[fieldName])
}));

// Dati di test
const users = [
    { id: 1, firstName: 'Mario', lastName: 'Rossi', age: 30 },
    { id: 2, firstName: 'Giulia', lastName: 'Bianchi', age: 25 },
    { id: 3, firstName: 'Luca', lastName: 'Verdi', age: 35 }
];

// Trasformatori specifici
const addFullName = addField('fullName', user => `${user.firstName} ${user.lastName}`);
const addAgeCategory = addField('ageCategory', user => user.age < 30 ? 'Giovane' : 'Adulto');
const removeAge = removeField('age');
const upperCaseFirstName = transformField('firstName', name => name.toUpperCase());

// Applica trasformazioni
const processedUsers = users
    .map(addFullName)
    .map(addAgeCategory)
    .map(upperCaseFirstName)
    .map(removeAge);

console.log('Utenti processati:', processedUsers);

// ================================
// SEZIONE 4: ESERCIZI BONUS
// ================================

console.log('\n\n4. ESERCIZI BONUS');
console.log('=================');

/**
 * BONUS 1: Auto-Curry con Simboli
 * Implementa auto-currying avanzato
 */
console.log('\n4.1 Auto-Curry Avanzato:');

const autoCurry = (fn, arity = fn.length) => {
    return function curried(...args) {
        if (args.length >= arity) {
            return fn.apply(this, args.slice(0, arity));
        }
        return autoCurry(
            (...nextArgs) => fn.apply(this, [...args, ...nextArgs]),
            arity - args.length
        );
    };
};

// Test con funzione variadica
const sumAll = (...numbers) => numbers.reduce((a, b) => a + b, 0);
const curriedSum = autoCurry(sumAll, 3); // Forza arity 3

console.log('Sum auto-curry:', curriedSum(1)(2)(3));
console.log('Sum auto-curry parziale:', curriedSum(1, 2)(3));

/**
 * BONUS 2: Curry con Placeholder
 * Implementa currying con supporto per placeholder
 */
console.log('\n4.2 Curry con Placeholder:');

const _ = Symbol('placeholder');

const curryWithPlaceholder = (fn) => {
    return function curried(...args) {
        const hasPlaceholder = args.some(arg => arg === _);
        const filledArgs = args.filter(arg => arg !== _);
        
        if (!hasPlaceholder && args.length >= fn.length) {
            return fn.apply(this, args);
        }
        
        return (...nextArgs) => {
            let nextArgIndex = 0;
            const newArgs = args.map(arg => 
                arg === _ ? nextArgs[nextArgIndex++] : arg
            );
            return curried(...newArgs, ...nextArgs.slice(nextArgIndex));
        };
    };
};

const substract = (a, b, c) => a - b - c;
const curriedSubstract = curryWithPlaceholder(substract);

console.log('Substract normale:', substract(10, 3, 2)); // 5
console.log('Substract con placeholder:', curriedSubstract(10, _, 2)(3)); // 5
console.log('Substract con placeholder multipli:', curriedSubstract(_, 3, _)(10, 2)); // 5

console.log('\n=== FINE ESERCIZI CURRYING ===');

/**
 * RIEPILOGO CURRYING:
 * 
 * VANTAGGI:
 * - Applicazione parziale di funzioni
 * - Riusabilità del codice
 * - Composizione più facile
 * - Configurazione modulare
 * - Point-free programming
 * 
 * QUANDO USARE:
 * - Funzioni con configurazioni comuni
 * - Pipeline di trasformazione
 * - Sistemi di validazione
 * - API wrapper
 * - Functional composition
 * 
 * BEST PRACTICES:
 * - Mantieni parametri più specifici per ultimi
 * - Usa nomi descrittivi per funzioni parziali
 * - Documenta l'ordine dei parametri
 * - Considera performance per funzioni molto chiamate
 */
