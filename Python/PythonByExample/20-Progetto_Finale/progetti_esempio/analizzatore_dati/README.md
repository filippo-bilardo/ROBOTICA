# Progetto Esempio: Analizzatore Dati

Questo progetto è un esempio di applicazione Python per l'analisi di dati.

## Descrizione

L'applicazione permette di:
- Importare dati da file CSV e JSON.
- Calcolare statistiche descrittive di base.
- Generare visualizzazioni grafiche (istogrammi, grafici a linee).

## Struttura del Progetto

```
analizzatore_dati/
├── docs/
│   ├── architettura.md
│   └── manuale_utente.md
├── src/
│   └── analizzatore_dati/
│       ├── __init__.py
│       ├── analyzer.py
│       ├── importers.py
│       ├── main.py
│       └── plotter.py
├── tests/
│   ├── __init__.py
│   ├── test_analyzer.py
│   ├── test_importers.py
│   └── test_plotter.py
├── .gitignore
├── README.md
├── requirements.txt
└── setup.py
```

## Installazione

1. Clona il repository (se applicabile).
2. Crea un ambiente virtuale:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Su Windows: venv\Scripts\activate
   ```
3. Installa le dipendenze:
   ```bash
   pip install -r requirements.txt
   ```
4. Installa il pacchetto in modalità editabile (opzionale, per sviluppo):
   ```bash
   pip install -e .
   ```

## Utilizzo

Esegui lo script principale:

```bash
python src/analizzatore_dati/main.py
```

Oppure, se installato:

```bash
analizza-dati
```

Segui le istruzioni a schermo per fornire il percorso del file dati.

## Contribuire

Consulta le linee guida per contribuire (se presenti).

## Licenza

Questo progetto è rilasciato sotto la licenza MIT (o specifica la tua licenza).