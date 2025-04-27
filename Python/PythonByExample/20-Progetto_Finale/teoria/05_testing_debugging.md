# Testing e Debugging

Il testing e il debugging sono fasi cruciali nello sviluppo di software di qualità. In questa guida, imparerai come testare e debuggare efficacemente il tuo progetto Python finale.

## Obiettivi di apprendimento

- Comprendere l'importanza del testing nel ciclo di sviluppo software
- Imparare a scrivere test unitari, di integrazione e di sistema
- Utilizzare strumenti e tecniche di debugging efficaci
- Implementare pratiche di Continuous Integration (CI)

## Tipi di test

### Test unitari

I test unitari verificano il corretto funzionamento delle singole unità di codice (funzioni, metodi, classi) in isolamento.

**Esempio di test unitario con pytest:**
```python
# file: calculator.py
class Calculator:
    def add(self, a, b):
        return a + b
    
    def subtract(self, a, b):
        return a - b
    
    def multiply(self, a, b):
        return a * b
    
    def divide(self, a, b):
        if b == 0:
            raise ValueError("Divisione per zero non consentita")
        return a / b

# file: test_calculator.py
import pytest
from calculator import Calculator

class TestCalculator:
    def setup_method(self):
        self.calc = Calculator()
    
    def test_add(self):
        assert self.calc.add(2, 3) == 5
        assert self.calc.add(-1, 1) == 0
        assert self.calc.add(0, 0) == 0
    
    def test_subtract(self):
        assert self.calc.subtract(5, 3) == 2
        assert self.calc.subtract(1, 1) == 0
        assert self.calc.subtract(0, 5) == -5
    
    def test_multiply(self):
        assert self.calc.multiply(2, 3) == 6
        assert self.calc.multiply(-1, 1) == -1
        assert self.calc.multiply(0, 5) == 0
    
    def test_divide(self):
        assert self.calc.divide(6, 3) == 2
        assert self.calc.divide(1, 1) == 1
        assert self.calc.divide(0, 5) == 0
    
    def test_divide_by_zero(self):
        with pytest.raises(ValueError):
            self.calc.divide(5, 0)
```

### Test di integrazione

I test di integrazione verificano che diversi moduli o servizi funzionino correttamente insieme.

**Esempio di test di integrazione:**
```python
# file: test_user_service_integration.py
import pytest
import os
import tempfile
from user_repository import FileUserRepository
from user_service import UserService
from user import User

class TestUserServiceIntegration:
    def setup_method(self):
        # Crea una directory temporanea per i test
        self.temp_dir = tempfile.TemporaryDirectory()
        self.repository = FileUserRepository(self.temp_dir.name)
        self.service = UserService(self.repository)
    
    def teardown_method(self):
        # Pulisce la directory temporanea dopo i test
        self.temp_dir.cleanup()
    
    def test_create_and_get_user(self):
        # Crea un nuovo utente
        user_id = self.service.create_user("testuser", "test@example.com")
        
        # Verifica che l'utente sia stato creato correttamente
        user = self.service.get_user(user_id)
        assert user is not None
        assert user.username == "testuser"
        assert user.email == "test@example.com"
    
    def test_update_user(self):
        # Crea un nuovo utente
        user_id = self.service.create_user("oldname", "old@example.com")
        
        # Aggiorna l'utente
        self.service.update_user(user_id, "newname", "new@example.com")
        
        # Verifica che l'utente sia stato aggiornato correttamente
        user = self.service.get_user(user_id)
        assert user.username == "newname"
        assert user.email == "new@example.com"
```

### Test di sistema

I test di sistema verificano che l'intero sistema funzioni correttamente nel suo insieme.

**Esempio di test di sistema per un'applicazione web:**
```python
# file: test_web_app_system.py
import pytest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from app import create_app, init_db
import threading
import time

class TestWebAppSystem:
    @classmethod
    def setup_class(cls):
        # Inizializza l'applicazione e il database
        cls.app = create_app('testing')
        cls.client = cls.app.test_client()
        with cls.app.app_context():
            init_db()
        
        # Avvia l'applicazione in un thread separato
        cls.server_thread = threading.Thread(target=cls.app.run, kwargs={'port': 5000})
        cls.server_thread.daemon = True
        cls.server_thread.start()
        time.sleep(1)  # Attendi che il server si avvii
        
        # Inizializza il browser per i test
        cls.browser = webdriver.Firefox()
    
    @classmethod
    def teardown_class(cls):
        # Chiudi il browser
        cls.browser.quit()
    
    def test_login_and_access_protected_page(self):
        # Vai alla pagina di login
        self.browser.get('http://localhost:5000/login')
        
        # Inserisci le credenziali
        username_input = self.browser.find_element_by_id('username')
        password_input = self.browser.find_element_by_id('password')
        username_input.send_keys('testuser')
        password_input.send_keys('password123')
        password_input.send_keys(Keys.RETURN)
        
        # Verifica che il login sia avvenuto con successo
        assert 'Dashboard' in self.browser.page_source
        
        # Accedi a una pagina protetta
        self.browser.get('http://localhost:5000/profile')
        
        # Verifica che la pagina sia accessibile
        assert 'Profile' in self.browser.page_source
        assert 'testuser' in self.browser.page_source
```

## Strumenti di testing

### pytest

pytest è uno dei framework di testing più popolari per Python. Offre funzionalità avanzate come fixture, parametrizzazione dei test e plugin.

**Installazione:**
```bash
pip install pytest
```

**Esecuzione dei test:**
```bash
pytest                  # Esegue tutti i test
pytest test_file.py     # Esegue i test in un file specifico
pytest -v               # Modalità verbose
pytest -k "add"         # Esegue solo i test che contengono "add" nel nome
pytest --cov=myapp      # Misura la copertura del codice
```

### unittest

unittest è il framework di testing incluso nella libreria standard di Python.

**Esempio di test con unittest:**
```python
import unittest
from calculator import Calculator

class TestCalculator(unittest.TestCase):
    def setUp(self):
        self.calc = Calculator()
    
    def test_add(self):
        self.assertEqual(self.calc.add(2, 3), 5)
        self.assertEqual(self.calc.add(-1, 1), 0)
        self.assertEqual(self.calc.add(0, 0), 0)
    
    def test_divide_by_zero(self):
        with self.assertRaises(ValueError):
            self.calc.divide(5, 0)

if __name__ == '__main__':
    unittest.main()
```

### Mock e patch

I mock sono oggetti che simulano il comportamento di oggetti reali in modo controllato. Sono utili per isolare l'unità di codice che si sta testando.

**Esempio di mock con unittest.mock:**
```python
from unittest.mock import Mock, patch
import pytest
from user_service import UserService

def test_get_user_with_mock():
    # Crea un mock del repository
    mock_repository = Mock()
    
    # Configura il comportamento del mock
    mock_repository.get_by_id.return_value = {
        'id': 1,
        'username': 'testuser',
        'email': 'test@example.com'
    }
    
    # Crea il servizio con il mock
    service = UserService(mock_repository)
    
    # Chiama il metodo da testare
    user = service.get_user(1)
    
    # Verifica il risultato
    assert user.id == 1
    assert user.username == 'testuser'
    assert user.email == 'test@example.com'
    
    # Verifica che il mock sia stato chiamato correttamente
    mock_repository.get_by_id.assert_called_once_with(1)

# Esempio di patch
@patch('requests.get')
def test_fetch_user_data(mock_get):
    # Configura il mock
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'id': 1,
        'name': 'John Doe',
        'email': 'john@example.com'
    }
    mock_get.return_value = mock_response
    
    # Importa la funzione da testare
    from user_api import fetch_user_data
    
    # Chiama la funzione
    user = fetch_user_data(1)
    
    # Verifica il risultato
    assert user['name'] == 'John Doe'
    assert user['email'] == 'john@example.com'
    
    # Verifica che la richiesta sia stata fatta correttamente
    mock_get.assert_called_once_with('https://api.example.com/users/1')
```

## Debugging

Il debugging è il processo di identificazione e risoluzione dei bug nel codice.

### Tecniche di debugging

#### Print debugging

Il metodo più semplice di debugging è l'inserimento di istruzioni `print()` nel codice per visualizzare lo stato delle variabili.

```python
def calculate_total(items):
    print(f"Items: {items}")  # Debug
    total = 0
    for item in items:
        print(f"Processing item: {item}")  # Debug
        total += item['price'] * item['quantity']
        print(f"Current total: {total}")  # Debug
    return total
```

#### Logging

Il logging è un'alternativa più flessibile e potente rispetto al print debugging.

```python
import logging

# Configurazione del logger
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def calculate_total(items):
    logger.debug(f"Items: {items}")
    total = 0
    for item in items:
        logger.debug(f"Processing item: {item}")
        total += item['price'] * item['quantity']
        logger.debug(f"Current total: {total}")
    return total
```

#### Debugger interattivo (pdb)

Python include un debugger interattivo chiamato pdb che permette di eseguire il codice passo-passo e ispezionare lo stato delle variabili.

```python
import pdb

def complex_function(data):
    result = []
    for item in data:
        # Inserisci un breakpoint
        pdb.set_trace()
        processed = process_item(item)
        result.append(processed)
    return result
```

Comandi utili di pdb:
- `n` (next): esegue la linea corrente e passa alla successiva
- `s` (step): entra nella funzione chiamata
- `c` (continue): continua l'esecuzione fino al prossimo breakpoint
- `p expression` (print): valuta e stampa un'espressione
- `q` (quit): esce dal debugger

### Strumenti di debugging

#### IDE con supporto al debugging

La maggior parte degli IDE moderni (PyCharm, VS Code, ecc.) offre strumenti di debugging integrati che permettono di:
- Impostare breakpoint
- Eseguire il codice passo-passo
- Ispezionare variabili
- Valutare espressioni

#### Profiling

Il profiling è utile per identificare colli di bottiglia nelle prestazioni.

```python
import cProfile

def slow_function():
    result = 0
    for i in range(1000000):
        result += i
    return result

# Profila la funzione
cProfile.run('slow_function()')
```

## Continuous Integration (CI)

La Continuous Integration è una pratica che consiste nell'integrare frequentemente il codice in un repository condiviso e verificare automaticamente la qualità del codice.

### GitHub Actions

GitHub Actions è un servizio di CI/CD integrato in GitHub.

**Esempio di workflow GitHub Actions per Python:**
```yaml
# .github/workflows/python-tests.yml
name: Python Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.7, 3.8, 3.9]

    steps:
    - uses: actions/checkout@v2
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v2
      with:
        python-version: ${{ matrix.python-version }}
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install pytest pytest-cov
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    - name: Test with pytest
      run: |
        pytest --cov=myapp tests/
```

## Best practices per il testing

1. **Scrivi i test prima o durante lo sviluppo**, non dopo
2. **Mantieni i test semplici e focalizzati** su una singola funzionalità
3. **Usa nomi descrittivi** per i test
4. **Isola i test** dall'ambiente esterno
5. **Automatizza l'esecuzione dei test** con CI
6. **Misura la copertura del codice** per identificare parti non testate
7. **Testa i casi limite e gli scenari di errore**, non solo il flusso normale

## Esercizio pratico

1. Scegli un modulo del tuo progetto finale
2. Scrivi test unitari per le principali funzionalità del modulo
3. Implementa almeno un test di integrazione
4. Configura un sistema di CI per il tuo progetto
5. Usa il debugger per risolvere un bug nel tuo codice

## Risorse aggiuntive

- [Documentazione ufficiale di pytest](https://docs.pytest.org/)
- [Documentazione di unittest](https://docs.python.org/3/library/unittest.html)
- [Guida al debugging in Python](https://realpython.com/python-debugging-pdb/)
- [Guida a GitHub Actions per Python](https://docs.github.com/en/actions/guides/building-and-testing-python)

---

[Guida Precedente: Implementazione del codice](./04_implementazione_codice.md) | [Guida Successiva: Documentazione](./06_documentazione.md) | [Torna all'indice principale](../README.md)