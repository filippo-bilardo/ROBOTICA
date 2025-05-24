# Testing e Debugging in Programmazione Funzionale

## Introduzione

Il testing e debugging di codice funzionale presenta caratteristiche uniche che, se comprese e applicate correttamente, possono portare a una maggiore affidabilità e facilità di manutenzione del software.

## 🧪 Testing di Funzioni Pure

### Vantaggi Fondamentali

#### 1. **Determinismo Completo**
```javascript
// Funzione pura - test semplici e affidabili
const calculateTax = (amount, rate) => amount * rate;

// Test diretto senza setup
describe('calculateTax', () => {
    test('calculates tax correctly', () => {
        expect(calculateTax(100, 0.1)).toBe(10);
        expect(calculateTax(0, 0.1)).toBe(0);
        expect(calculateTax(100, 0)).toBe(0);
    });
    
    test('handles edge cases', () => {
        expect(calculateTax(-100, 0.1)).toBe(-10);
        expect(calculateTax(100.5, 0.1)).toBe(10.05);
    });
});
```

#### 2. **Niente Mock Necessari**
```javascript
// Funzione pura - niente dipendenze esterne
const formatUserData = (users) => 
    users.map(user => ({
        displayName: `${user.firstName} ${user.lastName}`,
        isAdult: user.age >= 18,
        initials: `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }));

// Test senza mock o stub
test('formats user data correctly', () => {
    const input = [
        { firstName: 'John', lastName: 'Doe', age: 25 },
        { firstName: 'Jane', lastName: 'Smith', age: 17 }
    ];
    
    const expected = [
        { displayName: 'John Doe', isAdult: true, initials: 'JD' },
        { displayName: 'Jane Smith', isAdult: false, initials: 'JS' }
    ];
    
    expect(formatUserData(input)).toEqual(expected);
});
```

### Property-Based Testing

#### Utilizzando JSCheck o fast-check
```javascript
const fc = require('fast-check');

// Test delle proprietà matematiche
describe('Mathematical properties', () => {
    test('addition is commutative', () => {
        fc.assert(fc.property(
            fc.integer(), fc.integer(),
            (a, b) => add(a, b) === add(b, a)
        ));
    });
    
    test('map preserves array length', () => {
        fc.assert(fc.property(
            fc.array(fc.integer()),
            fc.func(fc.integer()),
            (arr, fn) => arr.map(fn).length === arr.length
        ));
    });
});

// Test di invarianti complesse
const sortArray = arr => [...arr].sort((a, b) => a - b);

test('sort invariants', () => {
    fc.assert(fc.property(
        fc.array(fc.integer()),
        (arr) => {
            const sorted = sortArray(arr);
            // Proprietà: lunghezza preservata
            return sorted.length === arr.length &&
                   // Proprietà: elementi ordinati
                   sorted.every((val, i) => 
                       i === 0 || sorted[i-1] <= val
                   ) &&
                   // Proprietà: stessi elementi
                   arr.every(val => 
                       sorted.filter(x => x === val).length === 
                       arr.filter(x => x === val).length
                   );
        }
    ));
});
```

## 🐛 Debugging Funzionale

### Stack Traces Puliti

#### Funzioni Pure vs Impure
```javascript
// Funzioni pure - stack trace chiaro
const pipeline = data =>
    data
        .map(normalize)      // Errore qui? Chiaro dove
        .filter(validate)    // Ogni step è isolato
        .map(transform)      // Niente side effects nascosti
        .reduce(aggregate);  // Logica localizzata

// vs debugging imperativo
function imperativePipeline(data) {
    let normalized = [];
    for (let item of data) {
        try {
            let normalizedItem = normalize(item);
            if (validate(normalizedItem)) {
                let transformed = transform(normalizedItem);
                normalized.push(transformed);
            }
        } catch (e) {
            // Errore può venire da qualsiasi punto
            console.error('Error processing item:', item, e);
        }
    }
    return aggregate(normalized);
}
```

### Debugging con Tap Functions

#### Inserimento di Tap per Debugging
```javascript
// Utility tap function per debugging
const tap = (fn) => (value) => {
    fn(value);
    return value;
};

// Pipeline con debugging
const debugPipeline = data =>
    data
        .map(tap(x => console.log('After normalize:', x)))
        .map(normalize)
        .filter(tap(x => console.log('After filter:', x)))
        .filter(validate)
        .map(tap(x => console.log('After transform:', x)))
        .map(transform)
        .reduce(aggregate);

// Versione condizionale per production
const conditionalTap = (condition, fn) => (value) => {
    if (condition) fn(value);
    return value;
};

const prodPipeline = data =>
    data
        .map(conditionalTap(process.env.DEBUG, x => console.log('Debug:', x)))
        .map(normalize)
        .filter(validate)
        .map(transform)
        .reduce(aggregate);
```

### Time Travel Debugging

#### Snapshot di Stati Intermedi
```javascript
// Functional state snapshots
const createDebugReducer = (reducer) => {
    const history = [];
    
    return (state, action) => {
        const newState = reducer(state, action);
        
        if (process.env.DEBUG) {
            history.push({
                action,
                previousState: state,
                newState,
                timestamp: Date.now()
            });
            
            // Esponi history per debugging
            global.stateHistory = history;
        }
        
        return newState;
    };
};

// Usage
const debugReducer = createDebugReducer(userReducer);

// In console:
// > stateHistory[stateHistory.length - 1]
// { action: { type: 'ADD_USER', payload: {...} }, ... }
```

## 🧮 Testing di Higher-Order Functions

### Testing di Funzioni che Ritornano Funzioni

```javascript
// HOF da testare
const createValidator = (rules) => (data) =>
    rules.every(rule => rule(data));

const createFormatter = (template) => (data) =>
    template.replace(/\{(\w+)\}/g, (match, key) => data[key] || '');

// Test di HOF
describe('Higher-Order Functions', () => {
    describe('createValidator', () => {
        test('creates validator function', () => {
            const isPositive = x => x > 0;
            const isEven = x => x % 2 === 0;
            const validator = createValidator([isPositive, isEven]);
            
            expect(typeof validator).toBe('function');
            expect(validator(4)).toBe(true);
            expect(validator(-2)).toBe(false);
            expect(validator(3)).toBe(false);
        });
    });
    
    describe('createFormatter', () => {
        test('creates formatter function', () => {
            const formatter = createFormatter('Hello {name}, you are {age} years old');
            
            expect(typeof formatter).toBe('function');
            expect(formatter({ name: 'John', age: 30 }))
                .toBe('Hello John, you are 30 years old');
        });
    });
});
```

### Testing di Curried Functions

```javascript
// Curried function
const add = a => b => a + b;
const multiply = a => b => c => a * b * c;

describe('Curried Functions', () => {
    test('add function currying', () => {
        expect(typeof add(5)).toBe('function');
        expect(add(5)(3)).toBe(8);
        
        // Test partial application
        const add5 = add(5);
        expect(add5(10)).toBe(15);
        expect(add5(0)).toBe(5);
    });
    
    test('multiply function multiple currying', () => {
        expect(typeof multiply(2)).toBe('function');
        expect(typeof multiply(2)(3)).toBe('function');
        expect(multiply(2)(3)(4)).toBe(24);
        
        // Test partial applications
        const double = multiply(2);
        const doubleThenTriple = double(3);
        expect(doubleThenTriple(5)).toBe(30);
    });
});
```

## 🔧 Testing di Side Effects Isolati

### Testing di I/O Operations

```javascript
// Separazione core logic da I/O
const calculateOrderTotal = (items, taxRate, discountRate) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = subtotal * discountRate;
    const discountedTotal = subtotal - discount;
    const tax = discountedTotal * taxRate;
    return {
        subtotal,
        discount,
        tax,
        total: discountedTotal + tax
    };
};

// I/O wrapper (tested separately)
const processOrder = async (orderData) => {
    // Pure calculation
    const totals = calculateOrderTotal(
        orderData.items,
        orderData.taxRate,
        orderData.discountRate
    );
    
    // Side effects (mocked in tests)
    const order = await db.saveOrder({ ...orderData, ...totals });
    await emailService.sendConfirmation(order);
    return order;
};

// Test pure calculation
describe('calculateOrderTotal', () => {
    test('calculates correct totals', () => {
        const items = [
            { price: 10, quantity: 2 },
            { price: 15, quantity: 1 }
        ];
        
        const result = calculateOrderTotal(items, 0.1, 0.05);
        
        expect(result).toEqual({
            subtotal: 35,
            discount: 1.75,
            tax: 3.325,
            total: 36.575
        });
    });
});

// Test I/O with mocks
describe('processOrder', () => {
    test('processes order with side effects', async () => {
        const mockSave = jest.fn().mockResolvedValue({ id: 1 });
        const mockEmail = jest.fn().mockResolvedValue(true);
        
        db.saveOrder = mockSave;
        emailService.sendConfirmation = mockEmail;
        
        const orderData = {
            items: [{ price: 10, quantity: 1 }],
            taxRate: 0.1,
            discountRate: 0
        };
        
        await processOrder(orderData);
        
        expect(mockSave).toHaveBeenCalledWith({
            ...orderData,
            subtotal: 10,
            discount: 0,
            tax: 1,
            total: 11
        });
        expect(mockEmail).toHaveBeenCalled();
    });
});
```

## 🎯 Best Practices per Testing Funzionale

### 1. **Test Structure Pattern**

```javascript
// AAA Pattern per funzioni pure
describe('FunctionName', () => {
    test('behavior description', () => {
        // Arrange
        const input = createTestData();
        const expected = createExpectedResult();
        
        // Act
        const result = functionToTest(input);
        
        // Assert
        expect(result).toEqual(expected);
    });
});
```

### 2. **Data Builders per Test**

```javascript
// Test data builders
const userBuilder = {
    default: () => ({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        active: true
    }),
    
    withAge: (age) => ({ ...userBuilder.default(), age }),
    withName: (name) => ({ ...userBuilder.default(), name }),
    inactive: () => ({ ...userBuilder.default(), active: false })
};

// Usage in tests
test('filters adult users', () => {
    const users = [
        userBuilder.withAge(17),
        userBuilder.withAge(25),
        userBuilder.withAge(16)
    ];
    
    const adults = users.filter(user => user.age >= 18);
    expect(adults).toHaveLength(1);
});
```

### 3. **Snapshot Testing per Output Complessi**

```javascript
// Per output complessi
test('generates correct report structure', () => {
    const salesData = createTestSalesData();
    const report = generateSalesReport(salesData);
    
    // Snapshot del formato completo
    expect(report).toMatchSnapshot();
});

// Per test più granulari
test('calculates correct metrics', () => {
    const salesData = createTestSalesData();
    const report = generateSalesReport(salesData);
    
    expect(report.totalRevenue).toBe(15000);
    expect(report.averageOrderValue).toBe(150);
    expect(report.conversionRate).toBe(0.05);
});
```

## 🚀 Tools e Tecniche Avanzate

### 1. **Mutation Testing**
```bash
# Con Stryker
npm install --save-dev @stryker-mutator/core @stryker-mutator/javascript-mutator
npx stryker run
```

### 2. **Coverage di Branch per Funzioni Pure**
```javascript
// Assicurarsi che tutti i path siano testati
const categorizeAge = (age) => {
    if (age < 0) return 'invalid';
    if (age < 13) return 'child';
    if (age < 20) return 'teenager';
    if (age < 60) return 'adult';
    return 'senior';
};

// Test per ogni branch
describe('categorizeAge', () => {
    test.each([
        [-1, 'invalid'],
        [5, 'child'],
        [15, 'teenager'],
        [30, 'adult'],
        [70, 'senior']
    ])('categorizes age %i as %s', (age, expected) => {
        expect(categorizeAge(age)).toBe(expected);
    });
});
```

## 📊 Metriche di Qualità

### Code Coverage Metrics
- **Line Coverage**: >95% per funzioni pure
- **Branch Coverage**: 100% per logic paths
- **Function Coverage**: 100% per API pubbliche

### Quality Indicators
- **Cyclomatic Complexity**: <5 per funzione
- **Test-to-Code Ratio**: 1:1 o migliore
- **Mutation Score**: >80%

## 🎯 Conclusioni

Il testing e debugging funzionale offre:

✅ **Vantaggi**:
- Test più semplici e affidabili
- Debugging più prevedibile
- Meno mock e setup
- Property-based testing possibile

⚠️ **Considerazioni**:
- Richiede separazione I/O da business logic
- Necessita di strumenti specifici per property testing
- Curve di apprendimento per nuovi pattern

La chiave è **separare le preoccupazioni** mantenendo la logica business pura e isolando gli effetti collaterali per facilitare testing e debugging.
