# Esecuzione di script Python

## Introduzione
In questa guida, esploreremo i diversi modi per eseguire script Python. Imparare a eseguire correttamente i tuoi script è fondamentale per iniziare a programmare efficacemente con Python.

## Cos'è uno script Python?
Uno script Python è semplicemente un file di testo contenente codice Python, salvato con l'estensione `.py`. A differenza dell'uso dell'interprete interattivo, gli script permettono di:
- Salvare il codice per riutilizzarlo in futuro
- Eseguire programmi più complessi
- Condividere il codice con altri

## Creazione di uno script Python

Per creare uno script Python:

1. Apri un editor di testo o un IDE (come VS Code, PyCharm, IDLE)
2. Scrivi il tuo codice Python
3. Salva il file con estensione `.py` (ad esempio, `mio_script.py`)

Ecco un esempio di script Python semplice:

```python
# Questo è un commento
print("Questo è il mio primo script Python!")

# Calcola e stampa la somma di due numeri
a = 5
b = 3
somma = a + b
print(f"La somma di {a} e {b} è {somma}")
```

## Metodi per eseguire script Python

### 1. Esecuzione da terminale/prompt dei comandi

Questo è il metodo più comune e versatile:

1. Apri il terminale (macOS/Linux) o il prompt dei comandi (Windows)
2. Naviga nella directory dove hai salvato lo script usando il comando `cd`
3. Esegui lo script con uno dei seguenti comandi:
   - Windows: `python nome_script.py`
   - macOS/Linux: `python3 nome_script.py`

Esempio:
```
cd C:\Progetti\Python
python mio_script.py
```

### 2. Esecuzione da IDE

Se stai utilizzando un IDE come PyCharm, VS Code o IDLE:

1. Apri il file dello script nell'IDE
2. Usa il pulsante "Run" o la scorciatoia da tastiera (spesso F5)

Ogni IDE ha il suo modo specifico di eseguire gli script:
- In **VS Code**: premi F5 o il pulsante play in alto a destra
- In **PyCharm**: premi Shift+F10 o il pulsante play in alto a destra
- In **IDLE**: premi F5 o seleziona Run > Run Module dal menu

### 3. Rendere gli script eseguibili (solo macOS/Linux)

Su sistemi Unix-like, puoi rendere uno script direttamente eseguibile:

1. Aggiungi lo "shebang" come prima riga del file:
   ```python
   #!/usr/bin/env python3
   
   print("Questo script è eseguibile!")
   ```

2. Rendi il file eseguibile con il comando:
   ```
   chmod +x mio_script.py
   ```

3. Esegui lo script direttamente:
   ```
   ./mio_script.py
   ```

### 4. Importazione come modulo

Puoi anche eseguire uno script importandolo come modulo in un altro script o nell'interprete interattivo:

```python
import mio_script
```

Questo eseguirà tutto il codice nel file `mio_script.py`.

## Passaggio di argomenti da riga di comando

Gli script Python possono accettare argomenti dalla riga di comando, utili per rendere i tuoi programmi più flessibili:

```python
# argomenti.py
import sys

# sys.argv è una lista contenente gli argomenti della riga di comando
# sys.argv[0] è il nome dello script stesso
print(f"Nome dello script: {sys.argv[0]}")

# Controlla se sono stati forniti argomenti
if len(sys.argv) > 1:
    print(f"Argomenti forniti: {sys.argv[1:]}")
else:
    print("Nessun argomento fornito")
```

Esecuzione:
```
python argomenti.py arg1 arg2 arg3
```

Output:
```
Nome dello script: argomenti.py
Argomenti forniti: ['arg1', 'arg2', 'arg3']
```

## Esecuzione di script con input dell'utente

Gli script possono richiedere input dall'utente durante l'esecuzione:

```python
# input_utente.py
nome = input("Come ti chiami? ")
eta = int(input("Quanti anni hai? "))

print(f"Ciao {nome}, hai {eta} anni!")
print(f"Tra 10 anni avrai {eta + 10} anni.")
```

## Errori comuni nell'esecuzione di script

### 1. File non trovato

```
python: can't open file 'mio_script.py': [Errno 2] No such file or directory
```

Soluzione: Verifica di essere nella directory corretta o specifica il percorso completo del file.

### 2. Errori di sintassi

```
SyntaxError: invalid syntax
```

Soluzione: Controlla il codice per errori di sintassi come parentesi mancanti, indentazione errata, ecc.

### 3. Modulo non trovato

```
ModuleNotFoundError: No module named 'nome_modulo'
```

Soluzione: Installa il modulo mancante con pip: `pip install nome_modulo`

### 4. Permessi insufficienti

```
Permission denied
```

Soluzione: Verifica i permessi del file o esegui il comando con privilegi elevati (su Linux/macOS).

## Conclusione

Saper eseguire correttamente gli script Python è una competenza fondamentale. Con la pratica, diventerà un processo naturale e potrai concentrarti maggiormente sulla scrittura del codice stesso. Nei prossimi capitoli, inizieremo a esplorare i concetti di base della programmazione Python, come variabili, tipi di dati e strutture di controllo.

---

[Indice dell'Esercitazione](../README.md) | [Precedente: Hello, World!](./04_hello_world.md) | [Prossimo: Commenti e documentazione](./06_commenti_documentazione.md)