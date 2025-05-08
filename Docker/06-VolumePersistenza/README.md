# Volumi e Persistenza dei Dati in Docker

## Introduzione

Benvenuti al modulo su **Volumi e Persistenza dei Dati in Docker**! In questo modulo, esploreremo come gestire i dati persistenti nei container Docker, un aspetto fondamentale per applicazioni che necessitano di memorizzare informazioni oltre il ciclo di vita di un container.

I container Docker sono effimeri per natura: quando un container viene eliminato, tutti i dati al suo interno vengono persi. Questo comportamento è ideale per applicazioni stateless, ma rappresenta una sfida per database, sistemi di file condivisi e altre applicazioni che richiedono persistenza dei dati.

## Obiettivi di Apprendimento

- Comprendere il concetto di persistenza dei dati in Docker
- Imparare a utilizzare i volumi Docker per la persistenza dei dati
- Esplorare diverse strategie di gestione dei dati nei container
- Implementare soluzioni di backup e ripristino per i dati containerizzati
- Configurare volumi condivisi tra container

## Indice degli Argomenti

### Teoria

1. [Introduzione alla Persistenza dei Dati](./teoria/01-IntroduzionePersistenzaDati.md) - Concetti fondamentali e sfide
2. [Tipi di Volumi Docker](./teoria/02-TipiVolumi.md) - Volumi named, anonymous e bind mounts
3. [Gestione Avanzata dei Volumi](./teoria/03-GestioneAvanzataVolumi.md) - Driver di volumi, backup e ripristino

### Esempi Pratici

1. [Volumi Named](./esempi/01-VolumiNamed/README.md) - Creazione e utilizzo di volumi named
2. [Bind Mounts](./esempi/02-BindMounts/README.md) - Montaggio di directory host nei container
3. [Volumi Condivisi](./esempi/03-VolumiCondivisi/README.md) - Condivisione di dati tra container
4. [Backup e Ripristino](./esempi/04-BackupRipristino/README.md) - Strategie per il backup dei dati containerizzati

## Prerequisiti

Prima di iniziare questo modulo, dovresti avere:

- Docker installato sul tuo sistema
- Familiarità con i concetti base di Docker (container, immagini)
- Conoscenza dei comandi Docker di base
- Completato i moduli precedenti di questo corso

## Navigazione

- [⬅️ Modulo precedente: Reti Docker](../05-RetiDocker/README.md)
- [➡️ Modulo successivo: Orchestrazione Docker](../07-Orchestrazione/README.md)
- [📑 Torna al README principale](../README.md)