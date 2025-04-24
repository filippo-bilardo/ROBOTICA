# Unit Testing con unittest

## Introduzione a unittest

`unittest` è il framework di testing integrato nella libreria standard di Python. È ispirato a JUnit e segue l'architettura xUnit comune a molti framework di testing. Fornisce strumenti per organizzare i test in suite, eseguirli e verificare i risultati attesi.

## Concetti Fondamentali

### Test Case

Un test case è la singola unità di test. In `unittest`, i test case sono creati sottoclassando `unittest.TestCase` e implementando metodi che iniziano con `test_`.

### Assertions

Le assertions sono metodi che verificano che il codice testato produca i risultati attesi. Se un'assertion fallisce, il test fallisce.

### Test Suite

Una test suite è una collezione di test case o altre test suite. Permette di organizzare e eseguire gruppi di test correlati.

### Test Runner

Un test runner è un componente che orchestra l'esecuzione dei test e fornisce i risultati all'utente.

## Creare un Test Case

```python
import unittest

# Funzione da testare
def calcola_area_rettangolo(base, altezza):
    return base * altezza

# Test case
class TestAreaRettangolo(unittest.TestCase):
    
    def test_area_valori_positivi(self):
        self.assertEqual(calcola_area_rettangolo(5, 4), 20)
        
    def test_area_valori_zero(self):
        self.assertEqual(calcola_area_rettangolo(0, 4), 0)
        self.assertEqual(calcola_area_rettangolo(5, 0), 0)
        
    def test_area_valori_negativi(self):
        # I valori negativi dovrebbero essere gestiti correttamente
        self.assertEqual(calcola_area_rettangolo(-5, 4), -20)

if __name__ == '__main__':
    unittest.main()
```

## Metodi di Setup e Teardown

`unittest` fornisce metodi speciali per preparare l'ambiente di test e pulirlo dopo l'esecuzione:

- `setUp()`: Eseguito prima di ogni metodo di test
- `tearDown()`: Eseguito dopo ogni metodo di test
- `setUpClass()`: Eseguito una volta prima di tutti i test nella classe
- `tearDownClass()`: Eseguito una volta dopo tutti i test nella classe

```python
import unittest

class TestDatabase(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # Connessione al database di test
        print("Connessione al database")
        cls.db_connection = create_test_db_connection()
    
    @classmethod
    def tearDownClass(cls):
        # Chiusura della connessione
        print("Chiusura connessione al database")
        cls.db_connection.close()
    
    def setUp(self):
        # Preparazione per ogni test
        print("Preparazione test")
        self.transaction = self.db_connection.begin_transaction()
    
    def tearDown(self):
        # Pulizia dopo ogni test
        print("Pulizia dopo test")
        self.transaction.rollback()  # Annulla le modifiche al database
    
    def test_inserimento(self):
        # Test di inserimento record
        result = self.db_connection.insert("users", {"name": "Mario", "email": "mario@example.com"})
        self.assertTrue(result.success)
    
    def test_query(self):
        # Test di query
        self.db_connection.insert("users", {"name": "Luigi", "email": "luigi@example.com"})
        result = self.db_connection.query("SELECT * FROM users WHERE name = 'Luigi'")
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["email"], "luigi@example.com")
```

## Assertion Methods

`unittest.TestCase` fornisce numerosi metodi di assertion per verificare diverse condizioni:

| Metodo | Verifica che |
|--------|-------------|
| `assertEqual(a, b)` | `a == b` |
| `assertNotEqual(a, b)` | `a != b` |
| `assertTrue(x)` | `bool(x) is True` |
| `assertFalse(x)` | `bool(x) is False` |
| `assertIs(a, b)` | `a is b` |
| `assertIsNot(a, b)` | `a is not b` |
| `assertIsNone(x)` | `x is None` |
| `assertIsNotNone(x)` | `x is not None` |
| `assertIn(a, b)` | `a in b` |
| `assertNotIn(a, b)` | `a not in b` |
| `assertIsInstance(a, b)` | `isinstance(a, b)` |
| `assertNotIsInstance(a, b)` | `not isinstance(a, b)` |
| `assertRaises(exc, fun, *args, **kwds)` | `fun(*args, **kwds)` solleva `exc` |
| `assertAlmostEqual(a, b)` | `round(a-b, 7) == 0` |
| `assertGreater(a, b)` | `a > b` |
| `assertLess(a, b)` | `a < b` |
| `assertRegex(s, r)` | `r.search(s)` |
| `assertCountEqual(a, b)` | `a` e `b` hanno gli stessi elementi |

## Test delle Eccezioni

Per testare che una funzione sollevi un'eccezione specifica, possiamo usare `assertRaises`:

```python
def divide(a, b):
    if b == 0:
        raise ValueError("Divisione per zero non consentita")
    return a / b

class TestDivide(unittest.TestCase):
    def test_divide_normale(self):
        self.assertEqual(divide(10, 2), 5)
    
    def test_divide_per_zero(self):
        # Verifica che venga sollevata ValueError
        with self.assertRaises(ValueError):
            divide(10, 0)
```

## Skipping Tests

A volte potrebbe essere necessario saltare alcuni test in determinate condizioni:

```python
import unittest
import sys

class TestFeatures(unittest.TestCase):
    
    @unittest.skip("Dimostrativo - questo test viene sempre saltato")
    def test_sempre_saltato(self):
        self.fail("Non dovrebbe mai essere eseguito")
    
    @unittest.skipIf(sys.version_info < (3, 8), "Richiede Python 3.8 o superiore")
    def test_nuova_feature_python38(self):
        # Test per una feature disponibile solo in Python 3.8+
        pass
    
    @unittest.skipUnless(sys.platform.startswith("win"), "Test solo per Windows")
    def test_solo_windows(self):
        # Test specifico per Windows
        pass
```

## Esecuzione dei Test

Ci sono diversi modi per eseguire i test con `unittest`:

### Esecuzione diretta del modulo

```python
if __name__ == '__main__':
    unittest.main()
```

### Esecuzione da linea di comando

```bash
python -m unittest test_module1 test_module2
python -m unittest test_package.test_module
python -m unittest discover -s test_directory
```

## Organizzazione dei Test

È buona pratica organizzare i test in una struttura che rispecchi quella del codice da testare:

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

## Esempio Completo

Ecco un esempio più completo di test con `unittest`:

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
import unittest
from calculator import Calculator

class TestCalculator(unittest.TestCase):
    
    def setUp(self):
        self.calc = Calculator()
    
    def test_add(self):
        self.assertEqual(self.calc.add(3, 5), 8)
        self.assertEqual(self.calc.add(-1, 1), 0)
        self.assertEqual(self.calc.add(-1, -1), -2)
    
    def test_subtract(self):
        self.assertEqual(self.calc.subtract(5, 3), 2)
        self.assertEqual(self.calc.subtract(1, 1), 0)
        self.assertEqual(self.calc.subtract(-1, -1), 0)
    
    def test_multiply(self):
        self.assertEqual(self.calc.multiply(3, 5), 15)
        self.assertEqual(self.calc.multiply(-1, 1), -1)
        self.assertEqual(self.calc.multiply(-1, -1), 1)
    
    def test_divide(self):
        self.assertEqual(self.calc.divide(6, 3), 2)
        self.assertEqual(self.calc.divide(7, 2), 3.5)
        self.assertEqual(self.calc.divide(-1, 1), -1)
        
        with self.assertRaises(ValueError):
            self.calc.divide(10, 0)

if __name__ == '__main__':
    unittest.main()
```

## Conclusione

`unittest` è un potente framework di testing incluso nella libreria standard di Python. Fornisce tutti gli strumenti necessari per scrivere test completi e ben organizzati. Tuttavia, esistono alternative come `pytest` che offrono una sintassi più concisa e funzionalità aggiuntive, che esploreremo nei prossimi capitoli.

## Risorse Aggiuntive

- [Documentazione ufficiale di unittest](https://docs.python.org/3/library/unittest.html)
- [Python Testing with unittest, nose, pytest](https://realpython.com/python-testing/)

[Torna all'indice](../README.md) | [Capitolo precedente: Introduzione al testing](01-introduzione-testing.md) | [Capitolo successivo: Test-Driven Development](03-tdd.md)