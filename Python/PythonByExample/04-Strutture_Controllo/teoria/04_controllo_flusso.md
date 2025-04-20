# Istruzioni di Controllo del Flusso in Python

## Cosa sono le istruzioni di controllo del flusso
Le istruzioni di controllo del flusso in Python permettono di modificare l'ordine di esecuzione del codice all'interno di strutture come cicli e condizionali. Queste istruzioni sono fondamentali per creare programmi flessibili che possano adattarsi a diverse situazioni durante l'esecuzione.

Le principali istruzioni di controllo del flusso in Python sono:
- `break`: interrompe l'esecuzione di un ciclo
- `continue`: salta alla prossima iterazione di un ciclo
- `pass`: non fa nulla, ma è utile come segnaposto

## L'istruzione break
L'istruzione `break` permette di uscire immediatamente da un ciclo (`for` o `while`), interrompendo tutte le iterazioni rimanenti.

### Sintassi di base

```python
while condizione:
    # codice
    if altra_condizione:
        break  # Esce dal ciclo
    # altro codice

# oppure

for elemento in sequenza:
    # codice
    if condizione:
        break  # Esce dal ciclo
    # altro codice
```

### Esempi di utilizzo di break

```python
# Esempio 1: Trovare il primo numero divisibile per 7 in un range
for numero in range(1, 100):
    if numero % 7 == 0:
        print(f"Il primo numero divisibile per 7 è: {numero}")
        break  # Esce dal ciclo dopo aver trovato il primo numero

# Esempio 2: Implementazione di un menu con opzione di uscita
while True:  # Ciclo infinito
    print("\nMenu:")
    print("1. Opzione 1")
    print("2. Opzione 2")
    print("3. Esci")
    
    scelta = input("Scegli un'opzione: ")
    
    if scelta == "1":
        print("Hai scelto l'opzione 1")
    elif scelta == "2":
        print("Hai scelto l'opzione 2")
    elif scelta == "3":
        print("Uscita dal programma...")
        break  # Esce dal ciclo infinito
    else:
        print("Opzione non valida")

# Esempio 3: Ricerca in una lista
numeri = [10, 25, 3, 8, 42, 15]
valore_cercato = 42

for indice, valore in enumerate(numeri):
    if valore == valore_cercato:
        print(f"Valore {valore_cercato} trovato all'indice {indice}")
        break
else:  # Questo else appartiene al for, non a un if
    print(f"Valore {valore_cercato} non trovato nella lista")
```

## L'istruzione continue
L'istruzione `continue` salta il resto del codice all'interno dell'iterazione corrente di un ciclo e passa direttamente all'iterazione successiva.

### Sintassi di base

```python
while condizione:
    # codice
    if altra_condizione:
        continue  # Salta al prossimo ciclo
    # questo codice viene saltato se continue viene eseguito

# oppure

for elemento in sequenza:
    # codice
    if condizione:
        continue  # Salta al prossimo ciclo
    # questo codice viene saltato se continue viene eseguito
```

### Esempi di utilizzo di continue

```python
# Esempio 1: Stampare solo i numeri dispari
for numero in range(1, 11):
    if numero % 2 == 0:  # Se il numero è pari
        continue  # Salta il resto del ciclo
    print(numero)  # Stampa solo i numeri dispari

# Output:
# 1
# 3
# 5
# 7
# 9

# Esempio 2: Filtrare input non validi
while True:
    input_utente = input("Inserisci un numero positivo (o 'q' per uscire): ")
    
    if input_utente.lower() == 'q':
        break
    
    try:
        numero = float(input_utente)
    except ValueError:
        print("Input non valido. Inserisci un numero.")
        continue  # Torna all'inizio del ciclo
    
    if numero <= 0:
        print("Il numero deve essere positivo.")
        continue  # Torna all'inizio del ciclo
    
    # Questo codice viene eseguito solo se l'input è un numero positivo
    print(f"La radice quadrata di {numero} è {numero ** 0.5:.2f}")

# Esempio 3: Elaborazione di una lista con elementi da saltare
parole = ["mela", "banana", "", "arancia", None, "kiwi", ""]

for parola in parole:
    if not parola:  # Salta stringhe vuote o None
        continue
    print(f"La parola '{parola}' ha {len(parola)} caratteri")
```

## L'istruzione pass
L'istruzione `pass` è un'operazione nulla: quando viene eseguita, non succede niente. È utile come segnaposto quando è necessaria sintatticamente un'istruzione, ma non si vuole eseguire alcun codice.

### Sintassi di base

```python
if condizione:
    pass  # Non fa nulla

# oppure

while condizione:
    pass  # Ciclo vuoto

# oppure

for elemento in sequenza:
    pass  # Iterazione vuota

# oppure

class ClasseVuota:
    pass  # Classe senza metodi o attributi

# oppure

def funzione_da_implementare():
    pass  # Funzione senza implementazione
```

### Esempi di utilizzo di pass

```python
# Esempio 1: Funzioni da implementare in futuro
def calcola_media(numeri):
    pass  # TODO: implementare il calcolo della media

def calcola_deviazione_standard(numeri):
    pass  # TODO: implementare il calcolo della deviazione standard

# Esempio 2: Gestione di casi speciali in un ciclo
for numero in range(1, 11):
    if numero == 5:
        # Potremmo voler gestire il caso speciale in futuro
        pass
    else:
        print(numero)

# Esempio 3: Classi base o interfacce
class BaseDati:
    def inserisci(self, dato):
        pass
    
    def elimina(self, id):
        pass
    
    def cerca(self, query):
        pass

# Esempio 4: Blocchi condizionali vuoti
età = 25
if età < 18:
    pass  # Gestione dei minori (da implementare)
else:
    print("Accesso consentito")
```

## Confronto tra break, continue e pass

| Istruzione | Effetto | Uso comune |
|------------|---------|------------|
| `break` | Esce completamente dal ciclo | Terminare un ciclo quando si trova ciò che si sta cercando o quando si verifica una condizione di uscita |
| `continue` | Salta al prossimo ciclo | Saltare l'elaborazione di determinati elementi o condizioni |
| `pass` | Non fa nulla | Segnaposto per codice da implementare in futuro o per blocchi vuoti |

### Esempio comparativo

```python
numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Con break
print("Esempio con break:")
for n in numeri:
    if n > 5:
        print(f"Trovato {n} > 5, esco dal ciclo")
        break
    print(f"Elaborazione di {n}")

# Con continue
print("\nEsempio con continue:")
for n in numeri:
    if n % 2 == 0:  # Se n è pari
        continue
    print(f"Elaborazione del numero dispari {n}")

# Con pass
print("\nEsempio con pass:")
for n in numeri:
    if n % 2 == 0:
        pass  # Non fa nulla per i numeri pari
    else:
        print(f"Elaborazione del numero dispari {n}")
```

## L'istruzione else nei cicli
In Python, sia i cicli `for` che i cicli `while` possono avere una clausola `else` che viene eseguita solo se il ciclo termina normalmente (cioè, non viene interrotto da un `break`).

### Sintassi di base

```python
for elemento in sequenza:
    # codice
else:
    # codice eseguito se il ciclo termina normalmente

# oppure

while condizione:
    # codice
else:
    # codice eseguito se il ciclo termina normalmente
```

### Esempi di utilizzo di else nei cicli

```python
# Esempio 1: Verifica se un numero è primo
def è_primo(n):
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

numero = 17
è_primo_flag = True

for i in range(2, int(numero**0.5) + 1):
    if numero % i == 0:
        è_primo_flag = False
        break
else:
    # Questo blocco viene eseguito solo se non è stato trovato alcun divisore
    # (cioè, il ciclo non è stato interrotto da break)
    if numero > 1:
        print(f"{numero} è un numero primo")
    else:
        print(f"{numero} non è un numero primo")

# Esempio 2: Ricerca in una lista
numeri = [1, 3, 5, 7, 9]
valore_cercato = 4

for numero in numeri:
    if numero == valore_cercato:
        print(f"Trovato {valore_cercato} nella lista")
        break
else:
    print(f"{valore_cercato} non è presente nella lista")

# Esempio 3: Validazione di input
tentativi_massimi = 3
tentativi = 0

while tentativi < tentativi_massimi:
    password = input("Inserisci la password: ")
    if password == "segreto":
        print("Accesso consentito!")
        break
    tentativi += 1
else:
    print("Numero massimo di tentativi raggiunto. Accesso negato.")
```

## Pattern comuni e best practices

### 1. Ricerca con early exit

```python
def trova_elemento(lista, elemento_cercato):
    for indice, elemento in enumerate(lista):
        if elemento == elemento_cercato:
            return indice  # Early exit con il risultato
    return -1  # Elemento non trovato

# Oppure con break
def contiene_elemento(lista, elemento_cercato):
    trovato = False
    for elemento in lista:
        if elemento == elemento_cercato:
            trovato = True
            break
    return trovato
```

### 2. Filtraggio di elementi

```python
# Con continue
def stampa_solo_positivi(numeri):
    for n in numeri:
        if n <= 0:
            continue
        print(n)

# Equivalente con comprensione di lista
positivi = [n for n in numeri if n > 0]
for n in positivi:
    print(n)
```

### 3. Implementazione incrementale

```python
# Struttura di base con pass come segnaposto
def analizza_dati(dati):
    # Fase 1: Validazione
    for dato in dati:
        if not è_valido(dato):
            return False
    
    # Fase 2: Preprocessing
    dati_processati = []
    for dato in dati:
        # TODO: implementare il preprocessing
        pass
    
    # Fase 3: Analisi
    risultati = []
    for dato in dati_processati:
        # TODO: implementare l'analisi
        pass
    
    return risultati
```

### 4. Gestione di errori con continue

```python
def processa_file(nomi_file):
    risultati = []
    for nome_file in nomi_file:
        try:
            with open(nome_file, 'r') as file:
                contenuto = file.read()
        except FileNotFoundError:
            print(f"Attenzione: file {nome_file} non trovato, salto al prossimo")
            continue
        except PermissionError:
            print(f"Attenzione: permessi insufficienti per {nome_file}, salto al prossimo")
            continue
        
        # Questo codice viene eseguito solo se non ci sono stati errori
        risultati.append((nome_file, len(contenuto)))
    
    return risultati
```

## Best practices per le istruzioni di controllo del flusso

1. **Usa break per uscire anticipatamente**: Quando trovi ciò che stai cercando o quando si verifica una condizione di terminazione, usa `break` per evitare iterazioni inutili.

2. **Usa continue per saltare casi speciali**: Quando hai casi che non vuoi elaborare, usa `continue` per saltarli e mantenere il codice principale meno indentato.

3. **Usa pass come segnaposto temporaneo**: Durante lo sviluppo, usa `pass` per mantenere la struttura del codice valida mentre lavori su altre parti.

4. **Preferisci approcci più espliciti quando possibile**: A volte, riformulare la condizione del ciclo può essere più chiaro che usare `break` o `continue`.

5. **Sfrutta la clausola else dei cicli**: La clausola `else` dei cicli può rendere il codice più chiaro in situazioni come la ricerca o la validazione.

6. **Evita cicli infiniti non intenzionali**: Quando usi `while True:`, assicurati di avere sempre una via d'uscita con `break`.

7. **Limita la complessità**: Se ti ritrovi con molti `break` e `continue` annidati, considera di ristrutturare il codice in funzioni più piccole e focalizzate.

## Conclusione
Le istruzioni di controllo del flusso `break`, `continue` e `pass` sono strumenti potenti che ti permettono di controllare con precisione l'esecuzione dei cicli in Python. Usate correttamente, queste istruzioni possono rendere il tuo codice più efficiente, leggibile e manutenibile. Tuttavia, è importante utilizzarle con giudizio e considerare sempre se esiste un approccio più chiaro o esplicito per risolvere il problema.

---

[Indice dell'esercitazione](../README.md) | [Precedente: Ciclo while](./03_ciclo_while.md) | [Prossimo: Esercizi sulle strutture di controllo](../esercizi/README.md)