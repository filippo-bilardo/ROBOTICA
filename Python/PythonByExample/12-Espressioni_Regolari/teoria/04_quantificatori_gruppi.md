# Quantificatori e Gruppi

In questa lezione, approfondiremo i quantificatori e i gruppi nelle espressioni regolari, strumenti che ci permettono di controllare con precisione il numero di ripetizioni e di catturare parti specifiche del testo.

## Quantificatori

I quantificatori specificano quante volte un elemento può apparire in un pattern. Abbiamo già visto alcuni quantificatori di base nella lezione sui metacaratteri, ma ora li esploreremo in modo più approfondito.

### Elenco dei Principali Quantificatori

| Quantificatore | Descrizione |
|---------------|-------------|
| `*` | Corrisponde a 0 o più ripetizioni dell'elemento precedente |
| `+` | Corrisponde a 1 o più ripetizioni dell'elemento precedente |
| `?` | Corrisponde a 0 o 1 ripetizione dell'elemento precedente |
| `{n}` | Corrisponde esattamente a n ripetizioni dell'elemento precedente |
| `{n,}` | Corrisponde ad almeno n ripetizioni dell'elemento precedente |
| `{n,m}` | Corrisponde da n a m ripetizioni dell'elemento precedente |

### Esempi di Utilizzo dei Quantificatori

```python
import re

testo = "Python è un linguaggio di programmazione potente e versatile."

# Trova parole di 3-6 lettere
pattern = r"\b\w{3,6}\b"
risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['Python', 'è', 'un', 'di', 'e']

# Trova parole che iniziano con 'p' seguite da una o più lettere
pattern = r"\bp\w+\b"
risultati = re.findall(pattern, testo, re.IGNORECASE)
print(risultati)  # Output: ['Python', 'programmazione', 'potente']

# Trova sequenze di consonanti (non vocali)
pattern = r"[^aeiou\s]+"
risultati = re.findall(pattern, testo, re.IGNORECASE)
print(risultati)  # Output: ['Pyth', 'n', 'n', 'l', 'ngg', 'g', 'd', 'pr', 'gr', 'mm', 'z', 'n', 'p', 't', 'nt', 'v', 'rs', 't', 'l']
```

### Quantificatori Avidi vs Pigri

Per impostazione predefinita, i quantificatori sono "avidi" (greedy), il che significa che cercano di corrispondere al maggior numero possibile di caratteri. Aggiungendo un `?` dopo un quantificatore, lo rendiamo "pigro" (lazy), facendogli corrispondere al minor numero possibile di caratteri.

```python
import re

testo = "<div>Contenuto 1</div><div>Contenuto 2</div>"

# Quantificatore avido (default)
pattern_avido = r"<div>.*</div>"
risultati_avidi = re.findall(pattern_avido, testo)
print(risultati_avidi)  # Output: ['<div>Contenuto 1</div><div>Contenuto 2</div>']

# Quantificatore pigro
pattern_pigro = r"<div>.*?</div>"
risultati_pigri = re.findall(pattern_pigro, testo)
print(risultati_pigri)  # Output: ['<div>Contenuto 1</div>', '<div>Contenuto 2</div>']
```

## Gruppi

I gruppi ci permettono di trattare parti di un'espressione regolare come un'unità singola e di catturare sottostringhe corrispondenti.

### Gruppi di Cattura

I gruppi di cattura sono definiti racchiudendo una parte del pattern tra parentesi tonde `()`. Questi gruppi non solo raggruppano pattern, ma catturano anche il testo corrispondente per un uso successivo.

```python
import re

testo = "La data è 2023-11-15 e l'ora è 14:30:45"

# Cattura data e ora
pattern = r"(\d{4})-(\d{2})-(\d{2}).*?(\d{2}):(\d{2}):(\d{2})"
risultato = re.search(pattern, testo)

if risultato:
    anno, mese, giorno, ora, minuto, secondo = risultato.groups()
    print(f"Anno: {anno}, Mese: {mese}, Giorno: {giorno}")
    print(f"Ora: {ora}, Minuto: {minuto}, Secondo: {secondo}")
# Output:
# Anno: 2023, Mese: 11, Giorno: 15
# Ora: 14, Minuto: 30, Secondo: 45
```

### Gruppi Non-Catturanti

A volte vogliamo raggruppare parti di un pattern senza catturare il testo corrispondente. Per questo, usiamo la sintassi `(?:...)` per creare gruppi non-catturanti.

```python
import re

testo = "Il mio indirizzo email è utente@esempio.com e il mio sito è www.esempio.it"

# Gruppo non-catturante per il dominio
pattern = r"\b[\w.%+-]+@(?:[\w-]+\.)+[A-Za-z]{2,}\b"
email = re.search(pattern, testo).group(0)
print(email)  # Output: utente@esempio.com
```

### Riferimenti Indietro (Backreferences)

I riferimenti indietro ci permettono di fare riferimento a gruppi di cattura precedenti all'interno dello stesso pattern. Usiamo `\1`, `\2`, ecc. per riferirci al primo, secondo, ecc. gruppo di cattura.

```python
import re

# Trova parole ripetute
testo = "Questo è è un esempio di testo con parole parole ripetute."
pattern = r"\b(\w+)\s+\1\b"
risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['è', 'parole']

# Trova tag HTML corrispondenti
testo_html = "<h1>Titolo</h1><p>Paragrafo</p>"
pattern = r"<([a-z][a-z0-9]*)>.*?</\1>"
risultati = re.findall(pattern, testo_html)
print(risultati)  # Output: ['h1', 'p']
```

### Gruppi Nominati

Python supporta anche i gruppi nominati, che rendono il codice più leggibile quando si lavora con molti gruppi. Usiamo la sintassi `(?P<nome>...)` per definire un gruppo nominato e `(?P=nome)` per riferirci ad esso.

```python
import re

testo = "La data è 2023-11-15"

# Gruppi nominati per la data
pattern = r"(?P<anno>\d{4})-(?P<mese>\d{2})-(?P<giorno>\d{2})"
risultato = re.search(pattern, testo)

if risultato:
    print(f"Anno: {risultato.group('anno')}")
    print(f"Mese: {risultato.group('mese')}")
    print(f"Giorno: {risultato.group('giorno')}")
# Output:
# Anno: 2023
# Mese: 11
# Giorno: 15

# Riferimento a un gruppo nominato nello stesso pattern
testo_html = "<div class='importante'>Contenuto</div>"
pattern = r"<(?P<tag>[a-z]+)[^>]*>.*?</(?P=tag)>"
risultato = re.search(pattern, testo_html)
print(risultato.group(0))  # Output: <div class='importante'>Contenuto</div>
```

## Esempi Pratici

### Estrazione di Informazioni da un Testo Strutturato

```python
import re

testo = """
Nome: Mario Rossi
Email: mario.rossi@esempio.com
Telefono: +39 123 456 7890
Indirizzo: Via Roma 123, 00100 Roma
"""

# Estrai tutte le informazioni
pattern = r"Nome: (.+)\nEmail: (.+)\nTelefono: (.+)\nIndirizzo: (.+)"
risultato = re.search(pattern, testo, re.DOTALL)

if risultato:
    nome, email, telefono, indirizzo = risultato.groups()
    print(f"Nome: {nome}")
    print(f"Email: {email}")
    print(f"Telefono: {telefono}")
    print(f"Indirizzo: {indirizzo}")
```

### Validazione di Password Complessa

```python
import re

def valida_password(password):
    # Almeno 8 caratteri, almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale
    pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$"
    return bool(re.match(pattern, password))

password1 = "Password123!"
password2 = "password"

print(f"'{password1}' è valida: {valida_password(password1)}")  # Output: 'Password123!' è valida: True
print(f"'{password2}' è valida: {valida_password(password2)}")  # Output: 'password' è valida: False
```

### Sostituzione Avanzata con Gruppi

```python
import re

# Inverti nome e cognome
testo = "Rossi Mario, Bianchi Laura, Verdi Giuseppe"
pattern = r"(\w+)\s+(\w+)"
risultato = re.sub(pattern, r"\2 \1", testo)
print(risultato)  # Output: Mario Rossi, Laura Bianchi, Giuseppe Verdi

# Formatta numeri di telefono
testo = "Telefono: 1234567890, 123-456-7890, (123)456-7890"
pattern = r"(\d{3})[\-\s]?(\d{3})[\-\s]?(\d{4})"
risultato = re.sub(pattern, r"(\1) \2-\3", testo)
print(risultato)  # Output: Telefono: (123) 456-7890, (123) 456-7890, (123) 456-7890
```

## Conclusione

I quantificatori e i gruppi sono strumenti potenti che ci permettono di creare pattern complessi e flessibili. I quantificatori ci consentono di specificare il numero di ripetizioni, mentre i gruppi ci permettono di catturare e manipolare parti specifiche del testo.

Nella prossima lezione, esploreremo le asserzioni lookahead e lookbehind, che ci permetteranno di creare pattern ancora più sofisticati basati sul contesto.

---

[Indice](../README.md) | [Precedente: Metacaratteri e Classi di Caratteri](03_metacaratteri.md) | [Successivo: Lookahead e Lookbehind](05_lookahead_lookbehind.md)