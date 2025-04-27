# Liste, Pile e Code

## Introduzione alle strutture dati lineari

Le strutture dati lineari sono collezioni di elementi in cui ogni elemento ha un predecessore e un successore (ad eccezione del primo e dell'ultimo elemento). Queste strutture sono fondamentali in informatica e costituiscono la base per implementare algoritmi e risolvere problemi complessi.

In questa guida, esploreremo tre importanti strutture dati lineari: liste, pile e code. Vedremo come implementarle in Python, analizzando le loro caratteristiche, operazioni principali e casi d'uso.

## Liste

Una lista è una struttura dati che memorizza una collezione ordinata di elementi. A differenza degli array, le liste possono crescere dinamicamente e gli elementi possono essere inseriti o rimossi in qualsiasi posizione.

### Liste in Python

Python offre una struttura dati integrata chiamata `list` che implementa il concetto di lista dinamica:

```python
# Creazione di una lista
lista = [10, 20, 30, 40, 50]

# Accesso agli elementi (indice base 0)
primo_elemento = lista[0]  # 10
ultimo_elemento = lista[-1]  # 50

# Modifica di un elemento
lista[2] = 35
print(lista)  # [10, 20, 35, 40, 50]

# Aggiunta di elementi
lista.append(60)  # Aggiunge alla fine
lista.insert(1, 15)  # Inserisce in posizione 1
print(lista)  # [10, 15, 20, 35, 40, 50, 60]

# Rimozione di elementi
lista.remove(35)  # Rimuove il valore 35
elemento_rimosso = lista.pop(3)  # Rimuove e restituisce l'elemento in posizione 3
print(lista)  # [10, 15, 20, 50, 60]
print(elemento_rimosso)  # 40

# Lunghezza della lista
lunghezza = len(lista)  # 5

# Verifica della presenza di un elemento
if 20 in lista:
    print("Elemento trovato")

# Slicing (sottoliste)
sottolista = lista[1:4]  # [15, 20, 50]

# Concatenazione
altra_lista = [70, 80]
lista_concatenata = lista + altra_lista  # [10, 15, 20, 50, 60, 70, 80]

# Ordinamento
lista.sort()  # Ordina in-place
lista_ordinata = sorted(lista)  # Restituisce una nuova lista ordinata

# Inversione
lista.reverse()  # Inverte in-place
lista_invertita = lista[::-1]  # Restituisce una nuova lista invertita
```

### Implementazione di una lista concatenata

Oltre alla lista integrata di Python, è importante comprendere l'implementazione di una lista concatenata (linked list), che è una struttura dati fondamentale in informatica:

```python
class Nodo:
    def __init__(self, valore):
        self.valore = valore
        self.successivo = None

class ListaConcatenata:
    def __init__(self):
        self.testa = None
    
    def è_vuota(self):
        return self.testa is None
    
    def aggiungi_inizio(self, valore):
        nuovo_nodo = Nodo(valore)
        nuovo_nodo.successivo = self.testa
        self.testa = nuovo_nodo
    
    def aggiungi_fine(self, valore):
        nuovo_nodo = Nodo(valore)
        
        if self.è_vuota():
            self.testa = nuovo_nodo
            return
        
        corrente = self.testa
        while corrente.successivo:
            corrente = corrente.successivo
        
        corrente.successivo = nuovo_nodo
    
    def rimuovi(self, valore):
        if self.è_vuota():
            return False
        
        # Caso speciale: rimozione della testa
        if self.testa.valore == valore:
            self.testa = self.testa.successivo
            return True
        
        # Cerca il nodo da rimuovere
        corrente = self.testa
        while corrente.successivo and corrente.successivo.valore != valore:
            corrente = corrente.successivo
        
        # Se il valore è stato trovato
        if corrente.successivo:
            corrente.successivo = corrente.successivo.successivo
            return True
        
        return False
    
    def cerca(self, valore):
        corrente = self.testa
        while corrente:
            if corrente.valore == valore:
                return True
            corrente = corrente.successivo
        return False
    
    def stampa(self):
        elementi = []
        corrente = self.testa
        while corrente:
            elementi.append(str(corrente.valore))
            corrente = corrente.successivo
        return " -> ".join(elementi)
```

### Esempio di utilizzo della lista concatenata

```python
# Creazione di una lista concatenata
lista = ListaConcatenata()

# Aggiunta di elementi
lista.aggiungi_inizio(30)
lista.aggiungi_inizio(20)
lista.aggiungi_inizio(10)
lista.aggiungi_fine(40)

print(lista.stampa())  # Output: 10 -> 20 -> 30 -> 40

# Ricerca di elementi
print(lista.cerca(30))  # Output: True
print(lista.cerca(50))  # Output: False

# Rimozione di elementi
lista.rimuovi(20)
print(lista.stampa())  # Output: 10 -> 30 -> 40
```

### Vantaggi e svantaggi delle liste concatenate

**Vantaggi**:
- Inserimento e rimozione efficienti in qualsiasi posizione (O(1) se si ha un riferimento al nodo)
- Dimensione dinamica senza necessità di riallocazione
- Nessuno spreco di memoria per spazi non utilizzati

**Svantaggi**:
- Accesso non diretto agli elementi (O(n) nel caso peggiore)
- Maggiore utilizzo di memoria per i puntatori
- Minore efficienza nella cache della CPU

## Pile (Stack)

Una pila è una struttura dati che segue il principio LIFO (Last In, First Out), ovvero l'ultimo elemento inserito è il primo ad essere rimosso. È simile a una pila di piatti: si aggiungono e si rimuovono piatti dalla cima.

### Operazioni principali

- **push**: aggiunge un elemento in cima alla pila
- **pop**: rimuove e restituisce l'elemento in cima alla pila
- **peek** (o **top**): restituisce l'elemento in cima senza rimuoverlo
- **is_empty**: verifica se la pila è vuota

### Implementazione usando una lista Python

```python
class Pila:
    def __init__(self):
        self.elementi = []
    
    def è_vuota(self):
        return len(self.elementi) == 0
    
    def push(self, elemento):
        self.elementi.append(elemento)
    
    def pop(self):
        if self.è_vuota():
            raise IndexError("Pop da una pila vuota")
        return self.elementi.pop()
    
    def peek(self):
        if self.è_vuota():
            raise IndexError("Peek da una pila vuota")
        return self.elementi[-1]
    
    def dimensione(self):
        return len(self.elementi)
```

### Esempio di utilizzo della pila

```python
# Creazione di una pila
pila = Pila()

# Aggiunta di elementi
pila.push(10)
pila.push(20)
pila.push(30)

print(f"Dimensione della pila: {pila.dimensione()}")  # Output: 3
print(f"Elemento in cima: {pila.peek()}")  # Output: 30

# Rimozione di elementi
elemento = pila.pop()
print(f"Elemento rimosso: {elemento}")  # Output: 30
print(f"Nuovo elemento in cima: {pila.peek()}")  # Output: 20
```

### Applicazioni delle pile

- Valutazione di espressioni matematiche
- Gestione delle chiamate di funzione (call stack)
- Implementazione dell'algoritmo di backtracking
- Verifica del bilanciamento delle parentesi
- Conversione da notazione infissa a postfissa

### Esempio: verifica del bilanciamento delle parentesi

```python
def parentesi_bilanciate(espressione):
    pila = []
    parentesi_aperte = "({["
    parentesi_chiuse = ")}]"
    
    for carattere in espressione:
        if carattere in parentesi_aperte:
            pila.append(carattere)
        elif carattere in parentesi_chiuse:
            if not pila:
                return False
            
            indice_chiusa = parentesi_chiuse.index(carattere)
            aperta_corrispondente = parentesi_aperte[indice_chiusa]
            
            if pila[-1] != aperta_corrispondente:
                return False
            
            pila.pop()
    
    return len(pila) == 0

# Test
print(parentesi_bilanciate("({}[])")))  # Output: True
print(parentesi_bilanciate("([)]")))    # Output: False
```

## Code (Queue)

Una coda è una struttura dati che segue il principio FIFO (First In, First Out), ovvero il primo elemento inserito è il primo ad essere rimosso. È simile a una fila di persone: chi arriva prima viene servito prima.

### Operazioni principali

- **enqueue**: aggiunge un elemento alla fine della coda
- **dequeue**: rimuove e restituisce l'elemento all'inizio della coda
- **front**: restituisce l'elemento all'inizio senza rimuoverlo
- **is_empty**: verifica se la coda è vuota

### Implementazione usando una lista Python

```python
class Coda:
    def __init__(self):
        self.elementi = []
    
    def è_vuota(self):
        return len(self.elementi) == 0
    
    def enqueue(self, elemento):
        self.elementi.append(elemento)
    
    def dequeue(self):
        if self.è_vuota():
            raise IndexError("Dequeue da una coda vuota")
        return self.elementi.pop(0)  # Inefficiente per liste grandi
    
    def front(self):
        if self.è_vuota():
            raise IndexError("Front da una coda vuota")
        return self.elementi[0]
    
    def dimensione(self):
        return len(self.elementi)
```

### Implementazione efficiente usando `collections.deque`

```python
from collections import deque

class CodaEfficiente:
    def __init__(self):
        self.elementi = deque()
    
    def è_vuota(self):
        return len(self.elementi) == 0
    
    def enqueue(self, elemento):
        self.elementi.append(elemento)
    
    def dequeue(self):
        if self.è_vuota():
            raise IndexError("Dequeue da una coda vuota")
        return self.elementi.popleft()  # O(1) invece di O(n)
    
    def front(self):
        if self.è_vuota():
            raise IndexError("Front da una coda vuota")
        return self.elementi[0]
    
    def dimensione(self):
        return len(self.elementi)
```

### Esempio di utilizzo della coda

```python
# Creazione di una coda
coda = CodaEfficiente()

# Aggiunta di elementi
coda.enqueue("Cliente 1")
coda.enqueue("Cliente 2")
coda.enqueue("Cliente 3")

print(f"Dimensione della coda: {coda.dimensione()}")  # Output: 3
print(f"Prossimo cliente: {coda.front()}")  # Output: Cliente 1

# Rimozione di elementi
cliente = coda.dequeue()
print(f"Cliente servito: {cliente}")  # Output: Cliente 1
print(f"Nuovo prossimo cliente: {coda.front()}")  # Output: Cliente 2
```

### Applicazioni delle code

- Gestione di processi in un sistema operativo
- Gestione di richieste in un server web
- Algoritmi di attraversamento in ampiezza (BFS)
- Simulazione di eventi
- Buffer per la gestione di dati in streaming

### Esempio: attraversamento in ampiezza di un grafo

```python
from collections import deque

def bfs(grafo, nodo_iniziale):
    visitati = set([nodo_iniziale])
    coda = deque([nodo_iniziale])
    risultato = []
    
    while coda:
        nodo_corrente = coda.popleft()
        risultato.append(nodo_corrente)
        
        for vicino in grafo[nodo_corrente]:
            if vicino not in visitati:
                visitati.add(vicino)
                coda.append(vicino)
    
    return risultato

# Esempio di grafo rappresentato come dizionario di adiacenza
grafo = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}

print(bfs(grafo, 'A'))  # Output: ['A', 'B', 'C', 'D', 'E', 'F']
```

## Coda a priorità

Una coda a priorità è una variante della coda in cui ogni elemento ha una priorità associata. Gli elementi con priorità più alta vengono serviti prima di quelli con priorità più bassa.

### Implementazione usando il modulo `heapq`

```python
import heapq

class CodaPriorita:
    def __init__(self):
        self.elementi = []
        self.contatore = 0  # Per gestire elementi con stessa priorità
    
    def è_vuota(self):
        return len(self.elementi) == 0
    
    def enqueue(self, elemento, priorità):
        # Usiamo il contatore per mantenere l'ordine FIFO per elementi con stessa priorità
        heapq.heappush(self.elementi, (priorità, self.contatore, elemento))
        self.contatore += 1
    
    def dequeue(self):
        if self.è_vuota():
            raise IndexError("Dequeue da una coda vuota")
        return heapq.heappop(self.elementi)[2]  # Restituisce solo l'elemento
    
    def dimensione(self):
        return len(self.elementi)
```

### Esempio di utilizzo della coda a priorità

```python
# Creazione di una coda a priorità
coda_priorita = CodaPriorita()

# Aggiunta di elementi con priorità (priorità più bassa = servito prima)
coda_priorita.enqueue("Paziente con ferita lieve", 3)
coda_priorita.enqueue("Paziente con infarto", 1)
coda_priorita.enqueue("Paziente con frattura", 2)

# Servizio dei pazienti in ordine di priorità
print(f"Primo paziente: {coda_priorita.dequeue()}")  # Output: Paziente con infarto
print(f"Secondo paziente: {coda_priorita.dequeue()}")  # Output: Paziente con frattura
print(f"Terzo paziente: {coda_priorita.dequeue()}")  # Output: Paziente con ferita lieve
```

### Applicazioni delle code a priorità

- Algoritmi di pianificazione in sistemi operativi
- Algoritmo di Dijkstra per trovare il percorso più breve in un grafo
- Compressione di dati (algoritmo di Huffman)
- Simulazione di eventi discreti

## Deque (Double-Ended Queue)

Un deque (pronunciato "deck") è una struttura dati che permette di inserire e rimuovere elementi sia dall'inizio che dalla fine in tempo costante O(1).

### Implementazione usando `collections.deque`

```python
from collections import deque

# Creazione di un deque
d = deque([1, 2, 3])

# Aggiunta di elementi
d.append(4)        # Aggiunge alla fine: [1, 2, 3, 4]
d.appendleft(0)    # Aggiunge all'inizio: [0, 1, 2, 3, 4]

# Rimozione di elementi
ultimo = d.pop()        # Rimuove dalla fine: [0, 1, 2, 3]
primo = d.popleft()     # Rimuove dall'inizio: [1, 2, 3]

print(f"Deque: {d}")
print(f"Elemento rimosso dalla fine: {ultimo}")
print(f"Elemento rimosso dall'inizio: {primo}")

# Rotazione degli elementi
d = deque([1, 2, 3, 4, 5])
d.rotate(2)    # Ruota di 2 posizioni a destra: [4, 5, 1, 2, 3]
print(f"Dopo rotazione a destra: {d}")

d.rotate(-2)   # Ruota di 2 posizioni a sinistra: [1, 2, 3, 4, 5]
print(f"Dopo rotazione a sinistra: {d}")
```

### Applicazioni dei deque

- Implementazione di pile e code
- Algoritmi di sliding window
- Memorizzazione di cronologia (history)
- Implementazione di buffer circolari

## Confronto tra le strutture dati lineari

| Struttura | Accesso | Inserimento inizio | Inserimento fine | Rimozione inizio | Rimozione fine | Ricerca |
|-----------|---------|-------------------|-----------------|-----------------|---------------|--------|
| Lista Python | O(1) | O(n) | O(1) | O(n) | O(1) | O(n) |
| Lista Concatenata | O(n) | O(1) | O(n)* | O(1) | O(n)* | O(n) |
| Pila | O(n) | N/A | O(1) | N/A | O(1) | O(n) |
| Coda | O(n) | N/A | O(1) | O(1)** | N/A | O(n) |
| Deque | O(n) | O(1) | O(1) | O(1) | O(1) | O(n) |

\* O(1) se si mantiene un riferimento all'ultimo nodo  
\** O(1) solo con implementazione efficiente (es. `collections.deque`)

## Conclusione

Le strutture dati lineari come liste, pile e code sono fondamentali in informatica e costituiscono la base per implementare algoritmi più complessi. La scelta della struttura dati più adatta dipende dalle operazioni che si devono eseguire più frequentemente e dai vincoli specifici del problema.

In Python, è possibile implementare queste strutture dati sia utilizzando le strutture integrate (come `list` e `collections.deque`), sia implementandole da zero per comprendere meglio il loro funzionamento interno.

## Esercizi

1. Implementa una lista concatenata doppia, in cui ogni nodo ha riferimenti sia al nodo successivo che al nodo precedente.

2. Scrivi una funzione che inverta una lista concatenata senza utilizzare strutture dati aggiuntive.

3. Implementa una pila che, oltre alle operazioni standard, abbia anche un metodo `get_min()` che restituisca il valore minimo nella pila in tempo O(1).

4. Utilizza due pile per implementare una coda efficiente.

5. Implementa un algoritmo per verificare se una stringa è un palindromo utilizzando un deque.

## Risorse aggiuntive

- [Documentazione Python: list](https://docs.python.org/3/tutorial/datastructures.html#more-on-lists)
- [Documentazione Python: collections.deque](https://docs.python.org/3/library/collections.html#collections.deque)
- [Visualizzazione delle strutture dati](https://visualgo.net/en/list)

## Navigazione

- [Indice della sezione](../README.md)
- [Guida precedente: Algoritmi di Ricerca](03-algoritmi-ricerca.md)
- [Prossima guida: Alberi e Grafi](05-alberi-grafi.md)