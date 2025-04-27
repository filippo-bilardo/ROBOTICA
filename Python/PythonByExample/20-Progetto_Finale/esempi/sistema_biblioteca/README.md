# Sistema di Gestione Biblioteca

Questo progetto implementa un sistema di gestione per una piccola biblioteca. Permette di gestire libri, utenti e prestiti attraverso un'interfaccia a riga di comando.

## Funzionalità

- Gestione del catalogo libri (aggiunta, rimozione, ricerca)
- Gestione degli utenti (registrazione, modifica, cancellazione)
- Gestione dei prestiti (prestito, restituzione, rinnovo)
- Generazione di report (libri disponibili, prestiti in corso, prestiti scaduti)
- Salvataggio e caricamento dei dati da file JSON

## Struttura del Progetto

```
sistema_biblioteca/
├── README.md                 # Documentazione del progetto
├── requirements.txt          # Dipendenze del progetto
├── sistema_biblioteca/       # Codice sorgente
│   ├── __init__.py
│   ├── main.py               # Punto di ingresso dell'applicazione
│   ├── models/               # Modelli di dati
│   │   ├── __init__.py
│   │   ├── libro.py
│   │   ├── utente.py
│   │   └── prestito.py
│   ├── services/             # Logica di business
│   │   ├── __init__.py
│   │   ├── catalogo_service.py
│   │   ├── utenti_service.py
│   │   └── prestiti_service.py
│   ├── repositories/         # Accesso ai dati
│   │   ├── __init__.py
│   │   ├── json_repository.py
│   │   └── repository_factory.py
│   └── ui/                   # Interfaccia utente
│       ├── __init__.py
│       └── cli.py
├── tests/                    # Test unitari e di integrazione
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_services.py
│   └── test_repositories.py
└── docs/                     # Documentazione aggiuntiva
    ├── architettura.md
    └── manuale_utente.md
```

## Installazione

1. Clona il repository o scarica il codice sorgente
2. Naviga nella directory del progetto
3. Installa le dipendenze:

```bash
pip install -r requirements.txt
```

## Utilizzo

Per avviare l'applicazione, esegui:

```bash
python -m sistema_biblioteca.main
```

Segui le istruzioni a schermo per interagire con il sistema.

## Tecnologie Utilizzate

- Python 3.8+
- JSON per la persistenza dei dati
- Pytest per i test unitari
- Argparse per la gestione dei comandi da riga di comando
- Logging per la registrazione degli eventi

## Principi di Progettazione

- **Architettura a livelli**: separazione tra modelli, servizi e interfaccia utente
- **Dependency Injection**: utilizzo di factory per la creazione di oggetti
- **Repository Pattern**: astrazione dell'accesso ai dati
- **Command Pattern**: implementazione dei comandi dell'interfaccia utente

## Autore

Questo progetto è stato sviluppato come esempio per il corso "Python by Example".

## Licenza

MIT