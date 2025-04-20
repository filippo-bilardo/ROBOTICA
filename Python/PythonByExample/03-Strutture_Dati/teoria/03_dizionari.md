# Dizionari in Python

## Cos'è un dizionario
In Python, un dizionario è una struttura dati che memorizza coppie chiave-valore, permettendo di accedere rapidamente ai valori tramite le loro chiavi. I dizionari sono collezioni non ordinate (fino a Python 3.6, da Python 3.7 mantengono l'ordine di inserimento), mutabili e indicizzate. Le chiavi devono essere di tipo immutabile (come stringhe, numeri o tuple), mentre i valori possono essere di qualsiasi tipo.

## Creazione di dizionari
I dizionari in Python vengono creati utilizzando le parentesi graffe `{}`, con le coppie chiave-valore separate da virgole e ogni coppia formata da una chiave e un valore separati da due punti.

```python
# Dizionario vuoto
dizionario_vuoto = {}

# Dizionario con coppie chiave-valore
persona = {
    "nome": "Mario",
    "cognome": "Rossi",
    "età": 30,
    "città": "Roma"
}

# Dizionario con chiavi di diversi tipi
misto = {
    "stringa": "valore",
    42: "risposta",
    (1, 2): "tupla come chiave"
}

# Dizionario nidificato (dizionari all'interno di dizionari)
studente = {
    "nome": "Laura",
    "corsi": {
        "matematica": 28,
        "informatica": 30,
        "fisica": 26
    }
}
```

È anche possibile creare un dizionario utilizzando il costruttore `dict()`:

```python
# Creazione con il costruttore dict()
persona = dict(nome="Mario", cognome="Rossi", età=30, città="Roma")
print(persona)  # Output: {'nome': 'Mario', 'cognome': 'Rossi', 'età': 30, 'città': 'Roma'}

# Creazione da una lista di tuple (chiave, valore)
elements = [("H", "Idrogeno"), ("O", "Ossigeno"), ("C", "Carbonio")]
elements_dict = dict(elements)
print(elements_dict)  # Output: {'H': 'Idrogeno', 'O': 'Ossigeno', 'C': 'Carbonio'}

# Creazione con dict comprehension
quadrati = {x: x**2 for x in range(5)}
print(quadrati)  # Output: {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}
```

## Accesso ai valori
I valori in un dizionario possono essere accessibili tramite le loro chiavi.

```python
persona = {"nome": "Mario", "cognome": "Rossi", "età": 30, "città": "Roma"}

# Accesso tramite chiave
nome = persona["nome"]  # "Mario"

# Accesso con il metodo get() (più sicuro, restituisce None se la chiave non esiste)
cognome = persona.get("cognome")  # "Rossi"
telefono = persona.get("telefono")  # None

# È possibile specificare un valore predefinito con get()
telefono = persona.get("telefono", "Non disponibile")  # "Non disponibile"
```

Se si tenta di accedere a una chiave che non esiste utilizzando la notazione con parentesi quadre, verrà generato un errore `KeyError`:

```python
try:
    telefono = persona["telefono"]  # Genererà un KeyError
except KeyError as e:
    print(f"Errore: {e}")  # Output: Errore: 'telefono'
```

## Modifica dei dizionari
I dizionari sono mutabili, il che significa che possono essere modificati dopo la creazione.

```python
persona = {"nome": "Mario", "cognome": "Rossi", "età": 30, "città": "Roma"}

# Aggiunta o modifica di elementi
persona["email"] = "mario.rossi@example.com"  # Aggiunge una nuova coppia chiave-valore
persona["età"] = 31  # Modifica un valore esistente

print(persona)
# Output: {'nome': 'Mario', 'cognome': 'Rossi', 'età': 31, 'città': 'Roma', 'email': 'mario.rossi@example.com'}

# Aggiunta di più elementi con update()
persona.update({"telefono": "123456789", "professione": "Ingegnere"})
print(persona)
# Output: {'nome': 'Mario', 'cognome': 'Rossi', 'età': 31, 'città': 'Roma', 'email': 'mario.rossi@example.com', 'telefono': '123456789', 'professione': 'Ingegnere'}

# Rimozione di elementi
del persona["email"]  # Rimuove la coppia chiave-valore con chiave "email"

telefono = persona.pop("telefono")  # Rimuove e restituisce il valore associato alla chiave
print(telefono)  # Output: "123456789"

ultima_coppia = persona.popitem()  # Rimuove e restituisce l'ultima coppia chiave-valore inserita
print(ultima_coppia)  # Output: ('professione', 'Ingegnere')

persona.clear()  # Rimuove tutti gli elementi
print(persona)  # Output: {}
```

## Operazioni comuni sui dizionari

```python
persona = {"nome": "Mario", "cognome": "Rossi", "età": 30, "città": "Roma"}

# Lunghezza del dizionario (numero di coppie chiave-valore)
lunghezza = len(persona)  # 4

# Verifica dell'esistenza di una chiave
print("nome" in persona)  # Output: True
print("telefono" in persona)  # Output: False

# Ottenere tutte le chiavi
chiavi = persona.keys()
print(list(chiavi))  # Output: ['nome', 'cognome', 'età', 'città']

# Ottenere tutti i valori
valori = persona.values()
print(list(valori))  # Output: ['Mario', 'Rossi', 30, 'Roma']

# Ottenere tutte le coppie chiave-valore
coppie = persona.items()
print(list(coppie))  # Output: [('nome', 'Mario'), ('cognome', 'Rossi'), ('età', 30), ('città', 'Roma')]

# Copia di un dizionario
persona_copia = persona.copy()  # Copia superficiale
persona_copia2 = dict(persona)  # Altro modo per creare una copia superficiale

# Per una copia profonda (necessaria per dizionari nidificati)
import copy
persona_deep_copy = copy.deepcopy(persona)
```

## Iterazione sui dizionari
Ci sono diversi modi per iterare sugli elementi di un dizionario.

```python
persona = {"nome": "Mario", "cognome": "Rossi", "età": 30, "città": "Roma"}

# Iterazione sulle chiavi (comportamento predefinito)
print("Iterazione sulle chiavi:")
for chiave in persona:
    print(chiave)

# Iterazione esplicita sulle chiavi
print("\nIterazione esplicita sulle chiavi:")
for chiave in persona.keys():
    print(chiave)

# Iterazione sui valori
print("\nIterazione sui valori:")
for valore in persona.values():
    print(valore)

# Iterazione sulle coppie chiave-valore
print("\nIterazione sulle coppie chiave-valore:")
for chiave, valore in persona.items():
    print(f"{chiave}: {valore}")
```

## Dizionari e riferimenti
Come per le liste, quando si assegna un dizionario a una variabile, si sta creando un riferimento al dizionario, non una copia.

```python
a = {"x": 1, "y": 2}
b = a  # 'b' è un riferimento allo stesso dizionario di 'a'

b["z"] = 3  # Modifica il dizionario attraverso 'b'
print(a)  # Output: {'x': 1, 'y': 2, 'z': 3} - anche 'a' vede la modifica

# Per creare una copia indipendente
c = a.copy()  # oppure c = dict(a)
c["w"] = 4  # Modifica il dizionario attraverso 'c'
print(a)  # Output: {'x': 1, 'y': 2, 'z': 3} - 'a' non è influenzato
print(c)  # Output: {'x': 1, 'y': 2, 'z': 3, 'w': 4}
```

## Dizionari e strutture dati complesse
I dizionari sono spesso utilizzati per rappresentare strutture dati complesse, come record di database, configurazioni, o dati JSON.

```python
# Esempio: Lista di dizionari (simile a una tabella di database)
utenti = [
    {"id": 1, "nome": "Mario", "email": "mario@example.com"},
    {"id": 2, "nome": "Laura", "email": "laura@example.com"},
    {"id": 3, "nome": "Giovanni", "email": "giovanni@example.com"}
]

# Accesso ai dati
print(utenti[1]["nome"])  # Output: "Laura"

# Iterazione sulla lista di dizionari
for utente in utenti:
    print(f"ID: {utente['id']}, Nome: {utente['nome']}, Email: {utente['email']}")

# Esempio: Dizionario di dizionari (simile a un database NoSQL)
database = {
    "utente1": {"nome": "Mario", "email": "mario@example.com"},
    "utente2": {"nome": "Laura", "email": "laura@example.com"},
    "utente3": {"nome": "Giovanni", "email": "giovanni@example.com"}
}

# Accesso ai dati
print(database["utente2"]["nome"])  # Output: "Laura"

# Iterazione sul dizionario di dizionari
for chiave, utente in database.items():
    print(f"Chiave: {chiave}, Nome: {utente['nome']}, Email: {utente['email']}")
```

## Metodi avanzati dei dizionari

```python
# setdefault(): Restituisce il valore di una chiave, se esiste, altrimenti inserisce la chiave con un valore predefinito
persona = {"nome": "Mario", "cognome": "Rossi"}
email = persona.setdefault("email", "non disponibile")
print(email)  # Output: "non disponibile"
print(persona)  # Output: {'nome': 'Mario', 'cognome': 'Rossi', 'email': 'non disponibile'}

# fromkeys(): Crea un nuovo dizionario con chiavi specificate e valore predefinito
chiavi = ["nome", "cognome", "età"]
dizionario = dict.fromkeys(chiavi, "non specificato")
print(dizionario)  # Output: {'nome': 'non specificato', 'cognome': 'non specificato', 'età': 'non specificato'}

# Unione di dizionari (Python 3.9+)
dict1 = {"a": 1, "b": 2}
dict2 = {"b": 3, "c": 4}

# In Python 3.9+
unione = dict1 | dict2  # {'a': 1, 'b': 3, 'c': 4}

# In versioni precedenti
unione = {**dict1, **dict2}  # {'a': 1, 'b': 3, 'c': 4}
```

## Dizionari e prestazioni
I dizionari in Python sono implementati come tabelle hash, il che significa che l'accesso, l'inserimento e la rimozione di elementi hanno una complessità temporale media di O(1), rendendoli estremamente efficienti per operazioni di ricerca e manipolazione.

```python
import timeit

# Confronto di prestazioni tra lista e dizionario per la ricerca

# Creazione di una lista e un dizionario con gli stessi dati
n = 10000
lista = list(range(n))
dizionario = {i: i for i in range(n)}

# Tempo di ricerca in una lista
def cerca_in_lista():
    return 9999 in lista

# Tempo di ricerca in un dizionario
def cerca_in_dizionario():
    return 9999 in dizionario

tempo_lista = timeit.timeit(cerca_in_lista, number=1000)
tempo_dizionario = timeit.timeit(cerca_in_dizionario, number=1000)

print(f"Tempo di ricerca nella lista: {tempo_lista:.6f} secondi")
print(f"Tempo di ricerca nel dizionario: {tempo_dizionario:.6f} secondi")
# Il dizionario sarà significativamente più veloce
```

## Quando usare i dizionari
I dizionari sono particolarmente utili nei seguenti casi:

1. **Mappatura chiave-valore**: Quando si ha bisogno di associare valori a chiavi uniche.
2. **Ricerca rapida**: Quando si ha bisogno di cercare rapidamente elementi in base a un identificatore.
3. **Conteggio e raggruppamento**: Per contare occorrenze o raggruppare elementi.
4. **Memorizzazione di dati strutturati**: Per rappresentare oggetti con attributi, record di database, configurazioni, ecc.
5. **Cache e memoizzazione**: Per memorizzare risultati di calcoli costosi.

```python
# Esempio: Conteggio delle occorrenze di parole in un testo
testo = "il gatto sul tetto il tetto è caldo il gatto è nero"
parole = testo.split()

# Utilizzo di un dizionario per contare le occorrenze
conteggio = {}
for parola in parole:
    if parola in conteggio:
        conteggio[parola] += 1
    else:
        conteggio[parola] = 1

print(conteggio)
# Output: {'il': 3, 'gatto': 2, 'sul': 1, 'tetto': 2, 'è': 2, 'caldo': 1, 'nero': 1}

# Versione più concisa con setdefault()
conteggio = {}
for parola in parole:
    conteggio[parola] = conteggio.get(parola, 0) + 1

# Versione ancora più concisa con Counter (dalla libreria collections)
from collections import Counter
conteggio = Counter(parole)
print(conteggio)
# Output: Counter({'il': 3, 'gatto': 2, 'tetto': 2, 'è': 2, 'sul': 1, 'caldo': 1, 'nero': 1})
```

## Conclusione
I dizionari sono una struttura dati fondamentale in Python, particolarmente utili quando si ha bisogno di associare valori a chiavi uniche. La loro efficienza nelle operazioni di ricerca e la flessibilità nel rappresentare dati strutturati li rendono uno strumento indispensabile nella programmazione Python. Comprendere come crearli, accedervi e manipolarli è essenziale per scrivere codice Python efficace e leggibile.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Tuple](./02_tuple.md) | [Prossimo: Set](./04_set.md)