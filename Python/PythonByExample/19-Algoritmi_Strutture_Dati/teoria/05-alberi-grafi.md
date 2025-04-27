# Alberi e Grafi

## Introduzione alle strutture dati gerarchiche

Le strutture dati gerarchiche, come alberi e grafi, sono fondamentali in informatica per rappresentare relazioni complesse tra elementi. A differenza delle strutture dati lineari, queste permettono di modellare relazioni gerarchiche o a rete, risultando essenziali per risolvere numerosi problemi computazionali.

In questa guida, esploreremo le caratteristiche, le implementazioni e le applicazioni di alberi e grafi in Python, analizzando i principali algoritmi associati a queste strutture dati.

## Alberi

Un albero è una struttura dati gerarchica composta da nodi collegati tra loro. Ogni albero ha un nodo radice, e ogni nodo può avere zero o più nodi figli. I nodi senza figli sono chiamati foglie.

### Terminologia degli alberi

- **Nodo**: elemento base dell'albero che contiene dati e riferimenti ai nodi figli
- **Radice**: nodo principale da cui si diramano tutti gli altri nodi
- **Foglia**: nodo senza figli
- **Nodo interno**: nodo che non è né radice né foglia
- **Genitore**: nodo che ha figli
- **Figlio**: nodo che ha un genitore
- **Fratelli**: nodi che condividono lo stesso genitore
- **Livello**: distanza di un nodo dalla radice
- **Altezza**: massima distanza dalla radice a una foglia
- **Profondità**: distanza di un nodo dalla radice
- **Sottoalbero**: albero formato da un nodo e tutti i suoi discendenti

### Albero binario

Un albero binario è un tipo di albero in cui ogni nodo può avere al massimo due figli, generalmente chiamati figlio sinistro e figlio destro.

#### Implementazione di un albero binario

```python
class NodoAlberoBinario:
    def __init__(self, valore):
        self.valore = valore
        self.sinistro = None
        self.destro = None

class AlberoBinario:
    def __init__(self, radice=None):
        self.radice = radice
    
    def inserisci(self, valore):
        if self.radice is None:
            self.radice = NodoAlberoBinario(valore)
            return
        
        self._inserisci_ricorsivo(self.radice, valore)
    
    def _inserisci_ricorsivo(self, nodo, valore):
        if valore < nodo.valore:
            if nodo.sinistro is None:
                nodo.sinistro = NodoAlberoBinario(valore)
            else:
                self._inserisci_ricorsivo(nodo.sinistro, valore)
        else:
            if nodo.destro is None:
                nodo.destro = NodoAlberoBinario(valore)
            else:
                self._inserisci_ricorsivo(nodo.destro, valore)
    
    def cerca(self, valore):
        return self._cerca_ricorsivo(self.radice, valore)
    
    def _cerca_ricorsivo(self, nodo, valore):
        if nodo is None or nodo.valore == valore:
            return nodo
        
        if valore < nodo.valore:
            return self._cerca_ricorsivo(nodo.sinistro, valore)
        return self._cerca_ricorsivo(nodo.destro, valore)
```

### Attraversamento di alberi

Esistono diversi modi per visitare tutti i nodi di un albero:

#### Attraversamento in ordine (inorder)

Visita prima il sottoalbero sinistro, poi il nodo corrente, infine il sottoalbero destro.

```python
def attraversamento_inorder(nodo):
    if nodo:
        attraversamento_inorder(nodo.sinistro)
        print(nodo.valore, end=" ")
        attraversamento_inorder(nodo.destro)
```

#### Attraversamento in preordine (preorder)

Visita prima il nodo corrente, poi il sottoalbero sinistro, infine il sottoalbero destro.

```python
def attraversamento_preorder(nodo):
    if nodo:
        print(nodo.valore, end=" ")
        attraversamento_preorder(nodo.sinistro)
        attraversamento_preorder(nodo.destro)
```

#### Attraversamento in postordine (postorder)

Visita prima il sottoalbero sinistro, poi il sottoalbero destro, infine il nodo corrente.

```python
def attraversamento_postorder(nodo):
    if nodo:
        attraversamento_postorder(nodo.sinistro)
        attraversamento_postorder(nodo.destro)
        print(nodo.valore, end=" ")
```

#### Attraversamento in ampiezza (breadth-first)

Visita i nodi livello per livello, da sinistra a destra.

```python
from collections import deque

def attraversamento_ampiezza(radice):
    if radice is None:
        return
    
    coda = deque([radice])
    
    while coda:
        nodo = coda.popleft()
        print(nodo.valore, end=" ")
        
        if nodo.sinistro:
            coda.append(nodo.sinistro)
        if nodo.destro:
            coda.append(nodo.destro)
```

### Albero binario di ricerca (BST)

Un albero binario di ricerca è un tipo di albero binario in cui, per ogni nodo, tutti i valori nel sottoalbero sinistro sono minori del valore del nodo, e tutti i valori nel sottoalbero destro sono maggiori.

#### Vantaggi del BST

- Ricerca, inserimento e cancellazione efficienti (O(log n) nel caso medio)
- Mantiene i dati ordinati
- Supporta molte operazioni di un insieme dinamico

#### Implementazione di un BST

L'implementazione dell'albero binario mostrata in precedenza è già un albero binario di ricerca. Aggiungiamo alcune funzionalità:

```python
class AlberoBinarioDiRicerca(AlberoBinario):
    def minimo(self):
        if self.radice is None:
            return None
        return self._minimo_ricorsivo(self.radice)
    
    def _minimo_ricorsivo(self, nodo):
        corrente = nodo
        while corrente.sinistro:
            corrente = corrente.sinistro
        return corrente
    
    def massimo(self):
        if self.radice is None:
            return None
        return self._massimo_ricorsivo(self.radice)
    
    def _massimo_ricorsivo(self, nodo):
        corrente = nodo
        while corrente.destro:
            corrente = corrente.destro
        return corrente
    
    def elimina(self, valore):
        self.radice = self._elimina_ricorsivo(self.radice, valore)
    
    def _elimina_ricorsivo(self, nodo, valore):
        # Caso base: albero vuoto
        if nodo is None:
            return nodo
        
        # Cerca il nodo da eliminare
        if valore < nodo.valore:
            nodo.sinistro = self._elimina_ricorsivo(nodo.sinistro, valore)
        elif valore > nodo.valore:
            nodo.destro = self._elimina_ricorsivo(nodo.destro, valore)
        else:
            # Nodo con un solo figlio o nessun figlio
            if nodo.sinistro is None:
                return nodo.destro
            elif nodo.destro is None:
                return nodo.sinistro
            
            # Nodo con due figli: trova il successore in ordine (minimo nel sottoalbero destro)
            nodo.valore = self._minimo_ricorsivo(nodo.destro).valore
            
            # Elimina il successore in ordine
            nodo.destro = self._elimina_ricorsivo(nodo.destro, nodo.valore)
        
        return nodo
```

### Alberi bilanciati

Un albero bilanciato è un albero in cui l'altezza dei sottoalberi sinistro e destro di ogni nodo differisce al massimo di un valore predefinito. Gli alberi bilanciati garantiscono operazioni in O(log n).

Alcuni tipi di alberi bilanciati:

- **Alberi AVL**: la differenza di altezza tra i sottoalberi sinistro e destro è al massimo 1
- **Alberi Rosso-Nero**: ogni nodo è colorato di rosso o nero, con specifiche regole di bilanciamento
- **Alberi B e B+**: utilizzati principalmente nei database e nei file system

### Heap

Un heap è un albero binario completo o quasi completo che soddisfa la proprietà heap: in un max-heap, per ogni nodo, il valore del nodo è maggiore o uguale ai valori dei suoi figli; in un min-heap, il valore del nodo è minore o uguale ai valori dei suoi figli.

#### Implementazione di un min-heap

Python fornisce il modulo `heapq` che implementa un min-heap:

```python
import heapq

# Creazione di un heap
heap = []

# Inserimento di elementi
heapq.heappush(heap, 5)
heapq.heappush(heap, 3)
heapq.heappush(heap, 7)
heapq.heappush(heap, 1)

print(f"Heap: {heap}")  # Output: [1, 3, 7, 5]

# Estrazione del minimo
minimo = heapq.heappop(heap)
print(f"Minimo: {minimo}")  # Output: 1
print(f"Heap dopo estrazione: {heap}")  # Output: [3, 5, 7]

# Conversione di una lista in heap
lista = [5, 3, 7, 1, 9, 2]
heapq.heapify(lista)
print(f"Lista convertita in heap: {lista}")  # Output: [1, 3, 2, 5, 9, 7]
```

## Grafi

Un grafo è una struttura dati che consiste in un insieme di nodi (o vertici) e un insieme di archi che collegano coppie di nodi. I grafi sono utilizzati per rappresentare reti, relazioni e molti altri tipi di dati strutturati.

### Terminologia dei grafi

- **Nodo (o vertice)**: elemento base del grafo
- **Arco (o spigolo)**: connessione tra due nodi
- **Grafo diretto**: grafo in cui gli archi hanno una direzione
- **Grafo non diretto**: grafo in cui gli archi non hanno direzione
- **Grafo pesato**: grafo in cui ogni arco ha un peso o costo associato
- **Grafo ciclico**: grafo che contiene almeno un ciclo
- **Grafo aciclico**: grafo senza cicli
- **Grafo connesso**: grafo in cui esiste un percorso tra ogni coppia di nodi
- **Grafo completo**: grafo in cui ogni nodo è collegato a tutti gli altri nodi

### Rappresentazione dei grafi

Esistono diversi modi per rappresentare un grafo in memoria:

#### Matrice di adiacenza

Una matrice di adiacenza è una matrice quadrata in cui l'elemento (i, j) è 1 se esiste un arco dal nodo i al nodo j, altrimenti è 0. Per grafi pesati, l'elemento (i, j) rappresenta il peso dell'arco.

```python
class GrafoMatriceAdiacenza:
    def __init__(self, num_nodi):
        self.num_nodi = num_nodi
        self.matrice = [[0 for _ in range(num_nodi)] for _ in range(num_nodi)]
    
    def aggiungi_arco(self, u, v, peso=1):
        self.matrice[u][v] = peso
        # Per grafi non diretti, decommentare la linea seguente
        # self.matrice[v][u] = peso
    
    def rimuovi_arco(self, u, v):
        self.matrice[u][v] = 0
        # Per grafi non diretti, decommentare la linea seguente
        # self.matrice[v][u] = 0
    
    def ha_arco(self, u, v):
        return self.matrice[u][v] != 0
    
    def get_peso(self, u, v):
        return self.matrice[u][v]
    
    def get_vicini(self, u):
        vicini = []
        for v in range(self.num_nodi):
            if self.matrice[u][v] != 0:
                vicini.append(v)
        return vicini
    
    def stampa(self):
        for riga in self.matrice:
            print(riga)
```

#### Lista di adiacenza

Una lista di adiacenza è una collezione di liste non ordinate, una per ogni nodo, che contiene tutti i nodi adiacenti a quel nodo.

```python
class GrafoListaAdiacenza:
    def __init__(self, num_nodi):
        self.num_nodi = num_nodi
        self.lista = [[] for _ in range(num_nodi)]
    
    def aggiungi_arco(self, u, v, peso=1):
        self.lista[u].append((v, peso))
        # Per grafi non diretti, decommentare la linea seguente
        # self.lista[v].append((u, peso))
    
    def rimuovi_arco(self, u, v):
        self.lista[u] = [(nodo, peso) for nodo, peso in self.lista[u] if nodo != v]
        # Per grafi non diretti, decommentare la linea seguente
        # self.lista[v] = [(nodo, peso) for nodo, peso in self.lista[v] if nodo != u]
    
    def ha_arco(self, u, v):
        return any(nodo == v for nodo, _ in self.lista[u])
    
    def get_peso(self, u, v):
        for nodo, peso in self.lista[u]:
            if nodo == v:
                return peso
        return 0
    
    def get_vicini(self, u):
        return [nodo for nodo, _ in self.lista[u]]
    
    def stampa(self):
        for i, vicini in enumerate(self.lista):
            print(f"{i}: {vicini}")
```

### Attraversamento di grafi

Esistono due principali algoritmi per attraversare un grafo:

#### Ricerca in profondità (DFS - Depth-First Search)

La DFS esplora il grafo andando il più in profondità possibile lungo ogni ramo prima di tornare indietro.

```python
def dfs(grafo, nodo_iniziale, visitati=None):
    if visitati is None:
        visitati = set()
    
    visitati.add(nodo_iniziale)
    print(nodo_iniziale, end=" ")
    
    for vicino in grafo.get_vicini(nodo_iniziale):
        if vicino not in visitati:
            dfs(grafo, vicino, visitati)
    
    return visitati
```

#### Ricerca in ampiezza (BFS - Breadth-First Search)

La BFS esplora il grafo livello per livello, visitando tutti i nodi a distanza k dalla sorgente prima di passare ai nodi a distanza k+1.

```python
from collections import deque

def bfs(grafo, nodo_iniziale):
    visitati = set([nodo_iniziale])
    coda = deque([nodo_iniziale])
    
    while coda:
        nodo_corrente = coda.popleft()
        print(nodo_corrente, end=" ")
        
        for vicino in grafo.get_vicini(nodo_corrente):
            if vicino not in visitati:
                visitati.add(vicino)
                coda.append(vicino)
    
    return visitati
```

### Algoritmi su grafi

#### Algoritmo di Dijkstra (percorso minimo)

L'algoritmo di Dijkstra trova il percorso più breve da un nodo sorgente a tutti gli altri nodi in un grafo pesato con pesi non negativi.

```python
import heapq

def dijkstra(grafo, sorgente):
    # Inizializzazione
    distanze = [float('infinity')] * grafo.num_nodi
    distanze[sorgente] = 0
    coda_priorita = [(0, sorgente)]
    precedenti = [None] * grafo.num_nodi
    
    while coda_priorita:
        dist_corrente, nodo_corrente = heapq.heappop(coda_priorita)
        
        # Se abbiamo già trovato una distanza minore, ignoriamo
        if dist_corrente > distanze[nodo_corrente]:
            continue
        
        for vicino in grafo.get_vicini(nodo_corrente):
            peso = grafo.get_peso(nodo_corrente, vicino)
            distanza = dist_corrente + peso
            
            # Se abbiamo trovato un percorso più breve verso il vicino
            if distanza < distanze[vicino]:
                distanze[vicino] = distanza
                precedenti[vicino] = nodo_corrente
                heapq.heappush(coda_priorita, (distanza, vicino))
    
    return distanze, precedenti

def ricostruisci_percorso(precedenti, destinazione):
    percorso = []
    nodo_corrente = destinazione
    
    while nodo_corrente is not None:
        percorso.append(nodo_corrente)
        nodo_corrente = precedenti[nodo_corrente]
    
    return percorso[::-1]  # Inverti il percorso
```

#### Algoritmo di Kruskal (albero di copertura minimo)

L'algoritmo di Kruskal trova un albero di copertura minimo in un grafo connesso e pesato.

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]
    
    def union(self, x, y):
        root_x = self.find(x)
        root_y = self.find(y)
        
        if root_x == root_y:
            return
        
        # Union by rank
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1

def kruskal(grafo):
    # Crea una lista di tutti gli archi
    archi = []
    for u in range(grafo.num_nodi):
        for v in grafo.get_vicini(u):
            peso = grafo.get_peso(u, v)
            archi.append((u, v, peso))
    
    # Ordina gli archi per peso
    archi.sort(key=lambda x: x[2])
    
    # Inizializza Union-Find
    uf = UnionFind(grafo.num_nodi)
    
    # Albero di copertura minimo
    mst = []
    
    for u, v, peso in archi:
        if uf.find(u) != uf.find(v):  # Verifica che non si formi un ciclo
            uf.union(u, v)
            mst.append((u, v, peso))
    
    return mst
```

#### Algoritmo di Prim (albero di copertura minimo)

L'algoritmo di Prim è un'alternativa all'algoritmo di Kruskal per trovare un albero di copertura minimo.

```python
import heapq

def prim(grafo, nodo_iniziale=0):
    # Inizializzazione
    visitati = [False] * grafo.num_nodi
    coda_priorita = [(0, nodo_iniziale, None)]  # (peso, nodo, genitore)
    mst = []
    
    while coda_priorita:
        peso, nodo, genitore = heapq.heappop(coda_priorita)
        
        if visitati[nodo]:
            continue
        
        visitati[nodo] = True
        
        if genitore is not None:
            mst.append((genitore, nodo, peso))
        
        for vicino in grafo.get_vicini(nodo):
            if not visitati[vicino]:
                peso_arco = grafo.get_peso(nodo, vicino)
                heapq.heappush(coda_priorita, (peso_arco, vicino, nodo))
    
    return mst
```

### Applicazioni di alberi e grafi

- **Alberi**:
  - Strutture dati gerarchiche (file system, organizzazioni)
  - Alberi di decisione in machine learning
  - Alberi sintattici in compilatori
  - Heap per code di priorità

- **Grafi**:
  - Reti sociali
  - Sistemi di navigazione e mappe
  - Reti di computer
  - Analisi di dipendenze
  - Algoritmi di scheduling

## Conclusione

Alberi e grafi sono strutture dati potenti che permettono di modellare una vasta gamma di problemi del mondo reale. La comprensione di queste strutture e degli algoritmi associati è fondamentale per affrontare problemi complessi in informatica.

In Python, è possibile implementare queste strutture dati da zero o utilizzare librerie come `networkx` per lavorare con grafi in modo più efficiente.

## Esercizi

1. Implementa un albero binario di ricerca bilanciato (AVL o Rosso-Nero).

2. Scrivi una funzione che verifichi se un grafo è connesso.

3. Implementa l'algoritmo di Floyd-Warshall per trovare i percorsi minimi tra tutte le coppie di nodi in un grafo.

4. Crea una funzione che verifichi se un grafo è bipartito.

5. Implementa un algoritmo per trovare tutti i cicli in un grafo diretto.

## Risorse aggiuntive

- [Visualizzazione di alberi e grafi](https://visualgo.net/en/bst)
- [Libreria NetworkX per grafi in Python](https://networkx.org/)
- [Libro: "Introduction to Algorithms" di Cormen, Leiserson, Rivest e Stein](https://mitpress.mit.edu/books/introduction-algorithms-third-edition)

## Navigazione

- [Indice della sezione](../README.md)
- [Guida precedente: Liste, Pile e Code](04-liste-pile-code.md)
- [Prossima guida: Tabelle Hash e Set](06-tabelle-hash-set.md)