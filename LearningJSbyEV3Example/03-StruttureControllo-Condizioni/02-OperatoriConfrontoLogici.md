# Operatori di Confronto e Logici

Gli operatori di confronto e logici sono essenziali per creare condizioni significative nelle istruzioni condizionali. Questi operatori ci permettono di confrontare valori e combinare condizioni per prendere decisioni complesse nel codice.

## Operatori di Confronto

Gli operatori di confronto confrontano due valori e restituiscono un valore booleano (`true` o `false`).

| Operatore | Nome | Esempio | Risultato |
|-----------|------|---------|-----------|
| `==` | Uguale a (confronto semplice) | `5 == "5"` | `true` (confronta solo il valore) |
| `===` | Strettamente uguale a | `5 === "5"` | `false` (confronta valore e tipo) |
| `!=` | Diverso da (confronto semplice) | `5 != "6"` | `true` |
| `!==` | Strettamente diverso da | `5 !== "5"` | `true` |
| `>` | Maggiore di | `10 > 5` | `true` |
| `<` | Minore di | `10 < 5` | `false` |
| `>=` | Maggiore o uguale a | `10 >= 10` | `true` |
| `<=` | Minore o uguale a | `5 <= 10` | `true` |

### Esempi con EV3

```javascript
// Controllo se la distanza è inferiore a 20 cm
if (sensoreUltrasuoni.distance() < 20) {
    // Esegue questo codice se la distanza è minore di 20 cm
    motors.largeBC.stop();
}

// Controllo se il sensore di colore rileva esattamente il rosso
if (sensoreColore.color() === Color.Red) {
    // Esegue questo codice solo se il colore è esattamente rosso
    brick.showString("Rilevato colore rosso!", 1);
}

// Controllo se la velocità è nella gamma sicura
let velocitaAttuale = 75;
if (velocitaAttuale >= 30 && velocitaAttuale <= 80) {
    // Esegue questo codice se la velocità è tra 30 e 80 inclusi
    brick.showString("Velocità nella gamma sicura", 1);
}
```

## Operatori Logici

Gli operatori logici consentono di combinare più condizioni.

| Operatore | Nome | Descrizione |
|-----------|------|-------------|
| `&&` | AND logico | Restituisce `true` se entrambe le condizioni sono vere |
| `\|\|` | OR logico | Restituisce `true` se almeno una delle condizioni è vera |
| `!` | NOT logico | Inverte il valore della condizione |

### Tabelle di Verità

#### AND (`&&`)
| Condizione A | Condizione B | A && B |
|--------------|--------------|--------|
| `true` | `true` | `true` |
| `true` | `false` | `false` |
| `false` | `true` | `false` |
| `false` | `false` | `false` |

#### OR (`||`)
| Condizione A | Condizione B | A \|\| B |
|--------------|--------------|--------|
| `true` | `true` | `true` |
| `true` | `false` | `true` |
| `false` | `true` | `true` |
| `false` | `false` | `false` |

#### NOT (`!`)
| Condizione A | !A |
|--------------|-----|
| `true` | `false` |
| `false` | `true` |

### Esempi con EV3

```javascript
// Usando AND (&&) - Il robot si ferma se rileva un ostacolo vicino E il sensore di tocco è premuto
if (sensoreUltrasuoni.distance() < 15 && sensoreTouch.isPressed()) {
    motors.largeBC.stop();
    brick.showString("Ostacolo rilevato e tocco!", 1);
}

// Usando OR (||) - Il robot suona un allarme se rileva un ostacolo OPPURE se il sensore di tocco è premuto
if (sensoreUltrasuoni.distance() < 10 || sensoreTouch.isPressed()) {
    music.playSoundEffect(SoundEffect.Alarm);
}

// Usando NOT (!) - Il robot avanza solo se NON ci sono ostacoli vicini
if (!(sensoreUltrasuoni.distance() < 20)) {
    // Equivalente a: if (sensoreUltrasuoni.distance() >= 20)
    motors.largeBC.tank(50, 50);
}
```

## Combinazione di Operatori e Precedenza

È possibile combinare più operatori in un'unica espressione. La precedenza degli operatori determina l'ordine di valutazione:

1. **Operatori di confronto** (`<`, `>`, `<=`, `>=`, `==`, `===`, `!=`, `!==`)
2. **NOT logico** (`!`)
3. **AND logico** (`&&`)
4. **OR logico** (`||`)

Per controllare esplicitamente l'ordine di valutazione, è consigliabile utilizzare le parentesi.

### Esempi con EV3

```javascript
// Robot che segue una linea nera con comportamenti specifici
if ((sensoreColore.color() === Color.Black || sensoreColore.color() === Color.Blue) && 
    !(sensoreTouch.isPressed())) {
    // Esegue questo codice se rileva colore nero o blu E il sensore di tocco NON è premuto
    motors.largeBC.tank(50, 50);
} else if (sensoreColore.color() === Color.Red || sensoreUltrasuoni.distance() < 10) {
    // Esegue questo codice se rileva colore rosso OPPURE un ostacolo a meno di 10 cm
    motors.largeBC.stop();
}
```

## Cortocircuito degli Operatori Logici

JavaScript utilizza la valutazione in cortocircuito (short-circuit evaluation) per gli operatori logici:

- **AND (`&&`)**: Se la prima condizione è `false`, la seconda non viene valutata perché il risultato sarà comunque `false`.
- **OR (`||`)**: Se la prima condizione è `true`, la seconda non viene valutata perché il risultato sarà comunque `true`.

Questo può essere utile per ottimizzare le prestazioni o per controllare condizioni in un certo ordine.

```javascript
// Esempio di cortocircuito con AND
// La seconda condizione (che potrebbe essere costosa da calcolare) viene valutata solo se la prima è vera
if (sensoreTouch.isPressed() && eseguiCalcoloComplesso()) {
    // Codice da eseguire
}

// Esempio di cortocircuito con OR
// La seconda condizione viene valutata solo se la prima è falsa
if (velocitaPreimpostata || calcolaVelocitaOttimale()) {
    // Codice da eseguire
}
```

## Operatori di Confronto e Valori Booleani in JavaScript

È importante ricordare che in JavaScript:

- I valori booleani sono `true` e `false`
- Gli operatori di confronto restituiscono sempre un valore booleano
- Le condizioni nelle istruzioni condizionali vengono convertite in valori booleani

```javascript
// Esempio di conversione implicita in valori booleani
let velocita = 50;
if (velocita) {  // velocita è diversa da 0, quindi viene convertita in true
    // Questo codice viene eseguito
}

let fermoInattivo = 0;
if (!fermoInattivo) {  // fermoInattivo è 0, che diventa false, e !false è true
    // Questo codice viene eseguito
}
```

## Conclusione

Gli operatori di confronto e logici sono strumenti essenziali per creare condizioni complesse nei tuoi programmi per robot EV3. Utilizzandoli correttamente, puoi creare comportamenti sofisticati che rispondono a molteplici condizioni ambientali in modo intelligente.

Ricorda sempre di testare accuratamente le tue condizioni e di considerare tutte le possibili combinazioni di input per garantire che il tuo robot si comporti come previsto in ogni situazione.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Istruzioni Condizionali: if, else if, else](01-IstruzioniCondizionali.md)
- [➡️ Switch Statement](03-SwitchStatement.md)