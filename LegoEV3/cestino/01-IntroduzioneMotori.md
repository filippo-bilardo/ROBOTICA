# Introduzione ai Motori EV3

## Panoramica

I motori sono componenti fondamentali dei robot LEGO EV3, in quanto permettono il movimento e l'interazione con l'ambiente circostante. In questa guida esploreremo i diversi tipi di motori disponibili per la piattaforma EV3, le loro caratteristiche e come utilizzarli efficacemente nei tuoi progetti robotici.

## Tipi di Motori EV3

Il kit LEGO Mindstorms EV3 include due tipi principali di motori:

### 1. Motore Grande (Large Motor)

![Motore Grande EV3](https://education.lego.com/v3/assets/blt293eea581807678a/blt8abcd91ff593cd55/5f88025df6abb8302c1dda6b/ev3-large-motor.png?auto=webp&format=png&width=600&quality=90&fit=bounds)

**Caratteristiche:**
- Potente e ad alta coppia
- Velocità di rotazione: circa 160-170 rpm (giri al minuto) a piena potenza
- Encoder integrato con risoluzione di 1 grado
- Design ottimizzato per la trazione e i movimenti principali
- Consumo energetico maggiore rispetto al motore medio

**Utilizzo tipico:**
- Propulsione principale (ruote motrici)
- Movimenti che richiedono forza e precisione
- Meccanismi di sollevamento

### 2. Motore Medio (Medium Motor)

![Motore Medio EV3](https://education.lego.com/v3/assets/blt293eea581807678a/bltcc6497bc539c7c27/5f8802606a3d980f95e6c9f2/ev3-medium-motor.png?auto=webp&format=png&width=600&quality=90&fit=bounds)

**Caratteristiche:**
- Più leggero e compatto del motore grande
- Velocità di rotazione: circa 240-250 rpm (più veloce del motore grande)
- Encoder integrato con risoluzione di 1 grado
- Minore coppia rispetto al motore grande
- Risposta più rapida ai comandi

**Utilizzo tipico:**
- Meccanismi di sterzo
- Bracci robotici leggeri
- Accessori che richiedono velocità piuttosto che forza
- Applicazioni con spazio limitato

## Connessione dei Motori

I motori EV3 si collegano al brick EV3 tramite cavi speciali con connettori RJ12. Il brick EV3 dispone di quattro porte di output (denominate A, B, C e D) a cui possono essere collegati i motori.

```javascript
// In MakeCode, i motori sono accessibili tramite l'oggetto 'motors'
// seguito dalla porta a cui sono collegati
motors.largeA    // Motore grande sulla porta A
motors.largeB    // Motore grande sulla porta B
motors.mediumC   // Motore medio sulla porta C
motors.largeD    // Motore grande sulla porta D
```

### Configurazione Standard

Una configurazione tipica per un robot a due ruote motrici potrebbe essere:
- Motore grande sulla porta A: ruota sinistra
- Motore grande sulla porta B: ruota destra
- Motore medio sulla porta C: meccanismo ausiliario (es. braccio o pinza)

MakeCode offre anche combinazioni predefinite di motori per facilitare il controllo:

```javascript
motors.largeAB   // Controlla entrambi i motori A e B insieme
motors.largeBC   // Controlla entrambi i motori B e C insieme
// ... altre combinazioni possibili
```

## Caratteristiche Tecniche dei Motori EV3

### Encoders (Sensori di Rotazione)

Ogni motore EV3 è dotato di un encoder integrato che permette di:
- Misurare la rotazione con precisione di 1 grado
- Determinare la posizione attuale dell'albero motore
- Controllare con precisione i movimenti

```javascript
// Leggere l'angolo corrente di un motore (in gradi)
let angoloAttuale = motors.largeA.angle();

// Resettare l'encoder (azzerare la lettura)
motors.largeA.reset();
```

### Potenza e Direzione

La potenza del motore può essere impostata su una scala da -100 a 100:
- Valori positivi: rotazione in senso orario
- Valori negativi: rotazione in senso antiorario
- 0: arresto del motore
- La magnitudine del valore determina la velocità di rotazione

```javascript
// Potenza massima in senso orario
motors.largeA.run(100);

// Metà potenza in senso antiorario
motors.largeA.run(-50);

// Arrestare il motore
motors.largeA.stop();
```

### Unità di Misura

Quando si controlla un motore, si possono utilizzare diverse unità di misura:

```javascript
// Rotazione per un tempo specifico (3 secondi)
motors.largeA.run(50, 3, MoveUnit.Seconds);

// Rotazione per un numero specifico di rotazioni (2 giri completi)
motors.largeA.run(50, 2, MoveUnit.Rotations);

// Rotazione per un angolo specifico (90 gradi)
motors.largeA.run(50, 90, MoveUnit.Degrees);
```

## Differenze di Prestazioni

### Rapporto Potenza/Velocità

È importante comprendere il rapporto tra la potenza impostata e la velocità effettiva:
- La velocità massima varia a seconda del tipo di motore
- La velocità effettiva può diminuire sotto carico
- Il livello della batteria influisce significativamente sulle prestazioni

### Inerzia e Precisione

I motori EV3 hanno caratteristiche di inerzia che influenzano la precisione:
- Un motore a piena potenza continuerà a ruotare brevemente anche dopo aver ricevuto un comando di arresto
- I motori medi hanno meno inerzia rispetto ai motori grandi
- Per movimenti di precisione, è consigliabile utilizzare velocità moderate

## Best Practices per l'Utilizzo dei Motori

1. **Consistenza nella Connessione**
   - Usa sempre le stesse porte per gli stessi motori
   - Adotta convenzioni standard (es. A e B per le ruote)

2. **Controllo dell'Alimentazione**
   - Monitora il livello della batteria per prestazioni costanti
   - Considera che un basso livello di batteria riduce la potenza dei motori

3. **Calibrazione**
   - I motori potrebbero richiedere calibrazione per movimenti precisi
   - Misura e compensa le piccole differenze tra motori dello stesso tipo

4. **Raffreddamento**
   - Evita di mantenere i motori sotto sforzo per periodi prolungati
   - Dai tempo ai motori di raffreddarsi dopo utilizzi intensivi

## Esempi di Utilizzo Base

### Controllo Semplice di un Motore

```javascript
// Avvia il motore A a metà potenza
motors.largeA.run(50);

// Mantieni in funzione per 2 secondi
pause(2000);

// Ferma il motore
motors.largeA.stop();
```

### Movimento a Due Ruote Coordinato

```javascript
// Movimento in avanti per 3 secondi
motors.largeAB.steer(0, 50, 3, MoveUnit.Seconds);

// Curva a destra (sterzo = 50) per 2 secondi
motors.largeAB.steer(50, 40, 2, MoveUnit.Seconds);

// Rotazione sul posto a sinistra
motors.largeAB.tank(-50, 50, 1, MoveUnit.Seconds);
```

### Utilizzo del Motore Medio per un Accessorio

```javascript
// Alza un braccio robotico (collegato alla porta C)
motors.mediumC.run(70, 90, MoveUnit.Degrees);

// Abbassa il braccio
motors.mediumC.run(-30, 90, MoveUnit.Degrees);
```

## Proprietà dei Motori in MakeCode

Oltre ai metodi base, i motori EV3 in MakeCode hanno diverse proprietà e metodi avanzati:

```javascript
// Impostare la modalità di frenata (true = freno attivo, false = rotazione libera)
motors.largeA.setBrake(true);

// Verificare se un motore è in movimento
let inMovimento = motors.largeA.isRunning();

// Ottenere la velocità attuale
let velocitaAttuale = motors.largeA.speed();
```

## Conclusione

I motori EV3 sono componenti versatili e potenti che offrono molte possibilità per la creazione di robot mobili e interattivi. Comprendere le differenze tra i tipi di motori e come utilizzarli efficacemente è fondamentale per sviluppare progetti robotici di successo.

Nei prossimi capitoli, esploreremo metodi più avanzati per controllare i motori, inclusi movimenti sincronizzati, controllo di precisione e tecniche di calibrazione.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [➡️ Controllo Motori di Base](02-ControlloBase.md)