# Creare Pacchetti Personalizzati in Python

Dopo aver compreso cosa sono i pacchetti e i loro vantaggi, è il momento di imparare come creare i nostri pacchetti personalizzati. Questo ci permetterà di organizzare il nostro codice in modo efficiente e di condividerlo facilmente con altri sviluppatori.

## Struttura di Base di un Pacchetto

Per creare un pacchetto Python, dobbiamo seguire questi passaggi fondamentali:

1. Creare una directory con il nome del pacchetto
2. Aggiungere un file `__init__.py` nella directory
3. Aggiungere i moduli Python (file `.py`) nella directory

Ecco un esempio di struttura di base:

```
mio_pacchetto/
├── __init__.py
├── modulo1.py
├── modulo2.py
└── modulo3.py
```

## Esempio Pratico: Creazione di un Pacchetto

Vediamo come creare un semplice pacchetto per la gestione di operazioni matematiche:

1. **Creare la struttura delle directory**:

```
matematica/
├── __init__.py
├── aritmetica.py
├── geometria.py
└── statistica.py
```

2. **Implementare i moduli**:

`aritmetica.py`:
```python
def somma(a, b):
    return a + b

def sottrazione(a, b):
    return a - b

def moltiplicazione(a, b):
    return a * b

def divisione(a, b):
    if b == 0:
        raise ValueError("Impossibile dividere per zero")
    return a / b
```

`geometria.py`:
```python
import math

def area_cerchio(raggio):
    return math.pi * raggio ** 2

def area_rettangolo(base, altezza):
    return base * altezza

def area_triangolo(base, altezza):
    return (base * altezza) / 2
```

`statistica.py`:
```python
def media(numeri):
    return sum(numeri) / len(numeri)

def mediana(numeri):
    numeri_ordinati = sorted(numeri)
    n = len(numeri_ordinati)
    if n % 2 == 0:
        return (numeri_ordinati[n//2 - 1] + numeri_ordinati[n//2]) / 2
    else:
        return numeri_ordinati[n//2]
```

3. **Configurare il file `__init__.py`**:

```python
# matematica/__init__.py

# Importa funzioni specifiche dai moduli
from .aritmetica import somma, sottrazione, moltiplicazione, divisione
from .geometria import area_cerchio, area_rettangolo, area_triangolo
from .statistica import media, mediana

# Definisce la versione del pacchetto
__version__ = '0.1.0'

# Definisce quali nomi saranno esposti con 'from matematica import *'
__all__ = [
    'somma', 'sottrazione', 'moltiplicazione', 'divisione',
    'area_cerchio', 'area_rettangolo', 'area_triangolo',
    'media', 'mediana'
]
```

## Utilizzo del Pacchetto

Una volta creato il pacchetto, possiamo utilizzarlo in vari modi:

```python
# Importare l'intero pacchetto
import matematica

# Utilizzare le funzioni importate nell'__init__.py
risultato = matematica.somma(5, 3)  # 8
area = matematica.area_cerchio(2)    # 12.56...

# Importare un modulo specifico
from matematica import geometria

# Utilizzare funzioni dal modulo
area = geometria.area_triangolo(4, 3)  # 6.0

# Importare funzioni specifiche
from matematica.statistica import media, mediana

# Utilizzare le funzioni importate
media_valori = media([1, 2, 3, 4, 5])  # 3.0
```

## Pacchetti Nidificati

Possiamo anche creare pacchetti nidificati per organizzare meglio il codice in progetti più complessi:

```
mio_progetto/
├── __init__.py
├── database/
│   ├── __init__.py
│   ├── connessione.py
│   └── query.py
├── interfaccia/
│   ├── __init__.py
│   ├── cli.py
│   └── gui.py
└── utils/
    ├── __init__.py
    ├── logger.py
    └── config.py
```

In questo modo, possiamo importare moduli da sottopacchetti:

```python
# Importare da un sottopacchetto
from mio_progetto.database import connessione
from mio_progetto.interfaccia import gui
from mio_progetto.utils import logger
```

## Distribuzione di Pacchetti

Per rendere il nostro pacchetto installabile e distribuibile, dobbiamo creare un file `setup.py` nella directory principale del progetto:

```
mio_progetto/
├── matematica/
│   ├── __init__.py
│   ├── aritmetica.py
│   ├── geometria.py
│   └── statistica.py
├── setup.py
└── README.md
```

Ecco un esempio di file `setup.py` di base:

```python
from setuptools import setup, find_packages

setup(
    name="matematica",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[],
    author="Il tuo nome",
    author_email="tua.email@esempio.com",
    description="Un pacchetto per operazioni matematiche",
    keywords="matematica, aritmetica, geometria, statistica",
    url="https://github.com/username/matematica",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
)
```

Dopo aver creato il file `setup.py`, possiamo installare il pacchetto localmente con:

```
pip install -e .
```

O distribuirlo su PyPI (Python Package Index) con:

```
python setup.py sdist bdist_wheel
pip install twine
twine upload dist/*
```

## Buone Pratiche per la Creazione di Pacchetti

1. **Struttura chiara**: Organizza il codice in modo logico e intuitivo
2. **Documentazione**: Includi docstring per moduli, classi e funzioni
3. **Test**: Aggiungi test unitari per verificare il funzionamento del codice
4. **README**: Fornisci istruzioni chiare su come installare e utilizzare il pacchetto
5. **Versionamento**: Usa il versionamento semantico (MAJOR.MINOR.PATCH)
6. **Dipendenze**: Specifica chiaramente le dipendenze nel file `setup.py`

## Conclusione

La creazione di pacchetti personalizzati è un'abilità fondamentale per qualsiasi sviluppatore Python che lavora su progetti di medie e grandi dimensioni. I pacchetti permettono di organizzare il codice in modo modulare, facilitando la manutenzione, il riutilizzo e la distribuzione.

Con questa conoscenza, sei ora in grado di strutturare i tuoi progetti Python in modo professionale e condividerli con la comunità.

---

[Indice degli Argomenti](../README.md) | [Precedente: Cosa sono i Pacchetti](./05_cosa_sono_pacchetti.md)