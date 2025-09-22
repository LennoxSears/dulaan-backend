/**
 * API Service - External API integrations
 * Handles communication with Cloud Functions for speech-to-text and LLM processing
 */

class ApiService {
    constructor(config = {}) {
        this.baseUrls = {
            speechToTextWithLLM: 'https://europe-west4-dulaan-backend.cloudfunctions.net/speechToTextWithLLM',
            storeUserData: 'https://europe-west4-dulaan-backend.cloudfunctions.net/storeUserData',
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
     * @param {Array} audioBuffer - Int16Array as regular array for JSON transmission
     * @param {number} currentPwm - Current PWM value
     * @param {Array} msgHis - Message history
     * @param {Object} options - Additional options
     */
    async speechToTextWithLLM(audioBuffer, currentPwm, msgHis = [], options = {}) {
        try {
            const requestOptions = { ...this.defaultOptions, ...options };
            
            const response = await fetch(this.baseUrls.speechToTextWithLLM, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    msgHis: msgHis,
                    audioBuffer: audioBuffer, // Send Int16Array as regular array
                    currentPwm: currentPwm,
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
export { ApiService, apiService };

// Global access
if (typeof window !== 'undefined') {
    window.apiService = apiService;
}