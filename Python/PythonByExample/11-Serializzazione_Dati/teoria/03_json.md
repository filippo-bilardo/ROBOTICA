# Serializzazione con JSON

In questa lezione, esploreremo il modulo `json` di Python, uno dei formati di serializzazione più diffusi e versatili, particolarmente utile per lo scambio di dati tra applicazioni diverse.

## Cos'è JSON?

JSON (JavaScript Object Notation) è un formato di scambio dati leggero, human-readable e indipendente dal linguaggio di programmazione. Originariamente derivato da JavaScript, è diventato uno standard ampiamente adottato per la comunicazione tra client e server web, le API REST e la memorizzazione di configurazioni.

Le caratteristiche principali di JSON sono:

- Sintassi semplice e leggibile
- Struttura basata su coppie chiave-valore
- Supporto per tipi di dati comuni (stringhe, numeri, booleani, array, oggetti, null)
- Indipendenza dalla piattaforma e dal linguaggio

## Il Modulo `json` di Python

Python include un modulo `json` nella sua libreria standard che fornisce funzioni per codificare (serializzare) oggetti Python in stringhe JSON e decodificare (deserializzare) stringhe JSON in oggetti Python.

### Serializzazione (Encoding)

```python
import json

# Dizionario Python
dati = {
    'nome': 'Mario',
    'cognome': 'Rossi',
    'età': 35,
    'email': 'mario.rossi@example.com',
    'attivo': True,
    'interessi': ['programmazione', 'musica', 'sport'],
    'indirizzo': {
        'via': 'Via Roma 123',
        'città': 'Milano',
        'cap': '20100'
    }
}

# Serializzazione in una stringa JSON
json_string = json.dumps(dati)
print(json_string)

# Serializzazione in un file JSON con formattazione
with open('dati.json', 'w') as file:
    json.dump(dati, file, indent=4)  # indent per una formattazione leggibile
```

### Deserializzazione (Decoding)

```python
import json

# Deserializzazione da una stringa JSON
json_string = '{"nome": "Mario", "cognome": "Rossi", "età": 35}'
dati = json.loads(json_string)
print(dati['nome'])  # Output: Mario

# Deserializzazione da un file JSON
with open('dati.json', 'r') as file:
    dati_caricati = json.load(file)

print(dati_caricati['indirizzo']['città'])  # Output: Milano
```

## Opzioni di Formattazione

Il modulo `json` offre diverse opzioni per controllare la formattazione dell'output JSON:

```python
import json

dati = {'nome': 'Mario', 'età': 35, 'interessi': ['Python', 'JSON']}

# Formattazione base
print(json.dumps(dati))

# Formattazione con indentazione
print(json.dumps(dati, indent=4))

# Ordinamento delle chiavi
print(json.dumps(dati, sort_keys=True))

# Assicurarsi che le stringhe ASCII siano usate per i caratteri non-ASCII
print(json.dumps({'città': 'Napoli'}, ensure_ascii=True))

# Permettere caratteri non-ASCII nell'output
print(json.dumps({'città': 'Napoli'}, ensure_ascii=False))

# Separatori personalizzati (default: ', ' e ': ')
print(json.dumps(dati, separators=(',', ':')))
```

## Mappatura tra Tipi Python e JSON

Ecco come i tipi di dati Python vengono mappati ai tipi JSON e viceversa:

| Python                                  | JSON    |
|-----------------------------------------|--------|
| dict                                    | object  |
| list, tuple                             | array   |
| str                                     | string  |
| int, float                              | number  |
| True                                    | true    |
| False                                   | false   |
| None                                    | null    |

Esempio di conversione:

```python
import json

# Tipi Python
dati_python = {
    'stringa': 'Hello, JSON!',
    'intero': 42,
    'float': 3.14159,
    'booleano_true': True,
    'booleano_false': False,
    'none': None,
    'lista': [1, 2, 3],
    'tupla': (4, 5, 6),  # Diventerà un array in JSON
    'dizionario': {'a': 1, 'b': 2}
}

# Conversione Python -> JSON
json_string = json.dumps(dati_python, indent=4)
print(f"JSON:\n{json_string}")

# Conversione JSON -> Python
dati_convertiti = json.loads(json_string)

# Verifica dei tipi dopo la conversione
for chiave, valore in dati_convertiti.items():
    print(f"{chiave}: {valore} (tipo Python: {type(valore).__name__})")
```

## Limitazioni di JSON

JSON ha alcune limitazioni importanti da considerare:

1. **Tipi di dati supportati limitati**: Non tutti i tipi Python possono essere serializzati direttamente in JSON
2. **Nessun supporto per oggetti personalizzati**: Le istanze di classi non sono direttamente serializzabili
3. **Nessun supporto per riferimenti circolari**: Strutture dati che si riferiscono a se stesse causano errori
4. **Nessun supporto per tipi di dati complessi**: date, set, bytes, ecc. non sono supportati nativamente

Esempio di errore con tipi non supportati:

```python
import json
import datetime

dati_complessi = {
    'data': datetime.datetime.now(),
    'set': {1, 2, 3},
    'bytes': b'binary data'
}

try:
    json_string = json.dumps(dati_complessi)
except TypeError as e:
    print(f"Errore: {e}")
```

## Gestione di Tipi Complessi

Per gestire tipi di dati non supportati nativamente da JSON, possiamo utilizzare funzioni personalizzate:

```python
import json
import datetime

# Funzione per la serializzazione personalizzata
def serializza_oggetto(obj):
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    elif isinstance(obj, set):
        return list(obj)
    elif isinstance(obj, bytes):
        return obj.decode('utf-8')
    raise TypeError(f"Tipo non serializzabile: {type(obj)}")

# Dati con tipi complessi
dati_complessi = {
    'data': datetime.datetime.now(),
    'set': {1, 2, 3},
    'bytes': b'binary data'
}

# Serializzazione con funzione personalizzata
json_string = json.dumps(dati_complessi, default=serializza_oggetto, indent=4)
print(json_string)

# Funzione per la deserializzazione personalizzata
def deserializza_oggetto(dct):
    # Riconoscimento di date in formato ISO
    for key, value in dct.items():
        if key == 'data' and isinstance(value, str):
            try:
                return datetime.datetime.fromisoformat(value)
            except ValueError:
                pass
    return dct

# Deserializzazione con funzione personalizzata
dati_deserializzati = json.loads(json_string, object_hook=deserializza_oggetto)
print(dati_deserializzati)
```

## Classi Encoder e Decoder Personalizzate

Per un controllo più avanzato, possiamo creare sottoclassi di `JSONEncoder` e `JSONDecoder`:

```python
import json
import datetime

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return {'__datetime__': obj.isoformat()}
        elif isinstance(obj, set):
            return {'__set__': list(obj)}
        return super().default(obj)

class CustomJSONDecoder(json.JSONDecoder):
    def __init__(self, *args, **kwargs):
        json.JSONDecoder.__init__(self, object_hook=self.object_hook, *args, **kwargs)
    
    def object_hook(self, dct):
        if '__datetime__' in dct:
            return datetime.datetime.fromisoformat(dct['__datetime__'])
        if '__set__' in dct:
            return set(dct['__set__'])
        return dct

# Dati con tipi complessi
dati_complessi = {
    'data': datetime.datetime.now(),
    'set': {1, 2, 3}
}

# Serializzazione con encoder personalizzato
json_string = json.dumps(dati_complessi, cls=CustomJSONEncoder, indent=4)
print(json_string)

# Deserializzazione con decoder personalizzato
dati_deserializzati = json.loads(json_string, cls=CustomJSONDecoder)
print(dati_deserializzati)
print(type(dati_deserializzati['data']))  # Dovrebbe essere datetime.datetime
print(type(dati_deserializzati['set']))   # Dovrebbe essere set
```

## Esempio Pratico: Configurazione di un'Applicazione

```python
import json
import os

class ConfigManager:
    def __init__(self, config_file='config.json'):
        self.config_file = config_file
        self.config = self._load_config()
    
    def _load_config(self):
        # Configurazione predefinita
        default_config = {
            'app_name': 'MyApp',
            'version': '1.0.0',
            'debug': False,
            'database': {
                'host': 'localhost',
                'port': 5432,
                'user': 'admin',
                'password': 'password',
                'name': 'myapp_db'
            },
            'logging': {
                'level': 'INFO',
                'file': 'app.log'
            },
            'ui': {
                'theme': 'light',
                'language': 'it',
                'font_size': 12
            }
        }
        
        # Se il file di configurazione esiste, caricalo
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as file:
                    user_config = json.load(file)
                # Unisci la configurazione predefinita con quella dell'utente
                self._merge_configs(default_config, user_config)
                return default_config
            except (json.JSONDecodeError, IOError) as e:
                print(f"Errore nel caricamento della configurazione: {e}")
                return default_config
        else:
            # Crea il file di configurazione con i valori predefiniti
            self.save_config(default_config)
            return default_config
    
    def _merge_configs(self, default_config, user_config):
        # Funzione ricorsiva per unire configurazioni
        for key, value in user_config.items():
            if key in default_config and isinstance(value, dict) and isinstance(default_config[key], dict):
                self._merge_configs(default_config[key], value)
            else:
                default_config[key] = value
    
    def get(self, key, default=None):
        # Supporto per chiavi annidate con notazione a punti (es. 'database.host')
        keys = key.split('.')
        value = self.config
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        return value
    
    def set(self, key, value):
        # Supporto per chiavi annidate
        keys = key.split('.')
        config = self.config
        for i, k in enumerate(keys[:-1]):
            if k not in config or not isinstance(config[k], dict):
                config[k] = {}
            config = config[k]
        config[keys[-1]] = value
    
    def save_config(self, config=None):
        if config is None:
            config = self.config
        try:
            with open(self.config_file, 'w') as file:
                json.dump(config, file, indent=4)
            return True
        except IOError as e:
            print(f"Errore nel salvataggio della configurazione: {e}")
            return False

# Esempio di utilizzo
def main():
    config = ConfigManager('app_config.json')
    
    # Lettura di valori di configurazione
    app_name = config.get('app_name')
    db_host = config.get('database.host')
    theme = config.get('ui.theme')
    
    print(f"App: {app_name}")
    print(f"Database Host: {db_host}")
    print(f"UI Theme: {theme}")
    
    # Modifica di valori di configurazione
    config.set('ui.theme', 'dark')
    config.set('logging.level', 'DEBUG')
    config.set('app.new_feature', True)  # Aggiunta di una nuova impostazione
    
    # Salvataggio della configurazione
    config.save_config()
    
    print("\nConfigurazione aggiornata e salvata.")

# Per eseguire l'esempio, decommentare la riga seguente
# main()
```

## JSON e API Web

JSON è il formato standard per le API web moderne. Ecco un esempio di come utilizzare JSON con le richieste HTTP:

```python
import json
import requests  # Richiede l'installazione: pip install requests

# Effettua una richiesta GET a una API pubblica
response = requests.get('https://jsonplaceholder.typicode.com/posts/1')

# Verifica che la richiesta sia andata a buon fine
if response.status_code == 200:
    # Converti la risposta JSON in un dizionario Python
    data = response.json()  # Equivalente a json.loads(response.text)
    print(f"Titolo: {data['title']}")
    print(f"Corpo: {data['body']}")

# Effettua una richiesta POST con dati JSON
nuovo_post = {
    'title': 'Esempio di POST con JSON',
    'body': 'Questo è un esempio di come inviare dati JSON a un'API.',
    'userId': 1
}

response = requests.post(
    'https://jsonplaceholder.typicode.com/posts',
    json=nuovo_post  # requests converte automaticamente il dizionario in JSON
)

if response.status_code == 201:  # 201 = Created
    data = response.json()
    print(f"\nPost creato con ID: {data['id']}")
    print(f"Titolo: {data['title']}")
```

## Conclusione

JSON è un formato di serializzazione versatile e ampiamente supportato, ideale per lo scambio di dati tra applicazioni diverse, specialmente nel contesto delle API web. Il modulo `json` di Python offre un'interfaccia semplice ma potente per lavorare con questo formato.

Nonostante alcune limitazioni riguardo ai tipi di dati supportati, JSON rimane la scelta preferita per molti scenari di serializzazione grazie alla sua semplicità, leggibilità e interoperabilità tra linguaggi e piattaforme diverse.

Nella prossima lezione, esploreremo la serializzazione con XML, un formato più verboso ma estremamente flessibile e potente.

---

[Indice](../README.md) | [Lezione Precedente: Serializzazione con Pickle](02_pickle.md) | [Prossima Lezione: Serializzazione con XML](04_xml.md)