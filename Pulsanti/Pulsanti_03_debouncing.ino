// Sketch con debouncing del pulsante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int LED_PIN = 13;    // Pin a cui è collegato il LED

int ledState = LOW;         // Stato corrente del LED
int buttonState;            // Stato corrente del pulsante
int lastButtonState = HIGH; // Stato precedente del pulsante

// Variabili per il debouncing
unsigned long lastDebounceTime = 0;  // Ultimo momento in cui il pin è cambiato
unsigned long debounceDelay = 50;    // Tempo di debounce in ms

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, ledState);
}

void loop() {
  // Leggi lo stato del pulsante
  int reading = digitalRead(BUTTON_PIN);

  // Se lo stato è cambiato, resetta il timer di debounce
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  // Se è passato abbastanza tempo dal rimbalzo
  if ((millis() - lastDebounceTime) > debounceDelay) {
    // Se lo stato è effettivamente cambiato
    if (reading != buttonState) {
      buttonState = reading;

      // Cambia lo stato del LED solo se il pulsante è premuto (LOW con pull-up)
      if (buttonState == LOW) {
        ledState = !ledState;  // Inverti lo stato del LED
      }
    }
  }

  // Imposta il LED con lo stato corrente
  digitalWrite(LED_PIN, ledState);

  // Salva lo stato corrente come "ultimo stato" per il prossimo ciclo
  lastButtonState = reading;
}