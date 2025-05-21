# JavaScript come Linguaggio Funzionale

JavaScript è nato come un linguaggio di scripting leggero per il browser, ma nel corso degli anni si è evoluto in un potente linguaggio multiparadigma che supporta sia la programmazione imperativa che quella funzionale. In questo capitolo, esploreremo le caratteristiche che rendono JavaScript adatto alla programmazione funzionale e come queste si sono evolute nel tempo.

## Caratteristiche Funzionali di JavaScript

### 1. Funzioni come Cittadini di Prima Classe

Una delle caratteristiche fondamentali che rendono JavaScript adatto alla programmazione funzionale è il trattamento delle funzioni come cittadini di prima classe. Questo significa che le funzioni in JavaScript possono essere:

- Assegnate a variabili
- Passate come argomenti ad altre funzioni
- Restituite da altre funzioni
- Memorizzate in strutture dati

```javascript
// Funzione assegnata a una variabile
const saluta = function(nome) {
  return `Ciao, ${nome}!`;
};

// Funzione passata come argomento
[1, 2, 3].map(function(x) { return x * 2; });

// Funzione restituita da un'altra funzione
function creaIncrementer(incremento) {
  return function(numero) {
    return numero + incremento;
  };
}

const incrementaDi5 = creaIncrementer(5);
console.log(incrementaDi5(10)); // 15

// Funzione memorizzata in un oggetto
const matematica = {
  somma: function(a, b) { return a + b; },
  sottrazione: function(a, b) { return a - b; }
};
```

### 2. Closures

Le closure in JavaScript permettono alle funzioni di "ricordare" l'ambiente in cui sono state create, anche quando vengono eseguite in un contesto diverso. Questa caratteristica è fondamentale per la programmazione funzionale.

```javascript
function contatore() {
  let count = 0;
  
  return function() {
    return ++count;
  };
}

const incrementa = contatore();
console.log(incrementa()); // 1
console.log(incrementa()); // 2
console.log(incrementa()); // 3
```

Nell'esempio, la funzione interna mantiene l'accesso alla variabile `count` anche dopo che la funzione `contatore` è terminata. Questo permette di creare funzioni con stato privato senza usare variabili globali o classi.

### 3. Arrow Functions

Introdotte in ES6, le arrow functions offrono una sintassi più concisa per definire funzioni, particolarmente utile per la programmazione funzionale.

```javascript
// Funzione tradizionale
const quadrato = function(x) {
  return x * x;
};

// Arrow function equivalente
const quadratoArrow = x => x * x;

// Con più parametri
const somma = (a, b) => a + b;

// Con blocco di codice
const salutaPersona = nome => {
  const messaggio = `Ciao, ${nome}!`;
  return messaggio;
};
```

Le arrow functions mantengono anche il riferimento a `this` dal contesto circostante, evitando uno dei problemi più comuni con le funzioni tradizionali di JavaScript.

### 4. Metodi degli Array per la Programmazione Funzionale

JavaScript offre diversi metodi per gli array che facilitano uno stile di programmazione funzionale:

```javascript
const numeri = [1, 2, 3, 4, 5];

// map: trasforma ogni elemento dell'array
const quadrati = numeri.map(x => x * x);
console.log(quadrati); // [1, 4, 9, 16, 25]

// filter: seleziona elementi in base a una condizione
const pari = numeri.filter(x => x % 2 === 0);
console.log(pari); // [2, 4]

// reduce: combina gli elementi in un singolo valore
const somma = numeri.reduce((acc, x) => acc + x, 0);
console.log(somma); // 15

// every: verifica se tutti gli elementi soddisfano una condizione
const tuttiPositivi = numeri.every(x => x > 0);
console.log(tuttiPositivi); // true

// some: verifica se almeno un elemento soddisfa una condizione
const almenoUnMaggioreD4 = numeri.some(x => x > 4);
console.log(almenoUnMaggioreD4); // true

// find: trova il primo elemento che soddisfa una condizione
const primoMaggioreD3 = numeri.find(x => x > 3);
console.log(primoMaggioreD3); // 4
```

Questi metodi permettono di esprimere trasformazioni di dati in modo dichiarativo, senza modificare lo stato originale.

### 5. Parametri di Default e Rest

ES6 ha introdotto i parametri di default e il rest parameter, che rendono più facile lavorare con le funzioni in modo funzionale:

```javascript
// Parametri di default
function saluta(nome = "Ospite") {
  return `Ciao, ${nome}!`;
}

console.log(saluta()); // "Ciao, Ospite!"
console.log(saluta("Maria")); // "Ciao, Maria!"

// Rest parameter
function somma(...numeri) {
  return numeri.reduce((acc, n) => acc + n, 0);
}

console.log(somma(1, 2, 3, 4)); // 10
```

### 6. Operatore Spread

L'operatore spread facilita la creazione di nuove strutture dati immutabili, un concetto fondamentale nella programmazione funzionale:

```javascript
const array1 = [1, 2, 3];
const array2 = [4, 5, 6];

// Creare un nuovo array combinando quelli esistenti
const combinato = [...array1, ...array2];
console.log(combinato); // [1, 2, 3, 4, 5, 6]

// Aggiungere elementi a un array in modo immutabile
const arrayConNuovoElemento = [...array1, 4];
console.log(arrayConNuovoElemento); // [1, 2, 3, 4]
console.log(array1); // [1, 2, 3] (non modificato)

// Funziona anche con gli oggetti
const persona = { nome: "Alice", età: 30 };
const personaConProfessione = { ...persona, professione: "Sviluppatore" };
console.log(personaConProfessione); // { nome: "Alice", età: 30, professione: "Sviluppatore" }
```

### 7. Destructuring Assignment

Il destructuring permette di estrarre valori da array e oggetti in modo più conciso e funzionale:

```javascript
// Array destructuring
const coordinate = [10, 20];
const [x, y] = coordinate;
console.log(x); // 10
console.log(y); // 20

// Object destructuring
const persona = { nome: "Carlo", età: 28, città: "Milano" };
const { nome, età } = persona;
console.log(nome); // "Carlo"
console.log(età); // 28

// Parametri di funzione con destructuring
function presentaPersona({ nome, età }) {
  return `${nome} ha ${età} anni`;
}

console.log(presentaPersona(persona)); // "Carlo ha 28 anni"
```

## Limiti di JavaScript come Linguaggio Funzionale

Nonostante JavaScript abbia molte caratteristiche che lo rendono adatto alla programmazione funzionale, presenta anche alcuni limiti:

### 1. Mutabilità di Default

In JavaScript, gli oggetti e gli array sono mutabili di default. Questo va contro il principio di immutabilità della programmazione funzionale:

```javascript
const array = [1, 2, 3];
array.push(4); // Modifica l'array originale
console.log(array); // [1, 2, 3, 4]

const oggetto = { a: 1, b: 2 };
oggetto.c = 3; // Modifica l'oggetto originale
console.log(oggetto); // { a: 1, b: 2, c: 3 }
```

### 2. Funzioni Impure nella Standard Library

Molti metodi della libreria standard di JavaScript sono impuri, ovvero modificano lo stato esistente:

```javascript
const array = [3, 1, 4, 1, 5];
array.sort(); // Modifica l'array originale
console.log(array); // [1, 1, 3, 4, 5]

const oggetto = { a: 1, b: 2 };
Object.assign(oggetto, { c: 3 }); // Modifica l'oggetto originale
console.log(oggetto); // { a: 1, b: 2, c: 3 }
```

### 3. Mancanza di Ottimizzazioni per la Ricorsione

JavaScript non implementa l'ottimizzazione della ricorsione in coda (tail call optimization) in modo consistente tra i vari ambienti, limitando l'uso della ricorsione per problemi complessi.

## Superare i Limiti: Strumenti e Librerie

Per superare questi limiti, sono state sviluppate diverse librerie che facilitano uno stile di programmazione più funzionale:

### 1. Immutable.js

[Immutable.js](https://immutable-js.com/) offre strutture dati immutabili efficienti:

```javascript
const { Map } = require('immutable');
const map1 = Map({ a: 1, b: 2, c: 3 });
const map2 = map1.set('b', 50);
console.log(map1.get('b')); // 2
console.log(map2.get('b')); // 50
```

### 2. Ramda

[Ramda](https://ramdajs.com/) è una libreria che enfatizza la composizione di funzioni e lo stile point-free:

```javascript
const R = require('ramda');

const sommaQuadrati = R.pipe(
  R.map(x => x * x),
  R.sum
);

console.log(sommaQuadrati([1, 2, 3, 4])); // 30
```

### 3. Lodash/fp

[Lodash/fp](https://github.com/lodash/lodash/wiki/FP-Guide) è una variante funzionale della popolare libreria Lodash:

```javascript
const fp = require('lodash/fp');

const getNestedValue = fp.get('user.profile.email');
const user = {
  user: {
    profile: {
      email: 'esempio@email.com'
    }
  }
};

console.log(getNestedValue(user)); // 'esempio@email.com'
```

## Evoluzione di JavaScript verso un Approccio più Funzionale

Nel corso degli anni, JavaScript ha adottato sempre più caratteristiche che facilitano la programmazione funzionale:

### ES6 e oltre

ES6 (2015) ha introdotto molte caratteristiche funzionali, come arrow functions, destructuring, parametri di default, e altro.

ES2019 ha introdotto `Array.prototype.flat` e `Array.prototype.flatMap`, utili per operazioni funzionali sugli array.

ES2020 ha introdotto l'operatore di coalescenza nulla (`??`) e l'optional chaining (`?.`), che rendono più elegante la gestione dei valori nulli o indefiniti.

### TypeScript

[TypeScript](https://www.typescriptlang.org/) estende JavaScript con un sistema di tipi statici che supporta costrutti funzionali come i tipi unione, i tipi generici e le funzioni di ordine superiore tipizzate.

## Conclusione

JavaScript non è un linguaggio funzionale puro come Haskell o Elm, ma offre molte caratteristiche che supportano uno stile di programmazione funzionale. Con l'evoluzione del linguaggio e l'aiuto di librerie apposite, è possibile scrivere codice JavaScript che segue i principi della programmazione funzionale come immutabilità, composizione di funzioni e assenza di effetti collaterali.

La natura multiparadigma di JavaScript permette agli sviluppatori di adottare un approccio pragmatico, utilizzando tecniche funzionali dove appropriate senza dover abbandonare completamente altri stili di programmazione. Questo rende JavaScript un eccellente punto di ingresso per esplorare la programmazione funzionale in un contesto familiare.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Paradigmi a Confronto](./03-ParadigmiConfronto.md)
- [➡️ Introduzione alla Programmazione Funzionale](../README.md)
