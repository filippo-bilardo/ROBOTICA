# Operazioni su File e Directory con i Moduli os e shutil

Oltre alla gestione dei percorsi, Python offre potenti strumenti per manipolare file e directory attraverso i moduli `os` e `shutil`. Questi moduli consentono di eseguire operazioni come creare, spostare, copiare ed eliminare file e directory, nonché ottenere informazioni dettagliate su di essi. In questa lezione, esploreremo le funzionalità principali di questi moduli.

## Il Modulo `os`

Il modulo `os` fornisce funzioni per interagire con il sistema operativo, incluse numerose operazioni su file e directory.

```python
import os
```

### Operazioni su Directory

#### Creazione di Directory

```python
# Creare una singola directory
os.mkdir("nuova_directory")

# Creare una gerarchia di directory (incluse directory intermedie)
os.makedirs("directory/sottodirectory/altra_directory", exist_ok=True)
# Il parametro exist_ok=True evita errori se la directory esiste già (Python 3.2+)
```

#### Elencare Contenuti di una Directory

```python
# Ottenere un elenco di file e directory in una directory
contenuti = os.listdir("percorso/alla/directory")
print(contenuti)  # Restituisce una lista di nomi di file e directory

# Iterare sui contenuti
for elemento in os.listdir("percorso/alla/directory"):
    percorso_completo = os.path.join("percorso/alla/directory", elemento)
    if os.path.isfile(percorso_completo):
        print(f"{elemento} è un file")
    elif os.path.isdir(percorso_completo):
        print(f"{elemento} è una directory")
```

#### Cambiare la Directory Corrente

```python
# Ottenere la directory di lavoro corrente
directory_corrente = os.getcwd()
print(f"Directory corrente: {directory_corrente}")

# Cambiare la directory di lavoro
os.chdir("/percorso/alla/nuova/directory")
print(f"Nuova directory corrente: {os.getcwd()}")
```

#### Rimozione di Directory

```python
# Rimuovere una directory vuota
os.rmdir("directory_vuota")

# Rimuovere una directory e tutto il suo contenuto (pericoloso!)
import shutil
shutil.rmtree("directory_da_eliminare", ignore_errors=True)
# ignore_errors=True ignora gli errori durante l'eliminazione
```

### Operazioni su File

#### Rinominare File e Directory

```python
# Rinominare un file o una directory
os.rename("vecchio_nome.txt", "nuovo_nome.txt")

# Spostare un file in una directory diversa
os.rename("file.txt", "nuova_directory/file.txt")
```

#### Eliminare File

```python
# Eliminare un file
os.remove("file_da_eliminare.txt")

# Verificare prima se il file esiste
if os.path.exists("file.txt"):
    os.remove("file.txt")
    print("File eliminato con successo")
else:
    print("Il file non esiste")
```

#### Ottenere Informazioni sui File

```python
# Ottenere statistiche dettagliate su un file
stat_info = os.stat("file.txt")
print(f"Dimensione: {stat_info.st_size} byte")
print(f"Ultima modifica: {stat_info.st_mtime}")
print(f"Permessi: {stat_info.st_mode}")

# Convertire il timestamp in una data leggibile
import time
data_modifica = time.ctime(stat_info.st_mtime)
print(f"Ultima modifica: {data_modifica}")
```

### Attraversare una Gerarchia di Directory

Il metodo `os.walk()` è estremamente utile per attraversare ricorsivamente una struttura di directory:

```python
import os

def esplora_directory(directory):
    """Esplora ricorsivamente una directory e stampa tutti i file e le sottodirectory."""
    print(f"Esplorazione di: {directory}")
    
    # os.walk restituisce una tupla (dirpath, dirnames, filenames) per ogni directory
    for dirpath, dirnames, filenames in os.walk(directory):
        print(f"\nDirectory corrente: {dirpath}")
        
        print("Sottodirectory:")
        for dirname in dirnames:
            print(f"  {dirname}")
        
        print("File:")
        for filename in filenames:
            percorso_completo = os.path.join(dirpath, filename)
            dimensione = os.path.getsize(percorso_completo)
            print(f"  {filename} ({dimensione} byte)")

# Utilizzo della funzione
esplora_directory("./progetti")
```

## Il Modulo `shutil`

Il modulo `shutil` (shell utilities) fornisce funzioni di alto livello per operazioni su file e directory, come copia e rimozione.

```python
import shutil
```

### Copia di File

```python
# Copiare un file (sovrascrive la destinazione se esiste)
shutil.copy("origine.txt", "destinazione.txt")

# Copiare un file preservando i metadati (permessi, timestamp, ecc.)
shutil.copy2("origine.txt", "destinazione.txt")

# Copiare solo il contenuto di un file (equivalente a origine -> destinazione)
shutil.copyfile("origine.txt", "destinazione.txt")
```

### Copia di Directory

```python
# Copiare una directory e tutto il suo contenuto
shutil.copytree("directory_origine", "directory_destinazione")

# Copiare con gestione degli errori
from shutil import copytree, ignore_patterns

# Ignora file Python compilati e directory __pycache__
copytree("progetto_origine", "progetto_destinazione", 
         ignore=ignore_patterns("*.pyc", "__pycache__"))
```

### Spostamento di File e Directory

```python
# Spostare un file o una directory (simile a os.rename ma più potente)
shutil.move("origine.txt", "destinazione/nuova_posizione.txt")

# Spostare una directory
shutil.move("directory_origine", "directory_destinazione")
```

### Eliminazione di Directory

```python
# Eliminare una directory e tutto il suo contenuto
shutil.rmtree("directory_da_eliminare")

# Eliminare con gestione degli errori
shutil.rmtree("directory_da_eliminare", ignore_errors=True)

# Eliminare con una funzione di gestione degli errori personalizzata
def gestione_errore(funzione, percorso, info):
    print(f"Errore durante l'eliminazione di {percorso}: {info}")

shutil.rmtree("directory_da_eliminare", onerror=gestione_errore)
```

### Operazioni di Archiviazione

```python
# Creare un archivio ZIP
shutil.make_archive("nome_archivio", "zip", "directory_da_archiviare")

# Creare un archivio TAR compresso con gzip
shutil.make_archive("nome_archivio", "gztar", "directory_da_archiviare")

# Estrarre un archivio
shutil.unpack_archive("archivio.zip", "directory_destinazione")
```

## Esempi Pratici

### Esempio 1: Backup di una Directory

```python
import os
import shutil
import time

def backup_directory(directory_origine, directory_backup=None):
    """Crea un backup di una directory con timestamp nel nome."""
    # Se non è specificata una directory di backup, ne crea una nella directory corrente
    if directory_backup is None:
        directory_backup = os.getcwd()
    
    # Ottiene il nome della directory di origine
    nome_directory = os.path.basename(os.path.normpath(directory_origine))
    
    # Crea un nome per il backup con timestamp
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    nome_backup = f"{nome_directory}_backup_{timestamp}"
    percorso_backup = os.path.join(directory_backup, nome_backup)
    
    # Crea il backup
    print(f"Creazione backup di {directory_origine} in {percorso_backup}")
    shutil.copytree(directory_origine, percorso_backup)
    print("Backup completato con successo!")
    
    return percorso_backup

# Utilizzo della funzione
try:
    backup = backup_directory("./progetti/progetto_importante")
    print(f"Backup creato in: {backup}")
except Exception as e:
    print(f"Errore durante il backup: {e}")
```

### Esempio 2: Pulizia di File Temporanei

```python
import os
import time

def pulisci_file_temporanei(directory, estensioni=None, giorni_vecchi=7):
    """Elimina file temporanei più vecchi di un certo numero di giorni."""
    if estensioni is None:
        estensioni = [".tmp", ".temp", ".bak"]
    
    # Calcola il timestamp limite
    tempo_corrente = time.time()
    limite_tempo = tempo_corrente - (giorni_vecchi * 24 * 60 * 60)
    
    file_eliminati = 0
    
    # Attraversa la directory e le sottodirectory
    for dirpath, _, filenames in os.walk(directory):
        for filename in filenames:
            # Verifica se il file ha un'estensione temporanea
            if any(filename.endswith(ext) for ext in estensioni):
                percorso_file = os.path.join(dirpath, filename)
                
                # Verifica l'età del file
                tempo_modifica = os.path.getmtime(percorso_file)
                if tempo_modifica < limite_tempo:
                    try:
                        os.remove(percorso_file)
                        file_eliminati += 1
                        print(f"Eliminato: {percorso_file}")
                    except Exception as e:
                        print(f"Errore durante l'eliminazione di {percorso_file}: {e}")
    
    print(f"Pulizia completata. {file_eliminati} file eliminati.")
    return file_eliminati

# Utilizzo della funzione
try:
    pulisci_file_temporanei("./downloads", giorni_vecchi=30)
except Exception as e:
    print(f"Errore durante la pulizia: {e}")
```

### Esempio 3: Organizzazione di File per Tipo

```python
import os
import shutil

def organizza_per_tipo(directory_origine):
    """Organizza i file in sottodirectory in base alla loro estensione."""
    # Mappa delle estensioni comuni
    tipi_file = {
        "Immagini": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"],
        "Documenti": [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"],
        "Video": [".mp4", ".avi", ".mov", ".mkv", ".wmv"],
        "Audio": [".mp3", ".wav", ".ogg", ".flac", ".aac"],
        "Archivi": [".zip", ".rar", ".tar", ".gz", ".7z"],
        "Codice": [".py", ".js", ".html", ".css", ".java", ".c", ".cpp"]
    }
    
    # Crea le sottodirectory se non esistono
    for tipo in tipi_file:
        directory_tipo = os.path.join(directory_origine, tipo)
        if not os.path.exists(directory_tipo):
            os.mkdir(directory_tipo)
    
    # Crea una directory "Altri" per i file non categorizzati
    directory_altri = os.path.join(directory_origine, "Altri")
    if not os.path.exists(directory_altri):
        os.mkdir(directory_altri)
    
    # Conta i file spostati
    conteggio = {tipo: 0 for tipo in tipi_file}
    conteggio["Altri"] = 0
    
    # Itera sui file nella directory di origine
    for filename in os.listdir(directory_origine):
        percorso_file = os.path.join(directory_origine, filename)
        
        # Salta le directory
        if os.path.isdir(percorso_file):
            continue
        
        # Determina il tipo di file in base all'estensione
        _, estensione = os.path.splitext(filename)
        estensione = estensione.lower()
        
        # Trova la categoria appropriata
        categoria_trovata = False
        for tipo, estensioni in tipi_file.items():
            if estensione in estensioni:
                directory_destinazione = os.path.join(directory_origine, tipo)
                categoria_trovata = True
                conteggio[tipo] += 1
                break
        
        # Se nessuna categoria corrisponde, sposta in "Altri"
        if not categoria_trovata:
            directory_destinazione = directory_altri
            conteggio["Altri"] += 1
        
        # Sposta il file
        try:
            shutil.move(percorso_file, os.path.join(directory_destinazione, filename))
            print(f"Spostato: {filename} -> {os.path.basename(directory_destinazione)}")
        except Exception as e:
            print(f"Errore durante lo spostamento di {filename}: {e}")
    
    # Stampa il riepilogo
    print("\nRiepilogo:")
    for tipo, numero in conteggio.items():
        print(f"{tipo}: {numero} file")

# Utilizzo della funzione
try:
    organizza_per_tipo("./downloads")
except Exception as e:
    print(f"Errore durante l'organizzazione: {e}")
```

## Considerazioni sulla Sicurezza

Quando si lavora con operazioni su file e directory, è importante considerare alcuni aspetti di sicurezza:

1. **Permessi**: Assicurarsi di avere i permessi necessari prima di eseguire operazioni su file e directory
2. **Backup**: Fare sempre un backup prima di eseguire operazioni distruttive come eliminazione o sovrascrittura
3. **Validazione dei percorsi**: Validare sempre i percorsi forniti dall'utente per evitare attacchi di tipo "path traversal"
4. **Gestione degli errori**: Implementare una corretta gestione degli errori per evitare interruzioni impreviste del programma

## Conclusione

I moduli `os` e `shutil` di Python offrono un potente set di strumenti per manipolare file e directory. Queste funzionalità sono essenziali per molte applicazioni, dalla gestione di file di configurazione all'automazione di attività di sistema.

Ricorda che, sebbene queste operazioni siano potenti, devono essere utilizzate con cautela, specialmente quelle distruttive come l'eliminazione di file e directory. È sempre una buona pratica verificare l'esistenza di file e directory prima di operare su di essi e implementare una corretta gestione degli errori.

Nella prossima lezione, esploreremo l'uso dei context manager e del costrutto `with` per una gestione più sicura ed efficiente dei file.

---

[Indice](../README.md) | [Lezione Precedente: Gestione dei Percorsi](05_gestione_percorsi.md) | [Prossima Lezione: Context Manager e with Statement](07_context_manager.md)