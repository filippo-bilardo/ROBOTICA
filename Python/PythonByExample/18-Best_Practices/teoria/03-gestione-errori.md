# Gestione degli Errori in Python

In questa guida esploreremo le migliori pratiche per la gestione degli errori in Python, un aspetto fondamentale per creare software robusto e affidabile.

## Importanza della gestione degli errori

Una corretta gestione degli errori è essenziale per diversi motivi:

- Previene crash imprevisti dell'applicazione
- Migliora l'esperienza utente fornendo messaggi di errore comprensibili
- Facilita il debug e la manutenzione del codice
- Aumenta la robustezza e l'affidabilità del software
- Permette di gestire situazioni eccezionali in modo controllato

## Il sistema di eccezioni in Python

Python utilizza le eccezioni come meccanismo principale per la gestione degli errori. Un'eccezione è un evento che si verifica durante l'esecuzione di un programma e che interrompe il normale flusso di istruzioni.

### Gerarchia delle eccezioni

Le eccezioni in Python sono organizzate in una gerarchia di classi che derivano dalla classe base `BaseException`.

```
BaseException
 ├── SystemExit
 ├── KeyboardInterrupt
 ├── GeneratorExit
 └── Exception
      ├── StopIteration
      ├── ArithmeticError
      │    ├── FloatingPointError
      │    ├── OverflowError
      │    └── ZeroDivisionError
      ├── AssertionError
      ├── AttributeError
      ├── BufferError
      ├── EOFError
      ├── ImportError
      │    └── ModuleNotFoundError
      ├── LookupError
      │    ├── IndexError
      │    └── KeyError
      ├── MemoryError
      ├── NameError
      │    └── UnboundLocalError
      ├── OSError
      │    ├── BlockingIOError
      │    ├── ChildProcessError
      │    ├── ConnectionError
      │    │    ├── BrokenPipeError
      │    │    ├── ConnectionAbortedError
      │    │    ├── ConnectionRefusedError
      │    │    └── ConnectionResetError
      │    ├── FileExistsError
      │    ├── FileNotFoundError
      │    ├── InterruptedError
      │    ├── IsADirectoryError
      │    ├── NotADirectoryError
      │    ├── PermissionError
      │    ├── ProcessLookupError
      │    └── TimeoutError
      ├── ReferenceError
      ├── RuntimeError
      │    ├── NotImplementedError
      │    └── RecursionError
      ├── SyntaxError
      │    └── IndentationError
      │         └── TabError
      ├── SystemError
      ├── TypeError
      ├── ValueError
      │    └── UnicodeError
      │         ├── UnicodeDecodeError
      │         ├── UnicodeEncodeError
      │         └── UnicodeTranslateError
      └── Warning
           ├── DeprecationWarning
           ├── PendingDeprecationWarning
           ├── RuntimeWarning
           ├── SyntaxWarning
           ├── UserWarning
           ├── FutureWarning
           ├── ImportWarning
           ├── UnicodeWarning
           ├── BytesWarning
           └── ResourceWarning
```

## Blocchi try-except-else-finally

Python fornisce una sintassi completa per la gestione delle eccezioni attraverso i blocchi `try-except-else-finally`.

### Struttura di base

```python
try:
    # Codice che potrebbe generare un'eccezione
    risultato = 10 / numero
except ZeroDivisionError:
    # Gestione dell'eccezione specifica
    print("Errore: Divisione per zero!")
except (TypeError, ValueError) as e:
    # Gestione di più eccezioni con accesso all'oggetto eccezione
    print(f"Errore di tipo o valore: {e}")
except Exception as e:
    # Gestione di qualsiasi altra eccezione
    print(f"Si è verificato un errore imprevisto: {e}")
else:
    # Eseguito solo se non si verificano eccezioni nel blocco try
    print(f"Il risultato è {risultato}")
finally:
    # Eseguito sempre, indipendentemente dalle eccezioni
    print("Operazione completata")
```

### Quando usare ciascun blocco

- **try**: Contiene il codice che potrebbe generare un'eccezione
- **except**: Gestisce specifiche eccezioni che possono verificarsi nel blocco try
- **else**: Eseguito solo se non si verificano eccezioni nel blocco try
- **finally**: Eseguito sempre, indipendentemente dal verificarsi di eccezioni

## Sollevare eccezioni

Puoi sollevare eccezioni esplicitamente usando l'istruzione `raise`.

```python
def verifica_eta(eta):
    if not isinstance(eta, int):
        raise TypeError("L'età deve essere un numero intero")
    if eta < 0:
        raise ValueError("L'età non può essere negativa")
    if eta > 120:
        raise ValueError("L'età inserita sembra non valida")
    return True

try:
    verifica_eta("trenta")
except (TypeError, ValueError) as e:
    print(f"Errore nella verifica dell'età: {e}")
```

## Creare eccezioni personalizzate

Puoi definire le tue eccezioni personalizzate creando sottoclassi di `Exception`.

```python
class ErroreValidazioneUtente(Exception):
    """Eccezione sollevata per errori nella validazione dei dati utente."""
    pass

class ErrorePasswordDebole(ErroreValidazioneUtente):
    """Eccezione sollevata quando la password non soddisfa i requisiti minimi."""
    def __init__(self, password, message="La password non soddisfa i requisiti di sicurezza"):
        self.password = password
        self.message = message
        super().__init__(self.message)
    
    def __str__(self):
        return f"{self.message}: {self.password[:2]}{'*' * (len(self.password) - 2)}"

def valida_password(password):
    if len(password) < 8:
        raise ErrorePasswordDebole(password, "La password è troppo corta")
    if not any(c.isdigit() for c in password):
        raise ErrorePasswordDebole(password, "La password deve contenere almeno un numero")
    if not any(c.isupper() for c in password):
        raise ErrorePasswordDebole(password, "La password deve contenere almeno una lettera maiuscola")
    return True
```

## Migliori pratiche per la gestione degli errori

### 1. Sii specifico nelle eccezioni catturate

Evita di catturare tutte le eccezioni con `except:` o `except Exception:` a meno che non sia assolutamente necessario. Cattura solo le eccezioni che puoi gestire in modo appropriato.

```python
# Scorretto
try:
    dati = carica_file(percorso)
except:
    print("Si è verificato un errore")

# Corretto
try:
    dati = carica_file(percorso)
except FileNotFoundError:
    print(f"Il file {percorso} non esiste")
except PermissionError:
    print(f"Non hai i permessi per accedere al file {percorso}")
except Exception as e:
    print(f"Errore imprevisto durante il caricamento del file: {e}")
```

### 2. Non ignorare le eccezioni

Evita di catturare eccezioni senza gestirle adeguatamente.

```python
# Scorretto
try:
    risultato = operazione_rischiosa()
except Exception:
    pass  # Ignora l'errore

# Corretto
try:
    risultato = operazione_rischiosa()
except Exception as e:
    logger.error(f"Errore durante l'operazione: {e}")
    # Gestisci l'errore in modo appropriato
```

### 3. Usa il blocco finally per le operazioni di pulizia

Utilizza il blocco `finally` per eseguire operazioni di pulizia che devono essere eseguite indipendentemente dal verificarsi di eccezioni.

```python
file = None
try:
    file = open("dati.txt", "r")
    contenuto = file.read()
    # Elabora il contenuto
except FileNotFoundError:
    print("Il file non esiste")
finally:
    if file is not None:
        file.close()
```

### 4. Utilizza i context manager (with)

I context manager semplificano la gestione delle risorse e garantiscono che le operazioni di pulizia vengano eseguite correttamente.

```python
# Equivalente al codice precedente, ma più pulito e sicuro
try:
    with open("dati.txt", "r") as file:
        contenuto = file.read()
        # Elabora il contenuto
except FileNotFoundError:
    print("Il file non esiste")
```

### 5. Registra le eccezioni

Utilizza un sistema di logging per registrare le eccezioni, specialmente in ambienti di produzione.

```python
import logging

logging.basicConfig(filename='app.log', level=logging.ERROR)

try:
    # Codice che potrebbe generare un'eccezione
    risultato = funzione_complessa()
except Exception as e:
    logging.error(f"Si è verificato un errore: {e}", exc_info=True)
    # Gestisci l'errore
```

### 6. Rilanciare eccezioni

A volte è utile catturare un'eccezione, eseguire alcune operazioni e poi rilanciarla.

```python
try:
    dati = elabora_dati(input_utente)
except ValueError as e:
    logger.warning(f"Input non valido: {e}")
    # Pulizia o altre operazioni
    raise  # Rilancia l'eccezione originale
```

### 7. Trasformare le eccezioni

Puoi catturare un'eccezione e sollevarne un'altra più specifica o più appropriata per il contesto.

```python
try:
    risultato = api_esterna.richiesta(parametri)
except ConnectionError as e:
    raise ErroreServizioNonDisponibile(f"Impossibile connettersi al servizio: {e}") from e
```

L'uso di `from e` mantiene il traceback dell'eccezione originale, facilitando il debug.

## Gestione degli errori in contesti specifici

### API e interfacce utente

Nelle API e nelle interfacce utente, è importante fornire messaggi di errore chiari e utili.

```python
def api_crea_utente(dati):
    try:
        # Validazione e creazione dell'utente
        return {"success": True, "user_id": nuovo_id}
    except ErroreValidazioneUtente as e:
        return {"success": False, "error": "validation_error", "message": str(e)}
    except DatabaseError as e:
        logger.error(f"Errore database: {e}")
        return {"success": False, "error": "database_error", "message": "Errore interno del server"}
    except Exception as e:
        logger.critical(f"Errore imprevisto: {e}", exc_info=True)
        return {"success": False, "error": "internal_error", "message": "Si è verificato un errore imprevisto"}
```

### Multithreading e asincronia

Nella programmazione concorrente, la gestione degli errori richiede attenzione particolare.

```python
import threading
import concurrent.futures

def task_thread():
    try:
        # Operazioni del thread
        return risultato
    except Exception as e:
        logger.error(f"Errore nel thread: {e}")
        return None

# Usando ThreadPoolExecutor
with concurrent.futures.ThreadPoolExecutor() as executor:
    future = executor.submit(task_rischiosa)
    try:
        risultato = future.result(timeout=10)  # Attendi il risultato con timeout
    except concurrent.futures.TimeoutError:
        print("L'operazione ha impiegato troppo tempo")
    except Exception as e:
        print(f"L'operazione ha generato un errore: {e}")
```

### Gestione degli errori in codice asincrono

```python
import asyncio

async def task_asincrona():
    try:
        # Operazioni asincrone
        return risultato
    except Exception as e:
        logger.error(f"Errore nella task asincrona: {e}")
        return None

async def main():
    try:
        risultato = await asyncio.wait_for(task_asincrona(), timeout=5.0)
    except asyncio.TimeoutError:
        print("L'operazione asincrona ha impiegato troppo tempo")
    except Exception as e:
        print(f"Errore durante l'esecuzione asincrona: {e}")
```

## Debugging con eccezioni

### Traceback

Il traceback di un'eccezione fornisce informazioni preziose per il debugging.

```python
import traceback

try:
    # Codice che genera un'eccezione
    risultato = funzione_problematica()
except Exception as e:
    print(f"Si è verificato un errore: {e}")
    traceback.print_exc()  # Stampa il traceback completo
    
    # Oppure salvalo in una stringa
    error_traceback = traceback.format_exc()
    logger.error(f"Dettagli errore:\n{error_traceback}")
```

### Asserzioni

Le asserzioni sono utili per il debugging e per verificare che le condizioni attese siano soddisfatte.

```python
def calcola_area_rettangolo(larghezza, altezza):
    assert larghezza > 0, "La larghezza deve essere positiva"
    assert altezza > 0, "L'altezza deve essere positiva"
    return larghezza * altezza
```

Nota: le asserzioni vengono ignorate quando Python viene eseguito con l'opzione `-O` (ottimizzazione), quindi non utilizzarle per la validazione dei dati in produzione.

## Conclusione

Una gestione efficace degli errori è fondamentale per creare software Python robusto e affidabile. Seguendo le migliori pratiche presentate in questa guida, potrai:

- Prevenire crash imprevisti dell'applicazione
- Fornire feedback utili agli utenti quando si verificano problemi
- Facilitare il debug e la manutenzione del codice
- Gestire situazioni eccezionali in modo controllato

Ricorda che la gestione degli errori non è un'aggiunta opzionale al tuo codice, ma una parte essenziale di qualsiasi applicazione di qualità professionale.

## Risorse aggiuntive

- [Documentazione ufficiale Python sulle eccezioni](https://docs.python.org/3/tutorial/errors.html)
- [PEP 343 - The "with" Statement](https://www.python.org/dev/peps/pep-0343/)
- [Logging HOWTO](https://docs.python.org/3/howto/logging.html)

## Esercizi

1. Scrivi una funzione che legga un file JSON e gestisca in modo appropriato tutte le possibili eccezioni (file non trovato, JSON non valido, ecc.).
2. Crea una gerarchia di eccezioni personalizzate per un'applicazione di gestione bancaria.
3. Modifica un codice esistente per utilizzare i context manager invece della gestione manuale delle risorse.
4. Implementa un sistema di logging che registri le eccezioni in un file e invii notifiche per errori critici.
5. Scrivi una funzione che esegua una richiesta HTTP e gestisca in modo appropriato tutti i possibili errori di rete.

---

[Torna all'indice](../README.md) | [Prossima guida: Testing e qualità del codice](04-testing-qualita-codice.md)