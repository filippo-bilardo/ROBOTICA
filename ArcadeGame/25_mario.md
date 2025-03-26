# Guida al Gioco Super Mario

## Introduzione
Super Mario è una delle serie di videogiochi più iconiche e influenti della storia, creata da Shigeru Miyamoto e pubblicata da Nintendo a partire dal 1985 con "Super Mario Bros." per il Nintendo Entertainment System (NES). Il gioco ha definito il genere dei platform a scorrimento laterale e ha introdotto al mondo il personaggio di Mario, un idraulico italiano che è diventato la mascotte ufficiale di Nintendo. Super Mario combina un gameplay accessibile con una profondità sorprendente, offrendo sfide progressive che richiedono tempismo preciso, abilità di salto e strategia. La formula di base - correre, saltare, raccogliere monete e power-up mentre si evitano nemici e ostacoli per raggiungere la fine del livello - è rimasta il cuore della serie per decenni, pur evolvendosi costantemente con nuove meccaniche e innovazioni tecnologiche.

![Schermata principale di Super Mario](img/25_mario.jpg)

*Immagine: Schermata classica del gioco Super Mario con Mario che affronta nemici e ostacoli.*

## Come si Gioca
- Controlla Mario che si muove in un mondo a scorrimento laterale
- Usa le frecce direzionali per muoverti a sinistra e a destra
- Premi Spazio per saltare (tieni premuto per saltare più in alto)
- Salta sopra i nemici per sconfiggerli
- Raccogli monete per aumentare il punteggio
- Colpisci i blocchi per rivelare monete o power-up
- Raggiungi la bandiera alla fine del livello per completarlo
- Evita di cadere nei buchi o di essere colpito dai nemici

## Caratteristiche Principali
- Scorrimento laterale fluido con controlli reattivi
- Fisica realistica con gravità e inerzia
- Varietà di nemici con comportamenti diversi
- Sistema di power-up che trasforma Mario e gli conferisce abilità speciali
- Livelli con piattaforme, tubi, scale e ostacoli vari
- Monete e oggetti collezionabili per aumentare il punteggio
- Sistema di vite e checkpoint
- Progressione attraverso livelli di difficoltà crescente

## Implementazione in JavaScript

La versione HTML/JavaScript di Super Mario ricrea l'esperienza del gioco originale. Ecco una spiegazione delle principali componenti del codice:

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
const GRAVITY = 0.5;
const JUMP_POWER = 15;
const PLAYER_SPEED = 5;
const GROUND_HEIGHT = 80;
const PLATFORM_HEIGHT = 40;
const BLOCK_SIZE = 40;
const ENEMY_SPEED = 2;
const COIN_VALUE = 100;
```

### Oggetti di Gioco

Il gioco definisce diversi oggetti principali:

1. **Mario**: Il personaggio controllato dal giocatore.

```javascript
// Oggetti di gioco
let player = {
    x: 100,
    y: 0,
    width: 30,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    isMovingLeft: false,
    isMovingRight: false,
    facingRight: true,
    isOnGround: false
};
```

2. **Piattaforme e Blocchi**: Elementi del livello su cui Mario può camminare o saltare.

```javascript
function createLevel(level) {
    // Resetta gli array degli oggetti di gioco
    platforms = [];
    blocks = [];
    bricks = [];
    pipes = [];
    enemies = [];
    coins = [];
    flag = null;
    
    // Crea il terreno
    platforms.push({
        x: 0,
        y: canvas.height - GROUND_HEIGHT,
        width: canvas.width * 3,
        height: GROUND_HEIGHT
    });
    
    // Imposta il limite di scorrimento
    maxScrollX = canvas.width * 2;
    
    // Crea livelli diversi in base al numero del livello
    switch(level) {
        case 1:
            createLevel1();
            break;
        case 2:
            createLevel2();
            break;
        case 3:
            createLevel3();
            break;
        default:
            createLevel1();
    }
}

function createLevel1() {
    // Aggiungi blocchi
    for (let i = 0; i < 5; i++) {
        blocks.push({
            x: 300 + i * 200,
            y: canvas.height - GROUND_HEIGHT - 150,
            width: BLOCK_SIZE,
            height: BLOCK_SIZE,
            type: 'question',
            hit: false,
            content: i % 2 === 0 ? 'coin' : 'none'
        });
    }
    
    // Aggiungi mattoni
    for (let i = 0; i < 8; i++) {
        bricks.push({
            x: 400 + i * 50,
            y: canvas.height - GROUND_HEIGHT - 200,
            width: BLOCK_SIZE,
            height: BLOCK_SIZE,
            broken: false
        });
    }
    
    // Aggiungi tubi
    pipes.push({
        x: 600,
        y: canvas.height - GROUND_HEIGHT - 80,
        width: 60,
        height: 80
    });
    
    pipes.push({
        x: 1000,
        y: canvas.height - GROUND_HEIGHT - 120,
        width: 60,
        height: 120
    });
    
    // Aggiungi nemici
    enemies.push({
        x: 500,
        y: canvas.height - GROUND_HEIGHT - 30,
        width: 30,
        height: 30,
        velocityX: -ENEMY_SPEED,
        type: 'goomba'
    });
    
    enemies.push({
        x: 800,
        y: canvas.height - GROUND_HEIGHT - 30,
        width: 30,
        height: 30,
        velocityX: -ENEMY_SPEED,
        type: 'goomba'
    });
    
    // Aggiungi monete
    for (let i = 0; i < 10; i++) {
        coins.push({
            x: 350 + i * 70,
            y: canvas.height - GROUND_HEIGHT - 100,
            width: 20,
            height: 20,
            collected: false
        });
    }
    
    // Aggiungi la bandiera di fine livello
    flag = {
        x: canvas.width * 2.5,
        y: canvas.height - GROUND_HEIGHT - 300,
        width: 10,
        height: 300,
        reached: false
    };
}
```

3. **Nemici**: Creature che Mario deve evitare o sconfiggere.

```javascript
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Muovi il nemico
        enemy.x += enemy.velocityX;
        
        // Controlla collisione con le piattaforme (per evitare che cadano)
        let onGround = false;
        for (const platform of platforms) {
            if (
                enemy.x + enemy.width > platform.x &&
                enemy.x < platform.x + platform.width &&
                enemy.y + enemy.height >= platform.y &&
                enemy.y + enemy.height <= platform.y + 10
            ) {
                onGround = true;
                break;
            }
        }
        
        // Cambia direzione se il nemico raggiunge il bordo di una piattaforma
        if (!onGround) {
            enemy.velocityX = -enemy.velocityX;
            enemy.x += enemy.velocityX * 2; // Sposta il nemico lontano dal bordo
        }
        
        // Cambia direzione se il nemico colpisce un tubo
        for (const pipe of pipes) {
            if (
                enemy.x + enemy.width > pipe.x &&
                enemy.x < pipe.x + pipe.width &&
                enemy.y + enemy.height > pipe.y
            ) {
                enemy.velocityX = -enemy.velocityX;
                enemy.x += enemy.velocityX * 2; // Sposta il nemico lontano dal tubo
                break;
            }
        }
        
        // Controlla collisione con il giocatore
        if (
            player.x + player.width > enemy.x &&
            player.x < enemy.x + enemy.width &&
            player.y + player.height > enemy.y &&
            player.y < enemy.y + enemy.height
        ) {
            // Se il giocatore sta cadendo e colpisce il nemico dall'alto
            if (player.velocityY > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
                // Elimina il nemico
                enemies.splice(i, 1);
                
                // Fai rimbalzare il giocatore
                player.velocityY = -JUMP_POWER / 2;
                
                // Aggiungi punti
                score += 200;
            } else {
                // Il giocatore è stato colpito dal nemico
                lives--;
                
                if (lives <= 0) {
                    gameOver();
                } else {
                    resetPlayerPosition();
                }
            }
        }
        
        // Disegna il nemico
        ctx.fillStyle = COLORS.enemy;
        ctx.fillRect(enemy.x - scrollX, enemy.y, enemy.width, enemy.height);
    }
}
```

4. **Monete e Power-up**: Oggetti che Mario può raccogliere per ottenere punti o abilità speciali.

```javascript
function updateCoins() {
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        
        if (!coin.collected) {
            // Controlla collisione con il giocatore
            if (
                player.x + player.width > coin.x &&
                player.x < coin.x + coin.width &&
                player.y + player.height > coin.y &&
                player.y < coin.y + coin.height
            ) {
                // Raccogli la moneta
                coin.collected = true;
                score += COIN_VALUE;
                // Riproduci suono moneta
            }
            
            // Disegna la moneta
            ctx.fillStyle = COLORS.coin;
            ctx.beginPath();
            ctx.arc(
                coin.x + coin.width / 2 - scrollX,
                coin.y + coin.height / 2,
                coin.width / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare Mario:

```javascript
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') player.isMovingLeft = true;
    if (e.key === 'ArrowRight') player.isMovingRight = true;
    if (e.key === ' ' && player.isOnGround) jump();
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowLeft') player.isMovingLeft = false;
    if (e.key === 'ArrowRight') player.isMovingRight = false;
});

function jump() {
    player.velocityY = -JUMP_POWER;
    player.isJumping = true;
    player.isOnGround = false;
}
```

### Fisica e Collisioni

Il gioco implementa un sistema di fisica per gestire il movimento di Mario e le collisioni con gli elementi del livello:

```javascript
function updatePlayer() {
    // Aggiorna la velocità orizzontale in base agli input
    if (player.isMovingLeft) {
        player.velocityX = -PLAYER_SPEED;
        player.facingRight = false;
    } else if (player.isMovingRight) {
        player.velocityX = PLAYER_SPEED;
        player.facingRight = true;
    } else {
        player.velocityX = 0;
    }
    
    // Applica la gravità
    player.velocityY += GRAVITY;
    
    // Aggiorna la posizione
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Controlla collisione con il terreno e le piattaforme
    player.isOnGround = false;
    for (const platform of platforms) {
        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height >= platform.y &&
            player.y +