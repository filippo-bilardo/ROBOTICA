# Soluzioni Esercizi - Lazy Evaluation

In questo file trovi implementate tutte le soluzioni degli esercizi relativi al Modulo 7 - **Lazy Evaluation**.

## Struttura

Il file `Soluzioni.js` contiene l'implementazione completa di tutte le funzioni richieste dagli esercizi:

### Esercizio 1: Sequenze Base
- `range`: Generatore che produce una sequenza di numeri da start a end con passo specificato
- `fibonacci`: Generatore che produce la sequenza di Fibonacci
- `take`: Generatore che prende i primi n elementi da un iterabile
- `cycle`: Generatore che cicla indefinitamente su un iterabile
- `zip`: Generatore che combina elementi corrispondenti di più iterabili
- `flatten`: Generatore che appiattisce un array annidato

### Esercizio 2: Operatori su Sequenze
- `map`: Generatore che applica una funzione a ciascun elemento
- `filter`: Generatore che filtra elementi in base a un predicato
- `takeWhile`: Generatore che preleva elementi fino a una condizione
- `dropWhile`: Generatore che scarta elementi fino a una condizione
- `reduce`: Funzione che riduce un iterabile a un singolo valore
- `scan`: Generatore che produce risultati intermedi di una riduzione
- `chunkBy`: Generatore che raggruppa elementi consecutivi
- `chain`: Generatore che concatena più iterabili
- `pipe`: Funzione che compone operatori in pipeline

### Esercizio 3: Generatori Avanzati
- `traverseTree`: Generatore per attraversamento DFS di un albero
- `traverseTreeBFS`: Generatore per attraversamento BFS di un albero
- `statefulGenerator`: Generatore con stato che comunica bidirezionalmente
- `mapAllGenerators`: Generatore che mappa elementi di più generatori
- `memoizedGenerator`: Generatore con memoizzazione per calcoli costosi
- `Scheduler`: Classe per esecuzione cooperativa di task

### Esercizio 4: Casi d'Uso Reali
- `lazyFileReader`: Generatore asincrono per leggere file riga per riga
- `eventStream`: Generatore asincrono per stream di eventi
- `lazyPaginatedApi`: Generatore asincrono per API paginate
- `dataTransformPipeline`: Pipeline di trasformazione dati lazy
- `lazyCrawlDirectory`: Crawler di directory lazy con filtro pattern
- `LazyCacheManager`: Gestore di cache con caricamento lazy e politica LRU

## Come testare le soluzioni

Puoi testare le soluzioni eseguendo i file degli esercizi che importano le funzioni dalle soluzioni:

```javascript
// Importa le soluzioni
const soluzioni = require('../soluzioni/Soluzioni');

// Usa le funzioni implementate
console.log(Array.from(soluzioni.take(soluzioni.fibonacci(), 10)));
```

## Note Implementative

- Le implementazioni seguono i principi della programmazione funzionale
- Si è prestata particolare attenzione all'efficienza della memoria (lazy evaluation)
- Le funzioni sono state progettate per essere componibili
- I generatori asincroni gestiscono correttamente i flussi di dati asincroni
