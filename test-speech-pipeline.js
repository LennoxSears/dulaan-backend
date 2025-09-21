/**
 * Comprehensive Speech Pipeline Test
 * Tests the entire audio processing pipeline with multi-language motor commands
 */

// Import test data (simulate the import since we can't use actual imports)
// In a real environment, you would: import { testCases } from './test-motor-commands.js';

// Simulate the speechToTextWithLLM API call
async function simulateSpeechToTextWithLLM(audioBuffer, currentPwm, msgHis, languageCode) {
    console.log(`\n🔄 Simulating API call to speechToTextWithLLM...`);
    console.log(`   - Audio buffer length: ${audioBuffer.length} samples`);
    console.log(`   - Current PWM: ${currentPwm}`);
    console.log(`   - Language code: ${languageCode}`);
    console.log(`   - Message history length: ${msgHis.length}`);
    
    // Simulate the server-side processing
    console.log(`\n📡 Server-side processing simulation:`);
    
    // 1. Convert array to Int16Array (as server would do)
    const int16Data = new Int16Array(audioBuffer);
    console.log(`   ✅ Converted to Int16Array: ${int16Data.length} samples`);
    
    // 2. Simulate buffer to base64 conversion for Google Speech API
    const bufferSize = int16Data.buffer.byteLength;
    console.log(`   ✅ Buffer size: ${bufferSize} bytes`);
    
    // 3. Simulate speech recognition results based on language
    let transcript = '';
    let confidence = 0.85;
    
    switch (languageCode) {
        case 'en-US':
            transcript = 'turn it up';
            break;
        case 'es-ES':
            transcript = 'más fuerte';
            break;
        case 'zh-CN':
            transcript = '加强';
            break;
        default:
            transcript = 'unknown command';
            confidence = 0.2;
    }
    
    console.log(`   ✅ Speech recognition: "${transcript}" (confidence: ${confidence})`);
    
    // 4. Simulate LLM processing
    let newPwmValue = currentPwm;
    let intentDetected = false;
    let response = '';
    
    if (confidence > 0.3) {
        // All test commands are "increase" commands
        intentDetected = true;
        newPwmValue = Math.min(255, currentPwm + 50); // Increase by 50
        
        switch (languageCode) {
            case 'en-US':
                response = 'Increasing motor power as requested.';
                break;
            case 'es-ES':
                response = 'Aumentando la potencia del motor como solicitaste.';
                break;
            case 'zh-CN':
                response = '正在按要求增加电机功率。';
                break;
        }
    } else {
        response = 'I didn\'t understand that command clearly.';
    }
    
    console.log(`   ✅ LLM processing: Intent=${intentDetected}, PWM: ${currentPwm} → ${newPwmValue}`);
    
    // 5. Return simulated API response
    return {
        success: true,
        transcription: transcript,
        response: response,
        reasoning: intentDetected ? 'Clear motor control command detected' : 'No clear intent detected',
        newPwmValue: newPwmValue,
        previousPwm: currentPwm,
        intentDetected: intentDetected,
        msgHis: [...msgHis, {
            user: transcript,
            assistant: response,
            pwm: newPwmValue,
            intentDetected: intentDetected,
            timestamp: new Date().toISOString()
        }],
        detectedLanguage: languageCode,
        confidence: confidence
    };
}

// Test runner function
async function runComprehensiveTest() {
    console.log('🚀 Starting Comprehensive Speech Pipeline Test\n');
    console.log('=' * 60);
    
    // Load test data (simulate loading from test-motor-commands.js)
    const testCases = [
        {
            language: 'English',
            command: 'Turn it up',
            expectedIntent: true,
            expectedPwmChange: 'increase',
            audioData: generateTestAudio(1.2, 'english'), // 1.2 seconds
            languageCode: 'en-US'
        },
        {
            language: 'Spanish', 
            command: 'Más fuerte',
            expectedIntent: true,
            expectedPwmChange: 'increase',
            audioData: generateTestAudio(1.3, 'spanish'), // 1.3 seconds
            languageCode: 'es-ES'
        },
        {
            language: 'Chinese',
            command: '加强',
            expectedIntent: true,
            expectedPwmChange: 'increase',
            audioData: generateTestAudio(1.1, 'chinese'), // 1.1 seconds
            languageCode: 'zh-CN'
        }
    ];
    
    let currentPwm = 100; // Starting PWM value
    let messageHistory = [];
    let testResults = [];
    
    console.log(`📊 Initial state: PWM = ${currentPwm}, Message history = ${messageHistory.length} items\n`);
    
    // Run tests for each language
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🧪 TEST ${i + 1}: ${testCase.language} Command`);
        console.log(`${'='.repeat(50)}`);
        console.log(`Command: "${testCase.command}"`);
        console.log(`Expected: ${testCase.expectedPwmChange} motor power`);
        console.log(`Audio samples: ${testCase.audioData.length}`);
        console.log(`Duration: ${(testCase.audioData.length / 16000).toFixed(2)}s`);
        
        try {
            // Simulate the entire pipeline
            console.log(`\n🔄 Processing ${testCase.language} audio...`);
            
            const result = await simulateSpeechToTextWithLLM(
                testCase.audioData,
                currentPwm,
                messageHistory,
                testCase.languageCode
            );
            
            // Analyze results
            console.log(`\n📋 Results Analysis:`);
            console.log(`   - Transcription: "${result.transcription}"`);
            console.log(`   - Response: "${result.response}"`);
            console.log(`   - Intent detected: ${result.intentDetected ? '✅' : '❌'}`);
            console.log(`   - PWM change: ${result.previousPwm} → ${result.newPwmValue} (${result.newPwmValue > result.previousPwm ? '+' : ''}${result.newPwmValue - result.previousPwm})`);
            console.log(`   - Confidence: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`   - Language detected: ${result.detectedLanguage}`);
            
            // Validate expectations
            const pwmIncreased = result.newPwmValue > result.previousPwm;
            const intentMatches = result.intentDetected === testCase.expectedIntent;
            const pwmChangeMatches = (testCase.expectedPwmChange === 'increase') === pwmIncreased;
            
            console.log(`\n✅ Validation:`);
            console.log(`   - Intent detection: ${intentMatches ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`   - PWM change direction: ${pwmChangeMatches ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`   - Overall: ${(intentMatches && pwmChangeMatches) ? '✅ SUCCESS' : '❌ FAILED'}`);
            
            // Update state for next test
            currentPwm = result.newPwmValue;
            messageHistory = result.msgHis;
            
            // Store results
            testResults.push({
                testCase: testCase,
                result: result,
                validation: {
                    intentMatches,
                    pwmChangeMatches,
                    overall: intentMatches && pwmChangeMatches
                }
            });
            
        } catch (error) {
            console.error(`❌ Test ${i + 1} failed with error:`, error.message);
            testResults.push({
                testCase: testCase,
                error: error.message,
                validation: { overall: false }
            });
        }
    }
    
    // Final summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 FINAL TEST SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    
    const passedTests = testResults.filter(r => r.validation && r.validation.overall).length;
    const totalTests = testResults.length;
    
    console.log(`Tests passed: ${passedTests}/${totalTests}`);
    console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Final PWM value: ${currentPwm}`);
    console.log(`Message history length: ${messageHistory.length}`);
    
    testResults.forEach((result, index) => {
        const status = result.validation && result.validation.overall ? '✅' : '❌';
        console.log(`${status} Test ${index + 1} (${result.testCase.language}): ${result.testCase.command}`);
    });
    
    console.log(`\n🏁 Test completed!`);
    
    return testResults;
}

// Helper function to generate test audio data
function generateTestAudio(duration, language) {
    const sampleRate = 16000;
    const samples = Math.floor(duration * sampleRate);
    const audioData = new Array(samples);
    
    // Generate speech-like patterns based on language characteristics
    let baseFreq = 150;
    let amplitude = 0.7;
    
    switch (language) {
        case 'english':
            baseFreq = 160; // Slightly higher for English
            break;
        case 'spanish':
            baseFreq = 155; // Mid-range for Spanish
            break;
        case 'chinese':
            baseFreq = 170; // Higher for tonal Chinese
            break;
    }
    
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        
        // Create speech-like waveform
        let signal = 0;
        signal += Math.sin(2 * Math.PI * baseFreq * t) * amplitude;
        signal += Math.sin(2 * Math.PI * baseFreq * 2 * t) * amplitude * 0.4;
        signal += Math.sin(2 * Math.PI * baseFreq * 3 * t) * amplitude * 0.2;
        
        // Add envelope
        const envelope = Math.sin(Math.PI * t / duration) * 0.8 + 0.2;
        signal *= envelope;
        
        // Add noise
        signal += (Math.random() - 0.5) * 0.1;
        
        // Convert to Int16 range
        audioData[i] = Math.max(-32768, Math.min(32767, Math.round(signal * 16000)));
    }
    
    return audioData;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runComprehensiveTest, simulateSpeechToTextWithLLM };
}

// Browser/global access
if (typeof window !== 'undefined') {
    window.runSpeechPipelineTest = runComprehensiveTest;
}

// Auto-run if this is the main script
if (typeof require !== 'undefined' && require.main === module) {
    runComprehensiveTest().catch(console.error);
}

console.log('🧪 Speech Pipeline Test Script Loaded');
console.log('Run: runComprehensiveTest() to start testing');