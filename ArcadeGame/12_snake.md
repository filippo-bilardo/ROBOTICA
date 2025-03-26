# Guida al Gioco Snake

## Introduzione
Snake è un classico gioco arcade che ha avuto origine negli anni '70 e ha guadagnato enorme popolarità negli anni '90 quando è stato preinstallato sui telefoni Nokia. Il giocatore controlla un serpente che si muove continuamente all'interno di un'area delimitata. L'obiettivo è mangiare il cibo che appare sullo schermo, facendo crescere il serpente, evitando al contempo di colpire i muri o il proprio corpo.

![Schermata principale di Snake](img/12_snake.png)

*Immagine: Schermata classica del gioco Snake con il serpente e il cibo.*

## Come si Gioca
- Controlla il serpente usando i tasti direzionali
- Mangia il cibo per far crescere il serpente e guadagnare punti
- Evita di colpire i muri o il tuo stesso corpo
- Sopravvivi il più a lungo possibile e ottieni il punteggio più alto
- Con l'aumentare del livello, la velocità del serpente aumenta

## Caratteristiche Principali
- Gameplay semplice ma coinvolgente
- Controlli intuitivi
- Difficoltà progressiva con l'aumentare della lunghezza del serpente
- Sistema di punteggio basato sul cibo mangiato
- Ostacoli aggiuntivi nei livelli avanzati

## Implementazione in JavaScript

La versione HTML/JavaScript di Snake ricrea l'esperienza classica del gioco. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
```

### Costanti di Gioco

Il gioco definisce alcune costanti fondamentali per la configurazione:

```javascript
const GRID_SIZE = 20;
const GRID_WIDTH = canvas.width / GRID_SIZE;
const GRID_HEIGHT = canvas.height / GRID_SIZE;
```

### Oggetti di Gioco

Il serpente è rappresentato come un array di segmenti, dove ogni segmento ha coordinate x e y:

```javascript
let snake = [
    {x: 10, y: 15},
    {x: 9, y: 15},
    {x: 8, y: 15}
];
```

Il cibo è rappresentato da un oggetto con coordinate x e y:

```javascript
let food = null;

function generateFood() {
    // Genera cibo in una posizione casuale che non sia occupata dal serpente o dai muri
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
    } while (isOnSnake(newFood) || isOnWall(newFood));
    
    food = newFood;
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare la direzione del serpente:

```javascript
window.addEventListener('keydown', function(e) {
    // Previene il cambio di direzione a 180 gradi
    if (e.key === 'ArrowUp' && direction !== 'down') {
        nextDirection = 'up';
    } else if (e.key === 'ArrowDown' && direction !== 'up') {
        nextDirection = 'down';
    } else if (e.key === 'ArrowLeft' && direction !== 'right') {
        nextDirection = 'left';
    } else if (e.key === 'ArrowRight' && direction !== 'left') {
        nextDirection = 'right';
    }
});
```

### Loop di Gioco

Il loop principale del gioco aggiorna la posizione del serpente e gestisce le collisioni:

```javascript
function updateGame() {
    if (!gameRunning) return;
    
    // Aggiorna la direzione
    direction = nextDirection;
    
    // Calcola la nuova posizione della testa
    const head = {...snake[0]};
    
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // Controlla collisioni con i muri
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        gameOver();
        return;
    }
    
    // Controlla collisioni con il corpo del serpente
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    // Controlla collisioni con il cibo
    const ateFood = head.x === food.x && head.y === food.y;
    
    // Aggiungi la nuova testa
    snake.unshift(head);
    
    if (ateFood) {
        // Se ha mangiato il cibo, non rimuovere l'ultimo segmento (il serpente cresce)
        score += 10;
        generateFood();
        
        // Aumenta la velocità ogni 5 cibi mangiati
        if (score % 50 === 0) {
            level++;
            speed = Math.max(50, 150 - (level - 1) * 10);
            clearInterval(gameInterval);
            gameInterval = setInterval(updateGame, speed);
        }
    } else {
        // Rimuovi l'ultimo segmento (il serpente si muove)
        snake.pop();
    }
    
    // Disegna tutto
    draw();
}
```

### Rendering

Il gioco disegna tutti gli elementi sul canvas:

```javascript
function draw() {
    // Pulisci il canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Disegna la griglia
    ctx.strokeStyle = '#222';
    for (let i = 0; i < GRID_WIDTH; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < GRID_HEIGHT; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
    
    // Disegna i muri
    ctx.fillStyle = COLORS.wall;
    for (let wall of walls) {
        ctx.fillRect(wall.x * GRID_SIZE, wall.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
    
    // Disegna il cibo
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    
    // Disegna il serpente
    for (let i = 0; i < snake.length; i++) {
        // La testa ha un colore diverso
        ctx.fillStyle = i === 0 ? COLORS.snakeHead : COLORS.snake;
        ctx.fillRect(snake[i].x * GRID_SIZE, snake[i].y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
    
    // Disegna il punteggio
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${level}`, canvas.width - 100, 30);
}
```

### Sistema di Livelli

Il gioco implementa un sistema di livelli con difficoltà crescente:

```javascript
function initLevel() {
    // Crea il serpente
    snake = [
        {x: 10, y: 15},
        {x: 9, y: 15},
        {x: 8, y: 15}
    ];
    
    // Imposta la direzione iniziale
    direction = 'right';
    nextDirection = 'right';
    
    // Genera il cibo
    generateFood();
    
    // Crea i muri in base al livello
    createWalls();
    
    // Imposta la velocità in base al livello
    speed = Math.max(50, 150 - (level - 1) * 10);
    
    // Avvia il loop di gioco
    clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, speed);
}

function createWalls() {
    walls = [];
    
    // Livello 1: Nessun muro tranne i bordi
    // Livello 2+: Aggiungi muri interni
    if (level >= 2) {
        // Aggiungi alcuni muri orizzontali e verticali
        for (let i = 0; i < level; i++) {
            // Muro orizzontale casuale
            const x = Math.floor(Math.random() * (GRID_WIDTH - 10)) + 5;
            const y = Math.floor(Math.random() * (GRID_HEIGHT - 10)) + 5;
            const length = Math.floor(Math.random() * 5) + 5;
            
            for (let j = 0; j < length; j++) {
                if (x + j < GRID_WIDTH - 1) {
                    walls.push({x: x + j, y});
                }
            }
        }
    }
}
```

## Conclusione

Snake è un classico senza tempo che dimostra come un concetto di gioco semplice possa essere incredibilmente coinvolgente. La sua implementazione in JavaScript mostra i principi fondamentali della programmazione di giochi: gestione degli input, rilevamento delle collisioni, rendering grafico e logica di gioco. Nonostante la sua semplicità, Snake offre una sfida crescente che continua a divertire i giocatori di tutte le età.