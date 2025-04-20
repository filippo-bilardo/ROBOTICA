# Tuple in Python

## Cos'è una tupla
In Python, una tupla è una struttura dati ordinata e immutabile che può contenere elementi di diversi tipi. A differenza delle liste, le tuple non possono essere modificate dopo la creazione, il che le rende utili quando si vuole garantire che i dati non vengano alterati.

## Creazione di tuple
Le tuple in Python vengono create utilizzando le parentesi tonde `()`, con gli elementi separati da virgole.

```python
# Tupla vuota
tupla_vuota = ()

# Tupla di numeri
numeri = (1, 2, 3, 4, 5)

# Tupla di stringhe
frutta = ("mela", "banana", "arancia")

# Tupla mista (contiene diversi tipi di dati)
mista = (1, "ciao", 3.14, True)

# Tupla nidificata (tuple all'interno di tuple)
matrice = ((1, 2, 3), (4, 5, 6), (7, 8, 9))
```

È importante notare che per creare una tupla con un solo elemento, è necessario includere una virgola dopo l'elemento:

```python
# Tupla con un solo elemento
single_tupla = (42,)  # Nota la virgola
print(type(single_tupla))  # Output: <class 'tuple'>

# Senza la virgola, non è una tupla ma un semplice valore tra parentesi
non_tupla = (42)  # Equivalente a: non_tupla = 42
print(type(non_tupla))  # Output: <class 'int'>
```

È anche possibile creare una tupla senza utilizzare le parentesi, semplicemente separando i valori con virgole:

```python
tupla_senza_parentesi = 1, 2, 3, 4, 5
print(type(tupla_senza_parentesi))  # Output: <class 'tuple'>
```

Inoltre, è possibile utilizzare il costruttore `tuple()` per creare una tupla da un'altra sequenza:

```python
# Creazione di una tupla da una lista
tupla_da_lista = tuple([1, 2, 3, 4, 5])
print(tupla_da_lista)  # Output: (1, 2, 3, 4, 5)

# Creazione di una tupla da una stringa
tupla_da_stringa = tuple("Python")
print(tupla_da_stringa)  # Output: ('P', 'y', 't', 'h', 'o', 'n')
```

## Accesso agli elementi
Gli elementi di una tupla possono essere accessibili tramite il loro indice, proprio come nelle liste. In Python, gli indici iniziano da 0.

```python
frutta = ("mela", "banana", "arancia", "kiwi", "uva")

# Accesso tramite indice positivo (da sinistra a destra)
primo_elemento = frutta[0]  # "mela"
secondo_elemento = frutta[1]  # "banana"

# Accesso tramite indice negativo (da destra a sinistra)
ultimo_elemento = frutta[-1]  # "uva"
penultimo_elemento = frutta[-2]  # "kiwi"
```

## Slicing (affettamento)
Come per le liste, lo slicing permette di estrarre una porzione di una tupla.

```python
frutta = ("mela", "banana", "arancia", "kiwi", "uva")

# Sintassi: tupla[inizio:fine:passo]
# Nota: l'elemento all'indice 'fine' non è incluso

# Primi tre elementi
primi_tre = frutta[0:3]  # ("mela", "banana", "arancia")
# Equivalente a:
primi_tre = frutta[:3]

# Ultimi due elementi
ultimi_due = frutta[3:5]  # ("kiwi", "uva")
# Equivalente a:
ultimi_due = frutta[3:]

# Elementi dal secondo al quarto
dal_secondo_al_quarto = frutta[1:4]  # ("banana", "arancia", "kiwi")

# Ogni secondo elemento
ogni_secondo = frutta[::2]  # ("mela", "arancia", "uva")

# Inversione della tupla
inversa = frutta[::-1]  # ("uva", "kiwi", "arancia", "banana", "mela")
```

## Immutabilità delle tuple
A differenza delle liste, le tuple sono immutabili, il che significa che non possono essere modificate dopo la creazione.

```python
frutta = ("mela", "banana", "arancia")

# Tentativo di modifica di un elemento
try:
    frutta[1] = "pera"  # Questo genererà un errore
except TypeError as e:
    print(f"Errore: {e}")  # Output: Errore: 'tuple' object does not support item assignment
```

Tuttavia, se una tupla contiene oggetti mutabili (come liste), questi oggetti possono essere modificati:

```python
# Tupla contenente una lista
tupla_con_lista = (1, 2, [3, 4])

# Non possiamo modificare la tupla stessa
# tupla_con_lista[0] = 5  # Errore!

# Ma possiamo modificare la lista all'interno della tupla
tupla_con_lista[2][0] = 5
print(tupla_con_lista)  # Output: (1, 2, [5, 4])
```

## Operazioni comuni sulle tuple

```python
numeri = (3, 1, 4, 1, 5, 9, 2, 6, 5)

# Lunghezza della tupla
lunghezza = len(numeri)  # 9

# Somma degli elementi (solo per tuple di numeri)
somma = sum(numeri)  # 36

# Valore minimo e massimo
minimo = min(numeri)  # 1
massimo = max(numeri)  # 9

# Conteggio delle occorrenze
occorrenze_di_5 = numeri.count(5)  # 2

# Indice della prima occorrenza
indice_di_4 = numeri.index(4)  # 2

# Concatenazione di tuple
tupla1 = (1, 2, 3)
tupla2 = (4, 5, 6)
tupla_concatenata = tupla1 + tupla2  # (1, 2, 3, 4, 5, 6)

# Ripetizione di una tupla
tupla_ripetuta = tupla1 * 3  # (1, 2, 3, 1, 2, 3, 1, 2, 3)

# Verifica dell'appartenenza
print(3 in tupla1)  # Output: True
print(7 in tupla1)  # Output: False
```

## Iterazione sulle tuple
Come per le liste, ci sono diversi modi per iterare sugli elementi di una tupla.

```python
frutta = ("mela", "banana", "arancia", "kiwi")

# Iterazione semplice
print("Iterazione semplice:")
for elemento in frutta:
    print(elemento)

# Iterazione con indice
print("\nIterazione con indice:")
for i in range(len(frutta)):
    print(f"Indice {i}: {frutta[i]}")

# Iterazione con enumerate
print("\nIterazione con enumerate:")
for i, elemento in enumerate(frutta):
    print(f"Indice {i}: {elemento}")
```

## Unpacking delle tuple
Una caratteristica molto utile delle tuple è la possibilità di "spacchettare" i loro elementi in variabili separate.

```python
# Unpacking di base
coordinate = (10, 20, 30)
x, y, z = coordinate
print(x, y, z)  # Output: 10 20 30

# Unpacking con l'operatore *
numeri = (1, 2, 3, 4, 5)
primo, *resto, ultimo = numeri
print(primo)  # Output: 1
print(resto)  # Output: [2, 3, 4]
print(ultimo)  # Output: 5

# Scambio di variabili
a = 5
b = 10
a, b = b, a  # Utilizza l'unpacking di tuple
print(a, b)  # Output: 10 5
```

## Tuple come chiavi di dizionari
Un vantaggio delle tuple rispetto alle liste è che possono essere utilizzate come chiavi nei dizionari, poiché sono immutabili.

```python
# Utilizzo di tuple come chiavi in un dizionario
coordinate_valori = {}
coordinate_valori[(0, 0)] = "Origine"
coordinate_valori[(1, 0)] = "Est"
coordinate_valori[(0, 1)] = "Nord"

print(coordinate_valori[(0, 0)])  # Output: "Origine"

# Tentativo di utilizzare una lista come chiave (genererà un errore)
try:
    dizionario = {[1, 2]: "valore"}
except TypeError as e:
    print(f"Errore: {e}")  # Output: Errore: unhashable type: 'list'
```

## Tuple vs Liste
Ecco alcune differenze chiave tra tuple e liste:

1. **Immutabilità**: Le tuple sono immutabili, le liste sono mutabili.
2. **Sintassi**: Le tuple utilizzano parentesi tonde `()`, le liste utilizzano parentesi quadre `[]`.
3. **Metodi**: Le tuple hanno meno metodi disponibili rispetto alle liste, proprio a causa della loro immutabilità.
4. **Prestazioni**: Le tuple sono leggermente più veloci delle liste per operazioni di accesso e iterazione.
5. **Utilizzo come chiavi**: Le tuple possono essere utilizzate come chiavi nei dizionari, le liste no.

```python
# Confronto di prestazioni (esempio semplificato)
import timeit

# Creazione di una lista e una tupla con gli stessi elementi
lista = list(range(1000))
tupla = tuple(range(1000))

# Tempo di accesso agli elementi
tempo_lista = timeit.timeit(lambda: lista[500], number=1000000)
tempo_tupla = timeit.timeit(lambda: tupla[500], number=1000000)

print(f"Tempo di accesso alla lista: {tempo_lista:.6f} secondi")
print(f"Tempo di accesso alla tupla: {tempo_tupla:.6f} secondi")
```

## Quando usare le tuple
Le tuple sono particolarmente utili nei seguenti casi:

1. **Dati immutabili**: Quando si vuole garantire che i dati non vengano modificati accidentalmente.
2. **Chiavi di dizionari**: Quando si ha bisogno di utilizzare una collezione di elementi come chiave in un dizionario.
3. **Valori di ritorno multipli**: Per restituire più valori da una funzione.
4. **Dati eterogenei**: Per raggruppare dati di tipi diversi che formano un'entità logica (come coordinate, record di database, ecc.).

```python
# Esempio: Funzione che restituisce più valori
def statistiche(numeri):
    return min(numeri), max(numeri), sum(numeri) / len(numeri)

# La funzione restituisce una tupla che viene spacchettata
minimo, massimo, media = statistiche([1, 2, 3, 4, 5])
print(f"Minimo: {minimo}, Massimo: {massimo}, Media: {media}")
# Output: Minimo: 1, Massimo: 5, Media: 3.0
```

## Conclusione
Le tuple sono una struttura dati fondamentale in Python, particolarmente utili quando si ha bisogno di una collezione ordinata e immutabile di elementi. La loro immutabilità le rende sicure da utilizzare in contesti dove i dati non devono essere modificati, e offre vantaggi in termini di prestazioni e flessibilità in determinati scenari, come l'utilizzo come chiavi nei dizionari.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Liste](./01_liste.md) | [Prossimo: Dizionari](./03_dizionari.md)