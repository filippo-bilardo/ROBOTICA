# Introduzione alle Espressioni Regolari

In questa lezione, esploreremo le basi delle espressioni regolari (regex), uno strumento potente per la manipolazione e l'analisi del testo in Python.

## Cosa sono le Espressioni Regolari?

Le espressioni regolari sono sequenze di caratteri che definiscono un pattern di ricerca. Sono utilizzate per:

- Verificare se una stringa corrisponde a un determinato pattern
- Estrarre sottostringhe che corrispondono a un pattern
- Sostituire parti di una stringa che corrispondono a un pattern
- Dividere una stringa in base a un pattern

Le espressioni regolari esistono in molti linguaggi di programmazione e strumenti, ma in questa lezione ci concentreremo sul loro utilizzo in Python attraverso il modulo `re` della libreria standard.

## Perché Usare le Espressioni Regolari?

Le espressioni regolari offrono diversi vantaggi:

1. **Potenza**: Permettono di definire pattern complessi con poche righe di codice
2. **Flessibilità**: Possono essere utilizzate per una vasta gamma di compiti di manipolazione del testo
3. **Standardizzazione**: Sono implementate in modo simile in molti linguaggi di programmazione
4. **Efficienza**: Sono ottimizzate per operazioni di ricerca e sostituzione

## Un Semplice Esempio

Ecco un esempio basilare di utilizzo delle espressioni regolari in Python:

```python
import re

# Verifichiamo se una stringa contiene un numero di telefono italiano
pattern = r"\d{3}-\d{7}"  # Pattern per un numero nel formato 123-4567890
testo = "Il mio numero è 123-4567890, chiamami!"

risultato = re.search(pattern, testo)
if risultato:
    print(f"Trovato numero: {risultato.group()}")
else:
    print("Nessun numero trovato")

# Output: Trovato numero: 123-4567890
```

In questo esempio:
- `\d{3}` rappresenta esattamente tre cifre
- `-` rappresenta il carattere trattino
- `\d{7}` rappresenta esattamente sette cifre

## Il Modulo `re` di Python

Python fornisce il modulo `re` per lavorare con le espressioni regolari. Ecco le funzioni principali:

- `re.search(pattern, string)`: Cerca il pattern in qualsiasi posizione della stringa
- `re.match(pattern, string)`: Cerca il pattern solo all'inizio della stringa
- `re.findall(pattern, string)`: Trova tutte le occorrenze del pattern nella stringa
- `re.sub(pattern, repl, string)`: Sostituisce le occorrenze del pattern con una stringa di sostituzione
- `re.split(pattern, string)`: Divide la stringa in base al pattern

## Raw Strings in Python

Quando si lavora con espressioni regolari in Python, è consigliabile utilizzare le "raw strings" (stringhe grezze) precedendo la stringa con `r`. Questo evita che Python interpreti i caratteri di escape come `\` in modo speciale:

```python
# Senza raw string
pattern1 = "\\d+"  # Dobbiamo usare \\ per rappresentare un singolo \ nell'espressione regolare

# Con raw string
pattern2 = r"\d+"  # Più leggibile e meno soggetto a errori
```

## Quando NON Usare le Espressioni Regolari

Nonostante la loro potenza, le espressioni regolari non sono sempre la soluzione migliore:

1. **Per operazioni semplici**: Se stai cercando una sottostringa esatta, metodi come `in`, `startswith()`, o `endswith()` sono più leggibili e spesso più veloci
2. **Per parsing di linguaggi strutturati**: Per XML, HTML, JSON, ecc., è meglio utilizzare parser dedicati
3. **Quando la leggibilità è cruciale**: Le regex complesse possono diventare difficili da leggere e mantenere

## Conclusione

Le espressioni regolari sono uno strumento potente nel toolkit di ogni programmatore Python. Nelle prossime lezioni, esploreremo in dettaglio la sintassi delle espressioni regolari e come utilizzarle efficacemente per risolvere problemi reali.

---

[Indice](../README.md) | [Successivo: Sintassi di Base](02_sintassi_base.md)