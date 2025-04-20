# Liste in Python

## Cos'è una lista
In Python, una lista è una struttura dati ordinata e modificabile che può contenere elementi di diversi tipi. Le liste sono uno dei tipi di dati più versatili e frequentemente utilizzati in Python, in quanto permettono di memorizzare collezioni di elementi correlati.

## Creazione di liste
Le liste in Python vengono create utilizzando le parentesi quadre `[]`, con gli elementi separati da virgole.

```python
# Lista vuota
lista_vuota = []

# Lista di numeri
numeri = [1, 2, 3, 4, 5]

# Lista di stringhe
frutta = ["mela", "banana", "arancia"]

# Lista mista (contiene diversi tipi di dati)
mista = [1, "ciao", 3.14, True]

# Lista nidificata (liste all'interno di liste)
matrice = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
```

È anche possibile creare una lista utilizzando il costruttore `list()`:

```python
# Creazione di una lista da un'altra sequenza
lista_da_stringa = list("Python")
print(lista_da_stringa)  # Output: ['P', 'y', 't', 'h', 'o', 'n']

# Creazione di una lista da un range
lista_da_range = list(range(5))
print(lista_da_range)  # Output: [0, 1, 2, 3, 4]
```

## Accesso agli elementi
Gli elementi di una lista possono essere accessibili tramite il loro indice. In Python, gli indici iniziano da 0.

```python
frutta = ["mela", "banana", "arancia", "kiwi", "uva"]

# Accesso tramite indice positivo (da sinistra a destra)
primo_elemento = frutta[0]  # "mela"
secondo_elemento = frutta[1]  # "banana"

# Accesso tramite indice negativo (da destra a sinistra)
ultimo_elemento = frutta[-1]  # "uva"
penultimo_elemento = frutta[-2]  # "kiwi"
```

## Slicing (affettamento)
Lo slicing permette di estrarre una porzione di una lista.

```python
frutta = ["mela", "banana", "arancia", "kiwi", "uva"]

# Sintassi: lista[inizio:fine:passo]
# Nota: l'elemento all'indice 'fine' non è incluso

# Primi tre elementi
primi_tre = frutta[0:3]  # ["mela", "banana", "arancia"]
# Equivalente a:
primi_tre = frutta[:3]

# Ultimi due elementi
ultimi_due = frutta[3:5]  # ["kiwi", "uva"]
# Equivalente a:
ultimi_due = frutta[3:]

# Elementi dal secondo al quarto
dal_secondo_al_quarto = frutta[1:4]  # ["banana", "arancia", "kiwi"]

# Ogni secondo elemento
ogni_secondo = frutta[::2]  # ["mela", "arancia", "uva"]

# Inversione della lista
inversa = frutta[::-1]  # ["uva", "kiwi", "arancia", "banana", "mela"]
```

## Modifica delle liste
Le liste sono mutabili, il che significa che possono essere modificate dopo la creazione.

```python
frutta = ["mela", "banana", "arancia"]

# Modifica di un elemento
frutta[1] = "pera"
print(frutta)  # Output: ["mela", "pera", "arancia"]

# Aggiunta di elementi
frutta.append("kiwi")  # Aggiunge alla fine
print(frutta)  # Output: ["mela", "pera", "arancia", "kiwi"]

frutta.insert(1, "ananas")  # Inserisce all'indice specificato
print(frutta)  # Output: ["mela", "ananas", "pera", "arancia", "kiwi"]

frutta.extend(["uva", "mango"])  # Aggiunge più elementi alla fine
print(frutta)  # Output: ["mela", "ananas", "pera", "arancia", "kiwi", "uva", "mango"]

# Rimozione di elementi
frutta.remove("pera")  # Rimuove il primo elemento con il valore specificato
print(frutta)  # Output: ["mela", "ananas", "arancia", "kiwi", "uva", "mango"]

elemento_rimosso = frutta.pop(2)  # Rimuove e restituisce l'elemento all'indice specificato
print(elemento_rimosso)  # Output: "arancia"
print(frutta)  # Output: ["mela", "ananas", "kiwi", "uva", "mango"]

del frutta[0]  # Rimuove l'elemento all'indice specificato
print(frutta)  # Output: ["ananas", "kiwi", "uva", "mango"]

frutta.clear()  # Rimuove tutti gli elementi
print(frutta)  # Output: []
```

## Operazioni comuni sulle liste

```python
numeri = [3, 1, 4, 1, 5, 9, 2, 6, 5]

# Lunghezza della lista
lunghezza = len(numeri)  # 9

# Somma degli elementi (solo per liste di numeri)
somma = sum(numeri)  # 36

# Valore minimo e massimo
minimo = min(numeri)  # 1
massimo = max(numeri)  # 9

# Conteggio delle occorrenze
occorrenze_di_5 = numeri.count(5)  # 2

# Indice della prima occorrenza
indice_di_4 = numeri.index(4)  # 2

# Ordinamento
numeri.sort()  # Modifica la lista originale
print(numeri)  # Output: [1, 1, 2, 3, 4, 5, 5, 6, 9]

numeri.sort(reverse=True)  # Ordinamento decrescente
print(numeri)  # Output: [9, 6, 5, 5, 4, 3, 2, 1, 1]

# Creazione di una nuova lista ordinata senza modificare l'originale
numeri = [3, 1, 4, 1, 5, 9, 2, 6, 5]
numeri_ordinati = sorted(numeri)
print(numeri_ordinati)  # Output: [1, 1, 2, 3, 4, 5, 5, 6, 9]
print(numeri)  # Output: [3, 1, 4, 1, 5, 9, 2, 6, 5] (non modificata)

# Inversione
numeri.reverse()  # Modifica la lista originale
print(numeri)  # Output: [5, 6, 2, 9, 5, 1, 4, 1, 3]
```

## Iterazione sulle liste
Ci sono diversi modi per iterare sugli elementi di una lista.

```python
frutta = ["mela", "banana", "arancia", "kiwi"]

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

## Liste e riferimenti
È importante capire che quando si assegna una lista a una variabile, si sta creando un riferimento alla lista, non una copia.

```python
a = [1, 2, 3]
b = a  # 'b' è un riferimento alla stessa lista di 'a'

b.append(4)  # Modifica la lista attraverso 'b'
print(a)  # Output: [1, 2, 3, 4] - anche 'a' vede la modifica

# Per creare una copia indipendente
c = a.copy()  # oppure c = list(a) o c = a[:]
c.append(5)  # Modifica la lista attraverso 'c'
print(a)  # Output: [1, 2, 3, 4] - 'a' non è influenzato
print(c)  # Output: [1, 2, 3, 4, 5]
```

## Liste come pile e code
Le liste possono essere utilizzate come pile (LIFO: Last In, First Out) e code (FIFO: First In, First Out).

```python
# Utilizzo come pila (LIFO)
pila = []
pila.append(1)  # Inserimento
pila.append(2)
pila.append(3)
print(pila)  # Output: [1, 2, 3]

elemento = pila.pop()  # Rimozione dall'ultimo (3)
print(elemento)  # Output: 3
print(pila)  # Output: [1, 2]

# Utilizzo come coda (FIFO)
# Nota: per code efficienti, è meglio usare collections.deque
from collections import deque
coda = deque([])  # Creazione di una coda vuota
coda.append(1)  # Inserimento
coda.append(2)
coda.append(3)
print(list(coda))  # Output: [1, 2, 3]

elemento = cola.popleft()  # Rimozione dal primo (1)
print(elemento)  # Output: 1
print(list(coda))  # Output: [2, 3]
```

## Conclusione
Le liste sono una delle strutture dati più versatili e potenti in Python. Comprendere come crearle, accedervi e manipolarle è fondamentale per scrivere codice Python efficace. Le liste sono particolarmente utili quando si ha bisogno di una collezione ordinata di elementi che può cambiare nel tempo.

---

[Indice dell'esercitazione](../README.md) | [Prossimo: Tuple](./02_tuple.md)