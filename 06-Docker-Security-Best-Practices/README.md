# Esercitazione 6: Best Practice per la Sicurezza Docker

La sicurezza è fondamentale quando si utilizzano i container in produzione (e non solo). In questa esercitazione, esploreremo le best practice per mettere in sicurezza i vari componenti dell'ecosistema Docker. Impareremo a configurare in modo sicuro il Docker Daemon, a scansionare le immagini per individuare vulnerabilità note, a rafforzare la sicurezza dei container durante l'esecuzione e a gestire in modo sicuro i dati sensibili come password e API key.

## Obiettivi di Apprendimento

- Comprendere i rischi di sicurezza associati a Docker.
- Implementare misure di sicurezza per il Docker Daemon.
- Utilizzare strumenti per la scansione delle vulnerabilità delle immagini Docker.
- Applicare policy di sicurezza per i container in esecuzione (es. AppArmor, Seccomp).
- Gestire i segreti in modo sicuro utilizzando Docker Secrets o altre tecniche.
- Comprendere il principio del "least privilege" applicato ai container.

## Argomenti Teorici

Per approfondire i concetti trattati in questa esercitazione, consulta le seguenti guide:

- [Sicurezza del Docker Daemon](../../docs/Securing-Docker-Daemon.md)
- [Scansione di Sicurezza delle Immagini](../../docs/Image-Security-Scanning.md)
- [Sicurezza a Runtime dei Container](../../docs/Container-Runtime-Security.md)
- [Gestione dei Segreti in Docker](../../docs/Docker-Secrets-Management.md)

## Esercitazioni Pratiche

Nella cartella `examples` troverai configurazioni di esempio e script per testare strumenti di scansione e implementare policy di sicurezza.
