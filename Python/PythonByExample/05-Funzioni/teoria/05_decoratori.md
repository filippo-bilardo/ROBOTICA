# Decoratori

I decoratori sono un potente strumento in Python che permette di modificare il comportamento di funzioni e classi. Essenzialmente, un decoratore è una funzione che prende un'altra funzione come input e restituisce una nuova funzione con funzionalità aggiuntive.

## Concetto di base

Un decoratore è una funzione che "avvolge" un'altra funzione, aggiungendo funzionalità senza modificare il codice originale.

```python
def decoratore(funzione_originale):
    def funzione_wrapper(*args, **kwargs):
        # Codice eseguito prima della funzione originale
        print("Prima dell'esecuzione della funzione")
        
        # Chiamata alla funzione originale
        risultato = funzione_originale(*args, **kwargs)
        
        # Codice eseguito dopo la funzione originale
        print("Dopo l'esecuzione della funzione")
        
        return risultato
    return funzione_wrapper
```

## Sintassi dei decoratori

In Python, i decoratori vengono applicati utilizzando il simbolo `@` seguito dal nome del decoratore sopra la definizione della funzione.

```python
@decoratore
def saluta(nome):
    print(f"Ciao, {nome}!")

# Equivalente a:
# saluta = decoratore(saluta)
```

## Esempio semplice

Ecco un esempio di un decoratore che misura il tempo di esecuzione di una funzione:

```python
import time

def misura_tempo(funzione):
    def wrapper(*args, **kwargs):
        inizio = time.time()
        risultato = funzione(*args, **kwargs)
        fine = time.time()
        print(f"La funzione {funzione.__name__} ha impiegato {fine - inizio:.6f} secondi")
        return risultato
    return wrapper

@misura_tempo
def operazione_lenta():
    time.sleep(1)  # Simula un'operazione che richiede tempo
    print("Operazione completata")

operazione_lenta()
# Output:
# Operazione completata
# La funzione operazione_lenta ha impiegato 1.001234 secondi
```

## Decoratori con argomenti

È possibile creare decoratori che accettano argomenti, utilizzando un livello aggiuntivo di nesting:

```python
def ripeti(numero_volte):
    def decoratore(funzione):
        def wrapper(*args, **kwargs):
            for _ in range(numero_volte):
                risultato = funzione(*args, **kwargs)
            return risultato
        return wrapper
    return decoratore

@ripeti(3)
def saluta(nome):
    print(f"Ciao, {nome}!")

saluta("Mario")
# Output:
# Ciao, Mario!
# Ciao, Mario!
# Ciao, Mario!
```

## Mantenere l'identità della funzione

Un problema comune con i decoratori è che possono mascherare l'identità della funzione originale. Il modulo `functools` fornisce la funzione `wraps` per preservare i metadati della funzione originale:

```python
from functools import wraps

def mio_decoratore(funzione):
    @wraps(funzione)  # Preserva i metadati della funzione originale
    def wrapper(*args, **kwargs):
        print("Prima della funzione")
        risultato = funzione(*args, **kwargs)
        print("Dopo la funzione")
        return risultato
    return wrapper

@mio_decoratore
def esempio():
    """Questa è la docstring della funzione esempio."""
    print("Funzione esempio eseguita")

# Senza @wraps, queste informazioni sarebbero perse
print(esempio.__name__)  # Output: esempio (invece di wrapper)
print(esempio.__doc__)   # Output: Questa è la docstring della funzione esempio.
```

## Decoratori di classe

I decoratori possono essere applicati anche alle classi:

```python
def aggiungi_metodo(classe):
    def nuovo_metodo(self):
        return "Questo è un nuovo metodo"
    
    classe.nuovo_metodo = nuovo_metodo
    return classe

@aggiungi_metodo
class MiaClasse:
    def __init__(self, valore):
        self.valore = valore

# Test della classe decorata
oggetto = MiaClasse(42)
print(oggetto.nuovo_metodo())  # Output: Questo è un nuovo metodo
```

## Classi come decoratori

Anche le classi possono essere utilizzate come decoratori, implementando il metodo `__call__`:

```python
class ContaChiamate:
    def __init__(self, funzione):
        self.funzione = funzione
        self.contatore = 0
    
    def __call__(self, *args, **kwargs):
        self.contatore += 1
        print(f"La funzione {self.funzione.__name__} è stata chiamata {self.contatore} volte")
        return self.funzione(*args, **kwargs)

@ContaChiamate
def saluta(nome):
    return f"Ciao, {nome}!"

print(saluta("Alice"))
print(saluta("Bob"))
# Output:
# La funzione saluta è stata chiamata 1 volte
# Ciao, Alice!
# La funzione saluta è stata chiamata 2 volte
# Ciao, Bob!
```

## Decoratori multipli

È possibile applicare più decoratori a una singola funzione. I decoratori vengono applicati dal basso verso l'alto:

```python
def decoratore1(funzione):
    def wrapper(*args, **kwargs):
        print("Decoratore 1 - Inizio")
        risultato = funzione(*args, **kwargs)
        print("Decoratore 1 - Fine")
        return risultato
    return wrapper

def decoratore2(funzione):
    def wrapper(*args, **kwargs):
        print("Decoratore 2 - Inizio")
        risultato = funzione(*args, **kwargs)
        print("Decoratore 2 - Fine")
        return risultato
    return wrapper

@decoratore1
@decoratore2
def saluta(nome):
    print(f"Ciao, {nome}!")

saluta("Carlo")
# Output:
# Decoratore 1 - Inizio
# Decoratore 2 - Inizio
# Ciao, Carlo!
# Decoratore 2 - Fine
# Decoratore 1 - Fine
```

## Casi d'uso comuni

I decoratori sono ampiamente utilizzati in Python per vari scopi:

### Logging

```python
def log(funzione):
    def wrapper(*args, **kwargs):
        print(f"Chiamata a {funzione.__name__} con args: {args}, kwargs: {kwargs}")
        risultato = funzione(*args, **kwargs)
        print(f"{funzione.__name__} ha restituito: {risultato}")
        return risultato
    return wrapper

@log
def somma(a, b):
    return a + b

somma(3, 5)
# Output:
# Chiamata a somma con args: (3, 5), kwargs: {}
# somma ha restituito: 8
```

### Caching (memoization)

```python
def memoize(funzione):
    cache = {}
    def wrapper(*args):
        if args in cache:
            print(f"Risultato recuperato dalla cache per {args}")
            return cache[args]
        risultato = funzione(*args)
        cache[args] = risultato
        return risultato
    return wrapper

@memoize
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))  # Calcola tutti i valori
print(fibonacci(10))  # Recupera il risultato dalla cache
```

### Controllo degli accessi

```python
def richiedi_autenticazione(funzione):
    def wrapper(utente, *args, **kwargs):
        if utente.is_autenticato:
            return funzione(utente, *args, **kwargs)
        else:
            return "Accesso negato"
    return wrapper

class Utente:
    def __init__(self, nome, is_autenticato=False):
        self.nome = nome
        self.is_autenticato = is_autenticato

@richiedi_autenticazione
def visualizza_dati_sensibili(utente):
    return f"Dati sensibili per {utente.nome}"

utente1 = Utente("Alice", True)
utente2 = Utente("Bob", False)

print(visualizza_dati_sensibili(utente1))  # Output: Dati sensibili per Alice
print(visualizza_dati_sensibili(utente2))  # Output: Accesso negato
```

## Conclusione

I decoratori sono uno strumento potente in Python che permette di aggiungere funzionalità a funzioni e classi esistenti in modo pulito e riutilizzabile. Sono ampiamente utilizzati in framework e librerie Python per implementare funzionalità come logging, caching, controllo degli accessi e molto altro. Comprendere come funzionano i decoratori e come crearli è una competenza importante per scrivere codice Python avanzato ed elegante.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Funzioni Lambda](./04_lambda_funzioni.md)