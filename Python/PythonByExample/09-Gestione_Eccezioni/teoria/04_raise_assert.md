# Raise e Assert: Sollevare e Verificare Eccezioni

Oltre a catturare e gestire le eccezioni, Python permette anche di sollevare eccezioni intenzionalmente e di verificare condizioni che, se non soddisfatte, generano eccezioni. Queste funzionalità sono implementate attraverso le istruzioni `raise` e `assert`.

## L'Istruzione `raise`

L'istruzione `raise` permette di sollevare un'eccezione in modo esplicito. Questo è utile quando il programma rileva una condizione che dovrebbe essere trattata come un errore.

### Sintassi Base

```python
raise TipoEccezione("messaggio di errore")
```

### Esempi

#### Sollevare un'Eccezione Semplice

```python
def dividi(a, b):
    if b == 0:
        raise ZeroDivisionError("Impossibile dividere per zero!")
    return a / b

try:
    risultato = dividi(10, 0)
except ZeroDivisionError as e:
    print(f"Errore: {e}")
```

In questo esempio:
1. La funzione `dividi` controlla se il divisore è zero
2. Se è zero, solleva esplicitamente un'eccezione `ZeroDivisionError`
3. Il blocco `try-except` cattura l'eccezione e mostra il messaggio di errore

#### Sollevare un'Eccezione con Informazioni Aggiuntive

```python
def verifica_eta(eta):
    if eta < 0:
        raise ValueError(f"L'età non può essere negativa: {eta}")
    if eta > 120:
        raise ValueError(f"L'età inserita ({eta}) sembra troppo alta")
    return True

try:
    verifica_eta(-5)
except ValueError as e:
    print(f"Errore di validazione: {e}")
```

### Risollevare un'Eccezione

A volte, potresti voler catturare un'eccezione, eseguire alcune operazioni (come registrare l'errore), e poi risollevare l'eccezione per farla gestire a un livello superiore:

```python
try:
    # Codice che potrebbe generare un'eccezione
    file = open("dati.txt", "r")
    contenuto = file.read()
except FileNotFoundError as e:
    print("Registrazione dell'errore: File non trovato")
    # Risolleviamo l'eccezione
    raise
```

In questo esempio, catturiamo l'eccezione `FileNotFoundError`, registriamo l'errore, e poi risolleviamo la stessa eccezione usando `raise` senza argomenti.

### Sollevare Eccezioni da Eccezioni

Puoi anche catturare un'eccezione e sollevarne un'altra, mantenendo l'eccezione originale come causa:

```python
try:
    # Codice che potrebbe generare un'eccezione
    numero = int("abc")
except ValueError as e:
    # Solleviamo un'eccezione personalizzata con l'eccezione originale come causa
    raise RuntimeError("Errore durante la conversione") from e
```

Questo è utile quando vuoi fornire un contesto più specifico sull'errore, mantenendo comunque l'informazione sull'errore originale.

## L'Istruzione `assert`

L'istruzione `assert` è utilizzata per verificare che una condizione sia vera. Se la condizione è falsa, viene sollevata un'eccezione `AssertionError`. Gli assert sono utili per il debugging e per verificare che il programma si comporti come previsto.

### Sintassi Base

```python
assert condizione, "messaggio di errore opzionale"
```

### Esempi

#### Verifica di Base

```python
def calcola_area_rettangolo(lunghezza, larghezza):
    assert lunghezza > 0, "La lunghezza deve essere positiva"
    assert larghezza > 0, "La larghezza deve essere positiva"
    return lunghezza * larghezza

try:
    area = calcola_area_rettangolo(5, -2)
except AssertionError as e:
    print(f"Errore: {e}")
```

In questo esempio:
1. La funzione `calcola_area_rettangolo` verifica che lunghezza e larghezza siano positive
2. Se una delle condizioni non è soddisfatta, viene sollevata un'eccezione `AssertionError`

#### Verifica di Invarianti

```python
def ordina_lista(lista):
    risultato = sorted(lista)
    # Verifichiamo che la lista ordinata abbia la stessa lunghezza dell'originale
    assert len(risultato) == len(lista), "La lunghezza della lista è cambiata durante l'ordinamento"
    # Verifichiamo che la lista sia effettivamente ordinata
    assert all(risultato[i] <= risultato[i+1] for i in range(len(risultato)-1)), "La lista non è ordinata correttamente"
    return risultato
```

Questo esempio mostra come usare `assert` per verificare invarianti del programma, cioè condizioni che dovrebbero sempre essere vere.

### Differenza tra `assert` e `raise`

- **`assert`** è principalmente uno strumento di debugging. In Python, gli assert possono essere disabilitati con l'opzione `-O` (optimize) quando si esegue lo script. Quindi, non dovresti usare `assert` per gestire errori che devono essere sempre controllati.
- **`raise`** è utilizzato per la gestione degli errori in produzione. Le eccezioni sollevate con `raise` non possono essere disabilitate e devono essere gestite appropriatamente.

## Quando Usare `raise` e Quando Usare `assert`

- Usa **`raise`** quando:
  - Vuoi segnalare un errore che deve essere gestito
  - La condizione di errore è parte della logica del programma
  - L'errore potrebbe verificarsi anche in un programma corretto (ad esempio, file non trovato)

- Usa **`assert`** quando:
  - Vuoi verificare che una condizione sia vera durante lo sviluppo e il debugging
  - La condizione dovrebbe sempre essere vera in un programma corretto
  - Stai verificando invarianti o precondizioni

## Esempio Pratico: Validazione di Input

```python
def processa_dati_utente(nome, eta, email):
    # Validazione con raise (errori che potrebbero verificarsi con input validi ma errati)
    if not nome:
        raise ValueError("Il nome non può essere vuoto")
    
    if not isinstance(eta, int):
        raise TypeError("L'età deve essere un numero intero")
    
    if eta < 0 or eta > 120:
        raise ValueError(f"L'età deve essere compresa tra 0 e 120, ricevuto: {eta}")
    
    if "@" not in email:
        raise ValueError("Email non valida: manca il simbolo @")
    
    # Invarianti con assert (condizioni che dovrebbero sempre essere vere nel codice)
    assert len(nome) <= 100, "Nome troppo lungo per il database"
    assert isinstance(email, str), "Email deve essere una stringa"
    
    # Processa i dati...
    print(f"Dati processati per: {nome}, {eta} anni, {email}")
    return True

# Test della funzione
try:
    processa_dati_utente("Mario", 25, "mario.rossi@example.com")  # OK
    processa_dati_utente("", 30, "email@example.com")  # Errore: nome vuoto
except Exception as e:
    print(f"Errore durante il processamento: {e}")
```

Questo esempio mostra un caso d'uso realistico di `raise` e `assert` per la validazione degli input utente.

## Conclusione

Le istruzioni `raise` e `assert` sono strumenti potenti per la gestione degli errori e il debugging in Python. Utilizzandole in modo appropriato, puoi rendere il tuo codice più robusto, più facile da debuggare e più sicuro.

Nella prossima lezione, esploreremo come creare e utilizzare eccezioni personalizzate per gestire situazioni specifiche della tua applicazione.

---

[Indice](../README.md) | [Lezione Precedente: Else e Finally](03_else_finally.md) | [Prossima Lezione: Eccezioni Personalizzate](05_eccezioni_personalizzate.md)