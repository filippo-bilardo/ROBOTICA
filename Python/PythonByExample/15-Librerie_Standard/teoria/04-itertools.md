# Itertools: Strumenti per Iterazioni

## Introduzione

Il modulo `itertools` è una gemma nascosta nella Libreria Standard di Python che fornisce una collezione di strumenti per lavorare con iteratori in modo efficiente. Questi strumenti sono ispirati ai costrutti di programmazione funzionale e permettono di creare e manipolare iteratori in modi potenti ed espressivi.

Gli iteratori sono oggetti che implementano il protocollo di iterazione, permettendo di accedere sequenzialmente agli elementi di una collezione senza caricare l'intera collezione in memoria. Questo li rende particolarmente utili quando si lavora con grandi quantità di dati o con sequenze infinite.

In questa guida, esploreremo le principali funzioni offerte dal modulo `itertools` e vedremo come utilizzarle per risolvere problemi comuni in modo elegante ed efficiente.

## Categorie di Funzioni in itertools

Le funzioni del modulo `itertools` possono essere suddivise in tre categorie principali:

1. **Iteratori Infiniti**: Funzioni che generano sequenze infinite di valori.
2. **Iteratori di Terminazione**: Funzioni che operano su sequenze finite.
3. **Iteratori Combinatori**: Funzioni che generano permutazioni, combinazioni e prodotti cartesiani.

## Iteratori Infiniti

### `count(start=0, step=1)`

Genera una sequenza infinita di numeri, partendo da `start` e incrementando di `step` ad ogni passo.

```python
import itertools

# Generare una sequenza di numeri a partire da 10, incrementando di 2
contatore = itertools.count(10, 2)

# Stampare i primi 5 numeri
for _ in range(5):
    print(next(contatore), end=' ')  # 10 12 14 16 18

print()

# Utilizzare count con zip per numerare una sequenza
nomi = ['Alice', 'Bob', 'Charlie']
for numero, nome in zip(itertools.count(1), nomi):
    print(f"{numero}. {nome}")
```

### `cycle(iterable)`

Ripete ciclicamente gli elementi di un iterabile all'infinito.

```python
import itertools

# Creare un ciclo di colori
colori = itertools.cycle(['rosso', 'verde', 'blu'])

# Stampare i primi 7 colori (il ciclo si ripete)
for _ in range(7):
    print(next(colori), end=' ')  # rosso verde blu rosso verde blu rosso

print()

# Utilizzare cycle per alternare stati
stati = itertools.cycle(['attivo', 'inattivo'])
for i in range(5):
    print(f"Elemento {i}: {next(stati)}")
```

### `repeat(elem, n=None)`

Ripete un elemento `n` volte, o all'infinito se `n` non è specificato.

```python
import itertools

# Ripetere un elemento un numero specifico di volte
ripetizioni = itertools.repeat('A', 5)
print(list(ripetizioni))  # ['A', 'A', 'A', 'A', 'A']

# Utilizzare repeat con map per moltiplicare una sequenza di numeri
numeri = [1, 2, 3, 4, 5]
raddoppiati = list(map(lambda x, y: x * y, numeri, itertools.repeat(2)))
print(raddoppiati)  # [2, 4, 6, 8, 10]
```

## Iteratori di Terminazione

### `accumulate(iterable[, func, *, initial=None])`

Genera una sequenza di accumuli, applicando una funzione (di default la somma) agli elementi dell'iterabile.

```python
import itertools
import operator

# Calcolare la somma cumulativa
numeri = [1, 2, 3, 4, 5]
somme_cumulative = itertools.accumulate(numeri)
print(list(somme_cumulative))  # [1, 3, 6, 10, 15]

# Calcolare il prodotto cumulativo
prodotti_cumulativi = itertools.accumulate(numeri, operator.mul)
print(list(prodotti_cumulativi))  # [1, 2, 6, 24, 120]

# Utilizzare un valore iniziale
somme_con_iniziale = itertools.accumulate(numeri, initial=100)
print(list(somme_con_iniziale))  # [100, 101, 103, 106, 110, 115]

# Trovare il massimo cumulativo
punteggi = [10, 5, 20, 15, 30, 25]
massimi_cumulativi = itertools.accumulate(punteggi, max)
print(list(massimi_cumulativi))  # [10, 10, 20, 20, 30, 30]
```

### `chain(*iterables)`

Combina più iterabili in un unico iteratore sequenziale.

```python
import itertools

# Concatenare più liste
lista1 = [1, 2, 3]
lista2 = ['a', 'b', 'c']
lista3 = [True, False]

concatenata = itertools.chain(lista1, lista2, lista3)
print(list(concatenata))  # [1, 2, 3, 'a', 'b', 'c', True, False]

# Utilizzare chain.from_iterable con una lista di iterabili
liste = [[1, 2, 3], ['a', 'b', 'c'], [True, False]]
concatenata2 = itertools.chain.from_iterable(liste)
print(list(concatenata2))  # [1, 2, 3, 'a', 'b', 'c', True, False]
```

### `compress(data, selectors)`

Filtra gli elementi di `data` in base ai valori booleani corrispondenti in `selectors`.

```python
import itertools

# Filtrare elementi in base a selettori booleani
dati = ['A', 'B', 'C', 'D', 'E']
selettori = [True, False, True, False, True]

filtrati = itertools.compress(dati, selettori)
print(list(filtrati))  # ['A', 'C', 'E']

# Utilizzare compress per filtrare in base a una condizione
numeri = [10, 25, 3, 42, 8, 15]
maggiori_di_10 = [n > 10 for n in numeri]
filtrati = itertools.compress(numeri, maggiori_di_10)
print(list(filtrati))  # [25, 42, 15]
```

### `dropwhile(pred, seq)` e `takewhile(pred, seq)`

`dropwhile` salta gli elementi iniziali di una sequenza finché il predicato è vero, poi restituisce il resto.
`takewhile` restituisce gli elementi iniziali di una sequenza finché il predicato è vero, poi si ferma.

```python
import itertools

# Esempio di dropwhile
numeri = [1, 3, 5, 2, 4, 6, 7, 9, 11]

# Salta i numeri dispari all'inizio, poi restituisce il resto
risultato = itertools.dropwhile(lambda x: x % 2 == 1, numeri)
print(list(risultato))  # [2, 4, 6, 7, 9, 11]

# Esempio di takewhile
# Prende i numeri dispari all'inizio, poi si ferma
risultato = itertools.takewhile(lambda x: x % 2 == 1, numeri)
print(list(risultato))  # [1, 3, 5]
```

### `filterfalse(pred, seq)`

Restituisce gli elementi di `seq` per cui `pred` è falso.

```python
import itertools

# Filtrare i numeri pari (restituisce i dispari)
numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
filtrati = itertools.filterfalse(lambda x: x % 2 == 0, numeri)
print(list(filtrati))  # [1, 3, 5, 7, 9]

# Filtrare i valori vuoti o falsi
valori = [0, 1, '', 'hello', [], [1, 2], None, True, False]
filtrati = itertools.filterfalse(bool, valori)
print(list(filtrati))  # [0, '', [], None, False]
```

### `groupby(iterable, key=None)`

Raggruppare elementi consecutivi di un iterabile in base a una chiave.

```python
import itertools

# Raggruppare parole per lunghezza
parole = ['cane', 'gatto', 'topo', 'elefante', 'ape', 'giraffa', 'zebra']

# Ordina prima le parole per lunghezza (groupby funziona solo su elementi consecutivi)
parole_ordinate = sorted(parole, key=len)

# Raggruppa per lunghezza
for lunghezza, gruppo in itertools.groupby(parole_ordinate, key=len):
    print(f"Parole di lunghezza {lunghezza}:")
    for parola in gruppo:
        print(f"  {parola}")

# Raggruppare numeri per parità
numeri = [1, 2, 2, 3, 4, 4, 5, 6, 7, 8, 9]
for parita, gruppo in itertools.groupby(numeri, key=lambda x: x % 2 == 0):
    print(f"{'Pari' if parita else 'Dispari'}: {list(gruppo)}")
```

### `islice(seq, start, stop, step=1)`

Restituisce un iteratore che restituisce elementi selezionati da `seq`.

```python
import itertools

# Creare una sequenza di numeri
numeri = range(10)  # 0, 1, 2, 3, 4, 5, 6, 7, 8, 9

# Selezionare elementi con indici da 2 a 8 con passo 2
selezionati = itertools.islice(numeri, 2, 8, 2)
print(list(selezionati))  # [2, 4, 6]

# Selezionare i primi 3 elementi
primi_tre = itertools.islice(numeri, 3)
print(list(primi_tre))  # [0, 1, 2]

# Utilizzare islice con un iteratore infinito
contatore = itertools.count(1)
primi_cinque = itertools.islice(contatore, 5)
print(list(primi_cinque))  # [1, 2, 3, 4, 5]
```

### `starmap(func, seq)`

Applica `func` agli elementi di `seq`, spacchettando ogni elemento come argomenti.

```python
import itertools

# Calcolare potenze
base_esponente = [(2, 3), (3, 2), (4, 2), (5, 1)]
potenze = itertools.starmap(pow, base_esponente)
print(list(potenze))  # [8, 9, 16, 5]

# Formattare stringhe
formati = [('Prodotto: {}', 'Mela'), ('Prezzo: {} €', 10), ('Quantità: {}', 5)]
stringhe_formattate = itertools.starmap(str.format, formati)
print(list(stringhe_formattate))  # ['Prodotto: Mela', 'Prezzo: 10 €', 'Quantità: 5']
```

### `tee(iterable, n=2)`

Crea `n` iteratori indipendenti dallo stesso iterabile.

```python
import itertools

# Creare 3 iteratori indipendenti
numeri = [1, 2, 3, 4, 5]
it1, it2, it3 = itertools.tee(numeri, 3)

# Utilizzare il primo iteratore
print(list(it1))  # [1, 2, 3, 4, 5]

# Il secondo iteratore è ancora intatto
print(next(it2))  # 1
print(next(it2))  # 2

# Anche il terzo iteratore è indipendente
print(list(it3))  # [1, 2, 3, 4, 5]

# Il secondo iteratore continua da dove era rimasto
print(list(it2))  # [3, 4, 5]
```

### `zip_longest(*iterables, fillvalue=None)`

Come `zip`, ma continua fino all'esaurimento dell'iterabile più lungo, riempiendo i valori mancanti con `fillvalue`.

```python
import itertools

# Zip di liste di lunghezza diversa
numeri = [1, 2, 3]
lettere = ['a', 'b', 'c', 'd', 'e']

# Zip standard si ferma all'iterabile più corto
print(list(zip(numeri, lettere)))  # [(1, 'a'), (2, 'b'), (3, 'c')]

# zip_longest continua fino all'iterabile più lungo
zip_lungo = itertools.zip_longest(numeri, lettere, fillvalue='N/A')
print(list(zip_lungo))  # [(1, 'a'), (2, 'b'), (3, 'c'), ('N/A', 'd'), ('N/A', 'e')]
```

## Iteratori Combinatori

### `product(*iterables, repeat=1)`

Calcola il prodotto cartesiano degli iterabili di input.

```python
import itertools

# Prodotto cartesiano di due liste
colori = ['rosso', 'verde']
taglie = ['S', 'M', 'L']

prodotto = itertools.product(colori, taglie)
print(list(prodotto))
# [('rosso', 'S'), ('rosso', 'M'), ('rosso', 'L'), ('verde', 'S'), ('verde', 'M'), ('verde', 'L')]

# Prodotto cartesiano con repeat
carte = ['A', 'K', 'Q']
coppie = itertools.product(carte, repeat=2)
print(list(coppie))
# [('A', 'A'), ('A', 'K'), ('A', 'Q'), ('K', 'A'), ('K', 'K'), ('K', 'Q'), ('Q', 'A'), ('Q', 'K'), ('Q', 'Q')]
```

### `permutations(iterable, r=None)`

Genera tutte le permutazioni di lunghezza `r` degli elementi dell'iterabile.

```python
import itertools

# Permutazioni di una lista
frutta = ['mela', 'banana', 'arancia']

# Tutte le permutazioni (r=3 implicito)
perm = itertools.permutations(frutta)
print(f"Numero di permutazioni: {len(list(perm))}")  # 6

# Permutazioni di lunghezza 2
perm2 = itertools.permutations(frutta, 2)
print(list(perm2))
# [('mela', 'banana'), ('mela', 'arancia'), ('banana', 'mela'), ('banana', 'arancia'), ('arancia', 'mela'), ('arancia', 'banana')]

# Permutazioni di una stringa
parola = 'ABC'
perm_lettere = itertools.permutations(parola)
print([''.join(p) for p in perm_lettere])  # ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA']
```

### `combinations(iterable, r)`

Genera tutte le combinazioni di lunghezza `r` degli elementi dell'iterabile.

```python
import itertools

# Combinazioni di una lista
numeri = [1, 2, 3, 4, 5]

# Combinazioni di 3 elementi
comb = itertools.combinations(numeri, 3)
print(list(comb))
# [(1, 2, 3), (1, 2, 4), (1, 2, 5), (1, 3, 4), (1, 3, 5), (1, 4, 5), (2, 3, 4), (2, 3, 5), (2, 4, 5), (3, 4, 5)]

# Combinazioni di 2 elementi
comb2 = itertools.combinations(numeri, 2)
print(list(comb2))
# [(1, 2), (1, 3), (1, 4), (1, 5), (2, 3), (2, 4), (2, 5), (3, 4), (3, 5), (4, 5)]

# Utilizzare combinations per trovare tutte le possibili coppie di una squadra
giocatori = ['Alice', 'Bob', 'Charlie', 'David']
coppie = itertools.combinations(giocatori, 2)
print(list(coppie))
# [('Alice', 'Bob'), ('Alice', 'Charlie'), ('Alice', 'David'), ('Bob', 'Charlie'), ('Bob', 'David'), ('Charlie', 'David')]
```

### `combinations_with_replacement(iterable, r)`

Genera tutte le combinazioni di lunghezza `r` degli elementi dell'iterabile, permettendo la ripetizione degli elementi.

```python
import itertools

# Combinazioni con ripetizione
numeri = [1, 2, 3]

# Combinazioni di 2 elementi con ripetizione
comb_r = itertools.combinations_with_replacement(numeri, 2)
print(list(comb_r))
# [(1, 1), (1, 2), (1, 3), (2, 2), (2, 3), (3, 3)]

# Utilizzare combinations_with_replacement per generare tutte le possibili coppie di dadi
dado = [1, 2, 3, 4, 5, 6]
lanci = itertools.combinations_with_replacement(dado, 2)
print(list(lanci))
# [(1, 1), (1, 2), ..., (5, 6), (6, 6)]
```

## Ricette e Pattern Comuni

Il modulo `itertools` include anche una sezione di "ricette" nella sua documentazione, che mostra come implementare funzioni utili utilizzando le funzioni di base del modulo. Ecco alcune di queste ricette:

### `pairwise(iterable)`

Restituisce coppie consecutive di elementi da un iterabile.

```python
def pairwise(iterable):
    "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    a, b = itertools.tee(iterable)
    next(b, None)
    return zip(a, b)

# Esempio di utilizzo
numeri = [1, 2, 3, 4, 5]
for coppia in pairwise(numeri):
    print(coppia)
# (1, 2)
# (2, 3)
# (3, 4)
# (4, 5)
```

### `partition(pred, iterable)`

Divide un iterabile in due parti in base a un predicato.

```python
def partition(pred, iterable):
    "Divide un iterabile in due parti in base a un predicato"
    t1, t2 = itertools.tee(iterable)
    return itertools.filterfalse(pred, t1), filter(pred, t2)

# Esempio di utilizzo
numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
dispari, pari = partition(lambda x: x % 2 == 0, numeri)
print(f"Dispari: {list(dispari)}")
print(f"Pari: {list(pari)}")
# Dispari: [1, 3, 5, 7, 9]
# Pari: [2, 4, 6, 8, 10]
```

### `powerset(iterable)`

Genera tutti i possibili sottoinsiemi di un insieme.

```python
def powerset(iterable):
    "powerset([1,2,3]) --> () (1,) (2,) (3,) (1,2) (1,3) (2,3) (1,2,3)"
    s = list(iterable)
    return itertools.chain.from_iterable(itertools.combinations(s, r) for r in range(len(s)+1))

# Esempio di utilizzo
insieme = [1, 2, 3]
for sottoinsieme in powerset(insieme):
    print(sottoinsieme)
# ()
# (1,)
# (2,)
# (3,)
# (1, 2)
# (1, 3)
# (2, 3)
# (1, 2, 3)
```

### `unique_everseen(iterable, key=None)`

Restituisce elementi unici da un iterabile, preservando l'ordine.

```python
def unique_everseen(iterable, key=None):
    "List unique elements, preserving order. Remember all elements ever seen."
    seen = set()
    seen_add = seen.add
    if key is None:
        for element in itertools.filterfalse(seen.__contains__, iterable):
            seen_add(element)
            yield element
    else:
        for element in iterable:
            k = key(element)
            if k not in seen:
                seen_add(k)
                yield element

# Esempio di utilizzo
sequenza = [1, 2, 3, 1, 2, 4, 5, 3, 6]
print(list(unique_everseen(sequenza)))  # [1, 2, 3, 4, 5, 6]

# Con una funzione chiave
persone = [{'id': 1, 'nome': 'Alice'}, {'id': 2, 'nome': 'Bob'}, {'id': 1, 'nome': 'Alice (duplicato)'}]
uniche = unique_everseen(persone, key=lambda x: x['id'])
print(list(uniche))  # [{'id': 1, 'nome': 'Alice'}, {'id': 2, 'nome': 'Bob'}]
```

## Casi d'Uso Pratici

### Generazione di Sequenze

```python
import itertools

# Generare una sequenza di Fibonacci
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

# Prendere i primi 10 numeri di Fibonacci
fib10 = itertools.islice(fibonacci(), 10)
print(list(fib10))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# Generare una sequenza di date
from datetime import datetime, timedelta

def date_range(start_date, end_date):
    current = start_date
    while current <= end_date:
        yield current
        current += timedelta(days=1)

start = datetime(2023, 1, 1)
end = datetime(2023, 1, 10)
date_seq = date_range(start, end)
for data in date_seq:
    print(data.strftime('%Y-%m-%d'))
```

### Elaborazione di File

```python
import itertools

# Leggere un file a blocchi
def read_in_chunks(file_object, chunk_size=1024):
    while True:
        data = file_object.read(chunk_size)
        if not data:
            break
        yield data

# Esempio di utilizzo (simulato)
chunks = ['Riga 1\n', 'Riga 2\n', 'Riga 3\n', 'Riga 4\n']

# Elaborare le righe a gruppi di 2
for gruppo in itertools.zip_longest(*[iter(chunks)] * 2, fillvalue=''):
    print(f"Elaborazione del gruppo: {gruppo}")

# Contare le righe in un file (simulato)
linee = ['Riga 1\n', 'Riga 2\n', 'Riga 3\n', 'Riga 4\n', 'Riga 5\n']
num_linee = sum(1 for _ in linee)
print(f"Numero di righe: {num_linee}")
```

### Analisi di Dati

```python
import itertools

# Dati di esempio: vendite per prodotto e mese
vendite = [
    {'prodotto': 'A', 'mese': 'Gen', 'quantita': 100},
    {'prodotto': 'B', 'mese': 'Gen', 'quantita': 150},
    {'prodotto': 'A', 'mese': 'Feb', 'quantita': 120},
    {'prodotto': 'B', 'mese': 'Feb', 'quantita': 140},
    {'prodotto': 'A', 'mese': 'Mar', 'quantita': 110},
    {'prodotto': 'B', 'mese': 'Mar', 'quantita': 160}
]

# Raggruppare per prodotto e calcolare il totale delle vendite
vendite_ordinate = sorted(vendite, key=lambda x: x['prodotto'])
for prodotto, gruppo in itertools.groupby(vendite_ordinate, key=lambda x: x['prodotto']):
    totale = sum(item['quantita'] for item in gruppo)
    print(f"Prodotto {prodotto}: {totale} unità vendute")

# Calcolare la media mobile delle vendite
vendite_A = [item['quantita'] for item in vendite if item['prodotto'] == 'A']
finestra_mobile = 2
for i in range(len(vendite_A) - finestra_mobile + 1):
    finestra = vendite_A[i:i+finestra_mobile]
    media = sum(finestra) / len(finestra)
    print(f"Media mobile per finestra {i+1}-{i+finestra_mobile}: {media}")
```

## Conclusione

Il modulo `itertools` è uno strumento potente per lavorare con iteratori in Python. Offre funzioni che permettono di generare, combinare, filtrare e manipolare sequenze in modi efficienti ed espressivi.

L'utilizzo di iteratori e delle funzioni di `itertools` può portare a codice più pulito, più efficiente in termini di memoria e spesso più veloce. Inoltre, il paradigma di programmazione funzionale promosso da `itertools` incoraggia uno stile di programmazione più dichiarativo e componibile.

Per approfondire, consulta la [documentazione ufficiale di itertools](https://docs.python.org/3/library/itertools.html), che include anche una sezione di ricette con implementazioni di funzioni utili basate su `itertools`.

## Esercizi

1. Scrivi una funzione che utilizzi `itertools.product` per generare tutte le possibili combinazioni di lancio di `n` dadi a 6 facce.

2. Implementa una funzione `sliding_window(seq, n)` che restituisca finestre scorrevoli di lunghezza `n` da una sequenza, utilizzando le funzioni di `itertools`.

3. Utilizza `itertools.groupby` per raggruppare una lista di parole per la loro lettera iniziale e conta quante parole iniziano con ciascuna lettera.

4. Scrivi una funzione che utilizzi `itertools.combinations` per trovare tutte le possibili sottoliste di una lista data che hanno una somma specificata.

5. Implementa una funzione `round_robin(*iterables)` che alterni elementi da più iterabili fino all'esaurimento di tutti, utilizzando le funzioni di `itertools`.