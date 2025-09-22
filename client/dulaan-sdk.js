/**
 * Dulaan SDK - Unified API for motor control system
 * Main entry point that provides a clean, organized interface to all functionality
 */

// Import all modules
import { motorController } from './core/motor-controller.js';
import { consentService } from './services/consent-service.js';
import { remoteService } from './services/remote-service.js';
import * as audioUtils from './utils/audio-utils.js';

// Import control modes (optimized as primary)
import { OptimizedAIVoiceControl } from './modes/optimized-ai-voice-control.js';
import { AmbientControl } from './modes/ambient-control.js';
import { TouchControl } from './modes/touch-control.js';

// Import optimized components (now primary)
import { OptimizedStreamingProcessor } from './core/optimized-streaming-processor.js';
import { OptimizedApiService } from './services/optimized-api-service.js';

class DulaanSDK {
    constructor() {
        // Core components - use global instances when available (for bundled version)
        this.motor = (typeof motorController !== 'undefined') ? motorController : 
                     (typeof window !== 'undefined' && window.motorController) ? window.motorController : 
                     new MotorController();
        
        // Create core instances with safety checks
        try {
            this.audio = new OptimizedStreamingProcessor(); // Create instance of optimized processor
        } catch (error) {
            console.error('Failed to create OptimizedStreamingProcessor:', error);
            this.audio = null;
        }
        
        try {
            this.api = new OptimizedApiService(); // Create instance of optimized API
        } catch (error) {
            console.error('Failed to create OptimizedApiService:', error);
            this.api = null;
        }
        
        this.consent = (typeof consentService !== 'undefined') ? consentService :
                       (typeof window !== 'undefined' && window.consentService) ? window.consentService :
                       new ConsentService();
        
        this.remote = (typeof remoteService !== 'undefined') ? remoteService :
                      (typeof window !== 'undefined' && window.remoteService) ? window.remoteService :
                      new RemoteService();
        
        this.utils = (typeof window !== 'undefined' && window.audioUtils) || {};
        
        // Control modes (optimized as primary) - with safe instantiation
        this.modes = {};
        
        try {
            this.modes.ai = new OptimizedAIVoiceControl({
                processor: this.audio,
                apiService: this.api,
                motorController: this.motor
            }); // Primary optimized mode
        } catch (error) {
            console.warn('Failed to create OptimizedAIVoiceControl:', error);
            this.modes.ai = null;
        }
        
        try {
            this.modes.ambient = new AmbientControl(this);
        } catch (error) {
            console.warn('Failed to create AmbientControl:', error);
            this.modes.ambient = null;
        }
        
        try {
            this.modes.touch = new TouchControl(this);
        } catch (error) {
            console.warn('Failed to create TouchControl:', error);
            this.modes.touch = null;
        }
        
        // Direct access to optimized components
        this.optimized = {
            processor: OptimizedStreamingProcessor,
            apiService: OptimizedApiService,
            voiceControl: OptimizedAIVoiceControl
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
            api: {
                geminiApiKey: null // Add API key configuration
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
            
            // Configure audio processor (optimized version uses internal thresholds)
            if (this.audio.setMaxEnergy) {
                this.audio.setMaxEnergy(this.config.audio.maxEnergy);
            } else {
                // OptimizedStreamingProcessor uses internal VAD parameters
                console.log('Using optimized VAD with internal energy thresholds');
            }
            
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
    async connect(deviceAddress) {
        return await this.motor.connect(deviceAddress);
    }

    async disconnect() {
        return await this.motor.disconnect();
    }

    async setPower(pwmValue) {
        return await this.motor.write(pwmValue);
    }

    getPower() {
        return this.motor.getCurrentPwm();
    }

    isConnected() {
        return this.motor.isMotorConnected();
    }

    /**
     * Control Modes API
     */
    async startMode(mode) {
        if (!this.modes[mode]) {
            throw new Error(`Unknown mode: ${mode}`);
        }
        
        await this.stopMode();
        this.currentMode = mode;
        return await this.modes[mode].start();
    }

    async stopMode() {
        if (this.currentMode) {
            await this.modes[this.currentMode].stop();
            this.currentMode = null;
        }
    }

    getCurrentMode() {
        return this.currentMode;
    }

    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Remote Control API
     */
    generateId() {
        return UTILS.generateShortId();
    }

    async startHost(hostId) {
        const id = hostId || this.generateId();
        await this.remote.initializeAsHost(id);
        return id;
    }

    async connectToHost(hostId) {
        return await this.remote.connectAsRemote(hostId);
    }

    async sendCommand(mode, value, data = {}) {
        return this.remote.sendControlCommand(mode, value, data);
    }

    disconnect() {
        this.remote.disconnect();
    }

    getStatus() {
        return this.remote.getStatus();
    }

    /**
     * User Management API
     */
    async getDeviceId() {
        return await this.consent.getDeviceId();
    }

    async setConsent(consentData) {
        return await this.consent.collectUserConsent(consentData);
    }

    async clearConsent() {
        return await this.consent.revokeConsent();
    }

    getConsent() {
        return this.consent.getConsentSummary();
    }

    hasConsent(type = 'dataProcessing') {
        return this.consent.hasConsent(type);
    }

    /**
     * Audio API
     */
    setAudioSensitivity(energy) {
        if (this.audio.setMaxEnergy) {
            this.audio.setMaxEnergy(energy);
        } else {
            console.log('OptimizedStreamingProcessor uses internal VAD thresholds');
        }
        this.config.audio.maxEnergy = energy;
    }

    getAudioSensitivity() {
        if (this.audio.getMaxEnergy) {
            return this.audio.getMaxEnergy();
        }
        return this.config.audio.maxEnergy;
    }

    getAudioState() {
        if (this.audio.getAudioState) {
            return this.audio.getAudioState();
        }
        // Return optimized processor state
        return this.audio.audioState || {};
    }

    /**
     * Configuration API
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Apply configuration changes
        if (newConfig.audio?.maxEnergy) {
            if (this.audio.setMaxEnergy) {
                this.audio.setMaxEnergy(newConfig.audio.maxEnergy);
            } else {
                console.log('OptimizedStreamingProcessor uses internal VAD thresholds');
            }
        }
        
        if (newConfig.api?.geminiApiKey) {
            this.api.setApiKey(newConfig.api.geminiApiKey);
        }
        
        if (newConfig.remote) {
            this.remote.updatePeerConfig(newConfig.remote);
        }
    }

    /**
     * Set Gemini API key for AI voice processing
     */
    setApiKey(apiKey) {
        this.config.api.geminiApiKey = apiKey;
        this.api.setApiKey(apiKey);
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
                this.setPower(data.value);
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

// Export class for bundling
export { DulaanSDK };

// Note: Global instance creation is handled by the build script