# Pool di Thread e Processi

I pool di thread e processi sono strumenti potenti per gestire in modo efficiente l'esecuzione di molte attività concorrenti. Invece di creare e distruggere thread o processi per ogni attività, un pool mantiene un insieme di worker pronti per eseguire le attività, riducendo l'overhead e migliorando le prestazioni.

## ThreadPoolExecutor

Il modulo `concurrent.futures` fornisce l'implementazione di `ThreadPoolExecutor`, un pool di thread di alto livello.

### Utilizzo Base

```python
from concurrent.futures import ThreadPoolExecutor
import time

def task(n):
    print(f"Esecuzione del task {n}")
    time.sleep(1)  # Simulazione di un'operazione che richiede tempo
    return n * n

# Creazione di un pool con 3 thread worker
with ThreadPoolExecutor(max_workers=3) as executor:
    # Esecuzione di 5 task
    futures = [executor.submit(task, i) for i in range(5)]
    
    # Elaborazione dei risultati man mano che diventano disponibili
    for future in concurrent.futures.as_completed(futures):
        risultato = future.result()
        print(f"Risultato: {risultato}")
```

### Esecuzione di una Funzione su Più Dati

```python
from concurrent.futures import ThreadPoolExecutor
import time

def elabora_dato(dato):
    print(f"Elaborazione di {dato}")
    time.sleep(1)  # Simulazione di elaborazione
    return dato.upper()

dati = ["alpha", "beta", "gamma", "delta", "epsilon"]

with ThreadPoolExecutor(max_workers=3) as executor:
    # map applica la funzione a ogni elemento dell'iterabile
    risultati = list(executor.map(elabora_dato, dati))

print(f"Risultati: {risultati}")
```

### Gestione delle Eccezioni

```python
from concurrent.futures import ThreadPoolExecutor
import time
import random

def task_con_errore(id):
    print(f"Esecuzione del task {id}")
    time.sleep(0.5)
    # Simulazione di errore casuale
    if random.random() < 0.3:  # 30% di probabilità di errore
        raise ValueError(f"Errore nel task {id}")
    return f"Risultato del task {id}"

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(task_con_errore, i) for i in range(10)]
    
    for future in concurrent.futures.as_completed(futures):
        try:
            risultato = future.result()
            print(f"Successo: {risultato}")
        except Exception as e:
            print(f"Eccezione catturata: {e}")
```

## ProcessPoolExecutor

Il modulo `concurrent.futures` fornisce anche `ProcessPoolExecutor`, che utilizza processi separati invece di thread.

### Utilizzo Base

```python
from concurrent.futures import ProcessPoolExecutor
import time
import os

def task_processo(n):
    print(f"Task {n} eseguito dal processo con PID: {os.getpid()}")
    time.sleep(1)
    return n * n

if __name__ == "__main__":  # Importante per Windows
    # Creazione di un pool con 4 processi worker
    with ProcessPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(task_processo, i) for i in range(8)]
        
        for future in concurrent.futures.as_completed(futures):
            risultato = future.result()
            print(f"Risultato: {risultato}")
```

### Calcolo Parallelo

```python
from concurrent.futures import ProcessPoolExecutor
import time
import math

def è_primo(n):
    if n < 2:
        return False
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0:
            return False
    return True

def trova_primi_in_range(inizio, fine):
    return [n for n in range(inizio, fine) if è_primo(n)]

def dividi_lavoro(n, num_processi):
    # Divide il lavoro in chunk per ogni processo
    chunk_size = n // num_processi
    ranges = []
    for i in range(num_processi):
        start = i * chunk_size
        end = (i + 1) * chunk_size if i < num_processi - 1 else n
        ranges.append((start, end))
    return ranges

if __name__ == "__main__":
    n = 1000000  # Cerca numeri primi fino a 1 milione
    num_processi = 8
    
    inizio_tempo = time.time()
    
    ranges = dividi_lavoro(n, num_processi)
    
    with ProcessPoolExecutor(max_workers=num_processi) as executor:
        risultati = list(executor.map(lambda r: trova_primi_in_range(*r), ranges))
    
    # Unisce i risultati di tutti i processi
    tutti_primi = []
    for lista_primi in risultati:
        tutti_primi.extend(lista_primi)
    
    fine_tempo = time.time()
    
    print(f"Trovati {len(tutti_primi)} numeri primi")
    print(f"Tempo di esecuzione: {fine_tempo - inizio_tempo:.2f} secondi")
```

## Pool nel Modulo multiprocessing

Il modulo `multiprocessing` fornisce anche una propria implementazione di pool.

### Pool di Processi

```python
import multiprocessing
import time

def task(x):
    print(f"Elaborazione di {x}")
    time.sleep(1)
    return x * x

if __name__ == "__main__":
    # Creazione di un pool con 4 processi
    with multiprocessing.Pool(processes=4) as pool:
        # Metodo map
        risultati = pool.map(task, range(8))
        print(f"Risultati map: {risultati}")
        
        # Metodo apply_async
        risultati_async = [pool.apply_async(task, (i,)) for i in range(8)]
        risultati_ottenuti = [res.get() for res in risultati_async]
        print(f"Risultati apply_async: {risultati_ottenuti}")
```

### Metodi Utili di multiprocessing.Pool

- `map(func, iterable)`: Applica la funzione a ogni elemento dell'iterabile.
- `map_async(func, iterable)`: Versione asincrona di map.
- `apply(func, args)`: Applica la funzione con gli argomenti specificati (bloccante).
- `apply_async(func, args)`: Versione asincrona di apply.
- `starmap(func, iterable)`: Come map, ma spacchetta gli elementi dell'iterabile come argomenti.
- `close()`: Impedisce l'invio di nuovi task al pool.
- `terminate()`: Interrompe immediatamente i worker.
- `join()`: Attende che i worker terminino.

## Confronto tra ThreadPoolExecutor e ProcessPoolExecutor

| Caratteristica | ThreadPoolExecutor | ProcessPoolExecutor |
|----------------|-------------------|---------------------|
| Overhead | Basso | Alto |
| Condivisione memoria | Diretta | Attraverso meccanismi specifici |
| Parallelismo | Limitato dal GIL | Vero parallelismo |
| Uso ideale | Operazioni I/O bound | Operazioni CPU bound |
| Avvio | Più veloce | Più lento |

## Dimensionamento del Pool

La scelta del numero ottimale di worker dipende da diversi fattori:

- **Per operazioni I/O bound**: Un numero maggiore di thread rispetto ai core della CPU può essere vantaggioso (es. `num_threads = num_cores * 5`).
- **Per operazioni CPU bound**: Un numero di processi pari o leggermente superiore al numero di core fisici (es. `num_processes = num_cores`).

```python
import os
import concurrent.futures

# Determina il numero di core disponibili
num_cores = os.cpu_count()
print(f"Numero di core disponibili: {num_cores}")

# Per operazioni I/O bound
with concurrent.futures.ThreadPoolExecutor(max_workers=num_cores * 5) as executor:
    # Codice per operazioni I/O bound
    pass

# Per operazioni CPU bound
with concurrent.futures.ProcessPoolExecutor(max_workers=num_cores) as executor:
    # Codice per operazioni CPU bound
    pass
```

## Esempio Pratico: Download di Immagini

```python
import concurrent.futures
import requests
import time
import os

def download_image(url):
    print(f"Scaricamento di {url}")
    response = requests.get(url, timeout=10)
    if response.status_code == 200:
        # Estrae il nome del file dall'URL
        filename = os.path.basename(url)
        # Salva l'immagine
        with open(f"images/{filename}", "wb") as f:
            f.write(response.content)
        return f"Scaricato {url}"
    else:
        return f"Errore {response.status_code} per {url}"

# Lista di URL di immagini da scaricare
urls = [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg",
    # Aggiungi altri URL...
]

# Assicurati che la directory esista
os.makedirs("images", exist_ok=True)

# Utilizzo di ThreadPoolExecutor per operazioni I/O bound
inizio = time.time()

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(download_image, url) for url in urls]
    
    for future in concurrent.futures.as_completed(futures):
        try:
            risultato = future.result()
            print(risultato)
        except Exception as e:
            print(f"Si è verificata un'eccezione: {e}")

fine = time.time()
print(f"Tempo totale: {fine - inizio:.2f} secondi")
```

## Navigazione

- [Torna all'indice](../README.md)
- [Precedente: Programmazione asincrona con asyncio](05-asyncio.md)
- [Prossimo: Pattern di concorrenza](07-pattern-concorrenza.md)