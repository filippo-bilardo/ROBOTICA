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