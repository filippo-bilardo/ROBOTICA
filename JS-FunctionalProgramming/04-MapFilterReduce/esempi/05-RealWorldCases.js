/**
 * Casi d'Uso Reali per Map, Filter e Reduce
 * 
 * Questo file contiene esempi di applicazioni reali dei metodi map, filter e reduce
 * in scenari comuni di sviluppo.
 */

// Caso d'uso 1: Elaborazione di dati API
console.log('CASO D\'USO 1: ELABORAZIONE DATI API');

// Simulazione di una risposta API
const rispostaAPI = {
  status: 'success',
  data: [
    { id: 1, nome: 'Prodotto A', prezzo: 19.99, disponibile: true, categorie: ['elettronica', 'gadget'] },
    { id: 2, nome: 'Prodotto B', prezzo: 29.99, disponibile: false, categorie: ['elettronica', 'casa'] },
    { id: 3, nome: 'Prodotto C', prezzo: 9.99, disponibile: true, categorie: ['abbigliamento'] },
    { id: 4, nome: 'Prodotto D', prezzo: 49.99, disponibile: true, categorie: ['elettronica', 'informatica'] },
    { id: 5, nome: 'Prodotto E', prezzo: 15.99, disponibile: true, categorie: ['casa', 'giardino'] }
  ]
};

// Trasformazione dei dati per l'interfaccia utente
const prodottiPerUI = rispostaAPI.data
  .filter(prodotto => prodotto.disponibile)  // Solo prodotti disponibili
  .map(prodotto => ({
    id: prodotto.id,
    titolo: prodotto.nome,
    prezzo: `€${prodotto.prezzo.toFixed(2)}`,
    categorie: prodotto.categorie.join(', ')
  }));

console.log('Prodotti trasformati per UI:', prodottiPerUI);

// Estrazione di statistiche
const statisticheProdotti = {
  totale: rispostaAPI.data.length,
  disponibili: rispostaAPI.data.filter(p => p.disponibile).length,
  prezzoMedio: rispostaAPI.data.reduce((acc, p) => acc + p.prezzo, 0) / rispostaAPI.data.length,
  categorieUniche: Array.from(
    new Set(
      rispostaAPI.data.flatMap(p => p.categorie)
    )
  )
};

console.log('Statistiche prodotti:', statisticheProdotti);

// Caso d'uso 2: Gestione di un carrello e-commerce
console.log('\nCASO D\'USO 2: CARRELLO E-COMMERCE');

const carrello = [
  { prodottoId: 1, nome: 'Prodotto A', prezzo: 19.99, quantità: 2 },
  { prodottoId: 4, nome: 'Prodotto D', prezzo: 49.99, quantità: 1 },
  { prodottoId: 5, nome: 'Prodotto E', prezzo: 15.99, quantità: 3 }
];

// Calcolo del totale del carrello
const totaleProdotti = carrello.reduce((acc, item) => acc + (item.prezzo * item.quantità), 0);
console.log('Totale carrello:', totaleProdotti.toFixed(2));

// Applicazione di uno sconto
const percentualeSconto = 10;
const totaleConSconto = carrello
  .map(item => ({
    ...item,
    subtotale: item.prezzo * item.quantità,
    sconto: (item.prezzo * item.quantità * percentualeSconto / 100)
  }))
  .reduce((acc, item) => ({
    subtotale: acc.subtotale + item.subtotale,
    sconto: acc.sconto + item.sconto,
    totale: acc.totale + (item.subtotale - item.sconto)
  }), { subtotale: 0, sconto: 0, totale: 0 });

console.log('Riepilogo con sconto:', totaleConSconto);

// Caso d'uso 3: Analisi di log
console.log('\nCASO D\'USO 3: ANALISI DI LOG');

const logEntries = [
  { timestamp: '2023-01-15T10:32:00', livello: 'info', messaggio: 'Utente loggato', utente: 'user123' },
  { timestamp: '2023-01-15T10:33:15', livello: 'error', messaggio: 'Errore database', utente: 'admin' },
  { timestamp: '2023-01-15T10:35:22', livello: 'info', messaggio: 'Ricerca completata', utente: 'user123' },
  { timestamp: '2023-01-15T10:36:00', livello: 'warning', messaggio: 'Risorsa non trovata', utente: 'user456' },
  { timestamp: '2023-01-15T10:38:10', livello: 'error', messaggio: 'Errore autenticazione', utente: 'user789' },
  { timestamp: '2023-01-15T10:40:00', livello: 'info', messaggio: 'Logout utente', utente: 'user123' }
];

// Raggruppamento log per livello
const logPerLivello = logEntries.reduce((acc, entry) => {
  const livello = entry.livello;
  if (!acc[livello]) {
    acc[livello] = [];
  }
  acc[livello].push(entry);
  return acc;
}, {});

console.log('Log raggruppati per livello:', Object.keys(logPerLivello).map(key => 
  `${key}: ${logPerLivello[key].length} entries`
));

// Filtraggio di log critici
const errori = logEntries
  .filter(entry => entry.livello === 'error')
  .map(entry => ({
    orario: new Date(entry.timestamp).toLocaleTimeString(),
    messaggio: entry.messaggio,
    utente: entry.utente
  }));

console.log('Log di errore:', errori);

// Statistiche attività per utente
const attivitàPerUtente = logEntries.reduce((acc, entry) => {
  const { utente } = entry;
  if (!acc[utente]) {
    acc[utente] = { conteggio: 0, azioni: [] };
  }
  acc[utente].conteggio++;
  acc[utente].azioni.push({
    orario: new Date(entry.timestamp).toLocaleTimeString(),
    azione: entry.messaggio
  });
  return acc;
}, {});

console.log('Attività per utente:', attivitàPerUtente);

// Caso d'uso 4: Trasformazione di dati per grafici
console.log('\nCASO D\'USO 4: DATI PER GRAFICI');

const datiVendite = [
  { data: '2023-01-01', prodotto: 'A', quantità: 10, ricavo: 199.9 },
  { data: '2023-01-02', prodotto: 'B', quantità: 5, ricavo: 149.95 },
  { data: '2023-01-02', prodotto: 'A', quantità: 8, ricavo: 159.92 },
  { data: '2023-01-03', prodotto: 'C', quantità: 12, ricavo: 119.88 },
  { data: '2023-01-03', prodotto: 'B', quantità: 3, ricavo: 89.97 },
  { data: '2023-01-04', prodotto: 'A', quantità: 15, ricavo: 299.85 },
  { data: '2023-01-04', prodotto: 'C', quantità: 7, ricavo: 69.93 }
];

// Trasformazione per grafico vendite per giorno
const venditePer
Giorno = datiVendite.reduce((acc, item) => {
  const { data } = item;
  if (!acc[data]) {
    acc[data] = 0;
  }
  acc[data] += item.ricavo;
  return acc;
}, {});

// Converte in formato per grafico a linee
const datiGraficoLinee = Object.entries(venditePerGiorno).map(([data, ricavo]) => ({
  x: data,
  y: ricavo
}));

console.log('Dati per grafico a linee:', datiGraficoLinee);

// Trasformazione per grafico a torta delle vendite per prodotto
const venditePerProdotto = datiVendite.reduce((acc, item) => {
  const { prodotto } = item;
  if (!acc[prodotto]) {
    acc[prodotto] = 0;
  }
  acc[prodotto] += item.ricavo;
  return acc;
}, {});

// Converte in formato per grafico a torta
const datiGraficoTorta = Object.entries(venditePerProdotto).map(([label, value]) => ({
  label,
  value
}));

console.log('Dati per grafico a torta:', datiGraficoTorta);

// Caso d'uso 5: Filtraggio e trasformazione per ricerca full-text
console.log('\nCASO D\'USO 5: RICERCA FULL-TEXT');

const articoli = [
  { id: 1, titolo: 'Introduzione a JavaScript', contenuto: 'JavaScript è un linguaggio di programmazione versatile e potente.', tags: ['javascript', 'programmazione', 'web'] },
  { id: 2, titolo: 'Programmazione Funzionale', contenuto: 'La programmazione funzionale è un paradigma che tratta il calcolo come valutazione di funzioni matematiche.', tags: ['programmazione', 'funzionale', 'javascript'] },
  { id: 3, titolo: 'React vs Angular', contenuto: 'Confronto tra i due popolari framework per lo sviluppo web: React e Angular.', tags: ['react', 'angular', 'web', 'javascript'] },
  { id: 4, titolo: 'CSS Grid Layout', contenuto: 'CSS Grid offre un sistema di layout bidimensionale per il web.', tags: ['css', 'web', 'design'] },
  { id: 5, titolo: 'TypeScript e tipi statici', contenuto: 'TypeScript aggiunge tipizzazione statica opzionale a JavaScript.', tags: ['typescript', 'javascript', 'programmazione'] }
];

function ricercaFullText(query) {
  const termini = query.toLowerCase().split(' ');
  
  return articoli
    .filter(articolo => {
      const testoCompleto = `${articolo.titolo} ${articolo.contenuto} ${articolo.tags.join(' ')}`.toLowerCase();
      // Un articolo corrisponde se contiene TUTTI i termini di ricerca
      return termini.every(termine => testoCompleto.includes(termine));
    })
    .map(articolo => ({
      id: articolo.id,
      titolo: articolo.titolo,
      snippet: articolo.contenuto.substring(0, 100) + '...',
      relevance: termini.reduce((score, termine) => {
        // Punteggio basato sulla frequenza del termine e posizione
        const titoloBasso = articolo.titolo.toLowerCase();
        const contenutoBasso = articolo.contenuto.toLowerCase();
        
        let punti = 0;
        if (titoloBasso.includes(termine)) punti += 3;  // Più rilevante nel titolo
        if (contenutoBasso.includes(termine)) punti += 1;
        if (articolo.tags.some(tag => tag.includes(termine))) punti += 2;
        
        return score + punti;
      }, 0)
    }))
    .sort((a, b) => b.relevance - a.relevance);  // Ordina per rilevanza
}

console.log('Risultati ricerca "javascript programmazione":', ricercaFullText('javascript programmazione'));
console.log('Risultati ricerca "web design":', ricercaFullText('web design'));

// Caso d'uso 6: Importazione ed esportazione dati
console.log('\nCASO D\'USO 6: CONVERSIONE DATI');

// Simulazione di dati CSV importati
const csvData = [
  'Nome,Email,Età,Città',
  'Marco Rossi,marco@example.com,34,Roma',
  'Laura Bianchi,laura@example.com,28,Milano',
  'Giovanni Verdi,giovanni@example.com,45,Napoli',
  'Anna Neri,anna@example.com,31,Torino'
];

// Conversione da CSV a oggetti JavaScript
const intestazioni = csvData[0].split(',');
const datiOggetti = csvData
  .slice(1)  // Salta la riga di intestazione
  .map(riga => {
    const valori = riga.split(',');
    return intestazioni.reduce((obj, intestazione, i) => {
      obj[intestazione] = valori[i];
      return obj;
    }, {});
  });

console.log('Dati convertiti da CSV:', datiOggetti);

// Conversione di dati per esportazione in formato diverso (JSON)
const datiJSON = JSON.stringify(datiOggetti, null, 2);
console.log('Dati JSON:');
console.log(datiJSON);

// Conversione in XML (simulata)
const datiXML = datiOggetti.map(obj => {
  const campi = Object.entries(obj)
    .map(([key, value]) => `  <${key}>${value}</${key}>`)
    .join('\n');
  return `<persona>\n${campi}\n</persona>`;
}).join('\n');

console.log('Dati XML:');
console.log(`<persone>\n${datiXML}\n</persone>`);
