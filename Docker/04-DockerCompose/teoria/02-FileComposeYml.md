# File docker-compose.yml

In questa sezione esploreremo in dettaglio la struttura e la sintassi del file docker-compose.yml, il cuore di Docker Compose.

## Struttura Base

Il file docker-compose.yml è un file YAML che definisce servizi, reti e volumi. La struttura base è la seguente:

```yaml
version: '3'

services:
  # Definizione dei servizi

networks:
  # Definizione delle reti (opzionale)

volumes:
  # Definizione dei volumi (opzionale)
```

## Versioni di Compose

La direttiva `version` specifica la versione del formato del file Compose. Le versioni più recenti offrono più funzionalità:

- **1.x**: Versione legacy
- **2.x**: Aggiunge supporto per reti e volumi
- **3.x**: Compatibile con Docker Swarm e servizi

Si consiglia di utilizzare almeno la versione 3 per i nuovi progetti.

## Definizione dei Servizi

La sezione `services` è il cuore del file, dove si definiscono i container dell'applicazione:

```yaml
services:
  web:
    image: nginx:alpine
    # altre configurazioni...
  
  db:
    image: postgres:13
    # altre configurazioni...
```

### Opzioni Principali per i Servizi

#### image

Specifica l'immagine Docker da utilizzare:

```yaml
services:
  web:
    image: nginx:alpine
```

#### build

Alternativa a `image`, permette di costruire un'immagine da un Dockerfile:

```yaml
services:
  web:
    build: 
      context: ./dir  # Directory contenente il Dockerfile
      dockerfile: Dockerfile.dev  # Nome del Dockerfile (opzionale)
      args:  # Argomenti di build (opzionale)
        buildno: 1
```

#### ports

Espone le porte del container all'host:

```yaml
services:
  web:
    ports:
      - "8080:80"  # HOST:CONTAINER
      - "443:443"
```

#### environment

Imposta variabili d'ambiente nel container:

```yaml
services:
  db:
    environment:
      MYSQL_ROOT_PASSWORD: example
      MYSQL_DATABASE: myapp
```

Alternativamente, si può utilizzare un file:

```yaml
services:
  db:
    env_file: ./env.db
```

#### volumes

Monta volumi nel container:

```yaml
services:
  web:
    volumes:
      - ./html:/usr/share/nginx/html  # HOST:CONTAINER
      - data-volume:/var/lib/mysql  # NAMED VOLUME:CONTAINER
```

#### depends_on

Specifica dipendenze tra servizi:

```yaml
services:
  web:
    depends_on:
      - db
      - redis
```

Nota: `depends_on` controlla solo l'ordine di avvio, non attende che i servizi siano "pronti".

#### networks

Connette il servizio a reti specifiche:

```yaml
services:
  web:
    networks:
      - frontend
      - backend
```

#### restart

Definisce la politica di riavvio del container:

```yaml
services:
  web:
    restart: always  # always, on-failure, unless-stopped, no
```

#### command

Sovrascrive il comando predefinito dell'immagine:

```yaml
services:
  web:
    command: nginx -g 'daemon off;'
```

#### healthcheck

Configura controlli di salute per il container:

```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 1m30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Definizione delle Reti

La sezione `networks` permette di creare reti personalizzate:

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # Rete senza accesso a Internet
```

### Tipi di Driver di Rete

- **bridge**: Rete isolata sulla singola macchina host (default)
- **host**: Usa direttamente la rete dell'host
- **overlay**: Rete distribuita tra più host (per Swarm)
- **macvlan**: Assegna indirizzi MAC ai container
- **none**: Disabilita il networking

## Definizione dei Volumi

La sezione `volumes` definisce volumi che possono essere utilizzati dai servizi:

```yaml
volumes:
  data-volume:  # Volume semplice con configurazione predefinita
  
  db-data:
    driver: local
    driver_opts:
      type: 'none'
      o: 'bind'
      device: '/path/on/host'
```

## Variabili d'Ambiente e Sostituzione

È possibile utilizzare variabili d'ambiente nel file docker-compose.yml:

```yaml
services:
  web:
    image: "nginx:${NGINX_VERSION}"
    ports:
      - "${HOST_PORT}:80"
```

Le variabili possono essere definite in un file `.env` nella stessa directory del file docker-compose.yml.

## Estendere Configurazioni

È possibile estendere configurazioni con il file `docker-compose.override.yml`:

1. `docker-compose.yml`: configurazione base
2. `docker-compose.override.yml`: sovrascrive/estende la configurazione base

Per ambienti multipli, si possono utilizzare file specifici:

```bash
# Per sviluppo (usa docker-compose.yml + docker-compose.override.yml)
docker-compose up

# Per produzione
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## Profili

I profili permettono di avviare solo un sottoinsieme di servizi:

```yaml
services:
  web:
    image: nginx
  
  db:
    image: mysql
  
  admin:
    image: phpmyadmin
    profiles:
      - debug
```

Per avviare solo i servizi con un profilo specifico:

```bash
docker-compose --profile debug up
```

## Esempi Completi

### Applicazione Web con Database

```yaml
version: '3'

services:
  web:
    build: ./web
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgres://postgres:example@db:5432/app
    networks:
      - frontend
      - backend

  db:
    image: postgres:13
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=example
      - POSTGRES_DB=app
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true

volumes:
  db-data:
```

### Stack Completo per Sviluppo Web

```yaml
version: '3'

services:
  web:
    build: ./web
    ports:
      - "8000:8000"
    volumes:
      - ./web:/code
    depends_on:
      - db
      - redis
      - elasticsearch

  db:
    image: postgres:13
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=example

  redis:
    image: redis:alpine

  elasticsearch:
    image: elasticsearch:7.10.0
    environment:
      - discovery.type=single-node
    volumes:
      - es-data:/usr/share/elasticsearch/data

  kibana:
    image: kibana:7.10.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
    profiles:
      - monitoring

volumes:
  db-data:
  es-data:
```

## Best Practices

1. **Usa versioni specifiche** per le immagini (es. `nginx:1.19.6-alpine` invece di `nginx:latest`)
2. **Organizza i servizi** in modo logico
3. **Separa le configurazioni** per ambienti diversi
4. **Usa variabili d'ambiente** per valori che cambiano tra ambienti
5. **Documenta** le opzioni non ovvie con commenti
6. **Utilizza healthcheck** per servizi critici
7. **Limita i privilegi** dei container

## Conclusione

Il file docker-compose.yml è uno strumento potente per definire applicazioni multi-container in modo dichiarativo. La sua sintassi flessibile permette di gestire configurazioni complesse mantenendo la leggibilità e la manutenibilità.

Nella prossima sezione, esploreremo in dettaglio come gestire i servizi con Docker Compose.

## Navigazione
- [⬅️ Introduzione a Docker Compose](./01-IntroduzioneCompose.md)
- [➡️ Gestione dei Servizi](./03-GestioneServizi.md)
- [📑 Torna all'indice](../README.md)