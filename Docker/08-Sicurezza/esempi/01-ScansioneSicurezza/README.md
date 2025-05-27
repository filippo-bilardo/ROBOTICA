# Scansione di Sicurezza delle Immagini Docker

## Introduzione

In questo esempio pratico, impareremo a utilizzare strumenti per scansionare le immagini Docker alla ricerca di vulnerabilità di sicurezza. La scansione delle vulnerabilità è una pratica essenziale per identificare e mitigare rischi di sicurezza prima che i container raggiungano l'ambiente di produzione.

## Obiettivi

- Installare e utilizzare Docker Scout per la scansione delle vulnerabilità
- Analizzare un'immagine vulnerabile
- Interpretare i risultati della scansione
- Implementare un workflow di sicurezza per le immagini

## Strumenti Utilizzati

### 1. Docker Scout (integrato in Docker Desktop)

Docker Scout è uno strumento integrato che analizza le immagini Docker per identificare vulnerabilità note.

```bash
# Abilitare Docker Scout
docker scout --help

# Scansionare un'immagine
docker scout cves nginx:latest
```

### 2. Trivy (scanner di sicurezza open source)

```bash
# Installare Trivy
sudo apt-get update
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Scansionare un'immagine
trivy image nginx:latest
```

## Esempio Pratico: Analisi di un'Immagine Vulnerabile

### Passo 1: Creare un'Immagine Vulnerabile per Test

```dockerfile
# Dockerfile-vulnerable
FROM ubuntu:18.04

# Installare pacchetti vulnerabili (NON usare in produzione!)
RUN apt-get update && apt-get install -y \
    openssh-server=1:7.6p1-4ubuntu0.1 \
    curl=7.58.0-2ubuntu3.1 \
    && rm -rf /var/lib/apt/lists/*

# Configurazione insicura
USER root
EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
```

```bash
# Costruire l'immagine vulnerabile
docker build -f Dockerfile-vulnerable -t vulnerable-app:latest .
```

### Passo 2: Scansionare con Docker Scout

```bash
# Scansione completa
docker scout cves vulnerable-app:latest

# Scansione con dettagli
docker scout cves --format sarif vulnerable-app:latest > scan-results.sarif

# Visualizzare solo vulnerabilità critiche
docker scout cves --only-severity critical vulnerable-app:latest
```

### Passo 3: Scansionare con Trivy

```bash
# Scansione di base
trivy image vulnerable-app:latest

# Scansione solo per vulnerabilità critiche e alte
trivy image --severity HIGH,CRITICAL vulnerable-app:latest

# Generare report in formato JSON
trivy image --format json --output results.json vulnerable-app:latest

# Scansionare file system locale
trivy fs --security-checks vuln,config .
```

## Interpretazione dei Risultati

### Elementi Chiave di un Report di Vulnerabilità

1. **CVE ID**: Identificatore univoco della vulnerabilità
2. **Severity**: Livello di gravità (LOW, MEDIUM, HIGH, CRITICAL)
3. **Package**: Pacchetto affetto dalla vulnerabilità
4. **Installed Version**: Versione attualmente installata
5. **Fixed Version**: Versione che risolve la vulnerabilità
6. **Description**: Descrizione della vulnerabilità

### Esempio di Output Trivy

```
vulnerable-app:latest (ubuntu 18.04)
========================================
Total: 145 (UNKNOWN: 1, LOW: 85, MEDIUM: 25, HIGH: 29, CRITICAL: 5)

┌───────────────┬────────────────┬──────────┬───────────────────┬───────────────┬─────────────────────────────────┐
│    Library    │ Vulnerability  │ Severity │ Installed Version │ Fixed Version │          Description            │
├───────────────┼────────────────┼──────────┼───────────────────┼───────────────┼─────────────────────────────────┤
│ openssh-server│ CVE-2021-41617 │ HIGH     │ 1:7.6p1-4ubuntu0.1│1:7.6p1-4ubuntu0.7│ OpenSSH 6.2 through 8.x        │
│               │                │          │                   │               │ allows remote attackers to      │
│               │                │          │                   │               │ cause a denial of service...    │
└───────────────┴────────────────┴──────────┴───────────────────┴───────────────┴─────────────────────────────────┘
```

## Automazione della Scansione

### Script di Scansione Automatica

```bash
#!/bin/bash
# scan-security.sh

IMAGE_NAME=$1
THRESHOLD=${2:-HIGH}

if [ -z "$IMAGE_NAME" ]; then
    echo "Uso: $0 <nome-immagine> [soglia-gravità]"
    exit 1
fi

echo "Scansionando $IMAGE_NAME per vulnerabilità di livello $THRESHOLD o superiore..."

# Scansione con Trivy
trivy image --severity $THRESHOLD --exit-code 1 $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo "✅ Nessuna vulnerabilità $THRESHOLD trovata"
    exit 0
else
    echo "❌ Vulnerabilità $THRESHOLD trovate!"
    exit 1
fi
```

### GitHub Actions per CI/CD

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t test-image .
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'test-image'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
```

## Best Practice per la Scansione

### 1. Integrazione nel Pipeline CI/CD

- Eseguire scansioni ad ogni build
- Bloccare il deployment se vengono trovate vulnerabilità critiche
- Generare report automatici

### 2. Gestione delle Vulnerabilità

```bash
# Creare una whitelist per vulnerabilità accettabili
cat > .trivyignore << EOF
# Vulnerabilità accettate per motivi di business
CVE-2021-12345
CVE-2021-67890
EOF

# Usare la whitelist nella scansione
trivy image --ignorefile .trivyignore myapp:latest
```

### 3. Aggiornamento Regolare delle Immagini Base

```dockerfile
# Dockerfile migliorato
FROM ubuntu:22.04  # Usare immagini più recenti

# Aggiornare sempre i pacchetti
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    package1 \
    package2 \
    && rm -rf /var/lib/apt/lists/*

# Multi-stage build per ridurre la superficie di attacco
FROM ubuntu:22.04 as builder
# ... operazioni di build ...

FROM ubuntu:22.04 as runtime
COPY --from=builder /app/binary /app/
USER 1000:1000
```

## Esercizi Pratici

### Esercizio 1: Scansione di Base

1. Scaricare un'immagine popolare (es. nginx, apache, mysql)
2. Eseguire una scansione con Docker Scout
3. Identificare le 3 vulnerabilità più critiche
4. Ricercare le CVE su https://nvd.nist.gov/

### Esercizio 2: Confronto di Immagini

1. Scansionare due versioni diverse della stessa immagine
2. Confrontare i risultati
3. Identificare quale versione è più sicura

### Esercizio 3: Automazione

1. Creare uno script che scansiona tutte le immagini locali
2. Generare un report consolidato
3. Inviare notifiche per vulnerabilità critiche

## Conclusioni

La scansione delle vulnerabilità è un componente essenziale di una strategia di sicurezza dei container. Integrando questi strumenti nel workflow di sviluppo, è possibile:

- Identificare vulnerabilità prima del deployment
- Mantenere un inventario delle dipendenze
- Automatizzare i controlli di sicurezza
- Rispondere rapidamente a nuove minacce

## Risorse Aggiuntive

- [Docker Scout Documentation](https://docs.docker.com/scout/)
- [Trivy Documentation](https://trivy.dev/)
- [NIST National Vulnerability Database](https://nvd.nist.gov/)
- [Common Vulnerability Scoring System](https://www.first.org/cvss/)

## Navigazione

- [⬅️ Torna al modulo Sicurezza](../README.md)
- [➡️ Prossimo esempio: Container Sicuri](../02-ContainerSecure/README.md)
