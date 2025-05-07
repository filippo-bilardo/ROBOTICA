# Cicli annidati

I cicli annidati si verificano quando un ciclo è contenuto all'interno di un altro ciclo. Questa struttura è particolarmente potente per affrontare problemi complessi che richiedono iterazioni multiple e interdipendenti. Nella programmazione dei robot EV3, i cicli annidati sono essenziali per creare pattern di movimento sofisticati, implementare algoritmi di ricerca e gestire comportamenti multi-livello.

## Concetto di base

Un ciclo annidato consiste in un ciclo esterno e uno o più cicli interni. Per ogni iterazione del ciclo esterno, il ciclo interno esegue il suo intero ciclo di iterazioni.

### Sintassi di base

```javascript
// Ciclo esterno
for (let i = 0; i < esternoConteggio; i++) {
    // Operazioni del ciclo esterno
    
    // Ciclo interno
    for (let j = 0; j < internoConteggio; j++) {
        // Operazioni del ciclo interno
    }
    
    // Altre operazioni del ciclo esterno
}
```

## Esempio semplice

```javascript
// Stampa una griglia 5x5 di asterischi
for (let riga = 0; riga < 5; riga++) {
    let lineaAsterischi = "";
    
    for (let colonna = 0; colonna < 5; colonna++) {
        lineaAsterischi += "* ";
    }
    
    brick.showString(lineaAsterischi, riga);
}
```

In questo esempio:
1. Il ciclo esterno itera attraverso 5 righe (da 0 a 4)
2. Per ogni riga, il ciclo interno costruisce una stringa di 5 asterischi
3. Alla fine di ogni iterazione esterna, la stringa viene visualizzata sulla riga corrispondente

## Pattern di movimento con cicli annidati

### Esempio: Movimento a griglia

```javascript
// Esplora una griglia 3x3
let dimensioneGriglia = 3;
let lunghezzaLato = 1000;  // tempo di movimento per ogni lato in ms

for (let riga = 0; riga < dimensioneGriglia; riga++) {
    // Movimento orizzontale (attraversa la riga)
    for (let colonna = 0; colonna < dimensioneGriglia; colonna++) {
        // Visualizza la posizione corrente
        brick.showString(`Posizione: (${riga}, ${colonna})`, 3);
        
        // Breve pausa in ogni punto della griglia
        motors.largeBC.stop();
        pause(500);
        
        // Muovi alla prossima posizione nella riga (se non sei all'ultima colonna)
        if (colonna < dimensioneGriglia - 1) {
            motors.largeBC.tank(50, 50);
            pause(lunghezzaLato);
        }
    }
    
    // Se non siamo all'ultima riga, preparati per la riga successiva
    if (riga < dimensioneGriglia - 1) {
        // Gira a destra
        motors.largeBC.tank(50, -50);
        pause(900);  // Tempo per una rotazione di 90 gradi
        
        // Avanza di un lato
        motors.largeBC.tank(50, 50);
        pause(lunghezzaLato);
        
        // Gira a sinistra
        motors.largeBC.tank(-50, 50);
        pause(900);
    }
}

motors.largeBC.stop();
brick.showString("Esplorazione completata!", 5);
```

Questo codice fa muovere il robot in una griglia 3x3, seguendo un pattern a "serpente":
1. Il ciclo esterno controlla le righe
2. Il ciclo interno controlla le colonne all'interno di ogni riga
3. Il robot si ferma brevemente in ogni punto della griglia
4. Alla fine di ogni riga, il robot si gira e si prepara per la riga successiva

### Esempio: Pattern a spirale con controllo della distanza

```javascript
// Crea un pattern a spirale con distanze crescenti
let numeroGiri = 5;

for (let giro = 1; giro <= numeroGiri; giro++) {
    // Calcola la durata per questo giro (aumenta con ogni giro)
    let durata = giro * 500;  // ms
    
    // Per ogni giro, esegui 4 lati (un quadrato)
    for (let lato = 0; lato < 4; lato++) {
        // Mostra informazioni sul display
        brick.showString(`Giro: ${giro}/${numeroGiri}`, 3);
        brick.showString(`Lato: ${lato + 1}/4`, 4);
        brick.showString(`Durata: ${durata} ms`, 5);
        
        // Esegui il movimento per questo lato
        if (lato === 0 || lato === 2) {
            // Lati 1 e 3: avanti/indietro
            motors.largeBC.tank(60, 60);
        } else {
            // Lati 2 e 4: destra/sinistra
            motors.largeBC.tank(60, 30);
        }
        
        // Mantieni il movimento per la durata calcolata
        pause(durata);
        
        // Breve fermata tra i lati per una rotazione più precisa
        motors.largeBC.stop();
        pause(200);
    }
}

motors.largeBC.stop();
brick.showString("Spirale completata!", 7);
```

Questo esempio crea un pattern a spirale:
1. Il ciclo esterno controlla il numero di giri della spirale
2. Il ciclo interno controlla i quattro lati di ciascun giro
3. La durata di ciascun lato aumenta con ogni giro, creando una spirale in espansione

## Monitoraggio multi-sensore con cicli annidati

I cicli annidati sono utilissimi quando si devono monitorare più sensori contemporaneamente o in sequenza.

```javascript
// Monitora il sensore di colore per diversi colori a diverse distanze
let coloriTarget = [Color.Red, Color.Green, Color.Blue, Color.Yellow];
let distanzeTest = [10, 20, 30, 40, 50];  // distanze in cm

// Per ogni colore target...
for (let i = 0; i < coloriTarget.length; i++) {
    let colore = coloriTarget[i];
    let nomeColore;
    
    // Determina il nome del colore per la visualizzazione
    switch (colore) {
        case Color.Red: nomeColore = "rosso"; break;
        case Color.Green: nomeColore = "verde"; break;
        case Color.Blue: nomeColore = "blu"; break;
        case Color.Yellow: nomeColore = "giallo"; break;
    }
    
    brick.clearScreen();
    brick.showString(`Test colore: ${nomeColore}`, 1);
    brick.showString("Posiziona l'oggetto e premi", 2);
    brick.showString("il pulsante centrale", 3);
    
    // Attendi la pressione del pulsante
    while (!brick.buttonEnter.isPressed()) {
        pause(100);
    }
    
    // Attendi il rilascio del pulsante
    while (brick.buttonEnter.isPressed()) {
        pause(100);
    }
    
    brick.clearScreen();
    brick.showString(`Test colore: ${nomeColore}`, 1);
    
    // Per ogni distanza di test...
    for (let j = 0; j < distanzeTest.length; j++) {
        let distanza = distanzeTest[j];
        
        brick.showString(`Distanza: ${distanza} cm`, 3);
        brick.showString("Posiziona e premi il pulsante", 8);
        
        // Attendi la pressione del pulsante
        while (!brick.buttonEnter.isPressed()) {
            pause(100);
        }
        
        // Attendi il rilascio del pulsante
        while (brick.buttonEnter.isPressed()) {
            pause(100);
        }
        
        // Leggi il valore del sensore di colore
        let coloreRilevato = sensoreColore.color();
        let intensita = sensoreColore.reflectedLight();
        
        // Mostra i risultati
        brick.showString(`Colore rilevato: ${coloreRilevato === colore ? "OK" : "NO"}`, 5);
        brick.showString(`Intensità: ${intensita}`, 6);
        
        // Salva i dati (in una applicazione reale)
        // salvaDati(colore, distanza, coloreRilevato, intensita);
        
        pause(2000);  // Pausa per vedere i risultati
    }
}

brick.clearScreen();
brick.showString("Test completato!", 4);
```

In questo esempio:
1. Il ciclo esterno itera attraverso diversi colori target
2. Il ciclo interno itera attraverso diverse distanze di test
3. Per ogni combinazione di colore e distanza, il programma richiede all'utente di posizionare l'oggetto e misura la capacità del sensore di rilevare il colore a quella distanza

## Algoritmi di ricerca con cicli annidati

I cicli annidati sono fondamentali per implementare algoritmi di ricerca, come la ricerca in una griglia.

```javascript
// Cerca un oggetto colorato in una griglia 3x3
let grigliaDimensione = 3;
let coloreTarget = Color.Red;
let trovato = false;
let posizioneRiga = -1;
let posizioneColonna = -1;

brick.clearScreen();
brick.showString("Ricerca oggetto rosso", 1);
brick.showString("nella griglia...", 2);

// Esplora la griglia
esternoLoop: for (let riga = 0; riga < grigliaDimensione; riga++) {
    for (let colonna = 0; colonna < grigliaDimensione; colonna++) {
        // Mostra la posizione corrente
        brick.showString(`Scansione (${riga}, ${colonna})`, 4);
        
        // Simula il movimento alla posizione corrente
        // In un'applicazione reale, qui ci sarebbe il codice per muovere il robot
        pause(1000);
        
        // Controlla il colore
        if (sensoreColore.color() === coloreTarget) {
            trovato = true;
            posizioneRiga = riga;
            posizioneColonna = colonna;
            
            // Usa un'etichetta per uscire da entrambi i cicli
            break esternoLoop;
        }
    }
}

// Mostra il risultato
if (trovato) {
    brick.showString("Oggetto rosso trovato!", 6);
    brick.showString(`Posizione: (${posizioneRiga}, ${posizioneColonna})`, 7);
    music.playSoundEffect(SoundEffect.Success);
} else {
    brick.showString("Oggetto rosso non trovato", 6);
    music.playSoundEffect(SoundEffect.Error);
}
```

Questo esempio mostra:
1. L'uso di cicli annidati per esplorare una griglia 2D
2. L'utilizzo di un'etichetta (`esternoLoop:`) per uscire da entrambi i cicli quando viene trovato un oggetto
3. Come tenere traccia delle coordinate in cui viene trovato un oggetto

## Creazione di pattern visuali e sonori

I cicli annidati possono essere utilizzati per creare pattern complessi di feedback visivi e sonori.

```javascript
// Crea un pattern di suoni e luci con cicli annidati
let frequenzeBase = [262, 330, 392, 494]; // Frequenze base (Do, Mi, Sol, Si)
let durate = [100, 200, 300];             // Durate in ms

// Per ogni durata...
for (let d = 0; d < durate.length; d++) {
    let durata = durate[d];
    
    // Per ogni frequenza base...
    for (let f = 0; f < frequenzeBase.length; f++) {
        let frequenza = frequenzeBase[f];
        
        // Mostra informazioni sul display
        brick.clearScreen();
        brick.showString("Pattern Sonoro", 1);
        brick.showString(`Durata: ${durata} ms`, 3);
        brick.showString(`Frequenza base: ${frequenza} Hz`, 4);
        
        // Crea un pattern di tre note basate sulla frequenza base
        for (let multiplo = 1; multiplo <= 3; multiplo++) {
            let notaFrequenza = frequenza * multiplo;
            brick.showString(`Nota: ${notaFrequenza} Hz`, 6);
            
            // Riproduci la nota
            music.playTone(notaFrequenza, durata);
            pause(durata + 50);  // Piccola pausa extra tra le note
        }
        
        pause(300);  // Pausa tra i diversi pattern di note
    }
    
    // Pausa più lunga tra i set di durate diverse
    pause(1000);
}

brick.showString("Pattern completato!", 7);
```

Questo esempio mostra:
1. Tre livelli di annidamento dei cicli
2. Come combinare diversi parametri (durate e frequenze) per creare pattern complessi
3. L'uso di ciascun livello di ciclo per controllare un aspetto diverso del pattern

## Break e continue nei cicli annidati

### Uscire da un ciclo annidato con break ed etichette

Per uscire da un ciclo annidato interno, si usa la normale istruzione `break`. Per uscire da più livelli di cicli annidati, si possono usare le etichette.

```javascript
// Etichetta per il ciclo esterno
esternoLoop: for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
        // Esci da entrambi i cicli se una condizione è verificata
        if (sensoreUltrasuoni.distance() < 10) {
            brick.showString("Ostacolo rilevato! Uscita.", 3);
            break esternoLoop; // Esce da entrambi i cicli
        }
        
        // Esci solo dal ciclo interno se una diversa condizione è verificata
        if (sensoreColore.color() === Color.Red) {
            brick.showString("Colore rosso! Prossima riga.", 3);
            break; // Esce solo dal ciclo interno
        }
        
        // Normale esecuzione del ciclo
        brick.showString(`Esecuzione (${i},${j})`, 5);
        pause(500);
    }
}
```

### Saltare iterazioni con continue

L'istruzione `continue` salta il resto dell'iterazione corrente e passa alla successiva. Può essere usata anche con etichette.

```javascript
esternoLoop: for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
        // Salta alla prossima iterazione del ciclo esterno
        if (sensoreColore.color() === Color.Red) {
            brick.showString("Colore rosso! Prossima riga.", 3);
            continue esternoLoop; // Salta al prossimo i
        }
        
        // Salta alla prossima iterazione del ciclo interno
        if (sensoreUltrasuoni.distance() < 20) {
            brick.showString("Ostacolo vicino! Prossima colonna.", 3);
            continue; // Salta al prossimo j
        }
        
        // Normale esecuzione del ciclo
        brick.showString(`Esecuzione (${i},${j})`, 5);
        pause(500);
    }
}
```

## Problemi comuni e ottimizzazioni

### Evitare troppe iterazioni

Quando si utilizzano cicli annidati, il numero totale di iterazioni è il prodotto del numero di iterazioni di ciascun ciclo. Questo può diventare rapidamente un problema di prestazioni.

```javascript
// Questo codice esegue 10,000 iterazioni (100 * 100)
for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
        // Codice eseguito 10,000 volte
    }
}
```

Per i robot EV3, è consigliabile mantenere il prodotto delle iterazioni relativamente basso per evitare rallentamenti o congelamenti.

### Ottimizzazione: Uscita anticipata

Quando possibile, utilizza `break` con etichette per uscire dai cicli appena hai trovato ciò che stavi cercando.

```javascript
// Versione non ottimizzata: itera sempre attraverso tutte le combinazioni
let trovato = false;
for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
        if (/* condizione cercata */) {
            trovato = true;
            break;
        }
    }
    if (trovato) {
        break;
    }
}

// Versione ottimizzata: esce immediatamente da entrambi i cicli
ricerca: for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
        if (/* condizione cercata */) {
            break ricerca;  // Esce da entrambi i cicli immediatamente
        }
    }
}
```

### Ottimizzazione: Inversione dei cicli

A volte, invertendo l'ordine dei cicli annidati si può migliorare l'efficienza, soprattutto se il ciclo interno dipende dal valore della variabile del ciclo esterno.

```javascript
// Originale
for (let i = 0; i < 100; i++) {
    for (let j = 0; j < i; j++) {  // Notare che j < i
        // Qui j varia da 0 a i-1, quindi il numero di iterazioni varia
    }
}

// Invertito (potenzialmente più efficiente in certi casi)
for (let j = 0; j < 100; j++) {
    for (let i = j + 1; i < 100; i++) {
        // Equivalente logico
    }
}
```

## Applicazioni pratiche avanzate

### Calibrazione multi-parametro

```javascript
// Calibrazione del movimento del robot con diverse potenze e durate
let potenze = [30, 50, 70];
let durate = [500, 1000, 1500];
let distanzeMisurate = [];

brick.clearScreen();
brick.showString("Calibrazione del movimento", 1);

// Per ogni livello di potenza...
for (let p = 0; p < potenze.length; p++) {
    let potenza = potenze[p];
    
    // Per ogni durata...
    for (let d = 0; d < durate.length; d++) {
        let durata = durate[d];
        
        // Mostra i parametri del test
        brick.clearScreen();
        brick.showString("Calibrazione", 1);
        brick.showString(`Potenza: ${potenza}`, 3);
        brick.showString(`Durata: ${durata} ms`, 4);
        brick.showString("Posiziona, poi premi", 7);
        
        // Attendi il pulsante
        while (!brick.buttonEnter.isPressed()) {
            pause(100);
        }
        while (brick.buttonEnter.isPressed()) {
            pause(100);
        }
        
        // Esegui il movimento di test
        motors.largeBC.tank(potenza, potenza);
        pause(durata);
        motors.largeBC.stop();
        
        // Chiedi all'utente di misurare la distanza percorsa
        brick.clearScreen();
        brick.showString("Misura la distanza", 3);
        brick.showString("e inserisci con i pulsanti:", 4);
        
        // Simulazione di una misurazione
        // In un caso reale, l'utente inserirebbe questo valore
        let distanza = Math.round((potenza * durata) / 100);  // Simulato
        
        brick.showString(`Distanza: ${distanza} cm`, 6);
        
        // Salva i risultati
        distanzeMisurate.push({
            potenza: potenza,
            durata: durata,
            distanza: distanza
        });
        
        pause(3000);  // Pausa per vedere il risultato
    }
}

// Mostra i risultati finali
brick.clearScreen();
brick.showString("Risultati calibrazione:", 1);

for (let i = 0; i < Math.min(5, distanzeMisurate.length); i++) {
    let risultato = distanzeMisurate[i];
    brick.showString(`P${risultato.potenza} T${risultato.durata}: ${risultato.distanza}cm`, i + 3);
}

brick.showString("Calibrazione completata!", 8);
```

### Algoritmo di mappatura dell'ambiente

```javascript
// Mappa semplificata dell'ambiente con un sensore ultrasonico
let mappaLarghezza = 4;
let mappaAltezza = 3;
let mappa = [];

// Inizializza la mappa
for (let i = 0; i < mappaAltezza; i++) {
    mappa[i] = [];
    for (let j = 0; j < mappaLarghezza; j++) {
        mappa[i][j] = -1;  // -1 indica "non ancora misurato"
    }
}

brick.clearScreen();
brick.showString("Mappatura ambiente", 1);
brick.showString("Premi per iniziare", 3);

while (!brick.buttonEnter.isPressed()) {
    pause(100);
}
while (brick.buttonEnter.isPressed()) {
    pause(100);
}

// Esegui la mappatura
for (let y = 0; y < mappaAltezza; y++) {
    for (let x = 0; x < mappaLarghezza; x++) {
        // Mostra la posizione corrente
        brick.clearScreen();
        brick.showString("Mappatura ambiente", 1);
        brick.showString(`Posizione: (${x}, ${y})`, 3);
        
        // Simula il movimento alla posizione corrente
        // In una applicazione reale, qui ci sarebbe il codice per muoversi
        pause(1000);
        
        // Misura la distanza con il sensore ultrasonico
        let distanza = sensoreUltrasuoni.distance();
        
        // Salva il valore nella mappa
        mappa[y][x] = distanza;
        
        // Mostra il valore misurato
        brick.showString(`Distanza: ${distanza} cm`, 5);
        pause(500);
    }
}

// Visualizza la mappa completa
brick.clearScreen();
brick.showString("Mappa dell'ambiente:", 0);

for (let y = 0; y < mappaAltezza; y++) {
    let rigaMappa = "";
    for (let x = 0; x < mappaLarghezza; x++) {
        // Converti la distanza in un carattere per la visualizzazione
        if (mappa[y][x] < 10) {
            rigaMappa += "#"; // Muro o ostacolo vicino
        } else if (mappa[y][x] < 30) {
            rigaMappa += "."; // Spazio libero ma con qualcosa a media distanza
        } else {
            rigaMappa += " "; // Spazio completamente libero
        }
    }
    brick.showString(rigaMappa, y + 2);
}

brick.showString("Mappatura completata!", 7);
```

## Conclusione

I cicli annidati sono uno strumento potente per affrontare problemi complessi nella programmazione dei robot EV3. Permettono di implementare:

1. **Pattern di movimento complessi**: griglia, spirale, zigzag, ecc.
2. **Algoritmi di ricerca**: trovare oggetti o percorsi in un ambiente
3. **Calibrazione multi-parametro**: testare combinazioni di velocità, durate, distanze, ecc.
4. **Feedback multi-livello**: creare pattern di suoni, luci o movimenti
5. **Mapping dell'ambiente**: esplorare e mappare lo spazio circostante

Tuttavia, è importante usarli con attenzione, considerando il numero totale di iterazioni e cercando di ottimizzare il codice quando possibile, soprattutto per le limitazioni hardware del robot EV3.

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Il ciclo for](02-For.md)
- [➡️ Istruzioni break e continue](04-Break-Continue.md)