# Reduce: Aggregazione dei Dati

La funzione `reduce` è forse la più potente e versatile delle tre funzioni fondamentali della programmazione funzionale. Mentre `map` trasforma e `filter` seleziona, `reduce` aggrega i dati in un singolo valore risultante, che può essere di qualsiasi tipo: un numero, una stringa, un oggetto o persino un nuovo array.

## Sintassi di base

```javascript
const risultato = array.reduce(callback, valoreIniziale);

// Dove callback è una funzione che prende fino a quattro argomenti:
// - accumulatore (il valore restituito dalla callback precedente)
// - elemento corrente
// - indice dell'elemento corrente (opzionale)
// - array originale (opzionale)
// e valoreIniziale è il valore con cui inizia l'accumulatore
```

## Come funziona Reduce

1. La funzione `reduce` itera su ogni elemento dell'array originale
2. Mantiene un "accumulatore" che viene aggiornato ad ogni iterazione
3. Applica la funzione callback a ciascun elemento, passando l'accumulatore attuale e l'elemento corrente
4. Il valore restituito dalla callback diventa il nuovo valore dell'accumulatore
5. Dopo aver elaborato tutti gli elementi, restituisce il valore finale dell'accumulatore

## L'importanza del valore iniziale

Il parametro `valoreIniziale` è opzionale, ma è fortemente consigliato specificarlo sempre per:
- Evitare errori con array vuoti
- Assicurare il tipo corretto per l'accumulatore fin dall'inizio
- Rendere il codice più chiaro e predicibile

```javascript
// Senza valore iniziale (il primo elemento diventa il valore iniziale)
const numeri = [1, 2, 3, 4];
const somma1 = numeri.reduce((acc, n) => acc + n); // acc inizia con 1
console.log(somma1); // 10

// Con valore iniziale
const somma2 = numeri.reduce((acc, n) => acc + n, 0); // acc inizia con 0
console.log(somma2); // 10

// Con array vuoto
const vuoto = [];
// const sommaErrore = vuoto.reduce((acc, n) => acc + n); // Error: Reduce of empty array with no initial value
const sommaOK = vuoto.reduce((acc, n) => acc + n, 0); // OK, restituisce 0
```

## Esempi di base

### Somma di numeri

```javascript
const numeri = [1, 2, 3, 4, 5];
const somma = numeri.reduce((accumulatore, numero) => accumulatore + numero, 0);
console.log(somma); // 15
```

### Calcolo della media

```javascript
const numeri = [10, 20, 30, 40, 50];
const media = numeri.reduce((acc, val, index, array) => {
  acc += val;
  if (index === array.length - 1) {
    return acc / array.length;
  }
  return acc;
}, 0);

console.log(media); // 30
```

### Conteggio occorrenze

```javascript
const frutta = ['mela', 'banana', 'mela', 'arancia', 'banana', 'mela'];
const conteggio = frutta.reduce((acc, frutto) => {
  acc[frutto] = (acc[frutto] || 0) + 1;
  return acc;
}, {});

console.log(conteggio); // { mela: 3, banana: 2, arancia: 1 }
```

### Appiattimento di array annidati

```javascript
const arrayAnnidato = [[1, 2], [3, 4], [5, 6]];
const appiattito = arrayAnnidato.reduce((acc, array) => acc.concat(array), []);
console.log(appiattito); // [1, 2, 3, 4, 5, 6]
```

## Casi d'uso avanzati

### Concatenazione di stringhe

```javascript
const parole = ['Programmazione', 'funzionale', 'in', 'JavaScript'];
const frase = parole.reduce((acc, parola) => `${acc} ${parola}`, '').trim();
console.log(frase); // 'Programmazione funzionale in JavaScript'
```

### Raggruppamento di oggetti

```javascript
const persone = [
  { nome: 'Alice', dipartimento: 'IT' },
  { nome: 'Bob', dipartimento: 'HR' },
  { nome: 'Carol', dipartimento: 'IT' },
  { nome: 'Dave', dipartimento: 'Marketing' }
];

const perDipartimento = persone.reduce((acc, persona) => {
  const { dipartimento } = persona;
  acc[dipartimento] = acc[dipartimento] || [];
  acc[dipartimento].push(persona);
  return acc;
}, {});

console.log(perDipartimento);
/* Output:
{
  IT: [
    { nome: 'Alice', dipartimento: 'IT' },
    { nome: 'Carol', dipartimento: 'IT' }
  ],
  HR: [{ nome: 'Bob', dipartimento: 'HR' }],
  Marketing: [{ nome: 'Dave', dipartimento: 'Marketing' }]
}
*/
```

### Costruzione di strutture complesse

```javascript
const dati = [
  { id: 1, nome: 'Prodotto A', categoria: 'Elettronica' },
  { id: 2, nome: 'Prodotto B', categoria: 'Abbigliamento' },
  { id: 3, nome: 'Prodotto C', categoria: 'Elettronica' }
];

const struttura = dati.reduce((acc, item) => {
  // Aggiunge categoria se non esiste
  if (!acc.categorie.includes(item.categoria)) {
    acc.categorie.push(item.categoria);
  }
  
  // Aggiunge prodotto alla mappa
  acc.prodotti[item.id] = item;
  
  // Aggiunge prodotto all'indice per categoria
  if (!acc.perCategoria[item.categoria]) {
    acc.perCategoria[item.categoria] = [];
  }
  acc.perCategoria[item.categoria].push(item.id);
  
  return acc;
}, {
  categorie: [],
  prodotti: {},
  perCategoria: {}
});

console.log(struttura);
/* Output:
{
  categorie: ['Elettronica', 'Abbigliamento'],
  prodotti: {
    '1': { id: 1, nome: 'Prodotto A', categoria: 'Elettronica' },
    '2': { id: 2, nome: 'Prodotto B', categoria: 'Abbigliamento' },
    '3': { id: 3, nome: 'Prodotto C', categoria: 'Elettronica' }
  },
  perCategoria: {
    'Elettronica': [1, 3],
    'Abbigliamento': [2]
  }
}
*/
```

## Implementazione da zero

Per capire meglio il funzionamento interno, ecco una semplice implementazione di `reduce`:

```javascript
function reducePersonalizzato(array, callback, valoreIniziale) {
  let accumulatore = valoreIniziale;
  let indiceIniziale = 0;
  
  // Se non è fornito un valore iniziale, usa il primo elemento come accumulatore iniziale
  if (arguments.length < 3) {
    if (array.length === 0) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulatore = array[0];
    indiceIniziale = 1;
  }
  
  // Itera sull'array a partire dall'indice appropriato
  for (let i = indiceIniziale; i < array.length; i++) {
    accumulatore = callback(accumulatore, array[i], i, array);
  }
  
  return accumulatore;
}

// Utilizzo
const numeri = [1, 2, 3, 4, 5];
const somma = reducePersonalizzato(numeri, (acc, n) => acc + n, 0);
console.log(somma); // 15
```

## Reduce vs Map e Filter

Un aspetto interessante è che `reduce` è sufficientemente potente da poter implementare sia `map` che `filter`:

```javascript
// Implementare map con reduce
function mapConReduce(array, callback) {
  return array.reduce((acc, val, i, arr) => {
    acc.push(callback(val, i, arr));
    return acc;
  }, []);
}

// Implementare filter con reduce
function filterConReduce(array, callback) {
  return array.reduce((acc, val, i, arr) => {
    if (callback(val, i, arr)) {
      acc.push(val);
    }
    return acc;
  }, []);
}

// Esempio di utilizzo
const numeri = [1, 2, 3, 4, 5];
console.log(mapConReduce(numeri, n => n * 2)); // [2, 4, 6, 8, 10]
console.log(filterConReduce(numeri, n => n % 2 === 0)); // [2, 4]
```

Questo dimostra la potenza e versatilità di `reduce` come strumento fondamentale della programmazione funzionale.
