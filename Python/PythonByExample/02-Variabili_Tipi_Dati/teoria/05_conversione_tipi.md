# Conversione tra tipi di dati

## Introduzione alla conversione dei tipi
La conversione dei tipi (type conversion o type casting) è il processo di trasformazione di un valore da un tipo di dato a un altro. In Python, esistono due tipi principali di conversione:

1. **Conversione implicita**: avviene automaticamente durante l'esecuzione del programma.
2. **Conversione esplicita**: viene eseguita manualmente dal programmatore utilizzando funzioni specifiche.

## Conversione implicita
Python esegue automaticamente la conversione implicita in alcune situazioni, come quando si combinano tipi diversi in un'operazione.

```python
# Esempi di conversione implicita
intero = 10
float_num = 3.14

# Intero convertito implicitamente in float
risultato = intero + float_num
print(risultato)        # Output: 13.14
print(type(risultato))  # Output: <class 'float'>

# Intero convertito implicitamente in complex
complex_num = intero + 2j
print(complex_num)      # Output: (10+2j)
print(type(complex_num))  # Output: <class 'complex'>
```

Python segue una gerarchia di tipi per la conversione implicita:
- `int` → `float` → `complex`

Questo significa che in un'operazione tra tipi diversi, il risultato sarà del tipo più "alto" nella gerarchia.

## Conversione esplicita
La conversione esplicita viene eseguita utilizzando funzioni specifiche per ogni tipo di dato.

### Conversione a intero (int)
```python
# Conversione a intero
print(int(3.14))      # Output: 3 (tronca la parte decimale)
print(int("10"))      # Output: 10 (converte una stringa numerica)
print(int(True))      # Output: 1
print(int(False))     # Output: 0

# Conversione con base specificata
print(int("1010", 2))  # Output: 10 (converte un binario in decimale)
print(int("A", 16))    # Output: 10 (converte un esadecimale in decimale)
```

Nota: `int()` non può convertire stringhe non numeriche o numeri complessi.

### Conversione a float
```python
# Conversione a float
print(float(5))        # Output: 5.0
print(float("3.14"))   # Output: 3.14
print(float("2.5e3"))  # Output: 2500.0 (notazione scientifica)
print(float(True))     # Output: 1.0
print(float(False))    # Output: 0.0
```

### Conversione a complex
```python
# Conversione a complex
print(complex(5))        # Output: (5+0j)
print(complex(3.14))     # Output: (3.14+0j)
print(complex("3+4j"))   # Output: (3+4j)
print(complex(5, 2))     # Output: (5+2j) (reale, immaginario)
```

### Conversione a stringa (str)
```python
# Conversione a stringa
print(str(5))         # Output: "5"
print(str(3.14))      # Output: "3.14"
print(str(2+3j))      # Output: "(2+3j)"
print(str(True))      # Output: "True"
```

### Conversione a booleano (bool)
```python
# Conversione a booleano
print(bool(1))        # Output: True
print(bool(0))        # Output: False
print(bool(3.14))     # Output: True (qualsiasi numero diverso da 0)
print(bool(0.0))      # Output: False
print(bool("Python"))  # Output: True (qualsiasi stringa non vuota)
print(bool(""))       # Output: False (stringa vuota)
print(bool([1, 2]))   # Output: True (qualsiasi lista non vuota)
print(bool([]))       # Output: False (lista vuota)
```

## Conversione tra collezioni
Python permette anche la conversione tra vari tipi di collezioni.

```python
# Conversione tra collezioni
lista = [1, 2, 3, 4]
tupla = tuple(lista)    # Converte lista in tupla: (1, 2, 3, 4)
insieme = set(lista)    # Converte lista in insieme: {1, 2, 3, 4}

stringa = "Python"
lista_caratteri = list(stringa)  # Converte stringa in lista: ['P', 'y', 't', 'h', 'o', 'n']
```

## Funzioni di utilità per la conversione

### isinstance()
La funzione `isinstance()` verifica se un oggetto è di un determinato tipo.

```python
x = 5
y = 3.14
z = "Python"

print(isinstance(x, int))     # Output: True
print(isinstance(y, float))   # Output: True
print(isinstance(z, str))     # Output: True
print(isinstance(x, float))   # Output: False
```

### type()
La funzione `type()` restituisce il tipo di un oggetto.

```python
x = 5
y = 3.14
z = "Python"

print(type(x))  # Output: <class 'int'>
print(type(y))  # Output: <class 'float'>
print(type(z))  # Output: <class 'str'>
```

## Errori comuni nella conversione

```python
# Errori comuni

# Tentativo di convertire una stringa non numerica in intero
try:
    int("Python")
except ValueError as e:
    print(f"Errore: {e}")  # Output: Errore: invalid literal for int() with base 10: 'Python'

# Tentativo di convertire un numero complesso in intero
try:
    int(3+4j)
except TypeError as e:
    print(f"Errore: {e}")  # Output: Errore: can't convert complex to int
```

## Conversione sicura
Per evitare errori durante la conversione, è buona pratica verificare prima se la conversione è possibile.

```python
# Conversione sicura
def converti_a_intero(valore):
    try:
        return int(valore), True
    except (ValueError, TypeError):
        return None, False

# Test della funzione
risultato, successo = converti_a_intero("10")
if successo:
    print(f"Conversione riuscita: {risultato}")
else:
    print("Conversione fallita")

risultato, successo = converti_a_intero("Python")
if successo:
    print(f"Conversione riuscita: {risultato}")
else:
    print("Conversione fallita")
```

## Conclusione
La conversione tra tipi di dati è un'operazione fondamentale in Python e in molti altri linguaggi di programmazione. Comprendere come e quando eseguire conversioni di tipo è essenziale per scrivere programmi robusti ed evitare errori durante l'esecuzione. Python offre strumenti flessibili per la conversione sia implicita che esplicita, ma è importante utilizzarli con attenzione, specialmente quando si tratta di input forniti dall'utente o dati provenienti da fonti esterne.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Tipi booleani e operazioni logiche](./04_booleani.md) | [Prossimo: Costanti e convenzioni di nomenclatura](./06_costanti_nomenclatura.md)