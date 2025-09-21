# 🎤 Speech-to-Text Accuracy Test

## Overview
Comprehensive test for the `speechToTextWithLLM` API that simulates the exact audio streaming behavior of the client application.

## Features

### ✅ **Realistic Audio Streaming**
- **Silence Detection**: Same algorithm as client (RMS + zero-crossing)
- **Ring Buffer**: Matches client's 30-second audio buffer
- **Chunk Processing**: 0.1s chunks at 16kHz (same as AI voice mode)
- **Speech Packaging**: Triggers on silence timeout (25 chunks = 2.5s)

### ✅ **Audio File Saving**
- Saves raw PCM files in `./test-audio/` directory
- Files can be played to verify what was sent to API
- Format: 16-bit PCM, 16kHz, mono

### ✅ **Comprehensive Testing**
- **Test Scenario 1**: Speech-like audio + silence
- **Test Scenario 2**: Silence only
- **Fake Environment**: Pre-populated message history and PWM state

### ✅ **Detailed Analysis**
- Prints transcription results with confidence scores
- Shows AI responses and PWM changes
- Analyzes accuracy statistics
- Identifies potential issues

## Prerequisites

```bash
npm install node-fetch
```

## Usage

```bash
node test-speech-accuracy.js
```

## Output

### Console Output
```
🎤 SPEECH-TO-TEXT ACCURACY TEST
================================
Sample Rate: 16000 Hz
Chunk Size: 1600 samples (100.0ms)
Current PWM: 150
Message History: 2 messages
Audio Files: Enabled (./test-audio/)

📋 Test Scenario 1: Speech + Silence
🎤 [Speech Started] Detected speech activity
📦 [Speech Packaging] PCM segment: 48000 samples (3.00s)
💾 [Audio Saved] speech-segment-0-1234567890.raw
🚀 [API Call] Sending 128000 base64 chars to speechToTextWithLLM
📡 [API Response] Status: 200
🎯 [Speech Recognition Result]
   Transcription: "turn it up"
   Confidence: 0.95
   Success: true
   AI Response: "I'll increase the speed"
   PWM: 150 → 180
```

### Audio Files
- **Location**: `./test-audio/speech-segment-{N}-{timestamp}.raw`
- **Format**: Raw PCM, 16-bit signed, 16kHz, mono
- **Play**: `ffplay -f s16le -ar 16000 -ac 1 <filename>`

## Test Scenarios

### Scenario 1: Speech + Silence
- Generates 3 seconds of speech-like audio (varying frequencies 200-600Hz)
- Followed by 2 seconds of silence
- Tests speech recognition accuracy

### Scenario 2: Silence Only
- Generates 1 second of silence with minimal noise
- Tests "no speech detected" handling
- Verifies PWM preservation

## Fake Environment

### Message History
```javascript
[
  {
    user: "turn it up",
    assistant: "I'll increase the speed for you.",
    pwm: 150,
    timestamp: "2025-09-21T06:00:00.000Z"
  },
  {
    user: "that's good", 
    assistant: "Great! The motor is running at medium intensity.",
    pwm: 150,
    timestamp: "2025-09-21T06:30:00.000Z"
  }
]
```

### Initial State
- **Current PWM**: 150
- **Sample Rate**: 16000 Hz
- **Encoding**: LINEAR16
- **Language**: en-US

## Analysis

The test provides accuracy analysis:
- **Successful transcriptions**: Count of recognized speech
- **No speech detected**: Count of silent segments
- **Errors**: Count of API errors

### Expected Results
- **Generated audio**: May not be recognized as speech (synthetic)
- **Real audio**: Should be tested with actual voice recordings
- **Silence**: Should return "No speech detected" with preserved PWM

## Troubleshooting

### No Transcriptions
If no speech is recognized:
1. **Generated audio limitation**: Synthetic audio may not sound like human speech
2. **Try real audio**: Record actual voice and convert to test format
3. **Check API logs**: Look for speech recognition errors

### Audio Playback
To verify saved audio:
```bash
# Using ffplay
ffplay -f s16le -ar 16000 -ac 1 ./test-audio/speech-segment-0-*.raw

# Using Audacity
# Import > Raw Data > Signed 16-bit PCM, 16000 Hz, Mono
```

## Integration with Client

This test exactly matches the client's audio processing:
- Same silence detection algorithm
- Same audio format (Int16Array → base64)
- Same API payload structure
- Same timing and buffering behavior

Use this test to verify speech recognition accuracy before testing with the full client application.