// 04_OperatoreTernario.js
// Questo esempio mostra come utilizzare l'operatore ternario per semplificare
// il codice condizionale nella programmazione del robot EV3

// Configurazione dei sensori
let sensoreUltrasuoni = sensors.ultrasonic4;  // Sensore ultrasuoni sulla porta 4
let sensoreTocco = sensors.touch1;            // Sensore di tocco sulla porta 1
let sensoreColore = sensors.color3;           // Sensore di colore sulla porta 3

// Configurazione iniziale
brick.clearScreen();
brick.showString("Operatore Ternario", 1);
brick.showString("Robot in attesa...", 3);
brick.showString("Premi il pulsante centrale", 8);

// Variabili di configurazione
let velocitaBase = 50;
let distanzaSicurezza = 20;      // distanza di sicurezza in cm
let modalitaEstesa = false;      // modalità con comportamenti avanzati
let inizializzato = false;       // flag per indicare se il programma è stato avviato

// Funzione che utilizza l'operatore ternario per impostare i parametri di movimento
function impostaParametriMovimento() {
    // Imposta la velocità in base alla distanza dall'ostacolo
    // Usando l'operatore ternario: condizione ? valore_se_vera : valore_se_falsa
    let velocitaAttuale = sensoreUltrasuoni.distance() < distanzaSicurezza ? 30 : 70;
    
    // Imposta il suono da riprodurre in base allo stato del sensore di tocco
    // Altro esempio di operatore ternario
    let suono = sensoreTocco.isPressed() ? SoundEffect.Boing : SoundEffect.Blip;
    
    // Determina la direzione di movimento in base al colore rilevato
    // Operatore ternario annidato (più complesso)
    let direzione = sensoreColore.color() === Color.Red ? "stop" :
                   sensoreColore.color() === Color.Black ? "avanti" :
                   sensoreColore.color() === Color.Blue ? "destra" :
                   sensoreColore.color() === Color.Green ? "sinistra" :
                   "cerca";
    
    // Operatore ternario per determinare se eseguire azioni avanzate
    let eseguiAzioniAvanzate = modalitaEstesa && sensoreUltrasuoni.distance() < 50;
    
    // Restituisce un oggetto con tutti i parametri impostati
    return {
        velocita: velocitaAttuale,
        suono: suono,
        direzione: direzione,
        azioniAvanzate: eseguiAzioniAvanzate
    };
}

// Funzione per controllare il movimento del robot
function controllaMovimento() {
    // Ottieni i parametri usando la funzione che contiene operatori ternari
    let parametri = impostaParametriMovimento();
    
    // Mostra i parametri sul display
    brick.clearScreen();
    brick.showString("Operatore Ternario", 1);
    brick.showString(`Velocità: ${parametri.velocita}`, 3);
    brick.showString(`Direzione: ${parametri.direzione}`, 4);
    brick.showString(`Touch: ${sensoreTocco.isPressed() ? "Premuto" : "Rilasciato"}`, 5);
    brick.showString(`Azioni avanzate: ${parametri.azioniAvanzate ? "Sì" : "No"}`, 6);
    
    // Esempio: messaggio condizionale usando l'operatore ternario nel template string
    brick.showString(`Dist: ${sensoreUltrasuoni.distance()}${sensoreUltrasuoni.distance() < distanzaSicurezza ? " ATTENZIONE!" : ""}`, 7);
    
    // Esegue un'azione in base alla direzione
    switch (parametri.direzione) {
        case "stop":
            motors.largeBC.stop();
            // Operatore ternario usato in una condizione - riproduce suono solo se in modalità estesa
            modalitaEstesa ? music.playSoundEffect(SoundEffect.Stop) : null;
            break;
            
        case "avanti":
            // Operatore ternario per determinare le velocità dei motori
            // Se è premuto il sensore di tocco, va dritto, altrimenti piccola correzione
            let velocitaSinistra = sensoreTocco.isPressed() ? parametri.velocita : parametri.velocita + 5;
            let velocitaDestra = sensoreTocco.isPressed() ? parametri.velocita : parametri.velocita - 5;
            
            motors.largeBC.tank(velocitaSinistra, velocitaDestra);
            break;
            
        case "destra":
            motors.largeBC.tank(parametri.velocita, parametri.velocita / 3);
            // Operatore ternario in una condizione
            parametri.azioniAvanzate ? brick.showString("Svolta a destra accentuata", 8) : null;
            break;
            
        case "sinistra":
            motors.largeBC.tank(parametri.velocita / 3, parametri.velocita);
            // Operatore ternario in una condizione
            parametri.azioniAvanzate ? brick.showString("Svolta a sinistra accentuata", 8) : null;
            break;
            
        default:
            // Cerca di trovare una linea o un percorso
            // Operatore ternario per determinare il comportamento di ricerca
            let comportamentoRicerca = control.millis() % 2000 < 1000 ? "rotazione" : "zigzag";
            
            if (comportamentoRicerca === "rotazione") {
                motors.largeBC.tank(30, -30);
            } else {
                motors.largeBC.tank(parametri.velocita, -parametri.velocita / 2);
                pause(500);
                motors.largeBC.tank(-parametri.velocita / 2, parametri.velocita);
                pause(500);
            }
    }
    
    // Riproduce il suono determinato dall'operatore ternario
    // Solo una volta ogni secondo per non sovraccaricare
    if (control.millis() % 1000 < 100) {
        music.playSoundEffect(parametri.suono);
    }
}

// Avvio del programma con il pulsante centrale
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function() {
    if (!inizializzato) {
        inizializzato = true;
        music.playSoundEffect(SoundEffect.Ready);
        
        // Esegui il ciclo di controllo
        forever(function() {
            controllaMovimento();
            pause(100); // Pausa breve per non sovraccaricare il sistema
        });
    } else {
        // Se già inizializzato, usa l'operatore ternario per alternare la modalità
        modalitaEstesa = !modalitaEstesa;
        
        brick.clearScreen();
        brick.showString("Modalità cambiata:", 3);
        // Operatore ternario nel template string
        brick.showString(`${modalitaEstesa ? "Estesa" : "Base"}`, 4);
        
        // Operatore ternario per scegliere l'effetto sonoro
        music.playSoundEffect(modalitaEstesa ? SoundEffect.Triumph : SoundEffect.Chirp);
        pause(1000);
    }
});

// Pulsante Su: aumenta la distanza di sicurezza
brick.buttonUp.onEvent(ButtonEvent.Pressed, function() {
    distanzaSicurezza += 5;
    // Operatore ternario per limitare il valore massimo
    distanzaSicurezza = distanzaSicurezza > 50 ? 50 : distanzaSicurezza;
    
    brick.clearScreen();
    brick.showString("Distanza di sicurezza:", 3);
    brick.showString(`${distanzaSicurezza} cm`, 4);
    pause(1000);
});

// Pulsante Giù: diminuisce la distanza di sicurezza
brick.buttonDown.onEvent(ButtonEvent.Pressed, function() {
    distanzaSicurezza -= 5;
    // Operatore ternario per limitare il valore minimo
    distanzaSicurezza = distanzaSicurezza < 5 ? 5 : distanzaSicurezza;
    
    brick.clearScreen();
    brick.showString("Distanza di sicurezza:", 3);
    brick.showString(`${distanzaSicurezza} cm`, 4);
    pause(1000);
});