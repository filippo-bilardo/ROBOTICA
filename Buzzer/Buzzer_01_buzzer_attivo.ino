// Sketch base per buzzer attivo
const int BUZZER_PIN = 8;  // Pin a cui è collegato il buzzer

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);  // Imposta il pin del buzzer come output
}

void loop() {
  digitalWrite(BUZZER_PIN, HIGH);  // Attiva il buzzer
  delay(1000);                    // Mantieni attivo per 1 secondo
  digitalWrite(BUZZER_PIN, LOW);   // Disattiva il buzzer
  delay(1000);                    // Pausa di 1 secondo
}