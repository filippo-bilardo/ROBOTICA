/*
 * PIR_08_classe_sensore.ino
 * 
 * Utilizzo della classe SensorePIR per una gestione orientata agli oggetti
 * del sensore PIR. La classe incapsula tutte le funzionalità necessarie
 * per gestire il sensore in modo efficiente e strutturato.
 * 
 * Componenti necessari:
 * - Arduino Uno (o compatibile)
 * - Sensore PIR HC-SR501
 * - LED
 * - Resistore 220Ω
 * - Cavi di collegamento
 * 
 * Collegamento:
 * PIR VCC  -> Arduino 5V
 * PIR GND  -> Arduino GND
 * PIR OUT  -> Arduino Pin 2
 * LED (+)  -> Arduino Pin 13 -> Resistore 220Ω -> LED (-) -> GND
 * 
 * Autore: Filippo Bilardo
 * Data: 29/11/2025
 */

// Definizione della classe SensorePIR
class SensorePIR {
  private:
    int _pin;                     // Pin a cui è collegato il sensore
    int _stato;                   // Stato corrente del sensore
    int _ultimoStato;             // Ultimo stato del sensore
    unsigned long _ultimoCambio;  // Ultimo momento in cui lo stato è cambiato
    unsigned long _contatore;     // Contatore dei rilevamenti
    
  public:
    // Costruttore
    SensorePIR(int pin) {
      _pin = pin;
      _stato = LOW;
      _ultimoStato = LOW;
      _ultimoCambio = 0;
      _contatore = 0;
      
      pinMode(_pin, INPUT);       // Configura il pin come input
    }
    
    // Metodo per inizializzare e calibrare il sensore
    void inizializza(unsigned long tempoCalibrazione = 60000) {
      Serial.print("Calibrazione sensore sul pin ");
      Serial.print(_pin);
      Serial.println("...");
      delay(tempoCalibrazione);
      Serial.println("Sensore pronto!");
    }
    
    // Metodo per leggere lo stato del sensore
    bool leggiStato() {
      return digitalRead(_pin) == HIGH;
    }
    
    // Metodo per verificare se è stato rilevato un nuovo movimento
    bool movimentoRilevato() {
      _stato = digitalRead(_pin);
      
      // Rileva il passaggio da LOW a HIGH (inizio movimento)
      if (_stato == HIGH && _ultimoStato == LOW) {
        _ultimoCambio = millis();
        _contatore++;
        _ultimoStato = _stato;
        return true;
      }
      
      _ultimoStato = _stato;
      return false;
    }
    
    // Metodo per verificare se il movimento è terminato
    bool movimentoTerminato() {
      _stato = digitalRead(_pin);
      
      // Rileva il passaggio da HIGH a LOW (fine movimento)
      if (_stato == LOW && _ultimoStato == HIGH) {
        _ultimoStato = _stato;
        return true;
      }
      
      _ultimoStato = _stato;
      return false;
    }
    
    // Metodo per ottenere il numero di rilevamenti
    unsigned long getContatore() {
      return _contatore;
    }
    
    // Metodo per resettare il contatore
    void resetContatore() {
      _contatore = 0;
    }
    
    // Metodo per ottenere il tempo dall'ultimo cambio di stato
    unsigned long getTempoDallUltimoCambio() {
      return millis() - _ultimoCambio;
    }
};

// Utilizzo della classe SensorePIR
const int PIR_PIN = 2;     // Pin a cui è collegato il sensore PIR
const int LED_PIN = 13;    // Pin a cui è collegato il LED

SensorePIR sensore(PIR_PIN);  // Crea un'istanza della classe SensorePIR

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("Sistema con classe SensorePIR");
  sensore.inizializza();  // Inizializza e calibra il sensore
}

void loop() {
  // Verifica se è stato rilevato un nuovo movimento
  if (sensore.movimentoRilevato()) {
    digitalWrite(LED_PIN, HIGH);
    Serial.print("Movimento rilevato! [Totale: ");
    Serial.print(sensore.getContatore());
    Serial.println("]");
  }
  
  // Verifica se il movimento è terminato
  if (sensore.movimentoTerminato()) {
    digitalWrite(LED_PIN, LOW);
    Serial.print("Movimento terminato. Durata: ");
    Serial.print(sensore.getTempoDallUltimoCambio() / 1000.0);
    Serial.println(" secondi");
  }
  
  delay(100);
}
