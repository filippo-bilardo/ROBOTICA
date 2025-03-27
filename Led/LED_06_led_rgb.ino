/*
 * LED_06_led_rgb.ino
 * 
 * Questo sketch dimostra come controllare un LED RGB (Red, Green, Blue)
 * per creare vari colori attraverso la miscelazione dei tre colori primari.
 * 
 * Circuito:
 * - LED RGB a catodo comune: pin rosso collegato al pin 9, pin verde al pin 10, pin blu al pin 11
 * - Catodo comune collegato a GND
 * - Resistenze da 220 ohm per ciascun colore
 * 
 * Creato il: 2023
 */

const int RED_PIN = 9;    // Pin PWM per il colore rosso
const int GREEN_PIN = 10; // Pin PWM per il colore verde
const int BLUE_PIN = 11;  // Pin PWM per il colore blu

void setup() {
  // Inizializza i pin come output
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
  
  // Inizia con il LED spento
  setColor(0, 0, 0);
}

void loop() {
  // Rosso
  setColor(255, 0, 0);
  delay(1000);
  
  // Verde
  setColor(0, 255, 0);
  delay(1000);
  
  // Blu
  setColor(0, 0, 255);
  delay(1000);
  
  // Giallo (rosso + verde)
  setColor(255, 255, 0);
  delay(1000);
  
  // Ciano (verde + blu)
  setColor(0, 255, 255);
  delay(1000);
  
  // Magenta (rosso + blu)
  setColor(255, 0, 255);
  delay(1000);
  
  // Bianco (tutti i colori)
  setColor(255, 255, 255);
  delay(1000);
  
  // Transizione graduale attraverso lo spettro dei colori
  rainbowCycle();
}

// Funzione per impostare il colore del LED RGB
void setColor(int red, int green, int blue) {
  // Per LED RGB a catodo comune, 255 = spento, 0 = massima luminosità
  // Invertiamo i valori per renderlo più intuitivo (0 = spento, 255 = massima luminosità)
  analogWrite(RED_PIN, red);
  analogWrite(GREEN_PIN, green);
  analogWrite(BLUE_PIN, blue);
}

// Funzione per creare un effetto arcobaleno
void rainbowCycle() {
  // Ciclo attraverso tutti i colori dello spettro
  for (int i = 0; i < 256; i++) {
    // Effetto arcobaleno utilizzando la ruota dei colori HSV
    // Dividiamo il ciclo in 3 parti per creare una transizione fluida
    if (i < 85) {
      setColor(255 - i * 3, i * 3, 0);
    } else if (i < 170) {
      setColor(0, 255 - (i - 85) * 3, (i - 85) * 3);
    } else {
      setColor((i - 170) * 3, 0, 255 - (i - 170) * 3);
    }
    delay(20);
  }
}