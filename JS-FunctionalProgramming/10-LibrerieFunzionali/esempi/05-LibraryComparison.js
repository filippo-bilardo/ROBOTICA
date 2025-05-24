/**
 * CONFRONTO TRA LIBRERIE FUNZIONALI
 * 
 * Esempi comparativi che mostrano come risolvere gli stessi problemi
 * con diverse librerie funzionali (Lodash/FP, Ramda, Immutable.js, RxJS)
 */

const _ = require('lodash/fp');
const R = require('ramda');
const { List, Map, fromJS } = require('immutable');
const { of, from } = require('rxjs');
const { map, filter, reduce, tap } = require('rxjs/operators');

// ==============================================
// 1. DATA TRANSFORMATION COMPARISON
// ==============================================

console.log('=== 1. DATA TRANSFORMATION COMPARISON ===');

const users = [
    { id: 1, name: 'Alice', age: 25, department: 'Engineering', salary: 75000 },
    { id: 2, name: 'Bob', age: 30, department: 'Marketing', salary: 65000 },
    { id: 3, name: 'Charlie', age: 35, department: 'Engineering', salary: 85000 },
    { id: 4, name: 'Diana', age: 28, department: 'Sales', salary: 70000 },
    { id: 5, name: 'Eve', age: 32, department: 'Engineering', salary: 90000 }
];

// Task: Trovare la media degli stipendi degli ingegneri sopra i 30 anni

// === LODASH/FP ===
const lodashResult = _.pipe([
    _.filter(user => user.department === 'Engineering' && user.age > 30),
    _.map('salary'),
    _.mean
])(users);

console.log('Lodash/FP result:', lodashResult);

// === RAMDA ===
const ramdaResult = R.pipe(
    R.filter(R.allPass([
        R.propEq('department', 'Engineering'),
        R.compose(R.lt(30), R.prop('age'))
    ])),
    R.pluck('salary'),
    R.mean
)(users);

console.log('Ramda result:', ramdaResult);

// === IMMUTABLE.JS ===
const immutableUsers = List(users);
const immutableResult = immutableUsers
    .filter(user => user.department === 'Engineering' && user.age > 30)
    .map(user => user.salary)
    .reduce((sum, salary, index, collection) => {
        if (index === collection.size - 1) {
            return (sum + salary) / collection.size;
        }
        return sum + salary;
    }, 0);

console.log('Immutable.js result:', immutableResult);

// === RXJS ===
from(users).pipe(
    filter(user => user.department === 'Engineering' && user.age > 30),
    map(user => user.salary),
    reduce((acc, salary, index) => ({
        sum: acc.sum + salary,
        count: acc.count + 1
    }), { sum: 0, count: 0 }),
    map(acc => acc.sum / acc.count)
).subscribe(result => console.log('RxJS result:', result));

// ==============================================
// 2. COMPOSITION PATTERNS COMPARISON
// ==============================================

console.log('\n=== 2. COMPOSITION PATTERNS ===');

// Task: Creare una pipeline di validazione e trasformazione

const validateAndTransform = {
    // === LODASH/FP ===
    lodash: _.pipe([
        _.filter(_.has('email')),
        _.filter(_.compose(_.gte(_.__, 18), _.get('age'))),
        _.map(_.pick(['name', 'email', 'age'])),
        _.map(_.update('name', _.startCase)),
        _.map(_.set('isAdult', true))
    ]),

    // === RAMDA ===
    ramda: R.pipe(
        R.filter(R.has('email')),
        R.filter(R.compose(R.gte(R.__, 18), R.prop('age'))),
        R.map(R.pick(['name', 'email', 'age'])),
        R.map(R.over(R.lensProp('name'), R.compose(R.join(' '), R.map(R.pipe(R.head, R.toUpper)), R.split(' ')))),
        R.map(R.assoc('isAdult', true))
    )
};

const testData = [
    { name: 'john doe', email: 'john@example.com', age: 25 },
    { name: 'jane smith', age: 17 }, // Manca email
    { name: 'bob johnson', email: 'bob@example.com', age: 16 }, // Minorenne
    { name: 'alice brown', email: 'alice@example.com', age: 30 }
];

console.log('Lodash/FP validation:', validateAndTransform.lodash(testData));
console.log('Ramda validation:', validateAndTransform.ramda(testData));

// ==============================================
// 3. STATE MANAGEMENT COMPARISON
// ==============================================

console.log('\n=== 3. STATE MANAGEMENT COMPARISON ===');

// Initial state
const initialState = {
    users: [],
    currentUser: null,
    loading: false,
    errors: []
};

// === LODASH/FP (con helper functions) ===
const lodashStateManager = {
    state: initialState,
    
    addUser: function(user) {
        this.state = _.set('users', _.concat(this.state.users, user), this.state);
        return this.state;
    },
    
    setCurrentUser: function(userId) {
        const user = _.find(['id', userId], this.state.users);
        this.state = _.set('currentUser', user, this.state);
        return this.state;
    },
    
    updateUser: function(userId, updates) {
        this.state = _.update('users', 
            _.map(user => user.id === userId ? _.merge(user, updates) : user), 
            this.state
        );
        return this.state;
    }
};

// === RAMDA (Immutable updates) ===
const ramdaStateManager = (() => {
    let state = initialState;
    
    return {
        getState: () => state,
        
        addUser: (user) => {
            state = R.over(R.lensProp('users'), R.append(user), state);
            return state;
        },
        
        setCurrentUser: (userId) => {
            const user = R.find(R.propEq('id', userId), state.users);
            state = R.assoc('currentUser', user, state);
            return state;
        },
        
        updateUser: (userId, updates) => {
            const userLens = R.lensPath(['users', R.findIndex(R.propEq('id', userId), state.users)]);
            state = R.over(userLens, R.mergeLeft(updates), state);
            return state;
        }
    };
})();

// === IMMUTABLE.JS ===
class ImmutableStateManager {
    constructor() {
        this.state = Map(initialState).set('users', List());
    }
    
    addUser(user) {
        this.state = this.state.update('users', users => users.push(user));
        return this.state.toJS();
    }
    
    setCurrentUser(userId) {
        const user = this.state.get('users').find(u => u.id === userId);
        this.state = this.state.set('currentUser', user);
        return this.state.toJS();
    }
    
    updateUser(userId, updates) {
        const userIndex = this.state.get('users').findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.state = this.state.updateIn(['users', userIndex], user => ({ ...user, ...updates }));
        }
        return this.state.toJS();
    }
}

// Test dei state managers
const testUser1 = { id: 1, name: 'Alice', email: 'alice@example.com' };
const testUser2 = { id: 2, name: 'Bob', email: 'bob@example.com' };

console.log('--- Lodash/FP State Manager ---');
lodashStateManager.addUser(testUser1);
lodashStateManager.addUser(testUser2);
lodashStateManager.setCurrentUser(1);
console.log('Current state:', lodashStateManager.state);

console.log('--- Ramda State Manager ---');
ramdaStateManager.addUser(testUser1);
ramdaStateManager.addUser(testUser2);
ramdaStateManager.setCurrentUser(2);
console.log('Current state:', ramdaStateManager.getState());

console.log('--- Immutable.js State Manager ---');
const immutableManager = new ImmutableStateManager();
immutableManager.addUser(testUser1);
immutableManager.addUser(testUser2);
immutableManager.setCurrentUser(1);
console.log('Current state:', immutableManager.state.toJS());

// ==============================================
// 4. ASYNC DATA FLOW COMPARISON
// ==============================================

console.log('\n=== 4. ASYNC DATA FLOW COMPARISON ===');

// Simulazione API calls
const fetchUser = (id) => Promise.resolve({ id, name: `User ${id}`, active: Math.random() > 0.5 });
const fetchUserPosts = (userId) => Promise.resolve([
    { id: 1, userId, title: `Post 1 by User ${userId}` },
    { id: 2, userId, title: `Post 2 by User ${userId}` }
]);

// === PROMISE + LODASH/FP ===
const processWithPromisesLodash = async (userIds) => {
    try {
        const users = await Promise.all(userIds.map(fetchUser));
        const activeUsers = _.filter('active', users);
        
        const usersWithPosts = await Promise.all(
            activeUsers.map(async user => {
                const posts = await fetchUserPosts(user.id);
                return { ...user, posts };
            })
        );
        
        return _.pipe([
            _.map(user => ({
                ...user,
                postCount: user.posts.length,
                summary: `${user.name} has ${user.posts.length} posts`
            })),
            _.sortBy('postCount'),
            _.reverse
        ])(usersWithPosts);
        
    } catch (error) {
        console.error('Lodash/FP async error:', error);
        return [];
    }
};

// === PROMISE + RAMDA ===
const processWithPromisesRamda = async (userIds) => {
    try {
        const users = await Promise.all(userIds.map(fetchUser));
        const activeUsers = R.filter(R.prop('active'), users);
        
        const usersWithPosts = await Promise.all(
            R.map(async user => {
                const posts = await fetchUserPosts(user.id);
                return R.assoc('posts', posts, user);
            }, activeUsers)
        );
        
        return R.pipe(
            R.map(user => R.pipe(
                R.assoc('postCount', user.posts.length),
                R.assoc('summary', `${user.name} has ${user.posts.length} posts`)
            )(user)),
            R.sortBy(R.prop('postCount')),
            R.reverse
        )(usersWithPosts);
        
    } catch (error) {
        console.error('Ramda async error:', error);
        return [];
    }
};

// === RXJS ===
const processWithRxJS = (userIds) => {
    return from(userIds).pipe(
        // Fetch users in parallel
        map(id => from(fetchUser(id))),
        // Merge all user streams
        reduce((acc, userStream) => acc.concat(userStream), []),
        // Wait for all users to load
        map(userStreams => Promise.all(userStreams.map(stream => stream.toPromise()))),
        // Convert back to observable
        map(promise => from(promise)),
        // Flatten the promise
        reduce((acc, users) => users, []),
        // Filter active users
        map(users => users.filter(user => user.active)),
        // Fetch posts for each user
        map(users => Promise.all(
            users.map(async user => {
                const posts = await fetchUserPosts(user.id);
                return { ...user, posts };
            })
        )),
        // Convert back to observable and process
        map(promise => from(promise)),
        reduce((acc, users) => users, []),
        map(users => users
            .map(user => ({
                ...user,
                postCount: user.posts.length,
                summary: `${user.name} has ${user.posts.length} posts`
            }))
            .sort((a, b) => b.postCount - a.postCount)
        ),
        tap(result => console.log('RxJS async result:', result))
    );
};

// Test async operations
const testUserIds = [1, 2, 3, 4, 5];

processWithPromisesLodash(testUserIds)
    .then(result => console.log('Lodash/FP async result:', result));

processWithPromisesRamda(testUserIds)
    .then(result => console.log('Ramda async result:', result));

processWithRxJS(testUserIds).subscribe();

// ==============================================
// 5. PERFORMANCE COMPARISON
// ==============================================

console.log('\n=== 5. PERFORMANCE COMPARISON ===');

// Generate test data
const generateLargeDataset = (size) => {
    return Array.from({ length: size }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        score: Math.random() * 100,
        category: ['A', 'B', 'C', 'D'][i % 4],
        active: Math.random() > 0.3
    }));
};

const largeDataset = generateLargeDataset(10000);

// Performance test function
const performanceTest = (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms - Result length: ${result.length}`);
    return result;
};

// Test: Filter active users in category 'A' and sort by score
console.log('Testing with 10,000 records:');

performanceTest('Lodash/FP', () => 
    _.pipe([
        _.filter({ active: true, category: 'A' }),
        _.sortBy('score'),
        _.reverse,
        _.take(10)
    ])(largeDataset)
);

performanceTest('Ramda', () => 
    R.pipe(
        R.filter(R.allPass([R.propEq('active', true), R.propEq('category', 'A')])),
        R.sortBy(R.prop('score')),
        R.reverse,
        R.take(10)
    )(largeDataset)
);

performanceTest('Immutable.js', () => 
    List(largeDataset)
        .filter(user => user.active && user.category === 'A')
        .sortBy(user => user.score)
        .reverse()
        .take(10)
        .toArray()
);

performanceTest('Native JS', () => 
    largeDataset
        .filter(user => user.active && user.category === 'A')
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
);

// ==============================================
// 6. WHEN TO USE WHICH LIBRARY
// ==============================================

console.log('\n=== 6. LIBRARY SELECTION GUIDE ===');

const libraryGuide = {
    'Lodash/FP': {
        'Best for': [
            'Migrating from imperative to functional style',
            'Working with existing lodash codebase',
            'Quick prototyping with familiar utilities',
            'Data transformation pipelines'
        ],
        'Pros': ['Familiar API', 'Good documentation', 'Tree-shakeable', 'Performance optimized'],
        'Cons': ['Mixed paradigm support', 'Not purely functional', 'Larger bundle size']
    },
    
    'Ramda': {
        'Best for': [
            'Pure functional programming',
            'Complex data transformations',
            'Currying and composition heavy code',
            'Mathematical operations'
        ],
        'Pros': ['Purely functional', 'Excellent currying', 'Consistent API', 'Strong typing support'],
        'Cons': ['Learning curve', 'Smaller ecosystem', 'Performance overhead']
    },
    
    'Immutable.js': {
        'Best for': [
            'State management (Redux, etc.)',
            'Large datasets with frequent updates',
            'Preventing accidental mutations',
            'Complex nested data structures'
        ],
        'Pros': ['True immutability', 'Structural sharing', 'Rich data structures', 'Excellent for state'],
        'Cons': ['Bundle size', 'Learning curve', 'Interop complexity', 'Memory overhead']
    },
    
    'RxJS': {
        'Best for': [
            'Async/reactive programming',
            'Event streams',
            'Real-time applications',
            'Complex async coordination'
        ],
        'Pros': ['Powerful async handling', 'Rich operator set', 'Cancellation support', 'Error handling'],
        'Cons': ['High complexity', 'Memory leaks if misused', 'Learning curve', 'Debugging difficulty']
    }
};

console.log('Library Selection Guide:');
Object.entries(libraryGuide).forEach(([library, info]) => {
    console.log(`\n📚 ${library}:`);
    console.log(`   Best for: ${info['Best for'].join(', ')}`);
    console.log(`   Pros: ${info.Pros.join(', ')}`);
    console.log(`   Cons: ${info.Cons.join(', ')}`);
});

// ==============================================
// 7. HYBRID APPROACH EXAMPLE
// ==============================================

console.log('\n=== 7. HYBRID APPROACH ===');

// Esempio di utilizzo combinato delle librerie
const hybridDataProcessor = {
    // Usa Immutable.js per state management
    state: Map({
        data: List(),
        processing: false,
        results: Map()
    }),
    
    // Usa RxJS per async operations
    processDataStream: function(dataStream$) {
        return dataStream$.pipe(
            tap(() => this.setState('processing', true)),
            // Usa Ramda per transformations
            map(R.pipe(
                R.filter(R.has('id')),
                R.groupBy(R.prop('category')),
                R.map(R.pipe(
                    R.sortBy(R.prop('score')),
                    R.take(5)
                ))
            )),
            // Usa Lodash per final formatting
            map(_.mapValues(_.map(_.pick(['id', 'name', 'score'])))),
            tap(results => {
                this.setState('results', fromJS(results));
                this.setState('processing', false);
            })
        );
    },
    
    setState: function(key, value) {
        this.state = this.state.set(key, value);
    },
    
    getState: function() {
        return this.state.toJS();
    }
};

// Test hybrid approach
const testData$ = of([
    { id: 1, name: 'Alice', score: 85, category: 'A' },
    { id: 2, name: 'Bob', score: 92, category: 'B' },
    { id: 3, name: 'Charlie', score: 78, category: 'A' },
    { id: 4, name: 'Diana', score: 88, category: 'B' },
    { id: 5, name: 'Eve', score: 95, category: 'A' }
]);

hybridDataProcessor.processDataStream(testData$).subscribe({
    next: (results) => console.log('Hybrid processing results:', results),
    complete: () => console.log('Final state:', hybridDataProcessor.getState())
});

console.log('\n✅ Library comparison examples completed!');
console.log('💡 Choose the right tool for the job based on your specific needs.');
