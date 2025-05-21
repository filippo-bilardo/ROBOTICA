# Funzioni che Restituiscono Funzioni

Nella programmazione funzionale, una delle caratteristiche più potenti delle higher-order functions è la capacità di restituire altre funzioni come risultato. Questo concetto è fondamentale per tecniche avanzate come il currying, la composizione di funzioni e la creazione di factory di funzioni.

## Fondamenti

Una funzione che restituisce un'altra funzione crea essenzialmente una "fabbrica di funzioni". Quando invochiamo la funzione esterna, otteniamo in cambio una nuova funzione che possiamo utilizzare successivamente.

```javascript
function creaMoltiplicatore(fattore) {
    // Restituisce una funzione che moltiplica il suo argomento per il fattore
    return function(numero) {
        return numero * fattore;
    };
}

const doppio = creaMoltiplicatore(2);
const triplo = creaMoltiplicatore(3);

console.log(doppio(5));  // Output: 10
console.log(triplo(5));  // Output: 15
```

In questo esempio, `creaMoltiplicatore` è una higher-order function che restituisce una funzione. Ogni funzione restituita "ricorda" il valore di `fattore` con cui è stata creata grazie alla chiusura lessicale (closure).

## Closure (Chiusure)

Una closure si verifica quando una funzione "ricorda" e continua ad accedere alle variabili del suo scope esterno, anche dopo che la funzione esterna ha terminato l'esecuzione.

```javascript
function contatore() {
    let count = 0;
    
    return {
        incrementa: function() { return ++count; },
        decremente: function() { return --count; },
        valore: function() { return count; }
    };
}

const mioContatore = contatore();
console.log(mioContatore.incrementa());  // 1
console.log(mioContatore.incrementa());  // 2
console.log(mioContatore.decremente());  // 1
```

Qui, le funzioni restituite mantengono l'accesso alla variabile `count` anche dopo che `contatore()` ha terminato l'esecuzione.

## Factory di Funzioni

Le funzioni che restituiscono funzioni sono spesso chiamate "factory di funzioni" perché producono funzioni specializzate in base ai parametri forniti.

```javascript
function creaValidatore(regex) {
    return function(testo) {
        return regex.test(testo);
    };
}

const isEmail = creaValidatore(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const isNumeroTelefono = creaValidatore(/^\d{10}$/);

console.log(isEmail("esempio@dominio.com"));  // true
console.log(isNumeroTelefono("1234567890"));  // true
```

## Configurare Comportamenti

Restituire funzioni permette di configurare comportamenti in modo dinamico:

```javascript
function creaFormattatore(prefisso, suffisso) {
    return function(testo) {
        return `${prefisso}${testo}${suffisso}`;
    };
}

const formattaHTML = creaFormattatore("<div>", "</div>");
const formattaParenthesi = creaFormattatore("(", ")");

console.log(formattaHTML("Contenuto"));  // <div>Contenuto</div>
console.log(formattaParenthesi("nota"));  // (nota)
```

## Memorizzazione (Memoization)

Una tecnica avanzata che sfrutta le funzioni che restituiscono funzioni è la memorizzazione, che permette di cachare i risultati di chiamate a funzioni costose:

```javascript
function memoize(fn) {
    const cache = {};
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache[key] === undefined) {
            cache[key] = fn(...args);
        }
        
        return cache[key];
    };
}

// Esempio di utilizzo con una funzione costosa
const fattoriale = memoize(function(n) {
    if (n <= 1) return 1;
    return n * this(n - 1);  // this si riferisce alla funzione memoizzata
});
```

## Vantaggi

- **Incapsulamento**: La funzione interna ha accesso allo scope della funzione esterna
- **Personalizzazione**: Permette di creare funzioni specializzate con comportamenti configurabili
- **Riutilizzabilità**: Facilita la creazione di diverse varianti di una funzione base
- **Programmazione modulare**: Aiuta a comporre funzioni più complesse da funzioni più semplici

## Considerazioni

Quando si utilizzano funzioni che restituiscono funzioni, è importante considerare:

- **Complessità**: Un uso eccessivo può rendere il codice più difficile da seguire
- **Gestione della memoria**: Le closure mantengono in memoria le variabili dello scope esterno
- **Debuggabilità**: Le funzioni annidate possono essere più difficili da debuggare

## Navigazione del Corso
- [📑 Indice](/home/git-projects/JS-FunctionalProgramming/README.md)
- [⬅️ Funzioni come Argomenti](/home/git-projects/JS-FunctionalProgramming/03-HigherOrderFunctions/teoria/02-FunzioniComeArgomenti.md)
- [➡️ Pattern Comuni HOF](/home/git-projects/JS-FunctionalProgramming/03-HigherOrderFunctions/teoria/04-PatternComuniHOF.md)
