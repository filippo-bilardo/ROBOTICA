# Incapsulamento in Python

L'incapsulamento è uno dei quattro principi fondamentali della programmazione orientata agli oggetti, insieme all'astrazione, all'ereditarietà e al polimorfismo. Questo concetto si riferisce alla pratica di nascondere i dettagli implementativi di una classe e di esporre solo ciò che è necessario per l'utilizzo esterno.

## Cos'è l'Incapsulamento

L'incapsulamento consiste nel:

1. **Raggruppare dati e metodi correlati** all'interno di una singola unità (la classe)
2. **Limitare l'accesso diretto** ai dati di un oggetto dall'esterno
3. **Esporre un'interfaccia controllata** per interagire con l'oggetto

L'obiettivo principale dell'incapsulamento è proteggere i dati da modifiche accidentali e garantire che lo stato interno di un oggetto rimanga coerente.

## Livelli di Accesso in Python

A differenza di altri linguaggi come Java o C++, Python non ha modificatori di accesso espliciti (come `private`, `protected`, `public`). Tuttavia, segue una convenzione basata sulla nomenclatura per indicare il livello di accesso desiderato:

1. **Pubblico**: Attributi e metodi senza prefisso speciale sono considerati pubblici e accessibili da qualsiasi parte del codice.
2. **Protetto**: Attributi e metodi con un singolo underscore (`_`) sono considerati protetti. Dovrebbero essere accessibili solo all'interno della classe e delle sue sottoclassi.
3. **Privato**: Attributi e metodi con doppio underscore (`__`) sono considerati privati. Python applica il name mangling per rendere difficile l'accesso diretto dall'esterno.

## Esempio di Incapsulamento

```python
class ContoCorrente:
    def __init__(self, titolare, saldo_iniziale):
        self.titolare = titolare          # Attributo pubblico
        self._saldo = saldo_iniziale      # Attributo protetto
        self.__pin = "1234"               # Attributo privato
    
    def deposita(self, importo):
        if importo > 0:
            self._saldo += importo
            return True
        return False
    
    def preleva(self, importo, pin):
        if pin == self.__pin and importo > 0 and importo <= self._saldo:
            self._saldo -= importo
            return True
        return False
    
    def get_saldo(self):
        return self._saldo
    
    def __operazione_interna(self):
        # Metodo privato, utilizzato solo internamente
        print("Questa è un'operazione interna")

# Creazione di un conto
conto = ContoCorrente("Mario Rossi", 1000)

# Accesso a attributo pubblico
print(conto.titolare)  # Output: Mario Rossi

# Accesso a attributo protetto (possibile, ma sconsigliato)
print(conto._saldo)    # Output: 1000

# Tentativo di accesso a attributo privato
try:
    print(conto.__pin)  # Genera un AttributeError
except AttributeError as e:
    print(f"Errore: {e}")  # Output: Errore: 'ContoCorrente' object has no attribute '__pin'

# Utilizzo dei metodi pubblici per interagire con l'oggetto
conto.deposita(500)
print(conto.get_saldo())  # Output: 1500

conto.preleva(200, "1234")
print(conto.get_saldo())  # Output: 1300

# Il name mangling rende possibile accedere agli attributi privati, ma è fortemente sconsigliato
print(conto._ContoCorrente__pin)  # Output: 1234 (ma questa pratica viola l'incapsulamento)
```

## Proprietà in Python

Python offre un meccanismo elegante per implementare l'incapsulamento attraverso le proprietà. Le proprietà permettono di definire metodi speciali che vengono chiamati quando si accede, si modifica o si elimina un attributo:

```python
class Temperatura:
    def __init__(self):
        self._celsius = 0
    
    @property
    def celsius(self):
        return self._celsius
    
    @celsius.setter
    def celsius(self, valore):
        if valore < -273.15:
            raise ValueError("La temperatura non può essere inferiore allo zero assoluto")
        self._celsius = valore
    
    @property
    def fahrenheit(self):
        return (self._celsius * 9/5) + 32
    
    @fahrenheit.setter
    def fahrenheit(self, valore):
        self.celsius = (valore - 32) * 5/9

# Utilizzo delle proprietà
temp = Temperatura()

# Utilizzo del setter
temp.celsius = 25
print(temp.celsius)     # Output: 25
print(temp.fahrenheit)  # Output: 77.0

# Utilizzo del setter con validazione
try:
    temp.celsius = -300  # Genera un ValueError
except ValueError as e:
    print(f"Errore: {e}")  # Output: Errore: La temperatura non può essere inferiore allo zero assoluto

# Utilizzo del setter per fahrenheit
temp.fahrenheit = 68
print(temp.celsius)     # Output: 20.0
```

## Vantaggi dell'Incapsulamento

1. **Controllo dell'accesso**: Limita l'accesso diretto ai dati, prevenendo modifiche accidentali.
2. **Validazione dei dati**: Permette di validare i dati prima di modificare lo stato interno.
3. **Flessibilità implementativa**: Consente di modificare l'implementazione interna senza influenzare il codice che utilizza la classe.
4. **Astrazione**: Nasconde i dettagli complessi, esponendo solo un'interfaccia semplice e coerente.
5. **Manutenibilità**: Rende il codice più facile da mantenere e aggiornare.

## Incapsulamento vs. Information Hiding

Spesso i termini "incapsulamento" e "information hiding" (nascondere le informazioni) vengono usati in modo intercambiabile, ma hanno sfumature diverse:

- **Incapsulamento**: Si riferisce al raggruppamento di dati e metodi correlati in un'unica unità.
- **Information Hiding**: Si riferisce specificamente alla pratica di nascondere i dettagli implementativi.

In Python, entrambi i concetti sono implementati attraverso le convenzioni di nomenclatura e le proprietà.

## Best Practices per l'Incapsulamento in Python

1. **Usa attributi privati** (`__nome`) per dati che non dovrebbero mai essere accessibili dall'esterno.
2. **Usa attributi protetti** (`_nome`) per dati che potrebbero essere accessibili nelle sottoclassi.
3. **Fornisci metodi getter e setter** o proprietà per controllare l'accesso agli attributi.
4. **Documenta chiaramente** quali parti della tua API sono pubbliche e quali sono considerate dettagli implementativi.
5. **Rispetta le convenzioni** quando utilizzi codice di altri: non accedere direttamente ad attributi protetti o privati.

## Conclusione

L'incapsulamento è un principio fondamentale della programmazione orientata agli oggetti che aiuta a creare codice più robusto, manutenibile e flessibile. In Python, sebbene l'incapsulamento sia basato principalmente su convenzioni piuttosto che su restrizioni rigide, è comunque possibile implementare un incapsulamento efficace utilizzando le convenzioni di nomenclatura e le proprietà.

Nella prossima lezione, esploreremo l'ereditarietà, un altro principio fondamentale della programmazione orientata agli oggetti che permette di creare gerarchie di classi e riutilizzare il codice in modo efficiente.