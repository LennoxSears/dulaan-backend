/**
 * AI Voice Control Mode
 * Natural conversation with motor control via voice commands
 * Based on working test-real-api.html implementation
 */

import { StreamingProcessor } from '../core/streaming-processor.js';
import { ApiService } from '../services/api-service.js';

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
            console.log(`[AUDIO CHUNK] Processing chunk: ${base64Chunk.length} chars`);
            const result = this.processor.processAudioChunk(base64Chunk);
            
            if (result) {
                // Update state with voice activity
                this.state.lastInteractionTime = Date.now();
                
                // Log voice activity for debugging
                console.log(`[VAD] Voice: ${result.isVoiceActive}, Energy: ${result.energy?.toFixed(4)}, ZCR: ${result.zeroCrossings?.toFixed(4)}`);
                
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

export { AIVoiceControl };