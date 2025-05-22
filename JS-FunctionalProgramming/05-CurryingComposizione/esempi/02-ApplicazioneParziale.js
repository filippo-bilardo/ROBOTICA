/**
 * Applicazione Parziale in Scenari Reali
 * 
 * L'applicazione parziale consiste nel fissare alcuni degli argomenti di una funzione,
 * producendo una nuova funzione con un numero ridotto di parametri.
 */

// Utility per l'applicazione parziale
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

// Esempio 1: Logger Configurabile
console.log('Esempio 1: Logger Configurabile');

function log(livello, timestamp, messaggio) {
  const formatoTimestamp = timestamp ? `[${new Date(timestamp).toISOString()}]` : '';
  console.log(`${livello.toUpperCase()} ${formatoTimestamp} ${messaggio}`);
}

// Creazione di logger specializzati
const now = Date.now();
const logInfo = partial(log, 'info', now);
const logError = partial(log, 'error', now);
const logDebug = partial(log, 'debug', now);

logInfo('Operazione completata con successo');
logError('Si è verificato un errore durante l\'elaborazione');
logDebug('Valore della variabile x: 42');

// Esempio 2: Filtraggio di Dati Configurabile
console.log('\nEsempio 2: Filtraggio di Dati Configurabile');

const prodotti = [
  { id: 1, nome: 'Laptop', prezzo: 1200, categoria: 'Elettronica', disponibile: true },
  { id: 2, nome: 'Smartphone', prezzo: 800, categoria: 'Elettronica', disponibile: false },
  { id: 3, nome: 'Tastiera', prezzo: 100, categoria: 'Accessori', disponibile: true },
  { id: 4, nome: 'Monitor', prezzo: 300, categoria: 'Elettronica', disponibile: true },
  { id: 5, nome: 'Sedia', prezzo: 150, categoria: 'Arredamento', disponibile: true }
];

// Funzione generica di filtro
function filtraProdotti(chiave, valore, prodotti) {
  return prodotti.filter(prodotto => prodotto[chiave] === valore);
}

// Creazione di filtri specializzati
const filtraPerCategoria = partial(filtraProdotti, 'categoria');
const filtraDisponibili = partial(filtraProdotti, 'disponibile', true);
const filtraElettronici = partial(filtraProdotti, 'categoria', 'Elettronica');

console.log('Prodotti nella categoria Accessori:', filtraPerCategoria('Accessori', prodotti));
console.log('Prodotti disponibili:', filtraDisponibili(prodotti));
console.log('Prodotti elettronici:', filtraElettronici(prodotti));

// Esempio 3: Gestione di Eventi in UI
console.log('\nEsempio 3: Gestione di Eventi in UI');

// In un ambiente browser, potremmo gestire eventi così:
function gestisciEvento(tipo, elementoId, evento) {
  console.log(`Evento ${tipo} scattato su elemento con ID ${elementoId}`);
  console.log(`Coordinate: (${evento.x}, ${evento.y})`);
  // Logica di gestione dell'evento...
}

// Simuliamo un evento
const eventoFittizio = { x: 100, y: 200 };

// Creando gestori specializzati
const gestisciClick = partial(gestisciEvento, 'click');
const gestisciHover = partial(gestisciEvento, 'hover');

// Utilizzo
const gestoreClickBottone = partial(gestisciClick, 'bottone-submit');
const gestoreHoverMenu = partial(gestisciHover, 'menu-dropdown');

gestoreClickBottone(eventoFittizio);
gestoreHoverMenu(eventoFittizio);

// Esempio 4: Utility HTTP
console.log('\nEsempio 4: Utility HTTP');

// Simuliamo una funzione per fare richieste HTTP
function httpRequest(metodo, baseUrl, endpoint, dati) {
  console.log(`Facendo una richiesta ${metodo} a ${baseUrl}${endpoint}`);
  if (dati) {
    console.log('Con i dati:', dati);
  }
  // In una vera implementazione, qui utilizzeremmo fetch o axios
  return `Risposta dalla richiesta ${metodo} a ${endpoint}`;
}

// Creazione di utility specializzate
const apiRequest = partial(httpRequest, 'GET', 'https://api.example.com');
const apiPost = partial(httpRequest, 'POST', 'https://api.example.com');

// Ulteriore specializzazione
const getUtenti = partial(apiRequest, '/users');
const getUtente = id => apiRequest(`/users/${id}`);
const creaNuovoUtente = partial(apiPost, '/users');

console.log(getUtenti());
console.log(getUtente(123));
console.log(creaNuovoUtente({ nome: 'Alice', email: 'alice@example.com' }));

// Esempio 5: Elaborazione di Stringhe
console.log('\nEsempio 5: Elaborazione di Stringhe');

// Funzione di base per sostituire contenuti in stringhe
function sostituisci(cerca, sostituiscoCon, opzioni, testo) {
  const regex = new RegExp(cerca, opzioni);
  return testo.replace(regex, sostituiscoCon);
}

// Creazione di funzioni specializzate
const rimuoviSpazi = partial(sostituisci, '\\s+', '', 'g');
const capitalizza = texto => 
  texto.replace(/\b\w/g, match => match.toUpperCase());

const sanitizzaInput = partial(sostituisci, '[<>&"\']', '', 'g');
const convertiInSlug = testo => 
  partial(sostituisci, '[^a-z0-9]+', '-', 'gi')(testo.toLowerCase()).replace(/^-|-$/g, '');

// Utilizzo
const inputUtente = "  <script>alert('XSS')</script> Titolo dell'Articolo! ";
console.log('Input originale:', inputUtente);
console.log('Senza spazi:', rimuoviSpazi(inputUtente));
console.log('Capitalizzato:', capitalizza(inputUtente));
console.log('Sanitizzato:', sanitizzaInput(inputUtente));
console.log('Slug:', convertiInSlug(inputUtente));

// Esempio 6: Applicazione Parziale con Posizionamento Flessibile
console.log('\nEsempio 6: Applicazione Parziale con Posizionamento Flessibile');

// Utility per applicazione parziale con placeholder
function partialAdvanced(fn, ...presetArgs) {
  // Utilizziamo un simbolo speciale come placeholder
  const PLACEHOLDER = Symbol('placeholder');
  
  // Conta quanti argomenti effettivi mancano (esclusi i placeholder)
  const missingArgsCount = presetArgs.filter(arg => arg === PLACEHOLDER).length;
  
  return function(...laterArgs) {
    // Combina gli argomenti, sostituendo i placeholder
    const args = [...presetArgs];
    let laterIndex = 0;
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === PLACEHOLDER) {
        if (laterIndex < laterArgs.length) {
          args[i] = laterArgs[laterIndex++];
        }
      }
    }
    
    // Aggiungi eventuali argomenti rimanenti alla fine
    while (laterIndex < laterArgs.length) {
      args.push(laterArgs[laterIndex++]);
    }
    
    return fn(...args);
  };
}

// Funzione di esempio
function dividi(a, b, c, d) {
  return (a + b) / (c + d);
}

// Utilizzo con placeholder
const PLACEHOLDER = Symbol('placeholder');
const divisioneSpeciale = partialAdvanced(dividi, 10, PLACEHOLDER, 5, PLACEHOLDER);
console.log('Risultato divisione speciale:', divisioneSpeciale(20, 15)); // (10 + 20) / (5 + 15) = 30 / 20 = 1.5

// Esempio 7: Memorizzazione con Applicazione Parziale
console.log('\nEsempio 7: Memorizzazione con Applicazione Parziale');

// Utility per la memorizzazione
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('Risultato in cache per:', args);
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Funzione costosa da calcolare
function calcolaFattoriale(n) {
  console.log(`Calcolando il fattoriale di ${n}...`);
  if (n <= 1) return 1;
  return n * calcolaFattoriale(n - 1);
}

// Versione memorizzata
const fattorialeMemo = memoize(calcolaFattoriale);

// Utilizzo
console.log('Fattoriale di 5:', fattorialeMemo(5));
console.log('Fattoriale di 5 (seconda chiamata):', fattorialeMemo(5)); // Usa la cache
console.log('Fattoriale di 6:', fattorialeMemo(6));

// Esempio 8: Pipeline di Elaborazione Dati
console.log('\nEsempio 8: Pipeline di Elaborazione Dati');

// Funzioni di base per elaborazione
function mappa(trasformazione, array) {
  return array.map(trasformazione);
}

function filtra(predicato, array) {
  return array.filter(predicato);
}

function riduci(riduttore, valoreIniziale, array) {
  return array.reduce(riduttore, valoreIniziale);
}

// Funzioni specializzate
const mappaQuadrato = partial(mappa, x => x * x);
const filtraMaggioriDi = valore => partial(filtra, x => x > valore);
const somma = partial(riduci, (acc, val) => acc + val, 0);

// Pipeline manuale
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const risultato = somma(mappaQuadrato(filtraMaggioriDi(5)(numeri)));
console.log('Somma dei quadrati dei numeri maggiori di 5:', risultato);

// Esempio 9: Applicazione Parziale con Promise
console.log('\nEsempio 9: Applicazione Parziale con Promise');

// Simulazione di una richiesta API
function fetchAPI(baseUrl, endpoint, opzioni = {}) {
  console.log(`Fetching da ${baseUrl}${endpoint} con opzioni:`, opzioni);
  
  // Simuliamo una Promise che si risolve dopo un ritardo
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ 
        url: `${baseUrl}${endpoint}`, 
        data: `Dati da ${endpoint}`,
        ...opzioni
      });
    }, 100);
  });
}

// Applicazione parziale per creare client API specializzati
const githubAPI = partial(fetchAPI, 'https://api.github.com');
const userAPI = partial(githubAPI, '/users');

// Utilizzo
console.log('API client specializzato creato');
// In un ambiente reale si potrebbero usare così:
// userAPI({params: {since: 100}}).then(data => console.log(data));

// Decommentare per vedere il risultato reale:
/*
userAPI({params: {since: 100}})
  .then(data => console.log('Risultato GitHub API:', data));
*/
