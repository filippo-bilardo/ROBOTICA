/*
 * LED_05_semaforo.ino
 * 
 * Questo sketch simula il funzionamento di un semaforo utilizzando tre LED
 * (rosso, giallo e verde).
 * 
 * Circuito:
 * - LED rosso collegato al pin 11 e GND attraverso una resistenza da 220 ohm
 * - LED giallo collegato al pin 10 e GND attraverso una resistenza da 220 ohm
 * - LED verde collegato al pin 9 e GND attraverso una resistenza da 220 ohm
 * 
 * Creato il: 2023
 */

const int RED_PIN = 11;     // Pin a cui è collegato il LED rosso
const int YELLOW_PIN = 10;  // Pin a cui è collegato il LED giallo
const int GREEN_PIN = 9;    // Pin a cui è collegato il LED verde

void setup() {
  // Inizializza i pin come output
  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  
  // Inizia con tutti i LED spenti
  digitalWrite(RED_PIN, LOW);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);
}

void loop() {
  // Fase 1: Rosso acceso (Stop)
  digitalWrite(RED_PIN, HIGH);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);
  delay(3000);  // Attendi 3 secondi
  
  // Fase 2: Rosso e giallo accesi (Preparati a partire)
  digitalWrite(RED_PIN, HIGH);
  digitalWrite(YELLOW_PIN, HIGH);
  digitalWrite(GREEN_PIN, LOW);
  delay(1000);  // Attendi 1 secondo
  
  // Fase 3: Verde acceso (Via libera)
  digitalWrite(RED_PIN, LOW);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, HIGH);
  delay(3000);  // Attendi 3 secondi
  
  // Fase 4: Giallo acceso (Preparati a fermarti)
  digitalWrite(RED_PIN, LOW);
  digitalWrite(YELLOW_PIN, HIGH);
  digitalWrite(GREEN_PIN, LOW);
  delay(1000);  // Attendi 1 secondo
  
  // Torna all'inizio del loop
}