Ecco un esempio di programmazione funzionale JavaScript per la piattaforma LEGO EV3 MakeCode, che utilizza i principi della programmazione funzionale come funzioni pure, composizione, immutabilità e funzioni di ordine superiore.

```javascript
// ==== PROGRAMMAZIONE FUNZIONALE CON EV3 MAKECODE ====
// Questo esempio mostra come applicare i principi della programmazione funzionale
// in un robot EV3 che segue una linea e rileva ostacoli

// ==== CONFIGURAZIONE ====
const config = {
    // Porte dei sensori
    colorSensorPort: 1,           // Porta del sensore di colore
    ultrasonicSensorPort: 2,      // Porta del sensore a ultrasuoni
    
    // Porte dei motori
    leftMotorPort: MotorPort.A,   // Porta del motore sinistro
    rightMotorPort: MotorPort.B,  // Porta del motore destro
    
    // Parametri operativi
    threshold: 30,                // Soglia per la rilevazione della linea
    obstacleDistance: 10,         // Distanza minima per rilevare un ostacolo (cm)
    baseSpeed: 30,                // Velocità di base
    turnMultiplier: 0.7           // Moltiplicatore per la rotazione
};

// ==== FUNZIONI PURE ====

// Funzione pura che restituisce lo stato del sensore di luce
const getLightReading = () => 
    sensors[`color${config.colorSensorPort}`].light(LightIntensityMode.Reflected);

// Funzione pura che restituisce la distanza dal sensore a ultrasuoni
const getDistanceReading = () => 
    sensors[`ultrasonic${config.ultrasonicSensorPort}`].distance();

// Funzione pura per calcolare le velocità dei motori per il seguilinea
const calculateLineFollowSpeeds = (lightValue) => {
    const error = lightValue - config.threshold;
    const turnAmount = error * config.turnMultiplier;
    
    return {
        leftSpeed: config.baseSpeed - turnAmount,
        rightSpeed: config.baseSpeed + turnAmount
    };
};

// Funzione pura per determinare se c'è un ostacolo
const isObstacleDetected = (distance) => 
    distance < config.obstacleDistance;

// Funzione pura che genera una sequenza di comandi per evitare un ostacolo
const generateAvoidanceCommands = () => [
    { action: 'stop', duration: 200 },
    { action: 'turnRight', duration: 800 },
    { action: 'forward', duration: 1500 },
    { action: 'turnLeft', duration: 800 },
    { action: 'forward', duration: 800 },
    { action: 'turnLeft', duration: 400 },
    { action: 'forward', duration: 800 },
    { action: 'turnRight', duration: 400 }
];

// ==== FUNZIONI DI ORDINE SUPERIORE ====

// Funzione che applica una funzione a intervalli regolari
const repeatedly = (fn, interval) => {
    control.runInParallel(() => {
        while (true) {
            fn();
            pause(interval);
        }
    });
};

// Funzione di ordine superiore per eseguire una sequenza di comandi
const executeSequence = (commands) => {
    commands.forEach(cmd => {
        switch (cmd.action) {
            case 'stop':
                setMotorSpeeds(0, 0);
                break;
            case 'forward':
                setMotorSpeeds(config.baseSpeed, config.baseSpeed);
                break;
            case 'turnRight':
                setMotorSpeeds(config.baseSpeed, -config.baseSpeed);
                break;
            case 'turnLeft':
                setMotorSpeeds(-config.baseSpeed, config.baseSpeed);
                break;
        }
        pause(cmd.duration);
    });
};

// Funzione di composizione per eseguire una sequenza di funzioni
const pipe = (...fns) => (initialValue) => 
    fns.reduce((value, fn) => fn(value), initialValue);

// ==== FUNZIONI DI EFFETTO (IMPURE) ====

// Impostazione delle velocità dei motori (funzione impura - effetto collaterale)
const setMotorSpeeds = (leftSpeed, rightSpeed) => {
    motors[`large${String.fromCharCode(64 + config.leftMotorPort)}`].run(leftSpeed);
    motors[`large${String.fromCharCode(64 + config.rightMotorPort)}`].run(rightSpeed);
    return { leftSpeed, rightSpeed }; // Restituisce lo stato per mantenere la catena funzionale
};

// Visualizza un messaggio sullo schermo (funzione impura - effetto collaterale)
const displayMessage = (message, line = 1) => {
    brick.showString(message, line);
    return message; // Restituisce il messaggio per mantenere la catena funzionale
};

// ==== FUNZIONI COMPOSITE ====

// Funzione che gestisce il seguilinea
const handleLineFollowing = () => {
    const lightValue = getLightReading();
    const { leftSpeed, rightSpeed } = calculateLineFollowSpeeds(lightValue);
    setMotorSpeeds(leftSpeed, rightSpeed);
    return { lightValue, leftSpeed, rightSpeed };
};

// Funzione che gestisce il rilevamento ostacoli
const handleObstacleDetection = () => {
    const distance = getDistanceReading();
    
    if (isObstacleDetected(distance)) {
        displayMessage("Ostacolo rilevato!");
        const commands = generateAvoidanceCommands();
        executeSequence(commands);
        displayMessage("Continuo a seguire");
    }
    
    return distance;
};

// Funzione per calibrare il sensore di colore
const calibrateLightSensor = () => {
    displayMessage("Calibrazione...");
    displayMessage("Su superficie chiara", 2);
    pause(3000);
    
    const lightValue = getLightReading();
    
    displayMessage("Sulla linea nera", 2);
    pause(3000);
    
    const darkValue = getLightReading();
    
    // Approccio funzionale: creiamo un nuovo oggetto config anziché modificare l'esistente
    const newConfig = { ...config, threshold: (lightValue + darkValue) / 2 };
    
    // In un ambiente realmente immutabile, dovremmo restituire il nuovo config
    // e utilizzarlo. Per semplicità, qui facciamo un'eccezione all'immutabilità.
    config.threshold = newConfig.threshold;
    
    displayMessage(`Soglia: ${config.threshold.toFixed(1)}`, 2);
    pause(2000);
    
    return newConfig;
};

// ==== GESTIONE EVENTI (MODEL-VIEW-UPDATE PATTERN) ====

// Definiamo uno stato immutabile del sistema
let state = {
    running: false,
    mode: 'idle',
    lastLightValue: 0,
    lastDistance: 100
};

// Funzione pura per calcolare il nuovo stato
const updateState = (currentState, event) => {
    switch (event.type) {
        case 'START':
            return { ...currentState, running: true, mode: 'following' };
        case 'STOP':
            return { ...currentState, running: false, mode: 'idle' };
        case 'CALIBRATE':
            return { ...currentState, mode: 'calibrating' };
        case 'SENSOR_UPDATE':
            return { 
                ...currentState, 
                lastLightValue: event.lightValue || currentState.lastLightValue,
                lastDistance: event.distance || currentState.lastDistance
            };
        default:
            return currentState;
    }
};

// Funzione per gestire gli effetti basati sul nuovo stato
const handleEffects = (newState, oldState) => {
    if (newState.running && !oldState.running) {
        // Il robot è stato appena avviato
        displayMessage("Robot in esecuzione");
        startRobotLoop();
    } else if (!newState.running && oldState.running) {
        // Il robot è stato appena fermato
        displayMessage("Robot fermato");
        setMotorSpeeds(0, 0);
    }
    
    if (newState.mode === 'calibrating' && oldState.mode !== 'calibrating') {
        calibrateLightSensor();
    }
    
    return newState;
};

// Funzione per emettere eventi
const dispatch = (event) => {
    const oldState = state;
    const newState = updateState(state, event);
    state = handleEffects(newState, oldState);
};

// ==== LOOP PRINCIPALE ====

// Funzione per il loop principale del robot
const startRobotLoop = () => {
    repeatedly(() => {
        if (state.running) {
            // Approccio funzionale: composizione di funzioni
            pipe(
                handleLineFollowing,
                result => {
                    dispatch({ 
                        type: 'SENSOR_UPDATE', 
                        lightValue: result.lightValue 
                    });
                    return result;
                },
                handleObstacleDetection,
                distance => {
                    dispatch({ 
                        type: 'SENSOR_UPDATE', 
                        distance 
                    });
                }
            )();
        }
    }, 50);
};

// ==== REGISTRAZIONE EVENTI UI ====

// Pulsante ENTER: avvia il robot
brick.buttonEnter.onEvent(ButtonEvent.Pressed, () => {
    dispatch({ type: 'START' });
});

// Pulsante ESC: ferma il robot
brick.buttonEsc.onEvent(ButtonEvent.Pressed, () => {
    dispatch({ type: 'STOP' });
});

// Pulsante LEFT: calibra il sensore
brick.buttonLeft.onEvent(ButtonEvent.Pressed, () => {
    dispatch({ type: 'CALIBRATE' });
});

// Pulsante RIGHT: mostra lo stato corrente
brick.buttonRight.onEvent(ButtonEvent.Pressed, () => {
    displayMessage(`Luce: ${state.lastLightValue}`, 2);
    displayMessage(`Dist: ${state.lastDistance}`, 3);
    pause(2000);
});

// ==== AVVIO ====
brick.showString("Prog. Funzionale EV3", 1);
brick.showString("ENTER: avvia", 2);
brick.showString("ESC: ferma", 3);
brick.showString("SX: calibra, DX: stato", 4);

```

## Spiegazione dei principi di programmazione funzionale utilizzati

Questo esempio dimostra come applicare i principi della programmazione funzionale a un robot EV3 che segue una linea e evita ostacoli. Ecco una spiegazione dettagliata dei concetti funzionali implementati:

### 1. Funzioni pure
Nel codice, ho separato chiaramente le funzioni pure (che non hanno effetti collaterali) dalle funzioni impure:

- `getLightReading()`: Restituisce il valore del sensore di luce senza modificare lo stato
- `getDistanceReading()`: Restituisce la distanza dal sensore a ultrasuoni
- `calculateLineFollowSpeeds()`: Calcola le velocità dei motori in base al valore del sensore
- `isObstacleDetected()`: Determina se c'è un ostacolo in base alla distanza
- `generateAvoidanceCommands()`: Genera una sequenza di comandi per evitare un ostacolo

### 2. Immutabilità
Il codice mantiene l'immutabilità dove possibile:

- `config` è un oggetto immutabile che contiene tutte le configurazioni
- Durante la calibrazione, creo un nuovo oggetto config anziché modificare quello esistente
- Lo stato del robot viene aggiornato creando nuovi oggetti state tramite spread operator: `{...currentState, ...changes}`

### 3. Funzioni di ordine superiore
Diverse funzioni accettano altre funzioni come parametri o le restituiscono:

- `repeatedly()`: Esegue una funzione a intervalli regolari
- `executeSequence()`: Accetta un array di comandi e li esegue in sequenza
- `pipe()`: Implementa la composizione di funzioni

### 4. Composizione di funzioni
La composizione è usata per combinare funzioni più piccole in funzioni più complesse:

- `pipe()` permette di combinare sequenze di funzioni
- Nel loop principale, le diverse funzioni sono composte insieme per creare il comportamento del robot

### 5. Pattern Model-View-Update
Ho implementato una semplice versione del pattern funzionale Model-View-Update (simile a Redux o Elm):

- `state`: Rappresenta lo stato immutabile del sistema
- `updateState()`: Funzione pura che calcola il nuovo stato in base agli eventi
- `handleEffects()`: Gestisce gli effetti collaterali in base ai cambiamenti di stato
- `dispatch()`: Emette eventi che aggiornano lo stato

### 6. Gestione degli effetti
Gli effetti collaterali sono isolati in funzioni specifiche:

- `setMotorSpeeds()`: Imposta le velocità dei motori
- `displayMessage()`: Mostra messaggi sullo schermo

### 7. Interfaccia dichiarativa
L'approccio è dichiarativo (cosa fare) piuttosto che imperativo (come farlo):

- Le operazioni del robot sono descritte ad alto livello
- Gli eventi dell'interfaccia utente sono gestiti tramite il pattern di dispatching degli eventi

### Vantaggi di questo approccio per la programmazione EV3:

1. **Maggiore modularità**: Funzioni piccole e focalizzate facili da testare e riutilizzare
2. **Meno bug**: L'immutabilità e le funzioni pure riducono gli effetti collaterali imprevisti
3. **Flusso di dati chiaro**: È facile seguire come i dati fluiscono attraverso il programma
4. **Manutenibilità migliorata**: La separazione tra logica ed effetti rende il codice più facile da capire e modificare
5. **Testabilità**: Le funzioni pure sono facilmente testabili

Questa implementazione mostra come i principi della programmazione funzionale possano essere applicati efficacemente anche in contesti di robotica e programmazione fisica come LEGO EV3, portando a un codice più pulito, modulare e manutenibile.

Vuoi approfondire qualche aspetto specifico di questo approccio funzionale con EV3?