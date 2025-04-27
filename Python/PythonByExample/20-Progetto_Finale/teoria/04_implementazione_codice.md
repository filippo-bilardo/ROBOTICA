# Implementazione del Codice

L'implementazione del codice è la fase in cui trasformi la progettazione in un'applicazione funzionante. In questa guida, imparerai le migliori pratiche per implementare il codice del tuo progetto Python finale.

## Obiettivi di apprendimento

- Applicare le migliori pratiche di programmazione in Python
- Implementare un'architettura modulare e manutenibile
- Utilizzare librerie e framework appropriati
- Gestire le dipendenze del progetto
- Seguire standard di codifica e convenzioni di stile

## Struttura del progetto

Una buona struttura del progetto è fondamentale per la manutenibilità e la scalabilità. Ecco un esempio di struttura per un progetto Python:

```
project_name/
├── README.md                 # Documentazione principale
├── requirements.txt          # Dipendenze del progetto
├── setup.py                  # Script di installazione
├── .gitignore                # File da ignorare in Git
├── project_name/             # Codice sorgente principale
│   ├── __init__.py           # Rende la directory un pacchetto Python
│   ├── main.py               # Punto di ingresso dell'applicazione
│   ├── config.py             # Configurazione dell'applicazione
│   ├── module1/              # Modulo 1
│   │   ├── __init__.py
│   │   └── module1.py
│   └── module2/              # Modulo 2
│       ├── __init__.py
│       └── module2.py
├── tests/                    # Test unitari e di integrazione
│   ├── __init__.py
│   ├── test_module1.py
│   └── test_module2.py
└── docs/                     # Documentazione aggiuntiva
    ├── user_guide.md
    └── developer_guide.md
```

## Convenzioni di stile e standard di codifica

Python ha una guida di stile ufficiale chiamata PEP 8, che definisce le convenzioni per scrivere codice Python leggibile e manutenibile.

### Principali convenzioni PEP 8

- **Indentazione**: Usa 4 spazi per livello di indentazione (non tabulazioni)
- **Lunghezza delle linee**: Limita le linee a 79 caratteri
- **Linee vuote**: Usa linee vuote per separare funzioni e classi
- **Importazioni**: Metti le importazioni all'inizio del file, una per riga
- **Spazi**: Usa spazi attorno agli operatori e dopo le virgole
- **Convenzioni di denominazione**:
  - `snake_case` per variabili, funzioni e metodi
  - `PascalCase` per classi
  - `UPPERCASE_WITH_UNDERSCORES` per costanti

**Esempio di codice conforme a PEP 8:**
```python
# Importazioni organizzate
import os
import sys
from datetime import datetime

# Costante
MAX_USERS = 100

# Classe in PascalCase
class UserManager:
    """Classe per gestire gli utenti del sistema."""
    
    def __init__(self, database):
        """Inizializza il gestore utenti.
        
        Args:
            database: Connessione al database
        """
        self.database = database
        self.users = []
    
    # Metodo in snake_case
    def add_user(self, username, email):
        """Aggiunge un nuovo utente.
        
        Args:
            username: Nome utente
            email: Indirizzo email
            
        Returns:
            bool: True se l'utente è stato aggiunto, False altrimenti
        """
        if len(self.users) >= MAX_USERS:
            return False
        
        # Variabile in snake_case
        current_time = datetime.now()
        
        # Linee limitate a 79 caratteri
        self.users.append({
            'username': username,
            'email': email,
            'created_at': current_time
        })
        
        return True
```

## Gestione delle dipendenze

La gestione delle dipendenze è essenziale per garantire che il tuo progetto possa essere facilmente installato e eseguito da altri.

### requirements.txt

Il file `requirements.txt` elenca tutte le dipendenze del progetto con le loro versioni specifiche.

**Esempio di requirements.txt:**
```
flask==2.0.1
sqlalchemy==1.4.23
pandas==1.3.2
matplotlib==3.4.3
pytest==6.2.5
```

### Ambienti virtuali

Gli ambienti virtuali permettono di isolare le dipendenze del progetto dalle altre applicazioni Python sul sistema.

**Creazione e attivazione di un ambiente virtuale:**
```bash
# Creazione dell'ambiente virtuale
python -m venv venv

# Attivazione dell'ambiente virtuale (Windows)
venv\Scripts\activate

# Attivazione dell'ambiente virtuale (macOS/Linux)
source venv/bin/activate

# Installazione delle dipendenze
pip install -r requirements.txt
```

## Implementazione dei moduli

L'implementazione dei moduli dovrebbe seguire i principi di progettazione discussi nella guida precedente.

### Esempio di implementazione di un modulo

**Definizione dell'interfaccia (abstract class):**
```python
# storage.py
from abc import ABC, abstractmethod

class Storage(ABC):
    """Interfaccia per l'accesso ai dati."""
    
    @abstractmethod
    def save(self, data):
        """Salva i dati.
        
        Args:
            data: Dati da salvare
            
        Returns:
            bool: True se il salvataggio è riuscito, False altrimenti
        """
        pass
    
    @abstractmethod
    def load(self, id):
        """Carica i dati.
        
        Args:
            id: Identificatore dei dati
            
        Returns:
            dict: Dati caricati o None se non trovati
        """
        pass
```

**Implementazione concreta:**
```python
# file_storage.py
from .storage import Storage
import json
import os

class FileStorage(Storage):
    """Implementazione dell'interfaccia Storage per file JSON."""
    
    def __init__(self, directory):
        """Inizializza lo storage su file.
        
        Args:
            directory: Directory dove salvare i file
        """
        self.directory = directory
        os.makedirs(directory, exist_ok=True)
    
    def save(self, data):
        """Salva i dati in un file JSON.
        
        Args:
            data: Dati da salvare (deve contenere una chiave 'id')
            
        Returns:
            bool: True se il salvataggio è riuscito, False altrimenti
        """
        if 'id' not in data:
            return False
        
        file_path = os.path.join(self.directory, f"{data['id']}.json")
        
        try:
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Errore durante il salvataggio: {e}")
            return False
    
    def load(self, id):
        """Carica i dati da un file JSON.
        
        Args:
            id: Identificatore dei dati
            
        Returns:
            dict: Dati caricati o None se non trovati
        """
        file_path = os.path.join(self.directory, f"{id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Errore durante il caricamento: {e}")
            return None
```

## Gestione degli errori

Una buona gestione degli errori è fondamentale per creare applicazioni robuste e affidabili.

### Principi di gestione degli errori

- Usa le eccezioni per gestire situazioni eccezionali
- Crea eccezioni personalizzate per il tuo dominio
- Cattura solo le eccezioni che puoi gestire
- Fornisci messaggi di errore chiari e informativi

**Esempio di gestione degli errori:**
```python
class UserNotFoundError(Exception):
    """Eccezione sollevata quando un utente non viene trovato."""
    pass

class UserService:
    def __init__(self, repository):
        self.repository = repository
    
    def get_user(self, user_id):
        """Ottiene un utente dal repository.
        
        Args:
            user_id: ID dell'utente
            
        Returns:
            User: L'utente trovato
            
        Raises:
            UserNotFoundError: Se l'utente non viene trovato
        """
        user = self.repository.get_by_id(user_id)
        
        if user is None:
            raise UserNotFoundError(f"Utente con ID {user_id} non trovato")
        
        return user

# Utilizzo
try:
    user = user_service.get_user(123)
    print(f"Utente trovato: {user.username}")
except UserNotFoundError as e:
    print(f"Errore: {e}")
except Exception as e:
    print(f"Errore imprevisto: {e}")
```

## Logging

Il logging è essenziale per il debug e il monitoraggio delle applicazioni in produzione.

**Esempio di configurazione del logging:**
```python
import logging

# Configurazione del logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Utilizzo del logger
def process_data(data):
    logger.info(f"Elaborazione dati iniziata: {len(data)} elementi")
    
    try:
        # Elaborazione dei dati
        result = [item * 2 for item in data]
        logger.info("Elaborazione dati completata con successo")
        return result
    except Exception as e:
        logger.error(f"Errore durante l'elaborazione dei dati: {e}", exc_info=True)
        raise
```

## Testing durante l'implementazione

Il testing durante l'implementazione aiuta a identificare e risolvere i problemi in modo tempestivo.

### Test-Driven Development (TDD)

Il TDD è un approccio in cui scrivi prima i test e poi il codice per farli passare.

**Esempio di TDD con pytest:**
```python
# test_calculator.py
import pytest
from calculator import Calculator

def test_addition():
    calc = Calculator()
    assert calc.add(2, 3) == 5
    assert calc.add(-1, 1) == 0
    assert calc.add(0, 0) == 0

def test_subtraction():
    calc = Calculator()
    assert calc.subtract(5, 3) == 2
    assert calc.subtract(1, 1) == 0
    assert calc.subtract(0, 5) == -5

# calculator.py
class Calculator:
    def add(self, a, b):
        return a + b
    
    def subtract(self, a, b):
        return a - b
```

## Integrazione dei moduli

L'integrazione dei moduli è il processo di combinare i vari componenti del sistema per formare un'applicazione completa.

**Esempio di integrazione dei moduli:**
```python
# main.py
from config import Config
from storage import FileStorage
from user_service import UserService
from api import create_app

def main():
    # Inizializzazione dei componenti
    config = Config.load_from_file("config.json")
    storage = FileStorage(config.data_directory)
    user_service = UserService(storage)
    
    # Creazione dell'applicazione
    app = create_app(config, user_service)
    
    # Avvio dell'applicazione
    app.run(host=config.host, port=config.port)

if __name__ == "__main__":
    main()
```

## Esercizio pratico

1. Crea la struttura del progetto per la tua applicazione
2. Implementa almeno due moduli principali seguendo i principi di progettazione
3. Configura la gestione delle dipendenze con un file requirements.txt
4. Implementa la gestione degli errori e il logging
5. Scrivi test unitari per i tuoi moduli

## Risorse aggiuntive

- [PEP 8 - Guida di stile per il codice Python](https://www.python.org/dev/peps/pep-0008/)
- [Documentazione ufficiale di pytest](https://docs.pytest.org/)
- [Guida alla gestione delle eccezioni in Python](https://docs.python.org/3/tutorial/errors.html)
- [Documentazione del modulo logging](https://docs.python.org/3/library/logging.html)

---

[Guida Precedente: Progettazione dell'architettura](./03_progettazione_architettura.md) | [Guida Successiva: Testing e debugging](./05_testing_debugging.md) | [Torna all'indice principale](../README.md)