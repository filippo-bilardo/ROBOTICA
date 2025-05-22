/**
 * Combinare Map, Filter e Reduce
 * 
 * Questo esempio mostra come le funzioni map, filter e reduce possono essere
 * combinate insieme per creare pipeline di trasformazione dei dati potenti ed espressive.
 */

// Dati di esempio: un elenco di transazioni
const transazioni = [
  { id: 1, tipo: 'acquisto', importo: 50, categoria: 'Cibo', data: '2023-01-15' },
  { id: 2, tipo: 'stipendio', importo: 2000, categoria: 'Lavoro', data: '2023-01-20' },
  { id: 3, tipo: 'acquisto', importo: 120, categoria: 'Abbigliamento', data: '2023-01-23' },
  { id: 4, tipo: 'vendita', importo: 500, categoria: 'Elettronica', data: '2023-01-25' },
  { id: 5, tipo: 'acquisto', importo: 35, categoria: 'Cibo', data: '2023-02-05' },
  { id: 6, tipo: 'acquisto', importo: 80, categoria: 'Intrattenimento', data: '2023-02-10' },
  { id: 7, tipo: 'stipendio', importo: 2000, categoria: 'Lavoro', data: '2023-02-20' },
  { id: 8, tipo: 'acquisto', importo: 200, categoria: 'Elettronica', data: '2023-02-28' }
];

console.log('Dati originali:', transazioni);

// Esempio 1: Totale degli acquisti
const totaleAcquisti = transazioni
  .filter(t => t.tipo === 'acquisto')  // Filtra solo gli acquisti
  .map(t => t.importo)                // Estrai l'importo
  .reduce((acc, importo) => acc + importo, 0); // Somma tutti gli importi

console.log('Totale degli acquisti:', totaleAcquisti);

// Esempio 2: Spese per categoria
const spesePerCategoria = transazioni
  .filter(t => t.tipo === 'acquisto')  // Filtra solo gli acquisti
  .reduce((acc, t) => {
    // Raggruppa per categoria
    acc[t.categoria] = (acc[t.categoria] || 0) + t.importo;
    return acc;
  }, {});

console.log('Spese per categoria:', spesePerCategoria);

// Esempio 3: Calcolo del reddito netto (stipendi - acquisti)
const redditoNetto = transazioni.reduce((acc, t) => {
  if (t.tipo === 'stipendio') {
    return acc + t.importo;
  } else if (t.tipo === 'acquisto') {
    return acc - t.importo;
  }
  return acc;
}, 0);

console.log('Reddito netto:', redditoNetto);

// Esempio 4: Formattazione delle transazioni per visualizzazione
const transazioniFormattate = transazioni
  .filter(t => t.importo > 100)  // Solo transazioni significative
  .map(t => {
    const segno = t.tipo === 'acquisto' ? '-' : '+';
    return {
      descrizione: `${t.categoria} (${t.data})`,
      valore: `${segno}€${t.importo.toFixed(2)}`,
      tipo: t.tipo
    };
  })
  .sort((a, b) => a.descrizione.localeCompare(b.descrizione)); // Ordina per descrizione

console.log('Transazioni formattate:', transazioniFormattate);

// Esempio 5: Statistiche mensili
const statisticheMensili = transazioni.reduce((acc, t) => {
  // Estrai il mese dalla data
  const mese = t.data.substring(0, 7); // formato: "YYYY-MM"
  
  // Inizializza l'oggetto per il mese se non esiste
  if (!acc[mese]) {
    acc[mese] = {
      totaleAcquisti: 0,
      totaleEntrate: 0,
      transazioni: []
    };
  }
  
  // Aggiorna le statistiche in base al tipo di transazione
  if (t.tipo === 'acquisto') {
    acc[mese].totaleAcquisti += t.importo;
  } else if (t.tipo === 'stipendio' || t.tipo === 'vendita') {
    acc[mese].totaleEntrate += t.importo;
  }
  
  // Aggiungi la transazione all'elenco del mese
  acc[mese].transazioni.push(t);
  
  return acc;
}, {});

// Calcola il saldo per ogni mese
const statisticheFinali = Object.keys(statisticheMensili).map(mese => {
  const stats = statisticheMensili[mese];
  return {
    mese,
    totaleAcquisti: stats.totaleAcquisti,
    totaleEntrate: stats.totaleEntrate,
    saldo: stats.totaleEntrate - stats.totaleAcquisti,
    numeroTransazioni: stats.transazioni.length
  };
});

console.log('Statistiche mensili:', statisticheFinali);

// Esempio 6: Transazioni sopra la media
// Prima calcola l'importo medio delle transazioni
const importoMedio = transazioni
  .map(t => t.importo)
  .reduce((acc, importo, _, array) => acc + importo / array.length, 0);

// Poi filtra le transazioni sopra la media
const transazioniSopraMedia = transazioni
  .filter(t => t.importo > importoMedio)
  .map(t => ({
    id: t.id,
    categoria: t.categoria,
    importo: t.importo,
    differenzaDallaMedia: (t.importo - importoMedio).toFixed(2)
  }));

console.log('Importo medio delle transazioni:', importoMedio.toFixed(2));
console.log('Transazioni sopra la media:', transazioniSopraMedia);

// Esempio 7: Categorie ordinate per spesa totale
const categoriePerSpesa = Object.entries(
  transazioni
    .filter(t => t.tipo === 'acquisto')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.importo;
      return acc;
    }, {})
)
  .map(([categoria, totale]) => ({ categoria, totale }))
  .sort((a, b) => b.totale - a.totale);

console.log('Categorie ordinate per spesa:', categoriePerSpesa);

// Esempio 8: Creazione di una struttura dati complessa
// Obiettivo: creare un report che include statistiche globali e per categoria
const report = transazioni.reduce((acc, t) => {
  // Aggiorna le statistiche globali
  acc.totale += t.importo;
  acc.conteggio++;
  
  // Traccia il valore massimo
  if (t.importo > acc.massimo.importo) {
    acc.massimo = { ...t };
  }
  
  // Traccia il valore minimo (solo per transazioni non-zero)
  if (t.importo > 0 && (acc.minimo.importo === 0 || t.importo < acc.minimo.importo)) {
    acc.minimo = { ...t };
  }
  
  // Aggiorna le statistiche per categoria
  if (!acc.perCategoria[t.categoria]) {
    acc.perCategoria[t.categoria] = {
      totale: 0,
      conteggio: 0,
      transazioni: []
    };
  }
  
  acc.perCategoria[t.categoria].totale += t.importo;
  acc.perCategoria[t.categoria].conteggio++;
  acc.perCategoria[t.categoria].transazioni.push(t.id);
  
  return acc;
}, {
  totale: 0,
  conteggio: 0,
  massimo: { importo: 0 },
  minimo: { importo: 0 },
  perCategoria: {}
});

// Calcolo delle medie
report.media = report.totale / report.conteggio;

// Trasforma il report.perCategoria da oggetto ad array per un più facile utilizzo
report.categorie = Object.keys(report.perCategoria).map(categoria => ({
  nome: categoria,
  ...report.perCategoria[categoria],
  media: report.perCategoria[categoria].totale / report.perCategoria[categoria].conteggio
}));

// Ordina le categorie per importo totale
report.categorie.sort((a, b) => b.totale - a.totale);

// Rimuovi la versione oggetto delle categorie (non più necessaria)
delete report.perCategoria;

console.log('Report completo:', report);
