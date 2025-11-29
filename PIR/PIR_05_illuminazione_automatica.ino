/*
 * PIR_05_illuminazione_automatica.ino
 * 
 * Sistema di illuminazione automatica che accende le luci quando rileva movimento
 * e le spegne automaticamente dopo un periodo di inattività
 * 
 * Componenti necessari:
 * - Arduino Uno (o compatibile)
 * - Sensore PIR HC-SR501
 * - LED (o modulo relè per luci reali)
 * - Resistore 220Ω
 * - Cavi di collegamento
 * 
 * Collegamento:
 * PIR VCC  -> Arduino 5V
 * PIR GND  -> Arduino GND
 * PIR OUT  -> Arduino Pin 2
 * LED (+)  -> Arduino Pin 13 -> Resistore 220Ω -> LED (-) -> GND
 * 
 * Autore: Filippo Bilardo
 * Data: 29/11/2025
 */

const int PIR_PIN = 2;     // Pin a cui è collegato il sensore PIR
const int LED_PIN = 13;    // Pin a cui è collegato il LED (o relè)

int pirState = LOW;                        // Stato corrente del sensore
int ledState = LOW;                        // Stato corrente del LED
unsigned long lastMotionTime = 0;          // Ultimo momento in cui è stato rilevato movimento
const unsigned long LIGHT_TIMEOUT = 10000; // Timeout dopo cui spegnere le luci (10 secondi)

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("Sistema di illuminazione automatica");
  Serial.println("Inizializzazione sensore PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);  // Attendi 60 secondi per permettere al sensore di calibrarsi
  Serial.println("Sistema pronto!");
}

void loop() {
  pirState = digitalRead(PIR_PIN);  // Leggi lo stato del sensore PIR
  unsigned long currentMillis = millis();
  
  // Se viene rilevato movimento
  if (pirState == HIGH) {
    if (ledState == LOW) {
      ledState = HIGH;
      digitalWrite(LED_PIN, HIGH);
      Serial.println("Movimento rilevato - Luci accese");
    }
    lastMotionTime = currentMillis;  // Aggiorna il tempo dell'ultimo movimento
  }
  
  // Se le luci sono accese e è passato il timeout senza movimento
  if (ledState == HIGH && (currentMillis - lastMotionTime >= LIGHT_TIMEOUT)) {
    ledState = LOW;
    digitalWrite(LED_PIN, LOW);
    Serial.println("Timeout raggiunto - Luci spente");
  }
  
  delay(100);
}
