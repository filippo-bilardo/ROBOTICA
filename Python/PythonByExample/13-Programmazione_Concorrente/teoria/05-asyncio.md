# Programmazione Asincrona con asyncio

Il modulo `asyncio` è una libreria Python per scrivere codice concorrente utilizzando la sintassi `async`/`await`. È particolarmente efficace per operazioni di I/O bound e offre un approccio alla concorrenza diverso rispetto ai thread e ai processi.

## Concetti Fondamentali

### Coroutine

Le coroutine sono funzioni speciali che possono essere sospese e riprese durante l'esecuzione. In Python, le coroutine sono definite utilizzando le parole chiave `async def`.

```python
import asyncio

async def saluta(nome):
    print(f"Inizio saluto a {nome}")
    await asyncio.sleep(1)  # Sospende la coroutine per 1 secondo
    print(f"Ciao, {nome}!")
    return f"Saluto a {nome} completato"
```

### Task

Un Task è un wrapper attorno a una coroutine che permette di eseguirla in modo concorrente con altre coroutine.

```python
import asyncio

async def main():
    # Creazione di task
    task1 = asyncio.create_task(saluta("Alice"))
    task2 = asyncio.create_task(saluta("Bob"))
    
    # Attesa del completamento dei task
    risultato1 = await task1
    risultato2 = await task2
    
    print(risultato1)
    print(risultato2)

# Esecuzione della coroutine principale
asyncio.run(main())
```

### Event Loop

L'event loop è il cuore di asyncio. Gestisce l'esecuzione delle coroutine, la pianificazione dei task e la gestione degli eventi di I/O.

```python
import asyncio

async def esempio():
    print("Inizio esempio")
    await asyncio.sleep(1)
    print("Fine esempio")

# Ottiene l'event loop corrente
loop = asyncio.get_event_loop()

# Esegue la coroutine fino al completamento
loop.run_until_complete(esempio())

# Chiude l'event loop
loop.close()
```

Nella maggior parte dei casi, è preferibile utilizzare `asyncio.run()` che gestisce automaticamente la creazione e la chiusura dell'event loop.

## Operazioni Asincrone Comuni

### Sleep Asincrono

```python
import asyncio
import time

async def operazione_lenta():
    print("Inizio operazione lenta")
    await asyncio.sleep(2)  # Non blocca l'event loop
    print("Fine operazione lenta")

async def operazione_veloce():
    print("Inizio operazione veloce")
    await asyncio.sleep(0.5)  # Non blocca l'event loop
    print("Fine operazione veloce")

async def main():
    inizio = time.time()
    
    # Esecuzione concorrente
    await asyncio.gather(operazione_lenta(), operazione_veloce())
    
    fine = time.time()
    print(f"Tempo totale: {fine - inizio:.2f} secondi")

asyncio.run(main())  # Output: Tempo totale: ~2 secondi (non 2.5)
```

### Gather

La funzione `asyncio.gather()` permette di eseguire più coroutine contemporaneamente e attendere che tutte siano completate.

```python
import asyncio

async def fetch_data(id):
    print(f"Inizio fetch dei dati {id}")
    await asyncio.sleep(1)  # Simulazione di una richiesta di rete
    print(f"Fine fetch dei dati {id}")
    return f"Dati {id}"

async def main():
    # Esecuzione concorrente di più coroutine
    risultati = await asyncio.gather(
        fetch_data(1),
        fetch_data(2),
        fetch_data(3)
    )
    
    print(risultati)  # ['Dati 1', 'Dati 2', 'Dati 3']

asyncio.run(main())
```

### Wait

La funzione `asyncio.wait()` offre un controllo più fine sull'attesa delle coroutine.

```python
import asyncio

async def task_con_timeout(id, durata):
    print(f"Task {id} iniziato")
    try:
        await asyncio.sleep(durata)
        print(f"Task {id} completato")
        return f"Risultato {id}"
    except asyncio.CancelledError:
        print(f"Task {id} cancellato")
        raise

async def main():
    # Creazione dei task
    tasks = [
        asyncio.create_task(task_con_timeout(1, 2)),
        asyncio.create_task(task_con_timeout(2, 3)),
        asyncio.create_task(task_con_timeout(3, 1))
    ]
    
    # Attesa con timeout
    done, pending = await asyncio.wait(tasks, timeout=2.5)
    
    print(f"Task completati: {len(done)}")
    print(f"Task in sospeso: {len(pending)}")
    
    # Cancellazione dei task in sospeso
    for task in pending:
        task.cancel()
    
    # Attesa del completamento o della cancellazione
    await asyncio.gather(*pending, return_exceptions=True)

asyncio.run(main())
```

### Timeout

È possibile impostare un timeout per le operazioni asincrone.

```python
import asyncio

async def operazione_lunga():
    print("Inizio operazione lunga")
    await asyncio.sleep(5)
    print("Fine operazione lunga")
    return "Risultato dell'operazione lunga"

async def main():
    try:
        # Imposta un timeout di 2 secondi
        risultato = await asyncio.wait_for(operazione_lunga(), timeout=2)
        print(risultato)
    except asyncio.TimeoutError:
        print("Operazione interrotta per timeout")

asyncio.run(main())
```

## Esempio Pratico: Web Scraping Asincrono

```python
import asyncio
import aiohttp
import time

async def fetch_url(session, url):
    print(f"Inizio fetch di {url}")
    async with session.get(url) as response:
        html = await response.text()
        print(f"Completato fetch di {url}: {len(html)} caratteri")
        return len(html)

async def main():
    urls = [
        "https://www.python.org",
        "https://docs.python.org",
        "https://pypi.org",
        "https://www.python.org/downloads/",
        "https://www.python.org/community/"
    ]
    
    inizio = time.time()
    
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        risultati = await asyncio.gather(*tasks)
    
    fine = time.time()
    
    print(f"Dimensioni totali: {sum(risultati)} caratteri")
    print(f"Tempo totale: {fine - inizio:.2f} secondi")

# Per eseguire questo esempio, è necessario installare aiohttp:
# pip install aiohttp

# asyncio.run(main())
```

## asyncio vs Threading vs Multiprocessing

| Caratteristica | asyncio | Threading | Multiprocessing |
|----------------|---------|-----------|----------------|
| Modello | Concorrenza cooperativa | Concorrenza preemptiva | Parallelismo |
| Overhead | Basso | Medio | Alto |
| Cambio di contesto | Esplicito (await) | Implicito | Processo separato |
| Utilizzo della CPU | Singolo thread | Limitato dal GIL | Multi-core |
| Uso ideale | I/O bound con molte connessioni | I/O bound con operazioni bloccanti | CPU bound |
| Debugging | Più semplice | Più complesso | Più complesso |

## Vantaggi di asyncio

1. **Efficienza**: Gestisce migliaia di connessioni con un singolo thread.
2. **Controllo**: Punti di yield espliciti con `await`.
3. **Debugging**: Traceback più chiari e meno problemi di race condition.
4. **Scalabilità**: Eccellente per applicazioni con molte connessioni simultanee.

## Limitazioni di asyncio

1. **Operazioni CPU bound**: Non adatto per calcoli intensivi (usare multiprocessing).
2. **Librerie bloccanti**: Le librerie standard di Python spesso non sono compatibili con asyncio.
3. **Complessità**: Richiede un cambio di paradigma nella scrittura del codice.

## Navigazione

- [Torna all'indice](../README.md)
- [Precedente: Sincronizzazione e comunicazione](04-sincronizzazione.md)
- [Prossimo: Pool di thread e processi](06-pool.md)