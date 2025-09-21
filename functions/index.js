// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { logger } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Google Cloud Speech-to-Text
const speech = require("@google-cloud/speech");

// Multer for handling multipart/form-data
const multer = require("multer");

initializeApp();

// Initialize Google Cloud Speech client
const speechClient = new speech.SpeechClient();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

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


// Speech-to-Text with LLM processing API endpoint
exports.speechToTextWithLLM = onRequest(
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
            const { msgHis, audioBuffer, audioUri, currentPwm, testMode, testTranscript } = req.body;

            // Check if audio data is provided (unless in test mode)
            if (!testMode && !audioBuffer && !audioUri) {
                return res.status(400).json({ 
                    error: 'Missing audio data. Provide either audioBuffer (Int16Array) or audioUri.' 
                });
            }

            // Validate msgHis array
            if (!Array.isArray(msgHis)) {
                return res.status(400).json({ 
                    error: 'msgHis must be an array.' 
                });
            }

            // Validate currentPwm
            if (typeof currentPwm !== 'number' || currentPwm < 0 || currentPwm > 255) {
                return res.status(400).json({ 
                    error: 'currentPwm must be a number between 0 and 255.' 
                });
            }

            // Step 1: Convert speech to text using Google Cloud Speech-to-Text
            let transcript = '';
            let confidence = 0;
            let detectedLanguage = null;

            // Test mode: skip speech recognition and use provided transcript
            if (testMode && testTranscript) {
                transcript = testTranscript;
                confidence = 0.95; // High confidence for test
                detectedLanguage = req.body.languageCode || 'en-US';
                
                logger.log('Test mode: using provided transcript', {
                    testTranscript: transcript,
                    confidence: confidence,
                    detectedLanguage: detectedLanguage
                });
            } else if (audioBuffer) {
                // Convert audioBuffer array to Int16Array buffer (from stream.js approach)
                const int16Data = new Int16Array(audioBuffer);
                
                const speechConfig = {
                    encoding: 'LINEAR16',  // Int16Array is LINEAR16 PCM data
                    enableAutomaticPunctuation: true,
                    enableWordTimeOffsets: false,
                    enableWordConfidence: true,
                    model: 'chirp',        // BEST: Google's latest universal speech model (90-95% accuracy)
                    useEnhanced: true,     // Use enhanced model for better accuracy
                    profanityFilter: false,
                    maxAlternatives: 1,
                    audioChannelCount: 1,  // Mono audio
                    sampleRateHertz: req.body.sampleRateHertz || 16000,
                    // Additional optimizations for CHIRP
                    enableSpeakerDiarization: false,  // Single speaker
                    enableSeparateRecognitionPerChannel: false,
                    enableWordTimeOffsets: false,
                    enableWordConfidence: true,
                    metadata: {
                        interactionType: 'VOICE_COMMAND',  // Optimize for voice commands
                        microphoneDistance: 'NEARFIELD',   // Close microphone
                        originalMediaType: 'AUDIO',
                        recordingDeviceType: 'SMARTPHONE'
                    }
                };

                // Streamlined language detection for maximum performance
                if (req.body.languageCode && req.body.languageCode !== 'auto') {
                    // Use specific language if provided
                    speechConfig.languageCode = req.body.languageCode;
                } else {
                    // Simplified to English and Spanish only for optimal performance
                    speechConfig.languageCode = 'en-US'; // Primary language
                    speechConfig.alternativeLanguageCodes = ['es-ES']; // Spanish only
                    
                    logger.log('Using CHIRP model with streamlined language detection', {
                        primaryLanguage: speechConfig.languageCode,
                        alternativeLanguages: speechConfig.alternativeLanguageCodes,
                        model: 'chirp',
                        optimization: 'English + Spanish only for maximum performance'
                    });
                }

                const speechRequest = { 
                    config: speechConfig,
                    audio: { content: Buffer.from(int16Data.buffer).toString('base64') }
                };

                // Log audio info for debugging
                logger.log('Processing audio with CHIRP model', {
                    encoding: speechConfig.encoding,
                    sampleRateHertz: speechConfig.sampleRateHertz,
                    audioBufferLength: int16Data.length,
                    audioBufferBytes: int16Data.buffer.byteLength,
                    model: speechConfig.model,
                    interactionType: speechConfig.metadata.interactionType,
                    expectedAccuracy: '90-95%'
                });

                // Perform speech recognition
                const [speechResponse] = await speechClient.recognize(speechRequest);
                
                // Extract transcription with confidence filtering
                if (speechResponse.results && speechResponse.results.length > 0) {
                    const bestResult = speechResponse.results[0];
                    if (bestResult.alternatives && bestResult.alternatives.length > 0) {
                        const bestAlternative = bestResult.alternatives[0];
                        transcript = bestAlternative.transcript || '';
                        confidence = bestAlternative.confidence || 0;
                        detectedLanguage = bestResult.languageCode || null;
                        
                        // CHIRP model has better confidence scores, use lower threshold
                        if (confidence < 0.2 && transcript.trim().length > 0) {
                            logger.log('Low confidence transcription filtered out', { 
                                transcript, 
                                confidence,
                                threshold: 0.2,
                                model: 'chirp'
                            });
                            transcript = '';
                        }
                    }
                }
            } else if (audioUri) {
                // Handle URI-based audio (existing logic)
                const speechConfig = {
                    encoding: req.body.encoding || 'LINEAR16',
                    enableAutomaticPunctuation: true,
                    enableWordTimeOffsets: false,
                    enableWordConfidence: true,
                    model: 'latest_short',
                    useEnhanced: true,
                    profanityFilter: false,
                    maxAlternatives: 1,
                    audioChannelCount: 1,
                    sampleRateHertz: req.body.sampleRateHertz || 16000
                };

                if (req.body.languageCode) {
                    speechConfig.languageCode = req.body.languageCode;
                } else {
                    speechConfig.languageCode = 'en-US';
                }

                const speechRequest = { 
                    config: speechConfig,
                    audio: { uri: audioUri }
                };

                const [speechResponse] = await speechClient.recognize(speechRequest);
                
                if (speechResponse.results && speechResponse.results.length > 0) {
                    const bestResult = speechResponse.results[0];
                    if (bestResult.alternatives && bestResult.alternatives.length > 0) {
                        const bestAlternative = bestResult.alternatives[0];
                        transcript = bestAlternative.transcript || '';
                        confidence = bestAlternative.confidence || 0;
                        detectedLanguage = bestResult.languageCode || null;
                    }
                }
            }

            // Clean up transcript
            transcript = transcript.trim();

            if (!transcript || transcript.length === 0) {
                return res.status(200).json({
                    success: false,
                    error: 'No speech detected in audio',
                    transcription: '',
                    newPwmValue: currentPwm,  // Return current PWM unchanged
                    msgHis: msgHis,
                    confidence: confidence,
                    detectedLanguage: detectedLanguage
                });
            }

            // Step 2: Process with LLM for motor control
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            
            // Use hardcoded API key
            const apiKey = "AIzaSyD9KKLF3WBa6gi0_orzF-OMydzO4rIX_uY";

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Prepare conversation history for context (handle different formats safely)
            const conversationHistory = msgHis.map(msg => {
                // Handle different message formats
                const user = msg.user || msg.transcript || 'Unknown';
                const assistant = msg.assistant || msg.response || 'Unknown';
                return `User: ${user}\nAssistant: ${assistant}`;
            }).join('\n\n');

            const prompt = `You are an adaptive motor control engine combining natural language instructions and current PWM value to generate one PWM value.

Current PWM: ${currentPwm}
User command: "${transcript}"

INTENSITY MODIFIERS:
- "a little/slightly" → ±20 PWM
- "much/way more" → ±40 PWM  
- "huge/massive" → ±70 PWM

EXAMPLES:
- "a little harder" (100) → 120
- "much faster" (80) → 120
- "way less" (200) → 160
- "stop" → 0

If you don't understand the instruction, return current PWM value ${currentPwm}.

Respond with a JSON object containing:
- "response": Your natural language response to the user
- "pwm": New PWM value (0-255)
- "reasoning": Brief explanation of your PWM choice
- "intentDetected": true/false - whether motor control intent was detected`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Parse LLM response
            let llmResponse;
            try {
                // Extract JSON from response (handle potential markdown formatting)
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    llmResponse = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                logger.error('Failed to parse LLM response:', parseError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to parse LLM response',
                    transcription: transcript,
                    newPwmValue: currentPwm,
                    msgHis: msgHis
                });
            }

            // Validate PWM value and intent detection
            const intentDetected = llmResponse.intentDetected === true || llmResponse.intentDetected === 'true';
            let newPwmValue;
            
            if (intentDetected) {
                // Only change PWM if intent was detected
                // Fix: Use nullish coalescing (??) instead of logical OR (||) to handle PWM = 0 correctly
                const parsedPwm = parseInt(llmResponse.pwm);
                newPwmValue = Math.max(0, Math.min(255, isNaN(parsedPwm) ? currentPwm : parsedPwm));
            } else {
                // No motor control intent detected, keep current PWM
                newPwmValue = currentPwm;
            }
            
            // Update message history
            const updatedMsgHis = [...msgHis, {
                user: transcript,
                assistant: llmResponse.response,
                pwm: newPwmValue,
                intentDetected: intentDetected,
                timestamp: new Date().toISOString()
            }];

            // Keep only last 10 messages to prevent context from getting too long
            const trimmedMsgHis = updatedMsgHis.slice(-10);

            logger.log('Speech-to-text with LLM completed', {
                transcriptionLength: transcript.length,
                transcription: transcript,
                currentPwm: currentPwm,
                newPwmValue: newPwmValue,
                intentDetected: intentDetected,
                confidence: confidence,
                messageHistoryLength: trimmedMsgHis.length
            });

            res.json({
                success: true,
                transcription: transcript,
                response: llmResponse.response,
                reasoning: llmResponse.reasoning,
                newPwmValue: newPwmValue,
                previousPwm: currentPwm,
                intentDetected: intentDetected,
                msgHis: trimmedMsgHis,
                detectedLanguage: detectedLanguage,
                confidence: confidence
            });

        } catch (error) {
            logger.error('Speech-to-text with LLM error:', error);
            
            // Check if it's a speech recognition error specifically
            if (error.message && error.message.includes('speech')) {
                return res.status(200).json({
                    success: false,
                    error: 'Speech recognition failed - audio may be unclear or too noisy',
                    transcription: '',
                    newPwmValue: req.body.currentPwm || 100,  // Use request body value
                    msgHis: req.body.msgHis || [],
                    details: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                error: 'Speech-to-text with LLM processing failed',
                details: error.message,
                newPwmValue: req.body.currentPwm || 100,  // Preserve PWM on errors
                msgHis: req.body.msgHis || []
            });
        }
    }
);