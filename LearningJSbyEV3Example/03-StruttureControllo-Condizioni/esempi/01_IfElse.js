// 01_IfElse.js
// Questo esempio mostra come utilizzare le istruzioni if/else per controllare
// il comportamento del robot EV3 in risposta a diverse condizioni ambientali

// Configurazione del sensore a ultrasuoni sulla porta 4
let sensoreUltrasuoni = sensors.ultrasonic4;

// Configurazione iniziale
brick.clearScreen();
brick.showString("Esempio If-Else", 1);
brick.showString("Robot in attesa...", 3);
brick.showString("Premi il pulsante centrale", 8);

// Variabili di configurazione
let velocitaBase = 50;
let distanzaSicurezza = 20; // distanza di sicurezza in cm
let tempoRotazione = 1000;  // tempo di rotazione in ms
let modoPaura = false;      // modalità con reazione accentuata agli ostacoli

// Funzione per controllare il robot in base alla distanza rilevata
function controllaRobot() {
    // Ottieni la distanza dell'ostacolo
    let distanza = sensoreUltrasuoni.distance();
    
    // Visualizza la distanza rilevata
    brick.clearScreen();
    brick.showString("Esempio If-Else", 1);
    brick.showString(`Distanza: ${distanza} cm`, 3);
    
    // Struttura if-else per decidere l'azione in base alla distanza
    if (distanza < 10) {
        // Ostacolo molto vicino - arresta e torna indietro
        brick.showString("PERICOLO! Ostacolo vicino", 5);
        brick.showString("Arresto e inversione", 6);
        
        // Arresta i motori
        motors.largeBC.stop();
        music.playSoundEffect(SoundEffect.EvilLaugh);
        pause(500);
        
        // Torna indietro
        motors.largeBC.tank(-velocitaBase, -velocitaBase);
        pause(1500);
        
        // Ruota per cambiare direzione
        motors.largeBC.tank(velocitaBase, -velocitaBase);
        pause(tempoRotazione);
    } else if (distanza < distanzaSicurezza) {
        // Ostacolo a distanza intermedia - rallenta e cambia direzione gradualmente
        brick.showString("Attenzione! Ostacolo", 5);
        brick.showString("Cambiamento direzione", 6);
        
        // Se siamo in modalità paura, reazione più accentuata
        if (modoPaura) {
            motors.largeBC.stop();
            music.playSoundEffect(SoundEffect.Boing);
            pause(300);
            motors.largeBC.tank(velocitaBase, -velocitaBase/2);
            pause(tempoRotazione/2);
        } else {
            // Altrimenti devia dolcemente
            motors.largeBC.tank(velocitaBase, velocitaBase/4);
        }
    } else if (distanza < 50) {
        // Ostacolo rilevato ma lontano - prosegui ma mantieni attenzione
        brick.showString("Ostacolo rilevato", 5);
        brick.showString("Procedo con attenzione", 6);
        
        // Procedi a velocità normale
        motors.largeBC.tank(velocitaBase, velocitaBase);
    } else {
        // Nessun ostacolo - procedi alla massima velocità
        brick.showString("Nessun ostacolo", 5);
        brick.showString("Velocità massima", 6);
        
        // Avanza a piena velocità
        motors.largeBC.tank(velocitaBase + 20, velocitaBase + 20);
    }
}

// Controllo dei pulsanti per interazione utente
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function() {
    // Avvio del programma principale con il ciclo di controllo
    music.playSoundEffect(SoundEffect.Ready);
    
    // Esegui il ciclo di controllo finché non viene premuto il pulsante di uscita
    forever(function() {
        controllaRobot();
        pause(100); // Pausa breve per non sovraccaricare il sistema
    });
});

// Pulsante Su: aumenta la distanza di sicurezza
brick.buttonUp.onEvent(ButtonEvent.Pressed, function() {
    distanzaSicurezza += 5;
    if (distanzaSicurezza > 50) distanzaSicurezza = 50;
    
    brick.clearScreen();
    brick.showString("Distanza di sicurezza:", 3);
    brick.showString(`${distanzaSicurezza} cm`, 4);
    pause(1000);
});

// Pulsante Giù: diminuisce la distanza di sicurezza
brick.buttonDown.onEvent(ButtonEvent.Pressed, function() {
    distanzaSicurezza -= 5;
    if (distanzaSicurezza < 10) distanzaSicurezza = 10;
    
    brick.clearScreen();
    brick.showString("Distanza di sicurezza:", 3);
    brick.showString(`${distanzaSicurezza} cm`, 4);
    pause(1000);
});

// Pulsante Destra: attiva/disattiva modalità paura
brick.buttonRight.onEvent(ButtonEvent.Pressed, function() {
    modoPaura = !modoPaura;
    
    brick.clearScreen();
    brick.showString("Modalità paura:", 3);
    brick.showString(modoPaura ? "ATTIVATA" : "DISATTIVATA", 4);
    
    if (modoPaura) {
        music.playSoundEffect(SoundEffect.Scared);
    } else {
        music.playSoundEffect(SoundEffect.Happy);
    }
    
    pause(1000);
});