# Pattern Comuni e Best Practices

Dopo aver esplorato `map`, `filter` e `reduce` individualmente, è importante comprendere come utilizzarli insieme in modo efficace e secondo le migliori pratiche. Questo capitolo esplora pattern comuni, tecniche di ottimizzazione e approcci per scrivere codice funzionale elegante.

## Componibilità: Il potere delle pipeline di dati

Una delle caratteristiche più potenti della programmazione funzionale è la capacità di comporre operazioni in pipeline di trasformazione dei dati.

```javascript
const transazioni = [
  { id: 1, tipo: 'acquisto', importo: 100, categoria: 'cibo' },
  { id: 2, tipo: 'vendita', importo: 500, categoria: 'tecnologia' },
  { id: 3, tipo: 'acquisto', importo: 50, categoria: 'cibo' },
  { id: 4, tipo: 'acquisto', importo: 200, categoria: 'tecnologia' },
  { id: 5, tipo: 'vendita', importo: 100, categoria: 'servizi' }
];

// Pipeline di operazioni:
// 1. Filtra solo gli acquisti
// 2. Mappa per estrarre importi
// 3. Riduci per calcolare il totale
const totaleAcquisti = transazioni
  .filter(t => t.tipo === 'acquisto')
  .map(t => t.importo)
  .reduce((acc, importo) => acc + importo, 0);

console.log(totaleAcquisti); // 350
```

## Considerazioni sulle performance

### Interrompere le catene quando necessario

Se la catena diventa molto lunga o elabora set di dati molto grandi, può essere utile interrompere la catena per migliorare leggibilità e performance:

```javascript
// Versione con catena unica (meno leggibile con operazioni complesse)
const risultato = dati
  .filter(/* filtro complesso */)
  .map(/* trasformazione complessa */)
  .filter(/* altro filtro complesso */)
  .reduce(/* riduzione complessa */);

// Versione con passaggi intermedi (più leggibile e spesso più performante)
const daFiltro1 = dati.filter(/* filtro complesso */);
const trasformati = daFiltro1.map(/* trasformazione complessa */);
const daFiltro2 = trasformati.filter(/* altro filtro complesso */);
const risultato = daFiltro2.reduce(/* riduzione complessa */);
```

### Ottimizzazione con reduce

A volte è possibile combinare operazioni usando un singolo `reduce` invece di catene multiple:

```javascript
// Versione con catena di operazioni
const sommaQuadratiPari = numeri
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .reduce((acc, n) => acc + n, 0);

// Versione ottimizzata con un solo reduce
const sommaQuadratiPariOttimizzata = numeri.reduce((acc, n) => {
  if (n % 2 === 0) {
    return acc + (n * n);
  }
  return acc;
}, 0);
```

## Pattern comuni

### Trovare il massimo o minimo

```javascript
const numeri = [5, 18, 3, 22, 1];

// Massimo
const massimo = numeri.reduce((max, n) => n > max ? n : max, numeri[0]);
console.log(massimo); // 22

// Minimo
const minimo = numeri.reduce((min, n) => n < min ? n : min, numeri[0]);
console.log(minimo); // 1

// Oggetto con entrambi i valori
const estremi = numeri.reduce((acc, n) => ({
  min: n < acc.min ? n : acc.min,
  max: n > acc.max ? n : acc.max
}), { min: numeri[0], max: numeri[0] });
console.log(estremi); // { min: 1, max: 22 }
```

### Rimozione dei duplicati (unique)

```javascript
const numeriConDuplicati = [1, 2, 2, 3, 4, 4, 5];

// Con filter
const unici1 = numeriConDuplicati.filter((valore, indice, array) => 
  array.indexOf(valore) === indice
);

// Con reduce (più efficiente)
const unici2 = numeriConDuplicati.reduce((acc, corrente) => {
  if (!acc.includes(corrente)) {
    acc.push(corrente);
  }
  return acc;
}, []);

// Con Set (soluzione moderna e concisa)
const unici3 = [...new Set(numeriConDuplicati)];

console.log(unici3); // [1, 2, 3, 4, 5]
```

### Raggruppamento e indicizzazione

```javascript
const studenti = [
  { id: 1, nome: 'Alice', corso: 'Matematica' },
  { id: 2, nome: 'Bob', corso: 'Fisica' },
  { id: 3, nome: 'Carol', corso: 'Matematica' },
  { id: 4, nome: 'Dave', corso: 'Informatica' }
];

// Raggruppamento per corso
const perCorso = studenti.reduce((gruppi, studente) => {
  const corso = studente.corso;
  gruppi[corso] = gruppi[corso] || [];
  gruppi[corso].push(studente);
  return gruppi;
}, {});

// Indicizzazione per ID
const perID = studenti.reduce((indice, studente) => {
  indice[studente.id] = studente;
  return indice;
}, {});

console.log(perCorso.Matematica); // [{ id: 1, ... }, { id: 3, ... }]
console.log(perID[2]); // { id: 2, nome: 'Bob', corso: 'Fisica' }
```

## Best Practices

### 1. Preferire l'immutabilità

```javascript
// Male: Modifica lo stato
function addElemento(array, elemento) {
  array.push(elemento); // modifica l'array originale
  return array;
}

// Bene: Preserva l'immutabilità
function addElemento(array, elemento) {
  return [...array, elemento]; // crea un nuovo array
}
```

### 2. Utilizzare funzioni pure nelle callback

```javascript
// Male: Dipende da stato esterno
let moltiplicatore = 2;
const risultato = numeri.map(n => n * moltiplicatore);

// Bene: Funzione pura senza dipendenze esterne
const moltiplica = (n, m) => n * m;
const risultato = numeri.map(n => moltiplica(n, 2));
```

### 3. Evitare effetti collaterali

```javascript
// Male: Effetto collaterale
const registroOperazioni = [];
const risultato = numeri.map(n => {
  registroOperazioni.push(`Elaborazione di ${n}`); // effetto collaterale
  return n * 2;
});

// Bene: Separare le operazioni dagli effetti
const risultato = numeri.map(n => n * 2);
// Registra separatamente se necessario
const registro = numeri.map(n => `Elaborazione di ${n}`);
```

### 4. Preferire early returns nei predicate

```javascript
// Meno leggibile con condizioni complesse
const adulti = persone.filter(persona => {
  return persona.eta >= 18 && persona.consenso && !persona.bloccato;
});

// Più leggibile e manutenibile
const isAdulto = persona => persona.eta >= 18; 
const haConsenso = persona => persona.consenso;
const nonBloccato = persona => !persona.bloccato;

const adulti = persone
  .filter(isAdulto)
  .filter(haConsenso)
  .filter(nonBloccato);
```

### 5. Usare il valore iniziale appropriato in reduce

```javascript
// Somma: inizia da 0
const somma = numeri.reduce((acc, n) => acc + n, 0);

// Prodotto: inizia da 1
const prodotto = numeri.reduce((acc, n) => acc * n, 1);

// Array: inizia con array vuoto
const pari = numeri.reduce((acc, n) => {
  if (n % 2 === 0) acc.push(n);
  return acc;
}, []);

// Oggetto: inizia con oggetto vuoto
const conteggio = caratteri.reduce((acc, c) => {
  acc[c] = (acc[c] || 0) + 1;
  return acc;
}, {});
```

## Debugging nelle catene funzionali

In caso di catene complesse, può essere difficile identificare dove si verificano problemi. Una tecnica utile è inserire operazioni di logging intermedio:

```javascript
const risultatoFinale = dati
  .filter(item => item.attivo)
  .map(item => {
    console.log('Dopo filter:', item); // Logging per debug
    return trasforma(item);
  })
  .reduce((acc, item) => {
    console.log('Dopo map:', item); // Logging per debug
    return acc + item.valore;
  }, 0);
```

Per un approccio più pulito, si può creare una funzione di utility:

```javascript
const tap = fn => x => {
  fn(x);
  return x;
};

const risultatoFinale = dati
  .filter(item => item.attivo)
  .map(tap(items => console.log('Dopo filter:', items.length, 'items')))
  .map(item => trasforma(item))
  .map(tap(items => console.log('Dopo map:', items.length, 'items')))
  .reduce((acc, item) => acc + item.valore, 0);
```

## Conclusione

Combinando `map`, `filter` e `reduce` in modo appropriato e seguendo queste best practices, è possibile scrivere codice funzionale che è conciso, espressivo e manutenibile. Ricorda che la leggibilità del codice è spesso più importante dell'astuzia o della brevità estrema. Scegli sempre l'approccio che rende più chiaro l'intento del tuo codice.
