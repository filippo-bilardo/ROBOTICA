# Multi-stage Builds

## Descrizione

Questa esercitazione ti insegnerà come utilizzare i multi-stage builds per creare immagini Docker ottimizzate. Imparerai a separare gli ambienti di build da quelli di runtime, riducendo drasticamente le dimensioni delle immagini finali.

## Indice degli Argomenti Teorici

1. [Concetti di Multi-stage Build](./teoria/01-ConcettiMultiStage.md)
2. [Ottimizzazione delle Immagini](./teoria/02-OttimizzazioneImmagini.md)
3. [Pattern Comuni](./teoria/03-PatternComuni.md)
4. [Gestione degli Artefatti](./teoria/04-GestioneArtefatti.md)
5. [Troubleshooting Multi-stage](./teoria/05-TroubleshootingMultiStage.md)

## Esercitazioni Pratiche

Nella cartella [esempi](./esempi/) troverai una serie di esercitazioni pratiche numerate:

1. [01-BaseMultiStage](./esempi/01-BaseMultiStage/) - Il tuo primo multi-stage build
2. [02-ApplicazioneGo](./esempi/02-ApplicazioneGo/) - Ottimizza un'applicazione Go
3. [03-ApplicazioneJava](./esempi/03-ApplicazioneJava/) - Build di applicazioni Java
4. [04-FrontendReact](./esempi/04-FrontendReact/) - Build di applicazioni React
5. [05-DistrolessImages](./esempi/05-DistrolessImages/) - Utilizzo di immagini distroless

## Progetto Integrativo Avanzato

**Progetto: Pipeline di Build Completa**
- Applicazione full-stack (frontend + backend + database)
- Multi-stage build per ogni componente
- Ottimizzazione massima delle dimensioni
- Implementazione di security scanning
- Documentation automatica del processo

## Esercizi di Autovalutazione

### Sfide Pratiche
1. **Sfida Dimensioni**: Riduci un'immagine di almeno il 70%
2. **Sfida Performance**: Ottimizza i tempi di build
3. **Sfida Sicurezza**: Implementa scansione vulnerabilità nel build

### Checklist Avanzata
- [ ] Implemento multi-stage build complessi
- [ ] Ottimizo cache e layer sharing
- [ ] Gestisco segreti nei build in modo sicuro
- [ ] Implemento build condizionali per diversi ambienti
- [ ] Utilizzo BuildKit per funzionalità avanzate

## Approfondimenti Teorici

### Pattern Avanzati
- **Builder Pattern**: Separazione build/runtime
- **Scratch Images**: Immagini minimali
- **Distroless**: Sicurezza massima
- **Multi-architecture**: Build cross-platform

### Tecniche di Ottimizzazione
- Layer caching strategies
- Dependency management
- Security hardening
- Size optimization techniques

## Obiettivi di Apprendimento

Al termine di questa esercitazione sarai in grado di:
- Progettare multi-stage build complessi
- Ottimizzare drasticamente le dimensioni delle immagini
- Implementare pattern di sicurezza avanzati
- Gestire build per diversi ambienti (dev/staging/prod)
- Utilizzare tooling avanzato come BuildKit

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Dockerfile](../04-Dockerfile/README.md)
- [➡️ Docker Compose](../04-DockerCompose/README.md)
