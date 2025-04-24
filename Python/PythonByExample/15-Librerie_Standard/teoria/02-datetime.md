# Datetime: Gestione di Date e Orari

## Introduzione

La gestione di date e orari è un'operazione comune in molte applicazioni. Python offre il modulo `datetime` nella sua Libreria Standard per lavorare con date, orari, intervalli di tempo e operazioni correlate.

Il modulo `datetime` fornisce classi per manipolare date e orari in modo sia semplice che complesso. Mentre il modulo `time` fornisce funzioni per lavorare con il tempo, `datetime` offre un'interfaccia più orientata agli oggetti e di più alto livello.

## Classi Principali del Modulo datetime

### 1. `datetime.date`

Rappresenta una data (anno, mese, giorno) nel calendario gregoriano.

```python
from datetime import date

# Data corrente
oggi = date.today()
print(f"Oggi è: {oggi}")  # Esempio: Oggi è: 2023-07-15

# Creare una data specifica
data_nascita = date(1990, 5, 15)
print(f"Data di nascita: {data_nascita}")  # Data di nascita: 1990-05-15

# Accedere ai componenti della data
print(f"Anno: {oggi.year}, Mese: {oggi.month}, Giorno: {oggi.day}")

# Formattare una data
print(f"Data formattata: {oggi.strftime('%d/%m/%Y')}")  # Data formattata: 15/07/2023
```

### 2. `datetime.time`

Rappresenta un orario (ore, minuti, secondi, microsecondi).

```python
from datetime import time

# Creare un orario specifico
orario = time(13, 30, 45, 123456)
print(f"Orario: {orario}")  # Orario: 13:30:45.123456

# Accedere ai componenti dell'orario
print(f"Ore: {orario.hour}, Minuti: {orario.minute}, Secondi: {orario.second}, Microsecondi: {orario.microsecond}")

# Formattare un orario
print(f"Orario formattato: {orario.strftime('%H:%M:%S')}")  # Orario formattato: 13:30:45
```

### 3. `datetime.datetime`

Combina le informazioni di data e orario.

```python
from datetime import datetime

# Datetime corrente
adesso = datetime.now()
print(f"Adesso è: {adesso}")  # Esempio: Adesso è: 2023-07-15 13:30:45.123456

# Creare un datetime specifico
evento = datetime(2023, 12, 31, 23, 59, 59)
print(f"Evento: {evento}")  # Evento: 2023-12-31 23:59:59

# Accedere ai componenti del datetime
print(f"Anno: {adesso.year}, Mese: {adesso.month}, Giorno: {adesso.day}")
print(f"Ore: {adesso.hour}, Minuti: {adesso.minute}, Secondi: {adesso.second}")

# Formattare un datetime
print(f"Datetime formattato: {adesso.strftime('%d/%m/%Y %H:%M:%S')}")  # Datetime formattato: 15/07/2023 13:30:45
```

### 4. `datetime.timedelta`

Rappresenta una durata, la differenza tra due date, orari o datetime.

```python
from datetime import datetime, timedelta

# Datetime corrente
adesso = datetime.now()

# Aggiungere o sottrarre un intervallo di tempo
un_giorno = timedelta(days=1)
domani = adesso + un_giorno
ieri = adesso - un_giorno

print(f"Oggi: {adesso.strftime('%d/%m/%Y')}")
print(f"Domani: {domani.strftime('%d/%m/%Y')}")
print(f"Ieri: {ieri.strftime('%d/%m/%Y')}")

# Creare un timedelta complesso
delta = timedelta(days=2, hours=3, minutes=30, seconds=15)
futuro = adesso + delta
print(f"Tra 2 giorni, 3 ore, 30 minuti e 15 secondi sarà: {futuro}")

# Calcolare la differenza tra due datetime
data_inizio = datetime(2023, 1, 1)
data_fine = datetime(2023, 12, 31)
differenza = data_fine - data_inizio
print(f"Giorni tra le date: {differenza.days}")
```

### 5. `datetime.tzinfo` e `datetime.timezone`

Classi base per la gestione dei fusi orari.

```python
from datetime import datetime, timezone, timedelta

# Datetime corrente in UTC
adesso_utc = datetime.now(timezone.utc)
print(f"Ora UTC: {adesso_utc}")

# Creare un fuso orario specifico (esempio: UTC+2)
tz_rome = timezone(timedelta(hours=2))

# Datetime corrente nel fuso orario specificato
adesso_rome = datetime.now(tz_rome)
print(f"Ora a Roma: {adesso_rome}")

# Convertire un datetime da un fuso orario a un altro
adesso_ny = adesso_utc.astimezone(timezone(timedelta(hours=-4)))
print(f"Ora a New York: {adesso_ny}")
```

## Parsing e Formattazione di Date e Orari

### Formattazione con `strftime()`

Il metodo `strftime()` (string format time) converte un oggetto datetime in una stringa formattata secondo un formato specificato.

```python
from datetime import datetime

adesso = datetime.now()

# Formati comuni
print(adesso.strftime("%Y-%m-%d"))  # 2023-07-15
print(adesso.strftime("%d/%m/%Y"))  # 15/07/2023
print(adesso.strftime("%H:%M:%S"))  # 13:30:45
print(adesso.strftime("%d/%m/%Y %H:%M:%S"))  # 15/07/2023 13:30:45
print(adesso.strftime("%A, %d %B %Y"))  # Saturday, 15 July 2023
```

Ecco alcuni dei codici di formato più comuni:

- `%Y`: Anno con 4 cifre (es. 2023)
- `%y`: Anno con 2 cifre (es. 23)
- `%m`: Mese come numero (01-12)
- `%B`: Nome completo del mese (es. July)
- `%b`: Nome abbreviato del mese (es. Jul)
- `%d`: Giorno del mese (01-31)
- `%A`: Nome completo del giorno della settimana (es. Saturday)
- `%a`: Nome abbreviato del giorno della settimana (es. Sat)
- `%H`: Ora (00-23)
- `%I`: Ora (01-12)
- `%M`: Minuti (00-59)
- `%S`: Secondi (00-59)
- `%f`: Microsecondi (000000-999999)
- `%p`: AM/PM
- `%Z`: Nome del fuso orario

### Parsing con `strptime()`

Il metodo `strptime()` (string parse time) converte una stringa in un oggetto datetime secondo un formato specificato.

```python
from datetime import datetime

# Parsing di una stringa in un oggetto datetime
data_str = "15/07/2023 13:30:45"
data_obj = datetime.strptime(data_str, "%d/%m/%Y %H:%M:%S")
print(f"Oggetto datetime: {data_obj}")

# Altri esempi di parsing
data_str1 = "2023-07-15"
data_obj1 = datetime.strptime(data_str1, "%Y-%m-%d")
print(f"Data: {data_obj1}")

data_str2 = "15 July 2023"
data_obj2 = datetime.strptime(data_str2, "%d %B %Y")
print(f"Data: {data_obj2}")
```

## Operazioni Comuni con Date e Orari

### Calcolo dell'Età

```python
from datetime import date

def calcola_eta(data_nascita):
    oggi = date.today()
    eta = oggi.year - data_nascita.year - ((oggi.month, oggi.day) < (data_nascita.month, data_nascita.day))
    return eta

data_nascita = date(1990, 5, 15)
eta = calcola_eta(data_nascita)
print(f"Età: {eta} anni")
```

### Calcolo della Differenza in Giorni Lavorativi

```python
from datetime import date, timedelta

def giorni_lavorativi_tra(inizio, fine):
    giorni_totali = (fine - inizio).days + 1
    giorni_lavorativi = 0
    
    for i in range(giorni_totali):
        giorno_corrente = inizio + timedelta(days=i)
        # Il weekday() restituisce 0-6 (lunedì-domenica)
        if giorno_corrente.weekday() < 5:  # 0-4 sono giorni lavorativi (lunedì-venerdì)
            giorni_lavorativi += 1
    
    return giorni_lavorativi

inizio = date(2023, 7, 10)  # Lunedì
fine = date(2023, 7, 16)    # Domenica
print(f"Giorni lavorativi: {giorni_lavorativi_tra(inizio, fine)}")  # Dovrebbe essere 5
```

### Calcolo della Data di Scadenza

```python
from datetime import datetime, timedelta

def calcola_scadenza(data_inizio, giorni):
    return data_inizio + timedelta(days=giorni)

data_acquisto = datetime.now()
scadenza_garanzia = calcola_scadenza(data_acquisto, 365)  # 1 anno di garanzia
print(f"Data di acquisto: {data_acquisto.strftime('%d/%m/%Y')}")
print(f"Scadenza garanzia: {scadenza_garanzia.strftime('%d/%m/%Y')}")
```

## Utilizzo di Moduli Aggiuntivi

Per operazioni più avanzate con date e orari, esistono moduli di terze parti come `pytz` per la gestione dei fusi orari e `dateutil` per operazioni più complesse.

### Esempio con `pytz`

```python
from datetime import datetime
import pytz

# Creare un datetime con un fuso orario specifico
tz_rome = pytz.timezone('Europe/Rome')
tz_ny = pytz.timezone('America/New_York')

adesso_rome = datetime.now(tz_rome)
print(f"Ora a Roma: {adesso_rome}")

# Convertire tra fusi orari
adesso_ny = adesso_rome.astimezone(tz_ny)
print(f"Ora a New York: {adesso_ny}")

# Elencare tutti i fusi orari disponibili
print(pytz.all_timezones[:5])  # Mostra i primi 5 fusi orari
```

### Esempio con `dateutil`

```python
from datetime import datetime
from dateutil.relativedelta import relativedelta
from dateutil.parser import parse

# Parsing intelligente di date
data_str = "15 July 2023 at 13:30:45"
data_obj = parse(data_str)
print(f"Data parsata: {data_obj}")

# Operazioni relative con date
adesso = datetime.now()

# Aggiungere 1 mese e 5 giorni
futuro = adesso + relativedelta(months=1, days=5)
print(f"Tra 1 mese e 5 giorni: {futuro}")

# Calcolare l'età precisa
data_nascita = datetime(1990, 5, 15)
eta_precisa = relativedelta(adesso, data_nascita)
print(f"Età: {eta_precisa.years} anni, {eta_precisa.months} mesi, {eta_precisa.days} giorni")
```

## Conclusione

Il modulo `datetime` è uno strumento potente per la gestione di date e orari in Python. Offre una vasta gamma di funzionalità per creare, manipolare e formattare date e orari, nonché per calcolare differenze e intervalli di tempo.

Per applicazioni più complesse, specialmente quelle che coinvolgono fusi orari o calcoli di date relativi, è consigliabile utilizzare moduli aggiuntivi come `pytz` e `dateutil`.

## Esercizi

1. Scrivi una funzione che calcoli quanti giorni mancano al prossimo compleanno di una persona, data la sua data di nascita.

2. Crea un programma che mostri un calendario del mese corrente, evidenziando la data odierna.

3. Implementa una funzione che converta un timestamp Unix (secondi dal 1° gennaio 1970) in un oggetto datetime leggibile.

4. Scrivi un programma che calcoli la durata di un evento, date le date e gli orari di inizio e fine, e la mostri in un formato leggibile (es. "2 giorni, 3 ore, 45 minuti").

5. Crea una funzione che determini se un anno è bisestile, utilizzando il modulo `calendar` o `datetime`.