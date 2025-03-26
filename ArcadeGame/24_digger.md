# Guida al Gioco Digger

## Introduzione
Digger è un classico gioco arcade sviluppato negli anni '80 che ha conquistato i giocatori con il suo gameplay unico. Il giocatore controlla un personaggio che deve scavare tunnel attraverso il terreno, raccogliere gemme preziose ed evitare o eliminare i nemici. Con la sua combinazione di esplorazione, raccolta di tesori e azione strategica, Digger ha rappresentato un'innovazione nel panorama dei giochi arcade dell'epoca.

![Schermata principale di Digger](img/24_digger.jpg)

*Immagine: Schermata classica del gioco Digger con il protagonista che scava tunnel nel terreno.*

## Come si Gioca
- Il giocatore controlla un personaggio che può muoversi in quattro direzioni (su, giù, sinistra, destra)
- Scavando tunnel attraverso il terreno, il giocatore crea percorsi per raggiungere le gemme
- Le gemme devono essere raccolte per completare il livello
- I nemici inseguono il giocatore attraverso i tunnel già scavati
- Il giocatore può sparare per eliminare i nemici
- L'obiettivo è raccogliere tutte le gemme e passare al livello successivo

## Caratteristiche Principali
- Meccanica di scavo unica che modifica l'ambiente di gioco
- Sistema di punteggio basato sulla raccolta di gemme e sull'eliminazione dei nemici
- Progressione di difficoltà con livelli sempre più complessi
- Nemici con comportamenti diversi che aumentano la sfida
- Possibilità di utilizzare strategie diverse per completare i livelli

## Implementazione in JavaScript

La versione HTML/JavaScript di Digger ricrea l'esperienza classica del gioco arcade. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
```

### Struttura a Griglia

Il gioco è organizzato in una griglia che facilita la gestione del terreno, dei tunnel e del posizionamento degli oggetti:

```javascript
const TILE_SIZE = 40;
const GRID_WIDTH = Math.floor(canvas.width / TILE_SIZE);
const GRID_HEIGHT = Math.floor(canvas.height / TILE_SIZE);
```

### Tipi di Tile

Il gioco definisce diversi tipi di tile per rappresentare il terreno, i tunnel, le gemme e i muri:

```javascript
const TILE_TYPES = {
    EMPTY: 0,
    DIRT: 1,
    WALL: 2,
    GEM: 3
};
```

### Il Giocatore

Il giocatore è rappresentato da un oggetto che può muoversi attraverso i tunnel e scavare nuovo terreno:

```javascript
let player = {
    x: 0,
    y: 0,
    width: TILE_SIZE - 10,
    height: TILE_SIZE - 10,
    speed: PLAYER_SPEED,
    direction: 'right',
    isMovingUp: false,
    isMovingDown: false,
    isMovingLeft: false,
    isMovingRight: false,
    isShooting: false,
    lastShootTime: 0
};
```

### Generazione del Livello

Il gioco genera livelli con terreno, muri e gemme posizionate strategicamente:

```javascript
function generateLevel() {
    // Resetta la griglia
    grid = [];
    tunnels = [];
    gems = [];
    
    // Crea una griglia piena di terra
    for (let y = 0; y < GRID_HEIGHT; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            // I bordi sono muri
            if (x === 0 || y === 0 || x === GRID_WIDTH - 1 || y === GRID_HEIGHT - 1) {
                grid[y][x] = TILE_TYPES.WALL;
            } else {
                grid[y][x] = TILE_TYPES.DIRT;
            }
        }
    }
    
    // Posiziona il giocatore
    player.x = TILE_SIZE + player.width / 2;
    player.y = TILE_SIZE + player.height / 2;
    
    // Crea un tunnel iniziale intorno al giocatore
    const playerTileX = Math.floor(player.x / TILE_SIZE);
    const playerTileY = Math.floor(player.y / TILE_SIZE);
    grid[playerTileY][playerTileX] = TILE_TYPES.EMPTY;
    tunnels.push({x: playerTileX, y: playerTileY});
    
    // Posiziona le gemme
    const gemCount = 5 + level * 2; // Più gemme nei livelli superiori
    for (let i = 0; i < gemCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1;
        } while (grid[y][x] !== TILE_TYPES.DIRT || 
                (Math.abs(x - playerTileX) < 3 && Math.abs(y - playerTileY) < 3));
        
        grid[y][x] = TILE_TYPES.GEM;
        gems.push({x: x, y: y});
    }
    
    // Posiziona i nemici
    enemies = [];
    const enemyCount = 2 + level; // Più nemici nei livelli superiori
    for (let i = 0; i < enemyCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1;
        } while (grid[y][x] !== TILE_TYPES.DIRT || 
                (Math.abs(x - playerTileX) < 5 && Math.abs(y - playerTileY) < 5));
        
        // Crea un piccolo tunnel per il nemico
        grid[y][x] = TILE_TYPES.EMPTY;
        tunnels.push({x: x, y: y});
        
        enemies.push({
            x: x * TILE_SIZE + TILE_SIZE / 2,
            y: y * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE - 10,
            height: TILE_SIZE - 10,
            speed: ENEMY_SPEED,
            direction: Math.random() < 0.5 ? 'left' : 'right'
        });
    }
}
```

### Meccanica di Scavo

Una parte fondamentale del gioco è la meccanica di scavo che permette al giocatore di creare nuovi tunnel:

```javascript
function digTunnel(x, y) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    // Verifica che la posizione sia valida e contenga terra
    if (tileX >= 0 && tileX < GRID_WIDTH && tileY >= 0 && tileY < GRID_HEIGHT) {
        if (grid[tileY][tileX] === TILE_TYPES.DIRT) {
            // Scava un tunnel
            grid[tileY][tileX] = TILE_TYPES.EMPTY;
            tunnels.push({x: tileX, y: tileY});
            score += 1; // Piccolo bonus per scavare
            
            // Effetto sonoro di scavo
            playSound('dig');
        } else if (grid[tileY][tileX] === TILE_TYPES.GEM) {
            // Raccogli una gemma
            grid[tileY][tileX] = TILE_TYPES.EMPTY;
            
            // Rimuovi la gemma dall'array
            for (let i = 0; i < gems.length; i++) {
                if (gems[i].x === tileX && gems[i].y === tileY) {
                    gems.splice(i, 1);
                    break;
                }
            }
            
            score += 50; // Bonus per la gemma
            
            // Effetto sonoro di raccolta
            playSound('gem');
            
            // Controlla se tutte le gemme sono state raccolte
            if (gems.length === 0) {
                levelComplete();
            }
        }
    }
}
```

### Intelligenza Artificiale dei Nemici

I nemici seguono il giocatore attraverso i tunnel già scavati:

```javascript
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Trova il percorso verso il giocatore
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        
        // Determina la direzione principale
        let moveX = 0;
        let moveY = 0;
        
        // Preferisci muoverti nella direzione con la distanza maggiore
        if (Math.abs(dx) > Math.abs(dy)) {
            moveX = dx > 0 ? 1 : -1;
        } else {
            moveY = dy > 0 ? 1 : -1;
        }
        
        // Calcola la nuova posizione
        const newX = enemy.x + moveX * enemy.speed;
        const newY = enemy.y + moveY * enemy.speed;
        
        // Controlla se la nuova posizione è in un tunnel
        const newTileX = Math.floor(newX / TILE_SIZE);
        const newTileY = Math.floor(newY / TILE_SIZE);
        
        if (grid[newTileY][newTileX] === TILE_TYPES.EMPTY) {
            // Muovi il nemico
            enemy.x = newX;
            enemy.y = newY;
            
            // Aggiorna la direzione
            if (moveX > 0) enemy.direction = 'right';
            else if (moveX < 0) enemy.direction = 'left';
            else if (moveY > 0) enemy.direction = 'down';
            else if (moveY < 0) enemy.direction = 'up';
        } else {
            // Prova a muoverti in un'altra direzione
            if (moveX !== 0) {
                // Prova a muoverti verticalmente
                moveX = 0;
                moveY = dy > 0 ? 1 : -1;
            } else {
                // Prova a muoverti orizzontalmente
                moveY = 0;
                moveX = dx > 0 ? 1 : -1;
            }
            
            const altX = enemy.x + moveX * enemy.speed;
            const altY = enemy.y + moveY * enemy.speed;
            const altTileX = Math.floor(altX / TILE_SIZE);
            const altTileY = Math.floor(altY / TILE_SIZE);
            
            if (grid[altTileY][altTileX] === TILE_TYPES.EMPTY) {
                // Muovi il nemico nella direzione alternativa
                enemy.x = altX;
                enemy.y = altY;
                
                // Aggiorna la direzione
                if (moveX > 0) enemy.direction = 'right';
                else if (moveX < 0) enemy.direction = 'left';
                else if (moveY > 0) enemy.direction = 'down';
                else if (moveY < 0) enemy.direction = 'up';
            }
        }
        
        // Controlla collisione con il giocatore
        if (checkCollision(player, enemy)) {
            // Il giocatore perde una vita
            playerHit();
        }
        
        // Controlla collisione con i proiettili
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[j], enemy)) {
                // Rimuovi il proiettile e il nemico
                bullets.splice(j, 1);
                enemies.splice(i, 1);
                
                // Bonus per aver eliminato un nemico
                score += 100;
                
                // Effetto sonoro
                playSound('enemyDeath');
                
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
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Aggiorna il giocatore
    updatePlayer();
    
    // Aggiorna i proiettili
    updateBullets();
    
    // Aggiorna i nemici
    updateEnemies();
    
    // Disegna la griglia
    drawGrid();
    
    // Disegna il giocatore
    drawPlayer();
    
    // Disegna i nemici
    drawEnemies();
    
    // Disegna i proiettili
    drawBullets();
    
    // Disegna l'interfaccia
    drawUI();
    
    // Continua il loop
    requestAnimationFrame(gameLoop);
}
```

## Concetti di Programmazione Utilizzati

1. **Gestione di una Griglia 2D**: Il gioco utilizza una matrice bidimensionale per rappresentare il terreno, i tunnel e gli oggetti.

2. **Pathfinding Semplice**: I nemici utilizzano un algoritmo di base per trovare il percorso verso il giocatore attraverso i tunnel.

3. **Gestione delle Collisioni**: Il gioco implementa algoritmi per rilevare collisioni tra il giocatore, i nemici, i proiettili e l'ambiente.

4. **Generazione Procedurale di Livelli**: Ogni livello è generato proceduralmente con una distribuzione casuale di gemme e nemici.

5. **Gestione degli Input**: Il gioco risponde agli input dell'utente per controllare il movimento del giocatore e l'azione di sparo.

## Estensioni Possibili

1. **Power-ups**: Aggiungere potenziamenti come velocità aumentata, proiettili più potenti o invincibilità temporanea.

2. **Nemici con Comportamenti Diversi**: Implementare diversi tipi di nemici con pattern di movimento e abilità uniche.

3. **Meccaniche di Gioco Aggiuntive**: Introdurre elementi come massi che cadono, acqua che riempie i tunnel o trappole da evitare.

4. **Modalità Multiplayer**: Permettere a due giocatori di collaborare o competere nello stesso livello.

5. **Editor di Livelli**: Creare un editor che permetta ai giocatori di progettare i propri livelli.

## Conclusione

Digger rappresenta un esempio eccellente di game design arcade, combinando elementi di esplorazione, raccolta e azione in un'esperienza coinvolgente. La sua implementazione in JavaScript dimostra come sia possibile ricreare l'esperienza arcade classica utilizzando tecnologie web moderne. Con la sua meccanica di scavo unica e il gameplay strategico, Digger continua a offrire una sfida divertente e stimolante per i giocatori di tutte le età.