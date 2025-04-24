# Introduzione alla Programmazione Concorrente

La programmazione concorrente è un paradigma che permette l'esecuzione di più parti di un programma simultaneamente. In Python, esistono diverse modalità per implementare la concorrenza, ognuna con i propri vantaggi e casi d'uso specifici.

## Concorrenza vs Parallelismo

**Concorrenza**: Si riferisce alla capacità di gestire più attività che progrediscono contemporaneamente, anche se non necessariamente eseguite nello stesso istante.

**Parallelismo**: Si riferisce all'esecuzione simultanea di più attività, tipicamente su core o processori diversi.

```
Concorrenza: Gestire più cose contemporaneamente
Parallelismo: Fare più cose contemporaneamente
```

## Modelli di Concorrenza in Python

Python offre diversi modelli per implementare la concorrenza:

1. **Threading**: Utilizza i thread per eseguire più parti di codice in modo concorrente all'interno dello stesso processo.

2. **Multiprocessing**: Utilizza processi separati per eseguire codice in parallelo, aggirando il GIL (Global Interpreter Lock).

3. **Async/Await**: Utilizza la programmazione asincrona per gestire operazioni concorrenti senza bloccare il thread principale.

## Il Global Interpreter Lock (GIL)

Il GIL è un meccanismo in CPython (l'implementazione standard di Python) che impedisce a più thread nativi di eseguire codice Python contemporaneamente. Questo significa che:

- I thread in Python sono utili principalmente per operazioni di I/O bound (come richieste di rete o operazioni su file).
- Per operazioni CPU bound (calcoli intensivi), il multiprocessing è generalmente più efficace.

## Quando Usare la Concorrenza

### Operazioni I/O Bound

Se il programma passa molto tempo in attesa di operazioni di I/O (come richieste di rete, lettura/scrittura su disco), la concorrenza può migliorare significativamente le prestazioni.

```python
# Esempio di operazione I/O bound
import requests

def download_site(url):
    response = requests.get(url)
    return response.text

# Questa operazione può beneficiare della concorrenza
```

### Operazioni CPU Bound

Se il programma esegue calcoli intensivi, il multiprocessing può sfruttare più core della CPU.

```python
# Esempio di operazione CPU bound
def calcola_fibonacci(n):
    if n <= 1:
        return n
    return calcola_fibonacci(n-1) + calcola_fibonacci(n-2)

# Questa operazione può beneficiare del multiprocessing
```

## Considerazioni sulla Concorrenza

- **Complessità**: La programmazione concorrente introduce complessità aggiuntiva nel codice.
- **Debugging**: Il debugging di programmi concorrenti può essere più difficile.
- **Race Conditions**: Possono verificarsi problemi di sincronizzazione quando più thread o processi accedono alle stesse risorse.
- **Overhead**: L'avvio di thread o processi comporta un certo overhead.

## Riepilogo

La programmazione concorrente è uno strumento potente per migliorare le prestazioni delle applicazioni Python, ma richiede una comprensione approfondita dei concetti e dei potenziali problemi. Nei prossimi capitoli, esploreremo in dettaglio i diversi approcci alla concorrenza in Python.

## Navigazione

- [Torna all'indice](../README.md)
- [Prossimo: Thread in Python](02-thread.md)