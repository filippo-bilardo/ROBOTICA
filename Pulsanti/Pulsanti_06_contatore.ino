// Sketch per un contatore con pulsante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int RESET_PIN = 3;   // Pin a cui è collegato il pulsante di reset

// Variabili di stato
int counter = 0;                          // Contatore
int buttonState = HIGH;                   // Stato corrente del pulsante
int lastButtonState = HIGH;               // Stato precedente del pulsante
int resetButtonState = HIGH;              // Stato corrente del pulsante di reset
int lastResetButtonState = HIGH;          // Stato precedente del pulsante di reset

// Variabili per il debouncing
unsigned long lastDebounceTime = 0;       // Ultimo momento in cui il pin è cambiato
unsigned long lastResetDebounceTime = 0;  // Ultimo momento in cui il pin di reset è cambiato
const unsigned long DEBOUNCE_DELAY = 50;  // Tempo di debounce (ms)

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(RESET_PIN, INPUT_PULLUP);
  Serial.println("Contatore inizializzato a 0");
}

void loop() {
  // Gestione del pulsante principale
  int reading = digitalRead(BUTTON_PIN);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  
  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == LOW) {  // Se il pulsante è premuto (LOW con pull-up)
        counter++;               // Incrementa il contatore
        Serial.print("Contatore: ");
        Serial.println(counter);
      }
    }
  }
  lastButtonState = reading;
  
  // Gestione del pulsante di reset
  int resetReading = digitalRead(RESET_PIN);
  if (resetReading != lastResetButtonState) {
    lastResetDebounceTime = millis();
  }
  
  if ((millis() - lastResetDebounceTime) > DEBOUNCE_DELAY) {
    if (resetReading != resetButtonState) {
      resetButtonState = resetReading;
      if (resetButtonState == LOW) {  // Se il pulsante di reset è premuto
        counter = 0;                  // Resetta il contatore
        Serial.println("Contatore resettato a 0");
      }
    }
  }
  lastResetButtonState = resetReading;
}