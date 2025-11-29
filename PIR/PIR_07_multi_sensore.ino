/*
 * PIR_07_multi_sensore.ino
 * 
 * Sistema multi-sensore PIR che monitora tre zone diverse
 * e tiene traccia dei movimenti rilevati in ciascuna zona
 * 
 * Componenti necessari:
 * - Arduino Uno (o compatibile)
 * - 3x Sensore PIR HC-SR501
 * - 3x LED
 * - 3x Resistore 220Ω
 * - Cavi di collegamento
 * 
 * Collegamento:
 * PIR1 VCC -> Arduino 5V
 * PIR1 GND -> Arduino GND
 * PIR1 OUT -> Arduino Pin 2
 * LED1 (+) -> Arduino Pin 9 -> Resistore 220Ω -> LED (-) -> GND
 * 
 * PIR2 VCC -> Arduino 5V
 * PIR2 GND -> Arduino GND
 * PIR2 OUT -> Arduino Pin 3
 * LED2 (+) -> Arduino Pin 10 -> Resistore 220Ω -> LED (-) -> GND
 * 
 * PIR3 VCC -> Arduino 5V
 * PIR3 GND -> Arduino GND
 * PIR3 OUT -> Arduino Pin 4
 * LED3 (+) -> Arduino Pin 11 -> Resistore 220Ω -> LED (-) -> GND
 * 
 * Autore: Filippo Bilardo
 * Data: 29/11/2025
 */

const int PIR_PIN_1 = 2;   // Pin del primo sensore PIR (zona 1)
const int PIR_PIN_2 = 3;   // Pin del secondo sensore PIR (zona 2)
const int PIR_PIN_3 = 4;   // Pin del terzo sensore PIR (zona 3)
const int LED_1 = 9;       // LED zona 1
const int LED_2 = 10;      // LED zona 2
const int LED_3 = 11;      // LED zona 3

// Stati dei sensori
int pirState1 = LOW;
int lastPirState1 = LOW;
int pirState2 = LOW;
int lastPirState2 = LOW;
int pirState3 = LOW;
int lastPirState3 = LOW;

// Contatori per ogni zona
int counter1 = 0;
int counter2 = 0;
int counter3 = 0;

void setup() {
  Serial.begin(9600);
  
  // Configura i pin dei sensori PIR
  pinMode(PIR_PIN_1, INPUT);
  pinMode(PIR_PIN_2, INPUT);
  pinMode(PIR_PIN_3, INPUT);
  
  // Configura i pin dei LED
  pinMode(LED_1, OUTPUT);
  pinMode(LED_2, OUTPUT);
  pinMode(LED_3, OUTPUT);
  
  Serial.println("Sistema multi-sensore PIR");
  Serial.println("Inizializzazione sensori PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);
  Serial.println("Sistema pronto!");
  Serial.println("Monitoraggio zone attivo:");
  Serial.println("- Zona 1 (Nord)");
  Serial.println("- Zona 2 (Est)");
  Serial.println("- Zona 3 (Sud)");
}

void loop() {
  // Leggi lo stato di tutti i sensori
  pirState1 = digitalRead(PIR_PIN_1);
  pirState2 = digitalRead(PIR_PIN_2);
  pirState3 = digitalRead(PIR_PIN_3);
  
  // Gestione Zona 1
  if (pirState1 == HIGH && lastPirState1 == LOW) {
    counter1++;
    digitalWrite(LED_1, HIGH);
    Serial.print("Zona 1 (Nord): Movimento rilevato! [Totale: ");
    Serial.print(counter1);
    Serial.println("]");
  }
  if (pirState1 == LOW && lastPirState1 == HIGH) {
    digitalWrite(LED_1, LOW);
  }
  lastPirState1 = pirState1;
  
  // Gestione Zona 2
  if (pirState2 == HIGH && lastPirState2 == LOW) {
    counter2++;
    digitalWrite(LED_2, HIGH);
    Serial.print("Zona 2 (Est): Movimento rilevato! [Totale: ");
    Serial.print(counter2);
    Serial.println("]");
  }
  if (pirState2 == LOW && lastPirState2 == HIGH) {
    digitalWrite(LED_2, LOW);
  }
  lastPirState2 = pirState2;
  
  // Gestione Zona 3
  if (pirState3 == HIGH && lastPirState3 == LOW) {
    counter3++;
    digitalWrite(LED_3, HIGH);
    Serial.print("Zona 3 (Sud): Movimento rilevato! [Totale: ");
    Serial.print(counter3);
    Serial.println("]");
  }
  if (pirState3 == LOW && lastPirState3 == HIGH) {
    digitalWrite(LED_3, LOW);
  }
  lastPirState3 = pirState3;
  
  delay(100);
}
