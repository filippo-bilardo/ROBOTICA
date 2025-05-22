/**
 * Creazione di Pipeline di Dati
 * 
 * Le pipeline di dati consentono di elaborare i dati attraverso una serie di trasformazioni,
 * rendendo il flusso di dati chiaro ed esplicito.
 */

// Utility di base per pipeline
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

// Utility per il currying
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...args2) {
      return curried.apply(this, args.concat(args2));
    };
  };
};

// Utility per debugging
const tap = curry((fn, x) => {
  fn(x);
  return x;
});

const log = label => tap(x => console.log(`${label}:`, x));

// Esempio 1: Pipeline di base per elaborazione dati
console.log('Esempio 1: Pipeline di base per elaborazione dati');

// Dati di esempio
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Funzioni di trasformazione
const filtraPari = numeri => numeri.filter(n => n % 2 === 0);
const moltiplicaPer3 = numeri => numeri.map(n => n * 3);
const somma = numeri => numeri.reduce((acc, n) => acc + n, 0);

// Creazione della pipeline
const elaborazione = pipe(
  filtraPari,
  log('Dopo filtraggio pari'),
  moltiplicaPer3,
  log('Dopo moltiplicazione per 3'),
  somma,
  log('Somma finale')
);

console.log('Numeri originali:', numeri);
const risultato = elaborazione(numeri);
console.log('Risultato finale:', risultato);

// Esempio 2: Pipeline per elaborazione di oggetti
console.log('\nEsempio 2: Pipeline per elaborazione di oggetti');

// Dati di esempio
const utenti = [
  { id: 1, nome: 'Alice', età: 30, ruolo: 'admin', attivo: true },
  { id: 2, nome: 'Bob', età: 25, ruolo: 'utente', attivo: false },
  { id: 3, nome: 'Carol', età: 35, ruolo: 'utente', attivo: true },
  { id: 4, nome: 'Dave', età: 40, ruolo: 'admin', attivo: true }
];

// Funzioni di trasformazione
const soloAttivi = utenti => utenti.filter(u => u.attivo);
const soloAdmin = utenti => utenti.filter(u => u.ruolo === 'admin');
const formattaNomi = utenti => utenti.map(u => ({
  ...u,
  nomeMostrato: `${u.nome} (${u.ruolo})`
}));
const ordinaPerEtà = utenti => [...utenti].sort((a, b) => a.età - b.età);

// Pipeline per elaborare utenti
const elaboraUtenti = pipe(
  soloAttivi,
  log('Utenti attivi'),
  soloAdmin,
  log('Admin attivi'),
  formattaNomi,
  log('Nomi formattati'),
  ordinaPerEtà,
  log('Ordinati per età')
);

const utentiElaborati = elaboraUtenti(utenti);
console.log('Risultato finale elaborazione utenti:', utentiElaborati);

// Esempio 3: Pipeline con contesto/stato
console.log('\nEsempio 3: Pipeline con contesto/stato');

// Funzioni che operano su un oggetto contesto
const inizializzaContesto = datiIniziali => ({
  dati: datiIniziali,
  metadati: {
    timestamp: Date.now(),
    conteggio: datiIniziali.length
  }
});

const filtraConContesto = ctx => ({
  ...ctx,
  dati: ctx.dati.filter(n => n % 2 === 0),
  metadati: {
    ...ctx.metadati,
    conteggioFiltrati: ctx.dati.filter(n => n % 2 === 0).length
  }
});

const trasformaConContesto = ctx => ({
  ...ctx,
  dati: ctx.dati.map(n => n * 3),
  metadati: {
    ...ctx.metadati,
    operazione: 'moltiplicazione',
    fattore: 3
  }
});

const calcolaTotaleConContesto = ctx => ({
  ...ctx,
  risultato: ctx.dati.reduce((acc, n) => acc + n, 0),
  metadati: {
    ...ctx.metadati,
    operazioneFinale: 'somma'
  }
});

// Pipeline con contesto
const pipelineConContesto = pipe(
  inizializzaContesto,
  log('Contesto inizializzato'),
  filtraConContesto,
  log('Dopo filtraggio con contesto'),
  trasformaConContesto,
  log('Dopo trasformazione con contesto'),
  calcolaTotaleConContesto,
  log('Risultato finale con contesto')
);

const risultatoConContesto = pipelineConContesto(numeri);
console.log('Riepilogo finale:', risultatoConContesto);

// Esempio 4: Pipeline con gestione errori
console.log('\nEsempio 4: Pipeline con gestione errori');

// Semplice implementazione di Either
const Either = {
  Right: value => ({
    map: fn => Either.Right(fn(value)),
    chain: fn => fn(value),
    fold: (_, fnR) => fnR(value),
    toString: () => `Right(${value})`
  }),
  Left: error => ({
    map: _ => Either.Left(error),
    chain: _ => Either.Left(error),
    fold: (fnL, _) => fnL(error),
    toString: () => `Left(${error})`
  }),
  fromNullable: (value, errorMsg = 'Value is null or undefined') =>
    value != null ? Either.Right(value) : Either.Left(errorMsg),
  tryCatch: (fn, errorHandler = e => e.message) => {
    try {
      return Either.Right(fn());
    } catch (e) {
      return Either.Left(errorHandler(e));
    }
  }
};

// Funzioni che possono fallire
const dividiPerDue = n =>
  n % 2 === 0
    ? Either.Right(n / 2)
    : Either.Left(`Impossibile dividere ${n} per 2`);

const radiceQuadrata = n =>
  n >= 0
    ? Either.Right(Math.sqrt(n))
    : Either.Left(`Impossibile calcolare la radice quadrata di ${n}`);

// Pipeline con gestione errori
const elaborazioneConErrori = n =>
  Either.Right(n)
    .chain(dividiPerDue)
    .map(log('Dopo divisione per 2'))
    .chain(radiceQuadrata)
    .map(log('Dopo radice quadrata'))
    .fold(
      err => `Errore: ${err}`,
      val => `Successo: ${val}`
    );

console.log('Elaborazione con errori (8):', elaborazioneConErrori(8));
console.log('Elaborazione con errori (7):', elaborazioneConErrori(7));

// Esempio 5: Pipeline asincrona
console.log('\nEsempio 5: Pipeline asincrona');

// Funzione pipe per Promise
const pipeAsync = (...fns) => x =>
  fns.reduce((promise, fn) => promise.then(fn), Promise.resolve(x));

// Funzioni asincrone di esempio
const fetchUtente = async id => {
  console.log(`Fetching utente con id ${id}...`);
  // Simuliamo una chiamata API
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (id <= 0) throw new Error('ID non valido');
  
  return {
    id,
    nome: `Utente ${id}`,
    email: `utente${id}@example.com`
  };
};

const fetchOrdini = async utente => {
  console.log(`Fetching ordini per ${utente.nome}...`);
  // Simuliamo una chiamata API
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    ...utente,
    ordini: [
      { id: 101, prodotto: 'Laptop', prezzo: 1200 },
      { id: 102, prodotto: 'Smartphone', prezzo: 800 }
    ]
  };
};

const calcolaTotaleOrdini = async utente => {
  console.log(`Calcolando totale ordini per ${utente.nome}...`);
  // Simuliamo un'elaborazione
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const totale = utente.ordini.reduce((acc, o) => acc + o.prezzo, 0);
  
  return {
    ...utente,
    totaleOrdini: totale
  };
};

// Creazione della pipeline asincrona
const elaboraUtente = pipeAsync(
  fetchUtente,
  fetchOrdini,
  calcolaTotaleOrdini
);

// Esecuzione (solo per esempio, non eseguiamo davvero per non aspettare)
console.log('Pipeline asincrona creata. Esempio di utilizzo:');
console.log('elaboraUtente(1).then(result => console.log("Risultato:", result));');

// Se vuoi vedere il risultato reale, decommentare:
/*
elaboraUtente(1)
  .then(result => console.log('Risultato pipeline asincrona:', result))
  .catch(err => console.error('Errore pipeline asincrona:', err));
*/

// Esempio 6: Pipeline con ramificazione (fork/join)
console.log('\nEsempio 6: Pipeline con ramificazione (fork/join)');

// Funzione per fork/join
const fork = (joinFn, ...fns) => x => joinFn(...fns.map(fn => fn(x)));

// Funzioni per diversi percorsi della pipeline
const calcolaSommaPari = numeri => 
  numeri.filter(n => n % 2 === 0).reduce((acc, n) => acc + n, 0);

const calcolaSommaDispari = numeri => 
  numeri.filter(n => n % 2 !== 0).reduce((acc, n) => acc + n, 0);

const calcolaDifferenza = (sommaPari, sommaDispari) => 
  Math.abs(sommaPari - sommaDispari);

// Pipeline con ramificazione
const calcolaDifferenzaPariDispari = fork(
  calcolaDifferenza,
  calcolaSommaPari,
  calcolaSommaDispari
);

console.log('Numeri originali:', numeri);
console.log('Somma dei pari:', calcolaSommaPari(numeri));
console.log('Somma dei dispari:', calcolaSommaDispari(numeri));
console.log('Differenza tra somma pari e dispari:', calcolaDifferenzaPariDispari(numeri));

// Esempio 7: Pipeline con condizioni
console.log('\nEsempio 7: Pipeline con condizioni');

// Funzione per pipeline condizionale
const ifElse = curry((predicate, fnTrue, fnFalse) => x =>
  predicate(x) ? fnTrue(x) : fnFalse(x));

// Predicati e funzioni per la pipeline
const sonoTuttiPari = arr => arr.every(n => n % 2 === 0);
const raddoppia = arr => arr.map(n => n * 2);
const incrementa = arr => arr.map(n => n + 1);

// Pipeline condizionale
const elaborazioneCondizionale = pipe(
  ifElse(
    sonoTuttiPari,
    pipe(
      raddoppia,
      log('Dopo raddoppio (tutti pari)')
    ),
    pipe(
      incrementa,
      log('Dopo incremento (almeno un dispari)')
    )
  ),
  somma,
  log('Somma finale')
);

const numeriPari = [2, 4, 6, 8, 10];
const numeriMisti = [1, 2, 3, 4, 5];

console.log('Numeri pari:', numeriPari);
console.log('Elaborazione condizionale (pari):', elaborazioneCondizionale(numeriPari));

console.log('Numeri misti:', numeriMisti);
console.log('Elaborazione condizionale (misti):', elaborazioneCondizionale(numeriMisti));

// Esempio 8: Pipeline di trasformazione di dati complessi
console.log('\nEsempio 8: Pipeline di trasformazione di dati complessi');

// Dati di esempio
const datiProdotti = [
  { id: 1, nome: 'Laptop', prezzo: 1200, categoria: 'Elettronica', disponibile: true },
  { id: 2, nome: 'Smartphone', prezzo: 800, categoria: 'Elettronica', disponibile: false },
  { id: 3, nome: 'Tastiera', prezzo: 100, categoria: 'Accessori', disponibile: true },
  { id: 4, nome: 'Mouse', prezzo: 50, categoria: 'Accessori', disponibile: true },
  { id: 5, nome: 'Monitor', prezzo: 300, categoria: 'Elettronica', disponibile: true }
];

// Funzioni di trasformazione
const aggiungiIVA = prodotti =>
  prodotti.map(p => ({
    ...p,
    prezzoConIVA: Math.round(p.prezzo * 1.22 * 100) / 100
  }));

const soloDisponibili = prodotti =>
  prodotti.filter(p => p.disponibile);

const raggruppaPerCategoria = prodotti =>
  prodotti.reduce((acc, p) => {
    if (!acc[p.categoria]) {
      acc[p.categoria] = [];
    }
    acc[p.categoria].push(p);
    return acc;
  }, {});

const calcolaTotaliPerCategoria = categorizzati =>
  Object.entries(categorizzati).reduce((acc, [categoria, prodotti]) => {
    acc[categoria] = {
      totale: prodotti.reduce((sum, p) => sum + p.prezzo, 0),
      totaleIVA: prodotti.reduce((sum, p) => sum + p.prezzoConIVA, 0),
      conteggio: prodotti.length
    };
    return acc;
  }, {});

// Pipeline complessa
const analisiProdotti = pipe(
  soloDisponibili,
  log('Prodotti disponibili'),
  aggiungiIVA,
  log('Prodotti con IVA'),
  raggruppaPerCategoria,
  log('Prodotti per categoria'),
  calcolaTotaliPerCategoria,
  log('Totali per categoria')
);

const risultatoAnalisi = analisiProdotti(datiProdotti);
console.log('Risultato finale analisi prodotti:', risultatoAnalisi);

// Esempio 9: Pipeline per elaborazione di testo
console.log('\nEsempio 9: Pipeline per elaborazione di testo');

// Testo di esempio
const testo = `
La programmazione funzionale è un paradigma di programmazione che tratta il calcolo come 
la valutazione di funzioni matematiche ed evita il cambiamento di stato e i dati mutabili. 
È un paradigma di programmazione dichiarativo, il che significa che la programmazione è fatta 
con espressioni o dichiarazioni invece che con istruzioni. In linguaggi funzionali, l'output 
di una funzione dipende solo dagli argomenti che vengono passati alla funzione.
`;

// Funzioni di elaborazione testo
const pulisciTesto = testo => 
  testo.trim().replace(/\s+/g, ' ');

const dividiInParole = testo => 
  testo.split(/\s+/);

const rimuoviPunteggiatura = parole => 
  parole.map(p => p.replace(/[.,;:!?()]/g, ''));

const trasformaInMinuscolo = parole => 
  parole.map(p => p.toLowerCase());

const contaOccorrenze = parole => 
  parole.reduce((acc, p) => {
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

const ordinaPerFrequenza = conteggio => 
  Object.entries(conteggio)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [parola, conteggio]) => {
      acc[parola] = conteggio;
      return acc;
    }, {});

// Pipeline per analisi del testo
const analisiTesto = pipe(
  pulisciTesto,
  log('Testo pulito'),
  dividiInParole,
  log('Diviso in parole'),
  rimuoviPunteggiatura,
  log('Punteggiatura rimossa'),
  trasformaInMinuscolo,
  log('Trasformato in minuscolo'),
  contaOccorrenze,
  log('Occorrenze contate'),
  ordinaPerFrequenza,
  log('Ordinato per frequenza')
);

const statisticheTesto = analisiTesto(testo);
console.log('Statistiche finali testo:', statisticheTesto);

// Esempio 10: Pipeline con memoization
console.log('\nEsempio 10: Pipeline con memoization');

// Utility per memoizzazione
const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log(`Usando risultato in cache per ${key}`);
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Funzione costosa da calcolare
const calcolaFattoriale = n => {
  console.log(`Calcolando fattoriale di ${n}...`);
  if (n <= 1) return 1;
  let risultato = 1;
  for (let i = 2; i <= n; i++) {
    risultato *= i;
  }
  return risultato;
};

// Versione memoizzata
const fattorialeMemo = memoize(calcolaFattoriale);

// Funzione che utilizza fattoriale più volte
const calcolaCombinatoria = (n, k) => {
  console.log(`Calcolando combinatoria C(${n},${k})...`);
  return fattorialeMemo(n) / (fattorialeMemo(k) * fattorialeMemo(n - k));
};

console.log('Fattoriale di 5:', fattorialeMemo(5));
console.log('Fattoriale di 5 (seconda chiamata):', fattorialeMemo(5)); // Usa la cache
console.log('Combinatoria C(10,3):', calcolaCombinatoria(10, 3));
console.log('Combinatoria C(10,7):', calcolaCombinatoria(10, 7)); // Riutilizza alcuni calcoli
