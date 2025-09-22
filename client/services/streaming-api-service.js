/**
 * Streaming API Service - Handles continuous audio streaming to API
 * Enables real-time conversation without silence-based chunking
 */

class StreamingApiService {
    constructor(config = {}) {
        this.baseUrls = {
            streamingAudioToPWM: 'https://directaudiotopwm-qveg3gkwxa-ew.a.run.app', // Same endpoint, different usage
            ...config.endpoints
        };
        
        // Streaming state
        this.streamingState = {
            isStreaming: false,
            currentStreamId: null,
            pendingChunks: new Map(),
            lastChunkIndex: -1,
            conversationHistory: [],
            currentPwm: 100,
            responseInProgress: false
        };
        
        // Callbacks
        this.onPartialResponse = null;
        this.onFinalResponse = null;
        this.onError = null;
    }

    /**
     * Start a new streaming session
     */
    startStreaming(initialPwm = 100, conversationHistory = []) {
        this.streamingState.isStreaming = true;
        this.streamingState.currentStreamId = this.generateStreamId();
        this.streamingState.pendingChunks.clear();
        this.streamingState.lastChunkIndex = -1;
        this.streamingState.conversationHistory = conversationHistory;
        this.streamingState.currentPwm = initialPwm;
        this.streamingState.responseInProgress = false;
        
        console.log(`[Streaming] Started session: ${this.streamingState.currentStreamId}`);
        
        return this.streamingState.currentStreamId;
    }

    /**
     * Send streaming audio chunk
     */
    async sendStreamChunk(streamChunk) {
        if (!this.streamingState.isStreaming) {
            console.warn("[Streaming] Not in streaming mode");
            return null;
        }

        try {
            const { audioData, isFinal, timestamp, chunkIndex } = streamChunk;
            
            // Store chunk for potential reassembly
            this.streamingState.pendingChunks.set(chunkIndex, streamChunk);
            
            console.log(`[Streaming] Sending chunk ${chunkIndex} (${isFinal ? 'final' : 'partial'})`);

            const response = await fetch(this.baseUrls.streamingAudioToPWM, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Stream-Id': this.streamingState.currentStreamId,
                    'X-Chunk-Index': chunkIndex.toString(),
                    'X-Is-Final': isFinal.toString()
                },
                body: JSON.stringify({
                    msgHis: this.streamingState.conversationHistory,
                    audioData: audioData,
                    currentPwm: this.streamingState.currentPwm,
                    streamingMode: true,
                    isFinal: isFinal,
                    chunkIndex: chunkIndex,
                    streamId: this.streamingState.currentStreamId
                })
            });

            if (!response.ok) {
                throw new Error(`Streaming API error: ${response.status}`);
            }

            const result = await response.json();
            
            // Handle response based on type
            if (isFinal) {
                await this.handleFinalResponse(result);
            } else {
                await this.handlePartialResponse(result, chunkIndex);
            }

            return result;

        } catch (error) {
            console.error('Streaming API error:', error);
            if (this.onError) {
                this.onError(error);
            }
            throw error;
        }
    }

    /**
     * Handle partial response from streaming
     */
    async handlePartialResponse(result, chunkIndex) {
        console.log(`[Streaming] Partial response for chunk ${chunkIndex}`);
        
        // Update state with partial results
        if (result.partialTranscription) {
            console.log(`[Partial] "${result.partialTranscription}"`);
        }
        
        if (result.intentDetected && result.newPwmValue !== undefined) {
            // Apply PWM changes immediately for responsive control
            this.streamingState.currentPwm = result.newPwmValue;
            console.log(`[Partial] PWM updated to: ${result.newPwmValue}`);
        }

        if (this.onPartialResponse) {
            this.onPartialResponse({
                chunkIndex: chunkIndex,
                partialTranscription: result.partialTranscription || '',
                pwmValue: this.streamingState.currentPwm,
                intentDetected: result.intentDetected || false,
                confidence: result.confidence || 0
            });
        }
    }

    /**
     * Handle final response from streaming
     */
    async handleFinalResponse(result) {
        console.log(`[Streaming] Final response received`);
        
        // Update conversation history
        if (result.transcription && result.response) {
            this.streamingState.conversationHistory.push({
                user: result.transcription,
                assistant: result.response,
                timestamp: new Date().toISOString(),
                pwm: result.newPwmValue || this.streamingState.currentPwm,
                intentDetected: result.intentDetected || false
            });

            // Keep only last 10 messages
            if (this.streamingState.conversationHistory.length > 10) {
                this.streamingState.conversationHistory = 
                    this.streamingState.conversationHistory.slice(-10);
            }
        }

        // Update PWM
        if (result.newPwmValue !== undefined) {
            this.streamingState.currentPwm = result.newPwmValue;
        }

        console.log(`[Final] "${result.transcription}" → "${result.response}" (PWM: ${this.streamingState.currentPwm})`);

        if (this.onFinalResponse) {
            this.onFinalResponse({
                transcription: result.transcription || '',
                response: result.response || '',
                newPwmValue: this.streamingState.currentPwm,
                intentDetected: result.intentDetected || false,
                conversationHistory: [...this.streamingState.conversationHistory],
                success: result.success || false
            });
        }

        // Clear pending chunks after final response
        this.streamingState.pendingChunks.clear();
        this.streamingState.lastChunkIndex = -1;
    }

    /**
     * Stop streaming session
     */
    stopStreaming() {
        if (this.streamingState.isStreaming) {
            console.log(`[Streaming] Stopped session: ${this.streamingState.currentStreamId}`);
            
            this.streamingState.isStreaming = false;
            this.streamingState.currentStreamId = null;
            this.streamingState.pendingChunks.clear();
            this.streamingState.lastChunkIndex = -1;
            this.streamingState.responseInProgress = false;
        }
    }

    /**
     * Send immediate command (for urgent motor control)
     */
    async sendImmediateCommand(audioData, currentPwm) {
        try {
            console.log("[Immediate] Sending urgent command");
            
            const response = await fetch(this.baseUrls.streamingAudioToPWM, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Immediate': 'true'
                },
                body: JSON.stringify({
                    msgHis: this.streamingState.conversationHistory,
                    audioData: audioData,
                    currentPwm: currentPwm,
                    immediateMode: true
                })
            });

            if (!response.ok) {
                throw new Error(`Immediate command API error: ${response.status}`);
            }

            const result = await response.json();
            
            // Update state immediately
            if (result.newPwmValue !== undefined) {
                this.streamingState.currentPwm = result.newPwmValue;
            }

            return result;

        } catch (error) {
            console.error('Immediate command error:', error);
            throw error;
        }
    }

    /**
     * Generate unique stream ID
     */
    generateStreamId() {
        return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Set callbacks for streaming events
     */
    setCallbacks(callbacks) {
        this.onPartialResponse = callbacks.onPartialResponse || null;
        this.onFinalResponse = callbacks.onFinalResponse || null;
        this.onError = callbacks.onError || null;
    }

    /**
     * Get current streaming state
     */
    getStreamingState() {
        return {
            isStreaming: this.streamingState.isStreaming,
            streamId: this.streamingState.currentStreamId,
            currentPwm: this.streamingState.currentPwm,
            conversationLength: this.streamingState.conversationHistory.length,
            pendingChunks: this.streamingState.pendingChunks.size,
            responseInProgress: this.streamingState.responseInProgress
        };
    }

    /**
     * Get conversation history
     */
    getConversationHistory() {
        return [...this.streamingState.conversationHistory];
    }

    /**
     * Clear conversation history
     */
    clearConversationHistory() {
        this.streamingState.conversationHistory = [];
        console.log("[Streaming] Conversation history cleared");
    }

    /**
     * Update PWM value
     */
    updatePwm(newPwm) {
        this.streamingState.currentPwm = Math.max(0, Math.min(255, newPwm));
        console.log(`[Streaming] PWM updated to: ${this.streamingState.currentPwm}`);
    }
}

export { StreamingApiService };