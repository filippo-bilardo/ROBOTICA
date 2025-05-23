/**
 * Applicazioni Pratiche
 * Casi d'uso reali e integrazione in architetture esistenti
 */

// Importiamo le monads definite nei file precedenti
const { Maybe } = require('./01-ImplementazioniBase');
const { Either } = require('./01-ImplementazioniBase');
const { Validation } = require('./03-ValidazioneDati');
const { IO, Task } = require('./04-EffettiCollaterali');

// ==========================================
// Caso d'Uso 1: Sistema di autenticazione
// ==========================================

console.log('======== CASO D\'USO 1: AUTENTICAZIONE ========');

// Simuliamo un database di utenti
const usersDB = {
  'alice@example.com': { 
    id: 1, 
    email: 'alice@example.com', 
    passwordHash: 'hashed_password_1', 
    name: 'Alice Smith',
    role: 'admin'
  },
  'bob@example.com': { 
    id: 2, 
    email: 'bob@example.com', 
    passwordHash: 'hashed_password_2', 
    name: 'Bob Johnson',
    role: 'user'
  }
};

// Simuliamo una funzione di hashing
const hashPassword = password => `hashed_${password}`;

// Funzione che simula il controllo delle credenziali
const checkCredentials = (email, password) => {
  const user = usersDB[email];
  
  if (!user) {
    return Either.left(new Error('Utente non trovato'));
  }
  
  const hashedPassword = hashPassword(password);
  if (hashedPassword !== user.passwordHash) {
    return Either.left(new Error('Password non valida'));
  }
  
  return Either.right(user);
};

// Funzione che verifica i permessi
const checkPermissions = (user, requiredRole) => {
  if (user.role !== requiredRole && user.role !== 'admin') {
    return Either.left(new Error(`Permessi insufficienti. Richiesto: ${requiredRole}`));
  }
  
  return Either.right(user);
};

// Funzione che genera un token JWT simulato
const generateToken = user => {
  const token = `JWT_TOKEN_${user.id}_${Date.now()}`;
  return Either.right({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
};

// Sistema di autenticazione completo
const authenticate = (email, password) => {
  return checkCredentials(email, password)
    .chain(user => generateToken(user));
};

// Sistema di autenticazione con controllo permessi
const authorizeAction = (email, password, requiredRole) => {
  return checkCredentials(email, password)
    .chain(user => checkPermissions(user, requiredRole))
    .chain(user => generateToken(user));
};

// Demo
console.log('Login con credenziali valide:');
console.log(authenticate('alice@example.com', 'password_1').toString());

console.log('\nLogin con email non valida:');
console.log(authenticate('nonexistent@example.com', 'any_password').toString());

console.log('\nLogin con password non valida:');
console.log(authenticate('alice@example.com', 'wrong_password').toString());

console.log('\nAutorizzazione con ruolo adeguato:');
console.log(authorizeAction('alice@example.com', 'password_1', 'admin').toString());

console.log('\nAutorizzazione con ruolo insufficiente:');
console.log(authorizeAction('bob@example.com', 'password_2', 'admin').toString());

// ==========================================
// Caso d'Uso 2: Pipeline di elaborazione dati
// ==========================================

console.log('\n======== CASO D\'USO 2: PIPELINE DI ELABORAZIONE DATI ========');

// Simuliamo l'acquisizione di dati grezzi
const fetchRawData = () => {
  console.log('Acquisizione dati grezzi...');
  return Task.of([
    { id: 1, value: '42', status: 'active' },
    { id: 2, value: 'invalid', status: 'inactive' },
    { id: 3, value: '17', status: 'active' },
    { id: 4, value: '0', status: 'pending' },
    { id: 5, value: '23', status: 'active' }
  ]);
};

// Funzione per parsare un valore numerico
const parseNumber = value => {
  const num = Number(value);
  return isNaN(num) ? Maybe.nothing() : Maybe.just(num);
};

// Filtra solo i record attivi
const filterActive = data => {
  return data.filter(item => item.status === 'active');
};

// Processa ciascun record
const processRecord = item => {
  return parseNumber(item.value)
    .map(num => ({
      id: item.id,
      originalValue: item.value,
      processedValue: num * 2, // Doppio del valore
      status: item.status
    }))
    .getOrElse({
      id: item.id,
      originalValue: item.value,
      error: 'Valore non numerico',
      status: item.status
    });
};

// Calcola statistiche sui dati processati
const calculateStats = processedData => {
  const validData = processedData.filter(item => !item.error);
  
  if (validData.length === 0) {
    return { 
      count: 0,
      average: 0,
      sum: 0,
      processedData 
    };
  }
  
  const sum = validData.reduce((acc, item) => acc + item.processedValue, 0);
  
  return {
    count: validData.length,
    average: sum / validData.length,
    sum,
    processedData
  };
};

// Pipeline di elaborazione completa
const dataPipeline = fetchRawData()
  .map(filterActive)
  .map(data => data.map(processRecord))
  .map(calculateStats);

// Esecuzione della pipeline
dataPipeline.fork(
  result => {
    console.log('Pipeline completata con successo:');
    console.log('Statistiche:', {
      count: result.count,
      average: result.average,
      sum: result.sum
    });
    console.log('Dati elaborati:', result.processedData);
  },
  error => console.error('Errore nella pipeline:', error.message)
);

// ==========================================
// Caso d'Uso 3: Integrazione di monads in un'applicazione Express
// ==========================================

console.log('\n======== CASO D\'USO 3: INTEGRAZIONE IN EXPRESS (SIMULATO) ========');

// Simuliamo Express.js (in un'applicazione reale, utilizzeremmo il framework reale)
const simulateExpressApp = () => {
  console.log('Inizializzazione app Express (simulata)...');
  
  // Simuliamo una richiesta HTTP
  const mockRequest = (body, params = {}, query = {}) => ({
    body,
    params,
    query
  });
  
  // Simuliamo una risposta HTTP
  const mockResponse = () => {
    const res = {};
    res.status = code => {
      res.statusCode = code;
      return res;
    };
    res.json = data => {
      res.body = data;
      console.log(`Risposta (${res.statusCode || 200}):`, JSON.stringify(data, null, 2));
      return res;
    };
    return res;
  };
  
  return {
    // Simulazione di un handler di una richiesta POST
    handleUserRegistration: (req, res) => {
      console.log('Richiesta di registrazione utente:', req.body);
      
      // Validazione dell'input utilizzando Validation monad
      const validateUser = data => {
        // Simuliamo un validatore semplificato
        const errors = [];
        
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.push('Email non valida');
        }
        
        if (!data.password || data.password.length < 6) {
          errors.push('Password troppo corta');
        }
        
        if (!data.name || data.name.trim().length === 0) {
          errors.push('Nome richiesto');
        }
        
        return errors.length > 0
          ? Either.left(errors)
          : Either.right(data);
      };
      
      // Simuliamo il controllo di un utente esistente
      const checkExistingUser = data => {
        const exists = Object.values(usersDB).some(user => user.email === data.email);
        
        return exists
          ? Either.left(['Email già registrata'])
          : Either.right(data);
      };
      
      // Simuliamo il salvataggio di un utente
      const saveUser = data => {
        // In un sistema reale, salveremmo nel DB
        console.log('Salvataggio utente (simulato):', data.email);
        
        const newUser = {
          id: Date.now(),
          email: data.email,
          name: data.name,
          passwordHash: hashPassword(data.password),
          role: 'user'
        };
        
        usersDB[data.email] = newUser;
        
        return Either.right({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        });
      };
      
      // Pipeline di registrazione
      return validateUser(req.body)
        .chain(checkExistingUser)
        .chain(saveUser)
        .fold(
          errors => res.status(400).json({ success: false, errors }),
          user => res.status(201).json({ success: true, user })
        );
    },
    
    // Simulazione di un handler di una richiesta GET
    handleGetUserProfile: (req, res) => {
      console.log('Richiesta di profilo utente:', req.params.id);
      
      // Cerchiamo l'utente per ID (simulato)
      const findUserById = id => {
        const user = Object.values(usersDB).find(user => user.id === parseInt(id));
        
        return Maybe.fromNullable(user)
          .map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }));
      };
      
      return findUserById(req.params.id)
        .fold(
          () => res.status(404).json({ success: false, error: 'Utente non trovato' }),
          user => res.status(200).json({ success: true, user })
        );
    }
  };
};

// Creazione dell'app simulata
const app = simulateExpressApp();

// Simulazione di richieste HTTP
console.log('Simulazione richiesta POST /api/users:');
const registrationReq = mockRequest({
  email: 'charlie@example.com',
  password: 'secure123',
  name: 'Charlie Brown'
});
const registrationRes = mockResponse();
app.handleUserRegistration(registrationReq, registrationRes);

console.log('\nSimulazione richiesta POST /api/users (con errori):');
const invalidReq = mockRequest({
  email: 'not-an-email',
  password: '123',
  name: ''
});
const invalidRes = mockResponse();
app.handleUserRegistration(invalidReq, invalidRes);

console.log('\nSimulazione richiesta GET /api/users/1:');
const profileReq = mockRequest({}, { id: 1 });
const profileRes = mockResponse();
app.handleGetUserProfile(profileReq, profileRes);

console.log('\nSimulazione richiesta GET /api/users/999 (non esistente):');
const notFoundReq = mockRequest({}, { id: 999 });
const notFoundRes = mockResponse();
app.handleGetUserProfile(notFoundReq, notFoundRes);

// ==========================================
// Estensione: Alcune utility functions monadiche utili
// ==========================================

// Funzione per convertire una Promise in una Task
const taskFromPromise = promise => new Task((resolve, reject) => {
  promise.then(resolve).catch(reject);
});

// Funzione per convertire una funzione basata su callback in una Task
const taskFromCallback = fn => (...args) => new Task((resolve, reject) => {
  fn(...args, (err, result) => {
    if (err) reject(err);
    else resolve(result);
  });
});

// Funzione per combinare più Task in parallelo
const parallel = tasks => new Task((resolve, reject) => {
  if (tasks.length === 0) {
    resolve([]);
    return;
  }
  
  let completed = 0;
  const results = new Array(tasks.length);
  let hasError = false;
  
  tasks.forEach((task, index) => {
    task.fork(
      value => {
        if (hasError) return;
        
        results[index] = value;
        completed++;
        
        if (completed === tasks.length) {
          resolve(results);
        }
      },
      error => {
        if (hasError) return;
        hasError = true;
        reject(error);
      }
    );
  });
});

// Esportiamo le funzioni di utility
module.exports = {
  taskFromPromise,
  taskFromCallback,
  parallel
};
