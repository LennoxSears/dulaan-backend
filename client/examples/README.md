# Dulaan SDK Web Examples

This directory contains comprehensive examples demonstrating how to integrate the Dulaan SDK in web applications. Each example focuses on specific features and use cases.

## 📁 Examples Overview

### 🔧 [Basic Integration](basic-integration.html)
**Difficulty: Beginner**
- Motor connection and disconnection
- Basic PWM control with sliders
- Quick intensity presets (25%, 50%, 75%, 100%)
- System information display
- Error handling basics

**Use Case:** Perfect starting point for new developers

### 🎮 [Remote Control](remote-control-example.html)
**Difficulty: Intermediate**
- Host and remote modes with 6-character IDs
- Real-time command transmission
- Pattern controls (pulse, wave)
- QR code sharing (simulated)
- Multi-user connection management

**Use Case:** Sharing device control between multiple users

### 🎤 [Voice Control](voice-control-example.html)
**Difficulty: Intermediate**
- AI-powered voice command recognition
- Multi-language support
- Command history and transcript display
- Audio level monitoring
- Voice command examples and patterns

**Use Case:** Hands-free device control

### 🌊 [Ambient Control](ambient-control-example.html)
**Difficulty: Advanced**
- Real-time frequency analysis and visualization
- Customizable audio processing presets
- Advanced filtering and response settings
- Audio statistics and monitoring
- Frequency-specific gain controls

**Use Case:** Music-reactive or environment-responsive control

### ⚠️ [Error Handling](error-handling-example.html)
**Difficulty: Intermediate**
- Comprehensive error simulation
- Automatic retry mechanisms
- Graceful degradation strategies
- Error logging and monitoring
- Recovery pattern demonstrations

**Use Case:** Building robust, production-ready applications

### 📱 [Mobile Responsive](mobile-responsive-example.html)
**Difficulty: Beginner**
- Touch-optimized interface
- Responsive grid layouts
- Mobile gestures and interactions
- Floating action buttons
- Dark mode support

**Use Case:** Mobile and tablet applications

### 🚀 [Production Integration](production-integration.html)
**Difficulty: Advanced**
- Complete production setup
- Analytics and monitoring
- Error tracking and reporting
- Performance optimization
- Batch processing and caching

**Use Case:** Enterprise and production deployments

## 🚀 Getting Started

1. **Start with Basic Integration** if you're new to the Dulaan SDK
2. **Choose examples based on your use case:**
   - Need remote control? → Remote Control Example
   - Want voice commands? → Voice Control Example
   - Building for mobile? → Mobile Responsive Example
   - Going to production? → Production Integration Example

## 🔧 Running the Examples

### Option 1: Use the Examples Index
Open [index.html](index.html) in your browser to see all examples with descriptions.

### Option 2: Direct Access
Navigate directly to any example file:
```
examples/basic-integration.html
examples/remote-control-example.html
examples/voice-control-example.html
// ... etc
```

### Option 3: Local Server
```bash
cd examples
python3 -m http.server 8000
# Open http://localhost:8000
```

## 📋 Prerequisites

All examples require:
- Modern web browser with ES6 support
- HTTPS connection (for microphone/Bluetooth access)
- The Dulaan SDK bundle (`../dulaan-browser.js`)

### For Voice Control:
- Microphone access permission
- Quiet environment for testing

### For Remote Control:
- Internet connection
- PeerJS server access

### For Bluetooth Features:
- Bluetooth-enabled device
- Bluetooth permissions
- Compatible motor device

## 🎯 Example Features Matrix

| Feature | Basic | Remote | Voice | Ambient | Error | Mobile | Production |
|---------|-------|--------|-------|---------|-------|--------|------------|
| Motor Control | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Remote Sharing | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Voice Commands | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Audio Analysis | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Error Handling | Basic | Basic | Basic | Basic | ✅ | Basic | ✅ |
| Mobile Optimized | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Analytics | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## 🔍 Code Patterns

### Initialization Pattern
```javascript
// Standard initialization across all examples
window.addEventListener('load', async () => {
    try {
        await window.dulaan.initialize();
        setupEventListeners();
        updateUI();
    } catch (error) {
        handleError('initialization', error);
    }
});
```

### Error Handling Pattern
```javascript
// Consistent error handling
async function performAction() {
    try {
        await window.dulaan.someAction();
        showSuccess('Action completed');
    } catch (error) {
        showError('Action failed: ' + error.message);
        logError('action_name', error);
    }
}
```

### UI Update Pattern
```javascript
// Consistent UI state management
function updateUI() {
    updateConnectionStatus();
    updateButtonStates();
    updateDisplayValues();
}
```

## 🎨 Customization

Each example can be customized by:

1. **Styling**: Modify CSS variables and classes
2. **Functionality**: Add/remove features based on needs
3. **Configuration**: Adjust settings and thresholds
4. **Integration**: Combine multiple examples

## 🐛 Troubleshooting

### Common Issues

1. **"SDK not loaded"**
   - Ensure `../dulaan-browser.js` exists
   - Check browser console for loading errors

2. **"Microphone permission denied"**
   - Enable microphone access in browser settings
   - Use HTTPS connection

3. **"Bluetooth not available"**
   - Check device Bluetooth support
   - Ensure secure context (HTTPS)

4. **"Remote connection failed"**
   - Check internet connection
   - Verify PeerJS server availability

### Debug Mode
Enable debug logging in any example:
```javascript
window.DEBUG_MODE = true;
```

## 📚 Learning Path

1. **Start Here:** Basic Integration
2. **Add Features:** Choose specific examples based on needs
3. **Handle Errors:** Error Handling Example
4. **Optimize:** Mobile Responsive + Production Integration
5. **Deploy:** Use Production Integration patterns

## 🤝 Contributing

To add new examples:

1. Create a new HTML file in this directory
2. Follow the existing code patterns
3. Add entry to `index.html`
4. Update this README
5. Test thoroughly

## 📖 Additional Resources

- [Main Documentation](../README.md)
- [Build Guide](../BUILD_GUIDE.md)
- [Full Demo](../remote-control-demo.html)
- [Test Suite](../test-bundle.html)

---

**Need help?** Check the main documentation or examine the existing examples for patterns and best practices.