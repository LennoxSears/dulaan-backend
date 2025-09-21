/**
 * Speech-to-Text Accuracy Test
 * Tests the speechToTextWithLLM API with real audio streaming and silence detection
 * Saves audio files for verification and analysis
 */

const fs = require('fs');
const path = require('path');

class AudioStreamSimulator {
    constructor() {
        // Audio state (matches client audio processor)
        this.audioState = {
            ringBuffer: new RingBuffer(480000 * 2), // 30 seconds at 16kHz
            isSpeaking: false,
            silenceCounter: 0,
            SILENCE_THRESHOLD: 0.05,
            ZERO_CROSSING: 0.1,
            SILENCE_TIMEOUT: 25,
            MIN_SPEECH_DURATION: 10,
            lastChunkSize: 0,
            lastRMS: 0,
            lastZeroCrossings: 0
        };

        // Test configuration
        this.config = {
            sampleRate: 16000,
            chunkSize: 1600, // 0.1 seconds at 16kHz
            testDuration: 30000, // 30 seconds
            saveAudioFiles: true
        };

        // Fake message history for testing
        this.msgHis = [
            {
                user: "turn it up",
                assistant: "I'll increase the speed for you.",
                pwm: 150,
                timestamp: new Date(Date.now() - 60000).toISOString()
            },
            {
                user: "that's good",
                assistant: "Great! The motor is running at medium intensity.",
                pwm: 150,
                timestamp: new Date(Date.now() - 30000).toISOString()
            }
        ];

        this.currentPwm = 150;
        this.testResults = [];
        this.audioSegmentCount = 0;
    }

    /**
     * Simulate audio chunk processing with silence detection
     */
    processAudioChunk(audioData) {
        const isSilent = this.detectSilence(audioData);
        
        console.log(`[Audio Chunk] Size: ${audioData.length}, Energy: ${this.calculateRMS(audioData).toFixed(4)}, Silent: ${isSilent}`);

        // Speech activity detection (matches client logic)
        if (!isSilent) {
            this.audioState.silenceCounter = 0;
            if (!this.audioState.isSpeaking) {
                this.audioState.isSpeaking = true;
                console.log('🎤 [Speech Started] Detected speech activity');
            }
            
            // Add to ring buffer
            this.audioState.ringBuffer.push(audioData);
        } else {
            if (this.audioState.isSpeaking) {
                this.audioState.silenceCounter++;
                console.log(`🔇 [Silence] Counter: ${this.audioState.silenceCounter}/${this.audioState.SILENCE_TIMEOUT}`);
                
                // Continue adding to buffer during silence (for context)
                this.audioState.ringBuffer.push(audioData);
                
                // Check if silence timeout reached
                if (this.audioState.silenceCounter >= this.audioState.SILENCE_TIMEOUT) {
                    this.audioState.isSpeaking = false;
                    this.audioState.silenceCounter = 0;
                    
                    // Package and send speech segment
                    this.packageAndSendSpeech();
                }
            }
        }
    }

    /**
     * Detect silence in audio data (matches client algorithm)
     */
    detectSilence(audioData) {
        const rms = this.calculateRMS(audioData);
        const zeroCrossings = this.calculateZeroCrossings(audioData);
        
        this.audioState.lastRMS = rms;
        this.audioState.lastZeroCrossings = zeroCrossings;
        
        return rms < this.audioState.SILENCE_THRESHOLD && 
               zeroCrossings < this.audioState.ZERO_CROSSING;
    }

    /**
     * Calculate RMS energy
     */
    calculateRMS(audioData) {
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        return Math.sqrt(sum / audioData.length);
    }

    /**
     * Calculate zero crossings
     */
    calculateZeroCrossings(audioData) {
        let crossings = 0;
        for (let i = 1; i < audioData.length; i++) {
            if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
                crossings++;
            }
        }
        return crossings / audioData.length;
    }

    /**
     * Package speech segment and send to API
     */
    async packageAndSendSpeech() {
        try {
            const pcmData = this.audioState.ringBuffer.readAll();
            if (pcmData.length === 0) {
                console.log('⚠️ [Speech Packaging] No audio data to package');
                return;
            }

            // Limit audio segment size (max 30 seconds at 16kHz)
            const MAX_SAMPLES = 480000;
            const limitedData = pcmData.length > MAX_SAMPLES ? 
                pcmData.slice(0, MAX_SAMPLES) : pcmData;

            console.log(`📦 [Speech Packaging] PCM segment: ${limitedData.length} samples (${(limitedData.length / 16000).toFixed(2)}s)`);

            // Convert to Int16 (matches client conversion)
            const int16Data = new Int16Array(limitedData.length);
            for (let i = 0; i < limitedData.length; i++) {
                const scaled = Math.max(-1, Math.min(1, limitedData[i])) * 32767;
                int16Data[i] = Math.max(-32768, Math.min(32767, scaled));
            }

            // Save audio file for verification
            if (this.config.saveAudioFiles) {
                await this.saveAudioFile(int16Data, this.audioSegmentCount);
            }

            // Convert to base64 (matches client)
            const uint8Array = new Uint8Array(int16Data.buffer);
            const audioBase64 = btoa(String.fromCharCode.apply(null, uint8Array));

            console.log(`🚀 [API Call] Sending ${audioBase64.length} base64 chars to speechToTextWithLLM`);

            // Send to API
            const result = await this.callSpeechAPI(audioBase64);
            
            // Store result
            this.testResults.push({
                segmentNumber: this.audioSegmentCount,
                audioLength: limitedData.length,
                audioDuration: limitedData.length / 16000,
                result: result,
                timestamp: new Date().toISOString()
            });

            this.audioSegmentCount++;
            
            // Reset ring buffer
            this.audioState.ringBuffer.reset();

        } catch (error) {
            console.error('❌ [Speech Packaging] Error:', error.message);
        }
    }

    /**
     * Save audio file for verification
     */
    async saveAudioFile(int16Data, segmentNumber) {
        try {
            const audioDir = path.join(__dirname, 'test-audio');
            if (!fs.existsSync(audioDir)) {
                fs.mkdirSync(audioDir);
            }

            const filename = `speech-segment-${segmentNumber}-${Date.now()}.raw`;
            const filepath = path.join(audioDir, filename);
            
            const buffer = Buffer.from(int16Data.buffer);
            fs.writeFileSync(filepath, buffer);
            
            console.log(`💾 [Audio Saved] ${filename} (${int16Data.length} samples, ${(int16Data.length / 16000).toFixed(2)}s)`);
            console.log(`   To play: ffplay -f s16le -ar 16000 -ac 1 "${filepath}"`);
            
        } catch (error) {
            console.error('❌ [Audio Save] Error:', error.message);
        }
    }

    /**
     * Call speechToTextWithLLM API
     */
    async callSpeechAPI(audioBase64) {
        try {
            const payload = {
                msgHis: this.msgHis,
                audioContent: audioBase64,
                currentPwm: this.currentPwm,
                encoding: 'LINEAR16',
                sampleRateHertz: 16000,
                languageCode: 'en-US'
            };

            const response = await fetch('https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log(`📡 [API Response] Status: ${response.status}`);

            const result = await response.json();
            
            // Print detailed response
            console.log('🎯 [Speech Recognition Result]');
            console.log(`   Transcription: "${result.transcription || 'NO SPEECH DETECTED'}"`);
            console.log(`   Confidence: ${result.confidence || 0}`);
            console.log(`   Success: ${result.success}`);
            console.log(`   Language: ${result.detectedLanguage || 'unknown'}`);
            
            if (result.success) {
                console.log(`   AI Response: "${result.response}"`);
                console.log(`   PWM: ${this.currentPwm} → ${result.newPwmValue}`);
                console.log(`   Intent Detected: ${result.intentDetected}`);
                console.log(`   Reasoning: ${result.reasoning}`);
                
                // Update current PWM for next test
                this.currentPwm = result.newPwmValue;
            } else {
                console.log(`   Error: ${result.error}`);
            }

            return result;

        } catch (error) {
            console.error('❌ [API Call] Error:', error.message);
            return { error: error.message, success: false };
        }
    }

    /**
     * Generate test audio with speech-like patterns
     */
    generateTestAudio(type = 'speech', duration = 2.0) {
        const sampleCount = Math.floor(duration * this.config.sampleRate);
        const audioData = new Float32Array(sampleCount);

        switch (type) {
            case 'speech':
                // Generate speech-like audio with varying frequencies
                for (let i = 0; i < sampleCount; i++) {
                    const t = i / this.config.sampleRate;
                    const freq1 = 200 + 100 * Math.sin(t * 2); // Varying fundamental
                    const freq2 = 400 + 200 * Math.sin(t * 3); // Varying harmonic
                    const amplitude = 0.3 * (0.5 + 0.5 * Math.sin(t * 5)); // Varying amplitude
                    audioData[i] = amplitude * (Math.sin(2 * Math.PI * freq1 * t) + 0.5 * Math.sin(2 * Math.PI * freq2 * t));
                }
                break;

            case 'silence':
                // Generate silence with minimal noise
                for (let i = 0; i < sampleCount; i++) {
                    audioData[i] = (Math.random() - 0.5) * 0.001; // Very quiet noise
                }
                break;

            case 'noise':
                // Generate noise
                for (let i = 0; i < sampleCount; i++) {
                    audioData[i] = (Math.random() - 0.5) * 0.1;
                }
                break;
        }

        return audioData;
    }

    /**
     * Run speech accuracy test
     */
    async runTest() {
        console.log('🎤 SPEECH-TO-TEXT ACCURACY TEST');
        console.log('================================');
        console.log(`Sample Rate: ${this.config.sampleRate} Hz`);
        console.log(`Chunk Size: ${this.config.chunkSize} samples (${(this.config.chunkSize / this.config.sampleRate * 1000).toFixed(1)}ms)`);
        console.log(`Current PWM: ${this.currentPwm}`);
        console.log(`Message History: ${this.msgHis.length} messages`);
        console.log(`Audio Files: ${this.config.saveAudioFiles ? 'Enabled (./test-audio/)' : 'Disabled'}`);
        console.log(`API Endpoint: https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app`);
        console.log('');

        // Test scenario 1: Speech followed by silence
        console.log('📋 Test Scenario 1: Speech + Silence');
        console.log('Generating speech-like audio...');
        
        const speechAudio = this.generateTestAudio('speech', 3.0);
        const silenceAudio = this.generateTestAudio('silence', 2.0);
        
        // Process speech audio in chunks
        for (let i = 0; i < speechAudio.length; i += this.config.chunkSize) {
            const chunk = speechAudio.slice(i, i + this.config.chunkSize);
            this.processAudioChunk(chunk);
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate real-time
        }
        
        // Process silence to trigger packaging
        for (let i = 0; i < silenceAudio.length; i += this.config.chunkSize) {
            const chunk = silenceAudio.slice(i, i + this.config.chunkSize);
            this.processAudioChunk(chunk);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Wait for any pending API calls
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Test scenario 2: Just silence
        console.log('\n📋 Test Scenario 2: Silence Only');
        console.log('Generating silence...');
        
        const silenceOnly = this.generateTestAudio('silence', 1.0);
        for (let i = 0; i < silenceOnly.length; i += this.config.chunkSize) {
            const chunk = silenceOnly.slice(i, i + this.config.chunkSize);
            this.processAudioChunk(chunk);
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Force package if there's remaining audio
        if (this.audioState.ringBuffer.count > 0) {
            console.log('\n🔄 Force packaging remaining audio...');
            await this.packageAndSendSpeech();
        }

        // Print summary
        this.printTestSummary();
    }

    /**
     * Print test summary
     */
    printTestSummary() {
        console.log('\n📊 TEST SUMMARY');
        console.log('===============');
        console.log(`Total segments tested: ${this.testResults.length}`);
        console.log(`Final PWM value: ${this.currentPwm}`);
        console.log('');

        this.testResults.forEach((result, index) => {
            console.log(`Segment ${index + 1}:`);
            console.log(`  Duration: ${result.audioDuration.toFixed(2)}s`);
            console.log(`  Transcription: "${result.result.transcription || 'NO SPEECH'}"`);
            console.log(`  Confidence: ${result.result.confidence || 0}`);
            console.log(`  Success: ${result.result.success}`);
            console.log(`  Intent Detected: ${result.result.intentDetected || false}`);
            console.log('');
        });

        if (this.config.saveAudioFiles) {
            console.log('🎵 Audio files saved in ./test-audio/ directory');
            console.log('   Play with: ffplay -f s16le -ar 16000 -ac 1 <filename>');
            console.log('   Or use any audio editor that supports raw PCM (16-bit, 16kHz, mono)');
        }

        console.log('\n🎯 ACCURACY ANALYSIS:');
        const successfulTranscriptions = this.testResults.filter(r => r.result.success && r.result.transcription);
        const noSpeechDetected = this.testResults.filter(r => !r.result.success && r.result.error?.includes('No speech detected'));
        const errors = this.testResults.filter(r => r.result.error && !r.result.error.includes('No speech detected'));
        
        console.log(`   Successful transcriptions: ${successfulTranscriptions.length}/${this.testResults.length}`);
        console.log(`   No speech detected: ${noSpeechDetected.length}/${this.testResults.length}`);
        console.log(`   Errors: ${errors.length}/${this.testResults.length}`);
        
        if (successfulTranscriptions.length === 0 && this.testResults.length > 0) {
            console.log('\n⚠️  NO SUCCESSFUL TRANSCRIPTIONS - Possible issues:');
            console.log('   - Generated audio may not sound like human speech');
            console.log('   - Speech recognition model may require actual voice');
            console.log('   - Try testing with real recorded audio');
        }
    }
}

// Ring buffer implementation (matches client)
class RingBuffer {
    constructor(size) {
        this.buffer = new Float32Array(size);
        this.size = size;
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }

    push(data) {
        const available = this.size - this.count;
        const toWrite = Math.min(data.length, available);

        const firstPart = Math.min(toWrite, this.size - this.tail);
        this.buffer.set(data.subarray(0, firstPart), this.tail);

        const secondPart = toWrite - firstPart;
        if (secondPart > 0) {
            this.buffer.set(data.subarray(firstPart, firstPart + secondPart), 0);
        }

        this.tail = (this.tail + toWrite) % this.size;
        this.count += toWrite;
        return toWrite;
    }

    readAll() {
        const out = new Float32Array(this.count);
        const firstPart = Math.min(this.count, this.size - this.head);
        out.set(this.buffer.subarray(this.head, this.head + firstPart));

        if (this.count > firstPart) {
            out.set(this.buffer.subarray(0, this.count - firstPart), firstPart);
        }
        return out;
    }

    reset() {
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }
}

// Add btoa for Node.js environment
if (typeof btoa === 'undefined') {
    global.btoa = function(str) {
        return Buffer.from(str, 'binary').toString('base64');
    };
}

// Add fetch for Node.js environment
if (typeof fetch === 'undefined') {
    try {
        global.fetch = require('node-fetch');
    } catch (error) {
        console.error('❌ node-fetch not installed. Run: npm install node-fetch');
        process.exit(1);
    }
}

// Run the test
const tester = new AudioStreamSimulator();
tester.runTest().catch(console.error);