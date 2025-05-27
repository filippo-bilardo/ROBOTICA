/**
 * Bun-Specific Functional Programming Examples
 * Esempi di programmazione funzionale specifici per Bun
 * 
 * Bun è un runtime JavaScript ultra-veloce con focus su performance
 * e developer experience. Questi esempi mostrano come utilizzare
 * le API specifiche di Bun con pattern funzionali.
 */

// ============================================================================
// 1. BUN FAST FILE OPERATIONS CON PATTERN FUNZIONALI
// ============================================================================

/**
 * Bun.file() wrapper funzionale per operazioni su file
 */
const createFileProcessor = () => {
    const readFile = async (path: string) => {
        try {
            const file = Bun.file(path);
            return { success: true, data: await file.text() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const writeFile = async (path: string, content: string) => {
        try {
            await Bun.write(path, content);
            return { success: true, path };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const processFile = (processor: (content: string) => string) => 
        async (inputPath: string, outputPath: string) => {
            const result = await readFile(inputPath);
            if (!result.success) return result;
            
            const processed = processor(result.data);
            return await writeFile(outputPath, processed);
        };

    return { readFile, writeFile, processFile };
};

// Esempio di utilizzo
const fileOps = createFileProcessor();

// Processore funzionale per trasformare testo
const textProcessor = (content: string): string => 
    content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `> ${line}`)
        .join('\n');

// Usage
// await fileOps.processFile(textProcessor)('input.txt', 'output.txt');

// ============================================================================
// 2. BUN HTTP SERVER CON FUNCTIONAL MIDDLEWARE
// ============================================================================

/**
 * Sistema di middleware funzionale per Bun server
 */
type Request = any; // Simplified for example
type Response = any;
type MiddlewareFunction = (req: Request) => (res: Response) => Response;

const createMiddleware = {
    // Logger middleware
    logger: (): MiddlewareFunction => 
        (req) => (res) => {
            console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
            return res;
        },

    // CORS middleware
    cors: (origins: string[] = ['*']): MiddlewareFunction =>
        (req) => (res) => ({
            ...res,
            headers: {
                ...res.headers,
                'Access-Control-Allow-Origin': origins.includes(req.headers.origin) 
                    ? req.headers.origin 
                    : origins[0],
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        }),

    // JSON parser middleware
    jsonParser: (): MiddlewareFunction =>
        (req) => (res) => ({
            ...res,
            json: (data: any) => ({
                ...res,
                headers: { ...res.headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
        }),

    // Rate limiting middleware (funzionale)
    rateLimit: (maxRequests: number, windowMs: number): MiddlewareFunction => {
        const requests = new Map<string, number[]>();
        
        return (req) => (res) => {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const now = Date.now();
            const windowStart = now - windowMs;
            
            if (!requests.has(ip)) {
                requests.set(ip, []);
            }
            
            const ipRequests = requests.get(ip)!;
            const validRequests = ipRequests.filter(time => time > windowStart);
            
            if (validRequests.length >= maxRequests) {
                return {
                    ...res,
                    status: 429,
                    body: JSON.stringify({ error: 'Too many requests' })
                };
            }
            
            validRequests.push(now);
            requests.set(ip, validRequests);
            return res;
        };
    }
};

// Compose middleware funzionale
const composeMiddleware = (...middlewares: MiddlewareFunction[]) =>
    (req: Request) => (initialRes: Response) =>
        middlewares.reduce(
            (res, middleware) => middleware(req)(res),
            initialRes
        );

// Esempio di server Bun con middleware funzionale
const createBunServer = () => {
    const middleware = composeMiddleware(
        createMiddleware.logger(),
        createMiddleware.cors(['http://localhost:3000']),
        createMiddleware.rateLimit(100, 60000), // 100 requests per minute
        createMiddleware.jsonParser()
    );

    return Bun.serve({
        port: 3000,
        fetch(req) {
            const baseResponse = { status: 200, headers: {}, body: '' };
            const processedResponse = middleware(req)(baseResponse);
            
            // Route handling (functional style)
            const route = new URL(req.url).pathname;
            
            const routes = {
                '/api/data': () => processedResponse.json({ 
                    message: 'Hello from Bun!', 
                    timestamp: new Date().toISOString() 
                }),
                '/health': () => ({ 
                    ...processedResponse, 
                    body: JSON.stringify({ status: 'healthy' }) 
                })
            };

            const handler = routes[route] || (() => ({ 
                ...processedResponse, 
                status: 404, 
                body: JSON.stringify({ error: 'Not found' }) 
            }));

            const finalResponse = handler();
            
            return new Response(finalResponse.body, {
                status: finalResponse.status,
                headers: finalResponse.headers
            });
        }
    });
};

// ============================================================================
// 3. BUN SQLITE CON PATTERN FUNZIONALI
// ============================================================================

/**
 * Database wrapper funzionale per Bun SQLite
 */
const createDatabase = (path: string) => {
    const db = new Bun.Database(path);
    
    // Query builder funzionale
    const query = {
        select: (table: string) => ({
            where: (condition: string, params: any[] = []) => ({
                execute: () => db.query(`SELECT * FROM ${table} WHERE ${condition}`).all(...params)
            }),
            all: () => db.query(`SELECT * FROM ${table}`).all()
        }),
        
        insert: (table: string) => ({
            values: (data: Record<string, any>) => {
                const keys = Object.keys(data);
                const values = Object.values(data);
                const placeholders = keys.map(() => '?').join(', ');
                
                return {
                    execute: () => db.query(
                        `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
                    ).run(...values)
                };
            }
        }),
        
        update: (table: string) => ({
            set: (data: Record<string, any>) => ({
                where: (condition: string, params: any[] = []) => {
                    const setClause = Object.keys(data)
                        .map(key => `${key} = ?`)
                        .join(', ');
                    
                    return {
                        execute: () => db.query(
                            `UPDATE ${table} SET ${setClause} WHERE ${condition}`
                        ).run(...Object.values(data), ...params)
                    };
                }
            })
        }),
        
        delete: (table: string) => ({
            where: (condition: string, params: any[] = []) => ({
                execute: () => db.query(
                    `DELETE FROM ${table} WHERE ${condition}`
                ).run(...params)
            })
        })
    };

    // Repository pattern funzionale
    const createRepository = <T>(tableName: string) => ({
        findAll: (): T[] => query.select(tableName).all(),
        
        findWhere: (condition: string, params: any[] = []): T[] => 
            query.select(tableName).where(condition, params).execute(),
        
        create: (data: Partial<T>) => 
            query.insert(tableName).values(data).execute(),
        
        update: (id: number, data: Partial<T>) => 
            query.update(tableName).set(data).where('id = ?', [id]).execute(),
        
        delete: (id: number) => 
            query.delete(tableName).where('id = ?', [id]).execute(),
        
        // Functional operations
        findAndTransform: <R>(transform: (items: T[]) => R) => (): R =>
            transform(query.select(tableName).all()),
        
        batchOperation: (operations: (() => any)[]) => {
            return db.transaction(() => {
                return operations.map(op => op());
            });
        }
    });

    return { query, createRepository, close: () => db.close() };
};

// Esempio di utilizzo
interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

// const db = createDatabase('users.db');
// const userRepo = db.createRepository<User>('users');

// Operazioni funzionali
// const getAllActiveUsers = userRepo.findAndTransform(
//     users => users.filter(user => user.email.includes('@'))
// );

// ============================================================================
// 4. BUN TESTING CON PATTERN FUNZIONALI
// ============================================================================

/**
 * Test utilities funzionali per Bun test
 */
const createTestSuite = (suiteName: string) => {
    const tests: Array<() => void> = [];
    
    const it = (description: string, testFn: () => void | Promise<void>) => {
        tests.push(() => {
            console.log(`  ✓ ${description}`);
            return testFn();
        });
    };
    
    const expect = <T>(actual: T) => ({
        toBe: (expected: T) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, got ${actual}`);
            }
        },
        toEqual: (expected: T) => {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },
        toBeTruthy: () => {
            if (!actual) {
                throw new Error(`Expected truthy value, got ${actual}`);
            }
        }
    });
    
    const run = async () => {
        console.log(`\n${suiteName}:`);
        
        const results = await Promise.allSettled(
            tests.map(test => Promise.resolve(test()))
        );
        
        const passed = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
        
        return { passed, failed, total: tests.length };
    };
    
    return { it, expect, run };
};

// Esempio di test funzionali
const testFunctionalUtils = () => {
    const suite = createTestSuite('Functional Utilities');
    
    // Test per funzioni pure
    suite.it('should compose functions correctly', () => {
        const add1 = (x: number) => x + 1;
        const multiply2 = (x: number) => x * 2;
        const compose = (f: Function, g: Function) => (x: any) => f(g(x));
        
        const addThenMultiply = compose(multiply2, add1);
        suite.expect(addThenMultiply(5)).toBe(12);
    });
    
    // Test per curry
    suite.it('should curry functions correctly', () => {
        const curry = (fn: Function) => (...args: any[]) => 
            args.length >= fn.length 
                ? fn(...args) 
                : (...nextArgs: any[]) => curry(fn)(...args, ...nextArgs);
        
        const add = (a: number, b: number, c: number) => a + b + c;
        const curriedAdd = curry(add);
        
        suite.expect(curriedAdd(1)(2)(3)).toBe(6);
        suite.expect(curriedAdd(1, 2)(3)).toBe(6);
    });
    
    return suite.run();
};

// ============================================================================
// 5. BUN WORKER THREADS CON FUNCTIONAL PATTERNS
// ============================================================================

/**
 * Worker pool funzionale per operazioni CPU-intensive
 */
const createWorkerPool = (workerScript: string, poolSize: number = 4) => {
    const workers: Worker[] = [];
    const taskQueue: Array<{
        data: any;
        resolve: (value: any) => void;
        reject: (error: any) => void;
    }> = [];
    
    // Inizializza pool di worker
    for (let i = 0; i < poolSize; i++) {
        const worker = new Worker(workerScript);
        workers.push(worker);
    }
    
    const executeTask = (data: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            const availableWorker = workers.find(w => !w.busy);
            
            if (availableWorker) {
                availableWorker.busy = true;
                availableWorker.postMessage(data);
                
                availableWorker.onmessage = (event) => {
                    availableWorker.busy = false;
                    resolve(event.data);
                    processQueue();
                };
                
                availableWorker.onerror = (error) => {
                    availableWorker.busy = false;
                    reject(error);
                    processQueue();
                };
            } else {
                taskQueue.push({ data, resolve, reject });
            }
        });
    };
    
    const processQueue = () => {
        if (taskQueue.length === 0) return;
        
        const availableWorker = workers.find(w => !w.busy);
        if (availableWorker) {
            const task = taskQueue.shift()!;
            executeTask(task.data).then(task.resolve).catch(task.reject);
        }
    };
    
    // Functional interface
    const map = async <T, R>(items: T[], transform: (item: T) => any): Promise<R[]> => {
        const tasks = items.map(item => executeTask({ type: 'transform', item, transform: transform.toString() }));
        return Promise.all(tasks);
    };
    
    const reduce = async <T, R>(items: T[], reducer: (acc: R, item: T) => R, initial: R): Promise<R> => {
        let accumulator = initial;
        for (const item of items) {
            const result = await executeTask({ 
                type: 'reduce', 
                accumulator, 
                item, 
                reducer: reducer.toString() 
            });
            accumulator = result;
        }
        return accumulator;
    };
    
    const terminate = () => {
        workers.forEach(worker => worker.terminate());
    };
    
    return { executeTask, map, reduce, terminate };
};

// ============================================================================
// 6. PERFORMANCE MONITORING FUNZIONALE
// ============================================================================

/**
 * Performance monitor con pattern funzionali
 */
const createPerformanceMonitor = () => {
    const metrics = new Map<string, number[]>();
    
    const measure = <T>(name: string, fn: () => T): T => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        const duration = end - start;
        
        if (!metrics.has(name)) {
            metrics.set(name, []);
        }
        metrics.get(name)!.push(duration);
        
        return result;
    };
    
    const measureAsync = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        const duration = end - start;
        
        if (!metrics.has(name)) {
            metrics.set(name, []);
        }
        metrics.get(name)!.push(duration);
        
        return result;
    };
    
    const getStats = (name: string) => {
        const times = metrics.get(name) || [];
        if (times.length === 0) return null;
        
        const sum = times.reduce((a, b) => a + b, 0);
        const avg = sum / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        
        return { avg, min, max, count: times.length };
    };
    
    const report = () => {
        console.log('\n=== Performance Report ===');
        for (const [name, times] of metrics.entries()) {
            const stats = getStats(name);
            if (stats) {
                console.log(`${name}: avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms, count=${stats.count}`);
            }
        }
        console.log('========================\n');
    };
    
    return { measure, measureAsync, getStats, report };
};

// Esempio di utilizzo
const perfMonitor = createPerformanceMonitor();

const heavyComputation = (n: number): number => {
    return perfMonitor.measure('fibonacci', () => {
        const fib = (x: number): number => x <= 1 ? x : fib(x - 1) + fib(x - 2);
        return fib(n);
    });
};

// Export per testing
export {
    createFileProcessor,
    createMiddleware,
    composeMiddleware,
    createBunServer,
    createDatabase,
    createTestSuite,
    createWorkerPool,
    createPerformanceMonitor,
    testFunctionalUtils
};

// Esempio di utilizzo completo
if (import.meta.main) {
    console.log('🚀 Bun Functional Programming Examples');
    
    // Test delle utilities funzionali
    testFunctionalUtils().then(results => {
        console.log('Test results:', results);
    });
    
    // Performance monitoring example
    const result = heavyComputation(35);
    console.log('Fibonacci result:', result);
    perfMonitor.report();
}
