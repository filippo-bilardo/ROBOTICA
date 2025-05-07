# Scansione delle Vulnerabilità nei Container Docker

La scansione delle vulnerabilità è un processo essenziale per identificare potenziali problemi di sicurezza nelle immagini Docker prima che vengano distribuite in produzione. Questo capitolo esplora gli strumenti e le tecniche per implementare una scansione efficace.

## Importanza della Scansione delle Vulnerabilità

Le immagini Docker sono composte da diversi strati che possono contenere vulnerabilità:

- Sistema operativo di base
- Librerie e dipendenze
- Applicazioni e codice personalizzato

Una scansione regolare permette di:

- Identificare pacchetti vulnerabili
- Valutare il livello di rischio
- Prioritizzare gli aggiornamenti
- Prevenire l'introduzione di vulnerabilità note in produzione

## Strumenti per la Scansione delle Vulnerabilità

### 1. Trivy

Trivy è uno scanner open-source semplice e completo per le vulnerabilità nei container.

```bash
# Installazione di Trivy
docker pull aquasec/trivy

# Scansione di un'immagine
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image nginx:latest
```

**Caratteristiche principali:**
- Facile da usare
- Supporta immagini Docker e file system
- Rileva vulnerabilità in pacchetti OS e dipendenze applicative
- Supporta diversi formati di output (JSON, SARIF, HTML)

### 2. Clair

Clair è uno strumento open-source sviluppato da CoreOS (ora parte di Red Hat) per l'analisi statica delle vulnerabilità nelle immagini container.

```bash
# Esempio di utilizzo con Clair-scanner
clair-scanner --ip <YOUR_LOCAL_IP> --threshold High nginx:latest
```

**Caratteristiche principali:**
- Analisi approfondita dei pacchetti
- Integrazione con registri container
- API per l'integrazione con altri strumenti

### 3. Docker Scan

Docker ha integrato funzionalità di scansione direttamente nel CLI di Docker, in collaborazione con Snyk.

```bash
# Scansione con Docker Scan
docker scan nginx:latest
```

**Caratteristiche principali:**
- Integrazione nativa con Docker CLI
- Powered by Snyk
- Suggerimenti per la correzione

### 4. Anchore Engine

Anchore Engine è una piattaforma open-source per l'ispezione, l'analisi e la certificazione delle immagini container.

```bash
# Esempio di utilizzo con Anchore CLI
anchore-cli image add docker.io/library/nginx:latest
anchore-cli image wait docker.io/library/nginx:latest
anchore-cli image vuln docker.io/library/nginx:latest os
```

**Caratteristiche principali:**
- Analisi approfondita delle immagini
- Politiche personalizzabili
- Integrazione con CI/CD

## Integrazione della Scansione nel Pipeline CI/CD

L'integrazione della scansione delle vulnerabilità nel pipeline CI/CD è fondamentale per identificare i problemi prima che raggiungano l'ambiente di produzione.

### Esempio con GitHub Actions

```yaml
name: Docker Image CI

on: [push, pull_request]

jobs:
  build-and-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build the Docker image
      run: docker build . --file Dockerfile --tag myapp:${{ github.sha }}
    
    - name: Scan the image with Trivy
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'myapp:${{ github.sha }}'
        format: 'table'
        exit-code: '1'
        severity: 'CRITICAL,HIGH'
```

### Esempio con GitLab CI

```yaml
stages:
  - build
  - scan
  - deploy

build:
  stage: build
  script:
    - docker build -t myapp:$CI_COMMIT_SHA .

scan:
  stage: scan
  script:
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image myapp:$CI_COMMIT_SHA
  allow_failure: false

deploy:
  stage: deploy
  script:
    - echo "Deploying..."
  only:
    - master
```

## Gestione delle Vulnerabilità Rilevate

Una volta identificate le vulnerabilità, è importante avere un processo per gestirle:

1. **Classificazione**: Valutare la gravità e l'impatto potenziale.
2. **Prioritizzazione**: Concentrarsi prima sulle vulnerabilità critiche e ad alto rischio.
3. **Correzione**: Aggiornare i pacchetti vulnerabili o cambiare l'immagine base.
4. **Verifica**: Eseguire nuovamente la scansione per confermare che le vulnerabilità siano state risolte.
5. **Documentazione**: Mantenere un registro delle vulnerabilità identificate e delle azioni intraprese.

## Esempio Pratico: Workflow di Scansione

Ecco un esempio di workflow per implementare la scansione delle vulnerabilità nel ciclo di vita dello sviluppo:

1. **Sviluppo locale**:
   ```bash
   # Scansione durante lo sviluppo
   docker build -t myapp:dev .
   trivy image myapp:dev
   ```

2. **Pre-commit**:
   Utilizzare hook pre-commit per eseguire scansioni leggere prima di inviare il codice al repository.

3. **CI/CD**:
   Implementare scansioni automatiche come mostrato negli esempi precedenti.

4. **Registry**:
   Configurare scansioni automatiche nel registry container (Docker Hub, Harbor, ecc.).

5. **Produzione**:
   Implementare scansioni periodiche delle immagini in esecuzione.

## Conclusione

La scansione delle vulnerabilità è un componente critico di una strategia di sicurezza Docker completa. Implementando strumenti di scansione e integrandoli nel pipeline di sviluppo, è possibile identificare e mitigare i rischi prima che possano essere sfruttati.

---

## Navigazione

- [Indice del Modulo](./README.md)
- Precedente: [Best Practice di Sicurezza](./02-BestPractice.md)
- Prossimo: [Isolamento e Privilegi](./04-IsolamentoPrivilegi.md)