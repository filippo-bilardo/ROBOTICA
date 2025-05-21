// 04-TestabilitaFunzionale.js
// Questo esempio dimostra come le funzioni pure e l'immutabilità migliorano la testabilità

// ------------------- SETUP DEL MINI-FRAMEWORK DI TEST -------------------

// Un semplice framework di testing per dimostrare i concetti
const test = {
  runTests() {
    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // Esegue tutti i test registrati
    for (const testCase of this.tests) {
      try {
        testCase.test();
        console.log(`✅ PASSATO: ${testCase.name}`);
        results.passed++;
        results.tests.push({ name: testCase.name, passed: true });
      } catch (e) {
        console.log(`❌ FALLITO: ${testCase.name}`);
        console.log(`   Errore: ${e.message}`);
        results.failed++;
        results.tests.push({ name: testCase.name, passed: false, error: e.message });
      }
    }

    // Mostra risultati complessivi
    console.log(`\nRisultati: ${results.passed} passati, ${results.failed} falliti`);
    return results;
  },

  // Array per memorizzare i test
  tests: [],

  // Registra un nuovo test
  it(name, testFn) {
    this.tests.push({ name, test: testFn });
  },

  // Funzioni di asserzione
  assertEquals(actual, expected, message) {
    const isEqual = typeof expected === 'object' && expected !== null
      ? JSON.stringify(actual) === JSON.stringify(expected)
      : actual === expected;

    if (!isEqual) {
      throw new Error(message || `Previsto ${JSON.stringify(expected)}, ottenuto ${JSON.stringify(actual)}`);
    }
  },

  assertTrue(value, message) {
    if (!value) {
      throw new Error(message || `Il valore dovrebbe essere true`);
    }
  },

  assertFalse(value, message) {
    if (value) {
      throw new Error(message || `Il valore dovrebbe essere false`);
    }
  }
};

// ------------------- ESEMPIO 1: CONFRONTO TRA APPROCCI PURI E IMPURI -------------------

console.log("=== ESEMPIO 1: CONFRONTO DI TESTABILITÀ TRA APPROCCI PURI E IMPURI ===\n");

// Variabile di stato globale
let databaseMock = {
  users: [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "user" },
    { id: 3, name: "Charlie", role: "user" }
  ]
};

// ❌ APPROCCIO IMPURO: dipende e modifica lo stato globale
const userServiceImpure = {
  getAdminUsers() {
    return databaseMock.users.filter(user => user.role === "admin");
  },

  addUser(user) {
    // Genera un ID incrementale basato sugli utenti esistenti
    const maxId = Math.max(...databaseMock.users.map(u => u.id));
    const newUser = { ...user, id: maxId + 1 };
    databaseMock.users.push(newUser);
    return newUser;
  },

  deleteUser(id) {
    const index = databaseMock.users.findIndex(user => user.id === id);
    if (index !== -1) {
      databaseMock.users.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Test delle funzioni impure
console.log("Test dell'approccio impuro:");
test.it("Impuro: getAdminUsers dovrebbe restituire gli amministratori", () => {
  // Questo test dipende dallo stato attuale di databaseMock
  const admins = userServiceImpure.getAdminUsers();
  test.assertEquals(admins.length, 1);
  test.assertEquals(admins[0].name, "Alice");
});

test.it("Impuro: addUser dovrebbe aggiungere un utente", () => {
  // Questo test modifica lo stato globale
  const newUser = userServiceImpure.addUser({ name: "David", role: "user" });
  test.assertEquals(newUser.id, 4);
  
  // Verifichiamo che l'utente sia stato effettivamente aggiunto
  test.assertEquals(databaseMock.users.length, 4);
});

test.it("Impuro: deleteUser dovrebbe eliminare un utente", () => {
  // Questo test dipende dall'esecuzione del test precedente e modifica ulteriormente lo stato
  const result = userServiceImpure.deleteUser(4);
  test.assertTrue(result);
  test.assertEquals(databaseMock.users.length, 3);
});

// Eseguiamo i test impuri
test.runTests();
test.tests = []; // Resettiamo l'array di test

// ✅ APPROCCIO PURO: non dipende da stato globale e non ha effetti collaterali
const userServicePure = {
  getAdminUsers(users) {
    return users.filter(user => user.role === "admin");
  },

  addUser(users, user) {
    // Genera un ID incrementale basato sugli utenti esistenti
    const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
    const newUser = { ...user, id: maxId + 1 };
    return {
      users: [...users, newUser],
      addedUser: newUser
    };
  },

  deleteUser(users, id) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) {
      return {
        users,
        deleted: false
      };
    }
    
    // Creiamo un nuovo array senza l'utente da eliminare
    return {
      users: [...users.slice(0, index), ...users.slice(index + 1)],
      deleted: true
    };
  }
};

// Test delle funzioni pure
console.log("\nTest dell'approccio puro:");

// Definiamo dati di test isolati per ogni test
const testUsers = [
  { id: 1, name: "Alice", role: "admin" },
  { id: 2, name: "Bob", role: "user" },
  { id: 3, name: "Charlie", role: "user" }
];

test.it("Puro: getAdminUsers dovrebbe restituire gli amministratori", () => {
  const admins = userServicePure.getAdminUsers(testUsers);
  test.assertEquals(admins.length, 1);
  test.assertEquals(admins[0].name, "Alice");
});

test.it("Puro: addUser dovrebbe aggiungere un utente", () => {
  const result = userServicePure.addUser(testUsers, { name: "David", role: "user" });
  
  // Verifichiamo il risultato
  test.assertEquals(result.addedUser.id, 4);
  test.assertEquals(result.users.length, 4);
  
  // Verifichiamo che l'array originale non sia stato modificato
  test.assertEquals(testUsers.length, 3, "L'array originale non dovrebbe essere modificato");
});

test.it("Puro: deleteUser dovrebbe eliminare un utente", () => {
  const result = userServicePure.deleteUser(testUsers, 2);
  
  // Verifichiamo il risultato
  test.assertTrue(result.deleted);
  test.assertEquals(result.users.length, 2);
  test.assertFalse(result.users.some(user => user.id === 2), "L'utente dovrebbe essere stato eliminato");
  
  // Verifichiamo che l'array originale non sia stato modificato
  test.assertEquals(testUsers.length, 3, "L'array originale non dovrebbe essere modificato");
});

// Eseguiamo i test puri
test.runTests();
test.tests = []; // Resettiamo l'array di test

// ------------------- ESEMPIO 2: TEST DI FUNZIONALITÀ COMPLESSE -------------------

console.log("\n=== ESEMPIO 2: TEST DI FUNZIONALITÀ COMPLESSE ===\n");

// Implementazione di un carrello acquisti

// ❌ APPROCCIO IMPURO
const shoppingCartImpure = {
  items: [],
  
  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }
  },
  
  removeItem(productId) {
    const index = this.items.findIndex(item => item.product.id === productId);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  },
  
  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
      return true;
    }
    return false;
  },
  
  getTotalPrice() {
    return this.items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0);
  },
  
  clear() {
    this.items = [];
  }
};

// Test del carrello impuro
console.log("Test del carrello impuro:");

// Dobbiamo resettare lo stato prima di ogni test
shoppingCartImpure.clear();

test.it("Impuro: addItem dovrebbe aggiungere un prodotto al carrello", () => {
  shoppingCartImpure.addItem({ id: 1, name: "Laptop", price: 1000 });
  test.assertEquals(shoppingCartImpure.items.length, 1);
  test.assertEquals(shoppingCartImpure.items[0].product.name, "Laptop");
  test.assertEquals(shoppingCartImpure.items[0].quantity, 1);
});

test.it("Impuro: addItem dovrebbe incrementare la quantità per prodotti esistenti", () => {
  // Questo test dipende dallo stato lasciato dal test precedente!
  shoppingCartImpure.addItem({ id: 1, name: "Laptop", price: 1000 }, 2);
  test.assertEquals(shoppingCartImpure.items.length, 1);
  test.assertEquals(shoppingCartImpure.items[0].quantity, 3);
});

test.it("Impuro: getTotalPrice dovrebbe calcolare il prezzo totale correttamente", () => {
  // Di nuovo, questo test dipende dallo stato attuale
  test.assertEquals(shoppingCartImpure.getTotalPrice(), 3000);
});

// Eseguiamo i test impuri
test.runTests();
test.tests = []; // Resettiamo l'array di test

// ✅ APPROCCIO PURO
const shoppingCartPure = {
  // Nota: ogni funzione prende lo stato attuale e restituisce il nuovo stato
  
  addItem(cart, product, quantity = 1) {
    const items = [...cart.items];
    const existingItemIndex = items.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Creiamo un nuovo array con l'elemento aggiornato
      return {
        ...cart,
        items: [
          ...items.slice(0, existingItemIndex),
          { 
            ...items[existingItemIndex], 
            quantity: items[existingItemIndex].quantity + quantity 
          },
          ...items.slice(existingItemIndex + 1)
        ]
      };
    } else {
      // Aggiungiamo un nuovo elemento
      return {
        ...cart,
        items: [...items, { product, quantity }]
      };
    }
  },
  
  removeItem(cart, productId) {
    const items = cart.items.filter(item => item.product.id !== productId);
    return {
      ...cart,
      items
    };
  },
  
  updateQuantity(cart, productId, quantity) {
    const items = cart.items.map(item => 
      item.product.id === productId 
        ? { ...item, quantity } 
        : item
    );
    
    return {
      ...cart,
      items
    };
  },
  
  getTotalPrice(cart) {
    return cart.items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0);
  },
  
  createCart() {
    return { items: [] };
  }
};

// Test del carrello puro
console.log("\nTest del carrello puro:");

test.it("Puro: addItem dovrebbe aggiungere un prodotto al carrello", () => {
  const initialCart = shoppingCartPure.createCart();
  const updatedCart = shoppingCartPure.addItem(
    initialCart, 
    { id: 1, name: "Laptop", price: 1000 }
  );
  
  test.assertEquals(updatedCart.items.length, 1);
  test.assertEquals(updatedCart.items[0].product.name, "Laptop");
  test.assertEquals(updatedCart.items[0].quantity, 1);
  
  // Verifichiamo che il carrello originale non sia modificato
  test.assertEquals(initialCart.items.length, 0);
});

test.it("Puro: addItem dovrebbe incrementare la quantità per prodotti esistenti", () => {
  // Ogni test può preparare il proprio stato iniziale
  let cart = shoppingCartPure.createCart();
  cart = shoppingCartPure.addItem(cart, { id: 1, name: "Laptop", price: 1000 });
  
  const updatedCart = shoppingCartPure.addItem(cart, { id: 1, name: "Laptop", price: 1000 }, 2);
  
  test.assertEquals(updatedCart.items.length, 1);
  test.assertEquals(updatedCart.items[0].quantity, 3);
});

test.it("Puro: getTotalPrice dovrebbe calcolare il prezzo totale correttamente", () => {
  // Creiamo lo stato desiderato per questo test specifico
  let cart = shoppingCartPure.createCart();
  cart = shoppingCartPure.addItem(cart, { id: 1, name: "Laptop", price: 1000 }, 2);
  cart = shoppingCartPure.addItem(cart, { id: 2, name: "Mouse", price: 50 }, 1);
  
  const total = shoppingCartPure.getTotalPrice(cart);
  test.assertEquals(total, 2050);
});

// Aggiungiamo un test più complesso che sarebbe difficile con l'approccio impuro
test.it("Puro: dovrebbe gestire una sequenza complessa di operazioni", () => {
  let cart = shoppingCartPure.createCart();
  
  // Aggiungiamo alcuni prodotti
  cart = shoppingCartPure.addItem(cart, { id: 1, name: "Laptop", price: 1000 });
  cart = shoppingCartPure.addItem(cart, { id: 2, name: "Mouse", price: 50 }, 2);
  
  // Aumentiamo la quantità del laptop
  cart = shoppingCartPure.updateQuantity(cart, 1, 3);
  
  // Rimuoviamo il mouse
  cart = shoppingCartPure.removeItem(cart, 2);
  
  // Verifichiamo lo stato finale
  test.assertEquals(cart.items.length, 1);
  test.assertEquals(cart.items[0].product.id, 1);
  test.assertEquals(cart.items[0].quantity, 3);
  test.assertEquals(shoppingCartPure.getTotalPrice(cart), 3000);
});

// Eseguiamo i test puri
test.runTests();
test.tests = []; // Resettiamo l'array di test

// ------------------- VANTAGGI DELLA TESTABILITÀ FUNZIONALE -------------------

console.log("\n=== VANTAGGI DELLA TESTABILITÀ FUNZIONALE ===");
console.log("1. Test isolati e indipendenti");
console.log("   - Ogni test può preparare il proprio stato senza dipendere da altri test");
console.log("   - Non è necessario resettare lo stato tra i test");

console.log("\n2. Test deterministici");
console.log("   - Dato lo stesso input, si ottiene sempre lo stesso output");
console.log("   - I test sono ripetibili e prevedibili");

console.log("\n3. Facilità di mock e fixture");
console.log("   - Le dipendenze sono passate esplicitamente, rendendo facile la sostituzione");
console.log("   - Non è necessario preparare stub complessi per lo stato globale");

console.log("\n4. Test più espressivi");
console.log("   - I test descrivono chiaramente input e output attesi");
console.log("   - La preparazione dello stato è esplicita e locale al test");

console.log("\n5. Supporto alla property-based testing");
console.log("   - Le funzioni pure si prestano bene ai test basati su proprietà");
console.log("   - Possibilità di testare con migliaia di input casuali");

// ------------------- TECNICHE DI TESTING AVANZATE PER IL CODICE FUNZIONALE -------------------

console.log("\n=== TECNICHE DI TESTING AVANZATE ===");

// Esempio di property-based testing concettuale
console.log("1. Property-Based Testing (concettuale)");
console.log("   Per funzioni pure, possiamo verificare proprietà matematiche invece di casi specifici");

function reverseArray(arr) {
  return [...arr].reverse();
}

test.it("reverseArray dovrebbe preservare la lunghezza dell'array", () => {
  const inputArrays = [
    [],
    [1],
    [1, 2],
    [1, 2, 3, 4, 5],
    ["a", "b", "c"]
  ];
  
  for (const arr of inputArrays) {
    test.assertEquals(
      reverseArray(arr).length,
      arr.length,
      `La lunghezza dell'array invertito dovrebbe essere uguale all'originale`
    );
  }
});

test.it("reverseArray invertito due volte dovrebbe essere uguale all'originale", () => {
  const inputArrays = [
    [],
    [1],
    [1, 2],
    [1, 2, 3, 4, 5],
    ["a", "b", "c"]
  ];
  
  for (const arr of inputArrays) {
    const doubleReversed = reverseArray(reverseArray(arr));
    for (let i = 0; i < arr.length; i++) {
      test.assertEquals(
        doubleReversed[i],
        arr[i],
        `Gli elementi dovrebbero essere gli stessi dopo doppia inversione`
      );
    }
  }
});

// Esempio di test composizionale
console.log("\n2. Test Composizionale");
console.log("   Le funzioni pure sono facilmente componibili, quindi possiamo testare le unità e poi la composizione");

// Funzioni pure componibili
function double(x) { return x * 2; }
function increment(x) { return x + 1; }
function square(x) { return x * x; }

// Composizione di funzioni
function compose(f, g) {
  return function(x) {
    return f(g(x));
  };
}

test.it("Le funzioni componenti dovrebbero funzionare singolarmente", () => {
  test.assertEquals(double(3), 6);
  test.assertEquals(increment(3), 4);
  test.assertEquals(square(3), 9);
});

test.it("La composizione di funzioni dovrebbe funzionare come previsto", () => {
  const incrementThenDouble = compose(double, increment);
  const doubleIncrement = compose(increment, double);
  
  test.assertEquals(incrementThenDouble(3), 8); // double(increment(3)) = double(4) = 8
  test.assertEquals(doubleIncrement(3), 7);     // increment(double(3)) = increment(6) = 7
});

// Eseguiamo i test avanzati
test.runTests();
