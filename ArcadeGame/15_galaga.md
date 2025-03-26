# Guida al Gioco Galaga

## Introduzione
Galaga è un celebre gioco arcade sviluppato da Namco nel 1981. È considerato uno dei più iconici sparatutto a schermata fissa della storia dei videogiochi. Il giocatore controlla un'astronave nella parte inferiore dello schermo e deve abbattere ondate di nemici alieni che volano in formazioni complesse. Galaga ha introdotto diverse innovazioni rispetto al suo predecessore Galaxian, come le formazioni di attacco più elaborate e la possibilità che la nave del giocatore venga catturata e poi recuperata.

![Schermata principale di Galaga](img/15_galaga.jpg)

*Immagine: Schermata classica del gioco Galaga con la nave del giocatore e gli alieni in formazione.*

## Come si Gioca
- Il giocatore controlla un'astronave che può muoversi orizzontalmente nella parte inferiore dello schermo
- Gli alieni entrano in scena dall'alto, formando schieramenti complessi prima di iniziare ad attaccare
- Il giocatore deve sparare agli alieni evitando i loro colpi e le loro astronavi
- Alcuni alieni possono catturare la nave del giocatore con un raggio traente
- Se il giocatore riesce a liberare la nave catturata, ottiene il controllo di due navi contemporaneamente, raddoppiando la potenza di fuoco
- L'obiettivo è sopravvivere il più a lungo possibile e ottenere il punteggio più alto

## Caratteristiche Principali
- Formazioni di nemici complesse e coreografate
- Sistema di cattura della nave e possibilità di recupero
- Diversi tipi di nemici con comportamenti e valori di punteggio differenti
- Livelli di difficoltà crescente
- Sfide bonus tra un livello e l'altro
- Effetti sonori distintivi e memorabili

## Implementazione in JavaScript

La versione HTML/JavaScript di Galaga ricrea l'esperienza classica del gioco arcade. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
```

### La Nave del Giocatore

Il giocatore è rappresentato da un'astronave triangolare che può muoversi orizzontalmente e sparare:

```javascript
class Player {
    constructor() {
        this.width = 40;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 8;
        this.isMovingLeft = false;
        this.isMovingRight = false;
        this.isShooting = false;
        this.lastShot = Date.now();
        this.shootCooldown = 300; // ms
        this.color = '#00FF00';
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }
    
    update() {
        if (this.isMovingLeft && this.x > 0) {
            this.x -= this.speed;
        }
        
        if (this.isMovingRight && this.x + this.width < canvas.width) {
            this.x += this.speed;
        }
        
        if (this.isShooting && Date.now() - this.lastShot > this.shootCooldown) {
            this.shoot();
            this.lastShot = Date.now();
        }
    }
    
    shoot() {
        const bullet = {
            x: this.x + this.width / 2 - 2,
            y: this.y,
            width: 4,
            height: 15,
            speed: 10,
            color: '#FFFF00'
        };
        
        bullets.push(bullet);
        playSound('shoot');
    }
}
```

### I Nemici

I nemici sono rappresentati da diverse classi di alieni con comportamenti specifici:

```javascript
class Enemy {
    constructor(x, y, type) {
        this.width = 30;
        this.height = 30;
        this.x = x;
        this.y = y;
        this.type = type || 1; // Default to basic enemy
        this.speed = 2;
        this.diving = false;
        this.diveAngle = 0;
        this.diveSpeed = 5;
        this.canCapture = type === 3; // Solo i boss possono catturare
        this.color = this.getColorByType();
    }
    
    getColorByType() {
        switch(this.type) {
            case 1: return '#FF0000'; // Base enemy
            case 2: return '#FF00FF'; // Mid-tier
            case 3: return '#0000FF'; // Boss
            default: return '#FF0000';
        }
    }
    
    draw() {
        ctx.fillStyle = this.color;
        
        // Disegna l'alieno in base al tipo
        if (this.type === 3) { // Boss
            // Corpo principale
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Ali
            ctx.fillRect(this.x - 10, this.y + 10, 10, 10);
            ctx.fillRect(this.x + this.width, this.y + 10, 10, 10);
        } else {
            // Disegna un alieno base o di livello medio
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    update() {
        if (this.diving) {
            // Movimento in picchiata
            this.x += Math.cos(this.diveAngle) * this.diveSpeed;
            this.y += Math.sin(this.diveAngle) * this.diveSpeed;
            
            // Controlla se l'alieno è uscito dallo schermo
            if (this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
                return false; // Rimuovi l'alieno
            }
        } else {
            // Movimento in formazione
            this.x += formationDirection * this.speed;
        }
        
        return true; // Mantieni l'alieno
    }
    
    startDive() {
        this.diving = true;
        // Calcola l'angolo verso il giocatore
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        this.diveAngle = Math.atan2(dy, dx);
    }
}
```

### Formazioni di Nemici

Una caratteristica distintiva di Galaga è il modo in cui i nemici entrano in scena e formano schieramenti complessi:

```javascript
function createEnemyFormation() {
    const rows = 5;
    const cols = 10;
    const spacing = 40;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Determina il tipo di nemico in base alla riga
            let type = 1; // Base enemy
            if (row === 0) type = 3; // Boss
            else if (row < 2) type = 2; // Mid-tier
            
            // Posizione iniziale fuori dallo schermo
            const enemy = new Enemy(
                -100 - col * spacing,
                -100 - row * spacing,
                type
            );
            
            // Posizione finale nella formazione
            const formationX = canvas.width / 2 - (cols * spacing) / 2 + col * spacing;
            const formationY = 100 + row * spacing;
            
            // Aggiungi alla formazione con informazioni sulla posizione finale
            enemyFormation.push({
                enemy: enemy,
                targetX: formationX,
                targetY: formationY,
                inPosition: false
            });
            
            enemies.push(enemy);
        }
    }
    
    // Avvia l'animazione di entrata
    animateFormationEntry();
}
```

### Sistema di Cattura della Nave

Una meccanica unica di Galaga è la possibilità che la nave del giocatore venga catturata e poi recuperata:

```javascript
function checkCaptureAttempt() {
    // Solo i boss possono catturare
    const bosses = enemies.filter(e => e.type === 3 && e.diving && !e.capturing);
    
    for (const boss of bosses) {
        // Controlla se il boss è vicino al giocatore
        const dx = Math.abs(boss.x - player.x);
        const dy = Math.abs(boss.y - player.y);
        
        if (dx < 30 && dy < 30 && !capturedShip) {
            // Inizia la sequenza di cattura
            boss.capturing = true;
            capturedShip = {
                boss: boss,
                x: boss.x,
                y: boss.y
            };
            
            // Riduci le vite del giocatore
            lives--;
            updateLivesDisplay();
            
            // Riposiziona il giocatore
            player.x = canvas.width / 2 - player.width / 2;
            
            // Effetto sonoro di cattura
            playSound('capture');
            
            break;
        }
    }
}

function updateCapturedShip() {
    if (capturedShip) {
        // Aggiorna la posizione della nave catturata
        capturedShip.x = capturedShip.boss.x;
        capturedShip.y = capturedShip.boss.y + 20;
        
        // Disegna la nave catturata
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.moveTo(capturedShip.x + player.width / 2, capturedShip.y);
        ctx.lineTo(capturedShip.x + player.width, capturedShip.y + player.height);
        ctx.lineTo(capturedShip.x, capturedShip.y + player.height);
        ctx.closePath();
        ctx.fill();
        
        // Controlla se il boss è stato colpito
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (checkCollision(bullets[i], capturedShip.boss)) {
                // Libera la nave catturata
                dualShip = true;
                capturedShip = null;
                
                // Rimuovi il boss e il proiettile
                const bossIndex = enemies.indexOf(capturedShip.boss);
                if (bossIndex !== -1) {
                    enemies.splice(bossIndex, 1);
                }
                bullets.splice(i, 1);
                
                // Bonus punti
                score += 1000;
                updateScoreDisplay();
                
                // Effetto sonoro di liberazione
                playSound('rescue');
                
                break;
            }
        }
    }
}
```

### Loop di Gioco

Il loop principale del gioco aggiorna tutti gli elementi e gestisce la logica di gioco:

```javascript
function gameLoop() {
    if (!gameRunning) return;
    
    // Pulisci il canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Aggiorna e disegna il giocatore
    player.update();
    player.draw();
    
    // Aggiorna e disegna i proiettili
    updateBullets();
    
    // Aggiorna e disegna i nemici
    updateEnemies();
    
    // Aggiorna la formazione
    updateFormation();
    
    // Aggiorna i proiettili nemici
    updateEnemyBullets();
    
    // Controlla le collisioni
    checkCollisions();
    
    // Controlla tentativi di cattura
    checkCaptureAttempt();
    
    // Aggiorna la nave catturata
    updateCapturedShip();
    
    // Controlla se il livello è completato
    checkLevelComplete();
    
    // Continua il loop
    requestAnimationFrame(gameLoop);
}
```

## Concetti di Programmazione Utilizzati

1. **Programmazione Orientata agli Oggetti**: Il gioco utilizza classi per rappresentare entità come il giocatore e i nemici.

2. **Gestione degli Stati**: Il gioco gestisce diversi stati come l'entrata in formazione, l'attacco in picchiata e la cattura della nave.

3. **Animazioni Complesse**: Le formazioni di nemici e i loro movimenti richiedono algoritmi di animazione sofisticati.

4. **Gestione delle Collisioni**: Il gioco implementa algoritmi per rilevare collisioni tra proiettili, navi e nemici.

5. **Intelligenza Artificiale Semplice**: I nemici seguono pattern di movimento e attacco predefiniti che simulano un comportamento intelligente.

## Estensioni Possibili

1. **Modalità a Due Giocatori**: Implementare una modalità cooperativa o competitiva.

2. **Power-ups Aggiuntivi**: Introdurre potenziamenti come scudi, armi speciali o velocità aumentata.

3. **Boss di Fine Livello**: Aggiungere nemici speciali con pattern di attacco unici alla fine di ogni livello.

4. **Effetti Visivi Migliorati**: Implementare esplosioni più elaborate, effetti di particelle e transizioni tra i livelli.

5. **Sistema di Salvataggio**: Permettere ai giocatori di salvare i punteggi più alti e confrontarli con altri.

## Conclusione

Galaga rappresenta un pilastro fondamentale nella storia dei giochi arcade, con le sue meccaniche innovative e il gameplay avvincente. La sua implementazione in JavaScript dimostra come sia possibile ricreare l'esperienza arcade classica utilizzando tecnologie web moderne. Nonostante siano passati decenni dalla sua uscita originale, Galaga continua a essere un esempio eccellente di design di gioco che bilancia perfettamente semplicità e profondità.