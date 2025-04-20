# Esercizi sui Cicli in Python

Questa sezione contiene una serie di esercizi pratici per mettere alla prova la tua comprensione dei cicli `for` e `while` in Python. Gli esercizi sono organizzati in ordine crescente di difficoltà.

## Esercizio 1: Conteggio e Somma

Scrivi un programma che chieda all'utente di inserire un numero intero positivo `n` e poi:
1. Stampi tutti i numeri da 1 a `n`
2. Calcoli e stampi la somma di tutti i numeri da 1 a `n`
3. Calcoli e stampi la somma di tutti i numeri pari da 1 a `n`

Implementa l'esercizio sia con un ciclo `for` che con un ciclo `while`.

### Soluzione con ciclo for

```python
n = int(input("Inserisci un numero intero positivo: "))

# Stampa tutti i numeri da 1 a n
print("Numeri da 1 a", n, ":")
for i in range(1, n + 1):
    print(i, end=" ")
print()  # Nuova riga

# Calcola e stampa la somma di tutti i numeri da 1 a n
somma_totale = 0
for i in range(1, n + 1):
    somma_totale += i
print(f"La somma di tutti i numeri da 1 a {n} è: {somma_totale}")

# Calcola e stampa la somma di tutti i numeri pari da 1 a n
somma_pari = 0
for i in range(1, n + 1):
    if i % 2 == 0:  # Verifica se il numero è pari
        somma_pari += i
print(f"La somma di tutti i numeri pari da 1 a {n} è: {somma_pari}")
```

### Soluzione con ciclo while

```python
n = int(input("Inserisci un numero intero positivo: "))

# Stampa tutti i numeri da 1 a n
print("Numeri da 1 a", n, ":")
i = 1
while i <= n:
    print(i, end=" ")
    i += 1
print()  # Nuova riga

# Calcola e stampa la somma di tutti i numeri da 1 a n
somma_totale = 0
i = 1
while i <= n:
    somma_totale += i
    i += 1
print(f"La somma di tutti i numeri da 1 a {n} è: {somma_totale}")

# Calcola e stampa la somma di tutti i numeri pari da 1 a n
somma_pari = 0
i = 1
while i <= n:
    if i % 2 == 0:  # Verifica se il numero è pari
        somma_pari += i
    i += 1
print(f"La somma di tutti i numeri pari da 1 a {n} è: {somma_pari}")
```

## Esercizio 2: Tabella di Moltiplicazione

Scrivi un programma che generi e visualizzi la tabella di moltiplicazione per i numeri da 1 a 10.

### Soluzione

```python
print("Tabella di moltiplicazione da 1 a 10:")

# Intestazione della tabella
print("  |", end="")
for i in range(1, 11):
    print(f"{i:3}", end="")
print("\n" + "-" * 45)  # Linea separatrice

# Corpo della tabella
for i in range(1, 11):
    print(f"{i:2}|", end="")
    for j in range(1, 11):
        print(f"{i*j:3}", end="")
    print()  # Nuova riga dopo ogni riga della tabella
```

## Esercizio 3: Numeri Primi

Scrivi un programma che trovi e stampi tutti i numeri primi compresi tra 1 e 100.

### Soluzione

```python
print("Numeri primi tra 1 e 100:")

for num in range(2, 101):  # 1 non è considerato un numero primo
    is_prime = True
    
    # Verifica se num è divisibile per qualche numero da 2 a num-1
    for i in range(2, int(num**0.5) + 1):  # Ottimizzazione: basta controllare fino alla radice quadrata
        if num % i == 0:
            is_prime = False
            break
    
    if is_prime:
        print(num, end=" ")
```

## Esercizio 4: Sequenza di Fibonacci

Scrivi un programma che generi e stampi i primi `n` numeri della sequenza di Fibonacci, dove `n` è un numero fornito dall'utente.

La sequenza di Fibonacci inizia con 0 e 1, e ogni numero successivo è la somma dei due precedenti: 0, 1, 1, 2, 3, 5, 8, 13, ...

### Soluzione

```python
n = int(input("Quanti numeri della sequenza di Fibonacci vuoi generare? "))

# Gestione dei casi speciali
if n <= 0:
    print("Inserisci un numero positivo.")
elif n == 1:
    print("Sequenza di Fibonacci fino al primo numero: 0")
elif n == 2:
    print("Sequenza di Fibonacci fino al secondo numero: 0, 1")
else:
    # Inizializzazione dei primi due numeri
    fib = [0, 1]
    
    # Generazione dei numeri successivi
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    
    print(f"Sequenza di Fibonacci fino al {n}-esimo numero:")
    print(", ".join(map(str, fib)))
```

## Esercizio 5: Indovina il Numero

Scrivi un programma che generi un numero casuale tra 1 e 100 e chieda all'utente di indovinarlo. Il programma deve fornire suggerimenti del tipo "troppo alto" o "troppo basso" fino a quando l'utente non indovina il numero corretto.

### Soluzione

```python
import random

# Genera un numero casuale tra 1 e 100
numero_segreto = random.randint(1, 100)
tentativi = 0
indovinato = False

print("Ho pensato a un numero tra 1 e 100. Prova a indovinarlo!")

while not indovinato:
    # Chiedi all'utente di fare un tentativo
    try:
        tentativo = int(input("Il tuo tentativo: "))
        tentativi += 1
        
        # Verifica il tentativo
        if tentativo < numero_segreto:
            print("Troppo basso! Prova con un numero più grande.")
        elif tentativo > numero_segreto:
            print("Troppo alto! Prova con un numero più piccolo.")
        else:
            indovinato = True
            print(f"Congratulazioni! Hai indovinato il numero {numero_segreto} in {tentativi} tentativi!")
    except ValueError:
        print("Per favore, inserisci un numero valido.")
```

## Esercizio 6: Disegno di Pattern

Scrivi un programma che utilizzi cicli annidati per disegnare i seguenti pattern:

1. Un triangolo rettangolo di asterischi
2. Un triangolo isoscele di asterischi

### Soluzione

```python
# 1. Triangolo rettangolo
print("Triangolo rettangolo:")
n = 5  # Altezza del triangolo

for i in range(1, n + 1):
    print("*" * i)

print()  # Linea vuota tra i pattern

# 2. Triangolo isoscele
print("Triangolo isoscele:")
n = 5  # Altezza del triangolo

for i in range(1, n + 1):
    # Calcola il numero di spazi e asterischi per ogni riga
    spazi = n - i
    asterischi = 2 * i - 1
    
    # Stampa la riga corrente
    print(" " * spazi + "*" * asterischi)
```

## Sfida Avanzata: Il Gioco della Vita di Conway

Implementa una versione semplificata del "Gioco della Vita" di Conway, un automa cellulare che evolve secondo regole specifiche. Utilizza una griglia bidimensionale rappresentata da una lista di liste, dove ogni cella può essere "viva" (1) o "morta" (0).

Le regole sono:
1. Una cella viva con meno di 2 vicini vivi muore (solitudine)
2. Una cella viva con 2 o 3 vicini vivi sopravvive
3. Una cella viva con più di 3 vicini vivi muore (sovrappopolazione)
4. Una cella morta con esattamente 3 vicini vivi diventa viva (riproduzione)

### Soluzione

```python
import random
import time
import os

def crea_griglia(righe, colonne):
    """Crea una griglia casuale di dimensioni righe x colonne"""
    return [[random.choice([0, 1]) for _ in range(colonne)] for _ in range(righe)]

def stampa_griglia(griglia):
    """Stampa la griglia corrente"""
    for riga in griglia:
        for cella in riga:
            if cella == 1:
                print("■", end=" ")
            else:
                print("□", end=" ")
        print()

def conta_vicini_vivi(griglia, riga, colonna):
    """Conta il numero di vicini vivi di una cella"""
    righe = len(griglia)
    colonne = len(griglia[0])
    vicini_vivi = 0
    
    # Controlla tutte le 8 celle adiacenti
    for i in range(max(0, riga-1), min(righe, riga+2)):
        for j in range(max(0, colonna-1), min(colonne, colonna+2)):
            # Salta la cella stessa
            if (i, j) != (riga, colonna) and griglia[i][j] == 1:
                vicini_vivi += 1
    
    return vicini_vivi

def prossima_generazione(griglia):
    """Calcola la prossima generazione della griglia"""
    righe = len(griglia)
    colonne = len(griglia[0])
    nuova_griglia = [[0 for _ in range(colonne)] for _ in range(righe)]
    
    for i in range(righe):
        for j in range(colonne):
            vicini = conta_vicini_vivi(griglia, i, j)
            
            # Applica le regole del Gioco della Vita
            if griglia[i][j] == 1:  # Cella viva
                if vicini < 2 or vicini > 3:
                    nuova_griglia[i][j] = 0  # Muore
                else:
                    nuova_griglia[i][j] = 1  # Sopravvive
            else:  # Cella morta
                if vicini == 3:
                    nuova_griglia[i][j] = 1  # Diventa viva
    
    return nuova_griglia

# Parametri della simulazione
righe, colonne = 20, 40
generazioni = 30
griglia = crea_griglia(righe, colonne)

# Esegui la simulazione
for gen in range(generazioni):
    os.system('cls' if os.name == 'nt' else 'clear')  # Pulisce lo schermo
    print(f"Generazione {gen + 1}:")
    stampa_griglia(griglia)
    griglia = prossima_generazione(griglia)
    time.sleep(0.5)  # Pausa tra le generazioni
```

## Conclusione

Questi esercizi ti hanno permesso di mettere in pratica i concetti relativi ai cicli `for` e `while` in Python. Ricorda che la pratica è fondamentale per padroneggiare questi concetti. Prova a modificare le soluzioni proposte o a creare varianti degli esercizi per approfondire ulteriormente la tua comprensione.

---

[Indice dell'esercitazione](../README.md) | [Teoria: Ciclo For e Range](../teoria/01_ciclo_for_range.md) | [Teoria: Ciclo While](../teoria/02_ciclo_while.md)