# Architettura del Sistema di Gestione Biblioteca

Questo documento descrive l'architettura software del Sistema di Gestione Biblioteca.

## Obiettivi Architetturali

- **Modularità**: Separare le responsabilità in componenti distinti (UI, Servizi, Repository, Modelli).
- **Manutenibilità**: Facilitare modifiche e aggiornamenti futuri.
- **Testabilità**: Permettere test unitari e di integrazione efficaci.
- **Estensibilità**: Consentire l'aggiunta di nuove funzionalità con minimo impatto sul codice esistente.

## Struttura a Livelli

L'applicazione segue un'architettura a livelli:

1.  **Livello UI (User Interface)**: Responsabile dell'interazione con l'utente (es. `cli.py`). Riceve input dall'utente e presenta output.
2.  **Livello Servizi (Services)**: Contiene la logica di business principale dell'applicazione (es. `catalogo_service.py`, `utenti_service.py`, `prestiti_service.py`). Coordina le operazioni e interagisce con i repository.
3.  **Livello Repository (Repositories)**: Gestisce l'accesso e la persistenza dei dati (es. `json_repository.py`). Astrae i dettagli di come i dati vengono salvati e recuperati.
4.  **Livello Modelli (Models)**: Definisce le strutture dati principali dell'applicazione (es. `libro.py`, `utente.py`, `prestito.py`).

## Componenti Principali

-   **`main.py`**: Punto di ingresso dell'applicazione, inizializza i componenti e avvia l'interfaccia utente.
-   **`cli.py`**: Implementa l'interfaccia a riga di comando, gestisce i comandi dell'utente e interagisce con i servizi.
-   **Servizi (`*_service.py`)**: Implementano le operazioni specifiche per libri, utenti e prestiti.
-   **Repository (`json_repository.py`, `repository_factory.py`)**: Gestiscono la lettura e scrittura dei dati su file JSON. La factory permette di centralizzare la creazione dei repository.
-   **Modelli (`libro.py`, `utente.py`, `prestito.py`)**: Classi che rappresentano le entità del dominio.

## Flusso Dati

Un tipico flusso di dati per un'operazione (es. aggiungere un libro) è:

1.  L'utente inserisce il comando nell'interfaccia (`cli.py`).
2.  L'interfaccia chiama il metodo appropriato nel servizio (`catalogo_service.py`).
3.  Il servizio valida i dati e interagisce con il repository (`json_repository.py`) per salvare il nuovo libro.
4.  Il repository scrive i dati aggiornati nel file JSON.
5.  Il servizio restituisce il risultato all'interfaccia.
6.  L'interfaccia mostra un messaggio di conferma all'utente.

## Persistenza dei Dati

I dati vengono salvati in file JSON separati per libri, utenti e prestiti. Questo approccio è semplice ma potrebbe non essere scalabile per grandi quantità di dati. Per applicazioni più complesse, si potrebbe considerare un database relazionale (es. SQLite, PostgreSQL) o NoSQL.

## Testing

La struttura a livelli facilita i test:

-   **Test Unitari**: Testano singoli componenti (modelli, funzioni nei servizi, metodi nei repository) in isolamento.
-   **Test di Integrazione**: Verificano l'interazione tra diversi componenti (es. servizio che usa un repository).