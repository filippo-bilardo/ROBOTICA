/**
 * MODULO 4: MAP, FILTER E REDUCE
 * Esercizio 2: Selezioni con Filter
 * 
 * Obiettivi:
 * - Padroneggiare l'uso della funzione filter() per selezionare elementi
 * - Applicare condizioni semplici e complesse per il filtraggio
 * - Combinare più condizioni per filtri avanzati
 * - Sostituire cicli di ricerca con approcci funzionali
 */

console.log('=== ESERCIZIO 2: SELEZIONI CON FILTER ===\n');

// ============================================================================
// SEZIONE 1: FILTER - CONCETTI FONDAMENTALI
// ============================================================================

console.log('--- Sezione 1: Filtraggio Base ---');

// Dataset di esempio
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const parole = ['casa', 'programmazione', 'js', 'funzionale', 'codice', 'filter', 'array'];
const punteggi = [85, 92, 78, 95, 88, 76, 89, 91, 83, 94];

/**
 * Esercizio 1.1: Filtri Numerici Base
 */

// TODO: Seleziona solo i numeri pari
const numeriPari = numeri.filter(n => n % 2 === 0);
console.log('Numeri pari:', numeriPari);

// TODO: Seleziona numeri maggiori di 7
const numeriMaggioriDi7 = numeri.filter(n => n > 7);
console.log('Numeri > 7:', numeriMaggioriDi7);

// TODO: Seleziona numeri in un range specifico (5-10)
const numeriInRange = numeri.filter(n => n >= 5 && n <= 10);
console.log('Numeri tra 5 e 10:', numeriInRange);

// TODO: Seleziona punteggi sufficienti (>= 80)
const punteggiSufficienti = punteggi.filter(p => p >= 80);
console.log('Punteggi sufficienti:', punteggiSufficienti);

/**
 * Esercizio 1.2: Filtri su Stringhe
 */

// TODO: Seleziona parole lunghe (> 5 caratteri)
const paroleLunghe = parole.filter(parola => parola.length > 5);
console.log('Parole lunghe:', paroleLunghe);

// TODO: Seleziona parole che contengono 'a'
const paroleConA = parole.filter(parola => parola.includes('a'));
console.log('Parole con "a":', paroleConA);

// TODO: Seleziona parole che iniziano con 'c'
const paroleConC = parole.filter(parola => parola.startsWith('c'));
console.log('Parole che iniziano con "c":', paroleConC);

console.log();

// ============================================================================
// SEZIONE 2: FILTRAGGIO DI OGGETTI
// ============================================================================

console.log('--- Sezione 2: Filtraggio di Oggetti ---');

const prodotti = [
    { id: 1, nome: 'Laptop Gaming', prezzo: 1299.99, categoria: 'elettronica', disponibile: true, rating: 4.5 },
    { id: 2, nome: 'Mouse Wireless', prezzo: 35.50, categoria: 'elettronica', disponibile: true, rating: 4.2 },
    { id: 3, nome: 'Libro JavaScript', prezzo: 29.99, categoria: 'libri', disponibile: false, rating: 4.8 },
    { id: 4, nome: 'Tastiera Meccanica', prezzo: 129.99, categoria: 'elettronica', disponibile: true, rating: 4.6 },
    { id: 5, nome: 'Monitor 4K', prezzo: 399.99, categoria: 'elettronica', disponibile: false, rating: 4.4 },
    { id: 6, nome: 'Libro Python', prezzo: 34.99, categoria: 'libri', disponibile: true, rating: 4.7 },
    { id: 7, nome: 'Smartphone', prezzo: 699.99, categoria: 'elettronica', disponibile: true, rating: 4.3 },
    { id: 8, nome: 'Cuffie Bluetooth', prezzo: 89.99, categoria: 'elettronica', disponibile: true, rating: 4.1 }
];

/**
 * Esercizio 2.1: Filtri su Proprietà Singole
 */

// TODO: Prodotti disponibili
const prodottiDisponibili = prodotti.filter(p => p.disponibile);
console.log('Prodotti disponibili:', prodottiDisponibili.map(p => p.nome));

// TODO: Prodotti di elettronica
const elettronica = prodotti.filter(p => p.categoria === 'elettronica');
console.log('Elettronica:', elettronica.map(p => p.nome));

// TODO: Prodotti costosi (> 100€)
const prodottiCostosi = prodotti.filter(p => p.prezzo > 100);
console.log('Prodotti costosi:', prodottiCostosi.map(p => `${p.nome}: €${p.prezzo}`));

// TODO: Prodotti con rating alto (>= 4.5)
const prodottiTopRated = prodotti.filter(p => p.rating >= 4.5);
console.log('Prodotti top-rated:', prodottiTopRated.map(p => `${p.nome}: ${p.rating}★`));

/**
 * Esercizio 2.2: Filtri Combinati
 */

// TODO: Elettronica disponibile sotto i 200€
const elettronicaEconomica = prodotti.filter(p => 
    p.categoria === 'elettronica' && 
    p.disponibile && 
    p.prezzo < 200
);
console.log('Elettronica economica disponibile:', 
    elettronicaEconomica.map(p => `${p.nome}: €${p.prezzo}`));

// TODO: Prodotti premium (costosi E con rating alto)
const prodottiPremium = prodotti.filter(p => 
    p.prezzo > 300 && 
    p.rating >= 4.4
);
console.log('Prodotti premium:', 
    prodottiPremium.map(p => `${p.nome}: €${p.prezzo} (${p.rating}★)`));

console.log();

// ============================================================================
// SEZIONE 3: FILTRI AVANZATI E PATTERN COMUNI
// ============================================================================

console.log('--- Sezione 3: Filtri Avanzati ---');

const utenti = [
    { id: 1, nome: 'Mario', cognome: 'Rossi', eta: 30, citta: 'Roma', skills: ['JavaScript', 'React', 'Node.js'], attivo: true, ultimoAccesso: '2024-01-15' },
    { id: 2, nome: 'Luigi', cognome: 'Verdi', eta: 25, citta: 'Milano', skills: ['Python', 'Django', 'PostgreSQL'], attivo: true, ultimoAccesso: '2024-01-20' },
    { id: 3, nome: 'Anna', cognome: 'Bianchi', eta: 35, citta: 'Napoli', skills: ['Java', 'Spring', 'MySQL'], attivo: false, ultimoAccesso: '2023-12-10' },
    { id: 4, nome: 'Marco', cognome: 'Neri', eta: 28, citta: 'Torino', skills: ['JavaScript', 'Vue.js', 'MongoDB'], attivo: true, ultimoAccesso: '2024-01-18' },
    { id: 5, nome: 'Sara', cognome: 'Gialli', eta: 32, citta: 'Roma', skills: ['C#', '.NET', 'SQL Server'], attivo: true, ultimoAccesso: '2024-01-22' },
    { id: 6, nome: 'Luca', cognome: 'Blu', eta: 27, citta: 'Milano', skills: ['JavaScript', 'Angular', 'TypeScript'], attivo: false, ultimoAccesso: '2023-11-30' }
];

/**
 * Esercizio 3.1: Filtri su Array Annidati
 */

// TODO: Utenti che conoscono JavaScript
const utentiJS = utenti.filter(utente => utente.skills.includes('JavaScript'));
console.log('Utenti JavaScript:', utentiJS.map(u => `${u.nome} ${u.cognome}`));

// TODO: Utenti con più di 2 skills
const utentiEsperti = utenti.filter(utente => utente.skills.length > 2);
console.log('Utenti esperti (>2 skills):', 
    utentiEsperti.map(u => `${u.nome}: ${u.skills.length} skills`));

// TODO: Utenti con skills specifiche (JavaScript O Python)
const utentiWebDev = utenti.filter(utente => 
    utente.skills.some(skill => ['JavaScript', 'Python'].includes(skill))
);
console.log('Web developers:', utentiWebDev.map(u => u.nome));

/**
 * Esercizio 3.2: Filtri Basati su Date e Logica Complessa
 */

// TODO: Utenti attivi di Roma
const utentiAttiviRoma = utenti.filter(utente => 
    utente.attivo && utente.citta === 'Roma'
);
console.log('Utenti attivi di Roma:', utentiAttiviRoma.map(u => u.nome));

// TODO: Utenti giovani (< 30) con JavaScript skills
const giovaniJSDev = utenti.filter(utente => 
    utente.eta < 30 && 
    utente.skills.includes('JavaScript')
);
console.log('Giovani JS developers:', giovaniJSDev.map(u => `${u.nome} (${u.eta} anni)`));

// TODO: Filtro per ultimo accesso recente (2024)
const utentiRecenti = utenti.filter(utente => 
    utente.ultimoAccesso.startsWith('2024')
);
console.log('Utenti con accesso recente:', utentiRecenti.map(u => u.nome));

console.log();

// ============================================================================
// SEZIONE 4: FILTRI CON FUNZIONI HELPER
// ============================================================================

console.log('--- Sezione 4: Filtri con Funzioni Helper ---');

/**
 * Funzioni helper per filtri riutilizzabili
 */

// Predicati riutilizzabili
const isEven = n => n % 2 === 0;
const isPositive = n => n > 0;
const isAdult = person => person.eta >= 18;
const isActive = user => user.attivo;
const hasSkill = skill => user => user.skills.includes(skill);
const isFromCity = city => user => user.citta === city;
const priceInRange = (min, max) => product => product.prezzo >= min && product.prezzo <= max;

/**
 * Esercizio 4.1: Uso di Predicati
 */

const numeriTest = [-3, -1, 0, 2, 4, 6, 8, 10];

const numeriPariPositivi = numeriTest.filter(n => isEven(n) && isPositive(n));
console.log('Numeri pari positivi:', numeriPariPositivi);

const utentiRoma = utenti.filter(isFromCity('Roma'));
console.log('Utenti di Roma:', utentiRoma.map(u => u.nome));

const jsExperts = utenti.filter(hasSkill('JavaScript'));
console.log('JavaScript experts:', jsExperts.map(u => u.nome));

/**
 * Esercizio 4.2: Composizione di Filtri
 */

// Funzione per combinare predicati
const and = (...predicates) => item => predicates.every(pred => pred(item));
const or = (...predicates) => item => predicates.some(pred => pred(item));
const not = predicate => item => !predicate(item);

// Esempi di composizione
const utentiAttiviDiRomaOMilano = utenti.filter(
    and(isActive, or(isFromCity('Roma'), isFromCity('Milano')))
);
console.log('Utenti attivi di Roma o Milano:', 
    utentiAttiviDiRomaOMilano.map(u => `${u.nome} (${u.citta})`));

const utentiNonAttivi = utenti.filter(not(isActive));
console.log('Utenti non attivi:', utentiNonAttivi.map(u => u.nome));

console.log();

// ============================================================================
// SEZIONE 5: CASI D'USO PRATICI AVANZATI
// ============================================================================

console.log('--- Sezione 5: Casi d\'uso Pratici ---');

const transazioni = [
    { id: 'TXN001', importo: 150.00, tipo: 'vendita', data: '2024-01-15', cliente: 'Mario Rossi', prodotto: 'Laptop' },
    { id: 'TXN002', importo: -50.00, tipo: 'rimborso', data: '2024-01-16', cliente: 'Luigi Verdi', prodotto: 'Mouse' },
    { id: 'TXN003', importo: 300.00, tipo: 'vendita', data: '2024-01-17', cliente: 'Anna Bianchi', prodotto: 'Monitor' },
    { id: 'TXN004', importo: 75.00, tipo: 'vendita', data: '2024-01-18', cliente: 'Marco Neri', prodotto: 'Tastiera' },
    { id: 'TXN005', importo: -25.00, tipo: 'rimborso', data: '2024-01-19', cliente: 'Sara Gialli', prodotto: 'Cuffie' },
    { id: 'TXN006', importo: 500.00, tipo: 'vendita', data: '2024-01-20', cliente: 'Luca Blu', prodotto: 'Smartphone' }
];

/**
 * Esercizio 5.1: Report di Vendite
 */

// TODO: Solo vendite (non rimborsi)
const vendite = transazioni.filter(t => t.tipo === 'vendita');
console.log('Vendite:', vendite.length);

// TODO: Vendite sopra i 200€
const venditeMajor = transazioni.filter(t => 
    t.tipo === 'vendita' && t.importo > 200
);
console.log('Vendite > 200€:', venditeMajor.length);

// TODO: Transazioni di oggi (simula data corrente)
const oggi = '2024-01-20';
const transazioniOggi = transazioni.filter(t => t.data === oggi);
console.log('Transazioni di oggi:', transazioniOggi.length);

/**
 * Esercizio 5.2: Sistema di Notifiche
 */

const notifiche = [
    { id: 1, tipo: 'email', priorita: 'alta', letta: false, timestamp: Date.now() - 3600000 },
    { id: 2, tipo: 'push', priorita: 'media', letta: true, timestamp: Date.now() - 7200000 },
    { id: 3, tipo: 'sms', priorita: 'alta', letta: false, timestamp: Date.now() - 1800000 },
    { id: 4, tipo: 'email', priorita: 'bassa', letta: false, timestamp: Date.now() - 10800000 },
    { id: 5, tipo: 'push', priorita: 'alta', letta: false, timestamp: Date.now() - 900000 }
];

// TODO: Notifiche non lette ad alta priorità
const notificheUrgenti = notifiche.filter(n => 
    !n.letta && n.priorita === 'alta'
);
console.log('Notifiche urgenti:', notificheUrgenti.length);

// TODO: Notifiche recenti (ultime 2 ore)
const dueOreInMs = 2 * 60 * 60 * 1000;
const notificheRecenti = notifiche.filter(n => 
    Date.now() - n.timestamp < dueOreInMs
);
console.log('Notifiche recenti:', notificheRecenti.length);

console.log();

// ============================================================================
// SFIDE BONUS
// ============================================================================

console.log('--- Sfide Bonus ---');

/**
 * Sfida 1: Filter Personalizzato
 * Implementa la tua versione di filter
 */
function filterPersonalizzato(array, condizione) {
    const risultato = [];
    for (let i = 0; i < array.length; i++) {
        if (condizione(array[i], i, array)) {
            risultato.push(array[i]);
        }
    }
    return risultato;
}

// Test dell'implementazione
const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const risultatoCustom = filterPersonalizzato(testArray, n => n % 2 === 0);
const risultatoNativo = testArray.filter(n => n % 2 === 0);

console.log('Filter personalizzato:', risultatoCustom);
console.log('Filter nativo:', risultatoNativo);
console.log('Sono uguali:', JSON.stringify(risultatoCustom) === JSON.stringify(risultatoNativo));

/**
 * Sfida 2: Multi-Filter con Operatori Logici
 * Sistema per applicare filtri multipli con logica AND/OR
 */
class MultiFilter {
    constructor(array) {
        this.data = array;
        this.filters = [];
    }
    
    addFilter(condition, operator = 'AND') {
        this.filters.push({ condition, operator });
        return this;
    }
    
    execute() {
        return this.data.filter(item => {
            if (this.filters.length === 0) return true;
            
            let result = this.filters[0].condition(item);
            
            for (let i = 1; i < this.filters.length; i++) {
                const { condition, operator } = this.filters[i];
                const conditionResult = condition(item);
                
                if (operator === 'AND') {
                    result = result && conditionResult;
                } else if (operator === 'OR') {
                    result = result || conditionResult;
                }
            }
            
            return result;
        });
    }
    
    reset() {
        this.filters = [];
        return this;
    }
}

// Test del MultiFilter
const multiFilter = new MultiFilter(prodotti);
const risultatoComplesso = multiFilter
    .addFilter(p => p.categoria === 'elettronica', 'AND')
    .addFilter(p => p.prezzo < 500, 'AND')
    .addFilter(p => p.disponibile, 'AND')
    .execute();

console.log('Risultato MultiFilter:', 
    risultatoComplesso.map(p => `${p.nome}: €${p.prezzo}`));

/**
 * Sfida 3: Filter con Debouncing (per ricerche in tempo reale)
 */
function createDebouncedFilter(array, delay = 300) {
    let timeoutId;
    
    return function(condition, callback) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const risultato = array.filter(condition);
            callback(risultato);
        }, delay);
    };
}

// Esempio d'uso del debounced filter
const debouncedFilter = createDebouncedFilter(prodotti);

// Simula ricerca in tempo reale (commentato per non interferire con l'esecuzione)
/*
debouncedFilter(
    p => p.nome.toLowerCase().includes('laptop'),
    risultati => console.log('Risultati ricerca:', risultati.map(p => p.nome))
);
*/

console.log();
console.log('=== FINE ESERCIZIO 2: FILTER ===');
console.log('Prossimo: 03-ReduceExercise.js');
