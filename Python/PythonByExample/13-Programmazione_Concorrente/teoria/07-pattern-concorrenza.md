# Pattern di Concorrenza

I pattern di concorrenza sono soluzioni riutilizzabili per problemi comuni nella programmazione concorrente. Questi pattern aiutano a strutturare il codice in modo da sfruttare efficacemente la concorrenza evitando problemi come race condition, deadlock e starvation.

## Pattern Produttore-Consumatore

Il pattern produttore-consumatore è uno dei più comuni nella programmazione concorrente. Prevede uno o più produttori che generano dati e uno o più consumatori che li elaborano.

### Implementazione con Queue

```python
import threading
import queue
import time
import random

# Coda condivisa tra produttori e consumatori
q = queue.Queue(maxsize=10)  # Dimensione massima della coda

def produttore(id):
    for i in range(5):
        item = f"Item {id}-{i}"
        q.put(item)  # Blocca se la coda è piena
        print(f"Produttore {id} ha prodotto: {item}")
        time.sleep(random.uniform(0.1, 0.5))

def consumatore(id):
    while True:
        try:
            item = q.get(timeout=2)  # Blocca se la coda è vuota
            print(f"Consumatore {id} ha consumato: {item}")
            q.task_done()  # Segnala che l'item è stato elaborato
            time.sleep(random.uniform(0.2, 0.7))
        except queue.Empty:
            print(f"Consumatore {id} esce: coda vuota")
            break

# Creazione dei thread produttori
produttori = []
for i in range(3):
    t = threading.Thread(target=produttore, args=(i,))
    produttori.append(t)
    t.start()

# Creazione dei thread consumatori
consumatori = []
for i in range(2):
    t = threading.Thread(target=consumatore, args=(i,))
    consumatori.append(t)
    t.start()

# Attesa del completamento dei produttori
for t in produttori:
    t.join()

# Attesa che la coda sia vuota
q.join()

# I consumatori potrebbero essere ancora in attesa, ma non ci sono più item
print("Tutti gli item sono stati prodotti e consumati")
```

## Pattern Worker Pool

Il pattern worker pool distribuisce le attività tra un gruppo di worker, ottimizzando l'utilizzo delle risorse.

### Implementazione con ThreadPoolExecutor

```python
from concurrent.futures import ThreadPoolExecutor
import time
import random

def task(id):
    print(f"Task {id} iniziato")
    # Simulazione di un'operazione che richiede tempo variabile
    sleep_time = random.uniform(0.5, 2.0)
    time.sleep(sleep_time)
    print(f"Task {id} completato in {sleep_time:.2f} secondi")
    return id, sleep_time

# Creazione di un pool di worker
with ThreadPoolExecutor(max_workers=3) as executor:
    # Sottomissione di 10 task al pool
    futures = [executor.submit(task, i) for i in range(10)]
    
    # Elaborazione dei risultati man mano che diventano disponibili
    for future in concurrent.futures.as_completed(futures):
        id, tempo = future.result()
        print(f"Risultato del task {id}: {tempo:.2f} secondi")
```

## Pattern Map-Reduce

Il pattern map-reduce divide un problema in parti più piccole (map), elabora ogni parte in parallelo e poi combina i risultati (reduce).

### Implementazione con ProcessPoolExecutor

```python
from concurrent.futures import ProcessPoolExecutor
import time
import random
import math

# Funzione map: elabora una parte dei dati
def calcola_statistiche(chunk):
    somma = sum(chunk)
    media = somma / len(chunk)
    varianza = sum((x - media) ** 2 for x in chunk) / len(chunk)
    return {
        "somma": somma,
        "media": media,
        "varianza": varianza,
        "min": min(chunk),
        "max": max(chunk)
    }

# Funzione reduce: combina i risultati parziali
def combina_statistiche(risultati):
    # Calcola il numero totale di elementi
    n_totale = sum(len(chunk) for chunk in chunks)
    
    # Combina le statistiche
    somma_totale = sum(r["somma"] for r in risultati)
    media_totale = somma_totale / n_totale
    
    # Per la varianza, è necessario ricalcolarla
    varianza_totale = sum(r["varianza"] * (len(chunks[i]) / n_totale) for i, r in enumerate(risultati))
    
    return {
        "somma": somma_totale,
        "media": media_totale,
        "varianza": varianza_totale,
        "min": min(r["min"] for r in risultati),
        "max": max(r["max"] for r in risultati)
    }

if __name__ == "__main__":
    # Genera dati casuali
    dati = [random.uniform(0, 100) for _ in range(10000000)]
    
    # Dividi i dati in chunk
    n_processi = 8
    chunk_size = math.ceil(len(dati) / n_processi)
    chunks = [dati[i:i+chunk_size] for i in range(0, len(dati), chunk_size)]
    
    inizio = time.time()
    
    # Fase map: elabora ogni chunk in parallelo
    with ProcessPoolExecutor(max_workers=n_processi) as executor:
        risultati = list(executor.map(calcola_statistiche, chunks))
    
    # Fase reduce: combina i risultati
    statistiche_finali = combina_statistiche(risultati)
    
    fine = time.time()
    
    print(f"Statistiche calcolate in {fine - inizio:.2f} secondi:")
    print(f"Media: {statistiche_finali['media']:.2f}")
    print(f"Varianza: {statistiche_finali['varianza']:.2f}")
    print(f"Min: {statistiche_finali['min']:.2f}")
    print(f"Max: {statistiche_finali['max']:.2f}")
```

## Pattern Pipeline

Il pattern pipeline organizza le attività in una sequenza di stadi, dove l'output di uno stadio diventa l'input del successivo.

### Implementazione con Queue

```python
import threading
import queue
import time
import random

# Code per collegare gli stadi della pipeline
queue_1 = queue.Queue()
queue_2 = queue.Queue()
queue_3 = queue.Queue()

def generatore(n):
    for i in range(n):
        item = f"Item-{i}"
        print(f"Generato: {item}")
        queue_1.put(item)
        time.sleep(random.uniform(0.1, 0.3))
    queue_1.put(None)  # Segnale di terminazione

def stadio_1():
    while True:
        item = queue_1.get()
        if item is None:
            print("Stadio 1: terminazione")
            queue_2.put(None)  # Propaga il segnale di terminazione
            break
        
        # Elaborazione dello stadio 1
        elaborato = f"{item}-elaborato1"
        print(f"Stadio 1: {elaborato}")
        time.sleep(random.uniform(0.2, 0.5))
        queue_2.put(elaborato)

def stadio_2():
    while True:
        item = queue_2.get()
        if item is None:
            print("Stadio 2: terminazione")
            queue_3.put(None)  # Propaga il segnale di terminazione
            break
        
        # Elaborazione dello stadio 2
        elaborato = f"{item}-elaborato2"
        print(f"Stadio 2: {elaborato}")
        time.sleep(random.uniform(0.1, 0.4))
        queue_3.put(elaborato)

def stadio_finale():
    while True:
        item = queue_3.get()
        if item is None:
            print("Stadio finale: terminazione")
            break
        
        # Elaborazione finale
        print(f"Stadio finale: {item}-completato")
        time.sleep(random.uniform(0.1, 0.2))

# Creazione e avvio dei thread per ogni stadio della pipeline
t1 = threading.Thread(target=generatore, args=(5,))
t2 = threading.Thread(target=stadio_1)
t3 = threading.Thread(target=stadio_2)
t4 = threading.Thread(target=stadio_finale)

t1.start()
t2.start()
t3.start()
t4.start()

# Attesa del completamento di tutti gli stadi
t1.join()
t2.join()
t3.join()
t4.join()

print("Pipeline completata")
```

## Pattern Fan-out/Fan-in

Il pattern fan-out/fan-in distribuisce il lavoro a più worker (fan-out) e poi raccoglie e combina i risultati (fan-in).

### Implementazione con asyncio

```python
import asyncio
import random
import time

async def worker(id, task_queue, result_queue):
    while True:
        # Attende un task dalla coda
        task = await task_queue.get()
        if task is None:
            # Segnale di terminazione
            task_queue.task_done()
            break
        
        # Elaborazione del task
        print(f"Worker {id} elabora {task}")
        await asyncio.sleep(random.uniform(0.5, 1.5))  # Simulazione di lavoro
        result = f"Risultato di {task} da worker {id}"
        
        # Inserisce il risultato nella coda dei risultati
        await result_queue.put(result)
        
        # Segnala che il task è stato completato
        task_queue.task_done()

async def fan_out_fan_in(num_workers, tasks):
    # Creazione delle code
    task_queue = asyncio.Queue()
    result_queue = asyncio.Queue()
    
    # Inserimento dei task nella coda
    for task in tasks:
        await task_queue.put(task)
    
    # Aggiunta dei segnali di terminazione (uno per worker)
    for _ in range(num_workers):
        await task_queue.put(None)
    
    # Creazione dei worker
    workers = []
    for i in range(num_workers):
        worker_task = asyncio.create_task(worker(i, task_queue, result_queue))
        workers.append(worker_task)
    
    # Attesa del completamento di tutti i task
    await task_queue.join()
    
    # Raccolta dei risultati
    results = []
    while not result_queue.empty():
        result = await result_queue.get()
        results.append(result)
    
    # Attesa del completamento di tutti i worker
    await asyncio.gather(*workers)
    
    return results

async def main():
    # Lista di task da elaborare
    tasks = [f"Task-{i}" for i in range(10)]
    
    print(f"Avvio elaborazione di {len(tasks)} task con 3 worker")
    inizio = time.time()
    
    # Esecuzione del pattern fan-out/fan-in
    results = await fan_out_fan_in(3, tasks)
    
    fine = time.time()
    print(f"Elaborazione completata in {fine - inizio:.2f} secondi")
    print(f"Risultati: {results}")

# asyncio.run(main())
```

## Pattern Future

Il pattern future rappresenta un risultato che sarà disponibile in futuro, permettendo di continuare l'esecuzione senza bloccare.

### Implementazione con concurrent.futures

```python
from concurrent.futures import ThreadPoolExecutor
import time
import random

def task_lungo(id):
    print(f"Task {id} iniziato")
    # Simulazione di un'operazione lunga
    sleep_time = random.uniform(1, 3)
    time.sleep(sleep_time)
    if random.random() < 0.2:  # 20% di probabilità di errore
        raise ValueError(f"Errore simulato nel task {id}")
    return f"Risultato del task {id}: {sleep_time:.2f} secondi"

# Creazione di un pool di thread
with ThreadPoolExecutor(max_workers=4) as executor:
    # Sottomissione dei task e ottenimento dei future
    futures = {executor.submit(task_lungo, i): i for i in range(10)}
    
    # Elaborazione dei risultati man mano che diventano disponibili
    for future in concurrent.futures.as_completed(futures):
        id = futures[future]
        try:
            result = future.result()
            print(f"Task {id} completato: {result}")
        except Exception as e:
            print(f"Task {id} fallito: {e}")
```

## Considerazioni sui Pattern di Concorrenza

### Vantaggi

- **Riutilizzo**: I pattern sono soluzioni collaudate che possono essere adattate a diversi problemi.
- **Leggibilità**: L'uso di pattern rende il codice più comprensibile.
- **Manutenibilità**: I pattern facilitano la manutenzione e l'evoluzione del codice.
- **Prestazioni**: I pattern sono progettati per ottimizzare l'utilizzo delle risorse.

### Scegliere il Pattern Giusto

La scelta del pattern dipende da diversi fattori:

- **Tipo di problema**: Alcuni pattern sono più adatti a certi tipi di problemi.
- **Requisiti di prestazioni**: Alcuni pattern sono più efficienti in determinate situazioni.
- **Complessità**: Alcuni pattern sono più semplici da implementare e mantenere.
- **Scalabilità**: Alcuni pattern si adattano meglio all'aumento del carico di lavoro.

## Navigazione

- [Torna all'indice](../README.md)
- [Precedente: Pool di thread e processi](06-pool.md)