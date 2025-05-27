# Isolamento e Gestione dei Privilegi in Docker

## Introduzione

L'isolamento e la gestione corretta dei privilegi sono fondamentali per la sicurezza dei container. In questo esempio pratico, esploreremo come implementare il principio del privilegio minimo, configurare namespace, limitare capabilities e utilizzare security profiles.

## Obiettivi

- Implementare il principio del privilegio minimo
- Configurare user namespaces
- Gestire Linux capabilities
- Utilizzare security profiles (AppArmor, SELinux, seccomp)
- Configurare cgroups per limitare le risorse
- Implementare network isolation

## Il Principio del Privilegio Minimo

### ❌ Configurazione Insicura

```dockerfile
# Dockerfile insicuro
FROM ubuntu:latest

# Installazione con root
RUN apt-get update && apt-get install -y \
    sudo \
    curl \
    wget \
    vim

# Aggiunta utente al gruppo sudo
RUN useradd -m appuser && usermod -aG sudo appuser

# Esecuzione come root
USER root

# Esposizione di porte privilegiate
EXPOSE 80 443

CMD ["/bin/bash"]
```

```bash
# Esecuzione con privilegi elevati
docker run -d \
    --privileged \
    --cap-add=ALL \
    --user=root \
    --pid=host \
    --network=host \
    insecure-app
```

### ✅ Configurazione Sicura

```dockerfile
# Dockerfile sicuro
FROM node:18-alpine

# Creare utente non privilegiato con UID/GID specifici
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Installare solo dipendenze necessarie
RUN apk add --no-cache dumb-init

# Creare directory applicazione con permessi corretti
WORKDIR /app
RUN chown -R appuser:appgroup /app

# Copiare file con ownership corretto
COPY --chown=appuser:appgroup package*.json ./
COPY --chown=appuser:appgroup src/ ./src/

# Installare dipendenze come utente non privilegiato
USER appuser
RUN npm ci --only=production

# Esporre solo porte non privilegiate
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD node src/healthcheck.js

# Usare init process
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]
```

## User Namespaces

### Configurazione del Daemon Docker

```json
# /etc/docker/daemon.json
{
    "userns-remap": "default",
    "storage-driver": "overlay2",
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    }
}
```

```bash
# Riavviare Docker daemon
sudo systemctl restart docker

# Verificare user namespace
docker info | grep "Security Options"
```

### Test User Namespace

```bash
# Container senza user namespace
docker run --rm --user=root alpine id
# Output: uid=0(root) gid=0(root) groups=0(root)

# Container con user namespace remapping
docker run --rm --user=1000 alpine id
# Output: uid=1000 gid=1000 groups=1000

# Verificare mapping su host
cat /proc/$(docker inspect --format='{{.State.Pid}}' container_id)/uid_map
```

## Linux Capabilities

### Gestione delle Capabilities

```bash
# Listar capabilities di default
docker run --rm alpine capsh --print

# Rimuovere tutte le capabilities
docker run --rm --cap-drop=ALL alpine capsh --print

# Aggiungere solo capabilities necessarie
docker run --rm \
    --cap-drop=ALL \
    --cap-add=NET_BIND_SERVICE \
    --cap-add=SETUID \
    --cap-add=SETGID \
    nginx:alpine

# Verificare capabilities di un processo
docker exec container_id grep Cap /proc/1/status
```

### Esempio: Web Server con Capabilities Limitate

```dockerfile
# Dockerfile per web server sicuro
FROM nginx:alpine

# Creare utente non privilegiato
RUN addgroup -g 1001 -S webgroup && \
    adduser -S webuser -u 1001 -G webgroup

# Configurare nginx per utente non privilegiato
RUN sed -i 's/user nginx;/user webuser;/' /etc/nginx/nginx.conf && \
    sed -i 's/listen 80;/listen 8080;/' /etc/nginx/conf.d/default.conf && \
    chown -R webuser:webgroup /var/cache/nginx /var/run /var/log/nginx

USER webuser
EXPOSE 8080
```

```yaml
# docker-compose per web server sicuro
version: '3.8'

services:
  web:
    build: .
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Solo per bind su porte < 1024
      - SETUID
      - SETGID
    read_only: true
    tmpfs:
      - /tmp:rw,size=100m
      - /var/cache/nginx:rw,size=50m
      - /var/run:rw,size=10m
    security_opt:
      - no-new-privileges:true
    ports:
      - "8080:8080"
```

## Security Profiles

### 1. Seccomp (System Call Filtering)

```json
{
    "defaultAction": "SCMP_ACT_ERRNO",
    "architectures": ["SCMP_ARCH_X86_64"],
    "syscalls": [
        {
            "names": [
                "read", "write", "open", "close", "stat", "fstat",
                "lstat", "poll", "lseek", "mmap", "mprotect", "munmap",
                "brk", "rt_sigaction", "rt_sigprocmask", "rt_sigreturn",
                "ioctl", "pread64", "pwrite64", "readv", "writev",
                "access", "pipe", "select", "sched_yield", "mremap",
                "msync", "mincore", "madvise", "shmget", "shmat",
                "shmctl", "dup", "dup2", "pause", "nanosleep", "getitimer",
                "alarm", "setitimer", "getpid", "sendfile", "socket",
                "connect", "accept", "sendto", "recvfrom", "sendmsg",
                "recvmsg", "shutdown", "bind", "listen", "getsockname",
                "getpeername", "socketpair", "setsockopt", "getsockopt",
                "clone", "fork", "vfork", "execve", "exit", "wait4",
                "kill", "uname", "semget", "semop", "semctl", "shmdt",
                "msgget", "msgsnd", "msgrcv", "msgctl", "fcntl", "flock",
                "fsync", "fdatasync", "truncate", "ftruncate", "getdents",
                "getcwd", "chdir", "fchdir", "rename", "mkdir", "rmdir",
                "creat", "link", "unlink", "symlink", "readlink", "chmod",
                "fchmod", "chown", "fchown", "lchown", "umask", "gettimeofday",
                "getrlimit", "getrusage", "sysinfo", "times", "ptrace",
                "getuid", "syslog", "getgid", "setuid", "setgid", "geteuid",
                "getegid", "setpgid", "getppid", "getpgrp", "setsid",
                "setreuid", "setregid", "getgroups", "setgroups", "setresuid",
                "getresuid", "setresgid", "getresgid", "getpgid", "setfsuid",
                "setfsgid", "getsid", "capget", "capset", "rt_sigpending",
                "rt_sigtimedwait", "rt_sigqueueinfo", "rt_sigsuspend",
                "sigaltstack", "utime", "mknod", "uselib", "personality",
                "ustat", "statfs", "fstatfs", "sysfs", "getpriority",
                "setpriority", "sched_setparam", "sched_getparam",
                "sched_setscheduler", "sched_getscheduler", "sched_get_priority_max",
                "sched_get_priority_min", "sched_rr_get_interval", "mlock",
                "munlock", "mlockall", "munlockall", "vhangup", "modify_ldt",
                "pivot_root", "prctl", "arch_prctl", "adjtimex", "setrlimit",
                "chroot", "sync", "acct", "settimeofday", "mount", "umount2",
                "swapon", "swapoff", "reboot", "sethostname", "setdomainname",
                "iopl", "ioperm", "init_module", "delete_module", "quotactl",
                "gettid", "readahead", "setxattr", "lsetxattr", "fsetxattr",
                "getxattr", "lgetxattr", "fgetxattr", "listxattr", "llistxattr",
                "flistxattr", "removexattr", "lremovexattr", "fremovexattr",
                "tkill", "time", "futex", "sched_setaffinity", "sched_getaffinity",
                "set_thread_area", "io_setup", "io_destroy", "io_getevents",
                "io_submit", "io_cancel", "get_thread_area", "lookup_dcookie",
                "epoll_create", "epoll_ctl_old", "epoll_wait_old", "remap_file_pages",
                "getdents64", "set_tid_address", "restart_syscall", "semtimedop",
                "fadvise64", "timer_create", "timer_settime", "timer_gettime",
                "timer_getoverrun", "timer_delete", "clock_settime", "clock_gettime",
                "clock_getres", "clock_nanosleep", "exit_group", "epoll_wait",
                "epoll_ctl", "tgkill", "utimes", "vserver", "mbind", "set_mempolicy",
                "get_mempolicy", "mq_open", "mq_unlink", "mq_timedsend",
                "mq_timedreceive", "mq_notify", "mq_getsetattr", "kexec_load",
                "waitid", "add_key", "request_key", "keyctl", "ioprio_set",
                "ioprio_get", "inotify_init", "inotify_add_watch", "inotify_rm_watch",
                "migrate_pages", "openat", "mkdirat", "mknodat", "fchownat",
                "futimesat", "newfstatat", "unlinkat", "renameat", "linkat",
                "symlinkat", "readlinkat", "fchmodat", "faccessat", "pselect6",
                "ppoll", "unshare", "set_robust_list", "get_robust_list",
                "splice", "tee", "sync_file_range", "vmsplice", "move_pages",
                "utimensat", "epoll_pwait", "signalfd", "timerfd_create",
                "eventfd", "fallocate", "timerfd_settime", "timerfd_gettime",
                "accept4", "signalfd4", "eventfd2", "epoll_create1", "dup3",
                "pipe2", "inotify_init1", "preadv", "pwritev", "rt_tgsigqueueinfo",
                "perf_event_open", "recvmmsg", "fanotify_init", "fanotify_mark",
                "prlimit64", "name_to_handle_at", "open_by_handle_at", "clock_adjtime",
                "syncfs", "sendmmsg", "setns", "getcpu", "process_vm_readv",
                "process_vm_writev", "kcmp", "finit_module"
            ],
            "action": "SCMP_ACT_ALLOW"
        }
    ]
}
```

```bash
# Usare seccomp profile personalizzato
docker run --rm \
    --security-opt seccomp=seccomp-profile.json \
    alpine sh -c "ls /proc/sys/kernel"
```

### 2. AppArmor Profile

```bash
# /etc/apparmor.d/docker-nginx
#include <tunables/global>

profile docker-nginx flags=(attach_disconnected,mediate_deleted) {
    #include <abstractions/base>
    #include <abstractions/nameservice>

    capability net_bind_service,
    capability setuid,
    capability setgid,

    deny @{PROC}/sys/kernel/** r,
    deny /sys/** r,

    /usr/sbin/nginx mr,
    /etc/nginx/** r,
    /var/log/nginx/** rw,
    /var/cache/nginx/** rw,
    /var/run/nginx.pid rw,

    # Nega accesso a file sensibili
    deny /etc/shadow r,
    deny /etc/passwd w,
    deny /etc/group w,
    
    # Network access
    network inet stream,
    network inet6 stream,
}
```

```bash
# Caricare profile AppArmor
sudo apparmor_parser -r /etc/apparmor.d/docker-nginx

# Usare con Docker
docker run --rm \
    --security-opt apparmor:docker-nginx \
    nginx:alpine
```

## Esempio Completo: Applicazione Multi-Tier Sicura

### Architettura

```
Frontend (nginx) -> API Gateway -> Backend Services -> Database
```

### 1. Frontend Sicuro

```dockerfile
# frontend/Dockerfile
FROM nginx:alpine

# Creare utente non privilegiato
RUN addgroup -g 1001 -S webgroup && \
    adduser -S webuser -u 1001 -G webgroup

# Configurazione nginx sicura
COPY nginx.conf /etc/nginx/nginx.conf
COPY --chown=webuser:webgroup static/ /usr/share/nginx/html/

# Permessi corretti
RUN chown -R webuser:webgroup /var/cache/nginx /var/log/nginx /var/run && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx

USER webuser
EXPOSE 8080
```

```nginx
# frontend/nginx.conf
user webuser;
worker_processes auto;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    server {
        listen 8080;
        server_name _;
        
        # Rate limiting
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
        
        location / {
            root /usr/share/nginx/html;
            index index.html;
            
            # Security
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1M;
                add_header Cache-Control "public, immutable";
            }
        }
        
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### 2. API Gateway

```dockerfile
# api-gateway/Dockerfile
FROM node:18-alpine

RUN addgroup -g 1001 -S apigroup && \
    adduser -S apiuser -u 1001 -G apigroup

WORKDIR /app
RUN chown apiuser:apigroup /app

# Installare solo dipendenze necessarie
COPY --chown=apiuser:apigroup package*.json ./
USER apiuser
RUN npm ci --only=production

COPY --chown=apiuser:apigroup src/ ./src/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD node src/healthcheck.js

CMD ["node", "src/app.js"]
```

### 3. Docker Compose Sicuro

```yaml
# docker-compose.secure.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
      - SETUID
      - SETGID
    read_only: true
    tmpfs:
      - /var/cache/nginx:rw,size=50m
      - /var/run:rw,size=10m
      - /var/log/nginx:rw,size=50m
    security_opt:
      - no-new-privileges:true
      - apparmor:docker-nginx
    ports:
      - "80:8080"
    depends_on:
      - api-gateway
    networks:
      - frontend-network

  api-gateway:
    build: ./api-gateway
    cap_drop:
      - ALL
    read_only: true
    tmpfs:
      - /tmp:rw,size=100m
    security_opt:
      - no-new-privileges:true
      - seccomp:seccomp-api.json
    environment:
      - NODE_ENV=production
      - BACKEND_URL=http://backend:4000
    depends_on:
      - backend
    networks:
      - frontend-network
      - backend-network

  backend:
    build: ./backend
    cap_drop:
      - ALL
    read_only: true
    tmpfs:
      - /tmp:rw,size=100m
    security_opt:
      - no-new-privileges:true
    environment:
      - NODE_ENV=production
      - DB_HOST=database
    depends_on:
      - database
    networks:
      - backend-network
      - database-network

  database:
    image: postgres:15-alpine
    cap_drop:
      - ALL
    cap_add:
      - SETUID
      - SETGID
      - DAC_OVERRIDE
    read_only: true
    tmpfs:
      - /tmp:rw,size=100m
      - /var/run/postgresql:rw,size=50m
    security_opt:
      - no-new-privileges:true
    environment:
      - POSTGRES_DB=app
      - POSTGRES_USER=appuser
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - database-network

networks:
  frontend-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.1.0/24
  backend-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.2.0/24
  database-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.3.0/24

volumes:
  db_data:

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

## Resource Limits con Cgroups

### Configurazione Avanzata dei Limiti

```yaml
# docker-compose con limiti dettagliati
services:
  web:
    image: nginx:alpine
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
          pids: 100
        reservations:
          cpus: '0.25'
          memory: 256M
    # Limiti runtime aggiuntivi
    ulimits:
      nofile:
        soft: 1024
        hard: 2048
      nproc: 64
```

```bash
# Verifica limiti cgroups
docker exec container_id cat /sys/fs/cgroup/memory/memory.limit_in_bytes
docker exec container_id cat /sys/fs/cgroup/cpu/cpu.cfs_quota_us
docker exec container_id cat /sys/fs/cgroup/pids/pids.max
```

## Script di Audit Sicurezza

```bash
#!/bin/bash
# security-audit.sh

CONTAINER_NAME=$1

if [ -z "$CONTAINER_NAME" ]; then
    echo "Uso: $0 <container-name>"
    exit 1
fi

echo "🔒 AUDIT SICUREZZA PER $CONTAINER_NAME"
echo "====================================="

# 1. Controllo utente
echo ""
echo "👤 CONTROLLO UTENTE:"
RUNNING_USER=$(docker exec $CONTAINER_NAME id -u 2>/dev/null || echo "N/A")
RUNNING_GROUP=$(docker exec $CONTAINER_NAME id -g 2>/dev/null || echo "N/A")

if [ "$RUNNING_USER" = "0" ]; then
    echo "❌ Container in esecuzione come root (UID: $RUNNING_USER)"
else
    echo "✅ Container in esecuzione come utente non privilegiato (UID: $RUNNING_USER, GID: $RUNNING_GROUP)"
fi

# 2. Controllo capabilities
echo ""
echo "🔐 CAPABILITIES:"
docker exec $CONTAINER_NAME grep "CapEff" /proc/1/status 2>/dev/null || echo "N/A"

# 3. Controllo filesystem read-only
echo ""
echo "📁 FILESYSTEM:"
READONLY=$(docker inspect $CONTAINER_NAME 2>/dev/null | jq -r '.[0].HostConfig.ReadonlyRootfs' 2>/dev/null || echo "false")
if [ "$READONLY" = "true" ]; then
    echo "✅ Filesystem root in sola lettura"
else
    echo "❌ Filesystem root scrivibile"
fi

# 4. Controllo security options
echo ""
echo "🔒 SECURITY OPTIONS:"
SECURITY_OPTS=$(docker inspect $CONTAINER_NAME 2>/dev/null | jq -r '.[0].HostConfig.SecurityOpt[]?' 2>/dev/null || echo "Nessuna")
if [ "$SECURITY_OPTS" = "Nessuna" ]; then
    echo "⚠️  Nessuna security option configurata"
else
    echo "✅ Security options: $SECURITY_OPTS"
fi

# 5. Controllo network isolation
echo ""
echo "🌐 NETWORK:"
NETWORK_MODE=$(docker inspect $CONTAINER_NAME 2>/dev/null | jq -r '.[0].HostConfig.NetworkMode' 2>/dev/null || echo "N/A")
if [ "$NETWORK_MODE" = "host" ]; then
    echo "❌ Container usa network host (no isolation)"
else
    echo "✅ Container usa network isolato: $NETWORK_MODE"
fi

# 6. Controllo privilegi
echo ""
echo "⚡ PRIVILEGI:"
PRIVILEGED=$(docker inspect $CONTAINER_NAME 2>/dev/null | jq -r '.[0].HostConfig.Privileged' 2>/dev/null || echo "false")
if [ "$PRIVILEGED" = "true" ]; then
    echo "❌ Container in modalità privileged"
else
    echo "✅ Container non privileged"
fi

# 7. Controllo limiti risorse
echo ""
echo "📊 LIMITI RISORSE:"
MEMORY_LIMIT=$(docker inspect $CONTAINER_NAME 2>/dev/null | jq -r '.[0].HostConfig.Memory' 2>/dev/null || echo "0")
CPU_LIMIT=$(docker inspect $CONTAINER_NAME 2>/dev/null | jq -r '.[0].HostConfig.CpuQuota' 2>/dev/null || echo "0")

if [ "$MEMORY_LIMIT" != "0" ]; then
    echo "✅ Limite memoria: $(($MEMORY_LIMIT / 1024 / 1024))MB"
else
    echo "⚠️  Nessun limite memoria"
fi

if [ "$CPU_LIMIT" != "0" ]; then
    echo "✅ Limite CPU configurato"
else
    echo "⚠️  Nessun limite CPU"
fi

echo ""
echo "🏁 AUDIT COMPLETATO"
```

## Conclusioni

L'isolamento e la gestione dei privilegi richiedono:

1. **Principio del privilegio minimo**: Eseguire sempre come utente non privilegiato
2. **Capabilities minime**: Rimuovere tutte le capabilities non necessarie
3. **Security profiles**: Utilizzare AppArmor/SELinux/seccomp
4. **Resource limits**: Limitare CPU, memoria, processi
5. **Network isolation**: Segregare il traffico di rete
6. **Monitoring continuo**: Auditing e logging degli accessi

## Risorse Aggiuntive

- [Docker Security Documentation](https://docs.docker.com/engine/security/)
- [Linux Capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html)
- [AppArmor Documentation](https://wiki.ubuntu.com/AppArmor)
- [Seccomp Documentation](https://www.kernel.org/doc/Documentation/prctl/seccomp_filter.txt)

## Navigazione

- [⬅️ Esempio precedente: Secrets Management](../03-SecretsManagement/README.md)
- [🏠 Torna al modulo Sicurezza](../README.md)
