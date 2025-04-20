# Esercitazione 2: Variabili e Tipi di Dati

## Obiettivi
In questa esercitazione, imparerai a utilizzare le variabili in Python e conoscerai i principali tipi di dati del linguaggio. Comprenderai come dichiarare variabili, assegnare valori e convertire tra diversi tipi di dati.

## Indice degli Argomenti
1. [Cos'è una variabile in Python](./teoria/01_variabili.md)
2. [Tipi di dati numerici: int, float, complex](./teoria/02_tipi_numerici.md)
3. [Stringhe e operazioni sulle stringhe](./teoria/03_stringhe.md)
4. [Tipi booleani e operazioni logiche](./teoria/04_booleani.md)
5. [Conversione tra tipi di dati](./teoria/05_conversione_tipi.md)
6. [Costanti e convenzioni di nomenclatura](./teoria/06_costanti_nomenclatura.md)
7. [Scope delle variabili](./teoria/07_scope_variabili.md)

## Esempi Pratici

### Esempio 1: Dichiarazione e utilizzo di variabili
```python
# Dichiarazione di variabili di diversi tipi
nome = "Mario"
eta = 30
altezza = 1.75
e_studente = True

# Utilizzo delle variabili
print(f"Mi chiamo {nome}, ho {eta} anni e sono alto {altezza} metri.")
if e_studente:
    print("Sono uno studente.")
else:
    print("Non sono uno studente.")
```

### Esempio 2: Operazioni con diversi tipi di dati
```python
# Operazioni con numeri
x = 10
y = 3
print(f"Somma: {x + y}")
print(f"Differenza: {x - y}")
print(f"Prodotto: {x * y}")
print(f"Divisione: {x / y}")
print(f"Divisione intera: {x // y}")
print(f"Resto: {x % y}")
print(f"Potenza: {x ** y}")

# Operazioni con stringhe
nome = "Python"
print(f"Lunghezza: {len(nome)}")
print(f"Maiuscolo: {nome.upper()}")
print(f"Minuscolo: {nome.lower()}")
print(f"Ripetizione: {nome * 3}")
```

### Esempio 3: Conversione tra tipi di dati
```python
# Conversione da stringa a numero
stringa_numero = "42"
numero_intero = int(stringa_numero)
print(f"Stringa: {stringa_numero}, Tipo: {type(stringa_numero)}")
print(f"Numero: {numero_intero}, Tipo: {type(numero_intero)}")

# Conversione da numero a stringa
numero = 3.14
stringa = str(numero)
print(f"Numero: {numero}, Tipo: {type(numero)}")
print(f"Stringa: {stringa}, Tipo: {type(stringa)}")

# Conversione tra tipi numerici
intero = 42
float_num = float(intero)
print(f"Intero: {intero}, Tipo: {type(intero)}")
print(f"Float: {float_num}, Tipo: {type(float_num)}")
```

## Esercizi

1. **Calcolatrice di base**: Scrivi un programma che chieda all'utente due numeri e un'operazione (addizione, sottrazione, moltiplicazione, divisione) e mostri il risultato.

2. **Convertitore di temperatura**: Crea un programma che converta una temperatura da Celsius a Fahrenheit e viceversa, in base alla scelta dell'utente.

3. **Manipolazione di stringhe**: Scrivi un programma che chieda all'utente il proprio nome e cognome, e poi mostri: il nome completo, il numero totale di caratteri, il nome in maiuscolo e il cognome in minuscolo.

4. **Calcolatore di età**: Crea un programma che chieda all'utente il proprio anno di nascita e calcoli la sua età approssimativa in anni, mesi, settimane e giorni.

## Risorse Aggiuntive
- [Documentazione ufficiale sui tipi di dati in Python](https://docs.python.org/3/library/stdtypes.html)
- [Real Python - Variables in Python](https://realpython.com/python-variables/)
- [W3Schools - Python Variables](https://www.w3schools.com/python/python_variables.asp)

---

[Indice del Corso](../README.md) | [Esercitazione Precedente: Introduzione a Python e Primi Passi](../01-Introduzione_Primi_Passi/README.md) | [Prossima Esercitazione: Operatori e Espressioni](../03-Operatori_Espressioni/README.md)