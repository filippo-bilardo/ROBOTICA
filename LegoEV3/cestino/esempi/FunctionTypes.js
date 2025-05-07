// ===== ESEMPI DI TIPI DI FUNZIONI JAVASCRIPT PER LEGO EV3 MAKECODE =====
// Questo file contiene 5 esempi che illustrano diversi tipi di funzioni JavaScript
// applicati alla programmazione del robot LEGO EV3 usando la piattaforma MakeCode

// ===== ESEMPIO 1: FUNZIONI DICHIARATE (NAMED FUNCTIONS) =====
// Le funzioni dichiarate sono definite con la parola chiave "function" seguita dal nome
// Sono caricate in memoria prima dell'esecuzione del codice (hoisting)

/**
 * Esempio di un sistema di navigazione base che utilizza funzioni dichiarate
 * per controllare i movimenti del robot EV3
 */

// Configurazione dei motori
const motorSinistro = motors.largeA;
const motorDestro = motors.largeB;

// Funzione dichiarata per far avanzare il robot
function avanti(velocita, durata) {
    brick.showString("Movimento: Avanti", 1);
    motorSinistro.run(velocita);
    motorDestro.run(velocita);
    
    if (durata > 0) {
        pause(durata);
        ferma();
    }
}

// Funzione dichiarata per far girare il robot a sinistra
function giraSinistra(velocita, durata) {
    brick.showString("Movimento: Sinistra", 1);
    motorSinistro.run(-velocita);
    motorDestro.run(velocita);
    
    if (durata > 0) {
        pause(durata);
        ferma();
    }
}

// Funzione dichiarata per far girare il robot a destra
function giraDestra(velocita, durata) {
    brick.showString("Movimento: Destra", 1);
    motorSinistro.run(velocita);
    motorDestro.run(-velocita);
    
    if (durata > 0) {
        pause(durata);
        ferma();
    }
}

// Funzione dichiarata per fermare il robot
function ferma() {
    brick.showString("Movimento: Stop", 1);
    motorSinistro.stop();
    motorDestro.stop();
}

// Esempio di utilizzo delle funzioni dichiarate
function eseguiPercorsoBase() {
    brick.showString("Percorso base", 2);
    avanti(50, 2000);       // Avanti per 2 secondi
    giraDestra(30, 1000);   // Gira a destra per 1 secondo
    avanti(50, 2000);       // Avanti per 2 secondi
    giraSinistra(30, 1000); // Gira a sinistra per 1 secondo
    avanti(50, 1000);       // Avanti per 1 secondo
    ferma();                // Ferma il robot
    brick.showString("Percorso completato", 2);
}

// ===== ESEMPIO 2: FUNZIONI FRECCIA (ARROW FUNCTIONS) =====
// Le funzioni freccia sono una sintassi più concisa per definire funzioni
// Mantengono il contesto "this" del contesto in cui sono definite

/**
 * Esempio di un sistema di rilevamento ostacoli che utilizza funzioni freccia
 * per gestire le letture del sensore e le reazioni del robot
 */

// Configurazione del sensore a ultrasuoni
const sensoreUltrasuoni = sensors.ultrasonic4;

// Funzione freccia per ottenere la distanza dall'ostacolo
const getDistanza = () => sensoreUltrasuoni.distance();

// Funzione freccia con più istruzioni
const controllaOstacolo = () => {
    const distanza = getDistanza();
    brick.showString(`Distanza: ${distanza} cm`, 3);
    return distanza < 15; // Restituisce true se c'è un ostacolo entro 15 cm
};

// Funzione freccia che accetta parametri
const evitaOstacolo = (velocitaRotazione = 30) => {
    brick.showString("Evito ostacolo", 2);
    
    // Indietro
    motorSinistro.run(-30);
    motorDestro.run(-30);
    pause(500);
    
    // Gira
    motorSinistro.run(velocitaRotazione);
    motorDestro.run(-velocitaRotazione);
    pause(1000);
    
    // Avanti
    motorSinistro.run(50);
    motorDestro.run(50);
};

// Funzione freccia che utilizza altre funzioni freccia
const modalitaEvitamentoOstacoli = (durata = 10000) => {
    brick.showString("Modalità evitamento", 1);
    
    const startTime = control.millis();
    
    // Continua a controllare per la durata specificata
    while (control.millis() - startTime < durata) {
        // Vai avanti se non ci sono ostacoli
        if (!controllaOstacolo()) {
            motorSinistro.run(30);
            motorDestro.run(30);
        } else {
            // Evita l'ostacolo se rilevato
            evitaOstacolo();
        }
        pause(100);
    }
    
    // Ferma i motori alla fine
    motorSinistro.stop();
    motorDestro.stop();
    brick.showString("Modalità completata", 1);
};

// ===== ESEMPIO 3: FUNZIONI DI ORDINE SUPERIORE (HIGHER-ORDER FUNCTIONS) =====
// Le funzioni di ordine superiore sono funzioni che accettano altre funzioni come parametri
// o restituiscono funzioni come risultato

/**
 * Esempio di un sistema di controllo avanzato che utilizza funzioni di ordine superiore
 * per creare comportamenti complessi e riutilizzabili
 */

// Funzione di ordine superiore che esegue un'azione per un certo tempo
function eseguiPerTempo(azione, durata) {
    const startTime = control.millis();
    
    while (control.millis() - startTime < durata) {
        azione();
        pause(50);
    }
}

// Funzione di ordine superiore che ripete un'azione un certo numero di volte
function ripeti(azione, volte) {
    for (let i = 0; i < volte; i++) {
        azione();
    }
}

// Funzione di ordine superiore che crea una nuova funzione di movimento
function creaMovimento(velocitaSinistra, velocitaDestra) {
    return function() {
        motorSinistro.run(velocitaSinistra);
        motorDestro.run(velocitaDestra);
    };
}

// Funzione di ordine superiore che misura il tempo di esecuzione di una funzione
function conTempo(funzione) {
    return function(...args) {
        const inizio = control.millis();
        const risultato = funzione(...args);
        const fine = control.millis();
        brick.showString(`Tempo: ${fine - inizio} ms`, 4);
        return risultato;
    };
}

// Esempio di utilizzo delle funzioni di ordine superiore
function eseguiComportamentoComplesso() {
    brick.showString("Comportamento complesso", 1);
    
    // Crea movimenti personalizzati
    const avanzaVeloce = creaMovimento(80, 80);
    const giraLento = creaMovimento(20, -20);
    const zigzag = creaMovimento(50, 30);
    
    // Esegui sequenza di movimenti
    eseguiPerTempo(avanzaVeloce, 2000);  // Avanza veloce per 2 secondi
    eseguiPerTempo(giraLento, 1000);     // Gira lento per 1 secondo
    
    // Ripeti un movimento più volte
    ripeti(() => {
        eseguiPerTempo(zigzag, 500);     // Zigzag per 0.5 secondi
        eseguiPerTempo(giraLento, 300);  // Gira per 0.3 secondi
    }, 3);
    
    // Ferma i motori
    motorSinistro.stop();
    motorDestro.stop();
    
    brick.showString("Completato", 1);
}

// Misura il tempo di esecuzione del comportamento complesso
const eseguiComportamentoConTempo = conTempo(eseguiComportamentoComplesso);

// ===== ESEMPIO 4: FUNZIONI DI CALLBACK =====
// Le funzioni di callback sono funzioni passate come argomenti ad altre funzioni
// e vengono eseguite dopo che un'operazione è stata completata

/**
 * Esempio di un sistema di sensori che utilizza callback per reagire
 * a eventi e letture dei sensori
 */

// Configurazione del sensore di colore
const sensoreColore = sensors.color1;

// Funzione che monitora il sensore di colore e chiama il callback appropriato
function monitoraColore(onRosso, onVerde, onBlu, onAltro, intervallo = 100) {
    control.runInParallel(() => {
        while (true) {
            const colore = sensoreColore.color();
            
            switch (colore) {
                case ColorSensorColor.Red:
                    onRosso();
                    break;
                case ColorSensorColor.Green:
                    onVerde();
                    break;
                case ColorSensorColor.Blue:
                    onBlu();
                    break;
                default:
                    onAltro(colore);
                    break;
            }
            
            pause(intervallo);
        }
    });
}

// Funzione che esegue un'azione dopo un certo tempo
function dopoTempo(tempo, callback) {
    control.runInParallel(() => {
        pause(tempo);
        callback();
    });
}

// Funzione che esegue azioni in sequenza
function sequenza(azioni) {
    let indice = 0;
    
    function eseguiProssima() {
        if (indice < azioni.length) {
            const azioneCorrente = azioni[indice];
            indice++;
            
            // Se l'azione è una funzione, eseguila e passa alla prossima
            if (typeof azioneCorrente === "function") {
                azioneCorrente();
                eseguiProssima();
            } 
            // Se l'azione è un oggetto con azione e ritardo, esegui dopo il ritardo
            else if (azioneCorrente.azione && azioneCorrente.ritardo) {
                dopoTempo(azioneCorrente.ritardo, () => {
                    azioneCorrente.azione();
                    eseguiProssima();
                });
            }
        }
    }
    
    // Avvia la sequenza
    eseguiProssima();
}

// Esempio di utilizzo delle funzioni di callback
function avviaMonitoraggioColori() {
    brick.showString("Monitoraggio colori", 1);
    
    // Definizione delle callback per diversi colori
    const azioneRosso = () => {
        brick.showString("Colore: ROSSO", 2);
        motorSinistro.run(50);
        motorDestro.run(50);
    };
    
    const azioneVerde = () => {
        brick.showString("Colore: VERDE", 2);
        motorSinistro.stop();
        motorDestro.stop();
    };
    
    const azioneBlu = () => {
        brick.showString("Colore: BLU", 2);
        motorSinistro.run(-30);
        motorDestro.run(-30);
    };
    
    const azioneAltro = (colore) => {
        brick.showString(`Colore: ALTRO (${colore})`, 2);
        motorSinistro.run(20);
        motorDestro.run(-20);
    };
    
    // Avvia il monitoraggio con le callback
    monitoraColore(azioneRosso, azioneVerde, azioneBlu, azioneAltro);
    
    // Esegui una sequenza di azioni con ritardi
    sequenza([
        { azione: () => brick.showString("Inizio sequenza", 3), ritardo: 0 },
        { azione: () => brick.showString("Passo 1", 3), ritardo: 2000 },
        { azione: () => brick.showString("Passo 2", 3), ritardo: 2000 },
        { azione: () => brick.showString("Fine sequenza", 3), ritardo: 2000 }
    ]);
}

// ===== ESEMPIO 5: IIFE (IMMEDIATELY INVOKED FUNCTION EXPRESSIONS) =====
// Le IIFE sono funzioni che vengono eseguite immediatamente dopo essere state definite
// Sono utili per creare scope isolati e inizializzare configurazioni

/**
 * Esempio di un sistema di configurazione e inizializzazione che utilizza IIFE
 * per impostare parametri e avviare comportamenti del robot
 */

// IIFE per configurare e inizializzare il robot
const robotController = (() => {
    // Variabili private (non accessibili dall'esterno)
    let velocitaBase = 40;
    let modalitaAttiva = "standby";
    let intervalloId = null;
    
    // Configurazione iniziale
    brick.showString("Inizializzazione...", 1);
    
    // Funzioni private
    function aggiornaDashboard() {
        brick.showString(`Modalità: ${modalitaAttiva}`, 2);
        brick.showString(`Velocità: ${velocitaBase}`, 3);
    }
    
    // Inizializzazione dei sensori
    const sensori = {
        ultrasuoni: sensors.ultrasonic4,
        colore: sensors.color1,
        touch: sensors.touch3
    };
    
    // Restituisce l'API pubblica
    return {
        // Metodi pubblici accessibili dall'esterno
        aumentaVelocita: () => {
            velocitaBase += 10;
            if (velocitaBase > 100) velocitaBase = 100;
            aggiornaDashboard();
            return velocitaBase;
        },
        
        diminuisciVelocita: () => {
            velocitaBase -= 10;
            if (velocitaBase < 0) velocitaBase = 0;
            aggiornaDashboard();
            return velocitaBase;
        },
        
        getVelocita: () => velocitaBase,
        
        getModalita: () => modalitaAttiva,
        
        avviaModalita: (modalita) => {
            // Ferma la modalità corrente se attiva
            if (intervalloId !== null) {
                control.clearInterval(intervalloId);
                intervalloId = null;
            }
            
            modalitaAttiva = modalita;
            aggiornaDashboard();
            
            // Avvia la nuova modalità
            switch (modalita) {
                case "seguilinea":
                    intervalloId = control.setInterval(() => {
                        const luce = sensori.colore.light(LightIntensityMode.Reflected);
                        if (luce < 30) {
                            motorSinistro.run(velocitaBase);
                            motorDestro.run(velocitaBase);
                        } else {
                            motorSinistro.run(velocitaBase * 0.5);
                            motorDestro.run(velocitaBase * 1.5);
                        }
                    }, 50);
                    break;
                    
                case "evitaostacoli":
                    intervalloId = control.setInterval(() => {
                        const distanza = sensori.ultrasuoni.distance();
                        if (distanza < 15) {
                            motorSinistro.run(-velocitaBase);
                            motorDestro.run(velocitaBase);
                        } else {
                            motorSinistro.run(velocitaBase);
                            motorDestro.run(velocitaBase);
                        }
                    }, 50);
                    break;
                    
                case "standby":
                default:
                    motorSinistro.stop();
                    motorDestro.stop();
                    break;
            }
        },
        
        ferma: () => {
            if (intervalloId !== null) {
                control.clearInterval(intervalloId);
                intervalloId = null;
            }
            modalitaAttiva = "standby";
            motorSinistro.stop();
            motorDestro.stop();
            aggiornaDashboard();
        }
    };
})(); // La funzione viene eseguita immediatamente

// Esempio di utilizzo del controller creato con IIFE
function testRobotController() {
    // Utilizzo dei metodi pubblici del controller
    robotController.avviaModalita("standby");
    pause(1000);
    
    // Aumenta la velocità
    robotController.aumentaVelocita();
    robotController.aumentaVelocita();
    
    // Avvia la modalità seguilinea
    robotController.avviaModalita("seguilinea");
    pause(5000);
    
    // Cambia alla modalità evita ostacoli
    robotController.avviaModalita("evitaostacoli");
    pause(5000);
    
    // Ferma il robot
    robotController.ferma();
}

// ===== CONFIGURAZIONE DEI PULSANTI EV3 =====
// Associa le diverse funzioni di esempio ai pulsanti del brick EV3

// Pulsante ENTER: Esegui il percorso base (Esempio 1: Funzioni dichiarate)
brick.buttonEnter.onEvent(ButtonEvent.Pressed, eseguiPercorsoBase);

// Pulsante UP: Avvia la modalità evitamento ostacoli (Esempio 2: Funzioni freccia)
brick.buttonUp.onEvent(ButtonEvent.Pressed, () => modalitaEvitamentoOstacoli(15000));

// Pulsante RIGHT: Esegui il comportamento complesso (Esempio 3: Funzioni di ordine superiore)
brick.buttonRight.onEvent(ButtonEvent.Pressed, eseguiComportamentoConTempo);

// Pulsante DOWN: Avvia il monitoraggio colori (Esempio 4: Funzioni di callback)
brick.buttonDown.onEvent(ButtonEvent.Pressed, avviaMonitoraggioColori);

// Pulsante LEFT: Testa il controller del robot (Esempio 5: IIFE)
brick.buttonLeft.onEvent(ButtonEvent.Pressed, testRobotController);

// Pulsante ESC: Ferma tutti i motori
brick.buttonEsc.onEvent(ButtonEvent.Pressed, () => {
    motorSinistro.stop();
    motorDestro.stop();
    brick.showString("STOP", 1);
    brick.showString("", 2);
    brick.showString("", 3);
    brick.showString("", 4);
});

// Mostra le istruzioni iniziali
brick.showString("ESEMPI FUNZIONI JS", 1);
brick.showString("ENTER: Funz. dichiarate", 2);
brick.showString("UP: Funz. freccia", 3);
brick.showString("RIGHT: Funz. ordine sup.", 4);
brick.showString("DOWN: Callback", 5);
brick.showString("LEFT: IIFE", 6);
