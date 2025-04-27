# Documentazione

La documentazione è una parte essenziale di qualsiasi progetto software. In questa guida, imparerai come documentare efficacemente il tuo progetto Python finale.

## Obiettivi di apprendimento

- Comprendere l'importanza della documentazione nel ciclo di vita del software
- Imparare a scrivere documentazione chiara ed efficace per il codice
- Creare documentazione per gli utenti e gli sviluppatori
- Utilizzare strumenti per generare documentazione automaticamente

## Tipi di documentazione

### Documentazione del codice

La documentazione del codice include commenti, docstring e annotazioni di tipo che aiutano a comprendere come funziona il codice.

#### Commenti

I commenti spiegano perché il codice fa qualcosa, non cosa fa (che dovrebbe essere evidente dal codice stesso).

```python
# Calcola il prezzo totale con uno sconto del 10% per ordini superiori a 100€
total_price = sum(item.price for item in cart)
if total_price > 100:
    total_price *= 0.9  # Applica sconto del 10%
```

#### Docstring

Le docstring sono stringhe di documentazione che descrivono moduli, classi, funzioni e metodi. Python supporta diverse convenzioni per le docstring, tra cui Google style, NumPy style e reStructuredText.

**Esempio di docstring in stile Google:**
```python
def calculate_discount(price, quantity, discount_rate=0.1):
    """Calcola il prezzo scontato per un prodotto.
    
    Applica uno sconto al prezzo totale di un prodotto in base alla quantità
    e al tasso di sconto specificato.
    
    Args:
        price (float): Il prezzo unitario del prodotto.
        quantity (int): La quantità del prodotto.
        discount_rate (float, optional): Il tasso di sconto da applicare.
            Defaults to 0.1 (10%).
    
    Returns:
        float: Il prezzo totale scontato.
    
    Raises:
        ValueError: Se il prezzo o la quantità sono negativi.
    
    Examples:
        >>> calculate_discount(10.0, 5)
        45.0  # 10.0 * 5 * 0.9
        
        >>> calculate_discount(10.0, 5, 0.2)
        40.0  # 10.0 * 5 * 0.8
    """
    if price < 0 or quantity < 0:
        raise ValueError("Il prezzo e la quantità devono essere positivi")
    
    total = price * quantity
    return total * (1 - discount_rate)
```

#### Annotazioni di tipo

Le annotazioni di tipo (type hints) aiutano a specificare i tipi di parametri e valori di ritorno delle funzioni.

```python
from typing import List, Dict, Optional, Union

def process_data(data: List[Dict[str, Union[str, int]]]) -> Optional[Dict[str, int]]:
    """Elabora una lista di dizionari e restituisce statistiche.
    
    Args:
        data: Lista di dizionari con chiavi stringa e valori stringa o interi.
    
    Returns:
        Dizionario con statistiche o None se l'input è vuoto.
    """
    if not data:
        return None
    
    result = {}
    for item in data:
        for key, value in item.items():
            if isinstance(value, int):
                result[key] = result.get(key, 0) + value
    
    return result
```

### Documentazione del progetto

La documentazione del progetto include file come README, guide per l'installazione, tutorial e documentazione di riferimento.

#### README

Il file README è spesso il primo documento che gli utenti leggono. Dovrebbe fornire una panoramica del progetto e informazioni essenziali.

**Esempio di struttura per un README.md:**
```markdown
# Nome del Progetto

Breve descrizione del progetto.

## Caratteristiche

- Caratteristica 1
- Caratteristica 2
- Caratteristica 3

## Installazione

```bash
pip install nome-progetto
```

## Utilizzo

```python
import nome_progetto

risultato = nome_progetto.funzione_principale()
print(risultato)
```

## Documentazione

Per la documentazione completa, visita [link alla documentazione].

## Contribuire

Le contribuzioni sono benvenute! Consulta [CONTRIBUTING.md] per le linee guida.

## Licenza

Questo progetto è distribuito con licenza [nome della licenza]. Vedi il file LICENSE per i dettagli.
```

#### Guide per l'utente

Le guide per l'utente spiegano come utilizzare il software, spesso con esempi e tutorial.

**Esempio di struttura per una guida utente:**
1. Introduzione
2. Installazione
3. Concetti fondamentali
4. Tutorial passo-passo
5. Esempi di utilizzo
6. Risoluzione dei problemi comuni
7. FAQ
8. Riferimenti

#### Documentazione tecnica

La documentazione tecnica è rivolta agli sviluppatori e include dettagli sull'architettura, le API e i processi di sviluppo.

**Esempio di struttura per una documentazione tecnica:**
1. Architettura del sistema
2. Diagrammi UML
3. Descrizione dei moduli
4. Riferimento API
5. Guida per gli sviluppatori
6. Procedure di test
7. Procedure di deployment

## Strumenti per la documentazione

### Sphinx

Sphinx è uno strumento potente per generare documentazione da docstring e file di markup.

**Installazione:**
```bash
pip install sphinx
```

**Inizializzazione:**
```bash
sphinx-quickstart
```

**Configurazione (conf.py):**
```python
extensions = [
    'sphinx.ext.autodoc',  # Genera documentazione dalle docstring
    'sphinx.ext.napoleon',  # Supporto per docstring in stile Google/NumPy
    'sphinx.ext.viewcode',  # Aggiunge link al codice sorgente
]

autodoc_typehints = 'description'  # Mostra le annotazioni di tipo nella descrizione
```

**Generazione della documentazione:**
```bash
sphinx-build -b html source_dir build_dir
```

### MkDocs

MkDocs è uno strumento semplice per creare documentazione da file Markdown.

**Installazione:**
```bash
pip install mkdocs
```

**Inizializzazione:**
```bash
mkdocs new my-project
```

**Configurazione (mkdocs.yml):**
```yaml
site_name: Nome del Progetto
nav:
  - Home: index.md
  - Guida Utente: user-guide.md
  - API: api.md
theme: readthedocs
```

**Generazione della documentazione:**
```bash
mkdocs build
```

**Avvio del server di sviluppo:**
```bash
mkdocs serve
```

### Docstrings e pydoc

Python include il modulo `pydoc` che può generare documentazione dalle docstring.

**Utilizzo dalla linea di comando:**
```bash
python -m pydoc module_name
```

**Generazione di documentazione HTML:**
```bash
python -m pydoc -w module_name
```

## Best practices per la documentazione

1. **Mantieni la documentazione aggiornata** insieme al codice
2. **Usa un linguaggio chiaro e conciso**
3. **Includi esempi** per mostrare come utilizzare il codice
4. **Documenta sia il comportamento normale che le eccezioni**
5. **Usa strumenti di generazione automatica** quando possibile
6. **Segui uno stile coerente** in tutto il progetto
7. **Pensa ai diversi tipi di utenti** (principianti, esperti, sviluppatori)

## Hosting della documentazione

### Read the Docs

Read the Docs è un servizio gratuito per ospitare documentazione generata con Sphinx o MkDocs.

**Configurazione (.readthedocs.yml):**
```yaml
version: 2

python:
  version: 3.8
  install:
    - requirements: docs/requirements.txt

sphinx:
  configuration: docs/conf.py
```

### GitHub Pages

GitHub Pages può ospitare documentazione statica generata con vari strumenti.

**Configurazione con GitHub Actions:**
```yaml
name: Build and Deploy Docs

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.8
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install mkdocs
      - name: Build docs
        run: mkdocs build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./site
```

## Esercizio pratico

1. Aggiungi docstring complete a tutte le funzioni e classi principali del tuo progetto
2. Crea un file README.md completo per il tuo progetto
3. Configura Sphinx o MkDocs per generare documentazione automatica
4. Scrivi una breve guida utente con esempi di utilizzo
5. Pubblica la documentazione su Read the Docs o GitHub Pages

## Risorse aggiuntive

- [Documentazione ufficiale di Sphinx](https://www.sphinx-doc.org/)
- [Documentazione ufficiale di MkDocs](https://www.mkdocs.org/)
- [Guida alle docstring in Python](https://www.python.org/dev/peps/pep-0257/)
- [Read the Docs](https://readthedocs.org/)

---

[Guida Precedente: Testing e debugging](./05_testing_debugging.md) | [Guida Successiva: Distribuzione e manutenzione](./07_distribuzione_manutenzione.md) | [Torna all'indice principale](../README.md)