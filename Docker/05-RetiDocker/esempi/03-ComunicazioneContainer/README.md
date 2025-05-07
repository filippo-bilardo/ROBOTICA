# Esempio: Comunicazione tra Container

Questo esempio dimostra diversi scenari di comunicazione tra container Docker, utilizzando varie configurazioni di rete.

## Prerequisiti

- Docker installato sul tuo sistema
- Conoscenza di base dei comandi Docker e delle reti

## Obiettivi

- Implementare un'architettura multi-container con comunicazione tra servizi
- Esplorare diversi pattern di comunicazione tra container
- Comprendere come configurare container per comunicare in vari scenari

## Architettura dell'Esempio

In questo esempio, implementeremo una semplice applicazione web a tre livelli:

1. **Frontend**: Un server web Nginx che serve contenuti statici
2. **Backend**: Un'API REST basata su Node.js
3. **Database**: Un database Redis per l'archiviazione dei dati

## Passaggi

### 1. Crea una Rete per l'Applicazione

Creaimo una rete dedicata per la nostra applicazione:

```bash
docker network create app-network
```

### 2. Avvia il Container Redis

```bash
docker run -d \
  --name redis \
  --network app-network \
  redis:alpine
```

### 3. Crea un File per l'API Backend

Crea un file `app.js` con il seguente contenuto:

```javascript
const express = require('express');
const redis = require('redis');
const app = express();
const port = 3000;

// Connessione a Redis usando il nome del container come hostname
const client = redis.createClient({
  url: 'redis://redis:6379'
});

(async () => {
  await client.connect();
})();

client.on('error', (err) => {
  console.error('Redis error:', err);
});

app.use(express.json());

// Endpoint per incrementare un contatore
app.post('/increment', async (req, res) => {
  try {
    const count = await client.incr('counter');
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint per ottenere il valore del contatore
app.get('/counter', async (req, res) => {
  try {
    const count = await client.get('counter') || 0;
    res.json({ count: parseInt(count) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API server listening on port ${port}`);
});
```

### 4. Crea un Dockerfile per il Backend

Crea un file `Dockerfile` con il seguente contenuto:

```dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY app.js .

EXPOSE 3000

CMD ["node", "app.js"]
```

### 5. Crea un File package.json

Crea un file `package.json` con il seguente contenuto:

```json
{
  "name": "docker-network-example",
  "version": "1.0.0",
  "description": "Example of container communication",
  "main": "app.js",
  "dependencies": {
    "express": "^4.17.1",
    "redis": "^4.0.0"
  }
}
```

### 6. Costruisci e Avvia il Container Backend

```bash
# Costruisci l'immagine
docker build -t api-backend .

# Avvia il container
docker run -d \
  --name api \
  --network app-network \
  api-backend
```

### 7. Crea un File HTML per il Frontend

Crea una directory `html` e al suo interno un file `index.html` con il seguente contenuto:

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contatore Docker</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    .counter {
      font-size: 72px;
      margin: 40px 0;
    }
    button {
      background-color: #4CAF50;
      border: none;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Esempio di Comunicazione tra Container</h1>
  <p>Questo contatore è gestito da tre container separati: frontend, backend e database.</p>
  
  <div class="counter" id="counter">0</div>
  
  <button id="increment">Incrementa</button>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const counterElement = document.getElementById('counter');
      const incrementButton = document.getElementById('increment');
      
      // Funzione per aggiornare il contatore
      function updateCounter() {
        fetch('/api/counter')
          .then(response => response.json())
          .then(data => {
            counterElement.textContent = data.count;
          })
          .catch(error => console.error('Errore:', error));
      }
      
      // Incrementa il contatore quando si preme il pulsante
      incrementButton.addEventListener('click', function() {
        fetch('/api/increment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
          .then(response => response.json())
          .then(data => {
            counterElement.textContent = data.count;
          })
          .catch(error => console.error('Errore:', error));
      });
      
      // Aggiorna il contatore all'avvio
      updateCounter();
    });
  </script>
</body>
</html>
```

### 8. Avvia il Container Frontend

```bash
docker run -d \
  --name frontend \
  --network app-network \
  -p 80:80 \
  -v $(pwd)/html:/usr/share/nginx/html \
  nginx:alpine
```

### 9. Configura Nginx per il Proxy Inverso

Crea un file `nginx.conf` con il seguente contenuto:

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }

    location /api/ {
        proxy_pass http://api:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Aggiorna il container frontend per utilizzare questa configurazione:

```bash
docker stop frontend
docker rm frontend

docker run -d \
  --name frontend \
  --network app-network \
  -p 80:80 \
  -v $(pwd)/html:/usr/share/nginx/html \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx:alpine
```

### 10. Testa l'Applicazione

Apri un browser e naviga a:

```
http://localhost
```

Dovresti vedere la pagina web con il contatore. Cliccando sul pulsante "Incrementa", il frontend invierà una richiesta al backend, che incrementerà il valore nel database Redis e restituirà il nuovo valore.

### 11. Analizza la Comunicazione tra Container

Per vedere come i container comunicano tra loro, puoi eseguire:

```bash
# Verifica le connessioni di rete nel container backend
docker exec api netstat -tuln

# Verifica i log del backend
docker logs api

# Ispeziona la rete dell'applicazione
docker network inspect app-network
```

### 12. Pulisci l'Ambiente

Al termine dell'esperimento, rimuovi i container e la rete:

```bash
docker stop frontend api redis
docker rm frontend api redis
docker network rm app-network
```

## Varianti dell'Esempio

### Comunicazione tra Container su Reti Diverse

Puoi anche esplorare come far comunicare container su reti diverse:

1. Crea due reti separate:
   ```bash
   docker network create frontend-network
   docker network create backend-network
   ```

2. Collega i container alle rispettive reti:
   ```bash
   # Redis solo sulla rete backend
   docker run -d --name redis --network backend-network redis:alpine
   
   # API su entrambe le reti
   docker run -d --name api --network backend-network api-backend
   docker network connect frontend-network api
   
   # Frontend solo sulla rete frontend
   docker run -d --name frontend --network frontend-network -p 80:80 -v $(pwd)/html:/usr/share/nginx/html -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf nginx:alpine
   ```

In questo scenario, il container API funge da "ponte" tra le due reti, permettendo al frontend di comunicare indirettamente con il database.

## Conclusioni

In questo esempio, hai imparato:

1. Come implementare un'architettura multi-container con comunicazione tra servizi
2. Come utilizzare i nomi dei container come hostname per la comunicazione
3. Come configurare un proxy inverso per instradare le richieste tra container
4. Come container su reti diverse possono comunicare attraverso container "ponte"

Questi pattern di comunicazione sono fondamentali per costruire applicazioni containerizzate complesse e scalabili.

## Navigazione
- [⬅️ Esempio precedente: Reti Personalizzate](../02-RetiPersonalizzate/README.md)
- [📑 Torna al README del modulo](../../README.md)