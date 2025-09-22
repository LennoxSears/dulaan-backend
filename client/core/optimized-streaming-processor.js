/**
 * Optimized Streaming Audio Processor
 * Efficient client-side VAD with smart API usage
 */

import { RingBuffer } from '../utils/audio-utils.js';

class OptimizedStreamingProcessor {
    constructor() {
        this.audioState = {
            // Local VAD buffers (optimized for longer speech and better context)
            vadBuffer: new RingBuffer(4800), // 300ms for VAD analysis (better context)
            speechBuffer: new RingBuffer(16000 * 30), // 30 seconds max speech (much longer)
            
            // VAD state
            isVoiceActive: false,
            voiceStartTime: 0,
            voiceEndTime: 0,
            consecutiveVoiceFrames: 0,
            consecutiveSilenceFrames: 0,
            
            // Optimized VAD thresholds for best accuracy
            VAD_ENERGY_THRESHOLD: 0.008, // Balanced threshold - not too sensitive to noise
            VAD_ZCR_THRESHOLD: 0.02, // Lower ZCR threshold for realistic speech
            VAD_VOICE_FRAMES: 3, // 3 consecutive frames to confirm voice (reduce false positives)
            VAD_SILENCE_FRAMES: 20, // 20 frames of silence to end speech (1.25 seconds)
            
            // Smart buffering
            MIN_SPEECH_DURATION: 6400, // 400ms minimum (in samples) - shorter for quick commands
            MAX_SPEECH_DURATION: 20000, // 20 seconds maximum in milliseconds
            SPEECH_TIMEOUT: 1250, // 1.25 seconds of silence ends speech
            
            // Efficiency tracking
            lastRMS: 0,
            lastZeroCrossings: 0,
            totalChunksProcessed: 0,
            speechChunksSent: 0,
            
            // Conversation state
            conversationActive: false,
            lastApiCall: 0,
            pendingSpeech: false
        };
        
        // Callbacks
        this.onSpeechReady = null;
        this.onVoiceStateChange = null;
        this.onConversationUpdate = null;
    }

    /**
     * Efficient Voice Activity Detection
     * Runs locally - no API calls
     */
    detectVoiceActivity(audioData) {
        // Calculate RMS energy efficiently
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        const rms = Math.sqrt(sum / audioData.length);
        this.audioState.lastRMS = rms;

        // Calculate zero-crossing rate efficiently
        let zeroCrossings = 0;
        for (let i = 1; i < audioData.length; i++) {
            if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
                zeroCrossings++;
            }
        }
        const zcr = zeroCrossings / audioData.length;
        this.audioState.lastZeroCrossings = zcr;

        // Advanced VAD decision with adaptive thresholds
        const energyActive = rms > this.audioState.VAD_ENERGY_THRESHOLD;
        const zcrActive = zcr > this.audioState.VAD_ZCR_THRESHOLD && zcr < 0.5; // ZCR too high = noise
        
        // Adaptive threshold based on recent SILENCE energy history (not speech)
        if (!this.energyHistory) this.energyHistory = [];
        
        // Only add to history if it's likely silence (low energy)
        if (rms <= this.audioState.VAD_ENERGY_THRESHOLD * 2) {
            this.energyHistory.push(rms);
            if (this.energyHistory.length > 50) this.energyHistory.shift();
        }
        
        const avgSilenceEnergy = this.energyHistory.length > 0 ? 
            this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length : 
            this.audioState.VAD_ENERGY_THRESHOLD;
        const adaptiveThreshold = Math.max(this.audioState.VAD_ENERGY_THRESHOLD, avgSilenceEnergy * 4);
        
        // Combined decision: energy must be active, ZCR should be reasonable
        const adaptiveCheck = rms > adaptiveThreshold * 1.5;
        const voiceDetected = energyActive && (zcrActive || adaptiveCheck);
        
        return voiceDetected;
    }

    /**
     * Process audio chunk efficiently
     * Only sends to API when speech is complete
     */
    processAudioChunk(base64Chunk) {
        try {
            const pcmData = this.base64ToFloat32Array(base64Chunk);
            if (pcmData.length === 0) return null;

            this.audioState.totalChunksProcessed++;

            // Always buffer audio for pre/post-speech context (smart buffering)
            this.audioState.vadBuffer.push(pcmData);
            
            // Local VAD - no API call
            const isVoiceActive = this.detectVoiceActivity(pcmData);
            
            // Voice activity state machine
            if (isVoiceActive) {
                this.audioState.consecutiveVoiceFrames++;
                this.audioState.consecutiveSilenceFrames = 0;
                
                // Voice start detection
                if (!this.audioState.isVoiceActive && 
                    this.audioState.consecutiveVoiceFrames >= this.audioState.VAD_VOICE_FRAMES) {
                    this.handleVoiceStart();
                }
                
                // Buffer speech audio during active speech
                if (this.audioState.isVoiceActive) {
                    this.audioState.speechBuffer.push(pcmData);
                    this.checkSpeechBufferLimits();
                }
                
            } else {
                this.audioState.consecutiveSilenceFrames++;
                this.audioState.consecutiveVoiceFrames = 0;
                
                // Voice end detection
                if (this.audioState.isVoiceActive && 
                    this.audioState.consecutiveSilenceFrames >= this.audioState.VAD_SILENCE_FRAMES) {
                    this.handleVoiceEnd();
                }
            }

            return {
                isVoiceActive: this.audioState.isVoiceActive,
                energy: this.audioState.lastRMS,
                zeroCrossings: this.audioState.lastZeroCrossings,
                speechBufferSize: this.audioState.speechBuffer.count,
                conversationActive: this.audioState.conversationActive,
                efficiency: {
                    totalChunks: this.audioState.totalChunksProcessed,
                    speechChunksSent: this.audioState.speechChunksSent,
                    apiCallRatio: this.audioState.speechChunksSent / this.audioState.totalChunksProcessed
                }
            };

        } catch (error) {
            console.error("Optimized audio processing failed:", error);
            return null;
        }
    }

    /**
     * Handle voice start - prepare for speech buffering with pre-speech context
     */
    handleVoiceStart() {
        this.audioState.isVoiceActive = true;
        this.audioState.voiceStartTime = Date.now();
        
        // Smart buffering: Include pre-speech context for natural start
        this.audioState.speechBuffer.reset();
        
        // Add recent VAD buffer content as pre-speech context (last 300ms for better quality)
        const preSpeechSamples = Math.min(4800, this.audioState.vadBuffer.count); // 300ms at 16kHz
        if (preSpeechSamples > 0) {
            const preSpeechData = this.audioState.vadBuffer.readLast(preSpeechSamples);
            this.audioState.speechBuffer.push(preSpeechData);
            console.log(`[Voice Start] Added ${preSpeechSamples} pre-speech samples (${(preSpeechSamples/16000*1000).toFixed(0)}ms) for context`);
        }
        
        this.audioState.pendingSpeech = true;
        
        console.log("[Voice Start] Beginning speech capture with smart buffering");
        
        if (this.onVoiceStateChange) {
            this.onVoiceStateChange({
                isActive: true,
                timestamp: this.audioState.voiceStartTime,
                energy: this.audioState.lastRMS,
                preSpeechSamples: preSpeechSamples
            });
        }
    }

    /**
     * Handle voice end - send complete speech to API with post-speech buffering
     */
    async handleVoiceEnd() {
        // Add small post-speech buffer for natural ending (100ms)
        const postSpeechDelay = 100;
        
        setTimeout(async () => {
            this.audioState.isVoiceActive = false;
            this.audioState.voiceEndTime = Date.now();
            const speechDuration = this.audioState.voiceEndTime - this.audioState.voiceStartTime;
            
            // Add recent VAD buffer as post-speech context (200ms for natural ending)
            const postSpeechSamples = Math.min(3200, this.audioState.vadBuffer.count); // 200ms
            if (postSpeechSamples > 0) {
                const postSpeechData = this.audioState.vadBuffer.readLast(postSpeechSamples);
                this.audioState.speechBuffer.push(postSpeechData);
                console.log(`[Voice End] Added ${postSpeechSamples} post-speech samples (${(postSpeechSamples/16000*1000).toFixed(0)}ms) for natural ending`);
            }
            
            console.log(`[Voice End] Speech duration: ${speechDuration}ms, Buffer: ${this.audioState.speechBuffer.count} samples`);
            
            // Send speech to API if we have enough audio and haven't sent recently
            if (this.audioState.speechBuffer.count >= this.audioState.MIN_SPEECH_DURATION) {
                const timeSinceLastSend = Date.now() - this.audioState.lastApiCall;
                if (timeSinceLastSend > 500) { // Prevent duplicate sends within 500ms
                    await this.sendSpeechToAPI(true); // Mark as final
                } else {
                    console.log("[Voice End] Speech already sent recently, skipping");
                    this.audioState.speechBuffer.reset();
                }
            } else {
                console.log("[Voice End] Speech too short, discarding");
                this.audioState.speechBuffer.reset();
            }
            
            this.audioState.pendingSpeech = false;
            
            if (this.onVoiceStateChange) {
                this.onVoiceStateChange({
                    isActive: false,
                    timestamp: this.audioState.voiceEndTime,
                    duration: speechDuration,
                    audioLength: this.audioState.speechBuffer.count,
                    postSpeechSamples: postSpeechSamples
                });
            }
        }, postSpeechDelay);
    }

    /**
     * Check if speech buffer needs to be sent (max duration reached)
     */
    async checkSpeechBufferLimits() {
        const speechDuration = Date.now() - this.audioState.voiceStartTime;
        const bufferSize = this.audioState.speechBuffer.count;
        
        // Send if max duration reached or buffer is full
        if (speechDuration >= this.audioState.MAX_SPEECH_DURATION || 
            bufferSize >= this.audioState.speechBuffer.capacity * 0.9) {
            
            console.log("[Buffer Limit] Sending speech chunk due to size/duration limit");
            await this.sendSpeechToAPI(false);
            
            // Keep some overlap for continuity
            const overlapSize = Math.min(3200, bufferSize * 0.1); // 200ms overlap
            const overlapData = this.audioState.speechBuffer.readLast(overlapSize);
            this.audioState.speechBuffer.reset();
            if (overlapData.length > 0) {
                this.audioState.speechBuffer.push(overlapData);
            }
        }
    }

    /**
     * Send complete speech to API - ONLY API call in the system
     */
    async sendSpeechToAPI(isFinal = true) {
        try {
            const speechData = this.audioState.speechBuffer.readAll();
            if (speechData.length === 0) return null;

            // Convert to Int16Array for API
            const int16Data = new Int16Array(speechData.length);
            for (let i = 0; i < speechData.length; i++) {
                const scaled = Math.max(-1, Math.min(1, speechData[i])) * 32767;
                int16Data[i] = Math.max(-32768, Math.min(32767, scaled));
            }

            const speechPacket = {
                audioData: Array.from(int16Data),
                timestamp: Date.now(),
                duration: Date.now() - this.audioState.voiceStartTime,
                isFinal: isFinal,
                sampleRate: 16000,
                channels: 1
            };

            console.log(`[API Call] Sending speech: ${speechData.length} samples (${(speechData.length/16000).toFixed(2)}s)`);
            
            this.audioState.speechChunksSent++;
            this.audioState.lastApiCall = Date.now();

            if (this.onSpeechReady) {
                await this.onSpeechReady(speechPacket);
            }

            // Reset buffer after sending
            if (isFinal) {
                this.audioState.speechBuffer.reset();
            }

            return speechPacket;

        } catch (error) {
            console.error("Failed to send speech to API:", error);
            throw error;
        }
    }

    /**
     * Force send current speech (for immediate commands)
     */
    async forceSendSpeech() {
        if (this.audioState.speechBuffer.count > 0) {
            console.log("[Force Send] Sending current speech buffer");
            return await this.sendSpeechToAPI(true);
        }
        return null;
    }

    /**
     * Set conversation active state
     */
    setConversationActive(active) {
        if (this.audioState.conversationActive !== active) {
            this.audioState.conversationActive = active;
            console.log(`[Conversation] ${active ? 'Started' : 'Ended'}`);
            
            if (this.onConversationUpdate) {
                this.onConversationUpdate(active);
            }
        }
    }

    /**
     * Convert base64 to Float32Array (optimized)
     */
    base64ToFloat32Array(base64String) {
        try {
            // Remove MIME header if present (matches legacy audio-processor.js)
            const pureBase64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;

            // Decode Base64
            const binary = atob(pureBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            // Convert to Float32Array with little-endian parsing (matches legacy)
            const view = new DataView(bytes.buffer);
            const floats = new Float32Array(bytes.length / 4);
            for (let i = 0; i < floats.length; i++) {
                floats[i] = view.getFloat32(i * 4, true); // true = little-endian
            }
            return floats;
        } catch (error) {
            console.error("Base64 to Float32Array conversion failed:", error);
            return new Float32Array(0);
        }
    }

    /**
     * Set callbacks
     */
    setCallbacks(callbacks) {
        this.onSpeechReady = callbacks.onSpeechReady || null;
        this.onVoiceStateChange = callbacks.onVoiceStateChange || null;
        this.onConversationUpdate = callbacks.onConversationUpdate || null;
    }

    /**
     * Get efficiency statistics including smart buffering metrics
     */
    getEfficiencyStats() {
        const totalChunks = this.audioState.totalChunksProcessed;
        const apiCalls = this.audioState.speechChunksSent;
        const efficiency = totalChunks > 0 ? (1 - apiCalls / totalChunks) * 100 : 0;
        
        return {
            totalChunksProcessed: totalChunks,
            apiCallsMade: apiCalls,
            efficiencyPercentage: efficiency.toFixed(1),
            chunksPerApiCall: totalChunks > 0 ? (totalChunks / Math.max(1, apiCalls)).toFixed(1) : 0,
            lastApiCall: this.audioState.lastApiCall,
            smartBuffering: {
                vadBufferSize: this.audioState.vadBuffer.count,
                speechBufferSize: this.audioState.speechBuffer.count,
                vadBufferMs: Math.round((this.audioState.vadBuffer.count / 16000) * 1000),
                speechBufferMs: Math.round((this.audioState.speechBuffer.count / 16000) * 1000),
                preSpeechContextMs: 200, // 200ms pre-speech buffering
                postSpeechContextMs: 100, // 100ms post-speech buffering
                bufferUtilization: {
                    vadBuffer: Math.round((this.audioState.vadBuffer.count / this.audioState.vadBuffer.capacity) * 100),
                    speechBuffer: Math.round((this.audioState.speechBuffer.count / this.audioState.speechBuffer.capacity) * 100)
                }
            }
        };
    }

    /**
     * Reset processor
     */
    reset() {
        this.audioState.speechBuffer.reset();
        this.audioState.vadBuffer.reset();
        this.audioState.isVoiceActive = false;
        this.audioState.conversationActive = false;
        this.audioState.pendingSpeech = false;
        this.audioState.consecutiveVoiceFrames = 0;
        this.audioState.consecutiveSilenceFrames = 0;
        
        console.log("[Reset] Processor state cleared");
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isVoiceActive: this.audioState.isVoiceActive,
            conversationActive: this.audioState.conversationActive,
            pendingSpeech: this.audioState.pendingSpeech,
            speechBufferSize: this.audioState.speechBuffer.count,
            energy: this.audioState.lastRMS,
            efficiency: this.getEfficiencyStats()
        };
    }
}

export { OptimizedStreamingProcessor };