# Guida al Gioco Biliardo

## Introduzione
Il biliardo è un classico gioco da sala che è stato adattato in formato digitale fin dai primi giorni dei videogiochi arcade. In questa versione arcade, i giocatori controllano una stecca virtuale per colpire la biglia bianca (battente) e cercare di mandare in buca le altre biglie colorate. Con la sua fisica realistica e la necessità di pensiero strategico, il biliardo arcade offre un'esperienza di gioco che combina abilità, precisione e pianificazione.

![Schermata principale di Biliardo](img/10_biliardo.jpg)

*Immagine: Schermata classica del gioco Biliardo con il tavolo verde e le biglie colorate.*

## Come si Gioca
- Usa il mouse per mirare e impostare la potenza del tiro
- Clicca e trascina per determinare la direzione e la forza del colpo
- Manda in buca tutte le biglie per completare il livello
- Evita di mandare in buca la biglia bianca (fallo)
- Pianifica i tuoi tiri per posizionare strategicamente la biglia bianca per il colpo successivo

## Caratteristiche Principali
- Fisica realistica delle biglie e dei rimbalzi
- Controlli intuitivi basati sul mouse
- Diversi tipi di gioco (8-ball, 9-ball, ecc.)
- Sistema di punteggio basato sulla difficoltà dei tiri
- Effetti visivi e sonori che aumentano l'immersione

## Implementazione in JavaScript

La versione HTML/JavaScript del Biliardo ricrea l'esperienza classica del gioco. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
```

### Oggetti di Gioco

Il gioco definisce diversi oggetti principali:

1. **Le biglie**: Oggetti che rappresentano le biglie sul tavolo con proprietà fisiche.

```javascript
class Ball {
    constructor(x, y, radius, color, number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.number = number;
        this.velocity = { x: 0, y: 0 };
        this.mass = 1;
        this.inPocket = false;
    }
    
    update() {
        // Applica attrito
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
        
        // Aggiorna posizione
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Ferma la biglia se la velocità è molto bassa
        if (Math.abs(this.velocity.x) < 0.01 && Math.abs(this.velocity.y) < 0.01) {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    }
    
    draw() {
        if (this.inPocket) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Disegna il numero sulla biglia (tranne che per la biglia bianca)
        if (this.number > 0) {
            ctx.fillStyle = '#FFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.number, this.x, this.y);
        }
    }
}
```

2. **Il tavolo**: Un oggetto che rappresenta il tavolo da biliardo con le buche.

```javascript
class Table {
    constructor() {
        this.width = canvas.width - 40;
        this.height = canvas.height - 40;
        this.x = 20;
        this.y = 20;
        this.pockets = [
            { x: this.x, y: this.y, radius: 20 },                           // Angolo in alto a sinistra
            { x: this.x + this.width / 2, y: this.y, radius: 20 },           // Centro in alto
            { x: this.x + this.width, y: this.y, radius: 20 },               // Angolo in alto a destra
            { x: this.x, y: this.y + this.height, radius: 20 },              // Angolo in basso a sinistra
            { x: this.x + this.width / 2, y: this.y + this.height, radius: 20 }, // Centro in basso
            { x: this.x + this.width, y: this.y + this.height, radius: 20 }  // Angolo in basso a destra
        ];
    }
    
    draw() {
        // Disegna il bordo del tavolo
        ctx.fillStyle = '#553311';
        ctx.fillRect(this.x - 20, this.y - 20, this.width + 40, this.height + 40);
        
        // Disegna il feltro verde
        ctx.fillStyle = '#076324';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Disegna le buche
        for (let pocket of this.pockets) {
            ctx.beginPath();
            ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
        }
    }
}
```

3. **La stecca**: Un oggetto che rappresenta la stecca controllata dal giocatore.

```javascript
class Cue {
    constructor() {
        this.angle = 0;
        this.power = 0;
        this.maxPower = 15;
        this.isAiming = false;
        this.length = 150;
    }
    
    draw(cueBall) {
        if (!this.isAiming || cueBall.inPocket) return;
        
        const startX = cueBall.x - Math.cos(this.angle) * (cueBall.radius + 5);
        const startY = cueBall.y - Math.sin(this.angle) * (cueBall.radius + 5);
        const endX = startX - Math.cos(this.angle) * (this.length + this.power * 10);
        const endY = startY - Math.sin(this.angle) * (this.length + this.power * 10);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#8B4513';
        ctx.stroke();
        
        // Disegna l'indicatore di potenza
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(20, canvas.height - 40, (this.power / this.maxPower) * 200, 20);
    }
}
```

### Gestione degli Input

Il gioco rileva gli input del mouse per controllare la stecca:

```javascript
canvas.addEventListener('mousedown', function(e) {
    if (gameState === 'playing' && allBallsStopped()) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        cue.isAiming = true;
        cue.angle = Math.atan2(cueBall.y - mouseY, cueBall.x - mouseX);
    }
});

canvas.addEventListener('mousemove', function(e) {
    if (cue.isAiming) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        cue.angle = Math.atan2(cueBall.y - mouseY, cueBall.x - mouseX);
        
        // Calcola la potenza in base alla distanza dal mouse alla biglia
        const distance = Math.sqrt(Math.pow(cueBall.x - mouseX, 2) + Math.pow(cueBall.y - mouseY, 2));
        cue.power = Math.min(distance / 20, cue.maxPower);
    }
});

canvas.addEventListener('mouseup', function() {
    if (cue.isAiming) {
        // Applica la forza alla biglia bianca
        cueBall.velocity.x = Math.cos(cue.angle) * cue.power;
        cueBall.velocity.y = Math.sin(cue.angle) * cue.power;
        
        cue.isAiming = false;
        cue.power = 0;
        shotsTaken++;
    }
});
```

### Fisica delle Collisioni

Il gioco implementa un sistema di fisica per gestire le collisioni tra le biglie:

```javascript
function checkCollisions() {
    // Collisioni tra biglie
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const ball1 = balls[i];
            const ball2 = balls[j];
            
            if (ball1.inPocket || ball2.inPocket) continue;
            
            const dx = ball2.x - ball1.x;
            const dy = ball2.y - ball1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ball1.radius + ball2.radius) {
                // Calcola la normale della collisione
                const nx = dx / distance;
                const ny = dy / distance;
                
                // Calcola la componente tangenziale
                const tx = -ny;
                const ty = nx;
                
                // Calcola le componenti della velocità lungo la normale e la tangente
                const v1n = nx * ball1.velocity.x + ny * ball1.velocity.y;
                const v1t = tx * ball1.velocity.x + ty * ball1.velocity.y;
                const v2n = nx * ball2.velocity.x + ny * ball2.velocity.y;
                const v2t = tx * ball2.velocity.x + ty * ball2.velocity.y;
                
                // Calcola le nuove velocità normali (conservazione della quantità di moto)
                const v1nAfter = (v1n * (ball1.mass - ball2.mass) + 2 * ball2.mass * v2n) / (ball1.mass + ball2.mass);
                const v2nAfter = (v2n * (ball2.mass - ball1.mass) + 2 * ball1.mass * v1n) / (ball1.mass + ball2.mass);
                
                // Converti le velocità normali e tangenziali in vettori
                ball1.velocity.x = nx * v1nAfter + tx * v1t;
                ball1.velocity.y = ny * v1nAfter + ty * v1t;
                ball2.velocity.x = nx * v2nAfter + tx * v2t;
                ball2.velocity.y = ny * v2nAfter + ty * v2t;
                
                // Separa le biglie per evitare sovrapposizioni
                const overlap = (ball1.radius + ball2.radius - distance) / 2;
                ball1.x -= overlap * nx;
                ball1.y -= overlap * ny;
                ball2.x += overlap * nx;
                ball2.y += overlap * ny;
            }
        }
    }
}
```

## Concetti di Programmazione Utilizzati

1. **Canvas API**: Utilizzo dell'API Canvas di HTML5 per disegnare elementi grafici 2D.
2. **Gestione degli eventi del mouse**: Rilevamento degli input del mouse per controllare la stecca.
3. **Programmazione orientata agli oggetti**: Utilizzo di classi per rappresentare entità di gioco.
4. **Fisica delle collisioni**: Implementazione di algoritmi per simulare collisioni elastiche tra oggetti.
5. **Trigonometria**: Utilizzo di funzioni trigonometriche per calcolare angoli e traiettorie.
6. **Gestione dello stato di gioco**: Transizioni tra diversi stati (inizio, gioco attivo, game over).

## Estensioni Possibili

1. **Modalità di gioco diverse**: Implementare varianti come 8-ball, 9-ball, o snooker.
2. **Giocatore AI**: Aggiungere un avversario controllato dal computer con diversi livelli di difficoltà.
3. **Effetti sulla biglia**: Permettere al giocatore di applicare effetti come topspin o backspin.
4. **Modalità multiplayer**: Aggiungere la possibilità di giocare contro altri giocatori online.
5. **Personalizzazione**: Permettere ai giocatori di personalizzare l'aspetto del tavolo e delle biglie.

Questa implementazione di Biliardo in JavaScript offre un'esperienza di gioco realistica che cattura l'essenza del gioco fisico, pur essendo accessibile attraverso qualsiasi browser web moderno.