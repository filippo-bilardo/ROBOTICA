# TypeScript Avanzato e Programmazione Funzionale

## Introduzione

TypeScript offre un sistema di tipi potente che si integra perfettamente con i paradigmi della programmazione funzionale, permettendo di scrivere codice più sicuro e espressivo.

## 1. Tipi Funzionali Avanzati

### Mapped Types per Funzioni

```typescript
// Tipo per rendere tutti i metodi di un oggetto curried
type Curried<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer R
    ? Args extends [infer First, ...infer Rest]
      ? (arg: First) => Rest extends []
        ? R
        : Curried<(...args: Rest) => R>
      : T[K]
    : T[K];
};

// Esempio di utilizzo
interface Calculator {
  add(a: number, b: number): number;
  multiply(a: number, b: number, c: number): number;
}

const curriedCalculator: Curried<Calculator> = {
  add: (a: number) => (b: number) => a + b,
  multiply: (a: number) => (b: number) => (c: number) => a * b * c
};
```

### Template Literal Types per Funzioni

```typescript
// Tipo per validazione runtime con pattern matching
type ValidationRule = `validate-${string}`;
type Transform<T extends string> = T extends `validate-${infer Rule}`
  ? `is${Capitalize<Rule>}Valid`
  : never;

// Implementazione
const createValidator = <T extends ValidationRule>(
  rule: T
): Record<Transform<T>, (value: any) => boolean> => {
  const functionName = rule.replace('validate-', '') as Transform<T>;
  return {
    [`is${functionName.charAt(0).toUpperCase() + functionName.slice(1)}Valid`]: 
      (value: any) => typeof value === 'string' && value.length > 0
  } as any;
};
```

## 2. Higher-Kinded Types Simulation

### Functor Pattern

```typescript
// Simulazione di Higher-Kinded Types
interface HKT<F, A> {
  readonly _URI: F;
  readonly _A: A;
}

interface Functor<F> {
  readonly map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>;
}

// Implementazione per Array
interface ArrayURI {
  readonly ArrayURI: unique symbol;
}

type ArrayHKT<A> = HKT<ArrayURI, A> & ReadonlyArray<A>;

const arrayFunctor: Functor<ArrayURI> = {
  map: <A, B>(fa: ArrayHKT<A>, f: (a: A) => B): ArrayHKT<B> =>
    fa.map(f) as ArrayHKT<B>
};

// Implementazione per Option
interface OptionURI {
  readonly OptionURI: unique symbol;
}

type Some<A> = { readonly _tag: 'Some'; readonly value: A };
type None = { readonly _tag: 'None' };
type Option<A> = Some<A> | None;
type OptionHKT<A> = HKT<OptionURI, A> & Option<A>;

const optionFunctor: Functor<OptionURI> = {
  map: <A, B>(fa: OptionHKT<A>, f: (a: A) => B): OptionHKT<B> =>
    fa._tag === 'Some' 
      ? ({ _tag: 'Some', value: f(fa.value) } as OptionHKT<B>)
      : ({ _tag: 'None' } as OptionHKT<B>)
};
```

## 3. Advanced Function Types

### Branded Types per Type Safety

```typescript
// Branded types per valori specifici
type UserId = string & { readonly brand: unique symbol };
type Email = string & { readonly brand: unique symbol };
type Money = number & { readonly brand: unique symbol };

// Smart constructors
const createUserId = (id: string): UserId => {
  if (id.length < 3) throw new Error('Invalid UserId');
  return id as UserId;
};

const createEmail = (email: string): Email => {
  if (!email.includes('@')) throw new Error('Invalid Email');
  return email as Email;
};

const createMoney = (amount: number): Money => {
  if (amount < 0) throw new Error('Invalid Money amount');
  return amount as Money;
};

// Funzioni type-safe
const sendEmail = (userId: UserId, email: Email, amount: Money) => {
  // TypeScript garantisce che i tipi siano corretti
  console.log(`Sending ${amount} to ${email} for user ${userId}`);
};
```

### Conditional Types Avanzati

```typescript
// Utility type per estrarre tipi di ritorno di funzioni async
type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R>
  ? R
  : T extends (...args: any[]) => infer R
  ? R
  : never;

// Utility type per creare versioni async di funzioni
type Asyncify<T> = T extends (...args: infer Args) => infer R
  ? (...args: Args) => Promise<R>
  : never;

// Esempio di utilizzo
const syncFunction = (x: number, y: string): boolean => x > 0 && y.length > 0;
type AsyncVersion = Asyncify<typeof syncFunction>;
// Risultato: (x: number, y: string) => Promise<boolean>

const asyncVersion: AsyncVersion = async (x, y) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return syncFunction(x, y);
};
```

## 4. Pattern Matching con TypeScript

### Discriminated Unions Avanzate

```typescript
// Result type con pattern matching
type Result<T, E = Error> = 
  | { readonly kind: 'success'; readonly value: T }
  | { readonly kind: 'error'; readonly error: E };

// Pattern matcher type-safe
const match = <T, E, R>(
  result: Result<T, E>,
  patterns: {
    success: (value: T) => R;
    error: (error: E) => R;
  }
): R => {
  switch (result.kind) {
    case 'success':
      return patterns.success(result.value);
    case 'error':
      return patterns.error(result.error);
  }
};

// Utilizzo
const divide = (a: number, b: number): Result<number, string> =>
  b === 0 
    ? { kind: 'error', error: 'Division by zero' }
    : { kind: 'success', value: a / b };

const result = divide(10, 2);
const message = match(result, {
  success: (value) => `Result: ${value}`,
  error: (error) => `Error: ${error}`
});
```

### Recursive Types per Strutture Dati

```typescript
// Lista funzionale immutabile
type List<T> = 
  | { readonly kind: 'nil' }
  | { readonly kind: 'cons'; readonly head: T; readonly tail: List<T> };

const nil = <T>(): List<T> => ({ kind: 'nil' });
const cons = <T>(head: T, tail: List<T>): List<T> => 
  ({ kind: 'cons', head, tail });

// Funzioni per lavorare con le liste
const map = <A, B>(list: List<A>, f: (a: A) => B): List<B> =>
  match(list, {
    nil: () => nil<B>(),
    cons: ({ head, tail }) => cons(f(head), map(tail, f))
  });

const fold = <A, B>(list: List<A>, initial: B, f: (acc: B, a: A) => B): B =>
  match(list, {
    nil: () => initial,
    cons: ({ head, tail }) => fold(tail, f(initial, head), f)
  });

// Pattern matcher per List
const match = <T, R>(
  list: List<T>,
  patterns: {
    nil: () => R;
    cons: (data: { head: T; tail: List<T> }) => R;
  }
): R => {
  switch (list.kind) {
    case 'nil':
      return patterns.nil();
    case 'cons':
      return patterns.cons({ head: list.head, tail: list.tail });
  }
};
```

## 5. Composizione di Tipi Funzionali

### Pipe Operator Simulation

```typescript
// Simulazione del pipe operator con tipi precisi
interface Pipe {
  <A>(value: A): A;
  <A, B>(value: A, fn1: (a: A) => B): B;
  <A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
  <A, B, C, D>(
    value: A, 
    fn1: (a: A) => B, 
    fn2: (b: B) => C, 
    fn3: (c: C) => D
  ): D;
  // ... più overload se necessario
}

const pipe: Pipe = (value: any, ...fns: Function[]) =>
  fns.reduce((acc, fn) => fn(acc), value);

// Utilizzo type-safe
const result = pipe(
  "hello world",
  (s: string) => s.split(' '),
  (arr: string[]) => arr.map(s => s.toUpperCase()),
  (arr: string[]) => arr.join('-'),
  (s: string) => s.length
); // Tipo inferito: number
```

### Function Composition Avanzata

```typescript
// Compose con inferenza di tipi automatica
type Compose = {
  <A, B>(fn1: (a: A) => B): (a: A) => B;
  <A, B, C>(fn2: (b: B) => C, fn1: (a: A) => B): (a: A) => C;
  <A, B, C, D>(
    fn3: (c: C) => D,
    fn2: (b: B) => C,
    fn1: (a: A) => B
  ): (a: A) => D;
};

const compose: Compose = (...fns: Function[]) => (value: any) =>
  fns.reduceRight((acc, fn) => fn(acc), value);

// Utilizzo
const processString = compose(
  (n: number) => n.toString(),
  (arr: string[]) => arr.length,
  (s: string) => s.split('')
);

const result = processString("hello"); // string
```

## 6. Error Handling Avanzato

### Either Monad con TypeScript

```typescript
type Either<L, R> = 
  | { readonly _tag: 'Left'; readonly left: L }
  | { readonly _tag: 'Right'; readonly right: R };

const left = <L, R = never>(value: L): Either<L, R> => 
  ({ _tag: 'Left', left: value });

const right = <R, L = never>(value: R): Either<L, R> => 
  ({ _tag: 'Right', right: value });

// Implementazione Functor
const mapEither = <L, A, B>(
  either: Either<L, A>, 
  f: (a: A) => B
): Either<L, B> =>
  either._tag === 'Right' 
    ? right(f(either.right))
    : either;

// Implementazione Monad
const flatMapEither = <L, A, B>(
  either: Either<L, A>,
  f: (a: A) => Either<L, B>
): Either<L, B> =>
  either._tag === 'Right' 
    ? f(either.right)
    : either;

// Funzioni di utilità
const isLeft = <L, R>(either: Either<L, R>): either is { _tag: 'Left'; left: L } =>
  either._tag === 'Left';

const isRight = <L, R>(either: Either<L, R>): either is { _tag: 'Right'; right: R } =>
  either._tag === 'Right';

// Esempio di utilizzo per validazione
type ValidationError = string;

const validateEmail = (email: string): Either<ValidationError, string> =>
  email.includes('@') 
    ? right(email)
    : left('Invalid email format');

const validateLength = (str: string): Either<ValidationError, string> =>
  str.length >= 3
    ? right(str)
    : left('String too short');

const validateUser = (email: string) =>
  pipe(
    validateEmail(email),
    (result) => flatMapEither(result, validateLength)
  );
```

## Conclusioni

TypeScript offre strumenti potenti per implementare pattern di programmazione funzionale in modo type-safe. La combinazione di:

- **Tipi avanzati** per maggiore sicurezza
- **Pattern matching** tramite discriminated unions
- **Higher-kinded types simulation** per astrazioni potenti
- **Branded types** per domini specifici
- **Error handling** con Either e Result

Permette di scrivere codice funzionale robusto e maintainabile, sfruttando al massimo le capacità del sistema di tipi di TypeScript.

## Risorse Aggiuntive

- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [fp-ts Library](https://gcanti.github.io/fp-ts/) - Libreria per programmazione funzionale con TypeScript
- [Effect-TS](https://effect.website/) - Sistema di tipi per effetti in TypeScript
