/**
 * ESERCIZIO 2: IMMUTABILITÀ E GESTIONE DELLO STATO
 * Tecniche avanzate per mantenere l'immutabilità dei dati
 * 
 * OBIETTIVI:
 * - Padroneggiare tecniche di immutabilità
 * - Gestire strutture dati complesse immutabili
 * - Implementare pattern per aggiornamenti immutabili
 * - Ottimizzare performance con strategie immutabili
 */

console.log("=== ESERCIZIO 2: IMMUTABILITÀ AVANZATA ===\n");

// ========================================
// SEZIONE 1: FONDAMENTI IMMUTABILITÀ
// ========================================

console.log("--- SEZIONE 1: FONDAMENTI IMMUTABILITÀ ---\n");

// Differenza tra mutazione e immutabilità

// MUTAZIONE (da evitare)
const mutableArray = [1, 2, 3];
const mutableObject = { name: "Alice", age: 30 };

function badMutatingFunction(arr, obj) {
    arr.push(4); // MUTAZIONE!
    obj.age = 31; // MUTAZIONE!
    return { arr, obj };
}

// IMMUTABILITÀ (approccio corretto)
function goodImmutableFunction(arr, obj) {
    const newArr = [...arr, 4]; // Nuova copia
    const newObj = { ...obj, age: 31 }; // Nuovo oggetto
    return { arr: newArr, obj: newObj };
}

// Test
console.log("Test mutazione vs immutabilità:");
console.log("Originali prima:", { mutableArray, mutableObject });

// Test funzione mutante
const originalArray = [...mutableArray];
const originalObject = { ...mutableObject };
badMutatingFunction(mutableArray, mutableObject);
console.log("Dopo mutazione:", { mutableArray, mutableObject });

// Ripristina originali
mutableArray.length = 0;
mutableArray.push(...originalArray);
Object.assign(mutableObject, originalObject);

// Test funzione immutabile
const immutableResult = goodImmutableFunction(mutableArray, mutableObject);
console.log("Originali dopo immutabile:", { mutableArray, mutableObject });
console.log("Nuovi valori:", immutableResult);
console.log();

// ========================================
// SEZIONE 2: TECNICHE DI IMMUTABILITÀ
// ========================================

console.log("--- SEZIONE 2: TECNICHE DI IMMUTABILITÀ ---\n");

// 2.1: Spread Operator
console.log("2.1 - Spread Operator:");

const originalNumbers = [1, 2, 3];
const newNumbers = [...originalNumbers, 4, 5]; // Aggiunta immutabile
const filteredNumbers = originalNumbers.filter(n => n > 1); // Filtro immutabile

console.log("Originale:", originalNumbers);
console.log("Con aggiunta:", newNumbers);
console.log("Filtrato:", filteredNumbers);

// Per oggetti
const originalUser = { name: "Alice", age: 30, city: "Roma" };
const updatedUser = { ...originalUser, age: 31 }; // Aggiornamento immutabile
const userWithNewField = { ...originalUser, email: "alice@example.com" };

console.log("User originale:", originalUser);
console.log("User aggiornato:", updatedUser);
console.log("User con nuovo campo:", userWithNewField);
console.log();

// 2.2: Object.assign (alternativa)
console.log("2.2 - Object.assign:");

const user1 = { name: "Bob", age: 25 };
const user2 = Object.assign({}, user1, { age: 26, city: "Milano" });

console.log("User1:", user1);
console.log("User2:", user2);
console.log();

// 2.3: Array methods immutabili
console.log("2.3 - Array methods immutabili:");

const numbers = [1, 2, 3, 4, 5];

// Metodi che NON mutano l'array originale
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);
const reversed = numbers.slice().reverse(); // slice() crea copia prima di reverse

console.log("Originale:", numbers);
console.log("Raddoppiati:", doubled);
console.log("Pari:", evens);
console.log("Somma:", sum);
console.log("Invertiti:", reversed);
console.log();

// ========================================
// SEZIONE 3: STRUTTURE DATI COMPLESSE
// ========================================

console.log("--- SEZIONE 3: STRUTTURE DATI COMPLESSE ---\n");

// 3.1: Nested Objects
const complexUser = {
    personal: {
        name: "Alice",
        age: 30,
        address: {
            street: "Via Roma 123",
            city: "Milano",
            country: "Italia"
        }
    },
    professional: {
        company: "TechCorp",
        role: "Developer",
        skills: ["JavaScript", "React", "Node.js"]
    },
    preferences: {
        theme: "dark",
        language: "it"
    }
};

// Aggiornamento immutabile profondo
function updateNestedImmutable(user, path, value) {
    const [first, ...rest] = path;
    
    if (rest.length === 0) {
        return { ...user, [first]: value };
    }
    
    return {
        ...user,
        [first]: updateNestedImmutable(user[first], rest, value)
    };
}

// Helper per percorsi complessi
function setPath(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    const target = keys.reduce((current, key) => {
        return { ...current, [key]: { ...current[key] } };
    }, obj);
    
    return {
        ...target,
        [keys.join('.')]: {
            ...keys.reduce((current, key) => current[key], target),
            [lastKey]: value
        }
    };
}

// Versione più robusta
function immutableUpdate(obj, updates) {
    let result = { ...obj };
    
    for (const [path, value] of Object.entries(updates)) {
        const keys = path.split('.');
        let current = result;
        
        // Naviga fino al penultimo livello creando copie
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            current[key] = { ...current[key] };
            current = current[key];
        }
        
        // Imposta il valore finale
        current[keys[keys.length - 1]] = value;
    }
    
    return result;
}

// Test aggiornamenti nested
console.log("3.1 - Aggiornamenti nested:");
console.log("User originale:", JSON.stringify(complexUser, null, 2));

const updatedComplexUser = immutableUpdate(complexUser, {
    'personal.age': 31,
    'personal.address.city': 'Roma',
    'professional.skills': [...complexUser.professional.skills, 'TypeScript']
});

console.log("User aggiornato:", JSON.stringify(updatedComplexUser, null, 2));
console.log("Originale invariato:", complexUser.personal.age === 30);
console.log();

// 3.2: Array di oggetti
console.log("3.2 - Array di oggetti:");

const users = [
    { id: 1, name: "Alice", active: true, score: 100 },
    { id: 2, name: "Bob", active: false, score: 85 },
    { id: 3, name: "Charlie", active: true, score: 92 }
];

// Aggiornamento singolo elemento
function updateUserById(userList, id, updates) {
    return userList.map(user => 
        user.id === id ? { ...user, ...updates } : user
    );
}

// Rimozione elemento
function removeUserById(userList, id) {
    return userList.filter(user => user.id !== id);
}

// Aggiunta elemento
function addUser(userList, newUser) {
    return [...userList, newUser];
}

// Inserimento in posizione specifica
function insertUserAt(userList, index, newUser) {
    return [
        ...userList.slice(0, index),
        newUser,
        ...userList.slice(index)
    ];
}

// Test operazioni su array
console.log("Array originale:", users);

const updatedUsers = updateUserById(users, 2, { active: true, score: 90 });
console.log("Dopo aggiornamento Bob:", updatedUsers);

const withNewUser = addUser(users, { id: 4, name: "Diana", active: true, score: 95 });
console.log("Con nuovo user:", withNewUser);

const withoutCharlie = removeUserById(users, 3);
console.log("Senza Charlie:", withoutCharlie);
console.log();

// ========================================
// SEZIONE 4: PERFORMANCE E OTTIMIZZAZIONI
// ========================================

console.log("--- SEZIONE 4: PERFORMANCE E OTTIMIZZAZIONI ---\n");

// 4.1: Shallow vs Deep copy
console.log("4.1 - Shallow vs Deep copy:");

// Shallow copy (veloce, ma solo primo livello)
function shallowUpdate(obj, updates) {
    return { ...obj, ...updates };
}

// Deep copy (lento, ma completo)
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj)); // Semplice ma limitato
}

// Deep copy più robusto
function robustDeepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => robustDeepClone(item));
    if (typeof obj === 'object') {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = robustDeepClone(obj[key]);
        });
        return copy;
    }
}

// Test performance
const largeObject = {
    data: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: Math.random() })),
    nested: { deep: { very: { deep: { value: "test" } } } }
};

console.log("Test performance copie:");
console.time("Shallow copy");
for (let i = 0; i < 1000; i++) {
    shallowUpdate(largeObject, { timestamp: Date.now() });
}
console.timeEnd("Shallow copy");

console.time("Deep copy (JSON)");
for (let i = 0; i < 100; i++) { // Meno iterazioni perché più lento
    const copy = deepClone(largeObject);
    copy.timestamp = Date.now();
}
console.timeEnd("Deep copy (JSON)");
console.log();

// 4.2: Structural Sharing (concetto)
console.log("4.2 - Structural Sharing simulation:");

// Simulazione semplice di structural sharing
class ImmutableList {
    constructor(items = []) {
        this._items = [...items];
    }

    add(item) {
        return new ImmutableList([...this._items, item]);
    }

    remove(index) {
        return new ImmutableList([
            ...this._items.slice(0, index),
            ...this._items.slice(index + 1)
        ]);
    }

    update(index, item) {
        return new ImmutableList([
            ...this._items.slice(0, index),
            item,
            ...this._items.slice(index + 1)
        ]);
    }

    get(index) {
        return this._items[index];
    }

    size() {
        return this._items.length;
    }

    toArray() {
        return [...this._items];
    }
}

// Test ImmutableList
const list1 = new ImmutableList([1, 2, 3]);
const list2 = list1.add(4);
const list3 = list2.update(1, 'two');

console.log("Lista 1:", list1.toArray());
console.log("Lista 2:", list2.toArray());
console.log("Lista 3:", list3.toArray());
console.log();

// ========================================
// SEZIONE 5: PATTERN AVANZATI
// ========================================

console.log("--- SEZIONE 5: PATTERN AVANZATI ---\n");

// 5.1: Lens Pattern (per aggiornamenti nested)
class Lens {
    constructor(getter, setter) {
        this.get = getter;
        this.set = setter;
    }

    static prop(propName) {
        return new Lens(
            obj => obj[propName],
            (obj, value) => ({ ...obj, [propName]: value })
        );
    }

    static compose(lens1, lens2) {
        return new Lens(
            obj => lens2.get(lens1.get(obj)),
            (obj, value) => lens1.set(obj, lens2.set(lens1.get(obj), value))
        );
    }

    static path(...props) {
        return props.reduce((acc, prop) => 
            acc ? Lens.compose(acc, Lens.prop(prop)) : Lens.prop(prop)
        );
    }
}

// Test Lens pattern
const userLens = Lens.prop('personal');
const ageLens = Lens.compose(userLens, Lens.prop('age'));
const addressLens = Lens.compose(userLens, Lens.prop('address'));
const cityLens = Lens.compose(addressLens, Lens.prop('city'));

console.log("5.1 - Lens Pattern:");
console.log("Età corrente:", ageLens.get(complexUser));
console.log("Città corrente:", cityLens.get(complexUser));

const userWithNewAge = ageLens.set(complexUser, 32);
const userWithNewCity = cityLens.set(complexUser, "Torino");

console.log("Nuova età:", ageLens.get(userWithNewAge));
console.log("Nuova città:", cityLens.get(userWithNewCity));
console.log("Originale invariato:", ageLens.get(complexUser));
console.log();

// 5.2: State Management Pattern
console.log("5.2 - State Management Pattern:");

class ImmutableStore {
    constructor(initialState = {}) {
        this._state = initialState;
        this._listeners = [];
    }

    getState() {
        return this._state;
    }

    setState(updates) {
        const newState = typeof updates === 'function' 
            ? updates(this._state)
            : { ...this._state, ...updates };
        
        this._state = newState;
        this._notifyListeners();
    }

    subscribe(listener) {
        this._listeners.push(listener);
        return () => {
            this._listeners = this._listeners.filter(l => l !== listener);
        };
    }

    _notifyListeners() {
        this._listeners.forEach(listener => listener(this._state));
    }
}

// Test store
const store = new ImmutableStore({ count: 0, user: null });

const unsubscribe = store.subscribe(state => {
    console.log("State changed:", state);
});

store.setState({ count: 1 });
store.setState(state => ({ ...state, count: state.count + 1 }));
store.setState({ user: { name: "Alice", id: 1 } });

unsubscribe();
console.log();

// ========================================
// SEZIONE 6: ESERCIZI PRATICI
// ========================================

console.log("--- SEZIONE 6: ESERCIZI PRATICI ---\n");

// ESERCIZIO 6.1: Implementa un TODO immutabile
class ImmutableTodoList {
    constructor(todos = []) {
        this._todos = todos;
    }

    addTodo(text) {
        const newTodo = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date()
        };
        return new ImmutableTodoList([...this._todos, newTodo]);
    }

    toggleTodo(id) {
        const updatedTodos = this._todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        return new ImmutableTodoList(updatedTodos);
    }

    removeTodo(id) {
        const filteredTodos = this._todos.filter(todo => todo.id !== id);
        return new ImmutableTodoList(filteredTodos);
    }

    updateTodo(id, updates) {
        const updatedTodos = this._todos.map(todo =>
            todo.id === id ? { ...todo, ...updates } : todo
        );
        return new ImmutableTodoList(updatedTodos);
    }

    getTodos() {
        return [...this._todos];
    }

    getCompletedTodos() {
        return this._todos.filter(todo => todo.completed);
    }

    getPendingTodos() {
        return this._todos.filter(todo => !todo.completed);
    }
}

// Test TODO list
console.log("6.1 - TODO List immutabile:");
let todoList = new ImmutableTodoList();

todoList = todoList.addTodo("Imparare programmazione funzionale");
todoList = todoList.addTodo("Praticare immutabilità");
todoList = todoList.addTodo("Scrivere codice pulito");

console.log("Tutti i TODO:", todoList.getTodos());

const firstTodoId = todoList.getTodos()[0].id;
todoList = todoList.toggleTodo(firstTodoId);

console.log("Completati:", todoList.getCompletedTodos());
console.log("In sospeso:", todoList.getPendingTodos());
console.log();

// ========================================
// RIEPILOGO E BEST PRACTICES
// ========================================

console.log("=== RIEPILOGO E BEST PRACTICES ===\n");

const immutabilityBestPractices = [
    "Usa spread operator per copie shallow",
    "Implementa helper per aggiornamenti deep",
    "Preferisci metodi array immutabili (map, filter, reduce)",
    "Evita mutazioni dirette di oggetti e array",
    "Considera performance per strutture grandi",
    "Usa librerie specializzate per casi complessi (Immutable.js, Immer)",
    "Implementa pattern lens per aggiornamenti nested",
    "Separa stato da logica di business"
];

console.log("Best Practices per Immutabilità:");
immutabilityBestPractices.forEach((practice, index) => {
    console.log(`${index + 1}. ${practice}`);
});

console.log("\n=== COSA HAI IMPARATO ===");
console.log("✓ Tecniche base e avanzate di immutabilità");
console.log("✓ Gestione di strutture dati complesse");
console.log("✓ Pattern per aggiornamenti immutabili");
console.log("✓ Considerazioni di performance");
console.log("✓ Pattern avanzati (Lens, State Management)");
console.log("✓ Implementazione di strutture dati immutabili");
