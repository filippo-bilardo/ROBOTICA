# Either Monad

Se il **Maybe Monad** ci permette di gestire l'assenza di un valore, l'**Either Monad** ci permette di gestire situazioni in cui un'operazione può fallire e vogliamo sapere *perché* ha fallito.

## Il Problema della Gestione Errori

La gestione tradizionale degli errori in JavaScript si basa su:

1. **Valori di ritorno speciali**: Restituire codici di errore o oggetti speciali
2. **Throw/Catch**: Lanciare eccezioni e catturarle con blocchi try/catch

Entrambi gli approcci hanno problemi:
- I **valori di ritorno speciali** mescolano errori e risultati validi nello stesso tipo
- Il **throw/catch** interrompe il flusso normale del programma ed è difficile da comporre

## Either come Soluzione

L'**Either Monad** rappresenta un valore che può essere di uno tra due tipi:
- **Right**: Rappresenta il caso di successo (il valore "giusto")
- **Left**: Rappresenta il caso di errore (il valore "sbagliato")

Invece di lanciare eccezioni, una funzione che usa Either restituirà:
- `Right(value)` in caso di successo
- `Left(error)` in caso di errore

## Implementazione Base

```javascript
// Classe base Either
class Either {
  static right(value) {
    return new Right(value);
  }
  
  static left(value) {
    return new Left(value);
  }
  
  static of(value) {
    return Either.right(value);
  }
  
  // Utility per creare un Either da una funzione che potrebbe lanciare un'eccezione
  static try(fn) {
    try {
      return Either.right(fn());
    } catch (e) {
      return Either.left(e);
    }
  }
}

// Right rappresenta il caso di successo
class Right extends Either {
  constructor(value) {
    super();
    this._value = value;
  }
  
  map(fn) {
    return Either.right(fn(this._value));
  }
  
  flatMap(fn) {
    return fn(this._value);
  }
  
  getOrElse() {
    return this._value;
  }
  
  orElse() {
    return this;
  }
  
  match(pattern) {
    return pattern.right(this._value);
  }
  
  isLeft() {
    return false;
  }
  
  isRight() {
    return true;
  }
  
  toString() {
    return `Right(${this._value})`;
  }
}

// Left rappresenta il caso di errore
class Left extends Either {
  constructor(value) {
    super();
    this._value = value;
  }
  
  map() {
    return this;
  }
  
  flatMap() {
    return this;
  }
  
  getOrElse(defaultValue) {
    return defaultValue;
  }
  
  orElse(fn) {
    return fn(this._value);
  }
  
  match(pattern) {
    return pattern.left(this._value);
  }
  
  isLeft() {
    return true;
  }
  
  isRight() {
    return false;
  }
  
  toString() {
    return `Left(${this._value})`;
  }
}
```

## Come Utilizzare Either

### Gestione Errori in Stile Funzionale

```javascript
function divide(a, b) {
  return b === 0 
    ? Either.left(new Error("Divisione per zero"))
    : Either.right(a / b);
}

// Uso
const result = divide(10, 2)
  .map(result => `Il risultato è ${result}`)
  .getOrElse("Operazione non valida");

console.log(result); // "Il risultato è 5"

const errorResult = divide(10, 0)
  .map(result => `Il risultato è ${result}`)
  .getOrElse("Operazione non valida");

console.log(errorResult); // "Operazione non valida"
```

### Pattern Matching

Either permette un elegante pattern matching per gestire entrambi i casi:

```javascript
const result = divide(10, 2).match({
  right: value => `Successo: ${value}`,
  left: error => `Errore: ${error.message}`
});

console.log(result); // "Successo: 5"
```

### Conversione da Funzioni che Lanciano Eccezioni

```javascript
function parseJSON(json) {
  return Either.try(() => JSON.parse(json));
}

const validResult = parseJSON('{"name": "Alice"}')
  .map(data => data.name)
  .getOrElse("Nome non disponibile");

console.log(validResult); // "Alice"

const invalidResult = parseJSON('{"name": }')
  .map(data => data.name)
  .getOrElse("Nome non disponibile");

console.log(invalidResult); // "Nome non disponibile"
```

## Railway Oriented Programming

Either permette un approccio chiamato **Railway Oriented Programming**, in cui il codice viene visto come un binario ferroviario con due tracce:
- Traccia "felice" (Right): elaborazione normale
- Traccia "infelice" (Left): gestione errori

![Railway Oriented Programming](https://fsharpforfunandprofit.com/assets/img/ScrollRailway.png)

```javascript
// Immaginiamo una serie di operazioni che potrebbero fallire
function validateInput(input) {
  return input.length > 0 
    ? Either.right(input)
    : Either.left("Input vuoto");
}

function processData(data) {
  return data.startsWith("valid")
    ? Either.right(data.toUpperCase())
    : Either.left("Formato dati non valido");
}

function saveToDatabase(data) {
  // Simuliamo un'operazione di salvataggio
  console.log(`Saving ${data} to database`);
  return Either.right({ success: true, data });
}

// Composizione di operazioni
const result = validateInput("valid_data")
  .flatMap(processData)
  .flatMap(saveToDatabase);

// Gestione del risultato
result.match({
  right: result => console.log("Operazione completata:", result),
  left: error => console.error("Errore:", error)
});
```

## Either vs. Try/Catch

Confrontiamo l'approccio Either con il tradizionale try/catch:

```javascript
// Con try/catch
function divideTraditional(a, b) {
  try {
    if (b === 0) throw new Error("Divisione per zero");
    return a / b;
  } catch (e) {
    return "Errore: " + e.message;
  }
}

// Con Either
function divideEither(a, b) {
  return b === 0
    ? Either.left(new Error("Divisione per zero"))
    : Either.right(a / b);
}
```

Vantaggi di Either:
1. **Composizione** - Facile da combinare con altre operazioni
2. **Esplicitezza** - Il tipo di ritorno comunica che potrebbe esserci un errore
3. **Immutabilità** - Non ci sono side effects
4. **Controlled flow** - Il flusso di esecuzione non viene interrotto

## Either come Bifunctor

Either è più potente di Maybe perché è un **bifunctor** - può mappare entrambi i lati del contesto:

```javascript
// Estensione della classe Either con metodi bifunctor
Either.prototype.bimap = function(leftFn, rightFn) {
  return this.isLeft()
    ? Either.left(leftFn(this._value))
    : Either.right(rightFn(this._value));
};

// Esempio di utilizzo
const result = divide(10, 0)
  .bimap(
    error => `Si è verificato un errore: ${error.message}`,
    value => `Il risultato è ${value}`
  );

console.log(result.toString()); // Left(Si è verificato un errore: Divisione per zero)
```

## Combinare Multiple Either

```javascript
function lift2Either(fn, ea, eb) {
  return ea.flatMap(a => eb.map(b => fn(a, b)));
}

const a = Either.right(10);
const b = Either.right(5);
const c = Either.left("Input non valido");

const sum = lift2Either((x, y) => x + y, a, b);  // Right(15)
const invalid = lift2Either((x, y) => x + y, a, c);  // Left("Input non valido")
```

## Either vs. Result Type

Molte lingue moderne hanno un tipo built-in simile a Either:
- **Rust**: `Result<T, E>`
- **Swift**: `Result<Success, Failure>`
- **Kotlin**: `Result<T>`

In JavaScript, dobbiamo implementarlo noi stessi o usare una libreria.

## Conclusione

L'**Either Monad** trasforma la gestione degli errori da un meccanismo speciale (eccezioni) a un caso normale gestito attraverso tipi di dati regolari. Questo porta a:

1. **Codice più predicibile** (niente interruzioni di flusso)
2. **Migliore componibilità** (le funzioni possono essere combinate)
3. **Errori come first-class citizens** (non più relegati a casi eccezionali)
4. **Codice più espressivo** (il tipo comunica le possibilità di errore)

Nel prossimo capitolo, esploreremo i monad **IO e Task** per gestire gli effetti collaterali e le operazioni asincrone in modo funzionale.
