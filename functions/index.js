// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { logger } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addmessage = onRequest(
    {
        region: "europe-west1"
    },
    async (req, res) => {
        // Grab the text parameter.
        const original = req.query.text;
        // Push the new message into Firestore using the Firebase Admin SDK.
        const writeResult = await getFirestore()
            .collection("messages")
            .add({ original: original });
        // Send back a message that we've successfully written the message
        res.json({ result: `Message with ID: ${writeResult.id} added.` });
    });

// Listens for new messages added to /messages/:documentId/original
// and saves an uppercased version of the message
// to /messages/:documentId/uppercase
exports.makeuppercase = onDocumentCreated( 
    {
        document: "/messages/{documentId}",
        region: "europe-west1"
    },
    (event) => {
    // Grab the current value of what was written to Firestore.
    const original = event.data.data().original;

    // Access the parameter `{documentId}` with `event.params`
    logger.log("Uppercasing", event.params.documentId, original);

    const uppercase = original.toUpperCase();

    // You must return a Promise when performing
    // asynchronous tasks inside a function
    // such as writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return event.data.ref.set({ uppercase }, { merge: true });
});

// User data storage API endpoint
exports.storeUserData = onRequest(
    {
        region: "europe-west1",
        invoker: "public",
        cors: {
            origin: [
                /^https?:\/\/localhost(:\d+)?$/,
                /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
                /^https?:\/\/.*\.gitpod\.dev$/,
                /^file:\/\/.*$/,
                /^capacitor:\/\/.*$/,
                /^ionic:\/\/.*$/,
                /^cordova:\/\/.*$/,
                /^ms-appx-web:\/\/.*$/,
                /^app:\/\/.*$/,
                /^tauri:\/\/.*$/,
                /^http:\/\/.*$/,
                /^https:\/\/.*$/
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            credentials: true
        }
    },
    async (req, res) => {
        try {
            // Only allow POST requests
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed. Use POST.' });
            }

            // Validate required fields
            const { userId, deviceFingerprint } = req.body;
            
            if (!userId) {
                return res.status(400).json({ error: 'Missing required field: userId' });
            }

            if (!deviceFingerprint) {
                return res.status(400).json({ error: 'Missing required field: deviceFingerprint' });
            }

            // Prepare user data document
            const userData = {
                userId: userId,
                deviceFingerprint: deviceFingerprint,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Store additional metadata
                userAgent: req.headers['user-agent'] || null,
                ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress || null,
                // Include any additional device details if provided
                ...req.body.additionalData
            };

            // Store user data in Firestore
            const db = getFirestore();
            const userDataRef = db.collection('userData').doc(userId);
            
            // Check if user data already exists
            const existingDoc = await userDataRef.get();
            
            if (existingDoc.exists) {
                // Update existing document
                await userDataRef.update({
                    deviceFingerprint: userData.deviceFingerprint,
                    updatedAt: userData.updatedAt,
                    userAgent: userData.userAgent,
                    ipAddress: userData.ipAddress,
                    ...req.body.additionalData
                });
                
                logger.log('User data updated', { userId });
                
                res.json({
                    success: true,
                    message: 'User data updated successfully',
                    userId: userId,
                    action: 'updated'
                });
            } else {
                // Create new document
                await userDataRef.set(userData);
                
                logger.log('User data created', { userId });
                
                res.json({
                    success: true,
                    message: 'User data stored successfully',
                    userId: userId,
                    action: 'created'
                });
            }

        } catch (error) {
            logger.error('Store user data error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to store user data',
                details: error.message
            });
        }
    }
);

// User consent storage/update API endpoint
exports.storeUserConsent = onRequest(
    {
        region: "europe-west1",
        invoker: "public",
        cors: {
            origin: [
                /^https?:\/\/localhost(:\d+)?$/,
                /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
                /^https?:\/\/.*\.gitpod\.dev$/,
                /^file:\/\/.*$/,
                /^capacitor:\/\/.*$/,
                /^ionic:\/\/.*$/,
                /^cordova:\/\/.*$/,
                /^ms-appx-web:\/\/.*$/,
                /^app:\/\/.*$/,
                /^tauri:\/\/.*$/,
                /^http:\/\/.*$/,
                /^https:\/\/.*$/
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            credentials: true
        }
    },
    async (req, res) => {
        try {
            // Only allow POST and PUT requests
            if (!['POST', 'PUT'].includes(req.method)) {
                return res.status(405).json({ error: 'Method not allowed. Use POST or PUT.' });
            }

            // Validate required fields - now using deviceId from thumbmarkjs
            const { deviceId, userId, consent } = req.body;
            
            // Use deviceId as primary identifier, fallback to userId for backward compatibility
            const identifier = deviceId || userId;
            
            if (!identifier) {
                return res.status(400).json({ error: 'Missing required field: deviceId (or userId for backward compatibility)' });
            }

            if (!consent || typeof consent !== 'object') {
                return res.status(400).json({ 
                    error: 'Missing or invalid consent data. Must be an object.' 
                });
            }

            // Validate consent structure (basic validation) - updated for thumbmarkjs integration
            const validConsentFields = [
                'analytics', 'marketing', 'functional', 'necessary',
                'dataProcessing', 'cookies', 'thirdParty', 'remoteControl'
            ];

            const hasValidConsentField = Object.keys(consent).some(key => 
                validConsentFields.includes(key) && typeof consent[key] === 'boolean'
            );

            if (!hasValidConsentField) {
                return res.status(400).json({
                    error: 'Invalid consent data. Must contain at least one valid consent field with boolean value.',
                    validFields: validConsentFields
                });
            }

            // Prepare consent data document with thumbmarkjs integration
            const consentData = {
                deviceId: identifier, // Primary identifier from thumbmarkjs
                userId: userId || null, // Optional legacy field
                consent: consent,
                consentVersion: req.body.consentVersion || '1.0',
                consentDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Store additional metadata
                userAgent: req.headers['user-agent'] || null,
                ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress || null,
                consentSource: req.body.consentSource || 'web',
                // Thumbmarkjs specific fields
                deviceFingerprint: req.body.deviceFingerprint || null,
                fingerprintMethod: deviceId ? 'thumbmarkjs' : 'legacy',
                timestamp: req.body.timestamp || new Date().toISOString(),
                purpose: req.body.purpose || 'unspecified'
            };

            // Store consent data in Firestore using deviceId as document ID
            const db = getFirestore();
            const consentRef = db.collection('userConsent').doc(identifier);
            
            // Check if consent data already exists
            const existingConsent = await consentRef.get();
            
            if (existingConsent.exists) {
                // Update existing consent
                const existingData = existingConsent.data();
                
                // Merge consent preferences
                const updatedConsent = {
                    ...existingData.consent,
                    ...consent
                };

                await consentRef.update({
                    consent: updatedConsent,
                    consentVersion: consentData.consentVersion,
                    updatedAt: consentData.updatedAt,
                    userAgent: consentData.userAgent,
                    ipAddress: consentData.ipAddress,
                    consentSource: consentData.consentSource,
                    // Thumbmarkjs specific fields
                    deviceFingerprint: consentData.deviceFingerprint,
                    fingerprintMethod: consentData.fingerprintMethod,
                    purpose: consentData.purpose,
                    // Keep history of consent changes
                    previousConsent: existingData.consent,
                    previousConsentDate: existingData.consentDate
                });
                
                logger.log('User consent updated', { 
                    deviceId: identifier,
                    userId: userId,
                    previousConsent: existingData.consent,
                    newConsent: updatedConsent,
                    fingerprintMethod: consentData.fingerprintMethod
                });
                
                res.json({
                    success: true,
                    message: 'User consent updated successfully',
                    deviceId: identifier,
                    userId: userId,
                    consent: updatedConsent,
                    action: 'updated'
                });
            } else {
                // Create new consent document
                await consentRef.set(consentData);
                
                logger.log('User consent created', { 
                    deviceId: identifier, 
                    userId: userId,
                    consent: consent,
                    fingerprintMethod: consentData.fingerprintMethod
                });
                
                res.json({
                    success: true,
                    message: 'User consent stored successfully',
                    deviceId: identifier,
                    userId: userId,
                    consent: consent,
                    action: 'created'
                });
            }

        } catch (error) {
            logger.error('Store user consent error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to store user consent',
                details: error.message
            });
        }
    }
);

// Get user consent API endpoint
exports.getUserConsent = onRequest(
    {
        region: "europe-west1",
        invoker: "public",
        cors: {
            origin: [
                /^https?:\/\/localhost(:\d+)?$/,
                /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
                /^https?:\/\/.*\.gitpod\.dev$/,
                /^file:\/\/.*$/,
                /^capacitor:\/\/.*$/,
                /^ionic:\/\/.*$/,
                /^cordova:\/\/.*$/,
                /^ms-appx-web:\/\/.*$/,
                /^app:\/\/.*$/,
                /^tauri:\/\/.*$/,
                /^http:\/\/.*$/,
                /^https:\/\/.*$/
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            credentials: true
        }
    },
    async (req, res) => {
        try {
            // Only allow GET requests
            if (req.method !== 'GET') {
                return res.status(405).json({ error: 'Method not allowed. Use GET.' });
            }

            // Get userId from query parameters
            const userId = req.query.userId;
            
            if (!userId) {
                return res.status(400).json({ error: 'Missing required parameter: userId' });
            }

            // Retrieve consent data from Firestore
            const db = getFirestore();
            const consentRef = db.collection('userConsent').doc(userId);
            const consentDoc = await consentRef.get();
            
            if (!consentDoc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'User consent not found',
                    userId: userId
                });
            }

            const consentData = consentDoc.data();
            
            logger.log('User consent retrieved', { userId });
            
            res.json({
                success: true,
                userId: userId,
                consent: consentData.consent,
                consentVersion: consentData.consentVersion,
                consentDate: consentData.consentDate,
                updatedAt: consentData.updatedAt
            });

        } catch (error) {
            logger.error('Get user consent error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve user consent',
                details: error.message
            });
        }
    }
);


// Direct Audio-to-PWM Processing with Gemini
exports.directAudioToPWM = onRequest(
    {
        region: "europe-west1",
        cors: {
            origin: true,
            methods: ["POST", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"]
        },
        maxInstances: 10,
        timeoutSeconds: 60,
        memory: "1GiB"
    },
    async (req, res) => {
        try {
            // Handle CORS preflight
            if (req.method === 'OPTIONS') {
                res.set('Access-Control-Allow-Origin', '*');
                res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
                res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                res.status(204).send('');
                return;
            }

            // Set CORS headers for actual request
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            logger.log('Direct Audio-to-PWM request received', {
                method: req.method,
                contentType: req.get('content-type'),
                bodySize: req.body ? JSON.stringify(req.body).length : 0,
                region: 'europe-west1'
            });

            // Validate request
            if (!req.body || !req.body.audioData) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing audio data in request body',
                    newPwmValue: req.body?.currentPwm || 100,
                    msgHis: req.body?.msgHis || []
                });
            }

            // Extract request data
            const { audioData, currentPwm = 100, msgHis = [] } = req.body;
            
            logger.log('Processing direct audio input', {
                audioDataLength: audioData.length,
                currentPwm: currentPwm,
                messageHistoryLength: msgHis.length,
                region: 'europe-west1'
            });

            // Convert Int16Array to WAV format for Gemini
            const int16Data = new Int16Array(audioData);
            const wavBuffer = createWavBuffer(int16Data, 16000); // 16kHz sample rate
            const base64Audio = Buffer.from(wavBuffer).toString('base64');

            // Initialize Gemini with audio capabilities
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const apiKey = "AIzaSyD9KKLF3WBa6gi0_orzF-OMydzO4rIX_uY";
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            // Prepare conversation history for context
            const conversationHistory = msgHis.map(msg => {
                const user = msg.user || msg.transcript || 'Unknown';
                const assistant = msg.assistant || msg.response || 'Unknown';
                return `User: ${user}\nAssistant: ${assistant}`;
            }).join('\n\n');

            // Create prompt for direct audio processing
            const prompt = `You are a motor control assistant. Listen to the audio and determine if the user wants to control a motor device.

Current motor PWM value: ${currentPwm} (0-255 scale, where 0=off, 255=maximum)

Previous conversation:
${conversationHistory || 'No previous conversation'}

Instructions:
1. Listen to the audio and understand what the user is saying
2. Determine if they want to control the motor (turn on/off, increase/decrease intensity, set specific level)
3. If motor control is intended, calculate the appropriate PWM value (0-255)
4. If no motor control is intended, keep the current PWM value

Respond in this exact JSON format:
{
  "intentDetected": true/false,
  "transcription": "what the user said",
  "pwm": number (0-255),
  "response": "your response to the user"
}

Examples:
- "turn it on" → {"intentDetected": true, "transcription": "turn it on", "pwm": 150, "response": "Turning the motor on"}
- "make it stronger" → {"intentDetected": true, "transcription": "make it stronger", "pwm": currentPwm + 50, "response": "Increasing motor intensity"}
- "what's the weather" → {"intentDetected": false, "transcription": "what's the weather", "pwm": currentPwm, "response": "I'm a motor control assistant. I can help you control the motor device."}`;

            // Send audio directly to Gemini
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType: "audio/wav",
                        data: base64Audio
                    }
                }
            ]);

            const responseText = result.response.text();
            logger.log('Gemini direct audio response received', {
                responseLength: responseText.length,
                region: 'europe-west1'
            });

            // Parse JSON response
            let llmResponse;
            try {
                // Extract JSON from response (handle potential markdown formatting)
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                const jsonString = jsonMatch ? jsonMatch[0] : responseText;
                llmResponse = JSON.parse(jsonString);
            } catch (parseError) {
                logger.error('Failed to parse Gemini response as JSON', {
                    response: responseText,
                    error: parseError.message,
                    region: 'europe-west1'
                });
                
                return res.status(200).json({
                    success: false,
                    error: 'Failed to parse AI response',
                    transcription: 'Audio processed but response format invalid',
                    newPwmValue: currentPwm,
                    msgHis: msgHis,
                    details: parseError.message
                });
            }

            // Validate and process response
            const intentDetected = llmResponse.intentDetected === true || llmResponse.intentDetected === 'true';
            const transcription = llmResponse.transcription || 'Audio processed';
            let newPwmValue;
            
            if (intentDetected) {
                const parsedPwm = parseInt(llmResponse.pwm);
                newPwmValue = Math.max(0, Math.min(255, isNaN(parsedPwm) ? currentPwm : parsedPwm));
            } else {
                newPwmValue = currentPwm;
            }

            // Update message history
            const updatedMsgHis = [...msgHis, {
                user: transcription,
                assistant: llmResponse.response || 'Motor control processed',
                timestamp: new Date().toISOString(),
                pwm: newPwmValue,
                intentDetected: intentDetected
            }];

            // Keep only last 10 messages
            if (updatedMsgHis.length > 10) {
                updatedMsgHis.splice(0, updatedMsgHis.length - 10);
            }

            logger.log('Direct audio processing completed successfully', {
                transcription: transcription,
                intentDetected: intentDetected,
                oldPwm: currentPwm,
                newPwm: newPwmValue,
                region: 'europe-west1'
            });

            res.status(200).json({
                success: true,
                transcription: transcription,
                newPwmValue: newPwmValue,
                response: llmResponse.response || 'Motor control processed',
                intentDetected: intentDetected,
                msgHis: updatedMsgHis,
                processingMethod: 'direct-audio-to-pwm'
            });

        } catch (error) {
            logger.error('Direct Audio-to-PWM processing failed', {
                error: error.message,
                stack: error.stack,
                region: 'europe-west1'
            });

            res.status(500).json({
                success: false,
                error: 'Direct audio processing failed',
                details: error.message,
                newPwmValue: req.body?.currentPwm || 100,
                msgHis: req.body?.msgHis || []
            });
        }
    }
);

// Helper function to create WAV buffer from Int16Array
function createWavBuffer(int16Data, sampleRate) {
    const length = int16Data.length;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Audio data
    for (let i = 0; i < length; i++) {
        view.setInt16(44 + i * 2, int16Data[i], true);
    }
    
    return buffer;
}