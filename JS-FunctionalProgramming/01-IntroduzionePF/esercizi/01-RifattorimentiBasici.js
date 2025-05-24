/**
 * ESERCIZIO 1: INTRODUZIONE ALLA PROGRAMMAZIONE FUNZIONALE
 * Rifactoring di codice imperativo in stile funzionale
 * 
 * OBIETTIVI:
 * - Identificare e convertire codice imperativo in funzionale
 * - Utilizzare funzioni pure
 * - Evitare mutazione degli stati
 * - Applicare il paradigma dichiarativo
 */

console.log("=== ESERCIZIO 1: RIFACTORING IMPERATIVO → FUNZIONALE ===\n");

// ========================================
// ESERCIZIO 1.1: Somma di numeri positivi
// ========================================

// CODICE IMPERATIVO DA CONVERTIRE:
function sumPositiveImperative(numbers) {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] > 0) {
            sum += numbers[i];
        }
    }
    return sum;
}

// TODO: Converti in stile funzionale usando filter e reduce
function sumPositiveFunctional(numbers) {
    // La tua implementazione qui
    return numbers
        .filter(num => num > 0)
        .reduce((sum, num) => sum + num, 0);
}

// Test
const numbers1 = [1, -2, 3, -4, 5, 0, 6];
console.log("1.1 - Somma numeri positivi:");
console.log("Imperativo:", sumPositiveImperative(numbers1));
console.log("Funzionale:", sumPositiveFunctional(numbers1));
console.log();

// ========================================
// ESERCIZIO 1.2: Trasformazione array oggetti
// ========================================

// CODICE IMPERATIVO DA CONVERTIRE:
function processUsersImperative(users) {
    let result = [];
    for (let i = 0; i < users.length; i++) {
        if (users[i].age >= 18) {
            let newUser = {
                id: users[i].id,
                name: users[i].name.toUpperCase(),
                isAdult: true,
                category: users[i].age >= 65 ? 'senior' : 'adult'
            };
            result.push(newUser);
        }
    }
    return result;
}

// TODO: Converti in stile funzionale
function processUsersFunctional(users) {
    // La tua implementazione qui
    return users
        .filter(user => user.age >= 18)
        .map(user => ({
            id: user.id,
            name: user.name.toUpperCase(),
            isAdult: true,
            category: user.age >= 65 ? 'senior' : 'adult'
        }));
}

// Test
const users = [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 17 },
    { id: 3, name: 'Charlie', age: 67 },
    { id: 4, name: 'Diana', age: 30 }
];

console.log("1.2 - Trasformazione utenti:");
console.log("Imperativo:", processUsersImperative(users));
console.log("Funzionale:", processUsersFunctional(users));
console.log();

// ========================================
// ESERCIZIO 1.3: Controllo purezza funzioni
// ========================================

// Identifica quali funzioni sono pure e quali no, poi riscrivile come pure

// Funzione 1: È pura?
let counter = 0;
function incrementCounter() {
    counter++;
    return counter;
}

// TODO: Versione pura
function pureIncrement(currentValue) {
    return currentValue + 1;
}

// Funzione 2: È pura?
function addTax(price) {
    const taxRate = 0.22; // Tasso fisso
    return price * (1 + taxRate);
}
// Questa è già pura!

// Funzione 3: È pura?
function getCurrentTimeString() {
    return new Date().toISOString();
}

// TODO: Versione pura
function formatDateString(date) {
    return date.toISOString();
}

// Test funzioni pure
console.log("1.3 - Controllo purezza:");
console.log("Increment impuro:", incrementCounter()); // 1
console.log("Increment impuro:", incrementCounter()); // 2 (stato mutato!)
console.log("Increment puro:", pureIncrement(5)); // 6
console.log("Increment puro:", pureIncrement(5)); // 6 (sempre uguale!)

console.log("Tax (già pura):", addTax(100)); // 122
console.log("Tax (già pura):", addTax(100)); // 122

const fixedDate = new Date('2024-01-01');
console.log("Date impura:", getCurrentTimeString()); // Cambia ogni volta
console.log("Date pura:", formatDateString(fixedDate)); // Sempre uguale
console.log();

// ========================================
// ESERCIZIO 1.4: Immutabilità
// ========================================

// Riscrivi queste funzioni per NON mutare gli input

// Funzione che muta l'array
function addItemMutating(array, item) {
    array.push(item);
    return array;
}

// TODO: Versione immutabile
function addItemImmutable(array, item) {
    return [...array, item];
}

// Funzione che muta l'oggetto
function updateUserMutating(user, updates) {
    Object.assign(user, updates);
    return user;
}

// TODO: Versione immutabile
function updateUserImmutable(user, updates) {
    return { ...user, ...updates };
}

// Test immutabilità
console.log("1.4 - Test immutabilità:");
const originalArray = [1, 2, 3];
const originalUser = { name: 'Alice', age: 25 };

console.log("Array originale:", originalArray);
const newArray = addItemImmutable(originalArray, 4);
console.log("Dopo addItemImmutable:", originalArray); // Non cambiato!
console.log("Nuovo array:", newArray);

console.log("User originale:", originalUser);
const updatedUser = updateUserImmutable(originalUser, { age: 26 });
console.log("Dopo updateUserImmutable:", originalUser); // Non cambiato!
console.log("User aggiornato:", updatedUser);
console.log();

// ========================================
// ESERCIZIO 1.5: Composizione vs Imperativo
// ========================================

// Crea una pipeline funzionale per processare una lista di numeri:
// 1. Filtra numeri pari
// 2. Moltiplicali per 2
// 3. Somma tutto

// Versione imperativa
function processNumbersImperative(numbers) {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] % 2 === 0) {
            sum += numbers[i] * 2;
        }
    }
    return sum;
}

// TODO: Versione funzionale con composizione
function processNumbersFunctional(numbers) {
    return numbers
        .filter(n => n % 2 === 0)
        .map(n => n * 2)
        .reduce((sum, n) => sum + n, 0);
}

// Test
const testNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log("1.5 - Composizione:");
console.log("Numeri test:", testNumbers);
console.log("Imperativo:", processNumbersImperative(testNumbers));
console.log("Funzionale:", processNumbersFunctional(testNumbers));
console.log();

// ========================================
// ESERCIZIO BONUS: First-Class Functions
// ========================================

// Crea un sistema di operazioni matematiche usando funzioni come first-class citizens

const operations = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => b !== 0 ? a / b : 'Error: Division by zero'
};

// Funzione che esegue un'operazione
function executeOperation(operation, a, b) {
    return operation(a, b);
}

// Funzione che crea una calcolatrice con operazione predefinita
function createCalculator(operation) {
    return (a, b) => operation(a, b);
}

// Test
console.log("BONUS - First-Class Functions:");
console.log("Addizione diretta:", executeOperation(operations.add, 5, 3));
console.log("Moltiplicazione diretta:", executeOperation(operations.multiply, 4, 7));

const adder = createCalculator(operations.add);
const multiplier = createCalculator(operations.multiply);

console.log("Calcolatrice addizione:", adder(10, 20));
console.log("Calcolatrice moltiplicazione:", multiplier(6, 7));

// Array di operazioni
const calculations = [
    { op: operations.add, a: 5, b: 3 },
    { op: operations.multiply, a: 4, b: 2 },
    { op: operations.subtract, a: 10, b: 4 }
];

console.log("Calcoli batch:");
calculations.forEach(({ op, a, b }) => {
    console.log(`Risultato: ${executeOperation(op, a, b)}`);
});

// ========================================
// RIEPILOGO CONCETTI APPRESI
// ========================================
console.log("\n=== RIEPILOGO CONCETTI ===");
console.log("✓ Conversione da imperativo a funzionale");
console.log("✓ Identificazione e creazione di funzioni pure");
console.log("✓ Tecniche di immutabilità");
console.log("✓ Composizione di funzioni");
console.log("✓ Funzioni come first-class citizens");
console.log("✓ Paradigma dichiarativo vs imperativo");
