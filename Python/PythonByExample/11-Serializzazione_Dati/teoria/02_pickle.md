# Serializzazione con Pickle

In questa lezione, approfondiremo il modulo `pickle` di Python, uno strumento potente per la serializzazione di oggetti Python nativi.

## Cos'è Pickle?

Il modulo `pickle` è una libreria standard di Python che implementa un algoritmo per la serializzazione e deserializzazione di oggetti Python. Questo processo è anche chiamato "pickling" (per la serializzazione) e "unpickling" (per la deserializzazione).

Pickle permette di:

- Convertire quasi qualsiasi oggetto Python in una sequenza di byte
- Salvare questa sequenza su disco o trasmetterla attraverso una rete
- Ricostruire l'oggetto originale in un altro momento o in un altro ambiente Python

## Funzionalità di Base

### Serializzazione (Pickling)

```python
import pickle

# Oggetto da serializzare
dati = {
    'nome': 'Alice',
    'età': 28,
    'corsi': ['Python', 'Data Science', 'Machine Learning'],
    'attivo': True
}

# Serializzazione in un file
with open('dati.pkl', 'wb') as file:
    pickle.dump(dati, file)

# Serializzazione in una stringa di byte
dati_serializzati = pickle.dumps(dati)
print(f"Dati serializzati: {dati_serializzati[:30]}...")
```

### Deserializzazione (Unpickling)

```python
import pickle

# Deserializzazione da un file
with open('dati.pkl', 'rb') as file:
    dati_caricati = pickle.load(file)

print(dati_caricati)

# Deserializzazione da una stringa di byte
dati_serializzati = pickle.dumps({'a': 1, 'b': 2})
dati_deserializzati = pickle.loads(dati_serializzati)
print(dati_deserializzati)
```

## Protocolli di Pickle

Pickle supporta diversi protocolli di serializzazione, ognuno con caratteristiche diverse:

```python
import pickle

dati = {'nome': 'Alice', 'età': 28}

# Protocollo 0 (formato ASCII, compatibile con versioni precedenti)
with open('dati_proto0.pkl', 'wb') as file:
    pickle.dump(dati, file, protocol=0)

# Protocollo più recente disponibile
with open('dati_latest.pkl', 'wb') as file:
    pickle.dump(dati, file, protocol=pickle.HIGHEST_PROTOCOL)

# Protocollo 5 (introdotto in Python 3.8)
if hasattr(pickle, 'DEFAULT_PROTOCOL') and pickle.DEFAULT_PROTOCOL >= 5:
    with open('dati_proto5.pkl', 'wb') as file:
        pickle.dump(dati, file, protocol=5)
```

Ecco una tabella dei protocolli disponibili:

| Protocollo | Introdotto in | Caratteristiche |
|------------|---------------|------------------|
| 0          | Python 1.0    | Formato ASCII human-readable, compatibile con versioni precedenti |
| 1          | Python 2.0    | Formato binario, più efficiente del protocollo 0 |
| 2          | Python 2.3    | Supporto per nuovi tipi di oggetti |
| 3          | Python 3.0    | Supporto per bytearray, memoryview e altri tipi Python 3 |
| 4          | Python 3.4    | Supporto per oggetti molto grandi |
| 5          | Python 3.8    | Supporto per out-of-band data e accelerazione |

## Tipi di Dati Supportati

Pickle può serializzare una vasta gamma di tipi di dati Python:

- Tipi primitivi: `int`, `float`, `bool`, `complex`, `str`, `bytes`, `None`
- Sequenze e collezioni: `list`, `tuple`, `dict`, `set`, `frozenset`
- Funzioni e classi definite a livello di modulo
- Istanze di classi (se la classe è importabile)

Esempio con diversi tipi di dati:

```python
import pickle
import datetime

# Vari tipi di dati
dati_vari = {
    'intero': 42,
    'float': 3.14159,
    'stringa': 'Hello, Pickle!',
    'lista': [1, 2, 3, 4, 5],
    'dizionario': {'a': 1, 'b': 2},
    'set': {1, 2, 3},
    'tupla': (1, 'due', 3.0),
    'booleano': True,
    'none': None,
    'data': datetime.datetime.now()
}

# Serializzazione
with open('dati_vari.pkl', 'wb') as file:
    pickle.dump(dati_vari, file)

# Deserializzazione
with open('dati_vari.pkl', 'rb') as file:
    dati_caricati = pickle.load(file)

# Verifica che i dati siano stati preservati correttamente
for chiave, valore in dati_caricati.items():
    print(f"{chiave}: {valore} (tipo: {type(valore).__name__})")
```

## Vantaggi di Pickle

1. **Versatilità**: Può serializzare quasi tutti i tipi di oggetti Python
2. **Preservazione della struttura**: Mantiene riferimenti, strutture complesse e relazioni tra oggetti
3. **Efficienza**: Generalmente più veloce di altri formati per dati Python complessi
4. **Integrazione nativa**: Parte della libreria standard Python
5. **Supporto per oggetti personalizzati**: Può serializzare istanze di classi definite dall'utente

## Limitazioni e Considerazioni di Sicurezza

1. **Non interoperabile**: I file pickle sono specifici per Python e non possono essere facilmente letti da altri linguaggi
2. **Rischi di sicurezza**: Deserializzare dati da fonti non attendibili può eseguire codice arbitrario
3. **Compatibilità tra versioni**: I file pickle potrebbero non essere compatibili tra diverse versioni di Python
4. **Dimensione dei file**: I file pickle possono essere più grandi rispetto ad altri formati come JSON

### Avviso di Sicurezza

```python
# NON FARE QUESTO con dati da fonti non attendibili!
with open('file_da_fonte_sconosciuta.pkl', 'rb') as file:
    dati_pericolosi = pickle.load(file)  # Potenziale rischio di sicurezza!
```

## Serializzazione di Oggetti Personalizzati

Pickle può serializzare istanze di classi definite dall'utente:

```python
import pickle

class Persona:
    def __init__(self, nome, età):
        self.nome = nome
        self.età = età
    
    def saluta(self):
        return f"Ciao, sono {self.nome} e ho {self.età} anni."

# Creazione di un'istanza
persona = Persona("Marco", 35)
print(persona.saluta())

# Serializzazione dell'istanza
with open('persona.pkl', 'wb') as file:
    pickle.dump(persona, file)

# Deserializzazione dell'istanza
with open('persona.pkl', 'rb') as file:
    persona_caricata = pickle.load(file)

# Verifica che l'oggetto funzioni correttamente
print(persona_caricata.saluta())
```

## Personalizzazione del Processo di Pickling

È possibile personalizzare il comportamento di pickle implementando metodi speciali nelle classi:

```python
import pickle

class PersonaCustom:
    def __init__(self, nome, età, dati_privati):
        self.nome = nome
        self.età = età
        self.dati_privati = dati_privati  # Dati che non vogliamo serializzare
    
    def __getstate__(self):
        # Questo metodo controlla cosa viene serializzato
        stato = self.__dict__.copy()
        # Rimuoviamo i dati privati
        del stato['dati_privati']
        return stato
    
    def __setstate__(self, stato):
        # Questo metodo controlla come l'oggetto viene deserializzato
        self.__dict__.update(stato)
        # Impostiamo un valore predefinito per i dati privati
        self.dati_privati = "Valore predefinito dopo deserializzazione"

# Creazione di un'istanza
persona = PersonaCustom("Laura", 29, "Informazioni molto riservate")
print(f"Prima della serializzazione: {persona.nome}, {persona.età}, {persona.dati_privati}")

# Serializzazione
with open('persona_custom.pkl', 'wb') as file:
    pickle.dump(persona, file)

# Deserializzazione
with open('persona_custom.pkl', 'rb') as file:
    persona_caricata = pickle.load(file)

print(f"Dopo la deserializzazione: {persona_caricata.nome}, {persona_caricata.età}, {persona_caricata.dati_privati}")
```

## Esempio Pratico: Salvataggio di uno Stato di Gioco

```python
import pickle
import random
import os

class GiocoAvventura:
    def __init__(self, nome_giocatore):
        self.nome_giocatore = nome_giocatore
        self.livello = 1
        self.punti_vita = 100
        self.inventario = []
        self.posizione = "Villaggio iniziale"
    
    def avanza_livello(self):
        self.livello += 1
        self.punti_vita = 100 + (self.livello * 10)
    
    def raccogli_oggetto(self, oggetto):
        self.inventario.append(oggetto)
    
    def cambia_posizione(self, nuova_posizione):
        self.posizione = nuova_posizione
    
    def stato_attuale(self):
        return f"Giocatore: {self.nome_giocatore} (Liv. {self.livello})\n" \
               f"Salute: {self.punti_vita}\n" \
               f"Posizione: {self.posizione}\n" \
               f"Inventario: {', '.join(self.inventario) if self.inventario else 'Vuoto'}"

# Funzione per salvare il gioco
def salva_gioco(gioco, nome_file="salvataggio.pkl"):
    with open(nome_file, 'wb') as file:
        pickle.dump(gioco, file)
    print(f"Gioco salvato in {nome_file}")

# Funzione per caricare il gioco
def carica_gioco(nome_file="salvataggio.pkl"):
    if os.path.exists(nome_file):
        with open(nome_file, 'rb') as file:
            return pickle.load(file)
    return None

# Simulazione di gioco
def simula_gioco():
    # Controlla se esiste un salvataggio
    gioco = carica_gioco()
    
    if gioco:
        print("Salvataggio trovato!")
        print(gioco.stato_attuale())
        risposta = input("Vuoi continuare da questo salvataggio? (s/n): ")
        if risposta.lower() != 's':
            gioco = None
    
    # Se non c'è un salvataggio o l'utente vuole iniziare una nuova partita
    if not gioco:
        nome = input("Inserisci il nome del tuo personaggio: ")
        gioco = GiocoAvventura(nome)
    
    # Simulazione di alcune azioni di gioco
    luoghi = ["Foresta incantata", "Montagne nebbiose", "Caverna oscura", "Città abbandonata"]
    oggetti = ["Spada magica", "Pozione curativa", "Scudo di legno", "Amuleto misterioso", "Mappa antica"]
    
    for _ in range(3):  # Simuliamo 3 turni di gioco
        print("\n" + "-"*30)
        print(gioco.stato_attuale())
        print("-"*30)
        
        # Azioni casuali
        azione = random.randint(1, 3)
        if azione == 1 and oggetti:  # Raccogli oggetto
            oggetto = oggetti.pop(random.randint(0, len(oggetti)-1))
            gioco.raccogli_oggetto(oggetto)
            print(f"Hai trovato: {oggetto}")
        elif azione == 2:  # Cambia posizione
            nuova_posizione = random.choice(luoghi)
            gioco.cambia_posizione(nuova_posizione)
            print(f"Ti sei spostato in: {nuova_posizione}")
        else:  # Avanza di livello
            gioco.avanza_livello()
            print(f"Hai avanzato al livello {gioco.livello}!")
        
        input("Premi Invio per continuare...")
    
    # Chiedi se salvare il gioco
    risposta = input("\nVuoi salvare il gioco? (s/n): ")
    if risposta.lower() == 's':
        salva_gioco(gioco)

# Per eseguire la simulazione, decommentare la riga seguente
# simula_gioco()
```

## Conclusione

Il modulo `pickle` è uno strumento potente per la serializzazione di oggetti Python, particolarmente utile quando si lavora con dati complessi che devono essere salvati o trasmessi all'interno dell'ecosistema Python. Tuttavia, è importante essere consapevoli delle sue limitazioni, in particolare per quanto riguarda la sicurezza e l'interoperabilità.

Nelle prossime lezioni, esploreremo altri formati di serializzazione come JSON, XML e YAML, che offrono diversi compromessi in termini di versatilità, leggibilità e interoperabilità.

---

[Indice](../README.md) | [Lezione Precedente: Introduzione alla Serializzazione](01_introduzione_serializzazione.md) | [Prossima Lezione: Serializzazione con JSON](03_json.md)