# Dockerfile

## Descrizione

Questa esercitazione ti insegnerà come creare immagini Docker personalizzate utilizzando i Dockerfile. Imparerai la sintassi, le best practices e come ottimizzare le tue immagini per la produzione.

## Indice degli Argomenti Teorici

1. [Introduzione ai Dockerfile](./teoria/01-IntroduzioneDockerfile.md)
2. [Istruzioni base del Dockerfile](./teoria/02-IstruzioniBase.md)
3. [Best Practices per Dockerfile](./teoria/03-BestPractices.md)
4. [Gestione delle dipendenze](./teoria/04-GestioneDipendenze.md)
5. [Debugging e troubleshooting](./teoria/05-DebuggingTroubleshooting.md)

## Esercitazioni Pratiche

Nella cartella [esempi](./esempi/) troverai una serie di esercitazioni pratiche numerate:

1. [01-PrimoDockerfile](./esempi/01-PrimoDockerfile/) - Crea il tuo primo Dockerfile
2. [02-ApplicazioneNode](./esempi/02-ApplicazioneNode/) - Containerizza un'applicazione Node.js
3. [03-ApplicazionePython](./esempi/03-ApplicazionePython/) - Containerizza un'applicazione Python
4. [04-OptimizzazioneImmagine](./esempi/04-OptimizzazioneImmagine/) - Ottimizza dimensioni e performance
5. [05-VariabiliAmbiente](./esempi/05-VariabiliAmbiente/) - Gestione di configurazioni e segreti

## Progetto Integrativo

**Mini-Progetto: API REST Containerizzata**
- Crea un'API REST semplice (Node.js o Python)
- Containerizza l'applicazione con Dockerfile ottimizzato
- Implementa health checks e logging
- Gestisci configurazioni tramite variabili d'ambiente

## Esercizi di Autovalutazione

### Quiz di Verifica
1. Qual è la differenza tra `COPY` e `ADD`?
2. Quando è appropriato utilizzare `USER` in un Dockerfile?
3. Come si ottimizza la cache delle layer?
4. Qual è il ruolo di `.dockerignore`?

### Checklist di Competenze
- [ ] Scrivo Dockerfile con sintassi corretta
- [ ] Ottimizo le immagini per dimensioni ridotte
- [ ] Implemento best practices di sicurezza
- [ ] Gestisco variabili d'ambiente appropriatamente
- [ ] Debug errori di build efficacemente

## Obiettivi di Apprendimento

Al termine di questa esercitazione sarai in grado di:
- Scrivere Dockerfile efficaci e sicuri
- Ottimizzare le immagini per produzione
- Gestire configurazioni e dipendenze
- Implementare best practices di containerizzazione
- Risolvere problemi comuni di build

## Navigazione del Corso
- [📑 Indice](../README.md)
- [⬅️ Lavorare con le immagini](../03-LavorareImmagini/README.md)
- [➡️ Multi-stage builds](../05-MultiStageBuild/README.md)
