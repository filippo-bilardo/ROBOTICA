# Esempio: Applicazione Web con Database

Questo esempio dimostra come configurare un'applicazione web multi-container utilizzando Docker Compose. L'applicazione è composta da tre servizi:

1. **web**: Un server web Nginx che serve contenuti statici
2. **db**: Un database PostgreSQL per l'archiviazione dei dati
3. **adminer**: Un'interfaccia di amministrazione per il database (disponibile solo in ambiente di sviluppo)

## Struttura del File docker-compose.yml

Il file `docker-compose.yml` definisce:

- **Servizi**: web, db e adminer
- **Reti**: frontend (per l'accesso esterno) e backend (per la comunicazione interna)
- **Volumi**: db-data per la persistenza dei dati del database

## Funzionalità Dimostrate

- Configurazione di servizi multipli
- Gestione delle dipendenze tra servizi
- Configurazione di reti isolate
- Persistenza dei dati con volumi
- Utilizzo di variabili d'ambiente
- Configurazione di healthcheck
- Utilizzo di profili per ambienti diversi

## Come Utilizzare l'Esempio

### Prerequisiti

- Docker e Docker Compose installati

### Preparazione

Crea una cartella `html` nella stessa directory del file docker-compose.yml e aggiungi un file `index.html` con il seguente contenuto:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Docker Compose Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
        }
        h1 {
            color: #333;
        }
    </style>
</head>
<body>
    <h1>Benvenuto nell'esempio Docker Compose!</h1>
    <p>Questa è una semplice pagina web servita da Nginx.</p>
    <p>Il backend è collegato a un database PostgreSQL.</p>
</body>
</html>
```

### Avvio dei Servizi

```bash
# Avvia tutti i servizi (web e db)
docker-compose up -d

# Avvia anche il servizio adminer (per amministrazione DB)
docker-compose --profile dev up -d
```

### Accesso ai Servizi

- **Web**: http://localhost:8080
- **Adminer**: http://localhost:8081 (solo con profilo dev)
  - Sistema: PostgreSQL
  - Server: db
  - Utente: postgres
  - Password: example
  - Database: myapp

### Arresto dei Servizi

```bash
# Ferma i servizi mantenendo i dati
docker-compose down

# Ferma i servizi e rimuove i volumi (cancella i dati)
docker-compose down -v
```

## Note Didattiche

- Il servizio `web` è configurato per accedere sia alla rete frontend che backend
- Il servizio `db` è accessibile solo attraverso la rete backend (maggiore sicurezza)
- Il servizio `adminer` è disponibile solo con il profilo `dev` (non in produzione)
- Il volume `db-data` garantisce la persistenza dei dati anche quando i container vengono ricreati

Questo esempio illustra i concetti presentati nelle sezioni teoriche sul file docker-compose.yml e sulla gestione dei servizi.