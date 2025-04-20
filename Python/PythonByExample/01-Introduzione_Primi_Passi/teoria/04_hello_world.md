# Il tuo primo programma: Hello, World!

## Introduzione
Una tradizione nel mondo della programmazione è che il primo programma che si scrive in un nuovo linguaggio sia "Hello, World!", un semplice programma che visualizza questa frase sullo schermo. In questa guida, scriveremo il nostro primo programma Python e analizzeremo la sua struttura.

## Il programma "Hello, World!"

Ecco il codice del programma "Hello, World!" in Python:

```python
print("Hello, World!")
```

Sì, è davvero così semplice! Una singola riga di codice è tutto ciò che serve in Python per visualizzare un messaggio sullo schermo.

## Analisi del codice

Anche se il programma è molto semplice, vale la pena analizzare cosa sta succedendo:

- `print()` è una funzione integrata in Python che visualizza il contenuto specificato tra parentesi sullo schermo (o più precisamente, sull'output standard).
- `"Hello, World!"` è una stringa, ovvero una sequenza di caratteri racchiusa tra virgolette (in Python puoi usare sia virgolette singole `'` che doppie `"`).

## Come eseguire il programma

Ci sono diversi modi per eseguire questo programma:

### Metodo 1: Usando l'interprete interattivo

1. Apri l'interprete Python:
   - Su Windows: apri il Prompt dei comandi e digita `python`
   - Su macOS/Linux: apri il Terminale e digita `python3`
2. Al prompt `>>>`, digita `print("Hello, World!")` e premi Invio
3. Vedrai immediatamente l'output: `Hello, World!`

### Metodo 2: Creando un file Python

1. Apri un editor di testo o un IDE
2. Crea un nuovo file e digita: `print("Hello, World!")`
3. Salva il file con un nome che termina con `.py`, ad esempio `hello.py`
4. Esegui il file:
   - Da terminale/prompt dei comandi: naviga nella directory dove hai salvato il file e digita `python hello.py` (Windows) o `python3 hello.py` (macOS/Linux)
   - Dal tuo IDE: usa il pulsante "Run" o la scorciatoia da tastiera (es. F5 in molti IDE)

## Estendere il programma

Possiamo facilmente estendere il nostro programma per renderlo più interattivo:

```python
# Chiedi il nome all'utente
nome = input("Come ti chiami? ")

# Saluta l'utente usando il nome fornito
print("Hello, " + nome + "!")
```

Questo programma:
1. Usa la funzione `input()` per chiedere all'utente di inserire il proprio nome
2. Memorizza il nome inserito nella variabile `nome`
3. Usa la funzione `print()` per visualizzare un saluto personalizzato, concatenando (unendo) la stringa "Hello, " con il valore della variabile `nome` e il carattere "!"

## Varianti del programma Hello World

### Utilizzo di f-string (Python 3.6+)

Le f-string sono un modo moderno e leggibile per formattare le stringhe in Python:

```python
nome = input("Come ti chiami? ")
print(f"Hello, {nome}!")
```

La `f` prima delle virgolette indica che è una f-string, e le espressioni tra parentesi graffe `{}` vengono valutate e inserite nella stringa.

### Utilizzo di più print

```python
print("Hello,")
print("World!")
```

Questo produrrà:
```
Hello,
World!
```

Ogni chiamata a `print()` va a capo automaticamente.

### Stampa senza andare a capo

```python
print("Hello, ", end="")
print("World!")
```

Questo produrrà:
```
Hello, World!
```

Il parametro `end=""` modifica il comportamento di `print()`, facendo sì che non vada a capo dopo aver stampato.

## Errori comuni

### Dimenticare le virgolette

```python
print(Hello, World!)
```

Questo produrrà un errore perché Python interpreterà `Hello` e `World` come nomi di variabili, che non sono state definite.

### Dimenticare le parentesi

```python
print "Hello, World!"
```

In Python 3, le parentesi sono obbligatorie per le chiamate di funzione, quindi questo codice genererà un errore di sintassi.

## Conclusione

Hai appena scritto il tuo primo programma Python! Anche se semplice, questo è un passo importante nel tuo percorso di apprendimento. Nei prossimi capitoli, esploreremo concetti più avanzati che ti permetteranno di scrivere programmi più complessi e utili.

Ricorda che la programmazione si impara facendo, quindi sperimenta con il codice, modificalo e osserva cosa succede!

---

[Indice dell'Esercitazione](../README.md) | [Precedente: Configurazione dell'ambiente di sviluppo](./03_configurazione_ambiente.md) | [Prossimo: Esecuzione di script Python](./05_esecuzione_script.md)