/**
 * Ambient Control Mode
 * Handles ambient sound-based motor control
 */

export class AmbientControl {
    constructor(sdk) {
        this.sdk = sdk;
        this.isActive = false;
        this.audioInterval = null;
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

            // Start audio recording
            await window.Capacitor.Plugins.VoiceRecorder.startRecording();
            
            this.isActive = true;
            this.startAudioProcessing();
            
            console.log('Ambient Control started');
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
            // Stop audio recording
            await window.Capacitor.Plugins.VoiceRecorder.stopRecording();
            
            this.stopAudioProcessing();
            this.isActive = false;
            
            // Set motor to 0 when stopping
            await this.sdk.motor.write(0);
            
            console.log('Ambient Control stopped');
        } catch (error) {
            console.error('Error stopping Ambient Control:', error);
        }
    }

    startAudioProcessing() {
        // Process audio chunks for ambient sound control
        this.audioInterval = setInterval(async () => {
            try {
                const result = await window.Capacitor.Plugins.VoiceRecorder.stopRecording();
                const base64Audio = result.value.recordDataBase64;
                
                if (base64Audio) {
                    await this.processAmbientAudio(base64Audio);
                }
                
                // Restart recording for continuous capture
                await window.Capacitor.Plugins.VoiceRecorder.startRecording();
            } catch (error) {
                console.error('Ambient audio processing error:', error);
            }
        }, 100); // Process every 100ms for responsive ambient control
    }

    stopAudioProcessing() {
        if (this.audioInterval) {
            clearInterval(this.audioInterval);
            this.audioInterval = null;
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

// Legacy global functions for backward compatibility
if (typeof window !== 'undefined') {
    window.startAbi = async () => {
        if (window.dulaan && window.dulaan.modes && window.dulaan.modes.ambient) {
            return await window.dulaan.modes.ambient.start();
        }
    };
    
    window.stopAbi = async () => {
        if (window.dulaan && window.dulaan.modes && window.dulaan.modes.ambient) {
            return await window.dulaan.modes.ambient.stop();
        }
    };
}