// 03_Operatori.js
// Questo esempio mostra come utilizzare gli operatori in JavaScript
// per controllare il robot EV3 in modo più efficace

// Definiamo alcune variabili iniziali per gli esempi
let velocitaBase = 50;
let distanza = 0;
let batteria = 100;
let operazioneCorrente = "Inizio";

// Funzione per aggiornare il display
function aggiornaDisplay() {
    brick.clearScreen();
    brick.showString("Demo Operatori JS", 1);
    brick.showString(`Operazione: ${operazioneCorrente}`, 2);
    brick.showString(`Velocita: ${velocitaBase}`, 3);
    brick.showString(`Distanza: ${distanza} cm`, 4);
    brick.showString(`Batteria: ${batteria}%`, 5);
    brick.showString("Usa i tasti per testare", 8);
}

// Visualizzazione iniziale
aggiornaDisplay();

// 1. OPERATORI ARITMETICI - Pulsante Su
brick.buttonUp.onEvent(ButtonEvent.Pressed, function () {
    operazioneCorrente = "Operatori Aritmetici";
    aggiornaDisplay();
    pause(1000);
    
    // Addizione
    velocitaBase = velocitaBase + 10;
    operazioneCorrente = "Addizione: +10";
    aggiornaDisplay();
    pause(1000);
    
    // Sottrazione
    velocitaBase = velocitaBase - 5;
    operazioneCorrente = "Sottrazione: -5";
    aggiornaDisplay();
    pause(1000);
    
    // Moltiplicazione
    let velocitaTurbo = velocitaBase * 1.5;
    operazioneCorrente = `Moltiplicazione: *1.5 = ${velocitaTurbo}`;
    aggiornaDisplay();
    pause(1000);
    
    // Divisione
    let velocitaLenta = velocitaBase / 2;
    operazioneCorrente = `Divisione: /2 = ${velocitaLenta}`;
    aggiornaDisplay();
    pause(1000);
    
    // Modulo (resto)
    let resto = velocitaBase % 20;
    operazioneCorrente = `Modulo: %20 = ${resto}`;
    aggiornaDisplay();
    pause(1000);
    
    // Incremento
    velocitaBase++;
    operazioneCorrente = "Incremento: ++";
    aggiornaDisplay();
    pause(1000);
    
    // Decremento
    velocitaBase--;
    operazioneCorrente = "Decremento: --";
    aggiornaDisplay();
    pause(1000);
    
    // Applicazione pratica: muove i motori con velocità calcolata
    operazioneCorrente = "Motori in movimento";
    aggiornaDisplay();
    motors.largeBC.tank(velocitaBase, velocitaBase);
    pause(1000);
    motors.largeBC.stop();
    
    operazioneCorrente = "Operatori Aritmetici";
    aggiornaDisplay();
});

// 2. OPERATORI DI ASSEGNAZIONE - Pulsante Giù
brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    operazioneCorrente = "Operatori Assegnazione";
    aggiornaDisplay();
    pause(1000);
    
    // Assegnazione base
    velocitaBase = 40;
    operazioneCorrente = "Assegnazione: = 40";
    aggiornaDisplay();
    pause(1000);
    
    // Assegnazione con addizione
    velocitaBase += 15;  // Equivale a: velocitaBase = velocitaBase + 15
    operazioneCorrente = "Assegnazione: += 15";
    aggiornaDisplay();
    pause(1000);
    
    // Assegnazione con sottrazione
    velocitaBase -= 5;  // Equivale a: velocitaBase = velocitaBase - 5
    operazioneCorrente = "Assegnazione: -= 5";
    aggiornaDisplay();
    pause(1000);
    
    // Assegnazione con moltiplicazione
    velocitaBase *= 1.1;  // Equivale a: velocitaBase = velocitaBase * 1.1
    operazioneCorrente = `Assegnazione: *= 1.1 = ${velocitaBase.toFixed(1)}`;
    aggiornaDisplay();
    pause(1000);
    
    // Assegnazione con divisione
    velocitaBase /= 2;  // Equivale a: velocitaBase = velocitaBase / 2
    operazioneCorrente = `Assegnazione: /= 2 = ${velocitaBase.toFixed(1)}`;
    aggiornaDisplay();
    
    // Applicazione pratica: calibrazione progressiva
    let calibrazione = 0;
    
    for (let i = 0; i < 5; i++) {
        calibrazione += 2;
        operazioneCorrente = `Calibrazione: +=${calibrazione}`;
        aggiornaDisplay();
        motors.largeBC.tank(velocitaBase, velocitaBase + calibrazione);
        pause(500);
    }
    
    motors.largeBC.stop();
    operazioneCorrente = "Operatori Assegnazione";
    aggiornaDisplay();
});

// 3. OPERATORI DI CONFRONTO - Pulsante Sinistra
brick.buttonLeft.onEvent(ButtonEvent.Pressed, function () {
    operazioneCorrente = "Operatori Confronto";
    aggiornaDisplay();
    pause(1000);
    
    // Simula lettura del sensore di distanza
    distanza = 25;
    aggiornaDisplay();
    pause(1000);
    
    // Uguaglianza (==)
    let distanzaUguale20 = (distanza == 20);
    operazioneCorrente = `Uguale: distanza == 20 -> ${distanzaUguale20}`;
    aggiornaDisplay();
    pause(1500);
    
    // Uguaglianza stretta (===)
    let distanzaStringaUguale = (distanza == "25");  // true (converte tipi)
    let distanzaStringaUgualeStretta = (distanza === "25");  // false (tipi diversi)
    operazioneCorrente = `Uguale: distanza == "25" -> ${distanzaStringaUguale}`;
    aggiornaDisplay();
    pause(1500);
    operazioneCorrente = `Uguale stretta: === "25" -> ${distanzaStringaUgualeStretta}`;
    aggiornaDisplay();
    pause(1500);
    
    // Disuguaglianza (!=)
    let distanzaDiversa30 = (distanza != 30);
    operazioneCorrente = `Diverso: distanza != 30 -> ${distanzaDiversa30}`;
    aggiornaDisplay();
    pause(1500);
    
    // Maggiore (>)
    let distanzaMaggiore20 = (distanza > 20);
    operazioneCorrente = `Maggiore: distanza > 20 -> ${distanzaMaggiore20}`;
    aggiornaDisplay();
    pause(1500);
    
    // Minore (<)
    let distanzaMinore30 = (distanza < 30);
    operazioneCorrente = `Minore: distanza < 30 -> ${distanzaMinore30}`;
    aggiornaDisplay();
    pause(1500);
    
    // Maggiore o uguale (>=)
    let distanzaMaggioreUguale25 = (distanza >= 25);
    operazioneCorrente = `Magg/Uguale: >= 25 -> ${distanzaMaggioreUguale25}`;
    aggiornaDisplay();
    pause(1500);
    
    // Minore o uguale (<=)
    let distanzaMinoreUguale25 = (distanza <= 25);
    operazioneCorrente = `Min/Uguale: <= 25 -> ${distanzaMinoreUguale25}`;
    aggiornaDisplay();
    pause(1500);
    
    // Applicazione pratica: decisioni in base alla distanza
    operazioneCorrente = "Test distanza pratico";
    aggiornaDisplay();
    
    // Simuliamo diverse letture del sensore
    let letture = [5, 15, 25, 35, 45];
    
    for (let i = 0; i < letture.length; i++) {
        distanza = letture[i];
        
        if (distanza < 10) {
            operazioneCorrente = `Dist ${distanza}: Pericolo!`;
            motors.largeBC.stop();
        } else if (distanza <= 20) {
            operazioneCorrente = `Dist ${distanza}: Rallentare`;
            motors.largeBC.tank(30, 30);
        } else if (distanza <= 30) {
            operazioneCorrente = `Dist ${distanza}: Normale`;
            motors.largeBC.tank(50, 50);
        } else {
            operazioneCorrente = `Dist ${distanza}: Veloce`;
            motors.largeBC.tank(70, 70);
        }
        
        aggiornaDisplay();
        pause(1000);
    }
    
    motors.largeBC.stop();
    operazioneCorrente = "Operatori Confronto";
    aggiornaDisplay();
});

// 4. OPERATORI LOGICI - Pulsante Destra
brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {
    operazioneCorrente = "Operatori Logici";
    aggiornaDisplay();
    pause(1000);
    
    // Simuliamo vari stati del robot
    distanza = 15;
    batteria = 25;
    aggiornaDisplay();
    pause(1000);
    
    // Operatore AND (&&)
    let percorsoSicuro = distanza > 10 && batteria > 20;
    operazioneCorrente = `AND: dist>10 && batt>20 -> ${percorsoSicuro}`;
    aggiornaDisplay();
    pause(1500);
    
    // Operatore OR (||)
    let necessitaFermarsi = distanza < 10 || batteria < 15;
    operazioneCorrente = `OR: dist<10 || batt<15 -> ${necessitaFermarsi}`;
    aggiornaDisplay();
    pause(1500);
    
    // Operatore NOT (!)
    let percorsoNonSicuro = !percorsoSicuro;
    operazioneCorrente = `NOT: !percorsoSicuro -> ${percorsoNonSicuro}`;
    aggiornaDisplay();
    pause(1500);
    
    // Espressioni logiche complesse
    let puoContinuare = (distanza >= 10 && distanza < 50) && batteria >= 20;
    operazioneCorrente = `Complessa: Può continuare -> ${puoContinuare}`;
    aggiornaDisplay();
    pause(1500);
    
    // Applicazione pratica: decisioni di navigazione
    operazioneCorrente = "Test navigazione";
    aggiornaDisplay();
    
    // Simuliamo diverse condizioni
    const scenari = [
        { distanza: 5, batteria: 30, sensore: false },
        { distanza: 20, batteria: 10, sensore: false },
        { distanza: 30, batteria: 30, sensore: true },
        { distanza: 15, batteria: 25, sensore: false }
    ];
    
    for (let i = 0; i < scenari.length; i++) {
        distanza = scenari[i].distanza;
        batteria = scenari[i].batteria;
        let sensoreToccoPremuto = scenari[i].sensore;
        
        // Utilizziamo operatori logici per decidere
        let deveArrendersi = sensoreToccoPremuto || distanza < 10 || batteria < 15;
        let puoProcedereVeloce = !deveArrendersi && distanza > 20 && batteria > 25;
        
        operazioneCorrente = `Scenario ${i+1}: `;
        
        if (deveArrendersi) {
            operazioneCorrente += "STOP";
            motors.largeBC.stop();
        } else if (puoProcedereVeloce) {
            operazioneCorrente += "Veloce";
            motors.largeBC.tank(70, 70);
        } else {
            operazioneCorrente += "Normale";
            motors.largeBC.tank(40, 40);
        }
        
        aggiornaDisplay();
        pause(1500);
    }
    
    motors.largeBC.stop();
    operazioneCorrente = "Operatori Logici";
    aggiornaDisplay();
});

// 5. ALTRI OPERATORI - Pulsante Centrale
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
    operazioneCorrente = "Altri Operatori";
    aggiornaDisplay();
    pause(1000);
    
    // Operatore ternario
    distanza = 25;
    velocitaBase = distanza < 20 ? 30 : 60;
    operazioneCorrente = `Ternario: dist<20 ? 30 : 60 = ${velocitaBase}`;
    aggiornaDisplay();
    pause(1500);
    
    // Operatore typeof
    let tipoVelocita = typeof velocitaBase;
    operazioneCorrente = `typeof velocita = ${tipoVelocita}`;
    aggiornaDisplay();
    pause(1500);
    
    // Concatenazione stringhe
    let nomeRobot = "EV3";
    let messaggioCompleto = "Robot " + nomeRobot + " pronto!";
    operazioneCorrente = messaggioCompleto;
    aggiornaDisplay();
    pause(1500);
    
    // Template literals
    let messaggioTemplate = `Distanza: ${distanza}cm, Velocità: ${velocitaBase}`;
    operazioneCorrente = messaggioTemplate;
    aggiornaDisplay();
    pause(1500);
    
    // Dimostrazione pratica: controllo adattivo della velocità
    operazioneCorrente = "Controllo adattivo";
    aggiornaDisplay();
    
    for (let i = 0; i < 10; i++) {
        // Simuliamo distanze variabili
        distanza = 10 + i * 5;  // 10, 15, 20, ..., 55
        
        // Calcolo della velocità con operatori
        let velocitaCalcolata = Math.min(30 + distanza, 100);
        let differenzaSterzo = (distanza < 30) ? 10 : 0;
        
        operazioneCorrente = `Dist: ${distanza}, Vel: ${velocitaCalcolata}`;
        aggiornaDisplay();
        
        // A seconda della distanza, modifichiamo anche la direzione
        let velSinistra = velocitaCalcolata - differenzaSterzo;
        let velDestra = velocitaCalcolata + differenzaSterzo;
        
        motors.largeBC.tank(velSinistra, velDestra);
        pause(500);
    }
    
    motors.largeBC.stop();
    operazioneCorrente = "Demo completata";
    aggiornaDisplay();
});