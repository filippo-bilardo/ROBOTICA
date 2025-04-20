# Istruzioni Condizionali in Python

## Cosa sono le istruzioni condizionali
Le istruzioni condizionali permettono di eseguire blocchi di codice solo quando determinate condizioni sono soddisfatte. Sono fondamentali per creare programmi che possano prendere decisioni e adattare il loro comportamento in base a diverse situazioni.

In Python, le principali istruzioni condizionali sono `if`, `elif` (abbreviazione di "else if") e `else`.

## L'istruzione `if`
L'istruzione `if` è la forma più semplice di controllo condizionale. Esegue un blocco di codice solo se una condizione specificata è vera.

### Sintassi di base

```python
if condizione:
    # blocco di codice da eseguire se la condizione è vera
```

Dove:
- `condizione` è un'espressione che viene valutata come vera o falsa
- Il blocco di codice indentato viene eseguito solo se la condizione è vera

### Esempi di istruzioni `if`

```python
# Esempio 1: Controllo di un numero
età = 18
if età >= 18:
    print("Sei maggiorenne.")

# Esempio 2: Controllo di una stringa
nome = "Alice"
if nome == "Alice":
    print("Ciao Alice!")

# Esempio 3: Controllo di una condizione booleana
ha_patente = True
if ha_patente:
    print("Puoi guidare.")
```

## L'istruzione `if-else`
L'istruzione `if-else` estende l'istruzione `if` aggiungendo un blocco di codice alternativo da eseguire quando la condizione è falsa.

### Sintassi di base

```python
if condizione:
    # blocco di codice da eseguire se la condizione è vera
else:
    # blocco di codice da eseguire se la condizione è falsa
```

### Esempi di istruzioni `if-else`

```python
# Esempio 1: Controllo dell'età
età = 16
if età >= 18:
    print("Sei maggiorenne.")
else:
    print("Sei minorenne.")

# Esempio 2: Controllo del numero pari/dispari
numero = 7
if numero % 2 == 0:
    print(f"{numero} è un numero pari.")
else:
    print(f"{numero} è un numero dispari.")

# Esempio 3: Controllo di una password
password = "12345"
if password == "password123":
    print("Accesso consentito.")
else:
    print("Password errata.")
```

## L'istruzione `if-elif-else`
L'istruzione `if-elif-else` permette di verificare più condizioni in sequenza. Python controlla ogni condizione nell'ordine specificato e esegue il blocco di codice associato alla prima condizione vera che incontra.

### Sintassi di base

```python
if condizione1:
    # blocco di codice da eseguire se condizione1 è vera
elif condizione2:
    # blocco di codice da eseguire se condizione1 è falsa e condizione2 è vera
elif condizione3:
    # blocco di codice da eseguire se condizione1 e condizione2 sono false e condizione3 è vera
else:
    # blocco di codice da eseguire se tutte le condizioni sono false
```

### Esempi di istruzioni `if-elif-else`

```python
# Esempio 1: Classificazione del voto
voto = 85
if voto >= 90:
    print("Eccellente!")
elif voto >= 80:
    print("Molto buono.")
elif voto >= 70:
    print("Buono.")
elif voto >= 60:
    print("Sufficiente.")
else:
    print("Insufficiente.")

# Esempio 2: Determinazione della fascia d'età
età = 25
if età < 13:
    print("Bambino")
elif età < 20:
    print("Adolescente")
elif età < 65:
    print("Adulto")
else:
    print("Anziano")

# Esempio 3: Controllo del giorno della settimana
giorno = 3  # 1 = Lunedì, 2 = Martedì, ecc.
if giorno == 1:
    print("Lunedì")
elif giorno == 2:
    print("Martedì")
elif giorno == 3:
    print("Mercoledì")
elif giorno == 4:
    print("Giovedì")
elif giorno == 5:
    print("Venerdì")
elif giorno == 6:
    print("Sabato")
elif giorno == 7:
    print("Domenica")
else:
    print("Giorno non valido")
```

## Condizioni annidate
È possibile annidare istruzioni condizionali all'interno di altre istruzioni condizionali per creare logiche più complesse.

### Esempio di condizioni annidate

```python
età = 25
ha_patente = True

if età >= 18:
    print("Sei maggiorenne.")
    if ha_patente:
        print("Puoi guidare.")
    else:
        print("Non puoi guidare senza patente.")
else:
    print("Sei minorenne e non puoi guidare.")
```

## Operatori di confronto
Gli operatori di confronto sono utilizzati nelle condizioni per confrontare valori.

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `==` | Uguale a | `a == b` |
| `!=` | Diverso da | `a != b` |
| `>` | Maggiore di | `a > b` |
| `<` | Minore di | `a < b` |
| `>=` | Maggiore o uguale a | `a >= b` |
| `<=` | Minore o uguale a | `a <= b` |

## Operatori logici
Gli operatori logici permettono di combinare più condizioni.

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `and` | Vero se entrambe le condizioni sono vere | `a > 5 and b < 10` |
| `or` | Vero se almeno una delle condizioni è vera | `a > 5 or b < 10` |
| `not` | Inverte il risultato della condizione | `not a == b` |

### Esempi di operatori logici

```python
# Esempio con and
età = 25
reddito = 30000
if età >= 18 and reddito >= 20000:
    print("Puoi richiedere un prestito.")

# Esempio con or
giorno = "Sabato"
if giorno == "Sabato" or giorno == "Domenica":
    print("È weekend!")

# Esempio con not
è_pioggia = False
if not è_pioggia:
    print("Puoi uscire senza ombrello.")

# Combinazione di operatori logici
temperatura = 28
umidità = 80
if temperatura > 25 and (umidità < 60 or not è_pioggia):
    print("Condizioni ideali per una passeggiata.")
```

## Espressioni condizionali (operatore ternario)
Python supporta anche un'espressione condizionale compatta, nota come operatore ternario, che permette di scrivere semplici istruzioni if-else in una singola riga.

### Sintassi di base

```python
valore_se_vero if condizione else valore_se_falso
```

### Esempi di espressioni condizionali

```python
# Esempio 1: Determinare il valore massimo
a = 5
b = 10
max_val = a if a > b else b
print(f"Il valore massimo è {max_val}")  # Output: Il valore massimo è 10

# Esempio 2: Messaggio basato sull'età
età = 20
stato = "maggiorenne" if età >= 18 else "minorenne"
print(f"Sei {stato}")  # Output: Sei maggiorenne

# Esempio 3: Calcolo del prezzo con sconto
prezzo = 100
è_in_saldo = True
prezzo_finale = prezzo * 0.8 if è_in_saldo else prezzo
print(f"Prezzo finale: {prezzo_finale} euro")  # Output: Prezzo finale: 80.0 euro
```

## Valutazione delle condizioni in Python
In Python, i seguenti valori sono considerati falsi (`False`):
- `False` (il valore booleano)
- `None` (il valore nullo)
- `0` (lo zero numerico)
- `""` (la stringa vuota)
- `[]` (la lista vuota)
- `()` (la tupla vuota)
- `{}` (il dizionario vuoto)
- `set()` (il set vuoto)

Tutti gli altri valori sono considerati veri (`True`).

### Esempi di valutazione delle condizioni

```python
# Esempio con stringa vuota
nome = ""
if nome:
    print(f"Ciao, {nome}!")
else:
    print("Nome non fornito.")

# Esempio con lista
elements = []
if elements:
    print(f"La lista contiene {len(elements)} elementi.")
else:
    print("La lista è vuota.")

# Esempio con numero
quantità = 0
if quantità:
    print(f"Hai {quantità} articoli nel carrello.")
else:
    print("Il tuo carrello è vuoto.")
```

## Best practices per le istruzioni condizionali

1. **Leggibilità**: Scrivi condizioni chiare e leggibili, anche se questo significa dividere condizioni complesse in più parti.

2. **Evita la negazione quando possibile**: Le condizioni positive sono generalmente più facili da comprendere rispetto a quelle negative.

3. **Usa parentesi per chiarire**: Quando combini più operatori logici, usa le parentesi per rendere chiaro l'ordine di valutazione.

4. **Sfrutta la valutazione in cortocircuito**: Python valuta le espressioni da sinistra a destra e si ferma non appena il risultato è determinato.

```python
# Esempio di valutazione in cortocircuito
lista = []
# Questo non causerà un errore perché la prima condizione è falsa
if lista and lista[0] == "primo":
    print("Il primo elemento è 'primo'")
```

5. **Evita condizioni ridondanti**: Non ripetere le stesse verifiche in blocchi `elif` o `else` successivi.

```python
# Non ottimale
if x < 0:
    print("Negativo")
elif x >= 0 and x < 10:  # x >= 0 è ridondante
    print("Tra 0 e 9")

# Migliore
if x < 0:
    print("Negativo")
elif x < 10:  # Sappiamo già che x >= 0 qui
    print("Tra 0 e 9")
```

## Conclusione
Le istruzioni condizionali sono uno strumento fondamentale in Python e in qualsiasi linguaggio di programmazione. Ti permettono di creare programmi che possono prendere decisioni e adattarsi a diverse situazioni. Padroneggiare le istruzioni condizionali è essenziale per scrivere codice efficace e flessibile.

---

[Indice dell'esercitazione](../README.md) | [Prossimo: Ciclo for](./02_ciclo_for.md)