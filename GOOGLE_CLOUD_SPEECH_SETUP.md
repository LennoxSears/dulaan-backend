# Google Cloud Speech API Setup Guide

## Problem
The `speechToTextWithLLM` function is returning a 500 error because Google Cloud Speech API credentials are not configured.

## Solution Options

### Option 1: Use Firebase Project's Default Service Account (Recommended)

1. **Enable Google Cloud Speech API in your Firebase project:**
   ```bash
   # Go to Google Cloud Console
   # Navigate to: APIs & Services > Library
   # Search for "Cloud Speech-to-Text API"
   # Click "Enable"
   ```

2. **Grant Speech API permissions to Firebase Functions:**
   ```bash
   # In Google Cloud Console, go to IAM & Admin > IAM
   # Find your Firebase service account (usually ends with @appspot.gserviceaccount.com)
   # Add role: "Cloud Speech Client" or "Cloud Speech Administrator"
   ```

3. **No code changes needed** - Firebase Functions automatically use the default service account

### Option 2: Use Explicit Service Account

1. **Create a service account:**
   ```bash
   # In Google Cloud Console: IAM & Admin > Service Accounts
   # Click "Create Service Account"
   # Name: "speech-api-service"
   # Grant role: "Cloud Speech Client"
   ```

2. **Download the service account key:**
   ```bash
   # Click on the created service account
   # Go to "Keys" tab
   # Click "Add Key" > "Create new key" > JSON
   # Download the JSON file
   ```

3. **Add the key to Firebase Functions:**
   ```bash
   # Upload the JSON file to your functions folder
   # Update the speechToTextWithLLM function to use it:
   ```

   ```javascript
   // Add this before creating speechClient
   const path = require('path');
   process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'service-account-key.json');
   ```

### Option 3: Temporary Workaround (Testing Only)

I've added a `testLLMOnly` function that bypasses the Speech API for testing:

```javascript
// Test the LLM functionality without Speech API
fetch('https://testllmonly-qveg3gkwxa-ew.a.run.app', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        currentPwm: 100,
        testTranscript: "Turn it up",
        msgHis: []
    })
})
```

## Quick Test

Deploy the updated function and test the LLM-only endpoint:

```bash
cd functions
firebase deploy --only functions:testLLMOnly
```

Then test in browser console:
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

## Recommended Next Steps

1. **Enable Speech API** in Google Cloud Console for your Firebase project
2. **Grant permissions** to the default Firebase service account
3. **Test the original function** - it should work without code changes
4. **Remove the test function** once the main function works

The Speech API setup is the only missing piece for full functionality!