/**
 * Test Motor Commands - Multi-language Audio Data Generator
 * Creates realistic audio data for testing speech-to-text with motor control
 */

// Simulate realistic audio patterns for speech
function generateSpeechPattern(duration, frequency, amplitude, noiseLevel = 0.1) {
    const sampleRate = 16000;
    const samples = Math.floor(duration * sampleRate);
    const audioData = new Array(samples);
    
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        
        // Base speech-like waveform with harmonics
        let signal = 0;
        signal += Math.sin(2 * Math.PI * frequency * t) * amplitude;
        signal += Math.sin(2 * Math.PI * frequency * 2 * t) * amplitude * 0.5;
        signal += Math.sin(2 * Math.PI * frequency * 3 * t) * amplitude * 0.25;
        
        // Add formant-like resonances (speech characteristics)
        signal += Math.sin(2 * Math.PI * (frequency + 200) * t) * amplitude * 0.3;
        signal += Math.sin(2 * Math.PI * (frequency + 400) * t) * amplitude * 0.2;
        
        // Add envelope (speech has natural volume variations)
        const envelope = Math.sin(Math.PI * t / duration) * 0.8 + 0.2;
        signal *= envelope;
        
        // Add realistic noise
        const noise = (Math.random() - 0.5) * noiseLevel;
        signal += noise;
        
        // Convert to Int16 range
        audioData[i] = Math.max(-32768, Math.min(32767, Math.round(signal * 16000)));
    }
    
    return audioData;
}

// Generate pauses (silence)
function generateSilence(duration) {
    const sampleRate = 16000;
    const samples = Math.floor(duration * sampleRate);
    return new Array(samples).fill(0);
}

// Combine audio segments
function combineAudioSegments(segments) {
    return segments.flat();
}

/**
 * Test Case 1: English Command - "Turn it up"
 * Simulates: /tɜːrn ɪt ʌp/
 */
function generateEnglishCommand() {
    console.log('Generating English command: "Turn it up"');
    
    const segments = [
        generateSilence(0.1),           // Initial silence
        generateSpeechPattern(0.4, 150, 0.8, 0.15),  // "Turn" - lower frequency
        generateSilence(0.05),          // Brief pause
        generateSpeechPattern(0.2, 200, 0.6, 0.12),  // "it" - quick, higher
        generateSilence(0.05),          // Brief pause
        generateSpeechPattern(0.3, 180, 0.9, 0.18),  // "up" - emphasized
        generateSilence(0.2)            // Final silence
    ];
    
    return combineAudioSegments(segments);
}

/**
 * Test Case 2: Spanish Command - "Más fuerte"
 * Simulates: /mas ˈfweɾte/ (More strong/powerful)
 */
function generateSpanishCommand() {
    console.log('Generating Spanish command: "Más fuerte"');
    
    const segments = [
        generateSilence(0.1),           // Initial silence
        generateSpeechPattern(0.35, 160, 0.7, 0.14),  // "Más" - rolled sound
        generateSilence(0.08),          // Pause between words
        generateSpeechPattern(0.25, 190, 0.6, 0.13),  // "fuer" - quick start
        generateSpeechPattern(0.3, 170, 0.8, 0.16),   // "te" - emphasized ending
        generateSilence(0.2)            // Final silence
    ];
    
    return combineAudioSegments(segments);
}

/**
 * Test Case 3: Chinese Command - "加强" (jiā qiáng)
 * Simulates: /tɕja˥ tɕʰjaŋ˧˥/ (Strengthen/Increase)
 */
function generateChineseCommand() {
    console.log('Generating Chinese command: "加强" (jiā qiáng)');
    
    const segments = [
        generateSilence(0.1),           // Initial silence
        generateSpeechPattern(0.4, 180, 0.8, 0.12),  // "jiā" - rising tone
        generateSilence(0.06),          // Brief tonal pause
        generateSpeechPattern(0.45, 165, 0.9, 0.15), // "qiáng" - rising-falling tone
        generateSilence(0.2)            // Final silence
    ];
    
    return combineAudioSegments(segments);
}

// Test data structure
const testCases = [
    {
        language: 'English',
        command: 'Turn it up',
        expectedIntent: true,
        expectedPwmChange: 'increase',
        audioData: generateEnglishCommand(),
        languageCode: 'en-US'
    },
    {
        language: 'Spanish', 
        command: 'Más fuerte',
        expectedIntent: true,
        expectedPwmChange: 'increase',
        audioData: generateSpanishCommand(),
        languageCode: 'es-ES'
    },
    {
        language: 'Chinese',
        command: '加强',
        expectedIntent: true,
        expectedPwmChange: 'increase',
        audioData: generateChineseCommand(),
        languageCode: 'zh-CN'
    }
];

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testCases, generateSpeechPattern, generateSilence };
}

// Browser/global access
if (typeof window !== 'undefined') {
    window.motorCommandTests = { testCases, generateSpeechPattern, generateSilence };
}

console.log('Motor command test data generated:');
testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.language}: "${testCase.command}"`);
    console.log(`   - Audio samples: ${testCase.audioData.length}`);
    console.log(`   - Duration: ${(testCase.audioData.length / 16000).toFixed(2)}s`);
    console.log(`   - Language code: ${testCase.languageCode}`);
    console.log(`   - Expected: ${testCase.expectedPwmChange}`);
});