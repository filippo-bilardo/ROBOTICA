/**
 * SOLUZIONI COMPLETE - MODULO 8: MONADS E GESTIONE ERRORI
 * 
 * Questo file contiene le soluzioni complete a tutti gli esercizi del modulo,
 * con spiegazioni dettagliate e alternative implementazioni.
 */

// ==========================================
// IMPLEMENTAZIONI BASE MONADS
// ==========================================

console.log('=== IMPLEMENTAZIONI MONADS BASE ===\n');

// Implementazione completa Maybe Monad
class Maybe {
    constructor(value) {
        this.value = value;
    }

    static of(value) {
        return new Just(value);
    }

    static fromNullable(value) {
        return value == null ? new Nothing() : new Just(value);
    }

    static nothing() {
        return new Nothing();
    }

    isNothing() {
        return false;
    }

    isJust() {
        return false;
    }
}

class Just extends Maybe {
    constructor(value) {
        super(value);
    }

    map(fn) {
        try {
            return Maybe.fromNullable(fn(this.value));
        } catch (e) {
            return new Nothing();
        }
    }

    chain(fn) {
        try {
            return fn(this.value);
        } catch (e) {
            return new Nothing();
        }
    }

    getOrElse(defaultValue) {
        return this.value;
    }

    orElse(fn) {
        return this;
    }

    filter(predicate) {
        try {
            return predicate(this.value) ? this : new Nothing();
        } catch (e) {
            return new Nothing();
        }
    }

    isJust() {
        return true;
    }

    toString() {
        return `Just(${this.value})`;
    }
}

class Nothing extends Maybe {
    constructor() {
        super(null);
    }

    map(fn) {
        return this;
    }

    chain(fn) {
        return this;
    }

    getOrElse(defaultValue) {
        return defaultValue;
    }

    orElse(fn) {
        return fn();
    }

    filter(predicate) {
        return this;
    }

    isNothing() {
        return true;
    }

    toString() {
        return 'Nothing';
    }
}

// Implementazione completa Either Monad
class Either {
    constructor(value) {
        this.value = value;
    }

    static of(value) {
        return new Right(value);
    }

    static right(value) {
        return new Right(value);
    }

    static left(value) {
        return new Left(value);
    }

    static fromTry(fn) {
        try {
            return Either.right(fn());
        } catch (error) {
            return Either.left(error.message);
        }
    }

    isLeft() {
        return false;
    }

    isRight() {
        return false;
    }
}

class Left extends Either {
    constructor(value) {
        super(value);
    }

    map(fn) {
        return this;
    }

    mapLeft(fn) {
        return new Left(fn(this.value));
    }

    chain(fn) {
        return this;
    }

    fold(leftFn, rightFn) {
        return leftFn(this.value);
    }

    getOrElse(defaultValue) {
        return defaultValue;
    }

    isLeft() {
        return true;
    }

    toString() {
        return `Left(${this.value})`;
    }
}

class Right extends Either {
    constructor(value) {
        super(value);
    }

    map(fn) {
        try {
            return Either.right(fn(this.value));
        } catch (error) {
            return Either.left(error.message);
        }
    }

    mapLeft(fn) {
        return this;
    }

    chain(fn) {
        try {
            return fn(this.value);
        } catch (error) {
            return Either.left(error.message);
        }
    }

    fold(leftFn, rightFn) {
        return rightFn(this.value);
    }

    getOrElse(defaultValue) {
        return this.value;
    }

    isRight() {
        return true;
    }

    toString() {
        return `Right(${this.value})`;
    }
}

// ==========================================
// PATTERN FUNZIONALI AVANZATI
// ==========================================

console.log('=== PATTERN FUNZIONALI AVANZATI ===\n');

// Applicative pattern per Maybe
Maybe.prototype.ap = function(maybeFn) {
    if (this.isNothing() || maybeFn.isNothing()) {
        return new Nothing();
    }
    return this.map(maybeFn.value);
};

// Funzioni lift per applicative
const lift2 = (fn) => (maybe1) => (maybe2) => 
    maybe1.map(fn).ap(maybe2);

const lift3 = (fn) => (maybe1) => (maybe2) => (maybe3) =>
    maybe1.map(fn).ap(maybe2).ap(maybe3);

// Sequence per convertire array di Maybe in Maybe di array
const sequenceMaybe = (maybes) => {
    return maybes.reduce((acc, maybe) => {
        return acc.chain(arr =>
            maybe.map(val => [...arr, val])
        );
    }, Maybe.of([]));
};

// Traverse per mappare e sequenziare
const traverseMaybe = (fn) => (arr) => {
    return sequenceMaybe(arr.map(fn));
};

// ==========================================
// VALIDAZIONE FORM AVANZATA
// ==========================================

console.log('=== VALIDAZIONE FORM AVANZATA ===\n');

// Validatori base
const validateNonEmpty = (str, errorMsg) => {
    return str && str.trim().length > 0 
        ? Either.right(str) 
        : Either.left(errorMsg);
};

const validateMinLength = (str, minLength, errorMsg) => {
    return str && str.length >= minLength 
        ? Either.right(str)
        : Either.left(errorMsg);
};

const validateMaxLength = (str, maxLength, errorMsg) => {
    return str && str.length <= maxLength 
        ? Either.right(str)
        : Either.left(errorMsg);
};

const validateEmail = (str, errorMsg) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str) 
        ? Either.right(str)
        : Either.left(errorMsg);
};

const parseInteger = (str, errorMsg) => {
    const parsed = parseInt(str, 10);
    return isNaN(parsed) 
        ? Either.left(errorMsg)
        : Either.right(parsed);
};

const validateRange = (num, min, max, errorMsg) => {
    return num >= min && num <= max 
        ? Either.right(num)
        : Either.left(errorMsg);
};

// Combinatore di validatori con accumulazione errori
const validateWithAllErrors = (validators) => (value) => {
    const results = validators.map(validator => validator(value));
    const errors = results.filter(result => result.isLeft()).map(result => result.value);
    
    if (errors.length > 0) {
        return Either.left(errors);
    }
    
    return Either.right(value);
};

// Sistema di validazione form completo
const createFormValidator = (schema) => (data) => {
    const results = {};
    const errors = {};
    
    for (const [field, validators] of Object.entries(schema)) {
        const value = data[field];
        const result = validateWithAllErrors(validators)(value);
        
        if (result.isLeft()) {
            errors[field] = result.value;
        } else {
            results[field] = result.value;
        }
    }
    
    return Object.keys(errors).length > 0 
        ? Either.left(errors)
        : Either.right(results);
};

// Esempio di utilizzo validazione form
const userSchema = {
    name: [
        (value) => validateNonEmpty(value, 'Nome è obbligatorio'),
        (value) => validateMinLength(value, 2, 'Nome deve essere di almeno 2 caratteri')
    ],
    email: [
        (value) => validateNonEmpty(value, 'Email è obbligatoria'),
        (value) => validateEmail(value, 'Email non valida')
    ],
    age: [
        (value) => validateNonEmpty(value, 'Età è obbligatoria'),
        (value) => parseInteger(value, 'Età deve essere un numero')
            .chain(age => validateRange(age, 1, 120, 'Età deve essere tra 1 e 120'))
    ]
};

const validateUser = createFormValidator(userSchema);

// Test validazione
const testData = [
    { name: 'Mario Rossi', email: 'mario@example.com', age: '30' },
    { name: 'A', email: 'invalid', age: 'not-a-number' }
];

console.log('Test validazione form:');
testData.forEach((data, index) => {
    const result = validateUser(data);
    console.log(`Utente ${index + 1}:`, result.toString());
});

// ==========================================
// GESTIONE API CON RETRY E TIMEOUT
// ==========================================

console.log('\n=== GESTIONE API AVANZATA ===\n');

// Task monad per operazioni asincrone
class Task {
    constructor(computation) {
        this.computation = computation;
    }

    static of(value) {
        return new Task((reject, resolve) => resolve(value));
    }

    static fromPromise(promiseFactory) {
        return new Task((reject, resolve) => {
            promiseFactory()
                .then(resolve)
                .catch(reject);
        });
    }

    map(fn) {
        return new Task((reject, resolve) => {
            this.computation(reject, value => resolve(fn(value)));
        });
    }

    chain(fn) {
        return new Task((reject, resolve) => {
            this.computation(reject, value => {
                fn(value).computation(reject, resolve);
            });
        });
    }

    fork(onError, onSuccess) {
        this.computation(onError, onSuccess);
    }

    timeout(ms) {
        return new Task((reject, resolve) => {
            let finished = false;
            
            const timeoutId = setTimeout(() => {
                if (!finished) {
                    finished = true;
                    reject(new Error(`Timeout dopo ${ms}ms`));
                }
            }, ms);
            
            this.computation(
                error => {
                    if (!finished) {
                        finished = true;
                        clearTimeout(timeoutId);
                        reject(error);
                    }
                },
                value => {
                    if (!finished) {
                        finished = true;
                        clearTimeout(timeoutId);
                        resolve(value);
                    }
                }
            );
        });
    }
}

// Funzione retry con backoff esponenziale
const withRetry = (taskFactory, maxRetries = 3, baseDelay = 1000) => {
    const attempt = (retriesLeft) => {
        return taskFactory().chain(result => {
            return Task.of(result);
        }).timeout(5000).fork(
            error => {
                if (retriesLeft > 0) {
                    const delay = baseDelay * Math.pow(2, maxRetries - retriesLeft);
                    console.log(`Tentativo fallito: ${error.message}. Riprovo tra ${delay}ms...`);
                    setTimeout(() => attempt(retriesLeft - 1), delay);
                } else {
                    throw error;
                }
            },
            result => result
        );
    };
    
    return attempt(maxRetries);
};

// Simulazione API con retry
const mockApiCall = (url, shouldFail = false) => {
    return Task.fromPromise(() => 
        new Promise((resolve, reject) => {
            setTimeout(() => {
                if (shouldFail) {
                    reject(new Error(`API call failed for ${url}`));
                } else {
                    resolve({ url, data: 'success', timestamp: Date.now() });
                }
            }, Math.random() * 1000);
        })
    );
};

// Test API con retry
console.log('Test API con retry:');
const apiWithRetry = () => mockApiCall('/users', Math.random() > 0.7);

withRetry(apiWithRetry, 3, 500);

// ==========================================
// COMPOSIZIONE MONAD PATTERN
// ==========================================

console.log('\n=== COMPOSIZIONE MONAD PATTERNS ===\n');

// Kleisli composition per monads
const kleisliCompose = (f, g) => (x) => {
    return f(x).chain(g);
};

// Operatore >=> per composizione Kleisli
const andThen = (f) => (g) => kleisliCompose(f, g);

// Pipeline di trasformazione dati sicura
const safeParseInt = (str) => {
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? Maybe.nothing() : Maybe.of(parsed);
};

const safeSqrt = (num) => {
    return num >= 0 ? Maybe.of(Math.sqrt(num)) : Maybe.nothing();
};

const formatResult = (num) => {
    return Maybe.of(`Risultato: ${num.toFixed(2)}`);
};

// Composizione della pipeline
const processNumber = andThen(safeParseInt)(andThen(safeSqrt)(formatResult));

// Test composizione
console.log('Test composizione pipeline:');
['16', '25', '-4', 'abc'].forEach(input => {
    console.log(`Input: ${input} -> ${processNumber(input).toString()}`);
});

// ==========================================
// CACHE MONADICO CON TTL
// ==========================================

console.log('\n=== CACHE MONADICO ===\n');

// Cache implementation con Maybe per gestire miss
class MonadicCache {
    constructor(ttl = 60000) {
        this.cache = new Map();
        this.ttl = ttl;
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return Maybe.nothing();
        }
        
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return Maybe.nothing();
        }
        
        return Maybe.of(entry.value);
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
        return Maybe.of(value);
    }

    getOrCompute(key, computeFn) {
        return this.get(key).orElse(() => {
            console.log(`Cache miss per ${key}, ricomputo...`);
            const result = computeFn();
            this.set(key, result);
            return Maybe.of(result);
        });
    }
}

// Test cache
const cache = new MonadicCache(2000);

const expensiveComputation = (n) => {
    console.log(`Computazione costosa per ${n}`);
    return Math.pow(n, 3);
};

console.log('Test cache:');
console.log(cache.getOrCompute('key1', () => expensiveComputation(5)).toString());
console.log(cache.getOrCompute('key1', () => expensiveComputation(5)).toString()); // Cache hit

setTimeout(() => {
    console.log('Dopo TTL:');
    console.log(cache.getOrCompute('key1', () => expensiveComputation(5)).toString()); // Cache miss
}, 2100);

console.log('\n=== RIEPILOGO SOLUZIONI ===');
console.log('✅ Implementazioni Maybe e Either complete');
console.log('✅ Pattern applicativi e sequence/traverse');
console.log('✅ Sistema validazione form avanzato');
console.log('✅ Gestione API con retry e timeout');
console.log('✅ Composizione Kleisli');
console.log('✅ Cache monadico con TTL');

console.log('\n💡 PATTERN DA RICORDARE:');
console.log('- Maybe per valori opzionali sicuri');
console.log('- Either per gestione errori esplicita');
console.log('- Task per operazioni asincrone composabili');
console.log('- Applicative per combinare più monads');
console.log('- Kleisli composition per pipeline monads');

/**
 * CONCLUSIONI DIDATTICHE:
 * 
 * I monads forniscono un framework potente per:
 * 1. Gestione sicura di valori nulli/undefined
 * 2. Gestione esplicita e composabile degli errori
 * 3. Operazioni asincrone controllate
 * 4. Composizione di operazioni complesse
 * 
 * Best practices:
 * - Usa Maybe per valori opzionali
 * - Usa Either per validazione e error handling
 * - Usa Task per operazioni asincrone
 * - Combina monads con applicative quando necessario
 * - Implementa retry e timeout per robustezza
 */
