# Collections: Strutture Dati Avanzate

## Introduzione

Il modulo `collections` fa parte della Libreria Standard di Python e fornisce alternative specializzate alle strutture dati integrate di Python come liste, tuple e dizionari. Queste strutture dati alternative sono progettate per casi d'uso specifici e possono migliorare significativamente la leggibilità e le prestazioni del codice in determinate situazioni.

In questa guida, esploreremo le principali strutture dati offerte dal modulo `collections` e vedremo come utilizzarle efficacemente nei nostri programmi.

## Principali Strutture Dati in collections

### 1. `namedtuple`: Tuple con Campi Nominati

Le `namedtuple` sono un'estensione delle tuple standard che permettono di accedere agli elementi tramite nomi di attributi, oltre che tramite indici. Sono immutabili come le tuple normali, ma offrono una maggiore leggibilità e auto-documentazione del codice.

```python
from collections import namedtuple

# Definizione di una namedtuple
Persona = namedtuple('Persona', ['nome', 'cognome', 'eta'])

# Creazione di un'istanza
p = Persona('Mario', 'Rossi', 30)

# Accesso ai campi tramite nome
print(f"Nome: {p.nome}")
print(f"Cognome: {p.cognome}")
print(f"Età: {p.eta}")

# Accesso ai campi tramite indice (come una tupla normale)
print(f"Nome: {p[0]}")
print(f"Cognome: {p[1]}")
print(f"Età: {p[2]}")

# Unpacking
nome, cognome, eta = p
print(f"{nome} {cognome}, {eta} anni")

# Conversione in dizionario
p_dict = p._asdict()
print(p_dict)  # {'nome': 'Mario', 'cognome': 'Rossi', 'eta': 30}
```

Vantaggi delle `namedtuple`:
- Accesso ai campi tramite nomi significativi
- Immutabilità (come le tuple normali)
- Supporto per l'unpacking e altre operazioni delle tuple
- Metodi utili come `_asdict()`, `_replace()`, `_fields`

### 2. `defaultdict`: Dizionari con Valori Predefiniti

Un `defaultdict` è una sottoclasse di `dict` che chiama una factory function per fornire valori predefiniti quando si accede a chiavi non esistenti, evitando l'errore `KeyError`.

```python
from collections import defaultdict

# defaultdict con int come factory function
conteggio = defaultdict(int)

# Incremento di contatori senza controlli di esistenza
parole = ['mela', 'banana', 'mela', 'arancia', 'banana', 'mela']
for parola in parole:
    conteggio[parola] += 1

print(conteggio)  # defaultdict(<class 'int'>, {'mela': 3, 'banana': 2, 'arancia': 1})

# defaultdict con list come factory function
raggruppamento = defaultdict(list)

# Aggiunta di elementi a liste senza controlli di esistenza
dati = [('A', 1), ('B', 2), ('A', 3), ('B', 4), ('C', 5)]
for chiave, valore in dati:
    raggruppamento[chiave].append(valore)

print(raggruppamento)  # defaultdict(<class 'list'>, {'A': [1, 3], 'B': [2, 4], 'C': [5]})

# defaultdict con una factory function personalizzata
def valore_predefinito():
    return 'Non disponibile'

info = defaultdict(valore_predefinito)
info['nome'] = 'Mario'

print(info['nome'])        # 'Mario'
print(info['cognome'])     # 'Non disponibile' (chiave non esistente)
```

Vantaggi di `defaultdict`:
- Elimina la necessità di controllare l'esistenza delle chiavi
- Semplifica il codice per conteggi, raggruppamenti e altre operazioni comuni
- Supporta qualsiasi callable come factory function

### 3. `Counter`: Dizionario per Conteggi

`Counter` è una sottoclasse di `dict` specializzata per il conteggio di oggetti hashable. È particolarmente utile per contare elementi in una sequenza o implementare algoritmi di multiset.

```python
from collections import Counter

# Conteggio di elementi in una lista
frutta = ['mela', 'banana', 'mela', 'arancia', 'banana', 'mela']
conteggio = Counter(frutta)

print(conteggio)  # Counter({'mela': 3, 'banana': 2, 'arancia': 1})

# Accesso ai conteggi
print(f"Mele: {conteggio['mela']}")
print(f"Pere: {conteggio['pera']}")  # Restituisce 0 invece di KeyError

# Metodi utili
print(f"Elementi più comuni: {conteggio.most_common(2)}")  # [('mela', 3), ('banana', 2)]

# Operazioni matematiche
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)

print(c1 + c2)  # Counter({'a': 4, 'b': 3})
print(c1 - c2)  # Counter({'a': 2})

# Aggiornamento del conteggio
conteggio.update(['mela', 'pera', 'pera'])
print(conteggio)  # Counter({'mela': 4, 'banana': 2, 'pera': 2, 'arancia': 1})
```

Vantaggi di `Counter`:
- API semplice per conteggi e multiset
- Restituisce zero per elementi non presenti (invece di KeyError)
- Metodi specializzati come `most_common()`, `elements()`, `subtract()`
- Supporto per operazioni matematiche di multiset

### 4. `OrderedDict`: Dizionari che Mantengono l'Ordine di Inserimento

`OrderedDict` è una sottoclasse di `dict` che ricorda l'ordine in cui le coppie chiave-valore sono state inserite. A partire da Python 3.7, anche i dizionari standard mantengono l'ordine di inserimento, ma `OrderedDict` offre metodi aggiuntivi e un comportamento specifico per l'ordinamento.

```python
from collections import OrderedDict

# Creazione di un OrderedDict
ord_dict = OrderedDict([('a', 1), ('b', 2), ('c', 3)])

# Aggiunta di elementi (l'ordine viene mantenuto)
ord_dict['d'] = 4
ord_dict['e'] = 5

print(ord_dict)  # OrderedDict([('a', 1), ('b', 2), ('c', 3), ('d', 4), ('e', 5)])

# Spostamento di un elemento alla fine
ord_dict.move_to_end('b')
print(ord_dict)  # OrderedDict([('a', 1), ('c', 3), ('d', 4), ('e', 5), ('b', 2)])

# Spostamento di un elemento all'inizio
ord_dict.move_to_end('e', last=False)
print(ord_dict)  # OrderedDict([('e', 5), ('a', 1), ('c', 3), ('d', 4), ('b', 2)])

# Rimozione dell'ultimo elemento
chiave, valore = ord_dict.popitem()
print(f"Rimosso: {chiave}={valore}")  # Rimosso: b=2

# Rimozione del primo elemento
chiave, valore = ord_dict.popitem(last=False)
print(f"Rimosso: {chiave}={valore}")  # Rimosso: e=5
```

Vantaggi di `OrderedDict`:
- Garantisce l'ordine di inserimento (importante per versioni di Python < 3.7)
- Metodi specializzati come `move_to_end()` e `popitem(last=False)`
- Comportamento specifico per l'uguaglianza (due OrderedDict sono uguali solo se hanno lo stesso ordine)

### 5. `deque`: Code a Doppia Estremità

`deque` (double-ended queue) è una generalizzazione di stack e code che supporta l'aggiunta e la rimozione efficienti di elementi da entrambe le estremità. È implementata come una lista collegata e offre prestazioni O(1) per le operazioni su entrambe le estremità, a differenza delle liste che hanno prestazioni O(n) per le operazioni all'inizio.

```python
from collections import deque

# Creazione di una deque
d = deque([1, 2, 3, 4, 5])
print(d)  # deque([1, 2, 3, 4, 5])

# Aggiunta di elementi
d.append(6)        # Aggiunge alla fine
d.appendleft(0)    # Aggiunge all'inizio
print(d)  # deque([0, 1, 2, 3, 4, 5, 6])

# Rimozione di elementi
ultimo = d.pop()      # Rimuove dalla fine
primo = d.popleft()   # Rimuove dall'inizio
print(f"Primo: {primo}, Ultimo: {ultimo}")
print(d)  # deque([1, 2, 3, 4, 5])

# Rotazione degli elementi
d.rotate(2)    # Rotazione a destra di 2 posizioni
print(d)  # deque([4, 5, 1, 2, 3])

d.rotate(-2)   # Rotazione a sinistra di 2 posizioni
print(d)  # deque([1, 2, 3, 4, 5])

# Limitazione della dimensione
d = deque([1, 2, 3, 4, 5], maxlen=5)
print(d)  # deque([1, 2, 3, 4, 5], maxlen=5)

d.append(6)    # Aggiunge 6 e rimuove 1 (il più vecchio)
print(d)  # deque([2, 3, 4, 5, 6], maxlen=5)
```

Vantaggi di `deque`:
- Operazioni O(1) su entrambe le estremità
- Supporto per la rotazione degli elementi
- Possibilità di limitare la dimensione (utile per buffer circolari)
- Implementazione thread-safe

### 6. `ChainMap`: Combinazione di Dizionari

`ChainMap` è una struttura dati che raggruppa più dizionari in una singola vista. Le ricerche attraversano i dizionari nell'ordine specificato fino a trovare la chiave. È utile per contesti con più livelli di scope, come la risoluzione di variabili in linguaggi di programmazione.

```python
from collections import ChainMap

# Dizionari di configurazione
defaults = {'tema': 'chiaro', 'lingua': 'it', 'debug': False}
user_settings = {'tema': 'scuro'}

# Combinazione dei dizionari
config = ChainMap(user_settings, defaults)

# Le ricerche controllano prima user_settings, poi defaults
print(f"Tema: {config['tema']}")      # 'scuro' (da user_settings)
print(f"Lingua: {config['lingua']}")   # 'it' (da defaults)

# Modifica di valori
config['debug'] = True    # Modifica il primo dizionario (user_settings)
print(config['debug'])    # True
print(user_settings)      # {'tema': 'scuro', 'debug': True}

# Aggiunta di un nuovo livello
cli_args = {'lingua': 'en'}
config = ChainMap(cli_args, user_settings, defaults)
print(f"Lingua: {config['lingua']}")   # 'en' (da cli_args)

# Accesso ai dizionari sottostanti
print(config.maps)  # [{'lingua': 'en'}, {'tema': 'scuro', 'debug': True}, {'tema': 'chiaro', 'lingua': 'it', 'debug': False}]

# Creazione di una nuova catena con un dizionario vuoto all'inizio
new_config = config.new_child()
new_config['tema'] = 'blu'
print(new_config['tema'])  # 'blu'
print(config['tema'])      # 'scuro'
```

Vantaggi di `ChainMap`:
- Combinazione di più dizionari senza copiarli
- Supporto per la risoluzione gerarchica delle chiavi
- Aggiornamenti in tempo reale (se i dizionari sottostanti cambiano)
- Metodi utili come `new_child()` e `parents`

## Altre Strutture Dati in collections

### `UserDict`, `UserList`, e `UserString`

Queste classi sono wrapper per i tipi integrati `dict`, `list`, e `str` che facilitano la creazione di sottoclassi personalizzate.

```python
from collections import UserDict

class CaseInsensitiveDict(UserDict):
    def __getitem__(self, key):
        return self.data[key.lower() if isinstance(key, str) else key]
    
    def __setitem__(self, key, value):
        self.data[key.lower() if isinstance(key, str) else key] = value

# Utilizzo del dizionario case-insensitive
d = CaseInsensitiveDict()
d['Nome'] = 'Mario'
print(d['nome'])  # 'Mario'
```

## Casi d'Uso Comuni

### Conteggio di Elementi

```python
from collections import Counter

# Conteggio delle parole in un testo
testo = """Python è un linguaggio di programmazione di alto livello, orientato agli oggetti, 
con una semantica dinamica. Python è un linguaggio molto potente e versatile."""

parole = testo.lower().split()
conteggio = Counter(parole)

print("Parole più comuni:")
for parola, count in conteggio.most_common(5):
    print(f"{parola}: {count}")
```

### Implementazione di una Cache LRU (Least Recently Used)

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cache = OrderedDict()
        self.capacity = capacity
    
    def get(self, key):
        if key not in self.cache:
            return -1
        
        # Sposta l'elemento alla fine (più recentemente usato)
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key, value):
        # Se la chiave esiste già, aggiorna il valore e spostala alla fine
        if key in self.cache:
            self.cache[key] = value
            self.cache.move_to_end(key)
            return
        
        # Se la cache è piena, rimuovi l'elemento meno recentemente usato
        if len(self.cache) >= self.capacity:
            self.cache.popitem(last=False)
        
        # Aggiungi il nuovo elemento
        self.cache[key] = value

# Utilizzo della cache LRU
cache = LRUCache(2)
cache.put(1, 1)    # cache: {1=1}
cache.put(2, 2)    # cache: {1=1, 2=2}
print(cache.get(1))    # restituisce 1, cache: {2=2, 1=1}
cache.put(3, 3)    # rimuove la chiave 2, cache: {1=1, 3=3}
print(cache.get(2))    # restituisce -1 (non trovato)
```

### Gestione di Configurazioni Multilivello

```python
from collections import ChainMap
import os

def get_config():
    # Configurazioni predefinite
    defaults = {
        'debug': False,
        'host': 'localhost',
        'port': 8000,
        'theme': 'light'
    }
    
    # Configurazioni da file (simulate)
    file_config = {
        'host': '0.0.0.0',
        'theme': 'dark'
    }
    
    # Configurazioni da variabili d'ambiente
    env_config = {}
    for key in defaults:
        env_var = f"APP_{key.upper()}"
        if env_var in os.environ:
            env_config[key] = os.environ[env_var]
    
    # Configurazioni da argomenti CLI (simulate)
    cli_config = {
        'debug': True
    }
    
    # Combina le configurazioni con priorità crescente
    return ChainMap(cli_config, env_config, file_config, defaults)

# Utilizzo della configurazione
config = get_config()
print(f"Debug: {config['debug']}")    # True (da cli_config)
print(f"Host: {config['host']}")      # '0.0.0.0' (da file_config)
print(f"Port: {config['port']}")      # 8000 (da defaults)
print(f"Theme: {config['theme']}")    # 'dark' (da file_config)
```

## Conclusione

Il modulo `collections` offre strutture dati specializzate che possono migliorare significativamente la leggibilità, l'efficienza e la manutenibilità del codice Python. Queste strutture dati sono progettate per risolvere problemi comuni in modo elegante e performante.

La scelta della struttura dati appropriata può avere un impatto significativo sulla qualità del codice e sulle prestazioni dell'applicazione. Conoscere le opzioni disponibili nel modulo `collections` è quindi un'abilità preziosa per ogni sviluppatore Python.

## Esercizi

1. Scrivi una funzione che utilizzi `Counter` per trovare i tre caratteri più comuni in una stringa.

2. Implementa una coda FIFO (First-In-First-Out) con dimensione limitata utilizzando `deque`.

3. Crea una classe `HistoryDict` che estende `OrderedDict` per mantenere una cronologia delle modifiche apportate al dizionario.

4. Utilizza `defaultdict` per raggruppare una lista di persone per la prima lettera del loro cognome.

5. Implementa un sistema di gestione delle variabili di ambiente utilizzando `ChainMap` che combini variabili d'ambiente del sistema, variabili definite in un file di configurazione e variabili definite dall'utente.