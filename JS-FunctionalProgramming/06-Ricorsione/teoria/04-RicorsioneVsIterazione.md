# Ricorsione vs Iterazione

Ricorsione e iterazione sono due approcci fondamentali per implementare algoritmi che ripetono operazioni. Entrambi hanno vantaggi, svantaggi e casi d'uso ideali. In questo documento, confronteremo questi due approcci e impareremo quando privilegiare l'uno rispetto all'altro.

## Comprendere le Differenze Fondamentali

### Ricorsione
- **Definizione**: Una funzione che richiama se stessa
- **Terminazione**: Basata su un caso base
- **Memoria**: Utilizza lo stack di chiamate per ogni invocazione
- **Espressività**: Spesso più elegante e dichiarativa

### Iterazione
- **Definizione**: Ripete un'operazione utilizzando cicli (for, while, do-while)
- **Terminazione**: Basata su una condizione di uscita
- **Memoria**: Utilizza un insieme fisso di variabili, indipendentemente dal numero di iterazioni
- **Espressività**: Spesso più imperativa e orientata ai dettagli di implementazione

## Confronto di Implementazioni: Fattoriale

### Implementazione Ricorsiva

```javascript
function factorialRecursive(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorialRecursive(n - 1);
}
```

### Implementazione Iterativa

```javascript
function factorialIterative(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

## Confronto di Implementazioni: Fibonacci

### Implementazione Ricorsiva (Naive)

```javascript
function fibonacciRecursive(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}
```

### Implementazione Iterativa

```javascript
function fibonacciIterative(n) {
  if (n <= 1) {
    return n;
  }
  
  let a = 0;
  let b = 1;
  let temp;
  
  for (let i = 2; i <= n; i++) {
    temp = a + b;
    a = b;
    b = temp;
  }
  
  return b;
}
```

## Analisi Comparativa

### Performance

**Complessità di Tempo**:
- L'approccio ricorsivo naive per Fibonacci ha una complessità esponenziale O(2^n)
- L'approccio iterativo per Fibonacci ha una complessità lineare O(n)
- Per il fattoriale, entrambi gli approcci hanno complessità lineare O(n)

**Complessità di Spazio**:
- L'approccio ricorsivo utilizza O(n) spazio nello stack
- L'approccio iterativo utilizza O(1) spazio (costante)

### Benchmark di Base

```javascript
// Esempio di benchmark semplice
console.time('Recursive');
fibonacciRecursive(30);
console.timeEnd('Recursive');

console.time('Iterative');
fibonacciIterative(30);
console.timeEnd('Iterative');

// Output tipico:
// Recursive: 18.76ms
// Iterative: 0.07ms
```

## Casi d'Uso Ideali

### Quando Usare la Ricorsione
1. **Strutture dati ricorsive**: Alberi, grafi, documenti DOM, JSON annidata
2. **Algoritmi naturally ricorsivi**: Divide et impera, backtracking
3. **Complessità concettuale**: Quando la soluzione ricorsiva è molto più semplice da comprendere
4. **Problemi che si riducono naturalmente**: Problemi che si dividono in sotto-problemi identici

### Quando Usare l'Iterazione
1. **Preoccupazioni per lo stack**: Per evitare stack overflow con input di grandi dimensioni
2. **Ottimizzazione delle performance**: Quando l'efficienza è cruciale
3. **Operazioni semplici e sequenziali**: Loop su array o collezioni
4. **Calcoli costanti**: Quando si ha bisogno di un numero fisso di variabili indipendentemente dall'input

## Trasformare Ricorsione in Iterazione

Ogni algoritmo ricorsivo può essere convertito in uno iterativo, spesso utilizzando uno stack esplicito.

### Esempio: Attraversamento di un albero binario

#### Versione Ricorsiva
```javascript
function traverseInOrder(node, result = []) {
  if (node === null) return result;
  
  traverseInOrder(node.left, result);
  result.push(node.value);
  traverseInOrder(node.right, result);
  
  return result;
}
```

#### Versione Iterativa
```javascript
function traverseInOrderIterative(root) {
  const result = [];
  const stack = [];
  let current = root;
  
  while (current !== null || stack.length > 0) {
    // Raggiungi il nodo più a sinistra
    while (current !== null) {
      stack.push(current);
      current = current.left;
    }
    
    // Processa il nodo corrente
    current = stack.pop();
    result.push(current.value);
    
    // Passa al sottoalbero destro
    current = current.right;
  }
  
  return result;
}
```

## Approcci Ibridi

In alcuni casi, un approccio ibrido che combina ricorsione e iterazione può offrire il meglio di entrambi i mondi.

### Esempio: QuickSort Ibrido

```javascript
function quickSortHybrid(arr, left = 0, right = arr.length - 1) {
  // Usa ricorsione per le parti principali dell'algoritmo
  if (right - left < 10) {
    // Ma per array piccoli, usa un algoritmo più semplice e iterativo
    insertionSort(arr, left, right);
    return arr;
  }
  
  const pivotIndex = partition(arr, left, right);
  quickSortHybrid(arr, left, pivotIndex - 1);
  quickSortHybrid(arr, pivotIndex + 1, right);
  
  return arr;
}

function insertionSort(arr, start, end) {
  for (let i = start + 1; i <= end; i++) {
    const temp = arr[i];
    let j = i - 1;
    while (j >= start && arr[j] > temp) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = temp;
  }
  return arr;
}
```

## Considerazioni Pratiche nella Programmazione Funzionale

Nel contesto della programmazione funzionale:

1. **Purezza**: La ricorsione favorisce funzioni pure senza stato mutabile
2. **Composizione**: Le funzioni ricorsive spesso si prestano meglio alla composizione
3. **Ragionamento**: La ricorsione permette di ragionare su problemi a un livello più alto di astrazione
4. **Ottimizzazione**: In linguaggi funzionali puri, l'ottimizzazione della ricorsione in coda è spesso garantita

## Linee Guida Decisionali

Per scegliere tra ricorsione e iterazione:

1. **Considera la natura del problema**: È naturalmente ricorsivo o iterativo?
2. **Valuta la leggibilità**: Quale approccio rende il codice più chiaro e manutenibile?
3. **Considera i vincoli di performance**: Hai limitazioni di memoria o tempo?
4. **Considera il dominio**: Stai lavorando in un contesto funzionale o imperativo?
5. **Pensa all'input**: Quanto può essere grande l'input nel caso peggiore?

## Conclusione

Sia la ricorsione che l'iterazione sono strumenti potenti, e un programmatore esperto dovrebbe saper utilizzare entrambi. La ricorsione è spesso più elegante e adatta a problemi che hanno una natura ricorsiva intrinseca, mentre l'iterazione è generalmente più efficiente in termini di risorse.

Nella programmazione funzionale, la ricorsione è un pattern fondamentale che riflette la filosofia dichiarativa del paradigma. Tuttavia, anche in questo contesto, è importante conoscere le tecniche per ottimizzare la ricorsione o convertirla in iterazione quando necessario.

## Navigazione del Corso
- [📑 Indice](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/README.md)
- [⬅️ Tail Call Optimization](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/06-Ricorsione/teoria/03-TailCallOptimization.md)
- [➡️ Ricorsione e Strutture Dati](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/06-Ricorsione/teoria/05-RicorsioneStruttureData.md)
