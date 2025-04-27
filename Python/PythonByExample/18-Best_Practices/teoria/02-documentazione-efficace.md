# Documentazione Efficace in Python

In questa guida esploreremo le migliori pratiche per documentare il codice Python, un aspetto fondamentale per garantire la manutenibilità e la comprensibilità del software nel tempo.

## Perché documentare il codice?

La documentazione è una parte essenziale dello sviluppo software per diversi motivi:

- Facilita la comprensione del codice per altri sviluppatori (e per te stesso in futuro)
- Riduce il tempo necessario per l'onboarding di nuovi membri del team
- Migliora la manutenibilità del codice a lungo termine
- Serve come riferimento per l'utilizzo di API e librerie
- Aiuta a identificare e correggere bug più facilmente

Come dice il famoso detto: "Il codice dice come, la documentazione dice perché".

## Tipi di documentazione in Python

### 1. Docstring

I docstring sono stringhe di documentazione incorporate nel codice Python. Possono essere accessibili a runtime tramite l'attributo `__doc__` e sono utilizzati da strumenti come `help()` e generatori di documentazione.

#### Formati di docstring

Esistono diversi formati standard per i docstring:

##### Formato reStructuredText (stile Sphinx)

```python
def calcola_media(numeri):
    """
    Calcola la media aritmetica di una sequenza di numeri.
    
    :param numeri: Una sequenza di numeri
    :type numeri: list o tuple
    :return: La media aritmetica
    :rtype: float
    :raises TypeError: Se l'input non è una sequenza di numeri
    
    .. note::
        Questa funzione gestisce solo sequenze non vuote
    """
    if not numeri:
        raise ValueError("La sequenza non può essere vuota")
    return sum(numeri) / len(numeri)
```

##### Formato Google

```python
def calcola_media(numeri):
    """
    Calcola la media aritmetica di una sequenza di numeri.
    
    Args:
        numeri (list o tuple): Una sequenza di numeri
    
    Returns:
        float: La media aritmetica
    
    Raises:
        TypeError: Se l'input non è una sequenza di numeri
        ValueError: Se la sequenza è vuota
    
    Note:
        Questa funzione gestisce solo sequenze non vuote
    """
    if not numeri:
        raise ValueError("La sequenza non può essere vuota")
    return sum(numeri) / len(numeri)
```

##### Formato NumPy

```python
def calcola_media(numeri):
    """
    Calcola la media aritmetica di una sequenza di numeri.
    
    Parameters
    ----------
    numeri : list o tuple
        Una sequenza di numeri
    
    Returns
    -------
    float
        La media aritmetica
    
    Raises
    ------
    TypeError
        Se l'input non è una sequenza di numeri
    ValueError
        Se la sequenza è vuota
    
    Notes
    -----
    Questa funzione gestisce solo sequenze non vuote
    """
    if not numeri:
        raise ValueError("La sequenza non può essere vuota")
    return sum(numeri) / len(numeri)
```

### 2. Commenti nel codice

I commenti sono utili per spiegare sezioni di codice complesse o non intuitive. A differenza dei docstring, i commenti sono destinati principalmente agli sviluppatori che leggono il codice sorgente.

```python
# Calcola il coefficiente di correlazione usando la formula di Pearson
# r = Σ[(x_i - x̄)(y_i - ȳ)] / √[Σ(x_i - x̄)² * Σ(y_i - ȳ)²]
numeratore = sum((x[i] - media_x) * (y[i] - media_y) for i in range(n))
denominatore = (sum((x[i] - media_x)**2 for i in range(n)) * 
               sum((y[i] - media_y)**2 for i in range(n)))**0.5
r = numeratore / denominatore
```

### 3. Type Hints (suggerimenti di tipo)

Introdotti in Python 3.5, i type hints migliorano la documentazione indicando i tipi di dati attesi per parametri e valori di ritorno.

```python
from typing import List, Union, Optional

def filtra_numeri(valori: List[Union[int, float]], 
                 soglia: float = 0.0) -> List[Union[int, float]]:
    """
    Filtra i numeri maggiori di una soglia data.
    
    Args:
        valori: Lista di numeri da filtrare
        soglia: Valore minimo da considerare (default: 0.0)
    
    Returns:
        Lista di numeri filtrati
    """
    return [x for x in valori if x > soglia]

def trova_utente(id_utente: int) -> Optional[dict]:
    """
    Cerca un utente per ID.
    
    Args:
        id_utente: ID dell'utente da cercare
    
    Returns:
        Dizionario con i dati dell'utente o None se non trovato
    """
    # Implementazione...
```

## Documentazione a livello di modulo e pacchetto

### Docstring di modulo

Ogni modulo Python dovrebbe iniziare con un docstring che descrive il suo scopo e contenuto.

```python
"""
# Modulo di utilità per l'analisi dei dati

Questo modulo fornisce funzioni per l'analisi statistica di base
e la manipolazione di dati numerici.

Funzioni principali:
    * calcola_media - Calcola la media aritmetica
    * calcola_mediana - Calcola la mediana
    * calcola_varianza - Calcola la varianza

Esempio:
    >>> from stats_utils import calcola_media
    >>> calcola_media([1, 2, 3, 4, 5])
    3.0
"""

# Importazioni e codice del modulo...
```

### File README

Ogni pacchetto Python dovrebbe includere un file README che fornisce una panoramica del progetto, istruzioni di installazione e utilizzo di base.

```markdown
# StatisticsTools

Una libreria Python per l'analisi statistica di dati numerici.

## Installazione

```bash
pip install statistics-tools
```

## Utilizzo

```python
from statistics_tools import basic_stats

dati = [1, 2, 3, 4, 5]
print(f"Media: {basic_stats.calcola_media(dati)}")
print(f"Mediana: {basic_stats.calcola_mediana(dati)}")
```

## Caratteristiche

- Calcolo di statistiche di base (media, mediana, moda, varianza)
- Analisi di correlazione
- Generazione di grafici statistici

## Requisiti

- Python 3.6+
- NumPy
- Matplotlib (per la generazione di grafici)
```

## Strumenti per la generazione di documentazione

### Sphinx

Sphinx è uno strumento potente per generare documentazione da docstring Python. Supporta diversi formati di output, tra cui HTML, PDF e ePub.

#### Configurazione di base di Sphinx

1. Installazione:

```bash
pip install sphinx sphinx-rtd-theme
```

2. Inizializzazione:

```bash
sphinx-quickstart
```

3. Configurazione in `conf.py`:

```python
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
    'sphinx.ext.napoleon',  # Per supportare i formati Google e NumPy
]

html_theme = 'sphinx_rtd_theme'
```

4. Generazione della documentazione:

```bash
sphinx-build -b html source_dir build_dir
```

### MkDocs

MkDocs è un'alternativa più leggera a Sphinx, focalizzata sulla generazione di documentazione in Markdown.

#### Configurazione di base di MkDocs

1. Installazione:

```bash
pip install mkdocs mkdocstrings
```

2. Configurazione in `mkdocs.yml`:

```yaml
site_name: Il mio progetto Python
theme: readthedocs

plugins:
  - search
  - mkdocstrings

nav:
  - Home: index.md
  - API: api.md
  - Guida utente: user-guide.md
```

3. Generazione della documentazione:

```bash
mkdocs build
```

## Migliori pratiche per la documentazione

### 1. Mantieni la documentazione aggiornata

La documentazione obsoleta è spesso peggiore dell'assenza di documentazione. Aggiorna sempre la documentazione quando modifichi il codice.

### 2. Documenta il "perché", non solo il "come"

Il codice stesso mostra "come" qualcosa viene fatto. La documentazione dovrebbe spiegare "perché" è stato fatto in quel modo e quali problemi risolve.

### 3. Usa esempi

Gli esempi sono estremamente utili per mostrare come utilizzare il codice in situazioni reali.

```python
def ordina_per_chiave(items, chiave):
    """
    Ordina una lista di dizionari in base al valore di una chiave specifica.
    
    Args:
        items: Lista di dizionari da ordinare
        chiave: Chiave da utilizzare per l'ordinamento
    
    Returns:
        Lista ordinata
    
    Esempio:
        >>> utenti = [{"nome": "Mario", "età": 30}, {"nome": "Luigi", "età": 25}]
        >>> ordina_per_chiave(utenti, "età")
        [{"nome": "Luigi", "età": 25}, {"nome": "Mario", "età": 30}]
    """
    return sorted(items, key=lambda x: x.get(chiave))
```

### 4. Documenta le eccezioni

Specifica sempre quali eccezioni può sollevare una funzione e in quali circostanze.

### 5. Usa test come documentazione

I test unitari ben scritti possono servire come documentazione eseguibile, mostrando come il codice dovrebbe essere utilizzato e quali risultati ci si aspetta.

```python
def test_calcola_media():
    """Verifica che la funzione calcola_media funzioni correttamente."""
    assert calcola_media([1, 2, 3, 4, 5]) == 3.0
    assert calcola_media([0, 0, 0]) == 0.0
    assert round(calcola_media([1.5, 2.5]), 1) == 2.0
    
    with pytest.raises(ValueError):
        calcola_media([])
```

## Integrazione della documentazione nel flusso di lavoro

### Controllo automatico della documentazione

Strumenti come `pydocstyle` possono verificare che il codice sia adeguatamente documentato:

```bash
pip install pydocstyle
pydocstyle mio_modulo.py
```

### Documentazione continua

Integra la generazione della documentazione nel tuo processo CI/CD per mantenerla sempre aggiornata:

```yaml
# Esempio di configurazione per GitHub Actions
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          pip install -e .
          pip install sphinx sphinx-rtd-theme
      - name: Build docs
        run: |
          cd docs
          make html
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/_build/html
```

## Conclusione

Una documentazione efficace è un investimento che ripaga nel tempo, rendendo il codice più accessibile, manutenibile e riutilizzabile. Adottare pratiche di documentazione coerenti fin dall'inizio di un progetto può risparmiare ore di lavoro in futuro e migliorare significativamente la qualità del software.

Ricorda che la documentazione non è un'attività da svolgere una tantum alla fine dello sviluppo, ma un processo continuo che dovrebbe accompagnare l'intero ciclo di vita del software.

## Risorse aggiuntive

- [Documentazione ufficiale di Python sui docstring](https://www.python.org/dev/peps/pep-0257/)
- [Guida alla documentazione di Sphinx](https://www.sphinx-doc.org/en/master/usage/quickstart.html)
- [Documentazione di MkDocs](https://www.mkdocs.org/)
- [Guida ai type hints in Python](https://docs.python.org/3/library/typing.html)

## Esercizi

1. Scegli un modulo Python che hai scritto in precedenza e aggiungi docstring completi a tutte le funzioni e classi.
2. Configura Sphinx per generare documentazione HTML per un tuo progetto.
3. Scrivi un README completo per uno dei tuoi progetti seguendo le linee guida presentate.
4. Aggiungi type hints a un modulo esistente e verifica che funzionino correttamente con mypy.
5. Crea un test unitario che serva anche come esempio di utilizzo per una funzione complessa.

---

[Torna all'indice](../README.md) | [Prossima guida: Gestione degli errori](03-gestione-errori.md)