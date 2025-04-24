# Metacaratteri e Classi di Caratteri

In questa lezione, approfondiremo i metacaratteri e le classi di caratteri nelle espressioni regolari, strumenti fondamentali per creare pattern flessibili e potenti.

## Metacaratteri

I metacaratteri sono caratteri con un significato speciale nelle espressioni regolari. Abbiamo già visto alcuni di essi nella lezione precedente, ma ora li esploreremo in modo più approfondito.

### Elenco dei Principali Metacaratteri

| Metacarattere | Descrizione |
|--------------|-------------|
| `.` | Corrisponde a qualsiasi carattere singolo, tranne il newline |
| `^` | Corrisponde all'inizio della stringa |
| `$` | Corrisponde alla fine della stringa |
| `*` | Corrisponde a 0 o più ripetizioni del pattern precedente |
| `+` | Corrisponde a 1 o più ripetizioni del pattern precedente |
| `?` | Corrisponde a 0 o 1 ripetizione del pattern precedente |
| `\` | Carattere di escape per i metacaratteri |
| `|` | Alternanza (OR) tra pattern |
| `()` | Raggruppa pattern e cattura sottostringhe |
| `[]` | Definisce una classe di caratteri |
| `{}` | Specifica un numero esatto o un intervallo di ripetizioni |

## Classi di Caratteri Avanzate

Le classi di caratteri ci permettono di specificare un insieme di caratteri che possono corrispondere in una determinata posizione. Vediamo alcune tecniche avanzate.

### Unione di Classi di Caratteri

Possiamo combinare più classi di caratteri in una singola espressione:

```python
import re

# Corrisponde a vocali o cifre
pattern = r"[aeiou0-9]"
testo = "Python 3.9"

risultati = re.findall(pattern, testo, re.IGNORECASE)
print(risultati)  # Output: ['o', '3', '9']
```

### Classi di Caratteri Predefinite POSIX

In alcuni motori di espressioni regolari (non direttamente in Python, ma utili da conoscere), esistono classi di caratteri predefinite POSIX come `[:alpha:]`, `[:digit:]`, ecc. In Python, utilizziamo invece le sequenze speciali come `\d`, `\w`, ecc.

### Intersezione e Sottrazione di Classi (in alcuni dialetti)

Alcuni dialetti di regex supportano operazioni come intersezione (`[a-z&&[aeiou]]` per vocali minuscole) o sottrazione (`[a-z-[aeiou]]` per consonanti minuscole). Python non supporta direttamente queste operazioni, ma possiamo ottenere risultati simili con pattern più complessi.

## Escape di Metacaratteri all'interno delle Classi di Caratteri

All'interno di una classe di caratteri `[]`, molti metacaratteri perdono il loro significato speciale e possono essere utilizzati direttamente. Tuttavia, alcuni caratteri mantengono un significato speciale e devono essere preceduti da una barra inversa:

- `]` - Chiude la classe di caratteri
- `-` - Definisce un intervallo (a meno che non sia il primo o l'ultimo carattere)
- `^` - Nega la classe (solo se è il primo carattere)
- `\` - Carattere di escape

Esempio:

```python
import re

# Classe che include ], [ e -
pattern = r"[\]\[-]"
testo = "Esempio con [parentesi] e trattino-qui"

risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['[', ']', '-']
```

## Classi di Caratteri Unicode

Python supporta le classi di caratteri Unicode, che sono particolarmente utili quando si lavora con testi in lingue diverse dall'inglese:

```python
import re

# Corrisponde a qualsiasi lettera (inclusi caratteri accentati e di altri alfabeti)
pattern = r"\p{L}"
testo = "Caffè è una parola italiana"

# Nota: \p{L} richiede re.UNICODE e funziona solo in Python 3.8+
risultati = re.findall(pattern, testo, re.UNICODE)
print(risultati)  # Output: ['C', 'a', 'f', 'f', 'è', 'è', 'u', 'n', 'a', ...]
```

Altre classi Unicode utili includono:
- `\p{N}` - Numeri
- `\p{P}` - Punteggiatura
- `\p{S}` - Simboli
- `\p{Z}` - Separatori (spazi)

## Esempi Pratici

### Validazione di un Indirizzo Email Semplice

```python
import re

pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
email = "utente@esempio.com"

if re.match(pattern, email):
    print("Email valida")
else:
    print("Email non valida")
# Output: Email valida
```

### Estrazione di Codici Postali Italiani

```python
import re

pattern = r"\b\d{5}\b"  # 5 cifre delimitate da confini di parola
testo = "I codici postali di Roma includono 00100, 00118, 00121, ecc."

codici_postali = re.findall(pattern, testo)
print(codici_postali)  # Output: ['00100', '00118', '00121']
```

### Ricerca di Parole con Caratteri Specifici

```python
import re

# Parole che contengono sia 'a' che 'e'
pattern = r"\b\w*a\w*e\w*\b|\b\w*e\w*a\w*\b"
testo = "mela pera banana ciliegia limone"

risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['mela', 'pera', 'banana', 'ciliegia', 'limone']
```

## Conclusione

I metacaratteri e le classi di caratteri sono strumenti potenti che ci permettono di creare pattern flessibili e precisi. Padroneggiare questi concetti è fondamentale per utilizzare efficacemente le espressioni regolari in Python.

Nella prossima lezione, esploreremo i quantificatori e i gruppi, che ci permetteranno di controllare con precisione il numero di ripetizioni e di catturare parti specifiche del testo.

---

[Indice](../README.md) | [Precedente: Sintassi di Base](02_sintassi_base.md) | [Successivo: Quantificatori e Gruppi](04_quantificatori_gruppi.md)