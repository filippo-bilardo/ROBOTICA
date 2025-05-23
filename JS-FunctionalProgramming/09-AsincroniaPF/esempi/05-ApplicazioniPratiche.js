/**
 * Applicazioni Pratiche della Programmazione Funzionale Asincrona
 * Casi d'uso reali e pattern avanzati in scenari concreti
 */

// ========================================================================================
// UTILITY E HELPERS
// ========================================================================================

// Funzionale semplice implementation di Task monad
class Task {
  constructor(computation) {
    this.computation = computation;
  }
  
  fork(onRejected, onResolved) {
    return this.computation(onRejected, onResolved);
  }
  
  map(fn) {
    return new Task((reject, resolve) => {
      this.computation(reject, value => {
        try {
          resolve(fn(value));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  
  chain(fn) {
    return new Task((reject, resolve) => {
      this.computation(reject, value => {
        try {
          fn(value).fork(reject, resolve);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  
  static of(value) {
    return new Task((_, resolve) => resolve(value));
  }
  
  static rejected(error) {
    return new Task(reject => reject(error));
  }
  
  static fromPromise(promise) {
    return new Task((reject, resolve) => {
      promise.then(resolve).catch(reject);
    });
  }
  
  static all(tasks) {
    return new Task((reject, resolve) => {
      const results = new Array(tasks.length);
      let completed = 0;
      
      if (tasks.length === 0) {
        resolve([]);
        return;
      }
      
      tasks.forEach((task, index) => {
        task.fork(
          err => reject(err),
          value => {
            results[index] = value;
            completed++;
            
            if (completed === tasks.length) {
              resolve(results);
            }
          }
        );
      });
    });
  }
}

// Funzioni di utility
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
const tap = fn => x => { fn(x); return x; };
const log = label => data => { console.log(`${label}:`, data); return data; };

// ========================================================================================
// 1. APPLICAZIONE PRATICA: GESTIONE DELLE API CON CACHE E RETRY
// ========================================================================================

console.log('=== API CLIENT CON CACHE E RETRY ===');

// Simulazione di API client con cache
class APIClient {
  constructor() {
    this.cache = new Map();
    this.baseUrl = 'https://api.example.com'; // Finto URL
  }
  
  // Metodo privato che simula una chiamata HTTP
  _fetchData(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`Fetching ${url}...`);
    
    // Simulazione della richiesta di rete con possibilità di errore
    return new Promise((resolve, reject) => {
      const delay = 300 + Math.random() * 500;
      const shouldFail = Math.random() < 0.3; // 30% di possibilità di fallimento
      
      setTimeout(() => {
        if (shouldFail && !options.noFail) {
          console.log(`Request to ${url} failed!`);
          reject(new Error(`Request to ${url} failed`));
        } else {
          console.log(`Request to ${url} succeeded`);
          resolve({
            data: { 
              id: endpoint.split('/')[2] || 'root',
              timestamp: new Date().toISOString(),
              endpoint 
            },
            headers: { 'x-ratelimit-remaining': '10' }
          });
        }
      }, delay);
    });
  }
  
  // Versione funzionale con Task, cache e retry
  fetchWithTaskCache(endpoint, options = {}) {
    const cacheKey = endpoint;
    
    // Check cache first
    if (this.cache.has(cacheKey) && !options.bypassCache) {
      console.log(`Cache hit for ${endpoint}`);
      return Task.of(this.cache.get(cacheKey));
    }
    
    // Helper for fetch with retry
    const createFetchTask = (retries = 3, delay = 500) => {
      return new Task((reject, resolve) => {
        const attemptFetch = (retriesLeft) => {
          this._fetchData(endpoint, options)
            .then(response => {
              // Cache the successful response
              if (!options.noCache) {
                this.cache.set(cacheKey, response);
              }
              resolve(response);
            })
            .catch(error => {
              if (retriesLeft <= 0) {
                reject(error);
                return;
              }
              
              console.log(`Retrying ${endpoint}, ${retriesLeft} attempts left`);
              setTimeout(() => attemptFetch(retriesLeft - 1), delay);
            });
        };
        
        attemptFetch(retries);
      });
    };
    
    return createFetchTask();
  }
}

// Uso dell'API client funzionale
function demoApiClient() {
  const client = new APIClient();
  
  console.log('\n> Prima richiesta (potrebbe fallire e riprovare):');
  const userTask = client.fetchWithTaskCache('/users/123')
    .map(response => response.data);
  
  userTask.fork(
    error => console.error('Error fetching user:', error),
    data => console.log('User data:', data)
  );
  
  // Seconda richiesta - dovrebbe usare la cache se la prima è riuscita
  setTimeout(() => {
    console.log('\n> Seconda richiesta (dovrebbe usare la cache):');
    client.fetchWithTaskCache('/users/123').fork(
      error => console.error('Error:', error),
      response => console.log('Response (from cache):', response.data)
    );
  }, 2000);
  
  // Terza richiesta - forza il bypass della cache
  setTimeout(() => {
    console.log('\n> Terza richiesta (bypass della cache):');
    client.fetchWithTaskCache('/users/123', { bypassCache: true }).fork(
      error => console.error('Error:', error),
      response => console.log('Fresh data:', response.data)
    );
  }, 3500);
}

// ========================================================================================
// 2. APPLICAZIONE PRATICA: PROCESSAMENTO DATI IN PIPELINE ASINCRONO
// ========================================================================================

console.log('\n=== PROCESSAMENTO DATI IN PIPELINE ===');

// Simulazione di un database di prodotti
const productDatabase = {
  fetchProducts: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Laptop', price: 999, category: 'electronics' },
          { id: 2, name: 'Phone', price: 699, category: 'electronics' },
          { id: 3, name: 'Desk', price: 349, category: 'furniture' },
          { id: 4, name: 'Chair', price: 149, category: 'furniture' },
          { id: 5, name: 'Headphones', price: 199, category: 'electronics' }
        ]);
      }, 300);
    });
  },
  
  fetchProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        switch(productId) {
          case 1:
            resolve({ 
              id: 1, description: 'Powerful laptop', 
              specs: { cpu: 'i7', ram: '16GB', storage: '512GB SSD' } 
            });
            break;
          case 2:
            resolve({ 
              id: 2, description: 'Smartphone', 
              specs: { screen: '6.1"', camera: '12MP', storage: '128GB' } 
            });
            break;
          case 3:
            resolve({ 
              id: 3, description: 'Modern desk', 
              specs: { material: 'Oak', width: '120cm', height: '75cm' } 
            });
            break;
          case 4:
            resolve({ 
              id: 4, description: 'Ergonomic chair', 
              specs: { material: 'Mesh', adjustable: true } 
            });
            break;
          case 5:
            resolve({ 
              id: 5, description: 'Noise-cancelling headphones', 
              specs: { type: 'Over-ear', wireless: true, batteryLife: '20h' } 
            });
            break;
          default:
            reject(new Error(`Product ${productId} not found`));
        }
      }, 200);
    });
  }
};

// Simulazione di un servizio di prezzi
const pricingService = {
  fetchPriceDetails: (productId) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          basePrice: productId * 100 + 99,
          discount: productId % 2 === 0 ? 10 : 0,
          tax: 20
        });
      }, 150);
    });
  }
};

// Trasformazione funzionale dei prodotti in Task
function processingPipelineExample() {
  console.log('\n> Esempio di pipeline di elaborazione dati:');
  
  // Funzioni pure per le trasformazioni
  const fetchProducts = () => Task.fromPromise(productDatabase.fetchProducts());
  
  const fetchProductDetails = product => 
    Task.fromPromise(productDatabase.fetchProductDetails(product.id))
      .map(details => ({ ...product, ...details }));
  
  const fetchPricing = product =>
    Task.fromPromise(pricingService.fetchPriceDetails(product.id))
      .map(pricing => ({ 
        ...product, 
        pricing,
        finalPrice: pricing.basePrice * (1 - pricing.discount / 100) * (1 + pricing.tax / 100)
      }));
  
  const processProductCategory = product => {
    switch(product.category) {
      case 'electronics':
        return { ...product, warranty: '2 years' };
      case 'furniture':
        return { ...product, assemblyRequired: true };
      default:
        return product;
    }
  };
  
  // Pipeline asincrona che recupera e processa un prodotto completo
  const processProduct = product => 
    Task.of(product)
      .chain(fetchProductDetails)
      .map(processProductCategory)
      .chain(fetchPricing);
  
  // Esecuzione parallela per tutti i prodotti
  fetchProducts()
    .map(products => products.slice(0, 3)) // Prendiamo solo i primi 3 prodotti
    .chain(products => {
      console.log('Fetched products:', products.map(p => p.name).join(', '));
      
      // Processare ogni prodotto in parallelo
      const productTasks = products.map(processProduct);
      return Task.all(productTasks);
    })
    .fork(
      error => console.error('Pipeline error:', error),
      processedProducts => {
        console.log('\nProcessed products:');
        processedProducts.forEach(product => {
          console.log(`- ${product.name}: ${product.description}`);
          console.log(`  Price: $${product.finalPrice.toFixed(2)} (base: $${product.pricing.basePrice}, discount: ${product.pricing.discount}%)`);
          console.log(`  Specs:`, product.specs);
          if (product.warranty) console.log(`  Warranty: ${product.warranty}`);
          if (product.assemblyRequired) console.log(`  Assembly required: Yes`);
          console.log();
        });
      }
    );
}

// ========================================================================================
// 3. APPLICAZIONE PRATICA: MACCHINA A STATI ASINCRONA FUNZIONALE
// ========================================================================================

console.log('\n=== MACCHINA A STATI ASINCRONA FUNZIONALE ===');

// Implementazione funzionale di una macchina a stati asincrona
function createStateMachine(initialState, transitions) {
  // Stato corrente (in una closure)
  let currentState = initialState;
  
  // Funzione per inviare un evento alla macchina a stati
  const dispatch = (event, payload) => {
    const transition = transitions[currentState][event];
    
    if (!transition) {
      return Task.rejected(
        new Error(`No transition for event '${event}' in state '${currentState}'`)
      );
    }
    
    // Esegui la transizione (può essere asincrona)
    return Task.of({ prevState: currentState, event, payload })
      .chain(() => {
        console.log(`[StateMachine] ${currentState} --${event}--> Processing...`);
        return transition(payload);
      })
      .map(result => {
        const nextState = result.nextState || currentState;
        const data = result.data;
        
        console.log(`[StateMachine] ${currentState} --${event}--> ${nextState}`);
        currentState = nextState;
        
        return {
          previousState: currentState,
          currentState: nextState,
          data
        };
      });
  };
  
  // Restituisce un oggetto con i metodi della macchina a stati
  return {
    getState: () => currentState,
    dispatch
  };
}

// Esempio di macchina a stati per un ordine
function orderStateMachineDemo() {
  console.log('\n> Demo macchina a stati per un ordine:');
  
  // Definiamo le transizioni come funzioni pure che restituiscono Task
  const orderTransitions = {
    'created': {
      'validate': (order) => {
        return new Task((_, resolve) => {
          setTimeout(() => {
            const isValid = order.items.length > 0 && order.total > 0;
            
            if (isValid) {
              resolve({ 
                nextState: 'validated',
                data: { ...order, validatedAt: new Date().toISOString() }
              });
            } else {
              resolve({ 
                nextState: 'validation_failed',
                data: { ...order, error: 'Invalid order' }
              });
            }
          }, 300);
        });
      },
      
      'cancel': (order) => Task.of({
        nextState: 'cancelled',
        data: { ...order, cancelledAt: new Date().toISOString() }
      })
    },
    
    'validated': {
      'process_payment': (order) => {
        return new Task((reject, resolve) => {
          setTimeout(() => {
            const paymentSuccess = Math.random() > 0.3;
            
            if (paymentSuccess) {
              resolve({
                nextState: 'payment_processed',
                data: { ...order, paymentId: 'PAY-' + Math.random().toString(36).substr(2, 9) }
              });
            } else {
              resolve({
                nextState: 'payment_failed',
                data: { ...order, paymentError: 'Payment declined' }
              });
            }
          }, 500);
        });
      }
    },
    
    'payment_processed': {
      'ship': (order) => {
        return Task.of({
          nextState: 'shipped',
          data: { ...order, shippedAt: new Date().toISOString() }
        })
        .map(tap(result => {
          console.log(`[Shipping] Order ${order.id} shipped!`);
        }));
      }
    },
    
    'payment_failed': {
      'retry_payment': (order) => {
        // Stessa logica di process_payment, ma con maggiore probabilità di successo
        return new Task((reject, resolve) => {
          setTimeout(() => {
            const paymentSuccess = Math.random() > 0.1;
            
            if (paymentSuccess) {
              resolve({
                nextState: 'payment_processed',
                data: { ...order, paymentId: 'PAY-RETRY-' + Math.random().toString(36).substr(2, 9) }
              });
            } else {
              resolve({
                nextState: 'payment_failed',
                data: { ...order, paymentError: 'Payment declined again' }
              });
            }
          }, 300);
        });
      },
      
      'cancel': (order) => Task.of({
        nextState: 'cancelled',
        data: { ...order, cancelledAt: new Date().toISOString() }
      })
    },
    
    'shipped': {
      'deliver': (order) => Task.of({
        nextState: 'delivered',
        data: { ...order, deliveredAt: new Date().toISOString() }
      }),
      
      'return': (order) => Task.of({
        nextState: 'returned',
        data: { ...order, returnedAt: new Date().toISOString() }
      })
    },
    
    'delivered': {
      'complete': (order) => Task.of({
        nextState: 'completed',
        data: { ...order, completedAt: new Date().toISOString() }
      })
    },
    
    'validation_failed': {
      'update': (order) => Task.of({
        nextState: 'created',
        data: { ...order, updatedAt: new Date().toISOString() }
      })
    },
    
    'cancelled': {},
    'returned': {},
    'completed': {}
  };
  
  // Creiamo la macchina a stati
  const orderStateMachine = createStateMachine('created', orderTransitions);
  
  // Un ordine di esempio
  const exampleOrder = {
    id: 'ORD-123',
    customer: { id: 'CUST-456', name: 'John Doe' },
    items: [
      { id: 'PROD-1', name: 'Laptop', qty: 1, price: 1200 },
      { id: 'PROD-2', name: 'Mouse', qty: 1, price: 25 }
    ],
    total: 1225,
    createdAt: new Date().toISOString()
  };
  
  // Utilizziamo la macchina a stati in modo funzionale
  const processOrder = order => {
    console.log(`Processing order ${order.id}...`);
    
    return orderStateMachine.dispatch('validate', order)
      .chain(result => {
        if (result.currentState === 'validation_failed') {
          console.log('Order validation failed, updating order...');
          return orderStateMachine.dispatch('update', result.data);
        }
        return Task.of(result);
      })
      .chain(result => {
        console.log('Order validated, processing payment...');
        return orderStateMachine.dispatch('process_payment', result.data);
      })
      .chain(result => {
        if (result.currentState === 'payment_failed') {
          console.log('Payment failed, retrying...');
          return orderStateMachine.dispatch('retry_payment', result.data);
        }
        return Task.of(result);
      })
      .chain(result => {
        if (result.currentState === 'payment_processed') {
          console.log('Payment successful, shipping order...');
          return orderStateMachine.dispatch('ship', result.data);
        }
        
        if (result.currentState === 'payment_failed') {
          console.log('Payment retry failed, cancelling order...');
          return orderStateMachine.dispatch('cancel', result.data);
        }
        
        return Task.of(result);
      })
      .chain(result => {
        if (result.currentState === 'shipped') {
          console.log('Order shipped, delivering...');
          return orderStateMachine.dispatch('deliver', result.data)
            .chain(deliverResult => {
              console.log('Order delivered, completing...');
              return orderStateMachine.dispatch('complete', deliverResult.data);
            });
        }
        
        return Task.of(result);
      });
  };
  
  // Eseguiamo il flusso dell'ordine
  processOrder(exampleOrder).fork(
    error => console.error('Order processing error:', error),
    result => {
      console.log(`\nOrder processing complete!`);
      console.log(`Final state: ${result.currentState}`);
      console.log(`Order details:`, result.data);
    }
  );
}

// ========================================================================================
// 4. APPLICAZIONE PRATICA: WORKFLOW BASATO SU EVENT SOURCING
// ========================================================================================

console.log('\n=== WORKFLOW BASATO SU EVENT SOURCING ===');

// Simulazione di una semplice architettura CQRS/Event Sourcing
function eventSourcingExample() {
  console.log('\n> Event Sourcing Example:');
  
  // Definizione degli eventi (immutabili)
  const createEvent = (type, data) => ({
    type,
    data,
    timestamp: new Date().toISOString()
  });
  
  // Store degli eventi
  const eventStore = {
    events: [],
    
    append: (event) => {
      eventStore.events.push(event);
      console.log(`Event stored: ${event.type}`);
      return Task.of(event);
    },
    
    getEventsForEntity: (entityId) => {
      const events = eventStore.events.filter(e => 
        e.data && e.data.entityId === entityId
      );
      return Task.of(events);
    }
  };
  
  // Proiezione funzionale - prende eventi e li riduce a uno stato
  const reduceEvents = (events, initialState = {}) => {
    return events.reduce((state, event) => {
      switch (event.type) {
        case 'USER_CREATED':
          return { 
            ...state, 
            id: event.data.entityId,
            name: event.data.name,
            email: event.data.email,
            createdAt: event.timestamp,
            status: 'active'
          };
          
        case 'USER_PROFILE_UPDATED':
          return { 
            ...state, 
            name: event.data.name || state.name,
            email: event.data.email || state.email,
            updatedAt: event.timestamp
          };
          
        case 'USER_SUBSCRIPTION_ADDED':
          return { 
            ...state, 
            subscription: event.data.plan,
            subscriptionStartDate: event.timestamp
          };
          
        case 'USER_DEACTIVATED':
          return { 
            ...state, 
            status: 'inactive',
            deactivatedAt: event.timestamp
          };
          
        default:
          return state;
      }
    }, initialState);
  };
  
  // Comandi - funzioni che generano eventi
  const createUser = (userId, userData) => {
    const event = createEvent('USER_CREATED', {
      entityId: userId,
      ...userData
    });
    
    return eventStore.append(event);
  };
  
  const updateUserProfile = (userId, profileData) => {
    const event = createEvent('USER_PROFILE_UPDATED', {
      entityId: userId,
      ...profileData
    });
    
    return eventStore.append(event);
  };
  
  const addSubscription = (userId, plan) => {
    const event = createEvent('USER_SUBSCRIPTION_ADDED', {
      entityId: userId,
      plan
    });
    
    return eventStore.append(event);
  };
  
  const deactivateUser = (userId) => {
    const event = createEvent('USER_DEACTIVATED', {
      entityId: userId
    });
    
    return eventStore.append(event);
  };
  
  // Query - ricostruisce lo stato a partire dagli eventi
  const getUserState = (userId) => {
    return eventStore.getEventsForEntity(userId)
      .map(events => {
        console.log(`Found ${events.length} events for user ${userId}`);
        return reduceEvents(events);
      });
  };
  
  // Esempio di utilizzo
  const userId = 'user-123';
  
  // Workflow funzionale con Task e pipeline
  const userWorkflow = pipe(
    // Crea un nuovo utente
    () => createUser(userId, { 
      name: 'John Doe', 
      email: 'john@example.com' 
    }),
    
    // Poi aggiorna il profilo
    () => updateUserProfile(userId, { 
      name: 'John M. Doe'
    }),
    
    // Poi aggiungi una subscription
    () => addSubscription(userId, 'premium'),
    
    // Infine, recupera lo stato corrente dell'utente
    () => getUserState(userId)
  );
  
  // Eseguiamo il workflow
  userWorkflow()
    .fork(
      error => console.error('Workflow error:', error),
      userState => {
        console.log('\nFinal user state:', userState);
        
        // Deactivate user e mostra lo stato aggiornato
        console.log('\nDeactivating user...');
        deactivateUser(userId).chain(() => getUserState(userId)).fork(
          error => console.error('Error:', error),
          newState => console.log('Updated user state:', newState)
        );
      }
    );
}

// ========================================================================================
// ESECUZIONE DEGLI ESEMPI
// ========================================================================================

async function runExamples() {
  try {
    demoApiClient();
    
    // Attendiamo che le API terminino per non sovrapporre l'output
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Pipeline di prodotti con Task
    processingPipelineExample();
    
    // Attendiamo la fine dell'esempio precedente
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Macchina a stati asincrona
    orderStateMachineDemo();
    
    // Attendiamo la fine dell'esempio precedente
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Event sourcing e CQRS
    eventSourcingExample();
    
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

runExamples();

// ========================================================================================
// CONCLUSIONI E BEST PRACTICES
// ========================================================================================

/**
 * CONSIDERAZIONI FINALI:
 * 
 * 1. Il pattern funzionale asincrono offre:
 *    - Prevedibilità e controllo di flussi complessi
 *    - Isolamento degli effetti collaterali
 *    - Migliore gestione degli errori
 *    - Alta componibilità di operazioni
 * 
 * 2. Best practices:
 *    - Preferisci Task per operazioni componibili e controllabili
 *    - Usa funzioni pure per trasformare dati
 *    - Isola gli effetti collaterali ai bordi dell'applicazione
 *    - Componi flussi complessi da funzioni semplici
 * 
 * 3. Trade-offs:
 *    - Maggiore verbosità rispetto al codice imperativo
 *    - Curva di apprendimento più ripida
 *    - Può richiedere librerie esterne in progetti reali (Ramda, Folktale, Fluture)
 * 
 * 4. Quando usare:
 *    - Flussi asincroni complessi con molte dipendenze
 *    - Quando la componibilità è fondamentale
 *    - Sistemi con requisiti di resilienza e gestione errori avanzata
 */
