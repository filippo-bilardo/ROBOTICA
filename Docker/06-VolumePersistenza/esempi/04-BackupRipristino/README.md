# Esempio: Backup e Ripristino di Volumi Docker

Questo esempio dimostra come eseguire il backup e il ripristino dei dati memorizzati nei volumi Docker, un'operazione fondamentale per la gestione dei dati persistenti in ambienti containerizzati.

## Prerequisiti

- Docker installato sul tuo sistema
- Conoscenza di base dei comandi Docker

## Obiettivi

- Creare una strategia di backup per i volumi Docker
- Implementare procedure di backup e ripristino
- Automatizzare il processo di backup

## Passaggi

### 1. Creazione di un Volume e Dati di Test

Crea un volume Docker e popola con dati di test:

```bash
# Crea un volume
docker volume create dati-da-backuppare

# Crea un container temporaneo per popolare il volume
docker run --rm -v dati-da-backuppare:/data alpine sh -c "echo 'File di test 1' > /data/file1.txt && echo 'File di test 2' > /data/file2.txt && mkdir -p /data/sottocartella && echo 'File nella sottocartella' > /data/sottocartella/file3.txt"

# Verifica i dati creati
docker run --rm -v dati-da-backuppare:/data alpine ls -la /data
docker run --rm -v dati-da-backuppare:/data alpine cat /data/file1.txt
```

### 2. Backup di un Volume Docker

#### Metodo 1: Backup con tar

Questo metodo utilizza un container temporaneo per creare un archivio tar del volume:

```bash
# Crea una directory per i backup
mkdir -p ./backups

# Esegui il backup del volume in un file tar
docker run --rm -v dati-da-backuppare:/source:ro -v $(pwd)/backups:/backup alpine tar -czf /backup/volume-backup.tar.gz -C /source .

# Verifica il file di backup creato
ls -la ./backups
```

#### Metodo 2: Backup con rsync (per sistemi Unix/Linux)

Questo metodo utilizza rsync per copiare i dati dal volume a una directory locale:

```bash
# Crea una directory per i backup
mkdir -p ./backups/rsync-backup

# Esegui il backup con rsync
docker run --rm -v dati-da-backuppare:/source:ro -v $(pwd)/backups/rsync-backup:/backup alpine sh -c "apk add --no-cache rsync && rsync -av /source/ /backup/"

# Verifica i file copiati
ls -la ./backups/rsync-backup
```

### 3. Simulazione di Perdita di Dati

Simuliamo una perdita di dati eliminando il volume originale:

```bash
# Elimina il volume originale
docker volume rm dati-da-backuppare

# Verifica che il volume sia stato eliminato
docker volume ls
```

### 4. Ripristino del Volume da Backup

#### Metodo 1: Ripristino da tar

```bash
# Ricrea il volume
docker volume create dati-da-backuppare

# Ripristina i dati dal backup tar
docker run --rm -v dati-da-backuppare:/target -v $(pwd)/backups:/backup alpine sh -c "cd /target && tar -xzf /backup/volume-backup.tar.gz"

# Verifica i dati ripristinati
docker run --rm -v dati-da-backuppare:/data alpine ls -la /data
docker run --rm -v dati-da-backuppare:/data alpine cat /data/file1.txt
```

#### Metodo 2: Ripristino da rsync backup

```bash
# Se hai già ricreato il volume nel metodo 1, eliminalo prima
docker volume rm dati-da-backuppare
docker volume create dati-da-backuppare

# Ripristina i dati dal backup rsync
docker run --rm -v dati-da-backuppare:/target -v $(pwd)/backups/rsync-backup:/backup alpine sh -c "apk add --no-cache rsync && rsync -av /backup/ /target/"

# Verifica i dati ripristinati
docker run --rm -v dati-da-backuppare:/data alpine ls -la /data
docker run --rm -v dati-da-backuppare:/data alpine cat /data/file1.txt
```

### 5. Automazione del Backup

Crea uno script di backup automatico:

```bash
cat > backup-volumes.sh << 'EOF'
#!/bin/bash

# Configurazione
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Crea la directory di backup se non esiste
mkdir -p "$BACKUP_DIR"

# Funzione per il backup di un volume
backup_volume() {
  VOLUME_NAME=$1
  BACKUP_FILE="$BACKUP_DIR/${VOLUME_NAME}_${DATE}.tar.gz"
  
  echo "Backup del volume $VOLUME_NAME in $BACKUP_FILE"
  docker run --rm -v "$VOLUME_NAME":/source:ro -v "$BACKUP_DIR":/backup alpine tar -czf "/backup/$(basename $BACKUP_FILE)" -C /source .
  
  if [ $? -eq 0 ]; then
    echo "✅ Backup completato con successo: $BACKUP_FILE"
  else
    echo "❌ Errore durante il backup del volume $VOLUME_NAME"
  fi
}

# Backup di volumi specifici
backup_volume "dati-da-backuppare"

# Per eseguire il backup di tutti i volumi, decommentare le righe seguenti:
# echo "Backup di tutti i volumi Docker..."
# for VOLUME in $(docker volume ls -q); do
#   backup_volume "$VOLUME"
# done

# Pulizia dei backup più vecchi (opzionale)
# find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +7 -delete

echo "Processo di backup completato!"
EOF

chmod +x backup-volumes.sh
```

Esegui lo script di backup:

```bash
./backup-volumes.sh
```

### 6. Ripristino da Backup Automatico

Crea uno script di ripristino:

```bash
cat > restore-volume.sh << 'EOF'
#!/bin/bash

# Verifica i parametri
if [ $# -ne 2 ]; then
  echo "Utilizzo: $0 <nome_volume> <file_backup>"
  exit 1
fi

VOLUME_NAME=$1
BACKUP_FILE=$2

# Verifica che il file di backup esista
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ File di backup non trovato: $BACKUP_FILE"
  exit 1
fi

# Verifica se il volume esiste già
if docker volume inspect "$VOLUME_NAME" &>/dev/null; then
  read -p "⚠️ Il volume $VOLUME_NAME esiste già. Vuoi sovrascriverlo? (s/n): " CONFIRM
  if [ "$CONFIRM" != "s" ]; then
    echo "Operazione annullata."
    exit 0
  fi
else
  # Crea il volume se non esiste
  echo "Creazione del volume $VOLUME_NAME..."
  docker volume create "$VOLUME_NAME"
fi

# Ripristina il backup
echo "Ripristino del volume $VOLUME_NAME dal backup $BACKUP_FILE..."
docker run --rm -v "$VOLUME_NAME":/target -v "$(dirname "$BACKUP_FILE")":/backup alpine sh -c "cd /target && tar -xzf /backup/$(basename "$BACKUP_FILE")"

if [ $? -eq 0 ]; then
  echo "✅ Ripristino completato con successo!"
  echo "Contenuto del volume ripristinato:"
  docker run --rm -v "$VOLUME_NAME":/data alpine ls -la /data
else
  echo "❌ Errore durante il ripristino del volume."
fi
EOF

chmod +x restore-volume.sh
```

Esegui lo script di ripristino:

```bash
# Prima elimina il volume per simulare un ripristino completo
docker volume rm dati-da-backuppare

# Ripristina dal backup più recente
./restore-volume.sh dati-da-backuppare ./backups/dati-da-backuppare_*.tar.gz
```

## Spiegazione

In questo esempio:

1. Abbiamo creato un volume Docker e lo abbiamo popolato con dati di test
2. Abbiamo implementato due metodi di backup: utilizzando tar e rsync
3. Abbiamo simulato una perdita di dati eliminando il volume
4. Abbiamo ripristinato il volume dai backup creati
5. Abbiamo creato script per automatizzare il processo di backup e ripristino

Queste tecniche sono fondamentali per garantire la persistenza dei dati in ambienti Docker, specialmente in produzione dove la perdita di dati può avere conseguenze gravi.

## Best Practices per il Backup dei Volumi

1. **Backup regolari e automatizzati**
   - Implementa un sistema di backup automatico con cron o altri scheduler
   - Mantieni una rotazione dei backup (giornalieri, settimanali, mensili)

2. **Verifica dei backup**
   - Testa regolarmente il processo di ripristino
   - Verifica l'integrità dei file di backup

3. **Documentazione**
   - Documenta le procedure di backup e ripristino
   - Mantieni un registro dei backup eseguiti

4. **Storage sicuro**
   - Archivia i backup in location diverse dall'host Docker
   - Considera soluzioni di storage remoto o cloud

5. **Backup incrementali**
   - Per volumi di grandi dimensioni, considera backup incrementali
   - Utilizza strumenti come rsync con l'opzione --link-dest

## Strumenti Avanzati per il Backup

Oltre ai metodi mostrati in questo esempio, esistono strumenti più avanzati per il backup dei volumi Docker:

1. **docker-volume-backup**: Plugin Docker per il backup automatico dei volumi
2. **Duplicity**: Strumento per backup crittografati e incrementali
3. **Restic**: Sistema di backup moderno con deduplicazione
4. **Velero**: Per il backup di cluster Kubernetes (inclusi i volumi persistenti)

## Conclusioni

In questo esempio, hai imparato:

1. Come eseguire il backup di volumi Docker utilizzando diversi metodi
2. Come ripristinare i dati da un backup
3. Come automatizzare il processo di backup e ripristino
4. Best practices per la gestione dei backup in ambienti Docker

Il backup e il ripristino dei volumi sono componenti essenziali di qualsiasi strategia di persistenza dei dati in Docker, garantendo che i dati critici possano essere recuperati in caso di guasti o errori.

## Navigazione

- [⬅️ Esempio precedente: Volumi Condivisi](../03-VolumiCondivisi/README.md)
- [📑 Torna all'indice del modulo](../../README.md)