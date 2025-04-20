# Stringhe e operazioni sulle stringhe

## Introduzione alle stringhe in Python
Le stringhe in Python sono sequenze di caratteri racchiuse tra apici singoli (`'`) o doppi (`"`). Sono uno dei tipi di dati più comuni e versatili, utilizzati per rappresentare testo e altri tipi di dati basati su caratteri.

```python
# Esempi di dichiarazione di stringhe
nome = "Alice"
messaggio = 'Ciao, mondo!'
frase_lunga = """Questa è una stringa
che si estende su
più righe."""
```

Le stringhe in Python sono immutabili, il che significa che una volta create, non possono essere modificate. Tuttavia, è possibile creare nuove stringhe a partire da quelle esistenti.

## Accesso ai caratteri di una stringa
È possibile accedere ai singoli caratteri di una stringa utilizzando l'operatore di indicizzazione `[]`. In Python, l'indice del primo carattere è 0.

```python
testo = "Python"

# Accesso ai caratteri
primo_carattere = testo[0]    # 'P'
secondo_carattere = testo[1]   # 'y'

# Indici negativi (contano a partire dalla fine)
ultimo_carattere = testo[-1]   # 'n'
penultimo_carattere = testo[-2]  # 'o'
```

## Slicing (sottostringhe)
Lo slicing permette di estrarre una porzione di una stringa specificando un intervallo di indici.

```python
testo = "Python è fantastico"

# Slicing [inizio:fine:passo]
prima_parola = testo[0:6]      # "Python"
seconda_parola = testo[7:9]     # "è"
ultima_parola = testo[10:]      # "fantastico"

# Slicing con passo
caratteri_alternati = testo[::2]  # "Pto  atsi"
stringa_inversa = testo[::-1]    # "ocitsatnaf è nohtyP"
```

## Operazioni comuni sulle stringhe

### Concatenazione
Le stringhe possono essere concatenate (unite) utilizzando l'operatore `+`.

```python
nome = "Mario"
cognome = "Rossi"
nome_completo = nome + " " + cognome  # "Mario Rossi"
```

### Ripetizione
L'operatore `*` può essere utilizzato per ripetere una stringa un certo numero di volte.

```python
linea = "-" * 20  # "--------------------"
```

### Lunghezza di una stringa
La funzione `len()` restituisce il numero di caratteri in una stringa.

```python
testo = "Ciao"
lunghezza = len(testo)  # 4
```

### Verifica di appartenenza
Gli operatori `in` e `not in` possono essere utilizzati per verificare se una sottostringa è presente in una stringa.

```python
frase = "Python è un linguaggio di programmazione"
print("Python" in frase)     # True
print("Java" not in frase)   # True
```

## Metodi delle stringhe
Python offre numerosi metodi incorporati per manipolare le stringhe.

### Metodi di caso
```python
testo = "Python è fantastico"

print(testo.upper())       # "PYTHON È FANTASTICO"
print(testo.lower())       # "python è fantastico"
print(testo.capitalize())  # "Python è fantastico"
print(testo.title())       # "Python È Fantastico"
```

### Metodi di ricerca
```python
testo = "Python è fantastico, Python è potente"

print(testo.count("Python"))        # 2
print(testo.find("fantastico"))     # 10
print(testo.rfind("Python"))        # 23 (ultima occorrenza)
print(testo.startswith("Python"))   # True
print(testo.endswith("potente"))    # True
```

### Metodi di sostituzione e divisione
```python
testo = "Python è fantastico"

# Sostituzione
nuovo_testo = testo.replace("fantastico", "incredibile")
print(nuovo_testo)  # "Python è incredibile"

# Divisione
parole = testo.split(" ")  # ["Python", "è", "fantastico"]
print(parole)

# Unione
nuova_frase = "-".join(parole)  # "Python-è-fantastico"
print(nuova_frase)
```

### Metodi di rimozione spazi
```python
testo = "   Python   "

print(testo.strip())    # "Python"
print(testo.lstrip())   # "Python   "
print(testo.rstrip())   # "   Python"
```

## Formattazione delle stringhe
Python offre diversi modi per formattare le stringhe.

### Operatore %
```python
nome = "Alice"
eta = 30
print("Mi chiamo %s e ho %d anni." % (nome, eta))  # "Mi chiamo Alice e ho 30 anni."
```

### Metodo format()
```python
nome = "Bob"
eta = 25
print("Mi chiamo {} e ho {} anni.".format(nome, eta))  # "Mi chiamo Bob e ho 25 anni."
print("Mi chiamo {1} e ho {0} anni.".format(eta, nome))  # "Mi chiamo Bob e ho 25 anni."
```

### f-string (Python 3.6+)
```python
nome = "Charlie"
eta = 35
print(f"Mi chiamo {nome} e ho {eta} anni.")  # "Mi chiamo Charlie e ho 35 anni."
print(f"Tra 5 anni avrò {eta + 5} anni.")    # "Tra 5 anni avrò 40 anni."
```

## Escape characters
I caratteri di escape permettono di inserire caratteri speciali nelle stringhe.

```python
# Caratteri di escape comuni
print("Prima riga\nSeconda riga")  # Nuova riga
print("Nome:\tAlice")             # Tabulazione
print("Percorso: C:\\Documenti")   # Backslash
print("Citazione: \"Python\"")
```

## Stringhe raw
Le stringhe raw (precedute da `r`) ignorano i caratteri di escape.

```python
print(r"C:\Documenti\nuova_cartella")  # Output: C:\Documenti\nuova_cartella
```

## Conclusione
Le stringhe sono uno dei tipi di dati più versatili in Python e offrono numerose funzionalità per la manipolazione del testo. La comprensione delle operazioni sulle stringhe è fondamentale per qualsiasi programmatore Python, poiché il testo è una forma comune di dati in molte applicazioni.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Tipi di dati numerici](./02_tipi_numerici.md) | [Prossimo: Tipi booleani e operazioni logiche](./04_booleani.md)