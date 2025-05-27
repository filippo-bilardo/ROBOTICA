# Ottimizzazione delle Performance e Bundling

## Introduzione

Le applicazioni funzionali JavaScript moderne richiedono strategie di ottimizzazione specifiche per massimizzare le performance. Questo capitolo esplora tecniche avanzate di ottimizzazione, bundling, e tree-shaking specificamente progettate per codice funzionale.

## Tree Shaking e Dead Code Elimination

### 1. Ottimizzazione per Tree Shaking

```javascript
// ❌ Struttura non ottimizzata per tree shaking
// utils/index.js
import { map, filter, reduce, compose, curry } from './functional.js';
import { validateEmail, validatePhone } from './validation.js';
import { formatDate, formatCurrency } from './formatting.js';

export default {
  map, filter, reduce, compose, curry,
  validateEmail, validatePhone,
  formatDate, formatCurrency
};

// ✅ Struttura ottimizzata per tree shaking
// utils/functional.js
export const map = (fn) => (array) => array.map(fn);
export const filter = (predicate) => (array) => array.filter(predicate);
export const reduce = (reducer, initial) => (array) => array.reduce(reducer, initial);
export const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);
export const curry = (fn) => (...args) => args.length >= fn.length ? fn(...args) : (...rest) => curry(fn)(...args, ...rest);

// utils/validation.js
export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePhone = (phone) => /^\+?[\d\s-()]+$/.test(phone);

// utils/formatting.js
export const formatDate = (date, locale = 'en-US') => new Intl.DateTimeFormat(locale).format(date);
export const formatCurrency = (amount, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

// Usage - Solo le funzioni usate vengono incluse nel bundle
import { map, compose } from './utils/functional.js';
import { validateEmail } from './utils/validation.js';
```

### 2. Bundling Configuration per Functional Code

```javascript
// webpack.config.js
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

export default {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve('dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  optimization: {
    usedExports: true,
    sideEffects: false, // Importante per tree shaking
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        functional: {
          test: /[\\/]src[\\/]utils[\\/]functional/,
          name: 'functional-utils',
          chunks: 'all'
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            pure_funcs: ['console.log'], // Rimuove console.log
            pure_getters: true,
            unsafe_comps: true,
            unsafe_math: true,
            passes: 2
          },
          mangle: {
            properties: {
              regex: /^_/ // Mangle private properties
            }
          }
        }
      })
    ]
  },
  resolve: {
    alias: {
      '@utils': path.resolve('src/utils'),
      '@components': path.resolve('src/components')
    }
  }
};

// vite.config.js (Alternative with Vite)
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'functional-utils': ['./src/utils/functional.js'],
          'validation-utils': ['./src/utils/validation.js']
        }
      }
    }
  },
  esbuild: {
    treeShaking: true,
    pure: ['console.log']
  }
});
```

## Memoization e Caching Strategico

### 1. Memoization Avanzata

```javascript
// utils/memoization.js
export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map();

  const memoized = (...args) => {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };

  memoized.clear = () => cache.clear();
  memoized.size = () => cache.size;
  memoized.has = (...args) => cache.has(getKey(...args));

  return memoized;
};

// Memoization con LRU Cache
export const memoizeLRU = (fn, maxSize = 100) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // Move to end (most recently used)
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    const result = fn(...args);

    if (cache.size >= maxSize) {
      // Remove least recently used (first item)
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  };
};

// Memoization con TTL (Time To Live)
export const memoizeWithTTL = (fn, ttl = 60000) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);
    const now = Date.now();

    if (cache.has(key)) {
      const { value, timestamp } = cache.get(key);
      if (now - timestamp < ttl) {
        return value;
      }
      cache.delete(key);
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });
    return result;
  };
};

// Usage Examples
const expensiveCalculation = memoize((a, b) => {
  console.log('Calculating...', a, b);
  return a * b + Math.random();
});

const apiCall = memoizeWithTTL(async (url) => {
  const response = await fetch(url);
  return response.json();
}, 30000); // 30 seconds TTL
```

### 2. Reactive Caching

```javascript
// utils/reactiveCache.js
export const createReactiveCache = () => {
  const cache = new Map();
  const dependencies = new Map();
  const subscribers = new Map();

  const invalidate = (key) => {
    if (cache.has(key)) {
      cache.delete(key);
      
      // Notify subscribers
      const subs = subscribers.get(key) || [];
      subs.forEach(callback => callback());
      
      // Invalidate dependent keys
      const deps = dependencies.get(key) || [];
      deps.forEach(invalidate);
    }
  };

  const memoize = (fn, key, deps = []) => {
    return (...args) => {
      const cacheKey = `${key}:${JSON.stringify(args)}`;

      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }

      const result = fn(...args);
      cache.set(cacheKey, result);

      // Setup dependencies
      deps.forEach(dep => {
        if (!dependencies.has(dep)) {
          dependencies.set(dep, []);
        }
        dependencies.get(dep).push(cacheKey);
      });

      return result;
    };
  };

  const subscribe = (key, callback) => {
    if (!subscribers.has(key)) {
      subscribers.set(key, []);
    }
    subscribers.get(key).push(callback);

    // Return unsubscribe function
    return () => {
      const subs = subscribers.get(key);
      const index = subs.indexOf(callback);
      if (index > -1) subs.splice(index, 1);
    };
  };

  return { memoize, invalidate, subscribe };
};

// Usage
const cache = createReactiveCache();

const getUserProfile = cache.memoize(
  async (userId) => {
    const user = await fetchUser(userId);
    const posts = await fetchUserPosts(userId);
    return { ...user, posts };
  },
  'userProfile',
  ['user', 'posts'] // Dependencies
);

// When user data changes, invalidate the cache
cache.invalidate('user');
```

## Lazy Loading e Code Splitting

### 1. Dynamic Imports per Functional Modules

```javascript
// services/dynamicServices.js
export const createServiceLoader = () => {
  const serviceCache = new Map();

  const loadService = async (serviceName) => {
    if (serviceCache.has(serviceName)) {
      return serviceCache.get(serviceName);
    }

    let service;
    switch (serviceName) {
      case 'user':
        service = await import('./userService.js');
        break;
      case 'analytics':
        service = await import('./analyticsService.js');
        break;
      case 'notifications':
        service = await import('./notificationService.js');
        break;
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }

    serviceCache.set(serviceName, service);
    return service;
  };

  const withService = (serviceName) => (fn) => async (...args) => {
    const service = await loadService(serviceName);
    return fn(service)(...args);
  };

  return { loadService, withService };
};

// Usage
const serviceLoader = createServiceLoader();

const getUserData = serviceLoader.withService('user')(
  (userService) => (userId) => userService.fetchUser(userId)
);

const trackEvent = serviceLoader.withService('analytics')(
  (analyticsService) => (event) => analyticsService.track(event)
);
```

### 2. Component Lazy Loading

```javascript
// React Lazy Loading
import { lazy, Suspense } from 'react';

const LazyUserProfile = lazy(() => import('./components/UserProfile.js'));
const LazyDashboard = lazy(() => import('./components/Dashboard.js'));

const App = () => (
  <Router>
    <Routes>
      <Route 
        path="/profile" 
        element={
          <Suspense fallback={<div>Loading Profile...</div>}>
            <LazyUserProfile />
          </Suspense>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <Suspense fallback={<div>Loading Dashboard...</div>}>
            <LazyDashboard />
          </Suspense>
        } 
      />
    </Routes>
  </Router>
);

// Vue Lazy Loading
// router.js
export const routes = [
  {
    path: '/profile',
    component: () => import('./components/UserProfile.vue')
  },
  {
    path: '/dashboard',
    component: () => import('./components/Dashboard.vue')
  }
];
```

## Performance Monitoring

### 1. Performance Measurement Utilities

```javascript
// utils/performance.js
export const measurePerformance = (fn, label) => {
  return async (...args) => {
    const start = performance.now();
    
    try {
      const result = await fn(...args);
      const end = performance.now();
      
      console.log(`${label}: ${end - start}ms`);
      
      // Send to analytics if needed
      if (typeof analytics !== 'undefined') {
        analytics.track('performance', {
          function: label,
          duration: end - start,
          timestamp: Date.now()
        });
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${label} failed after ${end - start}ms:`, error);
      throw error;
    }
  };
};

export const createPerformanceMonitor = () => {
  const metrics = new Map();

  const measure = (label) => (fn) => {
    return measurePerformance(fn, label);
  };

  const getMetrics = () => Array.from(metrics.entries());

  const withPerformanceTracking = (config) => (fn) => {
    const { label, threshold = 1000, onSlowExecution } = config;
    
    return async (...args) => {
      const start = performance.now();
      const result = await fn(...args);
      const duration = performance.now() - start;

      if (duration > threshold && onSlowExecution) {
        onSlowExecution({ label, duration, args });
      }

      return result;
    };
  };

  return { measure, getMetrics, withPerformanceTracking };
};

// Usage
const monitor = createPerformanceMonitor();

const slowAPICall = monitor.withPerformanceTracking({
  label: 'API Call',
  threshold: 500,
  onSlowExecution: ({ label, duration }) => {
    console.warn(`${label} took ${duration}ms - consider optimization`);
  }
})(fetchUserData);
```

### 2. Bundle Analysis

```javascript
// scripts/analyze-bundle.js
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export const analyzeBundle = () => {
  return new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: true,
    reportFilename: 'bundle-report.html'
  });
};

// package.json scripts
{
  "scripts": {
    "analyze": "webpack --config webpack.config.js --env analyze",
    "build:analyze": "npm run build && npm run analyze"
  }
}
```

## Memory Management

### 1. Weak References per Functional Programming

```javascript
// utils/weakCache.js
export const createWeakCache = () => {
  const cache = new WeakMap();

  const memoizeWeak = (fn) => {
    return (obj, ...args) => {
      if (!cache.has(obj)) {
        cache.set(obj, new Map());
      }

      const objCache = cache.get(obj);
      const key = JSON.stringify(args);

      if (objCache.has(key)) {
        return objCache.get(key);
      }

      const result = fn(obj, ...args);
      objCache.set(key, result);
      return result;
    };
  };

  return { memoizeWeak };
};

// Usage with objects that might be garbage collected
const weakCache = createWeakCache();

const processUserData = weakCache.memoizeWeak((user, options) => {
  // Expensive processing
  return {
    ...user,
    processedAt: Date.now(),
    ...options
  };
});
```

### 2. Cleanup Strategies

```javascript
// utils/cleanup.js
export const createCleanupManager = () => {
  const cleanupTasks = [];

  const addCleanup = (fn) => {
    cleanupTasks.push(fn);
    return () => {
      const index = cleanupTasks.indexOf(fn);
      if (index > -1) cleanupTasks.splice(index, 1);
    };
  };

  const cleanup = () => {
    cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    cleanupTasks.length = 0;
  };

  // Auto-cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup);
  }

  // Auto-cleanup for Node.js
  if (typeof process !== 'undefined') {
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }

  return { addCleanup, cleanup };
};

// Usage
const cleanupManager = createCleanupManager();

const subscribeToEvents = (eventBus) => {
  const unsubscribe = eventBus.subscribe('user-updated', handleUserUpdate);
  cleanupManager.addCleanup(unsubscribe);
};
```

## Optimization Best Practices

### 1. Function Composition Optimization

```javascript
// ❌ Inefficient composition
const processUsers = (users) => 
  users
    .map(user => ({ ...user, id: generateId() }))
    .filter(user => user.active)
    .map(user => ({ ...user, fullName: `${user.first} ${user.last}` }))
    .filter(user => user.fullName.length > 0);

// ✅ Optimized composition
const processUsers = (users) => {
  const results = [];
  
  for (const user of users) {
    if (!user.active) continue;
    
    const fullName = `${user.first} ${user.last}`;
    if (fullName.length === 0) continue;
    
    results.push({
      ...user,
      id: generateId(),
      fullName
    });
  }
  
  return results;
};

// ✅ Functional but optimized
const processUsers = pipe(
  filter(user => user.active),
  map(user => {
    const fullName = `${user.first} ${user.last}`;
    return fullName.length > 0 ? {
      ...user,
      id: generateId(),
      fullName
    } : null;
  }),
  filter(Boolean)
);
```

### 2. Event Loop Optimization

```javascript
// utils/scheduler.js
export const scheduleWork = (work, priority = 'normal') => {
  const priorities = {
    immediate: () => Promise.resolve().then(work),
    normal: () => setTimeout(work, 0),
    idle: () => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(work);
      } else {
        setTimeout(work, 16);
      }
    }
  };

  return priorities[priority]();
};

export const batchWork = (items, processor, batchSize = 100) => {
  return new Promise((resolve) => {
    const results = [];
    let index = 0;

    const processBatch = () => {
      const batch = items.slice(index, index + batchSize);
      batch.forEach(item => results.push(processor(item)));
      index += batchSize;

      if (index < items.length) {
        scheduleWork(processBatch, 'normal');
      } else {
        resolve(results);
      }
    };

    processBatch();
  });
};

// Usage
const processLargeDataset = async (data) => {
  return await batchWork(data, item => expensiveOperation(item), 50);
};
```

## Deployment Optimization

### 1. CDN Configuration

```javascript
// webpack.config.js - CDN setup
export default {
  output: {
    publicPath: process.env.NODE_ENV === 'production' 
      ? 'https://cdn.example.com/static/' 
      : '/'
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'lodash': '_'
  }
};

// HTML template with CDN fallback
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script>
  // Fallback if CDN fails
  if (!window.React) {
    document.write('<script src="/fallback/react.min.js"><\/script>');
  }
</script>
```

### 2. Service Worker per Caching

```javascript
// sw.js
const CACHE_NAME = 'functional-app-v1';
const FUNCTIONAL_MODULES = [
  '/utils/functional.js',
  '/utils/validation.js',
  '/utils/formatting.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FUNCTIONAL_MODULES))
  );
});

self.addEventListener('fetch', (event) => {
  if (FUNCTIONAL_MODULES.some(module => event.request.url.includes(module))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

## Conclusioni

L'ottimizzazione delle performance per applicazioni funzionali richiede:

- **Tree shaking efficace**: Struttura modulare ottimizzata
- **Memoization strategica**: Cache intelligente per funzioni pure
- **Lazy loading**: Caricamento dinamico di moduli
- **Memory management**: Gestione attenta delle risorse
- **Bundle optimization**: Configurazione avanzata dei bundler

Queste tecniche, combinate con principi funzionali, creano applicazioni performanti e scalabili per ambienti di produzione moderni.
