# Il Ciclo While in Python

## Cosa è il ciclo while
Il ciclo `while` in Python è una struttura di controllo che esegue ripetutamente un blocco di codice fintanto che una condizione specificata rimane vera. A differenza del ciclo `for`, che itera su una sequenza di elementi, il ciclo `while` continua l'esecuzione fino a quando la sua condizione diventa falsa.

## Sintassi di base

```python
while condizione:
    # blocco di codice da eseguire finché la condizione è vera
```

Dove:
- `condizione` è un'espressione che viene valutata come vera o falsa prima di ogni iterazione
- Il blocco di codice indentato viene eseguito ripetutamente finché la condizione rimane vera

## Esempi di base del ciclo while

### Conteggio semplice

```python
contatore = 0
while contatore < 5:
    print(contatore)
    contatore += 1

# Output:
# 0
# 1
# 2
# 3
# 4
```

### Somma di numeri

```python
somma = 0
numero = 1

while numero <= 10:
    somma += numero
    numero += 1

print(f"La somma dei numeri da 1 a 10 è: {somma}")  # Output: La somma dei numeri da 1 a 10 è: 55
```

### Input dell'utente con validazione

```python
password = ""
while password != "python123":
    password = input("Inserisci la password: ")
    if password != "python123":
        print("Password errata. Riprova.")

print("Password corretta! Accesso consentito.")
```

## Controllo del flusso nei cicli while

### Break: uscire dal ciclo

```python
contatore = 0
while True:  # Ciclo infinito
    print(contatore)
    contatore += 1
    if contatore >= 5:
        break  # Esce dal ciclo quando contatore raggiunge 5

# Output:
# 0
# 1
# 2
# 3
# 4
```

### Continue: saltare all'iterazione successiva

```python
contatore = 0
while contatore < 10:
    contatore += 1
    if contatore % 2 == 0:  # Se il numero è pari
        continue  # Salta il resto del ciclo e passa all'iterazione successiva
    print(contatore)  # Stampa solo i numeri dispari

# Output:
# 1
# 3
# 5
# 7
# 9
```

### Else: eseguire codice dopo il completamento del ciclo

```python
contatore = 0
while contatore < 5:
    print(contatore)
    contatore += 1
else:
    print("Ciclo completato normalmente")

# Output:
# 0
# 1
# 2
# 3
# 4
# Ciclo completato normalmente

# Con break
contatore = 0
while contatore < 5:
    print(contatore)
    contatore += 1
    if contatore == 3:
        break
else:
    print("Questo non verrà stampato perché il ciclo è stato interrotto")

# Output:
# 0
# 1
# 2
```

## Cicli while annidati
Come con i cicli `for`, è possibile annidare cicli `while` uno dentro l'altro.

```python
riga = 1
while riga <= 3:
    colonna = 1
    while colonna <= 3:
        print(f"({riga}, {colonna})", end=" ")
        colonna += 1
    print()  # Vai a capo dopo ogni riga
    riga += 1

# Output:
# (1, 1) (1, 2) (1, 3)
# (2, 1) (2, 2) (2, 3)
# (3, 1) (3, 2) (3, 3)
```

## Cicli infiniti e come evitarli
Un ciclo `while` diventa infinito quando la sua condizione non diventa mai falsa. Questo può accadere per errore o intenzionalmente.

### Ciclo infinito intenzionale

```python
# Un ciclo infinito intenzionale (da usare con cautela)
while True:
    comando = input("Inserisci un comando (o 'esci' per terminare): ")
    if comando.lower() == "esci":
        break
    print(f"Hai inserito: {comando}")
```

### Errori comuni che causano cicli infiniti

```python
# Errore: dimenticare di incrementare il contatore
contatore = 0
while contatore < 5:
    print(contatore)
    # contatore += 1  # Senza questa riga, il ciclo diventa infinito

# Errore: condizione che non diventa mai falsa
x = 10
while x > 0:
    print(x)
    x += 1  # x aumenta invece di diminuire, quindi sarà sempre > 0
```

### Come interrompere un ciclo infinito
Se il tuo programma entra in un ciclo infinito, puoi interromperlo premendo `Ctrl+C` nella console o terminando il processo.

## Confronto tra while e for

### Quando usare while
- Quando non sai in anticipo quante iterazioni saranno necessarie
- Quando la condizione di terminazione dipende da eventi esterni (input dell'utente, dati da un file, ecc.)
- Quando hai bisogno di un ciclo che potrebbe non eseguirsi mai (se la condizione è falsa all'inizio)

### Quando usare for
- Quando stai iterando su una sequenza di elementi (lista, stringa, range, ecc.)
- Quando conosci in anticipo il numero di iterazioni
- Quando vuoi utilizzare funzioni come `enumerate()`, `zip()`, ecc.

### Esempi di conversione tra while e for

```python
# Ciclo for con range
for i in range(5):
    print(i)

# Equivalente con while
i = 0
while i < 5:
    print(i)
    i += 1

# Ciclo for su una lista
frutta = ["mela", "banana", "arancia"]
for frutto in frutta:
    print(frutto)

# Equivalente con while
indice = 0
while indice < len(frutta):
    print(frutta[indice])
    indice += 1
```

## Pattern comuni con i cicli while

### Elaborazione fino a una condizione di terminazione

```python
# Continua a chiedere numeri finché l'utente non inserisce 0
somma = 0
while True:
    numero = int(input("Inserisci un numero (0 per terminare): "))
    if numero == 0:
        break
    somma += numero

print(f"La somma dei numeri inseriti è: {somma}")
```

### Polling o attesa attiva

```python
import time

# Simula l'attesa che una risorsa diventi disponibile
risorsa_disponibile = False
tentativi = 0

while not risorsa_disponibile and tentativi < 5:
    print(f"Tentativo {tentativi + 1}: Verifica disponibilità risorsa...")
    # Simula una verifica
    if tentativi == 3:  # Al quarto tentativo la risorsa diventa disponibile
        risorsa_disponibile = True
    tentativi += 1
    if not risorsa_disponibile:
        print("Risorsa non disponibile. Attendo...")
        time.sleep(1)  # Attende 1 secondo prima del prossimo tentativo

if risorsa_disponibile:
    print("Risorsa disponibile! Procedo con l'elaborazione.")
else:
    print("Risorsa non disponibile dopo 5 tentativi. Operazione annullata.")
```

### Implementazione di un menu

```python
while True:
    print("\nMenu:")
    print("1. Visualizza dati")
    print("2. Aggiungi dato")
    print("3. Modifica dato")
    print("4. Elimina dato")
    print("0. Esci")
    
    scelta = input("\nScegli un'opzione: ")
    
    if scelta == "1":
        print("Visualizzazione dati...")
    elif scelta == "2":
        print("Aggiunta dato...")
    elif scelta == "3":
        print("Modifica dato...")
    elif scelta == "4":
        print("Eliminazione dato...")
    elif scelta == "0":
        print("Uscita dal programma...")
        break
    else:
        print("Opzione non valida. Riprova.")
```

## Best practices per i cicli while

1. **Assicurati che la condizione diventi falsa**: Verifica sempre che ci sia un modo per uscire dal ciclo.

2. **Usa break con cautela**: L'uso eccessivo di `break` può rendere il codice difficile da seguire. Quando possibile, struttura la condizione del ciclo in modo che diventi naturalmente falsa.

3. **Inizializza correttamente le variabili**: Assicurati che le variabili utilizzate nella condizione del ciclo siano inizializzate prima del ciclo.

4. **Aggiorna le variabili di controllo**: Assicurati di aggiornare le variabili che influenzano la condizione del ciclo all'interno del ciclo stesso.

5. **Evita side effects nella condizione**: La condizione del ciclo dovrebbe idealmente essere una semplice verifica, senza effetti collaterali.

```python
# Non ottimale: side effect nella condizione
while (x = get_next_value()) != None:  # Questo non è valido in Python
    process(x)

# Migliore
while True:
    x = get_next_value()
    if x is None:
        break
    process(x)
```

6. **Considera l'uso di for quando appropriato**: Se stai contando o iterando su una sequenza, un ciclo `for` potrebbe essere più chiaro e meno soggetto a errori.

## Conclusione
Il ciclo `while` è uno strumento potente in Python che ti permette di eseguire codice ripetutamente fino a quando una condizione diventa falsa. È particolarmente utile quando non conosci in anticipo il numero di iterazioni necessarie o quando la condizione di terminazione dipende da eventi esterni. Combinato con istruzioni come `break`, `continue` ed `else`, il ciclo `while` offre un controllo flessibile sul flusso di esecuzione del tuo programma.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Ciclo for](./02_ciclo_for.md) | [Prossimo: Istruzioni di controllo del flusso](./04_controllo_flusso.md)