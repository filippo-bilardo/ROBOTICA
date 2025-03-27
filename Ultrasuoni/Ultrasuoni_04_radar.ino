// Radar ultrasonico con visualizzazione seriale
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int SERVO_PIN = 11;  // Pin per il servomotore

#include <Servo.h>

Servo radarServo;  // Crea un oggetto servo

// Parametri del radar
const int MIN_ANGLE = 15;    // Angolo minimo di scansione
const int MAX_ANGLE = 165;   // Angolo massimo di scansione
const int STEP_ANGLE = 5;    // Incremento dell'angolo per ogni passo
const int MAX_DISTANCE = 200; // Distanza massima da visualizzare (cm)

// Variabili di stato
int currentAngle = MIN_ANGLE;
int scanDirection = 1;  // 1 = in senso orario, -1 = in senso antiorario

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  radarServo.attach(SERVO_PIN);
  radarServo.write(currentAngle);  // Posiziona il servo all'angolo iniziale
  
  Serial.begin(9600);
  Serial.println("Radar ultrasonico attivo");
  Serial.println("Formato dati: angolo,distanza");
  delay(1000);  // Attendi che il servo raggiunga la posizione iniziale
}

void loop() {
  // Misura la distanza all'angolo corrente
  int distance = measureDistance();
  
  // Limita la distanza al valore massimo
  if (distance > MAX_DISTANCE || distance <= 0) {
    distance = MAX_DISTANCE;
  }
  
  // Invia i dati al monitor seriale nel formato "angolo,distanza"
  Serial.print(currentAngle);
  Serial.print(",");
  Serial.println(distance);
  
  // Muovi il servo al prossimo angolo
  currentAngle += (STEP_ANGLE * scanDirection);
  
  // Cambia direzione se raggiungi i limiti
  if (currentAngle >= MAX_ANGLE || currentAngle <= MIN_ANGLE) {
    scanDirection *= -1;  // Inverti la direzione
  }
  
  // Assicurati che l'angolo rimanga nei limiti
  currentAngle = constrain(currentAngle, MIN_ANGLE, MAX_ANGLE);
  
  // Posiziona il servo al nuovo angolo
  radarServo.write(currentAngle);
  
  delay(100);  // Piccolo ritardo per stabilità
}

// Funzione per misurare la distanza
int measureDistance() {
  long duration;
  
  // Invia impulso ultrasonico
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Misura il tempo di ritorno dell'eco
  duration = pulseIn(ECHO_PIN, HIGH);
  
  // Calcola e restituisci la distanza in cm
  return duration / 58;
}