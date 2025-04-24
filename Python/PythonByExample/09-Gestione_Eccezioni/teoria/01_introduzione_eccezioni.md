# Introduzione alle Eccezioni in Python

Le eccezioni sono eventi che si verificano durante l'esecuzione di un programma e che interrompono il normale flusso delle istruzioni. In Python, le eccezioni sono oggetti che rappresentano errori o situazioni anomale.

## Tipi di Eccezioni in Python

Python ha numerosi tipi di eccezioni predefinite, ognuna progettata per rappresentare un tipo specifico di errore:

### Eccezioni Comuni

- **`SyntaxError`**: Si verifica quando il codice contiene errori di sintassi
- **`NameError`**: Si verifica quando si tenta di accedere a una variabile o funzione che non esiste
- **`TypeError`**: Si verifica quando un'operazione o funzione viene applicata a un oggetto di tipo inappropriato
- **`ValueError`**: Si verifica quando un'operazione o funzione riceve un argomento del tipo corretto ma con un valore inappropriato
- **`IndexError`**: Si verifica quando si tenta di accedere a un indice non valido di una sequenza
- **`KeyError`**: Si verifica quando si tenta di accedere a una chiave non esistente in un dizionario
- **`FileNotFoundError`**: Si verifica quando si tenta di aprire un file che non esiste
- **`ZeroDivisionError`**: Si verifica quando si tenta di dividere per zero
- **`ImportError`**: Si verifica quando un'istruzione di importazione fallisce
- **`IOError`**: Si verifica quando un'operazione di input/output fallisce

## Anatomia di un'Eccezione

Quando si verifica un'eccezione, Python genera un traceback che mostra la sequenza di chiamate che ha portato all'errore. Ecco un esempio:

```python
Traceback (most recent call last):
  File "esempio.py", line 3, in <module>
    risultato = 10 / 0
ZeroDivisionError: division by zero
```

Questo traceback contiene informazioni preziose:
1. Il percorso del file in cui si è verificato l'errore
2. Il numero di riga dove si è verificato l'errore
3. Il codice che ha causato l'errore
4. Il tipo di eccezione
5. Un messaggio che descrive l'errore

## Esempio di Eccezioni Comuni

```python
# SyntaxError
# print("Hello World"

# NameError
print(variabile_non_definita)

# TypeError
"42" + 42

# ValueError
int("quarantadue")

# IndexError
lista = [1, 2, 3]
print(lista[10])

# KeyError
dizionario = {"a": 1, "b": 2}
print(dizionario["c"])

# FileNotFoundError
with open("file_inesistente.txt", "r") as file:
    contenuto = file.read()

# ZeroDivisionError
10 / 0
```

## Gerarchia delle Eccezioni

Le eccezioni in Python sono organizzate in una gerarchia di classi. Tutte le eccezioni derivano dalla classe base `BaseException`, ma la maggior parte delle eccezioni che incontrerai derivano da `Exception`.

Ecco una versione semplificata della gerarchia:

```
BaseException
 ├── SystemExit
 ├── KeyboardInterrupt
 ├── GeneratorExit
 └── Exception
      ├── StopIteration
      ├── ArithmeticError
      │    ├── FloatingPointError
      │    ├── OverflowError
      │    └── ZeroDivisionError
      ├── AssertionError
      ├── AttributeError
      ├── BufferError
      ├── EOFError
      ├── ImportError
      │    └── ModuleNotFoundError
      ├── LookupError
      │    ├── IndexError
      │    └── KeyError
      ├── MemoryError
      ├── NameError
      │    └── UnboundLocalError
      ├── OSError
      │    ├── BlockingIOError
      │    ├── ChildProcessError
      │    ├── ConnectionError
      │    ├── FileExistsError
      │    ├── FileNotFoundError
      │    ├── InterruptedError
      │    ├── IsADirectoryError
      │    ├── NotADirectoryError
      │    ├── PermissionError
      │    ├── ProcessLookupError
      │    └── TimeoutError
      ├── ReferenceError
      ├── RuntimeError
      │    ├── NotImplementedError
      │    └── RecursionError
      ├── SyntaxError
      │    └── IndentationError
      │         └── TabError
      ├── SystemError
      ├── TypeError
      ├── ValueError
      │    └── UnicodeError
      └── Warning
```

Comprendere questa gerarchia è importante quando si gestiscono le eccezioni, poiché ti permette di catturare categorie specifiche di errori.

## Conclusione

Le eccezioni sono una parte fondamentale di Python e comprendere come funzionano è essenziale per scrivere codice robusto. Nella prossima lezione, esploreremo come catturare e gestire queste eccezioni usando i blocchi `try-except`.

---

[Indice](../README.md) | [Prossima Lezione: Try-Except: Catturare le Eccezioni](02_try_except.md)