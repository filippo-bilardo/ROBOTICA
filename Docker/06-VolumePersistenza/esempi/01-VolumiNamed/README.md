# Esempio: Utilizzo dei Volumi Named in Docker

Questo esempio dimostra come utilizzare i volumi named in Docker per persistere i dati di un database MySQL.

## Prerequisiti

- Docker installato sul tuo sistema
- Conoscenza di base dei comandi Docker

## Obiettivi

- Creare e gestire volumi named in Docker
- Utilizzare un volume named per persistere i dati di un database MySQL
- Verificare la persistenza dei dati dopo la rimozione e ricreazione del container

## Passaggi

### 1. Creazione di un Volume Named

Crea un volume named che verrà utilizzato per memorizzare i dati del database:

```bash
docker volume create mysql-data
```

### 2. Verifica della Creazione del Volume

Verifica che il volume sia stato creato correttamente:

```bash
docker volume ls
```

Puoi anche ispezionare il volume per vedere i dettagli:

```bash
docker volume inspect mysql-data
```

### 3. Avvio di un Container MySQL con il Volume

Avvia un container MySQL utilizzando il volume named per persistere i dati:

```bash
docker run -d \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=example \
  -e MYSQL_DATABASE=testdb \
  -v mysql-data:/var/lib/mysql \
  mysql:5.7
```

### 4. Creazione di Dati di Test

Connettiamoci al database e creiamo alcuni dati di test:

```bash
docker exec -it mysql-db mysql -uroot -pexample
```

All'interno del client MySQL, esegui i seguenti comandi:

```sql
USE testdb;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);

INSERT INTO users (name, email) VALUES ('Mario Rossi', 'mario@example.com');
INSERT INTO users (name, email) VALUES ('Giulia Bianchi', 'giulia@example.com');

SELECT * FROM users;

EXIT;
```

### 5. Eliminazione e Ricreazione del Container

Ora eliminiamo il container MySQL:

```bash
docker stop mysql-db
docker rm mysql-db
```

E ricreaiamolo utilizzando lo stesso volume:

```bash
docker run -d \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=example \
  -e MYSQL_DATABASE=testdb \
  -v mysql-data:/var/lib/mysql \
  mysql:5.7
```

### 6. Verifica della Persistenza dei Dati

Connettiamoci nuovamente al database per verificare che i dati siano ancora presenti:

```bash
docker exec -it mysql-db mysql -uroot -pexample -e "USE testdb; SELECT * FROM users;"
```

Dovresti vedere i dati che hai inserito nel passaggio 4, dimostrando che i dati sono persistiti nonostante l'eliminazione e ricreazione del container.

## Spiegazione

In questo esempio:

1. Abbiamo creato un volume named chiamato `mysql-data`
2. Abbiamo avviato un container MySQL montando il volume nella directory `/var/lib/mysql` (dove MySQL memorizza i suoi dati)
3. Abbiamo creato una tabella e inserito alcuni dati
4. Abbiamo eliminato e ricreato il container
5. Abbiamo verificato che i dati sono persistiti grazie al volume

Questo dimostra il concetto fondamentale dei volumi Docker: i dati persistono indipendentemente dal ciclo di vita dei container.

## Comandi Utili per la Gestione dei Volumi

```bash
# Elenco di tutti i volumi
docker volume ls

# Ispezione di un volume
docker volume inspect mysql-data

# Eliminazione di un volume
docker volume rm mysql-data

# Eliminazione di tutti i volumi non utilizzati
docker volume prune
```

## Conclusioni

In questo esempio, hai imparato:

1. Come creare e utilizzare volumi named in Docker
2. Come persistere i dati di un database MySQL utilizzando un volume
3. Come verificare che i dati persistono anche dopo l'eliminazione e ricreazione del container

I volumi named sono la soluzione raccomandata per la persistenza dei dati in Docker, specialmente per applicazioni come database che richiedono storage persistente.

## Navigazione

- [⬅️ Torna all'indice del modulo](../../README.md)
- [➡️ Prossimo esempio: Bind Mounts](../02-BindMounts/README.md)