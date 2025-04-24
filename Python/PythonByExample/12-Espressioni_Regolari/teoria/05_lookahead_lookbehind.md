# Lookahead e Lookbehind

In questa lezione, esploreremo le asserzioni lookahead e lookbehind, strumenti avanzati che ci permettono di creare pattern basati sul contesto senza includere il contesto stesso nella corrispondenza.

## Asserzioni Lookahead e Lookbehind

Le asserzioni lookahead e lookbehind sono un tipo speciale di gruppo non-catturante che verifica se un pattern è presente (o assente) immediatamente prima o dopo la posizione corrente, senza consumare caratteri nella stringa.

### Lookahead Positivo

Il lookahead positivo `(?=...)` verifica se un pattern è presente immediatamente dopo la posizione corrente, senza includerlo nella corrispondenza.

```python
import re

testo = "Python3.9 è l'ultima versione, Python2.7 è obsoleto."

# Trova "Python" solo se seguito da un numero che inizia con 3
pattern = r"Python(?=3\.[0-9])"
risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['Python']
```

In questo esempio, troviamo "Python" solo quando è seguito da "3." e una cifra, ma il numero stesso non fa parte della corrispondenza.

### Lookahead Negativo

Il lookahead negativo `(?!...)` verifica se un pattern NON è presente immediatamente dopo la posizione corrente.

```python
import re

testo = "Python3.9 è l'ultima versione, Python2.7 è obsoleto."

# Trova "Python" solo se NON seguito da un numero che inizia con 2
pattern = r"Python(?!2\.[0-9])"
risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['Python']
```

Qui, troviamo "Python" solo quando NON è seguito da "2." e una cifra.

### Lookbehind Positivo

Il lookbehind positivo `(?<=...)` verifica se un pattern è presente immediatamente prima della posizione corrente, senza includerlo nella corrispondenza.

```python
import re

testo = "Il prezzo è €100 o $50."

# Trova numeri solo se preceduti dal simbolo dell'euro
pattern = r"(?<=€)\d+"
risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['100']
```

In questo esempio, troviamo numeri solo quando sono preceduti dal simbolo dell'euro, ma il simbolo stesso non fa parte della corrispondenza.

### Lookbehind Negativo

Il lookbehind negativo `(?<!...)` verifica se un pattern NON è presente immediatamente prima della posizione corrente.

```python
import re

testo = "Il prezzo è €100 o $50."

# Trova numeri solo se NON preceduti dal simbolo dell'euro
pattern = r"(?<!€)\d+"
risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['50']
```

Qui, troviamo numeri solo quando NON sono preceduti dal simbolo dell'euro.

## Limitazioni dei Lookbehind in Python

È importante notare che in Python, i lookbehind (sia positivi che negativi) hanno una limitazione: il pattern all'interno del lookbehind deve avere una lunghezza fissa o, in alcune versioni più recenti di Python, una lunghezza massima determinabile. Questo significa che non è possibile utilizzare quantificatori come `*`, `+` o `{n,m}` all'interno di un lookbehind, a meno che non definiscano una lunghezza fissa o un intervallo limitato.

```python
import re

testo = "abc123 def456"

# Questo funziona: lookbehind con lunghezza fissa
pattern = r"(?<=abc)\d+"
risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['123']

# Questo NON funziona in molte versioni di Python: lookbehind con lunghezza variabile
# pattern = r"(?<=\w+)\d+"  # Errore in Python < 3.7

# Questo funziona in Python 3.7+: lookbehind con lunghezza variabile ma limitata
pattern = r"(?<=\w{1,3})\d+"
risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['123']
```

## Combinare Lookahead e Lookbehind

Possiamo combinare lookahead e lookbehind per creare pattern molto specifici basati sul contesto.

```python
import re

testo = "<p>Paragrafo</p> <div>Divisione</div> <span>Span</span>"

# Trova il contenuto di tag HTML, ma non i tag stessi
pattern = r"(?<=<[a-z]+>).*?(?=</[a-z]+>)"
risultati = re.findall(pattern, testo)
print(risultati)  # Output: ['Paragrafo', 'Divisione', 'Span']
```

In questo esempio, troviamo il testo tra tag HTML di apertura e chiusura, senza includere i tag stessi nella corrispondenza.

## Esempi Pratici

### Validazione di Password con Requisiti Specifici

```python
import re

def valida_password(password):
    # Verifica che la password contenga almeno una lettera maiuscola,
    # una minuscola, un numero, un carattere speciale e sia lunga almeno 8 caratteri
    return all([
        re.search(r"(?=.*[A-Z])", password),  # Almeno una maiuscola
        re.search(r"(?=.*[a-z])", password),  # Almeno una minuscola
        re.search(r"(?=.*\d)", password),     # Almeno un numero
        re.search(r"(?=.*[!@#$%^&*])", password),  # Almeno un carattere speciale
        re.search(r"(?=.{8,})", password)     # Almeno 8 caratteri
    ])

password1 = "Password123!"
password2 = "password"

print(f"'{password1}' è valida: {valida_password(password1)}")  # Output: 'Password123!' è valida: True
print(f"'{password2}' è valida: {valida_password(password2)}")  # Output: 'password' è valida: False
```

In questo esempio, utilizziamo lookahead positivi per verificare che una password soddisfi tutti i requisiti di sicurezza.

### Estrazione di Testo tra Delimitatori

```python
import re

testo = "Il codice <strong>importante</strong> deve essere evidenziato."

# Estrai il testo tra tag <strong> e </strong>
pattern = r"(?<=<strong>).*?(?=</strong>)"
risultato = re.search(pattern, testo)
print(risultato.group(0))  # Output: importante
```

### Sostituzione Condizionale

```python
import re

testo = "I numeri 123, 456, 789 sono importanti."

# Sostituisci i numeri con "XXX" solo se seguiti da una virgola
def sostituzione(match):
    num = match.group(0)
    if re.search(r"(?=,)", match.string[match.end():]):
        return "XXX"
    return num

pattern = r"\d+"
risultato = re.sub(pattern, sostituzione, testo)
print(risultato)  # Output: I numeri XXX, XXX, 789 sono importanti.
```

### Validazione di URL

```python
import re

def valida_url(url):
    # Verifica che l'URL inizi con http:// o https:// e contenga un dominio valido
    pattern = r"^https?://(?=.*\.)(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/.*)?$"
    return bool(re.match(pattern, url))

url1 = "https://www.esempio.com/pagina"
url2 = "http://esempio..com"
url3 = "ftp://esempio.com"

print(f"'{url1}' è valido: {valida_url(url1)}")  # Output: 'https://www.esempio.com/pagina' è valido: True
print(f"'{url2}' è valido: {valida_url(url2)}")  # Output: 'http://esempio..com' è valido: False
print(f"'{url3}' è valido: {valida_url(url3)}")  # Output: 'ftp://esempio.com' è valido: False
```

In questo esempio, utilizziamo lookahead positivi e negativi per verificare che un URL soddisfi determinati requisiti.

## Conclusione

Le asserzioni lookahead e lookbehind sono strumenti potenti che ci permettono di creare pattern basati sul contesto senza includere il contesto stesso nella corrispondenza. Sono particolarmente utili per la validazione di input, l'estrazione di testo e la sostituzione condizionale.

Nella prossima lezione, esploreremo esempi pratici più complessi che combinano tutte le tecniche che abbiamo imparato finora.

---

[Indice](../README.md) | [Precedente: Quantificatori e Gruppi](04_quantificatori_gruppi.md) | [Successivo: Esempi Pratici](06_esempi_pratici.md)