// 03-TecnicheImmutabilita.js
// Questo esempio illustra varie tecniche per lavorare con dati immutabili in JavaScript

// ------------------- OPERAZIONI SU ARRAY -------------------

console.log("=== OPERAZIONI SU ARRAY ===");

const numeri = [1, 2, 3, 4, 5];
console.log("Array originale:", numeri);

// Aggiungere elementi
// ❌ Approccio mutabile: numeri.push(6);
// ✅ Approccio immutabile:
const conNuovoElemento = [...numeri, 6];
console.log("Aggiungere elementi:", conNuovoElemento);

// Rimuovere elementi
// ❌ Approccio mutabile: numeri.splice(0, 1);
// ✅ Approccio immutabile:
const senzaPrimoElemento = numeri.slice(1);
console.log("Rimuovere il primo elemento:", senzaPrimoElemento);

// Rimuovere l'ultimo elemento
// ❌ Approccio mutabile: numeri.pop();
// ✅ Approccio immutabile:
const senzaUltimoElemento = numeri.slice(0, -1);
console.log("Rimuovere l'ultimo elemento:", senzaUltimoElemento);

// Rimuovere un elemento in posizione specifica
// ❌ Approccio mutabile: numeri.splice(2, 1);
// ✅ Approccio immutabile:
const senzaElementoInPosizione2 = [...numeri.slice(0, 2), ...numeri.slice(3)];
console.log("Rimuovere elemento in posizione 2:", senzaElementoInPosizione2);

// Rimuovere elementi per valore
// ❌ Approccio mutabile: while ((index = numeri.indexOf(3)) !== -1) { numeri.splice(index, 1); }
// ✅ Approccio immutabile:
const senzaValoreSpecifico = numeri.filter(n => n !== 3);
console.log("Rimuovere tutti gli elementi con valore 3:", senzaValoreSpecifico);

// Inserire elementi in una posizione specifica
// ❌ Approccio mutabile: numeri.splice(2, 0, 10);
// ✅ Approccio immutabile:
const conNuovoElementoInPosizione2 = [...numeri.slice(0, 2), 10, ...numeri.slice(2)];
console.log("Inserire un elemento in posizione 2:", conNuovoElementoInPosizione2);

// Aggiornare un elemento
// ❌ Approccio mutabile: numeri[2] = 10;
// ✅ Approccio immutabile:
const conElementoAggiornato = numeri.map((n, index) => index === 2 ? 10 : n);
console.log("Aggiornare elemento in posizione 2:", conElementoAggiornato);

// Aggiornare elementi che soddisfano una condizione
// ❌ Approccio mutabile: numeri.forEach((n, i) => { if (n % 2 === 0) numeri[i] *= 2; });
// ✅ Approccio immutabile:
const pariRaddoppiati = numeri.map(n => n % 2 === 0 ? n * 2 : n);
console.log("Raddoppiare i numeri pari:", pariRaddoppiati);

// Ordinare un array
// ❌ Approccio mutabile: numeri.sort((a, b) => b - a);
// ✅ Approccio immutabile:
const ordinatoDecrescente = [...numeri].sort((a, b) => b - a);
console.log("Ordinare in modo decrescente:", ordinatoDecrescente);

// ------------------- OPERAZIONI SU OGGETTI -------------------

console.log("\n=== OPERAZIONI SU OGGETTI ===");

const persona = {
  nome: "Alice",
  età: 30,
  indirizzo: {
    città: "Milano",
    cap: "20100",
    via: "Via Roma 123"
  },
  hobby: ["lettura", "nuoto"]
};

console.log("Oggetto originale:", persona);

// Aggiungere o aggiornare proprietà
// ❌ Approccio mutabile: persona.professione = "Sviluppatore";
// ✅ Approccio immutabile:
const personaConProfessione = { ...persona, professione: "Sviluppatore" };
console.log("Aggiungere una proprietà:", personaConProfessione);

// Aggiornare proprietà esistenti
// ❌ Approccio mutabile: persona.età = 31;
// ✅ Approccio immutabile:
const personaConEtàAggiornata = { ...persona, età: 31 };
console.log("Aggiornare una proprietà:", personaConEtàAggiornata);

// Aggiornare proprietà nidificate
// ❌ Approccio mutabile: persona.indirizzo.città = "Roma";
// ✅ Approccio immutabile:
const personaConIndirizzoAggiornato = {
  ...persona,
  indirizzo: {
    ...persona.indirizzo,
    città: "Roma"
  }
};
console.log("Aggiornare una proprietà nidificata:", personaConIndirizzoAggiornato);

// Rimuovere proprietà
// ❌ Approccio mutabile: delete persona.età;
// ✅ Approccio immutabile con rest operator:
const { età, ...personaSenzaEtà } = persona;
console.log("Rimuovere una proprietà:", personaSenzaEtà);

// Aggiornare array dentro oggetti
// ❌ Approccio mutabile: persona.hobby.push("cinema");
// ✅ Approccio immutabile:
const personaConNuovoHobby = {
  ...persona,
  hobby: [...persona.hobby, "cinema"]
};
console.log("Aggiungere elemento a un array dentro un oggetto:", personaConNuovoHobby);

// ------------------- TECNICHE PIÙ AVANZATE -------------------

console.log("\n=== TECNICHE AVANZATE ===");

// 1. Deep Clone
console.log("1. Deep Clone");

// Utilizzando JSON (limitato ma facile)
function deepCloneWithJson(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Deep clone ricorsivo (più flessibile ma meno efficiente)
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

const oggettoComplesso = {
  a: 1,
  b: { c: 2, d: [3, 4, { e: 5 }] }
};

const cloneCompleto = deepClone(oggettoComplesso);
console.log("Oggetto originale:", oggettoComplesso);
console.log("Clone profondo:", cloneCompleto);
console.log("È lo stesso oggetto?", oggettoComplesso === cloneCompleto);
console.log("L'oggetto nidificato è lo stesso?", oggettoComplesso.b === cloneCompleto.b);

// 2. Object.freeze
console.log("\n2. Object.freeze");

const oggettoImmutabile = Object.freeze({
  nome: "Bob",
  indirizzo: { città: "Roma" }
});

console.log("Oggetto congelato:", oggettoImmutabile);

// Tentativo di modifica (in strict mode genererebbe un errore)
try {
  oggettoImmutabile.nome = "Charlie";
} catch (e) {
  console.log("Errore durante tentativo di modifica (solo in strict mode)");
}

console.log("Dopo tentativo di modifica:", oggettoImmutabile);

// Nota: Object.freeze è superficiale
oggettoImmutabile.indirizzo.città = "Milano";
console.log("Oggetti nidificati possono ancora essere modificati:", oggettoImmutabile);

// Deep freeze ricorsivo
function deepFreeze(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  
  // Congela prima le proprietà
  Object.keys(obj).forEach(key => {
    const prop = obj[key];
    if (prop !== null && typeof prop === "object") {
      deepFreeze(prop);
    }
  });
  
  // Poi congela l'oggetto stesso
  return Object.freeze(obj);
}

const completamenteCongelato = deepFreeze({
  nome: "David",
  indirizzo: { città: "Torino" }
});

console.log("\nOggetto completamente congelato:", completamenteCongelato);
try {
  completamenteCongelato.indirizzo.città = "Napoli";
} catch (e) {
  console.log("Errore durante tentativo di modifica proprietà nidificata (solo in strict mode)");
}
console.log("Dopo tentativo di modifica nidificata:", completamenteCongelato);

// ------------------- PATTERN PER STRUTTURE IMMUTABILI COMPLESSE -------------------

console.log("\n=== PATTERN PER STRUTTURE IMMUTABILI COMPLESSE ===");

// 1. Funzione di aggiornamento con path
console.log("1. Aggiornamento con path");

function updateAtPath(obj, path, value) {
  if (!path.length) return value;
  
  const [head, ...tail] = path;
  const isArray = Array.isArray(obj);
  
  if (isArray) {
    return obj.map((item, index) => 
      index === Number(head) ? updateAtPath(item, tail, value) : item
    );
  }
  
  return {
    ...obj,
    [head]: obj.hasOwnProperty(head)
      ? updateAtPath(obj[head], tail, value)
      : updateAtPath(tail[0] === "" || !isNaN(Number(tail[0])) ? [] : {}, tail, value)
  };
}

const statoComplesso = {
  utenti: [
    { id: 1, nome: "Alice", preferenze: { tema: "chiaro" } },
    { id: 2, nome: "Bob", preferenze: { tema: "scuro" } }
  ],
  impostazioni: {
    notifiche: true,
    privacy: {
      condivisione: false
    }
  }
};

// Aggiornamento profondo
const statoAggiornato = updateAtPath(
  statoComplesso,
  ["utenti", 1, "preferenze", "tema"],
  "blu"
);

console.log("Stato aggiornato:", statoAggiornato.utenti[1].preferenze);
console.log("Stato originale:", statoComplesso.utenti[1].preferenze);

// 2. Lenti funzionali
console.log("\n2. Lenti funzionali");

const lens = (getter, setter) => ({
  get: obj => getter(obj),
  set: (obj, value) => setter(obj, value)
});

const prop = name => lens(
  obj => obj[name],
  (obj, value) => ({ ...obj, [name]: value })
);

// Composizione di lenti
const compose = (lens1, lens2) => lens(
  obj => lens2.get(lens1.get(obj)),
  (obj, value) => lens1.set(obj, lens2.set(lens1.get(obj), value))
);

// Operazioni con lenti
const view = (lens, obj) => lens.get(obj);
const set = (lens, obj, value) => lens.set(obj, value);
const over = (lens, obj, fn) => lens.set(obj, fn(lens.get(obj)));

// Esempio di uso di lenti
const nameLens = prop("nome");
const preferencesLens = prop("preferenze");
const themeLens = prop("tema");
const preferencesThemeLens = compose(preferencesLens, themeLens);

const user = { nome: "Charlie", preferenze: { tema: "scuro" } };

console.log("Vista tramite lenti:", view(nameLens, user));
console.log("Vista composita:", view(preferencesThemeLens, user));

const updatedUser = set(preferencesThemeLens, user, "blu");
console.log("Utente aggiornato tramite lenti:", updatedUser);
console.log("Originale non modificato:", user);

// ------------------- LIBRERIE PER L'IMMUTABILITÀ -------------------

console.log("\n=== LIBRERIE PER L'IMMUTABILITÀ ===");
console.log("Per applicazioni reali, considera queste librerie:");
console.log("1. Immutable.js - Strutture dati persistenti e immutabili");
console.log("   esempio: const map = Map({ a: 1, b: 2 }); const map2 = map.set('c', 3);");
console.log("2. Immer - Permette di scrivere codice mutabile che produce risultati immutabili");
console.log("   esempio: produce(state, draft => { draft.user.name = 'newName'; });");
console.log("3. Ramda - Funzioni pure per trasformazioni immutabili");
console.log("   esempio: R.assocPath(['user', 'address', 'city'], 'newCity', state);");
console.log("4. lodash/fp - Variante funzionale di lodash");
console.log("   esempio: _.set('user.address.city', 'newCity', state);");

// ------------------- CONSIDERAZIONI SU PERFORMANCE -------------------

console.log("\n=== PERFORMANCE ===");
console.log("L'immutabilità può avere implicazioni sulla performance:");

console.log("1. Vantaggi:");
console.log("   - Structural sharing (le parti non modificate sono condivise in memoria)");
console.log("   - Confronti rapidi di riferimento per rilevare cambiamenti");
console.log("   - Possibilità di memoizzazione efficace");

console.log("2. Svantaggi:");
console.log("   - Overhead di memoria per grandi strutture dati");
console.log("   - Creazione di nuovi oggetti può impattare il garbage collector");
console.log("   - Aggiornamenti nidificati possono richiedere più tempo");

console.log("\nNota: In molti casi, i vantaggi in termini di debugging e manutenibilità");
console.log("superano di gran lunga gli svantaggi di performance, specialmente con");
console.log("le moderne implementazioni JavaScript e l'hardware attuale.");
