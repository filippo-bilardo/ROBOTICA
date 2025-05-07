// example04_nested_loops.js - Esempi di cicli annidati con EV3
// Filippo Bilardo - Copyright 2025 - License MIT

// Importa le librerie necessarie
const { brick, buttons, display, motor, sound } = require('ev3');

// Funzione principale
async function main() {
    // Pulisci il display
    display.clear();
    display.text('Pattern di movimento', { x: 0, y: 0 });
    display.text('con cicli annidati', { x: 0, y: 30 });
    
    await sound.tone(1000, 500);
    await buttons.waitForAnyPress();
    
    // Configura i motori
    const leftMotor = motor.B;
    const rightMotor = motor.C;
    
    try {
        // Inizia con un pattern a griglia
        display.clear();
        display.text('Pattern a griglia 3x3', { x: 0, y: 0 });
        await buttons.waitForAnyPress();
        
        // Parametri per il pattern a griglia
        const gridSize = 3;
        const moveTime = 1000;  // Tempo di movimento in ms
        const turnTime = 800;   // Tempo per rotazione di 90 gradi
        
        // Ciclo annidato per il pattern a griglia
        for (let row = 0; row < gridSize; row++) {
            // Direzione alternata per righe pari e dispari (pattern a serpentina)
            const direction = row % 2 === 0 ? 1 : -1;
            
            for (let col = 0; col < gridSize; col++) {
                // Calcola la posizione effettiva nella colonna in base alla direzione
                const actualCol = direction === 1 ? col : gridSize - 1 - col;
                
                // Visualizza la posizione corrente
                display.clear();
                display.text(`Posizione: (${row}, ${actualCol})`, { x: 0, y: 0 });
                
                // Ferma e attendi brevemente a ogni punto della griglia
                leftMotor.stop();
                rightMotor.stop();
                await sound.tone(500 + row * 100 + actualCol * 50, 200);
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Muovi alla prossima posizione nella riga (se non sei all'ultima colonna)
                if ((direction === 1 && col < gridSize - 1) || 
                    (direction === -1 && col < gridSize - 1)) {
                    leftMotor.setPower(50);
                    rightMotor.setPower(50);
                    await new Promise(resolve => setTimeout(resolve, moveTime));
                }
            }
            
            // Se non siamo all'ultima riga, preparati per la riga successiva
            if (row < gridSize - 1) {
                // Gira a destra o sinistra in base alla direzione corrente
                const leftPower = 50;
                const rightPower = -50;
                
                // Prima rotazione (90 gradi)
                leftMotor.setPower(leftPower);
                rightMotor.setPower(rightPower);
                await new Promise(resolve => setTimeout(resolve, turnTime));
                
                // Avanza di un lato
                leftMotor.setPower(50);
                rightMotor.setPower(50);
                await new Promise(resolve => setTimeout(resolve, moveTime));
                
                // Seconda rotazione (90 gradi nella stessa direzione)
                leftMotor.setPower(leftPower);
                rightMotor.setPower(rightPower);
                await new Promise(resolve => setTimeout(resolve, turnTime));
            }
        }
        
        // Ferma i motori
        leftMotor.stop();
        rightMotor.stop();
        
        // Pattern a spirale
        await new Promise(resolve => setTimeout(resolve, 1000));
        display.clear();
        display.text('Pattern a spirale', { x: 0, y: 0 });
        await buttons.waitForAnyPress();
        
        // Parametri per il pattern a spirale
        const numTurns = 4;
        
        // Cicli annidati per il pattern a spirale
        for (let turn = 1; turn <= numTurns; turn++) {
            // Calcola la durata per questo giro (aumenta con ogni giro)
            const duration = turn * 400;  // ms
            
            // Per ogni giro, esegui 4 lati (un quadrato)
            for (let side = 0; side < 4; side++) {
                // Mostra informazioni sul display
                display.clear();
                display.text(`Giro: ${turn}/${numTurns}`, { x: 0, y: 0 });
                display.text(`Lato: ${side + 1}/4`, { x: 0, y: 30 });
                display.text(`Durata: ${duration} ms`, { x: 0, y: 60 });
                
                // Calcola la potenza in base al lato
                let leftPow, rightPow;
                
                // Utilizza potenze diverse per creare curve più morbide
                switch (side) {
                    case 0: // Primo lato: leggermente curvo a destra
                        leftPow = 60;
                        rightPow = 55;
                        break;
                    case 1: // Secondo lato: curva a destra
                        leftPow = 60;
                        rightPow = 30;
                        break;
                    case 2: // Terzo lato: leggermente curvo a destra
                        leftPow = 55;
                        rightPow = 60;
                        break;
                    case 3: // Quarto lato: curva a destra
                        leftPow = 30;
                        rightPow = 60;
                        break;
                }
                
                // Esegui il movimento per questo lato
                leftMotor.setPower(leftPow);
                rightMotor.setPower(rightPow);
                
                // Emetti un suono con frequenza basata sul giro e sul lato
                await sound.tone(400 + turn * 100 + side * 50, 200);
                
                // Mantieni il movimento per la durata calcolata
                await new Promise(resolve => setTimeout(resolve, duration));
            }
        }
        
        // Ferma i motori
        leftMotor.stop();
        rightMotor.stop();
        
        // Pattern sonoro complesso con cicli annidati su 3 livelli
        display.clear();
        display.text('Pattern sonoro', { x: 0, y: 0 });
        display.text('con cicli annidati', { x: 0, y: 30 });
        await buttons.waitForAnyPress();
        
        // Parametri per il pattern sonoro
        const baseFreqs = [262, 330, 392, 494]; // Frequenze base (Do, Mi, Sol, Si)
        const durations = [100, 200, 300];      // Durate in ms
        
        // Per ogni durata...
        for (let d = 0; d < durations.length; d++) {
            const duration = durations[d];
            
            // Per ogni frequenza base...
            for (let f = 0; f < baseFreqs.length; f++) {
                const freq = baseFreqs[f];
                
                // Mostra informazioni sul display
                display.clear();
                display.text("Pattern Sonoro", { x: 0, y: 0 });
                display.text(`Durata: ${duration} ms`, { x: 0, y: 30 });
                display.text(`Frequenza: ${freq} Hz`, { x: 0, y: 60 });
                
                // Crea un pattern di tre note basate sulla frequenza base
                for (let mult = 1; mult <= 3; mult++) {
                    const noteFreq = Math.round(freq * mult / 2);
                    display.text(`Nota: ${noteFreq} Hz`, { x: 0, y: 90 });
                    
                    // Riproduci la nota
                    await sound.tone(noteFreq, duration);
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // Pausa più lunga tra i set di durate diverse
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Conclusione
        display.clear();
        display.text('Esempio completato!', { x: 0, y: 30 });
        await sound.tone(1000, 500);
        await sound.tone(1200, 500);
        
    } catch (error) {
        // Gestione degli errori
        display.clear();
        display.text('Errore:', { x: 0, y: 0 });
        display.text(error.message, { x: 0, y: 30 });
        
    } finally {
        // Assicurati che i motori siano fermi
        leftMotor.stop();
        rightMotor.stop();
    }
}

// Avvia il programma principale
main().catch(error => {
    console.error('Errore nel programma principale:', error);
});