# Guida all'utilizzo dei Servo Motori con Arduino

## Parte 1: Le basi

### Cos'è un Servo Motore?
Un servo motore è un attuatore rotativo o lineare che consente un controllo preciso della posizione angolare, della velocità e dell'accelerazione. È composto da un motore DC, un sistema di ingranaggi, un potenziometro per il feedback di posizione e un circuito di controllo. I servo motori sono ampiamente utilizzati in robotica, modellismo e automazione per il loro preciso controllo di posizione. Esistono principalmente due tipi di servo motori:
- **Servo standard (rotazione limitata)**: può ruotare tipicamente da 0° a 180°, ideale per applicazioni che richiedono un posizionamento preciso in un range limitato.
- **Servo a rotazione continua**: modificato per ruotare continuamente come un normale motore DC, ma con controllo della velocità e direzione, utile per ruote di robot e applicazioni che richiedono movimento continuo.

![Servo Motor](img/servo_image01.png)

### Datasheet
Ecco alcuni link a datasheet di servo motori disponibili in commercio:
- [Tower Pro SG90 Micro Servo](http://www.towerpro.com.tw/product/sg90-7/)
- [Hitec HS-422 Standard Servo](https://hitecrcd.com/products/servos/analog/standard-sport/hs-422/product)
- [Futaba S3003 Standard Servo](https://www.futabarc.com/servos/analog.html)

### Componenti necessari
- Arduino (qualsiasi modello)
- Servo motore (standard o a rotazione continua)
- Breadboard
- Cavi di collegamento
- Alimentazione esterna (opzionale, ma consigliata per progetti con più servo)

### Schema di collegamento base
1. Collega il filo rosso del servo a 5V di Arduino
2. Collega il filo nero/marrone del servo a GND di Arduino
3. Collega il filo giallo/arancione/bianco (segnale) a un pin digitale di Arduino (es. pin 9)

Nota: Per progetti con più servo o servo di grandi dimensioni, è consigliabile utilizzare un'alimentazione esterna per evitare di sovraccaricare Arduino.

### Primo sketch: Controllo base di posizione

```cpp
// Sketch base per servo motore
#include <Servo.h>

const int SERVO_PIN = 9;  // Pin a cui è collegato il servo
Servo myServo;           // Crea un oggetto servo

void setup() {
  myServo.attach(SERVO_PIN);  // Collega il servo al pin specificato
}

void loop() {
  myServo.write(0);    // Muove il servo a 0 gradi
  delay(1000);         // Attende 1 secondo
  myServo.write(90);   // Muove il servo a 90 gradi
  delay(1000);         // Attende 1 secondo
  myServo.write(180);  // Muove il servo a 180 gradi
  delay(1000);         // Attende 1 secondo
}
```
[Vedi il codice completo](Servo_01_controllo_base.ino)

### Utilizzo di un servo a rotazione continua
I servo a rotazione continua si controllano in modo simile, ma i valori inviati determinano la velocità e la direzione anziché la posizione:

```cpp
// Sketch base per servo a rotazione continua
#include <Servo.h>

const int SERVO_PIN = 9;  // Pin a cui è collegato il servo
Servo continuousServo;    // Crea un oggetto servo

void setup() {
  continuousServo.attach(SERVO_PIN);  // Collega il servo al pin specificato
}

void loop() {
  continuousServo.write(0);    // Rotazione in senso orario alla massima velocità
  delay(2000);                 // Mantieni per 2 secondi
  
  continuousServo.write(90);   // Fermo (valore neutro)
  delay(1000);                 // Mantieni fermo per 1 secondo
  
  continuousServo.write(180);  // Rotazione in senso antiorario alla massima velocità
  delay(2000);                 // Mantieni per 2 secondi
  
  continuousServo.write(90);   // Fermo (valore neutro)
  delay(1000);                 // Mantieni fermo per 1 secondo
}
```
[Vedi il codice completo](Servo_02_rotazione_continua.ino)

## Parte 2: Funzionalità intermedie

### Controllo con potenziometro

```cpp
// Controllo del servo con potenziometro
#include <Servo.h>

const int SERVO_PIN = 9;       // Pin a cui è collegato il servo
const int POT_PIN = A0;        // Pin analogico per il potenziometro
Servo myServo;                 // Crea un oggetto servo

int potValue;                  // Valore letto dal potenziometro
int servoPosition;             // Posizione del servo

void setup() {
  myServo.attach(SERVO_PIN);  // Collega il servo al pin specificato
  Serial.begin(9600);          // Inizializza la comunicazione seriale
}

void loop() {
  potValue = analogRead(POT_PIN);                // Legge il valore del potenziometro (0-1023)
  servoPosition = map(potValue, 0, 1023, 0, 180); // Converte il valore in gradi (0-180)
  myServo.write(servoPosition);                  // Imposta la posizione del servo
  
  // Visualizza i valori sulla console seriale
  Serial.print("Potenziometro: ");
  Serial.print(potValue);
  Serial.print(" | Posizione servo: ");
  Serial.println(servoPosition);
  
  delay(15);  // Piccolo ritardo per stabilità
}
```
[Vedi il codice completo](Servo_03_controllo_potenziometro.ino)

### Movimento fluido (sweep)

```cpp
// Movimento fluido del servo
#include <Servo.h>

const int SERVO_PIN = 9;  // Pin a cui è collegato il servo
Servo myServo;           // Crea un oggetto servo

void setup() {
  myServo.attach(SERVO_PIN);  // Collega il servo al pin specificato
}

void loop() {
  // Movimento da 0 a 180 gradi
  for (int pos = 0; pos <= 180; pos += 1) {
    myServo.write(pos);  // Imposta la posizione del servo
    delay(15);           // Attende 15ms per permettere al servo di raggiungere la posizione
  }
  
  // Movimento da 180 a 0 gradi
  for (int pos = 180; pos >= 0; pos -= 1) {
    myServo.write(pos);  // Imposta la posizione del servo
    delay(15);           // Attende 15ms per permettere al servo di raggiungere la posizione
  }
}
```
[Vedi il codice completo](Servo_04_movimento_fluido.ino)

## Parte 3: Applicazioni avanzate

### Sistema di inseguimento solare

```cpp
// Sistema di inseguimento solare con due LDR e un servo
#include <Servo.h>

const int SERVO_PIN = 9;    // Pin a cui è collegato il servo
const int LDR_LEFT = A0;    // Pin analogico per il sensore di luce sinistro
const int LDR_RIGHT = A1;   // Pin analogico per il sensore di luce destro
const int THRESHOLD = 50;   // Soglia di differenza per il movimento

Servo trackingServo;        // Crea un oggetto servo
int currentPosition = 90;   // Posizione iniziale del servo (centro)

void setup() {
  trackingServo.attach(SERVO_PIN);  // Collega il servo al pin specificato
  trackingServo.write(currentPosition);  // Imposta la posizione iniziale
  Serial.begin(9600);                // Inizializza la comunicazione seriale
}

void loop() {
  // Legge i valori dei sensori di luce
  int leftLight = analogRead(LDR_LEFT);
  int rightLight = analogRead(LDR_RIGHT);
  
  // Calcola la differenza tra i due sensori
  int diff = leftLight - rightLight;
  
  Serial.print("Sinistra: ");
  Serial.print(leftLight);
  Serial.print(" | Destra: ");
  Serial.print(rightLight);
  Serial.print(" | Differenza: ");
  Serial.print(diff);
  Serial.print(" | Posizione: ");
  Serial.println(currentPosition);
  
  // Muove il servo in base alla differenza di luce
  if (abs(diff) > THRESHOLD) {  // Se la differenza supera la soglia
    if (diff > 0) {  // Se c'è più luce a sinistra
      currentPosition = constrain(currentPosition - 1, 0, 180);  // Muove verso sinistra
    } else {         // Se c'è più luce a destra
      currentPosition = constrain(currentPosition + 1, 0, 180);  // Muove verso destra
    }
    trackingServo.write(currentPosition);  // Aggiorna la posizione del servo
  }
  
  delay(50);  // Piccolo ritardo per stabilità
}
```
[Vedi il codice completo](Servo_05_inseguimento_solare.ino)

### Controllo di un braccio robotico semplice

```cpp
// Controllo di un braccio robotico semplice con due servo
#include <Servo.h>

const int BASE_SERVO_PIN = 9;    // Pin per il servo della base
const int ARM_SERVO_PIN = 10;    // Pin per il servo del braccio
const int JOYSTICK_X_PIN = A0;   // Pin analogico per l'asse X del joystick
const int JOYSTICK_Y_PIN = A1;   // Pin analogico per l'asse Y del joystick

Servo baseServo;                 // Servo per la rotazione della base
Servo armServo;                  // Servo per il movimento del braccio

int basePosition = 90;           // Posizione iniziale della base
int armPosition = 90;            // Posizione iniziale del braccio

void setup() {
  baseServo.attach(BASE_SERVO_PIN);  // Collega il servo della base
  armServo.attach(ARM_SERVO_PIN);    // Collega il servo del braccio
  
  // Imposta le posizioni iniziali
  baseServo.write(basePosition);
  armServo.write(armPosition);
  
  Serial.begin(9600);  // Inizializza la comunicazione seriale
}

void loop() {
  // Legge i valori del joystick
  int joystickX = analogRead(JOYSTICK_X_PIN);
  int joystickY = analogRead(JOYSTICK_Y_PIN);
  
  // Mappa i valori del joystick per il movimento dei servo
  // Aggiunge una zona morta centrale per evitare movimenti indesiderati
  if (abs(joystickX - 512) > 50) {  // Se il joystick è spostato sull'asse X
    int xMovement = map(joystickX, 0, 1023, -2, 2);  // Converte in incrementi di movimento
    basePosition = constrain(basePosition + xMovement, 0, 180);  // Aggiorna la posizione
    baseServo.write(basePosition);  // Muove il servo della base
  }
  
  if (abs(joystickY - 512) > 50) {  // Se il joystick è spostato sull'asse Y
    int yMovement = map(joystickY, 0, 1023, -2, 2);  // Converte in incrementi di movimento
    armPosition = constrain(armPosition + yMovement, 0, 180);  // Aggiorna la posizione
    armServo.write(armPosition);  // Muove il servo del braccio
  }
  
  // Visualizza i valori sulla console seriale
  Serial.print("Joystick X: ");
  Serial.print(joystickX);
  Serial.print(" | Base: ");
  Serial.print(basePosition);
  Serial.print(" | Joystick Y: ");
  Serial.print(joystickY);
  Serial.print(" | Braccio: ");
  Serial.println(armPosition);
  
  delay(15);  // Piccolo ritardo per stabilità
}
```
[Vedi il codice completo](Servo_06_braccio_robotico.ino)

### Controllo via seriale

```cpp
// Controllo del servo tramite comandi seriali
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
```
[Vedi il codice completo](Servo_07_controllo_seriale.ino)

## Parte 4: Considerazioni tecniche

### Specifiche comuni dei servo motori

| Parametro | Servo Standard | Servo Micro | Servo Digitale |
|-----------|----------------|-------------|----------------|
| Tensione operativa | 4.8-6V | 4.8-6V | 4.8-6V |
| Coppia (a 4.8V) | 3-5 kg/cm | 1.8 kg/cm | 6-10 kg/cm |
| Velocità (a 4.8V) | 0.19 sec/60° | 0.10 sec/60° | 0.08 sec/60° |
| Peso | 40-50g | 9g | 60-70g |
| Dimensioni | 40x20x38mm | 23x12x29mm | 40x20x38mm |

### Limitazioni e problemi comuni

1. **Consumo di corrente**: I servo motori possono richiedere molta corrente, specialmente durante l'avvio o sotto carico. Per progetti con più servo, è consigliabile utilizzare un'alimentazione esterna.

2. **Jitter**: Piccoli movimenti indesiderati del servo possono verificarsi quando si tenta di mantenere una posizione. Questo può essere causato da rumore elettrico o da un'alimentazione instabile.

3. **Precisione**: I servo economici possono avere una precisione limitata e non raggiungere esattamente la posizione desiderata.

4. **Usura meccanica**: L'uso continuo può causare usura degli ingranaggi, specialmente nei servo economici.

### Consigli per l'alimentazione

- Per un singolo servo piccolo, l'alimentazione di Arduino può essere sufficiente.
- Per più servo o servo di grandi dimensioni, utilizzare un'alimentazione esterna da 5-6V.
- Collegare sempre la massa (GND) dell'alimentazione esterna con quella di Arduino.
- Considerare l'uso di un condensatore da 100-470μF tra VCC e GND vicino ai servo per stabilizzare l'alimentazione.

### Librerie alternative per Arduino

Oltre alla libreria standard Servo.h, esistono altre librerie che offrono funzionalità avanzate:

- **ServoTimer2**: Utilizza il Timer2 invece del Timer1, utile quando il Timer1 è già utilizzato da altre librerie.
- **PCA9685**: Permette di controllare fino a 16 servo con un singolo modulo I2C, liberando i pin di Arduino.
- **VarSpeedServo**: Estende la libreria standard con il controllo della velocità di movimento.

## Risorse aggiuntive

- [Tutorial Arduino su Servo Motori](https://www.arduino.cc/en/Tutorial/Sweep)
- [Adafruit Motor Shield](https://learn.adafruit.com/adafruit-motor-shield-v2-for-arduino)
- [Servo Motor Basics](https://learn.sparkfun.com/tutorials/hobby-servo-tutorial/all)
- [Differenze tra Servo Analogici e Digitali](https://www.robotshop.com/community/blog/show/rc-servo-motors-analog-vs-digital)