/**
 * Esercizio 2: Ricorsione con Alberi e Grafi
 * 
 * Implementa le funzioni ricorsive richieste per lavorare con strutture
 * ad albero e grafi. Per ogni funzione, scrivi prima la tua soluzione
 * e poi verifica se funziona con i test forniti.
 */

// Definizione di un nodo di un albero binario per gli esercizi
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

/**
 * Esercizio 2.1: Altezza di un albero binario
 * 
 * Implementa una funzione ricorsiva che calcoli l'altezza di un albero binario.
 * L'altezza è definita come la lunghezza del percorso più lungo dalla radice a una foglia.
 * Un albero con un solo nodo ha altezza 0.
 * 
 * @param {TreeNode|null} root - La radice dell'albero
 * @returns {number} - L'altezza dell'albero
 */
function treeHeight(root) {
  // Implementa la funzione
}

/**
 * Esercizio 2.2: Somma dei valori in un albero binario
 * 
 * Implementa una funzione ricorsiva che calcoli la somma di tutti i valori
 * in un albero binario. Assumiamo che i nodi contengano valori numerici.
 * 
 * @param {TreeNode|null} root - La radice dell'albero
 * @returns {number} - La somma dei valori nell'albero
 */
function sumTree(root) {
  // Implementa la funzione
}

/**
 * Esercizio 2.3: Verifica se un albero binario è bilanciato
 * 
 * Un albero binario è bilanciato se la differenza di altezza tra
 * il sottoalbero sinistro e destro di ogni nodo non è maggiore di 1.
 * 
 * @param {TreeNode|null} root - La radice dell'albero
 * @returns {boolean} - True se l'albero è bilanciato, false altrimenti
 */
function isBalanced(root) {
  // Implementa la funzione
}

/**
 * Esercizio 2.4: Ricerca in un albero binario di ricerca (BST)
 * 
 * Implementa una funzione ricorsiva che cerca un valore in un albero binario di ricerca.
 * In un BST, tutti i nodi del sottoalbero sinistro hanno valori minori del nodo,
 * e tutti i nodi del sottoalbero destro hanno valori maggiori.
 * 
 * @param {TreeNode|null} root - La radice dell'albero
 * @param {number} value - Il valore da cercare
 * @returns {boolean} - True se il valore è presente nell'albero, false altrimenti
 */
function searchBST(root, value) {
  // Implementa la funzione
}

/**
 * Esercizio 2.5: DFS per grafi
 * 
 * Implementa una funzione ricorsiva che esegua un attraversamento Depth-First Search
 * su un grafo rappresentato da una lista di adiacenza. La funzione deve visitare
 * tutti i nodi raggiungibili dal nodo di partenza.
 * 
 * @param {Object} graph - Il grafo rappresentato come lista di adiacenza
 * @param {string|number} startNode - Il nodo di partenza
 * @param {Set} visited - Set di nodi già visitati
 * @returns {string[]|number[]} - Array di nodi visitati in ordine DFS
 */
function dfs(graph, startNode, visited = new Set()) {
  // Implementa la funzione
}

/**
 * Esercizio 2.6: Percorso tra due nodi in un grafo
 * 
 * Implementa una funzione ricorsiva che verifichi se esiste un percorso
 * tra due nodi in un grafo non orientato. Usa DFS per la ricerca.
 * 
 * @param {Object} graph - Il grafo rappresentato come lista di adiacenza
 * @param {string|number} start - Il nodo di partenza
 * @param {string|number} end - Il nodo di destinazione
 * @param {Set} visited - Set di nodi già visitati
 * @returns {boolean} - True se esiste un percorso, false altrimenti
 */
function hasPath(graph, start, end, visited = new Set()) {
  // Implementa la funzione
}

/**
 * Esercizio 2.7: Conta il numero di nodi a un livello specifico
 * 
 * Implementa una funzione ricorsiva che conti il numero di nodi
 * presenti a un livello specifico in un albero binario.
 * La radice è al livello 0.
 * 
 * @param {TreeNode|null} root - La radice dell'albero
 * @param {number} level - Il livello di cui contare i nodi
 * @returns {number} - Il numero di nodi al livello specificato
 */
function countNodesAtLevel(root, level) {
  // Implementa la funzione
}

/**
 * Esercizio 2.8: Specchia un albero binario
 * 
 * Implementa una funzione ricorsiva che crei una copia speculare
 * di un albero binario (scambiando i sottoalberi sinistro e destro).
 * 
 * @param {TreeNode|null} root - La radice dell'albero
 * @returns {TreeNode|null} - La radice dell'albero speculare
 */
function mirrorTree(root) {
  // Implementa la funzione
}


// Funzioni di utilità per creare strutture di test
function createSampleTree() {
  //      1
  //    /   \
  //   2     3
  //  / \   / \
  // 4   5 6   7
  const root = new TreeNode(1);
  root.left = new TreeNode(2);
  root.right = new TreeNode(3);
  root.left.left = new TreeNode(4);
  root.left.right = new TreeNode(5);
  root.right.left = new TreeNode(6);
  root.right.right = new TreeNode(7);
  return root;
}

function createSampleBST() {
  //      8
  //    /   \
  //   3     10
  //  / \      \
  // 1   6      14
  //    / \    /
  //   4   7  13
  const root = new TreeNode(8);
  root.left = new TreeNode(3);
  root.right = new TreeNode(10);
  root.left.left = new TreeNode(1);
  root.left.right = new TreeNode(6);
  root.left.right.left = new TreeNode(4);
  root.left.right.right = new TreeNode(7);
  root.right.right = new TreeNode(14);
  root.right.right.left = new TreeNode(13);
  return root;
}

function createUnbalancedTree() {
  //      1
  //    /
  //   2
  //  /
  // 3
  //  \
  //   4
  const root = new TreeNode(1);
  root.left = new TreeNode(2);
  root.left.left = new TreeNode(3);
  root.left.left.right = new TreeNode(4);
  return root;
}

function createSampleGraph() {
  return {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
  };
}

// Funzione per rappresentare un albero come stringa (per test)
function treeToString(root) {
  if (!root) return 'null';
  return `${root.value} [${treeToString(root.left)}, ${treeToString(root.right)}]`;
}

// Test delle funzioni
function runTests() {
  const tree = createSampleTree();
  const bst = createSampleBST();
  const unbalancedTree = createUnbalancedTree();
  const graph = createSampleGraph();

  console.log("=== Test esercizio 2.1: Altezza di un albero binario ===");
  console.log(`treeHeight(tree) => ${treeHeight(tree)} (atteso: 2)`);
  console.log(`treeHeight(bst) => ${treeHeight(bst)} (atteso: 3)`);
  console.log(`treeHeight(unbalancedTree) => ${treeHeight(unbalancedTree)} (atteso: 3)`);
  console.log(`treeHeight(null) => ${treeHeight(null)} (atteso: -1)`);
  console.log();

  console.log("=== Test esercizio 2.2: Somma dei valori in un albero binario ===");
  console.log(`sumTree(tree) => ${sumTree(tree)} (atteso: 28)`);
  console.log(`sumTree(bst) => ${sumTree(bst)} (atteso: 66)`);
  console.log(`sumTree(null) => ${sumTree(null)} (atteso: 0)`);
  console.log();

  console.log("=== Test esercizio 2.3: Verifica se un albero binario è bilanciato ===");
  console.log(`isBalanced(tree) => ${isBalanced(tree)} (atteso: true)`);
  console.log(`isBalanced(bst) => ${isBalanced(bst)} (atteso: false)`);
  console.log(`isBalanced(unbalancedTree) => ${isBalanced(unbalancedTree)} (atteso: false)`);
  console.log(`isBalanced(null) => ${isBalanced(null)} (atteso: true)`);
  console.log();

  console.log("=== Test esercizio 2.4: Ricerca in un albero binario di ricerca (BST) ===");
  console.log(`searchBST(bst, 7) => ${searchBST(bst, 7)} (atteso: true)`);
  console.log(`searchBST(bst, 13) => ${searchBST(bst, 13)} (atteso: true)`);
  console.log(`searchBST(bst, 15) => ${searchBST(bst, 15)} (atteso: false)`);
  console.log(`searchBST(null, 5) => ${searchBST(null, 5)} (atteso: false)`);
  console.log();

  console.log("=== Test esercizio 2.5: DFS per grafi ===");
  console.log(`dfs(graph, 'A') => ${dfs(graph, 'A')} (atteso: [A, B, D, E, F, C] o simile)`);
  console.log(`dfs(graph, 'F') => ${dfs(graph, 'F')} (atteso: [F, C, A, B, D, E] o simile)`);
  console.log();

  console.log("=== Test esercizio 2.6: Percorso tra due nodi in un grafo ===");
  console.log(`hasPath(graph, 'A', 'F') => ${hasPath(graph, 'A', 'F')} (atteso: true)`);
  console.log(`hasPath(graph, 'D', 'F') => ${hasPath(graph, 'D', 'F')} (atteso: true)`);
  console.log(`hasPath({'X': ['Y'], 'Y': ['X'], 'Z': []}, 'X', 'Z') => ${hasPath({'X': ['Y'], 'Y': ['X'], 'Z': []}, 'X', 'Z')} (atteso: false)`);
  console.log();

  console.log("=== Test esercizio 2.7: Conta il numero di nodi a un livello specifico ===");
  console.log(`countNodesAtLevel(tree, 0) => ${countNodesAtLevel(tree, 0)} (atteso: 1)`);
  console.log(`countNodesAtLevel(tree, 1) => ${countNodesAtLevel(tree, 1)} (atteso: 2)`);
  console.log(`countNodesAtLevel(tree, 2) => ${countNodesAtLevel(tree, 2)} (atteso: 4)`);
  console.log(`countNodesAtLevel(tree, 3) => ${countNodesAtLevel(tree, 3)} (atteso: 0)`);
  console.log(`countNodesAtLevel(bst, 2) => ${countNodesAtLevel(bst, 2)} (atteso: 3)`);
  console.log();

  console.log("=== Test esercizio 2.8: Specchia un albero binario ===");
  const mirroredTree = mirrorTree(tree);
  console.log(`Original tree: ${treeToString(tree)}`);
  console.log(`Mirrored tree: ${treeToString(mirroredTree)}`);
  
  const mirroredBST = mirrorTree(bst);
  console.log(`Original BST: ${treeToString(bst)}`);
  console.log(`Mirrored BST: ${treeToString(mirroredBST)}`);
}

// Esegui i test
runTests();
