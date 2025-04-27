# Distribuzione e Packaging in Python

In questa guida esploreremo le migliori pratiche per distribuire e condividere il tuo codice Python, un aspetto fondamentale per rendere i tuoi progetti accessibili ad altri sviluppatori o utenti finali.

## Importanza della distribuzione e del packaging

Un buon packaging del codice offre numerosi vantaggi:

- Facilita l'installazione e l'utilizzo del tuo software
- Gestisce automaticamente le dipendenze
- Permette il versionamento del codice
- Semplifica l'aggiornamento del software
- Consente la distribuzione attraverso repository pubblici come PyPI

Come sviluppatori, è importante conoscere gli strumenti e le pratiche standard per distribuire il proprio codice in modo professionale.

## Strumenti fondamentali per il packaging

### 1. Virtualenv e ambienti virtuali

Gli ambienti virtuali sono fondamentali per isolare le dipendenze di progetti diversi.

```python
# Installazione di virtualenv
pip install virtualenv

# Creazione di un ambiente virtuale
virtualenv venv

# Attivazione dell'ambiente virtuale
# Su Windows
venv\Scripts\activate
# Su macOS/Linux
source venv/bin/activate

# Disattivazione dell'ambiente virtuale
deactivate
```

Un'alternativa moderna è `venv`, incluso nella libreria standard Python:

```python
# Creazione di un ambiente virtuale con venv
python -m venv myenv

# Attivazione come sopra
```

### 2. Pip e requirements.txt

Pip è il gestore di pacchetti standard per Python.

```python
# Installazione di un pacchetto
pip install requests

# Installazione di una versione specifica
pip install requests==2.28.1

# Generazione di requirements.txt
pip freeze > requirements.txt

# Installazione da requirements.txt
pip install -r requirements.txt
```

Esempio di file `requirements.txt`:

```
requests==2.28.1
numpy==1.23.4
pandas==1.5.1
matplotlib==3.6.2
```

### 3. Setuptools e setup.py

Setuptools è lo strumento standard per creare pacchetti Python distribuibili.

Esempio di file `setup.py`:

```python
from setuptools import setup, find_packages

setup(
    name="mio_pacchetto",
    version="0.1.0",
    author="Il Tuo Nome",
    author_email="tua.email@esempio.com",
    description="Una breve descrizione del pacchetto",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/username/mio_pacchetto",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
    install_requires=[
        "requests>=2.25.0",
        "numpy>=1.20.0",
    ],
)
```

### 4. Wheel

Wheel è un formato di pacchetto Python precompilato che accelera l'installazione.

```bash
# Installazione di wheel
pip install wheel

# Creazione di un pacchetto wheel
python setup.py bdist_wheel

# Installazione da un file wheel
pip install dist/mio_pacchetto-0.1.0-py3-none-any.whl
```

## Struttura di un pacchetto Python

Una struttura ben organizzata è fondamentale per un pacchetto Python:

```
mio_pacchetto/
├── LICENSE
├── README.md
├── setup.py
├── requirements.txt
├── mio_pacchetto/
│   ├── __init__.py
│   ├── modulo1.py
│   └── modulo2.py
└── tests/
    ├── __init__.py
    ├── test_modulo1.py
    └── test_modulo2.py
```

Esempio di file `__init__.py` per definire cosa viene esposto dal pacchetto:

```python
# mio_pacchetto/__init__.py
from .modulo1 import funzione_principale
from .modulo2 import ClasseUtile

__version__ = "0.1.0"
```

## Pubblicazione su PyPI

PyPI (Python Package Index) è il repository ufficiale per i pacchetti Python.

### Preparazione per la pubblicazione

```bash
# Installazione degli strumenti necessari
pip install twine

# Creazione dei pacchetti di distribuzione
python setup.py sdist bdist_wheel
```

### Caricamento su TestPyPI

È buona pratica testare prima su TestPyPI:

```bash
twine upload --repository-url https://test.pypi.org/legacy/ dist/*
```

### Pubblicazione su PyPI

```bash
twine upload dist/*
```

Dopo la pubblicazione, il pacchetto sarà installabile con:

```bash
pip install mio_pacchetto
```

## Gestione delle versioni

Una buona strategia di versionamento è fondamentale. Il formato più comune è il Semantic Versioning (SemVer):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: cambiamenti incompatibili con le versioni precedenti
- **MINOR**: funzionalità aggiunte in modo retrocompatibile
- **PATCH**: correzioni di bug retrocompatibili

Esempio di gestione delle versioni nel codice:

```python
# In __init__.py
__version__ = "1.2.3"

# In setup.py
from mio_pacchetto import __version__

setup(
    name="mio_pacchetto",
    version=__version__,
    # ...
)
```

## Distribuzione di applicazioni eseguibili

### PyInstaller

PyInstaller converte script Python in eseguibili standalone:

```bash
# Installazione
pip install pyinstaller

# Creazione di un eseguibile
pyinstaller --onefile mio_script.py
```

### cx_Freeze

cx_Freeze è un'alternativa a PyInstaller:

```bash
# Installazione
pip install cx_Freeze

# Creazione di un setup.py per cx_Freeze
from cx_Freeze import setup, Executable

setup(
    name="mia_applicazione",
    version="0.1",
    description="Descrizione dell'applicazione",
    executables=[Executable("main.py")],
    options={
        "build_exe": {
            "packages": ["os", "numpy"],
            "include_files": ["data/"]
        }
    }
)

# Creazione dell'eseguibile
python setup.py build
```

## Distribuzione con Docker

Docker permette di impacchettare l'applicazione con tutte le sue dipendenze in un container isolato.

Esempio di `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
```

Comandi per costruire e eseguire il container:

```bash
# Costruzione dell'immagine
docker build -t mia-app .

# Esecuzione del container
docker run mia-app
```

## Continuous Integration e Deployment

L'integrazione di CI/CD nel processo di distribuzione automatizza test e rilasci.

Esempio di configurazione GitHub Actions (`.github/workflows/python-package.yml`):

```yaml
name: Python Package

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
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
        pip install flake8 pytest
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    - name: Lint with flake8
      run: |
        flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
    - name: Test with pytest
      run: |
        pytest
```

## Migliori pratiche per la distribuzione

1. **Usa sempre ambienti virtuali** per lo sviluppo e il testing
2. **Specifica le versioni delle dipendenze** per garantire la riproducibilità
3. **Documenta chiaramente il processo di installazione** nel README
4. **Includi una licenza** appropriata per il tuo progetto
5. **Automatizza il processo di rilascio** con CI/CD
6. **Testa il pacchetto** in diversi ambienti prima della pubblicazione
7. **Mantieni un changelog** per documentare le modifiche tra le versioni
8. **Segui il Semantic Versioning** per una gestione chiara delle versioni

## Strumenti moderni per il packaging

### Poetry

Poetry è uno strumento moderno che semplifica la gestione delle dipendenze e il packaging:

```bash
# Installazione di Poetry
pip install poetry

# Creazione di un nuovo progetto
poetry new mio-progetto

# Aggiunta di dipendenze
poetry add requests

# Installazione delle dipendenze
poetry install

# Pubblicazione su PyPI
poetry publish --build
```

Esempio di file `pyproject.toml` (usato da Poetry):

```toml
[tool.poetry]
name = "mio-progetto"
version = "0.1.0"
description = "Descrizione del progetto"
authors = ["Il Tuo Nome <tua.email@esempio.com>"]

[tool.poetry.dependencies]
python = "^3.8"
requests = "^2.28.1"

[tool.poetry.dev-dependencies]
pytest = "^7.0.0"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
```

### Pipenv

Pipenv combina pip e virtualenv in un unico strumento:

```bash
# Installazione di Pipenv
pip install pipenv

# Installazione di pacchetti
pipenv install requests

# Installazione di pacchetti di sviluppo
pipenv install --dev pytest

# Attivazione dell'ambiente virtuale
pipenv shell
```

## Conclusione

Una buona strategia di distribuzione e packaging è essenziale per rendere il tuo codice Python accessibile e utilizzabile da altri. Gli strumenti e le pratiche descritte in questa guida ti aiuteranno a creare pacchetti professionali e a distribuirli in modo efficace.

Ricorda questi principi chiave:

1. **Organizza il codice** in una struttura chiara e logica
2. **Gestisci correttamente le dipendenze** per evitare conflitti
3. **Documenta l'installazione e l'utilizzo** del tuo pacchetto
4. **Segui le convenzioni di versionamento** standard
5. **Automatizza il processo di distribuzione** quando possibile

La distribuzione non è solo l'ultimo passo dello sviluppo, ma una parte integrante del ciclo di vita del software che merita attenzione e cura.

## Risorse aggiuntive

- [Python Packaging User Guide](https://packaging.python.org/)
- [PyPI - Python Package Index](https://pypi.org/)
- [Documentazione di Setuptools](https://setuptools.pypa.io/)
- [Documentazione di Poetry](https://python-poetry.org/docs/)
- [Guida a Docker per applicazioni Python](https://docs.docker.com/language/python/)

## Esercizi

1. Crea un semplice pacchetto Python con setuptools e pubblicalo su TestPyPI.
2. Converti un'applicazione Python esistente in un eseguibile standalone con PyInstaller.
3. Implementa una pipeline CI/CD per un progetto Python utilizzando GitHub Actions.
4. Crea un container Docker per un'applicazione web Python.
5. Migra un progetto esistente da setup.py a Poetry o Pipenv.

---

[Torna all'indice](../README.md) | [Prossima guida: Sviluppo professionale](08-sviluppo-professionale.md)