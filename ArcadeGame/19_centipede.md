# Guida al Gioco Centipede

## Introduzione
Centipede è un classico gioco arcade sviluppato da Atari nel 1981. Il giocatore controlla un blaster nella parte inferiore dello schermo e deve sparare a un millepiedi che si muove attraverso un campo di funghi. Il gioco è noto per il suo gameplay frenetico e per essere uno dei primi giochi arcade ad attirare un significativo pubblico femminile, grazie al design della sua creatrice Dona Bailey, una delle prime donne programmatrici di videogiochi.

![Schermata principale di Centipede](img/19_centipede.jpg)

*Immagine: Schermata classica del gioco Centipede con il millepiedi che si muove tra i funghi.*

## Come si Gioca
- Il giocatore controlla un blaster (una sorta di cannone) nella parte inferiore dello schermo
- Il millepiedi si muove dall'alto verso il basso, cambiando direzione quando colpisce un fungo o il bordo dello schermo
- Quando il giocatore colpisce un segmento del millepiedi, questo si trasforma in un fungo
- Se il millepiedi viene colpito nel mezzo, si divide in due millepiedi più piccoli
- Altri nemici come ragni, pulci e scorpioni appaiono periodicamente per aumentare la difficoltà
- L'obiettivo è sopravvivere il più a lungo possibile e ottenere il punteggio più alto

## Caratteristiche Principali
- Gameplay veloce e frenetico
- Sistema di punteggio basato sulla distruzione dei nemici
- Progressione di difficoltà con l'avanzare dei livelli
- Diversi tipi di nemici con comportamenti unici
- Campo di gioco dinamico che cambia durante il gameplay

## Implementazione in JavaScript

La versione HTML/JavaScript di Centipede implementa tutte le caratteristiche classiche del gioco originale. Ecco una spiegazione delle principali componenti del codice:

### Configurazione del Canvas

Il gioco utilizza l'elemento HTML Canvas per disegnare tutti gli elementi grafici:

```javascript
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
```

### Struttura a Griglia

Il gioco è organizzato in una griglia invisibile che facilita il posizionamento dei funghi e il movimento del millepiedi:

```javascript
const GRID_SIZE = 20;
const GRID_WIDTH = Math.floor(canvas.width / GRID_SIZE);
const GRID_HEIGHT = Math.floor(canvas.height / GRID_SIZE);
```

### Il Giocatore (Blaster)

Il giocatore è rappresentato da un oggetto che può muoversi orizzontalmente e verticalmente nella parte inferiore dello schermo:

```javascript
const player = {
    x: canvas.width / 2,
    y: canvas.height - GRID_SIZE,
    width: GRID_SIZE,
    height: GRID_SIZE,
    speed: 5,
    color: '#00FFFF',
    draw: function() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    },
    update: function() {
        // Limita il movimento all'area del giocatore
        if (this.x < this.width / 2) {
            this.x = this.width / 2;
        } else if (this.x > canvas.width - this.width / 2) {
            this.x = canvas.width - this.width / 2;
        }
        
        if (this.y < canvas.height - PLAYER_AREA_HEIGHT * GRID_SIZE) {
            this.y = canvas.height - PLAYER_AREA_HEIGHT * GRID_SIZE;
        } else if (this.y > canvas.height - this.height / 2) {
            this.y = canvas.height - this.height / 2;
        }
    }
};
```

### I Funghi

I funghi sono ostacoli statici che influenzano il movimento del millepiedi:

```javascript
function createMushrooms() {
    for (let i = 0; i < MUSHROOM_COUNT; i++) {
        // Posiziona i funghi casualmente nella parte superiore dello schermo
        const x = Math.floor(Math.random() * GRID_WIDTH) * GRID_SIZE;
        const y = Math.floor(Math.random() * (GRID_HEIGHT - PLAYER_AREA_HEIGHT)) * GRID_SIZE;
        
        mushrooms.push({
            x: x,
            y: y,
            width: GRID_SIZE,
            height: GRID_SIZE,
            health: 4,  // Ogni fungo può essere colpito 4 volte
            color: '#00FF00'
        });
    }
}
```

### Il Millepiedi

Il millepiedi è composto da segmenti che si muovono in modo coordinato attraverso lo schermo:

```javascript
function createCentipede() {
    for (let i = 0; i < CENTIPEDE_LENGTH; i++) {
        centipede.push({
            x: i * GRID_SIZE,
            y: 0,
            width: GRID_SIZE,
            height: GRID_SIZE,
            direction: 1,  // 1 = destra, -1 = sinistra
            movingDown: false,
            color: i === 0 ? '#FF0000' : '#FF00FF'  // La testa è rossa, il corpo è magenta
        });
    }
}
```

### Gestione delle Collisioni

Una parte fondamentale del gioco è la gestione delle collisioni tra i vari elementi:

```javascript
function checkCollisions() {
    // Collisioni proiettili-funghi
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = mushrooms.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], mushrooms[j])) {
                bullets.splice(i, 1);
                mushrooms[j].health--;
                
                if (mushrooms[j].health <= 0) {
                    mushrooms.splice(j, 1);
                    score += 10;
                }
                
                updateScore();
                break;
            }
        }
    }
    
    // Collisioni proiettili-millepiedi
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = centipede.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], centipede[j])) {
                bullets.splice(i, 1);
                
                // Crea un fungo dove il segmento è stato colpito
                mushrooms.push({
                    x: centipede[j].x,
                    y: centipede[j].y,
                    width: GRID_SIZE,
                    height: GRID_SIZE,
                    health: 4,
                    color: '#00FF00'
                });
                
                // Rimuovi il segmento colpito
                centipede.splice(j, 1);
                
                score += 100;
                updateScore();
                
                // Se il millepiedi è stato completamente distrutto, creane uno nuovo
                if (centipede.length === 0) {
                    createCentipede();
                }
                
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
    // Pulisci il canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Aggiorna e disegna il giocatore
    player.update();
    player.draw();
    
    // Aggiorna e disegna i proiettili
    updateBullets();
    drawBullets();
    
    // Aggiorna e disegna i funghi
    drawMushrooms();
    
    // Aggiorna e disegna il millepiedi
    updateCentipede();
    drawCentipede();
    
    // Aggiorna e disegna i ragni
    updateSpiders();
    drawSpiders();
    
    // Controlla le collisioni
    checkCollisions();
    
    // Controlla le condizioni di game over
    checkGameOver();
    
    // Continua il loop se il gioco è attivo
    if (gameActive) {
        requestAnimationFrame(gameLoop);
    }
}
```

## Concetti di Programmazione Utilizzati

1. **Programmazione Orientata agli Oggetti**: Il gioco utilizza oggetti per rappresentare entità come il giocatore, i proiettili, i funghi e i segmenti del millepiedi.

2. **Gestione degli Eventi**: Il gioco risponde agli input dell'utente tramite eventi di tastiera e mouse.

3. **Animazione con requestAnimationFrame**: Per creare un loop di gioco fluido, viene utilizzata la funzione requestAnimationFrame.

4. **Rilevamento delle Collisioni**: Algoritmi per rilevare quando diversi elementi del gioco entrano in contatto tra loro.

5. **Gestione dello Stato di Gioco**: Il gioco tiene traccia di stati diversi come "in gioco", "pausa" e "game over".

## Estensioni Possibili

1. **Livelli Progressivi**: Implementare livelli con difficoltà crescente.

2. **Power-ups**: Aggiungere potenziamenti come scudi, armi migliorate o vite extra.

3. **Effetti Sonori e Musica**: Integrare audio per migliorare l'esperienza di gioco.

4. **Modalità Multiplayer**: Permettere a due giocatori di giocare contemporaneamente.

5. **Personalizzazione**: Consentire ai giocatori di personalizzare l'aspetto del blaster o altri elementi del gioco.

## Conclusione

Centipede è un esempio eccellente di game design classico arcade, con meccaniche semplici ma profonde che offrono una sfida continua. La sua implementazione in JavaScript dimostra come sia possibile ricreare l'esperienza arcade classica utilizzando tecnologie web moderne. Nonostante la sua età, Centipede rimane un gioco coinvolgente che mette alla prova i riflessi e la strategia del giocatore.