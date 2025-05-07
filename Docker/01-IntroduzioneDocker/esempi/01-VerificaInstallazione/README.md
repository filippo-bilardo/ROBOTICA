# Verifica dell'Installazione di Docker

Questo esempio ti guiderà attraverso i passaggi per verificare che Docker sia installato correttamente sul tuo sistema.

## Obiettivo

Verificare che Docker Engine sia installato e funzionante sul tuo sistema.

## Prerequisiti

- Docker installato sul tuo sistema (seguendo le istruzioni nella guida [Installazione di Docker](../../teoria/04-InstallazioneDocker.md))

## Passaggi

### 1. Verifica della versione di Docker

Apri un terminale (o prompt dei comandi su Windows) ed esegui il seguente comando:

```bash
docker --version
```

Dovresti vedere un output simile a questo:

```
Docker version 20.10.14, build a224086
```

L'output potrebbe variare a seconda della versione di Docker installata sul tuo sistema.

### 2. Verifica del funzionamento di Docker

Esegui il comando "hello-world" per verificare che Docker possa scaricare immagini ed eseguire container:

```bash
docker run hello-world
```

Se Docker è configurato correttamente, vedrai un messaggio di benvenuto che conferma che l'installazione funziona correttamente.

### 3. Verifica delle informazioni di sistema

Per visualizzare informazioni dettagliate sul tuo ambiente Docker, esegui:

```bash
docker info
```

Questo comando mostrerà informazioni sul numero di container e immagini, la configurazione di storage, le impostazioni di rete e altre informazioni utili.

## Risoluzione dei problemi comuni

### Docker non è in esecuzione

Se ricevi un errore come "Cannot connect to the Docker daemon", potrebbe significare che il servizio Docker non è in esecuzione. Prova a riavviare il servizio:

- **Windows**: Riavvia Docker Desktop
- **macOS**: Riavvia Docker Desktop
- **Linux**: Esegui `sudo systemctl restart docker`

### Permessi insufficienti

Su Linux, potresti ricevere un errore di permessi. In questo caso, assicurati che il tuo utente faccia parte del gruppo "docker":

```bash
sudo usermod -aG docker $USER
```

Dopo aver eseguito questo comando, disconnettiti e riconnettiti per applicare le modifiche.

## Conclusione

Se tutti i comandi sopra hanno funzionato correttamente, congratulazioni! Docker è installato e funzionante sul tuo sistema. Ora sei pronto per passare all'esempio successivo, dove eseguirai il tuo primo container Docker.

## Navigazione
- [📑 Indice del Corso](../../../README.md)
- [📑 Indice del Modulo](../../README.md)
- [➡️ Prossimo Esempio: Primo Container](../02-PrimoContainer/README.md)