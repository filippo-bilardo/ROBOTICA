# Configurazione dell'ambiente di sviluppo

## Introduzione
Un ambiente di sviluppo ben configurato può aumentare significativamente la tua produttività come programmatore Python. In questa guida, esploreremo diverse opzioni per configurare un ambiente di sviluppo efficiente per Python, dai semplici editor di testo agli ambienti di sviluppo integrati (IDE) più complessi.

## Editor di testo vs IDE

### Editor di testo
Gli editor di testo sono programmi leggeri che permettono di modificare file di codice. Molti editor moderni offrono funzionalità come l'evidenziazione della sintassi, l'autocompletamento e l'integrazione con strumenti esterni.

**Vantaggi**:
- Leggeri e veloci da avviare
- Spesso personalizzabili con plugin
- Adatti per progetti piccoli o singoli script

**Svantaggi**:
- Meno funzionalità integrate rispetto agli IDE
- Potrebbero richiedere configurazione aggiuntiva per funzionalità avanzate

### IDE (Integrated Development Environment)
Gli IDE sono ambienti completi che includono editor, debugger, strumenti di analisi del codice, gestione dei progetti e molto altro in un unico pacchetto.

**Vantaggi**:
- Funzionalità complete per lo sviluppo
- Debugging integrato
- Strumenti di refactoring e analisi del codice
- Ideali per progetti complessi

**Svantaggi**:
- Più pesanti in termini di risorse di sistema
- Curva di apprendimento più ripida
- Potrebbero essere eccessivi per progetti semplici

## Opzioni popolari

### Editor di testo

#### 1. Visual Studio Code (VS Code)
Uno degli editor più popolari, gratuito e open-source, sviluppato da Microsoft.

**Installazione**:
- Scarica da [https://code.visualstudio.com/](https://code.visualstudio.com/)
- Installa l'estensione "Python" dalla marketplace di VS Code

**Configurazione per Python**:
- Installa l'estensione Python
- Seleziona l'interprete Python (Ctrl+Shift+P, poi "Python: Select Interpreter")
- Installa estensioni aggiuntive come "Pylint" per l'analisi del codice

#### 2. Sublime Text
Editor leggero e veloce con molte funzionalità.

**Installazione**:
- Scarica da [https://www.sublimetext.com/](https://www.sublimetext.com/)
- Installa Package Control
- Aggiungi il pacchetto "Anaconda" per il supporto Python

#### 3. Atom
Editor gratuito e personalizzabile sviluppato da GitHub.

**Installazione**:
- Scarica da [https://atom.io/](https://atom.io/)
- Installa pacchetti come "atom-python-run" e "linter-pylint"

### IDE

#### 1. PyCharm
Uno degli IDE più completi per Python, sviluppato da JetBrains.

**Versioni**:
- Community Edition (gratuita)
- Professional Edition (a pagamento, con funzionalità aggiuntive)

**Installazione**:
- Scarica da [https://www.jetbrains.com/pycharm/](https://www.jetbrains.com/pycharm/)
- Segui la procedura guidata di installazione

**Caratteristiche principali**:
- Debugging avanzato
- Refactoring intelligente
- Supporto per web development, database, e controllo versione
- Completamento del codice intelligente

#### 2. Spyder
IDE specifico per la data science, incluso nella distribuzione Anaconda.

**Installazione**:
- Installa Anaconda da [https://www.anaconda.com/products/individual](https://www.anaconda.com/products/individual)
- Spyder è incluso, oppure può essere installato con `conda install spyder`

#### 3. IDLE
L'IDE semplice incluso con Python, utile per principianti.

**Installazione**:
- Già incluso con l'installazione standard di Python
- Avvialo cercando "IDLE" nel menu Start (Windows) o usando il comando `idle` o `idle3` nel terminale

## Ambienti virtuali

Gli ambienti virtuali sono strumenti essenziali per gestire le dipendenze dei progetti Python. Permettono di creare ambienti isolati con specifiche versioni di pacchetti, evitando conflitti tra progetti diversi.

### venv (modulo standard)

**Creazione di un ambiente virtuale**:
```bash
# Windows
python -m venv myenv

# macOS/Linux
python3 -m venv myenv
```

**Attivazione**:
```bash
# Windows
myenv\Scripts\activate

# macOS/Linux
source myenv/bin/activate
```

**Disattivazione**:
```bash
deactivate
```

### Conda (con Anaconda o Miniconda)

**Creazione di un ambiente**:
```bash
conda create --name myenv python=3.8
```

**Attivazione**:
```bash
# Windows
conda activate myenv

# macOS/Linux
conda activate myenv
```

**Disattivazione**:
```bash
conda deactivate
```

## Gestione dei pacchetti

### pip
Il gestore di pacchetti standard di Python.

**Installazione di un pacchetto**:
```bash
pip install nome_pacchetto
```

**Installazione di una versione specifica**:
```bash
pip install nome_pacchetto==1.0.0
```

**Elenco dei pacchetti installati**:
```bash
pip list
```

**Creazione di un file requirements.txt**:
```bash
pip freeze > requirements.txt
```

**Installazione da requirements.txt**:
```bash
pip install -r requirements.txt
```

## Configurazione di Git (opzionale ma consigliato)

Git è un sistema di controllo versione essenziale per lo sviluppo software.

**Installazione**:
- Windows: Scarica da [https://git-scm.com/](https://git-scm.com/)
- macOS: Installa con Homebrew: `brew install git`
- Linux: `sudo apt install git` (Ubuntu/Debian) o equivalente

**Configurazione base**:
```bash
git config --global user.name "Il tuo nome"
git config --global user.email "tua.email@esempio.com"
```

**Integrazione con VS Code o PyCharm**:
Entrambi gli ambienti hanno supporto integrato per Git.

## Conclusione

La scelta dell'ambiente di sviluppo dipende dalle tue preferenze personali e dalle esigenze del progetto. Per i principianti, IDLE o VS Code sono ottime opzioni per iniziare. Man mano che acquisisci esperienza, potresti voler esplorare IDE più avanzati come PyCharm.

Indipendentemente dall'ambiente scelto, ti consigliamo di familiarizzare con gli ambienti virtuali e la gestione dei pacchetti, poiché sono strumenti essenziali nel flusso di lavoro di sviluppo Python.

Nella prossima guida, scriveremo il nostro primo programma Python: il classico "Hello, World!".

---

[Indice dell'Esercitazione](../README.md) | [Precedente: Installazione di Python](./02_installazione_python.md) | [Prossimo: Il tuo primo programma: Hello, World!](./04_hello_world.md)