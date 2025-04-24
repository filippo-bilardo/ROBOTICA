# Classi e Oggetti in Python

Le classi e gli oggetti sono i concetti fondamentali della programmazione orientata agli oggetti. In Python, tutto è un oggetto, inclusi numeri, stringhe e funzioni. Vediamo come definire e utilizzare classi e oggetti in Python.

## Definizione di una Classe

Una classe è un modello o un blueprint che definisce attributi (dati) e metodi (funzioni) comuni a tutti gli oggetti di quel tipo. In Python, si definisce una classe usando la parola chiave `class`:

```python
class NomeClasse:
    # Attributi e metodi della classe
    pass
```

Esempio di una classe semplice:

```python
class Persona:
    # Attributo di classe (condiviso da tutte le istanze)
    specie = "Homo Sapiens"
    
    # Metodo inizializzatore (costruttore)
    def __init__(self, nome, eta):
        # Attributi di istanza (specifici per ogni oggetto)
        self.nome = nome
        self.eta = eta
    
    # Metodo di istanza
    def saluta(self):
        return f"Ciao, mi chiamo {self.nome} e ho {self.eta} anni."
    
    # Metodo di istanza che modifica un attributo
    def compleanno(self):
        self.eta += 1
        return f"{self.nome} ora ha {self.eta} anni."
```

## Creazione di Oggetti (Istanze)

Un oggetto è un'istanza di una classe. Per creare un oggetto, si chiama la classe come se fosse una funzione:

```python
# Creazione di oggetti (istanze della classe Persona)
persona1 = Persona("Mario", 30)
persona2 = Persona("Lucia", 25)

# Accesso agli attributi
print(persona1.nome)  # Output: Mario
print(persona2.eta)   # Output: 25

# Accesso agli attributi di classe
print(persona1.specie)  # Output: Homo Sapiens
print(Persona.specie)   # Output: Homo Sapiens

# Chiamata ai metodi
print(persona1.saluta())  # Output: Ciao, mi chiamo Mario e ho 30 anni.
print(persona2.compleanno())  # Output: Lucia ora ha 26 anni.
```

## Il Parametro `self`

In Python, il primo parametro di ogni metodo di istanza è convenzionalmente chiamato `self` e si riferisce all'istanza stessa. Questo permette ai metodi di accedere e modificare gli attributi dell'oggetto:

```python
def metodo(self, altri_parametri):
    # self si riferisce all'istanza corrente
    self.attributo = nuovo_valore
```

È importante notare che `self` non è una parola chiave in Python, ma una convenzione. Tecnicamente, potresti usare qualsiasi nome, ma è fortemente consigliato seguire questa convenzione per la leggibilità del codice.

## Attributi di Classe vs Attributi di Istanza

- **Attributi di classe**: Sono condivisi da tutte le istanze della classe. Sono definiti all'interno della classe ma fuori da qualsiasi metodo.
- **Attributi di istanza**: Sono specifici per ogni oggetto. Sono generalmente definiti nel metodo `__init__`.

```python
class Esempio:
    # Attributo di classe
    attributo_classe = "Sono condiviso da tutte le istanze"
    
    def __init__(self, valore):
        # Attributo di istanza
        self.attributo_istanza = valore

# Creazione di istanze
oggetto1 = Esempio("Valore 1")
oggetto2 = Esempio("Valore 2")

# Accesso agli attributi
print(oggetto1.attributo_classe)    # Output: Sono condiviso da tutte le istanze
print(oggetto2.attributo_classe)    # Output: Sono condiviso da tutte le istanze
print(oggetto1.attributo_istanza)   # Output: Valore 1
print(oggetto2.attributo_istanza)   # Output: Valore 2

# Modifica di un attributo di classe
Esempio.attributo_classe = "Valore modificato"
print(oggetto1.attributo_classe)    # Output: Valore modificato
print(oggetto2.attributo_classe)    # Output: Valore modificato
```

## Aggiungere e Modificare Attributi Dinamicamente

In Python, è possibile aggiungere o modificare attributi di un oggetto anche dopo la sua creazione:

```python
persona1 = Persona("Mario", 30)

# Aggiunta di un nuovo attributo
persona1.professione = "Ingegnere"
print(persona1.professione)  # Output: Ingegnere

# Modifica di un attributo esistente
persona1.nome = "Mario Rossi"
print(persona1.nome)  # Output: Mario Rossi
```

Tuttavia, questa pratica può rendere il codice meno prevedibile e più difficile da mantenere, quindi è generalmente consigliato definire tutti gli attributi nel metodo `__init__`.

## Esempio Pratico: Gestione di un Conto Bancario

Ecco un esempio più completo che mostra come utilizzare classi e oggetti per modellare un conto bancario:

```python
class ContoBancario:
    # Attributo di classe
    tasso_interesse = 0.01
    
    def __init__(self, intestatario, saldo_iniziale=0):
        self.intestatario = intestatario
        self.saldo = saldo_iniziale
        self.transazioni = []
        # Registra il deposito iniziale se presente
        if saldo_iniziale > 0:
            self.transazioni.append(("deposito", saldo_iniziale))
    
    def deposita(self, importo):
        if importo <= 0:
            return "L'importo deve essere positivo"
        self.saldo += importo
        self.transazioni.append(("deposito", importo))
        return f"Depositati {importo}€. Nuovo saldo: {self.saldo}€"
    
    def preleva(self, importo):
        if importo <= 0:
            return "L'importo deve essere positivo"
        if importo > self.saldo:
            return "Fondi insufficienti"
        self.saldo -= importo
        self.transazioni.append(("prelievo", importo))
        return f"Prelevati {importo}€. Nuovo saldo: {self.saldo}€"
    
    def applica_interesse(self):
        interesse = self.saldo * self.tasso_interesse
        self.saldo += interesse
        self.transazioni.append(("interesse", interesse))
        return f"Interesse applicato: {interesse:.2f}€. Nuovo saldo: {self.saldo:.2f}€"
    
    def storico_transazioni(self):
        if not self.transazioni:
            return "Nessuna transazione effettuata"
        risultato = "Storico transazioni:\n"
        for tipo, importo in self.transazioni:
            risultato += f"- {tipo.capitalize()}: {importo:.2f}€\n"
        return risultato

# Utilizzo della classe
conto = ContoBancario("Mario Rossi", 1000)
print(conto.deposita(500))  # Output: Depositati 500€. Nuovo saldo: 1500€
print(conto.preleva(200))   # Output: Prelevati 200€. Nuovo saldo: 1300€
print(conto.applica_interesse())  # Output: Interesse applicato: 13.00€. Nuovo saldo: 1313.00€
print(conto.storico_transazioni())
```

## Conclusione

Le classi e gli oggetti sono strumenti potenti che permettono di organizzare il codice in modo più strutturato e modulare. In Python, la sintassi per definire e utilizzare classi è relativamente semplice, ma i concetti sottostanti sono profondi e potenti.

Nei prossimi capitoli, esploreremo concetti più avanzati come l'ereditarietà, il polimorfismo e l'incapsulamento, che ci permetteranno di sfruttare appieno il potenziale della programmazione orientata agli oggetti.

## Navigazione

- [Torna all'indice dell'esercitazione](../README.md)
- [Precedente: Introduzione alla Programmazione Orientata agli Oggetti](./01_introduzione_oop.md)
- [Prossimo: Attributi e Metodi](./03_attributi_metodi.md)