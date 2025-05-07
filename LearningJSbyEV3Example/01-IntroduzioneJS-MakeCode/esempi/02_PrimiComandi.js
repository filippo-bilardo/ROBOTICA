// 02_PrimiComandi.js
// Questo esempio mostra i comandi base per controllare un robot EV3
// Impariamo a muovere i motori e a utilizzare i pulsanti del brick

// Mostra un messaggio di benvenuto
brick.showString("Primi Comandi EV3", 1);
brick.showString("Premi il pulsante", 2);
brick.showString("centrale per iniziare", 3);

// Aspetta che l'utente prema il pulsante centrale
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
    // Pulisce lo schermo
    brick.clearScreen();
    
    // Mostra cosa sta per fare il robot
    brick.showString("Movimento in avanti", 1);
    
    // Movimento in avanti per 2 secondi
    motors.largeBC.tank(50, 50);
    pause(2000);
    motors.largeBC.stop();
    
    // Mostra il prossimo movimento
    brick.clearScreen();
    brick.showString("Rotazione", 1);
    
    // Rotazione a destra
    motors.largeBC.tank(50, -50);
    pause(1000);
    motors.largeBC.stop();
    
    // Mostra il prossimo movimento
    brick.clearScreen();
    brick.showString("Movimento all'indietro", 1);
    
    // Movimento all'indietro
    motors.largeBC.tank(-50, -50);
    pause(2000);
    motors.largeBC.stop();
    
    // Segnala la fine del programma
    brick.clearScreen();
    brick.showString("Programma completato!", 1);
    music.playSoundEffect(SoundEffect.Triumph);
});

// Premere il pulsante di sinistra per controllare il motore sinistro
brick.buttonLeft.onEvent(ButtonEvent.Pressed, function () {
    brick.clearScreen();
    brick.showString("Motore B attivo", 1);
    motors.largeB.run(50);
});

brick.buttonLeft.onEvent(ButtonEvent.Released, function () {
    motors.largeB.stop();
    brick.clearScreen();
    brick.showString("Primi Comandi EV3", 1);
});

// Premere il pulsante di destra per controllare il motore destro
brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {
    brick.clearScreen();
    brick.showString("Motore C attivo", 1);
    motors.largeC.run(50);
});

brick.buttonRight.onEvent(ButtonEvent.Released, function () {
    motors.largeC.stop();
    brick.clearScreen();
    brick.showString("Primi Comandi EV3", 1);
});