# RxJS: Programmazione Reattiva Funzionale

**RxJS** (Reactive Extensions for JavaScript) è una libreria per la programmazione reattiva che utilizza **Observable** per comporre programmi asincroni e basati su eventi. Combina i pattern Observer, Iterator e la programmazione funzionale per gestire sequenze di eventi in modo elegante.

## Introduzione alla Programmazione Reattiva

### **Cos'è la Programmazione Reattiva?**

La programmazione reattiva è un paradigma di programmazione orientato ai **flussi di dati asincroni** e alla **propagazione del cambiamento**. Tutto può essere visto come uno stream: eventi UI, chiamate HTTP, timer, messaggi WebSocket, ecc.

```javascript
import { fromEvent, map, filter, debounceTime } from 'rxjs';

// Esempio: ricerca in tempo reale
const searchInput = document.getElementById('search');

const searchQuery$ = fromEvent(searchInput, 'input')
  .pipe(
    map(event => event.target.value),
    filter(query => query.length > 2),
    debounceTime(300)
  );

searchQuery$.subscribe(query => {
  console.log('Searching for:', query);
  // Esegui ricerca
});
```

### **Observable vs Promise**

```javascript
import { Observable, of } from 'rxjs';

// Promise: valore singolo, eager
const promise = fetch('/api/data')
  .then(response => response.json());

// Observable: stream di valori, lazy
const observable$ = new Observable(subscriber => {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      subscriber.next(data);
      subscriber.complete();
    })
    .catch(error => subscriber.error(error));
});

// Observable non si esegue finché non c'è una subscription
observable$.subscribe(data => console.log(data));
```

## Concetti Fondamentali

### **Observable, Observer, Subscription**

```javascript
import { Observable } from 'rxjs';

// Creazione di un Observable
const numbers$ = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});

// Observer
const observer = {
  next: value => console.log('Received:', value),
  error: error => console.error('Error:', error),
  complete: () => console.log('Stream completed')
};

// Subscription
const subscription = numbers$.subscribe(observer);

// Cleanup
setTimeout(() => {
  subscription.unsubscribe();
}, 2000);
```

### **Creation Operators**

```javascript
import { 
  of, from, interval, timer, fromEvent, 
  range, generate, defer, EMPTY, NEVER 
} from 'rxjs';

// of: crea Observable da valori statici
const staticValues$ = of(1, 2, 3, 4, 5);

// from: crea Observable da array, Promise, o Iterable
const fromArray$ = from([1, 2, 3, 4, 5]);
const fromPromise$ = from(fetch('/api/data'));

// interval: emette numeri sequenziali a intervalli
const everySecond$ = interval(1000);

// timer: emette dopo un delay, poi opzionalmente a intervalli
const delayed$ = timer(2000); // Emette dopo 2 secondi
const delayedInterval$ = timer(1000, 500); // Dopo 1s, poi ogni 500ms

// fromEvent: crea Observable da eventi DOM
const clicks$ = fromEvent(document, 'click');
const keyups$ = fromEvent(document, 'keyup');

// range: emette sequenza di numeri
const range$ = range(1, 10); // da 1 a 10

// generate: genera valori con logica custom
const fibonacci$ = generate({
  initialState: [0, 1],
  condition: ([a, b]) => a < 100,
  iterate: ([a, b]) => [b, a + b],
  resultSelector: ([a, b]) => a
});
```

## Operatori di Trasformazione

### **map, pluck, mapTo**

```javascript
import { of, fromEvent } from 'rxjs';
import { map, pluck, mapTo } from 'rxjs/operators';

// map: trasforma ogni valore
const numbers$ = of(1, 2, 3, 4, 5);
const doubled$ = numbers$.pipe(
  map(x => x * 2)
);

// pluck: estrae una proprietà
const users$ = of(
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 }
);
const names$ = users$.pipe(pluck('name'));

// mapTo: mappa tutti i valori a un valore costante
const clicks$ = fromEvent(document, 'click');
const clickCounts$ = clicks$.pipe(mapTo(1));
```

### **flatMap Operators (mergeMap, switchMap, concatMap, exhaustMap)**

```javascript
import { fromEvent, of, timer } from 'rxjs';
import { 
  mergeMap, switchMap, concatMap, exhaustMap,
  map, delay 
} from 'rxjs/operators';

const clicks$ = fromEvent(document, 'click');

// mergeMap: merge di tutti gli inner observables
const mergeMapExample$ = clicks$.pipe(
  mergeMap(() => timer(0, 1000).pipe(take(3)))
);

// switchMap: cancella inner observable precedente
const switchMapExample$ = clicks$.pipe(
  switchMap(() => timer(0, 1000).pipe(take(3)))
);

// concatMap: aspetta che inner observable completi prima del prossimo
const concatMapExample$ = clicks$.pipe(
  concatMap(() => timer(0, 1000).pipe(take(3)))
);

// exhaustMap: ignora nuovi valori finché inner observable è attivo
const exhaustMapExample$ = clicks$.pipe(
  exhaustMap(() => timer(0, 1000).pipe(take(3)))
);
```

### **Practical Example: HTTP Requests**

```javascript
import { fromEvent, of } from 'rxjs';
import { 
  switchMap, map, catchError, debounceTime, 
  distinctUntilChanged, filter 
} from 'rxjs/operators';

const searchInput = document.getElementById('search');

const searchResults$ = fromEvent(searchInput, 'input').pipe(
  map(event => event.target.value),
  filter(query => query.length > 2),
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => 
    fetch(`/api/search?q=${query}`)
      .then(response => response.json())
      .catch(error => of({ error: error.message }))
  )
);

searchResults$.subscribe(results => {
  console.log('Search results:', results);
});
```

## Operatori di Filtraggio

### **filter, take, skip, distinct**

```javascript
import { range, interval } from 'rxjs';
import { 
  filter, take, skip, takeWhile, takeUntil,
  distinct, distinctUntilChanged, first, last
} from 'rxjs/operators';

const numbers$ = range(1, 10);

// filter: filtra valori basato su predicato
const evens$ = numbers$.pipe(
  filter(x => x % 2 === 0)
);

// take: prende i primi n valori
const firstThree$ = numbers$.pipe(take(3));

// skip: salta i primi n valori
const skipFirst$ = numbers$.pipe(skip(3));

// takeWhile: prende valori finché condizione è vera
const lessThanFive$ = numbers$.pipe(
  takeWhile(x => x < 5)
);

// takeUntil: prende valori fino a quando altro Observable emette
const stopTimer$ = fromEvent(document, 'click');
const timerUntilClick$ = interval(1000).pipe(
  takeUntil(stopTimer$)
);

// distinct: rimuove duplicati
const withDuplicates$ = of(1, 2, 2, 3, 3, 3, 4, 5, 5);
const unique$ = withDuplicates$.pipe(distinct());

// distinctUntilChanged: rimuove duplicati consecutivi
const distinctConsecutive$ = of(1, 1, 2, 2, 2, 3, 2, 1).pipe(
  distinctUntilChanged()
);
```

## Operatori di Combinazione

### **merge, concat, combineLatest, zip**

```javascript
import { merge, concat, combineLatest, zip, of, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

const odds$ = of(1, 3, 5);
const evens$ = of(2, 4, 6);

// merge: combina streams emettendo valori appena disponibili
const merged$ = merge(odds$, evens$);
// Output: 1, 3, 5, 2, 4, 6 (ordine non garantito)

// concat: concatena streams in sequenza
const concatenated$ = concat(odds$, evens$);
// Output: 1, 3, 5, 2, 4, 6 (prima odds$, poi evens$)

// combineLatest: combina ultimi valori da ogni stream
const temperature$ = of(20, 22, 24);
const humidity$ = of(45, 50, 55);

const weather$ = combineLatest([temperature$, humidity$]).pipe(
  map(([temp, humidity]) => ({ temperature: temp, humidity }))
);

// zip: combina valori corrispondenti da ogni stream
const names$ = of('Alice', 'Bob', 'Charlie');
const ages$ = of(25, 30, 35);

const users$ = zip(names$, ages$).pipe(
  map(([name, age]) => ({ name, age }))
);
```

### **Advanced Combination Patterns**

```javascript
import { 
  withLatestFrom, startWith, pairwise, 
  sample, audit, buffer 
} from 'rxjs/operators';
import { fromEvent, interval } from 'rxjs';

const clicks$ = fromEvent(document, 'click');
const timer$ = interval(1000);

// withLatestFrom: combina con ultimo valore di altro stream
const clicksWithTime$ = clicks$.pipe(
  withLatestFrom(timer$),
  map(([click, time]) => ({ click, time }))
);

// startWith: inizia stream con valore iniziale
const numbersWithStart$ = of(2, 3, 4).pipe(
  startWith(1)
); // Output: 1, 2, 3, 4

// pairwise: emette valore corrente e precedente
const pairs$ = of(1, 2, 3, 4, 5).pipe(
  pairwise()
); // Output: [1,2], [2,3], [3,4], [4,5]

// sample: campiona un stream basato su altro stream
const sampled$ = timer$.pipe(
  sample(clicks$) // Emette valore di timer$ ad ogni click
);
```

## Gestione degli Errori

### **catchError, retry, retryWhen**

```javascript
import { of, throwError, timer } from 'rxjs';
import { 
  catchError, retry, retryWhen, 
  delay, take, concatMap 
} from 'rxjs/operators';

// catchError: gestisce errori e ritorna stream alternativo
const withErrorHandling$ = of(1, 2, 3).pipe(
  map(x => {
    if (x === 2) throw new Error('Something went wrong');
    return x;
  }),
  catchError(error => {
    console.error('Caught error:', error);
    return of('Error handled');
  })
);

// retry: riprova n volte in caso di errore
const withRetry$ = of(1, 2, 3).pipe(
  map(x => {
    if (x === 2 && Math.random() > 0.5) {
      throw new Error('Random error');
    }
    return x;
  }),
  retry(3)
);

// retryWhen: logica custom per retry
const withCustomRetry$ = of(1, 2, 3).pipe(
  map(x => {
    if (x === 2) throw new Error('Error');
    return x;
  }),
  retryWhen(errors =>
    errors.pipe(
      delay(1000), // Aspetta 1 secondo prima di riprovare
      take(3) // Massimo 3 tentativi
    )
  )
);
```

### **Error Recovery Patterns**

```javascript
import { ajax } from 'rxjs/ajax';
import { switchMap, catchError, of } from 'rxjs';

// Pattern: Fallback to cache
const fetchWithFallback = (url) => 
  ajax.getJSON(url).pipe(
    catchError(error => {
      console.warn('API failed, using cache');
      return getCachedData();
    })
  );

// Pattern: Exponential backoff
const fetchWithBackoff = (url) => 
  ajax.getJSON(url).pipe(
    retryWhen(errors =>
      errors.pipe(
        concatMap((error, index) => {
          if (index >= 3) {
            return throwError(error);
          }
          const backoffTime = Math.pow(2, index) * 1000;
          return timer(backoffTime);
        })
      )
    )
  );
```

## Utility Operators

### **tap, delay, timeout, finalize**

```javascript
import { of, timer } from 'rxjs';
import { 
  tap, delay, timeout, finalize, 
  timeoutWith, share 
} from 'rxjs/operators';

const numbers$ = of(1, 2, 3, 4, 5);

// tap: side effects senza modificare lo stream
const withLogging$ = numbers$.pipe(
  tap(x => console.log('Processing:', x)),
  map(x => x * 2),
  tap(x => console.log('Result:', x))
);

// delay: ritarda emissione
const delayed$ = numbers$.pipe(
  delay(1000)
);

// timeout: timeout per emissioni
const withTimeout$ = timer(2000).pipe(
  timeout(1000), // Errore se non emette entro 1 secondo
  catchError(error => of('Timeout occurred'))
);

// timeoutWith: timeout con fallback stream
const withTimeoutFallback$ = timer(2000).pipe(
  timeoutWith(1000, of('Fallback value'))
);

// finalize: cleanup quando stream completa o errore
const withFinalize$ = numbers$.pipe(
  finalize(() => console.log('Stream finished'))
);
```

## Subjects

### **Subject, BehaviorSubject, ReplaySubject, AsyncSubject**

```javascript
import { 
  Subject, BehaviorSubject, ReplaySubject, AsyncSubject 
} from 'rxjs';

// Subject: basic multicast
const subject = new Subject();

subject.subscribe(x => console.log('Observer 1:', x));
subject.next(1);
subject.subscribe(x => console.log('Observer 2:', x)); // Non riceve 1
subject.next(2); // Entrambi ricevono 2

// BehaviorSubject: mantiene ultimo valore
const behaviorSubject = new BehaviorSubject(0); // Valore iniziale

behaviorSubject.subscribe(x => console.log('Observer 1:', x)); // Riceve 0
behaviorSubject.next(1);
behaviorSubject.subscribe(x => console.log('Observer 2:', x)); // Riceve 1
behaviorSubject.next(2); // Entrambi ricevono 2

// ReplaySubject: replay di n valori precedenti
const replaySubject = new ReplaySubject(2); // Replay ultimi 2 valori

replaySubject.next(1);
replaySubject.next(2);
replaySubject.next(3);
replaySubject.subscribe(x => console.log('Observer:', x)); // Riceve 2, 3

// AsyncSubject: solo ultimo valore quando completa
const asyncSubject = new AsyncSubject();

asyncSubject.subscribe(x => console.log('Observer:', x));
asyncSubject.next(1);
asyncSubject.next(2);
asyncSubject.next(3);
asyncSubject.complete(); // Solo ora observer riceve 3
```

## Pattern Pratici

### **State Management**

```javascript
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

class Store {
  constructor(initialState) {
    this._state$ = new BehaviorSubject(initialState);
  }
  
  // Getter per lo state
  get state$() {
    return this._state$.asObservable();
  }
  
  // Selettore per porzioni specifiche dello state
  select(selector) {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }
  
  // Aggiornamento dello state
  update(updater) {
    const currentState = this._state$.value;
    const newState = updater(currentState);
    this._state$.next(newState);
  }
}

// Utilizzo
const store = new Store({
  user: null,
  posts: [],
  loading: false
});

// Subscribe a cambiamenti dell'utente
const user$ = store.select(state => state.user);
user$.subscribe(user => console.log('User changed:', user));

// Aggiorna state
store.update(state => ({
  ...state,
  user: { name: 'Alice', id: 1 }
}));
```

### **Event Bus Pattern**

```javascript
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

class EventBus {
  constructor() {
    this._events$ = new Subject();
  }
  
  // Emetti evento
  emit(type, payload) {
    this._events$.next({ type, payload, timestamp: Date.now() });
  }
  
  // Ascolta eventi di un tipo specifico
  on(type) {
    return this._events$.pipe(
      filter(event => event.type === type),
      map(event => event.payload)
    );
  }
  
  // Ascolta tutti gli eventi
  onAll() {
    return this._events$.asObservable();
  }
}

// Utilizzo
const eventBus = new EventBus();

// Listeners
eventBus.on('user-login').subscribe(user => {
  console.log('User logged in:', user);
});

eventBus.on('notification').subscribe(notification => {
  console.log('New notification:', notification);
});

// Emit events
eventBus.emit('user-login', { id: 1, name: 'Alice' });
eventBus.emit('notification', { message: 'Welcome!', type: 'success' });
```

### **WebSocket Real-time Data**

```javascript
import { webSocket } from 'rxjs/webSocket';
import { retryWhen, delay, tap } from 'rxjs/operators';

// WebSocket connection con auto-retry
const createWebSocketConnection = (url) => {
  return webSocket(url).pipe(
    retryWhen(errors =>
      errors.pipe(
        tap(error => console.warn('WebSocket error, retrying...', error)),
        delay(5000) // Retry ogni 5 secondi
      )
    )
  );
};

const websocket$ = createWebSocketConnection('ws://localhost:8080');

// Gestione messaggi
websocket$.subscribe({
  next: message => console.log('Received:', message),
  error: error => console.error('WebSocket error:', error),
  complete: () => console.log('WebSocket connection closed')
});

// Invio messaggi
websocket$.next({ type: 'subscribe', channel: 'user-updates' });
```

## Best Practices e Performance

### **Memory Management**

```javascript
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

class Component {
  constructor() {
    this.destroy$ = new Subject();
    this.init();
  }
  
  init() {
    // Tutti i subscriptions terminano quando component viene distrutto
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(x => console.log(x));
    
    fromEvent(window, 'resize').pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.onResize());
  }
  
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### **Cold vs Hot Observables**

```javascript
import { share, shareReplay } from 'rxjs/operators';

// Cold Observable: ogni subscription crea nuova esecuzione
const cold$ = new Observable(subscriber => {
  console.log('New execution');
  subscriber.next(Math.random());
});

cold$.subscribe(x => console.log('Sub 1:', x));
cold$.subscribe(x => console.log('Sub 2:', x)); // Diverso valore

// Hot Observable: condiviso tra subscriptions
const hot$ = cold$.pipe(share());

hot$.subscribe(x => console.log('Sub 1:', x));
hot$.subscribe(x => console.log('Sub 2:', x)); // Stesso valore

// shareReplay: hot + replay di valori precedenti
const hotWithReplay$ = cold$.pipe(shareReplay(1));
```

## Quando Usare RxJS

✅ **Usa RxJS quando:**
- Gestisci eventi complessi e asincroni
- Hai bisogno di composizione di operazioni asincrone
- Lavori con stream di dati in tempo reale
- Vuoi gestire state reattivo
- Hai logica complessa di cancellazione/retry

❌ **Evita RxJS quando:**
- Hai operazioni asincrone semplici (usa Promise)
- Il team non ha familiarità con programmazione reattiva
- Hai vincoli di bundle size stringenti
- La logica è principalmente sincrona

RxJS è potente ma ha una curva di apprendimento ripida. Inizia con pattern semplici e costruisci gradualmente la complessità.
