# Installazione di Python

## Introduzione
Prima di iniziare a programmare in Python, è necessario installare l'interprete Python sul proprio sistema. In questa guida, vedremo come installare Python su diversi sistemi operativi e verificare che l'installazione sia avvenuta correttamente.

## Scelta della versione
Come menzionato nella guida precedente, Python ha due versioni principali: Python 2 e Python 3. Poiché Python 2 è stato ufficialmente abbandonato, in questo corso utilizzeremo Python 3.

Al momento della stesura di questa guida, l'ultima versione stabile di Python è la 3.10, ma qualsiasi versione 3.6 o successiva andrà bene per seguire questo corso.

## Installazione su Windows

1. **Scarica l'installer**:
   - Visita il sito ufficiale di Python: [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - Clicca sul pulsante "Download Python 3.x.x" (dove x.x rappresenta la versione più recente)

2. **Esegui l'installer**:
   - Apri il file scaricato
   - **IMPORTANTE**: Seleziona la casella "Add Python 3.x to PATH" prima di procedere
   - Clicca su "Install Now" per un'installazione standard

3. **Verifica l'installazione**:
   - Apri il Prompt dei comandi (cmd) o PowerShell
   - Digita `python --version` e premi Invio
   - Dovresti vedere la versione di Python installata, ad esempio: `Python 3.10.0`

## Installazione su macOS

### Metodo 1: Installer ufficiale
1. **Scarica l'installer**:
   - Visita [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - Scarica la versione più recente per macOS

2. **Esegui l'installer**:
   - Apri il file .pkg scaricato e segui le istruzioni

### Metodo 2: Homebrew (consigliato per utenti avanzati)
1. **Installa Homebrew** (se non è già installato):
   - Apri il Terminale
   - Incolla il seguente comando e premi Invio:
     ```
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```

2. **Installa Python**:
   - Nel Terminale, digita: `brew install python`

3. **Verifica l'installazione**:
   - Nel Terminale, digita: `python3 --version`
   - Dovresti vedere la versione installata

## Installazione su Linux

La maggior parte delle distribuzioni Linux moderne include già Python 3. Per verificarlo:

1. **Apri il Terminale**
2. **Verifica se Python 3 è installato**:
   - Digita: `python3 --version`

Se Python 3 non è installato o se desideri una versione più recente:

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install python3 python3-pip
```

### Fedora:
```bash
sudo dnf install python3 python3-pip
```

### Arch Linux:
```bash
sudo pacman -S python python-pip
```

## Verifica dell'installazione

Dopo aver installato Python, è importante verificare che l'installazione sia avvenuta correttamente:

1. **Apri il terminale o prompt dei comandi**
2. **Verifica la versione di Python**:
   - Su Windows (se hai selezionato "Add Python to PATH"): `python --version`
   - Su macOS/Linux: `python3 --version`
3. **Testa l'interprete interattivo**:
   - Su Windows: digita `python` e premi Invio
   - Su macOS/Linux: digita `python3` e premi Invio
   - Dovresti vedere il prompt interattivo di Python (`>>>`) dove puoi digitare comandi Python
   - Prova a digitare `print("Hello, Python!")` e premi Invio
   - Per uscire dall'interprete, digita `exit()` o premi Ctrl+Z su Windows o Ctrl+D su macOS/Linux

## Installazione di pip

Pip è il gestore di pacchetti di Python che ti permette di installare e gestire librerie e pacchetti aggiuntivi. Nelle versioni recenti di Python, pip viene installato automaticamente.

Per verificare se pip è installato:

- Su Windows: `pip --version`
- Su macOS/Linux: `pip3 --version`

Se pip non è installato, puoi installarlo seguendo le istruzioni sul [sito ufficiale di pip](https://pip.pypa.io/en/stable/installation/).

## Conclusione

Ora che hai installato Python sul tuo sistema, sei pronto per iniziare a programmare! Nella prossima guida, vedremo come configurare un ambiente di sviluppo efficiente per scrivere codice Python.

---

[Indice dell'Esercitazione](../README.md) | [Precedente: Cos'è Python](./01_cosa_e_python.md) | [Prossimo: Configurazione dell'ambiente di sviluppo](./03_configurazione_ambiente.md)