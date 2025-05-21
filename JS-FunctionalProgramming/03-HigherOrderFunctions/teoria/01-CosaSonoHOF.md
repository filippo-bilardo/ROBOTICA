# Cos'è una Higher-Order Function

Le higher-order functions (funzioni di ordine superiore) sono uno dei concetti fondamentali della programmazione funzionale, e rappresentano un potente strumento per creare astrazioni e riutilizzare codice. In questo capitolo, esploreremo cosa sono le higher-order functions, perché sono importanti e come possono trasformare il modo in cui programmiamo.

## Definizione

Una **higher-order function** è una funzione che soddisfa almeno uno dei seguenti criteri:

1. **Accetta una o più funzioni come argomenti**
2. **Restituisce una funzione come risultato**

Questa definizione si basa sul concetto di "funzioni come cittadini di prima classe" (first-class functions), che abbiamo esplorato nel modulo introduttivo. In JavaScript, le funzioni sono valori che possono essere passati, restituiti, memorizzati in variabili e manipolati come qualsiasi altro dato.

## Esempi Basilari

Vediamo alcuni semplici esempi per illustrare il concetto:

### Funzione che accetta una funzione come argomento

```javascript
// Higher-order function che accetta una funzione come argomento
function eseguiOperazione(fn, x, y) {
  return fn(x, y);
}

// Funzioni da passare come argomenti
function somma(a, b) { return a + b; }
function moltiplica(a, b) { return a * b; }

// Utilizzo
console.log(eseguiOperazione(somma, 5, 3));       // Output: 8
console.log(eseguiOperazione(moltiplica, 5, 3));  // Output: 15
```

In questo esempio, `eseguiOperazione` è una higher-order function perché accetta una funzione `fn` come primo argomento.

### Funzione che restituisce una funzione

```javascript
// Higher-order function che restituisce una funzione
function creaIncrementatore(incremento) {
  // Restituisce una funzione
  return function(numero) {
    return numero + incremento;
  };
}

// Creiamo funzioni specifiche
const incrementaDi1 = creaIncrementatore(1);
const incrementaDi5 = creaIncrementatore(5);

// Utilizzo
console.log(incrementaDi1(10));  // Output: 11
console.log(incrementaDi5(10));  // Output: 15
```

In questo esempio, `creaIncrementatore` è una higher-order function perché restituisce una funzione come risultato.

## Perché le Higher-Order Functions sono Importanti

Le higher-order functions offrono numerosi vantaggi che trasformano il modo in cui scriviamo e organizziamo il codice:

### 1. Astrazione

Le higher-order functions ci permettono di astrarre pattern comuni, separando "cosa fare" da "come farlo". Questo rende il codice più modulare e facile da comprendere.

```javascript
// Senza higher-order functions (ripetizione di codice)
const numeri = [1, 2, 3, 4, 5];
const numeriRaddoppiati = [];
for (let i = 0; i < numeri.length; i++) {
  numeriRaddoppiati.push(numeri[i] * 2);
}

// Con higher-order function (map)
const numeriRaddoppiati = numeri.map(numero => numero * 2);
```

### 2. Riusabilità

Creando funzioni che accettano comportamenti come argomenti, possiamo riutilizzare lo stesso codice per operazioni diverse.

```javascript
// Una funzione riutilizzabile per processare array in diversi modi
function processoArray(array, processore) {
  const risultato = [];
  for (const item of array) {
    risultato.push(processore(item));
  }
  return risultato;
}

// Usiamo la stessa funzione per operazioni diverse
const numeri = [1, 2, 3, 4, 5];
const quadrati = processoArray(numeri, n => n * n);
const radiciQuadrate = processoArray(numeri, n => Math.sqrt(n));
const nomiLunghezza = processoArray(['Alice', 'Bob', 'Charlie'], s => s.length);
```

### 3. Composizione

Le higher-order functions facilitano la composizione di funzioni, permettendo di combinare funzioni semplici per creare funzionalità complesse.

```javascript
// Funzione per comporre due funzioni
function componi(f, g) {
  return function(x) {
    return f(g(x));
  };
}

// Funzioni semplici
const doppio = x => x * 2;
const quadrato = x => x * x;

// Funzione composta
const quadratoPoisDoppio = componi(doppio, quadrato);
console.log(quadratoPoisDoppio(3));  // Output: 18 (prima calcola 3² = 9, poi 9*2 = 18)
```

### 4. Programmazione Dichiarativa

Le higher-order functions sono alla base della programmazione dichiarativa, che si concentra sul "cosa" fare piuttosto che sul "come" farlo. Questo rende il codice più leggibile ed espressivo.

```javascript
// Programmazione imperativa (come)
const numeriPari = [];
for (let i = 0; i < numeri.length; i++) {
  if (numeri[i] % 2 === 0) {
    numeriPari.push(numeri[i]);
  }
}

// Programmazione dichiarativa (cosa)
const numeriPari = numeri.filter(numero => numero % 2 === 0);
```

### 5. Gestione di Operazioni Asincrone

Le higher-order functions sono particolarmente utili nella gestione di operazioni asincrone, come callback, Promise e async/await.

```javascript
// Esempio con callback
function fetchData(url, onSuccess, onError) {
  fetch(url)
    .then(response => response.json())
    .then(data => onSuccess(data))
    .catch(error => onError(error));
}

// Utilizzo
fetchData(
  'https://api.example.com/data',
  data => console.log('Dati ricevuti:', data),
  error => console.error('Errore:', error)
);
```

## Higher-Order Functions Nella Standard Library di JavaScript

JavaScript include diverse higher-order functions nella sua libreria standard, specialmente per la manipolazione di array:

### Array Methods

- **map**: Trasforma ogni elemento dell'array
  ```javascript
  const numeri = [1, 2, 3];
  const raddoppiati = numeri.map(n => n * 2);  // [2, 4, 6]
  ```

- **filter**: Seleziona elementi in base a una condizione
  ```javascript
  const numeri = [1, 2, 3, 4, 5];
  const pari = numeri.filter(n => n % 2 === 0);  // [2, 4]
  ```

- **reduce**: Combina tutti gli elementi in un singolo valore
  ```javascript
  const numeri = [1, 2, 3, 4];
  const somma = numeri.reduce((acc, n) => acc + n, 0);  // 10
  ```

- **forEach**: Esegue una funzione per ogni elemento
  ```javascript
  const numeri = [1, 2, 3];
  numeri.forEach(n => console.log(n));  // Stampa 1, 2, 3
  ```

- **some/every**: Testano se alcuni/tutti gli elementi soddisfano una condizione
  ```javascript
  const numeri = [1, 2, 3, 4];
  const hasPari = numeri.some(n => n % 2 === 0);  // true
  const tuttiPari = numeri.every(n => n % 2 === 0);  // false
  ```

### Altre Higher-Order Functions nella Standard Library

- **setTimeout/setInterval**: Eseguono una funzione dopo un certo tempo o a intervalli regolari
  ```javascript
  setTimeout(() => console.log("Ciao dopo 1 secondo"), 1000);
  ```

- **Promise.then/catch**: Gestiscono il risultato di operazioni asincrone
  ```javascript
  fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log(data));
  ```

## Implementazione di Higher-Order Functions Personalizzate

Oltre ad usare le higher-order functions fornite da JavaScript, possiamo crearne di personalizzate per soddisfare esigenze specifiche:

### Debounce

Una funzione di debounce ritarda l'esecuzione di una funzione fino a quando non è trascorso un certo periodo di tempo senza ulteriori invocazioni:

```javascript
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Utilizzo
const ricercaDebounced = debounce(query => {
  console.log('Ricerca:', query);
}, 300);

// Simuliamo input dell'utente
ricercaDebounced('a');
ricercaDebounced('ap');
ricercaDebounced('app');
ricercaDebounced('appl');
ricercaDebounced('apple');  // Solo questa ricerca verrà eseguita dopo 300ms
```

### Memoization

La memoization è una tecnica che memorizza i risultati di chiamate di funzione costose per riutilizzarli quando la stessa chiamata viene ripetuta:

```javascript
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Utilizzo
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.time('fib');
console.log(fibonacci(40));  // Molto veloce grazie alla memoization
console.timeEnd('fib');
```

## Considerazioni sulle Higher-Order Functions

Sebbene le higher-order functions offrano numerosi vantaggi, ci sono alcune considerazioni da tenere a mente:

### Vantaggi

1. **Astrazioni potenti**: Permettono di scrivere codice più dichiarativo ed espressivo
2. **DRY (Don't Repeat Yourself)**: Riducono la duplicazione del codice
3. **Modularità**: Facilitano la creazione di componenti riutilizzabili
4. **Testabilità**: Spesso sono più facili da testare, specialmente quando sono pure

### Potenziali Svantaggi

1. **Complessità per i principianti**: Possono essere difficili da comprendere per chi è nuovo alla programmazione funzionale
2. **Overhead di performance**: In alcuni casi, potrebbero introdurre un leggero overhead (ma generalmente trascurabile)
3. **Stack trace meno leggibili**: Le funzioni annidate possono rendere il debugging più complesso

## Conclusione

Le higher-order functions sono uno strumento fondamentale nella programmazione funzionale e in JavaScript moderno. Permettono di creare astrazioni potenti, rendere il codice più modulare e dichiarativo, e implementare pattern riutilizzabili.

Nei prossimi capitoli, esploreremo in dettaglio come utilizzare le higher-order functions in vari contesti, come implementare pattern comuni, e come combinare multiple higher-order functions per risolvere problemi complessi in modo elegante.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Higher-Order Functions](../README.md)
- [➡️ Funzioni come Argomenti](./02-FunzioniComeArgomenti.md)
