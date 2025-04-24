# Coverage e Qualità del Codice

## Introduzione alla Copertura del Codice

La copertura del codice (code coverage) è una metrica che misura la percentuale di codice sorgente eseguita durante i test. È uno strumento importante per valutare l'efficacia dei test e identificare parti del codice che non sono state testate.

Una buona copertura del codice non garantisce l'assenza di bug, ma una bassa copertura indica sicuramente aree del codice che potrebbero contenere errori non rilevati.

## Tipi di Copertura

Esistono diversi tipi di copertura del codice, ognuno con il proprio focus:

1. **Copertura delle istruzioni (Statement Coverage)**: Misura quante istruzioni del codice sono state eseguite.
2. **Copertura dei rami (Branch Coverage)**: Misura quanti rami condizionali (if/else, switch, ecc.) sono stati eseguiti.
3. **Copertura dei percorsi (Path Coverage)**: Misura quanti percorsi di esecuzione possibili sono stati testati.
4. **Copertura delle funzioni (Function Coverage)**: Misura quante funzioni o metodi sono stati chiamati.
5. **Copertura delle linee (Line Coverage)**: Misura quante linee di codice sono state eseguite.

## Coverage.py

`coverage.py` è lo strumento più popolare per misurare la copertura del codice in Python. Può essere utilizzato da solo o integrato con framework di testing come pytest.

### Installazione

```bash
pip install coverage
```

### Utilizzo Base

```bash
# Esecuzione dei test con misurazione della copertura
coverage run -m pytest

# Generazione di un report
coverage report

# Generazione di un report HTML dettagliato
coverage html
```

### Esempio di Report

Ecco un esempio di report generato da coverage.py:

```
Name                      Stmts   Miss  Cover
---------------------------------------------
myapp/__init__.py             3      0   100%
myapp/models.py             544    321    41%
myapp/utils.py              131     11    92%
myapp/views.py              217    142    35%
---------------------------------------------
TOTAL                       895    474    47%
```

Questo report mostra che il 47% del codice totale è stato coperto dai test, con una copertura molto bassa per i moduli `models.py` e `views.py`.

### Configurazione

Coverage.py può essere configurato tramite un file `.coveragerc`:

```ini
[run]
source = myapp
omit = */tests/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise NotImplementedError

[html]
directory = htmlcov
```

## Integrazione con Pytest

Il plugin `pytest-cov` integra coverage.py con pytest, semplificando la misurazione della copertura durante l'esecuzione dei test:

```bash
pip install pytest-cov
```

```bash
# Esecuzione dei test con misurazione della copertura
pytest --cov=myapp

# Generazione di un report HTML
pytest --cov=myapp --cov-report=html
```

## Strategie per Migliorare la Copertura

### 1. Identificare le Aree Non Coperte

Il primo passo è identificare le parti del codice non coperte dai test. I report HTML generati da coverage.py sono particolarmente utili per questo, poiché mostrano esattamente quali linee non sono state eseguite.

### 2. Scrivere Test Mirati

Una volta identificate le aree non coperte, è possibile scrivere test mirati per queste parti del codice. È importante concentrarsi non solo sulla quantità di codice coperto, ma anche sulla qualità dei test.

### 3. Utilizzare il Test-Driven Development

Il TDD può aiutare a mantenere una buona copertura del codice, poiché i test vengono scritti prima del codice di produzione.

### 4. Automatizzare il Controllo della Copertura

È possibile configurare strumenti di integrazione continua per verificare che la copertura del codice non scenda sotto una certa soglia:

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
          pytest --cov=myapp --cov-report=xml --cov-fail-under=80
```

In questo esempio, il workflow fallirà se la copertura del codice scende sotto l'80%.

## Oltre la Copertura: Qualità del Codice

La copertura del codice è solo uno degli aspetti della qualità del codice. Altri strumenti e metriche possono aiutare a migliorare la qualità complessiva del codice:

### Linting e Analisi Statica

Gli strumenti di linting e analisi statica possono identificare potenziali problemi nel codice senza eseguirlo:

- **Pylint**: Analizza il codice per errori, stile e convenzioni
- **Flake8**: Combina PyFlakes, pycodestyle e McCabe per verificare stile e errori
- **Mypy**: Verifica i tipi statici in Python
- **Bandit**: Identifica problemi di sicurezza comuni

```bash
pip install pylint flake8 mypy bandit

# Esecuzione degli strumenti
pylint myapp
flake8 myapp
mypy myapp
bandit -r myapp
```

### Metriche di Complessità

Le metriche di complessità aiutano a identificare parti del codice che potrebbero essere difficili da mantenere o testare:

- **Complessità ciclomatica**: Misura il numero di percorsi indipendenti attraverso il codice
- **Complessità cognitiva**: Misura quanto è difficile comprendere il codice
- **Accoppiamento**: Misura quanto le diverse parti del codice dipendono l'una dall'altra

```bash
pip install radon

# Analisi della complessità ciclomatica
radon cc myapp

# Analisi della complessità cognitiva
radon mi myapp
```

### Refactoring

Il refactoring è il processo di miglioramento del codice senza cambiarne il comportamento esterno. È un'attività importante per mantenere il codice pulito e facile da mantenere.

Alcune tecniche di refactoring comuni:

- Estrazione di metodi o funzioni
- Rinominazione di variabili e funzioni per maggiore chiarezza
- Semplificazione di espressioni condizionali complesse
- Rimozione di codice duplicato

### Revisione del Codice

La revisione del codice è un processo in cui altri sviluppatori esaminano il codice per identificare problemi e suggerire miglioramenti. È una pratica importante per garantire la qualità del codice e condividere conoscenze all'interno del team.

## Strumenti Integrati per la Qualità del Codice

Esistono strumenti che integrano diverse metriche di qualità del codice in un'unica piattaforma:

### SonarQube

SonarQube è una piattaforma open source per l'ispezione continua della qualità del codice. Analizza il codice per bug, vulnerabilità, code smells e duplicazioni.

```bash
# Installazione del plugin SonarQube per Python
pip install sonar-scanner-cli

# Esecuzione dell'analisi
sonar-scanner \
  -Dsonar.projectKey=my_project \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=myauthtoken
```

### Codacy

Codacy è un servizio che automatizza la revisione del codice e monitora la qualità del codice. Supporta diverse metriche e può essere integrato con GitHub, GitLab e Bitbucket.

### CodeClimate

CodeClimate è un altro servizio che fornisce analisi automatizzata della qualità del codice. Offre metriche di manutenibilità, duplicazione e complessità.

## Conclusione

La copertura del codice è un indicatore importante della qualità dei test, ma non è l'unico aspetto da considerare. Una strategia completa per la qualità del codice dovrebbe includere diverse metriche e strumenti, dalla copertura del codice all'analisi statica, dal refactoring alla revisione del codice.

L'obiettivo finale non è raggiungere il 100% di copertura o eliminare tutti i warning degli strumenti di analisi, ma creare un codice che sia facile da comprendere, mantenere e modificare, e che funzioni correttamente in tutte le situazioni previste.

## Risorse Aggiuntive

- [Documentazione di coverage.py](https://coverage.readthedocs.io/)
- [Documentazione di pytest-cov](https://pytest-cov.readthedocs.io/)
- [Pylint User Manual](https://pylint.pycqa.org/en/latest/)
- [Clean Code: A Handbook of Agile Software Craftsmanship](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) di Robert C. Martin

[Torna all'indice](../README.md) | [Capitolo precedente: Pytest](05-pytest.md) | [Capitolo successivo: Best practices nel testing](07-best-practices.md)