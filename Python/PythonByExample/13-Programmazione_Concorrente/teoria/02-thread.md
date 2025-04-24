# Thread in Python

I thread sono unità di esecuzione leggere che condividono lo stesso spazio di memoria all'interno di un processo. In Python, i thread sono implementati attraverso il modulo `threading` della libreria standard.

## Il Modulo `threading`

Il modulo `threading` fornisce un'interfaccia di alto livello per lavorare con i thread. Ecco le principali classi e funzioni:

- `Thread`: La classe principale per creare e gestire thread
- `Lock`, `RLock`: Meccanismi di sincronizzazione per proteggere le risorse condivise
- `Semaphore`, `BoundedSemaphore`: Controllo dell'accesso a risorse limitate
- `Event`: Comunicazione tra thread
- `Condition`: Sincronizzazione avanzata
- `Timer`: Thread che eseguono funzioni dopo un ritardo

## Creazione di Thread

Esistono due modi principali per creare thread in Python:

### 1. Estendendo la classe Thread

```python
import threading
import time

class MioThread(threading.Thread):
    def __init__(self, nome):
        super().__init__()
        self.nome = nome
    
    def run(self):
        print(f"Thread {self.nome} avviato")
        time.sleep(2)  # Simulazione di un'operazione che richiede tempo
        print(f"Thread {self.nome} completato")

# Creazione e avvio dei thread
thread1 = MioThread("Uno")
thread2 = MioThread("Due")

thread1.start()
thread2.start()

# Attesa del completamento
thread1.join()
thread2.join()

print("Tutti i thread hanno terminato")
```

### 2. Passando una funzione al costruttore Thread

```python
import threading
import time

def funzione_thread(nome):
    print(f"Thread {nome} avviato")
    time.sleep(2)  # Simulazione di un'operazione che richiede tempo
    print(f"Thread {nome} completato")

# Creazione e avvio dei thread
thread1 = threading.Thread(target=funzione_thread, args=("Uno",))
thread2 = threading.Thread(target=funzione_thread, args=("Due",))

thread1.start()
thread2.start()

# Attesa del completamento
thread1.join()
thread2.join()

print("Tutti i thread hanno terminato")
```

## Metodi Importanti della Classe Thread

- `start()`: Avvia l'esecuzione del thread
- `join([timeout])`: Attende il completamento del thread
- `is_alive()`: Verifica se il thread è ancora in esecuzione
- `daemon`: Proprietà che determina se il thread è un daemon (termina quando il programma principale termina)
- `name`: Nome del thread (utile per il debugging)

## Thread Daemon

I thread daemon sono thread di background che terminano automaticamente quando il programma principale termina.

```python
import threading
import time

def funzione_daemon():
    while True:
        print("Thread daemon in esecuzione...")
        time.sleep(1)

# Creazione di un thread daemon
daemon_thread = threading.Thread(target=funzione_daemon)
daemon_thread.daemon = True  # Imposta il thread come daemon
daemon_thread.start()

# Il programma principale continua
print("Programma principale in esecuzione")
time.sleep(3)  # Esegue per 3 secondi
print("Programma principale terminato")
# Il thread daemon terminerà automaticamente
```

## Limitazioni dei Thread in Python

A causa del GIL (Global Interpreter Lock), i thread in Python non possono eseguire codice Python in parallelo su più core della CPU. Questo significa che:

- I thread sono ideali per operazioni I/O bound (come richieste di rete, operazioni su file)
- Per operazioni CPU bound, i thread non offrono un vero parallelismo

## Esempio Pratico: Download Concorrente

```python
import threading
import requests
import time

def download_site(url):
    print(f"Scaricamento di {url}")
    response = requests.get(url)
    print(f"Completato {url}: {len(response.text)} caratteri")

def download_all_sites(sites):
    threads = []
    for url in sites:
        thread = threading.Thread(target=download_site, args=(url,))
        threads.append(thread)
        thread.start()
    
    # Attesa del completamento di tutti i thread
    for thread in threads:
        thread.join()

sites = [
    "https://www.python.org/",
    "https://docs.python.org/",
    "https://pypi.org/",
    "https://github.com/python/cpython",
    "https://www.python.org/downloads/",
]

inizio = time.time()
download_all_sites(sites)
fine = time.time()

print(f"Tempo di esecuzione: {fine - inizio:.2f} secondi")
```

## Quando Usare i Thread

I thread sono particolarmente utili per:

- Operazioni di I/O bound (rete, file, database)
- Mantenere reattiva l'interfaccia utente durante operazioni lunghe
- Gestire più connessioni di rete simultaneamente
- Timer e operazioni periodiche

## Navigazione

- [Torna all'indice](../README.md)
- [Precedente: Introduzione alla programmazione concorrente](01-introduzione-concorrenza.md)
- [Prossimo: Processi in Python](03-processi.md)