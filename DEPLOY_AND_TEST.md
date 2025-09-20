# 🚀 Deploy and Test Instructions

## Current Status
- ✅ Speech API is now enabled and working
- ✅ Fixed sample rate auto-detection issue
- 🔄 Need to deploy the updated function

## Next Steps

### 1. Deploy the Updated Function
```bash
firebase deploy --only functions:speechToTextWithLLM
```

### 2. Test the Fixed Function
After deployment, test in browser console:
```javascript
// Test speechToTextWithLLM with auto-detect sample rate
fetch('https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        msgHis: [],
        audioContent: "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
        currentPwm: 100,
        encoding: 'LINEAR16'
        // No sampleRateHertz - let it auto-detect
    })
}).then(r => r.json()).then(console.log)
```

### 3. Expected Result
```json
{
  "success": false,
  "error": "No speech detected in audio",
  "transcription": "",
  "newPwmValue": 100,
  "msgHis": []
}
```

This is the **correct result** for silent test audio!

### 4. If Working, I'll Clean Up
Once you confirm it's working, I'll:
- Remove the `testLLMOnly` function
- Clean up all test files
- Update documentation
- Commit the final clean version

## What Was Fixed
- ✅ Speech API enabled in Google Cloud Console
- ✅ Removed hardcoded 16000 Hz sample rate default
- ✅ Function now auto-detects sample rate from WAV header
- ✅ Gemini API key properly configured

The function should now work perfectly with real audio from your client!