# Introduzione alla Programmazione Orientata agli Oggetti

La Programmazione Orientata agli Oggetti (OOP) è un paradigma di programmazione che utilizza "oggetti" per modellare dati e comportamenti. Python supporta pienamente questo paradigma, permettendo di creare programmi più organizzati, modulari e riutilizzabili.

## Cos'è la Programmazione Orientata agli Oggetti?

La programmazione orientata agli oggetti è un approccio alla progettazione del software in cui i programmi sono organizzati come collezioni di "oggetti", ciascuno dei quali rappresenta un'istanza di una "classe", che contiene sia dati (attributi) che comportamenti (metodi).

I quattro principi fondamentali della OOP sono:

1. **Incapsulamento**: Nascondere i dettagli implementativi e mostrare solo le funzionalità necessarie
2. **Astrazione**: Rappresentare caratteristiche essenziali senza includere i dettagli di background
3. **Ereditarietà**: Definire una classe che eredita tutti i metodi e le proprietà da un'altra classe
4. **Polimorfismo**: Utilizzare una singola interfaccia per entità di diversi tipi

## Perché Usare la OOP in Python?

- **Riutilizzo del codice**: Le classi permettono di riutilizzare il codice in modo efficiente
- **Struttura**: Organizza il codice in unità logiche e gerarchiche
- **Manutenibilità**: Facilita la manutenzione e l'aggiornamento del codice
- **Modularità**: Permette di sviluppare moduli indipendenti che possono essere combinati
- **Sicurezza**: Attraverso l'incapsulamento, protegge i dati da modifiche accidentali

## Differenze tra Programmazione Procedurale e OOP

| Programmazione Procedurale | Programmazione Orientata agli Oggetti |
|----------------------------|---------------------------------------|
| Basata su procedure/funzioni | Basata su oggetti |
| Dati e funzioni sono entità separate | Dati e funzioni sono incapsulati in oggetti |
| Approccio top-down | Approccio bottom-up |
| Difficile da estendere | Facilmente estendibile tramite ereditarietà |
| Focus sulla sequenza di passi | Focus sugli oggetti e le loro interazioni |

## Esempio Introduttivo

Ecco un semplice esempio di classe in Python:

```python
class Automobile:
    # Attributi di classe
    numero_ruote = 4
    
    # Costruttore
    def __init__(self, marca, modello, anno):
        # Attributi di istanza
        self.marca = marca
        self.modello = modello
        self.anno = anno
        self.velocita_attuale = 0
    
    # Metodi
    def accelera(self, incremento):
        self.velocita_attuale += incremento
        return self.velocita_attuale
    
    def frena(self, decremento):
        if self.velocita_attuale - decremento < 0:
            self.velocita_attuale = 0
        else:
            self.velocita_attuale -= decremento
        return self.velocita_attuale
    
    def descrizione(self):
        return f"{self.marca} {self.modello} del {self.anno}"

# Creazione di un oggetto (istanza della classe)
mia_auto = Automobile("Fiat", "Panda", 2020)

# Utilizzo dei metodi
print(mia_auto.descrizione())  # Output: Fiat Panda del 2020
mia_auto.accelera(50)
print(f"Velocità attuale: {mia_auto.velocita_attuale} km/h")  # Output: Velocità attuale: 50 km/h
mia_auto.frena(20)
print(f"Velocità attuale: {mia_auto.velocita_attuale} km/h")  # Output: Velocità attuale: 30 km/h
```

In questo esempio, abbiamo definito una classe `Automobile` con attributi e metodi, e poi abbiamo creato un'istanza di questa classe per rappresentare una specifica automobile.

## Conclusione

La programmazione orientata agli oggetti è un potente paradigma che Python supporta completamente. Nei prossimi capitoli, esploreremo in dettaglio i concetti di classi, oggetti, ereditarietà, polimorfismo e altri aspetti fondamentali della OOP in Python.

## Navigazione

- [Torna all'indice dell'esercitazione](../README.md)
- [Prossimo: Classi e Oggetti](./02_classi_oggetti.md)