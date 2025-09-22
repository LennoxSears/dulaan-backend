/**
 * Streaming Audio Processor - Continuous Voice Activity Detection and Streaming
 * Enables natural conversation flow without silence-based chunking
 */

import { RingBuffer } from '../utils/audio-utils.js';

class StreamingAudioProcessor {
    constructor() {
        this.audioState = {
            // Streaming buffers
            streamBuffer: new RingBuffer(16000 * 2), // 2 seconds of audio
            vadBuffer: new RingBuffer(1600), // 100ms for VAD analysis
            
            // Voice Activity Detection
            isVoiceActive: false,
            voiceStartTime: 0,
            voiceEndTime: 0,
            consecutiveVoiceFrames: 0,
            consecutiveSilenceFrames: 0,
            
            // VAD thresholds (more sensitive than silence detection)
            VAD_ENERGY_THRESHOLD: 0.02, // Lower threshold for voice detection
            VAD_ZCR_THRESHOLD: 0.15,
            VAD_VOICE_FRAMES: 3, // Frames needed to confirm voice start
            VAD_SILENCE_FRAMES: 10, // Frames needed to confirm voice end
            
            // Streaming configuration
            STREAM_CHUNK_SIZE: 8000, // 500ms chunks for streaming
            MIN_VOICE_DURATION: 3200, // 200ms minimum voice duration
            MAX_VOICE_DURATION: 48000, // 3 seconds maximum before forced send
            
            // State tracking
            lastRMS: 0,
            lastZeroCrossings: 0,
            isStreaming: false,
            streamStartTime: 0,
            
            // Conversation state
            conversationActive: false,
            lastResponseTime: 0,
            responseTimeout: 5000 // 5 seconds timeout for responses
        };
        
        // Callbacks
        this.onVoiceStart = null;
        this.onVoiceEnd = null;
        this.onStreamChunk = null;
        this.onConversationStateChange = null;
    }

    /**
     * Enhanced Voice Activity Detection
     * More sophisticated than simple silence detection
     */
    detectVoiceActivity(audioData) {
        // Calculate RMS energy
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        const rms = Math.sqrt(sum / audioData.length);
        this.audioState.lastRMS = rms;

        // Calculate zero-crossing rate
        let zeroCrossings = 0;
        for (let i = 1; i < audioData.length; i++) {
            if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
                zeroCrossings++;
            }
        }
        const zcr = zeroCrossings / audioData.length;
        this.audioState.lastZeroCrossings = zcr;

        // Voice activity decision (more nuanced than silence detection)
        const hasEnergy = rms > this.audioState.VAD_ENERGY_THRESHOLD;
        const hasVoiceCharacteristics = zcr < this.audioState.VAD_ZCR_THRESHOLD;
        
        return hasEnergy && hasVoiceCharacteristics;
    }

    /**
     * Process audio chunk with continuous streaming
     */
    processAudioChunk(base64Chunk) {
        try {
            const pcmData = this.base64ToFloat32Array(base64Chunk);
            if (pcmData.length === 0) return null;

            // Add to VAD buffer for analysis
            this.audioState.vadBuffer.push(pcmData);
            
            // Detect voice activity
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
            } else {
                this.audioState.consecutiveSilenceFrames++;
                this.audioState.consecutiveVoiceFrames = 0;
                
                // Voice end detection
                if (this.audioState.isVoiceActive && 
                    this.audioState.consecutiveSilenceFrames >= this.audioState.VAD_SILENCE_FRAMES) {
                    this.handleVoiceEnd();
                }
            }

            // Add to stream buffer if voice is active
            if (this.audioState.isVoiceActive) {
                this.audioState.streamBuffer.push(pcmData);
                
                // Check if we should send a streaming chunk
                this.checkStreamingConditions();
            }

            return {
                isVoiceActive: this.audioState.isVoiceActive,
                isStreaming: this.audioState.isStreaming,
                energy: this.audioState.lastRMS,
                zeroCrossings: this.audioState.lastZeroCrossings,
                bufferSize: this.audioState.streamBuffer.count,
                conversationActive: this.audioState.conversationActive
            };

        } catch (error) {
            console.error("Streaming audio processing failed:", error);
            return null;
        }
    }

    /**
     * Handle voice start event
     */
    handleVoiceStart() {
        this.audioState.isVoiceActive = true;
        this.audioState.voiceStartTime = Date.now();
        this.audioState.streamBuffer.reset(); // Start fresh for new voice segment
        
        console.log("[Voice Start] Beginning voice activity detection");
        
        if (this.onVoiceStart) {
            this.onVoiceStart({
                timestamp: this.audioState.voiceStartTime,
                energy: this.audioState.lastRMS
            });
        }
    }

    /**
     * Handle voice end event
     */
    handleVoiceEnd() {
        this.audioState.isVoiceActive = false;
        this.audioState.voiceEndTime = Date.now();
        const voiceDuration = this.audioState.voiceEndTime - this.audioState.voiceStartTime;
        
        console.log(`[Voice End] Voice duration: ${voiceDuration}ms`);
        
        // Send final chunk if we have enough audio
        if (this.audioState.streamBuffer.count >= this.audioState.MIN_VOICE_DURATION) {
            this.sendStreamChunk(true); // Final chunk
        }
        
        if (this.onVoiceEnd) {
            this.onVoiceEnd({
                timestamp: this.audioState.voiceEndTime,
                duration: voiceDuration,
                audioLength: this.audioState.streamBuffer.count
            });
        }
    }

    /**
     * Check if we should send a streaming chunk
     */
    checkStreamingConditions() {
        const bufferSize = this.audioState.streamBuffer.count;
        const voiceDuration = Date.now() - this.audioState.voiceStartTime;
        
        // Send chunk if:
        // 1. Buffer is full enough for a chunk
        // 2. Voice has been active for max duration
        // 3. We have minimum voice duration and want to start streaming
        
        const shouldSendChunk = 
            bufferSize >= this.audioState.STREAM_CHUNK_SIZE ||
            voiceDuration >= this.audioState.MAX_VOICE_DURATION ||
            (bufferSize >= this.audioState.MIN_VOICE_DURATION && !this.audioState.isStreaming);
            
        if (shouldSendChunk) {
            this.sendStreamChunk(false); // Not final chunk
        }
    }

    /**
     * Send streaming audio chunk to API
     */
    sendStreamChunk(isFinal = false) {
        try {
            const audioData = this.audioState.streamBuffer.readAll();
            if (audioData.length === 0) return;

            // Convert to Int16Array for API
            const int16Data = new Int16Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
                const scaled = Math.max(-1, Math.min(1, audioData[i])) * 32767;
                int16Data[i] = Math.max(-32768, Math.min(32767, scaled));
            }

            const streamChunk = {
                audioData: Array.from(int16Data),
                isFinal: isFinal,
                timestamp: Date.now(),
                voiceDuration: Date.now() - this.audioState.voiceStartTime,
                chunkIndex: this.audioState.isStreaming ? this.getChunkIndex() : 0
            };

            console.log(`[Stream Chunk] Sending ${isFinal ? 'final' : 'partial'} chunk: ${audioData.length} samples`);

            if (this.onStreamChunk) {
                this.onStreamChunk(streamChunk);
            }

            // Update streaming state
            if (!this.audioState.isStreaming) {
                this.audioState.isStreaming = true;
                this.audioState.streamStartTime = Date.now();
            }

            // Reset buffer for next chunk (keep some overlap for continuity)
            if (!isFinal) {
                const overlapSize = Math.min(1600, audioData.length * 0.1); // 10% overlap
                const overlap = audioData.slice(-overlapSize);
                this.audioState.streamBuffer.reset();
                this.audioState.streamBuffer.push(overlap);
            } else {
                this.audioState.streamBuffer.reset();
                this.audioState.isStreaming = false;
            }

        } catch (error) {
            console.error("Failed to send stream chunk:", error);
        }
    }

    /**
     * Get current chunk index for streaming
     */
    getChunkIndex() {
        return Math.floor((Date.now() - this.audioState.streamStartTime) / 500);
    }

    /**
     * Set conversation state
     */
    setConversationActive(active) {
        if (this.audioState.conversationActive !== active) {
            this.audioState.conversationActive = active;
            this.audioState.lastResponseTime = Date.now();
            
            console.log(`[Conversation] ${active ? 'Started' : 'Ended'}`);
            
            if (this.onConversationStateChange) {
                this.onConversationStateChange(active);
            }
        }
    }

    /**
     * Check if conversation has timed out
     */
    checkConversationTimeout() {
        if (this.audioState.conversationActive) {
            const timeSinceResponse = Date.now() - this.audioState.lastResponseTime;
            if (timeSinceResponse > this.audioState.responseTimeout) {
                this.setConversationActive(false);
            }
        }
    }

    /**
     * Convert base64 to Float32Array (same as original)
     */
    base64ToFloat32Array(base64String) {
        try {
            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            const int16Array = new Int16Array(bytes.buffer);
            const float32Array = new Float32Array(int16Array.length);
            
            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 32768.0;
            }
            
            return float32Array;
        } catch (error) {
            console.error("Base64 to Float32Array conversion failed:", error);
            return new Float32Array(0);
        }
    }

    /**
     * Set callbacks for streaming events
     */
    setCallbacks(callbacks) {
        this.onVoiceStart = callbacks.onVoiceStart || null;
        this.onVoiceEnd = callbacks.onVoiceEnd || null;
        this.onStreamChunk = callbacks.onStreamChunk || null;
        this.onConversationStateChange = callbacks.onConversationStateChange || null;
    }

    /**
     * Reset processor state
     */
    reset() {
        this.audioState.streamBuffer.reset();
        this.audioState.vadBuffer.reset();
        this.audioState.isVoiceActive = false;
        this.audioState.isStreaming = false;
        this.audioState.conversationActive = false;
        this.audioState.consecutiveVoiceFrames = 0;
        this.audioState.consecutiveSilenceFrames = 0;
    }

    /**
     * Get current state for debugging
     */
    getState() {
        return {
            isVoiceActive: this.audioState.isVoiceActive,
            isStreaming: this.audioState.isStreaming,
            conversationActive: this.audioState.conversationActive,
            bufferSize: this.audioState.streamBuffer.count,
            energy: this.audioState.lastRMS,
            voiceFrames: this.audioState.consecutiveVoiceFrames,
            silenceFrames: this.audioState.consecutiveSilenceFrames
        };
    }
}

export { StreamingAudioProcessor };