/**
 * Optimized AI Voice Control Mode
 * Natural conversation with minimal API overhead
 */

import { OptimizedStreamingProcessor } from '../core/optimized-streaming-processor.js';
import { OptimizedApiService } from '../services/optimized-api-service.js';

class OptimizedAIVoiceControl {
    constructor(config = {}) {
        this.config = {
            // Conversation flow optimization
            responseTimeout: 3000, // 3 seconds max wait for response
            conversationTimeout: 30000, // 30 seconds of silence ends conversation
            immediateCommandKeywords: ['stop', 'emergency', 'halt', 'now'],
            
            // Motor control optimization
            pwmUpdateThreshold: 5, // Only update if PWM changes by 5+
            motorResponseDelay: 100, // 100ms delay for motor commands
            
            // UI optimization
            updateInterval: 100, // Update UI every 100ms
            notificationDuration: 2000, // 2 second notifications
            
            ...config
        };

        // Core components
        this.processor = new OptimizedStreamingProcessor();
        this.apiService = new OptimizedApiService();
        
        // State management
        this.state = {
            isActive: false,
            isListening: false,
            isProcessing: false,
            conversationActive: false,
            currentPwm: 100,
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
        // Processor callbacks
        this.processor.setCallbacks({
            onSpeechReady: async (speechPacket) => {
                await this.handleSpeechReady(speechPacket);
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
            this.updatePerformanceStats(processingTime);
            
            console.log(`[API Response] Processed in ${processingTime}ms: "${response.transcription}"`);
            
        } catch (error) {
            console.error("Speech processing failed:", error);
            this.showNotification("⚠️ Speech processing failed", "warning");
        }
    }

    /**
     * Handle voice state changes
     */
    handleVoiceStateChange(voiceState) {
        this.state.isListening = voiceState.isActive;
        this.state.lastInteractionTime = Date.now();
        
        if (voiceState.isActive) {
            this.showNotification("🎙️ Listening...", "info", 1000);
        } else if (voiceState.duration) {
            const durationMs = voiceState.duration;
            this.showNotification(`✅ Speech captured (${(durationMs/1000).toFixed(1)}s)`, "success", 1500);
        }
        
        this.updateUI();
    }

    /**
     * Handle conversation state updates
     */
    handleConversationUpdate(active) {
        this.state.conversationActive = active;
        
        if (active) {
            this.processor.setConversationActive(true);
            this.showNotification("💬 Conversation active", "success");
        } else {
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
                this.updateMotorPwm(response.newPwmValue);
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
    updateMotorPwm(newPwm) {
        const oldPwm = this.state.currentPwm;
        this.state.currentPwm = newPwm;
        
        // Add small delay for motor response
        setTimeout(() => {
            console.log(`[Motor] PWM: ${oldPwm} → ${newPwm}`);
            this.showNotification(`⚙️ Motor: ${newPwm}`, "info", 1500);
        }, this.config.motorResponseDelay);
        
        this.updateUI();
    }

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
     * Start audio processing (placeholder - implement with actual audio API)
     */
    async startAudioProcessing() {
        // This would integrate with actual audio capture
        console.log("[Audio] Starting optimized audio processing");
        this.state.isListening = true;
    }

    /**
     * Stop audio processing
     */
    async stopAudioProcessing() {
        console.log("[Audio] Stopping audio processing");
        this.state.isListening = false;
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
        this.state.currentPwm = 100;
        
        this.processor.reset();
        this.apiService.reset();
        
        console.log("[Optimized Voice] State reset");
        this.updateUI();
    }
}

export { OptimizedAIVoiceControl };