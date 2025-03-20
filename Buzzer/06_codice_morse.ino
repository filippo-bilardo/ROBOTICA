// Comunicazione in codice Morse
const int BUZZER_PIN = 8;

// Parametri temporali del codice Morse (in ms)
const int dotDuration = 200;
const int dashDuration = dotDuration * 3;
const int symbolPause = dotDuration;
const int letterPause = dotDuration * 3;
const int wordPause = dotDuration * 7;

// Dizionario Morse per lettere e numeri
String morseDict[] = {
  ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---", // A-J
  "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-",  // K-T
  "..-", "...-", ".--", "-..-", "-.--", "--..",                         // U-Z
  "-----", ".----", "..---", "...--", "....-",                          // 0-4
  ".....", "-....", "--...", "---..", "----."}                           // 5-9
;

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Sistema di comunicazione Morse attivo");
  Serial.println("Inserisci il messaggio da convertire:");
}

void loop() {
  // Controlla se ci sono dati disponibili dalla seriale
  if (Serial.available() > 0) {
    String message = Serial.readStringUntil('\n');
    Serial.print("Messaggio ricevuto: ");
    Serial.println(message);
    Serial.print("Codice Morse: ");
    
    // Converte e riproduce il messaggio
    for (int i = 0; i < message.length(); i++) {
      char c = toupper(message.charAt(i));
      
      if (c == ' ') {
        // Pausa tra parole
        Serial.print("   ");
        delay(wordPause);
      } else if (c >= 'A' && c <= 'Z') {
        // Lettere
        String morse = morseDict[c - 'A'];
        Serial.print(morse + " ");
        playMorseCode(morse);
        delay(letterPause);
      } else if (c >= '0' && c <= '9') {
        // Numeri
        String morse = morseDict[26 + (c - '0')];
        Serial.print(morse + " ");
        playMorseCode(morse);
        delay(letterPause);
      }
    }
    
    Serial.println("\nMessaggio completato!");
  }
}

void playMorseCode(String code) {
  for (int i = 0; i < code.length(); i++) {
    if (code.charAt(i) == '.') {
      // Punto
      tone(BUZZER_PIN, 1000);
      delay(dotDuration);
    } else if (code.charAt(i) == '-') {
      // Linea
      tone(BUZZER_PIN, 1000);
      delay(dashDuration);
    }
    
    // Ferma il tono e attendi prima del prossimo simbolo
    noTone(BUZZER_PIN);
    delay(symbolPause);
  }
}