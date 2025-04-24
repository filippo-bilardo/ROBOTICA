# Pandas: La Libreria per l'Analisi dei Dati in Python

## Introduzione

Pandas è una delle librerie più potenti e popolari per l'analisi e la manipolazione dei dati in Python. Creata nel 2008 da Wes McKinney, Pandas offre strutture dati flessibili e strumenti per lavorare con dati strutturati (tabellari, serie temporali, matriciali) in modo efficiente e intuitivo.

La libreria è diventata uno standard de facto per l'analisi dei dati, la scienza dei dati e il machine learning grazie alla sua capacità di gestire grandi quantità di dati in modo performante.

## Installazione

Per installare Pandas, utilizza il gestore di pacchetti pip:

```python
pip install pandas
```

Pandas dipende da NumPy, che verrà installato automaticamente se non è già presente.

## Strutture dati principali

Pandas si basa su due strutture dati fondamentali:

### Series

Una Series è un array monodimensionale etichettato, simile a un dizionario o a una colonna di un foglio di calcolo:

```python
import pandas as pd

# Creare una Series da un dizionario
dati = {'a': 10, 'b': 20, 'c': 30}
serie = pd.Series(data=dati)
print(serie)

# Creare una Series da una lista
serie2 = pd.Series([1, 2, 3, 4], index=['w', 'x', 'y', 'z'])
print(serie2)

# Accesso agli elementi
print(serie['b'])  # 20
print(serie2['z'])  # 4
```

### DataFrame

Un DataFrame è una struttura dati bidimensionale, simile a una tabella di un database relazionale o a un foglio di calcolo:

```python
import pandas as pd

# Creare un DataFrame da un dizionario
dati = {
    'Nome': ['Mario', 'Luigi', 'Giovanna', 'Anna'],
    'Età': [28, 35, 42, 31],
    'Città': ['Roma', 'Milano', 'Napoli', 'Torino']
}
df = pd.DataFrame(data=dati)
print(df)

# Accesso alle colonne
print(df['Nome'])  # Restituisce una Series

# Accesso alle righe con loc (basato su etichette)
print(df.loc[0])  # Prima riga

# Accesso alle righe con iloc (basato su posizione)
print(df.iloc[1])  # Seconda riga
```

## Operazioni fondamentali

### Lettura e scrittura di dati

Pandas supporta numerosi formati di file:

```python
import pandas as pd

# Lettura da CSV
df = pd.read_csv('dati.csv')

# Lettura da Excel
df = pd.read_excel('dati.xlsx', sheet_name='Foglio1')

# Lettura da JSON
df = pd.read_json('dati.json')

# Lettura da SQL
from sqlalchemy import create_engine
engine = create_engine('sqlite:///database.db')
df = pd.read_sql('SELECT * FROM tabella', engine)

# Scrittura su file
df.to_csv('output.csv', index=False)
df.to_excel('output.xlsx', index=False)
df.to_json('output.json')
```

### Esplorazione dei dati

```python
import pandas as pd

# Caricare un dataset di esempio
df = pd.read_csv('dati.csv')

# Visualizzare le prime righe
print(df.head())  # Prime 5 righe per default
print(df.head(10))  # Prime 10 righe

# Visualizzare le ultime righe
print(df.tail())  # Ultime 5 righe

# Informazioni sul DataFrame
print(df.info())  # Tipi di dati e valori non nulli

# Statistiche descrittive
print(df.describe())  # Media, min, max, quartili, ecc.

# Dimensioni del DataFrame
print(df.shape)  # (righe, colonne)

# Nomi delle colonne
print(df.columns)

# Verificare valori nulli
print(df.isnull().sum())  # Conta i valori nulli per colonna
```

### Selezione e filtro dei dati

```python
import pandas as pd

# Esempio di DataFrame
df = pd.DataFrame({
    'Nome': ['Mario', 'Luigi', 'Giovanna', 'Anna', 'Paolo'],
    'Età': [28, 35, 42, 31, 45],
    'Città': ['Roma', 'Milano', 'Napoli', 'Torino', 'Roma'],
    'Stipendio': [1500, 2000, 2500, 1800, 3000]
})

# Selezione di colonne
print(df[['Nome', 'Età']])  # Seleziona solo Nome ed Età

# Filtro con condizioni
print(df[df['Età'] > 30])  # Persone con più di 30 anni
print(df[df['Città'] == 'Roma'])  # Persone di Roma

# Condizioni multiple
print(df[(df['Età'] > 30) & (df['Stipendio'] > 2000)])  # AND
print(df[(df['Città'] == 'Roma') | (df['Città'] == 'Milano')])  # OR

# Query con sintassi più leggibile
print(df.query('Età > 30 and Stipendio > 2000'))
print(df.query('Città in ["Roma", "Milano"]'))
```

### Gestione dei valori mancanti

```python
import pandas as pd
import numpy as np

# DataFrame con valori mancanti
df = pd.DataFrame({
    'A': [1, 2, np.nan, 4],
    'B': [5, np.nan, np.nan, 8],
    'C': [9, 10, 11, 12]
})

# Verificare valori mancanti
print(df.isnull())  # True dove ci sono NaN
print(df.isnull().sum())  # Conta NaN per colonna

# Eliminare righe con valori mancanti
print(df.dropna())  # Elimina righe con almeno un NaN

# Eliminare colonne con valori mancanti
print(df.dropna(axis=1))  # Elimina colonne con almeno un NaN

# Sostituire valori mancanti
print(df.fillna(0))  # Sostituisce NaN con 0
print(df.fillna(df.mean()))  # Sostituisce NaN con la media della colonna

# Interpolazione
print(df.interpolate())  # Interpolazione lineare
```

### Aggregazione e raggruppamento

```python
import pandas as pd

# DataFrame di esempio
df = pd.DataFrame({
    'Categoria': ['A', 'B', 'A', 'B', 'A', 'C'],
    'Valore1': [10, 20, 30, 40, 50, 60],
    'Valore2': [100, 200, 300, 400, 500, 600]
})

# Raggruppamento per categoria
gruppi = df.groupby('Categoria')

# Statistiche per gruppo
print(gruppi.mean())  # Media per gruppo
print(gruppi.sum())   # Somma per gruppo
print(gruppi.count()) # Conteggio per gruppo
print(gruppi.min())   # Minimo per gruppo
print(gruppi.max())   # Massimo per gruppo

# Aggregazioni multiple
print(gruppi.agg(['mean', 'sum', 'count']))

# Aggregazioni diverse per colonne diverse
print(gruppi.agg({
    'Valore1': 'sum',
    'Valore2': ['min', 'max']
}))
```

### Pivot e reshape

```python
import pandas as pd

# DataFrame di esempio
df = pd.DataFrame({
    'Data': ['2023-01-01', '2023-01-01', '2023-01-02', '2023-01-02'],
    'Prodotto': ['A', 'B', 'A', 'B'],
    'Vendite': [100, 150, 120, 180]
})

# Pivot table
pivot = df.pivot_table(
    index='Data',
    columns='Prodotto',
    values='Vendite',
    aggfunc='sum'
)
print(pivot)

# Melt (operazione inversa del pivot)
df_lungo = pd.melt(
    pivot.reset_index(),
    id_vars='Data',
    value_vars=['A', 'B'],
    var_name='Prodotto',
    value_name='Vendite'
)
print(df_lungo)
```

### Unione di DataFrame

```python
import pandas as pd

# DataFrame di esempio
df1 = pd.DataFrame({
    'ID': [1, 2, 3, 4],
    'Nome': ['Mario', 'Luigi', 'Giovanna', 'Anna']
})

df2 = pd.DataFrame({
    'ID': [1, 2, 3, 5],
    'Stipendio': [1500, 2000, 2500, 3000]
})

# Merge (simile a JOIN in SQL)
merge_inner = pd.merge(df1, df2, on='ID', how='inner')  # Solo righe con ID in entrambi
print(merge_inner)

merge_left = pd.merge(df1, df2, on='ID', how='left')    # Tutte le righe di df1
print(merge_left)

merge_right = pd.merge(df1, df2, on='ID', how='right')  # Tutte le righe di df2
print(merge_right)

merge_outer = pd.merge(df1, df2, on='ID', how='outer')  # Tutte le righe di entrambi
print(merge_outer)

# Concatenazione
df3 = pd.DataFrame({
    'ID': [6, 7],
    'Nome': ['Paolo', 'Sara']
})

concat_rows = pd.concat([df1, df3])  # Concatena righe
print(concat_rows)

df4 = pd.DataFrame({
    'Città': ['Roma', 'Milano', 'Napoli', 'Torino']
})

concat_cols = pd.concat([df1, df4], axis=1)  # Concatena colonne
print(concat_cols)
```

## Casi d'uso comuni

### Analisi esplorativa dei dati

```python
import pandas as pd
import matplotlib.pyplot as plt

# Caricamento dati
df = pd.read_csv('dati.csv')

# Statistiche descrittive
print(df.describe())

# Correlazione tra variabili
corr = df.corr()
print(corr)

# Visualizzazione della correlazione
plt.figure(figsize=(10, 8))
plt.imshow(corr, cmap='coolwarm')
plt.colorbar()
plt.xticks(range(len(corr.columns)), corr.columns, rotation=90)
plt.yticks(range(len(corr.columns)), corr.columns)
plt.show()

# Istogrammi
df.hist(figsize=(12, 10))
plt.tight_layout()
plt.show()
```

### Pulizia e preparazione dei dati

```python
import pandas as pd

# Caricamento dati
df = pd.read_csv('dati_grezzi.csv')

# Rimozione duplicati
df = df.drop_duplicates()

# Gestione valori mancanti
df['colonna1'] = df['colonna1'].fillna(df['colonna1'].mean())
df['colonna2'] = df['colonna2'].fillna('Sconosciuto')

# Rimozione outlier
q1 = df['valore'].quantile(0.25)
q3 = df['valore'].quantile(0.75)
iqr = q3 - q1
df_filtrato = df[(df['valore'] >= q1 - 1.5 * iqr) & (df['valore'] <= q3 + 1.5 * iqr)]

# Conversione tipi di dati
df['data'] = pd.to_datetime(df['data'])
df['categoria'] = df['categoria'].astype('category')

# Normalizzazione
df['valore_norm'] = (df['valore'] - df['valore'].min()) / (df['valore'].max() - df['valore'].min())

# Creazione di nuove feature
df['anno'] = df['data'].dt.year
df['mese'] = df['data'].dt.month
```

## Vantaggi di Pandas

- **Efficienza**: Ottimizzato per operazioni su grandi dataset
- **Flessibilità**: Supporta diversi formati di dati e operazioni complesse
- **Integrazione**: Si integra perfettamente con NumPy, Matplotlib e altre librerie scientifiche
- **Funzionalità**: Offre strumenti avanzati per l'analisi e la manipolazione dei dati
- **Comunità**: Ampia comunità di utenti e documentazione dettagliata

## Navigazione

- [Torna alla pagina principale](../../README.md)
- [Torna all'indice della sezione](../README.md)
- [Lezione precedente: Requests](./02-requests.md)
- [Prossima lezione: NumPy](./04-numpy.md)