# Filter: Filtraggio dei Dati

La funzione `filter` è un potente strumento della programmazione funzionale che permette di selezionare elementi da un array in base a un criterio specifico, creando un nuovo array contenente solo gli elementi che soddisfano tale criterio.

## Sintassi di base

```javascript
const nuovoArray = array.filter(callback);

// Dove callback è una funzione che prende fino a tre argomenti:
// - elemento corrente
// - indice dell'elemento corrente (opzionale)
// - array originale (opzionale)
// e restituisce true o false
```

## Come funziona Filter

1. La funzione `filter` itera su ogni elemento dell'array originale
2. Applica la funzione callback a ciascun elemento
3. Se la callback restituisce `true`, l'elemento viene incluso nel nuovo array
4. Se la callback restituisce `false`, l'elemento viene escluso
5. Restituisce un nuovo array contenente solo gli elementi che hanno passato il test

## Esempi di base

### Filtrare numeri pari

```javascript
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const pari = numeri.filter(numero => numero % 2 === 0);
console.log(pari); // [2, 4, 6, 8, 10]
console.log(numeri); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] - l'originale non cambia
```

### Filtrare oggetti in base a una proprietà

```javascript
const prodotti = [
  { nome: 'Laptop', prezzo: 1200, disponibile: true },
  { nome: 'Telefono', prezzo: 800, disponibile: false },
  { nome: 'Tablet', prezzo: 500, disponibile: true },
  { nome: 'Monitor', prezzo: 300, disponibile: true }
];

// Prodotti disponibili
const disponibili = prodotti.filter(prodotto => prodotto.disponibile);
console.log(disponibili);
/* Output:
[
  { nome: 'Laptop', prezzo: 1200, disponibile: true },
  { nome: 'Tablet', prezzo: 500, disponibile: true },
  { nome: 'Monitor', prezzo: 300, disponibile: true }
]
*/

// Prodotti con prezzo inferiore a 1000
const economici = prodotti.filter(prodotto => prodotto.prezzo < 1000);
console.log(economici);
/* Output:
[
  { nome: 'Telefono', prezzo: 800, disponibile: false },
  { nome: 'Tablet', prezzo: 500, disponibile: true },
  { nome: 'Monitor', prezzo: 300, disponibile: true }
]
*/
```

### Utilizzo di tutti i parametri della callback

```javascript
const numeri = [10, 20, 30, 40, 50];
const risultato = numeri.filter((valore, indice, array) => {
  // Seleziona elementi con indice pari e valore maggiore della media dell'array
  const media = array.reduce((acc, val) => acc + val, 0) / array.length;
  return indice % 2 === 0 && valore > media;
});

console.log(risultato); // [40, 50] (elementi con indice 3 e 4, con valori maggiori della media 30)
```

## Casi d'uso comuni

1. **Ricerca di elementi**: Trovare elementi che soddisfano criteri specifici
2. **Rimozione di valori non validi**: Eliminare valori null, undefined, o che non soddisfano condizioni
3. **Segmentazione dei dati**: Separare dati in categorie o subset
4. **Validazione**: Verificare quali elementi soddisfano determinati criteri

## Vantaggi rispetto ai cicli tradizionali

```javascript
// Approccio imperativo
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const pari = [];
for (let i = 0; i < numeri.length; i++) {
  if (numeri[i] % 2 === 0) {
    pari.push(numeri[i]);
  }
}

// Approccio funzionale con filter
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const pari = numeri.filter(n => n % 2 === 0);
```

I vantaggi dell'approccio con `filter` sono:

1. **Espressività**: Il codice esprime chiaramente l'intento di selezione
2. **Nessuna variabile temporanea**: Non è necessario gestire un array di risultati manualmente
3. **Meno probabilità di errore**: Si evitano errori comuni nei cicli come off-by-one o condizioni mal implementate
4. **Immutabilità**: L'array originale rimane intatto

## Implementazione di filter da zero

Per comprendere meglio come funziona internamente, possiamo implementare una versione semplice di `filter`:

```javascript
function filterPersonalizzato(array, callback) {
  const risultato = [];
  for (let i = 0; i < array.length; i++) {
    if (callback(array[i], i, array)) {
      risultato.push(array[i]);
    }
  }
  return risultato;
}

// Utilizzo
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const pari = filterPersonalizzato(numeri, n => n % 2 === 0);
console.log(pari); // [2, 4, 6, 8, 10]
```

Questa implementazione mostra che `filter` è essenzialmente un ciclo con un test condizionale che determina quali elementi includere nell'array risultante.
