# Namespace e Scope in Python

Quando si lavora con moduli e pacchetti in Python, è fondamentale comprendere i concetti di namespace e scope. Questi concetti aiutano a gestire i nomi delle variabili, funzioni e classi, evitando conflitti e rendendo il codice più organizzato.

## Cosa sono i Namespace

Un namespace in Python è un contenitore che memorizza nomi di variabili, funzioni e classi. Ogni namespace mappa nomi a oggetti, permettendo di utilizzare lo stesso nome in namespace diversi senza conflitti.

Python utilizza diversi tipi di namespace:

1. **Namespace built-in**: Contiene tutti i nomi integrati di Python (come `print`, `len`, `str`, ecc.)
2. **Namespace globale**: Specifico di ogni modulo, contiene i nomi definiti a livello di modulo
3. **Namespace locale**: Creato all'interno di funzioni e metodi, contiene i nomi locali

## Esempio di Namespace

Ecco un esempio che illustra come i namespace separano i nomi:

```python
# Namespace del modulo math
import math
print(math.pi)  # Accesso a pi nel namespace di math

# Definizione di pi nel namespace globale del modulo corrente
pi = 3.14
print(pi)  # Accesso a pi nel namespace globale

# I due pi sono oggetti diversi in namespace diversi
print(math.pi == pi)  # False (3.141592653589793 != 3.14)
```

## Scope (Ambito) delle Variabili

Lo scope determina dove un nome è visibile all'interno del codice. Python segue la regola LEGB per la risoluzione dei nomi:

1. **Local (L)**: Nomi definiti all'interno della funzione corrente
2. **Enclosing (E)**: Nomi definiti nelle funzioni che contengono la funzione corrente (closure)
3. **Global (G)**: Nomi definiti a livello di modulo
4. **Built-in (B)**: Nomi predefiniti di Python

## Esempio di Scope

```python
x = 10  # Variabile globale

def funzione_esterna():
    y = 20  # Variabile nell'ambito della funzione_esterna (enclosing)
    
    def funzione_interna():
        z = 30  # Variabile locale alla funzione_interna
        print(x)  # Accesso a variabile globale
        print(y)  # Accesso a variabile nell'ambito enclosing
        print(z)  # Accesso a variabile locale
    
    funzione_interna()
    # print(z)  # Errore: z non è definita in questo scope

funzione_esterna()
```

## Modificare Variabili Globali

Per modificare una variabile globale all'interno di una funzione, è necessario utilizzare la parola chiave `global`:

```python
contatore = 0  # Variabile globale

def incrementa():
    global contatore  # Dichiara che si vuole utilizzare la variabile globale
    contatore += 1
    return contatore

print(incrementa())  # Output: 1
print(incrementa())  # Output: 2
print(contatore)     # Output: 2
```

## Modificare Variabili nell'Ambito Enclosing

Per modificare una variabile nell'ambito enclosing, si utilizza la parola chiave `nonlocal`:

```python
def contatore_funzione():
    count = 0  # Variabile nell'ambito della funzione esterna
    
    def incrementa():
        nonlocal count  # Dichiara che si vuole utilizzare la variabile dell'ambito enclosing
        count += 1
        return count
    
    return incrementa

conta = contatore_funzione()
print(conta())  # Output: 1
print(conta())  # Output: 2
```

## Namespace e Moduli

Ogni modulo in Python ha il proprio namespace globale. Quando importi un modulo, stai essenzialmente accedendo al suo namespace:

```python
# modulo_a.py
x = 10

def funzione():
    return x * 2
```

```python
# main.py
import modulo_a

x = 5  # Questa x è nel namespace globale di main.py
print(x)  # Output: 5
print(modulo_a.x)  # Output: 10
print(modulo_a.funzione())  # Output: 20 (usa la x del namespace di modulo_a)
```

## Conclusione

Comprendere namespace e scope è essenziale quando si lavora con moduli e pacchetti in Python. Questi concetti permettono di organizzare il codice in modo efficiente, evitando conflitti di nomi e rendendo il codice più manutenibile.

Nella prossima sezione, esploreremo cosa sono i pacchetti e come utilizzarli per organizzare i moduli in strutture più complesse.

---

[Indice degli Argomenti](../README.md) | [Precedente: Creare Moduli Personalizzati](./03_creare_moduli_personalizzati.md) | [Prossimo: Cosa sono i Pacchetti](./05_cosa_sono_pacchetti.md)