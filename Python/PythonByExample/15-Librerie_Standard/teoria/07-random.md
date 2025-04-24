# Random: Generazione di Numeri Casuali

## Introduzione

Il modulo `random` è una componente fondamentale della Libreria Standard di Python che fornisce strumenti per la generazione di numeri casuali. Questo modulo è essenziale per una vasta gamma di applicazioni, dai giochi alla simulazione, dal campionamento statistico alla crittografia di base.

È importante notare che il modulo `random` utilizza il generatore Mersenne Twister, che produce numeri pseudo-casuali di alta qualità per la maggior parte delle applicazioni non crittografiche. Per applicazioni che richiedono numeri casuali crittograficamente sicuri, è consigliabile utilizzare il modulo `secrets` (disponibile da Python 3.6).

In questa guida, esploreremo le principali funzionalità offerte dal modulo `random` e vedremo come utilizzarle efficacemente nei nostri programmi Python.

## Funzioni Principali del Modulo random

### Generazione di Numeri Casuali

```python
import random

# Generare un numero casuale in virgola mobile nell'intervallo [0.0, 1.0)
num = random.random()
print(f"Numero casuale tra 0 e 1: {num}")

# Generare un numero casuale in virgola mobile nell'intervallo [a, b]
a, b = 5, 10
num = random.uniform(a, b)
print(f"Numero casuale tra {a} e {b}: {num}")

# Generare un numero intero casuale nell'intervallo [a, b]
a, b = 1, 10
num = random.randint(a, b)  # Include sia a che b
print(f"Numero intero casuale tra {a} e {b}: {num}")

# Generare un numero intero casuale nell'intervallo [a, b)
a, b = 1, 10
num = random.randrange(a, b)  # Include a ma esclude b
print(f"Numero intero casuale tra {a} e {b-1}: {num}")

# Generare un numero intero casuale con passo
a, b, step = 0, 100, 10
num = random.randrange(a, b, step)  # Possibili valori: 0, 10, 20, ..., 90
print(f"Numero intero casuale con passo {step}: {num}")
```

### Selezione Casuale da Sequenze

```python
import random

# Selezionare un elemento casuale da una sequenza
frutta = ["mela", "banana", "arancia", "kiwi", "uva"]
elemento = random.choice(frutta)
print(f"Frutto selezionato: {elemento}")

# Selezionare k elementi casuali da una sequenza (con ripetizione)
k = 3
elementi = random.choices(frutta, k=k)
print(f"{k} frutti selezionati (con possibili ripetizioni): {elementi}")

# Selezionare k elementi casuali da una sequenza (senza ripetizione)
k = 3
elementi = random.sample(frutta, k=k)
print(f"{k} frutti selezionati (senza ripetizioni): {elementi}")

# Selezionare elementi con probabilità diverse
pesi = [10, 1, 1, 1, 1]  # La mela ha una probabilità 10 volte maggiore
elementi = random.choices(frutta, weights=pesi, k=5)
print(f"Frutti selezionati con pesi: {elementi}")
```

### Mescolamento di Sequenze

```python
import random

# Mescolare una lista in-place
carte = ["A", "K", "Q", "J", "10", "9", "8", "7"]
print(f"Carte originali: {carte}")
random.shuffle(carte)
print(f"Carte mescolate: {carte}")

# Ottenere una versione mescolata di una sequenza (senza modificare l'originale)
numeri = [1, 2, 3, 4, 5]
numeri_mescolati = random.sample(numeri, len(numeri))
print(f"Numeri originali: {numeri}")
print(f"Numeri mescolati: {numeri_mescolati}")
```

### Distribuzioni Statistiche

```python
import random
import matplotlib.pyplot as plt

# Generare numeri casuali con distribuzione normale (gaussiana)
media, dev_std = 0, 1
num = random.normalvariate(media, dev_std)
print(f"Numero casuale con distribuzione normale (μ={media}, σ={dev_std}): {num}")

# Generare numeri casuali con distribuzione esponenziale
lambda_param = 1.0  # Parametro di scala
num = random.expovariate(lambda_param)
print(f"Numero casuale con distribuzione esponenziale (λ={lambda_param}): {num}")

# Generare numeri casuali con distribuzione beta
alpha, beta = 2, 5
num = random.betavariate(alpha, beta)
print(f"Numero casuale con distribuzione beta (α={alpha}, β={beta}): {num}")

# Generare numeri casuali con distribuzione gamma
alpha, beta = 2, 2
num = random.gammavariate(alpha, beta)
print(f"Numero casuale con distribuzione gamma (α={alpha}, β={beta}): {num}")

# Visualizzare una distribuzione normale
dati = [random.normalvariate(media, dev_std) for _ in range(1000)]
plt.hist(dati, bins=30, alpha=0.7, color='skyblue', edgecolor='black')
plt.title('Distribuzione Normale')
plt.xlabel('Valore')
plt.ylabel('Frequenza')
plt.grid(True, alpha=0.3)
plt.show()
```

### Controllo del Generatore di Numeri Casuali

```python
import random

# Impostare un seme per il generatore di numeri casuali
seed = 42
random.seed(seed)

# Generare numeri casuali con il seme impostato
print("Numeri casuali con seed=42:")
for _ in range(3):
    print(random.random())

# Reimpostare lo stesso seme
random.seed(seed)

# Generare gli stessi numeri casuali
print("\nStessi numeri casuali con seed=42:")
for _ in range(3):
    print(random.random())

# Salvare e ripristinare lo stato del generatore
stato = random.getstate()
for _ in range(3):
    print(random.random())

# Ripristinare lo stato precedente
random.setstate(stato)
print("\nNumeri casuali dopo ripristino dello stato:")
for _ in range(3):
    print(random.random())
```

## Generatori di Numeri Casuali Personalizzati

```python
import random

# Creare un'istanza separata del generatore di numeri casuali
rng1 = random.Random(42)  # Con seed=42
rng2 = random.Random(123)  # Con seed=123

# Generare numeri casuali con i due generatori
print("Numeri casuali dal generatore 1:")
for _ in range(3):
    print(rng1.random())

print("\nNumeri casuali dal generatore 2:")
for _ in range(3):
    print(rng2.random())

# I due generatori sono indipendenti
print("\nI generatori rimangono indipendenti:")
print(f"Generatore 1: {rng1.random()}")
print(f"Generatore 2: {rng2.random()}")
```

## Numeri Casuali Crittograficamente Sicuri

Per applicazioni che richiedono numeri casuali crittograficamente sicuri, è consigliabile utilizzare il modulo `secrets` (disponibile da Python 3.6).

```python
import secrets

# Generare un numero intero casuale sicuro nell'intervallo [0, n)
n = 100
num = secrets.randbelow(n)
print(f"Numero intero casuale sicuro tra 0 e {n-1}: {num}")

# Generare un numero di bit casuali sicuro
num_bits = 32
num = secrets.randbits(num_bits)
print(f"Numero casuale sicuro con {num_bits} bit: {num}")

# Selezionare un elemento casuale sicuro da una sequenza
frutta = ["mela", "banana", "arancia", "kiwi", "uva"]
elemento = secrets.choice(frutta)
print(f"Frutto selezionato in modo sicuro: {elemento}")

# Generare un token esadecimale sicuro
token_hex = secrets.token_hex(16)  # 16 byte = 32 caratteri esadecimali
print(f"Token esadecimale: {token_hex}")

# Generare un token URL-safe sicuro
token_url = secrets.token_urlsafe(16)  # 16 byte
print(f"Token URL-safe: {token_url}")
```

## Esempi Pratici

### Simulazione di un Dado

```python
import random

def lancia_dado(facce=6):
    """Simula il lancio di un dado con il numero specificato di facce."""
    return random.randint(1, facce)

# Simulare il lancio di un dado a 6 facce
print(f"Lancio di un dado a 6 facce: {lancia_dado()}")

# Simulare il lancio di un dado a 20 facce (usato in giochi di ruolo)
print(f"Lancio di un dado a 20 facce: {lancia_dado(20)}")

# Simulare il lancio di 3 dadi a 6 facce
lanci = [lancia_dado() for _ in range(3)]
print(f"Lancio di 3 dadi: {lanci}, Somma: {sum(lanci)}")
```

### Generazione di Password Casuali

```python
import random
import string

def genera_password(lunghezza=12, usa_maiuscole=True, usa_numeri=True, usa_speciali=True):
    """Genera una password casuale con i caratteri specificati."""
    # Definire i set di caratteri
    minuscole = string.ascii_lowercase
    maiuscole = string.ascii_uppercase if usa_maiuscole else ""
    numeri = string.digits if usa_numeri else ""
    speciali = string.punctuation if usa_speciali else ""
    
    # Combinare i set di caratteri
    tutti_caratteri = minuscole + maiuscole + numeri + speciali
    
    # Assicurarsi che la password contenga almeno un carattere da ogni set richiesto
    password = []
    if minuscole:
        password.append(random.choice(minuscole))
    if maiuscole:
        password.append(random.choice(maiuscole))
    if numeri:
        password.append(random.choice(numeri))
    if speciali:
        password.append(random.choice(speciali))
    
    # Aggiungere caratteri casuali fino a raggiungere la lunghezza desiderata
    while len(password) < lunghezza:
        password.append(random.choice(tutti_caratteri))
    
    # Mescolare la password
    random.shuffle(password)
    
    # Convertire la lista in una stringa
    return ''.join(password)

# Generare password con diverse configurazioni
print(f"Password standard: {genera_password()}")
print(f"Password senza caratteri speciali: {genera_password(usa_speciali=False)}")
print(f"Password solo lettere: {genera_password(usa_numeri=False, usa_speciali=False)}")
print(f"Password lunga: {genera_password(lunghezza=20)}")
```

### Estrazione di Numeri del Lotto

```python
import random

def estrai_numeri_lotto(min_num=1, max_num=90, num_estratti=6):
    """Simula un'estrazione del lotto."""
    return sorted(random.sample(range(min_num, max_num + 1), num_estratti))

# Simulare diverse estrazioni
print(f"Estrazione del Lotto (6 numeri da 1 a 90): {estrai_numeri_lotto()}")
print(f"Estrazione del SuperEnalotto (6 numeri da 1 a 90): {estrai_numeri_lotto()}")
print(f"Estrazione del Lotto Germania (6 numeri da 1 a 49): {estrai_numeri_lotto(max_num=49)}")
print(f"Estrazione del PowerBall USA (5 numeri da 1 a 69): {estrai_numeri_lotto(max_num=69, num_estratti=5)}")
```

### Simulazione di una Camminata Aleatoria

```python
import random
import matplotlib.pyplot as plt

def camminata_aleatoria_1d(passi, probabilita_avanti=0.5):
    """Simula una camminata aleatoria in una dimensione."""
    posizione = 0
    posizioni = [posizione]
    
    for _ in range(passi):
        if random.random() < probabilita_avanti:
            posizione += 1  # Passo avanti
        else:
            posizione -= 1  # Passo indietro
        posizioni.append(posizione)
    
    return posizioni

def camminata_aleatoria_2d(passi):
    """Simula una camminata aleatoria in due dimensioni."""
    x, y = 0, 0
    percorso_x = [x]
    percorso_y = [y]
    
    for _ in range(passi):
        direzione = random.choice(['N', 'S', 'E', 'O'])
        if direzione == 'N':
            y += 1
        elif direzione == 'S':
            y -= 1
        elif direzione == 'E':
            x += 1
        else:  # 'O'
            x -= 1
        
        percorso_x.append(x)
        percorso_y.append(y)
    
    return percorso_x, percorso_y

# Simulare una camminata aleatoria in 1D
posizioni_1d = camminata_aleatoria_1d(1000)

# Simulare una camminata aleatoria in 2D
percorso_x, percorso_y = camminata_aleatoria_2d(1000)

# Visualizzare le camminate aleatorie
plt.figure(figsize=(12, 5))

# Camminata 1D
plt.subplot(1, 2, 1)
plt.plot(posizioni_1d)
plt.title('Camminata Aleatoria 1D')
plt.xlabel('Passo')
plt.ylabel('Posizione')
plt.grid(True, alpha=0.3)

# Camminata 2D
plt.subplot(1, 2, 2)
plt.plot(percorso_x, percorso_y, 'b-')
plt.plot(percorso_x[0], percorso_y[0], 'go', markersize=10)  # Punto di partenza
plt.plot(percorso_x[-1], percorso_y[-1], 'ro', markersize=10)  # Punto di arrivo
plt.title('Camminata Aleatoria 2D')
plt.xlabel('X')
plt.ylabel('Y')
plt.grid(True, alpha=0.3)
plt.axis('equal')

plt.tight_layout()
plt.show()
```

### Simulazione di Monte Carlo per il Calcolo di π

```python
import random
import matplotlib.pyplot as plt
import numpy as np

def stima_pi(num_punti):
    """Stima il valore di π utilizzando il metodo Monte Carlo."""
    punti_nel_cerchio = 0
    punti_x = []
    punti_y = []
    colori = []
    
    for _ in range(num_punti):
        x = random.uniform(-1, 1)
        y = random.uniform(-1, 1)
        punti_x.append(x)
        punti_y.append(y)
        
        # Verificare se il punto è all'interno del cerchio unitario
        if x**2 + y**2 <= 1:
            punti_nel_cerchio += 1
            colori.append('blue')
        else:
            colori.append('red')
    
    # Calcolare π come 4 volte il rapporto tra i punti nel cerchio e il totale
    pi_stimato = 4 * punti_nel_cerchio / num_punti
    return pi_stimato, punti_x, punti_y, colori

# Stimare π con diversi numeri di punti
num_punti_list = [100, 1000, 10000, 100000]
risultati = []

for num_punti in num_punti_list:
    pi_stimato, _, _, _ = stima_pi(num_punti)
    risultati.append(pi_stimato)
    print(f"Stima di π con {num_punti} punti: {pi_stimato}")

# Visualizzare la simulazione con 1000 punti
pi_stimato, punti_x, punti_y, colori = stima_pi(1000)

plt.figure(figsize=(10, 10))
plt.scatter(punti_x, punti_y, c=colori, alpha=0.6, s=10)

# Disegnare il cerchio unitario
theta = np.linspace(0, 2*np.pi, 100)
plt.plot(np.cos(theta), np.sin(theta), 'k-')

# Disegnare il quadrato
plt.plot([-1, 1, 1, -1, -1], [-1, -1, 1, 1, -1], 'k-')

plt.title(f'Simulazione Monte Carlo per π (Stima: {pi_stimato:.6f})')
plt.axis('equal')
plt.grid(True, alpha=0.3)
plt.show()
```

## Conclusione

Il modulo `random` è uno strumento potente e versatile per la generazione di numeri casuali in Python. Offre una vasta gamma di funzioni per generare numeri casuali con diverse distribuzioni, selezionare elementi casuali da sequenze e mescolare sequenze.

È importante ricordare che il modulo `random` utilizza un generatore di numeri pseudo-casuali, che è adatto per la maggior parte delle applicazioni ma non per scopi crittografici. Per applicazioni che richiedono numeri casuali crittograficamente sicuri, è consigliabile utilizzare il modulo `secrets`.

La generazione di numeri casuali è fondamentale in molti campi, dalla simulazione alla crittografia, dai giochi all'intelligenza artificiale. Comprendere come utilizzare efficacemente il modulo `random` è quindi un'abilità preziosa per ogni sviluppatore Python.

## Esercizi

1. Scrivi una funzione che simuli il lancio di due dadi e calcoli la distribuzione delle somme ottenute su 1000 lanci.

2. Implementa un generatore di password casuali che garantisca la presenza di almeno una lettera maiuscola, una lettera minuscola, un numero e un carattere speciale.

3. Crea una funzione che simuli un mazzo di carte da poker, permetta di mescolare il mazzo e di pescare carte.

4. Implementa una simulazione di Monte Carlo per stimare l'area sotto una curva in un intervallo specificato.

5. Scrivi un programma che generi una sequenza di numeri casuali con distribuzione normale e verifichi graficamente che la distribuzione sia effettivamente normale.