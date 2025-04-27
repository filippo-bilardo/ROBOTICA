# Ottimizzazione delle Prestazioni in Python

In questa guida esploreremo le tecniche e le strategie per ottimizzare le prestazioni del codice Python, un aspetto cruciale per applicazioni efficienti e scalabili.

## Importanza dell'ottimizzazione

L'ottimizzazione delle prestazioni è fondamentale per diversi motivi:

- Migliora l'esperienza utente riducendo i tempi di risposta
- Riduce i costi di infrastruttura e hosting
- Permette di gestire carichi di lavoro maggiori con le stesse risorse
- Aumenta la scalabilità delle applicazioni
- Riduce il consumo energetico (aspetto sempre più importante)

Tuttavia, è importante ricordare il famoso detto di Donald Knuth: "La prematura ottimizzazione è la radice di tutti i mali". Prima di ottimizzare, assicurati che:

1. Il codice funzioni correttamente
2. Ci sia un reale problema di prestazioni
3. Hai identificato i colli di bottiglia effettivi

## Identificazione dei colli di bottiglia

### Profiling del codice

Il profiling è il processo di analisi del codice per identificare quali parti consumano più risorse.

#### cProfile e pstats

```python
import cProfile
import pstats
from pstats import SortKey

# Funzione da profilare
def funzione_da_analizzare():
    risultato = 0
    for i in range(1000000):
        risultato += i
    return risultato

# Profiling con cProfile
cProfile.run('funzione_da_analizzare()', 'stats.prof')

# Analisi dei risultati
p = pstats.Stats('stats.prof')
p.strip_dirs().sort_stats(SortKey.CUMULATIVE).print_stats(10)
```

Output di esempio:

```
         4 function calls in 0.083 seconds

   Ordered by: cumulative time

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    0.083    0.083    0.083    0.083 <string>:1(<module>)
        1    0.083    0.083    0.083    0.083 example.py:4(funzione_da_analizzare)
        1    0.000    0.000    0.083    0.083 {built-in method builtins.exec}
        1    0.000    0.000    0.000    0.000 {method 'disable' of '_lsprof.Profiler' objects}
```

#### line_profiler

`line_profiler` fornisce un'analisi riga per riga del tempo di esecuzione.

```bash
pip install line_profiler
```

```python
# Decora la funzione da profilare con @profile
@profile
def funzione_da_analizzare():
    risultato = 0
    for i in range(1000000):
        risultato += i
    return risultato

funzione_da_analizzare()
```

Esecuzione:

```bash
kernprof -l -v script.py
```

#### memory_profiler

`memory_profiler` analizza l'utilizzo della memoria.

```bash
pip install memory_profiler
```

```python
from memory_profiler import profile

@profile
def funzione_memoria_intensiva():
    lista = [i for i in range(10000000)]
    return sum(lista)

funzione_memoria_intensiva()
```

Esecuzione:

```bash
python -m memory_profiler script.py
```

## Ottimizzazione del codice Python

### 1. Strutture dati appropriate

La scelta delle strutture dati corrette può avere un impatto significativo sulle prestazioni.

```python
# Inefficiente per ricerche frequenti
lista = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
5 in lista  # O(n) - ricerca lineare

# Efficiente per ricerche frequenti
insieme = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
5 in insieme  # O(1) - ricerca costante

# Inefficiente per accessi frequenti per chiave
lista_tuple = [("a", 1), ("b", 2), ("c", 3)]
def trova_valore(chiave):
    for k, v in lista_tuple:
        if k == chiave:
            return v
    return None

# Efficiente per accessi frequenti per chiave
dizionario = {"a": 1, "b": 2, "c": 3}
valore = dizionario.get("a")  # O(1) - accesso costante
```

#### Confronto delle complessità temporali

| Operazione | Lista | Dizionario | Set |
|------------|-------|------------|-----|
| Accesso    | O(1)  | O(1)       | N/A |
| Ricerca    | O(n)  | O(1)       | O(1)|
| Inserimento| O(1)* | O(1)       | O(1)|
| Eliminazione| O(n) | O(1)       | O(1)|

*O(1) ammortizzato, può richiedere O(n) se è necessario ridimensionare la lista

### 2. Comprensioni e generatori

Le comprensioni di lista, dizionario e set sono spesso più efficienti dei cicli espliciti.

```python
# Meno efficiente
numeri_quadrati = []
for i in range(1000):
    numeri_quadrati.append(i ** 2)

# Più efficiente
numeri_quadrati = [i ** 2 for i in range(1000)]

# Ancora più efficiente per grandi dataset (uso della memoria)
numeri_quadrati_gen = (i ** 2 for i in range(1000000))
```

### 3. Funzioni built-in e moduli standard

Le funzioni built-in e i moduli della libreria standard sono spesso ottimizzati e più veloci delle implementazioni personalizzate.

```python
# Meno efficiente
def somma_manuale(lista):
    totale = 0
    for numero in lista:
        totale += numero
    return totale

# Più efficiente
totale = sum(lista)

# Meno efficiente
def trova_massimo(lista):
    massimo = lista[0]
    for numero in lista[1:]:
        if numero > massimo:
            massimo = numero
    return massimo

# Più efficiente
massimo = max(lista)
```

### 4. Evitare operazioni costose nei cicli

```python
# Inefficiente - calcolo ripetuto in ogni iterazione
for i in range(1000):
    risultato = qualcosa(i) * len(lista_grande)

# Efficiente - calcolo eseguito una sola volta
lunghezza = len(lista_grande)
for i in range(1000):
    risultato = qualcosa(i) * lunghezza
```

### 5. String concatenation

```python
# Inefficiente per molte concatenazioni
stringa = ""
for i in range(10000):
    stringa += str(i)

# Più efficiente
parti = [str(i) for i in range(10000)]
stringa = "".join(parti)
```

### 6. Uso di funzioni locali

```python
# Meno efficiente - ricerca globale in ogni iterazione
import math
def calcola_distanze(punti):
    distanze = []
    for x, y in punti:
        distanze.append(math.sqrt(x**2 + y**2))
    return distanze

# Più efficiente - riferimento locale
import math
def calcola_distanze(punti):
    sqrt = math.sqrt  # Riferimento locale
    distanze = []
    for x, y in punti:
        distanze.append(sqrt(x**2 + y**2))
    return distanze
```

## Ottimizzazione con librerie specializzate

### NumPy per calcoli numerici

NumPy è molto più veloce di Python puro per operazioni su array numerici.

```python
import numpy as np
import time

# Python puro
def somma_quadrati_python(n):
    return sum(i**2 for i in range(n))

# NumPy
def somma_quadrati_numpy(n):
    return np.sum(np.arange(n)**2)

n = 10000000

# Misura tempo Python puro
inizio = time.time()
somma_quadrati_python(n)
fine = time.time()
print(f"Python puro: {fine - inizio:.4f} secondi")

# Misura tempo NumPy
inizio = time.time()
somma_quadrati_numpy(n)
fine = time.time()
print(f"NumPy: {fine - inizio:.4f} secondi")
```

### Pandas per manipolazione dati

Pandas è ottimizzato per operazioni su dataset strutturati.

```python
import pandas as pd
import time

# Crea un dataset di esempio
data = {'A': range(1000000), 'B': range(1000000)}
df = pd.DataFrame(data)

# Python puro
def somma_colonne_python(data):
    risultato = []
    for a, b in zip(data['A'], data['B']):
        risultato.append(a + b)
    return risultato

# Pandas
def somma_colonne_pandas(df):
    return df['A'] + df['B']

# Misura tempo Python puro
inizio = time.time()
somma_colonne_python(data)
fine = time.time()
print(f"Python puro: {fine - inizio:.4f} secondi")

# Misura tempo Pandas
inizio = time.time()
somma_colonne_pandas(df)
fine = time.time()
print(f"Pandas: {fine - inizio:.4f} secondi")
```

## Parallelizzazione e concorrenza

### Multithreading con threading

Il multithreading è utile per operazioni I/O-bound (come richieste di rete o operazioni su file).

```python
import threading
import requests
import time

urls = ["https://www.example.com"] * 10

# Sequenziale
def scarica_sequenziale(urls):
    for url in urls:
        requests.get(url)

# Parallelo con threading
def scarica_url(url):
    requests.get(url)

def scarica_parallelo(urls):
    threads = []
    for url in urls:
        thread = threading.Thread(target=scarica_url, args=(url,))
        threads.append(thread)
        thread.start()
    
    for thread in threads:
        thread.join()

# Misura tempo sequenziale
inizio = time.time()
scarica_sequenziale(urls)
fine = time.time()
print(f"Sequenziale: {fine - inizio:.4f} secondi")

# Misura tempo parallelo
inizio = time.time()
scarica_parallelo(urls)
fine = time.time()
print(f"Parallelo: {fine - inizio:.4f} secondi")
```

### Multiprocessing per operazioni CPU-bound

Il multiprocessing è utile per operazioni CPU-bound (come calcoli intensivi).

```python
import multiprocessing
import time

def calcolo_intensivo(n):
    return sum(i**2 for i in range(n))

def esegui_sequenziale(numeri):
    return [calcolo_intensivo(n) for n in numeri]

def esegui_parallelo(numeri):
    with multiprocessing.Pool() as pool:
        return pool.map(calcolo_intensivo, numeri)

numeri = [10000000, 20000000, 30000000, 40000000]

# Misura tempo sequenziale
inizio = time.time()
esegui_sequenziale(numeri)
fine = time.time()
print(f"Sequenziale: {fine - inizio:.4f} secondi")

# Misura tempo parallelo
inizio = time.time()
esegui_parallelo(numeri)
fine = time.time()
print(f"Parallelo: {fine - inizio:.4f} secondi")
```

### Asyncio per concorrenza

Asyncio è utile per operazioni I/O-bound concorrenti senza l'overhead dei thread.

```python
import asyncio
import aiohttp
import time

urls = ["https://www.example.com"] * 10

# Funzione asincrona per scaricare un URL
async def scarica_url_async(url, session):
    async with session.get(url) as response:
        return await response.text()

# Funzione principale asincrona
async def scarica_tutti_async(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [scarica_url_async(url, session) for url in urls]
        return await asyncio.gather(*tasks)

# Funzione sequenziale per confronto
def scarica_sequenziale(urls):
    import requests
    return [requests.get(url).text for url in urls]

# Misura tempo sequenziale
inizio = time.time()
scarica_sequenziale(urls)
fine = time.time()
print(f"Sequenziale: {fine - inizio:.4f} secondi")

# Misura tempo asincrono
inizio = time.time()
asyncio.run(scarica_tutti_async(urls))
fine = time.time()
print(f"Asincrono: {fine - inizio:.4f} secondi")
```

## Ottimizzazione della memoria

### Uso di generatori per dataset di grandi dimensioni

```python
# Consumo elevato di memoria
def leggi_file_intero(filename):
    with open(filename, 'r') as f:
        return f.readlines()  # Carica tutto il file in memoria

# Consumo ridotto di memoria
def leggi_file_linea_per_linea(filename):
    with open(filename, 'r') as f:
        for line in f:  # Legge una linea alla volta
            yield line.strip()
```

### Uso di __slots__ per classi con molte istanze

```python
# Classe standard (usa un dizionario per gli attributi)
class PuntoNormale:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# Classe ottimizzata con __slots__
class PuntoOttimizzato:
    __slots__ = ['x', 'y']  # Riduce l'overhead di memoria
    
    def __init__(self, x, y):
        self.x = x
        self.y = y

# Confronto di memoria
import sys

punti_normali = [PuntoNormale(i, i) for i in range(1000000)]
print(f"Memoria punti normali: {sys.getsizeof(punti_normali[0]) * len(punti_normali) / 1024 / 1024:.2f} MB")

punti_ottimizzati = [PuntoOttimizzato(i, i) for i in range(1000000)]
print(f"Memoria punti ottimizzati: {sys.getsizeof(punti_ottimizzati[0]) * len(punti_ottimizzati) / 1024 / 1024:.2f} MB")
```

## Ottimizzazione con estensioni C/C++

### Cython

Cython permette di compilare codice Python in C per migliorare le prestazioni.

```python
# file: calcolo.py (Python puro)
def calcola_somma(n):
    somma = 0
    for i in range(n):
        somma += i
    return somma
```

```cython
# file: calcolo_cy.pyx (Cython)
def calcola_somma(int n):
    cdef int somma = 0
    cdef int i
    for i in range(n):
        somma += i
    return somma
```

```python
# file: setup.py
from setuptools import setup
from Cython.Build import cythonize

setup(
    ext_modules=cythonize("calcolo_cy.pyx")
)
```

Compilazione e confronto:

```bash
python setup.py build_ext --inplace
```

```python
import time
import calcolo
import calcolo_cy

n = 10000000

# Python puro
inizio = time.time()
calcolo.calcola_somma(n)
fine = time.time()
print(f"Python puro: {fine - inizio:.4f} secondi")

# Cython
inizio = time.time()
calcolo_cy.calcola_somma(n)
fine = time.time()
print(f"Cython: {fine - inizio:.4f} secondi")
```

### Numba

Numba è un compilatore JIT (Just-In-Time) che può accelerare il codice Python.

```bash
pip install numba
```

```python
import numpy as np
import time
from numba import jit

# Funzione Python pura
def somma_vettori_python(a, b):
    result = np.empty_like(a)
    for i in range(len(a)):
        result[i] = a[i] + b[i]
    return result

# Funzione accelerata con Numba
@jit(nopython=True)
def somma_vettori_numba(a, b):
    result = np.empty_like(a)
    for i in range(len(a)):
        result[i] = a[i] + b[i]
    return result

# Dati di test
a = np.random.random(10000000)
b = np.random.random(10000000)

# Python puro
inizio = time.time()
somma_vettori_python(a, b)
fine = time.time()
print(f"Python puro: {fine - inizio:.4f} secondi")

# Numba (prima esecuzione include la compilazione)
inizio = time.time()
somma_vettori_numba(a, b)
fine = time.time()
print(f"Numba (prima esecuzione): {fine - inizio:.4f} secondi")

# Numba (seconda esecuzione)
inizio = time.time()
somma_vettori_numba(a, b)
fine = time.time()
print(f"Numba (seconda esecuzione): {fine - inizio:.4f} secondi")
```

## Ottimizzazione del database

### Uso efficiente di ORM

```python
from sqlalchemy import create_engine, Column, Integer, String, select
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String)

# Inefficiente - carica tutti gli utenti in memoria
def find_user_inefficient(session, user_id):
    users = session.query(User).all()  # Carica TUTTI gli utenti
    for user in users:
        if user.id == user_id:
            return user
    return None

# Efficiente - carica solo l'utente richiesto
def find_user_efficient(session, user_id):
    return session.query(User).filter(User.id == user_id).first()

# Inefficiente - N+1 query problem
def get_all_user_emails_inefficient(session):
    users = session.query(User).all()
    return [user.email for user in users]  # Una query per ogni utente

# Efficiente - una sola query
def get_all_user_emails_efficient(session):
    return [email for email, in session.query(User.email)]
```

### Bulk operations

```python
# Inefficiente - inserimenti singoli
def insert_users_inefficient(session, users_data):
    for data in users_data:
        user = User(name=data['name'], email=data['email'])
        session.add(user)
        session.commit()  # Commit per ogni inserimento

# Efficiente - inserimento in blocco
def insert_users_efficient(session, users_data):
    users = [User(name=data['name'], email=data['email']) for data in users_data]
    session.add_all(users)
    session.commit()  # Un solo commit
```

## Caching

### Memoization per funzioni pure

```python
import time
from functools import lru_cache

# Funzione costosa senza cache
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Funzione costosa con cache
@lru_cache(maxsize=None)
def fibonacci_cached(n):
    if n <= 1:
        return n
    return fibonacci_cached(n-1) + fibonacci_cached(n-2)

# Test senza cache
inizio = time.time()
fibonacci(30)
fine = time.time()
print(f"Senza cache: {fine - inizio:.4f} secondi")

# Test con cache
inizio = time.time()
fibonacci_cached(30)
fine = time.time()
print(f"Con cache: {fine - inizio:.4f} secondi")
```

### Caching di risultati di funzioni con Redis

```python
import redis
import json
import time
import hashlib

# Connessione a Redis
r = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(ttl=3600):
    """Decorator per cachare i risultati delle funzioni in Redis."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Crea una chiave unica basata sulla funzione e i suoi argomenti
            key_parts = [func.__name__]
            key_parts.extend([str(arg) for arg in args])
            key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
            key = hashlib.md5(":".join(key_parts).encode()).hexdigest()
            
            # Controlla se il risultato è già in cache
            cached = r.get(key)
            if cached:
                return json.loads(cached)
            
            # Calcola il risultato e lo salva in cache
            result = func(*args, **kwargs)
            r.setex(key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator

# Funzione costosa con cache Redis
@cache_result(ttl=60)  # Cache per 60 secondi
def calcolo_costoso(n):
    """Simula un calcolo costoso."""
    time.sleep(2)  # Simula un'operazione che richiede tempo
    return n * n

# Test della funzione
inizio = time.time()
risultato1 = calcolo_costoso(42)  # Prima chiamata (non in cache)
fine = time.time()
print(f"Prima chiamata: {fine - inizio:.4f} secondi, Risultato: {risultato1}")

inizio = time.time()
risultato2 = calcolo_costoso(42)  # Seconda chiamata (dalla cache)
fine = time.time()
print(f"Seconda chiamata: {fine - inizio:.4f} secondi, Risultato: {risultato2}")
```

## Conclusione

L'ottimizzazione delle prestazioni in Python richiede un approccio metodico:

1. **Misura prima**: Usa strumenti di profiling per identificare i veri colli di bottiglia
2. **Ottimizza dove conta**: Concentrati sulle parti del codice che hanno il maggiore impatto
3. **Usa le strutture dati appropriate**: Scegli le strutture dati più efficienti per il tuo caso d'uso
4. **Sfrutta le librerie specializzate**: Usa NumPy, Pandas e altre librerie ottimizzate
5. **Considera la concorrenza**: Usa threading, multiprocessing o asyncio quando appropriato
6. **Implementa il caching**: Memorizza i risultati di operazioni costose
7. **Ottimizza l'uso della memoria**: Usa generatori e altre tecniche per ridurre il consumo di memoria

Ricorda sempre di mantenere un equilibrio tra prestazioni, leggibilità e manutenibilità del codice. A volte, un codice leggermente più lento ma più chiaro e manutenibile è preferibile a un codice altamente ottimizzato ma difficile da comprendere e modificare.

## Risorse aggiuntive

- [Documentazione ufficiale di cProfile](https://docs.python.org/3/library/profile.html)
- [Documentazione di NumPy](https://numpy.org/doc/stable/)
- [Documentazione di Pandas](https://pandas.pydata.org/docs/)
- [Documentazione di Cython](https://cython.readthedocs.io/)
- [Documentazione di Numba](https://numba.pydata.org/numba-doc/latest/index.html)

## Esercizi

1. Profila un'applicazione Python esistente e identifica i principali colli di bottiglia.
2. Ottimizza una funzione che elabora grandi quantità di dati numerici utilizzando NumPy.
3. Implementa una versione parallela di un algoritmo CPU-bound utilizzando multiprocessing.
4. Crea una versione asincrona di un'applicazione che effettua multiple richieste HTTP.
5. Applica tecniche di caching a una funzione costosa per migliorarne le prestazioni.

---

[Torna all'indice](../README.md) | [Prossima guida: Sicurezza in Python](06-sicurezza-python.md)