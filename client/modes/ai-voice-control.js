/**
 * AI Voice Control Mode
 * Handles voice recognition and AI-powered motor control
 */

export class AIVoiceControl {
    constructor(sdk) {
        this.sdk = sdk;
        this.isActive = false;
        this.audioInterval = null;
        this.syncInterval = null;
        this.messageHistory = [];
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

            // Start audio recording
            await window.Capacitor.Plugins.VoiceRecorder.startRecording();
            
            this.isActive = true;
            this.startAudioProcessing();
            
            console.log('AI Voice Control started');
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
            // Stop audio recording
            await window.Capacitor.Plugins.VoiceRecorder.stopRecording();
            
            this.stopAudioProcessing();
            this.isActive = false;
            
            console.log('AI Voice Control stopped');
        } catch (error) {
            console.error('Error stopping AI Voice Control:', error);
        }
    }

    startAudioProcessing() {
        // Process audio chunks for speech detection
        this.audioInterval = setInterval(async () => {
            try {
                const result = await window.Capacitor.Plugins.VoiceRecorder.stopRecording();
                const base64Audio = result.value.recordDataBase64;
                
                if (base64Audio) {
                    await this.processAudioChunk(base64Audio);
                }
                
                // Restart recording for continuous capture
                await window.Capacitor.Plugins.VoiceRecorder.startRecording();
            } catch (error) {
                console.error('Audio processing error:', error);
            }
        }, 1000); // Process every second

        // Sync with speech processing
        this.syncInterval = setInterval(async () => {
            await this.packageAndProcessSpeech();
        }, 3000); // Check for speech every 3 seconds
    }

    stopAudioProcessing() {
        if (this.audioInterval) {
            clearInterval(this.audioInterval);
            this.audioInterval = null;
        }
        
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    async processAudioChunk(base64Chunk) {
        const result = this.sdk.audio.processAudioChunk(base64Chunk);
        
        if (result) {
            // Update UI or handle speech detection
            console.log(`Speech detected: ${result.isSpeaking}, Energy: ${result.energy.toFixed(4)}`);
        }
    }

    async packageAndProcessSpeech() {
        try {
            const speechData = await this.sdk.audio.packageSpeechSegment();
            
            if (speechData) {
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
                }
            }
        } catch (error) {
            console.error('Speech processing error:', error);
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

// Legacy global functions for backward compatibility
if (typeof window !== 'undefined') {
    window.startStreaming = async () => {
        if (window.dulaan && window.dulaan.modes && window.dulaan.modes.ai) {
            return await window.dulaan.modes.ai.start();
        }
    };
    
    window.stopStreaming = async () => {
        if (window.dulaan && window.dulaan.modes && window.dulaan.modes.ai) {
            return await window.dulaan.modes.ai.stop();
        }
    };
}