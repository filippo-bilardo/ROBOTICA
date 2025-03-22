## Comunicazione con i Socket - Gateway IOT
- Realizzazione di un Gateway IOT per la visualizzazione remota dei dati provenienti dai sensori.
- Il dato di temperatura arriva tramite collegamento seriale con il microcontrollore che gestisce il sensore di temperatura.
- I dati ricevuti verranno inseriti all’interno di una pagina web, che utilizzerà un oggetto canvas di html5 per la rappresentazione grafica del dato.
- Il server risponderà a richieste http provenienti da client remoti trasmettendo il file html contenente il dato aggiornato

### Obiettivi didattici
- saper programmare con i socket in C
- saper utilizzare le librerie sui socket
- saper utilizzare le librerie per l’utilizzo dell’uart
- saper utilizzare le librerie per l’accesso al’hardware GPIO della Raspberry PI
- saper utilizzare le librerie per l’utilizzo dei file
- eseguire semplici operazioni sui file
- implementare un semplice protocollo di comunicazione tra la raspberry e il microcontrollore

### Teoria di riferimento
- [Introduction to Sockets Programming in C using TCP/IP](https://drive.google.com/file/d/1zKHNAoOpIEZeP4KwZ06vHmNy5RWn1Cgk/view)
- [Il protocollo HTTP](http://www-db.deis.unibo.it/courses/TW/PDF/1.03.HTTP.pdf)
- [https://developer.mozilla.org/it/docs/Web/HTML/Canvas](https://developer.mozilla.org/it/docs/Web/HTML/Canvas)
- [https://joshondesign.com/p/books/canvasdeepdive/toc.html](https://joshondesign.com/p/books/canvasdeepdive/toc.html)
- Esempio: canvas-termometro.html - Modificando la riga del precedente file contente “var term_val=26;“ otteniamo la visualizzazione del valore 26 in formato grafico

Modifica del file html
- Realizzazione di una routine, in grado di trovare la riga del file html contenente il dato di temperatura da visualizzare e modificarla inserendo il nuovo dato
Manipolazione del contenuto dei file
- Realizzazione di una routine, in grado di restituire l’intero contenuto del file sottoforma di stringa
Test della comunicazione seriale tramite Uart
- Scrivere un semplice programma che visualizzi su console i dati ricevuti tramite porta seriale
- Scrivere una routine che letti i dati dalla porta seriale, in polling continuo, li metta a disposizione dell’applicazione principale tramite variabile globale
Realizzazione del server web
- Integrare le funzionalità precedentemente implementate e Realizzare un Gateway IOT per la visualizzazione remota dei dati provenienti dai sensori
Repository Github
[https://github.com/filippo-bilardo/Z-Altro/GatewayIOT](https://github.com/filippo-bilardo/Z-Altro/GatewayIOT)
