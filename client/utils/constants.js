/**
 * Constants - Configuration constants and defaults
 */

// BLE Configuration
export const BLE_CONFIG = {
    SERVICE_UUID: "0000FFE0-0000-1000-8000-00805F9B34FB",
    CHARACTERISTIC_UUID: "0000FFE1-0000-1000-8000-00805F9B34FB",
    CONNECTION_TIMEOUT: 10000,
    WRITE_TIMEOUT: 5000
};

// Audio Processing Configuration
export const AUDIO_CONFIG = {
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
export const PWM_CONFIG = {
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
export const API_CONFIG = {
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
export const REMOTE_CONFIG = {
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
export const CONSENT_CONFIG = {
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
export const MODE_CONFIG = {
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
export const ERROR_MESSAGES = {
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
export const SUCCESS_MESSAGES = {
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
export const SDK_INFO = {
    NAME: 'Dulaan SDK',
    VERSION: '2.0.0',
    DESCRIPTION: 'Motor control system with voice, ambient, and remote control capabilities',
    AUTHOR: 'Dulaan Team',
    LICENSE: 'MIT'
};

// Utility Functions
export const UTILS = {
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