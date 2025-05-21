// 01-ImperativoVsFunzionale.js
// Questo esempio mostra come lo stesso problema può essere risolto
// usando sia un approccio imperativo che un approccio funzionale in JavaScript

// ------------------- PROBLEMA -------------------
// Dato un array di numeri, calcolare la somma dei quadrati dei numeri pari

// ------------------- DATI DI ESEMPIO -------------------
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ------------------- SOLUZIONE IMPERATIVA -------------------
function sommaQuadratiPariImperativo(array) {
    // Inizializziamo una variabile per memorizzare la somma
    let somma = 0;
    
    // Iteriamo attraverso l'array
    for (let i = 0; i < array.length; i++) {
        // Controlliamo se il numero è pari
        if (array[i] % 2 === 0) {
            // Calcoliamo il quadrato e lo aggiungiamo alla somma
            somma += array[i] * array[i];
        }
    }
    
    // Restituiamo il risultato
    return somma;
}

console.log("Soluzione imperativa:", sommaQuadratiPariImperativo(numeri)); // Output: 220

// ------------------- SOLUZIONE FUNZIONALE -------------------
function sommaQuadratiPariFunzionale(array) {
    return array
        // Filtriamo solo i numeri pari
        .filter(numero => numero % 2 === 0)
        // Trasformiamo ogni numero nel suo quadrato
        .map(numero => numero * numero)
        // Riduciamo l'array alla somma dei suoi elementi
        .reduce((accumulatore, valore) => accumulatore + valore, 0);
}

console.log("Soluzione funzionale:", sommaQuadratiPariFunzionale(numeri)); // Output: 220

// ------------------- ANALISI -------------------
// Approccio Imperativo:
// - Utilizzo di variabili mutabili (somma)
// - Controllo esplicito del flusso con cicli e condizionali
// - Focus sul "come" ottenere il risultato
// - Modifica dello stato durante l'esecuzione

// Approccio Funzionale:
// - Nessuna variabile mutabile
// - Uso di funzioni di ordine superiore (filter, map, reduce)
// - Composizione di funzioni semplici per ottenere un comportamento complesso
// - Focus sul "cosa" ottenere piuttosto che sul "come"
// - Nessuna modifica di stato, ogni operazione produce un nuovo valore

// ------------------- ULTERIORE SCOMPOSIZIONE FUNZIONALE -------------------
// Possiamo rendere il codice funzionale ancora più leggibile e modulare 
// scomponendolo in funzioni pure più piccole e componibili

const isPari = numero => numero % 2 === 0;
const quadrato = numero => numero * numero;
const somma = (a, b) => a + b;

function sommaQuadratiPariFunzionaleScomposto(array) {
    return array
        .filter(isPari)
        .map(quadrato)
        .reduce(somma, 0);
}

console.log("Soluzione funzionale scomposta:", sommaQuadratiPariFunzionaleScomposto(numeri)); // Output: 220

// ------------------- VANTAGGI DELL'APPROCCIO FUNZIONALE -------------------
// 1. Leggibilità: il codice esprime chiaramente l'intento
// 2. Modularità: le funzioni pure possono essere riutilizzate in altri contesti
// 3. Testabilità: le funzioni pure sono facili da testare
// 4. Manutenibilità: parti del codice possono essere modificate senza influire sul resto
// 5. Parallelizzabilità: operazioni senza stato sono naturalmente parallelizzabili
