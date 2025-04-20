# Funzioni Ricorsive

Le funzioni ricorsive sono funzioni che chiamano se stesse durante la loro esecuzione. Questo potente concetto permette di risolvere problemi complessi scomponendoli in casi più semplici.

## Concetto di ricorsione

La ricorsione si basa su due componenti fondamentali:

1. **Caso base**: la condizione che interrompe la ricorsione
2. **Caso ricorsivo**: la chiamata della funzione a se stessa con un input più semplice

```python
def funzione_ricorsiva(parametro):
    # Caso base
    if condizione_di_terminazione:
        return valore_finale
    # Caso ricorsivo
    else:
        return funzione_ricorsiva(parametro_modificato)
```

## Esempio semplice: fattoriale

Il fattoriale di un numero è un esempio classico di funzione ricorsiva.

```python
def fattoriale(n):
    # Caso base
    if n == 0 or n == 1:
        return 1
    # Caso ricorsivo
    else:
        return n * fattoriale(n - 1)

# Test della funzione
print(fattoriale(5))  # Output: 120 (5 * 4 * 3 * 2 * 1)
```

In questo esempio, il caso base è quando `n` è 0 o 1, mentre il caso ricorsivo riduce progressivamente il problema calcolando `n * fattoriale(n - 1)`.

## Sequenza di Fibonacci

Un altro esempio classico è la sequenza di Fibonacci, dove ogni numero è la somma dei due precedenti.

```python
def fibonacci(n):
    # Casi base
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    # Caso ricorsivo
    else:
        return fibonacci(n - 1) + fibonacci(n - 2)

# Test della funzione
for i in range(10):
    print(fibonacci(i), end=" ")  # Output: 0 1 1 2 3 5 8 13 21 34
```

## Ricorsione vs iterazione

Mentre la ricorsione può rendere il codice più elegante e leggibile, può anche comportare un maggiore utilizzo di memoria e potenziali problemi di stack overflow per input grandi.

```python
# Versione ricorsiva del fattoriale
def fattoriale_ricorsivo(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * fattoriale_ricorsivo(n - 1)

# Versione iterativa del fattoriale
def fattoriale_iterativo(n):
    risultato = 1
    for i in range(1, n + 1):
        risultato *= i
    return risultato

# Test delle funzioni
n = 5
print(f"Fattoriale ricorsivo di {n}: {fattoriale_ricorsivo(n)}")
print(f"Fattoriale iterativo di {n}: {fattoriale_iterativo(n)}")
```

## Ricorsione con memoizzazione

La memoizzazione è una tecnica che memorizza i risultati delle chiamate di funzione per evitare calcoli ripetuti, migliorando significativamente le prestazioni.

```python
# Fibonacci con memoizzazione
def fibonacci_memo(n, memo={}):
    # Controlla se il risultato è già memorizzato
    if n in memo:
        return memo[n]
    
    # Casi base
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    
    # Caso ricorsivo con memorizzazione del risultato
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]

# Test della funzione
for i in range(10):
    print(fibonacci_memo(i), end=" ")  # Output: 0 1 1 2 3 5 8 13 21 34

# Ora possiamo calcolare valori molto più grandi senza problemi di prestazioni
print(f"\nFibonacci(100): {fibonacci_memo(100)}")
```

## Ricorsione di coda

La ricorsione di coda è una forma speciale di ricorsione dove la chiamata ricorsiva è l'ultima operazione eseguita dalla funzione. Alcuni linguaggi di programmazione ottimizzano questo tipo di ricorsione (tail call optimization), ma Python attualmente non lo fa.

```python
# Fattoriale con ricorsione di coda
def fattoriale_coda(n, accumulatore=1):
    if n <= 1:
        return accumulatore
    else:
        return fattoriale_coda(n - 1, n * accumulatore)

# Test della funzione
print(fattoriale_coda(5))  # Output: 120
```

## Ricorsione indiretta

La ricorsione indiretta si verifica quando una funzione A chiama una funzione B, che a sua volta chiama nuovamente la funzione A.

```python
def è_pari(n):
    if n == 0:
        return True
    else:
        return è_dispari(n - 1)

def è_dispari(n):
    if n == 0:
        return False
    else:
        return è_pari(n - 1)

# Test delle funzioni
print(f"5 è pari? {è_pari(5)}")  # Output: 5 è pari? False
print(f"6 è pari? {è_pari(6)}")  # Output: 6 è pari? True
```

## Limiti della ricorsione in Python

Python ha un limite predefinito alla profondità della ricorsione per prevenire stack overflow. È possibile visualizzare e modificare questo limite.

```python
import sys

# Visualizza il limite attuale
print(f"Limite di ricorsione attuale: {sys.getrecursionlimit()}")

# Modifica il limite (usare con cautela)
sys.setrecursionlimit(2000)
print(f"Nuovo limite di ricorsione: {sys.getrecursionlimit()}")
```

## Conclusione

Le funzioni ricorsive sono uno strumento potente nella programmazione Python, particolarmente utili per problemi che possono essere naturalmente scomposti in sottoproblemi simili. Tuttavia, è importante considerare le implicazioni in termini di prestazioni e utilizzo della memoria, e in alcuni casi optare per soluzioni iterative o ricorsive ottimizzate.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Parametri e Argomenti](./02_parametri_argomenti.md) | [Prossimo: Funzioni Lambda](./04_lambda_funzioni.md)