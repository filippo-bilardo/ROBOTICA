/**
 * MODULO 4: MAP, FILTER E REDUCE
 * Esercizio 1: Trasformazioni con Map
 * 
 * Obiettivi:
 * - Padroneggiare l'uso della funzione map() per trasformare array
 * - Applicare trasformazioni semplici e complesse ai dati
 * - Comprendere l'immutabilità e la catena di trasformazioni
 * - Sostituire cicli imperativi con approcci funzionali
 */

console.log('=== ESERCIZIO 1: TRASFORMAZIONI CON MAP ===\n');

// ============================================================================
// SEZIONE 1: MAP - CONCETTI FONDAMENTALI
// ============================================================================

/**
 * Esercizio 1.1: Trasformazioni Base
 * Trasforma gli array usando map() invece di cicli for
 */

console.log('--- Sezione 1: Trasformazioni Base ---');

// Dataset di esempio
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const prezzi = [10.50, 25.99, 15.75, 8.25, 30.00];
const nomi = ['mario', 'luigi', 'peach', 'bowser', 'yoshi'];

// TODO: Raddoppia tutti i numeri
const numeroiRaddoppiati = numeri.map(n => n * 2);
console.log('Numeri raddoppiati:', numeroiRaddoppiati);

// TODO: Converte i prezzi da euro a dollari (tasso: 1.1)
const prezziInDollari = prezzi.map(prezzo => prezzo * 1.1);
console.log('Prezzi in dollari:', prezziInDollari.map(p => `$${p.toFixed(2)}`));

// TODO: Capitalizza i nomi
const nomiCapitalizzati = nomi.map(nome => 
    nome.charAt(0).toUpperCase() + nome.slice(1)
);
console.log('Nomi capitalizzati:', nomiCapitalizzati);

console.log();

// ============================================================================
// SEZIONE 2: TRASFORMAZIONI DI OGGETTI
// ============================================================================

console.log('--- Sezione 2: Trasformazioni di Oggetti ---');

const prodotti = [
    { id: 1, nome: 'Laptop', prezzo: 999.99, categoria: 'elettronica' },
    { id: 2, nome: 'Mouse', prezzo: 25.50, categoria: 'elettronica' },
    { id: 3, nome: 'Libro JS', prezzo: 35.00, categoria: 'libri' },
    { id: 4, nome: 'Tastiera', prezzo: 89.99, categoria: 'elettronica' },
    { id: 5, nome: 'Monitor', prezzo: 299.99, categoria: 'elettronica' }
];

/**
 * Esercizio 2.1: Estrazione di Proprietà
 * Estrai solo i nomi dei prodotti
 */
const nomiProdotti = prodotti.map(prodotto => prodotto.nome);
console.log('Nomi prodotti:', nomiProdotti);

/**
 * Esercizio 2.2: Calcolo di Nuovi Valori
 * Aggiungi il prezzo con IVA (22%) a ogni prodotto
 */
const prodottiConIva = prodotti.map(prodotto => ({
    ...prodotto,
    prezzoConIva: +(prodotto.prezzo * 1.22).toFixed(2)
}));
console.log('Prodotti con IVA:', prodottiConIva);

/**
 * Esercizio 2.3: Normalizzazione Dati
 * Crea una struttura normalizzata per l'API
 */
const prodottiNormalizzati = prodotti.map(prodotto => ({
    id: prodotto.id,
    title: prodotto.nome.toUpperCase(),
    price: prodotto.prezzo,
    category: prodotto.categoria.toUpperCase(),
    displayPrice: `€${prodotto.prezzo.toFixed(2)}`,
    slug: prodotto.nome.toLowerCase().replace(/\s+/g, '-')
}));

console.log('Prodotti normalizzati:', prodottiNormalizzati);
console.log();

// ============================================================================
// SEZIONE 3: TRASFORMAZIONI AVANZATE
// ============================================================================

console.log('--- Sezione 3: Trasformazioni Avanzate ---');

const utenti = [
    { id: 1, nome: 'Mario', cognome: 'Rossi', eta: 30, citta: 'Roma', professione: 'sviluppatore' },
    { id: 2, nome: 'Luigi', cognome: 'Verdi', eta: 25, citta: 'Milano', professione: 'designer' },
    { id: 3, nome: 'Anna', cognome: 'Bianchi', eta: 35, citta: 'Napoli', professione: 'manager' },
    { id: 4, nome: 'Marco', cognome: 'Neri', eta: 28, citta: 'Torino', professione: 'sviluppatore' }
];

/**
 * Esercizio 3.1: Creazione di Viste Personalizzate
 * Crea diverse rappresentazioni degli utenti per diversi contesti
 */

// Vista per lista contatti
const listaContatti = utenti.map(utente => ({
    id: utente.id,
    nomeCompleto: `${utente.nome} ${utente.cognome}`,
    location: utente.citta,
    job: utente.professione
}));

console.log('Lista contatti:', listaContatti);

// Vista per badge profilo
const badgeProfilo = utenti.map(utente => ({
    initials: `${utente.nome[0]}${utente.cognome[0]}`,
    displayName: utente.nome,
    profession: utente.professione,
    ageGroup: utente.eta < 30 ? 'giovane' : 'esperto'
}));

console.log('Badge profilo:', badgeProfilo);

/**
 * Esercizio 3.2: Trasformazioni Condizionali
 * Applica trasformazioni diverse basate su condizioni
 */
const utentiConStatus = utenti.map(utente => ({
    ...utente,
    status: utente.eta < 30 ? 'junior' : 'senior',
    saluto: utente.eta < 30 ? `Ciao ${utente.nome}!` : `Salve ${utente.cognome}`,
    categoria: utente.professione === 'sviluppatore' ? 'tech' : 'business'
}));

console.log('Utenti con status:', utentiConStatus);
console.log();

// ============================================================================
// SEZIONE 4: MAP CON INDICI E ARRAYS COMPLESSI
// ============================================================================

console.log('--- Sezione 4: Map con Indici e Arrays Complessi ---');

/**
 * Esercizio 4.1: Utilizzo dell'Indice
 * Usa l'indice per numerare elementi o creare riferimenti
 */
const playlist = ['Bohemian Rhapsody', 'Stairway to Heaven', 'Hotel California', 'Sweet Child O Mine'];

const playlistNumerata = playlist.map((canzone, indice) => ({
    numero: indice + 1,
    titolo: canzone,
    durata: `${Math.floor(Math.random() * 3) + 3}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    posizione: indice
}));

console.log('Playlist numerata:', playlistNumerata);

/**
 * Esercizio 4.2: Trasformazione di Array Annidati
 * Lavora con strutture dati più complesse
 */
const ordini = [
    {
        id: 'ORD001',
        cliente: 'Mario Rossi',
        articoli: [
            { nome: 'Laptop', quantita: 1, prezzo: 999.99 },
            { nome: 'Mouse', quantita: 2, prezzo: 25.50 }
        ]
    },
    {
        id: 'ORD002',
        cliente: 'Luigi Verdi',
        articoli: [
            { nome: 'Tastiera', quantita: 1, prezzo: 89.99 },
            { nome: 'Monitor', quantita: 1, prezzo: 299.99 }
        ]
    }
];

// Trasforma gli ordini calcolando i totali
const ordiniConTotale = ordini.map(ordine => ({
    ...ordine,
    numeroArticoli: ordine.articoli.length,
    totaleArticoli: ordine.articoli.reduce((sum, art) => sum + art.quantita, 0),
    totaleOrdine: ordine.articoli.reduce((sum, art) => sum + (art.prezzo * art.quantita), 0),
    articoliDettaglio: ordine.articoli.map(articolo => ({
        ...articolo,
        subtotale: articolo.prezzo * articolo.quantita
    }))
}));

console.log('Ordini con totale:', JSON.stringify(ordiniConTotale, null, 2));
console.log();

// ============================================================================
// SEZIONE 5: ESERCIZI PRATICI AVANZATI
// ============================================================================

console.log('--- Sezione 5: Esercizi Pratici Avanzati ---');

/**
 * Esercizio 5.1: Sistema di Valutazione
 * Trasforma i voti numerici in valutazioni descrittive
 */
const votiStudenti = [
    { nome: 'Alice', voto: 8.5 },
    { nome: 'Bob', voto: 6.0 },
    { nome: 'Charlie', voto: 9.2 },
    { nome: 'Diana', voto: 5.8 },
    { nome: 'Eve', voto: 7.3 }
];

const valutazioniComplete = votiStudenti.map(studente => {
    let giudizio, livello, colore;
    
    if (studente.voto >= 9) {
        giudizio = 'Eccellente';
        livello = 'A';
        colore = 'verde';
    } else if (studente.voto >= 8) {
        giudizio = 'Ottimo';
        livello = 'B';
        colore = 'azzurro';
    } else if (studente.voto >= 7) {
        giudizio = 'Buono';
        livello = 'C';
        colore = 'giallo';
    } else if (studente.voto >= 6) {
        giudizio = 'Sufficiente';
        livello = 'D';
        colore = 'arancione';
    } else {
        giudizio = 'Insufficiente';
        livello = 'F';
        colore = 'rosso';
    }
    
    return {
        ...studente,
        giudizio,
        livello,
        colore,
        percentuale: `${(studente.voto * 10).toFixed(1)}%`,
        promosso: studente.voto >= 6
    };
});

console.log('Valutazioni complete:', valutazioniComplete);

/**
 * Esercizio 5.2: Generazione ID e Timestamps
 * Aggiungi metadati automatici ai record
 */
const articoliBlog = [
    { titolo: 'Introduzione a JavaScript', contenuto: 'JavaScript è un linguaggio...' },
    { titolo: 'Programmazione Funzionale', contenuto: 'La programmazione funzionale...' },
    { titolo: 'React per Principianti', contenuto: 'React è una libreria...' }
];

const articoliCompleti = articoliBlog.map((articolo, indice) => ({
    id: `POST_${Date.now()}_${indice}`,
    slug: articolo.titolo.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, ''),
    ...articolo,
    lunghezza: articolo.contenuto.length,
    tempoLettura: Math.ceil(articolo.contenuto.split(' ').length / 200), // parole al minuto
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    metadata: {
        parole: articolo.contenuto.split(' ').length,
        caratteri: articolo.contenuto.length,
        paragrafi: articolo.contenuto.split('\n').length
    }
}));

console.log('Articoli completi:', JSON.stringify(articoliCompleti, null, 2));
console.log();

// ============================================================================
// SFIDE BONUS
// ============================================================================

console.log('--- Sfide Bonus ---');

/**
 * Sfida 1: Map Personalizzato
 * Implementa la tua versione di map
 */
function mapPersonalizzato(array, trasformazione) {
    const risultato = [];
    for (let i = 0; i < array.length; i++) {
        risultato.push(trasformazione(array[i], i, array));
    }
    return risultato;
}

// Test della implementazione
const testArray = [1, 2, 3, 4, 5];
const risultatoCustom = mapPersonalizzato(testArray, x => x * x);
const risultatoNativo = testArray.map(x => x * x);

console.log('Map personalizzato:', risultatoCustom);
console.log('Map nativo:', risultatoNativo);
console.log('Sono uguali:', JSON.stringify(risultatoCustom) === JSON.stringify(risultatoNativo));

/**
 * Sfida 2: Map con Async/Await
 * Simula trasformazioni asincrone
 */
async function mapAsincrono(array, trasformazioneAsync) {
    const risultati = [];
    for (const elemento of array) {
        const risultato = await trasformazioneAsync(elemento);
        risultati.push(risultato);
    }
    return risultati;
}

// Simulazione di una API call
const simulaApiCall = (id) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ id, data: `Dati per ${id}`, timestamp: Date.now() });
        }, Math.random() * 100);
    });
};

// Esempio d'uso (commentato per non bloccare l'esecuzione)
/*
(async () => {
    const ids = [1, 2, 3, 4, 5];
    const datiAPI = await mapAsincrono(ids, simulaApiCall);
    console.log('Dati da API:', datiAPI);
})();
*/

console.log();
console.log('=== FINE ESERCIZIO 1: MAP ===');
console.log('Prossimo: 02-FilterExercise.js');
