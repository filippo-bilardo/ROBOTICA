# Iteratori e Generatori

Gli iteratori e i generatori sono funzionalità fondamentali di JavaScript che rendono possibile l'implementazione della lazy evaluation. Questi meccanismi consentono di creare sequenze di valori che vengono calcolati on-demand, permettendo così di lavorare con collezioni potenzialmente infinite o di grande dimensione senza caricarle completamente in memoria.

## Il Protocollo Iterabile

Il protocollo iterabile è un pattern introdotto in ES6 che permette agli oggetti JavaScript di definire o personalizzare il proprio comportamento di iterazione.

### Iterabili

Un oggetto è considerato iterabile se implementa il metodo `@@iterator`, accessibile tramite la chiave `Symbol.iterator`. Questo metodo deve restituire un oggetto iteratore.

```javascript
const iterableObject = {
  data: [1, 2, 3, 4, 5],
  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if (index < this.data.length) {
          return { value: this.data[index++], done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
};

// Ora possiamo iterare sull'oggetto
for (const item of iterableObject) {
  console.log(item); // 1, 2, 3, 4, 5
}
```

### Iteratori

Un iteratore è un oggetto che implementa il metodo `next()`, che restituisce un oggetto con due proprietà:
- `value`: il valore corrente
- `done`: un booleano che indica se l'iterazione è completa

```javascript
const array = [1, 2, 3];
const iterator = array[Symbol.iterator]();

console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

## Generatori

I generatori sono una speciale classe di funzioni che facilitano la creazione di iteratori. Sono definiti usando il simbolo `function*` e contengono una o più istruzioni `yield`.

### Sintassi Base

```javascript
function* simpleGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = simpleGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

Un generatore può essere usato in qualsiasi contesto che si aspetta un iterabile:

```javascript
// Utilizzando for...of
for (const value of simpleGenerator()) {
  console.log(value); // 1, 2, 3
}

// Conversione in array
const array = [...simpleGenerator()];
console.log(array); // [1, 2, 3]

// Destructuring
const [a, b, c] = simpleGenerator();
console.log(a, b, c); // 1 2 3
```

### Generatori Infiniti

I generatori sono particolarmente utili per rappresentare sequenze infinite:

```javascript
function* countForever() {
  let n = 1;
  while (true) {
    yield n++;
  }
}

const counter = countForever();
console.log(counter.next().value); // 1
console.log(counter.next().value); // 2
console.log(counter.next().value); // 3
// ...può continuare all'infinito
```

### Comunicazione Bidirezionale

Una caratteristica potente dei generatori è la comunicazione bidirezionale: il valore passato al metodo `next()` diventa il valore restituito dall'espressione `yield`:

```javascript
function* communicatingGenerator() {
  console.log('Generator started');
  const x = yield 'Prima yield';
  console.log('Received:', x);
  
  const y = yield 'Seconda yield';
  console.log('Received:', y);
  
  return 'Generator completed';
}

const gen = communicatingGenerator();
console.log(gen.next('Questo valore viene ignorato')); // { value: 'Prima yield', done: false }
console.log(gen.next('Valore inviato dopo la prima yield')); // { value: 'Seconda yield', done: false }
console.log(gen.next('Valore inviato dopo la seconda yield')); // { value: 'Generator completed', done: true }
```

Output:
```
Generator started
{ value: 'Prima yield', done: false }
Received: Valore inviato dopo la prima yield
{ value: 'Seconda yield', done: false }
Received: Valore inviato dopo la seconda yield
{ value: 'Generator completed', done: true }
```

### Delega di Generatori con yield*

L'operatore `yield*` consente di delegare a un altro generatore o iterabile:

```javascript
function* generator1() {
  yield 'a';
  yield 'b';
}

function* generator2() {
  yield 'c';
  yield* generator1(); // Delega al generator1
  yield 'd';
}

const gen = generator2();
for (const value of gen) {
  console.log(value); // 'c', 'a', 'b', 'd'
}
```

## Pattern Avanzati con Generatori

### Implementazione di Stream di Dati

I generatori possono simulare stream di dati:

```javascript
function* dataStream() {
  while (true) {
    const data = fetchNextChunkOfData(); // Funzione ipotetica
    if (data === null) return;
    yield data;
  }
}

for (const chunk of dataStream()) {
  processChunk(chunk); // Elabora ogni chunk man mano che arriva
}
```

### Gestione di Operazioni Asincrone

I generatori possono essere usati per semplificare il codice asincrono (questo pattern è stato il precursore di async/await):

```javascript
function runGenerator(generatorFn) {
  const generator = generatorFn();
  
  function handle(result) {
    if (result.done) return result.value;
    
    return Promise.resolve(result.value)
      .then(res => handle(generator.next(res)))
      .catch(err => handle(generator.throw(err)));
  }
  
  return handle(generator.next());
}

// Utilizzo
runGenerator(function* () {
  try {
    const user = yield fetchUser(userId);
    const posts = yield fetchPosts(user.id);
    const comments = yield fetchComments(posts[0].id);
    
    return { user, posts, comments };
  } catch (error) {
    console.error(error);
  }
});
```

### Implementazione di Coroutine

I generatori possono essere usati per implementare coroutine (funzioni che possono sospendere la propria esecuzione):

```javascript
function* taskA() {
  while (true) {
    console.log('Task A execution');
    yield;
  }
}

function* taskB() {
  while (true) {
    console.log('Task B execution');
    yield;
  }
}

function runTasks() {
  const genA = taskA();
  const genB = taskB();
  
  // Simula uno scheduler semplice
  for (let i = 0; i < 5; i++) {
    genA.next();
    genB.next();
  }
}

runTasks();
```

## Creazione di Utility per Generatori

### Take

```javascript
function* take(iterable, n) {
  let count = 0;
  for (const item of iterable) {
    if (count >= n) return;
    yield item;
    count++;
  }
}
```

### Cycle

Crea un generatore che cicla infinitamente su un iterabile:

```javascript
function* cycle(iterable) {
  const values = [...iterable];
  if (values.length === 0) return;
  
  let index = 0;
  while (true) {
    yield values[index];
    index = (index + 1) % values.length;
  }
}

const colors = cycle(['red', 'green', 'blue']);
console.log(colors.next().value); // 'red'
console.log(colors.next().value); // 'green'
console.log(colors.next().value); // 'blue'
console.log(colors.next().value); // 'red' (ricomincia)
```

### Zip

```javascript
function* zip(...iterables) {
  const iterators = iterables.map(it => it[Symbol.iterator]());
  
  while (true) {
    const results = iterators.map(it => it.next());
    
    if (results.some(res => res.done)) {
      return;
    }
    
    yield results.map(res => res.value);
  }
}
```

## Prestazioni e Considerazioni Pratiche

### Vantaggi
- **Memoria ridotta**: i valori vengono generati solo quando necessario
- **Elaborazione JIT (Just-In-Time)**: calcoli eseguiti solo quando richiesti
- **Composabilità**: i generatori possono essere facilmente composti e concatenati

### Svantaggi
- **Overhead iniziale**: la creazione di iteratori e generatori ha un costo
- **Complessità di debugging**: il flusso di controllo non lineare può complicare il debugging
- **Persistenza dello stato**: i generatori mantengono lo stato interno, il che può portare a comportamenti non intuitivi

### Quando Usare Generatori vs Array
- **Usa i generatori quando**:
  - Lavori con sequenze potenzialmente infinite
  - Hai bisogno di risparmiare memoria con grandi collezioni
  - Vuoi lazy-load o calcolare valori on-demand
  
- **Usa gli array quando**:
  - Hai bisogno di accesso casuale agli elementi
  - La collezione è relativamente piccola
  - Devi usare metodi di array come `sort`, `reverse`, ecc.

## Conclusione

Iteratori e generatori forniscono un potente meccanismo per implementare la lazy evaluation in JavaScript. Consentono di lavorare con collezioni potenzialmente infinite e di ottimizzare l'utilizzo della memoria generando valori on-demand. Nel prossimo capitolo, esploreremo come queste tecniche possono essere ulteriormente potenziate con strategie di memoization e thunking.
