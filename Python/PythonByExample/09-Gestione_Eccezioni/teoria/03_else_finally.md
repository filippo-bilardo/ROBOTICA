# Else e Finally: Completare la Gestione delle Eccezioni

Oltre ai blocchi `try` ed `except`, Python offre due clausole aggiuntive che completano il meccanismo di gestione delle eccezioni: `else` e `finally`. Queste clausole permettono di controllare con maggiore precisione il flusso di esecuzione del programma in presenza di eccezioni.

## La Clausola `else`

La clausola `else` viene eseguita solo se il blocco `try` non genera alcuna eccezione. È utile per separare il codice che potrebbe generare eccezioni dal codice che dovrebbe essere eseguito solo in caso di successo.

### Sintassi

```python
try:
    # Codice che potrebbe generare un'eccezione
    # ...
except TipoEccezione:
    # Gestione dell'eccezione
    # ...
else:
    # Codice eseguito solo se non si verificano eccezioni nel blocco try
    # ...
```

### Esempio

```python
try:
    numero = int(input("Inserisci un numero: "))
    risultato = 10 / numero
except ValueError:
    print("Errore: Devi inserire un numero valido!")
except ZeroDivisionError:
    print("Errore: Non puoi dividere per zero!")
else:
    print(f"Il risultato è {risultato}")
    print("Operazione completata con successo!")
```

In questo esempio:
1. Se l'utente inserisce un input non numerico, viene catturata l'eccezione `ValueError`
2. Se l'utente inserisce zero, viene catturata l'eccezione `ZeroDivisionError`
3. Solo se non si verificano eccezioni, il blocco `else` viene eseguito, mostrando il risultato e un messaggio di successo

### Vantaggi dell'Uso di `else`

- **Chiarezza del codice**: Separa chiaramente il codice che potrebbe generare eccezioni dal codice che viene eseguito solo in caso di successo
- **Evita errori logici**: Garantisce che il codice nel blocco `else` venga eseguito solo se non si sono verificate eccezioni
- **Migliora la leggibilità**: Rende più chiaro il flusso di esecuzione del programma

## La Clausola `finally`

La clausola `finally` contiene codice che viene sempre eseguito, indipendentemente dal fatto che si verifichi un'eccezione o meno. È particolarmente utile per operazioni di pulizia, come chiudere file o connessioni di rete.

### Sintassi

```python
try:
    # Codice che potrebbe generare un'eccezione
    # ...
except TipoEccezione:
    # Gestione dell'eccezione
    # ...
finally:
    # Codice eseguito sempre, indipendentemente dalle eccezioni
    # ...
```

### Esempio

```python
try:
    file = open("dati.txt", "r")
    contenuto = file.read()
    print(contenuto)
except FileNotFoundError:
    print("Il file non esiste!")
finally:
    # Questo blocco viene sempre eseguito
    print("Operazione di lettura file terminata")
    # Chiudiamo il file solo se è stato aperto con successo
    if 'file' in locals() and not file.closed:
        file.close()
        print("File chiuso con successo")
```

In questo esempio:
1. Proviamo ad aprire e leggere un file
2. Se il file non esiste, catturiamo l'eccezione `FileNotFoundError`
3. Indipendentemente dal risultato, il blocco `finally` viene eseguito
4. Nel blocco `finally`, chiudiamo il file se è stato aperto con successo

### Vantaggi dell'Uso di `finally`

- **Garanzia di esecuzione**: Il codice nel blocco `finally` viene sempre eseguito, anche se si verificano eccezioni non gestite
- **Pulizia delle risorse**: Ideale per rilasciare risorse come file, connessioni di rete o database
- **Codice più robusto**: Evita perdite di risorse anche in caso di errori imprevisti

## Combinare `else` e `finally`

È possibile utilizzare entrambe le clausole `else` e `finally` nello stesso blocco `try-except`:

```python
try:
    file = open("dati.txt", "r")
    contenuto = file.read()
except FileNotFoundError:
    print("Il file non esiste!")
else:
    print("Contenuto del file:")
    print(contenuto)
finally:
    if 'file' in locals() and not file.closed:
        file.close()
        print("File chiuso con successo")
```

In questo esempio:
1. Se il file esiste, leggiamo il suo contenuto
2. Se si verifica un'eccezione `FileNotFoundError`, mostriamo un messaggio di errore
3. Solo se non si verificano eccezioni, eseguiamo il blocco `else` per mostrare il contenuto del file
4. Indipendentemente da tutto, eseguiamo il blocco `finally` per chiudere il file se è stato aperto

## Ordine di Esecuzione

Quando si utilizzano tutte le clausole, l'ordine di esecuzione è il seguente:

1. Il blocco `try` viene eseguito
2. Se si verifica un'eccezione nel blocco `try`:
   - Il blocco `except` corrispondente viene eseguito
   - Il blocco `else` viene saltato
3. Se non si verifica alcuna eccezione nel blocco `try`:
   - Nessun blocco `except` viene eseguito
   - Il blocco `else` viene eseguito
4. Indipendentemente da tutto, il blocco `finally` viene sempre eseguito

## Esempio Pratico: Elaborazione di Dati da un File

```python
def elabora_dati(nome_file):
    try:
        file = open(nome_file, "r")
        dati = file.readlines()
    except FileNotFoundError:
        print(f"Errore: Il file {nome_file} non esiste!")
        return None
    except PermissionError:
        print(f"Errore: Non hai i permessi per leggere {nome_file}!")
        return None
    else:
        # Elaborazione dei dati (eseguita solo se non ci sono eccezioni)
        risultati = [linea.strip().upper() for linea in dati]
        print(f"Elaborati {len(risultati)} righe di dati con successo")
        return risultati
    finally:
        # Pulizia (eseguita sempre)
        if 'file' in locals() and not file.closed:
            file.close()
            print("File chiuso")

# Utilizzo della funzione
risultati = elabora_dati("esempio.txt")
if risultati:
    print("Primi 3 risultati:", risultati[:3])
```

Questo esempio mostra un caso d'uso realistico di `try`, `except`, `else` e `finally` per gestire l'elaborazione di dati da un file in modo robusto.

## Conclusione

Le clausole `else` e `finally` completano il meccanismo di gestione delle eccezioni in Python, offrendo un controllo più preciso sul flusso di esecuzione del programma. Utilizzando queste clausole in modo appropriato, puoi scrivere codice più robusto, leggibile e manutenibile.

Nella prossima lezione, esploreremo come sollevare eccezioni personalizzate e utilizzare le istruzioni `raise` e `assert`.

---

[Indice](../README.md) | [Lezione Precedente: Try-Except](02_try_except.md) | [Prossima Lezione: Raise e Assert](04_raise_assert.md)