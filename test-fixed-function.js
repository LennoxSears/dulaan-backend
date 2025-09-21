/**
 * Test the fixed function after deployment
 */

async function testFixedFunction() {
    try {
        console.log('🧪 Testing fixed speechToTextWithLLM function...');
        
        const testPayload = {
            msgHis: [],
            audioContent: "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
            currentPwm: 100,
            encoding: 'LINEAR16'
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
            console.log('🔄 May need to redeploy or check logs again');
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
            console.log('\n🎉 SUCCESS! Updated function is working!');
            console.log('✅ New fields detected - improvements are active');
            console.log('✅ Speech recognition enhancements deployed');
            console.log('✅ AI intent detection deployed');
            return true;
        } else {
            console.log('\n⚠️ Function working but may be old version');
            console.log('Check if deployment completed successfully');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

async function testVoiceControl() {
    console.log('\n🎯 Testing voice control readiness...');
    console.log('After successful deployment, you should be able to:');
    console.log('1. Run: dulaan.startMode("ai")');
    console.log('2. Speak motor commands: "turn it up", "slow down", "stop"');
    console.log('3. Speak non-motor phrases: "hello", "what time is it"');
    console.log('4. See improved accuracy and smart PWM control');
}

async function runTest() {
    console.log('🔍 TESTING FIXED FUNCTION\n');
    
    const isWorking = await testFixedFunction();
    await testVoiceControl();
    
    console.log('\n' + '='.repeat(60));
    if (isWorking) {
        console.log('🎉 FUNCTION IS WORKING! Ready for voice control testing.');
    } else {
        console.log('❌ Function still has issues. Check deployment status.');
    }
    console.log('='.repeat(60));
}

runTest();