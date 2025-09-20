# Speech API Troubleshooting Guide

## Current Status
- ❌ `speechToTextWithLLM` returns 500 error (Speech API credentials issue)
- ❌ `testLLMOnly` returns 404 (not deployed yet)

## Immediate Actions Needed

### 1. Deploy the Test Function
```bash
firebase deploy --only functions:testLLMOnly
```

### 2. Test LLM Functionality (Bypass Speech API)
After deployment, test in browser console:
```javascript
fetch('https://testllmonly-qveg3gkwxa-ew.a.run.app', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        currentPwm: 100,
        testTranscript: "Turn it up",
        msgHis: []
    })
}).then(r => r.json()).then(console.log)
```

### 3. Fix Google Cloud Speech API Credentials

The 500 error indicates Speech API credentials are not properly configured. Here's the exact process:

#### Step A: Enable Speech API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project (`dulaan-backend`)
3. Navigate to **APIs & Services > Library**
4. Search for "Cloud Speech-to-Text API"
5. Click **Enable**

#### Step B: Configure Service Account Permissions
1. Go to **IAM & Admin > IAM**
2. Find your Firebase Functions service account:
   - Look for: `dulaan-backend@appspot.gserviceaccount.com`
   - Or similar ending with `@appspot.gserviceaccount.com`
3. Click the **Edit** (pencil) icon
4. Click **Add Another Role**
5. Select: **Cloud Speech Client** or **Cloud Speech Administrator**
6. Click **Save**

#### Step C: Verify Project Settings
1. Ensure you're in the correct project (`dulaan-backend`)
2. Check that billing is enabled (Speech API requires billing)
3. Verify the project ID matches your Firebase project

### 4. Test Again
After completing the above steps, test the original function:
```javascript
// Test with minimal audio data
fetch('https://speechtotextwithllm-qveg3gkwxa-ew.a.run.app', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        msgHis: [],
        audioContent: "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
        currentPwm: 100,
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US'
    })
}).then(r => r.json()).then(console.log)
```

## Expected Results

### If Speech API is properly configured:
- Status: 200
- Response: `{ success: true/false, transcription: "...", response: "...", newPwmValue: ... }`
- Even with silent audio, you should get `success: false` with "No speech detected" (not a 500 error)

### If Speech API is still not configured:
- Status: 500
- This means credentials/permissions are still missing

## Alternative: Use Service Account Key (If IAM doesn't work)

If the IAM approach doesn't work, you can use an explicit service account:

1. **Create Service Account:**
   - Go to **IAM & Admin > Service Accounts**
   - Click **Create Service Account**
   - Name: `speech-api-service`
   - Role: **Cloud Speech Client**

2. **Download Key:**
   - Click on the created service account
   - Go to **Keys** tab
   - Click **Add Key > Create new key > JSON**
   - Download the JSON file

3. **Update Function Code:**
   ```javascript
   // Add this before creating speechClient in functions/index.js
   const path = require('path');
   process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'service-account-key.json');
   ```

## Next Steps
1. Deploy testLLMOnly function
2. Fix Speech API credentials using the steps above
3. Test both functions
4. If working, I'll remove the test code