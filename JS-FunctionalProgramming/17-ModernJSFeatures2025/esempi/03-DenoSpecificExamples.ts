// Deno-Specific Functional Programming Examples
// File: deno-fp-examples.ts

// ============================================================================
// DENO SPECIFIC FEATURES FOR FUNCTIONAL PROGRAMMING
// ============================================================================

// 1. Secure-by-default functional patterns
import { crypto } from "https://deno.land/std@0.200.0/crypto/mod.ts";
import { delay } from "https://deno.land/std@0.200.0/async/delay.ts";

// Functional crypto utilities
const createSecureHasher = () => {
  const hashData = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  };

  return {
    hash: hashData,
    hashMany: async (items: string[]): Promise<string[]> => {
      return Promise.all(items.map(hashData));
    },
    createHashMapper: () => (data: string) => hashData(data)
  };
};

// 2. Deno KV for functional state management
const createDenoKVStateManager = async () => {
  const kv = await Deno.openKv();

  // Functional state operations
  const getState = async <T>(key: string): Promise<T | null> => {
    const result = await kv.get([key]);
    return result.value as T | null;
  };

  const setState = async <T>(key: string, value: T): Promise<void> => {
    await kv.set([key], value);
  };

  const updateState = async <T>(
    key: string,
    updater: (current: T | null) => T
  ): Promise<T> => {
    const current = await getState<T>(key);
    const newValue = updater(current);
    await setState(key, newValue);
    return newValue;
  };

  // Functional query operations
  const listByPrefix = async <T>(prefix: string): Promise<T[]> => {
    const entries = kv.list({ prefix: [prefix] });
    const results: T[] = [];
    
    for await (const entry of entries) {
      results.push(entry.value as T);
    }
    
    return results;
  };

  return {
    get: getState,
    set: setState,
    update: updateState,
    listByPrefix,
    close: () => kv.close()
  };
};

// 3. Deno-specific HTTP client with functional patterns
const createDenoHttpClient = (baseUrl: string) => {
  const request = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const url = new URL(endpoint, baseUrl);
    return fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  };

  // Functional HTTP methods
  const get = (endpoint: string) => request(endpoint, { method: 'GET' });
  const post = (endpoint: string, data: unknown) => 
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });

  // Curried request builder
  const createRequestBuilder = (method: string) => 
    (endpoint: string) => 
    (data?: unknown) => 
    request(endpoint, {
      method,
      ...(data && { body: JSON.stringify(data) })
    });

  return {
    get,
    post,
    put: createRequestBuilder('PUT'),
    delete: createRequestBuilder('DELETE'),
    request
  };
};

// 4. File system operations with functional patterns
const createDenoFileUtils = () => {
  // Pure functions for path manipulation
  const ensureDir = async (path: string): Promise<void> => {
    try {
      await Deno.mkdir(path, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }
  };

  // Functional file operations
  const readJsonFile = async <T>(path: string): Promise<T> => {
    const text = await Deno.readTextFile(path);
    return JSON.parse(text);
  };

  const writeJsonFile = async <T>(path: string, data: T): Promise<void> => {
    await ensureDir(path.split('/').slice(0, -1).join('/'));
    await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
  };

  // Higher-order function for file processing
  const processFiles = (processor: (content: string) => string) => 
    async (inputPath: string, outputPath: string): Promise<void> => {
      const content = await Deno.readTextFile(inputPath);
      const processed = processor(content);
      await writeJsonFile(outputPath, processed);
    };

  return {
    readJson: readJsonFile,
    writeJson: writeJsonFile,
    processFiles,
    ensureDir
  };
};

// 5. Task scheduling with Deno cron
const createDenoTaskScheduler = () => {
  const tasks = new Map<string, () => Promise<void>>();

  const addTask = (name: string, task: () => Promise<void>) => {
    tasks.set(name, task);
  };

  const runTask = async (name: string): Promise<void> => {
    const task = tasks.get(name);
    if (!task) {
      throw new Error(`Task ${name} not found`);
    }
    await task();
  };

  // Functional task composition
  const composeTask = (...taskFns: Array<() => Promise<void>>) =>
    async (): Promise<void> => {
      for (const task of taskFns) {
        await task();
      }
    };

  const parallelTask = (...taskFns: Array<() => Promise<void>>) =>
    async (): Promise<void> => {
      await Promise.all(taskFns.map(task => task()));
    };

  return {
    addTask,
    runTask,
    composeTask,
    parallelTask,
    listTasks: () => Array.from(tasks.keys())
  };
};

// ============================================================================
// PRACTICAL EXAMPLES
// ============================================================================

// Example 1: Secure data processing pipeline
const createSecureDataPipeline = async () => {
  const hasher = createSecureHasher();
  const fileUtils = createDenoFileUtils();
  const kvStore = await createDenoKVStateManager();

  const processSensitiveData = async (data: unknown[]) => {
    // 1. Hash sensitive data
    const serializedData = data.map(item => JSON.stringify(item));
    const hashedData = await hasher.hashMany(serializedData);

    // 2. Store metadata in KV
    await kvStore.set('data_processed_at', new Date().toISOString());
    await kvStore.set('data_count', data.length);

    // 3. Return processed data
    return hashedData.map((hash, index) => ({
      id: hash,
      index,
      processed: true
    }));
  };

  return {
    process: processSensitiveData,
    getMetadata: async () => ({
      processedAt: await kvStore.get<string>('data_processed_at'),
      count: await kvStore.get<number>('data_count')
    }),
    cleanup: () => kvStore.close()
  };
};

// Example 2: Web API with functional patterns
const createDenoWebAPI = () => {
  const httpClient = createDenoHttpClient('https://api.example.com');

  // Functional middleware
  const withLogging = (handler: (req: Request) => Promise<Response>) =>
    async (req: Request): Promise<Response> => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
      const response = await handler(req);
      console.log(`Response: ${response.status}`);
      return response;
    };

  const withErrorHandling = (handler: (req: Request) => Promise<Response>) =>
    async (req: Request): Promise<Response> => {
      try {
        return await handler(req);
      } catch (error) {
        console.error('API Error:', error);
        return new Response(
          JSON.stringify({ error: 'Internal Server Error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    };

  // Compose middleware
  const createHandler = (baseFn: (req: Request) => Promise<Response>) =>
    withErrorHandling(withLogging(baseFn));

  const apiHandler = createHandler(async (req: Request) => {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  });

  return {
    serve: () => Deno.serve({ port: 8000 }, apiHandler),
    handler: apiHandler
  };
};

// Example 3: File processing with functional patterns
const createFileProcessor = () => {
  const fileUtils = createDenoFileUtils();

  // Pure transformation functions
  const transformToUpperCase = (content: string): string => content.toUpperCase();
  const addTimestamp = (content: string): string => 
    `${content}\n\nProcessed at: ${new Date().toISOString()}`;

  // Compose transformations
  const compose = <T>(...fns: Array<(x: T) => T>) => 
    (x: T): T => fns.reduceRight((acc, fn) => fn(acc), x);

  const processFileWithTransforms = compose(
    addTimestamp,
    transformToUpperCase
  );

  return {
    processFile: fileUtils.processFiles(processFileWithTransforms),
    transformations: {
      upperCase: transformToUpperCase,
      addTimestamp,
      compose
    }
  };
};

// ============================================================================
// MAIN EXECUTION EXAMPLE
// ============================================================================

const main = async () => {
  console.log('🦕 Deno Functional Programming Examples\n');

  try {
    // 1. Test secure data pipeline
    console.log('1. Testing secure data pipeline...');
    const pipeline = await createSecureDataPipeline();
    const testData = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' }
    ];
    
    const processed = await pipeline.process(testData);
    console.log('Processed data:', processed);
    
    const metadata = await pipeline.getMetadata();
    console.log('Metadata:', metadata);
    
    await pipeline.cleanup();

    // 2. Test file processing
    console.log('\n2. Testing file processing...');
    const processor = createFileProcessor();
    
    // Create test file
    await Deno.writeTextFile('test_input.txt', 'hello world from deno');
    await processor.processFile('test_input.txt', 'test_output.txt');
    
    const output = await Deno.readTextFile('test_output.txt');
    console.log('Processed file content:', output);

    // Cleanup
    await Deno.remove('test_input.txt');
    await Deno.remove('test_output.txt');

    console.log('\n✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run if this is the main module
if (import.meta.main) {
  await main();
}

// Export for use as module
export {
  createSecureHasher,
  createDenoKVStateManager,
  createDenoHttpClient,
  createDenoFileUtils,
  createDenoTaskScheduler,
  createSecureDataPipeline,
  createDenoWebAPI,
  createFileProcessor
};
