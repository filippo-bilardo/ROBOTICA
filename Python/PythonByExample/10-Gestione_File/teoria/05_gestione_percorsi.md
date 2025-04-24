# Gestione dei Percorsi con il Modulo os.path

La gestione corretta dei percorsi dei file è fondamentale per creare applicazioni robuste che funzionino su diversi sistemi operativi. Python offre il modulo `os.path` che fornisce funzioni per manipolare i percorsi dei file in modo indipendente dalla piattaforma. In questa lezione, esploreremo come utilizzare questo modulo per gestire i percorsi in modo efficace.

## Importanza della Gestione dei Percorsi

Una gestione corretta dei percorsi è essenziale per:

1. **Compatibilità tra sistemi operativi**: Windows usa backslash (`\`) come separatore di directory, mentre Unix/Linux/macOS usano forward slash (`/`)
2. **Robustezza**: Evitare errori quando i file si trovano in posizioni diverse
3. **Portabilità**: Garantire che il codice funzioni su diverse macchine e sistemi operativi
4. **Sicurezza**: Prevenire vulnerabilità come path traversal

## Il Modulo `os.path`

Il modulo `os.path` è parte della libreria standard di Python e fornisce funzioni per manipolare i percorsi dei file in modo indipendente dalla piattaforma.

```python
import os.path
```

### Funzioni Principali di `os.path`

#### 1. Costruzione di Percorsi

##### `os.path.join()` - Unire Componenti di Percorso

```python
import os.path

# Unisce componenti di percorso usando il separatore appropriato per il sistema operativo
percorso = os.path.join("cartella", "sottocartella", "file.txt")
print(percorso)  # Su Windows: cartella\sottocartella\file.txt
                 # Su Unix: cartella/sottocartella/file.txt

# Unire un percorso base con un percorso relativo
base = "/home/utente"
relativo = "documenti/file.txt"
percorso_completo = os.path.join(base, relativo)
print(percorso_completo)  # /home/utente/documenti/file.txt
```

##### `os.path.expanduser()` - Espandere la Home Directory

```python
# Espande il simbolo ~ nella home directory dell'utente
home_dir = os.path.expanduser("~")
print(home_dir)  # Es. /home/utente o C:\Users\utente

# Utile per accedere a file nella home directory
config_file = os.path.join(os.path.expanduser("~"), ".config", "app.conf")
print(config_file)
```

#### 2. Analisi di Percorsi

##### `os.path.basename()` - Ottenere il Nome del File

```python
# Restituisce l'ultimo componente del percorso (nome del file o directory)
nome_file = os.path.basename("/path/to/file.txt")
print(nome_file)  # file.txt

nome_dir = os.path.basename("/path/to/directory/")
print(nome_dir)  # directory o '' (dipende dal sistema)
```

##### `os.path.dirname()` - Ottenere la Directory

```python
# Restituisce la directory contenente il file/directory
directory = os.path.dirname("/path/to/file.txt")
print(directory)  # /path/to
```

##### `os.path.split()` - Dividere Percorso in Directory e Nome

```python
# Divide il percorso in una tupla (directory, nome_file)
directory, nome_file = os.path.split("/path/to/file.txt")
print(f"Directory: {directory}, Nome file: {nome_file}")
# Directory: /path/to, Nome file: file.txt
```

##### `os.path.splitext()` - Dividere Nome File ed Estensione

```python
# Divide il percorso in una tupla (radice, estensione)
radice, estensione = os.path.splitext("/path/to/file.txt")
print(f"Radice: {radice}, Estensione: {estensione}")
# Radice: /path/to/file, Estensione: .txt
```

#### 3. Informazioni sui Percorsi

##### `os.path.exists()` - Verificare l'Esistenza

```python
# Verifica se un percorso esiste
if os.path.exists("file.txt"):
    print("Il file esiste")
else:
    print("Il file non esiste")
```

##### `os.path.isfile()` - Verificare se è un File

```python
# Verifica se il percorso è un file regolare
if os.path.isfile("documento.txt"):
    print("È un file")
else:
    print("Non è un file o non esiste")
```

##### `os.path.isdir()` - Verificare se è una Directory

```python
# Verifica se il percorso è una directory
if os.path.isdir("cartella"):
    print("È una directory")
else:
    print("Non è una directory o non esiste")
```

##### `os.path.getsize()` - Ottenere la Dimensione

```python
# Restituisce la dimensione del file in byte
try:
    dimensione = os.path.getsize("file.txt")
    print(f"Dimensione: {dimensione} byte")
except OSError as e:
    print(f"Errore: {e}")
```

##### `os.path.getmtime()` - Ottenere la Data di Modifica

```python
import time

# Restituisce il timestamp dell'ultima modifica
try:
    timestamp = os.path.getmtime("file.txt")
    data_modifica = time.ctime(timestamp)
    print(f"Ultima modifica: {data_modifica}")
except OSError as e:
    print(f"Errore: {e}")
```

#### 4. Manipolazione di Percorsi

##### `os.path.abspath()` - Ottenere il Percorso Assoluto

```python
# Converte un percorso relativo in assoluto
percorso_assoluto = os.path.abspath("file.txt")
print(percorso_assoluto)  # Es. /home/utente/progetti/file.txt
```

##### `os.path.relpath()` - Ottenere il Percorso Relativo

```python
# Calcola il percorso relativo da una directory di partenza
percorso_relativo = os.path.relpath("/home/utente/progetti/file.txt", "/home/utente")
print(percorso_relativo)  # progetti/file.txt
```

##### `os.path.normpath()` - Normalizzare un Percorso

```python
# Normalizza un percorso rimuovendo elementi ridondanti
percorso_normalizzato = os.path.normpath("cartella/../altra_cartella/./file.txt")
print(percorso_normalizzato)  # altra_cartella/file.txt
```

## Il Modulo `pathlib` (Python 3.4+)

A partire da Python 3.4, è disponibile il modulo `pathlib` che offre un approccio orientato agli oggetti per la gestione dei percorsi, più moderno e potente rispetto a `os.path`.

```python
from pathlib import Path
```

### Vantaggi di `pathlib`

1. **Sintassi più chiara e intuitiva**
2. **Operazioni concatenabili**
3. **Metodi per operazioni comuni sui file**
4. **Supporto per l'operatore `/` per unire percorsi**

### Esempi di Utilizzo di `pathlib`

```python
from pathlib import Path

# Creazione di oggetti Path
home = Path.home()  # Home directory
file_path = Path("documenti") / "file.txt"  # Unione di percorsi con /

# Informazioni sul percorso
print(file_path.name)       # file.txt
print(file_path.stem)       # file
print(file_path.suffix)     # .txt
print(file_path.parent)     # documenti

# Verifica dell'esistenza
if file_path.exists():
    print("Il file esiste")

# Percorsi assoluti e relativi
print(file_path.absolute())  # Percorso assoluto
print(file_path.relative_to(Path.cwd()))  # Percorso relativo

# Iterazione su file in una directory
for file in Path(".").glob("*.txt"):
    print(file)
```

## Esempi Pratici

### Esempio 1: Trovare Tutti i File di un Certo Tipo

```python
import os
import os.path

def trova_file_per_estensione(directory, estensione):
    """Trova tutti i file con una determinata estensione in una directory e sottodirectory."""
    file_trovati = []
    
    # Assicurati che l'estensione inizi con un punto
    if not estensione.startswith("."):
        estensione = "." + estensione
    
    # Cammina attraverso la directory e le sottodirectory
    for cartella_corrente, sottocartelle, files in os.walk(directory):
        for file in files:
            if file.endswith(estensione):
                percorso_completo = os.path.join(cartella_corrente, file)
                file_trovati.append(percorso_completo)
    
    return file_trovati

# Utilizzo della funzione
file_python = trova_file_per_estensione(".", ".py")
print(f"Trovati {len(file_python)} file Python:")
for file in file_python:
    print(file)
```

### Esempio 2: Organizzare File per Data di Modifica

```python
import os
import os.path
import time
import shutil
from datetime import datetime

def organizza_per_data(directory_origine, directory_destinazione):
    """Organizza i file in sottocartelle basate sulla data di modifica."""
    # Assicurati che la directory di destinazione esista
    if not os.path.exists(directory_destinazione):
        os.makedirs(directory_destinazione)
    
    # Itera su tutti i file nella directory di origine
    for nome_file in os.listdir(directory_origine):
        percorso_file = os.path.join(directory_origine, nome_file)
        
        # Salta le directory
        if not os.path.isfile(percorso_file):
            continue
        
        # Ottieni la data di modifica
        timestamp = os.path.getmtime(percorso_file)
        data = datetime.fromtimestamp(timestamp)
        nome_cartella = data.strftime("%Y-%m-%d")
        
        # Crea la cartella di destinazione se non esiste
        cartella_destinazione = os.path.join(directory_destinazione, nome_cartella)
        if not os.path.exists(cartella_destinazione):
            os.makedirs(cartella_destinazione)
        
        # Copia il file nella cartella appropriata
        shutil.copy2(percorso_file, os.path.join(cartella_destinazione, nome_file))
        print(f"Copiato {nome_file} in {nome_cartella}/")

# Utilizzo della funzione
organizza_per_data("documenti", "documenti_organizzati")
```

### Esempio 3: Backup Incrementale

```python
import os
import os.path
import shutil
import time

def backup_incrementale(directory_origine, directory_backup):
    """Crea un backup incrementale: copia solo i file nuovi o modificati."""
    # Assicurati che la directory di backup esista
    if not os.path.exists(directory_backup):
        os.makedirs(directory_backup)
    
    # Conta i file copiati
    file_copiati = 0
    
    # Cammina attraverso la directory di origine
    for cartella_corrente, sottocartelle, files in os.walk(directory_origine):
        # Calcola il percorso relativo
        percorso_relativo = os.path.relpath(cartella_corrente, directory_origine)
        
        # Crea la struttura delle directory nel backup
        cartella_backup = os.path.join(directory_backup, percorso_relativo)
        if not os.path.exists(cartella_backup):
            os.makedirs(cartella_backup)
        
        # Copia i file nuovi o modificati
        for file in files:
            file_origine = os.path.join(cartella_corrente, file)
            file_backup = os.path.join(cartella_backup, file)
            
            # Verifica se il file deve essere copiato
            copia_file = False
            if not os.path.exists(file_backup):
                copia_file = True  # File nuovo
            elif os.path.getmtime(file_origine) > os.path.getmtime(file_backup):
                copia_file = True  # File modificato
            
            if copia_file:
                shutil.copy2(file_origine, file_backup)
                file_copiati += 1
                print(f"Copiato: {file_origine}")
    
    print(f"Backup completato. {file_copiati} file copiati.")
    return file_copiati

# Utilizzo della funzione
backup_incrementale("progetti", "backup_progetti")
```

## Conclusione

La gestione corretta dei percorsi dei file è fondamentale per creare applicazioni robuste e portabili. Il modulo `os.path` offre funzioni essenziali per manipolare i percorsi in modo indipendente dalla piattaforma, mentre il modulo più recente `pathlib` fornisce un'interfaccia orientata agli oggetti più moderna e potente.

Ricorda di:

1. Utilizzare `os.path.join()` o l'operatore `/` di `pathlib` per unire componenti di percorso
2. Verificare l'esistenza di file e directory prima di operare su di essi
3. Utilizzare percorsi relativi quando possibile per migliorare la portabilità
4. Considerare l'uso di `pathlib` per un codice più moderno e leggibile

Nella prossima lezione, esploreremo le operazioni su file e directory con i moduli `os` e `shutil`.

---

[Indice](../README.md) | [Lezione Precedente: Scrittura su File](04_scrittura_file.md) | [Prossima Lezione: Operazioni su File e Directory](06_operazioni_file_directory.md)