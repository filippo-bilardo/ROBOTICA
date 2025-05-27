/**
 * Module 15 - Modern JavaScript Integration
 * Example 05: Vue.js Functional Composition with Composition API
 * 
 * This example demonstrates using Vue 3's Composition API with functional programming
 * principles, including composables, reactive utilities, and functional patterns.
 */

// Utility functions for functional programming
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);
const curry = (fn) => (...args) => args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args));

// Pure validation functions
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => password.length >= 8;
const isValidName = (name) => name.trim().length >= 2;

const validateField = curry((validator, value) => ({
    isValid: validator(value),
    error: validator(value) ? null : 'Invalid value'
}));

// Composable for form validation
const useFormValidation = (validationRules) => {
    const { reactive, computed } = Vue;
    
    const errors = reactive({});
    
    const validateField = (field, value) => {
        const validator = validationRules[field];
        if (validator) {
            const isValid = validator(value);
            errors[field] = isValid ? null : `Invalid ${field}`;
            return isValid;
        }
        return true;
    };
    
    const validateForm = (formData) => {
        let isFormValid = true;
        Object.keys(validationRules).forEach(field => {
            const isFieldValid = validateField(field, formData[field]);
            if (!isFieldValid) isFormValid = false;
        });
        return isFormValid;
    };
    
    const clearErrors = () => {
        Object.keys(errors).forEach(key => {
            errors[key] = null;
        });
    };
    
    const hasErrors = computed(() => 
        Object.values(errors).some(error => error !== null)
    );
    
    return {
        errors,
        validateField,
        validateForm,
        clearErrors,
        hasErrors
    };
};

// Composable for async data fetching
const useAsyncData = (asyncFunction, options = {}) => {
    const { ref, watchEffect } = Vue;
    const { immediate = true, dependencies = [] } = options;
    
    const data = ref(null);
    const loading = ref(false);
    const error = ref(null);
    
    const execute = async (...args) => {
        loading.value = true;
        error.value = null;
        
        try {
            const result = await asyncFunction(...args);
            data.value = result;
            return result;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    if (immediate) {
        watchEffect(() => {
            execute();
        });
    }
    
    return {
        data,
        loading,
        error,
        execute
    };
};

// Composable for local storage
const useLocalStorage = (key, defaultValue) => {
    const { ref, watch } = Vue;
    
    const storedValue = ref((() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    })());
    
    const setValue = (value) => {
        try {
            storedValue.value = value;
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    };
    
    watch(storedValue, (newValue) => {
        localStorage.setItem(key, JSON.stringify(newValue));
    }, { deep: true });
    
    return [storedValue, setValue];
};

// Composable for debounced input
const useDebounce = (value, delay = 300) => {
    const { ref, watch } = Vue;
    const debouncedValue = ref(value.value);
    
    watch(value, (newValue) => {
        const timer = setTimeout(() => {
            debouncedValue.value = newValue;
        }, delay);
        
        return () => clearTimeout(timer);
    });
    
    return debouncedValue;
};

// State management composable
const createStore = (initialState, actions) => {
    const { reactive, readonly } = Vue;
    const state = reactive(initialState);
    
    const dispatch = (actionName, payload) => {
        const action = actions[actionName];
        if (action) {
            return action(state, payload);
        }
        console.warn(`Action ${actionName} not found`);
    };
    
    return {
        state: readonly(state),
        dispatch
    };
};

// User store
const useUserStore = () => {
    const initialState = {
        users: [],
        currentUser: null,
        loading: false,
        error: null
    };
    
    const actions = {
        setLoading: (state, loading) => {
            state.loading = loading;
        },
        
        setError: (state, error) => {
            state.error = error;
        },
        
        setUsers: (state, users) => {
            state.users = users;
            state.loading = false;
            state.error = null;
        },
        
        addUser: (state, user) => {
            state.users.push(user);
        },
        
        updateUser: (state, { id, userData }) => {
            const index = state.users.findIndex(user => user.id === id);
            if (index !== -1) {
                state.users[index] = { ...state.users[index], ...userData };
            }
        },
        
        removeUser: (state, userId) => {
            state.users = state.users.filter(user => user.id !== userId);
        },
        
        setCurrentUser: (state, user) => {
            state.currentUser = user;
        }
    };
    
    return createStore(initialState, actions);
};

// API functions using functional patterns
const api = {
    fetchUsers: () => 
        fetch('/api/users').then(response => response.json()),
    
    createUser: (userData) =>
        fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        }).then(response => response.json()),
    
    updateUser: (id, userData) =>
        fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        }).then(response => response.json()),
    
    deleteUser: (id) =>
        fetch(`/api/users/${id}`, {
            method: 'DELETE'
        }).then(response => response.json())
};

// Vue component using Composition API with functional patterns
const UserForm = {
    name: 'UserForm',
    props: {
        initialData: {
            type: Object,
            default: () => ({})
        },
        mode: {
            type: String,
            default: 'create', // 'create' or 'edit'
            validator: value => ['create', 'edit'].includes(value)
        }
    },
    emits: ['submit', 'cancel'],
    setup(props, { emit }) {
        const { reactive, computed, watch } = Vue;
        
        // Form state
        const form = reactive({
            name: props.initialData.name || '',
            email: props.initialData.email || '',
            password: props.mode === 'create' ? '' : undefined
        });
        
        // Validation rules
        const validationRules = {
            name: isValidName,
            email: isValidEmail,
            ...(props.mode === 'create' && { password: isValidPassword })
        };
        
        const { errors, validateField, validateForm, hasErrors } = useFormValidation(validationRules);
        
        // Debounced validation
        const debouncedForm = useDebounce(Vue.ref(form));
        watch(debouncedForm, (newForm) => {
            Object.keys(validationRules).forEach(field => {
                if (newForm[field]) {
                    validateField(field, newForm[field]);
                }
            });
        }, { deep: true });
        
        // Form submission
        const handleSubmit = () => {
            if (validateForm(form)) {
                emit('submit', { ...form });
            }
        };
        
        const handleCancel = () => {
            emit('cancel');
        };
        
        const isSubmitDisabled = computed(() => 
            hasErrors.value || Object.values(form).some(value => !value)
        );
        
        return {
            form,
            errors,
            handleSubmit,
            handleCancel,
            isSubmitDisabled
        };
    },
    template: `
        <form @submit.prevent="handleSubmit" class="user-form">
            <h3>{{ mode === 'create' ? 'Create User' : 'Edit User' }}</h3>
            
            <div class="form-field">
                <label for="name">Name:</label>
                <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    :class="{ error: errors.name }"
                    placeholder="Enter full name"
                />
                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>
            
            <div class="form-field">
                <label for="email">Email:</label>
                <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    :class="{ error: errors.email }"
                    placeholder="Enter email address"
                />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>
            
            <div v-if="mode === 'create'" class="form-field">
                <label for="password">Password:</label>
                <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    :class="{ error: errors.password }"
                    placeholder="Enter password (min 8 characters)"
                />
                <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>
            
            <div class="form-actions">
                <button type="submit" :disabled="isSubmitDisabled" class="btn-primary">
                    {{ mode === 'create' ? 'Create' : 'Update' }}
                </button>
                <button type="button" @click="handleCancel" class="btn-secondary">
                    Cancel
                </button>
            </div>
        </form>
    `
};

// User list component
const UserList = {
    name: 'UserList',
    props: {
        users: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['edit', 'delete'],
    setup(props, { emit }) {
        const handleEdit = (user) => {
            emit('edit', user);
        };
        
        const handleDelete = (userId) => {
            if (confirm('Are you sure you want to delete this user?')) {
                emit('delete', userId);
            }
        };
        
        return {
            handleEdit,
            handleDelete
        };
    },
    template: `
        <div class="user-list">
            <h3>Users</h3>
            
            <div v-if="loading" class="loading">Loading users...</div>
            
            <div v-else-if="users.length === 0" class="empty-state">
                No users found
            </div>
            
            <div v-else class="user-cards">
                <div 
                    v-for="user in users" 
                    :key="user.id" 
                    class="user-card"
                >
                    <div class="user-info">
                        <h4>{{ user.name }}</h4>
                        <p>{{ user.email }}</p>
                        <small>Created: {{ new Date(user.createdAt).toLocaleDateString() }}</small>
                    </div>
                    <div class="user-actions">
                        <button @click="handleEdit(user)" class="btn-small btn-primary">
                            Edit
                        </button>
                        <button @click="handleDelete(user.id)" class="btn-small btn-danger">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Main application component
const App = {
    name: 'App',
    components: {
        UserForm,
        UserList
    },
    setup() {
        const { ref, reactive, onMounted } = Vue;
        
        // Store
        const userStore = useUserStore();
        
        // UI state
        const activeTab = ref('list');
        const editingUser = ref(null);
        
        // Local storage for tab preference
        const [savedTab, setSavedTab] = useLocalStorage('activeTab', 'list');
        activeTab.value = savedTab.value;
        
        // Watch tab changes and save to localStorage
        Vue.watch(activeTab, (newTab) => {
            setSavedTab(newTab);
        });
        
        // Async data fetching
        const { execute: fetchUsers } = useAsyncData(
            async () => {
                userStore.dispatch('setLoading', true);
                try {
                    const response = await api.fetchUsers();
                    userStore.dispatch('setUsers', response.data || []);
                } catch (error) {
                    userStore.dispatch('setError', error.message);
                    console.error('Failed to fetch users:', error);
                }
            },
            { immediate: false }
        );
        
        // Methods
        const setActiveTab = (tab) => {
            activeTab.value = tab;
            editingUser.value = null;
        };
        
        const handleCreateUser = async (userData) => {
            try {
                const response = await api.createUser(userData);
                if (response.success) {
                    userStore.dispatch('addUser', response.data);
                    activeTab.value = 'list';
                }
            } catch (error) {
                console.error('Failed to create user:', error);
            }
        };
        
        const handleEditUser = (user) => {
            editingUser.value = user;
            activeTab.value = 'form';
        };
        
        const handleUpdateUser = async (userData) => {
            try {
                const response = await api.updateUser(editingUser.value.id, userData);
                if (response.success) {
                    userStore.dispatch('updateUser', {
                        id: editingUser.value.id,
                        userData: response.data
                    });
                    editingUser.value = null;
                    activeTab.value = 'list';
                }
            } catch (error) {
                console.error('Failed to update user:', error);
            }
        };
        
        const handleDeleteUser = async (userId) => {
            try {
                const response = await api.deleteUser(userId);
                if (response.success) {
                    userStore.dispatch('removeUser', userId);
                }
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        };
        
        const handleFormCancel = () => {
            editingUser.value = null;
            activeTab.value = 'list';
        };
        
        // Load users on mount
        onMounted(() => {
            fetchUsers();
        });
        
        return {
            userStore,
            activeTab,
            editingUser,
            setActiveTab,
            handleCreateUser,
            handleEditUser,
            handleUpdateUser,
            handleDeleteUser,
            handleFormCancel
        };
    },
    template: `
        <div class="app">
            <header class="app-header">
                <h1>User Management</h1>
                <nav class="tab-nav">
                    <button 
                        @click="setActiveTab('list')"
                        :class="{ active: activeTab === 'list' }"
                        class="tab-button"
                    >
                        User List
                    </button>
                    <button 
                        @click="setActiveTab('form')"
                        :class="{ active: activeTab === 'form' }"
                        class="tab-button"
                    >
                        {{ editingUser ? 'Edit User' : 'Add User' }}
                    </button>
                </nav>
            </header>
            
            <main class="app-content">
                <UserList
                    v-if="activeTab === 'list'"
                    :users="userStore.state.users"
                    :loading="userStore.state.loading"
                    @edit="handleEditUser"
                    @delete="handleDeleteUser"
                />
                
                <UserForm
                    v-if="activeTab === 'form'"
                    :initial-data="editingUser || {}"
                    :mode="editingUser ? 'edit' : 'create'"
                    @submit="editingUser ? handleUpdateUser : handleCreateUser"
                    @cancel="handleFormCancel"
                />
            </main>
        </div>
    `
};

// Application styles
const styles = `
.app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.app-header {
    margin-bottom: 30px;
}

.app-header h1 {
    margin: 0 0 20px 0;
    color: #333;
}

.tab-nav {
    display: flex;
    border-bottom: 1px solid #ddd;
}

.tab-button {
    padding: 10px 20px;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
}

.tab-button.active {
    border-bottom-color: #007bff;
    color: #007bff;
}

.user-form {
    max-width: 500px;
    margin: 0 auto;
}

.form-field {
    margin-bottom: 20px;
}

.form-field label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}

.form-field input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

.form-field input:focus {
    outline: none;
    border-color: #007bff;
}

.form-field input.error {
    border-color: #dc3545;
}

.error-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 5px;
    display: block;
}

.form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 30px;
}

.btn-primary, .btn-secondary, .btn-small, .btn-danger {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
}

.btn-small {
    padding: 5px 10px;
    font-size: 14px;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background-color: #0056b3;
}

.btn-primary:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #545b62;
}

.btn-danger {
    background-color: #dc3545;
    color: white;
}

.btn-danger:hover {
    background-color: #c82333;
}

.user-list h3 {
    margin-bottom: 20px;
}

.loading, .empty-state {
    text-align: center;
    padding: 40px;
    color: #6c757d;
}

.user-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.user-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.user-card:hover {
    transform: translateY(-2px);
}

.user-info h4 {
    margin: 0 0 10px 0;
    color: #333;
}

.user-info p {
    margin: 0 0 10px 0;
    color: #666;
}

.user-info small {
    color: #888;
}

.user-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
}
`;

// Initialize Vue application
const initApp = () => {
    // Add styles to document
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Create and mount Vue app
    const { createApp } = Vue;
    const app = createApp(App);
    
    app.mount('#app');
    
    return app;
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        App,
        UserForm,
        UserList,
        useFormValidation,
        useAsyncData,
        useLocalStorage,
        useDebounce,
        useUserStore,
        createStore,
        initApp
    };
}

// Auto-initialize if DOM is ready and Vue is available
if (typeof window !== 'undefined' && window.Vue) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
}

// Example HTML file to use this application:
/*
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue.js Functional Composition Example</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
    <div id="app"></div>
    <script src="05-VueFunctionalComposition.js"></script>
</body>
</html>
*/
