# Guida al Gioco Q*bert

## Introduzione
Q*bert è un classico gioco arcade sviluppato da Gottlieb e rilasciato nel 1982. Il gioco presenta un personaggio arancione con un lungo naso che salta su una piramide di cubi isometrici. Q*bert è diventato uno dei giochi arcade più riconoscibili degli anni '80 grazie al suo design unico, ai suoi personaggi memorabili e al suo gameplay innovativo. Il gioco ha generato numerosi sequel, spin-off e adattamenti, ed è apparso anche in film come "Pixels" e "Wreck-It Ralph".

## Come si Gioca
- Il giocatore controlla Q*bert, un personaggio arancione che salta da un cubo all'altro su una piramide isometrica
- L'obiettivo è cambiare il colore di tutti i cubi della piramide saltandoci sopra
- Q*bert può saltare solo in diagonale tra i cubi adiacenti
- Vari nemici cercano di ostacolare Q*bert, tra cui:
  - Coily: un serpente viola che insegue Q*bert
  - Ugg e Wrong-Way: creature che si muovono sui lati della piramide
  - Slick e Sam: cambiano il colore dei cubi già completati
- Dischi volanti ai lati della piramide possono essere usati per fuggire dai nemici
- Il giocatore perde una vita quando Q*bert cade fuori dalla piramide o viene catturato da un nemico

## Caratteristiche Principali
- Grafica isometrica innovativa per l'epoca
- Controlli semplici ma sfidanti (solo movimenti diagonali)
- Progressione di difficoltà con livelli sempre più complessi
- Nemici con comportamenti diversi e prevedibili
- Effetti sonori caratteristici, inclusi i "borbottii" incomprensibili di Q*bert
- Sistema di punteggio basato sulla velocità di completamento e sui nemici evitati
- Dischi di fuga che aggiungono un elemento strategico al gameplay

## Implementazione in JavaScript

La versione HTML/JavaScript di Q*bert implementa tutte le caratteristiche classiche del gioco originale. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare la piramide isometrica e tutti gli elementi di gioco:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
```

### Creazione della Piramide

La piramide di cubi è l'elemento centrale del gioco e viene generata programmaticamente:

```javascript
function createPyramid(size) {
    const pyramid = [];
    const cubeSize = 60;
    const startX = canvas.width / 2 - (size * cubeSize) / 2;
    const startY = 100;
    
    for (let row = 0; row < size; row++) {
        const rowCubes = [];
        for (let col = 0; col <= row; col++) {
            rowCubes.push({
                x: startX + (col - row/2) * cubeSize,
                y: startY + row * cubeSize * 0.75,
                size: cubeSize,
                color: 0, // 0 = colore iniziale, 1 = colore obiettivo
                row: row,
                col: col
            });
        }
        pyramid.push(rowCubes);
    }
    
    return pyramid;
}
```

### Il Personaggio Q*bert

Q*bert è implementato come un oggetto con proprietà per posizione, movimento e stato:

```javascript
const qbert = {
    row: 0,
    col: 0,
    x: 0,
    y: 0,
    targetRow: 0,
    targetCol: 0,
    isJumping: false,
    jumpProgress: 0,
    jumpSpeed: 0.05,
    lives: 3,
    score: 0
};

// Posiziona Q*bert all'inizio del gioco
function resetQbert() {
    qbert.row = 0;
    qbert.col = 0;
    qbert.targetRow = 0;
    qbert.targetCol = 0;
    qbert.isJumping = false;
    qbert.jumpProgress = 0;
    
    // Posizione iniziale in cima alla piramide
    const topCube = pyramid[0][0];
    qbert.x = topCube.x;
    qbert.y = topCube.y - 20; // Posiziona sopra il cubo
}
```

### Gestione degli Input

Il gioco rileva gli input da tastiera per controllare i movimenti diagonali di Q*bert:

```javascript
document.addEventListener('keydown', function(e) {
    if (!qbert.isJumping && isGameActive) {
        switch(e.key) {
            case 'ArrowUp':
                // Salta in alto a sinistra (nord-ovest)
                tryJump(-1, -1);
                break;
            case 'ArrowRight':
                // Salta in alto a destra (nord-est)
                tryJump(-1, 0);
                break;
            case 'ArrowDown':
                // Salta in basso a destra (sud-est)
                tryJump(0, 1);
                break;
            case 'ArrowLeft':
                // Salta in basso a sinistra (sud-ovest)
                tryJump(1, 0);
                break;
        }
    }
});

function tryJump(rowDelta, colDelta) {
    const newRow = qbert.row + rowDelta;
    const newCol = qbert.col + colDelta;
    
    // Verifica se il salto è valido (dentro la piramide)
    if (newRow >= 0 && newRow < pyramid.length && newCol >= 0 && newCol < pyramid[newRow].length) {
        qbert.targetRow = newRow;
        qbert.targetCol = newCol;
        qbert.isJumping = true;
        qbert.jumpProgress = 0;
        playSound('jump');
    } else {
        // Q*bert è caduto dalla piramide
        qbertFall();
    }
}
```

### Animazione del Salto

L'animazione del salto di Q*bert tra i cubi è gestita con un'interpolazione fluida:

```javascript
function updateQbert() {
    if (qbert.isJumping) {
        qbert.jumpProgress += qbert.jumpSpeed;
        
        if (qbert.jumpProgress >= 1) {
            // Salto completato
            qbert.jumpProgress = 1;
            qbert.isJumping = false;
            qbert.row = qbert.targetRow;
            qbert.col = qbert.targetCol;
            
            // Cambia il colore del cubo
            const cube = pyramid[qbert.row][qbert.col];
            if (cube.color === 0) {
                cube.color = 1;
                qbert.score += 25;
                checkLevelComplete();
            }
        }
        
        // Calcola la posizione durante il salto con un'animazione ad arco
        const startCube = pyramid[qbert.row][qbert.col];
        const targetCube = pyramid[qbert.targetRow][qbert.targetCol];
        
        qbert.x = startCube.x + (targetCube.x - startCube.x) * qbert.jumpProgress;
        
        // Aggiungi un effetto di arco al salto
        const baseY = startCube.y + (targetCube.y - startCube.y) * qbert.jumpProgress;
        const jumpHeight = 40;
        const jumpArc = Math.sin(qbert.jumpProgress * Math.PI) * jumpHeight;
        qbert.y = baseY - jumpArc;
    }
}
```

### Nemici e loro Comportamenti

I nemici in Q*bert hanno comportamenti diversi e prevedibili:

```javascript
function updateEnemies() {
    // Aggiorna Coily (il serpente)
    if (coily.active) {
        if (coily.isJumping) {
            // Animazione del salto simile a Q*bert
            coily.jumpProgress += coily.jumpSpeed;
            
            if (coily.jumpProgress >= 1) {
                coily.jumpProgress = 1;
                coily.isJumping = false;
                coily.row = coily.targetRow;
                coily.col = coily.targetCol;
                
                // Dopo il salto, decide dove saltare successivamente
                if (!gameOver && !levelComplete) {
                    setTimeout(() => {
                        chaseQbert();
                    }, 500);
                }
            }
            
            // Calcola posizione durante il salto
            updateEnemyPosition(coily);
        }
    }
    
    // Aggiorna Ugg e Wrong-Way
    uggs.forEach(ugg => {
        if (ugg.active && ugg.isJumping) {
            // Animazione del salto
            ugg.jumpProgress += ugg.jumpSpeed;
            
            if (ugg.jumpProgress >= 1) {
                ugg.jumpProgress = 1;
                ugg.isJumping = false;
                ugg.row = ugg.targetRow;
                ugg.col = ugg.targetCol;
                
                // Movimento casuale sui lati della piramide
                if (!gameOver && !levelComplete) {
                    setTimeout(() => {
                        moveUgg(ugg);
                    }, 800);
                }
            }
            
            updateEnemyPosition(ugg);
        }
    });
    
    // Aggiorna Slick e Sam
    slicks.forEach(slick => {
        if (slick.active && slick.isJumping) {
            // Animazione del salto
            slick.jumpProgress += slick.jumpSpeed;
            
            if (slick.jumpProgress >= 1) {
                slick.jumpProgress = 1;
                slick.isJumping = false;
                slick.row = slick.targetRow;
                slick.col = slick.targetCol;
                
                // Cambia il colore del cubo indietro
                const cube = pyramid[slick.row][slick.col];
                if (cube.color === 1) {
                    cube.color = 0;
                }
                
                // Movimento casuale sulla piramide
                if (!gameOver && !levelComplete) {
                    setTimeout(() => {
                        moveSlick(slick);
                    }, 800);
                }
            }
            
            updateEnemyPosition(slick);
        }
    });
}

// Coily insegue Q*bert
function chaseQbert() {
    if (!coily.active || gameOver || levelComplete) return;
    
    // Calcola la direzione verso Q*bert
    const rowDiff = qbert.row - coily.row;
    const colDiff = qbert.col - coily.col;
    
    let rowDelta = 0;
    let colDelta = 0;
    
    // Logica di inseguimento semplificata
    if (rowDiff < 0) {
        rowDelta = -1;
        colDelta = rowDiff % 2 === 0 ? -1 : 0;
    } else if (rowDiff > 0) {
        rowDelta = 1;
        colDelta = rowDiff % 2 === 0 ? 0 : 1;
    } else {
        // Stessa riga, muoviti orizzontalmente
        if (colDiff < 0) colDelta = -1;
        else if (colDiff > 0) colDelta = 1;
    }
    
    const newRow = coily.row + rowDelta;
    const newCol = coily.col + colDelta;
    
    // Verifica se il movimento è valido
    if (newRow >= 0 && newRow < pyramid.length && newCol >= 0 && newCol < pyramid[newRow].length) {
        coily.targetRow = newRow;
        coily.targetCol = newCol;
        coily.isJumping = true;
        coily.jumpProgress = 0;
    }
}
```

## Concetti di Programmazione Utilizzati

1. **Grafica isometrica**: Implementazione di una visualizzazione 3D simulata in un ambiente 2D.

2. **Gestione dello stato di gioco**: Utilizzo di variabili e oggetti per tenere traccia dello stato del gioco e dei suoi elementi.

3. **Animazioni fluide**: Utilizzo di interpolazioni e funzioni matematiche per creare movimenti naturali.

4. **Intelligenza artificiale**: Implementazione di comportamenti diversi per i vari nemici, come l'inseguimento per Coily.

5. **Rilevamento delle collisioni**: Algoritmi per determinare quando Q*bert interagisce con altri elementi di gioco.

6. **Gestione degli input**: Mappatura dei tasti direzionali per controllare i movimenti diagonali di Q*bert.

## Estensioni Possibili

1. **Modalità a due giocatori**: Aggiungere la possibilità di giocare in alternanza o simultaneamente con un altro giocatore.

2. **Livelli personalizzati**: Creare un editor di livelli che permetta ai giocatori di disegnare le proprie piramidi.

3. **Power-up aggiuntivi**: Introdurre nuovi oggetti che possano aiutare Q*bert, come congelamento temporaneo dei nemici o invulnerabilità.

4. **Modalità di gioco alternative**: Aggiungere varianti come "time attack" o "survival mode".

5. **Supporto per dispositivi mobili**: Implementare controlli touch per giocare su smartphone e tablet.

6. **Effetti sonori migliorati**: Aggiungere effetti sonori più ricchi e musica di sottofondo.

7. **Animazioni più dettagliate**: Migliorare le animazioni dei personaggi e degli effetti visivi.

8. **Sistema di achievement**: Implementare obiettivi e sfide per aumentare la rigiocabilità.

Q*bert rimane un gioco affascinante grazie al suo concept unico e al gameplay semplice ma sfidante. La sua implementazione in JavaScript permette di apprezzare le meccaniche originali con un tocco moderno, mantenendo intatto il fascino del classico arcade degli anni '80.