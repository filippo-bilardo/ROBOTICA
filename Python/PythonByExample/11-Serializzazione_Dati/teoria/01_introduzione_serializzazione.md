# Introduzione alla Serializzazione dei Dati

La serializzazione dei dati è un concetto fondamentale nella programmazione moderna, che consente di convertire strutture dati complesse in un formato che può essere facilmente memorizzato, trasmesso o ricostruito. In questa lezione, esploreremo i concetti di base della serializzazione, i suoi usi comuni e le diverse tecniche disponibili in Python.

## Cos'è la Serializzazione?

La **serializzazione** (o marshalling) è il processo di conversione di un oggetto o di una struttura dati in un formato che può essere:

1. **Memorizzato** in un file o in un database
2. **Trasmesso** attraverso una rete
3. **Ricostruito** successivamente nella sua forma originale

Il processo inverso, cioè la ricostruzione dell'oggetto originale a partire dalla sua rappresentazione serializzata, è chiamato **deserializzazione** (o unmarshalling).

## Perché Serializzare i Dati?

La serializzazione è utile in molti scenari:

1. **Persistenza dei dati**: Salvare lo stato di un'applicazione per ripristinarlo in seguito
2. **Comunicazione tra processi**: Trasmettere dati tra programmi diversi
3. **Comunicazione di rete**: Inviare dati attraverso Internet (API web, microservizi)
4. **Caching**: Memorizzare risultati di calcoli complessi per un uso futuro
5. **Distribuzione di dati**: Condividere dati tra sistemi eterogenei

## Formati di Serializzazione Comuni

In Python, esistono diversi formati e librerie per la serializzazione dei dati:

### 1. Pickle

Pickle è un modulo integrato in Python che permette di serializzare e deserializzare oggetti Python:

```python
import pickle

# Serializzazione
dati = {'nome': 'Mario', 'età': 30, 'interessi': ['Python', 'AI']}
with open('dati.pkl', 'wb') as file:
    pickle.dump(dati, file)

# Deserializzazione
with open('dati.pkl', 'rb') as file:
    dati_caricati = pickle.load(file)

print(dati_caricati)  # {'nome': 'Mario', 'età': 30, 'interessi': ['Python', 'AI']}
```

**Vantaggi**:
- Supporta quasi tutti i tipi di oggetti Python
- Preserva riferimenti e strutture complesse
- Efficiente per dati Python

**Svantaggi**:
- Non è interoperabile con altri linguaggi
- Problemi di sicurezza (non aprire file pickle da fonti non attendibili)
- Non è human-readable

### 2. JSON (JavaScript Object Notation)

JSON è un formato leggero e human-readable per lo scambio di dati:

```python
import json

# Serializzazione
dati = {'nome': 'Mario', 'età': 30, 'interessi': ['Python', 'AI']}
with open('dati.json', 'w') as file:
    json.dump(dati, file, indent=4)

# Deserializzazione
with open('dati.json', 'r') as file:
    dati_caricati = json.load(file)

print(dati_caricati)  # {'nome': 'Mario', 'età': 30, 'interessi': ['Python', 'AI']}
```

**Vantaggi**:
- Human-readable e facile da debuggare
- Interoperabile con molti linguaggi e sistemi
- Supportato nativamente da JavaScript e browser
- Ampiamente utilizzato nelle API web

**Svantaggi**:
- Supporta solo un sottoinsieme di tipi Python (dict, list, str, int, float, bool, None)
- Non preserva tipi Python specifici (set, tuple, datetime, ecc.)
- Non gestisce riferimenti circolari

### 3. XML (eXtensible Markup Language)

XML è un formato più verboso ma molto flessibile:

```python
import xml.etree.ElementTree as ET

# Creazione di un documento XML
root = ET.Element("persona")
ET.SubElement(root, "nome").text = "Mario"
ET.SubElement(root, "età").text = "30"
interessi = ET.SubElement(root, "interessi")
ET.SubElement(interessi, "interesse").text = "Python"
ET.SubElement(interessi, "interesse").text = "AI"

# Serializzazione
tree = ET.ElementTree(root)
tree.write("dati.xml")

# Deserializzazione
tree = ET.parse("dati.xml")
root = tree.getroot()

print(f"Nome: {root.find('nome').text}")
print(f"Età: {root.find('età').text}")
print("Interessi:")
for interesse in root.findall('./interessi/interesse'):
    print(f"- {interesse.text}")
```

**Vantaggi**:
- Molto flessibile e espressivo
- Supporta metadati e attributi
- Ampiamente utilizzato in configurazioni e scambio dati

**Svantaggi**:
- Verboso e meno efficiente di altri formati
- Parsing più complesso
- Più difficile da leggere per gli umani rispetto a JSON

### 4. YAML (YAML Ain't Markup Language)

YAML è un formato human-friendly per la serializzazione dei dati:

```python
import yaml  # Richiede l'installazione di PyYAML

# Serializzazione
dati = {
    'nome': 'Mario',
    'età': 30,
    'interessi': ['Python', 'AI'],
    'indirizzo': {
        'via': 'Via Roma 123',
        'città': 'Milano'
    }
}

with open('dati.yaml', 'w') as file:
    yaml.dump(dati, file, default_flow_style=False)

# Deserializzazione
with open('dati.yaml', 'r') as file:
    dati_caricati = yaml.safe_load(file)

print(dati_caricati)
```

**Vantaggi**:
- Estremamente leggibile per gli umani
- Supporta commenti e riferimenti
- Meno verboso di XML
- Ideale per file di configurazione

**Svantaggi**:
- Parsing più lento rispetto a JSON
- Sintassi sensibile all'indentazione
- Richiede una libreria esterna

## Confronto tra i Formati di Serializzazione

| Formato | Human-Readable | Interoperabilità | Tipi Supportati | Sicurezza | Uso Comune |
|---------|----------------|------------------|-----------------|-----------|------------|
| Pickle  | No             | Solo Python      | Quasi tutti     | Bassa     | Dati Python interni |
| JSON    | Sì             | Eccellente       | Limitati        | Media     | API web, configurazioni |
| XML     | Parziale       | Eccellente       | Flessibile      | Alta      | Documenti, configurazioni complesse |
| YAML    | Ottima         | Buona            | Buona           | Media     | File di configurazione |

## Considerazioni sulla Scelta del Formato

Quando scegli un formato di serializzazione, considera:

1. **Interoperabilità**: Il formato deve essere compatibile con tutti i sistemi coinvolti?
2. **Leggibilità**: I dati serializzati devono essere leggibili dagli umani?
3. **Prestazioni**: Quanto è importante la velocità di serializzazione/deserializzazione?
4. **Tipi di dati**: Quali tipi di dati devi serializzare?
5. **Sicurezza**: I dati serializzati provengono da fonti attendibili?

## Esempio Pratico: Confronto di Prestazioni

```python
import pickle
import json
import time
import yaml  # Richiede l'installazione di PyYAML

# Dati di test
dati = {
    'interi': list(range(1000)),
    'stringhe': [f"stringa_{i}" for i in range(100)],
    'dizionario': {f"chiave_{i}": f"valore_{i}" for i in range(100)}
}

def test_serializzazione(nome, funzione_serializzazione, funzione_deserializzazione, file_path):
    # Test serializzazione
    inizio = time.time()
    with open(file_path, 'wb' if nome == 'pickle' else 'w') as file:
        funzione_serializzazione(dati, file)
    tempo_serializzazione = time.time() - inizio
    
    # Test deserializzazione
    inizio = time.time()
    with open(file_path, 'rb' if nome == 'pickle' else 'r') as file:
        dati_caricati = funzione_deserializzazione(file)
    tempo_deserializzazione = time.time() - inizio
    
    # Dimensione file
    import os
    dimensione_file = os.path.getsize(file_path)
    
    print(f"{nome.upper()}:")
    print(f"  Tempo serializzazione: {tempo_serializzazione:.6f} secondi")
    print(f"  Tempo deserializzazione: {tempo_deserializzazione:.6f} secondi")
    print(f"  Dimensione file: {dimensione_file} byte")
    print()

# Test Pickle
test_serializzazione('pickle', pickle.dump, pickle.load, 'test_pickle.pkl')

# Test JSON
test_serializzazione('json', 
                    lambda d, f: json.dump(d, f), 
                    lambda f: json.load(f), 
                    'test_json.json')

# Test YAML
test_serializzazione('yaml', 
                    lambda d, f: yaml.dump(d, f), 
                    lambda f: yaml.safe_load(f), 
                    'test_yaml.yaml')
```

## Conclusione

La serializzazione dei dati è un concetto fondamentale nella programmazione moderna, che permette di salvare, trasmettere e ricostruire strutture dati complesse. Python offre diverse opzioni per la serializzazione, ognuna con i propri vantaggi e svantaggi.

Nelle prossime lezioni, esploreremo in dettaglio ciascuno di questi formati di serializzazione, imparando come utilizzarli efficacemente per diversi casi d'uso.

---

[Indice](../README.md) | [Prossima Lezione: Serializzazione con Pickle](02_pickle.md)