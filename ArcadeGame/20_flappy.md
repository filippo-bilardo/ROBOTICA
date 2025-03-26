# Guida al Gioco Flappy Bird

## Introduzione
Flappy Bird è un celebre gioco mobile sviluppato dal programmatore vietnamita Dong Nguyen e pubblicato nel 2013. Nonostante la sua semplicità grafica e di gameplay, il gioco è diventato un fenomeno globale, raggiungendo una popolarità straordinaria prima che il suo creatore decidesse di rimuoverlo dagli store nel 2014. Flappy Bird è caratterizzato da un gameplay minimalista ma estremamente impegnativo: il giocatore controlla un uccellino che deve volare tra serie di tubi senza toccarli. La difficoltà risiede nel sistema di controllo basato su tap/click che fa "sbattere" le ali dell'uccellino, contrastando la costante forza di gravità che lo trascina verso il basso. La combinazione di controlli semplici e difficoltà elevata ha reso Flappy Bird uno dei giochi più frustranti ma al contempo avvincenti della storia dei videogiochi mobili.

![Schermata principale di Flappy Bird](img/20_flappy.jpg)

*Immagine: Schermata classica del gioco Flappy Bird con l'uccellino che vola tra i tubi.*

## Come si Gioca
- Controlla un uccellino che vola automaticamente verso destra
- Premi Spazio o fai clic per far sbattere le ali all'uccellino e farlo salire
- Naviga attraverso aperture tra coppie di tubi verticali
- Evita di colpire i tubi o di toccare il terreno
- Ogni tubo superato aggiunge un punto al punteggio
- Il gioco termina alla prima collisione

## Caratteristiche Principali
- Gameplay semplice ma impegnativo basato su un solo controllo
- Fisica realistica con gravità costante
- Generazione procedurale infinita di ostacoli
- Sistema di punteggio basato sui tubi superati
- Difficoltà progressiva con l'avanzare del gioco
- Grafica in stile pixel art con colori vivaci
- Effetti sonori reattivi per ogni azione di gioco

## Implementazione in JavaScript

La versione HTML/JavaScript di Flappy Bird ricrea l'esperienza del gioco originale. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas e Elementi di Gioco

```javascript
// Configurazione del gioco
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const highScoreDisplay = document.getElementById('high-score-display');
const gameOverScreen = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const muteButton = document.getElementById('mute-button');

// Dimensioni del canvas
canvas.width = 320;
canvas.height = 480;

// Variabili di gioco
let score = 0;
let highScore = 0;
let frames = 0;
let gameActive = false;
let gameLoop;
let difficulty = 'easy';
let muted = false;
```

### Oggetti di Gioco

Il gioco definisce diversi oggetti principali:

1. **L'uccellino**: L'oggetto controllato dal giocatore che deve navigare tra i tubi.

```javascript
// Uccellino
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    gravity: 0.5,
    velocity: 0,
    jump: 8,
    rotation: 0,
    frameIndex: 0,
    frameCount: 3,
    frameSpeed: 5,
    frameTimer: 0,
    update: function() {
        // Aggiorna la velocità con la gravità
        this.velocity += this.gravity;
        
        // Limita la velocità massima di caduta
        if (this.velocity > 15) {
            this.velocity = 15;
        }
        
        // Aggiorna la posizione
        this.y += this.velocity;
        
        // Calcola la rotazione in base alla velocità
        if (this.velocity >= 0) {
            this.rotation = Math.min(Math.PI/2, this.velocity * 0.05);
        } else {
            this.rotation = Math.max(-Math.PI/6, this.velocity * 0.05);
        }
        
        // Aggiorna l'animazione
        if (frames % this.frameSpeed === 0) {
            this.frameIndex = (this.frameIndex + 1) % this.frameCount;
        }
        
        // Controlla collisione con il terreno
        if (this.y + this.height >= canvas.height - groundHeight) {
            this.y = canvas.height - groundHeight - this.height;
            if (gameActive) {
                gameOver();
            }
        }
        
        // Impedisci all'uccellino di uscire dalla parte superiore dello schermo
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap: function() {
        this.velocity = -this.jump;
        if (!muted) {
            sounds.flap.currentTime = 0;
            sounds.flap.play();
        }
    },
    draw: function() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // Disegna l'uccellino
        ctx.drawImage(
            sprites,
            this.frameIndex * this.width, 0,
            this.width, this.height,
            -this.width/2, -this.height/2,
            this.width, this.height
        );
        
        ctx.restore();
    }
};
```

2. **I tubi**: Ostacoli che l'uccellino deve evitare.

```javascript
// Tubi
const pipes = [];
const pipeWidth = 52;
const pipeGap = 100; // Spazio tra i tubi superiore e inferiore
let pipeInterval = 90; // Frames tra la generazione di nuovi tubi

function createPipe() {
    // Calcola l'altezza casuale per il tubo superiore
    const minHeight = 50;
    const maxHeight = canvas.height - groundHeight - pipeGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
    // Crea i tubi superiore e inferiore
    pipes.push({
        x: canvas.width,
        y: 0,
        width: pipeWidth,
        height: topHeight,
        passed: false,
        isTop: true
    });
    
    pipes.push({
        x: canvas.width,
        y: topHeight + pipeGap,
        width: pipeWidth,
        height: canvas.height - topHeight - pipeGap - groundHeight,
        passed: false,
        isTop: false
    });
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera e mouse per controllare l'uccellino:

```javascript
// Event listeners per i controlli
canvas.addEventListener('click', function() {
    if (gameActive) {
        bird.flap();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === ' ' && gameActive) {
        bird.flap();
    }
});

// Inizia il gioco
startButton.addEventListener('click', startGame);

// Selettore di difficoltà
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        difficulty = this.dataset.difficulty;
        
        // Aggiorna i parametri di difficoltà
        switch(difficulty) {
            case 'easy':
                pipeInterval = 100;
                pipeGap = 120;
                bird.gravity = 0.4;
                break;
            case 'medium':
                pipeInterval = 90;
                pipeGap = 100;
                bird.gravity = 0.5;
                break;
            case 'hard':
                pipeInterval = 80;
                pipeGap = 85;
                bird.gravity = 0.6;
                break;
        }
    });
});
```

### Loop di Gioco

Il loop principale del gioco gestisce l'aggiornamento degli oggetti, il rilevamento delle collisioni e il rendering:

```javascript
function update() {
    if (!gameActive) return;
    
    frames++;
    
    // Aggiorna lo sfondo
    updateBackground();
    
    // Genera nuovi tubi
    if (frames % pipeInterval === 0) {
        createPipe();
    }
    
    // Aggiorna l'uccellino
    bird.update();
    
    // Aggiorna i tubi
    updatePipes();
    
    // Disegna tutto
    draw();
    
    // Continua il loop di gioco
    requestAnimationFrame(update);
}

function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        
        // Muovi il tubo verso sinistra
        pipe.x -= 2;
        
        // Rimuovi i tubi fuori dallo schermo
        if (pipe.x + pipe.width < 0) {
            pipes.splice(i, 1);
            continue;
        }
        
        // Controlla se l'uccellino ha superato il tubo
        if (!pipe.passed && pipe.x + pipe.width < bird.x && pipe.isTop) {
            pipe.passed = true;
            score++;
            updateScore();
            if (!muted) {
                sounds.score.currentTime = 0;
                sounds.score.play();
            }
        }
        
        // Controlla collisione con l'uccellino
        if (
            bird.x + bird.width > pipe.x &&
            bird.x < pipe.x + pipe.width &&
            bird.y + bird.height > pipe.y &&
            bird.y < pipe.y + pipe.height
        ) {
            gameOver();
        }
    }
}
```

### Sistema di Punteggio e Difficoltà

Il gioco implementa un sistema di punteggio e diverse difficoltà:

```javascript
function updateScore() {
    scoreDisplay.textContent = score;
    
    // Aggiorna il punteggio massimo se necessario
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = `Best: ${highScore}`;
        localStorage.setItem('flappyHighScore', highScore);
    }
}

function loadHighScore() {
    const savedScore = localStorage.getItem('flappyHighScore');
    if (savedScore !== null) {
        highScore = parseInt(savedScore);
        highScoreDisplay.textContent = `Best: ${highScore}`;
    }
}
```

### Effetti Sonori

Il gioco include effetti sonori per migliorare l'esperienza:

```javascript
// Effetti sonori
const sounds = {
    flap: new Audio('sounds/flap.mp3'),
    score: new Audio('sounds/score.mp3'),
    hit: new Audio('sounds/hit.mp3'),
    die: new Audio('sounds/die.mp3')
};

// Pulsante per disattivare/attivare l'audio
muteButton.addEventListener('click', function() {
    muted = !muted;
    muteButton.textContent = muted ? '🔇' : '🔊';
});
```

## Concetti di Programmazione Utilizzati

1. **Fisica di base**: Implementazione di gravità e velocità per simulare il movimento dell'uccellino.
2. **Gestione degli eventi**: Rilevamento degli input da tastiera e mouse per controllare l'uccellino.
3. **Animazione con Canvas**: Utilizzo di requestAnimationFrame per creare un ciclo di gioco fluido.
4. **Sprite animation**: Animazione dell'uccellino utilizzando sprite sheet.
5. **Rilevamento delle collisioni**: Algoritmi per rilevare quando l'uccellino collide con i tubi o il terreno.
6. **Generazione procedurale**: Creazione casuale di tubi con altezze variabili.
7. **Gestione dello stato di gioco**: Transizioni tra stati diversi (inizio, gioco, game over).
8. **Persistenza dei dati**: Salvataggio del punteggio massimo utilizzando localStorage.

## Estensioni Possibili

1. **Modalità diverse**: Aggiungere modalità di gioco alternative come modalità notturna o modalità a tempo.
2. **Personalizzazione dell'uccellino**: Permettere ai giocatori di sbloccare e utilizzare diversi personaggi.
3. **Potenziamenti**: Introdurre power-up che offrono vantaggi temporanei (invincibilità, volo più stabile, ecc.).
4. **Ostacoli aggiuntivi**: Implementare nuovi tipi di ostacoli oltre ai tubi standard.
5. **Effetti visivi migliorati**: Aggiungere effetti particellari, transizioni fluide e feedback visivi.
6. **Modalità multiplayer**: Creare una versione competitiva dove più giocatori possono sfidarsi.
7. **Sistema di achievement**: Aggiungere obiettivi speciali per sbloccare bonus o caratteristiche aggiuntive.
8. **Statistiche dettagliate**: Tenere traccia di statistiche come tempo di gioco, numero di tentativi, distanza massima percorsa.

Questa implementazione di Flappy Bird in JavaScript ricrea l'esperienza del gioco originale, offrendo un'esperienza di gioco semplice ma impegnativa che mette alla prova i riflessi e la precisione del giocatore mentre cerca di navigare l'uccellino attraverso una serie infinita di ostacoli.