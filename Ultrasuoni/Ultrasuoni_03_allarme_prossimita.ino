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