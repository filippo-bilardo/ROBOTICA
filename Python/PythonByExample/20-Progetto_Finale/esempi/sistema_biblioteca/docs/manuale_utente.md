# Manuale Utente - Sistema di Gestione Biblioteca

Questo manuale descrive come utilizzare l'applicazione Sistema di Gestione Biblioteca.

## Avvio dell'Applicazione

Per avviare l'applicazione, apri un terminale o prompt dei comandi, naviga nella directory principale del progetto (`sistema_biblioteca`) e digita:

```bash
python -m sistema_biblioteca.main
```

## Interfaccia a Riga di Comando (CLI)

L'applicazione presenta un menu principale con diverse opzioni:

```
--- Sistema Gestione Biblioteca ---
1. Gestione Libri
2. Gestione Utenti
3. Gestione Prestiti
4. Report
0. Esci
Scelta: _
```

Inserisci il numero corrispondente all'azione che desideri eseguire.

### 1. Gestione Libri

-   **Aggiungi Libro**: Inserisci titolo, autore e anno di pubblicazione.
-   **Rimuovi Libro**: Inserisci l'ID del libro da rimuovere.
-   **Cerca Libri**: Inserisci una parola chiave per cercare libri per titolo o autore.
-   **Visualizza Catalogo**: Mostra tutti i libri presenti nel sistema.

### 2. Gestione Utenti

-   **Registra Utente**: Inserisci nome ed email del nuovo utente.
-   **Visualizza Utenti**: Mostra tutti gli utenti registrati.
-   **Trova Utente**: Cerca un utente per ID o email.
-   **Rimuovi Utente**: Inserisci l'ID dell'utente da rimuovere (attenzione: verifica che non abbia prestiti attivi).

### 3. Gestione Prestiti

-   **Crea Prestito**: Inserisci l'ID del libro e l'ID dell'utente. Il sistema verifica la disponibilità del libro.
-   **Restituisci Prestito**: Inserisci l'ID del prestito da restituire.
-   **Visualizza Prestiti Attivi**: Mostra tutti i prestiti non ancora restituiti.
-   **Visualizza Prestiti Utente**: Inserisci l'ID dell'utente per vedere i suoi prestiti.

### 4. Report

-   **Libri Disponibili**: Elenca tutti i libri attualmente disponibili per il prestito.
-   **Prestiti Scaduti**: Mostra i prestiti la cui data di scadenza è passata.

### 0. Esci

Termina l'applicazione. I dati vengono salvati automaticamente all'uscita.

## Salvataggio Dati

I dati relativi a libri, utenti e prestiti vengono salvati automaticamente in file JSON nella directory principale del progetto (`libri.json`, `utenti.json`, `prestiti.json`) ogni volta che viene effettuata una modifica e all'uscita dall'applicazione.