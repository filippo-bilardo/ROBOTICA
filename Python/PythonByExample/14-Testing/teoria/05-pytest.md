# Pytest: un Framework di Testing Avanzato

## Introduzione a Pytest

Pytest è un framework di testing avanzato per Python che semplifica la scrittura e l'esecuzione dei test. A differenza di unittest, che è basato sul paradigma xUnit, pytest adotta un approccio più moderno e minimalista, riducendo il boilerplate e offrendo funzionalità potenti come il parametrizzazione dei test, i fixture e i plugin.

Pytest è diventato uno dei framework di testing più popolari nella comunità Python grazie alla sua semplicità, flessibilità e potenza.

## Installazione

Pytest non è incluso nella libreria standard di Python, quindi deve essere installato separatamente:

```bash
pip install pytest
```

## Scrittura di Test Base

Una delle caratteristiche distintive di pytest è la semplicità nella scrittura dei test. Non è necessario creare classi che ereditano da una classe base o utilizzare metodi di assertion specifici:

```python
# test_esempio.py

def somma(a, b):
    return a + b

def test_somma():
    assert somma(1, 2) == 3
    assert somma(-1, 1) == 0
    assert somma(-1, -1) == -2
```

Per eseguire i test, basta utilizzare il comando `pytest` dalla linea di comando:

```bash
python -m pytest
```

Pytest cercherà automaticamente i file che iniziano con `test_` o finiscono con `_test.py` e eseguirà le funzioni che iniziano con `test_`.

## Assertions

Pytest utilizza la normale istruzione `assert` di Python, ma la arricchisce con informazioni dettagliate in caso di fallimento:

```python
def test_esempio():
    a = [1, 2, 3]
    b = [1, 2, 4]
    assert a == b  # Questo fallirà
```

Quando questo test fallisce, pytest mostrerà un messaggio dettagliato che evidenzia la differenza tra i valori:

```
E       assert [1, 2, 3] == [1, 2, 4]
E         At index 2 diff: 3 != 4
E         Use -v to see the full diff
```

## Fixture

Le fixture sono un concetto potente in pytest che permettono di configurare lo stato iniziale per i test e di fornire dati o risorse ai test. Le fixture sono definite come funzioni decorate con `@pytest.fixture`:

```python
import pytest

@pytest.fixture
def database_connection():
    # Setup: crea una connessione al database di test
    connection = create_test_db_connection()
    yield connection  # Fornisce la connessione ai test
    # Teardown: chiude la connessione
    connection.close()

def test_query(database_connection):
    # Usa la connessione fornita dalla fixture
    result = database_connection.query("SELECT * FROM users")
    assert len(result) > 0
```

Le fixture possono anche essere utilizzate da altre fixture, creando una catena di dipendenze:

```python
@pytest.fixture
def database_connection():
    connection = create_test_db_connection()
    yield connection
    connection.close()

@pytest.fixture
def database_with_test_data(database_connection):
    # Usa la connessione fornita dalla fixture precedente
    database_connection.execute("INSERT INTO users VALUES (1, 'Test User')")
    yield database_connection
    # Pulizia dei dati di test
    database_connection.execute("DELETE FROM users WHERE id = 1")

def test_user_exists(database_with_test_data):
    result = database_with_test_data.query("SELECT * FROM users WHERE id = 1")
    assert len(result) == 1
    assert result[0]["name"] == "Test User"
```

### Scope delle Fixture

Le fixture possono avere diversi scope, che determinano quanto spesso vengono eseguite:

- `function` (default): la fixture viene eseguita per ogni test che la utilizza
- `class`: la fixture viene eseguita una volta per classe di test
- `module`: la fixture viene eseguita una volta per modulo
- `session`: la fixture viene eseguita una volta per sessione di test

```python
@pytest.fixture(scope="module")
def database_connection():
    # Questa connessione verrà creata una sola volta per modulo
    connection = create_test_db_connection()
    yield connection
    connection.close()
```

## Parametrizzazione dei Test

Pytest permette di eseguire lo stesso test con diversi set di parametri, riducendo la duplicazione del codice:

```python
import pytest

def is_palindrome(s):
    return s == s[::-1]

@pytest.mark.parametrize("input_string,expected_result", [
    ("radar", True),
    ("hello", False),
    ("A man a plan a canal Panama", False),
    ("12321", True),
    ("", True),
])
def test_is_palindrome(input_string, expected_result):
    assert is_palindrome(input_string) == expected_result
```

Questo eseguirà il test `test_is_palindrome` cinque volte, una per ogni set di parametri.

## Markers

I markers sono decoratori che possono essere applicati ai test per categorizzarli o modificarne il comportamento:

```python
import pytest

@pytest.mark.slow
def test_slow_operation():
    # Un test che richiede molto tempo
    pass

@pytest.mark.skip(reason="Non ancora implementato")
def test_future_feature():
    # Un test per una funzionalità non ancora implementata
    pass

@pytest.mark.skipif(sys.version_info < (3, 8), reason="Richiede Python 3.8+")
def test_new_feature():
    # Un test che utilizza funzionalità disponibili solo in Python 3.8+
    pass

@pytest.mark.xfail(reason="Bug noto #123")
def test_known_bug():
    # Un test che sappiamo fallirà a causa di un bug noto
    pass
```

È possibile eseguire solo i test con un determinato marker:

```bash
python -m pytest -m slow  # Esegue solo i test marcati come "slow"
```

## Fixture Temporanee

Pytest include fixture predefinite per lavorare con file e directory temporanei:

```python
def test_file_operations(tmp_path):
    # tmp_path è una fixture che fornisce un percorso a una directory temporanea
    file_path = tmp_path / "test_file.txt"
    file_path.write_text("Hello, World!")
    
    assert file_path.read_text() == "Hello, World!"
    assert file_path.exists()
```

## Cattura dell'Output

Pytest può catturare l'output standard e l'output di errore durante l'esecuzione dei test:

```python
def test_print(capsys):
    print("Hello, World!")
    captured = capsys.readouterr()
    assert captured.out == "Hello, World!\n"
```

## Mocking con Pytest

Pytest può essere utilizzato insieme a `unittest.mock` per il mocking, ma offre anche il plugin `pytest-mock` che semplifica l'uso dei mock:

```python
# Installazione: pip install pytest-mock

def test_with_mock(mocker):
    # mocker è una fixture fornita da pytest-mock
    mock_function = mocker.patch("module.function", return_value=42)
    
    # Utilizzo della funzione mockata
    from module import function
    result = function()
    
    # Verifiche
    assert result == 42
    mock_function.assert_called_once()
```

## Configurazione

Pytest può essere configurato tramite un file `pytest.ini`, `pyproject.toml` o `conftest.py`:

```ini
# pytest.ini
[pytest]
addopts = -v --cov=myapp
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
```

```python
# conftest.py
import pytest

# Fixture disponibili per tutti i test nel progetto
@pytest.fixture(scope="session")
def app_config():
    return {"api_key": "test_key", "environment": "testing"}
```

## Plugin

Una delle caratteristiche più potenti di pytest è il suo ecosistema di plugin. Ecco alcuni plugin popolari:

- **pytest-cov**: Misura la copertura del codice
- **pytest-xdist**: Esegue i test in parallelo
- **pytest-django**: Supporto specifico per Django
- **pytest-asyncio**: Supporto per test di codice asincrono
- **pytest-bdd**: Supporto per Behavior-Driven Development

```bash
pip install pytest-cov
python -m pytest --cov=myapp
```

## Confronto con unittest

| Caratteristica | unittest | pytest |
|---------------|----------|--------|
| Stile | Basato su classi (xUnit) | Basato su funzioni |
| Assertions | Metodi specifici (assertEqual, assertTrue, ...) | Istruzione assert standard di Python |
| Fixture | setUp/tearDown | Sistema di fixture flessibile |
| Parametrizzazione | Limitata | Potente e flessibile |
| Plugin | Limitati | Vasto ecosistema |
| Verbosità | Più verboso | Più conciso |

## Esempio Completo

Ecco un esempio più completo di test con pytest:

```python
# calculator.py
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
```

```python
# test_calculator.py
import pytest
from calculator import Calculator

@pytest.fixture
def calculator():
    return Calculator()

def test_add(calculator):
    assert calculator.add(3, 5) == 8
    assert calculator.add(-1, 1) == 0
    assert calculator.add(-1, -1) == -2

def test_subtract(calculator):
    assert calculator.subtract(5, 3) == 2
    assert calculator.subtract(1, 1) == 0
    assert calculator.subtract(-1, -1) == 0

def test_multiply(calculator):
    assert calculator.multiply(3, 5) == 15
    assert calculator.multiply(-1, 1) == -1
    assert calculator.multiply(-1, -1) == 1

def test_divide(calculator):
    assert calculator.divide(6, 3) == 2
    assert calculator.divide(7, 2) == 3.5
    assert calculator.divide(-1, 1) == -1

def test_divide_by_zero(calculator):
    with pytest.raises(ValueError, match="Divisione per zero non consentita"):
        calculator.divide(10, 0)

@pytest.mark.parametrize("a,b,expected", [
    (3, 5, 8),
    (-1, 1, 0),
    (-1, -1, -2),
    (0, 0, 0),
])
def test_add_parametrized(calculator, a, b, expected):
    assert calculator.add(a, b) == expected
```

## Conclusione

Pytest è un framework di testing moderno e potente che offre numerosi vantaggi rispetto a unittest. La sua sintassi concisa, il potente sistema di fixture e l'ampio ecosistema di plugin lo rendono una scelta eccellente per il testing in Python.

Nel prossimo capitolo, esploreremo come misurare la copertura del codice e migliorare la qualità dei test.

## Risorse Aggiuntive

- [Documentazione ufficiale di pytest](https://docs.pytest.org/)
- [Pytest: Python Testing for Humans](https://realpython.com/pytest-python-testing/)
- [Awesome Pytest](https://github.com/augustogoulart/awesome-pytest) - Una lista di risorse e plugin per pytest

[Torna all'indice](../README.md) | [Capitolo precedente: Mocking e patching](04-mocking.md) | [Capitolo successivo: Coverage e qualità del codice](06-coverage.md)