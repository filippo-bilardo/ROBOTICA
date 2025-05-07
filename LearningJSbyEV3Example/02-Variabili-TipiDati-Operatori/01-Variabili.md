# Variabili in JavaScript

Le variabili sono uno dei concetti fondamentali in qualsiasi linguaggio di programmazione, incluso JavaScript. In questo capitolo, esploreremo cosa sono le variabili, come dichiararle e utilizzarle nei nostri programmi per EV3, e perché sono così importanti per la programmazione di robot.

## Cosa sono le Variabili?

Una variabile è essenzialmente un contenitore con un nome, utilizzato per memorizzare dati che possono cambiare durante l'esecuzione del programma. Pensa ad una variabile come ad una scatola etichettata: l'etichetta è il nome della variabile, e il contenuto della scatola è il valore memorizzato.

## Dichiarazione di Variabili in JavaScript

In JavaScript moderno, ci sono tre modi principali per dichiarare variabili:

### 1. `let` - La Dichiarazione Consigliata

```javascript
let velocita = 50;
let nomeRobot = "EV3Explorer";
let sensoreAttivo = true;
```

- `let` è la dichiarazione più comunemente utilizzata per le variabili che possono cambiare valore
- Le variabili dichiarate con `let` hanno un ambito di blocco (block scope)
- Puoi modificare il valore di queste variabili durante l'esecuzione del programma

### 2. `const` - Per Valori Costanti

```javascript
const VELOCITA_MASSIMA = 100;
const NOME_PROGRAMMA = "NavigazioneAutonoma";
const PORTE_MOTORI = {sinistro: "B", destro: "C"};
```

- `const` viene utilizzato per valori che non cambieranno durante l'esecuzione
- Come `let`, ha un ambito di blocco
- Una volta assegnato un valore, non può essere cambiato (è una costante)
- Per convenzione, le costanti vengono spesso scritte in MAIUSCOLO

### 3. `var` - La Dichiarazione Tradizionale

```javascript
var contatore = 0;
var statoSensore = "inattivo";
```

- `var` è la dichiarazione più vecchia in JavaScript
- Ha un ambito di funzione (function scope) anziché di blocco
- Generalmente, si preferisce utilizzare `let` e `const` nei programmi moderni
- MakeCode supporta `var`, ma è consigliabile usare `let` e `const`

## Assegnazione e Riassegnazione

Dopo aver dichiarato una variabile, puoi assegnarle un valore:

```javascript
let velocita; // Dichiarazione
velocita = 50; // Assegnazione

// Oppure in un'unica istruzione:
let direzione = "avanti";

// Riassegnazione (cambiare il valore):
velocita = 75;
direzione = "destra";
```

Nota che le costanti non possono essere riassegnate:

```javascript
const LIMITE_VELOCITA = 100;
LIMITE_VELOCITA = 120; // Errore! Non puoi riassegnare una costante
```

## Ambito delle Variabili (Scope)

L'ambito (scope) di una variabile definisce dove quella variabile è accessibile nel codice:

### Ambito di Blocco (Block Scope)

```javascript
if (sensore.isPressed()) {
    let stato = "premuto";
    // 'stato' è accessibile solo all'interno di questo blocco
}
// 'stato' non è accessibile qui fuori
```

### Ambito di Funzione (Function Scope)

```javascript
function controllaVelocita() {
    var velocitaAttuale = motors.largeB.speed();
    // 'velocitaAttuale' è accessibile all'interno di questa funzione
}
// 'velocitaAttuale' non è accessibile qui fuori
```

### Ambito Globale (Global Scope)

```javascript
// Variabile globale (dichiarata fuori da qualsiasi funzione o blocco)
let statoRobot = "attivo";

function aggiornaPosizione() {
    // 'statoRobot' è accessibile qui dentro
    statoRobot = "in movimento";
}

// 'statoRobot' è accessibile anche qui
```

## Convenzioni di Nomenclatura

Scegliere nomi significativi per le variabili rende il codice più leggibile:

- Usa nomi descrittivi: `velocitaMotoreSinistro` è migliore di `v1`
- Utilizza il camelCase: `valoreSensore`, `tempoTotale`
- Evita nomi molto brevi o ambigui
- Per le costanti usa MAIUSCOLO con underscore: `VELOCITA_MASSIMA`

## Utilizzo delle Variabili con EV3

Le variabili sono fondamentali nella programmazione dei robot EV3, poiché permettono di:

### 1. Memorizzare Configurazioni

```javascript
// Configurazione centralizzata
let portaMotoreSinistro = "B";
let portaMotoreDestro = "C";
let portaSensoreTocco = 1;

// Ora puoi usare queste variabili nel tuo codice
motors.large(portaMotoreSinistro).run(50);
let statoSensore = sensors.touch(portaSensoreTocco).isPressed();
```

### 2. Memorizzare Stati

```javascript
let direzioneAttuale = "avanti";
let velocitaAttuale = 50;

function cambiaMovimento(nuovaDirezione, nuovaVelocita) {
    direzioneAttuale = nuovaDirezione;
    velocitaAttuale = nuovaVelocita;
    
    // Aggiorna il movimento del robot in base alle nuove variabili
    if (direzioneAttuale === "avanti") {
        motors.largeBC.tank(velocitaAttuale, velocitaAttuale);
    } else if (direzioneAttuale === "destra") {
        motors.largeBC.tank(velocitaAttuale, -velocitaAttuale);
    }
    // ...e così via
}
```

### 3. Memorizzare Letture dei Sensori

```javascript
// Leggi il valore del sensore e memorizzalo in una variabile
let distanza = sensors.ultrasonic4.distance();

// Usa il valore per decidere come muovere il robot
if (distanza < 10) {
    // Oggetto vicino, fermati e gira
    motors.largeBC.stop();
} else {
    // Via libera, procedi avanti
    motors.largeBC.tank(50, 50);
}
```

### 4. Calibrazione del Robot

```javascript
// Variabili di calibrazione che puoi regolare facilmente
let velocitaBase = 50;
let correzioneSinistra = 2; // Compensazione per differenze nei motori

// Utilizzo delle variabili di calibrazione
motors.largeBC.tank(velocitaBase + correzioneSinistra, velocitaBase);
```

## Errori Comuni con le Variabili

### 1. Utilizzare una Variabile Prima di Dichiararla

```javascript
// Errore: 'velocita' non è definita
motors.largeB.run(velocita);

// Corretto:
let velocita = 50;
motors.largeB.run(velocita);
```

### 2. Ridichiarare una Variabile con `let`

```javascript
let contatore = 0;
// ...
let contatore = 1; // Errore: 'contatore' è già stato dichiarato

// Corretto:
let contatore = 0;
// ...
contatore = 1; // Riassegnazione senza 'let'
```

### 3. Modificare una Costante

```javascript
const VELOCITA = 50;
VELOCITA = 60; // Errore: non puoi modificare una costante

// Corretto: se hai bisogno di cambiare il valore, usa 'let'
let velocita = 50;
velocita = 60; // OK
```

## Esercizi Pratici

1. **Controllo Parametrizzato**: Crea un programma che utilizzi variabili per controllare velocità, direzione e durata dei movimenti del robot.

2. **Dashboard di Stato**: Crea un programma che mostri costantemente sul display EV3 i valori correnti delle variabili principali (velocità, stato, letture sensori).

3. **Sistema di Calibrazione**: Implementa un programma che utilizzi i pulsanti dell'EV3 per aumentare/diminuire variabili di calibrazione e vedere immediatamente l'effetto sul movimento del robot.

Nel prossimo capitolo, esploreremo i diversi tipi di dati in JavaScript e come utilizzarli efficacemente nei nostri programmi per EV3.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [📝 Variabili, Tipi di Dati e Operatori](README.md)
- [➡️ Tipi di Dati](02-TipiDati.md)