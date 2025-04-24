# Requests: La Libreria per le Richieste HTTP in Python

## Introduzione

La libreria `Requests` è uno dei pacchetti Python più popolari e semplici da utilizzare per effettuare richieste HTTP. Creata per rendere le interazioni HTTP più intuitive e user-friendly, questa libreria permette di inviare richieste HTTP/1.1 con estrema semplicità, eliminando la necessità di aggiungere manualmente query string agli URL, codificare i dati dei form o gestire complesse autenticazioni.

## Installazione

Per installare Requests, utilizza il gestore di pacchetti pip:

```python
pip install requests
```

## Funzionalità principali

### Effettuare richieste HTTP

Requests supporta tutti i principali metodi HTTP: GET, POST, PUT, DELETE, HEAD e OPTIONS.

```python
import requests

# Richiesta GET
response = requests.get('https://api.example.com/data')

# Richiesta POST
response = requests.post('https://api.example.com/submit', data={'key': 'value'})

# Altri metodi
requests.put('https://api.example.com/update', data={'key': 'new_value'})
requests.delete('https://api.example.com/delete')
requests.head('https://api.example.com/status')
requests.options('https://api.example.com/options')
```

### Gestione delle risposte

Requests semplifica l'accesso ai dati della risposta:

```python
import requests

response = requests.get('https://api.example.com/data')

# Codice di stato HTTP
print(response.status_code)  # 200, 404, 500, ecc.

# Contenuto della risposta
print(response.text)  # Testo della risposta

# Risposta in formato JSON (se applicabile)
data = response.json()
print(data['chiave'])

# Intestazioni della risposta
print(response.headers)

# Verifica se la richiesta è andata a buon fine
if response.ok:  # True se status_code < 400
    print("Richiesta completata con successo")
else:
    print(f"Errore: {response.status_code}")

# Solleva un'eccezione per errori HTTP
response.raise_for_status()
```

### Parametri URL e Query String

Aggiungere parametri alla query string è semplice:

```python
import requests

# Aggiungere parametri alla query string
params = {
    'q': 'python requests',
    'page': 1,
    'limit': 10
}
response = requests.get('https://api.example.com/search', params=params)

# L'URL risultante sarà: https://api.example.com/search?q=python+requests&page=1&limit=10
print(response.url)
```

### Invio di dati

Inviare dati con richieste POST, PUT, ecc.:

```python
import requests

# Invio di dati form
data = {
    'username': 'user123',
    'password': 'securepassword'
}
response = requests.post('https://api.example.com/login', data=data)

# Invio di dati JSON
json_data = {
    'name': 'Mario Rossi',
    'email': 'mario@example.com',
    'age': 30
}
response = requests.post('https://api.example.com/users', json=json_data)
```

### Gestione delle intestazioni HTTP

Aggiungere intestazioni personalizzate alle richieste:

```python
import requests

headers = {
    'User-Agent': 'MyApp/1.0',
    'Authorization': 'Bearer token123',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.example.com/data', headers=headers)
```

### Gestione dei cookie

Requests gestisce automaticamente i cookie:

```python
import requests

# Sessione che mantiene i cookie
session = requests.Session()

# Prima richiesta (es. login)
session.post('https://example.com/login', data={'user': 'mario', 'pass': 'password'})

# Richieste successive utilizzeranno automaticamente i cookie della sessione
response = session.get('https://example.com/profile')
```

### Timeout e gestione degli errori

Gestire timeout e errori di connessione:

```python
import requests
from requests.exceptions import Timeout, ConnectionError

try:
    # Imposta un timeout di 5 secondi
    response = requests.get('https://api.example.com/data', timeout=5)
    response.raise_for_status()  # Solleva eccezione per errori HTTP
except Timeout:
    print("La richiesta è andata in timeout")
except ConnectionError:
    print("Impossibile connettersi al server")
except requests.exceptions.HTTPError as err:
    print(f"Errore HTTP: {err}")
```

## Casi d'uso comuni

### Scaricare un file

```python
import requests

response = requests.get('https://example.com/file.pdf', stream=True)

with open('file_scaricato.pdf', 'wb') as file:
    for chunk in response.iter_content(chunk_size=8192):
        file.write(chunk)
```

### Autenticazione

```python
import requests
from requests.auth import HTTPBasicAuth

# Autenticazione Basic
response = requests.get(
    'https://api.example.com/secure',
    auth=HTTPBasicAuth('username', 'password')
)

# Forma abbreviata per l'autenticazione Basic
response = requests.get('https://api.example.com/secure', auth=('username', 'password'))
```

### Utilizzo di proxy

```python
import requests

proxies = {
    'http': 'http://10.10.10.10:8000',
    'https': 'http://10.10.10.10:8000'
}

response = requests.get('https://example.org', proxies=proxies)
```

## Vantaggi di Requests

- **Semplicità**: API intuitiva e facile da usare
- **Compatibilità**: Funziona con Python 2.7 e 3.x
- **Funzionalità complete**: Supporta tutte le principali funzionalità HTTP
- **Gestione automatica**: Gestisce automaticamente encoding, cookie, reindirizzamenti
- **Comunità attiva**: Ampiamente utilizzata e ben documentata

## Navigazione

- [Torna alla pagina principale](../../README.md)
- [Torna all'indice della sezione](../README.md)
- [Lezione precedente: Introduzione alle librerie di terze parti](./01-introduzione-librerie-terze-parti.md)
- [Prossima lezione: Pandas](./03-pandas.md)