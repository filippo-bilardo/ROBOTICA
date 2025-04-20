# Tipi booleani e operazioni logiche

## Introduzione ai tipi booleani
Il tipo booleano (`bool`) in Python rappresenta uno dei due valori di verità: `True` (vero) o `False` (falso). I valori booleani sono fondamentali per il controllo del flusso di un programma attraverso strutture condizionali e cicli.

```python
# Dichiarazione di variabili booleane
vero = True
falso = False

print(type(vero))  # Output: <class 'bool'>
```

## Espressioni booleane
Le espressioni booleane sono espressioni che, quando valutate, restituiscono un valore booleano. Queste espressioni sono spesso utilizzate nelle istruzioni condizionali.

```python
# Esempi di espressioni booleane
x = 5
y = 10

print(x < y)   # True
print(x > y)   # False
print(x == y)  # False (uguaglianza)
print(x != y)  # True (disuguaglianza)
print(x <= y)  # True
print(x >= y)  # False
```

## Operatori logici
Python fornisce tre operatori logici principali per combinare o modificare espressioni booleane.

### Operatore `and`
L'operatore `and` restituisce `True` se entrambe le espressioni sono vere, altrimenti restituisce `False`.

```python
x = 5
y = 10
z = 15

print(x < y and y < z)  # True (entrambe le condizioni sono vere)
print(x < y and y > z)  # False (la seconda condizione è falsa)
```

### Operatore `or`
L'operatore `or` restituisce `True` se almeno una delle espressioni è vera, altrimenti restituisce `False`.

```python
x = 5
y = 10
z = 15

print(x > y or y < z)  # True (la seconda condizione è vera)
print(x > y or y > z)  # False (entrambe le condizioni sono false)
```

### Operatore `not`
L'operatore `not` inverte il valore di verità di un'espressione.

```python
x = 5
y = 10

print(not x > y)  # True (inverte False in True)
print(not x < y)  # False (inverte True in False)
```

## Tabelle di verità
Le tabelle di verità mostrano tutti i possibili risultati delle operazioni logiche.

### Tabella di verità per `and`
```
A       B       A and B
True    True    True
True    False   False
False   True    False
False   False   False
```

### Tabella di verità per `or`
```
A       B       A or B
True    True    True
True    False   True
False   True    True
False   False   False
```

### Tabella di verità per `not`
```
A       not A
True    False
False   True
```

## Valori truthy e falsy
In Python, tutti i valori possono essere interpretati come booleani in un contesto condizionale. Alcuni valori sono considerati "falsy" (valutati come `False`), mentre tutti gli altri sono considerati "truthy" (valutati come `True`).

Valori falsy in Python:
- `False`
- `None`
- `0` (zero intero)
- `0.0` (zero float)
- `''` (stringa vuota)
- `[]` (lista vuota)
- `()` (tupla vuota)
- `{}` (dizionario vuoto)
- `set()` (insieme vuoto)

Tutti gli altri valori sono considerati truthy.

```python
# Esempi di valori truthy e falsy
if 0:
    print("Questo non verrà stampato")  # 0 è falsy

if 1:
    print("Questo verrà stampato")  # 1 è truthy

if "":
    print("Questo non verrà stampato")  # stringa vuota è falsy

if "Python":
    print("Questo verrà stampato")  # stringa non vuota è truthy

if []:
    print("Questo non verrà stampato")  # lista vuota è falsy

if [1, 2, 3]:
    print("Questo verrà stampato")  # lista non vuota è truthy
```

## Cortocircuito degli operatori logici
Gli operatori `and` e `or` in Python utilizzano la valutazione a cortocircuito, il che significa che non valutano necessariamente entrambe le espressioni.

- Per `and`, se la prima espressione è falsa, la seconda non viene valutata perché il risultato sarà comunque falso.
- Per `or`, se la prima espressione è vera, la seconda non viene valutata perché il risultato sarà comunque vero.

```python
# Esempi di cortocircuito
x = 5

# and: la seconda espressione non viene valutata
risultato = x > 10 and print("Questo non verrà stampato")
print(risultato)  # False

# or: la seconda espressione non viene valutata
risultato = x > 0 or print("Questo non verrà stampato")
print(risultato)  # True
```

## Operatore ternario
Python supporta un operatore ternario che permette di scrivere espressioni condizionali in una singola riga.

```python
# Operatore ternario: valore_se_vero if condizione else valore_se_falso
età = 20
stato = "maggiorenne" if età >= 18 else "minorenne"
print(stato)  # "maggiorenne"
```

## Conclusione
I tipi booleani e le operazioni logiche sono fondamentali in Python e in qualsiasi linguaggio di programmazione. Essi permettono di controllare il flusso del programma e di prendere decisioni basate su condizioni. La comprensione di come funzionano i valori booleani, gli operatori logici e le espressioni condizionali è essenziale per scrivere programmi efficaci e corretti.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Stringhe e operazioni sulle stringhe](./03_stringhe.md) | [Prossimo: Conversione tra tipi di dati](./05_conversione_tipi.md)