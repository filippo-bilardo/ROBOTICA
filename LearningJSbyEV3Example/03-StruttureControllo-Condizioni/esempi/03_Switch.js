// 03_Switch.js
// Questo esempio mostra come utilizzare lo switch statement per implementare
// una macchina a stati nel robot EV3, gestendo diversi comportamenti in base allo stato

// Configurazione dei sensori
let sensoreUltrasuoni = sensors.ultrasonic4; // Sensore ultrasuoni sulla porta 4
let sensoreTocco = sensors.touch1;           // Sensore di tocco sulla porta 1
let sensoreColore = sensors.color3;          // Sensore di colore sulla porta 3

// Configurazione iniziale
brick.clearScreen();
brick.showString("Switch e Stati", 1);
brick.showString("Robot in attesa...", 3);
brick.showString("Premi il pulsante centrale", 8);

// Definizione delle costanti per gli stati del robot
const STATO_FERMO = 0;
const STATO_ESPLORAZIONE = 1;
const STATO_SEGUI_LINEA = 2;
const STATO_EVITA_OSTACOLI = 3;
const STATO_RITORNO_BASE = 4;

// Variabili di configurazione
let velocitaBase = 50;           // Velocità base per i motori
let distanzaSicurezza = 15;      // Distanza di sicurezza dagli ostacoli (cm)
let tempoRotazione = 1000;       // Tempo per effettuare una rotazione (ms)
let statoCorrente = STATO_FERMO; // Stato iniziale del robot
let tempoInizio = 0;             // Per misurare il tempo trascorso nello stato attuale

// Funzione per mostrare lo stato corrente e le informazioni dei sensori
function aggiornaDisplay() {
    brick.clearScreen();
    brick.showString("Switch e Stati", 1);
    
    // Visualizza nome dello stato corrente
    let nomeStato = "";
    switch (statoCorrente) {
        case STATO_FERMO:
            nomeStato = "Fermo";
            break;
        case STATO_ESPLORAZIONE:
            nomeStato = "Esplorazione";
            break;
        case STATO_SEGUI_LINEA:
            nomeStato = "Segui Linea";
            break;
        case STATO_EVITA_OSTACOLI:
            nomeStato = "Evita Ostacoli";
            break;
        case STATO_RITORNO_BASE:
            nomeStato = "Ritorno Base";
            break;
        default:
            nomeStato = "Sconosciuto";
    }
    
    brick.showString(`Stato: ${nomeStato}`, 2);
    
    // Mostra valori dei sensori
    brick.showString(`Distanza: ${sensoreUltrasuoni.distance()} cm`, 3);
    brick.showString(`Tocco: ${sensoreTocco.isPressed() ? "Premuto" : "Non premuto"}`, 4);
    
    // Mostra il colore rilevato
    let coloreRilevato = "Sconosciuto";
    switch (sensoreColore.color()) {
        case Color.Black:
            coloreRilevato = "Nero";
            break;
        case Color.Blue:
            coloreRilevato = "Blu";
            break;
        case Color.Green:
            coloreRilevato = "Verde";
            break;
        case Color.Yellow:
            coloreRilevato = "Giallo";
            break;
        case Color.Red:
            coloreRilevato = "Rosso";
            break;
        case Color.White:
            coloreRilevato = "Bianco";
            break;
        case Color.Brown:
            coloreRilevato = "Marrone";
            break;
        // Non serve il default perché abbiamo già inizializzato la variabile
    }
    
    brick.showString(`Colore: ${coloreRilevato}`, 5);
    
    // Tempo trascorso nello stato corrente
    let tempoTrascorso = (control.millis() - tempoInizio) / 1000;
    brick.showString(`Tempo nello stato: ${Math.round(tempoTrascorso)}s`, 6);
}

// Funzione principale che implementa la macchina a stati
function gestisciStatoRobot() {
    // Aggiorna il display con le informazioni attuali
    aggiornaDisplay();
    
    // Gestisci gli stati con uno switch statement
    switch (statoCorrente) {
        case STATO_FERMO:
            // Robot fermo, non fa nulla
            motors.largeBC.stop();
            
            // Se si preme il pulsante di tocco, passa allo stato di esplorazione
            if (sensoreTocco.isPressed()) {
                music.playSoundEffect(SoundEffect.Start);
                statoCorrente = STATO_ESPLORAZIONE;
                tempoInizio = control.millis(); // Resetta il timer
            }
            break;
            
        case STATO_ESPLORAZIONE:
            // Robot in esplorazione - si muove avanti cercando linee e evitando ostacoli
            
            // Se rileva un ostacolo vicino, passa allo stato di evitamento ostacoli
            if (sensoreUltrasuoni.distance() < distanzaSicurezza) {
                music.playSoundEffect(SoundEffect.ObjectDetected);
                statoCorrente = STATO_EVITA_OSTACOLI;
                tempoInizio = control.millis();
                break; // Esce subito dallo switch
            }
            
            // Se rileva una linea nera, passa allo stato di seguimento linea
            if (sensoreColore.color() === Color.Black) {
                music.playSoundEffect(SoundEffect.EnergyUp);
                statoCorrente = STATO_SEGUI_LINEA;
                tempoInizio = control.millis();
                break; // Esce subito dallo switch
            }
            
            // Se rileva il rosso, torna alla base
            if (sensoreColore.color() === Color.Red) {
                music.playSoundEffect(SoundEffect.MissionAccomplished);
                statoCorrente = STATO_RITORNO_BASE;
                tempoInizio = control.millis();
                break; // Esce subito dallo switch
            }
            
            // Comportamento normale di esplorazione - muoviti in avanti
            motors.largeBC.tank(velocitaBase, velocitaBase);
            
            // Dopo 30 secondi di esplorazione, torna alla base
            if ((control.millis() - tempoInizio) > 30000) {
                brick.showString("Tempo scaduto", 8);
                statoCorrente = STATO_RITORNO_BASE;
                tempoInizio = control.millis();
            }
            break;
            
        case STATO_SEGUI_LINEA:
            // Robot che segue una linea nera
            
            // Segue la linea usando il sensore di colore
            switch (sensoreColore.color()) {
                case Color.Black:
                    // Sulla linea nera, procedi dritto
                    motors.largeBC.tank(velocitaBase, velocitaBase);
                    break;
                    
                case Color.White:
                    // Fuori dalla linea, cerca di ritrovarla
                    motors.largeBC.tank(velocitaBase/2, velocitaBase);
                    break;
                    
                case Color.Red:
                    // Rosso significa fine del percorso, torna alla base
                    music.playSoundEffect(SoundEffect.MissionAccomplished);
                    statoCorrente = STATO_RITORNO_BASE;
                    tempoInizio = control.millis();
                    break;
                    
                default:
                    // Per altri colori, gira per cercare la linea
                    motors.largeBC.tank(velocitaBase, velocitaBase/4);
            }
            
            // Se c'è un ostacolo, passa a evitare l'ostacolo
            if (sensoreUltrasuoni.distance() < distanzaSicurezza) {
                music.playSoundEffect(SoundEffect.ObjectDetected);
                statoCorrente = STATO_EVITA_OSTACOLI;
                tempoInizio = control.millis();
            }
            
            // Se tenuto premuto il sensore di tocco per più di 1 secondo, torna alla base
            if (sensoreTocco.isPressed()) {
                pause(1000);
                if (sensoreTocco.isPressed()) {
                    statoCorrente = STATO_RITORNO_BASE;
                    tempoInizio = control.millis();
                }
            }
            break;
            
        case STATO_EVITA_OSTACOLI:
            // Robot che evita un ostacolo
            
            // Sequenza di evitamento ostacoli
            motors.largeBC.stop();
            pause(500);
            
            // Torna indietro un po'
            motors.largeBC.tank(-velocitaBase, -velocitaBase);
            pause(1000);
            
            // Gira per evitare l'ostacolo
            motors.largeBC.tank(velocitaBase, -velocitaBase);
            pause(tempoRotazione);
            
            // Torna allo stato precedente
            if (sensoreColore.color() === Color.Black) {
                // Se vede la linea, torna allo stato di seguimento linea
                statoCorrente = STATO_SEGUI_LINEA;
            } else {
                // Altrimenti torna all'esplorazione
                statoCorrente = STATO_ESPLORAZIONE;
            }
            
            tempoInizio = control.millis();
            break;
            
        case STATO_RITORNO_BASE:
            // Robot che torna alla base
            
            brick.showString("Ritorno alla base", 8);
            
            // Semplice sequenza di ritorno (in un caso reale userebbe la navigazione)
            motors.largeBC.tank(-velocitaBase/2, -velocitaBase/2);
            pause(2000);
            
            motors.largeBC.tank(velocitaBase, -velocitaBase);
            pause(tempoRotazione);
            
            motors.largeBC.tank(velocitaBase/2, velocitaBase/2);
            pause(3000);
            
            // Torna allo stato fermo
            motors.largeBC.stop();
            music.playSoundEffect(SoundEffect.Success);
            statoCorrente = STATO_FERMO;
            tempoInizio = control.millis();
            break;
            
        default:
            // In caso di stato sconosciuto, torna allo stato sicuro (fermo)
            brick.showString("ERRORE: Stato sconosciuto", 8);
            motors.largeBC.stop();
            statoCorrente = STATO_FERMO;
            tempoInizio = control.millis();
    }
}

// Avvio del programma con il pulsante centrale
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function() {
    // Inizializza
    tempoInizio = control.millis();
    music.playSoundEffect(SoundEffect.Ready);
    
    // Ciclo principale
    forever(function() {
        gestisciStatoRobot();
        pause(100); // Pausa breve tra iterazioni
    });
});

// Pulsante Su: passa direttamente allo stato di esplorazione
brick.buttonUp.onEvent(ButtonEvent.Pressed, function() {
    statoCorrente = STATO_ESPLORAZIONE;
    tempoInizio = control.millis();
    music.playSoundEffect(SoundEffect.Start);
});

// Pulsante Giù: torna allo stato fermo
brick.buttonDown.onEvent(ButtonEvent.Pressed, function() {
    statoCorrente = STATO_FERMO;
    tempoInizio = control.millis();
    music.playSoundEffect(SoundEffect.Stop);
});

// Pulsante Sinistra: passa allo stato di seguimento linea
brick.buttonLeft.onEvent(ButtonEvent.Pressed, function() {
    statoCorrente = STATO_SEGUI_LINEA;
    tempoInizio = control.millis();
    music.playSoundEffect(SoundEffect.EnergyUp);
});

// Pulsante Destra: passa allo stato di ritorno alla base
brick.buttonRight.onEvent(ButtonEvent.Pressed, function() {
    statoCorrente = STATO_RITORNO_BASE;
    tempoInizio = control.millis();
    music.playSoundEffect(SoundEffect.MissionAccomplished);
});