# Dulaan Client SDK

🚀 **NEW: Modular Architecture with Automated Bundling!**

This directory contains the Dulaan client SDK with a modern modular architecture that provides clean development while maintaining browser compatibility through automated bundling.

## 🏗️ Architecture Overview

### Modular Development Structure
```
client/
├── utils/                  # Utility functions and constants
├── core/                   # Core functionality (motor, audio)
├── services/              # External services (API, consent, remote)
├── modes/                 # Control modes (AI, ambient, touch)
├── dulaan-sdk.js          # Main SDK entry point
├── build.js               # Automated build system
└── dulaan-browser.js      # Generated browser bundle
```

### Key Benefits
- ✅ **Clean Development**: ES6 modules with proper imports/exports
- ✅ **Browser Compatible**: Single bundle file for production
- ✅ **Automated Building**: Watch mode for continuous development
- ✅ **6-Character IDs**: Simple remote control sharing
- ✅ **Professional Structure**: Organized, maintainable codebase

## 🚀 Quick Start

### For Developers
```bash
cd client
npm install
npm run dev    # Start development with auto-rebuild
```

### For Browser Integration
```html
<script src="dulaan-browser.js"></script>
<script>
    // SDK auto-initializes
    const id = window.dulaan.generateId(); // 6-character ID
    window.dulaan.startRemoteControl(id);
</script>
```

## 📁 File Structure

### Core Files (v2.0 - Modular Architecture)
- **`dulaan-browser.js`** - 📦 Complete browser-compatible SDK bundle (69KB)
- **`dulaan-sdk.js`** - 🎯 Main SDK entry point (ES6 module)
- **`build.js`** - 🔨 Automated build system with watch mode
- **`package.json`** - 📋 npm configuration and build scripts
- **`BUILD_GUIDE.md`** - 📖 Complete development guide

### Modular Source Files
- **`core/`** - 🔧 Core functionality (motor control, audio processing)
- **`services/`** - 🌐 External services (API, consent, remote control)
- **`modes/`** - 🎮 Control modes (AI voice, ambient, touch)
- **`remote-control.js`** - 🎯 High-level remote control orchestration
- **`utils/`** - 🛠️ Utilities and constants

### Demo & Testing
- **`remote-control-demo.html`** - 🎮 Interactive demo for testing all features
- **`test-bundle.html`** - 🧪 Automated tests for bundle verification
- **`test-remote-control.html`** - 🎯 Dedicated remote control module testing



## 🎯 Development Workflow

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
```bash
npm run dev    # Auto-rebuild on file changes
```

### 3. Build for Production
```bash
npm run build  # Generate dulaan-browser.js
```

### 4. Test Your Changes
Open `test-bundle.html` or `remote-control-demo.html` to verify functionality.

## ✨ Key Features

### 🏗️ Modular Architecture
- **ES6 Modules**: Clean imports/exports for development
- **Automated Bundling**: Single browser-compatible file
- **Watch Mode**: Continuous rebuilding during development
- **Dependency Management**: Proper file processing order

### 🔄 API Integration
- **Speech-to-Text**: Integrated with Google Cloud Functions instead of Deepgram
- **LLM Processing**: Uses the new `speechToTextWithLLM` endpoint
- **Automatic Language Detection**: Supports 30+ languages
- **Error Handling**: Comprehensive error handling and fallbacks

### 🎮 Remote Control System
- **6-Character IDs**: Simple, memorable sharing codes (e.g., "A1B2C3")
- **Host Mode**: Device owner shares unique ID for remote access
- **Remote Mode**: Users connect to host via ID to control device
- **Multi-user Support**: Multiple remote users can control one device
- **Real-time Communication**: Uses PeerJS for WebRTC peer-to-peer connections

### 🎛️ Control Modes
All three control modes work both locally and remotely:

1. **AI Voice Control** (`startStreaming`/`remoteStartStreaming`)
   - Voice commands → Speech-to-Text → LLM → PWM control
   - Automatic language detection
   - Message history management

2. **Ambient Sound Control** (`startAbi`/`remoteStartAbi`)
   - Real-time audio energy → PWM control
   - Configurable energy thresholds
   - Continuous audio processing

3. **Touch Control** (`startTouch`/`remoteStartTouch`)
   - Touch input → PWM control
   - Real-time slider control
   - Percentage to PWM conversion

## 🔧 Integration Guide

### 1. Browser Integration

Add to your HTML:
```html
<!-- PeerJS for remote control -->
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>

<!-- Dulaan SDK (auto-initializes) -->
<script src="dulaan-browser.js"></script>
```

### 2. Development Integration

For modular development:
```javascript
// In your ES6 modules
import { DulaanSDK } from './dulaan-sdk.js';
import { MotorController } from './core/motor-controller.js';

const sdk = new DulaanSDK();
```

### 3. Basic Usage

```javascript
// SDK is automatically initialized when script loads
// Generate a 6-character ID for remote control
const id = window.dulaan.generateId(); // Returns: "A1B2C3"
console.log('Share this ID:', id);

// High-level remote control (recommended)
const hostId = await window.remoteControl.startAsHost();
await window.remoteControl.connectToHost('A1B2C3');
await window.remoteControl.sendCommand('manual', 128);

// Or use SDK methods
window.dulaan.startRemoteControl(id);
window.dulaan.connectToRemote('A1B2C3');

// Initialize Bluetooth connection
await window.dulaan.connect();
```

### 3. Control Modes

#### Local Control
```javascript
// AI Voice Control
await window.startStreaming();
await window.stopStreaming();

// Ambient Sound Control
await window.startAbi();
await window.stopAbi();

// Touch Control
window.touchValue = 50; // 0-100%
await window.startTouch();
await window.stopTouch();
```

#### Remote Control
```javascript
// Same functions with 'remote' prefix
await window.remoteStartStreaming();
await window.remoteStartAbi();
await window.remoteStartTouch();

// Manual remote command
window.sendRemoteCommand('touch', 128); // PWM 0-255
```

## API Configuration

### Cloud Functions Endpoints

Update the API endpoints in `dulaan-browser.js`:

```javascript
// Production endpoints
const SPEECH_TO_TEXT_API = 'https://europe-west1-dulaan-backend.cloudfunctions.net/speechToText';
const SPEECH_TO_TEXT_LLM_API = 'https://europe-west1-dulaan-backend.cloudfunctions.net/speechToTextWithLLM';

// PeerJS Server
const PEERJS_SERVER = {
    host: 'dulaan-backend.ew.r.appspot.com',
    port: 443,
    path: '/peerjs',
    secure: true
};
```

### API Keys

Configure your API keys:
```javascript
// In dulaan-browser.js - speechToTextWithLLM function
const GEMINI_API_KEY = 'your-gemini-api-key-here';
```

## Remote Control Architecture

### Connection Flow
```
1. User A (Host): Starts host mode → Gets unique ID
2. User B (Remote): Connects using Host ID
3. User B: Uses control modes → Commands sent via PeerJS
4. User A: Receives commands → Controls motor
5. User A: Loses local control while remote users connected
```

### Message Protocol
```javascript
{
  type: 'control_command',
  mode: 'ai|ambient|touch|manual',
  value: 0-255, // PWM value
  userId: 'remote-user-id',
  timestamp: Date.now(),
  // Additional mode-specific data
  transcript?: 'voice command text',
  touchValue?: 50, // percentage
  energy?: 0.05 // audio energy
}
```

## UI Integration Examples

### Host Mode UI
```javascript
// Start as host
const hostId = window.startRemoteHost();

// Display host ID to user
document.getElementById('hostId').textContent = hostId;

// Show connected users
window.updateRemoteUsers = () => {
    const users = window.getRemoteControlStatus().connectedUsers;
    document.getElementById('userCount').textContent = users.length;
};
```

### Remote Mode UI
```javascript
// Connect to host
const hostId = prompt('Enter Host ID:');
window.connectToRemoteHost(hostId);

// Update connection status
window.updateRemoteConnectionStatus = (connected, error) => {
    const status = connected ? 'Connected' : `Disconnected: ${error || ''}`;
    document.getElementById('status').textContent = status;
};
```

### Control Mode UI
```javascript
// AI Control
document.getElementById('aiBtn').onclick = async () => {
    if (window.remoteControl.isRemote) {
        await window.remoteStartStreaming();
    } else {
        await window.startStreaming();
    }
};

// Touch Control
document.getElementById('touchSlider').oninput = (e) => {
    window.touchValue = parseInt(e.target.value);
    // Control will be sent automatically via syncInterval
};
```

## Error Handling

### API Errors
```javascript
try {
    const result = await window.dulaan.speechToTextWithLLM(audioData, pwm, msgHis);
    // Handle success
} catch (error) {
    console.error('API Error:', error);
    // Fallback to previous PWM value or safe state
    window.dulaan.write(0);
}
```

### Connection Errors
```javascript
// PeerJS connection error handling
window.remoteControl.peer.on('error', (error) => {
    console.error('PeerJS Error:', error);
    // Show user-friendly error message
    showErrorMessage('Connection failed. Please try again.');
});
```

### Bluetooth Errors
```javascript
// Bluetooth disconnection handling
let onDisconnect = (deviceId) => {
    clearInterval(window.controlInterval);
    clearInterval(window.syncInterval);
    window.connectFlag = false;
    
    // Stop all control modes
    window.stopStreaming();
    window.stopAbi();
    window.stopTouch();
    
    console.log(`Device ${deviceId} disconnected`);
};
```

## Testing

### Local Testing
1. Open `remote-control-demo.html` in two browser tabs
2. Start one as host, copy the ID
3. Connect the other as remote using the ID
4. Test all control modes

### Device Testing
1. Deploy to your hybrid app
2. Test Bluetooth connectivity
3. Test each control mode locally
4. Test remote control between devices
5. Test multi-user scenarios

## Performance Considerations

### Audio Processing
- **Buffer Management**: Ring buffers prevent memory leaks
- **Silence Detection**: Reduces unnecessary API calls
- **Chunk Processing**: Optimized for real-time performance

### Network Optimization
- **PeerJS**: Direct peer-to-peer connections reduce latency
- **Message Throttling**: Control commands are rate-limited
- **Automatic Reconnection**: Handles network interruptions

### Battery Optimization
- **Interval Management**: Proper cleanup of timers
- **Audio Streaming**: Stops when not needed
- **Bluetooth**: Efficient write operations

## Security Considerations

### API Security
- **HTTPS**: All API calls use secure connections
- **API Keys**: Store securely, consider environment variables
- **Input Validation**: All inputs validated before processing

### Remote Control Security
- **Unique IDs**: Host IDs are cryptographically random
- **Peer Discovery**: Disabled by default on PeerJS server
- **Connection Limits**: Consider implementing rate limiting

### Device Security
- **Bluetooth**: Secure pairing and communication
- **Local Control**: Host retains ability to disconnect
- **Emergency Stop**: Always available regardless of remote state

## Troubleshooting

### Common Issues

1. **"Cannot find module 'peerjs'"**
   - Ensure PeerJS script is loaded before your code
   - Check network connectivity to CDN

2. **"Speech recognition failed"**
   - Check microphone permissions
   - Verify API endpoints are accessible
   - Check API key configuration

3. **"Remote connection failed"**
   - Verify PeerJS server is running
   - Check firewall settings
   - Ensure both users have internet connectivity

4. **"Bluetooth connection lost"**
   - Check device proximity
   - Verify device is powered on
   - Restart Bluetooth if necessary

### Debug Mode

Enable debug logging:
```javascript
// In dulaan-browser.js
window.DEBUG_MODE = true;

// Enhanced logging
const log = (message, data = null) => {
    if (window.DEBUG_MODE) {
        console.log(`[Dulaan] ${message}`, data);
    }
};
```

## Migration from Old Version

### API Changes
1. Replace Deepgram calls with `window.dulaan.speechToText()`
2. Replace direct Gemini calls with `window.dulaan.speechToTextWithLLM()`
3. Update error handling for new API responses

### Remote Control Addition
1. Add PeerJS dependency
2. Initialize remote control system
3. Update control mode functions to support remote operation
4. Add UI for host/remote mode switching

### Configuration Updates
1. Update API endpoints to Cloud Functions
2. Configure PeerJS server settings
3. Update API keys and security settings

This integration provides a clean, modern API for motor control functionality.