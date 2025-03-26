/**
 * \Servo_01_controllo_base
 * 
 * Sketch base per il controllo di un servo motore con Arduino
 * Il servo viene posizionato a 0°, 90° e 180° in sequenza.
 * 
 * https://github.com/filippo-bilardo/ROBOTICA/blob/main/servo/README.md
 * 
 * @author Filippo Bilardo
 * @version 1.0  20/03/25 - Versione iniziale
 */
#include <Servo.h>

const int SERVO_PIN = 9;  // Pin a cui è collegato il servo
Servo myServo;           // Crea un oggetto servo

void setup() {
  myServo.attach(SERVO_PIN);  // Collega il servo al pin specificato
}

void loop() {
  myServo.write(0);    // Muove il servo a 0 gradi
  delay(1000);         // Attende 1 secondo
  myServo.write(90);   // Muove il servo a 90 gradi
  delay(1000);         // Attende 1 secondo
  myServo.write(180);  // Muove il servo a 180 gradi
  delay(1000);         // Attende 1 secondo
}