# Guida al Gioco Frogger

## Introduzione
Frogger è un classico gioco arcade sviluppato da Konami e pubblicato da Sega nel 1981. Il giocatore controlla una rana che deve attraversare una strada trafficata e un fiume pericoloso per raggiungere la sicurezza delle tane sulla sponda opposta. Il gioco è noto per la sua semplicità ma anche per la sfida che offre, richiedendo tempismo preciso e rapidi riflessi.

![Schermata principale di Frogger](img/07_frogger.png)

*Immagine: Schermata classica del gioco Frogger con la rana che attraversa la strada e il fiume.*

## Come si Gioca
- Controlla la rana usando i tasti direzionali
- Attraversa prima una strada trafficata evitando le auto e i camion
- Poi attraversa un fiume saltando su tronchi galleggianti e tartarughe
- Raggiungi una delle cinque tane sulla sponda opposta
- Completa il livello riempiendo tutte le tane con le rane
- Avanza di livello con difficoltà crescente

## Caratteristiche Principali
- Gameplay semplice ma impegnativo
- Controlli intuitivi
- Ostacoli in movimento con velocità variabili
- Sistema di vite e punteggio
- Limite di tempo per ogni rana
- Progressione di livelli con difficoltà

## Implementazione in JavaScript
L'implementazione di Frogger in JavaScript richiede diversi componenti chiave per ricreare l'esperienza classica del gioco.

### Struttura del Codice
```javascript
// Inizializzazione del canvas e del contesto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Classe principale del gioco
class FroggerGame {
  constructor() {
    this.frog = new Frog();
    this.vehicles = [];
    this.logs = [];
    this.turtles = [];
    this.homes = [];
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.timer = 30;
    this.gameOver = false;
  }
  
  // Metodo per inizializzare il gioco
  init() {
    // Inizializzazione degli oggetti di gioco
    this.createVehicles();
    this.createRiverObjects();
    this.createHomes();
    
    // Gestione degli input
    this.setupInputHandlers();
    
    // Avvio del loop di gioco
    this.gameLoop();
  }
  
  // Altri metodi del gioco...
}
```

### Gestione della Rana
La rana è il personaggio principale controllato dal giocatore:

```javascript
class Frog {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height - 50;
    this.width = 30;
    this.height = 30;
    this.speed = 30; // Distanza di ogni salto
    this.direction = 'up';
  }
  
  // Movimento della rana
  move(direction) {
    this.direction = direction;
    
    switch(direction) {
      case 'up':
        if (this.y > 0) this.y -= this.speed;
        break;
      case 'down':
        if (this.y < canvas.height - this.height) this.y += this.speed;
        break;
      case 'left':
        if (this.x > 0) this.x -= this.speed;
        break;
      case 'right':
        if (this.x < canvas.width - this.width) this.x += this.speed;
        break;
    }
  }
  
  // Disegno della rana
  draw() {
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

### Rilevamento delle Collisioni
Una parte fondamentale del gioco è il rilevamento delle collisioni tra la rana e gli altri elementi:

```javascript
// Verifica collisione con veicoli
checkVehicleCollisions() {
  for (let vehicle of this.vehicles) {
    if (this.checkCollision(this.frog, vehicle)) {
      this.loseLife();
      return true;
    }
  }
  return false;
}

// Verifica se la rana è su un oggetto galleggiante
checkWaterCollisions() {
  if (this.frog.y >= 100 && this.frog.y <= 250) { // Area del fiume
    let onFloatingObject = false;
    
    // Verifica se la rana è su un tronco o una tartaruga
    for (let log of this.logs) {
      if (this.checkCollision(this.frog, log)) {
        this.frog.x += log.speed; // La rana si muove con il tronco
        onFloatingObject = true;
      }
    }
    
    for (let turtle of this.turtles) {
      if (this.checkCollision(this.frog, turtle) && !turtle.submerged) {
        this.frog.x += turtle.speed;
        onFloatingObject = true;
      }
    }
    
    // Se la rana è nell'acqua ma non su un oggetto galleggiante
    if (!onFloatingObject) {
      this.loseLife();
      return true;
    }
  }
  return false;
}

// Funzione generica per il controllo delle collisioni
checkCollision(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}
```

### Gestione degli Ostacoli
Il gioco include diversi tipi di ostacoli in movimento:

```javascript
// Creazione dei veicoli
createVehicles() {
  // Prima corsia: auto veloci da destra a sinistra
  for (let i = 0; i < 3; i++) {
    this.vehicles.push({
      x: canvas.width + i * 200,
      y: canvas.height - 100,
      width: 60,
      height: 30,
      speed: -3,
      type: 'car'
    });
  }
  
  // Seconda corsia: camion lenti da sinistra a destra
  for (let i = 0; i < 2; i++) {
    this.vehicles.push({
      x: -150 - i * 300,
      y: canvas.height - 150,
      width: 100,
      height: 30,
      speed: 1.5,
      type: 'truck'
    });
  }
  
  // Altre corsie...
}

// Creazione degli oggetti del fiume
createRiverObjects() {
  // Tronchi
  for (let i = 0; i < 3; i++) {
    this.logs.push({
      x: -200 - i * 250,
      y: 150,
      width: 150,
      height: 30,
      speed: 2,
    });
  }
  
  // Tartarughe (alcune si immergono periodicamente)
  for (let i = 0; i < 4; i++) {
    this.turtles.push({
      x: canvas.width + i * 120,
      y: 200,
      width: 80,
      height: 30,
      speed: -1.5,
      submerged: false,
      submergeCycle: Math.random() * 200
    });
  }
}

// Aggiornamento della posizione degli ostacoli
updateObstacles() {
  // Aggiornamento veicoli
  for (let vehicle of this.vehicles) {
    vehicle.x += vehicle.speed;
    
    // Riposizionamento quando escono dallo schermo
    if (vehicle.speed < 0 && vehicle.x + vehicle.width < 0) {
      vehicle.x = canvas.width + Math.random() * 200;
    } else if (vehicle.speed > 0 && vehicle.x > canvas.width) {
      vehicle.x = -vehicle.width - Math.random() * 200;
    }
  }
  
  // Aggiornamento oggetti del fiume (simile ai veicoli)
  // ...
}
```

### Sistema di Punteggio e Livelli
```javascript
// Incremento del punteggio quando la rana raggiunge una tana
checkHomeReached() {
  for (let home of this.homes) {
    if (this.checkCollision(this.frog, home) && !home.occupied) {
      home.occupied = true;
      this.score += 100 + this.timer * 10; // Bonus per il tempo rimanente
      this.resetFrog();
      
      // Verifica se tutte le tane sono occupate
      if (this.homes.every(h => h.occupied)) {
        this.levelUp();
      }
      
      return true;
    }
  }
  return false;
}

// Avanzamento di livello
levelUp() {
  this.level++;
  this.timer = 30; // Reset del timer
  
  // Reset delle tane
  for (let home of this.homes) {
    home.occupied = false;
  }
  
  // Aumento della difficoltà
  this.increaseSpeed();
}

// Aumento della velocità degli ostacoli con il livello
increaseSpeed() {
  const speedMultiplier = 1 + (this.level - 1) * 0.2;
  
  for (let vehicle of this.vehicles) {
    vehicle.speed = vehicle.speed > 0 ? 
      vehicle.speed + 0.5 : 
      vehicle.speed - 0.5;
  }
  
  // Aumento velocità per gli oggetti del fiume
  // ...
}
```

## Concetti di Programmazione Utilizzati

### Programmazione Orientata agli Oggetti
Il gioco utilizza classi e oggetti per rappresentare le entità del gioco (rana, veicoli, tronchi, ecc.), incapsulando proprietà e comportamenti.

### Loop di Gioco
Un ciclo di gioco continuo gestisce l'aggiornamento dello stato, il rilevamento delle collisioni e il rendering degli elementi visivi:

```javascript
gameLoop() {
  // Cancella il canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Aggiorna lo stato del gioco
  this.updateTimer();
  this.updateObstacles();
  
  // Verifica collisioni e condizioni di vittoria
  if (!this.checkVehicleCollisions() && 
      !this.checkWaterCollisions()) {
    this.checkHomeReached();
  }
  
  // Disegna tutti gli elementi
  this.drawBackground();
  this.drawObstacles();
  this.frog.draw();
  this.drawHUD(); // Heads-Up Display (punteggio, vite, ecc.)
  
  // Continua il loop se il gioco non è finito
  if (!this.gameOver) {
    requestAnimationFrame(() => this.gameLoop());
  } else {
    this.showGameOver();
  }
}
```

### Gestione degli Input
Il gioco risponde agli input dell'utente tramite eventi della tastiera:

```javascript
setupInputHandlers() {
  document.addEventListener('keydown', (event) => {
    if (this.gameOver) return;
    
    switch(event.key) {
      case 'ArrowUp':
        this.frog.move('up');
        break;
      case 'ArrowDown':
        this.frog.move('down');
        break;
      case 'ArrowLeft':
        this.frog.move('left');
        break;
      case 'ArrowRight':
        this.frog.move('right');
        break;
    }
  });
}
```

### Gestione del Tempo
Il gioco include un timer che limita il tempo disponibile per ogni rana:

```javascript
updateTimer() {
  this.timer -= 0.016; // Circa 60 FPS
  
  if (this.timer <= 0) {
    this.loseLife();
    this.timer = 30; // Reset del timer
  }
}
```

## Consigli per Estendere il Gioco

### Aggiungere Elementi Visivi
- Sostituire i rettangoli con sprite animati per la rana e gli ostacoli
- Aggiungere effetti visivi per le collisioni e il completamento dei livelli
- Implementare animazioni per le transizioni tra i livelli

### Migliorare il Gameplay
- Aggiungere power-up (invincibilità temporanea, salto extra, ecc.)
- Implementare nemici aggiuntivi come serpenti o alligatori nel fiume
- Creare livelli con layout diversi e sfide uniche

### Funzionalità Aggiuntive
- Sistema di salvataggio dei punteggi più alti
- Modalità di gioco alternative (modalità tempo, modalità sfida)
- Supporto per dispositivi mobili con controlli touch
- Effetti sonori e musica di sottofondo

### Ottimizzazione del Codice
- Utilizzare un sistema di gestione degli asset per caricare e gestire le risorse
- Implementare un pattern di stato per gestire le diverse fasi del gioco
- Migliorare il sistema di collisioni con algoritmi più efficienti

## Conclusione
Frogger è un esempio eccellente di game design classico che combina semplicità e sfida. Implementarlo in JavaScript offre un'ottima opportunità per esplorare concetti di programmazione di giochi come la gestione degli oggetti, il rilevamento delle collisioni e i loop di gioco. Con le estensioni suggerite, è possibile creare una versione moderna che mantiene il fascino dell'originale aggiungendo nuove funzionalità interessanti.