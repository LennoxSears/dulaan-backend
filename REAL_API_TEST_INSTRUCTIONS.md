# Real API Test Instructions

## 🚀 How to Test the Real speechToTextWithLLM API

I've created comprehensive test tools to test your actual Firebase function with three language audio samples.

### 📊 Test Cases
1. **🇺🇸 English**: "Turn it up" (1.2s audio)
2. **🇪🇸 Spanish**: "Más fuerte" (1.3s audio) 
3. **🇨🇳 Chinese**: "加强" (1.1s audio)

All commands are designed to increase motor power.

## 🔧 Testing Options

### Option 1: Browser Test Runner (Recommended)
**URL**: [https://8080--01996c07-f427-7022-8f58-16a3ecb6432d.us-east-1-01.gitpod.dev/test-real-api.html](https://8080--01996c07-f427-7022-8f58-16a3ecb6432d.us-east-1-01.gitpod.dev/test-real-api.html)

**Features**:
- ✅ Interactive interface with real-time logging
- ✅ Tests all three languages automatically
- ✅ Generates realistic audio data
- ✅ Makes actual API calls to your Firebase function
- ✅ Validates responses and shows detailed results
- ✅ No setup required - just click and test

**How to use**:
1. Open the URL above
2. Click "🚀 Test Real API (All Languages)"
3. Watch the real-time results
4. Check validation results for each language

### Option 2: Individual Language Testing
Use the same browser interface but click individual language buttons:
- 🇺🇸 Test English
- 🇪🇸 Test Spanish  
- 🇨🇳 Test Chinese

## 📡 API Details

**Endpoint**: `https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app`

**Request Format**:
```json
{
  "msgHis": [],
  "audioBuffer": [/* Int16Array as regular array */],
  "currentPwm": 100,
  "encoding": "LINEAR16",
  "sampleRateHertz": 16000,
  "languageCode": "en-US" // or "es-ES", "zh-CN"
}
```

**Expected Response**:
```json
{
  "success": true,
  "transcription": "turn it up",
  "response": "Increasing motor power as requested.",
  "reasoning": "Clear motor control command detected",
  "newPwmValue": 150,
  "previousPwm": 100,
  "intentDetected": true,
  "msgHis": [...],
  "detectedLanguage": "en-US",
  "confidence": 0.85
}
```

## ✅ What Gets Tested

### Audio Processing
- ✅ Realistic speech pattern generation
- ✅ Int16Array buffer creation (16kHz, mono)
- ✅ Proper JSON transmission format

### API Integration  
- ✅ Real Google Cloud Speech-to-Text API
- ✅ Real Google Gemini LLM API
- ✅ Multi-language support
- ✅ Error handling and validation

### Motor Control Logic
- ✅ Intent detection for motor commands
- ✅ PWM value calculation and updates
- ✅ Message history management
- ✅ Language-specific responses

## 📊 Expected Results

For each test case, you should see:

1. **✅ API Success**: `success: true`
2. **✅ Transcription**: Contains motor control keywords
3. **✅ Intent Detection**: `intentDetected: true`
4. **✅ PWM Increase**: `newPwmValue > previousPwm`
5. **✅ Language Response**: Appropriate language response
6. **✅ Confidence**: Speech recognition confidence > 30%

## 🔍 Validation Checks

The test runner automatically validates:
- API response success
- Transcription quality
- Intent detection accuracy
- PWM control logic
- Multi-language support
- Error handling

## 🚨 Troubleshooting

If tests fail, check:
1. **API Endpoint**: Ensure Firebase function is deployed
2. **CORS**: Check if CORS is properly configured
3. **API Keys**: Verify Google Cloud credentials
4. **Network**: Check internet connectivity
5. **Logs**: Review Firebase function logs for errors

## 🎯 Quick Start

**Fastest way to test**:
1. Open: [test-real-api.html](https://8080--01996c07-f427-7022-8f58-16a3ecb6432d.us-east-1-01.gitpod.dev/test-real-api.html)
2. Click "🚀 Test Real API (All Languages)"
3. Wait for results (each test takes ~5-10 seconds)
4. Review validation results

The test will make real API calls to your Firebase function and show you exactly how the Int16Array approach performs with actual Google APIs!