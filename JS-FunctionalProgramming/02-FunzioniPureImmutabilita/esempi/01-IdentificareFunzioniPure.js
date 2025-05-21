// 01-IdentificareFunzioniPure.js
// Questo esempio illustra come identificare funzioni pure e impure in JavaScript

// ------------------- FUNZIONI PURE -------------------

// Esempio 1: Funzione matematica semplice
// ✅ PURA: dipende solo dagli input, non modifica nulla all'esterno
function somma(a, b) {
  return a + b;
}

// Esempio 2: Creazione di un nuovo array senza modificare l'originale
// ✅ PURA: restituisce un nuovo array senza modificare l'input
function raddoppiaArray(array) {
  return array.map(x => x * 2);
}

// Esempio 3: Elaborazione di un oggetto in modo immutabile
// ✅ PURA: crea un nuovo oggetto invece di modificare quello esistente
function aggiungiProprietà(oggetto, chiave, valore) {
  return { ...oggetto, [chiave]: valore };
}

// Esempio 4: Funzione con calcoli complessi ma ancora pura
// ✅ PURA: il risultato dipende solo dagli input
function calcolaStatistiche(numeri) {
  const somma = numeri.reduce((acc, n) => acc + n, 0);
  const media = somma / numeri.length;
  const scartiQuadratici = numeri.map(n => Math.pow(n - media, 2));
  const varianza = scartiQuadratici.reduce((acc, sq) => acc + sq, 0) / numeri.length;
  
  return {
    somma,
    media,
    varianza,
    deviazioneStandard: Math.sqrt(varianza)
  };
}

// ------------------- FUNZIONI IMPURE -------------------

// Esempio 1: Funzione che utilizza una variabile esterna
// ❌ IMPURA: dipende da una variabile esterna (fattoreGlobale)
let fattoreGlobale = 10;
function moltiplicaPerFattoreGlobale(x) {
  return x * fattoreGlobale;
}

// Esempio 2: Funzione che modifica un oggetto passato come parametro
// ❌ IMPURA: modifica l'oggetto passato come parametro
function aggiungiProprietàImpura(oggetto, chiave, valore) {
  oggetto[chiave] = valore; // Modifica l'oggetto originale
  return oggetto;
}

// Esempio 3: Funzione che interagisce con il DOM
// ❌ IMPURA: interagisce con lo stato esterno (DOM)
function aggiornaUI(messaggio) {
  document.getElementById('output').textContent = messaggio;
}

// Esempio 4: Funzione che utilizza Date o Math.random
// ❌ IMPURA: il risultato dipende dal momento dell'esecuzione
function generaIdCasuale() {
  return 'id_' + Math.random().toString(36).substring(2, 9);
}

// Esempio 5: Funzione che effettua chiamate API
// ❌ IMPURA: effettua side-effects e il risultato dipende da fattori esterni
async function fetchDati(url) {
  const risposta = await fetch(url);
  return await risposta.json();
}

// ------------------- TEST E DIMOSTRAZIONE -------------------

// Test funzioni pure
console.log("=== FUNZIONI PURE ===");
console.log("somma(5, 3):", somma(5, 3));
console.log("somma(5, 3) (seconda chiamata):", somma(5, 3)); // Sempre lo stesso risultato

const numeri = [1, 2, 3, 4];
console.log("raddoppiaArray([1, 2, 3, 4]):", raddoppiaArray(numeri));
console.log("Array originale dopo raddoppiaArray:", numeri); // Non modificato

const persona = { nome: "Alice", età: 30 };
const personaConProfessione = aggiungiProprietà(persona, "professione", "Sviluppatore");
console.log("Oggetto originale dopo aggiungiProprietà:", persona); // Non modificato
console.log("Nuovo oggetto dopo aggiungiProprietà:", personaConProfessione);

console.log("calcolaStatistiche([2, 4, 6, 8]):", calcolaStatistiche([2, 4, 6, 8]));

// Test funzioni impure
console.log("\n=== FUNZIONI IMPURE ===");
console.log("moltiplicaPerFattoreGlobale(5):", moltiplicaPerFattoreGlobale(5));
fattoreGlobale = 20;
console.log("moltiplicaPerFattoreGlobale(5) dopo cambio del fattore globale:", moltiplicaPerFattoreGlobale(5));

const utente = { nome: "Bob", età: 25 };
console.log("aggiungiProprietàImpura - oggetto originale:", { ...utente });
aggiungiProprietàImpura(utente, "professione", "Designer");
console.log("aggiungiProprietàImpura - oggetto modificato:", utente);

console.log("generaIdCasuale():", generaIdCasuale());
console.log("generaIdCasuale() (seconda chiamata):", generaIdCasuale()); // Risultato diverso

// ------------------- COME IDENTIFICARE UNA FUNZIONE PURA -------------------

// Una funzione pura deve soddisfare queste condizioni:
// 1. Dato lo stesso input, restituisce sempre lo stesso output
// 2. Non ha effetti collaterali (non modifica stato esterno)
// 3. Non dipende da stato esterno mutabile

function isFunctionPure(fn, args, context = {}) {
  // Questo è solo un esempio concettuale, non può verificare realmente la purezza
  console.log(`\nVerifica concettuale di purezza per ${fn.name || "funzione anonima"}`);
  
  // Cloniamo il contesto e gli argomenti per evitare modifiche durante i test
  const contextCopy = JSON.parse(JSON.stringify(context));
  const argsCopy1 = JSON.parse(JSON.stringify(args));
  const argsCopy2 = JSON.parse(JSON.stringify(args));
  
  // Eseguiamo la funzione due volte con lo stesso input
  console.log("Test di deterministicità (stesso input, stesso output):");
  try {
    const result1 = fn.apply(contextCopy, argsCopy1);
    const result2 = fn.apply(contextCopy, argsCopy2);
    
    const deterministico = JSON.stringify(result1) === JSON.stringify(result2);
    console.log(`- Risultato primo test: ${JSON.stringify(result1)}`);
    console.log(`- Risultato secondo test: ${JSON.stringify(result2)}`);
    console.log(`- Deterministico: ${deterministico}`);
  } catch (e) {
    console.log(`- Errore durante il test di deterministicità: ${e.message}`);
    console.log(`- Nota: le funzioni con side-effects come API o DOM non possono essere testate qui`);
  }
  
  // Confrontiamo gli argomenti prima e dopo la chiamata
  console.log("Test di non-modificazione degli input:");
  const argsBeforeStringified = JSON.stringify(args);
  try {
    fn.apply(context, args);
    const argsAfterStringified = JSON.stringify(args);
    const nonModificaInput = argsBeforeStringified === argsAfterStringified;
    console.log(`- Input modificato: ${!nonModificaInput}`);
  } catch (e) {
    console.log(`- Errore durante il test di non-modificazione: ${e.message}`);
  }
  
  console.log("Nota: Questa è una verifica superficiale. Una vera analisi richiederebbe ispezione del codice.");
}

// Test di purezza (esempi)
isFunctionPure(somma, [5, 3]);
isFunctionPure(raddoppiaArray, [numeri]);
isFunctionPure(aggiungiProprietàImpura, [{ nome: "Test" }, "nuovaProp", "valore"]);
// Non possiamo facilmente testare funzioni che interagiscono con l'esterno come fetchDati
