# Iteratori e Generatori

Gli iteratori e i generatori sono strumenti potenti in Python che consentono di lavorare con sequenze di dati in modo efficiente, specialmente quando si tratta di grandi quantità di dati o di sequenze potenzialmente infinite.

## Iteratori

Un iteratore in Python è un oggetto che implementa il protocollo di iterazione, che consiste in due metodi speciali:

- `__iter__()`: Restituisce l'oggetto iteratore stesso
- `__next__()`: Restituisce il prossimo elemento della sequenza o solleva l'eccezione `StopIteration` quando non ci sono più elementi

### Il protocollo di iterazione

Quando usiamo un ciclo `for` in Python, dietro le quinte viene utilizzato il protocollo di iterazione:

```python
# Questo ciclo for
for elemento in iterabile:
    print(elemento)

# È equivalente a questo codice
iteratore = iter(iterabile)  # Chiama __iter__() sull'iterabile
try:
    while True:
        elemento = next(iteratore)  # Chiama __next__() sull'iteratore
        print(elemento)
except StopIteration:
    pass  # Fine dell'iterazione
```

### Creazione di un iteratore personalizzato

Ecco un esempio di implementazione di un iteratore personalizzato che genera i primi `n` numeri della sequenza di Fibonacci:

```python
class FibonacciIterator:
    def __init__(self, n):
        self.n = n  # Numero di elementi da generare
        self.count = 0  # Contatore corrente
        self.a, self.b = 0, 1  # Primi due numeri della sequenza
    
    def __iter__(self):
        return self
    
    def __next__(self):
        if self.count >= self.n:
            raise StopIteration
        
        if self.count == 0:
            self.count += 1
            return self.a
        elif self.count == 1:
            self.count += 1
            return self.b
        else:
            result = self.a + self.b
            self.a, self.b = self.b, result
            self.count += 1
            return result

# Utilizzo dell'iteratore
fib = FibonacciIterator(8)
for numero in fib:
    print(numero, end=" ")
# Output: 0 1 1 2 3 5 8 13
```

### Vantaggi degli iteratori

1. **Efficienza di memoria**: Gli iteratori calcolano i valori al volo, senza dover memorizzare l'intera sequenza
2. **Lazy evaluation**: I valori vengono calcolati solo quando necessario
3. **Possibilità di lavorare con sequenze infinite**: Poiché i valori vengono generati uno alla volta, è possibile rappresentare sequenze potenzialmente infinite

## Generatori

I generatori sono un tipo speciale di iteratori che possono essere creati utilizzando funzioni con l'istruzione `yield`. Sono un modo più semplice e conciso per creare iteratori.

### Funzioni generatore

Una funzione generatore è una funzione normale che utilizza l'istruzione `yield` invece di `return` per restituire valori. Quando viene chiamata, restituisce un oggetto generatore che può essere iterato.

```python
def contatore(max):
    n = 0
    while n < max:
        yield n
        n += 1

# Utilizzo del generatore
for i in contatore(5):
    print(i, end=" ")
# Output: 0 1 2 3 4
```

Quando una funzione generatore viene chiamata, il corpo della funzione non viene eseguito immediatamente. Invece, viene restituito un oggetto generatore. Ogni volta che viene chiamato `next()` sull'oggetto generatore, la funzione viene eseguita fino all'istruzione `yield`, che restituisce un valore. Lo stato della funzione viene salvato, e la prossima volta che viene chiamato `next()`, l'esecuzione riprende da dove era stata interrotta.

### Esempio: Generatore Fibonacci

Ecco lo stesso esempio della sequenza di Fibonacci implementato come generatore:

```python
def fibonacci(n):
    a, b = 0, 1
    count = 0
    while count < n:
        yield a
        a, b = b, a + b
        count += 1

# Utilizzo del generatore
for numero in fibonacci(8):
    print(numero, end=" ")
# Output: 0 1 1 2 3 5 8 13
```

Notare quanto sia più conciso e leggibile rispetto all'implementazione con la classe iteratore.

### Espressioni generatore

Così come le comprensioni di lista permettono di creare liste in modo conciso, le espressioni generatore permettono di creare generatori in modo conciso. La sintassi è simile alle comprensioni di lista, ma utilizza parentesi tonde invece di quadre:

```python
# Comprensione di lista (crea una lista in memoria)
quadrati_lista = [x**2 for x in range(1000000)]

# Espressione generatore (crea un generatore)
quadrati_gen = (x**2 for x in range(1000000))

# La lista occupa molta memoria
import sys
print(f"Dimensione lista: {sys.getsizeof(quadrati_lista)} bytes")
# Output: Dimensione lista: 8448728 bytes (o simile)

# Il generatore occupa pochissima memoria
print(f"Dimensione generatore: {sys.getsizeof(quadrati_gen)} bytes")
# Output: Dimensione generatore: 112 bytes (o simile)
```

### Generatori infiniti

I generatori possono rappresentare sequenze potenzialmente infinite, poiché generano i valori uno alla volta:

```python
def numeri_primi():
    """Generatore che produce numeri primi all'infinito"""
    # Inizia con 2, il primo numero primo
    yield 2
    
    # Controlla solo i numeri dispari
    n = 3
    while True:
        is_prime = True
        # Controlla se n è divisibile per qualche numero da 2 a sqrt(n)
        for i in range(2, int(n**0.5) + 1):
            if n % i == 0:
                is_prime = False
                break
        if is_prime:
            yield n
        n += 2  # Passa al prossimo numero dispari

# Utilizzo del generatore infinito (limitato a 10 numeri)
primi_gen = numeri_primi()
for _ in range(10):
    print(next(primi_gen), end=" ")
# Output: 2 3 5 7 11 13 17 19 23 29
```

## Funzionalità avanzate dei generatori

### Invio di valori a un generatore

I generatori possono anche ricevere valori dall'esterno utilizzando il metodo `send()`:

```python
def echo_generator():
    while True:
        received = yield
        print(f"Ricevuto: {received}")

# Utilizzo del generatore con send
echo = echo_generator()
next(echo)  # Avvia il generatore fino al primo yield
echo.send("Hello")
echo.send(42)
echo.send([1, 2, 3])

# Output:
# Ricevuto: Hello
# Ricevuto: 42
# Ricevuto: [1, 2, 3]
```

### Generatori bidirezionali

È possibile creare generatori che sia producono valori che ne ricevono:

```python
def generatore_bidirezionale():
    valore = 0
    while True:
        ricevuto = yield valore
        if ricevuto is not None:
            valore = ricevuto
        else:
            valore += 1

# Utilizzo del generatore bidirezionale
gen = generatore_bidirezionale()
print(next(gen))  # Output: 0
print(next(gen))  # Output: 1
print(next(gen))  # Output: 2
print(gen.send(10))  # Output: 10
print(next(gen))  # Output: 11
```

### Chiusura di un generatore

I generatori possono essere chiusi utilizzando il metodo `close()`, che solleva un'eccezione `GeneratorExit` all'interno del generatore:

```python
def generatore_con_cleanup():
    try:
        for i in range(5):
            yield i
    finally:
        print("Generatore chiuso, pulizia delle risorse")

# Utilizzo del generatore con close
gen = generatore_con_cleanup()
print(next(gen))  # Output: 0
print(next(gen))  # Output: 1
gen.close()  # Output: Generatore chiuso, pulizia delle risorse
```

## Casi d'uso pratici

### Lettura efficiente di file di grandi dimensioni

```python
def read_large_file(file_path):
    with open(file_path, 'r') as file:
        for line in file:
            yield line.strip()

# Utilizzo del generatore per leggere un file riga per riga
for line in read_large_file('file_grande.txt'):
    # Elabora ogni riga senza caricare l'intero file in memoria
    process_line(line)
```

### Pipeline di elaborazione dati

I generatori sono ideali per creare pipeline di elaborazione dati, dove ogni fase della pipeline trasforma i dati e li passa alla fase successiva:

```python
def read_csv(file_path):
    with open(file_path, 'r') as file:
        for line in file:
            yield line.strip().split(',')

def convert_types(rows):
    for row in rows:
        # Converte il secondo campo in intero
        row[1] = int(row[1])
        yield row

def filter_data(rows):
    for row in rows:
        # Filtra solo le righe con valore > 100 nel secondo campo
        if row[1] > 100:
            yield row

def process_data(file_path):
    # Crea una pipeline di elaborazione
    rows = read_csv(file_path)
    rows = convert_types(rows)
    rows = filter_data(rows)
    
    return rows

# Utilizzo della pipeline
for row in process_data('dati.csv'):
    print(row)
```

## Itertools: libreria per l'iterazione

Python fornisce il modulo `itertools` che contiene funzioni per lavorare con iteratori in modo efficiente:

```python
import itertools

# Generatore infinito di numeri
contatore = itertools.count(start=1, step=2)  # 1, 3, 5, 7, ...
print(list(itertools.islice(contatore, 5)))  # Prende i primi 5: [1, 3, 5, 7, 9]

# Ciclo su una sequenza all'infinito
ciclo = itertools.cycle([1, 2, 3])  # 1, 2, 3, 1, 2, 3, ...
print([next(ciclo) for _ in range(8)])  # [1, 2, 3, 1, 2, 3, 1, 2]

# Ripetizione di un elemento
ripeti = itertools.repeat(10, 3)  # 10, 10, 10
print(list(ripeti))  # [10, 10, 10]

# Combinazioni e permutazioni
print(list(itertools.combinations('ABC', 2)))  # [('A', 'B'), ('A', 'C'), ('B', 'C')]
print(list(itertools.permutations('ABC', 2)))  # [('A', 'B'), ('A', 'C'), ('B', 'A'), ('B', 'C'), ('C', 'A'), ('C', 'B')]

# Prodotto cartesiano
print(list(itertools.product('AB', '12')))  # [('A', '1'), ('A', '2'), ('B', '1'), ('B', '2')]

# Raggruppamento di elementi consecutivi uguali
print([list(g) for k, g in itertools.groupby('AAABBBCCAABB')])  # [['A', 'A', 'A'], ['B', 'B', 'B'], ['C', 'C'], ['A', 'A'], ['B', 'B']]
```

## Conclusione

Gli iteratori e i generatori sono strumenti potenti in Python che consentono di lavorare con sequenze di dati in modo efficiente. I generatori, in particolare, offrono un modo conciso ed elegante per creare iteratori personalizzati, con numerosi vantaggi in termini di efficienza di memoria e flessibilità.

Utilizzando iteratori e generatori, è possibile:

1. Elaborare grandi quantità di dati senza caricarli interamente in memoria
2. Rappresentare sequenze potenzialmente infinite
3. Creare pipeline di elaborazione dati efficienti
4. Scrivere codice più conciso e leggibile

La padronanza di questi concetti è fondamentale per scrivere codice Python efficiente e scalabile, specialmente quando si lavora con grandi quantità di dati.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Comprensioni di Lista](./03_comprensioni_lista.md) | [Prossimo: Istruzioni di Controllo](./05_istruzioni_controllo.md)