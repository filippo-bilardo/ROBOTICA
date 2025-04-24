# Best Practices nel Testing

## Introduzione

Scrivere test efficaci non è solo una questione di conoscere i framework di testing, ma anche di seguire best practices che garantiscano test di qualità, manutenibili e utili. In questo capitolo, esploreremo le migliori pratiche per il testing in Python, applicabili indipendentemente dal framework utilizzato.

## Principi Fondamentali

### 1. Test Indipendenti

I test dovrebbero essere indipendenti l'uno dall'altro. Un test non dovrebbe dipendere dallo stato lasciato da un altro test, né dovrebbe influenzare l'esecuzione di altri test.

```python
# Esempio di test NON indipendenti (da evitare)
def test_crea_utente():
    utente = crea_utente("mario", "rossi@example.com")
    assert utente.id is not None
    # Salva l'ID in una variabile globale per il prossimo test
    global utente_id
    utente_id = utente.id

def test_trova_utente():
    # Dipende dal test precedente
    utente = trova_utente(utente_id)
    assert utente.email == "rossi@example.com"
```

```python
# Esempio di test indipendenti (corretto)
def test_crea_utente():
    utente = crea_utente("mario", "rossi@example.com")
    assert utente.id is not None

def test_trova_utente():
    # Crea i propri dati di test
    utente = crea_utente("luigi", "luigi@example.com")
    utente_trovato = trova_utente(utente.id)
    assert utente_trovato.email == "luigi@example.com"
```

### 2. Test Deterministici

I test dovrebbero produrre sempre lo stesso risultato se il codice testato non cambia. Evitare dipendenze da fattori esterni come l'orario corrente, valori casuali o risorse esterne non controllate.

```python
# Test NON deterministico (da evitare)
import random

def test_generatore_numeri():
    num = random.randint(1, 10)
    result = generatore_numeri()
    assert result == num  # Potrebbe fallire casualmente
```

```python
# Test deterministico (corretto)
def test_generatore_numeri():
    # Mockare la funzione random per renderla deterministica
    with patch('random.randint', return_value=5):
        result = generatore_numeri()
        assert result == 5
```

### 3. Test Leggibili

I test dovrebbero essere facili da leggere e comprendere. Utilizzare nomi descrittivi per le funzioni di test e includere commenti o docstring quando necessario.

```python
# Nome poco descrittivo
def test_func1():
    # ...

# Nome descrittivo
def test_calcolo_sconto_con_coupon_valido():
    # ...
```

### 4. Struttura AAA (Arrange-Act-Assert)

Organizzare i test seguendo il pattern AAA:
- **Arrange**: Preparare i dati e le condizioni per il test
- **Act**: Eseguire l'operazione da testare
- **Assert**: Verificare che il risultato sia quello atteso

```python
def test_calcolo_totale_carrello():
    # Arrange
    carrello = Carrello()
    carrello.aggiungi_prodotto(Prodotto("libro", 10.0), 2)
    carrello.aggiungi_prodotto(Prodotto("penna", 2.0), 3)
    
    # Act
    totale = carrello.calcola_totale()
    
    # Assert
    assert totale == 26.0  # 2 libri a 10€ + 3 penne a 2€
```

## Organizzazione dei Test

### 1. Struttura del Progetto

Organizzare i test in una struttura che rispecchi quella del codice da testare:

```
mio_progetto/
├── mio_package/
│   ├── __init__.py
│   ├── module1.py
│   └── module2.py
└── tests/
    ├── __init__.py
    ├── test_module1.py
    └── test_module2.py
```

### 2. Test per Funzionalità

Raggruppare i test per funzionalità o componente, non per metodo di test:

```python
# Raggruppamento per metodo di test (da evitare)
class TestUtente:
    def test_creazione(self):
        # Test per Utente.crea
        # Test per Prodotto.crea
        # Test per Ordine.crea
    
    def test_modifica(self):
        # Test per Utente.modifica
        # Test per Prodotto.modifica
        # Test per Ordine.modifica

# Raggruppamento per funzionalità (corretto)
class TestUtente:
    def test_creazione_utente(self):
        # ...
    
    def test_modifica_utente(self):
        # ...

class TestProdotto:
    def test_creazione_prodotto(self):
        # ...
    
    def test_modifica_prodotto(self):
        # ...
```

### 3. Fixture e Helper

Utilizzare fixture e funzioni helper per ridurre la duplicazione del codice nei test:

```python
# pytest
@pytest.fixture
def utente_test():
    return Utente("test", "test@example.com")

def test_modifica_email(utente_test):
    utente_test.modifica_email("nuova@example.com")
    assert utente_test.email == "nuova@example.com"

def test_modifica_password(utente_test):
    utente_test.modifica_password("nuova_password")
    assert utente_test.verifica_password("nuova_password")
```

## Strategie di Testing

### 1. Test Parametrizzati

Utilizzare test parametrizzati per verificare lo stesso comportamento con diversi input:

```python
# pytest
@pytest.mark.parametrize("input_value,expected_output", [
    ("hello", 5),
    ("", 0),
    ("python", 6),
    ("testing", 7),
])
def test_length_function(input_value, expected_output):
    assert len(input_value) == expected_output
```

### 2. Property-Based Testing

Il property-based testing genera automaticamente input di test per verificare proprietà generali del codice:

```python
# Installazione: pip install hypothesis
from hypothesis import given
from hypothesis import strategies as st

@given(st.lists(st.integers()))
def test_reverse_twice_is_original(lst):
    # Invertire una lista due volte dovrebbe dare la lista originale
    assert list(reversed(list(reversed(lst)))) == lst
```

### 3. Test di Regressione

Quando si trova un bug, scrivere un test che lo riproduca prima di correggerlo:

```python
def test_divisione_per_zero_gestita():
    # Questo test verifica che un bug precedente non si ripresenti
    calculator = Calculator()
    result = calculator.divide_safe(10, 0)
    assert result == 0  # Il comportamento atteso è restituire 0 invece di sollevare un'eccezione
```

## Testing di Componenti Specifici

### 1. Testing di API

Per testare API, utilizzare client di test o librerie come `requests-mock` o `responses`:

```python
# Installazione: pip install requests-mock
import requests
import requests_mock

def get_user_data(user_id):
    response = requests.get(f"https://api.example.com/users/{user_id}")
    return response.json() if response.status_code == 200 else None

def test_get_user_data():
    with requests_mock.Mocker() as m:
        m.get('https://api.example.com/users/123', json={'id': 123, 'name': 'Test User'})
        data = get_user_data(123)
        assert data == {'id': 123, 'name': 'Test User'}
```

### 2. Testing di Database

Per testare interazioni con database, utilizzare database in memoria o fixture che gestiscono la creazione e pulizia del database:

```python
# pytest con SQLAlchemy
@pytest.fixture
def db_session():
    # Crea un database in memoria
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    yield session
    
    # Pulizia
    session.close()

def test_salva_utente(db_session):
    utente = Utente("test", "test@example.com")
    db_session.add(utente)
    db_session.commit()
    
    saved_user = db_session.query(Utente).filter_by(email="test@example.com").first()
    assert saved_user is not None
    assert saved_user.nome == "test"
```

### 3. Testing di Interfacce Utente

Per testare interfacce utente, utilizzare framework come Selenium o Playwright:

```python
# Installazione: pip install selenium
from selenium import webdriver
from selenium.webdriver.common.by import By

def test_login_form():
    driver = webdriver.Chrome()
    try:
        driver.get("https://example.com/login")
        
        # Compila il form
        driver.find_element(By.ID, "username").send_keys("testuser")
        driver.find_element(By.ID, "password").send_keys("password")
        driver.find_element(By.ID, "login-button").click()
        
        # Verifica il risultato
        welcome_message = driver.find_element(By.ID, "welcome-message")
        assert "Benvenuto, testuser" in welcome_message.text
    finally:
        driver.quit()
```

## Manutenzione dei Test

### 1. Refactoring dei Test

I test dovrebbero essere mantenuti e refactoring come il codice di produzione. Se i test diventano difficili da mantenere, è un segno che potrebbero esserci problemi nel design del codice o dei test stessi.

### 2. Test Flaky

I test "flaky" (instabili) che falliscono in modo intermittente dovrebbero essere identificati e corretti. Possono essere causati da race condition, dipendenze esterne o assunzioni errate.

```python
# Esempio di test flaky (da evitare)
def test_operazione_asincrona():
    result = start_async_operation()
    # Attesa arbitraria che potrebbe non essere sufficiente
    time.sleep(0.1)
    assert is_operation_complete() == True

# Versione migliorata
def test_operazione_asincrona_migliorato():
    result = start_async_operation()
    # Attesa con timeout e polling
    wait_for_condition(is_operation_complete, timeout=5.0)
    assert is_operation_complete() == True
```

### 3. Test Lenti

I test lenti dovrebbero essere identificati e ottimizzati o marcati per essere eseguiti separatamente:

```python
# pytest
@pytest.mark.slow
def test_operazione_lunga():
    # Test che richiede molto tempo
    pass
```

## Integrazione Continua

### 1. Esecuzione Automatica dei Test

Configurare un sistema di integrazione continua per eseguire automaticamente i test ad ogni commit:

```yaml
# .github/workflows/test.yml (GitHub Actions)
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov
      - name: Test with pytest
        run: |
          pytest --cov=myapp
```

### 2. Matrice di Test

Testare su diverse versioni di Python e sistemi operativi:

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        python-version: [3.7, 3.8, 3.9, 3.10]
    steps:
      # ...
```

## Conclusione

Seguire le best practices nel testing è essenziale per creare test efficaci, manutenibili e utili. I test non sono solo uno strumento per verificare che il codice funzioni correttamente, ma anche una forma di documentazione e un supporto per il refactoring e l'evoluzione del codice.

Ricorda che l'obiettivo finale non è avere il maggior numero possibile di test, ma avere test di qualità che forniscano un valore reale al progetto.

## Risorse Aggiuntive

- [Python Testing with pytest](https://pragprog.com/titles/bopytest/python-testing-with-pytest/) di Brian Okken
- [Test-Driven Development with Python](https://www.obeythetestinggoat.com/) di Harry Percival
- [Effective Python Testing with Pytest](https://realpython.com/pytest-python-testing/) su Real Python

[Torna all'indice](../README.md) | [Capitolo precedente: Coverage e qualità del codice](06-coverage.md)