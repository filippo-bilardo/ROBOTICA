# Guida al Gioco Space Invaders

## Introduzione
Space Invaders è un iconico gioco arcade sviluppato da Taito Corporation e rilasciato nel 1978. Il gioco ha rivoluzionato l'industria videoludica ed è considerato uno dei titoli più influenti di tutti i tempi. Il giocatore controlla un cannone mobile che deve difendere la Terra da ondate di alieni invasori che avanzano verso il basso, diventando sempre più veloci man mano che il loro numero diminuisce.

![Schermata principale di Space Invaders](img/08_space_invaders.png)

*Immagine: Schermata classica del gioco Space Invaders con gli alieni invasori e il cannone difensore.*

## Come si Gioca
- Controlla un cannone difensore che si muove orizzontalmente nella parte inferiore dello schermo
- Spara agli alieni invasori che avanzano verso il basso in formazione
- Utilizza i ripari per proteggerti dagli spari nemici
- Evita i proiettili lanciati dagli alieni
- Fai attenzione all'UFO che occasionalmente attraversa la parte superiore dello schermo per ottenere bonus speciali
- Elimina tutti gli alieni per avanzare al livello successivo

## Caratteristiche Principali
- Gameplay semplice ma coinvolgente
- Difficoltà progressiva: gli alieni si muovono più velocemente man mano che il loro numero diminuisce
- Sistema di punteggio basato sulla posizione e tipo di alieno eliminato
- Effetti sonori iconici che aumentano di ritmo con l'avanzare del gioco
- Ripari distruttibili che offrono protezione temporanea
- UFO bonus che appare periodicamente

## Implementazione in JavaScript

La versione HTML/JavaScript di Space Invaders ricrea l'esperienza classica del gioco arcade. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
```

### Classi e Oggetti Principali

#### Classe Player (Cannone Difensore)

```javascript
class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 60;
        this.height = 20;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
        this.color = '#00FF00';
        this.lives = 3;
        this.isMovingLeft = false;
        this.isMovingRight = false;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Disegna il cannone
        ctx.fillRect(this.x + this.width / 2 - 5, this.y - 15, 10, 15);
    }
    
    update() {
        // Movimento orizzontale
        if (this.isMovingLeft && this.x > 0) {
            this.x -= this.speed;
        }
        if (this.isMovingRight && this.x < this.canvas.width - this.width) {
            this.x += this.speed;
        }
    }
    
    shoot() {
        return new Projectile(this.x + this.width / 2, this.y - 15, -10, 3, 15, '#00FF00');
    }
}
```

#### Classe Alien (Invasore Alieno)

```javascript
class Alien {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.type = type; // 0, 1, o 2 per diversi tipi di alieni
        this.points = (3 - type) * 10; // Più punti per gli alieni in alto
        this.color = type === 0 ? '#FF0000' : type === 1 ? '#00FFFF' : '#FFFF00';
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    
    shoot() {
        // Gli alieni sparano verso il basso
        return new Projectile(this.x + this.width / 2, this.y + this.height, 5, 2, 10, '#FFFFFF');
    }
}
```

#### Classe Projectile (Proiettile)

```javascript
class Projectile {
    constructor(x, y, speed, width, height, color) {
        this.x = x - width / 2;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    update() {
        this.y += this.speed;
    }
    
    isOffScreen(canvas) {
        return this.y < 0 || this.y > canvas.height;
    }
}
```

#### Classe Shield (Riparo)

```javascript
class Shield {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 60;
        this.blocks = [];
        this.blockSize = 10;
        
        // Crea i blocchi che compongono il riparo
        this.createBlocks();
    }
    
    createBlocks() {
        for (let row = 0; row < this.height / this.blockSize; row++) {
            for (let col = 0; col < this.width / this.blockSize; col++) {
                // Crea la forma del riparo (simile a una fortezza con un'apertura in basso)
                if (!(row > this.height / this.blockSize - 3 && 
                      col > this.width / this.blockSize / 3 && 
                      col < this.width / this.blockSize * 2 / 3)) {
                    this.blocks.push({
                        x: this.x + col * this.blockSize,
                        y: this.y + row * this.blockSize,
                        width: this.blockSize,
                        height: this.blockSize,
                        health: 3 // Ogni blocco può essere colpito 3 volte
                    });
                }
            }
        }
    }
    
    draw(ctx) {
        for (let block of this.blocks) {
            // Colore basato sulla salute del blocco
            const alpha = block.health / 3;
            ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
            ctx.fillRect(block.x, block.y, block.width, block.height);
        }
    }
    
    checkCollision(projectile) {
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            if (projectile.x < block.x + block.width &&
                projectile.x + projectile.width > block.x &&
                projectile.y < block.y + block.height &&
                projectile.y + projectile.height > block.y) {
                
                block.health--;
                if (block.health <= 0) {
                    this.blocks.splice(i, 1);
                }
                return true;
            }
        }
        return false;
    }
}
```

### Gestione del Gioco

```javascript
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = new Player(canvas);
        this.aliens = [];
        this.playerProjectiles = [];
        this.alienProjectiles = [];
        this.shields = [];
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.alienDirection = 1; // 1 per destra, -1 per sinistra
        this.alienStepDown = 0;
        this.alienMoveSpeed = 1;
        this.alienShootChance = 0.005; // Probabilità che un alieno spari
        this.ufo = null;
        this.ufoTimer = 0;
        
        // Inizializza il gioco
        this.init();
    }
    
    init() {
        // Crea gli alieni in formazione
        this.createAliens();
        
        // Crea i ripari
        this.createShields();
        
        // Imposta i controlli
        this.setupControls();
    }
    
    createAliens() {
        const rows = 5;
        const cols = 11;
        const spacing = 60;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const type = Math.floor(row / 2); // 0, 1, o 2
                const alien = new Alien(
                    col * spacing + 50,
                    row * spacing + 50,
                    type
                );
                this.aliens.push(alien);
            }
        }
    }
    
    createShields() {
        const shieldCount = 4;
        const spacing = this.canvas.width / (shieldCount + 1);
        
        for (let i = 0; i < shieldCount; i++) {
            this.shields.push(new Shield(
                spacing * (i + 1) - 40,
                this.canvas.height - 150
            ));
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.player.isMovingLeft = true;
            } else if (e.key === 'ArrowRight') {
                this.player.isMovingRight = true;
            } else if (e.key === ' ' && this.playerProjectiles.length < 1) {
                // Limita a un proiettile alla volta
                this.playerProjectiles.push(this.player.shoot());
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') {
                this.player.isMovingLeft = false;
            } else if (e.key === 'ArrowRight') {
                this.player.isMovingRight = false;
            }
        });
    }
    
    update() {
        if (this.gameOver) return;
        
        // Aggiorna il giocatore
        this.player.update();
        
        // Aggiorna i proiettili
        this.updateProjectiles();
        
        // Aggiorna gli alieni
        this.updateAliens();
        
        // Aggiorna l'UFO
        this.updateUFO();
        
        // Controlla le collisioni
        this.checkCollisions();
        
        // Controlla condizioni di vittoria/sconfitta
        this.checkGameState();
    }
    
    // Altri metodi per aggiornare proiettili, alieni, UFO e controllare collisioni
}
```

### Loop di Gioco

```javascript
function gameLoop() {
    // Cancella il canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Aggiorna lo stato del gioco
    game.update();
    
    // Disegna tutti gli elementi
    game.draw();
    
    // Continua il loop se il gioco non è finito
    if (!game.gameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        showGameOver();
    }
}
```

## Concetti di Programmazione Utilizzati

### Programmazione Orientata agli Oggetti
Il gioco utilizza classi per rappresentare i vari elementi (giocatore, alieni, proiettili, ripari), incapsulando proprietà e comportamenti specifici per ciascun tipo di oggetto.

### Gestione delle Collisioni
Il gioco implementa un sistema di rilevamento delle collisioni per determinare quando i proiettili colpiscono gli alieni, i ripari o il giocatore.

```javascript
checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}
```

### Pattern di Movimento
Gli alieni seguono un pattern di movimento caratteristico, muovendosi lateralmente e scendendo quando raggiungono i bordi dello schermo.

```javascript
updateAliens() {
    let moveDown = false;
    let alienSpeed = this.alienMoveSpeed * this.alienDirection;
    
    // Controlla se gli alieni devono cambiare direzione
    for (let alien of this.aliens) {
        if ((alienSpeed > 0 && alien.x + alien.width + alienSpeed > this.canvas.width) ||
            (alienSpeed < 0 && alien.x + alienSpeed < 0)) {
            moveDown = true;
            this.alienDirection *= -1;
            break;
        }
    }
    
    // Muovi gli alieni
    for (let alien of this.aliens) {
        if (moveDown) {
            alien.move(0, 20); // Scendi di 20 pixel
        } else {
            alien.move(alienSpeed, 0);
        }
        
        // Possibilità che l'alieno spari
        if (Math.random() < this.alienShootChance) {
            this.alienProjectiles.push(alien.shoot());
        }
    }
}
```

### Gestione degli Input
Il gioco rileva gli input da tastiera per controllare il movimento del giocatore e lo sparo dei proiettili.

### Aumento Progressivo della Difficoltà
La difficoltà aumenta con l'avanzare dei livelli, con alieni più veloci e una maggiore frequenza di sparo.

```javascript
nextLevel() {
    this.level++;
    this.alienMoveSpeed += 0.5;
    this.alienShootChance += 0.002;
    this.createAliens();
}
```

## Consigli per Estendere il Gioco

### Miglioramenti Grafici
- Sostituire i rettangoli con sprite animati per gli alieni, il giocatore e l'UFO
- Aggiungere effetti di esplosione quando gli alieni vengono colpiti
- Implementare uno sfondo stellato animato

### Funzionalità Aggiuntive
- Aggiungere power-up che cadono dagli alieni eliminati (scudo, sparo multiplo, velocità aumentata)
- Implementare diversi tipi di armi per il giocatore
- Creare boss di fine livello
- Aggiungere effetti sonori e musica di sottofondo

### Ottimizzazioni
- Implementare un sistema di sprite sheet per migliorare le prestazioni
- Ottimizzare il rilevamento delle collisioni per gestire un maggior numero di oggetti
- Aggiungere supporto per dispositivi mobili con controlli touch

### Modalità di Gioco Alternative
- Modalità cooperativa per due giocatori
- Modalità survival con ondate infinite di alieni
- Modalità sfida con obiettivi specifici da completare

## Conclusione
Space Invaders è un pilastro fondamentale nella storia dei videogiochi che ha definito molti degli elementi che ancora oggi troviamo nei giochi moderni. La sua implementazione in JavaScript offre un'ottima opportunità per esplorare concetti di programmazione come la gestione degli oggetti, il rilevamento delle collisioni e i pattern di movimento. Con le estensioni suggerite, è possibile creare una versione moderna che mantiene il fascino dell'originale aggiungendo nuove funzionalità coinvolgenti.