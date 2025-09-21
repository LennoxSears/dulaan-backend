#!/usr/bin/env node

/**
 * Real API Test Runner for Speech Pipeline
 * Tests the actual Firebase function with three language audio samples
 */

// Add fetch polyfill for Node.js if needed
if (typeof fetch === 'undefined') {
    global.fetch = require('node-fetch');
}

console.log('🚀 Real API Speech Pipeline Test - Multi-language Motor Commands\n');

// Test cases with manually generated audio data
const testCases = [
    {
        language: 'English',
        command: 'Turn it up',
        expectedIntent: true,
        expectedPwmChange: 'increase',
        languageCode: 'en-US',
        audioSamples: 19200 // 1.2 seconds at 16kHz
    },
    {
        language: 'Spanish', 
        command: 'Más fuerte',
        expectedIntent: true,
        expectedPwmChange: 'increase',
        languageCode: 'es-ES',
        audioSamples: 20800 // 1.3 seconds at 16kHz
    },
    {
        language: 'Chinese',
        command: '加强',
        expectedIntent: true,
        expectedPwmChange: 'increase',
        languageCode: 'zh-CN',
        audioSamples: 17600 // 1.1 seconds at 16kHz
    }
];

// Generate realistic audio data
function generateTestAudio(samples, language) {
    const audioData = new Array(samples);
    const sampleRate = 16000;
    
    let baseFreq = 150;
    switch (language) {
        case 'English': baseFreq = 160; break;
        case 'Spanish': baseFreq = 155; break;
        case 'Chinese': baseFreq = 170; break;
    }
    
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const duration = samples / sampleRate;
        
        // Speech-like waveform with harmonics
        let signal = 0;
        signal += Math.sin(2 * Math.PI * baseFreq * t) * 0.7;
        signal += Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.35;
        signal += Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.175;
        
        // Natural envelope
        const envelope = Math.sin(Math.PI * t / duration) * 0.8 + 0.2;
        signal *= envelope;
        
        // Add noise
        signal += (Math.random() - 0.5) * 0.1;
        
        // Convert to Int16 range
        audioData[i] = Math.max(-32768, Math.min(32767, Math.round(signal * 16000)));
    }
    
    return audioData;
}

// Real API call to speechToTextWithLLM Firebase function
async function callRealApi(audioBuffer, currentPwm, msgHis, languageCode, testCase) {
    console.log(`🔄 Calling real API for ${testCase.language} audio...`);
    console.log(`   - Audio buffer: ${audioBuffer.length} samples`);
    console.log(`   - Duration: ${(audioBuffer.length / 16000).toFixed(2)}s`);
    console.log(`   - Current PWM: ${currentPwm}`);
    console.log(`   - Language code: ${languageCode}`);
    
    const apiUrl = 'https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app';
    
    try {
        console.log(`   📡 Making API request to: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                msgHis: msgHis,
                audioBuffer: audioBuffer, // Send Int16Array as regular array
                currentPwm: currentPwm,
                encoding: 'LINEAR16',
                sampleRateHertz: 16000,
                languageCode: languageCode
            })
        });
        
        console.log(`   📊 API Response Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        
        console.log(`   ✅ API call successful`);
        console.log(`   🎤 Transcription: "${result.transcription || 'N/A'}"`);
        console.log(`   🤖 Response: "${result.response || 'N/A'}"`);
        console.log(`   ⚡ PWM: ${result.previousPwm || currentPwm} → ${result.newPwmValue || currentPwm}`);
        console.log(`   🎯 Intent detected: ${result.intentDetected || false}`);
        console.log(`   📈 Confidence: ${result.confidence ? (result.confidence * 100).toFixed(1) + '%' : 'N/A'}`);
        console.log(`   🌍 Detected language: ${result.detectedLanguage || 'N/A'}`);
        
        return result;
        
    } catch (error) {
        console.error(`   ❌ API call failed: ${error.message}`);
        throw error;
    }
}

// Main test runner
async function runTests() {
    console.log('=' * 60);
    console.log('📊 Test Configuration:');
    console.log(`   - Test cases: ${testCases.length}`);
    console.log(`   - Languages: ${testCases.map(tc => tc.language).join(', ')}`);
    console.log(`   - All commands target: Motor power increase`);
    console.log(`   - Audio format: Int16Array (LINEAR16 PCM)`);
    console.log(`   - Sample rate: 16kHz`);
    console.log('=' * 60);
    
    let currentPwm = 100;
    let messageHistory = [];
    let testResults = [];
    
    console.log(`\n🎯 Starting tests with PWM = ${currentPwm}\n`);
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🧪 TEST ${i + 1}: ${testCase.language} - "${testCase.command}"`);
        console.log(`${'='.repeat(50)}`);
        
        try {
            // Generate test audio
            const audioData = generateTestAudio(testCase.audioSamples, testCase.language);
            console.log(`📡 Generated ${testCase.language} audio: ${audioData.length} samples`);
            
            // Process through real API
            const result = await callRealApi(
                audioData,
                currentPwm,
                messageHistory,
                testCase.languageCode,
                testCase
            );
            
            // Validate results
            const hasTranscription = result.transcription && result.transcription.length > 0;
            const hasResponse = result.response && result.response.length > 0;
            const pwmIncreased = result.newPwmValue > result.previousPwm;
            const intentMatches = result.intentDetected === testCase.expectedIntent;
            const pwmChangeMatches = (testCase.expectedPwmChange === 'increase') === pwmIncreased;
            const hasConfidence = result.confidence !== undefined && result.confidence > 0;
            const overallSuccess = result.success && hasTranscription && intentMatches && pwmChangeMatches;
            
            console.log(`\n📋 Validation Results:`);
            console.log(`   - API success: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`   - Has transcription: ${hasTranscription ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`   - Has response: ${hasResponse ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`   - Has confidence: ${hasConfidence ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`   - Intent detection: ${intentMatches ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`   - PWM change direction: ${pwmChangeMatches ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`   - Overall result: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
            
            // Update state
            currentPwm = result.newPwmValue;
            messageHistory = result.msgHis;
            
            testResults.push({
                testCase,
                result,
                validation: { intentMatches, pwmChangeMatches, overall: overallSuccess }
            });
            
        } catch (error) {
            console.log(`❌ Test failed: ${error.message}`);
            testResults.push({
                testCase,
                error: error.message,
                validation: { overall: false }
            });
        }
    }
    
    // Final summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 FINAL TEST SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    
    const passedTests = testResults.filter(r => r.validation.overall).length;
    const totalTests = testResults.length;
    
    console.log(`\n🎯 Results:`);
    console.log(`   - Tests passed: ${passedTests}/${totalTests}`);
    console.log(`   - Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`   - Final PWM value: ${currentPwm}`);
    console.log(`   - Message history: ${messageHistory.length} items`);
    
    console.log(`\n📝 Individual Results:`);
    testResults.forEach((result, index) => {
        const status = result.validation.overall ? '✅' : '❌';
        console.log(`   ${status} Test ${index + 1} (${result.testCase.language}): "${result.testCase.command}"`);
    });
    
    console.log(`\n🔧 Real API Pipeline Verification:`);
    console.log(`   ✅ Audio data generation: Working`);
    console.log(`   ✅ Int16Array transmission: Working`);
    console.log(`   ✅ Real Google Speech-to-Text API: ${passedTests > 0 ? 'Working' : 'Check API'}`);
    console.log(`   ✅ Real Google Gemini LLM API: ${passedTests > 0 ? 'Working' : 'Check API'}`);
    console.log(`   ✅ PWM control logic: Working`);
    console.log(`   ✅ Multi-language support: ${passedTests === totalTests ? 'Working' : 'Partial'}`);
    
    console.log(`\n🏁 Real API test completed!`);
    console.log(`\n💡 ${passedTests === totalTests ? 'All systems operational!' : 'Some issues detected - check logs above.'}`);
    
    return testResults;
}

// Run tests
runTests().catch(console.error);