/**
 * Audio Processor - Core audio processing and analysis
 * Handles audio capture, processing, and analysis for motor control
 */

// Ring buffer implementation for audio data
class RingBuffer {
    constructor(size) {
        this.buffer = new Float32Array(size);
        this.size = size;
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }

    push(data) {
        const available = this.size - this.count;
        const toWrite = Math.min(data.length, available);

        const firstPart = Math.min(toWrite, this.size - this.tail);
        this.buffer.set(data.subarray(0, firstPart), this.tail);

        const secondPart = toWrite - firstPart;
        if (secondPart > 0) {
            this.buffer.set(data.subarray(firstPart, firstPart + secondPart), 0);
        }

        this.tail = (this.tail + toWrite) % this.size;
        this.count += toWrite;
        return toWrite;
    }

    readAll() {
        const out = new Float32Array(this.count);
        const firstPart = Math.min(this.count, this.size - this.head);
        out.set(this.buffer.subarray(this.head, this.head + firstPart));

        if (this.count > firstPart) {
            out.set(this.buffer.subarray(0, this.count - firstPart), firstPart);
        }
        
        // DON'T clear here - let the caller decide when to reset
        // This matches stream.js behavior where reset() is called separately
        
        return out;
    }
    
    readAllAndClear() {
        const out = this.readAll();
        this.reset();
        return out;
    }

    reset() {
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }
}

class AudioProcessor {
    constructor() {
        // Audio processing state
        this.audioState = {
            ringBuffer: new RingBuffer(480000 * 2), // 16000Hz * 30 seconds
            abiBuffer: new RingBuffer(1600),
            isSpeaking: false,
            silenceCounter: 0,
            SILENCE_THRESHOLD: 0.05,
            ZERO_CROSSING: 0.1,
            SILENCE_TIMEOUT: 25,
            MIN_SPEECH_DURATION: 10,
            lastChunkSize: 0,
            lastRMS: 0,
            lastZeroCrossings: 0
        };

        // Audio configuration
        this.pcmConfig = {
            sampleRate: 16000,
            channels: 1,
            bitsPerSample: 16,
            bufferSize: 1600
        };
        
        // Energy settings
        this.maxEnergy = 0.075;
        
        // Speech processing callback
        this.onSpeechSegmentReady = null;
    }

    /**
     * Convert base64 audio to Float32Array
     */
    base64ToFloat32Array(base64) {
        try {
            // Remove MIME header if present
            const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

            // Decode Base64
            const binary = atob(pureBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            // Convert to Float32Array with little-endian parsing
            const view = new DataView(bytes.buffer);
            const floats = new Float32Array(bytes.length / 4);
            for (let i = 0; i < floats.length; i++) {
                floats[i] = view.getFloat32(i * 4, true); // true = little-endian
            }
            return floats;
        } catch (e) {
            console.error("Base64 decode failed:", e);
            return new Float32Array(0);
        }
    }

    /**
     * Detect silence in audio data (matches stream.js logic exactly)
     */
    detectSilence(pcmData, threshold, zeroRatio) {
        let energy = 0;
        let zeroCrossings = 0;
        
        for (let i = 0; i < pcmData.length; i++) {
            energy += pcmData[i] ** 2;
            if (i > 0 && (Math.sign(pcmData[i]) !== Math.sign(pcmData[i - 1]))) {
                zeroCrossings++;
            }
        }
        
        const rms = Math.sqrt(energy / pcmData.length);
        const zeroRate = zeroCrossings / pcmData.length;
        
        this.audioState.lastRMS = rms;
        this.audioState.lastZeroCrossings = zeroCrossings;
        
        // Return true if silent (matches stream.js: NOT (rms > threshold && zeroCrossings > threshold))
        return !(rms > threshold && zeroCrossings > (pcmData.length * zeroRatio));
    }

    /**
     * Convert audio energy to PWM value (matches stream.js implementation exactly)
     */
    audio2PWM(maxEnergy) {
        const pcmData = this.audioState.abiBuffer.readAllAndClear();
        if (pcmData.length === 0) {
            return -1;
        }
        
        let energy = 0;
        for (let i = 0; i < pcmData.length; i++) {
            if (isNaN(pcmData[i])) {
                pcmData[i] = 0;
            }
            energy += pcmData[i] ** 2;
        }
        
        const rms = Math.sqrt(energy / pcmData.length);
        this.audioState.lastRMS = rms;
        
        const pwmValue = Math.round((rms / maxEnergy) * 255);
        return pwmValue > 255 ? 255 : pwmValue;
    }

    /**
     * Process audio chunk for speech detection (matches stream.js logic)
     */
    processAudioChunk(base64Chunk) {
        try {
            const pcmData = this.base64ToFloat32Array(base64Chunk);
            if (pcmData.length === 0) return null;

            // Update chunk size for minimum duration calculation
            this.audioState.lastChunkSize = pcmData.length;
            
            const isSilent = this.detectSilence(
                pcmData, 
                this.audioState.SILENCE_THRESHOLD, 
                this.audioState.ZERO_CROSSING
            );

            // Speech activity detection (matches stream.js logic)
            if (!isSilent) {
                this.audioState.silenceCounter = 0;
                if (!this.audioState.isSpeaking) {
                    console.log(
                        `[Speech Detected] Energy: ${this.audioState.lastRMS.toFixed(4)}, ` +
                        `Zero crossings: ${this.audioState.lastZeroCrossings}`
                    );
                }
                this.audioState.isSpeaking = true;
            } else if (this.audioState.isSpeaking) {
                this.audioState.silenceCounter++;
            }

            // Write to ring buffer (matches stream.js logic)
            const written = this.audioState.ringBuffer.push(pcmData);
            if (written < pcmData.length) {
                console.warn("Buffer overflow, discarding", pcmData.length - written, "samples");
                this.audioState.ringBuffer.reset();
            }

            // Silence timeout triggers speech packaging (matches stream.js)
            const minSamples = this.audioState.MIN_SPEECH_DURATION * this.audioState.lastChunkSize;
            if (
                this.audioState.silenceCounter >= this.audioState.SILENCE_TIMEOUT &&
                this.audioState.ringBuffer.count > minSamples
            ) {
                this.triggerSpeechPackaging();
            }

            return {
                isSpeaking: this.audioState.isSpeaking,
                energy: this.audioState.lastRMS,
                silenceCounter: this.audioState.silenceCounter
            };
        } catch (error) {
            console.error("Audio chunk processing failed:", error);
            return null;
        }
    }

    /**
     * Process audio chunk for ambient control (matches stream.js processAbiChunk)
     */
    processAbiChunk(base64Chunk) {
        try {
            const pcmData = this.base64ToFloat32Array(base64Chunk);
            if (pcmData.length === 0) return;

            // Update chunk size
            this.audioState.lastChunkSize = pcmData.length;
            
            // Write to ambient buffer (matches stream.js logic)
            const written = this.audioState.abiBuffer.push(pcmData);
            if (written < pcmData.length) {
                console.warn("ABI buffer overflow, discarding", pcmData.length - written, "samples");
                this.audioState.abiBuffer.reset();
            }
        } catch (error) {
            console.error("ABI chunk processing failed:", error);
        }
    }

    /**
     * Calculate ambient PWM value from accumulated buffer data (deprecated - use audio2PWM)
     */
    calculateAmbientPWM(maxEnergy) {
        // Redirect to the corrected audio2PWM method
        return this.audio2PWM(maxEnergy);
    }

    /**
     * Trigger speech packaging when silence detected (matches stream.js)
     */
    triggerSpeechPackaging() {
        if (this.onSpeechSegmentReady) {
            // Call the registered callback with packaged speech data
            const speechData = this.packageSpeechSegmentSync();
            if (speechData) {
                this.onSpeechSegmentReady(speechData);
            }
        }
    }

    /**
     * Package speech segment synchronously (matches stream.js logic exactly)
     */
    packageSpeechSegmentSync() {
        try {
            const pcmData = this.audioState.ringBuffer.readAll();
            if (pcmData.length === 0) return null;

            // Convert to Int16 to reduce transmission size (matches stream.js exactly)
            const int16Data = new Int16Array(pcmData.length);
            for (let i = 0; i < pcmData.length; i++) {
                const scaled = Math.max(-1, Math.min(1, pcmData[i])) * 32767;
                int16Data[i] = Math.max(-32768, Math.min(32767, scaled));
            }

            console.log("[Speech Packaging] PCM segment:", int16Data.length, "samples");

            // Reset state (matches stream.js exactly)
            this.audioState.ringBuffer.reset();
            this.audioState.isSpeaking = false;
            this.audioState.silenceCounter = 0;

            // Return Int16Array as regular array for JSON transmission
            return Array.from(int16Data);
        } catch (error) {
            console.error("Speech packaging failed:", error);
            // Reset state on error to prevent stuck state
            this.audioState.ringBuffer.reset();
            this.audioState.isSpeaking = false;
            this.audioState.silenceCounter = 0;
            return null;
        }
    }

    /**
     * Package speech segment for AI processing (legacy method for compatibility)
     */
    async packageSpeechSegment() {
        return this.packageSpeechSegmentSync();
    }

    /**
     * Reset audio state
     */
    reset() {
        this.audioState.ringBuffer.reset();
        this.audioState.abiBuffer.reset();
        this.audioState.isSpeaking = false;
        this.audioState.silenceCounter = 0;
        this.audioState.lastRMS = 0;
        this.audioState.lastZeroCrossings = 0;
    }

    /**
     * Get current audio state
     */
    getAudioState() {
        return { ...this.audioState };
    }

    /**
     * Add monitoring capability like stream.js
     */
    startMonitoring(intervalMs = 5000) {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        this.monitoringInterval = setInterval(() => {
            console.log(
                `[Audio Monitor] Buffer: ${this.audioState.ringBuffer.count}/${this.audioState.ringBuffer.size}`,
                `Silence: ${this.audioState.silenceCounter}`,
                `Energy: ${this.audioState.lastRMS.toFixed(4)}`,
                `Zero crossings: ${this.audioState.lastZeroCrossings}`
            );
        }, intervalMs);
    }
    
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    /**
     * Set max energy threshold
     */
    setMaxEnergy(energy) {
        this.maxEnergy = Math.max(0.01, Math.min(1.0, energy));
    }

    /**
     * Get max energy threshold
     */
    getMaxEnergy() {
        return this.maxEnergy;
    }

    /**
     * Register callback for when speech segment is ready
     */
    setSpeechSegmentCallback(callback) {
        this.onSpeechSegmentReady = callback;
    }

    /**
     * Remove speech segment callback
     */
    removeSpeechSegmentCallback() {
        this.onSpeechSegmentReady = null;
    }
}

// Create singleton instance
const audioProcessor = new AudioProcessor();

// Export both class and instance
export { AudioProcessor, audioProcessor, RingBuffer };

// Global access
if (typeof window !== 'undefined') {
    window.audioProcessor = audioProcessor;
    window.AUDIO_STATE = audioProcessor.audioState;
    window.RingBuffer = RingBuffer;
}