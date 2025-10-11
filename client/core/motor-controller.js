/**
 * Motor Controller - Core BLE communication and motor control
 * Handles low-level hardware communication with the motor device
 */

// BleClient and hexStringToDataView are expected to be available globally
// via Capacitor plugins or browser environment

// Helper function for hexStringToDataView if not available
function hexStringToDataView(hexString) {
    if (typeof window !== 'undefined' && window.hexStringToDataView) {
        return window.hexStringToDataView(hexString);
    }
    
    // Fallback implementation
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return new DataView(bytes.buffer);
}

// Helper function to get BleClient safely
function getBleClient() {
    if (typeof window !== 'undefined') {
        return window.BleClient ||
               null;
    }
    return null;
}

class MotorController {
    constructor() {
        this.deviceAddress = null;
        this.isConnected = false;
        this.currentPwm = 0; // Motor starts stopped
        this.isScanning = false;
        this.scanResults = [];
        this.onScanResult = null;
        this.onDisconnect = null;
        
        // Remote control integration
        this.remoteService = null;
        this.remotePwm = 0; // PWM value when acting as remote
        
        // BLE service and characteristic UUIDs
        this.SERVICE_UUID = "0000FFE0-0000-1000-8000-00805F9B34FB";
        this.CHARACTERISTIC_UUID = "0000FFE1-0000-1000-8000-00805F9B34FB";
        
        // Device identification
        this.TARGET_DEVICE_NAME = "XKL-Q086-BT";
        this.SCAN_TIMEOUT = 10000; // 10 seconds default
    }

    /**
     * Initialize BLE and connect to device
     */
    async initialize() {
        try {
            const BleClient = getBleClient();
            if (!BleClient) {
                console.warn('BleClient not available - using mock mode');
                return true;
            }
            
            await BleClient.initialize();
            console.log('BLE initialized');
            
            // Check if Bluetooth is enabled
            const isEnabled = await this.isBluetoothEnabled();
            if (!isEnabled) {
                console.warn('Bluetooth is not enabled on device');
                return false;
            }
            
            // Request Bluetooth permissions
            const hasPermission = await this.requestBluetoothPermissions();
            if (!hasPermission) {
                console.warn('Bluetooth permissions not granted');
                return false;
            }
            
            console.log('BLE initialized with permissions');
            return true;
        } catch (error) {
            console.error('BLE initialization failed:', error);
            return false;
        }
    }

    /**
     * Check if Bluetooth is enabled on device
     */
    async isBluetoothEnabled() {
        try {
            const BleClient = getBleClient();
            if (!BleClient) {
                return true; // Mock mode
            }
            
            const enabled = await BleClient.isEnabled();
            console.log(`Bluetooth enabled: ${enabled}`);
            return enabled;
        } catch (error) {
            console.error('Failed to check Bluetooth status:', error);
            return false;
        }
    }

    /**
     * Request Bluetooth permissions
     */
    async requestBluetoothPermissions() {
        try {
            const BleClient = getBleClient();
            if (!BleClient) {
                return true; // Mock mode
            }
            
            // Request location permission (required for BLE scanning on Android)
            if (typeof window !== 'undefined' && window.Capacitor?.Plugins?.Geolocation) {
                try {
                    const permission = await window.Capacitor.Plugins.Geolocation.requestPermissions();
                    console.log('Location permission:', permission);
                } catch (error) {
                    console.warn('Location permission request failed:', error);
                }
            }
            
            // BleClient.initialize() already requests BLE permissions
            // Just verify we have them
            console.log('Bluetooth permissions requested');
            return true;
        } catch (error) {
            console.error('Failed to request Bluetooth permissions:', error);
            return false;
        }
    }

    /**
     * Scan for motor devices (based on plugin.js implementation)
     */
    async scan(timeout = this.SCAN_TIMEOUT) {
        if (this.isScanning) {
            console.warn('Scan already in progress, stopping previous scan...');
            await this.stopScan();
        }

        try {
            const BleClient = getBleClient();
            if (!BleClient) {
                console.warn('BleClient not available - cannot scan');
                return false;
            }

            // Check Bluetooth is enabled before scanning
            const isEnabled = await this.isBluetoothEnabled();
            if (!isEnabled) {
                console.error('Cannot scan: Bluetooth is not enabled');
                return false;
            }

            this.isScanning = true;
            this.scanResults = [];
            
            console.log(`Starting BLE scan for "${this.TARGET_DEVICE_NAME}" (timeout: ${timeout}ms)...`);
            
            await BleClient.requestLEScan({}, async (result) => {
                console.log('Scan result:', JSON.stringify(result));
                
                // Filter for target device name (matches plugin.js)
                if (result.device.name === this.TARGET_DEVICE_NAME) {
                    console.log('✅ Found target device:', result.device.deviceId);
                    this.deviceAddress = result.device.deviceId;
                    this.scanResults.push(result.device);
                    
                    // Stop scan immediately when target device is found
                    console.log('Target device found, stopping scan...');
                    await this.stopScan();
                    
                    // Trigger callback if set
                    if (this.onScanResult) {
                        this.onScanResult(result.device);
                    }
                }
            });

            // Stop scan after timeout
            setTimeout(async () => {
                if (this.isScanning) {
                    console.log('Scan timeout reached, stopping scan...');
                    await this.stopScan();
                    
                    if (this.scanResults.length === 0) {
                        console.warn(`❌ No devices found with name "${this.TARGET_DEVICE_NAME}"`);
                    }
                }
            }, timeout);

            return true;
        } catch (error) {
            console.error('Failed to start scan:', error);
            // Ensure scan state is reset on error
            await this.resetScanState();
            return false;
        }
    }

    /**
     * Stop BLE scanning
     */
    async stopScan() {
        if (!this.isScanning) {
            return;
        }

        try {
            const BleClient = getBleClient();
            if (BleClient) {
                await BleClient.stopLEScan();
            }
            this.isScanning = false;
            console.log('BLE scan stopped');
        } catch (error) {
            console.error('Failed to stop scan:', error);
            // Force reset scan state even if stop fails
            await this.resetScanState();
        }
    }

    /**
     * Reset scan state (used for error recovery)
     */
    async resetScanState() {
        try {
            const BleClient = getBleClient();
            if (BleClient && this.isScanning) {
                try {
                    await BleClient.stopLEScan();
                } catch (e) {
                    // Ignore errors during forced stop
                }
            }
        } catch (error) {
            console.error('Error during scan state reset:', error);
        } finally {
            this.isScanning = false;
            console.log('Scan state reset');
        }
    }

    /**
     * Scan and connect to motor device automatically
     */
    async scanAndConnect(timeout = this.SCAN_TIMEOUT) {
        try {
            console.log('Scanning for motor device...');
            
            // Use a promise to wait for scan completion properly
            const scanPromise = new Promise((resolve, reject) => {
                // Set up callback for when device is found
                const originalCallback = this.onScanResult;
                this.onScanResult = (device) => {
                    // Call original callback if it exists
                    if (originalCallback) {
                        originalCallback(device);
                    }
                    // Resolve the promise when device is found
                    resolve(true);
                };
                
                // Start scan
                this.scan(timeout).then(scanStarted => {
                    if (!scanStarted) {
                        reject(new Error('Failed to start scan'));
                    }
                }).catch(reject);
                
                // Timeout if device not found
                setTimeout(() => {
                    if (this.isScanning) {
                        this.stopScan();
                    }
                    if (!this.deviceAddress) {
                        resolve(false); // Timeout without finding device
                    }
                }, timeout + 500); // Add 500ms buffer
            });
            
            // Wait for scan to complete or timeout
            const deviceFound = await scanPromise;
            
            if (deviceFound && this.deviceAddress) {
                console.log('Device found, attempting to connect...');
                return await this.connect();
            } else {
                console.warn('❌ No motor device found during scan');
                console.warn(`Make sure device "${this.TARGET_DEVICE_NAME}" is powered on and in range`);
                return false;
            }
        } catch (error) {
            console.error('Scan and connect failed:', error);
            await this.resetScanState();
            return false;
        }
    }

    /**
     * Connect to motor device
     */
    async connect(deviceAddress = null) {
        try {
            if (deviceAddress) {
                this.deviceAddress = deviceAddress;
            }
            
            if (!this.deviceAddress) {
                throw new Error('No device address provided. Use scan() or scanAndConnect() first.');
            }

            const BleClient = getBleClient();
            if (!BleClient) {
                console.warn('BleClient not available - using mock mode');
                this.isConnected = true;
                return true;
            }
            
            // Set up disconnect callback (matches plugin.js pattern)
            const disconnectCallback = (deviceId) => {
                this.isConnected = false;
                this.deviceAddress = null;
                console.log(`Motor device ${deviceId} disconnected`);
                
                if (this.onDisconnect) {
                    this.onDisconnect(deviceId);
                }
            };
            
            await BleClient.connect(this.deviceAddress, disconnectCallback);
            this.isConnected = true;
            console.log('Connected to motor device:', this.deviceAddress);
            return true;
        } catch (error) {
            console.error('Failed to connect to motor device:', error);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Disconnect from motor device
     */
    async disconnect() {
        try {
            const BleClient = getBleClient();
            if (this.deviceAddress && BleClient) {
                await BleClient.disconnect(this.deviceAddress);
            }
            this.isConnected = false;
            this.deviceAddress = null;
            console.log('Disconnected from motor device');
        } catch (error) {
            console.error('Failed to disconnect:', error);
        }
    }

    /**
     * Write PWM value to motor (0-255)
     * Automatically routes to remote host if connected as remote user
     */
    async write(pwmValue) {
        // Validate PWM value first
        const pwm = Math.max(0, Math.min(255, Math.round(pwmValue)));
        
        // Check if we're connected as remote to another host
        if (this.remoteService && this.remoteService.isRemote) {
            return this.writeToRemoteHost(pwm);
        }
        
        // Normal local BLE write
        return this.writeToLocalBLE(pwm);
    }

    /**
     * Write PWM value to remote host (when acting as remote)
     */
    async writeToRemoteHost(pwmValue) {
        try {
            const success = this.remoteService.sendControlCommand('motor', pwmValue, {
                timestamp: Date.now(),
                source: 'motor_controller'
            });
            
            if (success) {
                this.remotePwm = pwmValue;
                return true;
            } else {
                console.warn('[MOTOR WRITE] ❌ Failed to send remote PWM command');
                return false;
            }
        } catch (error) {
            console.error('[MOTOR WRITE] ❌ Error sending remote PWM command:', error);
            return false;
        }
    }

    /**
     * Write PWM value to local BLE device
     */
    async writeToLocalBLE(pwmValue) {
        
        if (!this.isConnected || !this.deviceAddress) {
            console.warn('[MOTOR WRITE] ❌ Motor not connected, cannot write PWM value');
            return false;
        }

        try {
            // Convert to hex string
            const hexValue = this.decimalToHexString(pwmValue);
            
            // Write to BLE characteristic
            const BleClient = getBleClient();
            if (!BleClient) {
                console.warn('[MOTOR WRITE] ⚠️ BleClient not available - PWM value stored but not transmitted');
                this.currentPwm = pwmValue;
                return true;
            }
            
            await BleClient.write(
                this.deviceAddress,
                this.SERVICE_UUID,
                this.CHARACTERISTIC_UUID,
                hexStringToDataView(hexValue)
            );
            
            this.currentPwm = pwmValue;
            return true;
        } catch (error) {
            console.error('[MOTOR WRITE] ❌ Failed to write PWM value:', error);
            return false;
        }
    }



    /**
     * Get current PWM value (local or remote depending on mode)
     */
    getCurrentPwm() {
        if (this.remoteService && this.remoteService.isRemote) {
            return this.remotePwm;
        }
        return this.currentPwm;
    }

    /**
     * Check if motor is connected
     */
    isMotorConnected() {
        return this.isConnected;
    }

    /**
     * Convert decimal to hex string for BLE communication
     */
    decimalToHexString(decimal) {
        const hex = decimal.toString(16).toUpperCase();
        return hex.length === 1 ? '0' + hex : hex;
    }

    /**
     * Get device address
     */
    getDeviceAddress() {
        return this.deviceAddress;
    }

    /**
     * Set device address
     */
    setDeviceAddress(address) {
        this.deviceAddress = address;
    }

    /**
     * Get scan results
     */
    getScanResults() {
        return [...this.scanResults];
    }

    /**
     * Check if currently scanning
     */
    isScanningActive() {
        return this.isScanning;
    }

    /**
     * Set scan result callback
     */
    setScanResultCallback(callback) {
        this.onScanResult = callback;
    }

    /**
     * Set disconnect callback
     */
    setDisconnectCallback(callback) {
        this.onDisconnect = callback;
    }

    /**
     * Set target device name for scanning
     */
    setTargetDeviceName(name) {
        this.TARGET_DEVICE_NAME = name;
    }

    /**
     * Get target device name
     */
    getTargetDeviceName() {
        return this.TARGET_DEVICE_NAME;
    }

    /**
     * Set remote service for remote control integration
     */
    setRemoteService(remoteService) {
        this.remoteService = remoteService;
        console.log('[MOTOR CONTROLLER] Remote service integration enabled');
    }

    /**
     * Get remote control status
     */
    getRemoteStatus() {
        if (!this.remoteService) {
            return { enabled: false };
        }
        
        return {
            enabled: true,
            isRemote: this.remoteService.isRemote,
            isHost: this.remoteService.isHost,
            isControlledByRemote: this.remoteService.isControlledByRemote,
            hostId: this.remoteService.hostId,
            currentPwm: this.getCurrentPwm(),
            localPwm: this.currentPwm,
            remotePwm: this.remotePwm
        };
    }
}

// Create singleton instance
const motorController = new MotorController();

// Export both the class and instance for flexibility
export { MotorController, motorController };

// Global access
if (typeof window !== 'undefined') {
    window.motorController = motorController;
}