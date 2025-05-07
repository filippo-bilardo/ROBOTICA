# Espressioni e Valutazioni

Le espressioni sono combinazioni di valori, variabili e operatori che possono essere valutate per produrre un risultato. In questo capitolo, esploreremo come costruire e utilizzare espressioni in JavaScript, e come queste vengono valutate per controllare il comportamento del robot EV3.

## Cosa sono le Espressioni?

Un'espressione è qualsiasi unità di codice che può essere valutata per produrre un valore. Le espressioni possono essere semplici, come un singolo valore o variabile, o complesse, combinando più valori e operatori.

### Esempi di Espressioni Semplici:

```javascript
42              // Un valore numerico
"Ciao"          // Una stringa
true            // Un valore booleano
velocita        // Una variabile
motors.largeB   // Un riferimento a un oggetto
```

### Esempi di Espressioni Complesse:

```javascript
5 + 3                 // Espressione aritmetica
velocita * 1.5        // Combinazione di variabile e valore
distanza < 20         // Espressione di confronto
(a > b) && (c < d)    // Espressione logica complessa
```

## Tipi di Espressioni

### 1. Espressioni Aritmetiche

Le espressioni aritmetiche combinano numeri e operatori aritmetici per eseguire calcoli.

```javascript
// Calcolo della velocità media
let velocitaSinistra = 50;
let velocitaDestra = 55;
let velocitaMedia = (velocitaSinistra + velocitaDestra) / 2;  // 52.5

// Calcolo della distanza percorsa
let velocita = 30;  // cm/s
let tempo = 5;      // secondi
let distanza = velocita * tempo;  // 150 cm

// Calcolo del perimetro di un quadrato
let lato = 10;
let perimetro = lato * 4;  // 40
```

### 2. Espressioni di Stringa

Le espressioni di stringa combinano stringhe mediante concatenazione o template literals.

```javascript
// Concatenazione di stringhe
let nome = "EV3";
let saluto = "Ciao, " + nome + "!";  // "Ciao, EV3!"

// Template literals
let distanza = 15;
let messaggio = `Distanza rilevata: ${distanza} cm`;  // "Distanza rilevata: 15 cm"

// Concatenazione con altre espressioni
let batteria = 87;
let infoStato = `Stato: ${batteria > 20 ? "OK" : "Batteria scarica"}`;  // "Stato: OK"
```

### 3. Espressioni Logiche

Le espressioni logiche combinano condizioni con operatori logici per produrre valori booleani.

```javascript
// Condizioni semplici
let distanza = 15;
let percorsoLibero = distanza > 20;  // false

// Condizioni composte
let sensoreToccoPremuto = true;
let batteriaOK = 80 > 20;  // true
let robotPronto = !sensoreToccoPremuto && batteriaOK;  // false

// Espressioni logiche più complesse
let modalitaSicura = (distanza < 10) || sensoreToccoPremuto || (batteria < 15);
```

### 4. Espressioni di Assegnazione

Le espressioni di assegnazione assegnano un valore a una variabile.

```javascript
// Assegnazione semplice
let velocita = 50;

// Assegnazione con espressione
let velocitaAumentata = (velocita = velocita + 10);  // velocita diventa 60, velocitaAumentata è 60

// Assegnazioni concatenate
let a, b, c;
a = b = c = 0;  // Tutte le variabili vengono impostate a 0
```

### 5. Espressioni di Confronto

Le espressioni di confronto valutano la relazione tra due valori.

```javascript
// Confronti semplici
let distanza = 15;
let necessitaFrenare = distanza < 20;  // true

// Confronti concatenati (da evitare per chiarezza)
let inRangeOttimale = 10 < distanza && distanza < 30;  // true

// Confronti con valori di riferimento
const DISTANZA_MINIMA = 10;
const DISTANZA_OTTIMALE = 20;
let troppoVicino = distanza < DISTANZA_MINIMA;  // false
let distanzaOttimale = distanza >= DISTANZA_MINIMA && distanza <= DISTANZA_OTTIMALE;  // true
```

## Valutazione delle Espressioni

JavaScript valuta le espressioni seguendo regole specifiche, che è importante comprendere per scrivere codice prevedibile.

### Ordine di Valutazione (Precedenza degli Operatori)

Gli operatori hanno diverse priorità che determinano l'ordine di valutazione:

```javascript
// La moltiplicazione ha precedenza sull'addizione
let risultato = 2 + 3 * 4;  // 14, non 20

// Uso delle parentesi per controllare l'ordine
let risultato2 = (2 + 3) * 4;  // 20
```

### Tabella di Precedenza Semplificata

Dal più alto (valutato prima) al più basso (valutato dopo):

1. Parentesi `( )`
2. Incremento/decremento `++` `--`
3. Operatori aritmetici unari `+` `-` (es. `-x`)
4. Moltiplicazione/divisione/modulo `*` `/` `%`
5. Addizione/sottrazione `+` `-`
6. Confronto `<` `>` `<=` `>=`
7. Uguaglianza `==` `!=` `===` `!==`
8. AND logico `&&`
9. OR logico `||`
10. Condizionale (ternario) `?:`
11. Assegnazione `=` `+=` `-=` ecc.

### Associatività

L'associatività determina l'ordine di valutazione quando operatori con la stessa precedenza appaiono in sequenza:

```javascript
// Associatività da sinistra a destra (per la maggior parte degli operatori)
let a = 10 - 5 - 2;  // (10 - 5) - 2 = 3

// Associatività da destra a sinistra (per assegnazioni e operatore condizionale)
let x, y, z;
x = y = z = 5;  // x = (y = (z = 5))
```

## Valutazione Lazy (Cortocircuito) degli Operatori Logici

Gli operatori logici `&&` e `||` utilizzano la valutazione "lazy" (o di cortocircuito), il che significa che il secondo operando viene valutato solo se necessario:

```javascript
// OR logico (||): Se il primo operando è true, il secondo non viene valutato
let risultato1 = true || functionChePuoCausareErrori();  // functionChePuoCausareErrori() non viene chiamata

// AND logico (&&): Se il primo operando è false, il secondo non viene valutato
let risultato2 = false && functionChePuoCausareErrori();  // functionChePuoCausareErrori() non viene chiamata
```

Questo comportamento può essere sfruttato per creare controlli di guardia:

```javascript
// Verifica che l'oggetto esista prima di accedere a una sua proprietà
let configurazione = null;
let velocitaDefault = configurazione && configurazione.velocitaDefault || 50;
// Se configurazione è null, velocitaDefault sarà 50
```

## Utilizzo delle Espressioni nella Programmazione EV3

Le espressioni sono fondamentali per controllare il comportamento del robot EV3 in modo dinamico e reattivo.

### 1. Controllo del Movimento con Espressioni Aritmetiche

```javascript
// Calcolo della velocità in base alla distanza
let distanza = sensors.ultrasonic4.distance();
let velocitaBase = 60;
let fattoreDiDistanza = Math.min(distanza / 100, 1);  // 0-1 in base alla distanza (max 100cm)

// Più la distanza è grande, più veloce andrà il robot
let velocitaCalcolata = velocitaBase * fattoreDiDistanza;
motors.largeBC.tank(velocitaCalcolata, velocitaCalcolata);
```

### 2. Presa di Decisioni con Espressioni Logiche

```javascript
// Sistema di navigazione con decisioni complesse
let distanza = sensors.ultrasonic4.distance();
let sensoreDestro = sensors.touch1.isPressed();
let sensoreSinistro = sensors.touch3.isPressed();
let batteria = brick.battery();

// Decisione sulla direzione da prendere
let deviGirareDestra = sensoreSinistro || (distanza < 20 && !sensoreDestro);
let deviGirareSinistra = sensoreDestro || (distanza < 10);
let puoiProcedere = !deviGirareDestra && !deviGirareSinistra && batteria > 20;

// Applicazione della decisione
if (deviGirareDestra) {
    motors.largeBC.tank(50, -50);  // Gira a destra
} else if (deviGirareSinistra) {
    motors.largeBC.tank(-50, 50);  // Gira a sinistra
} else if (puoiProcedere) {
    motors.largeBC.tank(50, 50);   // Vai avanti
} else {
    motors.largeBC.stop();         // Ferma (probabilmente batteria scarica)
}
```

### 3. Calcolo Dinamico dei Parametri di Movimento

```javascript
// Sistema di controllo adattativo della velocità per seguiLinea
function seguiLinea() {
    // Lettura del sensore di colore (0-100, 0=nero, 100=bianco)
    let valore = sensors.color3.light();
    
    // Calcolo dell'errore rispetto alla linea ideale (valore target = 50)
    let errore = valore - 50;
    
    // Parametri del controllore
    let Kp = 0.8;  // Fattore proporzionale
    
    // Calcolo della correzione di velocità in base all'errore
    let correzione = errore * Kp;
    
    // Velocità di base
    let velocitaBase = 40;
    
    // Calcolo delle velocità per i motori con limitazione
    let velocitaSinistra = Math.max(0, Math.min(100, velocitaBase - correzione));
    let velocitaDestra = Math.max(0, Math.min(100, velocitaBase + correzione));
    
    // Applicazione delle velocità
    motors.largeBC.tank(velocitaSinistra, velocitaDestra);
}

// Esecuzione continua del controllore
forever(seguiLinea);
```

### 4. Messaggi Informativi Dinamici

```javascript
// Display informativo con aggiornamento continuo
function aggiornaDisplay() {
    let distanza = sensors.ultrasonic4.distance();
    let batteria = brick.battery();
    let runtime = control.millis() / 1000;  // Secondi di esecuzione
    
    // Costruzione di messaggi informativi dinamici
    brick.clearScreen();
    brick.showString(`Tempo: ${Math.floor(runtime)}s`, 1);
    brick.showString(`Distanza: ${distanza}cm`, 2);
    brick.showString(`Batteria: ${batteria}%`, 3);
    
    // Messaggio di stato basato su condizioni
    let stato = distanza < 10 ? "STOP" : 
                distanza < 30 ? "Rallenta" : 
                "Avanti";
    
    brick.showString(`Stato: ${stato}`, 4);
    
    // Avviso batteria
    if (batteria < 15) {
        brick.showString("!! BATTERIA SCARICA !!", 8);
    }
}

// Aggiorna il display ogni 500ms
loops.everyInterval(500, aggiornaDisplay);
```

## Errori Comuni e Best Practices

### 1. Effetti Collaterali nelle Espressioni

Gli effetti collaterali (modifiche allo stato) all'interno di espressioni possono rendere il codice difficile da comprendere:

```javascript
// Difficile da leggere e potenzialmente confuso
let x = 5;
let y = (x += 5) + x;  // x diventa 10, y è 20

// Più chiaro
let x = 5;
x += 5;
let y = x + x;  // x è 10, y è 20
```

### 2. Chiarezza vs Brevità

Mentre le espressioni complesse possono essere più concise, spesso è meglio privilegiare la chiarezza:

```javascript
// Espressione compatta ma difficile da interpretare
let azione = (dist < 10 || touch) ? ((batt > 20) ? "gira" : "stop") : "avanti";

// Più leggibile
let ostacoloRilevato = distanza < 10 || sensoreTocco.isPressed();
let batteriaOK = livelloBatteria > 20;

let azione;
if (ostacoloRilevato) {
    azione = batteriaOK ? "gira" : "stop";
} else {
    azione = "avanti";
}
```

### 3. Evitare Confronti Ambigui

```javascript
// Potenzialmente problematico (conversione di tipi implicita)
if (distanza == "20") {  // Funziona, ma non è il modo corretto
    // ...
}

// Corretto - confronto stretto
if (distanza === 20) {
    // ...
}
```

### 4. Parentesi per Chiarezza

Anche quando non strettamente necessarie, le parentesi possono rendere più chiaro l'intento:

```javascript
// Senza parentesi (funziona ma l'intento potrebbe non essere chiaro)
let decisioneComplessa = a && b || c && d;

// Con parentesi (più chiaro)
let decisioneComplessa = (a && b) || (c && d);
```

## Espressioni Avanzate

### 1. Uso di Map/Filter/Reduce per Array

```javascript
// Array di letture del sensore
let lettureDistanza = [45, 32, 67, 12, 56, 78, 23];

// Filtra solo le distanze inferiori a 30
let distanzeRavvicinate = lettureDistanza.filter(d => d < 30);  // [12, 23]

// Calcola la media delle distanze
let somma = lettureDistanza.reduce((acc, val) => acc + val, 0);
let media = somma / lettureDistanza.length;  // ~44.7

// Trasforma i valori in categorie
let categorie = lettureDistanza.map(d => {
    if (d < 20) return "vicino";
    if (d < 50) return "medio";
    return "lontano";
});  // ["medio", "medio", "lontano", "vicino", "lontano", "lontano", "medio"]
```

### 2. Espressioni di Destrutturazione

```javascript
// Oggetto con configurazione
let configRobot = {
    motori: {
        sinistro: "B",
        destro: "C"
    },
    velocita: 50,
    modalita: "esplorazione"
};

// Destrutturazione per estrarre valori specifici
let { velocita, modalita } = configRobot;
let { sinistro, destro } = configRobot.motori;

// Utilizzo delle variabili estratte
brick.showString(`Motore SX: ${sinistro}`, 1);
brick.showString(`Velocità: ${velocita}`, 2);
```

### 3. Spread Operator

```javascript
// Combinazione di array
let sequenza1 = [50, 70, 30];  // Sequenza di velocità
let sequenza2 = [20, 40];

// Nuova sequenza combinata
let sequenzaCompleta = [...sequenza1, ...sequenza2];  // [50, 70, 30, 20, 40]

// Copia e modifica di oggetti
let configBase = {
    velocita: 50,
    tempoRotazione: 1000
};

let configAvanzata = {
    ...configBase,
    velocita: 70,  // Sovrascrive il valore originale
    modalitaSicura: true  // Aggiunge nuova proprietà
};
```

## Esercizi Pratici

1. **Controllo Adattativo**: Crea un sistema che calcoli dinamicamente la velocità e la direzione del robot in base ai valori dei sensori, utilizzando espressioni aritmetiche e logiche.

2. **Dashboard Interattiva**: Implementa un sistema che visualizzi sul display EV3 informazioni sullo stato del robot, utilizzando espressioni per calcolare e formattare i dati.

3. **Sistema di Navigazione Autonomo**: Sviluppa un algoritmo che permetta al robot di navigare autonomamente evitando ostacoli, utilizzando espressioni complesse per prendere decisioni.

Ora che abbiamo completato lo studio delle variabili, dei tipi di dati, degli operatori e delle espressioni, possiedi le basi fondamentali per la programmazione JavaScript. Nel prossimo modulo, esploreremo le strutture di controllo e le condizioni che ti permetteranno di controllare il flusso del tuo programma.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Operatori](03-Operatori.md)
- [➡️ Strutture di Controllo e Condizioni](../03-StruttureControllo-Condizioni/README.md)