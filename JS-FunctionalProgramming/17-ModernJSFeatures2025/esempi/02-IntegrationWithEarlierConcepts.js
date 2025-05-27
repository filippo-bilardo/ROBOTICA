// JavaScript Moderno 2025 - Integrazione con Concetti del Corso
// Questo file dimostra come le nuove features si integrano con i concetti dei moduli precedenti

// ============================================================================
// INTEGRAZIONE CON FUNZIONI PURE E IMMUTABILITÀ (Modulo 2)
// ============================================================================

// Utilizzo di Record & Tuple per garantire immutabilità
// Note: Record & Tuple sono proposal in fase avanzata
const createImmutableState = (data) => {
  // Simulazione di Record con Object.freeze per ora
  return Object.freeze({
    ...data,
    timestamp: new Date().toISOString()
  });
};

// Utilizzo di .at() per accesso sicuro agli array (ES2022)
const getLastElement = (arr) => arr.at(-1);
const getFirstElement = (arr) => arr.at(0);

// Funzione pura con pattern matching simulato
const processUserData = (user) => {
  // Simulazione pattern matching con switch expressions style
  const userType = (() => {
    switch (true) {
      case user.age >= 65: return 'senior';
      case user.age >= 18: return 'adult';
      case user.age >= 13: return 'teen';
      default: return 'child';
    }
  })();
  
  return createImmutableState({
    ...user,
    type: userType,
    canVote: user.age >= 18
  });
};

// ============================================================================
// INTEGRAZIONE CON HIGHER ORDER FUNCTIONS (Modulo 3)
// ============================================================================

// Higher-order function con ES2025 features
const createAsyncMapper = (transformFn) => async (array) => {
  // Utilizzo di top-level await compatibility
  const promises = array.map(async (item, index) => {
    const result = await transformFn(item, index);
    return result;
  });
  
  return Promise.all(promises);
};

// HOF con Array.at() per accesso sicuro
const createSafeAccessor = (accessFn) => (array) => {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  return accessFn(array);
};

const getLastSafely = createSafeAccessor(arr => arr.at(-1));
const getFirstSafely = createSafeAccessor(arr => arr.at(0));

// ============================================================================
// INTEGRAZIONE CON CURRYING E COMPOSIZIONE (Modulo 5)
// ============================================================================

// Currying con async functions e top-level await
const curriedAsyncFetch = (baseUrl) => (endpoint) => async (params = {}) => {
  const url = new URL(endpoint, baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  const response = await fetch(url);
  return response.json();
};

// Composizione con nuove features
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
const composeAsync = (...fns) => (x) => 
  fns.reduceRight((acc, fn) => acc.then(fn), Promise.resolve(x));

// Esempio di composizione con features moderne
const processDataPipeline = compose(
  data => data.map(item => ({ ...item, processed: true })),
  data => data.filter(item => item.age >= 18),
  data => data.map(processUserData)
);

// ============================================================================
// INTEGRAZIONE CON MAP, FILTER, REDUCE (Modulo 4)
// ============================================================================

// Utilizzo di Array.at() in combinazione con metodi funzionali
const processArrayWithModernFeatures = (array) => {
  return array
    .filter((item, index) => {
      // Utilizzo di .at() per confronti con elementi relativi
      const nextItem = array.at(index + 1);
      const prevItem = array.at(index - 1);
      
      return item.value > (prevItem?.value ?? 0);
    })
    .map((item, index, arr) => ({
      ...item,
      isLast: index === arr.length - 1,
      isFirst: index === 0,
      position: `${index + 1}/${arr.length}`
    }))
    .reduce((acc, item) => {
      // Utilizzo di nullish coalescing
      acc.total = (acc.total ?? 0) + item.value;
      acc.items = [...(acc.items ?? []), item];
      return acc;
    }, {});
};

// ============================================================================
// INTEGRAZIONE CON ASYNC PROGRAMMING (Modulo 9)
// ============================================================================

// Top-level await con pattern funzionali
const createAsyncDataProcessor = () => {
  // Simulazione di top-level await usage
  const config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000
  };
  
  const fetchWithTimeout = async (url, timeout = config.timeout) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };
  
  return {
    processUserData: async (userData) => {
      try {
        const enrichedData = userData.map(processUserData);
        return enrichedData;
      } catch (error) {
        console.error('Error processing user data:', error);
        return [];
      }
    },
    
    fetchAndProcess: async (endpoint) => {
      try {
        const response = await fetchWithTimeout(`${config.apiUrl}/${endpoint}`);
        const data = await response.json();
        return data.map(processUserData);
      } catch (error) {
        console.error('Error fetching data:', error);
        return [];
      }
    }
  };
};

// ============================================================================
// INTEGRAZIONE CON MONADS (Modulo 8)
// ============================================================================

// Maybe monad con nuove features
class Maybe {
  constructor(value) {
    this.value = value;
  }
  
  static of(value) {
    return new Maybe(value);
  }
  
  static nothing() {
    return new Maybe(null);
  }
  
  map(fn) {
    return this.value == null ? Maybe.nothing() : Maybe.of(fn(this.value));
  }
  
  flatMap(fn) {
    return this.value == null ? Maybe.nothing() : fn(this.value);
  }
  
  // Utilizzo di nullish coalescing per default values
  getOrElse(defaultValue) {
    return this.value ?? defaultValue;
  }
  
  // Utilizzo di optional chaining
  safeProperty(prop) {
    return Maybe.of(this.value?.[prop]);
  }
}

// Either monad con gestione moderna degli errori
class Either {
  constructor(value, isRight = true) {
    this.value = value;
    this.isRight = isRight;
  }
  
  static right(value) {
    return new Either(value, true);
  }
  
  static left(value) {
    return new Either(value, false);
  }
  
  map(fn) {
    return this.isRight ? Either.right(fn(this.value)) : this;
  }
  
  mapLeft(fn) {
    return this.isRight ? this : Either.left(fn(this.value));
  }
  
  // Async support con top-level await compatibility
  async mapAsync(fn) {
    if (!this.isRight) return this;
    try {
      const result = await fn(this.value);
      return Either.right(result);
    } catch (error) {
      return Either.left(error);
    }
  }
}

// ============================================================================
// ESEMPI PRATICI DI INTEGRAZIONE
// ============================================================================

// Esempio 1: Pipeline di elaborazione dati con features moderne
const createModernDataPipeline = () => {
  const pipeline = composeAsync(
    // Step 4: Format finale con .at()
    async (data) => ({
      items: data,
      first: data.at(0),
      last: data.at(-1),
      count: data.length,
      processed_at: new Date().toISOString()
    }),
    
    // Step 3: Enrich data con async operations
    async (data) => {
      const enricher = createAsyncMapper(async (item) => ({
        ...item,
        enriched: true,
        hash: await crypto.subtle.digest('SHA-256', 
          new TextEncoder().encode(JSON.stringify(item))
        ).then(buffer => 
          Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
        )
      }));
      
      return enricher(data);
    },
    
    // Step 2: Filter e transform
    async (data) => data
      .filter(item => item.age >= 18)
      .map(processUserData),
    
    // Step 1: Validate input
    async (data) => {
      if (!Array.isArray(data)) {
        throw new Error('Input must be an array');
      }
      return data;
    }
  );
  
  return pipeline;
};

// Esempio 2: State management funzionale con features moderne
const createFunctionalStateManager = (initialState = {}) => {
  let state = createImmutableState(initialState);
  const subscribers = new Set();
  
  return {
    getState: () => state,
    
    // Utilizzo di optional chaining per accesso sicuro
    getProperty: (path) => {
      const parts = path.split('.');
      return parts.reduce((obj, key) => obj?.[key], state);
    },
    
    setState: (updater) => {
      const newState = typeof updater === 'function' 
        ? updater(state) 
        : { ...state, ...updater };
      
      state = createImmutableState(newState);
      
      // Notifica subscribers
      subscribers.forEach(callback => {
        try {
          callback(state);
        } catch (error) {
          console.error('Error in state subscriber:', error);
        }
      });
    },
    
    subscribe: (callback) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    
    // Async state operations
    setStateAsync: async (asyncUpdater) => {
      try {
        const newState = await asyncUpdater(state);
        state = createImmutableState(newState);
        subscribers.forEach(callback => callback(state));
      } catch (error) {
        console.error('Error in async state update:', error);
      }
    }
  };
};

// ============================================================================
// TESTING E VALIDAZIONE
// ============================================================================

// Test helper che utilizza le nuove features
const createTestSuite = (name) => {
  const tests = [];
  
  return {
    test: (description, testFn) => {
      tests.push({ description, testFn });
    },
    
    run: async () => {
      console.log(`\n🧪 Running test suite: ${name}`);
      
      for (const test of tests) {
        try {
          await test.testFn();
          console.log(`✅ ${test.description}`);
        } catch (error) {
          console.log(`❌ ${test.description}`);
          console.error(`   Error: ${error.message}`);
        }
      }
    }
  };
};

// ============================================================================
// ESPORTAZIONI E USAGE EXAMPLES
// ============================================================================

// Example usage (would work with top-level await)
const demonstrateIntegration = async () => {
  console.log('🚀 Demonstrating Modern JS Features Integration\n');
  
  // Test data
  const testUsers = [
    { name: 'Alice', age: 25, city: 'Rome' },
    { name: 'Bob', age: 17, city: 'Milan' },
    { name: 'Charlie', age: 35, city: 'Naples' },
    { name: 'Diana', age: 70, city: 'Florence' }
  ];
  
  // 1. Test basic processing
  console.log('1. Basic user processing:');
  const processedUsers = testUsers.map(processUserData);
  console.log('First user:', getFirstSafely(processedUsers));
  console.log('Last user:', getLastSafely(processedUsers));
  
  // 2. Test pipeline
  console.log('\n2. Data pipeline:');
  const pipeline = createModernDataPipeline();
  const pipelineResult = await pipeline(testUsers);
  console.log('Pipeline result:', pipelineResult);
  
  // 3. Test state management
  console.log('\n3. State management:');
  const stateManager = createFunctionalStateManager({ count: 0 });
  stateManager.subscribe(state => console.log('State updated:', state));
  stateManager.setState(state => ({ ...state, count: state.count + 1 }));
  
  // 4. Test monads with modern features
  console.log('\n4. Monads with modern features:');
  const user = { name: 'Test', profile: { age: 25 } };
  const maybeAge = Maybe.of(user)
    .safeProperty('profile')
    .safeProperty('age');
  console.log('Safe age access:', maybeAge.getOrElse('Unknown'));
  
  return { processedUsers, pipelineResult, stateManager };
};

// Export for module usage
export {
  createImmutableState,
  processUserData,
  createAsyncMapper,
  curriedAsyncFetch,
  compose,
  composeAsync,
  processArrayWithModernFeatures,
  createAsyncDataProcessor,
  Maybe,
  Either,
  createModernDataPipeline,
  createFunctionalStateManager,
  createTestSuite,
  demonstrateIntegration
};

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createImmutableState,
    processUserData,
    createAsyncMapper,
    curriedAsyncFetch,
    compose,
    composeAsync,
    processArrayWithModernFeatures,
    createAsyncDataProcessor,
    Maybe,
    Either,
    createModernDataPipeline,
    createFunctionalStateManager,
    createTestSuite,
    demonstrateIntegration
  };
}

console.log('📚 Integration examples loaded. Use demonstrateIntegration() to run examples.');
