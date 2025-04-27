# Ottimizzazione degli Algoritmi in Python

In questa guida esploreremo diverse strategie per ottimizzare gli algoritmi in Python, concentrandoci su tecniche specifiche per migliorare le prestazioni del codice mantenendo la leggibilità e la manutenibilità.

## Indice dei contenuti

1. [Introduzione all'ottimizzazione](#introduzione-allottimizzazione)
2. [Misurazione delle prestazioni](#misurazione-delle-prestazioni)
3. [Ottimizzazione algoritmica](#ottimizzazione-algoritmica)
4. [Ottimizzazione specifica per Python](#ottimizzazione-specifica-per-python)
5. [Parallelizzazione e concorrenza](#parallelizzazione-e-concorrenza)
6. [Ottimizzazione della memoria](#ottimizzazione-della-memoria)
7. [Casi di studio](#casi-di-studio)
8. [Esercizi pratici](#esercizi-pratici)

## Introduzione all'ottimizzazione

L'ottimizzazione degli algoritmi è il processo di miglioramento dell'efficienza di un algoritmo in termini di tempo di esecuzione, utilizzo della memoria o altre risorse. È importante seguire alcuni principi fondamentali:

1. **Ottimizza solo quando necessario**: "La prematura ottimizzazione è la radice di tutti i mali" (Donald Knuth)
2. **Misura prima di ottimizzare**: identifica i veri colli di bottiglia
3. **Mantieni la leggibilità**: un codice ottimizzato ma illeggibile è difficile da mantenere
4. **Documenta le ottimizzazioni**: spiega perché e come hai ottimizzato

## Misurazione delle prestazioni

Prima di ottimizzare, è essenziale misurare le prestazioni attuali del codice per identificare i colli di bottiglia.

### Utilizzo del modulo `time`

```python
import time

def measure_time(func, *args, **kwargs):
    start_time = time.time()
    result = func(*args, **kwargs)
    end_time = time.time()
    print(f"Tempo di esecuzione: {end_time - start_time:.6f} secondi")
    return result

# Esempio di utilizzo
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

# Misura il tempo di esecuzione
arr = [64, 34, 25, 12, 22, 11, 90]
measure_time(bubble_sort, arr.copy())
```

### Utilizzo del modulo `timeit`

```python
import timeit

# Misura il tempo di esecuzione di una funzione
def test_function():
    return [i**2 for i in range(1000)]

# Esegui la funzione 1000 volte e calcola il tempo medio
time_taken = timeit.timeit(test_function, number=1000)
print(f"Tempo medio per esecuzione: {time_taken/1000:.6f} secondi")
```

### Utilizzo del modulo `cProfile`

```python
import cProfile

def complex_function():
    result = 0
    for i in range(1000000):
        result += i
    return result

# Profila la funzione
cProfile.run('complex_function()')
```

## Ottimizzazione algoritmica

L'ottimizzazione più efficace è spesso quella a livello algoritmico, che può ridurre drasticamente la complessità computazionale.

### Esempio: Ottimizzazione della ricerca

**Ricerca lineare (O(n)):**

```python
def linear_search(arr, target):
    for i, item in enumerate(arr):
        if item == target:
            return i
    return -1
```

**Ricerca binaria (O(log n)):**

```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
```

### Esempio: Ottimizzazione del calcolo di Fibonacci

**Implementazione ricorsiva (O(2^n)):**

```python
def fibonacci_recursive(n):
    if n <= 1:
        return n
    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)
```

**Implementazione iterativa (O(n)):**

```python
def fibonacci_iterative(n):
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n+1):
        a, b = b, a + b
    
    return b
```

**Implementazione con formula chiusa (O(1)):**

```python
import math

def fibonacci_formula(n):
    phi = (1 + math.sqrt(5)) / 2
    return round(phi**n / math.sqrt(5))
```

## Ottimizzazione specifica per Python

Python offre diverse tecniche specifiche per ottimizzare il codice.

### Comprensioni di lista vs cicli for

```python
# Meno efficiente
squares = []
for i in range(1000):
    squares.append(i**2)

# Più efficiente
squares = [i**2 for i in range(1000)]
```

### Generatori per grandi dataset

```python
# Consuma molta memoria per grandi valori di n
def squares_list(n):
    return [i**2 for i in range(n)]

# Efficiente in termini di memoria
def squares_generator(n):
    for i in range(n):
        yield i**2
```

### Utilizzo di funzioni built-in

```python
numbers = [1, 2, 3, 4, 5]

# Meno efficiente
total = 0
for num in numbers:
    total += num

# Più efficiente
total = sum(numbers)
```

### Ottimizzazione delle stringhe

```python
# Inefficiente per grandi numeri di concatenazioni
result = ""
for i in range(10000):
    result += str(i)

# Più efficiente
parts = []
for i in range(10000):
    parts.append(str(i))
result = "".join(parts)
```

### Utilizzo di strutture dati appropriate

```python
# Ricerca in una lista (O(n))
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
if 7 in numbers:  # Operazione O(n)
    print("Trovato")

# Ricerca in un set (O(1) in media)
numbers_set = set(numbers)
if 7 in numbers_set:  # Operazione O(1)
    print("Trovato")
```

## Parallelizzazione e concorrenza

Per algoritmi che possono essere eseguiti in parallelo, Python offre diverse opzioni.

### Multiprocessing

```python
from multiprocessing import Pool

def process_item(item):
    # Operazione computazionalmente intensiva
    return item * item

def parallel_processing():
    items = list(range(1000000))
    
    # Crea un pool di processi
    with Pool(processes=4) as pool:
        # Elabora gli elementi in parallelo
        results = pool.map(process_item, items)
    
    return results
```

### Threading

```python
import threading
import time

def worker(name):
    print(f"Worker {name} iniziato")
    time.sleep(2)  # Simula un'operazione I/O-bound
    print(f"Worker {name} completato")

def run_threads():
    threads = []
    
    # Crea e avvia 5 thread
    for i in range(5):
        t = threading.Thread(target=worker, args=(i,))
        threads.append(t)
        t.start()
    
    # Attendi che tutti i thread completino
    for t in threads:
        t.join()
    
    print("Tutti i thread hanno completato")
```

### Asyncio

```python
import asyncio

async def async_worker(name):
    print(f"Worker {name} iniziato")
    await asyncio.sleep(2)  # Simula un'operazione asincrona
    print(f"Worker {name} completato")
    return name

async def main():
    # Esegui le coroutine in parallelo
    tasks = [async_worker(i) for i in range(5)]
    results = await asyncio.gather(*tasks)
    print(f"Risultati: {results}")

# Esegui il loop degli eventi
asyncio.run(main())
```

## Ottimizzazione della memoria

La gestione efficiente della memoria è cruciale per algoritmi che lavorano con grandi quantità di dati.

### Utilizzo di `__slots__`

```python
class PointWithoutSlots:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class PointWithSlots:
    __slots__ = ['x', 'y']  # Riduce l'overhead di memoria
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
```

### Utilizzo di array tipizzati

```python
import array

# Lista normale (più flessibile ma usa più memoria)
numbers_list = [1, 2, 3, 4, 5]

# Array tipizzato (più efficiente in termini di memoria)
numbers_array = array.array('i', [1, 2, 3, 4, 5])  # 'i' indica interi
```

### Utilizzo di NumPy per operazioni su array

```python
import numpy as np

# Operazioni su liste (lente per grandi array)
def add_lists(list1, list2):
    return [a + b for a, b in zip(list1, list2)]

# Operazioni su array NumPy (molto più veloci)
def add_numpy_arrays(arr1, arr2):
    return arr1 + arr2  # Operazione vettorizzata

# Esempio
list1 = list(range(1000000))
list2 = list(range(1000000))
arr1 = np.array(list1)
arr2 = np.array(list2)

# Confronto delle prestazioni
import time

start = time.time()
result_list = add_lists(list1, list2)
print(f"Tempo per liste: {time.time() - start:.6f} secondi")

start = time.time()
result_numpy = add_numpy_arrays(arr1, arr2)
print(f"Tempo per NumPy: {time.time() - start:.6f} secondi")
```

## Casi di studio

### Caso 1: Ottimizzazione di un algoritmo di ordinamento

```python
# Implementazione naïve del Bubble Sort
def bubble_sort_naive(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

# Bubble Sort ottimizzato
def bubble_sort_optimized(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = True
        # Se non ci sono stati scambi in questo passaggio, l'array è ordinato
        if not swapped:
            break
    return arr
```

### Caso 2: Ottimizzazione di un algoritmo di ricerca di percorsi

```python
import heapq

def dijkstra(graph, start):
    # Inizializzazione
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    priority_queue = [(0, start)]
    visited = set()
    
    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)
        
        # Se il nodo è già stato visitato, salta
        if current_node in visited:
            continue
        
        visited.add(current_node)
        
        # Se abbiamo già trovato una distanza minore, salta
        if current_distance > distances[current_node]:
            continue
        
        # Controlla tutti i vicini
        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            
            # Se abbiamo trovato un percorso più breve, aggiorna
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(priority_queue, (distance, neighbor))
    
    return distances
```

## Esercizi pratici

### Esercizio 1: Ottimizzazione di una funzione ricorsiva

Ottimizza la seguente funzione ricorsiva per il calcolo del fattoriale utilizzando la memoizzazione:

```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)
```

### Esercizio 2: Ottimizzazione di operazioni su stringhe

Ottimizza il seguente codice che genera una stringa contenente tutti i numeri da 1 a n:

```python
def generate_numbers_string(n):
    result = ""
    for i in range(1, n+1):
        result += str(i) + ", "
    return result[:-2]  # Rimuove l'ultima virgola e spazio
```

### Esercizio 3: Parallelizzazione di un'operazione intensiva

Implementa una versione parallela della seguente funzione che calcola i numeri primi fino a n:

```python
def is_prime(n):
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

def get_primes(n):
    return [i for i in range(2, n+1) if is_prime(i)]
```

## Conclusione

L'ottimizzazione degli algoritmi è un'arte che richiede un equilibrio tra efficienza, leggibilità e manutenibilità. Ricorda sempre di misurare prima di ottimizzare e di concentrarti sui veri colli di bottiglia. Con le tecniche presentate in questa guida, sarai in grado di migliorare significativamente le prestazioni dei tuoi algoritmi in Python.

## Navigazione

- [Indice della sezione](../README.md)
- [Guida precedente: Tecniche Algoritmiche Avanzate](07-tecniche-algoritmiche-avanzate.md)