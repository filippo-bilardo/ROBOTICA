# Esempio di Dockerfile con Multi-stage Build
# Questo file mostra come utilizzare i multi-stage build per creare immagini più leggere

# Stage 1: Build dell'applicazione
# Utilizziamo un'immagine Node.js completa per la fase di build
FROM node:14 AS builder

# Impostiamo la directory di lavoro
WORKDIR /app

# Copiamo i file di configurazione delle dipendenze
COPY package*.json ./

# Installiamo le dipendenze
RUN npm install

# Copiamo il resto del codice sorgente
COPY . .

# Compiliamo l'applicazione
RUN npm run build

# Stage 2: Immagine di produzione
# Utilizziamo un'immagine Nginx leggera per servire l'applicazione
FROM nginx:alpine

# Copiamo i file compilati dallo stage precedente
COPY --from=builder /app/build /usr/share/nginx/html

# Copiamo una configurazione personalizzata di Nginx (opzionale)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Esponiamo la porta 80
EXPOSE 80

# Il comando CMD è ereditato dall'immagine base nginx:alpine
# e avvia automaticamente il server Nginx