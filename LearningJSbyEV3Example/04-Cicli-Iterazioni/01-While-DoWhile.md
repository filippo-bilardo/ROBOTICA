# Il ciclo while e do-while

I cicli `while` e `do-while` sono strutture fondamentali in JavaScript che permettono di eseguire un blocco di codice ripetutamente finché una condizione specificata rimane vera. Queste strutture di controllo sono particolarmente utili nella programmazione dei robot EV3 per implementare comportamenti persistenti e reattivi.

## Il ciclo while

Il ciclo `while` valuta una condizione e, se questa è vera, esegue un blocco di codice. Dopo l'esecuzione del blocco, la condizione viene rivalutata e, se è ancora vera, il blocco viene eseguito nuovamente. Questo processo continua finché la condizione diventa falsa.

### Sintassi

```javascript
while (condizione) {
    // Codice da eseguire finché la condizione è vera
}
```

### Esempio di base

```javascript
let contatore = 0;

while (contatore < 5) {
    brick.showString(`Contatore: ${contatore}`, 3);
    contatore++;  // Incrementa il contatore
    pause(1000);  // Pausa di 1 secondo
}

brick.showString("Ciclo terminato!", 3);
```

In questo esempio:
1. Il contatore inizia da 0
2. Il ciclo continua finché il contatore è minore di 5
3. Ad ogni iterazione, il valore del contatore viene visualizzato, incrementato, e il programma si mette in pausa per 1 secondo
4. Quando il contatore raggiunge 5, la condizione diventa falsa e il ciclo termina

## Applicazioni con EV3

### Monitoraggio continuo dei sensori

```javascript
// Monitora il sensore ultrasonico finché non rileva un ostacolo
while (sensoreUltrasuoni.distance() > 20) {
    // Continua ad avanzare finché non c'è un ostacolo entro 20 cm
    motors.largeBC.tank(50, 50);
    brick.showString(`Distanza: ${sensoreUltrasuoni.distance()} cm`, 3);
    pause(100);  // Piccola pausa per non sovraccaricare il sistema
}

// Quando rileva un ostacolo, fermati
motors.largeBC.stop();
brick.showString("Ostacolo rilevato!", 3);
```

### Attesa di un input specifico

```javascript
// Attende finché non viene premuto il pulsante di tocco
brick.showString("Premi il pulsante di tocco", 3);

while (!sensoreTocco.isPressed()) {
    // Lampeggia un LED o visualizza un messaggio intermittente
    brick.showString("In attesa...", 5);
    pause(500);
    brick.showString("", 5);  // Cancella la riga
    pause(500);
}

brick.showString("Pulsante premuto! Avvio...", 3);
```

### Realizzazione di un comportamento ripetitivo

```javascript
let angolo = 0;
let incremento = 10;

// Fa ruotare il robot avanti e indietro in modo progressivo
while (true) {  // Ciclo infinito (dovrà essere interrotto esternamente)
    // Ruota di un certo angolo
    motors.largeBC.tank(30, -30);
    pause(angolo);
    
    // Inverti direzione
    motors.largeBC.tank(-30, 30);
    pause(angolo);
    
    // Aumenta l'angolo per la prossima iterazione
    angolo += incremento;
    
    // Se l'angolo è troppo grande, resettalo
    if (angolo > 500) {
        angolo = 0;
    }
    
    // Controlla se il sensore di tocco è premuto per uscire dal ciclo
    if (sensoreTocco.isPressed()) {
        break;  // Esce dal ciclo
    }
}
```

## Il ciclo do-while

Il ciclo `do-while` è simile al ciclo `while`, ma con una differenza importante: il blocco di codice viene eseguito almeno una volta **prima** che la condizione venga valutata. Dopo la prima esecuzione, il comportamento è lo stesso del ciclo `while`.

### Sintassi

```javascript
do {
    // Codice da eseguire
} while (condizione);
```

### Esempio di base

```javascript
let contatore = 0;

do {
    brick.showString(`Contatore: ${contatore}`, 3);
    contatore++;
    pause(1000);
} while (contatore < 5);

brick.showString("Ciclo terminato!", 3);
```

La principale differenza tra questo esempio e l'equivalente con `while` è che, se il contatore iniziasse già da 5 o più, il ciclo `while` non eseguirebbe il codice neanche una volta, mentre il ciclo `do-while` lo eseguirebbe una volta prima di terminare.

## Applicazioni con EV3

### Eseguire un'azione almeno una volta

```javascript
// Esegue almeno una rotazione, poi controlla se continuare
do {
    // Ruota di 90 gradi
    motors.largeBC.tank(50, -50);
    pause(1000);  // Pausa approssimativa per una rotazione di 90°
    
    // Misura la distanza dopo la rotazione
    let distanza = sensoreUltrasuoni.distance();
    brick.showString(`Distanza: ${distanza} cm`, 3);
    
    // Continua a ruotare finché non trova uno spazio aperto
} while (distanza < 30);  // Ripeti se la distanza è ancora inferiore a 30 cm

// Procedi avanti quando trovi uno spazio aperto
motors.largeBC.tank(50, 50);
brick.showString("Percorso libero trovato!", 3);
```

### Menu di interazione utente

```javascript
let opzioneSelezionata;

do {
    // Mostra il menu
    brick.clearScreen();
    brick.showString("MENU ROBOT:", 1);
    brick.showString("1: Segui linea", 3);
    brick.showString("2: Evita ostacoli", 4);
    brick.showString("3: Danza", 5);
    brick.showString("4: Esci", 6);
    brick.showString("Premi un pulsante...", 8);
    
    // Attendi la pressione di un pulsante
    while (!brick.buttonEnter.isPressed() && 
           !brick.buttonLeft.isPressed() && 
           !brick.buttonRight.isPressed() && 
           !brick.buttonUp.isPressed()) {
        pause(100);
    }
    
    // Determina quale pulsante è stato premuto
    if (brick.buttonUp.isPressed()) opzioneSelezionata = 1;
    else if (brick.buttonLeft.isPressed()) opzioneSelezionata = 2;
    else if (brick.buttonRight.isPressed()) opzioneSelezionata = 3;
    else if (brick.buttonEnter.isPressed()) opzioneSelezionata = 4;
    
    // Attendi il rilascio del pulsante
    while (brick.buttonEnter.isPressed() || 
           brick.buttonLeft.isPressed() || 
           brick.buttonRight.isPressed() || 
           brick.buttonUp.isPressed()) {
        pause(100);
    }
    
    // Esegui l'azione selezionata
    brick.clearScreen();
    if (opzioneSelezionata === 1) {
        brick.showString("Modalità: Segui linea", 3);
        // Codice per seguire una linea
        pause(3000);  // Simulazione dell'esecuzione
    } else if (opzioneSelezionata === 2) {
        brick.showString("Modalità: Evita ostacoli", 3);
        // Codice per evitare ostacoli
        pause(3000);  // Simulazione dell'esecuzione
    } else if (opzioneSelezionata === 3) {
        brick.showString("Modalità: Danza", 3);
        // Codice per far danzare il robot
        pause(3000);  // Simulazione dell'esecuzione
    }
    
} while (opzioneSelezionata !== 4);  // Continua finché l'utente non seleziona "Esci"

brick.showString("Programma terminato", 3);
```

## Cicli infiniti e loro gestione

A volte, nella programmazione robotica, è necessario creare cicli che teoricamente non terminano mai, in modo che il robot continui a monitorare l'ambiente e reagire. In JavaScript, questo può essere fatto con `while (true)`.

```javascript
// Ciclo infinito per il monitoraggio continuo dei sensori
while (true) {
    let distanza = sensoreUltrasuoni.distance();
    let colore = sensoreColore.color();
    
    // Reagisci in base ai valori dei sensori
    if (distanza < 20) {
        // Evita ostacoli
        motors.largeBC.tank(-50, 50);
        pause(1000);
    } else if (colore === Color.Black) {
        // Segui la linea nera
        motors.largeBC.tank(50, 50);
    } else {
        // Cerca la linea
        motors.largeBC.tank(30, -30);
    }
    
    // Controlla se il pulsante di emergenza è premuto
    if (sensoreTocco.isPressed()) {
        break;  // Esce dal ciclo infinito
    }
    
    pause(100);  // Breve pausa per non sovraccaricare il sistema
}
```

### Considerazioni importanti

1. **Condizione di uscita**: Assicurati sempre di avere un modo per uscire da un ciclo, specialmente se è pensato per essere "infinito". L'istruzione `break` è spesso usata per questo scopo.

2. **Pause**: Includi sempre brevi pause (`pause()`) nei cicli per evitare di sovraccaricare la CPU del robot.

3. **Controllo della batteria**: Nei cicli lunghi, considera di monitorare periodicamente il livello della batteria e avvisare quando è basso.

## When to Use while vs. do-while

- **while**: Usa il ciclo `while` quando vuoi che la condizione sia verificata **prima** di eseguire il codice. Questo è il caso più comune.

- **do-while**: Usa il ciclo `do-while` quando vuoi che il codice sia eseguito **almeno una volta** indipendentemente dalla condizione. È utile per menu, interazioni utente o quando vuoi fare qualcosa prima di verificare se continuare.

## Best Practices

1. **Evita cicli infiniti non intenzionali**: Assicurati che ci sia sempre un modo per uscire dal ciclo, o che la condizione diventi eventualmente falsa.

2. **Aggiorna sempre le variabili di controllo**: Se il ciclo dipende da una variabile (come un contatore), assicurati di aggiornare questa variabile all'interno del ciclo.

3. **Mantieni i cicli semplici**: Per cicli complessi, considera di estrarre parte della logica in funzioni separate.

4. **Controlla le risorse**: In cicli lunghi, fai attenzione all'uso della memoria e al consumo della batteria.

## Conclusione

I cicli `while` e `do-while` sono strumenti potenti per creare comportamenti persistenti e reattivi nei robot EV3. Capire quando e come usarli ti permetterà di creare programmi più sofisticati che reagiscono continuamente all'ambiente circostante, una caratteristica essenziale per i robot autonomi.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Modulo 4: Cicli e Iterazioni](README.md)
- [➡️ Il ciclo for](02-For.md)