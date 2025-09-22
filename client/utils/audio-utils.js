/**
 * Audio Utilities - Helper functions for audio processing
 */

/**
 * Efficient Ring Buffer for audio data
 * Optimized for real-time audio processing with minimal memory allocation
 */
export class RingBuffer {
    constructor(capacity) {
        this.capacity = capacity;
        this.buffer = new Float32Array(capacity);
        this.writeIndex = 0;
        this.count = 0;
    }

    /**
     * Add data to the buffer (single value or array)
     */
    push(data) {
        if (Array.isArray(data) || data instanceof Float32Array || data instanceof Int16Array) {
            for (let i = 0; i < data.length; i++) {
                this.pushSingle(data[i]);
            }
        } else {
            this.pushSingle(data);
        }
    }

    /**
     * Add single value to buffer
     */
    pushSingle(value) {
        this.buffer[this.writeIndex] = value;
        this.writeIndex = (this.writeIndex + 1) % this.capacity;
        this.count = Math.min(this.count + 1, this.capacity);
    }

    /**
     * Read last N samples from buffer
     */
    readLast(samples) {
        const numSamples = Math.min(samples, this.count);
        const result = new Float32Array(numSamples);
        let readIndex = (this.writeIndex - numSamples + this.capacity) % this.capacity;
        
        for (let i = 0; i < numSamples; i++) {
            result[i] = this.buffer[readIndex];
            readIndex = (readIndex + 1) % this.capacity;
        }
        
        return result;
    }

    /**
     * Read all data from buffer
     */
    readAll() {
        return this.readLast(this.count);
    }

    /**
     * Reset buffer to empty state
     */
    reset() {
        this.writeIndex = 0;
        this.count = 0;
    }

    /**
     * Check if buffer is full
     */
    isFull() {
        return this.count === this.capacity;
    }

    /**
     * Check if buffer is empty
     */
    isEmpty() {
        return this.count === 0;
    }

    /**
     * Get current fill percentage
     */
    getFillPercentage() {
        return (this.count / this.capacity) * 100;
    }
}

/**
 * Convert base64 to Float32Array with error handling
 */
export function base64ToFloat32Array(base64) {
    try {
        const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
        const binary = atob(pureBase64);
        const bytes = new Uint8Array(binary.length);
        
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const view = new DataView(bytes.buffer);
        const floats = new Float32Array(bytes.length / 4);
        
        for (let i = 0; i < floats.length; i++) {
            floats[i] = view.getFloat32(i * 4, true);
        }
        
        return floats;
    } catch (e) {
        console.error("Base64 to Float32Array conversion failed:", e);
        return new Float32Array(0);
    }
}

/**
 * Convert Float32Array to base64
 */
export function float32ArrayToBase64(floatArray) {
    try {
        const uint8Array = new Uint8Array(floatArray.buffer);
        return btoa(String.fromCharCode.apply(null, uint8Array));
    } catch (e) {
        console.error("Float32Array to base64 conversion failed:", e);
        return '';
    }
}

/**
 * Calculate RMS (Root Mean Square) energy of audio data
 */
export function calculateRMS(audioData) {
    if (!audioData || audioData.length === 0) return 0;
    
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
        sum += audioData[i] * audioData[i];
    }
    
    return Math.sqrt(sum / audioData.length);
}

/**
 * Calculate zero crossing rate
 */
export function calculateZeroCrossingRate(audioData) {
    if (!audioData || audioData.length < 2) return 0;
    
    let crossings = 0;
    for (let i = 1; i < audioData.length; i++) {
        if (Math.sign(audioData[i]) !== Math.sign(audioData[i - 1])) {
            crossings++;
        }
    }
    
    return crossings / audioData.length;
}

/**
 * Normalize audio data to [-1, 1] range
 */
export function normalizeAudio(audioData) {
    if (!audioData || audioData.length === 0) return audioData;
    
    const max = Math.max(...audioData.map(Math.abs));
    if (max === 0) return audioData;
    
    return audioData.map(sample => sample / max);
}

/**
 * Apply simple low-pass filter
 */
export function lowPassFilter(audioData, alpha = 0.1) {
    if (!audioData || audioData.length === 0) return audioData;
    
    const filtered = new Float32Array(audioData.length);
    filtered[0] = audioData[0];
    
    for (let i = 1; i < audioData.length; i++) {
        filtered[i] = alpha * audioData[i] + (1 - alpha) * filtered[i - 1];
    }
    
    return filtered;
}

/**
 * Convert energy to PWM value with configurable scaling
 */
export function energyToPWM(energy, maxEnergy = 0.075, maxPWM = 255) {
    if (energy <= 0) return 0;
    
    const normalizedEnergy = Math.min(energy / maxEnergy, 1.0);
    const pwmValue = Math.round(normalizedEnergy * maxPWM);
    
    return Math.max(0, Math.min(maxPWM, pwmValue));
}

/**
 * Detect voice activity in audio data
 */
export function detectVoiceActivity(audioData, energyThreshold = 0.01, zcrThreshold = 0.1) {
    const energy = calculateRMS(audioData);
    const zcr = calculateZeroCrossingRate(audioData);
    
    return {
        hasVoice: energy > energyThreshold && zcr < zcrThreshold,
        energy: energy,
        zeroCrossingRate: zcr
    };
}

/**
 * Create audio context for web audio processing
 */
export function createAudioContext() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        return new AudioContext();
    } catch (e) {
        console.error("Failed to create audio context:", e);
        return null;
    }
}

/**
 * Convert PCM data to different formats
 */
export const AudioFormat = {
    /**
     * Convert Float32 PCM to Int16 PCM
     */
    float32ToInt16(float32Array) {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const sample = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = sample * 0x7FFF;
        }
        return int16Array;
    },

    /**
     * Convert Int16 PCM to Float32 PCM
     */
    int16ToFloat32(int16Array) {
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 0x7FFF;
        }
        return float32Array;
    }
};

// Global access
if (typeof window !== 'undefined') {
    window.audioUtils = {
        RingBuffer,
        base64ToFloat32Array,
        float32ArrayToBase64,
        calculateRMS,
        calculateZeroCrossingRate,
        normalizeAudio,
        lowPassFilter,
        energyToPWM,
        detectVoiceActivity,
        createAudioContext,
        AudioFormat
    };
}