# Matplotlib: Visualizzazione dei Dati in Python

## Cos'è Matplotlib?

Matplotlib è una libreria di visualizzazione completa per Python, utilizzata per creare grafici statici, interattivi e animati. È stata creata da John Hunter nel 2003 ed è diventata uno standard de facto per la visualizzazione dei dati nell'ecosistema Python scientifico.

Matplotlib offre un'API simile a MATLAB, rendendola familiare per chi proviene da quell'ambiente, ma si integra perfettamente con l'ecosistema Python.

## Perché usare Matplotlib?

- **Versatilità**: Permette di creare una vasta gamma di visualizzazioni, dai semplici grafici a linee a complesse visualizzazioni 3D
- **Personalizzazione**: Offre un controllo dettagliato su ogni aspetto dei grafici
- **Integrazione**: Si integra perfettamente con NumPy, Pandas e altre librerie scientifiche
- **Esportazione**: Supporta l'esportazione in vari formati (PNG, PDF, SVG, ecc.)
- **Estensibilità**: Può essere estesa con librerie come Seaborn per visualizzazioni statistiche più avanzate

## Installazione

Per installare Matplotlib, usa pip:

```bash
pip install matplotlib
```

O con Anaconda:

```bash
conda install matplotlib
```

## Concetti Fondamentali

### Figure e Assi

In Matplotlib, una visualizzazione è organizzata in:

- **Figure**: Il contenitore di livello superiore che può contenere uno o più assi
- **Axes**: Lo spazio in cui vengono disegnati i dati, con sistema di coordinate

```python
import matplotlib.pyplot as plt
import numpy as np

# Creare una figura e un set di assi
fig, ax = plt.subplots()

# Generare dati
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Disegnare i dati
ax.plot(x, y)

# Aggiungere titolo e etichette
ax.set_title('Funzione Seno')
ax.set_xlabel('x')
ax.set_ylabel('sin(x)')

# Mostrare il grafico
plt.show()
```

### Interfaccia pyplot

Matplotlib offre due interfacce principali:

1. **Interfaccia orientata agli oggetti**: Più flessibile e potente
2. **Interfaccia pyplot**: Più semplice e simile a MATLAB

Ecco lo stesso esempio usando l'interfaccia pyplot:

```python
import matplotlib.pyplot as plt
import numpy as np

# Generare dati
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Disegnare i dati
plt.plot(x, y)

# Aggiungere titolo e etichette
plt.title('Funzione Seno')
plt.xlabel('x')
plt.ylabel('sin(x)')

# Mostrare il grafico
plt.show()
```

## Tipi di Grafici

### Grafici a Linee

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)

plt.figure(figsize=(10, 6))
plt.plot(x, np.sin(x), label='sin(x)')
plt.plot(x, np.cos(x), label='cos(x)')
plt.plot(x, np.exp(-x/3), label='exp(-x/3)')

plt.title('Grafici a Linee')
plt.xlabel('x')
plt.ylabel('y')
plt.legend()
plt.grid(True)
plt.show()
```

### Grafici a Dispersione (Scatter)

```python
import matplotlib.pyplot as plt
import numpy as np

# Generare dati casuali
np.random.seed(42)
x = np.random.rand(50)
y = np.random.rand(50)
colors = np.random.rand(50)
sizes = 1000 * np.random.rand(50)

plt.figure(figsize=(10, 6))
plt.scatter(x, y, c=colors, s=sizes, alpha=0.7)

plt.title('Grafico a Dispersione')
plt.xlabel('x')
plt.ylabel('y')
plt.colorbar(label='Valore colore')
plt.show()
```

### Istogrammi

```python
import matplotlib.pyplot as plt
import numpy as np

# Generare dati casuali
np.random.seed(42)
data = np.random.normal(0, 1, 1000)  # Distribuzione normale

plt.figure(figsize=(10, 6))
plt.hist(data, bins=30, alpha=0.7, color='skyblue', edgecolor='black')

plt.title('Istogramma')
plt.xlabel('Valore')
plt.ylabel('Frequenza')
plt.grid(True, alpha=0.3)
plt.show()
```

### Grafici a Barre

```python
import matplotlib.pyplot as plt
import numpy as np

categorie = ['A', 'B', 'C', 'D', 'E']
valori = [3, 7, 2, 5, 8]

plt.figure(figsize=(10, 6))
plt.bar(categorie, valori, color='teal')

plt.title('Grafico a Barre')
plt.xlabel('Categoria')
plt.ylabel('Valore')
plt.grid(True, axis='y', alpha=0.3)
plt.show()
```

### Grafici a Torta

```python
import matplotlib.pyplot as plt

categorie = ['A', 'B', 'C', 'D', 'E']
valori = [15, 30, 25, 10, 20]

plt.figure(figsize=(10, 6))
plt.pie(valori, labels=categorie, autopct='%1.1f%%', startangle=90, shadow=True)

plt.title('Grafico a Torta')
plt.axis('equal')  # Assicura che il grafico sia circolare
plt.show()
```

### Box Plot

```python
import matplotlib.pyplot as plt
import numpy as np

# Generare dati casuali
np.random.seed(42)
data = [np.random.normal(0, std, 100) for std in range(1, 6)]

plt.figure(figsize=(10, 6))
plt.boxplot(data, patch_artist=True)

plt.title('Box Plot')
plt.xlabel('Gruppo')
plt.ylabel('Valore')
plt.grid(True, axis='y', alpha=0.3)
plt.show()
```

## Personalizzazione dei Grafici

### Stili e Colori

```python
import matplotlib.pyplot as plt
import numpy as np

# Visualizzare gli stili disponibili
print(plt.style.available)

# Utilizzare uno stile
plt.style.use('seaborn-darkgrid')

x = np.linspace(0, 10, 100)

plt.figure(figsize=(10, 6))
plt.plot(x, np.sin(x), 'r-', linewidth=2, label='sin(x)')
plt.plot(x, np.cos(x), 'b--', linewidth=2, label='cos(x)')

plt.title('Grafico con Stile Personalizzato')
plt.xlabel('x')
plt.ylabel('y')
plt.legend()
plt.show()
```

### Sottografici

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)

# Creare una figura con 2 righe e 2 colonne di sottografici
fig, axs = plt.subplots(2, 2, figsize=(12, 8))

# Grafico in alto a sinistra
axs[0, 0].plot(x, np.sin(x))
axs[0, 0].set_title('Seno')

# Grafico in alto a destra
axs[0, 1].plot(x, np.cos(x), 'g-')
axs[0, 1].set_title('Coseno')

# Grafico in basso a sinistra
axs[1, 0].plot(x, np.sin(x) * np.cos(x), 'r-')
axs[1, 0].set_title('Seno * Coseno')

# Grafico in basso a destra
axs[1, 1].plot(x, np.sin(x) + np.cos(x), 'k-')
axs[1, 1].set_title('Seno + Coseno')

# Aggiustare lo spazio tra i sottografici
plt.tight_layout()
plt.show()
```

### Annotazioni

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(10, 6))
plt.plot(x, y)

# Aggiungere un punto
plt.plot(np.pi, 0, 'ro', markersize=10)

# Aggiungere una freccia e un testo
plt.annotate('sin(π) = 0', 
             xy=(np.pi, 0),  # Posizione della punta della freccia
             xytext=(np.pi+1, 0.5),  # Posizione del testo
             arrowprops=dict(facecolor='black', shrink=0.05),
             fontsize=12)

plt.title('Grafico con Annotazioni')
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.grid(True)
plt.show()
```

## Grafici 3D

```python
import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D

# Generare dati per una superficie 3D
x = np.linspace(-5, 5, 50)
y = np.linspace(-5, 5, 50)
X, Y = np.meshgrid(x, y)
Z = np.sin(np.sqrt(X**2 + Y**2))

# Creare una figura 3D
fig = plt.figure(figsize=(12, 8))
ax = fig.add_subplot(111, projection='3d')

# Disegnare la superficie
surf = ax.plot_surface(X, Y, Z, cmap='viridis', edgecolor='none')

# Aggiungere una barra dei colori
fig.colorbar(surf, ax=ax, shrink=0.5, aspect=5)

ax.set_title('Superficie 3D')
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')

plt.show()
```

## Salvataggio dei Grafici

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(10, 6))
plt.plot(x, y)
plt.title('Funzione Seno')
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.grid(True)

# Salvare il grafico in vari formati
plt.savefig('seno.png', dpi=300)  # PNG ad alta risoluzione
plt.savefig('seno.pdf')           # PDF (vettoriale)
plt.savefig('seno.svg')           # SVG (vettoriale)

plt.show()
```

## Integrazione con Pandas

```python
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Creare un DataFrame di esempio
np.random.seed(42)
dates = pd.date_range('20210101', periods=100)
df = pd.DataFrame({
    'A': np.random.randn(100).cumsum(),
    'B': np.random.randn(100).cumsum(),
    'C': np.random.randn(100).cumsum()
}, index=dates)

# Grafico diretto dal DataFrame
df.plot(figsize=(12, 6))
plt.title('Serie Temporali')
plt.xlabel('Data')
plt.ylabel('Valore')
plt.grid(True)
plt.show()

# Grafico a barre
df.iloc[-1].plot.bar(figsize=(10, 6))
plt.title('Valori Finali')
plt.ylabel('Valore')
plt.grid(True, axis='y')
plt.show()
```

## Esempio Pratico: Visualizzazione di Dati Reali

```python
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Simulare dati di temperatura giornaliera per un anno
np.random.seed(42)
dates = pd.date_range('20210101', periods=365)

# Creare una tendenza stagionale
t = np.arange(365)
temp_trend = 15 + 10 * np.sin(2 * np.pi * t / 365)

# Aggiungere rumore casuale
temp = temp_trend + np.random.normal(0, 3, 365)

# Creare DataFrame
df = pd.DataFrame({
    'data': dates,
    'temperatura': temp
})
df['mese'] = df['data'].dt.month

# Grafico della serie temporale
plt.figure(figsize=(14, 6))
plt.plot(df['data'], df['temperatura'], 'b-', alpha=0.5)
plt.plot(df['data'], df['temperatura'].rolling(window=30).mean(), 'r-', linewidth=2)
plt.title('Temperature Giornaliere (2021)')
plt.xlabel('Data')
plt.ylabel('Temperatura (°C)')
plt.grid(True, alpha=0.3)
plt.legend(['Temperatura giornaliera', 'Media mobile (30 giorni)'])
plt.show()

# Box plot per mese
plt.figure(figsize=(14, 6))
boxplot_data = [df[df['mese'] == m]['temperatura'] for m in range(1, 13)]
plt.boxplot(boxplot_data, labels=['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'])
plt.title('Distribuzione delle Temperature per Mese')
plt.ylabel('Temperatura (°C)')
plt.grid(True, axis='y', alpha=0.3)
plt.show()
```

## Conclusione

Matplotlib è una libreria potente e flessibile per la visualizzazione dei dati in Python. La sua versatilità la rende adatta a una vasta gamma di applicazioni, dalla semplice visualizzazione di dati all'analisi scientifica avanzata.

Per visualizzazioni più specializzate o di alto livello, considera l'uso di librerie basate su Matplotlib come Seaborn (per visualizzazioni statistiche) o Plotly (per grafici interattivi).

## Risorse Aggiuntive

- [Documentazione ufficiale di Matplotlib](https://matplotlib.org/stable/contents.html)
- [Galleria di esempi Matplotlib](https://matplotlib.org/stable/gallery/index.html)
- [Cheat Sheet di Matplotlib](https://github.com/matplotlib/cheatsheets)

## Navigazione

- [Torna all'indice delle librerie](../README.md)
- [Libreria precedente: NumPy](04-numpy.md)
- [Libreria successiva: Pillow](06-pillow.md)