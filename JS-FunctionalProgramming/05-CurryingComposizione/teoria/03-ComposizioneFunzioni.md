# Composizione di Funzioni

La composizione di funzioni è un concetto fondamentale nella programmazione funzionale che consente di combinare due o più funzioni per creare una nuova funzione. Si tratta di un'astrazione potente che permette di costruire operazioni complesse a partire da funzioni semplici e riutilizzabili.

## Cos'è la Composizione di Funzioni

In matematica, la composizione di funzioni è definita come (f ∘ g)(x) = f(g(x)). In altre parole, il risultato di g viene passato come input a f.

In JavaScript, questo concetto si traduce nel chiamare una funzione e passare il risultato come argomento a un'altra funzione.

```javascript
// Composizione manuale
const risultato = f(g(x));
```

## Implementazione Base della Composizione

Possiamo creare una funzione `compose` che prende due funzioni e restituisce una nuova funzione composta:

```javascript
function compose(f, g) {
  return function(x) {
    return f(g(x));
  };
}

// Esempio di utilizzo
const doppio = x => x * 2;
const incrementa = x => x + 1;

const dopoIncrementaDoppio = compose(doppio, incrementa);
console.log(dopoIncrementaDoppio(5)); // Output: 12 (doppio(incrementa(5)) = doppio(6) = 12)
```

## Composizione di Multiple Funzioni

Possiamo estendere l'idea per comporre un numero arbitrario di funzioni:

```javascript
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

// Con funzioni freccia
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

// Esempio di utilizzo
const doppio = x => x * 2;
const incrementa = x => x + 1;
const quadrato = x => x * x;

const dopoIncrementaDoppioQuadrato = compose(quadrato, doppio, incrementa);
console.log(dopoIncrementaDoppioQuadrato(5)); // Output: 144 (quadrato(doppio(incrementa(5))) = quadrato(doppio(6)) = quadrato(12) = 144)
```

Nota che con `reduceRight`, le funzioni vengono eseguite da destra a sinistra (l'ultima funzione nella lista viene eseguita per prima). Questo rispecchia la notazione matematica f(g(h(x))).

## Pipe: Composizione da Sinistra a Destra

A volte è più naturale ragionare sulla composizione da sinistra a destra (prima esegui la prima funzione, poi la seconda, ecc.). Questo è spesso chiamato "pipe":

```javascript
function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

// Con funzioni freccia
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

// Esempio di utilizzo
const incrementaDoppioQuadrato = pipe(incrementa, doppio, quadrato);
console.log(incrementaDoppioQuadrato(5)); // Output: 144 (quadrato(doppio(incrementa(5))) = quadrato(doppio(6)) = quadrato(12) = 144)
```

La differenza tra `compose` e `pipe` è solo nell'ordine in cui le funzioni vengono eseguite. `compose` segue la notazione matematica tradizionale (da destra a sinistra), mentre `pipe` segue un ordine più simile a quello di una pipeline o di un "flusso di dati" (da sinistra a destra).

## Vantaggi della Composizione di Funzioni

### 1. Riutilizzabilità e Modularità

La composizione incoraggia a scrivere funzioni piccole, pure e specializzate che possono essere combinate in modi diversi.

```javascript
// Funzioni atomiche riutilizzabili
const filtraPari = numeri => numeri.filter(n => n % 2 === 0);
const doppiaTutti = numeri => numeri.map(n => n * 2);
const sommaTutti = numeri => numeri.reduce((acc, n) => acc + n, 0);

// Componiamo per creare nuove funzioni
const sommaDeiDoppiDeiPari = pipe(filtraPari, doppiaTutti, sommaTutti);

console.log(sommaDeiDoppiDeiPari([1, 2, 3, 4, 5, 6])); // Output: 24 (somma([4, 8, 12]) = 24)
```

### 2. Leggibilità

Con nomi di funzioni significativi, il codice diventa auto-documentante e facile da comprendere.

```javascript
// Prima
const risultato = arr => arr.filter(n => n % 2 === 0).map(n => n * 2).reduce((acc, n) => acc + n, 0);

// Dopo, con composizione
const sommaDeiDoppiDeiPari = pipe(filtraPari, doppiaTutti, sommaTutti);
```

### 3. Testabilità

Le singole funzioni utilizzate nella composizione sono più facili da testare in isolamento.

### 4. Ragionamento Algebrico

La composizione di funzioni segue regole algebriche come l'associatività, che permettono di ragionare sul codice in modi formali.

## Point-Free Style (Programmazione Tacita)

Il "point-free style" è uno stile di programmazione in cui non si fa riferimento esplicito agli argomenti di una funzione. Questo stile, reso popolare dalla programmazione funzionale, può rendere il codice più conciso:

```javascript
// Style con parametro esplicito
const isPositivo = numero => numero > 0;

// Point-free style con composizione
const not = fn => x => !fn(x);
const isNegativo = not(isPositivo);
```

Questo stile è particolarmente efficace quando si compongono funzioni.

## Composizione con Funzioni Multi-argomento

La composizione come l'abbiamo definita sopra funziona bene con funzioni che prendono un singolo argomento. Per gestire funzioni con più argomenti, possiamo utilizzare il currying:

```javascript
const aggiungere = a => b => a + b;
const moltiplicare = a => b => a * b;

const addizionaMoltiplicaPerDue = pipe(aggiungere(5), moltiplicare(2));
console.log(addizionaMoltiplicaPerDue(10)); // Output: 30 ((10 + 5) * 2)
```

## Gestione degli Errori nella Composizione

Un aspetto da considerare è come gestire gli errori nelle funzioni composte. Una tecnica comune è utilizzare container come `Maybe` o `Either` per gestire i casi di errore in modo elegante:

```javascript
// Implementazione semplificata di un Maybe
const Maybe = {
  just: x => ({
    map: fn => Maybe.just(fn(x)),
    getOrElse: () => x,
    isNothing: () => false
  }),
  nothing: () => ({
    map: () => Maybe.nothing(),
    getOrElse: defaultValue => defaultValue,
    isNothing: () => true
  })
};

// Funzioni che utilizzano Maybe
const dividiPer = divisore => numero => 
  divisore === 0 ? Maybe.nothing() : Maybe.just(numero / divisore);

const radiceQuadrata = numero => 
  numero < 0 ? Maybe.nothing() : Maybe.just(Math.sqrt(numero));

// Composizione con gestione degli errori
const calcolaConMaybe = pipe(
  dividiPer(2),
  result => result.map(radiceQuadrata),
  result => result.getOrElse('Errore nel calcolo')
);

console.log(calcolaConMaybe(16)); // Output: Maybe.just(2)
console.log(calcolaConMaybe(-4)); // Output: "Errore nel calcolo"
```

## Conclusione

La composizione di funzioni è uno strumento fondamentale nella programmazione funzionale che ci permette di costruire funzioni complesse a partire da funzioni più semplici. Combinata con il currying e l'applicazione parziale, la composizione permette di creare codice modulare, riutilizzabile e facile da ragionare.

Nel prossimo capitolo, esploreremo come questi concetti si combinano per creare pipeline di dati efficaci.
