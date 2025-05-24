/**
 * ESERCIZI IMMUTABLE.JS - STRUTTURE DATI PERSISTENTI
 * 
 * Esercizi per padroneggiare Immutable.js e le tecniche di gestione
 * immutabile dello stato. Focus su: List, Map, Set, Record, Stack, OrderedMap.
 */

const { 
    List, Map, Set, OrderedMap, Stack, Record, 
    fromJS, is, isImmutable, 
    Range, Repeat, Seq 
} = require('immutable');

console.log('=== ESERCIZI IMMUTABLE.JS ===\n');

// ==============================================
// ESERCIZIO 1: BASIC COLLECTIONS
// ==============================================

console.log('--- ESERCIZIO 1: Basic Collections ---');

// 1.1 Lista operazioni base
// TODO: Implementa operazioni base con List
const numbers = List([1, 2, 3, 4, 5]);
const fruits = List(['apple', 'banana', 'orange']);

console.log('1.1 List operations:');
console.log('Original numbers:', numbers.toArray());

// Aggiungi elementi
const numbersWithSix = numbers.push(6);
const numbersWithZero = numbers.unshift(0);
console.log('After push(6):', numbersWithSix.toArray());
console.log('After unshift(0):', numbersWithZero.toArray());

// Rimuovi elementi
const withoutFirst = numbers.shift();
const withoutLast = numbers.pop();
console.log('After shift():', withoutFirst.toArray());
console.log('After pop():', withoutLast.toArray());

// 1.2 Map operazioni base
// TODO: Implementa operazioni con Map
const userMap = Map({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    settings: Map({
        theme: 'dark',
        notifications: true
    })
});

console.log('\n1.2 Map operations:');
console.log('Original user:', userMap.toJS());

// Update nested values
const updatedUser = userMap
    .set('name', 'Jane Doe')
    .setIn(['settings', 'theme'], 'light')
    .updateIn(['settings', 'notifications'], not => !not);

console.log('Updated user:', updatedUser.toJS());

// 1.3 Set operazioni
// TODO: Implementa operazioni con Set
const set1 = Set([1, 2, 3, 4]);
const set2 = Set([3, 4, 5, 6]);

console.log('\n1.3 Set operations:');
console.log('Set1:', set1.toArray());
console.log('Set2:', set2.toArray());
console.log('Union:', set1.union(set2).toArray());
console.log('Intersection:', set1.intersect(set2).toArray());
console.log('Difference:', set1.subtract(set2).toArray());

// ==============================================
// ESERCIZIO 2: COMPLEX STATE MANAGEMENT
// ==============================================

console.log('\n--- ESERCIZIO 2: Complex State Management ---');

// 2.1 E-commerce cart implementation
// TODO: Implementa un carrello e-commerce completo
class ShoppingCart {
    constructor() {
        this.state = Map({
            items: OrderedMap(),
            total: 0,
            discounts: List(),
            user: Map({
                id: null,
                isLoggedIn: false
            })
        });
    }

    addItem(product, quantity = 1) {
        const itemId = product.id;
        const existingItem = this.state.getIn(['items', itemId]);
        
        if (existingItem) {
            this.state = this.state.updateIn(['items', itemId, 'quantity'], qty => qty + quantity);
        } else {
            this.state = this.state.setIn(['items', itemId], Map({
                ...product,
                quantity
            }));
        }
        
        this._recalculateTotal();
        return this;
    }

    removeItem(itemId) {
        this.state = this.state.deleteIn(['items', itemId]);
        this._recalculateTotal();
        return this;
    }

    updateQuantity(itemId, quantity) {
        if (quantity <= 0) {
            return this.removeItem(itemId);
        }
        
        this.state = this.state.setIn(['items', itemId, 'quantity'], quantity);
        this._recalculateTotal();
        return this;
    }

    applyDiscount(discount) {
        this.state = this.state.update('discounts', discounts => discounts.push(discount));
        this._recalculateTotal();
        return this;
    }

    _recalculateTotal() {
        const subtotal = this.state.get('items').reduce((total, item) => {
            return total + (item.get('price') * item.get('quantity'));
        }, 0);

        const discountAmount = this.state.get('discounts').reduce((total, discount) => {
            return total + (discount.type === 'percentage' ? 
                subtotal * (discount.value / 100) : 
                discount.value);
        }, 0);

        this.state = this.state.set('total', Math.max(0, subtotal - discountAmount));
    }

    getState() {
        return this.state.toJS();
    }

    getItems() {
        return this.state.get('items').toList().toJS();
    }

    getTotal() {
        return this.state.get('total');
    }
}

// Test shopping cart
const cart = new ShoppingCart();

const products = [
    { id: 'p1', name: 'Laptop', price: 999.99, category: 'electronics' },
    { id: 'p2', name: 'Mouse', price: 29.99, category: 'electronics' },
    { id: 'p3', name: 'Book', price: 15.99, category: 'books' }
];

console.log('2.1 Shopping Cart:');
cart.addItem(products[0], 1)
    .addItem(products[1], 2)
    .addItem(products[2], 1);

console.log('Items in cart:', cart.getItems());
console.log('Total before discount:', cart.getTotal());

cart.applyDiscount({ type: 'percentage', value: 10, code: 'SAVE10' });
console.log('Total after 10% discount:', cart.getTotal());

// 2.2 User session management
// TODO: Implementa gestione sessione utente
class UserSession {
    constructor() {
        this.state = Map({
            user: null,
            isAuthenticated: false,
            permissions: Set(),
            history: Stack(),
            preferences: Map(),
            metadata: Map({
                loginTime: null,
                lastActivity: null,
                sessionId: null
            })
        });
    }

    login(userData, permissions = []) {
        this.state = this.state
            .set('user', fromJS(userData))
            .set('isAuthenticated', true)
            .set('permissions', Set(permissions))
            .setIn(['metadata', 'loginTime'], Date.now())
            .setIn(['metadata', 'lastActivity'], Date.now())
            .setIn(['metadata', 'sessionId'], this._generateSessionId());
        
        this._addToHistory('login', userData);
        return this;
    }

    logout() {
        this._addToHistory('logout', { userId: this.state.getIn(['user', 'id']) });
        
        this.state = this.state
            .set('user', null)
            .set('isAuthenticated', false)
            .set('permissions', Set())
            .update('metadata', meta => meta.clear());
        
        return this;
    }

    updatePreference(key, value) {
        this.state = this.state.setIn(['preferences', key], value);
        this._addToHistory('preference_update', { key, value });
        return this;
    }

    hasPermission(permission) {
        return this.state.get('permissions').has(permission);
    }

    _addToHistory(action, data) {
        const historyEntry = Map({
            action,
            data: fromJS(data),
            timestamp: Date.now()
        });
        
        this.state = this.state.update('history', history => 
            history.push(historyEntry).take(50) // Keep last 50 entries
        );
    }

    _generateSessionId() {
        return Math.random().toString(36).substr(2, 9);
    }

    getState() {
        return this.state.toJS();
    }

    getHistory() {
        return this.state.get('history').toArray().map(entry => entry.toJS());
    }
}

// Test user session
const session = new UserSession();

console.log('\n2.2 User Session:');
session.login({ id: 1, name: 'John Doe', email: 'john@example.com' }, ['read', 'write'])
       .updatePreference('theme', 'dark')
       .updatePreference('language', 'en');

console.log('Is authenticated:', session.state.get('isAuthenticated'));
console.log('Has write permission:', session.hasPermission('write'));
console.log('User preferences:', session.state.get('preferences').toJS());

// ==============================================
// ESERCIZIO 3: PERFORMANCE OPTIMIZATION
// ==============================================

console.log('\n--- ESERCIZIO 3: Performance Optimization ---');

// 3.1 Lazy evaluation con Seq
// TODO: Implementa operazioni lazy per grandi dataset
const largeDataset = Range(0, 1000000);

console.log('3.1 Lazy evaluation:');

const measureTime = (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
    return result;
};

// Eager evaluation
const eagerResult = measureTime('Eager evaluation', () => {
    return largeDataset
        .filter(x => x % 2 === 0)
        .map(x => x * x)
        .filter(x => x > 1000000)
        .take(10)
        .toArray();
});

// Lazy evaluation
const lazyResult = measureTime('Lazy evaluation', () => {
    return Seq(largeDataset)
        .filter(x => x % 2 === 0)
        .map(x => x * x)
        .filter(x => x > 1000000)
        .take(10)
        .toArray();
});

console.log('Results equal:', JSON.stringify(eagerResult) === JSON.stringify(lazyResult));

// 3.2 Structural sharing demonstration
// TODO: Dimostra lo structural sharing
const originalMap = Map({
    a: 1,
    b: Map({ c: 2, d: 3 }),
    e: List([4, 5, 6])
});

const modifiedMap1 = originalMap.setIn(['b', 'c'], 99);
const modifiedMap2 = originalMap.updateIn(['e'], list => list.push(7));

console.log('\n3.2 Structural sharing:');
console.log('Original shares reference with modified1 (b.d):', 
    originalMap.getIn(['b', 'd']) === modifiedMap1.getIn(['b', 'd']));
console.log('Original shares reference with modified2 (b):', 
    originalMap.get('b') === modifiedMap2.get('b'));

// 3.3 Batch updates optimization
// TODO: Implementa batch updates per performance
const optimizeBatchUpdates = (map, updates) => {
    return map.withMutations(mutable => {
        updates.forEach(({ path, value }) => {
            mutable.setIn(path, value);
        });
    });
};

const baseMap = Map({
    user: Map({ name: '', email: '', settings: Map() }),
    ui: Map({ theme: 'light', sidebar: true }),
    data: Map({ items: List(), loading: false })
});

const batchUpdates = [
    { path: ['user', 'name'], value: 'Alice' },
    { path: ['user', 'email'], value: 'alice@example.com' },
    { path: ['ui', 'theme'], value: 'dark' },
    { path: ['data', 'loading'], value: true }
];

const batchResult = measureTime('Batch updates', () => 
    optimizeBatchUpdates(baseMap, batchUpdates)
);

console.log('3.3 Batch update result:', batchResult.toJS());

// ==============================================
// ESERCIZIO 4: ADVANCED PATTERNS
// ==============================================

console.log('\n--- ESERCIZIO 4: Advanced Patterns ---');

// 4.1 Record classes per typed data
// TODO: Implementa Record classes
const UserRecord = Record({
    id: null,
    name: '',
    email: '',
    age: 0,
    preferences: Map()
});

const PostRecord = Record({
    id: null,
    title: '',
    content: '',
    author: null,
    createdAt: null,
    tags: Set()
});

class User extends UserRecord {
    getName() {
        return this.get('name');
    }

    getAge() {
        return this.get('age');
    }

    updatePreference(key, value) {
        return this.setIn(['preferences', key], value);
    }

    isAdult() {
        return this.get('age') >= 18;
    }
}

class Post extends PostRecord {
    getTitle() {
        return this.get('title');
    }

    addTag(tag) {
        return this.update('tags', tags => tags.add(tag));
    }

    hasTag(tag) {
        return this.get('tags').has(tag);
    }

    getAuthorName() {
        const author = this.get('author');
        return author ? author.getName() : 'Unknown';
    }
}

console.log('4.1 Record classes:');

const user = new User({
    id: 1,
    name: 'Alice Cooper',
    email: 'alice@example.com',
    age: 25,
    preferences: Map({ theme: 'dark' })
});

const post = new Post({
    id: 1,
    title: 'Learning Immutable.js',
    content: 'This is a great library...',
    author: user,
    createdAt: new Date(),
    tags: Set(['javascript', 'immutable'])
});

console.log('User name:', user.getName());
console.log('User is adult:', user.isAdult());
console.log('Post title:', post.getTitle());
console.log('Post author:', post.getAuthorName());
console.log('Post has "javascript" tag:', post.hasTag('javascript'));

// 4.2 Complex nested updates
// TODO: Implementa updates complessi su strutture nidificate
const complexState = fromJS({
    users: {
        1: { name: 'Alice', posts: [1, 2] },
        2: { name: 'Bob', posts: [3] }
    },
    posts: {
        1: { title: 'Post 1', author: 1, comments: [1, 2] },
        2: { title: 'Post 2', author: 1, comments: [] },
        3: { title: 'Post 3', author: 2, comments: [3] }
    },
    comments: {
        1: { text: 'Great post!', author: 2 },
        2: { text: 'Thanks!', author: 1 },
        3: { text: 'Interesting', author: 1 }
    }
});

// Add comment to post
const addCommentToPost = (state, postId, comment) => {
    const commentId = state.get('comments').keySeq().max() + 1;
    
    return state
        .setIn(['comments', commentId], fromJS(comment))
        .updateIn(['posts', postId, 'comments'], comments => comments.push(commentId));
};

// Get user posts with comments
const getUserPostsWithComments = (state, userId) => {
    const userPostIds = state.getIn(['users', userId, 'posts']);
    
    return userPostIds.map(postId => {
        const post = state.getIn(['posts', postId]);
        const commentIds = post.get('comments');
        const comments = commentIds.map(commentId => 
            state.getIn(['comments', commentId])
        );
        
        return post.set('commentDetails', comments);
    });
};

console.log('\n4.2 Complex operations:');

const stateWithNewComment = addCommentToPost(complexState, 1, {
    text: 'New comment!',
    author: 2
});

console.log('Alice posts with comments:', 
    getUserPostsWithComments(stateWithNewComment, 1).toJS()
);

// ==============================================
// ESERCIZIO 5: INTEGRATION PATTERNS
// ==============================================

console.log('\n--- ESERCIZIO 5: Integration Patterns ---');

// 5.1 Redux-style reducer con Immutable.js
// TODO: Implementa reducers per state management
const initialState = fromJS({
    todos: [],
    filter: 'ALL',
    ui: {
        loading: false,
        error: null
    }
});

const todoReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return state.update('todos', todos => todos.push(fromJS({
                id: Date.now(),
                text: action.payload.text,
                completed: false,
                createdAt: new Date().toISOString()
            })));
            
        case 'TOGGLE_TODO':
            const todoIndex = state.get('todos').findIndex(todo => 
                todo.get('id') === action.payload.id
            );
            return state.updateIn(['todos', todoIndex, 'completed'], completed => !completed);
            
        case 'SET_FILTER':
            return state.set('filter', action.payload.filter);
            
        case 'SET_LOADING':
            return state.setIn(['ui', 'loading'], action.payload.loading);
            
        case 'SET_ERROR':
            return state.setIn(['ui', 'error'], action.payload.error);
            
        default:
            return state;
    }
};

// Test reducer
let todoState = initialState;

console.log('5.1 Redux-style reducer:');

todoState = todoReducer(todoState, {
    type: 'ADD_TODO',
    payload: { text: 'Learn Immutable.js' }
});

todoState = todoReducer(todoState, {
    type: 'ADD_TODO',
    payload: { text: 'Build awesome apps' }
});

todoState = todoReducer(todoState, {
    type: 'TOGGLE_TODO',
    payload: { id: todoState.getIn(['todos', 0, 'id']) }
});

console.log('Todo state:', todoState.toJS());

// 5.2 API response normalization
// TODO: Implementa normalizzazione dati API
const normalizeApiResponse = (response) => {
    const entities = fromJS({
        users: {},
        posts: {},
        comments: {}
    });

    return response.reduce((acc, post) => {
        // Normalize users
        let result = acc.setIn(['users', post.author.id], fromJS(post.author));
        
        // Normalize comments
        post.comments.forEach(comment => {
            result = result.setIn(['comments', comment.id], fromJS(comment));
        });
        
        // Normalize posts
        const normalizedPost = {
            ...post,
            author: post.author.id,
            comments: post.comments.map(c => c.id)
        };
        
        return result.setIn(['posts', post.id], fromJS(normalizedPost));
    }, entities);
};

const apiResponse = [
    {
        id: 1,
        title: 'First Post',
        content: 'Hello world',
        author: { id: 1, name: 'Alice' },
        comments: [
            { id: 1, text: 'Great!', author: { id: 2, name: 'Bob' } },
            { id: 2, text: 'Thanks!', author: { id: 1, name: 'Alice' } }
        ]
    }
];

const normalizedData = normalizeApiResponse(apiResponse);
console.log('\n5.2 Normalized API data:', normalizedData.toJS());

// ==============================================
// ESERCIZI BONUS
// ==============================================

console.log('\n--- ESERCIZI BONUS ---');

// BONUS 1: Implementa undo/redo con Immutable.js
// TODO: Crea un history manager
class HistoryManager {
    constructor(initialState) {
        this.states = Stack([initialState]);
        this.currentIndex = 0;
    }

    pushState(newState) {
        // Remove any states after current index (for when we undo then do new action)
        this.states = this.states.take(this.currentIndex + 1);
        this.states = this.states.push(newState);
        this.currentIndex++;
        
        // Limit history size
        if (this.states.size > 50) {
            this.states = this.states.skip(1);
            this.currentIndex--;
        }
        
        return this;
    }

    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
        }
        return this;
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
        }
        return this;
    }

    getCurrentState() {
        return this.states.get(this.currentIndex);
    }

    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.states.size - 1;
    }
}

const history = new HistoryManager(Map({ counter: 0 }));

history.pushState(Map({ counter: 1 }))
       .pushState(Map({ counter: 2 }))
       .pushState(Map({ counter: 3 }));

console.log('Bonus 1 - History manager:');
console.log('Current:', history.getCurrentState().toJS());
console.log('After undo:', history.undo().getCurrentState().toJS());
console.log('After undo:', history.undo().getCurrentState().toJS());
console.log('After redo:', history.redo().getCurrentState().toJS());

// BONUS 2: Implementa deep comparison e diff
// TODO: Crea utility per confronto e diff
const deepDiff = (oldState, newState) => {
    const changes = Map();
    
    const findChanges = (oldVal, newVal, path = []) => {
        if (!is(oldVal, newVal)) {
            if (isImmutable(oldVal) && isImmutable(newVal) && 
                oldVal.entrySeq && newVal.entrySeq) {
                // Both are iterable immutable collections
                oldVal.entrySeq().forEach(([key, value]) => {
                    const newValue = newVal.get(key);
                    findChanges(value, newValue, path.concat(key));
                });
                
                newVal.entrySeq().forEach(([key, value]) => {
                    if (!oldVal.has(key)) {
                        changes.setIn(path.concat(key), {
                            type: 'added',
                            newValue: value
                        });
                    }
                });
            } else {
                changes.setIn(path, {
                    type: 'changed',
                    oldValue: oldVal,
                    newValue: newVal
                });
            }
        }
    };
    
    findChanges(oldState, newState);
    return changes;
};

const state1 = fromJS({ a: 1, b: { c: 2 }, d: [1, 2, 3] });
const state2 = fromJS({ a: 1, b: { c: 3 }, d: [1, 2, 3, 4], e: 'new' });

console.log('\nBonus 2 - Deep diff:', deepDiff(state1, state2).toJS());

console.log('\n✅ Esercizi Immutable.js completati!');
console.log('💡 Best practices ricordate:');
console.log('- Usa Record per strutture dati tipizzate');
console.log('- Sfrutta lo structural sharing per performance');
console.log('- Usa Seq per lazy evaluation su grandi dataset');
console.log('- Implementa batch updates con withMutations()');
console.log('- Mantieni la compatibilità con plain JS quando necessario');

/**
 * PROGETTI AVANZATI SUGGERITI:
 * 
 * 1. State management library completa (Redux-like)
 * 2. Time-travel debugger per applicazioni
 * 3. Real-time collaborative editing system
 * 4. Complex form validation con error tracking
 * 5. Data synchronization layer con conflict resolution
 * 6. Immutable database query builder
 */
