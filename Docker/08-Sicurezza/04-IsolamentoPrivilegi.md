# Isolamento e Privilegi nei Container Docker

L'isolamento è uno dei principi fondamentali della containerizzazione. Questo capitolo esplora come Docker implementa l'isolamento e come gestire correttamente i privilegi per migliorare la sicurezza dei container.

## Meccanismi di Isolamento in Docker

Docker utilizza diverse tecnologie del kernel Linux per fornire isolamento tra i container e tra i container e l'host:

### 1. Namespaces

I namespaces isolano le risorse del sistema operativo, facendo sì che i processi all'interno di un container vedano solo un sottoinsieme isolato delle risorse:

- **PID Namespace**: Isola i processi
- **Network Namespace**: Isola le interfacce di rete
- **Mount Namespace**: Isola i filesystem
- **UTS Namespace**: Isola hostname e domainname
- **IPC Namespace**: Isola la comunicazione tra processi
- **User Namespace**: Isola gli ID utente e gruppo

### 2. Control Groups (cgroups)

I cgroups limitano e isolano l'utilizzo delle risorse hardware come CPU, memoria, I/O del disco e rete:

```bash
# Limitare l'utilizzo della CPU e della memoria
docker run -d --cpus=0.5 --memory=512m nginx
```

### 3. Capabilities Linux

Le capabilities Linux suddividono i privilegi tradizionalmente associati all'utente root in unità più piccole e gestibili:

```bash
# Rimuovere tutte le capabilities e aggiungere solo quelle necessarie
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx
```

## Gestione dei Privilegi

### 1. Evitare l'Esecuzione come Root

Per impostazione predefinita, i processi nei container Docker vengono eseguiti come root. Questo rappresenta un rischio di sicurezza in caso di escape dal container:

```dockerfile
# Creare un utente non privilegiato nel Dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup . .
USER appuser
```

### 2. Modalità Privilegiata

La modalità privilegiata concede al container quasi tutti i privilegi dell'host, aumentando significativamente i rischi di sicurezza:

```bash
# NON utilizzare in produzione senza una valida ragione
docker run --privileged nginx
```

Alternative più sicure:

```bash
# Concedere solo i privilegi specifici necessari
docker run --device=/dev/sda:/dev/sda nginx
```

### 3. User Namespaces

I user namespaces permettono di mappare gli utenti del container a utenti non privilegiati sull'host:

```bash
# Abilitare user namespaces nel demone Docker
# In /etc/docker/daemon.json
{
  "userns-remap": "default"
}
```

## Tecniche di Isolamento Avanzate

### 1. Seccomp (Secure Computing Mode)

Seccomp limita le system call che un processo può effettuare, riducendo la superficie di attacco:

```bash
# Applicare un profilo seccomp personalizzato
docker run --security-opt seccomp=/path/to/seccomp.json nginx
```

Esempio di profilo seccomp di base:

```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64"],
  "syscalls": [
    {
      "name": "accept",
      "action": "SCMP_ACT_ALLOW"
    },
    {
      "name": "bind",
      "action": "SCMP_ACT_ALLOW"
    },
    // Altri syscall necessari
  ]
}
```

### 2. AppArmor

AppArmor è un sistema di controllo degli accessi basato su policy che limita le capacità dei programmi:

```bash
# Applicare un profilo AppArmor
docker run --security-opt apparmor=docker-default nginx
```

### 3. SELinux

SELinux fornisce un meccanismo di controllo degli accessi obbligatorio (MAC):

```bash
# Applicare una policy SELinux
docker run --security-opt label=type:container_t nginx
```

## Isolamento della Rete

### 1. Reti Bridge Personalizzate

Creare reti bridge personalizzate per isolare gruppi di container:

```bash
# Creare una rete isolata
docker network create --driver bridge app_network

# Eseguire container sulla rete isolata
docker run --network=app_network --name=api api_image
```

### 2. Regole di Firewall

Implementare regole di firewall per limitare la comunicazione tra container:

```bash
# Esempio di regola iptables per limitare l'accesso
iptables -I DOCKER-USER -i eth0 -p tcp --dport 8080 -j DROP
```

## Esempio Pratico: Container con Isolamento Rafforzato

Ecco un esempio completo di come eseguire un container con isolamento e privilegi rafforzati:

```bash
# Creare una rete dedicata
docker network create --driver bridge secure_network

# Eseguire il container con restrizioni
docker run -d \
  --name secure_app \
  --network=secure_network \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --security-opt=no-new-privileges \
  --security-opt apparmor=docker-default \
  --security-opt seccomp=/path/to/seccomp.json \
  --read-only \
  --tmpfs /tmp \
  --cpus=0.5 \
  --memory=512m \
  --pids-limit=100 \
  --user 1000:1000 \
  secure_image
```

## Verifica dell'Isolamento

È importante verificare regolarmente l'efficacia delle misure di isolamento implementate:

```bash
# Verificare le capabilities di un container in esecuzione
docker exec container_name capsh --print

# Verificare i namespace
docker inspect --format '{{.HostConfig.IpcMode}}' container_name
docker inspect --format '{{.HostConfig.PidMode}}' container_name

# Verificare i limiti di risorse
docker stats container_name
```

## Conclusione

L'isolamento e la gestione dei privilegi sono componenti fondamentali della sicurezza dei container Docker. Implementando correttamente queste tecniche, è possibile ridurre significativamente i rischi associati all'esecuzione di applicazioni containerizzate, specialmente in ambienti multi-tenant o di produzione.

---

## Navigazione

- [Indice del Modulo](./README.md)
- Precedente: [Scansione delle Vulnerabilità](./03-ScansioneVulnerabilita.md)
- Prossimo: [Secrets Management](./05-SecretsManagement.md)