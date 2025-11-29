# Guida all'utilizzo del Sensore PIR con Arduino

## Parte 1: Le basi

### Cos'è un Sensore PIR?
Un sensore PIR (Passive Infrared Sensor) è un dispositivo elettronico che rileva il movimento attraverso la rilevazione delle variazioni di radiazione infrarossa. È comunemente utilizzato nei sistemi di allarme, illuminazione automatica e applicazioni domotiche. Il sensore è "passivo" perché non emette energia, ma rileva solo le variazioni di calore nell'ambiente circostante.

I sensori PIR possono rilevare movimenti fino a una distanza di 6-7 metri (a seconda del modello) e hanno un angolo di rilevamento tipico di 110-120 gradi.

### Come funziona?
Il sensore PIR contiene due slot sensibili agli infrarossi. Quando un oggetto caldo (come una persona) si muove nel campo di rilevamento, prima uno slot rileva la radiazione IR, poi l'altro. Questa differenza genera un impulso elettrico che viene interpretato come rilevamento di movimento.

### Datasheet
Ecco alcuni link a datasheet di sensori PIR disponibili in commercio:
- [HC-SR501 PIR Motion Detector Datasheet](https://www.epitran.it/ebayDrive/datasheet/44.pdf)
- [Panasonic PIR Motion Sensor AMN Series](https://industrial.panasonic.com/cdbs/www-data/pdf/ADD8000/ADD8000C19.pdf)
- [Murata IRA-S210ST01 PIR Sensor](https://www.murata.com/en-us/products/productdetail?partno=IRA-S210ST01)

### Componenti necessari
- Arduino (qualsiasi modello)
- Sensore PIR (es. HC-SR501)
- LED (opzionale, per feedback visivo)
- Resistore da 220Ω (per il LED)
- Breadboard
- Cavi di collegamento

### Specifiche tecniche del HC-SR501
- **Tensione di alimentazione**: 4.5V - 20V (tipicamente 5V)
- **Corrente assorbita**: < 60 μA
- **Tensione di uscita**: 3.3V (HIGH) / 0V (LOW)
- **Distanza di rilevamento**: 3-7 metri (regolabile)
- **Angolo di rilevamento**: ~110 gradi
- **Tempo di ritardo**: 0.3s - 5min (regolabile)
- **Temperatura di lavoro**: -15°C a +70°C

### Schema di collegamento base
Il sensore HC-SR501 ha tipicamente 3 pin:
1. **VCC** → Collega a 5V di Arduino
2. **OUT** → Collega a un pin digitale di Arduino (es. pin 2)
3. **GND** → Collega a GND di Arduino

**Regolazioni sul sensore:**
- **Sensitivity (Sx)**: Regola la distanza di rilevamento (da 3 a 7 metri)
- **Time Delay (Tx)**: Regola quanto tempo il segnale rimane HIGH dopo il rilevamento (da 0.3s a 5 minuti)
- **Jumper**: Può essere impostato in due modalità:
  - **H (Retriggering)**: Il timer si resetta ogni volta che viene rilevato movimento
  - **L (Non-retriggering)**: Il timer completa il ciclo anche se viene rilevato nuovo movimento

### Primo sketch: Rilevamento semplice di movimento

```cpp
// Sketch base per il rilevamento di movimento con sensore PIR
const int PIR_PIN = 2;  // Pin a cui è collegato il sensore PIR

void setup() {
  Serial.begin(9600);       // Inizializza la comunicazione seriale
  pinMode(PIR_PIN, INPUT);  // Imposta il pin del PIR come input
  
  Serial.println("Inizializzazione sensore PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);  // Attendi 60 secondi per permettere al sensore di calibrarsi
  Serial.println("Sensore pronto!");
}

void loop() {
  int pirState = digitalRead(PIR_PIN);  // Leggi lo stato del sensore PIR
  
  if (pirState == HIGH) {  // Se viene rilevato movimento
    Serial.println("Movimento rilevato!");
  } else {
    Serial.println("Nessun movimento");
  }
  
  delay(500);  // Piccolo ritardo per evitare letture eccessive
}
```
[Vedi il codice completo](PIR_01_rilevamento_semplice.ino)

### Utilizzo del sensore PIR per controllare un LED

```cpp
// Sketch per controllare un LED con un sensore PIR
const int PIR_PIN = 2;     // Pin a cui è collegato il sensore PIR
const int LED_PIN = 13;    // Pin a cui è collegato il LED

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);      // Imposta il pin del PIR come input
  pinMode(LED_PIN, OUTPUT);     // Imposta il pin del LED come output
  
  Serial.println("Inizializzazione sensore PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);  // Attendi 60 secondi per permettere al sensore di calibrarsi
  Serial.println("Sensore pronto!");
}

void loop() {
  int pirState = digitalRead(PIR_PIN);  // Leggi lo stato del sensore PIR
  
  if (pirState == HIGH) {  // Se viene rilevato movimento
    digitalWrite(LED_PIN, HIGH);  // Accendi il LED
    Serial.println("Movimento rilevato! LED acceso");
  } else {
    digitalWrite(LED_PIN, LOW);   // Spegni il LED
  }
  
  delay(100);  // Piccolo ritardo
}
```
[Vedi il codice completo](PIR_02_controllo_led.ino)

## Parte 2: Funzionalità intermedie

### Rilevamento con eventi
Invece di monitorare continuamente lo stato del sensore, possiamo rilevare solo i cambiamenti di stato (transizioni da nessun movimento a movimento e viceversa).

```cpp
// Sketch per rilevare eventi di movimento
const int PIR_PIN = 2;     // Pin a cui è collegato il sensore PIR
const int LED_PIN = 13;    // Pin a cui è collegato il LED

int pirState = LOW;        // Stato corrente del sensore
int lastPirState = LOW;    // Stato precedente del sensore

unsigned long motionStartTime = 0;  // Tempo di inizio del movimento
unsigned long motionDuration = 0;   // Durata del movimento

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("Inizializzazione sensore PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);  // Attendi 60 secondi per permettere al sensore di calibrarsi
  Serial.println("Sensore pronto!");
}

void loop() {
  pirState = digitalRead(PIR_PIN);  // Leggi lo stato del sensore PIR
  
  // Rileva il passaggio da LOW a HIGH (inizio movimento)
  if (pirState == HIGH && lastPirState == LOW) {
    motionStartTime = millis();
    digitalWrite(LED_PIN, HIGH);
    Serial.println(">>> Movimento iniziato!");
  }
  
  // Rileva il passaggio da HIGH a LOW (fine movimento)
  if (pirState == LOW && lastPirState == HIGH) {
    motionDuration = millis() - motionStartTime;
    digitalWrite(LED_PIN, LOW);
    Serial.print("<<< Movimento terminato. Durata: ");
    Serial.print(motionDuration / 1000.0);
    Serial.println(" secondi");
  }
  
  lastPirState = pirState;  // Aggiorna lo stato precedente
  delay(100);
}
```
[Vedi il codice completo](PIR_03_rilevamento_eventi.ino)

### Contatore di rilevamenti

```cpp
// Sketch per contare i rilevamenti di movimento
const int PIR_PIN = 2;     // Pin a cui è collegato il sensore PIR
const int LED_PIN = 13;    // Pin a cui è collegato il LED

int pirState = LOW;        // Stato corrente del sensore
int lastPirState = LOW;    // Stato precedente del sensore
int motionCounter = 0;     // Contatore dei rilevamenti

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("Inizializzazione sensore PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);  // Attendi 60 secondi per permettere al sensore di calibrarsi
  Serial.println("Sensore pronto!");
  Serial.println("Contatore inizializzato a 0");
}

void loop() {
  pirState = digitalRead(PIR_PIN);  // Leggi lo stato del sensore PIR
  
  // Rileva il passaggio da LOW a HIGH (inizio movimento)
  if (pirState == HIGH && lastPirState == LOW) {
    motionCounter++;
    digitalWrite(LED_PIN, HIGH);
    Serial.print("Movimento #");
    Serial.print(motionCounter);
    Serial.println(" rilevato!");
  }
  
  // Rileva il passaggio da HIGH a LOW (fine movimento)
  if (pirState == LOW && lastPirState == HIGH) {
    digitalWrite(LED_PIN, LOW);
  }
  
  lastPirState = pirState;  // Aggiorna lo stato precedente
  delay(100);
}
```
[Vedi il codice completo](PIR_04_contatore.ino)

## Parte 3: Applicazioni avanzate

### Sistema di illuminazione automatica con timer
Un sistema che accende le luci quando rileva movimento e le spegne automaticamente dopo un periodo di inattività.

```cpp
// Sketch per un sistema di illuminazione automatica
const int PIR_PIN = 2;     // Pin a cui è collegato il sensore PIR
const int LED_PIN = 13;    // Pin a cui è collegato il LED (o relè)

int pirState = LOW;                        // Stato corrente del sensore
int ledState = LOW;                        // Stato corrente del LED
unsigned long lastMotionTime = 0;          // Ultimo momento in cui è stato rilevato movimento
const unsigned long LIGHT_TIMEOUT = 10000; // Timeout dopo cui spegnere le luci (10 secondi)

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("Sistema di illuminazione automatica");
  Serial.println("Inizializzazione sensore PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);  // Attendi 60 secondi per permettere al sensore di calibrarsi
  Serial.println("Sistema pronto!");
}

void loop() {
  pirState = digitalRead(PIR_PIN);  // Leggi lo stato del sensore PIR
  unsigned long currentMillis = millis();
  
  // Se viene rilevato movimento
  if (pirState == HIGH) {
    if (ledState == LOW) {
      ledState = HIGH;
      digitalWrite(LED_PIN, HIGH);
      Serial.println("Movimento rilevato - Luci accese");
    }
    lastMotionTime = currentMillis;  // Aggiorna il tempo dell'ultimo movimento
  }
  
  // Se le luci sono accese e è passato il timeout senza movimento
  if (ledState == HIGH && (currentMillis - lastMotionTime >= LIGHT_TIMEOUT)) {
    ledState = LOW;
    digitalWrite(LED_PIN, LOW);
    Serial.println("Timeout raggiunto - Luci spente");
  }
  
  delay(100);
}
```
[Vedi il codice completo](PIR_05_illuminazione_automatica.ino)

### Sistema di allarme con sensore PIR

```cpp
// Sketch per un sistema di allarme
const int PIR_PIN = 2;       // Pin a cui è collegato il sensore PIR
const int LED_RED = 9;       // Pin a cui è collegato il LED rosso
const int LED_GREEN = 10;    // Pin a cui è collegato il LED verde
const int BUZZER_PIN = 11;   // Pin a cui è collegato il buzzer
const int ARM_BUTTON = 3;    // Pin del pulsante per attivare/disattivare l'allarme

// Stati del sistema
enum AlarmState {
  DISARMED,    // Sistema disattivato
  ARMED,       // Sistema attivo
  TRIGGERED    // Allarme scattato
};

AlarmState currentState = DISARMED;
int pirState = LOW;
int lastPirState = LOW;
int buttonState = HIGH;
int lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long DEBOUNCE_DELAY = 50;

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(ARM_BUTTON, INPUT_PULLUP);
  
  // Stato iniziale: disattivato
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(LED_RED, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  
  Serial.println("Sistema di allarme con PIR");
  Serial.println("Inizializzazione sensore PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);
  Serial.println("Sistema pronto!");
  Serial.println("Premere il pulsante per attivare/disattivare l'allarme");
}

void loop() {
  // Gestione del pulsante con debouncing
  int reading = digitalRead(ARM_BUTTON);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  
  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == LOW) {  // Pulsante premuto
        toggleAlarm();
      }
    }
  }
  lastButtonState = reading;
  
  // Gestione del sensore PIR
  pirState = digitalRead(PIR_PIN);
  
  // Se il sistema è armato e viene rilevato movimento
  if (currentState == ARMED && pirState == HIGH && lastPirState == LOW) {
    triggerAlarm();
  }
  
  lastPirState = pirState;
  
  // Gestione del buzzer se l'allarme è scattato
  if (currentState == TRIGGERED) {
    tone(BUZZER_PIN, 1000, 200);  // Suona per 200ms
    delay(200);
    noTone(BUZZER_PIN);
    delay(100);
  }
}

// Funzione per attivare/disattivare l'allarme
void toggleAlarm() {
  if (currentState == DISARMED) {
    currentState = ARMED;
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
    Serial.println("Sistema ATTIVATO");
  } else {
    currentState = DISARMED;
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
    noTone(BUZZER_PIN);
    Serial.println("Sistema DISATTIVATO");
  }
}

// Funzione per far scattare l'allarme
void triggerAlarm() {
  currentState = TRIGGERED;
  Serial.println("!!! ALLARME SCATTATO !!!");
  Serial.println("Movimento rilevato!");
}
```
[Vedi il codice completo](PIR_06_sistema_allarme.ino)

### Sistema multi-sensore PIR
Un sistema che utilizza più sensori PIR per coprire aree diverse.

```cpp
// Sketch per un sistema multi-sensore PIR
const int PIR_PIN_1 = 2;   // Pin del primo sensore PIR (zona 1)
const int PIR_PIN_2 = 3;   // Pin del secondo sensore PIR (zona 2)
const int PIR_PIN_3 = 4;   // Pin del terzo sensore PIR (zona 3)
const int LED_1 = 9;       // LED zona 1
const int LED_2 = 10;      // LED zona 2
const int LED_3 = 11;      // LED zona 3

// Stati dei sensori
int pirState1 = LOW;
int lastPirState1 = LOW;
int pirState2 = LOW;
int lastPirState2 = LOW;
int pirState3 = LOW;
int lastPirState3 = LOW;

// Contatori per ogni zona
int counter1 = 0;
int counter2 = 0;
int counter3 = 0;

void setup() {
  Serial.begin(9600);
  
  // Configura i pin dei sensori PIR
  pinMode(PIR_PIN_1, INPUT);
  pinMode(PIR_PIN_2, INPUT);
  pinMode(PIR_PIN_3, INPUT);
  
  // Configura i pin dei LED
  pinMode(LED_1, OUTPUT);
  pinMode(LED_2, OUTPUT);
  pinMode(LED_3, OUTPUT);
  
  Serial.println("Sistema multi-sensore PIR");
  Serial.println("Inizializzazione sensori PIR...");
  Serial.println("Attendere 60 secondi per la calibrazione...");
  delay(60000);
  Serial.println("Sistema pronto!");
  Serial.println("Monitoraggio zone attivo:");
  Serial.println("- Zona 1 (Nord)");
  Serial.println("- Zona 2 (Est)");
  Serial.println("- Zona 3 (Sud)");
}

void loop() {
  // Leggi lo stato di tutti i sensori
  pirState1 = digitalRead(PIR_PIN_1);
  pirState2 = digitalRead(PIR_PIN_2);
  pirState3 = digitalRead(PIR_PIN_3);
  
  // Gestione Zona 1
  if (pirState1 == HIGH && lastPirState1 == LOW) {
    counter1++;
    digitalWrite(LED_1, HIGH);
    Serial.print("Zona 1 (Nord): Movimento rilevato! [Totale: ");
    Serial.print(counter1);
    Serial.println("]");
  }
  if (pirState1 == LOW && lastPirState1 == HIGH) {
    digitalWrite(LED_1, LOW);
  }
  lastPirState1 = pirState1;
  
  // Gestione Zona 2
  if (pirState2 == HIGH && lastPirState2 == LOW) {
    counter2++;
    digitalWrite(LED_2, HIGH);
    Serial.print("Zona 2 (Est): Movimento rilevato! [Totale: ");
    Serial.print(counter2);
    Serial.println("]");
  }
  if (pirState2 == LOW && lastPirState2 == HIGH) {
    digitalWrite(LED_2, LOW);
  }
  lastPirState2 = pirState2;
  
  // Gestione Zona 3
  if (pirState3 == HIGH && lastPirState3 == LOW) {
    counter3++;
    digitalWrite(LED_3, HIGH);
    Serial.print("Zona 3 (Sud): Movimento rilevato! [Totale: ");
    Serial.print(counter3);
    Serial.println("]");
  }
  if (pirState3 == LOW && lastPirState3 == HIGH) {
    digitalWrite(LED_3, LOW);
  }
  lastPirState3 = pirState3;
  
  delay(100);
}
```
[Vedi il codice completo](PIR_07_multi_sensore.ino)

### Utilizzo della classe SensorePIR
Per una gestione più strutturata, possiamo creare una classe SensorePIR che incapsula tutte le funzionalità necessarie.

```cpp
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
```
[Vedi il codice completo](PIR_08_classe_sensore.ino)

## Parte 4: Suggerimenti e best practices

### Calibrazione del sensore
- Quando si accende il sensore PIR per la prima volta, è necessario attendere circa 60 secondi affinché si calibri correttamente all'ambiente circostante.
- Durante la calibrazione, evitare movimenti nell'area di rilevamento per ottenere risultati ottimali.

### Regolazione della sensibilità
- Il potenziometro "Sensitivity" permette di regolare la distanza di rilevamento. Ruotarlo in senso orario per aumentare la sensibilità, in senso antiorario per diminuirla.
- Per applicazioni in ambienti piccoli, ridurre la sensibilità può aiutare a evitare falsi positivi.

### Regolazione del tempo di ritardo
- Il potenziometro "Time Delay" determina per quanto tempo l'uscita rimane HIGH dopo il rilevamento.
- Per applicazioni di illuminazione, un tempo di ritardo più lungo (1-2 minuti) è consigliato per evitare spegnimenti frequenti.
- Per sistemi di allarme, un tempo di ritardo breve (pochi secondi) è preferibile.

### Modalità di trigger
- **Modalità H (Retriggering)**: Ideale per illuminazione automatica, dove vuoi che la luce rimanga accesa finché c'è movimento continuo.
- **Modalità L (Non-retriggering)**: Utile quando vuoi un'unica notifica per evento, indipendentemente dal movimento continuo.

### Posizionamento del sensore
- Posiziona il sensore a circa 2-2.5 metri di altezza per una copertura ottimale.
- Evita di puntare il sensore verso fonti di calore (termosifoni, lampade, finestre con luce solare diretta) che possono causare falsi positivi.
- Il sensore è più sensibile ai movimenti trasversali (da un lato all'altro) rispetto ai movimenti diretti (verso o lontano dal sensore).

### Gestione dei falsi positivi
I falsi positivi possono essere causati da:
- Cambiamenti rapidi di temperatura
- Animali domestici
- Correnti d'aria
- Oggetti in movimento (tende, piante)
- Interferenze elettromagnetiche

Per ridurre i falsi positivi:
- Regola la sensibilità appropriatamente
- Posiziona il sensore lontano da fonti di calore
- Utilizza il debouncing via software
- Implementa un filtro temporale (ignora rilevamenti troppo ravvicinati)

### Alimentazione
- Sebbene il sensore possa funzionare con tensioni da 4.5V a 20V, è consigliabile utilizzare una tensione stabile di 5V da Arduino.
- Per applicazioni con più sensori, considera l'utilizzo di un'alimentazione esterna per evitare sovraccarichi sul regolatore di Arduino.

## Conclusioni

I sensori PIR sono componenti versatili e affidabili per la rilevazione del movimento in una vasta gamma di applicazioni, dalla domotica ai sistemi di sicurezza. In questa guida abbiamo esplorato diverse tecniche per utilizzare i sensori PIR, dalla semplice rilevazione di movimento fino a implementazioni più complesse come sistemi di allarme e illuminazione automatica.

Ricorda sempre di:
1. Permettere al sensore di calibrarsi adeguatamente all'avvio
2. Regolare sensibilità e tempo di ritardo in base all'applicazione specifica
3. Posizionare il sensore correttamente per ottimizzare il rilevamento
4. Implementare gestione degli eventi per creare applicazioni reattive ed efficienti
5. Considerare l'uso di classi dedicate per progetti complessi

Per progetti più avanzati, considera l'integrazione del sensore PIR con altri componenti come fotoresistori (per rilevare il livello di luce ambientale), moduli RTC (per funzionalità basate sul tempo) o moduli di comunicazione wireless per sistemi di sicurezza distribuiti.
