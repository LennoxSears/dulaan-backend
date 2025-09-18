/**
 * Dulaan Browser Bundle - Browser-compatible version without ES6 modules
 * This file combines all the modular functionality into a single browser-compatible file
 */

// Include all the functionality in a single file for browser compatibility
(function(window) {
    'use strict';

    // Motor Controller
    class MotorController {
        constructor() {
            this.deviceAddress = null;
            this.isConnected = false;
            this.currentPwm = 0;
            this.SERVICE_UUID = "0000FFE0-0000-1000-8000-00805F9B34FB";
            this.CHARACTERISTIC_UUID = "0000FFE1-0000-1000-8000-00805F9B34FB";
        }

        async initialize() {
            try {
                if (window.BleClient && typeof window.BleClient.initialize === 'function') {
                    await window.BleClient.initialize();
                    console.log('BLE client initialized');
                } else {
                    console.log('BLE client not available or mocked - skipping initialization');
                }
                console.log('Motor controller initialized');
                return true;
            } catch (error) {
                console.warn('Motor controller initialization warning:', error.message);
                // Don't fail initialization for BLE issues in demo environment
                return true;
            }
        }

        async connect(deviceAddress = null) {
            try {
                if (deviceAddress) {
                    this.deviceAddress = deviceAddress;
                }
                
                if (window.BleClient && this.deviceAddress) {
                    await window.BleClient.connect(this.deviceAddress);
                    this.isConnected = true;
                    console.log('Connected to motor device:', this.deviceAddress);
                }
                return true;
            } catch (error) {
                console.error('Failed to connect to motor device:', error);
                this.isConnected = false;
                return false;
            }
        }

        async write(pwmValue) {
            try {
                const pwm = Math.max(0, Math.min(255, Math.round(pwmValue)));
                
                if (window.ble && window.ble.write && this.deviceAddress) {
                    const hexValue = this.decimalToHexString(pwm);
                    await window.ble.write(
                        this.deviceAddress,
                        this.SERVICE_UUID,
                        this.CHARACTERISTIC_UUID,
                        hexValue
                    );
                }
                
                this.currentPwm = pwm;
                console.log(`Motor PWM set to: ${pwm}`);
                
                // Update legacy global variable
                window.current_pwm = pwm;
                
                return true;
            } catch (error) {
                console.error('Failed to write PWM value:', error);
                return false;
            }
        }

        async writeForce(pwmValue) {
            return this.write(pwmValue);
        }

        getCurrentPwm() {
            return this.currentPwm;
        }

        isMotorConnected() {
            return this.isConnected;
        }

        decimalToHexString(decimal) {
            const hex = decimal.toString(16).toUpperCase();
            return hex.length === 1 ? '0' + hex : hex;
        }
    }

    // Consent Service
    class ConsentService {
        constructor() {
            this.apiUrl = 'https://storeuserconsent-qveg3gkwxa-ew.a.run.app';
            this.storageKeys = {
                deviceId: 'dulaan_device_id',
                consent: 'dulaan_consent_given',
                timestamp: 'dulaan_consent_timestamp'
            };
        }

        async generateDeviceId() {
            try {
                if (typeof ThumbmarkJS !== 'undefined') {
                    const tm = new ThumbmarkJS.Thumbmark({
                        exclude: ['permissions'],
                        timeout: 3000,
                        logging: false
                    });
                    const result = await tm.get();
                    return result.thumbmark;
                }
                
                // Fallback fingerprinting
                return this.generateBasicFingerprint();
            } catch (error) {
                console.error('Error generating device ID:', error);
                return 'fallback_' + Date.now() + '_' + Math.random().toString(36).substring(2);
            }
        }

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
                canvas: canvasFingerprint.slice(-50)
            };
            
            const fingerprintString = JSON.stringify(basicFingerprint);
            let hash = 0;
            for (let i = 0; i < fingerprintString.length; i++) {
                const char = fingerprintString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16);
        }

        async getDeviceId() {
            try {
                let deviceId = localStorage.getItem(this.storageKeys.deviceId);
                
                if (!deviceId) {
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

        async collectUserConsent(consentData) {
            try {
                const deviceId = await this.getDeviceId();
                
                const consentPayload = {
                    deviceId: deviceId,
                    consent: consentData,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                };

                // Make API call to Cloud Function

                // Try real API call for production
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
                localStorage.setItem(this.storageKeys.consent, JSON.stringify(consentData));
                localStorage.setItem(this.storageKeys.timestamp, new Date().toISOString());
                
                return result;
            } catch (error) {
                console.error('Error collecting user consent:', error);
                throw error;
            }
        }
    }

    // API Service
    class ApiService {
        constructor() {
            this.baseUrls = {
                speechToTextWithLLM: 'https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app'
            };
        }

        async speechToTextWithLLM(audioBase64, currentPwm, msgHis = [], options = {}) {
            try {
                const response = await fetch(this.baseUrls.speechToTextWithLLM, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        msgHis: msgHis,
                        audioContent: audioBase64,
                        currentPwm: currentPwm,
                        geminiApiKey: 'AQ.Ab8RN6KGpvk0TlA0Z1nwdrQ-FH2v2WIk1hrnBjixpurRp6YtuA',
                        encoding: options.encoding || 'WEBM_OPUS',
                        sampleRateHertz: options.sampleRateHertz || 48000,
                        languageCode: options.languageCode
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
    }

    // Main Dulaan SDK
    class DulaanSDK {
        constructor() {
            this.motor = new MotorController();
            this.consent = new ConsentService();
            this.api = new ApiService();
            this.isInitialized = false;
        }

        async initialize() {
            try {
                await this.motor.initialize();
                this.isInitialized = true;
                console.log('Dulaan SDK initialized successfully');
                return true;
            } catch (error) {
                console.error('Failed to initialize Dulaan SDK:', error);
                return false;
            }
        }

        // Motor control methods
        async write(pwmValue) {
            return await this.motor.write(pwmValue);
        }

        async writeForce(pwmValue) {
            return await this.motor.writeForce(pwmValue);
        }

        // Consent methods
        async generateDeviceId() {
            return await this.consent.generateDeviceId();
        }

        async getDeviceId() {
            return await this.consent.getDeviceId();
        }

        async collectUserConsent(consentData) {
            return await this.consent.collectUserConsent(consentData);
        }

        // API methods
        async speechToTextWithLLM(audioBase64, currentPwm, msgHis = [], options = {}) {
            return await this.api.speechToTextWithLLM(audioBase64, currentPwm, msgHis, options);
        }
    }

    // Create global instance
    const dulaan = new DulaanSDK();

    // Initialize automatically
    dulaan.initialize();

    // Export to global scope
    window.dulaan = dulaan;
    window.DulaanSDK = DulaanSDK;

    // Legacy global variables
    window.current_pwm = 0;
    window.aiValue = 0;
    window.msgHis = [];
    window.maxEnergy = 0.075;

    console.log('Dulaan Browser Bundle loaded successfully');

})(window);