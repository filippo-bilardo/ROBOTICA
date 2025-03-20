/**
 * Sintetizzatore MIDI. Questo programma permette di suonare una nota MIDI 
 * seleziondola tra 24 possibili note. La nota viene
 * selezionata tramite un numero digitato sulla seriale.
 *
 * la frequenza di una nota MIDI è calcolata come:
 * 440 * 2 ^ ((nota - 69) / 12)
 * dove nota è un numero da 0 a 127.
 *
 * https://wokwi.com/projects/425933317096044545
 * 
 * @author Fippo Bilardo
 * @version 1.0  20/03/25 - Versione iniziale
 */
const int BUZZER_PIN = 8;

// Note MIDI (frequenze in Hz)
const int notes[] = {
  262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 494, 
  523, 554, 587, 622, 659, 698, 740, 784, 831, 880, 932, 988
};

// Nomi delle note
const String noteNames[] = {
  "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
  "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"
};

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Sintetizzatore MIDI attivo");
  Serial.println("Inserisci un numero da 1 a 24 per suonare una nota:");
  printNoteTable();
}

void loop() {
  if (Serial.available() > 0) {
    int noteIndex = Serial.parseInt();
    
    if (noteIndex >= 1 && noteIndex <= 24) {
      // Indice valido (1-24)
      noteIndex--;  // Converti in indice array (0-23)
      
      Serial.print("Riproduzione nota: ");
      Serial.print(noteNames[noteIndex]);
      Serial.print(" (");
      Serial.print(notes[noteIndex]);
      Serial.println(" Hz)");
      
      // Suona la nota
      tone(BUZZER_PIN, notes[noteIndex]);
      delay(500);
      noTone(BUZZER_PIN);
    } else {
      Serial.println("Nota non valida. Inserisci un numero da 1 a 24.");
      printNoteTable();
    }
    
    // Svuota il buffer seriale
    while (Serial.available() > 0) {
      Serial.read();
    }
  }
}

void printNoteTable() {
  Serial.println("\nTabella delle note disponibili:");
  for (int i = 0; i < 24; i++) {
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.print(noteNames[i]);
    Serial.print(" (");
    Serial.print(notes[i]);
    Serial.println(" Hz)");
  }
  Serial.println();
}