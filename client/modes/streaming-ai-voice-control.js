/**
 * Streaming AI Voice Control Mode
 * Enables continuous conversation with real-time audio streaming
 */

import { StreamingAudioProcessor } from '../core/streaming-audio-processor.js';
import { StreamingApiService } from '../services/streaming-api-service.js';

class StreamingAIVoiceControl {
    constructor(sdk) {
        this.sdk = sdk;
        this.isActive = false;
        
        // Initialize streaming components
        this.streamingProcessor = new StreamingAudioProcessor();
        this.streamingApi = new StreamingApiService();
        
        // State management
        this.conversationState = {
            isConversing: false,
            lastUserSpeech: 0,
            lastAIResponse: 0,
            responseTimeout: 5000, // 5 seconds
            conversationTimeout: 30000 // 30 seconds of inactivity
        };
        
        // Setup callbacks
        this.setupStreamingCallbacks();
        
        console.log('Streaming AI Voice Control initialized');
    }

    /**
     * Setup callbacks for streaming components
     */
    setupStreamingCallbacks() {
        // Audio processor callbacks
        this.streamingProcessor.setCallbacks({
            onVoiceStart: (data) => this.handleVoiceStart(data),
            onVoiceEnd: (data) => this.handleVoiceEnd(data),
            onStreamChunk: (chunk) => this.handleStreamChunk(chunk),
            onConversationStateChange: (active) => this.handleConversationStateChange(active)
        });

        // API service callbacks
        this.streamingApi.setCallbacks({
            onPartialResponse: (data) => this.handlePartialResponse(data),
            onFinalResponse: (data) => this.handleFinalResponse(data),
            onError: (error) => this.handleApiError(error)
        });
    }

    /**
     * Start streaming AI voice control
     */
    async start() {
        if (this.isActive) {
            console.warn('Streaming AI Voice Control already active');
            return;
        }

        try {
            console.log('Starting Streaming AI Voice Control...');
            
            // Start audio processing
            this.sdk.audio.setStreamingProcessor(this.streamingProcessor);
            
            // Start streaming session
            const currentPwm = this.sdk.motor.getCurrentPwm();
            const conversationHistory = this.streamingApi.getConversationHistory();
            this.streamingApi.startStreaming(currentPwm, conversationHistory);
            
            this.isActive = true;
            this.conversationState.isConversing = false;
            
            console.log('✅ Streaming AI Voice Control started');
            
            // Start conversation timeout checker
            this.startConversationTimeoutChecker();
            
        } catch (error) {
            console.error('Failed to start Streaming AI Voice Control:', error);
            throw error;
        }
    }

    /**
     * Stop streaming AI voice control
     */
    async stop() {
        if (!this.isActive) {
            return;
        }

        console.log('Stopping Streaming AI Voice Control...');
        
        // Stop streaming
        this.streamingApi.stopStreaming();
        
        // Reset processor
        this.streamingProcessor.reset();
        
        // Stop timeout checker
        this.stopConversationTimeoutChecker();
        
        this.isActive = false;
        this.conversationState.isConversing = false;
        
        console.log('✅ Streaming AI Voice Control stopped');
    }

    /**
     * Handle voice start event
     */
    handleVoiceStart(data) {
        console.log(`[Voice Start] Energy: ${data.energy.toFixed(4)}`);
        
        // Update conversation state
        this.conversationState.lastUserSpeech = Date.now();
        
        // Start conversation if not already active
        if (!this.conversationState.isConversing) {
            this.conversationState.isConversing = true;
            this.streamingProcessor.setConversationActive(true);
            console.log('🗣️ Conversation started');
        }
        
        // Notify UI
        this.notifyUI('voiceStart', data);
    }

    /**
     * Handle voice end event
     */
    handleVoiceEnd(data) {
        console.log(`[Voice End] Duration: ${data.duration}ms, Audio: ${data.audioLength} samples`);
        
        // Update conversation state
        this.conversationState.lastUserSpeech = Date.now();
        
        // Notify UI
        this.notifyUI('voiceEnd', data);
    }

    /**
     * Handle streaming audio chunk
     */
    async handleStreamChunk(chunk) {
        try {
            console.log(`[Stream Chunk] ${chunk.isFinal ? 'Final' : 'Partial'} chunk: ${chunk.audioData.length} samples`);
            
            // Send chunk to API
            await this.streamingApi.sendStreamChunk(chunk);
            
        } catch (error) {
            console.error('Failed to handle stream chunk:', error);
            this.handleApiError(error);
        }
    }

    /**
     * Handle partial response from API
     */
    handlePartialResponse(data) {
        console.log(`[Partial Response] "${data.partialTranscription}" (PWM: ${data.pwmValue})`);
        
        // Update motor immediately for responsive control
        if (data.intentDetected && data.pwmValue !== undefined) {
            this.sdk.motor.write(data.pwmValue);
        }
        
        // Notify UI with partial results
        this.notifyUI('partialResponse', {
            transcription: data.partialTranscription,
            pwmValue: data.pwmValue,
            intentDetected: data.intentDetected,
            confidence: data.confidence
        });
    }

    /**
     * Handle final response from API
     */
    async handleFinalResponse(data) {
        console.log(`[Final Response] "${data.transcription}" → "${data.response}"`);
        
        // Update conversation state
        this.conversationState.lastAIResponse = Date.now();
        
        // Update motor with final PWM value
        if (data.newPwmValue !== undefined) {
            await this.sdk.motor.write(data.newPwmValue);
        }
        
        // Notify UI with complete results
        this.notifyUI('finalResponse', {
            transcription: data.transcription,
            response: data.response,
            newPwmValue: data.newPwmValue,
            intentDetected: data.intentDetected,
            conversationHistory: data.conversationHistory
        });
        
        // Speak response if TTS is available
        if (this.sdk.tts && data.response) {
            try {
                await this.sdk.tts.speak(data.response);
            } catch (ttsError) {
                console.warn('TTS failed:', ttsError);
            }
        }
    }

    /**
     * Handle API errors
     */
    handleApiError(error) {
        console.error('Streaming API error:', error);
        
        // Notify UI
        this.notifyUI('error', {
            message: error.message,
            type: 'api_error'
        });
        
        // Continue streaming despite errors
        console.log('Continuing streaming despite error...');
    }

    /**
     * Handle conversation state changes
     */
    handleConversationStateChange(active) {
        this.conversationState.isConversing = active;
        
        console.log(`[Conversation] ${active ? 'Active' : 'Inactive'}`);
        
        // Notify UI
        this.notifyUI('conversationStateChange', { active });
    }

    /**
     * Start conversation timeout checker
     */
    startConversationTimeoutChecker() {
        this.conversationTimeoutInterval = setInterval(() => {
            this.checkConversationTimeout();
        }, 1000); // Check every second
    }

    /**
     * Stop conversation timeout checker
     */
    stopConversationTimeoutChecker() {
        if (this.conversationTimeoutInterval) {
            clearInterval(this.conversationTimeoutInterval);
            this.conversationTimeoutInterval = null;
        }
    }

    /**
     * Check for conversation timeout
     */
    checkConversationTimeout() {
        if (!this.conversationState.isConversing) {
            return;
        }

        const now = Date.now();
        const timeSinceLastActivity = Math.max(
            now - this.conversationState.lastUserSpeech,
            now - this.conversationState.lastAIResponse
        );

        // End conversation if timeout exceeded
        if (timeSinceLastActivity > this.conversationState.conversationTimeout) {
            console.log('[Conversation] Timeout - ending conversation');
            this.conversationState.isConversing = false;
            this.streamingProcessor.setConversationActive(false);
            
            // Notify UI
            this.notifyUI('conversationTimeout', {
                duration: timeSinceLastActivity
            });
        }
    }

    /**
     * Send immediate command (for urgent control)
     */
    async sendImmediateCommand(audioData) {
        try {
            const currentPwm = this.sdk.motor.getCurrentPwm();
            const result = await this.streamingApi.sendImmediateCommand(audioData, currentPwm);
            
            if (result.newPwmValue !== undefined) {
                await this.sdk.motor.write(result.newPwmValue);
            }
            
            return result;
            
        } catch (error) {
            console.error('Immediate command failed:', error);
            throw error;
        }
    }

    /**
     * Clear conversation history
     */
    clearConversation() {
        this.streamingApi.clearConversationHistory();
        console.log('Conversation history cleared');
        
        // Notify UI
        this.notifyUI('conversationCleared', {});
    }

    /**
     * Get conversation history
     */
    getConversationHistory() {
        return this.streamingApi.getConversationHistory();
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isActive: this.isActive,
            conversationState: { ...this.conversationState },
            streamingState: this.streamingApi.getStreamingState(),
            processorState: this.streamingProcessor.getState()
        };
    }

    /**
     * Notify UI of events
     */
    notifyUI(eventType, data) {
        // Emit custom event for UI to listen to
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('streamingAIVoiceEvent', {
                detail: {
                    type: eventType,
                    data: data,
                    timestamp: Date.now()
                }
            }));
        }
        
        // Also log for debugging
        console.log(`[UI Event] ${eventType}:`, data);
    }

    /**
     * Process audio chunk (called by audio system)
     */
    processAudioChunk(base64Chunk) {
        if (!this.isActive) {
            return null;
        }
        
        return this.streamingProcessor.processAudioChunk(base64Chunk);
    }
}

export { StreamingAIVoiceControl };