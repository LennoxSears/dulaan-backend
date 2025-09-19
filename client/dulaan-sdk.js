/**
 * Dulaan SDK - Unified API for motor control system
 * Main entry point that provides a clean, organized interface to all functionality
 */

// Import all modules
import { motorController } from './core/motor-controller.js';
import { audioProcessor } from './core/audio-processor.js';
import { apiService } from './services/api-service.js';
import { consentService } from './services/consent-service.js';
import { remoteService } from './services/remote-service.js';
import * as audioUtils from './utils/audio-utils.js';

// Import control modes
import { AIVoiceControl } from './modes/ai-voice-control.js';
import { AmbientControl } from './modes/ambient-control.js';
import { TouchControl } from './modes/touch-control.js';

class DulaanSDK {
    constructor() {
        // Core components
        this.motor = motorController;
        this.audio = audioProcessor;
        this.api = apiService;
        this.consent = consentService;
        this.remote = remoteService;
        this.utils = audioUtils;
        
        // Control modes
        this.modes = {
            ai: new AIVoiceControl(this),
            ambient: new AmbientControl(this),
            touch: new TouchControl(this)
        };
        
        // State
        this.currentMode = null;
        this.isInitialized = false;
        
        // Configuration
        this.config = {
            motor: {
                autoConnect: false,
                deviceAddress: null
            },
            audio: {
                sampleRate: 16000,
                maxEnergy: 0.075
            },
            remote: {
                autoHeartbeat: true,
                heartbeatInterval: 30000
            }
        };
    }

    /**
     * Initialize the SDK
     */
    async initialize(config = {}) {
        try {
            // Merge configuration
            this.config = { ...this.config, ...config };
            
            // Initialize motor controller
            await this.motor.initialize();
            
            // Auto-connect to motor if configured
            if (this.config.motor.autoConnect && this.config.motor.deviceAddress) {
                await this.motor.connect(this.config.motor.deviceAddress);
            }
            
            // Configure audio processor
            this.audio.setMaxEnergy(this.config.audio.maxEnergy);
            
            // Set up remote service callbacks
            this.remote.setEventCallbacks({
                onRemoteCommand: (data, userId) => this.handleRemoteCommand(data, userId),
                onHostReady: (hostId) => this.onHostReady(hostId),
                onRemoteConnected: (userId) => this.onRemoteConnected(userId),
                onRemoteDisconnected: (userId) => this.onRemoteDisconnected(userId)
            });
            
            this.isInitialized = true;
            console.log('Dulaan SDK initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Dulaan SDK:', error);
            return false;
        }
    }

    /**
     * Motor Control API
     */
    async connectMotor(deviceAddress) {
        return await this.motor.connect(deviceAddress);
    }

    async disconnectMotor() {
        return await this.motor.disconnect();
    }

    async setMotorPower(pwmValue) {
        return await this.motor.write(pwmValue);
    }

    getMotorPower() {
        return this.motor.getCurrentPwm();
    }

    isMotorConnected() {
        return this.motor.isMotorConnected();
    }

    /**
     * Control Modes API
     */
    async startAIControl() {
        await this.stopCurrentMode();
        this.currentMode = 'ai';
        return await this.modes.ai.start();
    }

    async stopAIControl() {
        if (this.currentMode === 'ai') {
            await this.modes.ai.stop();
            this.currentMode = null;
        }
    }

    async startAmbientControl() {
        await this.stopCurrentMode();
        this.currentMode = 'ambient';
        return await this.modes.ambient.start();
    }

    async stopAmbientControl() {
        if (this.currentMode === 'ambient') {
            await this.modes.ambient.stop();
            this.currentMode = null;
        }
    }

    async startTouchControl() {
        await this.stopCurrentMode();
        this.currentMode = 'touch';
        return await this.modes.touch.start();
    }

    async stopTouchControl() {
        if (this.currentMode === 'touch') {
            await this.modes.touch.stop();
            this.currentMode = null;
        }
    }

    async stopCurrentMode() {
        if (this.currentMode) {
            await this.modes[this.currentMode].stop();
            this.currentMode = null;
        }
    }

    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Remote Control API
     */
    startAsHost() {
        const hostId = this.remote.initializeAsHost();
        
        if (this.config.remote.autoHeartbeat) {
            this.remote.startHeartbeat(this.config.remote.heartbeatInterval);
        }
        
        return hostId;
    }

    connectToHost(hostId) {
        this.remote.connectAsRemote(hostId);
        
        if (this.config.remote.autoHeartbeat) {
            this.remote.startHeartbeat(this.config.remote.heartbeatInterval);
        }
    }

    sendRemoteCommand(mode, value, data = {}) {
        return this.remote.sendControlCommand(mode, value, data);
    }

    disconnectRemote() {
        this.remote.stopHeartbeat();
        this.remote.disconnect();
    }

    getRemoteStatus() {
        return this.remote.getStatus();
    }

    /**
     * User Management API
     */
    async getDeviceId() {
        return await this.consent.getDeviceId();
    }

    async collectConsent(consentData) {
        return await this.consent.collectUserConsent(consentData);
    }

    async revokeConsent() {
        return await this.consent.revokeConsent();
    }

    getConsentStatus() {
        return this.consent.getConsentSummary();
    }

    hasConsent(type = 'dataProcessing') {
        return this.consent.hasConsent(type);
    }

    /**
     * Audio Processing API
     */
    setMaxEnergy(energy) {
        this.audio.setMaxEnergy(energy);
        this.config.audio.maxEnergy = energy;
    }

    getMaxEnergy() {
        return this.audio.getMaxEnergy();
    }

    getAudioState() {
        return this.audio.getAudioState();
    }

    /**
     * Configuration API
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Apply configuration changes
        if (newConfig.audio?.maxEnergy) {
            this.audio.setMaxEnergy(newConfig.audio.maxEnergy);
        }
        
        if (newConfig.remote) {
            this.remote.updatePeerConfig(newConfig.remote);
        }
    }

    getConfig() {
        return { ...this.config };
    }

    /**
     * Event Handlers
     */
    handleRemoteCommand(data, userId) {
        if (data.type === 'control_command') {
            if (typeof data.value === 'number' && data.value >= 0 && data.value <= 255) {
                this.setMotorPower(data.value);
                console.log(`Remote command from ${userId}: ${data.mode} = ${data.value}`);
            }
        }
    }

    onHostReady(hostId) {
        console.log('Host ready with ID:', hostId);
    }

    onRemoteConnected(userId) {
        console.log('Remote user connected:', userId);
    }

    onRemoteDisconnected(userId) {
        console.log('Remote user disconnected:', userId);
    }

    /**
     * Utility Methods
     */
    async testConnectivity() {
        return await this.api.testConnectivity();
    }

    getSDKInfo() {
        return {
            version: '2.0.0',
            initialized: this.isInitialized,
            currentMode: this.currentMode,
            motorConnected: this.motor.isMotorConnected(),
            remoteStatus: this.remote.getStatus(),
            consentStatus: this.consent.getConsentSummary()
        };
    }


}

// Create singleton instance
const dulaan = new DulaanSDK();

// Export both class and instance
export { DulaanSDK, dulaan };

// Global access
if (typeof window !== 'undefined') {
    window.dulaan = dulaan;
    window.DulaanSDK = DulaanSDK;
}