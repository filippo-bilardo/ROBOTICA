# Architetture Modulari Funzionali

## Introduzione

L'architettura modulare rappresenta un paradigma fondamentale per organizzare applicazioni JavaScript moderne utilizzando principi funzionali. Questo approccio combina la potenza dei moduli ES6+ con i principi della programmazione funzionale per creare sistemi scalabili e manutenibili.

## Principi di Design Modulare Funzionale

### 1. Separazione delle Responsabilità

```javascript
// ❌ Modulo monolitico
export default {
  fetchData: async (url) => { /* fetch logic */ },
  processData: (data) => { /* processing logic */ },
  validateData: (data) => { /* validation logic */ },
  renderData: (data) => { /* rendering logic */ }
};

// ✅ Separazione funzionale
// modules/api.js
export const fetchData = (url) => 
  fetch(url).then(response => response.json());

// modules/processors.js
export const processData = (transformer) => (data) =>
  data.map(transformer);

// modules/validators.js
export const validateData = (schema) => (data) =>
  schema.validate(data);

// modules/renderers.js
export const renderData = (template) => (data) =>
  template(data);
```

### 2. Composizione di Moduli

```javascript
// modules/compose.js
export const compose = (...fns) => (value) =>
  fns.reduceRight((acc, fn) => fn(acc), value);

export const pipe = (...fns) => (value) =>
  fns.reduce((acc, fn) => fn(acc), value);

// app.js
import { pipe } from './modules/compose.js';
import { fetchData } from './modules/api.js';
import { processData } from './modules/processors.js';
import { validateData } from './modules/validators.js';
import { renderData } from './modules/renderers.js';

const dataFlowPipeline = pipe(
  fetchData,
  processData(normalizeUser),
  validateData(userSchema),
  renderData(userTemplate)
);

export { dataFlowPipeline };
```

## Pattern Architetturali Funzionali

### 1. Hexagonal Architecture (Ports & Adapters)

```javascript
// core/domain.js - Logica di business pura
export const createUser = (userData) => ({
  id: generateId(),
  ...userData,
  createdAt: new Date().toISOString(),
  active: true
});

export const validateUser = (user) => ({
  isValid: user.email && user.name,
  errors: []
});

// ports/userPort.js - Interfacce astratte
export const UserRepository = {
  save: (user) => { throw new Error('Not implemented'); },
  findById: (id) => { throw new Error('Not implemented'); },
  findAll: () => { throw new Error('Not implemented'); }
};

// adapters/mongoUserAdapter.js - Implementazione concreta
import { UserRepository } from '../ports/userPort.js';

export const MongoUserAdapter = {
  ...UserRepository,
  save: async (user) => {
    const collection = getDb().collection('users');
    return await collection.insertOne(user);
  },
  findById: async (id) => {
    const collection = getDb().collection('users');
    return await collection.findOne({ id });
  },
  findAll: async () => {
    const collection = getDb().collection('users');
    return await collection.find({}).toArray();
  }
};

// services/userService.js - Orchestrazione
import { createUser, validateUser } from '../core/domain.js';
import { pipe } from '../utils/compose.js';

export const createUserService = (repository) => {
  const saveUser = pipe(
    createUser,
    validateUser,
    (validatedUser) => validatedUser.isValid 
      ? repository.save(validatedUser) 
      : Promise.reject(validatedUser.errors)
  );

  return { saveUser };
};
```

### 2. Event-Driven Architecture

```javascript
// events/eventBus.js
export const createEventBus = () => {
  const listeners = new Map();

  const subscribe = (event, handler) => {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event).push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = listeners.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    };
  };

  const publish = (event, data) => {
    const handlers = listeners.get(event) || [];
    handlers.forEach(handler => handler(data));
  };

  return { subscribe, publish };
};

// events/userEvents.js
export const USER_CREATED = 'USER_CREATED';
export const USER_UPDATED = 'USER_UPDATED';
export const USER_DELETED = 'USER_DELETED';

// handlers/userHandlers.js
export const sendWelcomeEmail = (userData) => {
  console.log(`Sending welcome email to ${userData.email}`);
};

export const logUserActivity = (userData) => {
  console.log(`User activity: ${userData.action} for ${userData.userId}`);
};

export const updateUserStats = (userData) => {
  console.log(`Updating stats for user ${userData.userId}`);
};

// app.js - Setup
import { createEventBus } from './events/eventBus.js';
import { USER_CREATED } from './events/userEvents.js';
import { 
  sendWelcomeEmail, 
  logUserActivity, 
  updateUserStats 
} from './handlers/userHandlers.js';

const eventBus = createEventBus();

// Subscribe to events
eventBus.subscribe(USER_CREATED, sendWelcomeEmail);
eventBus.subscribe(USER_CREATED, logUserActivity);
eventBus.subscribe(USER_CREATED, updateUserStats);

// Publish events
eventBus.publish(USER_CREATED, {
  userId: '123',
  email: 'user@example.com',
  action: 'created'
});
```

### 3. Micro-Frontends Funzionali

```javascript
// micro-frontends/shared/eventBus.js
export const createMicroFrontendBus = () => {
  const bus = createEventBus();
  
  const mount = (element, component) => {
    element.innerHTML = '';
    element.appendChild(component);
  };

  const unmount = (element) => {
    element.innerHTML = '';
  };

  return { ...bus, mount, unmount };
};

// micro-frontends/user-profile/index.js
export const UserProfileMicroFrontend = {
  mount: (element, props) => {
    const component = createUserProfile(props);
    element.appendChild(component);
  },
  
  unmount: (element) => {
    element.innerHTML = '';
  },

  update: (element, newProps) => {
    const component = element.querySelector('.user-profile');
    if (component) {
      updateUserProfile(component, newProps);
    }
  }
};

const createUserProfile = (props) => {
  const div = document.createElement('div');
  div.className = 'user-profile';
  div.innerHTML = `
    <h2>${props.user.name}</h2>
    <p>${props.user.email}</p>
  `;
  return div;
};

// micro-frontends/dashboard/index.js
import { UserProfileMicroFrontend } from '../user-profile/index.js';
import { createMicroFrontendBus } from '../shared/eventBus.js';

export const DashboardApp = {
  init: (container) => {
    const bus = createMicroFrontendBus();
    
    // Create sections
    const userSection = container.querySelector('#user-section');
    const contentSection = container.querySelector('#content-section');
    
    // Mount micro-frontends
    UserProfileMicroFrontend.mount(userSection, {
      user: { name: 'John Doe', email: 'john@example.com' }
    });
    
    // Inter-micro-frontend communication
    bus.subscribe('USER_UPDATED', (userData) => {
      UserProfileMicroFrontend.update(userSection, { user: userData });
    });
  }
};
```

## Dependency Injection Funzionale

```javascript
// di/container.js
export const createContainer = () => {
  const services = new Map();
  const factories = new Map();

  const register = (name, factory) => {
    factories.set(name, factory);
  };

  const resolve = (name) => {
    if (services.has(name)) {
      return services.get(name);
    }

    const factory = factories.get(name);
    if (!factory) {
      throw new Error(`Service ${name} not found`);
    }

    const service = factory(resolve);
    services.set(name, service);
    return service;
  };

  return { register, resolve };
};

// services/setup.js
import { createContainer } from '../di/container.js';
import { MongoUserAdapter } from '../adapters/mongoUserAdapter.js';
import { createUserService } from '../services/userService.js';

export const setupContainer = () => {
  const container = createContainer();

  container.register('userRepository', () => MongoUserAdapter);
  
  container.register('userService', (resolve) => 
    createUserService(resolve('userRepository'))
  );

  container.register('emailService', () => ({
    send: (to, subject, body) => console.log(`Email sent to ${to}`)
  }));

  return container;
};

// app.js
import { setupContainer } from './services/setup.js';

const container = setupContainer();
const userService = container.resolve('userService');
const emailService = container.resolve('emailService');
```

## Testing di Architetture Modulari

```javascript
// tests/userService.test.js
import { test, expect } from 'vitest';
import { createUserService } from '../services/userService.js';

const mockRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn()
};

test('should create user successfully', async () => {
  mockRepository.save.mockResolvedValue({ id: '123' });
  
  const service = createUserService(mockRepository);
  const result = await service.saveUser({
    name: 'John Doe',
    email: 'john@example.com'
  });

  expect(mockRepository.save).toHaveBeenCalled();
  expect(result.id).toBe('123');
});

// tests/integration.test.js
import { test, expect } from 'vitest';
import { setupContainer } from '../services/setup.js';

test('should integrate services correctly', () => {
  const container = setupContainer();
  
  const userService = container.resolve('userService');
  const emailService = container.resolve('emailService');

  expect(userService).toBeDefined();
  expect(emailService).toBeDefined();
  expect(typeof userService.saveUser).toBe('function');
});
```

## Best Practices

### 1. Naming Conventions

```javascript
// ✅ Buone convenzioni
// modules/user/
//   ├── domain/
//   │   ├── user.js          // Entities
//   │   └── userService.js   // Services
//   ├── infrastructure/
//   │   ├── userRepository.js
//   │   └── userAdapter.js
//   └── presentation/
//       ├── userController.js
//       └── userView.js

// File naming: kebab-case
// Function naming: camelCase
// Constant naming: UPPER_CASE
// Class naming: PascalCase
```

### 2. Module Dependencies

```javascript
// ✅ Dipendenze chiare e minimali
// utils/validation.js
export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isRequired = (value) => value != null && value !== '';

// services/userService.js
import { isEmail, isRequired } from '../utils/validation.js';
// Solo le dipendenze necessarie

// ❌ Dipendenze circolari
// service-a.js imports service-b.js
// service-b.js imports service-a.js
```

### 3. Error Boundaries

```javascript
// errors/errorBoundary.js
export const createErrorBoundary = (fallback) => (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Error caught by boundary:', error);
      return fallback(error);
    }
  };
};

// Usage
const safeUserCreation = createErrorBoundary(
  (error) => ({ success: false, error: error.message })
)(createUser);
```

## Conclusioni

L'architettura modulare funzionale offre:

- **Scalabilità**: Moduli indipendenti e riutilizzabili
- **Testabilità**: Unità isolate e facilmente testabili
- **Manutenibilità**: Separazione chiara delle responsabilità
- **Flessibilità**: Composizione dinamica di comportamenti

Nel prossimo capitolo esploreremo come integrare questi pattern con framework moderni come React, Vue e Node.js.
