# Introduzione al Currying

Il currying è una tecnica fondamentale nella programmazione funzionale che trasforma una funzione che accetta molteplici argomenti in una sequenza di funzioni, ciascuna con un singolo argomento. Questa tecnica prende il nome dal matematico e logico Haskell Curry.

## Cos'è il Currying

In termini semplici, il currying trasforma una funzione del tipo:

```javascript
f(a, b, c)
```

in una funzione del tipo:

```javascript
f(a)(b)(c)
```

Dove ogni chiamata restituisce una nuova funzione che accetta il parametro successivo, fino a quando tutti i parametri sono stati forniti e viene calcolato il risultato finale.

## Esempio Base di Currying

Consideriamo una funzione semplice che somma tre numeri:

```javascript
// Funzione normale con tre argomenti
function somma(a, b, c) {
  return a + b + c;
}

console.log(somma(1, 2, 3)); // Output: 6
```

La versione "curried" di questa funzione sarebbe:

```javascript
// Funzione "curried"
function sommaCurried(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

console.log(sommaCurried(1)(2)(3)); // Output: 6
```

Con le funzioni freccia di ES6, possiamo scrivere questo in modo più conciso:

```javascript
const sommaCurried = a => b => c => a + b + c;

console.log(sommaCurried(1)(2)(3)); // Output: 6
```

## Perché Usare il Currying

Il currying offre diversi vantaggi:

1. **Creazione di funzioni specializzate**: Possiamo creare nuove funzioni specifiche applicando solo alcuni dei parametri richiesti.

```javascript
const aggiungiCinque = sommaCurried(5); // Crea una funzione che aggiunge 5 a due numeri
console.log(aggiungiCinque(10)(20)); // Output: 35
```

2. **Componibilità**: Le funzioni curried sono più facili da comporre insieme.

3. **Applicazione parziale**: Permette di "preconfigurare" funzioni con alcuni parametri e riutilizzarle.

4. **Pulizia del codice**: Può rendere il codice più leggibile e manutenibile, riducendo la ripetizione.

## Implementazione Manuale del Currying

Possiamo implementare una funzione generica `curry` che trasforma qualsiasi funzione in una versione curried:

```javascript
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

// Utilizzo
const sommaTre = function(a, b, c) {
  return a + b + c;
};

const sommaCurried = curry(sommaTre);

console.log(sommaCurried(1)(2)(3)); // Output: 6
console.log(sommaCurried(1, 2)(3)); // Output: 6
console.log(sommaCurried(1)(2, 3)); // Output: 6
console.log(sommaCurried(1, 2, 3)); // Output: 6
```

Questa implementazione è molto potente perché permette di fornire i parametri in qualsiasi combinazione, purché alla fine vengano forniti tutti i parametri necessari.

## Currying e Arietà

L'arietà di una funzione è il numero di parametri che accetta. Il currying funziona bene con funzioni di arietà fissa, cioè funzioni che hanno un numero specifico di parametri.

Questo è un aspetto importante da considerare quando si lavora con funzioni curried: è necessario conoscere il numero esatto di parametri che la funzione originale si aspetta.

## Currying vs Applicazione Parziale

Anche se spesso vengono confusi, il currying e l'applicazione parziale sono concetti separati:

- **Currying**: Trasforma una funzione con n argomenti in una sequenza di n funzioni, ciascuna con un singolo argomento.
- **Applicazione Parziale**: Applica alcuni degli argomenti a una funzione, restituendo una nuova funzione che accetta i restanti argomenti.

Una funzione curried facilita l'applicazione parziale, ma non sono la stessa cosa.

## Vantaggi della Programmazione con Funzioni Curried

1. **Riutilizzo del codice**: Crea facilmente varianti di una funzione senza duplicare la logica.
2. **Data-last style**: Posizionando i dati come ultimo parametro, puoi creare funzioni di utilità che operano su dati variabili.
3. **Riduzione della complessità**: Scompone funzioni complesse in pezzi più piccoli e gestibili.
4. **Maggiore testabilità**: Le funzioni curried sono più facili da testare in isolamento.

Nel prossimo capitolo, esploreremo in dettaglio l'applicazione parziale delle funzioni e come utilizzarla efficacemente.
