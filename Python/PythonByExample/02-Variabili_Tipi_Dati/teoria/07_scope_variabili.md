# Scope delle variabili

## Introduzione allo scope
Lo "scope" (ambito di visibilità) di una variabile determina dove la variabile è accessibile all'interno del codice. In Python, lo scope di una variabile è determinato dal blocco in cui è stata creata. Comprendere lo scope delle variabili è fondamentale per evitare errori e scrivere codice più manutenibile.

## Tipi di scope in Python
Python ha quattro tipi principali di scope:

1. **Local scope** (ambito locale)
2. **Enclosing scope** (ambito racchiudente)
3. **Global scope** (ambito globale)
4. **Built-in scope** (ambito incorporato)

Questi quattro tipi di scope seguono la regola LEGB (Local, Enclosing, Global, Built-in), che è l'ordine in cui Python cerca i nomi delle variabili.

## Local scope (ambito locale)
Le variabili definite all'interno di una funzione hanno un ambito locale e sono accessibili solo all'interno di quella funzione.

```python
def funzione():
    x = 10  # Variabile locale
    print(f"Dentro la funzione: x = {x}")

funzione()  # Output: Dentro la funzione: x = 10

# print(x)  # Questo genererebbe un errore: NameError: name 'x' is not defined
```

Le variabili locali esistono solo durante l'esecuzione della funzione e vengono distrutte quando la funzione termina.

## Enclosing scope (ambito racchiudente)
L'ambito racchiudente si riferisce allo scope di una funzione esterna quando si definisce una funzione annidata (una funzione all'interno di un'altra funzione).

```python
def esterna():
    y = 20  # Variabile nell'ambito racchiudente
    
    def interna():
        print(f"Dentro la funzione interna: y = {y}")  # Accesso alla variabile dell'ambito racchiudente
    
    interna()

esterna()  # Output: Dentro la funzione interna: y = 20
```

La funzione `interna()` può accedere alla variabile `y` definita nella funzione `esterna()`.

## Global scope (ambito globale)
Le variabili definite a livello di modulo (fuori da qualsiasi funzione o classe) hanno un ambito globale e sono accessibili da qualsiasi parte del modulo.

```python
z = 30  # Variabile globale

def funzione():
    print(f"Dentro la funzione: z = {z}")  # Accesso alla variabile globale

funzione()  # Output: Dentro la funzione: z = 30
print(f"Fuori dalla funzione: z = {z}")  # Output: Fuori dalla funzione: z = 30
```

### Modificare variabili globali
Per modificare una variabile globale all'interno di una funzione, è necessario utilizzare la parola chiave `global`.

```python
contatore = 0  # Variabile globale

def incrementa():
    global contatore  # Dichiarazione che si intende utilizzare la variabile globale
    contatore += 1
    print(f"Contatore: {contatore}")

incrementta()  # Output: Contatore: 1
incrementta()  # Output: Contatore: 2
print(f"Valore finale: {contatore}")  # Output: Valore finale: 2
```

Senza la dichiarazione `global`, Python creerebbe una nuova variabile locale `contatore` all'interno della funzione, lasciando invariata la variabile globale.

## Built-in scope (ambito incorporato)
L'ambito incorporato contiene i nomi predefiniti di Python, come le funzioni `print()`, `len()`, `range()`, ecc. Questi nomi sono sempre disponibili in qualsiasi programma Python.

```python
# Utilizzo di funzioni built-in
print(len("Python"))  # Output: 6
print(max([1, 5, 3]))  # Output: 5
```

## La regola LEGB
Quando Python incontra un nome di variabile, lo cerca nei seguenti ambiti, nell'ordine:

1. **L**ocal (locale): variabili definite all'interno della funzione corrente
2. **E**nclosing (racchiudente): variabili definite in funzioni esterne che racchiudono la funzione corrente
3. **G**lobal (globale): variabili definite a livello di modulo
4. **B**uilt-in (incorporato): nomi predefiniti di Python

```python
x = 10  # Variabile globale

def esterna():
    x = 20  # Variabile nell'ambito racchiudente
    
    def interna():
        x = 30  # Variabile locale
        print(f"Interna: x = {x}")  # Utilizza la variabile locale
    
    interna()  # Output: Interna: x = 30
    print(f"Esterna: x = {x}")  # Utilizza la variabile dell'ambito racchiudente

esterna()  # Output: Esterna: x = 20
print(f"Globale: x = {x}")  # Output: Globale: x = 10
```

## La parola chiave `nonlocal`
La parola chiave `nonlocal` è simile a `global`, ma si riferisce a variabili nell'ambito racchiudente anziché nell'ambito globale. È utile quando si desidera modificare una variabile di una funzione esterna da una funzione annidata.

```python
def contatore():
    count = 0  # Variabile nell'ambito racchiudente
    
    def incrementa():
        nonlocal count  # Dichiarazione che si intende utilizzare la variabile dell'ambito racchiudente
        count += 1
        return count
    
    return incrementa

conta = contatore()  # conta è ora la funzione incrementa
print(conta())  # Output: 1
print(conta())  # Output: 2
print(conta())  # Output: 3
```

Senza la dichiarazione `nonlocal`, Python genererebbe un errore quando si tenta di modificare `count` all'interno della funzione `incrementa()`.

## Buone pratiche

1. **Limitare l'uso di variabili globali**: Le variabili globali possono rendere il codice più difficile da comprendere e debuggare. È meglio passare i valori come parametri alle funzioni quando possibile.

2. **Evitare nomi di variabili duplicati**: Anche se Python permette di avere variabili con lo stesso nome in diversi ambiti, questo può causare confusione. È meglio utilizzare nomi diversi per evitare ambiguità.

3. **Utilizzare `global` e `nonlocal` con parsimonia**: Queste parole chiave possono rendere il flusso del programma più difficile da seguire. Utilizzarle solo quando necessario.

4. **Preferire il passaggio di parametri**: Invece di accedere a variabili di ambiti esterni, è spesso più chiaro passare i valori come parametri alle funzioni.

```python
# Approccio meno chiaro
totale = 0

def aggiungi(valore):
    global totale
    totale += valore

# Approccio più chiaro
def aggiungi(totale, valore):
    return totale + valore

totale = 0
totale = aggiungi(totale, 5)
```

## Conclusione
Comprendere lo scope delle variabili è fondamentale per scrivere codice Python corretto ed efficace. La regola LEGB fornisce un quadro chiaro per capire come Python risolve i nomi delle variabili. Seguendo le buone pratiche relative allo scope, è possibile scrivere codice più manutenibile e meno soggetto a errori.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Costanti e convenzioni di nomenclatura](./06_costanti_nomenclatura.md)