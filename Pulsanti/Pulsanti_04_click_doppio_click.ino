// Sketch per rilevare click singolo e doppio click
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int LED_PIN = 13;    // Pin a cui è collegato il LED

// Parametri per il rilevamento dei click
const unsigned long CLICK_TIMEOUT = 250;    // Tempo massimo tra due click per un doppio click (ms)
const unsigned long DEBOUNCE_DELAY = 50;    // Tempo di debounce (ms)

// Variabili di stato
int ledState = LOW;                        // Stato corrente del LED
int buttonState = HIGH;                    // Stato corrente del pulsante
int lastButtonState = HIGH;                // Stato precedente del pulsante

// Variabili per il timing
unsigned long lastDebounceTime = 0;        // Ultimo momento in cui il pin è cambiato
unsigned long lastClickTime = 0;           // Momento dell'ultimo click
int clickCount = 0;                        // Contatore dei click

void setup() {
  Serial.begin(9600);
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
  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
    // Se lo stato è effettivamente cambiato
    if (reading != buttonState) {
      buttonState = reading;

      // Se il pulsante è stato rilasciato (HIGH con pull-up)
      if (buttonState == HIGH) {
        // Incrementa il contatore dei click
        clickCount++;
        lastClickTime = millis();
      }
    }
  }

  // Controlla se è passato il tempo di timeout per i click
  if (clickCount > 0 && (millis() - lastClickTime) > CLICK_TIMEOUT) {
    // Esegui l'azione in base al numero di click
    if (clickCount == 1) {
      Serial.println("Click singolo rilevato");
      ledState = !ledState;  // Inverti lo stato del LED
    } else if (clickCount == 2) {
      Serial.println("Doppio click rilevato");
      // Lampeggia il LED rapidamente 5 volte
      for (int i = 0; i < 5; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(100);
        digitalWrite(LED_PIN, LOW);
        delay(100);
      }
    }
    
    // Resetta il contatore dei click
    clickCount = 0;
  }

  // Imposta il LED con lo stato corrente
  digitalWrite(LED_PIN, ledState);

  // Salva lo stato corrente come "ultimo stato" per il prossimo ciclo
  lastButtonState = reading;
}