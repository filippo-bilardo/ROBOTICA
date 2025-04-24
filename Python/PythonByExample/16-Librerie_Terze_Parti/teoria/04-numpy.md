# NumPy: Calcolo Numerico in Python

## Cos'è NumPy?

NumPy (Numerical Python) è una delle librerie più fondamentali nell'ecosistema Python per il calcolo scientifico. Fornisce supporto per array multidimensionali, funzioni matematiche avanzate e strumenti per lavorare con questi array in modo efficiente.

NumPy è alla base di molte altre librerie scientifiche come Pandas, SciPy, e scikit-learn, rendendola essenziale per chiunque lavori con dati numerici in Python.

## Perché usare NumPy?

- **Efficienza**: Gli array NumPy sono molto più efficienti degli equivalenti liste Python
- **Funzionalità matematiche**: Offre numerose funzioni matematiche ottimizzate
- **Operazioni vettorizzate**: Permette di eseguire operazioni su interi array senza cicli espliciti
- **Integrazione**: Si integra perfettamente con altre librerie scientifiche
- **Performance**: Parti critiche sono implementate in C per massimizzare le prestazioni

## Installazione

Per installare NumPy, usa pip:

```bash
pip install numpy
```

O con Anaconda:

```bash
conda install numpy
```

## Concetti Fondamentali

### Array NumPy

L'oggetto principale di NumPy è l'array multidimensionale (`ndarray`). A differenza delle liste Python, gli array NumPy:

- Hanno dimensione fissa
- Contengono elementi dello stesso tipo
- Supportano operazioni matematiche vettorizzate

### Creazione di Array

```python
import numpy as np

# Da liste Python
array_1d = np.array([1, 2, 3, 4, 5])
array_2d = np.array([[1, 2, 3], [4, 5, 6]])

# Array con valori specifici
zeros = np.zeros((3, 4))  # Array 3x4 di zeri
ones = np.ones((2, 3))    # Array 2x3 di uni
full = np.full((2, 2), 7)  # Array 2x2 riempito con 7

# Array con sequenze
range_array = np.arange(0, 10, 2)  # [0, 2, 4, 6, 8]
linspace = np.linspace(0, 1, 5)    # 5 numeri equidistanti tra 0 e 1

# Array casuali
random_array = np.random.random((2, 3))  # Valori casuali tra 0 e 1
```

### Proprietà degli Array

```python
array_2d = np.array([[1, 2, 3], [4, 5, 6]])

print(array_2d.shape)    # Dimensioni: (2, 3)
print(array_2d.ndim)     # Numero di dimensioni: 2
print(array_2d.size)     # Numero totale di elementi: 6
print(array_2d.dtype)    # Tipo di dati: int64
```

### Indicizzazione e Slicing

```python
array_2d = np.array([[1, 2, 3], [4, 5, 6]])

# Accesso a elementi singoli
print(array_2d[0, 0])    # 1 (prima riga, prima colonna)
print(array_2d[1, 2])    # 6 (seconda riga, terza colonna)

# Slicing
print(array_2d[:, 1])    # [2, 5] (seconda colonna)
print(array_2d[0, :])    # [1, 2, 3] (prima riga)
print(array_2d[0:2, 1:3])  # [[2, 3], [5, 6]] (sottomatrice)
```

## Operazioni Matematiche

### Operazioni Elementwise

```python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print(a + b)      # [5, 7, 9]
print(a - b)      # [-3, -3, -3]
print(a * b)      # [4, 10, 18]
print(a / b)      # [0.25, 0.4, 0.5]
print(a ** 2)     # [1, 4, 9]
print(np.sqrt(a)) # [1., 1.41421356, 1.73205081]
```

### Operazioni di Aggregazione

```python
array = np.array([[1, 2, 3], [4, 5, 6]])

print(np.sum(array))           # 21 (somma di tutti gli elementi)
print(np.sum(array, axis=0))   # [5, 7, 9] (somma per colonna)
print(np.sum(array, axis=1))   # [6, 15] (somma per riga)

print(np.min(array))           # 1 (minimo)
print(np.max(array))           # 6 (massimo)
print(np.mean(array))          # 3.5 (media)
print(np.median(array))        # 3.5 (mediana)
print(np.std(array))           # 1.707825127659933 (deviazione standard)
```

### Operazioni Matriciali

```python
a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6], [7, 8]])

# Prodotto matriciale
print(np.dot(a, b))     # [[19, 22], [43, 50]]
print(a @ b)            # Equivalente a np.dot(a, b) in Python 3.5+

# Trasposizione
print(a.T)              # [[1, 3], [2, 4]]

# Determinante
print(np.linalg.det(a)) # -2.0

# Inversa
print(np.linalg.inv(a)) # [[-2. ,  1. ], [ 1.5, -0.5]]
```

## Reshaping e Manipolazione

```python
array = np.arange(12)

# Reshape
reshaped = array.reshape(3, 4)  # Converte in array 3x4
print(reshaped)

# Flatten
flattened = reshaped.flatten()  # Converte in array 1D
print(flattened)

# Transpose
transposed = reshaped.T         # Traspone l'array
print(transposed)

# Concatenazione
a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6], [7, 8]])

vertical = np.vstack((a, b))    # Concatenazione verticale
print(vertical)

horizontal = np.hstack((a, b))  # Concatenazione orizzontale
print(horizontal)
```

## Broadcasting

NumPy permette operazioni tra array di forme diverse attraverso il broadcasting:

```python
a = np.array([[1, 2, 3], [4, 5, 6]])
b = np.array([10, 20, 30])

print(a + b)  # [[11, 22, 33], [14, 25, 36]]
```

Il vettore `b` viene "trasmesso" su ogni riga di `a` prima dell'addizione.

## Esempio Pratico: Analisi di Dati

```python
import numpy as np
import matplotlib.pyplot as plt

# Generare dati casuali
np.random.seed(0)
altezze = np.random.normal(170, 10, 1000)  # 1000 altezze con media 170cm e deviazione standard 10cm

# Statistiche di base
print(f"Media: {np.mean(altezze):.2f} cm")
print(f"Mediana: {np.median(altezze):.2f} cm")
print(f"Deviazione standard: {np.std(altezze):.2f} cm")
print(f"Minimo: {np.min(altezze):.2f} cm")
print(f"Massimo: {np.max(altezze):.2f} cm")

# Istogramma
plt.hist(altezze, bins=30, alpha=0.7)
plt.title('Distribuzione delle Altezze')
plt.xlabel('Altezza (cm)')
plt.ylabel('Frequenza')
plt.grid(True, alpha=0.3)
plt.show()
```

## Conclusione

NumPy è una libreria fondamentale per il calcolo scientifico in Python. La sua efficienza e versatilità la rendono indispensabile per chiunque lavori con dati numerici, dall'analisi statistica all'apprendimento automatico, dalla fisica computazionale all'elaborazione di immagini.

La padronanza di NumPy apre le porte a molte altre librerie scientifiche nell'ecosistema Python, come Pandas, SciPy, scikit-learn e TensorFlow.

## Risorse Aggiuntive

- [Documentazione ufficiale di NumPy](https://numpy.org/doc/stable/)
- [NumPy Cheat Sheet](https://s3.amazonaws.com/assets.datacamp.com/blog_assets/Numpy_Python_Cheat_Sheet.pdf)
- [NumPy Tutorials](https://numpy.org/numpy-tutorials/)

## Navigazione

- [Torna all'indice delle librerie](../README.md)
- [Libreria precedente: Pandas](03-pandas.md)
- [Libreria successiva: Matplotlib](05-matplotlib.md)