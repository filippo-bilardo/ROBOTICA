/**
 * Esercizio: Gestione Valori Nulli
 * 
 * In questo esercizio implementerai e utilizzerai il Maybe monad
 * per gestire valori potenzialmente nulli o undefined.
 */

// ==========================================
// ESERCIZIO 1: Implementazione di Maybe Monad
// ==========================================

// Implementa il Maybe monad secondo la specifica seguente:

/**
 * Maybe Monad - Classe base
 * Implementa i seguenti metodi:
 * - of(value): metodo statico che crea un Just con il valore specificato
 * - fromNullable(value): metodo statico che crea Just o Nothing a seconda che il valore sia null/undefined
 * - map(fn): applica una funzione al valore se presente (Just), ritorna this se Nothing
 * - chain(fn): applica una funzione che ritorna un Maybe al valore se presente
 * - getOrElse(defaultValue): ritorna il valore o il default se Nothing
 * - orElse(fn): esegue una funzione che ritorna un Maybe se Nothing, altrimenti ritorna this
 * - filter(predicate): converte a Nothing se il predicato ritorna false
 * - toString(): rappresentazione stringa del Maybe
 */

// Implementazione del Maybe Monad
class Maybe {
    constructor(value) {
        this.value = value;
    }

    static of(value) {
        return new Just(value);
    }

    static fromNullable(value) {
        return value == null ? new Nothing() : new Just(value);
    }

    static nothing() {
        return new Nothing();
    }

    isNothing() {
        return false;
    }

    isJust() {
        return false;
    }
}

class Just extends Maybe {
    constructor(value) {
        super(value);
    }

    map(fn) {
        try {
            return Maybe.fromNullable(fn(this.value));
        } catch (e) {
            return new Nothing();
        }
    }

    chain(fn) {
        try {
            return fn(this.value);
        } catch (e) {
            return new Nothing();
        }
    }

    getOrElse(defaultValue) {
        return this.value;
    }

    orElse(fn) {
        return this;
    }

    filter(predicate) {
        try {
            return predicate(this.value) ? this : new Nothing();
        } catch (e) {
            return new Nothing();
        }
    }

    isJust() {
        return true;
    }

    toString() {
        return `Just(${this.value})`;
    }
}

class Nothing extends Maybe {
    constructor() {
        super(null);
    }

    map(fn) {
        return this;
    }

    chain(fn) {
        return this;
    }

    getOrElse(defaultValue) {
        return defaultValue;
    }

    orElse(fn) {
        return fn();
    }

    filter(predicate) {
        return this;
    }

    isNothing() {
        return true;
    }

    toString() {
        return 'Nothing';
    }
}

// Test della implementazione
console.log('=== TEST MAYBE MONAD ===');

// Test basic functionality
const justValue = Maybe.of(42);
const nothingValue = Maybe.fromNullable(null);

console.log('Just(42):', justValue.toString());
console.log('Nothing:', nothingValue.toString());

// Test map
console.log('Just(42).map(x => x * 2):', justValue.map(x => x * 2).toString());
console.log('Nothing.map(x => x * 2):', nothingValue.map(x => x * 2).toString());

// Test getOrElse
console.log('Just(42).getOrElse(0):', justValue.getOrElse(0));
console.log('Nothing.getOrElse(0):', nothingValue.getOrElse(0));

// ==========================================
// ESERCIZIO 2: Recupero di proprietà annidate
// ==========================================

// Dati di esempio
const users = {
  "user1": {
    name: "Mario Rossi",
    address: {
      street: "Via Roma 123",
      city: "Milano",
      zipCode: "20100"
    },
    contacts: {
      email: "mario@example.com",
      phone: {
        home: "02-1234567",
        mobile: "333-1234567"
      }
    }
  },
  "user2": {
    name: "Luigi Verdi",
    address: null,
    contacts: {
      email: "luigi@example.com",
      phone: {
        mobile: "334-7654321"
      }
    }
  },
  "user3": {
    name: "Anna Bianchi",
    address: {
      street: "Corso Venezia 45",
      city: "Torino"
      // zipCode mancante
    },
    contacts: {
      phone: {}
    }
    // email mancante
  }
};

/**
 * TODO: Implementa le seguenti funzioni usando Maybe per accesso sicuro alle proprietà
 */

// Funzione helper per accesso sicuro alle proprietà
const safeGet = (path, obj) => {
  const keys = path.split('.');
  return keys.reduce((acc, key) => {
    return acc.chain(value => Maybe.fromNullable(value[key]));
  }, Maybe.fromNullable(obj));
};

// 2.1 Funzione per ottenere l'email di un utente
const getUserEmail = (userId) => {
  return safeGet(`${userId}.contacts.email`, users);
};

// 2.2 Funzione per ottenere il telefono mobile di un utente
const getUserMobile = (userId) => {
  return safeGet(`${userId}.contacts.phone.mobile`, users);
};

// 2.3 Funzione per ottenere il codice postale di un utente
const getUserZipCode = (userId) => {
  return safeGet(`${userId}.address.zipCode`, users);
};

// 2.4 Funzione per ottenere il nome della città di un utente
const getUserCity = (userId) => {
  return safeGet(`${userId}.address.city`, users);
};

// Test delle funzioni
console.log('\n=== TEST ACCESSO PROPRIETÀ ===');

console.log('Email user1:', getUserEmail('user1').getOrElse('Email non trovata'));
console.log('Email user2:', getUserEmail('user2').getOrElse('Email non trovata'));
console.log('Email user3:', getUserEmail('user3').getOrElse('Email non trovata'));

console.log('\nMobile user1:', getUserMobile('user1').getOrElse('Mobile non trovato'));
console.log('Mobile user2:', getUserMobile('user2').getOrElse('Mobile non trovato'));
console.log('Mobile user3:', getUserMobile('user3').getOrElse('Mobile non trovato'));

console.log('\nZipCode user1:', getUserZipCode('user1').getOrElse('CAP non trovato'));
console.log('ZipCode user2:', getUserZipCode('user2').getOrElse('CAP non trovato'));
console.log('ZipCode user3:', getUserZipCode('user3').getOrElse('CAP non trovato'));

// ==========================================
// ESERCIZIO 3: Chain di operazioni
// ==========================================

console.log('\n=== ESERCIZIO 3: CHAIN OPERATIONS ===');

// 3.1 Funzione per processare e formattare informazioni utente
const processUserInfo = (userId) => {
  return Maybe.fromNullable(users[userId])
    .chain(user => 
      Maybe.fromNullable(user.name)
        .map(name => ({
          name,
          hasAddress: user.address != null,
          hasEmail: user.contacts && user.contacts.email != null,
          hasMobile: user.contacts && user.contacts.phone && user.contacts.phone.mobile != null
        }))
    );
};

// 3.2 Funzione per creare un indirizzo completo
const getFullAddress = (userId) => {
  return Maybe.fromNullable(users[userId])
    .chain(user => Maybe.fromNullable(user.address))
    .chain(address => {
      const street = Maybe.fromNullable(address.street);
      const city = Maybe.fromNullable(address.city);
      const zipCode = Maybe.fromNullable(address.zipCode);
      
      // Combina tutte le parti dell'indirizzo disponibili
      return street.chain(s => 
        city.map(c => {
          const zip = zipCode.getOrElse('');
          return zip ? `${s}, ${c} ${zip}` : `${s}, ${c}`;
        })
      );
    });
};

// Test delle operazioni chain
console.log('User1 info:', processUserInfo('user1').getOrElse('Utente non trovato'));
console.log('User2 info:', processUserInfo('user2').getOrElse('Utente non trovato'));
console.log('User3 info:', processUserInfo('user3').getOrElse('Utente non trovato'));

console.log('\nFull address user1:', getFullAddress('user1').getOrElse('Indirizzo non completo'));
console.log('Full address user2:', getFullAddress('user2').getOrElse('Indirizzo non completo'));
console.log('Full address user3:', getFullAddress('user3').getOrElse('Indirizzo non completo'));

// ==========================================
// ESERCIZIO 4: Validazione con filter
// ==========================================

console.log('\n=== ESERCIZIO 4: VALIDAZIONE ===');

// 4.1 Validatore di email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 4.2 Validatore di telefono mobile
const isValidMobile = (mobile) => {
  const mobileRegex = /^[\d-]+$/;
  return mobile && mobile.length >= 10 && mobileRegex.test(mobile);
};

// 4.3 Funzione per ottenere email valida
const getValidEmail = (userId) => {
  return getUserEmail(userId)
    .filter(isValidEmail);
};

// 4.4 Funzione per ottenere mobile valido
const getValidMobile = (userId) => {
  return getUserMobile(userId)
    .filter(isValidMobile);
};

// Test validazioni
console.log('Valid email user1:', getValidEmail('user1').getOrElse('Email non valida'));
console.log('Valid email user2:', getValidEmail('user2').getOrElse('Email non valida'));
console.log('Valid email user3:', getValidEmail('user3').getOrElse('Email non valida'));

console.log('\nValid mobile user1:', getValidMobile('user1').getOrElse('Mobile non valido'));
console.log('Valid mobile user2:', getValidMobile('user2').getOrElse('Mobile non valido'));
console.log('Valid mobile user3:', getValidMobile('user3').getOrElse('Mobile non valido'));

// ==========================================
// ESERCIZIO 5: Combinazione di Maybe
// ==========================================

console.log('\n=== ESERCIZIO 5: COMBINAZIONE MAYBE ===');

// 5.1 Funzione per combinare nome e email valida
const getUserProfile = (userId) => {
  const name = Maybe.fromNullable(users[userId])
    .chain(user => Maybe.fromNullable(user.name));
  
  const email = getValidEmail(userId);
  
  return name.chain(n => 
    email.map(e => ({ name: n, email: e }))
  );
};

// 5.2 Funzione per ottenere contatto completo
const getCompleteContact = (userId) => {
  const profile = getUserProfile(userId);
  const mobile = getValidMobile(userId);
  const address = getFullAddress(userId);
  
  return profile.chain(p =>
    mobile.chain(m =>
      address.map(a => ({
        ...p,
        mobile: m,
        address: a
      }))
    )
  );
};

// Test combinazioni
console.log('Profile user1:', getUserProfile('user1').toString());
console.log('Profile user2:', getUserProfile('user2').toString());
console.log('Profile user3:', getUserProfile('user3').toString());

console.log('\nComplete contact user1:', getCompleteContact('user1').toString());
console.log('Complete contact user2:', getCompleteContact('user2').toString());
console.log('Complete contact user3:', getCompleteContact('user3').toString());

// ==========================================
// BONUS: Applicative Functor Pattern
// ==========================================

console.log('\n=== BONUS: APPLICATIVE PATTERN ===');

// Implementazione di applicative per Maybe
Maybe.prototype.ap = function(maybeFn) {
  if (this.isNothing() || maybeFn.isNothing()) {
    return new Nothing();
  }
  return this.map(maybeFn.value);
};

const lift2 = (fn) => (maybe1) => (maybe2) => 
  maybe1.map(fn).ap(maybe2);

const lift3 = (fn) => (maybe1) => (maybe2) => (maybe3) =>
  maybe1.map(fn).ap(maybe2).ap(maybe3);

// Esempio: combinare nome, email e mobile con applicative
const createContact = (name) => (email) => (mobile) => ({
  name, email, mobile
});

const getUserContactApplicative = (userId) => {
  const name = Maybe.fromNullable(users[userId])
    .chain(user => Maybe.fromNullable(user.name));
  const email = getValidEmail(userId);
  const mobile = getValidMobile(userId);
  
  return lift3(createContact)(name)(email)(mobile);
};

console.log('Applicative user1:', getUserContactApplicative('user1').toString());
console.log('Applicative user2:', getUserContactApplicative('user2').toString());
console.log('Applicative user3:', getUserContactApplicative('user3').toString());

console.log('\n=== FINE ESERCIZIO ===');

/**
 * CONCLUSIONI:
 * 
 * Il Maybe monad fornisce un modo elegante per gestire valori nulli
 * senza dover controllare esplicitamente null/undefined ad ogni passo.
 * 
 * Vantaggi:
 * - Codice più pulito e leggibile
 * - Riduzione degli errori di null pointer
 * - Composizione sicura di operazioni
 * - Pattern funzionale ben definito
 * 
 * Utilizzo ideale:
 * - Accesso a proprietà annidate
 * - Chain di trasformazioni
 * - Validazioni
 * - API che possono restituire valori nulli
 */
