/**
 * ESERCIZIO 1: IDENTIFICAZIONE E CREAZIONE DI FUNZIONI PURE
 * Analisi della purezza delle funzioni e tecniche di refactoring
 * 
 * OBIETTIVI:
 * - Identificare funzioni pure e impure
 * - Convertire funzioni impure in pure
 * - Comprendere i benefici delle funzioni pure
 * - Implementare strategie per gestire side effects
 */

console.log("=== ESERCIZIO 1: FUNZIONI PURE ===\n");

// ========================================
// SEZIONE 1: IDENTIFICAZIONE PUREZZA
// ========================================

console.log("--- SEZIONE 1: IDENTIFICAZIONE PUREZZA ---\n");

// Analizza ogni funzione e determina se è pura o impura
// Una funzione è PURA se:
// 1. Dato lo stesso input, restituisce sempre lo stesso output
// 2. Non produce side effects (non modifica stato esterno)

// Funzione 1
function add(a, b) {
    return a + b;
}
// ANALISI: Pura ✓ - Sempre stesso output per stesso input, nessun side effect

// Funzione 2
let globalCounter = 0;
function incrementGlobal() {
    globalCounter++;
    return globalCounter;
}
// ANALISI: Impura ✗ - Modifica stato globale, output diverso a ogni chiamata

// Funzione 3
function multiply(x, y) {
    console.log(`Moltiplicando ${x} per ${y}`); // Side effect!
    return x * y;
}
// ANALISI: Impura ✗ - Ha side effect (console.log)

// Funzione 4
function getCurrentTimestamp() {
    return Date.now();
}
// ANALISI: Impura ✗ - Output diverso a ogni chiamata

// Funzione 5
function calculateTax(price, taxRate) {
    return price * (1 + taxRate);
}
// ANALISI: Pura ✓ - Deterministico, nessun side effect

// Test delle funzioni
console.log("Test funzioni originali:");
console.log("add(5, 3):", add(5, 3));
console.log("add(5, 3):", add(5, 3)); // Sempre uguale

console.log("incrementGlobal():", incrementGlobal());
console.log("incrementGlobal():", incrementGlobal()); // Diverso!

console.log("multiply(4, 5):", multiply(4, 5)); // Ha side effect
console.log();

// ========================================
// SEZIONE 2: REFACTORING VERSO PUREZZA
// ========================================

console.log("--- SEZIONE 2: REFACTORING VERSO PUREZZA ---\n");

// Versioni pure delle funzioni impure

// Versione pura di incrementGlobal
function pureIncrement(currentValue) {
    return currentValue + 1;
}

// Versione pura di multiply (rimuove side effect)
function pureMultiply(x, y) {
    return x * y;
}

// Versione pura di getCurrentTimestamp
function formatTimestamp(timestamp) {
    return new Date(timestamp).toISOString();
}

// Test funzioni pure
console.log("Test funzioni pure:");
let counter = 0;
console.log("pureIncrement(counter):", pureIncrement(counter));
counter = pureIncrement(counter);
console.log("pureIncrement(counter):", pureIncrement(counter));

console.log("pureMultiply(4, 5):", pureMultiply(4, 5));
console.log("pureMultiply(4, 5):", pureMultiply(4, 5)); // Sempre uguale

const fixedTime = Date.now();
console.log("formatTimestamp(fixedTime):", formatTimestamp(fixedTime));
console.log("formatTimestamp(fixedTime):", formatTimestamp(fixedTime)); // Sempre uguale
console.log();

// ========================================
// SEZIONE 3: GESTIONE SIDE EFFECTS
// ========================================

console.log("--- SEZIONE 3: GESTIONE SIDE EFFECTS ---\n");

// Strategia 1: Separazione di concerns
// Separa logica pura da side effects

// Funzione pura per la logica
function calculateDiscount(price, discountPercentage) {
    if (price < 0 || discountPercentage < 0 || discountPercentage > 100) {
        throw new Error("Parametri non validi");
    }
    return price * (1 - discountPercentage / 100);
}

// Funzione impura per side effects (separata)
function logDiscount(originalPrice, discountedPrice, discount) {
    console.log(`Sconto ${discount}%: €${originalPrice} → €${discountedPrice.toFixed(2)}`);
}

// Composizione controllata
function applyDiscountWithLog(price, discount) {
    const discountedPrice = calculateDiscount(price, discount); // Pura
    logDiscount(price, discountedPrice, discount); // Impura, ma isolata
    return discountedPrice;
}

// Test
console.log("Gestione side effects separata:");
const result = applyDiscountWithLog(100, 20);
console.log("Risultato:", result);
console.log();

// ========================================
// SEZIONE 4: FUNZIONI PURE COMPLESSE
// ========================================

console.log("--- SEZIONE 4: FUNZIONI PURE COMPLESSE ---\n");

// Esempio: Sistema di validazione puro

// Funzioni pure per validazione
const validators = {
    isNotEmpty: value => value !== null && value !== undefined && value !== '',
    isString: value => typeof value === 'string',
    isNumber: value => typeof value === 'number' && !isNaN(value),
    isEmail: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    minLength: min => value => value.length >= min,
    maxLength: max => value => value.length <= max,
    inRange: (min, max) => value => value >= min && value <= max
};

// Funzione pura per combinare validatori
function validateField(value, validatorList) {
    return validatorList.reduce((acc, validator) => {
        if (!acc.valid) return acc;
        
        const result = validator(value);
        return {
            valid: result,
            errors: result ? acc.errors : [...acc.errors, validator.name || 'Validation failed']
        };
    }, { valid: true, errors: [] });
}

// Funzione pura per validare oggetto completo
function validateUser(user) {
    const validations = {
        name: validateField(user.name, [
            validators.isNotEmpty,
            validators.isString,
            validators.minLength(2),
            validators.maxLength(50)
        ]),
        email: validateField(user.email, [
            validators.isNotEmpty,
            validators.isString,
            validators.isEmail
        ]),
        age: validateField(user.age, [
            validators.isNotEmpty,
            validators.isNumber,
            validators.inRange(0, 120)
        ])
    };

    const allValid = Object.values(validations).every(v => v.valid);
    const allErrors = Object.entries(validations)
        .filter(([_, validation]) => !validation.valid)
        .reduce((acc, [field, validation]) => ({
            ...acc,
            [field]: validation.errors
        }), {});

    return {
        valid: allValid,
        errors: allErrors
    };
}

// Test validazione pura
console.log("Sistema di validazione puro:");

const validUser = { name: "Alice", email: "alice@example.com", age: 30 };
const invalidUser = { name: "A", email: "invalid-email", age: -5 };

console.log("Utente valido:", validateUser(validUser));
console.log("Utente non valido:", validateUser(invalidUser));
console.log();

// ========================================
// SEZIONE 5: ESERCIZI PRATICI
// ========================================

console.log("--- SEZIONE 5: ESERCIZI PRATICI ---\n");

// ESERCIZIO 5.1: Converti queste funzioni impure in pure

// Funzione impura da convertire
let userDatabase = [
    { id: 1, name: "Alice", active: true },
    { id: 2, name: "Bob", active: false },
    { id: 3, name: "Charlie", active: true }
];

function addUserImpure(name) {
    const newUser = {
        id: userDatabase.length + 1,
        name: name,
        active: true
    };
    userDatabase.push(newUser);
    return newUser;
}

// TODO: Versione pura
function addUserPure(database, name, nextId) {
    const newUser = {
        id: nextId,
        name: name,
        active: true
    };
    return {
        database: [...database, newUser],
        user: newUser
    };
}

// Test
console.log("5.1 - Aggiunta utente:");
console.log("Database originale:", userDatabase);

const result51 = addUserPure(userDatabase, "Diana", 4);
console.log("Database dopo aggiunta (pura):", result51.database);
console.log("Database originale (invariato):", userDatabase);
console.log("Nuovo utente:", result51.user);
console.log();

// ESERCIZIO 5.2: Sistema di caching puro

// Cache come dato immutabile
function createCache() {
    return new Map();
}

// Funzione pura per operazioni cache
function cacheOperation(cache, key, computeFn) {
    if (cache.has(key)) {
        return {
            cache: cache,
            value: cache.get(key),
            hit: true
        };
    }

    const value = computeFn();
    const newCache = new Map(cache);
    newCache.set(key, value);

    return {
        cache: newCache,
        value: value,
        hit: false
    };
}

// Funzione computazionalmente costosa (pura)
function expensiveCalculation(n) {
    console.log(`Calcolo costoso per n=${n}`);
    let result = 0;
    for (let i = 1; i <= n; i++) {
        result += i * i;
    }
    return result;
}

// Test caching puro
console.log("5.2 - Sistema di caching puro:");
let cache = createCache();

const op1 = cacheOperation(cache, 'calc_100', () => expensiveCalculation(100));
cache = op1.cache;
console.log("Prima chiamata:", op1.value, "Cache hit:", op1.hit);

const op2 = cacheOperation(cache, 'calc_100', () => expensiveCalculation(100));
cache = op2.cache;
console.log("Seconda chiamata:", op2.value, "Cache hit:", op2.hit);
console.log();

// ========================================
// SEZIONE 6: TESTING DELLE FUNZIONI PURE
// ========================================

console.log("--- SEZIONE 6: TESTING DELLE FUNZIONI PURE ---\n");

// Le funzioni pure sono molto più facili da testare!

// Semplice framework di testing
function test(description, fn) {
    try {
        fn();
        console.log(`✓ ${description}`);
    } catch (error) {
        console.log(`✗ ${description}: ${error.message}`);
    }
}

function assertEquals(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${message}: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

// Test per funzioni pure
console.log("Test suite per funzioni pure:");

test("add function should return sum", () => {
    assertEquals(add(2, 3), 5, "2 + 3 should equal 5");
    assertEquals(add(-1, 1), 0, "-1 + 1 should equal 0");
    assertEquals(add(0, 0), 0, "0 + 0 should equal 0");
});

test("calculateTax should apply tax correctly", () => {
    assertEquals(calculateTax(100, 0.1), 110, "100 with 10% tax should be 110");
    assertEquals(calculateTax(0, 0.2), 0, "0 with any tax should be 0");
});

test("pureIncrement should increment by 1", () => {
    assertEquals(pureIncrement(5), 6, "5 incremented should be 6");
    assertEquals(pureIncrement(0), 1, "0 incremented should be 1");
    assertEquals(pureIncrement(-1), 0, "-1 incremented should be 0");
});

test("validateUser should validate correctly", () => {
    const valid = validateUser({ name: "Alice", email: "alice@test.com", age: 25 });
    assertEquals(valid.valid, true, "Valid user should pass validation");
    
    const invalid = validateUser({ name: "", email: "bad-email", age: -1 });
    assertEquals(invalid.valid, false, "Invalid user should fail validation");
});

console.log();

// ========================================
// RIEPILOGO E BEST PRACTICES
// ========================================

console.log("=== RIEPILOGO E BEST PRACTICES ===\n");

const bestPractices = [
    "Preferisci sempre funzioni pure quando possibile",
    "Separa la logica pura dai side effects",
    "Usa parametri espliciti invece di variabili globali",
    "Restituisci nuovi oggetti invece di modificare esistenti",
    "Rendi i side effects espliciti e controllabili",
    "Testa le funzioni pure con facilità",
    "Componi funzioni pure per costruire logica complessa",
    "Usa nomi descrittivi che indicano la purezza"
];

console.log("Best Practices per Funzioni Pure:");
bestPractices.forEach((practice, index) => {
    console.log(`${index + 1}. ${practice}`);
});

console.log("\n=== COSA HAI IMPARATO ===");
console.log("✓ Come identificare funzioni pure e impure");
console.log("✓ Tecniche per convertire funzioni impure in pure");
console.log("✓ Strategie per gestire side effects");
console.log("✓ Vantaggi delle funzioni pure per testing");
console.log("✓ Composizione di funzioni pure complesse");
console.log("✓ Best practices per scrivere codice funzionale puro");
