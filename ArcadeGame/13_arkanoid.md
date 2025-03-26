# Guida al Gioco Arkanoid

## Introduzione
Arkanoid è un celebre gioco arcade sviluppato da Taito nel 1986. Evoluzione del classico Breakout, Arkanoid ha aggiunto numerosi elementi innovativi come power-up, nemici e livelli con configurazioni di mattoni uniche. Il giocatore controlla una piattaforma mobile (chiamata Vaus) che deve essere utilizzata per far rimbalzare una palla e distruggere tutti i mattoni presenti sullo schermo.

![Schermata principale di Arkanoid](img/13_arkanoid.png)

*Immagine: Schermata classica del gioco Arkanoid con la piattaforma, la palla e i mattoni colorati.*

## Come si Gioca
- Controlla la piattaforma Vaus che si muove orizzontalmente nella parte inferiore dello schermo
- Fai rimbalzare la palla contro i mattoni per distruggerli
- Evita che la palla cada sotto la piattaforma
- Raccogli power-up che cadono dai mattoni distrutti per ottenere vantaggi
- Completa tutti i livelli distruggendo tutti i mattoni
- Affronta il boss finale DOH per completare il gioco

## Caratteristiche Principali
- Gameplay semplice ma coinvolgente
- Varietà di power-up che modificano il gameplay
- Livelli con configurazioni di mattoni uniche
- Mattoni di diversi colori con diverse resistenze
- Nemici che si muovono tra i mattoni e deviano la traiettoria della palla
- Boss di fine gioco

## Implementazione in JavaScript

La versione HTML/JavaScript di Arkanoid ricrea l'esperienza classica del gioco arcade. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
```

### Classi e Oggetti Principali

#### Classe Paddle (Piattaforma Vaus)

```javascript
class Paddle {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 100;
        this.height = 20;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 8;
        this.color = '#1E88E5';
        this.isMovingLeft = false;
        this.isMovingRight = false;
        this.hasMagnet = false; // Power-up magnete
        this.isWide = false; // Power-up piattaforma larga
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Disegna dettagli della piattaforma
        ctx.fillStyle = '#64B5F6';
        ctx.fillRect(this.x + 10, this.y + 5, this.width - 20, 10);
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
    
    applyPowerUp(type) {
        switch(type) {
            case 'wide':
                this.isWide = true;
                this.width = 150;
                setTimeout(() => {
                    this.isWide = false;
                    this.width = 100;
                }, 10000); // Dura 10 secondi
                break;
            case 'magnet':
                this.hasMagnet = true;
                setTimeout(() => {
                    this.hasMagnet = false;
                }, 8000); // Dura 8 secondi
                break;
        }
    }
}
```

#### Classe Ball (Palla)

```javascript
class Ball {
    constructor(canvas, paddle) {
        this.canvas = canvas;
        this.paddle = paddle;
        this.radius = 8;
        this.x = paddle.x + paddle.width / 2;
        this.y = paddle.y - this.radius;
        this.speed = 5;
        this.dx = 0; // Inizialmente ferma
        this.dy = 0;
        this.color = '#FFFFFF';
        this.isLaunched = false;
        this.isMultiBall = false;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    update() {
        if (!this.isLaunched) {
            // La palla segue la piattaforma se non è stata lanciata
            this.x = this.paddle.x + this.paddle.width / 2;
            return;
        }
        
        // Aggiorna posizione
        this.x += this.dx;
        this.y += this.dy;
        
        // Collisione con i bordi laterali
        if (this.x - this.radius < 0 || this.x + this.radius > this.canvas.width) {
            this.dx = -this.dx;
        }
        
        // Collisione con il bordo superiore
        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
        }
        
        // Collisione con la piattaforma
        if (this.y + this.radius > this.paddle.y && 
            this.x > this.paddle.x && 
            this.x < this.paddle.x + this.paddle.width && 
            this.y < this.paddle.y + this.paddle.height) {
            
            // Calcola l'angolo di rimbalzo in base a dove colpisce la piattaforma
            let hitPosition = (this.x - this.paddle.x) / this.paddle.width;
            let angle = (hitPosition - 0.5) * Math.PI; // Da -PI/2 a PI/2
            
            this.dx = this.speed * Math.sin(angle);
            this.dy = -this.speed * Math.cos(angle);
            
            // Se la piattaforma ha il power-up magnete, la palla si attacca
            if (this.paddle.hasMagnet) {
                this.isLaunched = false;
                this.dy = 0;
                this.dx = 0;
            }
        }
    }
    
    launch() {
        if (!this.isLaunched) {
            this.isLaunched = true;
            this.dy = -this.speed;
            this.dx = (Math.random() - 0.5) * this.speed;
        }
    }
    
    isOutOfBounds() {
        return this.y - this.radius > this.canvas.height;
    }
}
```

#### Classe Brick (Mattone)

```javascript
class Brick {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 1-5 per colori diversi, 0 per indistruttibile
        this.health = type === 0 ? Infinity : type;
        this.powerUpChance = 0.2; // 20% di probabilità di rilasciare un power-up
        
        // Colori in base al tipo
        const colors = [
            '#808080', // Grigio (indistruttibile)
            '#FF5252', // Rosso
            '#FF9800', // Arancione
            '#FFEB3B', // Giallo
            '#4CAF50', // Verde
            '#2196F3'  // Blu
        ];
        
        this.color = colors[type];
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Bordo del mattone
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    hit() {
        if (this.type === 0) return false; // Mattone indistruttibile
        
        this.health--;
        if (this.health <= 0) {
            // Controlla se rilascia un power-up
            return Math.random() < this.powerUpChance;
        }
        return false;
    }
}
```

#### Classe PowerUp

```javascript
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 15;
        this.speed = 2;
        
        // Tipi di power-up
        const types = [
            'extraLife',   // Vita extra
            'multiball',   // Palle multiple
            'wide',        // Piattaforma larga
            'laser',       // Sparo laser
            'slow',        // Rallenta la palla
            'magnet'       // Piattaforma magnetica
        ];
        
        this.type = types[Math.floor(Math.random() * types.length)];
        
        // Colori in base al tipo
        const colors = {
            'extraLife': '#FF5252',
            'multiball': '#FFEB3B',
            'wide': '#4CAF50',
            'laser': '#F44336',
            'slow': '#2196F3',
            'magnet': '#9C27B0'
        };
        
        this.color = colors[this.type];
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Lettera che indica il tipo di power-up
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type.charAt(0).toUpperCase(), this.x + this.width / 2, this.y + this.height - 3);
    }
    
    update() {
        this.y += this.speed;
    }
    
    isOutOfBounds() {
        return this.y > canvas.height;
    }
}
```

### Gestione del Gioco

```javascript
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.paddle = new Paddle(canvas);
        this.balls = [];
        this.bricks = [];
        this.powerUps = [];
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameOver = false;
        this.levelComplete = false;
        
        // Inizializza il gioco
        this.init();
    }
    
    init() {
        // Crea la palla principale
        this.balls.push(new Ball(this.canvas, this.paddle));
        
        // Crea i mattoni per il livello corrente
        this.createBricks();
        
        // Imposta i controlli
        this.setupControls();
    }
    
    createBricks() {
        const rows = 5 + Math.min(3, this.level - 1); // Più righe nei livelli avanzati
        const cols = 10;
        const brickWidth = (this.canvas.width - 20) / cols;
        const brickHeight = 25;
        const topMargin = 50;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Varia il tipo di mattone in base alla riga
                let type = rows - row;
                
                // Alcuni mattoni indistruttibili nei livelli avanzati
                if (this.level > 2 && Math.random() < 0.05) {
                    type = 0;
                }
                
                this.bricks.push(new Brick(
                    col * brickWidth + 10,
                    row * brickHeight + topMargin,
                    brickWidth - 4,
                    brickHeight - 4,
                    type
                ));
            }
        }
    }
    
    setupControls() {
        // Controlli da tastiera
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.paddle.isMovingLeft = true;
            } else if (e.key === 'ArrowRight') {
                this.paddle.isMovingRight = true;
            } else if (e.key === ' ') {
                // Lancia la palla se è attaccata alla piattaforma
                for (let ball of this.balls) {
                    ball.launch();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') {
                this.paddle.isMovingLeft = false;
            } else if (e.key === 'ArrowRight') {
                this.paddle.isMovingRight = false;
            }
        });
        
        // Controlli mouse/touch
        this.canvas.addEventListener('mousemove', (e) => {
            const relativeX = e.clientX - this.canvas.getBoundingClientRect().left;
            if (relativeX > 0 && relativeX < this.canvas.width) {
                this.paddle.x = relativeX - this.paddle.width / 2;
                
                // Limita la posizione della piattaforma
                if (this.paddle.x < 0) {
                    this.paddle.x = 0;
                } else if (this.paddle.x + this.paddle.width > this.canvas.width) {
                    this.paddle.x = this.canvas.width - this.paddle.width;
                }
            }
        });
        
        this.canvas.addEventListener('click', () => {
            // Lancia la palla se è attaccata alla piattaforma
            for (let ball of this.balls) {
                ball.launch();
            }
        });
    }
    
    update() {
        if (this.gameOver || this.levelComplete) return;
        
        // Aggiorna la piattaforma
        this.paddle.update();
        
        // Aggiorna le palle
        for (let i = this.balls.length - 1; i >= 0; i--) {
            this.balls[i].update();
            
            // Controlla se la palla è uscita dallo schermo
            if (this.balls[i].isOutOfBounds()) {
                this.balls.splice(i, 1);
                
                // Se non ci sono più palle, perdi una vita
                if (this.balls.length === 0) {
                    this.lives--;
                    
                    if (this.lives <= 0) {
                        this.gameOver = true;
                    } else {
                        // Crea una nuova palla
                        this.balls.push(new Ball(this.canvas, this.paddle));
                    }
                }
            }
        }
        
        // Aggiorna i power-up
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].update();
            
            // Controlla collisione con la piattaforma
            if (this.checkCollision(this.powerUps[i], this.paddle)) {
                this.applyPowerUp(this.powerUps[i].type);
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // Rimuovi power-up fuori dallo schermo
            if (this.powerUps[i].isOutOfBounds()) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Controlla collisioni palla-mattone
        this.checkBrickCollisions();
        
        // Controlla se il livello è completato
        if (this.bricks.length === 0 || this.bricks.every(brick => brick.type === 0)) {
            this.levelComplete = true;
        }
    }
    
    checkBrickCollisions() {
        for (let ball of this.balls) {
            for (let i = this.bricks.length - 1; i >= 0; i--) {
                const brick = this.bricks[i];
                
                if (this.checkCollision(ball, brick)) {
                    // Cambia direzione della palla
                    // Determina da quale lato la palla ha colpito il mattone
                    const hitLeft = ball.x < brick.x;
                    const hitRight = ball.x > brick.x + brick.width;
                    const hitTop = ball.y < brick.y;
                    const hitBottom = ball.y > brick.y + brick.height;
                    
                    if ((hitLeft || hitRight) && !hitTop && !hitBottom) {
                        ball.dx = -ball.dx; // Rimbalzo orizzontale
                    } else {
                        ball.dy = -ball.dy; // Rimbalzo verticale
                    }
                    
                    // Colpisci il mattone
                    const dropPowerUp = brick.hit();
                    
                    // Se il mattone è distrutto
                    if (brick.health <= 0) {
                        // Aggiungi punti
                        this.score += brick.type * 10;
                        
                        // Crea un power-up se necessario
                        if (dropPowerUp) {
                            this.powerUps.push(new PowerUp(
                                brick.x + brick.width / 2 - 15,
                                brick.y + brick.height
                            ));
                        }
                        
                        // Rimuovi il mattone
                        this.bricks.splice(i, 1);
                    }
                    
                    break; // Una palla può colpire solo un mattone alla volta
                }
            }
        }
    }
    
    applyPowerUp(type) {
        switch(type) {
            case 'extraLife':
                this.lives++;
                break;
            case 'multiball':
                // Crea due palle aggiuntive
                for (let i = 0; i < 2; i++) {
                    const newBall = new Ball(this.canvas, this.paddle);
                    newBall.x = this.paddle.x + this.paddle.width / 2;
                    newBall.y = this.paddle.y - newBall.radius;
                    newBall.isLaunched = true;
                    newBall.dx = (Math.random() - 0.5) * newBall.speed * 2;
                    newBall.dy = -newBall.speed;
                    this.balls.push(newBall);
                }
                break;
            case 'wide':
                this.paddle.applyPowerUp('wide');
                break;
            case 'laser':
                // Implementazione del laser (non mostrata per brevità)
                break;
            case 'slow':
                // Rallenta tutte le palle
                for (let ball of this.balls) {
                    const originalSpeed = ball.speed;
                    ball.speed = ball.speed * 0.7;
                    setTimeout(() => {
                        ball.speed = originalSpeed;
                    }, 10000); // Dura 10 secondi
                }
                break;
            case 'magnet':
                this.paddle.applyPowerUp('magnet');
                break;
        }
    }
    
    checkCollision(obj1, obj2) {
        // Per la palla (circolare)
        if (obj1.radius) {
            return obj1.x + obj1.radius > obj2.x && 
                   obj1.x - obj1.radius < obj2.x + obj2.width && 
                   obj1.y + obj1.radius > obj2.y && 
                   obj1.y - obj1.radius < obj2.y + obj2.height;
        }
        
        // Per oggetti rettangolari
        return obj1.x < obj2.x + obj2.width && 
               obj1.x + obj1.width > obj2.x && 
               obj1.y < obj2.y + obj2.height && 
               obj1.y + obj1.height > obj2.y;
    }
    
    draw() {
        // Cancella il canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Disegna lo sfondo
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Disegna i mattoni
        for (let brick of this.bricks) {
            brick.draw(this.ctx);
        }
        
        // Disegna la piattaforma
        this.paddle.draw(this.ctx);
        
        // Disegna le palle
        for (let ball of this.balls) {
            ball.draw(this.ctx);
        }
        
        // Disegna i power-up
        for (let powerUp of this.powerUps) {
            powerUp.draw(this.ctx);
        }
        
        // Disegna l'interfaccia (punteggio, vite, ecc.)
        this.drawHUD();
    }
    
    drawHUD() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Level: ${this.level}`, this.canvas.width / 2, 25);
        
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Lives: ${this.lives}`, this.canvas.width - 10, 25);
    }
    
    nextLevel() {
        this.level++;
        this.balls = [];
        this.balls.push(new Ball(this.canvas, this.paddle));
        this.powerUps = [];
        this.bricks = [];
        this.createBricks();
        this.levelComplete = false;
    }
}
```

### Loop di Gioco

```javascript
function gameLoop() {
    // Aggiorna lo stato del gioco
    game.update();
    
    // Disegna tutti gli elementi
    game.draw();
    
    // Continua il loop se il gioco non è finito
    if (!game.gameOver && !game.levelComplete) {
        requestAnimationFrame(gameLoop);
    } else if (game.levelComplete) {
        showLevelComplete();
    } else {
        showGameOver();
    }
}
```

## Concetti di Programmazione Utilizzati

### Programmazione Orientata agli Oggetti
Il gioco utilizza classi per rappresentare i vari elementi (piattaforma, palla, mattoni, power-up), incapsulando proprietà e comportamenti specifici per ciascun tipo di oggetto.

### Fisica del Rimbalzo
Il gioco implementa una fisica realistica per il rimbalzo della palla, calcolando l'angolo di rimbalzo in base a dove la palla colpisce la piattaforma.

```javascript
// Calcola l'angolo di rimbalzo in base a dove colpisce la piattaforma
let hitPosition = (this.x - this.paddle.x) / this.paddle.width;
let angle = (hitPosition - 0.5) * Math.PI; // Da -PI/2 a PI/2

this.dx = this.speed * Math.sin(angle);
this.dy = -this.speed * Math.cos(angle);
```

### Sistema di Power-Up
Il gioco include un sistema di power-up che modifica temporaneamente le caratteristiche del gameplay, come la larghezza della piattaforma o il numero di palle.

### Gestione delle Collisioni
Il gioco implementa un sistema di rilevamento delle collisioni che tiene conto della forma circolare della palla e rettangolare degli altri oggetti.

```javascript
checkCollision(obj1, obj2) {
    // Per la palla (circolare)
    if (obj1.radius) {
        return obj1.x + obj1.radius > obj2.x && 
               obj1.x - obj1.radius < obj2.x + obj2.width && 
               obj1.y + obj1.radius > obj2.y && 
               obj1.y - obj1.radius < obj2.y + obj2.height;
    }
    
    // Per oggetti rettangolari
    return obj1.x < obj2.x + obj2.width && 
           obj1.x + obj1.width > obj2.x && 
           obj1.y < obj2.y + obj2.height && 
           obj1.y + obj1.height > obj2.y;
}
```

### Progressione di Livelli
Il gioco implementa un sistema di livelli con difficoltà crescente, aumentando il numero di mattoni e introducendo mattoni indistruttibili nei livelli avanzati.

## Consigli per Estendere il Gioco

### Miglioramenti Grafici
- Sostituire le forme geometriche con sprite dettagliati
- Aggiungere effetti di particelle quando i mattoni vengono distrutti
- Implementare animazioni per i power-up
- Creare sfondi tematici per i diversi livelli

### Funzionalità Aggiuntive
- Aggiungere più tipi di power-up (palla infuocata, palla attraversa-mattoni, ecc.)
- Implementare nemici mobili che si muovono tra i mattoni
- Creare livelli con layout predefiniti e tematici
- Aggiungere boss di fine livello con meccaniche speciali

### Ottimizzazioni
- Implementare un sistema di sprite sheet per migliorare le prestazioni
- Ottimizzare il rilevamento delle collisioni per gestire un maggior numero di oggetti
- Aggiungere supporto per dispositivi mobili con controlli touch ottimizzati

### Modalità di Gioco Alternative
- Modalità sfida a tempo
- Modalità infinita con generazione procedurale di livelli
- Modalità puzzle con un numero limitato di colpi per completare il livello

## Conclusione
Arkanoid è un classico senza tempo che ha perfezionato la formula di Breakout aggiungendo elementi di varietà e strategia. La sua implementazione in JavaScript offre un'ottima opportunità per esplorare concetti di programmazione come la fisica del rimbalzo, i sistemi di power-up e la gestione degli oggetti. Con le estensioni suggerite, è possibile creare una versione moderna che mantiene il fascino dell'originale aggiungendo nuove funzionalità coinvolgenti.