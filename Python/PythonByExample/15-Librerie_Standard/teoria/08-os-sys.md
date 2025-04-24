# Librerie Standard di Python
## Moduli `os` e `sys`

I moduli `os` e `sys` sono fondamentali per interagire con il sistema operativo e l'ambiente di esecuzione Python.

### Il Modulo `os`

Il modulo `os` fornisce funzioni per interagire con il sistema operativo in modo indipendente dalla piattaforma.

#### Funzioni principali

```python
import os

# Informazioni sul sistema operativo
print(f"Nome del sistema operativo: {os.name}")  # 'posix' (Unix/Linux/Mac) o 'nt' (Windows)

# Gestione dei percorsi
percorso_corrente = os.getcwd()  # Ottiene la directory di lavoro corrente
print(f"Directory corrente: {percorso_corrente}")

# Creazione e rimozione di directory
os.mkdir("nuova_cartella")  # Crea una nuova directory
os.rmdir("nuova_cartella")  # Rimuove una directory vuota

# Elenco dei file in una directory
files = os.listdir(".")  # Elenca tutti i file nella directory corrente
print(f"File nella directory corrente: {files}")

# Manipolazione dei percorsi
percorso = os.path.join("cartella", "sottocartella", "file.txt")  # Crea un percorso in modo indipendente dalla piattaforma
print(f"Percorso creato: {percorso}")

# Verifica dell'esistenza di file e directory
esiste = os.path.exists("file.txt")  # Verifica se un file o una directory esiste
print(f"Il file esiste: {esiste}")

# Informazioni sui file
if os.path.exists("file.txt"):
    dimensione = os.path.getsize("file.txt")  # Ottiene la dimensione di un file in byte
    print(f"Dimensione del file: {dimensione} byte")

# Variabili d'ambiente
path = os.environ.get("PATH")  # Accede alle variabili d'ambiente
print(f"Variabile PATH: {path[:50]}...")
```

### Il Modulo `sys`

Il modulo `sys` fornisce accesso a variabili e funzioni specifiche dell'interprete Python.

```python
import sys

# Versione di Python
print(f"Versione di Python: {sys.version}")
print(f"Versione di Python (tuple): {sys.version_info}")

# Percorso di ricerca dei moduli
print(f"Percorsi di ricerca dei moduli:")
for path in sys.path:
    print(f"  - {path}")

# Argomenti della riga di comando
print(f"Argomenti della riga di comando: {sys.argv}")

# Dimensione degli oggetti
lista = [1, 2, 3, 4, 5]
print(f"Dimensione della lista in memoria: {sys.getsizeof(lista)} byte")

# Uscita dal programma
def esci_programma():
    print("Uscita dal programma con codice 0")
    sys.exit(0)  # Esce dal programma con codice di stato 0 (successo)

# Gestione dell'input/output standard
sys.stdout.write("Questo è scritto su stdout\n")  # Scrittura su stdout

# Piattaforma
print(f"Piattaforma: {sys.platform}")  # Identificatore della piattaforma
```

### Esempio Pratico: Navigazione nel Filesystem

```python
import os
import sys

def esplora_directory(percorso):
    """Esplora ricorsivamente una directory e stampa la sua struttura."""
    try:
        # Verifica se il percorso esiste
        if not os.path.exists(percorso):
            print(f"Il percorso {percorso} non esiste.")
            sys.exit(1)
            
        # Verifica se è una directory
        if not os.path.isdir(percorso):
            print(f"{percorso} non è una directory.")
            sys.exit(1)
            
        print(f"\nEsplorazione di: {percorso}")
        
        # Ottiene la lista di file e directory
        elementi = os.listdir(percorso)
        
        # Conta file e directory
        num_file = 0
        num_dir = 0
        
        # Stampa tutti gli elementi
        for elemento in elementi:
            percorso_completo = os.path.join(percorso, elemento)
            
            if os.path.isdir(percorso_completo):
                print(f"  📁 {elemento}/")
                num_dir += 1
            else:
                dimensione = os.path.getsize(percorso_completo)
                print(f"  📄 {elemento} ({dimensione} byte)")
                num_file += 1
        
        # Stampa statistiche
        print(f"\nTotale: {num_file} file e {num_dir} directory")
        
    except Exception as e:
        print(f"Errore durante l'esplorazione: {e}")
        sys.exit(1)

# Usa la directory corrente se non viene specificato un percorso
if len(sys.argv) > 1:
    percorso_da_esplorare = sys.argv[1]
else:
    percorso_da_esplorare = os.getcwd()

esplora_directory(percorso_da_esplorare)
```

### Casi d'Uso Comuni

1. **Automazione del sistema**: Creazione, spostamento, eliminazione di file e directory.
2. **Script di sistema**: Accesso alle variabili d'ambiente e agli argomenti della riga di comando.
3. **Gestione dei percorsi**: Manipolazione di percorsi in modo indipendente dalla piattaforma.
4. **Informazioni di sistema**: Ottenere informazioni sul sistema operativo e sull'ambiente Python.
5. **Controllo dell'esecuzione**: Terminare il programma con codici di stato specifici.

### Risorse Aggiuntive

- [Documentazione ufficiale del modulo os](https://docs.python.org/3/library/os.html)
- [Documentazione ufficiale del modulo sys](https://docs.python.org/3/library/sys.html)

### Navigazione

- [Indice](../../README.md)
- [Precedente: Random](./07-random.md)
- [Successivo: Pathlib](./09-pathlib.md)