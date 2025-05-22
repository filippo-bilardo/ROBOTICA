# Tail Call Optimization

La Tail Call Optimization (TCO) è una tecnica di ottimizzazione che permette di eseguire funzioni ricorsive in modo più efficiente, evitando il rischio di stack overflow anche per ricorsioni profonde. Questa ottimizzazione è particolarmente importante nella programmazione funzionale, dove la ricorsione è un pattern comune.

## Cos'è una Tail Call

Una "tail call" (chiamata in coda) è una chiamata di funzione che avviene come ultima operazione in una funzione. In altre parole, dopo che la chiamata viene eseguita, la funzione chiamante non ha più alcun lavoro da svolgere e può semplicemente restituire il risultato della funzione chiamata.

Esempio di tail call:

```javascript
function esempio() {
  // Questa è una tail call perché è l'ultima operazione
  return altraFunzione();
}
```

Non è una tail call:

```javascript
function nonEsempio() {
  // Questa non è una tail call perché c'è un'operazione dopo la chiamata
  const risultato = altraFunzione();
  return risultato + 1;
}
```

## Tail Call Optimization in JavaScript

ECMAScript 6 (ES6) ha introdotto specifiche per la Tail Call Optimization, ma il supporto tra i motori JavaScript è variabile:

- Safari la supporta
- Firefox e Chrome non la implementano completamente

Questo significa che non possiamo fare affidamento sul TCO in tutti gli ambienti JavaScript, ma è comunque importante comprenderla e progettare funzioni ricorsive ottimizzabili.

## Come Funziona la TCO

Normalmente, quando una funzione ne chiama un'altra, viene creato un nuovo frame nello stack di chiamate. Con la TCO, se l'ultima operazione è una tail call, il motore JavaScript può riutilizzare il frame dello stack corrente invece di crearne uno nuovo.

Questo comportamento evita la crescita dello stack e permette ricorsioni teoricamente infinite senza rischio di stack overflow.

## Esempio: Fattoriale Non Ottimizzato vs Ottimizzato

### Versione Non Ottimizzata

```javascript
function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  
  // Non è in tail position perché c'è una moltiplicazione dopo la chiamata
  return n * factorial(n - 1);
}
```

### Versione Ottimizzata (Tail Recursive)

```javascript
function factorialTailRec(n, accumulator = 1) {
  if (n <= 1) {
    return accumulator;
  }
  
  // È in tail position perché è l'ultima operazione
  return factorialTailRec(n - 1, n * accumulator);
}
```

Nella versione ottimizzata, passiamo un accumulatore che mantiene il risultato parziale. La chiamata ricorsiva è l'ultima operazione, quindi può beneficiare della TCO.

## Trasformare Funzioni Ricorsive in Tail Recursive

Il pattern più comune per rendere una funzione tail recursive è l'aggiunta di un parametro accumulatore:

### Fibonacci non ottimizzato

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

### Fibonacci ottimizzato

```javascript
function fibonacciTailRec(n, a = 0, b = 1) {
  if (n === 0) return a;
  if (n === 1) return b;
  return fibonacciTailRec(n - 1, b, a + b);
}
```

## Trampoline: Un'Alternativa alla TCO

Dato che la TCO non è universalmente supportata in JavaScript, è possibile utilizzare un pattern chiamato "trampoline" per emularne il comportamento:

```javascript
function trampoline(fn) {
  return function(...args) {
    let result = fn(...args);
    
    // Continua a chiamare il risultato finché è una funzione
    while (typeof result === 'function') {
      result = result();
    }
    
    return result;
  };
}

// Versione trampolinata del fattoriale
function factorial(n) {
  function factorialHelper(n, acc) {
    if (n <= 1) return acc;
    
    // Restituisce una funzione invece di fare una chiamata ricorsiva
    return () => factorialHelper(n - 1, n * acc);
  }
  
  return trampoline(factorialHelper)(n, 1);
}

console.log(factorial(10000)); // Non causa stack overflow
```

Il pattern trampoline evita la crescita dello stack convenzionale trasformando le chiamate ricorsive in iterazioni.

## Ricorsione Mutuale e TCO

La TCO può beneficiare anche la ricorsione mutuale, dove due o più funzioni si chiamano reciprocamente:

```javascript
function isEven(n) {
  if (n === 0) return true;
  return isOdd(n - 1);
}

function isOdd(n) {
  if (n === 0) return false;
  return isEven(n - 1);
}
```

Entrambe le funzioni sono in forma tail recursive, quindi possono beneficiare della TCO se supportata.

## Best Practices per la Ricorsione Ottimizzata

1. **Utilizza accumulatori**: Converti la ricorsione normale in tail recursion utilizzando parametri accumulatori
2. **Assicurati che la chiamata ricorsiva sia l'ultima operazione**: Non eseguire calcoli dopo la chiamata ricorsiva
3. **Implementa fallback**: Utilizza tecniche come il trampoline quando la TCO non è disponibile
4. **Considera approcci ibridi**: A volte una soluzione mista ricorsiva/iterativa è la più pratica
5. **Testa su diverse piattaforme**: Verifica le performance su diversi motori JavaScript

## Conclusione

La Tail Call Optimization è una tecnica potente per ottimizzare la ricorsione in JavaScript, anche se il supporto non è universale. Comprendere la TCO e i principi della ricorsione in coda aiuta a scrivere codice ricorsivo più efficiente.

Anche quando la TCO non è disponibile, tecniche alternative come la trampolino possono aiutare a evitare i limiti dello stack per ricorsioni profonde, permettendo di utilizzare il paradigma ricorsivo senza preoccupazioni.

## Navigazione del Corso
- [📑 Indice](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/README.md)
- [⬅️ Pattern Ricorsivi Comuni](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/06-Ricorsione/teoria/02-PatternRicorsiviComuni.md)
- [➡️ Ricorsione vs Iterazione](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/06-Ricorsione/teoria/04-RicorsioneVsIterazione.md)
