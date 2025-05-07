// 02_For.js
// Questo esempio mostra come utilizzare il ciclo for per creare sequenze
// di movimenti e comportamenti strutturati nel robot EV3

// Configurazione dei sensori
let sensoreUltrasuoni = sensors.ultrasonic4;  // Sensore ultrasuoni sulla porta 4
let sensoreTocco = sensors.touch1;            // Sensore di tocco sulla porta 1
let sensoreColore = sensors.color3;           // Sensore di colore sulla porta 3

// Configurazione iniziale
brick.clearScreen();
brick.showString("Esempio For", 1);
brick.showString("Robot in attesa...", 3);
brick.showString("Premi il pulsante centrale", 8);

// Variabili di configurazione
let velocitaBase = 50;
let programmaSelezionato = 1;  // Programma predefinito

// PROGRAMMA 1: Percorso a zigzag con ampiezza crescente
function percorsoZigzag() {
    brick.clearScreen();
    brick.showString("Zigzag Progressivo", 1);
    
    // Esegue un pattern a zigzag con ampiezza crescente
    for (let ampiezza = 10; ampiezza <= 100; ampiezza += 10) {
        // Mostra l'ampiezza corrente
        brick.showString(`Ampiezza: ${ampiezza}`, 3);
        
        // Gira a destra
        motors.largeBC.tank(velocitaBase, velocitaBase / 2);
        pause(ampiezza * 10);  // Tempo proporzionale all'ampiezza
        
        // Controlla l'interruzione
        if (sensoreTocco.isPressed()) {
            break;  // Esce dal ciclo se il sensore di tocco è premuto
        }
        
        // Gira a sinistra
        motors.largeBC.tank(velocitaBase / 2, velocitaBase);
        pause(ampiezza * 10);
        
        // Controlla l'interruzione
        if (sensoreTocco.isPressed()) {
            break;  // Esce dal ciclo se il sensore di tocco è premuto
        }
    }
    
    // Termina il programma
    motors.largeBC.stop();
    brick.showString("Programma completato", 5);
    music.playSoundEffect(SoundEffect.Success);
}

// PROGRAMMA 2: Esplorazione a spirale
function esplorazioneSpirale() {
    brick.clearScreen();
    brick.showString("Esplorazione a Spirale", 1);
    
    // Durata iniziale in millisecondi
    let durata = 1000;
    
    // Esegue una spirale (cerchi di raggio crescente)
    for (let giro = 1; giro <= 5; giro++) {
        // Mostra il numero del giro
        brick.showString(`Giro #${giro}`, 3);
        
        // Aumenta la durata ad ogni giro
        durata += 500;
        
        // Esegui un cerchio completo
        motors.largeBC.tank(70, 40);
        
        // Monitora la durata e il sensore di ostacoli
        let tempoInizio = control.millis();
        while ((control.millis() - tempoInizio) < durata) {
            // Controlla se c'è un ostacolo
            if (sensoreUltrasuoni.distance() < 20) {
                brick.showString("Ostacolo rilevato!", 5);
                motors.largeBC.stop();
                music.playSoundEffect(SoundEffect.Alarm);
                pause(1000);
                
                // Evita l'ostacolo
                motors.largeBC.tank(-50, -50);
                pause(1000);
                motors.largeBC.tank(50, -50);
                pause(1000);
                
                // Ricomincia il giro
                break;
            }
            
            // Controlla se il pulsante è premuto per interrompere
            if (sensoreTocco.isPressed()) {
                return;  // Esce completamente dalla funzione
            }
            
            pause(100);  // Piccola pausa per il polling
        }
        
        // Breve pausa tra i giri
        motors.largeBC.stop();
        brick.showString("Passaggio completato", 5);
        pause(500);
    }
    
    // Termina il programma
    motors.largeBC.stop();
    brick.showString("Esplorazione completata", 5);
    music.playSoundEffect(SoundEffect.Success);
}

// PROGRAMMA 3: Sequenza di movimenti da array
function sequenzaDiMovimenti() {
    brick.clearScreen();
    brick.showString("Sequenza di Movimenti", 1);
    
    // Array di comandi per una sequenza di movimenti
    let sequenzaComandi = [
        { azione: "avanti", durata: 2000, velocita: 50 },
        { azione: "destra", durata: 1000, velocita: 40 },
        { azione: "avanti", durata: 1500, velocita: 60 },
        { azione: "sinistra", durata: 1000, velocita: 40 },
        { azione: "avanti", durata: 2000, velocita: 70 },
        { azione: "sinistra", durata: 1000, velocita: 40 },
        { azione: "avanti", durata: 1500, velocita: 50 },
        { azione: "stop", durata: 1000, velocita: 0 }
    ];
    
    // Esegui la sequenza di comandi
    for (let i = 0; i < sequenzaComandi.length; i++) {
        let comando = sequenzaComandi[i];
        
        // Mostra il comando corrente
        brick.showString(`${i+1}/${sequenzaComandi.length}: ${comando.azione}`, 3);
        brick.showString(`Velocità: ${comando.velocita}`, 4);
        brick.showString(`Durata: ${comando.durata} ms`, 5);
        
        // Esegui l'azione appropriata
        if (comando.azione === "avanti") {
            motors.largeBC.tank(comando.velocita, comando.velocita);
        } else if (comando.azione === "destra") {
            motors.largeBC.tank(comando.velocita, -comando.velocita);
        } else if (comando.azione === "sinistra") {
            motors.largeBC.tank(-comando.velocita, comando.velocita);
        } else if (comando.azione === "indietro") {
            motors.largeBC.tank(-comando.velocita, -comando.velocita);
        } else if (comando.azione === "stop") {
            motors.largeBC.stop();
        }
        
        // Barra di avanzamento
        let tempoInizio = control.millis();
        let durataTotale = comando.durata;
        
        // Aggiorna la barra di avanzamento mentre esegue il comando
        while ((control.millis() - tempoInizio) < durataTotale) {
            // Calcola la percentuale di completamento
            let percentuale = Math.round(((control.millis() - tempoInizio) / durataTotale) * 100);
            let barraProgresso = "";
            
            // Crea una barra di avanzamento visiva
            for (let j = 0; j < 10; j++) {
                if (j < percentuale / 10) {
                    barraProgresso += "■";
                } else {
                    barraProgresso += "□";
                }
            }
            
            // Mostra la barra di avanzamento
            brick.showString(`${barraProgresso} ${percentuale}%`, 6);
            
            // Controlla se il pulsante è premuto per interrompere
            if (sensoreTocco.isPressed()) {
                motors.largeBC.stop();
                return;  // Esce completamente dalla funzione
            }
            
            pause(50);  // Aggiorna la barra di avanzamento ogni 50ms
        }
    }
    
    // Termina il programma
    motors.largeBC.stop();
    brick.showString("Sequenza completata!", 7);
    music.playSoundEffect(SoundEffect.Success);
}

// PROGRAMMA 4: Test dei motori
function testMotori() {
    brick.clearScreen();
    brick.showString("Test Motori", 1);
    
    // Array con le diverse velocità da testare
    let velocita = [20, 40, 60, 80, 100];
    
    // Itera attraverso le diverse velocità
    for (let i = 0; i < velocita.length; i++) {
        let velocitaAttuale = velocita[i];
        
        // Mostra la velocità corrente
        brick.showString(`Test velocità: ${velocitaAttuale}`, 3);
        
        // Avanti
        brick.showString("Avanti", 4);
        motors.largeBC.tank(velocitaAttuale, velocitaAttuale);
        pause(2000);
        
        // Indietro
        brick.showString("Indietro", 4);
        motors.largeBC.tank(-velocitaAttuale, -velocitaAttuale);
        pause(2000);
        
        // Rotazione a destra
        brick.showString("Rotazione destra", 4);
        motors.largeBC.tank(velocitaAttuale, -velocitaAttuale);
        pause(2000);
        
        // Rotazione a sinistra
        brick.showString("Rotazione sinistra", 4);
        motors.largeBC.tank(-velocitaAttuale, velocitaAttuale);
        pause(2000);
        
        // Breve pausa tra i test
        motors.largeBC.stop();
        brick.showString(`Test ${i+1}/${velocita.length} completato`, 5);
        
        // Attendi la pressione di un pulsante per continuare al prossimo test
        brick.showString("Premi per continuare...", 7);
        
        // Attendi la pressione del pulsante
        while (!brick.buttonEnter.isPressed() && !sensoreTocco.isPressed()) {
            pause(100);
        }
        
        // Se è stato premuto il sensore di tocco, interrompi i test
        if (sensoreTocco.isPressed()) {
            break;
        }
        
        // Attendi il rilascio del pulsante
        while (brick.buttonEnter.isPressed()) {
            pause(100);
        }
    }
    
    // Termina il programma
    motors.largeBC.stop();
    brick.showString("Test motori completato", 7);
    music.playSoundEffect(SoundEffect.Success);
}

// PROGRAMMA 5: Effetti sonori
function effettiSonori() {
    brick.clearScreen();
    brick.showString("Effetti Sonori", 1);
    
    // Array con le frequenze per una scala musicale
    let scale = [262, 294, 330, 349, 392, 440, 494, 523];
    
    // Riproduci una scala ascendente
    brick.showString("Scala ascendente", 3);
    for (let i = 0; i < scale.length; i++) {
        let nota = scale[i];
        brick.showString(`Nota: ${nota} Hz`, 4);
        music.playTone(nota, 500);
        pause(600);  // Pausa per evitare sovrapposizioni
    }
    
    // Riproduci una scala discendente
    brick.showString("Scala discendente", 3);
    for (let i = scale.length - 1; i >= 0; i--) {
        let nota = scale[i];
        brick.showString(`Nota: ${nota} Hz`, 4);
        music.playTone(nota, 500);
        pause(600);
    }
    
    // Riproduci alcuni effetti sonori predefiniti
    let effetti = [
        { nome: "Success", effetto: SoundEffect.Success },
        { nome: "Ready", effetto: SoundEffect.Ready },
        { nome: "Alarm", effetto: SoundEffect.Alarm },
        { nome: "Blip", effetto: SoundEffect.Blip },
        { nome: "Boing", effetto: SoundEffect.Boing },
        { nome: "Stop", effetto: SoundEffect.Stop }
    ];
    
    brick.showString("Effetti predefiniti", 3);
    for (let i = 0; i < effetti.length; i++) {
        brick.showString(`Effetto: ${effetti[i].nome}`, 4);
        music.playSoundEffect(effetti[i].effetto);
        pause(1000);
    }
    
    // Termina il programma
    brick.showString("Demo audio completata", 5);
}

// Funzione principale che esegue il programma selezionato
function eseguiProgramma() {
    // In base al programma selezionato, esegue la funzione appropriata
    switch (programmaSelezionato) {
        case 1:
            percorsoZigzag();
            break;
        case 2:
            esplorazioneSpirale();
            break;
        case 3:
            sequenzaDiMovimenti();
            break;
        case 4:
            testMotori();
            break;
        case 5:
            effettiSonori();
            break;
        default:
            brick.showString("Programma non valido", 3);
            break;
    }
}

// Mostra il menu principale
function mostraMenu() {
    brick.clearScreen();
    brick.showString("MENU PROGRAMMI:", 0);
    brick.showString("1: Zigzag Progressivo", 2);
    brick.showString("2: Esplorazione a Spirale", 3);
    brick.showString("3: Sequenza di Movimenti", 4);
    brick.showString("4: Test dei Motori", 5);
    brick.showString("5: Effetti Sonori", 6);
    brick.showString(`> Selezionato: ${programmaSelezionato}`, 8);
}

// Mostra il menu iniziale
mostraMenu();

// Pulsante centrale: avvia il programma selezionato
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function() {
    music.playSoundEffect(SoundEffect.Ready);
    eseguiProgramma();
    // Quando il programma termina, mostra di nuovo il menu
    mostraMenu();
});

// Pulsante Su: seleziona il programma precedente
brick.buttonUp.onEvent(ButtonEvent.Pressed, function() {
    programmaSelezionato--;
    if (programmaSelezionato < 1) programmaSelezionato = 5;
    mostraMenu();
});

// Pulsante Giù: seleziona il programma successivo
brick.buttonDown.onEvent(ButtonEvent.Pressed, function() {
    programmaSelezionato++;
    if (programmaSelezionato > 5) programmaSelezionato = 1;
    mostraMenu();
});