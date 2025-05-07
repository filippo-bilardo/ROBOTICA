// 02_TipiDati.js
// Questo esempio mostra i diversi tipi di dati in JavaScript e come utilizzarli
// nella programmazione del robot EV3

// 1. Numeri (Number)
let velocita = 50;                 // Intero
let potenzaMotore = 0.75;          // Decimale (75% della potenza massima)
let distanzaMassima = 100.5;       // Altro decimale (cm)
let tempoAttesa = 2000;            // Intero (millisecondi)

// 2. Stringhe (String) 
let nomeRobot = "Explorer EV3";    // Con doppi apici
let statoAttuale = 'in attesa';    // Con apici singoli
let messaggioDisplay = `Robot: ${nomeRobot}`; // Template literal con interpolazione

// 3. Booleani (Boolean)
let robotAttivo = true;
let percorsoOstruito = false;
let sensorePremuto = sensors.touch1.isPressed(); // Ottiene un valore booleano dal sensore

// 4. Array (collezioni ordinate)
let velocitaDisponibili = [30, 50, 70, 90];  // Array di numeri
let direzioniPossibili = ["avanti", "indietro", "sinistra", "destra"];  // Array di stringhe
let sequenzaLuci = [true, false, true, true, false];  // Array di booleani

// 5. Oggetti (Object)
let configurazione = {
    motori: {
        sinistro: "B",
        destro: "C"
    },
    velocitaStandard: 50,
    tempoRotazione: 1500,
    modalitaSicura: true
};

// 6. Undefined e Null
let sensoreFacoltativo;          // Undefined (valore non ancora definito)
let connessioneBluetooth = null; // Null (assenza intenzionale di un valore)

// Visualizziamo informazioni sui tipi di dati sul display
brick.clearScreen();
brick.showString("Esempio Tipi di Dati", 1);
brick.showString("Premi tasti per testare", 2);

// Funzione per visualizzare il tipo di un valore
function mostraTipo(valore, nome, riga) {
    let tipo = typeof valore;
    brick.showString(`${nome}: ${valore} (${tipo})`, riga);
}

// Mostriamo alcuni valori e i loro tipi
function aggiornaDisplay() {
    brick.clearScreen();
    brick.showString("Tipi di Dati in JS", 1);
    mostraTipo(velocita, "Velocita", 2);
    mostraTipo(nomeRobot, "Nome", 3);
    mostraTipo(robotAttivo, "Attivo", 4);
    brick.showString(`Array: ${velocitaDisponibili}`, 5);
    brick.showString(`Motore SX: ${configurazione.motori.sinistro}`, 6);
    
    // Mostra undefined e null
    if (sensoreFacoltativo === undefined) {
        brick.showString("Sensore: undefined", 7);
    }
    
    if (connessioneBluetooth === null) {
        brick.showString("Bluetooth: null", 8);
    }
}

// Aggiorna il display inizialmente
aggiornaDisplay();

// Gestione dei pulsanti per dimostrare operazioni sui tipi di dati
brick.buttonUp.onEvent(ButtonEvent.Pressed, function () {
    // Operazioni con numeri
    velocita += 10;
    if (velocita > 100) {
        velocita = 100;
    }
    
    // Conversione numero a stringa
    let velocitaTesto = String(velocita);
    brick.clearScreen();
    brick.showString("Operazioni su numeri", 1);
    brick.showString(`Velocita: ${velocita}`, 2);
    brick.showString(`Come testo: ${velocitaTesto}`, 3);
    brick.showString(`Lunghezza: ${velocitaTesto.length}`, 4);
    
    // Dimostriamo l'uso di Math per operazioni numeriche
    let potenza = Math.pow(velocita, 2);
    let radice = Math.sqrt(velocita);
    brick.showString(`Velocita^2: ${potenza}`, 5);
    brick.showString(`Radice: ${radice.toFixed(2)}`, 6);
});

brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    // Operazioni con array
    brick.clearScreen();
    brick.showString("Operazioni su array", 1);
    
    // Accesso a elementi dell'array
    let primaVelocita = velocitaDisponibili[0];
    let ultimaDirezione = direzioniPossibili[direzioniPossibili.length - 1];
    
    brick.showString(`Prima vel: ${primaVelocita}`, 2);
    brick.showString(`Ultima dir: ${ultimaDirezione}`, 3);
    
    // Modifica di un array
    velocitaDisponibili.push(100);
    brick.showString(`Aggiunto: ${velocitaDisponibili}`, 4);
    
    let rimosso = velocitaDisponibili.pop();
    brick.showString(`Rimosso: ${rimosso}`, 5);
    brick.showString(`Risultato: ${velocitaDisponibili}`, 6);
    
    // Lunghezza dell'array
    brick.showString(`Lunghezza: ${velocitaDisponibili.length}`, 7);
});

brick.buttonLeft.onEvent(ButtonEvent.Pressed, function () {
    // Operazioni con oggetti
    brick.clearScreen();
    brick.showString("Operazioni su oggetti", 1);
    
    // Accesso alle proprietà
    brick.showString(`Velocita: ${configurazione.velocitaStandard}`, 2);
    brick.showString(`Motore SX: ${configurazione.motori.sinistro}`, 3);
    
    // Modifica di proprietà
    configurazione.velocitaStandard += 5;
    configurazione.modalitaSicura = !configurazione.modalitaSicura;
    
    brick.showString(`Nuova vel: ${configurazione.velocitaStandard}`, 4);
    brick.showString(`Sicurezza: ${configurazione.modalitaSicura}`, 5);
    
    // Aggiunta di nuove proprietà
    configurazione.ultimoAvvio = "Oggi";
    brick.showString(`Nuovo campo: ${configurazione.ultimoAvvio}`, 6);
});

brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {
    // Operazioni con stringhe e booleani
    brick.clearScreen();
    brick.showString("Stringhe e booleani", 1);
    
    // Concatenazione e metodi per stringhe
    let saluto = "Ciao, " + nomeRobot + "!";
    brick.showString(saluto, 2);
    
    let maiuscolo = nomeRobot.toUpperCase();
    brick.showString(`Maiuscolo: ${maiuscolo}`, 3);
    
    // Sottostringhe
    let primaParte = nomeRobot.substring(0, 8);
    brick.showString(`Parte: ${primaParte}`, 4);
    
    // Operazioni con booleani
    robotAttivo = !robotAttivo;
    brick.showString(`Attivo: ${robotAttivo}`, 5);
    
    // Conversione booleano a stringa
    let attivoTesto = String(robotAttivo);
    brick.showString(`Come testo: ${attivoTesto}`, 6);
    
    // Conversione stringa a booleano
    let testBooleano = Boolean("false");  // Attenzione: è true!
    brick.showString(`"false" -> ${testBooleano}`, 7);
});

brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
    // Torna alla visualizzazione principale
    aggiornaDisplay();
    
    // Dimostriamo la conversione tra tipi
    pause(2000);
    
    brick.clearScreen();
    brick.showString("Conversione tra tipi", 1);
    
    // Stringa a numero
    let velocitaTesto = "42";
    let velocitaNumero = Number(velocitaTesto);
    brick.showString(`"42" -> ${velocitaNumero} (${typeof velocitaNumero})`, 2);
    
    // Operazioni che evidenziano il tipo
    brick.showString(`"42" + 10 = ${"42" + 10}`, 3);  // Concatena: "4210"
    brick.showString(`42 + 10 = ${42 + 10}`, 4);      // Somma: 52
    
    // Altri esempi di conversione
    let zeroStringa = String(0);
    let zeroBooleano = Boolean(0);
    let stringaVuotaBooleano = Boolean("");
    let stringaPienaBooleano = Boolean("Ciao");
    
    brick.showString(`0 -> "${zeroStringa}"`, 5);
    brick.showString(`0 -> ${zeroBooleano}`, 6);
    brick.showString(`"" -> ${stringaVuotaBooleano}`, 7);
    brick.showString(`"Ciao" -> ${stringaPienaBooleano}`, 8);
});