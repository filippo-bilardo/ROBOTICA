# Gestione degli Effetti Collaterali

Gli effetti collaterali rappresentano una delle maggiori sfide nella programmazione funzionale. Interazioni con il mondo esterno, come richieste HTTP, accesso al filesystem, interazioni con database, o anche semplici operazioni come la generazione di numeri casuali o la lettura dell'ora corrente, compromettono la purezza delle nostre funzioni.

In questo capitolo esploreremo strategie per gestire gli effetti collaterali nel codice asincrono, mantenendo al contempo i benefici della programmazione funzionale.

## Il problema degli effetti collaterali

In programmazione funzionale, un'operazione con effetti collaterali è una che:
1. **Modifica lo stato** al di fuori del suo scope locale
2. **Dipende da stato esterno** che potrebbe cambiare tra invocazioni
3. **Non è deterministica** (potrebbe produrre risultati diversi con gli stessi input)

Le operazioni asincrone tipicamente coinvolgono effetti collaterali come:
- **I/O di rete** (API calls, WebSockets)
- **I/O di filesystem** (lettura/scrittura file)
- **Interazioni con database**
- **Interazioni con l'UI**
- **Timer e operazioni legate al tempo**

## Principi per la gestione degli effetti collaterali

### 1. Isolare e posticipare

Il principio fondamentale è **isolare** gli effetti collaterali e **posticiparne** l'esecuzione il più possibile:

```javascript
// ❌ Effetto collaterale immediato e nascosto
function getUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(res => res.json());
}

// ✅ Effetto collaterale isolato ed esplicito
function createGetUserData(fetch) {
  return function(userId) {
    return () => fetch(`/api/users/${userId}`)
      .then(res => res.json());
  };
}

// Utilizzo
const getUserData = createGetUserData(window.fetch);
const getUserDataOperation = getUserData(123);
// L'effetto collaterale non è ancora avvenuto
getUserDataOperation().then(handleData); // Ora avviene l'effetto
```

### 2. Dichiarativo vs Imperativo

Separare **cosa** deve essere fatto da **come** viene fatto:

```javascript
// ❌ Approccio imperativo: mescola la descrizione con l'esecuzione
async function processUserData(userId) {
  const userData = await fetch(`/api/users/${userId}`).then(r => r.json());
  const enrichedData = await enrichUserData(userData);
  await saveToDatabase(enrichedData);
  return enrichedData;
}

// ✅ Approccio dichiarativo: prima descrive, poi esegue
function processUserData(userId) {
  return Task.of(userId)
    .chain(id => fetchUser(id))
    .chain(userData => enrichUserData(userData))
    .chain(enrichedData => 
      saveToDatabase(enrichedData)
        .map(() => enrichedData)
    );
}

// La descrizione è separata dall'esecuzione
processUserData(123).fork(
  err => handleError(err),
  data => displayData(data)
);
```

### 3. Dependency Injection

Iniettare le dipendenze con effetti collaterali permette maggiore testabilità:

```javascript
// ❌ Dipendenze hardcoded
function saveUserPreferences(prefs) {
  return fetch('/api/preferences', {
    method: 'POST',
    body: JSON.stringify(prefs)
  }).then(r => r.json());
}

// ✅ Dipendenze iniettate
function createPreferenceService({ fetch, localStorage }) {
  return {
    savePreferences: prefs => {
      return fetch('/api/preferences', {
        method: 'POST',
        body: JSON.stringify(prefs)
      }).then(r => r.json());
    },
    
    getCachedPreferences: () => {
      return Promise.resolve(
        JSON.parse(localStorage.getItem('preferences') || '{}')
      );
    }
  };
}

// Produzione
const preferenceService = createPreferenceService({
  fetch: window.fetch,
  localStorage: window.localStorage
});

// Test
const mockPreferenceService = createPreferenceService({
  fetch: (url, options) => Promise.resolve({ json: () => ({ success: true }) }),
  localStorage: {
    getItem: key => '{"theme":"dark"}',
    setItem: (key, value) => {}
  }
});
```

## Strategie per l'asincronia funzionale

### 1. IO Monad per effetti sincroni

IO monad è utile per incapsulare effetti collaterali sincroni:

```javascript
class IO {
  constructor(effect) {
    this.effect = effect;
  }
  
  static of(value) {
    return new IO(() => value);
  }
  
  map(fn) {
    return new IO(() => fn(this.effect()));
  }
  
  chain(fn) {
    return new IO(() => fn(this.effect()).effect());
  }
  
  run() {
    return this.effect();
  }
}

// Effetti collaterali incapsulati
const getCurrentTime = new IO(() => new Date());
const getRandomNumber = new IO(() => Math.random());

// Composizione di effetti
const generateId = getCurrentTime
  .chain(time => getRandomNumber
    .map(random => `id-${time.getTime()}-${Math.floor(random * 10000)}`)
  );

// Esecuzione esplicita dell'effetto
const newId = generateId.run();
```

### 2. Task per effetti asincroni

Task monad estende il pattern di IO agli effetti asincroni:

```javascript
// Assumiamo che Task sia già implementato come nell'esempio precedente

// Effetto asincrono incapsulato
const fetchData = url => new Task((reject, resolve) => {
  fetch(url)
    .then(r => r.json())
    .then(resolve)
    .catch(reject);
});

// Operazioni pure sulla descrizione dell'effetto
const processData = url => 
  fetchData(url)
    .map(data => data.items)
    .map(items => items.filter(item => item.active))
    .map(activeItems => activeItems.map(transformItem));

// Esecuzione esplicita e controllata
processData('/api/items').fork(
  error => console.error("Error:", error),
  items => console.log("Processed items:", items)
);
```

### 3. IO + Task per flussi complessi

Combinando IO e Task possiamo gestire flussi che mescolano effetti sincroni e asincroni:

```javascript
// Assumiamo che Task e IO siano già implementati

// Conversione da IO a Task
const toTask = io => new Task((_, resolve) => resolve(io.run()));

// Flusso combinato
const userFlow = userId => {
  // Effetto sincrono
  const startTime = new IO(() => new Date());
  
  // Conversione a Task per componibilità
  return toTask(startTime)
    .chain(time => {
      console.log(`Operation started at ${time}`);
      
      // Effetto asincrono
      return fetchUser(userId)
        .map(user => ({
          ...user,
          operationStartTime: time
        }));
    })
    .chain(user => {
      // Altro effetto sincrono
      const logger = new IO(() => {
        console.log(`Processing user ${user.name}`);
        return user;
      });
      
      return toTask(logger);
    })
    .chain(user => 
      // Altri effetti asincroni
      fetchUserPreferences(user.id)
        .map(prefs => ({ ...user, preferences: prefs }))
    );
};

userFlow(123).fork(
  err => console.error("Flow failed:", err),
  user => console.log("Flow completed:", user)
);
```

## Pattern avanzati

### 1. Reader Monad per la dependency injection

Il Reader monad è utile per gestire le dipendenze in modo funzionale:

```javascript
class Reader {
  constructor(run) {
    this.run = run;
  }
  
  static of(value) {
    return new Reader(() => value);
  }
  
  map(fn) {
    return new Reader(env => fn(this.run(env)));
  }
  
  chain(fn) {
    return new Reader(env => fn(this.run(env)).run(env));
  }
  
  // Per accedere all'ambiente
  ask() {
    return new Reader(env => env);
  }
  
  // Per modificare l'ambiente per una sottocomputazione
  local(modifier) {
    return new Reader(env => this.run(modifier(env)));
  }
}

// API service dipendente dall'ambiente
const userService = {
  getUser: id => 
    new Reader(env => 
      env.httpClient.get(`/users/${id}`)
    ),
    
  updateUser: (id, data) =>
    new Reader(env => 
      env.httpClient.put(`/users/${id}`, data)
    )
};

// Business logic che utilizza il service
const updateUserName = (userId, newName) =>
  userService.getUser(userId)
    .chain(user => 
      userService.updateUser(userId, { ...user, name: newName })
    );

// Configurazione dell'ambiente
const prodEnv = {
  httpClient: {
    get: url => fetch(url).then(r => r.json()),
    put: (url, data) => fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json())
  }
};

// Esecuzione
updateUserName(123, "New Name")
  .run(prodEnv)
  .then(result => console.log("Update successful:", result))
  .catch(error => console.error("Update failed:", error));
```

### 2. ReaderTask per dependency injection con asincronia

Combinando Reader e Task otteniamo un pattern potente per dipendenze asincrone:

```javascript
class ReaderTask {
  constructor(run) {
    this.run = run;
  }
  
  static of(value) {
    return new ReaderTask(env => Task.of(value));
  }
  
  static ask() {
    return new ReaderTask(env => Task.of(env));
  }
  
  static fromTask(task) {
    return new ReaderTask(() => task);
  }
  
  map(fn) {
    return new ReaderTask(env => this.run(env).map(fn));
  }
  
  chain(fn) {
    return new ReaderTask(env => 
      this.run(env).chain(a => fn(a).run(env))
    );
  }
  
  // Esecuzione finale
  execute(env) {
    return this.run(env);
  }
}

// API con dipendenze più complesse
const createUserAPI = () => ({
  getUser: id =>
    ReaderTask.ask().chain(env => 
      ReaderTask.fromTask(
        env.isAuthenticated 
          ? env.api.get(`/users/${id}`)
          : Task.rejected(new Error("Not authenticated"))
      )
    ),
    
  updateUser: (id, data) =>
    ReaderTask.ask().chain(env => {
      const hasPermission = env.permissions.includes('EDIT_USER');
      return hasPermission
        ? ReaderTask.fromTask(env.api.put(`/users/${id}`, data))
        : ReaderTask.fromTask(Task.rejected(new Error("Permission denied")));
    })
});

// Uso
const userAPI = createUserAPI();

const updateUserProfile = (userId, profileData) =>
  userAPI.getUser(userId)
    .map(user => ({ ...user, profile: { ...user.profile, ...profileData } }))
    .chain(updatedUser => userAPI.updateUser(userId, updatedUser));

// Esecuzione con ambiente specifico
const env = {
  isAuthenticated: true,
  permissions: ['VIEW_USER', 'EDIT_USER'],
  api: {
    get: url => new Task(/* ... */),
    put: (url, data) => new Task(/* ... */)
  }
};

updateUserProfile(123, { bio: "New bio" })
  .execute(env)
  .fork(
    error => console.error("Failed to update profile:", error),
    result => console.log("Profile updated:", result)
  );
```

## Test del codice asincrono funzionale

Uno dei maggiori vantaggi dell'approccio funzionale è la testabilità:

### Test di funzioni pure con monad

```javascript
// Funzione da testare
const processUserData = userData => 
  userData.age >= 18 
    ? Task.of({ ...userData, category: 'adult' })
    : Task.of({ ...userData, category: 'minor' });

// Test
describe('processUserData', () => {
  it('should categorize adults correctly', done => {
    const userData = { name: 'Test', age: 25 };
    
    processUserData(userData).fork(
      error => {
        done(error);
      },
      result => {
        expect(result.category).toEqual('adult');
        expect(result.name).toEqual('Test');
        done();
      }
    );
  });
  
  it('should categorize minors correctly', done => {
    const userData = { name: 'Young', age: 16 };
    
    processUserData(userData).fork(
      error => {
        done(error);
      },
      result => {
        expect(result.category).toEqual('minor');
        done();
      }
    );
  });
});
```

### Test con mock delle dipendenze

```javascript
// Service da testare
const createUserService = ({ api }) => ({
  getUserWithPosts: userId => 
    api.getUser(userId)
      .chain(user => 
        api.getPosts(userId)
          .map(posts => ({ ...user, posts }))
      )
});

// Test
describe('UserService', () => {
  it('should combine user and posts', done => {
    // Mock API
    const mockApi = {
      getUser: id => Task.of({ id, name: 'Test User' }),
      getPosts: userId => Task.of([
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ])
    };
    
    const userService = createUserService({ api: mockApi });
    
    userService.getUserWithPosts(123).fork(
      error => done(error),
      result => {
        expect(result.name).toEqual('Test User');
        expect(result.posts.length).toEqual(2);
        expect(result.posts[0].title).toEqual('Post 1');
        done();
      }
    );
  });
  
  it('should handle errors properly', done => {
    // Mock API with error
    const mockApi = {
      getUser: id => Task.rejected(new Error('User not found')),
      getPosts: userId => Task.of([])
    };
    
    const userService = createUserService({ api: mockApi });
    
    userService.getUserWithPosts(999).fork(
      error => {
        expect(error.message).toEqual('User not found');
        done();
      },
      result => {
        done(new Error('Should have failed but succeeded'));
      }
    );
  });
});
```

## Architettura funzionale per applicazioni asincrone

Per progetti più grandi, possiamo integrare questi concetti in un'architettura completa:

### Architettura a cipolla con effetti ai bordi

```
┌────────────────────────────────┐
│                                │
│  ┌────────────────────────┐    │
│  │                        │    │
│  │  ┌──────────────┐      │    │
│  │  │              │      │    │
│  │  │    Domain    │      │    │
│  │  │    Logic     │      │    │
│  │  │  (Pure)      │      │    │
│  │  │              │      │    │
│  │  └──────────────┘      │    │
│  │        ▲               │    │
│  │        │               │    │
│  │  Application Services  │    │
│  │  (Task/IO monads)      │    │
│  │                        │    │
│  └────────────────────────┘    │
│          ▲                     │
│          │                     │
│   Infrastructure              │
│   (Real effects)              │
│                                │
└────────────────────────────────┘
```

### Esempio di implementazione

```javascript
// 1. Domain Layer (Pure)
const userDomain = {
  validateUser: user => {
    if (!user.email) return { valid: false, error: 'Email required' };
    if (!user.name) return { valid: false, error: 'Name required' };
    return { valid: true, user };
  },
  
  enrichUserData: user => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    displayName: user.nickname || user.firstName
  })
};

// 2. Application Services Layer (Monad-based)
const userService = dependencies => ({
  createUser: userData => 
    Task.of(userData)
      .map(userDomain.validateUser)
      .chain(validation => 
        validation.valid
          ? dependencies.userRepo.saveUser(validation.user)
          : Task.rejected(new Error(validation.error))
      )
      .chain(user => 
        dependencies.emailService.sendWelcomeEmail(user.email)
          .map(() => user)  // Mantiene l'utente come risultato
      ),
      
  getUserProfile: userId =>
    dependencies.userRepo.findUser(userId)
      .map(userDomain.enrichUserData)
});

// 3. Infrastructure Layer (Real effects)
const createInfrastructure = ({ config }) => {
  const dbConnection = createDatabaseConnection(config.db);
  
  return {
    userRepo: {
      findUser: id => new Task((reject, resolve) => {
        dbConnection.query('SELECT * FROM users WHERE id = ?', [id])
          .then(users => {
            if (users.length === 0) reject(new Error('User not found'));
            else resolve(users[0]);
          })
          .catch(reject);
      }),
      
      saveUser: user => new Task((reject, resolve) => {
        dbConnection.query('INSERT INTO users SET ?', user)
          .then(result => resolve({ ...user, id: result.insertId }))
          .catch(reject);
      })
    },
    
    emailService: {
      sendWelcomeEmail: email => new Task((reject, resolve) => {
        const emailClient = createEmailClient(config.email);
        emailClient.send({
          to: email,
          subject: 'Welcome!',
          body: 'Thanks for joining our platform.'
        })
        .then(resolve)
        .catch(error => {
          // Log error but don't fail the entire operation
          console.error('Failed to send welcome email:', error);
          resolve(); // Resolve anyway
        });
      })
    }
  };
};

// 4. Composizione finale
const createApplication = config => {
  const infrastructure = createInfrastructure({ config });
  const services = {
    user: userService(infrastructure)
  };
  
  return {
    // API esterna dell'applicazione
    registerUser: userData => 
      services.user.createUser(userData).fork(
        error => console.error('Registration failed:', error),
        user => console.log('User registered:', user)
      ),
      
    getUserProfile: userId =>
      services.user.getUserProfile(userId).fork(
        error => console.error('Failed to get profile:', error),
        profile => console.log('User profile:', profile)
      )
  };
};

// Utilizzo
const app = createApplication({
  db: { /* config */ },
  email: { /* config */ }
});

app.registerUser({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  nickname: 'JD'
});
```

## Conclusione

La gestione degli effetti collaterali nel codice asincrono è una delle sfide più importanti della programmazione funzionale. Attraverso monads come IO e Task, possiamo incapsulare questi effetti e mantenere molti dei vantaggi della programmazione funzionale: componibilità, testabilità, e ragionamento locale.

I principi chiave da ricordare sono:

1. **Isolamento**: separare la descrizione degli effetti dalla loro esecuzione
2. **Dichiaratività**: costruire pipeline di trasformazioni prima di eseguirle
3. **Dependency Injection**: rendere esplicite le dipendenze per maggiore testabilità
4. **Composizionalità**: comporre effetti complessi da effetti più semplici

Applicando questi principi, possiamo creare codice asincrono che è più semplice da comprendere, testare e mantenere.
