# Dockerfile per l'esempio di utilizzo dei registry
FROM nginx:alpine

# Metadati dell'immagine
LABEL maintainer="Nome Cognome <email@example.com>"
LABEL version="1.0"
LABEL description="Esempio per l'utilizzo dei registry Docker"

# Copiamo i file dell'applicazione
COPY ./app /usr/share/nginx/html

# Esponiamo la porta 80
EXPOSE 80