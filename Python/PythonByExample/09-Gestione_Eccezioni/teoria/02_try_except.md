# Try-Except: Catturare le Eccezioni

In Python, il meccanismo principale per gestire le eccezioni è il blocco `try-except`. Questo costrutto permette di "catturare" le eccezioni quando si verificano e gestirle in modo appropriato, evitando che il programma termini in modo inaspettato.

## Sintassi Base

La sintassi base di un blocco try-except è la seguente:

```python
try:
    # Codice che potrebbe generare un'eccezione
    # ...
except TipoEccezione:
    # Codice che viene eseguito se si verifica un'eccezione del tipo specificato
    # ...
```

## Esempio Semplice

Ecco un esempio di base che mostra come gestire una divisione per zero:

```python
try:
    numero = int(input("Inserisci un numero: "))
    risultato = 10 / numero
    print(f"Il risultato è {risultato}")
except ZeroDivisionError:
    print("Errore: Non puoi dividere per zero!")
```

In questo esempio:
1. Il codice nel blocco `try` tenta di eseguire una divisione
2. Se l'utente inserisce zero, si verifica un'eccezione `ZeroDivisionError`
3. Il blocco `except` cattura questa eccezione specifica e mostra un messaggio di errore
4. Il programma continua l'esecuzione invece di terminare con un errore

## Catturare Più Eccezioni

Puoi gestire diversi tipi di eccezioni in modi diversi:

```python
try:
    numero = int(input("Inserisci un numero: "))
    risultato = 10 / numero
    print(f"Il risultato è {risultato}")
except ValueError:
    print("Errore: Devi inserire un numero valido!")
except ZeroDivisionError:
    print("Errore: Non puoi dividere per zero!")
```

In questo esempio, gestiamo separatamente:
- `ValueError`: si verifica se l'utente inserisce qualcosa che non può essere convertito in un intero
- `ZeroDivisionError`: si verifica se l'utente inserisce zero

## Catturare Più Eccezioni con un Solo Handler

Puoi anche gestire più tipi di eccezioni con lo stesso handler:

```python
try:
    numero = int(input("Inserisci un numero: "))
    risultato = 10 / numero
    print(f"Il risultato è {risultato}")
except (ValueError, ZeroDivisionError):
    print("Errore: Inserisci un numero valido diverso da zero!")
```

## Catturare Tutte le Eccezioni

Puoi catturare qualsiasi eccezione usando `except` senza specificare un tipo:

```python
try:
    # Codice potenzialmente problematico
    numero = int(input("Inserisci un numero: "))
    risultato = 10 / numero
    print(f"Il risultato è {risultato}")
except:
    print("Si è verificato un errore!")
```

**Nota**: Catturare tutte le eccezioni in questo modo è generalmente sconsigliato perché può nascondere errori inaspettati e rendere il debugging più difficile. È meglio specificare i tipi di eccezioni che ti aspetti.

## Accedere all'Oggetto Eccezione

Puoi accedere all'oggetto eccezione stesso usando la sintassi `as`:

```python
try:
    numero = int(input("Inserisci un numero: "))
    risultato = 10 / numero
    print(f"Il risultato è {risultato}")
except Exception as e:
    print(f"Si è verificato un errore: {e}")
    print(f"Tipo di errore: {type(e).__name__}")
```

Questo è utile per ottenere informazioni dettagliate sull'errore, come il messaggio di errore e il tipo di eccezione.

## Catturare Eccezioni Specifiche Prima di Quelle Generiche

Quando usi più blocchi `except`, è importante mettere le eccezioni più specifiche prima di quelle più generiche:

```python
try:
    # Codice potenzialmente problematico
    # ...
except ValueError:
    # Gestisce ValueError
    # ...
except Exception:
    # Gestisce tutte le altre eccezioni
    # ...
```

Se metti `Exception` prima, catturerà tutte le eccezioni (incluso `ValueError`) e il blocco `except ValueError` non verrà mai eseguito.

## Esempio Pratico: Lettura di un File

```python
try:
    with open("dati.txt", "r") as file:
        contenuto = file.read()
    print(contenuto)
except FileNotFoundError:
    print("Il file non esiste!")
except PermissionError:
    print("Non hai i permessi per leggere questo file!")
except Exception as e:
    print(f"Si è verificato un errore imprevisto: {e}")
```

Questo esempio mostra come gestire diversi tipi di errori che potrebbero verificarsi durante la lettura di un file.

## Conclusione

I blocchi `try-except` sono fondamentali per scrivere codice robusto in Python. Ti permettono di anticipare e gestire gli errori in modo elegante, migliorando l'esperienza dell'utente e facilitando il debugging.

Nella prossima lezione, esploreremo le clausole `else` e `finally` che completano il meccanismo di gestione delle eccezioni in Python.

---

[Indice](../README.md) | [Lezione Precedente: Introduzione alle Eccezioni](01_introduzione_eccezioni.md) | [Prossima Lezione: Else e Finally](03_else_finally.md)