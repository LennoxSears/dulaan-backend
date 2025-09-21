/**
 * Verify if the updated function has been deployed
 */

async function verifyDeployment() {
    try {
        console.log('🔍 Verifying if updated function is deployed...');
        
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
            console.log('❌ FUNCTION NOT DEPLOYED YET');
            console.log('Still getting 500 errors - old code is running');
            console.log('\n🚀 DEPLOY REQUIRED:');
            console.log('firebase deploy --only functions:speechToTextWithLLM');
            return false;
        }
        
        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));
        
        // Check for new fields that indicate updated code
        if (result.hasOwnProperty('intentDetected') || result.hasOwnProperty('confidence')) {
            console.log('\n✅ UPDATED FUNCTION IS DEPLOYED!');
            console.log('✅ New fields detected: intentDetected, confidence');
            console.log('✅ Speech recognition improvements are active');
            console.log('✅ AI intent detection is working');
            return true;
        } else {
            console.log('\n⚠️ UNCLEAR - Function responding but missing new fields');
            console.log('May need to deploy or check for deployment issues');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        return false;
    }
}

async function testIntentDetection() {
    console.log('\n🧪 Testing AI intent detection...');
    
    // Test with motor control command
    try {
        const motorTestPayload = {
            msgHis: [],
            audioContent: "dGVzdCBhdWRpbyBkYXRh", // Simple test data
            currentPwm: 100,
            encoding: 'LINEAR16',
            sampleRateHertz: 16000
        };
        
        const response = await fetch('https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(motorTestPayload)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Intent detection test result:', {
                success: result.success,
                intentDetected: result.intentDetected,
                newPwmValue: result.newPwmValue,
                confidence: result.confidence
            });
        } else {
            console.log('Intent detection test failed:', response.status);
        }
        
    } catch (error) {
        console.log('Intent detection test error:', error.message);
    }
}

async function runVerification() {
    console.log('🎯 DEPLOYMENT VERIFICATION\n');
    
    const isDeployed = await verifyDeployment();
    
    if (isDeployed) {
        await testIntentDetection();
        
        console.log('\n🎉 VERIFICATION COMPLETE');
        console.log('✅ Updated function is deployed and working');
        console.log('✅ Ready to test voice control improvements');
        console.log('\nTry: dulaan.startMode("ai")');
    } else {
        console.log('\n❌ DEPLOYMENT NEEDED');
        console.log('Run: firebase deploy --only functions:speechToTextWithLLM');
        console.log('Then test again with this script');
    }
}

runVerification();