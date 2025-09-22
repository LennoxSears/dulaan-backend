/**
 * Test script for streaming audio functionality
 * Simulates the streaming audio processing logic
 */

// Mock audio data for testing
function generateMockAudioChunk(duration = 100, hasVoice = true) {
    const sampleRate = 16000;
    const samples = Math.floor(sampleRate * duration / 1000);
    const audioData = new Float32Array(samples);
    
    if (hasVoice) {
        // Generate voice-like audio with energy and varying frequency
        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            audioData[i] = 0.1 * Math.sin(2 * Math.PI * 200 * t) + 
                          0.05 * Math.sin(2 * Math.PI * 400 * t) +
                          0.02 * (Math.random() - 0.5);
        }
    } else {
        // Generate silence with minimal noise
        for (let i = 0; i < samples; i++) {
            audioData[i] = 0.005 * (Math.random() - 0.5);
        }
    }
    
    return audioData;
}

// Convert Float32Array to base64 (simulating client encoding)
function audioToBase64(audioData) {
    const int16Data = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
        int16Data[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32767));
    }
    
    const uint8Array = new Uint8Array(int16Data.buffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}

// Test Voice Activity Detection
function testVAD() {
    console.log('\n🧪 Testing Voice Activity Detection...');
    
    // Test with voice
    const voiceChunk = generateMockAudioChunk(100, true);
    const voiceBase64 = audioToBase64(voiceChunk);
    console.log(`Voice chunk: ${voiceChunk.length} samples, base64 length: ${voiceBase64.length}`);
    
    // Test with silence
    const silenceChunk = generateMockAudioChunk(100, false);
    const silenceBase64 = audioToBase64(silenceChunk);
    console.log(`Silence chunk: ${silenceChunk.length} samples, base64 length: ${silenceBase64.length}`);
    
    // Calculate energy for comparison
    const voiceEnergy = Math.sqrt(voiceChunk.reduce((sum, val) => sum + val * val, 0) / voiceChunk.length);
    const silenceEnergy = Math.sqrt(silenceChunk.reduce((sum, val) => sum + val * val, 0) / silenceChunk.length);
    
    console.log(`Voice energy: ${voiceEnergy.toFixed(6)}`);
    console.log(`Silence energy: ${silenceEnergy.toFixed(6)}`);
    console.log(`Energy ratio: ${(voiceEnergy / silenceEnergy).toFixed(2)}x`);
}

// Test streaming chunk generation
function testStreamingChunks() {
    console.log('\n🎵 Testing Streaming Chunk Generation...');
    
    // Simulate a conversation: silence -> voice -> silence -> voice -> silence
    const scenario = [
        { duration: 200, hasVoice: false, label: 'Initial silence' },
        { duration: 500, hasVoice: true, label: 'User says "turn it on"' },
        { duration: 300, hasVoice: false, label: 'Pause' },
        { duration: 800, hasVoice: true, label: 'User says "make it stronger"' },
        { duration: 400, hasVoice: false, label: 'Final silence' }
    ];
    
    let totalTime = 0;
    scenario.forEach((segment, index) => {
        const chunk = generateMockAudioChunk(segment.duration, segment.hasVoice);
        const base64 = audioToBase64(chunk);
        
        console.log(`Chunk ${index + 1}: ${segment.label}`);
        console.log(`  Duration: ${segment.duration}ms, Samples: ${chunk.length}`);
        console.log(`  Has voice: ${segment.hasVoice}, Base64 size: ${base64.length} chars`);
        
        totalTime += segment.duration;
    });
    
    console.log(`Total conversation duration: ${totalTime}ms`);
}

// Test API request format
function testAPIRequestFormat() {
    console.log('\n📡 Testing API Request Format...');
    
    const audioChunk = generateMockAudioChunk(500, true);
    const audioData = Array.from(new Int16Array(audioChunk.buffer));
    
    const streamingRequest = {
        msgHis: [
            {
                user: "turn it on",
                assistant: "Turning the motor on",
                timestamp: new Date().toISOString(),
                pwm: 150,
                intentDetected: true
            }
        ],
        audioData: audioData,
        currentPwm: 150,
        streamingMode: true,
        isFinal: false,
        chunkIndex: 2,
        streamId: "stream_1234567890_abc123"
    };
    
    console.log('Streaming request structure:');
    console.log(`  Audio data length: ${streamingRequest.audioData.length}`);
    console.log(`  Current PWM: ${streamingRequest.currentPwm}`);
    console.log(`  Message history: ${streamingRequest.msgHis.length} items`);
    console.log(`  Streaming mode: ${streamingRequest.streamingMode}`);
    console.log(`  Is final chunk: ${streamingRequest.isFinal}`);
    console.log(`  Chunk index: ${streamingRequest.chunkIndex}`);
    console.log(`  Stream ID: ${streamingRequest.streamId}`);
    
    const requestSize = JSON.stringify(streamingRequest).length;
    console.log(`  Total request size: ${requestSize} bytes (${(requestSize / 1024).toFixed(1)} KB)`);
}

// Test conversation flow simulation
function testConversationFlow() {
    console.log('\n💬 Testing Conversation Flow...');
    
    const conversationSteps = [
        { user: "Hello", ai: "Hi! I'm ready to help control the motor.", pwm: 100 },
        { user: "Turn it on", ai: "Turning the motor on", pwm: 150 },
        { user: "Make it stronger", ai: "Increasing motor intensity", pwm: 200 },
        { user: "What's the weather?", ai: "I'm a motor control assistant. I can help you control the motor.", pwm: 200 },
        { user: "Turn it off", ai: "Turning the motor off", pwm: 0 }
    ];
    
    let conversationHistory = [];
    
    conversationSteps.forEach((step, index) => {
        console.log(`\nStep ${index + 1}:`);
        console.log(`  User: "${step.user}"`);
        console.log(`  AI: "${step.ai}"`);
        console.log(`  PWM: ${step.pwm}`);
        
        conversationHistory.push({
            user: step.user,
            assistant: step.ai,
            timestamp: new Date().toISOString(),
            pwm: step.pwm,
            intentDetected: step.pwm !== conversationHistory[conversationHistory.length - 1]?.pwm
        });
        
        console.log(`  Intent detected: ${conversationHistory[conversationHistory.length - 1].intentDetected}`);
        console.log(`  History length: ${conversationHistory.length}`);
    });
    
    console.log('\nFinal conversation history:');
    conversationHistory.forEach((msg, i) => {
        console.log(`  ${i + 1}. User: "${msg.user}" → AI: "${msg.assistant}" (PWM: ${msg.pwm})`);
    });
}

// Run all tests
function runTests() {
    console.log('🚀 Starting Streaming Audio Tests...');
    
    testVAD();
    testStreamingChunks();
    testAPIRequestFormat();
    testConversationFlow();
    
    console.log('\n✅ All tests completed!');
    console.log('\nNext steps:');
    console.log('1. Deploy the updated Cloud Function with streaming support');
    console.log('2. Test with streaming-demo.html');
    console.log('3. Verify real-time conversation flow');
    console.log('4. Test motor control responsiveness');
}

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && require.main === module) {
    runTests();
} else {
    // Export for use in other files
    if (typeof module !== 'undefined') {
        module.exports = {
            generateMockAudioChunk,
            audioToBase64,
            testVAD,
            testStreamingChunks,
            testAPIRequestFormat,
            testConversationFlow,
            runTests
        };
    }
}

runTests();