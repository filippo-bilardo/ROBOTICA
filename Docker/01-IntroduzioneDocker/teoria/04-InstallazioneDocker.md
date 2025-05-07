# Installazione di Docker

In questa sezione, ti guideremo attraverso il processo di installazione di Docker su diversi sistemi operativi. Docker è disponibile per Windows, macOS e varie distribuzioni Linux.

## Requisiti di Sistema

Prima di installare Docker, assicurati che il tuo sistema soddisfi i seguenti requisiti:

### Windows
- Windows 10 64-bit: Pro, Enterprise, o Education (Build 16299 o successiva)
- Attivazione della virtualizzazione nel BIOS
- 4GB di RAM (consigliati 8GB)
- CPU con supporto per la virtualizzazione

### macOS
- macOS 10.14 (Mojave) o versioni successive
- 4GB di RAM (consigliati 8GB)

### Linux
- Kernel Linux 3.10 o versione successiva
- 4GB di RAM (consigliati 8GB)

## Installazione su Windows

### Docker Desktop per Windows

1. Scarica Docker Desktop per Windows dal [sito ufficiale di Docker](https://www.docker.com/products/docker-desktop)
2. Esegui il file di installazione scaricato (Docker Desktop Installer.exe)
3. Segui le istruzioni della procedura guidata di installazione
4. Al termine dell'installazione, avvia Docker Desktop
5. Accetta i termini di servizio quando richiesto
6. Docker si avvierà automaticamente e vedrai l'icona di Docker nella barra delle applicazioni

### Verifica dell'installazione

Per verificare che Docker sia stato installato correttamente, apri un terminale (PowerShell o Command Prompt) ed esegui:

```bash
docker --version
docker run hello-world
```

Se vedi un messaggio di benvenuto dopo il secondo comando, Docker è stato installato correttamente.

## Installazione su macOS

### Docker Desktop per macOS

1. Scarica Docker Desktop per macOS dal [sito ufficiale di Docker](https://www.docker.com/products/docker-desktop)
2. Trascina l'icona di Docker nel tuo folder Applicazioni
3. Avvia Docker dall'icona nelle Applicazioni
4. Accetta i termini di servizio quando richiesto
5. Docker si avvierà automaticamente e vedrai l'icona di Docker nella barra dei menu

### Verifica dell'installazione

Per verificare che Docker sia stato installato correttamente, apri un terminale ed esegui:

```bash
docker --version
docker run hello-world
```

Se vedi un messaggio di benvenuto dopo il secondo comando, Docker è stato installato correttamente.

## Installazione su Linux

Le istruzioni variano a seconda della distribuzione Linux. Di seguito sono riportate le istruzioni per le distribuzioni più comuni.

### Ubuntu

1. Aggiorna gli indici dei pacchetti:

```bash
sudo apt-get update
```

2. Installa i pacchetti necessari per consentire ad apt di utilizzare un repository HTTPS:

```bash
sudo apt-get install apt-transport-https ca-certificates curl gnupg lsb-release
```

3. Aggiungi la chiave GPG ufficiale di Docker:

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

4. Configura il repository stabile:

```bash
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

5. Aggiorna nuovamente gli indici dei pacchetti:

```bash
sudo apt-get update
```

6. Installa Docker Engine:

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

7. Verifica che Docker sia installato correttamente:

```bash
sudo docker run hello-world
```

### CentOS/RHEL

1. Installa i pacchetti necessari:

```bash
sudo yum install -y yum-utils
```

2. Configura il repository Docker:

```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

3. Installa Docker Engine:

```bash
sudo yum install docker-ce docker-ce-cli containerd.io
```

4. Avvia e abilita Docker:

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

5. Verifica che Docker sia installato correttamente:

```bash
sudo docker run hello-world
```

## Configurazione Post-Installazione

### Eseguire Docker senza sudo (Linux)

Per eseguire Docker senza utilizzare sudo, aggiungi il tuo utente al gruppo docker:

```bash
sudo usermod -aG docker $USER
```

Esci e rientra nella sessione per applicare le modifiche.

### Configurazione di Docker Desktop

Docker Desktop offre diverse opzioni di configurazione:

1. **Risorse**: Puoi allocare CPU, memoria, spazio su disco e altre risorse a Docker
2. **File sharing**: Configura quali cartelle possono essere montate nei container
3. **Network**: Configura le impostazioni di rete
4. **Proxy**: Configura le impostazioni del proxy se necessario
5. **Docker Engine**: Modifica le impostazioni del demone Docker

Per accedere a queste impostazioni, fai clic sull'icona di Docker nella barra delle applicazioni (Windows) o nella barra dei menu (macOS) e seleziona "Settings" o "Preferences".

## Risoluzione dei Problemi Comuni

### Errore "Cannot connect to the Docker daemon"

Questo errore può verificarsi se il demone Docker non è in esecuzione. Prova a:

- Riavviare Docker Desktop (Windows/macOS)
- Riavviare il servizio Docker (Linux): `sudo systemctl restart docker`

### Errore di virtualizzazione

Se ricevi errori relativi alla virtualizzazione su Windows:

1. Assicurati che la virtualizzazione sia abilitata nel BIOS
2. Verifica che Hyper-V sia abilitato (Windows 10 Pro/Enterprise/Education)
3. Per Windows Home, assicurati che WSL 2 sia installato e configurato

### Problemi di spazio su disco

Docker può occupare molto spazio su disco nel tempo. Per liberare spazio:

```bash
docker system prune -a
```

Questo comando rimuoverà tutte le immagini non utilizzate, i container fermati, le reti non utilizzate e la cache di build.

## Conclusione

Hai installato con successo Docker sul tuo sistema. Ora sei pronto per iniziare a utilizzare i container Docker per sviluppare, testare e distribuire le tue applicazioni.

Nella prossima sezione, esploreremo i comandi base della Docker CLI per iniziare a lavorare con i container.

## Navigazione
- [⬅️ Architettura di Docker](./03-ArchitetturaDocker.md)
- [➡️ Docker CLI: comandi base](./05-DockerCLI.md)
- [📑 Torna all'indice](../README.md)