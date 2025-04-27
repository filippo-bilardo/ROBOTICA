# Distribuzione e Manutenzione

La distribuzione e la manutenzione sono fasi cruciali nel ciclo di vita di un progetto software. In questa guida, imparerai come distribuire e mantenere efficacemente il tuo progetto Python finale.

## Obiettivi di apprendimento

- Comprendere le diverse opzioni per la distribuzione di applicazioni Python
- Imparare a creare pacchetti Python distribuibili
- Implementare strategie efficaci per la manutenzione del software
- Gestire versioni e aggiornamenti del software

## Packaging di applicazioni Python

### Creazione di un pacchetto Python

Per distribuire il tuo codice come pacchetto Python, devi creare una struttura di progetto appropriata e configurare i file di setup.

**Struttura di base di un pacchetto:**
```
my_package/
├── LICENSE
├── README.md
├── setup.py
├── setup.cfg
├── pyproject.toml
├── my_package/
│   ├── __init__.py
│   ├── module1.py
│   └── module2.py
└── tests/
    ├── __init__.py
    ├── test_module1.py
    └── test_module2.py
```

**Esempio di setup.py:**
```python
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="my-package",
    version="0.1.0",
    author="Il tuo nome",
    author_email="tua.email@example.com",
    description="Breve descrizione del pacchetto",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/username/my-package",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
    install_requires=[
        "numpy>=1.18.0",
        "pandas>=1.0.0",
    ],
    entry_points={
        "console_scripts": [
            "my-command=my_package.cli:main",
        ],
    },
)
```

**Esempio di pyproject.toml (per progetti che usano Poetry):**
```toml
[tool.poetry]
name = "my-package"
version = "0.1.0"
description = "Breve descrizione del pacchetto"
authors = ["Il tuo nome <tua.email@example.com>"]
license = "MIT"
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.8"
numpy = "^1.22.0"
pandas = "^1.4.0"

[tool.poetry.dev-dependencies]
pytest = "^7.0.0"
black = "^22.1.0"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"

[tool.poetry.scripts]
my-command = "my_package.cli:main"
```

### Costruzione e distribuzione del pacchetto

**Costruzione del pacchetto:**
```bash
# Usando setuptools
python setup.py sdist bdist_wheel

# Usando build (raccomandato)
pip install build
python -m build

# Usando Poetry
poetry build
```

**Pubblicazione su PyPI:**
```bash
# Installazione di twine
pip install twine

# Caricamento su TestPyPI (per test)
twine upload --repository-url https://test.pypi.org/legacy/ dist/*

# Caricamento su PyPI
twine upload dist/*

# Usando Poetry
poetry publish
```

## Distribuzione di applicazioni Python

### Applicazioni a riga di comando

Per le applicazioni a riga di comando, puoi utilizzare gli entry points in setup.py o pyproject.toml.

**Esempio di implementazione di un CLI:**
```python
# my_package/cli.py
import argparse
from . import core

def main():
    parser = argparse.ArgumentParser(description="Descrizione dell'applicazione")
    parser.add_argument("input", help="File di input")
    parser.add_argument("--output", "-o", help="File di output")
    parser.add_argument("--verbose", "-v", action="store_true", help="Modalità verbose")
    
    args = parser.parse_args()
    
    if args.verbose:
        print(f"Elaborazione di {args.input}")
    
    result = core.process_file(args.input)
    
    if args.output:
        with open(args.output, "w") as f:
            f.write(result)
    else:
        print(result)

if __name__ == "__main__":
    main()
```

### Applicazioni web

Per le applicazioni web, puoi utilizzare servizi di hosting come Heroku, PythonAnywhere o AWS.

**Esempio di Procfile per Heroku:**
```
web: gunicorn myapp:app
```

**Esempio di requirements.txt per un'applicazione Flask:**
```
flask==2.0.1
gunicorn==20.1.0
psycopg2-binary==2.9.1
SQLAlchemy==1.4.23
```

### Applicazioni desktop

Per le applicazioni desktop, puoi utilizzare strumenti come PyInstaller, cx_Freeze o py2exe per creare eseguibili standalone.

**Esempio di utilizzo di PyInstaller:**
```bash
# Installazione di PyInstaller
pip install pyinstaller

# Creazione di un eseguibile
pyinstaller --onefile --windowed myapp.py
```

**Esempio di spec file per PyInstaller:**
```python
# myapp.spec
block_cipher = None

a = Analysis(
    ['myapp.py'],
    pathex=['/path/to/your/app'],
    binaries=[],
    datas=[('data', 'data'), ('images', 'images')],
    hiddenimports=[],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False
)

pyz = PYZ(
    a.pure,
    a.zipped_data,
    cipher=block_cipher
)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='myapp',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    icon='icon.ico'
)
```

### Containerizzazione con Docker

Docker permette di impacchettare l'applicazione e le sue dipendenze in un container isolato.

**Esempio di Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

**Costruzione e avvio del container:**
```bash
# Costruzione dell'immagine
docker build -t myapp .

# Avvio del container
docker run -p 5000:5000 myapp
```

## Gestione delle versioni

### Semantic Versioning

Il Semantic Versioning (SemVer) è un sistema di versionamento che utilizza tre numeri: MAJOR.MINOR.PATCH.

- **MAJOR**: cambiamenti incompatibili con le versioni precedenti
- **MINOR**: aggiunte di funzionalità compatibili con le versioni precedenti
- **PATCH**: correzioni di bug compatibili con le versioni precedenti

**Esempio di evoluzione delle versioni:**
```
1.0.0 - Versione iniziale
1.0.1 - Correzione di bug
1.1.0 - Aggiunta di nuove funzionalità
2.0.0 - Cambiamenti incompatibili con le versioni precedenti
```

### Changelog

Il changelog documenta i cambiamenti tra le diverse versioni del software.

**Esempio di CHANGELOG.md:**
```markdown
# Changelog

Tutte le modifiche significative a questo progetto saranno documentate in questo file.

## [2.0.0] - 2023-03-15

### Cambiamenti
- Rinominata la funzione `process_data` in `process_input` per maggiore chiarezza
- Modificata la struttura del database

### Aggiunte
- Supporto per l'autenticazione OAuth2
- Nuova interfaccia utente

### Correzioni
- Risolto il problema di memoria con grandi dataset

## [1.1.0] - 2023-02-10

### Aggiunte
- Supporto per l'esportazione in formato CSV
- Nuova funzionalità di ricerca avanzata

### Correzioni
- Risolto il crash durante l'importazione di file XML

## [1.0.0] - 2023-01-15

### Aggiunte
- Versione iniziale
```

## Manutenzione del software

### Monitoraggio e logging

Il monitoraggio e il logging sono essenziali per identificare problemi in produzione.

**Esempio di configurazione di logging:**
```python
import logging
from logging.handlers import RotatingFileHandler

def setup_logging(app_name, log_level=logging.INFO):
    logger = logging.getLogger(app_name)
    logger.setLevel(log_level)
    
    # Handler per file con rotazione
    file_handler = RotatingFileHandler(
        f"{app_name}.log",
        maxBytes=10485760,  # 10 MB
        backupCount=5
    )
    file_handler.setLevel(log_level)
    
    # Handler per console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    
    # Formato del log
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Aggiunta degli handler al logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger
```

### Aggiornamenti e patch

Gli aggiornamenti e le patch sono necessari per correggere bug, migliorare le prestazioni e aggiungere nuove funzionalità.

**Processo di rilascio di un aggiornamento:**
1. Sviluppo delle modifiche in un branch separato
2. Test approfonditi delle modifiche
3. Aggiornamento del numero di versione e del changelog
4. Merge del branch nel main/master
5. Creazione di un tag per la nuova versione
6. Costruzione e distribuzione del pacchetto aggiornato

### Gestione delle dipendenze a lungo termine

La gestione delle dipendenze a lungo termine è importante per mantenere il software sicuro e aggiornato.

**Best practices:**
- Specificare intervalli di versioni compatibili per le dipendenze
- Utilizzare strumenti come dependabot o renovate per aggiornamenti automatici
- Testare regolarmente con le versioni più recenti delle dipendenze
- Pianificare la migrazione da dipendenze obsolete

## Esercizio pratico

1. Configura il tuo progetto finale come pacchetto Python distribuibile
2. Crea un file setup.py o pyproject.toml per il tuo progetto
3. Implementa il versionamento semantico e crea un changelog
4. Scegli un metodo di distribuzione appropriato per il tuo progetto
5. Configura un sistema di logging per il tuo progetto

## Risorse aggiuntive

- [Guida al packaging di Python](https://packaging.python.org/tutorials/packaging-projects/)
- [Documentazione di PyInstaller](https://pyinstaller.readthedocs.io/)
- [Guida a Docker per applicazioni Python](https://docs.docker.com/language/python/)
- [Semantic Versioning](https://semver.org/)

---

[Guida Precedente: Documentazione](./06_documentazione.md) | [Guida Successiva: Presentazione del progetto](./08_presentazione_progetto.md) | [Torna all'indice principale](../README.md)