// 05_ControlloSensori.js
// Questo esempio mostra come utilizzare i valori truthy/falsy per gestire
// il controllo dei sensori e implementare comportamenti reattivi nel robot EV3

// Configurazione dei sensori
let sensoreUltrasuoni = sensors.ultrasonic4;  // Sensore ultrasuoni sulla porta 4
let sensoreTocco = sensors.touch1;            // Sensore di tocco sulla porta 1
let sensoreColore = sensors.color3;           // Sensore di colore sulla porta 3

// Configurazione iniziale
brick.clearScreen();
brick.showString("Truth/Falsy Values", 1);
brick.showString("Robot in attesa...", 3);
brick.showString("Premi il pulsante centrale", 8);

// Variabili di configurazione
let velocitaBase = 50;
let distanzaMinima = 15;      // distanza minima in cm
let contatoreOstacoli = 0;    // contatore per gli ostacoli rilevati
let inizializzato = false;    // flag di inizializzazione
let ultimoColore;             // ultimo colore rilevato (inizialmente undefined)
let messaggioUtente = "";     // messaggio da mostrare all'utente
let configurazioneSensori;    // oggetto configurazione (inizialmente undefined)

// Funzione per controllare la validità dei sensori
function controlloSensori() {
    // Utilizzo di truthy/falsy per verificare se i sensori sono configurati
    let sensoriOK = sensoreUltrasuoni && sensoreTocco && sensoreColore;
    
    // Se sensoriOK è truthy, significa che tutti i sensori sono disponibili
    if (sensoriOK) {
        brick.showString("Tutti i sensori OK", 3);
        return true;
    } else {
        // Altrimenti, determina quali sensori mancano
        brick.showString("ERRORE: Sensori mancanti!", 3);
        
        // Utilizzo dell'operatore ! per verificare se un sensore è undefined o null
        if (!sensoreUltrasuoni) brick.showString("- Ultrasuoni non trovato", 4);
        if (!sensoreTocco) brick.showString("- Tocco non trovato", 5);
        if (!sensoreColore) brick.showString("- Colore non trovato", 6);
        
        return false;
    }
}

// Funzione per impostare la configurazione di default se non è già stata impostata
function impostaConfigurazioneDefault() {
    // Se configurazioneSensori è undefined (falsy), crea una configurazione di default
    if (!configurazioneSensori) {
        configurazioneSensori = {
            distanzaSicurezza: 20,
            velocitaStandard: 50,
            modalitaEvitamento: "base",
            coloriRiconosciuti: ["nero", "rosso", "blu", "verde"]
        };
        
        brick.showString("Config default caricata", 7);
    }
}

// Funzione per controllare il movimento del robot
function controllaRobot() {
    // Ottieni valori dai sensori
    let distanza = sensoreUltrasuoni.distance();
    let toccoPremuto = sensoreTocco.isPressed();
    let coloreRilevato = sensoreColore.color();
    
    // Aggiorna il display con i valori dei sensori
    brick.clearScreen();
    brick.showString("Truth/Falsy Values", 1);
    brick.showString(`Distanza: ${distanza} cm`, 3);
    brick.showString(`Tocco: ${toccoPremuto ? "Premuto" : "Rilasciato"}`, 4);
    
    // Converte il colore in una stringa
    let nomeColore;
    switch (coloreRilevato) {
        case Color.Black: nomeColore = "nero"; break;
        case Color.Blue: nomeColore = "blu"; break;
        case Color.Green: nomeColore = "verde"; break;
        case Color.Yellow: nomeColore = "giallo"; break;
        case Color.Red: nomeColore = "rosso"; break;
        case Color.White: nomeColore = "bianco"; break;
        case Color.Brown: nomeColore = "marrone"; break;
        default: nomeColore = "sconosciuto";
    }
    
    brick.showString(`Colore: ${nomeColore}`, 5);
    
    // Mostra il contatore ostacoli (solo se > 0, sfruttando truthy/falsy)
    if (contatoreOstacoli) {
        brick.showString(`Ostacoli rilevati: ${contatoreOstacoli}`, 6);
    }
    
    // Mostra messaggio utente (solo se non è stringa vuota, sfruttando truthy/falsy)
    if (messaggioUtente) {
        brick.showString(messaggioUtente, 7);
    }
    
    // Logica di controllo del robot usando truthy/falsy values
    
    // 1. Verifica se il pulsante di tocco è premuto (valore truthy se premuto)
    if (toccoPremuto) {
        motors.largeBC.stop();
        messaggioUtente = "Arresto di emergenza";
        music.playSoundEffect(SoundEffect.Stop);
        return; // Esce dalla funzione
    }
    
    // 2. Controlla il sensore ultrasuoni per rilevare ostacoli
    // distanza < distanzaMinima è truthy se c'è un ostacolo vicino
    if (distanza < distanzaMinima) {
        // Incrementa il contatore (da 0/falsy a un valore positivo/truthy)
        contatoreOstacoli++;
        
        // Evita l'ostacolo
        motors.largeBC.stop();
        messaggioUtente = "Ostacolo rilevato!";
        music.playSoundEffect(SoundEffect.Alarm);
        
        // Inversione di marcia
        motors.largeBC.tank(-velocitaBase, -velocitaBase);
        pause(1000);
        
        // Gira a destra
        motors.largeBC.tank(velocitaBase, -velocitaBase);
        pause(800);
        
        // Annulla il messaggio utente dopo un po'
        pause(500);
        messaggioUtente = "";
        
        return; // Esce dalla funzione
    }
    
    // 3. Gestione della direzione in base al colore utilizzando truthy/falsy
    
    // Verifica se il colore è cambiato (confronto con undefined o valore precedente)
    if (coloreRilevato !== ultimoColore) {
        // Aggiorna l'ultimo colore rilevato
        ultimoColore = coloreRilevato;
        
        // Controlla se il colore è uno tra quelli "attivi" (nero, rosso, blu, verde)
        // Si noti che evaluateColor restituisce un valore truthy o falsy
        let evaluateColor = 
            coloreRilevato === Color.Black ||
            coloreRilevato === Color.Red ||
            coloreRilevato === Color.Blue ||
            coloreRilevato === Color.Green;
        
        // Se il colore è attivo, riproduci un suono
        if (evaluateColor) {
            music.playSoundEffect(SoundEffect.Blip);
        }
    }
    
    // 4. Comportamento in base al colore
    switch (coloreRilevato) {
        case Color.Red:
            // Rosso: fermati (truthy condition)
            motors.largeBC.stop();
            messaggioUtente = "Stop al rosso!";
            break;
            
        case Color.Black:
            // Nero: avanti veloce (truthy condition)
            motors.largeBC.tank(velocitaBase + 20, velocitaBase + 20);
            messaggioUtente = ""; // Stringa vuota è falsy
            break;
            
        case Color.Blue:
            // Blu: gira a destra (truthy condition)
            motors.largeBC.tank(velocitaBase, velocitaBase / 3);
            messaggioUtente = "Giro a destra";
            break;
            
        case Color.Green:
            // Verde: gira a sinistra (truthy condition)
            motors.largeBC.tank(velocitaBase / 3, velocitaBase);
            messaggioUtente = "Giro a sinistra";
            break;
            
        default:
            // Per tutti gli altri colori, usa la velocità base (truthy condition)
            motors.largeBC.tank(velocitaBase, velocitaBase);
            
            // Usa l'operatore || come OR logico per impostare un messaggio di default
            // Se la stringa è vuota (falsy), usa il valore dopo ||
            messaggioUtente = messaggioUtente || "Modalità esplorazione";
    }
    
    // Dimostra l'uso dell'operatore && come AND logico e short-circuit
    // Se la distanza è > 50 (truthy) E il colore non è rosso (truthy),
    // allora riproduce un suono di felicità
    (distanza > 50 && coloreRilevato !== Color.Red) && music.playSoundEffect(SoundEffect.Happy);
}

// Funzione principale che inizializza e avvia il robot
function avviaRobot() {
    // Usa l'operatore ! per verificare se inizializzato è false
    if (!inizializzato) {
        // Controlla che i sensori siano validi
        if (controlloSensori()) {
            // Imposta la configurazione di default (se non è già stata impostata)
            impostaConfigurazioneDefault();
            
            // L'assegnazione restituisce il valore assegnato, che è truthy
            inizializzato = true;
            
            // Avvia il robot
            music.playSoundEffect(SoundEffect.Ready);
            brick.showString("Robot avviato!", 8);
            
            // Ciclo principale che utilizza il valore truthy di inizializzato
            // Se inizializzato diventa falsy (ad es. false, 0, null, ecc.), il ciclo si fermerà
            forever(function() {
                if (inizializzato) {
                    controllaRobot();
                    pause(100);
                }
            });
        } else {
            // Se i sensori non sono validi, emette un suono di errore
            music.playSoundEffect(SoundEffect.Error);
        }
    }
}

// Esempio di utilizzo dell'operatore ternario con truthy/falsy values
function toggleStato(stato) {
    // Converte esplicitamente lo stato in un booleano con doppia negazione
    return !!stato ? 0 : 1; // Se stato è truthy, restituisce 0 (falsy), altrimenti 1 (truthy)
}

// Pulsante centrale: avvia il robot
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function() {
    avviaRobot();
});

// Pulsante Su: aumenta la velocità base
brick.buttonUp.onEvent(ButtonEvent.Pressed, function() {
    // Incrementa solo se inizializzato è truthy
    if (inizializzato) {
        velocitaBase += 10;
        // Limita la velocità massima
        if (velocitaBase > 100) velocitaBase = 100;
        
        brick.clearScreen();
        brick.showString("Velocità aumentata:", 3);
        brick.showString(`${velocitaBase}`, 4);
        pause(1000);
    }
});

// Pulsante Giù: diminuisce la velocità base
brick.buttonDown.onEvent(ButtonEvent.Pressed, function() {
    // Decrementa solo se inizializzato è truthy
    if (inizializzato) {
        velocitaBase -= 10;
        // Limita la velocità minima
        // Usa l'operatore || per impostare un valore di default se velocitaBase diventa 0 (falsy)
        velocitaBase = velocitaBase || 10; // Se velocitaBase è 0 (falsy), imposta a 10
        
        brick.clearScreen();
        brick.showString("Velocità diminuita:", 3);
        brick.showString(`${velocitaBase}`, 4);
        pause(1000);
    }
});

// Pulsante Destro: attiva/disattiva il robot (dimostra toggleStato)
brick.buttonRight.onEvent(ButtonEvent.Pressed, function() {
    // Toglie il valore di inizializzato usando la funzione toggleStato
    inizializzato = toggleStato(inizializzato);
    
    // Mostra lo stato
    brick.clearScreen();
    brick.showString("Stato robot:", 3);
    brick.showString(inizializzato ? "ATTIVO" : "DISATTIVATO", 4);
    
    // Suono in base allo stato
    music.playSoundEffect(inizializzato ? SoundEffect.PowerUp : SoundEffect.PowerDown);
    
    if (!inizializzato) {
        // Se il robot è disattivato, ferma i motori
        motors.largeBC.stop();
    }
    
    pause(1000);
});