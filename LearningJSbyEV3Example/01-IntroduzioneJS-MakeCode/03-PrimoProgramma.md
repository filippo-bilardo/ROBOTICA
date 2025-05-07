# Primo Programma

In questa guida, creeremo il nostro primo programma JavaScript per il robot Lego EV3 utilizzando MakeCode. Impareremo la struttura di base di un programma JavaScript per EV3 e scriveremo un semplice codice per far muovere il robot.

## Struttura di un Programma JavaScript in MakeCode

Un programma JavaScript per EV3 in MakeCode ha la seguente struttura generale:

```javascript
// Importazioni e configurazioni iniziali
let motore = motors.largeA;

// Funzione principale (opzionale)
function main() {
    // Il codice del programma principale
}

// Istruzioni eseguite all'avvio del programma
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
    // Codice da eseguire quando si preme il pulsante centrale
});

// Oppure codice eseguito direttamente all'avvio
motore.run(50);
pause(1000);
motore.stop();
```

In MakeCode per EV3:
- Il codice viene eseguito dall'alto verso il basso
- Puoi utilizzare funzioni per organizzare il codice
- Puoi programmare risposte agli eventi (come la pressione di un pulsante)
- Puoi controllare direttamente i motori e i sensori

## Il Nostro Primo Programma: "Hello EV3"

Creiamo un semplice programma che visualizza "Hello EV3" sul display del robot e riproduce un suono.

1. Apri MakeCode per EV3 (https://makecode.mindstorms.com/)
2. Clicca su "Nuovo Progetto"
3. Passa alla modalità JavaScript cliccando su "JavaScript" nella parte superiore dell'editor
4. Sostituisci il codice esistente con il seguente:

```javascript
// Il mio primo programma per EV3
brick.showString("Hello EV3!", 1);
brick.showString("Il mio primo programma JS", 2);
music.playSoundEffect(SoundEffect.Hello);
pause(2000);
brick.clearScreen();
```

5. Fai clic su "Simula" per vedere il programma in esecuzione nel simulatore
6. Se hai un robot EV3 connesso, puoi scaricare il programma su di esso

### Spiegazione del Codice

- `brick.showString("Hello EV3!", 1)`: Visualizza il testo "Hello EV3!" sulla riga 1 del display EV3
- `brick.showString("Il mio primo programma JS", 2)`: Visualizza il testo sulla riga 2
- `music.playSoundEffect(SoundEffect.Hello)`: Riproduce un effetto sonoro preimpostato di saluto
- `pause(2000)`: Mette in pausa l'esecuzione per 2 secondi (2000 millisecondi)
- `brick.clearScreen()`: Pulisce lo schermo del brick EV3

## Modifichiamo il Nostro Programma: Aggiungiamo Movimento

Ora modifichiamo il programma per far muovere il robot:

```javascript
// Il mio primo programma per EV3 con movimento
brick.showString("Hello EV3!", 1);
music.playSoundEffect(SoundEffect.Hello);
pause(1000);

// Movimento in avanti
brick.showString("Movimento in avanti", 2);
motors.largeBC.tank(50, 50); // Entrambi i motori al 50% di potenza
pause(2000);                 // Continua per 2 secondi
motors.largeBC.stop();       // Ferma i motori

// Rotazione
brick.showString("Rotazione", 2);
motors.largeBC.tank(50, -50); // Un motore in avanti, uno indietro
pause(1000);                  // Continua per 1 secondo
motors.largeBC.stop();        // Ferma i motori

brick.showString("Fine!", 2);
music.playSoundEffect(SoundEffect.Goodbye);
```

### Spiegazione del Nuovo Codice

- `motors.largeBC.tank(50, 50)`: Controlla i motori B e C in modalità "tank" (come un carro armato), impostando entrambi al 50% della potenza
- `motors.largeBC.stop()`: Ferma entrambi i motori
- `motors.largeBC.tank(50, -50)`: Imposta il motore B al 50% in avanti e il motore C al 50% all'indietro, causando una rotazione

## Variabili e Personalizzazione

Possiamo migliorare ulteriormente il nostro programma utilizzando le variabili per rendere il codice più leggibile e personalizzabile:

```javascript
// Utilizzo di variabili per il controllo del movimento
let velocita = 50;            // Variabile per la velocità
let tempoAvanti = 2000;       // Tempo di movimento in avanti (ms)
let tempoRotazione = 1000;    // Tempo di rotazione (ms)

brick.showString("Robot in movimento", 1);

// Movimento in avanti
brick.showString("Avanti", 2);
motors.largeBC.tank(velocita, velocita);
pause(tempoAvanti);
motors.largeBC.stop();

// Rotazione
brick.showString("Rotazione", 2);
motors.largeBC.tank(velocita, -velocita);
pause(tempoRotazione);
motors.largeBC.stop();

brick.showString("Completato!", 1);
```

Utilizzando le variabili, possiamo facilmente modificare i parametri del nostro programma cambiando solo i valori delle variabili all'inizio.

## Commenti e Buone Pratiche

È importante commentare adeguatamente il tuo codice per renderlo comprensibile a te stesso e agli altri. Alcuni suggerimenti:

- Usa commenti `//` per spiegare cosa fa il codice
- Dai nomi significativi alle variabili
- Organizza il codice in sezioni logiche
- Mantieni un formato coerente (indentazione, spaziatura)

## Esercizi Pratici

1. **Modifica la velocità**: Cambia il valore della variabile `velocita` e osserva come cambia il movimento del robot
2. **Aggiungi più movimenti**: Fai in modo che il robot si muova in un percorso a forma di quadrato
3. **Aggiungi effetti sonori**: Inserisci effetti sonori aggiuntivi durante i diversi movimenti

Nel prossimo capitolo, impareremo come debuggare e testare i nostri programmi per risolvere eventuali problemi.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Ambiente di Sviluppo MakeCode](02-AmbienteMakeCode.md)
- [➡️ Debugging e Testing](04-DebuggingTesting.md)