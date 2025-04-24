# Sintassi di Base delle Espressioni Regolari

In questa lezione, esploreremo la sintassi di base delle espressioni regolari, fornendo le fondamenta necessarie per costruire pattern più complessi.

## Caratteri Letterali

Il modo più semplice per utilizzare le espressioni regolari è cercare caratteri letterali. Questi corrispondono esattamente a se stessi:

```python
import re

pattern = r"python"
testo = "Mi piace programmare in python e Python."

risultati = re.findall(pattern, testo, re.IGNORECASE)  # re.IGNORECASE rende la ricerca case-insensitive
print(risultati)  # Output: ['python', 'Python']
```

## Caratteri Speciali

Alcuni caratteri hanno un significato speciale nelle espressioni regolari e devono essere preceduti da una barra inversa (`\`) se vogliamo cercarli letteralmente:

```
. ^ $ * + ? { } [ ] \ | ( )
```

Esempio:

```python
import re

# Cerchiamo il punto letterale
pattern = r"\."
testo = "Ciao. Come stai?"

risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['.']
```

## Il Punto (.)

Il punto corrisponde a qualsiasi carattere singolo, tranne il newline:

```python
import re

pattern = r"c.t"
testo = "Il gatto è sul tappeto, ma il cot è un errore di battitura."

risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['cat', 'cot']
```

## Classi di Caratteri

Le classi di caratteri permettono di specificare un insieme di caratteri che possono corrispondere in una determinata posizione:

```python
import re

# Corrisponde a 'a', 'e', 'i', 'o', 'u'
pattern = r"[aeiou]"
testo = "Python"

risultati = re.findall(pattern, testo, re.IGNORECASE)
print(risultati)  # Output: ['o']
```

### Intervalli di Caratteri

Possiamo specificare intervalli di caratteri utilizzando il trattino:

```python
import re

# Corrisponde a qualsiasi cifra
pattern = r"[0-9]"
# Equivalente a pattern = r"\d"
testo = "Python 3.9"

risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['3', '9']
```

### Negazione di Classi di Caratteri

Possiamo negare una classe di caratteri utilizzando il carattere `^` all'inizio della classe:

```python
import re

# Corrisponde a qualsiasi carattere che non sia una vocale
pattern = r"[^aeiou]"
testo = "Python"

risultati = re.findall(pattern, testo, re.IGNORECASE)
print(risultati)  # Output: ['P', 'y', 't', 'h', 'n']
```

## Sequenze Speciali

Python fornisce alcune sequenze speciali che rappresentano classi di caratteri comuni:

- `\d`: Corrisponde a qualsiasi cifra (equivalente a `[0-9]`)
- `\D`: Corrisponde a qualsiasi carattere che non sia una cifra (equivalente a `[^0-9]`)
- `\w`: Corrisponde a qualsiasi carattere alfanumerico o underscore (equivalente a `[a-zA-Z0-9_]`)
- `\W`: Corrisponde a qualsiasi carattere che non sia alfanumerico o underscore
- `\s`: Corrisponde a qualsiasi carattere di spazio bianco (spazio, tab, newline, ecc.)
- `\S`: Corrisponde a qualsiasi carattere che non sia uno spazio bianco

Esempio:

```python
import re

testo = "Python 3.9!"

print(re.findall(r"\d", testo))  # Output: ['3', '9']
print(re.findall(r"\w", testo))  # Output: ['P', 'y', 't', 'h', 'o', 'n', '3', '9']
print(re.findall(r"\s", testo))  # Output: [' ']
```

## Ancoraggi

Gli ancoraggi non corrispondono a caratteri, ma a posizioni all'interno della stringa:

- `^`: Corrisponde all'inizio della stringa
- `$`: Corrisponde alla fine della stringa
- `\b`: Corrisponde a un confine di parola
- `\B`: Corrisponde a una posizione che non sia un confine di parola

Esempio:

```python
import re

testo = "Python è un linguaggio di programmazione"

# Parole che iniziano con 'p'
print(re.findall(r"\bp\w+", testo, re.IGNORECASE))  # Output: ['Python', 'programmazione']

# Stringhe che iniziano con 'Python'
print(re.findall(r"^Python", testo))  # Output: ['Python']

# Stringhe che terminano con 'programmazione'
print(re.findall(r"programmazione$", testo))  # Output: ['programmazione']
```

## Alternanza

L'operatore `|` (pipe) permette di specificare alternative:

```python
import re

pattern = r"gatto|cane"
testo = "Ho un gatto e un cane."

risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['gatto', 'cane']
```

## Escape di Caratteri Speciali

Per cercare caratteri che hanno un significato speciale nelle regex, dobbiamo utilizzare la barra inversa:

```python
import re

# Cerchiamo il punto interrogativo letterale
pattern = r"\?"
testo = "Come stai?"

risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['?']
```

## Conclusione

In questa lezione abbiamo esplorato la sintassi di base delle espressioni regolari in Python. Questi concetti fondamentali sono i mattoni con cui costruiremo pattern più complessi nelle prossime lezioni.

Ricorda che la pratica è fondamentale per padroneggiare le espressioni regolari. Prova a sperimentare con diversi pattern e stringhe per consolidare la tua comprensione.

---

[Indice](../README.md) | [Precedente: Introduzione alle Espressioni Regolari](01_introduzione_regex.md) | [Successivo: Metacaratteri e Classi di Caratteri](03_metacaratteri.md)