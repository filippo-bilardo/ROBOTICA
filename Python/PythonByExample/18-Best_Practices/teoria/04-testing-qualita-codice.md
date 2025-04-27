# Testing e Qualità del Codice in Python

In questa guida esploreremo le migliori pratiche per il testing e la garanzia della qualità del codice in Python, elementi fondamentali per lo sviluppo di software affidabile e manutenibile.

## Importanza del testing

Il testing del software è un processo cruciale per diversi motivi:

- Verifica che il codice funzioni come previsto
- Previene la regressione quando si apportano modifiche
- Documenta il comportamento atteso del codice
- Migliora la progettazione del software
- Aumenta la fiducia nelle modifiche al codice
- Riduce i costi di manutenzione a lungo termine

Come dice il proverbio: "Misura due volte, taglia una volta" - il testing è la "misurazione" del software.

## Tipi di test in Python

### 1. Test unitari

I test unitari verificano il corretto funzionamento di singole unità di codice (funzioni, metodi, classi) in isolamento.

#### Utilizzo di unittest

`unittest` è il framework di testing incluso nella libreria standard di Python.

```python
import unittest
from mymodule import sum_numbers

class TestSumNumbers(unittest.TestCase):
    def test_sum_positive_numbers(self):
        self.assertEqual(sum_numbers([1, 2, 3]), 6)
        
    def test_sum_negative_numbers(self):
        self.assertEqual(sum_numbers([-1, -2, -3]), -6)
        
    def test_sum_mixed_numbers(self):
        self.assertEqual(sum_numbers([1, -2, 3]), 2)
        
    def test_sum_empty_list(self):
        self.assertEqual(sum_numbers([]), 0)
        
    def test_sum_invalid_input(self):
        with self.assertRaises(TypeError):
            sum_numbers("not a list")

if __name__ == '__main__':
    unittest.main()
```

#### Utilizzo di pytest

`pytest` è un framework di testing più moderno e flessibile, molto popolare nella comunità Python.

```python
import pytest
from mymodule import sum_numbers

def test_sum_positive_numbers():
    assert sum_numbers([1, 2, 3]) == 6
    
def test_sum_negative_numbers():
    assert sum_numbers([-1, -2, -3]) == -6
    
def test_sum_mixed_numbers():
    assert sum_numbers([1, -2, 3]) == 2
    
def test_sum_empty_list():
    assert sum_numbers([]) == 0
    
def test_sum_invalid_input():
    with pytest.raises(TypeError):
        sum_numbers("not a list")
```

Esecuzione dei test con pytest:

```bash
pip install pytest
pytest test_mymodule.py -v
```

### 2. Test di integrazione

I test di integrazione verificano che diverse unità di codice funzionino correttamente insieme.

```python
import pytest
from myapp.database import Database
from myapp.user_service import UserService

@pytest.fixture
def db():
    # Configurazione del database di test
    db = Database("sqlite:///:memory:")
    db.create_tables()
    yield db
    # Pulizia dopo i test
    db.drop_tables()

@pytest.fixture
def user_service(db):
    return UserService(db)

def test_create_and_get_user(user_service):
    # Test di integrazione tra UserService e Database
    user_id = user_service.create_user("test@example.com", "password123")
    user = user_service.get_user_by_id(user_id)
    
    assert user is not None
    assert user.email == "test@example.com"
```

### 3. Test funzionali

I test funzionali verificano che il sistema soddisfi i requisiti funzionali dal punto di vista dell'utente.

```python
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By

@pytest.fixture
def browser():
    driver = webdriver.Chrome()
    driver.implicitly_wait(10)
    yield driver
    driver.quit()

def test_login_functionality(browser):
    # Apri la pagina di login
    browser.get("http://localhost:8000/login")
    
    # Inserisci credenziali
    browser.find_element(By.ID, "email").send_keys("user@example.com")
    browser.find_element(By.ID, "password").send_keys("password123")
    browser.find_element(By.ID, "login-button").click()
    
    # Verifica che il login sia avvenuto con successo
    assert "Dashboard" in browser.title
    welcome_message = browser.find_element(By.ID, "welcome-message").text
    assert "Benvenuto" in welcome_message
```

### 4. Test di performance

I test di performance verificano che il sistema soddisfi i requisiti di prestazioni.

```python
import time
import pytest
from myapp.data_processor import process_large_dataset

def test_processing_performance():
    data = generate_test_data(1000000)  # Genera un milione di record
    
    start_time = time.time()
    result = process_large_dataset(data)
    end_time = time.time()
    
    processing_time = end_time - start_time
    
    # Verifica che l'elaborazione avvenga entro un tempo ragionevole
    assert processing_time < 5.0  # Deve completarsi in meno di 5 secondi
    assert len(result) == len(data)  # Verifica che tutti i dati siano stati elaborati
```

## Test-Driven Development (TDD)

Il Test-Driven Development è una metodologia di sviluppo che prevede la scrittura dei test prima dell'implementazione del codice.

### Ciclo TDD

1. **Red**: Scrivi un test che fallisce
2. **Green**: Scrivi il codice minimo necessario per far passare il test
3. **Refactor**: Migliora il codice mantenendo i test in verde

### Esempio di TDD

```python
# 1. Red - Scrivi un test che fallisce
def test_calcola_sconto():
    assert calcola_sconto(100, 20) == 80
    assert calcola_sconto(100, 0) == 100
    assert calcola_sconto(100, 100) == 0

# Il test fallirà perché la funzione non esiste ancora

# 2. Green - Implementa la funzione minima per far passare il test
def calcola_sconto(prezzo, percentuale_sconto):
    return prezzo - (prezzo * percentuale_sconto / 100)

# 3. Refactor - Migliora il codice se necessario
def calcola_sconto(prezzo, percentuale_sconto):
    """Calcola il prezzo scontato.
    
    Args:
        prezzo: Il prezzo originale
        percentuale_sconto: La percentuale di sconto (0-100)
        
    Returns:
        Il prezzo scontato
    """
    return prezzo * (1 - percentuale_sconto / 100)
```

## Mocking e patching

Il mocking è una tecnica che permette di simulare il comportamento di oggetti reali in modo controllato durante i test.

### Utilizzo di unittest.mock

```python
import unittest
from unittest.mock import Mock, patch
from myapp.weather_service import WeatherService

class TestWeatherService(unittest.TestCase):
    def test_get_temperature(self):
        # Crea un mock per la risposta HTTP
        mock_response = Mock()
        mock_response.json.return_value = {"temperature": 25.5}
        mock_response.status_code = 200
        
        # Patcha la funzione requests.get per restituire il mock
        with patch('requests.get') as mock_get:
            mock_get.return_value = mock_response
            
            # Testa il servizio meteo
            service = WeatherService("api.weather.com")
            temp = service.get_temperature("Roma")
            
            # Verifica che la temperatura sia corretta
            self.assertEqual(temp, 25.5)
            
            # Verifica che requests.get sia stato chiamato con i parametri corretti
            mock_get.assert_called_once_with(
                "https://api.weather.com/current",
                params={"city": "Roma", "units": "metric"}
            )
```

### Utilizzo di pytest-mock

```python
def test_get_temperature(mocker):
    # Crea un mock per la risposta HTTP
    mock_response = mocker.Mock()
    mock_response.json.return_value = {"temperature": 25.5}
    mock_response.status_code = 200
    
    # Patcha la funzione requests.get
    mocker.patch('requests.get', return_value=mock_response)
    
    # Testa il servizio meteo
    service = WeatherService("api.weather.com")
    temp = service.get_temperature("Roma")
    
    # Verifica che la temperatura sia corretta
    assert temp == 25.5
    
    # Verifica che requests.get sia stato chiamato con i parametri corretti
    requests.get.assert_called_once_with(
        "https://api.weather.com/current",
        params={"city": "Roma", "units": "metric"}
    )
```

## Fixture e setup

Le fixture sono un modo per configurare lo stato iniziale per i test e gestire le risorse.

### Fixture in pytest

```python
import pytest
import tempfile
import os

@pytest.fixture
def temp_file():
    # Setup
    fd, path = tempfile.mkstemp()
    with os.fdopen(fd, 'w') as f:
        f.write("dati di test")
    
    # Fornisci la risorsa al test
    yield path
    
    # Teardown
    os.unlink(path)

def test_read_file(temp_file):
    with open(temp_file, 'r') as f:
        content = f.read()
    assert content == "dati di test"
```

### Fixture con scope in pytest

```python
@pytest.fixture(scope="module")
def database_connection():
    # Connessione creata una volta per modulo
    conn = create_database_connection()
    yield conn
    conn.close()

@pytest.fixture(scope="function")
def clean_database(database_connection):
    # Pulizia eseguita prima di ogni funzione di test
    database_connection.execute("DELETE FROM test_table")
    yield database_connection
```

## Parametrizzazione dei test

La parametrizzazione permette di eseguire lo stesso test con diversi input e output attesi.

### Parametrizzazione in pytest

```python
import pytest
from myapp.calculator import calculate_tax

@pytest.mark.parametrize("income,expected_tax", [
    (10000, 0),        # Nessuna tassa sotto i 15000
    (20000, 1000),      # 5% sopra i 15000
    (50000, 5000),      # 10% sopra i 30000
    (100000, 15000),    # 20% sopra i 70000
])
def test_calculate_tax(income, expected_tax):
    assert calculate_tax(income) == expected_tax
```

## Copertura del codice

La copertura del codice misura quanto del codice viene eseguito durante i test.

### Utilizzo di pytest-cov

```bash
pip install pytest-cov
pytest --cov=myapp tests/
```

Output di esempio:

```
----------- coverage: platform linux, python 3.8.10-final-0 -----------
Name                 Stmts   Miss  Cover
------------------------------------------
myapp/__init__.py       5      0   100%
myapp/calculator.py    18      2    89%
myapp/utils.py         42      8    81%
------------------------------------------
TOTAL                  65     10    85%
```

### Generazione di report HTML

```bash
pytest --cov=myapp --cov-report=html tests/
```

Questo comando genera un report HTML dettagliato nella directory `htmlcov/`.

## Strumenti per la qualità del codice

### Linting con Pylint

Pylint analizza il codice per identificare errori, problemi di stile e potenziali bug.

```bash
pip install pylint
pylint myapp/
```

### Analisi statica con mypy

mypy verifica i tipi statici in Python.

```bash
pip install mypy
mypy myapp/
```

Esempio di codice con type hints:

```python
from typing import List, Dict, Optional

def process_user_data(users: List[Dict[str, str]]) -> List[str]:
    """Estrae i nomi degli utenti da una lista di dizionari."""
    return [user["name"] for user in users if "name" in user]

def get_user_by_id(user_id: int) -> Optional[Dict[str, str]]:
    """Recupera un utente dal database per ID."""
    # Implementazione...
```

### Formattazione con Black

Black è un formattatore di codice che applica uno stile consistente.

```bash
pip install black
black myapp/
```

### Ordinamento delle importazioni con isort

isort ordina automaticamente le importazioni secondo le convenzioni.

```bash
pip install isort
isort myapp/
```

## Integrazione continua (CI)

L'integrazione continua esegue automaticamente i test e le verifiche di qualità ad ogni commit.

### Esempio di configurazione GitHub Actions

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
        pip install pytest pytest-cov pylint mypy black isort
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    - name: Lint with pylint
      run: |
        pylint myapp/ --disable=C0111
    - name: Check types with mypy
      run: |
        mypy myapp/
    - name: Check formatting with black
      run: |
        black --check myapp/
    - name: Sort imports with isort
      run: |
        isort --check myapp/
    - name: Test with pytest
      run: |
        pytest --cov=myapp tests/
```

## Migliori pratiche per il testing

### 1. Scrivi test leggibili e manutenibili

I test dovrebbero essere chiari e facili da comprendere.

```python
# Poco chiaro
def test_func1():
    x = process(5, 3, True)
    assert x == 10

# Chiaro
def test_process_doubles_first_argument_when_flag_is_true():
    result = process(input_value=5, multiplier=3, double_input=True)
    assert result == 10  # 5 * 2 * 1 = 10
```

### 2. Segui il pattern AAA (Arrange-Act-Assert)

```python
def test_user_registration():
    # Arrange - Prepara i dati e le condizioni per il test
    email = "test@example.com"
    password = "securepassword123"
    user_service = UserService()
    
    # Act - Esegui l'azione da testare
    user = user_service.register(email, password)
    
    # Assert - Verifica i risultati attesi
    assert user is not None
    assert user.email == email
    assert user.is_active is True
    assert user_service.authenticate(email, password) is True
```

### 3. Testa i casi limite e gli errori

```python
def test_divide():
    # Caso normale
    assert divide(10, 2) == 5
    
    # Casi limite
    assert divide(0, 5) == 0
    
    # Gestione errori
    with pytest.raises(ZeroDivisionError):
        divide(5, 0)
```

### 4. Mantieni i test indipendenti

Ogni test dovrebbe essere eseguibile indipendentemente dagli altri.

```python
# Scorretto - Test dipendenti
def test_create_user():
    global user_id  # Variabile globale che crea dipendenza
    user_id = user_service.create_user("test@example.com", "password123")
    assert user_id is not None

def test_get_user():
    user = user_service.get_user_by_id(user_id)  # Dipende dal test precedente
    assert user.email == "test@example.com"

# Corretto - Test indipendenti
def test_create_user():
    user_id = user_service.create_user("test@example.com", "password123")
    assert user_id is not None
    return user_id  # Non usato per creare dipendenza

def test_get_user():
    # Crea i propri dati di test
    user_id = user_service.create_user("another@example.com", "password456")
    user = user_service.get_user_by_id(user_id)
    assert user.email == "another@example.com"
```

### 5. Usa nomi descrittivi per i test

```python
# Poco descrittivo
def test_user():
    # ...

# Descrittivo
def test_user_registration_with_valid_credentials_succeeds():
    # ...

def test_user_registration_with_existing_email_fails():
    # ...
```

## Conclusione

Il testing e la garanzia della qualità del codice sono investimenti che ripagano nel tempo, riducendo i bug, migliorando la manutenibilità e aumentando la fiducia nelle modifiche al codice. Adottare una cultura del testing fin dall'inizio di un progetto può risparmiare ore di debugging e problemi in produzione.

Ricorda che il testing non è un'attività da svolgere una tantum alla fine dello sviluppo, ma un processo continuo che dovrebbe accompagnare l'intero ciclo di vita del software.

## Risorse aggiuntive

- [Documentazione ufficiale di pytest](https://docs.pytest.org/)
- [Documentazione di unittest](https://docs.python.org/3/library/unittest.html)
- [Guida al mocking in Python](https://docs.python.org/3/library/unittest.mock.html)
- [Documentazione di coverage.py](https://coverage.readthedocs.io/)

## Esercizi

1. Scrivi una suite di test unitari per una funzione di validazione di email.
2. Implementa un semplice progetto seguendo la metodologia TDD.
3. Aggiungi type hints a un modulo esistente e verifica con mypy.
4. Configura un workflow di CI per un tuo progetto esistente.
5. Migliora la copertura dei test di un modulo esistente fino a raggiungere almeno l'80%.

---

[Torna all'indice](../README.md) | [Prossima guida: Ottimizzazione delle prestazioni](05-ottimizzazione-prestazioni.md)