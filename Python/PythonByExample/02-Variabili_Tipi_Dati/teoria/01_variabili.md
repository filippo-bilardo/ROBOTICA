# Cos'è una variabile in Python

## Definizione di variabile
In Python, una variabile è un nome simbolico che fa riferimento (o "punta") a un oggetto. Le variabili vengono utilizzate per memorizzare dati che possono essere utilizzati e manipolati all'interno di un programma. A differenza di altri linguaggi di programmazione, in Python non è necessario dichiarare esplicitamente il tipo di una variabile prima di utilizzarla.

## Creazione e assegnazione di variabili
In Python, le variabili vengono create quando si assegna loro un valore per la prima volta. L'operatore di assegnazione è il simbolo `=`.

```python
# Creazione di variabili
nome = "Alice"      # Variabile di tipo stringa
eta = 25           # Variabile di tipo intero
altezza = 1.65     # Variabile di tipo float
studente = True    # Variabile di tipo booleano
```

Python è un linguaggio a tipizzazione dinamica, il che significa che il tipo di una variabile viene determinato automaticamente in base al valore assegnato e può cambiare durante l'esecuzione del programma.

```python
x = 10        # x è un intero
print(type(x))  # Output: <class 'int'>

x = "hello"   # ora x è una stringa
print(type(x))  # Output: <class 'str'>
```

## Regole per i nomi delle variabili
Quando si creano variabili in Python, è necessario seguire alcune regole:

1. I nomi delle variabili possono contenere lettere (a-z, A-Z), numeri (0-9) e il carattere underscore (_).
2. I nomi delle variabili non possono iniziare con un numero.
3. I nomi delle variabili sono case-sensitive (età, Età e ETÀ sono tre variabili diverse).
4. I nomi delle variabili non possono essere parole chiave riservate di Python (come `if`, `for`, `while`, ecc.).

```python
# Nomi di variabili validi
nome = "Mario"
_nome = "Luigi"
nome_completo = "Mario Rossi"
nome1 = "Peach"

# Nomi di variabili non validi
# 1nome = "Bowser"     # Non può iniziare con un numero
# nome-completo = "Toad"  # Non può contenere il trattino
# if = "Yoshi"         # Non può essere una parola chiave
```

## Variabili multiple in una singola riga
Python permette di assegnare valori a più variabili in una singola riga:

```python
# Assegnazione multipla
x, y, z = 10, 20, 30

# Assegnazione dello stesso valore a più variabili
a = b = c = 5
```

## Variabili e memoria
In Python, le variabili non memorizzano direttamente i valori, ma riferimenti (o "puntatori") agli oggetti in memoria. Questo comportamento è particolarmente importante da comprendere quando si lavora con tipi di dati mutabili come liste e dizionari.

```python
# Esempio di riferimenti a oggetti
a = [1, 2, 3]  # 'a' punta a una lista in memoria
b = a          # 'b' punta alla stessa lista di 'a'
b.append(4)    # Modifica la lista attraverso 'b'
print(a)       # Output: [1, 2, 3, 4] - anche 'a' vede la modifica

# Per creare una copia indipendente
c = a.copy()   # 'c' punta a una nuova lista con gli stessi valori
c.append(5)    # Modifica la lista attraverso 'c'
print(a)       # Output: [1, 2, 3, 4] - 'a' non è influenzato
print(c)       # Output: [1, 2, 3, 4, 5]
```

## Conclusione
Le variabili sono uno dei concetti fondamentali in Python e in qualsiasi linguaggio di programmazione. Comprendere come funzionano le variabili è essenziale per scrivere programmi efficaci. La flessibilità di Python nella gestione delle variabili lo rende un linguaggio facile da imparare, ma è importante comprendere le regole e i comportamenti sottostanti per evitare errori comuni.

---

[Indice dell'esercitazione](../README.md) | [Prossimo: Tipi di dati numerici](./02_tipi_numerici.md)