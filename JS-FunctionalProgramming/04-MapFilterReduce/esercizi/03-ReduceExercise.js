/**
 * MODULO 4: MAP, FILTER E REDUCE
 * Esercizio 3: Aggregazioni con Reduce
 * 
 * Obiettivi:
 * - Padroneggiare l'uso della funzione reduce() per aggregare dati
 * - Comprendere il concetto di accumulatore e valore corrente
 * - Implementare operazioni di somma, conteggio, raggruppamento
 * - Creare strutture dati complesse da array semplici
 */

console.log('=== ESERCIZIO 3: AGGREGAZIONI CON REDUCE ===\n');

// ============================================================================
// SEZIONE 1: REDUCE - CONCETTI FONDAMENTALI
// ============================================================================

console.log('--- Sezione 1: Reduce Base ---');

// Dataset di esempio
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const prezzi = [19.99, 25.50, 15.75, 8.25, 30.00, 12.99];
const parole = ['programmazione', 'funzionale', 'javascript', 'reduce', 'array'];

/**
 * Esercizio 1.1: Operazioni Matematiche Base
 */

// TODO: Somma di tutti i numeri
const somma = numeri.reduce((acc, numero) => acc + numero, 0);
console.log('Somma:', somma);

// TODO: Prodotto di tutti i numeri
const prodotto = numeri.reduce((acc, numero) => acc * numero, 1);
console.log('Prodotto:', prodotto);

// TODO: Trovare il numero più grande
const massimo = numeri.reduce((acc, numero) => numero > acc ? numero : acc, numeri[0]);
console.log('Massimo:', massimo);

// TODO: Trovare il numero più piccolo
const minimo = numeri.reduce((acc, numero) => numero < acc ? numero : acc, numeri[0]);
console.log('Minimo:', minimo);

// TODO: Calcolare la media
const media = numeri.reduce((acc, numero) => acc + numero, 0) / numeri.length;
console.log('Media:', media);

/**
 * Esercizio 1.2: Operazioni su Stringhe
 */

// TODO: Concatenare tutte le parole
const frase = parole.reduce((acc, parola) => acc + ' ' + parola, '').trim();
console.log('Frase:', frase);

// TODO: Trovare la parola più lunga
const parolaLunga = parole.reduce((acc, parola) => 
    parola.length > acc.length ? parola : acc, '');
console.log('Parola più lunga:', parolaLunga);

// TODO: Contare caratteri totali
const caratteriTotali = parole.reduce((acc, parola) => acc + parola.length, 0);
console.log('Caratteri totali:', caratteriTotali);

console.log();

// ============================================================================
// SEZIONE 2: AGGREGAZIONI SU OGGETTI
// ============================================================================

console.log('--- Sezione 2: Aggregazioni su Oggetti ---');

const prodotti = [
    { id: 1, nome: 'Laptop', prezzo: 999.99, categoria: 'elettronica', vendite: 15 },
    { id: 2, nome: 'Mouse', prezzo: 25.50, categoria: 'elettronica', vendite: 45 },
    { id: 3, nome: 'Libro JS', prezzo: 35.00, categoria: 'libri', vendite: 28 },
    { id: 4, nome: 'Tastiera', prezzo: 89.99, categoria: 'elettronica', vendite: 22 },
    { id: 5, nome: 'Monitor', prezzo: 299.99, categoria: 'elettronica', vendite: 18 },
    { id: 6, nome: 'Libro Python', prezzo: 42.00, categoria: 'libri', vendite: 31 }
];

/**
 * Esercizio 2.1: Calcoli su Proprietà
 */

// TODO: Prezzo totale di tutti i prodotti
const prezzoTotale = prodotti.reduce((acc, prodotto) => acc + prodotto.prezzo, 0);
console.log('Prezzo totale:', `€${prezzoTotale.toFixed(2)}`);

// TODO: Vendite totali
const venditeTotali = prodotti.reduce((acc, prodotto) => acc + prodotto.vendite, 0);
console.log('Vendite totali:', venditeTotali);

// TODO: Fatturato totale (prezzo * vendite)
const fatturato = prodotti.reduce((acc, prodotto) => 
    acc + (prodotto.prezzo * prodotto.vendite), 0);
console.log('Fatturato totale:', `€${fatturato.toFixed(2)}`);

// TODO: Prodotto più costoso
const prodottoPiuCostoso = prodotti.reduce((acc, prodotto) =>
    prodotto.prezzo > acc.prezzo ? prodotto : acc);
console.log('Prodotto più costoso:', prodottoPiuCostoso.nome);

/**
 * Esercizio 2.2: Conteggi e Statistiche
 */

// TODO: Contare prodotti per categoria
const prodottiPerCategoria = prodotti.reduce((acc, prodotto) => {
    acc[prodotto.categoria] = (acc[prodotto.categoria] || 0) + 1;
    return acc;
}, {});
console.log('Prodotti per categoria:', prodottiPerCategoria);

// TODO: Fatturato per categoria
const fatturatoPerCategoria = prodotti.reduce((acc, prodotto) => {
    const categoria = prodotto.categoria;
    const fatturatoProdotto = prodotto.prezzo * prodotto.vendite;
    acc[categoria] = (acc[categoria] || 0) + fatturatoProdotto;
    return acc;
}, {});
console.log('Fatturato per categoria:', fatturatoPerCategoria);

// TODO: Statistiche vendite
const statsVendite = prodotti.reduce((acc, prodotto, index, array) => {
    acc.totale += prodotto.vendite;
    acc.min = Math.min(acc.min, prodotto.vendite);
    acc.max = Math.max(acc.max, prodotto.vendite);
    
    // Calcola media all'ultimo elemento
    if (index === array.length - 1) {
        acc.media = acc.totale / array.length;
    }
    
    return acc;
}, { totale: 0, min: Infinity, max: -Infinity, media: 0 });

console.log('Statistiche vendite:', statsVendite);

console.log();

// ============================================================================
// SEZIONE 3: COSTRUZIONE DI STRUTTURE DATI
// ============================================================================

console.log('--- Sezione 3: Costruzione Strutture Dati ---');

const studenti = [
    { id: 1, nome: 'Alice', corso: 'Informatica', voto: 8.5, citta: 'Roma' },
    { id: 2, nome: 'Bob', corso: 'Matematica', voto: 7.2, citta: 'Milano' },
    { id: 3, nome: 'Charlie', corso: 'Informatica', voto: 9.1, citta: 'Roma' },
    { id: 4, nome: 'Diana', corso: 'Fisica', voto: 8.8, citta: 'Napoli' },
    { id: 5, nome: 'Eve', corso: 'Matematica', voto: 7.9, citta: 'Milano' },
    { id: 6, nome: 'Frank', corso: 'Informatica', voto: 6.5, citta: 'Torino' }
];

/**
 * Esercizio 3.1: Raggruppamenti
 */

// TODO: Raggruppa studenti per corso
const studentiPerCorso = studenti.reduce((acc, studente) => {
    if (!acc[studente.corso]) {
        acc[studente.corso] = [];
    }
    acc[studente.corso].push(studente);
    return acc;
}, {});
console.log('Studenti per corso:', studentiPerCorso);

// TODO: Raggruppa per città con statistiche
const studentiPerCitta = studenti.reduce((acc, studente) => {
    const citta = studente.citta;
    if (!acc[citta]) {
        acc[citta] = {
            studenti: [],
            numeroStudenti: 0,
            mediaVoti: 0,
            sommaVoti: 0
        };
    }
    
    acc[citta].studenti.push(studente);
    acc[citta].numeroStudenti++;
    acc[citta].sommaVoti += studente.voto;
    acc[citta].mediaVoti = acc[citta].sommaVoti / acc[citta].numeroStudenti;
    
    return acc;
}, {});

console.log('Studenti per città con statistiche:', studentiPerCitta);

/**
 * Esercizio 3.2: Creazione Indici e Lookup
 */

// TODO: Crea un indice studenti per ID
const indiceStudenti = studenti.reduce((acc, studente) => {
    acc[studente.id] = studente;
    return acc;
}, {});
console.log('Indice studenti:', indiceStudenti);

// TODO: Crea lookup nomi per ricerca veloce
const lookupNomi = studenti.reduce((acc, studente) => {
    const nomeKey = studente.nome.toLowerCase();
    acc[nomeKey] = studente;
    return acc;
}, {});
console.log('Lookup nomi (alice):', lookupNomi.alice);

/**
 * Esercizio 3.3: Trasformazioni Complesse
 */

// TODO: Crea un report completo per corso
const reportPerCorso = studenti.reduce((acc, studente) => {
    const corso = studente.corso;
    
    if (!acc[corso]) {
        acc[corso] = {
            nome: corso,
            studenti: [],
            statistiche: {
                numero: 0,
                votoMin: Infinity,
                votoMax: -Infinity,
                sommaVoti: 0,
                media: 0
            },
            cittaRappresentate: new Set()
        };
    }
    
    const report = acc[corso];
    report.studenti.push(studente.nome);
    report.statistiche.numero++;
    report.statistiche.votoMin = Math.min(report.statistiche.votoMin, studente.voto);
    report.statistiche.votoMax = Math.max(report.statistiche.votoMax, studente.voto);
    report.statistiche.sommaVoti += studente.voto;
    report.statistiche.media = report.statistiche.sommaVoti / report.statistiche.numero;
    report.cittaRappresentate.add(studente.citta);
    
    return acc;
}, {});

// Converte Set in Array per la visualizzazione
Object.values(reportPerCorso).forEach(report => {
    report.cittaRappresentate = Array.from(report.cittaRappresentate);
});

console.log('Report completo per corso:', JSON.stringify(reportPerCorso, null, 2));

console.log();

// ============================================================================
// SEZIONE 4: PATTERN AVANZATI CON REDUCE
// ============================================================================

console.log('--- Sezione 4: Pattern Avanzati ---');

const transazioni = [
    { id: 'T001', data: '2024-01-15', importo: 150.00, tipo: 'entrata', categoria: 'vendite' },
    { id: 'T002', data: '2024-01-15', importo: -30.00, tipo: 'uscita', categoria: 'materiali' },
    { id: 'T003', data: '2024-01-16', importo: 200.00, tipo: 'entrata', categoria: 'vendite' },
    { id: 'T004', data: '2024-01-16', importo: -45.00, tipo: 'uscita', categoria: 'marketing' },
    { id: 'T005', data: '2024-01-17', importo: 300.00, tipo: 'entrata', categoria: 'vendite' },
    { id: 'T006', data: '2024-01-17', importo: -80.00, tipo: 'uscita', categoria: 'materiali' }
];

/**
 * Esercizio 4.1: Analisi Finanziaria
 */

// TODO: Bilancio completo
const bilancio = transazioni.reduce((acc, transazione) => {
    acc.totale += transazione.importo;
    
    if (transazione.tipo === 'entrata') {
        acc.entrate += transazione.importo;
        acc.numeroEntrate++;
    } else {
        acc.uscite += Math.abs(transazione.importo);
        acc.numeroUscite++;
    }
    
    // Traccia per categoria
    const categoria = transazione.categoria;
    if (!acc.perCategoria[categoria]) {
        acc.perCategoria[categoria] = 0;
    }
    acc.perCategoria[categoria] += transazione.importo;
    
    // Traccia per data
    const data = transazione.data;
    if (!acc.perData[data]) {
        acc.perData[data] = 0;
    }
    acc.perData[data] += transazione.importo;
    
    return acc;
}, {
    totale: 0,
    entrate: 0,
    uscite: 0,
    numeroEntrate: 0,
    numeroUscite: 0,
    perCategoria: {},
    perData: {}
});

console.log('Bilancio completo:', bilancio);

/**
 * Esercizio 4.2: Implementazione di flatMap con reduce
 */
const arrayAnnidati = [
    [1, 2, 3],
    [4, 5],
    [6, 7, 8, 9],
    [10]
];

// TODO: Appiattisci l'array usando reduce
const arrayAppiattito = arrayAnnidati.reduce((acc, subArray) => {
    return acc.concat(subArray);
}, []);
console.log('Array appiattito:', arrayAppiattito);

// TODO: flatMap personalizzato
const utentiConSkills = [
    { nome: 'Mario', skills: ['JavaScript', 'React'] },
    { nome: 'Luigi', skills: ['Python', 'Django'] },
    { nome: 'Anna', skills: ['Java', 'Spring', 'MySQL'] }
];

const tutteLeSkills = utentiConSkills.reduce((acc, utente) => {
    return acc.concat(utente.skills);
}, []);
console.log('Tutte le skills:', tutteLeSkills);

/**
 * Esercizio 4.3: Implementazione di unique/distinct
 */

// TODO: Rimuovi duplicati usando reduce
const numeriConDuplicati = [1, 2, 2, 3, 3, 3, 4, 4, 5];
const numeriUnici = numeriConDuplicati.reduce((acc, numero) => {
    if (!acc.includes(numero)) {
        acc.push(numero);
    }
    return acc;
}, []);
console.log('Numeri unici:', numeriUnici);

// TODO: Conta occorrenze
const occorrenze = numeriConDuplicati.reduce((acc, numero) => {
    acc[numero] = (acc[numero] || 0) + 1;
    return acc;
}, {});
console.log('Occorrenze:', occorrenze);

console.log();

// ============================================================================
// SEZIONE 5: CASI D'USO COMPLESSI
// ============================================================================

console.log('--- Sezione 5: Casi d\'uso Complessi ---');

const ordini = [
    {
        id: 'ORD001',
        data: '2024-01-15',
        cliente: 'Mario Rossi',
        articoli: [
            { prodotto: 'Laptop', quantita: 1, prezzo: 999.99 },
            { prodotto: 'Mouse', quantita: 2, prezzo: 25.50 }
        ],
        stato: 'completato'
    },
    {
        id: 'ORD002',
        data: '2024-01-16',
        cliente: 'Luigi Verdi',
        articoli: [
            { prodotto: 'Tastiera', quantita: 1, prezzo: 89.99 },
            { prodotto: 'Monitor', quantita: 1, prezzo: 299.99 }
        ],
        stato: 'in elaborazione'
    },
    {
        id: 'ORD003',
        data: '2024-01-17',
        cliente: 'Mario Rossi',
        articoli: [
            { prodotto: 'Cuffie', quantita: 1, prezzo: 79.99 }
        ],
        stato: 'completato'
    }
];

/**
 * Esercizio 5.1: Analytics E-commerce
 */

// TODO: Report vendite completo
const reportVendite = ordini.reduce((acc, ordine) => {
    // Calcola totale ordine
    const totaleOrdine = ordine.articoli.reduce((sum, articolo) => 
        sum + (articolo.quantita * articolo.prezzo), 0);
    
    // Aggiorna totali generali
    acc.fatturato += totaleOrdine;
    acc.numeroOrdini++;
    
    // Traccia per cliente
    if (!acc.perCliente[ordine.cliente]) {
        acc.perCliente[ordine.cliente] = {
            ordini: 0,
            fatturato: 0,
            articoliAcquistati: 0
        };
    }
    acc.perCliente[ordine.cliente].ordini++;
    acc.perCliente[ordine.cliente].fatturato += totaleOrdine;
    acc.perCliente[ordine.cliente].articoliAcquistati += 
        ordine.articoli.reduce((sum, art) => sum + art.quantita, 0);
    
    // Traccia per prodotto
    ordine.articoli.forEach(articolo => {
        if (!acc.perProdotto[articolo.prodotto]) {
            acc.perProdotto[articolo.prodotto] = {
                vendite: 0,
                fatturato: 0,
                quantitaVenduta: 0
            };
        }
        acc.perProdotto[articolo.prodotto].vendite++;
        acc.perProdotto[articolo.prodotto].fatturato += 
            articolo.quantita * articolo.prezzo;
        acc.perProdotto[articolo.prodotto].quantitaVenduta += articolo.quantita;
    });
    
    // Traccia per stato
    acc.perStato[ordine.stato] = (acc.perStato[ordine.stato] || 0) + 1;
    
    return acc;
}, {
    fatturato: 0,
    numeroOrdini: 0,
    perCliente: {},
    perProdotto: {},
    perStato: {}
});

console.log('Report vendite:', JSON.stringify(reportVendite, null, 2));

/**
 * Esercizio 5.2: Pipeline di Validazione
 */

const datiDaValidare = [
    { nome: 'Mario', email: 'mario@example.com', eta: 30 },
    { nome: '', email: 'luigi@example.com', eta: 25 },
    { nome: 'Anna', email: 'anna-email-non-valida', eta: 35 },
    { nome: 'Marco', email: 'marco@example.com', eta: -5 },
    { nome: 'Sara', email: 'sara@example.com', eta: 28 }
];

// TODO: Sistema di validazione con reduce
const risultatoValidazione = datiDaValidare.reduce((acc, record, index) => {
    const errori = [];
    
    // Validazioni
    if (!record.nome || record.nome.trim() === '') {
        errori.push('Nome mancante');
    }
    
    if (!record.email || !record.email.includes('@')) {
        errori.push('Email non valida');
    }
    
    if (!record.eta || record.eta < 0 || record.eta > 120) {
        errori.push('Età non valida');
    }
    
    // Classifica record
    if (errori.length === 0) {
        acc.validi.push(record);
    } else {
        acc.invalidi.push({ ...record, errori, indice: index });
    }
    
    // Aggiorna statistiche
    acc.totale++;
    acc.erroriTotali += errori.length;
    
    return acc;
}, {
    validi: [],
    invalidi: [],
    totale: 0,
    erroriTotali: 0
});

console.log('Risultato validazione:', risultatoValidazione);

console.log();

// ============================================================================
// SFIDE BONUS
// ============================================================================

console.log('--- Sfide Bonus ---');

/**
 * Sfida 1: Reduce Personalizzato
 * Implementa la tua versione di reduce
 */
function reducePersonalizzato(array, callback, valoreIniziale) {
    let acc = valoreIniziale;
    let startIndex = 0;
    
    // Se non c'è valore iniziale, usa il primo elemento
    if (acc === undefined) {
        acc = array[0];
        startIndex = 1;
    }
    
    for (let i = startIndex; i < array.length; i++) {
        acc = callback(acc, array[i], i, array);
    }
    
    return acc;
}

// Test dell'implementazione
const testArray = [1, 2, 3, 4, 5];
const risultatoCustom = reducePersonalizzato(testArray, (acc, val) => acc + val, 0);
const risultatoNativo = testArray.reduce((acc, val) => acc + val, 0);

console.log('Reduce personalizzato:', risultatoCustom);
console.log('Reduce nativo:', risultatoNativo);
console.log('Sono uguali:', risultatoCustom === risultatoNativo);

/**
 * Sfida 2: Reduce Avanzato per Machine Learning
 * Calcola statistiche avanzate per un dataset
 */
const dataset = [
    { x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 },
    { x: 4, y: 8 }, { x: 5, y: 10 }, { x: 6, y: 12 }
];

const statisticheAvanzate = dataset.reduce((acc, punto, index, array) => {
    // Somme per le medie
    acc.sommaX += punto.x;
    acc.sommaY += punto.y;
    acc.sommaXY += punto.x * punto.y;
    acc.sommaX2 += punto.x * punto.x;
    acc.sommaY2 += punto.y * punto.y;
    
    // Alla fine calcola tutto
    if (index === array.length - 1) {
        const n = array.length;
        acc.mediaX = acc.sommaX / n;
        acc.mediaY = acc.sommaY / n;
        
        // Correlazione di Pearson
        const numeratore = n * acc.sommaXY - acc.sommaX * acc.sommaY;
        const denominatore = Math.sqrt(
            (n * acc.sommaX2 - acc.sommaX * acc.sommaX) *
            (n * acc.sommaY2 - acc.sommaY * acc.sommaY)
        );
        acc.correlazione = numeratore / denominatore;
        
        // Regressione lineare (y = mx + b)
        acc.slope = numeratore / (n * acc.sommaX2 - acc.sommaX * acc.sommaX);
        acc.intercept = acc.mediaY - acc.slope * acc.mediaX;
    }
    
    return acc;
}, {
    sommaX: 0, sommaY: 0, sommaXY: 0,
    sommaX2: 0, sommaY2: 0,
    mediaX: 0, mediaY: 0,
    correlazione: 0, slope: 0, intercept: 0
});

console.log('Statistiche avanzate:', statisticheAvanzate);

/**
 * Sfida 3: Reduce per Parsing e Costruzione AST
 * Esempio semplificato di parser
 */
const tokensMath = ['2', '+', '3', '*', '4', '-', '1'];

const resultParser = tokensMath.reduce((acc, token, index) => {
    if (!isNaN(token)) {
        // È un numero
        acc.numbers.push(parseFloat(token));
    } else {
        // È un operatore
        acc.operators.push(token);
    }
    
    // Costruisci espressione
    if (index === tokensMath.length - 1) {
        // Valuta espressione semplice (solo per demo)
        let result = acc.numbers[0];
        for (let i = 0; i < acc.operators.length; i++) {
            const op = acc.operators[i];
            const nextNum = acc.numbers[i + 1];
            
            switch (op) {
                case '+': result += nextNum; break;
                case '-': result -= nextNum; break;
                case '*': result *= nextNum; break;
                case '/': result /= nextNum; break;
            }
        }
        acc.result = result;
    }
    
    return acc;
}, { numbers: [], operators: [], result: 0 });

console.log('Parser matematico:', resultParser);

console.log();
console.log('=== FINE ESERCIZIO 3: REDUCE ===');
console.log('Prossimo: 04-CombinedExercise.js');
