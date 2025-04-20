# Ciclo While

Il ciclo `while` è una struttura di controllo fondamentale in Python che consente di eseguire ripetutamente un blocco di codice fintanto che una condizione specificata rimane vera. A differenza del ciclo `for`, che itera su una sequenza predefinita di elementi, il ciclo `while` continua l'esecuzione fino a quando la sua condizione di controllo diventa falsa.

## Sintassi di base del ciclo while

La sintassi di base del ciclo `while` in Python è la seguente:

```python
while condizione:
    # Blocco di codice da eseguire finché la condizione è vera
    # Operazioni da ripetere
```

Dove:
- `condizione` è un'espressione che viene valutata come un valore booleano (True o False)
- Il blocco di codice indentato viene eseguito ripetutamente finché la condizione rimane vera

## Esempi di base del ciclo while

### Conteggio semplice

```python
contatore = 1

while contatore <= 5:
    print(contatore)
    contatore += 1  # Incremento del contatore

# Output:
# 1
# 2
# 3
# 4
# 5
```

### Somma di numeri fino a un limite

```python
somma = 0
numero = 1

while somma < 50:
    somma += numero
    print(f"Aggiungo {numero}: la somma è ora {somma}")
    numero += 1

print(f"La somma finale è {somma}")

# Output (esempio):
# Aggiungo 1: la somma è ora 1
# Aggiungo 2: la somma è ora 3
# Aggiungo 3: la somma è ora 6
# ...
# Aggiungo 10: la somma è ora 55
# La somma finale è 55
```

## Ciclo while con break e continue

Come nel ciclo `for`, è possibile utilizzare le istruzioni `break` e `continue` per controllare il flusso di esecuzione all'interno di un ciclo `while`.

### Utilizzo di break

L'istruzione `break` interrompe immediatamente il ciclo e passa all'esecuzione del codice che segue il ciclo:

```python
contatore = 1

while True:  # Ciclo infinito
    print(contatore)
    contatore += 1
    
    if contatore > 5:
        print("Uscita dal ciclo con break")
        break  # Esce dal ciclo quando contatore supera 5

print("Fine del programma")

# Output:
# 1
# 2
# 3
# 4
# 5
# Uscita dal ciclo con break
# Fine del programma
```

### Utilizzo di continue

L'istruzione `continue` salta il resto del blocco di codice per l'iterazione corrente e passa alla successiva valutazione della condizione:

```python
contatore = 0

while contatore < 10:
    contatore += 1
    
    if contatore % 2 == 0:  # Se il contatore è pari
        continue  # Salta il resto del blocco e passa alla prossima iterazione
    
    print(contatore)  # Stampa solo i numeri dispari

# Output:
# 1
# 3
# 5
# 7
# 9
```

## Ciclo while con else

Come il ciclo `for`, anche il ciclo `while` può avere una clausola `else` che viene eseguita quando la condizione del ciclo diventa falsa (ma non quando il ciclo viene interrotto con `break`):

```python
contatore = 1

while contatore <= 5:
    print(contatore)
    contatore += 1
else:
    print("Il ciclo è terminato normalmente")

# Output:
# 1
# 2
# 3
# 4
# 5
# Il ciclo è terminato normalmente

# Esempio con break
contatore = 1

while contatore <= 5:
    print(contatore)
    if contatore == 3:
        break
    contatore += 1
else:
    print("Questo messaggio non verrà stampato")

print("Ciclo interrotto con break")

# Output:
# 1
# 2
# 3
# Ciclo interrotto con break
```

## Cicli while annidati

È possibile annidare cicli `while` per gestire strutture di dati complesse o problemi che richiedono iterazioni multiple:

```python
riga = 1

while riga <= 3:
    colonna = 1
    while colonna <= 3:
        print(f"({riga}, {colonna})", end=" ")
        colonna += 1
    print()  # Nuova riga dopo ogni riga della matrice
    riga += 1

# Output:
# (1, 1) (1, 2) (1, 3) 
# (2, 1) (2, 2) (2, 3) 
# (3, 1) (3, 2) (3, 3) 
```

## Ciclo while vs. ciclo for

Entrambi i cicli `while` e `for` sono strumenti potenti per l'iterazione in Python, ma hanno scopi leggermente diversi:

- **Ciclo for**: Ideale quando si conosce in anticipo il numero di iterazioni o quando si itera su una sequenza di elementi.
- **Ciclo while**: Più adatto quando il numero di iterazioni non è noto in anticipo e dipende da una condizione che può cambiare durante l'esecuzione del ciclo.

### Esempio: Conversione di un ciclo for in while

```python
# Ciclo for con range
print("Utilizzo del ciclo for:")
for i in range(1, 6):
    print(i)

# Equivalente con ciclo while
print("\nUtilizzo del ciclo while:")
i = 1
while i <= 5:
    print(i)
    i += 1
```

## Casi d'uso comuni del ciclo while

### Validazione dell'input utente

```python
while True:
    risposta = input("Inserisci un numero positivo: ")
    if risposta.isdigit() and int(risposta) > 0:
        numero = int(risposta)
        print(f"Hai inserito il numero valido: {numero}")
        break
    else:
        print("Input non valido. Riprova.")
```

### Implementazione di un menu interattivo

```python
scelta = None

while scelta != "4":
    print("\nMenu:")
    print("1. Visualizza informazioni")
    print("2. Aggiungi elemento")
    print("3. Elimina elemento")
    print("4. Esci")
    
    scelta = input("Seleziona un'opzione (1-4): ")
    
    if scelta == "1":
        print("Visualizzazione informazioni...")
    elif scelta == "2":
        print("Aggiunta elemento...")
    elif scelta == "3":
        print("Eliminazione elemento...")
    elif scelta == "4":
        print("Uscita dal programma...")
    else:
        print("Opzione non valida. Riprova.")
```

### Algoritmi iterativi

```python
# Calcolo del massimo comun divisore (MCD) con l'algoritmo di Euclide
def mcd(a, b):
    while b:
        a, b = b, a % b
    return a

print(mcd(48, 18))  # Output: 6
```

## Attenzione ai cicli infiniti

Un errore comune quando si utilizza il ciclo `while` è creare inavvertitamente un ciclo infinito, che si verifica quando la condizione del ciclo non diventa mai falsa:

```python
# Esempio di ciclo infinito (NON eseguire questo codice senza una strategia di uscita)
# while True:
#     print("Questo è un ciclo infinito!")
```

Per evitare cicli infiniti, assicurati sempre che:
1. La condizione del ciclo possa diventare falsa in qualche momento
2. All'interno del ciclo ci sia un'istruzione che modifichi lo stato della condizione
3. In caso di dubbio, includi un meccanismo di uscita di emergenza (come un contatore o un'istruzione `break`)

```python
# Ciclo con meccanismo di sicurezza
max_iterazioni = 1000
contatore = 0

while condizione_complessa() and contatore < max_iterazioni:
    # Operazioni del ciclo
    contatore += 1

if contatore >= max_iterazioni:
    print("Attenzione: raggiunto il numero massimo di iterazioni")
```

## Conclusione

Il ciclo `while` è uno strumento potente e flessibile per l'iterazione in Python, particolarmente utile quando il numero di iterazioni non è noto in anticipo. Combinato con istruzioni come `break` e `continue`, offre un controllo preciso sul flusso di esecuzione del programma. Tuttavia, è importante utilizzarlo con attenzione per evitare cicli infiniti e garantire che il codice termini correttamente.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Ciclo For e Range](./01_ciclo_for_range.md)