# Istruzioni Condizionali: if, else if, else

Le istruzioni condizionali sono blocchi di codice che permettono al programma di eseguire azioni diverse in base a condizioni specifiche. In JavaScript, le principali istruzioni condizionali sono `if`, `else if` ed `else`.

## Struttura di base dell'istruzione if

L'istruzione `if` controlla se una condizione è vera (`true`) ed esegue un blocco di codice solo se la condizione è soddisfatta.

```javascript
if (condizione) {
    // Codice da eseguire se la condizione è vera
}
```

Esempio pratico con EV3:

```javascript
// Ferma il robot se il sensore a ultrasuoni rileva un ostacolo a meno di 10 cm
if (sensoreUltrasuoni.getDistance() < 10) {
    motors.largeBC.stop();
}
```

## Struttura if-else

L'istruzione `else` viene utilizzata insieme all'`if` per eseguire un blocco di codice quando la condizione dell'`if` non è soddisfatta.

```javascript
if (condizione) {
    // Codice da eseguire se la condizione è vera
} else {
    // Codice da eseguire se la condizione è falsa
}
```

Esempio pratico con EV3:

```javascript
// Se il sensore di colore rileva il nero, vai avanti; altrimenti, fermati
if (sensoreColore.color() === Color.Black) {
    motors.largeBC.tank(50, 50); // Avanza alla velocità 50
} else {
    motors.largeBC.stop(); // Si ferma
}
```

## Struttura if-else if-else

Quando abbiamo bisogno di testare più condizioni, possiamo utilizzare la struttura `if-else if-else`.

```javascript
if (condizione1) {
    // Codice da eseguire se condizione1 è vera
} else if (condizione2) {
    // Codice da eseguire se condizione1 è falsa e condizione2 è vera
} else {
    // Codice da eseguire se tutte le condizioni precedenti sono false
}
```

Esempio pratico con EV3:

```javascript
// Determina il comportamento del robot in base al colore rilevato
if (sensoreColore.color() === Color.Black) {
    // Se rileva il nero, segue la linea
    motors.largeBC.tank(50, 50);
} else if (sensoreColore.color() === Color.Red) {
    // Se rileva il rosso, si ferma
    motors.largeBC.stop();
} else if (sensoreColore.color() === Color.Blue) {
    // Se rileva il blu, ruota a destra
    motors.largeBC.tank(50, -50);
} else {
    // Per tutti gli altri colori, torna indietro
    motors.largeBC.tank(-50, -50);
}
```

## If annidati

È possibile annidare le istruzioni `if` all'interno di altre istruzioni `if`, creando strutture decisionali complesse.

```javascript
if (condizione1) {
    if (condizione2) {
        // Codice da eseguire se entrambe le condizioni sono vere
    } else {
        // Codice da eseguire se condizione1 è vera e condizione2 è falsa
    }
} else {
    // Codice da eseguire se condizione1 è falsa
}
```

Esempio pratico con EV3:

```javascript
// Comportamento del robot in base a due sensori
if (sensoreUltrasuoni.getDistance() < 20) {
    // Se c'è un ostacolo vicino
    if (sensoreColore.color() === Color.Red) {
        // Se l'ostacolo è rosso, si ferma completamente
        motors.largeBC.stop();
        brick.showString("Ostacolo rosso rilevato!", 1);
    } else {
        // Se l'ostacolo è di un altro colore, lo evita
        motors.largeBC.tank(-30, 30); // Gira a sinistra
    }
} else {
    // Se non ci sono ostacoli, continua ad avanzare
    motors.largeBC.tank(50, 50);
}
```

## Best Practices

1. **Chiarezza**: Scrivi condizioni chiare e leggibili, evitando logiche troppo complesse in una singola condizione.

2. **Uso delle parentesi graffe**: Anche se per un'istruzione singola le parentesi graffe `{}` sono opzionali, è una buona pratica usarle sempre per aumentare la leggibilità e prevenire errori.

3. **Evita if annidati profondi**: Troppi livelli di annidamento rendono il codice difficile da leggere e mantenere. Considera l'uso di funzioni o condizioni più complesse per semplificare la struttura.

4. **Verifica le condizioni più comuni prima**: Per ottimizzare le prestazioni, è meglio mettere le condizioni più probabili all'inizio della catena if-else if.

## Esempi Applicati alla Robotica EV3

### Esempio 1: Robot che segue una linea

```javascript
forever(function() {
    if (sensoreColore.color() === Color.Black) {
        // Sulla linea nera, va dritto
        motors.largeBC.tank(50, 50);
    } else if (sensoreColore.color() === Color.White) {
        // Fuori dalla linea, cerca di ritrovarla
        motors.largeBC.tank(10, 50); // Curva leggermente a sinistra
    } else {
        // Per altri colori (potrebbe essere rosso come "stop")
        motors.largeBC.stop();
    }
});
```

### Esempio 2: Robot che evita ostacoli

```javascript
forever(function() {
    if (sensoreUltrasuoni.getDistance() > 30) {
        // Nessun ostacolo, procede in avanti
        motors.largeBC.tank(50, 50);
    } else if (sensoreUltrasuoni.getDistance() > 15) {
        // Ostacolo a distanza media, rallenta
        motors.largeBC.tank(20, 20);
    } else {
        // Ostacolo vicino, si ferma e gira
        motors.largeBC.stop();
        pause(500);
        motors.largeBC.tank(50, -50); // Gira a destra
        pause(1000);
    }
});
```

## Conclusione

Le istruzioni condizionali sono fondamentali per creare robot che possano reagire al loro ambiente e prendere decisioni autonome. Con `if`, `else if` ed `else`, puoi programmare comportamenti complessi per il tuo robot EV3, permettendogli di adattarsi a diverse situazioni e stimoli ambientali.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Modulo 3: Strutture di Controllo e Condizioni](README.md)
- [➡️ Operatori di Confronto e Logici](02-OperatoriConfrontoLogici.md)