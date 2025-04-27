# Tabelle Hash e Set in Python

In questa guida esploreremo le tabelle hash e i set, strutture dati fondamentali che offrono operazioni di ricerca, inserimento e cancellazione estremamente efficienti. Queste strutture sono implementate in Python attraverso i dizionari (`dict`) e gli insiemi (`set`).

## Indice
1. [Introduzione alle Tabelle Hash](#introduzione-alle-tabelle-hash)
2. [Dizionari in Python](#dizionari-in-python)
3. [Set in Python](#set-in-python)
4. [Implementazione di una Tabella Hash](#implementazione-di-una-tabella-hash)
5. [Applicazioni Pratiche](#applicazioni-pratiche)
6. [Analisi della Complessità](#analisi-della-complessità)
7. [Esercizi](#esercizi)

## Introduzione alle Tabelle Hash

Le tabelle hash sono strutture dati che implementano un'associazione chiave-valore utilizzando una funzione di hash per mappare le chiavi a specifiche posizioni in un array. Questo permette di ottenere operazioni di ricerca, inserimento e cancellazione con complessità media O(1).

### Concetti Chiave

- **Funzione di hash**: trasforma una chiave in un indice dell'array
- **Collisioni**: quando due chiavi diverse producono lo stesso valore hash
- **Risoluzione delle collisioni**: tecniche per gestire le collisioni (concatenamento, indirizzamento aperto)
- **Fattore di carico**: rapporto tra numero di elementi e dimensione della tabella

### Funzionamento di Base

```python
# Rappresentazione concettuale di una tabella hash
class SimpleHashTable:
    def __init__(self, size=10):
        self.size = size
        self.table = [None] * size
    
    def hash_function(self, key):
        # Una semplice funzione hash per stringhe
        if isinstance(key, str):
            return sum(ord(c) for c in key) % self.size
        # Per altri tipi di dati
        return hash(key) % self.size
    
    def insert(self, key, value):
        index = self.hash_function(key)
        self.table[index] = value
    
    def get(self, key):
        index = self.hash_function(key)
        return self.table[index]
```

Questa implementazione è estremamente semplificata e non gestisce le collisioni, ma illustra il concetto di base.

## Dizionari in Python

I dizionari sono l'implementazione nativa delle tabelle hash in Python. Offrono un'interfaccia semplice e potente per memorizzare coppie chiave-valore.

### Creazione e Manipolazione

```python
# Creazione di un dizionario
studente = {
    "nome": "Mario",
    "cognome": "Rossi",
    "età": 20,
    "corsi": ["Matematica", "Informatica"]
}

# Accesso ai valori
print(studente["nome"])  # Output: Mario

# Aggiunta o modifica di elementi
studente["email"] = "mario.rossi@esempio.it"
studente["età"] = 21

# Rimozione di elementi
del studente["corsi"]

# Verifica dell'esistenza di una chiave
if "email" in studente:
    print("Email presente")

# Iterazione sulle chiavi
for chiave in studente:
    print(chiave, studente[chiave])

# Iterazione su coppie chiave-valore
for chiave, valore in studente.items():
    print(chiave, valore)
```

### Metodi Utili dei Dizionari

```python
# Ottenere tutte le chiavi e tutti i valori
chiavi = studente.keys()
valori = studente.values()

# Ottenere un valore con un default se la chiave non esiste
email = studente.get("email", "Non disponibile")

# Rimuovere e restituire un elemento
cognome = studente.pop("cognome")

# Unire due dizionari (Python 3.5+)
info_aggiuntive = {"matricola": "12345", "anno": 2}
studente.update(info_aggiuntive)

# In Python 3.9+ si può usare l'operatore |
studente_completo = studente | {"laurea": "Informatica"}
```

## Set in Python

I set sono collezioni non ordinate di elementi unici, anch'essi implementati utilizzando tabelle hash.

### Creazione e Manipolazione

```python
# Creazione di un set
frutta = {"mela", "banana", "arancia", "mela"}  # La mela duplicata viene eliminata
print(frutta)  # Output: {'banana', 'mela', 'arancia'}

# Creazione da una lista
numeri = set([1, 2, 3, 2, 1])
print(numeri)  # Output: {1, 2, 3}

# Aggiunta di elementi
frutta.add("kiwi")

# Rimozione di elementi
frutta.remove("banana")  # Genera un errore se l'elemento non esiste
frutta.discard("pera")   # Non genera errori se l'elemento non esiste

# Verifica dell'appartenenza
if "mela" in frutta:
    print("La mela è presente")
```

### Operazioni tra Set

I set supportano le operazioni matematiche degli insiemi:

```python
A = {1, 2, 3, 4, 5}
B = {4, 5, 6, 7, 8}

# Unione
unione = A | B  # oppure A.union(B)
print(unione)  # Output: {1, 2, 3, 4, 5, 6, 7, 8}

# Intersezione
intersezione = A & B  # oppure A.intersection(B)
print(intersezione)  # Output: {4, 5}

# Differenza
differenza = A - B  # oppure A.difference(B)
print(differenza)  # Output: {1, 2, 3}

# Differenza simmetrica
diff_simmetrica = A ^ B  # oppure A.symmetric_difference(B)
print(diff_simmetrica)  # Output: {1, 2, 3, 6, 7, 8}

# Verifica di sottoinsieme e sovrainsieme
C = {1, 2}
print(C.issubset(A))  # Output: True
print(A.issuperset(C))  # Output: True
```

## Implementazione di una Tabella Hash

Vediamo ora un'implementazione più completa di una tabella hash che gestisce le collisioni tramite concatenamento (usando liste per memorizzare più valori nello stesso slot).

```python
class HashTable:
    def __init__(self, size=10):
        self.size = size
        self.table = [[] for _ in range(size)]  # Ogni slot è una lista
    
    def hash_function(self, key):
        return hash(key) % self.size
    
    def insert(self, key, value):
        index = self.hash_function(key)
        for i, (k, v) in enumerate(self.table[index]):
            if k == key:  # Aggiorna il valore se la chiave esiste già
                self.table[index][i] = (key, value)
                return
        # Aggiungi una nuova coppia chiave-valore
        self.table[index].append((key, value))
    
    def get(self, key):
        index = self.hash_function(key)
        for k, v in self.table[index]:
            if k == key:
                return v
        raise KeyError(f"Chiave {key} non trovata")
    
    def remove(self, key):
        index = self.hash_function(key)
        for i, (k, v) in enumerate(self.table[index]):
            if k == key:
                del self.table[index][i]
                return
        raise KeyError(f"Chiave {key} non trovata")
    
    def __str__(self):
        items = []
        for slot in self.table:
            for key, value in slot:
                items.append(f"{key}: {value}")
        return "{"+", ".join(items)+"}"

# Esempio di utilizzo
ht = HashTable()
ht.insert("nome", "Mario")
ht.insert("cognome", "Rossi")
ht.insert("età", 30)
print(ht)  # Output simile a: {nome: Mario, cognome: Rossi, età: 30}
print(ht.get("nome"))  # Output: Mario
ht.remove("età")
print(ht)  # Output simile a: {nome: Mario, cognome: Rossi}
```

## Applicazioni Pratiche

Le tabelle hash e i set sono estremamente utili in molti contesti:

### 1. Memorizzazione di Dati Strutturati

```python
# Database semplificato di utenti
utenti = {}
utenti["user1"] = {"nome": "Mario", "ruolo": "admin"}
utenti["user2"] = {"nome": "Luigi", "ruolo": "utente"}

# Accesso rapido ai dati di un utente specifico
print(utenti["user1"])
```

### 2. Conteggio delle Occorrenze

```python
# Conteggio delle parole in un testo
testo = "il gatto sul tetto il tetto è caldo il gatto dorme"
parole = testo.split()
conteggio = {}

for parola in parole:
    if parola in conteggio:
        conteggio[parola] += 1
    else:
        conteggio[parola] = 1

print(conteggio)  # Output: {'il': 3, 'gatto': 2, 'sul': 1, 'tetto': 2, 'è': 1, 'caldo': 1, 'dorme': 1}

# Alternativa più elegante con defaultdict
from collections import defaultdict
conteggio = defaultdict(int)
for parola in parole:
    conteggio[parola] += 1
```

### 3. Eliminazione dei Duplicati

```python
# Rimozione dei duplicati da una lista mantenendo l'ordine
def rimuovi_duplicati(lista):
    visti = set()
    risultato = []
    for elemento in lista:
        if elemento not in visti:
            visti.add(elemento)
            risultato.append(elemento)
    return risultato

numeri = [1, 2, 3, 1, 4, 2, 5]
print(rimuovi_duplicati(numeri))  # Output: [1, 2, 3, 4, 5]
```

### 4. Verifica di Appartenenza Rapida

```python
# Filtraggio di elementi in base all'appartenenza a un set
numeri_validi = {1, 3, 5, 7, 9}
da_filtrare = [1, 2, 3, 4, 5, 6]
filtrati = [n for n in da_filtrare if n in numeri_validi]
print(filtrati)  # Output: [1, 3, 5]
```

## Analisi della Complessità

Le operazioni su dizionari e set in Python hanno le seguenti complessità:

| Operazione | Complessità Media | Complessità Peggiore |
|------------|-------------------|----------------------|
| Inserimento | O(1) | O(n) |
| Ricerca | O(1) | O(n) |
| Cancellazione | O(1) | O(n) |

La complessità peggiore O(n) si verifica in casi rari, quando ci sono molte collisioni o quando è necessario ridimensionare la tabella hash.

### Confronto con Altre Strutture Dati

| Struttura | Ricerca | Inserimento | Cancellazione |
|-----------|---------|-------------|---------------|
| Lista | O(n) | O(1)* | O(n) |
| Dizionario | O(1) | O(1) | O(1) |
| Set | O(1) | O(1) | O(1) |
| Albero Bilanciato | O(log n) | O(log n) | O(log n) |

*L'inserimento in una lista è O(1) solo se si aggiunge alla fine, altrimenti è O(n).

## Esercizi

### Esercizio 1: Anagrammi
Scrivi una funzione che determini se due stringhe sono anagrammi l'una dell'altra (contengono le stesse lettere in ordine diverso).

```python
def sono_anagrammi(s1, s2):
    # Implementa la funzione
    pass

# Test
print(sono_anagrammi("listen", "silent"))  # Dovrebbe restituire True
print(sono_anagrammi("hello", "world"))   # Dovrebbe restituire False
```

### Esercizio 2: Prima Occorrenza Duplicata
Data una lista di numeri, trova il primo numero che appare più di una volta. Se non ci sono duplicati, restituisci -1.

```python
def prima_occorrenza_duplicata(numeri):
    # Implementa la funzione
    pass

# Test
print(prima_occorrenza_duplicata([1, 2, 3, 4, 3, 2, 5]))  # Dovrebbe restituire 3
print(prima_occorrenza_duplicata([1, 2, 3, 4]))           # Dovrebbe restituire -1
```

### Esercizio 3: Implementazione di una Cache LRU
Implementa una cache LRU (Least Recently Used) che memorizza un numero limitato di elementi e rimuove l'elemento meno recentemente utilizzato quando raggiunge la capacità massima.

```python
class LRUCache:
    def __init__(self, capacity):
        # Implementa il costruttore
        pass
    
    def get(self, key):
        # Implementa il metodo get
        pass
    
    def put(self, key, value):
        # Implementa il metodo put
        pass

# Test
cache = LRUCache(2)  # Capacità 2
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))    # Dovrebbe restituire 1
cache.put(3, 3)        # Rimuove la chiave 2
print(cache.get(2))    # Dovrebbe restituire -1 (non trovato)
```

### Esercizio 4: Intersezione di Array
Dati due array, scrivi una funzione che restituisca un nuovo array contenente gli elementi presenti in entrambi gli array.

```python
def intersezione(arr1, arr2):
    # Implementa la funzione
    pass

# Test
print(intersezione([1, 2, 2, 1], [2, 2]))  # Dovrebbe restituire [2, 2]
print(intersezione([4, 9, 5], [9, 4, 9, 8, 4]))  # Dovrebbe restituire [4, 9]
```

## Soluzioni agli Esercizi

### Soluzione Esercizio 1: Anagrammi

```python
def sono_anagrammi(s1, s2):
    # Se le lunghezze sono diverse, non possono essere anagrammi
    if len(s1) != len(s2):
        return False
    
    # Utilizziamo un dizionario per contare le occorrenze delle lettere
    conteggio = {}
    
    # Contiamo le lettere della prima stringa
    for char in s1:
        if char in conteggio:
            conteggio[char] += 1
        else:
            conteggio[char] = 1
    
    # Sottraiamo le lettere della seconda stringa
    for char in s2:
        if char not in conteggio:
            return False
        conteggio[char] -= 1
        if conteggio[char] == 0:
            del conteggio[char]
    
    # Se il dizionario è vuoto, le stringhe sono anagrammi
    return len(conteggio) == 0

# Soluzione alternativa più concisa
def sono_anagrammi_alternativa(s1, s2):
    return sorted(s1) == sorted(s2)
```

### Soluzione Esercizio 2: Prima Occorrenza Duplicata

```python
def prima_occorrenza_duplicata(numeri):
    visti = set()
    for num in numeri:
        if num in visti:
            return num
        visti.add(num)
    return -1
```

### Soluzione Esercizio 3: Implementazione di una Cache LRU

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()
    
    def get(self, key):
        if key not in self.cache:
            return -1
        # Sposta l'elemento alla fine (più recentemente usato)
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key, value):
        # Se la chiave esiste già, aggiorna il valore e spostala alla fine
        if key in self.cache:
            self.cache.move_to_end(key)
        # Altrimenti, se la cache è piena, rimuovi l'elemento meno recente
        elif len(self.cache) >= self.capacity:
            self.cache.popitem(last=False)
        # Aggiungi il nuovo elemento
        self.cache[key] = value
```

### Soluzione Esercizio 4: Intersezione di Array

```python
def intersezione(arr1, arr2):
    # Utilizziamo un dizionario per contare le occorrenze nel primo array
    conteggio = {}
    for num in arr1:
        if num in conteggio:
            conteggio[num] += 1
        else:
            conteggio[num] = 1
    
    # Costruiamo l'intersezione
    risultato = []
    for num in arr2:
        if num in conteggio and conteggio[num] > 0:
            risultato.append(num)
            conteggio[num] -= 1
    
    return risultato
```

## Navigazione

- [Torna all'indice principale](../README.md)
- [Guida precedente: Alberi e Grafi](05-alberi-grafi.md)
- [Guida successiva: Tecniche Algoritmiche Avanzate](07-tecniche-algoritmiche-avanzate.md)