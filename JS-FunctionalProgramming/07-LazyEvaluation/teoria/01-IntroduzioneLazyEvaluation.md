# Introduzione alla Lazy Evaluation

La Lazy Evaluation (valutazione pigra) è una strategia di valutazione che ritarda il calcolo di un'espressione fino al momento in cui il suo valore è effettivamente necessario. Questo approccio è fondamentale in programmazione funzionale e può portare a notevoli ottimizzazioni e maggiore flessibilità nel design del codice.

## Valutazione Lazy vs Eager

### Eager Evaluation (Valutazione Impaziente)
Nella valutazione eager, che è il comportamento predefinito di JavaScript, le espressioni vengono valutate immediatamente quando vengono incontrate:

```javascript
const array = [1, 2, 3, 4, 5];
const doubled = array.map(x => x * 2);        // Calcolo eseguito immediatamente
const filtered = doubled.filter(x => x > 5);  // Calcolo eseguito immediatamente
console.log(filtered[0]);                      // Accesso solo al primo elemento
```

In questo esempio, tutti i valori dell'array vengono elaborati attraverso map e filter anche se alla fine utilizziamo solo il primo elemento.

### Lazy Evaluation (Valutazione Pigra)
Nella valutazione lazy, i calcoli vengono posticipati fino a quando non sono realmente necessari:

```javascript
function* lazyRange(start, end) {
  for (let i = start; i <= end; i++) {
    console.log(`Generando ${i}`);
    yield i;
  }
}

function* lazyMap(iterable, mapFn) {
  for (const item of iterable) {
    console.log(`Applicando map a ${item}`);
    yield mapFn(item);
  }
}

// Nessun calcolo viene eseguito qui
const lazySequence = lazyMap(lazyRange(1, 1000), x => x * 2);

// Il calcolo avviene solo quando iteriamo
for (const value of lazySequence) {
  console.log(`Valore: ${value}`);
  if (value > 10) break;  // Interrompiamo dopo pochi elementi
}
```

Output:
```
Generando 1
Applicando map a 1
Valore: 2
Generando 2
Applicando map a 2
Valore: 4
Generando 3
Applicando map a 3
Valore: 6
Generando 4
Applicando map a 4
Valore: 8
Generando 5
Applicando map a 5
Valore: 10
Generando 6
Applicando map a 6
Valore: 12
```

Come si può notare, vengono generati e trasformati solo i valori effettivamente necessari.

## Vantaggi della Lazy Evaluation

### 1. Efficienza Computazionale
- **Riduzione dei calcoli inutili**: vengono eseguiti solo i calcoli necessari
- **Risparmio di risorse**: particolarmente utile con collezioni di grandi dimensioni
- **Risparmio di memoria**: non occorre memorizzare risultati intermedi completi

### 2. Supporto per Sequenze Infinite
La lazy evaluation permette di lavorare con strutture dati concettualmente infinite:

```javascript
function* naturalNumbers() {
  let n = 1;
  while (true) {
    yield n++;
  }
}

// Prendere solo i primi 5 numeri da una sequenza potenzialmente infinita
const first5 = [...take(naturalNumbers(), 5)];
console.log(first5);  // [1, 2, 3, 4, 5]
```

### 3. Chiarezza del Codice
- Permette di separare la definizione della computazione dalla sua esecuzione
- Può rendere il codice più dichiarativo e modulare

### 4. Performance On-Demand
- Bilanciamento ottimale tra prestazioni e consumo di memoria
- Calcoli complessi vengono eseguiti solo quando necessario
- Particolarmente utile in applicazioni che elaborano stream di dati

## Svantaggi della Lazy Evaluation

1. **Complessità**: può rendere più difficile ragionare sul flusso di esecuzione
2. **Overhead iniziale**: implementare meccanismi lazy può richiedere più codice
3. **Debugging più complesso**: l'esecuzione ritardata può complicare il debugging

## Lazy Evaluation in JavaScript

JavaScript non supporta nativamente la lazy evaluation come linguaggi puramente funzionali come Haskell, ma offre diversi strumenti per implementarla:

1. **Short-circuit Evaluation**: Operatori logici `&&` e `||`
   ```javascript
   const result = someCondition && expensiveCalculation();
   ```

2. **Iteratori e Generatori**: Dal 2015 (ES6) per creare sequenze lazy
   ```javascript
   function* fibonacci() {
     let [a, b] = [0, 1];
     while (true) {
       yield a;
       [a, b] = [b, a + b];
     }
   }
   ```

3. **Proxies**: Per implementare proprietà lazy-loaded
   ```javascript
   const lazyObject = new Proxy({}, {
     get: function(target, property) {
       if (!(property in target)) {
         target[property] = expensiveComputation(property);
       }
       return target[property];
     }
   });
   ```

4. **Thunks**: Funzioni che ritardano un calcolo
   ```javascript
   const lazyValue = () => expensiveCalculation();
   // Il calcolo avviene solo quando si chiama lazyValue()
   ```

## Casi d'uso Appropriati

La lazy evaluation è particolarmente utile in questi casi:

1. **Sequenze molto grandi o infinite**: quando è impraticabile o impossibile calcolare tutti i valori in anticipo
2. **Operazioni costose**: quando le operazioni richiedono molte risorse
3. **Elaborazione di stream**: per dati che arrivano continuamente nel tempo
4. **Ottimizzazione di pipeline di dati**: quando si applicano molteplici trasformazioni a grandi collezioni

## Conclusione

La lazy evaluation rappresenta un potente strumento nel toolkit della programmazione funzionale, permettendo di creare codice più efficiente e flessibile. Nei prossimi capitoli, esploreremo come implementare e utilizzare concretamente questo paradigma in JavaScript attraverso sequenze infinite, iteratori e generatori.
