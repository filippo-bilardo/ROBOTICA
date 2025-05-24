/**
 * Strutture Dati Immutabili con Immutable.js
 * Questo file dimostra l'uso di Immutable.js per gestire state complesso,
 * strutture dati annidate e operazioni performance-critical.
 */

// Installazione: npm install immutable
import { 
  Map, List, Set, Stack, Record, OrderedMap, OrderedSet,
  fromJS, isImmutable, is 
} from 'immutable';

// ==========================================
// STRUTTURE DATI BASE
// ==========================================

console.log('=== STRUTTURE DATI BASE ===');

// 1. List - Array immutabili
const numbers = List([1, 2, 3, 4, 5]);
const fruits = List.of('apple', 'banana', 'orange');

console.log('Original numbers:', numbers.toArray());
console.log('Added number:', numbers.push(6).toArray());
console.log('Original unchanged:', numbers.toArray());

// Operazioni funzionali
const doubled = numbers.map(x => x * 2);
const evens = numbers.filter(x => x % 2 === 0);
const sum = numbers.reduce((acc, x) => acc + x, 0);

console.log('Doubled:', doubled.toArray());
console.log('Evens:', evens.toArray());
console.log('Sum:', sum);

// 2. Map - Oggetti immutabili
const user = Map({
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  age: 25
});

console.log('\\nUser name:', user.get('name'));
console.log('User with new age:', user.set('age', 26).toJS());
console.log('User merged:', user.merge({ city: 'Rome', country: 'Italy' }).toJS());

// 3. Set - Insiemi immutabili
const skills = Set(['JavaScript', 'React', 'Node.js', 'JavaScript']); // Auto-dedup
const moreSkills = Set(['Python', 'Django']);

console.log('\\nSkills:', skills.toArray());
console.log('Union:', skills.union(moreSkills).toArray());
console.log('Has JavaScript:', skills.has('JavaScript'));

// ==========================================
// GESTIONE STATO APPLICAZIONE COMPLESSA
// ==========================================

console.log('\\n=== GESTIONE STATO APPLICAZIONE ===');

// 1. Definizione dello stato iniziale
const initialAppState = fromJS({
  user: {
    id: null,
    profile: {
      name: '',
      email: '',
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    },
    permissions: []
  },
  data: {
    posts: [],
    comments: [],
    categories: []
  },
  ui: {
    loading: false,
    errors: [],
    activeModal: null,
    selectedItems: []
  }
});

console.log('Initial state keys:', initialAppState.keys().toArray());

// 2. State mutations con path operations
const loginUser = (state, userData) => state
  .setIn(['user', 'id'], userData.id)
  .setIn(['user', 'profile', 'name'], userData.name)
  .setIn(['user', 'profile', 'email'], userData.email)
  .setIn(['user', 'permissions'], fromJS(userData.permissions));

const loggedInState = loginUser(initialAppState, {
  id: 1,
  name: 'Alice Johnson',
  email: 'alice@example.com',
  permissions: ['read', 'write', 'comment']
});

console.log('User after login:', loggedInState.getIn(['user', 'profile']).toJS());

// 3. Posts management
const addPost = (state, post) => state.updateIn(['data', 'posts'], posts => 
  posts.push(fromJS({
    ...post,
    id: posts.size + 1,
    createdAt: new Date().toISOString(),
    comments: []
  }))
);

const addComment = (state, postId, comment) => state.updateIn(['data', 'posts'], posts =>
  posts.map(post =>
    post.get('id') === postId
      ? post.updateIn(['comments'], comments => 
          comments.push(fromJS({
            ...comment,
            id: comments.size + 1,
            createdAt: new Date().toISOString()
          }))
        )
      : post
  )
);

// Aggiunta di posts e comments
let appState = loggedInState;
appState = addPost(appState, {
  title: 'First Post',
  content: 'This is my first post!',
  tags: ['introduction', 'first']
});

appState = addPost(appState, {
  title: 'Learning Immutable.js',
  content: 'Immutable.js is really powerful!',
  tags: ['javascript', 'immutable', 'learning']
});

appState = addComment(appState, 1, {
  author: 'Bob',
  content: 'Welcome to the platform!'
});

console.log('Posts count:', appState.getIn(['data', 'posts']).size);
console.log('First post:', appState.getIn(['data', 'posts', 0]).toJS());

// ==========================================
// RECORD E STRUTTURE TIPIZZATE
// ==========================================

console.log('\\n=== RECORD E STRUTTURE TIPIZZATE ===');

// 1. Definizione di Record per entità business
const PersonRecord = Record({
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  age: 0,
  active: true
}, 'Person');

const TaskRecord = Record({
  id: null,
  title: '',
  description: '',
  assigneeId: null,
  status: 'pending',
  priority: 'medium',
  createdAt: null,
  dueDate: null,
  tags: List()
}, 'Task');

// 2. Creazione di istanze Record
const alice = new PersonRecord({
  id: 1,
  firstName: 'Alice',
  lastName: 'Johnson',
  email: 'alice@example.com',
  age: 28
});

const task1 = new TaskRecord({
  id: 1,
  title: 'Implement authentication',
  description: 'Add login and registration functionality',
  assigneeId: alice.id,
  priority: 'high',
  createdAt: new Date(),
  tags: List(['backend', 'security', 'auth'])
});

console.log('Person:', alice.toJS());
console.log('Task title:', task1.title);
console.log('Task assignee:', alice.firstName);

// 3. Business logic con Record
const assignTask = (task, personId) => task.set('assigneeId', personId);
const completeTask = (task) => task.set('status', 'completed');
const addTag = (task, tag) => task.update('tags', tags => tags.push(tag));

const updatedTask = task1
  .pipe(task => addTag(task, 'urgent'))
  .pipe(completeTask);

console.log('Updated task:', updatedTask.toJS());

// ==========================================
// PERFORMANCE CON STRUCTURAL SHARING
// ==========================================

console.log('\\n=== PERFORMANCE E STRUCTURAL SHARING ===');

// 1. Creazione di struttura dati grande
const createLargeDataset = (size) => {
  return fromJS({
    metadata: {
      total: size,
      createdAt: new Date().toISOString(),
      version: '1.0'
    },
    items: Array.from({ length: size }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random() * 1000,
      category: ['A', 'B', 'C'][i % 3],
      active: i % 4 !== 0
    }))
  });
};

const largeDataset = createLargeDataset(10000);

// 2. Performance comparison
console.time('Immutable update');
const updatedDataset = largeDataset.updateIn(['items', 0, 'value'], value => value * 2);
console.timeEnd('Immutable update');

// Verifica structural sharing
console.log('Same metadata reference:', 
  largeDataset.get('metadata') === updatedDataset.get('metadata'));
console.log('Different items reference:', 
  largeDataset.get('items') !== updatedDataset.get('items'));

// 3. Batch updates performance
console.time('Batch updates');
const batchUpdated = largeDataset.withMutations(mutable => {
  for (let i = 0; i < 100; i++) {
    mutable.updateIn(['items', i, 'value'], value => value * 1.1);
  }
});
console.timeEnd('Batch updates');

// ==========================================
// PATTERN E-COMMERCE STORE
// ==========================================

console.log('\\n=== E-COMMERCE STORE PATTERN ===');

// 1. Store state structure
const createECommerceStore = () => fromJS({
  catalog: {
    products: [],
    categories: [],
    brands: []
  },
  cart: {
    items: [],
    total: 0,
    discount: 0,
    shipping: 0
  },
  user: {
    profile: null,
    wishlist: [],
    orderHistory: []
  },
  ui: {
    currentPage: 'home',
    filters: {},
    sort: { field: 'name', direction: 'asc' }
  }
});

let store = createECommerceStore();

// 2. Products management
const addProduct = (store, product) => store.updateIn(['catalog', 'products'], products =>
  products.push(fromJS({
    ...product,
    id: products.size + 1,
    createdAt: new Date().toISOString()
  }))
);

const updateProductStock = (store, productId, newStock) => 
  store.updateIn(['catalog', 'products'], products =>
    products.map(product =>
      product.get('id') === productId
        ? product.set('stock', newStock)
        : product
    )
  );

// Aggiunta prodotti
const products = [
  { name: 'Laptop Pro', price: 1299, category: 'Electronics', stock: 15 },
  { name: 'Wireless Headphones', price: 199, category: 'Electronics', stock: 25 },
  { name: 'Office Chair', price: 299, category: 'Furniture', stock: 8 }
];

products.forEach(product => {
  store = addProduct(store, product);
});

console.log('Products in catalog:', store.getIn(['catalog', 'products']).size);

// 3. Shopping cart operations
const addToCart = (store, productId, quantity = 1) => {
  const product = store.getIn(['catalog', 'products']).find(p => p.get('id') === productId);
  
  if (!product) return store;
  
  return store.updateIn(['cart', 'items'], items => {
    const existingIndex = items.findIndex(item => item.get('productId') === productId);
    
    if (existingIndex >= 0) {
      return items.updateIn([existingIndex, 'quantity'], qty => qty + quantity);
    } else {
      return items.push(fromJS({
        productId,
        name: product.get('name'),
        price: product.get('price'),
        quantity
      }));
    }
  }).pipe(calculateCartTotal);
};

const removeFromCart = (store, productId) =>
  store.updateIn(['cart', 'items'], items =>
    items.filter(item => item.get('productId') !== productId)
  ).pipe(calculateCartTotal);

const calculateCartTotal = (store) => {
  const total = store.getIn(['cart', 'items'])
    .reduce((sum, item) => sum + (item.get('price') * item.get('quantity')), 0);
  
  return store.setIn(['cart', 'total'], total);
};

// Operazioni cart
store = addToCart(store, 1, 2); // 2 Laptop Pro
store = addToCart(store, 2, 1); // 1 Wireless Headphones
store = addToCart(store, 1, 1); // +1 Laptop Pro (totale 3)

console.log('Cart items:', store.getIn(['cart', 'items']).toJS());
console.log('Cart total:', store.getIn(['cart', 'total']));

// ==========================================
// CURSORS PATTERN PER COMPONENTI
// ==========================================

console.log('\\n=== CURSORS PATTERN ===');

// 1. Cursor implementation
const createCursor = (data, path, onChange) => ({
  get: (subPath = []) => data.getIn([...path, ...subPath]),
  
  set: (subPath, value) => {
    const newData = data.setIn([...path, ...subPath], value);
    onChange(newData);
    return createCursor(newData, path, onChange);
  },
  
  update: (subPath, updater) => {
    const newData = data.updateIn([...path, ...subPath], updater);
    onChange(newData);
    return createCursor(newData, path, onChange);
  },
  
  push: (subPath, value) => {
    const newData = data.updateIn([...path, ...subPath], list => list.push(value));
    onChange(newData);
    return createCursor(newData, path, onChange);
  }
});

// 2. Component-like usage
let globalState = store;
const onStateChange = (newState) => {
  globalState = newState;
  console.log('State changed');
};

const cartCursor = createCursor(globalState, ['cart'], onStateChange);
const userCursor = createCursor(globalState, ['user'], onStateChange);

// Simulazione di component updates
cartCursor.set(['discount'], 50);
userCursor.set(['profile'], fromJS({ name: 'Alice', email: 'alice@example.com' }));

console.log('Cart discount:', globalState.getIn(['cart', 'discount']));
console.log('User profile:', globalState.getIn(['user', 'profile']).toJS());

// ==========================================
// VALIDATION E ERROR HANDLING
// ==========================================

console.log('\\n=== VALIDATION E ERROR HANDLING ===');

// 1. Validation utilities
const validateProduct = (product) => {
  const errors = List();
  
  if (!product.get('name') || product.get('name').length < 3) {
    errors.push('Name must be at least 3 characters');
  }
  
  if (!product.get('price') || product.get('price') <= 0) {
    errors.push('Price must be greater than 0');
  }
  
  if (!product.get('stock') || product.get('stock') < 0) {
    errors.push('Stock cannot be negative');
  }
  
  return {
    isValid: errors.size === 0,
    errors: errors.toArray(),
    data: product
  };
};

// 2. Safe operations with validation
const safeAddProduct = (store, productData) => {
  const product = fromJS(productData);
  const validation = validateProduct(product);
  
  if (!validation.isValid) {
    console.error('Product validation failed:', validation.errors);
    return store.updateIn(['ui', 'errors'], errors => 
      errors.concat(fromJS(validation.errors))
    );
  }
  
  return addProduct(store, productData);
};

// Test validation
const invalidProduct = { name: 'TV', price: -100, stock: -5 };
store = safeAddProduct(store, invalidProduct);

console.log('Validation errors:', store.getIn(['ui', 'errors']).toJS());

// ==========================================
// SERIALIZATION E INTEROPERABILITÀ
// ==========================================

console.log('\\n=== SERIALIZATION E INTEROPERABILITÀ ===');

// 1. Serialization per persistenza
const serializeState = (state) => {
  return JSON.stringify(state.toJS());
};

const deserializeState = (serialized) => {
  return fromJS(JSON.parse(serialized));
};

// 2. API compatibility
const toApiFormat = (immutableData) => {
  return immutableData.toJS();
};

const fromApiFormat = (apiData) => {
  return fromJS(apiData);
};

// Test serialization
const serialized = serializeState(store);
const deserialized = deserializeState(serialized);

console.log('Serialization successful:', is(store, deserialized));
console.log('Store size after deserialization:', deserialized.size);

// 3. React integration pattern
const connectToReact = (Component) => {
  return class ImmutableComponent {
    constructor(props) {
      this.state = { data: props.initialData };
    }
    
    updateData = (path, value) => {
      this.setState(prevState => ({
        data: prevState.data.setIn(path, value)
      }));
    }
    
    render() {
      return Component({
        data: this.state.data,
        updateData: this.updateData
      });
    }
  };
};

// Export per testing
export {
  createECommerceStore,
  addProduct,
  addToCart,
  removeFromCart,
  calculateCartTotal,
  createCursor,
  validateProduct,
  safeAddProduct,
  PersonRecord,
  TaskRecord
};
