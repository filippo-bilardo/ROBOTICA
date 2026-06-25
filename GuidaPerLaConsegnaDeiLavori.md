# Guida alla Consegna dei Lavori di Laboratorio

## Introduzione

Tutti i lavori di laboratorio devono essere consegnati tramite il documento Google generato automaticamente da Google Classroom. Il documento deve essere compilato seguendo la struttura indicata in questa guida, che ha lo scopo di garantire una documentazione completa, ordinata e facilmente valutabile, e di abituare alla produzione di documentazione tecnica professionale.

## Indice

1. Informazioni Generali
2. Struttura di Ogni Esercizio
3. Convenzioni di Formato
4. Esempio di Riferimento
5. Norme per la Consegna
6. Errori Comuni da Evitare
7. Checklist Finale
8. Criteri di Valutazione

---

## 1. Informazioni Generali

All'inizio del documento devono essere riportate le seguenti informazioni:

* Titolo del lavoro + (eventuale) immagine di copertina;
* Nome e cognome dello studente (o dei componenti, se lavoro di gruppo);
* Classe;
* Data di consegna;
* Versione del documento (ad esempio: v1.0, v1.1, v2.0).

> **Versionamento:** incrementa la cifra decimale (v1.0 → v1.1) per correzioni minori, e la cifra intera (v1.0 → v2.0) per revisioni sostanziali richieste dal docente dopo la restituzione del lavoro.

Se il lavoro è svolto in gruppo, indicare chiaramente il contributo di ciascun componente per ogni esercizio.

---

## 2. Struttura di Ogni Esercizio

Ogni esercizio deve essere documentato seguendo le sezioni riportate di seguito.

### 2.1 Titolo dell'Esercizio

Utilizzare uno stile **Titolo 1 (Heading 1)**.

Formato consigliato:

**esXXy - Breve descrizione dell'esercizio**

dove `XX` è il numero dell'esercitazione e `y` è la lettera che identifica il singolo punto richiesto (a, b, c, ...).

Esempio: **es01a - Creazione di una semplice pagina HTML**

### 2.2 Obiettivo / Abstract

Descrivere in modo sintetico:

* il problema da risolvere;
* gli obiettivi dell'attività;
* le funzionalità richieste.

Nella maggior parte dei casi è sufficiente riportare il testo dell'esercizio assegnato.

### 2.3 Analisi e Progettazione (se applicabile)

Quando richiesto dall'attività, documentare:

**Analisi del problema**

* Comprensione dei requisiti;
* Vincoli da rispettare;
* Eventuali ipotesi formulate.

**Progettazione della soluzione**

Inserire eventuali:

* Diagrammi UML;
* Flowchart;
* Mockup;
* Schemi logici;
* Modelli ER;
* Altri diagrammi utili alla comprensione del progetto.

**Scelte progettuali**

Motivare le principali decisioni adottate durante la progettazione.

### 2.4 Implementazione

Descrivere il lavoro svolto durante la fase di sviluppo. Inserire:

* il codice realizzato (vedi convenzioni nella sezione 3);
* spiegazione delle parti più importanti;
* link al repository GitHub (se utilizzato).

**Commenti al codice**

Il codice deve essere adeguatamente commentato. I commenti devono spiegare:

* lo scopo delle classi (se presenti);
* il funzionamento delle funzioni o dei metodi principali;
* le scelte implementative più significative.

L'assenza di commenti può influire negativamente sulla valutazione.

### 2.5 Collaudo e Verifica

Documentare le attività di test svolte, specificando:

* i test eseguiti;
* gli input utilizzati;
* gli output ottenuti;
* eventuali errori riscontrati e le soluzioni adottate per correggerli.

Quando possibile, allegare screenshot delle prove effettuate.

### 2.6 Conclusioni

Riassumere:

* le fasi principali dello sviluppo;
* gli obiettivi raggiunti;
* i risultati ottenuti;
* eventuali difficoltà incontrate;
* considerazioni personali sull'esperienza svolta.

Evitare conclusioni generiche ("è andato tutto bene"): indicare almeno una difficoltà reale affrontata e come è stata risolta.

---

## 3. Convenzioni di Formato

* **Screenshot**: devono essere nitidi, leggibili e ritagliati sulla parte rilevante; evitare immagini dello schermo intero con elementi superflui.
* **Font e impaginazione**: mantenere uno stile coerente in tutto il documento (font, dimensione, interlinea); usare gli stili "Titolo" di Google Docs per i titoli, non solo grassetto o dimensione manuale.
* **Linguaggio**: registro tecnico-formale, terminologia corretta, senza abbreviazioni informali (es. "cmq", "xké").

---

## 4. Esempio di Riferimento

Schema minimo per un singolo esercizio:

```
es01a - Creazione di una semplice pagina HTML

Obiettivo
Creare una pagina HTML con intestazione, paragrafo e immagine, validata su validator.w3.org.

Implementazione
[blocco di codice HTML]
La struttura utilizza i tag semantici <header>, <main> e <footer> per...

Collaudo
Test: apertura su Chrome e Firefox, validazione W3C.
Risultato: nessun errore di validazione; resa corretta su entrambi i browser.

Conclusioni
Obiettivo raggiunto. Difficoltà: ...
```

---

## 5. Norme per la Consegna

### 5.1 Prima della Consegna

Prima di premere il pulsante **"Consegna"**, verificare che:

* tutti gli esercizi richiesti siano stati completati;
* il documento sia completo in ogni sua parte;
* il codice sia commentato correttamente;
* screenshot e collegamenti funzionino correttamente;
* il collaudo sia adeguatamente documentato.

> **Suggerimento:** consegna con un margine di tempo prima della scadenza, per gestire eventuali imprevisti tecnici (upload, connessione, formato del file).

### 5.2 Originalità del Lavoro

Tutti gli elaborati devono essere frutto del lavoro personale dello studente. Non sono ammessi:

* copie da compagni;
* copie da siti web senza citazione della fonte;
* utilizzo di codice generato da strumenti di Intelligenza Artificiale senza esplicita dichiarazione;
* modifiche superficiali di lavori realizzati da altri.

Il tempo di elaborazione del documento deve essere compatibile con la complessità dell'attività richiesta. Consegne completate in tempi irrealisticamente brevi potranno essere sottoposte a ulteriori verifiche.

Per dimostrare la paternità del lavoro, è consigliabile inserire nel codice commenti identificativi contenenti nome, cognome e classe.

**Dichiarazione di utilizzo di IA**

Se è stato utilizzato uno strumento di Intelligenza Artificiale, indicare nelle conclusioni dell'esercizio: lo strumento usato, per quale parte del lavoro (es. debug, generazione di un frammento, revisione del testo) e in che misura il risultato è stato compreso e personalizzato.

### 5.3 Modifiche Dopo la Consegna

È possibile ritirare una consegna già effettuata per apportare correzioni o integrazioni:

1. apri il lavoro consegnato in Google Classroom;
2. seleziona **"Ritira"**;
3. apporta le modifiche necessarie e aggiorna il numero di versione (sezione 1);
4. riconsegna entro la scadenza indicata dal docente.

---

## 6. Errori Comuni da Evitare

* Commenti al codice assenti o puramente descrittivi (es. "incrementa i di 1") invece che esplicativi del *perché*.
* Collaudo mancante o limitato a "funziona".
* Conclusioni generiche, senza riferimento a difficoltà reali.
* Informazioni generali (nome, classe, versione) mancanti o incomplete.
* Screenshot illeggibili o non pertinenti.
* Struttura dei titoli non coerente con gli stili richiesti (Titolo 1, ecc.).

---

## 7. Checklist Finale

Prima di consegnare, verificare che:

☐ il documento contenga tutte le informazioni generali richieste;
☐ ogni esercizio segua la struttura indicata in questa guida;
☐ il codice sia testuale (non immagine) e adeguatamente commentato;
☐ gli screenshot siano leggibili e pertinenti;
☐ eventuali link siano funzionanti e puntino al commit corretto;
☐ le attività di collaudo siano documentate con esempi concreti;
☐ il lavoro sia originale e personale, con eventuale uso di IA dichiarato;
☐ tutti gli esercizi assegnati siano stati completati.

---

## 8. Criteri di Valutazione

| Criterio | Peso indicativo |
|---|---|
| Correttezza tecnica della soluzione | 30% |
| Completezza della documentazione | 10% |
| Qualità della progettazione | 20% |
| Qualità e leggibilità del codice | 10% |
| Accuratezza del collaudo | 20% |
| Chiarezza espositiva | 5% |
| Rispetto di consegne e scadenze | 5% |

---

**Buon lavoro e buona programmazione!**