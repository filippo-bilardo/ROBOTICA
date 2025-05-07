# Best Practice di Sicurezza per Docker

Implementare le migliori pratiche di sicurezza è fondamentale per proteggere i tuoi ambienti Docker. Questo capitolo esplora le strategie più efficaci per migliorare la sicurezza dei container.

## 1. Utilizzare Immagini Ufficiali e Verificate

- **Preferire immagini ufficiali**: Utilizzare immagini dal Docker Hub ufficiale o da repository verificati.
- **Verificare le immagini**: Utilizzare Docker Content Trust (DCT) per verificare l'integrità e l'autenticità delle immagini.

```bash
# Abilitare Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# Pull di un'immagine verificata
docker pull nginx:latest
```

## 2. Mantenere le Immagini Aggiornate

- **Aggiornare regolarmente**: Ricostruire le immagini con le ultime patch di sicurezza.
- **Utilizzare tag specifici**: Evitare il tag `latest` in produzione, preferire versioni specifiche.

```dockerfile
# Esempio di Dockerfile con versione specifica
FROM ubuntu:20.04
# Aggiornare i pacchetti all'inizio
RUN apt-get update && apt-get upgrade -y
```

## 3. Minimizzare la Superficie di Attacco

- **Utilizzare immagini minimali**: Preferire immagini base leggere come Alpine Linux.
- **Multi-stage builds**: Utilizzare build multi-stage per ridurre la dimensione finale dell'immagine.

```dockerfile
# Esempio di multi-stage build
FROM node:14 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
```

## 4. Principio del Privilegio Minimo

- **Non eseguire come root**: Creare e utilizzare utenti non privilegiati nei container.
- **Limitare le capabilities**: Rimuovere le capabilities Linux non necessarie.

```dockerfile
# Creare un utente non privilegiato
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

```bash
# Eseguire un container con capabilities limitate
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx
```

## 5. Limitare le Risorse

- **Impostare limiti di memoria e CPU**: Prevenire attacchi DoS limitando le risorse disponibili per ogni container.

```bash
# Limitare memoria e CPU
docker run -d --memory=512m --cpu-shares=512 nginx
```

## 6. Proteggere la Rete

- **Utilizzare reti dedicate**: Creare reti Docker separate per isolare i container.
- **Esporre solo le porte necessarie**: Limitare l'esposizione delle porte all'esterno.

```bash
# Creare una rete dedicata
docker network create --driver bridge app_network

# Eseguire container sulla rete dedicata
docker run --network=app_network --name=api api_image
```

## 7. Gestire i Segreti in Modo Sicuro

- **Utilizzare Docker Secrets**: Per gestire informazioni sensibili in modo sicuro.
- **Evitare variabili d'ambiente per dati sensibili**: Le variabili d'ambiente possono essere esposte nei log o nei metadati.

```bash
# Creare un secret
echo "password" | docker secret create db_password -

# Utilizzare il secret in un servizio
docker service create --name db --secret db_password mysql
```

## 8. Implementare Logging e Monitoraggio

- **Centralizzare i log**: Utilizzare soluzioni come ELK Stack o Fluentd.
- **Monitorare l'attività dei container**: Implementare strumenti come Prometheus e Grafana.

```bash
# Configurare il logging
docker run --log-driver=syslog --log-opt syslog-address=udp://logserver:514 nginx
```

## 9. Scansionare Regolarmente le Vulnerabilità

- **Utilizzare scanner di vulnerabilità**: Strumenti come Trivy, Clair o Docker Scan.
- **Integrare la scansione nel CI/CD**: Automatizzare i controlli di sicurezza.

```bash
# Esempio di scansione con Trivy
trivy image nginx:latest
```

## 10. Configurare Correttamente AppArmor o SELinux

- **Utilizzare profili di sicurezza**: Implementare profili AppArmor o SELinux per limitare ulteriormente ciò che i container possono fare.

```bash
# Eseguire un container con un profilo AppArmor
docker run --security-opt apparmor=docker-default nginx
```

## Esempio Pratico: Dockerfile Sicuro

Ecco un esempio di Dockerfile che implementa molte delle best practice discusse:

```dockerfile
# Utilizzare un'immagine base minimale con versione specifica
FROM alpine:3.14

# Aggiornare i pacchetti e installare le dipendenze
RUN apk update && apk upgrade && \
    apk add --no-cache nodejs npm && \
    rm -rf /var/cache/apk/*

# Creare un utente non privilegiato
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Impostare la directory di lavoro
WORKDIR /app

# Copiare solo i file necessari
COPY --chown=appuser:appgroup package*.json ./
RUN npm install --production

COPY --chown=appuser:appgroup . .

# Passare all'utente non privilegiato
USER appuser

# Definire un healthcheck
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/health || exit 1

# Esporre solo le porte necessarie
EXPOSE 3000

CMD ["node", "app.js"]
```

---

## Navigazione

- [Indice del Modulo](./README.md)
- Precedente: [Introduzione alla Sicurezza dei Container](./01-IntroduzioneSicurezza.md)
- Prossimo: [Scansione delle Vulnerabilità](./03-ScansioneVulnerabilita.md)