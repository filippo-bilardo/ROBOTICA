// 04_DebuggingEsempio.js
// Questo esempio mostra come utilizzare tecniche di debugging
// per individuare e risolvere problemi nei programmi EV3

// Visualizza un messaggio di debug sul display
function debugMessage(messaggio, valore, riga) {
    // Mostra un messaggio di debug con il valore di una variabile
    brick.showString(messaggio + ": " + valore, riga);
}

// Definizione delle variabili principali
let velocitaSinistra = 50;
let velocitaDestra = 50;
let tempoRotazione = 1000; // millisecondi
let problemaSimulato = true; // Impostiamo a true per simulare un problema

// Mostra lo stato iniziale
brick.clearScreen();
brick.showString("Test di Debugging", 1);
debugMessage("Vel. sinistra", velocitaSinistra, 2);
debugMessage("Vel. destra", velocitaDestra, 3);
debugMessage("Problema simulato", problemaSimulato, 4);
pause(3000);

// Esempio di funzione che potrebbe contenere un bug
function ruotaRobot() {
    brick.clearScreen();
    brick.showString("Rotazione in corso...", 1);
    
    if (problemaSimulato) {
        // Simuliamo un bug: velocità sbagliata per un motore
        debugMessage("BUG: vel. destra", 0, 2); // Il bug è che impostiamo la velocità a 0
        motors.largeBC.tank(velocitaSinistra, 0); // Bug: il secondo motore ha velocità 0
    } else {
        // Versione corretta
        debugMessage("Vel. sinistra", velocitaSinistra, 2);
        debugMessage("Vel. destra", velocitaDestra, 3);
        motors.largeBC.tank(velocitaSinistra, velocitaDestra);
    }
    
    pause(tempoRotazione);
    motors.largeBC.stop();
}

// Esecuzione della funzione problematica
ruotaRobot();

// Verifica del problema
brick.clearScreen();
brick.showString("Test completato", 1);
brick.showString("Il robot ha ruotato", 2);
brick.showString("correttamente?", 3);
pause(2000);

// Risoluzione del problema
brick.clearScreen();
brick.showString("Correzione bug...", 1);
problemaSimulato = false;
debugMessage("Problema simulato", problemaSimulato, 2);
pause(2000);

// Riesecuzione con la correzione
brick.clearScreen();
brick.showString("Riprova con fix...", 1);
ruotaRobot();

// Verifica finale
brick.clearScreen();
brick.showString("Test completato", 1);
brick.showString("Problema risolto!", 2);
music.playSoundEffect(SoundEffect.Triumph);

// Esempio di ciclo di debug per sensore
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
    brick.clearScreen();
    brick.showString("Debug sensori", 1);
    brick.showString("Premi un pulsante", 2);
    brick.showString("per uscire", 3);
    
    // Ciclo che mostra continuamente i valori del sensore
    // Utile per il debug di sensori problematici
    let contatore = 0;
    let esci = false;
    
    brick.buttonEsc.onEvent(ButtonEvent.Pressed, function () {
        esci = true;
    });
    
    while (!esci) {
        contatore++;
        
        // Leggi e mostra i valori dei sensori
        let valoreLuce = sensors.color1.light();
        let distanza = sensors.ultrasonic4.distance();
        
        brick.clearScreen();
        brick.showString("Debug sensori", 1);
        debugMessage("Ciclo", contatore, 2);
        debugMessage("Luce", valoreLuce, 3);
        debugMessage("Distanza", distanza, 4);
        
        // Pausa breve per non sovraccaricare il display
        pause(200);
    }
    
    // Fine del debug
    brick.clearScreen();
    brick.showString("Debug terminato", 1);
});