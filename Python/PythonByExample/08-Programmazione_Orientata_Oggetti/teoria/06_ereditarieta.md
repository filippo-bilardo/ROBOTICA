# Ereditarietà in Python

L'ereditarietà è uno dei concetti fondamentali della programmazione orientata agli oggetti. Permette di creare una nuova classe (chiamata classe derivata o sottoclasse) basata su una classe esistente (chiamata classe base o superclasse), ereditandone attributi e metodi.

## Concetti Base dell'Ereditarietà

L'ereditarietà consente di:

- Riutilizzare il codice esistente
- Estendere le funzionalità di una classe esistente
- Creare gerarchie di classi che rappresentano relazioni "è un tipo di"
- Implementare comportamenti specializzati mantenendo una struttura comune

## Sintassi dell'Ereditarietà in Python

In Python, l'ereditarietà si implementa specificando la classe base tra parentesi quando si definisce una nuova classe:

```python
class ClasseBase:
    # Attributi e metodi della classe base
    pass

class ClasseDerivata(ClasseBase):
    # Attributi e metodi della classe derivata
    # Eredita tutti gli attributi e metodi della classe base
    pass
```

## Esempio Pratico

Ecco un esempio che illustra l'ereditarietà in Python:

```python
class Veicolo:
    def __init__(self, marca, modello, anno):
        self.marca = marca
        self.modello = modello
        self.anno = anno
        self.velocita = 0
    
    def accelera(self, incremento):
        self.velocita += incremento
        return f"Il veicolo sta andando a {self.velocita} km/h"
    
    def frena(self, decremento):
        if self.velocita - decremento < 0:
            self.velocita = 0
        else:
            self.velocita -= decremento
        return f"Il veicolo sta andando a {self.velocita} km/h"
    
    def descrizione(self):
        return f"{self.marca} {self.modello} ({self.anno})"

# Classe derivata che eredita da Veicolo
class Automobile(Veicolo):
    def __init__(self, marca, modello, anno, numero_porte):
        # Chiamata al costruttore della classe base
        super().__init__(marca, modello, anno)
        # Attributo specifico della classe derivata
        self.numero_porte = numero_porte
        self.aria_condizionata = False
    
    # Metodo specifico della classe derivata
    def attiva_aria_condizionata(self):
        self.aria_condizionata = True
        return "Aria condizionata attivata"
    
    # Override del metodo della classe base
    def descrizione(self):
        descrizione_base = super().descrizione()
        return f"{descrizione_base}, {self.numero_porte} porte"

# Utilizzo delle classi
veicolo = Veicolo("Generico", "Modello Base", 2020)
print(veicolo.descrizione())  # Output: Generico Modello Base (2020)
print(veicolo.accelera(50))   # Output: Il veicolo sta andando a 50 km/h

auto = Automobile("Fiat", "Panda", 2019, 5)
print(auto.descrizione())     # Output: Fiat Panda (2019), 5 porte
print(auto.accelera(30))      # Output: Il veicolo sta andando a 30 km/h
print(auto.attiva_aria_condizionata())  # Output: Aria condizionata attivata
```

## La Funzione `super()`

La funzione `super()` è utilizzata per chiamare metodi della classe base. È particolarmente utile quando si vuole estendere un metodo della classe base invece di sostituirlo completamente:

```python
class ClasseBase:
    def metodo(self):
        return "Metodo della classe base"

class ClasseDerivata(ClasseBase):
    def metodo(self):
        # Chiamata al metodo della classe base
        risultato_base = super().metodo()
        return f"{risultato_base} + estensione nella classe derivata"
```

## Ereditarietà Multipla

Python supporta l'ereditarietà multipla, che permette a una classe di ereditare da più classi base:

```python
class ClasseA:
    def metodo_a(self):
        return "Metodo di ClasseA"

class ClasseB:
    def metodo_b(self):
        return "Metodo di ClasseB"

class ClasseC(ClasseA, ClasseB):
    def metodo_c(self):
        return "Metodo di ClasseC"

# Istanza di ClasseC
oggetto = ClasseC()
print(oggetto.metodo_a())  # Output: Metodo di ClasseA
print(oggetto.metodo_b())  # Output: Metodo di ClasseB
print(oggetto.metodo_c())  # Output: Metodo di ClasseC
```

### MRO (Method Resolution Order)

Quando si utilizza l'ereditarietà multipla, Python segue un ordine specifico chiamato MRO (Method Resolution Order) per determinare quale metodo chiamare in caso di nomi duplicati. L'algoritmo utilizzato è chiamato C3 Linearization.

Puoi visualizzare l'MRO di una classe usando l'attributo `__mro__` o il metodo `mro()`:

```python
print(ClasseC.__mro__)
# Output: (<class '__main__.ClasseC'>, <class '__main__.ClasseA'>, <class '__main__.ClasseB'>, <class 'object'>)
```

## Verifica dell'Ereditarietà

Python fornisce diverse funzioni per verificare le relazioni di ereditarietà:

```python
# Verifica se una classe è sottoclasse di un'altra
print(issubclass(Automobile, Veicolo))  # Output: True

# Verifica se un oggetto è istanza di una classe
auto = Automobile("Fiat", "Panda", 2019, 5)
print(isinstance(auto, Automobile))     # Output: True
print(isinstance(auto, Veicolo))        # Output: True (ereditarietà)
```

## Ereditarietà e Incapsulamento

L'ereditarietà rispetta l'incapsulamento. Le sottoclassi possono accedere agli attributi e metodi pubblici e protetti della classe base, ma non a quelli privati:

```python
class Base:
    def __init__(self):
        self.pubblico = "Accessibile a tutti"
        self._protetto = "Accessibile alle sottoclassi"
        self.__privato = "Non accessibile alle sottoclassi"

class Derivata(Base):
    def accedi_attributi(self):
        return f"Pubblico: {self.pubblico}, Protetto: {self._protetto}"
        # Tentare di accedere a self.__privato causerebbe un errore
```

## Conclusione

L'ereditarietà è un potente strumento della programmazione orientata agli oggetti che permette di creare gerarchie di classi, riutilizzare il codice e implementare relazioni "è un tipo di" tra le classi. Python offre un supporto flessibile per l'ereditarietà, inclusa l'ereditarietà multipla, che consente di creare strutture di classi complesse e ben organizzate.

Nella prossima lezione, esploreremo il polimorfismo, un altro concetto fondamentale della programmazione orientata agli oggetti che lavora in stretta collaborazione con l'ereditarietà.