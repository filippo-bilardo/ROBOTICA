/**
 * ESERCIZI RXJS - REACTIVE FUNCTIONAL PROGRAMMING
 * 
 * Esercizi per padroneggiare RxJS e la programmazione reattiva funzionale.
 * Focus su: Observables, Operators, Subjects, Error Handling, Backpressure.
 */

const { 
    Observable, Subject, BehaviorSubject, ReplaySubject, AsyncSubject,
    fromEvent, interval, timer, of, from, range, throwError, EMPTY, NEVER,
    merge, concat, combineLatest, zip, race, forkJoin
} = require('rxjs');

const { 
    map, filter, debounceTime, throttleTime, distinctUntilChanged,
    mergeMap, switchMap, concatMap, exhaustMap,
    scan, reduce, tap, share, shareReplay,
    catchError, retry, retryWhen, timeout,
    take, takeUntil, takeWhile, skip, skipUntil,
    startWith, endWith, pairwise, bufferTime, bufferCount,
    groupBy, partition, pluck, switchMapTo,
    delay, delayWhen, audit, sample,
    combineAll, mergeAll, concatAll,
    first, last, find, every, isEmpty
} = require('rxjs/operators');

console.log('=== ESERCIZI RXJS ===\n');

// ==============================================
// ESERCIZIO 1: BASIC OBSERVABLES E OPERATORS
// ==============================================

console.log('--- ESERCIZIO 1: Basic Observables ---');

// 1.1 Creazione di Observable personalizzati
// TODO: Implementa Observable da zero
const createNumberStream = (start, end, intervalMs) => {
    return new Observable(observer => {
        let current = start;
        
        const intervalId = setInterval(() => {
            if (current <= end) {
                observer.next(current);
                current++;
            } else {
                observer.complete();
                clearInterval(intervalId);
            }
        }, intervalMs);
        
        // Cleanup function
        return () => {
            clearInterval(intervalId);
            console.log('🧹 Stream cleaned up');
        };
    });
};

console.log('1.1 Custom Observable:');
const numberStream$ = createNumberStream(1, 5, 300);
numberStream$.subscribe({
    next: value => console.log(`Number: ${value}`),
    complete: () => console.log('✅ Number stream completed')
});

// 1.2 Transformation operators
// TODO: Implementa pipeline di trasformazione
const userData$ = of(
    { id: 1, name: 'alice cooper', email: 'ALICE@EXAMPLE.COM', age: 25 },
    { id: 2, name: 'bob dylan', email: 'bob@EXAMPLE.com', age: 30 },
    { id: 3, name: 'charlie parker', email: 'charlie@example.COM', age: 35 }
);

const normalizedUsers$ = userData$.pipe(
    map(user => ({
        ...user,
        name: user.name.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        email: user.email.toLowerCase()
    })),
    filter(user => user.age >= 30),
    tap(user => console.log(`Processing user: ${user.name}`))
);

setTimeout(() => {
    console.log('\n1.2 User transformation:');
    normalizedUsers$.subscribe(user => console.log('Normalized user:', user));
}, 2000);

// 1.3 Error handling
// TODO: Implementa gestione errori robusta
const unreliableApi$ = interval(500).pipe(
    map(i => {
        if (i === 2) throw new Error('API Error!');
        if (i === 5) throw new Error('Network Error!');
        return { id: i, data: `Data ${i}` };
    }),
    take(8)
);

const resilientApi$ = unreliableApi$.pipe(
    catchError(err => {
        console.log(`⚠️ Caught error: ${err.message}`);
        return of({ id: -1, data: 'FALLBACK_DATA', error: true });
    }),
    retry(2)
);

setTimeout(() => {
    console.log('\n1.3 Error handling:');
    resilientApi$.subscribe({
        next: data => console.log('API response:', data),
        error: err => console.log('❌ Final error:', err.message),
        complete: () => console.log('✅ API stream completed')
    });
}, 4000);

// ==============================================
// ESERCIZIO 2: SUBJECTS E MULTICASTING
// ==============================================

console.log('\n--- ESERCIZIO 2: Subjects e Multicasting ---');

// 2.1 Event Bus implementation
// TODO: Implementa un event bus con Subject
class EventBus {
    constructor() {
        this.subjects = new Map();
    }

    emit(eventType, data) {
        if (!this.subjects.has(eventType)) {
            this.subjects.set(eventType, new Subject());
        }
        this.subjects.get(eventType).next(data);
    }

    on(eventType) {
        if (!this.subjects.has(eventType)) {
            this.subjects.set(eventType, new Subject());
        }
        return this.subjects.get(eventType).asObservable();
    }

    off(eventType) {
        if (this.subjects.has(eventType)) {
            this.subjects.get(eventType).complete();
            this.subjects.delete(eventType);
        }
    }
}

const eventBus = new EventBus();

// Subscribe to events
eventBus.on('user:login').subscribe(data => 
    console.log('🔐 User logged in:', data)
);

eventBus.on('user:action').subscribe(data => 
    console.log('👤 User action:', data)
);

setTimeout(() => {
    console.log('2.1 Event Bus:');
    eventBus.emit('user:login', { userId: 123, timestamp: Date.now() });
    eventBus.emit('user:action', { action: 'click', element: 'button' });
}, 6000);

// 2.2 State management con BehaviorSubject
// TODO: Implementa store reattivo
class ReactiveStore {
    constructor(initialState) {
        this._state$ = new BehaviorSubject(initialState);
    }

    getState() {
        return this._state$.value;
    }

    setState(newState) {
        this._state$.next({ ...this.getState(), ...newState });
    }

    select(selector) {
        return this._state$.pipe(
            map(selector),
            distinctUntilChanged()
        );
    }

    subscribe(observer) {
        return this._state$.subscribe(observer);
    }
}

const store = new ReactiveStore({
    user: null,
    todos: [],
    ui: { loading: false, theme: 'light' }
});

// Subscribe to specific state slices
store.select(state => state.user).subscribe(user => 
    console.log('👤 User state changed:', user)
);

store.select(state => state.ui.theme).subscribe(theme => 
    console.log('🎨 Theme changed:', theme)
);

setTimeout(() => {
    console.log('\n2.2 Reactive Store:');
    store.setState({ user: { id: 1, name: 'Alice' } });
    store.setState({ ui: { ...store.getState().ui, theme: 'dark' } });
}, 8000);

// 2.3 ReplaySubject per caching
// TODO: Implementa cache con ReplaySubject
const createCachedApi = (bufferSize = 3) => {
    const cache$ = new ReplaySubject(bufferSize);
    let requestId = 0;

    const fetchData = () => {
        requestId++;
        const data = {
            id: requestId,
            timestamp: Date.now(),
            data: `Cached data ${requestId}`
        };
        cache$.next(data);
        return data;
    };

    return {
        getData: fetchData,
        getCached: () => cache$.asObservable()
    };
};

const cachedApi = createCachedApi(2);

setTimeout(() => {
    console.log('\n2.3 Cached API:');
    
    // Generate some cached data
    cachedApi.getData();
    cachedApi.getData();
    cachedApi.getData();
    
    // New subscriber gets cached data
    setTimeout(() => {
        console.log('New subscriber gets cached data:');
        cachedApi.getCached().pipe(take(3)).subscribe(data => 
            console.log('📦 Cached:', data)
        );
    }, 500);
}, 10000);

// ==============================================
// ESERCIZIO 3: COMBINATION OPERATORS
// ==============================================

console.log('\n--- ESERCIZIO 3: Combination Operators ---');

// 3.1 Data aggregation con combineLatest
// TODO: Implementa dashboard reattiva
const temperature$ = interval(1000).pipe(
    map(() => 20 + Math.random() * 10),
    map(temp => Math.round(temp * 10) / 10)
);

const humidity$ = interval(1500).pipe(
    map(() => 40 + Math.random() * 30),
    map(humidity => Math.round(humidity * 10) / 10)
);

const pressure$ = interval(2000).pipe(
    map(() => 1013 + Math.random() * 20 - 10),
    map(pressure => Math.round(pressure * 10) / 10)
);

const dashboard$ = combineLatest([
    temperature$.pipe(startWith(0)),
    humidity$.pipe(startWith(0)),
    pressure$.pipe(startWith(0))
]).pipe(
    map(([temperature, humidity, pressure]) => ({
        temperature,
        humidity,
        pressure,
        timestamp: new Date().toLocaleTimeString(),
        status: temperature > 25 ? 'HOT' : temperature < 18 ? 'COLD' : 'OK'
    }))
);

setTimeout(() => {
    console.log('\n3.1 Dashboard aggregation:');
    const dashboardSub = dashboard$.subscribe(data => 
        console.log(`🌡️ T:${data.temperature}°C H:${data.humidity}% P:${data.pressure}hPa [${data.status}]`)
    );
    
    // Stop after 8 seconds
    setTimeout(() => dashboardSub.unsubscribe(), 8000);
}, 12000);

// 3.2 Race conditions e competitive streams
// TODO: Implementa timeout e fallback
const primaryApi$ = timer(2000).pipe(
    map(() => ({ source: 'primary', data: 'Primary API data' }))
);

const fallbackApi$ = timer(1000).pipe(
    map(() => ({ source: 'fallback', data: 'Fallback API data' }))
);

const cachedData$ = of({ source: 'cache', data: 'Cached data' });

const dataWithFallback$ = race([
    primaryApi$,
    fallbackApi$,
    cachedData$.pipe(delay(500))
]);

setTimeout(() => {
    console.log('\n3.2 Race conditions:');
    dataWithFallback$.subscribe(result => 
        console.log(`🏃 Winner: ${result.source} - ${result.data}`)
    );
}, 20000);

// 3.3 Sequential operations con concat
// TODO: Implementa workflow sequenziale
const step1$ = of('Step 1: Initialize').pipe(delay(500));
const step2$ = of('Step 2: Load data').pipe(delay(800));
const step3$ = of('Step 3: Process data').pipe(delay(600));
const step4$ = of('Step 4: Complete').pipe(delay(400));

const workflow$ = concat(step1$, step2$, step3$, step4$).pipe(
    tap(step => console.log(`⚙️ ${step}`))
);

setTimeout(() => {
    console.log('\n3.3 Sequential workflow:');
    workflow$.subscribe({
        complete: () => console.log('✅ Workflow completed')
    });
}, 22000);

// ==============================================
// ESERCIZIO 4: ADVANCED OPERATORS
// ==============================================

console.log('\n--- ESERCIZIO 4: Advanced Operators ---');

// 4.1 Flatten strategies comparison
// TODO: Implementa e confronta mergeMap, switchMap, concatMap
const searchQuery$ = new Subject();

// mergeMap: Non cancella le richieste precedenti
const mergeMapSearch$ = searchQuery$.pipe(
    debounceTime(300),
    mergeMap(query => 
        timer(Math.random() * 1000).pipe(
            map(() => `MergeMap result for "${query}"`)
        )
    )
);

// switchMap: Cancella le richieste precedenti
const switchMapSearch$ = searchQuery$.pipe(
    debounceTime(300),
    switchMap(query => 
        timer(Math.random() * 1000).pipe(
            map(() => `SwitchMap result for "${query}"`)
        )
    )
);

// concatMap: Esegue in sequenza
const concatMapSearch$ = searchQuery$.pipe(
    debounceTime(300),
    concatMap(query => 
        timer(Math.random() * 1000).pipe(
            map(() => `ConcatMap result for "${query}"`)
        )
    )
);

setTimeout(() => {
    console.log('\n4.1 Flatten strategies:');
    
    mergeMapSearch$.subscribe(result => console.log('🔀', result));
    switchMapSearch$.subscribe(result => console.log('🔄', result));
    concatMapSearch$.subscribe(result => console.log('➡️', result));
    
    // Simulate rapid searches
    setTimeout(() => searchQuery$.next('a'), 100);
    setTimeout(() => searchQuery$.next('ap'), 200);
    setTimeout(() => searchQuery$.next('app'), 300);
    setTimeout(() => searchQuery$.next('appl'), 400);
    setTimeout(() => searchQuery$.next('apple'), 500);
}, 25000);

// 4.2 Buffering e windowing
// TODO: Implementa aggregation con buffer
const mouseClicks$ = new Subject();
const doubleClick$ = mouseClicks$.pipe(
    bufferTime(300),
    filter(clicks => clicks.length >= 2),
    map(clicks => ({ type: 'double-click', count: clicks.length }))
);

const clickStream$ = mouseClicks$.pipe(
    scan((acc, click) => acc + 1, 0),
    share()
);

setTimeout(() => {
    console.log('\n4.2 Click detection:');
    
    doubleClick$.subscribe(event => 
        console.log(`🖱️ ${event.type} detected (${event.count} clicks)`)
    );
    
    // Simulate clicks
    setTimeout(() => mouseClicks$.next('click'), 100);
    setTimeout(() => mouseClicks$.next('click'), 200);
    setTimeout(() => mouseClicks$.next('click'), 1000);
    setTimeout(() => mouseClicks$.next('click'), 1100);
    setTimeout(() => mouseClicks$.next('click'), 1150);
}, 30000);

// 4.3 Group operations
// TODO: Implementa grouping e aggregation
const events$ = interval(200).pipe(
    map(i => ({
        id: i,
        category: ['A', 'B', 'C'][i % 3],
        value: Math.random() * 100,
        timestamp: Date.now()
    })),
    take(15)
);

const groupedEvents$ = events$.pipe(
    groupBy(event => event.category),
    mergeMap(group$ => 
        group$.pipe(
            scan((acc, event) => ({
                category: event.category,
                count: acc.count + 1,
                totalValue: acc.totalValue + event.value,
                avgValue: (acc.totalValue + event.value) / (acc.count + 1)
            }), { count: 0, totalValue: 0, avgValue: 0 })
        )
    )
);

setTimeout(() => {
    console.log('\n4.3 Grouped aggregation:');
    groupedEvents$.subscribe(result => 
        console.log(`📊 Category ${result.category}: Count=${result.count}, Avg=${result.avgValue.toFixed(2)}`)
    );
}, 35000);

// ==============================================
// ESERCIZIO 5: REAL-WORLD PATTERNS
// ==============================================

console.log('\n--- ESERCIZIO 5: Real-world Patterns ---');

// 5.1 Polling con backoff
// TODO: Implementa polling intelligente
const createPollingWithBackoff = (apiCall, initialInterval = 1000, maxInterval = 30000) => {
    return new Observable(observer => {
        let currentInterval = initialInterval;
        let timeoutId;
        
        const poll = () => {
            apiCall().subscribe({
                next: data => {
                    observer.next(data);
                    currentInterval = initialInterval; // Reset on success
                    timeoutId = setTimeout(poll, currentInterval);
                },
                error: err => {
                    console.log(`🔄 Polling failed, retrying in ${currentInterval}ms`);
                    currentInterval = Math.min(currentInterval * 2, maxInterval);
                    timeoutId = setTimeout(poll, currentInterval);
                }
            });
        };
        
        poll();
        
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    });
};

const flakyApi = () => {
    return new Observable(observer => {
        if (Math.random() > 0.7) {
            observer.next({ data: 'Success!', timestamp: Date.now() });
            observer.complete();
        } else {
            observer.error(new Error('API temporarily unavailable'));
        }
    });
};

setTimeout(() => {
    console.log('\n5.1 Smart polling:');
    const pollingSub = createPollingWithBackoff(flakyApi, 1000, 8000)
        .pipe(take(3))
        .subscribe({
            next: data => console.log('📡 Polling success:', data),
            complete: () => console.log('✅ Polling completed')
        });
}, 40000);

// 5.2 Real-time notifications
// TODO: Implementa notification system
class NotificationService {
    constructor() {
        this.notifications$ = new Subject();
        this.priorities = ['low', 'medium', 'high', 'critical'];
    }

    send(message, priority = 'medium') {
        const notification = {
            id: Date.now(),
            message,
            priority,
            timestamp: new Date(),
            read: false
        };
        this.notifications$.next(notification);
    }

    getNotifications() {
        return this.notifications$.asObservable();
    }

    getCriticalNotifications() {
        return this.notifications$.pipe(
            filter(notification => notification.priority === 'critical')
        );
    }

    getNotificationsByPriority(priority) {
        return this.notifications$.pipe(
            filter(notification => notification.priority === priority),
            scan((acc, notification) => [...acc, notification], [])
        );
    }
}

const notificationService = new NotificationService();

setTimeout(() => {
    console.log('\n5.2 Notification system:');
    
    notificationService.getNotifications().subscribe(notification => 
        console.log(`🔔 [${notification.priority.toUpperCase()}] ${notification.message}`)
    );
    
    notificationService.getCriticalNotifications().subscribe(notification => 
        console.log(`🚨 CRITICAL ALERT: ${notification.message}`)
    );
    
    // Send test notifications
    setTimeout(() => notificationService.send('System started', 'low'), 100);
    setTimeout(() => notificationService.send('New message received', 'medium'), 500);
    setTimeout(() => notificationService.send('Server overload detected!', 'critical'), 1000);
    setTimeout(() => notificationService.send('Backup completed', 'low'), 1500);
}, 45000);

// 5.3 WebSocket connection manager
// TODO: Implementa WebSocket con reconnection
class WebSocketManager {
    constructor(url) {
        this.url = url;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 1000;
        this.connection$ = this.createConnection();
    }

    createConnection() {
        return new Observable(observer => {
            console.log(`🔌 Attempting to connect to ${this.url}...`);
            
            // Simulate WebSocket connection
            const isConnected = Math.random() > 0.3;
            
            if (isConnected) {
                console.log('✅ Connected successfully');
                this.reconnectAttempts = 0;
                
                // Simulate messages
                const messageInterval = setInterval(() => {
                    if (Math.random() > 0.1) {
                        observer.next({
                            type: 'message',
                            data: `Message ${Date.now()}`,
                            timestamp: Date.now()
                        });
                    } else {
                        // Simulate connection loss
                        observer.error(new Error('Connection lost'));
                        clearInterval(messageInterval);
                    }
                }, 2000);
                
                return () => {
                    clearInterval(messageInterval);
                    console.log('🔌 Connection closed');
                };
            } else {
                setTimeout(() => {
                    observer.error(new Error('Failed to connect'));
                }, 1000);
            }
        }).pipe(
            retryWhen(errors => errors.pipe(
                tap(err => {
                    this.reconnectAttempts++;
                    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                }),
                delay(this.reconnectInterval),
                take(this.maxReconnectAttempts)
            ))
        );
    }

    connect() {
        return this.connection$;
    }
}

setTimeout(() => {
    console.log('\n5.3 WebSocket manager:');
    const wsManager = new WebSocketManager('ws://localhost:8080');
    
    const connectionSub = wsManager.connect().subscribe({
        next: message => console.log('📨 WebSocket message:', message.data),
        error: err => console.log('❌ WebSocket error:', err.message),
        complete: () => console.log('🔌 WebSocket connection ended')
    });
    
    // Cleanup after 10 seconds
    setTimeout(() => connectionSub.unsubscribe(), 10000);
}, 50000);

// ==============================================
// ESERCIZI BONUS
// ==============================================

console.log('\n--- ESERCIZI BONUS ---');

// BONUS 1: Custom operator
// TODO: Crea operator personalizzato
const tapOnce = () => {
    let hasTapped = false;
    return tap(value => {
        if (!hasTapped) {
            console.log('🎯 First value:', value);
            hasTapped = true;
        }
    });
};

// BONUS 2: Memory leak detection
// TODO: Implementa leak detection
const createLeakDetector = () => {
    const subscriptions = new Set();
    
    return {
        track: (subscription) => {
            subscriptions.add(subscription);
            return subscription;
        },
        
        checkLeaks: () => {
            const activeCount = Array.from(subscriptions)
                .filter(sub => !sub.closed).length;
            console.log(`🕵️ Active subscriptions: ${activeCount}`);
            return activeCount;
        },
        
        cleanup: () => {
            subscriptions.forEach(sub => {
                if (!sub.closed) sub.unsubscribe();
            });
            subscriptions.clear();
        }
    };
};

const leakDetector = createLeakDetector();

setTimeout(() => {
    console.log('\nBonus - Custom operators & leak detection:');
    
    const testStream$ = interval(1000).pipe(
        take(5),
        tapOnce(),
        map(x => x * 2)
    );
    
    const sub = leakDetector.track(testStream$.subscribe(value => 
        console.log('🔢 Value:', value)
    ));
    
    setTimeout(() => leakDetector.checkLeaks(), 3000);
    setTimeout(() => leakDetector.cleanup(), 6000);
}, 60000);

console.log('\n✅ Esercizi RxJS avviati!');
console.log('🚀 Gli esempi verranno eseguiti nei prossimi 70 secondi...');
console.log('💡 Suggerimenti:');
console.log('- Osserva i pattern di timing degli stream');
console.log('- Nota come gli operatori trasformano i dati');
console.log('- Presta attenzione alla gestione degli errori e cleanup');
console.log('- Sperimenta modificando i valori di timing e delay');

/**
 * PROGETTI AVANZATI SUGGERITI:
 * 
 * 1. Real-time chat application con typing indicators
 * 2. Stock market ticker con price alerts e charts
 * 3. File upload manager con progress tracking e retry
 * 4. Game state management per multiplayer games
 * 5. IoT sensor dashboard con real-time analytics
 * 6. Collaborative text editor con operational transforms
 * 7. Video streaming player con buffer management
 * 8. Trading bot con market data analysis
 */
