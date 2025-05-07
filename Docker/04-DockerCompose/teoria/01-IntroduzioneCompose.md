# Introduzione a Docker Compose

In questa sezione introdurremo Docker Compose, uno strumento fondamentale per definire e gestire applicazioni Docker multi-container.

## Cos'è Docker Compose

Docker Compose è uno strumento che permette di definire e gestire applicazioni multi-container. Con Compose, si utilizza un file YAML per configurare i servizi dell'applicazione, e poi, con un singolo comando, si crea e si avvia l'intera applicazione.

## Perché Utilizzare Docker Compose

Quando un'applicazione diventa complessa e richiede più container che lavorano insieme, gestirli individualmente diventa complicato. Docker Compose risolve questo problema permettendo di:

- **Definire l'intera applicazione** in un unico file dichiarativo
- **Avviare tutti i servizi** con un solo comando
- **Gestire il ciclo di vita** dell'applicazione in modo semplice
- **Mantenere isolati** gli ambienti di sviluppo, test e produzione
- **Scalare facilmente** i servizi quando necessario

## Casi d'Uso Comuni

1. **Ambienti di sviluppo**: configurare rapidamente un ambiente locale che rispecchia quello di produzione
2. **Test automatizzati**: creare ambienti isolati per i test
3. **Deployment in singolo host**: orchestrare applicazioni multi-container su un singolo server
4. **CI/CD**: integrare nei pipeline di integrazione continua

## Componenti Principali

### Servizi

I servizi rappresentano i container che compongono l'applicazione. Ogni servizio può essere basato su un'immagine diversa e avere la propria configurazione.

### Reti

Le reti permettono ai container di comunicare tra loro. Docker Compose crea automaticamente una rete per l'applicazione, ma è possibile definire reti personalizzate.

### Volumi

I volumi consentono la persistenza dei dati e la condivisione di file tra container e con l'host.

## Installazione di Docker Compose

Docker Compose è incluso nelle installazioni di Docker Desktop per Windows e Mac. Per Linux, potrebbe essere necessario installarlo separatamente:

```bash
# Scarica la versione stabile di Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendi eseguibile il binario
sudo chmod +x /usr/local/bin/docker-compose

# Verifica l'installazione
docker-compose --version
```

## Versioni di Docker Compose

Esistono due implementazioni principali di Docker Compose:

1. **Docker Compose V1** (comando `docker-compose`): l'implementazione originale, scritta in Python
2. **Docker Compose V2** (comando `docker compose`): la nuova implementazione, integrata come plugin di Docker CLI

La versione V2 è ora quella consigliata e offre migliori prestazioni e nuove funzionalità.

## Un Semplice Esempio

Ecco un esempio di file `docker-compose.yml` per un'applicazione web con un database:

```yaml
version: '3'

services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./website:/usr/share/nginx/html
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: example
      MYSQL_DATABASE: myapp
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

Per avviare questa applicazione, basta eseguire:

```bash
docker-compose up
```

## Comandi Principali

- **`docker-compose up`**: Crea e avvia i container
- **`docker-compose down`**: Ferma e rimuove i container
- **`docker-compose ps`**: Mostra lo stato dei servizi
- **`docker-compose logs`**: Visualizza i log dei container
- **`docker-compose exec`**: Esegue comandi in un container
- **`docker-compose build`**: Costruisce o ricostruisce i servizi

## Vantaggi Rispetto ai Container Singoli

1. **Gestione semplificata**: un solo file di configurazione invece di lunghi comandi Docker
2. **Dipendenze gestite**: ordine di avvio e connessioni tra servizi
3. **Ambienti isolati**: ogni progetto può avere la propria configurazione
4. **Riproducibilità**: lo stesso ambiente su qualsiasi macchina
5. **Scalabilità**: facile replica dei servizi

## Limitazioni

- Non adatto per orchestrazione multi-host (per questo esistono Kubernetes, Docker Swarm, ecc.)
- Funzionalità limitate rispetto a strumenti di orchestrazione più avanzati
- Non gestisce automaticamente il failover o il bilanciamento del carico tra host

## Conclusione

Docker Compose è uno strumento essenziale per lo sviluppo e il deployment di applicazioni Docker complesse. Semplifica notevolmente la gestione di applicazioni multi-container e permette di definire l'intera infrastruttura come codice.

Nella prossima sezione, esploreremo in dettaglio la struttura e la sintassi del file docker-compose.yml.

## Navigazione
- [➡️ File docker-compose.yml](./02-FileComposeYml.md)
- [📑 Torna all'indice](../README.md)