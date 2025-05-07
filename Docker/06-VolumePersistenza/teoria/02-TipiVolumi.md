# Tipi di Volumi Docker

## Panoramica dei Tipi di Storage in Docker

Docker offre tre principali tipi di storage per la persistenza dei dati:

1. **Volumi** (Volumes)
2. **Bind Mounts**
3. **tmpfs Mounts**

In questo capitolo, ci concentreremo principalmente sui primi due tipi, che sono i più utilizzati per la persistenza dei dati.

![Tipi di storage in Docker](https://docs.docker.com/storage/images/types-of-mounts.png)

## Volumi Docker

I volumi Docker sono il meccanismo preferito per persistere i dati in Docker. Sono completamente gestiti da Docker e sono indipendenti dal ciclo di vita del container.

### Volumi Named (Named Volumes)

I volumi named sono volumi con un nome specifico che li rende facilmente identificabili e riutilizzabili.

**Caratteristiche**:
- Hanno un nome esplicito assegnato dall'utente
- Facili da identificare e gestire
- Possono essere condivisi tra container
- Persistono anche dopo l'eliminazione dei container

**Creazione e utilizzo**:

```bash
# Creazione di un volume named
docker volume create mio-database

# Utilizzo del volume in un container
docker run -d --name mysql-db -v mio-database:/var/lib/mysql mysql:5.7

# Sintassi alternativa (Docker Compose)
# volumes:
#   mio-database:/var/lib/mysql
```

**Gestione**:

```bash
# Elenco dei volumi
docker volume ls

# Ispezione di un volume
docker volume inspect mio-database

# Eliminazione di un volume
docker volume rm mio-database

# Eliminazione di tutti i volumi non utilizzati
docker volume prune
```

### Volumi Anonimi (Anonymous Volumes)

I volumi anonimi sono volumi creati automaticamente da Docker senza un nome specifico. Vengono identificati da un ID univoco.

**Caratteristiche**:
- Creati automaticamente quando non si specifica un nome
- Identificati da un ID univoco generato da Docker
- Utili per dati temporanei che devono sopravvivere ai riavvii del container
- Più difficili da gestire rispetto ai volumi named

**Creazione e utilizzo**:

```bash
# Creazione implicita di un volume anonimo
docker run -d --name mysql-db -v /var/lib/mysql mysql:5.7

# Sintassi alternativa (Docker Compose)
# volumes:
#   - /var/lib/mysql
```

**Ciclo di vita**:

I volumi anonimi vengono rimossi automaticamente quando il container viene eliminato con l'opzione `--rm`. Altrimenti, persistono fino a quando non vengono eliminati esplicitamente.

```bash
# Il volume anonimo viene eliminato con il container
docker run --rm -v /data alpine

# Il volume anonimo persiste dopo l'eliminazione del container
docker run -v /data alpine
```

## Bind Mounts

I bind mounts permettono di montare un file o una directory dall'host all'interno di un container.

**Caratteristiche**:
- Collegano direttamente una directory o un file dell'host al container
- Offrono accesso diretto al filesystem dell'host
- Ideali per lo sviluppo (modifiche immediate al codice)
- Meno isolati rispetto ai volumi Docker

**Utilizzo**:

```bash
# Utilizzo di un bind mount (percorso assoluto)
docker run -d --name nginx-server -v /path/su/host:/usr/share/nginx/html nginx

# Utilizzo di un bind mount (percorso relativo)
docker run -d --name nginx-server -v $(pwd)/html:/usr/share/nginx/html nginx

# Sintassi alternativa (Docker Compose)
# volumes:
#   - ./html:/usr/share/nginx/html
```

**Modalità di accesso**:

È possibile specificare la modalità di accesso per i bind mounts:

```bash
# Montaggio in sola lettura
docker run -v /path/su/host:/path/nel/container:ro nginx

# Montaggio in lettura/scrittura (default)
docker run -v /path/su/host:/path/nel/container:rw nginx
```

## Confronto tra Volumi e Bind Mounts

| Caratteristica | Volumi Docker | Bind Mounts |
|----------------|---------------|-------------|
| Gestione | Gestiti da Docker | Gestiti dall'utente |
| Posizione | `/var/lib/docker/volumes/` | Qualsiasi posizione sull'host |
| Backup | Più semplice | Richiede accesso all'host |
| Portabilità | Migliore | Dipende dal filesystem dell'host |
| Prestazioni | Ottimizzate | Dipende dal filesystem dell'host |
| Condivisione | Tra container | Tra container e host |
| Sicurezza | Maggiore isolamento | Minore isolamento |

## Casi d'Uso Comuni

### Volumi Named

- Database (MySQL, PostgreSQL, MongoDB)
- Applicazioni con dati persistenti
- Dati condivisi tra container
- Ambienti di produzione

### Volumi Anonimi

- Cache temporanee
- Dati che devono sopravvivere ai riavvii ma non sono critici
- Container usa e getta con dati temporanei

### Bind Mounts

- Sviluppo di applicazioni (modifiche immediate al codice)
- Configurazione da file esterni
- Condivisione di dati tra host e container
- Log accessibili direttamente dall'host

## Best Practices

1. **Usa volumi named per i dati persistenti**
   - Più facili da gestire e identificare
   - Migliore isolamento e sicurezza

2. **Usa bind mounts per lo sviluppo**
   - Modifiche immediate al codice
   - Facile accesso ai file dall'host

3. **Specifica sempre percorsi assoluti per i bind mounts**
   - Evita problemi di risoluzione dei percorsi
   - Usa `$(pwd)` o percorsi completi

4. **Utilizza la modalità di sola lettura quando possibile**
   - Aumenta la sicurezza
   - Previene modifiche accidentali

5. **Documenta i volumi utilizzati**
   - Specifica chiaramente quali dati sono persistenti
   - Documenta le procedure di backup

## Conclusioni

La scelta del tipo di volume dipende dalle esigenze specifiche dell'applicazione. In generale:

- **Volumi named** sono la scelta migliore per la persistenza dei dati in produzione
- **Bind mounts** sono ideali per lo sviluppo e quando è necessario accedere ai file dall'host
- **Volumi anonimi** sono utili per dati temporanei che devono sopravvivere ai riavvii

Nel prossimo capitolo, esploreremo tecniche avanzate di gestione dei volumi, inclusi driver di storage, backup e ripristino.

## Navigazione

- [⬅️ Precedente: Introduzione alla Persistenza dei Dati](./01-IntroduzionePersistenzaDati.md)
- [➡️ Prossimo: Gestione Avanzata dei Volumi](./03-GestioneAvanzataVolumi.md)
- [📑 Torna all'indice del modulo](../README.md)