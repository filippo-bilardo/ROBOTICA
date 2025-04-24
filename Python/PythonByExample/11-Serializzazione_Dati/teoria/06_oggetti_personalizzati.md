# Serializzazione di Oggetti Personalizzati

In questa lezione, esploreremo come serializzare e deserializzare oggetti personalizzati in Python, affrontando le sfide e le soluzioni per lavorare con tipi di dati complessi e classi definite dall'utente.

## La Sfida degli Oggetti Personalizzati

La serializzazione di oggetti personalizzati presenta sfide uniche rispetto ai tipi di dati standard. Quando definiamo classi personalizzate, dobbiamo considerare:

- **Stato interno**: Come preservare attributi e relazioni
- **Comportamento**: Come gestire metodi e funzionalità
- **Dipendenze**: Come gestire riferimenti ad altri oggetti
- **Compatibilità**: Come garantire che gli oggetti possano essere deserializzati correttamente

Vediamo come affrontare queste sfide con i diversi formati di serializzazione.

## Serializzazione di Oggetti con Pickle

Pickle è il formato più semplice per serializzare oggetti personalizzati in Python, poiché è progettato specificamente per questo scopo.

### Serializzazione di Base

```python
import pickle

class Persona:
    def __init__(self, nome, età, interessi):
        self.nome = nome
        self.età = età
        self.interessi = interessi
    
    def saluta(self):
        return f"Ciao, sono {self.nome} e ho {self.età} anni."
    
    def __str__(self):
        return f"Persona({self.nome}, {self.età}, {self.interessi})"

# Creazione di un oggetto
persona = Persona("Mario", 35, ["Python", "Serializzazione", "Dati"])

# Serializzazione
with open("persona.pickle", "wb") as file:
    pickle.dump(persona, file)

# Deserializzazione
with open("persona.pickle", "rb") as file:
    persona_caricata = pickle.load(file)

print(persona_caricata)  # Output: Persona(Mario, 35, ['Python', 'Serializzazione', 'Dati'])
print(persona_caricata.saluta())  # Output: Ciao, sono Mario e ho 35 anni.
```

Come si può vedere, Pickle preserva sia lo stato (attributi) che il comportamento (metodi) dell'oggetto.

### Personalizzazione del Processo di Serializzazione

È possibile personalizzare il processo di serializzazione implementando i metodi speciali `__getstate__` e `__setstate__`:

```python
class PersonaAvanzata:
    def __init__(self, nome, età, interessi, password):
        self.nome = nome
        self.età = età
        self.interessi = interessi
        self.password = password  # Dato sensibile
        self._calcolato = self._calcola_valore()  # Valore calcolato
    
    def _calcola_valore(self):
        # Simulazione di un calcolo costoso
        return sum(len(i) for i in self.interessi) * self.età
    
    def __getstate__(self):
        # Personalizza lo stato da serializzare
        stato = self.__dict__.copy()
        # Rimuovi dati sensibili
        del stato['password']
        # Rimuovi dati calcolati che possono essere rigenerati
        del stato['_calcolato']
        return stato
    
    def __setstate__(self, stato):
        # Ripristina lo stato con valori predefiniti per i campi mancanti
        self.__dict__.update(stato)
        self.password = "password_predefinita"  # Imposta un valore predefinito
        self._calcolato = self._calcola_valore()  # Ricalcola il valore

# Creazione di un oggetto
persona_avanzata = PersonaAvanzata("Laura", 28, ["Python", "OOP"], "password_segreta")

# Serializzazione
with open("persona_avanzata.pickle", "wb") as file:
    pickle.dump(persona_avanzata, file)

# Deserializzazione
with open("persona_avanzata.pickle", "rb") as file:
    persona_caricata = pickle.load(file)

print(persona_caricata.nome)  # Output: Laura
print(persona_caricata.password)  # Output: password_predefinita
print(persona_caricata._calcolato)  # Output: valore ricalcolato
```

## Serializzazione di Oggetti con JSON

JSON non supporta nativamente la serializzazione di oggetti personalizzati, ma possiamo implementare soluzioni personalizzate.

### Approccio 1: Conversione Manuale

```python
import json

class Studente:
    def __init__(self, nome, matricola, voti):
        self.nome = nome
        self.matricola = matricola
        self.voti = voti
    
    def media_voti(self):
        return sum(self.voti) / len(self.voti) if self.voti else 0
    
    def to_dict(self):
        # Converte l'oggetto in un dizionario
        return {
            "nome": self.nome,
            "matricola": self.matricola,
            "voti": self.voti,
            "_tipo": "Studente"  # Metadati per identificare il tipo
        }
    
    @classmethod
    def from_dict(cls, dati):
        # Crea un oggetto dalla rappresentazione dizionario
        if dati.get("_tipo") != "Studente":
            raise ValueError("Tipo di oggetto non valido")
        return cls(dati["nome"], dati["matricola"], dati["voti"])

# Creazione di un oggetto
studente = Studente("Marco", "12345", [28, 30, 27, 29])

# Serializzazione
with open("studente.json", "w") as file:
    json.dump(studente.to_dict(), file)

# Deserializzazione
with open("studente.json", "r") as file:
    dati = json.load(file)
    studente_caricato = Studente.from_dict(dati)

print(studente_caricato.nome)  # Output: Marco
print(studente_caricato.media_voti())  # Output: 28.5
```

### Approccio 2: Utilizzo di JSONEncoder e JSONDecoder

```python
import json

class Corso:
    def __init__(self, nome, crediti, docente):
        self.nome = nome
        self.crediti = crediti
        self.docente = docente

# Encoder personalizzato
class CorsoEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Corso):
            return {
                "_tipo": "Corso",
                "nome": obj.nome,
                "crediti": obj.crediti,
                "docente": obj.docente
            }
        return super().default(obj)

# Decoder personalizzato
def corso_decoder(dct):
    if dct.get("_tipo") == "Corso":
        return Corso(dct["nome"], dct["crediti"], dct["docente"])
    return dct

# Creazione di un oggetto
corso = Corso("Programmazione Python", 6, "Prof. Rossi")

# Serializzazione
json_str = json.dumps(corso, cls=CorsoEncoder, indent=2)
print(json_str)

# Deserializzazione
corso_caricato = json.loads(json_str, object_hook=corso_decoder)
print(corso_caricato.nome)  # Output: Programmazione Python
print(corso_caricato.docente)  # Output: Prof. Rossi
```

### Approccio 3: Utilizzo di Librerie Esterne

Librerie come `jsonpickle` semplificano la serializzazione di oggetti personalizzati in JSON:

```python
import jsonpickle

class Libro:
    def __init__(self, titolo, autore, anno, pagine):
        self.titolo = titolo
        self.autore = autore
        self.anno = anno
        self.pagine = pagine
    
    def __str__(self):
        return f"{self.titolo} ({self.anno}) di {self.autore}"

# Creazione di un oggetto
libro = Libro("Python Cookbook", "David Beazley", 2013, 706)

# Serializzazione
json_str = jsonpickle.encode(libro, indent=2)
print(json_str)

# Deserializzazione
libro_caricato = jsonpickle.decode(json_str)
print(libro_caricato)  # Output: Python Cookbook (2013) di David Beazley
```

## Serializzazione di Oggetti con XML

Anche XML richiede approcci personalizzati per la serializzazione di oggetti.

### Utilizzo di ElementTree

```python
import xml.etree.ElementTree as ET

class Prodotto:
    def __init__(self, nome, prezzo, categoria, disponibile=True):
        self.nome = nome
        self.prezzo = prezzo
        self.categoria = categoria
        self.disponibile = disponibile
    
    def to_xml(self):
        # Converte l'oggetto in un elemento XML
        prodotto_elem = ET.Element("prodotto")
        
        nome_elem = ET.SubElement(prodotto_elem, "nome")
        nome_elem.text = self.nome
        
        prezzo_elem = ET.SubElement(prodotto_elem, "prezzo")
        prezzo_elem.text = str(self.prezzo)
        
        categoria_elem = ET.SubElement(prodotto_elem, "categoria")
        categoria_elem.text = self.categoria
        
        disponibile_elem = ET.SubElement(prodotto_elem, "disponibile")
        disponibile_elem.text = str(self.disponibile).lower()
        
        return prodotto_elem
    
    @classmethod
    def from_xml(cls, elemento):
        # Crea un oggetto da un elemento XML
        nome = elemento.find("nome").text
        prezzo = float(elemento.find("prezzo").text)
        categoria = elemento.find("categoria").text
        disponibile = elemento.find("disponibile").text.lower() == "true"
        
        return cls(nome, prezzo, categoria, disponibile)

# Creazione di un oggetto
prodotto = Prodotto("Laptop", 999.99, "Elettronica")

# Serializzazione
root = ET.Element("prodotti")
root.append(prodotto.to_xml())
tree = ET.ElementTree(root)
tree.write("prodotto.xml")

# Deserializzazione
tree = ET.parse("prodotto.xml")
root = tree.getroot()
prodotto_elem = root.find("prodotto")
prodotto_caricato = Prodotto.from_xml(prodotto_elem)

print(prodotto_caricato.nome)  # Output: Laptop
print(prodotto_caricato.prezzo)  # Output: 999.99
```

## Serializzazione di Oggetti con YAML

YAML offre un supporto migliore per oggetti personalizzati rispetto a JSON.

### Utilizzo di PyYAML

```python
import yaml

class Utente:
    def __init__(self, username, email, ruolo):
        self.username = username
        self.email = email
        self.ruolo = ruolo
    
    def __repr__(self):
        return f"Utente(username='{self.username}', email='{self.email}', ruolo='{self.ruolo}')"

# Definizione di un rappresentatore YAML per la classe Utente
def represent_utente(dumper, utente):
    return dumper.represent_mapping(
        '!utente',
        {
            'username': utente.username,
            'email': utente.email,
            'ruolo': utente.ruolo
        }
    )

# Definizione di un costruttore YAML per la classe Utente
def construct_utente(loader, node):
    value = loader.construct_mapping(node)
    return Utente(value['username'], value['email'], value['ruolo'])

# Registrazione del rappresentatore e del costruttore
yaml.add_representer(Utente, represent_utente)
yaml.add_constructor('!utente', construct_utente)

# Creazione di un oggetto
utente = Utente("admin", "admin@example.com", "amministratore")

# Serializzazione
yaml_str = yaml.dump(utente)
print(yaml_str)

with open("utente.yaml", "w") as file:
    yaml.dump(utente, file)

# Deserializzazione
with open("utente.yaml", "r") as file:
    utente_caricato = yaml.load(file, Loader=yaml.Loader)

print(utente_caricato)  # Output: Utente(username='admin', email='admin@example.com', ruolo='amministratore')
```

## Gestione di Oggetti Complessi e Relazioni

La serializzazione di oggetti con relazioni complesse richiede attenzione particolare.

### Esempio: Relazioni tra Oggetti

```python
import pickle

class Dipartimento:
    def __init__(self, nome):
        self.nome = nome
        self.dipendenti = []
    
    def aggiungi_dipendente(self, dipendente):
        self.dipendenti.append(dipendente)
        dipendente.dipartimento = self
    
    def __str__(self):
        return f"Dipartimento: {self.nome} ({len(self.dipendenti)} dipendenti)"

class Dipendente:
    def __init__(self, nome, ruolo):
        self.nome = nome
        self.ruolo = ruolo
        self.dipartimento = None  # Riferimento circolare
    
    def __str__(self):
        dept = self.dipartimento.nome if self.dipartimento else "Nessuno"
        return f"{self.nome} ({self.ruolo}) - Dipartimento: {dept}"

# Creazione di oggetti con relazioni
it_dept = Dipartimento("IT")
hr_dept = Dipartimento("Risorse Umane")

dip1 = Dipendente("Alice", "Sviluppatore")
dip2 = Dipendente("Bob", "Amministratore di Sistema")
dip3 = Dipendente("Charlie", "Recruiter")

it_dept.aggiungi_dipendente(dip1)
it_dept.aggiungi_dipendente(dip2)
hr_dept.aggiungi_dipendente(dip3)

# Serializzazione con Pickle (gestisce automaticamente i riferimenti circolari)
with open("azienda.pickle", "wb") as file:
    pickle.dump([it_dept, hr_dept], file)

# Deserializzazione
with open("azienda.pickle", "rb") as file:
    dipartimenti = pickle.load(file)

it_dept_caricato, hr_dept_caricato = dipartimenti
print(it_dept_caricato)  # Output: Dipartimento: IT (2 dipendenti)
print(it_dept_caricato.dipendenti[0])  # Output: Alice (Sviluppatore) - Dipartimento: IT
```

## Serializzazione di Classi Dinamiche

La serializzazione di classi definite dinamicamente richiede approcci speciali.

```python
import pickle
import types

# Definizione dinamica di una classe
def crea_classe_dinamica(nome_classe, attributi, metodi):
    # Crea un nuovo namespace per la classe
    namespace = attributi.copy()
    
    # Aggiungi i metodi al namespace
    for nome_metodo, funzione in metodi.items():
        namespace[nome_metodo] = funzione
    
    # Crea la classe dinamicamente
    return type(nome_classe, (object,), namespace)

# Definizione di un metodo
def saluta(self):
    return f"Ciao, sono {self.nome}!"

# Creazione di una classe dinamica
PersonaDinamica = crea_classe_dinamica(
    "PersonaDinamica",
    {"nome": "Sconosciuto", "età": 0},
    {"saluta": saluta}
)

# Creazione di un'istanza
persona = PersonaDinamica()
persona.nome = "Davide"
persona.età = 42

print(persona.saluta())  # Output: Ciao, sono Davide!

# Serializzazione
with open("persona_dinamica.pickle", "wb") as file:
    pickle.dump(persona, file)

# Deserializzazione (richiede che la classe sia disponibile)
with open("persona_dinamica.pickle", "rb") as file:
    persona_caricata = pickle.load(file)

print(persona_caricata.saluta())  # Output: Ciao, sono Davide!
```

## Migrazione e Compatibilità delle Versioni

Un aspetto critico della serializzazione di oggetti personalizzati è la gestione delle modifiche alla struttura delle classi nel tempo.

```python
import pickle

# Versione 1 della classe
class PersonaV1:
    def __init__(self, nome, età):
        self.nome = nome
        self.età = età
    
    def __str__(self):
        return f"PersonaV1(nome='{self.nome}', età={self.età})"

# Serializzazione di un oggetto V1
persona_v1 = PersonaV1("Elena", 29)
with open("persona_v1.pickle", "wb") as file:
    pickle.dump(persona_v1, file)

# Versione 2 della classe con campo aggiuntivo
class PersonaV2:
    def __init__(self, nome, età, email=None):
        self.nome = nome
        self.età = età
        self.email = email  # Nuovo campo
    
    def __setstate__(self, stato):
        # Gestione della compatibilità con versioni precedenti
        self.__dict__.update(stato)
        if 'email' not in stato:
            self.email = f"{self.nome.lower()}@example.com"  # Valore predefinito
    
    def __str__(self):
        return f"PersonaV2(nome='{self.nome}', età={self.età}, email='{self.email}')"

# Deserializzazione di un oggetto V1 come V2
with open("persona_v1.pickle", "rb") as file:
    # Sostituisci la classe nel registro di pickle
    import copyreg
    import pickle
    copyreg.pickle(PersonaV1, lambda obj: (PersonaV2, (obj.nome, obj.età)))
    
    persona_migrata = pickle.load(file)

print(persona_migrata)  # Output: PersonaV2(nome='Elena', età=29, email='elena@example.com')
```

## Pattern e Best Practices

### 1. Separazione dei Dati dal Comportamento

```python
class ModelBase:
    def to_dict(self):
        """Converte l'oggetto in un dizionario"""
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
    
    @classmethod
    def from_dict(cls, dati):
        """Crea un oggetto da un dizionario"""
        obj = cls()
        for k, v in dati.items():
            if not k.startswith('_'):
                setattr(obj, k, v)
        return obj

class Cliente(ModelBase):
    def __init__(self, id=None, nome=None, email=None):
        self.id = id
        self.nome = nome
        self.email = email
        self._cache = {}  # Dati non persistenti
    
    def calcola_sconto(self):
        # Comportamento non serializzato
        return 0.1 if self.id else 0
```

### 2. Utilizzo di Factory Pattern

```python
class OggettoFactory:
    _tipi_registrati = {}
    
    @classmethod
    def registra_tipo(cls, tipo_nome, classe):
        cls._tipi_registrati[tipo_nome] = classe
    
    @classmethod
    def crea_da_dict(cls, dati):
        tipo = dati.get('_tipo')
        if tipo not in cls._tipi_registrati:
            raise ValueError(f"Tipo non registrato: {tipo}")
        
        classe = cls._tipi_registrati[tipo]
        return classe.from_dict(dati)

# Registrazione dei tipi
class Articolo:
    @classmethod
    def from_dict(cls, dati):
        return cls(dati['nome'], dati['prezzo'])
    
    def __init__(self, nome, prezzo):
        self.nome = nome
        self.prezzo = prezzo

OggettoFactory.registra_tipo('articolo', Articolo)
```

### 3. Utilizzo di Mixin per la Serializzazione

```python
class JSONSerializableMixin:
    def to_json(self):
        import json
        return json.dumps(self.to_dict())
    
    @classmethod
    def from_json(cls, json_str):
        import json
        return cls.from_dict(json.loads(json_str))
    
    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
    
    @classmethod
    def from_dict(cls, dati):
        obj = cls()
        for k, v in dati.items():
            if not k.startswith('_'):
                setattr(obj, k, v)
        return obj

class Ordine(JSONSerializableMixin):
    def __init__(self, id=None, cliente=None, importo=None):
        self.id = id
        self.cliente = cliente
        self.importo = importo
```

## Conclusione

La serializzazione di oggetti personalizzati in Python richiede approcci diversi a seconda del formato utilizzato:

- **Pickle**: Offre la soluzione più semplice e completa, ma limitata a Python e con potenziali rischi di sicurezza
- **JSON**: Richiede conversione manuale o l'uso di librerie specializzate come `jsonpickle`
- **XML**: Necessita di implementazioni personalizzate per la conversione tra oggetti e struttura XML
- **YAML**: Offre un buon supporto attraverso rappresentatori e costruttori personalizzati

Indipendentemente dal formato scelto, è importante considerare:

1. **Sicurezza**: Evitare la deserializzazione di dati non attendibili, specialmente con Pickle
2. **Compatibilità**: Gestire le modifiche alla struttura delle classi nel tempo
3. **Completezza**: Assicurarsi che tutti gli aspetti rilevanti degli oggetti vengano preservati
4. **Interoperabilità**: Scegliere formati appropriati se i dati devono essere condivisi con altri sistemi

Nella prossima lezione, esploreremo le best practices e le considerazioni di sicurezza per la serializzazione dei dati in Python.

---

[Indice](../README.md) | [Lezione Precedente: Serializzazione con YAML](05_yaml.md) | [Prossima Lezione: Best Practices e Considerazioni di Sicurezza](07_best_practices.md)