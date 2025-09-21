/**
 * Test the function with raw PCM audio format (matches client)
 */

async function testWithRawPCM() {
    try {
        console.log('🧪 Testing with raw PCM audio (matches client format)...');
        
        // Create raw PCM data like the client does (Int16Array at 16000 Hz)
        const sampleCount = 16000; // 1 second of audio at 16kHz
        const int16Data = new Int16Array(sampleCount);
        
        // Generate some audio-like data (sine wave)
        for (let i = 0; i < sampleCount; i++) {
            const freq = 440; // A4 note
            const sample = Math.sin(2 * Math.PI * freq * i / 16000) * 16000;
            int16Data[i] = Math.max(-32768, Math.min(32767, sample));
        }
        
        // Convert to base64 like the client does
        const uint8Array = new Uint8Array(int16Data.buffer);
        const audioBase64 = btoa(String.fromCharCode.apply(null, uint8Array));
        
        console.log(`Generated raw PCM: ${sampleCount} samples, ${audioBase64.length} base64 chars`);
        
        const testPayload = {
            msgHis: [],
            audioContent: audioBase64,
            currentPwm: 100,
            encoding: 'LINEAR16',
            sampleRateHertz: 16000  // Explicitly set to match client
        };
        
        const response = await fetch('https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });
        
        console.log('Response status:', response.status);
        
        if (response.status === 500) {
            const errorText = await response.text();
            console.log('❌ Still getting 500 error:', errorText);
            return false;
        }
        
        const result = await response.json();
        console.log('✅ Response received:');
        console.log(JSON.stringify(result, null, 2));
        
        // Check for new fields indicating the updated code is working
        const hasNewFields = result.hasOwnProperty('intentDetected') || 
                           result.hasOwnProperty('confidence') ||
                           result.hasOwnProperty('detectedLanguage');
        
        if (hasNewFields) {
            console.log('\n🎉 SUCCESS! Updated function is working with raw PCM!');
            console.log('✅ New fields detected - improvements are active');
            console.log('✅ Raw PCM audio processing working');
            console.log('✅ 16000 Hz sample rate accepted');
            return true;
        } else {
            console.log('\n⚠️ Function working but may be old version');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

async function testWithSilentPCM() {
    try {
        console.log('\n🧪 Testing with silent PCM audio...');
        
        // Create silent PCM data (all zeros)
        const sampleCount = 8000; // 0.5 seconds at 16kHz
        const int16Data = new Int16Array(sampleCount); // All zeros by default
        
        const uint8Array = new Uint8Array(int16Data.buffer);
        const audioBase64 = btoa(String.fromCharCode.apply(null, uint8Array));
        
        const testPayload = {
            msgHis: [],
            audioContent: audioBase64,
            currentPwm: 150,
            encoding: 'LINEAR16',
            sampleRateHertz: 16000
        };
        
        const response = await fetch('https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });
        
        console.log('Silent PCM response status:', response.status);
        
        const result = await response.json();
        console.log('Silent PCM result:', {
            success: result.success,
            error: result.error,
            newPwmValue: result.newPwmValue,
            intentDetected: result.intentDetected
        });
        
        // Should return 200 with "No speech detected" and preserve PWM
        if (response.status === 200 && 
            result.success === false && 
            result.error === 'No speech detected in audio' &&
            result.newPwmValue === 150) {
            console.log('✅ Silent audio handling correct - PWM preserved');
            return true;
        } else {
            console.log('❌ Silent audio handling incorrect');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Silent PCM test failed:', error.message);
        return false;
    }
}

async function runPCMTests() {
    console.log('🎵 TESTING RAW PCM AUDIO FORMAT (CLIENT-COMPATIBLE)\n');
    
    const audioTest = await testWithRawPCM();
    const silentTest = await testWithSilentPCM();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PCM AUDIO TEST RESULTS:');
    console.log(`Raw PCM audio test: ${audioTest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Silent PCM test: ${silentTest ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (audioTest && silentTest) {
        console.log('\n🎉 ALL PCM TESTS PASSED!');
        console.log('✅ Function correctly handles client audio format');
        console.log('✅ 16000 Hz raw PCM processing working');
        console.log('✅ Ready for voice control testing');
        console.log('\nTry: dulaan.startMode("ai")');
    } else {
        console.log('\n❌ Some tests failed - check deployment status');
    }
    console.log('='.repeat(60));
}

runPCMTests();