# Gestione Avanzata dei Volumi Docker

## Driver di Volumi

Docker supporta diversi driver di volumi che consentono di estendere le funzionalità di storage oltre il filesystem locale. Questi driver permettono di utilizzare storage remoti, distribuiti o con caratteristiche speciali.

### Driver di Volume Integrati

Docker include alcuni driver di volume integrati:

1. **local**: il driver predefinito, memorizza i dati sul filesystem locale
2. **none**: disabilita la persistenza (utile per container temporanei)

```bash
# Creazione di un volume con driver specifico
docker volume create --driver local mio-volume

# Ispezione del driver utilizzato
docker volume inspect mio-volume
```

### Driver di Volume di Terze Parti

Esistono numerosi driver di volume sviluppati da terze parti che estendono le capacità di storage di Docker:

| Driver | Descrizione | Caso d'uso |
|--------|-------------|------------|
| **nfs** | Supporto per NFS | Storage condiviso in rete |
| **sshfs** | Montaggio via SSH | Storage remoto sicuro |
| **ceph** | Storage distribuito Ceph | Alta disponibilità e scalabilità |
| **glusterfs** | Storage distribuito GlusterFS | File system distribuito |
| **s3fs** | Montaggio bucket S3 | Storage cloud |
| **azure-file** | Azure File Storage | Cloud storage su Azure |
| **gce-pd** | Google Compute Engine Persistent Disk | Cloud storage su GCP |

**Installazione e utilizzo**:

```bash
# Installazione di un plugin di volume (esempio)
docker plugin install vieux/sshfs

# Creazione di un volume con driver di terze parti
docker volume create --driver vieux/sshfs \
  --opt sshcmd=user@host:/path \
  --opt password=password \
  mio-volume-remoto

# Utilizzo del volume
docker run -v mio-volume-remoto:/data alpine ls /data
```

## Opzioni Avanzate dei Volumi

### Etichette (Labels)

Le etichette permettono di aggiungere metadati ai volumi per organizzarli e filtrarli:

```bash
# Creazione di un volume con etichette
docker volume create --label environment=production --label app=database mio-volume

# Filtraggio dei volumi per etichetta
docker volume ls --filter label=environment=production
```

### Opzioni Specifiche del Driver

Ogni driver di volume può supportare opzioni specifiche che ne personalizzano il comportamento:

```bash
# Creazione di un volume con opzioni specifiche
docker volume create --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.1,rw \
  --opt device=:/path/to/dir \
  mio-nfs-volume
```

## Backup e Ripristino dei Volumi

Il backup dei dati containerizzati è un aspetto critico della gestione dei volumi Docker. Esistono diverse strategie per eseguire backup e ripristino dei volumi.

### Backup di un Volume

**Metodo 1: Utilizzo di un container temporaneo**

```bash
# Backup di un volume in un file tar
docker run --rm -v mio-volume:/source:ro -v $(pwd):/backup alpine tar -czf /backup/mio-volume-backup.tar.gz -C /source .
```

**Metodo 2: Utilizzo di docker-volume-backup**

Esistono strumenti di terze parti come `docker-volume-backup` che semplificano il processo:

```bash
# Installazione dello strumento
docker pull loomchild/volume-backup

# Backup di un volume
docker run -v mio-volume:/volume -v $(pwd):/backup --rm loomchild/volume-backup backup mio-volume
```

### Ripristino di un Volume

**Metodo 1: Utilizzo di un container temporaneo**

```bash
# Ripristino di un volume da un file tar
docker run --rm -v mio-volume:/target -v $(pwd):/backup alpine sh -c "cd /target && tar -xzf /backup/mio-volume-backup.tar.gz"
```

**Metodo 2: Utilizzo di docker-volume-backup**

```bash
# Ripristino di un volume
docker run -v mio-volume:/volume -v $(pwd):/backup --rm loomchild/volume-backup restore mio-volume
```

### Backup Automatizzati

Per ambienti di produzione, è consigliabile automatizzare i backup dei volumi:

```bash
# Esempio di script di backup automatico
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup di tutti i volumi
for VOLUME in $(docker volume ls -q); do
  docker run --rm -v $VOLUME:/source:ro -v $BACKUP_DIR:/backup alpine tar -czf /backup/$VOLUME-$DATE.tar.gz -C /source .
done

# Pulizia dei backup più vecchi di 7 giorni
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +7 -delete
```

## Migrazione dei Volumi

La migrazione dei volumi tra host Docker richiede strategie specifiche.

### Migrazione Manuale

```bash
# Host 1: Backup del volume
docker run --rm -v mio-volume:/source:ro -v $(pwd):/backup alpine tar -czf /backup/mio-volume-backup.tar.gz -C /source .

# Trasferimento del file di backup all'host 2
scp mio-volume-backup.tar.gz user@host2:/path/to/backup/

# Host 2: Creazione del nuovo volume
docker volume create mio-volume

# Host 2: Ripristino del volume
docker run --rm -v mio-volume:/target -v /path/to/backup:/backup alpine sh -c "cd /target && tar -xzf /backup/mio-volume-backup.tar.gz"
```

### Utilizzo di Storage Condiviso

Un'alternativa alla migrazione manuale è l'utilizzo di storage condiviso accessibile da entrambi gli host:

```bash
# Creazione di un volume con storage condiviso
docker volume create --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.1,rw \
  --opt device=:/path/to/shared/storage \
  mio-volume-condiviso
```

## Monitoraggio e Manutenzione dei Volumi

### Monitoraggio dello Spazio Utilizzato

```bash
# Visualizzazione dello spazio utilizzato dai volumi
du -sh /var/lib/docker/volumes/*

# Utilizzo di docker system df
docker system df -v
```

### Pulizia dei Volumi

```bash
# Eliminazione di tutti i volumi non utilizzati
docker volume prune

# Eliminazione di volumi non utilizzati con filtro
docker volume prune --filter label=environment=development
```

### Manutenzione Periodica

È consigliabile implementare procedure di manutenzione periodica:

1. **Monitoraggio dello spazio disponibile**
2. **Pulizia dei volumi non utilizzati**
3. **Verifica dell'integrità dei backup**
4. **Aggiornamento dei driver di volume**

## Sicurezza dei Volumi

### Limitazione dell'Accesso

```bash
# Montaggio in sola lettura
docker run -v mio-volume:/data:ro nginx

# Limitazione dei permessi
docker run -v mio-volume:/data --user 1000:1000 nginx
```

### Crittografia dei Dati

Per dati sensibili, è consigliabile utilizzare volumi crittografati:

```bash
# Utilizzo di LUKS per la crittografia (esempio)
# 1. Creazione di un container crittografato
cryptsetup luksFormat /path/to/container

# 2. Apertura del container
cryptsetup luksOpen /path/to/container encrypted-data

# 3. Creazione del filesystem
mkfs.ext4 /dev/mapper/encrypted-data

# 4. Montaggio e utilizzo con Docker
mount /dev/mapper/encrypted-data /mnt/encrypted
docker run -v /mnt/encrypted:/data nginx
```

## Integrazione con Docker Compose

Docker Compose semplifica la gestione dei volumi in applicazioni multi-container:

```yaml
version: '3'

services:
  db:
    image: postgres:13
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d:ro
    environment:
      POSTGRES_PASSWORD: example

  app:
    build: .
    volumes:
      - ./app:/app
      - shared-data:/shared
    depends_on:
      - db

volumes:
  db-data:    # Volume named gestito da Docker
  shared-data:  # Volume named condiviso tra servizi
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.1,rw
      device: ":/path/to/shared/folder"
```

## Conclusioni

La gestione avanzata dei volumi Docker permette di implementare soluzioni di storage flessibili, scalabili e sicure per le applicazioni containerizzate. La scelta del driver di volume appropriato, l'implementazione di strategie di backup efficaci e la corretta configurazione delle opzioni di sicurezza sono aspetti fondamentali per garantire la persistenza e l'integrità dei dati.

Nei prossimi capitoli, vedremo esempi pratici di utilizzo dei volumi in scenari reali.

## Navigazione

- [⬅️ Precedente: Tipi di Volumi Docker](./02-TipiVolumi.md)
- [📑 Torna all'indice del modulo](../README.md)