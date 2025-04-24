# Functools: Funzioni di Ordine Superiore

## Introduzione

Il modulo `functools` è una componente fondamentale della Libreria Standard di Python che fornisce funzioni di ordine superiore (higher-order functions). Le funzioni di ordine superiore sono funzioni che operano su altre funzioni o restituiscono funzioni come risultato.

Questo modulo è particolarmente utile per la programmazione funzionale in Python, offrendo strumenti per manipolare, trasformare e comporre funzioni in modi potenti ed espressivi. Attraverso `functools`, è possibile implementare pattern di programmazione funzionale come la memorizzazione dei risultati (memoization), la composizione di funzioni e la creazione di funzioni parziali.

In questa guida, esploreremo le principali funzioni offerte dal modulo `functools` e vedremo come utilizzarle per migliorare la leggibilità, l'efficienza e la manutenibilità del codice Python.

## Principali Funzioni in functools

### `functools.partial(func, *args, **keywords)`

Crea una nuova funzione che, quando chiamata, si comporta come `func` chiamata con gli argomenti posizionali `args` e gli argomenti keyword `keywords`.

```python
import functools

# Funzione di base
def potenza(base, esponente):
    return base ** esponente

# Creazione di funzioni parziali
quadrato = functools.partial(potenza, esponente=2)
cubo = functools.partial(potenza, esponente=3)
potenza_di_due = functools.partial(potenza, base=2)

# Utilizzo delle funzioni parziali
print(quadrato(5))        # 25 (5^2)
print(cubo(5))            # 125 (5^3)
print(potenza_di_due(8))  # 256 (2^8)

# Esempio con funzioni integrate
import operator

# Creazione di funzioni per operazioni specifiche
aggiungi_10 = functools.partial(operator.add, 10)
moltiplica_per_2 = functools.partial(operator.mul, 2)

print(aggiungi_10(5))       # 15 (10 + 5)
print(moltiplica_per_2(5))  # 10 (2 * 5)
```

`partial` è utile quando si vuole fissare alcuni argomenti di una funzione, creando una nuova funzione con meno parametri. Questo è particolarmente utile per:

- Creare funzioni specializzate da funzioni più generali
- Adattare funzioni per essere utilizzate in contesti che richiedono un numero specifico di argomenti
- Semplificare l'interfaccia di funzioni complesse

### `functools.reduce(function, iterable[, initializer])`

Applica una funzione di due argomenti cumulativamente agli elementi di un iterabile, da sinistra a destra, per ridurli a un singolo valore.

```python
import functools
import operator

# Calcolo della somma di una lista
numeri = [1, 2, 3, 4, 5]
somma = functools.reduce(operator.add, numeri)
print(f"Somma: {somma}")  # 15

# Calcolo del prodotto di una lista
prodotto = functools.reduce(operator.mul, numeri)
print(f"Prodotto: {prodotto}")  # 120

# Utilizzo di un valore iniziale
somma_con_iniziale = functools.reduce(operator.add, numeri, 10)
print(f"Somma con valore iniziale: {somma_con_iniziale}")  # 25 (10 + 1 + 2 + 3 + 4 + 5)

# Utilizzo di una funzione lambda
max_valore = functools.reduce(lambda x, y: x if x > y else y, numeri)
print(f"Valore massimo: {max_valore}")  # 5

# Implementazione di join con reduce
parole = ['Python', 'è', 'fantastico']
frase = functools.reduce(lambda x, y: f"{x} {y}", parole)
print(frase)  # "Python è fantastico"
```

`reduce` è una funzione fondamentale nella programmazione funzionale e può essere utilizzata per implementare molte operazioni comuni come somma, prodotto, massimo, minimo, concatenazione, ecc.

### `functools.lru_cache(maxsize=128, typed=False)`

Decoratore che memorizza i risultati di una funzione, evitando di ricalcolarli quando la funzione viene chiamata con gli stessi argomenti.

```python
import functools
import time

# Funzione di Fibonacci senza cache
def fibonacci_senza_cache(n):
    if n < 2:
        return n
    return fibonacci_senza_cache(n-1) + fibonacci_senza_cache(n-2)

# Funzione di Fibonacci con cache
@functools.lru_cache(maxsize=None)
def fibonacci_con_cache(n):
    if n < 2:
        return n
    return fibonacci_con_cache(n-1) + fibonacci_con_cache(n-2)

# Confronto delle prestazioni
def misura_tempo(func, *args):
    inizio = time.time()
    risultato = func(*args)
    fine = time.time()
    return risultato, fine - inizio

# Test con n=30
n = 30

# Senza cache (molto lento)
risultato_senza_cache, tempo_senza_cache = misura_tempo(fibonacci_senza_cache, n)
print(f"Fibonacci({n}) senza cache: {risultato_senza_cache}, Tempo: {tempo_senza_cache:.6f} secondi")

# Con cache (molto più veloce)
risultato_con_cache, tempo_con_cache = misura_tempo(fibonacci_con_cache, n)
print(f"Fibonacci({n}) con cache: {risultato_con_cache}, Tempo: {tempo_con_cache:.6f} secondi")

# Informazioni sulla cache
print(f"Info cache: {fibonacci_con_cache.cache_info()}")

# Pulizia della cache
fibonacci_con_cache.cache_clear()
print(f"Info cache dopo pulizia: {fibonacci_con_cache.cache_info()}")
```

`lru_cache` implementa una cache LRU (Least Recently Used) che memorizza fino a `maxsize` risultati più recenti. È particolarmente utile per:

- Funzioni ricorsive
- Funzioni costose in termini di calcolo
- Funzioni che vengono chiamate ripetutamente con gli stessi argomenti
- Funzioni pure (senza effetti collaterali)

### `functools.wraps(wrapped)`

Decoratore che applica l'aggiornamento di `__module__`, `__name__`, `__qualname__`, `__doc__` e `__annotations__` di una funzione wrapper alla funzione wrapped.

```python
import functools

# Decoratore senza wraps
def decoratore_semplice(func):
    def wrapper(*args, **kwargs):
        """Documentazione del wrapper"""
        print(f"Chiamata a {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

# Decoratore con wraps
def decoratore_con_wraps(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        """Documentazione del wrapper"""
        print(f"Chiamata a {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

# Funzione di esempio
@decoratore_semplice
def saluta_semplice(nome):
    """Saluta una persona per nome."""
    return f"Ciao, {nome}!"

@decoratore_con_wraps
def saluta_wraps(nome):
    """Saluta una persona per nome."""
    return f"Ciao, {nome}!"

# Confronto delle informazioni delle funzioni
print(f"Nome funzione semplice: {saluta_semplice.__name__}")  # wrapper
print(f"Documentazione funzione semplice: {saluta_semplice.__doc__}")  # Documentazione del wrapper

print(f"Nome funzione con wraps: {saluta_wraps.__name__}")  # saluta_wraps
print(f"Documentazione funzione con wraps: {saluta_wraps.__doc__}")  # Saluta una persona per nome.
```

`wraps` è essenziale quando si scrivono decoratori, poiché preserva i metadati della funzione originale, facilitando il debugging e mantenendo la documentazione corretta.

### `functools.total_ordering`

Decoratore di classe che genera automaticamente i metodi di confronto mancanti basandosi su quelli esistenti.

```python
import functools

@functools.total_ordering
class Persona:
    def __init__(self, nome, eta):
        self.nome = nome
        self.eta = eta
    
    def __eq__(self, other):
        if not isinstance(other, Persona):
            return NotImplemented
        return (self.eta, self.nome) == (other.eta, other.nome)
    
    def __lt__(self, other):
        if not isinstance(other, Persona):
            return NotImplemented
        return (self.eta, self.nome) < (other.eta, other.nome)

# Creazione di istanze
p1 = Persona("Alice", 30)
p2 = Persona("Bob", 25)
p3 = Persona("Charlie", 30)

# Confronti
print(f"{p1.nome} == {p2.nome}: {p1 == p2}")  # False
print(f"{p1.nome} != {p2.nome}: {p1 != p2}")  # True (generato automaticamente)
print(f"{p1.nome} < {p2.nome}: {p1 < p2}")   # False
print(f"{p1.nome} > {p2.nome}: {p1 > p2}")   # True (generato automaticamente)
print(f"{p1.nome} <= {p3.nome}: {p1 <= p3}")  # True (generato automaticamente)
print(f"{p1.nome} >= {p3.nome}: {p1 >= p3}")  # False (generato automaticamente)
```

`total_ordering` è utile quando si definiscono classi che devono supportare operazioni di confronto. Implementando solo `__eq__` e uno tra `__lt__`, `__le__`, `__gt__` o `__ge__`, il decoratore genera automaticamente i metodi rimanenti.

### `functools.singledispatch`

Decoratore che trasforma una funzione in una singola funzione generica che può avere implementazioni diverse a seconda del tipo del primo argomento.

```python
import functools

@functools.singledispatch
def formatta(arg):
    """Formatta un valore in una stringa."""
    return f"Valore generico: {arg}"

@formatta.register
def _(arg: int):
    return f"Intero: {arg:d}"

@formatta.register
def _(arg: float):
    return f"Numero decimale: {arg:.2f}"

@formatta.register
def _(arg: list):
    return f"Lista con {len(arg)} elementi: {', '.join(map(str, arg))}"

@formatta.register
def _(arg: dict):
    return f"Dizionario con {len(arg)} coppie: {arg}"

# Utilizzo della funzione generica
print(formatta(10))           # Intero: 10
print(formatta(3.14159))      # Numero decimale: 3.14
print(formatta([1, 2, 3]))    # Lista con 3 elementi: 1, 2, 3
print(formatta({"a": 1, "b": 2}))  # Dizionario con 2 coppie: {'a': 1, 'b': 2}
print(formatta("Hello"))      # Valore generico: Hello

# Registrazione di un tipo personalizzato
class Persona:
    def __init__(self, nome, eta):
        self.nome = nome
        self.eta = eta

@formatta.register
def _(arg: Persona):
    return f"Persona: {arg.nome}, {arg.eta} anni"

p = Persona("Alice", 30)
print(formatta(p))  # Persona: Alice, 30 anni
```

`singledispatch` implementa il dispatch multiplo basato sul tipo del primo argomento, permettendo di creare funzioni generiche che si comportano diversamente a seconda del tipo di input. È una forma di polimorfismo che mantiene il codice organizzato e modulare.

### `functools.cached_property`

Decoratore che trasforma un metodo di una classe in una proprietà il cui valore viene calcolato una sola volta e poi memorizzato come un attributo normale.

```python
import functools
import time

class DataProcessor:
    def __init__(self, data):
        self.data = data
    
    @functools.cached_property
    def processed_data(self):
        print("Elaborazione dei dati in corso...")
        time.sleep(1)  # Simulazione di un'operazione costosa
        return [x * 2 for x in self.data]
    
    def process_without_cache(self):
        print("Elaborazione dei dati in corso (senza cache)...")
        time.sleep(1)  # Simulazione di un'operazione costosa
        return [x * 2 for x in self.data]

# Creazione di un'istanza
processor = DataProcessor([1, 2, 3, 4, 5])

# Prima chiamata (calcola e memorizza)
print("Prima chiamata a processed_data:")
print(processor.processed_data)

# Seconda chiamata (usa il valore memorizzato)
print("\nSeconda chiamata a processed_data:")
print(processor.processed_data)

# Chiamate al metodo senza cache
print("\nPrima chiamata a process_without_cache:")
print(processor.process_without_cache())

print("\nSeconda chiamata a process_without_cache:")
print(processor.process_without_cache())
```

`cached_property` è utile per proprietà che sono costose da calcolare e che non cambiano durante la vita dell'oggetto. A differenza di `property`, il valore viene calcolato solo una volta e poi memorizzato.

## Altre Funzioni Utili

### `functools.cmp_to_key(func)`

Converte una funzione di confronto vecchio stile in una funzione chiave per le funzioni di ordinamento.

```python
import functools

# Funzione di confronto vecchio stile
def compare_lunghezza(a, b):
    return len(a) - len(b)

# Conversione in una funzione chiave
key_func = functools.cmp_to_key(compare_lunghezza)

# Ordinamento di una lista di stringhe per lunghezza
parole = ["python", "è", "un", "linguaggio", "fantastico"]
parole_ordinate = sorted(parole, key=key_func)
print(parole_ordinate)  # ['è', 'un', 'python', 'fantastico', 'linguaggio']

# Esempio più complesso: ordinamento personalizzato di carte da gioco
class Carta:
    def __init__(self, valore, seme):
        self.valore = valore
        self.seme = seme
    
    def __repr__(self):
        return f"{self.valore} di {self.seme}"

def confronta_carte(a, b):
    # Ordine dei semi: Cuori, Quadri, Fiori, Picche
    semi = {"Cuori": 0, "Quadri": 1, "Fiori": 2, "Picche": 3}
    # Ordine dei valori: 2-10, J, Q, K, A
    valori = {str(i): i-2 for i in range(2, 11)}
    valori.update({"J": 9, "Q": 10, "K": 11, "A": 12})
    
    # Confronto prima per seme, poi per valore
    if semi[a.seme] != semi[b.seme]:
        return semi[a.seme] - semi[b.seme]
    return valori[a.valore] - valori[b.valore]

# Creazione di alcune carte
carte = [
    Carta("A", "Picche"),
    Carta("K", "Cuori"),
    Carta("10", "Quadri"),
    Carta("2", "Fiori"),
    Carta("J", "Cuori")
]

# Ordinamento delle carte
carte_ordinate = sorted(carte, key=functools.cmp_to_key(confronta_carte))
for carta in carte_ordinate:
    print(carta)
```

`cmp_to_key` è utile per convertire funzioni di confronto vecchio stile (che restituiscono -1, 0 o 1) in funzioni chiave compatibili con le funzioni di ordinamento moderne di Python.

### `functools.partialmethod`

Simile a `partial`, ma progettato per essere utilizzato come metodo di una classe.

```python
import functools

class Calcolatrice:
    def __init__(self):
        self.valore = 0
    
    def operazione(self, operatore, x):
        self.valore = operatore(self.valore, x)
        return self.valore
    
    # Metodi parziali per operazioni specifiche
    somma = functools.partialmethod(operazione, lambda a, b: a + b)
    sottrazione = functools.partialmethod(operazione, lambda a, b: a - b)
    moltiplicazione = functools.partialmethod(operazione, lambda a, b: a * b)
    divisione = functools.partialmethod(operazione, lambda a, b: a / b if b != 0 else float('inf'))

# Utilizzo della calcolatrice
calc = Calcolatrice()
print(calc.somma(5))           # 5 (0 + 5)
print(calc.moltiplicazione(3))  # 15 (5 * 3)
print(calc.sottrazione(7))      # 8 (15 - 7)
print(calc.divisione(2))        # 4.0 (8 / 2)
```

`partialmethod` è utile per creare metodi specializzati all'interno di una classe, riducendo la duplicazione del codice e migliorando la leggibilità.

## Casi d'Uso Comuni

### Memoizzazione di Funzioni Ricorsive

```python
import functools

# Calcolo del fattoriale con memoizzazione
@functools.lru_cache(maxsize=None)
def fattoriale(n):
    if n <= 1:
        return 1
    return n * fattoriale(n-1)

# Calcolo dei numeri di Fibonacci con memoizzazione
@functools.lru_cache(maxsize=None)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test delle funzioni
print(f"Fattoriale di 10: {fattoriale(10)}")  # 3628800
print(f"Fibonacci di 30: {fibonacci(30)}")    # 832040

# Informazioni sulla cache
print(f"Info cache fattoriale: {fattoriale.cache_info()}")
print(f"Info cache fibonacci: {fibonacci.cache_info()}")
```

### Composizione di Funzioni

```python
import functools

# Funzioni di base
def doppio(x):
    return x * 2

def incrementa(x):
    return x + 1

def quadrato(x):
    return x ** 2

# Funzione di composizione
def compose(*funcs):
    def compose_two(f, g):
        return lambda x: f(g(x))
    return functools.reduce(compose_two, funcs, lambda x: x)

# Creazione di funzioni composte
doppio_incrementa = compose(doppio, incrementa)  # doppio(incrementa(x))
quadrato_doppio = compose(quadrato, doppio)      # quadrato(doppio(x))
tutte = compose(quadrato, incrementa, doppio)    # quadrato(incrementa(doppio(x)))

# Test delle funzioni composte
x = 5
print(f"doppio_incrementa({x}) = {doppio_incrementa(x)}")  # 12 (2 * (5 + 1))
print(f"quadrato_doppio({x}) = {quadrato_doppio(x)}")      # 100 ((5 * 2)^2)
print(f"tutte({x}) = {tutte(x)}")                          # 121 ((5 * 2 + 1)^2)
```

### Implementazione di un Decoratore con Parametri

```python
import functools
import time

def timer(log_name=None):
    """Decoratore che misura il tempo di esecuzione di una funzione."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            end_time = time.time()
            name = log_name or func.__name__
            print(f"{name} ha impiegato {end_time - start_time:.6f} secondi")
            return result
        return wrapper
    return decorator

# Utilizzo del decoratore con parametri
@timer(log_name="Calcolo Fibonacci")
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

@timer()
def calcola_somma(n):
    return sum(range(n))

# Test delle funzioni decorate
fibonacci(20)
calcola_somma(1000000)
```

### Creazione di un Registro di Funzioni

```python
import functools

# Creazione di un registro di funzioni
registry = {}

def register(func=None, *, name=None):
    """Registra una funzione nel registro globale."""
    def decorator(func):
        key = name or func.__name__
        registry[key] = func
        return func
    
    # Gestione della chiamata con o senza parametri
    if func is None:
        return decorator
    return decorator(func)

# Registrazione di funzioni
@register
def saluta(nome):
    return f"Ciao, {nome}!"

@register(name="addizione")
def somma(a, b):
    return a + b

@register(name="moltiplicazione")
def moltiplica(a, b):
    return a * b

# Utilizzo del registro
print(f"Funzioni registrate: {list(registry.keys())}")

# Chiamata di funzioni dal registro
print(registry["saluta"]("Alice"))       # Ciao, Alice!
print(registry["addizione"](5, 3))      # 8
print(registry["moltiplicazione"](5, 3)) # 15
```

## Conclusione

Il modulo `functools` offre strumenti potenti per la programmazione funzionale in Python, permettendo di manipolare, trasformare e comporre funzioni in modi espressivi ed efficienti.

Le funzioni di ordine superiore come `partial`, `reduce` e i decoratori come `lru_cache` e `wraps` sono strumenti preziosi che possono migliorare significativamente la qualità del codice, rendendolo più leggibile, più efficiente e più manutenibile.

La programmazione funzionale, facilitata da `functools`, incoraggia uno stile di programmazione più dichiarativo e componibile, che può portare a codice più robusto e meno soggetto a errori.

Per approfondire, consulta la [documentazione ufficiale di functools](https://docs.python.org/3/library/functools.html).

## Esercizi

1. Implementa una funzione `memoize` che accetta una funzione come argomento e restituisce una versione memoizzata della funzione, utilizzando un dizionario come cache.

2. Crea una funzione `compose` che accetta un numero variabile di funzioni e restituisce una nuova funzione che è la composizione delle funzioni date, utilizzando `functools.reduce`.

3. Implementa un decoratore `retry` che riprova a eseguire una funzione un certo numero di volte in caso di eccezione, con un ritardo crescente tra i tentativi.

4. Utilizza `functools.singledispatch` per creare una funzione `serialize` che converte diversi tipi di dati (int, float, list, dict, ecc.) in una rappresentazione JSON.

5. Crea una classe `Counter` con un metodo `increment` e utilizza `functools.partialmethod` per creare metodi specializzati come `increment_by_one`, `increment_by_two`, ecc.