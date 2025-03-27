// Sketch per una macchina a stati controllata da pulsante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int LED_RED = 9;     // Pin a cui è collegato il LED rosso
const int LED_GREEN = 10;  // Pin a cui è collegato il LED verde
const int LED_BLUE = 11;   // Pin a cui è collegato il LED blu

// Definizione degli stati
enum State {
  STATE_RED,
  STATE_GREEN,
  STATE_BLUE,
  STATE_OFF
};

// Variabili di stato
State currentState = STATE_OFF;           // Stato corrente della macchina a stati
int buttonState = HIGH;                   // Stato corrente del pulsante
int lastButtonState = HIGH;               // Stato precedente del pulsante

// Variabili per il debouncing
unsigned long lastDebounceTime = 0;       // Ultimo momento in cui il pin è cambiato
const unsigned long DEBOUNCE_DELAY = 50;  // Tempo di debounce (ms)

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  
  // Inizializza tutti i LED spenti
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_BLUE, LOW);
  
  Serial.println("Macchina a stati inizializzata. Stato: OFF");
}

void loop() {
  // Gestione del pulsante
  int reading = digitalRead(BUTTON_PIN);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  
  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == LOW) {  // Se il pulsante è premuto (LOW con pull-up)
        // Cambia lo stato
        switch (currentState) {
          case STATE_OFF:
            currentState = STATE_RED;
            Serial.println("Stato: ROSSO");
            break;
          case STATE_RED:
            currentState = STATE_GREEN;
            Serial.println("Stato: VERDE");
            break;
          case STATE_GREEN:
            currentState = STATE_BLUE;
            Serial.println("Stato: BLU");
            break;
          case STATE_BLUE:
            currentState = STATE_OFF;
            Serial.println("Stato: OFF");
            break;
        }
        
        // Aggiorna i LED in base allo stato corrente
        updateLEDs();
      }
    }
  }
  lastButtonState = reading;
}

// Funzione per aggiornare i LED in base allo stato corrente
void updateLEDs() {
  // Spegni tutti i LED
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_BLUE, LOW);
  
  // Accendi il LED corrispondente allo stato corrente
  switch (currentState) {
    case STATE_RED:
      digitalWrite(LED_RED, HIGH);
      break;
    case STATE_GREEN:
      digitalWrite(LED_GREEN, HIGH);
      break;
    case STATE_BLUE:
      digitalWrite(LED_BLUE, HIGH);
      break;
    case STATE_OFF:
      // Tutti i LED rimangono spenti
      break;
  }
}