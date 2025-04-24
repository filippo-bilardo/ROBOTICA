# Math e Statistics: Operazioni Matematiche e Statistiche

## Introduzione

Le librerie `math` e `statistics` sono due moduli fondamentali della Libreria Standard di Python che forniscono funzioni per operazioni matematiche e statistiche. Questi moduli offrono strumenti essenziali per calcoli scientifici, analisi dei dati e sviluppo di algoritmi.

Il modulo `math` fornisce accesso alle funzioni matematiche definite dallo standard C, mentre il modulo `statistics` offre funzioni per calcolare statistiche di base su dati numerici.

In questa guida, esploreremo le principali funzionalità offerte da questi due moduli e vedremo come utilizzarle efficacemente nei nostri programmi Python.

## Il Modulo math

Il modulo `math` fornisce funzioni matematiche di base, costanti e operazioni su numeri reali.

### Costanti Matematiche

```python
import math

# Costanti fondamentali
print(f"Pi greco (π): {math.pi}")               # 3.141592653589793
print(f"Numero di Eulero (e): {math.e}")        # 2.718281828459045
print(f"Infinito: {math.inf}")                  # inf
print(f"NaN (Not a Number): {math.nan}")        # nan
print(f"Tau (τ = 2π): {math.tau}")              # 6.283185307179586
```

### Funzioni Trigonometriche

```python
import math

# Conversione tra gradi e radianti
angolo_gradi = 45
angolo_radianti = math.radians(angolo_gradi)
print(f"{angolo_gradi}° = {angolo_radianti} radianti")

angolo_radianti = math.pi / 4
angolo_gradi = math.degrees(angolo_radianti)
print(f"{angolo_radianti} radianti = {angolo_gradi}°")

# Funzioni trigonometriche (input in radianti)
print(f"sin(π/4) = {math.sin(math.pi/4)}")      # 0.7071067811865475
print(f"cos(π/4) = {math.cos(math.pi/4)}")      # 0.7071067811865476
print(f"tan(π/4) = {math.tan(math.pi/4)}")      # 0.9999999999999999

# Funzioni trigonometriche inverse
x = 0.5
print(f"arcsin({x}) = {math.asin(x)} radianti")  # 0.5235987755982989
print(f"arccos({x}) = {math.acos(x)} radianti")  # 1.0471975511965979
print(f"arctan({x}) = {math.atan(x)} radianti")  # 0.4636476090008061

# Funzioni iperboliche
print(f"sinh(1) = {math.sinh(1)}")              # 1.1752011936438014
print(f"cosh(1) = {math.cosh(1)}")              # 1.5430806348152437
print(f"tanh(1) = {math.tanh(1)}")              # 0.7615941559557649
```

### Funzioni Esponenziali e Logaritmiche

```python
import math

# Funzioni esponenziali
print(f"e^2 = {math.exp(2)}")                   # 7.38905609893065
print(f"2^3 = {math.pow(2, 3)}")                # 8.0

# Funzioni logaritmiche
print(f"ln(10) = {math.log(10)}")                # 2.302585092994046
print(f"log10(100) = {math.log10(100)}")        # 2.0
print(f"log2(8) = {math.log2(8)}")              # 3.0
print(f"log(100, 10) = {math.log(100, 10)}")    # 2.0 (logaritmo in base 10)
```

### Funzioni di Arrotondamento

```python
import math

# Arrotondamento verso il basso (floor)
print(f"floor(3.7) = {math.floor(3.7)}")         # 3
print(f"floor(-3.7) = {math.floor(-3.7)}")       # -4

# Arrotondamento verso l'alto (ceil)
print(f"ceil(3.7) = {math.ceil(3.7)}")           # 4
print(f"ceil(-3.7) = {math.ceil(-3.7)}")         # -3

# Troncamento (elimina la parte decimale)
print(f"trunc(3.7) = {math.trunc(3.7)}")         # 3
print(f"trunc(-3.7) = {math.trunc(-3.7)}")       # -3

# Arrotondamento al più vicino (round è una funzione built-in)
print(f"round(3.7) = {round(3.7)}")              # 4
print(f"round(3.5) = {round(3.5)}")              # 4 (arrotonda al pari più vicino in caso di .5)
print(f"round(2.5) = {round(2.5)}")              # 2
print(f"round(3.14159, 2) = {round(3.14159, 2)}")  # 3.14 (arrotonda a 2 decimali)
```

### Altre Funzioni Matematiche

```python
import math

# Valore assoluto (abs è anche una funzione built-in)
print(f"abs(-5) = {abs(-5)}")                    # 5
print(f"fabs(-5.3) = {math.fabs(-5.3)}")         # 5.3 (restituisce sempre un float)

# Radice quadrata
print(f"sqrt(16) = {math.sqrt(16)}")             # 4.0

# Fattoriale
print(f"5! = {math.factorial(5)}")               # 120

# Massimo comun divisore (MCD)
print(f"gcd(12, 18) = {math.gcd(12, 18)}")       # 6

# Minimo comune multiplo (mcm)
print(f"lcm(12, 18) = {math.lcm(12, 18)}")       # 36 (disponibile da Python 3.9)

# Combinazioni e permutazioni
n, k = 5, 2
print(f"C({n},{k}) = {math.comb(n, k)}")         # 10 (combinazioni, disponibile da Python 3.8)
print(f"P({n},{k}) = {math.perm(n, k)}")         # 20 (permutazioni, disponibile da Python 3.8)

# Somma di precisione (evita errori di arrotondamento)
numeri = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
print(f"sum([0.1] * 10) = {sum(numeri)}")        # 0.9999999999999999
print(f"fsum([0.1] * 10) = {math.fsum(numeri)}")  # 1.0

# Controllo se un numero è infinito o NaN
print(f"isinf(inf): {math.isinf(math.inf)}")      # True
print(f"isnan(nan): {math.isnan(math.nan)}")      # True
```

### Funzioni per Numeri Complessi

Per operazioni con numeri complessi, Python offre il modulo `cmath`, che è l'equivalente di `math` per i numeri complessi.

```python
import cmath

# Creazione di un numero complesso
z = complex(2, 3)  # 2 + 3j
print(f"z = {z}")

# Funzioni per numeri complessi
print(f"Modulo di z: {abs(z)}")                  # 3.605551275463989
print(f"Fase di z: {cmath.phase(z)} radianti")    # 0.982793723247329
print(f"Parte reale: {z.real}")                  # 2.0
print(f"Parte immaginaria: {z.imag}")            # 3.0
print(f"Coniugato: {z.conjugate()}")             # (2-3j)

# Funzioni matematiche con numeri complessi
print(f"sqrt(-1) = {cmath.sqrt(-1)}")            # 1j
print(f"exp(1j*π) = {cmath.exp(1j * cmath.pi)}")  # (-1+1.2246467991473532e-16j) ≈ -1
```

## Il Modulo statistics

Il modulo `statistics` fornisce funzioni per calcolare statistiche di base su dati numerici. È disponibile a partire da Python 3.4.

### Misure di Tendenza Centrale

```python
import statistics

# Dati di esempio
dati = [2, 3, 3, 4, 5, 5, 5, 6, 6, 7]

# Media aritmetica
print(f"Media: {statistics.mean(dati)}")          # 4.6

# Mediana (valore centrale)
print(f"Mediana: {statistics.median(dati)}")      # 5.0

# Mediana bassa (per lunghezza pari, prende il valore più basso dei due centrali)
print(f"Mediana bassa: {statistics.median_low(dati)}")  # 5

# Mediana alta (per lunghezza pari, prende il valore più alto dei due centrali)
print(f"Mediana alta: {statistics.median_high(dati)}")  # 5

# Moda (valore più frequente)
print(f"Moda: {statistics.mode(dati)}")           # 5

# Multimode (tutti i valori più frequenti)
print(f"Multimode: {statistics.multimode(dati)}")  # [5]

# Media geometrica
print(f"Media geometrica: {statistics.geometric_mean(dati)}")  # 4.4229435948851615

# Media armonica
print(f"Media armonica: {statistics.harmonic_mean(dati)}")  # 4.1958041958041965
```

### Misure di Dispersione

```python
import statistics

# Dati di esempio
dati = [2, 3, 3, 4, 5, 5, 5, 6, 6, 7]

# Varianza della popolazione
print(f"Varianza (pop): {statistics.pvariance(dati)}")  # 2.04

# Deviazione standard della popolazione
print(f"Dev. std (pop): {statistics.pstdev(dati)}")     # 1.4282856857085701

# Varianza del campione
print(f"Varianza (campione): {statistics.variance(dati)}")  # 2.2666666666666666

# Deviazione standard del campione
print(f"Dev. std (campione): {statistics.stdev(dati)}")     # 1.5055453054182178
```

### Quantili e Percentili

```python
import statistics

# Dati di esempio
dati = [2, 3, 3, 4, 5, 5, 5, 6, 6, 7]

# Quantili
print(f"Quartili: {statistics.quantiles(dati, n=4)}")  # [3.0, 5.0, 6.0]
print(f"Decili: {statistics.quantiles(dati, n=10)}")   # [2.0, 3.0, 3.0, 4.0, 5.0, 5.0, 5.0, 6.0, 6.0]

# Percentili specifici
print(f"25° percentile: {statistics.quantiles(dati, n=4)[0]}")  # 3.0
print(f"50° percentile (mediana): {statistics.median(dati)}")   # 5.0
print(f"75° percentile: {statistics.quantiles(dati, n=4)[2]}")  # 6.0
```

### Correlazione e Regressione Lineare

```python
import statistics

# Dati di esempio (x, y)
x = [1, 2, 3, 4, 5]
y = [2, 4, 5, 4, 5]

# Coefficiente di correlazione
corr = statistics.correlation(x, y)
print(f"Correlazione: {corr}")  # 0.6324555320336759

# Coefficiente di regressione lineare
slope, intercept = statistics.linear_regression(x, y)
print(f"Pendenza: {slope}, Intercetta: {intercept}")  # Pendenza: 0.6, Intercetta: 2.0

# Predizione usando la regressione
nuovo_x = 6
predizione = slope * nuovo_x + intercept
print(f"Predizione per x={nuovo_x}: {predizione}")  # 5.6
```

### Distribuzioni Normali

```python
import statistics
import math

# Creare una distribuzione normale
media = 0
dev_std = 1
distrib = statistics.NormalDist(media, dev_std)

# Calcolare la funzione di densità di probabilità (PDF)
x = 1.5
pdf = distrib.pdf(x)
print(f"PDF per x={x}: {pdf}")  # 0.12951759566589174

# Calcolare la funzione di distribuzione cumulativa (CDF)
cdf = distrib.cdf(x)
print(f"CDF per x={x}: {cdf}")  # 0.9331927987311419

# Calcolare l'inverso della CDF (quantile)
p = 0.95
quantile = distrib.inv_cdf(p)
print(f"Quantile per p={p}: {quantile}")  # 1.6448536269514722

# Generare campioni casuali dalla distribuzione
campioni = distrib.samples(10)
print(f"Campioni: {list(campioni)}")

# Calcolare l'intervallo di confidenza
conf_interval = distrib.interval(0.95)
print(f"Intervallo di confidenza al 95%: {conf_interval}")  # (-1.96, 1.96)
```

## Esempi Pratici

### Calcolo di Statistiche Descrittive

```python
import statistics
import math

# Funzione per calcolare statistiche descrittive
def statistiche_descrittive(dati):
    if not dati:
        return "Nessun dato fornito"
    
    risultati = {
        "n": len(dati),
        "min": min(dati),
        "max": max(dati),
        "range": max(dati) - min(dati),
        "mean": statistics.mean(dati),
        "median": statistics.median(dati),
        "mode": statistics.multimode(dati),
        "variance": statistics.variance(dati) if len(dati) > 1 else 0,
        "stdev": statistics.stdev(dati) if len(dati) > 1 else 0,
        "skewness": None,  # Calcolato sotto
        "kurtosis": None,  # Calcolato sotto
    }
    
    # Calcolo dell'asimmetria (skewness)
    if len(dati) > 2:
        n = len(dati)
        mean = risultati["mean"]
        stdev = risultati["stdev"]
        skewness = sum((x - mean) ** 3 for x in dati) / (n * stdev ** 3)
        risultati["skewness"] = skewness
    
    # Calcolo della curtosi (kurtosis)
    if len(dati) > 3:
        n = len(dati)
        mean = risultati["mean"]
        stdev = risultati["stdev"]
        kurtosis = sum((x - mean) ** 4 for x in dati) / (n * stdev ** 4) - 3
        risultati["kurtosis"] = kurtosis
    
    return risultati

# Esempio di utilizzo
dati = [12, 15, 15, 16, 17, 18, 19, 22, 24, 25, 25, 26, 27, 28, 32, 35, 36, 40, 44, 50]
stats = statistiche_descrittive(dati)

# Stampa dei risultati
print("Statistiche Descrittive:")
print(f"Numero di osservazioni: {stats['n']}")
print(f"Minimo: {stats['min']}")
print(f"Massimo: {stats['max']}")
print(f"Range: {stats['range']}")
print(f"Media: {stats['mean']:.2f}")
print(f"Mediana: {stats['median']:.2f}")
print(f"Moda: {stats['mode']}")
print(f"Varianza: {stats['variance']:.2f}")
print(f"Deviazione standard: {stats['stdev']:.2f}")
print(f"Asimmetria: {stats['skewness']:.2f}")
print(f"Curtosi: {stats['kurtosis']:.2f}")
```

### Calcolo di Probabilità con la Distribuzione Normale

```python
import statistics
import matplotlib.pyplot as plt
import numpy as np

# Funzione per calcolare la probabilità in un intervallo
def prob_intervallo(distrib, a, b):
    """Calcola la probabilità che un valore cada nell'intervallo [a, b]."""
    return distrib.cdf(b) - distrib.cdf(a)

# Creazione di una distribuzione normale
media = 100
dev_std = 15
distrib = statistics.NormalDist(media, dev_std)

# Calcolo di alcune probabilità
print(f"P(X < 85): {distrib.cdf(85):.4f}")  # 0.1587
print(f"P(X > 115): {1 - distrib.cdf(115):.4f}")  # 0.1587
print(f"P(85 < X < 115): {prob_intervallo(distrib, 85, 115):.4f}")  # 0.6826

# Visualizzazione della distribuzione
x = np.linspace(media - 4*dev_std, media + 4*dev_std, 1000)
y = [distrib.pdf(val) for val in x]

plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2)
plt.fill_between(x, y, where=[(val >= 85) and (val <= 115) for val in x], color='skyblue', alpha=0.4)
plt.axvline(media, color='red', linestyle='--', alpha=0.5)
plt.axvline(media - dev_std, color='green', linestyle='--', alpha=0.5)
plt.axvline(media + dev_std, color='green', linestyle='--', alpha=0.5)
plt.title('Distribuzione Normale')
plt.xlabel('Valore')
plt.ylabel('Densità di Probabilità')
plt.grid(True, alpha=0.3)
plt.show()
```

### Analisi di Dati Finanziari

```python
import statistics
import math
import random

# Simulazione di rendimenti giornalieri di un titolo
def simula_rendimenti(media_annuale, volatilita_annuale, giorni):
    """Simula rendimenti giornalieri con distribuzione normale."""
    media_giornaliera = media_annuale / 252  # 252 giorni di trading in un anno
    volatilita_giornaliera = volatilita_annuale / math.sqrt(252)
    distrib = statistics.NormalDist(media_giornaliera, volatilita_giornaliera)
    return list(distrib.samples(giorni))

# Calcolo del Value at Risk (VaR)
def calcola_var(rendimenti, livello_confidenza=0.95):
    """Calcola il Value at Risk a un dato livello di confidenza."""
    distrib = statistics.NormalDist.from_samples(rendimenti)
    return -distrib.inv_cdf(1 - livello_confidenza)

# Simulazione di un portafoglio
rendimenti = simula_rendimenti(0.08, 0.20, 252)  # 8% rendimento, 20% volatilità

# Calcolo di statistiche
media = statistics.mean(rendimenti)
dev_std = statistics.stdev(rendimenti)
var_95 = calcola_var(rendimenti, 0.95)
var_99 = calcola_var(rendimenti, 0.99)

print(f"Rendimento medio giornaliero: {media:.6f}")
print(f"Volatilità giornaliera: {dev_std:.6f}")
print(f"VaR giornaliero al 95%: {var_95:.6f}")
print(f"VaR giornaliero al 99%: {var_99:.6f}")

# Calcolo del rendimento cumulativo
rendimento_cumulativo = math.exp(sum(rendimenti)) - 1
print(f"Rendimento annuale: {rendimento_cumulativo:.2%}")
```

### Calcolo di Formule Geometriche

```python
import math

# Classe per calcoli geometrici
class Geometria:
    @staticmethod
    def area_cerchio(raggio):
        """Calcola l'area di un cerchio dato il raggio."""
        return math.pi * raggio ** 2
    
    @staticmethod
    def circonferenza_cerchio(raggio):
        """Calcola la circonferenza di un cerchio dato il raggio."""
        return 2 * math.pi * raggio
    
    @staticmethod
    def area_triangolo(base, altezza):
        """Calcola l'area di un triangolo data base e altezza."""
        return 0.5 * base * altezza
    
    @staticmethod
    def area_triangolo_lati(a, b, c):
        """Calcola l'area di un triangolo dati i tre lati (formula di Erone)."""
        s = (a + b + c) / 2  # Semiperimetro
        return math.sqrt(s * (s - a) * (s - b) * (s - c))
    
    @staticmethod
    def volume_sfera(raggio):
        """Calcola il volume di una sfera dato il raggio."""
        return (4/3) * math.pi * raggio ** 3
    
    @staticmethod
    def superficie_sfera(raggio):
        """Calcola la superficie di una sfera dato il raggio."""
        return 4 * math.pi * raggio ** 2
    
    @staticmethod
    def volume_cilindro(raggio, altezza):
        """Calcola il volume di un cilindro dati raggio e altezza."""
        return math.pi * raggio ** 2 * altezza
    
    @staticmethod
    def distanza_punti(x1, y1, x2, y2):
        """Calcola la distanza euclidea tra due punti nel piano."""
        return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

# Esempio di utilizzo
raggio_cerchio = 5
print(f"Area del cerchio: {Geometria.area_cerchio(raggio_cerchio):.2f}")
print(f"Circonferenza del cerchio: {Geometria.circonferenza_cerchio(raggio_cerchio):.2f}")

lati_triangolo = (3, 4, 5)
print(f"Area del triangolo: {Geometria.area_triangolo_lati(*lati_triangolo):.2f}")

raggio_sfera = 3
print(f"Volume della sfera: {Geometria.volume_sfera(raggio_sfera):.2f}")
print(f"Superficie della sfera: {Geometria.superficie_sfera(raggio_sfera):.2f}")

punto1 = (1, 2)
punto2 = (4, 6)
print(f"Distanza tra i punti: {Geometria.distanza_punti(*punto1, *punto2):.2f}")
```

## Conclusione

I moduli `math` e `statistics` offrono un'ampia gamma di funzioni per operazioni matematiche e statistiche in Python. Queste librerie sono strumenti essenziali per calcoli scientifici, analisi dei dati e sviluppo di algoritmi.

Il modulo `math` fornisce funzioni matematiche di base, costanti e operazioni su numeri reali, mentre il modulo `statistics` offre funzioni per calcolare statistiche di base su dati numerici.

Per operazioni matematiche e statistiche più avanzate, è possibile utilizzare librerie di terze parti come NumPy, SciPy e pandas, che offrono funzionalità più complete e ottimizzate per calcoli numerici e analisi dei dati.

## Esercizi

1. Scrivi una funzione che calcoli la media, la mediana e la moda di una lista di numeri utilizzando il modulo `statistics`.

2. Implementa una funzione che calcoli la distanza euclidea tra due punti in uno spazio n-dimensionale utilizzando il modulo `math`.

3. Crea una funzione che generi numeri casuali con distribuzione normale e calcoli la probabilità che un valore cada in un determinato intervallo.

4. Implementa una funzione che calcoli il coefficiente di correlazione tra due serie di dati utilizzando il modulo `statistics`.

5. Scrivi un programma che calcoli l'area e il perimetro di diverse figure geometriche (cerchio, triangolo, rettangolo, ecc.) utilizzando le funzioni del modulo `math`.