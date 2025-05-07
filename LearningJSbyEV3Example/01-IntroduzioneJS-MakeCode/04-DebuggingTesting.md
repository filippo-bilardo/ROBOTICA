# Debugging e Testing

In questa guida, esploreremo come individuare e risolvere problemi nei nostri programmi per Lego EV3 attraverso le tecniche di debugging e testing. Impareremo a utilizzare gli strumenti disponibili in MakeCode per assicurarci che i nostri programmi funzionino correttamente.

## Cos'è il Debugging?

Il debugging è il processo di identificazione e risoluzione degli errori nel codice. Questi errori, spesso chiamati "bug", possono essere di diversi tipi:

1. **Errori di sintassi**: Errori nella scrittura del codice che impediscono l'esecuzione del programma
2. **Errori logici**: Il programma si esegue ma non fa ciò che dovrebbe
3. **Errori di runtime**: Errori che si verificano durante l'esecuzione del programma

## Strumenti di Debugging in MakeCode

MakeCode offre diversi strumenti utili per il debugging dei programmi EV3:

### 1. Simulatore

Il simulatore è il primo strumento di debugging che dovresti utilizzare:

- Ti permette di testare il codice senza dover caricare il programma sul robot fisico
- Puoi vedere in tempo reale come il programma controlla i motori, i sensori e il display
- Puoi interagire con il simulatore premendo i pulsanti virtuali dell'EV3

### 2. Console di Debug

La console di debug mostra informazioni sull'esecuzione del programma:

- Visualizza gli errori di sintassi con descrizioni utili
- Mostra i messaggi di log che hai inserito nel codice
- Per visualizzare la console, fai clic su "Console" nella parte inferiore dell'editor

### 3. Breakpoints e Esecuzione Passo-Passo

In modalità JavaScript, puoi utilizzare breakpoints per fermare l'esecuzione del programma in punti specifici:

- Fai clic su una riga di codice per impostare un breakpoint (appare un punto rosso)
- Quando esegui il programma, l'esecuzione si fermerà a quel punto
- Puoi esaminare i valori delle variabili e procedere passo-passo

## Tecniche di Debugging Efficaci

### 1. Utilizzare i Messaggi di Debug

Inserisci istruzioni nel codice per visualizzare informazioni sul display dell'EV3:

```javascript
// Visualizza il valore di una variabile sul display
let velocita = 50;
brick.showString("Velocita: " + velocita, 1);
```

### 2. Verificare i Valori dei Sensori

Mostra i valori dei sensori per assicurarti che funzionino correttamente:

```javascript
// Mostra il valore del sensore di tocco
forever(function() {
    let valoreSensore = sensors.touch1.isPressed();
    brick.showString("Sensore: " + valoreSensore, 2);
    pause(100);
});
```

### 3. Isolare il Problema

Se il tuo programma non funziona:

1. Dividi il programma in parti più piccole
2. Testa ogni parte individualmente
3. Una volta trovata la parte problematica, concentrati su quella

### 4. Approccio Sistematico

Segui un approccio sistematico per risolvere i problemi:

1. Identifica il problema in modo specifico
2. Riproduci il problema in modo affidabile
3. Ipotizza le possibili cause
4. Testa le tue ipotesi una alla volta
5. Applica e verifica la soluzione

## Testing su Robot Fisici

Quando testi il tuo programma sul robot fisico, considera questi aspetti:

### 1. Differenze tra Simulatore e Robot Reale

- I motori fisici potrebbero comportarsi in modo leggermente diverso rispetto al simulatore
- I sensori reali possono essere influenzati dalle condizioni ambientali
- La batteria del robot può influenzare le prestazioni dei motori

### 2. Consigli per il Testing sul Robot Fisico

- Inizia con movimenti lenti e controllati
- Assicurati che la batteria sia carica
- Testa in un ambiente controllato con spazio sufficiente
- Fai piccole modifiche e testa frequentemente

### 3. Debugging su Robot Fisico

- Utilizza suoni o messaggi sul display per indicare le diverse fasi del programma
- Aggiungi pause per vedere chiaramente cosa sta succedendo
- Se possibile, mantieni il robot collegato al computer via Bluetooth per ricevere messaggi di debug

## Errori Comuni e Soluzioni

### 1. Il Robot Non Si Muove

Possibili cause:
- I motori non sono configurati correttamente (verifica le porte)
- La potenza è impostata troppo bassa
- La batteria è scarica

Soluzioni:
```javascript
// Verifica la configurazione corretta dei motori
motors.largeB.run(50); // Testa il singolo motore B
pause(1000);
motors.largeB.stop();
```

### 2. Il Robot Non Segue il Percorso Previsto

Possibili cause:
- I motori funzionano a velocità diverse
- Il robot non è bilanciato
- Il terreno influisce sul movimento

Soluzioni:
```javascript
// Calibrazione della velocità per compensare le differenze
motors.largeBC.tank(52, 50); // Leggera compensazione
```

### 3. I Sensori Non Rispondono Correttamente

Possibili cause:
- Il sensore non è collegato alla porta corretta
- Il sensore è sporco o ostruito
- La logica di risposta è errata

Soluzioni:
```javascript
// Test semplice per verificare il funzionamento del sensore
forever(function() {
    if (sensors.touch1.isPressed()) {
        brick.showString("Premuto!", 1);
    } else {
        brick.showString("Non premuto", 1);
    }
    pause(100);
});
```

## Esercizi Pratici di Debugging

1. **Debug di un Percorso**: Crea un programma che dovrebbe far seguire al robot un percorso quadrato, ma introduci deliberatamente un errore (ad esempio, una rotazione errata). Poi utilizza le tecniche di debugging per trovare e correggere l'errore.

2. **Sensore Problematico**: Scrivi un programma che utilizzi un sensore di luce per seguire una linea, ma fai in modo che non funzioni correttamente. Utilizza le tecniche di debugging per identificare il problema.

3. **Ottimizzazione della Velocità**: Crea un programma in cui il robot deve percorrere una certa distanza nel minor tempo possibile senza superare limiti predefiniti. Utilizza il debugging per ottimizzare la velocità.

Nel prossimo modulo, approfondiremo le variabili, i tipi di dati e gli operatori in JavaScript, elementi fondamentali per creare programmi più complessi e funzionali.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Primo Programma](03-PrimoProgramma.md)
- [➡️ Variabili, Tipi di Dati e Operatori](../02-Variabili-TipiDati-Operatori/README.md)