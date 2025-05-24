/**
 * ESEMPI AVANZATI CON RXJS - REACTIVE STREAMS
 * 
 * Esempi pratici di programmazione reattiva con RxJS:
 * - Stream di eventi
 * - Operatori di trasformazione
 * - Gestione errori
 * - Backpressure e throttling
 */

const { Observable, Subject, BehaviorSubject, fromEvent, interval, timer, of, from, merge, combineLatest, zip } = require('rxjs');
const { map, filter, debounceTime, throttleTime, distinctUntilChanged, mergeMap, switchMap, catchError, retry, takeUntil, scan, tap, share, bufferTime, groupBy, partition } = require('rxjs/operators');

// ==============================================
// 1. STREAM DI EVENTI UI (SIMULAZIONE)
// ==============================================

console.log('=== 1. STREAM DI EVENTI UI ===');

// Simulazione di eventi di input utente
const createInputEvents = () => {
    return new Observable(observer => {
        const inputs = ['a', 'ap', 'app', 'appl', 'apple', 'application'];
        let index = 0;
        
        const intervalId = setInterval(() => {
            if (index < inputs.length) {
                observer.next({ target: { value: inputs[index] } });
                index++;
            } else {
                observer.complete();
                clearInterval(intervalId);
            }
        }, 300);
        
        return () => clearInterval(intervalId);
    });
};

// Search con debounce e validazione
const searchStream$ = createInputEvents().pipe(
    map(event => event.target.value),
    debounceTime(250),
    distinctUntilChanged(),
    filter(query => query.length >= 2),
    tap(query => console.log(`Searching for: ${query}`)),
    switchMap(query => 
        // Simulazione chiamata API
        timer(100).pipe(
            map(() => [`${query} result 1`, `${query} result 2`, `${query} result 3`]),
            catchError(err => of([]))
        )
    )
);

searchStream$.subscribe({
    next: results => console.log('Search results:', results),
    error: err => console.error('Search error:', err),
    complete: () => console.log('Search completed')
});

// ==============================================
// 2. REAL-TIME DATA PROCESSING
// ==============================================

console.log('\n=== 2. REAL-TIME DATA PROCESSING ===');

// Simulazione stream di dati sensori
const sensorData$ = interval(100).pipe(
    map(() => ({
        temperature: 20 + Math.random() * 10,
        humidity: 40 + Math.random() * 20,
        timestamp: Date.now()
    })),
    take(20)
);

// Aggregazione e analisi in tempo reale
const aggregatedData$ = sensorData$.pipe(
    bufferTime(500),
    filter(buffer => buffer.length > 0),
    map(readings => ({
        count: readings.length,
        avgTemperature: readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length,
        avgHumidity: readings.reduce((sum, r) => sum + r.humidity, 0) / readings.length,
        maxTemperature: Math.max(...readings.map(r => r.temperature)),
        minTemperature: Math.min(...readings.map(r => r.temperature)),
        timestamp: Date.now()
    }))
);

// Rilevamento anomalie
const anomalyDetection$ = aggregatedData$.pipe(
    filter(data => data.avgTemperature > 28 || data.avgTemperature < 18),
    map(data => ({
        type: 'TEMPERATURE_ANOMALY',
        severity: data.avgTemperature > 30 || data.avgTemperature < 15 ? 'HIGH' : 'MEDIUM',
        data
    }))
);

aggregatedData$.subscribe(data => 
    console.log(`Avg Temp: ${data.avgTemperature.toFixed(1)}°C, Avg Humidity: ${data.avgHumidity.toFixed(1)}%`)
);

anomalyDetection$.subscribe(anomaly => 
    console.log(`🚨 ANOMALY DETECTED: ${anomaly.type} - Severity: ${anomaly.severity}`)
);

// ==============================================
// 3. WEBSOCKET SIMULATION E RECONNECTION
// ==============================================

console.log('\n=== 3. WEBSOCKET CON RECONNECTION ===');

// Simulazione WebSocket con disconnessioni casuali
const createWebSocketStream = () => {
    return new Observable(observer => {
        let connected = true;
        let messageCount = 0;
        
        const sendMessage = () => {
            if (connected && messageCount < 15) {
                observer.next({
                    id: messageCount + 1,
                    data: `Message ${messageCount + 1}`,
                    timestamp: Date.now()
                });
                messageCount++;
                
                // Simula disconnessione casuale
                if (Math.random() < 0.2) {
                    connected = false;
                    observer.error(new Error('Connection lost'));
                    return;
                }
                
                setTimeout(sendMessage, 200);
            } else if (messageCount >= 15) {
                observer.complete();
            }
        };
        
        setTimeout(sendMessage, 100);
        
        return () => {
            connected = false;
        };
    });
};

// WebSocket con retry automatico
const resilientWebSocket$ = createWebSocketStream().pipe(
    retry({
        count: 3,
        delay: (error, retryCount) => {
            console.log(`🔄 Reconnecting... Attempt ${retryCount}`);
            return timer(1000 * retryCount);
        }
    }),
    catchError(err => {
        console.log('🔴 Max retries reached, switching to fallback');
        return of({ id: -1, data: 'FALLBACK_MODE', timestamp: Date.now() });
    }),
    share()
);

resilientWebSocket$.subscribe({
    next: message => console.log(`📨 Received: ${message.data}`),
    error: err => console.error('WebSocket error:', err.message),
    complete: () => console.log('WebSocket stream completed')
});

// ==============================================
// 4. MULTIPLE STREAMS COORDINATION
// ==============================================

console.log('\n=== 4. MULTIPLE STREAMS COORDINATION ===');

// Stream di eventi di diversi tipi
const userActions$ = interval(300).pipe(
    map(i => ({ type: 'USER_ACTION', action: `action_${i}`, timestamp: Date.now() })),
    take(8)
);

const systemEvents$ = interval(500).pipe(
    map(i => ({ type: 'SYSTEM_EVENT', event: `event_${i}`, timestamp: Date.now() })),
    take(6)
);

const notifications$ = interval(700).pipe(
    map(i => ({ type: 'NOTIFICATION', message: `notification_${i}`, timestamp: Date.now() })),
    take(4)
);

// Merge di tutti gli stream
const allEvents$ = merge(userActions$, systemEvents$, notifications$).pipe(
    scan((acc, event) => {
        acc.events.push(event);
        acc.count++;
        acc.lastEvent = event;
        return acc;
    }, { events: [], count: 0, lastEvent: null })
);

// Combinazione con state management
const appState$ = combineLatest([
    userActions$.pipe(scan((count) => count + 1, 0)),
    systemEvents$.pipe(scan((count) => count + 1, 0)),
    notifications$.pipe(scan((count) => count + 1, 0))
]).pipe(
    map(([userCount, systemCount, notificationCount]) => ({
        userActions: userCount,
        systemEvents: systemCount,
        notifications: notificationCount,
        total: userCount + systemCount + notificationCount,
        timestamp: Date.now()
    }))
);

allEvents$.subscribe(state => 
    console.log(`📊 Total events: ${state.count}, Last: ${state.lastEvent?.type}`)
);

appState$.subscribe(state => 
    console.log(`📈 State - Users: ${state.userActions}, System: ${state.systemEvents}, Notifications: ${state.notifications}`)
);

// ==============================================
// 5. ADVANCED OPERATORS E PATTERNS
// ==============================================

console.log('\n=== 5. ADVANCED OPERATORS ===');

// Stream grouping e processing
const dataStream$ = interval(100).pipe(
    map(i => ({
        id: i,
        category: ['A', 'B', 'C'][i % 3],
        value: Math.random() * 100,
        timestamp: Date.now()
    })),
    take(15)
);

// Grouping per categoria
const groupedProcessing$ = dataStream$.pipe(
    groupBy(item => item.category),
    mergeMap(group$ => 
        group$.pipe(
            scan((acc, item) => ({
                category: item.category,
                count: acc.count + 1,
                totalValue: acc.totalValue + item.value,
                avgValue: (acc.totalValue + item.value) / (acc.count + 1),
                lastUpdate: item.timestamp
            }), { count: 0, totalValue: 0, avgValue: 0 }),
            map(result => ({
                ...result,
                avgValue: Math.round(result.avgValue * 100) / 100
            }))
        )
    )
);

groupedProcessing$.subscribe(result => 
    console.log(`📊 Category ${result.category}: Count=${result.count}, Avg=${result.avgValue}`)
);

// Partition per soglie
const thresholdData$ = interval(150).pipe(
    map(() => Math.random() * 100),
    take(12)
);

const [highValues$, lowValues$] = partition(thresholdData$, value => value > 50);

highValues$.subscribe(value => 
    console.log(`🔥 High value: ${value.toFixed(2)}`)
);

lowValues$.subscribe(value => 
    console.log(`❄️ Low value: ${value.toFixed(2)}`)
);

// ==============================================
// 6. ERROR HANDLING E RECOVERY PATTERNS
// ==============================================

console.log('\n=== 6. ERROR HANDLING PATTERNS ===');

// Stream con errori casuali
const faultyStream$ = interval(200).pipe(
    map(i => {
        if (i > 0 && i % 5 === 0) {
            throw new Error(`Simulated error at ${i}`);
        }
        return { id: i, data: `Data ${i}`, success: true };
    }),
    take(12)
);

// Pattern 1: Catch and continue
const resilientStream1$ = faultyStream$.pipe(
    catchError(err => {
        console.log(`⚠️ Caught error: ${err.message}, continuing...`);
        return of({ id: -1, data: 'ERROR_RECOVERED', success: false });
    })
);

// Pattern 2: Retry con backoff
const resilientStream2$ = faultyStream$.pipe(
    retry({
        count: 2,
        delay: (error, retryCount) => {
            console.log(`🔄 Retry ${retryCount} after error: ${error.message}`);
            return timer(500);
        }
    }),
    catchError(err => {
        console.log(`❌ Final error handling: ${err.message}`);
        return of({ id: -2, data: 'FINAL_FALLBACK', success: false });
    })
);

setTimeout(() => {
    console.log('\n--- Testing Error Recovery Pattern 1 ---');
    resilientStream1$.subscribe({
        next: data => console.log(`✅ Pattern 1 - Received: ${data.data}`),
        complete: () => console.log('Pattern 1 completed')
    });
}, 3000);

setTimeout(() => {
    console.log('\n--- Testing Error Recovery Pattern 2 ---');
    resilientStream2$.subscribe({
        next: data => console.log(`✅ Pattern 2 - Received: ${data.data}`),
        complete: () => console.log('Pattern 2 completed')
    });
}, 6000);

// ==============================================
// 7. PERFORMANCE OPTIMIZATION
// ==============================================

console.log('\n=== 7. PERFORMANCE OPTIMIZATION ===');

// Hot observable con sharing
const sharedStream$ = interval(100).pipe(
    map(i => ({ id: i, timestamp: Date.now(), data: `Shared data ${i}` })),
    take(10),
    share() // Condivide lo stream tra più subscriber
);

// Multiple subscribers dello stesso stream
setTimeout(() => {
    console.log('🔥 Creating shared subscriptions...');
    
    sharedStream$.subscribe(data => 
        console.log(`Sub1: ${data.data}`)
    );
    
    setTimeout(() => {
        sharedStream$.subscribe(data => 
            console.log(`Sub2: ${data.data}`)
        );
    }, 300);
    
    setTimeout(() => {
        sharedStream$.subscribe(data => 
            console.log(`Sub3: ${data.data}`)
        );
    }, 600);
}, 9000);

// Memory leak prevention
const cleanupExample$ = interval(50).pipe(
    takeUntil(timer(2000)) // Automatic cleanup dopo 2 secondi
);

setTimeout(() => {
    console.log('\n🧹 Testing automatic cleanup...');
    cleanupExample$.subscribe({
        next: value => console.log(`Cleanup test: ${value}`),
        complete: () => console.log('✅ Stream automatically cleaned up')
    });
}, 12000);

console.log('\n🚀 RxJS examples started. Check console for real-time updates...');
