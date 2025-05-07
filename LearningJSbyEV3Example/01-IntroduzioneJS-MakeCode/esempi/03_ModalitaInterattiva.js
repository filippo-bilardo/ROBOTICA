// 03_ModalitaInterattiva.js
// Questo esempio mostra come utilizzare la modalità interattiva di MakeCode
// per controllare il robot in tempo reale

// Configurazione iniziale delle variabili
let velocita = 50;
let statoRobot = "Fermo";

// Funzione per aggiornare il display
function aggiornaDisplay() {
    brick.clearScreen();
    brick.showString("Controllo Interattivo", 1);
    brick.showString("Stato: " + statoRobot, 2);
    brick.showString("Velocita: " + velocita, 3);
    brick.showString("Su/Giu: vel. +-10", 4);
}

// Visualizza le istruzioni iniziali
aggiornaDisplay();

// Pulsante Su: aumenta la velocità
brick.buttonUp.onEvent(ButtonEvent.Pressed, function () {
    if (velocita < 100) {
        velocita += 10;
        aggiornaDisplay();
    }
});

// Pulsante Giù: diminuisce la velocità
brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    if (velocita > 10) {
        velocita -= 10;
        aggiornaDisplay();
    }
});

// Pulsante Sinistra: muove il robot a sinistra
brick.buttonLeft.onEvent(ButtonEvent.Pressed, function () {
    statoRobot = "Girando a sinistra";
    aggiornaDisplay();
    motors.largeBC.tank(-velocita, velocita);
});

brick.buttonLeft.onEvent(ButtonEvent.Released, function () {
    statoRobot = "Fermo";
    aggiornaDisplay();
    motors.largeBC.stop();
});

// Pulsante Destra: muove il robot a destra
brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {
    statoRobot = "Girando a destra";
    aggiornaDisplay();
    motors.largeBC.tank(velocita, -velocita);
});

brick.buttonRight.onEvent(ButtonEvent.Released, function () {
    statoRobot = "Fermo";
    aggiornaDisplay();
    motors.largeBC.stop();
});

// Pulsante Centrale: muove il robot in avanti
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
    statoRobot = "Avanti";
    aggiornaDisplay();
    motors.largeBC.tank(velocita, velocita);
});

brick.buttonEnter.onEvent(ButtonEvent.Released, function () {
    statoRobot = "Fermo";
    aggiornaDisplay();
    motors.largeBC.stop();
});

// Utilizzo di un sensore per fermare il robot in emergenza
// Se il robot ha un sensore di tocco sulla porta 1
sensors.touch1.onEvent(ButtonEvent.Pressed, function () {
    statoRobot = "STOP EMERGENZA!";
    brick.clearScreen();
    brick.showString(statoRobot, 1);
    brick.showString("Sensore premuto", 2);
    motors.largeBC.stop();
    music.playSoundEffect(SoundEffect.WarpingOut);
    pause(2000);
    aggiornaDisplay();
});