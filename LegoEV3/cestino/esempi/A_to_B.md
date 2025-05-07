Ecco un programma per EV3 MakeCode che permette al robot di spostarsi da un punto A a un punto B evitando eventuali ostacoli lungo il percorso. Il codice utilizza un mix di funzioni lambda (funzioni anonime) e funzioni normali, evidenziando entrambi gli approcci.

```javascript
// Programma per EV3 MakeCode: Navigazione da A a B con evitamento ostacoli
// Utilizza funzioni lambda e normali per il controllo del robot

// Configurazione
const motorLeft = motors.largeA;
const motorRight = motors.largeB;
const ultrasonicSensor = sensors.ultrasonic4; // Sensore a ultrasuoni sulla porta 4

// Parametri di navigazione
const driveSpeed = 40;       // Velocità di avanzamento
const turnSpeed = 30;        // Velocità di rotazione
const obstacleThreshold = 15; // Distanza ostacolo in cm
const turnTime = 800;        // Tempo di rotazione in ms per circa 90 gradi
const distanceToPoint = 5000; // Tempo di percorrenza da A a B in ms

// Stato del robot
let isNavigating = false;
let hasObstacle = false;
let avoidanceStrategy = "right"; // Strategia di evitamento iniziale

// Funzioni di movimento di base (funzioni normali)
function stopMotors() {
    motorLeft.stop();
    motorRight.stop();
}

function driveForward() {
    motorLeft.run(driveSpeed);
    motorRight.run(driveSpeed);
}

function driveBackward() {
    motorLeft.run(-driveSpeed);
    motorRight.run(-driveSpeed);
}

function turnLeft() {
    motorLeft.run(-turnSpeed);
    motorRight.run(turnSpeed);
}

function turnRight() {
    motorLeft.run(turnSpeed);
    motorRight.run(-turnSpeed);
}

// Funzione di movimento con lambda
const move = {
    // Utilizza funzioni lambda per definire i movimenti
    stop: () => {
        stopMotors();
        return "stopped";
    },
    
    forward: (duration = 0) => {
        driveForward();
        if (duration > 0) {
            pause(duration);
            stopMotors();
        }
        return "forward";
    },
    
    backward: (duration = 0) => {
        driveBackward();
        if (duration > 0) {
            pause(duration);
            stopMotors();
        }
        return "backward";
    },
    
    left: (duration = 0) => {
        turnLeft();
        if (duration > 0) {
            pause(duration);
            stopMotors();
        }
        return "left";
    },
    
    right: (duration = 0) => {
        turnRight();
        if (duration > 0) {
            pause(duration);
            stopMotors();
        }
        return "right";
    }
};

// Funzione normale per evitare ostacoli
function avoidObstacle() {
    hasObstacle = true;
    brick.showString("Ostacolo rilevato!", 2);
    
    // Strategia di evitamento
    move.stop();
    pause(300);
    
    if (avoidanceStrategy === "right") {
        // Evita a destra
        move.right(turnTime);    // Ruota di 90 gradi a destra
        move.forward(1000);      // Avanza per 1 secondo
        move.left(turnTime);     // Ruota di 90 gradi a sinistra
        move.forward(1500);      // Avanza oltre l'ostacolo
        move.left(turnTime);     // Ruota di 90 gradi a sinistra
        move.forward(1000);      // Avanza per 1 secondo
        move.right(turnTime);    // Ruota di 90 gradi a destra
    } else {
        // Evita a sinistra
        move.left(turnTime);     // Ruota di 90 gradi a sinistra
        move.forward(1000);      // Avanza per 1 secondo
        move.right(turnTime);    // Ruota di 90 gradi a destra
        move.forward(1500);      // Avanza oltre l'ostacolo
        move.right(turnTime);    // Ruota di 90 gradi a destra
        move.forward(1000);      // Avanza per 1 secondo
        move.left(turnTime);     // Ruota di 90 gradi a sinistra
    }
    
    // Alterna la strategia per il prossimo ostacolo
    avoidanceStrategy = avoidanceStrategy === "right" ? "left" : "right";
    
    hasObstacle = false;
    brick.showString("Continuo navigazione", 2);
}

// Funzione lambda per controllare la presenza di ostacoli
const checkObstacle = () => {
    const distance = ultrasonicSensor.distance();
    
    if (distance < obstacleThreshold) {
        return true;
    }
    return false;
};

// Funzione di navigazione principale (combina normale e lambda)
function navigateToPointB() {
    isNavigating = true;
    brick.showString("Navigazione verso B", 1);
    
    // Funzione lambda per la navigazione continua
    const navigate = () => {
        if (!isNavigating) return;
        
        // Controlla ostacoli con una funzione lambda in linea
        const obstacleDetected = (() => {
            const distance = ultrasonicSensor.distance();
            return distance < obstacleThreshold;
        })();
        
        if (obstacleDetected && !hasObstacle) {
            avoidObstacle();
        } else if (!hasObstacle) {
            move.forward();
        }
    };
    
    // Avvio del timer per la navigazione
    control.runInParallel(() => {
        // Navigazione principale
        move.forward();
        
        // Imposta un intervallo per il controllo degli ostacoli
        control.runInBackground(() => {
            while (isNavigating) {
                navigate();
                pause(100);
            }
        });
        
        // Timer per il completamento della navigazione
        pause(distanceToPoint);
        
        // Quando il tempo è scaduto, siamo arrivati a destinazione
        if (isNavigating) {
            move.stop();
            isNavigating = false;
            brick.showString("Arrivato al punto B!", 1);
            brick.showString("                    ", 2);
        }
    });
}

// Funzione di arresto della navigazione (lambda)
const stopNavigation = () => {
    isNavigating = false;
    hasObstacle = false;
    move.stop();
    brick.showString("Navigazione fermata", 1);
    brick.showString("                    ", 2);
};

// Dimostra l'uso di una funzione di ordine superiore con lambda
const withTiming = (fn) => {
    return (...args) => {
        const startTime = control.millis();
        const result = fn(...args);
        const endTime = control.millis();
        brick.showString(`Tempo: ${endTime - startTime}ms`, 3);
        return result;
    };
};

// Esempio di composizione di funzioni con lambda
const safeNavigate = withTiming(navigateToPointB);

// Configurazione dei pulsanti EV3
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function() {
    if (!isNavigating) {
        safeNavigate();
    }
});

brick.buttonEsc.onEvent(ButtonEvent.Pressed, function() {
    stopNavigation();
});

// Funzione lambda per il test del sensore a ultrasuoni
brick.buttonLeft.onEvent(ButtonEvent.Pressed, () => {
    brick.showString("Test sensore US", 1);
    
    const getDistance = () => ultrasonicSensor.distance();
    
    // Usa una funzione lambda per mostrare continuamente la distanza
    control.runInParallel(() => {
        for (let i = 0; i < 50; i++) {
            const distance = getDistance();
            brick.showString(`Distanza: ${distance} cm`, 2);
            pause(100);
        }
        brick.showString("Test completato", 1);
        brick.showString("                ", 2);
    });
});

// Funzione di test dei movimenti (normale)
function testMovements() {
    brick.showString("Test movimenti", 1);
    
    // Array di movimenti da testare
    const movements = [
        { action: move.forward, duration: 500, name: "Avanti" },
        { action: move.backward, duration: 500, name: "Indietro" },
        { action: move.left, duration: 500, name: "Sinistra" },
        { action: move.right, duration: 500, name: "Destra" },
        { action: move.stop, duration: 500, name: "Stop" }
    ];
    
    // Esegui ogni movimento in sequenza
    control.runInParallel(() => {
        for (const m of movements) {
            brick.showString(`Test: ${m.name}`, 2);
            m.action(m.duration);
            pause(300);
        }
        brick.showString("Test completato", 1);
        brick.showString("                ", 2);
    });
}

// Associa il test dei movimenti al pulsante destro
brick.buttonRight.onEvent(ButtonEvent.Pressed, testMovements);

// Inizializzazione e istruzioni
brick.showString("Navigation A -> B", 1);
brick.showString("ENTER: Avvia", 2);
brick.showString("ESC: Ferma", 3);
brick.showString("SX: Test sensore", 4);
brick.showString("DX: Test movimenti", 5);

```

## Spiegazione del codice

Questo programma implementa un sistema di navigazione autonoma per un robot EV3 che si sposta da un punto A a un punto B evitando eventuali ostacoli lungo il percorso. Vediamo le caratteristiche principali e come sono state utilizzate le funzioni lambda e normali.

### Struttura del programma:

1. **Configurazione del robot**: Inizializzazione dei motori e sensori
2. **Funzioni di movimento**: Implementate sia come funzioni normali che lambda
3. **Sistema di rilevamento ostacoli**: Utilizza il sensore a ultrasuoni
4. **Funzioni di navigazione**: Gestiscono lo spostamento da A a B
5. **Funzioni di test**: Per verificare sensori e movimenti

### Utilizzo di funzioni lambda e normali:

#### Funzioni lambda (anonime)
Nel codice sono state utilizzate funzioni lambda in diversi contesti:

1. **Oggetto move**: Contiene funzioni lambda per i movimenti di base
   ```javascript
   const move = {
       stop: () => {
           stopMotors();
           return "stopped";
       },
       forward: (duration = 0) => { ... }
   };
   ```

2. **Controllo degli ostacoli**: Funzione lambda per verificare la presenza di ostacoli
   ```javascript
   const checkObstacle = () => {
       const distance = ultrasonicSensor.distance();
       return distance < obstacleThreshold;
   };
   ```

3. **Funzioni di ordine superiore**: Lambda che accetta altre funzioni come parametri
   ```javascript
   const withTiming = (fn) => {
       return (...args) => { ... };
   };
   ```

4. **Funzioni anonime in linea**: Lambda utilizzate direttamente dove servono
   ```javascript
   const obstacleDetected = (() => {
       const distance = ultrasonicSensor.distance();
       return distance < obstacleThreshold;
   })();
   ```

#### Funzioni normali (dichiarate)
Utilizzate per operazioni più complesse o strutturate:

1. **Funzioni di movimento di base**:
   ```javascript
   function stopMotors() {
       motorLeft.stop();
       motorRight.stop();
   }
   ```

2. **Funzione di evitamento ostacoli**:
   ```javascript
   function avoidObstacle() {
       hasObstacle = true;
       // Implementazione della strategia di evitamento
       // ...
   }
   ```

3. **Funzione principale di navigazione**:
   ```javascript
   function navigateToPointB() {
       isNavigating = true;
       // ...
   }
   ```

### Principali funzionalità:

1. **Navigazione da A a B**:
   - Il robot avanza verso il punto B per un tempo predefinito
   - Un timer simula il raggiungimento della destinazione

2. **Rilevamento e evitamento ostacoli**:
   - Il sensore a ultrasuoni monitora costantemente la distanza
   - Quando rileva un ostacolo, il robot esegue una manovra di evitamento
   - Alterna tra strategie di evitamento a destra e a sinistra

3. **Controllo del robot**:
   - Pulsante ENTER: Avvia la navigazione
   - Pulsante ESC: Interrompe la navigazione
   - Pulsante SINISTRA: Testa il sensore a ultrasuoni
   - Pulsante DESTRA: Testa i movimenti di base

4. **Funzionalità avanzate**:
   - Funzioni di ordine superiore per misurare il tempo di esecuzione
   - Composizione di funzioni per operazioni complesse
   - Gestione parallela dei controlli

### Confronto tra approcci:

Le funzioni lambda sono particolarmente utili per:
- Definire comportamenti brevi e concisi
- Creare callback per eventi
- Definire funzioni in-line dove vengono utilizzate
- Implementare funzioni di ordine superiore

Le funzioni normali sono più adatte per:
- Implementazioni complesse con molte operazioni
- Codice che richiede leggibilità e documentazione
- Funzionalità che vengono richiamate da più punti del codice

### Personalizzazione:

Il programma può essere facilmente adattato modificando:
- `driveSpeed` e `turnSpeed`: Velocità di movimento
- `obstacleThreshold`: Distanza di rilevamento ostacoli
- `turnTime`: Tempo di rotazione per gli angoli
- `distanceToPoint`: Tempo di percorrenza da A a B

Questo codice dimostra come combinare efficacemente diverse tecniche di programmazione (funzioni normali e lambda) per creare un sistema di navigazione autonoma flessibile e modulare per un robot EV3.