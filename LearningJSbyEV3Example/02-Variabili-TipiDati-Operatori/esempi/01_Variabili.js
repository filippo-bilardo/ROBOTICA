// 01_Variabili.js
// Questo esempio mostra come utilizzare le variabili per controllare il robot EV3
// Le variabili ci permettono di memorizzare e modificare valori durante l'esecuzione

// Dichiarazione di variabili per le configurazioni base
let velocitaBase = 50;            // Velocità standard del robot
let tempoMovimento = 2000;        // Tempo di movimento in millisecondi
let tempoRotazione = 1000;        // Tempo di rotazione in millisecondi
let attesaTraMovimenti = 500;     // Pausa tra un movimento e l'altro

// Dichiarazione di costanti
const VELOCITA_MASSIMA = 100;     // Velocità massima consentita
const MOTORE_SINISTRO = "B";      // Porta del motore sinistro
const MOTORE_DESTRO = "C";        // Porta del motore destro

// Visualizzazione dei valori iniziali
brick.clearScreen();
brick.showString("Controllo con Variabili", 1);
brick.showString(`Velocita: ${velocitaBase}`, 2);
brick.showString(`Tempo movimento: ${tempoMovimento}ms`, 3);
brick.showString("Premi il pulsante centrale", 8);

// Aspetta che l'utente prema il pulsante centrale per iniziare
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
    // Movimento in avanti
    brick.clearScreen();
    brick.showString("Movimento in avanti", 1);
    brick.showString(`Velocita: ${velocitaBase}`, 2);
    motors.largeBC.tank(velocitaBase, velocitaBase);
    pause(tempoMovimento);
    motors.largeBC.stop();
    pause(attesaTraMovimenti);
    
    // Modifica della velocità utilizzando una variabile
    velocitaBase += 20;  // Aumenta la velocità di 20 unità
    
    // Controllo che la velocità non superi il limite massimo
    if (velocitaBase > VELOCITA_MASSIMA) {
        velocitaBase = VELOCITA_MASSIMA;
    }
    
    // Movimento all'indietro con la nuova velocità
    brick.clearScreen();
    brick.showString("Movimento all'indietro", 1);
    brick.showString(`Velocita: ${velocitaBase}`, 2);
    motors.largeBC.tank(-velocitaBase, -velocitaBase);
    pause(tempoMovimento);
    motors.largeBC.stop();
    pause(attesaTraMovimenti);
    
    // Rotazione con variabile di tempo
    brick.clearScreen();
    brick.showString("Rotazione", 1);
    brick.showString(`Velocita: ${velocitaBase}`, 2);
    brick.showString(`Tempo: ${tempoRotazione}ms`, 3);
    motors.largeBC.tank(velocitaBase, -velocitaBase);
    pause(tempoRotazione);
    motors.largeBC.stop();
    
    // Diminuiamo la velocità usando la variabile
    velocitaBase -= 30;
    
    // Controllo che la velocità non diventi negativa
    if (velocitaBase < 0) {
        velocitaBase = 10;
    }
    
    // Movimento finale
    brick.clearScreen();
    brick.showString("Movimento finale", 1);
    brick.showString(`Velocita finale: ${velocitaBase}`, 2);
    motors.largeBC.tank(velocitaBase, velocitaBase);
    pause(tempoMovimento);
    motors.largeBC.stop();
    
    // Visualizzazione riassuntiva
    brick.clearScreen();
    brick.showString("Sequenza completata!", 1);
    brick.showString(`Velocita iniziale: 50`, 3);
    brick.showString(`Velocita finale: ${velocitaBase}`, 4);
    music.playSoundEffect(SoundEffect.Triumph);
});

// Pulsante su: aumenta la velocità base
brick.buttonUp.onEvent(ButtonEvent.Pressed, function () {
    velocitaBase += 10;
    if (velocitaBase > VELOCITA_MASSIMA) {
        velocitaBase = VELOCITA_MASSIMA;
    }
    brick.clearScreen();
    brick.showString("Controllo con Variabili", 1);
    brick.showString(`Velocita: ${velocitaBase}`, 2);
    brick.showString(`Tempo movimento: ${tempoMovimento}ms`, 3);
    brick.showString("Premi il pulsante centrale", 8);
});

// Pulsante giù: diminuisce la velocità base
brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    velocitaBase -= 10;
    if (velocitaBase < 0) {
        velocitaBase = 0;
    }
    brick.clearScreen();
    brick.showString("Controllo con Variabili", 1);
    brick.showString(`Velocita: ${velocitaBase}`, 2);
    brick.showString(`Tempo movimento: ${tempoMovimento}ms`, 3);
    brick.showString("Premi il pulsante centrale", 8);
});