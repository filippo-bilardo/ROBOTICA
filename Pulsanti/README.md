# Guida all'utilizzo dei Pulsanti con Arduino

## Parte 1: Le basi

### Cos'è un Pulsante?
Un pulsante è un componente elettronico che permette di chiudere o aprire un circuito quando viene premuto. È uno dei componenti di input più comuni nei progetti con microcontrollori. Esistono principalmente due tipi di pulsanti:
- **Pulsante normalmente aperto (NO)**: Il circuito è aperto quando il pulsante non è premuto e si chiude quando viene premuto.
- **Pulsante normalmente chiuso (NC)**: Il circuito è chiuso quando il pulsante non è premuto e si apre quando viene premuto.

Nella maggior parte dei progetti Arduino, si utilizzano pulsanti normalmente aperti.

### Datasheet
Ecco alcuni link a datasheet di pulsanti disponibili in commercio:
- [Omron - B3F Tactile Switch Datasheet](https://omronfs.omron.com/en_US/ecb/products/pdf/en-b3f.pdf)
- [C&K - PTS125 Series Tactile Switch Datasheet](https://www.ckswitches.com/media/1471/pts125.pdf)
- [E-Switch - TL1105 Series Tactile Switch Datasheet](https://www.e-switch.com/system/asset/product_line/data_sheet/143/TL1105.pdf)

### Componenti necessari
- Arduino (qualsiasi modello)
- Pulsante (normalmente aperto)
- Resistore da 10kΩ (per pull-up/pull-down)
- Breadboard
- Cavi di collegamento

### Schema di collegamento base
1. Collega un pin del pulsante a un pin digitale di Arduino (es. pin 2)
2. Collega l'altro pin del pulsante a GND
3. Collega un resistore da 10kΩ tra il pin digitale e 5V (resistenza di pull-up)

Alternativamente, puoi utilizzare la resistenza di pull-up interna di Arduino:
```cpp
pinMode(BUTTON_PIN, INPUT_PULLUP);
```

### Primo sketch: Lettura semplice di un pulsante

```cpp
// Sketch base per la lettura di un pulsante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante

void setup() {
  Serial.begin(9600);       // Inizializza la comunicazione seriale
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Imposta il pin del pulsante come input con pull-up
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);  // Leggi lo stato del pulsante
  
  if (buttonState == LOW) {  // Se il pulsante è premuto (LOW con pull-up)
    Serial.println("Pulsante premuto");
  } else {
    Serial.println("Pulsante rilasciato");
  }
  
  delay(100);  // Piccolo ritardo per evitare letture multiple
}
```
[Vedi il codice completo](Pulsanti_01_lettura_semplice.ino)

### Utilizzo di un pulsante per controllare un LED

```cpp
// Sketch per controllare un LED con un pulsante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int LED_PIN = 13;    // Pin a cui è collegato il LED

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Imposta il pin del pulsante come input con pull-up
  pinMode(LED_PIN, OUTPUT);           // Imposta il pin del LED come output
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);  // Leggi lo stato del pulsante
  
  if (buttonState == LOW) {  // Se il pulsante è premuto (LOW con pull-up)
    digitalWrite(LED_PIN, HIGH);  // Accendi il LED
  } else {
    digitalWrite(LED_PIN, LOW);   // Spegni il LED
  }
}
```
[Vedi il codice completo](Pulsanti_02_controllo_led.ino)

## Parte 2: Funzionalità intermedie

### Debouncing del pulsante
Quando si preme un pulsante meccanico, i contatti metallici possono rimbalzare, causando letture multiple. Questo fenomeno è chiamato "bouncing" o "rimbalzo". Per evitare questo problema, si utilizza una tecnica chiamata "debouncing".

```cpp
// Sketch con debouncing del pulsante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int LED_PIN = 13;    // Pin a cui è collegato il LED

int ledState = LOW;         // Stato corrente del LED
int buttonState;            // Stato corrente del pulsante
int lastButtonState = HIGH; // Stato precedente del pulsante

// Variabili per il debouncing
unsigned long lastDebounceTime = 0;  // Ultimo momento in cui il pin è cambiato
unsigned long debounceDelay = 50;    // Tempo di debounce in ms

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, ledState);
}

void loop() {
  // Leggi lo stato del pulsante
  int reading = digitalRead(BUTTON_PIN);

  // Se lo stato è cambiato, resetta il timer di debounce
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  // Se è passato abbastanza tempo dal rimbalzo
  if ((millis() - lastDebounceTime) > debounceDelay) {
    // Se lo stato è effettivamente cambiato
    if (reading != buttonState) {
      buttonState = reading;

      // Cambia lo stato del LED solo se il pulsante è premuto (LOW con pull-up)
      if (buttonState == LOW) {
        ledState = !ledState;  // Inverti lo stato del LED
      }
    }
  }

  // Imposta il LED con lo stato corrente
  digitalWrite(LED_PIN, ledState);

  // Salva lo stato corrente come "ultimo stato" per il prossimo ciclo
  lastButtonState = reading;
}
```
[Vedi il codice completo](Pulsanti_03_debouncing.ino)

### Rilevamento di click singolo e doppio click

```cpp
// Sketch per rilevare click singolo e doppio click
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int LED_PIN = 13;    // Pin a cui è collegato il LED

// Parametri per il rilevamento dei click
const unsigned long CLICK_TIMEOUT = 250;    // Tempo massimo tra due click per un doppio click (ms)
const unsigned long DEBOUNCE_DELAY = 50;    // Tempo di debounce (ms)

// Variabili di stato
int ledState = LOW;                        // Stato corrente del LED
int buttonState = HIGH;                    // Stato corrente del pulsante
int lastButtonState = HIGH;                // Stato precedente del pulsante

// Variabili per il timing
unsigned long lastDebounceTime = 0;        // Ultimo momento in cui il pin è cambiato
unsigned long lastClickTime = 0;           // Momento dell'ultimo click
int clickCount = 0;                        // Contatore dei click

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, ledState);
}

void loop() {
  // Leggi lo stato del pulsante
  int reading = digitalRead(BUTTON_PIN);

  // Se lo stato è cambiato, resetta il timer di debounce
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  // Se è passato abbastanza tempo dal rimbalzo
  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
    // Se lo stato è effettivamente cambiato
    if (reading != buttonState) {
      buttonState = reading;

      // Se il pulsante è stato rilasciato (HIGH con pull-up)
      if (buttonState == HIGH) {
        // Incrementa il contatore dei click
        clickCount++;
        lastClickTime = millis();
      }
    }
  }

  // Controlla se è passato il tempo di timeout per i click
  if (clickCount > 0 && (millis() - lastClickTime) > CLICK_TIMEOUT) {
    // Esegui l'azione in base al numero di click
    if (clickCount == 1) {
      Serial.println("Click singolo rilevato");
      ledState = !ledState;  // Inverti lo stato del LED
    } else if (clickCount == 2) {
      Serial.println("Doppio click rilevato");
      // Lampeggia il LED rapidamente 5 volte
      for (int i = 0; i < 5; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(100);
        digitalWrite(LED_PIN, LOW);
        delay(100);
      }
    }
    
    // Resetta il contatore dei click
    clickCount = 0;
  }

  // Imposta il LED con lo stato corrente
  digitalWrite(LED_PIN, ledState);

  // Salva lo stato corrente come "ultimo stato" per il prossimo ciclo
  lastButtonState = reading;
}
```
[Vedi il codice completo](Pulsanti_04_click_doppio_click.ino)

## Parte 3: Applicazioni avanzate

### Pulsante con funzionalità non bloccante
Utilizzando la funzione `millis()` invece di `delay()`, possiamo creare un sistema non bloccante che permette di eseguire altre operazioni mentre si monitora lo stato del pulsante.

```cpp
// Sketch con funzionalità non bloccante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int LED_PIN = 13;    // Pin a cui è collegato il LED
const int TEMP_SENSOR_PIN = A0;  // Pin del sensore di temperatura

// Variabili di stato
int ledState = LOW;                        // Stato corrente del LED
int buttonState = HIGH;                    // Stato corrente del pulsante
int lastButtonState = HIGH;                // Stato precedente del pulsante

// Variabili per il timing
unsigned long lastDebounceTime = 0;        // Ultimo momento in cui il pin è cambiato
unsigned long lastTempReadTime = 0;        // Ultimo momento in cui è stata letta la temperatura
const unsigned long DEBOUNCE_DELAY = 50;   // Tempo di debounce (ms)
const unsigned long TEMP_READ_INTERVAL = 2000;  // Intervallo di lettura della temperatura (ms)

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, ledState);
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Task 1: Gestione del pulsante con debouncing
  int reading = digitalRead(BUTTON_PIN);
  if (reading != lastButtonState) {
    lastDebounceTime = currentMillis;
  }
  
  if ((currentMillis - lastDebounceTime) > DEBOUNCE_DELAY) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == LOW) {  // Se il pulsante è premuto (LOW con pull-up)
        ledState = !ledState;    // Inverti lo stato del LED
        digitalWrite(LED_PIN, ledState);
        Serial.println(ledState ? "LED acceso" : "LED spento");
      }
    }
  }
  lastButtonState = reading;
  
  // Task 2: Lettura periodica della temperatura
  if (currentMillis - lastTempReadTime >= TEMP_READ_INTERVAL) {
    lastTempReadTime = currentMillis;
    int sensorValue = analogRead(TEMP_SENSOR_PIN);
    float temperature = (sensorValue * 5.0 / 1024.0 - 0.5) * 100;  // Conversione per LM35
    Serial.print("Temperatura: ");
    Serial.print(temperature);
    Serial.println(" °C");
  }
  
  // Altri task possono essere aggiunti qui senza bloccare l'esecuzione
}
```
[Vedi il codice completo](Pulsanti_05_non_bloccante.ino)

### Contatore con pulsante

```cpp
// Sketch per un contatore con pulsante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int RESET_PIN = 3;   // Pin a cui è collegato il pulsante di reset

// Variabili di stato
int counter = 0;                          // Contatore
int buttonState = HIGH;                   // Stato corrente del pulsante
int lastButtonState = HIGH;               // Stato precedente del pulsante
int resetButtonState = HIGH;              // Stato corrente del pulsante di reset
int lastResetButtonState = HIGH;          // Stato precedente del pulsante di reset

// Variabili per il debouncing
unsigned long lastDebounceTime = 0;       // Ultimo momento in cui il pin è cambiato
unsigned long lastResetDebounceTime = 0;  // Ultimo momento in cui il pin di reset è cambiato
const unsigned long DEBOUNCE_DELAY = 50;  // Tempo di debounce (ms)

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(RESET_PIN, INPUT_PULLUP);
  Serial.println("Contatore inizializzato a 0");
}

void loop() {
  // Gestione del pulsante principale
  int reading = digitalRead(BUTTON_PIN);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  
  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == LOW) {  // Se il pulsante è premuto (LOW con pull-up)
        counter++;               // Incrementa il contatore
        Serial.print("Contatore: ");
        Serial.println(counter);
      }
    }
  }
  lastButtonState = reading;
  
  // Gestione del pulsante di reset
  int resetReading = digitalRead(RESET_PIN);
  if (resetReading != lastResetButtonState) {
    lastResetDebounceTime = millis();
  }
  
  if ((millis() - lastResetDebounceTime) > DEBOUNCE_DELAY) {
    if (resetReading != resetButtonState) {
      resetButtonState = resetReading;
      if (resetButtonState == LOW) {  // Se il pulsante di reset è premuto
        counter = 0;                  // Resetta il contatore
        Serial.println("Contatore resettato a 0");
      }
    }
  }
  lastResetButtonState = resetReading;
}
```
[Vedi il codice completo](Pulsanti_06_contatore.ino)

### Macchina a stati con pulsante

```cpp
// Sketch per una macchina a stati controllata da pulsante
const int BUTTON_PIN = 2;  // Pin a cui è collegato il pulsante
const int LED_RED = 9;     // Pin a cui è collegato il LED rosso
const int LED_GREEN = 10;  // Pin a cui è collegato il LED verde
const int LED_BLUE = 11;   // Pin a cui è collegato il LED blu

// Definizione degli stati
enum State {
  STATE_RED,
  STATE_GREEN,
  STATE_BLUE,
  STATE_OFF
};

// Variabili di stato
State currentState = STATE_OFF;           // Stato corrente della macchina a stati
int buttonState = HIGH;                   // Stato corrente del pulsante
int lastButtonState = HIGH;               // Stato precedente del pulsante

// Variabili per il debouncing
unsigned long lastDebounceTime = 0;       // Ultimo momento in cui il pin è cambiato
const unsigned long DEBOUNCE_DELAY = 50;  // Tempo di debounce (ms)

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  
  // Inizializza tutti i LED spenti
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_BLUE, LOW);
  
  Serial.println("Macchina a stati inizializzata. Stato: OFF");
}

void loop() {
  // Gestione del pulsante
  int reading = digitalRead(BUTTON_PIN);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  
  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == LOW) {  // Se il pulsante è premuto (LOW con pull-up)
        // Cambia lo stato
        switch (currentState) {
          case STATE_OFF:
            currentState = STATE_RED;
            Serial.println("Stato: ROSSO");
            break;
          case STATE_RED:
            currentState = STATE_GREEN;
            Serial.println("Stato: VERDE");
            break;
          case STATE_GREEN:
            currentState = STATE_BLUE;
            Serial.println("Stato: BLU");
            break;
          case STATE_BLUE:
            currentState = STATE_OFF;
            Serial.println("Stato: OFF");
            break;
        }
        
        // Aggiorna i LED in base allo stato corrente
        updateLEDs();
      }
    }
  }
  lastButtonState = reading;
}

// Funzione per aggiornare i LED in base allo stato corrente
void updateLEDs() {
  // Spegni tutti i LED
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_BLUE, LOW);
  
  // Accendi il LED corrispondente allo stato corrente
  switch (currentState) {
    case STATE_RED:
      digitalWrite(LED_RED, HIGH);
      break;
    case STATE_GREEN:
      digitalWrite(LED_GREEN, HIGH);
      break;
    case STATE_BLUE:
      digitalWrite(LED_BLUE, HIGH);
      break;
    case STATE_OFF:
      // Tutti i LED rimangono spenti
      break;
  }
}
```
[Vedi il codice completo](Pulsanti_07_macchina_stati.ino)

### Utilizzo della classe Pulsante
Per una gestione più strutturata, possiamo creare una classe Pulsante che incapsula tutte le funzionalità necessarie.

```cpp
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
```
[Vedi il codice completo](Pulsanti_08_classe_pulsante.ino)

## Conclusioni

I pulsanti sono componenti fondamentali in molti progetti Arduino, permettendo l'interazione dell'utente con il sistema. In questa guida abbiamo esplorato diverse tecniche per utilizzare i pulsanti, dal semplice rilevamento di pressione fino a implementazioni più complesse come il debouncing, il rilevamento di click multipli e l'utilizzo in macchine a stati.

Ricorda sempre di utilizzare tecniche di debouncing per evitare letture false e di implementare funzionalità non bloccanti quando possibile, per mantenere il sistema reattivo e in grado di gestire più compiti contemporaneamente.

Per progetti più complessi, considera l'utilizzo di una classe dedicata come quella presentata nell'ultimo esempio, che incapsula tutte le funzionalità necessarie per gestire i pulsanti in modo efficiente e strutturato.