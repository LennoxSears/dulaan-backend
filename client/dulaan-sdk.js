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
import { StreamingAIVoiceControl } from './modes/streaming-ai-voice-control.js';
import { OptimizedAIVoiceControl } from './modes/optimized-ai-voice-control.js';
import { AmbientControl } from './modes/ambient-control.js';
import { TouchControl } from './modes/touch-control.js';

// Import optimized components
import { OptimizedStreamingProcessor } from './core/optimized-streaming-processor.js';
import { OptimizedApiService } from './services/optimized-api-service.js';

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
            streamingAI: new StreamingAIVoiceControl(this),
            optimizedAI: new OptimizedAIVoiceControl(this), // NEW: 90%+ efficiency VAD mode
            ambient: new AmbientControl(this),
            touch: new TouchControl(this)
        };
        
        // Optimized components (direct access)
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
        this.audio.setMaxEnergy(energy);
        this.config.audio.maxEnergy = energy;
    }

    getAudioSensitivity() {
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