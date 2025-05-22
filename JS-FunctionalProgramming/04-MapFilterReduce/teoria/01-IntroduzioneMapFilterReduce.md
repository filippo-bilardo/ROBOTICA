# Introduzione a Map, Filter e Reduce

Le funzioni `map`, `filter` e `reduce` sono fondamentali nella programmazione funzionale e rappresentano un potente strumento per lavorare con le collezioni di dati come gli array. Queste funzioni di ordine superiore permettono di manipolare i dati in modo dichiarativo, senza modificare lo stato originale.

## Cos'è Map, Filter, Reduce

Queste tre funzioni rappresentano un paradigma di elaborazione dei dati che permette di:

1. **Map**: Trasformare ogni elemento di una collezione in un altro valore
2. **Filter**: Selezionare elementi da una collezione in base a un criterio
3. **Reduce**: Aggregare una collezione in un singolo valore

## Da imperativo a funzionale

### Approccio Imperativo
```javascript
const numeri = [1, 2, 3, 4, 5];
const risultato = [];

for (let i = 0; i < numeri.length; i++) {
  if (numeri[i] % 2 === 0) {          // Filter
    risultato.push(numeri[i] * 2);    // Map
  }
}

let somma = 0;
for (let i = 0; i < risultato.length; i++) {
  somma += risultato[i];              // Reduce
}

console.log(somma); // 12 (2*2 + 4*2)
```

### Approccio Funzionale
```javascript
const numeri = [1, 2, 3, 4, 5];

const somma = numeri
  .filter(n => n % 2 === 0)     // Filtra i numeri pari
  .map(n => n * 2)              // Moltiplica per 2
  .reduce((acc, n) => acc + n, 0); // Somma tutti i valori

console.log(somma); // 12 (2*2 + 4*2)
```

## Vantaggi dell'approccio funzionale

1. **Chiarezza e leggibilità**: Il codice esprime chiaramente l'intento senza perdersi nei dettagli implementativi
2. **Immutabilità**: I dati originali non vengono mai modificati
3. **Componibilità**: Le operazioni possono essere facilmente composte in una pipeline di trasformazioni
4. **Meno errori**: Eliminando i cicli e le variabili di contatore, si riducono le possibilità di errore
5. **Testabilità**: È più facile testare singole trasformazioni pure

## Storia e contesto

Queste funzioni hanno origine nel linguaggio Lisp negli anni '60, ma sono state rese popolari in linguaggi funzionali come Haskell e Scheme. JavaScript le ha integrate con ECMAScript 5 (2009), rendendole parte integrante del linguaggio.

Oggi, `map`, `filter` e `reduce` sono considerate funzioni essenziali in qualsiasi linguaggio che supporti la programmazione funzionale e sono ampiamente utilizzate nello sviluppo JavaScript moderno.

Nei prossimi capitoli, esploreremo in dettaglio ciascuna di queste funzioni.
