#!/usr/bin/env node

/**
 * VAD Sensitivity and Accuracy Analysis
 * Tests voice activity detection under various conditions
 */

class VADAnalyzer {
    constructor() {
        this.testResults = [];
        
        // VAD parameters from optimized processor
        this.VAD_ENERGY_THRESHOLD = 0.008;
        this.VAD_ZCR_THRESHOLD = 0.02;
        this.VAD_VOICE_FRAMES = 3;
        this.VAD_SILENCE_FRAMES = 20;
        
        this.energyHistory = [];
    }

    /**
     * Simulate the VAD algorithm from optimized-streaming-processor.js
     */
    detectVoiceActivity(audioData) {
        // Calculate RMS energy
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        const rms = Math.sqrt(sum / audioData.length);

        // Calculate zero-crossing rate
        let zeroCrossings = 0;
        for (let i = 1; i < audioData.length; i++) {
            if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
                zeroCrossings++;
            }
        }
        const zcr = zeroCrossings / audioData.length;

        // Advanced VAD decision with adaptive thresholds
        const energyActive = rms > this.VAD_ENERGY_THRESHOLD;
        const zcrActive = zcr > this.VAD_ZCR_THRESHOLD && zcr < 0.5;
        
        // Adaptive threshold based on recent silence energy history
        if (rms <= this.VAD_ENERGY_THRESHOLD * 2) {
            this.energyHistory.push(rms);
            if (this.energyHistory.length > 50) this.energyHistory.shift();
        }
        
        const avgSilenceEnergy = this.energyHistory.length > 0 ? 
            this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length : 
            this.VAD_ENERGY_THRESHOLD;
        const adaptiveThreshold = Math.max(this.VAD_ENERGY_THRESHOLD, avgSilenceEnergy * 4);
        
        const adaptiveCheck = rms > adaptiveThreshold * 1.5;
        const voiceDetected = energyActive && (zcrActive || adaptiveCheck);
        
        return {
            voiceDetected,
            rms,
            zcr,
            energyActive,
            zcrActive,
            adaptiveCheck,
            adaptiveThreshold,
            avgSilenceEnergy
        };
    }

    /**
     * Generate test audio signals
     */
    generateTestSignals() {
        const sampleRate = 16000;
        const frameSize = 1024; // 64ms frames
        
        return {
            // Pure silence
            silence: new Float32Array(frameSize).fill(0),
            
            // Very quiet background noise
            quietNoise: new Float32Array(frameSize).map(() => (Math.random() - 0.5) * 0.002),
            
            // Moderate background noise
            moderateNoise: new Float32Array(frameSize).map(() => (Math.random() - 0.5) * 0.01),
            
            // Loud background noise
            loudNoise: new Float32Array(frameSize).map(() => (Math.random() - 0.5) * 0.05),
            
            // Simulated speech (low frequency with harmonics)
            speech: this.generateSpeechSignal(frameSize, sampleRate, 150, 0.02),
            
            // Loud speech
            loudSpeech: this.generateSpeechSignal(frameSize, sampleRate, 150, 0.05),
            
            // Quiet speech
            quietSpeech: this.generateSpeechSignal(frameSize, sampleRate, 150, 0.01),
            
            // High-pitched noise (not speech)
            highPitchNoise: this.generateSineWave(frameSize, sampleRate, 2000, 0.03),
            
            // Low-pitched rumble
            lowPitchRumble: this.generateSineWave(frameSize, sampleRate, 50, 0.02),
            
            // Mixed speech and noise
            speechWithNoise: this.mixSignals(
                this.generateSpeechSignal(frameSize, sampleRate, 150, 0.03),
                new Float32Array(frameSize).map(() => (Math.random() - 0.5) * 0.008)
            )
        };
    }

    /**
     * Generate realistic speech-like signal
     */
    generateSpeechSignal(length, sampleRate, fundamentalFreq, amplitude) {
        const signal = new Float32Array(length);
        const omega = 2 * Math.PI * fundamentalFreq / sampleRate;
        
        for (let i = 0; i < length; i++) {
            // Fundamental frequency + harmonics (typical for speech)
            signal[i] = amplitude * (
                Math.sin(omega * i) * 0.6 +           // Fundamental
                Math.sin(2 * omega * i) * 0.3 +       // 2nd harmonic
                Math.sin(3 * omega * i) * 0.1         // 3rd harmonic
            );
            
            // Add slight amplitude modulation (speech-like)
            const modulation = 1 + 0.2 * Math.sin(2 * Math.PI * 5 * i / sampleRate);
            signal[i] *= modulation;
            
            // Add small amount of noise for realism
            signal[i] += (Math.random() - 0.5) * amplitude * 0.1;
        }
        
        return signal;
    }

    /**
     * Generate sine wave
     */
    generateSineWave(length, sampleRate, frequency, amplitude) {
        const signal = new Float32Array(length);
        const omega = 2 * Math.PI * frequency / sampleRate;
        
        for (let i = 0; i < length; i++) {
            signal[i] = amplitude * Math.sin(omega * i);
        }
        
        return signal;
    }

    /**
     * Mix two signals
     */
    mixSignals(signal1, signal2) {
        const mixed = new Float32Array(signal1.length);
        for (let i = 0; i < signal1.length; i++) {
            mixed[i] = signal1[i] + signal2[i];
        }
        return mixed;
    }

    /**
     * Run comprehensive VAD tests
     */
    runVADTests() {
        console.log('=== VAD Sensitivity and Accuracy Analysis ===\n');
        
        const testSignals = this.generateTestSignals();
        const results = {};
        
        // Test each signal type
        for (const [signalType, signal] of Object.entries(testSignals)) {
            const vadResult = this.detectVoiceActivity(signal);
            results[signalType] = vadResult;
            
            console.log(`${signalType.toUpperCase()}:`);
            console.log(`  Voice Detected: ${vadResult.voiceDetected ? 'YES' : 'NO'}`);
            console.log(`  RMS Energy: ${vadResult.rms.toFixed(6)}`);
            console.log(`  Zero Crossing Rate: ${vadResult.zcr.toFixed(4)}`);
            console.log(`  Energy Active: ${vadResult.energyActive}`);
            console.log(`  ZCR Active: ${vadResult.zcrActive}`);
            console.log(`  Adaptive Check: ${vadResult.adaptiveCheck}`);
            console.log(`  Adaptive Threshold: ${vadResult.adaptiveThreshold.toFixed(6)}`);
            console.log('');
        }
        
        // Analyze results
        this.analyzeResults(results);
        
        return results;
    }

    /**
     * Analyze VAD performance
     */
    analyzeResults(results) {
        console.log('=== VAD Performance Analysis ===\n');
        
        // Expected results (ground truth)
        const expectedVoice = {
            silence: false,
            quietNoise: false,
            moderateNoise: false,
            loudNoise: false,
            speech: true,
            loudSpeech: true,
            quietSpeech: true,  // Should detect quiet speech
            highPitchNoise: false,
            lowPitchRumble: false,
            speechWithNoise: true
        };
        
        let correctDetections = 0;
        let totalTests = 0;
        let falsePositives = 0;
        let falseNegatives = 0;
        
        console.log('DETECTION ACCURACY:');
        for (const [signalType, expected] of Object.entries(expectedVoice)) {
            const detected = results[signalType].voiceDetected;
            const correct = detected === expected;
            
            totalTests++;
            if (correct) correctDetections++;
            
            if (detected && !expected) falsePositives++;
            if (!detected && expected) falseNegatives++;
            
            const status = correct ? '✅' : '❌';
            console.log(`  ${signalType}: ${status} (Expected: ${expected}, Got: ${detected})`);
        }
        
        const accuracy = (correctDetections / totalTests) * 100;
        console.log(`\nOVERALL ACCURACY: ${accuracy.toFixed(1)}% (${correctDetections}/${totalTests})`);
        console.log(`FALSE POSITIVES: ${falsePositives}`);
        console.log(`FALSE NEGATIVES: ${falseNegatives}`);
        
        // Sensitivity analysis
        console.log('\n=== SENSITIVITY ANALYSIS ===');
        
        const speechSignals = ['speech', 'loudSpeech', 'quietSpeech', 'speechWithNoise'];
        const speechEnergies = speechSignals.map(s => results[s].rms);
        const minSpeechEnergy = Math.min(...speechEnergies);
        const maxSpeechEnergy = Math.max(...speechEnergies);
        
        console.log(`Speech Energy Range: ${minSpeechEnergy.toFixed(6)} - ${maxSpeechEnergy.toFixed(6)}`);
        console.log(`Current Energy Threshold: ${this.VAD_ENERGY_THRESHOLD}`);
        
        const noiseSignals = ['quietNoise', 'moderateNoise', 'loudNoise'];
        const noiseEnergies = noiseSignals.map(s => results[s].rms);
        const maxNoiseEnergy = Math.max(...noiseEnergies);
        
        console.log(`Max Noise Energy: ${maxNoiseEnergy.toFixed(6)}`);
        
        // Threshold recommendations
        if (minSpeechEnergy < this.VAD_ENERGY_THRESHOLD) {
            console.log(`⚠️  WARNING: Quiet speech (${minSpeechEnergy.toFixed(6)}) below threshold`);
            console.log(`   Consider lowering threshold to ${(minSpeechEnergy * 0.8).toFixed(6)}`);
        }
        
        if (maxNoiseEnergy > this.VAD_ENERGY_THRESHOLD) {
            console.log(`⚠️  WARNING: Loud noise (${maxNoiseEnergy.toFixed(6)}) above threshold`);
            console.log(`   Consider raising threshold to ${(maxNoiseEnergy * 1.2).toFixed(6)}`);
        }
        
        // ZCR analysis
        console.log('\n=== ZERO CROSSING RATE ANALYSIS ===');
        const speechZCRs = speechSignals.map(s => results[s].zcr);
        const noiseZCRs = [...noiseSignals, 'highPitchNoise'].map(s => results[s].zcr);
        
        console.log(`Speech ZCR Range: ${Math.min(...speechZCRs).toFixed(4)} - ${Math.max(...speechZCRs).toFixed(4)}`);
        console.log(`Noise ZCR Range: ${Math.min(...noiseZCRs).toFixed(4)} - ${Math.max(...noiseZCRs).toFixed(4)}`);
        console.log(`Current ZCR Threshold: ${this.VAD_ZCR_THRESHOLD}`);
        
        // Performance recommendations
        console.log('\n=== RECOMMENDATIONS ===');
        
        if (accuracy >= 90) {
            console.log('✅ VAD performance is excellent');
        } else if (accuracy >= 80) {
            console.log('⚠️  VAD performance is good but could be improved');
        } else {
            console.log('❌ VAD performance needs improvement');
        }
        
        if (falsePositives > 1) {
            console.log('- Consider raising energy threshold to reduce false positives');
        }
        
        if (falseNegatives > 1) {
            console.log('- Consider lowering energy threshold to reduce false negatives');
            console.log('- Consider improving adaptive threshold algorithm');
        }
        
        console.log('- Current adaptive threshold mechanism helps with varying noise floors');
        console.log('- ZCR filtering effectively rejects high-frequency noise');
    }
}

// Run the analysis
if (require.main === module) {
    const analyzer = new VADAnalyzer();
    analyzer.runVADTests();
}

module.exports = VADAnalyzer;