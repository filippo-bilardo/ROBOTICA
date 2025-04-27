# Progettazione dell'Architettura

La progettazione dell'architettura è una fase fondamentale nello sviluppo di un progetto software. In questa guida, imparerai come progettare un'architettura solida e scalabile per il tuo progetto Python finale.

## Obiettivi di apprendimento

- Comprendere i principi di progettazione dell'architettura software
- Imparare a creare diagrammi UML per rappresentare l'architettura
- Applicare pattern di progettazione appropriati
- Progettare un'architettura modulare e manutenibile

## Principi di progettazione dell'architettura

### Separazione delle responsabilità

Ogni componente del sistema dovrebbe avere una responsabilità ben definita e limitata. Questo principio è spesso indicato come "Single Responsibility Principle" (SRP).

**Esempio in Python:**
```python
# Approccio errato: una classe che fa troppe cose
class UserManager:
    def authenticate_user(self, username, password):
        # Logica di autenticazione
        pass
    
    def save_user_to_database(self, user):
        # Logica di persistenza
        pass
    
    def generate_user_report(self, user):
        # Logica di reporting
        pass

# Approccio corretto: classi separate con responsabilità specifiche
class Authenticator:
    def authenticate(self, username, password):
        # Logica di autenticazione
        pass

class UserRepository:
    def save(self, user):
        # Logica di persistenza
        pass

class ReportGenerator:
    def generate_report(self, user):
        # Logica di reporting
        pass
```

### Astrazione

L'astrazione consiste nel nascondere i dettagli implementativi e mostrare solo le funzionalità essenziali. Questo rende il codice più comprensibile e manutenibile.

**Esempio in Python:**
```python
# Interfaccia astratta
from abc import ABC, abstractmethod

class DataStorage(ABC):
    @abstractmethod
    def save(self, data):
        pass
    
    @abstractmethod
    def load(self, id):
        pass

# Implementazioni concrete
class DatabaseStorage(DataStorage):
    def save(self, data):
        # Implementazione specifica per database
        pass
    
    def load(self, id):
        # Implementazione specifica per database
        pass

class FileStorage(DataStorage):
    def save(self, data):
        # Implementazione specifica per file
        pass
    
    def load(self, id):
        # Implementazione specifica per file
        pass
```

### Modularità

La modularità consiste nel dividere il sistema in moduli indipendenti che possono essere sviluppati, testati e mantenuti separatamente.

**Esempio di struttura di progetto modulare:**
```
project/
├── main.py
├── config.py
├── auth/
│   ├── __init__.py
│   ├── authenticator.py
│   └── user.py
├── data/
│   ├── __init__.py
│   ├── repository.py
│   └── models.py
├── services/
│   ├── __init__.py
│   ├── user_service.py
│   └── report_service.py
└── ui/
    ├── __init__.py
    ├── views.py
    └── templates/
```

## Pattern architetturali

### Model-View-Controller (MVC)

Il pattern MVC separa l'applicazione in tre componenti principali:
- **Model**: gestisce i dati e la logica di business
- **View**: gestisce la presentazione dei dati all'utente
- **Controller**: gestisce l'interazione tra Model e View

**Esempio in Python (con Flask):**
```python
# Model
class User:
    def __init__(self, id, username, email):
        self.id = id
        self.username = username
        self.email = email
    
    @staticmethod
    def get_by_id(user_id):
        # Logica per recuperare un utente dal database
        pass

# Controller
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/user/<int:user_id>')
def show_user(user_id):
    user = User.get_by_id(user_id)
    return render_template('user.html', user=user)

# View (template HTML)
# user.html
# <h1>{{ user.username }}</h1>
# <p>Email: {{ user.email }}</p>
```

### Repository Pattern

Il Repository Pattern separa la logica di accesso ai dati dal resto dell'applicazione, fornendo un'interfaccia unificata per l'accesso ai dati.

**Esempio in Python:**
```python
from abc import ABC, abstractmethod

# Interfaccia del repository
class UserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id):
        pass
    
    @abstractmethod
    def save(self, user):
        pass

# Implementazione concreta per SQLite
class SQLiteUserRepository(UserRepository):
    def __init__(self, db_connection):
        self.db = db_connection
    
    def get_by_id(self, user_id):
        cursor = self.db.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user_data = cursor.fetchone()
        # Trasforma i dati in un oggetto User
        return User(*user_data) if user_data else None
    
    def save(self, user):
        cursor = self.db.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO users (id, username, email) VALUES (?, ?, ?)",
            (user.id, user.username, user.email)
        )
        self.db.commit()
```

## Diagrammi UML

I diagrammi UML (Unified Modeling Language) sono strumenti potenti per visualizzare e documentare l'architettura del software.

### Diagramma delle classi

Il diagramma delle classi mostra le classi del sistema, i loro attributi, metodi e relazioni.

**Esempio:**
```
+------------------+       +------------------+
|      User        |       |   UserService    |
+------------------+       +------------------+
| - id: int        |       | - repository    |
| - username: str  |<----->+------------------+
| - email: str     |       | + get_user()    |
+------------------+       | + create_user()  |
| + get_full_name()|       | + update_user()  |
+------------------+       +------------------+
         ^                          |
         |                          |
         |                          v
+------------------+       +------------------+
|   AdminUser      |       | UserRepository   |
+------------------+       +------------------+
| - admin_level    |       | + get_by_id()    |
+------------------+       | + save()         |
| + has_permission()|      +------------------+
+------------------+
```

### Diagramma di sequenza

Il diagramma di sequenza mostra come gli oggetti interagiscono nel tempo per completare un'operazione.

**Esempio:**
```
Client          Controller       UserService     UserRepository
  |                |                |                |
  | request        |                |                |
  |--------------->|                |                |
  |                | get_user(id)   |                |
  |                |--------------->|                |
  |                |                | get_by_id(id)  |
  |                |                |--------------->|
  |                |                |                |
  |                |                |     user       |
  |                |                |<---------------|
  |                |     user       |                |
  |                |<---------------|                |
  |    response    |                |                |
  |<---------------|                |                |
  |                |                |                |
```

## Architetture comuni in Python

### Applicazioni web

Per le applicazioni web in Python, framework come Django e Flask offrono architetture predefinite:

- **Django**: segue un pattern MTV (Model-Template-View), simile a MVC
- **Flask**: più flessibile, permette di implementare vari pattern architetturali

### Applicazioni desktop

Per le applicazioni desktop, librerie come PyQt e Tkinter supportano il pattern MVC:

- **Model**: classi che gestiscono i dati
- **View**: widget dell'interfaccia utente
- **Controller**: gestisce gli eventi e aggiorna Model e View

### Microservizi

L'architettura a microservizi divide l'applicazione in servizi indipendenti che comunicano tramite API:

```
+-------------+      +-------------+      +-------------+
| User Service |<---->| Auth Service |<---->| Email Service|
+-------------+      +-------------+      +-------------+
       ^                    ^                   ^
       |                    |                   |
       v                    v                   v
+-------------+      +-------------+      +-------------+
| User DB     |      | Auth DB     |      | Email Queue |
+-------------+      +-------------+      +-------------+
```

## Esercizio pratico

1. Scegli un'architettura appropriata per il tuo progetto finale
2. Crea un diagramma delle classi per il tuo progetto
3. Identifica i principali componenti e le loro responsabilità
4. Implementa uno scheletro del progetto seguendo l'architettura scelta
5. Crea un diagramma di sequenza per un'operazione principale del tuo sistema

## Risorse aggiuntive

- [Guida ai pattern di progettazione in Python](https://refactoring.guru/design-patterns/python)
- [Strumenti per creare diagrammi UML](https://www.lucidchart.com/pages/uml-diagram-tool)
- [Architetture software in Python](https://realpython.com/python-application-layouts/)

---

[Guida Precedente: Analisi dei requisiti](./02_analisi_requisiti.md) | [Guida Successiva: Implementazione del codice](./04_implementazione_codice.md) | [Torna all'indice principale](../README.md)