// 04_Espressioni.js
// Questo esempio mostra come utilizzare espressioni complesse in JavaScript
// per controllare il comportamento del robot EV3 in modo più efficiente e flessibile

// Variabili per lo stato del robot
let velocitaBase = 50;
let distanza = 30;
let luminosita = 50;
let batteria = 85;
let sensoreTocco = false;
let modoOperativo = "standby";
let contatore = 0;

// Funzione di aggiornamento del display
function aggiornaDisplay() {
    brick.clearScreen();
    brick.showString("Demo Espressioni JS", 1);
    brick.showString(`Modo: ${modoOperativo}`, 2);
    brick.showString(`Dist: ${distanza} cm`, 3);
    brick.showString(`Luce: ${luminosita}%`, 4);
    brick.showString(`Batt: ${batteria}%`, 5);
    brick.showString(`Vel: ${velocitaBase}`, 6);
    brick.showString(`Cont: ${contatore}`, 7);
    brick.showString("Usa i tasti per testare", 8);
}

// Inizializza il display
aggiornaDisplay();

// 1. ESPRESSIONI ARITMETICHE - Pulsante Su
brick.buttonUp.onEvent(ButtonEvent.Pressed, function () {
    modoOperativo = "Espressioni Aritmetiche";
    aggiornaDisplay();
    pause(1000);
    
    // Espressione aritmetica semplice
    let somma = velocitaBase + 20;
    modoOperativo = `${velocitaBase} + 20 = ${somma}`;
    aggiornaDisplay();
    pause(1500);
    
    // Espressione con precedenza
    let risultato1 = 2 + 3 * 4;      // 3*4 ha precedenza: 2 + 12 = 14
    modoOperativo = `2 + 3 * 4 = ${risultato1}`;
    aggiornaDisplay();
    pause(1500);
    
    // Espressione con parentesi per modificare la precedenza
    let risultato2 = (2 + 3) * 4;    // Le parentesi hanno precedenza: 5 * 4 = 20
    modoOperativo = `(2 + 3) * 4 = ${risultato2}`;
    aggiornaDisplay();
    pause(1500);
    
    // Espressione aritmetica complessa
    let espressione1 = 10 + 5 * (velocitaBase - 20) / 2;
    modoOperativo = `Espressione complessa = ${espressione1}`;
    aggiornaDisplay();
    pause(1500);
    
    // Calcolo della velocità basato su espressioni
    let fattoreBatteria = batteria / 100;  // 0.85
    let fattoreDistanza = Math.min(distanza / 50, 1);  // 0.6
    
    // Calcolo velocità con espressione complessa
    let velocitaCalcolata = velocitaBase * fattoreBatteria * fattoreDistanza;
    velocitaCalcolata = Math.round(velocitaCalcolata);
    
    modoOperativo = `Vel. calcolata = ${velocitaCalcolata}`;
    aggiornaDisplay();
    pause(1500);
    
    // Applicazione pratica: movimenti usando espressioni
    modoOperativo = "Velocità adattiva";
    aggiornaDisplay();
    
    // Movimento in avanti con velocità calcolata
    motors.largeBC.tank(velocitaCalcolata, velocitaCalcolata);
    pause(2000);
    motors.largeBC.stop();
    
    // Calcolo del tempo di rotazione basato su espressioni
    let angoloRotazione = 90;  // gradi
    let tempoPerGrado = 10;   // millisecondi per grado (approssimativo)
    let tempoRotazione = angoloRotazione * tempoPerGrado;
    
    modoOperativo = `Rotazione: ${angoloRotazione}° (${tempoRotazione}ms)`;
    aggiornaDisplay();
    
    // Rotazione con tempo calcolato dall'espressione
    motors.largeBC.tank(velocitaCalcolata, -velocitaCalcolata);
    pause(tempoRotazione);
    motors.largeBC.stop();
    
    modoOperativo = "Espressioni Aritmetiche";
    aggiornaDisplay();
});

// 2. ESPRESSIONI LOGICHE - Pulsante Giù
brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    modoOperativo = "Espressioni Logiche";
    aggiornaDisplay();
    pause(1000);
    
    // Espressione logica semplice
    let distanzaSicura = distanza > 20;
    modoOperativo = `distanza > 20 = ${distanzaSicura}`;
    aggiornaDisplay();
    pause(1500);
    
    // Espressione logica composta con AND
    let condizioneMovimento = distanza > 20 && batteria > 25;
    modoOperativo = `Dist>20 && Batt>25 = ${condizioneMovimento}`;
    aggiornaDisplay();
    pause(1500);
    
    // Espressione logica composta con OR
    let necessitaStop = distanza < 10 || batteria < 15 || sensoreTocco;
    modoOperativo = `Stop necessario = ${necessitaStop}`;
    aggiornaDisplay();
    pause(1500);
    
    // Espressione logica complessa con parentesi
    let espLogicaComplessa = (distanza > 15 && distanza < 40) && (batteria > 30 || !sensoreTocco);
    modoOperativo = `Espressione complessa = ${espLogicaComplessa}`;
    aggiornaDisplay();
    pause(1500);
    
    // Espressione con valutazione lazy (short-circuit)
    // Se la prima condizione è falsa, la seconda non viene valutata
    batteria = 10;  // Simuliamo batteria scarica
    let puoContinuare = batteria > 20 && verificaDistanza();
    
    function verificaDistanza() {
        modoOperativo = "Verifica distanza chiamata";
        aggiornaDisplay();
        return distanza > 15;
    }
    
    modoOperativo = `Lazy eval: ${puoContinuare}`;
    aggiornaDisplay();
    pause(1500);
    
    // Ripristina la batteria
    batteria = 85;
    
    // Applicazione pratica: sistema di decisione
    modoOperativo = "Sistema decisionale";
    aggiornaDisplay();
    pause(1000);
    
    // Simuliamo diverse situazioni
    const situazioni = [
        { dist: 5, luce: 20, batt: 80 },
        { dist: 30, luce: 75, batt: 20 },
        { dist: 25, luce: 40, batt: 90 },
        { dist: 15, luce: 10, batt: 50 }
    ];
    
    for (let i = 0; i < situazioni.length; i++) {
        distanza = situazioni[i].dist;
        luminosita = situazioni[i].luce;
        batteria = situazioni[i].batt;
        
        // Espressioni logiche per decisioni
        let percorsoBloccato = distanza < 10;
        let superficieScura = luminosita < 30;
        let energiaBassa = batteria < 25;
        
        // Espressione logica composta per la decisione finale
        let deveAvanzare = !percorsoBloccato && !energiaBassa;
        let deveGirare = percorsoBloccato || superficieScura;
        
        modoOperativo = `Situazione ${i+1}: `;
        
        if (deveGirare && deveAvanzare) {
            // Questa condizione dimostra la complessità delle espressioni logiche
            modoOperativo += "Gira e avanza lento";
            motors.largeBC.tank(20, 40);
        } else if (deveGirare) {
            modoOperativo += "Solo gira";
            motors.largeBC.tank(40, -40);
        } else if (deveAvanzare) {
            modoOperativo += "Avanza normale";
            motors.largeBC.tank(50, 50);
        } else {
            modoOperativo += "Fermo - risparmio energia";
            motors.largeBC.stop();
        }
        
        aggiornaDisplay();
        pause(1500);
    }
    
    motors.largeBC.stop();
    modoOperativo = "Espressioni Logiche";
    aggiornaDisplay();
});

// 3. ESPRESSIONI DI STRINGA - Pulsante Sinistra
brick.buttonLeft.onEvent(ButtonEvent.Pressed, function () {
    modoOperativo = "Espressioni Stringa";
    aggiornaDisplay();
    pause(1000);
    
    // Concatenazione di stringhe semplice
    let nomeRobot = "EV3";
    let messaggio1 = "Robot " + nomeRobot + " pronto";
    modoOperativo = messaggio1;
    aggiornaDisplay();
    pause(1500);
    
    // Template literals (backtick)
    let messaggio2 = `${nomeRobot} - Batteria: ${batteria}%`;
    modoOperativo = messaggio2;
    aggiornaDisplay();
    pause(1500);
    
    // Espressioni all'interno di template literals
    let statoEnergia = batteria > 50 ? "ottima" : "bassa";
    let messaggio3 = `Energia ${statoEnergia} (${batteria}%)`;
    modoOperativo = messaggio3;
    aggiornaDisplay();
    pause(1500);
    
    // Costruzione di messaggi dinamici
    function generaMessaggio(dist, vel) {
        return `Dist: ${dist}cm - Vel: ${vel} - ${categoriaDistanza(dist)}`;
    }
    
    function categoriaDistanza(d) {
        if (d < 10) return "PERICOLO";
        if (d < 30) return "Attenzione";
        return "Sicuro";
    }
    
    // Applicazione pratica: display informativo dinamico
    modoOperativo = "Display dinamico";
    aggiornaDisplay();
    
    // Simuliamo cambiamenti della distanza
    for (let i = 0; i < 5; i++) {
        distanza = 10 * i + 5;  // 5, 15, 25, 35, 45
        velocitaBase = 30 + distanza;
        
        let messaggioGenerato = generaMessaggio(distanza, velocitaBase);
        modoOperativo = messaggioGenerato;
        aggiornaDisplay();
        pause(1500);
    }
    
    modoOperativo = "Espressioni Stringa";
    aggiornaDisplay();
});

// 4. ESPRESSIONI CONDIZIONALI - Pulsante Destra
brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {
    modoOperativo = "Espressioni Condizionali";
    aggiornaDisplay();
    pause(1000);
    
    // Operatore ternario semplice
    distanza = 25;
    let velocitaAdattata = distanza < 20 ? 30 : 60;
    modoOperativo = `Ternario: ${distanza}<20 ? 30:60 = ${velocitaAdattata}`;
    aggiornaDisplay();
    pause(1500);
    
    // Operatore ternario per selezionare messaggi
    let messaggioDistanza = distanza < 10 ? "Troppo vicino!" :
                            distanza < 30 ? "Distanza media" :
                            "Via libera";
    modoOperativo = `Stato: ${messaggioDistanza}`;
    aggiornaDisplay();
    pause(1500);
    
    // Operatore ternario nelle espressioni
    let tempoReazione = (distanza < 15) ? 500 : 
                        (batteria < 30) ? 1500 : 1000;
    modoOperativo = `Tempo reazione: ${tempoReazione}ms`;
    aggiornaDisplay();
    pause(1500);
    
    // Applicazione pratica: controllo adattivo con espressioni condizionali
    modoOperativo = "Controllo adattivo";
    aggiornaDisplay();
    
    // Simuliamo diverse letture di distanza e luminosità
    const letture = [
        { dist: 5, luce: 80 },
        { dist: 30, luce: 20 },
        { dist: 15, luce: 50 },
        { dist: 40, luce: 10 }
    ];
    
    for (let i = 0; i < letture.length; i++) {
        distanza = letture[i].dist;
        luminosita = letture[i].luce;
        
        // Uso di operatori ternari per calcolare parametri
        let velocitaCalcolata = distanza < 10 ? 20 : 
                                distanza < 30 ? 40 : 70;
        
        let differenzaSterzo = luminosita < 30 ? 20 : 
                             luminosita > 70 ? -20 : 0;
        
        modoOperativo = `Vel:${velocitaCalcolata} Diff:${differenzaSterzo}`;
        aggiornaDisplay();
        
        // Applicazione dei valori calcolati
        motors.largeBC.tank(
            velocitaCalcolata - differenzaSterzo, 
            velocitaCalcolata + differenzaSterzo
        );
        pause(1500);
    }
    
    motors.largeBC.stop();
    modoOperativo = "Espressioni Condizionali";
    aggiornaDisplay();
});

// 5. COMBINAZIONE DI ESPRESSIONI - Pulsante Centrale
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
    modoOperativo = "Espressioni Combinate";
    aggiornaDisplay();
    pause(1000);
    
    // Reset delle variabili per la dimostrazione
    distanza = 30;
    luminosita = 50;
    batteria = 75;
    contatore = 0;
    
    // Sistema di controllo basato su molteplici espressioni
    function controlloIntegrato() {
        // Incremento contatore con espressione
        contatore = (contatore + 1) % 100;
        
        // Aggiorniamo il display
        aggiornaDisplay();
        
        // Fattori di decisione calcolati con espressioni aritmetiche
        let fattoreVelocita = 0.3 + (batteria / 100) * 0.7;  // 0.3-1.0 basato sulla batteria
        let fattoreDistanza = Math.min(distanza / 50, 1);    // 0-1 basato sulla distanza
        
        // Espressione aritmetica complessa per calcolare la velocità
        let velocitaBase = Math.round(70 * fattoreVelocita * fattoreDistanza);
        
        // Espressione logica per decidere se muoversi
        let deveMovere = distanza > 10 && batteria > 20 && !sensoreTocco;
        
        // Espressione ternaria per decidere direzione
        let differenzaSterzo = luminosita < 40 ? 15 : 
                              luminosita > 60 ? -15 : 0;
        
        // Output sotto forma di stringa con template literal
        let stato = deveMovere ? 
            `Movimento V:${velocitaBase} D:${differenzaSterzo}` : 
            "Fermo per sicurezza";
            
        modoOperativo = stato;
        
        // Applicazione delle decisioni
        if (deveMovere) {
            // Espressioni aritmetiche per calcolare velocità motori
            let velocitaSinistra = Math.max(0, Math.min(100, velocitaBase - differenzaSterzo));
            let velocitaDestra = Math.max(0, Math.min(100, velocitaBase + differenzaSterzo));
            
            motors.largeBC.tank(velocitaSinistra, velocitaDestra);
        } else {
            motors.largeBC.stop();
        }
    }
    
    // Eseguiamo il sistema integrato per qualche iterazione
    // Simulando cambiamenti nei sensori
    for (let i = 0; i < 10; i++) {
        // Valori simulati che cambiano ad ogni iterazione
        distanza = Math.max(5, distanza + Math.floor(Math.random() * 10) - 5);
        luminosita = Math.max(5, Math.min(95, luminosita + Math.floor(Math.random() * 20) - 10));
        batteria = Math.max(1, batteria - 1);  // Piccola diminuzione della batteria
        
        // Chiamiamo il nostro sistema di controllo
        controlloIntegrato();
        pause(1000);
    }
    
    motors.largeBC.stop();
    modoOperativo = "Demo completata";
    aggiornaDisplay();
});