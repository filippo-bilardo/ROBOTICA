# Guida al Gioco Qix

## Introduzione
Qix è un classico gioco arcade sviluppato da Taito e rilasciato nel 1981. Il gioco presenta un concetto unico: il giocatore deve rivendicare porzioni di un'area rettangolare disegnando linee, mentre evita il "Qix" (un'entità astratta che si muove in modo imprevedibile) e altri nemici. Qix è noto per il suo gameplay innovativo che combina strategia, tempismo e nervi saldi, ed è considerato uno dei giochi arcade più originali della sua epoca.

## Come si Gioca
- Il giocatore controlla un marcatore che può muoversi lungo i bordi dell'area di gioco e le linee già disegnate
- L'obiettivo è rivendicare almeno il 75% dell'area totale per avanzare al livello successivo
- Per rivendicare un'area, il giocatore deve disegnare linee partendo da un bordo o da una linea già disegnata
- Il giocatore può disegnare in due modalità:
  - Disegno lento ("Stix"): più punti ma più vulnerabile
  - Disegno veloce ("Fastdraw"): meno punti ma più sicuro
- I nemici principali sono:
  - Qix: un'entità astratta che si muove liberamente nell'area non rivendicata
  - Sparx: nemici che seguono i bordi e le linee già disegnate
  - Fuse: un nemico che segue la linea che il giocatore sta disegnando
- Il giocatore perde una vita se:
  - Viene toccato dal Qix
  - Viene toccato da uno Sparx o dal Fuse
  - Rimane fermo troppo a lungo mentre disegna una linea

## Caratteristiche Principali
- Gameplay unico basato sulla conquista del territorio
- Grafica astratta e colorata
- Nemici con comportamenti diversi e prevedibili
- Due modalità di disegno che offrono un bilanciamento rischio/ricompensa
- Sistema di punteggio basato sulla percentuale di area rivendicata e sulla modalità di disegno utilizzata
- Progressione di difficoltà con livelli sempre più impegnativi
- Timer che impedisce al giocatore di rimanere fermo troppo a lungo

## Implementazione in JavaScript

La versione HTML/JavaScript di Qix implementa tutte le caratteristiche classiche del gioco originale. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare l'area di gioco e tutti gli elementi:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
```

### Strutture Dati per l'Area di Gioco

L'area di gioco è rappresentata da una griglia di pixel e da strutture dati per tenere traccia dei bordi e delle aree rivendicate:

```javascript
const gameArea = {
    width: canvas.width,
    height: canvas.height,
    claimedPercentage: 0,
    grid: [], // Griglia che rappresenta lo stato di ogni pixel
    borders: [], // Array di segmenti che formano i bordi
    claimedAreas: [] // Array di poligoni che rappresentano le aree rivendicate
};

// Inizializza la griglia
function initializeGrid() {
    gameArea.grid = [];
    for (let y = 0; y < gameArea.height; y++) {
        const row = [];
        for (let x = 0; x < gameArea.width; x++) {
            // 0 = non rivendicato, 1 = bordo, 2 = area rivendicata
            row.push(x === 0 || x === gameArea.width - 1 || y === 0 || y === gameArea.height - 1 ? 1 : 0);
        }
        gameArea.grid.push(row);
    }
}
```

### Il Marcatore del Giocatore

Il marcatore è l'oggetto controllato dal giocatore per disegnare linee:

```javascript
const player = {
    x: 0,
    y: gameArea.height - 1,
    size: 5,
    speed: 3,
    isDrawing: false,
    drawMode: 'slow', // 'slow' o 'fast'
    currentLine: [], // Punti della linea attualmente in disegno
    lives: 3,
    score: 0
};
```

### Il Qix e Altri Nemici

Il Qix è implementato come un oggetto con movimento casuale, mentre gli Sparx seguono i bordi:

```javascript
const qix = {
    points: [], // Array di punti che formano il Qix
    speed: 2,
    color: '#FF00FF',
    size: 20,
    angle: 0,
    changeDirectionProbability: 0.02
};

function initializeQix() {
    qix.points = [];
    const centerX = gameArea.width / 2;
    const centerY = gameArea.height / 2;
    
    // Crea una forma astratta per il Qix
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 10 + Math.random() * 10;
        qix.points.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            dx: Math.random() * 2 - 1,
            dy: Math.random() * 2 - 1
        });
    }
}

const sparxes = [];

function createSparx() {
    sparxes.push({
        x: 0,
        y: 0,
        direction: Math.random() > 0.5 ? 'clockwise' : 'counterclockwise',
        speed: 2,
        currentBorderIndex: 0,
        progress: 0
    });
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare il marcatore e cambiare la modalità di disegno:

```javascript
document.addEventListener('keydown', function(e) {
    if (!isGameActive) return;
    
    switch(e.key) {
        case 'ArrowUp':
            tryMove(0, -1);
            break;
        case 'ArrowDown':
            tryMove(0, 1);
            break;
        case 'ArrowLeft':
            tryMove(-1, 0);
            break;
        case 'ArrowRight':
            tryMove(1, 0);
            break;
        case 'Shift':
            // Cambia modalità di disegno
            player.drawMode = 'fast';
            break;
        case 'Control':
            // Inizia a disegnare
            if (!player.isDrawing && canStartDrawing()) {
                player.isDrawing = true;
                player.currentLine = [{x: player.x, y: player.y}];
            }
            break;
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'Shift') {
        player.drawMode = 'slow';
    }
});
```

### Algoritmo di Riempimento

Una delle parti più complesse del gioco è l'algoritmo che determina quale area riempire quando il giocatore completa una linea:

```javascript
function fillArea() {
    // Trova i due poligoni creati dalla nuova linea
    const polygon1 = [];
    const polygon2 = [];
    
    // Costruisci i due poligoni
    // ...
    
    // Calcola l'area di ciascun poligono
    const area1 = calculatePolygonArea(polygon1);
    const area2 = calculatePolygonArea(polygon2);
    
    // Verifica se il Qix è contenuto in uno dei poligoni
    const qixInPolygon1 = isQixInPolygon(polygon1);
    const qixInPolygon2 = isQixInPolygon(polygon2);
    
    // Riempi il poligono appropriato
    if (qixInPolygon1 && !qixInPolygon2) {
        fillPolygon(polygon2);
        player.score += calculateScore(area2, player.drawMode);
    } else if (qixInPolygon2 && !qixInPolygon1) {
        fillPolygon(polygon1);
        player.score += calculateScore(area1, player.drawMode);
    } else {
        // Se il Qix non è in nessuno dei poligoni o è in entrambi,
        // riempi il poligono più piccolo
        if (area1 < area2) {
            fillPolygon(polygon1);
            player.score += calculateScore(area1, player.drawMode);
        } else {
            fillPolygon(polygon2);
            player.score += calculateScore(area2, player.drawMode);
        }
    }
    
    // Aggiorna la percentuale di area rivendicata
    updateClaimedPercentage();
    
    // Verifica se il livello è completato
    if (gameArea.claimedPercentage >= 75) {
        levelComplete();
    }
}
```

### Loop di Gioco

Il loop principale del gioco aggiorna la posizione degli oggetti e gestisce le collisioni:

```javascript
function gameLoop() {
    if (!isGameActive) return;
    
    // Aggiorna posizione del giocatore
    updatePlayer();
    
    // Aggiorna il Qix
    updateQix();
    
    // Aggiorna gli Sparx
    updateSparxes();
    
    // Aggiorna il Fuse se il giocatore sta disegnando
    if (player.isDrawing) {
        updateFuse();
    }
    
    // Controlla collisioni
    checkCollisions();
    
    // Disegna tutto
    draw();
    
    requestAnimationFrame(gameLoop);
}
```

## Concetti di Programmazione Utilizzati

1. **Algoritmi di riempimento**: Implementazione di algoritmi per determinare quali aree riempire quando il giocatore completa una linea.

2. **Rilevamento delle collisioni**: Algoritmi per determinare quando il giocatore o le linee che disegna entrano in contatto con i nemici.

3. **Gestione di poligoni**: Creazione e manipolazione di poligoni per rappresentare le aree rivendicate.

4. **Movimento lungo percorsi**: Implementazione del movimento degli Sparx lungo i bordi e le linee già disegnate.

5. **Movimento casuale**: Algoritmi per il movimento imprevedibile del Qix.

6. **Gestione dello stato di gioco**: Utilizzo di variabili e oggetti per tenere traccia dello stato del gioco e dei suoi elementi.

## Estensioni Possibili

1. **Modalità a due giocatori**: Aggiungere la possibilità di giocare in alternanza o competitivamente con un altro giocatore.

2. **Livelli con ostacoli**: Introdurre livelli con aree pre-rivendicate o ostacoli fissi.

3. **Power-up**: Aggiungere oggetti che possano aiutare il giocatore, come rallentamento temporaneo dei nemici o invulnerabilità.

4. **Modalità di gioco alternative**: Implementare varianti come "time attack" o livelli con obiettivi specifici.

5. **Effetti visivi migliorati**: Aggiungere animazioni più fluide e effetti particellari per rendere il gioco visivamente più accattivante.

6. **Supporto per dispositivi touch**: Adattare i controlli per permettere di giocare su dispositivi mobili.

7. **Editor di livelli**: Creare un editor che permetta ai giocatori di disegnare i propri livelli.

8. **Sistema di achievement**: Implementare obiettivi e sfide per aumentare la rigiocabilità.

Qix rimane un gioco affascinante grazie al suo concept unico e al gameplay che richiede sia strategia che riflessi rapidi. La sua implementazione in JavaScript permette di apprezzare le meccaniche originali con un tocco moderno, mantenendo intatto il fascino del classico arcade degli anni '80.