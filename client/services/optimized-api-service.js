/**
 * Optimized API Service
 * Efficient speech processing - only sends complete speech segments
 */

class OptimizedApiService {
    constructor(config = {}) {
        this.baseUrls = {
            processAudioToPWM: 'https://directaudiotopwm-qveg3gkwxa-ew.a.run.app',
            ...config.endpoints
        };
        
        // Conversation state
        this.conversationState = {
            history: [],
            currentPwm: 0, // Motor starts stopped
            isProcessing: false,
            lastResponse: 0,
            totalApiCalls: 0,
            totalProcessingTime: 0
        };
        
        // Callbacks
        this.onResponse = null;
        this.onError = null;
        this.onProcessingStateChange = null;
    }

    /**
     * Process complete speech segment
     * This is the ONLY API call method - much more efficient
     */
    async processSpeechSegment(speechPacket, options = {}) {
        if (this.conversationState.isProcessing) {
            console.warn("[API] Already processing speech, queuing...");
            // Could implement queuing here if needed
        }

        try {
            this.conversationState.isProcessing = true;
            this.conversationState.totalApiCalls++;
            const startTime = Date.now();
            
            if (this.onProcessingStateChange) {
                this.onProcessingStateChange(true);
            }

            console.log(`[API Call ${this.conversationState.totalApiCalls}] Processing speech segment: ${speechPacket.audioData.length} samples`);

            const response = await fetch(this.baseUrls.processAudioToPWM, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Processing-Mode': 'optimized',
                    'X-Speech-Duration': speechPacket.duration?.toString() || '0'
                },
                body: JSON.stringify({
                    msgHis: this.conversationState.history,
                    audioData: speechPacket.audioData,
                    currentPwm: this.conversationState.currentPwm,
                    optimizedMode: true,
                    speechMetadata: {
                        duration: speechPacket.duration,
                        sampleRate: speechPacket.sampleRate || 16000,
                        channels: speechPacket.channels || 1,
                        timestamp: speechPacket.timestamp
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            const processingTime = Date.now() - startTime;
            this.conversationState.totalProcessingTime += processingTime;

            console.log(`[API Response] Processed in ${processingTime}ms: "${result.transcription}" → PWM: ${result.newPwmValue}`);

            // Update conversation state
            await this.updateConversationState(result);

            // Notify callback
            if (this.onResponse) {
                this.onResponse({
                    ...result,
                    processingTime: processingTime,
                    apiCallNumber: this.conversationState.totalApiCalls
                });
            }

            return result;

        } catch (error) {
            console.error('Speech processing API error:', error);
            
            if (this.onError) {
                this.onError({
                    error: error,
                    speechPacket: speechPacket,
                    apiCallNumber: this.conversationState.totalApiCalls
                });
            }
            
            throw error;
            
        } finally {
            this.conversationState.isProcessing = false;
            this.conversationState.lastResponse = Date.now();
            
            if (this.onProcessingStateChange) {
                this.onProcessingStateChange(false);
            }
        }
    }

    /**
     * Update conversation state with API response
     */
    async updateConversationState(result) {
        // Update PWM
        if (result.newPwmValue !== undefined) {
            this.conversationState.currentPwm = result.newPwmValue;
        }

        // Update conversation history
        if (result.transcription && result.response) {
            const conversationEntry = {
                user: result.transcription,
                assistant: result.response,
                timestamp: new Date().toISOString(),
                pwm: this.conversationState.currentPwm,
                intentDetected: result.intentDetected || false,
                confidence: result.confidence || 0,
                apiCallNumber: this.conversationState.totalApiCalls
            };

            this.conversationState.history.push(conversationEntry);

            // Keep only last 10 messages for efficiency
            if (this.conversationState.history.length > 10) {
                this.conversationState.history = this.conversationState.history.slice(-10);
            }

            console.log(`[Conversation] Updated history: ${this.conversationState.history.length} messages`);
        }
    }

    /**
     * Send immediate command (for urgent motor control)
     * Uses the same efficient API but with priority flag
     */
    async sendImmediateCommand(speechPacket) {
        try {
            console.log("[Immediate] Processing urgent command");
            
            const response = await fetch(this.baseUrls.processAudioToPWM, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Processing-Mode': 'immediate',
                    'X-Priority': 'high'
                },
                body: JSON.stringify({
                    msgHis: this.conversationState.history,
                    audioData: speechPacket.audioData,
                    currentPwm: this.conversationState.currentPwm,
                    immediateMode: true,
                    speechMetadata: {
                        duration: speechPacket.duration,
                        timestamp: speechPacket.timestamp
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Immediate command API error: ${response.status}`);
            }

            const result = await response.json();
            
            // Update PWM immediately
            if (result.newPwmValue !== undefined) {
                this.conversationState.currentPwm = result.newPwmValue;
            }

            console.log(`[Immediate] Command processed: PWM → ${result.newPwmValue}`);
            
            return result;

        } catch (error) {
            console.error('Immediate command failed:', error);
            throw error;
        }
    }

    /**
     * Get conversation history
     */
    getConversationHistory() {
        return [...this.conversationState.history];
    }

    /**
     * Clear conversation history
     */
    clearConversationHistory() {
        this.conversationState.history = [];
        console.log("[Conversation] History cleared");
    }

    /**
     * Get current PWM value
     */
    getCurrentPwm() {
        return this.conversationState.currentPwm;
    }

    /**
     * Update PWM value
     */
    updatePwm(newPwm) {
        this.conversationState.currentPwm = Math.max(0, Math.min(255, newPwm));
        console.log(`[PWM] Updated to: ${this.conversationState.currentPwm}`);
    }

    /**
     * Get API efficiency statistics
     */
    getEfficiencyStats() {
        const avgProcessingTime = this.conversationState.totalApiCalls > 0 
            ? this.conversationState.totalProcessingTime / this.conversationState.totalApiCalls 
            : 0;

        return {
            totalApiCalls: this.conversationState.totalApiCalls,
            totalProcessingTime: this.conversationState.totalProcessingTime,
            averageProcessingTime: Math.round(avgProcessingTime),
            conversationLength: this.conversationState.history.length,
            currentPwm: this.conversationState.currentPwm,
            lastResponse: this.conversationState.lastResponse,
            isProcessing: this.conversationState.isProcessing
        };
    }

    /**
     * Set callbacks
     */
    setCallbacks(callbacks) {
        this.onResponse = callbacks.onResponse || null;
        this.onError = callbacks.onError || null;
        this.onProcessingStateChange = callbacks.onProcessingStateChange || null;
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isProcessing: this.conversationState.isProcessing,
            currentPwm: this.conversationState.currentPwm,
            conversationLength: this.conversationState.history.length,
            efficiency: this.getEfficiencyStats()
        };
    }

    /**
     * Reset service state
     */
    reset() {
        this.conversationState.history = [];
        this.conversationState.currentPwm = 0; // Reset to stopped
        this.conversationState.isProcessing = false;
        this.conversationState.totalApiCalls = 0;
        this.conversationState.totalProcessingTime = 0;
        
        console.log("[API Service] State reset");
    }
}

export { OptimizedApiService };