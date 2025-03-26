# Guida al Gioco Race

## Introduzione
Race è un classico gioco arcade di corse automobilistiche che ha guadagnato popolarità nelle sale giochi degli anni '80. Il giocatore controlla un'auto da corsa che deve evitare altri veicoli e ostacoli mentre cerca di completare il percorso nel minor tempo possibile. Con la sua grafica semplice ma efficace e il gameplay frenetico, Race rappresenta uno dei primi esempi di giochi di guida che hanno influenzato generazioni di titoli successivi.

![Schermata principale di Race](img/09_race.jpg)

*Immagine: Schermata classica del gioco Race con l'auto del giocatore e gli ostacoli.*

## Come si Gioca
- Controlla la tua auto muovendola a destra e sinistra
- Evita le altre auto e gli ostacoli sulla strada
- Raggiungi la massima distanza possibile senza schiantarti
- Accumula punti in base alla distanza percorsa e alla velocità
- Affronta livelli progressivamente più difficili con traffico più intenso

## Caratteristiche Principali
- Controlli semplici e intuitivi
- Aumento progressivo della difficoltà
- Sistema di punteggio basato su distanza e velocità
- Grafica colorata che simula una corsa ad alta velocità
- Effetti sonori che aumentano l'immersione nel gioco

## Implementazione in JavaScript

La versione HTML/JavaScript di Race ricrea l'esperienza classica del gioco arcade. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
```

### Oggetti di Gioco

Il gioco definisce diversi oggetti principali:

1. **L'auto del giocatore**: Un oggetto che rappresenta il veicolo controllato dal giocatore.

```javascript
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 150,
    width: 50,
    height: 100,
    speed: 5,
    color: '#F00'
};
```

2. **Le auto nemiche**: Oggetti che rappresentano i veicoli da evitare.

```javascript
class Car {
    constructor(x, y, speed, color) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 100;
        this.speed = speed;
        this.color = color;
    }
    
    update() {
        this.y += this.speed;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
```

3. **La strada**: Un oggetto che rappresenta l'ambiente di gioco con linee che scorrono per dare l'illusione di movimento.

```javascript
class Road {
    constructor() {
        this.laneWidth = canvas.width / 3;
        this.lineWidth = 10;
        this.lineHeight = 50;
        this.lineGap = 30;
        this.lines = [];
        this.initLines();
    }
    
    initLines() {
        const linesCount = Math.ceil(canvas.height / (this.lineHeight + this.lineGap));
        for (let i = 0; i < linesCount; i++) {
            this.lines.push({
                x1: this.laneWidth,
                y1: i * (this.lineHeight + this.lineGap),
                x2: this.laneWidth * 2,
                y2: i * (this.lineHeight + this.lineGap)
            });
        }
    }
    
    update(speed) {
        for (let line of this.lines) {
            line.y1 += speed;
            line.y2 += speed;
            
            if (line.y1 > canvas.height) {
                const lastLine = this.lines[this.lines.length - 1];
                line.y1 = lastLine.y1 - (this.lineHeight + this.lineGap);
                line.y2 = lastLine.y2 - (this.lineHeight + this.lineGap);
            }
        }
    }
    
    draw() {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = this.lineWidth;
        
        for (let line of this.lines) {
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        }
    }
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare l'auto del giocatore:

```javascript
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        player.isMovingLeft = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        player.isMovingRight = true;
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        player.isMovingLeft = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        player.isMovingRight = false;
    }
});
```

### Loop di Gioco

Il loop principale del gioco aggiorna la posizione degli oggetti, gestisce le collisioni e disegna tutto sullo schermo:

```javascript
function gameLoop() {
    if (!gameActive) return;
    
    // Aggiorna la strada
    road.update(gameSpeed);
    
    // Aggiorna la posizione del giocatore
    updatePlayer();
    
    // Aggiorna le auto nemiche
    updateCars();
    
    // Controlla le collisioni
    checkCollisions();
    
    // Aggiorna il punteggio
    score += gameSpeed * 0.1;
    
    // Aumenta la difficoltà nel tempo
    if (frameCount % 1000 === 0) {
        gameSpeed += 0.5;
        carSpawnRate -= 10;
        carSpawnRate = Math.max(carSpawnRate, 30);
    }
    
    // Disegna tutto
    draw();
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}
```

## Concetti di Programmazione Utilizzati

1. **Canvas API**: Utilizzo dell'API Canvas di HTML5 per disegnare elementi grafici 2D.
2. **Gestione degli eventi**: Rilevamento degli input da tastiera per controllare il giocatore.
3. **Programmazione orientata agli oggetti**: Utilizzo di classi per rappresentare entità di gioco.
4. **Rilevamento delle collisioni**: Implementazione di algoritmi per rilevare quando due oggetti si scontrano.
5. **Game loop**: Utilizzo di requestAnimationFrame per creare un ciclo di gioco fluido.
6. **Gestione dello stato di gioco**: Transizioni tra diversi stati (inizio, gioco attivo, game over).

## Estensioni Possibili

1. **Modalità a due giocatori**: Aggiungere la possibilità di giocare in due sullo stesso dispositivo.
2. **Power-up**: Implementare oggetti speciali che danno vantaggi temporanei (invincibilità, velocità extra).
3. **Diversi tipi di veicoli**: Aggiungere la possibilità di scegliere tra diverse auto con caratteristiche uniche.
4. **Condizioni meteo**: Implementare effetti visivi come pioggia o nebbia che influenzano il gameplay.
5. **Modalità di gioco alternative**: Aggiungere modalità come corsa a tempo o sfida a checkpoint.

Questa implementazione di Race in JavaScript offre un'esperienza di gioco coinvolgente che cattura l'essenza del classico arcade, pur essendo accessibile attraverso qualsiasi browser web moderno.