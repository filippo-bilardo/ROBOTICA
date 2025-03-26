# Guida al Gioco Defender

## Introduzione
Defender è un classico gioco arcade sviluppato da Williams Electronics e rilasciato nel 1981. È stato uno dei primi sparatutto a scorrimento orizzontale e ha introdotto diverse meccaniche innovative che hanno influenzato molti giochi successivi. Defender è noto per la sua difficoltà elevata e per il suo gameplay frenetico che richiede riflessi rapidi e una buona coordinazione occhio-mano.

## Come si Gioca
- Il giocatore controlla una navicella che vola orizzontalmente su un pianeta
- L'obiettivo principale è proteggere gli umanoidi che si trovano sulla superficie del pianeta dagli alieni che cercano di rapirli
- La navicella può sparare laser orizzontalmente e utilizzare bombe intelligenti per eliminare i nemici
- Se un alieno riesce a catturare un umanoide e a portarlo in cima allo schermo, si trasforma in un mutante più pericoloso
- Il giocatore può utilizzare il teletrasporto (hyperspace) per sfuggire a situazioni pericolose, ma con il rischio di riapparire in una posizione ancora più pericolosa
- La partita termina quando tutti gli umanoidi vengono eliminati o quando il giocatore perde tutte le vite

## Caratteristiche Principali
- Scorrimento orizzontale a 360 gradi (il giocatore può muoversi liberamente in entrambe le direzioni)
- Radar nella parte superiore dello schermo che mostra la posizione di tutti gli elementi di gioco
- Diversi tipi di nemici con comportamenti unici
- Sistema di punteggio basato sul numero di nemici eliminati e umanoidi salvati
- Effetti sonori distintivi che avvisano il giocatore di eventi specifici
- Controlli complessi che richiedono pratica per essere padroneggiati
- Progressione di difficoltà con ondate di nemici sempre più impegnative

## Implementazione in JavaScript

La versione HTML/JavaScript di Defender implementa tutte le caratteristiche classiche del gioco originale. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
```

### Oggetti di Gioco

Il gioco definisce diversi oggetti principali:

1. **La navicella del giocatore**: L'oggetto controllato dal giocatore con proprietà per posizione, velocità e stato.

```javascript
const player = {
    x: 100,
    y: canvas.height / 2,
    width: 40,
    height: 20,
    speed: 5,
    dx: 0,
    dy: 0,
    bullets: [],
    smartBombs: 3,
    lives: 3,
    score: 0,
    isInvulnerable: false
};
```

2. **Gli umanoidi**: Personaggi che il giocatore deve proteggere.

```javascript
function createHumanoids(count) {
    const humanoids = [];
    const spacing = canvas.width / (count + 1);
    
    for (let i = 0; i < count; i++) {
        humanoids.push({
            x: spacing * (i + 1),
            y: canvas.height - 30,
            width: 10,
            height: 20,
            isBeingAbducted: false,
            abductor: null
        });
    }
    
    return humanoids;
}
```

3. **I nemici**: Diversi tipi di alieni con comportamenti specifici.

```javascript
function spawnEnemies(level) {
    const enemies = [];
    const enemyCount = 5 + level * 2;
    
    for (let i = 0; i < enemyCount; i++) {
        const enemyType = Math.random() < 0.7 ? 'lander' : 'bomber';
        
        enemies.push({
            type: enemyType,
            x: Math.random() * canvas.width,
            y: 50 + Math.random() * (canvas.height - 150),
            width: 30,
            height: 20,
            speed: 2 + Math.random() * level,
            dx: Math.random() > 0.5 ? 1 : -1,
            dy: 0,
            targetHumanoid: null,
            state: 'searching'
        });
    }
    
    return enemies;
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare la navicella:

```javascript
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') player.dx = player.speed;
    if (e.key === 'ArrowLeft') player.dx = -player.speed;
    if (e.key === 'ArrowUp') player.dy = -player.speed;
    if (e.key === 'ArrowDown') player.dy = player.speed;
    if (e.key === ' ') fireBullet();
    if (e.key === 'b' || e.key === 'B') useSmartBomb();
    if (e.key === 'h' || e.key === 'H') activateHyperspace();
});
```

### Loop di Gioco

Il loop principale del gioco aggiorna la posizione degli oggetti e gestisce le collisioni:

```javascript
function gameLoop() {
    if (!isGameActive) return;
    
    // Aggiorna posizione del giocatore
    updatePlayer();
    
    // Aggiorna posizione dei proiettili
    updateBullets();
    
    // Aggiorna comportamento dei nemici
    updateEnemies();
    
    // Aggiorna stato degli umanoidi
    updateHumanoids();
    
    // Controlla collisioni
    checkCollisions();
    
    // Disegna tutto
    draw();
    
    // Controlla condizioni di fine livello
    checkLevelCompletion();
    
    requestAnimationFrame(gameLoop);
}
```

### Intelligenza Artificiale dei Nemici

I nemici in Defender hanno comportamenti complessi, come la ricerca e il rapimento degli umanoidi:

```javascript
function updateEnemies() {
    enemies.forEach(enemy => {
        // Movimento base
        enemy.x += enemy.dx * enemy.speed;
        enemy.y += enemy.dy * enemy.speed;
        
        // Comportamento in base al tipo e allo stato
        if (enemy.type === 'lander') {
            switch(enemy.state) {
                case 'searching':
                    // Cerca un umanoide da rapire
                    if (!enemy.targetHumanoid && Math.random() < 0.01) {
                        const availableHumanoids = humanoids.filter(h => !h.isBeingAbducted);
                        if (availableHumanoids.length > 0) {
                            const randomIndex = Math.floor(Math.random() * availableHumanoids.length);
                            enemy.targetHumanoid = availableHumanoids[randomIndex];
                            enemy.state = 'abducting';
                        }
                    }
                    break;
                    
                case 'abducting':
                    // Muoviti verso l'umanoide target
                    if (enemy.targetHumanoid) {
                        moveTowardsTarget(enemy, enemy.targetHumanoid);
                        
                        // Se abbastanza vicino, inizia a rapire
                        if (distance(enemy, enemy.targetHumanoid) < 10) {
                            enemy.targetHumanoid.isBeingAbducted = true;
                            enemy.targetHumanoid.abductor = enemy;
                            enemy.state = 'returning';
                        }
                    }
                    break;
                    
                case 'returning':
                    // Porta l'umanoide in cima allo schermo
                    enemy.dy = -1;
                    
                    if (enemy.targetHumanoid) {
                        enemy.targetHumanoid.x = enemy.x;
                        enemy.targetHumanoid.y = enemy.y + 30;
                        
                        // Se raggiunge la cima, trasforma in mutante
                        if (enemy.y < 50) {
                            createMutant(enemy.x, enemy.y);
                            removeHumanoid(enemy.targetHumanoid);
                            enemy.targetHumanoid = null;
                            enemy.state = 'searching';
                        }
                    }
                    break;
            }
        }
    });
}
```

## Concetti di Programmazione Utilizzati

1. **Gestione degli oggetti di gioco**: Utilizzo di oggetti JavaScript per rappresentare entità di gioco con proprietà e comportamenti.

2. **Rilevamento delle collisioni**: Implementazione di algoritmi per rilevare quando oggetti diversi si scontrano.

3. **Intelligenza artificiale**: Creazione di comportamenti complessi per i nemici attraverso macchine a stati.

4. **Animazione con Canvas**: Utilizzo dell'API Canvas per disegnare e animare gli elementi di gioco.

5. **Gestione degli input**: Rilevamento e risposta agli input dell'utente tramite eventi della tastiera.

6. **Loop di gioco**: Implementazione di un ciclo di gioco che aggiorna continuamente lo stato e ridisegna gli elementi.

## Estensioni Possibili

1. **Grafica migliorata**: Aggiungere sprite e animazioni più dettagliate per tutti gli elementi di gioco.

2. **Effetti sonori e musica**: Implementare effetti sonori per le azioni di gioco e musica di sottofondo.

3. **Modalità a due giocatori**: Aggiungere la possibilità di giocare in cooperativa o competitivamente con un altro giocatore.

4. **Power-up aggiuntivi**: Introdurre nuovi potenziamenti che il giocatore può raccogliere durante il gioco.

5. **Sistema di livelli più complesso**: Creare una progressione di livelli con sfide e nemici unici.

6. **Modalità di gioco alternative**: Aggiungere modalità come sopravvivenza o sfida a tempo.

7. **Supporto per dispositivi mobili**: Adattare i controlli per il touch screen per giocare su dispositivi mobili.

8. **Sistema di achievement**: Implementare un sistema di obiettivi e ricompense per aumentare la rigiocabilità.

Defender è un gioco che, nonostante la sua età, offre ancora oggi un gameplay avvincente e sfidante. La sua implementazione in JavaScript permette di apprezzare le meccaniche originali con un tocco moderno, rendendolo accessibile a una nuova generazione di giocatori.