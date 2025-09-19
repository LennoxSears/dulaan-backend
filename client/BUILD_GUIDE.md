# Dulaan Client Build Guide

## Overview

The Dulaan client SDK now uses a modular architecture with automated bundling. This allows for clean development with ES6 modules while maintaining browser compatibility through a single bundled file.

## Project Structure

```
client/
├── utils/                  # Utility functions and constants
│   ├── constants.js       # Configuration constants
│   └── audio-utils.js     # Audio processing utilities
├── core/                  # Core functionality
│   ├── motor-controller.js # BLE motor control
│   └── audio-processor.js  # Audio capture and processing
├── services/              # External services
│   ├── api-service.js     # API communication
│   ├── consent-service.js # User consent management
│   └── remote-service.js  # Remote control via WebRTC
├── modes/                 # Control modes
│   ├── ai-voice-control.js # AI voice control mode
│   ├── ambient-control.js  # Ambient audio control mode
│   └── touch-control.js    # Touch control mode
├── remote-control.js      # High-level remote control orchestration
├── dulaan-sdk.js          # Main SDK entry point
├── build.js               # Build script
├── package.json           # npm configuration
└── dulaan-browser.js      # Generated bundle (browser-ready)
```

## Development Workflow

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Development

Edit the modular files in their respective directories:
- `utils/` - Add new utility functions or constants
- `core/` - Modify core motor or audio functionality
- `services/` - Update API or service integrations
- `modes/` - Add or modify control modes
- `remote-control.js` - Update high-level remote control features
- `dulaan-sdk.js` - Update the main SDK interface

### 3. Build

Generate the browser-compatible bundle:

```bash
npm run build
```

This creates `dulaan-browser.js` from all modular sources.

### 4. Development Server

For continuous development with auto-rebuild:

```bash
npm run dev
```

This watches for file changes and rebuilds automatically.

### 5. Testing

Test your changes using the provided test files:
- `test-bundle.html` - Automated and manual tests
- `remote-control-demo.html` - Full demo application
- `test-consent.html` - Consent system testing

## Build Process

The build script (`build.js`) performs the following:

1. **File Processing Order**: Processes files in dependency order:
   - `utils/constants.js` - Configuration constants
   - `utils/audio-utils.js` - Audio utilities
   - `core/motor-controller.js` - Motor control
   - `core/audio-processor.js` - Audio processing
   - `services/api-service.js` - API communication
   - `services/consent-service.js` - Consent management
   - `services/remote-service.js` - Remote control
   - `modes/ai-voice-control.js` - AI voice mode
   - `modes/ambient-control.js` - Ambient mode
   - `modes/touch-control.js` - Touch mode
   - `remote-control.js` - High-level remote control
   - `dulaan-sdk.js` - Main SDK

2. **ES6 Module Conversion**: Converts ES6 import/export statements to browser-compatible code

3. **Global Exports**: Creates global window objects for all classes and functions

4. **Auto-initialization**: Automatically initializes the SDK and creates `window.dulaan`

5. **Backup**: Backs up the previous bundle as `dulaan-browser-old.js`

6. **HTML Updates**: Updates HTML files to use the new bundle

## Module Guidelines

### ES6 Module Format

Use standard ES6 import/export syntax in your modules:

```javascript
// Importing
import { AUDIO_CONFIG } from '../utils/constants.js';
import { AudioProcessor } from '../core/audio-processor.js';

// Exporting
export class MyNewService {
    // Implementation
}

export function myUtilityFunction() {
    // Implementation
}
```

### Dependencies

- List dependencies in the correct order in `build.js`
- Avoid circular dependencies
- Use relative imports with `.js` extensions

### Global Access

The build process automatically creates global window objects:
- Classes: `window.ClassName`
- Functions: `window.functionName`
- Main SDK: `window.dulaan`

## Remote Control Module

The `remote-control.js` module provides high-level orchestration for remote control functionality:

### Features
- **UI Integration**: Automatic DOM updates and button state management
- **Event Handling**: Simplified callbacks for connection events
- **Command Validation**: Input validation and error handling
- **Demo Utilities**: Ready-to-use demo functions and mock implementations
- **Clean Architecture**: Modern ES6 modules with clear separation of concerns

### Usage Examples

```javascript
// Import in ES6 modules
import { remoteControl } from './remote-control.js';

// Or use global instance (after bundle load)
const rc = window.remoteControl;

// Start as host with UI updates
const hostId = await rc.startAsHost();
console.log('Share this ID:', hostId);

// Connect to host
await rc.connectToHost('ABC123');

// Send commands (remote mode only)
await rc.sendCommand('manual', 128);
await rc.sendCommand('touch', 200, { touchValue: 78 });

// Setup UI callbacks
rc.setUICallbacks({
    onHostReady: (id) => alert(`Host ready: ${id}`),
    onConnectionStatusChange: (status) => updateStatusDisplay(status),
    onUserListUpdate: (users) => updateUserCount(users.length)
});

// Setup demo button handlers
rc.setupDemoHandlers();
```

### UI Integration

The module automatically updates DOM elements with these IDs:
- `hostId` - Displays the current host ID
- `connectionStatus` - Shows connection status with CSS classes
- `userCount` - Shows number of connected users
- `errorMessage` - Displays error messages
- `hostBtn`, `connectBtn`, `disconnectBtn` - Button state management

## Browser Usage

After building, use the bundle in HTML:

```html
<script src="dulaan-browser.js"></script>
<script>
    // SDK is automatically initialized
    const id = window.dulaan.generateId();
    window.dulaan.startRemoteControl(id);
    
    // Use high-level remote control
    const hostId = await window.remoteControl.startAsHost();
    await window.remoteControl.connectToHost('ABC123');
    
    // Or use individual components
    const motor = new window.MotorController();
    const audio = new window.AudioProcessor();
</script>
```

## Troubleshooting

### Build Errors

1. **Module not found**: Check file paths and ensure all imports use `.js` extensions
2. **Circular dependencies**: Restructure imports to avoid circular references
3. **Syntax errors**: Check ES6 syntax in individual modules

### Runtime Errors

1. **Class not defined**: Ensure the build completed successfully
2. **Function not available**: Check that the module exports the function correctly
3. **SDK not initialized**: The SDK auto-initializes, but check console for errors

### Development Tips

1. **Use the dev server**: `npm run dev` for automatic rebuilding
2. **Test frequently**: Use `test-bundle.html` to verify functionality
3. **Check console**: Build script provides detailed logging
4. **Backup important changes**: The build script creates backups automatically

## Performance

- **Bundle size**: ~69KB (compressed from modular sources)
- **Load time**: Single file load vs multiple module requests
- **Caching**: Browser can cache the single bundle file
- **Development**: Modular structure improves code organization and maintainability

## Development Best Practices

When working with the modular structure:

1. **Backup**: The build script automatically backs up `dulaan-browser.js`
2. **Test**: Use the test files to verify functionality after changes
3. **Update**: HTML files are automatically updated to use the new bundle
4. **Verify**: Check that all features work as expected after modifications

## Contributing

When adding new features:

1. Create new modules in the appropriate directory
2. Follow the existing code style and patterns
3. Add proper ES6 imports/exports
4. Update the build script if adding new top-level modules
5. Test the build and functionality
6. Update this documentation if needed

## Scripts Reference

- `npm run build` - Build the bundle once
- `npm run dev` - Build and watch for changes
- `npm run watch` - Watch for changes (alias for dev)

The build system ensures your modular development workflow remains clean while providing a production-ready browser bundle.