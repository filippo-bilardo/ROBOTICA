# Polimorfismo in Python

Il polimorfismo è uno dei quattro pilastri fondamentali della programmazione orientata agli oggetti, insieme all'incapsulamento, all'astrazione e all'ereditarietà. Il termine "polimorfismo" deriva dal greco e significa "molte forme". In programmazione, si riferisce alla capacità di oggetti di classi diverse di rispondere allo stesso messaggio (chiamata di metodo) in modi diversi.

## Cos'è il Polimorfismo

Il polimorfismo permette di utilizzare un'interfaccia comune per diversi tipi di dati. In termini più semplici, consente di trattare oggetti di classi diverse in modo uniforme, purché implementino gli stessi metodi o interfacce.

In Python, il polimorfismo è strettamente legato al concetto di "duck typing": "Se cammina come un'anatra e starnazza come un'anatra, allora probabilmente è un'anatra". Questo significa che Python non si preoccupa del tipo specifico di un oggetto, ma solo se supporta i metodi e le operazioni che vengono richiesti.

## Tipi di Polimorfismo in Python

### 1. Polimorfismo con Funzioni e Metodi

Una funzione può operare su diversi tipi di oggetti, purché supportino le operazioni richieste:

```python
def somma(x, y):
    return x + y

# Funziona con numeri
print(somma(5, 3))        # Output: 8

# Funziona con stringhe
print(somma("Hello, ", "World!"))  # Output: Hello, World!

# Funziona con liste
print(somma([1, 2], [3, 4]))     # Output: [1, 2, 3, 4]
```

### 2. Polimorfismo con Classi

Classi diverse possono implementare metodi con lo stesso nome, che verranno chiamati in base al tipo dell'oggetto:

```python
class Gatto:
    def verso(self):
        return "Miao!"
    
    def movimento(self):
        return "Il gatto si muove silenziosamente."

class Cane:
    def verso(self):
        return "Bau!"
    
    def movimento(self):
        return "Il cane corre felicemente."

# Funzione che utilizza il polimorfismo
def descrivi_animale(animale):
    return f"Verso: {animale.verso()}\nMovimento: {animale.movimento()}"

# Creazione di istanze
gatto = Gatto()
cane = Cane()

# La stessa funzione opera su oggetti di classi diverse
print(descrivi_animale(gatto))
# Output:
# Verso: Miao!
# Movimento: Il gatto si muove silenziosamente.

print(descrivi_animale(cane))
# Output:
# Verso: Bau!
# Movimento: Il cane corre felicemente.
```

### 3. Polimorfismo con Ereditarietà

Il polimorfismo è particolarmente potente quando combinato con l'ereditarietà. Le sottoclassi possono sovrascrivere (override) i metodi della classe base per fornire implementazioni specifiche:

```python
class Forma:
    def area(self):
        raise NotImplementedError("Le sottoclassi devono implementare questo metodo")
    
    def descrizione(self):
        return "Questa è una forma geometrica."

class Rettangolo(Forma):
    def __init__(self, larghezza, altezza):
        self.larghezza = larghezza
        self.altezza = altezza
    
    def area(self):
        return self.larghezza * self.altezza
    
    def descrizione(self):
        return f"Questo è un rettangolo di dimensioni {self.larghezza}x{self.altezza}."

class Cerchio(Forma):
    def __init__(self, raggio):
        self.raggio = raggio
    
    def area(self):
        import math
        return math.pi * (self.raggio ** 2)
    
    def descrizione(self):
        return f"Questo è un cerchio di raggio {self.raggio}."

# Lista di forme diverse
forme = [Rettangolo(5, 3), Cerchio(4), Rettangolo(2, 8)]

# Iterazione polimorfica
for forma in forme:
    print(f"{forma.descrizione()} Area: {forma.area():.2f}")

# Output:
# Questo è un rettangolo di dimensioni 5x3. Area: 15.00
# Questo è un cerchio di raggio 4. Area: 50.27
# Questo è un rettangolo di dimensioni 2x8. Area: 16.00
```

## Vantaggi del Polimorfismo

1. **Flessibilità**: Il codice può operare su oggetti di classi diverse senza conoscerne il tipo specifico.
2. **Estensibilità**: È possibile aggiungere nuove classi che implementano la stessa interfaccia senza modificare il codice esistente.
3. **Riutilizzo del codice**: Le funzioni possono essere riutilizzate con diversi tipi di oggetti.
4. **Manutenibilità**: Il codice diventa più modulare e più facile da mantenere.

## Polimorfismo e Duck Typing

A differenza di linguaggi come Java o C++, Python non richiede che le classi dichiarino esplicitamente quali interfacce implementano. Questo approccio, noto come "duck typing", si basa sul comportamento degli oggetti piuttosto che sul loro tipo dichiarato:

```python
class Anatra:
    def nuota(self):
        return "L'anatra nuota nel lago."
    
    def verso(self):
        return "Quack!"

class Persona:
    def nuota(self):
        return "La persona nuota in piscina."
    
    def verso(self):
        return "Ciao!"

def fai_nuotare_e_parlare(oggetto):
    print(oggetto.nuota())
    print(oggetto.verso())

# Entrambi gli oggetti possono essere usati con la stessa funzione
anatra = Anatra()
persona = Persona()

fai_nuotare_e_parlare(anatra)
# Output:
# L'anatra nuota nel lago.
# Quack!

fai_nuotare_e_parlare(persona)
# Output:
# La persona nuota in piscina.
# Ciao!
```

## Metodi Speciali e Polimorfismo degli Operatori

Python utilizza il polimorfismo anche per gli operatori attraverso i metodi speciali (dunder methods). Questo permette di definire come gli operatori standard si comportano con oggetti personalizzati:

```python
class Vettore:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, altro):
        return Vettore(self.x + altro.x, self.y + altro.y)
    
    def __str__(self):
        return f"({self.x}, {self.y})"

# Creazione di vettori
v1 = Vettore(2, 3)
v2 = Vettore(5, 7)

# Utilizzo dell'operatore + con oggetti personalizzati
v3 = v1 + v2
print(v3)  # Output: (7, 10)
```

## Conclusione

Il polimorfismo è un concetto potente che permette di scrivere codice più flessibile, estensibile e riutilizzabile. In Python, grazie al duck typing, il polimorfismo è particolarmente naturale e intuitivo. Combinato con l'ereditarietà, permette di creare gerarchie di classi ben strutturate con comportamenti specializzati ma interfacce comuni.

Nella prossima lezione, esploreremo le classi astratte e le interfacce in Python, che forniscono un modo più formale per definire contratti che le classi devono rispettare, rafforzando ulteriormente il concetto di polimorfismo.