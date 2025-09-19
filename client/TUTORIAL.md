# Dulaan SDK Tutorial

Complete guide to using the Dulaan SDK for motor control in web applications.

## 🚀 Quick Start

### 1. Include the SDK

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Dulaan App</title>
</head>
<body>
    <!-- Include PeerJS for remote control (optional) -->
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    
    <!-- Include Dulaan SDK -->
    <script src="dulaan-browser.js"></script>
    
    <script>
        // Your code here - SDK is automatically initialized
    </script>
</body>
</html>
```

### 2. Basic Usage

```javascript
// SDK is automatically available as window.dulaan
console.log('SDK Version:', window.dulaan.version);

// Generate a 6-character ID
const id = window.dulaan.generateId(); // Returns: "A1B2C3"
console.log('Generated ID:', id);
```

## 🔧 Motor Control

### Basic Motor Operations

```javascript
// Connect to motor (requires device address)
await window.dulaan.connect('your-device-address');

// Check connection status
const isConnected = window.dulaan.isConnected();

// Send PWM value (0-255)
await window.dulaan.setPower(128); // 50% intensity

// Disconnect motor
await window.dulaan.disconnect();
```

### PWM Control Examples

```javascript
// Different intensity levels
await window.dulaan.writeMotor(0);    // Stop
await window.dulaan.writeMotor(64);   // Low (25%)
await window.dulaan.writeMotor(128);  // Medium (50%)
await window.dulaan.writeMotor(192);  // High (75%)
await window.dulaan.writeMotor(255);  // Maximum (100%)

// Convert percentage to PWM
function percentToPWM(percent) {
    return Math.round((percent / 100) * 255);
}

await window.dulaan.setPower(percentToPWM(75)); // 75% = 191 PWM
```

### Error Handling

```javascript
async function safeMotorControl(pwmValue) {
    try {
        await window.dulaan.setPower(pwmValue);
        console.log(`Motor set to ${pwmValue}`);
    } catch (error) {
        console.error('Motor control failed:', error.message);
        
        // Handle specific errors
        if (error.name === 'NotConnectedError') {
            console.log('Motor not connected, attempting to connect...');
            // Retry logic here
        }
    }
}
```

## 🎮 Remote Control

### Simple Remote Control

```javascript
// Start hosting and get ID
const hostId = await window.dulaan.startHost();
console.log('Share this ID:', hostId); // Share with others

// Connect to someone else's device
await window.dulaan.connectToHost('ABC123');

// Send remote commands
await window.dulaan.sendCommand('manual', 128);
```

### Advanced Remote Control

```javascript
// Use the high-level remote control module
const rc = window.remoteControl;

// Start as host
const hostId = await rc.startAsHost();
console.log('Host ID:', hostId);

// Set up event callbacks
rc.setUICallbacks({
    onHostReady: (id) => console.log('Host ready:', id),
    onRemoteConnected: (userId) => console.log('User connected:', userId),
    onRemoteDisconnected: (userId) => console.log('User disconnected:', userId),
    onConnectionStatusChange: (status) => console.log('Status:', status),
    onError: (message, error) => console.error('Error:', message, error)
});

// Connect to host
await rc.connectToHost('ABC123');

// Send commands with metadata
await rc.sendCommand('manual', 128, {
    timestamp: Date.now(),
    source: 'web_interface'
});

// Get connection status
const status = rc.getStatus();
console.log('Connected users:', status.connectedUsers.length);
console.log('Is connected:', status.isConnected);
```

### Remote Control Events

```javascript
// Listen for remote commands (host side)
window.remoteControl.setUICallbacks({
    onRemoteCommand: (data, userId) => {
        console.log(`Command from ${userId}:`, data);
        
        // Execute the command
        if (data.mode === 'manual') {
            window.dulaan.writeMotor(data.value);
        }
    }
});
```

## 🎤 Voice Control

### Basic Voice Control

```javascript
// Start voice control mode
await window.dulaan.startMode('ai');

// Stop current mode
await window.dulaan.stopMode();

// Check current mode
const currentMode = window.dulaan.getCurrentMode();
```

### Voice Control with Custom Settings

```javascript
// Configure voice control
const voiceConfig = {
    language: 'en-US',
    sensitivity: 0.8,
    maxEnergy: 0.075
};

await window.dulaan.startMode('ai');

// Voice commands that work:
// "Set to low" -> PWM 64
// "Medium intensity" -> PWM 128  
// "High power" -> PWM 192
// "Maximum strength" -> PWM 255
// "Turn off" -> PWM 0
// "Set to 75 percent" -> PWM 191
```

### Voice Control Events

```javascript
// Listen for voice events
window.dulaan.modes.ai.setCallbacks({
    onTranscript: (text) => console.log('Heard:', text),
    onCommand: (command) => console.log('Command:', command),
    onError: (error) => console.error('Voice error:', error)
});
```

## 🌊 Ambient Control

### Basic Ambient Control

```javascript
// Start ambient sound control
await window.dulaan.startMode('ambient');

// Stop ambient control
await window.dulaan.stopMode();

// The motor will respond to ambient sound levels automatically
```

### Ambient Control Configuration

```javascript
// Configure ambient sensitivity
const ambientConfig = {
    sensitivity: 0.6,        // Microphone sensitivity (0-1)
    threshold: 0.05,         // Minimum energy to trigger (0-1)
    maxEnergy: 0.075,        // Maximum energy level (0-1)
    responseSpeed: 100,      // Response time in milliseconds
    smoothing: 0.3          // Audio smoothing (0-1)
};

await window.dulaan.startMode('ambient');
```

### Ambient Control Events

```javascript
// Monitor ambient audio
window.dulaan.modes.ambient.setCallbacks({
    onEnergyUpdate: (energy, pwm) => {
        console.log(`Energy: ${energy.toFixed(3)}, PWM: ${pwm}`);
    },
    onFrequencyData: (frequencies) => {
        // frequencies is an array of frequency amplitudes
        console.log('Frequency data:', frequencies);
    }
});
```

## 🎯 Touch Control

### Basic Touch Control

```javascript
// Start touch control mode
await window.dulaan.startMode('touch');

// Update touch value directly
await window.dulaan.setPower(128); // 0-255 PWM value

// Stop touch control
await window.dulaan.stopMode();
```

### Touch Control with UI

```html
<input type="range" id="touchSlider" min="0" max="100" value="0">
<script>
document.getElementById('touchSlider').oninput = function() {
    window.dulaan.touchValue = parseInt(this.value);
};

// Start touch mode
await window.dulaan.modes.touch.start();
</script>
```

## 🔧 Advanced Usage

### Using Individual Components

```javascript
// Access individual components
const motor = new window.MotorController();
const audio = new window.AudioProcessor();
const api = new window.APIService();
const remote = new window.RemoteService();

// Motor controller
await motor.initialize();
await motor.connect('device-address');
await motor.write(128);

// Audio processor
const audioData = await audio.captureAudio();
const energy = audio.calculateEnergy(audioData);

// API service
const response = await api.speechToText(audioData);
```

### Custom Control Modes

```javascript
// Create custom control pattern
async function pulsePattern() {
    let intensity = 0;
    let direction = 1;
    
    const interval = setInterval(async () => {
        intensity += direction * 25;
        
        if (intensity >= 255) {
            intensity = 255;
            direction = -1;
        } else if (intensity <= 0) {
            intensity = 0;
            direction = 1;
        }
        
        await window.dulaan.writeMotor(intensity);
    }, 200);
    
    // Stop after 10 seconds
    setTimeout(() => clearInterval(interval), 10000);
}

// Start custom pattern
await pulsePattern();
```

### Configuration and Settings

```javascript
// Access configuration constants
const config = window.DULAAN_CONSTANTS;
console.log('BLE Config:', config.BLE_CONFIG);
console.log('Audio Config:', config.AUDIO_CONFIG);
console.log('Remote Config:', config.REMOTE_CONFIG);

// Modify settings
config.AUDIO_CONFIG.MAX_ENERGY = 0.1; // Increase sensitivity
config.REMOTE_CONFIG.HEARTBEAT_INTERVAL = 60000; // 1 minute heartbeat
```

## 🛡️ Error Handling Patterns

### Comprehensive Error Handling

```javascript
class DulaanErrorHandler {
    constructor() {
        this.retryAttempts = new Map();
        this.maxRetries = 3;
    }
    
    async safeExecute(operation, ...args) {
        const operationName = operation.name;
        const attempts = this.retryAttempts.get(operationName) || 0;
        
        try {
            const result = await operation(...args);
            this.retryAttempts.delete(operationName); // Reset on success
            return result;
        } catch (error) {
            console.error(`Operation ${operationName} failed:`, error);
            
            if (attempts < this.maxRetries && this.isRetryable(error)) {
                this.retryAttempts.set(operationName, attempts + 1);
                const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
                
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.safeExecute(operation, ...args);
            } else {
                this.handleFinalError(operationName, error);
                throw error;
            }
        }
    }
    
    isRetryable(error) {
        const retryableErrors = ['NetworkError', 'TimeoutError', 'ConnectionError'];
        return retryableErrors.includes(error.name);
    }
    
    handleFinalError(operation, error) {
        console.error(`Final error for ${operation}:`, error);
        // Send to error reporting service
        // Show user-friendly error message
        // Implement fallback strategy
    }
}

// Usage
const errorHandler = new DulaanErrorHandler();

// Safe motor control
await errorHandler.safeExecute(window.dulaan.writeMotor, 128);

// Safe connection
await errorHandler.safeExecute(window.dulaan.connectMotor, 'device-address');
```

### Graceful Degradation

```javascript
async function initializeWithFallbacks() {
    try {
        // Try full functionality
        await window.dulaan.connectMotor('device-address');
        await window.dulaan.modes.ai.start();
        console.log('Full functionality available');
    } catch (error) {
        console.warn('Full functionality failed, trying fallbacks...');
        
        try {
            // Fallback: Motor only
            await window.dulaan.connectMotor('device-address');
            console.log('Motor control available, voice control disabled');
        } catch (motorError) {
            console.warn('Motor connection failed, demo mode only');
            // Demo mode - simulate motor responses
            window.dulaan.writeMotor = async (value) => {
                console.log(`Demo mode: Would set motor to ${value}`);
            };
        }
    }
}
```

## 📱 Mobile Optimization

### Touch-Friendly Controls

```html
<style>
/* Touch-friendly button sizing */
.touch-btn {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 24px;
    font-size: 18px;
}

/* Larger slider thumbs for mobile */
input[type="range"] {
    height: 12px;
}

input[type="range"]::-webkit-slider-thumb {
    width: 32px;
    height: 32px;
}
</style>

<button class="touch-btn" onclick="setMotor(0)">Stop</button>
<button class="touch-btn" onclick="setMotor(128)">Medium</button>
<button class="touch-btn" onclick="setMotor(255)">Max</button>

<script>
async function setMotor(value) {
    await window.dulaan.writeMotor(value);
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}
</script>
```

### Mobile-Specific Features

```javascript
// Handle device orientation
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // Recalculate layout
        updateUI();
    }, 100);
});

// Handle app backgrounding
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause intensive operations
        window.dulaan.modes.ambient.stop();
    } else {
        // Resume operations
        updateConnectionStatus();
    }
});

// Prevent zoom on double-tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
```

## 🚀 Production Deployment

### Performance Optimization

```javascript
// Batch operations for better performance
class BatchProcessor {
    constructor(batchSize = 10, flushInterval = 1000) {
        this.batch = [];
        this.batchSize = batchSize;
        this.flushInterval = flushInterval;
        
        setInterval(() => this.flush(), flushInterval);
    }
    
    add(operation) {
        this.batch.push(operation);
        
        if (this.batch.length >= this.batchSize) {
            this.flush();
        }
    }
    
    flush() {
        if (this.batch.length === 0) return;
        
        const operations = [...this.batch];
        this.batch = [];
        
        // Process batch
        this.processBatch(operations);
    }
    
    processBatch(operations) {
        // Implement batch processing logic
        console.log('Processing batch:', operations.length);
    }
}
```

### Analytics Integration

```javascript
// Track usage analytics
class DulaanAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.events = [];
    }
    
    track(event, data = {}) {
        const eventData = {
            timestamp: Date.now(),
            sessionId: this.sessionId,
            event: event,
            data: data
        };
        
        this.events.push(eventData);
        this.sendToAnalytics(eventData);
    }
    
    async sendToAnalytics(data) {
        // Send to your analytics service
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Usage
const analytics = new DulaanAnalytics();

// Track events
analytics.track('motor_connected');
analytics.track('pwm_changed', { value: 128 });
analytics.track('voice_command', { command: 'set to medium' });
```

## 🔍 Debugging and Testing

### Debug Mode

```javascript
// Enable debug logging
window.DEBUG_MODE = true;

// All SDK operations will now log detailed information
await window.dulaan.writeMotor(128);
// Console: [DEBUG] Motor write: 128 PWM
```

### Testing Utilities

```javascript
// Create mock implementations for testing
function createMockDulaan() {
    return {
        generateId: () => 'TEST01',
        connectMotor: async () => console.log('Mock: Motor connected'),
        writeMotor: async (value) => console.log(`Mock: PWM ${value}`),
        isMotorConnected: () => true,
        modes: {
            ai: {
                start: async () => console.log('Mock: Voice started'),
                stop: async () => console.log('Mock: Voice stopped')
            }
        }
    };
}

// Use in tests
if (window.location.hostname === 'localhost') {
    window.dulaan = createMockDulaan();
}
```

## 📚 Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Complete Dulaan App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        button { padding: 12px 24px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; }
        .primary { background: #007bff; color: white; }
        .secondary { background: #6c757d; color: white; }
        input[type="range"] { width: 100%; margin: 10px 0; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .connected { background: #d4edda; color: #155724; }
        .disconnected { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h1>🚀 Dulaan Control Panel</h1>
    
    <!-- Connection Status -->
    <div id="status" class="status disconnected">Disconnected</div>
    
    <!-- Motor Control -->
    <h2>🔧 Motor Control</h2>
    <button class="primary" onclick="connectMotor()">Connect</button>
    <button class="secondary" onclick="disconnectMotor()">Disconnect</button>
    
    <!-- PWM Control -->
    <h2>🎚️ Intensity Control</h2>
    <label>PWM Value: <span id="pwmValue">0</span></label>
    <input type="range" id="pwmSlider" min="0" max="255" value="0" oninput="updatePWM()">
    
    <!-- Quick Controls -->
    <h2>⚡ Quick Controls</h2>
    <button onclick="setPWM(0)">Stop</button>
    <button onclick="setPWM(64)">Low</button>
    <button onclick="setPWM(128)">Medium</button>
    <button onclick="setPWM(192)">High</button>
    <button onclick="setPWM(255)">Max</button>
    
    <!-- Remote Control -->
    <h2>🌐 Remote Control</h2>
    <div>Host ID: <span id="hostId">-</span></div>
    <button class="primary" onclick="startHost()">Start Host</button>
    <input type="text" id="remoteId" placeholder="Enter Host ID" maxlength="6">
    <button onclick="connectRemote()">Connect to Host</button>
    
    <!-- Control Modes -->
    <h2>🎮 Control Modes</h2>
    <button onclick="startVoice()">🎤 Voice Control</button>
    <button onclick="startAmbient()">🌊 Ambient Control</button>
    <button onclick="stopAllModes()">⏹️ Stop All</button>

    <!-- Include SDK -->
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <script src="dulaan-browser.js"></script>
    
    <script>
        // Global state
        let isConnected = false;
        let hostId = null;
        
        // Initialize
        window.addEventListener('load', () => {
            console.log('Dulaan SDK loaded');
            updateStatus();
        });
        
        // Motor functions
        async function connectMotor() {
            try {
                // In real app, get device address from user or scan
                const deviceAddress = prompt('Enter device address (or leave empty for demo):');
                
                if (deviceAddress) {
                    await window.dulaan.connect(deviceAddress);
                } else {
                    console.log('Demo mode: Motor connection simulated');
                }
                
                isConnected = true;
                updateStatus();
                showMessage('Motor connected successfully');
            } catch (error) {
                showMessage('Connection failed: ' + error.message, true);
            }
        }
        
        async function disconnectMotor() {
            try {
                await window.dulaan.disconnect();
                isConnected = false;
                updateStatus();
                showMessage('Motor disconnected');
            } catch (error) {
                showMessage('Disconnection failed: ' + error.message, true);
            }
        }
        
        // PWM functions
        function updatePWM() {
            const value = document.getElementById('pwmSlider').value;
            document.getElementById('pwmValue').textContent = value;
        }
        
        async function setPWM(value) {
            if (!isConnected) {
                showMessage('Motor not connected', true);
                return;
            }
            
            try {
                await window.dulaan.setPower(value);
                document.getElementById('pwmSlider').value = value;
                document.getElementById('pwmValue').textContent = value;
                showMessage(`PWM set to ${value}`);
            } catch (error) {
                showMessage('PWM failed: ' + error.message, true);
            }
        }
        
        // Remote control functions
        async function startHost() {
            try {
                hostId = await window.remoteControl.startAsHost();
                document.getElementById('hostId').textContent = hostId;
                showMessage(`Host started: ${hostId}`);
            } catch (error) {
                showMessage('Host start failed: ' + error.message, true);
            }
        }
        
        async function connectRemote() {
            const remoteId = document.getElementById('remoteId').value.toUpperCase();
            
            if (!remoteId || remoteId.length !== 6) {
                showMessage('Please enter a valid 6-character Host ID', true);
                return;
            }
            
            try {
                await window.remoteControl.connectToHost(remoteId);
                showMessage(`Connected to host: ${remoteId}`);
            } catch (error) {
                showMessage('Remote connection failed: ' + error.message, true);
            }
        }
        
        // Control mode functions
        async function startVoice() {
            try {
                await window.dulaan.startMode('ai');
                showMessage('Voice control started - try saying "set to medium"');
            } catch (error) {
                showMessage('Voice control failed: ' + error.message, true);
            }
        }
        
        async function startAmbient() {
            try {
                await window.dulaan.startMode('ambient');
                showMessage('Ambient control started - make some noise!');
            } catch (error) {
                showMessage('Ambient control failed: ' + error.message, true);
            }
        }
        
        async function stopAllModes() {
            try {
                await window.dulaan.stopMode();
                showMessage('All control modes stopped');
            } catch (error) {
                showMessage('Stop failed: ' + error.message, true);
            }
        }
        
        // UI functions
        function updateStatus() {
            const statusEl = document.getElementById('status');
            if (isConnected) {
                statusEl.textContent = 'Connected to motor';
                statusEl.className = 'status connected';
            } else {
                statusEl.textContent = 'Disconnected from motor';
                statusEl.className = 'status disconnected';
            }
        }
        
        function showMessage(message, isError = false) {
            console.log(message);
            // You could show a toast notification here
            if (isError) {
                console.error(message);
            }
        }
        
        // Auto-uppercase remote ID input
        document.getElementById('remoteId').addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    </script>
</body>
</html>
```

This tutorial covers everything you need to know to use the Dulaan SDK effectively in your web applications! 🎉