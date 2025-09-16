# Dulaan Backend API Documentation

This document describes the three new API endpoints developed for the Dulaan Backend Firebase Cloud Functions.

## Overview

The backend provides three main API endpoints:
1. **Speech-to-Text API** - Convert audio to text using Google Cloud Speech-to-Text
2. **User Data Storage API** - Store user information and device fingerprints
3. **User Consent API** - Store and manage user consent preferences

All endpoints are deployed to the `europe-west1` region and support CORS for web applications.

## Base URL

**Local Development (Emulator):**
```
http://localhost:5001/dulaan-backend/europe-west1/
```

**Production:**
```
https://europe-west1-dulaan-backend.cloudfunctions.net/
```

---

## 1. Speech-to-Text API

### Endpoint
`POST /speechToText`

### Description
Converts audio content to text using Google Cloud Speech-to-Text API.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "audioContent": "base64-encoded-audio-data",  // Required if audioUri not provided
  "audioUri": "gs://bucket/audio-file.wav",     // Required if audioContent not provided
  "encoding": "WEBM_OPUS",                      // Optional, default: "WEBM_OPUS"
  "sampleRateHertz": 48000,                     // Optional, default: 48000
  "languageCode": "en-US"                       // Optional, default: "en-US"
}
```

### Supported Audio Encodings
- `WEBM_OPUS` (default)
- `LINEAR16`
- `FLAC`
- `MULAW`
- `AMR`
- `AMR_WB`
- `OGG_OPUS`
- `SPEEX_WITH_HEADER_BYTE`

### Supported Language Codes
- `en-US` (English - US)
- `en-GB` (English - UK)
- `es-ES` (Spanish)
- `fr-FR` (French)
- `de-DE` (German)
- And many more...

### Response

**Success (200):**
```json
{
  "success": true,
  "transcription": "Hello, this is the transcribed text.",
  "confidence": 0.95,
  "results": [
    {
      "alternatives": [
        {
          "transcript": "Hello, this is the transcribed text.",
          "confidence": 0.95
        }
      ]
    }
  ]
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": "Error description",
  "details": "Detailed error message"
}
```

### Example Usage

**JavaScript/Fetch:**
```javascript
const audioBlob = new Blob([audioData], { type: 'audio/webm' });
const reader = new FileReader();
reader.onload = async function() {
  const base64Audio = reader.result.split(',')[1];
  
  const response = await fetch('/speechToText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audioContent: base64Audio,
      languageCode: 'en-US'
    })
  });
  
  const result = await response.json();
  console.log('Transcription:', result.transcription);
};
reader.readAsDataURL(audioBlob);
```

**cURL:**
```bash
curl -X POST "https://europe-west1-dulaan-backend.cloudfunctions.net/speechToText" \
  -H "Content-Type: application/json" \
  -d '{
    "audioContent": "base64-encoded-audio-data",
    "languageCode": "en-US"
  }'
```

---

## 2. User Data Storage API

### Endpoint
`POST /storeUserData`

### Description
Stores user information and device fingerprint data in Firestore.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "userId": "unique-user-identifier",           // Required
  "deviceFingerprint": {                        // Required
    "userAgent": "Mozilla/5.0...",
    "screen": "1920x1080",
    "timezone": "UTC",
    "language": "en-US",
    "platform": "Win32",
    "cookieEnabled": true,
    "doNotTrack": false
  },
  "additionalData": {                           // Optional
    "sessionId": "session-123",
    "referrer": "https://example.com",
    "customField": "custom-value"
  }
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "User data stored successfully",
  "userId": "unique-user-identifier",
  "action": "created"  // or "updated"
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": "Error description",
  "details": "Detailed error message"
}
```

### Data Storage
- Data is stored in Firestore collection: `userData`
- Document ID: `userId`
- Automatic timestamps: `createdAt`, `updatedAt`
- Additional metadata: `userAgent`, `ipAddress`

### Example Usage

**JavaScript/Fetch:**
```javascript
const userData = {
  userId: 'user-12345',
  deviceFingerprint: {
    userAgent: navigator.userAgent,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1'
  },
  additionalData: {
    sessionId: 'session-abc123',
    referrer: document.referrer
  }
};

const response = await fetch('/storeUserData', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(userData)
});

const result = await response.json();
console.log('User data stored:', result);
```

---

## 3. User Consent API

### Endpoints

#### Store/Update Consent
`POST /storeUserConsent` or `PUT /storeUserConsent`

#### Get Consent
`GET /getUserConsent?userId=user-id`

### Description
Manages user consent preferences for GDPR compliance and privacy settings.

### Store/Update Consent Request

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "unique-user-identifier",           // Required
  "consent": {                                  // Required
    "necessary": true,
    "analytics": false,
    "marketing": true,
    "functional": true,
    "dataProcessing": true,
    "cookies": false,
    "thirdParty": false
  },
  "consentVersion": "2.0",                      // Optional, default: "1.0"
  "consentSource": "web"                        // Optional, default: "web"
}
```

### Valid Consent Fields
- `necessary` - Essential cookies and functionality
- `analytics` - Analytics and performance tracking
- `marketing` - Marketing and advertising
- `functional` - Enhanced functionality features
- `dataProcessing` - General data processing consent
- `cookies` - Cookie usage consent
- `thirdParty` - Third-party service integration

### Store/Update Response

**Success (200):**
```json
{
  "success": true,
  "message": "User consent stored successfully",
  "userId": "unique-user-identifier",
  "consent": {
    "necessary": true,
    "analytics": false,
    "marketing": true,
    "functional": true,
    "dataProcessing": true,
    "cookies": false,
    "thirdParty": false
  },
  "action": "created"  // or "updated"
}
```

### Get Consent Response

**Success (200):**
```json
{
  "success": true,
  "userId": "unique-user-identifier",
  "consent": {
    "necessary": true,
    "analytics": false,
    "marketing": true,
    "functional": true,
    "dataProcessing": true,
    "cookies": false,
    "thirdParty": false
  },
  "consentVersion": "2.0",
  "consentDate": "2025-09-16T11:30:00.000Z",
  "updatedAt": "2025-09-16T11:35:00.000Z"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "User consent not found",
  "userId": "unique-user-identifier"
}
```

### Data Storage
- Data is stored in Firestore collection: `userConsent`
- Document ID: `userId`
- Maintains consent history with `previousConsent` and `previousConsentDate`
- Automatic timestamps and metadata

### Example Usage

**Store Consent:**
```javascript
const consentData = {
  userId: 'user-12345',
  consent: {
    necessary: true,
    analytics: true,
    marketing: false,
    functional: true,
    dataProcessing: true,
    cookies: true,
    thirdParty: false
  },
  consentVersion: '2.0',
  consentSource: 'web'
};

const response = await fetch('/storeUserConsent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(consentData)
});

const result = await response.json();
console.log('Consent stored:', result);
```

**Get Consent:**
```javascript
const response = await fetch('/getUserConsent?userId=user-12345');
const result = await response.json();
console.log('User consent:', result.consent);
```

---

## Error Handling

All endpoints return consistent error responses:

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (for GET requests)
- `405` - Method Not Allowed
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": "Technical error details"
}
```

---

## Security Considerations

1. **CORS**: All endpoints support CORS for web applications
2. **Input Validation**: All inputs are validated before processing
3. **Data Privacy**: User data is stored securely in Firestore
4. **Consent Tracking**: Full audit trail for consent changes
5. **Regional Compliance**: Deployed in Europe (europe-west1) for GDPR compliance

---

## Rate Limiting

Firebase Cloud Functions have built-in rate limiting:
- Default: 1000 requests per 100 seconds per function
- Concurrent executions: 1000 per region

For production use, consider implementing additional rate limiting based on your requirements.

---

## Monitoring and Logging

All functions include comprehensive logging:
- Request/response logging
- Error tracking
- Performance metrics
- User action auditing

Logs can be viewed in:
- Firebase Console > Functions > Logs
- Google Cloud Console > Logging

---

## Dependencies

The functions use the following key dependencies:
- `firebase-functions` v6.0.1 - Cloud Functions runtime
- `firebase-admin` v12.6.0 - Firestore access
- `@google-cloud/speech` v6.7.0 - Speech-to-Text API
- `multer` v1.4.5 - File upload handling

---

## Deployment

To deploy the functions:

```bash
# Install dependencies
cd functions
npm install

# Deploy to Firebase
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:speechToText
```

For local development:
```bash
# Start emulator
firebase emulators:start --only functions

# Functions available at:
# http://localhost:5001/dulaan-backend/europe-west1/functionName
```