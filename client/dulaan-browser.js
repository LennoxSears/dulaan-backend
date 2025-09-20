/**
 * Dulaan Browser Bundle - Auto-generated from modular sources
 * Generated on: 2025-09-20T12:52:29.256Z
 * 
 * This file combines all modular ES6 files into a single browser-compatible bundle.
 * 
 * Source files:
 * - utils/constants.js
 * - utils/audio-utils.js
 * - core/motor-controller.js
 * - core/audio-processor.js
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
    MIN_SPEECH_DURATION: 10,
    
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
        SPEECH_TO_TEXT_LLM: 'https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app',
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
               (window.Capacitor && window.Capacitor.Plugins.BluetoothLe) ||
               null;
    }
    return null;
}

class MotorController {
    constructor() {
        this.deviceAddress = null;
        this.isConnected = false;
        this.currentPwm = 0;
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
        if (!this.isConnected || !this.deviceAddress) {
            console.warn('Motor not connected, cannot write PWM value');
            return false;
        }

        try {
            // Validate PWM value
            const pwm = Math.max(0, Math.min(255, Math.round(pwmValue)));
            
            // Convert to hex string
            const hexValue = this.decimalToHexString(pwm);
            
            // Write to BLE characteristic
            const BleClient = getBleClient();
            if (!BleClient) {
                console.warn('BleClient not available - PWM value stored but not transmitted');
                this.currentPwm = pwm;
                return true;
            }
            
            await BleClient.write(
                this.deviceAddress,
                this.SERVICE_UUID,
                this.CHARACTERISTIC_UUID,
                hexStringToDataView(hexValue)
            );
            
            this.currentPwm = pwm;
            console.log(`Motor PWM set to: ${pwm}`);
            return true;
        } catch (error) {
            console.error('Failed to write PWM value:', error);
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
    // core/audio-processor.js
    // ============================================================================

/**
 * Audio Processor - Core audio processing and analysis
 * Handles audio capture, processing, and analysis for motor control
 */

// Ring buffer implementation for audio data
class RingBuffer {
    constructor(size) {
        this.buffer = new Float32Array(size);
        this.size = size;
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }

    push(data) {
        const available = this.size - this.count;
        const toWrite = Math.min(data.length, available);

        const firstPart = Math.min(toWrite, this.size - this.tail);
        this.buffer.set(data.subarray(0, firstPart), this.tail);

        const secondPart = toWrite - firstPart;
        if (secondPart > 0) {
            this.buffer.set(data.subarray(firstPart, firstPart + secondPart), 0);
        }

        this.tail = (this.tail + toWrite) % this.size;
        this.count += toWrite;
        return toWrite;
    }

    readAll() {
        const out = new Float32Array(this.count);
        const firstPart = Math.min(this.count, this.size - this.head);
        out.set(this.buffer.subarray(this.head, this.head + firstPart));

        if (this.count > firstPart) {
            out.set(this.buffer.subarray(0, this.count - firstPart), firstPart);
        }
        return out;
    }

    reset() {
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }
}

class AudioProcessor {
    constructor() {
        // Audio processing state
        this.audioState = {
            ringBuffer: new RingBuffer(480000 * 2), // 16000Hz * 30 seconds
            abiBuffer: new RingBuffer(1600),
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

        // Audio configuration
        this.pcmConfig = {
            sampleRate: 16000,
            channels: 1,
            bitsPerSample: 16,
            bufferSize: 1600
        };
        
        // Energy settings
        this.maxEnergy = 0.075;
        
        // Speech processing callback
        this.onSpeechSegmentReady = null;
    }

    /**
     * Convert base64 audio to Float32Array
     */
    base64ToFloat32Array(base64) {
        try {
            // Remove MIME header if present
            const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

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
        } catch (e) {
            console.error("Base64 decode failed:", e);
            return new Float32Array(0);
        }
    }

    /**
     * Detect silence in audio data (matches stream.js logic exactly)
     */
    detectSilence(pcmData, threshold, zeroRatio) {
        let energy = 0;
        let zeroCrossings = 0;
        
        for (let i = 0; i < pcmData.length; i++) {
            energy += pcmData[i] ** 2;
            if (i > 0 && (Math.sign(pcmData[i]) !== Math.sign(pcmData[i - 1]))) {
                zeroCrossings++;
            }
        }
        
        const rms = Math.sqrt(energy / pcmData.length);
        const zeroRate = zeroCrossings / pcmData.length;
        
        this.audioState.lastRMS = rms;
        this.audioState.lastZeroCrossings = zeroCrossings;
        
        // Return true if silent (matches stream.js: NOT (rms > threshold && zeroCrossings > threshold))
        return !(rms > threshold && zeroCrossings > (pcmData.length * zeroRatio));
    }

    /**
     * Convert audio energy to PWM value
     */
    audio2PWM(maxEnergy) {
        const energy = this.audioState.lastRMS;
        if (energy <= 0) return 0;
        
        const normalizedEnergy = Math.min(energy / maxEnergy, 1.0);
        const pwmValue = Math.round(normalizedEnergy * 255);
        
        return Math.max(0, Math.min(255, pwmValue));
    }

    /**
     * Process audio chunk for speech detection (matches stream.js logic)
     */
    processAudioChunk(base64Chunk) {
        try {
            const pcmData = this.base64ToFloat32Array(base64Chunk);
            if (pcmData.length === 0) return null;

            // Update chunk size for minimum duration calculation
            this.audioState.lastChunkSize = pcmData.length;
            
            const isSilent = this.detectSilence(
                pcmData, 
                this.audioState.SILENCE_THRESHOLD, 
                this.audioState.ZERO_CROSSING
            );

            // Speech activity detection (matches stream.js)
            if (!isSilent) {
                this.audioState.silenceCounter = 0;
                if (!this.audioState.isSpeaking) {
                    console.log(
                        `[Speech Detected] Energy: ${this.audioState.lastRMS.toFixed(4)}, ` +
                        `Zero crossings: ${this.audioState.lastZeroCrossings}`
                    );
                }
                this.audioState.isSpeaking = true;
            } else if (this.audioState.isSpeaking) {
                this.audioState.silenceCounter++;
            }

            // Write to ring buffer
            const written = this.audioState.ringBuffer.push(pcmData);
            if (written < pcmData.length) {
                console.warn("Buffer overflow, discarding", pcmData.length - written, "samples");
                this.audioState.ringBuffer.reset();
            }

            // Prevent buffer from getting too large (force packaging if buffer is near full)
            const MAX_BUFFER_SIZE = 400000; // ~25 seconds at 16kHz
            if (this.audioState.ringBuffer.count > MAX_BUFFER_SIZE) {
                console.warn("Buffer size limit reached, forcing speech packaging");
                this.triggerSpeechPackaging();
                return {
                    isSpeaking: false,
                    energy: this.audioState.lastRMS,
                    pwmValue: this.audio2PWM(this.maxEnergy),
                    silenceCounter: 0
                };
            }

            // Silence timeout triggers speech packaging (matches stream.js)
            const minSamples = this.audioState.MIN_SPEECH_DURATION * this.audioState.lastChunkSize;
            if (
                this.audioState.silenceCounter >= this.audioState.SILENCE_TIMEOUT &&
                this.audioState.ringBuffer.count > minSamples
            ) {
                this.triggerSpeechPackaging();
            }

            return {
                isSpeaking: this.audioState.isSpeaking,
                energy: this.audioState.lastRMS,
                pwmValue: this.audio2PWM(this.maxEnergy),
                silenceCounter: this.audioState.silenceCounter
            };
        } catch (error) {
            console.error("Audio chunk processing failed:", error);
            return null;
        }
    }

    /**
     * Process audio chunk for ambient control (matches stream.js processAbiChunk)
     */
    processAbiChunk(base64Chunk) {
        try {
            const pcmData = this.base64ToFloat32Array(base64Chunk);
            if (pcmData.length === 0) return;

            // Update chunk size
            this.audioState.lastChunkSize = pcmData.length;
            
            // Write to ambient buffer (matches stream.js)
            const written = this.audioState.abiBuffer.push(pcmData);
            if (written < pcmData.length) {
                console.warn("ABI buffer overflow, discarding", pcmData.length - written, "samples");
                this.audioState.abiBuffer.reset();
            }
        } catch (error) {
            console.error("ABI chunk processing failed:", error);
        }
    }

    /**
     * Calculate ambient PWM value from accumulated buffer data (matches stream.js audio2PWM)
     */
    calculateAmbientPWM(maxEnergy) {
        try {
            const pcmData = this.audioState.abiBuffer.readAll();
            if (pcmData.length === 0) {
                return -1;
            }
            
            let energy = 0;
            for (let i = 0; i < pcmData.length; i++) {
                if (isNaN(pcmData[i])) {
                    pcmData[i] = 0;
                }
                energy += pcmData[i] ** 2;
            }
            
            const rms = Math.sqrt(energy / pcmData.length);
            this.audioState.lastRMS = rms;
            
            const pwmValue = Math.round((rms / maxEnergy) * 255);
            return pwmValue > 255 ? 255 : pwmValue;
        } catch (error) {
            console.error("Ambient PWM calculation failed:", error);
            return -1;
        }
    }

    /**
     * Trigger speech packaging when silence detected (matches stream.js)
     */
    triggerSpeechPackaging() {
        if (this.onSpeechSegmentReady) {
            // Call the registered callback with packaged speech data
            const speechData = this.packageSpeechSegmentSync();
            if (speechData) {
                this.onSpeechSegmentReady(speechData);
            }
        }
    }

    /**
     * Package speech segment synchronously (matches stream.js logic)
     */
    packageSpeechSegmentSync() {
        try {
            const pcmData = this.audioState.ringBuffer.readAll();
            if (pcmData.length === 0) return null;

            // Limit audio segment size to prevent stack overflow (max 30 seconds at 16kHz)
            const MAX_SAMPLES = 480000; // 16000Hz * 30 seconds
            const limitedData = pcmData.length > MAX_SAMPLES ? 
                pcmData.slice(0, MAX_SAMPLES) : pcmData;

            if (pcmData.length > MAX_SAMPLES) {
                console.warn(`[Speech Packaging] Audio segment too large (${pcmData.length} samples), truncated to ${MAX_SAMPLES}`);
            }

            // Convert to Int16 to reduce transmission size (matches stream.js)
            const int16Data = new Int16Array(limitedData.length);
            for (let i = 0; i < limitedData.length; i++) {
                const scaled = Math.max(-1, Math.min(1, limitedData[i])) * 32767;
                int16Data[i] = Math.max(-32768, Math.min(32767, scaled));
            }

            console.log("[Speech Packaging] PCM segment:", int16Data.length, "samples");

            // Reset state (matches stream.js)
            this.audioState.ringBuffer.reset();
            this.audioState.isSpeaking = false;
            this.audioState.silenceCounter = 0;

            // Convert to base64 for transmission using chunked approach to avoid stack overflow
            const chunkSize = 8192; // Process in smaller chunks
            let base64Audio = '';
            
            for (let i = 0; i < int16Data.buffer.byteLength; i += chunkSize) {
                const chunk = new Uint8Array(int16Data.buffer, i, Math.min(chunkSize, int16Data.buffer.byteLength - i));
                base64Audio += btoa(String.fromCharCode.apply(null, chunk));
            }
            
            return base64Audio;
        } catch (error) {
            console.error("Speech packaging failed:", error);
            // Reset state on error to prevent stuck state
            this.audioState.ringBuffer.reset();
            this.audioState.isSpeaking = false;
            this.audioState.silenceCounter = 0;
            return null;
        }
    }

    /**
     * Package speech segment for AI processing (legacy method for compatibility)
     */
    async packageSpeechSegment() {
        return this.packageSpeechSegmentSync();
    }

    /**
     * Reset audio state
     */
    reset() {
        this.audioState.ringBuffer.reset();
        this.audioState.abiBuffer.reset();
        this.audioState.isSpeaking = false;
        this.audioState.silenceCounter = 0;
        this.audioState.lastRMS = 0;
        this.audioState.lastZeroCrossings = 0;
    }

    /**
     * Get current audio state
     */
    getAudioState() {
        return { ...this.audioState };
    }

    /**
     * Legacy method for compatibility (deprecated - use calculateAmbientPWM)
     */
    audio2PWM(maxEnergy) {
        return this.calculateAmbientPWM(maxEnergy);
    }

    /**
     * Set max energy threshold
     */
    setMaxEnergy(energy) {
        this.maxEnergy = Math.max(0.01, Math.min(1.0, energy));
    }

    /**
     * Get max energy threshold
     */
    getMaxEnergy() {
        return this.maxEnergy;
    }

    /**
     * Register callback for when speech segment is ready
     */
    setSpeechSegmentCallback(callback) {
        this.onSpeechSegmentReady = callback;
    }

    /**
     * Remove speech segment callback
     */
    removeSpeechSegmentCallback() {
        this.onSpeechSegmentReady = null;
    }
}

// Create singleton instance
const audioProcessor = new AudioProcessor();

// Export both class and instance
// Global access
if (typeof window !== 'undefined') {
    window.audioProcessor = audioProcessor;
    window.AUDIO_STATE = audioProcessor.audioState;
    window.RingBuffer = RingBuffer;
}

    // ============================================================================
    // services/api-service.js
    // ============================================================================

/**
 * API Service - External API integrations
 * Handles communication with Cloud Functions for speech-to-text and LLM processing
 */

class ApiService {
    constructor(config = {}) {
        this.baseUrls = {
            speechToTextWithLLM: 'https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app',
            storeUserData: 'https://storeuserdata-qveg3gkwxa-ew.a.run.app',
            ...config.endpoints
        };
        
        this.defaultOptions = {
            encoding: 'LINEAR16',  // Changed to match Int16 PCM data from client
            sampleRateHertz: 16000, // Changed to match actual audio processing rate
            ...config.options
        };
        
        this.apiKey = config.apiKey || null;
    }

    /**
     * Set API key securely
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Process speech with LLM for motor control
     */
    async speechToTextWithLLM(audioBase64, currentPwm, msgHis = [], options = {}) {
        try {
            const requestOptions = { ...this.defaultOptions, ...options };
            
            const response = await fetch(this.baseUrls.speechToTextWithLLM, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    msgHis: msgHis,
                    audioContent: audioBase64,
                    currentPwm: currentPwm,
                    geminiApiKey: this.apiKey,
                    encoding: requestOptions.encoding,
                    sampleRateHertz: requestOptions.sampleRateHertz,
                    languageCode: requestOptions.languageCode
                })
            });

            if (!response.ok) {
                throw new Error(`Speech-to-text with LLM API error: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Speech-to-text with LLM error:', error);
            throw error;
        }
    }

    /**
     * Store user data
     */
    async storeUserData(userId, deviceFingerprint, additionalData = {}) {
        try {
            const response = await fetch(this.baseUrls.storeUserData, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    deviceFingerprint: deviceFingerprint,
                    additionalData: additionalData
                })
            });

            if (!response.ok) {
                throw new Error(`Store user data API error: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Store user data error:', error);
            throw error;
        }
    }

    /**
     * Update API endpoints
     */
    updateEndpoints(newUrls) {
        this.baseUrls = { ...this.baseUrls, ...newUrls };
    }

    /**
     * Update default options
     */
    updateDefaultOptions(newOptions) {
        this.defaultOptions = { ...this.defaultOptions, ...newOptions };
    }

    /**
     * Get current API endpoints
     */
    getEndpoints() {
        return { ...this.baseUrls };
    }

    /**
     * Test API connectivity
     */
    async testConnectivity() {
        const results = {};
        
        for (const [name, url] of Object.entries(this.baseUrls)) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                results[name] = {
                    status: response.status,
                    ok: response.ok,
                    url: url
                };
            } catch (error) {
                results[name] = {
                    status: 'error',
                    ok: false,
                    error: error.message,
                    url: url
                };
            }
        }
        
        return results;
    }
}

// Create singleton instance
const apiService = new ApiService();

// Export both class and instance
// Global access
if (typeof window !== 'undefined') {
    window.apiService = apiService;
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
 * Handles voice recognition and AI-powered motor control using streaming
 */

class AIVoiceControl {
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
            console.log(`Speech detected: ${result.isSpeaking}, Energy: ${result.energy.toFixed(4)}`);
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
            console.error('Ambient processing error:', error);
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
// Note: Global instance creation is handled by the build script

    // ============================================================================
    // Bundle Initialization
    // ============================================================================

    // Create global instance
    const dulaan = new DulaanSDK();

    // Initialize automatically
    dulaan.initialize().catch(console.error);

    // Export to global scope
    window.dulaan = dulaan;
    window.DulaanSDK = DulaanSDK;

    // Export individual components for advanced usage
    window.DULAAN_COMPONENTS = {
        MotorController,
        AudioProcessor,
        ApiService,
        ConsentService,
        RemoteService,
        RemoteControl,
        AIVoiceControl,
        AmbientControl,
        TouchControl,
        UTILS,
        REMOTE_CONFIG,
        AUDIO_CONFIG,
        PWM_CONFIG
    };

    console.log('🚀 Dulaan Browser Bundle loaded successfully');
    console.log('📦 Available components:', Object.keys(window.DULAAN_COMPONENTS));

})(window);
