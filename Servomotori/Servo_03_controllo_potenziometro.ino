/**
 * \Servo_03_controllo_potenziometro
 * 
 * Sketch per il controllo di un servo motore tramite potenziometro
 * La posizione del servo viene determinata dal valore letto dal potenziometro.
 * 
 * https://github.com/filippo-bilardo/ROBOTICA/blob/main/servo/README.md
 * 
 * @author Filippo Bilardo
 * @version 1.0  20/03/25 - Versione iniziale
 */
#include <Servo.h>

const int SERVO_PIN = 9;       // Pin a cui è collegato il servo
const int POT_PIN = A0;        // Pin analogico per il potenziometro
Servo myServo;                 // Crea un oggetto servo

int potValue;                  // Valore letto dal potenziometro
int servoPosition;             // Posizione del servo

void setup() {
  myServo.attach(SERVO_PIN);  // Collega il servo al pin specificato
  Serial.begin(9600);          // Inizializza la comunicazione seriale
}

void loop() {
  potValue = analogRead(POT_PIN);                // Legge il valore del potenziometro (0-1023)
  servoPosition = map(potValue, 0, 1023, 0, 180); // Converte il valore in gradi (0-180)
  myServo.write(servoPosition);                  // Imposta la posizione del servo
  
  // Visualizza i valori sulla console seriale
  Serial.print("Potenziometro: ");
  Serial.print(potValue);
  Serial.print(" | Posizione servo: ");
  Serial.println(servoPosition);
  
  delay(15);  // Piccolo ritardo per stabilità
}