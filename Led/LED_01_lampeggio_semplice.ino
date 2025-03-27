/*
 * LED_01_lampeggio_semplice.ino
 * 
 * Questo sketch fa lampeggiare un LED collegato al pin 13 di Arduino.
 * Il LED integrato sulla scheda Arduino è collegato al pin 13, quindi
 * non è necessario collegare un LED esterno per vedere il risultato.
 * 
 * Circuito:
 * - LED collegato al pin 13 e GND attraverso una resistenza da 220 ohm
 * 
 * Creato il: 2023
 */

const int LED_PIN = 13;  // Pin a cui è collegato il LED

void setup() {
  // Inizializza il pin digitale come output
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);   // Accende il LED (HIGH è il livello di tensione)
  delay(1000);                   // Attende un secondo
  digitalWrite(LED_PIN, LOW);    // Spegne il LED rendendo il pin LOW
  delay(1000);                   // Attende un secondo
}