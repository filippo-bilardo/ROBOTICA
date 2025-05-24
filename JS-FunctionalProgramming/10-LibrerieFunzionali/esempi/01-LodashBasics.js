/**
 * Esempi Base con Lodash/FP
 * Questo file contiene esempi pratici di utilizzo di Lodash/FP
 * per operazioni funzionali comuni in JavaScript.
 */

// Installazione: npm install lodash lodash-fp
import { 
  pipe, flow, map, filter, reduce, groupBy, 
  sortBy, take, drop, uniq, flatten, chunk,
  get, set, pick, omit, merge, defaults,
  curry, partial, when, unless, cond, matches
} from 'lodash/fp';

// ==========================================
// DATI DI ESEMPIO
// ==========================================

const users = [
  { id: 1, name: 'Alice', age: 25, department: 'IT', salary: 5000, active: true },
  { id: 2, name: 'Bob', age: 30, department: 'IT', salary: 6000, active: false },
  { id: 3, name: 'Charlie', age: 35, department: 'HR', salary: 4500, active: true },
  { id: 4, name: 'Diana', age: 28, department: 'Marketing', salary: 5500, active: true },
  { id: 5, name: 'Eve', age: 32, department: 'HR', salary: 4800, active: false }
];

const products = [
  { id: 1, name: 'Laptop', category: 'Electronics', price: 999, inStock: true },
  { id: 2, name: 'Book', category: 'Education', price: 29, inStock: true },
  { id: 3, name: 'Headphones', category: 'Electronics', price: 199, inStock: false },
  { id: 4, name: 'Desk', category: 'Furniture', price: 299, inStock: true },
  { id: 5, name: 'Notebook', category: 'Education', price: 15, inStock: true }
];

// ==========================================
// OPERAZIONI SU ARRAY
// ==========================================

console.log('=== OPERAZIONI SU ARRAY ===');

// 1. Pipeline base: filtra, trasforma, ordina
const getActiveUserNames = pipe(
  filter({ active: true }),
  map('name'),
  sortBy(name => name.toLowerCase())
);

console.log('Active users:', getActiveUserNames(users));
// Output: ['Alice', 'Charlie', 'Diana']

// 2. Aggregazione per dipartimento
const salaryByDepartment = pipe(
  filter({ active: true }),
  groupBy('department'),
  map(users => ({ 
    users: map('name', users),
    totalSalary: reduce((sum, user) => sum + user.salary, 0, users),
    avgSalary: users.length > 0 ? reduce((sum, user) => sum + user.salary, 0, users) / users.length : 0
  }))
);

console.log('Salary by department:', salaryByDepartment(users));

// 3. Top performer per dipartimento
const getTopPerformers = pipe(
  groupBy('department'),
  map(pipe(
    sortBy('salary'),
    take(1),
    map(pick(['name', 'salary']))
  )),
  flatten
);

console.log('Top performers:', getTopPerformers(users));

// ==========================================
// OPERAZIONI SU OGGETTI
// ==========================================

console.log('\\n=== OPERAZIONI SU OGGETTI ===');

const userProfile = {
  id: 1,
  personal: {
    name: 'Alice',
    age: 25,
    email: 'alice@example.com'
  },
  preferences: {
    theme: 'dark',
    notifications: true,
    language: 'en'
  },
  metadata: {
    createdAt: '2024-01-01',
    lastLogin: '2024-05-20'
  }
};

// 1. Accesso sicuro ai dati annidati
const getEmail = get('personal.email');
const getTheme = get('preferences.theme');
const getLastLogin = get('metadata.lastLogin');

console.log('Email:', getEmail(userProfile));
console.log('Theme:', getTheme(userProfile));

// 2. Trasformazioni immutabili
const updateProfile = pipe(
  set('personal.age', 26),
  set('preferences.theme', 'light'),
  set('metadata.lastLogin', new Date().toISOString())
);

const updatedProfile = updateProfile(userProfile);
console.log('Original age:', userProfile.personal.age); // 25
console.log('Updated age:', updatedProfile.personal.age); // 26

// 3. Merge con defaults
const defaultPreferences = {
  theme: 'light',
  notifications: false,
  language: 'en',
  autoSave: true
};

const withDefaultPrefs = pipe(
  get('preferences'),
  prefs => defaults(defaultPreferences, prefs)
);

console.log('Preferences with defaults:', withDefaultPrefs(userProfile));

// ==========================================
// COMPOSIZIONE E CURRY
// ==========================================

console.log('\\n=== COMPOSIZIONE E CURRY ===');

// 1. Funzioni curried personalizzate
const filterByProperty = curry((prop, value, array) => 
  filter(item => item[prop] === value, array)
);

const filterByDepartment = filterByProperty('department');
const filterByActive = filterByProperty('active');

const itUsers = filterByDepartment('IT', users);
const activeUsers = filterByActive(true, users);

console.log('IT users:', map('name', itUsers));
console.log('Active users:', map('name', activeUsers));

// 2. Composizione di predicati
const isExpensive = product => product.price > 100;
const isInStock = product => product.inStock;
const isElectronics = product => product.category === 'Electronics';

const getExpensiveElectronicsInStock = pipe(
  filter(isExpensive),
  filter(isInStock),
  filter(isElectronics),
  map(pick(['name', 'price']))
);

console.log('Expensive electronics in stock:', getExpensiveElectronicsInStock(products));

// 3. Funzioni di utilità riusabili
const calculateDiscount = curry((discountRate, product) => 
  set('discountedPrice', product.price * (1 - discountRate), product)
);

const apply10PercentDiscount = calculateDiscount(0.1);
const apply20PercentDiscount = calculateDiscount(0.2);

const discountedProducts = map(apply10PercentDiscount, products);
console.log('Products with 10% discount:', map(pick(['name', 'price', 'discountedPrice']), discountedProducts));

// ==========================================
// LOGICA CONDIZIONALE
// ==========================================

console.log('\\n=== LOGICA CONDIZIONALE ===');

// 1. when/unless per logica condizionale
const processUser = pipe(
  when(get('active'), set('status', 'ACTIVE')),
  unless(get('active'), set('status', 'INACTIVE')),
  when(user => user.age < 30, set('category', 'YOUNG')),
  when(user => user.age >= 30, set('category', 'EXPERIENCED'))
);

const processedUsers = map(processUser, users);
console.log('Processed users:', map(pick(['name', 'active', 'status', 'category']), processedUsers));

// 2. cond per switch-like logic
const getCategoryByAge = cond([
  [user => user.age < 25, () => 'JUNIOR'],
  [user => user.age < 35, () => 'MID'],
  [user => true, () => 'SENIOR']
]);

const usersWithCategory = map(user => 
  set('ageCategory', getCategoryByAge(user), user), users
);

console.log('Users with age category:', map(pick(['name', 'age', 'ageCategory']), usersWithCategory));

// 3. Validation con matches
const validators = {
  isValidUser: matches({ active: true }),
  isManager: user => user.salary > 5000,
  hasEmail: user => user.email && user.email.includes('@')
};

const validateUser = user => ({
  ...user,
  isValid: validators.isValidUser(user),
  isManager: validators.isManager(user)
});

console.log('Validated users:', map(validateUser, users));

// ==========================================
// PIPELINE COMPLESSE
// ==========================================

console.log('\\n=== PIPELINE COMPLESSE ===');

// 1. Analisi completa dei dati utente
const analyzeUsers = pipe(
  groupBy('department'),
  map(departmentUsers => ({
    count: departmentUsers.length,
    activeCount: filter({ active: true }, departmentUsers).length,
    avgSalary: departmentUsers.length > 0 
      ? reduce((sum, user) => sum + user.salary, 0, departmentUsers) / departmentUsers.length 
      : 0,
    topEarner: pipe(
      sortBy('salary'),
      take(1),
      map(pick(['name', 'salary'])),
      get(0)
    )(departmentUsers)
  }))
);

console.log('Department analysis:', analyzeUsers(users));

// 2. E-commerce product processing
const processProducts = pipe(
  filter({ inStock: true }),
  groupBy('category'),
  map(categoryProducts => {
    const sorted = sortBy('price', categoryProducts);
    return {
      count: sorted.length,
      priceRange: {
        min: get('price', sorted[0]),
        max: get('price', sorted[sorted.length - 1])
      },
      avgPrice: reduce((sum, product) => sum + product.price, 0, sorted) / sorted.length,
      products: map(pick(['name', 'price']), sorted)
    };
  })
);

console.log('Product analysis:', processProducts(products));

// ==========================================
// UTILITÀ AVANZATE
// ==========================================

console.log('\\n=== UTILITÀ AVANZATE ===');

// 1. Chunking e batching
const chunkUsers = chunk(2, users);
console.log('Users in chunks of 2:', chunkUsers);

// 2. Unique values
const departments = pipe(
  map('department'),
  uniq
)(users);
console.log('Unique departments:', departments);

// 3. Flattening nested data
const userSkills = [
  { name: 'Alice', skills: ['JavaScript', 'React'] },
  { name: 'Bob', skills: ['Python', 'Django', 'PostgreSQL'] },
  { name: 'Charlie', skills: ['Java', 'Spring'] }
];

const allSkills = pipe(
  map('skills'),
  flatten,
  uniq
)(userSkills);

console.log('All unique skills:', allSkills);

// 4. Partial application per configurazione
const createEmailFormatter = (domain) => 
  partial(set, ['email'])(`user@${domain}`);

const addCompanyEmail = createEmailFormatter('company.com');
const usersWithEmail = map(addCompanyEmail, users);

console.log('Users with company email:', map(pick(['name', 'email']), usersWithEmail));

// ==========================================
// ESEMPI REAL-WORLD
// ==========================================

console.log('\\n=== ESEMPI REAL-WORLD ===');

// 1. Data transformation per API response
const transformApiResponse = pipe(
  get('data.users'),
  filter({ status: 'active' }),
  map(pipe(
    pick(['id', 'profile.name', 'profile.email', 'preferences']),
    user => ({
      id: user.id,
      name: get('profile.name', user),
      email: get('profile.email', user),
      preferences: defaults({
        theme: 'light',
        notifications: true
      }, get('preferences', user))
    })
  ))
);

const apiResponse = {
  data: {
    users: [
      { 
        id: 1, 
        status: 'active', 
        profile: { name: 'Alice', email: 'alice@example.com' },
        preferences: { theme: 'dark' }
      },
      { 
        id: 2, 
        status: 'inactive', 
        profile: { name: 'Bob', email: 'bob@example.com' }
      }
    ]
  }
};

console.log('Transformed API response:', transformApiResponse(apiResponse));

// 2. Form validation
const formValidationRules = {
  name: value => value && value.length > 2,
  email: value => value && value.includes('@'),
  age: value => value && value >= 18
};

const validateForm = (rules) => (formData) => 
  pipe(
    Object.keys,
    map(field => ({
      field,
      value: get(field, formData),
      isValid: rules[field] ? rules[field](get(field, formData)) : true
    })),
    groupBy('isValid')
  )(rules);

const validateUserForm = validateForm(formValidationRules);
const formData = { name: 'Al', email: 'invalid-email', age: 25 };

console.log('Form validation result:', validateUserForm(formData));

export {
  getActiveUserNames,
  salaryByDepartment,
  updateProfile,
  processProducts,
  analyzeUsers,
  validateUserForm
};
