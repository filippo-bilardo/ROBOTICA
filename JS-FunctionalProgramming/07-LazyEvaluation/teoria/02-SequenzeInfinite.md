# Sequenze Infinite

Uno dei vantaggi più interessanti della lazy evaluation è la possibilità di lavorare con sequenze potenzialmente infinite. In questa lezione esploreremo come definire, manipolare e utilizzare sequenze infinite in JavaScript.

## Concetto di Sequenza Infinita

Una sequenza infinita rappresenta una collezione con un numero illimitato di elementi, che vengono generati on-demand invece di essere memorizzati tutti contemporaneamente. In JavaScript, possiamo implementare le sequenze infinite principalmente attraverso i generatori, che permettono di generare valori un elemento alla volta secondo necessità.

## Implementazione Base di Sequenze Infinite

### Numeri Naturali

La sequenza più semplice è quella dei numeri naturali (1, 2, 3, ...):

```javascript
function* naturalNumbers() {
  let n = 1;
  while (true) {
    yield n++;
  }
}

// Utilizzo
const numbers = naturalNumbers();
console.log(numbers.next().value); // 1
console.log(numbers.next().value); // 2
console.log(numbers.next().value); // 3
```

### Range Infinito

Un range che parte da un certo valore e continua all'infinito:

```javascript
function* rangeFrom(start) {
  let n = start;
  while (true) {
    yield n++;
  }
}

const rangeFrom10 = rangeFrom(10);
console.log(rangeFrom10.next().value); // 10
console.log(rangeFrom10.next().value); // 11
```

## Sequenze Matematiche Comuni

### Sequenza di Fibonacci

La celebre sequenza in cui ogni numero è la somma dei due precedenti:

```javascript
function* fibonacci() {
  let a = 0, b = 1;
  
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
// Primi 10 numeri di Fibonacci
const first10 = Array.from({ length: 10 }, () => fib.next().value);
console.log(first10); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### Numeri Primi

Una sequenza infinita di numeri primi:

```javascript
function* primes() {
  // Funzione di supporto per verificare se un numero è primo
  function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }
  
  // Genera numeri primi all'infinito
  let n = 2;
  while (true) {
    if (isPrime(n)) yield n;
    n++;
  }
}

const primeGen = primes();
// Primi 10 numeri primi
const first10Primes = Array.from({ length: 10 }, () => primeGen.next().value);
console.log(first10Primes); // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
```

## Operazioni su Sequenze Infinite

Per rendere le sequenze infinite veramente utili, dobbiamo essere in grado di trasformarle e combinarle.

### Map

```javascript
function* map(iterable, mapFn) {
  for (const item of iterable) {
    yield mapFn(item);
  }
}

// Esempio: Quadrato dei numeri naturali
const squares = map(naturalNumbers(), n => n * n);
console.log(squares.next().value); // 1
console.log(squares.next().value); // 4
console.log(squares.next().value); // 9
```

### Filter

```javascript
function* filter(iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

// Esempio: Numeri naturali pari
const evenNumbers = filter(naturalNumbers(), n => n % 2 === 0);
console.log(evenNumbers.next().value); // 2
console.log(evenNumbers.next().value); // 4
console.log(evenNumbers.next().value); // 6
```

### Take

Limitare una sequenza infinita ai primi N elementi:

```javascript
function* take(iterable, n) {
  if (n <= 0) return;
  
  let count = 0;
  for (const item of iterable) {
    yield item;
    count++;
    if (count >= n) break;
  }
}

// Primi 5 numeri di Fibonacci
const first5Fibs = [...take(fibonacci(), 5)];
console.log(first5Fibs); // [0, 1, 1, 2, 3]
```

### Zip

Combinare più sequenze, anche infinite:

```javascript
function* zip(...iterables) {
  const iterators = iterables.map(it => it[Symbol.iterator]());
  
  while (true) {
    const results = iterators.map(it => it.next());
    
    // Se uno degli iteratori è terminato, terminiamo lo zip
    if (results.some(res => res.done)) {
      return;
    }
    
    yield results.map(res => res.value);
  }
}

// Combinare sequenza naturale con i suoi quadrati
const numsAndSquares = zip(
  naturalNumbers(),
  map(naturalNumbers(), n => n * n)
);

console.log(numsAndSquares.next().value); // [1, 1]
console.log(numsAndSquares.next().value); // [2, 4]
console.log(numsAndSquares.next().value); // [3, 9]
```

## Tecniche di Concatenazione

Possiamo concatenare operazioni su sequenze infinite:

```javascript
// Primi 5 numeri pari al quadrato maggiori di 10
const result = [...take(
  filter(
    map(naturalNumbers(), n => n * n),
    n => n > 10 && n % 2 === 0
  ),
  5
)];

console.log(result); // [16, 36, 64, 100, 144]
```

## Implementare un Generatore di Sequenze

Per rendere più leggibile il codice, possiamo creare un'API di alto livello per le sequenze:

```javascript
class LazySequence {
  constructor(generator) {
    this.generator = generator;
  }

  // Implementazione dell'interfaccia Iterator
  [Symbol.iterator]() {
    return this.generator();
  }

  // Operazioni
  map(fn) {
    const self = this;
    return new LazySequence(function* () {
      for (const item of self.generator()) {
        yield fn(item);
      }
    });
  }

  filter(predicate) {
    const self = this;
    return new LazySequence(function* () {
      for (const item of self.generator()) {
        if (predicate(item)) {
          yield item;
        }
      }
    });
  }

  take(n) {
    const self = this;
    return new LazySequence(function* () {
      let count = 0;
      for (const item of self.generator()) {
        if (count >= n) break;
        yield item;
        count++;
      }
    });
  }

  // Convertire a array (attenzione con sequenze infinite!)
  toArray(limit = Infinity) {
    return [...this.take(limit)];
  }
}

// Helpers per creare sequenze
const Seq = {
  naturals: () => new LazySequence(naturalNumbers),
  
  range: (start, end = Infinity) => new LazySequence(function* () {
    let n = start;
    while (n <= end) {
      yield n++;
    }
  }),
  
  fibonacci: () => new LazySequence(fibonacci)
};

// Esempio di utilizzo
const result = Seq.naturals()
  .map(n => n * n)
  .filter(n => n % 2 === 0)
  .take(5)
  .toArray();

console.log(result); // [4, 16, 36, 64, 100]
```

## Precauzioni con le Sequenze Infinite

Quando si lavora con sequenze infinite, è importante seguire alcune precauzioni:

1. **Mai esaurire una sequenza infinita**: operazioni come `toArray()` senza un limite porteranno a un loop infinito
2. **Utilizzare operazioni terminanti**: come `take()` o `find()` per limitare l'elaborazione
3. **Controllo della memoria**: anche la lazy evaluation consuma risorse per mantenere lo stato dei generatori
4. **Prestazioni**: generare elementi on-demand può essere costoso se richiede calcoli complessi

## Pattern Comuni di Utilizzo

1. **Pipeline di trasformazione dati**: incapsulare logica complessa in passaggi concatenati
2. **Ricerca di elementi**: trovare elementi che soddisfano criteri complessi in sequenze potenzialmente illimitate
3. **Stream processing**: elaborare flussi di dati senza doverli caricare completamente in memoria
4. **Simulazioni**: generare sequenze di stati in simulazioni fisiche o matematiche

## Conclusione

Le sequenze infinite rappresentano uno strumento potente reso possibile dalla lazy evaluation. Permettono di modellare in modo elegante problemi che concettualmente coinvolgono insiemi infiniti di dati, pur mantenendo l'efficienza computazionale. Nel prossimo capitolo, approfondiremo il funzionamento degli iteratori e generatori che sono alla base dell'implementazione di queste tecniche in JavaScript.
