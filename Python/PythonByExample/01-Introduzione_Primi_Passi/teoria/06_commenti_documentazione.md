# Commenti e documentazione in Python

## Introduzione
La documentazione del codice è una pratica fondamentale nella programmazione. In questa guida, esploreremo come scrivere commenti efficaci e documentare il codice Python in modo professionale.

## Perché documentare il codice?

Documentare il codice offre numerosi vantaggi:
- Rende il codice più comprensibile per te stesso in futuro
- Facilita la collaborazione con altri sviluppatori
- Aiuta a identificare e correggere bug più facilmente
- Migliora la manutenibilità del codice nel lungo periodo

## Tipi di commenti in Python

### 1. Commenti su singola riga

I commenti su singola riga iniziano con il simbolo `#` e continuano fino alla fine della riga:

```python
# Questo è un commento su singola riga
print("Hello, World!")  # Questo è un commento inline
```

### 2. Commenti multi-riga

Per commenti più lunghi, puoi usare più righe con `#` all'inizio di ciascuna:

```python
# Questo è un commento
# che si estende su
# più righe
print("Hello, World!")
```

Alternativamente, puoi usare triple virgolette (docstring) per commenti multi-riga, anche se tecnicamente sono stringhe e non commenti:

```python
"""
Questo è un commento
che si estende su
più righe
"""
print("Hello, World!")
```

## Docstring: documentazione delle funzioni e dei moduli

Le docstring sono stringhe di documentazione che descrivono moduli, classi, metodi o funzioni. Sono racchiuse tra triple virgolette (`"""` o `'''`) e vengono posizionate subito dopo la definizione dell'elemento che documentano.

### Docstring per moduli

Le docstring dei moduli vanno all'inizio del file:

```python
"""
Calcolatrice

Questo modulo fornisce funzioni matematiche di base
come addizione, sottrazione, moltiplicazione e divisione.
"""

# Resto del codice...
```

### Docstring per funzioni

```python
def somma(a, b):
    """
    Calcola la somma di due numeri.
    
    Args:
        a (int): Il primo numero
        b (int): Il secondo numero
        
    Returns:
        int: La somma di a e b
    """
    return a + b
```

### Docstring per classi

```python
class Persona:
    """
    Classe che rappresenta una persona.
    
    Attributes:
        nome (str): Il nome della persona
        eta (int): L'età della persona
    """
    
    def __init__(self, nome, eta):
        """
        Inizializza una nuova istanza di Persona.
        
        Args:
            nome (str): Il nome della persona
            eta (int): L'età della persona
        """
        self.nome = nome
        self.eta = eta
```

## Stili di documentazione

Esistono diversi stili di documentazione in Python. I più comuni sono:

### 1. Stile Google

```python
def divide(a, b):
    """
    Divide due numeri.
    
    Args:
        a: Il numeratore
        b: Il denominatore
        
    Returns:
        Il risultato della divisione
        
    Raises:
        ZeroDivisionError: Se b è zero
    """
    return a / b
```

### 2. Stile reStructuredText (reST)

```python
def divide(a, b):
    """
    Divide due numeri.
    
    :param a: Il numeratore
    :type a: int or float
    :param b: Il denominatore
    :type b: int or float
    :return: Il risultato della divisione
    :rtype: float
    :raises: ZeroDivisionError: Se b è zero
    """
    return a / b
```

### 3. Stile NumPy/SciPy

```python
def divide(a, b):
    """
    Divide due numeri.
    
    Parameters
    ----------
    a : int or float
        Il numeratore
    b : int or float
        Il denominatore
        
    Returns
    -------
    float
        Il risultato della divisione
        
    Raises
    ------
    ZeroDivisionError
        Se b è zero
    """
    return a / b
```

## Buone pratiche per i commenti

1. **Scrivi commenti chiari e concisi**: Evita commenti ovvi o ridondanti.

   ```python
   # Male
   x = x + 1  # Incrementa x di 1
   
   # Bene
   attempts += 1  # Incrementa il contatore dei tentativi
   ```

2. **Commenta il perché, non il cosa**: Il codice già mostra cosa fa, i commenti dovrebbero spiegare perché.

   ```python
   # Male
   x = x * 2  # Moltiplica x per 2
   
   # Bene
   # Raddoppia il valore per compensare la perdita di precisione
   x = x * 2
   ```

3. **Aggiorna i commenti**: Quando modifichi il codice, aggiorna anche i commenti correlati.

4. **Usa commenti TODO**: Per segnalare parti di codice che necessitano di miglioramenti futuri.

   ```python
   # TODO: Implementare la gestione degli errori
   def process_data(data):
       return data * 2
   ```

## Strumenti per la documentazione

### 1. Sphinx

Sphinx è uno strumento che può generare documentazione in vari formati (HTML, PDF, ecc.) dalle docstring del tuo codice Python.

### 2. pydoc

Python include `pydoc`, uno strumento da riga di comando per generare e visualizzare documentazione:

```
python -m pydoc nome_modulo
```

### 3. Accesso alle docstring nel codice

Puoi accedere alle docstring programmaticamente:

```python
def saluta(nome):
    """Restituisce un saluto personalizzato."""
    return f"Ciao, {nome}!"

# Accesso alla docstring
print(saluta.__doc__)  # Output: Restituisce un saluto personalizzato.
```

## Conclusione

Scrivere commenti e documentazione efficaci è un'abilità fondamentale per ogni programmatore Python. Una buona documentazione non solo aiuta gli altri a comprendere il tuo codice, ma aiuta anche te stesso quando torni a lavorare su codice scritto in precedenza. Ricorda: il codice racconta come, i commenti raccontano perché.

Nei prossimi capitoli, inizieremo a esplorare i concetti fondamentali di Python come variabili, tipi di dati e operatori.

---

[Indice dell'Esercitazione](../README.md) | [Precedente: Esecuzione di script Python](./05_esecuzione_script.md) | [Prossimo: Variabili e tipi di dati](../../../02-Variabili_e_Tipi_di_Dati/teoria/01_variabili_assegnazione.md)