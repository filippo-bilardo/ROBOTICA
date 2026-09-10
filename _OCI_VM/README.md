### Lavori classi
1H_TECINF   Il S.O.
3H_INF      Le funzioni    
3H_TEC      Script saluti
4H_INF      OOP Arduino
4H_TPSIT    Eccezioni
4G_TPSIT    Ereditarietà, Eccezioni
5H_INF      Sessioni, ListaSpesa
5H_TPSIT    JSON, WebService

### Server accessibili da remoto
http://204.216.213.176/       -> IP pubblico

https://204.216.213.176:9443/ -> Portainer
https://fblabs.ddns.net:9443/ -> Portainer

http://204.216.213.176:8501/  -> chat gpt
http://fblabs.ddns.net:8501   s

http://204.216.213.176:6080/  -> Linux-gui Ubuntu-gui-novnc Tomcat + Eclipse	
http://fblabs.ddns.net:6080/  -> Linux-gui
 
http://fblabs.ddns.net:8080/  -> Owncloud 
https://owncloud.filippobilardo.it/


8765	Esercitazioni con le socket	

docker exec -it lamp_mariadb bash -l
docker exec -it lamp_nodejs bash -l
docker exec -it lamp_webserver bash -l

```bash
# eseguo la shell di un container in esecuzione
docker exec -it debian4student /bin/bash
# avvio il servizio sshd
service ssh start
# mi connetto al server ssh
ssh fb@204.216.213.176 -p 7777 -> debian4student
```
7777	debian4student	
7778	debian4student auxport	
7776	debian4student tcp test	
7770	Tcp test from main VM	

```bash
docker exec -it nodejs4student /bin/bash
apt-get update
apt-get install -y openssh-server
service ssh start
ssh fb@204.216.213.176 -p 8122 -> nodejs4student
```
8180	nodejs4student	
8122	nodejs4student	
8181	nodejs4student	
8188	nodejs4student

---

### Comandi docker
```bash
docker ps -a
docker images
docker exec -it <container_id> bash
docker exec -it <container_id> /bin/bash

#Elenco dei cointainer docker in esecuzione

docker ps -a

# visualizzo solo i nomi dei container
docker ps -a --format "table {{.Names}}"
```

### Repository non ancora clonati
git clone https://github.com/filippo-bilardo/TPSIT_3_TOMCAT.git
https://github.com/filippo-bilardo/TPSIT_3_react_native_expo_gitpod.git

---

### Server linux con GUI
http://204.216.213.176:6080/ - Linux-gui Ubuntu-gui-novnc Tomcat + Eclipse	
http://fblabs.ddns.net:6080/ - Linux-gui
1nterfacci65-

docker exec -it ununtu_gui-novnc bash -l
node-v21.7.1-linux-arm64
https://nodejs.org/dist/latest/node-v21.7.1-linux-arm64.tar.xz

```bash
sudo passwd tom
sudo apt update -y && sudo apt upgrade -y
sudo apt install nano
```
---

### Server Lamp con MariaDB
http://fblabs.ddns.net/  -> server lamp
:80	Lamp Webserver	

```bash
docker exec -it lamp_mariadb bash -l
mysql -u lamp -p
docker exec -it lamp_webserver bash -l
mysql -u root -h 172.23.0.3 -p 
#lamp 
#collegamento dalla macchina principale
mysql -u root -h 172.22.0.2 -p 
apt-get update && docker-php-ext-install pdo pdo_mysql
apt-get install -y libfreetype6-dev libjpeg62-turbo-dev libpng-dev libjpeg-dev libwebp-dev
docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp
docker-php-ext-install gd
docker-php-ext-install exif
apachectl restart

```
### Comandi utili per lavorare con docker
```bash
# Per vedere l'ip del cointainer:
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' lamp_mariadb
```

### Personizzare il prompt di bash
```bash
#Modifica del prompt
#visualizza il nome dell'utente e il nome della macchina
#visualizza il percorso assoluto della directory corrente
#Istruzione per cambiare il prompt
PS1="\u@\h:\w$ "

#visualizza il nome dell'utente e il nome della macchina
#Istruzione per cambiare il prompt
PS1="\u@\h$ "

#colore verde per il nome dell'utente e il nome della macchina
#Istruzione per cambiare il prompt
PS1="\[\033[0;32m\]\u@\h$ "



#colore verde e grassettato per il nome dell'utente e il nome della macchina
#Istruzione per cambiare il prompt
PS1="\[\033[1;32m\]\u@\h$ \[\033[0m\]"



#colore di default per il nome dell'utente e il nome della macchina
#Istruzione per cambiare il prompt
PS1="\[\033[0m\]\u@\h$ "

#Prompt minimalista con solo nome utente
#Istruzione per cambiare il prompt
PS1="\u$ "

#Prompt minimo
PS1="$ "
```

## Owncloud debug
````bash
# Per accedere al container OwnCloud
docker exec -it owncloud_server bash
whoami # Controlla l'utente corrente
# Controlla i permessi della cartella data
ls -la /var/www/html/data
# Controlla i permessi della cartella config
# Controlla i log del container OwnCloud
docker logs owncloud_server
# Ispeziona la configurazione del container
docker inspect owncloud_server
docker volume ls
# Ispeziona il volume specifico
docker volume inspect owncloud_files
# Accedi direttamente al volume (sostituisci il path)
docker run --rm -it -v owncloud_files:/data busybox sh
docker run --rm -v owncloud_files:/data alpine ls -la /data
# Controlla i permessi del volume
docker exec -it owncloud_server ls -la /var/www/html/data


# Accedi al database per verificare le tabelle
docker exec -it owncloud_mariadb mysql -u root -p
docker exec -it owncloud_mariadb mysql -u root -powncloud

docker exec -it owncloud_server php occ files:scan --all
````

 il database di OwnCloud è corrotto o mancante. La tabella appconfig (e probabilmente altre) non esiste nel database owncloud.
Diagnosi del problema
L'errore Table 'owncloud.appconfig' doesn't exist indica che:

Il database esiste ma le tabelle sono state perse
O il database è stato reinizializzato vuoto
O c'è un problema di connessione al database corretto
