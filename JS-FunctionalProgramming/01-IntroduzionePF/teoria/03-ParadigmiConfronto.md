# Paradigmi a Confronto

Nel mondo della programmazione esistono diversi approcci o "paradigmi" per risolvere i problemi. Ogni paradigma offre un modo diverso di pensare alla struttura del codice e alla risoluzione dei problemi. Confrontare questi paradigmi aiuta a comprendere meglio i vantaggi specifici della programmazione funzionale e quando è opportuno applicarla.

## I Principali Paradigmi di Programmazione

### 1. Programmazione Imperativa

La programmazione imperativa si concentra su **come** eseguire le operazioni attraverso istruzioni che cambiano lo stato del programma.

**Caratteristiche principali:**
- Utilizza variabili che cambiano valore nel tempo
- Si basa su istruzioni sequenziali
- Usa strutture di controllo come cicli e condizionali
- Modifica lo stato del programma durante l'esecuzione

**Esempio in JavaScript:**
```javascript
function calcolaSommaQuadrati(numeri) {
  let risultato = 0;
  for (let i = 0; i < numeri.length; i++) {
    risultato += numeri[i] * numeri[i];
  }
  return risultato;
}

const numeri = [1, 2, 3, 4];
console.log(calcolaSommaQuadrati(numeri)); // 30
```

### 2. Programmazione Orientata agli Oggetti (OOP)

La programmazione orientata agli oggetti organizza il codice in "oggetti" che contengono sia dati (attributi) che comportamenti (metodi).

**Caratteristiche principali:**
- Encapsulation (incapsulamento): raggruppamento di dati e metodi correlati
- Inheritance (ereditarietà): creazione di gerarchie di classi
- Polymorphism (polimorfismo): capacità di trattare oggetti di classi diverse in modo uniforme
- Astrazione: rappresentazione semplificata della realtà

**Esempio in JavaScript:**
```javascript
class Calcolatore {
  constructor(numeri) {
    this.numeri = numeri;
  }
  
  calcolaSommaQuadrati() {
    let risultato = 0;
    for (let i = 0; i < this.numeri.length; i++) {
      risultato += this.numeri[i] * this.numeri[i];
    }
    return risultato;
  }
}

const calc = new Calcolatore([1, 2, 3, 4]);
console.log(calc.calcolaSommaQuadrati()); // 30
```

### 3. Programmazione Funzionale

La programmazione funzionale si concentra sulla valutazione di funzioni, evitando stati mutabili e effetti collaterali.

**Caratteristiche principali:**
- Immutabilità: i dati non vengono modificati dopo la creazione
- Funzioni pure: dato lo stesso input, restituiscono sempre lo stesso output
- Funzioni come valori di prima classe: le funzioni possono essere passate come argomenti
- Composizione di funzioni: combinazione di funzioni semplici per creare funzioni complesse
- Dichiarativo: si concentra su "cosa" fare piuttosto che su "come" farlo

**Esempio in JavaScript:**
```javascript
const quadrato = x => x * x;
const somma = (a, b) => a + b;

const calcolaSommaQuadrati = numeri => 
  numeri.map(quadrato).reduce(somma, 0);

const numeri = [1, 2, 3, 4];
console.log(calcolaSommaQuadrati(numeri)); // 30
```

### 4. Programmazione Dichiarativa

La programmazione dichiarativa specifica "cosa" il programma dovrebbe fare, senza descrivere esplicitamente "come" farlo.

**Caratteristiche principali:**
- Enfasi sulla logica senza controllo del flusso dettagliato
- Spesso utilizzata per interrogazioni di database (SQL) o manipolazione del DOM (HTML/CSS)
- Nasconde i dettagli implementativi

**Esempio in SQL:**
```sql
SELECT SUM(numeri * numeri) FROM tabella;
```

La programmazione funzionale è intrinsecamente dichiarativa.

## Confronto Diretto

Per capire meglio le differenze, confrontiamo come risolvere lo stesso problema (calcolare la somma dei quadrati di una lista di numeri) nei diversi paradigmi:

### Imperativo vs Funzionale

**Imperativo:**
```javascript
function sommaDeiQuadrati(array) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    const quadrato = array[i] * array[i];
    sum += quadrato;
  }
  return sum;
}
```

**Funzionale:**
```javascript
const sommaDeiQuadrati = array => 
  array.map(x => x * x).reduce((acc, val) => acc + val, 0);
```

### OOP vs Funzionale

**OOP:**
```javascript
class ArrayProcessor {
  constructor(array) {
    this.array = array;
  }
  
  quadratiDegliElementi() {
    return this.array.map(item => item * item);
  }
  
  sommaDeiQuadrati() {
    const quadrati = this.quadratiDegliElementi();
    return quadrati.reduce((sum, item) => sum + item, 0);
  }
}

const processor = new ArrayProcessor([1, 2, 3, 4]);
console.log(processor.sommaDeiQuadrati()); // 30
```

**Funzionale:**
```javascript
const quadrato = x => x * x;
const somma = (a, b) => a + b;
const sommaDeiQuadrati = array => array.map(quadrato).reduce(somma, 0);

console.log(sommaDeiQuadrati([1, 2, 3, 4])); // 30
```

## Vantaggi e Svantaggi dei Diversi Paradigmi

### Programmazione Imperativa
**Vantaggi:**
- Facile da comprendere per i principianti
- Riflette direttamente il funzionamento dell'hardware
- Efficiente in termini di utilizzo delle risorse

**Svantaggi:**
- Difficile da testare e debuggare con l'aumentare della complessità
- Presenta spesso effetti collaterali difficili da tracciare
- Poco adatta alla concorrenza

### Programmazione Orientata agli Oggetti
**Vantaggi:**
- Modellazione intuitiva di entità del mondo reale
- Riutilizzo del codice attraverso l'ereditarietà
- Incapsulamento che protegge i dati

**Svantaggi:**
- Può portare a gerarchie di classi complesse e difficili da gestire
- Stato mutabile che complica il testing e il debugging
- Potenziali problemi di concorrenza

### Programmazione Funzionale
**Vantaggi:**
- Codice più prevedibile e facile da testare
- Naturalmente adatta alla programmazione parallela e concorrente
- Composizione di funzioni per creare componenti complessi da componenti semplici
- Debugging facilitato grazie all'assenza di effetti collaterali

**Svantaggi:**
- Curva di apprendimento ripida per chi proviene da paradigmi imperativi
- Può essere meno efficiente in termini di memoria (creazione di nuove strutture dati)
- Alcuni problemi sono più difficili da esprimere in modo puramente funzionale

## Quando Utilizzare la Programmazione Funzionale

La programmazione funzionale è particolarmente adatta quando:

1. **Si lavora con operazioni di trasformazione dei dati**
   - Elaborazione di flussi di dati
   - Manipolazione di collezioni
   - ETL (Extract, Transform, Load)

2. **È importante la testabilità e la prevedibilità**
   - Testing unitario semplificato
   - Debugging più semplice
   - Comportamento deterministico

3. **Si sviluppano sistemi concorrenti o paralleli**
   - Server web
   - Elaborazione di dati distribuita
   - Applicazioni multithread

4. **Si progettano componenti riutilizzabili e componibili**
   - Librerie di utilità
   - API pubbliche
   - Middleware

## JavaScript come Linguaggio Multi-paradigma

JavaScript è particolarmente interessante perché supporta diversi paradigmi:

```javascript
// Stile imperativo
function elaboraDatiImperativo(dati) {
  const risultati = [];
  for (let i = 0; i < dati.length; i++) {
    if (dati[i] % 2 === 0) {
      risultati.push(dati[i] * 2);
    }
  }
  return risultati;
}

// Stile OOP
class ElaboratoreDati {
  constructor(dati) {
    this.dati = dati;
  }
  
  filtroEMappo() {
    return this.dati
      .filter(item => item % 2 === 0)
      .map(item => item * 2);
  }
}

// Stile funzionale
const ePari = x => x % 2 === 0;
const doppio = x => x * 2;
const elaboraDatiFunzionale = dati => 
  dati.filter(ePari).map(doppio);
```

Questa flessibilità permette agli sviluppatori JavaScript di scegliere l'approccio più adatto a ogni situazione e di combinare paradigmi quando necessario.

## Conclusione

Non esiste un paradigma "migliore" in assoluto; la scelta dipende dal problema da risolvere, dal contesto di sviluppo e dalle preferenze personali. La programmazione funzionale offre vantaggi significativi in termini di manutenibilità, testabilità e gestione della complessità, specialmente per alcune categorie di problemi.

JavaScript, essendo un linguaggio multiparadigma, offre l'opportunità di applicare i principi funzionali quando appropriato, senza dover abbandonare completamente altri approcci. Questa flessibilità permette di adottare un approccio pragmatico, prendendo il meglio da ciascun paradigma.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Storia e Evoluzione](./02-StoriaEvoluzione.md)
- [➡️ JavaScript come Linguaggio Funzionale](./04-JavaScriptLinguaggioFunzionale.md)
