# Algoritmi di Ricerca

## Introduzione agli algoritmi di ricerca

Gli algoritmi di ricerca sono procedure progettate per trovare un elemento specifico all'interno di una collezione di dati. Questi algoritmi sono fondamentali in informatica e vengono utilizzati quotidianamente in numerose applicazioni, dai database ai motori di ricerca, fino ai sistemi di navigazione.

In questa guida, esploreremo i principali algoritmi di ricerca, implementandoli in Python e analizzando le loro caratteristiche in termini di efficienza, applicabilità e limitazioni.

## Ricerca Lineare (o Sequenziale)

La ricerca lineare è l'algoritmo di ricerca più semplice. Consiste nell'esaminare ogni elemento della collezione, uno dopo l'altro, fino a trovare quello cercato o fino a esaurire tutti gli elementi.

### Implementazione

```python
def ricerca_lineare(arr, elemento):
    """Cerca un elemento in un array utilizzando la ricerca lineare.
    
    Args:
        arr: L'array in cui cercare
        elemento: L'elemento da trovare
        
    Returns:
        L'indice dell'elemento se trovato, -1 altrimenti
    """
    for i in range(len(arr)):
        if arr[i] == elemento:
            return i  # Elemento trovato, restituisce l'indice
    
    return -1  # Elemento non trovato
```

### Analisi

- **Complessità temporale**:
  - Caso migliore: O(1) quando l'elemento è il primo
  - Caso medio: O(n)
  - Caso peggiore: O(n) quando l'elemento è l'ultimo o non è presente
- **Complessità spaziale**: O(1)

### Vantaggi e svantaggi

**Vantaggi**:
- Semplice da implementare
- Funziona su collezioni non ordinate
- Non richiede strutture dati aggiuntive
- Efficiente per piccole collezioni

**Svantaggi**:
- Inefficiente per grandi collezioni
- Non sfrutta eventuali proprietà della collezione (come l'ordinamento)

## Ricerca Binaria

La ricerca binaria è un algoritmo molto più efficiente della ricerca lineare, ma richiede che la collezione sia ordinata. Funziona dividendo ripetutamente a metà l'intervallo di ricerca e determinando in quale metà si trova l'elemento cercato.

### Implementazione

```python
def ricerca_binaria(arr, elemento):
    """Cerca un elemento in un array ordinato utilizzando la ricerca binaria.
    
    Args:
        arr: L'array ordinato in cui cercare
        elemento: L'elemento da trovare
        
    Returns:
        L'indice dell'elemento se trovato, -1 altrimenti
    """
    sinistra, destra = 0, len(arr) - 1
    
    while sinistra <= destra:
        medio = (sinistra + destra) // 2
        
        # Controlla se l'elemento è presente al centro
        if arr[medio] == elemento:
            return medio
        
        # Se l'elemento è più piccolo, ignora la metà destra
        elif arr[medio] > elemento:
            destra = medio - 1
        
        # Se l'elemento è più grande, ignora la metà sinistra
        else:
            sinistra = medio + 1
    
    # Elemento non trovato
    return -1
```

### Implementazione ricorsiva

```python
def ricerca_binaria_ricorsiva(arr, elemento, sinistra=0, destra=None):
    """Implementazione ricorsiva della ricerca binaria."""
    if destra is None:
        destra = len(arr) - 1
    
    # Caso base: elemento non trovato
    if sinistra > destra:
        return -1
    
    medio = (sinistra + destra) // 2
    
    # Elemento trovato
    if arr[medio] == elemento:
        return medio
    
    # Cerca nella metà sinistra
    elif arr[medio] > elemento:
        return ricerca_binaria_ricorsiva(arr, elemento, sinistra, medio - 1)
    
    # Cerca nella metà destra
    else:
        return ricerca_binaria_ricorsiva(arr, elemento, medio + 1, destra)
```

### Analisi

- **Complessità temporale**:
  - Caso migliore: O(1) quando l'elemento è al centro
  - Caso medio: O(log n)
  - Caso peggiore: O(log n)
- **Complessità spaziale**: 
  - O(1) per l'implementazione iterativa
  - O(log n) per l'implementazione ricorsiva (a causa dello stack delle chiamate)

### Vantaggi e svantaggi

**Vantaggi**:
- Molto efficiente per grandi collezioni
- Complessità logaritmica garantita

**Svantaggi**:
- Richiede che la collezione sia ordinata
- Non adatta per collezioni che cambiano frequentemente (poiché richiederebbe riordinamenti)

## Ricerca per Interpolazione

La ricerca per interpolazione è una variante della ricerca binaria che stima la posizione dell'elemento cercato in base al suo valore, assumendo una distribuzione uniforme dei valori.

### Implementazione

```python
def ricerca_interpolazione(arr, elemento):
    """Cerca un elemento in un array ordinato utilizzando la ricerca per interpolazione."""
    sinistra, destra = 0, len(arr) - 1
    
    while sinistra <= destra and arr[sinistra] <= elemento <= arr[destra]:
        # Formula di interpolazione per stimare la posizione
        if arr[destra] == arr[sinistra]:  # Evita divisione per zero
            pos = sinistra
        else:
            pos = sinistra + ((elemento - arr[sinistra]) * (destra - sinistra)) // (arr[destra] - arr[sinistra])
        
        # Elemento trovato
        if arr[pos] == elemento:
            return pos
        
        # Cerca a sinistra
        if arr[pos] > elemento:
            destra = pos - 1
        # Cerca a destra
        else:
            sinistra = pos + 1
    
    # Verifica se l'elemento è presente all'indice sinistra
    if sinistra <= destra and arr[sinistra] == elemento:
        return sinistra
    
    # Elemento non trovato
    return -1
```

### Analisi

- **Complessità temporale**:
  - Caso migliore: O(1)
  - Caso medio: O(log log n) per dati uniformemente distribuiti
  - Caso peggiore: O(n)
- **Complessità spaziale**: O(1)

### Vantaggi e svantaggi

**Vantaggi**:
- Più veloce della ricerca binaria per dati uniformemente distribuiti

**Svantaggi**:
- Prestazioni peggiori per dati non uniformemente distribuiti
- Più complessa da implementare
- Caso peggiore O(n)

## Ricerca Jump (o Ricerca a Salti)

La ricerca jump è un algoritmo che combina l'idea della ricerca lineare con quella della ricerca binaria. Consiste nel saltare in avanti di un numero fisso di passi e poi eseguire una ricerca lineare all'indietro.

### Implementazione

```python
import math

def ricerca_jump(arr, elemento):
    """Cerca un elemento in un array ordinato utilizzando la ricerca jump."""
    n = len(arr)
    # Dimensione ottimale del salto
    passo = int(math.sqrt(n))
    
    # Trova il blocco in cui potrebbe essere l'elemento
    prev = 0
    while arr[min(passo, n) - 1] < elemento:
        prev = passo
        passo += int(math.sqrt(n))
        if prev >= n:
            return -1
    
    # Ricerca lineare nel blocco
    while arr[prev] < elemento:
        prev += 1
        if prev == min(passo, n):
            return -1
    
    # Se l'elemento è trovato
    if arr[prev] == elemento:
        return prev
    
    return -1
```

### Analisi

- **Complessità temporale**: O(√n)
- **Complessità spaziale**: O(1)

### Vantaggi e svantaggi

**Vantaggi**:
- Più veloce della ricerca lineare
- Più semplice della ricerca binaria

**Svantaggi**:
- Meno efficiente della ricerca binaria per grandi collezioni
- Richiede che la collezione sia ordinata

## Ricerca Hash

La ricerca hash utilizza una funzione hash per mappare le chiavi a specifiche posizioni in una tabella hash, permettendo un accesso diretto agli elementi.

### Implementazione di una semplice tabella hash

```python
class TabellaHash:
    def __init__(self, dimensione=10):
        self.dimensione = dimensione
        self.tabella = [None] * dimensione
    
    def funzione_hash(self, chiave):
        """Converte una chiave in un indice della tabella."""
        return hash(chiave) % self.dimensione
    
    def inserisci(self, chiave, valore):
        """Inserisce una coppia chiave-valore nella tabella hash."""
        indice = self.funzione_hash(chiave)
        
        # Gestione delle collisioni con concatenamento
        if self.tabella[indice] is None:
            self.tabella[indice] = [(chiave, valore)]
        else:
            # Aggiorna il valore se la chiave esiste già
            for i, (k, v) in enumerate(self.tabella[indice]):
                if k == chiave:
                    self.tabella[indice][i] = (chiave, valore)
                    return
            # Altrimenti, aggiungi la nuova coppia
            self.tabella[indice].append((chiave, valore))
    
    def cerca(self, chiave):
        """Cerca un valore nella tabella hash usando la chiave."""
        indice = self.funzione_hash(chiave)
        
        if self.tabella[indice] is None:
            return None
        
        # Cerca nella lista di coppie all'indice calcolato
        for k, v in self.tabella[indice]:
            if k == chiave:
                return v
        
        return None
    
    def rimuovi(self, chiave):
        """Rimuove una coppia chiave-valore dalla tabella hash."""
        indice = self.funzione_hash(chiave)
        
        if self.tabella[indice] is None:
            return False
        
        # Cerca e rimuove la coppia con la chiave specificata
        for i, (k, v) in enumerate(self.tabella[indice]):
            if k == chiave:
                del self.tabella[indice][i]
                return True
        
        return False
```

### Esempio di utilizzo

```python
# Creazione di una tabella hash
tabella = TabellaHash(5)

# Inserimento di coppie chiave-valore
tabella.inserisci("nome", "Alice")
tabella.inserisci("età", 30)
tabella.inserisci("città", "Roma")

# Ricerca di valori
print(tabella.cerca("nome"))  # Output: Alice
print(tabella.cerca("età"))   # Output: 30
print(tabella.cerca("paese")) # Output: None

# Rimozione di una coppia
tabella.rimuovi("età")
print(tabella.cerca("età"))   # Output: None
```

### Analisi

- **Complessità temporale**:
  - Caso migliore: O(1) quando non ci sono collisioni
  - Caso medio: O(1) con una buona funzione hash
  - Caso peggiore: O(n) quando tutte le chiavi collidono
- **Complessità spaziale**: O(n)

### Vantaggi e svantaggi

**Vantaggi**:
- Accesso molto veloce (tempo costante) nel caso medio
- Non richiede che i dati siano ordinati

**Svantaggi**:
- Richiede spazio aggiuntivo per la tabella hash
- Le prestazioni dipendono dalla qualità della funzione hash
- Gestione delle collisioni può complicare l'implementazione

## Ricerca in Python

Python offre diversi modi integrati per cercare elementi nelle collezioni:

```python
# Ricerca in una lista
lista = [10, 20, 30, 40, 50]

# Verifica se un elemento è presente
if 30 in lista:
    print("Elemento trovato")

# Trova l'indice di un elemento
try:
    indice = lista.index(30)
    print(f"Elemento trovato all'indice {indice}")
except ValueError:
    print("Elemento non trovato")

# Ricerca in un dizionario
dizionario = {"nome": "Alice", "età": 30, "città": "Roma"}

# Verifica se una chiave è presente
if "nome" in dizionario:
    print(f"Valore: {dizionario['nome']}")

# Metodo get (restituisce None o un valore predefinito se la chiave non esiste)
valore = dizionario.get("paese", "Non specificato")
print(f"Paese: {valore}")

# Ricerca in un set
insieme = {10, 20, 30, 40, 50}

# Verifica se un elemento è presente (operazione O(1))
if 30 in insieme:
    print("Elemento trovato nel set")
```

## Confronto tra gli algoritmi di ricerca

| Algoritmo | Caso migliore | Caso medio | Caso peggiore | Spazio | Requisiti |
|-----------|--------------|------------|---------------|--------|------------|
| Ricerca Lineare | O(1) | O(n) | O(n) | O(1) | Nessuno |
| Ricerca Binaria | O(1) | O(log n) | O(log n) | O(1) | Collezione ordinata |
| Ricerca per Interpolazione | O(1) | O(log log n) | O(n) | O(1) | Collezione ordinata, distribuzione uniforme |
| Ricerca Jump | O(1) | O(√n) | O(√n) | O(1) | Collezione ordinata |
| Ricerca Hash | O(1) | O(1) | O(n) | O(n) | Funzione hash efficiente |

## Quando usare quale algoritmo

- **Ricerca Lineare**: quando la collezione è piccola, non ordinata, o quando si cerca un elemento una sola volta
- **Ricerca Binaria**: quando la collezione è ordinata e si effettuano molte ricerche
- **Ricerca per Interpolazione**: quando la collezione è ordinata e i valori sono uniformemente distribuiti
- **Ricerca Jump**: un compromesso tra ricerca lineare e binaria per collezioni ordinate di medie dimensioni
- **Ricerca Hash**: quando si ha bisogno di accessi molto veloci e si può permettere l'uso di memoria aggiuntiva

## Conclusione

Gli algoritmi di ricerca sono strumenti fondamentali nell'informatica e la scelta dell'algoritmo più adatto dipende dalle caratteristiche specifiche del problema: dimensione dei dati, frequenza delle ricerche, vincoli di memoria, ordinamento dei dati, ecc.

In Python, nella maggior parte dei casi pratici, è consigliabile utilizzare le strutture dati e i metodi integrati (`in`, `index`, dizionari, set) che sono già ottimizzati. Tuttavia, comprendere come funzionano i diversi algoritmi di ricerca è importante per sviluppare una solida conoscenza algoritmica e per affrontare problemi specifici.

## Esercizi

1. Implementa una versione della ricerca binaria che restituisca l'indice dell'elemento più grande che è minore o uguale all'elemento cercato (utile per l'interpolazione).

2. Modifica l'algoritmo di ricerca per interpolazione per gestire array con valori duplicati.

3. Implementa una versione della ricerca jump che utilizzi una dimensione del salto variabile in base alla dimensione dell'array.

4. Crea una tabella hash che utilizzi l'indirizzamento aperto invece del concatenamento per gestire le collisioni.

5. Confronta le prestazioni dei diversi algoritmi di ricerca su array di varie dimensioni e caratteristiche.

## Risorse aggiuntive

- [Visualizzazione degli algoritmi di ricerca](https://www.cs.usfca.edu/~galles/visualization/Search.html)
- [Documentazione Python: Dizionari](https://docs.python.org/3/tutorial/datastructures.html#dictionaries)
- [Articolo: "Understanding Binary Search"](https://www.geeksforgeeks.org/binary-search/)

## Navigazione

- [Indice della sezione](../README.md)
- [Guida precedente: Algoritmi di Ordinamento](02-algoritmi-ordinamento.md)
- [Prossima guida: Liste, Pile e Code](04-liste-pile-code.md)