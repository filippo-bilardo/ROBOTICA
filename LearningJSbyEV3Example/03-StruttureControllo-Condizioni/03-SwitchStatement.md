# Switch Statement

Lo `switch` statement è una struttura di controllo che permette di selezionare uno tra molti blocchi di codice da eseguire in base al valore di un'espressione. È un'alternativa più leggibile alle lunghe catene di `if-else if` quando occorre confrontare un valore con molte possibili opzioni.

## Sintassi di Base

```javascript
switch (espressione) {
    case valore1:
        // Codice da eseguire se espressione === valore1
        break;
    case valore2:
        // Codice da eseguire se espressione === valore2
        break;
    case valore3:
        // Codice da eseguire se espressione === valore3
        break;
    default:
        // Codice da eseguire se nessuno dei valori corrisponde
}
```

### Elementi Chiave

- **espressione**: Un valore o una variabile da valutare.
- **case valore**: Una possibile corrispondenza per l'espressione.
- **break**: Interrompe l'esecuzione dello switch, impedendo che il flusso "cada" nei casi successivi.
- **default**: Blocco di codice opzionale che viene eseguito se nessun case corrisponde all'espressione.

## Come Funziona lo Switch

1. L'espressione viene valutata una sola volta.
2. Il valore dell'espressione viene confrontato con i valori in ciascun case.
3. Se c'è una corrispondenza, viene eseguito il blocco di codice associato.
4. Se viene incontrata un'istruzione `break`, l'esecuzione dello `switch` termina.
5. Se non viene trovata alcuna corrispondenza, viene eseguito il blocco `default` (se presente).

## Esempio con EV3: Reazioni ai Colori

```javascript
// Funzione per reagire ai diversi colori rilevati
function reagisciAlColore() {
    let coloreRilevato = sensoreColore.color();
    
    switch (coloreRilevato) {
        case Color.Black:
            // Segui la linea nera
            motors.largeBC.tank(50, 50);
            brick.showString("Seguendo la linea nera", 3);
            break;
            
        case Color.Red:
            // Fermati al rosso
            motors.largeBC.stop();
            brick.showString("Stop! Segnale rosso", 3);
            music.playSoundEffect(SoundEffect.Alarm);
            break;
            
        case Color.Blue:
            // Gira a destra al blu
            motors.largeBC.tank(50, -50);
            brick.showString("Girando a destra", 3);
            break;
            
        case Color.Green:
            // Gira a sinistra al verde
            motors.largeBC.tank(-50, 50);
            brick.showString("Girando a sinistra", 3);
            break;
            
        case Color.Yellow:
            // Rallenta al giallo
            motors.largeBC.tank(20, 20);
            brick.showString("Rallentamento", 3);
            break;
            
        default:
            // Per tutti gli altri colori, cerca la linea
            motors.largeBC.tank(30, -30);
            brick.showString("Cercando la linea", 3);
    }
}
```

## Il Comportamento di "Fall-Through"

Se si omette l'istruzione `break`, l'esecuzione continuerà nei case successivi, indipendentemente dal fatto che corrispondano o meno. Questo comportamento è chiamato "fall-through" (o "caduta").

### Esempio di Fall-Through Intenzionale

A volte il fall-through può essere utile quando si desidera che più case eseguano lo stesso codice:

```javascript
switch (livelloBatteria) {
    case 1:
    case 2:
    case 3:
        // Questo codice viene eseguito se livelloBatteria è 1, 2 o 3
        brick.showString("Batteria critica! Ricaricare!", 3);
        music.playSoundEffect(SoundEffect.Alarm);
        break;
        
    case 4:
    case 5:
    case 6:
        // Questo codice viene eseguito se livelloBatteria è 4, 5 o 6
        brick.showString("Batteria bassa", 3);
        break;
        
    default:
        // Questo codice viene eseguito per tutti gli altri valori
        brick.showString("Batteria OK", 3);
}
```

## Switch con Espressioni Complesse nei Case

È possibile utilizzare espressioni più complesse nei case, ma ogni case deve essere un valore costante:

```javascript
const MODALITA_LINEA = 1;
const MODALITA_OSTACOLI = 2;
const MODALITA_INTERATTIVA = 3;

switch (modalitaAttuale) {
    case MODALITA_LINEA:
        avviaSeguiLinea();
        break;
        
    case MODALITA_OSTACOLI:
        avviaEvitaOstacoli();
        break;
        
    case MODALITA_INTERATTIVA:
        avviaInterazione();
        break;
        
    default:
        avviaModoStandby();
}
```

## Esempio Pratico con EV3: Gestione Stati del Robot

Lo switch è particolarmente utile per implementare una macchina a stati per il robot, dove ogni stato corrisponde a un comportamento specifico.

```javascript
// Stati possibili del robot
const STATO_FERMO = 0;
const STATO_AVANZAMENTO = 1;
const STATO_EVITA_OSTACOLI = 2;
const STATO_SEGUI_LINEA = 3;
const STATO_RITORNO_BASE = 4;

// Funzione per gestire il comportamento del robot in base allo stato
function gestisciStato(statoRobot) {
    switch (statoRobot) {
        case STATO_FERMO:
            // Il robot è fermo e in attesa di comandi
            motors.largeBC.stop();
            brick.showString("Stato: Fermo", 3);
            brick.showString("In attesa di comandi", 4);
            break;
            
        case STATO_AVANZAMENTO:
            // Il robot avanza in linea retta
            motors.largeBC.tank(50, 50);
            brick.showString("Stato: Avanzamento", 3);
            
            // Controlla se c'è un ostacolo
            if (sensoreUltrasuoni.distance() < 20) {
                return STATO_EVITA_OSTACOLI; // Cambia stato
            }
            break;
            
        case STATO_EVITA_OSTACOLI:
            // Il robot evita un ostacolo
            brick.showString("Stato: Evita Ostacoli", 3);
            motors.largeBC.stop();
            pause(500);
            
            // Gira a destra
            motors.largeBC.tank(50, -50);
            pause(1000);
            
            return STATO_AVANZAMENTO; // Torna ad avanzare
            
        case STATO_SEGUI_LINEA:
            // Il robot segue una linea nera
            brick.showString("Stato: Segui Linea", 3);
            
            if (sensoreColore.color() === Color.Black) {
                motors.largeBC.tank(50, 50);
            } else {
                motors.largeBC.tank(10, 50); // Gira per cercare la linea
            }
            
            // Se viene premuto il sensore di tocco, torna alla base
            if (sensoreTocco.isPressed()) {
                return STATO_RITORNO_BASE;
            }
            break;
            
        case STATO_RITORNO_BASE:
            // Il robot torna alla base
            brick.showString("Stato: Ritorno Base", 3);
            brick.showString("Missione completata", 4);
            
            // Esegui una sequenza di movimenti per tornare alla base
            motors.largeBC.tank(-50, -50);
            pause(2000);
            motors.largeBC.stop();
            
            return STATO_FERMO; // Torna in stato fermo
            
        default:
            // Stato non riconosciuto
            brick.showString("Errore: Stato sconosciuto", 3);
            return STATO_FERMO; // Vai in stato sicuro
    }
    
    // Se non è stato restituito un nuovo stato, mantieni lo stato attuale
    return statoRobot;
}

// Esempio di utilizzo della macchina a stati
let statoCorrente = STATO_FERMO;

forever(function() {
    // Aggiorna lo stato ad ogni iterazione
    statoCorrente = gestisciStato(statoCorrente);
    pause(100);
});
```

## Switch vs If-Else: Quando Usare Quale

| Switch | If-Else |
|--------|---------|
| Confronta un'espressione contro valori costanti | Può valutare condizioni diverse e complesse |
| Più leggibile per molti casi | Migliore per poche condizioni |
| Prestazioni potenzialmente migliori per molti casi | Più flessibile per condizioni complesse |
| Utile per gestire stati o valori enumerati | Utile per range di valori o condizioni logiche |

## Best Practices

1. **Sempre usare `break`**: A meno che non si voglia esplicitamente sfruttare il fall-through, includere sempre l'istruzione `break` alla fine di ogni case.

2. **Organizzare i case in ordine logico**: Ordinare i case in modo da aumentare la leggibilità, ad esempio in ordine alfabetico, numerico o per frequenza di utilizzo.

3. **Usare il case `default`**: Includere sempre un case `default` per gestire i valori imprevisti.

4. **Commentare i fall-through intenzionali**: Se si omette un `break` intenzionalmente, aggiungere un commento per chiarire che non è un errore.

5. **Usare costanti per i valori dei case**: Rende il codice più leggibile e manutenibile.

## Conclusione

Lo `switch` statement è uno strumento potente per gestire molteplici condizioni basate su un singolo valore. Nella programmazione robotica, è particolarmente utile per implementare macchine a stati, gestire input da sensori discreti o implementare modalità di funzionamento diverse. Utilizzato correttamente, può rendere il codice più leggibile e manutenibile rispetto a lunghe catene di if-else.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Operatori di Confronto e Logici](02-OperatoriConfrontoLogici.md)
- [➡️ Espressioni Condizionali (Operatore Ternario)](04-EspressioniCondizionali.md)