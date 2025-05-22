/**
 * Composizione di Funzioni
 * 
 * La composizione di funzioni permette di combinare due o più funzioni per crearne una nuova.
 * Nella notazione matematica: (f ∘ g)(x) = f(g(x))
 */

// Esempio 1: Composizione di base
console.log('Esempio 1: Composizione di base');

// Funzioni semplici
const doppio = x => x * 2;
const incrementa = x => x + 1;
const quadrato = x => x * x;

// Composizione manuale
const risultatoManuale = quadrato(doppio(incrementa(5)));
console.log('Risultato con composizione manuale:', risultatoManuale);

// Funzione di composizione
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

// Utilizzo della composizione
const incrementaDoppioQuadrato = compose(quadrato, doppio, incrementa);
console.log('Risultato con funzione compose:', incrementaDoppioQuadrato(5));

// Esempio 2: Pipe (composizione da sinistra a destra)
console.log('\nEsempio 2: Pipe (composizione da sinistra a destra)');

function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

const quadratoDopoIncrementaDoppio = pipe(incrementa, doppio, quadrato);
console.log('Risultato con pipe:', quadratoDopoIncrementaDoppio(5));

// Esempio 3: Composizione con funzioni di ordine superiore
console.log('\nEsempio 3: Composizione con funzioni di ordine superiore');

// Funzioni che lavorano con array
const filtraPari = array => array.filter(n => n % 2 === 0);
const moltiplicaPer3 = array => array.map(n => n * 3);
const somma = array => array.reduce((acc, n) => acc + n, 0);

// Composizione con pipe
const sommaDeiTriploEPari = pipe(filtraPari, moltiplicaPer3, somma);

const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log('Numeri originali:', numeri);
console.log('Risultato somma dei triplo dei pari:', sommaDeiTriploEPari(numeri));

// Mostriamo i passaggi intermedi
console.log('Pari:', filtraPari(numeri));
console.log('Triplo dei pari:', moltiplicaPer3(filtraPari(numeri)));
console.log('Somma dei triplo dei pari:', somma(moltiplicaPer3(filtraPari(numeri))));

// Esempio 4: Composizione con funzioni che accettano più argomenti
console.log('\nEsempio 4: Composizione con funzioni multi-argomento');

// Per utilizzare funzioni con più argomenti nella composizione, 
// dobbiamo prima renderle "unarie" (che accettano un singolo argomento)
// Possiamo farlo con il currying

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

// Funzioni con più argomenti
function aggiungi(a, b) {
  return a + b;
}

function moltiplica(a, b) {
  return a * b;
}

// Versioni curried
const aggiungiC = curry(aggiungi);
const moltiplicaC = curry(moltiplica);

// Ora possiamo comporre queste funzioni
const aggiungi5 = aggiungiC(5);
const moltiplica3 = moltiplicaC(3);

const aggiungi5Moltiplica3 = pipe(aggiungi5, moltiplica3);
console.log('Aggiungi 5 e moltiplica per 3:', aggiungi5Moltiplica3(10)); // (10 + 5) * 3 = 45

// Esempio 5: Composizione con gestione degli errori
console.log('\nEsempio 5: Composizione con gestione degli errori');

// Utilizziamo un semplice container "Maybe" per gestire i casi nulli
const Maybe = {
  just: (x) => ({
    map: (fn) => Maybe.just(fn(x)),
    fold: (_, g) => g(x),
    toString: () => `Just(${x})`
  }),
  nothing: () => ({
    map: () => Maybe.nothing(),
    fold: (f, _) => f(),
    toString: () => 'Nothing'
  }),
  fromNullable: (x) => x != null ? Maybe.just(x) : Maybe.nothing()
};

// Funzioni che potrebbero fallire
const dividiPer = curry((divisore, numero) => 
  divisore === 0 ? Maybe.nothing() : Maybe.just(numero / divisore)
);

const radiceQuadrata = (numero) => 
  numero < 0 ? Maybe.nothing() : Maybe.just(Math.sqrt(numero));

// Composizione sicura
function composeM(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => acc.map(fn), Maybe.just(x));
  };
}

const calcoloSicuro = composeM(
  x => x * 2,
  Math.sqrt
);

console.log('Calcolo sicuro di √16 * 2:', calcoloSicuro(16).toString());
console.log('Calcolo sicuro di √-16 * 2:', calcoloSicuro(-16).toString()); // Nothing

// Esempio 6: Point-free style
console.log('\nEsempio 6: Point-free style');

// Point-free significa scrivere funzioni senza menzionare esplicitamente i loro argomenti
const isMultiploDi = curry((divisore, numero) => numero % divisore === 0);
const isMultiploDi3 = isMultiploDi(3);
const isMultiploDi5 = isMultiploDi(5);

const isFizzBuzz = (n) => isMultiploDi3(n) && isMultiploDi5(n);
const isFizz = (n) => isMultiploDi3(n) && !isMultiploDi5(n);
const isBuzz = (n) => !isMultiploDi3(n) && isMultiploDi5(n);

// Versione più point-free con composizione
const and = curry((fn1, fn2) => (x) => fn1(x) && fn2(x));
const or = curry((fn1, fn2) => (x) => fn1(x) || fn2(x));
const not = (fn) => (x) => !fn(x);

const isFizzBuzzPF = and(isMultiploDi3, isMultiploDi5);
const isFizzPF = and(isMultiploDi3, not(isMultiploDi5));
const isBuzzPF = and(not(isMultiploDi3), isMultiploDi5);

// Test
for (let i = 1; i <= 15; i++) {
  let risultato = '';
  if (isFizzBuzzPF(i)) risultato = 'FizzBuzz';
  else if (isFizzPF(i)) risultato = 'Fizz';
  else if (isBuzzPF(i)) risultato = 'Buzz';
  else risultato = i;
  
  console.log(`${i}: ${risultato}`);
}

// Esempio 7: Composizione con Functors
console.log('\nEsempio 7: Composizione con Functors');

// Box Functor
const Box = x => ({
  map: f => Box(f(x)),
  fold: f => f(x),
  toString: () => `Box(${x})`
});

// Componiamo operazioni utilizzando map
const risultatoBox = Box(5)
  .map(incrementa)
  .map(doppio)
  .map(quadrato);

console.log('Risultato con Box Functor:', risultatoBox.toString());
console.log('Valore estratto:', risultatoBox.fold(x => x));

// Esempio 8: Composizione con Logging
console.log('\nEsempio 8: Composizione con Logging');

// Funzione di utility per debugging
const tap = curry((fn, x) => {
  fn(x);
  return x;
});

const log = label => tap(x => console.log(`${label}: ${x}`));

// Utilizziamo tap per loggare i passi intermedi
const pipelineConLog = pipe(
  log('Input'),
  incrementa,
  log('Dopo incremento'),
  doppio,
  log('Dopo doppio'),
  quadrato,
  log('Risultato finale')
);

console.log('Esecuzione pipeline con logging:');
pipelineConLog(5);

// Esempio 9: Utilità di Composizione Pratica
console.log('\nEsempio 9: Utilità di Composizione Pratica');

// Trasformazione di oggetti
const utenti = [
  { id: 1, nome: 'Alice', ruolo: 'admin', attivo: true },
  { id: 2, nome: 'Bob', ruolo: 'utente', attivo: false },
  { id: 3, nome: 'Charlie', ruolo: 'utente', attivo: true }
];

// Funzioni di trasformazione
const prop = curry((key, obj) => obj[key]);
const propEq = curry((key, value, obj) => obj[key] === value);

const isAttivo = propEq('attivo', true);
const isAdmin = propEq('ruolo', 'admin');
const getName = prop('nome');

// Funzioni di filtraggio composte
const getAdminAttivi = pipe(
  array => array.filter(isAttivo),
  array => array.filter(isAdmin)
);

const getNomiUtentiAttivi = pipe(
  array => array.filter(isAttivo),
  array => array.map(getName)
);

console.log('Admin attivi:', getAdminAttivi(utenti));
console.log('Nomi utenti attivi:', getNomiUtentiAttivi(utenti));

// Esempio 10: Implementazione di Composizione per Oggetti
console.log('\nEsempio 10: Implementazione di Composizione per Oggetti');

// Funzioni che trasformano oggetti
const addTitle = (user) => ({ ...user, title: `${user.ruolo.toUpperCase()}: ${user.nome}` });
const makeGreeting = (user) => ({ ...user, greeting: `Ciao, ${user.nome}!` });
const formatUser = (user) => ({
  displayName: user.title,
  greeting: user.greeting,
  status: user.attivo ? 'Online' : 'Offline'
});

// Componiamo queste trasformazioni
const createUserProfile = pipe(
  addTitle,
  makeGreeting,
  formatUser
);

console.log('Profilo utente formattato:', createUserProfile(utenti[0]));
