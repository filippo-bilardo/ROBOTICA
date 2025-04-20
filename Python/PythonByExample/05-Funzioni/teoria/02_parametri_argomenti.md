# Parametri e Argomenti

In Python, i parametri e gli argomenti sono concetti fondamentali per la creazione di funzioni flessibili e riutilizzabili. Questa guida esplora i diversi tipi di parametri e come passare argomenti alle funzioni.

## Parametri posizionali

I parametri posizionali sono i più comuni e vengono definiti semplicemente elencandoli nella dichiarazione della funzione.

```python
def saluta(nome, messaggio):
    print(f"{messaggio}, {nome}!")

# Chiamata con argomenti posizionali
saluta("Mario", "Buongiorno")  # Output: Buongiorno, Mario!
```

Gli argomenti vengono assegnati ai parametri in base alla loro posizione.

## Parametri con valori predefiniti

È possibile assegnare valori predefiniti ai parametri, che verranno utilizzati se non viene fornito un argomento corrispondente.

```python
def saluta(nome, messaggio="Ciao"):
    print(f"{messaggio}, {nome}!")

# Utilizzo del valore predefinito per il secondo parametro
saluta("Luigi")  # Output: Ciao, Luigi!

# Sovrascrittura del valore predefinito
saluta("Luigi", "Benvenuto")  # Output: Benvenuto, Luigi!
```

I parametri con valori predefiniti devono sempre seguire i parametri senza valori predefiniti.

## Argomenti keyword

Gli argomenti keyword permettono di specificare gli argomenti per nome, indipendentemente dall'ordine.

```python
def descrivi_persona(nome, età, professione):
    print(f"{nome} ha {età} anni e lavora come {professione}.")

# Utilizzo di argomenti keyword
descrivi_persona(età=30, nome="Anna", professione="ingegnere")
# Output: Anna ha 30 anni e lavora come ingegnere.
```

## Parametri *args (argomenti variabili posizionali)

Il parametro `*args` permette a una funzione di accettare un numero variabile di argomenti posizionali.

```python
def somma_numeri(*numeri):
    risultato = 0
    for numero in numeri:
        risultato += numero
    return risultato

# Chiamata con diversi numeri di argomenti
print(somma_numeri(1, 2))  # Output: 3
print(somma_numeri(1, 2, 3, 4, 5))  # Output: 15
```

All'interno della funzione, `*args` viene trattato come una tupla.

## Parametri **kwargs (argomenti variabili keyword)

Il parametro `**kwargs` permette a una funzione di accettare un numero variabile di argomenti keyword.

```python
def crea_profilo(**dati):
    print("Profilo utente:")
    for chiave, valore in dati.items():
        print(f"{chiave}: {valore}")

# Chiamata con diversi argomenti keyword
crea_profilo(nome="Carlo", età=25, città="Roma")
# Output:
# Profilo utente:
# nome: Carlo
# età: 25
# città: Roma
```

All'interno della funzione, `**kwargs` viene trattato come un dizionario.

## Ordine dei parametri

Quando si definisce una funzione con diversi tipi di parametri, è necessario seguire un ordine specifico:

1. Parametri posizionali
2. Parametri con valori predefiniti
3. Parametri *args
4. Parametri keyword-only
5. Parametri **kwargs

```python
def funzione_completa(pos1, pos2, default1="valore1", default2="valore2", *args, kw_only1, kw_only2="valore3", **kwargs):
    print(f"Posizionali: {pos1}, {pos2}")
    print(f"Default: {default1}, {default2}")
    print(f"Args: {args}")
    print(f"Keyword-only: {kw_only1}, {kw_only2}")
    print(f"Kwargs: {kwargs}")

# Chiamata della funzione
funzione_completa(1, 2, "nuovo1", *[3, 4, 5], kw_only1="valore", extra1="extra", extra2="extra2")
```

## Parametri keyword-only

I parametri keyword-only possono essere specificati dopo `*args` o dopo un singolo asterisco e possono essere passati solo come argomenti keyword.

```python
def funzione(pos, *, kw1, kw2="default"):
    print(f"Posizionale: {pos}, Keyword-only: {kw1}, {kw2}")

# Chiamata corretta
funzione(1, kw1="valore")  # Output: Posizionale: 1, Keyword-only: valore, default

# Questo causerebbe un errore:
# funzione(1, "valore")  # TypeError: funzione() takes 1 positional argument but 2 were given
```

## Parametri posizionali-only (Python 3.8+)

I parametri posizionali-only possono essere specificati prima di una barra (`/`) e possono essere passati solo come argomenti posizionali.

```python
def funzione(pos1, pos2, /, pos_o_kw, *, kw):
    print(f"Posizionali-only: {pos1}, {pos2}")
    print(f"Posizionale o keyword: {pos_o_kw}")
    print(f"Keyword-only: {kw}")

# Chiamata corretta
funzione(1, 2, 3, kw="valore")  # Tutti gli argomenti passati correttamente
funzione(1, 2, pos_o_kw=3, kw="valore")  # pos_o_kw passato come keyword

# Questo causerebbe un errore:
# funzione(pos1=1, pos2=2, pos_o_kw=3, kw="valore")  # TypeError: funzione() got some positional-only arguments passed as keyword arguments: 'pos1, pos2'
```

## Unpacking di argomenti

È possibile "spacchettare" (unpack) sequenze e dizionari per passarli come argomenti a una funzione.

```python
def somma(a, b, c):
    return a + b + c

# Unpacking di una lista
numeri = [1, 2, 3]
print(somma(*numeri))  # Output: 6

# Unpacking di un dizionario
valori = {"a": 10, "b": 20, "c": 30}
print(somma(**valori))  # Output: 60
```

## Conclusione

Comprendere i diversi tipi di parametri e come passare argomenti alle funzioni è fondamentale per creare codice Python flessibile e riutilizzabile. La combinazione di questi concetti permette di creare interfacce di funzione intuitive e potenti.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Definizione e Chiamata di Funzioni](./01_definizione_funzioni.md) | [Prossimo: Funzioni Ricorsive](./03_funzioni_ricorsive.md)