# Test-Driven Development (TDD)

## Cos'è il Test-Driven Development

Il Test-Driven Development (TDD) è un approccio allo sviluppo software in cui i test vengono scritti prima del codice di produzione. Questo processo inverte il flusso tradizionale di sviluppo, dove prima si scrive il codice e poi si testano le funzionalità.

Il TDD segue un ciclo di sviluppo noto come "Red-Green-Refactor":

1. **Red**: Scrivi un test che fallisce per una funzionalità non ancora implementata
2. **Green**: Scrivi il codice minimo necessario per far passare il test
3. **Refactor**: Migliora il codice mantenendo i test in verde

## Vantaggi del TDD

- **Design migliore**: Scrivere i test prima ti costringe a pensare all'interfaccia e al comportamento del codice prima dell'implementazione
- **Documentazione vivente**: I test servono come documentazione eseguibile di come il codice dovrebbe funzionare
- **Maggiore fiducia nelle modifiche**: Con una buona copertura dei test, è più facile refactoring e aggiungere nuove funzionalità
- **Bug ridotti**: Molti bug vengono catturati durante lo sviluppo
- **Feedback immediato**: Sai subito se le tue modifiche hanno rotto qualcosa

## Il Ciclo TDD in Dettaglio

### 1. Scrivi un Test che Fallisce

Il primo passo è scrivere un test che definisce una funzione o miglioramento desiderato. Il test dovrebbe fallire inizialmente perché la funzionalità non è ancora implementata.

```python
# test_utente.py
import unittest
from utente import Utente

class TestUtente(unittest.TestCase):
    def test_nome_completo(self):
        utente = Utente("Mario", "Rossi")
        self.assertEqual(utente.nome_completo(), "Mario Rossi")

if __name__ == '__main__':
    unittest.main()
```

Eseguendo questo test, otterremo un errore perché la classe `Utente` non esiste ancora.

### 2. Scrivi il Codice Minimo per Far Passare il Test

Ora scriviamo il codice minimo necessario per far passare il test:

```python
# utente.py
class Utente:
    def __init__(self, nome, cognome):
        self.nome = nome
        self.cognome = cognome
    
    def nome_completo(self):
        return f"{self.nome} {self.cognome}"
```

Eseguendo nuovamente il test, dovrebbe passare.

### 3. Refactoring

Una volta che il test passa, possiamo migliorare il codice mantenendo i test in verde. In questo caso semplice, potremmo non avere molto da refactoring, ma in casi più complessi questa fase è cruciale.

```python
# utente.py (dopo refactoring)
class Utente:
    def __init__(self, nome, cognome):
        self.nome = nome
        self.cognome = cognome
    
    def nome_completo(self):
        """Restituisce il nome completo dell'utente."""
        return f"{self.nome} {self.cognome}"
    
    def iniziali(self):
        """Restituisce le iniziali dell'utente."""
        return f"{self.nome[0]}.{self.cognome[0]}."
```

Dopo aver aggiunto il metodo `iniziali()`, dovremmo scrivere un nuovo test per questa funzionalità, continuando il ciclo TDD.

## Esempio Completo di TDD

Vediamo un esempio più completo di TDD per sviluppare una semplice classe `Carrello` per un'applicazione di e-commerce.

### Primo Ciclo: Aggiungere Prodotti al Carrello

**1. Scrivi un test che fallisce:**

```python
# test_carrello.py
import unittest
from carrello import Carrello

class TestCarrello(unittest.TestCase):
    def test_aggiungi_prodotto(self):
        carrello = Carrello()
        carrello.aggiungi_prodotto("libro", 15.0)
        self.assertEqual(carrello.totale(), 15.0)

if __name__ == '__main__':
    unittest.main()
```

**2. Scrivi il codice minimo:**

```python
# carrello.py
class Carrello:
    def __init__(self):
        self.prodotti = {}
    
    def aggiungi_prodotto(self, nome, prezzo):
        self.prodotti[nome] = prezzo
    
    def totale(self):
        return sum(self.prodotti.values())
```

**3. Refactoring (non necessario in questo caso semplice)**

### Secondo Ciclo: Aggiungere Quantità di Prodotti

**1. Scrivi un test che fallisce:**

```python
# test_carrello.py (aggiornato)
def test_aggiungi_prodotto_con_quantita(self):
    carrello = Carrello()
    carrello.aggiungi_prodotto("libro", 15.0, 2)
    self.assertEqual(carrello.totale(), 30.0)
```

**2. Scrivi il codice minimo:**

```python
# carrello.py (aggiornato)
class Carrello:
    def __init__(self):
        self.prodotti = {}
    
    def aggiungi_prodotto(self, nome, prezzo, quantita=1):
        if nome in self.prodotti:
            self.prodotti[nome]["quantita"] += quantita
        else:
            self.prodotti[nome] = {"prezzo": prezzo, "quantita": quantita}
    
    def totale(self):
        return sum(item["prezzo"] * item["quantita"] for item in self.prodotti.values())
```

**3. Refactoring:**

```python
# carrello.py (refactoring)
class Carrello:
    def __init__(self):
        self.prodotti = {}
    
    def aggiungi_prodotto(self, nome, prezzo, quantita=1):
        """Aggiunge un prodotto al carrello con la quantità specificata."""
        if nome in self.prodotti:
            self.prodotti[nome]["quantita"] += quantita
        else:
            self.prodotti[nome] = {"prezzo": prezzo, "quantita": quantita}
    
    def totale(self):
        """Calcola il prezzo totale di tutti i prodotti nel carrello."""
        return sum(item["prezzo"] * item["quantita"] for item in self.prodotti.values())
    
    def rimuovi_prodotto(self, nome):
        """Rimuove un prodotto dal carrello."""
        if nome in self.prodotti:
            del self.prodotti[nome]
```

### Terzo Ciclo: Rimuovere Prodotti

**1. Scrivi un test che fallisce:**

```python
# test_carrello.py (aggiornato)
def test_rimuovi_prodotto(self):
    carrello = Carrello()
    carrello.aggiungi_prodotto("libro", 15.0)
    carrello.aggiungi_prodotto("penna", 2.0)
    carrello.rimuovi_prodotto("libro")
    self.assertEqual(carrello.totale(), 2.0)
```

E così via, continuando il ciclo TDD per ogni nuova funzionalità.

## Best Practices nel TDD

1. **Scrivi test semplici**: Inizia con test semplici e poi aumenta la complessità
2. **Un test, un concetto**: Ogni test dovrebbe verificare un solo concetto
3. **Test indipendenti**: I test non dovrebbero dipendere l'uno dall'altro
4. **Nomi descrittivi**: Usa nomi di test che descrivono chiaramente cosa stanno testando
5. **Mantieni i test veloci**: I test lenti rallentano il ciclo di feedback
6. **Refactoring continuo**: Non saltare la fase di refactoring
7. **Copertura completa**: Mira a testare tutti i percorsi di codice

## TDD in Progetti Reali

In progetti reali, il TDD può essere applicato a diversi livelli:

- **Micro-TDD**: Test a livello di funzione o metodo
- **Meso-TDD**: Test a livello di classe o modulo
- **Macro-TDD**: Test a livello di sistema o integrazione

È comune combinare TDD con altre pratiche come il Behavior-Driven Development (BDD) e l'Acceptance Test-Driven Development (ATDD).

## Sfide del TDD

- **Curva di apprendimento**: Il TDD richiede un cambio di mentalità
- **Tempo iniziale**: Scrivere test prima può sembrare più lento all'inizio
- **Test di codice legacy**: Applicare TDD a codice esistente può essere difficile
- **Overengineering**: A volte si può finire per scrivere più codice del necessario

## Conclusione

Il Test-Driven Development è un potente approccio allo sviluppo software che può migliorare significativamente la qualità del codice e la fiducia nelle modifiche. Sebbene richieda un cambio di mentalità e un po' di pratica, i benefici a lungo termine in termini di manutenibilità e qualità del codice sono sostanziali.

Nel prossimo capitolo, esploreremo il mocking e il patching, tecniche essenziali per isolare il codice durante i test.

## Risorse Aggiuntive

- [Test-Driven Development with Python](https://www.obeythetestinggoat.com/)
- [Test Driven Development: By Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530) di Kent Beck

[Torna all'indice](../README.md) | [Capitolo precedente: Unit testing con unittest](02-unittest.md) | [Capitolo successivo: Mocking e patching](04-mocking.md)