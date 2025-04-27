# Architettura del Progetto Gestore Blog

Questo documento descrive l'architettura generale del progetto "Gestore Blog".

## Framework Scelto (Esempio: Flask)

L'applicazione è costruita utilizzando il microframework Flask per la sua semplicità e flessibilità.

## Componenti Principali

- **`src/gestore_blog/__init__.py`**: Inizializza l'applicazione Flask, configura le estensioni (es. SQLAlchemy, Migrate) e registra i blueprint.
- **`src/gestore_blog/models.py`**: Definisce i modelli del database utilizzando SQLAlchemy (es. `User`, `Post`, `Comment`).
- **`src/gestore_blog/database.py`**: Gestisce la configurazione e l'inizializzazione del database e della sessione SQLAlchemy.
- **`src/gestore_blog/views.py`**: Contiene le route (URL endpoint) e la logica associata per gestire le richieste HTTP (es. visualizzare post, creare nuovi post).
- **`src/gestore_blog/static/`**: Contiene i file statici come CSS, JavaScript e immagini.
- **`src/gestore_blog/templates/`**: Contiene i template HTML (utilizzando Jinja2) per rendere le pagine web.
- **`tests/`**: Contiene i test unitari e di integrazione per i vari componenti dell'applicazione.
- **`config.py`**: File di configurazione centrale per l'applicazione (es. chiavi segrete, URI del database).
- **`run.py`**: Script per avviare il server di sviluppo Flask.

## Flusso di una Richiesta (Esempio)

1. Un utente accede a un URL (es. `/posts`).
2. Flask instrada la richiesta alla funzione di vista corrispondente in `views.py`.
3. La vista interagisce con i modelli (`models.py`) tramite la sessione del database (`database.py`) per recuperare i dati necessari (es. tutti i post).
4. La vista passa i dati recuperati a un template Jinja2 in `templates/`.
5. Il template viene renderizzato in HTML.
6. Flask invia la risposta HTML al browser dell'utente.

## Dipendenze Chiave

- Flask
- SQLAlchemy (per l'ORM)
- Flask-Migrate (per le migrazioni del database)
- Jinja2 (integrato in Flask)
- Altre dipendenze specificate in `requirements.txt`.