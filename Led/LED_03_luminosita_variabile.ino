/*
 * LED_03_luminosita_variabile.ino
 * 
 * Questo sketch dimostra come controllare la luminosità di un LED
 * utilizzando la modulazione PWM (Pulse Width Modulation).
 * 
 * Circuito:
 * - LED collegato al pin 9 (deve essere un pin PWM) e GND attraverso una resistenza da 220 ohm
 * 
 * Creato il: 2023
 */

const int LED_PIN = 9;  // Pin PWM a cui è collegato il LED

void setup() {
  // Non è necessario impostare il pin come OUTPUT quando si usa analogWrite
  // ma è una buona pratica farlo comunque
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // Aumenta gradualmente la luminosità
  for (int brightness = 0; brightness <= 255; brightness++) {
    analogWrite(LED_PIN, brightness);  // Imposta la luminosità (0-255)
    delay(10);                         // Breve pausa per rendere visibile il cambiamento
  }
  
  // Breve pausa alla massima luminosità
  delay(500);
  
  // Diminuisce gradualmente la luminosità
  for (int brightness = 255; brightness >= 0; brightness--) {
    analogWrite(LED_PIN, brightness);  // Imposta la luminosità (0-255)
    delay(10);                         // Breve pausa per rendere visibile il cambiamento
  }
  
  // Breve pausa con LED spento
  delay(500);
}