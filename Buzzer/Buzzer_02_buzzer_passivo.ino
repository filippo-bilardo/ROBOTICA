/**
 * \Buzzer_02_buzzer_passivo
 * 
 * Scketch per il buzzer passivo con Arduino
 * Il tono viene generato con la funzione tone() e viene fermato con la funzione noTone().
 * 
 * https://wokwi.com/projects/425933995361295361
 * https://github.com/filippo-bilardo/ROBOTICA/tree/main/Buzzer
 * 
 * @author Fippo Bilardo
 * @version 1.0  20/03/25 - Versione iniziale
 */
const int BUZZER_PIN = 8;  // Pin a cui è collegato il buzzer

#define NOTE_D5  587  // Frequenza della nota D5 in Hz
#define NOTE_DS5 622  // Frequenza della nota D5#
#define NOTE_C5  523  // Frequenza della nota C5 
#define NOTE_CS5 554  // Frequenza della nota C5#

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);  // Imposta il pin del buzzer come output

  tone(BUZZER_PIN, NOTE_DS5);  // Esegui la nota D5
  delay(300);  // Attendi 0.3 secondi
  tone(BUZZER_PIN, NOTE_D5);
  delay(300);
  tone(BUZZER_PIN, NOTE_CS5);
  delay(300);
  // modifica la frequenza della noto C5 da -10 a +10 Hz per 10 volte
  // in modo da creare un effetto sonoro particolare
  for (byte i = 0; i < 10; i++) {
    for (int i = -10; i <= 10; i++) {
      tone(BUZZER_PIN, NOTE_C5 + i);
      delay(5);
    }
  }
  // Intrrompi la riproduzione del suono
  noTone(BUZZER_PIN);
}

void loop() {
  // Nessun codice nel loop 
}

