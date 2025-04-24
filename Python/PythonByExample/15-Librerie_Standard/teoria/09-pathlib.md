# Librerie Standard di Python
## Modulo `pathlib`

Il modulo `pathlib` introdotto in Python 3.4 offre un'interfaccia orientata agli oggetti per lavorare con i percorsi del filesystem, rappresentando un'alternativa moderna e più intuitiva rispetto alle funzioni tradizionali del modulo `os.path`.

### Vantaggi di `pathlib`

- **Sintassi più chiara e intuitiva**: Utilizza l'operatore `/` per la concatenazione dei percorsi
- **Orientato agli oggetti**: I percorsi sono oggetti con metodi e proprietà
- **Riduce la necessità di importare più moduli**: Combina funzionalità di `os`, `os.path` e altre librerie
- **Compatibilità con il sistema operativo**: Gestisce automaticamente le differenze tra sistemi operativi

### Utilizzo Base

```python
from pathlib import Path

# Creazione di oggetti Path
path_corrente = Path('.')  # Directory corrente
path_assoluto = Path.cwd()  # Percorso assoluto della directory corrente
path_home = Path.home()  # Directory home dell'utente

print(f"Directory corrente: {path_corrente}")
print(f"Percorso assoluto: {path_assoluto}")
print(f"Directory home: {path_home}")

# Creazione di percorsi
file_path = Path('cartella') / 'sottocartella' / 'file.txt'
print(f"Percorso del file: {file_path}")

# Componenti del percorso
print(f"Nome del file: {file_path.name}")
print(f"Estensione: {file_path.suffix}")
print(f"Nome senza estensione: {file_path.stem}")
print(f"Directory padre: {file_path.parent}")
```

### Operazioni sui File e Directory

```python
from pathlib import Path
import shutil

# Creazione di directory
dir_path = Path('nuova_directory')
dir_path.mkdir(exist_ok=True)  # Non genera errore se la directory esiste già

# Creazione di directory annidate
dir_annidata = Path('dir1/dir2/dir3')
dir_annidata.mkdir(parents=True, exist_ok=True)  # Crea anche le directory intermedie

# Verifica dell'esistenza
file_path = Path('file_esempio.txt')
print(f"Il file esiste: {file_path.exists()}")

# Creazione e scrittura di file
if not file_path.exists():
    file_path.write_text("Questo è il contenuto del file.\n")
    print(f"File creato: {file_path}")

# Lettura di file
if file_path.exists():
    contenuto = file_path.read_text()
    print(f"Contenuto del file:\n{contenuto}")

# Aggiunta di contenuto a un file
if file_path.exists():
    with file_path.open('a') as f:  # Modalità append
        f.write("Questa è una nuova riga.\n")
    print("Contenuto aggiunto al file.")

# Rimozione di file
if file_path.exists():
    file_path.unlink()  # Elimina il file
    print(f"File eliminato: {file_path}")

# Rimozione di directory
if dir_path.exists():
    try:
        dir_path.rmdir()  # Funziona solo se la directory è vuota
        print(f"Directory vuota eliminata: {dir_path}")
    except OSError:
        # Per directory non vuote, usa shutil
        shutil.rmtree(dir_path)
        print(f"Directory non vuota eliminata: {dir_path}")
```

### Navigazione e Ricerca

```python
from pathlib import Path

# Directory corrente
dir_corrente = Path.cwd()

# Elenco di tutti i file nella directory
print("File nella directory corrente:")
for file in dir_corrente.iterdir():
    print(f"  {'📁' if file.is_dir() else '📄'} {file.name}")

# Ricerca ricorsiva di file
print("\nFile Python nella directory corrente e sottodirectory:")
for file in dir_corrente.glob('**/*.py'):  # Ricerca ricorsiva
    print(f"  {file.relative_to(dir_corrente)}")

# Ricerca con pattern specifici
print("\nFile di testo nella directory corrente:")
for file in dir_corrente.glob('*.txt'):
    print(f"  {file.name}")

# Filtraggio per tipo
print("\nSolo directory nella directory corrente:")
for item in dir_corrente.iterdir():
    if item.is_dir():
        print(f"  📁 {item.name}")
```

### Esempio Pratico: Organizzazione di File

```python
from pathlib import Path
import shutil
from datetime import datetime

def organizza_per_tipo(directory):
    """Organizza i file in una directory in sottodirectory basate sul tipo di file."""
    dir_path = Path(directory)
    
    # Verifica che la directory esista
    if not dir_path.exists() or not dir_path.is_dir():
        print(f"La directory {directory} non esiste o non è una directory valida.")
        return
    
    # Mappa delle estensioni per tipo
    tipi_file = {
        'Immagini': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
        'Documenti': ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
        'Video': ['.mp4', '.avi', '.mov', '.mkv'],
        'Audio': ['.mp3', '.wav', '.flac', '.ogg'],
        'Archivi': ['.zip', '.rar', '.tar', '.gz']
    }
    
    # Crea le directory di destinazione se non esistono
    for tipo in tipi_file:
        tipo_dir = dir_path / tipo
        tipo_dir.mkdir(exist_ok=True)
    
    # Directory per file di tipo sconosciuto
    altro_dir = dir_path / 'Altri'
    altro_dir.mkdir(exist_ok=True)
    
    # Conta i file spostati
    conteggio = {tipo: 0 for tipo in tipi_file}
    conteggio['Altri'] = 0
    
    # Sposta i file nelle directory appropriate
    for file_path in dir_path.iterdir():
        # Salta le directory
        if file_path.is_dir():
            continue
            
        # Determina il tipo di file
        estensione = file_path.suffix.lower()
        tipo_trovato = None
        
        for tipo, estensioni in tipi_file.items():
            if estensione in estensioni:
                tipo_trovato = tipo
                break
        
        # Determina la directory di destinazione
        if tipo_trovato:
            dest_dir = dir_path / tipo_trovato
        else:
            dest_dir = altro_dir
            tipo_trovato = 'Altri'
        
        # Sposta il file
        try:
            shutil.move(str(file_path), str(dest_dir / file_path.name))
            conteggio[tipo_trovato] += 1
            print(f"Spostato: {file_path.name} -> {tipo_trovato}/")
        except Exception as e:
            print(f"Errore nello spostamento di {file_path.name}: {e}")
    
    # Stampa il riepilogo
    print("\nRiepilogo:")
    for tipo, numero in conteggio.items():
        print(f"  {tipo}: {numero} file")

# Esempio di utilizzo
if __name__ == "__main__":
    directory = input("Inserisci il percorso della directory da organizzare: ")
    organizza_per_tipo(directory)
```

### Casi d'Uso Comuni

1. **Gestione dei file di configurazione**: Localizzazione e manipolazione di file di configurazione in posizioni standard.
2. **Elaborazione batch di file**: Ricerca e manipolazione di gruppi di file con pattern specifici.
3. **Organizzazione di file**: Spostamento e riorganizzazione di file in base a criteri come tipo, data o dimensione.
4. **Backup e archiviazione**: Creazione di copie di backup di file e directory.
5. **Gestione dei percorsi relativi e assoluti**: Conversione tra diversi tipi di percorsi in modo indipendente dalla piattaforma.

### Confronto con `os.path`

```python
# Confronto tra os.path e pathlib
import os.path
from pathlib import Path

# Creazione di un percorso
# os.path
path_os = os.path.join('cartella', 'sottocartella', 'file.txt')

# pathlib
path_pathlib = Path('cartella') / 'sottocartella' / 'file.txt'

print(f"os.path: {path_os}")
print(f"pathlib: {path_pathlib}")

# Verifica dell'esistenza
# os.path
esiste_os = os.path.exists(path_os)

# pathlib
esiste_pathlib = Path(path_pathlib).exists()

# Ottenere componenti del percorso
# os.path
nome_file_os = os.path.basename(path_os)
directory_os = os.path.dirname(path_os)
estensione_os = os.path.splitext(path_os)[1]

# pathlib
nome_file_pathlib = Path(path_pathlib).name
directory_pathlib = Path(path_pathlib).parent
estensione_pathlib = Path(path_pathlib).suffix

print(f"\nComponenti con os.path:")
print(f"  Nome file: {nome_file_os}")
print(f"  Directory: {directory_os}")
print(f"  Estensione: {estensione_os}")

print(f"\nComponenti con pathlib:")
print(f"  Nome file: {nome_file_pathlib}")
print(f"  Directory: {directory_pathlib}")
print(f"  Estensione: {estensione_pathlib}")
```

### Risorse Aggiuntive

- [Documentazione ufficiale di pathlib](https://docs.python.org/3/library/pathlib.html)
- [PEP 428 - The pathlib module](https://www.python.org/dev/peps/pep-0428/)

### Navigazione

- [Indice](../../README.md)
- [Precedente: OS e SYS](./08-os-sys.md)
- [Successivo: Espressioni Regolari](./10-re.md)