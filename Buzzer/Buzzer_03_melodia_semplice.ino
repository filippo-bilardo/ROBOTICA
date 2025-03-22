/**
 * \Buzzer_03_melodia_semplice 
 * 
 * Questo sketch suona una semplice melodia utilizzando un buzzer.
 * Il buzzer è collegato al pin digitale 8.
 *
 * https://wokwi.com/projects/425933995361295361
 * https://github.com/filippo-bilardo/ROBOTICA/blob/main/Buzzer/README.md
 * 
 * variante con codice ad oggetti
 * https://wokwi.com/projects/389619172949739521
 * 
 * @author Fippo Bilardo
 * @version 1.0  20/03/25 - Versione iniziale
 */
const int BUZZER_PIN = 8;

// Definizione delle note (frequenze in Hz)
#define NOTE_C4  262
#define NOTE_D4  294
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_G4  392
#define NOTE_A4  440
#define NOTE_B4  494
#define NOTE_C5  523

// Melodia: Array di note
int melody[] = {NOTE_C4, NOTE_D4, NOTE_E4, NOTE_F4, NOTE_G4, NOTE_A4, NOTE_B4, NOTE_C5};

// Durata delle note (in ms)
int noteDurations[] = {250, 250, 250, 250, 250, 250, 250, 500};

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  // Riproduci una volta la melodia
  for (int i = 0; i < 8; i++) {
    tone(BUZZER_PIN, melody[i]);
    delay(noteDurations[i]);
    noTone(BUZZER_PIN);
    delay(50);  // Breve pausa tra le note
  }
  
  delay(2000);  // Pausa prima di ripetere
}