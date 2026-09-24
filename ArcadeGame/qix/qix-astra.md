# Qix — manuale originale e note della ricostruzione

codex resume 01a09722-93da-75a3-aab8-2a7a5a2b4e0c

Questo documento accompagna [qix-astra.html](qix-astra.html). Contiene una sintesi in italiano delle informazioni consultate, con riferimenti alle pagine; non è una trascrizione integrale del manuale.

## Informazioni dal manuale Taito

Fonte primaria: **QIX — Operation, Maintenance and Service Manual, Complete with Illustrated Parts Catalog**, Taito America. La scansione consultata contiene 60 pagine PDF; la pagina stampata 1 corrisponde alla pagina PDF 2. [Manuale originale, frontespizio](https://www.gamesdatabase.org/Media/SYSTEM/Arcade/Manual/formated/Qix_-_1981_-_Taito.pdf#page=2).

Il cabinato prevede uno o due giocatori. Si conquista territorio evitando Qix e Sparx; una soglia determina il passaggio alla schermata successiva. Il disegno lento raddoppia i punti. Fermarsi su un tracciato incompiuto accende una miccia; attraversare il proprio percorso è vietato. Una barra rossa annuncia ulteriori Sparx; un allarme segnala i Super Sparx, più aggressivi. [§1.2, pagina stampata 6](https://www.gamesdatabase.org/Media/SYSTEM/Arcade/Manual/formated/Qix_-_1981_-_Taito.pdf#page=7).

| Regolazione | Valori documentati | Fabbrica |
| --- | --- | --- |
| Area richiesta | 0–99% | 75% |
| Timer Sparx | 0–99 secondi | 37 secondi |
| Difficoltà per schermata | 0–3 | Prima: 0; successive tre: 1 |
| Numero Qix | Schermate 1–2: uno; 3–4: due | — |

[§1.7.1, pagina stampata 7](https://www.gamesdatabase.org/Media/SYSTEM/Arcade/Manual/formated/Qix_-_1981_-_Taito.pdf#page=8).

Il servizio permette selezione linguistica, programmazione dei crediti, classifica con iniziali e statistiche d’incasso. [§§1.8.17–1.8.21, pagine stampate 12–13](https://www.gamesdatabase.org/Media/SYSTEM/Arcade/Manual/formated/Qix_-_1981_-_Taito.pdf#page=13).

Il volume comprende inoltre diagnostica, manutenzione, funzionamento delle schede e catalogo illustrato dei ricambi. [Indice, pagine stampate 3–4](https://www.gamesdatabase.org/Media/SYSTEM/Arcade/Manual/formated/Qix_-_1981_-_Taito.pdf#page=4).

## Regole e punteggi: integrazione da fonti arcade

I dettagli seguenti integrano il manuale di servizio e provengono dalla [scheda Qix di Arcade History](https://www.arcade-history.com/game/2096/), sezioni dedicate a punteggi e gioco.

| Azione | Punteggio base |
| --- | --- |
| Conquista veloce, riempimento blu | 250 × punti percentuali conquistati |
| Conquista lenta, riempimento rosso/bruno | 500 × punti percentuali conquistati |
| Superamento della soglia | 1.000 × punti percentuali oltre il 75% |
| Separazione dei due Qix | Incremento del moltiplicatore delle conquiste successive |

Il calcolo dell’area può utilizzare frazioni percentuali anche se il display mostra interi. Separare i Qix sostituisce il bonus di superamento della soglia. Per esempio, conquistare il 3% lentamente vale circa 1.500 punti prima dei moltiplicatori. [Arcade History, punteggi](https://www.arcade-history.com/game/2096/).

Il marcatore parte al centro del bordo inferiore. Può percorrere il confine adiacente allo spazio libero; gli Sparx non percorrono i tracciati incompiuti. Il Qix può distruggere qualsiasi parte della linea ancora aperta. La velocità scelta resta vincolata fino alla chiusura. [Kevin Butler, FAQ arcade, §§6.3 e 7](https://gamefaqs.gamespot.com/arcade/584113-qix/faqs/25178).

## Uso di qix-astra.html

Apri il file direttamente nel browser: non servono server, installazioni o connessioni di rete. Premi **Invio** oppure **INIZIA**.

| Comando | Azione |
| --- | --- |
| Frecce oppure WASD | Movimento nelle quattro direzioni |
| Z oppure Spazio, tenuto premuto | Tracciamento veloce |
| X oppure Shift, tenuto premuto | Tracciamento lento |
| P oppure Esc | Pausa e ripresa |
| M | Audio acceso/spento |
| Invio dopo il game over | Nuova partita |
| Pulsante schermo intero | Schermo intero, se supportato |

Su dispositivo touch, tieni premuta una direzione insieme a **VELOCE** o **LENTO**. Tornare su un bordo chiude il tracciato. Perdere il focus mette automaticamente in pausa. Record e preferenza audio vengono salvati localmente quando il browser lo consente.

## Fedeltà e limiti dichiarati

Questa è una ricostruzione autonoma, non un’emulazione delle ROM. Riproduce conquista delle regioni, due velocità, colori distinti, collisioni sul tracciato, Sparx sul perimetro, miccia, doppio Qix e moltiplicatore. Usa soglia del 75%, timer di 37 secondi e tre vite. Non introduce una vita premio a 50.000 punti, non verificata nel manuale arcade consultato.

Le scelte specifiche di questa implementazione sono:

- Partita per un giocatore; non sono implementati alternanza a due giocatori, gettoniera o menu operatore.
- Campo logico di 128 × 128 celle e disegno su Canvas 320 × 400; impaginazione e caratteri sono ricreati.
- Movimento del Qix, velocità, ritardo della miccia e suoni Web Audio sono approssimazioni originali del progetto.
- Ulteriori coppie di Sparx ogni 37 secondi, fino a otto nemici; trasformazione dopo due intervalli e Super Sparx dalla quinta schermata. Questa progressione è una scelta di bilanciamento, non un dato ricavato dal manuale.
- Un Qix nelle prime due schermate, due in tutte le successive; difficoltà crescente con velocità massime limitate.
- Punti delle conquiste arrotondati all’intero più vicino; bonus calcolato sulle percentuali intere eccedenti la soglia. Una separazione aumenta il moltiplicatore e avvia la schermata successiva.
- Il record conserva soltanto il miglior punteggio, senza la classifica completa con iniziali.

## Verifica

Verificato in Chromium: avvio, tastiera, pausa, audio, disposizione mobile, chiusure rettilinee e ad angolo, aree e punteggi, bordi dopo la conquista, collisioni, miccia, separazione dei Qix, fine schermata, game over e riavvio. I test del motore usano posizioni controllate per rendere ripetibili le verifiche. Non è stato effettuato un confronto fotogramma per fotogramma con una macchina originale.
