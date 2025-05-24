/**
 * ESERCIZI LODASH/FP
 * 
 * Esercizi pratici per padroneggiare Lodash con programmazione funzionale.
 * Ogni esercizio include la descrizione, dati di test e soluzioni progressive.
 */

const _ = require('lodash/fp');

console.log('=== ESERCIZI LODASH/FP ===\n');

// ==============================================
// ESERCIZIO 1: DATA FILTERING E TRANSFORMATION
// ==============================================

console.log('--- ESERCIZIO 1: Data Filtering ---');

const employees = [
    { id: 1, name: 'Alice Johnson', department: 'Engineering', salary: 75000, yearsExperience: 5, skills: ['JavaScript', 'React', 'Node.js'] },
    { id: 2, name: 'Bob Smith', department: 'Marketing', salary: 65000, yearsExperience: 3, skills: ['SEO', 'Content Marketing', 'Analytics'] },
    { id: 3, name: 'Charlie Brown', department: 'Engineering', salary: 85000, yearsExperience: 7, skills: ['Python', 'Django', 'PostgreSQL'] },
    { id: 4, name: 'Diana Prince', department: 'Sales', salary: 70000, yearsExperience: 4, skills: ['CRM', 'Negotiation', 'Presentation'] },
    { id: 5, name: 'Eve Wilson', department: 'Engineering', salary: 90000, yearsExperience: 8, skills: ['Java', 'Spring', 'Microservices'] },
    { id: 6, name: 'Frank Miller', department: 'Design', salary: 68000, yearsExperience: 6, skills: ['Figma', 'Photoshop', 'UX Research'] }
];

// 1.1 Trova tutti gli ingegneri con più di 5 anni di esperienza
const seniorEngineers = _.flow([
    _.filter({ department: 'Engineering' }),
    _.filter(emp => emp.yearsExperience > 5)
]);

console.log('Senior Engineers:', seniorEngineers(employees));

// 1.2 Ottieni i nomi di tutti i dipendenti del marketing ordinati alfabeticamente
const marketingNames = _.flow([
    _.filter({ department: 'Marketing' }),
    _.map('name'),
    _.sortBy(_.identity)
]);

console.log('Marketing Names:', marketingNames(employees));

// 1.3 Calcola lo stipendio medio per dipartimento
const avgSalaryByDept = _.flow([
    _.groupBy('department'),
    _.mapValues(_.flow([
        _.map('salary'),
        _.mean,
        _.round
    ]))
]);

console.log('Average Salary by Department:', avgSalaryByDept(employees));

// 1.4 Trova il dipendente con più esperienza in ogni dipartimento
const mostExperiencedByDept = _.flow([
    _.groupBy('department'),
    _.mapValues(_.maxBy('yearsExperience'))
]);

console.log('Most Experienced by Department:', mostExperiencedByDept(employees));

// 1.5 Crea un array di tutti i skill unici ordinati
const allSkills = _.flow([
    _.flatMap('skills'),
    _.uniq,
    _.sortBy(_.identity)
]);

console.log('All Skills:', allSkills(employees));
// SOLUZIONE:
const seniorEngineers = _.pipe([
    _.filter({ department: 'Engineering' }),
    _.filter(emp => emp.yearsExperience > 5)
]);

console.log('1.1 Senior Engineers:', seniorEngineers(employees));

// 1.2 Ottieni i nomi di tutti i dipendenti ordinati per stipendio decrescente
// TODO: Implementa usando _.pipe, _.sortBy, _.reverse, _.map
const employeesByReverseSalary = _.pipe([
    // Il tuo codice qui
    _.sortBy('salary'),
    _.reverse,
    _.map('name')
]);

console.log('1.2 Employees by salary:', employeesByReverseSalary(employees));

// 1.3 Calcola lo stipendio medio per dipartimento
// TODO: Implementa usando _.groupBy, _.mapValues, _.map, _.mean
const averageSalaryByDepartment = _.pipe([
    // Il tuo codice qui
    _.groupBy('department'),
    _.mapValues(_.pipe([
        _.map('salary'),
        _.mean
    ]))
]);

console.log('1.3 Average salary by department:', averageSalaryByDepartment(employees));

// ==============================================
// ESERCIZIO 2: ADVANCED COMPOSITION
// ==============================================

console.log('\n--- ESERCIZIO 2: Advanced Composition ---');

const orders = [
    { id: 1, customerId: 101, items: [{ productId: 'A1', price: 25.99, quantity: 2 }, { productId: 'B2', price: 15.50, quantity: 1 }], status: 'completed', date: '2024-01-15' },
    { id: 2, customerId: 102, items: [{ productId: 'C3', price: 89.99, quantity: 1 }], status: 'pending', date: '2024-01-16' },
    { id: 3, customerId: 101, items: [{ productId: 'A1', price: 25.99, quantity: 1 }, { productId: 'D4', price: 45.00, quantity: 2 }], status: 'completed', date: '2024-01-17' },
    { id: 4, customerId: 103, items: [{ productId: 'B2', price: 15.50, quantity: 3 }], status: 'cancelled', date: '2024-01-18' }
];

// 2.1 Calcola il totale di ogni ordine aggiungendo una proprietà 'total'
// TODO: Implementa usando _.map e _.sumBy per calcolare il totale degli items
const addOrderTotals = _.map(order => ({
    ...order,
    total: _.pipe([
        _.get('items'),
        _.sumBy(item => item.price * item.quantity)
    ])(order)
}));

console.log('2.1 Orders with totals:', addOrderTotals(orders));

// 2.2 Trova il cliente con il maggior valore di ordini completati
// TODO: Implementa una pipeline complessa
const topCustomerByCompletedOrders = _.pipe([
    // Filtra ordini completati
    _.filter({ status: 'completed' }),
    // Aggiungi i totali
    addOrderTotals,
    // Raggruppa per cliente
    _.groupBy('customerId'),
    // Calcola il totale per cliente
    _.mapValues(_.pipe([
        _.sumBy('total')
    ])),
    // Converti in array di [customerId, total]
    _.toPairs,
    // Trova il massimo
    _.maxBy(1),
    // Estrai solo il customerId
    _.head
]);

console.log('2.2 Top customer:', topCustomerByCompletedOrders(orders));

// 2.3 Crea un report delle vendite per prodotto
// TODO: Implementa usando operations complesse
const productSalesReport = _.pipe([
    // Estrai tutti gli items da tutti gli ordini
    _.flatMap('items'),
    // Raggruppa per productId
    _.groupBy('productId'),
    // Calcola statistics per prodotto
    _.mapValues(items => ({
        totalQuantity: _.sumBy('quantity', items),
        totalRevenue: _.sumBy(item => item.price * item.quantity, items),
        averagePrice: _.meanBy('price', items),
        ordersCount: items.length
    }))
]);

console.log('2.3 Product sales report:', productSalesReport(orders));

// ==============================================
// ESERCIZIO 3: UTILITY FUNCTIONS
// ==============================================

console.log('\n--- ESERCIZIO 3: Utility Functions ---');

// 3.1 Crea una funzione di validazione usando _.allPass
// TODO: Implementa validatori per un oggetto user
const isValidUser = _.allPass([
    _.has('email'),
    _.has('name'),
    _.compose(_.gte(_.__, 18), _.get('age')),
    _.compose(_.includes('@'), _.get('email'))
]);

const testUsers = [
    { name: 'John Doe', email: 'john@example.com', age: 25 },
    { name: 'Jane Smith', email: 'janeexample.com', age: 30 }, // Email invalida
    { name: 'Bob Wilson', email: 'bob@example.com', age: 16 }, // Minorenne
    { email: 'alice@example.com', age: 28 } // Manca name
];

console.log('3.1 User validation:');
testUsers.forEach((user, index) => {
    console.log(`User ${index + 1}: ${isValidUser(user) ? 'Valid' : 'Invalid'}`);
});

// 3.2 Crea una funzione che normalizza dati con valori default
// TODO: Implementa usando _.defaults e _.mapValues
const normalizeUserData = _.pipe([
    _.defaults({
        age: 0,
        active: true,
        preferences: {},
        tags: []
    }),
    _.mapValues((value, key) => {
        if (key === 'email') return _.toLower(value);
        if (key === 'name') return _.startCase(value);
        return value;
    })
]);

const rawUserData = { name: 'john doe', email: 'JOHN@EXAMPLE.COM', age: 25 };
console.log('3.2 Normalized user:', normalizeUserData(rawUserData));

// 3.3 Implementa una funzione di deep merge customizzata
// TODO: Usa _.mergeWith per gestire arrays concatenation
const customMerge = _.mergeWith((objValue, srcValue, key) => {
    if (_.isArray(objValue)) {
        return _.concat(objValue, srcValue);
    }
    if (key === 'count') {
        return objValue + srcValue;
    }
});

const obj1 = { tags: ['javascript'], count: 5, meta: { created: '2024-01-01' } };
const obj2 = { tags: ['react'], count: 3, meta: { updated: '2024-01-02' } };
console.log('3.3 Custom merge:', customMerge(obj1, obj2));

// ==============================================
// ESERCIZIO 4: PERFORMANCE OPTIMIZATION
// ==============================================

console.log('\n--- ESERCIZIO 4: Performance Optimization ---');

// 4.1 Implementa memoization per una funzione costosa
// TODO: Usa _.memoize per ottimizzare il calcolo
const expensiveCalculation = _.memoize((n) => {
    console.log(`Computing for ${n}...`);
    // Simula calcolo costoso
    let result = 0;
    for (let i = 0; i < n * 1000; i++) {
        result += Math.sqrt(i);
    }
    return result;
});

console.log('4.1 First call:', expensiveCalculation(100));
console.log('4.1 Second call (cached):', expensiveCalculation(100));

// 4.2 Implementa debounce per simulare input handling
// TODO: Usa _.debounce per creare una search function
const searchFunction = _.debounce((query) => {
    console.log(`Searching for: "${query}"`);
    // Simula ricerca API
}, 300);

console.log('4.2 Testing debounce:');
['a', 'ap', 'app', 'appl', 'apple'].forEach((query, index) => {
    setTimeout(() => searchFunction(query), index * 100);
});

// 4.3 Usa throttle per rate limiting
// TODO: Implementa una funzione throttled per tracking events
const trackEvent = _.throttle((event) => {
    console.log(`Tracking event: ${event} at ${new Date().toLocaleTimeString()}`);
}, 1000);

console.log('4.3 Testing throttle:');
for (let i = 0; i < 5; i++) {
    setTimeout(() => trackEvent(`scroll-${i}`), i * 200);
}

// ==============================================
// ESERCIZIO 5: DATA PIPELINE AVANZATA
// ==============================================

console.log('\n--- ESERCIZIO 5: Advanced Data Pipeline ---');

const rawApiData = [
    { user_id: 1, user_name: 'alice_johnson', user_email: 'ALICE@EXAMPLE.COM', purchase_date: '2024-01-15', item_price: 25.99, item_category: 'electronics' },
    { user_id: 2, user_name: 'bob_smith', user_email: 'bob@EXAMPLE.com', purchase_date: '2024-01-16', item_price: 15.50, item_category: 'books' },
    { user_id: 1, user_name: 'alice_johnson', user_email: 'ALICE@EXAMPLE.COM', purchase_date: '2024-01-17', item_price: 89.99, item_category: 'electronics' },
    { user_id: 3, user_name: 'charlie_brown', user_email: 'charlie@example.COM', purchase_date: '2024-01-18', item_price: 45.00, item_category: 'clothing' }
];

// 5.1 Crea una pipeline di trasformazione completa
// TODO: Implementa normalizzazione, aggregazione e formatting
const processApiData = _.pipe([
    // Normalizza i nomi delle proprietà
    _.map(_.mapKeys(_.camelCase)),
    // Normalizza i valori
    _.map(_.pipe([
        _.update('userName', _.pipe([_.replace(/_/g, ' '), _.startCase])),
        _.update('userEmail', _.toLower),
        _.update('purchaseDate', date => new Date(date)),
        _.update('itemCategory', _.startCase)
    ])),
    // Raggruppa per utente
    _.groupBy('userId'),
    // Aggrega dati per utente
    _.mapValues(purchases => ({
        userId: _.get('userId', _.head(purchases)),
        userName: _.get('userName', _.head(purchases)),
        userEmail: _.get('userEmail', _.head(purchases)),
        totalPurchases: purchases.length,
        totalSpent: _.sumBy('itemPrice', purchases),
        categories: _.pipe([
            _.map('itemCategory'),
            _.uniq,
            _.join(', ')
        ])(purchases),
        firstPurchase: _.minBy('purchaseDate', purchases).purchaseDate,
        lastPurchase: _.maxBy('purchaseDate', purchases).purchaseDate
    })),
    // Converti in array e ordina per spesa totale
    _.values,
    _.sortBy('totalSpent'),
    _.reverse
]);

console.log('5.1 Processed API data:', processApiData(rawApiData));

// ==============================================
// ESERCIZI BONUS
// ==============================================

console.log('\n--- ESERCIZI BONUS ---');

// BONUS 1: Implementa una funzione di deep path update
// TODO: Usa _.update con path complessi
const deepUpdateExample = () => {
    const complexObject = {
        users: [
            { id: 1, profile: { settings: { theme: 'light', notifications: true } } },
            { id: 2, profile: { settings: { theme: 'dark', notifications: false } } }
        ]
    };
    
    // Aggiorna il theme del primo utente
    const updatedObject = _.update(['users', 0, 'profile', 'settings', 'theme'], 'dark', complexObject);
    console.log('Bonus 1 - Deep update:', updatedObject);
};

deepUpdateExample();

// BONUS 2: Crea un builder pattern usando Lodash/FP
// TODO: Implementa una classe QueryBuilder
class QueryBuilder {
    constructor(data) {
        this.data = data;
        this.operations = [];
    }
    
    filter(predicate) {
        this.operations.push(_.filter(predicate));
        return this;
    }
    
    map(iteratee) {
        this.operations.push(_.map(iteratee));
        return this;
    }
    
    sortBy(iteratee) {
        this.operations.push(_.sortBy(iteratee));
        return this;
    }
    
    take(n) {
        this.operations.push(_.take(n));
        return this;
    }
    
    execute() {
        return _.pipe(this.operations)(this.data);
    }
}

const queryResult = new QueryBuilder(employees)
    .filter(emp => emp.salary > 70000)
    .sortBy('yearsExperience')
    .map(emp => ({ name: emp.name, salary: emp.salary }))
    .take(3)
    .execute();

console.log('Bonus 2 - Query builder result:', queryResult);

// BONUS 3: Implementa currying personalizzato
// TODO: Crea funzioni curried per operazioni comuni
const curriedCalculations = {
    // Calcola percentuale con rate curried
    calculatePercentage: _.curry((rate, value) => value * (rate / 100)),
    
    // Applica sconto con rate curried
    applyDiscount: _.curry((discountRate, price) => price * (1 - discountRate / 100)),
    
    // Filtra per range di valori
    filterByRange: _.curry((min, max, array) => _.filter(item => item >= min && item <= max, array))
};

const calculateVAT = curriedCalculations.calculatePercentage(22); // VAT 22%
const apply10PercentDiscount = curriedCalculations.applyDiscount(10);
const filterSalaryRange = curriedCalculations.filterByRange(70000, 90000);

console.log('Bonus 3 - Curried functions:');
console.log('VAT on 100:', calculateVAT(100));
console.log('Discount on 100:', apply10PercentDiscount(100));
console.log('Salaries in range:', filterSalaryRange(_.map('salary', employees)));

console.log('\n✅ Esercizi Lodash/FP completati!');
console.log('💡 Suggerimenti:');
console.log('- Prova a risolvere gli esercizi TODO da solo prima di guardare le soluzioni');
console.log('- Sperimenta con diverse combinazioni di funzioni Lodash/FP');
console.log('- Concentrati sulla leggibilità e riutilizzabilità del codice');

/**
 * SFIDE EXTRA PER PRATICA:
 * 
 * 1. Implementa una funzione che converte un array di oggetti in formato CSV
 * 2. Crea un sistema di validazione form usando solo Lodash/FP
 * 3. Implementa un parser per query string usando composition
 * 4. Crea un sistema di cache LRU usando Lodash utilities
 * 5. Implementa un router semplice usando pattern matching con Lodash
 */
