/**
 * ES6+ Functional Patterns Examples
 * 
 * Questo file dimostra come utilizzare le moderne feature di JavaScript
 * in combinazione con principi di programmazione funzionale.
 */

// ===== ARROW FUNCTIONS E LEXICAL SCOPE =====

// ✅ Arrow functions come funzioni pure
const add = (a) => (b) => a + b;
const multiply = (factor) => (value) => value * factor;
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);

// Esempi di utilizzo
const double = multiply(2);
const addTen = add(10);
const doubleAndAddTen = compose(addTen, double);

console.log('=== Arrow Functions ===');
console.log(double(5)); // 10
console.log(addTen(5)); // 15
console.log(doubleAndAddTen(5)); // 20

// ===== DESTRUCTURING FUNZIONALE =====

// Destructuring per data transformation
const extractUserInfo = ({ id, name, email, ...rest }) => ({
  userId: id,
  displayName: name,
  contactEmail: email,
  metadata: rest
});

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 30, city: 'Milano' },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 25, city: 'Roma' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35, city: 'Napoli' }
];

console.log('=== Destructuring ===');
const transformedUsers = users.map(extractUserInfo);
console.log(transformedUsers);

// Destructuring nei parametri di funzioni
const createFullName = ({ firstName, lastName, title = 'Mr.' }) => 
  `${title} ${firstName} ${lastName}`;

const person = { firstName: 'John', lastName: 'Doe' };
console.log(createFullName(person)); // Mr. John Doe

// ===== TEMPLATE LITERALS PER COMPOSIZIONE =====

// Template literals come function builders
const createTemplate = (template) => (data) => 
  template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || '');

const emailTemplate = createTemplate(`
  Ciao {{name}},
  Benvenuto in {{platform}}!
  Il tuo ID utente è: {{userId}}
`);

const userData = { name: 'Alice', platform: 'FunctionalJS', userId: '12345' };
console.log('=== Template Literals ===');
console.log(emailTemplate(userData));

// Query builder funzionale
const buildQuery = (table) => ({
  select: (fields) => ({
    where: (conditions) => ({
      orderBy: (field) => 
        `SELECT ${fields.join(', ')} FROM ${table} WHERE ${conditions} ORDER BY ${field}`
    })
  })
});

const query = buildQuery('users')
  .select(['name', 'email'])
  .where('age > 18')
  .orderBy('name');

console.log('Query:', query);

// ===== SPREAD/REST OPERATORS =====

// Immutable operations con spread
const updateObject = (obj) => (updates) => ({ ...obj, ...updates });
const addToArray = (arr) => (item) => [...arr, item];
const removeFromArray = (arr) => (index) => [
  ...arr.slice(0, index),
  ...arr.slice(index + 1)
];

console.log('=== Spread/Rest Operators ===');

const originalUser = { id: 1, name: 'Alice', age: 30 };
const updateUser = updateObject(originalUser);
const updatedUser = updateUser({ age: 31, city: 'Milano' });

console.log('Original:', originalUser);
console.log('Updated:', updatedUser);

// Rest parameters per funzioni variadic
const sum = (...numbers) => numbers.reduce((acc, num) => acc + num, 0);
const average = (...numbers) => sum(...numbers) / numbers.length;

console.log('Sum:', sum(1, 2, 3, 4, 5)); // 15
console.log('Average:', average(1, 2, 3, 4, 5)); // 3

// ===== OPTIONAL CHAINING E NULLISH COALESCING =====

// Safe navigation con optional chaining
const safeGet = (path) => (obj) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const getNestedValue = (obj, path, defaultValue = null) => 
  safeGet(path)(obj) ?? defaultValue;

console.log('=== Optional Chaining ===');

const complexObject = {
  user: {
    profile: {
      address: {
        city: 'Milano',
        country: 'Italy'
      }
    }
  }
};

console.log(getNestedValue(complexObject, 'user.profile.address.city')); // Milano
console.log(getNestedValue(complexObject, 'user.profile.phone', 'Not provided')); // Not provided

// Nullish coalescing per default values
const createConfig = (userConfig = {}) => ({
  theme: userConfig.theme ?? 'light',
  language: userConfig.language ?? 'en',
  notifications: userConfig.notifications ?? true,
  maxRetries: userConfig.maxRetries ?? 3
});

console.log('Config:', createConfig({ theme: 'dark' }));

// ===== ASYNC/AWAIT FUNCTIONAL PATTERNS =====

// Async composition
const asyncPipe = (...fns) => (value) => 
  fns.reduce(async (acc, fn) => fn(await acc), Promise.resolve(value));

const asyncCompose = (...fns) => (value) =>
  fns.reduceRight(async (acc, fn) => fn(await acc), Promise.resolve(value));

// Mock async functions
const fetchUserById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { id, name: `User ${id}`, email: `user${id}@example.com` };
};

const enrichUserWithPosts = async (user) => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return { ...user, posts: [`Post 1 by ${user.name}`, `Post 2 by ${user.name}`] };
};

const formatUserDisplay = async (user) => {
  return {
    display: `${user.name} (${user.email})`,
    postsCount: user.posts?.length || 0
  };
};

// Async pipeline
const processUser = asyncPipe(
  fetchUserById,
  enrichUserWithPosts,
  formatUserDisplay
);

console.log('=== Async/Await Patterns ===');
processUser(1).then(result => console.log('Processed user:', result));

// Async error handling
const withAsyncErrorHandling = (fn) => async (...args) => {
  try {
    return { success: true, data: await fn(...args) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const safeProcessUser = withAsyncErrorHandling(processUser);
safeProcessUser(999).then(result => console.log('Safe result:', result));

// ===== ES MODULES PATTERNS =====

// Re-export patterns per modularity
export const functionalUtils = {
  add,
  multiply,
  compose,
  extractUserInfo,
  createTemplate,
  updateObject,
  addToArray,
  removeFromArray,
  safeGet,
  getNestedValue,
  createConfig,
  asyncPipe,
  asyncCompose,
  withAsyncErrorHandling
};

// Named exports per tree shaking
export { 
  add, 
  multiply, 
  compose, 
  extractUserInfo, 
  createTemplate,
  updateObject,
  addToArray,
  removeFromArray,
  safeGet,
  getNestedValue,
  createConfig,
  asyncPipe,
  asyncCompose,
  withAsyncErrorHandling
};

// Default export per convenience
export default functionalUtils;

// ===== DYNAMIC IMPORTS =====

// Lazy loading di utility functions
export const loadAdvancedUtils = async () => {
  const { default: advancedUtils } = await import('./advanced-utils.js');
  return advancedUtils;
};

// Conditional loading
export const loadUtilsBasedOnFeature = async (featureFlag) => {
  if (featureFlag.enableAdvanced) {
    return await import('./advanced-utils.js');
  } else {
    return await import('./basic-utils.js');
  }
};

// ===== ESEMPI PRATICI =====

// Data transformation pipeline
const processApiResponse = compose(
  (data) => data.filter(item => item.active),
  (data) => data.map(extractUserInfo),
  (data) => data.sort((a, b) => a.displayName.localeCompare(b.displayName))
);

// Form validation con functional approach
const createValidator = (rules) => (data) => {
  const errors = {};
  
  Object.entries(rules).forEach(([field, validators]) => {
    const value = data[field];
    const fieldErrors = validators
      .map(validator => validator(value))
      .filter(Boolean);
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validators = {
  required: (value) => !value ? 'Campo obbligatorio' : null,
  email: (value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email non valida' : null,
  minLength: (min) => (value) => value && value.length < min ? `Minimo ${min} caratteri` : null
};

const userValidationRules = {
  name: [validators.required, validators.minLength(2)],
  email: [validators.required, validators.email]
};

const validateUser = createValidator(userValidationRules);

console.log('=== Validation Example ===');
console.log(validateUser({ name: 'A', email: 'invalid-email' }));
console.log(validateUser({ name: 'Alice', email: 'alice@example.com' }));

// State management funzionale
const createStore = (initialState) => {
  let state = initialState;
  const subscribers = [];

  return {
    getState: () => state,
    setState: (newState) => {
      state = { ...state, ...newState };
      subscribers.forEach(callback => callback(state));
    },
    subscribe: (callback) => {
      subscribers.push(callback);
      return () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) subscribers.splice(index, 1);
      };
    }
  };
};

const store = createStore({ count: 0, user: null });

store.subscribe((state) => console.log('State changed:', state));
store.setState({ count: 1 });
store.setState({ user: { name: 'Alice' } });

console.log('=== Store Example Complete ===');
