# Lavorare con File CSV e JSON

Nella programmazione moderna, la gestione di dati strutturati è fondamentale. Due dei formati più comuni per lo scambio di dati sono CSV (Comma-Separated Values) e JSON (JavaScript Object Notation). Python offre librerie integrate per lavorare con entrambi questi formati, rendendo semplice la lettura, la scrittura e la manipolazione di dati strutturati. In questa lezione, esploreremo come utilizzare i moduli `csv` e `json` di Python.

## File CSV

I file CSV (Comma-Separated Values) sono un formato semplice per memorizzare dati tabulari. Ogni riga del file rappresenta una riga della tabella, e i valori all'interno di ogni riga sono separati da un delimitatore, tipicamente una virgola.

### Il Modulo `csv`

Python fornisce il modulo `csv` per lavorare con file CSV:

```python
import csv
```

### Lettura di File CSV

#### Lettura come Liste

```python
import csv

# Apertura del file CSV in modalità lettura
with open('dati.csv', 'r', newline='', encoding='utf-8') as file_csv:
    # Creazione di un lettore CSV
    lettore = csv.reader(file_csv)
    
    # Lettura dell'intestazione (prima riga)
    intestazione = next(lettore)
    print(f"Colonne: {intestazione}")
    
    # Lettura dei dati riga per riga
    for riga in lettore:
        print(riga)  # Ogni riga è una lista di valori
```

#### Lettura come Dizionari

```python
import csv

# Apertura del file CSV
with open('dati.csv', 'r', newline='', encoding='utf-8') as file_csv:
    # Creazione di un lettore CSV che restituisce dizionari
    lettore = csv.DictReader(file_csv)
    
    # Lettura dei dati riga per riga
    for riga in lettore:
        # Ogni riga è un dizionario con chiavi corrispondenti alle intestazioni
        print(riga)  # Es. {'nome': 'Mario', 'età': '30', 'città': 'Roma'}
        
        # Accesso ai singoli campi
        print(f"Nome: {riga['nome']}, Età: {riga['età']}")
```

### Scrittura di File CSV

#### Scrittura di Liste

```python
import csv

# Dati da scrivere
intestazione = ['Nome', 'Età', 'Città']
dati = [
    ['Mario', 30, 'Roma'],
    ['Luigi', 25, 'Milano'],
    ['Giovanna', 35, 'Napoli']
]

# Apertura del file in modalità scrittura
with open('output.csv', 'w', newline='', encoding='utf-8') as file_csv:
    # Creazione di uno scrittore CSV
    scrittore = csv.writer(file_csv)
    
    # Scrittura dell'intestazione
    scrittore.writerow(intestazione)
    
    # Scrittura dei dati
    scrittore.writerows(dati)  # Scrive tutte le righe in una volta
    
    # In alternativa, si può scrivere una riga alla volta
    # for riga in dati:
    #     scrittore.writerow(riga)
```

#### Scrittura di Dizionari

```python
import csv

# Dati da scrivere come lista di dizionari
dati = [
    {'Nome': 'Mario', 'Età': 30, 'Città': 'Roma'},
    {'Nome': 'Luigi', 'Età': 25, 'Città': 'Milano'},
    {'Nome': 'Giovanna', 'Età': 35, 'Città': 'Napoli'}
]

# Apertura del file in modalità scrittura
with open('output.csv', 'w', newline='', encoding='utf-8') as file_csv:
    # Definizione dei campi (intestazioni)
    campi = ['Nome', 'Età', 'Città']
    
    # Creazione di uno scrittore CSV per dizionari
    scrittore = csv.DictWriter(file_csv, fieldnames=campi)
    
    # Scrittura dell'intestazione
    scrittore.writeheader()
    
    # Scrittura dei dati
    scrittore.writerows(dati)  # Scrive tutti i dizionari in una volta
    
    # In alternativa, si può scrivere un dizionario alla volta
    # for riga in dati:
    #     scrittore.writerow(riga)
```

### Personalizzazione del Formato CSV

Il modulo `csv` permette di personalizzare il formato del file CSV:

```python
import csv

# Definizione di un dialetto CSV personalizzato
csv.register_dialect('personalizzato', 
                     delimiter=';',      # Usa punto e virgola come separatore
                     quotechar='"',      # Usa doppi apici per racchiudere i campi
                     quoting=csv.QUOTE_MINIMAL)  # Usa le virgolette solo quando necessario

# Utilizzo del dialetto personalizzato
with open('dati_personalizzati.csv', 'w', newline='', encoding='utf-8') as file_csv:
    scrittore = csv.writer(file_csv, dialect='personalizzato')
    scrittore.writerow(['Nome', 'Cognome', 'Email'])
    scrittore.writerow(['Mario', 'Rossi', 'mario.rossi@example.com'])
```

## File JSON

JSON (JavaScript Object Notation) è un formato leggero per lo scambio di dati, facile da leggere e scrivere per gli umani e facile da analizzare e generare per le macchine. È basato su un sottoinsieme del linguaggio JavaScript.

### Il Modulo `json`

Python fornisce il modulo `json` per lavorare con dati JSON:

```python
import json
```

### Lettura di File JSON

```python
import json

# Apertura e lettura di un file JSON
with open('dati.json', 'r', encoding='utf-8') as file_json:
    # Caricamento dei dati JSON
    dati = json.load(file_json)
    
    # Ora dati è un oggetto Python (dizionario, lista, ecc.)
    print(dati)
    
    # Accesso ai dati (esempio con un dizionario)
    if isinstance(dati, dict):
        for chiave, valore in dati.items():
            print(f"{chiave}: {valore}")
    
    # Accesso ai dati (esempio con una lista)
    if isinstance(dati, list):
        for elemento in dati:
            print(elemento)
```

### Scrittura di File JSON

```python
import json

# Dati Python da convertire in JSON
dati = {
    'nome': 'Mario',
    'età': 30,
    'città': 'Roma',
    'interessi': ['programmazione', 'musica', 'sport'],
    'attivo': True,
    'punteggio': 85.5
}

# Scrittura su file JSON
with open('output.json', 'w', encoding='utf-8') as file_json:
    # Conversione dei dati Python in JSON e scrittura su file
    json.dump(dati, file_json, indent=4)  # indent per formattare il JSON in modo leggibile
```

### Personalizzazione della Serializzazione JSON

Il modulo `json` offre diverse opzioni per personalizzare la serializzazione:

```python
import json
from datetime import datetime

# Funzione per gestire tipi non serializzabili nativamente
def serializzatore_personalizzato(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Tipo non serializzabile: {type(obj)}")

# Dati con un tipo non serializzabile nativamente (datetime)
dati = {
    'nome': 'Mario',
    'data_registrazione': datetime.now()
}

# Serializzazione con gestione personalizzata
with open('output_personalizzato.json', 'w', encoding='utf-8') as file_json:
    json.dump(dati, file_json, 
              default=serializzatore_personalizzato,  # Funzione per tipi non serializzabili
              indent=4,                              # Indentazione per leggibilità
              sort_keys=True)                        # Ordina le chiavi alfabeticamente
```

### Conversione tra Stringhe e Oggetti JSON

Oltre a lavorare con file, il modulo `json` permette di convertire direttamente tra stringhe JSON e oggetti Python:

```python
import json

# Da stringa JSON a oggetto Python
stringa_json = '{"nome": "Mario", "età": 30, "città": "Roma"}'
oggetto_python = json.loads(stringa_json)
print(oggetto_python)  # {'nome': 'Mario', 'età': 30, 'città': 'Roma'}
print(oggetto_python['nome'])  # Mario

# Da oggetto Python a stringa JSON
oggetto_python = {'nome': 'Luigi', 'età': 25, 'attivo': True}
stringa_json = json.dumps(oggetto_python, indent=2)
print(stringa_json)
# {
#   "nome": "Luigi",
#   "età": 25,
#   "attivo": true
# }
```

## Esempi Pratici

### Esempio 1: Conversione da CSV a JSON

```python
import csv
import json

def csv_a_json(file_csv, file_json):
    """Converte un file CSV in un file JSON."""
    # Lista per memorizzare i dati
    dati = []
    
    # Lettura del file CSV
    with open(file_csv, 'r', newline='', encoding='utf-8') as csv_file:
        lettore_csv = csv.DictReader(csv_file)
        for riga in lettore_csv:
            # Conversione dei valori numerici
            for chiave, valore in riga.items():
                # Tenta di convertire in intero o float se possibile
                try:
                    if '.' in valore:
                        riga[chiave] = float(valore)
                    else:
                        riga[chiave] = int(valore)
                except (ValueError, TypeError):
                    pass  # Mantieni come stringa se la conversione fallisce
            
            # Aggiungi la riga convertita alla lista
            dati.append(riga)
    
    # Scrittura del file JSON
    with open(file_json, 'w', encoding='utf-8') as json_file:
        json.dump(dati, json_file, indent=4)
    
    return len(dati)  # Restituisce il numero di record convertiti

# Utilizzo della funzione
try:
    num_record = csv_a_json('dati.csv', 'dati.json')
    print(f"Conversione completata: {num_record} record convertiti")
except Exception as e:
    print(f"Errore durante la conversione: {e}")
```

### Esempio 2: Analisi di Dati CSV

```python
import csv
from collections import Counter

def analizza_vendite(file_csv):
    """Analizza un file CSV di vendite e restituisce statistiche."""
    totale_vendite = 0
    vendite_per_prodotto = Counter()
    vendite_per_regione = Counter()
    
    with open(file_csv, 'r', newline='', encoding='utf-8') as csv_file:
        lettore = csv.DictReader(csv_file)
        
        for riga in lettore:
            # Estrai e converti i dati
            prodotto = riga['Prodotto']
            regione = riga['Regione']
            quantita = int(riga['Quantità'])
            prezzo = float(riga['Prezzo'])
            
            # Calcola il valore della vendita
            valore_vendita = quantita * prezzo
            totale_vendite += valore_vendita
            
            # Aggiorna i contatori
            vendite_per_prodotto[prodotto] += valore_vendita
            vendite_per_regione[regione] += valore_vendita
    
    # Calcola i prodotti più venduti
    prodotti_top = vendite_per_prodotto.most_common(3)
    
    # Calcola le regioni con più vendite
    regioni_top = vendite_per_regione.most_common(3)
    
    return {
        'totale_vendite': totale_vendite,
        'prodotti_top': prodotti_top,
        'regioni_top': regioni_top
    }

# Utilizzo della funzione
try:
    risultati = analizza_vendite('vendite.csv')
    
    print(f"Totale vendite: €{risultati['totale_vendite']:.2f}")
    
    print("\nProdotti più venduti:")
    for prodotto, valore in risultati['prodotti_top']:
        print(f"  {prodotto}: €{valore:.2f}")
    
    print("\nRegioni con più vendite:")
    for regione, valore in risultati['regioni_top']:
        print(f"  {regione}: €{valore:.2f}")
except Exception as e:
    print(f"Errore durante l'analisi: {e}")
```

### Esempio 3: Configurazione dell'Applicazione con JSON

```python
import json
import os

class ConfigManager:
    """Classe per gestire la configurazione dell'applicazione usando JSON."""
    
    def __init__(self, config_file):
        self.config_file = config_file
        self.config = {}
        self.load_config()
    
    def load_config(self):
        """Carica la configurazione dal file JSON."""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as file:
                    self.config = json.load(file)
                print(f"Configurazione caricata da {self.config_file}")
            except json.JSONDecodeError as e:
                print(f"Errore nel formato JSON: {e}")
                # Usa configurazione predefinita
                self.config = self.default_config()
        else:
            print(f"File di configurazione non trovato. Creazione con valori predefiniti.")
            self.config = self.default_config()
            self.save_config()
    
    def save_config(self):
        """Salva la configurazione nel file JSON."""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as file:
                json.dump(self.config, file, indent=4)
            print(f"Configurazione salvata in {self.config_file}")
        except Exception as e:
            print(f"Errore durante il salvataggio della configurazione: {e}")
    
    def get(self, key, default=None):
        """Ottiene un valore di configurazione."""
        return self.config.get(key, default)
    
    def set(self, key, value):
        """Imposta un valore di configurazione e salva."""
        self.config[key] = value
        self.save_config()
    
    def default_config(self):
        """Restituisce la configurazione predefinita."""
        return {
            "app_name": "MyApp",
            "version": "1.0.0",
            "debug_mode": False,
            "theme": "light",
            "recent_files": [],
            "max_recent_files": 5
        }

# Utilizzo della classe ConfigManager
config = ConfigManager('app_config.json')

# Lettura di valori
app_name = config.get('app_name')
debug_mode = config.get('debug_mode')
print(f"Nome app: {app_name}, Debug mode: {debug_mode}")

# Modifica di valori
config.set('theme', 'dark')

# Aggiunta di un file recente
recent_files = config.get('recent_files', [])
if len(recent_files) >= config.get('max_recent_files', 5):
    recent_files.pop(0)  # Rimuove il file più vecchio
recent_files.append('nuovo_file.txt')
config.set('recent_files', recent_files)
```

## Confronto tra CSV e JSON

### Vantaggi di CSV

1. **Semplicità**: Formato semplice e facile da comprendere
2. **Compatibilità**: Supportato da quasi tutti i software di fogli di calcolo e database
3. **Efficienza**: Generalmente più compatto di JSON per dati tabulari semplici
4. **Elaborazione sequenziale**: Può essere elaborato riga per riga, utile per file molto grandi

### Vantaggi di JSON

1. **Struttura gerarchica**: Supporta dati annidati e complessi
2. **Tipi di dati**: Supporta nativamente più tipi di dati (numeri, booleani, null, array, oggetti)
3. **Leggibilità**: Più leggibile per dati complessi
4. **Integrazione web**: Standard de facto per le API web

### Quando Usare Quale Formato

- **Usa CSV quando**:
  - I dati sono tabulari e semplici
  - Hai bisogno di compatibilità con fogli di calcolo
  - Stai lavorando con file molto grandi che devono essere elaborati sequenzialmente

- **Usa JSON quando**:
  - I dati hanno una struttura gerarchica o complessa
  - Hai bisogno di rappresentare diversi tipi di dati
  - Stai lavorando con API web o configurazioni di applicazioni

## Conclusione

I moduli `csv` e `json` di Python offrono strumenti potenti e flessibili per lavorare con due dei formati di dati più comuni. La scelta tra CSV e JSON dipende dalla struttura dei dati e dal caso d'uso specifico.

Ricorda che:

1. CSV è ideale per dati tabulari semplici e compatibilità con fogli di calcolo
2. JSON è preferibile per dati strutturati complessi e integrazione con applicazioni web
3. Entrambi i formati sono ampiamente supportati e possono essere facilmente manipolati con Python

Padroneggiare questi formati ti permetterà di gestire efficacemente l'input e l'output di dati nelle tue applicazioni Python, facilitando l'interoperabilità con altri sistemi e l'analisi dei dati.

---

[Indice](../README.md) | [Lezione Precedente: Context Manager e with Statement](07_context_manager.md)