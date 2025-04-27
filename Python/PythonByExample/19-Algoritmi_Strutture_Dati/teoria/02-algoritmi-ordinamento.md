# Algoritmi di Ordinamento

## Introduzione agli algoritmi di ordinamento

Gli algoritmi di ordinamento sono procedure che organizzano gli elementi di una collezione (tipicamente un array o una lista) in un determinato ordine, solitamente crescente o decrescente. Questi algoritmi sono fondamentali in informatica e vengono utilizzati come componenti di base per molti altri algoritmi più complessi.

In questa guida, esploreremo i principali algoritmi di ordinamento, implementandoli in Python e analizzando le loro caratteristiche in termini di complessità computazionale, stabilità e comportamento in diversi scenari.

## Concetti fondamentali

Prima di esaminare i singoli algoritmi, è importante comprendere alcuni concetti chiave:

- **Ordinamento in-place**: un algoritmo che modifica direttamente la struttura dati di input, senza utilizzare strutture dati ausiliarie significative
- **Stabilità**: un algoritmo di ordinamento è stabile se mantiene l'ordine relativo degli elementi con chiavi uguali
- **Complessità**: il tempo e lo spazio richiesti dall'algoritmo in funzione della dimensione dell'input

## Bubble Sort

Il Bubble Sort è uno degli algoritmi di ordinamento più semplici. Funziona confrontando ripetutamente coppie di elementi adiacenti e scambiandoli se sono nell'ordine sbagliato.

### Implementazione

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        # Flag per ottimizzare: se non ci sono scambi in un passaggio, l'array è ordinato
        scambi_effettuati = False
        
        # Ultimo i elementi sono già al posto giusto
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                scambi_effettuati = True
        
        # Se non ci sono stati scambi, l'array è ordinato
        if not scambi_effettuati:
            break
    
    return arr
```

### Analisi

- **Complessità temporale**:
  - Caso migliore: O(n) quando l'array è già ordinato
  - Caso medio: O(n²)
  - Caso peggiore: O(n²)
- **Complessità spaziale**: O(1) - ordinamento in-place
- **Stabilità**: Stabile

### Vantaggi e svantaggi

**Vantaggi**:
- Semplice da implementare e comprendere
- Efficiente per array quasi ordinati
- Stabile

**Svantaggi**:
- Molto inefficiente per array grandi
- Prestazioni inferiori rispetto ad altri algoritmi di ordinamento

## Insertion Sort

L'Insertion Sort costruisce l'array ordinato un elemento alla volta, inserendo ogni nuovo elemento nella posizione corretta all'interno della porzione già ordinata.

### Implementazione

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        chiave = arr[i]
        j = i - 1
        
        # Sposta gli elementi maggiori di chiave una posizione avanti
        while j >= 0 and arr[j] > chiave:
            arr[j + 1] = arr[j]
            j -= 1
        
        arr[j + 1] = chiave
    
    return arr
```

### Analisi

- **Complessità temporale**:
  - Caso migliore: O(n) quando l'array è già ordinato
  - Caso medio: O(n²)
  - Caso peggiore: O(n²)
- **Complessità spaziale**: O(1) - ordinamento in-place
- **Stabilità**: Stabile

### Vantaggi e svantaggi

**Vantaggi**:
- Semplice da implementare
- Efficiente per array piccoli o quasi ordinati
- Stabile
- Può ordinare l'array mentre viene costruito (ordinamento online)

**Svantaggi**:
- Inefficiente per array grandi

## Selection Sort

Il Selection Sort divide l'array in due parti: una parte ordinata e una parte non ordinata. Ad ogni iterazione, trova l'elemento minimo nella parte non ordinata e lo scambia con il primo elemento della parte non ordinata.

### Implementazione

```python
def selection_sort(arr):
    n = len(arr)
    
    for i in range(n):
        # Trova l'indice del valore minimo nella parte non ordinata
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        # Scambia il valore minimo con il primo elemento della parte non ordinata
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    
    return arr
```

### Analisi

- **Complessità temporale**:
  - Caso migliore: O(n²)
  - Caso medio: O(n²)
  - Caso peggiore: O(n²)
- **Complessità spaziale**: O(1) - ordinamento in-place
- **Stabilità**: Non stabile

### Vantaggi e svantaggi

**Vantaggi**:
- Semplice da implementare
- Numero minimo di scambi (al massimo n)

**Svantaggi**:
- Sempre O(n²) indipendentemente dall'input
- Non stabile

## Merge Sort

Il Merge Sort è un algoritmo di tipo divide et impera che divide l'array in due metà, ordina ricorsivamente ciascuna metà e poi unisce (merge) le due metà ordinate.

### Implementazione

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    # Divide l'array in due metà
    medio = len(arr) // 2
    sinistra = arr[:medio]
    destra = arr[medio:]
    
    # Ordina ricorsivamente le due metà
    sinistra = merge_sort(sinistra)
    destra = merge_sort(destra)
    
    # Unisce le due metà ordinate
    return merge(sinistra, destra)

def merge(sinistra, destra):
    risultato = []
    i = j = 0
    
    # Confronta gli elementi delle due metà e li inserisce in ordine
    while i < len(sinistra) and j < len(destra):
        if sinistra[i] <= destra[j]:
            risultato.append(sinistra[i])
            i += 1
        else:
            risultato.append(destra[j])
            j += 1
    
    # Aggiunge gli elementi rimanenti
    risultato.extend(sinistra[i:])
    risultato.extend(destra[j:])
    
    return risultato
```

### Analisi

- **Complessità temporale**:
  - Caso migliore: O(n log n)
  - Caso medio: O(n log n)
  - Caso peggiore: O(n log n)
- **Complessità spaziale**: O(n) - richiede spazio aggiuntivo
- **Stabilità**: Stabile

### Vantaggi e svantaggi

**Vantaggi**:
- Prestazioni garantite O(n log n) in tutti i casi
- Stabile
- Adatto per ordinare grandi quantità di dati

**Svantaggi**:
- Richiede spazio aggiuntivo O(n)
- Più complesso da implementare rispetto agli algoritmi elementari

## Quick Sort

Il Quick Sort è un altro algoritmo divide et impera che sceglie un elemento pivot, partiziona l'array attorno al pivot e ordina ricorsivamente le due partizioni.

### Implementazione

```python
def quick_sort(arr, inizio=0, fine=None):
    if fine is None:
        fine = len(arr) - 1
    
    if inizio < fine:
        # Partiziona l'array e ottieni l'indice del pivot
        indice_pivot = partiziona(arr, inizio, fine)
        
        # Ordina ricorsivamente le due partizioni
        quick_sort(arr, inizio, indice_pivot - 1)
        quick_sort(arr, indice_pivot + 1, fine)
    
    return arr

def partiziona(arr, inizio, fine):
    # Sceglie l'ultimo elemento come pivot
    pivot = arr[fine]
    i = inizio - 1
    
    for j in range(inizio, fine):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    # Posiziona il pivot nella sua posizione finale
    arr[i + 1], arr[fine] = arr[fine], arr[i + 1]
    
    return i + 1
```

### Analisi

- **Complessità temporale**:
  - Caso migliore: O(n log n)
  - Caso medio: O(n log n)
  - Caso peggiore: O(n²) quando l'array è già ordinato o inversamente ordinato
- **Complessità spaziale**: O(log n) per lo stack delle chiamate ricorsive
- **Stabilità**: Non stabile

### Vantaggi e svantaggi

**Vantaggi**:
- Molto efficiente nella pratica
- Ordinamento in-place (richiede solo O(log n) spazio aggiuntivo)
- Buone prestazioni con la cache della CPU

**Svantaggi**:
- Caso peggiore O(n²)
- Non stabile
- Implementazione ricorsiva può causare stack overflow per array molto grandi

## Heap Sort

L'Heap Sort utilizza una struttura dati heap per ordinare gli elementi. Costruisce un heap massimo dall'array e poi estrae ripetutamente il massimo.

### Implementazione

```python
def heap_sort(arr):
    n = len(arr)
    
    # Costruisce un heap massimo
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    # Estrae gli elementi uno alla volta
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]  # Scambia
        heapify(arr, i, 0)  # Ricostruisce l'heap
    
    return arr

def heapify(arr, n, i):
    più_grande = i
    sinistro = 2 * i + 1
    destro = 2 * i + 2
    
    # Verifica se il figlio sinistro è più grande della radice
    if sinistro < n and arr[sinistro] > arr[più_grande]:
        più_grande = sinistro
    
    # Verifica se il figlio destro è più grande della radice
    if destro < n and arr[destro] > arr[più_grande]:
        più_grande = destro
    
    # Se la radice non è il più grande, scambia e continua heapify
    if più_grande != i:
        arr[i], arr[più_grande] = arr[più_grande], arr[i]
        heapify(arr, n, più_grande)
```

### Analisi

- **Complessità temporale**:
  - Caso migliore: O(n log n)
  - Caso medio: O(n log n)
  - Caso peggiore: O(n log n)
- **Complessità spaziale**: O(1) - ordinamento in-place
- **Stabilità**: Non stabile

### Vantaggi e svantaggi

**Vantaggi**:
- Prestazioni garantite O(n log n) in tutti i casi
- Ordinamento in-place
- Non richiede spazio aggiuntivo significativo

**Svantaggi**:
- Non stabile
- Spesso più lento in pratica rispetto a Quick Sort e Merge Sort

## Confronto tra gli algoritmi di ordinamento

| Algoritmo | Caso migliore | Caso medio | Caso peggiore | Spazio | Stabile |
|-----------|--------------|------------|---------------|--------|----------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Sì |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Sì |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Sì |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |

## Quando usare quale algoritmo

- **Bubble Sort, Insertion Sort**: utili per array piccoli o quasi ordinati
- **Merge Sort**: quando hai bisogno di un ordinamento stabile e garantito O(n log n)
- **Quick Sort**: nella maggior parte dei casi pratici, è l'algoritmo più veloce
- **Heap Sort**: quando hai bisogno di un ordinamento garantito O(n log n) e spazio limitato

## Algoritmi di ordinamento in Python

Python fornisce funzioni integrate per l'ordinamento che sono altamente ottimizzate:

```python
# Ordinamento di una lista (modifica la lista originale)
lista = [5, 2, 8, 1, 9]
lista.sort()
print(lista)  # Output: [1, 2, 5, 8, 9]

# Ordinamento di qualsiasi iterabile (restituisce una nuova lista)
tupla = (5, 2, 8, 1, 9)
tupla_ordinata = sorted(tupla)
print(tupla_ordinata)  # Output: [1, 2, 5, 8, 9]

# Ordinamento con chiave personalizzata
parole = ['banana', 'mela', 'kiwi', 'arancia']
parole.sort(key=len)  # Ordina per lunghezza
print(parole)  # Output: ['mela', 'kiwi', 'banana', 'arancia']

# Ordinamento in ordine decrescente
numeri = [5, 2, 8, 1, 9]
numeri.sort(reverse=True)
print(numeri)  # Output: [9, 8, 5, 2, 1]
```

L'implementazione di `sort()` e `sorted()` in Python utilizza un algoritmo chiamato Timsort, che è un ibrido tra Merge Sort e Insertion Sort, progettato per funzionare bene su dati del mondo reale.

## Conclusione

Gli algoritmi di ordinamento sono fondamentali in informatica e la scelta dell'algoritmo giusto dipende dalle caratteristiche specifiche del problema: dimensione dei dati, distribuzione, vincoli di memoria, necessità di stabilità, ecc.

In Python, nella maggior parte dei casi pratici, è consigliabile utilizzare le funzioni integrate `sort()` e `sorted()`, che sono altamente ottimizzate. Tuttavia, comprendere come funzionano i diversi algoritmi di ordinamento è importante per sviluppare una solida conoscenza algoritmica.

## Esercizi

1. Implementa una versione del Bubble Sort che ordini in ordine decrescente.

2. Modifica l'algoritmo Quick Sort per utilizzare il pivot mediano di tre (primo, medio, ultimo elemento) invece dell'ultimo elemento.

3. Implementa un algoritmo di ordinamento che sia stabile e abbia complessità O(n log n) nel caso peggiore, diverso dal Merge Sort.

4. Scrivi una funzione che ordini un array di stringhe in base alla loro lunghezza, mantenendo l'ordine relativo tra stringhe della stessa lunghezza.

5. Confronta le prestazioni dei diversi algoritmi di ordinamento su array di varie dimensioni e caratteristiche (ordinati, inversamente ordinati, casuali).

## Risorse aggiuntive

- [Visualizzazione degli algoritmi di ordinamento](https://visualgo.net/en/sorting)
- [Documentazione Python: sorted()](https://docs.python.org/3/library/functions.html#sorted)
- [Articolo: "Timsort - The Sorting Algorithm Used in Python and Java"](https://hackernoon.com/timsort-the-fastest-sorting-algorithm-youve-never-heard-of-36b28417f399)

## Navigazione

- [Indice della sezione](../README.md)
- [Guida precedente: Introduzione agli Algoritmi](01-introduzione-algoritmi.md)
- [Prossima guida: Algoritmi di Ricerca](03-algoritmi-ricerca.md)