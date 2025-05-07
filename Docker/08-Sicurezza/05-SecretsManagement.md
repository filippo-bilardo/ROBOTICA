# Gestione dei Segreti in Docker

La gestione sicura dei segreti (password, chiavi API, certificati, ecc.) è un aspetto critico della sicurezza dei container. Questo capitolo esplora le migliori pratiche e gli strumenti disponibili per gestire i segreti in ambienti Docker.

## Problematiche nella Gestione dei Segreti

La gestione dei segreti nei container presenta diverse sfide:

1. **Immagini immutabili**: I container sono progettati per essere immutabili, ma i segreti potrebbero dover cambiare.
2. **Distribuzione delle immagini**: I segreti non dovrebbero essere inclusi nelle immagini che vengono distribuite.
3. **Accesso limitato**: Solo i container autorizzati dovrebbero accedere ai segreti specifici.
4. **Ciclo di vita**: I segreti potrebbero avere un ciclo di vita diverso da quello dei container.

## Pratiche da Evitare

### 1. Hardcoding nei Dockerfile

```dockerfile
# MAI fare questo
FROM alpine:3.14
ENV API_KEY="super_secret_key"
```

### 2. Commit in Repository di Codice

Non includere mai file di configurazione con segreti nei repository Git o in altri sistemi di controllo versione.

### 3. Variabili d'Ambiente non Protette

Le variabili d'ambiente possono essere esposte attraverso comandi come `docker inspect` o nei log di sistema.

## Soluzioni per la Gestione dei Segreti

### 1. Docker Secrets

Docker Swarm include una funzionalità nativa per la gestione dei segreti:

```bash
# Creare un secret
echo "my_secret_password" | docker secret create db_password -

# Utilizzare il secret in un servizio
docker service create \
  --name db \
  --secret db_password \
  --env DB_PASSWORD_FILE=/run/secrets/db_password \
  mysql
```

I segreti in Docker Swarm:
- Sono crittografati a riposo
- Sono trasmessi in modo sicuro ai nodi
- Sono montati come file temporanei in `/run/secrets/`
- Sono disponibili solo ai servizi autorizzati

### 2. File di Ambiente

Utilizzare file `.env` esterni per le variabili d'ambiente sensibili:

```bash
# Creare un file .env
echo "DB_PASSWORD=secret" > .env

# Utilizzare il file .env
docker run --env-file .env mysql
```

Questa soluzione è semplice ma richiede una gestione sicura dei file `.env`.

### 3. Vault di Segreti

Utilizzare sistemi specializzati per la gestione dei segreti:

#### HashiCorp Vault

```bash
# Esempio di utilizzo di Vault con Docker
docker run -d --name vault \
  -p 8200:8200 \
  --cap-add=IPC_LOCK \
  -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' \
  -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' \
  vault:latest
```

Integrazione con un'applicazione:

```bash
# Recuperare un segreto da Vault
TOKEN=$(vault write -field=token auth/approle/login role_id=$ROLE_ID secret_id=$SECRET_ID)
SECRET=$(curl -H "X-Vault-Token: $TOKEN" -X GET https://vault:8200/v1/secret/data/myapp/config | jq -r '.data.data.api_key')
```

#### AWS Secrets Manager o Azure Key Vault

Per ambienti cloud, utilizzare i servizi di gestione dei segreti nativi:

```bash
# Esempio con AWS CLI
secret=$(aws secretsmanager get-secret-value --secret-id myapp/api-key --query SecretString --output text)
docker run -e API_KEY="$secret" myapp
```

### 4. Kubernetes Secrets

Se si utilizza Kubernetes per orchestrare i container Docker:

```yaml
# Definire un secret in Kubernetes
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  api-key: bXlzZWNyZXRrZXk=  # Base64 encoded
```

```yaml
# Utilizzare il secret in un pod
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp
    env:
    - name: API_KEY
      valueFrom:
        secretKeyRef:
          name: app-secrets
          key: api-key
```

## Implementazione di una Soluzione Completa

Ecco un esempio di implementazione completa per la gestione dei segreti in un ambiente Docker Swarm:

### 1. Creazione dei Segreti

```bash
# Creare i segreti necessari
echo "db_password" | docker secret create db_password -
echo "api_key" | docker secret create api_key -
echo "jwt_secret" | docker secret create jwt_secret -
```

### 2. Definizione dello Stack

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:13
    secrets:
      - source: db_password
        target: db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - db_data:/var/lib/postgresql/data

  api:
    image: myapp/api:latest
    secrets:
      - source: db_password
        target: db_password
      - source: api_key
        target: api_key
      - source: jwt_secret
        target: jwt_secret
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
      API_KEY_FILE: /run/secrets/api_key
      JWT_SECRET_FILE: /run/secrets/jwt_secret
    depends_on:
      - db

volumes:
  db_data:

secrets:
  db_password:
    external: true
  api_key:
    external: true
  jwt_secret:
    external: true
```

### 3. Lettura dei Segreti nell'Applicazione

```javascript
// Esempio in Node.js
const fs = require('fs');

// Funzione per leggere un segreto da un file
function readSecret(secretPath) {
  return fs.readFileSync(secretPath, 'utf8').trim();
}

// Lettura dei segreti
const dbPassword = readSecret('/run/secrets/db_password');
const apiKey = readSecret('/run/secrets/api_key');
const jwtSecret = readSecret('/run/secrets/jwt_secret');

// Utilizzo dei segreti
const db = connectToDatabase('postgres', 'postgres', dbPassword);
```

## Best Practice per la Gestione dei Segreti

1. **Rotazione regolare**: Implementare un processo per la rotazione periodica dei segreti.
2. **Principio del privilegio minimo**: Concedere l'accesso solo ai segreti necessari per ciascun container.
3. **Monitoraggio e audit**: Tenere traccia dell'accesso e dell'utilizzo dei segreti.
4. **Crittografia**: Assicurarsi che i segreti siano sempre crittografati a riposo e in transito.
5. **Integrazione CI/CD**: Automatizzare la gestione dei segreti nel pipeline CI/CD.
6. **Evitare la persistenza**: Non memorizzare i segreti in volumi persistenti.

## Conclusione

La gestione sicura dei segreti è fondamentale per mantenere la sicurezza delle applicazioni containerizzate. Utilizzando gli strumenti e le pratiche appropriate, è possibile proteggere efficacemente le informazioni sensibili senza compromettere la flessibilità e la portabilità offerte da Docker.

---

## Navigazione

- [Indice del Modulo](./README.md)
- Precedente: [Isolamento e Privilegi](./04-IsolamentoPrivilegi.md)