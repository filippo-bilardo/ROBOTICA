# Espressioni Condizionali (Operatore Ternario)

L'operatore condizionale (ternario) è un operatore che fornisce un modo conciso per scrivere semplici istruzioni condizionali. È l'unico operatore JavaScript che richiede tre operandi, da cui il nome "ternario".

## Sintassi

```javascript
condizione ? espressione1 : espressione2
```

Dove:
- `condizione` è l'espressione che viene valutata come `true` o `false`
- `espressione1` è il valore restituito se la condizione è `true`
- `espressione2` è il valore restituito se la condizione è `false`

## Funzionamento

L'operatore ternario valuta una condizione e, in base al risultato, restituisce uno dei due valori specificati:
- Se la condizione è vera, restituisce il primo valore (`espressione1`)
- Se la condizione è falsa, restituisce il secondo valore (`espressione2`)

## Confronto con If-Else

L'operatore ternario è essenzialmente una forma abbreviata di un'istruzione `if-else`. Confrontiamo i due approcci:

### Utilizzo di if-else:

```javascript
let messaggio;
if (distanza < 20) {
    messaggio = "Pericolo: ostacolo vicino";
} else {
    messaggio = "Percorso libero";
}
```

### Utilizzo dell'operatore ternario:

```javascript
let messaggio = distanza < 20 ? "Pericolo: ostacolo vicino" : "Percorso libero";
```

Come puoi vedere, l'operatore ternario permette di scrivere la stessa logica in modo più conciso.

## Esempi con EV3

### Esempio 1: Determinare la direzione di movimento

```javascript
// Scelta della direzione in base al sensore di colore
let direzione = sensoreColore.color() === Color.Black ? "dritto" : "curva";
brick.showString(`Direzione: ${direzione}`, 3);
```

### Esempio 2: Impostare la velocità in base alla distanza

```javascript
// Imposta la velocità in base alla distanza dagli ostacoli
let velocita = sensoreUltrasuoni.distance() < 30 ? 30 : 70;
motors.largeBC.tank(velocita, velocita);
```

### Esempio 3: Selezionare un suono in base al sensore di tocco

```javascript
// Riproduce un suono diverso in base allo stato del sensore
music.playSoundEffect(sensoreTocco.isPressed() ? SoundEffect.Wow : SoundEffect.Okay);
```

## Utilizzo nell'Inizializzazione di Variabili

L'operatore ternario è particolarmente utile per inizializzare variabili con valori che dipendono da una condizione:

```javascript
// Imposta la modalità in base al livello della batteria
let modalitaRisparmioEnergia = brick.batteryLevel() < 50 ? true : false;

// Imposta la porta del sensore in base alla disponibilità
let portaSensoreUltrasuoni = sensoreDisponibile ? 4 : 1;
```

## Operatori Ternari Concatenati

È possibile concatenare più operatori ternari, ma questo può ridurre la leggibilità del codice:

```javascript
// Determinare il comportamento in base al colore
let azione = sensoreColore.color() === Color.Red ? "stop" :
             sensoreColore.color() === Color.Green ? "accelera" :
             sensoreColore.color() === Color.Blue ? "gira" :
             "procedi normalmente";
```

In questi casi, può essere più leggibile utilizzare un'istruzione `switch` o `if-else`:

```javascript
let azione;
switch (sensoreColore.color()) {
    case Color.Red:
        azione = "stop";
        break;
    case Color.Green:
        azione = "accelera";
        break;
    case Color.Blue:
        azione = "gira";
        break;
    default:
        azione = "procedi normalmente";
}
```

## Utilizzo nei Template Literals

L'operatore ternario è particolarmente utile nei template literals per mostrare messaggi condizionali:

```javascript
// Mostra messaggi diversi in base alla condizione
brick.showString(`Stato: ${sensoreUltrasuoni.distance() < 20 ? "Ostacolo rilevato!" : "Percorso libero"}`, 4);
```

## Utilizzo nelle Espressioni JSX (per interfacce grafiche)

In ambienti che supportano JSX per le interfacce grafiche, l'operatore ternario è molto utilizzato per renderizzare elementi condizionalmente:

```javascript
// Esempio di utilizzo in un ipotetico ambiente JSX per EV3
render(
    <Screen>
        {batteryLevel < 20 ? 
            <Text color="red">Batteria scarica!</Text> : 
            <Text color="green">Batteria OK</Text>}
    </Screen>
);
```

## Esempi Pratici per la Robotica EV3

### Gestione dello stato del robot

```javascript
// Visualizza diversi stati del robot
forever(function() {
    let statoRobot = sensoreUltrasuoni.distance() < 20 ? "Evitamento" :
                     sensoreColore.color() === Color.Black ? "Segui linea" :
                     "Esplorazione";
    
    brick.clearScreen();
    brick.showString(`Stato: ${statoRobot}`, 1);
    
    // La velocità dipende dallo stato
    let velocitaSinistra = statoRobot === "Evitamento" ? -30 : 
                          statoRobot === "Segui linea" ? 50 : 30;
    
    let velocitaDestra = statoRobot === "Evitamento" ? 30 : 
                         statoRobot === "Segui linea" ? 50 : 30;
    
    motors.largeBC.tank(velocitaSinistra, velocitaDestra);
    pause(100);
});
```

### Controllo di sicurezza semplificato

```javascript
// Controlla la sicurezza e agisci di conseguenza
function controlloSicurezza() {
    // Operatore ternario per controllare se è sicuro procedere
    let sicuro = sensoreUltrasuoni.distance() > 30 && !sensoreTocco.isPressed();
    
    // Operatore ternario per decidere l'azione
    sicuro ? procediAvanti() : fermatiEAvvisa();
}

function procediAvanti() {
    motors.largeBC.tank(50, 50);
    brick.showString("Avanzamento", 1);
}

function fermatiEAvvisa() {
    motors.largeBC.stop();
    brick.showString("STOP: Condizione non sicura", 1);
    music.playSoundEffect(SoundEffect.Alarm);
}
```

## Best Practices

1. **Leggibilità**: Usa l'operatore ternario solo per condizioni semplici. Per logiche complesse, preferisci if-else.

2. **Lunghezza**: Mantieni le espressioni corte. Se l'operatore ternario rende il codice difficile da leggere, usa if-else.

3. **Nesting**: Evita di annidare troppi operatori ternari, poiché ciò rende il codice difficile da leggere e mantenere.

4. **Coerenza**: Se utilizzi l'operatore ternario per l'assegnazione di variabili, mantieni lo stesso stile in tutto il codice.

## Conclusione

L'operatore ternario è uno strumento utile per semplificare il codice condizionale quando la logica è semplice. Nella programmazione dei robot LEGO EV3, può essere particolarmente utile per:

- Impostare rapidamente valori di configurazione in base alle condizioni ambientali
- Creare messaggi di stato condizionali per il display
- Eseguire semplici decisioni di movimento in base ai sensori

Ricorda che la leggibilità è fondamentale, specialmente quando altri programmatori potrebbero lavorare con il tuo codice. Usa l'operatore ternario per migliorare la chiarezza, non per mostrare quanto puoi condensare in una singola linea.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Switch Statement](03-SwitchStatement.md)
- [➡️ Truth and Falsy Values](05-TruthFalsyValues.md)