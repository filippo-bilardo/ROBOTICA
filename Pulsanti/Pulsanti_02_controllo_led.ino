// Sketch per controllare un LED con un pulsante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int LED_PIN = 13;    // Pin a cui è collegato il LED

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Imposta il pin del pulsante come input con pull-up
  pinMode(LED_PIN, OUTPUT);           // Imposta il pin del LED come output
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);  // Leggi lo stato del pulsante
  
  if (buttonState == LOW) {  // Se il pulsante è premuto (LOW con pull-up)
    digitalWrite(LED_PIN, HIGH);  // Accendi il LED
  } else {
    digitalWrite(LED_PIN, LOW);   // Spegni il LED
  }
}