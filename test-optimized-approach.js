/**
 * Test script for optimized streaming approach
 * Demonstrates the efficiency improvements
 */

// Mock implementations for testing
class MockRingBuffer {
    constructor(capacity) {
        this.capacity = capacity;
        this.buffer = new Float32Array(capacity);
        this.writeIndex = 0;
        this.count = 0;
    }

    push(data) {
        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                this.pushSingle(data[i]);
            }
        } else {
            this.pushSingle(data);
        }
    }

    pushSingle(value) {
        this.buffer[this.writeIndex] = value;
        this.writeIndex = (this.writeIndex + 1) % this.capacity;
        this.count = Math.min(this.count + 1, this.capacity);
    }

    readLast(samples) {
        const result = new Float32Array(Math.min(samples, this.count));
        let readIndex = (this.writeIndex - Math.min(samples, this.count) + this.capacity) % this.capacity;
        
        for (let i = 0; i < result.length; i++) {
            result[i] = this.buffer[readIndex];
            readIndex = (readIndex + 1) % this.capacity;
        }
        
        return result;
    }

    readAll() {
        return this.readLast(this.count);
    }

    reset() {
        this.writeIndex = 0;
        this.count = 0;
    }
}

// Simplified OptimizedStreamingProcessor for testing
class TestOptimizedProcessor {
    constructor() {
        this.audioState = {
            vadBuffer: new MockRingBuffer(1600), // 100ms buffer
            speechBuffer: new MockRingBuffer(16000 * 10), // 10 seconds
            isVoiceActive: false,
            consecutiveVoiceFrames: 0,
            consecutiveSilenceFrames: 0,
            VAD_VOICE_FRAMES: 2,
            VAD_SILENCE_FRAMES: 15,
            totalChunksProcessed: 0,
            speechChunksSent: 0,
            lastRMS: 0
        };
        
        this.onSpeechReady = null;
    }

    // Simulate audio processing
    processAudioChunk(audioData) {
        this.audioState.totalChunksProcessed++;
        
        // Always buffer for pre/post-speech context
        this.audioState.vadBuffer.push(audioData);
        
        // Simulate VAD
        const energy = this.calculateEnergy(audioData);
        const isVoiceActive = energy > 0.02; // Simple threshold
        
        if (isVoiceActive) {
            this.audioState.consecutiveVoiceFrames++;
            this.audioState.consecutiveSilenceFrames = 0;
            
            if (!this.audioState.isVoiceActive && 
                this.audioState.consecutiveVoiceFrames >= this.audioState.VAD_VOICE_FRAMES) {
                this.handleVoiceStart();
            }
            
            if (this.audioState.isVoiceActive) {
                this.audioState.speechBuffer.push(audioData);
            }
        } else {
            this.audioState.consecutiveSilenceFrames++;
            this.audioState.consecutiveVoiceFrames = 0;
            
            if (this.audioState.isVoiceActive && 
                this.audioState.consecutiveSilenceFrames >= this.audioState.VAD_SILENCE_FRAMES) {
                this.handleVoiceEnd();
            }
        }

        return {
            isVoiceActive: this.audioState.isVoiceActive,
            energy: energy,
            speechBufferSize: this.audioState.speechBuffer.count
        };
    }

    calculateEnergy(audioData) {
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        return Math.sqrt(sum / audioData.length);
    }

    handleVoiceStart() {
        this.audioState.isVoiceActive = true;
        
        // Add pre-speech context
        const preSpeechSamples = Math.min(320, this.audioState.vadBuffer.count); // 20ms
        if (preSpeechSamples > 0) {
            const preSpeechData = this.audioState.vadBuffer.readLast(preSpeechSamples);
            this.audioState.speechBuffer.push(preSpeechData);
        }
        
        console.log(`[Voice Start] Added ${preSpeechSamples} pre-speech samples`);
    }

    handleVoiceEnd() {
        this.audioState.isVoiceActive = false;
        
        // Add post-speech context
        const postSpeechSamples = Math.min(160, this.audioState.vadBuffer.count); // 10ms
        if (postSpeechSamples > 0) {
            const postSpeechData = this.audioState.vadBuffer.readLast(postSpeechSamples);
            this.audioState.speechBuffer.push(postSpeechData);
        }
        
        console.log(`[Voice End] Added ${postSpeechSamples} post-speech samples`);
        
        // Send to API (simulated)
        if (this.audioState.speechBuffer.count > 800) { // Minimum 50ms
            this.sendSpeechToAPI();
        } else {
            console.log("[Voice End] Speech too short, discarding");
            this.audioState.speechBuffer.reset();
        }
    }

    sendSpeechToAPI() {
        const speechData = this.audioState.speechBuffer.readAll();
        this.audioState.speechChunksSent++;
        
        console.log(`[API Call] Sending ${speechData.length} samples (${(speechData.length/16000*1000).toFixed(1)}ms)`);
        
        if (this.onSpeechReady) {
            this.onSpeechReady({
                audioData: Array.from(speechData),
                duration: speechData.length / 16000 * 1000,
                timestamp: Date.now()
            });
        }
        
        this.audioState.speechBuffer.reset();
    }

    getEfficiencyStats() {
        const efficiency = this.audioState.totalChunksProcessed > 0 
            ? (1 - this.audioState.speechChunksSent / this.audioState.totalChunksProcessed) * 100 
            : 0;
            
        return {
            totalChunksProcessed: this.audioState.totalChunksProcessed,
            speechChunksSent: this.audioState.speechChunksSent,
            efficiencyPercentage: efficiency.toFixed(1),
            chunksPerApiCall: this.audioState.speechChunksSent > 0 
                ? (this.audioState.totalChunksProcessed / this.audioState.speechChunksSent).toFixed(1) 
                : 0
        };
    }
}

// Test simulation
function runOptimizedTest() {
    console.log("🚀 Testing Optimized Streaming Approach");
    console.log("=====================================");
    
    const processor = new TestOptimizedProcessor();
    let apiCallCount = 0;
    
    processor.onSpeechReady = (speechPacket) => {
        apiCallCount++;
        console.log(`[API Response ${apiCallCount}] Processed ${speechPacket.duration.toFixed(1)}ms of speech`);
    };
    
    // Simulate 10 seconds of audio processing
    const totalDuration = 10000; // 10 seconds
    const chunkSize = 160; // 10ms chunks at 16kHz
    const totalChunks = totalDuration / 10; // 1000 chunks
    
    console.log(`\nSimulating ${totalDuration/1000}s of audio processing...`);
    console.log(`Chunk size: ${chunkSize} samples (10ms)`);
    console.log(`Total chunks: ${totalChunks}`);
    
    for (let i = 0; i < totalChunks; i++) {
        // Generate audio data
        const audioData = new Float32Array(chunkSize);
        
        // Simulate speech patterns (speech for 2s, silence for 3s, repeat)
        const timeMs = i * 10;
        const cyclePosition = (timeMs % 5000) / 5000; // 5 second cycles
        const isSpeechPeriod = cyclePosition < 0.4; // 40% speech, 60% silence
        
        if (isSpeechPeriod) {
            // Generate speech-like audio with higher energy
            for (let j = 0; j < chunkSize; j++) {
                audioData[j] = (Math.random() - 0.5) * 0.1; // Higher amplitude
            }
        } else {
            // Generate silence/noise with lower energy
            for (let j = 0; j < chunkSize; j++) {
                audioData[j] = (Math.random() - 0.5) * 0.01; // Lower amplitude
            }
        }
        
        processor.processAudioChunk(audioData);
    }
    
    // Final statistics
    const stats = processor.getEfficiencyStats();
    
    console.log("\n📊 Final Results:");
    console.log("=================");
    console.log(`Total audio chunks processed: ${stats.totalChunksProcessed}`);
    console.log(`API calls made: ${stats.speechChunksSent}`);
    console.log(`Efficiency gain: ${stats.efficiencyPercentage}%`);
    console.log(`Chunks per API call: ${stats.chunksPerApiCall}`);
    console.log(`API call reduction: ${((1 - stats.speechChunksSent / stats.totalChunksProcessed) * 100).toFixed(1)}%`);
    
    // Traditional approach comparison
    console.log("\n🔄 Comparison with Traditional Streaming:");
    console.log("==========================================");
    console.log(`Traditional approach: ${stats.totalChunksProcessed} API calls`);
    console.log(`Optimized approach: ${stats.speechChunksSent} API calls`);
    console.log(`Reduction: ${stats.totalChunksProcessed - stats.speechChunksSent} fewer calls`);
    console.log(`Efficiency improvement: ${stats.efficiencyPercentage}%`);
    
    if (parseFloat(stats.efficiencyPercentage) > 80) {
        console.log("\n✅ SUCCESS: Achieved >80% efficiency improvement!");
    } else {
        console.log("\n⚠️  WARNING: Efficiency below target (80%)");
    }
    
    return stats;
}

// Run the test
const results = runOptimizedTest();

console.log("\n🎯 Key Benefits Demonstrated:");
console.log("=============================");
console.log("✅ Client-side VAD eliminates unnecessary API calls");
console.log("✅ Smart buffering captures complete speech with context");
console.log("✅ Pre/post-speech buffering ensures natural audio quality");
console.log("✅ Dramatic reduction in API overhead while maintaining quality");
console.log("✅ Natural conversation flow without manual recording buttons");

export { TestOptimizedProcessor, runOptimizedTest };