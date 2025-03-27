/*
 * LED_08_classe_led.ino
 * 
 * Questo sketch dimostra come utilizzare un approccio orientato agli oggetti
 * per gestire i LED, creando una classe LED con metodi per accensione, spegnimento e lampeggio.
 * 
 * Circuito:
 * - LED collegato al pin 11 e GND attraverso una resistenza da 220 ohm
 * 
 * Creato il: 2023
 */

// Classe LED
class LED {
  private:
    int pin;      // Pin a cui è collegato il LED
    bool stato;   // Stato attuale del LED (acceso/spento)
    
  public:
    // Costruttore: imposta la modalità del pin del LED come output
    LED(int p) {
      pin = p;
      stato = false;
      pinMode(pin, OUTPUT);
      spegni(); // Inizia con il LED spento
    }
    
    // Metodo per accendere il LED
    void accendi() {
      digitalWrite(pin, HIGH);
      stato = true;
    }
    
    // Metodo per spegnere il LED
    void spegni() {
      digitalWrite(pin, LOW);
      stato = false;
    }
    
    // Metodo per invertire lo stato del LED
    void inverti() {
      if (stato) {
        spegni();
      } else {
        accendi();
      }
    }
    
    // Metodo per far lampeggiare il LED un certo numero di volte
    void lampeggia(int volte, int durata = 500) {
      for (int i = 0; i < volte; i++) {
        accendi();
        delay(durata);
        spegni();
        delay(durata);
      }
    }
    
    // Metodo per impostare la luminosità del LED (solo per pin PWM)
    void setLuminosita(int luminosita) {
      // Assicurati che il valore sia nel range 0-255
      luminosita = constrain(luminosita, 0, 255);
      analogWrite(pin, luminosita);
      stato = (luminosita > 0);
    }
};

// Crea un oggetto LED sul pin 11
LED led(11);

void setup() {
  // Non c'è nulla da fare qui, il costruttore della classe LED
  // ha già configurato il pin come OUTPUT
}

void loop() {
  // Dimostra i vari metodi della classe LED
  
  // Accendi il LED
  led.accendi();
  delay(1000);
  
  // Spegni il LED
  led.spegni();
  delay(1000);
  
  // Fai lampeggiare il LED 3 volte
  led.lampeggia(3);
  delay(1000);
  
  // Dimostra il controllo della luminosità
  for (int i = 0; i <= 255; i += 5) {
    led.setLuminosita(i);
    delay(30);
  }
  
  for (int i = 255; i >= 0; i -= 5) {
    led.setLuminosita(i);
    delay(30);
  }
  
  delay(1000);
}