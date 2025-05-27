# Integrazione con Framework Moderni

## Introduzione

I framework JavaScript moderni come React, Vue, e Node.js offrono eccellenti opportunità per applicare principi funzionali. Questo capitolo esplora come integrare la programmazione funzionale con questi framework in modo naturale e produttivo.

## React e Programmazione Funzionale

### 1. Functional Components e Hooks

```javascript
// components/UserProfile.js
import { useState, useEffect, useMemo } from 'react';
import { pipe } from '../utils/compose.js';
import { fetchUser, validateUser, formatUser } from '../services/userService.js';

// Pure functional component
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Functional approach to data processing
  const processUser = useMemo(
    () => pipe(
      validateUser,
      formatUser,
      (user) => ({ ...user, displayName: `${user.firstName} ${user.lastName}` })
    ),
    []
  );

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await fetchUser(userId);
        const processedUser = processUser(userData);
        setUser(processedUser);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, processUser]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.displayName}</h2>
      <p>{user.email}</p>
      <p>Member since: {user.memberSince}</p>
    </div>
  );
};

export default UserProfile;
```

### 2. Custom Hooks Funzionali

```javascript
// hooks/useAsyncData.js
import { useState, useEffect } from 'react';

export const useAsyncData = (asyncFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const executeAsync = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFn();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    executeAsync();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
};

// hooks/useFunctionalReducer.js
import { useReducer } from 'react';

export const useFunctionalReducer = (reducers, initialState) => {
  const reducer = (state, action) => {
    const handler = reducers[action.type];
    return handler ? handler(state)(action.payload) : state;
  };

  return useReducer(reducer, initialState);
};

// Usage
const userReducers = {
  SET_USER: (state) => (user) => ({ ...state, user }),
  SET_LOADING: (state) => (loading) => ({ ...state, loading }),
  SET_ERROR: (state) => (error) => ({ ...state, error })
};

const UserComponent = () => {
  const [state, dispatch] = useFunctionalReducer(userReducers, {
    user: null,
    loading: false,
    error: null
  });

  // Usage
  dispatch({ type: 'SET_USER', payload: userData });
};
```

### 3. Higher-Order Components Funzionali

```javascript
// hoc/withAsyncData.js
export const withAsyncData = (asyncDataFetcher) => (WrappedComponent) => {
  return function WithAsyncDataComponent(props) {
    const { data, loading, error } = useAsyncData(
      () => asyncDataFetcher(props),
      [props.id]
    );

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return <WrappedComponent {...props} data={data} />;
  };
};

// hoc/withErrorBoundary.js
export const withErrorBoundary = (FallbackComponent) => (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return <FallbackComponent error={this.state.error} />;
      }

      return <WrappedComponent {...this.props} />;
    }
  };
};

// Usage
const EnhancedUserProfile = pipe(
  withAsyncData(fetchUserData),
  withErrorBoundary(ErrorFallback)
)(UserProfile);
```

## Vue.js e Composition API

### 1. Composables Funzionali

```javascript
// composables/useUser.js
import { ref, computed, onMounted } from 'vue';
import { pipe } from '../utils/compose.js';

export function useUser(userId) {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fullName = computed(() => 
    user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
  );

  const processUser = pipe(
    validateUserData,
    formatUserData,
    enrichUserData
  );

  const fetchUser = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const userData = await getUserById(userId.value);
      user.value = processUser(userData);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (userId.value) {
      fetchUser();
    }
  });

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    fullName,
    refetchUser: fetchUser
  };
}

// composables/useAsyncState.js
export function useAsyncState(asyncFn, initialValue = null) {
  const data = ref(initialValue);
  const loading = ref(false);
  const error = ref(null);

  const execute = async (...args) => {
    try {
      loading.value = true;
      error.value = null;
      data.value = await asyncFn(...args);
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    execute
  };
}
```

### 2. Vue Component Funzionale

```javascript
// components/UserCard.vue
<template>
  <div class="user-card" v-if="!loading">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else-if="user" class="user-info">
      <h3>{{ fullName }}</h3>
      <p>{{ user.email }}</p>
      <div class="stats">
        <span>Posts: {{ user.postsCount }}</span>
        <span>Followers: {{ user.followersCount }}</span>
      </div>
    </div>
  </div>
  <div v-else class="loading">Loading...</div>
</template>

<script setup>
import { computed } from 'vue';
import { useUser } from '../composables/useUser.js';

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
});

const { user, loading, error, fullName } = useUser(computed(() => props.userId));
</script>

// Functional component alternative
// components/FunctionalUserCard.js
import { h } from 'vue';

export const FunctionalUserCard = (props, { slots }) => {
  const { user, loading, error } = useUser(props.userId);

  if (loading.value) {
    return h('div', { class: 'loading' }, 'Loading...');
  }

  if (error.value) {
    return h('div', { class: 'error' }, error.value);
  }

  if (!user.value) {
    return h('div', { class: 'no-user' }, 'User not found');
  }

  return h('div', { class: 'user-card' }, [
    h('h3', user.value.fullName),
    h('p', user.value.email),
    slots.default?.()
  ]);
};
```

## Node.js e Express Funzionale

### 1. Middleware Funzionali

```javascript
// middleware/functional.js
export const compose = (...middlewares) => (req, res, next) => {
  const executeMiddleware = (index) => {
    if (index >= middlewares.length) {
      return next();
    }

    const middleware = middlewares[index];
    middleware(req, res, (err) => {
      if (err) return next(err);
      executeMiddleware(index + 1);
    });
  };

  executeMiddleware(0);
};

export const asyncMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details 
    });
  }
  next();
};

export const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Usage
app.use('/api/users', compose(
  authenticateUser,
  validateRequest(userSchema),
  asyncMiddleware(userController)
));
```

### 2. Controller Funzionali

```javascript
// controllers/userController.js
import { pipe } from '../utils/compose.js';
import { 
  validateUserData, 
  createUser, 
  saveUser 
} from '../services/userService.js';

const handleSuccess = (res) => (data) => 
  res.status(200).json({ success: true, data });

const handleError = (res) => (error) =>
  res.status(500).json({ success: false, error: error.message });

export const createUserController = (userService) => {
  return asyncMiddleware(async (req, res) => {
    const createUserFlow = pipe(
      validateUserData,
      createUser,
      userService.save,
      handleSuccess(res)
    );

    try {
      await createUserFlow(req.body);
    } catch (error) {
      handleError(res)(error);
    }
  });
};

export const getUserController = (userService) => {
  return asyncMiddleware(async (req, res) => {
    try {
      const user = await userService.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      handleSuccess(res)(user);
    } catch (error) {
      handleError(res)(error);
    }
  });
};

// routes/userRoutes.js
import express from 'express';
import { createUserController, getUserController } from '../controllers/userController.js';

export const createUserRoutes = (userService) => {
  const router = express.Router();

  router.post('/', createUserController(userService));
  router.get('/:id', getUserController(userService));

  return router;
};
```

### 3. Functional API Design

```javascript
// api/functionalAPI.js
export const createAPI = (services) => {
  const routes = new Map();

  const route = (method, path, ...handlers) => {
    const key = `${method.toUpperCase()}:${path}`;
    routes.set(key, compose(...handlers));
    return { route, get, post, put, delete: del };
  };

  const get = (path, ...handlers) => route('GET', path, ...handlers);
  const post = (path, ...handlers) => route('POST', path, ...handlers);
  const put = (path, ...handlers) => route('PUT', path, ...handlers);
  const del = (path, ...handlers) => route('DELETE', path, ...handlers);

  const handle = (req, res) => {
    const key = `${req.method}:${req.path}`;
    const handler = routes.get(key);
    
    if (!handler) {
      return res.status(404).json({ error: 'Route not found' });
    }

    handler(req, res, (err) => {
      if (err) {
        console.error('API Error:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  };

  return { route, get, post, put, delete: del, handle };
};

// Usage
const api = createAPI(services);

api
  .get('/users/:id', authenticateUser, getUserController)
  .post('/users', authenticateUser, validateRequest(userSchema), createUserController)
  .put('/users/:id', authenticateUser, validateRequest(userSchema), updateUserController)
  .delete('/users/:id', authenticateUser, deleteUserController);

app.use('/api', api.handle);
```

## Testing Framework Integration

### 1. React Testing con Functional Approach

```javascript
// tests/UserProfile.test.js
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UserProfile from '../components/UserProfile.js';

const mockUserService = {
  fetchUser: vi.fn(),
  validateUser: vi.fn(user => user),
  formatUser: vi.fn(user => user)
};

// Mock dependencies
vi.mock('../services/userService.js', () => mockUserService);

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render user profile when data is loaded', async () => {
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };

    mockUserService.fetchUser.mockResolvedValue(mockUser);

    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  test('should handle loading state', () => {
    mockUserService.fetchUser.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<UserProfile userId="123" />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### 2. Vue Testing con Composition API

```javascript
// tests/UserCard.test.js
import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import UserCard from '../components/UserCard.vue';

const mockUseUser = vi.fn();
vi.mock('../composables/useUser.js', () => ({
  useUser: mockUseUser
}));

describe('UserCard', () => {
  test('should render user information', () => {
    mockUseUser.mockReturnValue({
      user: ref({ fullName: 'John Doe', email: 'john@example.com' }),
      loading: ref(false),
      error: ref(null),
      fullName: computed(() => 'John Doe')
    });

    const wrapper = mount(UserCard, {
      props: { userId: '123' }
    });

    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('john@example.com');
  });
});
```

### 3. Node.js Testing con Functional Patterns

```javascript
// tests/userController.test.js
import request from 'supertest';
import { createApp } from '../app.js';

const mockUserService = {
  save: vi.fn(),
  findById: vi.fn()
};

describe('User API', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp(mockUserService);
  });

  test('should create user successfully', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    mockUserService.save.mockResolvedValue({ id: '123', ...userData });

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe('123');
  });
});
```

## Best Practices per Framework Integration

### 1. Separazione delle Responsabilità

```javascript
// ✅ Buona separazione
// services/userService.js - Business logic
// components/UserProfile.js - Presentation logic
// hooks/useUser.js - State management logic
// utils/api.js - Data fetching logic

// ❌ Cattiva separazione
// components/UserProfile.js - Contains everything
```

### 2. Dependency Injection

```javascript
// ✅ Dependency injection
const UserProfile = ({ userService, userId }) => {
  // Component uses injected service
};

// ❌ Direct dependencies
const UserProfile = ({ userId }) => {
  // Component directly imports and uses service
};
```

### 3. Error Boundaries

```javascript
// React Error Boundary
const ErrorBoundary = ({ children, fallback }) => {
  // Error boundary implementation
};

// Vue Error Handling
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err, info);
};

// Node.js Error Handling
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
```

## Conclusioni

L'integrazione della programmazione funzionale con framework moderni offre:

- **Codice più prevedibile**: Funzioni pure e immutabilità
- **Testing semplificato**: Componenti e funzioni facilmente testabili
- **Riutilizzabilità**: Logica di business separata dalla presentazione
- **Manutenibilità**: Architettura modulare e composabile

Nel prossimo capitolo esploreremo le tecniche di ottimizzazione delle performance per applicazioni funzionali.
