# Esempio 3: Interazione con Container

## Obiettivi
- Imparare a interagire con container in esecuzione
- Padroneggiare l'accesso alla shell dei container
- Comprendere il trasferimento di file tra host e container
- Gestire porte e networking dei container

## Prerequisiti
- Esempio 1 e 2 completati
- Docker installato e funzionante
- Familiarità con comandi Linux di base

## Parte 1: Accesso alla Shell del Container

### 1.1 Container Interattivo con Shell

```bash
# Avviare un container Ubuntu in modalità interattiva
docker run -it --name ubuntu-interattivo ubuntu:latest /bin/bash

# All'interno del container
whoami
pwd
ls -la
echo "Sono dentro un container Docker!" > /tmp/messaggio.txt
cat /tmp/messaggio.txt
exit
```

### 1.2 Accesso a Container già in Esecuzione

```bash
# Avviare un container in background
docker run -d --name nginx-web nginx:latest

# Verificare che sia in esecuzione
docker ps

# Accedere al container in esecuzione
docker exec -it nginx-web /bin/bash

# Esplorare il container
ps aux
ls /usr/share/nginx/html/
cat /usr/share/nginx/html/index.html
exit

# Pulire
docker stop nginx-web   # Ferma il container
docker rm nginx-web     # Rimuove il container
```

## Parte 2: Trasferimento File

### 2.1 Copiare File da Host a Container

```bash
# Creare un file di test sull'host
echo "File dall'host Docker" > host-file.txt

# Avviare un container
docker run -d --name file-container ubuntu:latest sleep 3600

# Copiare file dall'host al container
docker cp host-file.txt file-container:/tmp/

# Verificare la copia
docker exec file-container cat /tmp/host-file.txt

# Pulire il file locale
rm host-file.txt
```

### 2.2 Copiare File da Container a Host

```bash
# Creare un file nel container
docker exec file-container sh -c "echo 'File dal container' > /tmp/container-file.txt"

# Copiare dal container all'host
docker cp file-container:/tmp/container-file.txt ./

# Verificare la copia
cat container-file.txt

# Pulire
rm container-file.txt
docker stop file-container
docker rm file-container
```

## Parte 3: Gestione Porte e Networking

### 3.1 Esposizione Porte

```bash
# Avviare un server web con porta esposta
docker run -d --name web-server -p 8080:80 nginx:latest

# Verificare l'esposizione della porta
docker port web-server

# Testare la connessione
curl http://localhost:8080

# Visualizzare i log del server
docker logs web-server

# Fermare il container
docker stop web-server
docker rm web-server
```

### 3.2 Mapping Porte Multiple

```bash
# Container con porte multiple
docker run -d --name multi-port \
  -p 8080:80 \
  -p 4433:443 \
  nginx:latest

# Verificare le porte mappate
docker port multi-port

# Cleanup
docker stop multi-port
docker rm multi-port
```

## Parte 4: Variabili d'Ambiente

### 4.1 Passaggio Variabili d'Ambiente

```bash
# Container con variabili d'ambiente
docker run -d --name env-container \
  -e MYSQL_ROOT_PASSWORD=mypassword \
  -e MYSQL_DATABASE=testdb \
  mysql:8.0

# Verificare le variabili d'ambiente
docker exec env-container env | grep MYSQL

# Pulire
docker stop env-container
docker rm env-container
```

### 4.2 File di Variabili d'Ambiente

```bash
# Creare un file .env
cat > app.env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:pass@localhost/db
DEBUG=false
EOF

# Usare il file .env
docker run -d --name node-app \
  --env-file app.env \
  -p 3000:3000 \
  node:16-alpine sleep 3600

# Verificare le variabili
docker exec node-app env

# Pulire
rm app.env
docker stop node-app
docker rm node-app
```

## Parte 5: Mounting e Volumi

### 5.1 Bind Mount

```bash
# Creare una directory locale
mkdir -p ./html-content
echo "<h1>Contenuto dall'Host</h1>" > ./html-content/index.html

# Montare la directory nel container
docker run -d --name bind-mount-web \
  -p 8080:80 \
  -v $(pwd)/html-content:/usr/share/nginx/html \
  nginx:latest

# Testare il contenuto
curl http://localhost:8080

# Modificare il contenuto dall'host
echo "<h1>Contenuto Aggiornato!</h1>" > ./html-content/index.html

# Verificare l'aggiornamento automatico
curl http://localhost:8080

# Pulire
docker stop bind-mount-web
docker rm bind-mount-web
rm -rf ./html-content
```

## Parte 6: Script di Automazione Avanzata

### 6.1 Script di Gestione Container Interattivo

```bash
# Creare script di gestione
cat > gestione-container.sh << 'EOF'
#!/bin/bash

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Funzione per creare container interattivo
create_interactive_container() {
    local image=$1
    local name=$2
    
    print_message "Creando container interattivo: $name"
    docker run -it --name "$name" "$image" /bin/bash
}

# Funzione per entrare in container esistente
enter_container() {
    local name=$1
    
    if docker ps -q -f name="$name" | grep -q .; then
        print_message "Accedendo al container: $name"
        docker exec -it "$name" /bin/bash
    else
        print_error "Container $name non trovato o non in esecuzione"
        return 1
    fi
}

# Funzione per copiare file
copy_file() {
    local source=$1
    local destination=$2
    local container=$3
    
    if [[ "$source" == *":"* ]]; then
        # Copia da container a host
        print_message "Copiando da container a host: $source -> $destination"
        docker cp "$source" "$destination"
    else
        # Copia da host a container
        print_message "Copiando da host a container: $source -> $container:$destination"
        docker cp "$source" "$container:$destination"
    fi
}

# Menu principale
show_menu() {
    echo -e "\n${BLUE}=== Gestione Container Interattiva ===${NC}"
    echo "1. Creare container interattivo"
    echo "2. Entrare in container esistente"
    echo "3. Copiare file host -> container"
    echo "4. Copiare file container -> host"
    echo "5. Mostrare container attivi"
    echo "6. Mostrare tutte le immagini"
    echo "7. Esci"
    echo -n "Scegli un'opzione: "
}

# Loop principale
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1)
            echo -n "Inserisci il nome dell'immagine: "
            read -r image
            echo -n "Inserisci il nome del container: "
            read -r name
            create_interactive_container "$image" "$name"
            ;;
        2)
            echo -n "Inserisci il nome del container: "
            read -r name
            enter_container "$name"
            ;;
        3)
            echo -n "Percorso file sull'host: "
            read -r source
            echo -n "Percorso destinazione nel container: "
            read -r destination
            echo -n "Nome del container: "
            read -r container
            copy_file "$source" "$destination" "$container"
            ;;
        4)
            echo -n "Percorso nel container (container:percorso): "
            read -r source
            echo -n "Percorso destinazione sull'host: "
            read -r destination
            copy_file "$source" "$destination"
            ;;
        5)
            print_message "Container attivi:"
            docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
            ;;
        6)
            print_message "Immagini disponibili:"
            docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
            ;;
        7)
            print_message "Arrivederci!"
            exit 0
            ;;
        *)
            print_error "Opzione non valida"
            ;;
    esac
done
EOF

chmod +x gestione-container.sh

# Eseguire lo script
# ./gestione-container.sh
```

## Esercizi Pratici

### Esercizio 1: Container Web Personalizzato
1. Creare un container nginx
2. Copiare un file HTML personalizzato
3. Esporre su porta 8080
4. Verificare il funzionamento

### Esercizio 2: Database Temporaneo
1. Avviare un container MySQL con password
2. Accedere alla shell del database
3. Creare una tabella di test
4. Inserire dati
5. Fare backup del database

### Esercizio 3: Sviluppo con Bind Mount
1. Creare una directory di sviluppo
2. Montare la directory in un container Node.js
3. Modificare i file dall'host
4. Verificare le modifiche nel container

## Verifica Conoscenze

### Quiz Rapido
1. Quale comando permette di accedere a un container in esecuzione?
2. Come si copia un file dall'host al container?
3. Qual è la differenza tra `-p` e `-P`?
4. Come si passano variabili d'ambiente a un container?

### Soluzioni
1. `docker exec -it container_name /bin/bash`
2. `docker cp file.txt container_name:/path/`
3. `-p` specifica il mapping, `-P` mappa automaticamente
4. Con `-e VARNAME=value` o `--env-file`

## Troubleshooting Comune

### Problema: Container non risponde
```bash
# Verificare lo stato
docker ps -a

# Controllare i log
docker logs container_name

# Riavviare se necessario
docker restart container_name
```

### Problema: Porta già in uso
```bash
# Verificare porte in uso
netstat -tulpn | grep :8080

# Usare porta diversa
docker run -p 8081:80 nginx
```

### Problema: File non copiato
```bash
# Verificare percorso nel container
docker exec container ls -la /path/

# Controllare permessi
docker exec container ls -la /path/to/parent/
```

## Pulizia Finale

```bash
# Rimuovere script
rm -f gestione-container.sh

# Fermare tutti i container del modulo
docker stop $(docker ps -q --filter "name=*container*" --filter "name=*web*") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=*container*" --filter "name=*web*") 2>/dev/null || true

echo "✅ Esempio 3 completato con successo!"
```

## Prossimi Passi
- Completare l'Esempio 4: Logging e Monitoraggio
- Passare al Modulo 3: Gestione Immagini
- Praticare con i progetti integrativi

---

**Nota**: Questo esempio introduce concetti fondamentali per l'interazione con i container Docker. Padroneggiare questi comandi è essenziale per lo sviluppo e il debugging delle applicazioni containerizzate.
