# Esempio di Multi-stage Build

Questo esempio dimostra come utilizzare i multi-stage build in Docker per creare immagini più leggere ed efficienti, separando l'ambiente di build dall'ambiente di produzione.

## Struttura del Progetto

```
02-MultiStageBuilds/
├── Dockerfile        # Definizione dell'immagine Docker con multi-stage
├── package.json      # Configurazione dell'applicazione Node.js
├── src/              # Codice sorgente dell'applicazione
│   └── index.js      # File principale dell'applicazione
└── nginx.conf       # Configurazione personalizzata di Nginx
```

## Il Dockerfile Spiegato

Il Dockerfile in questo esempio utilizza due stage:

1. **Stage di Build**:
   - Utilizza `node:14` come immagine base
   - Installa le dipendenze e compila l'applicazione
   - Questo stage contiene tutti gli strumenti di sviluppo e build

2. **Stage di Produzione**:
   - Utilizza `nginx:alpine` come immagine base (molto più leggera)
   - Copia solo i file compilati dallo stage di build
   - Non include gli strumenti di sviluppo, node_modules, ecc.

## Vantaggi del Multi-stage Build

- **Immagini più piccole**: l'immagine finale contiene solo i file necessari per l'esecuzione
- **Maggiore sicurezza**: meno componenti significa meno vulnerabilità potenziali
- **Migliori prestazioni**: immagini più piccole si avviano più velocemente e utilizzano meno risorse

## Istruzioni per l'Utilizzo

### 1. Preparare i File dell'Applicazione

Assicurati che tutti i file necessari siano presenti:
- `package.json`
- `src/index.js`
- `nginx.conf`

### 2. Costruire l'Immagine

Esegui il seguente comando nella directory contenente il Dockerfile:

```bash
docker build -t app-ottimizzata .
```

### 3. Verificare le Dimensioni dell'Immagine

```bash
docker images
```

Osserva come l'immagine finale sia molto più piccola rispetto a un'immagine Node.js completa.

### 4. Eseguire un Container

```bash
docker run -d -p 8080:80 --name app-web app-ottimizzata
```

### 5. Accedere all'Applicazione

Apri il browser e vai all'indirizzo:

```
http://localhost:8080
```

## Confronto delle Dimensioni

Per apprezzare i vantaggi del multi-stage build, puoi confrontare le dimensioni:

```bash
# Costruisci un'immagine utilizzando solo il primo stage
docker build --target builder -t app-solo-build .

# Confronta le dimensioni
docker images
```

Dovresti notare una differenza significativa tra `app-solo-build` (grande) e `app-ottimizzata` (piccola).

## Esercizi Aggiuntivi

1. Modifica il Dockerfile per aggiungere uno stage intermedio per i test.

2. Prova a utilizzare un'immagine base ancora più leggera per lo stage di produzione, come `alpine` con un server web minimalista.

3. Aggiungi un terzo stage che crea un'immagine di debug con strumenti aggiuntivi.

## Concetti Appresi

- Utilizzo dei multi-stage build in Docker
- Separazione degli ambienti di build e produzione
- Ottimizzazione delle dimensioni delle immagini Docker
- Copia selettiva di file tra stage diversi