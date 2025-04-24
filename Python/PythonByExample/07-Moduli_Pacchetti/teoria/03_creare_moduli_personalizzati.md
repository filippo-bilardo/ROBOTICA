# Creare Moduli Personalizzati in Python

Oltre a utilizzare moduli esistenti, Python permette di creare facilmente moduli personalizzati. Questo è utile per organizzare il codice in file separati e riutilizzabili.

## Creazione di un Modulo Base

Creare un modulo in Python è semplice: basta salvare il codice in un file con estensione `.py`. Ad esempio, creiamo un modulo chiamato `matematica.py` con alcune funzioni matematiche:

```python
# File: matematica.py

# Definizione di costanti
PI = 3.14159

# Definizione di funzioni
def area_cerchio(raggio):
    """Calcola l'area di un cerchio dato il raggio"""
    return PI * raggio ** 2

def area_rettangolo(base, altezza):
    """Calcola l'area di un rettangolo date base e altezza"""
    return base * altezza

def somma_quadrati(a, b):
    """Calcola la somma dei quadrati di due numeri"""
    return a**2 + b**2
```

## Utilizzo del Modulo Personalizzato

Una volta creato il modulo, puoi importarlo e utilizzarlo come qualsiasi altro modulo:

```python
# File: main.py
import matematica

# Utilizzo delle funzioni del modulo
raggio = 5
print(f"L'area del cerchio con raggio {raggio} è {matematica.area_cerchio(raggio):.2f}")

base = 4
altezza = 6
print(f"L'area del rettangolo {base}x{altezza} è {matematica.area_rettangolo(base, altezza)}")

# Utilizzo delle costanti del modulo
print(f"Il valore di PI nel modulo è {matematica.PI}")
```

## La Variabile `__name__`

Ogni modulo in Python ha una variabile speciale chiamata `__name__`. Quando un modulo viene eseguito direttamente, `__name__` assume il valore `"__main__"`. Quando un modulo viene importato, `__name__` assume il nome del modulo.

Questo permette di scrivere codice che viene eseguito solo quando il modulo è eseguito direttamente, ma non quando è importato:

```python
# File: matematica.py

# ... (codice precedente) ...

# Codice di test che viene eseguito solo se il modulo è eseguito direttamente
if __name__ == "__main__":
    print("Test del modulo matematica")
    print(f"Area del cerchio con raggio 3: {area_cerchio(3):.2f}")
    print(f"Area del rettangolo 2x5: {area_rettangolo(2, 5)}")
    print(f"Somma dei quadrati di 3 e 4: {somma_quadrati(3, 4)}")
```

Questo pattern è molto utile per includere test o esempi di utilizzo direttamente nel modulo.

## Documentazione dei Moduli

È buona pratica documentare i moduli e le funzioni utilizzando docstring (stringhe di documentazione):

```python
# File: matematica.py

"""Modulo per calcoli matematici di base.

Questo modulo fornisce funzioni per calcolare aree di figure geometriche
e altre operazioni matematiche semplici.
"""

# ... (resto del codice) ...
```

Le docstring possono essere visualizzate utilizzando la funzione `help()`:

```python
import matematica
help(matematica)  # Mostra la documentazione del modulo
help(matematica.area_cerchio)  # Mostra la documentazione della funzione
```

## Organizzazione del Codice in Più Moduli

Per progetti più grandi, è comune organizzare il codice in più moduli correlati. Ad esempio:

```
progetto/
├── main.py
├── geometria.py  # Funzioni per calcoli geometrici
├── statistica.py  # Funzioni per calcoli statistici
└── utilita.py  # Funzioni di utilità generale
```

Ogni modulo dovrebbe avere una responsabilità specifica e ben definita.

## Conclusione

Creare moduli personalizzati è un modo efficace per organizzare il codice Python in componenti riutilizzabili. Seguendo alcune semplici convenzioni, puoi creare moduli ben documentati e facili da utilizzare.

Nella prossima sezione, esploreremo i concetti di namespace e scope, che sono strettamente legati all'utilizzo dei moduli.

---

[Indice degli Argomenti](../README.md) | [Precedente: Importare Moduli](./02_importare_moduli.md) | [Prossimo: Namespace e Scope](./04_namespace_scope.md)