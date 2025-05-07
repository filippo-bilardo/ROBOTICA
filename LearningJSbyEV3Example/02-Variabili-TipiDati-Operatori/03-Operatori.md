# Operatori

Gli operatori sono simboli speciali che eseguono operazioni su variabili e valori. In questo capitolo, esploreremo i diversi tipi di operatori disponibili in JavaScript e come utilizzarli nella programmazione del robot EV3.

## Tipi di Operatori in JavaScript

JavaScript offre diversi tipi di operatori che possiamo classificare in base alla loro funzione:

1. Operatori aritmetici
2. Operatori di assegnazione
3. Operatori di confronto
4. Operatori logici
5. Operatori di stringa
6. Operatori bit a bit
7. Operatori condizionali (ternari)
8. Altri operatori speciali

## 1. Operatori Aritmetici

Gli operatori aritmetici eseguono operazioni matematiche su numeri.

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `+` | Addizione | `5 + 2` → `7` |
| `-` | Sottrazione | `5 - 2` → `3` |
| `*` | Moltiplicazione | `5 * 2` → `10` |
| `/` | Divisione | `5 / 2` → `2.5` |
| `%` | Modulo (resto della divisione) | `5 % 2` → `1` |
| `**` | Esponente | `5 ** 2` → `25` |
| `++` | Incremento | `let a = 5; a++;` → `a` diventa `6` |
| `--` | Decremento | `let a = 5; a--;` → `a` diventa `4` |

### Utilizzo nella Programmazione EV3:

```javascript
// Calcolo della velocità in base alla distanza
let distanza = sensors.ultrasonic4.distance();
let velocita = 50;

// Riduci la velocità se l'ostacolo è vicino
if (distanza < 20) {
    velocita = velocita / 2;  // Dimezza la velocità
}

// Calcolo del tempo di rotazione proporzionale all'angolo
let angoloDiRotazione = 90;  // gradi
let tempoRotazione = angoloDiRotazione * 10;  // millisecondi (approssimativo)

// Incremento progressivo della velocità
let velocitaAttuale = 0;
function accelera() {
    velocitaAttuale += 5;  // Incrementa di 5 unità
    if (velocitaAttuale > 100) {
        velocitaAttuale = 100;  // Non superare il 100%
    }
    return velocitaAttuale;
}
```

## 2. Operatori di Assegnazione

Gli operatori di assegnazione assegnano valori alle variabili.

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `=` | Assegnazione semplice | `x = 5` |
| `+=` | Addizione e assegnazione | `x += 3` è come `x = x + 3` |
| `-=` | Sottrazione e assegnazione | `x -= 3` è come `x = x - 3` |
| `*=` | Moltiplicazione e assegnazione | `x *= 3` è come `x = x * 3` |
| `/=` | Divisione e assegnazione | `x /= 3` è come `x = x / 3` |
| `%=` | Modulo e assegnazione | `x %= 3` è come `x = x % 3` |
| `**=` | Esponente e assegnazione | `x **= 3` è come `x = x ** 3` |

### Utilizzo nella Programmazione EV3:

```javascript
// Regolazione della velocità
let velocita = 50;

// Aumenta la velocità del 20%
velocita *= 1.2;  // velocita = velocita * 1.2

// Calibrazione della velocità dei motori
let velocitaSinistra = 50;
let velocitaDestra = 50;

// Compensa lievi differenze nei motori
velocitaSinistra += 2;  // Aggiusta il motore sinistro per bilanciare

// Riduzione progressiva della velocità
function rallenta() {
    velocita -= 5;  // Riduzione graduale
    if (velocita < 0) {
        velocita = 0;  // Non andare sotto lo zero
    }
    return velocita;
}
```

## 3. Operatori di Confronto

Gli operatori di confronto confrontano due valori e restituiscono un valore booleano (true o false).

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `==` | Uguale (valore) | `5 == "5"` → `true` |
| `===` | Strettamente uguale (valore e tipo) | `5 === "5"` → `false` |
| `!=` | Diverso (valore) | `5 != "6"` → `true` |
| `!==` | Strettamente diverso (valore o tipo) | `5 !== "5"` → `true` |
| `>` | Maggiore di | `5 > 3` → `true` |
| `<` | Minore di | `5 < 3` → `false` |
| `>=` | Maggiore o uguale a | `5 >= 5` → `true` |
| `<=` | Minore o uguale a | `5 <= 3` → `false` |

### Utilizzo nella Programmazione EV3:

```javascript
// Decisioni basate sulla distanza
let distanza = sensors.ultrasonic4.distance();

if (distanza < 10) {
    // Oggetto molto vicino
    motors.largeBC.stop();
} else if (distanza <= 30) {
    // Oggetto a media distanza, rallenta
    motors.largeBC.tank(30, 30);
} else {
    // Via libera, velocità normale
    motors.largeBC.tank(50, 50);
}

// Verifica precisa dello stato
let batteria = brick.battery();
let programmaAttivo = true;

if (batteria <= 10) {
    // Batteria quasi scarica
    programmaAttivo = false;
}

// Confronto di stringhe per controllo stato
let modalita = "esplorazione";
if (modalita === "esplorazione") {
    // Modalità esplorazione attiva
    // ...codice per esplorazione
}
```

> **Nota**: In JavaScript, è consigliabile utilizzare sempre `===` e `!==` (confronto stretto) anziché `==` e `!=` (confronto lasco) per evitare comportamenti inaspettati dovuti alla conversione automatica dei tipi.

## 4. Operatori Logici

Gli operatori logici combinano espressioni booleane.

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `&&` | AND logico | `x > 5 && x < 10` (true se entrambe sono vere) |
| `\|\|` | OR logico | `x < 5 \|\| x > 10` (true se almeno una è vera) |
| `!` | NOT logico | `!(x > 5)` (inverte il risultato) |

### Utilizzo nella Programmazione EV3:

```javascript
// Controlli di sicurezza multipli
let distanza = sensors.ultrasonic4.distance();
let sensoreToccoPremuto = sensors.touch1.isPressed();
let batteria = brick.battery();

// Ferma il robot se: ostacolo vicino OPPURE sensore di tocco premuto OPPURE batteria scarica
if (distanza < 10 || sensoreToccoPremuto || batteria < 15) {
    motors.largeBC.stop();
    brick.showString("Arresto di sicurezza", 1);
}

// Movimento solo se: distanza sufficiente E batteria ok
if (distanza > 20 && batteria > 20) {
    motors.largeBC.tank(50, 50);
}

// Inversione di una condizione
let percorsoOstruito = distanza < 15;
if (!percorsoOstruito) {
    // Percorso libero, procedi
    motors.largeBC.tank(50, 50);
}
```

## 5. Operatori di Stringa

JavaScript ha un operatore specifico per le stringhe.

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `+` | Concatenazione | `"Hello" + " " + "World"` → `"Hello World"` |

### Utilizzo nella Programmazione EV3:

```javascript
// Composizione di messaggi per il display
let distanza = sensors.ultrasonic4.distance();
let batteria = brick.battery();

// Visualizza informazioni sullo stato
brick.showString("Dist: " + distanza + " cm", 1);
brick.showString("Batt: " + batteria + "%", 2);

// Utilizzo dei template literal (alternativa moderna alla concatenazione)
brick.showString(`Dist: ${distanza} cm | Batt: ${batteria}%`, 3);
```

## 6. Operatore Condizionale (Ternario)

L'operatore condizionale è un modo compatto per scrivere un'istruzione if-else.

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `? :` | Condizionale | `condizione ? valoreSeVero : valoreSefalso` |

### Utilizzo nella Programmazione EV3:

```javascript
// Scelta velocità basata sulla distanza
let distanza = sensors.ultrasonic4.distance();
let velocita = distanza < 20 ? 30 : 50;

// Equivalente a:
// let velocita;
// if (distanza < 20) {
//     velocita = 30;
// } else {
//     velocita = 50;
// }

motors.largeBC.tank(velocita, velocita);

// Scelta del messaggio da visualizzare
let batteria = brick.battery();
let messaggioBatteria = batteria < 20 ? "BATTERIA SCARICA!" : "Batteria OK";
brick.showString(messaggioBatteria, 1);

// Operatori ternari annidati (usare con moderazione per mantenere leggibilità)
let stato = distanza < 10 ? "Pericolo" : (distanza < 30 ? "Attenzione" : "Via libera");
```

## 7. Operatore di Tipo (typeof)

L'operatore `typeof` restituisce una stringa che indica il tipo di dati di un valore.

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `typeof` | Restituisce il tipo di dato | `typeof 42` → `"number"` |

### Utilizzo nella Programmazione EV3:

```javascript
// Controllo tipo di input
function setVelocita(valore) {
    // Verifica che l'input sia un numero
    if (typeof valore !== "number") {
        brick.showString("Errore: velocità deve essere un numero", 1);
        return false;
    }
    
    // Limita il range a 0-100
    let velocitaValida = Math.max(0, Math.min(100, valore));
    motors.largeBC.tank(velocitaValida, velocitaValida);
    return true;
}
```

## 8. Precedenza degli Operatori

Gli operatori hanno diverse priorità che determinano l'ordine di valutazione in espressioni complesse. È buona pratica usare le parentesi per chiarire l'ordine intenzionale di valutazione.

```javascript
// Senza parentesi - la moltiplicazione ha precedenza sulla addizione
let risultato1 = 5 + 3 * 2;  // 11 (non 16)

// Con parentesi per chiarire l'intenzione
let risultato2 = (5 + 3) * 2;  // 16

// Espressione complessa con parentesi per chiarezza
let sensoreSinistro = sensors.touch1.isPressed();
let sensoreDestra = sensors.touch3.isPressed();
let distanza = sensors.ultrasonic4.distance();

let deviGirare = (sensoreSinistro || sensoreDestra) && (distanza < 20);
```

## Operazioni di Bit (Bit a Bit)

JavaScript supporta anche operatori bit a bit che operano a livello dei singoli bit di rappresentazione binaria dei numeri. Questi sono meno comuni nella programmazione EV3 base, ma possono essere utili in situazioni specifiche.

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `&` | AND bit a bit | `5 & 3` → `1` |
| `\|` | OR bit a bit | `5 \| 3` → `7` |
| `^` | XOR bit a bit | `5 ^ 3` → `6` |
| `~` | NOT bit a bit | `~5` → `-6` |
| `<<` | Shift sinistro | `5 << 1` → `10` |
| `>>` | Shift destro con segno | `5 >> 1` → `2` |
| `>>>` | Shift destro senza segno | `5 >>> 1` → `2` |

## Strategie di Utilizzo degli Operatori

### 1. Combinare Operatori per Decisioni Complesse

```javascript
// Robot segui-linea con sensore di colore
function aggiornaMovimento() {
    let luminosita = sensors.color3.light();
    let sensoreTabVFrontale = sensors.touch1.isPressed();
    let sensorePercussione = sensors.touch2.isPressed();
    
    // Fermati se uno dei sensori di sicurezza è attivato
    if (sensoreTabVFrontale || sensorePercussione) {
        motors.largeBC.stop();
        return;
    }
    
    // Regolazione della velocità di base in funzione della luminosità
    let velocitaBase = luminosita < 30 ? 40 : 60;
    
    // Calcolo della differenza di velocità per il bilanciamento
    let differenzaVelocita = Math.abs(50 - luminosita);
    
    // Aggiustamento delle velocità per seguire la linea
    if (luminosita < 50) {
        // Superficie scura, sterza a destra
        motors.largeBC.tank(velocitaBase + differenzaVelocita, velocitaBase - differenzaVelocita);
    } else {
        // Superficie chiara, sterza a sinistra
        motors.largeBC.tank(velocitaBase - differenzaVelocita, velocitaBase + differenzaVelocita);
    }
}
```

### 2. Utilizzare Operatori di Assegnazione per Codice Più Conciso

```javascript
// Sistema di calibrazione interattivo
let velocitaSinistra = 50;
let velocitaDestra = 50;

// Funzioni di calibrazione
function aumentaVelocitaSinistra() {
    velocitaSinistra += 1;
    aggiornaDisplay();
}

function diminuisciVelocitaDestra() {
    velocitaDestra -= 1;
    aggiornaDisplay();
}

function bilanciaTutto() {
    // Imposta entrambe le velocità alla media
    let media = (velocitaSinistra + velocitaDestra) / 2;
    velocitaSinistra = velocitaDestra = media;
    aggiornaDisplay();
}

function aggiornaDisplay() {
    brick.clearScreen();
    brick.showString(`Vel SX: ${velocitaSinistra}`, 1);
    brick.showString(`Vel DX: ${velocitaDestra}`, 2);
    brick.showString(`Diff: ${velocitaSinistra - velocitaDestra}`, 3);
}
```

### 3. Chiarezza vs Concisione

```javascript
// Versione più concisa
let fermarsi = dist < 10 || touch || batt < 15;
if (fermarsi) motors.largeBC.stop();

// Versione più chiara e leggibile
let ostacoloVicino = distanza < 10;
let sensoreUrtoAttivato = sensoreTocco.isPressed();
let batteriaScarica = livelloBatteria < 15;

let necessitaArresto = ostacoloVicino || sensoreUrtoAttivato || batteriaScarica;

if (necessitaArresto) {
    motors.largeBC.stop();
    brick.showString("Arresto di sicurezza", 1);
}
```

## Esercizi Pratici

1. **Controllo Dinamico della Velocità**: Crea un programma che regoli automaticamente la velocità del robot in base alla distanza dagli ostacoli, utilizzando operatori aritmetici e di confronto.

2. **Sistema di Navigazione con Condizioni Multiple**: Implementa un sistema che permetta al robot di navigare in un ambiente con decisioni basate su molteplici sensori (utilizzando operatori logici).

3. **Calibrazione Interattiva**: Crea un'interfaccia utente sul display EV3 che consenta di regolare parametri di movimento utilizzando vari operatori di assegnazione.

Nel prossimo capitolo, esploreremo le espressioni e valutazioni in JavaScript, comprendendo come combinare operatori in espressioni complesse che controllano il flusso del programma.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Tipi di Dati](02-TipiDati.md)
- [➡️ Espressioni e Valutazioni](04-Espressioni.md)