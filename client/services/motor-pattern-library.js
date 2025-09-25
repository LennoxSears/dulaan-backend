/**
 * Motor Pattern Library Service - Pattern management and playback engine
 * Handles pattern storage, playback control, and motor integration
 */

import { MOTOR_PATTERN_LIBRARY, PATTERN_CATEGORIES, PatternUtils } from '../utils/motor-patterns.js';

class MotorPatternLibrary {
    constructor() {
        // Pattern library
        this.patterns = { ...MOTOR_PATTERN_LIBRARY };
        this.categories = { ...PATTERN_CATEGORIES };
        
        // Playback state
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPattern = null;
        this.currentLoop = 0;
        this.maxLoops = -1; // -1 = infinite
        this.playbackSpeed = 1.0; // 1.0 = normal speed
        
        // Timing control
        this.startTime = 0;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        this.playbackInterval = null;
        this.frameIndex = 0;
        
        // Motor controller reference
        this.motorController = null;
        
        // Event callbacks
        this.onPatternStart = null;
        this.onPatternEnd = null;
        this.onPatternLoop = null;
        this.onFrameUpdate = null;
        this.onPlaybackStateChange = null;
        
        // Interpolation settings
        this.enableInterpolation = true;
        this.interpolationInterval = 50; // Update every 50ms for smooth transitions
    }

    /**
     * Set motor controller for pattern playback
     */
    setMotorController(motorController) {
        this.motorController = motorController;
        console.log('[Pattern Library] Motor controller connected');
    }

    /**
     * Get all available patterns
     */
    getAllPatterns() {
        return Object.values(this.patterns);
    }

    /**
     * Get patterns by category
     */
    getPatternsByCategory(category) {
        return Object.values(this.patterns).filter(pattern => pattern.category === category);
    }

    /**
     * Get pattern by ID
     */
    getPattern(id) {
        return this.patterns[id] || null;
    }

    /**
     * Add custom pattern to library
     */
    addPattern(pattern) {
        const validation = PatternUtils.validatePattern(pattern);
        if (!validation.valid) {
            throw new Error(`Invalid pattern: ${validation.errors.join(', ')}`);
        }

        this.patterns[pattern.id] = { ...pattern };
        console.log(`[Pattern Library] Added custom pattern: ${pattern.name}`);
        return true;
    }

    /**
     * Remove pattern from library
     */
    removePattern(id) {
        if (this.patterns[id]) {
            delete this.patterns[id];
            console.log(`[Pattern Library] Removed pattern: ${id}`);
            return true;
        }
        return false;
    }

    /**
     * Start playing a pattern
     */
    async startPattern(patternId, options = {}) {
        const pattern = this.getPattern(patternId);
        if (!pattern) {
            throw new Error(`Pattern not found: ${patternId}`);
        }

        if (!this.motorController) {
            throw new Error('Motor controller not connected');
        }

        // Stop current pattern if playing
        if (this.isPlaying) {
            this.stopPattern();
        }

        // Set up playback options
        this.currentPattern = { ...pattern };
        this.maxLoops = options.loops !== undefined ? options.loops : (pattern.loop ? -1 : 1);
        this.playbackSpeed = options.speed || 1.0;
        this.enableInterpolation = options.interpolation !== false;

        // Handle special patterns
        if (pattern.id === 'random_walk') {
            this.currentPattern.frames = PatternUtils.generateRandomPattern(pattern.duration);
        }

        // Initialize playback state
        this.isPlaying = true;
        this.isPaused = false;
        this.currentLoop = 0;
        this.frameIndex = 0;
        this.startTime = Date.now();
        this.totalPausedDuration = 0;

        console.log(`[Pattern Library] Starting pattern: ${pattern.name} (loops: ${this.maxLoops === -1 ? 'infinite' : this.maxLoops})`);

        // Start playback
        this.startPlaybackLoop();

        // Trigger callback
        if (this.onPatternStart) {
            this.onPatternStart(pattern);
        }

        if (this.onPlaybackStateChange) {
            this.onPlaybackStateChange({ isPlaying: true, isPaused: false, pattern: pattern });
        }

        return true;
    }

    /**
     * Stop pattern playback
     */
    async stopPattern() {
        if (!this.isPlaying) {
            return false;
        }

        this.isPlaying = false;
        this.isPaused = false;
        
        // Clear playback interval immediately
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }

        const stoppedPattern = this.currentPattern;
        this.currentPattern = null;

        console.log(`[Pattern Library] Stopped pattern playback`);

        // Trigger callbacks immediately
        if (this.onPatternEnd) {
            this.onPatternEnd(stoppedPattern);
        }

        if (this.onPlaybackStateChange) {
            this.onPlaybackStateChange({ isPlaying: false, isPaused: false, pattern: null });
        }

        // Set motor to 0 without blocking (fire and forget)
        if (this.motorController) {
            this.motorController.write(0).catch(error => {
                console.warn('[Pattern Library] Failed to stop motor:', error);
            });
        }

        return true;
    }

    /**
     * Pause pattern playback
     */
    pausePattern() {
        if (!this.isPlaying || this.isPaused) {
            return false;
        }

        this.isPaused = true;
        this.pausedTime = Date.now();

        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }

        console.log(`[Pattern Library] Paused pattern playback`);

        if (this.onPlaybackStateChange) {
            this.onPlaybackStateChange({ isPlaying: true, isPaused: true, pattern: this.currentPattern });
        }

        return true;
    }

    /**
     * Resume pattern playback
     */
    resumePattern() {
        if (!this.isPlaying || !this.isPaused) {
            return false;
        }

        this.isPaused = false;
        this.totalPausedDuration += Date.now() - this.pausedTime;

        this.startPlaybackLoop();

        console.log(`[Pattern Library] Resumed pattern playback`);

        if (this.onPlaybackStateChange) {
            this.onPlaybackStateChange({ isPlaying: true, isPaused: false, pattern: this.currentPattern });
        }

        return true;
    }

    /**
     * Set playback speed (0.1x to 5.0x)
     */
    setPlaybackSpeed(speed) {
        this.playbackSpeed = Math.max(0.1, Math.min(5.0, speed));
        console.log(`[Pattern Library] Playback speed set to ${this.playbackSpeed}x`);
        return this.playbackSpeed;
    }

    /**
     * Start the main playback loop
     */
    startPlaybackLoop() {
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
        }

        this.playbackInterval = setInterval(() => {
            this.updatePlayback();
        }, this.interpolationInterval);
    }

    /**
     * Update playback - called every interpolation interval
     */
    async updatePlayback() {
        if (!this.isPlaying || this.isPaused || !this.currentPattern) {
            return;
        }

        const now = Date.now();
        const elapsed = (now - this.startTime - this.totalPausedDuration) * this.playbackSpeed;
        const patternDuration = this.currentPattern.duration;

        // Check if we've completed the current loop
        if (elapsed >= patternDuration) {
            await this.handleLoopCompletion();
            return;
        }

        // Calculate current PWM value
        const pwmValue = this.calculateCurrentPWM(elapsed);

        // Send to motor
        if (this.motorController && pwmValue !== null) {
            await this.motorController.write(pwmValue);
        }

        // Trigger frame update callback
        if (this.onFrameUpdate) {
            this.onFrameUpdate({
                elapsed: elapsed,
                progress: elapsed / patternDuration,
                pwm: pwmValue,
                loop: this.currentLoop
            });
        }
    }

    /**
     * Calculate current PWM value based on elapsed time
     */
    calculateCurrentPWM(elapsed) {
        const frames = this.currentPattern.frames;
        if (frames.length === 0) {
            return 0;
        }

        // Find the current frame position
        let currentFrame = null;
        let nextFrame = null;

        for (let i = 0; i < frames.length; i++) {
            if (frames[i].time <= elapsed) {
                currentFrame = frames[i];
                nextFrame = frames[i + 1] || null;
            } else {
                break;
            }
        }

        if (!currentFrame) {
            return frames[0].pwm;
        }

        // If no interpolation or no next frame, return current frame PWM
        if (!this.enableInterpolation || !nextFrame) {
            return currentFrame.pwm;
        }

        // Interpolate between current and next frame
        const timeDiff = nextFrame.time - currentFrame.time;
        const pwmDiff = nextFrame.pwm - currentFrame.pwm;
        const timeProgress = (elapsed - currentFrame.time) / timeDiff;

        return Math.round(currentFrame.pwm + (pwmDiff * timeProgress));
    }

    /**
     * Handle loop completion
     */
    async handleLoopCompletion() {
        this.currentLoop++;

        // Check if we should continue looping
        if (this.maxLoops === -1 || this.currentLoop < this.maxLoops) {
            // Continue to next loop
            this.startTime = Date.now();
            this.totalPausedDuration = 0;

            // Regenerate random pattern if needed
            if (this.currentPattern.id === 'random_walk') {
                this.currentPattern.frames = PatternUtils.generateRandomPattern(this.currentPattern.duration);
            }

            console.log(`[Pattern Library] Starting loop ${this.currentLoop + 1}`);

            if (this.onPatternLoop) {
                this.onPatternLoop(this.currentPattern, this.currentLoop);
            }
        } else {
            // Pattern completed
            console.log(`[Pattern Library] Pattern completed after ${this.currentLoop} loops`);
            await this.stopPattern();
        }
    }

    /**
     * Get current playback status
     */
    getPlaybackStatus() {
        if (!this.isPlaying) {
            return {
                isPlaying: false,
                isPaused: false,
                pattern: null,
                progress: 0,
                loop: 0,
                elapsed: 0
            };
        }

        const elapsed = this.isPaused ? 
            (this.pausedTime - this.startTime - this.totalPausedDuration) * this.playbackSpeed :
            (Date.now() - this.startTime - this.totalPausedDuration) * this.playbackSpeed;

        return {
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            pattern: this.currentPattern,
            progress: this.currentPattern ? elapsed / this.currentPattern.duration : 0,
            loop: this.currentLoop,
            elapsed: elapsed,
            speed: this.playbackSpeed,
            maxLoops: this.maxLoops
        };
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
     * Get pattern library statistics
     */
    getLibraryStats() {
        const patterns = Object.values(this.patterns);
        const categories = {};

        patterns.forEach(pattern => {
            if (!categories[pattern.category]) {
                categories[pattern.category] = 0;
            }
            categories[pattern.category]++;
        });

        return {
            totalPatterns: patterns.length,
            categories: categories,
            isPlaying: this.isPlaying,
            currentPattern: this.currentPattern?.name || null
        };
    }
}

// Create singleton instance
const motorPatternLibrary = new MotorPatternLibrary();

// Export both class and instance
export { MotorPatternLibrary, motorPatternLibrary };

// Global access
if (typeof window !== 'undefined') {
    window.motorPatternLibrary = motorPatternLibrary;
}