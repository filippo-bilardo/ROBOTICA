/**
 * MODULO 5: CURRYING E COMPOSIZIONE - ESERCIZIO 3
 * ===============================================
 * 
 * Progetti Pratici che Combinano Currying e Composizione
 * 
 * OBIETTIVI:
 * - Applicare currying e composizione in progetti reali
 * - Creare sistemi modulari e scalabili
 * - Implementare pattern funzionali avanzati
 * - Sviluppare pipeline complesse per casi d'uso reali
 */

console.log('=== PROGETTI PRATICI CURRYING + COMPOSIZIONE ===\n');

// ================================
// PROGETTO 1: SISTEMA DI VALIDAZIONE MODULARE
// ================================

console.log('PROGETTO 1: SISTEMA DI VALIDAZIONE MODULARE');
console.log('============================================');

/**
 * Sistema di validazione che combina currying per configurabilità
 * e composizione per creare validatori complessi
 */

// Base curry e compose utilities
const curry = (fn) => {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        } else {
            return function(...nextArgs) {
                return curried.apply(this, args.concat(nextArgs));
            };
        }
    };
};

const pipe = (...functions) => (value) => {
    return functions.reduce((acc, fn) => fn(acc), value);
};

// Result types per gestione errori
const Success = (value) => ({ isSuccess: true, value, errors: [] });
const Failure = (errors) => ({ isSuccess: false, value: null, errors: Array.isArray(errors) ? errors : [errors] });

// Validatori base curry
const required = curry((fieldName, value) => {
    return value !== null && value !== undefined && value.toString().trim() !== ''
        ? Success(value)
        : Failure(`${fieldName} è richiesto`);
});

const minLength = curry((min, fieldName, value) => {
    return value && value.length >= min
        ? Success(value)
        : Failure(`${fieldName} deve avere almeno ${min} caratteri`);
});

const maxLength = curry((max, fieldName, value) => {
    return value && value.length <= max
        ? Success(value)
        : Failure(`${fieldName} non può superare ${max} caratteri`);
});

const pattern = curry((regex, fieldName, value) => {
    return regex.test(value)
        ? Success(value)
        : Failure(`${fieldName} non ha un formato valido`);
});

const custom = curry((validatorFn, fieldName, value) => {
    try {
        return validatorFn(value)
            ? Success(value)
            : Failure(`${fieldName} non è valido`);
    } catch (error) {
        return Failure(`${fieldName}: ${error.message}`);
    }
});

// Combiner di validatori
const combineValidators = (...validators) => (value) => {
    const results = validators.map(validator => validator(value));
    const failures = results.filter(result => !result.isSuccess);
    
    if (failures.length > 0) {
        const allErrors = failures.flatMap(failure => failure.errors);
        return Failure(allErrors);
    }
    
    return Success(value);
};

// Validatori specifici pre-configurati
const validateEmail = combineValidators(
    required('Email'),
    pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email')
);

const validatePassword = combineValidators(
    required('Password'),
    minLength(8, 'Password'),
    pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password')
);

const validateUsername = combineValidators(
    required('Username'),
    minLength(3, 'Username'),
    maxLength(20, 'Username'),
    pattern(/^[a-zA-Z0-9_]+$/, 'Username')
);

const validateAge = combineValidators(
    required('Età'),
    custom(value => !isNaN(value) && value >= 0 && value <= 120, 'Età')
);

// Validatore di form completo
const validateForm = (formData) => {
    const validations = {
        email: validateEmail(formData.email),
        password: validatePassword(formData.password),
        username: validateUsername(formData.username),
        age: validateAge(formData.age)
    };
    
    const errors = {};
    let isValid = true;
    
    for (const [field, result] of Object.entries(validations)) {
        if (!result.isSuccess) {
            errors[field] = result.errors;
            isValid = false;
        }
    }
    
    return { isValid, errors, data: isValid ? formData : null };
};

// Test del sistema di validazione
console.log('\n=== Test Sistema Validazione ===');

const validFormData = {
    email: 'user@example.com',
    password: 'Password123',
    username: 'user_123',
    age: '25'
};

const invalidFormData = {
    email: 'invalid-email',
    password: '123',
    username: 'u',
    age: '150'
};

console.log('Form valido:', validateForm(validFormData));
console.log('Form non valido:', validateForm(invalidFormData));

// ================================
// PROGETTO 2: SISTEMA DI ELABORAZIONE DATI
// ================================

console.log('\n\nPROGETTO 2: SISTEMA DI ELABORAZIONE DATI');
console.log('=========================================');

/**
 * Sistema per elaborare dati provenienti da diverse fonti
 * con pipeline configurabili
 */

// Utility functions curry
const map = curry((fn, array) => array.map(fn));
const filter = curry((predicate, array) => array.filter(predicate));
const reduce = curry((fn, initial, array) => array.reduce(fn, initial));
const sort = curry((compareFn, array) => [...array].sort(compareFn));

// Trasformatori dati
const addField = curry((fieldName, valueFunc, obj) => ({
    ...obj,
    [fieldName]: valueFunc(obj)
}));

const removeField = curry((fieldName, obj) => {
    const { [fieldName]: removed, ...rest } = obj;
    return rest;
});

const transformField = curry((fieldName, transformer, obj) => ({
    ...obj,
    [fieldName]: transformer(obj[fieldName])
}));

const renameField = curry((oldName, newName, obj) => {
    const { [oldName]: value, ...rest } = obj;
    return { ...rest, [newName]: value };
});

// Aggregatori
const groupBy = curry((keyFunc, array) => {
    return array.reduce((groups, item) => {
        const key = keyFunc(item);
        groups[key] = groups[key] || [];
        groups[key].push(item);
        return groups;
    }, {});
});

const summarizeGroup = (aggregators) => (group) => {
    const summary = {};
    for (const [key, aggregator] of Object.entries(aggregators)) {
        summary[key] = aggregator(group);
    }
    return summary;
};

// Aggregatori comuni
const sum = (field) => (array) => array.reduce((sum, item) => sum + (item[field] || 0), 0);
const avg = (field) => (array) => {
    const total = sum(field)(array);
    return array.length > 0 ? total / array.length : 0;
};
const count = (array) => array.length;
const min = (field) => (array) => Math.min(...array.map(item => item[field] || Infinity));
const max = (field) => (array) => Math.max(...array.map(item => item[field] || -Infinity));

// Factory per pipeline di elaborazione
const createDataPipeline = (config) => {
    const operations = [];
    
    // Filtri
    if (config.filters) {
        config.filters.forEach(filterFunc => {
            operations.push(filter(filterFunc));
        });
    }
    
    // Trasformazioni
    if (config.transforms) {
        config.transforms.forEach(transform => {
            operations.push(map(transform));
        });
    }
    
    // Ordinamento
    if (config.sort) {
        operations.push(sort(config.sort));
    }
    
    // Raggruppamento e aggregazione
    if (config.groupBy) {
        operations.push(groupBy(config.groupBy));
        if (config.aggregators) {
            operations.push(groups => {
                const result = {};
                for (const [key, group] of Object.entries(groups)) {
                    result[key] = summarizeGroup(config.aggregators)(group);
                }
                return result;
            });
        }
    }
    
    // Limite
    if (config.limit) {
        operations.push(array => Array.isArray(array) ? array.slice(0, config.limit) : array);
    }
    
    return pipe(...operations);
};

// Dataset di esempio
const salesData = [
    { id: 1, product: 'Laptop', category: 'Electronics', price: 1200, quantity: 2, date: '2024-01-15', region: 'Nord', salesperson: 'Mario' },
    { id: 2, product: 'Mouse', category: 'Electronics', price: 25, quantity: 10, date: '2024-01-16', region: 'Sud', salesperson: 'Giulia' },
    { id: 3, product: 'Desk', category: 'Furniture', price: 300, quantity: 1, date: '2024-01-17', region: 'Nord', salesperson: 'Mario' },
    { id: 4, product: 'Chair', category: 'Furniture', price: 150, quantity: 4, date: '2024-01-18', region: 'Centro', salesperson: 'Luca' },
    { id: 5, product: 'Keyboard', category: 'Electronics', price: 80, quantity: 5, date: '2024-01-19', region: 'Sud', salesperson: 'Giulia' },
    { id: 6, product: 'Monitor', category: 'Electronics', price: 400, quantity: 3, date: '2024-01-20', region: 'Nord', salesperson: 'Mario' }
];

// Pipeline 1: Analisi vendite per categoria
const salesByCategory = createDataPipeline({
    transforms: [
        addField('total', item => item.price * item.quantity)
    ],
    groupBy: item => item.category,
    aggregators: {
        totalSales: sum('total'),
        averagePrice: avg('price'),
        totalQuantity: sum('quantity'),
        itemCount: count
    }
});

// Pipeline 2: Top performer per regione
const topPerformersByRegion = createDataPipeline({
    transforms: [
        addField('total', item => item.price * item.quantity)
    ],
    groupBy: item => item.region,
    aggregators: {
        totalSales: sum('total'),
        salesCount: count,
        topSalesperson: group => {
            const salesByPerson = group.reduce((acc, sale) => {
                acc[sale.salesperson] = (acc[sale.salesperson] || 0) + sale.total;
                return acc;
            }, {});
            return Object.entries(salesByPerson).reduce((top, [person, sales]) => 
                sales > top.sales ? { person, sales } : top
            , { person: '', sales: 0 });
        }
    }
});

// Pipeline 3: Prodotti Electronics costosi
const expensiveElectronics = createDataPipeline({
    filters: [
        item => item.category === 'Electronics',
        item => item.price > 50
    ],
    transforms: [
        addField('total', item => item.price * item.quantity),
        transformField('product', name => name.toUpperCase())
    ],
    sort: (a, b) => b.total - a.total,
    limit: 5
});

console.log('\n=== Risultati Elaborazione Dati ===');
console.log('Vendite per categoria:', salesByCategory(salesData));
console.log('Top performers per regione:', topPerformersByRegion(salesData));
console.log('Electronics costosi:', expensiveElectronics(salesData));

// ================================
// PROGETTO 3: SISTEMA DI CONFIGURAZIONE API
// ================================

console.log('\n\nPROGETTO 3: SISTEMA DI CONFIGURAZIONE API');
console.log('==========================================');

/**
 * Sistema per creare client API configurabili usando currying
 * e composizione per middleware e trasformazioni
 */

// Base API client
const createApiClient = (baseConfig) => {
    const makeRequest = curry((method, endpoint, options = {}) => {
        const url = `${baseConfig.baseURL}${endpoint}`;
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...baseConfig.headers,
                ...options.headers
            },
            ...options
        };
        
        // Simulazione request
        console.log(`${method} ${url}`, config);
        return Promise.resolve({
            status: 200,
            data: { message: 'Success', endpoint, method }
        });
    });
    
    return {
        get: makeRequest('GET'),
        post: makeRequest('POST'),
        put: makeRequest('PUT'),
        delete: makeRequest('DELETE')
    };
};

// Middleware curry
const withAuth = curry((token, requestFunc) => (...args) => {
    const [method, endpoint, options = {}] = args;
    const authOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    };
    return requestFunc(method, endpoint, authOptions);
});

const withRetry = curry((maxRetries, requestFunc) => async (...args) => {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await requestFunc(...args);
        } catch (error) {
            lastError = error;
            if (i < maxRetries) {
                console.log(`Retry ${i + 1}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * i));
            }
        }
    }
    throw lastError;
});

const withLogging = curry((logger, requestFunc) => (...args) => {
    const [method, endpoint] = args;
    logger(`API Call: ${method} ${endpoint}`);
    return requestFunc(...args);
});

const withCache = curry((cache, requestFunc) => async (...args) => {
    const [method, endpoint] = args;
    if (method === 'GET') {
        const cacheKey = `${method}:${endpoint}`;
        if (cache.has(cacheKey)) {
            console.log('Cache hit:', cacheKey);
            return cache.get(cacheKey);
        }
        const result = await requestFunc(...args);
        cache.set(cacheKey, result);
        return result;
    }
    return requestFunc(...args);
});

// Composizione middleware
const createEnhancedApiClient = (baseConfig, middlewares = []) => {
    const client = createApiClient(baseConfig);
    
    const enhancedMethods = {};
    for (const [method, requestFunc] of Object.entries(client)) {
        enhancedMethods[method] = middlewares.reduce(
            (func, middleware) => middleware(func),
            requestFunc
        );
    }
    
    return enhancedMethods;
};

// Factory per client specifici
const createUserApiClient = (config) => {
    const middlewares = [
        withAuth(config.token),
        withRetry(3),
        withLogging(console.log),
        withCache(new Map())
    ];
    
    const client = createEnhancedApiClient({
        baseURL: 'https://api.example.com/v1',
        headers: { 'X-API-Version': '1.0' }
    }, middlewares);
    
    // Metodi specifici per utenti
    return {
        getUser: client.get('/users/{id}'),
        getUserProfile: client.get('/users/{id}/profile'),
        updateUser: client.put('/users/{id}'),
        createUser: client.post('/users'),
        deleteUser: client.delete('/users/{id}')
    };
};

// Test API client
console.log('\n=== Test API Client ===');

const userApi = createUserApiClient({ token: 'abc123' });

// Simulazione chiamate
setTimeout(async () => {
    try {
        await userApi.getUser('/123');
        await userApi.getUserProfile('/123');
        await userApi.updateUser('/123', { body: JSON.stringify({ name: 'Updated' }) });
    } catch (error) {
        console.error('API Error:', error);
    }
}, 100);

// ================================
// PROGETTO 4: SISTEMA DI REPORTING
// ================================

console.log('\n\nPROGETTO 4: SISTEMA DI REPORTING');
console.log('=================================');

/**
 * Sistema di reporting che usa composizione per creare
 * report configurabili e riusabili
 */

// Generatori di report curry
const createReportGenerator = curry((title, dataProcessor, formatter) => (data) => {
    const processedData = dataProcessor(data);
    return formatter(title, processedData);
});

// Processori dati
const topItemsProcessor = curry((key, limit, sortBy, data) => {
    return data
        .sort((a, b) => b[sortBy] - a[sortBy])
        .slice(0, limit)
        .map(item => ({ [key]: item[key], value: item[sortBy] }));
});

const summaryProcessor = curry((groupKey, valueKey, data) => {
    const grouped = groupBy(item => item[groupKey])(data);
    const summary = {};
    for (const [key, group] of Object.entries(grouped)) {
        summary[key] = {
            count: group.length,
            total: sum(valueKey)(group),
            average: avg(valueKey)(group)
        };
    }
    return summary;
});

const trendProcessor = curry((dateKey, valueKey, data) => {
    const sorted = data.sort((a, b) => new Date(a[dateKey]) - new Date(b[dateKey]));
    return sorted.map(item => ({
        date: item[dateKey],
        value: item[valueKey]
    }));
});

// Formatter
const tableFormatter = curry((title, data) => {
    let output = `\n=== ${title} ===\n`;
    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            output += `${index + 1}. ${Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
        });
    } else {
        for (const [key, value] of Object.entries(data)) {
            output += `${key}: ${JSON.stringify(value, null, 2)}\n`;
        }
    }
    return output;
});

const jsonFormatter = curry((title, data) => {
    return {
        title,
        timestamp: new Date().toISOString(),
        data
    };
});

// Report generators specifici
const topProductsReport = createReportGenerator(
    'Top 5 Prodotti per Fatturato',
    pipe(
        map(addField('revenue', item => item.price * item.quantity)),
        topItemsProcessor('product', 5, 'revenue')
    ),
    tableFormatter
);

const salesSummaryReport = createReportGenerator(
    'Riepilogo Vendite per Regione',
    pipe(
        map(addField('revenue', item => item.price * item.quantity)),
        summaryProcessor('region', 'revenue')
    ),
    jsonFormatter
);

const salesTrendReport = createReportGenerator(
    'Trend Vendite Giornaliere',
    pipe(
        map(addField('revenue', item => item.price * item.quantity)),
        trendProcessor('date', 'revenue')
    ),
    tableFormatter
);

// Generazione reports
console.log('\n=== Generazione Reports ===');

console.log(topProductsReport(salesData));
console.log('Sales Summary JSON:', salesSummaryReport(salesData));
console.log(salesTrendReport(salesData));

// Report aggregato
const generateDashboard = pipe(
    data => ({
        topProducts: topProductsReport(data),
        salesSummary: salesSummaryReport(data),
        salesTrend: salesTrendReport(data),
        timestamp: new Date().toISOString()
    })
);

const dashboard = generateDashboard(salesData);
console.log('\n=== Dashboard Completo ===');
console.log('Dashboard generato con', Object.keys(dashboard).length, 'sezioni');

console.log('\n=== FINE PROGETTI PRATICI ===');

/**
 * RIEPILOGO PROGETTI:
 * 
 * PROGETTO 1 - Sistema Validazione:
 * - Currying per configurabilità validatori
 * - Composizione per validatori complessi
 * - Gestione errori funzionale
 * 
 * PROGETTO 2 - Elaborazione Dati:
 * - Pipeline configurabili
 * - Trasformazioni componibili
 * - Factory pattern funzionale
 * 
 * PROGETTO 3 - API Client:
 * - Middleware componibili
 * - Configurazione tramite currying
 * - Composizione per funzionalità aggiuntive
 * 
 * PROGETTO 4 - Sistema Reporting:
 * - Processori dati modulari
 * - Formatter intercambiabili
 * - Report generator configurabili
 * 
 * BENEFICI CHIAVE:
 * - Modularità e riusabilità
 * - Facilità di testing
 * - Configurabilità flessibile
 * - Codice dichiarativo e leggibile
 * - Manutenibilità elevata
 */
