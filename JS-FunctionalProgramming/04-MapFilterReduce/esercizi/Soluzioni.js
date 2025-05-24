/**
 * MODULO 4: MAP, FILTER, REDUCE - SOLUZIONI COMPLETE
 * ==================================================
 * 
 * Questo file contiene tutte le soluzioni commentate degli esercizi
 * del modulo Map, Filter e Reduce, con spiegazioni dettagliate
 * e varianti alternative per ogni problema.
 */

console.log('=== SOLUZIONI COMPLETE MODULO 4 ===\n');

// ================================
// SOLUZIONI ESERCIZIO MAP
// ================================

console.log('SOLUZIONI ESERCIZIO MAP');
console.log('=======================');

/**
 * SOLUZIONE 1.1: Trasformazioni Base
 */
console.log('\n1.1 Trasformazioni Base:');

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Quadrati
const squares = numbers.map(n => n * n);
console.log('Quadrati:', squares);

// Temperature da Celsius a Fahrenheit
const celsiusTemps = [0, 20, 30, 40, 100];
const fahrenheitTemps = celsiusTemps.map(c => (c * 9/5) + 32);
console.log('Temperature F:', fahrenheitTemps);

// Nomi in maiuscolo
const names = ['alice', 'bob', 'charlie'];
const upperNames = names.map(name => name.toUpperCase());
console.log('Nomi maiuscoli:', upperNames);

/**
 * SOLUZIONE 1.2: Trasformazioni Oggetti
 */
console.log('\n1.2 Trasformazioni Oggetti:');

const users = [
    { id: 1, firstName: 'Mario', lastName: 'Rossi', age: 25 },
    { id: 2, firstName: 'Giulia', lastName: 'Bianchi', age: 30 },
    { id: 3, firstName: 'Luca', lastName: 'Verdi', age: 35 }
];

// Nome completo
const usersWithFullName = users.map(user => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`
}));
console.log('Utenti con nome completo:', usersWithFullName);

// Categoria età
const usersWithCategory = users.map(user => ({
    ...user,
    category: user.age < 30 ? 'Giovane' : user.age < 50 ? 'Adulto' : 'Senior'
}));
console.log('Utenti con categoria:', usersWithCategory);

/**
 * SPIEGAZIONE TECNICA:
 * 
 * Map è una funzione pura che:
 * 1. Non modifica l'array originale
 * 2. Restituisce un nuovo array della stessa lunghezza
 * 3. Applica la funzione di trasformazione a ogni elemento
 * 4. Mantiene l'ordine degli elementi
 * 
 * Sintassi: array.map((elemento, indice, arrayCompleto) => nuovoElemento)
 */

// ================================
// SOLUZIONI ESERCIZIO FILTER
// ================================

console.log('\n\nSOLUZIONI ESERCIZIO FILTER');
console.log('===========================');

/**
 * SOLUZIONE 2.1: Filtri Numerici
 */
console.log('\n2.1 Filtri Numerici:');

// Numeri pari
const evenNumbers = numbers.filter(n => n % 2 === 0);
console.log('Numeri pari:', evenNumbers);

// Numeri maggiori di 5
const greaterThanFive = numbers.filter(n => n > 5);
console.log('Maggiori di 5:', greaterThanFive);

// Numeri primi (implementazione semplice)
const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};
const primeNumbers = numbers.filter(isPrime);
console.log('Numeri primi:', primeNumbers);

/**
 * SOLUZIONE 2.2: Filtri Stringhe
 */
console.log('\n2.2 Filtri Stringhe:');

const words = ['javascript', 'python', 'java', 'go', 'rust', 'scala'];

// Parole lunghe
const longWords = words.filter(word => word.length > 4);
console.log('Parole lunghe:', longWords);

// Parole che contengono 'a'
const wordsWithA = words.filter(word => word.includes('a'));
console.log('Parole con "a":', wordsWithA);

// Parole che iniziano con 'j'
const wordsStartingWithJ = words.filter(word => word.startsWith('j'));
console.log('Parole che iniziano con "j":', wordsStartingWithJ);

/**
 * SOLUZIONE 2.3: Filtri Oggetti Complessi
 */
console.log('\n2.3 Filtri Oggetti Complessi:');

const products = [
    { id: 1, name: 'Laptop', price: 1200, category: 'Electronics', inStock: true, rating: 4.5 },
    { id: 2, name: 'Book', price: 20, category: 'Education', inStock: true, rating: 4.2 },
    { id: 3, name: 'Phone', price: 800, category: 'Electronics', inStock: false, rating: 4.7 },
    { id: 4, name: 'Desk', price: 300, category: 'Furniture', inStock: true, rating: 4.0 }
];

// Prodotti disponibili
const availableProducts = products.filter(product => product.inStock);
console.log('Prodotti disponibili:', availableProducts);

// Prodotti costosi ed elettronici
const expensiveElectronics = products.filter(product => 
    product.category === 'Electronics' && product.price > 500
);
console.log('Elettronica costosa:', expensiveElectronics);

// Prodotti con rating alto
const highRatedProducts = products.filter(product => product.rating >= 4.5);
console.log('Prodotti rating alto:', highRatedProducts);

/**
 * SPIEGAZIONE TECNICA:
 * 
 * Filter è una funzione pura che:
 * 1. Non modifica l'array originale
 * 2. Restituisce un nuovo array (potenzialmente più corto)
 * 3. Include solo elementi che soddisfano la condizione
 * 4. Mantiene l'ordine originale degli elementi
 * 
 * Sintassi: array.filter((elemento, indice, arrayCompleto) => boolean)
 */

// ================================
// SOLUZIONI ESERCIZIO REDUCE
// ================================

console.log('\n\nSOLUZIONI ESERCIZIO REDUCE');
console.log('===========================');

/**
 * SOLUZIONE 3.1: Operazioni Matematiche
 */
console.log('\n3.1 Operazioni Matematiche:');

// Somma
const sum = numbers.reduce((acc, curr) => acc + curr, 0);
console.log('Somma:', sum);

// Prodotto
const product = numbers.reduce((acc, curr) => acc * curr, 1);
console.log('Prodotto:', product);

// Massimo
const max = numbers.reduce((acc, curr) => Math.max(acc, curr), -Infinity);
console.log('Massimo:', max);

// Minimo
const min = numbers.reduce((acc, curr) => Math.min(acc, curr), Infinity);
console.log('Minimo:', min);

/**
 * SOLUZIONE 3.2: Aggregazioni Complesse
 */
console.log('\n3.2 Aggregazioni Complesse:');

const transactions = [
    { id: 1, amount: 100, type: 'income', category: 'salary' },
    { id: 2, amount: 50, type: 'expense', category: 'food' },
    { id: 3, amount: 200, type: 'income', category: 'freelance' },
    { id: 4, amount: 75, type: 'expense', category: 'transport' },
    { id: 5, amount: 30, type: 'expense', category: 'food' }
];

// Bilancio totale
const balance = transactions.reduce((acc, transaction) => {
    return transaction.type === 'income' 
        ? acc + transaction.amount 
        : acc - transaction.amount;
}, 0);
console.log('Bilancio:', balance);

// Spese per categoria
const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + transaction.amount;
        return acc;
    }, {});
console.log('Spese per categoria:', expensesByCategory);

// Statistiche complete
const stats = transactions.reduce((acc, transaction) => {
    const { amount, type } = transaction;
    
    acc.total += amount;
    acc.count += 1;
    
    if (type === 'income') {
        acc.totalIncome += amount;
        acc.incomeCount += 1;
    } else {
        acc.totalExpense += amount;
        acc.expenseCount += 1;
    }
    
    acc.average = acc.total / acc.count;
    acc.netBalance = acc.totalIncome - acc.totalExpense;
    
    return acc;
}, {
    total: 0,
    count: 0,
    totalIncome: 0,
    totalExpense: 0,
    incomeCount: 0,
    expenseCount: 0,
    average: 0,
    netBalance: 0
});

console.log('Statistiche complete:', stats);

/**
 * SOLUZIONE 3.3: Trasformazioni Struttura Dati
 */
console.log('\n3.3 Trasformazioni Struttura Dati:');

const students = [
    { id: 1, name: 'Anna', course: 'Math', grade: 85 },
    { id: 2, name: 'Bob', course: 'Math', grade: 92 },
    { id: 3, name: 'Anna', course: 'Physics', grade: 78 },
    { id: 4, name: 'Charlie', course: 'Math', grade: 88 },
    { id: 5, name: 'Bob', course: 'Physics', grade: 95 }
];

// Array a oggetto (indicizzato per ID)
const studentsById = students.reduce((acc, student) => {
    acc[student.id] = student;
    return acc;
}, {});
console.log('Studenti per ID:', studentsById);

// Raggruppamento per studente
const gradesByStudent = students.reduce((acc, record) => {
    const { name, course, grade } = record;
    
    if (!acc[name]) {
        acc[name] = { courses: [], totalGrade: 0, count: 0 };
    }
    
    acc[name].courses.push({ course, grade });
    acc[name].totalGrade += grade;
    acc[name].count += 1;
    acc[name].average = acc[name].totalGrade / acc[name].count;
    
    return acc;
}, {});
console.log('Voti per studente:', gradesByStudent);

// Pivot table (corso x studente)
const pivotTable = students.reduce((acc, record) => {
    const { name, course, grade } = record;
    
    if (!acc[course]) {
        acc[course] = {};
    }
    
    acc[course][name] = grade;
    
    return acc;
}, {});
console.log('Pivot table:', pivotTable);

/**
 * SPIEGAZIONE TECNICA:
 * 
 * Reduce è la funzione più potente e versatile:
 * 1. Può implementare sia map che filter
 * 2. Accumula valori attraverso l'array
 * 3. Può cambiare il tipo di dato di ritorno
 * 4. Esegue da sinistra a destra (reduceRight fa l'opposto)
 * 
 * Sintassi: array.reduce((accumulatore, elemento, indice, array) => nuovoAccumulatore, valoreIniziale)
 */

// ================================
// SOLUZIONI ESERCIZI COMBINATI
// ================================

console.log('\n\nSOLUZIONI ESERCIZI COMBINATI');
console.log('=============================');

/**
 * SOLUZIONE 4.1: Pipeline di Elaborazione Dati
 */
console.log('\n4.1 Pipeline di Elaborazione Dati:');

const orders = [
    { id: 1, customerId: 101, items: [{ product: 'Laptop', price: 1200, quantity: 1 }], date: '2024-01-15' },
    { id: 2, customerId: 102, items: [{ product: 'Mouse', price: 25, quantity: 2 }], date: '2024-01-16' },
    { id: 3, customerId: 101, items: [{ product: 'Keyboard', price: 80, quantity: 1 }], date: '2024-01-17' }
];

// Pipeline: Calcola revenue per cliente con ordini > 50€
const customerRevenue = orders
    .map(order => ({
        ...order,
        total: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }))
    .filter(order => order.total > 50)
    .reduce((acc, order) => {
        const customerId = order.customerId;
        acc[customerId] = (acc[customerId] || 0) + order.total;
        return acc;
    }, {});

console.log('Revenue per cliente (ordini > 50€):', customerRevenue);

/**
 * SOLUZIONE 4.2: Analisi Performance Optimized
 */
console.log('\n4.2 Analisi Performance (Single Pass):');

// Calcolo tutto in una singola iterazione
const singlePassAnalysis = orders.reduce((analysis, order) => {
    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Accumula statistiche generali
    analysis.totalOrders += 1;
    analysis.totalRevenue += total;
    
    // Traccia cliente
    if (!analysis.customers[order.customerId]) {
        analysis.customers[order.customerId] = { orders: 0, revenue: 0 };
    }
    analysis.customers[order.customerId].orders += 1;
    analysis.customers[order.customerId].revenue += total;
    
    // Traccia prodotti
    order.items.forEach(item => {
        if (!analysis.products[item.product]) {
            analysis.products[item.product] = { quantity: 0, revenue: 0 };
        }
        analysis.products[item.product].quantity += item.quantity;
        analysis.products[item.product].revenue += item.price * item.quantity;
    });
    
    return analysis;
}, {
    totalOrders: 0,
    totalRevenue: 0,
    customers: {},
    products: {}
});

// Calcola medie
singlePassAnalysis.averageOrderValue = singlePassAnalysis.totalRevenue / singlePassAnalysis.totalOrders;

console.log('Analisi completa (single pass):', singlePassAnalysis);

// ================================
// IMPLEMENTAZIONI ALTERNATIVE
// ================================

console.log('\n\nIMPLEMENTAZIONI ALTERNATIVE');
console.log('============================');

/**
 * Implementazione Map usando Reduce
 */
console.log('\n5.1 Map implementato con Reduce:');

const mapWithReduce = (array, transformFn) => {
    return array.reduce((acc, item, index) => {
        acc.push(transformFn(item, index, array));
        return acc;
    }, []);
};

const squaresWithReduce = mapWithReduce([1, 2, 3, 4, 5], x => x * x);
console.log('Quadrati (map con reduce):', squaresWithReduce);

/**
 * Implementazione Filter usando Reduce
 */
console.log('\n5.2 Filter implementato con Reduce:');

const filterWithReduce = (array, predicateFn) => {
    return array.reduce((acc, item, index) => {
        if (predicateFn(item, index, array)) {
            acc.push(item);
        }
        return acc;
    }, []);
};

const evensWithReduce = filterWithReduce([1, 2, 3, 4, 5, 6], x => x % 2 === 0);
console.log('Pari (filter con reduce):', evensWithReduce);

/**
 * Implementazione Reduce using Recursion
 */
console.log('\n5.3 Reduce implementato con Ricorsione:');

const reduceWithRecursion = (array, reducerFn, initialValue, index = 0) => {
    if (index >= array.length) {
        return initialValue;
    }
    
    const newAccumulator = reducerFn(initialValue, array[index], index, array);
    return reduceWithRecursion(array, reducerFn, newAccumulator, index + 1);
};

const sumWithRecursion = reduceWithRecursion([1, 2, 3, 4, 5], (acc, curr) => acc + curr, 0);
console.log('Somma (reduce ricorsivo):', sumWithRecursion);

// ================================
// PATTERN AVANZATI
// ================================

console.log('\n\nPATTERN AVANZATI');
console.log('================');

/**
 * Pattern: Transducer (composizione di trasformazioni)
 */
console.log('\n6.1 Pattern Transducer:');

const transduce = (transducer, reducer, initialValue, collection) => {
    const transformedReducer = transducer(reducer);
    return collection.reduce(transformedReducer, initialValue);
};

const mapping = (transformFn) => (reducer) => (acc, item) => {
    return reducer(acc, transformFn(item));
};

const filtering = (predicateFn) => (reducer) => (acc, item) => {
    return predicateFn(item) ? reducer(acc, item) : acc;
};

const compose = (...functions) => (x) => functions.reduceRight((acc, fn) => fn(acc), x);

// Trasformazione composta: mappa quadrati, filtra pari, somma
const composedTransducer = compose(
    mapping(x => x * x),
    filtering(x => x % 2 === 0)
);

const result = transduce(
    composedTransducer,
    (acc, item) => acc + item,
    0,
    [1, 2, 3, 4, 5]
);

console.log('Risultato transducer:', result); // (2² + 4²) = 4 + 16 = 20

/**
 * Pattern: Lazy Evaluation con Generatori
 */
console.log('\n6.2 Pattern Lazy Evaluation:');

function* lazyMap(iterable, mapFn) {
    for (const item of iterable) {
        yield mapFn(item);
    }
}

function* lazyFilter(iterable, predicateFn) {
    for (const item of iterable) {
        if (predicateFn(item)) {
            yield item;
        }
    }
}

function lazyReduce(iterable, reducerFn, initialValue) {
    let accumulator = initialValue;
    for (const item of iterable) {
        accumulator = reducerFn(accumulator, item);
    }
    return accumulator;
}

// Lazy pipeline
const lazyResult = lazyReduce(
    lazyFilter(
        lazyMap([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], x => x * x),
        x => x > 20
    ),
    (acc, curr) => acc + curr,
    0
);

console.log('Risultato lazy:', lazyResult);

/**
 * Pattern: Memoization per Performance
 */
console.log('\n6.3 Pattern Memoization:');

const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

// Funzione costosa (simulata)
const expensiveCalculation = (n) => {
    console.log(`Calcolo per ${n}...`);
    return n * n * n;
};

const memoizedCalculation = memoize(expensiveCalculation);

// Test memoization
const testNumbers = [1, 2, 3, 2, 1, 4, 3];
const memoizedResults = testNumbers.map(memoizedCalculation);
console.log('Risultati memoized:', memoizedResults);

console.log('\n=== FINE SOLUZIONI COMPLETE ===');

/**
 * RIEPILOGO CONCETTI CHIAVE:
 * 
 * 1. MAP - Trasforma ogni elemento mantenendo la lunghezza
 * 2. FILTER - Seleziona elementi che soddisfano una condizione
 * 3. REDUCE - Accumula valori in un singolo risultato
 * 
 * BEST PRACTICES:
 * - Usa funzioni pure (no side effects)
 * - Preferisci immutabilità
 * - Componi operazioni per leggibilità
 * - Considera performance per grandi dataset
 * - Usa pattern funzionali avanzati quando appropriato
 * 
 * PATTERN COMUNI:
 * - Pipeline: map → filter → reduce
 * - Aggregazione: reduce con oggetti
 * - Trasformazione: map con destructuring
 * - Validazione: filter con predicati complessi
 * - Ottimizzazione: single-pass reduce
 */
