let baseSpeed = 30; // Velocità base del robot
let turnSpeed = 20; // Velocità di rotazione per il seguilinea
let threshold = 30; // Soglia del sensore di luce per rilevare la linea
let obstacleThreshold = 10; // Distanza in cm per rilevare un ostacolo
let isAvoiding = false; // Flag per tenere traccia dello stato di evitamento ostacoli

// Configurazione iniziale - Impostazione delle porte dei sensori e motori
// Assumiamo: sensore di colore sulla porta 1, sensore ultrasuoni sulla porta 2
// Motore sinistro sulla porta A, motore destro sulla porta B

brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
    // Avvio del programma con il pulsante Enter
    brick.showString("Robot in esecuzione", 1);
    control.runInParallel(function() {
        // Loop principale del programma
        while (true) {
            if (!isAvoiding) {
                followLine();
            }
            checkForObstacles();
        }
    });
});

// Funzione per seguire la linea
function followLine() {
    // Lettura del valore di riflettanza del sensore di colore
    let reflectance = sensors.color1.light(LightIntensityMode.Reflected);
    
    // Decisione basata sul valore di riflettanza
    if (reflectance < threshold) {
        // Sulla linea nera (valore basso = scuro)
        // Vai dritto
        motors.largeA.run(baseSpeed);
        motors.largeB.run(baseSpeed);
        brick.showString("Linea    ", 2);
    } else {
        // Fuori dalla linea nera (valore alto = chiaro)
        // Cerca la linea con un movimento di rotazione
        motors.largeA.run(baseSpeed + turnSpeed);
        motors.largeB.run(baseSpeed - turnSpeed);
        brick.showString("Cerco linea", 2);
    }
}

// Funzione per controllare la presenza di ostacoli
function checkForObstacles() {
    // Lettura della distanza dal sensore a ultrasuoni
    let distance = sensors.ultrasonic2.distance();
    
    // Se rileva un ostacolo
    if (distance < obstacleThreshold) {
        isAvoiding = true;
        brick.showString("Ostacolo!", 3);
        
        // Ferma il robot
        motors.largeA.stop();
        motors.largeB.stop();
        pause(500);
        
        // Procedura di evitamento ostacoli
        avoidObstacle();
        
        isAvoiding = false;
        brick.showString("          ", 3);
    }
}

// Funzione per evitare un ostacolo
function avoidObstacle() {
    // Memorizza il valore di luce corrente per riprendere la linea dopo
    let currentLight = sensors.color1.light(LightIntensityMode.Reflected);
    
    // Fase 1: Ruota a destra (90 gradi)
    motors.largeA.run(baseSpeed);
    motors.largeB.run(-baseSpeed);
    pause(1000); // Regolare in base al robot per ottenere circa 90°
    
    // Fase 2: Avanza oltre l'ostacolo
    motors.largeA.run(baseSpeed);
    motors.largeB.run(baseSpeed);
    pause(2000); // Regolare in base alla dimensione prevista dell'ostacolo
    
    // Fase 3: Ruota a sinistra (90 gradi)
    motors.largeA.run(-baseSpeed);
    motors.largeB.run(baseSpeed);
    pause(1000); // Regolare in base al robot per ottenere circa 90°
    
    // Fase 4: Avanza per cercare di ritrovare la linea
    motors.largeA.run(baseSpeed);
    motors.largeB.run(baseSpeed);
    
    // Fase 5: Cerca la linea
    let timeout = 0;
    while (timeout < 5000) { // Massimo 5 secondi per trovare la linea
        let reflectance = sensors.color1.light(LightIntensityMode.Reflected);
        
        // Se troviamo una condizione simile a quella prima dell'evitamento
        if (Math.abs(reflectance - currentLight) < 10) {
            break;
        }
        
        pause(100);
        timeout += 100;
    }
    
    // Se non trova la linea entro il timeout, ruota e cerca in altre direzioni
    if (timeout >= 5000) {
        searchForLine();
    }
}

// Funzione per cercare la linea in modo più aggressivo
function searchForLine() {
    brick.showString("Cerco linea", 3);
    
    // Prima cerca ruotando a sinistra per 180 gradi
    motors.largeA.run(-baseSpeed);
    motors.largeB.run(baseSpeed);
    
    let found = false;
    let startTime = control.millis();
    
    // Cerca per massimo 3 secondi
    while (control.millis() - startTime < 3000 && !found) {
        let reflectance = sensors.color1.light(LightIntensityMode.Reflected);
        if (reflectance < threshold) {
            found = true;
            break;
        }
        pause(20);
    }
    
    // Se non trovata, cerca ruotando a destra per 360 gradi
    if (!found) {
        motors.largeA.run(baseSpeed);
        motors.largeB.run(-baseSpeed);
        
        startTime = control.millis();
        
        // Cerca per massimo 6 secondi (tempo per una rotazione completa)
        while (control.millis() - startTime < 6000 && !found) {
            let reflectance = sensors.color1.light(LightIntensityMode.Reflected);
            if (reflectance < threshold) {
                found = true;
                break;
            }
            pause(20);
        }
    }
    
    // Ferma i motori
    motors.largeA.stop();
    motors.largeB.stop();
    
    // Messaggio sullo stato
    if (found) {
        brick.showString("Linea trovata!", 3);
    } else {
        brick.showString("Linea persa!", 3);
        // In caso estremo, torna indietro
        goBackToStart();
    }
}

// Funzione di emergenza per tornare al punto di partenza
function goBackToStart() {
    // Ruota di 180 gradi
    motors.largeA.run(baseSpeed);
    motors.largeB.run(-baseSpeed);
    pause(2000); // Tempo per una rotazione di 180 gradi circa
    
    // Vai avanti fino a trovare la linea
    motors.largeA.run(baseSpeed);
    motors.largeB.run(baseSpeed);
    
    let timeout = 0;
    while (timeout < 10000) { // Massimo 10 secondi
        let reflectance = sensors.color1.light(LightIntensityMode.Reflected);
        if (reflectance < threshold) {
            break;
        }
        pause(100);
        timeout += 100;
    }
}

// Gestione degli errori e funzione di stop
brick.buttonEsc.onEvent(ButtonEvent.Pressed, function () {
    motors.largeA.stop();
    motors.largeB.stop();
    brick.showString("Programma fermato", 1);
    control.reset(); // Reset del programma
});

// Calibrazione dei sensori
brick.buttonLeft.onEvent(ButtonEvent.Pressed, function () {
    brick.showString("Calibrazione...", 1);
    
    // Legge il valore su superficie chiara
    brick.showString("Posiziona su superficie chiara", 2);
    pause(3000);
    let lightValue = sensors.color1.light(LightIntensityMode.Reflected);
    
    // Legge il valore sulla linea scura
    brick.showString("Posiziona sulla linea nera", 2);
    pause(3000);
    let darkValue = sensors.color1.light(LightIntensityMode.Reflected);
    
    // Calcola la soglia come media tra chiaro e scuro
    threshold = (lightValue + darkValue) / 2;
    
    brick.showString("Calibrazione completata", 1);
    brick.showString("Soglia: " + threshold, 2);
    pause(2000);
});

// Funzione per modificare le velocità
brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {
    baseSpeed += 5;
    if (baseSpeed > 50) {
        baseSpeed = 20;
    }
    brick.showString("Velocità: " + baseSpeed, 2);
    pause(1000);
});

// Inizializzazione
brick.showString("Premi ENTER per iniziare", 1);
brick.showString("SX: calibra, DX: velocità", 2);