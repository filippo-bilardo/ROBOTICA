// Programma insegui linea per robot EV3 in JavaScript per MakeCode
// Autore: Claude - Esempio per "Programmazione ad oggetti con C++"

// Costanti di configurazione
const VELOCITA_BASE = 30;       // Velocità base del robot (%)
const CORREZIONE_PROPORZIONALE = 20; // Fattore di correzione proporzionale
const VALORE_SOGLIA = 50;       // Valore soglia per distinguere bianco/nero (0-100)
const PORTA_SENSORE = brick.Ports.S3; // Porta dove è collegato il sensore di colore

// Classe per il controllo del robot insegui-linea
class InseguitoreLinea {
    constructor() {
        // Inizializzazione dei motori sulle porte B e C
        this.motoreDestro = motors.largeB;
        this.motoreSinistro = motors.largeC;
        
        // Inizializzazione del sensore di colore
        this.sensoreColore = sensors.color3(PORTA_SENSORE);
        
        // Variabili di stato
        this.inEsecuzione = false;
        this.ultimoErrore = 0;
    }
    
    // Metodo per avviare l'inseguimento della linea
    avvia() {
        // Visualizza messaggio di avvio
        brick.showString("Inseguitore di linea", 1);
        brick.showString("Premi ENTER per avviare", 2);
        brick.showString("Premi ESC per fermare", 3);
        
        // Attendi la pressione del tasto ENTER
        while (!brick.buttonEnter.isPressed()) {
            pause(10);
        }
        
        // Avvia il loop di inseguimento
        this.inEsecuzione = true;
        this.esegui();
    }
    
    // Metodo principale di esecuzione
    esegui() {
        while (this.inEsecuzione) {
            // Controlla se è stato premuto il tasto ESC per terminare
            if (brick.buttonEscape.isPressed()) {
                this.ferma();
                break;
            }
            
            // Ottieni il valore di riflettività dal sensore (0-100)
            const valoreRiflettivita = this.sensoreColore.reflectedLight();
            
            // Calcola l'errore rispetto alla soglia
            // Errore negativo: il robot è troppo a destra della linea
            // Errore positivo: il robot è troppo a sinistra della linea
            const errore = VALORE_SOGLIA - valoreRiflettivita;
            
            // Calcola la correzione proporzionale
            const correzione = errore * CORREZIONE_PROPORZIONALE / 100;
            
            // Calcola le velocità dei motori in base all'errore
            const velocitaDestra = VELOCITA_BASE - correzione;
            const velocitaSinistra = VELOCITA_BASE + correzione;
            
            // Applica le velocità ai motori
            this.motoreDestro.run(Math.clamp(velocitaDestra, -100, 100));
            this.motoreSinistro.run(Math.clamp(velocitaSinistra, -100, 100));
            
            // Visualizza le informazioni di debug
            brick.showString("Riflettività: " + valoreRiflettivita + "  ", 4);
            brick.showString("Errore: " + errore + "  ", 5);
            
            // Memorizza l'errore per il prossimo ciclo
            this.ultimoErrore = errore;
            
            // Breve pausa per evitare di sovraccaricare il processore
            pause(10);
        }
    }
    
    // Metodo per fermare il robot
    ferma() {
        this.inEsecuzione = false;
        this.motoreDestro.stop();
        this.motoreSinistro.stop();
        brick.showString("Programma terminato", 6);
    }
}

// Funzione principale
function main() {
    // Crea un'istanza della classe InseguitoreLinea
    const inseguitore = new InseguitoreLinea();
    
    // Avvia l'inseguimento
    inseguitore.avvia();
}

// Avvia il programma
main();