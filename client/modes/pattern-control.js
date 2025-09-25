/**
 * Pattern Control Mode
 * Handles motor pattern playback and control
 */

import { motorPatternLibrary } from '../services/motor-pattern-library.js';

export class PatternControl {
    constructor(sdk) {
        this.sdk = sdk;
        this.isActive = false;
        this.patternLibrary = motorPatternLibrary;
        
        // State
        this.currentPatternId = null;
        this.playbackOptions = {};
        
        // Event callbacks
        this.onPatternStart = null;
        this.onPatternEnd = null;
        this.onPatternLoop = null;
        this.onFrameUpdate = null;
        this.onPlaybackStateChange = null;
    }

    /**
     * Start pattern control mode
     */
    async start() {
        if (this.isActive) {
            console.warn('Pattern Control already active');
            return false;
        }

        this.isActive = true;
        
        // Connect motor controller to pattern library
        this.patternLibrary.setMotorController(this.sdk.motor);
        
        // Set up pattern library callbacks
        this.patternLibrary.setCallbacks({
            onPatternStart: (pattern) => this.handlePatternStart(pattern),
            onPatternEnd: (pattern) => this.handlePatternEnd(pattern),
            onPatternLoop: (pattern, loop) => this.handlePatternLoop(pattern, loop),
            onFrameUpdate: (status) => this.handleFrameUpdate(status),
            onPlaybackStateChange: (state) => this.handlePlaybackStateChange(state)
        });

        console.log('Pattern Control started');
        return true;
    }

    /**
     * Stop pattern control mode
     */
    async stop() {
        if (!this.isActive) {
            return;
        }

        // Stop any playing pattern
        await this.patternLibrary.stopPattern();
        
        this.isActive = false;
        this.currentPatternId = null;
        
        // Set motor to 0 when stopping
        await this.sdk.motor.write(0);
        
        console.log('Pattern Control stopped');
    }

    /**
     * Play a pattern by ID
     */
    async playPattern(patternId, options = {}) {
        if (!this.isActive) {
            throw new Error('Pattern Control mode not active');
        }

        const pattern = this.patternLibrary.getPattern(patternId);
        if (!pattern) {
            throw new Error(`Pattern not found: ${patternId}`);
        }

        this.currentPatternId = patternId;
        this.playbackOptions = { ...options };

        console.log(`[Pattern Control] Playing pattern: ${pattern.name}`);
        return await this.patternLibrary.startPattern(patternId, options);
    }

    /**
     * Stop current pattern
     */
    async stopPattern() {
        if (!this.isActive) {
            return false;
        }

        this.currentPatternId = null;
        return await this.patternLibrary.stopPattern();
    }

    /**
     * Pause current pattern
     */
    pausePattern() {
        if (!this.isActive) {
            return false;
        }

        return this.patternLibrary.pausePattern();
    }

    /**
     * Resume current pattern
     */
    resumePattern() {
        if (!this.isActive) {
            return false;
        }

        return this.patternLibrary.resumePattern();
    }

    /**
     * Set playback speed
     */
    setPlaybackSpeed(speed) {
        return this.patternLibrary.setPlaybackSpeed(speed);
    }

    /**
     * Get all available patterns
     */
    getAllPatterns() {
        return this.patternLibrary.getAllPatterns();
    }

    /**
     * Get patterns by category
     */
    getPatternsByCategory(category) {
        return this.patternLibrary.getPatternsByCategory(category);
    }

    /**
     * Get pattern by ID
     */
    getPattern(patternId) {
        return this.patternLibrary.getPattern(patternId);
    }

    /**
     * Add custom pattern
     */
    addCustomPattern(pattern) {
        return this.patternLibrary.addPattern(pattern);
    }

    /**
     * Remove pattern
     */
    removePattern(patternId) {
        return this.patternLibrary.removePattern(patternId);
    }

    /**
     * Get current playback status
     */
    getPlaybackStatus() {
        return this.patternLibrary.getPlaybackStatus();
    }

    /**
     * Get pattern library statistics
     */
    getLibraryStats() {
        return this.patternLibrary.getLibraryStats();
    }

    /**
     * Check if pattern control is running
     */
    isRunning() {
        return this.isActive;
    }

    /**
     * Check if a pattern is currently playing
     */
    isPlaying() {
        return this.patternLibrary.getPlaybackStatus().isPlaying;
    }

    /**
     * Get current pattern ID
     */
    getCurrentPatternId() {
        return this.currentPatternId;
    }

    /**
     * Set event callbacks
     */
    setCallbacks(callbacks) {
        this.onPatternStart = callbacks.onPatternStart || null;
        this.onPatternEnd = callbacks.onPatternEnd || null;
        this.onPatternLoop = callbacks.onPatternLoop || null;
        this.onFrameUpdate = callbacks.onFrameUpdate || null;
        this.onPlaybackStateChange = callbacks.onPlaybackStateChange || null;
    }

    /**
     * Handle pattern start event
     */
    handlePatternStart(pattern) {
        console.log(`[Pattern Control] Pattern started: ${pattern.name}`);
        
        if (this.onPatternStart) {
            this.onPatternStart(pattern);
        }
    }

    /**
     * Handle pattern end event
     */
    handlePatternEnd(pattern) {
        console.log(`[Pattern Control] Pattern ended: ${pattern?.name || 'Unknown'}`);
        
        this.currentPatternId = null;
        
        if (this.onPatternEnd) {
            this.onPatternEnd(pattern);
        }
    }

    /**
     * Handle pattern loop event
     */
    handlePatternLoop(pattern, loop) {
        console.log(`[Pattern Control] Pattern loop ${loop + 1}: ${pattern.name}`);
        
        if (this.onPatternLoop) {
            this.onPatternLoop(pattern, loop);
        }
    }

    /**
     * Handle frame update event
     */
    handleFrameUpdate(status) {
        if (this.onFrameUpdate) {
            this.onFrameUpdate(status);
        }
    }

    /**
     * Handle playback state change event
     */
    handlePlaybackStateChange(state) {
        if (this.onPlaybackStateChange) {
            this.onPlaybackStateChange(state);
        }
    }

    /**
     * Quick play methods for common patterns
     */


    /**
     * Pattern queue functionality
     */
    async playPatternSequence(patternIds, options = {}) {
        if (!Array.isArray(patternIds) || patternIds.length === 0) {
            throw new Error('Pattern sequence must be a non-empty array');
        }

        const sequenceOptions = {
            loops: 1, // Each pattern plays once by default
            ...options
        };

        console.log(`[Pattern Control] Starting pattern sequence: ${patternIds.join(' -> ')}`);

        for (let i = 0; i < patternIds.length; i++) {
            const patternId = patternIds[i];
            
            if (!this.isActive) {
                console.log('[Pattern Control] Sequence stopped - mode inactive');
                break;
            }

            console.log(`[Pattern Control] Sequence step ${i + 1}/${patternIds.length}: ${patternId}`);
            
            await this.playPattern(patternId, sequenceOptions);
            
            // Wait for pattern to complete
            await new Promise((resolve) => {
                const checkCompletion = () => {
                    if (!this.isPlaying()) {
                        resolve();
                    } else {
                        setTimeout(checkCompletion, 100);
                    }
                };
                checkCompletion();
            });
        }

        console.log('[Pattern Control] Pattern sequence completed');
    }
}

export { PatternControl };