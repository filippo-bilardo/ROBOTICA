# Definizione e Chiamata di Funzioni

Le funzioni sono blocchi di codice riutilizzabili che eseguono un'operazione specifica. In Python, le funzioni sono uno strumento fondamentale per organizzare il codice in modo modulare ed efficiente.

## Sintassi di base

Per definire una funzione in Python, si utilizza la parola chiave `def` seguita dal nome della funzione e da parentesi tonde. All'interno delle parentesi si possono specificare i parametri che la funzione accetta.

```python
def nome_funzione(parametro1, parametro2, ...):
    # Corpo della funzione
    # Istruzioni da eseguire
    return valore  # Opzionale
```

## Esempio di funzione semplice

```python
def saluta():
    print("Ciao, mondo!")

# Chiamata della funzione
saluta()  # Output: Ciao, mondo!
```

In questo esempio, abbiamo definito una funzione chiamata `saluta` che non accetta parametri e stampa semplicemente "Ciao, mondo!" quando viene chiamata.

## Funzioni con parametri

Le funzioni possono accettare parametri, che sono valori passati alla funzione quando viene chiamata.

```python
def saluta_persona(nome):
    print(f"Ciao, {nome}!")

# Chiamata della funzione con un argomento
saluta_persona("Alice")  # Output: Ciao, Alice!
saluta_persona("Bob")    # Output: Ciao, Bob!
```

In questo esempio, la funzione `saluta_persona` accetta un parametro `nome` e lo utilizza per personalizzare il messaggio di saluto.

## Funzioni con valori di ritorno

Le funzioni possono restituire un valore utilizzando l'istruzione `return`. Questo valore può essere assegnato a una variabile o utilizzato in altre espressioni.

```python
def somma(a, b):
    return a + b

# Utilizzo del valore restituito dalla funzione
risultato = somma(3, 5)
print(risultato)  # Output: 8
print(somma(10, 20))  # Output: 30
```

In questo esempio, la funzione `somma` accetta due parametri `a` e `b`, calcola la loro somma e restituisce il risultato.

## Funzioni senza valore di ritorno

Se una funzione non include un'istruzione `return`, o se l'istruzione `return` non specifica un valore, la funzione restituisce implicitamente `None`.

```python
def stampa_messaggio(messaggio):
    print(messaggio)
    # Nessun return esplicito

risultato = stampa_messaggio("Questo è un test")
print(risultato)  # Output: None
```

## Chiamata di funzioni

Per chiamare una funzione, si utilizza il nome della funzione seguito da parentesi tonde. Se la funzione accetta parametri, questi vengono specificati all'interno delle parentesi.

```python
def calcola_area_rettangolo(base, altezza):
    return base * altezza

# Chiamata della funzione con argomenti posizionali
area1 = calcola_area_rettangolo(5, 10)
print(area1)  # Output: 50

# Chiamata della funzione con argomenti keyword
area2 = calcola_area_rettangolo(altezza=8, base=4)
print(area2)  # Output: 32
```

## Docstring

È buona pratica documentare le funzioni utilizzando le docstring, che sono stringhe di documentazione che descrivono lo scopo e l'utilizzo della funzione.

```python
def calcola_area_cerchio(raggio):
    """Calcola l'area di un cerchio dato il raggio.
    
    Args:
        raggio (float): Il raggio del cerchio.
        
    Returns:
        float: L'area del cerchio.
    """
    import math
    return math.pi * raggio ** 2

# Accesso alla docstring
print(calcola_area_cerchio.__doc__)
```

## Funzioni come oggetti di prima classe

In Python, le funzioni sono oggetti di prima classe, il che significa che possono essere assegnate a variabili, passate come argomenti ad altre funzioni e restituite da altre funzioni.

```python
def saluta(nome):
    return f"Ciao, {nome}!"

# Assegnazione di una funzione a una variabile
funzione_saluto = saluta
print(funzione_saluto("Charlie"))  # Output: Ciao, Charlie!

# Passaggio di una funzione come argomento
def applica_funzione(f, valore):
    return f(valore)

print(applica_funzione(saluta, "Dave"))  # Output: Ciao, Dave!
```

## Conclusione

Le funzioni sono uno strumento potente in Python che permette di organizzare il codice in blocchi riutilizzabili. Definire funzioni ben strutturate e documentate è fondamentale per scrivere codice pulito, manutenibile ed efficiente.

---

[Indice dell'esercitazione](../README.md) | [Prossimo: Parametri e Argomenti](./02_parametri_argomenti.md)