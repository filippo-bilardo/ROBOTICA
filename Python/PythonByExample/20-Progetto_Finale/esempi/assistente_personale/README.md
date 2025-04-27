# Assistente Personale in Python

Questo progetto è un esempio di assistente personale virtuale sviluppato in Python. L'assistente è in grado di rispondere a comandi vocali o testuali, eseguire operazioni di base come la gestione di promemoria, ricerche sul web, controllo del meteo e altre funzionalità utili.

## Funzionalità

- Riconoscimento vocale con la libreria SpeechRecognition
- Sintesi vocale con pyttsx3
- Elaborazione del linguaggio naturale con NLTK
- Gestione di promemoria e appuntamenti
- Ricerca di informazioni sul web
- Controllo del meteo tramite API
- Riproduzione di musica e podcast
- Integrazione con servizi di terze parti

## Struttura del progetto

```
assistente_personale/
├── assistente_personale/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── assistant.py
│   │   ├── speech_recognition.py
│   │   ├── text_to_speech.py
│   │   └── nlp_processor.py
│   ├── skills/
│   │   ├── __init__.py
│   │   ├── base_skill.py
│   │   ├── reminder.py
│   │   ├── weather.py
│   │   ├── web_search.py
│   │   ├── music_player.py
│   │   └── news.py
│   ├── data/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── models.py
│   └── utils/
│       ├── __init__.py
│       ├── logger.py
│       └── api_client.py
├── tests/
│   ├── __init__.py
│   ├── test_speech_recognition.py
│   ├── test_nlp_processor.py
│   └── test_skills.py
├── data/
│   ├── training_data.json
│   └── user_preferences.json
├── requirements.txt
├── setup.py
└── README.md
```

## Requisiti

- Python 3.8 o superiore
- SpeechRecognition
- pyttsx3
- NLTK
- requests
- python-dateutil
- SQLAlchemy

## Installazione

```bash
# Clona il repository
git clone https://github.com/tuonome/assistente_personale.git
cd assistente_personale

# Crea un ambiente virtuale
python -m venv venv
source venv/bin/activate  # Su Windows: venv\Scripts\activate

# Installa le dipendenze
pip install -r requirements.txt

# Installa il pacchetto in modalità sviluppo
pip install -e .

# Scarica i dati necessari per NLTK
python -c "import nltk; nltk.download('punkt'); nltk.download('wordnet')"
```

## Configurazione

Prima di utilizzare l'assistente, è necessario configurare le API keys per i servizi esterni. Copia il file `config.example.py` in `config.py` e inserisci le tue chiavi API:

```python
# API keys
WEATHER_API_KEY = "your_openweathermap_api_key"
NEWS_API_KEY = "your_newsapi_key"

# Configurazione assistente
ASSISTANT_NAME = "Jarvis"
USER_NAME = "Utente"
LANGUAGE = "it-IT"  # Lingua per il riconoscimento vocale e la sintesi

# Configurazione database
DATABASE_URL = "sqlite:///data/assistant.db"
```

## Utilizzo

Per avviare l'assistente in modalità testuale:

```bash
python -m assistente_personale.main --text-only
```

Per avviare l'assistente con riconoscimento vocale:

```bash
python -m assistente_personale.main
```

### Comandi di esempio

- "Che tempo fa a Milano?"
- "Ricordami di comprare il latte domani alle 10"
- "Cerca informazioni su Python su Wikipedia"
- "Riproduci musica rilassante"
- "Quali sono le ultime notizie?"

## Estendere l'assistente

Puoi aggiungere nuove funzionalità creando una nuova skill nella cartella `skills/`. Ogni skill deve estendere la classe `BaseSkill` e implementare almeno i metodi `can_handle` e `handle`:

```python
from assistente_personale.skills.base_skill import BaseSkill

class MyNewSkill(BaseSkill):
    def can_handle(self, query):
        # Determina se questa skill può gestire la query
        return "parola_chiave" in query.lower()
    
    def handle(self, query, context):
        # Gestisce la query e restituisce una risposta
        return "Ecco la risposta alla tua richiesta"
```

Dopo aver creato la skill, registrala nel file `skills/__init__.py`.

## Documentazione

La documentazione completa è disponibile nella cartella `docs/` e include:

- Guida utente
- Documentazione API
- Tutorial per estendere l'assistente

## Test

Per eseguire i test:

```bash
python -m unittest discover tests
```

## Contribuire

Se vuoi contribuire al progetto, segui questi passaggi:

1. Fai un fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/nome-feature`)
3. Fai commit delle tue modifiche (`git commit -m 'Aggiungi una nuova feature'`)
4. Pusha il branch (`git push origin feature/nome-feature`)
5. Apri una Pull Request

## Licenza

Questo progetto è distribuito con licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

## Riconoscimenti

- Librerie utilizzate: SpeechRecognition, pyttsx3, NLTK
- Ispirazione: progetti simili come Mycroft AI e Jasper