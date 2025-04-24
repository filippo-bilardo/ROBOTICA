# Sincronizzazione e Comunicazione

Quando si lavora con thread o processi concorrenti, è fondamentale gestire correttamente l'accesso alle risorse condivise e coordinare l'esecuzione delle diverse unità di lavoro. Python offre diversi meccanismi per la sincronizzazione e la comunicazione.

## Problemi di Concorrenza

### Race Condition

Una race condition si verifica quando il risultato di un'operazione dipende dall'ordine di esecuzione di più thread o processi.

```python
# Esempio di race condition
import threading

contatore = 0

def incrementa():
    global contatore
    for _ in range(100000):
        # Operazione non atomica: lettura, incremento, scrittura
        contatore += 1

thread1 = threading.Thread(target=incrementa)
thread2 = threading.Thread(target=incrementa)

thread1.start()
thread2.start()

thread1.join()
thread2.join()

print(f"Valore finale del contatore: {contatore}")  # Probabilmente < 200000
```

### Deadlock

Un deadlock si verifica quando due o più thread sono bloccati in attesa l'uno dell'altro.

```python
# Esempio di deadlock
import threading
import time

lock1 = threading.Lock()
lock2 = threading.Lock()

def thread_a():
    print("Thread A: Tentativo di acquisire lock1")
    with lock1:
        print("Thread A: Lock1 acquisito")
        time.sleep(0.5)  # Simulazione di lavoro
        print("Thread A: Tentativo di acquisire lock2")
        with lock2:
            print("Thread A: Lock2 acquisito")

def thread_b():
    print("Thread B: Tentativo di acquisire lock2")
    with lock2:
        print("Thread B: Lock2 acquisito")
        time.sleep(0.5)  # Simulazione di lavoro
        print("Thread B: Tentativo di acquisire lock1")
        with lock1:
            print("Thread B: Lock1 acquisito")

thread_a = threading.Thread(target=thread_a)
thread_b = threading.Thread(target=thread_b)

thread_a.start()
thread_b.start()

thread_a.join()
thread_b.join()
```

## Meccanismi di Sincronizzazione

### Lock (Mutex)

Un lock (o mutex) è il meccanismo di sincronizzazione più semplice. Permette di proteggere una sezione critica di codice.

```python
import threading

contatore = 0
lock = threading.Lock()

def incrementa_sicuro():
    global contatore
    for _ in range(100000):
        with lock:  # Equivalente a lock.acquire() seguito da lock.release()
            contatore += 1

thread1 = threading.Thread(target=incrementa_sicuro)
thread2 = threading.Thread(target=incrementa_sicuro)

thread1.start()
thread2.start()

thread1.join()
thread2.join()

print(f"Valore finale del contatore: {contatore}")  # Sempre 200000
```

### RLock (Lock Rientrante)

Un RLock è un lock che può essere acquisito più volte dallo stesso thread.

```python
import threading

class Contatore:
    def __init__(self):
        self.valore = 0
        self.lock = threading.RLock()
    
    def incrementa(self):
        with self.lock:
            self.valore += 1
    
    def incrementa_doppio(self):
        with self.lock:  # Prima acquisizione
            self.incrementa()  # Seconda acquisizione (nello stesso thread)

contatore = Contatore()

def worker():
    for _ in range(1000):
        contatore.incrementa_doppio()

thread1 = threading.Thread(target=worker)
thread2 = threading.Thread(target=worker)

thread1.start()
thread2.start()

thread1.join()
thread2.join()

print(f"Valore finale: {contatore.valore}")  # 4000
```

### Semaphore (Semaforo)

Un semaforo limita il numero di thread che possono accedere a una risorsa.

```python
import threading
import time
import random

# Simulazione di un pool di connessioni al database
class PoolConnessioni:
    def __init__(self, max_connessioni):
        self.semaforo = threading.Semaphore(max_connessioni)
    
    def esegui_query(self, query, thread_id):
        with self.semaforo:
            print(f"Thread {thread_id}: Connessione acquisita, esecuzione di '{query}'")
            time.sleep(random.uniform(0.5, 2))  # Simulazione di query
            print(f"Thread {thread_id}: Query completata, rilascio connessione")

pool = PoolConnessioni(max_connessioni=3)  # Solo 3 connessioni simultanee

def worker(thread_id):
    for i in range(3):
        query = f"SELECT * FROM tabella WHERE id = {i}"
        pool.esegui_query(query, thread_id)

threads = []
for i in range(10):  # 10 thread che competono per 3 connessioni
    t = threading.Thread(target=worker, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()
```

### Event

Un Event è un semplice meccanismo di segnalazione tra thread.

```python
import threading
import time

def attendi_evento(evento, nome):
    print(f"{nome} in attesa dell'evento...")
    evento.wait()  # Blocca finché l'evento non viene impostato
    print(f"{nome} ha ricevuto l'evento e continua l'esecuzione")

def imposta_evento(evento, ritardo):
    print(f"L'evento sarà impostato tra {ritardo} secondi")
    time.sleep(ritardo)
    print("Impostazione dell'evento")
    evento.set()  # Imposta l'evento e sblocca tutti i thread in attesa

evento = threading.Event()

thread1 = threading.Thread(target=attendi_evento, args=(evento, "Thread 1"))
thread2 = threading.Thread(target=attendi_evento, args=(evento, "Thread 2"))
thread3 = threading.Thread(target=imposta_evento, args=(evento, 3))

thread1.start()
thread2.start()
thread3.start()

thread1.join()
thread2.join()
thread3.join()
```

### Condition

Un Condition combina un lock con la capacità di attendere che una condizione diventi vera.

```python
import threading
import time
import random

# Implementazione di un buffer limitato (pattern produttore-consumatore)
class BufferLimitato:
    def __init__(self, capacita):
        self.buffer = []
        self.capacita = capacita
        self.condition = threading.Condition()
    
    def aggiungi(self, item):
        with self.condition:
            while len(self.buffer) >= self.capacita:
                print(f"Buffer pieno, produttore in attesa...")
                self.condition.wait()  # Rilascia il lock e attende
            
            self.buffer.append(item)
            print(f"Prodotto: {item}, buffer: {self.buffer}")
            
            self.condition.notify()  # Notifica un thread in attesa
    
    def preleva(self):
        with self.condition:
            while len(self.buffer) == 0:
                print(f"Buffer vuoto, consumatore in attesa...")
                self.condition.wait()  # Rilascia il lock e attende
            
            item = self.buffer.pop(0)
            print(f"Consumato: {item}, buffer: {self.buffer}")
            
            self.condition.notify()  # Notifica un thread in attesa
            return item

buffer = BufferLimitato(capacita=5)

def produttore():
    for i in range(10):
        time.sleep(random.uniform(0.1, 0.5))  # Simulazione di produzione
        buffer.aggiungi(i)

def consumatore():
    for i in range(10):
        time.sleep(random.uniform(0.2, 0.7))  # Simulazione di consumo
        buffer.preleva()

thread_produttore = threading.Thread(target=produttore)
thread_consumatore = threading.Thread(target=consumatore)

thread_produttore.start()
thread_consumatore.start()

thread_produttore.join()
thread_consumatore.join()
```

## Comunicazione tra Processi

Per i processi, che non condividono memoria, Python fornisce meccanismi specifici di comunicazione:

### Queue

```python
import multiprocessing
import time
import random

def produttore(queue):
    for i in range(5):
        item = f"Item {i}"
        time.sleep(random.uniform(0.1, 0.5))  # Simulazione di produzione
        queue.put(item)
        print(f"Prodotto: {item}")

def consumatore(queue):
    while True:
        try:
            item = queue.get(timeout=2)  # Attesa con timeout
            print(f"Consumato: {item}")
            time.sleep(random.uniform(0.2, 0.7))  # Simulazione di consumo
        except multiprocessing.queues.Empty:
            print("Timeout, uscita")
            break

if __name__ == "__main__":
    queue = multiprocessing.Queue()
    
    proc_produttore = multiprocessing.Process(target=produttore, args=(queue,))
    proc_consumatore = multiprocessing.Process(target=consumatore, args=(queue,))
    
    proc_produttore.start()
    proc_consumatore.start()
    
    proc_produttore.join()
    proc_consumatore.join()
```

### Pipe

```python
import multiprocessing

def ping(conn):
    for i in range(5):
        conn.send(f"Ping {i}")
        response = conn.recv()
        print(f"Ping ricevuto: {response}")

def pong(conn):
    for i in range(5):
        message = conn.recv()
        print(f"Pong ricevuto: {message}")
        conn.send(f"Pong {i}")

if __name__ == "__main__":
    conn1, conn2 = multiprocessing.Pipe()
    
    proc_ping = multiprocessing.Process(target=ping, args=(conn1,))
    proc_pong = multiprocessing.Process(target=pong, args=(conn2,))
    
    proc_ping.start()
    proc_pong.start()
    
    proc_ping.join()
    proc_pong.join()
```

## Strategie per Evitare Problemi di Concorrenza

1. **Minimizzare le sezioni critiche**: Ridurre al minimo il codice protetto da lock.
2. **Utilizzare strutture dati thread-safe**: Alcune strutture dati sono progettate per essere utilizzate in contesti concorrenti.
3. **Evitare deadlock**: Acquisire sempre i lock nello stesso ordine.
4. **Preferire operazioni atomiche**: Utilizzare operazioni che non possono essere interrotte.
5. **Utilizzare variabili locali**: Le variabili locali sono specifiche per ogni thread.

## Navigazione

- [Torna all'indice](../README.md)
- [Precedente: Processi in Python](03-processi.md)
- [Prossimo: Programmazione asincrona con asyncio](05-asyncio.md)