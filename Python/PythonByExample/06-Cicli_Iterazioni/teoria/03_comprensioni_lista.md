# Comprensioni di Lista

Le comprensioni di lista (list comprehensions) sono una caratteristica potente e concisa di Python che permette di creare nuove liste in modo elegante ed efficiente. Questa sintassi compatta combina la creazione di una lista con operazioni come cicli, condizioni e trasformazioni in un'unica espressione.

## Sintassi di base

La sintassi di base di una comprensione di lista è la seguente:

```python
[espressione for elemento in iterabile]
```

Dove:
- `espressione` è un'operazione o trasformazione da applicare a ogni elemento
- `elemento` è la variabile che assume il valore di ciascun elemento dell'iterabile
- `iterabile` è una sequenza (lista, tupla, stringa, ecc.) o un oggetto iterabile

## Esempi di base

### Creazione di una lista di quadrati

```python
# Metodo tradizionale con ciclo for
quadrati = []
for x in range(1, 11):
    quadrati.append(x**2)
print(quadrati)  # [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

# Equivalente con comprensione di lista
quadrati = [x**2 for x in range(1, 11)]
print(quadrati)  # [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
```

### Trasformazione di una lista esistente

```python
frutta = ["mela", "banana", "kiwi", "arancia"]

# Creazione di una nuova lista con le stringhe in maiuscolo
frutta_maiuscola = [f.upper() for f in frutta]
print(frutta_maiuscola)  # ['MELA', 'BANANA', 'KIWI', 'ARANCIA']

# Creazione di una nuova lista con la lunghezza di ogni stringa
lunghezze = [len(f) for f in frutta]
print(lunghezze)  # [4, 6, 4, 7]
```

## Comprensioni di lista con condizioni

È possibile aggiungere condizioni alle comprensioni di lista per filtrare gli elementi:

```python
[espressione for elemento in iterabile if condizione]
```

### Esempi con condizioni

```python
# Filtrare solo i numeri pari
numeri = list(range(1, 21))
pari = [n for n in numeri if n % 2 == 0]
print(pari)  # [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

# Filtrare solo le stringhe con lunghezza maggiore di 4
parole = ["casa", "automobile", "gatto", "elefante", "topo"]
parole_lunghe = [p for p in parole if len(p) > 4]
print(parole_lunghe)  # ['automobile', 'elefante']
```

### Condizioni più complesse

```python
# Numeri divisibili per 3 o per 5
numeri = list(range(1, 31))
divisibili = [n for n in numeri if n % 3 == 0 or n % 5 == 0]
print(divisibili)  # [3, 5, 6, 9, 10, 12, 15, 18, 20, 21, 24, 25, 27, 30]

# Utilizzo di condizioni multiple
numeri = list(range(-10, 11))
risultato = [n if n >= 0 else 0 for n in numeri]  # Sostituisce i negativi con 0
print(risultato)  # [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

## Comprensioni di lista annidate

È possibile annidare più cicli in una comprensione di lista:

```python
[espressione for x in iterabile1 for y in iterabile2]
```

Questo è equivalente a:

```python
risultato = []
for x in iterabile1:
    for y in iterabile2:
        risultato.append(espressione)
```

### Esempi di comprensioni annidate

```python
# Tutte le combinazioni di coppie di numeri
pairs = [(x, y) for x in range(1, 4) for y in range(1, 3)]
print(pairs)  # [(1, 1), (1, 2), (2, 1), (2, 2), (3, 1), (3, 2)]

# Creazione di una matrice (lista di liste)
matrice = [[i * j for j in range(1, 4)] for i in range(1, 4)]
print(matrice)  # [[1, 2, 3], [2, 4, 6], [3, 6, 9]]
```

## Comprensioni di dizionari e set

Oltre alle comprensioni di lista, Python supporta anche comprensioni di dizionari e set con una sintassi simile:

### Comprensioni di dizionari

```python
{chiave: valore for elemento in iterabile}
```

```python
# Creazione di un dizionario di quadrati
quadrati_dict = {x: x**2 for x in range(1, 6)}
print(quadrati_dict)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Inversione di un dizionario (scambio chiavi-valori)
inventario = {"mele": 10, "banane": 5, "arance": 8}
inventario_inverso = {valore: chiave for chiave, valore in inventario.items()}
print(inventario_inverso)  # {10: 'mele', 5: 'banane', 8: 'arance'}
```

### Comprensioni di set

```python
{espressione for elemento in iterabile}
```

```python
# Creazione di un set di quadrati
quadrati_set = {x**2 for x in range(1, 11)}
print(quadrati_set)  # {64, 1, 4, 36, 100, 9, 16, 49, 81, 25}

# Estrazione delle iniziali uniche da una lista di nomi
nomi = ["Mario", "Luigi", "Maria", "Luca", "Laura"]
iniziali = {nome[0] for nome in nomi}
print(iniziali)  # {'M', 'L'}
```

## Vantaggi e considerazioni

### Vantaggi delle comprensioni

1. **Concisione**: Riducono la quantità di codice necessario per operazioni comuni
2. **Leggibilità**: Spesso rendono l'intento del codice più chiaro
3. **Prestazioni**: In molti casi sono più efficienti dei cicli tradizionali

### Quando evitare le comprensioni

1. **Espressioni troppo complesse**: Se l'espressione o le condizioni sono molto complesse, un ciclo tradizionale potrebbe essere più leggibile
2. **Effetti collaterali**: Le comprensioni dovrebbero essere usate principalmente per creare nuove collezioni, non per effetti collaterali
3. **Comprensioni annidate profonde**: Troppe comprensioni annidate possono rendere il codice difficile da leggere

## Esempi pratici

### Elaborazione di dati

```python
# Dati di esempio: lista di dizionari con informazioni su persone
persone = [
    {"nome": "Alice", "età": 25, "città": "Milano"},
    {"nome": "Bob", "età": 30, "città": "Roma"},
    {"nome": "Charlie", "età": 35, "città": "Napoli"},
    {"nome": "Diana", "età": 28, "città": "Milano"}
]

# Estrazione dei nomi di tutte le persone
nomi = [p["nome"] for p in persone]
print(nomi)  # ['Alice', 'Bob', 'Charlie', 'Diana']

# Filtraggio delle persone con età superiore a 30
over_30 = [p["nome"] for p in persone if p["età"] > 30]
print(over_30)  # ['Charlie']

# Creazione di un dizionario nome -> città
nome_città = {p["nome"]: p["città"] for p in persone}
print(nome_città)  # {'Alice': 'Milano', 'Bob': 'Roma', 'Charlie': 'Napoli', 'Diana': 'Milano'}

# Raggruppamento per città
persone_per_città = {città: [p["nome"] for p in persone if p["città"] == città]
                    for città in {p["città"] for p in persone}}
print(persone_per_città)  # {'Milano': ['Alice', 'Diana'], 'Roma': ['Bob'], 'Napoli': ['Charlie']}
```

### Manipolazione di file e stringhe

```python
# Lettura di un file e conteggio delle parole
with open("esempio.txt", "r") as file:
    contenuto = file.read()
    parole = contenuto.split()
    lunghezze_parole = {parola: len(parola) for parola in parole}
    parole_lunghe = [parola for parola in parole if len(parola) > 5]
    conteggio_parole = {parola: parole.count(parola) for parola in set(parole)}
```

## Conclusione

Le comprensioni di lista, insieme alle comprensioni di dizionari e set, sono strumenti potenti che rendono il codice Python più conciso, leggibile ed espressivo. Padroneggiare queste tecniche ti permette di scrivere codice più elegante ed efficiente, riducendo la verbosità e migliorando la chiarezza delle operazioni di trasformazione e filtraggio dei dati.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Ciclo While](./02_ciclo_while.md) | [Prossimo: Iteratori e Generatori](./04_iteratori_generatori.md)