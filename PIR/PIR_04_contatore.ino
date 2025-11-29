/*
 * PIR_04_contatore.ino
 * 
 * Sketch per contare i rilevamenti di movimento
 * 
 * Componenti necessari:
 * - Arduino Uno (o compatibile)
 * - Sensore PIR HC-SR501
 * - LED
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
const int LED_PIN = 13;    // Pin a cui è collegato il LED

int pirState = LOW;        // Stato corrente del sensore
int lastPirState = LOW;    // Stato precedente del sensore
int motionCounter = 0;     // Contatore dei rilevamenti

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("Inizializzazione sensore PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);  // Attendi 60 secondi per permettere al sensore di calibrarsi
  Serial.println("Sensore pronto!");
  Serial.println("Contatore inizializzato a 0");
}

void loop() {
  pirState = digitalRead(PIR_PIN);  // Leggi lo stato del sensore PIR
  
  // Rileva il passaggio da LOW a HIGH (inizio movimento)
  if (pirState == HIGH && lastPirState == LOW) {
    motionCounter++;
    digitalWrite(LED_PIN, HIGH);
    Serial.print("Movimento #");
    Serial.print(motionCounter);
    Serial.println(" rilevato!");
  }
  
  // Rileva il passaggio da HIGH a LOW (fine movimento)
  if (pirState == LOW && lastPirState == HIGH) {
    digitalWrite(LED_PIN, LOW);
  }
  
  lastPirState = pirState;  // Aggiorna lo stato precedente
  delay(100);
}
