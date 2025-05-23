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

// TODO: implementa Maybe, Just e Nothing

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
      street: "Via Garibaldi 42",
      city: "Roma",
      zipCode: "00100"
    },
    contacts: {
      phone: {
        work: "06-9876543"
      }
    }
  }
};

/**
 * Implementa la funzione getDeepProperty che recupera una proprietà
 * potenzialmente annidiata utilizzando il Maybe monad.
 * 
 * La funzione dovrebbe:
 * 1. Accettare un oggetto e un path (array di stringhe o stringhe separate da punti)
 * 2. Utilizzare Maybe per gestire i casi in cui oggetti o proprietà sono null/undefined
 * 3. Ritornare un Maybe che contiene il valore o Nothing se il path non è valido
 * 
 * Esempio:
 * getDeepProperty(user, ['address', 'city']) // Dovrebbe ritornare Maybe.of("Milano") per user1
 * getDeepProperty(user, 'contacts.phone.home') // Dovrebbe ritornare Maybe.of("02-1234567") per user1
 */

function getDeepProperty(obj, path) {
  // TODO: implementa questa funzione utilizzando Maybe
}

// ==========================================
// ESERCIZIO 3: Variante di getDeepProperty con operazioni aggiuntive
// ==========================================

/**
 * Implementa una funzione avanzata safeGetProperty che:
 * 1. Usa getDeepProperty per recuperare una proprietà annidiata
 * 2. Applica una funzione di trasformazione al valore se presente
 * 3. Fornisce un valore predefinito se la proprietà non esiste
 * 4. Opzionalmente filtra il risultato in base a un predicato
 * 5. Può concatenare più operazioni in modo elegante
 */

function safeGetProperty(obj, path, transformFn = x => x, filterPredicate = () => true) {
  // TODO: implementa questa funzione
}

// ==========================================
// ESERCIZIO 4: Applicazione pratica
// ==========================================

/**
 * Implementa la funzione formatUserInfo che crea una stringa formattata
 * con le informazioni dell'utente, gestendo in modo elegante eventuali
 * informazioni mancanti.
 * 
 * La funzione dovrebbe:
 * 1. Accettare un ID utente (che potrebbe non esistere)
 * 2. Recuperare le informazioni dell'utente dal "database" (oggetto users)
 * 3. Comporre una stringa con nome, indirizzo completo e contatti disponibili
 * 4. Utilizzare Maybe per gestire tutti i casi in cui le informazioni potrebbero mancare
 * 
 * Esempi di output atteso:
 * - "Mario Rossi abita in Via Roma 123, Milano (20100). Contatti: mario@example.com, cell: 333-1234567, tel: 02-1234567."
 * - "Luigi Verdi, indirizzo non disponibile. Contatti: luigi@example.com, cell: 334-7654321."
 * - "Anna Bianchi abita in Via Garibaldi 42, Roma (00100). Contatti: tel lavoro: 06-9876543."
 * - "Utente non trovato." (per ID utente inesistenti)
 */

function formatUserInfo(userId) {
  // TODO: implementa questa funzione utilizzando Maybe
}

// ==========================================
// Test delle tue implementazioni
// ==========================================

// Funzione di test per verificare le implementazioni
function runTests() {
  console.log("===== Test Maybe Monad =====");
  // TODO: aggiungi test per la tua implementazione di Maybe
  
  console.log("\n===== Test getDeepProperty =====");
  // TODO: aggiungi test per getDeepProperty
  
  console.log("\n===== Test safeGetProperty =====");
  // TODO: aggiungi test per safeGetProperty
  
  console.log("\n===== Test formatUserInfo =====");
  console.log(formatUserInfo("user1"));
  console.log(formatUserInfo("user2"));
  console.log(formatUserInfo("user3"));
  console.log(formatUserInfo("user4")); // Non esiste
}

// Esegui i test
runTests();

// ==========================================
// BONUS: Confronto con approcci alternativi
// ==========================================

/**
 * COMPITO BONUS:
 * Implementa formatUserInfoTraditional che fa la stessa cosa di formatUserInfo
 * ma utilizza l'approccio tradizionale con controlli null/undefined espliciti.
 * Confronta i due approcci in termini di:
 * - Leggibilità del codice
 * - Robustezza (gestione degli errori)
 * - Capacità di composizione
 */

function formatUserInfoTraditional(userId) {
  // TODO: implementa questa funzione con approccio tradizionale
}
