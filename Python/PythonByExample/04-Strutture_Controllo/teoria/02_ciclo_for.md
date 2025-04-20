# Il Ciclo For in Python

## Cosa è il ciclo for
Il ciclo `for` in Python è una struttura di controllo che permette di iterare su una sequenza (come una lista, tupla, dizionario, set o stringa) ed eseguire un blocco di codice per ogni elemento della sequenza. A differenza di altri linguaggi di programmazione, il ciclo `for` in Python è più simile a quello che in altri linguaggi viene chiamato "foreach".

## Sintassi di base

```python
for elemento in sequenza:
    # blocco di codice da eseguire per ogni elemento
```

Dove:
- `elemento` è una variabile che assume il valore di ciascun elemento della sequenza ad ogni iterazione
- `sequenza` è l'oggetto iterabile su cui si vuole ciclare

## Esempi di base del ciclo for

### Iterazione su una lista

```python
frutta = ["mela", "banana", "arancia", "kiwi"]
for frutto in frutta:
    print(frutto)

# Output:
# mela
# banana
# arancia
# kiwi
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

### Iterazione su un range di numeri

```python
# range(stop) - genera numeri da 0 a stop-1
for i in range(5):
    print(i)

# Output:
# 0
# 1
# 2
# 3
# 4

# range(start, stop) - genera numeri da start a stop-1
for i in range(2, 6):
    print(i)

# Output:
# 2
# 3
# 4
# 5

# range(start, stop, step) - genera numeri da start a stop-1 con incremento step
for i in range(1, 10, 2):
    print(i)

# Output:
# 1
# 3
# 5
# 7
# 9
```

## Iterazione su strutture dati

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

# Iterazione sulle chiavi (esplicito)
for chiave in persona.keys():
    print(chiave)

# Iterazione sui valori
for valore in persona.values():
    print(valore)

# Output:
# Mario
# 30
# Roma

# Iterazione su coppie chiave-valore
for chiave, valore in persona.items():
    print(f"{chiave}: {valore}")

# Output:
# nome: Mario
# età: 30
# città: Roma
```

### Iterazione su una tupla

```python
colori = ("rosso", "verde", "blu")
for colore in colori:
    print(colore)

# Output:
# rosso
# verde
# blu
```

### Iterazione su un set

```python
lingue = {"italiano", "inglese", "francese", "spagnolo"}
for lingua in lingue:
    print(lingua)

# Nota: l'ordine potrebbe variare poiché i set non mantengono un ordine specifico
```

## Tecniche avanzate di iterazione

### Enumerate: ottenere indice e valore

```python
frutta = ["mela", "banana", "arancia", "kiwi"]
for indice, frutto in enumerate(frutta):
    print(f"Indice {indice}: {frutto}")

# Output:
# Indice 0: mela
# Indice 1: banana
# Indice 2: arancia
# Indice 3: kiwi

# È possibile specificare un valore di partenza per l'indice
for indice, frutto in enumerate(frutta, start=1):
    print(f"Elemento {indice}: {frutto}")

# Output:
# Elemento 1: mela
# Elemento 2: banana
# Elemento 3: arancia
# Elemento 4: kiwi
```

### Zip: iterare su più sequenze contemporaneamente

```python
nomi = ["Mario", "Luigi", "Peach"]
punteggi = [95, 87, 92]

for nome, punteggio in zip(nomi, punteggi):
    print(f"{nome} ha ottenuto {punteggio} punti")

# Output:
# Mario ha ottenuto 95 punti
# Luigi ha ottenuto 87 punti
# Peach ha ottenuto 92 punti

# Zip si ferma quando la sequenza più corta è esaurita
altezze = [175, 180]
for nome, punteggio, altezza in zip(nomi, punteggi, altezze):
    print(f"{nome} ha ottenuto {punteggio} punti ed è alto {altezza} cm")

# Output:
# Mario ha ottenuto 95 punti ed è alto 175 cm
# Luigi ha ottenuto 87 punti ed è alto 180 cm
```

### Sorted: iterare in ordine

```python
numeri = [5, 2, 8, 1, 9]
for numero in sorted(numeri):
    print(numero)

# Output:
# 1
# 2
# 5
# 8
# 9

# Ordine decrescente
for numero in sorted(numeri, reverse=True):
    print(numero)

# Output:
# 9
# 8
# 5
# 2
# 1

# Ordinamento personalizzato (per lunghezza della parola)
parole = ["cane", "gatto", "elefante", "topo"]
for parola in sorted(parole, key=len):
    print(parola)

# Output:
# topo
# cane
# gatto
# elefante
```

### Reversed: iterare in ordine inverso

```python
numeri = [1, 2, 3, 4, 5]
for numero in reversed(numeri):
    print(numero)

# Output:
# 5
# 4
# 3
# 2
# 1
```

## Comprensioni di lista con cicli for
Le comprensioni di lista offrono un modo conciso per creare liste utilizzando cicli for.

```python
# Creare una lista dei quadrati dei numeri da 0 a 9
quadrati = [x**2 for x in range(10)]
print(quadrati)  # Output: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Comprensione di lista con condizione
pari = [x for x in range(20) if x % 2 == 0]
print(pari)  # Output: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# Comprensione di lista con trasformazione condizionale
numeri = [1, 2, 3, 4, 5]
risultato = [x*2 if x % 2 == 0 else x*3 for x in numeri]
print(risultato)  # Output: [3, 4, 9, 8, 15]
```

## Cicli for annidati
È possibile annidare cicli for uno dentro l'altro per iterare su strutture dati multidimensionali o per generare combinazioni.

```python
# Iterazione su una matrice (lista di liste)
matrice = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

for riga in matrice:
    for elemento in riga:
        print(elemento, end=" ")
    print()  # Vai a capo dopo ogni riga

# Output:
# 1 2 3
# 4 5 6
# 7 8 9

# Generazione di tutte le combinazioni di due liste
colori = ["rosso", "verde", "blu"]
formati = ["cerchio", "quadrato"]

for colore in colori:
    for formato in formati:
        print(f"{colore} {formato}")

# Output:
# rosso cerchio
# rosso quadrato
# verde cerchio
# verde quadrato
# blu cerchio
# blu quadrato
```

## Controllo del flusso nei cicli for

### Break: uscire dal ciclo

```python
numeri = [1, 3, 5, 7, 9, 2, 4, 6, 8]
for numero in numeri:
    if numero % 2 == 0:
        print(f"Trovato il primo numero pari: {numero}")
        break  # Esce dal ciclo quando trova il primo numero pari

# Output: Trovato il primo numero pari: 2
```

### Continue: saltare all'iterazione successiva

```python
numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
for numero in numeri:
    if numero % 2 == 0:
        continue  # Salta i numeri pari
    print(numero)

# Output:
# 1
# 3
# 5
# 7
# 9
```

### Else: eseguire codice dopo il completamento del ciclo

```python
# L'else viene eseguito solo se il ciclo termina normalmente (senza break)
numeri = [1, 3, 5, 7, 9]
for numero in numeri:
    if numero % 2 == 0:
        print(f"Trovato un numero pari: {numero}")
        break
else:
    print("Nessun numero pari trovato")

# Output: Nessun numero pari trovato

# Con break
numeri = [1, 3, 5, 7, 9, 2]
for numero in numeri:
    if numero % 2 == 0:
        print(f"Trovato un numero pari: {numero}")
        break
else:
    print("Nessun numero pari trovato")

# Output: Trovato un numero pari: 2
```

## Pass: ciclo vuoto

```python
# Pass è un'operazione nulla, utile come segnaposto
for i in range(5):
    pass  # Non fa nulla, ma il ciclo è sintatticamente valido
```

## Best practices per i cicli for

1. **Usa enumerate() quando hai bisogno dell'indice**: Invece di usare un contatore separato, usa `enumerate()` per ottenere sia l'indice che il valore.

2. **Preferisci le comprensioni di lista per operazioni semplici**: Le comprensioni di lista sono più concise e spesso più efficienti per operazioni semplici di trasformazione o filtraggio.

3. **Evita di modificare la sequenza durante l'iterazione**: Modificare una sequenza mentre la stai iterando può portare a comportamenti imprevisti. Se necessario, itera su una copia della sequenza.

```python
numeri = [1, 2, 3, 4, 5]
# Non fare questo:
for i in range(len(numeri)):
    if numeri[i] % 2 == 0:
        numeri.remove(numeri[i])  # Problematico!

# Meglio così:
numeri = [1, 2, 3, 4, 5]
numeri = [x for x in numeri if x % 2 != 0]  # Rimuove i numeri pari
```

4. **Usa zip() per iterare su più sequenze**: Quando devi iterare su più sequenze contemporaneamente, usa `zip()` invece di accedere agli elementi tramite indice.

5. **Limita la complessità dei cicli annidati**: I cicli annidati possono diventare inefficienti con grandi quantità di dati. Cerca alternative quando possibile.

## Conclusione
Il ciclo `for` è uno strumento potente e flessibile in Python che ti permette di iterare su qualsiasi tipo di sequenza. Combinato con altre funzionalità come `enumerate()`, `zip()`, comprensioni di lista e istruzioni di controllo del flusso, il ciclo `for` ti consente di scrivere codice conciso ed espressivo per una vasta gamma di compiti di iterazione.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Istruzioni condizionali](./01_condizionali.md) | [Prossimo: Ciclo while](./03_ciclo_while.md)