# Testing Avanzato per Programmazione Funzionale

## 1. Property-Based Testing

Il property-based testing è una metodologia che verifica le proprietà matematiche del codice piuttosto che casi specifici.

### 1.1 Introduzione ai Property Tests

```javascript
// Test tradizionale (example-based)
test('addition is commutative', () => {
  expect(add(2, 3)).toBe(add(3, 2));
  expect(add(5, 7)).toBe(add(7, 5));
});

// Property-based test
import fc from 'fast-check';

test('addition is commutative for all numbers', () => {
  fc.assert(fc.property(
    fc.integer(), 
    fc.integer(), 
    (a, b) => add(a, b) === add(b, a)
  ));
});
```

### 1.2 Generatori di Dati

```javascript
// Generatori personalizzati
const emailGenerator = fc.string().filter(s => s.includes('@'));

const userGenerator = fc.record({
  id: fc.nat(),
  name: fc.string(1, 50),
  email: emailGenerator,
  age: fc.integer(18, 120)
});

// Test con generatori
fc.assert(fc.property(
  userGenerator,
  (user) => {
    const serialized = JSON.stringify(user);
    const deserialized = JSON.parse(serialized);
    return deepEqual(user, deserialized);
  }
));
```

### 1.3 Proprietà delle Funzioni Pure

```javascript
// Idempotenza
const idempotentProperty = (fn, generator) => 
  fc.property(generator, x => {
    const result1 = fn(x);
    const result2 = fn(result1);
    return deepEqual(result1, result2);
  });

// Test idempotenza per normalize
fc.assert(idempotentProperty(
  normalize, 
  fc.string()
));

// Inverso
const inverseProperty = (fn, inverseFn, generator) =>
  fc.property(generator, x => {
    const transformed = fn(x);
    const restored = inverseFn(transformed);
    return deepEqual(x, restored);
  });

fc.assert(inverseProperty(
  encode,
  decode,
  fc.string()
));
```

## 2. Formal Verification con Type Checking

### 2.1 TypeScript per Verification

```typescript
// Tipi dipendenti per length checking
type NonEmptyArray<T> = [T, ...T[]];

function head<T>(arr: NonEmptyArray<T>): T {
  return arr[0]; // Type-safe, nessun controllo runtime necessario
}

// Branded types per validazione
type Email = string & { __brand: 'Email' };
type UserId = number & { __brand: 'UserId' };

function createEmail(input: string): Email | null {
  return input.includes('@') ? input as Email : null;
}

function sendEmail(to: Email, subject: string): void {
  // Garantito che 'to' sia un email valido
}
```

### 2.2 Phantom Types

```typescript
// Phantom types per stati
type State = 'loading' | 'loaded' | 'error';
type Data<S extends State> = {
  state: S;
  value: S extends 'loaded' ? any : undefined;
  error: S extends 'error' ? Error : undefined;
};

function processData<S extends 'loaded'>(data: Data<S>): any {
  return data.value; // Type-safe, value è garantito esistere
}
```

## 3. Contract Testing

### 3.1 Pre/Post Conditions

```javascript
// Design by Contract
function factorial(n) {
  // Precondizione
  if (n < 0) throw new Error('Precondition failed: n must be >= 0');
  
  const result = n === 0 ? 1 : n * factorial(n - 1);
  
  // Postcondizione
  if (result < 1) throw new Error('Postcondition failed: result must be >= 1');
  
  return result;
}

// Decorator per contratti
function contract(preconditions = [], postconditions = []) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      // Verifica precondizioni
      preconditions.forEach(condition => {
        if (!condition(...args)) {
          throw new Error('Precondition failed');
        }
      });
      
      const result = originalMethod.apply(this, args);
      
      // Verifica postcondizioni
      postconditions.forEach(condition => {
        if (!condition(result, ...args)) {
          throw new Error('Postcondition failed');
        }
      });
      
      return result;
    };
  };
}

// Utilizzo
class Calculator {
  @contract(
    [n => n >= 0], // precondizione
    [(result, n) => result >= 1] // postcondizione
  )
  factorial(n) {
    return n === 0 ? 1 : n * this.factorial(n - 1);
  }
}
```

## 4. Mutation Testing

### 4.1 Configurazione Stryker

```javascript
// stryker.conf.js
module.exports = {
  mutator: 'javascript',
  packageManager: 'npm',
  reporters: ['clear-text', 'progress', 'html'],
  testRunner: 'jest',
  transpilers: [],
  testFramework: 'jest',
  coverageAnalysis: 'perTest',
  mutate: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ]
};
```

### 4.2 Test della Qualità dei Test

```javascript
// Funzione da testare
function isEven(n) {
  return n % 2 === 0;
}

// Test debole (sopravvive a mutazioni)
test('isEven weak test', () => {
  expect(isEven(2)).toBe(true);
});

// Test forte (rileva mutazioni)
test('isEven strong test', () => {
  expect(isEven(2)).toBe(true);
  expect(isEven(3)).toBe(false);
  expect(isEven(0)).toBe(true);
  expect(isEven(-2)).toBe(true);
  expect(isEven(-1)).toBe(false);
});
```

## 5. Model-Based Testing

### 5.1 Finite State Machine Testing

```javascript
// Modello dello stato
class StackModel {
  constructor() {
    this.items = [];
  }
  
  push(item) {
    this.items.push(item);
    return this;
  }
  
  pop() {
    if (this.items.length === 0) {
      throw new Error('Stack underflow');
    }
    return this.items.pop();
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
}

// Test basato su modello
function testStackImplementation(StackImpl) {
  const model = new StackModel();
  const impl = new StackImpl();
  
  const commands = [
    { type: 'push', value: fc.anything() },
    { type: 'pop', precondition: () => !model.isEmpty() },
    { type: 'isEmpty' },
    { type: 'size' }
  ];
  
  fc.assert(fc.property(
    fc.commands(commands),
    (cmds) => {
      const env = { model, impl };
      fc.modelRun(env, cmds);
    }
  ));
}
```

## 6. Generative Testing per Algoritmi

### 6.1 Test di Algoritmi di Ordinamento

```javascript
// Proprietà per algoritmi di ordinamento
const sortingProperties = {
  // Stabilità dell'output
  stability: (sortFn) => fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const sorted1 = sortFn([...arr]);
      const sorted2 = sortFn([...arr]);
      return deepEqual(sorted1, sorted2);
    }
  ),
  
  // Preservazione degli elementi
  permutation: (sortFn) => fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const sorted = sortFn([...arr]);
      const originalCounts = countElements(arr);
      const sortedCounts = countElements(sorted);
      return deepEqual(originalCounts, sortedCounts);
    }
  ),
  
  // Ordine corretto
  ordering: (sortFn) => fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const sorted = sortFn([...arr]);
      return isOrdered(sorted);
    }
  )
};

// Test completo
function testSortingAlgorithm(sortFn) {
  Object.entries(sortingProperties).forEach(([name, property]) => {
    test(`sorting ${name}`, () => {
      fc.assert(property(sortFn));
    });
  });
}

// Utilities
function countElements(arr) {
  return arr.reduce((acc, elem) => ({
    ...acc,
    [elem]: (acc[elem] || 0) + 1
  }), {});
}

function isOrdered(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}
```

## 7. Snapshot Testing Intelligente

### 7.1 Snapshot con Normalizzazione

```javascript
// Normalizzazione per snapshot stabili
function normalizeForSnapshot(data) {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    // Normalizza timestamps
    if (key.includes('time') || key.includes('date')) {
      return '[TIMESTAMP]';
    }
    // Normalizza IDs generati
    if (key === 'id' && typeof value === 'string') {
      return '[GENERATED_ID]';
    }
    return value;
  }));
}

// Test snapshot con property-based
test('component renders consistently', () => {
  fc.assert(fc.property(
    fc.record({
      title: fc.string(),
      items: fc.array(fc.string(), 0, 10)
    }),
    (props) => {
      const rendered = render(<Component {...props} />);
      const normalized = normalizeForSnapshot(rendered);
      expect(normalized).toMatchSnapshot();
    }
  ));
});
```

## 8. Performance Testing Funzionale

### 8.1 Complessità Temporale

```javascript
// Test di complessità
function testTimeComplexity(fn, generator, expectedComplexity) {
  const sizes = [100, 200, 400, 800, 1600];
  const times = [];
  
  sizes.forEach(size => {
    const data = fc.sample(generator, size);
    const start = performance.now();
    fn(data);
    const end = performance.now();
    times.push(end - start);
  });
  
  // Verifica che la crescita rispetti la complessità attesa
  const ratios = [];
  for (let i = 1; i < times.length; i++) {
    ratios.push(times[i] / times[i - 1]);
  }
  
  switch (expectedComplexity) {
    case 'O(n)':
      expect(ratios.every(r => r < 3)).toBe(true);
      break;
    case 'O(n²)':
      expect(ratios.every(r => r < 5 && r > 3)).toBe(true);
      break;
    case 'O(log n)':
      expect(ratios.every(r => r < 1.5)).toBe(true);
      break;
  }
}

// Utilizzo
test('quicksort has O(n log n) average complexity', () => {
  testTimeComplexity(
    quicksort,
    fc.array(fc.integer()),
    'O(n log n)'
  );
});
```

## 9. Esercizi Pratici

### Esercizio 1: Property-Based Test per Funzioni Math
Implementa property-based test per:
- Associatività di operazioni matematiche
- Distributività della moltiplicazione
- Identità degli elementi neutri

### Esercizio 2: Contract Testing
Crea un sistema di contract testing per:
- Una funzione di validazione email
- Un algoritmo di ricerca binaria
- Una cache LRU

### Esercizio 3: Model-Based Testing
Implementa model-based testing per:
- Una queue FIFO
- Un sistema di autenticazione
- Un state machine per un semaforo

### Esercizio 4: Mutation Testing
Configura e esegui mutation testing su:
- Funzioni di parsing
- Algoritmi di ordinamento
- Validatori di input

## 10. Best Practices

### 10.1 Organizzazione dei Test

```javascript
// Struttura raccomandata
tests/
├── unit/
│   ├── pure-functions/
│   ├── property-based/
│   └── contracts/
├── integration/
│   ├── model-based/
│   └── state-machines/
├── performance/
│   ├── complexity/
│   └── benchmarks/
└── generators/
    ├── domain-specific/
    └── utilities/
```

### 10.2 Strategie di Testing

1. **Pyramid Testing**: Unit > Integration > E2E
2. **Property First**: Inizia con le proprietà matematiche
3. **Fail Fast**: Test che falliscono rapidamente
4. **Deterministic**: Seed fissi per riproducibilità
5. **Compositional**: Test componibili e riutilizzabili

Questo modulo fornisce una base solida per il testing avanzato nella programmazione funzionale, combinando rigorosità matematica con praticità nell'implementazione.
