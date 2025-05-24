/**
 * Esercizio: Handling Errors
 * 
 * In questo esercizio implementerai e utilizzerai l'Either monad
 * per gestire errori in modo funzionale.
 */

// ==========================================
// ESERCIZIO 1: Implementazione di Either Monad
// ==========================================

/**
 * Either Monad - Classe base
 * Implementa i seguenti metodi:
 * - of(value): metodo statico che crea un Right con il valore specificato
 * - left(value): metodo statico che crea un Left con il valore di errore
 * - right(value): metodo statico che crea un Right con il valore specificato
 * - fromTry(fn): metodo statico che esegue una funzione e cattura eventuali eccezioni
 * - map(fn): applica una funzione al valore se Right, ritorna this se Left
 * - mapLeft(fn): applica una funzione al valore di errore se Left, ritorna this se Right
 * - chain(fn): applica una funzione che ritorna un Either al valore se Right
 * - fold(leftFn, rightFn): esegue leftFn sul valore se Left, rightFn sul valore se Right
 * - getOrElse(defaultValue): ritorna il valore o il default se Left
 * - toString(): rappresentazione stringa dell'Either
 */

// Implementazione dell'Either Monad
class Either {
    constructor(value) {
        this.value = value;
    }

    static of(value) {
        return new Right(value);
    }

    static right(value) {
        return new Right(value);
    }

    static left(value) {
        return new Left(value);
    }

    static fromTry(fn) {
        try {
            return Either.right(fn());
        } catch (error) {
            return Either.left(error.message);
        }
    }

    isLeft() {
        return false;
    }

    isRight() {
        return false;
    }
}

class Left extends Either {
    constructor(value) {
        super(value);
    }

    map(fn) {
        return this;
    }

    mapLeft(fn) {
        return new Left(fn(this.value));
    }

    chain(fn) {
        return this;
    }

    fold(leftFn, rightFn) {
        return leftFn(this.value);
    }

    getOrElse(defaultValue) {
        return defaultValue;
    }

    isLeft() {
        return true;
    }

    toString() {
        return `Left(${this.value})`;
    }
}

class Right extends Either {
    constructor(value) {
        super(value);
    }

    map(fn) {
        try {
            return Either.right(fn(this.value));
        } catch (error) {
            return Either.left(error.message);
        }
    }

    mapLeft(fn) {
        return this;
    }

    chain(fn) {
        try {
            return fn(this.value);
        } catch (error) {
            return Either.left(error.message);
        }
    }

    fold(leftFn, rightFn) {
        return rightFn(this.value);
    }

    getOrElse(defaultValue) {
        return this.value;
    }

    isRight() {
        return true;
    }

    toString() {
        return `Right(${this.value})`;
    }
}

// Test della implementazione
console.log('=== TEST EITHER MONAD ===');

const rightValue = Either.right(42);
const leftValue = Either.left('Error');

console.log('Right(42):', rightValue.toString());
console.log('Left("Error"):', leftValue.toString());

console.log('Right(42).map(x => x * 2):', rightValue.map(x => x * 2).toString());
console.log('Left("Error").map(x => x * 2):', leftValue.map(x => x * 2).toString());

// Test fromTry
const safeDivision = (a, b) => {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
};

console.log('Either.fromTry(() => safeDivision(10, 2)):', Either.fromTry(() => safeDivision(10, 2)).toString());
console.log('Either.fromTry(() => safeDivision(10, 0)):', Either.fromTry(() => safeDivision(10, 0)).toString());

// ==========================================
// ESERCIZIO 2: Validazione e parsing di dati
// ==========================================

console.log('\n=== VALIDATORI ===');

// Funzioni di validazione di base
const validateNonEmpty = (str, errorMsg) => {
    return str && str.trim().length > 0 
        ? Either.right(str) 
        : Either.left(errorMsg);
};

const validateMinLength = (str, minLength, errorMsg) => {
    return str && str.length >= minLength 
        ? Either.right(str)
        : Either.left(errorMsg);
};

const validateMaxLength = (str, maxLength, errorMsg) => {
    return str && str.length <= maxLength 
        ? Either.right(str)
        : Either.left(errorMsg);
};

const validateNumeric = (str, errorMsg) => {
    const numericRegex = /^\d+$/;
    return numericRegex.test(str) 
        ? Either.right(str)
        : Either.left(errorMsg);
};

const validateEmail = (str, errorMsg) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str) 
        ? Either.right(str)
        : Either.left(errorMsg);
};

const validateRange = (num, min, max, errorMsg) => {
    return num >= min && num <= max 
        ? Either.right(num)
        : Either.left(errorMsg);
};

const parseInteger = (str, errorMsg) => {
    const parsed = parseInt(str, 10);
    return isNaN(parsed) 
        ? Either.left(errorMsg)
        : Either.right(parsed);
};

const validateAnd = (validators) => (value) => {
    return validators.reduce((acc, validator) => {
        return acc.chain(() => validator(value));
    }, Either.right(value));
};

// Test dei validatori
console.log('validateNonEmpty("test", "Errore"):', validateNonEmpty("test", "Errore").toString());
console.log('validateNonEmpty("", "Errore"):', validateNonEmpty("", "Errore").toString());

console.log('validateMinLength("hello", 3, "Troppo corto"):', validateMinLength("hello", 3, "Troppo corto").toString());
console.log('validateMinLength("hi", 3, "Troppo corto"):', validateMinLength("hi", 3, "Troppo corto").toString());

console.log('validateEmail("test@example.com", "Email non valida"):', validateEmail("test@example.com", "Email non valida").toString());
console.log('validateEmail("invalid-email", "Email non valida"):', validateEmail("invalid-email", "Email non valida").toString());

// ==========================================
// ESERCIZIO 3: Validazione form utente
// ==========================================

/**
 * Form di registrazione utente con i seguenti campi:
 * - username: alfanumerico, 3-20 caratteri
 * - email: deve essere un'email valida
 * - password: almeno 8 caratteri, con almeno un numero
 * - age: deve essere un numero tra 18 e 120
 */

// Dati di esempio
const validUserData = {
    username: 'mario_rossi',
    email: 'mario@example.com',
    password: 'Password123',
    age: '35'
};

const invalidUserData = {
    username: 'mr',  // troppo corto
    email: 'non-email',
    password: 'pwd',  // troppo corta e senza numeri
    age: '15'  // troppo giovane
};

/**
 * Funzioni di validazione specializzate per form utente
 */

function validateUsername(username) {
    const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
    
    return validateNonEmpty(username, 'Username non può essere vuoto')
        .chain(val => validateMinLength(val, 3, 'Username deve essere di almeno 3 caratteri'))
        .chain(val => validateMaxLength(val, 20, 'Username non può superare 20 caratteri'))
        .chain(val => alphanumericRegex.test(val) 
            ? Either.right(val) 
            : Either.left('Username può contenere solo lettere, numeri e underscore')
        );
}

function validateUserEmail(email) {
    return validateNonEmpty(email, 'Email non può essere vuota')
        .chain(val => validateEmail(val, 'Email non è in formato valido'));
}

function validatePassword(password) {
    const hasNumberRegex = /\d/;
    
    return validateNonEmpty(password, 'Password non può essere vuota')
        .chain(val => validateMinLength(val, 8, 'Password deve essere di almeno 8 caratteri'))
        .chain(val => hasNumberRegex.test(val) 
            ? Either.right(val) 
            : Either.left('Password deve contenere almeno un numero')
        );
}

function validateAge(age) {
    return validateNonEmpty(age, 'Età non può essere vuota')
        .chain(val => parseInteger(val, 'Età deve essere un numero'))
        .chain(val => validateRange(val, 18, 120, 'Età deve essere compresa tra 18 e 120 anni'));
}

/**
 * Validazione completa dei dati utente
 */
function validateUserData(userData) {
    const errors = {};
    let hasErrors = false;
    
    // Valida username
    const usernameResult = validateUsername(userData.username);
    if (usernameResult.isLeft()) {
        errors.username = usernameResult.value;
        hasErrors = true;
    }
    
    // Valida email
    const emailResult = validateUserEmail(userData.email);
    if (emailResult.isLeft()) {
        errors.email = emailResult.value;
        hasErrors = true;
    }
    
    // Valida password
    const passwordResult = validatePassword(userData.password);
    if (passwordResult.isLeft()) {
        errors.password = passwordResult.value;
        hasErrors = true;
    }
    
    // Valida age
    const ageResult = validateAge(userData.age);
    if (ageResult.isLeft()) {
        errors.age = ageResult.value;
        hasErrors = true;
    }
    
    if (hasErrors) {
        const errorMessage = Object.entries(errors)
            .map(([field, error]) => `${field}: ${error}`)
            .join('; ');
        return Either.left(errorMessage);
    }
    
    // Se tutto è valido, crea l'oggetto con l'età convertita
    return Either.right({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        age: parseInt(userData.age, 10)
    });
}

// Test validazione form utente
console.log('\n=== TEST VALIDAZIONE FORM UTENTE ===');

console.log('Validazione dati validi:');
const validResult = validateUserData(validUserData);
console.log(validResult.toString());

console.log('\nValidazione dati invalidi:');
const invalidResult = validateUserData(invalidUserData);
console.log(invalidResult.toString());

// Test singoli validatori
console.log('\n--- Test singoli validatori ---');
console.log('validateUsername("mario_rossi"):', validateUsername("mario_rossi").toString());
console.log('validateUsername("mr"):', validateUsername("mr").toString());

console.log('validatePassword("Password123"):', validatePassword("Password123").toString());
console.log('validatePassword("pwd"):', validatePassword("pwd").toString());

console.log('validateAge("25"):', validateAge("25").toString());
console.log('validateAge("15"):', validateAge("15").toString());

// ==========================================
// ESERCIZIO 4: Interazioni con API e gestione errori
// ==========================================

/**
 * Simulazione di chiamate API che possono fallire
 */

function fetchUser(userId) {
    // Simula una chiamata API asincrona
    return new Promise((resolve) => {
        setTimeout(() => {
            if (userId === 1) {
                resolve(Either.right({ id: 1, name: 'Mario Rossi', email: 'mario@example.com' }));
            } else if (userId === 2) {
                resolve(Either.right({ id: 2, name: 'Anna Verdi', email: 'anna@example.com' }));
            } else {
                resolve(Either.left('Utente non trovato'));
            }
        }, 100);
    });
}

function fetchUserProfile(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (userId === 1) {
                resolve(Either.right({ userId: 1, bio: 'Sviluppatore software', location: 'Milano' }));
            } else if (userId === 2) {
                resolve(Either.right({ userId: 2, bio: 'Designer UX', location: 'Roma' }));
            } else {
                resolve(Either.left('Profilo utente non trovato'));
            }
        }, 150);
    });
}

/**
 * Funzione che combina più chiamate API usando Either
 */
async function fetchCompleteUserData(userId) {
    try {
        const userResult = await fetchUser(userId);
        
        if (userResult.isLeft()) {
            return userResult; // Ritorna l'errore direttamente
        }
        
        const profileResult = await fetchUserProfile(userId);
        
        if (profileResult.isLeft()) {
            return profileResult; // Ritorna l'errore del profilo
        }
        
        // Combina i dati se entrambe le chiamate sono riuscite
        const combinedData = {
            ...userResult.value,
            profile: profileResult.value
        };
        
        return Either.right(combinedData);
        
    } catch (error) {
        return Either.left(`Errore di rete: ${error.message}`);
    }
}

// Test delle chiamate API
console.log('\n=== TEST CHIAMATE API ===');

async function testApiCalls() {
    console.log('Fetching user 1...');
    const user1 = await fetchCompleteUserData(1);
    console.log('User 1:', user1.toString());
    
    console.log('\nFetching user 999 (non esistente)...');
    const user999 = await fetchCompleteUserData(999);
    console.log('User 999:', user999.toString());
    
    // Esempio di gestione dei risultati
    user1.fold(
        error => console.log('Errore nel caricamento utente:', error),
        userData => {
            console.log('Dati utente caricati con successo:');
            console.log(`- Nome: ${userData.name}`);
            console.log(`- Email: ${userData.email}`);
            console.log(`- Bio: ${userData.profile.bio}`);
            console.log(`- Località: ${userData.profile.location}`);
        }
    );
}

// Esegui i test API (commentato per evitare async nell'output principale)
// testApiCalls();

// ==========================================
// ESERCIZIO 5: Pipeline di trasformazione dati
// ==========================================

/**
 * Esempio di pipeline complessa che trasforma dati attraverso più passaggi
 */

const processData = (rawData) => {
    return Either.fromTry(() => JSON.parse(rawData))
        .mapLeft(err => `Errore parsing JSON: ${err}`)
        .chain(data => validateUserData(data))
        .map(validData => ({
            ...validData,
            createdAt: new Date().toISOString(),
            status: 'active'
        }))
        .map(userData => {
            // Simula una trasformazione aggiuntiva
            return {
                ...userData,
                displayName: `${userData.username} (${userData.email})`
            };
        });
};

// Test della pipeline
console.log('\n=== TEST PIPELINE TRASFORMAZIONE DATI ===');

const validJson = JSON.stringify(validUserData);
const invalidJson = '{"username": "test", "email": "invalid"}';
const malformedJson = '{"invalid": json}';

console.log('Pipeline con JSON valido:');
console.log(processData(validJson).toString());

console.log('\nPipeline con dati invalidi:');
console.log(processData(invalidJson).toString());

console.log('\nPipeline con JSON malformato:');
console.log(processData(malformedJson).toString());

// ==========================================
// ESERCIZIO 6: TaskEither per operazioni asincrone (Bonus)
// ==========================================

/**
 * TaskEither combina Task (per operazioni asincrone) con Either (per gestione errori)
 */

class TaskEither {
    constructor(task) {
        this.task = task;
    }
    
    static of(value) {
        return new TaskEither(Promise.resolve(Either.right(value)));
    }
    
    static left(error) {
        return new TaskEither(Promise.resolve(Either.left(error)));
    }
    
    static right(value) {
        return new TaskEither(Promise.resolve(Either.right(value)));
    }
    
    static fromPromise(promise) {
        return new TaskEither(
            promise.then(
                value => Either.right(value),
                error => Either.left(error.message)
            )
        );
    }
    
    map(fn) {
        return new TaskEither(
            this.task.then(either => either.map(fn))
        );
    }
    
    chain(fn) {
        return new TaskEither(
            this.task.then(either => 
                either.isLeft() 
                    ? either 
                    : fn(either.value).task
            )
        );
    }
    
    fold(leftFn, rightFn) {
        return this.task.then(either => either.fold(leftFn, rightFn));
    }
    
    run() {
        return this.task;
    }
}

// Esempio di utilizzo TaskEither
const fetchUserTE = (userId) => {
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId === 1) {
                resolve({ id: 1, name: 'Mario Rossi' });
            } else {
                reject(new Error('Utente non trovato'));
            }
        }, 100);
    });
    
    return TaskEither.fromPromise(promise);
};

// Test TaskEither (commentato per evitare async)
/*
console.log('\n=== TEST TASKEITHER ===');

fetchUserTE(1)
    .map(user => ({ ...user, processed: true }))
    .fold(
        error => console.log('Errore:', error),
        user => console.log('Utente processato:', user)
    );
*/

// ==========================================
// CONCLUSIONI E BEST PRACTICES
// ==========================================

/**
 * CONCLUSIONI:
 * 
 * L'Either monad fornisce un modo elegante per gestire errori
 * mantenendo la composabilità delle operazioni.
 * 
 * Vantaggi:
 * - Gestione esplicita degli errori
 * - Composizione sicura di operazioni che possono fallire
 * - Separazione tra success path e error path
 * - Possibilità di accumulare errori
 * - Type safety (in TypeScript)
 * 
 * Utilizzo ideale:
 * - Validazione di form e dati
 * - Operazioni I/O (file, API)
 * - Pipeline di trasformazione dati
 * - Parsing e conversioni
 * - Catene di operazioni che possono fallire
 * 
 * Best Practices:
 * 1. Usa Either per operazioni che possono fallire in modo prevedibile
 * 2. Combina Either con Promise per operazioni asincrone (TaskEither)
 * 3. Mantieni i messaggi di errore informativi e specifici
 * 4. Usa chain per operazioni che ritornano Either
 * 5. Usa map per trasformazioni pure
 * 6. Gestisci sempre entrambi i casi (Left e Right) con fold
 */

console.log('\n=== ESERCIZIO COMPLETATO ===');
console.log('Hai imparato a:');
console.log('- Implementare Either monad');
console.log('- Creare funzioni di validazione componibili');
console.log('- Gestire errori in pipeline di trasformazione');
console.log('- Combinare operazioni asincrone con gestione errori');
console.log('- Applicare best practices per error handling funzionale');
