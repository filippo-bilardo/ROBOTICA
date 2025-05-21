# Funzioni Pure vs Impure

Le funzioni pure sono uno dei concetti fondamentali della programmazione funzionale, e comprendere la differenza tra funzioni pure e impure è essenziale per scrivere codice in stile funzionale.

## Definizione di Funzione Pura

Una funzione si definisce "pura" quando soddisfa due criteri fondamentali:

1. **Determinismo**: dato lo stesso input, restituisce sempre lo stesso output.
2. **Nessun effetto collaterale**: non modifica alcun stato al di fuori del proprio scope, né si basa su esso.

In altre parole, una funzione pura è completamente prevedibile, indipendente dal contesto e non ha alcun "effetto nascosto" sul resto del programma.

## Esempi di Funzioni Pure

### Esempio 1: Funzione Matematica Semplice

```javascript
function somma(a, b) {
  return a + b;
}
```

Questa funzione è pura perché:
- Il risultato dipende solo dagli argomenti di input
- Non modifica niente al di fuori della funzione
- Data la stessa coppia di valori, restituisce sempre lo stesso risultato

### Esempio 2: Operazioni su Array con Approccio Puro

```javascript
function addItem(array, item) {
  return [...array, item];  // Crea un nuovo array invece di modificare quello originale
}
```

Questa funzione è pura perché non modifica l'array originale, ma ne restituisce uno nuovo con l'elemento aggiunto.

## Cosa Rende una Funzione Impura

Una funzione è impura quando:

1. Modifica variabili esterne alla funzione
2. Modifica gli argomenti passati per riferimento
3. Dipende da stati esterni (come variabili globali o stato dell'applicazione)
4. Produce effetti collaterali come operazioni di I/O (scrittura di file, network requests, ecc.)

## Esempi di Funzioni Impure

### Esempio 1: Modifica di Variabili Esterne

```javascript
let totale = 0;

function aggiungiAlTotale(valore) {
  totale += valore;  // Modifica una variabile esterna
  return totale;
}
```

Questa funzione è impura perché:
- Modifica la variabile `totale` che è esterna alla funzione
- Il risultato dipende non solo dall'input ma anche dallo stato attuale di `totale`

### Esempio 2: Operazioni di I/O

```javascript
function salvaUtente(utente) {
  localStorage.setItem('utente', JSON.stringify(utente));  // Interazione con il browser
  return utente;
}
```

Questa funzione è impura perché:
- Interagisce con il localStorage (effetto collaterale)
- Se il localStorage non è disponibile, la funzione si comporta diversamente

### Esempio 3: Modifica di Argomenti Passati per Riferimento

```javascript
function ordina(array) {
  return array.sort();  // Modifica l'array originale!
}
```

Questa funzione è impura perché:
- Modifica l'array originale passato come argomento
- Ha un effetto collaterale (l'array originale è cambiato dopo la chiamata)

## Confronto tra Funzioni Pure e Impure

Per illustrare meglio la differenza, confrontiamo versioni pure e impure della stessa funzionalità:

### Operazioni su Array

**Versione impura**:
```javascript
function aggiungiElemento(array, elemento) {
  array.push(elemento);
  return array;
}
```

**Versione pura**:
```javascript
function aggiungiElemento(array, elemento) {
  return [...array, elemento];
}
```

### Generazione di Numeri Casuali

**Versione impura**:
```javascript
function numeroCasuale(max) {
  return Math.floor(Math.random() * max);  // Dipende da un generatore casuale esterno
}
```

**Versione pura** (con stato esplicito):
```javascript
function numeroCasuale(seed, max) {
  // Implementazione di un generatore deterministico di pseudo-casualità basato sul seed
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);
  const nextSeed = (a * seed + c) % m;
  return {
    nextSeed: nextSeed,
    valore: Math.floor((nextSeed / m) * max)
  };
}
```

## Vantaggi delle Funzioni Pure

### 1. Prevedibilità

Le funzioni pure sono completamente prevedibili: dato un certo input, sappiamo esattamente quale sarà l'output, sempre. Questo rende più facile ragionare sul codice.

### 2. Testabilità

Le funzioni pure sono estremamente facili da testare perché:
- Non richiedono setup complessi dell'ambiente
- Non richiedono mocking di dipendenze esterne
- I test sono ripetibili e deterministi

```javascript
// Testare una funzione pura è semplice
test('somma 2 e 3 deve dare 5', () => {
  expect(somma(2, 3)).toBe(5);
});
```

### 3. Caching e Memoization

Dato che le funzioni pure restituiscono sempre lo stesso output per lo stesso input, è possibile memorizzare (cache) i risultati per migliorare le performance:

```javascript
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const fattorialeMemoizzato = memoize((n) => {
  if (n <= 1) return 1;
  return n * fattorialeMemoizzato(n - 1);
});
```

### 4. Parallelizzazione

Le funzioni pure non dipendono da uno stato condiviso e non hanno effetti collaterali, quindi possono essere eseguite in parallelo senza rischi.

### 5. Composizione Semplificata

Le funzioni pure sono facili da comporre insieme per creare funzionalità più complesse.

## Il Pragmatismo nella Programmazione Funzionale in JavaScript

JavaScript non è un linguaggio puramente funzionale, e spesso è necessario interagire con APIs che producono effetti collaterali. Un approccio pratico è:

1. **Isolare l'impurità**: Concentrare gli effetti collaterali in specifiche parti del programma
2. **Funzioni principalmente pure**: Mantenere la maggior parte delle funzioni pure
3. **Effetti collaterali espliciti**: Rendere evidenti gli effetti collaterali nel nome o nei commenti della funzione

```javascript
// Isolare gli effetti collaterali
function leggiFileImpuro(percorso) {
  // Qui c'è un effetto collaterale esplicito - interazione con il filesystem
  return fs.readFileSync(percorso, 'utf8');
}

// Resto del programma con funzioni pure
function elaboraDati(dati) {
  return dati.split('\n').filter(riga => riga.trim() !== '').map(parsaRiga);
}

function parsaRiga(riga) {
  return riga.split(',').map(campo => campo.trim());
}

// Composizione
const dati = elaboraDati(leggiFileImpuro('dati.csv'));
```

## Conclusione

Le funzioni pure sono un pilastro della programmazione funzionale, offrendo prevedibilità, testabilità e componibilità. Riconoscere la differenza tra funzioni pure e impure è il primo passo per scrivere codice in stile funzionale.

Anche se non sempre è possibile o pratico scrivere codice completamente puro in JavaScript, cercare di massimizzare l'uso di funzioni pure e isolare le parti impure del programma porta a codice più manutenibile, testabile e comprensibile.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Funzioni Pure e Immutabilità](../README.md)
- [➡️ Effetti Collaterali](./02-EffettiCollaterali.md)
