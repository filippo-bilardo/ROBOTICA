// 01_While.js
// Questo esempio mostra come utilizzare il ciclo while per creare comportamenti
// reattivi e persistenti nel robot EV3

// Configurazione dei sensori
let sensoreUltrasuoni = sensors.ultrasonic4;  // Sensore ultrasuoni sulla porta 4
let sensoreTocco = sensors.touch1;            // Sensore di tocco sulla porta 1
let sensoreColore = sensors.color3;           // Sensore di colore sulla porta 3

// Configurazione iniziale
brick.clearScreen();
brick.showString("Esempio While", 1);
brick.showString("Robot in attesa...", 3);
brick.showString("Premi il pulsante centrale", 8);

// Variabili di configurazione
let velocitaBase = 50;
let distanzaSicurezza = 20;      // distanza di sicurezza in cm
let attivo = false;             // flag per indicare se il robot è attivo
let modoPattuglia = false;      // modalità di pattugliamento

// Funzione principale: utilizza cicli while per controllare il robot
function eseguiProgramma() {
    // Attiva il robot
    attivo = true;
    
    // Ciclo principale del programma
    while (attivo) {
        // Ottieni i valori dei sensori
        let distanza = sensoreUltrasuoni.distance();
        let coloreRilevato = sensoreColore.color();
        
        // Mostra le informazioni sullo schermo
        brick.clearScreen();
        brick.showString("Esempio While", 1);
        brick.showString(`Distanza: ${distanza} cm`, 3);
        
        // Mostra il nome del colore
        let nomeColore = "sconosciuto";
        switch (coloreRilevato) {
            case Color.Black: nomeColore = "nero"; break;
            case Color.Blue: nomeColore = "blu"; break;
            case Color.Green: nomeColore = "verde"; break;
            case Color.Yellow: nomeColore = "giallo"; break;
            case Color.Red: nomeColore = "rosso"; break;
            case Color.White: nomeColore = "bianco"; break;
            case Color.Brown: nomeColore = "marrone"; break;
        }
        brick.showString(`Colore: ${nomeColore}`, 4);
        
        // Mostra la modalità attiva
        brick.showString(`Modalità: ${modoPattuglia ? "Pattuglia" : "Esplorazione"}`, 5);
        
        // ESEMPIO 1: Ciclo while per attendere che un ostacolo si allontani
        if (distanza < distanzaSicurezza) {
            // Fermati e attendi che l'ostacolo si allontani
            motors.largeBC.stop();
            brick.showString("Ostacolo rilevato!", 7);
            brick.showString("Attendo che si allontani...", 8);
            
            // Ciclo di attesa: continua finché l'ostacolo è vicino
            while (sensoreUltrasuoni.distance() < distanzaSicurezza + 10) {
                // Lampeggia un avviso
                brick.showString("!", 6);
                pause(300);
                brick.showString(" ", 6);
                pause(300);
                
                // Controlla se il pulsante è premuto per interrompere l'attesa
                if (sensoreTocco.isPressed()) {
                    break;  // Esce dal ciclo di attesa
                }
            }
            
            brick.showString("Percorso libero", 7);
            brick.showString("", 8);  // Cancella il messaggio
            
            // Avanza lentamente dopo che l'ostacolo si è allontanato
            motors.largeBC.tank(velocitaBase/2, velocitaBase/2);
            pause(1000);
        }
        // ESEMPIO 2: Utilizzo di while per seguire una linea nera
        else if (coloreRilevato === Color.Black) {
            brick.showString("Linea nera rilevata!", 7);
            
            // Segui la linea nera finché la condizione è vera
            while (sensoreColore.color() === Color.Black && attivo) {
                // Avanza lungo la linea
                motors.largeBC.tank(velocitaBase, velocitaBase);
                
                // Verifica se c'è un ostacolo davanti
                if (sensoreUltrasuoni.distance() < distanzaSicurezza) {
                    break;  // Esce dal ciclo per gestire l'ostacolo
                }
                
                // Controlla se il pulsante è premuto per interrompere
                if (sensoreTocco.isPressed()) {
                    attivo = false;  // Termina il programma
                    break;
                }
                
                pause(100);  // Breve pausa per non sovraccaricare il sistema
            }
            
            // Se ha perso la linea ma il programma è ancora attivo, cerca di ritrovarla
            if (attivo && sensoreColore.color() !== Color.Black) {
                brick.showString("Cerco la linea...", 7);
                
                // Ruota lentamente cercando la linea
                motors.largeBC.tank(30, -30);
                pause(500);
            }
        }
        // ESEMPIO 3: Ciclo di pattugliamento con do-while
        else if (modoPattuglia) {
            brick.showString("Modalità pattuglia", 7);
            
            // Contatore per contare quante rotazioni sono state eseguite
            let contatorePattuglia = 0;
            let direzione = 1;  // 1 = destra, -1 = sinistra
            
            // Esegue il pattugliamento almeno una volta, poi verifica se continuare
            do {
                // Avanza per un po'
                motors.largeBC.tank(velocitaBase * direzione, velocitaBase * direzione);
                pause(1000);
                
                // Ruota
                motors.largeBC.tank(velocitaBase, -velocitaBase);
                pause(800);  // Tempo per una rotazione di circa 90 gradi
                
                // Cambia direzione ogni due rotazioni
                contatorePattuglia++;
                if (contatorePattuglia % 2 === 0) {
                    direzione = -direzione;
                }
                
                // Mostra il contatore sullo schermo
                brick.showString(`Pattuglia: ${contatorePattuglia}`, 8);
                
                // Controlla se il pulsante è premuto per interrompere
                if (sensoreTocco.isPressed()) {
                    break;
                }
                
                // Controlla se il sensore di colore ha rilevato rosso (segnale di stop)
            } while (sensoreColore.color() !== Color.Red && attivo);
            
            // Se ha trovato il rosso, emetti un suono
            if (sensoreColore.color() === Color.Red) {
                brick.showString("STOP: Segnale rosso", 8);
                music.playSoundEffect(SoundEffect.Stop);
            }
        }
        // ESEMPIO 4: Comportamento predefinito con ciclo while
        else {
            // Modalità esplorazione: avanza e cerca segnali
            motors.largeBC.tank(velocitaBase, velocitaBase);
            brick.showString("Esplorazione...", 7);
            
            // Controlla continuamente i pulsanti mentre avanza
            let tempoInizio = control.millis();
            
            // Ciclo while con timeout: avanza per 2 secondi o finché non si preme un pulsante
            while ((control.millis() - tempoInizio) < 2000 && !sensoreTocco.isPressed()) {
                // Mostra un contatore del tempo
                let secondiTrascorsi = Math.round((control.millis() - tempoInizio) / 1000);
                brick.showString(`Tempo: ${secondiTrascorsi}s`, 8);
                
                // Se trova un colore specifico durante l'avanzamento, esce dal ciclo
                if (sensoreColore.color() === Color.Red || 
                    sensoreColore.color() === Color.Black) {
                    break;
                }
                
                pause(100);
            }
        }
        
        // Controlla l'interruzione del programma principale
        if (sensoreTocco.isPressed()) {
            // Attendi il rilascio del pulsante
            while (sensoreTocco.isPressed()) {
                pause(100);
            }
            
            // Chiedi conferma
            brick.clearScreen();
            brick.showString("Terminare il programma?", 3);
            brick.showString("Premi di nuovo per confermare", 4);
            brick.showString("o attendi per continuare", 5);
            
            // Attendi 3 secondi per la conferma
            let tempoConferma = control.millis();
            while ((control.millis() - tempoConferma) < 3000) {
                if (sensoreTocco.isPressed()) {
                    // Confermato: termina il programma
                    attivo = false;
                    brick.showString("Programma terminato", 7);
                    motors.largeBC.stop();
                    break;
                }
                pause(100);
            }
        }
        
        pause(100);  // Pausa breve per non sovraccaricare il sistema
    }
}

// Pulsante centrale: avvia il programma principale
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function() {
    if (!attivo) {
        brick.showString("Avvio del programma...", 3);
        music.playSoundEffect(SoundEffect.Ready);
        pause(1000);
        eseguiProgramma();
    }
});

// Pulsante Destro: cambia modalità
brick.buttonRight.onEvent(ButtonEvent.Pressed, function() {
    modoPattuglia = !modoPattuglia;
    
    brick.clearScreen();
    brick.showString("Modalità cambiata:", 3);
    brick.showString(modoPattuglia ? "Pattuglia" : "Esplorazione", 4);
    pause(1000);
});

// Pulsante Su: aumenta la velocità
brick.buttonUp.onEvent(ButtonEvent.Pressed, function() {
    velocitaBase += 10;
    if (velocitaBase > 100) velocitaBase = 100;
    
    brick.clearScreen();
    brick.showString("Velocità aumentata:", 3);
    brick.showString(`${velocitaBase}`, 4);
    pause(1000);
});

// Pulsante Giù: diminuisce la velocità
brick.buttonDown.onEvent(ButtonEvent.Pressed, function() {
    velocitaBase -= 10;
    if (velocitaBase < 10) velocitaBase = 10;
    
    brick.clearScreen();
    brick.showString("Velocità diminuita:", 3);
    brick.showString(`${velocitaBase}`, 4);
    pause(1000);
});