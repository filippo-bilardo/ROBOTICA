# Anatomia di un'Immagine Docker

In questa sezione esploreremo la struttura interna delle immagini Docker, comprendendo come sono organizzate e come funzionano.

## Cos'è un'Immagine Docker

Un'immagine Docker è un pacchetto eseguibile leggero, autonomo e indipendente che include tutto il necessario per eseguire un'applicazione: codice, runtime, librerie, variabili d'ambiente e file di configurazione.

## Caratteristiche Principali

- **Immutabilità**: le immagini sono di sola lettura e non possono essere modificate dopo la creazione
- **Componibilità**: le immagini possono essere basate su altre immagini
- **Portabilità**: funzionano allo stesso modo in qualsiasi ambiente che supporti Docker
- **Efficienza**: utilizzano un sistema di layer condivisi per risparmiare spazio

## Struttura a Layer

Una delle caratteristiche più importanti delle immagini Docker è la loro struttura a layer (strati).

### Cos'è un Layer

Un layer è un insieme di modifiche al filesystem. Ogni istruzione in un Dockerfile crea un nuovo layer nell'immagine:

1. **Layer di base**: solitamente un sistema operativo minimale
2. **Layer intermedi**: aggiunti da ogni istruzione nel Dockerfile
3. **Layer superiore**: contiene le modifiche finali e i metadati dell'immagine

### Vantaggi della Struttura a Layer

- **Riutilizzo**: i layer sono condivisi tra immagini diverse
- **Caching**: durante il build, i layer non modificati vengono riutilizzati dalla cache
- **Efficienza di spazio**: i layer identici sono memorizzati una sola volta
- **Trasferimento efficiente**: solo i layer mancanti vengono scaricati

## Esempio di Struttura a Layer

Consideriamo un semplice Dockerfile:

```dockerfile
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y nginx
COPY ./app /var/www/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Questo Dockerfile genera un'immagine con i seguenti layer:

1. **Layer base**: l'immagine ubuntu:20.04
2. **Layer RUN**: le modifiche al filesystem dopo l'installazione di nginx
3. **Layer COPY**: i file dell'applicazione copiati in /var/www/html
4. **Layer di metadati**: EXPOSE e CMD non creano layer di filesystem, ma aggiungono metadati

## Union File System

Docker utilizza un Union File System per combinare questi layer in un unico filesystem coerente. Quando un container viene avviato, Docker aggiunge un layer scrivibile in cima ai layer di sola lettura dell'immagine.

### Come Funziona

1. **Layer di sola lettura**: tutti i layer dell'immagine sono immutabili
2. **Layer scrivibile**: quando un container viene avviato, viene aggiunto un layer scrivibile in cima
3. **Copy-on-Write**: quando un file viene modificato, viene copiato dal layer di sola lettura al layer scrivibile

## Image ID e Digest

Ogni immagine Docker è identificata da:

- **Image ID**: un hash SHA256 troncato del contenuto dell'immagine
- **Digest**: un hash SHA256 completo che garantisce l'integrità dell'immagine

Esempio:
```bash
docker images --digests
```

## Immagini e Tag

Le immagini Docker sono organizzate con un sistema di nomi e tag:

- **Repository**: il nome dell'immagine (es. ubuntu, nginx, mysql)
- **Tag**: identificatore di versione (es. latest, 20.04, 1.19)
- **Registry**: server che ospita le immagini (default: Docker Hub)

Formato completo: `registry/repository:tag`

Esempi:
- `ubuntu:20.04`
- `nginx:latest`
- `registry.example.com/myapp:1.0`

## Immagini Base vs Immagini Derivate

- **Immagini base**: immagini minimali come scratch, alpine, debian, ubuntu
- **Immagini derivate**: costruite a partire da un'immagine base con software aggiuntivo

## Ispezione delle Immagini

Docker fornisce strumenti per ispezionare le immagini:

```bash
# Visualizza i layer di un'immagine
docker history nginx:latest

# Visualizza i metadati dettagliati
docker inspect nginx:latest

# Visualizza le vulnerabilità (richiede Docker Desktop)
docker scan nginx:latest
```

## Immagini Multi-architettura

Le immagini Docker possono supportare diverse architetture hardware (amd64, arm64, ecc.) attraverso i manifest list, che mappano ogni architettura alla rispettiva immagine specifica.

## Conclusione

Comprendere l'anatomia delle immagini Docker è fondamentale per creare immagini efficienti e ottimizzate. La struttura a layer offre numerosi vantaggi in termini di riutilizzo, efficienza e velocità di distribuzione.

Nella prossima sezione, esploreremo in dettaglio come creare immagini personalizzate utilizzando i Dockerfile.

## Navigazione
- [➡️ Dockerfile: Istruzioni e Best Practices](./02-Dockerfile.md)
- [📑 Torna all'indice](../README.md)