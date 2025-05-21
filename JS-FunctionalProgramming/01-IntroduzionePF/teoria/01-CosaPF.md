# Cos'è la Programmazione Funzionale

La programmazione funzionale è un paradigma di programmazione che tratta il calcolo come la valutazione di funzioni matematiche ed evita il cambiamento di stato e i dati mutabili. È un approccio dichiarativo alla programmazione, che si concentra su "cosa fare" piuttosto che su "come farlo".

## Principi Fondamentali

### 1. Funzioni come Cittadini di Prima Classe

In un linguaggio di programmazione funzionale, le funzioni sono considerate cittadini di prima classe (first-class citizens). Questo significa che le funzioni:

- Possono essere assegnate a variabili
- Possono essere passate come argomenti ad altre funzioni
- Possono essere restituite da altre funzioni
- Possono essere memorizzate in strutture dati

```javascript
// Funzione assegnata a una variabile
const somma = function(a, b) {
  return a + b;
};

// Funzione passata come argomento
const operazioneSuArray = (array, operazione) => array.map(operazione);

// Funzione che restituisce una funzione
const creaIncrementer = (incremento) => (numero) => numero + incremento;
const incrementaDi5 = creaIncrementer(5);
console.log(incrementaDi5(10)); // Output: 15
```

### 2. Immutabilità

L'immutabilità è un concetto fondamentale della programmazione funzionale che si riferisce all'impossibilità di cambiare lo stato di un oggetto dopo che è stato creato. Invece di modificare dati esistenti, nella programmazione funzionale si creano nuove strutture dati.

```javascript
// Approccio non funzionale (mutabile)
const aggiungiElemento = (array, elemento) => {
  array.push(elemento); // Modifica l'array originale
  return array;
};

// Approccio funzionale (immutabile)
const aggiungiElementoImmutabile = (array, elemento) => {
  return [...array, elemento]; // Crea e restituisce un nuovo array
};
```

### 3. Funzioni Pure

Le funzioni pure sono funzioni che:
- Dato lo stesso input, restituiscono sempre lo stesso output (determinismo)
- Non hanno effetti collaterali (non modificano lo stato al di fuori del loro scope)

```javascript
// Funzione impura
let contatore = 0;
function incrementaContatore() {
  contatore++;  // Effetto collaterale: modifica una variabile esterna
  return contatore;
}

// Funzione pura
function somma(a, b) {
  return a + b;  // Dato lo stesso input, restituisce sempre lo stesso output
}
```

### 4. Ricorsione

Nella programmazione funzionale, la ricorsione è spesso preferita ai cicli iterativi, poiché non richiede la modifica di variabili.

```javascript
// Calcolo del fattoriale con ricorsione
function fattoriale(n) {
  if (n <= 1) return 1;
  return n * fattoriale(n - 1);
}
```

### 5. Composizione di Funzioni

La composizione di funzioni consiste nel combinare due o più funzioni per creare una nuova funzione più complessa.

```javascript
// Composizione manuale
const componi = (f, g) => x => f(g(x));

const addizione = x => x + 2;
const moltiplicazione = x => x * 3;

const operazioneComposta = componi(addizione, moltiplicazione);
console.log(operazioneComposta(5)); // (5 * 3) + 2 = 17
```

## Vantaggi della Programmazione Funzionale

1. **Prevedibilità**: Le funzioni pure producono risultati prevedibili e coerenti.
2. **Facilità di Testing**: Le funzioni pure sono intrinsecamente facili da testare.
3. **Concorrenza**: L'immutabilità e l'assenza di stato rendono il codice funzionale naturalmente adatto alla programmazione concorrente.
4. **Debugging facilitato**: L'assenza di effetti collaterali rende più facile identificare l'origine di un bug.
5. **Riusabilità**: Le funzioni pure con responsabilità singole sono più facilmente riutilizzabili.

## Sfide e Considerazioni

Nonostante i suoi vantaggi, la programmazione funzionale presenta alcune sfide:

1. **Curva di Apprendimento**: Per chi proviene da paradigmi imperativi, il passaggio alla programmazione funzionale può richiedere un cambio significativo di mentalità.
2. **Performance**: In alcuni casi, l'immutabilità può comportare un costo in termini di performance, specialmente con grandi strutture dati.
3. **Interazione col Mondo Esterno**: In un'applicazione reale, le interazioni con il database, l'I/O e altre operazioni con effetti collaterali sono inevitabili e devono essere gestite adeguatamente.

## Conclusione

La programmazione funzionale non è solo un insieme di tecniche, ma una filosofia di programmazione che enfatizza la chiarezza, la modularità e la prevedibilità. Adottare principi funzionali può portare a codice più robusto, testabile e manutenibile, anche quando si lavora in linguaggi che non sono puramente funzionali come JavaScript.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Introduzione alla Programmazione Funzionale](../README.md)
- [➡️ Storia e Evoluzione](./02-StoriaEvoluzione.md)
