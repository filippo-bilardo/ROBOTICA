# Guida al Gioco Blockout

## Introduzione
Blockout è un'affascinante variante tridimensionale del classico Tetris, sviluppato originariamente nel 1989. In questo gioco, i giocatori devono manipolare e posizionare blocchi 3D che cadono in un pozzo tridimensionale. A differenza del Tetris tradizionale, Blockout aggiunge una dimensione di profondità che richiede ai giocatori di pensare in modo spaziale, ruotando i pezzi su tutti e tre gli assi per riempire completamente i livelli del pozzo e farli scomparire.

![Schermata principale di Blockout](img/11_blockout.jpg)

*Immagine: Schermata classica del gioco Blockout con il pozzo 3D e i blocchi colorati.*

## Come si Gioca
- Controlla i blocchi 3D che cadono nel pozzo
- Ruota i blocchi su tutti e tre gli assi (X, Y e Z)
- Posiziona strategicamente i blocchi per completare interi piani
- Quando un piano è completamente riempito, scompare e guadagni punti
- Il gioco termina quando i blocchi raggiungono la cima del pozzo

## Caratteristiche Principali
- Gameplay in 3D che estende il concetto di Tetris
- Controlli intuitivi per la rotazione e il posizionamento dei blocchi
- Diversi livelli di difficoltà con pozzi di dimensioni variabili
- Sistema di punteggio basato sulla complessità dei blocchi e la velocità di gioco
- Effetti visivi che migliorano la percezione della profondità

## Implementazione in JavaScript

La versione HTML/JavaScript di Blockout ricrea l'esperienza tridimensionale del gioco originale. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas con tecniche di rendering 3D per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Per il rendering 3D utilizziamo una libreria come Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
```

### Oggetti di Gioco

Il gioco definisce diversi oggetti principali:

1. **Il pozzo**: Un oggetto che rappresenta lo spazio tridimensionale in cui cadono i blocchi.

```javascript
class Well {
    constructor(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.grid = new Array(width * height * depth).fill(0);
        this.mesh = this.createMesh();
    }
    
    createMesh() {
        // Crea la geometria del pozzo
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        return new THREE.LineSegments(edges, material);
    }
    
    isCellOccupied(x, y, z) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
            return true; // Considera le celle fuori dal pozzo come occupate
        }
        return this.grid[this.getIndex(x, y, z)] !== 0;
    }
    
    getIndex(x, y, z) {
        return x + y * this.width + z * this.width * this.height;
    }
    
    placeBlock(block) {
        // Posiziona il blocco nel pozzo
        for (const cell of block.cells) {
            const worldPos = block.getWorldPosition(cell);
            const index = this.getIndex(worldPos.x, worldPos.y, worldPos.z);
            this.grid[index] = block.color;
        }
        
        // Controlla se ci sono piani completi
        this.checkCompletePlanes();
    }
    
    checkCompletePlanes() {
        let planesCleared = 0;
        
        // Controlla ogni piano orizzontale
        for (let y = 0; y < this.height; y++) {
            let planeComplete = true;
            
            // Verifica se tutte le celle del piano sono occupate
            for (let z = 0; z < this.depth; z++) {
                for (let x = 0; x < this.width; x++) {
                    if (!this.isCellOccupied(x, y, z)) {
                        planeComplete = false;
                        break;
                    }
                }
                if (!planeComplete) break;
            }
            
            // Se il piano è completo, rimuovilo e sposta tutto verso il basso
            if (planeComplete) {
                this.clearPlane(y);
                planesCleared++;
            }
        }
        
        return planesCleared;
    }
    
    clearPlane(y) {
        // Rimuovi il piano y
        for (let z = 0; z < this.depth; z++) {
            for (let x = 0; x < this.width; x++) {
                // Sposta tutti i blocchi sopra il piano y verso il basso
                for (let currentY = y; currentY < this.height - 1; currentY++) {
                    const currentIndex = this.getIndex(x, currentY, z);
                    const aboveIndex = this.getIndex(x, currentY + 1, z);
                    this.grid[currentIndex] = this.grid[aboveIndex];
                }
                // Svuota la riga superiore
                this.grid[this.getIndex(x, this.height - 1, z)] = 0;
            }
        }
    }
}
```

2. **I blocchi 3D**: Oggetti che rappresentano i pezzi che cadono nel pozzo.

```javascript
class Block3D {
    constructor(type) {
        this.type = type;
        this.cells = this.createCells(type);
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.color = this.getColorForType(type);
        this.mesh = this.createMesh();
    }
    
    createCells(type) {
        // Definisce la forma del blocco in base al tipo
        switch (type) {
            case 'I':
                return [
                    { x: -1, y: 0, z: 0 },
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: 0, z: 0 },
                    { x: 2, y: 0, z: 0 }
                ];
            case 'L':
                return [
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: 0, z: 0 },
                    { x: 2, y: 0, z: 0 },
                    { x: 0, y: 1, z: 0 }
                ];
            case 'T':
                return [
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: 0, z: 0 },
                    { x: 2, y: 0, z: 0 },
                    { x: 1, y: 1, z: 0 }
                ];
            case 'O':
                return [
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: 0, z: 0 },
                    { x: 0, y: 1, z: 0 },
                    { x: 1, y: 1, z: 0 }
                ];
            case 'Z':
                return [
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: 0, z: 0 },
                    { x: 1, y: 1, z: 0 },
                    { x: 2, y: 1, z: 0 }
                ];
            // Aggiungi altri tipi di blocchi 3D
        }
    }
    
    getColorForType(type) {
        const colors = {
            'I': 0xff0000, // Rosso
            'L': 0x00ff00, // Verde
            'T': 0x0000ff, // Blu
            'O': 0xffff00, // Giallo
            'Z': 0xff00ff  // Magenta
        };
        return colors[type] || 0xffffff;
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        // Crea un cubo per ogni cella del blocco
        for (const cell of this.cells) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshLambertMaterial({ color: this.color });
            const cube = new THREE.Mesh(geometry, material);
            
            cube.position.set(cell.x, cell.y, cell.z);
            group.add(cube);
        }
        
        return group;
    }
    
    getWorldPosition(cell) {
        // Applica rotazione e traslazione alla cella
        // Questa è una versione semplificata, in un'implementazione reale
        // si utilizzerebbe una matrice di trasformazione
        const rotatedCell = this.applyRotation(cell);
        
        return {
            x: rotatedCell.x + this.position.x,
            y: rotatedCell.y + this.position.y,
            z: rotatedCell.z + this.position.z
        };
    }
    
    applyRotation(cell) {
        // Applica le rotazioni sui tre assi
        // Questa è una versione semplificata
        let x = cell.x;
        let y = cell.y;
        let z = cell.z;
        
        // Rotazione attorno all'asse X
        if (this.rotation.x !== 0) {
            const cosX = Math.cos(this.rotation.x);
            const sinX = Math.sin(this.rotation.x);
            const newY = y * cosX - z * sinX;
            const newZ = y * sinX + z * cosX;
            y = Math.round(newY);
            z = Math.round(newZ);
        }
        
        // Rotazione attorno all'asse Y
        if (this.rotation.y !== 0) {
            const cosY = Math.cos(this.rotation.y);
            const sinY = Math.sin(this.rotation.y);
            const newX = x * cosY + z * sinY;
            const newZ = -x * sinY + z * cosY;
            x = Math.round(newX);
            z = Math.round(newZ);
        }
        
        // Rotazione attorno all'asse Z
        if (this.rotation.z !== 0) {
            const cosZ = Math.cos(this.rotation.z);
            const sinZ = Math.sin(this.rotation.z);
            const newX = x * cosZ - y * sinZ;
            const newY = x * sinZ + y * cosZ;
            x = Math.round(newX);
            y = Math.round(newY);
        }
        
        return { x, y, z };
    }
    
    moveDown() {
        this.position.y--;
    }
    
    moveLeft() {
        this.position.x--;
    }
    
    moveRight() {
        this.position.x++;
    }
    
    moveForward() {
        this.position.z--;
    }
    
    moveBackward() {
        this.position.z++;
    }
    
    rotateX() {
        this.rotation.x += Math.PI / 2;
    }
    
    rotateY() {
        this.rotation.y += Math.PI / 2;
    }
    
    rotateZ() {
        this.rotation.z += Math.PI / 2;
    }
    
    canMove(direction, well) {
        // Verifica se il blocco può muoversi nella direzione specificata
        const tempPosition = { ...this.position };
        
        switch (direction) {
            case 'down':
                tempPosition.y--;
                break;
            case 'left':
                tempPosition.x--;
                break;
            case 'right':
                tempPosition.x++;
                break;
            case 'forward':
                tempPosition.z--;
                break;
            case 'backward':
                tempPosition.z++;
                break;
        }
        
        // Controlla se la nuova posizione è valida
        for (const cell of this.cells) {
            const worldPos = this.getWorldPosition(cell);
            worldPos.x = worldPos.x - this.position.x + tempPosition.x;
            worldPos.y = worldPos.y - this.position.y + tempPosition.y;
            worldPos.z = worldPos.z - this.position.z + tempPosition.z;
            
            if (well.isCellOccupied(worldPos.x, worldPos.y, worldPos.z)) {
                return false;
            }
        }
        
        return true;
    }
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare i blocchi:

```javascript
document.addEventListener('keydown', function(e) {
    if (!gameActive) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            if (currentBlock.canMove('left', well)) {
                currentBlock.moveLeft();
            }
            break;
        case 'ArrowRight':
            if (currentBlock.canMove('right', well)) {
                currentBlock.moveRight();
            }
            break;
        case 'ArrowUp':
            if (currentBlock.canMove('forward', well)) {
                currentBlock.moveForward();
            }
            break;
        case 'ArrowDown':
            if (currentBlock.canMove('backward', well)) {
                currentBlock.moveBackward();
            }
            break;
        case ' ': // Spazio
            // Fai cadere il blocco fino in fondo
            while (currentBlock.canMove('down', well)) {
                currentBlock.moveDown();
                score += 1;
            }
            placeBlock();
            break;
        case 'x':
            // Ruota attorno all'asse X
            currentBlock.rotateX();
            // Se la rotazione causa una collisione, annullala
            if (!isValidPosition(currentBlock, well)) {
                currentBlock.rotateX();
                currentBlock.rotateX();
                currentBlock.rotateX();
            }
            break;
        case 'y':
            // Ruota attorno all'asse Y
            currentBlock.rotateY();
            if (!isValidPosition(currentBlock, well)) {
                currentBlock.rotateY();
                currentBlock.rotateY();
                currentBlock.rotateY();
            }
            break;
        case 'z':
            // Ruota attorno all'asse Z
            currentBlock.rotateZ();
            if (!isValidPosition(currentBlock, well)) {
                currentBlock.rotateZ();
                currentBlock.rotateZ();
                currentBlock.rotateZ();
            }
            break;
    }
    
    updateScene();
});
```

### Loop di Gioco

Il loop principale del gioco gestisce la caduta dei blocchi, controlla le collisioni e aggiorna la scena:

```javascript
function gameLoop() {
    if (!gameActive) return;
    
    const now = Date.now();
    const delta = now - lastTime;
    
    if (delta > dropInterval) {
        // Fai cadere il blocco
        if (currentBlock.canMove('down', well)) {
            currentBlock.moveDown();
        } else {
            // Il blocco ha raggiunto il fondo o un altro blocco
            placeBlock();
        }
        
        lastTime = now;
    }
    
    updateScene();
    requestAnimationFrame(gameLoop);
}

function placeBlock() {
    // Posiziona il blocco nel pozzo
    well.placeBlock(currentBlock);
    
    // Controlla se ci sono piani completi
    const planesCleared = well.checkCompletePlanes();
    
    // Aggiorna il punteggio
    if (planesCleared > 0) {
        // Più piani vengono eliminati contemporaneamente, più punti si ottengono
        score += planesCleared * planesCleared * 100;
        
        // Aumenta la velocità di caduta
        dropInterval = Math.max(100, dropInterval - 10);
    }
    
    // Genera un nuovo blocco
    currentBlock = generateRandomBlock();
    
    // Posiziona il nuovo blocco in cima al pozzo
    currentBlock.position.x = Math.floor(well.width / 2) - 1;
    currentBlock.position.y = well.height - 1;
    currentBlock.position.z = Math.floor(well.depth / 2) - 1;
    
    // Controlla se il gioco è finito (il nuovo blocco collide immediatamente)
    if (!isValidPosition(currentBlock, well)) {
        gameOver();
    }
}

function isValidPosition(block, well) {
    for (const cell of block.cells) {
        const worldPos = block.getWorldPosition(cell);
        if (well.isCellOccupied(worldPos.x, worldPos.y, worldPos.z)) {
            return false;
        }
    }
    return true;
}

function updateScene() {
    // Aggiorna la posizione del blocco corrente nella scena
    scene.remove(currentBlock.mesh);
    currentBlock.mesh.position.set(
        currentBlock.position.x,
        currentBlock.position.y,
        currentBlock.position.z
    );
    scene.add(currentBlock.mesh);
    
    // Aggiorna l'interfaccia utente
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = Math.floor(score / 1000) + 1;
    
    // Renderizza la scena
    renderer.render(scene, camera);
}
```

## Concetti di Programmazione Utilizzati

1. **Rendering 3D**: Utilizzo di tecniche di rendering tridimensionale per creare un ambiente di gioco immersivo.
2. **Gestione degli eventi**: Rilevamento degli input da tastiera per controllare i blocchi.
3. **Programmazione orientata agli oggetti**: Utilizzo di classi per rappresentare entità di gioco.
4. **Trasformazioni geometriche**: Applicazione di rotazioni e traslazioni per manipolare oggetti 3D.
5. **Rilevamento delle collisioni**: Implementazione di algoritmi per rilevare quando i blocchi collidono.
6. **Game loop**: Utilizzo di requestAnimationFrame per creare un ciclo di gioco fluido.

## Estensioni Possibili

1. **Modalità di gioco diverse**: Implementare varianti con pozzi di diverse dimensioni o forme.
2. **Blocchi personalizzati**: Permettere ai giocatori di creare e salvare i propri blocchi 3D.
3. **Effetti visivi avanzati**: Aggiungere effetti particellari quando i piani vengono eliminati.
4. **Modalità multiplayer**: Aggiungere la possibilità di giocare contro altri giocatori in tempo reale.
5. **Controlli touch**: Implementare controlli touch per dispositivi mobili.

Questa implementazione di Blockout in JavaScript offre un'esperienza di gioco coinvolgente che estende il concetto di Tetris alla terza dimensione, sfidando i giocatori a pensare in modo spaziale mentre gestiscono i blocchi che cadono nel pozzo tridimensionale.