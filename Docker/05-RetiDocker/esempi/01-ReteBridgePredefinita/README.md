# Esempio: Rete Bridge Predefinita

Questo esempio dimostra come funziona la rete bridge predefinita in Docker e come i container possono comunicare tra loro.

## Prerequisiti

- Docker installato sul tuo sistema
- Conoscenza di base dei comandi Docker

## Obiettivi

- Comprendere come funziona la rete bridge predefinita
- Verificare la comunicazione tra container sulla stessa rete
- Esplorare la mappatura delle porte per accedere ai servizi dei container

## Passaggi

### 1. Verifica le Reti Docker Disponibili

Prima di iniziare, verifichiamo quali reti Docker sono disponibili sul sistema:

```bash
docker network ls
```

Dovresti vedere la rete `bridge` predefinita nell'elenco.

### 2. Ispeziona la Rete Bridge Predefinita

Esaminiamo la configurazione della rete bridge predefinita:

```bash
docker network inspect bridge
```

Questo comando mostrerà dettagli come la subnet, il gateway e i container collegati a questa rete.

### 3. Avvia un Container Web

Avviamo un container Nginx sulla rete bridge predefinita:

```bash
docker run -d --name web-server -p 8080:80 nginx:alpine
```

Questo comando:
- Avvia un container Nginx in modalità detached (`-d`)
- Assegna il nome `web-server` al container
- Mappa la porta 8080 dell'host alla porta 80 del container
- Utilizza l'immagine `nginx:alpine`

### 4. Avvia un Container Client

Ora avviamo un secondo container che useremo come client:

```bash
docker run -it --name client alpine sh
```

Questo comando avvia un container Alpine Linux con una shell interattiva.

### 5. Verifica la Comunicazione tra Container

Dal container client, proviamo a comunicare con il container web-server:

```bash
# Installa curl per effettuare richieste HTTP
apk add --no-cache curl

# Prova a connetterti al container web-server usando il suo indirizzo IP
# (Puoi trovare l'IP con 'docker inspect web-server')
curl http://<IP-del-web-server>

# Prova a connetterti usando il nome del container
# (Questo NON funzionerà sulla rete bridge predefinita)
curl http://web-server
```

Nota che sulla rete bridge predefinita, i container non possono comunicare usando i nomi come hostname, ma solo usando gli indirizzi IP.

### 6. Accedi al Web Server dall'Host

Dal tuo sistema host, apri un browser e naviga a:

```
http://localhost:8080
```

Dovresti vedere la pagina predefinita di Nginx, dimostrando che la mappatura delle porte funziona correttamente.

### 7. Pulisci l'Ambiente

Al termine dell'esperimento, rimuovi i container:

```bash
docker stop web-server client
docker rm web-server client
```

## Conclusioni

In questo esempio, hai imparato:

1. Come funziona la rete bridge predefinita in Docker
2. Come i container sulla stessa rete bridge possono comunicare tra loro usando gli indirizzi IP
3. Come la mappatura delle porte permette l'accesso ai servizi dei container dall'host
4. Le limitazioni della rete bridge predefinita (nessuna risoluzione DNS tra container)

Nel prossimo esempio, esploreremo le reti personalizzate che risolvono alcune di queste limitazioni.

## Navigazione
- [⬅️ Torna al README del modulo](../../README.md)
- [➡️ Esempio successivo: Reti Personalizzate](../02-RetiPersonalizzate/README.md)