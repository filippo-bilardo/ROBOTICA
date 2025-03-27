/*
 * LED_02_controllo_pulsante.ino
 * 
 * Questo sketch controlla un LED tramite un pulsante.
 * Quando il pulsante è premuto, il LED si accende.
 * 
 * Circuito:
 * - LED collegato al pin 13 e GND attraverso una resistenza da 220 ohm
 * - Pulsante collegato al pin 2 e GND
 * 
 * Creato il: 2023
 */

const int LED_PIN = 13;     // Pin a cui è collegato il LED
const int BUTTON_PIN = 2;   // Pin a cui è collegato il pulsante

void setup() {
  pinMode(LED_PIN, OUTPUT);           // Imposta il pin del LED come output
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Imposta il pin del pulsante come input con resistenza pull-up
}

void loop() {
  // Leggi lo stato del pulsante
  int buttonState = digitalRead(BUTTON_PIN);
  
  // Controlla se il pulsante è premuto
  // Se utilizziamo INPUT_PULLUP, il pulsante restituisce LOW quando è premuto
  if (buttonState == LOW) {
    digitalWrite(LED_PIN, HIGH);  // Accendi il LED
  } else {
    digitalWrite(LED_PIN, LOW);   // Spegni il LED
  }
}