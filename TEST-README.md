# Speech Pipeline Test Suite

## Overview
Comprehensive testing suite for the multi-language speech-to-text motor control pipeline.

## Test Files

### 🧪 Core Test Files
- **`test-runner.html`** - Interactive browser-based test runner with visual interface
- **`run-tests.js`** - Command-line test runner for automated testing
- **`test-motor-commands.js`** - Audio data generator for motor control commands
- **`test-speech-pipeline.js`** - Pipeline simulation and testing logic

### 🌍 Test Cases
The test suite includes three motor control commands in different languages:

1. **English**: "Turn it up" 
   - Expected: Increase motor power
   - Language code: `en-US`
   - Duration: ~1.2 seconds

2. **Spanish**: "Más fuerte"
   - Expected: Increase motor power  
   - Language code: `es-ES`
   - Duration: ~1.3 seconds

3. **Chinese**: "加强" (jiā qiáng)
   - Expected: Increase motor power
   - Language code: `zh-CN`
   - Duration: ~1.1 seconds

## How to Run Tests

### Browser Interface (Recommended)
1. Start the preview server:
   ```bash
   python3 -m http.server 8080
   ```
2. Open: `http://localhost:8080/test-runner.html`
3. Click "🚀 Run All Tests" or test individual languages

### Command Line
```bash
node run-tests.js
```

## Test Pipeline

```
Audio Generation → Int16Array → speechToTextWithLLM API → 
Speech Recognition → LLM Processing → PWM Control → Validation
```

## What Gets Tested

### ✅ Audio Processing
- Float32Array to Int16Array conversion
- Buffer size validation
- Audio duration and sample rate verification

### ✅ Speech Recognition
- Multi-language transcription simulation
- Confidence scoring
- Language detection

### ✅ LLM Processing  
- Intent detection for motor control
- PWM value calculation
- Response generation in multiple languages

### ✅ Integration
- End-to-end pipeline flow
- Message history management
- Error handling

## Expected Results

All three test cases should:
- ✅ Detect motor control intent
- ✅ Increase PWM value by 50 points
- ✅ Generate appropriate language-specific responses
- ✅ Maintain message history

## Test Data Format

Audio data is generated as realistic speech patterns:
- **Sample Rate**: 16kHz
- **Format**: Int16Array (LINEAR16 PCM)
- **Channels**: Mono
- **Characteristics**: Speech-like waveforms with harmonics, envelopes, and noise

## Files to Keep
- `test-runner.html` - Main interactive test interface
- `run-tests.js` - Automated test runner
- `test-motor-commands.js` - Audio data generation
- `test-speech-pipeline.js` - Pipeline testing logic

## Files to Remove (if needed)
- `test-raw-pcm-audio.js` - Legacy test file
- `test-speech-accuracy.js` - Legacy test file  
- `test-speech-ui.html` - Legacy test file

## Integration Status
✅ **Ready for Production Testing**

The pipeline has been successfully updated to use the stream.js approach with Int16Array buffer transmission while maintaining improved error handling and structured responses.