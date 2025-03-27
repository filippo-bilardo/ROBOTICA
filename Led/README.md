# Guida all'utilizzo dei LED con Arduino

Questo repository contiene una serie di esempi pratici per l'utilizzo dei LED con Arduino, dal semplice lampeggiamento fino a progetti più complessi come il controllo PWM e l'implementazione di classi per la gestione dei LED.

## Introduzione ai LED

I LED (Light Emitting Diode) sono componenti elettronici che emettono luce quando attraversati da corrente elettrica. Sono ampiamente utilizzati in elettronica per la loro efficienza energetica, lunga durata e versatilità.

### Caratteristiche principali dei LED

- **Basso consumo energetico**: consumano meno energia rispetto alle lampadine tradizionali
- **Lunga durata**: possono durare fino a 50.000 ore o più
- **Dimensioni ridotte**: ideali per progetti compatti
- **Disponibili in vari colori**: rosso, verde, blu, bianco, giallo, RGB, ecc.
- **Accensione istantanea**: non richiedono tempo di riscaldamento

### Collegamento di un LED ad Arduino

Per collegare un LED ad Arduino è necessario:

1. Collegare l'anodo (gamba più lunga) del LED a un pin digitale di Arduino
2. Collegare il catodo (gamba più corta) a GND attraverso una resistenza
3. Utilizzare una resistenza appropriata (tipicamente 220-330 ohm) per limitare la corrente

![Schema di collegamento LED](img/image01.png)

## Esempi inclusi

1. **LED_01_lampeggio_semplice.ino**: Esempio base per far lampeggiare un LED
2. **LED_02_controllo_pulsante.ino**: Controllo di un LED tramite pulsante
3. **LED_03_luminosita_variabile.ino**: Controllo della luminosità tramite PWM
4. **LED_04_effetto_respiro.ino**: Effetto di dissolvenza (breathing effect)
5. **LED_05_semaforo.ino**: Simulazione di un semaforo con tre LED
6. **LED_06_led_rgb.ino**: Controllo di un LED RGB
7. **LED_07_knight_rider.ino**: Effetto "Knight Rider" con più LED
8. **LED_08_classe_led.ino**: Implementazione di una classe LED per OOP
9. **LED_09_led_non_bloccante.ino**: Controllo LED senza bloccare l'esecuzione
10. **LED_10_led_seriale.ino**: Controllo LED tramite comunicazione seriale

## Concetti avanzati

### Modulazione PWM

La modulazione PWM (Pulse Width Modulation) permette di variare la luminosità di un LED modificando il duty cycle del segnale. Arduino dispone di pin specifici che supportano questa funzionalità (contrassegnati con ~).

```cpp
analogWrite(ledPin, brightness); // brightness: 0-255
```

### LED RGB

I LED RGB contengono tre LED (rosso, verde e blu) in un unico package. Controllando l'intensità di ciascun colore è possibile ottenere una vasta gamma di colori.

### Approccio Object-Oriented

L'utilizzo di classi per gestire i LED permette di creare codice più modulare e riutilizzabile. Negli esempi avanzati viene implementata una classe LED con metodi per accensione, spegnimento, lampeggio e controllo della luminosità.

## Progetti pratici

- **Semaforo**: Simulazione di un semaforo stradale
- **Knight Rider**: Effetto luminoso ispirato alla serie TV
- **Indicatore di livello**: Visualizzazione di un valore tramite una barra di LED
- **Controllo remoto**: Controllo dei LED tramite comunicazione seriale

## Risorse aggiuntive

- [Documentazione ufficiale Arduino](https://www.arduino.cc/reference/en/)
- [Tutorial su LED e Arduino](https://www.arduino.cc/en/Tutorial/BuiltInExamples/Blink)
- [Guida ai pin PWM di Arduino](https://www.arduino.cc/en/Tutorial/PWM)