# Comprensioni in Python

## Cosa sono le comprensioni
Le comprensioni (comprehensions) in Python sono costrutti sintattici che permettono di creare nuove sequenze (come liste, dizionari, set) in modo conciso ed elegante. Sono un modo più compatto e spesso più leggibile per creare collezioni rispetto ai tradizionali cicli for.

Le comprensioni sono basate sulla notazione matematica per la costruzione di insiemi e permettono di applicare espressioni e filtri agli elementi di una sequenza esistente per generare una nuova sequenza.

## Comprensioni di liste
La comprensione di liste è probabilmente la forma più comune e utilizzata di comprensione in Python.

### Sintassi di base

```python
[espressione for elemento in iterabile]
```

Dove:
- `espressione` è un'operazione da applicare a ogni elemento
- `elemento` è la variabile che rappresenta ogni elemento dell'iterabile
- `iterabile` è la sequenza di origine (lista, tupla, stringa, ecc.)

### Esempi di comprensioni di liste

```python
# Creazione di una lista di quadrati
quadrati = [x**2 for x in range(10)]
print(quadrati)  # Output: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Equivalente con un ciclo for tradizionale
quadrati_tradizionale = []
for x in range(10):
    quadrati_tradizionale.append(x**2)

# Creazione di una lista di stringhe in maiuscolo
frutta = ["mela", "banana", "arancia", "kiwi"]
frutta_maiuscolo = [f.upper() for f in frutta]
print(frutta_maiuscolo)  # Output: ['MELA', 'BANANA', 'ARANCIA', 'KIWI']

# Estrazione di specifici elementi da una struttura complessa
persone = [
    {"nome": "Mario", "età": 30},
    {"nome": "Laura", "età": 25},
    {"nome": "Giovanni", "età": 35}
]
nomi = [p["nome"] for p in persone]
print(nomi)  # Output: ['Mario', 'Laura', 'Giovanni']
```

### Comprensioni di liste con condizioni
È possibile aggiungere condizioni alle comprensioni di liste per filtrare gli elementi.

```python
# Sintassi con condizione
[espressione for elemento in iterabile if condizione]

# Esempio: numeri pari da 0 a 19
pari = [x for x in range(20) if x % 2 == 0]
print(pari)  # Output: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# Esempio: parole con lunghezza maggiore di 5
parole = ["hello", "world", "python", "programming", "comprehension"]
parole_lunghe = [p for p in parole if len(p) > 5]
print(parole_lunghe)  # Output: ['python', 'programming', 'comprehension']

# Esempio: filtraggio di dati strutturati
persone_giovani = [p["nome"] for p in persone if p["età"] < 30]
print(persone_giovani)  # Output: ['Laura']
```

### Comprensioni di liste annidate
È possibile annidare più cicli for in una comprensione di lista.

```python
# Sintassi con cicli annidati
[espressione for elemento1 in iterabile1 for elemento2 in iterabile2]

# Esempio: tutte le combinazioni di due liste
colori = ["rosso", "verde", "blu"]
formati = ["cerchio", "quadrato"]
combinazioni = [f"{c} {f}" for c in colori for f in formati]
print(combinazioni)
# Output: ['rosso cerchio', 'rosso quadrato', 'verde cerchio', 'verde quadrato', 'blu cerchio', 'blu quadrato']

# Equivalente con cicli for annidati tradizionali
combinazioni_tradizionale = []
for c in colori:
    for f in formati:
        combinazioni_tradizionale.append(f"{c} {f}")

# Esempio: matrice di coordinate
coordinate = [(x, y) for x in range(3) for y in range(3)]
print(coordinate)
# Output: [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2), (2, 0), (2, 1), (2, 2)]
```

### Comprensioni di liste con condizioni multiple
È possibile utilizzare più condizioni in una comprensione di lista.

```python
# Numeri divisibili sia per 2 che per 3 da 0 a 29
divisibili = [x for x in range(30) if x % 2 == 0 if x % 3 == 0]
print(divisibili)  # Output: [0, 6, 12, 18, 24]

# Equivalente con una singola condizione composta
divisibili_alt = [x for x in range(30) if x % 2 == 0 and x % 3 == 0]

# Esempio con if-else nell'espressione
numeri = [x if x % 2 == 0 else -x for x in range(10)]
print(numeri)  # Output: [0, -1, 2, -3, 4, -5, 6, -7, 8, -9]
# Nota: qui l'if-else è parte dell'espressione, non del filtro
```

## Comprensioni di dizionari
Le comprensioni di dizionari permettono di creare dizionari in modo conciso.

### Sintassi di base

```python
{chiave: valore for elemento in iterabile}
```

### Esempi di comprensioni di dizionari

```python
# Creazione di un dizionario di quadrati
quadrati_dict = {x: x**2 for x in range(5)}
print(quadrati_dict)  # Output: {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# Inversione di un dizionario (scambio chiavi-valori)
originale = {"a": 1, "b": 2, "c": 3}
invertito = {v: k for k, v in originale.items()}
print(invertito)  # Output: {1: 'a', 2: 'b', 3: 'c'}

# Creazione di un dizionario da due liste
chiavi = ["a", "b", "c"]
valori = [1, 2, 3]
dizionario = {k: v for k, v in zip(chiavi, valori)}
print(dizionario)  # Output: {'a': 1, 'b': 2, 'c': 3}

# Filtraggio di elementi in un dizionario
originale = {"a": 1, "b": 2, "c": 3, "d": 4}
pari = {k: v for k, v in originale.items() if v % 2 == 0}
print(pari)  # Output: {'b': 2, 'd': 4}
```

## Comprensioni di set
Le comprensioni di set sono simili alle comprensioni di liste, ma creano set (insiemi) invece di liste.

### Sintassi di base

```python
{espressione for elemento in iterabile}
```

### Esempi di comprensioni di set

```python
# Creazione di un set di quadrati
quadrati_set = {x**2 for x in range(10)}
print(quadrati_set)  # Output: {0, 1, 4, 9, 16, 25, 36, 49, 64, 81}

# Estrazione delle vocali uniche da una stringa
testo = "hello world python programming"
vocali = {c for c in testo if c.lower() in "aeiou"}
print(vocali)  # Output: {'o', 'e', 'a', 'i'}

# Filtraggio di elementi in un set
numeri = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
pari_set = {x for x in numeri if x % 2 == 0}
print(pari_set)  # Output: {2, 4, 6, 8, 10}
```

## Comprensioni di generatori
Le comprensioni di generatori sono simili alle comprensioni di liste, ma creano un oggetto generatore invece di una lista. Sono più efficienti in termini di memoria perché non creano l'intera sequenza in memoria, ma generano gli elementi uno alla volta quando richiesto.

### Sintassi di base

```python
(espressione for elemento in iterabile)
```

Notare l'uso delle parentesi tonde `()` invece delle parentesi quadre `[]`.

### Esempi di comprensioni di generatori

```python
# Creazione di un generatore di quadrati
quadrati_gen = (x**2 for x in range(10))
print(quadrati_gen)  # Output: <generator object <genexpr> at 0x...>

# Iterazione su un generatore
for q in quadrati_gen:
    print(q, end=" ")  # Output: 0 1 4 9 16 25 36 49 64 81
print()

# Conversione di un generatore in una lista
numeri_gen = (x for x in range(5))
numeri_lista = list(numeri_gen)
print(numeri_lista)  # Output: [0, 1, 2, 3, 4]

# Nota: un generatore può essere iterato una sola volta
print(list(numeri_gen))  # Output: [] (il generatore è già stato esaurito)
```

### Vantaggi dei generatori rispetto alle liste

```python
import sys

# Confronto di memoria tra lista e generatore
lista_grande = [x for x in range(10000)]
gen_grande = (x for x in range(10000))

print(f"Dimensione lista: {sys.getsizeof(lista_grande)} bytes")
print(f"Dimensione generatore: {sys.getsizeof(gen_grande)} bytes")
# La dimensione del generatore sarà molto più piccola

# Esempio di utilizzo efficiente della memoria con generatori
def somma_primi_n(n):
    return sum(x for x in range(n))

print(somma_primi_n(1000000))  # Calcola la somma dei primi milione di numeri
# Utilizzando un generatore, non viene creata una lista di un milione di elementi in memoria
```

## Casi d'uso comuni per le comprensioni

### Trasformazione di dati

```python
# Conversione di temperature da Celsius a Fahrenheit
celsius = [0, 10, 20, 30, 40]
fahrenheit = [c * 9/5 + 32 for c in celsius]
print(fahrenheit)  # Output: [32.0, 50.0, 68.0, 86.0, 104.0]

# Estrazione di informazioni da una struttura dati complessa
libri = [
    {"titolo": "Il Signore degli Anelli", "autore": "Tolkien", "anno": 1954},
    {"titolo": "Harry Potter", "autore": "Rowling", "anno": 1997},
    {"titolo": "1984", "autore": "Orwell", "anno": 1949}
]

titoli = [libro["titolo"] for libro in libri]
print(titoli)  # Output: ['Il Signore degli Anelli', 'Harry Potter', '1984']

# Creazione di un dizionario titolo -> anno
titolo_anno = {libro["titolo"]: libro["anno"] for libro in libri}
print(titolo_anno)  # Output: {'Il Signore degli Anelli': 1954, 'Harry Potter': 1997, '1984': 1949}
```

### Filtraggio di dati

```python
# Filtraggio di numeri in una lista
numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
pari = [n for n in numeri if n % 2 == 0]
dispari = [n for n in numeri if n % 2 != 0]
print(f"Pari: {pari}, Dispari: {dispari}")

# Filtraggio di stringhe
parole = ["hello", "world", "python", "programming", "comprehension"]
parole_con_p = [p for p in parole if 'p' in p.lower()]
print(parole_con_p)  # Output: ['python', 'programming', 'comprehension']

# Filtraggio di dizionari
libri_recenti = [libro for libro in libri if libro["anno"] > 1950]
print(libri_recenti)
# Output: [{'titolo': 'Il Signore degli Anelli', 'autore': 'Tolkien', 'anno': 1954}, {'titolo': 'Harry Potter', 'autore': 'Rowling', 'anno': 1997}]
```

### Appiattimento di liste annidate

```python
# Appiattimento di una lista di liste
lista_annidata = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
lista_piatta = [elemento for sottolista in lista_annidata for elemento in sottolista]
print(lista_piatta)  # Output: [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Equivalente con cicli for tradizionali
lista_piatta_tradizionale = []
for sottolista in lista_annidata:
    for elemento in sottolista:
        lista_piatta_tradizionale.append(elemento)
```

## Prestazioni e leggibilità

### Prestazioni
Le comprensioni sono generalmente più veloci delle equivalenti costruzioni con cicli for, principalmente perché sono ottimizzate a livello di implementazione in Python.

```python
import timeit

# Confronto di prestazioni tra comprensione di lista e ciclo for
def con_comprensione():
    return [x**2 for x in range(1000)]

def con_ciclo_for():
    risultato = []
    for x in range(1000):
        risultato.append(x**2)
    return risultato

tempo_comprensione = timeit.timeit(con_comprensione, number=1000)
tempo_ciclo_for = timeit.timeit(con_ciclo_for, number=1000)

print(f"Tempo con comprensione: {tempo_comprensione:.6f} secondi")
print(f"Tempo con ciclo for: {tempo_ciclo_for:.6f} secondi")
```

### Leggibilità
Le comprensioni possono migliorare la leggibilità del codice rendendolo più conciso, ma possono anche renderlo meno leggibile se diventano troppo complesse.

```python
# Comprensione semplice e leggibile
quadrati = [x**2 for x in range(10)]

# Comprensione complessa e meno leggibile
complessa = [x**2 if x % 2 == 0 else x**3 for x in range(10) if x > 2 and x < 8]

# È meglio dividere comprensioni complesse in più passaggi
filtrati = [x for x in range(10) if x > 2 and x < 8]
trasformati = [x**2 if x % 2 == 0 else x**3 for x in filtrati]
```

## Linee guida per l'uso delle comprensioni

1. **Semplicità**: Usa le comprensioni per operazioni semplici e chiare. Se l'operazione è complessa, considera di utilizzare cicli for tradizionali o di dividere l'operazione in più passaggi.

2. **Leggibilità**: La leggibilità è più importante della concisione. Se una comprensione rende il codice difficile da capire, è meglio utilizzare un approccio più esplicito.

3. **Lunghezza**: Evita comprensioni che si estendono oltre una riga di codice. Se una comprensione è troppo lunga, dividila in più passaggi o utilizza cicli for tradizionali.

4. **Nidificazione**: Limita il numero di cicli for annidati in una comprensione. Più di due livelli di nidificazione possono rendere il codice difficile da leggere.

5. **Effetti collaterali**: Le comprensioni dovrebbero essere utilizzate per creare nuove sequenze, non per effetti collaterali. Se hai bisogno di eseguire operazioni con effetti collaterali, utilizza cicli for tradizionali.

```python
# Esempio di cattivo uso delle comprensioni (per effetti collaterali)
[print(x) for x in range(5)]  # Non fare questo

# Meglio utilizzare un ciclo for tradizionale
for x in range(5):
    print(x)
```

## Conclusione
Le comprensioni sono uno strumento potente e flessibile in Python che permette di creare nuove sequenze in modo conciso ed elegante. Quando utilizzate correttamente, possono migliorare la leggibilità e le prestazioni del codice. Tuttavia, è importante utilizzarle con giudizio, privilegiando sempre la chiarezza e la leggibilità rispetto alla concisione.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Set](./04_set.md) | [Prossimo: Esercizi sulle strutture dati](../esercizi/README.md)