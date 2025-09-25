/**
 * Motor Pattern Library - Predefined PWM patterns for motor control
 * Each pattern defines a sequence of PWM values over time
 */

/**
 * Pattern data structure:
 * {
 *   id: string,           // Unique identifier
 *   name: string,         // Display name
 *   description: string,  // Pattern description
 *   category: string,     // Pattern category
 *   duration: number,     // Total duration in milliseconds
 *   loop: boolean,        // Whether to loop the pattern
 *   frames: [             // Array of time-PWM pairs
 *     { time: number, pwm: number }
 *   ]
 * }
 */

// Gentle patterns - soft, slow, relaxing
export const GENTLE_PATTERNS = {
    gentle_wave: {
        id: "gentle_wave",
        name: "Gentle Wave",
        description: "Smooth wave-like pattern with gradual intensity changes",
        category: "gentle",
        duration: 8000,
        loop: true,
        frames: [
            { time: 0, pwm: 0 },
            { time: 1000, pwm: 50 },
            { time: 2000, pwm: 100 },
            { time: 3000, pwm: 150 },
            { time: 4000, pwm: 200 },
            { time: 5000, pwm: 150 },
            { time: 6000, pwm: 100 },
            { time: 7000, pwm: 50 },
            { time: 8000, pwm: 0 }
        ]
    },

    soft_pulse: {
        id: "soft_pulse",
        name: "Soft Pulse",
        description: "Gentle pulsing pattern with soft peaks",
        category: "gentle",
        duration: 4000,
        loop: true,
        frames: [
            { time: 0, pwm: 0 },
            { time: 500, pwm: 80 },
            { time: 1000, pwm: 0 },
            { time: 1500, pwm: 80 },
            { time: 2000, pwm: 0 },
            { time: 2500, pwm: 80 },
            { time: 3000, pwm: 0 },
            { time: 3500, pwm: 80 },
            { time: 4000, pwm: 0 }
        ]
    },

    breathing: {
        id: "breathing",
        name: "Breathing",
        description: "Mimics natural breathing rhythm",
        category: "gentle",
        duration: 6000,
        loop: true,
        frames: [
            { time: 0, pwm: 0 },
            { time: 1500, pwm: 120 },    // Inhale
            { time: 3000, pwm: 120 },    // Hold
            { time: 4500, pwm: 0 },      // Exhale
            { time: 6000, pwm: 0 }       // Rest
        ]
    }
};

// Rhythmic patterns - beat-based, musical
export const RHYTHMIC_PATTERNS = {
    steady_beat: {
        id: "steady_beat",
        name: "Steady Beat",
        description: "Consistent rhythmic pulses like a heartbeat",
        category: "rhythmic",
        duration: 2000,
        loop: true,
        frames: [
            { time: 0, pwm: 0 },
            { time: 100, pwm: 180 },
            { time: 300, pwm: 0 },
            { time: 1000, pwm: 0 },
            { time: 1100, pwm: 180 },
            { time: 1300, pwm: 0 },
            { time: 2000, pwm: 0 }
        ]
    },

    double_tap: {
        id: "double_tap",
        name: "Double Tap",
        description: "Two quick pulses followed by a pause",
        category: "rhythmic",
        duration: 3000,
        loop: true,
        frames: [
            { time: 0, pwm: 0 },
            { time: 100, pwm: 200 },
            { time: 200, pwm: 0 },
            { time: 400, pwm: 200 },
            { time: 500, pwm: 0 },
            { time: 3000, pwm: 0 }
        ]
    },

    waltz: {
        id: "waltz",
        name: "Waltz",
        description: "Three-beat pattern like a waltz rhythm",
        category: "rhythmic",
        duration: 3000,
        loop: true,
        frames: [
            { time: 0, pwm: 0 },
            { time: 100, pwm: 220 },     // Strong beat
            { time: 300, pwm: 0 },
            { time: 1000, pwm: 150 },    // Weak beat
            { time: 1200, pwm: 0 },
            { time: 2000, pwm: 150 },    // Weak beat
            { time: 2200, pwm: 0 },
            { time: 3000, pwm: 0 }
        ]
    }
};

// Intense patterns - strong, fast, energetic
export const INTENSE_PATTERNS = {
    rapid_fire: {
        id: "rapid_fire",
        name: "Rapid Fire",
        description: "Quick successive pulses with high intensity",
        category: "intense",
        duration: 2000,
        loop: true,
        frames: [
            { time: 0, pwm: 0 },
            { time: 100, pwm: 255 },
            { time: 150, pwm: 0 },
            { time: 250, pwm: 255 },
            { time: 300, pwm: 0 },
            { time: 400, pwm: 255 },
            { time: 450, pwm: 0 },
            { time: 550, pwm: 255 },
            { time: 600, pwm: 0 },
            { time: 2000, pwm: 0 }
        ]
    },

    power_surge: {
        id: "power_surge",
        name: "Power Surge",
        description: "Intense build-up to maximum power",
        category: "intense",
        duration: 5000,
        loop: true,
        frames: [
            { time: 0, pwm: 0 },
            { time: 500, pwm: 100 },
            { time: 1000, pwm: 150 },
            { time: 1500, pwm: 200 },
            { time: 2000, pwm: 255 },
            { time: 3000, pwm: 255 },
            { time: 3500, pwm: 200 },
            { time: 4000, pwm: 100 },
            { time: 4500, pwm: 50 },
            { time: 5000, pwm: 0 }
        ]
    },

    earthquake: {
        id: "earthquake",
        name: "Earthquake",
        description: "Chaotic, unpredictable vibrations",
        category: "intense",
        duration: 4000,
        loop: true,
        frames: [
            { time: 0, pwm: 0 },
            { time: 200, pwm: 180 },
            { time: 350, pwm: 220 },
            { time: 500, pwm: 100 },
            { time: 700, pwm: 255 },
            { time: 900, pwm: 50 },
            { time: 1100, pwm: 200 },
            { time: 1300, pwm: 150 },
            { time: 1500, pwm: 240 },
            { time: 1700, pwm: 80 },
            { time: 1900, pwm: 190 },
            { time: 2100, pwm: 255 },
            { time: 2300, pwm: 120 },
            { time: 2500, pwm: 200 },
            { time: 2700, pwm: 60 },
            { time: 2900, pwm: 180 },
            { time: 3100, pwm: 100 },
            { time: 3300, pwm: 50 },
            { time: 3500, pwm: 20 },
            { time: 4000, pwm: 0 }
        ]
    }
};

// Special patterns - unique behaviors
export const SPECIAL_PATTERNS = {
    random_walk: {
        id: "random_walk",
        name: "Random Walk",
        description: "Randomly generated pattern (regenerated each loop)",
        category: "special",
        duration: 5000,
        loop: true,
        frames: [] // Will be generated dynamically
    },

    user_heartbeat: {
        id: "user_heartbeat",
        name: "User Heartbeat",
        description: "Simulates human heartbeat rhythm",
        category: "special",
        duration: 3000,
        loop: true,
        frames: [
            { time: 0, pwm: 0 },
            { time: 100, pwm: 200 },     // Lub
            { time: 200, pwm: 0 },
            { time: 300, pwm: 150 },     // Dub
            { time: 400, pwm: 0 },
            { time: 3000, pwm: 0 }       // Rest period
        ]
    },

    morse_sos: {
        id: "morse_sos",
        name: "Morse SOS",
        description: "SOS signal in Morse code (... --- ...)",
        category: "special",
        duration: 6000,
        loop: true,
        frames: [
            // S (...)
            { time: 0, pwm: 0 },
            { time: 100, pwm: 150 },     // .
            { time: 200, pwm: 0 },
            { time: 300, pwm: 150 },     // .
            { time: 400, pwm: 0 },
            { time: 500, pwm: 150 },     // .
            { time: 600, pwm: 0 },
            
            // O (---)
            { time: 800, pwm: 150 },     // -
            { time: 1100, pwm: 0 },
            { time: 1200, pwm: 150 },    // -
            { time: 1500, pwm: 0 },
            { time: 1600, pwm: 150 },    // -
            { time: 1900, pwm: 0 },
            
            // S (...)
            { time: 2100, pwm: 150 },    // .
            { time: 2200, pwm: 0 },
            { time: 2300, pwm: 150 },    // .
            { time: 2400, pwm: 0 },
            { time: 2500, pwm: 150 },    // .
            { time: 2600, pwm: 0 },
            
            { time: 6000, pwm: 0 }       // Long pause
        ]
    }
};

// Combine all patterns into a single library
export const MOTOR_PATTERN_LIBRARY = {
    ...GENTLE_PATTERNS,
    ...RHYTHMIC_PATTERNS,
    ...INTENSE_PATTERNS,
    ...SPECIAL_PATTERNS
};

// Pattern categories for organization
export const PATTERN_CATEGORIES = {
    gentle: {
        name: "Gentle",
        description: "Soft, slow, relaxing patterns",
        patterns: Object.keys(GENTLE_PATTERNS)
    },
    rhythmic: {
        name: "Rhythmic", 
        description: "Beat-based, musical patterns",
        patterns: Object.keys(RHYTHMIC_PATTERNS)
    },
    intense: {
        name: "Intense",
        description: "Strong, fast, energetic patterns", 
        patterns: Object.keys(INTENSE_PATTERNS)
    },
    special: {
        name: "Special",
        description: "Unique behaviors and effects",
        patterns: Object.keys(SPECIAL_PATTERNS)
    }
};

// Utility functions
export const PatternUtils = {
    /**
     * Get all pattern IDs
     */
    getAllPatternIds() {
        return Object.keys(MOTOR_PATTERN_LIBRARY);
    },

    /**
     * Get patterns by category
     */
    getPatternsByCategory(category) {
        return Object.values(MOTOR_PATTERN_LIBRARY).filter(pattern => pattern.category === category);
    },

    /**
     * Get pattern by ID
     */
    getPattern(id) {
        return MOTOR_PATTERN_LIBRARY[id] || null;
    },

    /**
     * Validate pattern structure
     */
    validatePattern(pattern) {
        const required = ['id', 'name', 'description', 'category', 'duration', 'loop', 'frames'];
        const missing = required.filter(field => !(field in pattern));
        
        if (missing.length > 0) {
            return { valid: false, errors: [`Missing required fields: ${missing.join(', ')}`] };
        }

        if (!Array.isArray(pattern.frames)) {
            return { valid: false, errors: ['Frames must be an array'] };
        }

        const frameErrors = [];
        pattern.frames.forEach((frame, index) => {
            if (typeof frame.time !== 'number' || typeof frame.pwm !== 'number') {
                frameErrors.push(`Frame ${index}: time and pwm must be numbers`);
            }
            if (frame.pwm < 0 || frame.pwm > 255) {
                frameErrors.push(`Frame ${index}: pwm must be between 0 and 255`);
            }
        });

        return { valid: frameErrors.length === 0, errors: frameErrors };
    },

    /**
     * Generate random pattern for random_walk
     */
    generateRandomPattern(duration = 5000, frameCount = 10) {
        const frames = [];
        const timeStep = duration / (frameCount - 1);
        
        for (let i = 0; i < frameCount; i++) {
            frames.push({
                time: Math.round(i * timeStep),
                pwm: Math.round(Math.random() * 255)
            });
        }
        
        return frames;
    }
};

// Global access
if (typeof window !== 'undefined') {
    window.MotorPatterns = {
        MOTOR_PATTERN_LIBRARY,
        PATTERN_CATEGORIES,
        PatternUtils
    };
}