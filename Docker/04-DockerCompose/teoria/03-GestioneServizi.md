# Gestione dei Servizi con Docker Compose

In questa sezione esploreremo come gestire i servizi con Docker Compose, dalla creazione all'esecuzione, fino al monitoraggio e alla manutenzione.

## Comandi Base di Docker Compose

Docker Compose offre una serie di comandi per gestire il ciclo di vita dei servizi. Ecco i più importanti:

### Avviare i Servizi

```bash
# Avvia tutti i servizi definiti nel file docker-compose.yml
docker-compose up

# Avvia i servizi in modalità detached (background)
docker-compose up -d

# Avvia solo servizi specifici
docker-compose up -d web db

# Avvia con un file compose specifico
docker-compose -f docker-compose.prod.yml up -d
```

### Fermare i Servizi

```bash
# Ferma i servizi mantenendo i container
docker-compose stop

# Ferma e rimuove i container, le reti e i volumi anonimi
docker-compose down

# Ferma e rimuove anche i volumi nominati
docker-compose down -v
```

### Visualizzare lo Stato dei Servizi

```bash
# Mostra lo stato dei servizi
docker-compose ps

# Mostra i log di tutti i servizi
docker-compose logs

# Mostra i log di servizi specifici e segue l'output
docker-compose logs -f web
```

### Eseguire Comandi nei Container

```bash
# Esegue un comando in un container in esecuzione
docker-compose exec web bash

# Esegue un comando in un nuovo container
docker-compose run --rm web npm test
```

## Gestione del Ciclo di Vita

### Ricostruzione dei Servizi

Quando si modificano i Dockerfile o le configurazioni di build, è necessario ricostruire le immagini:

```bash
# Ricostruisce le immagini e avvia i servizi
docker-compose up --build

# Solo ricostruzione delle immagini
docker-compose build
```

### Aggiornamento dei Servizi

Per aggiornare un servizio in esecuzione:

```bash
# Aggiorna un servizio specifico
docker-compose up -d --no-deps --build web
```

L'opzione `--no-deps` evita di riavviare i servizi dipendenti.

### Scalabilità dei Servizi

Docker Compose permette di scalare orizzontalmente i servizi:

```bash
# Avvia 3 istanze del servizio worker
docker-compose up -d --scale worker=3
```

Nota: per scalare correttamente, i servizi non devono avere porte fisse mappate o devono utilizzare un load balancer.

## Monitoraggio e Debugging

### Ispezionare i Container

```bash
# Visualizza i processi in esecuzione nei container
docker-compose top

# Visualizza l'utilizzo delle risorse
docker stats $(docker-compose ps -q)
```

### Debugging

```bash
# Visualizza eventi in tempo reale
docker-compose events

# Visualizza la configurazione effettiva
docker-compose config
```

## Gestione delle Dipendenze

### Ordine di Avvio

Docker Compose avvia i servizi nell'ordine specificato dalle dipendenze (`depends_on`), ma non attende che i servizi siano "pronti" prima di avviare i servizi dipendenti.

Per gestire correttamente le dipendenze, si possono utilizzare:

1. **Script di attesa**: script che verificano la disponibilità dei servizi dipendenti
2. **Healthcheck**: configurazioni che verificano lo stato di salute dei container

Esempio di script di attesa:

```bash
#!/bin/sh
# wait-for-postgres.sh

set -e

host="$1"
shift
cmd="$@"

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "$POSTGRES_USER" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd
```

Utilizzo nel docker-compose.yml:

```yaml
services:
  web:
    build: ./web
    command: ["./wait-for-postgres.sh", "db", "npm", "start"]
    depends_on:
      - db
```

## Gestione degli Ambienti

### File .env

Il file `.env` permette di definire variabili d'ambiente che possono essere utilizzate nel file docker-compose.yml:

```
# .env
COMPOSE_PROJECT_NAME=myapp
POSTGRES_VERSION=13
DB_PASSWORD=secret
```

### File Compose per Ambienti Diversi

È possibile utilizzare file compose diversi per ambienti diversi:

```bash
# Ambiente di sviluppo
docker-compose up

# Ambiente di test
docker-compose -f docker-compose.yml -f docker-compose.test.yml up

# Ambiente di produzione
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Esempio di struttura:

- `docker-compose.yml`: configurazione base
- `docker-compose.override.yml`: configurazione di sviluppo (caricato automaticamente)
- `docker-compose.test.yml`: configurazione per i test
- `docker-compose.prod.yml`: configurazione per la produzione

## Pratiche Consigliate

1. **Usa nomi di progetto**: imposta `COMPOSE_PROJECT_NAME` per evitare conflitti
2. **Separa gli ambienti**: usa file compose diversi per ambienti diversi
3. **Gestisci i segreti**: usa variabili d'ambiente o servizi come Docker Secrets
4. **Limita i privilegi**: evita di usare `privileged: true` quando possibile
5. **Usa healthcheck**: per verificare lo stato dei servizi
6. **Documenta**: aggiungi commenti ai file compose per spiegare le scelte
7. **Versiona**: mantieni i file compose sotto controllo di versione

## Esempi di Gestione Avanzata

### Aggiornamento Zero-Downtime

Per aggiornare un servizio senza interruzioni:

```bash
# Aggiorna un servizio con zero downtime
docker-compose up -d --no-deps --scale web=2 --no-recreate web
```

### Backup dei Dati

Per eseguire un backup dei dati di un database:

```bash
# Backup di un database PostgreSQL
docker-compose exec db pg_dump -U postgres -d myapp > backup.sql

# Ripristino di un backup
cat backup.sql | docker-compose exec -T db psql -U postgres -d myapp
```

### Monitoraggio con Prometheus e Grafana

Esempio di configurazione per monitorare i servizi:

```yaml
version: '3'

services:
  app:
    image: myapp
    # ...

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    depends_on:
      - prometheus
    ports:
      - "3000:3000"
```

## Conclusione

Docker Compose è uno strumento potente per gestire applicazioni multi-container. Con i comandi e le tecniche presentate in questa sezione, è possibile gestire efficacemente il ciclo di vita dei servizi, dal deployment al monitoraggio, fino alla manutenzione.

Nella prossima sezione, esploreremo casi d'uso avanzati e pattern di deployment con Docker Compose.

## Navigazione
- [⬅️ File docker-compose.yml](./02-FileComposeYml.md)
- [📑 Torna all'indice](../README.md)