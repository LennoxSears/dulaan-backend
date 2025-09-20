/**
 * AI Voice Control Mode
 * Handles voice recognition and AI-powered motor control using streaming
 */

export class AIVoiceControl {
    constructor(sdk) {
        this.sdk = sdk;
        this.isActive = false;

        this.messageHistory = [];
        
        // Audio state for streaming (using existing audio processor)
        this.audioState = {
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
    }

    async start() {
        if (this.isActive) {
            console.warn('AI Voice Control already active');
            return false;
        }

        try {
            // Request audio recording permission
            const permission = await window.Capacitor.Plugins.VoiceRecorder.requestAudioRecordingPermission();
            if (!permission.value) {
                throw new Error('Audio recording permission denied');
            }

            // Remove any existing listeners
            await window.Capacitor.Plugins.VoiceRecorder.removeAllListeners();
            
            // Add streaming listener for real-time audio chunks
            window.Capacitor.Plugins.VoiceRecorder.addListener('audioChunk', (data) => {
                this.processAudioChunk(data.chunk);
            });

            // Start audio streaming (not recording)
            await window.Capacitor.Plugins.VoiceRecorder.startStreaming();
            
            this.isActive = true;
            this.setupSpeechProcessing();
            
            console.log('AI Voice Control started with streaming');
            return true;
        } catch (error) {
            console.error('Failed to start AI Voice Control:', error);
            return false;
        }
    }

    async stop() {
        if (!this.isActive) {
            return;
        }

        try {
            // Remove listeners and stop streaming
            await window.Capacitor.Plugins.VoiceRecorder.removeAllListeners();
            await window.Capacitor.Plugins.VoiceRecorder.stopStreaming();
            
            this.cleanupSpeechProcessing();
            this.isActive = false;
            
            console.log('AI Voice Control stopped');
        } catch (error) {
            console.error('Error stopping AI Voice Control:', error);
        }
    }

    setupSpeechProcessing() {
        // Register callback for silence-triggered speech processing (matches stream.js)
        this.sdk.audio.setSpeechSegmentCallback(async (speechData) => {
            await this.processSpeechSegment(speechData);
        });
    }

    cleanupSpeechProcessing() {
        // Remove speech processing callback
        this.sdk.audio.removeSpeechSegmentCallback();
    }

    async processAudioChunk(base64Chunk) {
        const result = this.sdk.audio.processAudioChunk(base64Chunk);
        
        if (result) {
            // Update UI or handle speech detection
            // console.log(`Speech detected: ${result.isSpeaking}, Energy: ${result.energy.toFixed(4)}`);
        }
    }

    async processSpeechSegment(speechData) {
        try {
            console.log('Processing speech with AI...');
            
            const result = await this.sdk.api.speechToTextWithLLM(
                speechData,
                this.sdk.motor.getCurrentPwm(),
                this.messageHistory
            );
            
            if (result.success) {
                // Update motor based on AI response
                await this.sdk.motor.write(result.newPwmValue);
                
                // Update message history
                this.messageHistory = result.msgHis;
                
                console.log(`AI Response: ${result.response}`);
                console.log(`PWM updated to: ${result.newPwmValue}`);
                
                // Trigger event for UI updates
                this.onAIResponse(result);
            } else {
                console.warn('AI processing failed:', result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Speech processing error:', error);
            
            // Handle specific error types
            if (error.message.includes('500')) {
                console.warn('API server error - speech processing temporarily unavailable');
            } else if (error.message.includes('timeout')) {
                console.warn('API timeout - speech processing took too long');
            } else if (error.message.includes('network')) {
                console.warn('Network error - check internet connection');
            }
            
            // Continue operation despite API errors (don't break voice control)
            console.log('Voice control continues despite API error');
        }
    }

    onAIResponse(result) {
        // Override this method to handle AI responses in UI
        if (typeof window !== 'undefined' && window.onAIResponse) {
            window.onAIResponse(result);
        }
    }

    getMessageHistory() {
        return [...this.messageHistory];
    }

    clearMessageHistory() {
        this.messageHistory = [];
    }

    isRunning() {
        return this.isActive;
    }
}

