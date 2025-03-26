# Guida al Gioco Gyruss

## Introduzione
Gyruss è un celebre gioco arcade sviluppato da Konami e pubblicato nel 1983. Creato dal leggendario designer Yoshiki Okamoto (che in seguito lavorò a titoli come Street Fighter), Gyruss combina elementi di sparatutto a scorrimento con una prospettiva tubolare unica. Il giocatore controlla una navicella spaziale che si muove in un percorso circolare attorno allo schermo, sparando verso il centro. Il gioco è stato ispirato da Galaga ma ha introdotto un innovativo sistema di movimento circolare che ha creato un'esperienza di gioco tridimensionale con grafica bidimensionale. La colonna sonora, un arrangiamento elettronico di "Toccata e Fuga in Re minore" di Bach, è diventata iconica quanto il gameplay stesso.

![Schermata principale di Gyruss](img/17_gyruss.jpg)

*Immagine: Schermata classica del gioco Gyruss con la navicella che orbita attorno al centro dello schermo.*

## Come si Gioca
- Controlla la tua navicella spaziale che si muove in un'orbita circolare
- Usa le frecce direzionali (o i tasti A/D) per muoverti in senso orario e antiorario
- Premi Spazio per sparare verso il centro dello schermo
- Distruggi i nemici che appaiono dal centro e si muovono verso l'esterno
- Evita i colpi nemici e le collisioni con le navi avversarie
- Avanza attraverso il sistema solare, da Nettuno fino alla Terra

## Caratteristiche Principali
- Prospettiva tubolare unica con movimento circolare
- Sistema di controllo intuitivo con soli tre comandi (sinistra, destra, sparo)
- Progressione attraverso i pianeti del sistema solare
- Nemici con pattern di movimento diversificati
- Effetti sonori e musica memorabili basati su musica classica
- Difficoltà crescente con l'avanzare dei livelli
- Sistema di punteggio basato sulla velocità e precisione

## Implementazione in JavaScript

La versione HTML/JavaScript di Gyruss ricrea l'esperienza del gioco originale. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas e Elementi di Gioco

```javascript
// Configurazione del gioco
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const livesDisplay = document.getElementById('lives-display');
const gameOverScreen = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');

// Dimensioni del canvas
canvas.width = 800;
canvas.height = 600;

// Variabili di gioco
let score = 0;
let lives = 3;
let gameActive = false;
let gameLoop;

// Posizione del centro dello schermo
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Raggio dell'orbita del giocatore
const orbitRadius = 200;
```

### Oggetti di Gioco

Il gioco definisce diversi oggetti principali:

1. **La navicella del giocatore**: L'oggetto controllato dal giocatore che si muove in un'orbita circolare.

```javascript
// Giocatore
const player = {
    angle: 0, // Angolo in radianti
    size: 20,
    speed: 0.05,
    x: centerX,
    y: centerY + orbitRadius,
    color: '#00FFFF',
    update: function() {
        // Calcola la posizione basata sull'angolo
        this.x = centerX + Math.sin(this.angle) * orbitRadius;
        this.y = centerY + Math.cos(this.angle) * orbitRadius;
    },
    draw: function() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        
        // Disegna la navicella
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.size/2);
        ctx.lineTo(-this.size/2, this.size/2);
        ctx.lineTo(this.size/2, this.size/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
};
```

2. **Nemici**: Navi nemiche che appaiono dal centro e si muovono verso posizioni casuali.

```javascript
function spawnEnemies() {
    if (!gameActive) return;
    
    if (enemies.length < maxEnemies) {
        // Crea un nuovo nemico dal centro
        const enemy = {
            x: centerX,
            y: centerY,
            targetX: centerX + (Math.random() - 0.5) * orbitRadius * 1.5,
            targetY: centerY + (Math.random() - 0.5) * orbitRadius * 1.5,
            size: enemySize,
            speed: enemySpeed * (0.5 + Math.random() * 0.5),
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            health: 1
        };
        enemies.push(enemy);
    }
    
    // Programma la prossima generazione
    setTimeout(spawnEnemies, 1000 + Math.random() * 2000);
}
```

3. **Proiettili**: Sparati dalla navicella verso il centro dello schermo.

```javascript
// Proiettili
const bullets = [];
const bulletSpeed = 5;
const bulletSize = 5;

// Spara
if (keys[' '] && bullets.length < 5) {
    keys[' '] = false; // Previene il fuoco continuo
    const bullet = {
        x: player.x,
        y: player.y,
        angle: player.angle,
        size: bulletSize,
        speed: bulletSpeed,
        color: '#FFFF00'
    };
    bullets.push(bullet);
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare la navicella:

```javascript
// Controlli
const keys = {};

// Event listeners per i controlli
window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
});

window.addEventListener('keyup', function(e) {
    keys[e.key] = false;
});

// Aggiorna il giocatore
if (keys['ArrowLeft'] || keys['a']) {
    player.angle += player.speed;
}
if (keys['ArrowRight'] || keys['d']) {
    player.angle -= player.speed;
}
```

### Loop di Gioco

Il loop principale del gioco gestisce l'aggiornamento degli oggetti, il rilevamento delle collisioni e il rendering:

```javascript
function update() {
    if (!gameActive) return;
    
    // Pulisci il canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Disegna l'orbita
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Disegna il centro
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Aggiorna il giocatore
    player.update();
    player.draw();
    
    // Aggiorna e disegna i proiettili
    updateBullets();
    
    // Aggiorna e disegna i nemici
    updateEnemies();
}
```

### Rilevamento delle Collisioni

Il gioco implementa funzioni per rilevare le collisioni tra gli oggetti:

```javascript
// Collisione con i proiettili
for (let j = bullets.length - 1; j >= 0; j--) {
    const bullet = bullets[j];
    const dx = bullet.x - enemy.x;
    const dy = bullet.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < enemy.size + bullet.size) {
        // Colpito!
        enemy.health--;
        bullets.splice(j, 1);
        
        if (enemy.health <= 0) {
            enemies.splice(i, 1);
            score += 100;
            updateScore();
        }
        break;
    }
}

// Collisione con il giocatore
const dxPlayer = player.x - enemy.x;
const dyPlayer = player.y - enemy.y;
const distancePlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);

if (distancePlayer < enemy.size + player.size/2) {
    // Colpito dal nemico!
    enemies.splice(i, 1);
    lives--;
    updateLives();
    
    if (lives <= 0) {
        gameOver();
    }
}
```

## Concetti di Programmazione Utilizzati

1. **Trigonometria applicata**: Utilizzo di funzioni seno e coseno per calcolare posizioni in un'orbita circolare.
2. **Gestione degli eventi**: Rilevamento degli input da tastiera per controllare la navicella.
3. **Animazione con Canvas**: Utilizzo di requestAnimationFrame o setInterval per creare un ciclo di gioco fluido.
4. **Rilevamento delle collisioni**: Algoritmi per rilevare quando gli oggetti collidono utilizzando la distanza euclidea.
5. **Generazione procedurale**: Creazione casuale di nemici con proprietà variabili.
6. **Gestione dello stato di gioco**: Transizioni tra stati diversi (inizio, gioco, game over).
7. **Trasformazioni del canvas**: Utilizzo di translate e rotate per disegnare oggetti orientati correttamente.

## Estensioni Possibili

1. **Livelli planetari**: Implementare una progressione attraverso i pianeti del sistema solare come nel gioco originale.
2. **Formazioni nemiche**: Aggiungere pattern di movimento coordinati per gruppi di nemici.
3. **Power-up**: Introdurre potenziamenti come sparo multiplo, scudo protettivo o velocità aumentata.
4. **Boss di fine livello**: Implementare nemici più grandi e resistenti alla fine di ogni pianeta.
5. **Effetti sonori e musica**: Integrare la celebre colonna sonora basata su Bach e effetti sonori appropriati.
6. **Modalità a due giocatori**: Permettere a due giocatori di controllare navicelle diverse contemporaneamente.
7. **Sistema di achievement**: Aggiungere obiettivi speciali per sbloccare bonus o caratteristiche aggiuntive.
8. **Effetti visivi migliorati**: Implementare esplosioni, scie di particelle e altri effetti visivi per arricchire l'esperienza.

Questa implementazione di Gyruss in JavaScript ricrea l'esperienza del gioco arcade classico, offrendo un'esperienza di gioco coinvolgente che combina azione rapida e precisione mentre il giocatore naviga attraverso ondate di nemici spaziali in un'orbita circolare unica.