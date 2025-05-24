/**
 * ESERCIZIO 1: HIGHER-ORDER FUNCTIONS - CONCETTI BASE
 * Comprensione e implementazione di funzioni di ordine superiore
 * 
 * OBIETTIVI:
 * - Comprendere cosa sono le Higher-Order Functions (HOF)
 * - Implementare HOF personalizzate
 * - Utilizzare HOF per astrarre pattern comuni
 * - Combinare HOF per soluzioni eleganti
 */

console.log("=== ESERCIZIO 1: HIGHER-ORDER FUNCTIONS BASE ===\n");

// ========================================
// SEZIONE 1: DEFINIZIONE E ESEMPI BASE
// ========================================

console.log("--- SEZIONE 1: DEFINIZIONE E ESEMPI BASE ---\n");

// Una Higher-Order Function è una funzione che:
// 1. Accetta altre funzioni come parametri, E/O
// 2. Restituisce una funzione

// Esempio 1: Funzione che accetta altra funzione
function applyOperation(x, y, operation) {
    return operation(x, y);
}

const add = (a, b) => a + b;
const multiply = (a, b) => a * b;
const power = (a, b) => Math.pow(a, b);

console.log("1.1 - Funzione che accetta altre funzioni:");
console.log("5 + 3 =", applyOperation(5, 3, add));
console.log("5 * 3 =", applyOperation(5, 3, multiply));
console.log("5 ^ 3 =", applyOperation(5, 3, power));
console.log();

// Esempio 2: Funzione che restituisce altra funzione
function createMultiplier(factor) {
    return function(number) {
        return number * factor;
    };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);
const tenTimes = createMultiplier(10);

console.log("1.2 - Funzione che restituisce altre funzioni:");
console.log("double(5) =", double(5));
console.log("triple(4) =", triple(4));
console.log("tenTimes(7) =", tenTimes(7));
console.log();

// Esempio 3: Funzione che fa entrambe le cose
function createConditionalProcessor(condition, processor) {
    return function(data) {
        return data.map(item => condition(item) ? processor(item) : item);
    };
}

const isEven = n => n % 2 === 0;
const square = n => n * n;

const squareEvens = createConditionalProcessor(isEven, square);

console.log("1.3 - Funzione che fa entrambe:");
console.log("Array originale:", [1, 2, 3, 4, 5, 6]);
console.log("Square evens:", squareEvens([1, 2, 3, 4, 5, 6]));
console.log();

// ========================================
// SEZIONE 2: HOF NATIVE DI JAVASCRIPT
// ========================================

console.log("--- SEZIONE 2: HOF NATIVE DI JAVASCRIPT ---\n");

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map: trasforma ogni elemento
const doubled = numbers.map(n => n * 2);
console.log("2.1 - map (double):", doubled);

// filter: filtra elementi
const evens = numbers.filter(n => n % 2 === 0);
console.log("2.2 - filter (evens):", evens);

// reduce: riduce array a singolo valore
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("2.3 - reduce (sum):", sum);

// find: trova primo elemento che soddisfa condizione
const firstEven = numbers.find(n => n % 2 === 0);
console.log("2.4 - find (first even):", firstEven);

// some: verifica se almeno un elemento soddisfa condizione
const hasEven = numbers.some(n => n % 2 === 0);
console.log("2.5 - some (has even):", hasEven);

// every: verifica se tutti gli elementi soddisfano condizione
const allPositive = numbers.every(n => n > 0);
console.log("2.6 - every (all positive):", allPositive);

// sort: ordina array (attenzione: muta l'array!)
const sortedCopy = [...numbers].sort((a, b) => b - a); // Decrescente
console.log("2.7 - sort (descending):", sortedCopy);
console.log();

// ========================================
// SEZIONE 3: IMPLEMENTAZIONE HOF PERSONALIZZATE
// ========================================

console.log("--- SEZIONE 3: IMPLEMENTAZIONE HOF PERSONALIZZATE ---\n");

// 3.1: Implementa map personalizzata
function myMap(array, transform) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
        result.push(transform(array[i], i, array));
    }
    return result;
}

// 3.2: Implementa filter personalizzata
function myFilter(array, predicate) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
        if (predicate(array[i], i, array)) {
            result.push(array[i]);
        }
    }
    return result;
}

// 3.3: Implementa reduce personalizzata
function myReduce(array, reducer, initialValue) {
    let accumulator = initialValue;
    let startIndex = 0;
    
    // Se non c'è valore iniziale, usa il primo elemento
    if (accumulator === undefined) {
        accumulator = array[0];
        startIndex = 1;
    }
    
    for (let i = startIndex; i < array.length; i++) {
        accumulator = reducer(accumulator, array[i], i, array);
    }
    
    return accumulator;
}

// Test implementazioni personalizzate
console.log("3.1 - Test implementazioni personalizzate:");
const testArray = [1, 2, 3, 4, 5];

console.log("myMap(x2):", myMap(testArray, x => x * 2));
console.log("myFilter(evens):", myFilter(testArray, x => x % 2 === 0));
console.log("myReduce(sum):", myReduce(testArray, (acc, x) => acc + x, 0));
console.log();

// 3.4: HOF più avanzate
function forEach(array, callback) {
    for (let i = 0; i < array.length; i++) {
        callback(array[i], i, array);
    }
}

function times(n, callback) {
    const results = [];
    for (let i = 0; i < n; i++) {
        results.push(callback(i));
    }
    return results;
}

function until(condition, action) {
    const results = [];
    let counter = 0;
    while (!condition(counter)) {
        results.push(action(counter));
        counter++;
    }
    return results;
}

console.log("3.4 - HOF avanzate:");
console.log("times(5, x => x^2):", times(5, x => x * x));
console.log("until(x > 3, x => x*2):", until(x => x > 3, x => x * 2));
console.log();

// ========================================
// SEZIONE 4: COMPOSIZIONE DI HOF
// ========================================

console.log("--- SEZIONE 4: COMPOSIZIONE DI HOF ---\n");

// Esempio: Pipeline di trasformazioni
const data = [
    { name: "Alice", age: 30, department: "Engineering", salary: 75000 },
    { name: "Bob", age: 25, department: "Marketing", salary: 55000 },
    { name: "Charlie", age: 35, department: "Engineering", salary: 85000 },
    { name: "Diana", age: 28, department: "Sales", salary: 60000 },
    { name: "Eve", age: 32, department: "Engineering", salary: 80000 }
];

// Pipeline: Trova ingegneri senior con stipendio > 70k e calcola media stipendi
const seniorEngineersAvgSalary = data
    .filter(person => person.department === "Engineering")
    .filter(person => person.age >= 30)
    .filter(person => person.salary > 70000)
    .map(person => person.salary)
    .reduce((sum, salary, _, array) => sum + salary / array.length, 0);

console.log("4.1 - Pipeline HOF:");
console.log("Media stipendi ingegneri senior (30+, >70k):", seniorEngineersAvgSalary);

// Versione più modulare
const isEngineer = person => person.department === "Engineering";
const isSenior = person => person.age >= 30;
const hasHighSalary = person => person.salary > 70000;
const getSalary = person => person.salary;
const average = numbers => numbers.reduce((sum, n) => sum + n, 0) / numbers.length;

const seniorEngineersAvgSalary2 = average(
    data
        .filter(isEngineer)
        .filter(isSenior)
        .filter(hasHighSalary)
        .map(getSalary)
);

console.log("Versione modulare:", seniorEngineersAvgSalary2);
console.log();

// ========================================
// SEZIONE 5: UTILITY HOF AVANZATE
// ========================================

console.log("--- SEZIONE 5: UTILITY HOF AVANZATE ---\n");

// 5.1: Combinatori di predicati
function and(...predicates) {
    return item => predicates.every(predicate => predicate(item));
}

function or(...predicates) {
    return item => predicates.some(predicate => predicate(item));
}

function not(predicate) {
    return item => !predicate(item);
}

// Test combinatori
const isYoung = person => person.age < 30;
const isHighEarner = person => person.salary > 70000;

const youngOrHighEarner = or(isYoung, isHighEarner);
const seniorAndHighEarner = and(isSenior, isHighEarner);
const notEngineer = not(isEngineer);

console.log("5.1 - Combinatori di predicati:");
console.log("Young or high earner:", data.filter(youngOrHighEarner).map(p => p.name));
console.log("Senior and high earner:", data.filter(seniorAndHighEarner).map(p => p.name));
console.log("Not engineer:", data.filter(notEngineer).map(p => p.name));
console.log();

// 5.2: Funzioni di raggruppamento
function groupBy(array, keySelector) {
    return array.reduce((groups, item) => {
        const key = keySelector(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

function countBy(array, keySelector) {
    return array.reduce((counts, item) => {
        const key = keySelector(item);
        counts[key] = (counts[key] || 0) + 1;
        return counts;
    }, {});
}

console.log("5.2 - Funzioni di raggruppamento:");
console.log("Group by department:", groupBy(data, person => person.department));
console.log("Count by department:", countBy(data, person => person.department));
console.log();

// 5.3: Funzioni di trasformazione
function pluck(array, property) {
    return array.map(item => item[property]);
}

function sortBy(array, keySelector, ascending = true) {
    return [...array].sort((a, b) => {
        const aKey = keySelector(a);
        const bKey = keySelector(b);
        const comparison = aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
        return ascending ? comparison : -comparison;
    });
}

function uniqueBy(array, keySelector) {
    const seen = new Set();
    return array.filter(item => {
        const key = keySelector(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

console.log("5.3 - Funzioni di trasformazione:");
console.log("Names:", pluck(data, 'name'));
console.log("Sorted by salary:", sortBy(data, person => person.salary).map(p => `${p.name}: ${p.salary}`));
console.log("Unique departments:", uniqueBy(data, person => person.department).map(p => p.department));
console.log();

// ========================================
// SEZIONE 6: PATTERN FUNZIONALI CON HOF
// ========================================

console.log("--- SEZIONE 6: PATTERN FUNZIONALI CON HOF ---\n");

// 6.1: Memoization
function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            console.log(`Cache hit for ${key}`);
            return cache.get(key);
        }
        console.log(`Computing ${key}`);
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}

// Fibonacci con memoization
const fibonacci = memoize(function(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log("6.1 - Memoization:");
console.log("fib(10):", fibonacci(10));
console.log("fib(10) again:", fibonacci(10)); // Cache hit
console.log();

// 6.2: Throttle e Debounce
function throttle(fn, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return fn(...args);
        }
    };
}

function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// 6.3: Retry pattern
function retry(fn, maxAttempts, delay = 1000) {
    return async function(...args) {
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn(...args);
            } catch (error) {
                lastError = error;
                console.log(`Attempt ${attempt} failed:`, error.message);
                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    };
}

// 6.4: Pipeline function
function pipe(...functions) {
    return function(value) {
        return functions.reduce((acc, fn) => fn(acc), value);
    };
}

function compose(...functions) {
    return function(value) {
        return functions.reduceRight((acc, fn) => fn(acc), value);
    };
}

// Test pipeline
const processNumber = pipe(
    x => x * 2,          // Raddoppia
    x => x + 10,         // Aggiungi 10
    x => Math.sqrt(x),   // Radice quadrata
    x => Math.round(x)   // Arrotonda
);

console.log("6.4 - Pipeline:");
console.log("processNumber(5):", processNumber(5)); // (5*2+10)^0.5 ≈ 4.47 → 4
console.log();

// ========================================
// SEZIONE 7: ESERCIZI PRATICI
// ========================================

console.log("--- SEZIONE 7: ESERCIZI PRATICI ---\n");

// ESERCIZIO 7.1: Implementa una funzione curry
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn(...args);
        }
        return function(...nextArgs) {
            return curried(...args, ...nextArgs);
        };
    };
}

// Test curry
const curriedAdd = curry((a, b, c) => a + b + c);
console.log("7.1 - Curry:");
console.log("curriedAdd(1)(2)(3):", curriedAdd(1)(2)(3));
console.log("curriedAdd(1, 2)(3):", curriedAdd(1, 2)(3));
console.log();

// ESERCIZIO 7.2: Implementa una funzione che applica HOF in parallelo
function parallel(array, asyncFn) {
    return Promise.all(array.map(asyncFn));
}

function series(array, asyncFn) {
    return array.reduce(async (acc, item) => {
        const results = await acc;
        const result = await asyncFn(item);
        return [...results, result];
    }, Promise.resolve([]));
}

// ESERCIZIO 7.3: Implementa una cache LRU usando HOF
function createLRUCache(maxSize) {
    const cache = new Map();
    
    return function memoizeWithLRU(fn) {
        return function(...args) {
            const key = JSON.stringify(args);
            
            if (cache.has(key)) {
                // Sposta in fondo (più recente)
                const value = cache.get(key);
                cache.delete(key);
                cache.set(key, value);
                return value;
            }
            
            // Calcola nuovo valore
            const result = fn(...args);
            
            // Rimuovi il meno recente se necessario
            if (cache.size >= maxSize) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }
            
            cache.set(key, result);
            return result;
        };
    };
}

const lruMemoize = createLRUCache(3);
const expensiveFunction = lruMemoize((n) => {
    console.log(`Computing expensive operation for ${n}`);
    return n * n * n;
});

console.log("7.3 - LRU Cache:");
console.log(expensiveFunction(1)); // Computa
console.log(expensiveFunction(2)); // Computa
console.log(expensiveFunction(3)); // Computa
console.log(expensiveFunction(1)); // Cache hit
console.log(expensiveFunction(4)); // Computa, rimuove 2
console.log(expensiveFunction(2)); // Computa di nuovo (era stato rimosso)
console.log();

// ========================================
// RIEPILOGO
// ========================================

console.log("=== RIEPILOGO HIGHER-ORDER FUNCTIONS ===\n");

const hofBenefits = [
    "Astrazione di pattern comuni",
    "Codice più modulare e riusabile",
    "Composizione elegante di funzionalità",
    "Separazione di concerns",
    "Testing semplificato",
    "Codice più espressivo e leggibile"
];

console.log("Benefici delle Higher-Order Functions:");
hofBenefits.forEach((benefit, index) => {
    console.log(`${index + 1}. ${benefit}`);
});

console.log("\n=== COSA HAI IMPARATO ===");
console.log("✓ Definizione e caratteristiche delle HOF");
console.log("✓ Implementazione di HOF personalizzate");
console.log("✓ Composizione e combinazione di HOF");
console.log("✓ Pattern funzionali avanzati");
console.log("✓ Utility functions per problemi comuni");
console.log("✓ Tecniche di ottimizzazione (memoization, LRU)");
