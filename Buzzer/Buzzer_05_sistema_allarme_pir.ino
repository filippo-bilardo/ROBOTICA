/**
 * \Buzzer_05_sistema_allarme_pir
 *
 * Sistema di allarme con sensore PIR
 * Questo sketch attiva un allarme quando viene rilevato del movimento da un sensore PIR.
 * L'allarme è composto da un buzzer che suona per un certo periodo di tempo e da un LED che lampeggia.
 * Il sensore PIR è collegato al pin digitale 2, il buzzer al pin digitale 8 e il LED al pin digitale 9.
 *
 * https://wokwi.com/projects/425932743963164673
 * https://github.com/filippo-bilardo/ROBOTICA/tree/main/Buzzer
 * 
 * @author Fippo Bilardo
 * @version 1.0  20/03/25 - Versione iniziale
 */
 
 const int BUZZER_PIN = 8;
 const int PIR_PIN = 2;     // Pin del sensore PIR
 const int LED_PIN = 9;    
 
 // Parametri allarme
 const int ALARM_DURATION = 3000;  // Durata dell'allarme in ms
 boolean alarmActive = false;     // Stato dell'allarme
 
 void setup() {
   pinMode(BUZZER_PIN, OUTPUT);
   pinMode(PIR_PIN, INPUT);
   pinMode(LED_PIN, OUTPUT);
   Serial.begin(9600);
   Serial.println("Sistema di allarme attivo");
 }
 
 void loop() {
   int motionDetected = digitalRead(PIR_PIN);
   
   if (motionDetected == HIGH) {
     Serial.println("Movimento rilevato!");
     triggerAlarm();
   }
 }
 
 void triggerAlarm() {
   // Attiva l'allarme
   alarmActive = true;
   unsigned long startTime = millis();
   
   // Suona per la durata impostata
   while (millis() - startTime < ALARM_DURATION) {
     // Suono di allarme modulato
     for (int freq = 800; freq < 2000; freq += 10) {
       tone(BUZZER_PIN, freq);
       digitalWrite(LED_PIN, HIGH);
       delay(5);
     }
     for (int freq = 2000; freq > 800; freq -= 10) {
       tone(BUZZER_PIN, freq);
       digitalWrite(LED_PIN, LOW);
       delay(5);
     }
   }
   
   // Disattiva l'allarme
   noTone(BUZZER_PIN);
   digitalWrite(LED_PIN, LOW);
   alarmActive = false;
 }