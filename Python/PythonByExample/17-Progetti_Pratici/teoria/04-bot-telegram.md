# Bot di Telegram

In questo progetto, svilupperemo un bot per Telegram con funzionalità utili. Impareremo a utilizzare l'API di Telegram per creare un'applicazione interattiva che può rispondere ai messaggi degli utenti e fornire servizi automatizzati.

## Analisi del problema

Prima di iniziare a programmare, definiamo chiaramente cosa vogliamo ottenere con il nostro bot:

### Requisiti funzionali

- Rispondere a comandi di base (/start, /help)
- Fornire informazioni su richiesta (es. meteo, notizie)
- Impostare promemoria e notifiche
- Gestire conversazioni semplici
- Inviare contenuti multimediali (immagini, documenti)

### Requisiti tecnici

- Utilizzo dell'API ufficiale di Telegram
- Gestione asincrona delle richieste
- Persistenza dei dati utente
- Gestione degli errori e logging
- Deployment su un server per funzionamento 24/7

## Progettazione

### Architettura del bot

Il nostro bot sarà strutturato nei seguenti componenti:

1. **Handler dei comandi**: gestisce i comandi inviati dagli utenti
2. **Gestore delle conversazioni**: mantiene lo stato delle conversazioni
3. **Servizi esterni**: integrazione con API di terze parti (meteo, notizie, ecc.)
4. **Database**: memorizzazione delle preferenze utente e dei dati persistenti
5. **Sistema di notifiche**: gestione dei promemoria programmati

### Struttura del progetto

```
telegram_bot/
├── bot.py                  # File principale del bot
├── config.py               # Configurazioni e costanti
├── handlers/               # Handler dei comandi
│   ├── __init__.py
│   ├── basic.py            # Comandi base (/start, /help)
│   ├── weather.py          # Funzionalità meteo
│   └── reminders.py        # Gestione promemoria
├── services/               # Servizi esterni
│   ├── __init__.py
│   ├── weather_api.py      # Integrazione API meteo
│   └── news_api.py         # Integrazione API notizie
├── database/               # Gestione database
│   ├── __init__.py
│   ├── db.py               # Connessione al database
│   └── models.py           # Modelli dei dati
└── utils/                  # Utilità varie
    ├── __init__.py
    ├── logger.py           # Sistema di logging
    └── helpers.py          # Funzioni di supporto
```

## Implementazione

### Configurazione iniziale

Per prima cosa, dobbiamo creare un bot su Telegram e ottenere un token API. Questo si fa attraverso il BotFather, il bot ufficiale di Telegram per la creazione di altri bot.

1. Apri Telegram e cerca "@BotFather"
2. Invia il comando `/newbot`
3. Segui le istruzioni per dare un nome al tuo bot
4. Al termine, riceverai un token API che useremo nel nostro codice

Ora creiamo il file `config.py` per memorizzare le configurazioni:

```python
# config.py
import os
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env
load_dotenv()

# Token del bot Telegram
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')

# Configurazione del database
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///bot_data.db')

# Chiavi API per servizi esterni
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
NEWS_API_KEY = os.getenv('NEWS_API_KEY')

# Altre configurazioni
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
ADMIN_USER_IDS = [int(id) for id in os.getenv('ADMIN_USER_IDS', '').split(',') if id]
```

### File principale del bot

Creiamo ora il file principale `bot.py` che inizializza e avvia il bot:

```python
# bot.py
import logging
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext
from telegram import Update
from config import TELEGRAM_TOKEN, LOG_LEVEL
from handlers.basic import start, help_command
from handlers.weather import weather
from handlers.reminders import set_reminder, list_reminders
from database.db import init_db
from utils.logger import setup_logger

# Configurazione del logger
setup_logger(LOG_LEVEL)
logger = logging.getLogger(__name__)

def main():
    """Funzione principale che avvia il bot"""
    # Inizializzazione del database
    init_db()
    
    # Creazione dell'updater e del dispatcher
    updater = Updater(TELEGRAM_TOKEN)
    dispatcher = updater.dispatcher
    
    # Registrazione degli handler dei comandi
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(CommandHandler("help", help_command))
    dispatcher.add_handler(CommandHandler("meteo", weather))
    dispatcher.add_handler(CommandHandler("promemoria", set_reminder))
    dispatcher.add_handler(CommandHandler("lista_promemoria", list_reminders))
    
    # Handler per messaggi non riconosciuti
    dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, echo))
    
    # Avvio del bot
    logger.info("Bot avviato")
    updater.start_polling()
    updater.idle()

def echo(update: Update, context: CallbackContext):
    """Risponde ripetendo il messaggio dell'utente"""
    update.message.reply_text(f"Hai detto: {update.message.text}")

if __name__ == '__main__':
    main()
```

### Implementazione degli handler di base

Creiamo il file `handlers/basic.py` per gestire i comandi di base:

```python
# handlers/basic.py
from telegram import Update
from telegram.ext import CallbackContext
import logging

logger = logging.getLogger(__name__)

def start(update: Update, context: CallbackContext):
    """Gestisce il comando /start"""
    user = update.effective_user
    logger.info(f"Utente {user.id} ha avviato il bot")
    
    message = (
        f"Ciao {user.first_name}! 👋\n\n"
        f"Sono il tuo assistente personale su Telegram. "
        f"Posso aiutarti con diverse attività come controllare il meteo, "
        f"impostare promemoria e molto altro.\n\n"
        f"Usa /help per vedere tutti i comandi disponibili."
    )
    
    update.message.reply_text(message)

def help_command(update: Update, context: CallbackContext):
    """Gestisce il comando /help"""
    help_text = (
        "Ecco i comandi disponibili:\n\n"
        "/start - Avvia il bot\n"
        "/help - Mostra questo messaggio di aiuto\n"
        "/meteo [città] - Mostra le previsioni meteo per la città specificata\n"
        "/promemoria [tempo] [messaggio] - Imposta un promemoria\n"
        "/lista_promemoria - Mostra tutti i tuoi promemoria attivi"
    )
    
    update.message.reply_text(help_text)
```

### Implementazione della funzionalità meteo

Creiamo il file `services/weather_api.py` per l'integrazione con un'API meteo:

```python
# services/weather_api.py
import requests
import logging
from config import WEATHER_API_KEY

logger = logging.getLogger(__name__)

BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

def get_weather(city):
    """Ottiene le informazioni meteo per una città"""
    try:
        params = {
            'q': city,
            'appid': WEATHER_API_KEY,
            'units': 'metric',
            'lang': 'it'
        }
        
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        # Estrai le informazioni rilevanti
        weather_info = {
            'city': data['name'],
            'country': data['sys']['country'],
            'temp': data['main']['temp'],
            'feels_like': data['main']['feels_like'],
            'description': data['weather'][0]['description'],
            'humidity': data['main']['humidity'],
            'wind_speed': data['wind']['speed'],
            'icon': data['weather'][0]['icon']
        }
        
        return weather_info
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Errore nella richiesta API meteo: {e}")
        return None
    except (KeyError, IndexError) as e:
        logger.error(f"Errore nel parsing dei dati meteo: {e}")
        return None
```

E ora il file `handlers/weather.py` per gestire il comando meteo:

```python
# handlers/weather.py
from telegram import Update
from telegram.ext import CallbackContext
import logging
from services.weather_api import get_weather

logger = logging.getLogger(__name__)

def weather(update: Update, context: CallbackContext):
    """Gestisce il comando /meteo"""
    # Controlla se è stata specificata una città
    if not context.args:
        update.message.reply_text(
            "Per favore specifica una città. Esempio: /meteo Roma"
        )
        return
    
    # Unisce tutti gli argomenti in caso di città con più parole
    city = ' '.join(context.args)
    
    # Ottieni le informazioni meteo
    weather_info = get_weather(city)
    
    if not weather_info:
        update.message.reply_text(
            f"Mi dispiace, non sono riuscito a trovare le informazioni meteo per {city}."
        )
        return
    
    # Formatta il messaggio di risposta
    message = (
        f"🌡️ Meteo per {weather_info['city']}, {weather_info['country']}:\n\n"
        f"Temperatura: {weather_info['temp']}°C\n"
        f"Percepita: {weather_info['feels_like']}°C\n"
        f"Condizioni: {weather_info['description']}\n"
        f"Umidità: {weather_info['humidity']}%\n"
        f"Vento: {weather_info['wind_speed']} m/s"
    )
    
    update.message.reply_text(message)
```

### Implementazione dei promemoria

Creiamo il file `database/models.py` per definire il modello dei promemoria:

```python
# database/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from config import DATABASE_URL

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    telegram_id = Column(Integer, unique=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    username = Column(String, nullable=True)
    
    reminders = relationship("Reminder", back_populates="user")
    
    def __repr__(self):
        return f"<User(telegram_id={self.telegram_id}, username={self.username})>"

class Reminder(Base):
    __tablename__ = 'reminders'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    message = Column(String, nullable=False)
    remind_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False)
    
    user = relationship("User", back_populates="reminders")
    
    def __repr__(self):
        return f"<Reminder(id={self.id}, user_id={self.user_id}, remind_at={self.remind_at})>"
```

Creiamo il file `database/db.py` per gestire la connessione al database:

```python
# database/db.py
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from config import DATABASE_URL
from database.models import Base

logger = logging.getLogger(__name__)

# Creazione dell'engine del database
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Inizializza il database creando tutte le tabelle necessarie"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database inizializzato con successo")
    except SQLAlchemyError as e:
        logger.error(f"Errore nell'inizializzazione del database: {e}")

def get_db_session():
    """Restituisce una sessione del database"""
    session = SessionLocal()
    try:
        return session
    finally:
        session.close()
```

Infine, creiamo il file `handlers/reminders.py` per gestire i promemoria:

```python
# handlers/reminders.py
from telegram import Update
from telegram.ext import CallbackContext
import logging
from datetime import datetime, timedelta
import re
from database.db import get_db_session
from database.models import User, Reminder

logger = logging.getLogger(__name__)

def set_reminder(update: Update, context: CallbackContext):
    """Gestisce il comando /promemoria"""
    if not context.args or len(context.args) < 2:
        update.message.reply_text(
            "Per favore specifica quando vuoi ricevere il promemoria e il messaggio. \n"
            "Esempio: /promemoria 30m Chiamare mamma"
        )
        return
    
    # Estrai il tempo e il messaggio
    time_str = context.args[0].lower()
    message = ' '.join(context.args[1:])
    
    # Parsing del tempo (supporta formati come 30m, 2h, 1d)
    time_match = re.match(r'^(\d+)([mhd])$', time_str)
    if not time_match:
        update.message.reply_text(
            "Formato tempo non valido. Usa formati come 30m, 2h, 1d."
        )
        return
    
    value, unit = time_match.groups()
    value = int(value)
    
    # Calcola il tempo del promemoria
    now = datetime.now()
    if unit == 'm':
        remind_at = now + timedelta(minutes=value)
    elif unit == 'h':
        remind_at = now + timedelta(hours=value)
    elif unit == 'd':
        remind_at = now + timedelta(days=value)
    
    # Salva il promemoria nel database
    session = get_db_session()
    try:
        # Trova o crea l'utente
        telegram_user = update.effective_user
        user = session.query(User).filter_by(telegram_id=telegram_user.id).first()
        if not user:
            user = User(
                telegram_id=telegram_user.id,
                first_name=telegram_user.first_name,
                last_name=telegram_user.last_name,
                username=telegram_user.username
            )
            session.add(user)
            session.commit()
        
        # Crea il promemoria
        reminder = Reminder(
            user_id=user.id,
            message=message,
            remind_at=remind_at,
            created_at=now
        )
        session.add(reminder)
        session.commit()
        
        # Pianifica il job per inviare il promemoria
        context.job_queue.run_once(
            send_reminder,
            remind_at - now,
            context={'chat_id': update.effective_chat.id, 'message': message, 'reminder_id': reminder.id}
        )
        
        # Formatta l'orario in modo leggibile
        formatted_time = remind_at.strftime('%H:%M del %d/%m/%Y')
        
        update.message.reply_text(
            f"✅ Promemoria impostato per le {formatted_time}:\n{message}"
        )
        
    except Exception as e:
        logger.error(f"Errore nell'impostazione del promemoria: {e}")
        session.rollback()
        update.message.reply_text(
            "Si è verificato un errore nell'impostazione del promemoria. Riprova più tardi."
        )
    finally:
        session.close()

def send_reminder(context: CallbackContext):
    """Invia un promemoria programmato"""
    job_data = context.job.context
    chat_id = job_data['chat_id']
    message = job_data['message']
    reminder_id = job_data['reminder_id']
    
    # Invia il messaggio di promemoria
    context.bot.send_message(
        chat_id=chat_id,
        text=f"⏰ PROMEMORIA:\n{message}"
    )
    
    # Aggiorna lo stato del promemoria nel database (opzionale)
    session = get_db_session()
    try:
        reminder = session.query(Reminder).filter_by(id=reminder_id).first()
        if reminder:
            session.delete(reminder)
            session.commit()
    except Exception as e:
        logger.error(f"Errore nell'aggiornamento del promemoria: {e}")
        session.rollback()
    finally:
        session.close()

def list_reminders(update: Update, context: CallbackContext):
    """Gestisce il comando /lista_promemoria"""
    session = get_db_session()
    try:
        # Trova l'utente
        telegram_user = update.effective_user
        user = session.query(User).filter_by(telegram_id=telegram_user.id).first()
        
        if not user or not user.reminders:
            update.message.reply_text("Non hai promemoria attivi.")
            return
        
        # Costruisci il messaggio con la lista dei promemoria
        message = "📋 I tuoi promemoria:\n\n"
        
        for i, reminder in enumerate(user.reminders, 1):
            formatted_time = reminder.remind_at.strftime('%H:%M del %d/%m/%Y')
            message += f"{i}. {formatted_time}: {reminder.message}\n"
        
        update.message.reply_text(message)
        
    except Exception as e:
        logger.error(f"Errore nel recupero dei promemoria: {e}")
        update.message.reply_text(
            "Si è verificato un errore nel recupero dei promemoria. Riprova più tardi."
        )
    finally:
        session.close()
```

## Test e debugging

Per testare il nostro bot, dobbiamo eseguire il file `bot.py` e interagire con il bot su Telegram. Ecco alcuni test che possiamo fare:

1. **Test dei comandi di base**:
   - Invia `/start` per verificare il messaggio di benvenuto
   - Invia `/help` per verificare la lista dei comandi

2. **Test della funzionalità meteo**:
   - Invia `/meteo Roma` per ottenere le previsioni meteo per Roma
   - Prova con città diverse e verifica che le risposte siano corrette

3. **Test dei promemoria**:
   - Invia `/promemoria 1m Test` per impostare un promemoria tra 1 minuto
   - Verifica che il promemoria arrivi all'orario stabilito
   - Invia `/lista_promemoria` per vedere i promemoria attivi

### Debugging comune

Ecco alcuni problemi comuni che potresti incontrare e come risolverli:

1. **Il bot non risponde**:
   - Verifica che il token API sia corretto
   - Controlla i log per eventuali errori
   - Assicurati che il bot sia in esecuzione

2. **Errori nelle API esterne**:
   - Verifica che le chiavi API siano valide
   - Controlla la connessione internet
   - Verifica i limiti di utilizzo delle API

3. **Problemi con i promemoria**:
   - Verifica che il database sia configurato correttamente
   - Controlla che il job_queue sia attivo
   - Verifica che il formato del tempo sia corretto

## Miglioramenti possibili

Ecco alcune idee per estendere e migliorare il nostro bot:

1. **Interfaccia utente avanzata**:
   - Aggiungere pulsanti inline per un'interazione più intuitiva
   - Implementare menu di navigazione
   - Utilizzare tastiere personalizzate per input specifici

2. **Funzionalità aggiuntive**:
   - Integrazione con più servizi esterni (traduzioni, ricerche, ecc.)
   - Sistema di notifiche periodiche (es. rassegna stampa quotidiana)
   - Funzionalità di gruppo (sondaggi, giochi, ecc.)

3. **Miglioramenti tecnici**:
   - Implementare un sistema di caching per ridurre le chiamate API
   - Aggiungere test automatizzati
   - Migliorare la gestione degli errori e il recupero
   - Implementare un sistema di analisi dell'utilizzo

4. **Personalizzazione**:
   - Permettere agli utenti di personalizzare le preferenze
   - Implementare un sistema di lingua multipla
   - Creare profili utente con preferenze salvate

## Conclusione

In questo progetto abbiamo creato un bot Telegram funzionale con diverse funzionalità utili. Abbiamo imparato a:

- Utilizzare l'API di Telegram per creare un bot
- Gestire comandi e messaggi degli utenti
- Integrare servizi esterni come API meteo
- Implementare un sistema di promemoria con database
- Strutturare un'applicazione Python di media complessità

Questo progetto può essere utilizzato come base per sviluppare bot più complessi e personalizzati secondo le tue esigenze.

## Navigazione

- [Torna all'indice dei progetti](../README.md)
- [Progetto precedente: Applicazione web con Flask](03-applicazione-web-flask.md)
- [Progetto successivo: Riconoscimento immagini con ML](05-riconoscimento-immagini.md)