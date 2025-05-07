# Esempio di un semplice Dockerfile
# Questo file mostra come creare un'immagine Docker per un'applicazione web statica

# Utilizziamo un'immagine base leggera di Nginx
FROM nginx:alpine

# Metadati dell'immagine
LABEL maintainer="Nome Cognome <email@example.com>"
LABEL version="1.0"
LABEL description="Esempio di immagine Docker per un sito web statico"

# Copiamo i file del sito web nella directory corretta di Nginx
COPY ./html /usr/share/nginx/html

# Esponiamo la porta 80 per il traffico HTTP
EXPOSE 80

# Il comando CMD è ereditato dall'immagine base nginx:alpine
# e avvia automaticamente il server Nginx