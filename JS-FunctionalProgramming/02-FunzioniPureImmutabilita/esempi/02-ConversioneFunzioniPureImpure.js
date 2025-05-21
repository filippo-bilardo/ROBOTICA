// 02-ConversioneFunzioniPureImpure.js
// Questo esempio mostra come convertire funzioni impure in funzioni pure

// ------------------- CASO 1: DIPENDENZA DA VARIABILI ESTERNE -------------------

// ❌ Funzione impura: dipende dalla variabile esterna taxRate
let taxRate = 0.2;
function calculateTaxImpure(amount) {
  return amount * taxRate;
}

// ✅ Versione pura: la variabile esterna diventa un parametro
function calculateTaxPure(amount, rate) {
  return amount * rate;
}

console.log("=== CASO 1: DIPENDENZA DA VARIABILI ESTERNE ===");
console.log("Impura - calculateTaxImpure(100):", calculateTaxImpure(100));
taxRate = 0.25; // Cambiamo la variabile esterna
console.log("Impura - calculateTaxImpure(100) dopo cambio di taxRate:", calculateTaxImpure(100));
console.log("Pura - calculateTaxPure(100, 0.2):", calculateTaxPure(100, 0.2));
console.log("Pura - calculateTaxPure(100, 0.25):", calculateTaxPure(100, 0.25));

// ------------------- CASO 2: MODIFICA DEGLI ARGOMENTI -------------------

// ❌ Funzione impura: modifica l'array passato come argomento
function addItemImpure(cart, item) {
  cart.push(item);
  return cart;
}

// ✅ Versione pura: crea un nuovo array senza modificare l'originale
function addItemPure(cart, item) {
  return [...cart, item]; // Usa lo spread operator per creare un nuovo array
}

console.log("\n=== CASO 2: MODIFICA DEGLI ARGOMENTI ===");
const cart1 = ["mela", "banana"];
console.log("Cart originale:", [...cart1]);
const updatedCart1 = addItemImpure(cart1, "arancia");
console.log("Impura - Cart dopo addItemImpure:", cart1);
console.log("Impura - Valore restituito:", updatedCart1);
console.log("Impura - Cart e valore restituito sono lo stesso oggetto?", cart1 === updatedCart1);

const cart2 = ["mela", "banana"];
console.log("\nCart originale:", [...cart2]);
const updatedCart2 = addItemPure(cart2, "arancia");
console.log("Pura - Cart dopo addItemPure:", cart2);
console.log("Pura - Valore restituito:", updatedCart2);
console.log("Pura - Cart e valore restituito sono lo stesso oggetto?", cart2 === updatedCart2);

// ------------------- CASO 3: MODIFICA DI OGGETTI -------------------

// ❌ Funzione impura: modifica l'oggetto utente
function addRoleImpure(user, role) {
  user.roles = user.roles || [];
  user.roles.push(role);
  return user;
}

// ✅ Versione pura: crea un nuovo oggetto con la proprietà roles aggiornata
function addRolePure(user, role) {
  const roles = [...(user.roles || []), role];
  return { ...user, roles };
}

console.log("\n=== CASO 3: MODIFICA DI OGGETTI ===");
const user1 = { name: "Alice", email: "alice@example.com" };
console.log("Utente originale:", { ...user1 });
const updatedUser1 = addRoleImpure(user1, "admin");
console.log("Impura - Utente dopo addRoleImpure:", user1);
console.log("Impura - Utente e valore restituito sono lo stesso oggetto?", user1 === updatedUser1);

const user2 = { name: "Bob", email: "bob@example.com" };
console.log("\nUtente originale:", { ...user2 });
const updatedUser2 = addRolePure(user2, "editor");
console.log("Pura - Utente dopo addRolePure:", user2);
console.log("Pura - Valore restituito:", updatedUser2);
console.log("Pura - Utente e valore restituito sono lo stesso oggetto?", user2 === updatedUser2);

// ------------------- CASO 4: METODI ARRAY CHE MODIFICANO L'ORIGINALE -------------------

// ❌ Funzione impura: usa sort() che modifica l'array originale
function sortNumbersImpure(numbers) {
  return numbers.sort((a, b) => a - b);
}

// ✅ Versione pura: crea una copia dell'array prima di ordinarlo
function sortNumbersPure(numbers) {
  return [...numbers].sort((a, b) => a - b);
}

console.log("\n=== CASO 4: METODI ARRAY CHE MODIFICANO L'ORIGINALE ===");
const numbers1 = [4, 1, 3, 2];
console.log("Array originale:", [...numbers1]);
const sortedNumbers1 = sortNumbersImpure(numbers1);
console.log("Impura - Array dopo sortNumbersImpure:", numbers1);
console.log("Impura - Array e valore restituito sono lo stesso oggetto?", numbers1 === sortedNumbers1);

const numbers2 = [4, 1, 3, 2];
console.log("\nArray originale:", [...numbers2]);
const sortedNumbers2 = sortNumbersPure(numbers2);
console.log("Pura - Array dopo sortNumbersPure:", numbers2);
console.log("Pura - Valore restituito:", sortedNumbers2);
console.log("Pura - Array e valore restituito sono lo stesso oggetto?", numbers2 === sortedNumbers2);

// ------------------- CASO 5: FUNZIONI CON EFFETTI COLLATERALI (I/O) -------------------

// ❌ Funzione impura: interagisce con il browser (localStorage)
function saveUserSettingsImpure(settings) {
  localStorage.setItem('userSettings', JSON.stringify(settings));
  return settings;
}

// ✅ Versione pura + funzione impura separata per l'effetto collaterale
function validateSettings(settings) {
  // Validazione pura, restituisce un nuovo oggetto con flag di validità
  const isValid = settings.theme && ['light', 'dark'].includes(settings.theme);
  return {
    ...settings,
    isValid
  };
}

// Funzione impura per l'IO, separata dalla logica di business
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

console.log("\n=== CASO 5: FUNZIONI CON EFFETTI COLLATERALI (I/O) ===");
console.log("In questo caso, separiamo la logica pura (validazione) dall'effetto collaterale (salvataggio)");
console.log("validateSettings({theme: 'light'}):", validateSettings({theme: 'light'}));
console.log("validateSettings({theme: 'blue'}):", validateSettings({theme: 'blue'}));
console.log("Nota: saveToStorage non è mostrato in azione poiché richiederebbe un browser con localStorage");

// ------------------- CASO 6: FUNZIONI CON EFFETTI COLLATERALI (DATA/RANDOM) -------------------

// ❌ Funzione impura: utilizza Date.now() che cambia ad ogni chiamata
function createUserImpure(name, email) {
  return {
    id: Date.now(),
    name,
    email,
    createdAt: new Date()
  };
}

// ✅ Versione pura: accetta timestamp come parametro
function createUserPure(name, email, timestamp) {
  return {
    id: timestamp,
    name,
    email,
    createdAt: new Date(timestamp)
  };
}

console.log("\n=== CASO 6: FUNZIONI CON EFFETTI COLLATERALI (DATA/RANDOM) ===");
console.log("Impura - createUserImpure('Alice', 'alice@example.com'):", createUserImpure('Alice', 'alice@example.com'));
console.log("Impura - Seconda chiamata (id diverso):", createUserImpure('Alice', 'alice@example.com'));

const timestamp = Date.now();
console.log("\nPura - createUserPure con timestamp esplicito:");
console.log("createUserPure('Alice', 'alice@example.com', " + timestamp + "):", 
            createUserPure('Alice', 'alice@example.com', timestamp));
console.log("Seconda chiamata (stesso id con stesso timestamp):", 
            createUserPure('Alice', 'alice@example.com', timestamp));

// ------------------- CASO 7: OGGETTI COMPLESSI E NESTING -------------------

// ❌ Funzione impura: modifica un oggetto nidificato
function updateAddressImpure(user, city) {
  user.address = user.address || {};
  user.address.city = city;
  return user;
}

// ✅ Versione pura: crea un nuovo oggetto con struttura nidificata aggiornata
function updateAddressPure(user, city) {
  return {
    ...user,
    address: {
      ...(user.address || {}),
      city
    }
  };
}

console.log("\n=== CASO 7: OGGETTI COMPLESSI E NESTING ===");
const user3 = { name: "Charlie", email: "charlie@example.com" };
console.log("Utente originale:", { ...user3 });
const updatedUser3 = updateAddressImpure(user3, "Roma");
console.log("Impura - Utente dopo updateAddressImpure:", user3);
console.log("Impura - Utente e valore restituito sono lo stesso oggetto?", user3 === updatedUser3);

const user4 = { name: "David", email: "david@example.com" };
console.log("\nUtente originale:", { ...user4 });
const updatedUser4 = updateAddressPure(user4, "Milano");
console.log("Pura - Utente dopo updateAddressPure:", user4);
console.log("Pura - Valore restituito:", updatedUser4);
console.log("Pura - Utente e valore restituito sono lo stesso oggetto?", user4 === updatedUser4);

// ------------------- RIEPILOGO -------------------

console.log("\n=== STRATEGIE GENERALI PER CONVERTIRE FUNZIONI IMPURE IN PURE ===");
console.log("1. Rendere esplicite le dipendenze esterne come parametri");
console.log("2. Non modificare mai gli argomenti di input");
console.log("3. Creare nuovi oggetti/array invece di modificare quelli esistenti");
console.log("4. Separare la logica pura dagli effetti collaterali");
console.log("5. Passare funzioni di callback per le operazioni con effetti collaterali");
console.log("6. Utilizzare pattern come 'dependency injection' per le dipendenze esterne");
console.log("7. Per operazioni non deterministiche (Date, Random), passare i valori come parametri");
