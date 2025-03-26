/**
 * \Servo_02_rotazione_continua
 * 
 * Sketch per il controllo di un servo a rotazione continua con Arduino
 * Il servo ruota in senso orario, si ferma, ruota in senso antiorario e si ferma nuovamente.
 * 
 * https://github.com/filippo-bilardo/ROBOTICA/blob/main/servo/README.md
 * 
 * @author Filippo Bilardo
 * @version 1.0  20/03/25 - Versione iniziale
 */
#include <Servo.h>

const int SERVO_PIN = 9;  // Pin a cui è collegato il servo
Servo continuousServo;    // Crea un oggetto servo

void setup() {
  continuousServo.attach(SERVO_PIN);  // Collega il servo al pin specificato
}

void loop() {
  continuousServo.write(0);    // Rotazione in senso orario alla massima velocità
  delay(2000);                 // Mantieni per 2 secondi
  
  continuousServo.write(90);   // Fermo (valore neutro)
  delay(1000);                 // Mantieni fermo per 1 secondo
  
  continuousServo.write(180);  // Rotazione in senso antiorario alla massima velocità
  delay(2000);                 // Mantieni per 2 secondi
  
  continuousServo.write(90);   // Fermo (valore neutro)
  delay(1000);                 // Mantieni fermo per 1 secondo
}