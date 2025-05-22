/**
 * Sequenze Numeriche
 * 
 * Esempi di sequenze numeriche implementate con lazy evaluation.
 * Includiamo range infiniti e sequenze matematiche classiche.
 */

// ========================================================
// 1. Sequenza dei numeri naturali (potenzialmente infinita)
// ========================================================

function* naturalNumbers(start = 1) {
  let n = start;
  while (true) {
    yield n++;
  }
}

console.log('=== Numeri Naturali ===');
const naturals = naturalNumbers();

// Prendiamo solo i primi 5 elementi
console.log('Primi 5 numeri naturali:');
for (let i = 0; i < 5; i++) {
  console.log(naturals.next().value);
}

// ========================================================
// 2. Range - con vari parametri
// ========================================================

function* range(start, end = Infinity, step = 1) {
  let current = start;
  
  // Gestione range crescente
  if (step > 0) {
    while (current <= end) {
      yield current;
      current += step;
    }
  } 
  // Gestione range decrescente
  else if (step < 0) {
    while (current >= end) {
      yield current;
      current += step;
    }
  }
  // Step zero creerebbe un loop infinito di valori identici
}

console.log('\n=== Range ===');
console.log('Range da 5 a 10:');
const range5to10 = [...range(5, 10)];
console.log(range5to10);

console.log('Range da 10 a 0 con step -2:');
const range10to0 = [...range(10, 0, -2)];
console.log(range10to0);

console.log('Range infinito a partire da 100 (primi 5 elementi):');
const rangeFrom100 = range(100);
for (let i = 0; i < 5; i++) {
  console.log(rangeFrom100.next().value);
}

// ========================================================
// 3. Sequenza di Fibonacci
// ========================================================

function* fibonacci() {
  let a = 0, b = 1;
  
  yield a; // F(0) = 0
  yield b; // F(1) = 1
  
  while (true) {
    const next = a + b;
    yield next;
    [a, b] = [b, next];
  }
}

console.log('\n=== Fibonacci ===');
console.log('Primi 10 numeri della sequenza di Fibonacci:');
const fib = fibonacci();
for (let i = 0; i < 10; i++) {
  console.log(`F(${i}) = ${fib.next().value}`);
}

// ========================================================
// 4. Sequenza di numeri primi
// ========================================================

function* primes() {
  // Funzione helper per controllare se un numero è primo
  function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    
    if (n % 2 === 0 || n % 3 === 0) return false;
    
    // Tutti i numeri primi > 3 possono essere scritti nella forma 6k ± 1
    // Quindi controlliamo solo i divisori di questa forma
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    
    return true;
  }
  
  // Casi speciali
  yield 2;
  yield 3;
  
  // Iterazione sui potenziali numeri primi > 3
  let candidate = 5;
  while (true) {
    if (isPrime(candidate)) {
      yield candidate;
    }
    
    // I numeri primi > 3 sono della forma 6k ± 1
    candidate += 2; // Incrementiamo di 2 per saltare i numeri pari
  }
}

console.log('\n=== Numeri Primi ===');
console.log('Primi 10 numeri primi:');
const primeGen = primes();
for (let i = 0; i < 10; i++) {
  console.log(primeGen.next().value);
}

// ========================================================
// 5. Sequenza di numeri triangolari
// ========================================================

function* triangularNumbers() {
  let n = 1;
  let sum = 0;
  
  while (true) {
    sum += n;
    yield sum;
    n++;
  }
}

console.log('\n=== Numeri Triangolari ===');
console.log('Primi 8 numeri triangolari:');
const triangular = triangularNumbers();
for (let i = 1; i <= 8; i++) {
  console.log(`T(${i}) = ${triangular.next().value}`);
}

// ========================================================
// 6. Multipli di un numero
// ========================================================

function* multiplesOf(n) {
  let current = n;
  while (true) {
    yield current;
    current += n;
  }
}

console.log('\n=== Multipli ===');
console.log('Primi 5 multipli di 7:');
const multiplesOf7 = multiplesOf(7);
for (let i = 0; i < 5; i++) {
  console.log(multiplesOf7.next().value);
}

// ========================================================
// 7. Potenze di un numero
// ========================================================

function* powersOf(base) {
  let exponent = 0;
  while (true) {
    yield Math.pow(base, exponent);
    exponent++;
  }
}

console.log('\n=== Potenze ===');
console.log('Prime 6 potenze di 2:');
const powersOf2 = powersOf(2);
for (let i = 0; i <= 5; i++) {
  console.log(`2^${i} = ${powersOf2.next().value}`);
}

// ========================================================
// 8. Serie armonica (1, 1/2, 1/3, 1/4, ...)
// ========================================================

function* harmonicSeries() {
  let n = 1;
  while (true) {
    yield 1 / n;
    n++;
  }
}

console.log('\n=== Serie Armonica ===');
console.log('Primi 5 termini della serie armonica:');
const harmonic = harmonicSeries();
for (let i = 1; i <= 5; i++) {
  console.log(`H(${i}) = ${harmonic.next().value}`);
}

// ========================================================
// 9. Numeri di Catalan
// ========================================================

function* catalanNumbers() {
  // Formula ricorsiva: C(n) = Σ C(i) * C(n-i-1) per i da 0 a n-1
  // con C(0) = 1
  
  const cache = [1]; // C(0) = 1
  
  let n = 0;
  while (true) {
    if (n < cache.length) {
      yield cache[n];
    } else {
      // Calcola il prossimo numero di Catalan
      let catalan = 0;
      for (let i = 0; i < n; i++) {
        catalan += cache[i] * cache[n - i - 1];
      }
      cache.push(catalan);
      yield catalan;
    }
    n++;
  }
}

console.log('\n=== Numeri di Catalan ===');
console.log('Primi 7 numeri di Catalan:');
const catalan = catalanNumbers();
for (let i = 0; i < 7; i++) {
  console.log(`C(${i}) = ${catalan.next().value}`);
}

// ========================================================
// 10. Combinazione di Sequenze - Generatori Compositi
// ========================================================

// Funzione per prendere i primi n elementi di un iterabile
function take(iterable, n) {
  const result = [];
  let count = 0;
  
  for (const item of iterable) {
    if (count >= n) break;
    result.push(item);
    count++;
  }
  
  return result;
}

// Generator map
function* mapGen(iterable, fn) {
  for (const item of iterable) {
    yield fn(item);
  }
}

// Generator filter
function* filterGen(iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

console.log('\n=== Sequenze Composite ===');

// Esempio: i primi 5 quadrati di numeri pari
const evenSquares = filterGen(
  mapGen(naturalNumbers(), n => n * n),
  n => n % 2 === 0
);

console.log('Primi 5 quadrati di numeri pari:');
console.log(take(evenSquares, 5));

// Esempio: i numeri primi gemelli (coppie di primi che differiscono di 2)
function* twinPrimes() {
  const primeGen = primes();
  let p1 = primeGen.next().value; // 2
  
  for (const p2 of primeGen) {
    if (p2 - p1 === 2) {
      yield [p1, p2];
    }
    p1 = p2;
  }
}

console.log('\nPrime 5 coppie di numeri primi gemelli:');
const twins = twinPrimes();
for (let i = 0; i < 5; i++) {
  console.log(twins.next().value);
}

// ========================================================
// Utility ed esportazioni
// ========================================================

// Esportiamo le funzioni di generazione per utilizzo in altri esempi
module.exports = {
  naturalNumbers,
  range,
  fibonacci,
  primes,
  triangularNumbers,
  multiplesOf,
  powersOf,
  harmonicSeries,
  catalanNumbers,
  take,
  mapGen,
  filterGen,
  twinPrimes
};

console.log('\nTutti gli esempi di sequenze numeriche completati!');
