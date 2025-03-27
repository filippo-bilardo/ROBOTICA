/*
 * LED_10_led_seriale.ino
 * 
 * Questo sketch dimostra come controllare un LED tramite comandi inviati
 * attraverso la comunicazione seriale. L'utente può inviare comandi per
 * accendere, spegnere o far lampeggiare il LED.
 * 
 * Circuito:
 * - LED collegato al pin 13 e GND attraverso una resistenza da 220 ohm
 * 
 * Comandi seriali:
 * - 'a': accende il LED
 * - 's': spegne il LED
 * - 'l': fa lampeggiare il LED 5 volte
 * - 'b' seguito da un numero (0-255): imposta la luminosità del LED
 * 
 * Creato il: 2023
 */

const int LED_PIN = 13;  // Pin a cui è collegato il LED

// Variabili per il controllo del LED
int ledState = LOW;      // Stato attuale del LED

void setup() {
  // Inizializza il pin digitale come output
  pinMode(LED_PIN, OUTPUT);
  
  // Inizializza la comunicazione seriale a 9600 bps
  Serial.begin(9600);
  
  // Messaggio di benvenuto
  Serial.println("\nControllo LED via seriale");
  Serial.println("Comandi disponibili:");
  Serial.println("  a: accendi LED");
  Serial.println("  s: spegni LED");
  Serial.println("  l: lampeggia LED 5 volte");
  Serial.println("  b[0-255]: imposta luminosità (es. b128)");
}

void loop() {
  // Controlla se sono disponibili dati sulla porta seriale
  if (Serial.available() > 0) {
    // Leggi il primo carattere disponibile
    char command = Serial.read();
    
    // Esegui l'azione in base al comando ricevuto
    switch (command) {
      case 'a':  // Accendi il LED
        digitalWrite(LED_PIN, HIGH);
        ledState = HIGH;
        Serial.println("LED acceso");
        break;
        
      case 's':  // Spegni il LED
        digitalWrite(LED_PIN, LOW);
        ledState = LOW;
        Serial.println("LED spento");
        break;
        
      case 'l':  // Lampeggia il LED 5 volte
        Serial.println("Lampeggio LED 5 volte");
        for (int i = 0; i < 5; i++) {
          digitalWrite(LED_PIN, HIGH);
          delay(200);
          digitalWrite(LED_PIN, LOW);
          delay(200);
        }
        // Ripristina lo stato precedente
        digitalWrite(LED_PIN, ledState);
        Serial.println("Lampeggio completato");
        break;
        
      case 'b':  // Imposta la luminosità (solo per pin PWM)
        // Attendi un momento per ricevere il valore numerico
        delay(10);
        // Leggi il valore di luminosità (0-255)
        if (Serial.available() > 0) {
          int brightness = 0;
          // Leggi i caratteri numerici fino a quando non ci sono più dati
          while (Serial.available() > 0) {
            char digit = Serial.read();
            if (isDigit(digit)) {
              brightness = brightness * 10 + (digit - '0');
            } else {
              break;  // Interrompi se non è un numero
            }
          }
          
          // Limita il valore tra 0 e 255
          brightness = constrain(brightness, 0, 255);
          
          // Imposta la luminosità
          analogWrite(LED_PIN, brightness);
          ledState = (brightness > 0) ? HIGH : LOW;
          
          Serial.print("Luminosità impostata a: ");
          Serial.println(brightness);
        }
        break;
        
      default:
        // Ignora caratteri non riconosciuti (come newline, carriage return, ecc.)
        if (command >= ' ') {  // Ignora caratteri di controllo
          Serial.print("Comando non riconosciuto: ");
          Serial.println(command);
        }
        break;
    }
  }
  
  // Altre operazioni possono essere eseguite qui
}