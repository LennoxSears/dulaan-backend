/**
 * Ambient Control Mode
 * Handles ambient sound-based motor control
 */

export class AmbientControl {
    constructor(sdk) {
        this.sdk = sdk;
        this.isActive = false;

    }

    async start() {
        if (this.isActive) {
            console.warn('Ambient Control already active');
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
                this.processAmbientAudio(data.chunk);
            });

            // Start audio streaming (not recording)
            await window.Capacitor.Plugins.VoiceRecorder.startStreaming();
            
            this.isActive = true;
            
            console.log('Ambient Control started with streaming');
            return true;
        } catch (error) {
            console.error('Failed to start Ambient Control:', error);
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
            
            this.isActive = false;
            
            // Set motor to 0 when stopping
            await this.sdk.motor.write(0);
            
            console.log('Ambient Control stopped');
        } catch (error) {
            console.error('Error stopping Ambient Control:', error);
        }
    }



    async processAmbientAudio(base64Chunk) {
        try {
            const result = this.sdk.audio.processAbiChunk(base64Chunk);
            
            if (result) {
                // Directly control motor based on ambient sound energy
                await this.sdk.motor.write(result.pwmValue);
                
                console.log(`Ambient: Energy=${result.energy.toFixed(4)}, PWM=${result.pwmValue}`);
                
                // Trigger event for UI updates
                this.onAmbientUpdate(result);
            }
        } catch (error) {
            console.error('Ambient processing error:', error);
        }
    }

    onAmbientUpdate(result) {
        // Override this method to handle ambient updates in UI
        if (typeof window !== 'undefined' && window.onAmbientUpdate) {
            window.onAmbientUpdate(result);
        }
    }

    setMaxEnergy(energy) {
        this.sdk.audio.setMaxEnergy(energy);
    }

    getMaxEnergy() {
        return this.sdk.audio.getMaxEnergy();
    }

    isRunning() {
        return this.isActive;
    }
}

