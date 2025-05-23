# Introduzione all'Asincronia Funzionale

L'asincronia è una caratteristica fondamentale di JavaScript e di molti ambienti di programmazione moderni. Gestire operazioni asincrone in modo funzionale rappresenta una sfida e un'opportunità: da un lato dobbiamo preservare i principi della programmazione funzionale come immutabilità e componibilità, dall'altro possiamo sfruttare astrazioni funzionali per rendere il codice asincrono più prevedibile e manutenibile.

## Sfide dell'asincronia in programmazione funzionale

La programmazione funzionale è caratterizzata da:
- **Purezza**: le funzioni non hanno effetti collaterali
- **Immutabilità**: i dati non vengono modificati
- **Referential transparency**: le funzioni restituiscono sempre lo stesso output per lo stesso input

L'asincronia pone delle sfide a questi principi:
- Le operazioni asincrone sono intrinsecamente impure (dipendono dal tempo)
- I callback tradizionali portano a codice difficile da comporre
- Gli effetti collaterali (I/O, chiamate di rete) sono fondamentali nelle operazioni asincrone

## JavaScript: un linguaggio intrinsecamente asincrono

JavaScript è nato come linguaggio per interagire con il browser in modo asincrono. Alcune caratteristiche chiave:

- **Single-threaded**: JavaScript ha un singolo thread di esecuzione
- **Event loop**: il meccanismo che consente di gestire operazioni asincrone
- **Non-blocking I/O**: le operazioni di I/O non bloccano il thread principale

Questa architettura rende JavaScript particolarmente adatto a gestire molte connessioni simultanee (es. Node.js per i server), ma richiede un approccio specifico per gestire il flusso asincrono.

## Evoluzione dei pattern asincroni in JavaScript

### 1. Callback

Il pattern originale per gestire l'asincronia in JavaScript:

```javascript
function fetchData(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = () => {
    if (xhr.status === 200) {
      callback(null, xhr.responseText);
    } else {
      callback(new Error(`Errore: ${xhr.status}`));
    }
  };
  xhr.onerror = () => callback(new Error('Errore di rete'));
  xhr.send();
}

// Utilizzo
fetchData('https://api.example.com/data', (error, data) => {
  if (error) {
    console.error('Errore:', error);
    return;
  }
  console.log('Dati ricevuti:', data);
});
```

**Problemi:**
- **Callback Hell**: nidificazione profonda con operazioni sequenziali
- **Inversione del controllo**: si cede il controllo del flusso alla funzione chiamata
- **Gestione errori complessa**: ripetitiva e propensa a errori

### 2. Promise

Le Promise hanno rappresentato un significativo miglioramento:

```javascript
function fetchData(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`Errore: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Errore di rete'));
    xhr.send();
  });
}

// Utilizzo
fetchData('https://api.example.com/data')
  .then(data => console.log('Dati ricevuti:', data))
  .catch(error => console.error('Errore:', error));
```

**Vantaggi:**
- **Componibilità**: le Promise possono essere facilmente concatenate
- **Gestione errori centralizzata**: con `.catch()`
- **Stato immutabile**: una Promise può essere solo pending, fulfilled o rejected

### 3. Async/Await

Sintassi moderna che rende le Promise ancora più leggibili:

```javascript
async function getData() {
  try {
    const data = await fetchData('https://api.example.com/data');
    console.log('Dati ricevuti:', data);
    return data;
  } catch (error) {
    console.error('Errore:', error);
    throw error;
  }
}

// Utilizzo
getData().then(processedData => {
  // Uso i dati elaborati
});
```

**Vantaggi:**
- **Leggibilità**: il codice appare sequenziale
- **Gestione errori familiare**: con try/catch
- **È ancora Promise-based**: è solo zucchero sintattico sopra le Promise

### 4. Task Monad e altre astrazioni funzionali

L'evoluzione funzionale dell'asincronia porta a monad come Task:

```javascript
const fetchTask = url => new Task((reject, resolve) => {
  fetch(url)
    .then(response => response.json())
    .then(resolve)
    .catch(reject);
});

// Utilizzo
fetchTask('https://api.example.com/data')
  .map(data => data.filter(item => item.active))
  .chain(filteredData => saveTask(filteredData))
  .fork(
    error => console.error('Errore:', error),
    result => console.log('Operazione completata:', result)
  );
```

**Vantaggi:**
- **Lazy evaluation**: le operazioni vengono eseguite solo quando necessario
- **Componibilità avanzata**: operazioni come `map`, `chain`, `ap` permettono trasformazioni funzionali
- **Miglior isolamento degli effetti**: separazione tra definizione ed esecuzione

## Confronto tra approcci

| Caratteristica        | Callbacks        | Promise                   | Async/Await             | Task Monad               |
|-----------------------|------------------|---------------------------|-------------------------|--------------------------|
| Leggibilità           | Bassa            | Media                     | Alta                    | Media-Alta               |
| Componibilità         | Bassa            | Media                     | Media                   | Alta                     |
| Gestione errori       | Manuale          | Centralizzata             | Try/catch               | Funzionale               |
| Esecuzione            | Eager            | Eager                     | Eager                   | Lazy                     |
| Cancellabilità        | Manuale          | Non nativamente           | Non nativamente         | Spesso implementata      |
| Purezza funzionale    | Bassa            | Media                     | Media                   | Alta                     |

## Conclusione

L'asincronia in stile funzionale ci permette di:
- Mantenere la componibilità anche con operazioni che avvengono nel tempo
- Isolare gli effetti collaterali
- Creare astrazioni potenti per operazioni complesse

Nei prossimi capitoli esploreremo:
- Come utilizzare le Promise in stile funzionale
- Come sfruttare async/await mantenendo principi funzionali
- Come implementare e utilizzare il Task monad
- Come gestire effetti collaterali in codice asincrono
