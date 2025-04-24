# Mocking e Patching in Python

## Introduzione al Mocking

Il mocking è una tecnica utilizzata nei test unitari per sostituire parti del sistema con oggetti simulati (mock) che imitano il comportamento dei componenti reali. Questo è particolarmente utile quando si testano componenti che dipendono da risorse esterne come database, API web, file system o altri servizi.

I principali vantaggi del mocking sono:

- **Isolamento**: Permette di testare un componente in isolamento, indipendentemente dalle sue dipendenze
- **Velocità**: I test che utilizzano mock sono generalmente più veloci di quelli che interagiscono con sistemi reali
- **Determinismo**: I mock hanno un comportamento prevedibile, eliminando la variabilità dei sistemi esterni
- **Controllo**: Permette di simulare scenari difficili da riprodurre con componenti reali (es. errori di rete)

## La libreria unittest.mock

In Python 3, la libreria standard include `unittest.mock`, un potente framework per creare e utilizzare oggetti mock nei test. Nelle versioni precedenti di Python, era disponibile come pacchetto separato chiamato `mock`.

### Oggetti Mock

L'oggetto base di `unittest.mock` è la classe `Mock`, che crea un oggetto che può sostituire qualsiasi altro oggetto e registrare come viene utilizzato.

```python
from unittest.mock import Mock

# Creazione di un mock
mock_object = Mock()

# Utilizzo del mock
mock_object.method(1, 2, 3)
mock_object.attribute = 'value'

# Verifica delle chiamate
print(mock_object.method.called)  # True
print(mock_object.method.call_args)  # call(1, 2, 3)
print(mock_object.method.call_count)  # 1
```

### Configurazione dei Mock

I mock possono essere configurati per restituire valori specifici o sollevare eccezioni:

```python
from unittest.mock import Mock

# Configurazione del valore di ritorno
mock_response = Mock()
mock_response.status_code = 200
mock_response.json.return_value = {"data": "test"}

# Utilizzo
print(mock_response.status_code)  # 200
print(mock_response.json())  # {"data": "test"}

# Configurazione per sollevare un'eccezione
mock_error = Mock()
mock_error.side_effect = ValueError("Errore simulato")

try:
    mock_error()
except ValueError as e:
    print(str(e))  # "Errore simulato"
```

### MagicMock

`MagicMock` è una sottoclasse di `Mock` che implementa la maggior parte dei magic method di Python:

```python
from unittest.mock import MagicMock

mock = MagicMock()

# I magic method sono già implementati
print(mock.__str__())  # Restituisce una stringa
print(mock.__int__())  # Restituisce un intero
print(len(mock))       # Funziona perché __len__ è implementato
```

## Patching

Il patching è il processo di sostituzione temporanea di un oggetto con un mock durante l'esecuzione di un test. `unittest.mock` fornisce diverse funzioni per il patching:

### patch come decoratore

```python
import unittest
from unittest.mock import patch
import requests

def get_user_data(user_id):
    response = requests.get(f"https://api.example.com/users/{user_id}")
    if response.status_code == 200:
        return response.json()
    return None

class TestUserData(unittest.TestCase):
    @patch('requests.get')
    def test_get_user_data_success(self, mock_get):
        # Configurazione del mock
        mock_response = unittest.mock.Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"id": 1, "name": "Mario Rossi"}
        mock_get.return_value = mock_response
        
        # Test della funzione
        result = get_user_data(1)
        
        # Verifiche
        mock_get.assert_called_once_with("https://api.example.com/users/1")
        self.assertEqual(result, {"id": 1, "name": "Mario Rossi"})
    
    @patch('requests.get')
    def test_get_user_data_error(self, mock_get):
        # Configurazione del mock per simulare un errore
        mock_response = unittest.mock.Mock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        # Test della funzione
        result = get_user_data(999)
        
        # Verifiche
        mock_get.assert_called_once_with("https://api.example.com/users/999")
        self.assertIsNone(result)
```

### patch come context manager

```python
def test_with_context_manager():
    with patch('requests.get') as mock_get:
        mock_response = unittest.mock.Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"data": "test"}
        mock_get.return_value = mock_response
        
        # Il codice all'interno del blocco with utilizzerà il mock
        response = requests.get("https://example.com")
        assert response.json() == {"data": "test"}
```

### patch.object

`patch.object` permette di sostituire un attributo specifico di un oggetto:

```python
class Database:
    def connect(self):
        # Connessione reale al database
        pass
    
    def query(self, sql):
        # Esecuzione della query
        pass

db = Database()

def test_database_query():
    with patch.object(db, 'connect') as mock_connect:
        with patch.object(db, 'query', return_value=[{"id": 1, "name": "Test"}]) as mock_query:
            # db.connect è ora un mock
            # db.query è ora un mock che restituisce [{"id": 1, "name": "Test"}]
            
            db.connect()
            result = db.query("SELECT * FROM users")
            
            mock_connect.assert_called_once()
            mock_query.assert_called_once_with("SELECT * FROM users")
            assert result == [{"id": 1, "name": "Test"}]
```

### patch.dict

`patch.dict` permette di modificare temporaneamente un dizionario:

```python
import os

def get_env_var(name, default=None):
    return os.environ.get(name, default)

def test_env_vars():
    with patch.dict('os.environ', {'API_KEY': 'test_key', 'DEBUG': 'true'}):
        assert get_env_var('API_KEY') == 'test_key'
        assert get_env_var('DEBUG') == 'true'
        assert get_env_var('NONEXISTENT') is None
```

## Mocking di Classi

È possibile creare mock di intere classi:

```python
from unittest.mock import patch, MagicMock

class Database:
    def __init__(self, connection_string):
        self.connection_string = connection_string
        self.connect()
    
    def connect(self):
        # Connessione reale al database
        pass
    
    def query(self, sql):
        # Esecuzione della query
        pass

class UserRepository:
    def __init__(self, db):
        self.db = db
    
    def get_user(self, user_id):
        result = self.db.query(f"SELECT * FROM users WHERE id = {user_id}")
        return result[0] if result else None

# Test con mock della classe Database
def test_user_repository():
    with patch('__main__.Database') as MockDatabase:
        # Configurazione del mock
        mock_db_instance = MagicMock()
        mock_db_instance.query.return_value = [{"id": 1, "name": "Mario Rossi"}]
        MockDatabase.return_value = mock_db_instance
        
        # Utilizzo della classe che dipende dal database
        repo = UserRepository(Database("connection_string"))
        user = repo.get_user(1)
        
        # Verifiche
        MockDatabase.assert_called_once_with("connection_string")
        mock_db_instance.query.assert_called_once_with("SELECT * FROM users WHERE id = 1")
        assert user == {"id": 1, "name": "Mario Rossi"}
```

## Mocking di Moduli

A volte è necessario mockare interi moduli, specialmente quando si tratta di librerie esterne:

```python
# Supponiamo di avere un modulo external_api.py
# external_api.py
def get_weather(city):
    # Chiamata a un'API esterna
    pass

def get_news():
    # Altra chiamata API
    pass

# Nel nostro codice
from external_api import get_weather, get_news

def display_weather_and_news(city):
    weather = get_weather(city)
    news = get_news()
    return f"Meteo: {weather}, Notizie: {news}"

# Nel test
import sys
from unittest.mock import MagicMock

# Creazione di un mock dell'intero modulo
mock_external_api = MagicMock()
mock_external_api.get_weather.return_value = "Soleggiato"
mock_external_api.get_news.return_value = "Nessuna nuova, buona nuova"

# Sostituzione del modulo nel sys.modules
sys.modules['external_api'] = mock_external_api

# Ora quando il codice importa external_api, otterrà il nostro mock
result = display_weather_and_news("Roma")
assert result == "Meteo: Soleggiato, Notizie: Nessuna nuova, buona nuova"
```

## Spy vs Mock

Un "spy" è un tipo speciale di mock che registra le chiamate ma lascia che l'oggetto reale esegua il suo comportamento normale:

```python
from unittest.mock import create_autospec

def funzione_reale(a, b):
    return a + b

# Creazione di uno spy
spy = create_autospec(funzione_reale, wraps=funzione_reale)

# Utilizzo dello spy
result = spy(5, 3)

# Lo spy ha registrato la chiamata
assert spy.call_count == 1
assert spy.call_args == ((5, 3), {})

# Ma ha anche eseguito la funzione reale
assert result == 8
```

## Best Practices nel Mocking

1. **Mock al giusto livello**: Mockare solo ciò che è necessario, preferibilmente ai confini del sistema
2. **Evitare il mocking eccessivo**: Troppi mock possono rendere i test fragili e poco significativi
3. **Verificare le chiamate**: Assicurarsi che i mock siano chiamati come previsto
4. **Attenzione ai dettagli di implementazione**: I test non dovrebbero dipendere troppo dai dettagli di implementazione
5. **Usare autospec**: `create_autospec` o `patch(..., autospec=True)` per garantire che i mock abbiano la stessa interfaccia degli oggetti reali

## Conclusione

Il mocking e il patching sono tecniche potenti per isolare il codice durante i test unitari. Permettono di testare componenti che dipendono da risorse esterne senza dover interagire con queste risorse, rendendo i test più veloci, più affidabili e più facili da configurare.

Nel prossimo capitolo, esploreremo pytest, un framework di testing avanzato che offre funzionalità aggiuntive rispetto a unittest.

## Risorse Aggiuntive

- [Documentazione ufficiale di unittest.mock](https://docs.python.org/3/library/unittest.mock.html)
- [Python Mocking 101](https://www.fugue.co/blog/2016-02-11-python-mocking-101)

[Torna all'indice](../README.md) | [Capitolo precedente: Test-Driven Development](03-tdd.md) | [Capitolo successivo: Pytest](05-pytest.md)