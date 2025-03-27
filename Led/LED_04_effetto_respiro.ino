/*
 * LED_04_effetto_respiro.ino
 * 
 * Questo sketch crea un effetto di "respiro" (breathing effect) con un LED,
 * simulando un'accensione e uno spegnimento graduali con un andamento sinusoidale.
 * 
 * Circuito:
 * - LED collegato al pin 9 (deve essere un pin PWM) e GND attraverso una resistenza da 220 ohm
 * 
 * Creato il: 2023
 */

const int LED_PIN = 9;  // Pin PWM a cui è collegato il LED

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // Utilizza la funzione seno per creare un effetto di respiro più naturale
  for (int i = 0; i < 360; i++) {
    // Converte l'angolo in radianti e calcola il seno
    float rad = i * (PI / 180.0);
    float sinVal = sin(rad);
    
    // Trasforma il valore del seno (che va da -1 a 1) in un valore da 0 a 255
    int brightness = int((sinVal + 1.0) * 127.5);
    
    // Imposta la luminosità del LED
    analogWrite(LED_PIN, brightness);
    
    // Piccolo ritardo per rendere l'effetto visibile
    delay(5);
  }
}