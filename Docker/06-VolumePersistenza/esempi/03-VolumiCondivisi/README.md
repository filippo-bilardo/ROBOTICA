# Esempio: Volumi Condivisi tra Container

Questo esempio dimostra come condividere dati tra container Docker utilizzando volumi named.

## Prerequisiti

- Docker installato sul tuo sistema
- Conoscenza di base dei comandi Docker

## Obiettivi

- Creare un volume condiviso tra più container
- Dimostrare la comunicazione tra container attraverso file condivisi
- Comprendere i casi d'uso per la condivisione di dati tra container

## Architettura dell'Esempio

In questo esempio, implementeremo un'architettura semplice con tre container:

1. **Writer**: Un container che scrive dati in un volume condiviso
2. **Processor**: Un container che elabora i dati dal volume condiviso
3. **Reader**: Un container che legge i dati elaborati dal volume condiviso

## Passaggi

### 1. Creazione del Volume Condiviso

Crea un volume named che verrà condiviso tra i container:

```bash
docker volume create shared-data
```

### 2. Creazione dei File di Script

Crea una directory per gli script e i file necessari:

```bash
mkdir -p scripts
```

Crea uno script per il container Writer:

```bash
cat > scripts/writer.sh << EOF
#!/bin/sh

while true; do
  # Genera un dato casuale
  RANDOM_NUMBER=\$(( \$RANDOM % 100 + 1 ))
  TIMESTAMP=\$(date +"%Y-%m-%d %H:%M:%S")
  
  # Scrive il dato nel file condiviso
  echo "\$TIMESTAMP - Numero generato: \$RANDOM_NUMBER" >> /data/raw/numbers.txt
  echo "Scritto: \$TIMESTAMP - Numero generato: \$RANDOM_NUMBER"
  
  # Attende 5 secondi
  sleep 5
done
EOF

chmod +x scripts/writer.sh
```

Crea uno script per il container Processor:

```bash
cat > scripts/processor.sh << EOF
#!/bin/sh

# Crea la directory per i dati elaborati se non esiste
mkdir -p /data/processed

while true; do
  # Verifica se ci sono nuovi dati da elaborare
  if [ -f /data/raw/numbers.txt ]; then
    # Elabora i dati (in questo esempio, calcola la somma e la media)
    TOTAL=0
    COUNT=0
    
    while read line; do
      # Estrae il numero dalla riga
      NUMBER=\$(echo \$line | grep -o '[0-9]\+' | tail -1)
      TOTAL=\$((TOTAL + NUMBER))
      COUNT=\$((COUNT + 1))
    done < /data/raw/numbers.txt
    
    # Calcola la media
    if [ \$COUNT -gt 0 ]; then
      AVERAGE=\$((TOTAL / COUNT))
      TIMESTAMP=\$(date +"%Y-%m-%d %H:%M:%S")
      
      # Scrive i risultati nel file elaborato
      echo "\$TIMESTAMP - Totale: \$TOTAL, Media: \$AVERAGE, Campioni: \$COUNT" > /data/processed/stats.txt
      echo "Elaborato: Totale: \$TOTAL, Media: \$AVERAGE, Campioni: \$COUNT"
    fi
  fi
  
  # Attende 10 secondi
  sleep 10
done
EOF

chmod +x scripts/processor.sh
```

Crea uno script per il container Reader:

```bash
cat > scripts/reader.sh << EOF
#!/bin/sh

while true; do
  # Verifica se ci sono dati elaborati da leggere
  if [ -f /data/processed/stats.txt ]; then
    echo "\n--- Statistiche Correnti ---"
    cat /data/processed/stats.txt
    echo "-------------------------\n"
  else
    echo "In attesa di dati elaborati..."
  fi
  
  # Attende 15 secondi
  sleep 15
done
EOF

chmod +x scripts/reader.sh
```

### 3. Avvio dei Container

Avvia il container Writer:

```bash
docker run -d \
  --name writer \
  -v shared-data:/data \
  -v $(pwd)/scripts:/scripts \
  -w /scripts \
  alpine:latest \
  sh -c "mkdir -p /data/raw && ./writer.sh"
```

Avvia il container Processor:

```bash
docker run -d \
  --name processor \
  -v shared-data:/data \
  -v $(pwd)/scripts:/scripts \
  -w /scripts \
  alpine:latest \
  sh -c "./processor.sh"
```

Avvia il container Reader:

```bash
docker run -d \
  --name reader \
  -v shared-data:/data \
  -v $(pwd)/scripts:/scripts \
  -w /scripts \
  alpine:latest \
  sh -c "./reader.sh"
```

### 4. Monitoraggio dei Log

Visualizza i log dei container per vedere come interagiscono attraverso il volume condiviso:

```bash
# Log del Writer
docker logs -f writer
```

```bash
# Log del Processor
docker logs -f processor
```

```bash
# Log del Reader
docker logs -f reader
```

### 5. Verifica dei Dati Condivisi

Puoi anche eseguire comandi all'interno dei container per verificare i dati condivisi:

```bash
# Verifica i dati raw nel container Writer
docker exec writer cat /data/raw/numbers.txt

# Verifica i dati elaborati nel container Reader
docker exec reader cat /data/processed/stats.txt
```

### 6. Pulizia

Al termine dell'esperimento, ferma e rimuovi i container:

```bash
docker stop writer processor reader
docker rm writer processor reader
```

Se desideri, puoi anche rimuovere il volume condiviso:

```bash
docker volume rm shared-data
```

## Spiegazione

In questo esempio:

1. Abbiamo creato un volume named `shared-data` che viene condiviso tra tre container
2. Il container Writer genera numeri casuali e li scrive in un file nel volume condiviso
3. Il container Processor legge i dati raw, li elabora e scrive i risultati in un altro file nel volume condiviso
4. Il container Reader legge i dati elaborati dal volume condiviso e li visualizza

Questo dimostra come i container possono comunicare e condividere dati attraverso un volume, anche se non sono direttamente connessi tra loro.

## Casi d'Uso Reali per Volumi Condivisi

1. **Pipeline di elaborazione dati**
   - Un container acquisisce dati
   - Un altro container elabora i dati
   - Un terzo container visualizza o archivia i risultati

2. **Sistemi di cache condivisa**
   - Un container genera dati di cache
   - Altri container leggono dalla cache

3. **Sistemi di code**
   - Un container produce messaggi
   - Altri container consumano messaggi

4. **Applicazioni web con storage condiviso**
   - Container di frontend e backend che accedono agli stessi file
   - Upload di file da un container, elaborazione da un altro

## Considerazioni sulla Condivisione di Volumi

### Vantaggi

- Facilita la comunicazione tra container
- Permette di separare le responsabilità tra container
- Supporta architetture modulari

### Sfide

- Potenziali problemi di concorrenza nell'accesso ai file
- Necessità di coordinare l'accesso ai dati condivisi
- Possibili problemi di prestazioni con molti container che accedono allo stesso volume

## Conclusioni

In questo esempio, hai imparato:

1. Come creare e utilizzare un volume condiviso tra più container
2. Come implementare una semplice pipeline di elaborazione dati utilizzando container separati
3. Come i container possono comunicare attraverso file condivisi

I volumi condivisi sono uno strumento potente per implementare architetture modulari e scalabili in Docker, permettendo di separare le responsabilità tra container mantenendo la capacità di condividere dati.

## Navigazione

- [⬅️ Esempio precedente: Bind Mounts](../02-BindMounts/README.md)
- [➡️ Prossimo esempio: Backup e Ripristino](../04-BackupRipristino/README.md)
- [📑 Torna all'indice del modulo](../../README.md)