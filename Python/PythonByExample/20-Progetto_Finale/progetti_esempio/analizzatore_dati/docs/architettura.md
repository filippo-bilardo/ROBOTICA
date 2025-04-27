# Architettura del Progetto Analizzatore Dati

Questo documento descrive l'architettura generale del progetto "Analizzatore Dati".

## Componenti Principali

Il progetto è suddiviso nei seguenti moduli principali:

- **`importers`**: Contiene le funzioni per importare dati da diversi formati (es. CSV, JSON).
- **`analyzer`**: Contiene le funzioni per eseguire analisi statistiche e identificare pattern nei dati.
- **`plotter`**: Contiene le funzioni per generare visualizzazioni grafiche dei dati analizzati (es. grafici a linee, istogrammi).
- **`main.py`**: Script principale che orchestra il flusso di lavoro: importazione, analisi e visualizzazione.

## Flusso dei Dati

1. I dati vengono importati utilizzando uno dei moduli in `importers`.
2. I dati importati vengono passati al modulo `analyzer` per l'elaborazione.
3. I risultati dell'analisi vengono passati al modulo `plotter` per la creazione di grafici.
4. Lo script `main.py` gestisce l'interazione con l'utente e coordina le chiamate ai vari moduli.

## Dipendenze

Le principali dipendenze del progetto sono elencate nel file `requirements.txt`.