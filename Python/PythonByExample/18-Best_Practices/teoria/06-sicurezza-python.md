# Sicurezza in Python

In questa guida esploreremo le migliori pratiche di sicurezza per lo sviluppo in Python, un aspetto fondamentale per creare applicazioni robuste e protette da vulnerabilità.

## Importanza della sicurezza nel codice

La sicurezza del software è diventata una priorità critica per diverse ragioni:

- Protezione dei dati sensibili degli utenti
- Prevenzione di accessi non autorizzati ai sistemi
- Mantenimento dell'integrità delle applicazioni
- Conformità a normative e standard (GDPR, PCI DSS, ecc.)
- Protezione della reputazione aziendale

Come sviluppatori, abbiamo la responsabilità di implementare misure di sicurezza adeguate in ogni fase dello sviluppo.

## Vulnerabilità comuni e come prevenirle

### 1. Iniezione (SQL, Command, ecc.)

L'iniezione si verifica quando dati non fidati vengono inviati a un interprete come parte di un comando o query.

#### Iniezione SQL

```python
# Vulnerabile all'iniezione SQL
def get_user_unsafe(username):
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    return cursor.fetchone()

# Esempio di attacco: username = "admin' --"
# La query diventa: SELECT * FROM users WHERE username = 'admin' --'

# Sicuro contro l'iniezione SQL
def get_user_safe(username):
    query = "SELECT * FROM users WHERE username = %s"
    cursor.execute(query, (username,))
    return cursor.fetchone()
```

Utilizzando ORM come SQLAlchemy si ottiene ulteriore protezione:

```python
from sqlalchemy import select
from models import User

# Sicuro contro l'iniezione SQL con ORM
def get_user_with_orm(username):
    query = select(User).where(User.username == username)
    return session.execute(query).scalar_one_or_none()
```

#### Iniezione di comandi

```python
import subprocess

# Vulnerabile all'iniezione di comandi
def ping_unsafe(host):
    command = f"ping -c 1 {host}"
    return subprocess.call(command, shell=True)

# Esempio di attacco: host = "google.com; rm -rf /"

# Sicuro contro l'iniezione di comandi
def ping_safe(host):
    return subprocess.call(["ping", "-c", "1", host], shell=False)
```

### 2. Autenticazione e gestione delle sessioni

#### Memorizzazione sicura delle password

```python
import hashlib  # Non usare per le password in produzione!
import os
import bcrypt  # Raccomandato per l'hashing delle password

# NON FARE QUESTO - hashing non sicuro
def hash_password_unsafe(password):
    return hashlib.md5(password.encode()).hexdigest()

# Metodo sicuro con bcrypt
def hash_password_safe(password):
    # Genera un salt casuale
    salt = bcrypt.gensalt()
    # Crea l'hash della password con il salt
    hashed = bcrypt.hashpw(password.encode(), salt)
    return hashed

def verify_password(password, hashed):
    return bcrypt.checkpw(password.encode(), hashed)
```

Per applicazioni più complesse, considera l'uso di librerie come Passlib:

```python
from passlib.hash import argon2

def hash_password_argon2(password):
    return argon2.hash(password)

def verify_password_argon2(password, hash):
    return argon2.verify(password, hash)
```

#### Gestione sicura delle sessioni

```python
import secrets
from datetime import datetime, timedelta

def generate_session_token():
    return secrets.token_hex(32)  # 256 bit di entropia

class SessionManager:
    def __init__(self, expiry_minutes=30):
        self.sessions = {}
        self.expiry_minutes = expiry_minutes
    
    def create_session(self, user_id):
        token = generate_session_token()
        expiry = datetime.now() + timedelta(minutes=self.expiry_minutes)
        self.sessions[token] = {
            'user_id': user_id,
            'expiry': expiry,
            'created_at': datetime.now()
        }
        return token
    
    def validate_session(self, token):
        if token not in self.sessions:
            return None
        
        session = self.sessions[token]
        if datetime.now() > session['expiry']:
            del self.sessions[token]  # Rimuovi sessioni scadute
            return None
        
        return session['user_id']
    
    def invalidate_session(self, token):
        if token in self.sessions:
            del self.sessions[token]
```

### 3. Cross-Site Scripting (XSS)

XSS permette agli attaccanti di iniettare script client-side in pagine web visualizzate da altri utenti.

```python
from flask import Flask, request, render_template_string
import html

app = Flask(__name__)

# Vulnerabile a XSS
@app.route('/unsafe')
def unsafe():
    name = request.args.get('name', '')
    template = f"<h1>Hello, {name}!</h1>"
    return render_template_string(template)

# Esempio di attacco: ?name=<script>alert('XSS')</script>

# Sicuro contro XSS
@app.route('/safe')
def safe():
    name = request.args.get('name', '')
    escaped_name = html.escape(name)  # Escape dei caratteri speciali
    template = f"<h1>Hello, {escaped_name}!</h1>"
    return render_template_string(template)
```

Con framework come Flask o Django, usa sempre i loro sistemi di template che eseguono l'escape automaticamente:

```python
# In Flask con Jinja2 (sicuro per impostazione predefinita)
@app.route('/template_safe')
def template_safe():
    name = request.args.get('name', '')
    return render_template('greeting.html', name=name)

# In greeting.html:
# <h1>Hello, {{ name }}!</h1>  <!-- L'escape viene fatto automaticamente -->
```

### 4. Cross-Site Request Forgery (CSRF)

CSRF costringe un utente autenticato a eseguire azioni indesiderate.

```python
from flask import Flask, request, session
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
app.config['SECRET_KEY'] = 'chiave-segreta-difficile-da-indovinare'
csrf = CSRFProtect(app)

# Vulnerabile a CSRF
@app.route('/transfer_unsafe', methods=['POST'])
def transfer_unsafe():
    if 'user_id' not in session:
        return "Non autenticato", 401
    
    to_account = request.form.get('to')
    amount = request.form.get('amount')
    # Esegui il trasferimento...
    return f"Trasferiti {amount}€ a {to_account}"

# Protetto da CSRF con Flask-WTF
@app.route('/transfer_safe', methods=['POST'])
@csrf.protect
def transfer_safe():
    if 'user_id' not in session:
        return "Non autenticato", 401
    
    to_account = request.form.get('to')
    amount = request.form.get('amount')
    # Esegui il trasferimento...
    return f"Trasferiti {amount}€ a {to_account}"
```

### 5. Gestione sicura dei file

```python
import os
from werkzeug.utils import secure_filename

# Vulnerabile a path traversal
def read_file_unsafe(filename):
    with open(f"./files/{filename}", 'r') as f:
        return f.read()

# Esempio di attacco: filename = "../config/secret_key.txt"

# Sicuro contro path traversal
def read_file_safe(filename):
    # Sanitizza il nome del file
    safe_filename = secure_filename(filename)
    # Verifica che il percorso finale sia all'interno della directory consentita
    file_path = os.path.join("./files", safe_filename)
    real_path = os.path.realpath(file_path)
    base_dir = os.path.realpath("./files")
    if not real_path.startswith(base_dir):
        raise ValueError("Tentativo di accesso non autorizzato")
    
    with open(real_path, 'r') as f:
        return f.read()
```

### 6. Deserializzazione non sicura

```python
import pickle
import json

# Vulnerabile a deserializzazione non sicura
def load_data_unsafe(serialized_data):
    return pickle.loads(serialized_data)  # Può eseguire codice arbitrario!

# Sicuro - usa JSON invece di pickle per dati non fidati
def load_data_safe(serialized_data):
    return json.loads(serialized_data)
```

## Gestione sicura delle API

### Autenticazione API

```python
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = 'chiave-segreta-molto-sicura'

def generate_token(user_id):
    payload = {
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iat': datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token mancante'}), 401
        
        try:
            # Rimuovi 'Bearer ' se presente
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['sub']
        except:
            return jsonify({'message': 'Token non valido'}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

@app.route('/api/protected')
@token_required
def protected(current_user_id):
    return jsonify({'message': f'Ciao utente {current_user_id}!'})
```

### Rate Limiting

```python
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/public')
def public_api():
    return jsonify({'message': 'Questa è un\'API pubblica'})

@app.route('/api/limited')
@limiter.limit("10 per minute")
def limited_api():
    return jsonify({'message': 'Questa API ha un limite di 10 richieste al minuto'})
```

## Protezione dei dati sensibili

### Crittografia dei dati

```python
from cryptography.fernet import Fernet

# Generazione della chiave
def generate_key():
    return Fernet.generate_key()

# Salvataggio sicuro della chiave
def save_key(key, filename):
    with open(filename, 'wb') as key_file:
        key_file.write(key)

# Caricamento della chiave
def load_key(filename):
    with open(filename, 'rb') as key_file:
        return key_file.read()

# Crittografia dei dati
def encrypt_data(data, key):
    f = Fernet(key)
    return f.encrypt(data.encode())

# Decrittografia dei dati
def decrypt_data(encrypted_data, key):
    f = Fernet(key)
    return f.decrypt(encrypted_data).decode()

# Esempio di utilizzo
key = generate_key()
save_key(key, 'secret.key')

sensitive_data = "Informazioni molto riservate"
encrypted = encrypt_data(sensitive_data, key)
print(f"Dati crittografati: {encrypted}")

decrypted = decrypt_data(encrypted, key)
print(f"Dati decrittografati: {decrypted}")
```

### Variabili d'ambiente per le configurazioni sensibili

```python
import os
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env
load_dotenv()

# Accedi alle variabili d'ambiente in modo sicuro
database_url = os.environ.get('DATABASE_URL')
api_key = os.environ.get('API_KEY')
secret_key = os.environ.get('SECRET_KEY')

# Verifica che le variabili necessarie siano definite
if not database_url:
    raise ValueError("DATABASE_URL non definita nelle variabili d'ambiente")
```

Esempio di file `.env` (da non committare nel repository):

```
DATABASE_URL=postgresql://user:password@localhost/dbname
API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here
```

## Sicurezza delle dipendenze

### Gestione delle vulnerabilità nelle dipendenze

```bash
# Installa safety per verificare le vulnerabilità nelle dipendenze
pip install safety

# Esegui il controllo di sicurezza
safety check
```

Utilizzo di `pip-audit` per un'analisi più approfondita:

```bash
pip install pip-audit
pip-audit
```

### Fissare le versioni delle dipendenze

```
# requirements.txt con versioni fissate
Django==4.2.7
requests==2.31.0
cryptography==41.0.5
```

## Logging e monitoraggio di sicurezza

```python
import logging
from logging.handlers import RotatingFileHandler
import time

# Configurazione del logger
def setup_logger():
    logger = logging.getLogger('security_logger')
    logger.setLevel(logging.INFO)
    
    # Crea un handler per file con rotazione
    handler = RotatingFileHandler('security.log', maxBytes=10485760, backupCount=10)
    
    # Definisci il formato del log
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    
    logger.addHandler(handler)
    return logger

logger = setup_logger()

# Funzione per registrare tentativi di accesso
def log_login_attempt(username, success, ip_address):
    if success:
        logger.info(f"Login riuscito: utente={username}, ip={ip_address}")
    else:
        logger.warning(f"Tentativo di login fallito: utente={username}, ip={ip_address}")

# Funzione per registrare azioni sensibili
def log_sensitive_action(user_id, action, details):
    logger.info(f"Azione sensibile: utente={user_id}, azione={action}, dettagli={details}")

# Funzione per registrare potenziali attacchi
def log_security_event(event_type, details, severity='WARNING'):
    if severity == 'WARNING':
        logger.warning(f"Evento di sicurezza: tipo={event_type}, dettagli={details}")
    elif severity == 'CRITICAL':
        logger.critical(f"Evento di sicurezza critico: tipo={event_type}, dettagli={details}")
```

## Sicurezza nei framework web

### Django

Django include molte protezioni di sicurezza integrate:

```python
# settings.py

# Protezione CSRF abilitata per impostazione predefinita
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # Protezione CSRF
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # Protezione clickjacking
]

# Impostazioni di sicurezza consigliate
SECURE_HSTS_SECONDS = 31536000  # 1 anno
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True  # Solo HTTPS
CSRF_COOKIE_SECURE = True  # Solo HTTPS
X_FRAME_OPTIONS = 'DENY'  # Previene il clickjacking
```

### Flask

Flask richiede configurazioni di sicurezza esplicite:

```python
from flask import Flask
from flask_talisman import Talisman  # Per le intestazioni di sicurezza HTTP

app = Flask(__name__)

# Configura una chiave segreta forte
app.config['SECRET_KEY'] = 'chiave-segreta-generata-in-modo-sicuro'

# Abilita Talisman per le intestazioni di sicurezza
talisman = Talisman(
    app,
    content_security_policy={
        'default-src': '\'self\'',
        'script-src': '\'self\'',
        'style-src': '\'self\'',
    },
    force_https=True,  # Reindirizza HTTP a HTTPS
    strict_transport_security=True,
    session_cookie_secure=True,
    session_cookie_http_only=True
)

# Imposta la durata della sessione
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 ora in secondi
```

## Sicurezza nell'implementazione di API REST

```python
from flask import Flask, request, jsonify
from functools import wraps
import jwt

app = Flask(__name__)
app.config['SECRET_KEY'] = 'chiave-segreta-api'

# Middleware per verificare il token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token mancante'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        except:
            return jsonify({'message': 'Token non valido'}), 401
        
        return f(*args, **kwargs)
    return decorated

# Endpoint di login che genera un token
@app.route('/api/login', methods=['POST'])
def login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return jsonify({'message': 'Credenziali mancanti'}), 401
    
    # Verifica le credenziali (in un'app reale, controlla nel database)
    if auth.username == 'admin' and auth.password == 'password':
        token = jwt.encode(
            {'user': auth.username},
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        return jsonify({'token': token})
    
    return jsonify({'message': 'Credenziali non valide'}), 401

# API protetta
@app.route('/api/protected', methods=['GET'])
@token_required
def protected():
    return jsonify({'message': 'Questa è un\'API protetta'})
```

## Conclusione

La sicurezza del software è un processo continuo, non un obiettivo finale. Implementare le migliori pratiche di sicurezza fin dall'inizio del ciclo di sviluppo è fondamentale per proteggere i dati e mantenere la fiducia degli utenti.

Ricorda questi principi chiave:

1. **Principio del privilegio minimo**: concedi solo i permessi necessari
2. **Difesa in profondità**: implementa più livelli di sicurezza
3. **Fail secure**: in caso di errore, il sistema dovrebbe fallire in modo sicuro
4. **Non fidarti mai degli input**: valida sempre tutti gli input utente
5. **Mantieni aggiornate le dipendenze**: aggiorna regolarmente le librerie per correggere vulnerabilità

La sicurezza non è solo una questione tecnica, ma una mentalità che deve permeare l'intero processo di sviluppo.

## Risorse aggiuntive

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Python Security Best Practices](https://snyk.io/blog/python-security-best-practices-cheat-sheet/)
- [Documentazione di sicurezza di Django](https://docs.djangoproject.com/en/stable/topics/security/)
- [Flask Security Considerations](https://flask.palletsprojects.com/en/2.0.x/security/)

## Esercizi

1. Analizza un'applicazione Python esistente per identificare potenziali vulnerabilità di sicurezza.
2. Implementa un sistema di autenticazione sicuro con hashing delle password e protezione contro attacchi di forza bruta.
3. Crea un'API REST con autenticazione JWT e rate limiting.
4. Configura un sistema di logging di sicurezza per un'applicazione web.
5. Implementa la crittografia per proteggere dati sensibili in un'applicazione.

---

[Torna all'indice](../README.md) | [Prossima guida: Distribuzione e packaging](07-distribuzione-packaging.md)