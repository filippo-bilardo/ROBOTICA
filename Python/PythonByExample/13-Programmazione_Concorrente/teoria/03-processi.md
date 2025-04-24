# Processi in Python

I processi sono istanze indipendenti di un programma in esecuzione, ciascuna con il proprio spazio di memoria. In Python, il modulo `multiprocessing` fornisce un'API simile a quella del modulo `threading` ma utilizza processi separati anziché thread.

## Il Modulo `multiprocessing`

Il modulo `multiprocessing` è stato progettato per superare le limitazioni del GIL (Global Interpreter Lock) permettendo di sfruttare appieno i sistemi multi-core.

## Creazione di Processi

Esistono due modi principali per creare processi in Python:

### 1. Utilizzando la classe Process

```python
import multiprocessing
import time

def funzione_processo(nome):
    print(f"Processo {nome} avviato")
    time.sleep(2)  # Simulazione di un'operazione che richiede tempo
    print(f"Processo {nome} completato")

if __name__ == "__main__":  # Importante per Windows
    # Creazione e avvio dei processi
    processo1 = multiprocessing.Process(target=funzione_processo, args=("Uno",))
    processo2 = multiprocessing.Process(target=funzione_processo, args=("Due",))
    
    processo1.start()
    processo2.start()
    
    # Attesa del completamento
    processo1.join()
    processo2.join()
    
    print("Tutti i processi hanno terminato")
```

### 2. Estendendo la classe Process

```python
import multiprocessing
import time

class MioProcesso(multiprocessing.Process):
    def __init__(self, nome):
        super().__init__()
        self.nome = nome
    
    def run(self):
        print(f"Processo {self.nome} avviato")
        time.sleep(2)  # Simulazione di un'operazione che richiede tempo
        print(f"Processo {self.nome} completato")

if __name__ == "__main__":
    # Creazione e avvio dei processi
    processo1 = MioProcesso("Uno")
    processo2 = MioProcesso("Due")
    
    processo1.start()
    processo2.start()
    
    # Attesa del completamento
    processo1.join()
    processo2.join()
    
    print("Tutti i processi hanno terminato")
```

## Comunicazione tra Processi

Poiché i processi non condividono memoria, Python fornisce diversi meccanismi per la comunicazione tra processi:

### 1. Queue (Code)

```python
import multiprocessing

def produttore(queue):
    for i in range(5):
        item = f"Item {i}"
        queue.put(item)
        print(f"Prodotto: {item}")

def consumatore(queue):
    while True:
        item = queue.get()
        if item is None:  # Segnale di terminazione
            break
        print(f"Consumato: {item}")

if __name__ == "__main__":
    # Creazione di una coda condivisa
    queue = multiprocessing.Queue()
    
    # Creazione e avvio dei processi
    proc_produttore = multiprocessing.Process(target=produttore, args=(queue,))
    proc_consumatore = multiprocessing.Process(target=consumatore, args=(queue,))
    
    proc_produttore.start()
    proc_consumatore.start()
    
    # Attesa del completamento del produttore
    proc_produttore.join()
    
    # Invio del segnale di terminazione al consumatore
    queue.put(None)
    proc_consumatore.join()
```

### 2. Pipe (Tubazioni)

```python
import multiprocessing

def sender(conn):
    for i in range(5):
        message = f"Messaggio {i}"
        conn.send(message)
        print(f"Inviato: {message}")
    conn.close()

def receiver(conn):
    while True:
        try:
            message = conn.recv()
            print(f"Ricevuto: {message}")
        except EOFError:
            # L'altra estremità è stata chiusa
            break

if __name__ == "__main__":
    # Creazione di una pipe
    parent_conn, child_conn = multiprocessing.Pipe()
    
    # Creazione e avvio dei processi
    proc_sender = multiprocessing.Process(target=sender, args=(parent_conn,))
    proc_receiver = multiprocessing.Process(target=receiver, args=(child_conn,))
    
    proc_sender.start()
    proc_receiver.start()
    
    # Attesa del completamento
    proc_sender.join()
    proc_receiver.join()
```

### 3. Manager

I Manager forniscono un modo per creare oggetti condivisi tra processi.

```python
import multiprocessing

def worker(dizionario, lista, lock):
    with lock:
        dizionario["chiave"] = "valore"
        lista.append(1)
        lista.append(2)
        lista.append(3)

if __name__ == "__main__":
    with multiprocessing.Manager() as manager:
        # Creazione di oggetti condivisi
        dizionario_condiviso = manager.dict()
        lista_condivisa = manager.list()
        lock = manager.Lock()
        
        # Creazione e avvio dei processi
        processi = []
        for i in range(3):
            p = multiprocessing.Process(target=worker, args=(dizionario_condiviso, lista_condivisa, lock))
            processi.append(p)
            p.start()
        
        # Attesa del completamento
        for p in processi:
            p.join()
        
        # Stampa dei risultati
        print(f"Dizionario condiviso: {dict(dizionario_condiviso)}")
        print(f"Lista condivisa: {list(lista_condivisa)}")
```

## Confronto tra Thread e Processi

| Caratteristica | Thread | Processi |
|----------------|--------|----------|
| Spazio di memoria | Condiviso | Separato |
| Overhead di creazione | Basso | Alto |
| Comunicazione | Diretta (variabili condivise) | Attraverso meccanismi specifici (Queue, Pipe, Manager) |
| Parallelismo | Limitato dal GIL | Vero parallelismo |
| Uso ideale | Operazioni I/O bound | Operazioni CPU bound |

## Esempio Pratico: Calcolo Parallelo

```python
import multiprocessing
import time

def calcola_somma_quadrati(inizio, fine, risultato):
    somma = sum(i*i for i in range(inizio, fine))
    risultato.value = somma

if __name__ == "__main__":
    # Parametri del problema
    n = 100_000_000
    num_processi = 4
    
    # Creazione di valori condivisi per i risultati parziali
    risultati = [multiprocessing.Value('d', 0.0) for _ in range(num_processi)]
    
    # Divisione del lavoro
    chunk_size = n // num_processi
    
    # Creazione e avvio dei processi
    processi = []
    for i in range(num_processi):
        inizio = i * chunk_size
        fine = (i + 1) * chunk_size if i < num_processi - 1 else n
        p = multiprocessing.Process(target=calcola_somma_quadrati, args=(inizio, fine, risultati[i]))
        processi.append(p)
    
    inizio_tempo = time.time()
    
    for p in processi:
        p.start()
    
    for p in processi:
        p.join()
    
    # Calcolo del risultato finale
    risultato_finale = sum(r.value for r in risultati)
    
    fine_tempo = time.time()
    
    print(f"Risultato: {risultato_finale}")
    print(f"Tempo di esecuzione: {fine_tempo - inizio_tempo:.2f} secondi")
```

## Quando Usare i Processi

I processi sono particolarmente utili per:

- Operazioni CPU bound (calcoli intensivi)
- Sfruttare appieno i sistemi multi-core
- Isolare parti del programma per maggiore stabilità
- Eseguire codice in parallelo senza le limitazioni del GIL

## Navigazione

- [Torna all'indice](../README.md)
- [Precedente: Thread in Python](02-thread.md)
- [Prossimo: Sincronizzazione e comunicazione](04-sincronizzazione.md)