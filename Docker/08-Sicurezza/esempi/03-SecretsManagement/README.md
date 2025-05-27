# Gestione Sicura dei Secrets in Docker

## Introduzione

La gestione dei secrets (password, chiavi API, certificati, token) è uno degli aspetti più critici nella sicurezza dei container. In questo esempio pratico, esploreremo diverse strategie per gestire informazioni sensibili in modo sicuro in ambienti Docker.

## Obiettivi

- Comprendere i rischi della gestione insicura dei secrets
- Implementare Docker Secrets in Docker Swarm
- Utilizzare variabili d'ambiente sicure
- Configurare external secret management
- Implementare rotazione automatica dei secrets

## ❌ Pratiche da Evitare

### 1. Secrets hardcoded nel codice

```javascript
// ❌ MAI FARE COSÌ
const dbConfig = {
    host: 'localhost',
    user: 'admin',
    password: 'password123',  // Hardcoded!
    database: 'myapp'
};

const apiKey = 'sk-1234567890abcdef';  // Hardcoded!
```

### 2. Secrets nelle variabili d'ambiente del Dockerfile

```dockerfile
# ❌ MAI FARE COSÌ
FROM node:18-alpine
ENV DATABASE_PASSWORD=supersecret123
ENV API_KEY=sk-1234567890abcdef
COPY . .
CMD ["npm", "start"]
```

### 3. Secrets nei file di configurazione versionati

```yaml
# ❌ config.yml nel repository
database:
  host: localhost
  username: admin
  password: supersecret123  # Nel repository!
api:
  key: sk-1234567890abcdef   # Nel repository!
```

## ✅ Soluzioni Sicure

### 1. Docker Secrets (Docker Swarm)

Docker Secrets è il sistema nativo di Docker per gestire informazioni sensibili in modo sicuro.

#### Creazione e utilizzo di Secrets

```bash
# Creare un secret da stringa
echo "mysecretpassword" | docker secret create db_password -

# Creare un secret da file
echo "sk-1234567890abcdef" > api_key.txt
docker secret create api_key api_key.txt
rm api_key.txt  # Rimuovere il file dopo la creazione

# Listar secrets
docker secret ls

# Ispezionare un secret (senza mostrare il valore)
docker secret inspect db_password
```

#### Utilizzo nei servizi Swarm

```yaml
# docker-compose.swarm.yml
version: '3.8'

services:
  web:
    image: myapp:latest
    secrets:
      - db_password
      - api_key
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - API_KEY_FILE=/run/secrets/api_key
    deploy:
      replicas: 2

secrets:
  db_password:
    external: true
  api_key:
    external: true
```

#### Applicazione che legge secrets

```javascript
// app.js - Lettura sicura dei secrets
const fs = require('fs');
const path = require('path');

function readSecret(secretName) {
    try {
        const secretPath = `/run/secrets/${secretName}`;
        return fs.readFileSync(secretPath, 'utf8').trim();
    } catch (error) {
        console.error(`Errore lettura secret ${secretName}:`, error.message);
        process.exit(1);
    }
}

// Configurazione sicura
const config = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'app',
        password: readSecret('db_password'),
        database: process.env.DB_NAME || 'myapp'
    },
    api: {
        key: readSecret('api_key')
    }
};

console.log('Configurazione caricata (secrets nascosti)');
```

### 2. Variabili d'Ambiente Sicure (Docker Compose)

Per ambienti non-Swarm, utilizziamo file `.env` esterni:

```bash
# .env (NON versionare questo file!)
DB_PASSWORD=mysecretpassword
API_KEY=sk-1234567890abcdef
JWT_SECRET=myjwtsecret123
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    image: myapp:latest
    environment:
      - DB_HOST=db
      - DB_USER=app
      - DB_PASSWORD=${DB_PASSWORD}
      - API_KEY=${API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

### 3. Init Containers per Secret Management

```yaml
# docker-compose.init.yml
version: '3.8'

services:
  secret-fetcher:
    image: vault:latest
    command: |
      sh -c "
        vault auth -method=aws
        vault kv get -field=password secret/myapp/db > /shared/db_password
        vault kv get -field=key secret/myapp/api > /shared/api_key
      "
    volumes:
      - shared_secrets:/shared
    environment:
      - VAULT_ADDR=https://vault.example.com

  web:
    image: myapp:latest
    depends_on:
      - secret-fetcher
    volumes:
      - shared_secrets:/secrets:ro
    environment:
      - DB_PASSWORD_FILE=/secrets/db_password
      - API_KEY_FILE=/secrets/api_key

volumes:
  shared_secrets:
    driver_opts:
      type: tmpfs
      device: tmpfs
```

## Esempio Completo: E-commerce con Secrets

### Struttura del Progetto

```
ecommerce-secure/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── services/
│   ├── api/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── app.js
│   │       ├── config.js
│   │       └── routes/
│   ├── frontend/
│   │   ├── Dockerfile
│   │   └── src/
│   └── payment/
│       ├── Dockerfile
│       └── src/
└── scripts/
    ├── setup-secrets.sh
    └── rotate-secrets.sh
```

### 1. Servizio API con gestione sicura

```javascript
// services/api/src/config.js
const fs = require('fs');

class Config {
    constructor() {
        this.loadConfig();
    }

    readSecretFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8').trim();
        } catch (error) {
            throw new Error(`Impossibile leggere secret da ${filePath}: ${error.message}`);
        }
    }

    readSecretFromEnv(envVar, filePath) {
        // Prova prima a leggere da file (preferito per Docker Secrets)
        if (filePath && fs.existsSync(filePath)) {
            return this.readSecretFile(filePath);
        }
        
        // Fallback a variabile d'ambiente
        const value = process.env[envVar];
        if (!value) {
            throw new Error(`Secret ${envVar} non trovato né come file né come variabile d'ambiente`);
        }
        
        return value;
    }

    loadConfig() {
        this.database = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5432,
            name: process.env.DB_NAME || 'ecommerce',
            user: process.env.DB_USER || 'api',
            password: this.readSecretFromEnv('DB_PASSWORD', process.env.DB_PASSWORD_FILE)
        };

        this.jwt = {
            secret: this.readSecretFromEnv('JWT_SECRET', process.env.JWT_SECRET_FILE),
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        };

        this.payment = {
            stripeKey: this.readSecretFromEnv('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY_FILE),
            webhookSecret: this.readSecretFromEnv('STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET_FILE)
        };

        this.email = {
            apiKey: this.readSecretFromEnv('SENDGRID_API_KEY', process.env.SENDGRID_API_KEY_FILE)
        };

        // Log configurazione (senza secrets)
        console.log('Configurazione caricata:', {
            database: { ...this.database, password: '[HIDDEN]' },
            jwt: { ...this.jwt, secret: '[HIDDEN]' },
            payment: { stripeKey: '[HIDDEN]', webhookSecret: '[HIDDEN]' },
            email: { apiKey: '[HIDDEN]' }
        });
    }
}

module.exports = new Config();
```

### 2. Docker Compose per sviluppo

```yaml
# docker-compose.yml (sviluppo)
version: '3.8'

services:
  api:
    build: ./services/api
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - DB_USER=api
      - DB_NAME=ecommerce
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./services/frontend
    ports:
      - "8080:80"
    depends_on:
      - api

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ecommerce
      - POSTGRES_USER=api
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3. Docker Compose per produzione (Swarm)

```yaml
# docker-compose.prod.yml (produzione con Swarm)
version: '3.8'

services:
  api:
    image: ecommerce/api:latest
    secrets:
      - db_password
      - jwt_secret
      - stripe_secret_key
      - stripe_webhook_secret
      - sendgrid_api_key
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_USER=api
      - DB_NAME=ecommerce
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - STRIPE_SECRET_KEY_FILE=/run/secrets/stripe_secret_key
      - STRIPE_WEBHOOK_SECRET_FILE=/run/secrets/stripe_webhook_secret
      - SENDGRID_API_KEY_FILE=/run/secrets/sendgrid_api_key
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure

  postgres:
    image: postgres:15-alpine
    secrets:
      - db_password
    environment:
      - POSTGRES_DB=ecommerce
      - POSTGRES_USER=api
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      placement:
        constraints:
          - node.role == manager

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
  stripe_secret_key:
    external: true
  stripe_webhook_secret:
    external: true
  sendgrid_api_key:
    external: true

volumes:
  postgres_data:
```

### 4. Script di setup per produzione

```bash
#!/bin/bash
# scripts/setup-secrets.sh

set -e

echo "🔐 Setup secrets per produzione..."

# Verifica che Swarm sia inizializzato
if ! docker info | grep -q "Swarm: active"; then
    echo "❌ Docker Swarm non è attivo. Inizializzare con: docker swarm init"
    exit 1
fi

# Funzione per creare secret sicuro
create_secret() {
    local name=$1
    local prompt=$2
    
    if docker secret ls | grep -q "$name"; then
        echo "✅ Secret '$name' già esiste"
        return
    fi
    
    echo -n "$prompt: "
    read -s value
    echo
    
    if [ -z "$value" ]; then
        echo "❌ Valore vuoto per $name"
        exit 1
    fi
    
    echo "$value" | docker secret create "$name" -
    echo "✅ Secret '$name' creato"
}

# Creazione dei secrets
create_secret "db_password" "Password database"
create_secret "jwt_secret" "JWT secret key"
create_secret "stripe_secret_key" "Stripe secret key"
create_secret "stripe_webhook_secret" "Stripe webhook secret"
create_secret "sendgrid_api_key" "SendGrid API key"

echo ""
echo "🎉 Tutti i secrets sono stati creati!"
echo ""
echo "Per deployare l'applicazione:"
echo "docker stack deploy -c docker-compose.prod.yml ecommerce"
```

### 5. Script di rotazione secrets

```bash
#!/bin/bash
# scripts/rotate-secrets.sh

set -e

SERVICE_NAME="ecommerce_api"
SECRET_NAME=$1

if [ -z "$SECRET_NAME" ]; then
    echo "Uso: $0 <nome-secret>"
    echo "Secrets disponibili: db_password, jwt_secret, stripe_secret_key, stripe_webhook_secret, sendgrid_api_key"
    exit 1
fi

echo "🔄 Rotazione secret: $SECRET_NAME"

# Creare nuovo secret con suffisso temporale
NEW_SECRET_NAME="${SECRET_NAME}_$(date +%Y%m%d_%H%M%S)"

echo -n "Inserire nuovo valore per $SECRET_NAME: "
read -s new_value
echo

echo "$new_value" | docker secret create "$NEW_SECRET_NAME" -
echo "✅ Nuovo secret '$NEW_SECRET_NAME' creato"

# Aggiornare il servizio per usare il nuovo secret
echo "🔄 Aggiornamento servizio..."
docker service update \
    --secret-rm "$SECRET_NAME" \
    --secret-add "source=$NEW_SECRET_NAME,target=$SECRET_NAME" \
    "$SERVICE_NAME"

echo "⏳ Attendere completamento rolling update..."
docker service logs -f "$SERVICE_NAME" &
LOG_PID=$!

# Attendere che tutti i task siano aggiornati
while true; do
    RUNNING=$(docker service ps "$SERVICE_NAME" --filter "desired-state=running" --format "{{.CurrentState}}" | grep -c "Running" || echo "0")
    TOTAL=$(docker service inspect "$SERVICE_NAME" --format "{{.Spec.Mode.Replicated.Replicas}}")
    
    if [ "$RUNNING" -eq "$TOTAL" ]; then
        break
    fi
    
    sleep 5
done

kill $LOG_PID 2>/dev/null || true

echo "✅ Rolling update completato"

# Rimuovere il vecchio secret
echo "🗑️  Rimozione vecchio secret..."
docker secret rm "$SECRET_NAME"

# Rinominare il nuovo secret
echo "📝 Rinomina nuovo secret..."
echo "$new_value" | docker secret create "${SECRET_NAME}_temp" -
docker service update \
    --secret-rm "$NEW_SECRET_NAME" \
    --secret-add "source=${SECRET_NAME}_temp,target=$SECRET_NAME" \
    "$SERVICE_NAME"

docker secret rm "$NEW_SECRET_NAME"
docker secret rm "${SECRET_NAME}_temp"
echo "$new_value" | docker secret create "$SECRET_NAME" -

echo "🎉 Rotazione completata per $SECRET_NAME"
```

## Integrazione con External Secret Managers

### 1. HashiCorp Vault

```yaml
# docker-compose.vault.yml
version: '3.8'

services:
  vault:
    image: vault:latest
    cap_add:
      - IPC_LOCK
    environment:
      - VAULT_DEV_ROOT_TOKEN_ID=myroot
      - VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200
    ports:
      - "8200:8200"

  vault-init:
    image: vault:latest
    depends_on:
      - vault
    environment:
      - VAULT_ADDR=http://vault:8200
      - VAULT_TOKEN=myroot
    command: |
      sh -c "
        sleep 5
        vault kv put secret/ecommerce/db password=mysecretpass
        vault kv put secret/ecommerce/jwt secret=myjwtsecret
        vault kv put secret/ecommerce/stripe key=sk_test_123
      "

  secret-provider:
    image: vault:latest
    depends_on:
      - vault-init
    environment:
      - VAULT_ADDR=http://vault:8200
      - VAULT_TOKEN=myroot
    volumes:
      - secrets:/secrets
    command: |
      sh -c "
        while true; do
          vault kv get -field=password secret/ecommerce/db > /secrets/db_password
          vault kv get -field=secret secret/ecommerce/jwt > /secrets/jwt_secret
          vault kv get -field=key secret/ecommerce/stripe > /secrets/stripe_key
          sleep 300  # Aggiorna ogni 5 minuti
        done
      "

  api:
    image: ecommerce/api:latest
    depends_on:
      - secret-provider
    volumes:
      - secrets:/secrets:ro
    environment:
      - DB_PASSWORD_FILE=/secrets/db_password
      - JWT_SECRET_FILE=/secrets/jwt_secret
      - STRIPE_SECRET_KEY_FILE=/secrets/stripe_key

volumes:
  secrets:
    driver_opts:
      type: tmpfs
      device: tmpfs
```

## Best Practice per la Sicurezza

### 1. Principio del Privilegio Minimo

```yaml
# Separare secrets per servizio
secrets:
  api_db_password:
    external: true
  payment_stripe_key:
    external: true
  email_sendgrid_key:
    external: true

services:
  api:
    secrets:
      - api_db_password  # Solo quello che serve
  
  payment:
    secrets:
      - payment_stripe_key  # Solo quello che serve
      
  email:
    secrets:
      - email_sendgrid_key  # Solo quello che serve
```

### 2. Validazione e Sanitizzazione

```javascript
// Validazione dei secrets al caricamento
function validateSecret(name, value) {
    if (!value || value.length < 8) {
        throw new Error(`Secret ${name} troppo corto (minimo 8 caratteri)`);
    }
    
    if (name.includes('password') && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        console.warn(`⚠️  Password ${name} non rispetta i criteri di complessità`);
    }
    
    return value;
}

const config = {
    database: {
        password: validateSecret('db_password', readSecret('db_password'))
    }
};
```

### 3. Monitoring e Auditing

```javascript
// Logging sicuro (senza esporre secrets)
function secureLog(message, data = {}) {
    const sanitized = Object.keys(data).reduce((acc, key) => {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('secret') || 
            key.toLowerCase().includes('key')) {
            acc[key] = '[REDACTED]';
        } else {
            acc[key] = data[key];
        }
        return acc;
    }, {});
    
    console.log(message, sanitized);
}

// Uso
secureLog('Configurazione database:', {
    host: 'localhost',
    user: 'api',
    password: 'supersecret',  // Sarà nascosta
    database: 'myapp'
});
```

## Esercizi Pratici

### Esercizio 1: Migrazione da ENV a Secrets

1. Prendere un'applicazione che usa variabili d'ambiente per secrets
2. Migrare a Docker Secrets
3. Testare che l'applicazione funzioni correttamente
4. Verificare che i secrets non siano visibili nei log

### Esercizio 2: Rotazione Automatica

1. Implementare un sistema di rotazione automatica per un secret
2. Testare che l'applicazione continui a funzionare durante la rotazione
3. Verificare che il vecchio secret non sia più accessibile

### Esercizio 3: Integrazione con Vault

1. Configurare HashiCorp Vault locale
2. Integrare un'applicazione per leggere secrets da Vault
3. Implementare il rinnovo automatico dei token

## Conclusioni

La gestione sicura dei secrets richiede:

1. **Mai hardcodare** secrets nel codice o nelle immagini
2. **Usare Docker Secrets** in produzione con Swarm
3. **Implementare rotazione** regolare dei secrets
4. **Principio del privilegio minimo** per l'accesso ai secrets
5. **Monitoring e auditing** degli accessi ai secrets
6. **Backup sicuro** e recovery plan per i secrets

## Risorse Aggiuntive

- [Docker Secrets Documentation](https://docs.docker.com/engine/swarm/secrets/)
- [HashiCorp Vault](https://www.vaultproject.io/)
- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_cryptographic_key)

## Navigazione

- [⬅️ Esempio precedente: Container Sicuri](../02-ContainerSecure/README.md)
- [➡️ Prossimo esempio: Isolamento e Privilegi](../04-IsolamentoPrivilegi/README.md)
- [🏠 Torna al modulo Sicurezza](../README.md)
