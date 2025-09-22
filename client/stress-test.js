#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class VoiceControlStressTest {
    constructor() {
        this.testResults = [];
        this.memoryBaseline = process.memoryUsage();
        this.startTime = Date.now();
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        console.log(logMessage);
        this.testResults.push({ timestamp, level, message });
    }

    async runStressTest() {
        this.log('Starting comprehensive voice control stress test');
        
        try {
            // Test 1: Rapid connection/disconnection cycles
            await this.testRapidConnections();
            
            // Test 2: Memory leak detection
            await this.testMemoryLeaks();
            
            // Test 3: Concurrent audio processing
            await this.testConcurrentAudio();
            
            // Test 4: Edge case audio data
            await this.testEdgeCaseAudio();
            
            // Test 5: Network resilience
            await this.testNetworkResilience();
            
            // Test 6: Performance under load
            await this.testPerformanceLoad();
            
            this.generateReport();
            
        } catch (error) {
            this.log(`Stress test failed: ${error.message}`, 'ERROR');
            this.log(`Stack trace: ${error.stack}`, 'ERROR');
        }
    }

    async testRapidConnections() {
        this.log('Testing rapid connection/disconnection cycles');
        
        for (let i = 0; i < 10; i++) {
            try {
                const sdk = new DulaanSDK();
                await this.simulateConnection(sdk);
                await this.simulateDisconnection(sdk);
                this.log(`Connection cycle ${i + 1} completed`);
            } catch (error) {
                this.log(`Connection cycle ${i + 1} failed: ${error.message}`, 'ERROR');
            }
        }
    }

    async testMemoryLeaks() {
        this.log('Testing for memory leaks');
        
        const initialMemory = process.memoryUsage();
        this.log(`Initial memory: ${JSON.stringify(initialMemory)}`);
        
        // Simulate 100 voice processing cycles
        for (let i = 0; i < 100; i++) {
            await this.simulateVoiceProcessing();
            
            if (i % 20 === 0) {
                const currentMemory = process.memoryUsage();
                const heapGrowth = currentMemory.heapUsed - initialMemory.heapUsed;
                this.log(`Memory check at cycle ${i}: heap growth ${heapGrowth} bytes`);
                
                if (heapGrowth > 50 * 1024 * 1024) { // 50MB threshold
                    this.log('Potential memory leak detected', 'WARNING');
                }
            }
        }
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
            const finalMemory = process.memoryUsage();
            this.log(`Final memory after GC: ${JSON.stringify(finalMemory)}`);
        }
    }

    async testConcurrentAudio() {
        this.log('Testing concurrent audio processing');
        
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(this.simulateVoiceProcessing(`concurrent_${i}`));
        }
        
        try {
            await Promise.all(promises);
            this.log('Concurrent audio processing completed successfully');
        } catch (error) {
            this.log(`Concurrent audio processing failed: ${error.message}`, 'ERROR');
        }
    }

    async testEdgeCaseAudio() {
        this.log('Testing edge case audio data');
        
        const edgeCases = [
            { name: 'empty_audio', data: new Float32Array(0) },
            { name: 'single_sample', data: new Float32Array([0.5]) },
            { name: 'max_amplitude', data: new Float32Array(1024).fill(1.0) },
            { name: 'min_amplitude', data: new Float32Array(1024).fill(-1.0) },
            { name: 'silence', data: new Float32Array(1024).fill(0.0) },
            { name: 'noise', data: new Float32Array(1024).map(() => Math.random() * 2 - 1) }
        ];
        
        for (const testCase of edgeCases) {
            try {
                await this.processAudioData(testCase.data, testCase.name);
                this.log(`Edge case '${testCase.name}' processed successfully`);
            } catch (error) {
                this.log(`Edge case '${testCase.name}' failed: ${error.message}`, 'ERROR');
            }
        }
    }

    async testNetworkResilience() {
        this.log('Testing network resilience');
        
        // Simulate network delays and failures
        const networkConditions = [
            { name: 'normal', delay: 0, failureRate: 0 },
            { name: 'slow', delay: 1000, failureRate: 0 },
            { name: 'unreliable', delay: 500, failureRate: 0.3 },
            { name: 'very_slow', delay: 3000, failureRate: 0.1 }
        ];
        
        for (const condition of networkConditions) {
            try {
                await this.simulateNetworkCondition(condition);
                this.log(`Network condition '${condition.name}' handled successfully`);
            } catch (error) {
                this.log(`Network condition '${condition.name}' failed: ${error.message}`, 'ERROR');
            }
        }
    }

    async testPerformanceLoad() {
        this.log('Testing performance under load');
        
        const startTime = Date.now();
        const operations = [];
        
        // Simulate high-frequency voice commands
        for (let i = 0; i < 50; i++) {
            operations.push(this.simulateVoiceCommand(`command_${i}`));
        }
        
        try {
            await Promise.all(operations);
            const duration = Date.now() - startTime;
            this.log(`Performance test completed in ${duration}ms`);
            
            if (duration > 10000) { // 10 second threshold
                this.log('Performance degradation detected', 'WARNING');
            }
        } catch (error) {
            this.log(`Performance test failed: ${error.message}`, 'ERROR');
        }
    }

    async simulateConnection(sdk) {
        // Simulate SDK connection
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    async simulateDisconnection(sdk) {
        // Simulate SDK disconnection
        return new Promise(resolve => setTimeout(resolve, 50));
    }

    async simulateVoiceProcessing(id = 'default') {
        // Simulate voice processing cycle
        const audioData = new Float32Array(1024).map(() => Math.random() * 0.1);
        return this.processAudioData(audioData, id);
    }

    async processAudioData(audioData, id) {
        return new Promise((resolve, reject) => {
            try {
                // Simulate audio processing
                const processedData = this.applyVAD(audioData);
                const speechDetected = processedData.length > 0;
                
                if (speechDetected) {
                    this.simulateSpeechRecognition(processedData, id);
                }
                
                setTimeout(resolve, Math.random() * 100);
            } catch (error) {
                reject(error);
            }
        });
    }

    applyVAD(audioData) {
        // Simulate VAD processing
        const threshold = 0.05;
        const speechFrames = [];
        
        for (let i = 0; i < audioData.length; i += 256) {
            const frame = audioData.slice(i, i + 256);
            const energy = frame.reduce((sum, sample) => sum + sample * sample, 0) / frame.length;
            
            if (energy > threshold) {
                speechFrames.push(...frame);
            }
        }
        
        return new Float32Array(speechFrames);
    }

    async simulateSpeechRecognition(audioData, id) {
        // Simulate speech recognition API call
        return new Promise(resolve => {
            const commands = ['forward', 'backward', 'left', 'right', 'stop'];
            const recognizedCommand = commands[Math.floor(Math.random() * commands.length)];
            
            setTimeout(() => {
                this.simulateMotorControl(recognizedCommand, id);
                resolve(recognizedCommand);
            }, Math.random() * 200);
        });
    }

    simulateMotorControl(command, id) {
        // Simulate motor control execution
        const motorCommands = {
            'forward': { left: 1.0, right: 1.0 },
            'backward': { left: -1.0, right: -1.0 },
            'left': { left: -0.5, right: 0.5 },
            'right': { left: 0.5, right: -0.5 },
            'stop': { left: 0.0, right: 0.0 }
        };
        
        const motorValues = motorCommands[command] || { left: 0.0, right: 0.0 };
        // Simulate motor execution delay
        return motorValues;
    }

    async simulateNetworkCondition(condition) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < condition.failureRate) {
                    reject(new Error(`Network failure simulated for ${condition.name}`));
                } else {
                    resolve();
                }
            }, condition.delay);
        });
    }

    async simulateVoiceCommand(commandId) {
        const audioData = new Float32Array(2048).map(() => 
            Math.sin(2 * Math.PI * 440 * Math.random()) * 0.1 + Math.random() * 0.05
        );
        
        return this.processAudioData(audioData, commandId);
    }

    generateReport() {
        const duration = Date.now() - this.startTime;
        const finalMemory = process.memoryUsage();
        const memoryGrowth = finalMemory.heapUsed - this.memoryBaseline.heapUsed;
        
        this.log('=== STRESS TEST REPORT ===');
        this.log(`Total duration: ${duration}ms`);
        this.log(`Memory growth: ${memoryGrowth} bytes`);
        this.log(`Total test operations: ${this.testResults.length}`);
        
        const errors = this.testResults.filter(r => r.level === 'ERROR');
        const warnings = this.testResults.filter(r => r.level === 'WARNING');
        
        this.log(`Errors: ${errors.length}`);
        this.log(`Warnings: ${warnings.length}`);
        
        if (errors.length === 0) {
            this.log('✅ All stress tests passed successfully');
        } else {
            this.log('❌ Some stress tests failed');
            errors.forEach(error => this.log(`  - ${error.message}`, 'ERROR'));
        }
        
        if (warnings.length > 0) {
            this.log('⚠️ Performance warnings detected');
            warnings.forEach(warning => this.log(`  - ${warning.message}`, 'WARNING'));
        }
        
        // Save detailed report
        const reportPath = path.join(__dirname, 'stress-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            summary: {
                duration,
                memoryGrowth,
                totalOperations: this.testResults.length,
                errors: errors.length,
                warnings: warnings.length
            },
            details: this.testResults
        }, null, 2));
        
        this.log(`Detailed report saved to: ${reportPath}`);
    }
}

// Run the stress test
if (require.main === module) {
    const stressTest = new VoiceControlStressTest();
    stressTest.runStressTest().then(() => {
        console.log('Stress test completed');
        process.exit(0);
    }).catch(error => {
        console.error('Stress test failed:', error);
        process.exit(1);
    });
}

module.exports = VoiceControlStressTest;