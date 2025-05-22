# Map: Trasformazione dei Dati

La funzione `map` è uno strumento fondamentale nella programmazione funzionale che ci permette di trasformare ogni elemento di un array in un nuovo valore, generando un nuovo array di pari lunghezza.

## Sintassi di base

```javascript
const nuovoArray = array.map(callback);

// Dove callback è una funzione che prende fino a tre argomenti:
// - elemento corrente
// - indice dell'elemento corrente (opzionale)
// - array originale (opzionale)
```

## Come funziona Map

1. La funzione `map` itera su ogni elemento dell'array originale
2. Applica la funzione callback a ciascun elemento
3. Costruisce un nuovo array con i valori restituiti dalla callback
4. Restituisce il nuovo array, mantenendo l'originale inalterato

## Esempi di base

### Raddoppiare ogni numero in un array

```javascript
const numeri = [1, 2, 3, 4, 5];
const doppi = numeri.map(numero => numero * 2);
console.log(doppi); // [2, 4, 6, 8, 10]
console.log(numeri); // [1, 2, 3, 4, 5] - l'originale non cambia
```

### Estrarre una proprietà da un array di oggetti

```javascript
const utenti = [
  { id: 1, nome: 'Alice', eta: 25 },
  { id: 2, nome: 'Bob', eta: 30 },
  { id: 3, nome: 'Carol', eta: 35 }
];

const nomi = utenti.map(utente => utente.nome);
console.log(nomi); // ['Alice', 'Bob', 'Carol']
```

### Utilizzo di tutti i parametri della callback

```javascript
const numeri = [10, 20, 30];
const dettagli = numeri.map((valore, indice, array) => {
  return {
    valore,
    indice,
    doppio: valore * 2,
    originale: array
  };
});

console.log(dettagli);
/* Output:
[
  { valore: 10, indice: 0, doppio: 20, originale: [10, 20, 30] },
  { valore: 20, indice: 1, doppio: 40, originale: [10, 20, 30] },
  { valore: 30, indice: 2, doppio: 60, originale: [10, 20, 30] }
]
*/
```

## Casi d'uso comuni

1. **Formattazione di dati**: Trasformare dati grezzi in un formato adatto all'interfaccia utente
2. **Calcoli batch**: Applicare la stessa operazione matematica a tutti gli elementi
3. **Creazione di strutture derivate**: Generare nuove strutture a partire da dati esistenti
4. **Normalizzazione dei dati**: Standardizzare formati o unità di misura

## Vantaggi rispetto ai cicli tradizionali

```javascript
// Approccio imperativo
const numeri = [1, 2, 3, 4, 5];
const risultati = [];
for (let i = 0; i < numeri.length; i++) {
  risultati.push(numeri[i] * 2);
}

// Approccio funzionale con map
const numeri = [1, 2, 3, 4, 5];
const risultati = numeri.map(n => n * 2);
```

I vantaggi dell'approccio con `map` sono:

1. **Brevità**: Meno codice da scrivere e mantenere
2. **Chiarezza**: L'intento è immediatamente chiaro
3. **Immutabilità**: Non c'è rischio di modificare accidentalmente l'array originale
4. **Nessun effetto collaterale**: Non sono necessarie variabili esterne o contatori

## Implementazione di map da zero

Per comprendere meglio come funziona internamente, possiamo implementare una versione semplice di `map`:

```javascript
function mapPersonalizzato(array, callback) {
  const risultato = [];
  for (let i = 0; i < array.length; i++) {
    risultato.push(callback(array[i], i, array));
  }
  return risultato;
}

// Utilizzo
const numeri = [1, 2, 3, 4, 5];
const doppi = mapPersonalizzato(numeri, n => n * 2);
console.log(doppi); // [2, 4, 6, 8, 10]
```

Questa implementazione aiuta a chiarire che `map` è fondamentalmente un'astrazione su un ciclo, che gestisce la creazione dell'array risultante e l'applicazione della callback.
