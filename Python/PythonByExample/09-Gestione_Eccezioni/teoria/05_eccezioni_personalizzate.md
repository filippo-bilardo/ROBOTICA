# Eccezioni Personalizzate: Creare Tipi di Errore Specifici

Finora abbiamo visto come utilizzare le eccezioni predefinite di Python. Tuttavia, in molte situazioni, è utile creare eccezioni personalizzate per rappresentare errori specifici della tua applicazione. In questa lezione, esploreremo come definire e utilizzare eccezioni personalizzate.

## Perché Creare Eccezioni Personalizzate?

Le eccezioni personalizzate offrono diversi vantaggi:

1. **Specificità**: Permettono di identificare con precisione il tipo di errore che si è verificato
2. **Chiarezza**: Rendono il codice più leggibile e auto-documentante
3. **Organizzazione**: Consentono di creare una gerarchia di errori specifica per la tua applicazione
4. **Gestione mirata**: Permettono di catturare e gestire solo gli errori specifici che ti interessano

## Creare una Classe di Eccezione Personalizzata

In Python, le eccezioni sono classi che ereditano da `Exception` o da una delle sue sottoclassi. Per creare un'eccezione personalizzata, basta definire una nuova classe che eredita da `Exception`.

### Sintassi Base

```python
class MiaEccezionePersonalizzata(Exception):
    """Eccezione sollevata per errori specifici della mia applicazione."""
    pass
```

Questo è l'esempio più semplice di eccezione personalizzata. La classe eredita tutti i comportamenti da `Exception` e non aggiunge funzionalità aggiuntive.

### Esempio Completo

```python
class ValoreNegativoError(Exception):
    """Eccezione sollevata quando viene fornito un valore negativo
    dove è richiesto un valore positivo."""
    
    def __init__(self, valore, messaggio="Il valore non può essere negativo"):
        self.valore = valore
        self.messaggio = messaggio
        # Chiamiamo il costruttore della classe base
        super().__init__(f"{messaggio}: {valore}")

# Utilizzo dell'eccezione personalizzata
def calcola_radice_quadrata(numero):
    if numero < 0:
        raise ValoreNegativoError(numero, "Impossibile calcolare la radice quadrata di un numero negativo")
    return numero ** 0.5

try:
    risultato = calcola_radice_quadrata(-5)
except ValoreNegativoError as e:
    print(f"Errore: {e}")
    print(f"Valore problematico: {e.valore}")
```

In questo esempio:
1. Definiamo una classe `ValoreNegativoError` che eredita da `Exception`
2. Personalizziamo il costruttore per accettare il valore problematico e un messaggio
3. Memorizziamo questi valori come attributi dell'oggetto eccezione
4. Chiamiamo il costruttore della classe base con un messaggio formattato
5. Utilizziamo l'eccezione nella funzione `calcola_radice_quadrata`
6. Nel blocco `except`, accediamo agli attributi personalizzati dell'eccezione

## Creare una Gerarchia di Eccezioni

Per applicazioni complesse, può essere utile creare una gerarchia di eccezioni personalizzate. Questo permette di catturare eccezioni a diversi livelli di specificità.

```python
# Eccezione base per la nostra applicazione
class AppError(Exception):
    """Classe base per tutte le eccezioni dell'applicazione."""
    pass

# Eccezioni specifiche per diversi moduli o componenti
class DatabaseError(AppError):
    """Eccezione base per errori relativi al database."""
    pass

class ValidationError(AppError):
    """Eccezione base per errori di validazione."""
    pass

# Eccezioni ancora più specifiche
class ConnectionError(DatabaseError):
    """Errore di connessione al database."""
    def __init__(self, host, porta, messaggio=None):
        self.host = host
        self.porta = porta
        super().__init__(messaggio or f"Impossibile connettersi al database su {host}:{porta}")

class InvalidInputError(ValidationError):
    """Input non valido."""
    def __init__(self, campo, valore, messaggio=None):
        self.campo = campo
        self.valore = valore
        super().__init__(messaggio or f"Valore non valido per il campo {campo}: {valore}")
```

Con questa gerarchia, puoi catturare eccezioni a diversi livelli di specificità:

```python
try:
    # Codice che potrebbe generare diverse eccezioni
    if not valida_input(dati):
        raise InvalidInputError("nome", dati["nome"])
    if not connetti_database():
        raise ConnectionError("localhost", 5432)
except InvalidInputError as e:
    print(f"Errore di validazione: {e}")
    print(f"Campo problematico: {e.campo}")
except DatabaseError as e:
    print(f"Errore di database: {e}")
except AppError as e:
    print(f"Errore generico dell'applicazione: {e}")
```

## Best Practices per le Eccezioni Personalizzate

1. **Nomi Significativi**: Dai alle tue eccezioni nomi che descrivono chiaramente il tipo di errore, solitamente terminando con "Error" o "Exception"
2. **Documentazione**: Includi una docstring che descrive quando l'eccezione viene sollevata
3. **Informazioni Utili**: Memorizza informazioni utili come attributi dell'eccezione
4. **Gerarchia Appropriata**: Eredita dalla classe di eccezione più appropriata (non sempre direttamente da `Exception`)
5. **Messaggi Chiari**: Fornisci messaggi di errore chiari e informativi

## Esempio Pratico: Sistema di Gestione Utenti

```python
# Definizione delle eccezioni personalizzate
class UserError(Exception):
    """Classe base per errori relativi agli utenti."""
    pass

class UserNotFoundError(UserError):
    """Utente non trovato nel sistema."""
    def __init__(self, user_id):
        self.user_id = user_id
        super().__init__(f"Utente con ID {user_id} non trovato")

class InvalidUsernameError(UserError):
    """Username non valido."""
    def __init__(self, username, reason):
        self.username = username
        self.reason = reason
        super().__init__(f"Username non valido '{username}': {reason}")

class PasswordTooWeakError(UserError):
    """Password troppo debole."""
    def __init__(self, reasons):
        self.reasons = reasons
        message = "Password troppo debole: " + ", ".join(reasons)
        super().__init__(message)

# Funzioni che utilizzano le eccezioni personalizzate
def get_user(user_id):
    # Simuliamo un database di utenti
    users = {1: {"username": "mario", "email": "mario@example.com"}}
    
    if user_id not in users:
        raise UserNotFoundError(user_id)
    
    return users[user_id]

def validate_username(username):
    if len(username) < 3:
        raise InvalidUsernameError(username, "troppo corto (minimo 3 caratteri)")
    
    if not username.isalnum():
        raise InvalidUsernameError(username, "deve contenere solo lettere e numeri")
    
    return True

def validate_password(password):
    reasons = []
    
    if len(password) < 8:
        reasons.append("troppo corta (minimo 8 caratteri)")
    
    if not any(c.isupper() for c in password):
        reasons.append("deve contenere almeno una lettera maiuscola")
    
    if not any(c.isdigit() for c in password):
        reasons.append("deve contenere almeno un numero")
    
    if reasons:
        raise PasswordTooWeakError(reasons)
    
    return True

# Utilizzo delle funzioni con gestione delle eccezioni
def registra_utente(user_id, username, password):
    try:
        validate_username(username)
        validate_password(password)
        # Qui ci sarebbe il codice per salvare l'utente nel database
        print(f"Utente {username} registrato con successo!")
        return True
    except InvalidUsernameError as e:
        print(f"Errore nell'username: {e}")
        print(f"Username fornito: {e.username}")
        print(f"Motivo: {e.reason}")
    except PasswordTooWeakError as e:
        print(f"Errore nella password: {e}")
        print("Problemi riscontrati:")
        for i, reason in enumerate(e.reasons, 1):
            print(f"  {i}. {reason}")
    except UserError as e:
        print(f"Errore generico utente: {e}")
    
    return False

# Test delle funzioni
print("Test 1: Username troppo corto")
registra_utente(1, "ab", "Password123")
print("\nTest 2: Password troppo debole")
registra_utente(2, "mario", "password")
print("\nTest 3: Registrazione valida")
registra_utente(3, "luigi", "Password123")
```

Questo esempio mostra un sistema di gestione utenti che utilizza eccezioni personalizzate per gestire diversi tipi di errori in modo specifico e informativo.

## Conclusione

Le eccezioni personalizzate sono uno strumento potente per migliorare la gestione degli errori nelle tue applicazioni. Ti permettono di creare un sistema di gestione degli errori più specifico, informativo e organizzato, rendendo il tuo codice più robusto e più facile da mantenere.

Con questa lezione, concludiamo il nostro percorso sulla gestione delle eccezioni in Python. Hai imparato a catturare eccezioni con `try-except`, a utilizzare le clausole `else` e `finally`, a sollevare eccezioni con `raise`, a verificare condizioni con `assert` e infine a creare eccezioni personalizzate. Questi strumenti ti permetteranno di scrivere codice più robusto e di gestire gli errori in modo elegante ed efficace.

---

[Indice](../README.md) | [Lezione Precedente: Raise e Assert](04_raise_assert.md)