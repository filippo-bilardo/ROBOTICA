/**
 * WebAssembly + Functional Programming Integration Examples
 * Esempi di integrazione WebAssembly con programmazione funzionale
 * 
 * Questi esempi mostrano come combinare WebAssembly per performance
 * critiche con pattern funzionali JavaScript per architetture ibride.
 */

// ============================================================================
// 1. WASM MODULE WRAPPER FUNZIONALE
// ============================================================================

/**
 * Wrapper funzionale per moduli WebAssembly
 */
interface WasmModule {
    memory: WebAssembly.Memory;
    exports: WebAssembly.Exports;
}

const createWasmWrapper = () => {
    const modules = new Map<string, WasmModule>();
    
    const loadModule = async (name: string, wasmPath: string): Promise<WasmModule> => {
        try {
            const wasmBytes = await fetch(wasmPath).then(r => r.arrayBuffer());
            const wasmModule = await WebAssembly.instantiate(wasmBytes);
            const module = wasmModule.instance as unknown as WasmModule;
            
            modules.set(name, module);
            return module;
        } catch (error) {
            throw new Error(`Failed to load WASM module ${name}: ${error.message}`);
        }
    };
    
    const getModule = (name: string): WasmModule | null => {
        return modules.get(name) || null;
    };
    
    // Functional interface per chiamate WASM
    const callFunction = <T extends any[], R>(
        moduleName: string, 
        functionName: string
    ) => (...args: T): R => {
        const module = getModule(moduleName);
        if (!module) {
            throw new Error(`Module ${moduleName} not loaded`);
        }
        
        const func = module.exports[functionName] as Function;
        if (!func) {
            throw new Error(`Function ${functionName} not found in module ${moduleName}`);
        }
        
        return func(...args);
    };
    
    // Memory management funzionale
    const withMemory = <T>(moduleName: string, size: number, operation: (ptr: number) => T): T => {
        const module = getModule(moduleName);
        if (!module) {
            throw new Error(`Module ${moduleName} not loaded`);
        }
        
        const malloc = module.exports.malloc as (size: number) => number;
        const free = module.exports.free as (ptr: number) => void;
        
        if (!malloc || !free) {
            throw new Error('Module must export malloc and free functions');
        }
        
        const ptr = malloc(size);
        try {
            return operation(ptr);
        } finally {
            free(ptr);
        }
    };
    
    return { loadModule, getModule, callFunction, withMemory };
};

// ============================================================================
// 2. ARRAY PROCESSING CON WASM + FUNCTIONAL PATTERNS
// ============================================================================

/**
 * Array processor che combina WASM per operazioni intensive
 * con JavaScript per composizione funzionale
 */
const createHybridArrayProcessor = (wasmWrapper: ReturnType<typeof createWasmWrapper>) => {
    
    // Operazioni WASM (simulate - in realtà chiamerebbero funzioni WASM)
    const wasmOperations = {
        vectorAdd: (a: Float32Array, b: Float32Array): Float32Array => {
            // In realtà: wasmWrapper.callFunction('math', 'vector_add')(a, b)
            // Simulazione per esempio
            return a.map((val, i) => val + b[i]);
        },
        
        vectorMultiply: (a: Float32Array, scalar: number): Float32Array => {
            // In realtà: wasmWrapper.callFunction('math', 'vector_multiply')(a, scalar)
            return a.map(val => val * scalar);
        },
        
        matrixMultiply: (a: Float32Array, b: Float32Array, rows: number, cols: number): Float32Array => {
            // Simulazione di moltiplicazione matrice
            const result = new Float32Array(rows * cols);
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    let sum = 0;
                    for (let k = 0; k < cols; k++) {
                        sum += a[i * cols + k] * b[k * cols + j];
                    }
                    result[i * cols + j] = sum;
                }
            }
            return result;
        },
        
        fft: (signal: Float32Array): Float32Array => {
            // Simulazione FFT - in realtà userebbe WASM optimized
            return signal; // Placeholder
        }
    };
    
    // Functional pipeline builder
    const createPipeline = () => {
        const operations: Array<(data: Float32Array) => Float32Array> = [];
        
        const pipe = {
            add: (other: Float32Array) => {
                operations.push(data => wasmOperations.vectorAdd(data, other));
                return pipe;
            },
            
            multiply: (scalar: number) => {
                operations.push(data => wasmOperations.vectorMultiply(data, scalar));
                return pipe;
            },
            
            transform: (fn: (data: Float32Array) => Float32Array) => {
                operations.push(fn);
                return pipe;
            },
            
            fft: () => {
                operations.push(data => wasmOperations.fft(data));
                return pipe;
            },
            
            execute: (input: Float32Array): Float32Array => {
                return operations.reduce((data, operation) => operation(data), input);
            }
        };
        
        return pipe;
    };
    
    // Parallel processing con WASM
    const parallelProcess = async <T>(
        data: T[],
        chunkSize: number,
        processor: (chunk: T[]) => Promise<T[]>
    ): Promise<T[]> => {
        const chunks = [];
        for (let i = 0; i < data.length; i += chunkSize) {
            chunks.push(data.slice(i, i + chunkSize));
        }
        
        const results = await Promise.all(chunks.map(processor));
        return results.flat();
    };
    
    return { wasmOperations, createPipeline, parallelProcess };
};

// ============================================================================
// 3. SIGNAL PROCESSING PIPELINE (WASM + FP)
// ============================================================================

/**
 * Pipeline di elaborazione segnali che combina WASM e pattern funzionali
 */
const createSignalProcessor = (hybridProcessor: ReturnType<typeof createHybridArrayProcessor>) => {
    
    // Generatori di segnali funzionali
    const signalGenerators = {
        sine: (frequency: number, sampleRate: number, duration: number): Float32Array => {
            const samples = Math.floor(sampleRate * duration);
            const signal = new Float32Array(samples);
            for (let i = 0; i < samples; i++) {
                signal[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
            }
            return signal;
        },
        
        noise: (amplitude: number, samples: number): Float32Array => {
            const signal = new Float32Array(samples);
            for (let i = 0; i < samples; i++) {
                signal[i] = amplitude * (Math.random() * 2 - 1);
            }
            return signal;
        },
        
        chirp: (startFreq: number, endFreq: number, sampleRate: number, duration: number): Float32Array => {
            const samples = Math.floor(sampleRate * duration);
            const signal = new Float32Array(samples);
            for (let i = 0; i < samples; i++) {
                const t = i / sampleRate;
                const freq = startFreq + (endFreq - startFreq) * t / duration;
                signal[i] = Math.sin(2 * Math.PI * freq * t);
            }
            return signal;
        }
    };
    
    // Filtri funzionali (da implementare in WASM per performance)
    const filters = {
        lowPass: (cutoff: number, sampleRate: number) => (signal: Float32Array): Float32Array => {
            // Simulazione - in realtà userebbe WASM
            const alpha = 2 * Math.PI * cutoff / sampleRate;
            const filtered = new Float32Array(signal.length);
            filtered[0] = signal[0];
            
            for (let i = 1; i < signal.length; i++) {
                filtered[i] = alpha * signal[i] + (1 - alpha) * filtered[i - 1];
            }
            return filtered;
        },
        
        highPass: (cutoff: number, sampleRate: number) => (signal: Float32Array): Float32Array => {
            // Implementazione high-pass filter
            const alpha = 2 * Math.PI * cutoff / sampleRate;
            const filtered = new Float32Array(signal.length);
            filtered[0] = signal[0];
            
            for (let i = 1; i < signal.length; i++) {
                filtered[i] = signal[i] - alpha * signal[i] - (1 - alpha) * filtered[i - 1];
            }
            return filtered;
        },
        
        bandPass: (lowCutoff: number, highCutoff: number, sampleRate: number) => 
            (signal: Float32Array): Float32Array => {
                const low = filters.lowPass(highCutoff, sampleRate);
                const high = filters.highPass(lowCutoff, sampleRate);
                return low(high(signal));
            }
    };
    
    // Analyzer funzionali
    const analyzers = {
        rms: (signal: Float32Array): number => {
            const sumSquares = signal.reduce((sum, val) => sum + val * val, 0);
            return Math.sqrt(sumSquares / signal.length);
        },
        
        peak: (signal: Float32Array): number => {
            return Math.max(...signal);
        },
        
        spectrum: (signal: Float32Array): Float32Array => {
            // Placeholder per FFT - userebbe WASM
            return hybridProcessor.wasmOperations.fft(signal);
        },
        
        spectralCentroid: (spectrum: Float32Array): number => {
            let weightedSum = 0;
            let magnitudeSum = 0;
            
            for (let i = 0; i < spectrum.length; i++) {
                const magnitude = Math.abs(spectrum[i]);
                weightedSum += i * magnitude;
                magnitudeSum += magnitude;
            }
            
            return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
        }
    };
    
    // Compositore di pipeline
    const createAnalysisPipeline = () => {
        const steps: Array<(signal: Float32Array) => any> = [];
        
        const pipeline = {
            filter: (filterFn: (signal: Float32Array) => Float32Array) => {
                steps.push(filterFn);
                return pipeline;
            },
            
            analyze: (analyzerFn: (signal: Float32Array) => number) => {
                steps.push(analyzerFn);
                return pipeline;
            },
            
            transform: (transformFn: (signal: Float32Array) => Float32Array) => {
                steps.push(transformFn);
                return pipeline;
            },
            
            execute: (signal: Float32Array) => {
                return steps.reduce((data, step) => step(data), signal);
            }
        };
        
        return pipeline;
    };
    
    return { signalGenerators, filters, analyzers, createAnalysisPipeline };
};

// ============================================================================
// 4. REAL-TIME AUDIO PROCESSING CON WORKLETS + WASM
// ============================================================================

/**
 * Audio Worklet processor che usa WASM per DSP
 */
const createAudioWorkletCode = () => `
class WasmAudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.wasmModule = null;
        this.initWasm();
    }
    
    async initWasm() {
        // Caricamento modulo WASM per DSP
        const wasmBytes = await fetch('/audio-dsp.wasm').then(r => r.arrayBuffer());
        this.wasmModule = await WebAssembly.instantiate(wasmBytes);
    }
    
    process(inputs, outputs, parameters) {
        if (!this.wasmModule) return true;
        
        const input = inputs[0];
        const output = outputs[0];
        
        if (input.length > 0) {
            const inputChannel = input[0];
            const outputChannel = output[0];
            
            // Processo in WASM per performance
            if (this.wasmModule.exports.processAudio) {
                // Copia dati in memoria WASM
                const ptr = this.wasmModule.exports.malloc(inputChannel.length * 4);
                const wasmMemory = new Float32Array(
                    this.wasmModule.exports.memory.buffer,
                    ptr,
                    inputChannel.length
                );
                
                wasmMemory.set(inputChannel);
                
                // Elaborazione WASM
                this.wasmModule.exports.processAudio(ptr, inputChannel.length);
                
                // Copia risultato
                outputChannel.set(wasmMemory);
                
                // Libera memoria
                this.wasmModule.exports.free(ptr);
            }
        }
        
        return true;
    }
}

registerProcessor('wasm-audio-processor', WasmAudioProcessor);
`;

// Audio context setup funzionale
const createWebAudioSystem = () => {
    let audioContext: AudioContext | null = null;
    
    const initAudio = async (): Promise<AudioContext> => {
        if (!audioContext) {
            audioContext = new AudioContext();
            
            // Register WASM audio worklet
            const workletCode = createAudioWorkletCode();
            const blob = new Blob([workletCode], { type: 'application/javascript' });
            const workletUrl = URL.createObjectURL(blob);
            
            await audioContext.audioWorklet.addModule(workletUrl);
        }
        return audioContext;
    };
    
    const createEffectChain = () => {
        const effects: AudioNode[] = [];
        
        const chain = {
            addGain: (value: number) => {
                const gainNode = audioContext!.createGain();
                gainNode.gain.value = value;
                effects.push(gainNode);
                return chain;
            },
            
            addFilter: (type: BiquadFilterType, frequency: number) => {
                const filterNode = audioContext!.createBiquadFilter();
                filterNode.type = type;
                filterNode.frequency.value = frequency;
                effects.push(filterNode);
                return chain;
            },
            
            addWasmProcessor: () => {
                const wasmNode = new AudioWorkletNode(audioContext!, 'wasm-audio-processor');
                effects.push(wasmNode);
                return chain;
            },
            
            connect: (source: AudioNode, destination: AudioNode) => {
                let currentNode = source;
                for (const effect of effects) {
                    currentNode.connect(effect);
                    currentNode = effect;
                }
                currentNode.connect(destination);
                return chain;
            }
        };
        
        return chain;
    };
    
    return { initAudio, createEffectChain };
};

// ============================================================================
// 5. COMPUTER VISION CON WASM + FUNCTIONAL PATTERNS
// ============================================================================

/**
 * Computer Vision pipeline con WebAssembly e pattern funzionali
 */
const createVisionProcessor = (wasmWrapper: ReturnType<typeof createWasmWrapper>) => {
    
    // Image processing operations (WASM)
    const imageOps = {
        grayscale: (imageData: ImageData): ImageData => {
            // In realtà chiamerebbe WASM function
            const data = new Uint8ClampedArray(imageData.data);
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                data[i] = data[i + 1] = data[i + 2] = gray;
            }
            return new ImageData(data, imageData.width, imageData.height);
        },
        
        blur: (imageData: ImageData, radius: number): ImageData => {
            // Gaussian blur implementation (placeholder)
            return imageData; // In realtà userebbe WASM
        },
        
        edgeDetection: (imageData: ImageData): ImageData => {
            // Sobel edge detection (placeholder)
            return imageData; // In realtà userebbe WASM
        },
        
        threshold: (imageData: ImageData, threshold: number): ImageData => {
            const data = new Uint8ClampedArray(imageData.data);
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                const binary = gray > threshold ? 255 : 0;
                data[i] = data[i + 1] = data[i + 2] = binary;
            }
            return new ImageData(data, imageData.width, imageData.height);
        }
    };
    
    // Functional pipeline per image processing
    const createImagePipeline = () => {
        const operations: Array<(img: ImageData) => ImageData> = [];
        
        const pipeline = {
            grayscale: () => {
                operations.push(imageOps.grayscale);
                return pipeline;
            },
            
            blur: (radius: number) => {
                operations.push(img => imageOps.blur(img, radius));
                return pipeline;
            },
            
            threshold: (value: number) => {
                operations.push(img => imageOps.threshold(img, value));
                return pipeline;
            },
            
            edgeDetection: () => {
                operations.push(imageOps.edgeDetection);
                return pipeline;
            },
            
            custom: (operation: (img: ImageData) => ImageData) => {
                operations.push(operation);
                return pipeline;
            },
            
            execute: (input: ImageData): ImageData => {
                return operations.reduce((img, operation) => operation(img), input);
            }
        };
        
        return pipeline;
    };
    
    // Feature detection funzionale
    const featureDetectors = {
        corners: (imageData: ImageData): Array<{x: number, y: number, strength: number}> => {
            // Harris corner detection - placeholder
            return [];
        },
        
        edges: (imageData: ImageData): Array<{start: {x: number, y: number}, end: {x: number, y: number}}> => {
            // Line detection - placeholder
            return [];
        },
        
        blobs: (imageData: ImageData): Array<{x: number, y: number, radius: number}> => {
            // Blob detection - placeholder
            return [];
        }
    };
    
    return { imageOps, createImagePipeline, featureDetectors };
};

// ============================================================================
// 6. ESEMPI DI UTILIZZO COMPLETI
// ============================================================================

// Esempio completo: Signal Processing Pipeline
const demonstrateSignalProcessing = async () => {
    console.log('🎵 Signal Processing with WASM + FP Demo');
    
    const wasmWrapper = createWasmWrapper();
    const hybridProcessor = createHybridArrayProcessor(wasmWrapper);
    const signalProcessor = createSignalProcessor(hybridProcessor);
    
    // Genera segnale di test
    const signal = signalProcessor.signalGenerators.sine(440, 44100, 1.0); // 440Hz per 1 secondo
    const noise = signalProcessor.signalGenerators.noise(0.1, signal.length);
    
    // Crea pipeline di analisi
    const analysisPipeline = signalProcessor.createAnalysisPipeline()
        .filter(signalProcessor.filters.lowPass(8000, 44100))
        .filter(signalProcessor.filters.highPass(100, 44100))
        .analyze(signalProcessor.analyzers.rms);
    
    // Esegui analisi
    const noisySignal = hybridProcessor.wasmOperations.vectorAdd(signal, noise);
    const rmsValue = analysisPipeline.execute(noisySignal);
    
    console.log(`RMS value after filtering: ${rmsValue}`);
};

// Esempio completo: Image Processing Pipeline  
const demonstrateImageProcessing = async () => {
    console.log('🖼️ Image Processing with WASM + FP Demo');
    
    const wasmWrapper = createWasmWrapper();
    const visionProcessor = createVisionProcessor(wasmWrapper);
    
    // Simula ImageData (in realtà verrebbe da canvas o video)
    const width = 640;
    const height = 480;
    const mockImageData = new ImageData(width, height);
    
    // Crea pipeline di processing
    const pipeline = visionProcessor.createImagePipeline()
        .grayscale()
        .blur(2)
        .threshold(128)
        .edgeDetection();
    
    // Esegui processing
    const processedImage = pipeline.execute(mockImageData);
    console.log(`Processed image: ${processedImage.width}x${processedImage.height}`);
};

// Export per testing e utilizzo
export {
    createWasmWrapper,
    createHybridArrayProcessor,
    createSignalProcessor,
    createWebAudioSystem,
    createVisionProcessor,
    demonstrateSignalProcessing,
    demonstrateImageProcessing
};

// Demo principale
if (typeof window !== 'undefined') {
    // Browser environment
    console.log('🌐 WebAssembly + Functional Programming Integration Examples');
    
    // Esegui demo
    demonstrateSignalProcessing();
    demonstrateImageProcessing();
} else {
    // Node.js environment
    console.log('📦 WebAssembly integration examples loaded (Node.js mode)');
}
