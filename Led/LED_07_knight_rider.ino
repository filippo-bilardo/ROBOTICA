/*
 * LED_07_knight_rider.ino
 * 
 * Questo sketch crea un effetto "Knight Rider" (come la serie TV Supercar)
 * con una serie di LED che si accendono e si spengono in sequenza.
 * 
 * Circuito:
 * - 6 LED collegati ai pin da 2 a 7 e GND attraverso resistenze da 220 ohm
 * 
 * Creato il: 2023
 */

// Definizione dei pin per i LED
const int FIRST_LED_PIN = 2;  // Primo pin della sequenza
const int NUM_LEDS = 6;       // Numero di LED utilizzati

// Variabili per il controllo dell'animazione
int currentLed = 0;           // LED attualmente acceso
int direction = 1;            // Direzione dell'animazione (1 = avanti, -1 = indietro)

void setup() {
  // Inizializza tutti i pin dei LED come output
  for (int i = 0; i < NUM_LEDS; i++) {
    pinMode(FIRST_LED_PIN + i, OUTPUT);
  }
}

void loop() {
  // Spegni tutti i LED
  for (int i = 0; i < NUM_LEDS; i++) {
    digitalWrite(FIRST_LED_PIN + i, LOW);
  }
  
  // Accendi il LED corrente
  digitalWrite(FIRST_LED_PIN + currentLed, HIGH);
  
  // Attendi un po' prima di passare al LED successivo
  delay(100);
  
  // Aggiorna la posizione per il prossimo ciclo
  currentLed += direction;
  
  // Cambia direzione quando raggiungi la fine della sequenza
  if (currentLed == NUM_LEDS - 1 || currentLed == 0) {
    direction = -direction;
  }
}