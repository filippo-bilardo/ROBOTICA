# Guida al Gioco Galaxian

## Introduzione
Galaxian è un celebre gioco arcade sviluppato da Namco nel 1979, considerato il predecessore di Galaga. È stato uno dei primi giochi a introdurre nemici colorati con pattern di movimento complessi. Nel gioco, il giocatore controlla un'astronave nella parte inferiore dello schermo e deve abbattere flotte di alieni che volano in formazioni e occasionalmente si staccano per attaccare la nave del giocatore con movimenti a spirale.

![Schermata principale di Galaxian](img/26_galaxian.jpg)

*Immagine: Schermata classica del gioco Galaxian con la nave del giocatore e gli alieni in formazione.*

## Come si Gioca
- Il giocatore controlla un'astronave che può muoversi orizzontalmente nella parte inferiore dello schermo
- Gli alieni sono disposti in formazioni nella parte superiore dello schermo
- Alcuni alieni si staccano dalla formazione per attaccare la nave del giocatore con movimenti a spirale
- Il giocatore deve sparare agli alieni evitando i loro colpi
- Gli alieni di colore diverso valgono punteggi diversi, con i più preziosi posizionati nelle file superiori
- L'obiettivo è sopravvivere il più a lungo possibile e ottenere il punteggio più alto

## Caratteristiche Principali
- Grafica colorata con alieni di diversi colori
- Formazioni di nemici che si muovono orizzontalmente
- Nemici che si staccano dalla formazione per attaccare con movimenti a spirale
- Sistema di punteggio basato sul colore e sul tipo di nemico
- Livelli di difficoltà crescente
- Effetti sonori distintivi per ogni azione di gioco

## Implementazione in JavaScript

La versione HTML/JavaScript di Galaxian ricrea l'esperienza classica del gioco arcade. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dimensioni del canvas
const WIDTH = 800;
const HEIGHT = 600;
```

### La Nave del Giocatore

Il giocatore è rappresentato da un'astronave che può muoversi orizzontalmente e sparare:

```javascript
class Player {
    constructor() {
        this.width = 40;
        this.height = 30;
        this.x = WIDTH / 2 - this.width / 2;
        this.y = HEIGHT - this.height - 20;
        this.speed = 5;
        this.lives = 3;
        this.score = 0;
    }
    
    draw() {
        // Disegna la nave del giocatore
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }
    
    update(keys) {
        // Movimento orizzontale
        if (keys.ArrowLeft && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys.ArrowRight && this.x + this.width < WIDTH) {
            this.x += this.speed;
        }
    }
    
    shoot(bullets) {
        // Crea un nuovo proiettile
        bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, -10));
    }
}
```

### Nemici Alieni

Gli alieni sono organizzati in formazioni e possono staccarsi per attaccare:

```javascript
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type; // 0: blu, 1: viola, 2: rosso (flagship)
        this.speed = 2;
        this.diving = false;
        this.diveAngle = 0;
        this.diveRadius = 100;
        this.originalX = x;
        this.originalY = y;
    }
    
    draw() {
        // Colore basato sul tipo
        let color;
        switch(this.type) {
            case 0: color = '#6666FF'; break; // Blu
            case 1: color = '#9966FF'; break; // Viola
            case 2: color = '#FF6666'; break; // Rosso (flagship)
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Dettagli dell'alieno
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 5, this.y + 8, 5, 5); // Occhio sinistro
        ctx.fillRect(this.x + 20, this.y + 8, 5, 5); // Occhio destro
        ctx.fillRect(this.x + 10, this.y + 20, 10, 5); // Bocca
    }
    
    update(formationX, formationDirection) {
        if (this.diving) {
            // Movimento a spirale durante l'attacco
            this.diveAngle += 0.05;
            this.x = this.originalX + Math.cos(this.diveAngle) * this.diveRadius;
            this.y += this.speed;
            
            // Ritorna in formazione se esce dallo schermo
            if (this.y > HEIGHT) {
                this.diving = false;
                this.y = this.originalY;
                this.x = this.originalX;
            }
        } else {
            // Movimento con la formazione
            this.x = this.originalX + formationX;
        }
    }
    
    startDiving() {
        if (!this.diving && Math.random() < 0.005) {
            this.diving = true;
            this.diveAngle = 0;
        }
    }
    
    shoot(bullets) {
        if (this.diving && Math.random() < 0.02) {
            bullets.push(new Bullet(this.x + this.width / 2, this.y + this.height, 5));
        }
    }
}
```

### Gestione della Formazione

La formazione di alieni si muove orizzontalmente e cambia direzione quando raggiunge i bordi:

```javascript
class Formation {
    constructor() {
        this.enemies = [];
        this.x = 0;
        this.direction = 1; // 1: destra, -1: sinistra
        this.speed = 1;
        this.dropAmount = 10;
        this.initialize();
    }
    
    initialize() {
        // Crea la formazione di alieni (5 righe, 10 colonne)
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                let type = 0; // Blu di default
                if (row === 0) type = 2; // Rosso (flagship) nella prima riga
                else if (row < 3) type = 1; // Viola nelle righe 1-2
                
                this.enemies.push(new Enemy(
                    col * 40 + 150, // x
                    row * 40 + 50,  // y
                    type
                ));
            }
        }
    }
    
    update() {
        // Muovi la formazione orizzontalmente
        this.x += this.speed * this.direction;
        
        // Controlla se la formazione ha raggiunto i bordi
        let reachedEdge = false;
        for (let enemy of this.enemies) {
            if ((enemy.x <= 0 && this.direction === -1) || 
                (enemy.x + enemy.width >= WIDTH && this.direction === 1)) {
                reachedEdge = true;
                break;
            }
        }
        
        // Cambia direzione e scendi se hai raggiunto un bordo
        if (reachedEdge) {
            this.direction *= -1;
            for (let enemy of this.enemies) {
                enemy.originalY += this.dropAmount;
            }
        }
        
        // Aggiorna tutti i nemici
        for (let enemy of this.enemies) {
            enemy.update(this.x, this.direction);
            enemy.startDiving();
        }
    }
    
    draw() {
        for (let enemy of this.enemies) {
            enemy.draw();
        }
    }
}
```

### Proiettili e Collisioni

I proiettili sono gestiti per entrambi i giocatori e i nemici, con rilevamento delle collisioni:

```javascript
class Bullet {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speed = speed; // Negativo per il giocatore, positivo per i nemici
    }
    
    update() {
        this.y += this.speed;
    }
    
    draw() {
        ctx.fillStyle = this.speed < 0 ? '#FFFF00' : '#FF0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    isOffScreen() {
        return this.y < 0 || this.y > HEIGHT;
    }
}

function checkCollisions(player, formation, playerBullets, enemyBullets) {
    // Controlla collisioni tra proiettili del giocatore e nemici
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let bullet = playerBullets[i];
        
        for (let j = formation.enemies.length - 1; j >= 0; j--) {
            let enemy = formation.enemies[j];
            
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                // Calcola punteggio basato sul tipo di nemico
                let points;
                switch(enemy.type) {
                    case 0: points = 100; break; // Blu
                    case 1: points = 200; break; // Viola
                    case 2: points = 300; break; // Rosso (flagship)
                }
                
                // Bonus per nemici in picchiata
                if (enemy.diving) points *= 2;
                
                player.score += points;
                
                // Rimuovi nemico e proiettile
                formation.enemies.splice(j, 1);
                playerBullets.splice(i, 1);
                break;
            }
        }
    }
    
    // Controlla collisioni tra proiettili nemici e giocatore
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let bullet = enemyBullets[i];
        
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            
            player.lives--;
            enemyBullets.splice(i, 1);
            
            // Resetta la posizione del giocatore
            player.x = WIDTH / 2 - player.width / 2;
            break;
        }
    }
}
```

### Loop di Gioco

Il loop principale del gioco aggiorna tutti gli elementi e gestisce le collisioni:

```javascript
function gameLoop() {
    // Pulisci il canvas
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Aggiorna e disegna il giocatore
    player.update(keys);
    player.draw();
    
    // Aggiorna e disegna la formazione di nemici
    formation.update();
    formation.draw();
    
    // Gestisci i proiettili del giocatore
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        playerBullets[i].update();
        playerBullets[i].draw();
        
        if (playerBullets[i].isOffScreen()) {
            playerBullets.splice(i, 1);
        }
    }
    
    // Gestisci i proiettili nemici
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].update();
        enemyBullets[i].draw();
        
        if (enemyBullets[i].isOffScreen()) {
            enemyBullets.splice(i, 1);
        }
    }
    
    // Fai sparare i nemici
    for (let enemy of formation.enemies) {
        enemy.shoot(enemyBullets);
    }
    
    // Controlla le collisioni
    checkCollisions(player, formation, playerBullets, enemyBullets);
    
    // Disegna informazioni di gioco
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${player.score}`, 20, 30);
    ctx.fillText(`Lives: ${player.lives}`, WIDTH - 100, 30);
    
    // Controlla condizioni di fine gioco
    if (player.lives <= 0) {
        gameOver();
        return;
    }
    
    if (formation.enemies.length === 0) {
        levelComplete();
        return;
    }
    
    // Continua il loop di gioco
    requestAnimationFrame(gameLoop);
}
```

## Concetti di Programmazione Utilizzati

1. **Programmazione orientata agli oggetti**: Utilizzo di classi per rappresentare entità di gioco come il giocatore, i nemici e i proiettili.

2. **Gestione delle collisioni**: Implementazione di algoritmi per rilevare quando i proiettili colpiscono i nemici o il giocatore.

3. **Pattern di movimento**: Creazione di movimenti complessi per i nemici, inclusi movimenti a spirale durante gli attacchi.

4. **Gestione degli input**: Rilevamento degli input da tastiera per controllare la nave del giocatore.

5. **Game loop**: Implementazione di un ciclo di gioco che aggiorna continuamente lo stato del gioco e ridisegna gli elementi.

6. **Sistema di punteggio**: Calcolo del punteggio basato sul tipo di nemico e sulle condizioni di gioco.

## Estensioni Possibili

1. **Effetti sonori e musica**: Aggiungere suoni per gli spari, le esplosioni e la musica di sottofondo.

2. **Animazioni migliorate**: Implementare sprite animate per i nemici e le esplosioni.

3. **Power-up**: Aggiungere oggetti che il giocatore può raccogliere per ottenere abilità speciali, come spari multipli o scudi.

4. **Modalità a due giocatori**: Implementare una modalità cooperativa o competitiva per due giocatori.

5. **Livelli con formazioni diverse**: Creare livelli con diverse disposizioni di nemici e comportamenti.

6. **Boss di fine livello**: Aggiungere nemici più grandi e potenti alla fine di ogni livello.

7. **Sistema di salvataggio dei punteggi**: Implementare una tabella dei punteggi migliori.

8. **Supporto per dispositivi touch**: Adattare i controlli per permettere di giocare su dispositivi mobili.

Galaxian rimane un gioco affascinante grazie al suo gameplay semplice ma coinvolgente e alle sue formazioni di nemici colorate. La sua implementazione in JavaScript permette di apprezzare le meccaniche originali con un tocco moderno, mantenendo intatto il fascino del classico arcade degli anni '70.