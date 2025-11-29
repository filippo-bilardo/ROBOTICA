/*
 * PIR_06_sistema_allarme.ino
 * 
 * Sistema di allarme con sensore PIR che può essere attivato/disattivato
 * tramite un pulsante. Quando attivo, rileva movimenti e fa scattare l'allarme.
 * 
 * Componenti necessari:
 * - Arduino Uno (o compatibile)
 * - Sensore PIR HC-SR501
 * - LED rosso e verde
 * - Buzzer
 * - Pulsante
 * - Resistori (220Ω per LED, 10kΩ per pulsante se non si usa pull-up interno)
 * - Cavi di collegamento
 * 
 * Collegamento:
 * PIR VCC        -> Arduino 5V
 * PIR GND        -> Arduino GND
 * PIR OUT        -> Arduino Pin 2
 * LED Rosso (+)  -> Arduino Pin 9 -> Resistore 220Ω -> LED (-) -> GND
 * LED Verde (+)  -> Arduino Pin 10 -> Resistore 220Ω -> LED (-) -> GND
 * Buzzer (+)     -> Arduino Pin 11
 * Buzzer (-)     -> Arduino GND
 * Pulsante       -> Arduino Pin 3 e GND (con INPUT_PULLUP)
 * 
 * Autore: Filippo Bilardo
 * Data: 29/11/2025
 */

const int PIR_PIN = 2;       // Pin a cui è collegato il sensore PIR
const int LED_RED = 9;       // Pin a cui è collegato il LED rosso
const int LED_GREEN = 10;    // Pin a cui è collegato il LED verde
const int BUZZER_PIN = 11;   // Pin a cui è collegato il buzzer
const int ARM_BUTTON = 3;    // Pin del pulsante per attivare/disattivare l'allarme

// Stati del sistema
enum AlarmState {
  DISARMED,    // Sistema disattivato
  ARMED,       // Sistema attivo
  TRIGGERED    // Allarme scattato
};

AlarmState currentState = DISARMED;
int pirState = LOW;
int lastPirState = LOW;
int buttonState = HIGH;
int lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long DEBOUNCE_DELAY = 50;

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(ARM_BUTTON, INPUT_PULLUP);
  
  // Stato iniziale: disattivato
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(LED_RED, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  
  Serial.println("Sistema di allarme con PIR");
  Serial.println("Inizializzazione sensore PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);
  Serial.println("Sistema pronto!");
  Serial.println("Premere il pulsante per attivare/disattivare l'allarme");
}

void loop() {
  // Gestione del pulsante con debouncing
  int reading = digitalRead(ARM_BUTTON);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  
  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == LOW) {  // Pulsante premuto
        toggleAlarm();
      }
    }
  }
  lastButtonState = reading;
  
  // Gestione del sensore PIR
  pirState = digitalRead(PIR_PIN);
  
  // Se il sistema è armato e viene rilevato movimento
  if (currentState == ARMED && pirState == HIGH && lastPirState == LOW) {
    triggerAlarm();
  }
  
  lastPirState = pirState;
  
  // Gestione del buzzer se l'allarme è scattato
  if (currentState == TRIGGERED) {
    tone(BUZZER_PIN, 1000, 200);  // Suona per 200ms
    delay(200);
    noTone(BUZZER_PIN);
    delay(100);
  }
}

// Funzione per attivare/disattivare l'allarme
void toggleAlarm() {
  if (currentState == DISARMED) {
    currentState = ARMED;
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
    Serial.println("Sistema ATTIVATO");
  } else {
    currentState = DISARMED;
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
    noTone(BUZZER_PIN);
    Serial.println("Sistema DISATTIVATO");
  }
}

// Funzione per far scattare l'allarme
void triggerAlarm() {
  currentState = TRIGGERED;
  Serial.println("!!! ALLARME SCATTATO !!!");
  Serial.println("Movimento rilevato!");
}
