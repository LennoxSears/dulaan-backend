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
https://dulaan-backend.ew.r.appspot.com/peerjs
```

---

## 1. Speech-to-Text with LLM API

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

## 3. User Consent API

### Endpoints

#### Store/Update Consent
`POST /storeUserConsent` or `PUT /storeUserConsent`

#### Get Consent
`GET /getUserConsent?userId=user-id`

### Description
Manages user consent preferences for GDPR compliance and privacy settings. Now integrates with ThumbmarkJS for robust device fingerprinting and identification.

### Store/Update Consent Request

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "deviceId": "a1b2c3d4e5f6...",                // Required: Device fingerprint from ThumbmarkJS
  "userId": "unique-user-identifier",           // Optional: Legacy identifier (backward compatibility)
  "consent": {                                  // Required
    "necessary": true,
    "analytics": false,
    "marketing": true,
    "functional": true,
    "dataProcessing": true,
    "cookies": false,
    "thirdParty": false,
    "remoteControl": true                       // New: Remote control functionality consent
  },
  "consentVersion": "2.0",                      // Optional, default: "1.0"
  "consentSource": "web",                       // Optional, default: "web"
  "purpose": "personal",                        // Optional: Purpose (personal, research, commercial, testing)
  "timestamp": "2023-12-01T10:00:00Z",          // Optional: Client-side timestamp
  "deviceFingerprint": "additional_data"       // Optional: Additional fingerprint data
}
```

### Valid Consent Fields
- `necessary` - Essential cookies and functionality
- `analytics` - Analytics and performance tracking
- `marketing` - Marketing and advertising
- `functional` - Functional cookies and features
- `dataProcessing` - General data processing consent
- `cookies` - Cookie usage consent
- `thirdParty` - Third-party services consent
- `remoteControl` - Remote control functionality consent (new)

### Device Identification
The API now uses **ThumbmarkJS** for device fingerprinting:
- `deviceId` is the primary identifier generated by ThumbmarkJS
- Provides ~90% uniqueness with client-side library alone
- Can be enhanced with API key for 99%+ uniqueness
- Fallback fingerprinting available when ThumbmarkJS is unavailable
- `userId` field maintained for backward compatibility
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
- Document ID: `deviceId` (primary) or `userId` (legacy)
- Maintains consent history with `previousConsent` and `previousConsentDate`
- Automatic timestamps and metadata
- Additional fields: `fingerprintMethod`, `purpose`, `deviceFingerprint`

### Client-Side Integration

**Include ThumbmarkJS:**
```html
<script src="https://cdn.jsdelivr.net/npm/@thumbmarkjs/thumbmarkjs/dist/thumbmark.umd.js"></script>
```

**Generate Device ID:**
```javascript
// Using ThumbmarkJS for device fingerprinting
const tm = new ThumbmarkJS.Thumbmark({
    exclude: ['permissions'], // Faster generation
    timeout: 3000,
    logging: false
});

const result = await tm.get();
const deviceId = result.thumbmark;
```

**Collect Consent with Device ID:**
```javascript
const consentData = {
  deviceId: deviceId,                    // From ThumbmarkJS
  consent: {
    necessary: true,
    analytics: true,
    marketing: false,
    functional: true,
    dataProcessing: true,
    cookies: true,
    thirdParty: false,
    remoteControl: true
  },
  consentVersion: '2.0',
  consentSource: 'web',
  purpose: 'personal',
  timestamp: new Date().toISOString()
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

**Complete Integration Example:**
```javascript
// Complete consent collection workflow
async function collectUserConsent(consentChoices) {
    try {
        // 1. Generate device ID
        const deviceId = await generateDeviceId();
        
        // 2. Prepare consent data
        const consentData = {
            deviceId: deviceId,
            consent: consentChoices,
            purpose: 'personal',
            timestamp: new Date().toISOString()
        };
        
        // 3. Submit to API
        const response = await fetch('/storeUserConsent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(consentData)
        });
        
        const result = await response.json();
        console.log('Consent collected:', result);
        return result;
    } catch (error) {
        console.error('Consent collection failed:', error);
        throw error;
    }
}

async function generateDeviceId() {
    if (typeof ThumbmarkJS !== 'undefined') {
        const tm = new ThumbmarkJS.Thumbmark({
            exclude: ['permissions'],
            timeout: 3000,
            logging: false
        });
        const result = await tm.get();
        return result.thumbmark;
    } else {
        // Fallback fingerprinting
        const basicFingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        
        const fingerprintString = JSON.stringify(basicFingerprint);
        let hash = 0;
        for (let i = 0; i < fingerprintString.length; i++) {
            const char = fingerprintString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
}
```

**Get Consent:**
```javascript
const response = await fetch('/getUserConsent?deviceId=a1b2c3d4e5f6...');
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
4. **Device Fingerprinting**: ThumbmarkJS provides privacy-conscious fingerprinting
5. **Consent Management**: Full GDPR compliance with consent history tracking
6. **Fallback Security**: Graceful degradation when ThumbmarkJS is unavailable
4. **Consent Tracking**: Full audit trail for consent changes
5. **Regional Compliance**: Deployed in Europe (europe-west1) for GDPR compliance

---

## Rate Limiting

Firebase Cloud Functions have built-in rate limiting:
- Default: 1000 requests per 100 seconds per function
- Concurrent executions: 1000 per region

For production use, consider implementing additional rate limiting based on your requirements.

---

## 4. PeerJS Server (WebRTC Signaling)

### Overview
The PeerJS server enables WebRTC peer-to-peer connections for real-time communication. It's deployed on Google App Engine as a separate service from the Cloud Functions.

### Server URL
**Production:** `https://dulaan-backend.ew.r.appspot.com/peerjs`
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
  host: 'dulaan-backend.ew.r.appspot.com',
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
      host: 'dulaan-backend.ew.r.appspot.com',
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
firebase deploy --only functions
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