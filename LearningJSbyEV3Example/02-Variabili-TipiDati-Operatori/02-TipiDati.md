# Tipi di Dati

In JavaScript, comprendere i diversi tipi di dati è fondamentale per scrivere programmi efficaci. Questo capitolo esplorerà i vari tipi di dati disponibili in JavaScript e come utilizzarli nella programmazione del robot EV3.

## I Tipi di Dati Principali in JavaScript

JavaScript ha otto tipi di dati fondamentali, suddivisi in due categorie:

### Tipi Primitivi:
1. Number (numeri)
2. String (stringhe di testo)
3. Boolean (vero/falso)
4. Undefined (valore non definito)
5. Null (valore nullo intenzionale)
6. Symbol (simbolo univoco)
7. BigInt (numeri interi molto grandi)

### Tipi di Riferimento:
8. Object (oggetti, array, funzioni, date, ecc.)

Nell'ambito della programmazione EV3 con MakeCode, ci concentreremo principalmente su Number, String, Boolean e Object (inclusi gli Array).

## 1. Number (Numeri)

In JavaScript, tutti i numeri sono rappresentati come valori a virgola mobile (anche se appaiono come interi).

### Esempi di Numeri:

```javascript
let velocita = 50;          // Intero
let potenza = 0.75;         // Decimale
let distanzaMax = 100.5;    // Decimale
let tempoAttesa = 2000;     // Intero (millisecondi)
```

### Operazioni con i Numeri:

```javascript
let velocitaBase = 50;
let fattoreAccelerazione = 1.5;
let velocitaFinale = velocitaBase * fattoreAccelerazione;  // 75

// Potenze e radici
let area = Math.pow(10, 2);  // 10^2 = 100
let distanza = Math.sqrt(25);  // √25 = 5

// Arrotondamenti
let sensorValue = 23.7;
let valueRounded = Math.round(sensorValue);  // 24
let valueFloor = Math.floor(sensorValue);    // 23 (arrotondamento per difetto)
let valueCeil = Math.ceil(sensorValue);      // 24 (arrotondamento per eccesso)
```

### Numeri Speciali:

```javascript
let infinito = Infinity;           // Rappresenta l'infinito
let negativoInfinito = -Infinity;  // Infinito negativo
let nonNumero = NaN;               // Not a Number (risultato di operazioni non valide)
```

### Utilizzo nella Programmazione EV3:

```javascript
// Controllo della velocità dei motori
let velocitaNormale = 50;
let velocitaRapida = 80;
let velocitaLenta = 30;

// Scelta della velocità in base alla situazione
motors.largeBC.tank(velocitaNormale, velocitaNormale);

// Calcoli per conversioni
let gradi = 90;
let millisecondi = gradi * 10;  // Tempo approssimativo per ruotare di 90 gradi
```

## 2. String (Stringhe)

Le stringhe sono sequenze di caratteri utilizzate per rappresentare testo.

### Creazione di Stringhe:

```javascript
let messaggio = "Hello EV3!";
let comando = 'ruota';
let istruzioni = `Premi il pulsante centrale per iniziare`; // Template literal
```

### Operazioni con le Stringhe:

```javascript
// Concatenazione (unione di stringhe)
let nomeRobot = "EV3";
let saluto = "Ciao, sono " + nomeRobot + "!";  // "Ciao, sono EV3!"

// Template literals (più leggibile per stringhe complesse)
let stato = "attivo";
let batteria = 87;
let infoRobot = `Robot: ${nomeRobot}, Stato: ${stato}, Batteria: ${batteria}%`;

// Lunghezza di una stringa
let lunghezzaMessaggio = messaggio.length;  // 10 per "Hello EV3!"

// Estrazione di parti di una stringa
let primaParola = messaggio.substring(0, 5);  // "Hello"
```

### Utilizzo nella Programmazione EV3:

```javascript
// Visualizzazione di messaggi sul display
brick.showString("Avvio programma...", 1);

// Uso di stringhe per stati del robot
let statoRobot = "in attesa";
if (statoRobot === "in attesa") {
    brick.showString("Robot in attesa di comandi", 2);
}

// Costruzione di messaggi informativi
let distanza = sensors.ultrasonic4.distance();
brick.showString(`Distanza: ${distanza} cm`, 3);
```

## 3. Boolean (Booleani)

I valori booleani rappresentano uno stato binario: vero o falso.

### Creazione di Booleani:

```javascript
let robotAttivo = true;
let ostacolomRilevato = false;
```

### Operazioni con i Booleani:

```javascript
// Inversione (NOT logico)
let sensoreNonPremuto = !sensors.touch1.isPressed();

// Combinazione con AND logico (&&)
let condizioniSicurezza = distanzaSufficiente && batteriaCarica;

// Combinazione con OR logico (||)
let necessitaStop = ostacoloRilevato || batteriaInsufficiente;
```

### Utilizzo nella Programmazione EV3:

```javascript
// Controllo del movimento basato su condizioni booleane
let percorsoLibero = sensors.ultrasonic4.distance() > 20;

if (percorsoLibero) {
    motors.largeBC.tank(50, 50);  // Avanti
} else {
    motors.largeBC.stop();        // Ferma
}

// Utilizzo in cicli
let programmaAttivo = true;

while (programmaAttivo) {
    // Esegui azioni...
    
    // Condizione di uscita
    if (sensors.touch1.isPressed()) {
        programmaAttivo = false;  // Termina il ciclo
    }
}
```

## 4. Undefined e Null

Questi tipi rappresentano l'assenza di un valore, ma in modi diversi.

### Undefined:

```javascript
let sensore;  // Variabile dichiarata ma non inizializzata, valore: undefined

// Verifica se una variabile è undefined
if (sensore === undefined) {
    sensore = sensors.touch1;  // Inizializzazione
}
```

### Null:

```javascript
let connessione = null;  // Esplicitamente impostata a null (nessun valore intenzionalmente)

// Verifica se una variabile è null
if (connessione === null) {
    // Tentativo di stabilire una connessione
    connessione = brick.establishConnection();
}
```

## 5. Object (Oggetti)

Gli oggetti sono collezioni di coppie chiave-valore che permettono di organizzare dati correlati.

### Creazione di Oggetti:

```javascript
let robot = {
    nome: "Explorer",
    motoriPrincipali: "B e C",
    velocita: 50,
    attivo: true
};
```

### Accesso alle Proprietà degli Oggetti:

```javascript
let nomeRobot = robot.nome;        // "Explorer"
let motori = robot["motoriPrincipali"];  // "B e C"

// Modifica delle proprietà
robot.velocita = 75;
robot["attivo"] = false;
```

### Oggetti Annidati:

```javascript
let missioneRobot = {
    id: "M001",
    robot: {
        nome: "Scout",
        configurazione: {
            motori: {
                sinistro: "B",
                destro: "C"
            },
            sensori: {
                tocco: 1,
                ultrasuoni: 4
            }
        }
    },
    durata: 120
};

// Accesso a proprietà annidate
let motoreSinistro = missioneRobot.robot.configurazione.motori.sinistro;  // "B"
```

### Utilizzo nella Programmazione EV3:

```javascript
// Configurazione centralizzata
let config = {
    motori: {
        sinistro: "B",
        destro: "C",
        braccio: "A"
    },
    velocita: {
        normale: 50,
        veloce: 80,
        lenta: 30
    },
    limiti: {
        distanzaMinima: 10,
        batteriaBassa: 20
    }
};

// Utilizzo della configurazione
motors.large(config.motori.sinistro).run(config.velocita.normale);

// Oggetto per memorizzare lo stato del robot
let statoRobot = {
    inMovimento: false,
    direzione: "fermo",
    velocitaAttuale: 0,
    distanzaPercorsa: 0
};

// Aggiornamento dello stato
function avanti() {
    statoRobot.inMovimento = true;
    statoRobot.direzione = "avanti";
    statoRobot.velocitaAttuale = config.velocita.normale;
    motors.largeBC.tank(config.velocita.normale, config.velocita.normale);
}
```

## 6. Array

Gli array sono oggetti speciali utilizzati per memorizzare collezioni ordinate di valori.

### Creazione di Array:

```javascript
let velocita = [30, 50, 70];  // Array di numeri
let direzioni = ["avanti", "indietro", "sinistra", "destra"];  // Array di stringhe
let misto = [10, "ciao", true, {nome: "EV3"}];  // Array con tipi diversi
```

### Accesso agli Elementi di un Array:

```javascript
let primaVelocita = velocita[0];  // 30 (gli indici partono da 0)
let ultimaDirezione = direzioni[3];  // "destra"

// Modifica di elementi
velocita[1] = 55;  // L'array diventa [30, 55, 70]
```

### Metodi Comuni degli Array:

```javascript
// Aggiunta di elementi
direzioni.push("rotazione");  // Aggiunge alla fine: ["avanti", "indietro", "sinistra", "destra", "rotazione"]

// Rimozione di elementi
let ultimaDirezioneRimossa = direzioni.pop();  // Rimuove e restituisce "rotazione"

// Lunghezza dell'array
let numeroVelocita = velocita.length;  // 3

// Iterazione su un array
for (let i = 0; i < direzioni.length; i++) {
    brick.showString(`Direzione ${i+1}: ${direzioni[i]}`, i+1);
}

// Metodo forEach
velocita.forEach(function(vel, indice) {
    brick.showString(`Velocità ${indice+1}: ${vel}`, indice+1);
});
```

### Utilizzo nella Programmazione EV3:

```javascript
// Sequenza di movimenti predefinita
let sequenzaMovimenti = [
    {direzione: "avanti", velocita: 50, durata: 2000},
    {direzione: "sinistra", velocita: 40, durata: 1000},
    {direzione: "avanti", velocita: 60, durata: 3000},
    {direzione: "destra", velocita: 40, durata: 1000}
];

// Esecuzione della sequenza
for (let i = 0; i < sequenzaMovimenti.length; i++) {
    let movimento = sequenzaMovimenti[i];
    
    brick.showString(`Movimento: ${movimento.direzione}`, 1);
    
    if (movimento.direzione === "avanti") {
        motors.largeBC.tank(movimento.velocita, movimento.velocita);
    } else if (movimento.direzione === "sinistra") {
        motors.largeBC.tank(-movimento.velocita, movimento.velocita);
    } else if (movimento.direzione === "destra") {
        motors.largeBC.tank(movimento.velocita, -movimento.velocita);
    }
    
    pause(movimento.durata);
    motors.largeBC.stop();
}
```

## Conversione tra Tipi di Dati

In JavaScript, a volte è necessario convertire i dati da un tipo all'altro.

### Da Stringa a Numero:

```javascript
let velocitaTesto = "50";
let velocitaNumero = Number(velocitaTesto);  // 50 come numero
// oppure
let velocitaNumero2 = parseInt(velocitaTesto, 10);  // 50 come intero
let velocitaDecimale = parseFloat("50.5");  // 50.5 come decimale
```

### Da Numero a Stringa:

```javascript
let distanza = 42;
let distanzaTesto = String(distanza);  // "42"
// oppure
let distanzaTesto2 = distanza.toString();  // "42"
```

### Altri Esempi di Conversione:

```javascript
// Booleano a String
let attivo = true;
let attivoTesto = String(attivo);  // "true"

// Vari tipi a Booleano
let booleano1 = Boolean(1);       // true
let booleano2 = Boolean(0);       // false
let booleano3 = Boolean("");      // false
let booleano4 = Boolean("ciao");  // true
```

## Verifica del Tipo di Dati

Per verificare il tipo di un valore, puoi utilizzare l'operatore `typeof`:

```javascript
let tipo1 = typeof 42;          // "number"
let tipo2 = typeof "ciao";      // "string"
let tipo3 = typeof true;        // "boolean"
let tipo4 = typeof undefined;   // "undefined"
let tipo5 = typeof null;        // "object" (questo è considerato un bug storico di JavaScript)
let tipo6 = typeof {};          // "object"
let tipo7 = typeof [];          // "object" (gli array sono un tipo di oggetto)
let tipo8 = typeof function(){}; // "function"
```

## Esercizi Pratici

1. **Registro Dati Sensori**: Crea un programma che registri i valori di un sensore in un array e poi calcoli statistiche come media, minimo e massimo.

2. **Configurazione Robot**: Crea un oggetto di configurazione complesso per il tuo robot, incluse impostazioni per motori, sensori, velocità e comportamenti.

3. **Conversione di Unità**: Implementa funzioni che convertano valori tra diverse unità (ad esempio, da gradi a millisecondi di rotazione, da centimetri a tempo di percorrenza).

Nel prossimo capitolo, esploreremo gli operatori in JavaScript e come utilizzarli per manipolare dati e creare espressioni complesse per controllare il comportamento del robot EV3.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Variabili in JavaScript](01-Variabili.md)
- [➡️ Operatori](03-Operatori.md)