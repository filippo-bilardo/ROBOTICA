# Esempio: Utilizzo dei Bind Mounts in Docker

Questo esempio dimostra come utilizzare i bind mounts in Docker per condividere file e directory tra l'host e i container.

## Prerequisiti

- Docker installato sul tuo sistema
- Conoscenza di base dei comandi Docker

## Obiettivi

- Comprendere il concetto di bind mounts in Docker
- Utilizzare bind mounts per condividere file tra host e container
- Esplorare casi d'uso comuni per i bind mounts

## Passaggi

### 1. Preparazione della Directory sull'Host

Crea una directory sul tuo sistema host che verrà montata nel container:

```bash
# Crea una directory per il sito web
mkdir -p ./html

# Crea un file HTML di esempio
cat > ./html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Esempio Bind Mount</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #2c3e50;
        }
        .container {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <h1>Esempio di Bind Mount in Docker</h1>
    <div class="container">
        <p>Questo file è servito da un container Nginx, ma è memorizzato sul filesystem dell'host.</p>
        <p>Puoi modificare questo file sull'host e vedere le modifiche immediatamente nel browser!</p>
        <p><strong>Ora:</strong> <span id="datetime"></span></p>
    </div>
    <script>
        document.getElementById('datetime').textContent = new Date().toLocaleString();
    </script>
</body>
</html>
EOF
```

### 2. Avvio di un Container Nginx con Bind Mount

Avvia un container Nginx montando la directory `html` dell'host nella directory `/usr/share/nginx/html` del container:

```bash
docker run -d \
  --name nginx-server \
  -p 8080:80 \
  -v $(pwd)/html:/usr/share/nginx/html \
  nginx:alpine
```

### 3. Accesso al Sito Web

Apri un browser e naviga a:

```
http://localhost:8080
```

Dovresti vedere la pagina HTML che hai creato nel passaggio 1.

### 4. Modifica del File sull'Host

Modifica il file `html/index.html` sul tuo sistema host:

```bash
cat > ./html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Esempio Bind Mount - Modificato</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            background-color: #f0f8ff;
        }
        h1 {
            color: #3498db;
        }
        .container {
            border: 1px solid #bdc3c7;
            padding: 20px;
            border-radius: 5px;
            background-color: #ffffff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .highlight {
            background-color: #ffffcc;
            padding: 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <h1>Esempio di Bind Mount in Docker - File Modificato!</h1>
    <div class="container">
        <p>Questo file è stato <span class="highlight">modificato</span> sul sistema host!</p>
        <p>Le modifiche sono immediatamente visibili nel container senza necessità di riavvio.</p>
        <p>Questo è il potere dei bind mounts in Docker!</p>
        <p><strong>Ora:</strong> <span id="datetime"></span></p>
    </div>
    <script>
        document.getElementById('datetime').textContent = new Date().toLocaleString();
    </script>
</body>
</html>
EOF
```

### 5. Verifica delle Modifiche

Aggiorna la pagina nel browser (http://localhost:8080). Dovresti vedere le modifiche che hai appena fatto al file HTML, senza necessità di riavviare il container.

### 6. Esplorazione del Container

Esegui un comando all'interno del container per verificare che i file siano effettivamente montati:

```bash
docker exec nginx-server ls -la /usr/share/nginx/html
```

### 7. Montaggio in Sola Lettura

Puoi anche montare directory in modalità di sola lettura per impedire che il container modifichi i file dell'host:

```bash
# Ferma e rimuovi il container esistente
docker stop nginx-server
docker rm nginx-server

# Avvia un nuovo container con montaggio in sola lettura
docker run -d \
  --name nginx-server-readonly \
  -p 8080:80 \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  nginx:alpine
```

## Spiegazione

In questo esempio:

1. Abbiamo creato una directory e un file HTML sul sistema host
2. Abbiamo avviato un container Nginx montando la directory dell'host nel container
3. Abbiamo modificato il file sull'host e verificato che le modifiche sono immediatamente visibili nel container
4. Abbiamo dimostrato come montare directory in modalità di sola lettura

I bind mounts sono particolarmente utili durante lo sviluppo, poiché permettono di modificare il codice sull'host e vedere immediatamente i risultati nel container senza necessità di ricostruire l'immagine o riavviare il container.

## Casi d'Uso Comuni per i Bind Mounts

1. **Sviluppo di applicazioni web**
   - Montaggio del codice sorgente nel container
   - Modifiche immediate senza ricostruzione dell'immagine

2. **Configurazione esterna**
   - Montaggio di file di configurazione dall'host
   - Facile modifica della configurazione senza accedere al container

3. **Log persistenti**
   - Montaggio di directory di log dall'host
   - Accesso ai log anche dopo l'eliminazione del container

4. **Condivisione di dati tra host e container**
   - Importazione/esportazione di dati
   - Elaborazione di file locali

## Differenze tra Bind Mounts e Volumi Named

| Caratteristica | Bind Mounts | Volumi Named |
|----------------|-------------|-------------|
| Posizione | Qualsiasi percorso sull'host | Gestito da Docker (/var/lib/docker/volumes/) |
| Portabilità | Dipende dal filesystem dell'host | Migliore portabilità tra host |
| Condivisione | Tra host e container | Principalmente tra container |
| Caso d'uso ideale | Sviluppo, configurazione | Dati persistenti, produzione |
| Backup | Richiede accesso all'host | Più semplice con comandi Docker |

## Conclusioni

In questo esempio, hai imparato:

1. Come utilizzare i bind mounts per condividere file tra l'host e i container
2. Come le modifiche ai file sull'host sono immediatamente visibili nel container
3. Come montare directory in modalità di sola lettura
4. Quali sono i casi d'uso comuni per i bind mounts

I bind mounts sono uno strumento potente per lo sviluppo e per scenari in cui è necessario un accesso diretto ai file dell'host.

## Navigazione

- [⬅️ Esempio precedente: Volumi Named](../01-VolumiNamed/README.md)
- [➡️ Prossimo esempio: Volumi Condivisi](../03-VolumiCondivisi/README.md)
- [📑 Torna all'indice del modulo](../../README.md)