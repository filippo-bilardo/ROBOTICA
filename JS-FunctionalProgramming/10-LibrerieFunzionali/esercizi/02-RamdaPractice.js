/**
 * ESERCIZI RAMDA - FUNCTIONAL PROGRAMMING PURO
 * 
 * Esercizi per padroneggiare Ramda e i concetti di programmazione funzionale pura.
 * Focus su: currying, composition, lenses, transducers e point-free style.
 */

const R = require('ramda');

console.log('=== ESERCIZI RAMDA ===\n');

// ==============================================
// ESERCIZIO 1: CURRYING E PARTIAL APPLICATION
// ==============================================

console.log('--- ESERCIZIO 1: Currying e Partial Application ---');

// 1.1 Crea funzioni curried per operazioni matematiche
// TODO: Implementa usando R.curry
const add = R.curry((a, b) => a + b);
const multiply = R.curry((a, b) => a * b);
const divide = R.curry((a, b) => a / b);

// Crea partial applications
const add10 = add(10);
const double = multiply(2);
const half = divide(R.__, 2); // Placeholder per first argument

console.log('1.1 Curried functions:');
console.log('add10(5):', add10(5));
console.log('double(7):', double(7));
console.log('half(20):', half(20));

// 1.2 Implementa una funzione curried per validazione
// TODO: Crea validatori usando currying
const isGreaterThan = R.curry((min, value) => value > min);
const isLessThan = R.curry((max, value) => value < max);
const isInRange = R.curry((min, max, value) => value >= min && value <= max);

const isAdult = isGreaterThan(17);
const isValidAge = isInRange(0, 120);
const isWorkingAge = isInRange(18, 65);

const testAges = [15, 25, 45, 70, 130];
console.log('1.2 Age validation:');
testAges.forEach(age => {
    console.log(`Age ${age}: Adult=${isAdult(age)}, Valid=${isValidAge(age)}, Working=${isWorkingAge(age)}`);
});

// ==============================================
// ESERCIZIO 2: COMPOSITION E PIPE
// ==============================================

console.log('\n--- ESERCIZIO 2: Composition e Pipe ---');

const users = [
    { id: 1, name: 'alice cooper', email: 'ALICE@EXAMPLE.COM', age: 28, city: 'new york', salary: 75000 },
    { id: 2, name: 'bob dylan', email: 'bob@EXAMPLE.com', age: 35, city: 'los angeles', salary: 85000 },
    { id: 3, name: 'charlie parker', email: 'charlie@example.COM', age: 42, city: 'chicago', salary: 95000 },
    { id: 4, name: 'diana ross', email: 'diana@EXAMPLE.com', age: 31, city: 'miami', salary: 70000 }
];

// 2.1 Normalizza i dati utente usando composition
// TODO: Implementa usando R.pipe e R.evolve
const normalizeUser = R.pipe(
    R.evolve({
        name: R.pipe(R.split(' '), R.map(R.pipe(R.head, R.toUpper, R.concat(R.__, R.tail))), R.join(' ')),
        email: R.toLower,
        city: R.pipe(R.split(' '), R.map(R.pipe(R.head, R.toUpper, R.concat(R.__, R.tail))), R.join(' '))
    })
);

console.log('2.1 Normalized users:');
users.forEach(user => {
    console.log(normalizeUser(user));
});

// 2.2 Crea una pipeline di analisi utenti
// TODO: Implementa usando R.pipe con multiple operations
const analyzeUsers = R.pipe(
    R.map(normalizeUser),
    R.groupBy(R.prop('city')),
    R.mapObjIndexed((cityUsers, city) => ({
        city,
        count: cityUsers.length,
        averageAge: R.pipe(R.pluck('age'), R.mean)(cityUsers),
        averageSalary: R.pipe(R.pluck('salary'), R.mean)(cityUsers),
        totalSalary: R.pipe(R.pluck('salary'), R.sum)(cityUsers)
    })),
    R.values,
    R.sortBy(R.prop('averageSalary')),
    R.reverse
);

console.log('2.2 User analysis by city:', analyzeUsers(users));

// 2.3 Implementa point-free style functions
// TODO: Crea funzioni senza menzionare gli argomenti
const getTopEarners = R.pipe(
    R.filter(R.propSatisfies(R.gt(R.__, 80000), 'salary')),
    R.sortBy(R.prop('salary')),
    R.reverse,
    R.take(2),
    R.pluck('name')
);

const getYoungProfessionals = R.pipe(
    R.filter(R.allPass([
        R.propSatisfies(R.gt(35), 'age'),
        R.propSatisfies(R.gt(R.__, 70000), 'salary')
    ])),
    R.map(R.pick(['name', 'age', 'salary']))
);

console.log('2.3 Top earners:', getTopEarners(users));
console.log('2.3 Young professionals:', getYoungProfessionals(users));

// ==============================================
// ESERCIZIO 3: LENSES PER IMMUTABLE UPDATES
// ==============================================

console.log('\n--- ESERCIZIO 3: Lenses ---');

const appState = {
    user: {
        profile: {
            personal: { name: 'John Doe', age: 30 },
            settings: { theme: 'light', notifications: true }
        },
        preferences: { language: 'en', timezone: 'UTC' }
    },
    ui: {
        modal: { isOpen: false, content: null },
        sidebar: { collapsed: false }
    }
};

// 3.1 Crea lenses per navigare la struttura
// TODO: Implementa lenses usando R.lensPath
const userProfileLens = R.lensPath(['user', 'profile']);
const userPersonalLens = R.lensPath(['user', 'profile', 'personal']);
const userSettingsLens = R.lensPath(['user', 'profile', 'settings']);
const modalLens = R.lensPath(['ui', 'modal']);
const themeLens = R.lensPath(['user', 'profile', 'settings', 'theme']);

console.log('3.1 Lens operations:');
console.log('User profile:', R.view(userProfileLens, appState));
console.log('Theme:', R.view(themeLens, appState));

// 3.2 Aggiorna lo state usando lenses
// TODO: Usa R.set, R.over per immutable updates
const updateAge = R.over(R.lensPath(['user', 'profile', 'personal', 'age']), R.add(1));
const toggleTheme = R.over(themeLens, theme => theme === 'light' ? 'dark' : 'light');
const openModal = R.set(modalLens, { isOpen: true, content: 'Welcome!' });

const updatedState1 = updateAge(appState);
const updatedState2 = toggleTheme(updatedState1);
const updatedState3 = openModal(updatedState2);

console.log('3.2 Updated state theme:', R.view(themeLens, updatedState3));
console.log('3.2 Updated state modal:', R.view(modalLens, updatedState3));

// 3.3 Crea lenses composte e conditional updates
// TODO: Implementa lenses avanzate
const userAgeLens = R.lensPath(['user', 'profile', 'personal', 'age']);
const notificationsLens = R.lensPath(['user', 'profile', 'settings', 'notifications']);

const incrementAgeIfAdult = R.when(
    R.pipe(R.view(userAgeLens), R.gte(R.__, 18)),
    R.over(userAgeLens, R.add(1))
);

const disableNotificationsIfOld = R.when(
    R.pipe(R.view(userAgeLens), R.lt(65)),
    R.set(notificationsLens, false)
);

const conditionalUpdate = R.pipe(
    incrementAgeIfAdult,
    disableNotificationsIfOld
);

console.log('3.3 Conditional update result:', conditionalUpdate(appState));

// ==============================================
// ESERCIZIO 4: TRANSDUCERS
// ==============================================

console.log('\n--- ESERCIZIO 4: Transducers ---');

const numbers = R.range(1, 1001); // 1 to 1000

// 4.1 Implementa transducers per performance
// TODO: Usa R.transduce per operazioni efficienti
const evenSquaresSumTransducer = R.compose(
    R.filter(R.pipe(R.modulo(R.__, 2), R.equals(0))),
    R.map(R.multiply(R.__, R.__)),
    R.take(10)
);

const result1 = R.transduce(evenSquaresSumTransducer, R.add, 0, numbers);
console.log('4.1 Sum of first 10 even squares:', result1);

// 4.2 Crea transducers per data processing
// TODO: Implementa complex transducers
const salesData = R.times(() => ({
    amount: Math.random() * 1000,
    category: R.nth(Math.floor(Math.random() * 3), ['electronics', 'clothing', 'books']),
    date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
}), 1000);

const salesAnalysisTransducer = R.compose(
    R.filter(R.propSatisfies(R.lt(100), 'amount')),
    R.map(R.pick(['amount', 'category'])),
    R.take(50)
);

const processedSales = R.transduce(
    salesAnalysisTransducer,
    (acc, sale) => R.over(R.lensProp(sale.category), R.defaultTo(0), R.add(sale.amount), acc),
    {},
    salesData
);

console.log('4.2 Sales by category (transduced):', processedSales);

// 4.3 Confronta performance: transducers vs chain operations
// TODO: Implementa benchmark
const measureTime = (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
    return result;
};

const largeArray = R.range(1, 100001);

// Chain approach
const chainResult = measureTime('Chain operations', () =>
    R.pipe(
        R.filter(x => x % 2 === 0),
        R.map(x => x * x),
        R.filter(x => x > 100),
        R.take(1000),
        R.sum
    )(largeArray)
);

// Transducer approach
const transducerResult = measureTime('Transducer', () =>
    R.transduce(
        R.compose(
            R.filter(x => x % 2 === 0),
            R.map(x => x * x),
            R.filter(x => x > 100),
            R.take(1000)
        ),
        R.add,
        0,
        largeArray
    )
);

console.log('4.3 Results equal:', chainResult === transducerResult);

// ==============================================
// ESERCIZIO 5: ADVANCED FUNCTIONAL PATTERNS
// ==============================================

console.log('\n--- ESERCIZIO 5: Advanced Patterns ---');

// 5.1 Implementa Maybe/Option pattern
// TODO: Crea funzioni safe usando R.ifElse
const safeDivide = R.curry((a, b) =>
    R.ifElse(
        R.equals(0),
        R.always(null),
        R.divide(a)
    )(b)
);

const safeHead = R.ifElse(
    R.isEmpty,
    R.always(null),
    R.head
);

const safeProp = R.curry((prop, obj) =>
    R.ifElse(
        R.has(prop),
        R.prop(prop),
        R.always(null)
    )(obj)
);

console.log('5.1 Safe operations:');
console.log('safeDivide(10, 2):', safeDivide(10, 2));
console.log('safeDivide(10, 0):', safeDivide(10, 0));
console.log('safeHead([1,2,3]):', safeHead([1, 2, 3]));
console.log('safeHead([]):', safeHead([]));

// 5.2 Implementa funzioni di validazione composte
// TODO: Crea un validation system
const validators = {
    required: R.complement(R.either(R.isNil, R.isEmpty)),
    minLength: R.curry((min, str) => R.gte(R.length(str), min)),
    maxLength: R.curry((max, str) => R.lte(R.length(str), max)),
    isEmail: R.test(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    isNumeric: R.test(/^\d+$/)
};

const createValidator = (rules) => (obj) =>
    R.mapObjIndexed((fieldRules, field) => {
        const value = R.prop(field, obj);
        return R.pipe(
            R.map(rule => rule(value)),
            R.all(R.identity)
        )(fieldRules);
    }, rules);

const userValidator = createValidator({
    name: [validators.required, validators.minLength(2), validators.maxLength(50)],
    email: [validators.required, validators.isEmail],
    age: [validators.required, validators.isNumeric]
});

const testUser1 = { name: 'John Doe', email: 'john@example.com', age: '25' };
const testUser2 = { name: 'J', email: 'invalid-email', age: 'abc' };

console.log('5.2 Validation results:');
console.log('Valid user:', userValidator(testUser1));
console.log('Invalid user:', userValidator(testUser2));

// 5.3 Implementa un parser funzionale
// TODO: Crea un JSON path parser
const parsePath = R.pipe(
    R.split('.'),
    R.map(R.when(R.test(/\[\d+\]/), segment => {
        const [prop, index] = R.match(/^([^[]+)\[(\d+)\]$/, segment);
        return [R.nth(1, prop), parseInt(R.nth(2, prop))];
    })),
    R.flatten
);

const getPath = R.curry((path, obj) => {
    const pathArray = R.is(String, path) ? parsePath(path) : path;
    return R.path(pathArray, obj);
});

const testObject = {
    users: [
        { name: 'Alice', posts: [{ title: 'First Post' }, { title: 'Second Post' }] },
        { name: 'Bob', posts: [{ title: 'Bob\'s Post' }] }
    ]
};

console.log('5.3 Path parsing:');
console.log('users[0].name:', getPath('users[0].name', testObject));
console.log('users[0].posts[1].title:', getPath('users[0].posts[1].title', testObject));

// ==============================================
// ESERCIZIO 6: FUNCTIONAL REACTIVE PATTERNS
// ==============================================

console.log('\n--- ESERCIZIO 6: Functional Reactive Patterns ---');

// 6.1 Implementa un event system funzionale
// TODO: Crea un EventEmitter usando Ramda
const createEventSystem = () => {
    let listeners = {};
    
    return {
        on: R.curry((event, handler) => {
            listeners = R.over(
                R.lensProp(event),
                R.pipe(R.defaultTo([]), R.append(handler)),
                listeners
            );
        }),
        
        emit: R.curry((event, data) => {
            const eventListeners = R.propOr([], event, listeners);
            R.forEach(handler => handler(data), eventListeners);
        }),
        
        off: R.curry((event, handler) => {
            listeners = R.over(
                R.lensProp(event),
                R.reject(R.equals(handler)),
                listeners
            );
        }),
        
        getListeners: () => listeners
    };
};

const eventSystem = createEventSystem();

const logHandler = data => console.log('Log handler:', data);
const alertHandler = data => console.log('Alert handler:', data);

eventSystem.on('user:login', logHandler);
eventSystem.on('user:login', alertHandler);

console.log('6.1 Event system test:');
eventSystem.emit('user:login', { userId: 123, timestamp: Date.now() });

// 6.2 Implementa un state machine funzionale
// TODO: Crea un FSM usando Ramda
const createStateMachine = (initialState, transitions) => {
    let currentState = initialState;
    
    return {
        getState: () => currentState,
        
        transition: (action) => {
            const transition = R.path([currentState, action], transitions);
            if (transition) {
                const newState = R.is(Function, transition) ? transition() : transition;
                currentState = newState;
                return currentState;
            }
            return currentState;
        },
        
        can: (action) => R.hasPath([currentState, action], transitions)
    };
};

const userStateMachine = createStateMachine('inactive', {
    inactive: {
        login: 'active',
        register: 'pending'
    },
    active: {
        logout: 'inactive',
        suspend: 'suspended'
    },
    suspended: {
        activate: 'active',
        delete: 'deleted'
    },
    pending: {
        verify: 'active',
        cancel: 'inactive'
    },
    deleted: {}
});

console.log('6.2 State machine test:');
console.log('Initial state:', userStateMachine.getState());
console.log('After login:', userStateMachine.transition('login'));
console.log('Can suspend?', userStateMachine.can('suspend'));
console.log('After suspend:', userStateMachine.transition('suspend'));

// ==============================================
// ESERCIZI BONUS
// ==============================================

console.log('\n--- ESERCIZI BONUS ---');

// BONUS 1: Implementa un query builder funzionale
// TODO: Crea un SQL-like query builder
const createQuery = () => ({
    from: R.identity,
    select: R.curry((fields, data) => R.map(R.pick(fields), data)),
    where: R.curry((predicate, data) => R.filter(predicate, data)),
    orderBy: R.curry((field, data) => R.sortBy(R.prop(field), data)),
    limit: R.curry((n, data) => R.take(n, data))
});

const query = createQuery();
const testData = [
    { id: 1, name: 'Alice', age: 25, city: 'NY' },
    { id: 2, name: 'Bob', age: 30, city: 'LA' },
    { id: 3, name: 'Charlie', age: 35, city: 'NY' }
];

const queryResult = R.pipe(
    query.from,
    query.where(R.propEq('city', 'NY')),
    query.select(['name', 'age']),
    query.orderBy('age'),
    query.limit(1)
)(testData);

console.log('Bonus 1 - Query result:', queryResult);

// BONUS 2: Implementa memoization funzionale
// TODO: Crea un memoize avanzato
const memoizeWith = R.curry((keyGen, fn) => {
    let cache = {};
    return (...args) => {
        const key = keyGen(...args);
        if (R.has(key, cache)) {
            return cache[key];
        }
        const result = fn(...args);
        cache = R.assoc(key, result, cache);
        return result;
    };
});

const fibonacci = memoizeWith(
    R.identity,
    n => n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2)
);

console.log('Bonus 2 - Memoized fibonacci(40):', fibonacci(40));

console.log('\n✅ Esercizi Ramda completati!');
console.log('💡 Suggerimenti avanzati:');
console.log('- Pratica il point-free style per codice più pulito');
console.log('- Usa lenses per immutable updates complessi');
console.log('- Considera transducers per performance su grandi dataset');
console.log('- Combina patterns funzionali per soluzioni eleganti');

/**
 * PROGETTI PRATICI SUGGERITI:
 * 
 * 1. Sistema di validazione form complesso con error handling
 * 2. Parser per un linguaggio di query custom
 * 3. Sistema di routing funzionale per SPA
 * 4. Cache LRU implementation usando solo Ramda
 * 5. Functional reactive state management library
 * 6. JSON transformation engine con schema validation
 */
