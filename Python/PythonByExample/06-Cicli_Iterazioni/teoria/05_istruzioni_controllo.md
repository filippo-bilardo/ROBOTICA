# Istruzioni di Controllo nei Cicli

Le istruzioni di controllo nei cicli permettono di modificare il flusso di esecuzione normale di un ciclo. In Python, le principali istruzioni di controllo per i cicli sono `break`, `continue` e la clausola `else`. Queste istruzioni offrono un controllo più preciso sul comportamento dei cicli `for` e `while`.

## L'istruzione break

L'istruzione `break` interrompe immediatamente l'esecuzione del ciclo più interno in cui si trova e passa all'esecuzione del codice che segue il ciclo.

### Sintassi

```python
for elemento in sequenza:
    if condizione:
        break
    # Resto del codice nel ciclo

# Codice dopo il ciclo
```

### Esempi di utilizzo di break

#### Interrompere un ciclo quando si trova un valore specifico

```python
numeri = [1, 3, 5, 7, 9, 2, 4, 6, 8, 10]

print("Cerco il primo numero pari nella lista:")
for numero in numeri:
    if numero % 2 == 0:
        print(f"Trovato il numero pari {numero}!")
        break
    print(f"Controllato {numero}, non è pari")

print("Fine della ricerca")

# Output:
# Cerco il primo numero pari nella lista:
# Controllato 1, non è pari
# Controllato 3, non è pari
# Controllato 5, non è pari
# Controllato 7, non è pari
# Controllato 9, non è pari
# Trovato il numero pari 2!
# Fine della ricerca
```

#### Uscire da un ciclo infinito

```python
contatore = 0

while True:  # Ciclo infinito
    print(f"Iterazione {contatore}")
    contatore += 1
    
    if contatore >= 5:
        print("Raggiunte 5 iterazioni, esco dal ciclo")
        break

print("Ciclo terminato")

# Output:
# Iterazione 0
# Iterazione 1
# Iterazione 2
# Iterazione 3
# Iterazione 4
# Raggiunte 5 iterazioni, esco dal ciclo
# Ciclo terminato
```

## L'istruzione continue

L'istruzione `continue` interrompe l'iterazione corrente del ciclo e passa direttamente alla successiva iterazione, saltando il resto del codice all'interno del ciclo per l'iterazione corrente.

### Sintassi

```python
for elemento in sequenza:
    if condizione:
        continue
    # Questo codice viene saltato se la condizione è vera
    # e l'esecuzione passa alla prossima iterazione
```

### Esempi di utilizzo di continue

#### Saltare elementi specifici in un ciclo

```python
numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

print("Stampo solo i numeri dispari:")
for numero in numeri:
    if numero % 2 == 0:  # Se il numero è pari
        continue  # Salta il resto del ciclo e passa al prossimo numero
    print(numero)

# Output:
# Stampo solo i numeri dispari:
# 1
# 3
# 5
# 7
# 9
```

#### Filtrare input non validi

```python
while True:
    valore = input("Inserisci un numero positivo (o 'q' per uscire): ")
    
    if valore.lower() == 'q':
        break
    
    if not valore.isdigit() or int(valore) <= 0:
        print("Input non valido. Inserisci un numero positivo.")
        continue
    
    numero = int(valore)
    print(f"Hai inserito il numero valido: {numero}")
    # Altre operazioni con il numero...
```

## La clausola else nei cicli

In Python, sia i cicli `for` che i cicli `while` possono avere una clausola `else` opzionale. Il blocco di codice nella clausola `else` viene eseguito quando il ciclo termina normalmente (cioè, non a causa di un'istruzione `break`).

### Sintassi

```python
for elemento in sequenza:
    # Corpo del ciclo
else:
    # Questo blocco viene eseguito se il ciclo termina normalmente
    # (non a causa di un break)
```

```python
while condizione:
    # Corpo del ciclo
else:
    # Questo blocco viene eseguito se il ciclo termina normalmente
    # (non a causa di un break)
```

### Esempi di utilizzo della clausola else

#### Verifica se un elemento è presente in una sequenza

```python
numeri = [1, 3, 5, 7, 9]
target = 6

for numero in numeri:
    if numero == target:
        print(f"Trovato {target} nella lista!")
        break
else:
    print(f"{target} non è presente nella lista")

# Output:
# 6 non è presente nella lista

# Proviamo con un numero presente nella lista
target = 5
for numero in numeri:
    if numero == target:
        print(f"Trovato {target} nella lista!")
        break
else:
    print(f"{target} non è presente nella lista")

# Output:
# Trovato 5 nella lista!
```

#### Verifica della condizione di uscita in un ciclo while

```python
contatore = 0
max_tentativi = 3

while contatore < max_tentativi:
    password = input("Inserisci la password: ")
    if password == "segreto":
        print("Password corretta!")
        break
    contatore += 1
else:
    print(f"Hai esaurito i {max_tentativi} tentativi disponibili.")
```

## Combinazione di break, continue e else

Le istruzioni `break`, `continue` e la clausola `else` possono essere combinate per creare logiche di controllo complesse nei cicli.

### Esempio: Ricerca di numeri primi

```python
def is_prime(n):
    """Verifica se un numero è primo"""
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

# Trova tutti i numeri primi in un intervallo
inizio = 10
fine = 30

print(f"Numeri primi tra {inizio} e {fine}:")
for num in range(inizio, fine + 1):
    # Salta i numeri pari (tranne 2)
    if num > 2 and num % 2 == 0:
        continue
    
    # Verifica se il numero è primo
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            # Non è primo, passa al prossimo numero
            break
    else:
        # Questo blocco viene eseguito se il ciclo interno termina normalmente
        # (cioè, non è stato trovato alcun divisore)
        print(num, end=" ")

# Output:
# Numeri primi tra 10 e 30: 11 13 17 19 23 29
```

## Cicli annidati e istruzioni di controllo

Quando si utilizzano cicli annidati, le istruzioni `break` e `continue` influenzano solo il ciclo più interno in cui si trovano. Per interrompere cicli esterni, è necessario utilizzare tecniche aggiuntive.

### Esempio: Uscire da cicli annidati

```python
trovato = False

for i in range(5):
    for j in range(5):
        if i * j > 10:
            print(f"Trovato: i={i}, j={j}, prodotto={i*j}")
            trovato = True
            break  # Interrompe solo il ciclo interno
    if trovato:
        break  # Interrompe il ciclo esterno

# Output:
# Trovato: i=3, j=4, prodotto=12
```

Un'alternativa più elegante è utilizzare una funzione e l'istruzione `return`:

```python
def trova_prodotto():
    for i in range(5):
        for j in range(5):
            if i * j > 10:
                return i, j, i*j  # Esce immediatamente da entrambi i cicli
    return None, None, None  # Se non viene trovato nulla

i, j, prodotto = trova_prodotto()
if i is not None:
    print(f"Trovato: i={i}, j={j}, prodotto={prodotto}")

# Output:
# Trovato: i=3, j=4, prodotto=12
```

## Casi d'uso comuni

### Validazione dell'input

```python
def ottieni_numero_positivo():
    while True:
        try:
            valore = input("Inserisci un numero positivo: ")
            if valore.lower() == 'q':
                return None  # Uscita con valore speciale
            
            numero = float(valore)
            if numero <= 0:
                print("Il numero deve essere positivo.")
                continue
            
            return numero  # Ritorna il numero valido
        except ValueError:
            print("Input non valido. Inserisci un numero.")
            continue
```

### Ricerca in strutture dati

```python
def trova_elemento(matrice, target):
    """Cerca un elemento in una matrice 2D"""
    for i, riga in enumerate(matrice):
        for j, elemento in enumerate(riga):
            if elemento == target:
                return True, (i, j)  # Elemento trovato con posizione
    return False, None  # Elemento non trovato

# Esempio di utilizzo
matrice = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

trovato, posizione = trova_elemento(matrice, 5)
if trovato:
    print(f"Elemento trovato in posizione {posizione}")
else:
    print("Elemento non trovato")

# Output:
# Elemento trovato in posizione (1, 1)
```

### Elaborazione di file

```python
def processa_file(file_path, parola_chiave):
    """Cerca una parola chiave in un file e restituisce le righe che la contengono"""
    risultati = []
    try:
        with open(file_path, 'r') as file:
            for numero_riga, riga in enumerate(file, 1):
                if parola_chiave.lower() in riga.lower():
                    risultati.append((numero_riga, riga.strip()))
    except FileNotFoundError:
        print(f"Il file {file_path} non esiste.")
    except Exception as e:
        print(f"Errore durante la lettura del file: {e}")
    
    return risultati
```

## Conclusione

Le istruzioni di controllo `break`, `continue` e la clausola `else` sono strumenti potenti che permettono di controllare con precisione il flusso di esecuzione nei cicli. Utilizzate correttamente, queste istruzioni possono rendere il codice più efficiente, leggibile e robusto.

Ecco alcuni consigli pratici:

1. Usa `break` quando vuoi uscire completamente da un ciclo prima che tutte le iterazioni siano completate
2. Usa `continue` quando vuoi saltare il resto del codice per l'iterazione corrente e passare alla successiva
3. Usa la clausola `else` quando vuoi eseguire del codice solo se il ciclo termina normalmente (senza `break`)
4. Per uscire da cicli annidati, considera l'utilizzo di funzioni con `return` o variabili di controllo

Padroneggiare queste istruzioni di controllo ti permetterà di scrivere codice Python più elegante ed efficiente.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Iteratori e Generatori](./04_iteratori_generatori.md)