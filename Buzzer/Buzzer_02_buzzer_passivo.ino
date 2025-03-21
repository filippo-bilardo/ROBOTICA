// Sketch base per buzzer passivo
const int BUZZER_PIN = 8;  // Pin a cui è collegato il buzzer

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);  // Imposta il pin del buzzer come output
}

void loop() {
  tone(BUZZER_PIN, 1000);  // Genera un tono a 1000 Hz
  delay(1000);             // Mantieni il tono per 1 secondo
  noTone(BUZZER_PIN);      // Ferma il tono
  delay(1000);             // Pausa di 1 secondo
}