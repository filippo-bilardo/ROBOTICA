# Analisi dei Requisiti

L'analisi dei requisiti è una fase cruciale nello sviluppo di qualsiasi progetto software. In questa guida, imparerai come identificare, documentare e gestire i requisiti del tuo progetto Python finale.

## Obiettivi di apprendimento

- Comprendere l'importanza dell'analisi dei requisiti
- Imparare a identificare e classificare i requisiti
- Documentare i requisiti in modo chiaro e completo
- Gestire i cambiamenti nei requisiti durante lo sviluppo

## Tipi di requisiti

### Requisiti funzionali

I requisiti funzionali descrivono ciò che il sistema deve fare. Specificano le funzionalità che il software deve fornire agli utenti.

**Esempio:**
```
RF1: Il sistema deve permettere agli utenti di registrarsi con email e password.
RF2: Il sistema deve consentire agli utenti di cercare libri per titolo, autore o genere.
RF3: Il sistema deve inviare notifiche via email quando un libro prenotato diventa disponibile.
```

### Requisiti non funzionali

I requisiti non funzionali descrivono come il sistema deve essere, piuttosto che cosa deve fare. Riguardano aspetti come prestazioni, sicurezza, usabilità, affidabilità, ecc.

**Esempio:**
```
RNF1: Il sistema deve rispondere alle ricerche entro 2 secondi.
RNF2: Il sistema deve essere disponibile il 99,9% del tempo.
RNF3: Il sistema deve proteggere i dati personali degli utenti secondo il GDPR.
```

### Requisiti di dominio

I requisiti di dominio sono specifici del settore o dell'ambiente in cui il sistema verrà utilizzato.

**Esempio:**
```
RD1: Il sistema deve calcolare le tasse secondo la normativa fiscale italiana.
RD2: Il sistema deve rispettare le linee guida dell'associazione bibliotecaria nazionale.
```

## Tecniche per la raccolta dei requisiti

### Interviste e questionari

Le interviste e i questionari sono metodi diretti per raccogliere informazioni dagli stakeholder. Preparare domande mirate può aiutare a identificare esigenze e aspettative.

### Osservazione

L'osservazione degli utenti nel loro ambiente di lavoro può rivelare requisiti che potrebbero non emergere durante le interviste.

### Analisi dei documenti

L'analisi di documenti esistenti, come manuali, procedure operative e report, può fornire informazioni preziose sui requisiti del sistema.

### Brainstorming

Il brainstorming è una tecnica di gruppo che incoraggia la generazione di idee creative per identificare requisiti innovativi.

## Documentazione dei requisiti

### User stories

Le user stories sono brevi descrizioni dei requisiti dal punto di vista dell'utente. Seguono generalmente il formato: "Come [tipo di utente], voglio [obiettivo] in modo che [beneficio]".

**Esempio:**
```
Come utente registrato, voglio poter salvare i libri nei preferiti in modo da trovarli facilmente in futuro.
Come bibliotecario, voglio poter vedere quali libri sono in prestito in modo da gestire il catalogo efficacemente.
```

### Casi d'uso

I casi d'uso descrivono le interazioni tra gli utenti (attori) e il sistema per raggiungere un obiettivo specifico.

**Esempio:**
```
Caso d'uso: Prestito di un libro
Attore principale: Utente registrato
Precondizioni: L'utente è autenticato, il libro è disponibile
Flusso principale:
1. L'utente cerca un libro
2. Il sistema mostra i risultati della ricerca
3. L'utente seleziona un libro
4. Il sistema mostra i dettagli del libro
5. L'utente richiede il prestito
6. Il sistema registra il prestito e aggiorna lo stato del libro
Postcondizioni: Il libro è segnato come "in prestito" all'utente
```

### Specifiche dei requisiti software (SRS)

Un documento SRS è una descrizione completa e dettagliata dei requisiti del software. Include tutti i requisiti funzionali, non funzionali e di dominio, insieme a vincoli e dipendenze.

## Prioritizzazione dei requisiti

Non tutti i requisiti hanno la stessa importanza. È essenziale prioritizzare i requisiti per concentrarsi prima su quelli più critici.

### Metodo MoSCoW

Il metodo MoSCoW classifica i requisiti in quattro categorie:

- **M** (Must have): Requisiti essenziali per il successo del progetto
- **S** (Should have): Requisiti importanti ma non critici
- **C** (Could have): Requisiti desiderabili ma non necessari
- **W** (Won't have): Requisiti che non saranno implementati nella versione corrente

## Gestione dei cambiamenti nei requisiti

I requisiti possono cambiare durante lo sviluppo del progetto. È importante avere un processo per gestire questi cambiamenti.

### Processo di gestione dei cambiamenti

1. **Identificazione del cambiamento**: Documentare la richiesta di cambiamento
2. **Analisi dell'impatto**: Valutare l'impatto del cambiamento su tempi, costi e qualità
3. **Approvazione**: Decidere se implementare il cambiamento
4. **Implementazione**: Aggiornare i requisiti e il piano di progetto
5. **Verifica**: Assicurarsi che il cambiamento sia stato implementato correttamente

## Esercizio pratico

1. Scegli il progetto che intendi sviluppare
2. Identifica almeno 5 requisiti funzionali e 3 requisiti non funzionali
3. Scrivi 3-5 user stories per il tuo progetto
4. Crea un caso d'uso dettagliato per una funzionalità principale
5. Prioritizza i requisiti utilizzando il metodo MoSCoW

## Risorse aggiuntive

- [Guida all'analisi dei requisiti](https://www.tutorialspoint.com/software_engineering/software_requirements.htm)
- [Template per la documentazione dei requisiti](https://www.projectmanagement.com/contentPages/document.cfm?ID=320&thisPageURL=/documents/320/document.cfm)
- [Tecniche di elicitazione dei requisiti](https://www.modernanalyst.com/Resources/Articles/tabid/115/ID/1427/5-Steps-to-Better-Requirements-Elicitation.aspx)

---

[Guida Precedente: Pianificazione del progetto](./01_pianificazione_progetto.md) | [Guida Successiva: Progettazione dell'architettura](./03_progettazione_architettura.md) | [Torna all'indice principale](../README.md)