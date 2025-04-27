# Introduzione agli Algoritmi

## Cosa sono gli algoritmi

Un algoritmo è una sequenza finita di istruzioni ben definite che, se seguite, permettono di risolvere un problema o eseguire un compito specifico. Gli algoritmi sono alla base dell'informatica e della programmazione, e rappresentano il modo in cui pensiamo alla risoluzione dei problemi in modo sistematico.

In Python, come in qualsiasi altro linguaggio di programmazione, gli algoritmi vengono implementati attraverso il codice. La qualità di un algoritmo può essere valutata in base a diversi criteri:

- **Correttezza**: l'algoritmo deve produrre il risultato corretto per tutti gli input validi
- **Efficienza**: l'algoritmo deve utilizzare le risorse (tempo e memoria) in modo ottimale
- **Semplicità**: l'algoritmo dovrebbe essere il più semplice possibile, mantenendo la correttezza e l'efficienza
- **Generalità**: l'algoritmo dovrebbe essere applicabile a una vasta gamma di input

## Analisi della complessità

L'analisi della complessità è un aspetto fondamentale nello studio degli algoritmi. Ci permette di valutare l'efficienza di un algoritmo in termini di tempo di esecuzione e spazio di memoria utilizzato, indipendentemente dall'hardware o dal linguaggio di programmazione.

### Notazione O grande (Big O Notation)

La notazione O grande è il modo più comune per esprimere la complessità di un algoritmo. Essa descrive il comportamento asintotico di una funzione, ovvero come cresce il tempo di esecuzione o lo spazio di memoria al crescere della dimensione dell'input.

Ecco alcune delle complessità più comuni:

- **O(1)** - Complessità costante: il tempo di esecuzione è indipendente dalla dimensione dell'input
- **O(log n)** - Complessità logaritmica: il tempo di esecuzione cresce logaritmicamente con la dimensione dell'input
- **O(n)** - Complessità lineare: il tempo di esecuzione cresce linearmente con la dimensione dell'input
- **O(n log n)** - Complessità linearitmica: comune in algoritmi efficienti di ordinamento
- **O(n²)** - Complessità quadratica: comune in algoritmi con cicli annidati
- **O(2^n)** - Complessità esponenziale: algoritmi molto inefficienti per input grandi
- **O(n!)** - Complessità fattoriale: algoritmi estremamente inefficienti

### Esempio di analisi

Consideriamo due algoritmi per trovare il valore massimo in una lista non ordinata:

```python
# Algoritmo 1: Scansione lineare
def trova_massimo_lineare(lista):
    if not lista:
        return None
    massimo = lista[0]
    for elemento in lista[1:]:
        if elemento > massimo:
            massimo = elemento
    return massimo

# Algoritmo 2: Ordinamento e selezione
def trova_massimo_ordinamento(lista):
    if not lista:
        return None
    lista_ordinata = sorted(lista)  # Utilizza un algoritmo di ordinamento
    return lista_ordinata[-1]       # Restituisce l'ultimo elemento
```

Analisi:
- L'algoritmo 1 ha complessità O(n), poiché esegue una singola scansione della lista
- L'algoritmo 2 ha complessità O(n log n), poiché utilizza un algoritmo di ordinamento

In questo caso, l'algoritmo 1 è più efficiente, nonostante sembri più semplice.

## Casi di analisi

Quando analizziamo un algoritmo, consideriamo diversi scenari:

- **Caso migliore**: la situazione più favorevole per l'algoritmo
- **Caso medio**: il comportamento tipico dell'algoritmo
- **Caso peggiore**: la situazione meno favorevole per l'algoritmo

Spesso ci concentriamo sul caso peggiore, poiché ci dà una garanzia sulle prestazioni dell'algoritmo in qualsiasi situazione.

## Compromessi negli algoritmi

Nella progettazione degli algoritmi, spesso ci troviamo a fare dei compromessi tra:

- **Tempo vs Spazio**: algoritmi più veloci potrebbero richiedere più memoria e viceversa
- **Semplicità vs Efficienza**: algoritmi più efficienti potrebbero essere più complessi da implementare e mantenere
- **Generalità vs Ottimizzazione**: algoritmi più generali potrebbero essere meno efficienti per casi specifici

## Strategie di progettazione degli algoritmi

Esistono diverse strategie per progettare algoritmi efficienti:

- **Divide et impera**: dividere il problema in sottoproblemi più piccoli, risolverli e combinare le soluzioni
- **Programmazione dinamica**: memorizzare i risultati dei sottoproblemi per evitare calcoli ripetuti
- **Algoritmi greedy**: fare la scelta localmente ottimale ad ogni passo
- **Backtracking**: esplorare tutte le possibili soluzioni e tornare indietro quando necessario

## Esempio pratico: Ricerca binaria

La ricerca binaria è un esempio classico di algoritmo efficiente che utilizza la strategia divide et impera:

```python
def ricerca_binaria(lista, elemento):
    """Cerca un elemento in una lista ordinata utilizzando la ricerca binaria."""
    sinistra, destra = 0, len(lista) - 1
    
    while sinistra <= destra:
        medio = (sinistra + destra) // 2
        
        if lista[medio] == elemento:
            return medio  # Elemento trovato, restituisce l'indice
        elif lista[medio] < elemento:
            sinistra = medio + 1  # Cerca nella metà destra
        else:
            destra = medio - 1  # Cerca nella metà sinistra
    
    return -1  # Elemento non trovato
```

La ricerca binaria ha una complessità O(log n), rendendola molto più efficiente della ricerca lineare O(n) per liste ordinate di grandi dimensioni.

## Conclusione

La comprensione degli algoritmi e della loro analisi è fondamentale per scrivere codice efficiente. In Python, grazie alla sua sintassi chiara e alle sue potenti librerie, possiamo implementare e sperimentare con vari algoritmi in modo relativamente semplice.

Nelle prossime guide, esploreremo in dettaglio diversi tipi di algoritmi e strutture dati, implementandoli in Python e analizzando le loro caratteristiche.

## Esercizi

1. Implementa un algoritmo che verifichi se una stringa è un palindromo (si legge allo stesso modo da sinistra a destra e da destra a sinistra) e analizza la sua complessità.

2. Scrivi due diversi algoritmi per calcolare il numero di Fibonacci F(n) e confronta le loro complessità.

3. Implementa un algoritmo che trovi tutte le coppie di numeri in una lista la cui somma è uguale a un valore dato. Qual è la complessità del tuo algoritmo?

4. Analizza la complessità del seguente codice:
   ```python
   def funzione_misteriosa(n):
       risultato = 0
       for i in range(n):
           for j in range(i, n):
               risultato += i * j
       return risultato
   ```

5. Progetta un algoritmo per trovare il secondo elemento più grande in una lista non ordinata con la minor complessità possibile.

## Risorse aggiuntive

- [Visualizzazione degli algoritmi](https://visualgo.net/)
- [Libro: "Introduction to Algorithms" di Cormen, Leiserson, Rivest e Stein](https://mitpress.mit.edu/books/introduction-algorithms-third-edition)
- [Corso online: "Algorithms" su Coursera](https://www.coursera.org/specializations/algorithms)

## Navigazione

- [Indice della sezione](../README.md)
- [Prossima guida: Algoritmi di Ordinamento](02-algoritmi-ordinamento.md)