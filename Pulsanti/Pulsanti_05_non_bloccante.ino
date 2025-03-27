// Sketch con funzionalità non bloccante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int LED_PIN = 13;    // Pin a cui è collegato il LED
const int TEMP_SENSOR_PIN = A0;  // Pin del sensore di temperatura

// Variabili di stato
int ledState = LOW;                        // Stato corrente del LED
int buttonState = HIGH;                    // Stato corrente del pulsante
int lastButtonState = HIGH;                // Stato precedente del pulsante

// Variabili per il timing
unsigned long lastDebounceTime = 0;        // Ultimo momento in cui il pin è cambiato
unsigned long lastTempReadTime = 0;        // Ultimo momento in cui è stata letta la temperatura
const unsigned long DEBOUNCE_DELAY = 50;   // Tempo di debounce (ms)
const unsigned long TEMP_READ_INTERVAL = 2000;  // Intervallo di lettura della temperatura (ms)

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, ledState);
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Task 1: Gestione del pulsante con debouncing
  int reading = digitalRead(BUTTON_PIN);
  if (reading != lastButtonState) {
    lastDebounceTime = currentMillis;
  }
  
  if ((currentMillis - lastDebounceTime) > DEBOUNCE_DELAY) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == LOW) {  // Se il pulsante è premuto (LOW con pull-up)
        ledState = !ledState;    // Inverti lo stato del LED
        digitalWrite(LED_PIN, ledState);
        Serial.println(ledState ? "LED acceso" : "LED spento");
      }
    }
  }
  lastButtonState = reading;
  
  // Task 2: Lettura periodica della temperatura
  if (currentMillis - lastTempReadTime >= TEMP_READ_INTERVAL) {
    lastTempReadTime = currentMillis;
    int sensorValue = analogRead(TEMP_SENSOR_PIN);
    float temperature = (sensorValue * 5.0 / 1024.0 - 0.5) * 100;  // Conversione per LM35
    Serial.print("Temperatura: ");
    Serial.print(temperature);
    Serial.println(" °C");
  }
  
  // Altri task possono essere aggiunti qui senza bloccare l'esecuzione
}