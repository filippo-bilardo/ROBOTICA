# Orchestrazione Docker

## Introduzione

Benvenuti al modulo su **Orchestrazione Docker**! In questo modulo, esploreremo come gestire e orchestrare applicazioni containerizzate su larga scala. L'orchestrazione è fondamentale quando si lavora con decine, centinaia o migliaia di container che devono essere distribuiti, scalati e gestiti in modo efficiente.

Mentre Docker è eccellente per eseguire container singoli o piccoli gruppi di container, l'orchestrazione fornisce strumenti e piattaforme per gestire container in ambienti di produzione complessi, garantendo alta disponibilità, scalabilità e resilienza.

## Obiettivi di Apprendimento

- Comprendere i concetti fondamentali dell'orchestrazione di container
- Imparare a utilizzare Docker Swarm per l'orchestrazione nativa di Docker
- Esplorare i concetti base di Kubernetes come piattaforma di orchestrazione
- Implementare strategie di deployment, scaling e aggiornamento
- Configurare sistemi di service discovery e load balancing
- Gestire la resilienza e il failover in ambienti containerizzati

## Indice degli Argomenti

### Teoria

1. [Introduzione all'Orchestrazione](./teoria/01-IntroduzioneOrchestrazione.md) - Concetti fondamentali e casi d'uso
2. [Docker Swarm](./teoria/02-DockerSwarm.md) - Orchestrazione nativa di Docker
3. [Introduzione a Kubernetes](./teoria/03-IntroduzioneKubernetes.md) - Concetti base della piattaforma di orchestrazione più diffusa

### Esempi Pratici

1. [Cluster Swarm Base](./esempi/01-ClusterSwarmBase/README.md) - Creazione e gestione di un cluster Swarm
2. [Servizi e Scaling](./esempi/02-ServiziScaling/README.md) - Deployment e scaling di servizi in Swarm
3. [Reti e Secrets](./esempi/03-RetiSecrets/README.md) - Gestione di reti e informazioni sensibili
4. [Aggiornamenti Rolling](./esempi/04-AggiornamentoRolling/README.md) - Strategie di aggiornamento senza downtime

## Prerequisiti

Prima di iniziare questo modulo, dovresti avere:

- Docker installato sul tuo sistema
- Familiarità con i concetti base di Docker (container, immagini, reti)
- Conoscenza dei comandi Docker di base
- Completato i moduli precedenti di questo corso, in particolare quelli su Docker Compose e Reti Docker

## Navigazione

- [⬅️ Modulo precedente: Volumi e Persistenza dei Dati](../06-VolumePersistenza/README.md)
- [📑 Torna al README principale](../README.md)