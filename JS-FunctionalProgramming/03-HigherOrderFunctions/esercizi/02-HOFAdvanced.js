/**
 * ESERCIZIO 2: HIGHER-ORDER FUNCTIONS AVANZATE
 * Implementazione di pattern e tecniche avanzate con HOF
 * 
 * OBIETTIVI:
 * - Creare HOF complesse per problemi reali
 * - Implementare pattern di programmazione funzionale avanzati
 * - Ottimizzare performance con HOF intelligenti
 * - Costruire librerie di utilità riusabili
 */

console.log("=== ESERCIZIO 2: HOF AVANZATE ===\n");

// ========================================
// SEZIONE 1: FUNCTIONAL COMPOSITION AVANZATA
// ========================================

console.log("--- SEZIONE 1: FUNCTIONAL COMPOSITION AVANZATA ---\n");

// 1.1: Compose con error handling
function safeCompose(...functions) {
    return function(value) {
        try {
            return functions.reduceRight((acc, fn) => {
                if (acc instanceof Error) return acc;
                try {
                    return fn(acc);
                } catch (error) {
                    return new Error(`Error in function: ${error.message}`);
                }
            }, value);
        } catch (error) {
            return new Error(`Composition error: ${error.message}`);
        }
    };
}

// 1.2: Async composition
function asyncCompose(...functions) {
    return async function(value) {
        let result = value;
        for (const fn of functions.reverse()) {
            result = await fn(result);
        }
        return result;
    };
}

function asyncPipe(...functions) {
    return async function(value) {
        let result = value;
        for (const fn of functions) {
            result = await fn(result);
        }
        return result;
    };
}

// Test composizione sicura
const safeDivide = x => {
    if (x === 0) throw new Error("Division by zero");
    return 10 / x;
};

const safeSquare = x => x * x;
const safeAdd5 = x => x + 5;

const safeTransform = safeCompose(safeAdd5, safeSquare, safeDivide);

console.log("1.1 - Safe composition:");
console.log("safeTransform(2):", safeTransform(2)); // (10/2)^2 + 5 = 30
console.log("safeTransform(0):", safeTransform(0)); // Error
console.log();

// Test composizione asincrona
const asyncDouble = async x => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return x * 2;
};

const asyncAddTen = async x => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return x + 10;
};

const asyncTransform = asyncPipe(asyncDouble, asyncAddTen);

// Test asincrono (commenta per evitare delay nei test)
// asyncTransform(5).then(result => console.log("Async result:", result)); // 20

console.log("1.2 - Async composition setup completed");
console.log();

// ========================================
// SEZIONE 2: ADVANCED FUNCTIONAL PATTERNS
// ========================================

console.log("--- SEZIONE 2: ADVANCED FUNCTIONAL PATTERNS ---\n");

// 2.1: Maybe Monad simulation
class Maybe {
    constructor(value) {
        this.value = value;
    }

    static of(value) {
        return new Maybe(value);
    }

    static nothing() {
        return new Maybe(null);
    }

    isNothing() {
        return this.value === null || this.value === undefined;
    }

    map(fn) {
        if (this.isNothing()) {
            return Maybe.nothing();
        }
        try {
            return Maybe.of(fn(this.value));
        } catch (error) {
            return Maybe.nothing();
        }
    }

    flatMap(fn) {
        if (this.isNothing()) {
            return Maybe.nothing();
        }
        return fn(this.value);
    }

    filter(predicate) {
        if (this.isNothing() || !predicate(this.value)) {
            return Maybe.nothing();
        }
        return this;
    }

    getOrElse(defaultValue) {
        return this.isNothing() ? defaultValue : this.value;
    }
}

// Funzioni che creano HOF con Maybe
function safeProp(propName) {
    return obj => obj && obj[propName] !== undefined ? Maybe.of(obj[propName]) : Maybe.nothing();
}

function safeCall(fn) {
    return (...args) => {
        try {
            const result = fn(...args);
            return Maybe.of(result);
        } catch (error) {
            return Maybe.nothing();
        }
    };
}

// Test Maybe
console.log("2.1 - Maybe Monad:");
const user = { profile: { name: "Alice", age: 30 } };
const incompleteUser = { profile: { name: "Bob" } };

const getName = obj => Maybe.of(obj)
    .flatMap(safeProp('profile'))
    .flatMap(safeProp('name'))
    .getOrElse('Unknown');

const getAge = obj => Maybe.of(obj)
    .flatMap(safeProp('profile'))
    .flatMap(safeProp('age'))
    .getOrElse(0);

console.log("Complete user name:", getName(user));
console.log("Complete user age:", getAge(user));
console.log("Incomplete user name:", getName(incompleteUser));
console.log("Incomplete user age:", getAge(incompleteUser));
console.log();

// 2.2: Either Monad simulation (per error handling)
class Either {
    constructor(value, isRight = true) {
        this.value = value;
        this.isRight = isRight;
    }

    static right(value) {
        return new Either(value, true);
    }

    static left(value) {
        return new Either(value, false);
    }

    map(fn) {
        if (!this.isRight) return this;
        try {
            return Either.right(fn(this.value));
        } catch (error) {
            return Either.left(error.message);
        }
    }

    flatMap(fn) {
        if (!this.isRight) return this;
        return fn(this.value);
    }

    mapLeft(fn) {
        if (this.isRight) return this;
        return Either.left(fn(this.value));
    }

    fold(leftFn, rightFn) {
        return this.isRight ? rightFn(this.value) : leftFn(this.value);
    }
}

// HOF per validazione con Either
function validate(rules) {
    return value => {
        for (const rule of rules) {
            const result = rule(value);
            if (!result.isRight) {
                return result;
            }
        }
        return Either.right(value);
    };
}

function required(message = "Field is required") {
    return value => value ? Either.right(value) : Either.left(message);
}

function minLength(min, message = `Minimum length is ${min}`) {
    return value => value.length >= min ? Either.right(value) : Either.left(message);
}

function isEmail(message = "Invalid email format") {
    return value => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? Either.right(value) : Either.left(message);
    };
}

// Test Either
console.log("2.2 - Either Monad:");
const validateEmail = validate([
    required("Email is required"),
    minLength(5, "Email too short"),
    isEmail("Invalid email format")
]);

console.log("Valid email:", validateEmail("alice@example.com").fold(
    error => `Error: ${error}`,
    value => `Valid: ${value}`
));

console.log("Invalid email:", validateEmail("bad").fold(
    error => `Error: ${error}`,
    value => `Valid: ${value}`
));
console.log();

// ========================================
// SEZIONE 3: ADVANCED ARRAY OPERATIONS
// ========================================

console.log("--- SEZIONE 3: ADVANCED ARRAY OPERATIONS ---\n");

// 3.1: Chunking e partitioning
function chunk(size) {
    return array => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };
}

function partition(predicate) {
    return array => {
        const truthy = [];
        const falsy = [];
        array.forEach(item => {
            if (predicate(item)) {
                truthy.push(item);
            } else {
                falsy.push(item);
            }
        });
        return [truthy, falsy];
    };
}

// 3.2: Advanced grouping
function groupByMultiple(...keySelectors) {
    return array => {
        return array.reduce((groups, item) => {
            const key = keySelectors.map(selector => selector(item)).join('|');
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    };
}

function nest(keySelector, valueSelector = x => x) {
    return array => {
        return array.reduce((nested, item) => {
            const key = keySelector(item);
            const value = valueSelector(item);
            
            if (!nested[key]) {
                nested[key] = [];
            }
            nested[key].push(value);
            return nested;
        }, {});
    };
}

// Test operazioni avanzate array
const testData = [
    { dept: "Engineering", level: "Senior", name: "Alice", salary: 80000 },
    { dept: "Engineering", level: "Junior", name: "Bob", salary: 60000 },
    { dept: "Marketing", level: "Senior", name: "Charlie", salary: 70000 },
    { dept: "Engineering", level: "Senior", name: "Diana", salary: 85000 },
    { dept: "Marketing", level: "Junior", name: "Eve", salary: 50000 }
];

console.log("3.1 - Chunking e partitioning:");
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log("Chunk by 3:", chunk(3)(numbers));

const [evens, odds] = partition(n => n % 2 === 0)(numbers);
console.log("Partition even/odd:", { evens, odds });

console.log("3.2 - Advanced grouping:");
const groupedByDeptLevel = groupByMultiple(
    item => item.dept,
    item => item.level
)(testData);
console.log("Grouped by dept+level:", groupedByDeptLevel);

const nestedByDept = nest(
    item => item.dept,
    item => ({ name: item.name, salary: item.salary })
)(testData);
console.log("Nested by department:", nestedByDept);
console.log();

// ========================================
// SEZIONE 4: CACHING E MEMOIZATION AVANZATI
// ========================================

console.log("--- SEZIONE 4: CACHING E MEMOIZATION AVANZATI ---\n");

// 4.1: Memoization con TTL (Time To Live)
function memoizeWithTTL(ttl = 60000) { // Default 1 minuto
    return function(fn) {
        const cache = new Map();
        
        return function(...args) {
            const key = JSON.stringify(args);
            const now = Date.now();
            
            if (cache.has(key)) {
                const { value, timestamp } = cache.get(key);
                if (now - timestamp < ttl) {
                    console.log(`Cache hit (TTL) for ${key}`);
                    return value;
                }
                cache.delete(key); // Expired
            }
            
            console.log(`Computing with TTL for ${key}`);
            const result = fn(...args);
            cache.set(key, { value: result, timestamp: now });
            return result;
        };
    };
}

// 4.2: Memoization condizionale
function memoizeIf(condition) {
    return function(fn) {
        const cache = new Map();
        
        return function(...args) {
            if (!condition(...args)) {
                return fn(...args);
            }
            
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                console.log(`Conditional cache hit for ${key}`);
                return cache.get(key);
            }
            
            console.log(`Computing conditionally for ${key}`);
            const result = fn(...args);
            cache.set(key, result);
            return result;
        };
    };
}

// 4.3: Cache con invalidazione
function memoizeWithInvalidation() {
    const cache = new Map();
    
    function memoizedFn(fn) {
        return function(...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                console.log(`Cache hit for ${key}`);
                return cache.get(key);
            }
            
            console.log(`Computing for ${key}`);
            const result = fn(...args);
            cache.set(key, result);
            return result;
        };
    }
    
    memoizedFn.invalidate = (pattern) => {
        if (!pattern) {
            cache.clear();
            console.log("Cache cleared completely");
            return;
        }
        
        for (const [key, _] of cache) {
            if (key.includes(pattern)) {
                cache.delete(key);
                console.log(`Invalidated cache for ${key}`);
            }
        }
    };
    
    memoizedFn.cacheSize = () => cache.size;
    
    return memoizedFn;
}

// Test caching avanzato
const expensiveCalc = (x, y) => {
    // Simula calcolo costoso
    return x * x + y * y;
};

console.log("4.1 - Memoization con TTL:");
const memoizedWithTTL = memoizeWithTTL(5000)(expensiveCalc); // 5 secondi TTL
console.log("Result 1:", memoizedWithTTL(3, 4));
console.log("Result 2:", memoizedWithTTL(3, 4)); // Cache hit

console.log("4.2 - Memoization condizionale:");
const memoizeForLargeNumbers = memoizeIf((x, y) => x > 10 || y > 10);
const conditionalMemoized = memoizeForLargeNumbers(expensiveCalc);
console.log("Small numbers:", conditionalMemoized(2, 3)); // Non cached
console.log("Large numbers:", conditionalMemoized(15, 20)); // Cached
console.log("Large numbers again:", conditionalMemoized(15, 20)); // Cache hit

console.log("4.3 - Cache con invalidazione:");
const invalidatableMemoize = memoizeWithInvalidation();
const memoizedCalc = invalidatableMemoize(expensiveCalc);
console.log("Calc 1:", memoizedCalc(5, 5));
console.log("Calc 2:", memoizedCalc(5, 5)); // Cache hit
console.log("Cache size:", memoizedCalc.cacheSize());
memoizedCalc.invalidate();
console.log("Cache size after invalidation:", memoizedCalc.cacheSize());
console.log();

// ========================================
// SEZIONE 5: ASYNC HOF PATTERNS
// ========================================

console.log("--- SEZIONE 5: ASYNC HOF PATTERNS ---\n");

// 5.1: Parallel vs Sequential execution
function executeInParallel(asyncFunctions) {
    return Promise.all(asyncFunctions.map(fn => fn()));
}

function executeInSequence(asyncFunctions) {
    return asyncFunctions.reduce(async (prev, fn) => {
        await prev;
        return fn();
    }, Promise.resolve());
}

// 5.2: Rate limiting
function rateLimit(fn, maxCalls, timeWindow) {
    const calls = [];
    
    return async function(...args) {
        const now = Date.now();
        
        // Rimuovi chiamate fuori dalla finestra temporale
        while (calls.length > 0 && now - calls[0] > timeWindow) {
            calls.shift();
        }
        
        if (calls.length >= maxCalls) {
            throw new Error(`Rate limit exceeded: ${maxCalls} calls per ${timeWindow}ms`);
        }
        
        calls.push(now);
        return fn(...args);
    };
}

// 5.3: Circuit breaker
function circuitBreaker(fn, failureThreshold = 5, resetTimeout = 60000) {
    let failureCount = 0;
    let lastFailureTime = null;
    let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    
    return async function(...args) {
        const now = Date.now();
        
        // Reset se è passato abbastanza tempo
        if (state === 'OPEN' && now - lastFailureTime > resetTimeout) {
            state = 'HALF_OPEN';
            failureCount = 0;
        }
        
        if (state === 'OPEN') {
            throw new Error('Circuit breaker is OPEN');
        }
        
        try {
            const result = await fn(...args);
            
            // Successo: reset failure count
            if (state === 'HALF_OPEN') {
                state = 'CLOSED';
            }
            failureCount = 0;
            
            return result;
        } catch (error) {
            failureCount++;
            lastFailureTime = now;
            
            if (failureCount >= failureThreshold) {
                state = 'OPEN';
            }
            
            throw error;
        }
    };
}

// 5.4: Retry con backoff
function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000, backoffFactor = 2) {
    return async function(...args) {
        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn(...args);
            } catch (error) {
                lastError = error;
                
                if (attempt === maxRetries) {
                    break;
                }
                
                const delay = baseDelay * Math.pow(backoffFactor, attempt);
                console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw lastError;
    };
}

console.log("5.1-5.4 - Async patterns setup completed");
console.log();

// ========================================
// SEZIONE 6: BUILDING FUNCTIONAL LIBRARIES
// ========================================

console.log("--- SEZIONE 6: BUILDING FUNCTIONAL LIBRARIES ---\n");

// 6.1: Functional utility library
const FP = {
    // Core utilities
    identity: x => x,
    constant: x => () => x,
    noop: () => {},
    
    // Predicates
    isArray: Array.isArray,
    isObject: x => x !== null && typeof x === 'object' && !Array.isArray(x),
    isFunction: x => typeof x === 'function',
    isString: x => typeof x === 'string',
    isNumber: x => typeof x === 'number' && !isNaN(x),
    
    // Array utilities
    head: arr => arr[0],
    tail: arr => arr.slice(1),
    last: arr => arr[arr.length - 1],
    init: arr => arr.slice(0, -1),
    take: n => arr => arr.slice(0, n),
    drop: n => arr => arr.slice(n),
    
    // Function composition
    pipe: (...fns) => x => fns.reduce((acc, fn) => fn(acc), x),
    compose: (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x),
    
    // Currying
    curry: fn => {
        return function curried(...args) {
            if (args.length >= fn.length) {
                return fn(...args);
            }
            return (...nextArgs) => curried(...args, ...nextArgs);
        };
    },
    
    // Partial application
    partial: (fn, ...args1) => (...args2) => fn(...args1, ...args2),
    
    // Object utilities
    prop: key => obj => obj[key],
    path: keys => obj => keys.reduce((current, key) => current && current[key], obj),
    pick: keys => obj => keys.reduce((acc, key) => {
        if (key in obj) acc[key] = obj[key];
        return acc;
    }, {}),
    omit: keys => obj => Object.keys(obj).reduce((acc, key) => {
        if (!keys.includes(key)) acc[key] = obj[key];
        return acc;
    }, {}),
    
    // Logical combinators
    and: (...predicates) => x => predicates.every(p => p(x)),
    or: (...predicates) => x => predicates.some(p => p(x)),
    not: predicate => x => !predicate(x),
    
    // Advanced utilities
    memoize: fn => {
        const cache = new Map();
        return (...args) => {
            const key = JSON.stringify(args);
            if (cache.has(key)) return cache.get(key);
            const result = fn(...args);
            cache.set(key, result);
            return result;
        };
    },
    
    throttle: (fn, delay) => {
        let lastCall = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return fn(...args);
            }
        };
    },
    
    debounce: (fn, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    }
};

// Test della libreria
console.log("6.1 - Functional Library Test:");
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const processNumbers = FP.pipe(
    FP.take(5),                    // Prendi primi 5
    arr => arr.filter(FP.and(       // Filtra con AND logico
        x => x > 2,                 // Maggiore di 2
        x => x % 2 === 0           // E pari
    )),
    arr => arr.map(x => x * x),    // Quadrato
    arr => arr.reduce((a, b) => a + b, 0) // Somma
);

console.log("Processed numbers:", processNumbers(numbers));

const user = { 
    name: "Alice", 
    age: 30, 
    address: { 
        city: "Milano", 
        country: "Italia" 
    } 
};

console.log("Get name:", FP.prop('name')(user));
console.log("Get city:", FP.path(['address', 'city'])(user));
console.log("Pick fields:", FP.pick(['name', 'age'])(user));
console.log();

// ========================================
// RIEPILOGO
// ========================================

console.log("=== RIEPILOGO HOF AVANZATE ===\n");

const advancedConcepts = [
    "Composizione funzionale sicura e asincrona",
    "Pattern monadici (Maybe, Either)",
    "Operazioni avanzate su array e oggetti",
    "Caching intelligente e ottimizzazione",
    "Pattern asincroni per robustezza",
    "Costruzione di librerie funzionali",
    "Combinatori logici e predicati",
    "Gestione degli errori funzionale"
];

console.log("Concetti avanzati appresi:");
advancedConcepts.forEach((concept, index) => {
    console.log(`${index + 1}. ${concept}`);
});

console.log("\n=== COSA HAI IMPARATO ===");
console.log("✓ Pattern avanzati di composizione funzionale");
console.log("✓ Implementazione di Maybe e Either monad");
console.log("✓ Tecniche avanzate di memoization e caching");
console.log("✓ Pattern asincroni robusti e sicuri");
console.log("✓ Costruzione di librerie utility funzionali");
console.log("✓ Gestione degli errori in stile funzionale");
