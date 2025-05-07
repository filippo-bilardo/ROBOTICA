# Modulo 4: Cicli e Iterazioni

## Introduzione
In questo modulo esploreremo i cicli e le strutture iterative in JavaScript, elementi fondamentali per eseguire operazioni ripetute e creare comportamenti persistenti nei robot Lego EV3. Le strutture di iterazione permettono di eseguire blocchi di codice più volte, consentendo ai robot di monitorare continuamente l'ambiente e reagire in modo appropriato.

## Contenuti del Modulo

### Concetti Teorici
1. [Il ciclo while e do-while](01-While-DoWhile.md)
2. [Il ciclo for](02-For.md)
3. [Cicli annidati](03-CicliAnnidati.md)
4. [Istruzioni break e continue](04-Break-Continue.md)
5. [La funzione forever e il polling](05-Forever-Polling.md)

### Esempi Pratici
Nella cartella `esempi` troverai:
- `01_While.js`: Utilizzo del ciclo while per il controllo continuo del robot
- `02_For.js`: Utilizzo del ciclo for per eseguire sequenze precise di movimenti
- `03_CicliAnnidati.js`: Implementazione di pattern di movimento complessi con cicli annidati
- `04_BreakContinue.js`: Utilizzo di break e continue per gestire interruzioni e casi speciali
- `05_Forever.js`: Implementazione di comportamenti persistenti con la funzione forever

## Applicazione nel Robot EV3

I cicli sono componenti cruciali nella programmazione robotica:
- Permettono ai robot di monitorare continuamente i sensori
- Consentono di eseguire movimenti ripetuti o sequenze di azioni
- Facilitano l'implementazione di pattern di navigazione
- Sono essenziali per creare comportamenti reattivi persistenti

## Esercitazioni

1. **Pattugliatore Perimetrale**: Crea un programma che faccia muovere il robot lungo un percorso rettangolare definito, utilizzando i cicli for per gestire il numero di lati e le rotazioni.

2. **Rilevatore di Ostacoli**: Implementa un programma che utilizzi un ciclo while per monitorare continuamente il sensore ultrasonico e reagire quando rileva un ostacolo entro una certa distanza.

3. **Seguilinea Avanzato**: Crea un robot che segua una linea nera utilizzando il sensore di colore, e implementa interruzioni specifiche (con break) quando rileva determinati colori che segnalano azioni speciali.

## Risorse Aggiuntive
- [Documentazione JavaScript sui Cicli](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration)
- [MakeCode - Loop Constructs](https://makecode.mindstorms.com/)

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Strutture di Controllo e Condizioni](../03-StruttureControllo-Condizioni/README.md)
- [➡️ Funzioni e Modularità](../05-Funzioni-Modularita/README.md)