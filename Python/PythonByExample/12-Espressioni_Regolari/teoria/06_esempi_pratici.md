# Esempi Pratici di Espressioni Regolari

In questa lezione finale, metteremo in pratica tutte le tecniche che abbiamo imparato nelle lezioni precedenti attraverso esempi reali e complessi. Questi esempi vi aiuteranno a comprendere come combinare i vari elementi delle espressioni regolari per risolvere problemi concreti.

## Analisi di Log

Uno degli usi più comuni delle espressioni regolari è l'analisi di file di log. Vediamo come estrarre informazioni utili da un file di log di un server web.

```python
import re

# Esempio di log di un server web
log = """
192.168.1.1 - - [10/Oct/2023:13:55:36 +0200] "GET /index.html HTTP/1.1" 200 2326
192.168.1.2 - - [10/Oct/2023:13:56:12 +0200] "GET /images/logo.png HTTP/1.1" 200 4580
192.168.1.1 - - [10/Oct/2023:13:56:18 +0200] "GET /css/style.css HTTP/1.1" 200 1250
192.168.1.3 - - [10/Oct/2023:13:57:24 +0200] "GET /admin HTTP/1.1" 404 503
192.168.1.4 - - [10/Oct/2023:13:58:10 +0200] "POST /login HTTP/1.1" 302 0
"""

# Estrai IP, data, metodo, URL, codice di stato e dimensione della risposta
pattern = r"(\d+\.\d+\.\d+\.\d+).*?\[(.*?)\]\s+\"(\w+)\s+([^\s]+).*?\"\s+(\d+)\s+(\d+)"
risultati = re.findall(pattern, log)

print("IP\t\tData\t\t\tMetodo\tURL\t\tStato\tDimensione")
print("-" * 80)
for ip, data, metodo, url, stato, dimensione in risultati:
    print(f"{ip}\t{data}\t{metodo}\t{url}\t{stato}\t{dimensione}")

# Conta le richieste per IP
ip_counter = {}
for ip, _, _, _, _, _ in risultati:
    ip_counter[ip] = ip_counter.get(ip, 0) + 1

print("\nConteggio richieste per IP:")
for ip, count in ip_counter.items():
    print(f"{ip}: {count} richieste")

# Trova tutte le richieste con errori (codice 4xx o 5xx)
pattern_errori = r"(\d+\.\d+\.\d+\.\d+).*?\[(.*?)\]\s+\"(\w+)\s+([^\s]+).*?\"\s+([45]\d{2})\s+(\d+)"
richieste_errori = re.findall(pattern_errori, log)

print("\nRichieste con errori:")
for ip, data, metodo, url, stato, _ in richieste_errori:
    print(f"{ip} - {data} - {metodo} {url} - Stato: {stato}")
```

## Parsing di HTML

Sebbene per l'analisi di HTML sia generalmente consigliato utilizzare librerie specializzate come BeautifulSoup, le espressioni regolari possono essere utili per estrazioni semplici.

```python
import re

# Esempio di HTML
html = """
<!DOCTYPE html>
<html>
<head>
    <title>Esempio di Pagina</title>
    <meta name="description" content="Una pagina di esempio per regex">
</head>
<body>
    <h1 class="titolo">Titolo Principale</h1>
    <p>Questo è un paragrafo di <a href="https://esempio.com">esempio</a>.</p>
    <ul>
        <li>Elemento 1</li>
        <li>Elemento 2</li>
        <li>Elemento 3</li>
    </ul>
    <div class="footer">
        <p>Copyright © 2023</p>
    </div>
</body>
</html>
"""

# Estrai il titolo della pagina
pattern_titolo = r"<title>(.*?)</title>"
titolo = re.search(pattern_titolo, html).group(1)
print(f"Titolo: {titolo}")

# Estrai tutti i link
pattern_link = r"<a\s+[^>]*href=['\"]([^'\"]*)['\"][^>]*>(.*?)</a>"
links = re.findall(pattern_link, html)
print("\nLinks:")
for url, testo in links:
    print(f"{testo}: {url}")

# Estrai tutti gli elementi di lista
pattern_li = r"<li>(.*?)</li>"
elements = re.findall(pattern_li, html)
print("\nElementi di lista:")
for elemento in elements:
    print(f"- {elemento}")

# Estrai tutti gli attributi class
pattern_class = r"<([a-z][a-z0-9]*)\s+[^>]*class=['\"]([^'\"]*)['\"][^>]*>"
classi = re.findall(pattern_class, html)
print("\nElementi con classi:")
for tag, classe in classi:
    print(f"Tag: {tag}, Classe: {classe}")
```

## Validazione e Formattazione di Dati

Le espressioni regolari sono spesso utilizzate per validare e formattare dati come numeri di telefono, codici fiscali, ecc.

```python
import re

def valida_codice_fiscale(cf):
    # Validazione semplificata del codice fiscale italiano
    pattern = r"^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$"
    return bool(re.match(pattern, cf))

def formatta_numero_telefono(numero):
    # Formatta un numero di telefono italiano
    pattern = r"^(\+39)?[\s-]*(\d{3})[\s-]*(\d{3})[\s-]*(\d{4})$"
    match = re.match(pattern, numero)
    if match:
        _, prefisso, centrale, finale = match.groups()
        return f"+39 {prefisso} {centrale} {finale}"
    return "Numero non valido"

def valida_partita_iva(piva):
    # Validazione semplificata della partita IVA italiana
    pattern = r"^\d{11}$"
    return bool(re.match(pattern, piva))

# Test delle funzioni
codici_fiscali = ["RSSMRA80A01H501Z", "ABCDEF12G34H567I", "12345678901"]
for cf in codici_fiscali:
    print(f"{cf} è {'valido' if valida_codice_fiscale(cf) else 'non valido'}")

numeri_telefono = ["+39 123 456 7890", "123-456-7890", "1234567890", "12345"]
for numero in numeri_telefono:
    print(f"{numero} -> {formatta_numero_telefono(numero)}")

partite_iva = ["12345678901", "1234567890", "ABCDEFGHIJK"]
for piva in partite_iva:
    print(f"{piva} è {'valida' if valida_partita_iva(piva) else 'non valida'}")
```

## Estrazione di Informazioni da Testo

Le espressioni regolari sono potenti strumenti per estrarre informazioni strutturate da testo non strutturato.

```python
import re

# Esempio di testo
testo = """
Nome: Mario Rossi
Email: mario.rossi@esempio.com
Telefono: +39 123 456 7890
Indirizzo: Via Roma 123, 00100 Roma

Nome: Anna Verdi
Email: anna.verdi@esempio.com
Telefono: +39 098 765 4321
Indirizzo: Via Milano 456, 20100 Milano

Nome: Luca Bianchi
Email: luca.bianchi@esempio.com
Telefono: +39 456 789 0123
Indirizzo: Via Napoli 789, 80100 Napoli
"""

# Estrai tutte le informazioni di contatto
pattern = r"Nome: ([^\n]+)\nEmail: ([^\n]+)\nTelefono: ([^\n]+)\nIndirizzo: ([^\n]+)"
contatti = re.findall(pattern, testo)

print("Contatti estratti:")
for nome, email, telefono, indirizzo in contatti:
    print(f"\nNome: {nome}")
    print(f"Email: {email}")
    print(f"Telefono: {telefono}")
    print(f"Indirizzo: {indirizzo}")

# Estrai solo gli indirizzi email
pattern_email = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
email_list = re.findall(pattern_email, testo)

print("\nIndirizzi email:")
for email in email_list:
    print(email)

# Estrai i CAP
pattern_cap = r"\b\d{5}\b"
cap_list = re.findall(pattern_cap, testo)

print("\nCAP:")
for cap in cap_list:
    print(cap)
```

## Sostituzione Avanzata

Le espressioni regolari possono essere utilizzate per sostituzioni complesse, anche con l'uso di funzioni di callback.

```python
import re

# Esempio di testo
testo = "La temperatura oggi è di 20°C, ieri era di 18°C e domani sarà di 22°C."

# Converti da Celsius a Fahrenheit
def celsius_to_fahrenheit(match):
    celsius = int(match.group(1))
    fahrenheit = celsius * 9/5 + 32
    return f"{fahrenheit:.1f}°F"

pattern = r"(\d+)°C"
risultato = re.sub(pattern, celsius_to_fahrenheit, testo)
print(risultato)

# Esempio di testo con date
testo_date = "Le date importanti sono: 2023-10-15, 2023/11/20 e 15-12-2023."

# Standardizza il formato delle date (da vari formati a GG/MM/AAAA)
def standardizza_data(match):
    anno = match.group(1)
    mese = match.group(2)
    giorno = match.group(3)
    return f"{giorno}/{mese}/{anno}"

pattern_date = r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})|(\d{1,2})[-/](\d{1,2})[-/](\d{4})"

def process_date(match):
    if match.group(1):
        # Formato AAAA-MM-GG
        anno, mese, giorno = match.group(1), match.group(2), match.group(3)
    else:
        # Formato GG-MM-AAAA
        giorno, mese, anno = match.group(4), match.group(5), match.group(6)
    return f"{giorno}/{mese}/{anno}"

risultato_date = re.sub(pattern_date, process_date, testo_date)
print(risultato_date)
```

## Analisi di Codice Sorgente

Le espressioni regolari possono essere utili per analizzare codice sorgente, ad esempio per estrarre commenti, funzioni, ecc.

```python
import re

# Esempio di codice Python
codice = """
# Questa è una funzione di esempio
def somma(a, b):
    """Somma due numeri e restituisce il risultato."""
    return a + b

# Questa è un'altra funzione
def moltiplica(a, b):
    # Moltiplica due numeri
    return a * b

class Calcolatrice:
    """Una semplice calcolatrice."""
    
    def __init__(self):
        self.risultato = 0
    
    def aggiungi(self, n):
        """Aggiunge un numero al risultato."""
        self.risultato += n
        return self.risultato
"""

# Estrai tutte le definizioni di funzioni
pattern_funzioni = r"def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)"
funzioni = re.findall(pattern_funzioni, codice)

print("Funzioni:")
for nome, parametri in funzioni:
    print(f"{nome}({parametri})")

# Estrai tutte le classi
pattern_classi = r"class\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\(([^)]*)\))?"
classi = re.findall(pattern_classi, codice)

print("\nClassi:")
for nome, ereditarieta in classi:
    if ereditarieta:
        print(f"{nome} eredita da {ereditarieta}")
    else:
        print(nome)

# Estrai tutti i commenti (sia # che """)
pattern_commenti_linea = r"#\s*(.*)"
pattern_commenti_doc = r'"""(.*?)"""'

commenti_linea = re.findall(pattern_commenti_linea, codice)
commenti_doc = re.findall(pattern_commenti_doc, codice, re.DOTALL)

print("\nCommenti di linea:")
for commento in commenti_linea:
    print(f"- {commento}")

print("\nDocstring:")
for commento in commenti_doc:
    print(f"- {commento.strip()}")
```

## Espressioni Regolari e File

Le espressioni regolari sono spesso utilizzate per elaborare file, ad esempio per cercare pattern in file di testo o per rinominare file.

```python
import re
import os

# Esempio di ricerca in file
def cerca_in_file(file_path, pattern):
    with open(file_path, 'r', encoding='utf-8') as file:
        contenuto = file.read()
        return re.findall(pattern, contenuto)

# Esempio di rinomina file
def rinomina_file(directory, pattern, sostituzione):
    for filename in os.listdir(directory):
        nuovo_nome = re.sub(pattern, sostituzione, filename)
        if nuovo_nome != filename:
            os.rename(os.path.join(directory, filename), os.path.join(directory, nuovo_nome))
            print(f"Rinominato: {filename} -> {nuovo_nome}")

# Esempio di uso (non eseguito)
print("Esempio di ricerca in file (non eseguito):")
print("cerca_in_file('esempio.txt', r'\\b\\w+ing\\b')")

print("\nEsempio di rinomina file (non eseguito):")
print("rinomina_file('.', r'file_(\\d+)\\.txt', r'documento_\\1.txt')")
```

## Conclusione

In questa lezione, abbiamo esplorato esempi pratici di utilizzo delle espressioni regolari in Python. Abbiamo visto come le regex possono essere utilizzate per analizzare log, estrarre informazioni da HTML, validare e formattare dati, estrarre informazioni da testo, effettuare sostituzioni avanzate e analizzare codice sorgente.

Le espressioni regolari sono uno strumento potente nel toolkit di ogni programmatore. Sebbene possano sembrare complesse all'inizio, con la pratica diventeranno uno strumento indispensabile per manipolare e analizzare testo in modo efficiente.

Ricordate che, sebbene le regex siano potenti, non sono sempre la soluzione migliore per ogni problema. Per compiti complessi come il parsing di HTML o XML, è generalmente consigliato utilizzare librerie specializzate. Tuttavia, per molte attività di manipolazione del testo, le espressioni regolari offrono una soluzione elegante ed efficiente.

---

[Indice](../README.md) | [Precedente: Lookahead e Lookbehind](05_lookahead_lookbehind.md)