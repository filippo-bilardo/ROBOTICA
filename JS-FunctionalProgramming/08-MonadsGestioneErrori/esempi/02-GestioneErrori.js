/**
 * Gestione Errori
 * Confronto tra approcci tradizionali e funzionali nella gestione degli errori
 */

// Importiamo le monad definite nel file precedente
const { Maybe, Either } = require('./01-ImplementazioniBase');

// ==========================================
// Approccio imperativo tradizionale con try/catch
// ==========================================

console.log('===== APPROCCIO IMPERATIVO =====');

function getUserDataImperativo(userId) {
  try {
    // Simula una chiamata a un database
    const user = fetchUser(userId);
    
    if (!user) {
      throw new Error('Utente non trovato');
    }
    
    // Simula il recupero delle preferenze utente
    const preferences = fetchUserPreferences(user.id);
    
    if (!preferences) {
      throw new Error('Preferenze non trovate');
    }
    
    // Simula il salvataggio delle preferenze aggiornate
    const updatedPreferences = updateUserTheme(preferences, 'dark');
    
    return {
      username: user.username,
      theme: updatedPreferences.theme,
      success: true
    };
  } catch (error) {
    console.error(`Errore: ${error.message}`);
    return {
      error: error.message,
      success: false
    };
  }
}

// ==========================================
// Approccio funzionale con Either monad
// ==========================================

console.log('===== APPROCCIO FUNZIONALE CON EITHER =====');

// Stesse operazioni, ma utilizzando Either monad per la gestione degli errori
const getUserDataFunzionale = (userId) => {
  return findUser(userId)
    .chain(user => findUserPreferences(user.id).map(prefs => ({ user, prefs })))
    .chain(({ user, prefs }) => updateTheme(prefs, 'dark').map(updatedPrefs => ({ 
      username: user.username,
      theme: updatedPrefs.theme
    })));
};

// ==========================================
// "Railway Oriented Programming": gestione degli errori come binari paralleli
// ==========================================

console.log('===== RAILWAY ORIENTED PROGRAMMING =====');

// Visualizziamo il concetto di "binari paralleli":
// - Binario "felice": rappresentato da Right
// - Binario "errore": rappresentato da Left
// 
// Le operazioni si concatenano sul binario felice, o vengono dirottate sul binario errore

const processUserData = (userData) => {
  return userData
    .map(data => {
      console.log(`Processing data for: ${data.username}`);
      return data;
    })
    .getOrElse({
      error: 'Non è stato possibile elaborare i dati utente',
      success: false
    });
};

// ==========================================
// Funzioni di supporto: versioni imperative
// ==========================================

// Funzioni simulate per l'approccio imperativo
function fetchUser(userId) {
  // Simuliamo un database
  const users = {
    1: { id: 1, username: 'alice', email: 'alice@example.com' },
    2: { id: 2, username: 'bob', email: 'bob@example.com' }
  };
  return users[userId];
}

function fetchUserPreferences(userId) {
  // Simuliamo un database di preferenze
  const preferences = {
    1: { userId: 1, theme: 'light', notifications: true },
    // Utente 2 non ha preferenze (simula un errore)
  };
  return preferences[userId];
}

function updateUserTheme(preferences, theme) {
  return { ...preferences, theme };
}

// ==========================================
// Funzioni di supporto: versioni funzionali con Either
// ==========================================

const findUser = (userId) => {
  const users = {
    1: { id: 1, username: 'alice', email: 'alice@example.com' },
    2: { id: 2, username: 'bob', email: 'bob@example.com' }
  };
  
  return users[userId] 
    ? Either.right(users[userId])
    : Either.left(new Error(`Utente con ID ${userId} non trovato`));
};

const findUserPreferences = (userId) => {
  const preferences = {
    1: { userId: 1, theme: 'light', notifications: true },
    // Utente 2 non ha preferenze (simula un errore)
  };
  
  return preferences[userId]
    ? Either.right(preferences[userId])
    : Either.left(new Error(`Preferenze per l'utente ${userId} non trovate`));
};

const updateTheme = (preferences, theme) => {
  // Potremmo avere logica di validazione qui
  if (theme !== 'light' && theme !== 'dark') {
    return Either.left(new Error(`Tema non supportato: ${theme}`));
  }
  
  return Either.right({ ...preferences, theme });
};

// ==========================================
// Esecuzione e confronto
// ==========================================

// Test con un utente valido (ha preferenze)
console.log('------- Test con utente valido (ID: 1) -------');
console.log('Approccio imperativo:', getUserDataImperativo(1));

const userResult1 = getUserDataFunzionale(1);
console.log('Approccio funzionale:', userResult1.toString());
console.log('Risultato finale:', processUserData(userResult1));

// Test con un utente che causa errori (nessuna preferenza)
console.log('------- Test con utente senza preferenze (ID: 2) -------');
console.log('Approccio imperativo:', getUserDataImperativo(2));

const userResult2 = getUserDataFunzionale(2);
console.log('Approccio funzionale:', userResult2.toString());
console.log('Risultato finale:', processUserData(userResult2));

// Test con un ID non valido
console.log('------- Test con utente non valido (ID: 999) -------');
console.log('Approccio imperativo:', getUserDataImperativo(999));

const userResult3 = getUserDataFunzionale(999);
console.log('Approccio funzionale:', userResult3.toString());
console.log('Risultato finale:', processUserData(userResult3));
