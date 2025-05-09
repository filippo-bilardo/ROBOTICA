# Controllo Motori di Base

## Introduzione

In questa guida esploreremo i comandi fondamentali per controllare i motori del tuo robot LEGO EV3 utilizzando JavaScript in MakeCode. Padroneggiare questi comandi di base è essenziale per creare qualsiasi tipo di movimento robotico, dalla semplice traslazione alle manovre più complesse.

## Comandi Base per il Controllo dei Motori

### 1. Avvio e Arresto dei Motori

Il controllo più elementare di un motore consiste nell'avviarlo e arrestarlo:

```javascript
// Avvia il motore grande sulla porta A a metà potenza (50%)
motors.largeA.run(50);

// Arresta il motore grande sulla porta A
motors.largeA.stop();
```

Quando si utilizza il metodo `run()` con un solo parametro, il motore continuerà a girare finché non riceve un comando di arresto o un altro comando di movimento.

### 2. Controllo della Potenza e Direzione

La potenza e la direzione di rotazione di un motore sono controllate da un singolo parametro:

```javascript
// Valori positivi: rotazione in senso orario
motors.largeA.run(75);  // Potenza al 75% in senso orario

// Valori negativi: rotazione in senso antiorario
motors.largeA.run(-40); // Potenza al 40% in senso antiorario

// Zero: arresto del motore
motors.largeA.run(0);   // Ferma il motore
```

La potenza può essere impostata su qualsiasi valore nell'intervallo da -100 a 100:
- -100: massima potenza in senso antiorario
- 0: arresto
- 100: massima potenza in senso orario

### 3. Movimenti a Durata Limitata

Spesso è necessario far funzionare un motore per un periodo di tempo specifico o per una rotazione specifica:

```javascript
// Far funzionare il motore per 2 secondi a potenza 60
motors.largeA.run(60, 2, MoveUnit.Seconds);

// Far ruotare il motore per 3 rotazioni complete a potenza 50
motors.largeA.run(50, 3, MoveUnit.Rotations);

// Far ruotare il motore di 90 gradi a potenza 30
motors.largeA.run(30, 90, MoveUnit.Degrees);
```

In questi casi, il motore si arresterà automaticamente dopo aver completato l'operazione richiesta.

### 4. Controllare Due Motori Insieme

Per un robot a due ruote motrici, è comune controllare entrambi i motori contemporaneamente:

```javascript
// Avvia entrambi i motori A e B alla stessa potenza
motors.largeAB.run(50);

// Arresta entrambi i motori
motors.largeAB.stop();

// Far funzionare entrambi i motori per 3 secondi
motors.largeAB.run(50, 3, MoveUnit.Seconds);
```

## Movimenti di Base del Robot a Due Ruote

### 1. Movimento Rettilineo

Per far muovere un robot a due ruote in linea retta:

```javascript
// Movimento in avanti (entrambi i motori in senso orario)
motors.largeAB.run(50);

// Movimento all'indietro (entrambi i motori in senso antiorario)
motors.largeAB.run(-50);
```

### 2. Rotazione sul Posto

Per far ruotare un robot a due ruote sul posto, i motori devono girare in direzioni opposte:

```javascript
// Rotazione in senso orario (A indietro, B avanti)
motors.largeA.run(-50);
motors.largeB.run(50);

// Rotazione in senso antiorario (A avanti, B indietro)
motors.largeA.run(50);
motors.largeB.run(-50);
```

MakeCode offre anche il metodo `tank()` per questo tipo di controllo:

```javascript
// Rotazione in senso orario (-50 su A, 50 su B)
motors.largeAB.tank(-50, 50);

// Rotazione in senso antiorario per 2 secondi
motors.largeAB.tank(50, -50, 2, MoveUnit.Seconds);
```

### 3. Movimento in Curva

Per far curvare il robot, è necessario impostare potenze diverse sui due motori:

```javascript
// Curva graduale a destra (motore A più veloce di B)
motors.largeA.run(70);
motors.largeB.run(30);

// Curva graduale a sinistra (motore B più veloce di A)
motors.largeA.run(30);
motors.largeB.run(70);
```

MakeCode offre anche il metodo `steer()` che semplifica questo tipo di controllo:

```javascript
// steer(sterzo, potenza, [durata], [unità]);
// sterzo: da -100 (svolta a sinistra) a 100 (svolta a destra), 0 è dritto

// Movimento dritto in avanti
motors.largeAB.steer(0, 50);

// Curva a destra (sterzo = 50, potenza = 40)
motors.largeAB.steer(50, 40);

// Curva a sinistra per 3 secondi (sterzo = -50, potenza = 40)
motors.largeAB.steer(-50, 40, 3, MoveUnit.Seconds);
```

### 4. Controllo della Frenata

È possibile controllare il comportamento di arresto dei motori:

```javascript
// Impostare la modalità di frenata attiva (freno elettrico)
motors.largeA.setBrake(true);
motors.largeB.setBrake(true);

// Disattivare la frenata (modalità coast - arresto graduale)
motors.largeA.setBrake(false);
motors.largeB.setBrake(false);
```

- **Frenata attiva (true)**: Il motore applica resistenza per fermarsi rapidamente
- **Frenata passiva (false)**: Il motore si arresta gradualmente per inerzia

## Lettura dei Dati dei Motori

### 1. Lettura dell'Angolo di Rotazione

```javascript
// Leggere l'angolo corrente del motore A (in gradi)
let angoloA = motors.largeA.angle();
brick.showValue("Angolo A", angoloA, 1);

// Resettare la lettura dell'encoder (azzerare l'angolo)
motors.largeA.reset();
```

### 2. Verificare se un Motore è in Movimento

```javascript
// Verificare se il motore A è in funzione
if (motors.largeA.isRunning()) {
    brick.showString("Motore A in movimento", 1);
} else {
    brick.showString("Motore A fermo", 1);
}
```

### 3. Lettura della Velocità Corrente

```javascript
// Leggere la velocità corrente del motore
let velocitaA = motors.largeA.speed();
brick.showValue("Velocità A", velocitaA, 2);
```

## Pattern Comuni di Movimento

### 1. Sequenza di Movimenti

```javascript
// Esempio di sequenza di movimenti base
function sequenzaMovimentiBase() {
    // Avanti per 2 secondi
    motors.largeAB.steer(0, 50, 2, MoveUnit.Seconds);
    
    // Pausa breve
    pause(500);
    
    // Rotazione a destra per 1 secondo
    motors.largeAB.tank(-50, 50, 1, MoveUnit.Seconds);
    
    // Pausa breve
    pause(500);
    
    // Indietro per 1 secondo
    motors.largeAB.steer(0, -50, 1, MoveUnit.Seconds);
    
    // Pausa breve
    pause(500);
    
    // Rotazione a sinistra per 1 secondo
    motors.largeAB.tank(50, -50, 1, MoveUnit.Seconds);
}
```

### 2. Movimento con Controllo della Velocità

```javascript
// Accelerazione graduale
function accelerazioneGraduale() {
    // Partendo da potenza bassa
    for (let potenza = 10; potenza <= 100; potenza += 10) {
        motors.largeAB.steer(0, potenza);
        pause(300); // Attendi 300ms tra ogni incremento
    }
    
    // Decelerazione graduale
    for (let potenza = 100; potenza >= 0; potenza -= 10) {
        motors.largeAB.steer(0, potenza);
        pause(300); // Attendi 300ms tra ogni decremento
    }
}
```

### 3. Funzione per Rotazione di Angoli Precisi

```javascript
// Funzione per ruotare il robot di un angolo specifico
function ruotaGradi(gradi, potenza) {
    // Reset degli encoder
    motors.largeA.reset();
    motors.largeB.reset();
    
    // Determina la direzione di rotazione
    let direzione = 1;
    if (gradi < 0) {
        direzione = -1;
        gradi = -gradi; // Usa il valore assoluto
    }
    
    // Calcola approssimativamente i gradi di rotazione del motore
    // necessari per ruotare il robot dell'angolo desiderato
    // Nota: questo valore dipende dalla configurazione del robot
    // e dovrebbe essere calibrato sperimentalmente
    let gradiMotore = gradi * 2.5; // Valore di esempio, da calibrare
    
    // Esegui la rotazione
    if (direzione > 0) {
        // Rotazione in senso orario
        motors.largeA.run(-potenza, gradiMotore, MoveUnit.Degrees);
        motors.largeB.run(potenza, gradiMotore, MoveUnit.Degrees);
    } else {
        // Rotazione in senso antiorario
        motors.largeA.run(potenza, gradiMotore, MoveUnit.Degrees);
        motors.largeB.run(-potenza, gradiMotore, MoveUnit.Degrees);
    }
    
    // Attendi il completamento
    while (motors.largeA.isRunning() || motors.largeB.isRunning()) {
        pause(10);
    }
}
```

## Alimentazione dei Motori

### Livello della Batteria

Le prestazioni dei motori dipendono direttamente dal livello della batteria del brick EV3. È buona pratica verificare il livello della batteria all'inizio del programma:

```javascript
function verificaBatteria() {
    const livelloBatteria = brick.batteryLevel();
    brick.showValue("Batteria %", livelloBatteria, 1);
    
    if (livelloBatteria < 20) {
        brick.showString("ATTENZIONE:", 2);
        brick.showString("Batteria scarica!", 3);
        brick.showString("Prestazioni ridotte", 4);
    }
}
```

## Esercizio Pratico

Proviamo a mettere in pratica quanto appreso con un esempio che combina diversi tipi di movimento:

```javascript
// Percorso a zig-zag
function percorsoZigZag() {
    // Inizia con un movimento dritto
    motors.largeAB.steer(0, 50, 1, MoveUnit.Seconds);
    
    // Esegui una serie di curve alternate
    for (let i = 0; i < 4; i++) {
        // Curva a destra
        motors.largeAB.steer(40, 50, 0.8, MoveUnit.Seconds);
        
        // Curva a sinistra
        motors.largeAB.steer(-40, 50, 0.8, MoveUnit.Seconds);
    }
    
    // Termina con un movimento dritto
    motors.largeAB.steer(0, 50, 1, MoveUnit.Seconds);
    
    // Arresta i motori
    motors.largeAB.stop();
}
```

## Pattern a Quadrato

Utilizziamo i nostri comandi di base per far seguire al robot un percorso a forma di quadrato:

```javascript
function percorsoQuadrato() {
    for (let i = 0; i < 4; i++) {
        // Movimento in avanti
        motors.largeAB.steer(0, 50, 2, MoveUnit.Seconds);
        
        // Breve pausa
        pause(500);
        
        // Rotazione di 90 gradi
        motors.largeAB.tank(-50, 50, 0.8, MoveUnit.Seconds);
        
        // Breve pausa
        pause(500);
    }
    
    // Arresta i motori
    motors.largeAB.stop();
}
```

## Tracciamento di Figure

Con il controllo base dei motori, possiamo far tracciare al robot diverse figure:

```javascript
// Traccia un cerchio
function tracciaCircolo() {
    // Per un cerchio, imposta una potenza costante su entrambi
    // i motori, ma con valori diversi
    motors.largeA.run(70);
    motors.largeB.run(30);
    
    // Mantieni il movimento per 6 secondi
    pause(6000);
    
    // Arresta i motori
    motors.largeA.stop();
    motors.largeB.stop();
}

// Traccia un otto
function tracciaOtto() {
    // Prima metà: cerchio in senso orario
    motors.largeA.run(70);
    motors.largeB.run(30);
    pause(6000);
    
    // Seconda metà: cerchio in senso antiorario
    motors.largeA.run(30);
    motors.largeB.run(70);
    pause(6000);
    
    // Arresta i motori
    motors.largeA.stop();
    motors.largeB.stop();
}
```

## Debug del Movimento

Durante lo sviluppo di algoritmi di movimento, è utile visualizzare le informazioni sui motori:

```javascript
// Funzione per mostrare informazioni sui motori
function mostraInfoMotori() {
    while (true) {
        // Leggi valori dai motori
        let angoloA = motors.largeA.angle();
        let angoloB = motors.largeB.angle();
        let velocitaA = motors.largeA.speed();
        let velocitaB = motors.largeB.speed();
        
        // Mostra informazioni sul display
        brick.clearScreen();
        brick.showString("MOTORE A:", 1);
        brick.showValue("Angolo", angoloA, 2);
        brick.showValue("Velocità", velocitaA, 3);
        brick.showString("MOTORE B:", 4);
        brick.showValue("Angolo", angoloB, 5);
        brick.showValue("Velocità", velocitaB, 6);
        
        // Aggiorna ogni 100ms
        pause(100);
    }
}
```

## Conclusione

In questa guida abbiamo esplorato i comandi fondamentali per controllare i motori del robot EV3 e abbiamo visto come combinarli per creare movimenti più complessi. 

Padroneggiare questi comandi di base è essenziale prima di passare a tecniche più avanzate come i movimenti sincronizzati e il controllo di precisione, che esploreremo nei prossimi capitoli.

Ricorda che la pratica è fondamentale: sperimenta con diverse combinazioni di comandi per comprendere meglio come il tuo robot risponde a diversi tipi di istruzioni di movimento.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Introduzione ai Motori EV3](01-IntroduzioneMotori.md)
- [➡️ Movimenti Sincronizzati](03-MovimentiSincronizzati.md)