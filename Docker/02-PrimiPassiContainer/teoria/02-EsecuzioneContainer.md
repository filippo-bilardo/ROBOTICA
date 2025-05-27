# Esecuzione dei Container Docker

## Introduzione

L'esecuzione dei container è uno degli aspetti fondamentali di Docker. In questo capitolo esploreremo le diverse modalità di esecuzione, i parametri principali e le best practices per un utilizzo efficace.

## Modalità di Esecuzione

### Modalità Interattiva (-i)
La modalità interattiva mantiene aperto lo STDIN del container, permettendo l'interazione con processi che richiedono input.

```bash
docker run -i ubuntu
```

### Modalità Pseudo-TTY (-t)
Alloca un pseudo-terminale, utile per applicazioni che necessitano di un terminale.

```bash
docker run -t ubuntu
```

### Modalità Interattiva con TTY (-it)
Combinazione più comune per sessioni interattive:

```bash
docker run -it ubuntu bash
```

### Modalità Detached (-d)
Esegue il container in background:

```bash
docker run -d nginx
```

## Parametri di Esecuzione Principali

### Denominazione dei Container
```bash
# Assegna un nome specifico
docker run --name mio-container ubuntu

# Genera un nome automatico se non specificato
docker run ubuntu
```

### Mapping delle Porte
```bash
# Pubblica una porta specifica
docker run -p 8080:80 nginx

# Pubblica tutte le porte esposte
docker run -P nginx

# Binding su interfaccia specifica
docker run -p 127.0.0.1:8080:80 nginx
```

### Gestione dei Volumi
```bash
# Bind mount
docker run -v /host/path:/container/path ubuntu

# Volume named
docker run -v my-volume:/data ubuntu

# Volume temporaneo
docker run --tmpfs /tmp ubuntu
```

### Variabili d'Ambiente
```bash
# Singola variabile
docker run -e MYSQL_ROOT_PASSWORD=secret mysql

# File di ambiente
docker run --env-file .env mysql

# Ereditare dall'host
docker run -e USER mysql
```

## Gestione delle Risorse

### Limitazione CPU
```bash
# Limita a 1.5 CPU
docker run --cpus="1.5" ubuntu

# Limita percentuale CPU
docker run --cpu-shares=512 ubuntu
```

### Limitazione Memoria
```bash
# Limita a 512MB
docker run -m 512m ubuntu

# Con swap disabilitato
docker run -m 512m --oom-kill-disable ubuntu
```

### Limitazione I/O
```bash
# Limita velocità lettura
docker run --device-read-bps /dev/sda:1mb ubuntu

# Limita IOPS
docker run --device-read-iops /dev/sda:1000 ubuntu
```

## Politiche di Restart

### Always
Il container viene sempre riavviato:
```bash
docker run --restart=always nginx
```

### Unless-stopped
Riavvia sempre eccetto quando fermato manualmente:
```bash
docker run --restart=unless-stopped nginx
```

### On-failure
Riavvia solo in caso di errore:
```bash
docker run --restart=on-failure:3 nginx
```

## Sicurezza nell'Esecuzione

### User Namespace
```bash
# Esegui come utente specifico
docker run --user 1000:1000 ubuntu

# Esegui come utente non-root
docker run --user nobody ubuntu
```

### Capabilities
```bash
# Rimuovi capabilities
docker run --cap-drop=ALL ubuntu

# Aggiungi capabilities specifiche
docker run --cap-add=NET_ADMIN ubuntu
```

### Security Options
```bash
# Disabilita SELinux/AppArmor
docker run --security-opt label=disable ubuntu

# No new privileges
docker run --security-opt no-new-privileges ubuntu
```

## Best Practices

### 1. Utilizza sempre tag specifici
```bash
# ❌ Evita
docker run nginx

# ✅ Preferisci
docker run nginx:1.21-alpine
```

### 2. Esegui come utente non-root
```bash
# ✅ Più sicuro
docker run --user 1000:1000 nginx
```

### 3. Limita le risorse
```bash
# ✅ Previeni resource exhaustion
docker run -m 512m --cpus="0.5" nginx
```

### 4. Usa read-only quando possibile
```bash
# ✅ Maggiore sicurezza
docker run --read-only nginx
```

### 5. Specifica politiche di restart appropriate
```bash
# ✅ Per servizi di produzione
docker run --restart=unless-stopped nginx
```

## Troubleshooting Comune

### Container Esce Immediatamente
- Verifica che il comando specificato sia un processo long-running
- Controlla i log con `docker logs`

### Problemi di Permessi
- Verifica user mapping tra host e container
- Controlla ownership dei volumi montati

### Problemi di Rete
- Verifica che le porte non siano già in uso
- Controlla la configurazione firewall

### Problemi di Risorse
- Monitora utilizzo CPU/memoria con `docker stats`
- Verifica limiti di risorse impostati

## Esempi Pratici

### Web Server con Configurazione Custom
```bash
docker run -d \
  --name my-nginx \
  -p 8080:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  --restart=unless-stopped \
  --memory=256m \
  --cpus="0.5" \
  nginx:1.21-alpine
```

### Database con Persistenza
```bash
docker run -d \
  --name my-postgres \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=myapp \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  --restart=always \
  --memory=1g \
  postgres:13-alpine
```

### Applicazione con Health Check
```bash
docker run -d \
  --name my-app \
  --health-cmd="curl -f http://localhost:3000/health" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  -p 3000:3000 \
  my-app:latest
```

## Conclusioni

L'esecuzione efficace dei container richiede comprensione dei parametri disponibili e delle best practices. La scelta dei parametri giusti dipende dal caso d'uso specifico e dai requisiti di sicurezza e performance dell'applicazione.

Nel prossimo capitolo esploreremo la gestione del ciclo di vita dei container, incluso come fermare, riavviare e rimuovere container in modo sicuro.
