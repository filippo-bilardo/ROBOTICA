# Guida al Gioco Seaquest

## Introduzione
Seaquest è un classico gioco arcade sviluppato da Activision nel 1983 per l'Atari 2600. Creato dal leggendario designer David Crane, il gioco mette il giocatore al comando di un sottomarino che deve navigare nelle profondità dell'oceano. Il giocatore deve salvare subacquei, evitare o distruggere nemici marini come squali e sottomarini nemici, e tornare regolarmente in superficie per rifornirsi di ossigeno. Seaquest è stato uno dei primi giochi a combinare elementi di azione, gestione delle risorse e salvataggio in un'unica esperienza di gioco.

![Schermata principale di Seaquest](img/28_seaquest.jpg)

*Immagine: Schermata classica del gioco Seaquest con il sottomarino e l'ambiente sottomarino.*

## Come si Gioca
- Pilota il tuo sottomarino nelle profondità dell'oceano
- Usa le frecce direzionali per muoverti in tutte le direzioni
- Premi Spazio per sparare ai nemici marini (squali e sottomarini nemici)
- Raccogli i subacquei per portarli in salvo (massimo 6 alla volta)
- Torna in superficie quando l'ossigeno sta per esaurirsi o quando il sottomarino è pieno di subacquei
- Evita di collidere con i nemici o di rimanere senza ossigeno

## Caratteristiche Principali
- Ambiente sottomarino ricco di dettagli con diversi tipi di nemici
- Sistema di ossigeno che richiede visite regolari in superficie
- Meccanica di salvataggio dei subacquei che aggiunge profondità strategica
- Difficoltà progressiva con l'avanzare dei livelli
- Sistema di punteggio basato sui nemici eliminati e sui subacquei salvati
- Controlli fluidi che permettono movimenti in tutte le direzioni

## Implementazione in JavaScript

La versione HTML/JavaScript di Seaquest ricrea l'esperienza del gioco originale. Ecco una spiegazione delle principali componenti del codice:

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
const SUBMARINE_WIDTH = 60;
const SUBMARINE_HEIGHT = 30;
const SUBMARINE_SPEED = 5;
const BULLET_SPEED = 8;
const ENEMY_SPEED = 3;
const DIVER_SPEED = 1;
const OXYGEN_DECREASE_RATE = 0.2;
const OXYGEN_MAX = 100;
const SURFACE_LEVEL = 100;
```

### Oggetti di Gioco

Il gioco definisce diversi oggetti principali:

1. **Il sottomarino**: L'oggetto controllato dal giocatore.

```javascript
let submarine = {
    x: canvas.width / 2 - SUBMARINE_WIDTH / 2,
    y: canvas.height / 2,
    width: SUBMARINE_WIDTH,
    height: SUBMARINE_HEIGHT,
    speed: SUBMARINE_SPEED,
    direction: 'right',
    isMovingUp: false,
    isMovingDown: false,
    isMovingLeft: false,
    isMovingRight: false,
    isShooting: false,
    lastShootTime: 0
};
```

2. **Nemici marini**: Squali e sottomarini nemici che il giocatore deve evitare o distruggere.

```javascript
function createEnemy() {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const y = SURFACE_LEVEL + 50 + Math.random() * (canvas.height - SURFACE_LEVEL - 100);
    const type = Math.random() > 0.3 ? 'shark' : 'enemySubmarine';
    
    return {
        x: side === 'left' ? -50 : canvas.width + 50,
        y: y,
        width: 50,
        height: 25,
        speed: ENEMY_SPEED * (1 + level * 0.1),
        direction: side,
        type: type,
        color: COLORS.enemy[Math.floor(Math.random() * COLORS.enemy.length)]
    };
}
```

3. **Subacquei**: Personaggi che il giocatore deve salvare.

```javascript
function createDiver() {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const y = SURFACE_LEVEL + 100 + Math.random() * (canvas.height - SURFACE_LEVEL - 150);
    
    return {
        x: side === 'left' ? -20 : canvas.width + 20,
        y: y,
        width: 20,
        height: 30,
        speed: DIVER_SPEED,
        direction: side
    };
}
```

4. **Proiettili**: Sparati dal sottomarino per eliminare i nemici.

```javascript
function createBullet() {
    const bulletX = submarine.direction === 'right' ? 
                   submarine.x + submarine.width : 
                   submarine.x;
    
    return {
        x: bulletX,
        y: submarine.y + submarine.height / 2,
        width: 10,
        height: 4,
        speed: BULLET_SPEED,
        direction: submarine.direction
    };
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare il sottomarino:

```javascript
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp') submarine.isMovingUp = true;
    if (e.key === 'ArrowDown') submarine.isMovingDown = true;
    if (e.key === 'ArrowLeft') {
        submarine.isMovingLeft = true;
        submarine.direction = 'left';
    }
    if (e.key === 'ArrowRight') {
        submarine.isMovingRight = true;
        submarine.direction = 'right';
    }
    if (e.key === ' ' && Date.now() - submarine.lastShootTime > 300) {
        submarine.isShooting = true;
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowUp') submarine.isMovingUp = false;
    if (e.key === 'ArrowDown') submarine.isMovingDown = false;
    if (e.key === 'ArrowLeft') submarine.isMovingLeft = false;
    if (e.key === 'ArrowRight') submarine.isMovingRight = false;
    if (e.key === ' ') submarine.isShooting = false;
});
```

### Loop di Gioco

Il loop principale del gioco gestisce l'aggiornamento degli oggetti, il rilevamento delle collisioni e il rendering:

```javascript
function gameLoop() {
    if (!gameRunning) return;
    
    // Cancella il canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Disegna lo sfondo
    drawBackground();
    
    // Aggiorna e disegna le bolle
    updateBubbles();
    
    // Aggiorna la posizione del sottomarino
    updateSubmarine();
    
    // Aggiorna l'ossigeno
    updateOxygen();
    
    // Genera nuovi nemici
    if (Math.random() < 0.01 * (1 + level * 0.1) && enemies.length < 5 + level) {
        enemies.push(createEnemy());
    }
    
    // Genera nuovi subacquei
    if (Math.random() < 0.005 && divers.length < 3 + level) {
        divers.push(createDiver());
    }
    
    // Aggiorna e disegna i nemici
    updateEnemies();
    
    // Aggiorna e disegna i subacquei
    updateDivers();
    
    // Aggiorna e disegna i proiettili
    updateBullets();
    
    // Aggiorna e disegna le esplosioni
    updateExplosions();
    
    // Disegna il sottomarino
    drawSubmarine();
    
    // Aggiorna e disegna l'interfaccia utente
    updateUI();
    
    // Controlla se il livello è completato
    checkLevelComplete();
    
    // Continua il loop di gioco
    requestAnimationFrame(gameLoop);
}
```

### Sistema di Ossigeno

Il gioco implementa un sistema di ossigeno che richiede al giocatore di tornare in superficie regolarmente:

```javascript
function updateOxygen() {
    // Diminuisci l'ossigeno se il sottomarino è sott'acqua
    if (submarine.y > SURFACE_LEVEL) {
        oxygen -= OXYGEN_DECREASE_RATE * (1 + submarineCapacity * 0.1);
    } else {
        // Ricarica l'ossigeno quando il sottomarino è in superficie
        oxygen = OXYGEN_MAX;
        
        // Scarica i subacquei salvati quando in superficie
        if (submarineCapacity > 0) {
            diversRescued += submarineCapacity;
            score += submarineCapacity * 100;
            submarineCapacity = 0;
        }
    }
    
    // Game over se l'ossigeno finisce
    if (oxygen <= 0) {
        gameOver();
    }
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

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Muovi il nemico
        if (enemy.direction === 'left') {
            enemy.x += enemy.speed;
        } else {
            enemy.x -= enemy.speed;
        }
        
        // Rimuovi i nemici fuori dallo schermo
        if ((enemy.direction === 'left' && enemy.x > canvas.width + 100) ||
            (enemy.direction === 'right' && enemy.x < -100)) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Controlla collisione con il sottomarino
        if (checkCollision(submarine, enemy)) {
            lives--;
            createExplosion(submarine.x, submarine.y);
            
            if (lives <= 0) {
                gameOver();
                return;
            } else {
                // Riposiziona il sottomarino dopo la collisione
                submarine.x = canvas.width / 2 - SUBMARINE_WIDTH / 2;
                submarine.y = SURFACE_LEVEL - SUBMARINE_HEIGHT;
                enemies.splice(i, 1);
            }
        }
        
        // Disegna il nemico
        drawEnemy(enemy);
    }
}
```

### Effetti Visivi

Il gioco include effetti visivi come bolle e esplosioni:

```javascript
function createBubble() {
    return {
        x: Math.random() * canvas.width,
        y: canvas.height,
        radius: 2 + Math.random() * 5,
        speed: 1 + Math.random() * 2,
        alpha: 0.7
    };
}

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
```

## Concetti di Programmazione Utilizzati

1. **Gestione degli eventi**: Rilevamento degli input da tastiera per controllare il sottomarino.
2. **Animazione con Canvas**: Utilizzo di requestAnimationFrame per creare un ciclo di gioco fluido.
3. **Gestione delle risorse**: Implementazione del sistema di ossigeno e della capacità del sottomarino.
4. **Rilevamento delle collisioni**: Algoritmi per rilevare quando gli oggetti collidono.
5. **Generazione procedurale**: Creazione casuale di nemici e subacquei.
6. **Effetti particellari**: Implementazione di bolle e esplosioni per arricchire l'esperienza visiva.
7. **Gestione dello stato di gioco**: Transizioni tra stati diversi (inizio, gioco, completamento livello, game over).

## Estensioni Possibili

1. **Potenziamenti**: Aggiungere power-up che migliorano le capacità del sottomarino (ossigeno extra, armi potenziate).
2. **Nemici boss**: Implementare nemici più grandi e difficili alla fine di ogni livello.
3. **Effetti sonori**: Integrare suoni per le azioni di gioco (sparo, esplosioni, raccolta subacquei).
4. **Modalità cooperativa**: Permettere a due giocatori di controllare sottomarini diversi.
5. **Missioni speciali**: Aggiungere obiettivi secondari per guadagnare punti bonus.
6. **Personalizzazione del sottomarino**: Permettere ai giocatori di sbloccare e utilizzare sottomarini con caratteristiche diverse.
7. **Ambiente dinamico**: Implementare correnti marine, zone di bassa visibilità o altri elementi ambientali che influenzano il gameplay.

Questa implementazione di Seaquest in JavaScript ricrea l'esperienza del gioco arcade classico, offrendo un'esperienza di gioco coinvolgente che combina azione, strategia e gestione delle risorse mentre il giocatore naviga nelle profondità dell'oceano per salvare subacquei e combattere nemici marini.