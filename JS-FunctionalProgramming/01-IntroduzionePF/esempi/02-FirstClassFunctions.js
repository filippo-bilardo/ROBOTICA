// 02-FirstClassFunctions.js
// Questo esempio illustra il concetto di "funzioni come cittadini di prima classe" in JavaScript,
// ovvero la capacità di trattare le funzioni come qualsiasi altro valore

// ------------------- FUNZIONI COME VALORI -------------------
// In JavaScript, le funzioni possono essere assegnate a variabili
const saluta = function(nome) {
  return `Ciao, ${nome}!`;
};

// Possiamo chiamare questa funzione come ci aspetteremmo
console.log(saluta("Alice")); // Output: "Ciao, Alice!"

// Ma possiamo anche assegnare la funzione a un'altra variabile
const benvenuto = saluta;
console.log(benvenuto("Bob")); // Output: "Ciao, Bob!"

// ------------------- FUNZIONI COME ARGOMENTI -------------------
// Le funzioni possono essere passate come argomenti ad altre funzioni

// Una funzione che accetta un'altra funzione come argomento
function eseguiOperazione(x, y, operazione) {
  return operazione(x, y);
}

// Alcune funzioni che possiamo passare come argomenti
function somma(a, b) {
  return a + b;
}

function moltiplica(a, b) {
  return a * b;
}

// Ora possiamo eseguire diverse operazioni usando la stessa funzione
console.log(eseguiOperazione(5, 3, somma)); // Output: 8
console.log(eseguiOperazione(5, 3, moltiplica)); // Output: 15

// Possiamo anche utilizzare funzioni anonime (definite direttamente nell'argomento)
console.log(eseguiOperazione(5, 3, function(a, b) {
  return a - b;
})); // Output: 2

// O utilizzare le arrow functions per una sintassi più concisa
console.log(eseguiOperazione(5, 3, (a, b) => a / b)); // Output: 1.6666...

// ------------------- FUNZIONI CHE RESTITUISCONO FUNZIONI -------------------
// Le funzioni possono anche restituire altre funzioni

function creaIncrementer(incremento) {
  // Questa funzione restituisce un'altra funzione
  return function(numero) {
    return numero + incremento;
  };
}

// Creiamo una funzione che incrementa di 10
const incrementaDi10 = creaIncrementer(10);
console.log(incrementaDi10(5)); // Output: 15

// Creiamo una funzione che incrementa di 100
const incrementaDi100 = creaIncrementer(100);
console.log(incrementaDi100(5)); // Output: 105

// ------------------- FUNZIONI IN STRUTTURE DATI -------------------
// Le funzioni possono essere memorizzate in array, oggetti, ecc.

// Array di funzioni
const operazioni = [
  (a, b) => a + b,
  (a, b) => a - b,
  (a, b) => a * b,
  (a, b) => a / b
];

// Eseguiamo tutte le operazioni
console.log("Risultati di tutte le operazioni con 10 e 5:");
operazioni.forEach((operazione, indice) => {
  console.log(`Operazione ${indice}: ${operazione(10, 5)}`);
});

// Oggetto con funzioni come metodi
const calcolatrice = {
  somma: (a, b) => a + b,
  sottrazione: (a, b) => a - b,
  moltiplicazione: (a, b) => a * b,
  divisione: (a, b) => a / b
};

console.log("Calcolatrice:");
console.log(`10 + 5 = ${calcolatrice.somma(10, 5)}`);
console.log(`10 - 5 = ${calcolatrice.sottrazione(10, 5)}`);
console.log(`10 * 5 = ${calcolatrice.moltiplicazione(10, 5)}`);
console.log(`10 / 5 = ${calcolatrice.divisione(10, 5)}`);

// ------------------- VANTAGGI DELLE FUNZIONI COME CITTADINI DI PRIMA CLASSE -------------------
// 1. Astrazione e riutilizzo del codice
// 2. Creazione di funzioni di ordine superiore (higher-order functions)
// 3. Implementazione di pattern di programmazione funzionale come map, filter, reduce
// 4. Creazione di DSL (Domain-Specific Languages)
// 5. Implementazione di callback e gestione di eventi

// ------------------- ESEMPIO DI APPLICAZIONE PRATICA: GESTIONE DI EVENTI -------------------

// Immaginiamo di avere un sistema di gestione eventi
const eventHub = {
  // Memorizza i gestori di eventi
  handlers: {},
  
  // Registra un gestore per un evento
  on: function(evento, gestore) {
    if (!this.handlers[evento]) {
      this.handlers[evento] = [];
    }
    this.handlers[evento].push(gestore);
  },
  
  // Scatena un evento con determinati dati
  trigger: function(evento, dati) {
    if (this.handlers[evento]) {
      this.handlers[evento].forEach(gestore => {
        gestore(dati);
      });
    }
  }
};

// Ora possiamo registrare gestori per eventi specifici
eventHub.on("login", utente => {
  console.log(`Utente ${utente} ha effettuato il login`);
});

eventHub.on("login", utente => {
  console.log(`Inviata email di benvenuto a ${utente}`);
});

eventHub.on("logout", utente => {
  console.log(`Utente ${utente} ha effettuato il logout`);
});

// E scatenare eventi
console.log("\nScateniamo eventi:");
eventHub.trigger("login", "Alice");
eventHub.trigger("logout", "Bob");
