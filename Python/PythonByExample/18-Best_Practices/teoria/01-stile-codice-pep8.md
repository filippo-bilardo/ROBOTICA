# Stile del Codice e PEP 8

In questa guida esploreremo le convenzioni di stile in Python, con particolare attenzione al PEP 8, il documento ufficiale che definisce le linee guida per lo stile del codice Python.

## Cos'è il PEP 8?

PEP sta per "Python Enhancement Proposal" (Proposta di Miglioramento di Python). Il PEP 8 è un documento che fornisce linee guida e convenzioni per scrivere codice Python leggibile e consistente. È stato scritto da Guido van Rossum (il creatore di Python), Barry Warsaw e Nick Coghlan.

Le convenzioni di stile sono importanti perché:

- Rendono il codice più leggibile e comprensibile
- Facilitano la manutenzione del codice
- Promuovono la consistenza tra diversi progetti
- Aiutano i team a collaborare in modo più efficiente

## Principali convenzioni di stile

### Indentazione

- Usa 4 spazi per ogni livello di indentazione (non usare tab)
- La continuazione delle righe dovrebbe allinearsi con le parentesi aperte o usare un'indentazione appesa di 4 spazi

```python
# Corretto
def funzione_lunga(parametro1, parametro2,
                  parametro3, parametro4):
    return parametro1 + parametro2

# Alternativa corretta
def funzione_lunga(
        parametro1, parametro2,
        parametro3, parametro4):
    return parametro1 + parametro2
```

### Lunghezza delle righe

- Limita tutte le righe a un massimo di 79 caratteri
- Per i commenti e i docstring, limita le righe a 72 caratteri
- Usa le parentesi per dividere le espressioni su più righe

```python
# Troppo lungo
risultato = funzione1(parametro_lungo1, parametro_lungo2, parametro_lungo3) + funzione2(parametro_lungo1, parametro_lungo2, parametro_lungo3)

# Corretto
risultato = (funzione1(parametro_lungo1, parametro_lungo2, parametro_lungo3) +
             funzione2(parametro_lungo1, parametro_lungo2, parametro_lungo3))
```

### Importazioni

- Le importazioni dovrebbero essere su righe separate
- Le importazioni dovrebbero essere raggruppate nell'ordine seguente:
  1. Librerie standard
  2. Librerie di terze parti correlate
  3. Importazioni locali specifiche dell'applicazione
- Ogni gruppo dovrebbe essere separato da una riga vuota

```python
# Corretto
import os
import sys

import numpy as np
import pandas as pd

from mio_modulo import funzione1, funzione2
```

### Spazi bianchi

- Evita spazi bianchi extra all'interno delle parentesi
- Evita spazi bianchi prima di una virgola, punto e virgola o due punti
- Usa uno spazio dopo la virgola, punto e virgola o due punti (tranne a fine riga)
- Non usare spazi attorno all'operatore di assegnazione dei parametri con valori predefiniti

```python
# Corretto
funzione(arg1, arg2, key=val)

# Scorretto
funzione( arg1, arg2, key = val )
```

### Convenzioni di nomenclatura

- **Funzioni e variabili**: `lowercase_with_underscores` (snake_case)
- **Classi**: `CapitalizedWords` (PascalCase)
- **Costanti**: `ALL_CAPS_WITH_UNDERSCORES`
- **Metodi privati e variabili**: iniziano con un underscore (es. `_private_method`)
- **Metodi "molto privati"**: iniziano con doppio underscore (es. `__very_private`)

```python
class PersonaUtente:
    STATO_ATTIVO = 1
    
    def __init__(self, nome, cognome):
        self.nome = nome
        self.cognome = cognome
        self._stato = self.STATO_ATTIVO
    
    def nome_completo(self):
        return f"{self.nome} {self.cognome}"
    
    def _aggiorna_stato(self, nuovo_stato):
        self._stato = nuovo_stato
```

## Strumenti per il controllo dello stile

Esistono diversi strumenti che possono aiutarti a verificare e mantenere la conformità con PEP 8:

### Pylint

Pylint è uno strumento di analisi statica che verifica la conformità con PEP 8 e identifica anche potenziali errori e problemi di qualità del codice.

```bash
pip install pylint
pylint mio_script.py
```

### Flake8

Flake8 combina PyFlakes (per verificare errori logici), pycodestyle (per verificare la conformità con PEP 8) e McCabe (per verificare la complessità ciclomatica).

```bash
pip install flake8
flake8 mio_script.py
```

### Black

Black è un formattatore di codice che riformatta automaticamente il tuo codice secondo uno stile consistente, basato su PEP 8 ma con alcune modifiche (come la lunghezza massima della riga a 88 caratteri).

```bash
pip install black
black mio_script.py
```

### isort

isort è uno strumento che ordina automaticamente le importazioni secondo le convenzioni PEP 8.

```bash
pip install isort
isort mio_script.py
```

## Configurazione degli strumenti

Puoi configurare questi strumenti utilizzando file di configurazione nel tuo progetto:

### Esempio di configurazione per Flake8 (`.flake8`)

```ini
[flake8]
max-line-length = 88
exclude = .git,__pycache__,build,dist
ignore = E203, W503
```

### Esempio di configurazione per Black (`pyproject.toml`)

```toml
[tool.black]
line-length = 88
include = '\.py$'
exclude = '''(
    /(\n  \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | _build
  | buck-out
  | build
  | dist
)/
)
'''
```

## Integrazione con IDE

La maggior parte degli IDE moderni supporta l'integrazione con questi strumenti di linting e formattazione:

- **PyCharm**: supporta nativamente PEP 8 e può essere configurato per utilizzare Pylint, Flake8 e Black
- **Visual Studio Code**: può essere configurato con le estensioni Python, Pylint, Flake8 e Black
- **Jupyter Notebook**: può utilizzare nbextensions per il linting e la formattazione

## Quando deviare da PEP 8

Come afferma lo stesso PEP 8: "La consistenza con questa guida è importante. La consistenza all'interno di un progetto è più importante. La consistenza all'interno di un modulo o funzione è la più importante."

Ci sono situazioni in cui è accettabile o addirittura consigliabile deviare dalle linee guida PEP 8:

1. Quando seguire la guida renderebbe il codice meno leggibile
2. Per mantenere la consistenza con il codice circostante che già viola la guida
3. Quando il codice deve essere compatibile con versioni di Python che non supportano le caratteristiche raccomandate

## Esempio pratico: Refactoring secondo PEP 8

Vediamo un esempio di refactoring di codice per renderlo conforme a PEP 8:

### Prima del refactoring

```python
class utente:
    def __init__(self,nome,cognome,eta):
        self.Nome=nome
        self.Cognome=cognome
        self.eta=eta
    def NomeCompleto(self):
        return self.Nome+" "+self.Cognome
    def è_maggiorenne(self): return self.eta>=18

def Calcola_Stipendio( base, bonus, tasse = 0.21 ):
    return base + bonus * ( 1 - tasse )
```

### Dopo il refactoring

```python
class Utente:
    def __init__(self, nome, cognome, eta):
        self.nome = nome
        self.cognome = cognome
        self.eta = eta
        
    def nome_completo(self):
        return f"{self.nome} {self.cognome}"
    
    def è_maggiorenne(self):
        return self.eta >= 18


def calcola_stipendio(base, bonus, tasse=0.21):
    return base + bonus * (1 - tasse)
```

## Conclusione

Adottare e seguire le convenzioni di stile PEP 8 è un passo importante per diventare un programmatore Python più professionale. Anche se all'inizio può sembrare un'aggiunta di lavoro, con il tempo diventerà naturale e i benefici in termini di leggibilità e manutenibilità del codice saranno evidenti.

Ricorda che gli strumenti automatici possono aiutarti molto in questo processo, permettendoti di concentrarti sulla logica del tuo codice piuttosto che sulle regole di formattazione.

## Risorse aggiuntive

- [Documento ufficiale PEP 8](https://www.python.org/dev/peps/pep-0008/)
- [Guida di stile di Google per Python](https://google.github.io/styleguide/pyguide.html)
- [Documentazione di Pylint](https://pylint.pycqa.org/)
- [Documentazione di Black](https://black.readthedocs.io/)

## Esercizi

1. Prendi un tuo script Python esistente e analizzalo con Flake8. Correggi tutti gli errori di stile segnalati.
2. Configura il tuo IDE preferito per evidenziare automaticamente le violazioni di PEP 8.
3. Utilizza Black per formattare automaticamente un progetto Python esistente e osserva le modifiche apportate.
4. Scrivi una breve guida di stile personalizzata per un tuo progetto, specificando eventuali deviazioni da PEP 8 e il motivo.

---

[Torna all'indice](../README.md) | [Prossima guida: Documentazione efficace](02-documentazione-efficace.md)