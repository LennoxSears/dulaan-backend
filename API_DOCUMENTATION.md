# Dulaan Backend API Documentation

This document describes the three new API endpoints developed for the Dulaan Backend Firebase Cloud Functions.

## Overview

The backend provides four main API endpoints and a WebRTC signaling server:

### Firebase Cloud Functions APIs:
1. **Speech-to-Text API** - Convert audio to text using Google Cloud Speech-to-Text
2. **Speech-to-Text with LLM API** - Convert audio to text and process with Google Gemini LLM
3. **User Data Storage API** - Store user information and device fingerprints
4. **User Consent API** - Store and manage user consent preferences

### Google App Engine Services:
5. **PeerJS Server** - WebRTC signaling server for peer-to-peer communication

All endpoints are deployed to the `europe-west1` region and support CORS for web applications.

## Base URL

**Local Development (Emulator):**
```
http://localhost:5001/dulaan-backend/europe-west1/
```

**Production (Cloud Functions):**
```
https://europe-west1-dulaan-backend.cloudfunctions.net/
```

**Production (PeerJS Server):**
```
https://peerjs-server-dot-dulaan-backend.appspot.com/peerjs
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
  "languageCode": "en-US"                       // Optional, enables automatic detection if omitted
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

### Language Detection

**Automatic Language Detection**: If `languageCode` is not provided, the API automatically detects the language from a comprehensive list of supported languages including:

- `en-US`, `en-GB` (English)
- `es-ES` (Spanish)
- `fr-FR` (French) 
- `de-DE` (German)
- `it-IT` (Italian)
- `pt-PT` (Portuguese)
- `ru-RU` (Russian)
- `ja-JP` (Japanese)
- `ko-KR` (Korean)
- `zh-CN`, `zh-TW` (Chinese)
- `ar-SA` (Arabic)
- `hi-IN` (Hindi)
- `nl-NL` (Dutch)
- `sv-SE` (Swedish)
- `da-DK` (Danish)
- `no-NO` (Norwegian)
- `fi-FI` (Finnish)
- `pl-PL` (Polish)
- `cs-CZ` (Czech)
- `hu-HU` (Hungarian)
- `tr-TR` (Turkish)
- `he-IL` (Hebrew)
- `th-TH` (Thai)
- `vi-VN` (Vietnamese)
- `id-ID` (Indonesian)
- `ms-MY` (Malay)
- `tl-PH` (Filipino)
- `uk-UA` (Ukrainian)
- And many more...

**Manual Language Selection**: You can still specify a `languageCode` to force recognition in a specific language.

### Response Fields

- `success`: Boolean indicating if the request was successful
- `transcription`: The transcribed text from the audio
- `confidence`: Confidence score for the transcription (0.0 to 1.0)
- `detectedLanguage`: The language code detected by the API (e.g., "en-US", "fr-FR")
- `autoDetected`: Boolean indicating if language was automatically detected (true) or manually specified (false)
- `results`: Full results array from Google Cloud Speech-to-Text API

### Response

**Success (200):**
```json
{
  "success": true,
  "transcription": "Hello, this is the transcribed text.",
  "confidence": 0.95,
  "detectedLanguage": "en-US",
  "autoDetected": true,
  "results": [
    {
      "alternatives": [
        {
          "transcript": "Hello, this is the transcribed text.",
          "confidence": 0.95
        }
      ],
      "languageCode": "en-US"
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

**JavaScript/Fetch (with automatic language detection):**
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
      audioContent: base64Audio
      // languageCode omitted for automatic detection
    })
  });
  
  const result = await response.json();
  console.log('Transcription:', result.transcription);
  console.log('Detected Language:', result.detectedLanguage);
  console.log('Auto-detected:', result.autoDetected);
};
reader.readAsDataURL(audioBlob);
```

**JavaScript/Fetch (with specific language):**
```javascript
// Force specific language recognition
const response = await fetch('/speechToText', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    audioContent: base64Audio,
    languageCode: 'es-ES' // Force Spanish recognition
  })
});
```

**cURL (automatic language detection):**
```bash
curl -X POST "https://europe-west1-dulaan-backend.cloudfunctions.net/speechToText" \
  -H "Content-Type: application/json" \
  -d '{
    "audioContent": "base64-encoded-audio-data"
  }'
```

**cURL (specific language):**
```bash
curl -X POST "https://europe-west1-dulaan-backend.cloudfunctions.net/speechToText" \
  -H "Content-Type: application/json" \
  -d '{
    "audioContent": "base64-encoded-audio-data",
    "languageCode": "fr-FR"
  }'
```

---

## 2. Speech-to-Text with LLM API

### Endpoint
`POST /speechToTextWithLLM`

### Description
Converts audio content to text using Google Cloud Speech-to-Text API, then processes the transcript with Google Gemini LLM for adaptive motor control. This endpoint is specifically designed for adult toy control applications.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "msgHis": [],                                 // Required: Message history array
  "audioContent": "base64-encoded-audio-data",  // Required if audioUri not provided
  "audioUri": "gs://bucket/audio-file.wav",     // Required if audioContent not provided
  "currentPwm": 128,                           // Required: Current PWM value (0-255)
  "geminiApiKey": "your-gemini-api-key",       // Required: Google Gemini API key
  "encoding": "WEBM_OPUS",                     // Optional, default: "WEBM_OPUS"
  "sampleRateHertz": 48000,                    // Optional, default: 48000
  "languageCode": "en-US"                      // Optional, enables automatic detection if omitted
}
```

### Request Parameters

- `msgHis`: Array of conversation history messages in Gemini format
- `audioContent`: Base64-encoded audio data
- `audioUri`: Google Cloud Storage URI for audio file
- `currentPwm`: Current PWM value (0-255 integer)
- `geminiApiKey`: Google Gemini API key (can also be set as GEMINI_API_KEY environment variable)
- `encoding`: Audio encoding format
- `sampleRateHertz`: Audio sample rate
- `languageCode`: Language for speech recognition (auto-detected if omitted)

### Message History Format

The `msgHis` array follows Google Gemini's conversation format:
```json
[
  {
    "role": "user",
    "parts": [{ "text": "{\"user_command\": \"increase speed\", \"current_pwm\": 100}" }]
  },
  {
    "role": "model", 
    "parts": [{ "text": "150" }]
  }
]
```

### Processing Logic

1. **Speech Recognition**: Converts audio to text with automatic language detection
2. **Message History Management**: 
   - Resets msgHis if empty or >13 messages
   - Adds new user message with transcript and current PWM
3. **LLM Processing**: Sends updated msgHis to Google Gemini for PWM value generation
4. **Response Integration**: Adds LLM response to msgHis and returns complete conversation

### Response

**Success (200):**
```json
{
  "success": true,
  "transcript": "increase the speed a little bit",
  "currentPwm": 100,
  "newPwmValue": "150",
  "msgHis": [
    {
      "role": "user",
      "parts": [{ "text": "{\"user_command\": \"increase the speed a little bit\", \"current_pwm\": 100}" }]
    },
    {
      "role": "model",
      "parts": [{ "text": "150" }]
    }
  ],
  "detectedLanguage": "en-US",
  "autoDetected": true
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

### System Instruction

The LLM uses this system instruction for motor control:

```
# System Role
You are an adaptive motor control engine for adult toys, combining **natural language instructions** and **current real-time PWM value** to generate one PWM value. 
if you don't understand **natural language instructions**, just return **current real-time PWM value**.
**Output Restriction**: Return ONLY the PWM value.

# Input Specification
"user_command": "String",          // natural language instruction
"current_pwm": 0-255 integer       // current real-time PWM value

# Output Specification
0-255 integer   // (ONLY this field)
```

### Example Usage

**JavaScript/Fetch:**
```javascript
const audioBlob = new Blob([audioData], { type: 'audio/webm' });
const reader = new FileReader();
reader.onload = async function() {
  const base64Audio = reader.result.split(',')[1];
  
  const response = await fetch('/speechToTextWithLLM', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      msgHis: [], // Empty for first message
      audioContent: base64Audio,
      currentPwm: 100,
      geminiApiKey: 'your-gemini-api-key'
    })
  });
  
  const result = await response.json();
  console.log('Transcript:', result.transcript);
  console.log('New PWM Value:', result.newPwmValue);
  console.log('Updated Message History:', result.msgHis);
};
reader.readAsDataURL(audioBlob);
```

**cURL:**
```bash
curl -X POST "https://europe-west1-dulaan-backend.cloudfunctions.net/speechToTextWithLLM" \
  -H "Content-Type: application/json" \
  -d '{
    "msgHis": [],
    "audioContent": "base64-encoded-audio-data",
    "currentPwm": 128,
    "geminiApiKey": "your-gemini-api-key"
  }'
```

### Security Considerations

- **API Key Security**: Store Gemini API key securely, preferably as environment variable
- **Input Validation**: All inputs are validated before processing
- **Content Safety**: Safety settings are configured to allow adult content processing
- **Rate Limiting**: Consider implementing rate limiting for production use

---

## 3. User Data Storage API

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

### Response Fields

- `success`: Boolean indicating if the request was successful
- `transcription`: The transcribed text from the audio
- `confidence`: Confidence score for the transcription (0.0 to 1.0)
- `detectedLanguage`: The language code detected by the API (e.g., "en-US", "fr-FR")
- `autoDetected`: Boolean indicating if language was automatically detected (true) or manually specified (false)
- `results`: Full results array from Google Cloud Speech-to-Text API

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

## 4. User Consent API

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

## 5. PeerJS Server (WebRTC Signaling)

### Overview
The PeerJS server enables WebRTC peer-to-peer connections for real-time communication. It's deployed on Google App Engine as a separate service from the Cloud Functions.

### Server URL
**Production:** `https://peerjs-server-dot-dulaan-backend.appspot.com/peerjs`
**Local Development:** `http://localhost:8080/peerjs`

### Architecture
```
Client A ←→ PeerJS Server ←→ Client B
    ↓                           ↓
    └─── Direct P2P Connection ──┘
```

The server only handles signaling; actual data flows directly between peers.

### Client Integration

**JavaScript/Web Client:**
```javascript
// Connect to the PeerJS server
const peer = new Peer('unique-peer-id', {
  host: 'peerjs-server-dot-dulaan-backend.appspot.com',
  port: 443,
  path: '/peerjs',
  secure: true,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }
});

// Handle connection events
peer.on('open', (id) => {
  console.log('Connected with ID:', id);
});

peer.on('connection', (conn) => {
  console.log('Incoming connection from:', conn.peer);
  
  conn.on('data', (data) => {
    console.log('Received data:', data);
  });
});

// Connect to another peer
const conn = peer.connect('target-peer-id');
conn.on('open', () => {
  conn.send('Hello from peer!');
});
```

**React/Vue/Angular Integration:**
```javascript
import Peer from 'peerjs';

class PeerService {
  constructor() {
    this.peer = new Peer({
      host: 'peerjs-server-dot-dulaan-backend.appspot.com',
      port: 443,
      path: '/peerjs',
      secure: true
    });
  }

  connect(targetPeerId) {
    return this.peer.connect(targetPeerId);
  }

  onConnection(callback) {
    this.peer.on('connection', callback);
  }

  disconnect() {
    if (this.peer) {
      this.peer.destroy();
    }
  }
}

export default PeerService;
```

### API Endpoints

**Server Information:**
- `GET /` - Server status and information
- `GET /_ah/health` - Health check for App Engine

**PeerJS Endpoints:**
- `POST /peerjs/id` - Generate new peer ID
- `WebSocket /peerjs/peerjs` - WebSocket endpoint for signaling

### Features

- **Automatic Peer ID Generation**: Server generates unique peer IDs
- **Connection Management**: Tracks active peers and handles disconnections
- **CORS Support**: Configured for cross-origin requests
- **Session Affinity**: Enabled for WebSocket connections
- **Auto Scaling**: 1-10 instances based on CPU utilization
- **Health Monitoring**: Built-in health checks and monitoring

### Security

- **HTTPS/WSS**: All connections use secure protocols in production
- **Peer Discovery**: Disabled by default to prevent peer enumeration
- **Rate Limiting**: App Engine provides built-in DDoS protection
- **Authentication**: Optional API key authentication available

### Testing

A test client is available at `/peerjs-server/test-client.html` for development and testing purposes.

### Deployment

The PeerJS server is deployed separately from Cloud Functions:

```bash
cd peerjs-server
./deploy.sh
```

### Monitoring

Monitor the PeerJS server through Google Cloud Console:
- **Logs**: `gcloud app logs tail --service=default`
- **Metrics**: CPU, memory, and connection count
- **Health**: Automatic health checks and alerting

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

**Cloud Functions:**
```bash
# Start emulator
firebase emulators:start --only functions

# Functions available at:
# http://localhost:5001/dulaan-backend/europe-west1/functionName
```

**PeerJS Server:**
```bash
# Start development server
cd peerjs-server
npm run dev

# Server available at:
# http://localhost:8080/peerjs
```