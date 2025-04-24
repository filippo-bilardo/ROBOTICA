# Context Manager e with Statement

La gestione delle risorse, come i file, è un aspetto cruciale della programmazione. In Python, i context manager e il costrutto `with` offrono un modo elegante e sicuro per gestire risorse che richiedono operazioni di inizializzazione e pulizia, come l'apertura e la chiusura dei file. In questa lezione, esploreremo come utilizzare questi strumenti per migliorare la gestione dei file.

## Problemi nella Gestione Tradizionale dei File

Prima di esaminare i context manager, ricordiamo come si gestiscono tradizionalmente i file in Python:

```python
# Approccio tradizionale
file = open("esempio.txt", "r")
try:
    contenuto = file.read()
    # Operazioni sul contenuto
finally:
    file.close()  # Assicura che il file venga chiuso anche in caso di eccezioni
```

Questo approccio presenta alcuni problemi:

1. **Verbosità**: Richiede molto codice boilerplate (try/finally)
2. **Propensione agli errori**: È facile dimenticare di chiudere il file, specialmente in codice complesso
3. **Leggibilità ridotta**: Il codice di gestione degli errori oscura la logica principale

## Il Costrutto `with` e i Context Manager

Python introduce il costrutto `with` e i context manager per risolvere questi problemi:

```python
# Approccio con with statement
with open("esempio.txt", "r") as file:
    contenuto = file.read()
    # Operazioni sul contenuto
# Il file viene chiuso automaticamente all'uscita dal blocco with
```

Vantaggi di questo approccio:

1. **Concisione**: Meno codice da scrivere
2. **Sicurezza**: Garantisce la chiusura del file anche in caso di eccezioni
3. **Leggibilità**: Separa chiaramente la gestione delle risorse dalla logica di business

### Come Funziona il Costrutto `with`

Il costrutto `with` funziona con oggetti che implementano il protocollo dei context manager, che consiste in due metodi speciali:

1. `__enter__()`: Chiamato all'inizio del blocco `with`; il suo valore di ritorno è assegnato alla variabile dopo `as`
2. `__exit__()`: Chiamato alla fine del blocco `with` (anche in caso di eccezioni); si occupa della pulizia delle risorse

## Utilizzo di `with` con i File

### Lettura di File

```python
# Lettura di un intero file
with open("file.txt", "r") as file:
    contenuto = file.read()
    print(contenuto)

# Lettura riga per riga
with open("file.txt", "r") as file:
    for linea in file:
        print(linea.strip())  # strip() rimuove i caratteri di newline
```

### Scrittura su File

```python
# Scrittura su un file
with open("output.txt", "w") as file:
    file.write("Prima riga\n")
    file.write("Seconda riga\n")

# Aggiunta a un file esistente
with open("output.txt", "a") as file:
    file.write("Terza riga aggiunta successivamente\n")
```

### Gestione di Più File Contemporaneamente

```python
# Apertura di più file in un unico blocco with
with open("input.txt", "r") as file_input, open("output.txt", "w") as file_output:
    for linea in file_input:
        # Elabora la linea (ad esempio, converti in maiuscolo)
        linea_elaborata = linea.upper()
        # Scrivi la linea elaborata nel file di output
        file_output.write(linea_elaborata)
```

## Creazione di Context Manager Personalizzati

Puoi creare i tuoi context manager personalizzati in due modi:

### 1. Utilizzando una Classe

```python
class GestoreFile:
    def __init__(self, nome_file, modalita):
        self.nome_file = nome_file
        self.modalita = modalita
        self.file = None
    
    def __enter__(self):
        self.file = open(self.nome_file, self.modalita)
        return self.file
    
    def __exit__(self, tipo_eccezione, valore_eccezione, traceback):
        if self.file:
            self.file.close()
        # Restituendo False, permettiamo alla possibile eccezione di propagarsi
        # Restituendo True, l'eccezione verrebbe soppressa
        return False

# Utilizzo del context manager personalizzato
with GestoreFile("esempio.txt", "r") as file:
    contenuto = file.read()
    print(contenuto)
```

### 2. Utilizzando il Decoratore `contextlib.contextmanager`

Il modulo `contextlib` fornisce strumenti per lavorare con i context manager, incluso il decoratore `contextmanager` che trasforma una funzione generatore in un context manager:

```python
from contextlib import contextmanager

@contextmanager
def gestione_file(nome_file, modalita):
    try:
        file = open(nome_file, modalita)
        yield file  # Questo è ciò che viene restituito dall'__enter__
    finally:
        file.close()  # Questo viene eseguito nell'__exit__

# Utilizzo del context manager basato su generatore
with gestione_file("esempio.txt", "r") as file:
    contenuto = file.read()
    print(contenuto)
```

## Altri Context Manager Utili

### `contextlib.suppress`

Sopprime specifiche eccezioni:

```python
from contextlib import suppress

# Sopprime l'eccezione FileNotFoundError
with suppress(FileNotFoundError):
    os.remove("file_che_potrebbe_non_esistere.txt")
    print("File eliminato")
# Se il file non esiste, non viene sollevata alcuna eccezione
```

### `contextlib.closing`

Assicura che un oggetto con un metodo `close()` venga chiuso:

```python
from contextlib import closing
from urllib.request import urlopen

# Assicura che la connessione venga chiusa
with closing(urlopen('https://www.example.com')) as pagina:
    contenuto = pagina.read()
    # Operazioni sul contenuto
```

### `tempfile.TemporaryFile`

Crea e gestisce file temporanei:

```python
import tempfile

# Crea un file temporaneo che viene eliminato automaticamente
with tempfile.TemporaryFile() as temp_file:
    temp_file.write(b"Dati temporanei\n")
    temp_file.seek(0)  # Torna all'inizio del file
    print(temp_file.read())  # Legge i dati scritti
# Il file temporaneo viene eliminato automaticamente
```

## Esempi Pratici

### Esempio 1: Logger Contestuale

```python
from contextlib import contextmanager
import time

@contextmanager
def timer(descrizione):
    """Context manager che misura il tempo di esecuzione di un blocco di codice."""
    inizio = time.time()
    try:
        yield
    finally:
        fine = time.time()
        print(f"{descrizione}: {fine - inizio:.4f} secondi")

# Utilizzo del timer contestuale
with timer("Elaborazione del file"):
    # Simulazione di un'operazione che richiede tempo
    with open("file_grande.txt", "r") as file:
        contenuto = file.read()
        # Elaborazione del contenuto
        time.sleep(1)  # Simulazione di elaborazione
```

### Esempio 2: Gestione di Connessioni al Database

```python
import sqlite3
from contextlib import contextmanager

@contextmanager
def connessione_db(database):
    """Context manager per la gestione di connessioni a database SQLite."""
    conn = sqlite3.connect(database)
    try:
        yield conn
    finally:
        conn.close()

# Utilizzo per operazioni sul database
with connessione_db("esempio.db") as conn:
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE IF NOT EXISTS utenti (id INTEGER PRIMARY KEY, nome TEXT)")
    cursor.execute("INSERT INTO utenti (nome) VALUES (?)", ("Mario Rossi",))
    conn.commit()
    
    # Query sul database
    cursor.execute("SELECT * FROM utenti")
    for riga in cursor.fetchall():
        print(riga)
```

### Esempio 3: Redirect dell'Output Standard

```python
import sys
from contextlib import contextmanager

@contextmanager
def redirect_stdout(nuovo_target):
    """Context manager per reindirizzare l'output standard a un file."""
    vecchio_target = sys.stdout
    try:
        sys.stdout = nuovo_target
        yield
    finally:
        sys.stdout = vecchio_target

# Utilizzo per catturare l'output in un file
with open("output_log.txt", "w") as file_log:
    with redirect_stdout(file_log):
        print("Questo testo verrà scritto nel file invece che sulla console")
        print("Altra riga di output")

# Verifica del contenuto del file
with open("output_log.txt", "r") as file_log:
    print("Contenuto del file di log:")
    print(file_log.read())
```

## Vantaggi dei Context Manager

1. **Gestione automatica delle risorse**: Garantiscono che le risorse vengano rilasciate correttamente
2. **Codice più pulito e leggibile**: Riducono il codice boilerplate e migliorano la leggibilità
3. **Gestione delle eccezioni**: Gestiscono correttamente le eccezioni senza interrompere la pulizia delle risorse
4. **Riutilizzabilità**: I context manager personalizzati possono essere riutilizzati in tutto il codice

## Conclusione

I context manager e il costrutto `with` sono strumenti potenti in Python che semplificano la gestione delle risorse, in particolare i file. Utilizzandoli, puoi scrivere codice più pulito, più sicuro e meno soggetto a errori.

Ricorda che, sebbene l'esempio più comune di context manager sia l'apertura di file, puoi creare context manager personalizzati per qualsiasi risorsa che richieda operazioni di inizializzazione e pulizia, come connessioni di rete, connessioni a database, lock di thread e molto altro.

Nella prossima lezione, esploreremo come lavorare con formati di file specifici come CSV e JSON, che sono comuni per lo scambio di dati strutturati.

---

[Indice](../README.md) | [Lezione Precedente: Operazioni su File e Directory](06_operazioni_file_directory.md) | [Prossima Lezione: Lavorare con File CSV e JSON](08_csv_json.md)