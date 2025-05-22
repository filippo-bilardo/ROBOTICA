/**
 * Currying in Pratica
 * 
 * Il currying è una tecnica che trasforma una funzione con più argomenti
 * in una sequenza di funzioni, ciascuna con un singolo argomento.
 */

// Esempio 1: Forma base di currying
console.log('Esempio 1: Forma base di currying');

// Funzione normale
function somma(a, b, c) {
  return a + b + c;
}

// Funzione curried manualmente
function sommaCurried(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

// Versione con arrow function (più concisa)
const sommaCurriedArrow = a => b => c => a + b + c;

console.log('Funzione normale:', somma(1, 2, 3));
console.log('Funzione curried:', sommaCurried(1)(2)(3));
console.log('Funzione curried con arrow:', sommaCurriedArrow(1)(2)(3));

// Esempio 2: Utility per il currying
console.log('\nEsempio 2: Utility per il currying');

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}

// Utilizzo della utility di currying
const sommaTre = function(a, b, c) {
  return a + b + c;
};

const moltiplicaTre = function(a, b, c) {
  return a * b * c;
};

const sommaCurry = curry(sommaTre);
const moltiplicaCurry = curry(moltiplicaTre);

console.log('Somma curry completa:', sommaCurry(1, 2, 3));
console.log('Somma curry parziale 1:', sommaCurry(1)(2)(3));
console.log('Somma curry parziale 2:', sommaCurry(1, 2)(3));
console.log('Moltiplica curry:', moltiplicaCurry(2)(3)(4));

// Esempio 3: Creazione di funzioni specializzate
console.log('\nEsempio 3: Funzioni specializzate');

// Funzione per formattare valuta
const formattaValuta = curry(function(simbolo, decimali, valore) {
  return simbolo + valore.toFixed(decimali);
});

// Creazione di formattatori specializzati
const formattaEuro = formattaValuta('€');
const formattaDollaro = formattaValuta('$');

const formattaEuroDueDecimali = formattaEuro(2);
const formattaDollaroUnDecimale = formattaDollaro(1);

console.log('Euro con 2 decimali:', formattaEuroDueDecimali(123.456));  // €123.46
console.log('Dollaro con 1 decimale:', formattaDollaroUnDecimale(123.456));  // $123.5

// Esempio 4: Currying con oggetti e metodi
console.log('\nEsempio 4: Currying con oggetti e metodi');

// Funzione per estrarre proprietà da oggetti
const getProp = curry(function(prop, obj) {
  return obj[prop];
});

const persone = [
  { nome: 'Alice', eta: 25, città: 'Roma' },
  { nome: 'Bob', eta: 30, città: 'Milano' },
  { nome: 'Carol', eta: 28, città: 'Roma' }
];

// Creiamo getter specializzati
const getNome = getProp('nome');
const getEta = getProp('eta');
const getCittà = getProp('città');

// Utilizziamo i getter con array.map
const nomi = persone.map(getNome);
const età = persone.map(getEta);
const città = persone.map(getCittà);

console.log('Nomi:', nomi);
console.log('Età:', età);
console.log('Città:', città);

// Esempio 5: Currying di metodi nativi
console.log('\nEsempio 5: Currying di metodi nativi');

// Utility per convertire metodi in funzioni curried
const curriedMethod = curry(function(method, ...args) {
  return function(obj) {
    return obj[method](...args);
  };
});

// Creazione di funzioni utili con metodi di array
const filter = curry(function(predicate, array) {
  return array.filter(predicate);
});

const map = curry(function(transform, array) {
  return array.map(transform);
});

const split = curry(function(separator, str) {
  return str.split(separator);
});

const join = curry(function(separator, array) {
  return array.join(separator);
});

// Utilizzo delle funzioni curried
const perEta = filter(persona => persona.eta > 25);
const soloNomi = map(persona => persona.nome);

console.log('Persone con età > 25:', perEta(persone));
console.log('Solo nomi:', soloNomi(persone));

// Esempio 6: Pipeline con funzioni curried
console.log('\nEsempio 6: Pipeline con funzioni curried');

// Funzione di composizione semplice (pipe)
const pipe = function(...fns) {
  return function(x) {
    return fns.reduce((y, f) => f(y), x);
  };
};

// Pipeline per elaborare persone
const getNomiMaiuscolo = pipe(
  filter(p => p.eta >= 28),
  map(p => p.nome),
  map(nome => nome.toUpperCase())
);

console.log('Nomi maiuscolo persone >= 28 anni:', getNomiMaiuscolo(persone));

// Esempio 7: Gestione degli errori con currying
console.log('\nEsempio 7: Gestione degli errori');

// Funzione sicura per accedere a proprietà, anche nidificate
const getPropSafe = curry(function(paths, defaultValue, obj) {
  try {
    const props = paths.split('.');
    return props.reduce((o, p) => (o === null || o === undefined) ? undefined : o[p], obj) || defaultValue;
  } catch (e) {
    return defaultValue;
  }
});

const datiComplessi = {
  utente: {
    profilo: {
      nome: 'Alice',
      preferenze: {
        tema: 'scuro'
      }
    }
  }
};

const datiIncompleti = {
  utente: {
    profilo: {
      nome: 'Bob'
      // Mancano le preferenze
    }
  }
};

// Creazione di getter sicuri
const getTema = getPropSafe('utente.profilo.preferenze.tema', 'chiaro');
const getNomeUtente = getPropSafe('utente.profilo.nome', 'Utente anonimo');

console.log('Tema di Alice:', getTema(datiComplessi));
console.log('Tema di Bob (default):', getTema(datiIncompleti));
console.log('Nome di Bob:', getNomeUtente(datiIncompleti));
console.log('Nome di utente non esistente:', getNomeUtente({}));

// Esempio 8: Currying con funzioni asincrone
console.log('\nEsempio 8: Currying con funzioni asincrone');

// Utility per il currying di funzioni asincrone
const curryAsync = function(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
};

// Funzione asincrona
async function fetchDati(base, endpoint, id) {
  // Simulazione di una richiesta API
  console.log(`Fetching da ${base}${endpoint}/${id}`);
  
  // In un'applicazione reale, qui useremmo fetch o axios
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ id, data: `Dati da ${endpoint} per id ${id}` });
    }, 500);
  });
}

// Currying della funzione asincrona
const fetchCurried = curryAsync(fetchDati);

// Creazione di funzioni specializzate
const fetchDaAPI = fetchCurried('https://api.example.com');
const fetchUtenti = fetchDaAPI('/users');
const fetchProdotti = fetchDaAPI('/products');

// Utilizzo (qui mostriamo solo la sintassi, non l'esecuzione)
console.log('Le funzioni curried asincrone sono state create.');
console.log('In un ambiente reale, potresti chiamarle così:');
console.log('fetchUtenti(123).then(data => console.log(data))');
console.log('fetchProdotti(456).then(data => console.log(data))');

// Se vuoi vedere i risultati reali, decommentare:
/*
(async () => {
  const utenteRisultato = await fetchUtenti(123);
  console.log('Risultato utente:', utenteRisultato);
  
  const prodottoRisultato = await fetchProdotti(456);
  console.log('Risultato prodotto:', prodottoRisultato);
})();
*/
