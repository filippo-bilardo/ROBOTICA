# Maybe Monad

Il **Maybe Monad** (conosciuto anche come **Option** in alcune lingue) è probabilmente il monad più intuitivo e utile da cui iniziare. Risolve un problema che ogni programmatore ha incontrato: la gestione dei valori `null` o `undefined`.

## Il Problema dei Valori Nulli

Il codice che gestisce i valori nulli è spesso pieno di controlli condizionali:

```javascript
function getUserEmail(user) {
  if (user) {
    const profile = user.getProfile();
    if (profile) {
      const email = profile.getEmail();
      if (email) {
        return email.toLowerCase();
      }
    }
  }
  return "nessuna email disponibile";
}
```

Questo approccio porta a codice difficile da leggere, mantenere e comporre. È fonte di errori come:
- **Null Pointer Exceptions** (o in JavaScript: "Cannot read property 'x' of null/undefined")
- **Controlli condizionali dimenticati**
- **Logica business offuscata** dalla gestione degli errori

## L'Approccio Maybe

Il Maybe Monad fornisce una soluzione elegante: invece di restituire direttamente un valore che potrebbe essere nullo, restituiamo un contenitore che può essere:
- **Just(value)**: Contiene un valore non nullo
- **Nothing**: Rappresenta l'assenza di un valore

## Implementazione Base

```javascript
// Classe base Maybe
class Maybe {
  static just(value) {
    return new Just(value);
  }
  
  static nothing() {
    return new Nothing();
  }
  
  static of(value) {
    return value === null || value === undefined ? Maybe.nothing() : Maybe.just(value);
  }
  
  // Utility per creare un Maybe da un valore che potrebbe essere null/undefined
  static fromNullable(value) {
    return Maybe.of(value);
  }
}

// Implementazione di Just
class Just extends Maybe {
  constructor(value) {
    super();
    this._value = value;
  }
  
  map(fn) {
    return Maybe.fromNullable(fn(this._value));
  }
  
  flatMap(fn) {
    return fn(this._value);
  }
  
  getOrElse(defaultValue) {
    return this._value;
  }
  
  isNothing() {
    return false;
  }
  
  toString() {
    return `Just(${this._value})`;
  }
}

// Implementazione di Nothing
class Nothing extends Maybe {
  map(fn) {
    return this;
  }
  
  flatMap(fn) {
    return this;
  }
  
  getOrElse(defaultValue) {
    return defaultValue;
  }
  
  isNothing() {
    return true;
  }
  
  toString() {
    return 'Nothing';
  }
}
```

## Come utilizzare Maybe

Reimplementiamo l'esempio precedente usando Maybe:

```javascript
function getUserEmail(user) {
  return Maybe.fromNullable(user)
    .flatMap(u => Maybe.fromNullable(u.getProfile()))
    .flatMap(p => Maybe.fromNullable(p.getEmail()))
    .map(e => e.toLowerCase())
    .getOrElse("nessuna email disponibile");
}
```

Vantaggi di questo approccio:
1. **Nessun controllo condizionale esplicito**
2. **Composizione fluida** delle operazioni (chaining)
3. **Gestione uniforme** dei valori nulli
4. **Intent chiaro**: il tipo Maybe comunica che il valore potrebbe essere assente

## Pattern comuni con Maybe

### 1. Default Values

```javascript
const result = Maybe.fromNullable(someValue)
  .getOrElse("valore predefinito");
```

### 2. Conditional Execution

```javascript
Maybe.fromNullable(someValue)
  .map(x => {
    // Questo codice viene eseguito solo se il valore esiste
    console.log("Valore trovato:", x);
  });
```

### 3. Combining Multiple Maybes

```javascript
function validateAndSubmitForm(formData) {
  const name = Maybe.fromNullable(formData.name);
  const email = Maybe.fromNullable(formData.email);
  
  // Possiamo combinare maybe usando funzioni di utility
  return lift2((n, e) => ({ name: n, email: e }), name, email)
    .map(submitToServer)
    .getOrElse(() => console.error("Dati del form incompleti"));
}

// Utility per sollevare una funzione a 2 parametri in Maybe
function lift2(fn, ma, mb) {
  return ma.flatMap(a => mb.map(b => fn(a, b)));
}
```

## Maybe vs. Optional Chaining

JavaScript ha introdotto l'optional chaining (`?.`) come funzionalità del linguaggio. Confrontiamolo con Maybe:

```javascript
// Con Optional Chaining
const email = user?.profile?.getEmail()?.toLowerCase() || "nessuna email disponibile";

// Con Maybe
const email = Maybe.fromNullable(user)
  .flatMap(u => Maybe.fromNullable(u.profile))
  .flatMap(p => Maybe.fromNullable(p.getEmail()))
  .map(e => e.toLowerCase())
  .getOrElse("nessuna email disponibile");
```

**Differenze**:
- **Optional chaining** è più conciso e nativo
- **Maybe** è più espressivo e componibile con altre operazioni funzionali
- **Maybe** rende esplicita l'intenzione di gestire valori nulli
- **Maybe** può essere esteso con altre operazioni (filter, fold, ecc.)

## Maybe come Functor e Applicative

Il Maybe Monad implementa anche l'interfaccia Functor (attraverso `map`) e può implementare Applicative:

```javascript
// Applicative functionality
Maybe.prototype.ap = function(maybeWithFunction) {
  return maybeWithFunction.flatMap(fn => this.map(fn));
};
```

## Conclusioni

Il Maybe Monad trasforma la gestione dei valori nulli da un caso speciale a un caso regolare che segue pattern ben definiti. Ci aiuta a:

1. **Evitare bug** relativi a valori nulli
2. **Rendere esplicita** l'eventuale assenza di valori
3. **Comporre** operazioni in modo sicuro e leggibile
4. **Separare** la logica business dalla gestione degli errori

Nel prossimo capitolo, esploreremo l'**Either Monad**, che estende il concetto di Maybe per fornire informazioni sul motivo di un fallimento.
