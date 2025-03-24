// https://wokwi.com/projects/425671950741994497

const int LED_PIN = 2; // Pin a cui è collegato il LED

void setup() {
  // Inizializza la comunicazione seriale a 9600 baud
  Serial.begin(9600);
  Serial.println("Avvio riconoscitore. Digitare 'a' o 's'");

  // Imposta il pin del LED come output
  pinMode(LED_PIN, OUTPUT);

  // Spegni il LED all'inizio
  digitalWrite(LED_PIN, LOW);
}

void loop() {
  // Controlla se ci sono dati disponibili per la lettura
  if (Serial.available() > 0) {
    // Leggi un carattere dalla porta seriale
    char incomingByte = Serial.read();

    // Accendi o spegni il LED in base al carattere ricevuto
    if (incomingByte == 'a') {
      digitalWrite(LED_PIN, HIGH); // Accendi il LED
      Serial.println("LED acceso");
    } else if (incomingByte == 's') {
      digitalWrite(LED_PIN, LOW); // Spegni il LED
      Serial.println("LED spento");
    }
  }
}
