# Costanti e convenzioni di nomenclatura

## Costanti in Python
A differenza di altri linguaggi di programmazione, Python non ha un meccanismo integrato per dichiarare costanti. Tuttavia, esiste una convenzione comune per indicare che una variabile dovrebbe essere trattata come una costante: utilizzare nomi in maiuscolo con parole separate da underscore.

```python
# Esempi di costanti in Python (per convenzione)
PI = 3.14159
MAX_TENTATIVI = 3
COLORI_BASE = ["rosso", "verde", "blu"]
DIRETTORY_DATI = "/var/data/"
```

Anche se queste variabili possono tecnicamente essere modificate, la convenzione del nome in maiuscolo segnala agli altri programmatori che questi valori non dovrebbero essere alterati durante l'esecuzione del programma.

## Modulo `constants`
Per una gestione più rigorosa delle costanti, è possibile creare un modulo separato che contiene solo costanti e importarlo dove necessario.

```python
# File: constants.py
PI = 3.14159
GRAVITY = 9.81
MAX_USERS = 100

# In un altro file
import constants
print(constants.PI)  # Accesso alla costante
```

Questo approccio non impedisce tecnicamente la modifica delle costanti, ma organizza il codice in modo più chiaro e rende più evidente l'intenzione.

## Convenzioni di nomenclatura in Python
Python ha una serie di convenzioni di nomenclatura che sono documentate nella [PEP 8](https://www.python.org/dev/peps/pep-0008/), la guida di stile ufficiale per il codice Python. Seguire queste convenzioni rende il codice più leggibile e coerente.

### Nomi di variabili e funzioni
- Utilizzare nomi in minuscolo con parole separate da underscore (snake_case).

```python
nome_utente = "alice123"
contatore_tentativi = 0

def calcola_media(numeri):
    # Implementazione della funzione
    pass
```

### Nomi di classi
- Utilizzare la notazione CamelCase (ogni parola inizia con una lettera maiuscola, senza underscore).

```python
class PersonaFisica:
    # Implementazione della classe
    pass

class GestoreDatabase:
    # Implementazione della classe
    pass
```

### Costanti
- Utilizzare nomi in maiuscolo con parole separate da underscore.

```python
MAX_CONNESSIONI = 100
DIRECTORY_DEFAULT = "/usr/local/bin/"
```

### Variabili private
- Per indicare che una variabile o un metodo dovrebbe essere considerato privato (non destinato all'uso esterno), utilizzare un singolo underscore all'inizio del nome.

```python
class Persona:
    def __init__(self, nome, età):
        self.nome = nome  # Attributo pubblico
        self._età = età   # Attributo "privato" (per convenzione)
    
    def _metodo_privato(self):
        # Implementazione del metodo
        pass
```

- Per rendere un attributo o un metodo "fortemente privato" (nascosto quando si importa con `from module import *`), utilizzare un doppio underscore all'inizio del nome.

```python
class Persona:
    def __init__(self, nome, codice_fiscale):
        self.nome = nome
        self.__codice_fiscale = codice_fiscale  # Attributo "fortemente privato"
```

Nota: gli attributi con doppio underscore all'inizio vengono "name-mangled" in Python, il che significa che il loro nome viene modificato internamente per evitare conflitti nelle sottoclassi.

### Metodi speciali
- I metodi speciali (o "dunder methods") hanno doppi underscore sia all'inizio che alla fine.

```python
class Vettore:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, altro):
        return Vettore(self.x + altro.x, self.y + altro.y)
    
    def __str__(self):
        return f"({self.x}, {self.y})"
```

### Nomi di moduli e pacchetti
- Utilizzare nomi brevi, in minuscolo e, se necessario, con underscore.
- Evitare nomi che potrebbero entrare in conflitto con moduli della libreria standard.

```python
# Buoni nomi di moduli
import math
import sys
import gestione_utenti
```

## Altre convenzioni importanti

### Indentazione
- Utilizzare 4 spazi per livello di indentazione (non tabulazioni).

```python
def funzione():
    if condizione:
        # Indentato con 4 spazi
        istruzione()
```

### Lunghezza massima delle righe
- Limitare tutte le righe a un massimo di 79 caratteri per il codice e 72 per i commenti e la documentazione.

### Importazioni
- Le importazioni dovrebbero essere su righe separate e raggruppate in questo ordine: libreria standard, librerie di terze parti, moduli locali.

```python
# Libreria standard
import os
import sys

# Librerie di terze parti
import numpy as np
import pandas as pd

# Moduli locali
import modulo_locale
from pacchetto import modulo
```

## Conclusione
Seguire le convenzioni di nomenclatura e le linee guida di stile è importante per scrivere codice Python leggibile e manutenibile. Anche se Python non ha un meccanismo integrato per le costanti, le convenzioni di nomenclatura forniscono un modo per indicare l'intenzione che certe variabili non dovrebbero essere modificate. Ricorda che la leggibilità del codice è importante, e seguire le convenzioni standard aiuta altri programmatori (e te stesso in futuro) a comprendere più facilmente il tuo codice.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Conversione tra tipi di dati](./05_conversione_tipi.md) | [Prossimo: Scope delle variabili](./07_scope_variabili.md)