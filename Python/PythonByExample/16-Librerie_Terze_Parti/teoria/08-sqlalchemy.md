# SQLAlchemy: Lavorare con Database SQL in Python

## Introduzione a SQLAlchemy

SQLAlchemy è una libreria Python che fornisce un set completo di strumenti per lavorare con database relazionali. È una delle ORM (Object Relational Mapper) più popolari per Python, che permette di interagire con database SQL utilizzando oggetti Python invece di scrivere direttamente query SQL.

## Caratteristiche principali

- **ORM completo**: Mappatura tra classi Python e tabelle del database
- **SQL Expression Language**: Costruzione di query SQL in modo programmatico
- **Engine di connessione**: Gestione efficiente delle connessioni al database
- **Supporto per molti database**: SQLite, PostgreSQL, MySQL, Oracle, MS-SQL e altri
- **Migrazioni del database**: Attraverso l'estensione Alembic

## Installazione

```bash
pip install sqlalchemy
```

Per database specifici, potrebbe essere necessario installare driver aggiuntivi:

```bash
# Per PostgreSQL
pip install psycopg2-binary

# Per MySQL
pip install mysqlclient
```

## Concetti fondamentali

### Engine

L'Engine è il punto di ingresso per SQLAlchemy. Gestisce la connessione al database e fornisce un'interfaccia per eseguire query.

```python
from sqlalchemy import create_engine

# Connessione a SQLite (database in memoria)
engine = create_engine('sqlite:///:memory:')

# Connessione a PostgreSQL
# engine = create_engine('postgresql://username:password@localhost:5432/mydatabase')

# Connessione a MySQL
# engine = create_engine('mysql://username:password@localhost/mydatabase')
```

### Dichiarazione delle tabelle

Con SQLAlchemy, puoi definire le tabelle del database come classi Python.

```python
from sqlalchemy import Column, Integer, String, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Utente(Base):
    __tablename__ = 'utenti'
    
    id = Column(Integer, primary_key=True)
    nome = Column(String)
    cognome = Column(String)
    email = Column(String, unique=True)
    
    articoli = relationship("Articolo", back_populates="autore")
    
    def __repr__(self):
        return f"<Utente(nome='{self.nome}', cognome='{self.cognome}', email='{self.email}')>"

class Articolo(Base):
    __tablename__ = 'articoli'
    
    id = Column(Integer, primary_key=True)
    titolo = Column(String)
    contenuto = Column(String)
    autore_id = Column(Integer, ForeignKey('utenti.id'))
    
    autore = relationship("Utente", back_populates="articoli")
    
    def __repr__(self):
        return f"<Articolo(titolo='{self.titolo}')>"
```

### Creazione del database

```python
# Crea tutte le tabelle definite
Base.metadata.create_all(engine)
```

### Sessioni

Le sessioni sono utilizzate per gestire le operazioni sul database.

```python
from sqlalchemy.orm import sessionmaker

# Crea una classe Session
Session = sessionmaker(bind=engine)

# Crea un'istanza di sessione
session = Session()
```

## Operazioni CRUD

### Create (Inserimento)

```python
# Crea un nuovo utente
nuovo_utente = Utente(nome="Mario", cognome="Rossi", email="mario.rossi@example.com")

# Aggiungi l'utente alla sessione
session.add(nuovo_utente)

# Commit della transazione
session.commit()
```

### Read (Lettura)

```python
# Seleziona tutti gli utenti
utenti = session.query(Utente).all()
for utente in utenti:
    print(utente)

# Seleziona un utente specifico per ID
utente = session.query(Utente).filter(Utente.id == 1).first()
print(utente)

# Filtraggio con condizioni
utenti_mario = session.query(Utente).filter(Utente.nome == "Mario").all()
for utente in utenti_mario:
    print(utente)
```

### Update (Aggiornamento)

```python
# Trova l'utente da aggiornare
utente = session.query(Utente).filter(Utente.id == 1).first()

# Modifica i dati
utente.email = "nuova.email@example.com"

# Commit delle modifiche
session.commit()
```

### Delete (Eliminazione)

```python
# Trova l'utente da eliminare
utente = session.query(Utente).filter(Utente.id == 1).first()

# Rimuovi l'utente
session.delete(utente)

# Commit delle modifiche
session.commit()
```

## Query avanzate

### Join

```python
# Join tra utenti e articoli
risultati = session.query(Utente, Articolo).join(Articolo).all()
for utente, articolo in risultati:
    print(f"L'utente {utente.nome} ha scritto l'articolo '{articolo.titolo}'")
```

### Aggregazioni

```python
from sqlalchemy import func

# Conta il numero di articoli per utente
risultati = session.query(Utente.nome, func.count(Articolo.id)).join(Articolo).group_by(Utente.nome).all()
for nome, conteggio in risultati:
    print(f"{nome} ha scritto {conteggio} articoli")
```

## Esempio completo

Ecco un esempio completo che mostra come utilizzare SQLAlchemy per gestire un semplice database di blog:

```python
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
import datetime

# Crea l'engine
engine = create_engine('sqlite:///:memory:')

# Crea la base per le classi dichiarative
Base = declarative_base()

# Definisci le classi del modello
class Utente(Base):
    __tablename__ = 'utenti'
    
    id = Column(Integer, primary_key=True)
    nome = Column(String)
    cognome = Column(String)
    email = Column(String, unique=True)
    
    articoli = relationship("Articolo", back_populates="autore")
    
    def __repr__(self):
        return f"<Utente(nome='{self.nome}', cognome='{self.cognome}')>"

class Articolo(Base):
    __tablename__ = 'articoli'
    
    id = Column(Integer, primary_key=True)
    titolo = Column(String)
    contenuto = Column(String)
    data_pubblicazione = Column(DateTime, default=datetime.datetime.utcnow)
    autore_id = Column(Integer, ForeignKey('utenti.id'))
    
    autore = relationship("Utente", back_populates="articoli")
    
    def __repr__(self):
        return f"<Articolo(titolo='{self.titolo}')>"

# Crea le tabelle nel database
Base.metadata.create_all(engine)

# Crea una sessione
Session = sessionmaker(bind=engine)
session = Session()

# Inserisci dati di esempio
utente1 = Utente(nome="Mario", cognome="Rossi", email="mario.rossi@example.com")
utente2 = Utente(nome="Laura", cognome="Bianchi", email="laura.bianchi@example.com")

articolo1 = Articolo(titolo="Introduzione a Python", contenuto="Python è un linguaggio di programmazione versatile...", autore=utente1)
articolo2 = Articolo(titolo="SQLAlchemy Tutorial", contenuto="SQLAlchemy è una potente libreria ORM...", autore=utente1)
articolo3 = Articolo(titolo="Web Development con Flask", contenuto="Flask è un micro-framework per lo sviluppo web...", autore=utente2)

session.add_all([utente1, utente2, articolo1, articolo2, articolo3])
session.commit()

# Esegui alcune query
print("\nTutti gli utenti:")
utenti = session.query(Utente).all()
for utente in utenti:
    print(utente)

print("\nTutti gli articoli:")
articoli = session.query(Articolo).all()
for articolo in articoli:
    print(f"{articolo.titolo} - scritto da {articolo.autore.nome} {articolo.autore.cognome}")

print("\nArticoli di Mario Rossi:")
articoli_mario = session.query(Articolo).join(Utente).filter(Utente.nome == "Mario").all()
for articolo in articoli_mario:
    print(articolo.titolo)

# Chiudi la sessione
session.close()
```

## Vantaggi di SQLAlchemy

- **Astrazione del database**: Puoi cambiare il database sottostante con modifiche minime al codice
- **Sicurezza**: Protezione automatica contro SQL injection
- **Manutenibilità**: Codice più pulito e orientato agli oggetti
- **Produttività**: Riduce il codice boilerplate per operazioni comuni

## Risorse aggiuntive

- [Documentazione ufficiale di SQLAlchemy](https://docs.sqlalchemy.org/)
- [Tutorial SQLAlchemy](https://docs.sqlalchemy.org/en/14/orm/tutorial.html)
- [SQLAlchemy ORM Examples](https://github.com/sqlalchemy/sqlalchemy/tree/master/examples)

## Navigazione

- [Torna all'indice delle librerie](../README.md)
- [Libreria precedente: Beautiful Soup](07-beautifulsoup.md)
- [Libreria successiva: Django e Flask](09-django-flask.md)