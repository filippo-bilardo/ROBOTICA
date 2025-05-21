# Pattern Comuni con Higher-Order Functions

Le higher-order functions sono alla base di numerosi pattern di programmazione funzionale utilizzati frequentemente. In questo modulo esploreremo alcuni dei pattern più comuni e utili che sfruttano la potenza delle higher-order functions in JavaScript.

## 1. Pattern Adapter

L'adapter pattern consente di adattare l'interfaccia di una funzione per renderla compatibile con un'altra interfaccia attesa.

```javascript
// Funzione che si aspetta parametri in un certo formato
function processDati(callback) {
  callback("risultato", null);
}

// Adapter per una funzione che si aspetta parametri in un altro formato (error-first)
function adapterErrorFirst(fn) {
  return function(data, error) {
    fn(error, data);
  };
}

// La nostra funzione che segue il pattern error-first
function miaCallback(error, data) {
  if (error) console.error(error);
  else console.log(data);
}

// Utilizzo dell'adapter
processDati(adapterErrorFirst(miaCallback));
```

## 2. Pattern Decorator

Il decorator pattern consente di aggiungere nuovi comportamenti a funzioni esistenti senza modificarle.

```javascript
// Funzione originale
function saluta(nome) {
  return `Ciao, ${nome}!`;
}

// Decorator che aggiunge timestamp
function conTimestamp(fn) {
  return function(...args) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${fn(...args)}`;
  };
}

// Decorator che aggiunge log
function conLog(fn) {
  return function(...args) {
    console.log(`Chiamata la funzione con argomenti: ${args}`);
    const risultato = fn(...args);
    console.log(`Risultato: ${risultato}`);
    return risultato;
  };
}

// Utilizzo dei decoratori
const salutaConTimestamp = conTimestamp(saluta);
const salutaConLogETimestamp = conLog(conTimestamp(saluta));

console.log(salutaConTimestamp("Mario"));  // [2023-01-01T12:00:00.000Z] Ciao, Mario!
salutaConLogETimestamp("Luigi");  // Registra tutto il processo
```

## 3. Pattern Pipeline/Composizione

Questo pattern permette di incanalare l'output di una funzione come input per la successiva, creando una catena di trasformazioni.

```javascript
// Funzioni di base
const aggiungiIVA = x => x * 1.22;
const formattaEuro = x => `€${x.toFixed(2)}`;
const evidenzia = x => `*** ${x} ***`;

// Funzione di composizione
const componi = (...funzioni) => {
  return funzioni.reduce((f, g) => (...args) => g(f(...args)));
};

// Creiamo una pipeline di funzioni
const calcolaPrezzoFinale = componi(
  aggiungiIVA,
  formattaEuro,
  evidenzia
);

console.log(calcolaPrezzoFinale(100));  // *** €122.00 ***
```

## 4. Pattern Memoization

La memoization è una tecnica di ottimizzazione che memorizza i risultati delle chiamate a funzione per evitare calcoli ripetuti.

```javascript
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log("Cache hit!");
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Esempio con funzione fibonacci ricorsiva
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const fibMemo = memoize(function(n) {
  if (n <= 1) return n;
  return fibMemo(n - 1) + fibMemo(n - 2);
});

console.time("fibonacci normale");
fibonacci(35);
console.timeEnd("fibonacci normale");

console.time("fibonacci memoizzato");
fibMemo(35);
console.timeEnd("fibonacci memoizzato");
```

## 5. Pattern Observer

L'observer pattern implementato con higher-order functions permette di implementare sistemi di eventi e sottoscrizioni.

```javascript
function creaEventEmitter() {
  const eventi = {};
  
  return {
    on: function(evento, callback) {
      if (!eventi[evento]) eventi[evento] = [];
      eventi[evento].push(callback);
    },
    
    emit: function(evento, ...args) {
      if (!eventi[evento]) return;
      eventi[evento].forEach(callback => callback(...args));
    },
    
    off: function(evento, callback) {
      if (!eventi[evento]) return;
      eventi[evento] = eventi[evento].filter(cb => cb !== callback);
    }
  };
}

// Utilizzo
const emitter = creaEventEmitter();

function gestoreNuovoUtente(utente) {
  console.log(`Nuovo utente registrato: ${utente.nome}`);
}

emitter.on('nuovoUtente', gestoreNuovoUtente);
emitter.emit('nuovoUtente', { nome: 'Mario Rossi', email: 'mario@example.com' });
```

## 6. Pattern Middleware

Il pattern middleware, utilizzato in framework come Express.js, consente di creare una catena di elaborazione dei dati.

```javascript
function creaMiddlewarePipeline() {
  const middleware = [];
  
  return {
    use: function(fn) {
      middleware.push(fn);
      return this;
    },
    
    execute: function(input) {
      return middleware.reduce((value, fn) => fn(value), input);
    }
  };
}

// Utilizzo
const pipeline = creaMiddlewarePipeline();

pipeline.use(x => x + 10)
        .use(x => x * 2)
        .use(x => `Il risultato è: ${x}`);

console.log(pipeline.execute(5));  // "Il risultato è: 30"
```

## 7. Pattern Strategy

Il pattern strategy utilizza higher-order functions per selezionare un algoritmo a runtime.

```javascript
const strategie = {
  somma: (a, b) => a + b,
  sottrazione: (a, b) => a - b,
  moltiplicazione: (a, b) => a * b,
  divisione: (a, b) => a / b
};

function calcolatore(strategia) {
  return function(a, b) {
    if (!strategie[strategia]) {
      throw new Error(`Strategia ${strategia} non supportata`);
    }
    return strategie[strategia](a, b);
  };
}

const somma = calcolatore('somma');
const moltiplica = calcolatore('moltiplicazione');

console.log(somma(5, 3));       // 8
console.log(moltiplica(5, 3));  // 15
```

## Conclusione

I pattern illustrati mostrano come le higher-order functions possano essere utilizzate per creare codice modulare, componibile e facilmente testabile. Questi pattern rappresentano solo alcuni esempi dell'enorme versatilità delle higher-order functions nella programmazione funzionale.

La comprensione e l'applicazione di questi pattern consente di scrivere codice più elegante, riutilizzabile e manutenibile, sfruttando appieno i principi della programmazione funzionale.

## Navigazione del Corso
- [📑 Indice](/home/git-projects/JS-FunctionalProgramming/README.md)
- [⬅️ Funzioni che Restituiscono Funzioni](/home/git-projects/JS-FunctionalProgramming/03-HigherOrderFunctions/teoria/03-FunzioniCheRestituisconoFunzioni.md)
- [➡️ Modulo 4: Map, Filter e Reduce](/home/git-projects/JS-FunctionalProgramming/04-MapFilterReduce/README.md)
