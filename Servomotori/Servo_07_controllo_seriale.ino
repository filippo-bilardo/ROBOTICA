/**
 * \Servo_07_controllo_seriale
 * 
 * Sketch per il controllo di un servo motore tramite comandi seriali
 * L'utente può inviare valori da 0 a 180 tramite il monitor seriale per posizionare il servo.
 * 
 * https://github.com/filippo-bilardo/ROBOTICA/blob/main/servo/README.md
 * 
 * @author Filippo Bilardo
 * @version 1.0  20/03/25 - Versione iniziale
 */
#include <Servo.h>

const int SERVO_PIN = 9;  // Pin a cui è collegato il servo
Servo myServo;           // Crea un oggetto servo

String inputString = "";      // Stringa per memorizzare l'input
boolean stringComplete = false;  // Flag per indicare se l'input è completo

void setup() {
  myServo.attach(SERVO_PIN);  // Collega il servo al pin specificato
  Serial.begin(9600);          // Inizializza la comunicazione seriale
  Serial.println("Controllo Servo via Seriale");
  Serial.println("Inserisci un valore tra 0 e 180 per posizionare il servo");
  inputString.reserve(10);  // Riserva spazio per la stringa di input
}

void loop() {
  // Quando è disponibile un input completo
  if (stringComplete) {
    // Converte la stringa in un intero
    int position = inputString.toInt();
    
    // Verifica che il valore sia nel range valido
    if (position >= 0 && position <= 180) {
      myServo.write(position);  // Imposta la posizione del servo
      Serial.print("Servo posizionato a ");
      Serial.print(position);
      Serial.println(" gradi");
    } else {
      Serial.println("Errore: inserisci un valore tra 0 e 180");
    }
    
    // Resetta le variabili per il prossimo input
    inputString = "";
    stringComplete = false;
    Serial.println("Inserisci un nuovo valore:");
  }
}

// Funzione chiamata quando sono disponibili dati sulla porta seriale
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();  // Legge il carattere in arrivo
    
    // Se il carattere è un newline, imposta il flag di completamento
    if (inChar == '\n') {
      stringComplete = true;
    } else {
      // Altrimenti, aggiunge il carattere alla stringa
      inputString += inChar;
    }
  }
}