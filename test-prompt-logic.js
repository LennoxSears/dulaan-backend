/**
 * Test script to verify the updated prompt logic
 * This simulates how the AI should respond to different audio types
 */

// Simulate the updated prompt logic
function testPromptLogic() {
    console.log('🧪 Testing Simplified Prompt Logic - Human Commands Only\n');
    
    // Test scenarios
    const testCases = [
        {
            name: 'Human Command: "turn it on"',
            audioType: 'human_speech',
            transcription: 'turn it on',
            expectedIntentDetected: true,
            expectedPwmChange: true,
            currentPwm: 0
        },
        {
            name: 'Motor Sound: buzzing/humming',
            audioType: 'motor_sound',
            transcription: 'motor sound',
            expectedIntentDetected: false,
            expectedPwmChange: false,
            currentPwm: 150
        },
        {
            name: 'Human Command: "make it stronger"',
            audioType: 'human_speech',
            transcription: 'make it stronger',
            expectedIntentDetected: true,
            expectedPwmChange: true,
            currentPwm: 100
        },
        {
            name: 'Background Noise',
            audioType: 'background_noise',
            transcription: 'background noise',
            expectedIntentDetected: false,
            expectedPwmChange: false,
            currentPwm: 200
        },
        {
            name: 'Human Non-Motor Command: "what\'s the weather"',
            audioType: 'human_speech',
            transcription: 'what\'s the weather',
            expectedIntentDetected: false,
            expectedPwmChange: false,
            currentPwm: 75
        },
        {
            name: 'Unclear Audio',
            audioType: 'unclear',
            transcription: 'unclear audio',
            expectedIntentDetected: false,
            expectedPwmChange: false,
            currentPwm: 120
        }
    ];
    
    // Simulate AI responses based on updated prompt
    testCases.forEach((testCase, index) => {
        console.log(`\n${index + 1}. ${testCase.name}`);
        console.log(`   Audio Type: ${testCase.audioType}`);
        console.log(`   Transcription: "${testCase.transcription}"`);
        console.log(`   Current PWM: ${testCase.currentPwm}`);
        
        // Simulate the expected AI response based on new prompt logic
        const simulatedResponse = simulateAIResponse(testCase);
        
        console.log(`   Expected Intent: ${testCase.expectedIntentDetected}`);
        console.log(`   Simulated Intent: ${simulatedResponse.intentDetected}`);
        console.log(`   Expected PWM Change: ${testCase.expectedPwmChange}`);
        console.log(`   Simulated PWM: ${simulatedResponse.pwm}`);
        console.log(`   PWM Changed: ${simulatedResponse.pwm !== testCase.currentPwm}`);
        
        // Validate results
        const intentMatch = simulatedResponse.intentDetected === testCase.expectedIntentDetected;
        const pwmChangeMatch = (simulatedResponse.pwm !== testCase.currentPwm) === testCase.expectedPwmChange;
        
        if (intentMatch && pwmChangeMatch) {
            console.log(`   ✅ PASS - Correct behavior`);
        } else {
            console.log(`   ❌ FAIL - Incorrect behavior`);
            if (!intentMatch) console.log(`      - Intent detection mismatch`);
            if (!pwmChangeMatch) console.log(`      - PWM change behavior mismatch`);
        }
    });
    
    console.log('\n📊 Summary:');
    console.log('The simplified prompt should now:');
    console.log('✅ Only respond to clear human voice commands');
    console.log('✅ Keep current PWM for any non-human audio');
    console.log('✅ Maintain PWM for non-motor human commands');
    console.log('✅ Focus on human motor control intent only');
}

function simulateAIResponse(testCase) {
    // Simulate how the AI should respond based on the simplified prompt
    const { audioType, transcription, currentPwm } = testCase;
    
    // Simplified logic: Only respond to clear human motor commands
    // Everything else keeps current PWM
    
    if (audioType === 'human_speech') {
        // Check if it's a motor control command
        const isMotorCommand = isMotorControlCommand(transcription);
        
        if (isMotorCommand) {
            return {
                intentDetected: true,
                transcription: transcription,
                pwm: calculateNewPwm(transcription, currentPwm),
                response: getMotorControlResponse(transcription),
                confidence: 0.9
            };
        } else {
            return {
                intentDetected: false,
                transcription: transcription,
                pwm: currentPwm, // Keep current PWM for non-motor commands
                response: "I'm a motor control assistant. I can help you control the motor device.",
                confidence: 0.9
            };
        }
    }
    
    // For any non-human audio, keep current PWM
    return {
        intentDetected: false,
        transcription: transcription,
        pwm: currentPwm, // Keep current PWM
        response: getResponseForNonHuman(audioType),
        confidence: audioType === 'motor_sound' ? 0.8 : 0.3
    };
}

function isMotorControlCommand(transcription) {
    const motorKeywords = [
        'turn it on', 'turn on', 'start', 'power on',
        'turn it off', 'turn off', 'stop', 'power off',
        'make it stronger', 'increase', 'higher', 'more power',
        'make it weaker', 'decrease', 'lower', 'less power',
        'set to', 'change to', 'adjust'
    ];
    
    return motorKeywords.some(keyword => 
        transcription.toLowerCase().includes(keyword.toLowerCase())
    );
}

function calculateNewPwm(transcription, currentPwm) {
    const lower = transcription.toLowerCase();
    
    if (lower.includes('turn it on') || lower.includes('turn on') || lower.includes('start')) {
        return 150; // Default on value
    }
    if (lower.includes('turn it off') || lower.includes('turn off') || lower.includes('stop')) {
        return 0;
    }
    if (lower.includes('stronger') || lower.includes('increase') || lower.includes('higher')) {
        return Math.min(255, currentPwm + 50);
    }
    if (lower.includes('weaker') || lower.includes('decrease') || lower.includes('lower')) {
        return Math.max(0, currentPwm - 50);
    }
    
    return currentPwm; // Default: no change
}

function getMotorControlResponse(transcription) {
    const lower = transcription.toLowerCase();
    
    if (lower.includes('turn it on') || lower.includes('turn on') || lower.includes('start')) {
        return 'Turning the motor on';
    }
    if (lower.includes('turn it off') || lower.includes('turn off') || lower.includes('stop')) {
        return 'Turning the motor off';
    }
    if (lower.includes('stronger') || lower.includes('increase') || lower.includes('higher')) {
        return 'Increasing motor intensity';
    }
    if (lower.includes('weaker') || lower.includes('decrease') || lower.includes('lower')) {
        return 'Decreasing motor intensity';
    }
    
    return 'Adjusting motor settings';
}

function getResponseForNonHuman(audioType) {
    switch (audioType) {
        case 'motor_sound':
            return 'I hear the motor running';
        case 'background_noise':
            return 'I didn\'t hear a clear command';
        case 'unclear':
            return 'The audio was unclear';
        default:
            return 'No clear command detected';
    }
}

// Run the test
testPromptLogic();