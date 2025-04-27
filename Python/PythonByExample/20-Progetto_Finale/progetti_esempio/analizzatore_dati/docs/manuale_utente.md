# Manuale Utente - Analizzatore Dati

Benvenuto nel manuale utente per l'applicazione "Analizzatore Dati".

## Introduzione

Questa applicazione permette di importare dati da file CSV o JSON, eseguire analisi statistiche di base e visualizzare i risultati tramite grafici.

## Come Usare l'Applicazione

1.  **Esecuzione**: Avvia lo script principale `main.py` dalla riga di comando:
    ```bash
    python main.py
    ```
2.  **Importazione Dati**: Segui le istruzioni a schermo per specificare il percorso del file dati (CSV o JSON).
3.  **Analisi**: L'applicazione calcolerà automaticamente le statistiche principali (media, mediana, deviazione standard, ecc.).
4.  **Visualizzazione**: Verranno generati e mostrati grafici (es. istogrammi, grafici a linee) basati sui dati analizzati.

## Formati Dati Supportati

-   **CSV**: File con valori separati da virgola.
-   **JSON**: File contenenti un array di oggetti o un oggetto con dati strutturati.

## Risoluzione Problemi

-   Assicurati che le dipendenze elencate in `requirements.txt` siano installate.
-   Verifica che il formato del file dati sia corretto.

Per ulteriori dettagli sull'architettura, consulta il file `architettura.md`.