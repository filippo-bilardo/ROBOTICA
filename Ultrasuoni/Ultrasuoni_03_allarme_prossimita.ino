/*
 * @file Ultrasuoni_03_allarme_prossimita.ino
 * @brief Sistema di allarme di prossimità con sensore a ultrasuoni HC-SR04
 * 
 * @description
 * Questo sketch implementa un sistema di allarme di prossimità utilizzando il sensore a ultrasuoni HC-SR04 con Arduino.
 * Il sistema utilizza un LED e un buzzer per segnalare la presenza di oggetti a diverse distanze, con tre livelli di 
 * allarme: sicuro, avvertimento e pericolo.
 * La distanza viene misurata continuamente e il sistema reagisce in tempo reale, fornendo feedback visivo e acustico 
 * in base alla vicinanza dell'oggetto rilevato. Il risultato viene visualizzato in centimetri sul monitor seriale, 
 * insieme a messaggi di stato per ogni livello di allarme.  
 *  
 * 
 * https://wokwi.com/projects/458008366796643329
 * @author Filippo Bilardo
 * @date 09/03/2026
 * @version 1.0
 */

 // Sistema di allarme di prossimità con LED e buzzer
const int TRIG_PIN = 10;
const int ECHO_PIN = 9;
const int LED_PIN = 11;    // LED integrato o esterno
const int BUZZER_PIN = 4;  // Pin per il buzzer

// Soglie di distanza per l'allarme (in cm)
const int SAFE_DISTANCE = 150;     // Distanza sicura
const int WARNING_DISTANCE = 80;  // Distanza di avvertimento
const int DANGER_DISTANCE = 40;   // Distanza di pericolo

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