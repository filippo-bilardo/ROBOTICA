# Guida al Gioco Enduro

## Introduzione
Enduro è un classico gioco di corse automobilistiche sviluppato da Activision nel 1983 per l'Atari 2600. Il gioco simula una gara di endurance in cui il giocatore deve guidare un'auto da corsa attraverso diversi paesaggi e condizioni meteorologiche, superando un numero prestabilito di veicoli ogni giorno per avanzare. Enduro è stato uno dei primi giochi a implementare cambiamenti di illuminazione e condizioni atmosferiche che influenzano il gameplay.

![Schermata principale di Enduro](img/27_enduro.jpg)

*Immagine: Schermata classica del gioco Enduro con l'auto da corsa e la strada.*

## Come si Gioca
- Guida la tua auto da corsa lungo una strada infinita
- Usa le frecce sinistra e destra per sterzare
- Usa la freccia su per accelerare e la freccia giù per frenare
- Evita di collidere con le altre auto in pista
- Supera il numero richiesto di auto per completare ogni giorno della gara
- Affronta diverse condizioni meteorologiche e cicli giorno/notte

## Caratteristiche Principali
- Ciclo giorno/notte con cambiamenti di illuminazione (alba, giorno, tramonto, notte)
- Condizioni meteorologiche variabili (nebbia, neve) che influenzano la visibilità
- Sistema di controllo intuitivo per la guida dell'auto
- Difficoltà progressiva con l'avanzare dei giorni
- Sistema di punteggio basato sul numero di auto superate
- Effetto di prospettiva che simula una visuale 3D

## Implementazione in JavaScript

La versione HTML/JavaScript di Enduro ricrea l'esperienza del gioco originale. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas e Elementi di Gioco

```javascript
// Ottieni riferimenti agli elementi DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const levelCompleteScreen = document.getElementById('levelCompleteScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const nextLevelButton = document.getElementById('nextLevelButton');
const finalScoreElement = document.getElementById('finalScore');
const levelScoreElement = document.getElementById('levelScore');

// Costanti di gioco
const ROAD_WIDTH = 400;
const ROAD_EDGE = (canvas.width - ROAD_WIDTH) / 2;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 80;
const PLAYER_Y = canvas.height - PLAYER_HEIGHT - 50;
const CAR_WIDTH = 50;
const CAR_HEIGHT = 80;
const MAX_SPEED = 10;
const ACCELERATION = 0.1;
const DECELERATION = 0.05;
const STEERING_SPEED = 5;
const HORIZON_Y = canvas.height / 3;
```

### Oggetti di Gioco

Il gioco definisce diversi oggetti principali:

1. **L'auto del giocatore**: L'oggetto controllato dal giocatore.

```javascript
let player = {
    x: playerX,
    y: PLAYER_Y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    isMovingLeft: false,
    isMovingRight: false,
    isAccelerating: false,
    isBraking: false
};
```

2. **Auto nemiche**: Le auto che il giocatore deve superare.

```javascript
function createEnemyCar() {
    const laneWidth = ROAD_WIDTH / 3;
    const lane = Math.floor(Math.random() * 3); // 0, 1, o 2
    const laneX = ROAD_EDGE + lane * laneWidth + laneWidth / 2 - CAR_WIDTH / 2;
    
    return {
        x: laneX,
        y: -CAR_HEIGHT,
        width: CAR_WIDTH,
        height: CAR_HEIGHT,
        speed: 2 + Math.random() * 2,
        color: COLORS.enemyCars[Math.floor(Math.random() * COLORS.enemyCars.length)]
    };
}
```

3. **Elementi del paesaggio**: Montagne e alberi che creano l'effetto di profondità.

```javascript
function createMountain() {
    return {
        x: Math.random() * canvas.width,
        y: HORIZON_Y - Math.random() * 50,
        width: 100 + Math.random() * 150,
        height: 50 + Math.random() * 70
    };
}

function createTree() {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const x = side === 'left' ? 
              Math.random() * ROAD_EDGE : 
              ROAD_EDGE + ROAD_WIDTH + Math.random() * (canvas.width - ROAD_EDGE - ROAD_WIDTH);
    
    return {
        x: x,
        y: canvas.height,
        width: 20,
        height: 40,
        side: side
    };
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare l'auto:

```javascript
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') player.isMovingLeft = true;
    if (e.key === 'ArrowRight') player.isMovingRight = true;
    if (e.key === 'ArrowUp') player.isAccelerating = true;
    if (e.key === 'ArrowDown') player.isBraking = true;
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowLeft') player.isMovingLeft = false;
    if (e.key === 'ArrowRight') player.isMovingRight = false;
    if (e.key === 'ArrowUp') player.isAccelerating = false;
    if (e.key === 'ArrowDown') player.isBraking = false;
});
```

### Loop di Gioco

Il loop principale del gioco gestisce l'aggiornamento degli oggetti, il rilevamento delle collisioni e il rendering:

```javascript
function gameLoop() {
    if (!gameRunning) return;
    
    // Cancella il canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Aggiorna il tempo di gioco e le condizioni atmosferiche
    updateTimeOfDay();
    
    // Disegna lo sfondo in base al tempo di giorno
    drawBackground();
    
    // Aggiorna e disegna le montagne
    updateMountains();
    
    // Aggiorna e disegna la strada
    drawRoad();
    
    // Aggiorna e disegna gli alberi
    updateTrees();
    
    // Aggiorna la velocità del giocatore
    updatePlayerSpeed();
    
    // Aggiorna la posizione del giocatore
    updatePlayerPosition();
    
    // Genera nuove auto nemiche
    if (Math.random() < 0.02 * (1 + day * 0.1) && enemyCars.length < 10) {
        enemyCars.push(createEnemyCar());
    }
    
    // Aggiorna e disegna le auto nemiche
    updateEnemyCars();
    
    // Disegna l'auto del giocatore
    drawPlayer();
    
    // Aggiorna e disegna l'interfaccia utente
    updateUI();
    
    // Controlla se il giocatore ha completato il giorno
    checkDayComplete();
    
    // Continua il loop di gioco
    requestAnimationFrame(gameLoop);
}
```

### Ciclo Giorno/Notte e Condizioni Meteorologiche

Il gioco implementa un ciclo giorno/notte che influenza l'aspetto visivo:

```javascript
function updateTimeOfDay() {
    timeCounter++;
    
    // Cambia il tempo di giorno ogni 1000 frame
    if (timeCounter >= 1000) {
        timeCounter = 0;
        timeOfDay = (timeOfDay + 1) % 4; // Cicla tra alba, giorno, tramonto, notte
    }
}

function drawBackground() {
    // Colori del cielo in base al tempo di giorno
    let skyColor;
    switch (timeOfDay) {
        case 0: // Alba
            skyColor = '#FF7F50';
            break;
        case 1: // Giorno
            skyColor = '#87CEEB';
            break;
        case 2: // Tramonto
            skyColor = '#FF4500';
            break;
        case 3: // Notte
            skyColor = '#000033';
            break;
    }
    
    // Disegna il cielo
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, canvas.width, HORIZON_Y);
    
    // Disegna il terreno
    ctx.fillStyle = COLORS.grass;
    ctx.fillRect(0, HORIZON_Y, canvas.width, canvas.height - HORIZON_Y);
    
    // Aggiungi effetto nebbia o neve in base al giorno
    if (day > 3) {
        drawWeatherEffect();
    }
}

function drawWeatherEffect() {
    // Nebbia o neve in base al giorno
    if (day % 2 === 0) {
        // Nebbia
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        // Neve
        ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 2 + 1,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
}
```

### Rilevamento delle Collisioni

Il gioco implementa funzioni per rilevare le collisioni tra l'auto del giocatore e le auto nemiche:

```javascript
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function updateEnemyCars() {
    for (let i = enemyCars.length - 1; i >= 0; i--) {
        const car = enemyCars[i];
        
        // Muovi l'auto nemica in base alla velocità del giocatore
        car.y += speed + car.speed;
        
        // Rimuovi le auto fuori dallo schermo
        if (car.y > canvas.height) {
            enemyCars.splice(i, 1);
            carsPassed++;
            score += 10;
            continue;
        }
        
        // Controlla collisione con il giocatore
        if (checkCollision(player, car)) {
            lives--;
            
            if (lives <= 0) {
                gameOver();
                return;
            } else {
                // Rimuovi l'auto con cui si è colliso
                enemyCars.splice(i, 1);
                // Rallenta il giocatore
                speed = Math.max(0, speed - 3);
            }
        }
        
        // Disegna l'auto nemica
        drawCar(car);
    }
}
```

### Effetto Prospettiva

Il gioco crea un effetto di prospettiva per simulare una visuale 3D:

```javascript
function drawRoad() {
    // Disegna la strada principale
    ctx.fillStyle = COLORS.road;
    
    // Crea un effetto prospettico con un trapezio
    ctx.beginPath();
    ctx.moveTo(ROAD_EDGE, HORIZON_Y);
    ctx.lineTo(ROAD_EDGE + ROAD_WIDTH, HORIZON_Y);
    ctx.lineTo(canvas.width - 50, canvas.height);
    ctx.lineTo(50, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Disegna le linee della strada
    drawRoadLines();
}

function drawRoadLines() {
    ctx.strokeStyle = COLORS.roadLine;
    ctx.lineWidth = 5;
    
    // Linea centrale
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, HORIZON_Y);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Linee laterali
    const leftLaneX = ROAD_EDGE + ROAD_WIDTH / 3;
    const rightLaneX = ROAD_EDGE + (ROAD_WIDTH / 3) * 2;
    
    // Effetto prospettico per le linee laterali
    ctx.beginPath();
    ctx.moveTo(leftLaneX, HORIZON_Y);
    ctx.lineTo(canvas.width / 4, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(rightLaneX, HORIZON_Y);
    ctx.lineTo((canvas.width / 4) * 3, canvas.height);
    ctx.stroke();
}
```

## Concetti di Programmazione Utilizzati

1. **Gestione degli eventi**: Rilevamento degli input da tastiera per controllare l'auto.
2. **Animazione con Canvas**: Utilizzo di requestAnimationFrame per creare un ciclo di gioco fluido.
3. **Fisica di base**: Implementazione di accelerazione e decelerazione per l'auto.
4. **Rilevamento delle collisioni**: Algoritmi per rilevare quando le auto collidono.
5. **Effetti visivi**: Implementazione di ciclo giorno/notte e condizioni meteorologiche.
6. **Prospettiva pseudo-3D**: Tecniche per creare un effetto di profondità su un canvas 2D.
7. **Gestione dello stato di gioco**: Transizioni tra stati diversi (inizio, gioco, completamento livello, game over).

## Estensioni Possibili

1. **Modalità carriera**: Implementare una modalità con progressione a lungo termine.
2. **Personalizzazione dell'auto**: Permettere ai giocatori di personalizzare l'aspetto o le prestazioni della loro auto.
3. **Effetti sonori**: Integrare suoni per il motore, le collisioni e le condizioni atmosferiche.
4. **Tracciati diversi**: Aggiungere diversi tipi di percorsi con caratteristiche uniche.
5. **Power-up**: Implementare oggetti che forniscono vantaggi temporanei (turbo, invincibilità).
6. **Sistema di danni**: Aggiungere un sistema che tiene traccia dei danni all'auto del giocatore.
7. **Modalità multiplayer**: Permettere a due giocatori di competere sullo stesso schermo o online.

Questa implementazione di Enduro in JavaScript ricrea l'esperienza del gioco classico, offrendo un'esperienza di guida coinvolgente che combina riflessi rapidi, strategia e resistenza mentre il giocatore affronta le sfide di una gara di endurance attraverso diversi giorni e condizioni atmosferiche.