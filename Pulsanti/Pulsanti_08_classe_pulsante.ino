// Sketch con classe Pulsante

// Definizione della classe Pulsante
class Pulsante {
  private:
    int _pin;                           // Pin a cui è collegato il pulsante
    int _stato;                         // Stato corrente del pulsante
    int _ultimoStato;                   // Ultimo stato del pulsante
    unsigned long _ultimoDebounceTime;  // Ultimo momento in cui il pin è cambiato
    unsigned long _debounceDelay;       // Tempo di debounce (ms)
    
  public:
    // Costruttore
    Pulsante(int pin, unsigned long debounceDelay = 50) {
      _pin = pin;
      _debounceDelay = debounceDelay;
      _stato = HIGH;                    // Inizializza con stato HIGH (non premuto con pull-up)
      _ultimoStato = HIGH;
      _ultimoDebounceTime = 0;
      
      pinMode(_pin, INPUT_PULLUP);      // Configura il pin come input con pull-up
    }
    
    // Metodo per verificare se il pulsante è stato premuto
    bool press() {
      return !digitalRead(_pin);        // Restituisce true se il pulsante è premuto (LOW con pull-up)
    }
    
    // Metodo per verificare se il pulsante è stato cliccato (premuto e rilasciato)
    bool click() {
      if(press()) {
        while(press()) {;}              // Attendi il rilascio del pulsante
        return true;
      }
      return false;
    }
    
    // Metodo per verificare se il pulsante è stato premuto con debouncing
    bool pressDebounce() {
      bool cambioStato = false;
      
      // Leggi lo stato corrente del pulsante
      int reading = digitalRead(_pin);
      
      // Se lo stato è cambiato, resetta il timer di debounce
      if (reading != _ultimoStato) {
        _ultimoDebounceTime = millis();
      }
      
      // Se è passato abbastanza tempo dal rimbalzo
      if ((millis() - _ultimoDebounceTime) > _debounceDelay) {
        // Se lo stato è effettivamente cambiato
        if (reading != _stato) {
          _stato = reading;
          
          // Se il pulsante è premuto (LOW con pull-up)
          if (_stato == LOW) {
            cambioStato = true;
          }
        }
      }
      
      // Salva lo stato corrente come "ultimo stato" per il prossimo ciclo
      _ultimoStato = reading;
      
      return cambioStato;
    }
};

// Utilizzo della classe Pulsante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int LED_PIN = 13;    // Pin a cui è collegato il LED

Pulsante pulsante(BUTTON_PIN);  // Crea un'istanza della classe Pulsante
int ledState = LOW;             // Stato corrente del LED

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, ledState);
}

void loop() {
  // Verifica se il pulsante è stato premuto con debouncing
  if (pulsante.pressDebounce()) {
    ledState = !ledState;  // Inverti lo stato del LED
    digitalWrite(LED_PIN, ledState);
    Serial.println(ledState ? "LED acceso" : "LED spento");
  }
}