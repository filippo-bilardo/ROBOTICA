# Attributi e Metodi in Python

Gli attributi e i metodi sono componenti fondamentali delle classi in Python. Essi definiscono rispettivamente le caratteristiche (dati) e i comportamenti (funzioni) degli oggetti creati dalle classi.

## Attributi in Python

Gli attributi sono variabili che appartengono a una classe o a un'istanza di una classe. In Python, esistono due tipi principali di attributi:

### 1. Attributi di Classe

Gli attributi di classe sono variabili che appartengono alla classe stessa e sono condivisi da tutte le istanze di quella classe. Vengono definiti all'interno della classe ma fuori da qualsiasi metodo.

```python
class Studente:
    # Attributo di classe
    scuola = "Liceo Scientifico"
    
    def __init__(self, nome, voto):
        self.nome = nome
        self.voto = voto

# Accesso all'attributo di classe
print(Studente.scuola)  # Output: Liceo Scientifico

# Creazione di istanze
studente1 = Studente("Marco", 8)
studente2 = Studente("Giulia", 9)

# Gli attributi di classe sono condivisi da tutte le istanze
print(studente1.scuola)  # Output: Liceo Scientifico
print(studente2.scuola)  # Output: Liceo Scientifico

# Modificare l'attributo di classe
Studente.scuola = "Istituto Tecnico"
print(studente1.scuola)  # Output: Istituto Tecnico
print(studente2.scuola)  # Output: Istituto Tecnico
```

### 2. Attributi di Istanza

Gli attributi di istanza sono variabili che appartengono a una specifica istanza di una classe. Ogni istanza ha la propria copia di questi attributi. Vengono definiti all'interno del metodo `__init__` o in altri metodi della classe.

```python
class Automobile:
    def __init__(self, marca, modello, anno):
        # Attributi di istanza
        self.marca = marca
        self.modello = modello
        self.anno = anno
        self.chilometri = 0
    
    def guida(self, distanza):
        self.chilometri += distanza

# Creazione di istanze con attributi diversi
auto1 = Automobile("Fiat", "Panda", 2020)
auto2 = Automobile("Ford", "Focus", 2019)

print(auto1.marca)  # Output: Fiat
print(auto2.marca)  # Output: Ford

# Modifica di un attributo di istanza
auto1.guida(100)
print(auto1.chilometri)  # Output: 100
print(auto2.chilometri)  # Output: 0 (non modificato)
```

### Attributi Dinamici

Una caratteristica potente di Python è la possibilità di aggiungere attributi a un'istanza dinamicamente, anche dopo la sua creazione:

```python
class Persona:
    def __init__(self, nome):
        self.nome = nome

p = Persona("Anna")

# Aggiunta dinamica di un attributo
p.eta = 30
print(p.eta)  # Output: 30
```

## Metodi in Python

I metodi sono funzioni definite all'interno di una classe che descrivono i comportamenti degli oggetti. In Python, esistono diversi tipi di metodi:

### 1. Metodi di Istanza

I metodi di istanza sono le funzioni più comuni nelle classi. Operano su un'istanza specifica della classe e possono accedere e modificare gli attributi dell'istanza. Il primo parametro di un metodo di istanza è sempre `self`, che rappresenta l'istanza stessa.

```python
class Calcolatrice:
    def __init__(self, valore_iniziale=0):
        self.valore = valore_iniziale
    
    def aggiungi(self, numero):
        self.valore += numero
        return self.valore
    
    def sottrai(self, numero):
        self.valore -= numero
        return self.valore

calc = Calcolatrice(10)
print(calc.aggiungi(5))   # Output: 15
print(calc.sottrai(3))    # Output: 12
```

### 2. Metodi di Classe

I metodi di classe sono legati alla classe stessa, non a un'istanza specifica. Possono accedere e modificare gli attributi di classe, ma non gli attributi di istanza. Vengono definiti usando il decoratore `@classmethod` e il primo parametro è convenzionalmente chiamato `cls` (che rappresenta la classe).

```python
class Impiegato:
    # Attributo di classe
    numero_impiegati = 0
    
    def __init__(self, nome):
        self.nome = nome
        Impiegato.numero_impiegati += 1
    
    @classmethod
    def mostra_numero_impiegati(cls):
        return f"Numero totale di impiegati: {cls.numero_impiegati}"
    
    @classmethod
    def da_stringa(cls, stringa):
        nome = stringa.split("-")[0]
        return cls(nome)

# Utilizzo del metodo di classe
imp1 = Impiegato("Mario")
imp2 = Impiegato("Lucia")
print(Impiegato.mostra_numero_impiegati())  # Output: Numero totale di impiegati: 2

# Utilizzo del metodo di classe come costruttore alternativo
imp3 = Impiegato.da_stringa("Giovanni-Sviluppatore")
print(imp3.nome)  # Output: Giovanni
```

### 3. Metodi Statici

I metodi statici non operano né sulla classe né su un'istanza. Sono funzioni normali che per convenienza sono definite all'interno di una classe. Vengono definiti usando il decoratore `@staticmethod` e non hanno un primo parametro speciale.

```python
class Matematica:
    @staticmethod
    def somma(a, b):
        return a + b
    
    @staticmethod
    def prodotto(a, b):
        return a * b

# Utilizzo dei metodi statici
print(Matematica.somma(5, 3))     # Output: 8
print(Matematica.prodotto(4, 2))  # Output: 8

# Anche le istanze possono chiamare metodi statici
math = Matematica()
print(math.somma(2, 3))  # Output: 5
```

## Differenze tra Tipi di Metodi

| Tipo di Metodo | Primo Parametro | Accesso ad Attributi di Classe | Accesso ad Attributi di Istanza |
|----------------|-----------------|--------------------------------|--------------------------------|
| Istanza        | self (istanza)  | Sì                            | Sì                            |
| Classe         | cls (classe)    | Sì                            | No                            |
| Statico        | Nessuno         | No (a meno di riferimento esplicito) | No (a meno di riferimento esplicito) |

## Conclusione

Gli attributi e i metodi sono elementi essenziali nella programmazione orientata agli oggetti in Python. Gli attributi memorizzano i dati, mentre i metodi definiscono i comportamenti. La comprensione di come e quando utilizzare i diversi tipi di attributi e metodi è fondamentale per creare classi ben strutturate e funzionali.

Nella prossima lezione, esploreremo i costruttori e i distruttori, che sono metodi speciali per l'inizializzazione e la pulizia degli oggetti.