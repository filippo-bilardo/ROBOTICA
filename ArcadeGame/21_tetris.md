# Guida al Gioco Tetris

## Introduzione
Tetris è uno dei videogiochi più iconici e riconoscibili di tutti i tempi, creato dal programmatore russo Alexey Pajitnov nel 1984. Il gioco consiste nel manipolare dei tetramini (forme geometriche composte da quattro blocchi) che cadono dall'alto in un pozzo, con l'obiettivo di creare linee orizzontali complete che scompaiono, facendo guadagnare punti al giocatore. La sua semplicità, unita a un gameplay avvincente e alla sfida crescente, lo ha reso un fenomeno culturale globale.

![Schermata principale di Tetris](img/21_tetris.png)

*Immagine: Schermata classica del gioco Tetris con i tetramini che cadono e si accumulano.*

## Come si Gioca
- I tetramini (blocchi di forme diverse) cadono dall'alto dello schermo
- Usa i tasti direzionali per muovere e ruotare i tetramini
- Crea linee orizzontali complete per farle scomparire e guadagnare punti
- Evita che i blocchi raggiungano la parte superiore dello schermo
- La velocità di caduta aumenta progressivamente con il punteggio
- Pianifica strategicamente il posizionamento dei pezzi per massimizzare i punti

## Caratteristiche Principali
- Sette tetramini diversi (I, J, L, O, S, T, Z) ciascuno con un colore distintivo
- Sistema di punteggio basato sul numero di linee eliminate contemporaneamente
- Livelli di difficoltà progressivi con velocità di caduta crescente
- Anteprima del prossimo pezzo in arrivo
- Sistema di "hold" per conservare un pezzo per uso futuro
- Meccanica di "hard drop" per far cadere istantaneamente i pezzi

## Implementazione in JavaScript

La versione HTML/JavaScript di Tetris ricrea l'esperienza classica del gioco. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas e Costanti

Il gioco utilizza l'elemento HTML Canvas per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dimensioni della griglia di gioco
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

// Colori dei tetramini
const COLORS = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF'  // Z
];

// Forme dei tetramini
const SHAPES = [
    null,
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]],                         // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]],                         // L
    [[0, 4, 4], [0, 4, 4], [0, 0, 0]],                         // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]],                         // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]],                         // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]                          // Z
];
```

### Classe Tetris

La classe principale che gestisce la logica del gioco:

```javascript
class Tetris {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Imposta le dimensioni del canvas
        this.canvas.width = COLS * BLOCK_SIZE;
        this.canvas.height = ROWS * BLOCK_SIZE;
        
        // Scala i blocchi
        this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
        
        // Inizializza la griglia di gioco
        this.grid = this.createGrid();
        
        // Inizializza il pezzo corrente e il prossimo
        this.piece = this.createPiece();
        this.nextPiece = this.createPiece();
        
        // Inizializza le variabili di gioco
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.holdPiece = null;
        this.canHold = true;
        
        // Imposta il timer di caduta
        this.dropCounter = 0;
        this.dropInterval = 1000; // Millisecondi
        
        // Avvia il loop di gioco
        this.lastTime = 0;
        this.animate();
    }
    
    createGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
    
    createPiece(type) {
        if (!type) {
            type = Math.floor(Math.random() * 7) + 1;
        }
        
        return {
            position: { x: Math.floor(COLS / 2) - 1, y: 0 },
            shape: SHAPES[type],
            type: type
        };
    }
    
    draw() {
        // Cancella il canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Disegna la griglia
        this.drawGrid();
        
        // Disegna il pezzo corrente
        this.drawPiece(this.piece);
        
        // Disegna l'anteprima di caduta
        this.drawGhostPiece();
    }
    
    drawGrid() {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillStyle = COLORS[value];
                    this.ctx.fillRect(x, y, 1, 1);
                    
                    // Bordo del blocco
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 0.05;
                    this.ctx.strokeRect(x, y, 1, 1);
                }
            });
        });
    }
    
    drawPiece(piece) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillStyle = COLORS[value];
                    this.ctx.fillRect(
                        x + piece.position.x,
                        y + piece.position.y,
                        1, 1
                    );
                    
                    // Bordo del blocco
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 0.05;
                    this.ctx.strokeRect(
                        x + piece.position.x,
                        y + piece.position.y,
                        1, 1
                    );
                }
            });
        });
    }
    
    drawGhostPiece() {
        // Crea una copia del pezzo corrente
        const ghostPiece = {
            position: { x: this.piece.position.x, y: this.piece.position.y },
            shape: this.piece.shape,
            type: this.piece.type
        };
        
        // Trova la posizione più bassa possibile
        while (!this.collision(ghostPiece, { x: 0, y: 1 })) {
            ghostPiece.position.y++;
        }
        
        // Disegna il pezzo fantasma
        ghostPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    this.ctx.fillRect(
                        x + ghostPiece.position.x,
                        y + ghostPiece.position.y,
                        1, 1
                    );
                    
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    this.ctx.lineWidth = 0.05;
                    this.ctx.strokeRect(
                        x + ghostPiece.position.x,
                        y + ghostPiece.position.y,
                        1, 1
                    );
                }
            });
        });
    }
    
    collision(piece, offset) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const newX = x + piece.position.x + offset.x;
                    const newY = y + piece.position.y + offset.y;
                    
                    if (
                        newX < 0 || newX >= COLS ||
                        newY >= ROWS ||
                        (newY >= 0 && this.grid[newY][newX] !== 0)
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    merge() {
        this.piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.grid[y + this.piece.position.y][x + this.piece.position.x] = value;
                }
            });
        });
    }
    
    rotate(piece, direction) {
        // Crea una copia della forma
        const newShape = piece.shape.map(row => [...row]);
        
        // Ruota la forma
        if (direction > 0) { // Senso orario
            for (let y = 0; y < newShape.length; y++) {
                for (let x = 0; x < y; x++) {
                    [newShape[x][y], newShape[y][x]] = [newShape[y][x], newShape[x][y]];
                }
            }
            newShape.forEach(row => row.reverse());
        } else { // Senso antiorario
            newShape.forEach(row => row.reverse());
            for (let y = 0; y < newShape.length; y++) {
                for (let x = 0; x < y; x++) {
                    [newShape[x][y], newShape[y][x]] = [newShape[y][x], newShape[x][y]];
                }
            }
        }
        
        // Crea un nuovo pezzo con la forma ruotata
        const rotatedPiece = {
            position: { x: piece.position.x, y: piece.position.y },
            shape: newShape,
            type: piece.type
        };
        
        // Controlla se la rotazione è valida
        if (!this.collision(rotatedPiece, { x: 0, y: 0 })) {
            piece.shape = newShape;
        } else {
            // Prova a fare wall kick (spostamento laterale per evitare collisioni)
            const kicks = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: -1 },
                { x: 2, y: 0 },
                { x: -2, y: 0 }
            ];
            
            for (const kick of kicks) {
                if (!this.collision(rotatedPiece, kick)) {
                    piece.shape = newShape;
                    piece.position.x += kick.x;
                    piece.position.y += kick.y;
                    break;
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        outer: for (let y = ROWS - 1; y >= 0; y--) {
            for (let x = 0; x < COLS; x++) {
                if (this.grid[y][x] === 0) {
                    continue outer;
                }
            }
            
            // Rimuovi la riga completa
            const row = this.grid.splice(y, 1)[0].fill(0);
            this.grid.unshift(row);
            y++; // Controlla di nuovo la stessa riga
            
            linesCleared++;
        }
        
        // Aggiorna punteggio e livello
        if (linesCleared > 0) {
            // Sistema di punteggio classico di Tetris
            const points = [0, 100, 300, 500, 800];
            this.score += points[linesCleared] * this.level;
            
            this.lines += linesCleared;
            this.level = Math.floor(this.lines / 10) + 1;
            
            // Aggiorna la velocità di caduta
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
    }
    
    drop() {
        if (!this.collision(this.piece, { x: 0, y: 1 })) {
            this.piece.position.y++;
        } else {
            // Il pezzo ha toccato il fondo
            this.merge();
            this.clearLines();
            
            // Controlla game over
            if (this.piece.position.y === 0) {
                this.gameOver = true;
                return;
            }
            
            // Passa al prossimo pezzo
            this.piece = this.nextPiece;
            this.nextPiece = this.createPiece();
            this.canHold = true;
        }
        
        this.dropCounter = 0;
    }
    
    hardDrop() {
        while (!this.collision(this.piece, { x: 0, y: 1 })) {
            this.piece.position.y++;
        }
        this.drop();
    }
    
    move(direction) {
        if (!this.collision(this.piece, { x: direction, y: 0 })) {
            this.piece.position.x += direction;
        }
    }
    
    hold() {
        if (!this.canHold) return;
        
        if (this.holdPiece === null) {
            this.holdPiece = this.createPiece(this.piece.type);
            this.piece = this.nextPiece;
            this.nextPiece = this.createPiece();
        } else {
            const temp = this.createPiece(this.holdPiece.type);
            this.holdPiece = this.createPiece(this.piece.type);
            this.piece = temp;
        }
        
        // Resetta la posizione del pezzo
        this.piece.position.y = 0;
        this.piece.position.x = Math.floor(COLS / 2) - 1;
        
        this.canHold = false;
    }
    
    animate(time = 0) {
        if (this.gameOver || this.paused) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
        
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }
}
```

### Gestione degli Input

```javascript
document.addEventListener('keydown', (e) => {
    if (tetris.gameOver || tetris.paused) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            tetris.move(-1);
            break;
        case 'ArrowRight':
            tetris.move(1);
            break;
        case 'ArrowDown':
            tetris.drop();
            break;
        case 'ArrowUp':
            tetris.rotate(tetris.piece, 1);
            break;
        case 'z':
        case 'Z':
            tetris.rotate(tetris.piece, -1);
            break;
        case ' ':
            tetris.hardDrop();
            break;
        case 'c':
        case 'C':
            tetris.hold();
            break;
        case 'p':
        case 'P':
            tetris.paused = !tetris.paused;
            if (!tetris.paused) {
                tetris.lastTime = performance.now();
                tetris.animate();
            }
            break;
    }
});
```

### Interfaccia Utente

```javascript
function drawUI() {
    // Disegna il punteggio
    scoreElement.textContent = tetris.score;
    
    // Disegna il livello
    levelElement.textContent = tetris.level;
    
    // Disegna le linee completate
    linesElement.textContent = tetris.lines;
    
    // Disegna il prossimo pezzo
    drawNextPiece();
    
    // Disegna il pezzo in hold
    drawHoldPiece();
}

function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (tetris.nextPiece) {
        tetris.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    nextCtx.fillStyle = COLORS[value];
                    nextCtx.fillRect(x + 1, y + 1, 1, 1);
                    
                    nextCtx.strokeStyle = '#000';
                    nextCtx.lineWidth = 0.05;
                    nextCtx.strokeRect(x + 1, y + 1, 1, 1);
                }
            });
        });
    }
}

function drawHoldPiece() {
    holdCtx.fillStyle = '#000';
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    
    if (tetris.holdPiece) {
        tetris.holdPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    holdCtx.fillStyle = tetris.canHold ? COLORS[value] : '#888';
                    holdCtx.fillRect(x + 1, y + 1, 1, 1);
                    
                    holdCtx.strokeStyle = '#000';
                    holdCtx.lineWidth = 0.05;
                    holdCtx.strokeRect(x + 1, y + 1, 1, 1);
                }
            });
        });
    }
}
```

## Concetti di Programmazione Utilizzati

### Matrici Bidimensionali
Il gioco utilizza matrici bidimensionali per rappresentare la griglia di gioco e le forme dei tetramini.

```javascript
// Griglia di gioco
this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Forme dei tetramini
const SHAPES = [
    null,
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    // ...
];
```

### Algoritmi di Rotazione
Il gioco implementa algoritmi per ruotare i tetramini in senso orario e antiorario, con gestione delle collisioni e "wall kicks".

```javascript
rotate(piece, direction) {
    // Crea una copia della forma
    const newShape = piece.shape.map(row => [...row]);
    
    // Ruota la forma
    if (direction > 0) { // Senso orario
        for (let y = 0; y < newShape.length; y++) {
            for (let x = 0; x < y; x++) {
                [newShape[x][y], newShape[y][x]] = [newShape[y][x], newShape[x][y]];
            }
        }
        newShape.forEach(row => row.reverse());
    }
    // ...
}
```

### Rilevamento delle Collisioni
Il gioco implementa un sistema di rilevamento delle collisioni per determinare quando un tetramino colpisce il fondo o altri blocchi.

```javascript
collision(piece, offset) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0) {
                const newX = x + piece.position.x + offset.x;
                const newY = y + piece.position.y + offset.y;
                
                if (
                    newX < 0 || newX >= COLS ||
                    newY >= ROWS ||
                    (newY >= 0 && this.grid[newY][newX] !== 0)
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}
```

### Gestione del Tempo
Il gioco utilizza `requestAnimationFrame` e calcola il delta time per gestire la caduta dei tetramini a velocità variabile.

```javascript
animate(time = 0) {
    if (this.gameOver || this.paused) return;
    
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    
    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
        this.drop();
    }
    
    this.draw();
    requestAnimationFrame(this.animate.bind(this));
}
```

### Sistema di Punteggio
Il gioco implementa il classico sistema di punteggio di Tetris, con bonus per linee multiple e aumento di livello.

```javascript
// Sistema di punteggio classico di Tetris
const points = [0, 100, 300, 500, 800];
this.score += points[linesCleared] * this.level;
```

## Consigli per Estendere il Gioco

### Miglioramenti Grafici
- Aggiungere effetti di particelle quando le linee vengono eliminate
- Implementare animazioni per la rotazione e il movimento dei tetramini
- Creare sfondi tematici che cambiano con il livello
- Aggiungere effetti visivi quando si ottiene un Tetris (quattro linee contemporaneamente)

### Funzionalità Aggiuntive
- Implementare la modalità "T-Spin" per punteggi bonus con il tetramino T
- Aggiungere la funzione di "soft drop" per un controllo più preciso
- Implementare un sistema di combo per linee consecutive
- Creare una modalità sfida con obiettivi specifici
- Aggiungere una modalità battaglia contro l'IA o altri giocatori

### Ottimizzazioni
- Implementare un sistema di rendering più efficiente per dispositivi mobili
- Ottimizzare gli algoritmi di collisione per prestazioni migliori
- Aggiungere supporto per controlli touch su dispositivi mobili

### Personalizzazione
- Permettere ai giocatori di personalizzare i colori dei tetramini
- Implementare temi visivi selezionabili
- Aggiungere diverse modalità di gioco (maratona, sprint, ultra)
- Creare un editor di livelli per sfide personalizzate

## Conclusione
Tetris è un gioco senza tempo che ha dimostrato come la semplicità possa portare a un gameplay profondo e coinvolgente. La sua implementazione in JavaScript offre un'ottima opportunità per esplorare concetti di programmazione come la manipolazione di matrici, gli algoritmi di rotazione e i sistemi di collisione. Con le estensioni suggerite, è possibile creare una versione moderna che mantiene l'essenza dell'originale aggiungendo nuove funzionalità per arricchire l'esperienza di gioco.