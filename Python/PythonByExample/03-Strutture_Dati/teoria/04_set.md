# Set in Python

## Cos'è un set
In Python, un set è una struttura dati non ordinata, mutabile e che non ammette duplicati. I set sono utilizzati principalmente per testare l'appartenenza di elementi e per eliminare duplicati da una sequenza. Poiché i set sono implementati utilizzando tabelle hash (come i dizionari), le operazioni di ricerca, aggiunta e rimozione hanno una complessità temporale media di O(1).

## Creazione di set
I set in Python vengono creati utilizzando le parentesi graffe `{}` (come i dizionari, ma senza coppie chiave-valore) o la funzione `set()`.

```python
# Set vuoto (nota: {} crea un dizionario vuoto, non un set vuoto)
set_vuoto = set()

# Set con elementi
numeri = {1, 2, 3, 4, 5}

# Set di stringhe
frutta = {"mela", "banana", "arancia"}

# Set misto (contiene diversi tipi di dati)
misto = {1, "ciao", 3.14, True}

# Creazione di un set da un'altra sequenza
lista = [1, 2, 2, 3, 3, 3, 4, 5, 5]
set_da_lista = set(lista)  # Rimuove automaticamente i duplicati
print(set_da_lista)  # Output: {1, 2, 3, 4, 5}

set_da_stringa = set("Mississippi")
print(set_da_stringa)  # Output: {'M', 'i', 's', 'p'}
```

È importante notare che i set possono contenere solo elementi immutabili (hashable). Questo significa che non è possibile inserire liste o dizionari in un set, ma è possibile inserire tuple (purché contengano solo elementi immutabili).

```python
# Questo funziona
set_con_tuple = {(1, 2), (3, 4)}

# Questo genererà un errore
try:
    set_con_liste = {[1, 2], [3, 4]}
except TypeError as e:
    print(f"Errore: {e}")  # Output: Errore: unhashable type: 'list'
```

## Operazioni sui set
I set supportano varie operazioni, tra cui l'aggiunta e la rimozione di elementi, e operazioni matematiche come unione, intersezione e differenza.

### Aggiunta e rimozione di elementi

```python
frutta = {"mela", "banana", "arancia"}

# Aggiunta di un elemento
frutta.add("kiwi")
print(frutta)  # Output: {'mela', 'banana', 'arancia', 'kiwi'}

# Aggiunta di più elementi
frutta.update(["uva", "pera", "mela"])  # Nota: 'mela' è già presente, quindi non viene aggiunta di nuovo
print(frutta)  # Output: {'mela', 'banana', 'arancia', 'kiwi', 'uva', 'pera'}

# Rimozione di un elemento (genera un errore se l'elemento non esiste)
frutta.remove("banana")
print(frutta)  # Output: {'mela', 'arancia', 'kiwi', 'uva', 'pera'}

# Rimozione di un elemento (non genera errori se l'elemento non esiste)
frutta.discard("banana")  # Non fa nulla perché 'banana' è già stato rimosso
frutta.discard("ananas")  # Non fa nulla perché 'ananas' non è presente

# Rimozione e restituzione di un elemento arbitrario
elemento = frutta.pop()
print(elemento)  # Output: un elemento qualsiasi del set
print(frutta)  # Output: il set senza l'elemento rimosso

# Rimozione di tutti gli elementi
frutta.clear()
print(frutta)  # Output: set()
```

### Operazioni matematiche sui set

```python
A = {1, 2, 3, 4, 5}
B = {4, 5, 6, 7, 8}

# Unione: elementi che sono in A o in B (o in entrambi)
unione = A | B  # oppure A.union(B)
print(unione)  # Output: {1, 2, 3, 4, 5, 6, 7, 8}

# Intersezione: elementi che sono sia in A che in B
intersezione = A & B  # oppure A.intersection(B)
print(intersezione)  # Output: {4, 5}

# Differenza: elementi che sono in A ma non in B
differenza = A - B  # oppure A.difference(B)
print(differenza)  # Output: {1, 2, 3}

# Differenza simmetrica: elementi che sono in A o in B, ma non in entrambi
diff_simmetrica = A ^ B  # oppure A.symmetric_difference(B)
print(diff_simmetrica)  # Output: {1, 2, 3, 6, 7, 8}

# Verifica se un set è sottoinsieme di un altro
C = {1, 2}
print(C.issubset(A))  # Output: True (tutti gli elementi di C sono in A)
print(A.issubset(C))  # Output: False (non tutti gli elementi di A sono in C)

# Verifica se un set è sovrainsieme di un altro
print(A.issuperset(C))  # Output: True (A contiene tutti gli elementi di C)
print(C.issuperset(A))  # Output: False (C non contiene tutti gli elementi di A)

# Verifica se due set sono disgiunti (non hanno elementi in comune)
print(A.isdisjoint(B))  # Output: False (A e B hanno elementi in comune)
D = {10, 11, 12}
print(A.isdisjoint(D))  # Output: True (A e D non hanno elementi in comune)
```

## Operazioni in-place sui set
Oltre alle operazioni che restituiscono un nuovo set, Python fornisce anche metodi che modificano il set originale "in-place".

```python
A = {1, 2, 3, 4, 5}
B = {4, 5, 6, 7, 8}

# Unione in-place
A |= B  # oppure A.update(B)
print(A)  # Output: {1, 2, 3, 4, 5, 6, 7, 8}

# Reset di A per gli esempi successivi
A = {1, 2, 3, 4, 5}

# Intersezione in-place
A &= B  # oppure A.intersection_update(B)
print(A)  # Output: {4, 5}

# Reset di A per gli esempi successivi
A = {1, 2, 3, 4, 5}

# Differenza in-place
A -= B  # oppure A.difference_update(B)
print(A)  # Output: {1, 2, 3}

# Reset di A per gli esempi successivi
A = {1, 2, 3, 4, 5}

# Differenza simmetrica in-place
A ^= B  # oppure A.symmetric_difference_update(B)
print(A)  # Output: {1, 2, 3, 6, 7, 8}
```

## Iterazione sui set
Come per altre collezioni, è possibile iterare sugli elementi di un set. Tuttavia, poiché i set non sono ordinati, l'ordine degli elementi durante l'iterazione non è garantito.

```python
frutta = {"mela", "banana", "arancia", "kiwi"}

# Iterazione semplice
print("Elementi del set:")
for elemento in frutta:
    print(elemento)

# Nota: l'ordine degli elementi potrebbe variare ad ogni esecuzione
```

## Comprensione di set
Come per le liste e i dizionari, Python supporta anche la comprensione di set, che permette di creare set in modo conciso.

```python
# Comprensione di set
quadrati = {x**2 for x in range(10)}
print(quadrati)  # Output: {0, 1, 4, 9, 16, 25, 36, 49, 64, 81}

# Comprensione di set con condizione
pari = {x for x in range(20) if x % 2 == 0}
print(pari)  # Output: {0, 2, 4, 6, 8, 10, 12, 14, 16, 18}

# Esempio più complesso
parole = ["hello", "world", "python", "programming", "set", "comprehension"]
vocali_uniche = {vocale for parola in parole for vocale in parola if vocale.lower() in "aeiou"}
print(vocali_uniche)  # Output: {'e', 'o', 'a', 'i'}
```

## Frozen Set
Python fornisce anche una variante immutabile dei set chiamata `frozenset`. Un frozen set ha gli stessi metodi di un set normale, tranne quelli che modificano il set (come `add()`, `remove()`, ecc.).

```python
# Creazione di un frozen set
fs = frozenset([1, 2, 3, 4, 5])
print(fs)  # Output: frozenset({1, 2, 3, 4, 5})

# Operazioni supportate
fs2 = frozenset([4, 5, 6, 7, 8])
unione = fs | fs2
print(unione)  # Output: frozenset({1, 2, 3, 4, 5, 6, 7, 8})

# Operazioni non supportate
try:
    fs.add(6)  # Genererà un errore
except AttributeError as e:
    print(f"Errore: {e}")  # Output: Errore: 'frozenset' object has no attribute 'add'
```

I frozen set sono hashable, quindi possono essere utilizzati come chiavi nei dizionari o come elementi in altri set.

```python
# Utilizzo di frozen set come chiavi in un dizionario
fs1 = frozenset([1, 2, 3])
fs2 = frozenset([4, 5, 6])
dizionario = {fs1: "primo set", fs2: "secondo set"}
print(dizionario[fs1])  # Output: "primo set"

# Utilizzo di frozen set come elementi in un set
set_di_frozenset = {fs1, fs2}
print(set_di_frozenset)  # Output: {frozenset({1, 2, 3}), frozenset({4, 5, 6})}
```

## Casi d'uso comuni per i set

### Rimozione di duplicati
Uno degli usi più comuni dei set è la rimozione di duplicati da una sequenza.

```python
# Rimozione di duplicati da una lista
lista_con_duplicati = [1, 2, 2, 3, 3, 3, 4, 5, 5]
lista_senza_duplicati = list(set(lista_con_duplicati))
print(lista_senza_duplicati)  # Output: [1, 2, 3, 4, 5]
# Nota: l'ordine degli elementi potrebbe non essere preservato

# Per preservare l'ordine (Python 3.7+)
from collections import dict
lista_senza_duplicati_ordinata = list(dict.fromkeys(lista_con_duplicati))
print(lista_senza_duplicati_ordinata)  # Output: [1, 2, 3, 4, 5] (nell'ordine originale)
```

### Verifica dell'appartenenza
I set sono molto efficienti per verificare se un elemento è presente in una collezione.

```python
# Verifica dell'appartenenza in un set vs in una lista
lista_grande = list(range(10000))
set_grande = set(lista_grande)

import timeit

# Tempo per verificare l'appartenenza in una lista
tempo_lista = timeit.timeit(lambda: 9999 in lista_grande, number=1000)

# Tempo per verificare l'appartenenza in un set
tempo_set = timeit.timeit(lambda: 9999 in set_grande, number=1000)

print(f"Tempo per la lista: {tempo_lista:.6f} secondi")
print(f"Tempo per il set: {tempo_set:.6f} secondi")
# Il set sarà significativamente più veloce
```

### Operazioni su insiemi
I set sono ideali per eseguire operazioni matematiche su insiemi, come trovare elementi comuni o unici tra diverse collezioni.

```python
# Esempio: Trovare parole comuni tra due testi
testo1 = "il gatto sul tetto il tetto è caldo il gatto è nero"
testo2 = "il cane sotto il portico il portico è fresco il cane è bianco"

parole1 = set(testo1.split())
parole2 = set(testo2.split())

# Parole comuni
parole_comuni = parole1 & parole2
print(parole_comuni)  # Output: {'il', 'è'}

# Parole uniche nel primo testo
parole_uniche_testo1 = parole1 - parole2
print(parole_uniche_testo1)  # Output: {'gatto', 'sul', 'tetto', 'caldo', 'nero'}

# Parole uniche nel secondo testo
parole_uniche_testo2 = parole2 - parole1
print(parole_uniche_testo2)  # Output: {'cane', 'sotto', 'portico', 'fresco', 'bianco'}

# Tutte le parole uniche (in uno o nell'altro testo, ma non in entrambi)
parole_uniche = parole1 ^ parole2
print(parole_uniche)  # Output: {'gatto', 'sul', 'tetto', 'caldo', 'nero', 'cane', 'sotto', 'portico', 'fresco', 'bianco'}
```

## Set vs Liste vs Dizionari
Ecco un confronto tra set, liste e dizionari per aiutare a scegliere la struttura dati più appropriata per un determinato caso d'uso:

1. **Set**:
   - Non ordinati (fino a Python 3.6, da Python 3.7 mantengono l'ordine di inserimento, ma non è garantito)
   - Non ammettono duplicati
   - Efficienti per verificare l'appartenenza (O(1) in media)
   - Supportano operazioni matematiche su insiemi (unione, intersezione, ecc.)
   - Non supportano l'indicizzazione
   - Possono contenere solo elementi immutabili (hashable)

2. **Liste**:
   - Ordinate (mantengono l'ordine di inserimento)
   - Ammettono duplicati
   - Meno efficienti per verificare l'appartenenza (O(n))
   - Supportano l'indicizzazione e lo slicing
   - Possono contenere qualsiasi tipo di elemento

3. **Dizionari**:
   - Coppie chiave-valore
   - Non ammettono chiavi duplicate (le chiavi devono essere uniche)
   - Efficienti per accedere ai valori tramite chiave (O(1) in media)
   - Da Python 3.7, mantengono l'ordine di inserimento
   - Le chiavi devono essere immutabili (hashable)

```python
# Esempio di scelta della struttura dati appropriata

# Caso d'uso: Conteggio delle occorrenze di parole in un testo
testo = "il gatto sul tetto il tetto è caldo il gatto è nero"
parole = testo.split()

# Utilizzo di un set per ottenere le parole uniche
parole_uniche = set(parole)
print(f"Parole uniche: {parole_uniche}")
# Output: Parole uniche: {'il', 'gatto', 'sul', 'tetto', 'è', 'caldo', 'nero'}

# Utilizzo di un dizionario per contare le occorrenze
conteggio = {}
for parola in parole:
    conteggio[parola] = conteggio.get(parola, 0) + 1
print(f"Conteggio: {conteggio}")
# Output: Conteggio: {'il': 3, 'gatto': 2, 'sul': 1, 'tetto': 2, 'è': 2, 'caldo': 1, 'nero': 1}

# Utilizzo di una lista per mantenere l'ordine originale
print(f"Ordine originale: {parole}")
# Output: Ordine originale: ['il', 'gatto', 'sul', 'tetto', 'il', 'tetto', 'è', 'caldo', 'il', 'gatto', 'è', 'nero']
```

## Conclusione
I set sono una struttura dati potente e flessibile in Python, particolarmente utili quando si ha bisogno di lavorare con collezioni di elementi unici o eseguire operazioni matematiche su insiemi. La loro efficienza nelle operazioni di ricerca e la capacità di eliminare duplicati li rendono uno strumento indispensabile in molti scenari di programmazione.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Dizionari](./03_dizionari.md) | [Prossimo: Comprensioni](./05_comprensioni.md)