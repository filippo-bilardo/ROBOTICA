# Guida al Gioco Time Pilot

## Introduzione
Time Pilot è un innovativo gioco arcade sviluppato da Konami e pubblicato nel 1982. Creato dal designer Yoshiki Okamoto (lo stesso di Gyruss), Time Pilot introduce un concetto unico: un viaggio attraverso diverse epoche storiche dell'aviazione. Il giocatore controlla un aereo moderno che viaggia indietro nel tempo, affrontando velivoli di diverse ere storiche. Il gioco è stato rivoluzionario per il suo tempo grazie allo scorrimento multidirezionale a 360 gradi, che permetteva al giocatore di muoversi liberamente in tutte le direzioni mentre lo scenario scorreva attorno a lui. Questo approccio ha creato un'esperienza di volo aperta e dinamica che ha influenzato molti giochi successivi.

![Schermata principale di Time Pilot](img/16_time_pilot.jpg)

*Immagine: Schermata classica del gioco Time Pilot con l'aereo del giocatore al centro e nemici che arrivano da tutte le direzioni.*

## Come si Gioca
- Controlla il tuo aereo che si muove liberamente in tutte le direzioni
- Usa i tasti WASD o le frecce direzionali per muoverti
- Premi Spazio per sparare ai nemici
- Affronta ondate di nemici di diverse epoche storiche
- Sconfiggi il boss di ogni era per avanzare alla prossima epoca
- Evita i colpi nemici e le collisioni con gli altri velivoli

## Caratteristiche Principali
- Scorrimento a 360 gradi con il giocatore sempre al centro dello schermo
- Progressione attraverso cinque diverse epoche storiche dell'aviazione
- Nemici con comportamenti e pattern di attacco diversi in base all'epoca
- Boss di fine livello unici per ogni era storica
- Mini-mappa per visualizzare la posizione dei nemici fuori dallo schermo
- Sistema di punteggio basato sui nemici abbattuti e bonus per formazioni complete
- Controlli fluidi che permettono movimenti in tutte le direzioni

## Implementazione in JavaScript

La versione HTML/JavaScript di Time Pilot ricrea l'esperienza del gioco originale. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas e Elementi di Gioco

```javascript
// Configurazione del gioco
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const scoreDisplay = document.getElementById('score-display');
const livesDisplay = document.getElementById('lives-display');
const timePeriodDisplay = document.getElementById('time-period');
const gameOverDisplay = document.getElementById('game-over');
const miniMap = document.getElementById('mini-map');

// Variabili di gioco
let gameRunning = false;
let score = 0;
let lives = 3;
let timePeriod = 1940;
let player;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let clouds = [];
let bossFight = false;
let boss = null;
let gameLoop;
```

### Oggetti di Gioco

Il gioco definisce diversi oggetti principali:

1. **L'aereo del giocatore**: L'oggetto controllato dal giocatore che si muove liberamente in tutte le direzioni.

```javascript
function initializePlayer() {
    player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 40,
        height: 40,
        speed: 5,
        direction: 0, // 0 = right, 1 = up, 2 = left, 3 = down
        isMovingUp: false,
        isMovingDown: false,
        isMovingLeft: false,
        isMovingRight: false,
        isShooting: false,
        lastShootTime: 0,
        invulnerable: false,
        invulnerableTimer: 0
    };
}
```

2. **Nemici**: Aerei nemici che appaiono da fuori lo schermo e attaccano il giocatore.

```javascript
function createEnemy() {
    // Determina da quale lato dello schermo apparirà il nemico
    const side = Math.floor(Math.random() * 4); // 0 = top, 1 = right, 2 = bottom, 3 = left
    let x, y, direction;
    
    switch(side) {
        case 0: // top
            x = Math.random() * canvas.width;
            y = -50;
            direction = Math.random() > 0.5 ? 2 : 3; // down-left or down-right
            break;
        case 1: // right
            x = canvas.width + 50;
            y = Math.random() * canvas.height;
            direction = Math.random() > 0.5 ? 0 : 3; // down-left or up-left
            break;
        case 2: // bottom
            x = Math.random() * canvas.width;
            y = canvas.height + 50;
            direction = Math.random() > 0.5 ? 0 : 1; // up-left or up-right
            break;
        case 3: // left
            x = -50;
            y = Math.random() * canvas.height;
            direction = Math.random() > 0.5 ? 1 : 2; // up-right or down-right
            break;
    }
    
    // Crea il nemico in base all'epoca corrente
    const enemy = {
        x: x,
        y: y,
        width: 35,
        height: 35,
        speed: 2 + Math.random() * 2,
        direction: direction,
        type: getEnemyTypeForTimePeriod(),
        health: 1,
        shootTimer: Math.random() * 100,
        shootInterval: 100 + Math.random() * 50
    };
    
    return enemy;
}
```

3. **Boss**: Nemici speciali che appaiono alla fine di ogni epoca.

```javascript
function createBoss() {
    const boss = {
        x: canvas.width + 100,
        y: canvas.height / 2,
        width: 80,
        height: 80,
        speed: 2,
        direction: 2, // inizia muovendosi verso sinistra
        type: getBossTypeForTimePeriod(),
        health: 10,
        maxHealth: 10,
        shootTimer: 0,
        shootInterval: 60,
        pattern: 0,
        patternTimer: 0
    };
    
    return boss;
}
```

4. **Proiettili**: Sparati dal giocatore e dai nemici.

```javascript
function createBullet(x, y, direction, isEnemy = false) {
    const speed = isEnemy ? 5 : 8;
    const size = isEnemy ? 5 : 8;
    
    return {
        x: x,
        y: y,
        width: size,
        height: size,
        speed: speed,
        direction: direction,
        isEnemy: isEnemy
    };
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare l'aereo del giocatore:

```javascript
document.addEventListener('keydown', function(e) {
    if (e.key === 'w' || e.key === 'ArrowUp') {
        player.isMovingUp = true;
        player.direction = 1;
    }
    if (e.key === 's' || e.key === 'ArrowDown') {
        player.isMovingDown = true;
        player.direction = 3;
    }
    if (e.key === 'a' || e.key === 'ArrowLeft') {
        player.isMovingLeft = true;
        player.direction = 2;
    }
    if (e.key === 'd' || e.key === 'ArrowRight') {
        player.isMovingRight = true;
        player.direction = 0;
    }
    if (e.key === ' ') {
        player.isShooting = true;
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'w' || e.key === 'ArrowUp') player.isMovingUp = false;
    if (e.key === 's' || e.key === 'ArrowDown') player.isMovingDown = false;
    if (e.key === 'a' || e.key === 'ArrowLeft') player.isMovingLeft = false;
    if (e.key === 'd' || e.key === 'ArrowRight') player.isMovingRight = false;
    if (e.key === ' ') player.isShooting = false;
});
```

### Loop di Gioco

Il loop principale del gioco gestisce l'aggiornamento degli oggetti, lo scorrimento dello scenario, il rilevamento delle collisioni e il rendering:

```javascript
function gameLoop() {
    if (!gameRunning) return;
    
    // Cancella il canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Aggiorna e disegna le nuvole (sfondo)
    updateClouds();
    
    // Aggiorna la posizione del giocatore
    updatePlayer();
    
    // Gestisci i proiettili del giocatore
    updateBullets();
    
    // Gestisci i proiettili nemici
    updateEnemyBullets();
    
    // Gestisci i nemici
    if (!bossFight) {
        // Genera nuovi nemici se necessario
        if (enemies.length < 5 + Math.floor(score / 1000)) {
            enemies.push(createEnemy());
        }
        
        // Controlla se è ora di affrontare il boss
        if (score > 0 && score % 5000 === 0 && !boss) {
            startBossFight();
        }
        
        updateEnemies();
    } else {
        // Gestisci il boss
        updateBoss();
    }
    
    // Disegna il giocatore
    drawPlayer();
    
    // Aggiorna l'interfaccia utente
    updateUI();
    
    // Aggiorna la mini-mappa
    updateMiniMap();
    
    // Continua il loop di gioco
    requestAnimationFrame(gameLoop);
}
```

### Sistema di Epoche Storiche

Il gioco implementa diverse epoche storiche con nemici e ambientazioni specifiche:

```javascript
function getEnemyTypeForTimePeriod() {
    switch(timePeriod) {
        case 1940: // Seconda Guerra Mondiale
            return 'ww2Plane';
        case 1910: // Prima Guerra Mondiale
            return 'ww1Plane';
        case 1880: // Era dei palloni aerostatici
            return 'balloon';
        case 1500: // Era medievale (fantasia)
            return 'dragon';
        case 2001: // Futuro
            return 'ufo';
        default:
            return 'ww2Plane';
    }
}

function advanceToNextTimePeriod() {
    // Avanza all'epoca successiva
    switch(timePeriod) {
        case 1940:
            timePeriod = 1910;
            break;
        case 1910:
            timePeriod = 1880;
            break;
        case 1880:
            timePeriod = 1500;
            break;
        case 1500:
            timePeriod = 2001;
            break;
        case 2001:
            // Hai completato tutte le epoche, ricomincia
            timePeriod = 1940;
            break;
    }
    
    // Aggiorna il display dell'epoca
    timePeriodDisplay.textContent = `Era: ${timePeriod}`;
    
    // Bonus per aver completato l'epoca
    score += 10000;
    updateScore();
}
```

### Mini-Mappa

Il gioco include una mini-mappa per visualizzare la posizione dei nemici fuori dallo schermo:

```javascript
function updateMiniMap() {
    const miniMapCtx = miniMap.getContext('2d');
    const miniMapRadius = miniMap.width / 2;
    const miniMapCenter = miniMapRadius;
    const scale = 0.1; // Scala per la mini-mappa
    
    // Pulisci la mini-mappa
    miniMapCtx.clearRect(0, 0, miniMap.width, miniMap.height);
    
    // Disegna il bordo circolare
    miniMapCtx.strokeStyle = '#444';
    miniMapCtx.lineWidth = 1;
    miniMapCtx.beginPath();
    miniMapCtx.arc(miniMapCenter, miniMapCenter, miniMapRadius - 1, 0, Math.PI * 2);
    miniMapCtx.stroke();
    
    // Disegna il giocatore al centro
    miniMapCtx.fillStyle = '#00FF00';
    miniMapCtx.beginPath();
    miniMapCtx.arc(miniMapCenter, miniMapCenter, 3, 0, Math.PI * 2);
    miniMapCtx.fill();
    
    // Disegna i nemici
    miniMapCtx.fillStyle = '#FF0000';
    for (const enemy of enemies) {
        // Calcola la posizione relativa al giocatore
        const relX = (enemy.x - player.x) * scale + miniMapCenter;
        const relY = (enemy.y - player.y) * scale + miniMapCenter;
        
        // Verifica se il nemico è all'interno della mini-mappa
        const distance = Math.sqrt(Math.pow(relX - miniMapCenter, 2) + Math.pow(relY - miniMapCenter, 2));
        if (distance < miniMapRadius) {
            miniMapCtx.beginPath();
            miniMapCtx.arc(relX, relY, 2, 0, Math.PI * 2);
            miniMapCtx.fill();
        } else {
            // Se il nemico è fuori dalla mini-mappa, disegna un punto sul bordo
            const angle = Math.atan2(relY - miniMapCenter, relX - miniMapCenter);
            const borderX = miniMapCenter + Math.cos(angle) * (miniMapRadius - 3);
            const borderY = miniMapCenter + Math.sin(angle) * (miniMapRadius - 3);
            
            miniMapCtx.beginPath();
            miniMapCtx.arc(borderX, borderY, 2, 0, Math.PI * 2);
            miniMapCtx.fill();
        }
    }
    
    // Disegna il boss se presente
    if (boss) {
        miniMapCtx.fillStyle = '#FF00FF';
        const relX = (boss.x - player.x) * scale + miniMapCenter;
        const relY = (boss.y - player.y) * scale + miniMapCenter;
        
        const distance = Math.sqrt(Math.pow(relX - miniMapCenter, 2) + Math.pow(relY - miniMapCenter, 2));
        if (distance < miniMapRadius) {
            miniMapCtx.beginPath();
            miniMapCtx.arc(relX, relY, 4, 0, Math.PI * 2);
            miniMapCtx.fill();
        } else {
            const angle = Math.atan2(relY - miniMapCenter, relX - miniMapCenter);
            const borderX = miniMapCenter + Math.cos(angle) * (miniMapRadius - 5);
            const borderY = miniMapCenter + Math.sin(angle) * (miniMapRadius - 5);
            
            miniMapCtx.beginPath();
            miniMapCtx.arc(borderX, borderY, 4, 0, Math.PI * 2);
            miniMapCtx.fill();
        }
    }
}
```

## Concetti di Programmazione Utilizzati

1. **Scorrimento multidirezionale**: Implementazione di un sistema dove il giocatore rimane al centro e lo scenario scorre attorno a lui.
2. **Gestione degli eventi**: Rilevamento degli input da tastiera per controllare l'aereo del giocatore.
3. **Animazione con Canvas**: Utilizzo di requestAnimationFrame per creare un ciclo di gioco fluido.
4. **Rilevamento delle collisioni**: Algoritmi per rilevare quando gli oggetti collidono.
5. **Intelligenza artificiale semplice**: Comportamenti diversi per i nemici in base al tipo e all'epoca.
6. **Pattern di movimento**: Implementazione di pattern di movimento complessi per i boss.
7. **Mini-mappa**: Visualizzazione in scala ridotta dell'area di gioco per mostrare elementi fuori dallo schermo.
8. **Gestione dello stato di gioco**: Transizioni tra stati diversi (inizio, gioco, boss, game over).
9. **Progressione attraverso epoche**: Sistema per avanzare attraverso diverse ere storiche con nemici e ambientazioni uniche.

## Estensioni Possibili

1. **Potenziamenti**: Aggiungere power-up che migliorano le capacità dell'aereo (sparo triplo, scudo, velocità aumentata).
2. **Nemici più complessi**: Implementare nemici con comportamenti più sofisticati e formazioni coordinate.
3. **Boss più elaborati**: Creare boss con pattern di attacco più complessi e fasi multiple.
4. **Effetti sonori e musica**: Integrare suoni per le azioni di gioco e musica di sottofondo appropriata per ogni epoca.
5. **Modalità cooperativa**: Permettere a due giocatori di controllare aerei diversi contemporaneamente.
6. **Sistema di achievement**: Aggiungere obiettivi speciali per sbloccare bonus o caratteristiche aggiuntive.
7. **Effetti visivi migliorati**: Implementare esplosioni, scie di particelle e altri effetti visivi per arricchire l'esperienza.
8. **Modalità storia**: Aggiungere una narrazione che collega le diverse epoche storiche.

Questa implementazione di Time Pilot in JavaScript ricrea l'esperienza del gioco arcade classico, offrendo un'esperienza di gioco coinvolgente che combina azione rapida e precisione mentre il giocatore viaggia attraverso diverse epoche storiche dell'aviazione.