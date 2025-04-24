# Cosa sono i Moduli in Python

In Python, un modulo è semplicemente un file contenente codice Python. Il nome del modulo è il nome del file, senza l'estensione `.py`. I moduli permettono di organizzare il codice in modo logico e riutilizzabile.

## Perché Usare i Moduli

I moduli offrono diversi vantaggi:

1. **Organizzazione del codice**: Suddividere il codice in moduli separati rende più facile la gestione di progetti complessi.
2. **Riutilizzo del codice**: I moduli permettono di riutilizzare funzioni e classi in diversi programmi.
3. **Namespace separati**: I moduli creano spazi dei nomi separati, evitando conflitti tra variabili con lo stesso nome.
4. **Manutenibilità**: Il codice organizzato in moduli è più facile da mantenere e aggiornare.

## Tipi di Moduli

In Python esistono tre tipi principali di moduli:

1. **Moduli integrati (built-in)**: Sono parte della distribuzione standard di Python (come `math`, `random`, `datetime`).
2. **Moduli di terze parti**: Sono sviluppati da altri programmatori e possono essere installati tramite pip.
3. **Moduli personalizzati**: Sono creati dagli sviluppatori per organizzare il proprio codice.

## Esempio di Modulo Integrato

Ecco un esempio di utilizzo del modulo `math`, che è un modulo integrato di Python:

```python
import math

# Utilizzo di funzioni dal modulo math
raggio = 5
area = math.pi * math.pow(raggio, 2)
print(f"L'area del cerchio con raggio {raggio} è {area:.2f}")

# Utilizzo di altre funzioni matematiche
print(f"La radice quadrata di 16 è {math.sqrt(16)}")
print(f"Il seno di 30 gradi è {math.sin(math.radians(30))}")
```

## Struttura di un Modulo

Un modulo Python può contenere:

- Definizioni di variabili
- Definizioni di funzioni
- Definizioni di classi
- Codice eseguibile

Quando un modulo viene importato, tutto il codice al suo interno viene eseguito. Questo permette di inizializzare variabili, definire funzioni e classi, e anche eseguire codice se necessario.

## Conclusione

I moduli sono uno strumento fondamentale per organizzare il codice Python in modo efficiente. Nella prossima sezione, vedremo come importare moduli e utilizzare le loro funzionalità nei nostri programmi.

---

[Indice degli Argomenti](../README.md) | [Prossimo: Importare Moduli](./02_importare_moduli.md)