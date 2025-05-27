# Eseguire Container in Diverse Modalità

## Obiettivo
Imparare le diverse modalità di esecuzione dei container Docker e quando utilizzare ciascuna di esse.

## Prerequisiti
- Docker installato e funzionante
- Conoscenza dei comandi Docker di base

## Esercizi Pratici

### Esercizio 1: Modalità Interattiva Base

Eseguiamo un container Ubuntu in modalità interattiva:

```bash
# Avvia Ubuntu in modalità interattiva
docker run -it ubuntu:20.04 bash

# Una volta dentro il container, prova questi comandi:
ls -la
pwd
whoami
cat /etc/os-release

# Per uscire dal container
exit
```

**Cosa succede**: Il container si avvia, ottieni una shell bash e puoi interagire direttamente.

### Esercizio 2: Modalità Detached (Background)

Eseguiamo un web server in background:

```bash
# Avvia nginx in background
docker run -d --name web-server nginx

# Verifica che sia in esecuzione
docker ps

# Controlla i logs
docker logs web-server

# Ferma il container
docker stop web-server

# Rimuovi il container
docker rm web-server
```

**Cosa succede**: Il container viene eseguito in background e ritorna immediatamente il controllo del terminale.

### Esercizio 3: Mapping delle Porte

Rendiamo accessibile il web server dall'host:

```bash
# Avvia nginx con port mapping
docker run -d --name web-accessible -p 8080:80 nginx

# Testa la connessione
curl http://localhost:8080

# O aprire nel browser: http://localhost:8080

# Pulizia
docker stop web-accessible
docker rm web-accessible
```

**Cosa succede**: Il container nginx è accessibile dalla porta 8080 del tuo host.

### Esercizio 4: Container con Comando Personalizzato

Eseguiamo container con comandi specifici:

```bash
# Esegui un comando singolo
docker run ubuntu:20.04 echo "Hello Docker!"

# Esegui uno script bash
docker run ubuntu:20.04 bash -c "echo 'Current date:'; date; echo 'Files in root:'; ls /"

# Container che mostra informazioni di sistema
docker run --rm ubuntu:20.04 bash -c "
echo 'Sistema operativo:'
cat /etc/os-release
echo
echo 'Memoria disponibile:'
free -h
echo
echo 'Processi in esecuzione:'
ps aux
"
```

**Cosa succede**: I container eseguono il comando specificato e poi terminano.

### Esercizio 5: Container con Variabili d'Ambiente

Configuriamo container usando variabili d'ambiente:

```bash
# MySQL con password root
docker run -d \
  --name mysql-server \
  -e MYSQL_ROOT_PASSWORD=secret123 \
  -e MYSQL_DATABASE=testdb \
  -e MYSQL_USER=testuser \
  -e MYSQL_PASSWORD=testpass \
  mysql:8.0

# Controlla che sia partito
docker logs mysql-server

# Connettiti al database
docker exec -it mysql-server mysql -uroot -psecret123 -e "SHOW DATABASES;"

# Pulizia
docker stop mysql-server
docker rm mysql-server
```

**Cosa succede**: MySQL viene configurato automaticamente usando le variabili d'ambiente.

### Esercizio 6: Container con Limitazioni di Risorse

Eseguiamo container con limiti di risorse:

```bash
# Container con limiti di memoria
docker run -d \
  --name limited-nginx \
  --memory=128m \
  --cpus="0.5" \
  nginx

# Verifica i limiti
docker stats limited-nginx --no-stream

# Container con stress test
docker run --rm \
  --memory=256m \
  progrium/stress \
  --cpu 2 --io 1 --vm 1 --vm-bytes 200M --timeout 10s

# Pulizia
docker stop limited-nginx
docker rm limited-nginx
```

**Cosa succede**: I container sono limitati nell'uso di CPU e memoria.

### Esercizio 7: Container con Auto-rimozione

Container che si puliscono automaticamente:

```bash
# Container temporaneo con --rm
docker run --rm -it ubuntu:20.04 bash -c "
echo 'Questo container si auto-rimuoverà'
echo 'Creando file temporaneo...'
echo 'Test content' > /tmp/testfile
cat /tmp/testfile
echo 'Container terminato, file perso!'
"

# Verifica che il container sia stato rimosso
docker ps -a --filter name=temp
```

**Cosa succede**: Il container viene automaticamente rimosso quando termina.

### Esercizio 8: Container con Health Check

Container con controllo dello stato:

```bash
# Container con health check personalizzato
docker run -d \
  --name web-with-health \
  --health-cmd="curl -f http://localhost/ || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  -p 8081:80 \
  nginx

# Controlla lo stato di salute
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Dettagli del health check
docker inspect web-with-health --format='{{json .State.Health}}' | jq

# Pulizia
docker stop web-with-health
docker rm web-with-health
```

**Cosa succede**: Docker monitora automaticamente la salute del container.

## Esercizio Avanzato: Combinazione di Modalità

Creiamo uno scenario complesso che combina diverse modalità:

```bash
# 1. Database in background con persistenza
docker run -d \
  --name app-database \
  --restart=unless-stopped \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=myapp \
  -v app-data:/var/lib/postgresql/data \
  --memory=512m \
  postgres:13-alpine

# 2. Web app che si connette al database
docker run -d \
  --name app-backend \
  --link app-database:db \
  -e DATABASE_URL=postgresql://postgres:secret@db:5432/myapp \
  -p 3000:3000 \
  --restart=unless-stopped \
  --memory=256m \
  node:16-alpine sh -c "
    apk add --no-cache postgresql-client &&
    echo 'Web app simulata in esecuzione...' &&
    while true; do
      echo '[$(date)] App running...'
      sleep 30
    done
  "

# 3. Load balancer/proxy
docker run -d \
  --name app-proxy \
  --link app-backend:backend \
  -p 80:80 \
  --restart=unless-stopped \
  nginx:alpine

# Monitora tutto
echo "=== Status dei container ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n=== Utilizzo risorse ==="
docker stats --no-stream

echo -e "\n=== Logs dell'applicazione ==="
docker logs --tail=5 app-backend

# Pulizia completa
read -p "Premi ENTER per pulire tutti i container..."
docker stop app-proxy app-backend app-database
docker rm app-proxy app-backend app-database
docker volume rm app-data
```

## Verifica Apprendimento

### Quiz Pratico

1. **Crea un container temporaneo** che:
   - Usa l'immagine Alpine Linux
   - Esegue in modalità interattiva
   - Si auto-rimuove alla fine
   - Ha un limite di memoria di 64MB

<details>
<summary>Soluzione</summary>

```bash
docker run --rm -it --memory=64m alpine sh
```
</details>

2. **Avvia un web server** che:
   - Usa nginx:alpine
   - È accessibile sulla porta 9000
   - Ha un nome personalizzato "my-web"
   - Si riavvia automaticamente
   - Ha un health check ogni 15 secondi

<details>
<summary>Soluzione</summary>

```bash
docker run -d \
  --name my-web \
  -p 9000:80 \
  --restart=always \
  --health-cmd="wget -q --spider http://localhost/ || exit 1" \
  --health-interval=15s \
  nginx:alpine
```
</details>

## Conclusioni

Hai imparato a:
- ✅ Eseguire container in modalità interattiva e detached
- ✅ Configurare port mapping e variabili d'ambiente
- ✅ Impostare limiti di risorse e politiche di restart
- ✅ Utilizzare health check per monitoraggio automatico
- ✅ Combinare diverse modalità per scenari complessi

**Prossimi passi**: Nel prossimo esempio imparerai come gestire il ciclo di vita dei container (start, stop, restart, remove).
