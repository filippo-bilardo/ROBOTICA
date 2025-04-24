# Lettura da File in Python

La lettura dei file è una delle operazioni più comuni nella programmazione. Python offre diversi metodi per leggere il contenuto dei file, ognuno con i propri vantaggi e casi d'uso. In questa lezione, esploreremo le diverse tecniche per leggere dati da file in Python.

## Metodi di Lettura dei File

Python fornisce diversi metodi per leggere il contenuto dei file, ognuno adatto a situazioni specifiche:

### 1. `read()` - Lettura Completa del File

Il metodo `read()` legge l'intero contenuto del file come una singola stringa:

```python
with open("esempio.txt", "r", encoding="utf-8") as file:
    contenuto = file.read()
    print(contenuto)
```

**Vantaggi**:
- Semplice e diretto
- Utile per file di piccole dimensioni

**Svantaggi**:
- Può causare problemi di memoria con file molto grandi
- Non efficiente per l'elaborazione riga per riga

#### Lettura Parziale con `read(size)`

È possibile specificare il numero di caratteri da leggere:

```python
with open("esempio.txt", "r") as file:
    # Legge i primi 100 caratteri
    parte1 = file.read(100)
    print(parte1)
    
    # Legge i successivi 100 caratteri
    parte2 = file.read(100)
    print(parte2)
```

Questo approccio è utile per file di grandi dimensioni che devono essere elaborati a blocchi.

### 2. `readline()` - Lettura di una Singola Riga

Il metodo `readline()` legge una riga alla volta dal file:

```python
with open("esempio.txt", "r") as file:
    # Legge la prima riga
    riga1 = file.readline()
    print(riga1)
    
    # Legge la seconda riga
    riga2 = file.readline()
    print(riga2)
```

**Vantaggi**:
- Permette di elaborare il file una riga alla volta
- Efficiente per file di grandi dimensioni

**Svantaggi**:
- Richiede più chiamate per leggere l'intero file
- Mantiene i caratteri di nuova linea (`\n`) alla fine di ogni riga

### 3. `readlines()` - Lettura di Tutte le Righe in una Lista

Il metodo `readlines()` legge tutte le righe del file e le restituisce come una lista di stringhe:

```python
with open("esempio.txt", "r") as file:
    righe = file.readlines()
    for i, riga in enumerate(righe):
        print(f"Riga {i+1}: {riga.strip()}")
```

**Vantaggi**:
- Facile da usare per elaborare tutte le righe
- Mantiene l'ordine delle righe

**Svantaggi**:
- Carica l'intero file in memoria (problematico per file molto grandi)
- Mantiene i caratteri di nuova linea (che possono essere rimossi con `strip()`)

### 4. Iterazione Diretta sull'Oggetto File

L'oggetto file in Python è un iterabile che produce una riga alla volta, rendendo questo il metodo più efficiente e pythonic per leggere un file riga per riga:

```python
with open("esempio.txt", "r") as file:
    for riga in file:
        print(riga.strip())  # strip() rimuove i caratteri di nuova linea
```

**Vantaggi**:
- Molto efficiente in termini di memoria (legge una riga alla volta)
- Codice pulito e pythonic
- Ideale per file di qualsiasi dimensione

**Svantaggi**:
- Non permette di tornare indietro facilmente (il file viene letto in sequenza)

## Posizionamento nel File

Python permette di controllare la posizione corrente all'interno di un file:

### `tell()` - Ottenere la Posizione Corrente

```python
with open("esempio.txt", "r") as file:
    print(f"Posizione iniziale: {file.tell()}")
    file.read(10)  # Legge 10 caratteri
    print(f"Nuova posizione: {file.tell()}")
```

### `seek()` - Spostare la Posizione

```python
with open("esempio.txt", "r") as file:
    # Legge i primi 10 caratteri
    print(file.read(10))
    
    # Torna all'inizio del file
    file.seek(0)
    print(file.read(10))  # Legge di nuovo i primi 10 caratteri
    
    # Vai alla posizione 20
    file.seek(20)
    print(file.read(10))  # Legge 10 caratteri dalla posizione 20
```

La funzione `seek(offset, whence)` accetta due parametri:
- `offset`: Il numero di byte da spostare
- `whence`: Il punto di riferimento (opzionale)
  - 0 = inizio del file (default)
  - 1 = posizione corrente
  - 2 = fine del file

```python
with open("esempio.txt", "r") as file:
    # Vai alla fine del file
    file.seek(0, 2)
    print(f"Dimensione del file: {file.tell()} byte")
    
    # Torna indietro di 20 byte dalla fine
    file.seek(-20, 2)
    print(file.read())  # Legge gli ultimi 20 byte
```

## Gestione della Codifica dei Caratteri

Quando si leggono file di testo, è importante specificare la codifica corretta:

```python
# Lettura con codifica UTF-8 (consigliata per la maggior parte dei file di testo)
with open("internazionale.txt", "r", encoding="utf-8") as file:
    contenuto = file.read()
    print(contenuto)

# Lettura con altre codifiche
with open("legacy.txt", "r", encoding="latin-1") as file:
    contenuto = file.read()
    print(contenuto)
```

Le codifiche comuni includono:
- `utf-8`: Standard moderno per testo multilingue
- `ascii`: Solo caratteri ASCII (0-127)
- `latin-1` (ISO-8859-1): Estensione dell'ASCII per lingue dell'Europa occidentale
- `cp1252`: Codifica Windows per lingue dell'Europa occidentale

## Gestione degli Errori di Codifica

Puoi specificare come gestire gli errori di codifica con il parametro `errors`:

```python
# Sostituisce i caratteri non validi con un carattere di sostituzione
with open("problematico.txt", "r", encoding="utf-8", errors="replace") as file:
    contenuto = file.read()
    print(contenuto)

# Ignora i caratteri non validi
with open("problematico.txt", "r", encoding="utf-8", errors="ignore") as file:
    contenuto = file.read()
    print(contenuto)
```

Opzioni comuni per `errors`:
- `strict`: Solleva un'eccezione (default)
- `replace`: Sostituisce i caratteri non validi con un carattere di sostituzione
- `ignore`: Ignora i caratteri non validi
- `backslashreplace`: Sostituisce con sequenze di escape

## Lettura di File Binari

Per leggere file binari, usa la modalità `"rb"`:

```python
with open("immagine.jpg", "rb") as file:
    # Legge i primi 10 byte
    dati = file.read(10)
    print(dati)  # Stampa una sequenza di byte
    
    # Converti in rappresentazione esadecimale
    hex_data = dati.hex()
    print(f"Dati in esadecimale: {hex_data}")
```

## Esempi Pratici

### Esempio 1: Conteggio delle Righe, Parole e Caratteri

```python
def conta_statistiche(nome_file):
    try:
        with open(nome_file, "r", encoding="utf-8") as file:
            contenuto = file.read()
            num_caratteri = len(contenuto)
            num_parole = len(contenuto.split())
            num_righe = contenuto.count('\n') + 1  # +1 perché l'ultima riga potrebbe non avere \n
            return {
                "righe": num_righe,
                "parole": num_parole,
                "caratteri": num_caratteri
            }
    except FileNotFoundError:
        print(f"Errore: Il file '{nome_file}' non esiste.")
        return None
    except Exception as e:
        print(f"Si è verificato un errore: {e}")
        return None

# Utilizzo della funzione
stats = conta_statistiche("esempio.txt")
if stats:
    print(f"Righe: {stats['righe']}")
    print(f"Parole: {stats['parole']}")
    print(f"Caratteri: {stats['caratteri']}")
```

### Esempio 2: Ricerca di Testo in un File

```python
def cerca_in_file(nome_file, testo_da_cercare):
    try:
        with open(nome_file, "r", encoding="utf-8") as file:
            risultati = []
            for numero_riga, riga in enumerate(file, 1):
                if testo_da_cercare in riga:
                    risultati.append((numero_riga, riga.strip()))
            return risultati
    except FileNotFoundError:
        print(f"Errore: Il file '{nome_file}' non esiste.")
        return []
    except Exception as e:
        print(f"Si è verificato un errore: {e}")
        return []

# Utilizzo della funzione
risultati = cerca_in_file("esempio.txt", "Python")
if risultati:
    print(f"Trovate {len(risultati)} occorrenze:")
    for numero_riga, riga in risultati:
        print(f"Riga {numero_riga}: {riga}")
else:
    print("Nessuna occorrenza trovata.")
```

### Esempio 3: Lettura Efficiente di File di Grandi Dimensioni

```python
def elabora_file_grande(nome_file, dimensione_blocco=4096):
    try:
        with open(nome_file, "r", encoding="utf-8") as file:
            # Elaborazione a blocchi
            while True:
                blocco = file.read(dimensione_blocco)
                if not blocco:  # Fine del file
                    break
                # Elabora il blocco...
                print(f"Elaborati {len(blocco)} caratteri")
        print("Elaborazione completata")
        return True
    except Exception as e:
        print(f"Si è verificato un errore: {e}")
        return False

# Utilizzo della funzione
elabora_file_grande("file_grande.txt")
```

## Conclusione

La lettura dei file è un'operazione fondamentale in Python, e il linguaggio offre diversi metodi per adattarsi alle diverse esigenze. Ricorda di:

1. Utilizzare il context manager `with` per garantire la chiusura corretta del file
2. Scegliere il metodo di lettura appropriato in base alle dimensioni del file e alle esigenze di elaborazione
3. Specificare la codifica corretta quando si leggono file di testo
4. Gestire le eccezioni che potrebbero verificarsi durante la lettura

Nella prossima lezione, esploreremo le tecniche per scrivere dati su file in Python.

---

[Indice](../README.md) | [Lezione Precedente: Apertura e Chiusura dei File](02_apertura_chiusura.md) | [Prossima Lezione: Scrittura su File](04_scrittura_file.md)