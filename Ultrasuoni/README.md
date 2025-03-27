# Guida all'utilizzo dei Sensori a Ultrasuoni con Arduino

## Parte 1: Le basi

### Cos'è un Sensore a Ultrasuoni?
Un sensore a ultrasuoni è un dispositivo che utilizza onde sonore ad alta frequenza (ultrasuoni) per misurare la distanza da un oggetto. Il sensore emette un impulso ultrasonico e misura il tempo che impiega l'eco a tornare dopo aver rimbalzato su un oggetto. Questo tempo viene poi convertito in una misura di distanza.

I sensori a ultrasuoni più comuni nei progetti Arduino sono:
- **HC-SR04**: È il modello più diffuso, con una portata da 2 cm a 400 cm e una precisione di circa 3 mm.
- **US-100**: Simile all'HC-SR04 ma con maggiore precisione e la possibilità di comunicare anche via seriale.
- **JSN-SR04T**: Versione impermeabile, adatta per applicazioni in ambienti umidi o all'aperto.

![Sensore HC-SR04](img/image01.png)

### Principio di funzionamento
Il funzionamento di un sensore a ultrasuoni si basa su questi principi:

1. Il sensore emette un impulso ultrasonico (tipicamente a 40 kHz) attraverso il trasmettitore.
2. L'onda sonora viaggia nell'aria fino a incontrare un ostacolo.
3. L'onda rimbalza sull'ostacolo e ritorna al sensore, dove viene rilevata dal ricevitore.
4. Il sensore misura il tempo trascorso tra l'emissione dell'impulso e la ricezione dell'eco.
5. La distanza viene calcolata utilizzando la formula: `distanza = (tempo × velocità del suono) / 2`
   - La velocità del suono nell'aria è circa 343 m/s (a 20°C)
   - Si divide per 2 perché il tempo misurato include sia l'andata che il ritorno dell'onda sonora.

### Datasheet
Ecco alcuni link a datasheet di sensori a ultrasuoni disponibili in commercio:
- [HC-SR04 Datasheet](https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf)
- [US-100 Datasheet](https://www.adafruit.com/product/4019)
- [JSN-SR04T Datasheet](https://www.jahankitshop.com/getattach.aspx?id=4635&Type=Product)

### Componenti necessari
- Arduino (qualsiasi modello)
- Sensore a ultrasuoni (es. HC-SR04)
- Breadboard
- Cavi di collegamento
- Resistori da 330Ω e 470Ω (per divisore di tensione, opzionale per alcuni Arduino)

### Schema di collegamento base
1. Collega il pin VCC del sensore a 5V di Arduino
2. Collega il pin GND del sensore a GND di Arduino
3. Collega il pin TRIG del sensore a un pin digitale di Arduino (es. pin 9)
4. Collega il pin ECHO del sensore a un pin digitale di Arduino (es. pin 10)

**Nota**: Se stai utilizzando un Arduino che opera a 3.3V (come alcune versioni di Arduino Due o Arduino Nano 33 IoT), dovrai utilizzare un divisore di tensione per il pin ECHO, poiché il sensore HC-SR04 opera a 5V.

### Primo sketch: Misurazione di distanza base

```cpp
// Sketch base per sensore a ultrasuoni HC-SR04
const int TRIG_PIN = 9;  // Pin Trigger del sensore
const int ECHO_PIN = 10; // Pin Echo del sensore

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.begin(9600);
  Serial.println("Sensore a ultrasuoni HC-SR04 attivo");
}

void loop() {
  // Variabili per la durata dell'impulso e la distanza risultante
  long duration, distance;
  
  // Invia impulso ultrasonico
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Misura il tempo di ritorno dell'eco
  duration = pulseIn(ECHO_PIN, HIGH);
  
  // Calcola la distanza (in cm)
  // La velocità del suono è 343 m/s o 34300 cm/s
  // Il tempo misurato è di andata e ritorno, quindi dividiamo per 2
  // Quindi: distanza = (tempo × 34300) / 2 / 1000000 = tempo / 58
  distance = duration / 58;
  
  // Visualizza la distanza sul monitor seriale
  Serial.print("Distanza: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  delay(500);  // Attendi mezzo secondo prima della prossima misurazione
}
```
[Vedi il codice completo](Ultrasuoni_01_misurazione_base.ino)

### Limitazioni e considerazioni
- **Angolo di misurazione**: I sensori a ultrasuoni HC-SR04 hanno un angolo di rilevamento di circa 15-30 gradi. Oggetti al di fuori di questo cono potrebbero non essere rilevati.
- **Superfici irregolari**: Le superfici irregolari o inclinate possono disperdere l'onda ultrasonica, riducendo l'accuratezza.
- **Materiali morbidi**: Materiali morbidi o fonoassorbenti (come tessuti o schiuma) possono assorbire parte dell'onda ultrasonica, causando misurazioni imprecise.
- **Interferenze**: Altri dispositivi ultrasonici nelle vicinanze possono causare interferenze.
- **Condizioni ambientali**: Temperatura, umidità e pressione atmosferica influenzano la velocità del suono nell'aria, influenzando la precisione delle misurazioni.

## Parte 2: Funzionalità intermedie

### Misurazione con media mobile per maggiore stabilità

```cpp
// Misurazione con media mobile per ridurre il rumore
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;

// Parametri per la media mobile
const int NUM_READINGS = 5;  // Numero di letture da mediare
int readings[NUM_READINGS];  // Array per memorizzare le letture
int readIndex = 0;           // Indice della lettura corrente
long total = 0;              // Totale corrente

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.begin(9600);
  Serial.println("Sensore a ultrasuoni con media mobile attivo");
  
  // Inizializza l'array delle letture a 0
  for (int i = 0; i < NUM_READINGS; i++) {
    readings[i] = 0;
  }
}

void loop() {
  // Sottrai l'ultima lettura dal totale
  total = total - readings[readIndex];
  
  // Effettua una nuova misurazione
  readings[readIndex] = measureDistance();
  
  // Aggiungi la lettura al totale
  total = total + readings[readIndex];
  
  // Avanza all'indice successivo
  readIndex = (readIndex + 1) % NUM_READINGS;
  
  // Calcola la media
  int averageDistance = total / NUM_READINGS;
  
  // Visualizza sia la lettura corrente che la media
  Serial.print("Distanza attuale: ");
  Serial.print(readings[(readIndex - 1 + NUM_READINGS) % NUM_READINGS]);
  Serial.print(" cm | Media: ");
  Serial.print(averageDistance);
  Serial.println(" cm");
  
  delay(100);  // Breve ritardo tra le misurazioni
}

// Funzione per misurare la distanza
int measureDistance() {
  long duration;
  
  // Invia impulso ultrasonico
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Misura il tempo di ritorno dell'eco
  duration = pulseIn(ECHO_PIN, HIGH);
  
  // Calcola e restituisci la distanza in cm
  return duration / 58;
}
```
[Vedi il codice completo](Ultrasuoni_02_media_mobile.ino)

### Sistema di allarme di prossimità

```cpp
// Sistema di allarme di prossimità con LED e buzzer
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int LED_PIN = 13;    // LED integrato o esterno
const int BUZZER_PIN = 8;  // Pin per il buzzer

// Soglie di distanza per l'allarme (in cm)
const int SAFE_DISTANCE = 50;     // Distanza sicura
const int WARNING_DISTANCE = 30;  // Distanza di avvertimento
const int DANGER_DISTANCE = 15;   // Distanza di pericolo

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Sistema di allarme di prossimità attivo");
}

void loop() {
  // Misura la distanza
  int distance = measureDistance();
  
  // Visualizza la distanza
  Serial.print("Distanza: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  // Gestisci l'allarme in base alla distanza
  if (distance <= DANGER_DISTANCE) {
    // Zona di pericolo - allarme continuo
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, 1000);  // Tono acuto
    Serial.println("PERICOLO: Oggetto molto vicino!");
  } 
  else if (distance <= WARNING_DISTANCE) {
    // Zona di avvertimento - allarme intermittente
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, 500, 200);  // Tono medio, durata breve
    delay(200);  // Pausa tra i beep
    digitalWrite(LED_PIN, LOW);
    delay(200);
    Serial.println("ATTENZIONE: Oggetto in avvicinamento");
  } 
  else if (distance <= SAFE_DISTANCE) {
    // Zona di attenzione - solo segnalazione visiva
    digitalWrite(LED_PIN, HIGH);
    delay(500);
    digitalWrite(LED_PIN, LOW);
    delay(500);
    noTone(BUZZER_PIN);  // Assicurati che il buzzer sia spento
    Serial.println("Oggetto rilevato a distanza sicura");
  } 
  else {
    // Nessun oggetto rilevato entro la distanza di monitoraggio
    digitalWrite(LED_PIN, LOW);
    noTone(BUZZER_PIN);
  }
  
  delay(100);  // Breve ritardo per stabilità
}

// Funzione per misurare la distanza
int measureDistance() {
  long duration;
  
  // Invia impulso ultrasonico
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Misura il tempo di ritorno dell'eco
  duration = pulseIn(ECHO_PIN, HIGH);
  
  // Calcola e restituisci la distanza in cm
  return duration / 58;
}
```
[Vedi il codice completo](Ultrasuoni_03_allarme_prossimita.ino)

## Parte 3: Applicazioni avanzate

### Radar ultrasonico con visualizzazione seriale

```cpp
// Radar ultrasonico con visualizzazione seriale
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int SERVO_PIN = 11;  // Pin per il servomotore

#include <Servo.h>

Servo radarServo;  // Crea un oggetto servo

// Parametri del radar
const int MIN_ANGLE = 15;    // Angolo minimo di scansione
const int MAX_ANGLE = 165;   // Angolo massimo di scansione
const int STEP_ANGLE = 5;    // Incremento dell'angolo per ogni passo
const int MAX_DISTANCE = 200; // Distanza massima da visualizzare (cm)

// Variabili di stato
int currentAngle = MIN_ANGLE;
int scanDirection = 1;  // 1 = in senso orario, -1 = in senso antiorario

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  radarServo.attach(SERVO_PIN);
  radarServo.write(currentAngle);  // Posiziona il servo all'angolo iniziale
  
  Serial.begin(9600);
  Serial.println("Radar ultrasonico attivo");
  Serial.println("Formato dati: angolo,distanza");
  delay(1000);  // Attendi che il servo raggiunga la posizione iniziale
}

void loop() {
  // Misura la distanza all'angolo corrente
  int distance = measureDistance();
  
  // Limita la distanza al valore massimo
  if (distance > MAX_DISTANCE || distance <= 0) {
    distance = MAX_DISTANCE;
  }
  
  // Invia i dati al monitor seriale nel formato "angolo,distanza"
  Serial.print(currentAngle);
  Serial.print(",");
  Serial.println(distance);
  
  // Muovi il servo al prossimo angolo
  currentAngle += (STEP_ANGLE * scanDirection);
  
  // Cambia direzione se raggiungi i limiti
  if (currentAngle >= MAX_ANGLE || currentAngle <= MIN_ANGLE) {
    scanDirection *= -1;  // Inverti la direzione
  }
  
  // Assicurati che l'angolo rimanga nei limiti
  currentAngle = constrain(currentAngle, MIN_ANGLE, MAX_ANGLE);
  
  // Posiziona il servo al nuovo angolo
  radarServo.write(currentAngle);
  
  delay(100);  // Piccolo ritardo per stabilità
}

// Funzione per misurare la distanza
int measureDistance() {
  long duration;
  
  // Invia impulso ultrasonico
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Misura il tempo di ritorno dell'eco
  duration = pulseIn(ECHO_PIN, HIGH);
  
  // Calcola e restituisci la distanza in cm
  return duration / 58;
}
```
[Vedi il codice completo](Ultrasuoni_04_radar.ino)

### Theremin digitale con sensore a ultrasuoni

```cpp
// Theremin digitale con sensore ad ultrasuoni
const int BUZZER_PIN = 8;
const int TRIG_PIN = 9;    // Trigger del sensore HC-SR04
const int ECHO_PIN = 10;   // Echo del sensore HC-SR04

// Parametri del theremin
const int minFreq = 100;   // Frequenza minima (Hz)
const int maxFreq = 2000;  // Frequenza massima (Hz)
const int minDist = 5;     // Distanza minima (cm)
const int maxDist = 50;    // Distanza massima (cm)

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.begin(9600);
  Serial.println("Theremin digitale attivo");
}

void loop() {
  // Misura la distanza
  long duration, distance;
  
  // Invia impulso ultrasonico
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Calcola la distanza
  duration = pulseIn(ECHO_PIN, HIGH);
  distance = duration / 58;  // Conversione in cm
  
  // Limita la distanza nell'intervallo definito
  distance = constrain(distance, minDist, maxDist);
  
  // Mappa la distanza alla frequenza
  int frequency = map(distance, minDist, maxDist, maxFreq, minFreq);
  
  // Mostra i valori sulla seriale
  Serial.print("Distanza: ");
  Serial.print(distance);
  Serial.print(" cm | Frequenza: ");
  Serial.print(frequency);
  Serial.println(" Hz");
  
  // Genera il tono corrispondente
  tone(BUZZER_PIN, frequency);
  
  // Se la mano è troppo lontana, ferma il suono
  if (distance >= maxDist) {
    noTone(BUZZER_PIN);
  }
  
  delay(50);  // Piccolo ritardo per stabilità
}
```
[Vedi il codice completo](Ultrasuoni_05_theremin_digitale.ino)

### Parcheggio assistito

```cpp
// Sistema di parcheggio assistito con sensore a ultrasuoni
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int BUZZER_PIN = 8;
const int LED_GREEN = 5;   // LED verde - distanza sicura
const int LED_YELLOW = 6;  // LED giallo - attenzione
const int LED_RED = 7;     // LED rosso - stop

// Soglie di distanza (in cm)
const int SAFE_DISTANCE = 100;    // Distanza sicura
const int CAUTION_DISTANCE = 50;  // Distanza di attenzione
const int STOP_DISTANCE = 20;     // Distanza di stop

// Variabili per il beep intermittente
int beepInterval = 500;  // Intervallo iniziale tra i beep (ms)
long lastBeepTime = 0;   // Ultimo momento in cui è stato emesso un beep
boolean beepState = false;  // Stato corrente del beep

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("Sistema di parcheggio assistito attivo");
}

void loop() {
  // Misura la distanza
  int distance = measureDistance();
  
  // Visualizza la distanza
  Serial.print("Distanza: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  // Gestisci gli indicatori in base alla distanza
  if (distance <= STOP_DISTANCE) {
    // Zona di stop - LED rosso e beep continuo
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_RED, HIGH);
    tone(BUZZER_PIN, 1000);  // Beep continuo
    Serial.println("STOP!");
  } 
  else if (distance <= CAUTION_DISTANCE) {
    // Zona di attenzione - LED giallo e beep intermittente
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_YELLOW, HIGH);
    digitalWrite(LED_RED, LOW);
    
    // Calcola l'intervallo di beep in base alla distanza
    // Più vicino = beep più frequenti
    beepInterval = map(distance, STOP_DISTANCE, CAUTION_DISTANCE, 100, 500);
    
    // Gestisci il beep intermittente
    if (millis() - lastBeepTime > beepInterval) {
      lastBeepTime = millis();
      beepState = !beepState;
      
      if (beepState) {
        tone(BUZZER_PIN, 800, 100);  // Beep breve
      }
    }
    
    Serial.println("Attenzione: avvicinamento");
  } 
  else if (distance <= SAFE_DISTANCE) {
    // Zona sicura - LED verde, nessun beep
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_RED, LOW);
    noTone(BUZZER_PIN);
    Serial.println("Distanza sicura");
  } 
  else {
    // Fuori dalla zona di rilevamento
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_RED, LOW);
    noTone(BUZZER_PIN);
  }
  
  delay(50);  // Piccolo ritardo per stabilità
}

// Funzione per misurare la distanza
int measureDistance() {
  long duration;
  
  // Invia impulso ultrasonico
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Misura il tempo di ritorno dell'eco
  duration = pulseIn(ECHO_PIN, HIGH);
  
  // Calcola e restituisci la distanza in cm
  return duration / 58;
}
```
[Vedi il codice completo](Ultrasuoni_06_parcheggio_assistito.ino)

### Classe per sensore a ultrasuoni

```cpp
// Classe per gestire il sensore a ultrasuoni HC-SR04
class UltrasonicSensor {
  private:
    int trigPin;  // Pin Trigger
    int echoPin;  // Pin Echo
    int maxDistance;  // Distanza massima in cm
    float temperatureC;  // Temperatura in gradi Celsius
    
  public:
    // Costruttore
    UltrasonicSensor(int trig, int echo, int maxDist = 400, float temp = 20.0) {
      trigPin = trig;
      echoPin = echo;
      maxDistance = maxDist;
      temperatureC = temp;
      
      // Inizializza i pin
      pinMode(trigPin, OUTPUT);
      pinMode(echoPin, INPUT);
    }
    
    // Metodo per impostare la temperatura
    void setTemperature(float temp) {
      temperatureC = temp;
    }
    
    // Metodo per ottenere la velocità del suono in base alla temperatura
    float getSoundSpeed() {
      // La velocità del suono varia con la temperatura
      // Formula: v = 331.3 + 0.606 * T (dove T è in °C)
      return 331.3 + (0.606 * temperatureC);
    }
    
    // Metodo per misurare la distanza in centimetri
    float measureDistanceCm() {
      // Calcola il fattore di conversione in base alla velocità del suono
      float soundSpeed = getSoundSpeed();  // m/s
      float conversionFactor = 1000000.0 / (soundSpeed * 100.0 * 2.0);  // μs/cm
      
      // Misura la durata dell'eco
      long duration = measureDuration();
      
      // Calcola la distanza
      float distance = duration / conversionFactor;
      
      // Limita la distanza al valore massimo
      if (distance > maxDistance || distance <= 0) {
        return maxDistance;
      }
      
      return distance;
    }
    
    // Metodo per misurare la distanza in pollici
    float measureDistanceInch() {
      // 1 cm = 0.393701 pollici
      return measureDistanceCm() * 0.393701;
    }
    
    // Metodo per misurare la durata dell'eco
    long measureDuration() {
      // Invia impulso ultrasonico
      digitalWrite(trigPin, LOW);
      delayMicroseconds(2);
      digitalWrite(trigPin, HIGH);
      delayMicroseconds(10);
      digitalWrite(trigPin, LOW);
      
      // Misura il tempo di ritorno dell'eco (con timeout)
      long duration = pulseIn(echoPin, HIGH, 30000);  // Timeout di 30ms
      
      return duration;
    }
    
    // Metodo per verificare se un oggetto è entro una certa distanza
    bool isObjectDetected(float threshold) {
      float distance = measureDistanceCm();
      return (distance > 0 && distance <= threshold);
    }
};

// Esempio di utilizzo della classe
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int LED_PIN = 13;

// Crea un'istanza del sensore
UltrasonicSensor sensor(TRIG_PIN, ECHO_PIN);

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Test della classe UltrasonicSensor");
}

void loop() {
  // Misura la distanza
  float distance = sensor.measureDistanceCm();
  
  // Visualizza la distanza
  Serial.print("Distanza: ");
  Serial.print(distance);
  Serial.print(" cm (");
  Serial.print(sensor.measureDistanceInch());
  Serial.println(" pollici)");
  
  // Accendi il LED se un oggetto è entro 30 cm
  if (sensor.isObjectDetected(30)) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Oggetto rilevato!");
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  
  delay(500);
}
```
[Vedi il codice completo](Ultrasuoni_07_classe_sensore.ino)

## Risorse aggiuntive

- [Documentazione ufficiale Arduino](https://www.arduino.cc/reference/en/)
- [Tutorial su sensori a ultrasuoni](https://create.arduino.cc/projecthub/abdularbi17/ultrasonic-sensor-hc-sr04-with-arduino-tutorial-327ff6)
- [Guida ai sensori HC-SR04](https://lastminuteengineers.com/arduino-sr04-ultrasonic-sensor-tutorial/)
- [Progetti con sensori a ultrasuoni](https://randomnerdtutorials.com/complete-guide-for-ultrasonic-sensor-hc-sr04/)