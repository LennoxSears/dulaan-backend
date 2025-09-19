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

        // Processing intervals
        this.audioInterval = null;
        this.syncInterval = null;
        
        // Energy settings
        this.maxEnergy = 0.075;
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
     * Detect silence in audio data
     */
    detectSilence(pcmData, threshold, zeroRatio) {
        let energy = 0;
        let zeroCrossings = 0;
        
        for (let i = 0; i < pcmData.length; i++) {
            energy += pcmData[i] ** 2;
            if (i > 0 && Math.sign(pcmData[i]) !== Math.sign(pcmData[i - 1])) {
                zeroCrossings++;
            }
        }
        
        const rms = Math.sqrt(energy / pcmData.length);
        const zeroRate = zeroCrossings / pcmData.length;
        
        this.audioState.lastRMS = rms;
        this.audioState.lastZeroCrossings = zeroRate;
        
        return rms < threshold && zeroRate < zeroRatio;
    }

    /**
     * Convert audio energy to PWM value
     */
    audio2PWM(maxEnergy) {
        const energy = this.audioState.lastRMS;
        if (energy <= 0) return 0;
        
        const normalizedEnergy = Math.min(energy / maxEnergy, 1.0);
        const pwmValue = Math.round(normalizedEnergy * 255);
        
        return Math.max(0, Math.min(255, pwmValue));
    }

    /**
     * Process audio chunk for ambient control
     */
    processAudioChunk(base64Chunk) {
        try {
            const pcmData = this.base64ToFloat32Array(base64Chunk);
            if (pcmData.length === 0) return null;

            this.audioState.ringBuffer.push(pcmData);
            
            const isSilent = this.detectSilence(
                pcmData, 
                this.audioState.SILENCE_THRESHOLD, 
                this.audioState.ZERO_CROSSING
            );

            if (isSilent) {
                this.audioState.silenceCounter++;
                if (this.audioState.silenceCounter >= this.audioState.SILENCE_TIMEOUT) {
                    this.audioState.isSpeaking = false;
                }
            } else {
                this.audioState.silenceCounter = 0;
                this.audioState.isSpeaking = true;
            }

            return {
                isSpeaking: this.audioState.isSpeaking,
                energy: this.audioState.lastRMS,
                pwmValue: this.audio2PWM(this.maxEnergy),
                silenceCounter: this.audioState.silenceCounter
            };
        } catch (error) {
            console.error("Audio chunk processing failed:", error);
            return null;
        }
    }

    /**
     * Process audio chunk for ambient control (ABI)
     */
    processAbiChunk(base64Chunk) {
        try {
            const pcmData = this.base64ToFloat32Array(base64Chunk);
            if (pcmData.length === 0) return null;

            this.audioState.abiBuffer.push(pcmData);
            
            const energy = this.audioState.lastRMS;
            const pwmValue = this.audio2PWM(this.maxEnergy);

            return {
                energy: energy,
                pwmValue: pwmValue
            };
        } catch (error) {
            console.error("ABI chunk processing failed:", error);
            return null;
        }
    }

    /**
     * Package speech segment for AI processing
     */
    async packageSpeechSegment() {
        try {
            if (!this.audioState.isSpeaking) {
                return null;
            }

            const audioData = this.audioState.ringBuffer.readAll();
            if (audioData.length === 0) {
                return null;
            }

            // Convert Float32Array to base64
            const uint8Array = new Uint8Array(audioData.buffer);
            const base64Audio = btoa(String.fromCharCode.apply(null, uint8Array));

            this.audioState.ringBuffer.reset();
            
            return base64Audio;
        } catch (error) {
            console.error("Speech packaging failed:", error);
            return null;
        }
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