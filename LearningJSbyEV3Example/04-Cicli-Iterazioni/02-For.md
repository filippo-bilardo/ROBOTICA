# Il ciclo for

Il ciclo `for` è una struttura di controllo potente e versatile in JavaScript, utilizzata per eseguire un blocco di codice un numero specifico di volte. È particolarmente utile quando si conosce in anticipo il numero di iterazioni che si desidera eseguire, o quando si desidera iterare attraverso una sequenza di elementi.

## Sintassi di base

```javascript
for (inizializzazione; condizione; espressione finale) {
    // Codice da eseguire ad ogni iterazione
}
```

Dove:
- **inizializzazione**: Espressione eseguita una sola volta prima che inizi il ciclo. Tipicamente utilizzata per dichiarare e inizializzare un contatore.
- **condizione**: Espressione valutata prima di ogni iterazione. Se è vera, il ciclo continua; se è falsa, il ciclo termina.
- **espressione finale**: Espressione eseguita alla fine di ogni iterazione. Tipicamente utilizzata per incrementare o decrementare il contatore.

## Esempio di base

```javascript
// Conta da 0 a 4
for (let i = 0; i < 5; i++) {
    brick.showString(`Contatore: ${i}`, 3);
    pause(1000);  // Pausa di 1 secondo
}

brick.showString("Ciclo terminato!", 3);
```

In questo esempio:
1. `let i = 0` inizializza il contatore `i` a 0
2. `i < 5` è la condizione che mantiene il ciclo attivo finché `i` è minore di 5
3. `i++` incrementa il contatore di 1 ad ogni iterazione
4. Ad ogni iterazione, il valore di `i` viene visualizzato, e il programma si mette in pausa per 1 secondo
5. Quando `i` raggiunge 5, la condizione diventa falsa e il ciclo termina

## Varianti del ciclo for

### For con decremento

```javascript
// Conto alla rovescia da 5 a 1
for (let i = 5; i > 0; i--) {
    brick.showString(`Conto alla rovescia: ${i}`, 3);
    pause(1000);
}

brick.showString("Via!", 3);
```

### For con incremento personalizzato

```javascript
// Mostra solo i numeri pari da 0 a 10
for (let i = 0; i <= 10; i += 2) {
    brick.showString(`Numero pari: ${i}`, 3);
    pause(1000);
}
```

### For con più variabili

```javascript
// Due contatori che si muovono in direzioni opposte
for (let i = 0, j = 10; i <= 10; i++, j--) {
    brick.showString(`i = ${i}, j = ${j}`, 3);
    pause(1000);
}
```

## Applicazioni con EV3

### Movimento a zigzag con ampiezza crescente

```javascript
let velocitaBase = 50;

// Esegue un pattern a zigzag con ampiezza crescente
for (let ampiezza = 10; ampiezza <= 100; ampiezza += 10) {
    // Gira a destra
    motors.largeBC.tank(velocitaBase, velocitaBase / 2);
    pause(ampiezza * 10);  // Tempo proporzionale all'ampiezza
    
    // Gira a sinistra
    motors.largeBC.tank(velocitaBase / 2, velocitaBase);
    pause(ampiezza * 10);
    
    // Mostra l'ampiezza corrente
    brick.showString(`Ampiezza: ${ampiezza}`, 3);
}
```

### Sequenza di suoni con frequenza crescente

```javascript
// Riproduci una scala di suoni con frequenza crescente
for (let frequenza = 200; frequenza <= 2000; frequenza += 200) {
    brick.showString(`Frequenza: ${frequenza} Hz`, 3);
    music.playTone(frequenza, 500);  // Frequenza, durata in ms
    pause(600);  // Pausa per evitare sovrapposizioni
}
```

### Rotazione precisa con verifica

```javascript
// Esegue rotazioni di 90 gradi, verificando con il giroscopio
let angoloIniziale = sensoreGiroscopio.angle();
let angoloTarget = angoloIniziale + 360;  // Rotazione completa di 360°

// Ruota di 90° alla volta
for (let angolo = angoloIniziale; angolo < angoloTarget; angolo += 90) {
    brick.showString(`Target: ${angolo}°`, 3);
    
    // Avvia la rotazione
    motors.largeBC.tank(50, -50);
    
    // Controlla continuamente l'angolo attuale
    while (sensoreGiroscopio.angle() < angolo) {
        brick.showString(`Attuale: ${sensoreGiroscopio.angle()}°`, 4);
        pause(50);
    }
    
    // Fermati quando raggiungi l'angolo target
    motors.largeBC.stop();
    brick.showString("Posizione raggiunta", 5);
    pause(1000);
}
```

### Esplorazione a spirale

```javascript
// Esegue un pattern a spirale (cerchi di raggio crescente)
let durata = 1000;  // Durata iniziale in millisecondi

for (let giro = 1; giro <= 5; giro++) {
    // Mostra il numero del giro
    brick.showString(`Giro #${giro}`, 3);
    
    // Aumenta la durata ad ogni giro
    durata += 500;
    
    // Esegui un cerchio completo
    motors.largeBC.tank(70, 40);
    pause(durata);
    
    // Breve pausa tra i giri
    motors.largeBC.stop();
    pause(500);
}
```

### Calibrazione del sensore di colore

```javascript
// Calibra il sensore di colore mostrando i valori RGB per diversi colori
let colori = ["nero", "rosso", "verde", "blu", "bianco"];

for (let i = 0; i < colori.length; i++) {
    // Chiedi all'utente di mostrare il colore
    brick.clearScreen();
    brick.showString(`Posiziona il sensore su: ${colori[i]}`, 3);
    brick.showString("Premi il pulsante quando pronto", 5);
    
    // Attendi la pressione del pulsante
    while (!brick.buttonEnter.isPressed()) {
        pause(100);
    }
    
    // Attendi il rilascio del pulsante
    while (brick.buttonEnter.isPressed()) {
        pause(100);
    }
    
    // Leggi i valori RGB
    let rgb = sensoreColore.rgb();
    
    // Mostra i valori
    brick.clearScreen();
    brick.showString(`Colore: ${colori[i]}`, 1);
    brick.showString(`R: ${rgb.r}`, 3);
    brick.showString(`G: ${rgb.g}`, 4);
    brick.showString(`B: ${rgb.b}`, 5);
    
    // Salva i valori (in un'applicazione reale)
    // salvaCalibrazione(colori[i], rgb);
    
    brick.showString("Salvato!", 7);
    pause(2000);
}
```

## For con array

Il ciclo `for` è particolarmente utile per iterare attraverso gli elementi di un array:

```javascript
// Array di comandi per una sequenza di movimenti
let sequenzaComandi = [
    { azione: "avanti", durata: 2000 },
    { azione: "destra", durata: 1000 },
    { azione: "avanti", durata: 1500 },
    { azione: "sinistra", durata: 1000 },
    { azione: "avanti", durata: 1000 }
];

// Esegui la sequenza di comandi
for (let i = 0; i < sequenzaComandi.length; i++) {
    let comando = sequenzaComandi[i];
    
    brick.showString(`Comando: ${comando.azione}`, 3);
    brick.showString(`Durata: ${comando.durata} ms`, 4);
    
    // Esegui l'azione appropriata
    if (comando.azione === "avanti") {
        motors.largeBC.tank(50, 50);
    } else if (comando.azione === "destra") {
        motors.largeBC.tank(50, -50);
    } else if (comando.azione === "sinistra") {
        motors.largeBC.tank(-50, 50);
    }
    
    // Attendi la durata specificata
    pause(comando.durata);
}

// Fermati alla fine della sequenza
motors.largeBC.stop();
brick.showString("Sequenza completata", 3);
```

## For...of e For...in

JavaScript offre anche altri tipi di cicli for che possono essere utili in determinate situazioni:

### For...of (Iterazione sui valori)

Il ciclo `for...of` itera sui valori degli oggetti iterabili (come array, stringhe, ecc.):

```javascript
// Array di colori da riconoscere
let coloriTarget = [Color.Red, Color.Blue, Color.Green, Color.Yellow];
let coloriTrovati = [];

// Itera sui colori target
for (let colore of coloriTarget) {
    brick.clearScreen();
    
    // Determina il nome del colore per la visualizzazione
    let nomeColore;
    switch (colore) {
        case Color.Red: nomeColore = "rosso"; break;
        case Color.Blue: nomeColore = "blu"; break;
        case Color.Green: nomeColore = "verde"; break;
        case Color.Yellow: nomeColore = "giallo"; break;
    }
    
    brick.showString(`Cerca il colore: ${nomeColore}`, 3);
    
    // Cerca il colore
    let trovatoColore = false;
    let tempoInizio = control.millis();
    
    // Tempo massimo di ricerca: 30 secondi
    while ((control.millis() - tempoInizio) < 30000 && !trovatoColore) {
        // Muovi il robot
        motors.largeBC.tank(30, -30);
        
        // Controlla se è stato trovato il colore
        if (sensoreColore.color() === colore) {
            trovatoColore = true;
            coloriTrovati.push(colore);
            
            // Celebra il rilevamento
            motors.largeBC.stop();
            music.playSoundEffect(SoundEffect.Success);
            brick.showString(`${nomeColore} trovato!`, 5);
            pause(2000);
        }
        
        // Breve pausa per non sovraccaricare il sistema
        pause(100);
    }
    
    // Se non è stato trovato, mostra un messaggio
    if (!trovatoColore) {
        brick.showString(`${nomeColore} non trovato`, 5);
        music.playSoundEffect(SoundEffect.Error);
        pause(2000);
    }
}

// Mostra i risultati
brick.clearScreen();
brick.showString("Ricerca completata!", 1);
brick.showString(`Colori trovati: ${coloriTrovati.length}/${coloriTarget.length}`, 3);
```

### For...in (Iterazione sulle proprietà)

Il ciclo `for...in` itera sulle proprietà enumerabili di un oggetto:

```javascript
// Oggetto con la configurazione del robot
let configurazioneRobot = {
    velocita: 50,
    distanzaSicurezza: 20,
    modalitaSeguilinea: true,
    tempoRotazione: 1000,
    coloreTarget: Color.Black
};

// Mostra tutte le impostazioni
brick.clearScreen();
brick.showString("Configurazione Robot:", 1);

let riga = 3;
for (let proprietà in configurazioneRobot) {
    brick.showString(`${proprietà}: ${configurazioneRobot[proprietà]}`, riga);
    riga++;
}

pause(5000);  // Mostra le impostazioni per 5 secondi
```

## Cicli for senza corpo

È possibile creare cicli for senza un corpo esplicito, mettendo tutta la logica nell'espressione finale:

```javascript
// Avanza per 5 secondi, aggiornando il display ogni secondo
for (let i = 5; i > 0; brick.showString(`Tempo: ${i--} s`, 3), pause(1000));

// Fermati
motors.largeBC.stop();
brick.showString("Tempo scaduto!", 3);
```

## Cicli for con sezioni opzionali

È possibile omettere alcune parti della sintassi del ciclo for:

```javascript
// For senza inizializzazione (i già dichiarato altrove)
let i = 0;
for (; i < 5; i++) {
    brick.showString(`Contatore: ${i}`, 3);
    pause(1000);
}

// For senza espressione finale (incremento fatto nel corpo)
for (let j = 0; j < 5;) {
    brick.showString(`Contatore: ${j}`, 3);
    j++;  // Incremento fatto qui invece che nella dichiarazione del for
    pause(1000);
}

// For senza condizione (equivalente a un ciclo infinito con break)
for (let k = 0;;) {
    brick.showString(`Contatore: ${k}`, 3);
    k++;
    pause(1000);
    
    if (k >= 5) {
        break;  // Esce dal ciclo quando k raggiunge 5
    }
}

// For completamente vuoto (ciclo infinito)
/*
for (;;) {
    // Esegue ripetutamente il codice senza condizioni di arresto
    // Richiede un break o return per uscire
}
*/
```

## Best Practices

1. **Nomi significativi per i contatori**: Usa nomi descrittivi per i contatori quando il loro scopo non è ovvio (ad esempio, `for (let riga = 0; riga < 8; riga++)` è più chiaro di `for (let i = 0; i < 8; i++)` quando si sta iterando su una matrice).

2. **Evita modifiche al contatore all'interno del ciclo**: A meno che non ci sia un motivo specifico, evita di modificare il contatore del ciclo all'interno del corpo del ciclo.

3. **Scegli l'intervallo corretto**: Fai attenzione a scegliere la condizione di terminazione corretta, specialmente quando lavori con indici di array (ricorda che gli array in JavaScript sono 0-based).

4. **Itera sugli array con for...of**: Quando possibile, usa `for...of` per iterare sugli elementi di un array invece di usare indici numerici.

5. **Separa la logica complessa**: Se il corpo del ciclo diventa complesso, considera di estrarre la logica in una funzione separata.

## Conclusione

Il ciclo `for` è uno strumento potente nella programmazione dei robot EV3, particolarmente utile per:

- Eseguire movimenti ripetitivi un numero specifico di volte
- Implementare pattern di movimento che seguono una progressione
- Iterare attraverso sequenze di azioni predefinite
- Calibrare i sensori
- Implementare algoritmi basati su grid (griglie) o pattern
- Eseguire azioni temporizzate con precisione

Padroneggiare il ciclo `for` e le sue varianti ti permetterà di creare comportamenti più complessi e strutturati nei tuoi robot.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Il ciclo while e do-while](01-While-DoWhile.md)
- [➡️ Cicli annidati](03-CicliAnnidati.md)