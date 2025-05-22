/**
 * Soluzioni agli Esercizi del Modulo 6: Ricorsione
 * 
 * Questo file contiene le soluzioni implementate per tutti gli esercizi
 * del modulo sulla ricorsione. Puoi usarlo come riferimento dopo aver
 * provato a risolvere gli esercizi autonomamente.
 */

// =========================================================================
// ESERCIZIO 1: FUNZIONI RICORSIVE BASE
// =========================================================================

/**
 * Esercizio 1.1: Somma dei primi N numeri naturali
 */
function sumN(n) {
  if (n <= 0) return 0;
  return n + sumN(n - 1);
}

/**
 * Esercizio 1.2: Potenza
 */
function power(base, exponent) {
  if (exponent === 0) return 1;
  if (exponent < 0) return 1 / power(base, -exponent);
  return base * power(base, exponent - 1);
}

/**
 * Esercizio 1.3: Conta le occorrenze in un array
 */
function countOccurrences(array, element) {
  if (array.length === 0) return 0;
  
  const rest = array.slice(1);
  const currentMatches = array[0] === element ? 1 : 0;
  
  return currentMatches + countOccurrences(rest, element);
}

/**
 * Esercizio 1.4: Palindromo
 */
function isPalindrome(str) {
  // Rimuoviamo spazi e convertiamo in minuscolo
  str = str.toLowerCase().replace(/\s/g, '');
  
  if (str.length <= 1) return true;
  
  if (str[0] !== str[str.length - 1]) return false;
  
  // Controlliamo la sottostringa interna ricorsivamente
  return isPalindrome(str.slice(1, -1));
}

/**
 * Esercizio 1.5: Reverse String
 */
function reverseString(str) {
  if (str === '') return '';
  return reverseString(str.slice(1)) + str[0];
}

/**
 * Esercizio 1.6: Somma delle cifre
 */
function sumDigits(num) {
  if (num < 10) return num;
  return (num % 10) + sumDigits(Math.floor(num / 10));
}

/**
 * Esercizio 1.7: Massimo Comun Divisore (MCD)
 */
function gcd(a, b) {
  if (b === 0) return a;
  return gcd(b, a % b);
}

// =========================================================================
// ESERCIZIO 2: RICORSIONE CON ALBERI E GRAFI
// =========================================================================

/**
 * Esercizio 2.1: Visita in preordine
 */
function preOrderTraversal(node, result = []) {
  if (!node) return result;
  
  result.push(node.value);
  preOrderTraversal(node.left, result);
  preOrderTraversal(node.right, result);
  
  return result;
}

/**
 * Esercizio 2.2: Visita in ordine
 */
function inOrderTraversal(node, result = []) {
  if (!node) return result;
  
  inOrderTraversal(node.left, result);
  result.push(node.value);
  inOrderTraversal(node.right, result);
  
  return result;
}

/**
 * Esercizio 2.3: Visita in postordine
 */
function postOrderTraversal(node, result = []) {
  if (!node) return result;
  
  postOrderTraversal(node.left, result);
  postOrderTraversal(node.right, result);
  result.push(node.value);
  
  return result;
}

/**
 * Esercizio 2.4: Calcolo altezza albero
 */
function treeHeight(node) {
  if (!node) return 0;
  
  const leftHeight = treeHeight(node.left);
  const rightHeight = treeHeight(node.right);
  
  return Math.max(leftHeight, rightHeight) + 1;
}

/**
 * Esercizio 2.5: Somma valori albero
 */
function sumTreeValues(node) {
  if (!node) return 0;
  return node.value + sumTreeValues(node.left) + sumTreeValues(node.right);
}

/**
 * Esercizio 2.6: Ricerca in un albero binario
 */
function searchBST(node, value) {
  if (!node) return null;
  if (node.value === value) return node;
  
  if (value < node.value) {
    return searchBST(node.left, value);
  } else {
    return searchBST(node.right, value);
  }
}

/**
 * Esercizio 2.7: DFS su grafo
 */
function dfs(graph, startNode, visited = new Set()) {
  visited.add(startNode);
  const result = [startNode];
  
  for (const neighbor of graph[startNode]) {
    if (!visited.has(neighbor)) {
      result.push(...dfs(graph, neighbor, visited));
    }
  }
  
  return result;
}

/**
 * Esercizio 2.8: Trovare tutti i percorsi tra due nodi
 */
function findAllPaths(graph, start, end, path = [], allPaths = []) {
  path = [...path, start];
  
  if (start === end) {
    allPaths.push([...path]);
    return allPaths;
  }
  
  for (const neighbor of graph[start]) {
    if (!path.includes(neighbor)) {
      findAllPaths(graph, neighbor, end, path, allPaths);
    }
  }
  
  return allPaths;
}

// =========================================================================
// ESERCIZIO 3: OTTIMIZZAZIONE DI FUNZIONI RICORSIVE
// =========================================================================

/**
 * Esercizio 3.1: Memoizzazione di Fibonacci
 */
function fibonacciMemo(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  
  memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
  return memo[n];
}

/**
 * Esercizio 3.2: Fibonacci con tail call optimization
 */
function fibonacciTCO(n, a = 0, b = 1) {
  if (n === 0) return a;
  if (n === 1) return b;
  return fibonacciTCO(n - 1, b, a + b);
}

/**
 * Esercizio 3.3: Fattoriale con tecnica trampolino
 */
function trampolineFactorial(n) {
  function factorial(n, acc = 1) {
    if (n <= 1) return () => acc;
    return () => factorial(n - 1, n * acc);
  }

  function trampoline(fn) {
    let result = fn();
    while (typeof result === 'function') {
      result = result();
    }
    return result;
  }

  return trampoline(factorial(n));
}

/**
 * Esercizio 3.4: Merge Sort ottimizzato
 */
function mergeSortOptimized(arr, threshold = 10) {
  // Se l'array è piccolo, usiamo insertion sort
  if (arr.length <= threshold) {
    return insertionSort(arr);
  }
  
  // Altrimenti procediamo con merge sort
  const mid = Math.floor(arr.length / 2);
  const left = mergeSortOptimized(arr.slice(0, mid), threshold);
  const right = mergeSortOptimized(arr.slice(mid), threshold);
  
  return merge(left, right);
}

function insertionSort(arr) {
  const result = [...arr];
  
  for (let i = 1; i < result.length; i++) {
    const current = result[i];
    let j = i - 1;
    
    while (j >= 0 && result[j] > current) {
      result[j + 1] = result[j];
      j--;
    }
    
    result[j + 1] = current;
  }
  
  return result;
}

function merge(left, right) {
  const result = [];
  let leftIndex = 0;
  let rightIndex = 0;
  
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] < right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }
  
  return result.concat(left.slice(leftIndex), right.slice(rightIndex));
}

/**
 * Esercizio 3.5: PascalTriangle con memoizzazione
 */
function pascalTriangleMemo(row, col, memo = {}) {
  // Casi base
  if (col === 0 || col === row) return 1;
  
  // Controllo se il valore è già stato calcolato
  const key = `${row},${col}`;
  if (memo[key] !== undefined) return memo[key];
  
  // Calcolo ricorsivo
  const result = pascalTriangleMemo(row - 1, col - 1, memo) + pascalTriangleMemo(row - 1, col, memo);
  memo[key] = result;
  
  return result;
}

// =========================================================================
// ESERCIZIO 4: RICORSIONE IN CONTESTI REALI
// =========================================================================

/**
 * Esercizio 4.1: Deep Clone
 */
function deepClone(obj) {
  // Caso base: gestione dei tipi primitivi e null
  if (obj === null || typeof obj !== 'object') return obj;
  
  // Gestione di date
  if (obj instanceof Date) return new Date(obj.getTime());
  
  // Gestione di espressioni regolari
  if (obj instanceof RegExp) return new RegExp(obj);
  
  // Gestione di array
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  // Gestione di oggetti generici
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Esercizio 4.2: Appiattimento ricorsivo di array annidati
 */
function flattenDeep(array) {
  return array.reduce((acc, item) => {
    if (Array.isArray(item)) {
      return acc.concat(flattenDeep(item));
    } else {
      return acc.concat(item);
    }
  }, []);
}

/**
 * Esercizio 4.3: Parser JSON ricorsivo semplificato
 * Nota: Implementazione semplificata che gestisce i casi base
 */
function parseJSON(jsonString) {
  let index = 0;
  
  function parseValue() {
    skipWhitespace();
    
    const char = jsonString[index];
    
    if (char === '{') return parseObject();
    if (char === '[') return parseArray();
    if (char === '"') return parseString();
    if (char === 't' && jsonString.slice(index, index + 4) === 'true') {
      index += 4;
      return true;
    }
    if (char === 'f' && jsonString.slice(index, index + 5) === 'false') {
      index += 5;
      return false;
    }
    if (char === 'n' && jsonString.slice(index, index + 4) === 'null') {
      index += 4;
      return null;
    }
    return parseNumber();
  }
  
  function skipWhitespace() {
    while (/\s/.test(jsonString[index])) index++;
  }
  
  function parseObject() {
    const result = {};
    index++; // Skip '{'
    skipWhitespace();
    
    if (jsonString[index] === '}') {
      index++; // Skip '}'
      return result;
    }
    
    while (true) {
      // Parse key
      const key = parseString();
      
      skipWhitespace();
      if (jsonString[index] !== ':') throw new Error('Expected ":" after key');
      index++; // Skip ':'
      
      // Parse value
      result[key] = parseValue();
      
      skipWhitespace();
      if (jsonString[index] === '}') {
        index++; // Skip '}'
        return result;
      }
      
      if (jsonString[index] !== ',') throw new Error('Expected "," or "}" after value');
      index++; // Skip ','
      skipWhitespace();
    }
  }
  
  function parseArray() {
    const result = [];
    index++; // Skip '['
    skipWhitespace();
    
    if (jsonString[index] === ']') {
      index++; // Skip ']'
      return result;
    }
    
    while (true) {
      result.push(parseValue());
      
      skipWhitespace();
      if (jsonString[index] === ']') {
        index++; // Skip ']'
        return result;
      }
      
      if (jsonString[index] !== ',') throw new Error('Expected "," or "]" after array element');
      index++; // Skip ','
      skipWhitespace();
    }
  }
  
  function parseString() {
    index++; // Skip opening '"'
    let result = '';
    
    while (index < jsonString.length && jsonString[index] !== '"') {
      if (jsonString[index] === '\\') {
        index++; // Skip '\'
        const escapeChar = jsonString[index];
        index++;
        
        switch (escapeChar) {
          case 'n': result += '\n'; break;
          case 't': result += '\t'; break;
          case 'r': result += '\r'; break;
          case '"': result += '"'; break;
          case '\\': result += '\\'; break;
          default: result += escapeChar;
        }
      } else {
        result += jsonString[index];
        index++;
      }
    }
    
    if (index >= jsonString.length) throw new Error('Unterminated string');
    
    index++; // Skip closing '"'
    return result;
  }
  
  function parseNumber() {
    const start = index;
    
    // Skip optional sign
    if (jsonString[index] === '-') index++;
    
    // Parse integer part
    while (index < jsonString.length && /[0-9]/.test(jsonString[index])) index++;
    
    // Parse decimal part
    if (jsonString[index] === '.') {
      index++; // Skip '.'
      while (index < jsonString.length && /[0-9]/.test(jsonString[index])) index++;
    }
    
    // Parse exponent part
    if (jsonString[index] === 'e' || jsonString[index] === 'E') {
      index++; // Skip 'e' or 'E'
      if (jsonString[index] === '+' || jsonString[index] === '-') index++;
      while (index < jsonString.length && /[0-9]/.test(jsonString[index])) index++;
    }
    
    return parseFloat(jsonString.slice(start, index));
  }
  
  const result = parseValue();
  skipWhitespace();
  
  if (index < jsonString.length) {
    throw new Error(`Unexpected character at position ${index}`);
  }
  
  return result;
}

/**
 * Esercizio 4.4: Ricorsione con Promise per chiamate API sequenziali
 */
function fetchResourceTree(resourceId, fetchResource) {
  return fetchResource(resourceId).then(result => {
    if (!result.childIds || result.childIds.length === 0) {
      // Caso base: nessun figlio da caricare
      return { data: result.data, children: [] };
    }
    
    // Carica ricorsivamente tutti i figli
    const childPromises = result.childIds.map(childId => 
      fetchResourceTree(childId, fetchResource)
    );
    
    // Combina i risultati
    return Promise.all(childPromises).then(children => {
      return {
        data: result.data,
        children
      };
    });
  });
}

/**
 * Esercizio 4.5: Sistema di file ricorsivo
 */
function findByName(node, name) {
  if (node.name === name) return node;
  
  if (node.type === 'folder' && node.children) {
    for (const child of node.children) {
      const found = findByName(child, name);
      if (found) return found;
    }
  }
  
  return null;
}

function calculateSize(node) {
  if (node.type === 'file') return node.size;
  
  if (node.type === 'folder' && node.children) {
    return node.children.reduce((total, child) => total + calculateSize(child), 0);
  }
  
  return 0;
}

function displayFileSystem(node, level = 0) {
  const indent = '  '.repeat(level);
  let result = `${indent}${node.name}`;
  
  if (node.type === 'file') {
    result += ` (${node.size} bytes)`;
  }
  
  result += '\n';
  
  if (node.type === 'folder' && node.children) {
    for (const child of node.children) {
      result += displayFileSystem(child, level + 1);
    }
  }
  
  return result;
}

// Esportazione delle soluzioni
module.exports = {
  // Esercizio 1
  sumN,
  power,
  countOccurrences,
  isPalindrome,
  reverseString,
  sumDigits,
  gcd,
  
  // Esercizio 2
  preOrderTraversal,
  inOrderTraversal,
  postOrderTraversal,
  treeHeight,
  sumTreeValues,
  searchBST,
  dfs,
  findAllPaths,
  
  // Esercizio 3
  fibonacciMemo,
  fibonacciTCO,
  trampolineFactorial,
  mergeSortOptimized,
  pascalTriangleMemo,
  
  // Esercizio 4
  deepClone,
  flattenDeep,
  parseJSON,
  fetchResourceTree,
  findByName,
  calculateSize,
  displayFileSystem
};
