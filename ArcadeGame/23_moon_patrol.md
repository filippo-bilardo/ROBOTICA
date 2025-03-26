# Guida al Gioco Moon Patrol

## Introduzione
Moon Patrol è un classico gioco arcade sviluppato da Irem nel 1982 e successivamente pubblicato da Williams Electronics. È stato uno dei primi giochi a utilizzare lo scrolling parallasse per creare un effetto di profondità. Nel gioco, il giocatore controlla un veicolo lunare (rover) che deve navigare attraverso un paesaggio lunare pieno di crateri e rocce, mentre combatte contro nemici alieni che attaccano dall'alto.

![Schermata principale di Moon Patrol](img/23_moon_patrol.jpg)

*Immagine: Schermata classica del gioco Moon Patrol con il rover lunare e il paesaggio lunare.*

## Come si Gioca
- Guida il rover lunare attraverso il terreno accidentato
- Salta sopra crateri e rocce premendo il tasto Spazio
- Spara ai nemici aerei con il tasto Z (sparo verso l'alto)
- Spara agli ostacoli terrestri con il tasto X (sparo in avanti)
- Raggiungi i checkpoint per avanzare nel gioco
- Evita di schiantarti contro gli ostacoli o essere colpito dai proiettili nemici

## Caratteristiche Principali
- Scrolling parallasse che crea un effetto di profondità (montagne e stelle sullo sfondo)
- Sistema di controllo intuitivo per il movimento, salto e sparo
- Diversi tipi di nemici con comportamenti differenti (UFO e velivoli)
- Ostacoli vari come crateri e rocce che richiedono tempismo preciso
- Sistema di punteggio basato sulla distanza percorsa e nemici eliminati
- Checkpoint che segnano il progresso del giocatore

## Implementazione in JavaScript

La versione HTML/JavaScript di Moon Patrol ricrea l'esperienza del gioco arcade originale. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas e Elementi di Gioco

```javascript
// Ottieni riferimenti agli elementi DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const finalScoreElement = document.getElementById('finalScore');

// Costanti di gioco
const GROUND_HEIGHT = 40;
const ROVER_WIDTH = 60;
const ROVER_HEIGHT = 30;
const JUMP_POWER = 15;
const GRAVITY = 0.8;
const OBSTACLE_TYPES = ['crater', 'rock'];
const ENEMY_TYPES = ['ufo', 'aircraft'];
const BULLET_SPEED = 10;
const SCROLL_SPEED = 3;
```

### Oggetti di Gioco

Il gioco definisce diversi oggetti principali:

1. **Il rover lunare**: L'oggetto controllato dal giocatore.

```javascript
let rover = {
    x: 150,
    y: canvas.height - GROUND_HEIGHT - ROVER_HEIGHT,
    width: ROVER_WIDTH,
    height: ROVER_HEIGHT,
    speed: 5,
    jumpVelocity: 0,
    isJumping: false,
    isMovingLeft: false,
    isMovingRight: false,
    isShooting: false,
    isShootingUp: false
};
```

2. **Ostacoli**: Oggetti come crateri e rocce che il rover deve evitare.

```javascript
function createObstacle() {
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    let width, height;
    
    if (type === 'crater') {
        width = 40 + Math.random() * 30;
        height = 10;
    } else { // rock
        width = 20 + Math.random() * 20;
        height = 20 + Math.random() * 15;
    }
    
    return {
        x: canvas.width,
        y: canvas.height - GROUND_HEIGHT - height,
        width: width,
        height: height,
        type: type
    };
}
```

3. **Nemici**: UFO e velivoli che attaccano il rover.

```javascript
function createEnemy() {
    const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    let y, speed;
    
    if (type === 'ufo') {
        y = 100 + Math.random() * 150;
        speed = 2 + Math.random() * 2;
    } else { // aircraft
        y = 50 + Math.random() * 100;
        speed = 3 + Math.random() * 3;
    }
    
    return {
        x: canvas.width,
        y: y,
        width: 40,
        height: 20,
        type: type,
        speed: speed,
        shootTimer: 0,
        shootInterval: 60 + Math.random() * 120
    };
}
```

4. **Proiettili**: Sparati dal rover o dai nemici.

```javascript
function createBullet(x, y, direction, isPlayerBullet) {
    return {
        x: x,
        y: y,
        width: 5,
        height: 5,
        direction: direction, // 'up' o 'forward' o 'down'
        speed: BULLET_SPEED,
        isPlayerBullet: isPlayerBullet
    };
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare il rover:

```javascript
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') rover.isMovingLeft = true;
    if (e.key === 'ArrowRight') rover.isMovingRight = true;
    if (e.key === ' ' && !rover.isJumping) jump();
    if (e.key === 'z') rover.isShootingUp = true;
    if (e.key === 'x') rover.isShooting = true;
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowLeft') rover.isMovingLeft = false;
    if (e.key === 'ArrowRight') rover.isMovingRight = false;
    if (e.key === 'z') rover.isShootingUp = false;
    if (e.key === 'x') rover.isShooting = false;
});

function jump() {
    rover.isJumping = true;
    rover.jumpVelocity = JUMP_POWER;
}
```

### Loop di Gioco

Il loop principale del gioco gestisce l'aggiornamento degli oggetti, il rilevamento delle collisioni e il rendering:

```javascript
function gameLoop() {
    if (!gameRunning) return;
    
    // Cancella il canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Aggiorna lo sfondo
    updateBackground();
    
    // Aggiorna la posizione del rover
    updateRover();
    
    // Genera nuovi ostacoli e nemici
    if (Math.random() < 0.01 && Date.now() - lastObstacleTime > 1000) {
        obstacles.push(createObstacle());
        lastObstacleTime = Date.now();
    }
    
    if (Math.random() < 0.005 && Date.now() - lastEnemyTime > 2000) {
        enemies.push(createEnemy());
        lastEnemyTime = Date.now();
    }
    
    // Aggiorna e disegna gli ostacoli
    updateObstacles();
    
    // Aggiorna e disegna i nemici
    updateEnemies();
    
    // Aggiorna e disegna i proiettili
    updateBullets();
    
    // Aggiorna e disegna le esplosioni
    updateExplosions();
    
    // Disegna il terreno
    drawGround();
    
    // Disegna il rover
    drawRover();
    
    // Aggiorna e disegna l'interfaccia utente
    updateUI();
    
    // Controlla se il giocatore ha raggiunto un checkpoint
    checkCheckpoint();
    
    // Incrementa il punteggio e la distanza
    score += 1;
    distance += SCROLL_SPEED;
    
    // Continua il loop di gioco
    requestAnimationFrame(gameLoop);
}
```

### Rilevamento delle Collisioni

Il gioco implementa funzioni per rilevare le collisioni tra gli oggetti:

```javascript
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= SCROLL_SPEED;
        
        // Rimuovi gli ostacoli fuori dallo schermo
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            continue;
        }
        
        // Controlla collisione con il rover
        if (checkCollision(rover, obstacle) && !rover.isJumping) {
            gameOver();
            return;
        }
        
        // Disegna l'ostacolo
        drawObstacle(obstacle);
    }
}
```

### Effetti Visivi

Il gioco include effetti visivi come esplosioni e parallasse per lo sfondo:

```javascript
function createExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        radius: 5,
        maxRadius: 30,
        growthRate: 1.5,
        alpha: 1
    });
}

function updateBackground() {
    // Disegna il cielo
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Disegna le stelle
    ctx.fillStyle = COLORS.stars;
    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Aggiorna e disegna le montagne (parallasse più lento)
    mountainsX -= SCROLL_SPEED * 0.5;
    if (mountainsX <= -canvas.width) mountainsX = 0;
    
    drawMountains(mountainsX);
    drawMountains(mountainsX + canvas.width);
}
```

## Concetti di Programmazione Utilizzati

1. **Gestione degli eventi**: Rilevamento degli input da tastiera per controllare il rover.
2. **Animazione con Canvas**: Utilizzo di requestAnimationFrame per creare un ciclo di gioco fluido.
3. **Fisica di base**: Implementazione di gravità e salto per il rover.
4. **Rilevamento delle collisioni**: Algoritmi per rilevare quando gli oggetti collidono.
5. **Parallasse**: Tecnica di scrolling a velocità differenti per creare un effetto di profondità.
6. **Generazione procedurale**: Creazione casuale di ostacoli e nemici.
7. **Gestione dello stato di gioco**: Transizioni tra stati diversi (inizio, gioco, game over).

## Estensioni Possibili

1. **Livelli multipli**: Implementare diversi livelli con difficoltà crescente.
2. **Power-up**: Aggiungere oggetti che forniscono abilità speciali al rover.
3. **Effetti sonori**: Integrare suoni per le azioni di gioco (sparo, salto, esplosioni).
4. **Modalità multiplayer**: Aggiungere la possibilità di giocare in due, con un secondo rover.
5. **Personalizzazione del rover**: Permettere ai giocatori di personalizzare l'aspetto o le abilità del loro veicolo.
6. **Sistema di salvataggio**: Implementare un sistema per salvare i punteggi più alti.
7. **Modalità sfida**: Aggiungere modalità di gioco alternative con obiettivi specifici.

Questa implementazione di Moon Patrol in JavaScript ricrea l'esperienza del gioco arcade classico, offrendo un'esperienza di gioco coinvolgente che combina azione, tempismo e riflessi rapidi mentre il giocatore naviga attraverso il paesaggio lunare ostile.