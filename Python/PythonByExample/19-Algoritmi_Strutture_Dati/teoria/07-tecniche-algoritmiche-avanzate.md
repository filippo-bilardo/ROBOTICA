# Tecniche Algoritmiche Avanzate

In questa guida esploreremo alcune delle tecniche algoritmiche più potenti e versatili utilizzate nella risoluzione di problemi complessi: la programmazione dinamica, gli algoritmi greedy (avidi) e la tecnica divide et impera. Queste strategie rappresentano approcci fondamentali per affrontare problemi computazionali difficili in modo efficiente.

## Indice dei contenuti

1. [Introduzione alle tecniche algoritmiche avanzate](#introduzione-alle-tecniche-algoritmiche-avanzate)
2. [Divide et Impera](#divide-et-impera)
3. [Programmazione Dinamica](#programmazione-dinamica)
4. [Algoritmi Greedy](#algoritmi-greedy)
5. [Confronto tra le tecniche](#confronto-tra-le-tecniche)
6. [Esercizi pratici](#esercizi-pratici)

## Introduzione alle tecniche algoritmiche avanzate

Le tecniche algoritmiche avanzate ci permettono di affrontare problemi complessi scomponendoli in sottoproblemi più semplici o applicando strategie specifiche per ottimizzare la ricerca della soluzione. Queste tecniche sono particolarmente utili quando gli approcci più semplici risultano inefficienti o impraticabili.

## Divide et Impera

La tecnica "divide et impera" (dividi e conquista) consiste nel:

1. **Dividere** il problema in sottoproblemi più piccoli dello stesso tipo
2. **Conquistare** risolvendo i sottoproblemi ricorsivamente
3. **Combinare** le soluzioni dei sottoproblemi per ottenere la soluzione del problema originale

### Esempio: Merge Sort

Un classico esempio di algoritmo divide et impera è il Merge Sort:

```python
def merge_sort(arr):
    # Caso base: un array con 0 o 1 elementi è già ordinato
    if len(arr) <= 1:
        return arr
    
    # Divide: trova il punto medio e divide l'array in due metà
    mid = len(arr) // 2
    left = arr[:mid]
    right = arr[mid:]
    
    # Conquista: ordina ricorsivamente le due metà
    left = merge_sort(left)
    right = merge_sort(right)
    
    # Combina: unisci le due metà ordinate
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    # Confronta gli elementi delle due metà e li inserisce in ordine
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    # Aggiunge gli elementi rimanenti
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

### Analisi della complessità

La complessità temporale degli algoritmi divide et impera può essere analizzata utilizzando il teorema master. Per il Merge Sort, la complessità è O(n log n) in tutti i casi, rendendolo più efficiente del Bubble Sort o dell'Insertion Sort per array di grandi dimensioni.

## Programmazione Dinamica

La programmazione dinamica è una tecnica per risolvere problemi complessi scomponendoli in sottoproblemi più semplici e memorizzando i risultati per evitare di ricalcolare le stesse soluzioni più volte. È particolarmente utile quando:

1. Il problema può essere diviso in sottoproblemi sovrapposti
2. La soluzione ottimale del problema può essere costruita dalle soluzioni ottimali dei sottoproblemi

### Approcci alla programmazione dinamica

- **Top-down (memoizzazione)**: risolve il problema ricorsivamente e memorizza i risultati
- **Bottom-up (tabulazione)**: risolve prima i sottoproblemi più piccoli e li usa per costruire soluzioni per problemi più grandi

### Esempio: Sequenza di Fibonacci

**Approccio ricorsivo semplice (inefficiente):**

```python
def fibonacci_recursive(n):
    if n <= 1:
        return n
    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)
```

**Approccio con programmazione dinamica (top-down):**

```python
def fibonacci_memoization(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci_memoization(n-1, memo) + fibonacci_memoization(n-2, memo)
    return memo[n]
```

**Approccio con programmazione dinamica (bottom-up):**

```python
def fibonacci_tabulation(n):
    if n <= 1:
        return n
    
    # Inizializza la tabella
    dp = [0] * (n + 1)
    dp[1] = 1
    
    # Riempi la tabella dal basso verso l'alto
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]
```

### Esempio: Problema dello zaino (Knapsack Problem)

Il problema dello zaino è un classico problema di ottimizzazione: dato uno zaino con capacità limitata e un insieme di oggetti con peso e valore, trovare il sottoinsieme di oggetti che massimizza il valore totale senza superare la capacità dello zaino.

```python
def knapsack(weights, values, capacity):
    n = len(weights)
    # Inizializza la tabella DP
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
    
    # Riempi la tabella DP
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            # Se l'oggetto corrente pesa più della capacità corrente, non includerlo
            if weights[i-1] > w:
                dp[i][w] = dp[i-1][w]
            else:
                # Massimo tra: non includere l'oggetto o includerlo
                dp[i][w] = max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1])
    
    return dp[n][capacity]
```

## Algoritmi Greedy

Gli algoritmi greedy (avidi) prendono decisioni localmente ottimali ad ogni passo, sperando di raggiungere una soluzione globalmente ottimale. Questi algoritmi:

1. Fanno la scelta che sembra migliore in quel momento
2. Non riconsiderano mai le scelte fatte
3. Sono generalmente più semplici e più efficienti della programmazione dinamica

Tuttavia, gli algoritmi greedy non sempre garantiscono la soluzione ottimale per tutti i problemi.

### Esempio: Problema del resto

Dato un insieme di monete di diversi valori e un importo, trovare il numero minimo di monete necessarie per raggiungere l'importo.

```python
def coin_change_greedy(coins, amount):
    # Ordina le monete in ordine decrescente
    coins.sort(reverse=True)
    
    count = 0
    remaining = amount
    coin_used = {}
    
    for coin in coins:
        # Usa il maggior numero possibile di monete di questo valore
        num_coins = remaining // coin
        count += num_coins
        remaining -= num_coins * coin
        
        if num_coins > 0:
            coin_used[coin] = num_coins
    
    # Verifica se è stata trovata una soluzione
    if remaining == 0:
        print(f"Monete utilizzate: {coin_used}")
        return count
    else:
        print("Nessuna soluzione trovata con l'approccio greedy")
        return -1
```

**Nota**: L'approccio greedy per il problema del resto funziona solo per alcuni sistemi di monete (come quello degli Euro o dei Dollari USA). Per sistemi arbitrari di monete, la programmazione dinamica è necessaria per garantire la soluzione ottimale.

### Esempio: Algoritmo di Huffman

L'algoritmo di Huffman è un algoritmo greedy utilizzato per la compressione dei dati. Costruisce un albero di codifica ottimale basato sulla frequenza dei caratteri.

```python
import heapq
from collections import Counter

class Node:
    def __init__(self, char, freq):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None
    
    def __lt__(self, other):
        return self.freq < other.freq

def build_huffman_tree(text):
    # Conta la frequenza di ogni carattere
    frequency = Counter(text)
    
    # Crea una coda di priorità (min heap)
    priority_queue = [Node(char, freq) for char, freq in frequency.items()]
    heapq.heapify(priority_queue)
    
    # Costruisci l'albero di Huffman
    while len(priority_queue) > 1:
        # Estrai i due nodi con frequenza minima
        left = heapq.heappop(priority_queue)
        right = heapq.heappop(priority_queue)
        
        # Crea un nuovo nodo interno con questi due nodi come figli
        internal = Node(None, left.freq + right.freq)
        internal.left = left
        internal.right = right
        
        # Aggiungi il nuovo nodo alla coda di priorità
        heapq.heappush(priority_queue, internal)
    
    # L'ultimo nodo rimasto è la radice dell'albero
    return priority_queue[0] if priority_queue else None
```

## Confronto tra le tecniche

| Tecnica | Vantaggi | Svantaggi | Applicazioni tipiche |
|---------|----------|-----------|----------------------|
| **Divide et Impera** | - Parallelizzabile<br>- Efficiente per problemi ricorsivi | - Overhead per problemi piccoli<br>- Può richiedere molto spazio di stack | - Ordinamento (Merge Sort, Quick Sort)<br>- Moltiplicazione di matrici (Strassen)<br>- Ricerca binaria |
| **Programmazione Dinamica** | - Ottimale per problemi con sottostruttura ottimale<br>- Evita ricalcoli | - Richiede memoria per memorizzazione<br>- Può essere complessa da implementare | - Problemi di ottimizzazione<br>- Sequenze (LCS, edit distance)<br>- Problemi di percorso (cammini minimi) |
| **Algoritmi Greedy** | - Semplici da implementare<br>- Generalmente efficienti | - Non sempre producono soluzioni ottimali | - Algoritmi di scheduling<br>- Alberi di copertura minimi<br>- Compressione dati |

## Esercizi pratici

### Esercizio 1: Implementazione del Quick Sort

Implementa l'algoritmo Quick Sort utilizzando la tecnica divide et impera.

### Esercizio 2: Problema della sottosequenza comune più lunga

Implementa una soluzione con programmazione dinamica per trovare la sottosequenza comune più lunga tra due stringhe.

### Esercizio 3: Problema dello scheduling

Implementa un algoritmo greedy per schedulare il massimo numero di attività non sovrapposte, date le loro ore di inizio e fine.

## Conclusione

Le tecniche algoritmiche avanzate come divide et impera, programmazione dinamica e algoritmi greedy sono strumenti potenti nel toolkit di ogni programmatore. La scelta della tecnica giusta dipende dalle caratteristiche specifiche del problema da risolvere. Con la pratica, diventerai sempre più abile nel riconoscere quali problemi possono beneficiare di ciascuna tecnica.

## Navigazione

- [Indice della sezione](../README.md)
- [Guida precedente: Tabelle Hash e Set](06-tabelle-hash-set.md)
- [Guida successiva: Ottimizzazione degli Algoritmi](08-ottimizzazione-algoritmi.md)