/**
 * Module 15 - Modern JavaScript Integration
 * Example 03: React Functional Components with FP Principles
 * 
 * This example demonstrates how to build React components using functional programming
 * principles, including pure components, higher-order components, and functional patterns.
 */

// Utility functions for functional programming in React
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);
const curry = (fn) => (...args) => args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args));

// Pure validation functions
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => password.length >= 8;
const isValidName = (name) => name.trim().length >= 2;

const validateField = curry((validator, fieldName, value) => ({
    field: fieldName,
    value,
    isValid: validator(value),
    error: validator(value) ? null : `Invalid ${fieldName}`
}));

// Higher-order function for creating validators
const createValidator = (validations) => (data) => 
    Object.keys(validations).reduce((acc, field) => {
        const validator = validations[field];
        const result = validateField(validator, field, data[field] || '');
        return { ...acc, [field]: result };
    }, {});

// Form validation configuration
const userFormValidation = createValidator({
    email: isValidEmail,
    password: isValidPassword,
    name: isValidName
});

// Pure state transformation functions
const updateField = curry((field, value, state) => ({
    ...state,
    [field]: value
}));

const resetForm = (initialState) => () => initialState;

const submitForm = (formData) => {
    console.log('Submitting form:', formData);
    // In real app, this would make an API call
    return Promise.resolve({ success: true, data: formData });
};

// Higher-Order Component for form handling
const withFormHandling = (Component) => {
    return function FormHandledComponent(props) {
        const [formState, setFormState] = React.useState(props.initialState || {});
        const [errors, setErrors] = React.useState({});
        const [isSubmitting, setIsSubmitting] = React.useState(false);

        const handleFieldChange = React.useCallback(
            pipe(
                (event) => ({ field: event.target.name, value: event.target.value }),
                ({ field, value }) => updateField(field, value, formState),
                setFormState
            ),
            [formState]
        );

        const validateForm = React.useCallback(() => {
            const validationResults = userFormValidation(formState);
            const newErrors = Object.keys(validationResults)
                .filter(field => !validationResults[field].isValid)
                .reduce((acc, field) => ({
                    ...acc,
                    [field]: validationResults[field].error
                }), {});
            
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }, [formState]);

        const handleSubmit = React.useCallback(async (event) => {
            event.preventDefault();
            
            if (!validateForm()) return;
            
            setIsSubmitting(true);
            try {
                await submitForm(formState);
                setFormState(props.initialState || {});
                setErrors({});
            } catch (error) {
                setErrors({ submit: error.message });
            } finally {
                setIsSubmitting(false);
            }
        }, [formState, validateForm, props.initialState]);

        return React.createElement(Component, {
            ...props,
            formState,
            errors,
            isSubmitting,
            onFieldChange: handleFieldChange,
            onSubmit: handleSubmit,
            onReset: () => setFormState(props.initialState || {})
        });
    };
};

// Pure functional components
const FormField = ({ 
    type = 'text', 
    name, 
    value = '', 
    placeholder, 
    onChange, 
    error 
}) => React.createElement('div', { className: 'form-field' },
    React.createElement('input', {
        type,
        name,
        value,
        placeholder,
        onChange,
        className: error ? 'error' : ''
    }),
    error && React.createElement('span', { className: 'error-message' }, error)
);

const Button = ({ 
    type = 'button', 
    onClick, 
    disabled = false, 
    children,
    variant = 'primary'
}) => React.createElement('button', {
    type,
    onClick,
    disabled,
    className: `btn btn-${variant} ${disabled ? 'disabled' : ''}`
}, children);

// Main form component using functional patterns
const UserForm = ({ 
    formState, 
    errors, 
    isSubmitting, 
    onFieldChange, 
    onSubmit, 
    onReset 
}) => {
    const formFields = [
        { name: 'name', type: 'text', placeholder: 'Full Name' },
        { name: 'email', type: 'email', placeholder: 'Email Address' },
        { name: 'password', type: 'password', placeholder: 'Password' }
    ];

    return React.createElement('form', { onSubmit },
        React.createElement('h2', null, 'User Registration'),
        
        ...formFields.map(field => 
            React.createElement(FormField, {
                key: field.name,
                ...field,
                value: formState[field.name] || '',
                onChange: onFieldChange,
                error: errors[field.name]
            })
        ),

        errors.submit && React.createElement('div', { className: 'error-message' }, errors.submit),

        React.createElement('div', { className: 'form-actions' },
            React.createElement(Button, {
                type: 'submit',
                disabled: isSubmitting
            }, isSubmitting ? 'Submitting...' : 'Submit'),
            
            React.createElement(Button, {
                type: 'button',
                variant: 'secondary',
                onClick: onReset
            }, 'Reset')
        )
    );
};

// Enhanced UserForm with form handling HOC
const EnhancedUserForm = withFormHandling(UserForm);

// Custom hooks using functional patterns
const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = React.useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return initialValue;
        }
    });

    const setValue = React.useCallback((value) => {
        try {
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    }, [key]);

    return [storedValue, setValue];
};

const useAsyncData = (asyncFunction, dependencies = []) => {
    const [state, setState] = React.useState({
        data: null,
        loading: true,
        error: null
    });

    React.useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            
            try {
                const result = await asyncFunction();
                if (!cancelled) {
                    setState({ data: result, loading: false, error: null });
                }
            } catch (error) {
                if (!cancelled) {
                    setState({ data: null, loading: false, error });
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, dependencies);

    return state;
};

// Data fetching with functional patterns
const fetchUsers = () => 
    fetch('/api/users')
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching users:', error);
            throw error;
        });

const UserList = () => {
    const { data: users, loading, error } = useAsyncData(fetchUsers);

    if (loading) return React.createElement('div', null, 'Loading users...');
    if (error) return React.createElement('div', null, `Error: ${error.message}`);
    if (!users?.length) return React.createElement('div', null, 'No users found');

    return React.createElement('div', { className: 'user-list' },
        React.createElement('h2', null, 'Users'),
        React.createElement('ul', null,
            ...users.map(user => 
                React.createElement('li', { key: user.id },
                    `${user.name} (${user.email})`
                )
            )
        )
    );
};

// State management with functional patterns
const createStore = (reducer, initialState) => {
    let state = initialState;
    const listeners = [];

    return {
        getState: () => state,
        dispatch: (action) => {
            state = reducer(state, action);
            listeners.forEach(listener => listener(state));
        },
        subscribe: (listener) => {
            listeners.push(listener);
            return () => {
                const index = listeners.indexOf(listener);
                if (index > -1) listeners.splice(index, 1);
            };
        }
    };
};

// Reducer for user management
const userReducer = (state = { users: [], loading: false }, action) => {
    switch (action.type) {
        case 'FETCH_USERS_START':
            return { ...state, loading: true };
        case 'FETCH_USERS_SUCCESS':
            return { users: action.payload, loading: false };
        case 'ADD_USER':
            return { ...state, users: [...state.users, action.payload] };
        case 'REMOVE_USER':
            return { 
                ...state, 
                users: state.users.filter(user => user.id !== action.payload) 
            };
        default:
            return state;
    }
};

// Example usage of the store
const userStore = createStore(userReducer, { users: [], loading: false });

// Connect React component to store
const withStore = (store, Component) => {
    return function ConnectedComponent(props) {
        const [state, setState] = React.useState(store.getState());

        React.useEffect(() => {
            const unsubscribe = store.subscribe(setState);
            return unsubscribe;
        }, []);

        return React.createElement(Component, {
            ...props,
            ...state,
            dispatch: store.dispatch
        });
    };
};

// Connected UserList component
const ConnectedUserList = withStore(userStore, ({ users, loading, dispatch }) => {
    React.useEffect(() => {
        dispatch({ type: 'FETCH_USERS_START' });
        fetchUsers()
            .then(users => dispatch({ type: 'FETCH_USERS_SUCCESS', payload: users }))
            .catch(error => console.error('Failed to fetch users:', error));
    }, [dispatch]);

    if (loading) return React.createElement('div', null, 'Loading...');

    return React.createElement('div', null,
        React.createElement('h2', null, 'Users from Store'),
        React.createElement('ul', null,
            ...users.map(user => 
                React.createElement('li', { key: user.id },
                    user.name,
                    React.createElement('button', {
                        onClick: () => dispatch({ type: 'REMOVE_USER', payload: user.id })
                    }, 'Remove')
                )
            )
        )
    );
});

// App component combining all examples
const App = () => {
    const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'form');

    const tabs = [
        { id: 'form', label: 'User Form', component: EnhancedUserForm },
        { id: 'list', label: 'User List', component: UserList },
        { id: 'store', label: 'Store Example', component: ConnectedUserList }
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || tabs[0].component;

    return React.createElement('div', { className: 'app' },
        React.createElement('nav', { className: 'tabs' },
            ...tabs.map(tab =>
                React.createElement('button', {
                    key: tab.id,
                    className: `tab ${activeTab === tab.id ? 'active' : ''}`,
                    onClick: () => setActiveTab(tab.id)
                }, tab.label)
            )
        ),
        React.createElement('main', { className: 'content' },
            React.createElement(ActiveComponent, {
                initialState: { name: '', email: '', password: '' }
            })
        )
    );
};

// Example CSS (would be in a separate file)
const styles = `
.app {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.tabs {
    display: flex;
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
}

.tab {
    padding: 10px 20px;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
}

.tab.active {
    border-bottom-color: #007bff;
    color: #007bff;
}

.form-field {
    margin-bottom: 15px;
}

.form-field input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
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
    margin-top: 20px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.user-list ul {
    list-style: none;
    padding: 0;
}

.user-list li {
    padding: 10px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
`;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        App,
        EnhancedUserForm,
        UserList,
        ConnectedUserList,
        withFormHandling,
        withStore,
        useLocalStorage,
        useAsyncData,
        createStore,
        userReducer
    };
}

// Example usage in browser
if (typeof window !== 'undefined') {
    // Add styles to document
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Render app
    const root = document.getElementById('root');
    if (root) {
        ReactDOM.render(React.createElement(App), root);
    }
}
