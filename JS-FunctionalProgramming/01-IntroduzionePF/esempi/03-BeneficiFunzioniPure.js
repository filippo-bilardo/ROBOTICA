/**
 * ESEMPIO 3: BENEFICI DELLE FUNZIONI PURE
 * Dimostrazione pratica dei vantaggi delle funzioni pure
 * 
 * CONCETTI COPERTI:
 * - Testabilità delle funzioni pure
 * - Composizione di funzioni pure
 * - Performance con memoization
 * - Debugging semplificato
 */

console.log("=== ESEMPIO 3: BENEFICI DELLE FUNZIONI PURE ===\n");

// ========================================
// PARTE 1: TESTABILITÀ
// ========================================

console.log("--- PARTE 1: TESTABILITÀ ---\n");

// Funzione impura - difficile da testare
let userDatabase = [];
function addUserImpure(name, email) {
    const user = {
        id: userDatabase.length + 1,
        name: name,
        email: email,
        createdAt: new Date(),
        isActive: true
    };
    userDatabase.push(user);
    console.log(`User ${name} added to database`);
    return user;
}

// Funzione pura - facile da testare
function createUser(name, email, id, timestamp) {
    return {
        id: id,
        name: name,
        email: email,
        createdAt: timestamp,
        isActive: true
    };
}

function addUserToList(userList, user) {
    return [...userList, user];
}

// Test delle funzioni
console.log("Test funzione impura (problematico):");
// Difficile testare perché dipende da stato globale e side effects
userDatabase = []; // Reset necessario prima di ogni test
const user1 = addUserImpure("Alice", "alice@example.com");
console.log("Database dopo aggiunta:", userDatabase.length);

console.log("\nTest funzione pura (semplice):");
// Facile testare perché è predicibile
const fixedTimestamp = new Date('2024-01-01');
const pureUser = createUser("Bob", "bob@example.com", 1, fixedTimestamp);
const emptyList = [];
const listWithUser = addUserToList(emptyList, pureUser);

console.log("User creato:", pureUser);
console.log("Lista originale:", emptyList);
console.log("Lista con user:", listWithUser);
console.log();

// ========================================
// PARTE 2: COMPOSIZIONE
// ========================================

console.log("--- PARTE 2: COMPOSIZIONE ---\n");

// Funzioni pure che si compongono facilmente
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidName = name => name && name.length >= 2 && name.length <= 50;
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
const generateId = () => Math.random().toString(36).substr(2, 9);

// Composizione di funzioni pure
function createValidUser(name, email) {
    // Validazione
    if (!isValidName(name)) {
        throw new Error("Nome non valido");
    }
    if (!isValidEmail(email)) {
        throw new Error("Email non valida");
    }
    
    // Trasformazione
    const normalizedName = capitalize(name.trim());
    const normalizedEmail = email.toLowerCase().trim();
    
    // Creazione
    return createUser(
        normalizedName,
        normalizedEmail,
        generateId(),
        new Date()
    );
}

// Test composizione
console.log("Test composizione funzioni pure:");
try {
    const validUser = createValidUser("  alice  ", "ALICE@EXAMPLE.COM  ");
    console.log("User valido creato:", validUser);
} catch (error) {
    console.log("Errore:", error.message);
}

try {
    const invalidUser = createValidUser("", "invalid-email");
    console.log("Questo non dovrebbe essere stampato");
} catch (error) {
    console.log("Errore atteso:", error.message);
}
console.log();

// ========================================
// PARTE 3: MEMOIZATION E PERFORMANCE
// ========================================

console.log("--- PARTE 3: MEMOIZATION E PERFORMANCE ---\n");

// Funzione pura costosa (calcolo fattoriale)
function factorial(n) {
    console.log(`Calcolando fattoriale di ${n}`);
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// Memoization per funzioni pure
function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            console.log(`Cache hit per ${key}`);
            return cache.get(key);
        }
        console.log(`Computing ${key}`);
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}

// Funzione memoizzata
const memoizedFactorial = memoize(factorial);

console.log("Test memoization:");
console.log("Primo calcolo di 5!:", memoizedFactorial(5));
console.log("Secondo calcolo di 5!:", memoizedFactorial(5)); // Cache hit
console.log("Calcolo di 6!:", memoizedFactorial(6)); // Userà cache per 5!
console.log();

// ========================================
// PARTE 4: DEBUGGING SEMPLIFICATO
// ========================================

console.log("--- PARTE 4: DEBUGGING SEMPLIFICATO ---\n");

// Funzioni pure sono facili da debuggare
function processOrder(order) {
    return calculateTotal(
        applyDiscount(
            addTax(order)
        )
    );
}

function addTax(order) {
    const taxRate = 0.22; // IVA italiana
    return {
        ...order,
        tax: order.subtotal * taxRate,
        total: order.subtotal * (1 + taxRate)
    };
}

function applyDiscount(order) {
    if (order.total >= 100) {
        const discount = order.total * 0.1; // 10% sconto
        return {
            ...order,
            discount: discount,
            total: order.total - discount
        };
    }
    return { ...order, discount: 0 };
}

function calculateTotal(order) {
    return {
        ...order,
        finalTotal: order.total
    };
}

// Test debugging
const testOrder = {
    items: ["Laptop", "Mouse"],
    subtotal: 120
};

console.log("Debugging step-by-step:");
console.log("1. Ordine originale:", testOrder);

const withTax = addTax(testOrder);
console.log("2. Dopo aggiunta tasse:", withTax);

const withDiscount = applyDiscount(withTax);
console.log("3. Dopo sconto:", withDiscount);

const final = calculateTotal(withDiscount);
console.log("4. Totale finale:", final);
console.log();

// ========================================
// PARTE 5: CONFRONTO PERFORMANCE
// ========================================

console.log("--- PARTE 5: CONFRONTO PERFORMANCE ---\n");

// Funzione impura
let globalCounter = 0;
function processArrayImpure(arr) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        globalCounter++; // Side effect
        if (arr[i] % 2 === 0) {
            result.push(arr[i] * 2);
        }
    }
    return result;
}

// Funzione pura
function processArrayPure(arr) {
    return arr
        .filter(n => n % 2 === 0)
        .map(n => n * 2);
}

// Test performance
const largeArray = Array.from({ length: 10000 }, (_, i) => i + 1);

console.log("Test performance:");

console.time("Funzione impura");
globalCounter = 0;
const result1 = processArrayImpure(largeArray);
console.timeEnd("Funzione impura");
console.log("Risultati uguali:", result1.length);

console.time("Funzione pura");
const result2 = processArrayPure(largeArray);
console.timeEnd("Funzione pura");
console.log("Risultati uguali:", result2.length);

console.log("Counter globale (side effect):", globalCounter);
console.log();

// ========================================
// PARTE 6: VANTAGGI NELLA CONCORRENZA
// ========================================

console.log("--- PARTE 6: VANTAGGI NELLA CONCORRENZA ---\n");

// Simulazione di elaborazione parallela con funzioni pure
function processInParallel(data, processFn) {
    // In un ambiente reale, questo userebbe Web Workers
    // Qui simuliamo con Promise
    const chunks = chunkArray(data, Math.ceil(data.length / 4));
    
    const promises = chunks.map(chunk => 
        new Promise(resolve => {
            // Simula elaborazione asincrona
            setTimeout(() => {
                resolve(chunk.map(processFn));
            }, Math.random() * 100);
        })
    );
    
    return Promise.all(promises).then(results => 
        results.flat()
    );
}

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

// Funzione pura per elaborazione
const expensiveCalculation = x => {
    // Simula calcolo costoso
    let result = x;
    for (let i = 0; i < 1000; i++) {
        result = Math.sqrt(result + i);
    }
    return Math.round(result * 100) / 100;
};

// Test elaborazione parallela
const testData = Array.from({ length: 100 }, (_, i) => i + 1);

console.log("Elaborazione parallela con funzioni pure:");
processInParallel(testData.slice(0, 10), expensiveCalculation)
    .then(results => {
        console.log("Risultati elaborazione parallela:", results.slice(0, 5), "...");
    })
    .catch(error => {
        console.error("Errore:", error);
    });

// ========================================
// RIEPILOGO BENEFICI
// ========================================

console.log("=== RIEPILOGO BENEFICI FUNZIONI PURE ===\n");

const benefits = [
    "🧪 TESTABILITÀ: Test semplici e affidabili senza setup/teardown",
    "🔧 DEBUGGING: Facile tracciare problemi, output predicibile",
    "🚀 PERFORMANCE: Possibilità di memoization e ottimizzazioni",
    "🔄 COMPOSIZIONE: Combinazione elegante di funzionalità",
    "⚡ CONCORRENZA: Sicure per elaborazione parallela",
    "📦 RIUSABILITÀ: Modulari e indipendenti dal contesto",
    "🛡️ AFFIDABILITÀ: Meno bug legati a stati mutabili",
    "📖 LEGGIBILITÀ: Codice più chiaro e comprensibile"
];

console.log("Benefici delle Funzioni Pure:");
benefits.forEach(benefit => console.log(benefit));

console.log("\n=== QUANDO EVITARE FUNZIONI PURE ===");
const limitations = [
    "📝 I/O Operations: File, database, network richiede side effects",
    "🎮 UI Updates: Aggiornamenti DOM richiedono mutazioni",
    "📊 Logging: Tracciamento e debug richiedono side effects",
    "⏰ Time-dependent: Timestamp corrente non è deterministico",
    "🎲 Random: Generazione numeri casuali viola determinismo"
];

limitations.forEach(limitation => console.log(limitation));

console.log("\n💡 STRATEGIA: Isola side effects, mantieni logica pura!");
