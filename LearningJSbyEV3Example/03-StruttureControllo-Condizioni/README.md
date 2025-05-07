# Modulo 3: Strutture di Controllo e Condizioni

## Introduzione
In questo modulo esploreremo le strutture di controllo e le condizioni in JavaScript, elementi fondamentali per creare programmi che possano prendere decisioni ed eseguire diverse azioni in base a specifiche condizioni. Applicando questi concetti ai robot Lego EV3, potrai creare comportamenti intelligenti e reattivi.

## Contenuti del Modulo

### Concetti Teorici
1. [Istruzioni Condizionali: if, else if, else](01-IstruzioniCondizionali.md)
2. [Operatori di Confronto e Logici](02-OperatoriConfrontoLogici.md)
3. [Switch Statement](03-SwitchStatement.md)
4. [Espressioni Condizionali (Operatore Ternario)](04-EspressioniCondizionali.md)
5. [Truth and Falsy Values](05-TruthFalsyValues.md)

### Esempi Pratici
Nella cartella `esempi` troverai:
- `01_IfElse.js`: Utilizzo di if/else per controllare il comportamento del robot
- `02_OperatoriLogici.js`: Combinazione di condizioni con operatori logici
- `03_Switch.js`: Utilizzo dello switch per gestire diversi stati del robot
- `04_OperatoreTernario.js`: Semplificazione delle condizioni con l'operatore ternario
- `05_ControlloSensori.js`: Utilizzo delle condizioni per reagire agli input dei sensori

## Applicazione nel Robot EV3

Le strutture di controllo sono essenziali per la programmazione robotica:
- Permettono al robot di reagire a diverse situazioni ambientali
- Consentono di implementare comportamenti decisionali
- Facilitano la gestione degli input dei sensori
- Rendono il comportamento del robot più intelligente e adattivo

## Esercitazioni

1. **Navigatore Intelligente**: Crea un programma che faccia muovere il robot in base ai valori del sensore a ultrasuoni. Se rileva un ostacolo a meno di 20 cm, deve girare a destra; se l'ostacolo è a meno di 10 cm, deve tornare indietro.

2. **Seguire una Linea**: Implementa un algoritmo che utilizza il sensore di colore per seguire una linea nera su sfondo bianco, prendendo decisioni in base al colore rilevato.

3. **Robot Interattivo**: Crea un'interfaccia utente sul display EV3 che permetta all'utente di selezionare diverse modalità di funzionamento, implementando la logica con strutture if/else o switch.

## Risorse Aggiuntive
- [Documentazione JavaScript sulle Strutture di Controllo](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [MakeCode - Conditional Statements](https://makecode.mindstorms.com/)

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Variabili, Tipi di Dati e Operatori](../02-Variabili-TipiDati-Operatori/README.md)
- [➡️ Cicli e Iterazioni](../04-Cicli-Iterazioni/README.md)