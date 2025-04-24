# Metodi Speciali in Python

I metodi speciali, anche noti come "metodi magici" o "dunder methods" (double underscore methods), sono metodi predefiniti in Python che permettono alle classi di interagire con le funzionalità integrate del linguaggio. Questi metodi sono riconoscibili perché iniziano e finiscono con un doppio underscore (`__nome__`).

## Perché Usare i Metodi Speciali

I metodi speciali permettono di:

1. **Personalizzare il comportamento degli oggetti** con gli operatori standard di Python
2. **Implementare protocolli** come l'iterazione, la contestualizzazione, o la rappresentazione in stringa
3. **Rendere le classi più intuitive** da usare, facendo in modo che si comportino come i tipi integrati

## Metodi Speciali Comuni

### Costruttore e Distruttore

```python
class Persona:
    def __init__(self, nome, età):
        """Costruttore: viene chiamato quando si crea un nuovo oggetto"""
        self.nome = nome
        self.età = età
        print(f"Persona {self.nome} creata")
    
    def __del__(self):
        """Distruttore: viene chiamato quando l'oggetto viene eliminato"""
        print(f"Persona {self.nome} eliminata")

# Creazione di un oggetto (chiama __init__)
p = Persona("Mario", 30)

# Quando p esce dallo scope o viene esplicitamente eliminato, __del__ viene chiamato
del p  # Output: Persona Mario eliminata
```

### Rappresentazione in Stringa

```python
class Punto:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __str__(self):
        """Rappresentazione informale dell'oggetto (per str() e print())"""
        return f"({self.x}, {self.y})"
    
    def __repr__(self):
        """Rappresentazione formale dell'oggetto (per repr() e nel debugger)"""
        return f"Punto({self.x}, {self.y})"

p = Punto(3, 4)
print(p)        # Output: (3, 4) - usa __str__
print(repr(p))  # Output: Punto(3, 4) - usa __repr__
```

### Operatori di Confronto

```python
class Temperatura:
    def __init__(self, celsius):
        self.celsius = celsius
    
    def __eq__(self, other):
        """Implementa l'operatore == """
        if isinstance(other, Temperatura):
            return self.celsius == other.celsius
        return False
    
    def __lt__(self, other):
        """Implementa l'operatore < """
        if isinstance(other, Temperatura):
            return self.celsius < other.celsius
        return NotImplemented
    
    def __le__(self, other):
        """Implementa l'operatore <= """
        if isinstance(other, Temperatura):
            return self.celsius <= other.celsius
        return NotImplemented

# Gli altri operatori (__gt__, __ge__, __ne__) possono essere dedotti da questi

t1 = Temperatura(20)
t2 = Temperatura(25)

print(t1 == t2)  # Output: False
print(t1 < t2)   # Output: True
print(t1 <= t2)  # Output: True
```

### Operatori Aritmetici

```python
class Vettore:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, other):
        """Implementa l'operatore + """
        if isinstance(other, Vettore):
            return Vettore(self.x + other.x, self.y + other.y)
        return NotImplemented
    
    def __sub__(self, other):
        """Implementa l'operatore - """
        if isinstance(other, Vettore):
            return Vettore(self.x - other.x, self.y - other.y)
        return NotImplemented
    
    def __mul__(self, scalar):
        """Implementa l'operatore * (moltiplicazione per uno scalare)"""
        if isinstance(scalar, (int, float)):
            return Vettore(self.x * scalar, self.y * scalar)
        return NotImplemented
    
    def __str__(self):
        return f"({self.x}, {self.y})"

v1 = Vettore(3, 4)
v2 = Vettore(1, 2)

print(v1 + v2)    # Output: (4, 6)
print(v1 - v2)    # Output: (2, 2)
print(v1 * 2)     # Output: (6, 8)
```

### Operatori di Contenimento

```python
class Mazzo:
    def __init__(self, carte):
        self.carte = carte
    
    def __contains__(self, carta):
        """Implementa l'operatore 'in'"""
        return carta in self.carte
    
    def __len__(self):
        """Implementa la funzione len()"""
        return len(self.carte)
    
    def __getitem__(self, indice):
        """Implementa l'accesso tramite indice: mazzo[i]"""
        return self.carte[indice]

mazzo = Mazzo(["Asso di Cuori", "Re di Picche", "Regina di Fiori"])

print("Asso di Cuori" in mazzo)  # Output: True
print(len(mazzo))                # Output: 3
print(mazzo[1])                  # Output: Re di Picche
```

### Iterazione

```python
class ContoAllaRovescia:
    def __init__(self, inizio):
        self.inizio = inizio
    
    def __iter__(self):
        """Restituisce un iteratore"""
        return self
    
    def __next__(self):
        """Restituisce il prossimo elemento o solleva StopIteration"""
        if self.inizio <= 0:
            raise StopIteration
        self.inizio -= 1
        return self.inizio + 1

# Utilizzo in un ciclo for
for numero in ContoAllaRovescia(5):
    print(numero)  # Output: 5, 4, 3, 2, 1
```

### Gestione del Contesto (Context Manager)

```python
class File:
    def __init__(self, nome_file, modalità):
        self.nome_file = nome_file
        self.modalità = modalità
    
    def __enter__(self):
        """Viene chiamato all'inizio del blocco 'with'"""
        self.file = open(self.nome_file, self.modalità)
        return self.file
    
    def __exit__(self, tipo_eccezione, valore_eccezione, traceback):
        """Viene chiamato alla fine del blocco 'with'"""
        self.file.close()
        # Restituire True per sopprimere l'eccezione, False per propagarla
        return False

# Utilizzo come context manager
with File("esempio.txt", "w") as f:
    f.write("Hello, World!")
# Il file viene chiuso automaticamente alla fine del blocco 'with'
```

### Callable Objects

```python
class Calcolatrice:
    def __init__(self, valore_iniziale=0):
        self.valore = valore_iniziale
    
    def __call__(self, x, operazione='+'):
        """Rende l'oggetto chiamabile come una funzione"""
        if operazione == '+':
            self.valore += x
        elif operazione == '-':
            self.valore -= x
        elif operazione == '*':
            self.valore *= x
        elif operazione == '/':
            self.valore /= x
        return self.valore

calc = Calcolatrice(10)
print(calc(5))      # Output: 15 (10 + 5)
print(calc(3, '*')) # Output: 45 (15 * 3)
```

## Attributi e Descrittori

```python
class Età:
    def __get__(self, instance, owner):
        return instance._età
    
    def __set__(self, instance, value):
        if value < 0:
            raise ValueError("L'età non può essere negativa")
        instance._età = value

class Persona:
    età = Età()  # Descrittore
    
    def __init__(self, nome, età):
        self.nome = nome
        self.età = età  # Usa il descrittore

p = Persona("Mario", 30)
print(p.età)  # Output: 30

try:
    p.età = -5  # Solleva ValueError
except ValueError as e:
    print(e)  # Output: L'età non può essere negativa
```

### Accesso agli Attributi

```python
class Dizionario:
    def __init__(self):
        self._dati = {}
    
    def __getattr__(self, nome):
        """Chiamato quando un attributo non esiste"""
        if nome in self._dati:
            return self._dati[nome]
        raise AttributeError(f"{nome} non esiste")
    
    def __setattr__(self, nome, valore):
        """Chiamato quando si assegna un valore a un attributo"""
        if nome == '_dati':
            # Permette l'inizializzazione di _dati
            super().__setattr__(nome, valore)
        else:
            # Memorizza altri attributi nel dizionario _dati
            self._dati[nome] = valore
    
    def __delattr__(self, nome):
        """Chiamato quando si elimina un attributo"""
        if nome in self._dati:
            del self._dati[nome]
        else:
            raise AttributeError(f"{nome} non esiste")

d = Dizionario()
d.nome = "Mario"  # Usa __setattr__
print(d.nome)     # Output: Mario - usa __getattr__
del d.nome        # Usa __delattr__
```

## Vantaggi dei Metodi Speciali

1. **Codice più Pythonic**: Seguono la filosofia di Python "esplicito è meglio che implicito"
2. **Integrazione con il linguaggio**: Permettono alle classi di comportarsi come i tipi integrati
3. **Interfacce intuitive**: Rendono le classi più facili da usare
4. **Riutilizzo del codice**: Implementano protocolli standard che possono essere utilizzati da altre parti del codice

## Best Practices

1. **Implementare `__repr__`**: Fornire sempre una rappresentazione formale dell'oggetto
2. **Coerenza**: Se implementi `__eq__`, considera di implementare anche `__hash__` per l'uso in dizionari e set
3. **Tipo di ritorno**: Restituire `NotImplemented` (non `NotImplementedError`) quando un'operazione non è supportata
4. **Documentazione**: Documentare chiaramente il comportamento dei metodi speciali
5. **Non abusarne**: Usare i metodi speciali solo quando necessario e appropriato

## Conclusione

I metodi speciali sono uno strumento potente che permette di creare classi che si integrano perfettamente con il resto del linguaggio Python. Conoscerli e saperli utilizzare correttamente è fondamentale per scrivere codice Python idiomatico ed efficace.

Nella prossima lezione, esploreremo l'ereditarietà, un altro concetto fondamentale della programmazione orientata agli oggetti che permette di creare gerarchie di classi e riutilizzare il codice in modo efficiente.