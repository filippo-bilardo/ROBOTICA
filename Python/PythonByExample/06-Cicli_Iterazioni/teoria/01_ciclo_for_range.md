# Ciclo For e Range

Il ciclo `for` è uno strumento fondamentale in Python per iterare su sequenze di elementi come liste, tuple, stringhe e altri oggetti iterabili. Combinato con la funzione `range()`, diventa un potente meccanismo per eseguire operazioni ripetitive.

## Sintassi di base del ciclo for

La sintassi di base del ciclo `for` in Python è la seguente:

```python
for elemento in sequenza:
    # Blocco di codice da eseguire per ogni elemento
    # Operazioni con l'elemento corrente
```

Dove:
- `elemento` è una variabile che assume il valore di ciascun elemento della sequenza ad ogni iterazione
- `sequenza` è un oggetto iterabile (lista, tupla, stringa, dizionario, set, ecc.)

## Esempi di ciclo for con diverse sequenze

### Iterazione su una lista

```python
frutta = ["mela", "banana", "arancia", "kiwi"]

for frutto in frutta:
    print(f"Mi piace la {frutto}")

# Output:
# Mi piace la mela
# Mi piace la banana
# Mi piace la arancia
# Mi piace la kiwi
```

### Iterazione su una stringa

```python
parola = "Python"

for carattere in parola:
    print(carattere)

# Output:
# P
# y
# t
# h
# o
# n
```

### Iterazione su un dizionario

```python
persona = {"nome": "Mario", "età": 30, "città": "Roma"}

# Iterazione sulle chiavi (comportamento predefinito)
for chiave in persona:
    print(chiave)

# Output:
# nome
# età
# città

# Iterazione sulle coppie chiave-valore
for chiave, valore in persona.items():
    print(f"{chiave}: {valore}")

# Output:
# nome: Mario
# età: 30
# città: Roma

# Iterazione solo sui valori
for valore in persona.values():
    print(valore)

# Output:
# Mario
# 30
# Roma
```

## La funzione range()

La funzione `range()` genera una sequenza di numeri che può essere utilizzata con il ciclo `for`. È particolarmente utile quando si ha bisogno di eseguire un'operazione un numero specifico di volte.

### Sintassi di range()

```python
range(stop)  # Genera numeri da 0 a stop-1
range(start, stop)  # Genera numeri da start a stop-1
range(start, stop, step)  # Genera numeri da start a stop-1 con incremento step
```

### Esempi di utilizzo di range()

```python
# range con un solo argomento
for i in range(5):
    print(i, end=" ")
# Output: 0 1 2 3 4

print()  # Nuova riga

# range con due argomenti
for i in range(2, 8):
    print(i, end=" ")
# Output: 2 3 4 5 6 7

print()  # Nuova riga

# range con tre argomenti
for i in range(1, 10, 2):
    print(i, end=" ")
# Output: 1 3 5 7 9

print()  # Nuova riga

# range con step negativo (conteggio alla rovescia)
for i in range(10, 0, -1):
    print(i, end=" ")
# Output: 10 9 8 7 6 5 4 3 2 1
```

## Ciclo for con enumerate()

La funzione `enumerate()` è utile quando si ha bisogno sia dell'indice che del valore durante l'iterazione:

```python
frutta = ["mela", "banana", "arancia", "kiwi"]

for indice, frutto in enumerate(frutta):
    print(f"Indice {indice}: {frutto}")

# Output:
# Indice 0: mela
# Indice 1: banana
# Indice 2: arancia
# Indice 3: kiwi

# È possibile specificare l'indice di partenza
for indice, frutto in enumerate(frutta, start=1):
    print(f"Frutto #{indice}: {frutto}")

# Output:
# Frutto #1: mela
# Frutto #2: banana
# Frutto #3: arancia
# Frutto #4: kiwi
```

## Ciclo for con zip()

La funzione `zip()` permette di iterare su più sequenze contemporaneamente:

```python
nomi = ["Alice", "Bob", "Charlie"]
età = [25, 30, 35]
città = ["Milano", "Roma", "Napoli"]

for nome, anni, luogo in zip(nomi, età, città):
    print(f"{nome} ha {anni} anni e vive a {luogo}")

# Output:
# Alice ha 25 anni e vive a Milano
# Bob ha 30 anni e vive a Roma
# Charlie ha 35 anni e vive a Napoli
```

## Ciclo for con else

In Python, il ciclo `for` può avere una clausola `else` che viene eseguita quando il ciclo termina normalmente (non interrotto da `break`):

```python
for i in range(5):
    print(i, end=" ")
else:
    print("\nCiclo completato!")

# Output:
# 0 1 2 3 4
# Ciclo completato!

# Esempio con break
for i in range(5):
    if i == 3:
        break
    print(i, end=" ")
else:
    print("\nCiclo completato!")  # Questa parte non viene eseguita

# Output:
# 0 1 2
```

## Cicli for annidati

È possibile annidare cicli `for` per iterare su strutture dati multidimensionali:

```python
# Matrice 3x3
matrice = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# Iterazione su ogni elemento della matrice
for riga in matrice:
    for elemento in riga:
        print(elemento, end=" ")
    print()  # Nuova riga dopo ogni riga della matrice

# Output:
# 1 2 3
# 4 5 6
# 7 8 9

# Utilizzo di range per gli indici
for i in range(len(matrice)):
    for j in range(len(matrice[i])):
        print(f"matrice[{i}][{j}] = {matrice[i][j]}")
```

## Conclusione

Il ciclo `for` e la funzione `range()` sono strumenti essenziali in Python per l'iterazione e la ripetizione di operazioni. La loro versatilità permette di lavorare efficacemente con diverse strutture dati e di implementare algoritmi complessi in modo leggibile ed efficiente.

---

[Indice dell'esercitazione](../README.md) | [Prossimo: Ciclo While](./02_ciclo_while.md)