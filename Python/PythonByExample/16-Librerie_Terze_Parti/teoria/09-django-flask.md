# Django e Flask: Framework per lo Sviluppo Web in Python

## Introduzione ai Framework Web

I framework web sono strumenti che semplificano lo sviluppo di applicazioni web fornendo strutture, componenti e funzionalità predefinite. In Python, Django e Flask sono due dei framework web più popolari, ciascuno con il proprio approccio e filosofia di design.

## Django: Il Framework "Batteries Included"

Django è un framework web ad alto livello che incoraggia uno sviluppo rapido e un design pulito e pragmatico. È completo e include molti componenti necessari per costruire applicazioni web complesse.

### Caratteristiche principali di Django

- **Architettura MVT** (Model-View-Template)
- **ORM integrato** per interagire con il database
- **Admin panel** automatico
- **Sistema di autenticazione** completo
- **Sistema di routing URL** flessibile
- **Sistema di template** potente
- **Protezione integrata** contro vulnerabilità comuni
- **Internazionalizzazione** e localizzazione
- **Scalabilità** per applicazioni di grandi dimensioni

### Installazione di Django

```bash
pip install django
```

### Creazione di un progetto Django

```bash
django-admin startproject mioprogetto
cd mioprogetto
```

### Struttura di un progetto Django

```
mioprogetto/
    manage.py
    mioprogetto/
        __init__.py
        settings.py
        urls.py
        asgi.py
        wsgi.py
```

### Creazione di un'applicazione Django

```bash
python manage.py startapp miaapp
```

### Definizione di un modello

```python
# miaapp/models.py
from django.db import models

class Prodotto(models.Model):
    nome = models.CharField(max_length=100)
    descrizione = models.TextField()
    prezzo = models.DecimalField(max_digits=10, decimal_places=2)
    disponibile = models.BooleanField(default=True)
    data_creazione = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.nome
```

### Creazione delle migrazioni e applicazione al database

```bash
python manage.py makemigrations
python manage.py migrate
```

### Definizione di una vista

```python
# miaapp/views.py
from django.shortcuts import render, get_object_or_404
from .models import Prodotto

def lista_prodotti(request):
    prodotti = Prodotto.objects.all()
    return render(request, 'miaapp/lista_prodotti.html', {'prodotti': prodotti})

def dettaglio_prodotto(request, prodotto_id):
    prodotto = get_object_or_404(Prodotto, pk=prodotto_id)
    return render(request, 'miaapp/dettaglio_prodotto.html', {'prodotto': prodotto})
```

### Configurazione degli URL

```python
# miaapp/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('prodotti/', views.lista_prodotti, name='lista_prodotti'),
    path('prodotti/<int:prodotto_id>/', views.dettaglio_prodotto, name='dettaglio_prodotto'),
]

# mioprogetto/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('miaapp.urls')),
]
```

### Creazione di un template

```html
<!-- miaapp/templates/miaapp/lista_prodotti.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Lista Prodotti</title>
</head>
<body>
    <h1>Prodotti Disponibili</h1>
    <ul>
        {% for prodotto in prodotti %}
            <li>
                <a href="{% url 'dettaglio_prodotto' prodotto.id %}">
                    {{ prodotto.nome }} - €{{ prodotto.prezzo }}
                </a>
            </li>
        {% empty %}
            <li>Nessun prodotto disponibile.</li>
        {% endfor %}
    </ul>
</body>
</html>
```

### Avvio del server di sviluppo

```bash
python manage.py runserver
```

## Flask: Il Microframework

Flask è un microframework web leggero e flessibile che fornisce solo gli strumenti essenziali per lo sviluppo web, lasciando al programmatore la libertà di scegliere quali componenti aggiuntivi utilizzare.

### Caratteristiche principali di Flask

- **Leggero e minimalista**
- **Estensibile** con numerose estensioni
- **Sistema di routing URL** semplice
- **Motore di template Jinja2** integrato
- **Supporto per i test unitari**
- **RESTful request dispatching**
- **Supporto per cookie sicuri**
- **Compatibile con WSGI 1.0**

### Installazione di Flask

```bash
pip install flask
```

### Creazione di un'applicazione Flask minima

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return 'Benvenuto nella mia applicazione Flask!'

if __name__ == '__main__':
    app.run(debug=True)
```

### Routing e parametri URL

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return 'Pagina principale'

@app.route('/utente/<nome>')
def profilo_utente(nome):
    return f'Profilo di {nome}'

@app.route('/prodotto/<int:prodotto_id>')
def dettaglio_prodotto(prodotto_id):
    return f'Dettagli del prodotto {prodotto_id}'

if __name__ == '__main__':
    app.run(debug=True)
```

### Gestione dei metodi HTTP

```python
from flask import Flask, request

app = Flask(__name__)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # Logica di autenticazione
        return f'Login effettuato per {username}'
    else:
        return 'Pagina di login'

if __name__ == '__main__':
    app.run(debug=True)
```

### Rendering di template

```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/prodotti')
def lista_prodotti():
    prodotti = [
        {'id': 1, 'nome': 'Laptop', 'prezzo': 999.99},
        {'id': 2, 'nome': 'Smartphone', 'prezzo': 499.99},
        {'id': 3, 'nome': 'Tablet', 'prezzo': 299.99}
    ]
    return render_template('prodotti.html', prodotti=prodotti)

if __name__ == '__main__':
    app.run(debug=True)
```

```html
<!-- templates/prodotti.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Lista Prodotti</title>
</head>
<body>
    <h1>Prodotti Disponibili</h1>
    <ul>
        {% for prodotto in prodotti %}
            <li>{{ prodotto.nome }} - €{{ prodotto.prezzo }}</li>
        {% endfor %}
    </ul>
</body>
</html>
```

### Gestione delle sessioni

```python
from flask import Flask, session, redirect, url_for, request

app = Flask(__name__)
app.secret_key = 'chiave_segreta_molto_sicura'  # Necessaria per le sessioni

@app.route('/')
def home():
    if 'username' in session:
        return f'Utente loggato: {session["username"]}'
    return 'Non sei loggato. <a href="/login">Login</a>'

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['username'] = request.form['username']
        return redirect(url_for('home'))
    return '''
        <form method="post">
            <p><input type=text name=username>
            <p><input type=submit value=Login>
        </form>
    '''

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
```

### Estensioni popolari per Flask

- **Flask-SQLAlchemy**: Integrazione con SQLAlchemy per l'accesso al database
- **Flask-WTF**: Integrazione con WTForms per la gestione dei form
- **Flask-Login**: Gestione dell'autenticazione degli utenti
- **Flask-RESTful**: Supporto per la creazione di API RESTful
- **Flask-Migrate**: Supporto per le migrazioni del database

## Confronto tra Django e Flask

### Quando usare Django

- Per progetti di grandi dimensioni con molte funzionalità
- Quando hai bisogno di un admin panel integrato
- Quando preferisci seguire convenzioni predefinite
- Quando hai bisogno di un ORM potente integrato
- Per applicazioni che richiedono un alto livello di sicurezza

### Quando usare Flask

- Per progetti più piccoli o API
- Quando hai bisogno di maggiore flessibilità
- Quando vuoi scegliere personalmente i componenti
- Per prototipi rapidi
- Per microservizi

## Esempio completo: Applicazione di gestione attività

### Con Django

```python
# models.py
from django.db import models
from django.contrib.auth.models import User

class Attivita(models.Model):
    STATI = (
        ('da_fare', 'Da Fare'),
        ('in_corso', 'In Corso'),
        ('completata', 'Completata'),
    )
    
    titolo = models.CharField(max_length=200)
    descrizione = models.TextField(blank=True)
    stato = models.CharField(max_length=20, choices=STATI, default='da_fare')
    data_creazione = models.DateTimeField(auto_now_add=True)
    data_completamento = models.DateTimeField(null=True, blank=True)
    utente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attivita')
    
    def __str__(self):
        return self.titolo
    
    class Meta:
        ordering = ['stato', 'data_creazione']
```

### Con Flask

```python
from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'chiave_segreta_molto_sicura'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///attivita.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Utente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    attivita = db.relationship('Attivita', backref='utente', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Attivita(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titolo = db.Column(db.String(200), nullable=False)
    descrizione = db.Column(db.Text)
    stato = db.Column(db.String(20), default='da_fare')
    data_creazione = db.Column(db.DateTime, default=datetime.utcnow)
    data_completamento = db.Column(db.DateTime, nullable=True)
    utente_id = db.Column(db.Integer, db.ForeignKey('utente.id'), nullable=False)

@app.route('/')
def home():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    attivita = Attivita.query.filter_by(utente_id=session['user_id']).all()
    return render_template('home.html', attivita=attivita)

# Altre route per login, registrazione, CRUD attività, ecc.

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
```

## Risorse aggiuntive

### Django

- [Documentazione ufficiale di Django](https://docs.djangoproject.com/)
- [Django Girls Tutorial](https://tutorial.djangogirls.org/)
- [Django REST framework](https://www.django-rest-framework.org/) per API RESTful

### Flask

- [Documentazione ufficiale di Flask](https://flask.palletsprojects.com/)
- [The Flask Mega-Tutorial](https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world)
- [Flask-RESTful](https://flask-restful.readthedocs.io/) per API RESTful

## Navigazione

- [Torna all'indice delle librerie](../README.md)
- [Libreria precedente: SQLAlchemy](08-sqlalchemy.md)
- [Libreria successiva: PyTorch e TensorFlow](10-pytorch-tensorflow.md)