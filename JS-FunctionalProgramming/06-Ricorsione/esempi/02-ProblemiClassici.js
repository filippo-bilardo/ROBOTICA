/**
 * Problemi Classici con Ricorsione
 * 
 * Questo file contiene implementazioni ricorsive di alcuni problemi classici
 * che vengono spesso risolti utilizzando la ricorsione.
 */

// --------------------------------------------------------
// PARTE 1: Torre di Hanoi
// --------------------------------------------------------

console.log('===== TORRE DI HANOI =====');

/**
 * Risolve il problema della Torre di Hanoi.
 * 
 * @param {number} n - Numero di dischi
 * @param {string} source - Pila di origine
 * @param {string} auxiliary - Pila ausiliaria
 * @param {string} destination - Pila di destinazione
 */
function hanoiTower(n, source = 'A', auxiliary = 'B', destination = 'C') {
  // Caso base: nessun disco da spostare
  if (n === 0) {
    return;
  }
  
  // Sposta n-1 dischi dalla sorgente alla pila ausiliaria usando la destinazione
  hanoiTower(n - 1, source, destination, auxiliary);
  
  // Sposta il disco più grande dalla sorgente alla destinazione
  console.log(`Sposta disco ${n} da ${source} a ${destination}`);
  
  // Sposta n-1 dischi dalla pila ausiliaria alla destinazione usando la sorgente
  hanoiTower(n - 1, auxiliary, source, destination);
}

// Esempi di utilizzo
console.log('Risoluzione con 3 dischi:');
hanoiTower(3);

// --------------------------------------------------------
// PARTE 2: Subset Sum
// --------------------------------------------------------

console.log('\n===== SUBSET SUM =====');

/**
 * Determina se esiste un sottoinsieme dell'array che somma al valore target.
 * 
 * @param {number[]} nums - Array di numeri
 * @param {number} target - Valore target da raggiungere
 * @param {number} index - Indice corrente (default: 0)
 * @returns {boolean} true se esiste un sottoinsieme, false altrimenti
 */
function subsetSum(nums, target, index = 0) {
  // Caso base: abbiamo raggiunto il target
  if (target === 0) {
    return true;
  }
  
  // Caso base: abbiamo finito l'array o il target è negativo
  if (index >= nums.length || target < 0) {
    return false;
  }
  
  // Due opzioni ricorsive:
  // 1. Includere l'elemento corrente
  const includeElement = subsetSum(nums, target - nums[index], index + 1);
  
  // 2. Escludere l'elemento corrente
  const excludeElement = subsetSum(nums, target, index + 1);
  
  // Restituisce true se una delle due opzioni porta a una soluzione
  return includeElement || excludeElement;
}

// Esempi di utilizzo
const array1 = [3, 34, 4, 12, 5, 2];
console.log('Array: [3, 34, 4, 12, 5, 2]');
console.log('Esiste sottoinsieme che somma a 9?', subsetSum(array1, 9));   // true (4 + 5)
console.log('Esiste sottoinsieme che somma a 30?', subsetSum(array1, 30));  // false

// --------------------------------------------------------
// PARTE 3: N Queens Problem
// --------------------------------------------------------

console.log('\n===== N QUEENS PROBLEM =====');

/**
 * Risolve il problema delle N regine: posizionare N regine su una scacchiera NxN
 * in modo che nessuna regina possa attaccare un'altra.
 * 
 * @param {number} n - Dimensione della scacchiera e numero di regine
 * @returns {number[][]} Array di soluzioni, ogni soluzione è un array di posizioni delle regine
 */
function solveNQueens(n) {
  const solutions = [];
  
  // Funzione helper che verifica se una posizione è valida
  function isSafe(board, row, col) {
    // Controlla la colonna
    for (let i = 0; i < row; i++) {
      if (board[i] === col) {
        return false;
      }
    }
    
    // Controlla la diagonale superiore sinistra
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i] === j) {
        return false;
      }
    }
    
    // Controlla la diagonale superiore destra
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i] === j) {
        return false;
      }
    }
    
    return true;
  }
  
  // Funzione ricorsiva per posizionare le regine
  function placeQueens(board = [], row = 0) {
    // Caso base: tutte le regine posizionate
    if (row === n) {
      solutions.push([...board]);
      return;
    }
    
    // Prova a posizionare una regina in ogni colonna della riga corrente
    for (let col = 0; col < n; col++) {
      if (isSafe(board, row, col)) {
        board[row] = col;  // Posiziona la regina
        placeQueens(board, row + 1);  // Passa alla riga successiva
        // Il backtracking è implicito poiché stiamo sovrascrivendo board[row]
      }
    }
  }
  
  placeQueens();
  return solutions;
}

// Funzione per visualizzare una soluzione
function printQueens(solution, n) {
  const board = Array(n).fill().map(() => Array(n).fill('.'));
  for (let i = 0; i < n; i++) {
    board[i][solution[i]] = 'Q';
  }
  return board.map(row => row.join(' ')).join('\n');
}

// Esempi di utilizzo
const solutions = solveNQueens(4);
console.log(`Trovate ${solutions.length} soluzioni per scacchiera 4x4:`);
console.log(printQueens(solutions[0], 4));
console.log('\nSeconda soluzione:');
console.log(printQueens(solutions[1], 4));

// --------------------------------------------------------
// PARTE 4: Percorsi in una Griglia
// --------------------------------------------------------

console.log('\n===== PERCORSI IN UNA GRIGLIA =====');

/**
 * Calcola il numero di percorsi possibili da (0,0) a (m,n) in una griglia,
 * muovendosi solo verso destra o verso il basso.
 * 
 * @param {number} m - Numero di righe
 * @param {number} n - Numero di colonne
 * @returns {number} Numero di percorsi possibili
 */
function gridPaths(m, n) {
  // Caso base: se siamo alla prima riga o alla prima colonna, c'è solo un percorso
  if (m === 1 || n === 1) {
    return 1;
  }
  
  // Il numero di percorsi è dato dalla somma dei percorsi venendo da sopra e da sinistra
  return gridPaths(m - 1, n) + gridPaths(m, n - 1);
}

// Versione con memoizzazione
function gridPathsMemo(m, n, memo = {}) {
  // Chiave per la memoizzazione
  const key = `${m},${n}`;
  
  // Controlla se il risultato è già memorizzato
  if (memo[key] !== undefined) {
    return memo[key];
  }
  
  // Caso base: se siamo alla prima riga o alla prima colonna, c'è solo un percorso
  if (m === 1 || n === 1) {
    return 1;
  }
  
  // Calcola e memorizza il risultato
  memo[key] = gridPathsMemo(m - 1, n, memo) + gridPathsMemo(m, n - 1, memo);
  return memo[key];
}

// Esempi di utilizzo
console.log('Percorsi in una griglia 2x3:', gridPaths(2, 3));  // 3
console.log('Percorsi in una griglia 3x3:', gridPaths(3, 3));  // 6
console.log('Percorsi in una griglia 3x7 (con memoizzazione):', gridPathsMemo(3, 7));  // 28

// --------------------------------------------------------
// PARTE 5: Sudoku Solver
// --------------------------------------------------------

console.log('\n===== SUDOKU SOLVER =====');

/**
 * Risolve un puzzle Sudoku utilizzando backtracking.
 * 
 * @param {number[][]} board - Una matrice 9x9 che rappresenta il puzzle Sudoku
 * @returns {boolean} true se il puzzle è stato risolto, false altrimenti
 */
function solveSudoku(board) {
  // Trova una cella vuota
  const emptyCell = findEmptyCell(board);
  
  // Se non ci sono celle vuote, il puzzle è risolto
  if (!emptyCell) {
    return true;
  }
  
  const [row, col] = emptyCell;
  
  // Prova ogni numero da 1 a 9
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      // Posiziona il numero
      board[row][col] = num;
      
      // Risolvi ricorsivamente il resto del puzzle
      if (solveSudoku(board)) {
        return true;
      }
      
      // Se non porta a una soluzione, ripristina la cella
      board[row][col] = 0; // Backtrack
    }
  }
  
  // Nessun numero porta a una soluzione
  return false;
}

// Helper: trova una cella vuota
function findEmptyCell(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return null; // Non ci sono celle vuote
}

// Helper: controlla se un numero può essere posizionato in una cella
function isValidPlacement(board, row, col, num) {
  // Controlla la riga
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) {
      return false;
    }
  }
  
  // Controlla la colonna
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) {
      return false;
    }
  }
  
  // Controlla il blocco 3x3
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) {
        return false;
      }
    }
  }
  
  return true;
}

// Esempio di utilizzo
const sudokuBoard = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

console.log('Sudoku originale:');
console.log(sudokuBoard.map(row => row.join(' ')).join('\n'));

if (solveSudoku(sudokuBoard)) {
  console.log('\nSudoku risolto:');
  console.log(sudokuBoard.map(row => row.join(' ')).join('\n'));
} else {
  console.log('\nNessuna soluzione trovata.');
}
