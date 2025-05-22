/**
 * Ricorsione in Contesti Funzionali
 * 
 * Questo file esplora come la ricorsione si integra con altri concetti
 * di programmazione funzionale come la composizione, il currying, e l'immutabilità.
 */

// --------------------------------------------------------
// PARTE 1: Ricorsione con Funzioni Pure
// --------------------------------------------------------

console.log('===== RICORSIONE CON FUNZIONI PURE =====');

// Funzione ricorsiva pura che copia e modifica i dati anziché mutarli
function updateDeep(obj, path, value) {
  // Caso base: path vuoto
  if (path.length === 0) {
    return value;
  }
  
  // Crea una copia dell'oggetto originale (per mantenere l'immutabilità)
  const result = Array.isArray(obj) ? [...obj] : { ...obj };
  
  // Estrai il primo elemento del path
  const [head, ...tail] = path;
  
  // Inizializza il valore se non esiste
  if (result[head] === undefined) {
    result[head] = tail[0] === parseInt(tail[0], 10) ? [] : {};
  }
  
  // Aggiorna ricorsivamente il valore alla posizione specificata
  result[head] = updateDeep(result[head], tail, value);
  
  return result;
}

// Esempio di utilizzo
const originalObj = {
  user: {
    name: "John",
    contacts: [
      { type: "email", value: "john@example.com" },
      { type: "phone", value: "123-456-7890" }
    ]
  }
};

// Aggiornamento profondo mantenendo l'immutabilità
const updatedObj = updateDeep(originalObj, ["user", "contacts", 0, "value"], "john.doe@example.com");

console.log('Oggetto originale invariato:', originalObj);
console.log('Nuovo oggetto aggiornato:', updatedObj);

// --------------------------------------------------------
// PARTE 2: Ricorsione con Composizione di Funzioni
// --------------------------------------------------------

console.log('\n===== RICORSIONE CON COMPOSIZIONE =====');

// Funzione di utilità per la composizione
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

// Funzioni semplici da comporre
const double = x => x * 2;
const increment = x => x + 1;
const square = x => x * x;

// Funzione ricorsiva combinata con composizione
function recursiveProcess(arr, index = 0, processor = x => x) {
  // Caso base: abbiamo elaborato tutti gli elementi
  if (index >= arr.length) {
    return [];
  }
  
  // Applica la funzione composta all'elemento corrente
  const processedValue = processor(arr[index]);
  
  // Chiamata ricorsiva per il resto dell'array
  const restProcessed = recursiveProcess(arr, index + 1, processor);
  
  // Combina il risultato
  return [processedValue, ...restProcessed];
}

// Esempio di utilizzo
const numbers = [1, 2, 3, 4, 5];

// Crea diverse pipeline di elaborazione
const processorA = compose(square, double);  // (x * 2)^2
const processorB = compose(double, square);  // (x^2) * 2
const processorC = pipe(double, square);     // (x * 2)^2

console.log('Array originale:', numbers);
console.log('Pipeline A (square(double(x))):', recursiveProcess(numbers, 0, processorA));
console.log('Pipeline B (double(square(x))):', recursiveProcess(numbers, 0, processorB));
console.log('Pipeline C (square(double(x))):', recursiveProcess(numbers, 0, processorC));

// --------------------------------------------------------
// PARTE 3: Ricorsione con Currying
// --------------------------------------------------------

console.log('\n===== RICORSIONE CON CURRYING =====');

// Utility per currying
const curry = (fn) => {
  const arity = fn.length;
  
  return function curried(...args) {
    if (args.length >= arity) {
      return fn(...args);
    }
    
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
};

// Funzione ricorsiva per trovare la potenza, preparata per il currying
const powerRec = curry((base, exponent) => {
  if (exponent === 0) return 1;
  return base * powerRec(base, exponent - 1);
});

// Specializzazione tramite currying
const square2 = powerRec(2);   // x^2
const cube = powerRec(3);      // x^3
const toFourth = powerRec(4);  // x^4

// Test delle funzioni specializzate
console.log('2^3 con powerRec:', powerRec(2)(3));
console.log('3^3 con cube:', cube(3));
console.log('2^4 con toFourth:', toFourth(2));

// Sequenza di potenze di 2 utilizzando ricorsione e currying
function powersOf2(n, current = 0, result = []) {
  if (current > n) return result;
  
  return powersOf2(
    n,
    current + 1,
    [...result, Math.pow(2, current)]
  );
}

console.log('Potenze di 2 fino a 2^10:', powersOf2(10));

// --------------------------------------------------------
// PARTE 4: Y Combinator (Fixed-point Combinator)
// --------------------------------------------------------

console.log('\n===== Y COMBINATOR =====');

/**
 * Il Y Combinator è un concetto avanzato della programmazione funzionale
 * che permette di creare funzioni ricorsive senza nominare esplicitamente la funzione.
 * È utile in linguaggi puramente funzionali dove non è possibile fare riferimento
 * diretto alla funzione dall'interno della sua definizione.
 */

// Implementazione base del Y combinator
const Y = f => (x => x(x))(x => f(y => x(x)(y)));

// Fattoriale usando Y combinator
const factorialY = Y(f => n => n <= 1 ? 1 : n * f(n - 1));

// Fibonacci usando Y combinator
const fibonacciY = Y(f => n => n <= 1 ? n : f(n - 1) + f(n - 2));

// Test dell'Y combinator
console.log('Factorial(5) con Y combinator:', factorialY(5));
console.log('Fibonacci(10) con Y combinator:', fibonacciY(10));

// --------------------------------------------------------
// PARTE 5: Transducer con Ricorsione
// --------------------------------------------------------

console.log('\n===== TRANSDUCER CON RICORSIONE =====');

/**
 * I transducer sono trasformazioni di dati componibili che separano
 * l'iterazione dalla logica di trasformazione.
 */

// Funzione per applicare un transducer a un array
function transduce(transducer, combiner, initial, array) {
  const reducer = transducer(combiner);
  
  // Funzione ricorsiva per applicare il reducer
  function recursiveReduce(index, acc) {
    if (index >= array.length) {
      return acc;
    }
    
    const nextAcc = reducer(acc, array[index]);
    return recursiveReduce(index + 1, nextAcc);
  }
  
  return recursiveReduce(0, initial);
}

// Transducer di mappatura
const mapTransducer = fn => reducer => (acc, item) => reducer(acc, fn(item));

// Transducer di filtro
const filterTransducer = predicate => reducer => (acc, item) => 
  predicate(item) ? reducer(acc, item) : acc;

// Combinatori (reducers)
const arrayCombiner = (acc, item) => [...acc, item];
const sumCombiner = (acc, item) => acc + item;

// Esempi di utilizzo
const arrayForTransducer = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Transducer che raddoppia i numeri
const doubleTransducer = mapTransducer(x => x * 2);

// Transducer che filtra i numeri pari
const evenTransducer = filterTransducer(x => x % 2 === 0);

// Compone i transducer
const composedTransducer = evenTransducer(doubleTransducer(arrayCombiner));

// Applica i transducer ricorsivamente
console.log('Original array:', arrayForTransducer);
console.log('Doubled numbers:', transduce(doubleTransducer, arrayCombiner, [], arrayForTransducer));
console.log('Even numbers:', transduce(evenTransducer, arrayCombiner, [], arrayForTransducer));
console.log('Double then filter even:', transduce(
  x => doubleTransducer(evenTransducer(x)), 
  arrayCombiner, 
  [], 
  arrayForTransducer
));

// Calcola la somma dei numeri pari raddoppiati
console.log('Sum of doubled even numbers:', transduce(
  x => evenTransducer(doubleTransducer(x)), 
  sumCombiner, 
  0, 
  arrayForTransducer
));
