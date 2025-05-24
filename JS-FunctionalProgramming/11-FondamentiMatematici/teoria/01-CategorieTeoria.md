# Fondamenti Matematici della Programmazione Funzionale

## Introduzione alla Teoria delle Categorie

La teoria delle categorie fornisce le basi matematiche per molti concetti della programmazione funzionale. Questo modulo esplora i principi fondamentali che sottendono i pattern che abbiamo studiato.

## Categorie in Programmazione

### Definizione di Categoria

Una categoria **C** consiste di:

1. **Oggetti**: tipi di dati (int, string, User, etc.)
2. **Morfismi** (frecce): funzioni tra oggetti
3. **Composizione**: operazione per combinare morfismi
4. **Identità**: morfismo identità per ogni oggetto

```javascript
// La categoria dei tipi JavaScript
// Oggetti: Number, String, Boolean, etc.
// Morfismi: funzioni pure

// Morfismo: Number -> String
const numberToString = (n) => n.toString();

// Morfismo: String -> Number
const stringLength = (s) => s.length;

// Composizione di morfismi
const compose = (f, g) => (x) => f(g(x));
const numberToStringLength = compose(stringLength, numberToString);

// Legge di associatività: (h ∘ g) ∘ f = h ∘ (g ∘ f)
const h = (x) => x * 2;
const g = (x) => x + 1;
const f = (x) => x.toString();

const leftAssoc = compose(compose(h, g), f);
const rightAssoc = compose(h, compose(g, f));
// leftAssoc e rightAssoc sono equivalenti
```

## Functors: Mapping tra Categorie

### Definizione Formale

Un functor **F: C → D** tra categorie mappa:
- Ogni oggetto `A` in `C` a un oggetto `F(A)` in `D`
- Ogni morfismo `f: A → B` a un morfismo `F(f): F(A) → F(B)`

Preservando:
- Identità: `F(id_A) = id_F(A)`
- Composizione: `F(g ∘ f) = F(g) ∘ F(f)`

```javascript
// Array come Functor
class ArrayFunctor {
  constructor(values) {
    this.values = values;
  }
  
  // fmap: (a -> b) -> F a -> F b
  map(f) {
    return new ArrayFunctor(this.values.map(f));
  }
  
  // Verifica delle leggi dei functor
  static verifyIdentity(arr) {
    const identity = x => x;
    const mapped = arr.map(identity);
    return JSON.stringify(mapped.values) === JSON.stringify(arr.values);
  }
  
  static verifyComposition(arr, f, g) {
    const composed = arr.map(x => g(f(x)));
    const sequential = arr.map(f).map(g);
    return JSON.stringify(composed.values) === JSON.stringify(sequential.values);
  }
}

// Test delle leggi
const numbers = new ArrayFunctor([1, 2, 3]);
const double = x => x * 2;
const addOne = x => x + 1;

console.log('Identity Law:', ArrayFunctor.verifyIdentity(numbers));
console.log('Composition Law:', ArrayFunctor.verifyComposition(numbers, double, addOne));
```

## Natural Transformations

Le trasformazioni naturali sono "mappature" tra functor che preservano la struttura.

```javascript
// Trasformazione naturale: Maybe -> Array
const maybeToArray = (maybe) => {
  return maybe.isNothing() ? [] : [maybe.value];
};

// Trasformazione naturale: Array -> Maybe
const arrayToMaybe = (arr) => {
  return arr.length === 0 ? Maybe.nothing() : Maybe.just(arr[0]);
};

// Le trasformazioni naturali commutano con fmap
// maybeToArray(maybe.map(f)) === arrayToMaybe(maybe).map(f)
```

## Monads e Kleisli Categories

### Kleisli Category

Per ogni monad **M**, esiste una categoria di Kleisli dove:
- Oggetti: stessi della categoria originale
- Morfismi: funzioni `A → M(B)`
- Composizione: composizione di Kleisli `(>=>`

```javascript
// Composizione di Kleisli per Maybe
const kleisliCompose = (f, g) => (x) => {
  const result = g(x);
  return result.isNothing() ? result : f(result.value);
};

// Operatore di composizione di Kleisli
const composeK = (f, g) => x => g(x).flatMap(f);

// Esempio: pipeline di validazione
const validateLength = (str) => 
  str.length > 3 ? Maybe.just(str) : Maybe.nothing();

const validateEmail = (str) => 
  str.includes('@') ? Maybe.just(str) : Maybe.nothing();

const validateUser = composeK(validateEmail, validateLength);

console.log(validateUser("test@example.com")); // Maybe.just("test@example.com")
console.log(validateUser("hi"));               // Maybe.nothing()
```

## Leggi Matematiche

### Leggi dei Functor

```javascript
// 1. Legge dell'Identità
// fmap(id) = id
const identityLaw = (functor) => {
  const id = x => x;
  return functor.map(id).equals(functor);
};

// 2. Legge di Composizione
// fmap(f . g) = fmap(f) . fmap(g)
const compositionLaw = (functor, f, g) => {
  const composed = x => f(g(x));
  const left = functor.map(composed);
  const right = functor.map(g).map(f);
  return left.equals(right);
};
```

### Leggi dei Monad

```javascript
// 1. Identità Sinistra: return a >>= f ≡ f a
const leftIdentityLaw = (monad, a, f) => {
  const left = monad.of(a).flatMap(f);
  const right = f(a);
  return left.equals(right);
};

// 2. Identità Destra: m >>= return ≡ m
const rightIdentityLaw = (monad, m) => {
  const left = m.flatMap(monad.of);
  return left.equals(m);
};

// 3. Associatività: (m >>= f) >>= g ≡ m >>= (\x -> f x >>= g)
const associativityLaw = (monad, m, f, g) => {
  const left = m.flatMap(f).flatMap(g);
  const right = m.flatMap(x => f(x).flatMap(g));
  return left.equals(right);
};
```

## Applicative Functors

```javascript
class Applicative {
  constructor(value) {
    this.value = value;
  }
  
  static of(value) {
    return new Applicative(value);
  }
  
  map(f) {
    return new Applicative(f(this.value));
  }
  
  // <*> operator: applicazione di funzione
  ap(funcApplicative) {
    return funcApplicative.map(f => f(this.value));
  }
  
  // Leggi degli Applicative
  static identityLaw(applicative) {
    const identity = x => x;
    const result = applicative.ap(Applicative.of(identity));
    return result.equals(applicative);
  }
  
  static compositionLaw(u, v, w) {
    const compose = f => g => x => f(g(x));
    const left = w.ap(v.ap(u.ap(Applicative.of(compose))));
    const right = w.ap(v).ap(u);
    return left.equals(right);
  }
  
  equals(other) {
    return this.value === other.value;
  }
}

// Utilizzo con funzioni multi-parametro
const add = a => b => a + b;
const result = Applicative.of(2).ap(Applicative.of(3).ap(Applicative.of(add)));
console.log(result.value); // 5
```

## Isomorfismi e Equivalenze

```javascript
// Curry-Howard Correspondence in JavaScript
// Tipi come proposizioni, programmi come prove

// A × B → C ≅ A → (B → C)
const curry = (f) => (a) => (b) => f([a, b]);
const uncurry = (f) => ([a, b]) => f(a)(b);

// Dimostrazione dell'isomorfismo
const isIsomorphism = (f) => {
  const curried = curry(uncurry(f));
  const uncurried = uncurry(curry(f));
  // Verificare che curried ≡ f e uncurried ≡ f (nei limiti di JavaScript)
  return true; // Semplificato per l'esempio
};
```

## Esercizi Avanzati

### 1. Implementa Comonad

```javascript
// Un comonad ha operazioni duali rispetto ai monad
class Comonad {
  constructor(value, context = []) {
    this.value = value;
    this.context = context;
  }
  
  // extract: W a -> a (duale di return)
  extract() {
    return this.value;
  }
  
  // duplicate: W a -> W (W a) (duale di join)
  duplicate() {
    return new Comonad(this, this.context);
  }
  
  // extend: (W a -> b) -> W a -> W b (duale di bind)
  extend(f) {
    return new Comonad(f(this), this.context);
  }
}
```

### 2. Verifica delle Leggi

Implementa funzioni di test per verificare automaticamente le leggi matematiche per i tuoi tipi di dati.

## Conclusione

La comprensione dei fondamenti matematici fornisce:

1. **Correttezza**: Garanzie formali sul comportamento del codice
2. **Composabilità**: Principi per combinare componenti in modo predicibile
3. **Astrazione**: Pattern generali applicabili a diversi domini
4. **Ottimizzazione**: Trasformazioni basate su equivalenze matematiche

Questi concetti, sebbene astratti, forniscono la base teorica per scrivere codice funzionale robusto e predicibile.

## Navigazione del Corso

← [Modulo 10: Librerie Funzionali](../10-LibrerieFunzionali/README.md) | [Successivo: Performance Optimization](02-OptimizationAvanzata.md) →
