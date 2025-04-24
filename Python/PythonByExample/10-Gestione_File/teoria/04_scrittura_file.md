# Scrittura su File in Python

La scrittura su file è un'operazione fondamentale che permette di salvare dati in modo persistente. Python offre diversi metodi per scrivere dati su file, ognuno con caratteristiche specifiche. In questa lezione, esploreremo le diverse tecniche per scrivere dati su file in Python.

## Metodi di Scrittura su File

Python fornisce diversi metodi per scrivere dati su file, ognuno adatto a situazioni specifiche:

### 1. `write()` - Scrittura di una Stringa

Il metodo `write()` scrive una stringa nel file e restituisce il numero di caratteri scritti:

```python
with open("output.txt", "w", encoding="utf-8") as file:
    caratteri_scritti = file.write("Questo è un esempio di scrittura su file.\n")
    print(f"Caratteri scritti: {caratteri_scritti}")
```

**Caratteristiche**:
- Scrive esattamente la stringa fornita, senza aggiungere automaticamente caratteri di nuova linea
- Restituisce il numero di caratteri scritti
- Sovrascrive il contenuto esistente se il file è aperto in modalità `"w"`

### 2. `writelines()` - Scrittura di una Lista di Stringhe

Il metodo `writelines()` scrive una sequenza di stringhe nel file:

```python
with open("output.txt", "w") as file:
    righe = [
        "Prima riga\n",
        "Seconda riga\n",
        "Terza riga\n"
    ]
    file.writelines(righe)
```

**Caratteristiche**:
- Scrive tutte le stringhe nella sequenza, una dopo l'altra
- Non aggiunge automaticamente caratteri di nuova linea tra le stringhe
- È necessario includere esplicitamente i caratteri di nuova linea (`\n`) se si desidera che ogni stringa sia su una riga separata

### 3. `print()` con Reindirizzamento

È possibile utilizzare la funzione `print()` per scrivere su file specificando il parametro `file`:

```python
with open("output.txt", "w") as file:
    print("Questa è la prima riga", file=file)
    print("Questa è la seconda riga", file=file)
    print("Questa è la terza riga", file=file)
```

**Vantaggi**:
- Aggiunge automaticamente i caratteri di nuova linea
- Supporta tutti i parametri di formattazione di `print()` (`sep`, `end`, ecc.)
- Converte automaticamente gli oggetti non stringa in stringhe

## Modalità di Apertura per la Scrittura

Le modalità di apertura determinano come i dati vengono scritti nel file:

### Modalità `"w"` - Scrittura (Sovrascrittura)

```python
with open("output.txt", "w") as file:
    file.write("Questo sovrascrive qualsiasi contenuto esistente.")
```

- Crea un nuovo file se non esiste
- Sovrascrive completamente il contenuto se il file esiste già

### Modalità `"a"` - Append (Aggiunta)

```python
with open("log.txt", "a") as file:
    file.write("Questa riga viene aggiunta alla fine del file.\n")
```

- Crea un nuovo file se non esiste
- Aggiunge il contenuto alla fine del file se esiste già
- Utile per file di log o per aggiungere dati senza perdere quelli esistenti

### Modalità `"x"` - Creazione Esclusiva

```python
try:
    with open("nuovo_file.txt", "x") as file:
        file.write("Questo file è stato creato in modo esclusivo.")
except FileExistsError:
    print("Il file esiste già!")
```

- Crea un nuovo file
- Genera un errore `FileExistsError` se il file esiste già
- Utile per evitare di sovrascrivere accidentalmente file esistenti

### Modalità `"r+"` - Lettura e Scrittura

```python
with open("dati.txt", "r+") as file:
    contenuto = file.read()
    file.seek(0)  # Torna all'inizio del file
    file.write("Nuova prima riga\n" + contenuto)
```

- Apre il file per la lettura e la scrittura
- Il file deve esistere già
- Il puntatore del file inizia all'inizio

### Modalità `"w+"` - Scrittura e Lettura

```python
with open("dati.txt", "w+") as file:
    file.write("Nuovi dati\n")
    file.seek(0)  # Torna all'inizio del file
    contenuto = file.read()
    print(f"Contenuto scritto: {contenuto}")
```

- Crea un nuovo file o sovrascrive uno esistente
- Permette sia la scrittura che la lettura

## Scrittura di Diversi Tipi di Dati

### Scrittura di Numeri e Altri Tipi

I metodi di scrittura accettano solo stringhe, quindi è necessario convertire altri tipi di dati:

```python
with open("numeri.txt", "w") as file:
    numero = 42
    file.write(str(numero) + "\n")  # Conversione esplicita in stringa
    
    # Oppure usando print
    print(numero, file=file)  # Conversione automatica
```

### Scrittura di Dati Strutturati

Per dati strutturati, è spesso utile utilizzare formati come CSV o JSON:

```python
import csv
import json

# Scrittura in formato CSV
with open("dati.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Nome", "Età", "Città"])
    writer.writerow(["Mario", 30, "Roma"])
    writer.writerow(["Luigi", 28, "Milano"])

# Scrittura in formato JSON
dati = {
    "persone": [
        {"nome": "Mario", "età": 30, "città": "Roma"},
        {"nome": "Luigi", "età": 28, "città": "Milano"}
    ]
}

with open("dati.json", "w") as file:
    json.dump(dati, file, indent=4)  # indent per formattazione leggibile
```

## Scrittura di File Binari

Per scrivere dati binari, usa la modalità `"wb"`:

```python
with open("dati.bin", "wb") as file:
    # Scrittura di byte
    file.write(b"\x48\x65\x6C\x6C\x6F")  # "Hello" in ASCII
    
    # Conversione di una stringa in byte
    testo = "Ciao, mondo!"
    file.write(testo.encode("utf-8"))
```

## Gestione della Codifica dei Caratteri

Quando si scrivono file di testo, è importante specificare la codifica corretta:

```python
# Scrittura con codifica UTF-8 (consigliata per la maggior parte dei file di testo)
with open("internazionale.txt", "w", encoding="utf-8") as file:
    file.write("Ciao, 你好, Привет, مرحبا\n")

# Scrittura con altre codifiche
with open("ascii.txt", "w", encoding="ascii", errors="replace") as file:
    file.write("Testo con caratteri non ASCII: è, à, ü")
```

## Gestione degli Errori di Codifica

Puoi specificare come gestire gli errori di codifica con il parametro `errors`:

```python
# Sostituisce i caratteri non codificabili con un carattere di sostituzione
with open("ascii_only.txt", "w", encoding="ascii", errors="replace") as file:
    file.write("Testo con caratteri non ASCII: è, à, ü")

# Ignora i caratteri non codificabili
with open("ascii_only.txt", "w", encoding="ascii", errors="ignore") as file:
    file.write("Testo con caratteri non ASCII: è, à, ü")
```

## Controllo del Buffering

Python bufferizza (accumula) i dati prima di scriverli effettivamente su disco per migliorare le prestazioni. È possibile controllare questo comportamento:

```python
# Disabilita il buffering (ogni scrittura viene immediatamente salvata su disco)
with open("log.txt", "w", buffering=0) as file:
    file.write("Questo viene scritto immediatamente su disco.\n")

# Buffering a riga (i dati vengono scritti su disco dopo ogni nuova riga)
with open("log.txt", "w", buffering=1) as file:
    file.write("Questa riga viene bufferizzata.\n")  # Scritto su disco a causa del \n
# Buffering con dimensione specifica (in byte)
with open("dati.txt", "w", buffering=4096) as file:  # Buffer di 4 KB
    file.write("Questi dati vengono bufferizzati fino a 4 KB.")
```

## Forzare la Scrittura su Disco con `flush()`

Il metodo `flush()` forza la scrittura dei dati bufferizzati su disco:

```python
with open("log.txt", "w") as file:
    file.write("Prima riga\n")
    file.flush()  # Forza la scrittura su disco
    # ... altre operazioni ...
    file.write("Seconda riga\n")
```

Questo è utile quando è necessario assicurarsi che i dati siano effettivamente salvati su disco prima di continuare con altre operazioni.

## Esempi Pratici

### Esempio 1: Creazione di un File di Log

```python
def log_message(message, log_file="app.log"):
    """Aggiunge un messaggio di log con timestamp al file specificato."""
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    with open(log_file, "a") as file:
        file.write(f"[{timestamp}] {message}\n")

# Utilizzo della funzione
log_message("Applicazione avviata")
log_message("Operazione completata con successo")
log_message("Applicazione terminata")
```

### Esempio 2: Copia e Modifica di un File

```python
def copia_e_modifica(file_origine, file_destinazione, vecchio_testo, nuovo_testo):
    """Copia un file sostituendo tutte le occorrenze di vecchio_testo con nuovo_testo."""
    try:
        # Legge il contenuto del file di origine
        with open(file_origine, "r", encoding="utf-8") as file_in:
            contenuto = file_in.read()
        
        # Sostituisce il testo
        contenuto_modificato = contenuto.replace(vecchio_testo, nuovo_testo)
        
        # Scrive il contenuto modificato nel file di destinazione
        with open(file_destinazione, "w", encoding="utf-8") as file_out:
            file_out.write(contenuto_modificato)
        
        return True
    except Exception as e:
        print(f"Si è verificato un errore: {e}")
        return False

# Utilizzo della funzione
copia_e_modifica("originale.txt", "modificato.txt", "vecchio", "nuovo")
```

### Esempio 3: Scrittura di Dati Tabellari in Formato CSV

```python
import csv

def salva_dati_csv(dati, nome_file, intestazioni=None):
    """Salva una lista di dizionari o una lista di liste in un file CSV."""
    try:
        with open(nome_file, "w", newline="", encoding="utf-8") as file:
            # Se dati è una lista di dizionari
            if dati and isinstance(dati[0], dict):
                if intestazioni is None:
                    intestazioni = dati[0].keys()
                writer = csv.DictWriter(file, fieldnames=intestazioni)
                writer.writeheader()
                writer.writerows(dati)
            # Se dati è una lista di liste
            else:
                writer = csv.writer(file)
                if intestazioni:
                    writer.writerow(intestazioni)
                writer.writerows(dati)
        return True
    except Exception as e:
        print(f"Si è verificato un errore: {e}")
        return False

# Utilizzo della funzione con lista di dizionari
dati_persone = [
    {"nome": "Mario", "età": 30, "città": "Roma"},
    {"nome": "Luigi", "età": 28, "città": "Milano"},
    {"nome": "Anna", "età": 25, "città": "Napoli"}
]
salva_dati_csv(dati_persone, "persone.csv")

# Utilizzo della funzione con lista di liste
dati_numeri = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
salva_dati_csv(dati_numeri, "numeri.csv", ["A", "B", "C"])
```

## Conclusione

La scrittura su file in Python offre molte possibilità per salvare dati in modo persistente. Ricorda di:

1. Utilizzare il context manager `with` per garantire la chiusura corretta del file
2. Scegliere la modalità di apertura appropriata in base alle esigenze (`"w"`, `"a"`, `"x"`, ecc.)
3. Specificare la codifica corretta quando si scrivono file di testo
4. Gestire le eccezioni che potrebbero verificarsi durante la scrittura
5. Considerare formati strutturati come CSV o JSON per dati complessi

Nella prossima lezione, esploreremo la gestione dei percorsi dei file con il modulo `os.path`.

---

[Indice](../README.md) | [Lezione Precedente: Lettura da File](03_lettura_file.md) | [Prossima Lezione: Gestione dei Percorsi con il Modulo os.path](05_gestione_percorsi.md)