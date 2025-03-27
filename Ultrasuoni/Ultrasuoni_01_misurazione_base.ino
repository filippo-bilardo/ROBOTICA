// Sketch base per sensore a ultrasuoni HC-SR04
const int TRIG_PIN = 9;  // Pin Trigger del sensore
const int ECHO_PIN = 10; // Pin Echo del sensore

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.begin(9600);
  Serial.println("Sensore a ultrasuoni HC-SR04 attivo");
}

void loop() {
  // Variabili per la durata dell'impulso e la distanza risultante
  long duration, distance;
  
  // Invia impulso ultrasonico
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Misura il tempo di ritorno dell'eco
  duration = pulseIn(ECHO_PIN, HIGH);
  
  // Calcola la distanza (in cm)
  // La velocità del suono è 343 m/s o 34300 cm/s
  // Il tempo misurato è di andata e ritorno, quindi dividiamo per 2
  // Quindi: distanza = (tempo × 34300) / 2 / 1000000 = tempo / 58
  distance = duration / 58;
  
  // Visualizza la distanza sul monitor seriale
  Serial.print("Distanza: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  delay(500);  // Attendi mezzo secondo prima della prossima misurazione
}