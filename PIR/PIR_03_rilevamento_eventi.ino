/*
 * PIR_03_rilevamento_eventi.ino
 * 
 * Sketch per rilevare eventi di movimento (transizioni di stato)
 * Rileva l'inizio e la fine del movimento e calcola la durata
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

unsigned long motionStartTime = 0;  // Tempo di inizio del movimento
unsigned long motionDuration = 0;   // Durata del movimento

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("Inizializzazione sensore PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);  // Attendi 60 secondi per permettere al sensore di calibrarsi
  Serial.println("Sensore pronto!");
}

void loop() {
  pirState = digitalRead(PIR_PIN);  // Leggi lo stato del sensore PIR
  
  // Rileva il passaggio da LOW a HIGH (inizio movimento)
  if (pirState == HIGH && lastPirState == LOW) {
    motionStartTime = millis();
    digitalWrite(LED_PIN, HIGH);
    Serial.println(">>> Movimento iniziato!");
  }
  
  // Rileva il passaggio da HIGH a LOW (fine movimento)
  if (pirState == LOW && lastPirState == HIGH) {
    motionDuration = millis() - motionStartTime;
    digitalWrite(LED_PIN, LOW);
    Serial.print("<<< Movimento terminato. Durata: ");
    Serial.print(motionDuration / 1000.0);
    Serial.println(" secondi");
  }
  
  lastPirState = pirState;  // Aggiorna lo stato precedente
  delay(100);
}
