# Serializzazione con YAML

In questa lezione, esploreremo YAML (YAML Ain't Markup Language), un formato di serializzazione dei dati human-friendly, particolarmente adatto per file di configurazione e situazioni in cui la leggibilità è importante.

## Cos'è YAML?

YAML è un formato di serializzazione dei dati progettato per essere facilmente leggibile dagli esseri umani. Il nome YAML è un acronimo ricorsivo che sta per "YAML Ain't Markup Language" (YAML non è un linguaggio di markup), sottolineando la sua natura di formato di dati piuttosto che di markup.

Le caratteristiche principali di YAML sono:

- **Leggibilità**: Sintassi minimalista e intuitiva
- **Indentazione significativa**: Utilizza spazi per definire la struttura (simile a Python)
- **Supporto per commenti**: Permette di documentare i dati
- **Riferimenti e ancore**: Permette di evitare ripetizioni
- **Compatibilità con JSON**: Ogni file JSON valido è anche un file YAML valido

## Installazione di PyYAML

Per lavorare con YAML in Python, è necessario installare la libreria PyYAML:

```bash
pip install pyyaml
```

## Sintassi di Base di YAML

Ecco alcuni esempi della sintassi di base di YAML:

```yaml
# Questo è un commento in YAML

# Scalari (valori semplici)
stringa: Hello, YAML!  # Stringa senza virgolette
stringa_quotata: "Hello, YAML!"  # Stringa con virgolette
numero_intero: 42  # Intero
numero_float: 3.14159  # Float
booleano: true  # Booleano (true/false)
null_value: null  # Valore nullo (null o ~)
data: 2023-05-15  # Data

# Liste (array)
frutta:
  - mela
  - banana
  - ciliegia

# Lista alternativa (stile flusso)
frutta_flow: [mela, banana, ciliegia]

# Dizionari (oggetti)
persona:
  nome: Mario
  cognome: Rossi
  età: 35
  email: mario.rossi@example.com

# Dizionario alternativo (stile flusso)
persona_flow: {nome: Mario, cognome: Rossi, età: 35}

# Strutture nidificate
utenti:
  - nome: Mario
    cognome: Rossi
    ruoli:
      - admin
      - editor
  - nome: Laura
    cognome: Bianchi
    ruoli:
      - user

# Stringhe multilinea
descrizione: |
  Questa è una stringa
  che si estende su
  più righe.
  L'indentazione viene preservata.

# Stringhe multilinea con folding
descrizione_folded: >
  Questa è una stringa
  che si estende su più righe,
  ma verrà renderizzata come una singola
  linea con spazi.

# Ancore e riferimenti
definizione: &defaults
  versione: 1.0
  encoding: UTF-8
  timeout: 30

configurazione:
  <<: *defaults  # Inserisce tutti i valori di 'defaults'
  timeout: 60    # Sovrascrive il valore specifico
```

## Serializzazione con PyYAML

### Serializzazione (Dumping)

```python
import yaml

# Dati Python da serializzare
dati = {
    'nome': 'Mario',
    'cognome': 'Rossi',
    'età': 35,
    'indirizzo': {
        'via': 'Via Roma 123',
        'città': 'Milano',
        'cap': '20100'
    },
    'interessi': ['programmazione', 'musica', 'sport'],
    'attivo': True,
    'punteggio': 4.5
}

# Serializzazione in una stringa YAML
yaml_string = yaml.dump(dati, default_flow_style=False, sort_keys=False)
print(yaml_string)

# Serializzazione in un file YAML
with open('dati.yaml', 'w') as file:
    yaml.dump(dati, file, default_flow_style=False, sort_keys=False)
```

L'output sarà simile a questo:

```yaml
nome: Mario
cognome: Rossi
età: 35
indirizzo:
  via: Via Roma 123
  città: Milano
  cap: '20100'
interessi:
- programmazione
- musica
- sport
attivo: true
punteggio: 4.5
```

### Deserializzazione (Loading)

```python
import yaml

# Deserializzazione da una stringa YAML
yaml_string = """
nome: Mario
cognome: Rossi
età: 35
indirizzo:
  via: Via Roma 123
  città: Milano
  cap: '20100'
interessi:
- programmazione
- musica
- sport
attivo: true
punteggio: 4.5
"""

dati = yaml.safe_load(yaml_string)
print(dati['nome'])  # Output: Mario
print(dati['indirizzo']['città'])  # Output: Milano

# Deserializzazione da un file YAML
with open('dati.yaml', 'r') as file:
    dati_caricati = yaml.safe_load(file)

print(dati_caricati)
```

## Opzioni di Serializzazione

PyYAML offre diverse opzioni per controllare il formato dell'output:

```python
import yaml

dati = {
    'nome': 'Mario',
    'età': 35,
    'interessi': ['Python', 'YAML', 'JSON']
}

# Stile di flusso predefinito (più compatto)
print("Stile di flusso predefinito:")
print(yaml.dump(dati))

# Stile di flusso disabilitato (più leggibile)
print("\nStile di flusso disabilitato:")
print(yaml.dump(dati, default_flow_style=False))

# Ordinamento delle chiavi
print("\nChiavi ordinate:")
print(yaml.dump(dati, default_flow_style=False, sort_keys=True))

# Indentazione personalizzata
print("\nIndentazione personalizzata:")
print(yaml.dump(dati, default_flow_style=False, indent=4))

# Stile di flusso per le liste ma non per i dizionari
print("\nStile misto:")
print(yaml.dump(dati, default_flow_style=None))
```

## Sicurezza: `safe_load` vs `load`

PyYAML offre due funzioni principali per deserializzare dati YAML:

- `yaml.safe_load()`: Carica solo tipi di dati di base e non esegue codice arbitrario
- `yaml.load()`: Può eseguire codice arbitrario e creare oggetti Python personalizzati

È fortemente consigliato utilizzare `safe_load()` per dati provenienti da fonti non attendibili:

```python
import yaml

# YAML potenzialmente pericoloso
yaml_pericoloso = """
!!python/object/apply:os.system
args: ['echo "Questo potrebbe essere un comando dannoso"']
"""

# Caricamento sicuro (genera un errore)
try:
    dati = yaml.safe_load(yaml_pericoloso)
except yaml.constructor.ConstructorError as e:
    print(f"Errore di sicurezza: {e}")

# Caricamento non sicuro (NON FARE QUESTO con dati non attendibili!)
# dati = yaml.load(yaml_pericoloso, Loader=yaml.Loader)  # Potenzialmente pericoloso!
```

## Tipi di Dati Supportati

YAML supporta una vasta gamma di tipi di dati:

```python
import yaml
import datetime

# Dati con vari tipi
dati_vari = {
    'stringa': 'Hello, YAML!',
    'intero': 42,
    'float': 3.14159,
    'booleano_true': True,
    'booleano_false': False,
    'none': None,
    'data': datetime.date(2023, 5, 15),
    'datetime': datetime.datetime(2023, 5, 15, 14, 30, 0),
    'lista': [1, 2, 3],
    'dizionario': {'a': 1, 'b': 2},
    'set': {1, 2, 3}  # Verrà convertito in una lista
}

# Serializzazione
yaml_string = yaml.dump(dati_vari, default_flow_style=False)
print(yaml_string)

# Deserializzazione
dati_caricati = yaml.safe_load(yaml_string)

# Verifica dei tipi dopo la deserializzazione
for chiave, valore in dati_caricati.items():
    print(f"{chiave}: {valore} (tipo: {type(valore).__name__})")
```

## Gestione di Tipi Personalizzati

Per serializzare tipi di dati personalizzati, è possibile estendere le funzionalità di PyYAML:

```python
import yaml

# Definizione di una classe personalizzata
class Persona:
    def __init__(self, nome, età):
        self.nome = nome
        self.età = età
    
    def __repr__(self):
        return f"Persona(nome='{self.nome}', età={self.età})"

# Definizione di un rappresentatore YAML per la classe Persona
def represent_persona(dumper, persona):
    return dumper.represent_mapping(
        '!persona',
        {'nome': persona.nome, 'età': persona.età}
    )

# Definizione di un costruttore YAML per la classe Persona
def construct_persona(loader, node):
    value = loader.construct_mapping(node)
    return Persona(value['nome'], value['età'])

# Registrazione del rappresentatore e del costruttore
yaml.add_representer(Persona, represent_persona)
yaml.add_constructor('!persona', construct_persona)

# Creazione di un'istanza
persona = Persona('Mario', 35)

# Serializzazione
yaml_string = yaml.dump(persona)
print(f"YAML serializzato:\n{yaml_string}")

# Deserializzazione
persona_caricata = yaml.load(yaml_string, Loader=yaml.Loader)
print(f"Oggetto deserializzato: {persona_caricata}")
print(f"Nome: {persona_caricata.nome}, Età: {persona_caricata.età}")
```

## Confronto tra YAML, JSON e XML

Ecco un confronto tra YAML, JSON e XML per la rappresentazione degli stessi dati:

### Rappresentazione in YAML

```yaml
nome: Mario
cognome: Rossi
età: 35
indirizzo:
  via: Via Roma 123
  città: Milano
  cap: '20100'
interessi:
- programmazione
- musica
- sport
```

### Rappresentazione in JSON

```json
{
  "nome": "Mario",
  "cognome": "Rossi",
  "età": 35,
  "indirizzo": {
    "via": "Via Roma 123",
    "città": "Milano",
    "cap": "20100"
  },
  "interessi": ["programmazione", "musica", "sport"]
}
```

### Rappresentazione in XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persona>
  <nome>Mario</nome>
  <cognome>Rossi</cognome>
  <età>35</età>
  <indirizzo>
    <via>Via Roma 123</via>
    <città>Milano</città>
    <cap>20100</cap>
  </indirizzo>
  <interessi>
    <interesse>programmazione</interesse>
    <interesse>musica</interesse>
    <interesse>sport</interesse>
  </interessi>
</persona>
```

### Confronto

| Caratteristica | YAML | JSON | XML |
|---------------|------|------|-----|
| Leggibilità | Eccellente | Buona | Moderata |
| Verbosità | Minima | Media | Alta |
| Commenti | Supportati | Non supportati | Supportati |
| Tipi di dati | Ampi | Limitati | Limitati (tutto è testo) |
| Riferimenti | Supportati | Non supportati | Limitati |
| Parsing | Moderato | Semplice | Complesso |
| Uso comune | Configurazioni, dati strutturati | API, scambio dati | Documenti, SOAP, configurazioni complesse |

## Esempio Pratico: File di Configurazione

```python
import yaml
import os

class ConfigManager:
    def __init__(self, config_file='config.yaml'):
        self.config_file = config_file
        self.config = self._load_config()
    
    def _load_config(self):
        # Configurazione predefinita
        default_config = {
            'app': {
                'name': 'MyApp',
                'version': '1.0.0',
                'debug': False
            },
            'database': {
                'host': 'localhost',
                'port': 5432,
                'user': 'admin',
                'password': 'password',  # In produzione, usare variabili d'ambiente
                'name': 'myapp_db'
            },
            'logging': {
                'level': 'INFO',
                'file': 'app.log',
                'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            },
            'ui': {
                'theme': 'light',
                'language': 'it',
                'font_size': 12
            },
            'features': {
                'feature1': True,
                'feature2': False,
                'feature3': {
                    'enabled': True,
                    'options': ['option1', 'option2']
                }
            }
        }
        
        # Se il file di configurazione esiste, caricalo
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as file:
                    user_config = yaml.safe_load(file) or {}
                # Unisci la configurazione predefinita con quella dell'utente
                self._merge_configs(default_config, user_config)
                return default_config
            except (yaml.YAMLError, IOError) as e:
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
                yaml.dump(config, file, default_flow_style=False, sort_keys=False)
            return True
        except IOError as e:
            print(f"Errore nel salvataggio della configurazione: {e}")
            return False

# Esempio di utilizzo
def main():
    config = ConfigManager('app_config.yaml')
    
    # Lettura di valori di configurazione
    app_name = config.get('app.name')
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

## Conclusione

YAML è un formato di serializzazione dei dati estremamente leggibile e flessibile, particolarmente adatto per file di configurazione e situazioni in cui la leggibilità è importante. Rispetto a JSON, offre funzionalità aggiuntive come commenti, riferimenti e una sintassi più concisa, mentre rispetto a XML è molto meno verboso e più facile da leggere e scrivere.

PyYAML è una libreria potente e flessibile per lavorare con YAML in Python, offrendo un'ampia gamma di opzioni per la serializzazione e deserializzazione dei dati. Tuttavia, è importante essere consapevoli delle considerazioni di sicurezza e utilizzare sempre `safe_load()` quando si lavora con dati provenienti da fonti non attendibili.

Nella prossima lezione, esploreremo come serializzare oggetti personalizzati in Python, affrontando le sfide e le soluzioni per lavorare con tipi di dati complessi.

---

[Indice](../README.md) | [Lezione Precedente: Serializzazione con XML](04_xml.md) | [Prossima Lezione: Serializzazione di Oggetti Personalizzati](06_oggetti_personalizzati.md)