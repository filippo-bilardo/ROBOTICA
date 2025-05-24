/**
 * MODULO 5: CURRYING E COMPOSIZIONE - SOLUZIONI COMPLETE
 * ======================================================
 * 
 * Soluzioni dettagliate e spiegazioni per tutti gli esercizi
 * del modulo Currying e Composizione
 */

console.log('=== SOLUZIONI COMPLETE CURRYING E COMPOSIZIONE ===\n');

// ================================
// SOLUZIONI CURRYING
// ================================

console.log('SOLUZIONI CURRYING');
console.log('==================');

/**
 * SOLUZIONE 1: Implementazione Curry Base
 */
console.log('\n1. Implementazione Curry Base:');

// Curry manuale - trasforma f(a,b,c) in f(a)(b)(c)
const manualCurry = (fn) => {
    return (a) => (b) => (c) => fn(a, b, c);
};

// Curry automatico - funziona con qualsiasi arità
const autoCurry = (fn) => {
    return function curried(...args) {
        // Se abbiamo abbastanza argomenti, esegui la funzione
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        } else {
            // Altrimenti restituisci una nuova funzione che aspetta più argomenti
            return function(...nextArgs) {
                return curried.apply(this, args.concat(nextArgs));
            };
        }
    };
};

// Test implementazioni
const add3 = (a, b, c) => a + b + c;
const curriedAdd3Manual = manualCurry(add3);
const curriedAdd3Auto = autoCurry(add3);

console.log('Curry manuale:', curriedAdd3Manual(1)(2)(3)); // 6
console.log('Curry automatico:', curriedAdd3Auto(1)(2)(3)); // 6
console.log('Curry automatico parziale:', curriedAdd3Auto(1, 2)(3)); // 6

/**
 * SPIEGAZIONE TECNICA CURRY:
 * 
 * Il currying trasforma una funzione con N parametri in una catena di N funzioni
 * che accettano un parametro ciascuna. Questo permette:
 * 
 * 1. APPLICAZIONE PARZIALE: Creare versioni specializzate
 * 2. RIUSABILITÀ: Funzioni configurabili e riutilizzabili
 * 3. COMPOSIZIONE: Funzioni più facili da comporre
 * 4. POINT-FREE STYLE: Codice più dichiarativo
 */

/**
 * SOLUZIONE 2: Currying Avanzato con Placeholder
 */
console.log('\n2. Currying Avanzato con Placeholder:');

const _ = Symbol('placeholder');

const curryWithPlaceholder = (fn) => {
    return function curried(...args) {
        // Controlla se ci sono placeholder
        const hasPlaceholder = args.some(arg => arg === _);
        const filledArgs = args.filter(arg => arg !== _);
        
        // Se non ci sono placeholder e abbiamo abbastanza argomenti
        if (!hasPlaceholder && args.length >= fn.length) {
            return fn.apply(this, args);
        }
        
        // Restituisci funzione che gestisce placeholder
        return (...nextArgs) => {
            let nextArgIndex = 0;
            const newArgs = args.map(arg => 
                arg === _ ? nextArgs[nextArgIndex++] : arg
            );
            // Aggiungi argomenti rimanenti
            return curried(...newArgs, ...nextArgs.slice(nextArgIndex));
        };
    };
};

const subtract = (a, b, c) => a - b - c;
const curriedSubtract = curryWithPlaceholder(subtract);

console.log('Con placeholder:', curriedSubtract(10, _, 2)(3)); // 10 - 3 - 2 = 5
console.log('Placeholder multipli:', curriedSubtract(_, 3, _)(10, 2)); // 10 - 3 - 2 = 5

/**
 * SOLUZIONE 3: Curry per Array Methods
 */
console.log('\n3. Curry per Array Methods:');

const map = autoCurry((fn, array) => array.map(fn));
const filter = autoCurry((predicate, array) => array.filter(predicate));
const reduce = autoCurry((fn, initial, array) => array.reduce(fn, initial));

// Creazione di utility specializzate
const double = map(x => x * 2);
const isEven = filter(x => x % 2 === 0);
const sum = reduce((acc, curr) => acc + curr, 0);

const numbers = [1, 2, 3, 4, 5, 6];
console.log('Originali:', numbers);
console.log('Doppi:', double(numbers));
console.log('Pari:', isEven(numbers));
console.log('Somma:', sum(numbers));

// ================================
// SOLUZIONI COMPOSIZIONE
// ================================

console.log('\n\nSOLUZIONI COMPOSIZIONE');
console.log('=======================');

/**
 * SOLUZIONE 1: Compose e Pipe
 */
console.log('\n1. Compose e Pipe:');

// Compose: applica funzioni da destra a sinistra f(g(h(x)))
const compose = (...functions) => (value) => {
    return functions.reduceRight((acc, fn) => fn(acc), value);
};

// Pipe: applica funzioni da sinistra a destra h(g(f(x)))
const pipe = (...functions) => (value) => {
    return functions.reduce((acc, fn) => fn(acc), value);
};

// Funzioni di test
const addOne = x => x + 1;
const multiplyByTwo = x => x * 2;
const square = x => x * x;

// Esempi di composizione
const addThenMultiply = compose(multiplyByTwo, addOne); // (x + 1) * 2
const addThenMultiplyPipe = pipe(addOne, multiplyByTwo); // (x + 1) * 2

console.log('Compose (5):', addThenMultiply(5)); // (5 + 1) * 2 = 12
console.log('Pipe (5):', addThenMultiplyPipe(5)); // (5 + 1) * 2 = 12

/**
 * SPIEGAZIONE TECNICA COMPOSIZIONE:
 * 
 * La composizione di funzioni combina funzioni semplici per creare funzioni complesse.
 * 
 * COMPOSE vs PIPE:
 * - Compose: Matematicamente naturale f∘g(x) = f(g(x))
 * - Pipe: Più leggibile per pipeline di dati
 * 
 * VANTAGGI:
 * - Modularità: Funzioni piccole e testabili
 * - Riusabilità: Combinazioni infinite
 * - Leggibilità: Pipeline dichiarative
 * - Debugging: Facile isolare problemi
 */

/**
 * SOLUZIONE 2: Composizione Asincrona
 */
console.log('\n2. Composizione Asincrona:');

const composeAsync = (...functions) => (value) => {
    return functions.reduceRight(async (acc, fn) => {
        const resolvedAcc = await acc;
        return fn(resolvedAcc);
    }, Promise.resolve(value));
};

const pipeAsync = (...functions) => (value) => {
    return functions.reduce(async (acc, fn) => {
        const resolvedAcc = await acc;
        return fn(resolvedAcc);
    }, Promise.resolve(value));
};

// Funzioni asincrone di esempio
const asyncAddOne = async (x) => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return x + 1;
};

const asyncMultiplyByTwo = async (x) => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return x * 2;
};

// Test composizione asincrona
const asyncPipeline = pipeAsync(asyncAddOne, asyncMultiplyByTwo);

asyncPipeline(5).then(result => {
    console.log('Risultato asincrono:', result); // (5 + 1) * 2 = 12
});

/**
 * SOLUZIONE 3: Composizione con Gestione Errori
 */
console.log('\n3. Composizione con Gestione Errori:');

// Result type per gestione errori funzionale
const Ok = (value) => ({ isOk: true, value, error: null });
const Err = (error) => ({ isOk: false, value: null, error });

const composeWithErrorHandling = (...functions) => (value) => {
    return functions.reduce((acc, fn) => {
        if (!acc.isOk) return acc; // Propaga l'errore
        
        try {
            const result = fn(acc.value);
            // Se la funzione restituisce già un Result, usalo
            return result && typeof result.isOk === 'boolean' ? result : Ok(result);
        } catch (error) {
            return Err(error.message);
        }
    }, Ok(value));
};

// Funzioni con possibili errori
const safeDivide = (x) => {
    if (x === 0) return Err('Divisione per zero');
    return Ok(10 / x);
};

const safeSqrt = (x) => {
    if (x < 0) return Err('Radice di numero negativo');
    return Ok(Math.sqrt(x));
};

const safeLog = (x) => {
    if (x <= 0) return Err('Logaritmo di numero non positivo');
    return Ok(Math.log(x));
};

// Pipeline sicura
const safePipeline = composeWithErrorHandling(safeLog, safeSqrt, safeDivide);

console.log('Pipeline sicura (2):', safePipeline(2)); // Ok
console.log('Pipeline sicura (0):', safePipeline(0)); // Err: Divisione per zero

// ================================
// SOLUZIONI PROGETTI PRATICI
// ================================

console.log('\n\nSOLUZIONI PROGETTI PRATICI');
console.log('===========================');

/**
 * SOLUZIONE 1: Sistema di Validazione Modulare
 */
console.log('\n1. Sistema di Validazione Modulare:');

// Implementazione completa del sistema di validazione
class ValidationSystem {
    constructor() {
        this.validators = new Map();
    }
    
    // Registra un validatore
    registerValidator(name, validatorFn) {
        this.validators.set(name, autoCurry(validatorFn));
        return this;
    }
    
    // Crea una regola di validazione
    createRule(validatorName, ...config) {
        const validator = this.validators.get(validatorName);
        if (!validator) throw new Error(`Validator ${validatorName} not found`);
        return validator(...config);
    }
    
    // Combina multiple regole
    combineRules(...rules) {
        return (value) => {
            const results = rules.map(rule => rule(value));
            const failures = results.filter(result => !result.isValid);
            
            if (failures.length > 0) {
                return { 
                    isValid: false, 
                    errors: failures.flatMap(f => f.errors) 
                };
            }
            
            return { isValid: true, errors: [] };
        };
    }
}

// Esempio d'uso del sistema
const validationSystem = new ValidationSystem();

// Registrazione validatori base
validationSystem
    .registerValidator('required', (fieldName, value) => {
        const isValid = value !== null && value !== undefined && value.toString().trim() !== '';
        return { 
            isValid, 
            errors: isValid ? [] : [`${fieldName} è richiesto`] 
        };
    })
    .registerValidator('minLength', (min, fieldName, value) => {
        const isValid = value && value.length >= min;
        return { 
            isValid, 
            errors: isValid ? [] : [`${fieldName} deve avere almeno ${min} caratteri`] 
        };
    })
    .registerValidator('pattern', (regex, fieldName, value) => {
        const isValid = regex.test(value);
        return { 
            isValid, 
            errors: isValid ? [] : [`${fieldName} non ha un formato valido`] 
        };
    });

// Creazione regole specifiche
const emailValidator = validationSystem.combineRules(
    validationSystem.createRule('required', 'Email'),
    validationSystem.createRule('pattern', /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email')
);

console.log('Validazione email valida:', emailValidator('user@example.com'));
console.log('Validazione email non valida:', emailValidator('invalid-email'));

/**
 * SOLUZIONE 2: Pipeline di Elaborazione Dati Avanzata
 */
console.log('\n2. Pipeline di Elaborazione Dati Avanzata:');

// Factory per pipeline configurabili
class DataPipelineFactory {
    constructor() {
        this.operations = new Map();
        this.registerDefaultOperations();
    }
    
    registerDefaultOperations() {
        this.operations.set('map', autoCurry((fn, data) => data.map(fn)));
        this.operations.set('filter', autoCurry((predicate, data) => data.filter(predicate)));
        this.operations.set('reduce', autoCurry((fn, initial, data) => data.reduce(fn, initial)));
        this.operations.set('sort', autoCurry((compareFn, data) => [...data].sort(compareFn)));
        this.operations.set('groupBy', autoCurry((keyFn, data) => {
            return data.reduce((groups, item) => {
                const key = keyFn(item);
                groups[key] = groups[key] || [];
                groups[key].push(item);
                return groups;
            }, {});
        }));
        this.operations.set('take', autoCurry((n, data) => data.slice(0, n)));
        this.operations.set('skip', autoCurry((n, data) => data.slice(n)));
    }
    
    createPipeline(config) {
        const steps = [];
        
        for (const step of config) {
            const { operation, params = [] } = step;
            const operationFn = this.operations.get(operation);
            
            if (!operationFn) {
                throw new Error(`Operation ${operation} not found`);
            }
            
            steps.push(operationFn(...params));
        }
        
        return pipe(...steps);
    }
}

// Esempio d'uso
const pipelineFactory = new DataPipelineFactory();

const salesAnalysisPipeline = pipelineFactory.createPipeline([
    { operation: 'map', params: [item => ({ ...item, revenue: item.price * item.quantity })] },
    { operation: 'filter', params: [item => item.revenue > 100] },
    { operation: 'sort', params: [(a, b) => b.revenue - a.revenue] },
    { operation: 'take', params: [5] }
]);

const sampleData = [
    { id: 1, price: 100, quantity: 2 },
    { id: 2, price: 50, quantity: 1 },
    { id: 3, price: 200, quantity: 3 },
    { id: 4, price: 25, quantity: 4 }
];

console.log('Top 5 per revenue:', salesAnalysisPipeline(sampleData));

/**
 * SOLUZIONE 3: Middleware Pattern con Composizione
 */
console.log('\n3. Middleware Pattern con Composizione:');

// Sistema di middleware componibile
class MiddlewareSystem {
    constructor() {
        this.middlewares = [];
    }
    
    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }
    
    compose() {
        return (handler) => {
            return this.middlewares.reduceRight(
                (next, middleware) => middleware(next),
                handler
            );
        };
    }
}

// Middleware di esempio
const loggingMiddleware = (next) => (...args) => {
    console.log('Before:', args);
    const result = next(...args);
    console.log('After:', result);
    return result;
};

const timingMiddleware = (next) => (...args) => {
    const start = Date.now();
    const result = next(...args);
    const end = Date.now();
    console.log(`Execution time: ${end - start}ms`);
    return result;
};

const validationMiddleware = (next) => (...args) => {
    if (args.some(arg => arg == null)) {
        throw new Error('Null arguments not allowed');
    }
    return next(...args);
};

// Uso del sistema middleware
const middlewareSystem = new MiddlewareSystem()
    .use(validationMiddleware)
    .use(timingMiddleware)
    .use(loggingMiddleware);

const enhancedAdd = middlewareSystem.compose()((a, b) => a + b);

console.log('Enhanced add result:', enhancedAdd(5, 3));

// ================================
// PATTERN AVANZATI
// ================================

console.log('\n\nPATTERN AVANZATI');
console.log('================');

/**
 * PATTERN 1: Transducers
 */
console.log('\n1. Transducers Pattern:');

// Implementazione transducers
const mapping = (transformFn) => (reducer) => (acc, item) => {
    return reducer(acc, transformFn(item));
};

const filtering = (predicateFn) => (reducer) => (acc, item) => {
    return predicateFn(item) ? reducer(acc, item) : acc;
};

const taking = (n) => (reducer) => {
    let taken = 0;
    return (acc, item) => {
        if (taken++ < n) {
            return reducer(acc, item);
        }
        return acc;
    };
};

// Composizione transducers
const composeTransducers = (...transducers) => (reducer) => {
    return transducers.reduceRight((acc, transducer) => transducer(acc), reducer);
};

const transduce = (transducer, reducer, initialValue, collection) => {
    const transformedReducer = transducer(reducer);
    return collection.reduce(transformedReducer, initialValue);
};

// Esempio d'uso
const arrayPushReducer = (acc, item) => {
    acc.push(item);
    return acc;
};

const transformNumbers = composeTransducers(
    mapping(x => x * 2),
    filtering(x => x > 10),
    taking(3)
);

const result = transduce(
    transformNumbers,
    arrayPushReducer,
    [],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
);

console.log('Transducers result:', result); // [12, 14, 16]

/**
 * PATTERN 2: Lens (Functional Optics)
 */
console.log('\n2. Lens Pattern:');

// Implementazione semplice di Lens
const lens = (getter, setter) => ({
    get: getter,
    set: setter,
    over: (fn) => (obj) => setter(fn(getter(obj)), obj)
});

const lensProp = (prop) => lens(
    obj => obj[prop],
    (value, obj) => ({ ...obj, [prop]: value })
);

const lensPath = (path) => lens(
    obj => path.reduce((acc, key) => acc && acc[key], obj),
    (value, obj) => {
        const result = { ...obj };
        let current = result;
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            current[key] = { ...current[key] };
            current = current[key];
        }
        current[path[path.length - 1]] = value;
        return result;
    }
);

// Composizione di lens
const composeLenses = (...lenses) => lens(
    obj => lenses.reduce((acc, lens) => lens.get(acc), obj),
    (value, obj) => lenses.reduceRight((acc, lens) => lens.set(acc, obj), value)
);

// Esempio d'uso
const user = {
    name: 'Mario',
    address: {
        street: 'Via Roma',
        city: 'Milano'
    }
};

const nameLens = lensProp('name');
const streetLens = lensPath(['address', 'street']);

console.log('Name:', nameLens.get(user));
console.log('Street:', streetLens.get(user));

const updatedUser = streetLens.set('Via Torino', user);
console.log('Updated user:', updatedUser);

console.log('\n=== FINE SOLUZIONI COMPLETE ===');

/**
 * RIEPILOGO CONCETTI CHIAVE:
 * 
 * CURRYING:
 * - Trasforma f(a,b,c) in f(a)(b)(c)
 * - Abilita applicazione parziale
 * - Migliora riusabilità e composizione
 * - Facilita point-free programming
 * 
 * COMPOSIZIONE:
 * - Combina funzioni semplici in funzioni complesse
 * - Compose: da destra a sinistra
 * - Pipe: da sinistra a destra (più leggibile)
 * - Abilita pipeline dichiarative
 * 
 * VANTAGGI COMBINATI:
 * - Codice modulare e testabile
 * - Funzioni piccole e focalizzate
 * - Alta riusabilità
 * - Pipeline leggibili
 * - Debugging facilitato
 * 
 * PATTERN AVANZATI:
 * - Transducers per performance
 * - Lens per immutabilità
 * - Middleware per aspecti trasversali
 * - Validazione componibile
 * 
 * BEST PRACTICES:
 * - Usa currying per funzioni configurabili
 * - Componi operazioni invece di scrivere funzioni complesse
 * - Mantieni funzioni pure
 * - Testa ogni componente individualmente
 * - Documenta l'ordine dei parametri per curry
 */
