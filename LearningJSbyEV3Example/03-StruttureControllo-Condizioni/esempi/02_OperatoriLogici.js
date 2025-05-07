// 02_OperatoriLogici.js
// Questo esempio mostra come utilizzare gli operatori logici per creare
// comportamenti complessi nel robot EV3 combinando più condizioni

// Configurazione dei sensori
let sensoreUltrasuoni = sensors.ultrasonic4;  // Sensore ultrasuoni sulla porta 4
let sensoreTocco = sensors.touch1;            // Sensore di tocco sulla porta 1
let sensoreColore = sensors.color3;           // Sensore di colore sulla porta 3

// Configurazione iniziale
brick.clearScreen();
brick.showString("Operatori Logici", 1);
brick.showString("Robot in attesa...", 3);
brick.showString("Premi il pulsante centrale", 8);

// Variabili di configurazione
let velocitaBase = 50;
let distanzaSicurezza = 15;    // distanza di sicurezza in cm
let modalitaSeguiLinea = true; // modalità di funzionamento

// Funzione per visualizzare i valori dei sensori
function mostraValoriSensori() {
    brick.clearScreen();
    brick.showString("Operatori Logici", 1);
    brick.showString(`Distanza: ${sensoreUltrasuoni.distance()} cm`, 3);
    brick.showString(`Tocco: ${sensoreTocco.isPressed() ? "Premuto" : "Non premuto"}`, 4);
    
    let coloreRilevato = "Sconosciuto";
    if (sensoreColore.color() === Color.Black) coloreRilevato = "Nero";
    else if (sensoreColore.color() === Color.Blue) coloreRilevato = "Blu";
    else if (sensoreColore.color() === Color.Green) coloreRilevato = "Verde";
    else if (sensoreColore.color() === Color.Yellow) coloreRilevato = "Giallo";
    else if (sensoreColore.color() === Color.Red) coloreRilevato = "Rosso";
    else if (sensoreColore.color() === Color.White) coloreRilevato = "Bianco";
    else if (sensoreColore.color() === Color.Brown) coloreRilevato = "Marrone";
    
    brick.showString(`Colore: ${coloreRilevato}`, 5);
    brick.showString(`Modalità: ${modalitaSeguiLinea ? "Segui linea" : "Evita ostacoli"}`, 7);
}

// Funzione principale per controllare il robot
function controllaRobot() {
    // Aggiorna il display con i valori dei sensori
    mostraValoriSensori();
    
    // Esempio combinazione operatori AND (&&)
    // Il robot si ferma se il sensore di tocco è premuto E siamo in modalità "Segui linea"
    if (sensoreTocco.isPressed() && modalitaSeguiLinea) {
        motors.largeBC.stop();
        brick.showString("Tocco rilevato in modalità linea", 8);
        music.playSoundEffect(SoundEffect.EnergyUp);
        pause(1000);
        return; // Esce dalla funzione per evitare le altre condizioni
    }
    
    // Esempio combinazione operatori OR (||)
    // Il robot suona un allarme se rileva un ostacolo molto vicino O se rileva il colore rosso
    if (sensoreUltrasuoni.distance() < 10 || sensoreColore.color() === Color.Red) {
        brick.showString("ALLARME: Ostacolo o rosso!", 8);
        music.playSoundEffect(SoundEffect.Alarm);
        
        // Se siamo in modalità "Segui linea" e troviamo rosso, ci fermiamo
        if (modalitaSeguiLinea && sensoreColore.color() === Color.Red) {
            motors.largeBC.stop();
            pause(1000);
        }
    }
    
    // Esempio combinazione complessa: operatori AND (&&), OR (||) e NOT (!)
    // Il robot avanza velocemente se:
    // - Non ci sono ostacoli vicini (<distanzaSicurezza) E
    // - (Siamo in modalità "Segui linea" E rileva il colore nero) OPPURE
    // - (Siamo in modalità "Evita ostacoli" E NON rileva il colore rosso)
    if (sensoreUltrasuoni.distance() >= distanzaSicurezza && 
        ((modalitaSeguiLinea && sensoreColore.color() === Color.Black) || 
         (!modalitaSeguiLinea && sensoreColore.color() !== Color.Red))) {
        motors.largeBC.tank(velocitaBase, velocitaBase);
        brick.showString("Avanzamento veloce", 8);
    } 
    // Altrimenti, se rileva blu (ma non è stato fermato dalle condizioni precedenti)
    else if (sensoreColore.color() === Color.Blue) {
        // Gira a destra quando vede blu
        motors.largeBC.tank(velocitaBase, velocitaBase/4);
        brick.showString("Virata a destra", 8);
    }
    // Altrimenti, se rileva il colore verde
    else if (sensoreColore.color() === Color.Green) {
        // Gira a sinistra quando vede verde
        motors.largeBC.tank(velocitaBase/4, velocitaBase);
        brick.showString("Virata a sinistra", 8);
    }
    // Se siamo in modalità "Segui linea" ma non rileviamo il nero
    else if (modalitaSeguiLinea && sensoreColore.color() !== Color.Black) {
        // Cerca la linea muovendosi lentamente e girando
        motors.largeBC.tank(30, -30);
        brick.showString("Cercando la linea", 8);
    }
    // In tutti gli altri casi, muoviti con cautela
    else {
        motors.largeBC.tank(velocitaBase/2, velocitaBase/2);
        brick.showString("Movimento cauto", 8);
    }
}

// Pulsante centrale: avvia il programma principale
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function() {
    // Avvio del programma principale con il ciclo di controllo
    music.playSoundEffect(SoundEffect.Ready);
    
    // Esegui il ciclo di controllo
    forever(function() {
        controllaRobot();
        pause(100); // Pausa breve per non sovraccaricare il sistema
    });
});

// Pulsante destro: cambia modalità
brick.buttonRight.onEvent(ButtonEvent.Pressed, function() {
    modalitaSeguiLinea = !modalitaSeguiLinea;
    
    brick.clearScreen();
    brick.showString("Modalità cambiata:", 3);
    brick.showString(modalitaSeguiLinea ? "Segui linea" : "Evita ostacoli", 4);
    music.playSoundEffect(SoundEffect.MachineStart);
    pause(1000);
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
    if (distanzaSicurezza < 5) distanzaSicurezza = 5;
    
    brick.clearScreen();
    brick.showString("Distanza di sicurezza:", 3);
    brick.showString(`${distanzaSicurezza} cm`, 4);
    pause(1000);
});