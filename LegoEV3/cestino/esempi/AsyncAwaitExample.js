// ===== ESEMPI DI PROGRAMMAZIONE ASINCRONA PER LEGO EV3 MAKECODE =====
// Questo file dimostra l'uso di Promise e async/await nella programmazione
// dei robot LEGO EV3 usando JavaScript in MakeCode

// ==== CONFIGURAZIONE ====
// Definizione dei motori e sensori
const leftMotor = motors.largeA;
const rightMotor = motors.largeB;
const colorSensor = sensors.color1;  // Sensore di colore sulla porta 1
const distanceSensor = sensors.ultrasonic4;  // Sensore a ultrasuoni sulla porta 4
const touchSensor = sensors.touch3;  // Sensore touch sulla porta 3

// Parametri di configurazione
const baseSpeed = 40;  // Velocità base del robot
const turnSpeed = 30;  // Velocità di rotazione
const obstacleDistance = 15;  // Distanza minima ostacolo (cm)

// ==== IMPLEMENTAZIONE DI PROMISE PER OPERAZIONI ROBOTICHE ====

/**
 * Crea una Promise che si risolve dopo un certo tempo
 * @param {number} ms - Millisecondi da attendere
 * @returns {Promise} Promise che si risolve dopo il tempo specificato
 */
function delay(ms) {
    return new Promise(resolve => {
        pause(ms);
        resolve();
    });
}

/**
 * Muove il robot in avanti per un certo tempo e restituisce una Promise
 * @param {number} speed - Velocità dei motori
 * @param {number} timeMs - Tempo in millisecondi
 * @returns {Promise} Promise che si risolve quando il movimento è completato
 */
function moveForwardAsync(speed, timeMs) {
    return new Promise(resolve => {
        brick.showString("Avanti...", 2);
        leftMotor.run(speed);
        rightMotor.run(speed);
        
        delay(timeMs).then(() => {
            leftMotor.stop();
            rightMotor.stop();
            resolve();
        });
    });
}

/**
 * Gira il robot a sinistra e restituisce una Promise
 * @param {number} speed - Velocità di rotazione
 * @param {number} timeMs - Tempo in millisecondi
 * @returns {Promise} Promise che si risolve quando la rotazione è completata
 */
function turnLeftAsync(speed, timeMs) {
    return new Promise(resolve => {
        brick.showString("Sinistra...", 2);
        leftMotor.run(-speed);
        rightMotor.run(speed);
        
        delay(timeMs).then(() => {
            leftMotor.stop();
            rightMotor.stop();
            resolve();
        });
    });
}

/**
 * Gira il robot a destra e restituisce una Promise
 * @param {number} speed - Velocità di rotazione
 * @param {number} timeMs - Tempo in millisecondi
 * @returns {Promise} Promise che si risolve quando la rotazione è completata
 */
function turnRightAsync(speed, timeMs) {
    return new Promise(resolve => {
        brick.showString("Destra...", 2);
        leftMotor.run(speed);
        rightMotor.run(-speed);
        
        delay(timeMs).then(() => {
            leftMotor.stop();
            rightMotor.stop();
            resolve();
        });
    });
}

/**
 * Ferma il robot e restituisce una Promise
 * @returns {Promise} Promise che si risolve quando il robot è fermo
 */
function stopAsync() {
    return new Promise(resolve => {
        brick.showString("Stop", 2);
        leftMotor.stop();
        rightMotor.stop();
        resolve();
    });
}

/**
 * Verifica la presenza di ostacoli e restituisce una Promise
 * @returns {Promise<boolean>} Promise che si risolve con true se c'è un ostacolo
 */
function checkObstacleAsync() {
    return new Promise(resolve => {
        const distance = distanceSensor.distance();
        brick.showString(`Distanza: ${distance}cm`, 3);
        resolve(distance < obstacleDistance);
    });
}

/**
 * Aspetta fino a quando viene premuto il sensore touch
 * @returns {Promise} Promise che si risolve quando il sensore viene premuto
 */
function waitForTouchAsync() {
    return new Promise(resolve => {
        brick.showString("Attendo pressione...", 2);
        
        // Creiamo un controllo periodico dello stato del sensore
        control.runInParallel(() => {
            while (!touchSensor.isPressed()) {
                pause(50);
            }
            resolve();
        });
    });
}

/**
 * Attende finché non viene rilevato un certo colore
 * @param {ColorSensorColor} targetColor - Il colore da rilevare
 * @returns {Promise} Promise che si risolve quando il colore viene rilevato
 */
function waitForColorAsync(targetColor) {
    return new Promise(resolve => {
        brick.showString("Attendo colore...", 2);
        
        control.runInParallel(() => {
            while (colorSensor.color() !== targetColor) {
                pause(50);
            }
            resolve();
        });
    });
}

// ==== UTILIZZO DI PROMISE CON THEN/CATCH ====

/**
 * Esempio di sequenza di movimenti usando Promise con then/catch
 */
function demoPromiseChain() {
    brick.showString("Demo Promise Chain", 1);
    
    // Creiamo una catena di Promise per una sequenza di movimenti
    moveForwardAsync(baseSpeed, 2000)
        .then(() => turnRightAsync(turnSpeed, 800))
        .then(() => moveForwardAsync(baseSpeed, 1500))
        .then(() => turnLeftAsync(turnSpeed, 800))
        .then(() => moveForwardAsync(baseSpeed, 1000))
        .then(() => {
            brick.showString("Sequenza completata!", 1);
            return checkObstacleAsync();
        })
        .then(hasObstacle => {
            if (hasObstacle) {
                brick.showString("Ostacolo rilevato!", 2);
                return stopAsync();
            } else {
                brick.showString("Percorso libero", 2);
                return moveForwardAsync(baseSpeed, 1000);
            }
        })
        .catch(error => {
            brick.showString("Errore: " + error, 1);
        })
        .finally(() => {
            brick.showString("Fine demo", 2);
        });
}

// ==== UTILIZZO DI ASYNC/AWAIT ====

/**
 * Esempio di sequenza di comandi usando async/await
 */
async function demoAsyncAwait() {
    brick.showString("Demo Async/Await", 1);
    
    try {
        // Attendi la pressione del sensore touch per iniziare
        brick.showString("Premi per iniziare", 2);
        await waitForTouchAsync();
        
        // Sequenza di movimenti con async/await
        brick.showString("Inizio sequenza", 2);
        await moveForwardAsync(baseSpeed, 2000);
        
        // Controlla la presenza di ostacoli
        const hasObstacle = await checkObstacleAsync();
        
        if (hasObstacle) {
            // Strategia di evitamento ostacoli
            brick.showString("Evito ostacolo", 2);
            await turnRightAsync(turnSpeed, 1000);
            await moveForwardAsync(baseSpeed, 1500);
            await turnLeftAsync(turnSpeed, 1000);
        } else {
            // Continua il percorso
            await turnLeftAsync(turnSpeed, 800);
            await moveForwardAsync(baseSpeed, 1500);
        }
        
        // Attende finché non rileva un colore specifico
        brick.showString("Cerco linea nera", 2);
        await waitForColorAsync(ColorSensorColor.Black);
        brick.showString("Linea trovata!", 2);
        
        // Completa la sequenza
        await turnRightAsync(turnSpeed, 800);
        await moveForwardAsync(baseSpeed, 1000);
        await stopAsync();
        
        brick.showString("Sequenza completata!", 1);
    } catch (error) {
        brick.showString("Errore: " + error, 1);
    } finally {
        // Assicurati che il robot si fermi in ogni caso
        leftMotor.stop();
        rightMotor.stop();
        brick.showString("Demo terminata", 2);
    }
}

// ==== FUNZIONE DIMOSTRATIVA AVANZATA CON ASYNC/AWAIT ====

/**
 * Segue una linea nera finché non trova un marker colorato
 * Utilizza async/await per una migliore leggibilità
 */
async function lineFollowUntilMarkerAsync() {
    brick.showString("Line Follow Demo", 1);
    
    // Parametri per il seguilinea
    const threshold = 30;  // Soglia per rilevamento linea
    const maxAttempts = 100;  // Numero massimo di iterazioni
    
    try {
        let iterations = 0;
        let foundMarker = false;
        
        // Loop principale del seguilinea
        while (iterations < maxAttempts && !foundMarker) {
            // Lettura del sensore
            const lightValue = colorSensor.light(LightIntensityMode.Reflected);
            const currentColor = colorSensor.color();
            
            brick.showString(`Luce: ${lightValue}`, 3);
            
            // Controlla se ha trovato un marker colorato
            if (currentColor === ColorSensorColor.Red || 
                currentColor === ColorSensorColor.Blue ||
                currentColor === ColorSensorColor.Green) {
                // Ha trovato un marker colorato - interrompe il seguilinea
                foundMarker = true;
                
                brick.showString(`Marker trovato: ${currentColor}`, 2);
                await stopAsync();
                
                // Esegue azioni diverse in base al colore
                if (currentColor === ColorSensorColor.Red) {
                    await turnRightAsync(turnSpeed, 1000);
                } else if (currentColor === ColorSensorColor.Blue) {
                    await turnLeftAsync(turnSpeed, 1000);
                } else if (currentColor === ColorSensorColor.Green) {
                    await moveForwardAsync(baseSpeed, 2000);
                }
                
                break;
            }
            
            // Algoritmo seguilinea base
            if (lightValue < threshold) {
                // Sulla linea nera
                leftMotor.run(baseSpeed);
                rightMotor.run(baseSpeed - 15);
            } else {
                // Fuori dalla linea nera
                leftMotor.run(baseSpeed - 15);
                rightMotor.run(baseSpeed);
            }
            
            // Controlla la presenza di ostacoli
            const obstacleDetected = await checkObstacleAsync();
            if (obstacleDetected) {
                brick.showString("Ostacolo!", 2);
                
                // Manovra di evitamento semplice
                await stopAsync();
                await turnRightAsync(turnSpeed, 800);
                await moveForwardAsync(baseSpeed, 1000);
                await turnLeftAsync(turnSpeed, 800);
            }
            
            // Breve pausa per non sovraccaricare il sistema
            await delay(50);
            iterations++;
        }
        
        if (!foundMarker) {
            brick.showString("Nessun marker trovato", 2);
        }
        
        await stopAsync();
        brick.showString("Demo completata", 1);
    } catch (error) {
        brick.showString("Errore: " + error, 1);
        leftMotor.stop();
        rightMotor.stop();
    }
}

// ==== FUNZIONI PARALLELE E GESTIONE CONDIVISA DELLO STATO ====

/**
 * Dimostra come eseguire operazioni asincrone in parallelo
 * e condividere lo stato tra di esse
 */
async function demoParallelAsync() {
    brick.showString("Demo Parallelo", 1);
    
    // Stato condiviso
    const state = {
        running: true,
        obstacleDetected: false,
        currentColor: null
    };
    
    try {
        // Funzione per monitorare continuamente gli ostacoli
        const obstacleMonitor = async () => {
            while (state.running) {
                state.obstacleDetected = await checkObstacleAsync();
                
                if (state.obstacleDetected) {
                    brick.showString("Ostacolo rilevato!", 2);
                } else {
                    brick.showString("Percorso libero", 2);
                }
                
                await delay(300);
            }
        };
        
        // Funzione per monitorare continuamente i colori
        const colorMonitor = async () => {
            while (state.running) {
                state.currentColor = colorSensor.color();
                brick.showString(`Colore: ${state.currentColor}`, 4);
                await delay(300);
            }
        };
        
        // Avvia i monitor in background
        control.runInParallel(() => obstacleMonitor());
        control.runInParallel(() => colorMonitor());
        
        // Sequenza principale che utilizza le informazioni dai monitor
        for (let i = 0; i < 5 && state.running; i++) {
            brick.showString(`Sequenza ${i+1}/5`, 1);
            
            // Decide cosa fare in base allo stato
            if (state.obstacleDetected) {
                // Evita l'ostacolo
                await turnRightAsync(turnSpeed, 800);
                await moveForwardAsync(baseSpeed, 1000);
                await turnLeftAsync(turnSpeed, 800);
            } else if (state.currentColor === ColorSensorColor.Red) {
                // Ferma il robot se vede rosso
                await stopAsync();
                await delay(1000);
            } else {
                // Movimento normale
                await moveForwardAsync(baseSpeed, 1000);
                await turnRightAsync(turnSpeed * 0.8, 500);
            }
        }
        
        // Termina l'esecuzione
        state.running = false;
        await stopAsync();
        brick.showString("Demo completata", 1);
    } catch (error) {
        state.running = false;
        brick.showString("Errore: " + error, 1);
        leftMotor.stop();
        rightMotor.stop();
    }
}

// ==== CONFIGURAZIONE DEI PULSANTI ====

// Pulsante ENTER: Demo con async/await
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function() {
    control.runInParallel(() => demoAsyncAwait());
});

// Pulsante UP: Demo seguilinea con marker
brick.buttonUp.onEvent(ButtonEvent.Pressed, function() {
    control.runInParallel(() => lineFollowUntilMarkerAsync());
});

// Pulsante RIGHT: Demo con Promise chain
brick.buttonRight.onEvent(ButtonEvent.Pressed, function() {
    demoPromiseChain();
});

// Pulsante DOWN: Demo con operazioni parallele
brick.buttonDown.onEvent(ButtonEvent.Pressed, function() {
    control.runInParallel(() => demoParallelAsync());
});

// Pulsante ESC: Ferma tutti i motori
brick.buttonEsc.onEvent(ButtonEvent.Pressed, function() {
    leftMotor.stop();
    rightMotor.stop();
    brick.showString("STOP", 1);
    brick.clearScreen();
});

// ==== ISTRUZIONI INIZIALI ====
brick.showString("ASYNC/AWAIT DEMO", 1);
brick.showString("ENTER: Demo base", 2);
brick.showString("UP: Seguilinea avanzato", 3);
brick.showString("RIGHT: Promise chain", 4);
brick.showString("DOWN: Operazioni parallele", 5);
brick.showString("ESC: Stop", 6);