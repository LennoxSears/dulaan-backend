/**
 * Dulaan Browser Bundle - Auto-generated from modular sources
 * Generated on: 2025-09-22T14:12:25.500Z
 * 
 * This file combines all modular ES6 files into a single browser-compatible bundle.
 * 
 * Source files:
 * - utils/constants.js
 * - utils/audio-utils.js
 * - core/motor-controller.js
 * - core/optimized-streaming-processor.js
 * - services/optimized-api-service.js
 * - services/consent-service.js
 * - services/remote-service.js
 * - modes/optimized-ai-voice-control.js
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
            
            await BleClient.requestLEScan({}, (result) => {
                console.log('Scan result:', JSON.stringify(result));
                
                // Filter for target device name (matches plugin.js)
                if (result.device.name === this.TARGET_DEVICE_NAME) {
                    console.log('Found target device:', result.device.deviceId);
                    this.deviceAddress = result.device.deviceId;
                    this.scanResults.push(result.device);
                    
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
        console.log(`[MOTOR WRITE] Attempting to write PWM: ${pwmValue}`);
        console.log(`[MOTOR WRITE] Connection status: ${this.isConnected}, Device: ${this.deviceAddress}`);
        
        if (!this.isConnected || !this.deviceAddress) {
            console.warn('[MOTOR WRITE] ❌ Motor not connected, cannot write PWM value');
            return false;
        }

        try {
            // Validate PWM value
            const pwm = Math.max(0, Math.min(255, Math.round(pwmValue)));
            console.log(`[MOTOR WRITE] Validated PWM: ${pwm} (from ${pwmValue})`);
            
            // Convert to hex string
            const hexValue = this.decimalToHexString(pwm);
            console.log(`[MOTOR WRITE] Hex value: ${hexValue}`);
            
            // Write to BLE characteristic
            const BleClient = getBleClient();
            if (!BleClient) {
                console.warn('[MOTOR WRITE] ⚠️ BleClient not available - PWM value stored but not transmitted');
                this.currentPwm = pwm;
                return true;
            }
            
            console.log(`[MOTOR WRITE] Sending BLE command to device ${this.deviceAddress}`);
            await BleClient.write(
                this.deviceAddress,
                this.SERVICE_UUID,
                this.CHARACTERISTIC_UUID,
                hexStringToDataView(hexValue)
            );
            
            this.currentPwm = pwm;
            console.log(`[MOTOR WRITE] ✅ Motor PWM successfully set to: ${pwm}`);
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
    // core/optimized-streaming-processor.js
    // ============================================================================

/**
 * Optimized Streaming Audio Processor
 * Efficient client-side VAD with smart API usage
 */

class OptimizedStreamingProcessor {
    constructor() {
        // Get RingBuffer class - use global if available (for bundled version)
        const RingBufferClass = (typeof RingBuffer !== 'undefined') ? RingBuffer :
                                (typeof window !== 'undefined' && window.DULAAN_COMPONENTS && window.DULAAN_COMPONENTS.RingBuffer) ? window.DULAAN_COMPONENTS.RingBuffer :
                                null;
        
        if (!RingBufferClass) {
            throw new Error('RingBuffer class not available. Make sure audio-utils.js is loaded.');
        }
        
        this.audioState = {
            // Local VAD buffers (optimized for longer speech and better context)
            vadBuffer: new RingBufferClass(4800), // 300ms for VAD analysis (better context)
            speechBuffer: new RingBufferClass(16000 * 30), // 30 seconds max speech (much longer)
            
            // VAD state
            isVoiceActive: false,
            voiceStartTime: 0,
            voiceEndTime: 0,
            consecutiveVoiceFrames: 0,
            consecutiveSilenceFrames: 0,
            
            // Optimized VAD thresholds for best accuracy
            VAD_ENERGY_THRESHOLD: 0.008, // Balanced threshold - not too sensitive to noise
            VAD_ZCR_THRESHOLD: 0.02, // Lower ZCR threshold for realistic speech
            VAD_VOICE_FRAMES: 3, // 3 consecutive frames to confirm voice (reduce false positives)
            VAD_SILENCE_FRAMES: 20, // 20 frames of silence to end speech (1.25 seconds)
            
            // Smart buffering
            MIN_SPEECH_DURATION: 6400, // 400ms minimum (in samples) - shorter for quick commands
            MAX_SPEECH_DURATION: 20000, // 20 seconds maximum in milliseconds
            SPEECH_TIMEOUT: 1250, // 1.25 seconds of silence ends speech
            
            // Efficiency tracking
            lastRMS: 0,
            lastZeroCrossings: 0,
            totalChunksProcessed: 0,
            speechChunksSent: 0,
            
            // Conversation state
            conversationActive: false,
            lastApiCall: 0,
            pendingSpeech: false
        };
        
        // Callbacks
        this.onSpeechReady = null;
        this.onVoiceStateChange = null;
        this.onConversationUpdate = null;
    }

    /**
     * Efficient Voice Activity Detection
     * Runs locally - no API calls
     */
    detectVoiceActivity(audioData) {
        // Calculate RMS energy efficiently
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        const rms = Math.sqrt(sum / audioData.length);
        this.audioState.lastRMS = rms;

        // Calculate zero-crossing rate efficiently
        let zeroCrossings = 0;
        for (let i = 1; i < audioData.length; i++) {
            if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
                zeroCrossings++;
            }
        }
        const zcr = zeroCrossings / audioData.length;
        this.audioState.lastZeroCrossings = zcr;

        // Advanced VAD decision with adaptive thresholds
        const energyActive = rms > this.audioState.VAD_ENERGY_THRESHOLD;
        const zcrActive = zcr > this.audioState.VAD_ZCR_THRESHOLD && zcr < 0.5; // ZCR too high = noise
        
        // Adaptive threshold based on recent SILENCE energy history (not speech)
        if (!this.energyHistory) this.energyHistory = [];
        
        // Only add to history if it's likely silence (low energy)
        if (rms <= this.audioState.VAD_ENERGY_THRESHOLD * 2) {
            this.energyHistory.push(rms);
            if (this.energyHistory.length > 50) this.energyHistory.shift();
        }
        
        const avgSilenceEnergy = this.energyHistory.length > 0 ? 
            this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length : 
            this.audioState.VAD_ENERGY_THRESHOLD;
        const adaptiveThreshold = Math.max(this.audioState.VAD_ENERGY_THRESHOLD, avgSilenceEnergy * 4);
        
        // Combined decision: energy must be active, ZCR should be reasonable
        const adaptiveCheck = rms > adaptiveThreshold * 1.5;
        const voiceDetected = energyActive && (zcrActive || adaptiveCheck);
        
        return voiceDetected;
    }

    /**
     * Process audio chunk efficiently
     * Only sends to API when speech is complete
     */
    processAudioChunk(base64Chunk) {
        try {
            const pcmData = this.base64ToFloat32Array(base64Chunk);
            if (pcmData.length === 0) return null;

            this.audioState.totalChunksProcessed++;

            // Always buffer audio for pre/post-speech context (smart buffering)
            this.audioState.vadBuffer.push(pcmData);
            
            // Local VAD - no API call
            const isVoiceActive = this.detectVoiceActivity(pcmData);
            
            // Voice activity state machine
            if (isVoiceActive) {
                this.audioState.consecutiveVoiceFrames++;
                this.audioState.consecutiveSilenceFrames = 0;
                
                // Voice start detection
                if (!this.audioState.isVoiceActive && 
                    this.audioState.consecutiveVoiceFrames >= this.audioState.VAD_VOICE_FRAMES) {
                    console.log(`[VAD] 🎤 Voice START detected (${this.audioState.consecutiveVoiceFrames} consecutive frames)`);
                    this.handleVoiceStart();
                }
                
                // Buffer speech audio during active speech
                if (this.audioState.isVoiceActive) {
                    this.audioState.speechBuffer.push(pcmData);
                    this.checkSpeechBufferLimits();
                }
                
            } else {
                this.audioState.consecutiveSilenceFrames++;
                this.audioState.consecutiveVoiceFrames = 0;
                
                // Voice end detection
                if (this.audioState.isVoiceActive && 
                    this.audioState.consecutiveSilenceFrames >= this.audioState.VAD_SILENCE_FRAMES) {
                    console.log(`[VAD] 🔇 Voice END detected (${this.audioState.consecutiveSilenceFrames} consecutive silence frames)`);
                    this.handleVoiceEnd();
                }
            }

            return {
                isVoiceActive: this.audioState.isVoiceActive,
                energy: this.audioState.lastRMS,
                zeroCrossings: this.audioState.lastZeroCrossings,
                speechBufferSize: this.audioState.speechBuffer.count,
                conversationActive: this.audioState.conversationActive,
                efficiency: {
                    totalChunks: this.audioState.totalChunksProcessed,
                    speechChunksSent: this.audioState.speechChunksSent,
                    apiCallRatio: this.audioState.speechChunksSent / this.audioState.totalChunksProcessed
                }
            };

        } catch (error) {
            console.error("Optimized audio processing failed:", error);
            return null;
        }
    }

    /**
     * Handle voice start - prepare for speech buffering with pre-speech context
     */
    handleVoiceStart() {
        this.audioState.isVoiceActive = true;
        this.audioState.voiceStartTime = Date.now();
        
        // Smart buffering: Include pre-speech context for natural start
        this.audioState.speechBuffer.reset();
        
        // Add recent VAD buffer content as pre-speech context (last 300ms for better quality)
        const preSpeechSamples = Math.min(4800, this.audioState.vadBuffer.count); // 300ms at 16kHz
        if (preSpeechSamples > 0) {
            const preSpeechData = this.audioState.vadBuffer.readLast(preSpeechSamples);
            this.audioState.speechBuffer.push(preSpeechData);
            console.log(`[Voice Start] Added ${preSpeechSamples} pre-speech samples (${(preSpeechSamples/16000*1000).toFixed(0)}ms) for context`);
        }
        
        this.audioState.pendingSpeech = true;
        
        console.log("[Voice Start] Beginning speech capture with smart buffering");
        
        if (this.onVoiceStateChange) {
            this.onVoiceStateChange({
                isActive: true,
                timestamp: this.audioState.voiceStartTime,
                energy: this.audioState.lastRMS,
                preSpeechSamples: preSpeechSamples
            });
        }
    }

    /**
     * Handle voice end - send complete speech to API with post-speech buffering
     */
    async handleVoiceEnd() {
        // Add small post-speech buffer for natural ending (100ms)
        const postSpeechDelay = 100;
        
        setTimeout(async () => {
            this.audioState.isVoiceActive = false;
            this.audioState.voiceEndTime = Date.now();
            const speechDuration = this.audioState.voiceEndTime - this.audioState.voiceStartTime;
            
            // Add recent VAD buffer as post-speech context (200ms for natural ending)
            const postSpeechSamples = Math.min(3200, this.audioState.vadBuffer.count); // 200ms
            if (postSpeechSamples > 0) {
                const postSpeechData = this.audioState.vadBuffer.readLast(postSpeechSamples);
                this.audioState.speechBuffer.push(postSpeechData);
                console.log(`[Voice End] Added ${postSpeechSamples} post-speech samples (${(postSpeechSamples/16000*1000).toFixed(0)}ms) for natural ending`);
            }
            
            console.log(`[Voice End] Speech duration: ${speechDuration}ms, Buffer: ${this.audioState.speechBuffer.count} samples`);
            
            // Send speech to API if we have enough audio and haven't sent recently
            if (this.audioState.speechBuffer.count >= this.audioState.MIN_SPEECH_DURATION) {
                const timeSinceLastSend = Date.now() - this.audioState.lastApiCall;
                if (timeSinceLastSend > 500) { // Prevent duplicate sends within 500ms
                    await this.sendSpeechToAPI(true); // Mark as final
                } else {
                    console.log("[Voice End] Speech already sent recently, skipping");
                    this.audioState.speechBuffer.reset();
                }
            } else {
                console.log("[Voice End] Speech too short, discarding");
                this.audioState.speechBuffer.reset();
            }
            
            this.audioState.pendingSpeech = false;
            
            if (this.onVoiceStateChange) {
                this.onVoiceStateChange({
                    isActive: false,
                    timestamp: this.audioState.voiceEndTime,
                    duration: speechDuration,
                    audioLength: this.audioState.speechBuffer.count,
                    postSpeechSamples: postSpeechSamples
                });
            }
        }, postSpeechDelay);
    }

    /**
     * Check if speech buffer needs to be sent (max duration reached)
     */
    async checkSpeechBufferLimits() {
        const speechDuration = Date.now() - this.audioState.voiceStartTime;
        const bufferSize = this.audioState.speechBuffer.count;
        
        // Send if max duration reached or buffer is full
        if (speechDuration >= this.audioState.MAX_SPEECH_DURATION || 
            bufferSize >= this.audioState.speechBuffer.capacity * 0.9) {
            
            console.log("[Buffer Limit] Sending speech chunk due to size/duration limit");
            await this.sendSpeechToAPI(false);
            
            // Keep some overlap for continuity
            const overlapSize = Math.min(3200, bufferSize * 0.1); // 200ms overlap
            const overlapData = this.audioState.speechBuffer.readLast(overlapSize);
            this.audioState.speechBuffer.reset();
            if (overlapData.length > 0) {
                this.audioState.speechBuffer.push(overlapData);
            }
        }
    }

    /**
     * Send complete speech to API - ONLY API call in the system
     */
    async sendSpeechToAPI(isFinal = true) {
        try {
            const speechData = this.audioState.speechBuffer.readAll();
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
                duration: Date.now() - this.audioState.voiceStartTime,
                isFinal: isFinal,
                sampleRate: 16000,
                channels: 1
            };

            console.log(`[API Call] Sending speech: ${speechData.length} samples (${(speechData.length/16000).toFixed(2)}s)`);
            
            this.audioState.speechChunksSent++;
            this.audioState.lastApiCall = Date.now();

            if (this.onSpeechReady) {
                await this.onSpeechReady(speechPacket);
            }

            // Reset buffer after sending
            if (isFinal) {
                this.audioState.speechBuffer.reset();
            }

            return speechPacket;

        } catch (error) {
            console.error("Failed to send speech to API:", error);
            throw error;
        }
    }

    /**
     * Force send current speech (for immediate commands)
     */
    async forceSendSpeech() {
        if (this.audioState.speechBuffer.count > 0) {
            console.log("[Force Send] Sending current speech buffer");
            return await this.sendSpeechToAPI(true);
        }
        return null;
    }

    /**
     * Set conversation active state
     */
    setConversationActive(active) {
        if (this.audioState.conversationActive !== active) {
            this.audioState.conversationActive = active;
            console.log(`[Conversation] ${active ? 'Started' : 'Ended'}`);
            
            if (this.onConversationUpdate) {
                this.onConversationUpdate(active);
            }
        }
    }

    /**
     * Convert base64 to Float32Array (optimized)
     */
    base64ToFloat32Array(base64String) {
        try {
            // Remove MIME header if present (matches legacy audio-processor.js)
            const pureBase64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;

            // Decode Base64
            const binary = atob(pureBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            // Convert to Float32Array with little-endian parsing (matches legacy)
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
     * Get efficiency statistics including smart buffering metrics
     */
    getEfficiencyStats() {
        const totalChunks = this.audioState.totalChunksProcessed;
        const apiCalls = this.audioState.speechChunksSent;
        const efficiency = totalChunks > 0 ? (1 - apiCalls / totalChunks) * 100 : 0;
        
        return {
            totalChunksProcessed: totalChunks,
            apiCallsMade: apiCalls,
            efficiencyPercentage: efficiency.toFixed(1),
            chunksPerApiCall: totalChunks > 0 ? (totalChunks / Math.max(1, apiCalls)).toFixed(1) : 0,
            lastApiCall: this.audioState.lastApiCall,
            smartBuffering: {
                vadBufferSize: this.audioState.vadBuffer.count,
                speechBufferSize: this.audioState.speechBuffer.count,
                vadBufferMs: Math.round((this.audioState.vadBuffer.count / 16000) * 1000),
                speechBufferMs: Math.round((this.audioState.speechBuffer.count / 16000) * 1000),
                preSpeechContextMs: 200, // 200ms pre-speech buffering
                postSpeechContextMs: 100, // 100ms post-speech buffering
                bufferUtilization: {
                    vadBuffer: Math.round((this.audioState.vadBuffer.count / this.audioState.vadBuffer.capacity) * 100),
                    speechBuffer: Math.round((this.audioState.speechBuffer.count / this.audioState.speechBuffer.capacity) * 100)
                }
            }
        };
    }

    /**
     * Reset processor
     */
    reset() {
        this.audioState.speechBuffer.reset();
        this.audioState.vadBuffer.reset();
        this.audioState.isVoiceActive = false;
        this.audioState.conversationActive = false;
        this.audioState.pendingSpeech = false;
        this.audioState.consecutiveVoiceFrames = 0;
        this.audioState.consecutiveSilenceFrames = 0;
        
        console.log("[Reset] Processor state cleared");
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isVoiceActive: this.audioState.isVoiceActive,
            conversationActive: this.audioState.conversationActive,
            pendingSpeech: this.audioState.pendingSpeech,
            speechBufferSize: this.audioState.speechBuffer.count,
            energy: this.audioState.lastRMS,
            efficiency: this.getEfficiencyStats()
        };
    }
}



    // ============================================================================
    // services/optimized-api-service.js
    // ============================================================================

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
    // modes/optimized-ai-voice-control.js
    // ============================================================================

/**
 * Optimized AI Voice Control Mode
 * Natural conversation with minimal API overhead
 */

class OptimizedAIVoiceControl {
    constructor(config = {}) {
        this.config = {
            // Conversation flow optimization
            responseTimeout: 3000, // 3 seconds max wait for response
            conversationTimeout: 300000, // 5 minutes of silence ends conversation (much longer)
            immediateCommandKeywords: ['stop', 'emergency', 'halt', 'now'],
            
            // Motor control optimization
            pwmUpdateThreshold: 5, // Only update if PWM changes by 5+
            motorResponseDelay: 100, // 100ms delay for motor commands
            
            // UI optimization
            updateInterval: 100, // Update UI every 100ms
            notificationDuration: 2000, // 2 second notifications
            
            ...config
        };

        // Core components (use shared instances if provided, fallback to creating new ones)
        this.processor = config.processor || 
                        (typeof OptimizedStreamingProcessor !== 'undefined' ? new OptimizedStreamingProcessor() : null);
        this.apiService = config.apiService || 
                         (typeof OptimizedApiService !== 'undefined' ? new OptimizedApiService() : null);
        
        if (!this.processor) {
            throw new Error('OptimizedStreamingProcessor not available');
        }
        if (!this.apiService) {
            throw new Error('OptimizedApiService not available');
        }
        this.motorController = config.motorController || null;
        
        // State management
        this.state = {
            isActive: false,
            isListening: false,
            isProcessing: false,
            conversationActive: false,
            currentPwm: 0, // Motor starts stopped
            lastResponse: null,
            lastError: null,
            
            // Conversation flow
            conversationStartTime: 0,
            lastInteractionTime: 0,
            responseQueue: [],
            
            // Performance tracking
            totalConversations: 0,
            totalApiCalls: 0,
            totalProcessingTime: 0,
            averageResponseTime: 0
        };

        // UI elements
        this.ui = {
            statusDisplay: null,
            pwmDisplay: null,
            conversationDisplay: null,
            efficiencyDisplay: null,
            notificationArea: null
        };

        // Timers
        this.conversationTimer = null;
        this.uiUpdateTimer = null;
        
        this.setupCallbacks();
    }

    /**
     * Setup callbacks for processor and API service
     */
    setupCallbacks() {
        // Processor callbacks (set directly on processor)
        this.processor.onSpeechReady = async (speechPacket) => {
            await this.handleSpeechReady(speechPacket);
        };
        this.processor.onVoiceStateChange = (voiceState) => {
            this.handleVoiceStateChange(voiceState);
        };
        this.processor.onConversationUpdate = (active) => {
            this.handleConversationUpdate(active);
        };

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
                this.updateUI();
            }
        });
    }

    /**
     * Start optimized voice control
     */
    async start() {
        try {
            console.log("[Optimized Voice] Starting natural conversation mode");
            
            this.state.isActive = true;
            this.state.conversationStartTime = Date.now();
            this.state.totalConversations++;
            
            // Start audio processing
            await this.startAudioProcessing();
            
            // Activate conversation mode
            this.handleConversationUpdate(true);
            
            // Start conversation timer
            this.startConversationTimer();
            
            // Start UI updates
            this.startUIUpdates();
            
            this.showNotification("🎤 Natural conversation started - speak naturally!", "success");
            
            return true;
            
        } catch (error) {
            console.error("Failed to start optimized voice control:", error);
            this.showNotification("❌ Failed to start voice control", "error");
            return false;
        }
    }

    /**
     * Stop voice control
     */
    async stop() {
        console.log("[Optimized Voice] Stopping conversation mode");
        
        this.state.isActive = false;
        this.state.isListening = false;
        this.state.conversationActive = false;
        
        // Stop timers
        if (this.conversationTimer) {
            clearTimeout(this.conversationTimer);
            this.conversationTimer = null;
        }
        
        if (this.uiUpdateTimer) {
            clearInterval(this.uiUpdateTimer);
            this.uiUpdateTimer = null;
        }
        
        // Stop audio processing
        await this.stopAudioProcessing();
        
        this.showNotification("🔇 Voice control stopped", "info");
        this.updateUI();
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
            
            // Check for immediate commands
            const isImmediate = this.isImmediateCommand(speechPacket);
            
            console.log(`[Speech Processing] ${isImmediate ? 'Immediate' : 'Normal'} command detected`);
            
            let response;
            if (isImmediate) {
                response = await this.apiService.sendImmediateCommand(speechPacket);
            } else {
                response = await this.apiService.processSpeechSegment(speechPacket);
            }
            
            const processingTime = Date.now() - startTime;
            this.state.totalProcessingTime += processingTime;
            this.updatePerformanceStats(processingTime);
            
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
            
            // ===== UPDATE INTERACTION TIME AND RESTART CONVERSATION =====
            this.state.lastInteractionTime = Date.now(); // Reset interaction timer
            console.log(`[CONVERSATION] Updated interaction time, restarting conversation for next command`);
            
            // CRITICAL FIX: Reset processor state to ensure it can detect next speech
            console.log(`[RESET] Resetting processor state for next interaction`);
            this.processor.audioState.isVoiceActive = false;
            this.processor.audioState.pendingSpeech = false;
            this.processor.audioState.consecutiveVoiceFrames = 0;
            this.processor.audioState.consecutiveSilenceFrames = 0;
            
            // Ensure conversation stays active for next command
            this.handleConversationUpdate(true);
            
        } catch (error) {
            console.error("Speech processing failed:", error);
            this.handleApiError(error);
            this.showNotification("⚠️ Speech processing failed", "warning");
        } finally {
            this.state.isProcessing = false;
            this.updateUI();
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
            this.showNotification("🎙️ Listening...", "info", 1000);
        } else if (voiceState.duration) {
            const durationMs = voiceState.duration;
            console.log(`[VOICE STATE] Voice ended - speech captured (${(durationMs/1000).toFixed(1)}s)`);
            this.showNotification(`✅ Speech captured (${(durationMs/1000).toFixed(1)}s)`, "success", 1500);
            
            // CRITICAL FIX: After speech ends, ensure we're ready for next interaction
            console.log(`[VOICE STATE] Preparing for next voice interaction`);
        }
        
        this.updateUI();
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
            this.showNotification("💬 Ready for voice command", "success");
            
            // CRITICAL FIX: Reset all processing flags and ensure clean state
            this.state.isProcessing = false;
            this.state.isListening = false;
            
            // Ensure processor is in clean state for next interaction
            if (this.processor.audioState) {
                this.processor.audioState.isVoiceActive = false;
                this.processor.audioState.pendingSpeech = false;
                console.log(`[CONVERSATION] Processor state reset for next interaction`);
            }
            
        } else {
            console.log(`[CONVERSATION] ⏸️ Pausing conversation`);
            this.showNotification("💤 Conversation paused", "info");
        }
        
        this.updateUI();
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
        
        // Show response notification
        if (response.response) {
            this.showNotification(`🤖 ${response.response}`, "success", 3000);
        }
        
        this.updateUI();
    }

    /**
     * Handle API errors
     */
    handleApiError(error) {
        this.state.lastError = error;
        console.error("API Error:", error);
        
        this.showNotification("❌ API communication failed", "error");
        this.updateUI();
    }

    /**
     * Update motor PWM with optimization
     */


    /**
     * Check if speech contains immediate command keywords
     */
    isImmediateCommand(speechPacket) {
        // Simple keyword detection - could be enhanced with ML
        const duration = speechPacket.duration || 0;
        const isShort = duration < 2000; // Less than 2 seconds
        
        // For now, treat short speech as potentially immediate
        return isShort;
    }

    /**
     * Start conversation timeout timer
     */
    startConversationTimer() {
        // DISABLED: Conversation timeout mechanism removed to match working test-real-api.html
        // The conversation stays active continuously like in the working version
        console.log("[Conversation Timer] Disabled - conversation stays active continuously");
        
        /* ORIGINAL TIMEOUT CODE - DISABLED
        if (this.conversationTimer) {
            clearTimeout(this.conversationTimer);
        }
        
        this.conversationTimer = setTimeout(() => {
            if (this.state.conversationActive) {
                const timeSinceInteraction = Date.now() - this.state.lastInteractionTime;
                if (timeSinceInteraction >= this.config.conversationTimeout) {
                    console.log("[Conversation] Timeout - ending conversation");
                    this.handleConversationUpdate(false);
                } else {
                    // Restart timer for remaining time
                    this.startConversationTimer();
                }
            }
        }, this.config.conversationTimeout);
        */
    }

    /**
     * Start UI update timer
     */
    startUIUpdates() {
        if (this.uiUpdateTimer) {
            clearInterval(this.uiUpdateTimer);
        }
        
        this.uiUpdateTimer = setInterval(() => {
            this.updateUI();
        }, this.config.updateInterval);
    }

    /**
     * Update performance statistics
     */
    updatePerformanceStats(processingTime) {
        this.state.totalProcessingTime += processingTime;
        this.state.averageResponseTime = this.state.totalApiCalls > 0 
            ? this.state.totalProcessingTime / this.state.totalApiCalls 
            : 0;
    }

    /**
     * Update UI displays
     */
    updateUI() {
        // Update status display
        if (this.ui.statusDisplay) {
            const status = this.getStatusText();
            this.ui.statusDisplay.textContent = status;
            this.ui.statusDisplay.className = `status ${this.getStatusClass()}`;
        }
        
        // Update PWM display
        if (this.ui.pwmDisplay) {
            this.ui.pwmDisplay.textContent = `PWM: ${this.state.currentPwm}`;
        }
        
        // Update efficiency display
        if (this.ui.efficiencyDisplay) {
            const stats = this.getEfficiencyStats();
            this.ui.efficiencyDisplay.innerHTML = this.formatEfficiencyStats(stats);
        }
        
        // Update conversation display
        if (this.ui.conversationDisplay) {
            const history = this.apiService.getConversationHistory();
            this.ui.conversationDisplay.innerHTML = this.formatConversationHistory(history);
        }
    }

    /**
     * Get current status text
     */
    getStatusText() {
        if (!this.state.isActive) return "Inactive";
        if (this.state.isProcessing) return "Processing...";
        if (this.state.isListening) return "Listening";
        if (this.state.conversationActive) return "Ready";
        return "Waiting";
    }

    /**
     * Get status CSS class
     */
    getStatusClass() {
        if (!this.state.isActive) return "inactive";
        if (this.state.isProcessing) return "processing";
        if (this.state.isListening) return "listening";
        if (this.state.conversationActive) return "active";
        return "waiting";
    }

    /**
     * Get comprehensive efficiency statistics
     */
    getEfficiencyStats() {
        const processorStats = this.processor.getEfficiencyStats();
        const apiStats = this.apiService.getEfficiencyStats();
        
        return {
            processor: processorStats,
            api: apiStats,
            conversation: {
                totalConversations: this.state.totalConversations,
                averageResponseTime: Math.round(this.state.averageResponseTime),
                conversationDuration: this.state.conversationStartTime > 0 
                    ? Date.now() - this.state.conversationStartTime 
                    : 0
            }
        };
    }

    /**
     * Format efficiency stats for display
     */
    formatEfficiencyStats(stats) {
        return `
            <div class="efficiency-stats">
                <div class="stat-group">
                    <h4>Processing Efficiency</h4>
                    <div>Chunks: ${stats.processor.totalChunksProcessed}</div>
                    <div>API Calls: ${stats.processor.apiCallsMade}</div>
                    <div>Efficiency: ${stats.processor.efficiencyPercentage}%</div>
                </div>
                <div class="stat-group">
                    <h4>Smart Buffering</h4>
                    <div>VAD Buffer: ${stats.processor.smartBuffering.vadBufferMs}ms</div>
                    <div>Speech Buffer: ${stats.processor.smartBuffering.speechBufferMs}ms</div>
                    <div>Pre-context: ${stats.processor.smartBuffering.preSpeechContextMs}ms</div>
                </div>
                <div class="stat-group">
                    <h4>Conversation</h4>
                    <div>Sessions: ${stats.conversation.totalConversations}</div>
                    <div>Avg Response: ${stats.conversation.averageResponseTime}ms</div>
                    <div>Duration: ${Math.round(stats.conversation.conversationDuration/1000)}s</div>
                </div>
            </div>
        `;
    }

    /**
     * Format conversation history for display
     */
    formatConversationHistory(history) {
        if (history.length === 0) {
            return '<div class="no-conversation">No conversation yet...</div>';
        }
        
        return history.slice(-5).map(entry => `
            <div class="conversation-entry">
                <div class="user-message">👤 ${entry.user}</div>
                <div class="assistant-message">🤖 ${entry.assistant}</div>
                <div class="message-meta">PWM: ${entry.pwm} | ${new Date(entry.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');
    }

    /**
     * Show notification
     */
    showNotification(message, type = "info", duration = null) {
        console.log(`[Notification] ${message}`);
        
        if (this.ui.notificationArea) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            this.ui.notificationArea.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, duration || this.config.notificationDuration);
        }
    }

    /**
     * Set UI elements
     */
    setUIElements(elements) {
        this.ui = { ...this.ui, ...elements };
    }

    /**
     * Start audio processing using Capacitor VoiceRecorder
     */
    async startAudioProcessing() {
        try {
            console.log("[Audio] Starting optimized audio processing");
            
            // Check if Capacitor is available
            if (!window.Capacitor?.Plugins?.VoiceRecorder) {
                throw new Error('Capacitor VoiceRecorder plugin not available');
            }
            
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
            
            this.state.isListening = true;
            console.log("[Audio] Capacitor audio streaming started");
            
        } catch (error) {
            console.error("[Audio] Failed to start audio processing:", error);
            this.showNotification("❌ Microphone access denied", "error");
            throw error;
        }
    }

    /**
     * Stop audio processing
     */
    async stopAudioProcessing() {
        console.log("[Audio] Stopping audio processing");
        
        try {
            // Check if Capacitor is available
            if (window.Capacitor?.Plugins?.VoiceRecorder) {
                // Stop audio streaming
                await window.Capacitor.Plugins.VoiceRecorder.stopStreaming();
            
                // Remove listeners
                await window.Capacitor.Plugins.VoiceRecorder.removeAllListeners();
            }
            
        } catch (error) {
            console.warn("[Audio] Error stopping audio processing:", error);
        }
        
        this.state.isListening = false;
    }

    /**
     * Process incoming audio chunk from Capacitor VoiceRecorder
     */
    processAudioChunk(base64Chunk) {
        if (!this.state.isActive || !this.state.isListening) {
            return;
        }

        try {
            // Process audio chunk through optimized processor
            const result = this.processor.processAudioChunk(base64Chunk);
            
            if (result) {
                // Update state with voice activity
                this.state.lastInteractionTime = Date.now();
                
                // Log voice activity for debugging
                console.log(`[VAD] Voice: ${result.isVoiceActive}, Energy: ${result.energy?.toFixed(4)}, ZCR: ${result.zeroCrossings?.toFixed(4)}`);
                
                // Speech packets are handled via onSpeechReady callback
                // This result only contains VAD status information
            }
            
        } catch (error) {
            console.error("[Audio] Error processing audio chunk:", error);
        }
    }



    /**
     * Update motor PWM value with optimization
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
                    // Use immediate execution instead of setTimeout for debugging
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
     * Reset to initial state
     */
    reset() {
        this.state.conversationActive = false;
        this.state.lastResponse = null;
        this.state.lastError = null;
        this.state.currentPwm = 0; // Reset to stopped
        
        this.processor.reset();
        this.apiService.reset();
        
        console.log("[Optimized Voice] State reset");
        this.updateUI();
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
            // Only save audio data to buffer - no instant PWM writing (matches stream.js)
            this.sdk.audio.processAbiChunk(base64Chunk);
        } catch (error) {
            //console.error('Ambient processing error:', error);
        }
    }

    startPwmWriting() {
        // Write PWM every 100ms based on accumulated audio data (matches stream.js)
        this.pwmInterval = setInterval(async () => {
            try {
                const pwmValue = this.sdk.audio.calculateAmbientPWM(this.getMaxEnergy());
                
                if (pwmValue > 0) {
                    await this.sdk.motor.write(pwmValue);
                    
                    // Trigger event for UI updates
                    this.onAmbientUpdate({
                        energy: this.sdk.audio.getAudioState().lastRMS,
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
        this.sdk.audio.setMaxEnergy(energy);
    }

    getMaxEnergy() {
        return this.sdk.audio.getMaxEnergy();
    }

    isRunning() {
        return this.isActive;
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
// Import control modes (optimized as primary)
// Import optimized components (now primary)
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
                OptimizedStreamingProcessor: typeof OptimizedStreamingProcessor,
                OptimizedApiService: typeof OptimizedApiService,
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
        OptimizedStreamingProcessor: typeof OptimizedStreamingProcessor !== 'undefined' ? OptimizedStreamingProcessor : null,
        OptimizedApiService: typeof OptimizedApiService !== 'undefined' ? OptimizedApiService : null,
        ConsentService: typeof ConsentService !== 'undefined' ? ConsentService : null,
        RemoteService: typeof RemoteService !== 'undefined' ? RemoteService : null,
        RemoteControl: typeof RemoteControl !== 'undefined' ? RemoteControl : null,
        OptimizedAIVoiceControl: typeof OptimizedAIVoiceControl !== 'undefined' ? OptimizedAIVoiceControl : null,
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
