/**
 * Remote Control - High-level remote control orchestration and UI helpers
 * Provides simplified API for common remote control workflows and demo functionality
 */

import { remoteService } from './services/remote-service.js';
import { motorController } from './core/motor-controller.js';
import { UTILS } from './utils/constants.js';

export class RemoteControl {
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
export const remoteControl = new RemoteControl();

// Export class and instance
export { RemoteControl };

// Global access
if (typeof window !== 'undefined') {
    window.remoteControl = remoteControl;
}