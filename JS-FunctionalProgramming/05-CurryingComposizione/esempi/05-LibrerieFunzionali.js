/**
 * Librerie per Currying e Composizione
 * 
 * Questo file esplora l'utilizzo di librerie funzionali popolari come Ramda e Lodash/fp
 * che forniscono funzionalità avanzate per currying, composizione e altre
 * tecniche di programmazione funzionale.
 */

// Nota: In un ambiente reale, si utilizzerebbero i pacchetti installati via npm.
// Ad esempio:
// npm install ramda lodash lodash/fp

// Per eseguire questo esempio, è necessario installare le librerie:
// const R = require('ramda');
// const _ = require('lodash');
// const fp = require('lodash/fp');

// Poiché questo è un file di esempio, simuleremo alcune delle funzionalità di queste librerie
// per mostrare come funzionerebbero in un ambiente reale.

// -----------------------------------------------------------
// SIMULAZIONE DELLE FUNZIONALITÀ DI RAMDA
// -----------------------------------------------------------

const R = {
  // Funzionalità di base
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b,
  
  // Funzioni di ordine superiore
  map: fn => array => array.map(fn),
  filter: predicate => array => array.filter(predicate),
  reduce: (fn, initial) => array => array.reduce(fn, initial),
  
  // Utility per composizione
  pipe: (...fns) => x => fns.reduce((acc, fn) => fn(acc), x),
  compose: (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x),
  
  // Utility per oggetti
  prop: key => obj => obj[key],
  propEq: (key, value) => obj => obj[key] === value,
  path: paths => obj => paths.reduce((acc, key) => acc && acc[key], obj),
  
  // Altre utility
  curry: (fn) => {
    const arity = fn.length;
    return function curried(...args) {
      if (args.length >= arity) {
        return fn.apply(this, args);
      } else {
        return function(...rest) {
          return curried.apply(this, args.concat(rest));
        };
      }
    };
  }
};

// Curry automatico delle funzioni
R.add = R.curry(R.add);
R.subtract = R.curry(R.subtract);
R.multiply = R.curry(R.multiply);
R.divide = R.curry(R.divide);
R.map = R.curry(R.map);
R.filter = R.curry(R.filter);
R.reduce = R.curry(R.reduce);
R.prop = R.curry(R.prop);
R.propEq = R.curry(R.propEq);
R.path = R.curry(R.path);

// -----------------------------------------------------------
// SIMULAZIONE DELLE FUNZIONALITÀ DI LODASH/FP
// -----------------------------------------------------------

const fp = {
  // Funzionalità di base (già curried in lodash/fp)
  add: (a) => (b) => a + b,
  subtract: (a) => (b) => a - b,
  multiply: (a) => (b) => a * b,
  divide: (a) => (b) => a / b,
  
  // Funzioni di ordine superiore
  map: (fn) => (array) => array.map(fn),
  filter: (predicate) => (array) => array.filter(predicate),
  reduce: (fn) => (initial) => (array) => array.reduce(fn, initial),
  
  // Utility per composizione
  flow: (...fns) => x => fns.reduce((acc, fn) => fn(acc), x),
  flowRight: (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x),
  
  // Utility per oggetti
  get: (path) => (obj) => {
    const keys = typeof path === 'string' ? path.split('.') : path;
    return keys.reduce((acc, key) => acc && acc[key], obj);
  },
  getOr: (defaultValue) => (path) => (obj) => {
    const result = fp.get(path)(obj);
    return result === undefined ? defaultValue : result;
  }
};

// -----------------------------------------------------------
// ESEMPI DI UTILIZZO DI RAMDA
// -----------------------------------------------------------

console.log('ESEMPI DI UTILIZZO DI RAMDA (SIMULATO)');

// Esempio 1: Funzioni matematiche di base
console.log('\nEsempio 1: Funzioni matematiche di base');

const add5 = R.add(5);
const multiply3 = R.multiply(3);
const subtract2 = R.subtract(R.__, 2); // R.__ è un placeholder in Ramda

console.log('add5(10):', add5(10)); // 15
console.log('multiply3(4):', multiply3(4)); // 12
// Il placeholder permetterebbe: subtract2(5) => 5 - 2 = 3

// Esempio 2: Composizione e pipe
console.log('\nEsempio 2: Composizione e pipe');

const numeri = [1, 2, 3, 4, 5];

// Con pipe (da sinistra a destra)
const elaboraPipe = R.pipe(
  R.filter(n => n % 2 === 0),
  R.map(n => n * 2),
  R.reduce((acc, n) => acc + n, 0)
);

// Con compose (da destra a sinistra)
const elaboraCompose = R.compose(
  R.reduce((acc, n) => acc + n, 0),
  R.map(n => n * 2),
  R.filter(n => n % 2 === 0)
);

console.log('elaboraPipe(numeri):', elaboraPipe(numeri)); // 12
console.log('elaboraCompose(numeri):', elaboraCompose(numeri)); // 12

// Esempio 3: Manipolazione di oggetti
console.log('\nEsempio 3: Manipolazione di oggetti');

const utenti = [
  { id: 1, nome: 'Alice', età: 30, ruolo: 'admin' },
  { id: 2, nome: 'Bob', età: 25, ruolo: 'utente' },
  { id: 3, nome: 'Carol', età: 35, ruolo: 'admin' },
  { id: 4, nome: 'Dave', età: 40, ruolo: 'utente' }
];

// Ottenere i nomi degli admin
const getNomiAdmin = R.pipe(
  R.filter(R.propEq('ruolo', 'admin')),
  R.map(R.prop('nome'))
);

console.log('getNomiAdmin(utenti):', getNomiAdmin(utenti)); // ['Alice', 'Carol']

// Esempio 4: Accesso sicuro a proprietà profonde
console.log('\nEsempio 4: Accesso sicuro a proprietà profonde');

const datiComplessi = {
  utente: {
    profilo: {
      nome: 'Alice',
      contatti: {
        email: 'alice@example.com'
      }
    }
  }
};

const datiIncompleti = {
  utente: {
    profilo: {
      nome: 'Bob'
      // Manca contatti
    }
  }
};

const getEmail = R.path(['utente', 'profilo', 'contatti', 'email']);
const getEmailSafe = obj => getEmail(obj) || 'N/A';

console.log('getEmailSafe(datiComplessi):', getEmailSafe(datiComplessi)); // 'alice@example.com'
console.log('getEmailSafe(datiIncompleti):', getEmailSafe(datiIncompleti)); // 'N/A'

// -----------------------------------------------------------
// ESEMPI DI UTILIZZO DI LODASH/FP
// -----------------------------------------------------------

console.log('\nESEMPI DI UTILIZZO DI LODASH/FP (SIMULATO)');

// Esempio 1: Funzioni di base con stile più "point-free"
console.log('\nEsempio 1: Funzioni di base');

const add10 = fp.add(10);
const multiplyBy2 = fp.multiply(2);

console.log('add10(5):', add10(5)); // 15
console.log('multiplyBy2(7):', multiplyBy2(7)); // 14

// Esempio 2: Flow (simile a pipe) per elaborazione dati
console.log('\nEsempio 2: Flow per elaborazione dati');

const processData = fp.flow(
  fp.filter(n => n > 2),
  fp.map(n => n * n),
  fp.reduce((acc, n) => acc + n)(0)
);

console.log('processData([1, 2, 3, 4, 5]):', processData([1, 2, 3, 4, 5])); // 50 (3^2 + 4^2 + 5^2)

// Esempio 3: Accesso a proprietà con valori predefiniti
console.log('\nEsempio 3: Accesso a proprietà con valori predefiniti');

const getNameOrDefault = fp.getOr('Utente anonimo')('utente.nome');

const obj1 = { utente: { nome: 'Charlie' } };
const obj2 = { utente: {} };
const obj3 = {};

console.log('getNameOrDefault(obj1):', getNameOrDefault(obj1)); // 'Charlie'
console.log('getNameOrDefault(obj2):', getNameOrDefault(obj2)); // 'Utente anonimo'
console.log('getNameOrDefault(obj3):', getNameOrDefault(obj3)); // 'Utente anonimo'

// -----------------------------------------------------------
// CONFRONTO TRA APPROCCI
// -----------------------------------------------------------

console.log('\nCONFRONTO TRA APPROCCI');

// Dati per il confronto
const prodotti = [
  { id: 1, nome: 'Laptop', prezzo: 1200, categoria: 'Elettronica' },
  { id: 2, nome: 'Smartphone', prezzo: 800, categoria: 'Elettronica' },
  { id: 3, nome: 'Tastiera', prezzo: 100, categoria: 'Accessori' },
  { id: 4, nome: 'Mouse', prezzo: 50, categoria: 'Accessori' },
  { id: 5, nome: 'Monitor', prezzo: 300, categoria: 'Elettronica' }
];

console.log('\nOperazione: Calcolare il totale dei prezzi dei prodotti elettronici');

// Approccio 1: JavaScript Vanilla
console.log('\nApproccio 1: JavaScript Vanilla');
{
  const totale = prodotti
    .filter(p => p.categoria === 'Elettronica')
    .map(p => p.prezzo)
    .reduce((acc, prezzo) => acc + prezzo, 0);
  
  console.log('Totale:', totale); // 2300
}

// Approccio 2: Con le nostre utility di composizione
console.log('\nApproccio 2: Con utility di composizione manuale');
{
  const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);
  const filtraElettronici = prodotti => prodotti.filter(p => p.categoria === 'Elettronica');
  const estraiPrezzi = prodotti => prodotti.map(p => p.prezzo);
  const somma = numeri => numeri.reduce((acc, n) => acc + n, 0);
  
  const calcolaTotale = pipe(
    filtraElettronici,
    estraiPrezzi,
    somma
  );
  
  console.log('Totale:', calcolaTotale(prodotti)); // 2300
}

// Approccio 3: Con Ramda (simulato)
console.log('\nApproccio 3: Con Ramda (simulato)');
{
  const isElettronico = R.propEq('categoria', 'Elettronica');
  const getPrezzo = R.prop('prezzo');
  const somma = R.reduce((acc, n) => acc + n, 0);
  
  const calcolaTotale = R.pipe(
    R.filter(isElettronico),
    R.map(getPrezzo),
    somma
  );
  
  console.log('Totale:', calcolaTotale(prodotti)); // 2300
}

// Approccio 4: Con Lodash/FP (simulato)
console.log('\nApproccio 4: Con Lodash/FP (simulato)');
{
  const isElettronico = p => p.categoria === 'Elettronica';
  const getPrezzo = p => p.prezzo;
  
  const calcolaTotale = fp.flow(
    fp.filter(isElettronico),
    fp.map(getPrezzo),
    fp.reduce((acc, n) => acc + n)(0)
  );
  
  console.log('Totale:', calcolaTotale(prodotti)); // 2300
}

// -----------------------------------------------------------
// BENCHMARK E CONCLUSIONI
// -----------------------------------------------------------

console.log('\nCONCLUSIONI');
console.log(`
In un'applicazione reale, librerie come Ramda e Lodash/FP offrono diversi vantaggi:

1. API Complete: Centinaia di utility funzionali ben testate e ottimizzate.
2. Coerenza: API consistenti e ben documentate.
3. Performance: Implementazioni ottimizzate per vari casi d'uso.
4. Comunità: Ampia base di utenti, supporto e risorse.

Ramda è particolarmente orientata alla programmazione funzionale pura, con:
- Tutte le funzioni automaticamente curried
- Immutabilità come principio centrale
- Orientamento "data-last" per facilitare la composizione

Lodash/FP è una variante funzionale di Lodash che:
- Adatta le funzioni Lodash allo stile funzionale
- Offre funzioni immutabili e curried
- Mantiene la familiarità e la completezza di Lodash

La scelta tra implementare manualmente le utility funzionali o utilizzare
una libreria dipende dai requisiti del progetto, dalle dimensioni del team,
e dalla familiarità con i concetti funzionali.
`);

// -----------------------------------------------------------
// ESEMPI DI PATTERN AVANZATI CON LIBRERIE FUNZIONALI
// -----------------------------------------------------------

console.log('\nPATTERN AVANZATI CON LIBRERIE FUNZIONALI');

console.log('\nPattern 1: Lenti (Lenses) per gestire strutture nidificate immutabili');
console.log(`
// Con Ramda:
const userLens = R.lensProp('user');
const addressLens = R.lensProp('address');
const cityLens = R.lensProp('city');

// Composizione di lenti
const userCityLens = R.compose(userLens, addressLens, cityLens);

// Lettura
const city = R.view(userCityLens, data);

// Aggiornamento immutabile
const updatedData = R.set(userCityLens, 'New York', data);
`);

console.log('\nPattern 2: Transducers per operazioni efficienti su collezioni');
console.log(`
// Con Ramda:
const xform = R.compose(
  R.filter(x => x % 2 === 0),
  R.map(x => x * 2)
);

const efficientTransform = R.transduce(
  xform,
  R.flip(R.append),
  [],
  [1, 2, 3, 4, 5]
);
// Risultato: [4, 8] con una sola iterazione
`);

console.log('\nPattern 3: Pattern matching funzionale');
console.log(`
// Con librerie come pattern-matching-js o sanctuary-def:
const getPrice = match(
  when(_ => _.type === 'product', _ => _.price),
  when(_ => _.type === 'service', _ => _.hourlyRate * _.hours),
  when(_ => _.type === 'subscription', _ => _.monthlyFee),
  otherwise(_ => 0)
);
`);

console.log('\nPattern 4: Monadi e Functor');
console.log(`
// Con librerie come monet.js, sanctuary, o crocks:
const safeParse = str =>
  Maybe.fromNullable(str)
    .map(s => {
      try {
        return Right(JSON.parse(s));
      } catch (e) {
        return Left(e);
      }
    })
    .getOrElse(Left(new Error('Input is null or undefined')));
`);
