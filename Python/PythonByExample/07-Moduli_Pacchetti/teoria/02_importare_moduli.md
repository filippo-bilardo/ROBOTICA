# Importare Moduli in Python

Dopo aver compreso cosa sono i moduli, vediamo come importarli e utilizzarli nei nostri programmi. Python offre diverse modalità per importare moduli, ognuna con i propri vantaggi e casi d'uso.

## Importare un Modulo Intero

Il modo più semplice per importare un modulo è utilizzare l'istruzione `import`:

```python
import math

# Utilizzo delle funzioni del modulo con la notazione punto
print(math.sqrt(16))  # Output: 4.0
print(math.pi)        # Output: 3.141592653589793
```

In questo caso, tutte le funzioni e le variabili del modulo sono accessibili tramite la notazione punto (`modulo.nome`).

## Importare Elementi Specifici da un Modulo

Se hai bisogno solo di alcune funzioni o variabili da un modulo, puoi importarle direttamente:

```python
from math import sqrt, pi

# Utilizzo diretto delle funzioni importate senza la notazione punto
print(sqrt(16))  # Output: 4.0
print(pi)        # Output: 3.141592653589793
```

Questo approccio rende il codice più conciso, ma può causare conflitti di nomi se importi elementi con lo stesso nome da moduli diversi.

## Importare Tutti gli Elementi da un Modulo

Puoi importare tutti gli elementi di un modulo direttamente nel namespace corrente:

```python
from math import *

# Utilizzo diretto di tutte le funzioni del modulo math
print(sqrt(16))  # Output: 4.0
print(pi)        # Output: 3.141592653589793
```

**Nota**: Questa pratica è generalmente sconsigliata perché può causare conflitti di nomi e rendere difficile capire da quale modulo proviene una determinata funzione.

## Rinominare Moduli e Funzioni durante l'Importazione

Puoi rinominare moduli o funzioni durante l'importazione per evitare conflitti di nomi o per abbreviare nomi lunghi:

```python
import math as m
from datetime import datetime as dt

# Utilizzo dei moduli e delle funzioni con i nuovi nomi
print(m.sqrt(16))           # Output: 4.0
print(dt.now())             # Output: data e ora correnti
```

## Importazione Condizionale

A volte potresti voler importare un modulo solo se è disponibile, gestendo l'errore se non lo è:

```python
try:
    import numpy as np
    print("NumPy è disponibile!")
except ImportError:
    print("NumPy non è installato. Utilizzerò un'alternativa.")
    # Codice alternativo qui
```

## Ricaricamento dei Moduli

Python importa un modulo solo una volta per sessione. Se modifichi un modulo durante l'esecuzione del programma e vuoi ricaricare le modifiche, puoi utilizzare la funzione `reload` dal modulo `importlib`:

```python
import importlib
import mio_modulo

# Dopo aver modificato mio_modulo.py
importlib.reload(mio_modulo)
```

## Localizzazione dei Moduli

Quando importi un modulo, Python lo cerca in diverse posizioni, nell'ordine:

1. La directory corrente
2. Le directory elencate nella variabile d'ambiente PYTHONPATH
3. Le directory di installazione standard di Python

Puoi vedere l'elenco completo dei percorsi di ricerca nella variabile `sys.path`:

```python
import sys
print(sys.path)
```

## Conclusione

Importare moduli in Python è un'operazione fondamentale che permette di accedere a funzionalità aggiuntive e organizzare meglio il codice. Scegliere il metodo di importazione più appropriato dipende dalle esigenze specifiche del tuo progetto e dalle convenzioni di stile adottate.

---

[Indice degli Argomenti](../README.md) | [Precedente: Cosa sono i Moduli](./01_cosa_sono_moduli.md) | [Prossimo: Creare Moduli Personalizzati](./03_creare_moduli_personalizzati.md)