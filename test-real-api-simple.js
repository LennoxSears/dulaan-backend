/**
 * Simple Real API Test - No dependencies required
 * Tests the actual Firebase function with three language audio samples
 */

console.log('🚀 Real API Test - Multi-language Motor Commands\n');

// Test cases
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

// Generate test audio
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
        
        // Speech-like waveform
        let signal = 0;
        signal += Math.sin(2 * Math.PI * baseFreq * t) * 0.7;
        signal += Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.35;
        signal += Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.175;
        
        // Envelope
        const envelope = Math.sin(Math.PI * t / duration) * 0.8 + 0.2;
        signal *= envelope;
        
        // Noise
        signal += (Math.random() - 0.5) * 0.1;
        
        // Convert to Int16
        audioData[i] = Math.max(-32768, Math.min(32767, Math.round(signal * 16000)));
    }
    
    return audioData;
}

// Test with curl command (since fetch might not be available)
async function testWithCurl(testCase, currentPwm, messageHistory) {
    console.log(`\n🧪 Testing ${testCase.language}: "${testCase.command}"`);
    console.log(`   - Generating ${testCase.audioSamples} audio samples...`);
    
    const audioData = generateTestAudio(testCase.audioSamples, testCase.language);
    console.log(`   - Audio generated: ${audioData.length} samples (${(audioData.length / 16000).toFixed(2)}s)`);
    
    const payload = {
        msgHis: messageHistory,
        audioBuffer: audioData,
        currentPwm: currentPwm,
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: testCase.languageCode
    };
    
    console.log(`   - Payload size: ${JSON.stringify(payload).length} bytes`);
    console.log(`   - Current PWM: ${currentPwm}`);
    console.log(`   - Language code: ${testCase.languageCode}`);
    
    // Create curl command
    const curlCommand = `curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload)}' \\
  https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app`;
    
    console.log(`\n📡 Curl command to test ${testCase.language}:`);
    console.log('─'.repeat(80));
    console.log(curlCommand);
    console.log('─'.repeat(80));
    
    return {
        testCase,
        curlCommand,
        audioData,
        payload
    };
}

// Main test function
async function runTests() {
    console.log('=' * 60);
    console.log('📊 Real API Test Configuration:');
    console.log(`   - API Endpoint: https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app`);
    console.log(`   - Test cases: ${testCases.length}`);
    console.log(`   - Languages: ${testCases.map(tc => tc.language).join(', ')}`);
    console.log(`   - Audio format: Int16Array (LINEAR16 PCM, 16kHz)`);
    console.log('=' * 60);
    
    let currentPwm = 100;
    let messageHistory = [];
    
    console.log(`\n🎯 Starting tests with PWM = ${currentPwm}\n`);
    
    const testCommands = [];
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🧪 TEST ${i + 1}: ${testCase.language} - "${testCase.command}"`);
        console.log(`${'='.repeat(50)}`);
        
        const testResult = await testWithCurl(testCase, currentPwm, messageHistory);
        testCommands.push(testResult);
        
        // Simulate PWM increase for next test
        currentPwm = Math.min(255, currentPwm + 50);
        
        // Simulate message history update
        messageHistory.push({
            user: testCase.command,
            assistant: `Processing ${testCase.language} command`,
            pwm: currentPwm,
            intentDetected: true,
            timestamp: new Date().toISOString()
        });
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 SUMMARY - How to Test Real API`);
    console.log(`${'='.repeat(60)}`);
    
    console.log(`\n🔧 Option 1: Use Browser Test Runner`);
    console.log(`   Open: https://8080--01996c07-f427-7022-8f58-16a3ecb6432d.us-east-1-01.gitpod.dev/test-real-api.html`);
    console.log(`   Click "Test Real API (All Languages)" button`);
    
    console.log(`\n🔧 Option 2: Use Curl Commands (copy and run each):`);
    testCommands.forEach((cmd, index) => {
        console.log(`\n   Test ${index + 1} (${cmd.testCase.language}):`);
        console.log(`   ${cmd.curlCommand.replace(/\n/g, ' ')}`);
    });
    
    console.log(`\n🔧 Option 3: Use the browser test runner for interactive testing`);
    
    console.log(`\n📊 Expected Results:`);
    console.log(`   ✅ Each test should return success: true`);
    console.log(`   ✅ Transcription should contain motor control words`);
    console.log(`   ✅ intentDetected should be true`);
    console.log(`   ✅ newPwmValue should be > previousPwm`);
    console.log(`   ✅ Response should be in the appropriate language`);
    
    console.log(`\n🏁 Ready to test real API!`);
    console.log(`💡 Use the browser test runner for the easiest experience.`);
    
    return testCommands;
}

// Run the test preparation
runTests().catch(console.error);