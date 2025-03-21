// Controllo del volume tramite PWM
const int BUZZER_PIN = 9;  // Usa un pin che supporti PWM (es. 3, 5, 6, 9, 10, 11)

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  // Volume crescente
  for (int volume = 0; volume <= 255; volume += 5) {
    analogWrite(BUZZER_PIN, volume);  // Imposta il "volume" tramite duty cycle
    delay(30);
  }
  
  // Volume decrescente
  for (int volume = 255; volume >= 0; volume -= 5) {
    analogWrite(BUZZER_PIN, volume);
    delay(30);
  }
  
  delay(1000);  // Pausa prima di ripetere
}