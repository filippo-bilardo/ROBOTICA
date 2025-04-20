# Funzioni Lambda

Le funzioni lambda, note anche come funzioni anonime, sono piccole funzioni che possono essere definite in una singola riga di codice. Sono particolarmente utili quando si ha bisogno di una funzione semplice per un breve periodo di tempo.

## Sintassi di base

La sintassi di una funzione lambda è la seguente:

```python
lambda parametri: espressione
```

Una funzione lambda può avere zero o più parametri e restituisce sempre il valore dell'espressione.

## Esempi di funzioni lambda

### Funzione lambda senza parametri

```python
saluto = lambda: "Ciao, mondo!"
print(saluto())  # Output: Ciao, mondo!
```

### Funzione lambda con un parametro

```python
quadrato = lambda x: x ** 2
print(quadrato(5))  # Output: 25
```

### Funzione lambda con più parametri

```python
somma = lambda x, y: x + y
print(somma(3, 4))  # Output: 7

# Funzione più complessa
calcola = lambda x, y, z: x * y + z
print(calcola(2, 3, 4))  # Output: 10
```

## Confronto con le funzioni regolari

Le funzioni lambda sono equivalenti a funzioni regolari molto semplici:

```python
# Funzione regolare
def quadrato_funzione(x):
    return x ** 2

# Funzione lambda equivalente
quadrato_lambda = lambda x: x ** 2

# Test delle funzioni
print(quadrato_funzione(5))  # Output: 25
print(quadrato_lambda(5))    # Output: 25
```

## Utilizzo con funzioni di ordine superiore

Le funzioni lambda sono particolarmente utili con funzioni di ordine superiore come `map()`, `filter()` e `sorted()`.

### Esempio con map()

```python
numeri = [1, 2, 3, 4, 5]

# Applicare una funzione a ogni elemento di una lista
quadrati = list(map(lambda x: x ** 2, numeri))
print(quadrati)  # Output: [1, 4, 9, 16, 25]
```

### Esempio con filter()

```python
numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Filtrare gli elementi di una lista
pari = list(filter(lambda x: x % 2 == 0, numeri))
print(pari)  # Output: [2, 4, 6, 8, 10]
```

### Esempio con sorted()

```python
persone = [
    {"nome": "Alice", "età": 25},
    {"nome": "Bob", "età": 30},
    {"nome": "Charlie", "età": 20}
]

# Ordinare una lista di dizionari per età
persone_ordinate = sorted(persone, key=lambda persona: persona["età"])
for persona in persone_ordinate:
    print(f"{persona['nome']}: {persona['età']} anni")
# Output:
# Charlie: 20 anni
# Alice: 25 anni
# Bob: 30 anni
```

## Funzioni lambda in espressioni condizionali

Le funzioni lambda possono includere espressioni condizionali:

```python
# Funzione lambda con espressione condizionale
è_pari = lambda x: "pari" if x % 2 == 0 else "dispari"
print(è_pari(4))  # Output: pari
print(è_pari(5))  # Output: dispari
```

## Funzioni lambda come funzioni di callback

Le funzioni lambda sono spesso utilizzate come funzioni di callback, ad esempio in GUI o in operazioni asincrone:

```python
import tkinter as tk

finestra = tk.Tk()
finestra.title("Esempio Lambda")

# Utilizzo di lambda come callback
pulsante = tk.Button(finestra, text="Clicca qui", 
                    command=lambda: print("Pulsante cliccato!"))
pulsante.pack(pady=20)

# In un'applicazione reale, eseguiremmo finestra.mainloop()
```

## Chiusure con funzioni lambda

Le funzioni lambda possono accedere a variabili nel loro ambito di definizione, creando chiusure:

```python
def crea_moltiplicatore(n):
    return lambda x: x * n

raddoppia = crea_moltiplicatore(2)
triplica = crea_moltiplicatore(3)

print(raddoppia(5))  # Output: 10
print(triplica(5))   # Output: 15
```

## Limitazioni delle funzioni lambda

Le funzioni lambda hanno alcune limitazioni rispetto alle funzioni regolari:

1. Possono contenere solo una singola espressione
2. Non possono contenere istruzioni multiple o costrutti complessi
3. Non hanno un nome, rendendo il debugging più difficile
4. Non possono contenere docstring

```python
# Questo non è possibile in una lambda
# lambda x: 
#     risultato = x ** 2
#     return risultato
```

## Quando usare le funzioni lambda

Le funzioni lambda sono più adatte per:

1. Funzioni semplici e brevi
2. Funzioni utilizzate una sola volta
3. Funzioni passate come argomenti ad altre funzioni
4. Quando la leggibilità non viene compromessa

## Quando evitare le funzioni lambda

È meglio evitare le funzioni lambda quando:

1. La funzione è complessa
2. La funzione viene riutilizzata in più punti
3. La funzione richiede documentazione
4. La leggibilità del codice viene compromessa

## Conclusione

Le funzioni lambda sono uno strumento potente in Python per creare funzioni semplici e concise. Sono particolarmente utili in combinazione con funzioni di ordine superiore e quando si ha bisogno di funzioni temporanee. Tuttavia, è importante utilizzarle con giudizio, privilegiando sempre la leggibilità e la manutenibilità del codice.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Funzioni Ricorsive](./03_funzioni_ricorsive.md) | [Prossimo: Decoratori](./05_decoratori.md)