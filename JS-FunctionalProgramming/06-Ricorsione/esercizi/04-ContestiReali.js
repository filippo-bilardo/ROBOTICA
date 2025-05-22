/**
 * Esercizio 4: Ricorsione in Contesti Reali
 * 
 * In questo esercizio applicherai la ricorsione per risolvere problemi che 
 * potresti incontrare in applicazioni reali, come la manipolazione di strutture 
 * di dati complesse, chiamate API ricorsive, e algoritmi di uso comune.
 */

/**
 * Esercizio 4.1: Deep Clone
 * 
 * Implementa una funzione ricorsiva che crea una copia profonda di un oggetto,
 * gestendo correttamente oggetti annidati, array e tipi primitivi.
 * Non utilizzare JSON.parse(JSON.stringify()) o metodi di librerie esterne.
 * 
 * @param {*} obj - L'oggetto da clonare
 * @returns {*} - Una copia profonda dell'oggetto
 */
function deepClone(obj) {
  // Implementa la funzione
}

/**
 * Esercizio 4.2: Appiattimento ricorsivo di array annidati
 * 
 * Implementa una funzione che appiattisce un array contenente array annidati
 * a qualsiasi livello di profondità. Non utilizzare Array.flat() o flatMap().
 * 
 * Esempio: flattenDeep([1, [2, [3, [4]], 5]]) deve restituire [1, 2, 3, 4, 5]
 * 
 * @param {Array} array - L'array da appiattire
 * @returns {Array} - L'array appiattito
 */
function flattenDeep(array) {
  // Implementa la funzione
}

/**
 * Esercizio 4.3: Parser JSON ricorsivo semplificato
 * 
 * Implementa un parser JSON semplificato che analizza ricorsivamente una stringa JSON.
 * Gestisci almeno questi tipi base: oggetti, array, stringhe, numeri, booleani e null.
 * Non utilizzare JSON.parse().
 * 
 * Esempio: parseJSON('{"name":"Mario","age":30,"hobbies":["coding","reading"]}')
 * deve restituire un oggetto JavaScript corrispondente
 * 
 * @param {string} jsonString - La stringa JSON da analizzare
 * @returns {*} - L'oggetto JavaScript risultante
 */
function parseJSON(jsonString) {
  // Implementa la funzione
}

/**
 * Esercizio 4.4: Ricorsione con Promise per chiamate API sequenziali
 * 
 * Implementa una funzione che esegue richieste API ricorsivamente per una struttura
 * di dati gerarchica. Ogni elemento può contenere figli che richiedono un'altra chiamata.
 * Utilizza Promise per gestire l'asincronicità.
 * 
 * Esempio: Un albero di commenti dove ogni commento può avere sotto-commenti da caricare.
 * 
 * @param {string} resourceId - ID della risorsa da recuperare
 * @param {Function} fetchResource - Funzione che prende un ID e restituisce una Promise
 *                                 che si risolve con {data, childIds}
 * @returns {Promise<Object>} - Promise che si risolve con la struttura completa
 */
function fetchResourceTree(resourceId, fetchResource) {
  // Implementa la funzione
}

/**
 * Esercizio 4.5: Sistema di file ricorsivo
 * 
 * Implementa un sistema di file virtuale con cartelle e file.
 * Crea funzioni ricorsive per:
 * 1. Trovare un file/cartella per nome
 * 2. Calcolare lo spazio occupato da una cartella
 * 3. Visualizzare la struttura come una stringa indentata
 * 
 * Utilizza l'oggetto fileSystem fornito come struttura di partenza.
 */

// Struttura di esempio del file system
const fileSystem = {
  name: 'root',
  type: 'folder',
  children: [
    {
      name: 'documents',
      type: 'folder',
      children: [
        { name: 'report.pdf', type: 'file', size: 2048 },
        { name: 'presentation.ppt', type: 'file', size: 4096 }
      ]
    },
    {
      name: 'images',
      type: 'folder',
      children: [
        { name: 'photo.jpg', type: 'file', size: 1024 },
        { name: 'screenshot.png', type: 'file', size: 512 }
      ]
    },
    { name: 'notes.txt', type: 'file', size: 256 }
  ]
};

/**
 * Trova un file o cartella nel file system per nome
 * 
 * @param {Object} node - Il nodo attuale del file system
 * @param {string} name - Il nome del file/cartella da cercare
 * @returns {Object|null} - Il nodo trovato o null se non esiste
 */
function findByName(node, name) {
  // Implementa la funzione
}

/**
 * Calcola lo spazio totale occupato da un nodo (file o cartella)
 * 
 * @param {Object} node - Il nodo di cui calcolare la dimensione
 * @returns {number} - La dimensione totale in bytes
 */
function calculateSize(node) {
  // Implementa la funzione
}

/**
 * Genera una rappresentazione testuale della struttura del file system
 * con indentazione per mostrare la gerarchia
 * 
 * @param {Object} node - Il nodo da visualizzare
 * @param {number} level - Il livello di indentazione attuale
 * @returns {string} - La rappresentazione testuale del file system
 */
function displayFileSystem(node, level = 0) {
  // Implementa la funzione
}

// Test per le funzioni
function runTests() {
  console.log('===== Esercizio 4.1: Deep Clone =====');
  const originalObj = {
    a: 1,
    b: { c: 2, d: [3, 4, { e: 5 }] },
    f: new Date(),
    g: /pattern/g
  };
  const clonedObj = deepClone(originalObj);
  console.log('Clone corretto?', 
    JSON.stringify(clonedObj) === JSON.stringify(originalObj) && clonedObj !== originalObj);
  clonedObj.b.d[2].e = 99;
  console.log('Modifica al clone non influisce l\'originale?',
    originalObj.b.d[2].e === 5);

  console.log('\n===== Esercizio 4.2: Flatten Deep =====');
  console.log(flattenDeep([1, [2, [3, [4]], 5]]));
  console.log(flattenDeep([1, [], [2, []], [3, [[4]]]]));

  console.log('\n===== Esercizio 4.3: JSON Parser =====');
  const jsonStr = '{"name":"Mario","age":30,"isStudent":false,"grades":[95,87,92],"address":{"city":"Roma","zip":"00100"},"projects":null}';
  try {
    const parsed = parseJSON(jsonStr);
    console.log('Parser funziona correttamente?',
      parsed.name === 'Mario' &&
      parsed.age === 30 &&
      parsed.isStudent === false &&
      Array.isArray(parsed.grades) &&
      parsed.address.city === 'Roma' &&
      parsed.projects === null);
  } catch (e) {
    console.log('Parser fallito:', e);
  }

  console.log('\n===== Esercizio 4.4: Ricorsione con Promise =====');
  // Mock della funzione fetchResource per i test
  const resourceDatabase = {
    'comment1': { data: { id: 'comment1', text: 'Commento principale' }, childIds: ['reply1', 'reply2'] },
    'reply1': { data: { id: 'reply1', text: 'Prima risposta' }, childIds: ['replyToReply'] },
    'reply2': { data: { id: 'reply2', text: 'Seconda risposta' }, childIds: [] },
    'replyToReply': { data: { id: 'replyToReply', text: 'Risposta alla risposta' }, childIds: [] }
  };
  
  function mockFetch(id) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(resourceDatabase[id]), 100);
    });
  }
  
  fetchResourceTree('comment1', mockFetch)
    .then(result => {
      console.log('Struttura commentI caricata correttamente?',
        result.data.text === 'Commento principale' &&
        result.children.length === 2 &&
        result.children[0].children.length === 1);
    })
    .catch(err => console.error('Errore:', err));

  console.log('\n===== Esercizio 4.5: Sistema di file ricorsivo =====');
  console.log('Trovare report.pdf:', findByName(fileSystem, 'report.pdf')?.name === 'report.pdf');
  console.log('Dimensione totale root:', calculateSize(fileSystem) === 7936);
  console.log('Struttura del file system:');
  console.log(displayFileSystem(fileSystem));
}

runTests();
