/**
 * Touch Control Mode
 * Handles manual touch/slider-based motor control
 */

export class TouchControl {
    constructor(sdk) {
        this.sdk = sdk;
        this.isActive = false;
        this.currentValue = 0;
        this.updateCallback = null;
    }

    async start() {
        if (this.isActive) {
            console.warn('Touch Control already active');
            return false;
        }

        this.isActive = true;
        console.log('Touch Control started');
        return true;
    }

    async stop() {
        if (!this.isActive) {
            return;
        }

        this.isActive = false;
        
        // Set motor to 0 when stopping
        await this.sdk.motor.write(0);
        this.currentValue = 0;
        
        console.log('Touch Control stopped');
    }

    async setValue(value) {
        if (!this.isActive) {
            console.warn('Touch Control not active');
            return false;
        }

        try {
            // Validate and clamp value
            const clampedValue = Math.max(0, Math.min(255, Math.round(value)));
            
            // Update motor
            await this.sdk.motor.write(clampedValue);
            this.currentValue = clampedValue;
            
            console.log(`Touch Control: Set to ${clampedValue}`);
            
            // Trigger update callback
            if (this.updateCallback) {
                this.updateCallback(clampedValue);
            }
            
            return true;
        } catch (error) {
            console.error('Touch control error:', error);
            return false;
        }
    }

    async setPercentage(percentage) {
        const pwmValue = Math.round((percentage / 100) * 255);
        return await this.setValue(pwmValue);
    }

    getValue() {
        return this.currentValue;
    }

    getPercentage() {
        return Math.round((this.currentValue / 255) * 100);
    }

    setUpdateCallback(callback) {
        this.updateCallback = callback;
    }

    isRunning() {
        return this.isActive;
    }
}

// Legacy global functions for backward compatibility
if (typeof window !== 'undefined') {
    window.startTouch = async () => {
        if (window.dulaan && window.dulaan.modes && window.dulaan.modes.touch) {
            return await window.dulaan.modes.touch.start();
        }
    };
    
    window.stopTouch = async () => {
        if (window.dulaan && window.dulaan.modes && window.dulaan.modes.touch) {
            return await window.dulaan.modes.touch.stop();
        }
    };
    
    // Legacy touch value handling
    window.touchValue = 0;
    
    if (window.dulaan && window.dulaan.modes && window.dulaan.modes.touch) {
        window.dulaan.modes.touch.setUpdateCallback((value) => {
            window.touchValue = Math.round((value / 255) * 100);
        });
    }
}