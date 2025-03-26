/**
 * \Servo_06_braccio_robotico
 * 
 * Sketch per il controllo di un braccio robotico semplice con Arduino
 * Due servo motori controllano la base e il braccio tramite un joystick.
 * 
 * https://github.com/filippo-bilardo/ROBOTICA/blob/main/servo/README.md
 * 
 * @author Filippo Bilardo
 * @version 1.0  20/03/25 - Versione iniziale
 */
#include <Servo.h>

const int BASE_SERVO_PIN = 9;    // Pin per il servo della base
const int ARM_SERVO_PIN = 10;    // Pin per il servo del braccio
const int JOYSTICK_X_PIN = A0;   // Pin analogico per l'asse X del joystick
const int JOYSTICK_Y_PIN = A1;   // Pin analogico per l'asse Y del joystick

Servo baseServo;                 // Servo per la rotazione della base
Servo armServo;                  // Servo per il movimento del braccio

int basePosition = 90;           // Posizione iniziale della base
int armPosition = 90;            // Posizione iniziale del braccio

void setup() {
  baseServo.attach(BASE_SERVO_PIN);  // Collega il servo della base
  armServo.attach(ARM_SERVO_PIN);    // Collega il servo del braccio
  
  // Imposta le posizioni iniziali
  baseServo.write(basePosition);
  armServo.write(armPosition);
  
  Serial.begin(9600);  // Inizializza la comunicazione seriale
}

void loop() {
  // Legge i valori del joystick
  int joystickX = analogRead(JOYSTICK_X_PIN);
  int joystickY = analogRead(JOYSTICK_Y_PIN);
  
  // Mappa i valori del joystick per il movimento dei servo
  // Aggiunge una zona morta centrale per evitare movimenti indesiderati
  if (abs(joystickX - 512) > 50) {  // Se il joystick è spostato sull'asse X
    int xMovement = map(joystickX, 0, 1023, -2, 2);  // Converte in incrementi di movimento
    basePosition = constrain(basePosition + xMovement, 0, 180);  // Aggiorna la posizione
    baseServo.write(basePosition);  // Muove il servo della base
  }
  
  if (abs(joystickY - 512) > 50) {  // Se il joystick è spostato sull'asse Y
    int yMovement = map(joystickY, 0, 1023, -2, 2);  // Converte in incrementi di movimento
    armPosition = constrain(armPosition + yMovement, 0, 180);  // Aggiorna la posizione
    armServo.write(armPosition);  // Muove il servo del braccio
  }
  
  // Visualizza i valori sulla console seriale
  Serial.print("Joystick X: ");
  Serial.print(joystickX);
  Serial.print(" | Base: ");
  Serial.print(basePosition);
  Serial.print(" | Joystick Y: ");
  Serial.print(joystickY);
  Serial.print(" | Braccio: ");
  Serial.println(armPosition);
  
  delay(15);  // Piccolo ritardo per stabilità
}