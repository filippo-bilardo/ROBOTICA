/*
 * LED_09_led_non_bloccante.ino
 * 
 * Questo sketch dimostra come far lampeggiare un LED senza utilizzare la funzione delay(),
 * che blocca l'esecuzione del programma. Questo approccio permette ad Arduino di eseguire
 * altre operazioni mentre il LED lampeggia.
 * 
 * Circuito:
 * - LED collegato al pin 13 e GND attraverso una resistenza da 220 ohm
 * 
 * Creato il: 2023
 */

const int LED_PIN = 13;        // Pin a cui è collegato il LED

// Variabili per il controllo del lampeggio non bloccante
unsigned long previousMillis = 0;  // Memorizza l'ultimo momento in cui il LED è stato aggiornato
const long interval = 1000;        // Intervallo di lampeggio (millisecondi)
int ledState = LOW;                // Stato attuale del LED

void setup() {
  // Inizializza il pin digitale come output
  pinMode(LED_PIN, OUTPUT);
  
  // Inizializza la comunicazione seriale
  Serial.begin(9600);
  Serial.println("LED non bloccante - premi qualsiasi tasto per inviare un messaggio");
}

void loop() {
  // Controlla se sono disponibili dati sulla porta seriale
  if (Serial.available() > 0) {
    // Leggi il byte in arrivo
    char incomingByte = Serial.read();
    
    // Stampa il carattere ricevuto
    Serial.print("Ho ricevuto: ");
    Serial.println(incomingByte);
  }
  
  // Controlla se è trascorso abbastanza tempo dall'ultimo aggiornamento
  unsigned long currentMillis = millis();
  
  if (currentMillis - previousMillis >= interval) {
    // Salva l'ultimo momento in cui hai aggiornato il LED
    previousMillis = currentMillis;
    
    // Inverte lo stato del LED
    if (ledState == LOW) {
      ledState = HIGH;
    } else {
      ledState = LOW;
    }
    
    // Imposta il LED con il nuovo stato
    digitalWrite(LED_PIN, ledState);
    
    // Stampa un messaggio quando il LED cambia stato
    Serial.print("LED cambiato a: ");
    Serial.println(ledState == HIGH ? "ACCESO" : "SPENTO");
  }
  
  // Qui puoi inserire altro codice che verrà eseguito continuamente
  // senza essere bloccato dalla funzione delay()
}