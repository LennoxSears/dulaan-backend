/**
 * Dulaan Browser Bundle - Auto-generated from modular sources
 * Generated on: 2025-09-23T07:25:57.278Z
 * 
 * This file combines all modular ES6 files into a single browser-compatible bundle.
 * 
 * Source files:
 * - utils/constants.js
 * - utils/audio-utils.js
 * - core/motor-controller.js
 * - core/streaming-processor.js
 * - services/api-service.js
 * - services/consent-service.js
 * - services/remote-service.js
 * - modes/ai-voice-control.js
 * - modes/ambient-control.js
 * - modes/touch-control.js
 * - remote-control.js
 * - dulaan-sdk.js
 */

(function(window) {
    'use strict';


    // ============================================================================
    // utils/constants.js
    // ============================================================================

/**
 * Constants - Configuration constants and defaults
 */

// BLE Configuration
const BLE_CONFIG = {
    SERVICE_UUID: "0000FFE0-0000-1000-8000-00805F9B34FB",
    CHARACTERISTIC_UUID: "0000FFE1-0000-1000-8000-00805F9B34FB",
    CONNECTION_TIMEOUT: 10000,
    WRITE_TIMEOUT: 5000
};

// Audio Processing Configuration
const AUDIO_CONFIG = {
    SAMPLE_RATE: 16000,
    CHANNELS: 1,
    BITS_PER_SAMPLE: 16,
    BUFFER_SIZE: 1600,
    RING_BUFFER_SIZE: 480000 * 2, // 30 seconds at 16kHz
    ABI_BUFFER_SIZE: 1600,
    
    // Silence detection
    SILENCE_THRESHOLD: 0.05,
    ZERO_CROSSING_THRESHOLD: 0.1,
    SILENCE_TIMEOUT: 25,
    MIN_SPEECH_DURATION: 5,
    
    // Energy settings
    DEFAULT_MAX_ENERGY: 0.075,
    MIN_ENERGY: 0.01,
    MAX_ENERGY: 1.0
};

// PWM Configuration
const PWM_CONFIG = {
    MIN_VALUE: 0,
    MAX_VALUE: 255,
    DEFAULT_VALUE: 0,
    
    // Intensity levels
    VERY_LOW: { min: 1, max: 50 },
    LOW: { min: 51, max: 100 },
    MEDIUM: { min: 101, max: 150 },
    HIGH: { min: 151, max: 200 },
    MAXIMUM: { min: 201, max: 255 }
};

// API Configuration
const API_CONFIG = {
    ENDPOINTS: {
        DIRECT_AUDIO_TO_PWM: 'https://directaudiotopwm-qveg3gkwxa-ew.a.run.app',
        STORE_USER_DATA: 'https://storeuserdata-qveg3gkwxa-ew.a.run.app',
        STORE_USER_CONSENT: 'https://storeuserconsent-qveg3gkwxa-ew.a.run.app',
        GET_USER_CONSENT: 'https://getuserconsent-qveg3gkwxa-ew.a.run.app'
    },
    
    DEFAULT_OPTIONS: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        timeout: 30000
    },
    
    RETRY_CONFIG: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2
    }
};

// Remote Control Configuration
const REMOTE_CONFIG = {
    PEER_SERVER: {
        host: '34.38.33.102',
        port: 9000,
        path: '/',
        secure: false
    },
    
    ICE_SERVERS: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ],
    
    HEARTBEAT_INTERVAL: 30000,
    CONNECTION_TIMEOUT: 10000,
    RECONNECT_ATTEMPTS: 3,
    
    // ID Generation
    ID_LENGTH: 6,
    ID_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
};

// Consent Configuration
const CONSENT_CONFIG = {
    STORAGE_KEYS: {
        DEVICE_ID: 'dulaan_device_id',
        CONSENT: 'dulaan_consent_given',
        TIMESTAMP: 'dulaan_consent_timestamp'
    },
    
    VALID_CONSENT_FIELDS: [
        'analytics',
        'marketing', 
        'functional',
        'necessary',
        'dataProcessing',
        'cookies',
        'thirdParty',
        'remoteControl'
    ],
    
    CONSENT_EXPIRY_DAYS: 365,
    
    THUMBMARK_CONFIG: {
        exclude: ['permissions'],
        timeout: 3000,
        logging: false
    }
};

// Control Mode Configuration
const MODE_CONFIG = {
    AI_VOICE: {
        AUDIO_INTERVAL: 1000,
        SYNC_INTERVAL: 3000,
        MAX_MESSAGE_HISTORY: 10
    },
    
    AMBIENT: {
        AUDIO_INTERVAL: 100,
        RESPONSE_TIME: 50
    },
    
    TOUCH: {
        UPDATE_THROTTLE: 50,
        SMOOTH_TRANSITION: true
    }
};

// Error Messages
const ERROR_MESSAGES = {
    BLE_NOT_AVAILABLE: 'Bluetooth LE not available on this device',
    BLE_PERMISSION_DENIED: 'Bluetooth permission denied',
    BLE_CONNECTION_FAILED: 'Failed to connect to motor device',
    
    AUDIO_PERMISSION_DENIED: 'Audio recording permission denied',
    AUDIO_NOT_SUPPORTED: 'Audio recording not supported',
    
    API_CONNECTION_FAILED: 'Failed to connect to API server',
    API_INVALID_RESPONSE: 'Invalid response from API server',
    
    REMOTE_CONNECTION_FAILED: 'Failed to establish remote connection',
    REMOTE_HOST_NOT_FOUND: 'Remote host not found',
    
    CONSENT_REQUIRED: 'User consent required for this operation',
    DEVICE_ID_GENERATION_FAILED: 'Failed to generate device ID'
};

// Success Messages
const SUCCESS_MESSAGES = {
    BLE_CONNECTED: 'Successfully connected to motor device',
    BLE_DISCONNECTED: 'Disconnected from motor device',
    
    MODE_STARTED: 'Control mode started successfully',
    MODE_STOPPED: 'Control mode stopped successfully',
    
    REMOTE_HOST_STARTED: 'Remote host started successfully',
    REMOTE_CONNECTED: 'Connected to remote host successfully',
    
    CONSENT_COLLECTED: 'User consent collected successfully',
    CONSENT_REVOKED: 'User consent revoked successfully'
};

// SDK Information
const SDK_INFO = {
    NAME: 'Dulaan SDK',
    VERSION: '2.0.0',
    DESCRIPTION: 'Motor control system with voice, ambient, and remote control capabilities',
    AUTHOR: 'Dulaan Team',
    LICENSE: 'MIT'
};

// Utility Functions
const UTILS = {
    /**
     * Generate a short 6-character unique ID for peer connections
     * @returns {string} 6-character alphanumeric ID
     */
    generateShortId: () => {
        const chars = REMOTE_CONFIG.ID_CHARS;
        let result = '';
        for (let i = 0; i < REMOTE_CONFIG.ID_LENGTH; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    /**
     * Validate if an ID is in the correct format
     * @param {string} id - ID to validate
     * @returns {boolean} True if valid
     */
    isValidId: (id) => {
        if (!id || typeof id !== 'string') return false;
        if (id.length !== REMOTE_CONFIG.ID_LENGTH) return false;
        return /^[A-Z0-9]+$/.test(id);
    }
};

// Global access
if (typeof window !== 'undefined') {
    window.DULAAN_CONSTANTS = {
        BLE_CONFIG,
        AUDIO_CONFIG,
        PWM_CONFIG,
        API_CONFIG,
        REMOTE_CONFIG,
        CONSENT_CONFIG,
        MODE_CONFIG,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        SDK_INFO
    };
}

    // ============================================================================
    // utils/audio-utils.js
    // ============================================================================

/**
 * Audio Utilities - Helper functions for audio processing
 */

/**
 * Efficient Ring Buffer for audio data
 * Optimized for real-time audio processing with minimal memory allocation
 */
class RingBuffer {
    constructor(capacity) {
        this.capacity = capacity;
        this.buffer = new Float32Array(capacity);
        this.writeIndex = 0;
        this.count = 0;
    }

    /**
     * Add data to the buffer (single value or array)
     */
    push(data) {
        if (Array.isArray(data) || data instanceof Float32Array || data instanceof Int16Array) {
            for (let i = 0; i < data.length; i++) {
                this.pushSingle(data[i]);
            }
        } else {
            this.pushSingle(data);
        }
    }

    /**
     * Add single value to buffer
     */
    pushSingle(value) {
        this.buffer[this.writeIndex] = value;
        this.writeIndex = (this.writeIndex + 1) % this.capacity;
        this.count = Math.min(this.count + 1, this.capacity);
    }

    /**
     * Read last N samples from buffer
     */
    readLast(samples) {
        const numSamples = Math.min(samples, this.count);
        const result = new Float32Array(numSamples);
        let readIndex = (this.writeIndex - numSamples + this.capacity) % this.capacity;
        
        for (let i = 0; i < numSamples; i++) {
            result[i] = this.buffer[readIndex];
            readIndex = (readIndex + 1) % this.capacity;
        }
        
        return result;
    }

    /**
     * Read all data from buffer
     */
    readAll() {
        return this.readLast(this.count);
    }

    /**
     * Reset buffer to empty state
     */
    reset() {
        this.writeIndex = 0;
        this.count = 0;
    }

    /**
     * Check if buffer is full
     */
    isFull() {
        return this.count === this.capacity;
    }

    /**
     * Check if buffer is empty
     */
    isEmpty() {
        return this.count === 0;
    }

    /**
     * Get current fill percentage
     */
    getFillPercentage() {
        return (this.count / this.capacity) * 100;
    }
}

/**
 * Convert base64 to Float32Array with error handling
 */
function base64ToFloat32Array(base64) {
    try {
        const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
        const binary = atob(pureBase64);
        const bytes = new Uint8Array(binary.length);
        
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const view = new DataView(bytes.buffer);
        const floats = new Float32Array(bytes.length / 4);
        
        for (let i = 0; i < floats.length; i++) {
            floats[i] = view.getFloat32(i * 4, true);
        }
        
        return floats;
    } catch (e) {
        console.error("Base64 to Float32Array conversion failed:", e);
        return new Float32Array(0);
    }
}

/**
 * Convert Float32Array to base64
 */
function float32ArrayToBase64(floatArray) {
    try {
        const uint8Array = new Uint8Array(floatArray.buffer);
        return btoa(String.fromCharCode.apply(null, uint8Array));
    } catch (e) {
        console.error("Float32Array to base64 conversion failed:", e);
        return '';
    }
}

/**
 * Calculate RMS (Root Mean Square) energy of audio data
 */
function calculateRMS(audioData) {
    if (!audioData || audioData.length === 0) return 0;
    
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
        sum += audioData[i] * audioData[i];
    }
    
    return Math.sqrt(sum / audioData.length);
}

/**
 * Calculate zero crossing rate
 */
function calculateZeroCrossingRate(audioData) {
    if (!audioData || audioData.length < 2) return 0;
    
    let crossings = 0;
    for (let i = 1; i < audioData.length; i++) {
        if (Math.sign(audioData[i]) !== Math.sign(audioData[i - 1])) {
            crossings++;
        }
    }
    
    return crossings / audioData.length;
}

/**
 * Normalize audio data to [-1, 1] range
 */
function normalizeAudio(audioData) {
    if (!audioData || audioData.length === 0) return audioData;
    
    const max = Math.max(...audioData.map(Math.abs));
    if (max === 0) return audioData;
    
    return audioData.map(sample => sample / max);
}

/**
 * Apply simple low-pass filter
 */
function lowPassFilter(audioData, alpha = 0.1) {
    if (!audioData || audioData.length === 0) return audioData;
    
    const filtered = new Float32Array(audioData.length);
    filtered[0] = audioData[0];
    
    for (let i = 1; i < audioData.length; i++) {
        filtered[i] = alpha * audioData[i] + (1 - alpha) * filtered[i - 1];
    }
    
    return filtered;
}

/**
 * Convert energy to PWM value with configurable scaling
 */
function energyToPWM(energy, maxEnergy = 0.075, maxPWM = 255) {
    if (energy <= 0) return 0;
    
    const normalizedEnergy = Math.min(energy / maxEnergy, 1.0);
    const pwmValue = Math.round(normalizedEnergy * maxPWM);
    
    return Math.max(0, Math.min(maxPWM, pwmValue));
}

/**
 * Detect voice activity in audio data
 */
function detectVoiceActivity(audioData, energyThreshold = 0.01, zcrThreshold = 0.1) {
    const energy = calculateRMS(audioData);
    const zcr = calculateZeroCrossingRate(audioData);
    
    return {
        hasVoice: energy > energyThreshold && zcr < zcrThreshold,
        energy: energy,
        zeroCrossingRate: zcr
    };
}

/**
 * Create audio context for web audio processing
 */
function createAudioContext() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        return new AudioContext();
    } catch (e) {
        console.error("Failed to create audio context:", e);
        return null;
    }
}

/**
 * Convert PCM data to different formats
 */
const AudioFormat = {
    /**
     * Convert Float32 PCM to Int16 PCM
     */
    float32ToInt16(float32Array) {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const sample = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = sample * 0x7FFF;
        }
        return int16Array;
    },

    /**
     * Convert Int16 PCM to Float32 PCM
     */
    int16ToFloat32(int16Array) {
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 0x7FFF;
        }
        return float32Array;
    }
};

// Global access
if (typeof window !== 'undefined') {
    window.audioUtils = {
        RingBuffer,
        base64ToFloat32Array,
        float32ArrayToBase64,
        calculateRMS,
        calculateZeroCrossingRate,
        normalizeAudio,
        lowPassFilter,
        energyToPWM,
        detectVoiceActivity,
        createAudioContext,
        AudioFormat
    };
}

    // ============================================================================
    // core/motor-controller.js
    // ============================================================================

/**
 * Motor Controller - Core BLE communication and motor control
 * Handles low-level hardware communication with the motor device
 */

// BleClient and hexStringToDataView are expected to be available globally
// via Capacitor plugins or browser environment

// Helper function for hexStringToDataView if not available
function hexStringToDataView(hexString) {
    if (typeof window !== 'undefined' && window.hexStringToDataView) {
        return window.hexStringToDataView(hexString);
    }
    
    // Fallback implementation
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return new DataView(bytes.buffer);
}

// Helper function to get BleClient safely
function getBleClient() {
    if (typeof window !== 'undefined') {
        return window.BleClient ||
               null;
    }
    return null;
}

class MotorController {
    constructor() {
        this.deviceAddress = null;
        this.isConnected = false;
        this.currentPwm = 0; // Motor starts stopped
        this.isScanning = false;
        this.scanResults = [];
        this.onScanResult = null;
        this.onDisconnect = null;
        
        // BLE service and characteristic UUIDs
        this.SERVICE_UUID = "0000FFE0-0000-1000-8000-00805F9B34FB";
        this.CHARACTERISTIC_UUID = "0000FFE1-0000-1000-8000-00805F9B34FB";
        
        // Device identification
        this.TARGET_DEVICE_NAME = "XKL-Q086-BT";
        this.SCAN_TIMEOUT = 10000; // 10 seconds default
    }

    /**
     * Initialize BLE and connect to device
     */
    async initialize() {
        try {
            const BleClient = getBleClient();
            if (!BleClient) {
                console.warn('BleClient not available - using mock mode');
                return true;
            }
            
            await BleClient.initialize();
            console.log('BLE initialized');
            return true;
        } catch (error) {
            console.error('BLE initialization failed:', error);
            return false;
        }
    }

    /**
     * Scan for motor devices (based on plugin.js implementation)
     */
    async scan(timeout = this.SCAN_TIMEOUT) {
        if (this.isScanning) {
            console.warn('Scan already in progress');
            return false;
        }

        try {
            const BleClient = getBleClient();
            if (!BleClient) {
                console.warn('BleClient not available - cannot scan');
                return false;
            }

            await BleClient.initialize();
            this.isScanning = true;
            this.scanResults = [];
            
            console.log('Starting BLE scan for motor devices...');
            
            await BleClient.requestLEScan({}, async (result) => {
                console.log('Scan result:', JSON.stringify(result));
                
                // Filter for target device name (matches plugin.js)
                if (result.device.name === this.TARGET_DEVICE_NAME) {
                    console.log('Found target device:', result.device.deviceId);
                    this.deviceAddress = result.device.deviceId;
                    this.scanResults.push(result.device);
                    
                    // Stop scan immediately when target device is found
                    console.log('Target device found, stopping scan...');
                    await this.stopScan();
                    
                    // Trigger callback if set
                    if (this.onScanResult) {
                        this.onScanResult(result.device);
                    }
                }
            });

            // Stop scan after timeout
            setTimeout(async () => {
                if (this.isScanning) {
                    await this.stopScan();
                }
            }, timeout);

            return true;
        } catch (error) {
            console.error('Failed to start scan:', error);
            this.isScanning = false;
            return false;
        }
    }

    /**
     * Stop BLE scanning
     */
    async stopScan() {
        if (!this.isScanning) {
            return;
        }

        try {
            const BleClient = getBleClient();
            if (BleClient) {
                await BleClient.stopLEScan();
            }
            this.isScanning = false;
            console.log('BLE scan stopped');
        } catch (error) {
            console.error('Failed to stop scan:', error);
        }
    }

    /**
     * Scan and connect to motor device automatically
     */
    async scanAndConnect(timeout = this.SCAN_TIMEOUT) {
        try {
            console.log('Scanning for motor device...');
            await this.scan(timeout);
            
            // Wait for scan to complete
            await new Promise(resolve => setTimeout(resolve, timeout + 1000));
            
            if (this.deviceAddress) {
                console.log('Device found, attempting to connect...');
                return await this.connect();
            } else {
                console.warn('No motor device found during scan');
                return false;
            }
        } catch (error) {
            console.error('Scan and connect failed:', error);
            return false;
        }
    }

    /**
     * Connect to motor device
     */
    async connect(deviceAddress = null) {
        try {
            if (deviceAddress) {
                this.deviceAddress = deviceAddress;
            }
            
            if (!this.deviceAddress) {
                throw new Error('No device address provided. Use scan() or scanAndConnect() first.');
            }

            const BleClient = getBleClient();
            if (!BleClient) {
                console.warn('BleClient not available - using mock mode');
                this.isConnected = true;
                return true;
            }
            
            // Set up disconnect callback (matches plugin.js pattern)
            const disconnectCallback = (deviceId) => {
                this.isConnected = false;
                this.deviceAddress = null;
                console.log(`Motor device ${deviceId} disconnected`);
                
                if (this.onDisconnect) {
                    this.onDisconnect(deviceId);
                }
            };
            
            await BleClient.connect(this.deviceAddress, disconnectCallback);
            this.isConnected = true;
            console.log('Connected to motor device:', this.deviceAddress);
            return true;
        } catch (error) {
            console.error('Failed to connect to motor device:', error);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Disconnect from motor device
     */
    async disconnect() {
        try {
            const BleClient = getBleClient();
            if (this.deviceAddress && BleClient) {
                await BleClient.disconnect(this.deviceAddress);
            }
            this.isConnected = false;
            this.deviceAddress = null;
            console.log('Disconnected from motor device');
        } catch (error) {
            console.error('Failed to disconnect:', error);
        }
    }

    /**
     * Write PWM value to motor (0-255)
     */
    async write(pwmValue) {
        //console.log(`[MOTOR WRITE] Attempting to write PWM: ${pwmValue}`);
        //console.log(`[MOTOR WRITE] Connection status: ${this.isConnected}, Device: ${this.deviceAddress}`);
        
        if (!this.isConnected || !this.deviceAddress) {
            console.warn('[MOTOR WRITE] ❌ Motor not connected, cannot write PWM value');
            return false;
        }

        try {
            // Validate PWM value
            const pwm = Math.max(0, Math.min(255, Math.round(pwmValue)));
            //console.log(`[MOTOR WRITE] Validated PWM: ${pwm} (from ${pwmValue})`);
            
            // Convert to hex string
            const hexValue = this.decimalToHexString(pwm);
            //console.log(`[MOTOR WRITE] Hex value: ${hexValue}`);
            
            // Write to BLE characteristic
            const BleClient = getBleClient();
            if (!BleClient) {
                console.warn('[MOTOR WRITE] ⚠️ BleClient not available - PWM value stored but not transmitted');
                this.currentPwm = pwm;
                return true;
            }
            
            //console.log(`[MOTOR WRITE] Sending BLE command to device ${this.deviceAddress}`);
            await BleClient.write(
                this.deviceAddress,
                this.SERVICE_UUID,
                this.CHARACTERISTIC_UUID,
                hexStringToDataView(hexValue)
            );
            
            this.currentPwm = pwm;
            //console.log(`[MOTOR WRITE] ✅ Motor PWM successfully set to: ${pwm}`);
            return true;
        } catch (error) {
            console.error('[MOTOR WRITE] ❌ Failed to write PWM value:', error);
            return false;
        }
    }



    /**
     * Get current PWM value
     */
    getCurrentPwm() {
        return this.currentPwm;
    }

    /**
     * Check if motor is connected
     */
    isMotorConnected() {
        return this.isConnected;
    }

    /**
     * Convert decimal to hex string for BLE communication
     */
    decimalToHexString(decimal) {
        const hex = decimal.toString(16).toUpperCase();
        return hex.length === 1 ? '0' + hex : hex;
    }

    /**
     * Get device address
     */
    getDeviceAddress() {
        return this.deviceAddress;
    }

    /**
     * Set device address
     */
    setDeviceAddress(address) {
        this.deviceAddress = address;
    }

    /**
     * Get scan results
     */
    getScanResults() {
        return [...this.scanResults];
    }

    /**
     * Check if currently scanning
     */
    isScanningActive() {
        return this.isScanning;
    }

    /**
     * Set scan result callback
     */
    setScanResultCallback(callback) {
        this.onScanResult = callback;
    }

    /**
     * Set disconnect callback
     */
    setDisconnectCallback(callback) {
        this.onDisconnect = callback;
    }

    /**
     * Set target device name for scanning
     */
    setTargetDeviceName(name) {
        this.TARGET_DEVICE_NAME = name;
    }

    /**
     * Get target device name
     */
    getTargetDeviceName() {
        return this.TARGET_DEVICE_NAME;
    }
}

// Create singleton instance
const motorController = new MotorController();

// Export both the class and instance for flexibility
// Global access
if (typeof window !== 'undefined') {
    window.motorController = motorController;
}

    // ============================================================================
    // core/streaming-processor.js
    // ============================================================================

/**
 * Streaming Audio Processor
 * Voice Activity Detection and audio processing for Capacitor audio chunks
 * Based on working test-real-api.html implementation
 */

class StreamingProcessor {
    constructor() {
        // Get RingBuffer class - use global if available (for bundled version)
        const RingBufferClass = (typeof RingBuffer !== 'undefined') ? RingBuffer :
                                (typeof window !== 'undefined' && window.DULAAN_COMPONENTS && window.DULAAN_COMPONENTS.RingBuffer) ? window.DULAAN_COMPONENTS.RingBuffer :
                                null;
        
        if (!RingBufferClass) {
            throw new Error('RingBuffer class not available. Make sure audio-utils.js is loaded.');
        }

        // Audio state
        this.isActive = false;
        this.isListening = false;
        this.isProcessing = false;
        this.currentPwm = 0;
        
        // Ring buffers for efficient memory usage
        this.vadBuffer = new RingBufferClass(4800); // 300ms for VAD analysis
        this.speechBuffer = new RingBufferClass(16000 * 30); // 30 seconds max speech
        
        // VAD state
        this.consecutiveVoiceFrames = 0;
        this.consecutiveSilenceFrames = 0;
        this.isVoiceActive = false;
        this.voiceStartTime = 0;
        
        // Efficiency tracking
        this.totalChunks = 0;
        this.apiCalls = 0;
        this.lastRMS = 0;
        this.lastZeroCrossings = 0;
        this.lastApiCall = 0; // Initialize to 0 to allow first API call
        
        // VAD thresholds (from working implementation)
        this.VAD_ENERGY_THRESHOLD = 0.008; // Balanced threshold
        this.VAD_ZCR_THRESHOLD = 0.08; // Balanced ZCR threshold
        this.VAD_VOICE_FRAMES = 3; // 3 consecutive frames to confirm voice
        this.VAD_SILENCE_FRAMES = 20; // 20 frames of silence to end speech
        this.MIN_SPEECH_DURATION = 500; // 500ms minimum (in samples)
        this.MAX_SPEECH_DURATION = 320000; // 20 seconds maximum
        
        // Energy history for adaptive thresholds
        this.energyHistory = [];
        
        // Callbacks
        this.onSpeechReady = null;
        this.onVoiceStateChange = null;
        this.onConversationUpdate = null;

        this.lastApiCall = 0; // Initialize to 0 to allow first API call

    }

    /**
     * Process audio chunk from Capacitor (base64 format)
     */
    processAudioChunk(base64Chunk) {
        try {
            //console.log(`[PROCESSOR] Received chunk: ${base64Chunk.length} chars`);
            const pcmData = this.base64ToFloat32Array(base64Chunk);
            //console.log(`[PROCESSOR] Converted to PCM: ${pcmData.length} samples`);
            
            if (pcmData.length === 0) {
                console.warn(`[PROCESSOR] Empty PCM data from base64 chunk`);
                return null;
            }

            this.totalChunks++;

            // Always buffer audio for pre/post-speech context
            this.vadBuffer.push(pcmData);
            
            // Voice Activity Detection
            const isVoiceActive = this.detectVoiceActivity(pcmData);
            
            // Voice activity state machine
            if (isVoiceActive) {
                this.consecutiveVoiceFrames++;
                this.consecutiveSilenceFrames = 0;
                
                // Voice start detection
                if (!this.isVoiceActive && this.consecutiveVoiceFrames >= this.VAD_VOICE_FRAMES) {
                    console.log(`[VAD] 🎤 Voice START detected (${this.consecutiveVoiceFrames} consecutive frames)`);
                    this.handleVoiceStart();
                }
                
                // Buffer speech audio during active speech
                if (this.isVoiceActive) {
                    this.speechBuffer.push(pcmData);
                    this.checkSpeechBufferLimits();
                }
                
            } else {
                this.consecutiveSilenceFrames++;
                this.consecutiveVoiceFrames = 0;
                
                // Voice end detection
                if (this.isVoiceActive && this.consecutiveSilenceFrames >= this.VAD_SILENCE_FRAMES) {
                    this.isVoiceActive = false;
                    this.isListening = false;
                    console.log(`[VAD] 🔇 Voice END detected (${this.consecutiveSilenceFrames} consecutive silence frames)`);
                    this.handleVoiceEnd();
                }
            }

            return {
                isVoiceActive: this.isVoiceActive,
                energy: this.lastRMS,
                zeroCrossings: this.lastZeroCrossings,
                speechBufferSize: this.speechBuffer.count,
                efficiency: {
                    totalChunks: this.totalChunks,
                    apiCalls: this.apiCalls,
                    apiCallRatio: this.apiCalls / this.totalChunks
                }
            };

        } catch (error) {
            console.error("Audio processing failed:", error);
            return null;
        }
    }

    /**
     * Voice Activity Detection (from working implementation)
     */
    detectVoiceActivity(audioData) {
        // Calculate RMS energy
        const rms = this.calculateRMS(audioData);
        this.lastRMS = rms;
        
        // Calculate zero crossing rate
        const zcr = this.calculateZeroCrossingRate(audioData);
        this.lastZeroCrossings = zcr;
        
        // Advanced VAD decision with adaptive thresholds
        const energyActive = rms > this.VAD_ENERGY_THRESHOLD;
        const zcrActive = zcr > this.VAD_ZCR_THRESHOLD && zcr < 0.5; // ZCR too high = noise
        
        // Adaptive threshold based on recent energy history
        this.energyHistory.push(rms);
        if (this.energyHistory.length > 100) this.energyHistory.shift();
        
        const avgEnergy = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
        const adaptiveThreshold = Math.max(this.VAD_ENERGY_THRESHOLD, avgEnergy * 2);
        const adaptiveEnergyActive = rms > adaptiveThreshold;
        
        // Combined decision: energy must be active, ZCR should be reasonable
        const voiceDetected = energyActive && (zcrActive || rms > adaptiveThreshold * 1.5);
        
        // Debug logging (every 50 chunks to avoid spam)
        if (this.totalChunks % 50 === 0) {
            console.log(`[VAD] RMS: ${rms.toFixed(4)} (>${this.VAD_ENERGY_THRESHOLD}=${energyActive}, adaptive>${adaptiveThreshold.toFixed(4)}=${adaptiveEnergyActive}) | ZCR: ${zcr.toFixed(4)} (${this.VAD_ZCR_THRESHOLD}-0.5=${zcrActive}) | Voice: ${voiceDetected}`);
        }
        
        return voiceDetected;
    }

    /**
     * Calculate RMS energy
     */
    calculateRMS(audioData) {
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        return Math.sqrt(sum / audioData.length);
    }

    /**
     * Calculate zero crossing rate
     */
    calculateZeroCrossingRate(audioData) {
        let crossings = 0;
        for (let i = 1; i < audioData.length; i++) {
            if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
                crossings++;
            }
        }
        return crossings / audioData.length;
    }

    /**
     * Handle voice start
     */
    handleVoiceStart() {
        this.isVoiceActive = true;
        this.isListening = true;
        this.voiceStartTime = Date.now();
        
        // Smart buffering: Include pre-speech context for natural start
        this.speechBuffer.reset();
        
        // Add recent VAD buffer content as pre-speech context (last 300ms)
        const preSpeechSamples = Math.min(4800, this.vadBuffer.count); // 300ms at 16kHz
        if (preSpeechSamples > 0) {
            const preSpeechData = this.vadBuffer.readLast(preSpeechSamples);
            this.speechBuffer.push(preSpeechData);
            console.log(`[Voice Start] Added ${preSpeechSamples} pre-speech samples (${(preSpeechSamples/16000*1000).toFixed(0)}ms)`);
        }
        
        console.log("[Voice Start] Beginning speech capture with smart buffering");
        
        if (this.onVoiceStateChange) {
            this.onVoiceStateChange({
                isActive: true,
                timestamp: this.voiceStartTime,
                energy: this.lastRMS,
                preSpeechSamples: preSpeechSamples
            });
        }
    }

    /**
     * Handle voice end
     */
    async handleVoiceEnd() {
        // Add small post-speech buffer for natural ending (100ms)
        const postSpeechDelay = 100;
        
        setTimeout(async () => {
            const speechDuration = Date.now() - this.voiceStartTime;
            
            // Add recent VAD buffer as post-speech context (200ms for natural ending)
            const postSpeechSamples = Math.min(3200, this.vadBuffer.count); // 200ms
            if (postSpeechSamples > 0) {
                const postSpeechData = this.vadBuffer.readLast(postSpeechSamples);
                this.speechBuffer.push(postSpeechData);
                console.log(`[Voice End] Added ${postSpeechSamples} post-speech samples (${(postSpeechSamples/16000*1000).toFixed(0)}ms)`);
            }
            
            console.log(`[Voice End] Speech duration: ${speechDuration}ms, Buffer: ${this.speechBuffer.count} samples`);
            
            // Send speech to API if we have enough audio
            if (this.speechBuffer.count >= this.MIN_SPEECH_DURATION) {
                const timeSinceLastSend = this.lastApiCall === 0 ? 1000 : Date.now() - this.lastApiCall;
                if (timeSinceLastSend > 500) { // Prevent duplicate sends within 500ms
                    await this.sendSpeechToAPI(true); // Mark as final
                } else {
                    console.log("[Voice End] Speech already sent recently, skipping");
                    this.speechBuffer.reset();
                }
            } else {
                console.log("[Voice End] Speech too short, discarding");
                this.speechBuffer.reset();
            }
            
            if (this.onVoiceStateChange) {
                this.onVoiceStateChange({
                    isActive: false,
                    timestamp: Date.now(),
                    duration: speechDuration,
                    audioLength: this.speechBuffer.count,
                    postSpeechSamples: postSpeechSamples
                });
            }
        }, postSpeechDelay);
    }

    /**
     * Check if speech buffer needs to be sent (max duration reached)
     */
    async checkSpeechBufferLimits() {
        const speechDuration = Date.now() - this.voiceStartTime;
        const bufferSize = this.speechBuffer.count;
        const maxDurationMs = this.MAX_SPEECH_DURATION / 16000 * 1000;
        
        // Send if max duration reached or buffer is 85% full
        if (speechDuration >= maxDurationMs || bufferSize >= this.speechBuffer.capacity * 0.85) {
            
            console.log(`[Buffer Limit] Sending speech chunk (${(speechDuration/1000).toFixed(1)}s / ${(maxDurationMs/1000).toFixed(1)}s max, ${bufferSize} samples)`);
            await this.sendSpeechToAPI(false); // Not final
            
            // Keep overlap for continuity
            const overlapSize = Math.min(8000, bufferSize * 0.15); // 500ms overlap
            const overlapData = this.speechBuffer.readLast(overlapSize);
            this.speechBuffer.reset();
            if (overlapData.length > 0) {
                this.speechBuffer.push(overlapData);
                console.log(`[Buffer Limit] Kept ${overlapSize} samples (${(overlapSize/16000*1000).toFixed(0)}ms) for continuity`);
            }
        }
    }

    /**
     * Send complete speech to API
     */
    async sendSpeechToAPI(isFinal = true) {
        try {
            const speechData = this.speechBuffer.readAll();
            if (speechData.length === 0) return null;

            // Convert to Int16Array for API
            const int16Data = new Int16Array(speechData.length);
            for (let i = 0; i < speechData.length; i++) {
                const scaled = Math.max(-1, Math.min(1, speechData[i])) * 32767;
                int16Data[i] = Math.max(-32768, Math.min(32767, scaled));
            }

            const speechPacket = {
                audioData: Array.from(int16Data),
                timestamp: Date.now(),
                duration: Date.now() - this.voiceStartTime,
                isFinal: isFinal,
                sampleRate: 16000,
                channels: 1
            };

            console.log(`[API Call] Sending speech: ${speechData.length} samples (${(speechData.length/16000).toFixed(2)}s)`);
            
            this.apiCalls++;
            this.lastApiCall = Date.now();

            if (this.onSpeechReady) {
                await this.onSpeechReady(speechPacket);
            }

            // Reset buffer after sending if final
            if (isFinal) {
                this.speechBuffer.reset();
            }

            return speechPacket;

        } catch (error) {
            console.error("Failed to send speech to API:", error);
            throw error;
        }
    }

    /**
     * Convert base64 to Float32Array
     */
    base64ToFloat32Array(base64String) {
        try {
            // Remove MIME header if present
            const pureBase64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;

            // Decode Base64
            const binary = atob(pureBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            // Convert to Float32Array with little-endian parsing
            const view = new DataView(bytes.buffer);
            const floats = new Float32Array(bytes.length / 4);
            for (let i = 0; i < floats.length; i++) {
                floats[i] = view.getFloat32(i * 4, true); // true = little-endian
            }
            return floats;
        } catch (error) {
            console.error("Base64 to Float32Array conversion failed:", error);
            return new Float32Array(0);
        }
    }

    /**
     * Set callbacks
     */
    setCallbacks(callbacks) {
        this.onSpeechReady = callbacks.onSpeechReady || null;
        this.onVoiceStateChange = callbacks.onVoiceStateChange || null;
        this.onConversationUpdate = callbacks.onConversationUpdate || null;
    }

    /**
     * Set conversation active state
     */
    setConversationActive(active) {
        if (this.conversationActive !== active) {
            this.conversationActive = active;
            console.log(`[Conversation] ${active ? 'Started' : 'Ended'}`);
            
            if (this.onConversationUpdate) {
                this.onConversationUpdate(active);
            }
        }
    }

    /**
     * Reset processor
     */
    reset() {
        this.speechBuffer.reset();
        this.vadBuffer.reset();
        this.isVoiceActive = false;
        this.isListening = false;
        this.isProcessing = false;
        this.consecutiveVoiceFrames = 0;
        this.consecutiveSilenceFrames = 0;
        
        console.log("[Reset] Processor state cleared");
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isVoiceActive: this.isVoiceActive,
            isListening: this.isListening,
            isProcessing: this.isProcessing,
            speechBufferSize: this.speechBuffer.count,
            energy: this.lastRMS,
            efficiency: {
                totalChunks: this.totalChunks,
                apiCalls: this.apiCalls,
                efficiency: this.totalChunks > 0 ? ((1 - this.apiCalls / this.totalChunks) * 100).toFixed(1) : 0
            }
        };
    }
}



    // ============================================================================
    // services/api-service.js
    // ============================================================================

/**
 * API Service
 * Handles communication with Gemini API for speech processing
 * Based on working test-real-api.html implementation
 */

class ApiService {
    constructor(config = {}) {
        this.baseUrl = 'https://directaudiotopwm-qveg3gkwxa-ew.a.run.app';
        
        // Conversation state
        this.conversationState = {
            history: [],
            currentPwm: 0, // Motor starts at 100
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
     * Process complete speech segment (main API method)
     */
    async processSpeechSegment(speechPacket, options = {}) {
        if (this.conversationState.isProcessing) {
            console.warn("[API] Already processing speech, queuing...");
        }

        try {
            this.conversationState.isProcessing = true;
            this.conversationState.totalApiCalls++;
            const startTime = Date.now();
            
            if (this.onProcessingStateChange) {
                this.onProcessingStateChange(true);
            }

            console.log(`[API Call ${this.conversationState.totalApiCalls}] Processing speech segment: ${speechPacket.audioData.length} samples`);

            // Prepare request body (matches working implementation)
            const requestBody = {
                msgHis: this.conversationState.history,
                audioData: speechPacket.audioData, // Int16Array format
                currentPwm: this.conversationState.currentPwm
            };

            console.log(`[API] Request payload size: ${JSON.stringify(requestBody).length} bytes`);
            console.log(`[API] Request structure: msgHis=${requestBody.msgHis.length}, audioData=${requestBody.audioData.length}, currentPwm=${requestBody.currentPwm}`);

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Processing-Mode': 'standard',
                    'X-Speech-Duration': speechPacket.duration?.toString() || '0'
                },
                body: JSON.stringify(requestBody)
            });

            console.log(`[API] Response Status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            const processingTime = Date.now() - startTime;
            this.conversationState.totalProcessingTime += processingTime;

            console.log(`[API Response] Processed in ${processingTime}ms`);
            console.log(`[API Response] Full response:`, result);
            console.log(`[API Response] Transcription: "${result.transcription || 'N/A'}"`);
            console.log(`[API Response] Assistant Response: "${result.response || 'N/A'}"`);
            console.log(`[API Response] PWM: ${result.previousPwm || this.conversationState.currentPwm} → ${result.newPwmValue || this.conversationState.currentPwm}`);
            console.log(`[API Response] Intent detected: ${result.intentDetected || false}`);
            console.log(`[API Response] Confidence: ${result.confidence ? (result.confidence * 100).toFixed(1) + '%' : 'N/A'}`);
            console.log(`[API Response] Detected language: ${result.detectedLanguage || 'N/A'}`);

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
                    apiCallNumber: this.conversationState.totalApiCalls,
                    timestamp: Date.now()
                });
            }
            
            throw error;
            
        } finally {
            this.conversationState.isProcessing = false;
            
            if (this.onProcessingStateChange) {
                this.onProcessingStateChange(false);
            }
        }
    }

    /**
     * Update conversation state with API response
     */
    async updateConversationState(result) {
        try {
            // Update PWM if provided
            if (result.newPwmValue !== undefined) {
                this.conversationState.currentPwm = result.newPwmValue;
                console.log(`[Conversation] PWM updated: ${result.previousPwm || 'unknown'} → ${result.newPwmValue}`);
            }

            // Add to conversation history
            if (result.transcription || result.response) {
                const historyEntry = {
                    user: result.transcription || 'No transcription',
                    assistant: result.response || 'No response',
                    timestamp: new Date().toISOString(),
                    pwm: result.newPwmValue || this.conversationState.currentPwm,
                    intentDetected: result.intentDetected || false,
                    confidence: result.confidence || 0,
                    detectedLanguage: result.detectedLanguage || 'unknown'
                };

                this.conversationState.history.push(historyEntry);

                // Keep only last 10 messages for context
                if (this.conversationState.history.length > 10) {
                    this.conversationState.history.splice(0, this.conversationState.history.length - 10);
                }

                console.log(`[Conversation] History updated: ${this.conversationState.history.length} messages`);
            }

        } catch (error) {
            console.error('Failed to update conversation state:', error);
        }
    }

    /**
     * Test API connectivity
     */
    async testConnectivity() {
        try {
            console.log('[API] Testing connectivity...');
            
            // Simple test with minimal audio data
            const testAudio = new Array(1600).fill(0); // 100ms of silence
            
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    msgHis: [],
                    audioData: testAudio,
                    currentPwm: 0
                })
            });

            if (response.ok) {
                console.log('[API] ✅ Connectivity test passed');
                return { success: true, status: response.status };
            } else {
                console.log(`[API] ❌ Connectivity test failed: ${response.status}`);
                return { success: false, status: response.status, error: response.statusText };
            }

        } catch (error) {
            console.error('[API] ❌ Connectivity test error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current conversation state
     */
    getState() {
        return {
            ...this.conversationState,
            averageResponseTime: this.conversationState.totalApiCalls > 0 
                ? this.conversationState.totalProcessingTime / this.conversationState.totalApiCalls 
                : 0
        };
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return [...this.conversationState.history];
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationState.history = [];
        console.log('[Conversation] History cleared');
    }

    /**
     * Set current PWM value
     */
    setCurrentPwm(pwm) {
        this.conversationState.currentPwm = Math.max(0, Math.min(255, pwm));
        console.log(`[Conversation] PWM set to: ${this.conversationState.currentPwm}`);
    }

    /**
     * Get current PWM value
     */
    getCurrentPwm() {
        return this.conversationState.currentPwm;
    }

    /**
     * Set callbacks for events
     */
    setCallbacks(callbacks) {
        this.onResponse = callbacks.onResponse || null;
        this.onError = callbacks.onError || null;
        this.onProcessingStateChange = callbacks.onProcessingStateChange || null;
    }

    /**
     * Reset API service state
     */
    reset() {
        this.conversationState.history = [];
        this.conversationState.currentPwm = 0;
        this.conversationState.isProcessing = false;
        this.conversationState.totalApiCalls = 0;
        this.conversationState.totalProcessingTime = 0;
        
        console.log("[API Service] State reset");
    }

    /**
     * Get API statistics
     */
    getStats() {
        return {
            totalApiCalls: this.conversationState.totalApiCalls,
            totalProcessingTime: this.conversationState.totalProcessingTime,
            averageResponseTime: this.conversationState.totalApiCalls > 0 
                ? (this.conversationState.totalProcessingTime / this.conversationState.totalApiCalls).toFixed(0) + 'ms'
                : '0ms',
            conversationLength: this.conversationState.history.length,
            currentPwm: this.conversationState.currentPwm,
            isProcessing: this.conversationState.isProcessing
        };
    }
}



    // ============================================================================
    // services/consent-service.js
    // ============================================================================

/**
 * Consent Service - User consent and privacy management
 * Handles consent collection, storage, and device fingerprinting
 */

class ConsentService {
    constructor() {
        this.apiUrl = 'https://storeuserconsent-qveg3gkwxa-ew.a.run.app';
        this.storageKeys = {
            deviceId: 'dulaan_device_id',
            consent: 'dulaan_consent_given',
            timestamp: 'dulaan_consent_timestamp'
        };
    }

    /**
     * Generate device fingerprint using ThumbmarkJS
     */
    async generateDeviceId() {
        try {
            // Check if ThumbmarkJS is available
            if (typeof ThumbmarkJS === 'undefined') {
                console.warn('ThumbmarkJS not available, falling back to basic fingerprint');
                return this.generateBasicFingerprint();
            }

            // Use ThumbmarkJS for advanced fingerprinting
            const tm = new ThumbmarkJS.Thumbmark({
                exclude: ['permissions'], // Exclude permissions for faster generation
                timeout: 3000,
                logging: false
            });
            
            const result = await tm.get();
            return result.thumbmark;
        } catch (error) {
            console.error('Error generating device ID:', error);
            // Ultimate fallback
            return 'fallback_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        }
    }

    /**
     * Generate basic fingerprint as fallback
     */
    generateBasicFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        const canvasFingerprint = canvas.toDataURL();
        
        const basicFingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            canvas: canvasFingerprint.slice(-50) // Last 50 chars
        };
        
        // Create a simple hash
        const fingerprintString = JSON.stringify(basicFingerprint);
        let hash = 0;
        for (let i = 0; i < fingerprintString.length; i++) {
            const char = fingerprintString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Get or create cached device ID
     */
    async getDeviceId() {
        try {
            // Check if we have a cached device ID
            let deviceId = localStorage.getItem(this.storageKeys.deviceId);
            
            if (!deviceId) {
                // Generate new device ID
                deviceId = await this.generateDeviceId();
                localStorage.setItem(this.storageKeys.deviceId, deviceId);
                console.log('Generated new device ID:', deviceId);
            }
            
            return deviceId;
        } catch (error) {
            console.error('Error getting device ID:', error);
            return 'error_' + Date.now();
        }
    }

    /**
     * Collect and store user consent
     */
    async collectUserConsent(consentData) {
        try {
            const deviceId = await this.getDeviceId();
            
            const consentPayload = {
                deviceId: deviceId,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                ...consentData
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(consentPayload)
            });

            if (!response.ok) {
                throw new Error(`Consent storage failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('User consent stored successfully:', result);
            
            // Cache consent locally
            this.cacheConsent(consentData);
            
            return result;
        } catch (error) {
            console.error('Error collecting user consent:', error);
            throw error;
        }
    }

    /**
     * Cache consent data locally
     */
    cacheConsent(consentData) {
        try {
            localStorage.setItem(this.storageKeys.consent, JSON.stringify(consentData));
            localStorage.setItem(this.storageKeys.timestamp, new Date().toISOString());
        } catch (error) {
            console.error('Error caching consent:', error);
        }
    }

    /**
     * Get cached consent data
     */
    getCachedConsent() {
        try {
            const consentData = localStorage.getItem(this.storageKeys.consent);
            const timestamp = localStorage.getItem(this.storageKeys.timestamp);
            
            if (consentData && timestamp) {
                return {
                    consent: JSON.parse(consentData),
                    timestamp: timestamp,
                    deviceId: localStorage.getItem(this.storageKeys.deviceId)
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error getting cached consent:', error);
            return null;
        }
    }

    /**
     * Check if user has given consent
     */
    hasConsent(consentType = 'dataProcessing') {
        const cached = this.getCachedConsent();
        return cached && cached.consent && cached.consent[consentType] === true;
    }

    /**
     * Revoke consent
     */
    async revokeConsent() {
        try {
            const revokeData = {
                dataProcessing: false,
                analytics: false,
                remoteControl: false,
                purpose: 'revoked',
                consentGiven: false,
                revoked: true
            };

            const result = await this.collectUserConsent(revokeData);
            
            // Clear local cache
            this.clearConsentCache();
            
            return result;
        } catch (error) {
            console.error('Error revoking consent:', error);
            throw error;
        }
    }

    /**
     * Clear consent cache
     */
    clearConsentCache() {
        try {
            localStorage.removeItem(this.storageKeys.consent);
            localStorage.removeItem(this.storageKeys.timestamp);
        } catch (error) {
            console.error('Error clearing consent cache:', error);
        }
    }

    /**
     * Clear device ID (will regenerate on next use)
     */
    clearDeviceId() {
        try {
            localStorage.removeItem(this.storageKeys.deviceId);
        } catch (error) {
            console.error('Error clearing device ID:', error);
        }
    }

    /**
     * Update API endpoint
     */
    updateApiUrl(newUrl) {
        this.apiUrl = newUrl;
    }

    /**
     * Get consent summary
     */
    getConsentSummary() {
        const cached = this.getCachedConsent();
        
        return {
            hasConsent: !!cached,
            deviceId: cached?.deviceId || null,
            timestamp: cached?.timestamp || null,
            consent: cached?.consent || {},
            isExpired: cached ? this.isConsentExpired(cached.timestamp) : false
        };
    }

    /**
     * Check if consent is expired (optional feature)
     */
    isConsentExpired(timestamp, expiryDays = 365) {
        try {
            const consentDate = new Date(timestamp);
            const expiryDate = new Date(consentDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
            return new Date() > expiryDate;
        } catch (error) {
            return true; // Consider expired if we can't parse
        }
    }
}

// Create singleton instance
const consentService = new ConsentService();

// Export both class and instance
// Global access
if (typeof window !== 'undefined') {
    window.consentService = consentService;
}

    // ============================================================================
    // services/remote-service.js
    // ============================================================================

/**
 * Remote Service - PeerJS remote control system
 * Handles peer-to-peer communication for remote motor control
 */

class RemoteService {
    constructor() {
        this.peer = null;
        this.connections = new Map();
        this.remoteUsers = new Set();
        
        // State
        this.isHost = false;
        this.isRemote = false;
        this.isControlledByRemote = false;
        this.hostId = null;
        this.lastRemoteCommand = null;
        
        // PeerJS configuration
        this.peerConfig = {
            host: '34.38.33.102',
            port: 9000,
            path: '/',
            secure: false,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        };
        
        // Event callbacks
        this.onHostReady = null;
        this.onRemoteConnected = null;
        this.onRemoteDisconnected = null;
        this.onRemoteCommand = null;
        this.onConnectionStatusChange = null;
    }

    /**
     * Initialize as host (device owner)
     */
    initializeAsHost() {
        if (this.peer) {
            this.peer.destroy();
        }

        // Generate unique 6-character host ID
        const hostId = this.generateShortId();
        
        this.peer = new Peer(hostId, this.peerConfig);

        this.peer.on('open', (id) => {
            this.isHost = true;
            this.hostId = id;
            console.log('Host initialized with ID:', id);
            
            if (this.onHostReady) {
                this.onHostReady(id);
            }
        });

        this.peer.on('connection', (conn) => {
            console.log('Remote user connected:', conn.peer);
            this.connections.set(conn.peer, conn);
            this.remoteUsers.add(conn.peer);
            this.isControlledByRemote = true;

            conn.on('data', (data) => {
                this.handleRemoteCommand(data, conn.peer);
            });

            conn.on('close', () => {
                console.log('Remote user disconnected:', conn.peer);
                this.connections.delete(conn.peer);
                this.remoteUsers.delete(conn.peer);
                
                if (this.remoteUsers.size === 0) {
                    this.isControlledByRemote = false;
                }
                
                if (this.onRemoteDisconnected) {
                    this.onRemoteDisconnected(conn.peer);
                }
            });

            if (this.onRemoteConnected) {
                this.onRemoteConnected(conn.peer);
            }
        });

        this.peer.on('error', (error) => {
            console.error('Host peer error:', error);
        });

        return hostId;
    }

    /**
     * Connect as remote user to control a host
     */
    connectAsRemote(hostId) {
        this.peer = new Peer(this.peerConfig);

        this.peer.on('open', (id) => {
            console.log(`Remote peer initialized with ID: ${id}`);
            
            const conn = this.peer.connect(hostId);
            
            conn.on('open', () => {
                this.isRemote = true;
                this.hostId = hostId;
                this.connections.set(hostId, conn);
                console.log(`Connected to host: ${hostId}`);
                
                if (this.onConnectionStatusChange) {
                    this.onConnectionStatusChange(true);
                }
            });

            conn.on('error', (error) => {
                console.log(`Failed to connect to host: ${error.message}`);
                
                if (this.onConnectionStatusChange) {
                    this.onConnectionStatusChange(false, error.message);
                }
            });

            conn.on('close', () => {
                console.log('Disconnected from host');
                this.isRemote = false;
                this.hostId = null;
                this.connections.delete(hostId);
                
                if (this.onConnectionStatusChange) {
                    this.onConnectionStatusChange(false);
                }
            });
        });

        this.peer.on('error', (error) => {
            console.error('Remote peer error:', error);
            
            if (this.onConnectionStatusChange) {
                this.onConnectionStatusChange(false, error.message);
            }
        });
    }

    /**
     * Send control command to host (when acting as remote)
     */
    sendControlCommand(mode, value, additionalData = {}) {
        if (!this.isRemote || !this.hostId) {
            console.warn('Not connected as remote user');
            return false;
        }

        const command = {
            type: 'control_command',
            mode: mode,
            value: value,
            timestamp: Date.now(),
            ...additionalData
        };

        const conn = this.connections.get(this.hostId);
        if (conn) {
            conn.send(command);
            console.log(`Sent control command: ${mode} = ${value}`);
            return true;
        }

        return false;
    }

    /**
     * Handle incoming remote command (when acting as host)
     */
    handleRemoteCommand(data, fromUserId) {
        if (!this.isHost) {
            return;
        }

        console.log(`Received remote command from ${fromUserId}: ${data.mode} = ${data.value}`);
        this.lastRemoteCommand = {
            ...data,
            fromUser: fromUserId,
            receivedAt: Date.now()
        };

        if (this.onRemoteCommand) {
            this.onRemoteCommand(data, fromUserId);
        }
    }

    /**
     * Disconnect from remote control
     */
    disconnect() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }

        this.isHost = false;
        this.isRemote = false;
        this.hostId = null;
        this.connections.clear();
        this.remoteUsers.clear();
        this.isControlledByRemote = false;
        this.lastRemoteCommand = null;

        console.log('Disconnected from remote control');
        
        if (this.onConnectionStatusChange) {
            this.onConnectionStatusChange(false);
        }
    }

    /**
     * Get current connection status
     */
    getStatus() {
        return {
            isHost: this.isHost,
            isRemote: this.isRemote,
            isControlledByRemote: this.isControlledByRemote,
            hostId: this.hostId,
            connectedUsers: Array.from(this.remoteUsers),
            lastRemoteCommand: this.lastRemoteCommand
        };
    }

    /**
     * Get list of connected remote users (when host)
     */
    getConnectedUsers() {
        return Array.from(this.remoteUsers);
    }

    /**
     * Check if currently controlled by remote
     */
    isUnderRemoteControl() {
        return this.isControlledByRemote;
    }

    /**
     * Set event callbacks
     */
    setEventCallbacks(callbacks) {
        this.onHostReady = callbacks.onHostReady || null;
        this.onRemoteConnected = callbacks.onRemoteConnected || null;
        this.onRemoteDisconnected = callbacks.onRemoteDisconnected || null;
        this.onRemoteCommand = callbacks.onRemoteCommand || null;
        this.onConnectionStatusChange = callbacks.onConnectionStatusChange || null;
    }

    /**
     * Update PeerJS configuration
     */
    updatePeerConfig(newConfig) {
        this.peerConfig = { ...this.peerConfig, ...newConfig };
    }

    /**
     * Send heartbeat to maintain connection
     */
    sendHeartbeat() {
        if (this.isRemote && this.hostId) {
            this.sendControlCommand('heartbeat', Date.now());
        }
    }

    /**
     * Start heartbeat interval
     */
    startHeartbeat(intervalMs = 30000) {
        this.stopHeartbeat(); // Clear any existing interval
        
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, intervalMs);
    }

    /**
     * Stop heartbeat interval
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Generate a short 6-character unique ID for peer connections
     * @returns {string} 6-character alphanumeric ID
     */
    generateShortId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Validate if an ID is in the correct format
     * @param {string} id - ID to validate
     * @returns {boolean} True if valid
     */
    isValidId(id) {
        if (!id || typeof id !== 'string') return false;
        if (id.length !== 6) return false;
        return /^[A-Z0-9]+$/.test(id);
    }
}

// Create singleton instance
const remoteService = new RemoteService();

// Export both class and instance
// Global access
if (typeof window !== 'undefined') {
    window.remoteService = remoteService;
    

}

    // ============================================================================
    // modes/ai-voice-control.js
    // ============================================================================

/**
 * AI Voice Control Mode
 * Natural conversation with motor control via voice commands
 * Based on working test-real-api.html implementation
 */

class AIVoiceControl {
    constructor(config = {}) {
        this.config = {
            // Response timeout
            responseTimeout: 3000,
            
            // Motor control optimization
            pwmUpdateThreshold: 5, // Only update if PWM changes by 5+
            motorResponseDelay: 100, // 100ms delay for motor commands
            
            ...config
        };

        // Core components (use shared instances if provided, fallback to creating new ones)
        this.processor = config.processor || 
                        (typeof StreamingProcessor !== 'undefined' ? new StreamingProcessor() : null);
        this.apiService = config.apiService || 
                         (typeof ApiService !== 'undefined' ? new ApiService() : null);
        
        if (!this.processor) {
            throw new Error('StreamingProcessor not available');
        }
        if (!this.apiService) {
            throw new Error('ApiService not available');
        }
        
        this.motorController = config.motorController || null;
        
        // State management
        this.state = {
            isActive: false,
            isListening: false,
            isProcessing: false,
            conversationActive: false,
            currentPwm: 0, // Motor starts stopped
            lastInteractionTime: 0,
            lastResponse: null,
            lastError: null,
            totalApiCalls: 0,
            totalProcessingTime: 0
        };
        
        // Setup callbacks
        this.setupCallbacks();
    }

    /**
     * Setup callbacks for processor and API service
     */
    setupCallbacks() {
        // Processor callbacks
        this.processor.setCallbacks({
            onSpeechReady: (speechPacket) => {
                this.handleSpeechReady(speechPacket);
            },
            onVoiceStateChange: (voiceState) => {
                this.handleVoiceStateChange(voiceState);
            },
            onConversationUpdate: (active) => {
                this.handleConversationUpdate(active);
            }
        });

        // API service callbacks
        this.apiService.setCallbacks({
            onResponse: (response) => {
                this.handleApiResponse(response);
            },
            onError: (error) => {
                this.handleApiError(error);
            },
            onProcessingStateChange: (processing) => {
                this.state.isProcessing = processing;
            }
        });
    }

    /**
     * Start AI voice control
     */
    async start() {
        try {
            console.log("[AI Voice] Starting natural conversation mode");
            
            this.state.isActive = true;
            this.state.lastInteractionTime = Date.now();
            this.state.totalApiCalls = 0;
            
            // Initialize motor to stopped state (PWM 0)
            if (this.motorController) {
                await this.updateMotorPWM(0);
                console.log("[AI Voice] Motor initialized to stopped state (PWM 0)");
            }
            
            // Start audio processing
            await this.startAudioProcessing();
            
            // Activate conversation mode
            this.handleConversationUpdate(true);
            
            console.log("🎤 Natural conversation started - speak naturally!");
            
            return true;
            
        } catch (error) {
            console.error("Failed to start AI voice control:", error);
            return false;
        }
    }

    /**
     * Stop voice control
     */
    async stop() {
        console.log("[AI Voice] Stopping conversation mode");
        
        this.state.isActive = false;
        this.state.isListening = false;
        this.state.conversationActive = false;
        
        // Stop audio processing
        await this.stopAudioProcessing();
        await this.sdk.motor.write(0);
        
        console.log("🔇 Voice control stopped");
    }

    /**
     * Start audio processing using Capacitor VoiceRecorder
     */
    async startAudioProcessing() {
        try {
            console.log("[Audio] Starting audio processing");
            
            // Check if Capacitor is available
            if (!window.Capacitor?.Plugins?.VoiceRecorder) {
                throw new Error('Capacitor VoiceRecorder plugin not available');
            }

            // Request permission
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

            // Start audio streaming
            await window.Capacitor.Plugins.VoiceRecorder.startStreaming();
            
            console.log("[Audio] Capacitor audio streaming started");
            return true;
            
        } catch (error) {
            console.error("[Audio] Failed to start audio processing:", error);
            throw error;
        }
    }

    /**
     * Stop audio processing
     */
    async stopAudioProcessing() {
        try {
            console.log("[Audio] Stopping audio processing");
            
            // Check if Capacitor is available
            if (window.Capacitor?.Plugins?.VoiceRecorder) {
                // Stop streaming
                await window.Capacitor.Plugins.VoiceRecorder.stopStreaming();
                
                // Remove listeners
                await window.Capacitor.Plugins.VoiceRecorder.removeAllListeners();
            }
            
            console.log("[Audio] Audio processing stopped");
            
        } catch (error) {
            console.error("[Audio] Error stopping audio processing:", error);
        }
    }

    /**
     * Process incoming audio chunk from Capacitor VoiceRecorder
     */
    processAudioChunk(base64Chunk) {
        // Only check if active (removed isListening check to fix chicken-and-egg problem)
        if (!this.state.isActive) {
            return;
        }

        try {
            // Process audio chunk through processor
            //console.log(`[AUDIO CHUNK] Processing chunk: ${base64Chunk.length} chars`);
            const result = this.processor.processAudioChunk(base64Chunk);
            
            if (result) {
                // Update state with voice activity
                this.state.lastInteractionTime = Date.now();
                
                // Log voice activity for debugging
                //console.log(`[VAD] Voice: ${result.isVoiceActive}, Energy: ${result.energy?.toFixed(4)}, ZCR: ${result.zeroCrossings?.toFixed(4)}`);
                
                // Update listening state based on voice activity
                if (result.isVoiceActive !== this.state.isListening) {
                    this.state.isListening = result.isVoiceActive;
                    console.log(`[VAD] Listening state changed: ${this.state.isListening}`);
                }
                
            } else {
                console.log(`[AUDIO CHUNK] No result from processor`);
            }
            
        } catch (error) {
            console.error("[Audio] Error processing audio chunk:", error);
        }
    }

    /**
     * Handle speech ready for API processing
     */
    async handleSpeechReady(speechPacket) {
        try {
            console.log(`[Speech] Processing speech packet: ${speechPacket.audioData.length} samples`);
            
            this.state.isProcessing = true;
            this.state.totalApiCalls++;
            
            const startTime = Date.now();
            
            console.log(`[Speech Processing] Processing command`);
            
            const response = await this.apiService.processSpeechSegment(speechPacket);
            
            const processingTime = Date.now() - startTime;
            this.state.totalProcessingTime += processingTime;
            
            // ===== DETAILED API RESPONSE LOGGING =====
            console.log(`[API RESPONSE] Full response:`, response);
            console.log(`[API RESPONSE] Transcription: "${response?.transcription || 'N/A'}"`);
            console.log(`[API RESPONSE] Assistant Response: "${response?.response || 'N/A'}"`);
            console.log(`[API RESPONSE] New PWM Value: ${response?.newPwmValue || 'N/A'}`);
            console.log(`[API RESPONSE] Processing Time: ${processingTime}ms`);
            
            if (response && response.newPwmValue !== undefined) {
                // Update motor with new PWM value
                console.log(`[MOTOR] Sending PWM ${response.newPwmValue} to motor controller`);
                const motorSuccess = await this.updateMotorPWM(response.newPwmValue);
                console.log(`[MOTOR] Motor update ${motorSuccess ? 'successful' : 'failed'}`);
                
                // Store the last response
                this.state.lastResponse = response;
                
                console.log(`[PROCESSING COMPLETE] Speech processed successfully`);
            } else {
                console.warn(`[API WARNING] No PWM value in response or response is null`);
            }
            
            // ===== RESET STATE FOR NEXT INTERACTION =====
            this.state.lastInteractionTime = Date.now();
            console.log(`[CONVERSATION] Updated interaction time, ready for next command`);
            
            // CRITICAL FIX: Reset processor state to ensure it can detect next speech
            console.log(`[RESET] Resetting processor state for next interaction`);
            this.processor.isVoiceActive = false;
            this.processor.isListening = false;
            this.processor.consecutiveVoiceFrames = 0;
            this.processor.consecutiveSilenceFrames = 0;
            
            // Ensure conversation stays active for next command
            this.handleConversationUpdate(true);
            
        } catch (error) {
            console.error("Speech processing failed:", error);
            this.handleApiError(error);
        } finally {
            this.state.isProcessing = false;
        }
    }

    /**
     * Handle voice state changes
     */
    handleVoiceStateChange(voiceState) {
        this.state.isListening = voiceState.isActive;
        this.state.lastInteractionTime = Date.now();
        
        if (voiceState.isActive) {
            console.log(`[VOICE STATE] Voice started - listening for speech`);
        } else if (voiceState.duration) {
            const durationMs = voiceState.duration;
            console.log(`[VOICE STATE] Voice ended - speech captured (${(durationMs/1000).toFixed(1)}s)`);
            
            // After speech ends, ensure we're ready for next interaction
            console.log(`[VOICE STATE] Preparing for next voice interaction`);
        }
    }

    /**
     * Handle conversation state updates
     */
    handleConversationUpdate(active) {
        console.log(`[CONVERSATION] State change: ${this.state.conversationActive} → ${active}`);
        this.state.conversationActive = active;
        
        if (active) {
            console.log(`[CONVERSATION] ✅ Activating conversation - ready for next command`);
            this.processor.setConversationActive(true);
            
            // CRITICAL FIX: Reset all processing flags and ensure clean state
            this.state.isProcessing = false;
            this.state.isListening = false;
            
            // Ensure processor is in clean state for next interaction
            if (this.processor) {
                this.processor.isVoiceActive = false;
                this.processor.isListening = false;
                console.log(`[CONVERSATION] Processor state reset for next interaction`);
            }
            
        } else {
            console.log(`[CONVERSATION] ⏸️ Pausing conversation`);
        }
    }

    /**
     * Handle API responses
     */
    handleApiResponse(response) {
        this.state.lastResponse = response;
        this.state.totalApiCalls++;
        
        // Update PWM if changed significantly
        if (response.newPwmValue !== undefined) {
            const pwmDiff = Math.abs(response.newPwmValue - this.state.currentPwm);
            if (pwmDiff >= this.config.pwmUpdateThreshold) {
                this.updateMotorPWM(response.newPwmValue);
            }
        }
        
        // Log response
        if (response.response) {
            console.log(`🤖 ${response.response}`);
        }
    }

    /**
     * Handle API errors
     */
    handleApiError(error) {
        this.state.lastError = error;
        console.error("API Error:", error);
    }

    /**
     * Update motor PWM with optimization
     */
    async updateMotorPWM(newPwm) {
        console.log(`[MOTOR UPDATE] Requested PWM: ${newPwm}, Current PWM: ${this.state.currentPwm}`);
        
        // Only update if change is significant (reduces motor wear)
        const pwmDifference = Math.abs(newPwm - this.state.currentPwm);
        console.log(`[MOTOR UPDATE] PWM difference: ${pwmDifference}, Threshold: ${this.config.pwmUpdateThreshold}`);
        
        if (pwmDifference >= this.config.pwmUpdateThreshold) {
            const oldPwm = this.state.currentPwm;
            this.state.currentPwm = newPwm;
            
            console.log(`[MOTOR UPDATE] PWM changed from ${oldPwm} to ${newPwm}`);
            
            // Send to motor controller if available
            if (this.motorController && this.motorController.isConnected) {
                console.log(`[MOTOR UPDATE] Motor controller connected, sending PWM command...`);
                try {
                    await this.motorController.write(newPwm);
                    console.log(`[MOTOR UPDATE] ✅ PWM ${newPwm} sent to motor successfully`);
                    
                    // Trigger callbacks
                    if (this.config.onPwmUpdate) {
                        this.config.onPwmUpdate(newPwm);
                    }
                    
                    return true;
                } catch (error) {
                    console.error(`[MOTOR UPDATE] ❌ Failed to send PWM to motor:`, error);
                    return false;
                }
            } else {
                console.warn(`[MOTOR UPDATE] ⚠️ Motor controller not available (connected: ${this.motorController?.isConnected}, exists: ${!!this.motorController})`);
                return false;
            }
        } else {
            console.log(`[MOTOR UPDATE] ⏭️ PWM change too small (${pwmDifference}), skipping update`);
            return true; // Not an error, just skipped
        }
    }



    /**
     * Get efficiency statistics
     */
    getEfficiencyStats() {
        const processorStats = this.processor.getState();
        const apiStats = this.apiService.getStats();
        
        return {
            processor: processorStats,
            api: apiStats,
            overall: {
                totalInteractions: this.state.totalApiCalls,
                averageResponseTime: this.state.totalApiCalls > 0 
                    ? (this.state.totalProcessingTime / this.state.totalApiCalls).toFixed(0) + 'ms'
                    : '0ms'
            }
        };
    }

    /**
     * Get current state
     */
    getState() {
        return {
            ...this.state,
            processor: this.processor.getState(),
            api: this.apiService.getState(),
            efficiency: this.getEfficiencyStats()
        };
    }

    /**
     * Reset state
     */
    reset() {
        this.state.isActive = false;
        this.state.isListening = false;
        this.state.isProcessing = false;
        this.state.conversationActive = false;
        this.state.currentPwm = 0;
        this.state.lastInteractionTime = 0;
        this.state.lastResponse = null;
        this.state.lastError = null;
        this.state.totalApiCalls = 0;
        this.state.totalProcessingTime = 0;
        
        this.processor.reset();
        this.apiService.reset();
        
        console.log("[AI Voice] State reset");
    }
}



    // ============================================================================
    // modes/ambient-control.js
    // ============================================================================

/**
 * Ambient Control Mode
 * Handles ambient sound-based motor control
 */

class AmbientControl {
    constructor(sdk) {
        this.sdk = sdk;
        this.isActive = false;
        this.pwmInterval = null;
        
        // Audio processing state
        this.maxEnergy = 0.075; // Default max energy threshold
        this.audioBuffer = null;
        this.lastRMS = 0;
        this.lastPwmValue = 0;
        
        // Initialize audio buffer (1 second at 16kHz)
        this.initializeAudioBuffer();
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
            this.startPwmWriting();
            
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
            
            this.stopPwmWriting();
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
            // Process audio chunk locally (no sdk.audio dependency)
            this.processAudioChunk(base64Chunk);
        } catch (error) {
            console.error('Ambient processing error:', error);
        }
    }

    startPwmWriting() {
        // Write PWM every 100ms based on accumulated audio data (matches stream.js)
        this.pwmInterval = setInterval(async () => {
            try {
                const pwmValue = this.calculateAmbientPWM();
                
                if (pwmValue > 0) {
                    await this.sdk.motor.write(pwmValue);
                    this.lastPwmValue = pwmValue;
                    
                    // Trigger event for UI updates
                    this.onAmbientUpdate({
                        energy: this.lastRMS,
                        pwmValue: pwmValue
                    });
                }
            } catch (error) {
                console.error('PWM writing error:', error);
            }
        }, 100); // 100ms interval matches stream.js
    }

    stopPwmWriting() {
        if (this.pwmInterval) {
            clearInterval(this.pwmInterval);
            this.pwmInterval = null;
        }
    }

    onAmbientUpdate(result) {
        // Override this method to handle ambient updates in UI
        if (typeof window !== 'undefined' && window.onAmbientUpdate) {
            window.onAmbientUpdate(result);
        }
    }

    setMaxEnergy(energy) {
        this.maxEnergy = energy;
    }

    getMaxEnergy() {
        return this.maxEnergy;
    }

    isRunning() {
        return this.isActive;
    }

    // ===== MISSING FUNCTIONS IMPLEMENTATION =====

    /**
     * Initialize audio buffer for ambient processing
     */
    initializeAudioBuffer() {
        try {
            // Get RingBuffer class - use global if available (for bundled version)
            const RingBufferClass = (typeof RingBuffer !== 'undefined') ? RingBuffer :
                                    (typeof window !== 'undefined' && window.DULAAN_COMPONENTS && window.DULAAN_COMPONENTS.RingBuffer) ? window.DULAAN_COMPONENTS.RingBuffer :
                                    null;
            
            if (RingBufferClass) {
                // Create buffer for 1 second of audio at 16kHz
                this.audioBuffer = new RingBufferClass(16000);
            } else {
                console.warn('RingBuffer not available for ambient control');
            }
        } catch (error) {
            console.error('Failed to initialize audio buffer:', error);
        }
    }

    /**
     * Process audio chunk for ambient control
     */
    processAudioChunk(base64Chunk) {
        try {
            // Convert base64 to audio data
            const audioData = this.base64ToFloat32Array(base64Chunk);
            
            if (audioData && audioData.length > 0) {
                // Add to buffer
                if (this.audioBuffer) {
                    this.audioBuffer.push(audioData);
                }
                
                // Calculate RMS energy
                this.lastRMS = this.calculateRMS(audioData);
            }
        } catch (error) {
            console.error('Error processing audio chunk:', error);
        }
    }

    /**
     * Calculate ambient PWM value based on current audio energy
     */
    calculateAmbientPWM() {
        try {
            if (this.lastRMS > 0) {
                // Use energyToPWM function from audio-utils
                return this.energyToPWM(this.lastRMS, this.maxEnergy, 255);
            }
            return 0;
        } catch (error) {
            console.error('Error calculating ambient PWM:', error);
            return 0;
        }
    }

    /**
     * Get current audio state
     */
    getAudioState() {
        return {
            lastRMS: this.lastRMS,
            maxEnergy: this.maxEnergy,
            bufferSize: this.audioBuffer ? this.audioBuffer.count : 0,
            lastPwmValue: this.lastPwmValue,
            isActive: this.isActive
        };
    }

    // ===== AUDIO UTILITY FUNCTIONS =====

    /**
     * Convert base64 to Float32Array (local implementation)
     */
    base64ToFloat32Array(base64) {
        try {
            // Use global function if available
            if (typeof base64ToFloat32Array !== 'undefined') {
                return base64ToFloat32Array(base64);
            }
            
            // Fallback implementation
            const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
            const binary = atob(pureBase64);
            const bytes = new Uint8Array(binary.length);
            
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            const view = new DataView(bytes.buffer);
            const floats = new Float32Array(bytes.length / 4);
            
            for (let i = 0; i < floats.length; i++) {
                floats[i] = view.getFloat32(i * 4, true);
            }
            
            return floats;
        } catch (e) {
            console.error("Base64 to Float32Array conversion failed:", e);
            return new Float32Array(0);
        }
    }

    /**
     * Calculate RMS energy (local implementation)
     */
    calculateRMS(audioData) {
        try {
            // Use global function if available
            if (typeof calculateRMS !== 'undefined') {
                return calculateRMS(audioData);
            }
            
            // Fallback implementation
            if (!audioData || audioData.length === 0) return 0;
            
            let sum = 0;
            for (let i = 0; i < audioData.length; i++) {
                sum += audioData[i] * audioData[i];
            }
            
            return Math.sqrt(sum / audioData.length);
        } catch (error) {
            console.error('Error calculating RMS:', error);
            return 0;
        }
    }

    /**
     * Convert energy to PWM value (local implementation)
     */
    energyToPWM(energy, maxEnergy = 0.075, maxPWM = 255) {
        try {
            // Use global function if available
            if (typeof energyToPWM !== 'undefined') {
                return energyToPWM(energy, maxEnergy, maxPWM);
            }
            
            // Fallback implementation
            if (energy <= 0) return 0;
            
            const normalizedEnergy = Math.min(energy / maxEnergy, 1.0);
            const pwmValue = Math.round(normalizedEnergy * maxPWM);
            
            return Math.max(0, Math.min(maxPWM, pwmValue));
        } catch (error) {
            console.error('Error converting energy to PWM:', error);
            return 0;
        }
    }
}



    // ============================================================================
    // modes/touch-control.js
    // ============================================================================

/**
 * Touch Control Mode
 * Handles manual touch/slider-based motor control (matches stream.js pattern)
 */

// Initialize global touchValue for external access (matches stream.js)
if (typeof window !== 'undefined') {
    window.touchValue = 0;
}

class TouchControl {
    constructor(sdk) {
        this.sdk = sdk;
        this.isActive = false;
        this.currentValue = 0;
        this.updateCallback = null;
        this.pwmInterval = null;
    }

    async start() {
        if (this.isActive) {
            console.warn('Touch Control already active');
            return false;
        }

        this.isActive = true;
        this.startPwmWriting();
        console.log('Touch Control started');
        return true;
    }

    async stop() {
        if (!this.isActive) {
            return;
        }

        this.stopPwmWriting();
        this.isActive = false;
        
        // Set motor to 0 when stopping
        await this.sdk.motor.write(0);
        this.currentValue = 0;
        
        console.log('Touch Control stopped');
    }

    setValue(value) {
        // Only store value - no instant PWM writing (matches stream.js)
        this.currentValue = Math.max(0, Math.min(255, Math.round(value)));
        
        // Update global touchValue for external access (matches stream.js)
        if (typeof window !== 'undefined') {
            window.touchValue = Math.round((this.currentValue / 255) * 100);
        }
        
        console.log(`Touch Control: Value set to ${this.currentValue} (${window.touchValue}%)`);
        return true;
    }

    setPercentage(percentage) {
        // Store percentage value - no instant PWM writing (matches stream.js)
        const clampedPercentage = Math.max(0, Math.min(100, Math.round(percentage)));
        this.currentValue = Math.round((clampedPercentage / 100) * 255);
        
        // Update global touchValue for external access (matches stream.js)
        if (typeof window !== 'undefined') {
            window.touchValue = clampedPercentage;
        }
        
        console.log(`Touch Control: Percentage set to ${clampedPercentage}% (PWM: ${this.currentValue})`);
        return true;
    }

    startPwmWriting() {
        // Write PWM every 100ms based on current touch value (matches stream.js)
        this.pwmInterval = setInterval(async () => {
            try {
                // Read from global touchValue like stream.js
                const touchValue = (typeof window !== 'undefined' && window.touchValue) || 0;
                const pwmValue = Math.round((touchValue / 100) * 255);
                
                await this.sdk.motor.write(pwmValue);
                this.currentValue = pwmValue;
                
                // Trigger update callback
                if (this.updateCallback) {
                    this.updateCallback(pwmValue);
                }
            } catch (error) {
                console.error('Touch PWM writing error:', error);
            }
        }, 100); // 100ms interval matches stream.js
    }

    stopPwmWriting() {
        if(window && window.touchValue) {
            window.touchValue = 0
        }
        if (this.pwmInterval) {
            clearInterval(this.pwmInterval);
            this.pwmInterval = null;
        }
    }

    getValue() {
        return this.currentValue;
    }

    getPercentage() {
        return Math.round((this.currentValue / 255) * 100);
    }

    setUpdateCallback(callback) {
        this.updateCallback = callback;
    }

    isRunning() {
        return this.isActive;
    }
}



    // ============================================================================
    // remote-control.js
    // ============================================================================

/**
 * Remote Control - High-level remote control orchestration and UI helpers
 * Provides simplified API for common remote control workflows and demo functionality
 */

class RemoteControl {
    constructor() {
        // Core services
        this.remoteService = remoteService;
        this.motorController = motorController;
        
        // UI state management
        this.uiState = {
            isHost: false,
            isRemote: false,
            hostId: null,
            connectedUsers: [],
            connectionStatus: 'disconnected',
            lastError: null
        };
        
        // UI update callbacks
        this.uiCallbacks = {
            onHostReady: null,
            onConnectionStatusChange: null,
            onUserListUpdate: null,
            onError: null
        };
        
        // Setup event handlers
        this.setupEventHandlers();
    }

    /**
     * Setup event handlers for remote service
     */
    setupEventHandlers() {
        this.remoteService.setEventCallbacks({
            onHostReady: (hostId) => this.handleHostReady(hostId),
            onRemoteConnected: (userId) => this.handleRemoteConnected(userId),
            onRemoteDisconnected: (userId) => this.handleRemoteDisconnected(userId),
            onRemoteCommand: (data, userId) => this.handleRemoteCommand(data, userId),
            onConnectionStatusChange: (status, error) => this.handleConnectionStatusChange(status, error)
        });
    }

    /**
     * Start as host with UI updates
     * @returns {string} Host ID to share
     */
    async startAsHost() {
        try {
            const hostId = await this.remoteService.initializeAsHost();
            this.uiState.isHost = true;
            this.uiState.hostId = hostId;
            this.uiState.connectionStatus = 'hosting';
            
            this.updateUI();
            return hostId;
        } catch (error) {
            this.handleError('Failed to start as host', error);
            throw error;
        }
    }

    /**
     * Connect to remote host with UI updates
     * @param {string} hostId - Host ID to connect to
     */
    async connectToHost(hostId) {
        try {
            if (!UTILS.isValidId(hostId)) {
                throw new Error('Invalid host ID format');
            }

            await this.remoteService.connectToHost(hostId);
            this.uiState.isRemote = true;
            this.uiState.hostId = hostId;
            this.uiState.connectionStatus = 'connecting';
            
            this.updateUI();
        } catch (error) {
            this.handleError('Failed to connect to host', error);
            throw error;
        }
    }

    /**
     * Disconnect from remote control
     */
    async disconnect() {
        try {
            await this.remoteService.disconnect();
            this.resetUIState();
            this.updateUI();
        } catch (error) {
            this.handleError('Failed to disconnect', error);
        }
    }

    /**
     * Send remote command with validation
     * @param {string} mode - Control mode (ai, ambient, touch, manual)
     * @param {number} value - PWM value (0-255)
     * @param {Object} metadata - Additional command data
     */
    async sendCommand(mode, value, metadata = {}) {
        try {
            if (!this.uiState.isRemote) {
                throw new Error('Not connected as remote user');
            }

            const command = {
                type: 'control_command',
                mode: mode,
                value: Math.max(0, Math.min(255, Math.round(value))),
                timestamp: Date.now(),
                ...metadata
            };

            await this.remoteService.sendCommand(command);
        } catch (error) {
            this.handleError('Failed to send command', error);
            throw error;
        }
    }

    /**
     * Generate a new 6-character ID
     * @returns {string} 6-character ID
     */
    generateId() {
        return UTILS.generateShortId();
    }

    /**
     * Validate ID format
     * @param {string} id - ID to validate
     * @returns {boolean} True if valid
     */
    isValidId(id) {
        return UTILS.isValidId(id);
    }

    /**
     * Get current connection status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            ...this.uiState,
            connectedUserCount: this.uiState.connectedUsers.length,
            isConnected: this.uiState.connectionStatus === 'connected' || this.uiState.connectionStatus === 'hosting'
        };
    }

    /**
     * Set UI update callbacks
     * @param {Object} callbacks - UI callback functions
     */
    setUICallbacks(callbacks) {
        this.uiCallbacks = { ...this.uiCallbacks, ...callbacks };
    }

    // Event Handlers

    handleHostReady(hostId) {
        this.uiState.hostId = hostId;
        this.uiState.connectionStatus = 'hosting';
        
        if (this.uiCallbacks.onHostReady) {
            this.uiCallbacks.onHostReady(hostId);
        }
        
        this.updateUI();
    }

    handleRemoteConnected(userId) {
        if (!this.uiState.connectedUsers.includes(userId)) {
            this.uiState.connectedUsers.push(userId);
        }
        
        this.updateUI();
    }

    handleRemoteDisconnected(userId) {
        this.uiState.connectedUsers = this.uiState.connectedUsers.filter(id => id !== userId);
        this.updateUI();
    }

    handleRemoteCommand(data, userId) {
        // Execute command on motor if we're the host
        if (this.uiState.isHost && this.motorController.isMotorConnected()) {
            this.motorController.write(data.value);
        }
    }

    handleConnectionStatusChange(status, error) {
        this.uiState.connectionStatus = status;
        this.uiState.lastError = error;
        
        if (this.uiCallbacks.onConnectionStatusChange) {
            this.uiCallbacks.onConnectionStatusChange(status, error);
        }
        
        this.updateUI();
    }

    handleError(message, error) {
        console.error(message, error);
        this.uiState.lastError = error?.message || error;
        
        if (this.uiCallbacks.onError) {
            this.uiCallbacks.onError(message, error);
        }
        
        this.updateUI();
    }

    // UI Management

    updateUI() {
        // Update user list
        if (this.uiCallbacks.onUserListUpdate) {
            this.uiCallbacks.onUserListUpdate(this.uiState.connectedUsers);
        }
        
        // Update DOM elements if available
        this.updateDOMElements();
    }

    updateDOMElements() {
        // Host ID display
        const hostIdElement = document.getElementById('hostId');
        if (hostIdElement) {
            hostIdElement.textContent = this.uiState.hostId || '';
        }
        
        // Connection status
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = this.getStatusText();
            statusElement.className = `status ${this.uiState.connectionStatus}`;
        }
        
        // User count
        const userCountElement = document.getElementById('userCount');
        if (userCountElement) {
            userCountElement.textContent = this.uiState.connectedUsers.length;
        }
        
        // Error display
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = this.uiState.lastError || '';
            errorElement.style.display = this.uiState.lastError ? 'block' : 'none';
        }
        
        // Button states
        this.updateButtonStates();
    }

    updateButtonStates() {
        const hostBtn = document.getElementById('hostBtn');
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        
        if (hostBtn) {
            hostBtn.disabled = this.uiState.isHost || this.uiState.isRemote;
        }
        
        if (connectBtn) {
            connectBtn.disabled = this.uiState.isHost || this.uiState.isRemote;
        }
        
        if (disconnectBtn) {
            disconnectBtn.disabled = !this.uiState.isHost && !this.uiState.isRemote;
        }
    }

    getStatusText() {
        switch (this.uiState.connectionStatus) {
            case 'hosting':
                return `Hosting (${this.uiState.connectedUsers.length} users)`;
            case 'connected':
                return 'Connected to host';
            case 'connecting':
                return 'Connecting...';
            case 'disconnected':
                return 'Disconnected';
            default:
                return this.uiState.connectionStatus;
        }
    }

    resetUIState() {
        this.uiState = {
            isHost: false,
            isRemote: false,
            hostId: null,
            connectedUsers: [],
            connectionStatus: 'disconnected',
            lastError: null
        };
    }

    // Demo and Testing Utilities

    /**
     * Create a mock remote control for testing
     */
    createMockRemote() {
        return {
            generateId: () => 'MOCK01',
            startAsHost: async () => 'MOCK01',
            connectToHost: async (id) => console.log(`Mock connect to ${id}`),
            sendCommand: async (mode, value) => console.log(`Mock command: ${mode} = ${value}`),
            disconnect: async () => console.log('Mock disconnect'),
            getStatus: () => ({ isConnected: true, connectionStatus: 'mock' })
        };
    }

    /**
     * Setup demo UI event handlers
     */
    setupDemoHandlers() {
        // Host button
        const hostBtn = document.getElementById('hostBtn');
        if (hostBtn) {
            hostBtn.onclick = async () => {
                try {
                    const hostId = await this.startAsHost();
                    alert(`Host started! Share this ID: ${hostId}`);
                } catch (error) {
                    alert(`Failed to start host: ${error.message}`);
                }
            };
        }
        
        // Connect button
        const connectBtn = document.getElementById('connectBtn');
        if (connectBtn) {
            connectBtn.onclick = async () => {
                const hostId = prompt('Enter Host ID:');
                if (hostId) {
                    try {
                        await this.connectToHost(hostId.toUpperCase());
                    } catch (error) {
                        alert(`Failed to connect: ${error.message}`);
                    }
                }
            };
        }
        
        // Disconnect button
        const disconnectBtn = document.getElementById('disconnectBtn');
        if (disconnectBtn) {
            disconnectBtn.onclick = async () => {
                await this.disconnect();
            };
        }
        
        // Generate ID button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.onclick = () => {
                const id = this.generateId();
                alert(`Generated ID: ${id}`);
            };
        }
    }
}

// Create singleton instance
const remoteControl = new RemoteControl();

// Export class and instance
// Global access
if (typeof window !== 'undefined') {
    window.remoteControl = remoteControl;
}

    // ============================================================================
    // dulaan-sdk.js
    // ============================================================================

/**
 * Dulaan SDK - Unified API for motor control system
 * Main entry point that provides a clean, organized interface to all functionality
 */

// Import all modules
// Import control modes
// Import core components
class DulaanSDK {
    constructor() {
        // Core components - use global instances when available (for bundled version)
        this.motor = (typeof motorController !== 'undefined') ? motorController : 
                     (typeof window !== 'undefined' && window.motorController) ? window.motorController : 
                     new MotorController();
        
        // Core instances with safety checks
        
        try {
            this.api = new ApiService(); // Create instance of API service
        } catch (error) {
            console.error('Failed to create ApiService:', error);
            this.api = null;
        }
        
        this.consent = (typeof consentService !== 'undefined') ? consentService :
                       (typeof window !== 'undefined' && window.consentService) ? window.consentService :
                       new ConsentService();
        
        this.remote = (typeof remoteService !== 'undefined') ? remoteService :
                      (typeof window !== 'undefined' && window.remoteService) ? window.remoteService :
                      new RemoteService();
        
        this.utils = (typeof window !== 'undefined' && window.audioUtils) || {};
        
        // Control modes - with safe instantiation
        this.modes = {};
        
        try {
            this.modes.ai = new AIVoiceControl({
                apiService: this.api,
                motorController: this.motor
            }); // Primary AI voice control mode
        } catch (error) {
            console.warn('Failed to create AIVoiceControl:', error);
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
        
        // Direct access to core components
        this.core = {
            apiService: ApiService,
            voiceControl: AIVoiceControl
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
            
            // Audio configuration is handled by individual modes
            
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
    async scan(timeout) {
        return await this.motor.scan(timeout);
    }

    async stopScan() {
        return await this.motor.stopScan();
    }

    async scanAndConnect(timeout) {
        return await this.motor.scanAndConnect(timeout);
    }

    async connect(deviceAddress) {
        return await this.motor.connect(deviceAddress);
    }

    async disconnectMotor() {
        return await this.motor.disconnect();
    }

    async disconnect() {
        // Disconnect both motor and remote for convenience
        await this.disconnectMotor();
        this.disconnectRemote();
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

    getDeviceAddress() {
        return this.motor.getDeviceAddress();
    }

    getScanResults() {
        return this.motor.getScanResults();
    }

    isScanning() {
        return this.motor.isScanningActive();
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
        this.motor.write(0)
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

    disconnectRemote() {
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
     * Audio API - Delegated to active mode
     */
    setAudioSensitivity(energy) {
        this.config.audio.maxEnergy = energy;
        
        // Update active mode if it supports audio sensitivity
        if (this.currentMode && this.modes[this.currentMode]) {
            const mode = this.modes[this.currentMode];
            if (mode.setMaxEnergy) {
                mode.setMaxEnergy(energy);
            }
        }
    }

    getAudioSensitivity() {
        return this.config.audio.maxEnergy;
    }

    getAudioState() {
        // Get audio state from active mode
        if (this.currentMode && this.modes[this.currentMode]) {
            const mode = this.modes[this.currentMode];
            if (mode.getAudioState) {
                return mode.getAudioState();
            }
        }
        return {};
    }

    /**
     * Configuration API
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Apply configuration changes
        if (newConfig.audio?.maxEnergy) {
            this.setAudioSensitivity(newConfig.audio.maxEnergy);
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
// Note: Global instance creation is handled by the build script

    // ============================================================================
    // Bundle Initialization
    // ============================================================================

    // Create global instance with error handling and delayed initialization
    let dulaan = null;
    
    // Use setTimeout to ensure all classes are fully defined
    setTimeout(() => {
        try {
            console.log('🔍 Checking available classes before DulaanSDK creation:', {
                DulaanSDK: typeof DulaanSDK,
                MotorController: typeof MotorController,
                StreamingProcessor: typeof StreamingProcessor,
                ApiService: typeof ApiService,
                ConsentService: typeof ConsentService,
                RemoteService: typeof RemoteService,
                RingBuffer: typeof RingBuffer
            });
            
            dulaan = new DulaanSDK();
            console.log('✅ DulaanSDK instance created successfully');
            
            // Update global reference
            window.dulaan = dulaan;
            
            // Initialize automatically
            dulaan.initialize().catch(error => {
                console.error('❌ DulaanSDK initialization failed:', error);
            });
        } catch (error) {
            console.error('❌ Failed to create DulaanSDK instance:', error);
            console.error('Error details:', error.stack);
        }
    }, 100); // 100ms delay to ensure all classes are defined

    // Export to global scope
    window.dulaan = dulaan;
    window.DulaanSDK = DulaanSDK;

    // Export individual components for advanced usage
    window.DULAAN_COMPONENTS = {
        MotorController: typeof MotorController !== 'undefined' ? MotorController : null,
        StreamingProcessor: typeof StreamingProcessor !== 'undefined' ? StreamingProcessor : null,
        ApiService: typeof ApiService !== 'undefined' ? ApiService : null,
        ConsentService: typeof ConsentService !== 'undefined' ? ConsentService : null,
        RemoteService: typeof RemoteService !== 'undefined' ? RemoteService : null,
        RemoteControl: typeof RemoteControl !== 'undefined' ? RemoteControl : null,
        AIVoiceControl: typeof AIVoiceControl !== 'undefined' ? AIVoiceControl : null,
        AmbientControl: typeof AmbientControl !== 'undefined' ? AmbientControl : null,
        TouchControl: typeof TouchControl !== 'undefined' ? TouchControl : null,
        RingBuffer: typeof RingBuffer !== 'undefined' ? RingBuffer : null,
        UTILS: typeof UTILS !== 'undefined' ? UTILS : null,
        REMOTE_CONFIG: typeof REMOTE_CONFIG !== 'undefined' ? REMOTE_CONFIG : null,
        AUDIO_CONFIG: typeof AUDIO_CONFIG !== 'undefined' ? AUDIO_CONFIG : null,
        PWM_CONFIG: typeof PWM_CONFIG !== 'undefined' ? PWM_CONFIG : null
    };

    console.log('🚀 Dulaan Browser Bundle loaded successfully');
    console.log('📦 Available components:', Object.keys(window.DULAAN_COMPONENTS));

})(window);
