/**
 * Motor Controller - Core BLE communication and motor control
 * Handles low-level hardware communication with the motor device
 */

import { BleClient, textToDataView, hexStringToDataView } from '@capacitor-community/bluetooth-le';

class MotorController {
    constructor() {
        this.deviceAddress = null;
        this.isConnected = false;
        this.currentPwm = 0;
        
        // BLE service and characteristic UUIDs
        this.SERVICE_UUID = "0000FFE0-0000-1000-8000-00805F9B34FB";
        this.CHARACTERISTIC_UUID = "0000FFE1-0000-1000-8000-00805F9B34FB";
    }

    /**
     * Initialize BLE and connect to device
     */
    async initialize() {
        try {
            await BleClient.initialize();
            console.log('BLE initialized');
            return true;
        } catch (error) {
            console.error('BLE initialization failed:', error);
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
                throw new Error('No device address provided');
            }

            await BleClient.connect(this.deviceAddress);
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
            if (this.deviceAddress) {
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
     */
    async write(pwmValue) {
        if (!this.isConnected || !this.deviceAddress) {
            console.warn('Motor not connected, cannot write PWM value');
            return false;
        }

        try {
            // Validate PWM value
            const pwm = Math.max(0, Math.min(255, Math.round(pwmValue)));
            
            // Convert to hex string
            const hexValue = this.decimalToHexString(pwm);
            
            // Write to BLE characteristic
            await BleClient.write(
                this.deviceAddress,
                this.SERVICE_UUID,
                this.CHARACTERISTIC_UUID,
                hexValue
            );
            
            this.currentPwm = pwm;
            console.log(`Motor PWM set to: ${pwm}`);
            return true;
        } catch (error) {
            console.error('Failed to write PWM value:', error);
            return false;
        }
    }



    /**
     * Get current PWM value
     */
    getCurrentPwm() {
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
}

// Create singleton instance
const motorController = new MotorController();

// Export both the class and instance for flexibility
export { MotorController, motorController };

// Global access
if (typeof window !== 'undefined') {
    window.motorController = motorController;
}