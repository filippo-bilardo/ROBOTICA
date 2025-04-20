# Tipi di dati numerici: int, float, complex

## Introduzione ai tipi numerici in Python
Python supporta diversi tipi di dati numerici per rappresentare numeri di vario genere. I tre tipi numerici principali sono:
- **int**: per rappresentare numeri interi
- **float**: per rappresentare numeri in virgola mobile (decimali)
- **complex**: per rappresentare numeri complessi

Ognuno di questi tipi ha caratteristiche specifiche e usi particolari.

## Numeri interi (int)
I numeri interi in Python sono rappresentati dal tipo `int`. A differenza di altri linguaggi di programmazione, Python non ha limiti predefiniti per la dimensione degli interi (a parte la memoria disponibile).

```python
# Esempi di numeri interi
a = 10
b = -5
c = 0
d = 1000000000000000000000  # Python gestisce facilmente numeri molto grandi

print(type(a))  # Output: <class 'int'>
```

### Rappresentazioni alternative degli interi
Python permette di rappresentare gli interi in diverse basi numeriche:

```python
# Rappresentazioni alternative
binario = 0b1010      # Binario (base 2) - prefisso 0b
ottale = 0o12         # Ottale (base 8) - prefisso 0o
esadecimale = 0xA     # Esadecimale (base 16) - prefisso 0x

print(binario)       # Output: 10 (conversione automatica in decimale)
print(ottale)        # Output: 10
print(esadecimale)   # Output: 10
```

## Numeri in virgola mobile (float)
I numeri in virgola mobile, o decimali, sono rappresentati dal tipo `float`. Questi numeri sono memorizzati seguendo lo standard IEEE 754 a doppia precisione.

```python
# Esempi di numeri float
x = 3.14
y = -0.001
z = 2.0        # Anche se è un numero intero, il .0 lo rende un float

print(type(x))  # Output: <class 'float'>
```

### Notazione scientifica
Per numeri molto grandi o molto piccoli, è possibile utilizzare la notazione scientifica:

```python
# Notazione scientifica
avogadro = 6.022e23    # 6.022 × 10^23
piccolo = 1.6e-19      # 1.6 × 10^-19

print(avogadro)       # Output: 6.022e+23
print(piccolo)        # Output: 1.6e-19
```

### Limiti e precisione dei float
I numeri float hanno una precisione limitata e possono portare a risultati inaspettati in alcune operazioni aritmetiche:

```python
# Problemi di precisione con i float
print(0.1 + 0.2)      # Output: 0.30000000000000004 (non esattamente 0.3)

# Per confronti di uguaglianza, è meglio usare una tolleranza
import math
print(math.isclose(0.1 + 0.2, 0.3))  # Output: True
```

## Numeri complessi (complex)
I numeri complessi sono rappresentati dal tipo `complex`. Un numero complesso ha una parte reale e una parte immaginaria, dove la parte immaginaria è seguita dalla lettera `j`.

```python
# Esempi di numeri complessi
c1 = 2 + 3j      # Numero complesso con parte reale 2 e parte immaginaria 3
c2 = complex(4, 5)  # Altro modo per creare un numero complesso

print(type(c1))   # Output: <class 'complex'>
print(c1.real)    # Output: 2.0 (parte reale)
print(c1.imag)    # Output: 3.0 (parte immaginaria)
```

### Operazioni con numeri complessi
Python supporta tutte le operazioni aritmetiche standard con i numeri complessi:

```python
# Operazioni con numeri complessi
c1 = 2 + 3j
c2 = 1 - 2j

print(c1 + c2)    # Output: (3+1j)
print(c1 * c2)    # Output: (8-1j)
print(c1 / c2)    # Output: (-0.2+1.4j)
print(abs(c1))    # Output: 3.605551275463989 (modulo del numero complesso)
```

## Conversione tra tipi numerici
Python permette di convertire facilmente tra i diversi tipi numerici:

```python
# Conversione tra tipi numerici
i = 10
f = float(i)     # Conversione da int a float
print(f)         # Output: 10.0

f = 3.14
i = int(f)       # Conversione da float a int (tronca la parte decimale)
print(i)         # Output: 3

i = 5
c = complex(i)   # Conversione da int a complex
print(c)         # Output: (5+0j)
```

## Funzioni matematiche
Python offre molte funzioni matematiche attraverso il modulo `math` per operazioni più avanzate:

```python
import math

# Funzioni matematiche comuni
print(math.sqrt(16))      # Radice quadrata: 4.0
print(math.pow(2, 3))     # Potenza: 8.0
print(math.sin(math.pi/2))  # Seno: 1.0
print(math.log10(100))    # Logaritmo in base 10: 2.0
print(math.ceil(4.3))     # Arrotondamento per eccesso: 5
print(math.floor(4.7))    # Arrotondamento per difetto: 4
```

## Conclusione
I tipi numerici in Python offrono una grande flessibilità per rappresentare e manipolare numeri di vario genere. La scelta del tipo numerico dipende dalle esigenze specifiche dell'applicazione: gli interi sono ideali per conteggi e indici, i float per misurazioni e calcoli scientifici, e i numeri complessi per applicazioni in campi come l'ingegneria elettrica, la fisica quantistica e l'analisi dei segnali.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Cos'è una variabile in Python](./01_variabili.md) | [Prossimo: Stringhe e operazioni sulle stringhe](./03_stringhe.md)