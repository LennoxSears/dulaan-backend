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



// Speech-to-Text with LLM processing API endpoint
exports.speechToTextWithLLM = onRequest(
    {
        region: "europe-west1",
        cors: true
    },
    async (req, res) => {
        try {
            // Only allow POST requests
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed. Use POST.' });
            }

            // Validate required fields
            const { msgHis, audioContent, audioUri, currentPwm } = req.body;

            // Check if audio data is provided
            if (!audioContent && !audioUri) {
                return res.status(400).json({ 
                    error: 'Missing audio data. Provide either audioContent (base64) or audioUri.' 
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

            // Step 1: Convert speech to text
            const speechConfig = {
                encoding: req.body.encoding || 'WEBM_OPUS',
                sampleRateHertz: req.body.sampleRateHertz || 48000,
                enableAutomaticPunctuation: true,
                model: 'latest_long'
            };

            // Enable automatic language detection if no languageCode provided
            if (req.body.languageCode) {
                speechConfig.languageCode = req.body.languageCode;
            } else {
                speechConfig.languageCode = 'en-US';
                speechConfig.alternativeLanguageCodes = [
                    'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 
                    'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW', 'ar-SA', 
                    'hi-IN', 'nl-NL', 'sv-SE', 'da-DK', 'no-NO', 'fi-FI', 
                    'pl-PL', 'cs-CZ', 'hu-HU', 'tr-TR', 'he-IL', 'th-TH',
                    'vi-VN', 'id-ID', 'ms-MY', 'tl-PH', 'uk-UA', 'bg-BG'
                ];
            }

            const speechRequest = { config: speechConfig };

            // Add audio content
            if (audioContent) {
                speechRequest.audio = { content: audioContent };
            } else if (audioUri) {
                speechRequest.audio = { uri: audioUri };
            }

            // Perform speech recognition
            const [speechResponse] = await speechClient.recognize(speechRequest);
            
            // Extract transcription
            const transcript = speechResponse.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            if (!transcript || transcript.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'No speech detected in audio'
                });
            }

            // Step 2: Update msgHis with speech transcript
            let updatedMsgHis = [...msgHis];

            // Reset msgHis if empty or too long (>13 messages)
            if (updatedMsgHis.length === 0 || updatedMsgHis.length > 13) {
                updatedMsgHis = [
                    {
                        role: 'user',
                        parts: [{ text: JSON.stringify({ user_command: transcript, current_pwm: currentPwm }) }]
                    }
                ];
            } else {
                // Add new user message
                updatedMsgHis.push({
                    role: 'user',
                    parts: [{ text: JSON.stringify({ user_command: transcript, current_pwm: currentPwm }) }]
                });
            }

            // Step 3: Send to Google Gemini LLM
            const API_KEY = process.env.GEMINI_API_KEY || req.body.geminiApiKey;
            if (!API_KEY) {
                return res.status(400).json({
                    success: false,
                    error: 'Gemini API key is required. Provide it in request body as geminiApiKey or set GEMINI_API_KEY environment variable.'
                });
            }

            const MODEL_ID = 'gemini-2.0-flash-exp';

            const geminiRequestBody = {
                contents: updatedMsgHis,
                systemInstruction: {
                    parts: [{
                        text: `# System Role
You are an adaptive motor control engine for adult toys, combining **natural language instructions** and **current real-time PWM value** to generate one PWM value. 
if you don't understand  **natural language instructions**, just return **current real-time PWM value**.
**Output Restriction**: Return ONLY the PWM value.

# Input Specification
"user_command": "String",          // natural language instruction
"current_pwm": 0-255 integer       // current real-time PWM value

# Output Specification
0-255 integer   // (ONLY this field)`
                    }]
                },
                generationConfig: {
                    temperature: 1,
                    maxOutputTokens: 65535,
                    topP: 1
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
                ]
            };

            const geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(geminiRequestBody)
                }
            );

            if (!geminiResponse.ok) {
                const errorBody = await geminiResponse.text();
                logger.error('Gemini API error:', errorBody);
                return res.status(500).json({
                    success: false,
                    error: `Gemini API error ${geminiResponse.status}: ${errorBody}`
                });
            }

            const geminiResult = await geminiResponse.json();
            
            // Extract LLM response
            const llmResponse = geminiResult.candidates[0].content;
            const pwmValue = llmResponse.parts[0].text.trim();

            // Step 4: Add LLM response to msgHis
            updatedMsgHis.push(llmResponse);

            // Log the processing for debugging
            logger.log('Speech-to-text with LLM processing completed', {
                transcript: transcript,
                currentPwm: currentPwm,
                newPwmValue: pwmValue,
                msgHisLength: updatedMsgHis.length
            });

            // Step 5: Return final msgHis and processing results
            res.json({
                success: true,
                transcript: transcript,
                currentPwm: currentPwm,
                newPwmValue: pwmValue,
                msgHis: updatedMsgHis,
                detectedLanguage: speechResponse.results[0]?.languageCode || null,
                autoDetected: !req.body.languageCode
            });

        } catch (error) {
            logger.error('Speech-to-text with LLM error:', error);
            res.status(500).json({
                success: false,
                error: 'Speech-to-text with LLM processing failed',
                details: error.message
            });
        }
    }
);

// User data storage API endpoint
exports.storeUserData = onRequest(
    {
        region: "europe-west1",
        cors: true
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
                // Store additional metadata if provided
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

// Speech-to-Text with LLM processing API endpoint
exports.speechToTextWithLLM = onRequest(
    {
        region: "europe-west1",
        cors: true
    },
    async (req, res) => {
        try {
            // Only allow POST requests
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed. Use POST.' });
            }

            // Validate required fields
            const { msgHis, audioContent, audioUri, currentPwm } = req.body;

            // Check if audio data is provided
            if (!audioContent && !audioUri) {
                return res.status(400).json({ 
                    error: 'Missing audio data. Provide either audioContent (base64) or audioUri.' 
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

            // Step 1: Convert speech to text
            const speechConfig = {
                encoding: req.body.encoding || 'WEBM_OPUS',
                sampleRateHertz: req.body.sampleRateHertz || 48000,
                enableAutomaticPunctuation: true,
                model: 'latest_long'
            };

            // Enable automatic language detection if no languageCode provided
            if (req.body.languageCode) {
                speechConfig.languageCode = req.body.languageCode;
            } else {
                speechConfig.languageCode = 'en-US';
                speechConfig.alternativeLanguageCodes = [
                    'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 
                    'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW', 'ar-SA', 
                    'hi-IN', 'nl-NL', 'sv-SE', 'da-DK', 'no-NO', 'fi-FI', 
                    'pl-PL', 'cs-CZ', 'hu-HU', 'tr-TR', 'he-IL', 'th-TH',
                    'vi-VN', 'id-ID', 'ms-MY', 'tl-PH', 'uk-UA', 'bg-BG'
                ];
            }

            const speechRequest = { config: speechConfig };

            // Add audio content
            if (audioContent) {
                speechRequest.audio = { content: audioContent };
            } else if (audioUri) {
                speechRequest.audio = { uri: audioUri };
            }

            // Perform speech recognition
            const [speechResponse] = await speechClient.recognize(speechRequest);
            
            // Extract transcription
            const transcript = speechResponse.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            if (!transcript || transcript.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'No speech detected in audio'
                });
            }

            // Step 2: Update msgHis with speech transcript
            let updatedMsgHis = [...msgHis];

            // Reset msgHis if empty or too long (>13 messages)
            if (updatedMsgHis.length === 0 || updatedMsgHis.length > 13) {
                updatedMsgHis = [
                    {
                        role: 'user',
                        parts: [{ text: JSON.stringify({ user_command: transcript, current_pwm: currentPwm }) }]
                    }
                ];
            } else {
                // Add new user message
                updatedMsgHis.push({
                    role: 'user',
                    parts: [{ text: JSON.stringify({ user_command: transcript, current_pwm: currentPwm }) }]
                });
            }

            // Step 3: Send to Google Gemini LLM
            const API_KEY = process.env.GEMINI_API_KEY || req.body.geminiApiKey;
            if (!API_KEY) {
                return res.status(400).json({
                    success: false,
                    error: 'Gemini API key is required. Provide it in request body as geminiApiKey or set GEMINI_API_KEY environment variable.'
                });
            }

            const MODEL_ID = 'gemini-2.0-flash-exp';

            const geminiRequestBody = {
                contents: updatedMsgHis,
                systemInstruction: {
                    parts: [{
                        text: `# System Role
You are an adaptive motor control engine for adult toys, combining **natural language instructions** and **current real-time PWM value** to generate one PWM value. 
if you don't understand  **natural language instructions**, just return **current real-time PWM value**.
**Output Restriction**: Return ONLY the PWM value.

# Input Specification
"user_command": "String",          // natural language instruction
"current_pwm": 0-255 integer       // current real-time PWM value

# Output Specification
0-255 integer   // (ONLY this field)`
                    }]
                },
                generationConfig: {
                    temperature: 1,
                    maxOutputTokens: 65535,
                    topP: 1
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
                ]
            };

            const geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(geminiRequestBody)
                }
            );

            if (!geminiResponse.ok) {
                const errorBody = await geminiResponse.text();
                logger.error('Gemini API error:', errorBody);
                return res.status(500).json({
                    success: false,
                    error: `Gemini API error ${geminiResponse.status}: ${errorBody}`
                });
            }

            const geminiResult = await geminiResponse.json();
            
            // Extract LLM response
            const llmResponse = geminiResult.candidates[0].content;
            const pwmValue = llmResponse.parts[0].text.trim();

            // Step 4: Add LLM response to msgHis
            updatedMsgHis.push(llmResponse);

            // Log the processing for debugging
            logger.log('Speech-to-text with LLM processing completed', {
                transcript: transcript,
                currentPwm: currentPwm,
                newPwmValue: pwmValue,
                msgHisLength: updatedMsgHis.length
            });

            // Step 5: Return final msgHis and processing results
            res.json({
                success: true,
                transcript: transcript,
                currentPwm: currentPwm,
                newPwmValue: pwmValue,
                msgHis: updatedMsgHis,
                detectedLanguage: speechResponse.results[0]?.languageCode || null,
                autoDetected: !req.body.languageCode
            });

        } catch (error) {
            logger.error('Speech-to-text with LLM error:', error);
            res.status(500).json({
                success: false,
                error: 'Speech-to-text with LLM processing failed',
                details: error.message
            });
        }
    }
);

// User consent storage/update API endpoint
exports.storeUserConsent = onRequest(
    {
        region: "europe-west1",
        cors: true
    },
    async (req, res) => {
        try {
            // Only allow POST and PUT requests
            if (!['POST', 'PUT'].includes(req.method)) {
                return res.status(405).json({ error: 'Method not allowed. Use POST or PUT.' });
            }

            // Validate required fields
            const { userId, consent } = req.body;
            
            if (!userId) {
                return res.status(400).json({ error: 'Missing required field: userId' });
            }

            if (!consent || typeof consent !== 'object') {
                return res.status(400).json({ 
                    error: 'Missing or invalid consent data. Must be an object.' 
                });
            }

            // Validate consent structure (basic validation)
            const validConsentFields = [
                'analytics', 'marketing', 'functional', 'necessary',
                'dataProcessing', 'cookies', 'thirdParty'
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

            // Prepare consent data document
            const consentData = {
                userId: userId,
                consent: consent,
                consentVersion: req.body.consentVersion || '1.0',
                consentDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Store additional metadata
                userAgent: req.headers['user-agent'] || null,
                ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress || null,
                consentSource: req.body.consentSource || 'web'
            };

            // Store consent data in Firestore
            const db = getFirestore();
            const consentRef = db.collection('userConsent').doc(userId);
            
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
                    // Keep history of consent changes
                    previousConsent: existingData.consent,
                    previousConsentDate: existingData.consentDate
                });
                
                logger.log('User consent updated', { 
                    userId, 
                    previousConsent: existingData.consent,
                    newConsent: updatedConsent
                });
                
                res.json({
                    success: true,
                    message: 'User consent updated successfully',
                    userId: userId,
                    consent: updatedConsent,
                    action: 'updated'
                });
            } else {
                // Create new consent document
                await consentRef.set(consentData);
                
                logger.log('User consent created', { userId, consent });
                
                res.json({
                    success: true,
                    message: 'User consent stored successfully',
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

// Speech-to-Text with LLM processing API endpoint
exports.speechToTextWithLLM = onRequest(
    {
        region: "europe-west1",
        cors: true
    },
    async (req, res) => {
        try {
            // Only allow POST requests
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed. Use POST.' });
            }

            // Validate required fields
            const { msgHis, audioContent, audioUri, currentPwm } = req.body;

            // Check if audio data is provided
            if (!audioContent && !audioUri) {
                return res.status(400).json({ 
                    error: 'Missing audio data. Provide either audioContent (base64) or audioUri.' 
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

            // Step 1: Convert speech to text
            const speechConfig = {
                encoding: req.body.encoding || 'WEBM_OPUS',
                sampleRateHertz: req.body.sampleRateHertz || 48000,
                enableAutomaticPunctuation: true,
                model: 'latest_long'
            };

            // Enable automatic language detection if no languageCode provided
            if (req.body.languageCode) {
                speechConfig.languageCode = req.body.languageCode;
            } else {
                speechConfig.languageCode = 'en-US';
                speechConfig.alternativeLanguageCodes = [
                    'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 
                    'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW', 'ar-SA', 
                    'hi-IN', 'nl-NL', 'sv-SE', 'da-DK', 'no-NO', 'fi-FI', 
                    'pl-PL', 'cs-CZ', 'hu-HU', 'tr-TR', 'he-IL', 'th-TH',
                    'vi-VN', 'id-ID', 'ms-MY', 'tl-PH', 'uk-UA', 'bg-BG'
                ];
            }

            const speechRequest = { config: speechConfig };

            // Add audio content
            if (audioContent) {
                speechRequest.audio = { content: audioContent };
            } else if (audioUri) {
                speechRequest.audio = { uri: audioUri };
            }

            // Perform speech recognition
            const [speechResponse] = await speechClient.recognize(speechRequest);
            
            // Extract transcription
            const transcript = speechResponse.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            if (!transcript || transcript.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'No speech detected in audio'
                });
            }

            // Step 2: Update msgHis with speech transcript
            let updatedMsgHis = [...msgHis];

            // Reset msgHis if empty or too long (>13 messages)
            if (updatedMsgHis.length === 0 || updatedMsgHis.length > 13) {
                updatedMsgHis = [
                    {
                        role: 'user',
                        parts: [{ text: JSON.stringify({ user_command: transcript, current_pwm: currentPwm }) }]
                    }
                ];
            } else {
                // Add new user message
                updatedMsgHis.push({
                    role: 'user',
                    parts: [{ text: JSON.stringify({ user_command: transcript, current_pwm: currentPwm }) }]
                });
            }

            // Step 3: Send to Google Gemini LLM
            const API_KEY = process.env.GEMINI_API_KEY || req.body.geminiApiKey;
            if (!API_KEY) {
                return res.status(400).json({
                    success: false,
                    error: 'Gemini API key is required. Provide it in request body as geminiApiKey or set GEMINI_API_KEY environment variable.'
                });
            }

            const MODEL_ID = 'gemini-2.0-flash-exp';

            const geminiRequestBody = {
                contents: updatedMsgHis,
                systemInstruction: {
                    parts: [{
                        text: `# System Role
You are an adaptive motor control engine for adult toys, combining **natural language instructions** and **current real-time PWM value** to generate one PWM value. 
if you don't understand  **natural language instructions**, just return **current real-time PWM value**.
**Output Restriction**: Return ONLY the PWM value.

# Input Specification
"user_command": "String",          // natural language instruction
"current_pwm": 0-255 integer       // current real-time PWM value

# Output Specification
0-255 integer   // (ONLY this field)`
                    }]
                },
                generationConfig: {
                    temperature: 1,
                    maxOutputTokens: 65535,
                    topP: 1
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
                ]
            };

            const geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(geminiRequestBody)
                }
            );

            if (!geminiResponse.ok) {
                const errorBody = await geminiResponse.text();
                logger.error('Gemini API error:', errorBody);
                return res.status(500).json({
                    success: false,
                    error: `Gemini API error ${geminiResponse.status}: ${errorBody}`
                });
            }

            const geminiResult = await geminiResponse.json();
            
            // Extract LLM response
            const llmResponse = geminiResult.candidates[0].content;
            const pwmValue = llmResponse.parts[0].text.trim();

            // Step 4: Add LLM response to msgHis
            updatedMsgHis.push(llmResponse);

            // Log the processing for debugging
            logger.log('Speech-to-text with LLM processing completed', {
                transcript: transcript,
                currentPwm: currentPwm,
                newPwmValue: pwmValue,
                msgHisLength: updatedMsgHis.length
            });

            // Step 5: Return final msgHis and processing results
            res.json({
                success: true,
                transcript: transcript,
                currentPwm: currentPwm,
                newPwmValue: pwmValue,
                msgHis: updatedMsgHis,
                detectedLanguage: speechResponse.results[0]?.languageCode || null,
                autoDetected: !req.body.languageCode
            });

        } catch (error) {
            logger.error('Speech-to-text with LLM error:', error);
            res.status(500).json({
                success: false,
                error: 'Speech-to-text with LLM processing failed',
                details: error.message
            });
        }
    }
);

// Get user consent API endpoint (bonus endpoint for retrieving consent)
exports.getUserConsent = onRequest(
    {
        region: "europe-west1",
        cors: true
    },
    async (req, res) => {
        try {
            // Only allow GET requests
            if (req.method !== 'GET') {
                return res.status(405).json({ error: 'Method not allowed. Use GET.' });
            }

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
        cors: true
    },
    async (req, res) => {
        try {
            // Only allow POST requests
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed. Use POST.' });
            }

            // Validate required fields
            const { msgHis, audioContent, audioUri, currentPwm } = req.body;

            // Check if audio data is provided
            if (!audioContent && !audioUri) {
                return res.status(400).json({ 
                    error: 'Missing audio data. Provide either audioContent (base64) or audioUri.' 
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

            // Step 1: Convert speech to text
            const speechConfig = {
                encoding: req.body.encoding || 'WEBM_OPUS',
                sampleRateHertz: req.body.sampleRateHertz || 48000,
                enableAutomaticPunctuation: true,
                model: 'latest_long'
            };

            // Enable automatic language detection if no languageCode provided
            if (req.body.languageCode) {
                speechConfig.languageCode = req.body.languageCode;
            } else {
                speechConfig.languageCode = 'en-US';
                speechConfig.alternativeLanguageCodes = [
                    'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 
                    'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW', 'ar-SA', 
                    'hi-IN', 'nl-NL', 'sv-SE', 'da-DK', 'no-NO', 'fi-FI', 
                    'pl-PL', 'cs-CZ', 'hu-HU', 'tr-TR', 'he-IL', 'th-TH',
                    'vi-VN', 'id-ID', 'ms-MY', 'tl-PH', 'uk-UA', 'bg-BG'
                ];
            }

            const speechRequest = { config: speechConfig };

            // Add audio content
            if (audioContent) {
                speechRequest.audio = { content: audioContent };
            } else if (audioUri) {
                speechRequest.audio = { uri: audioUri };
            }

            // Perform speech recognition
            const [speechResponse] = await speechClient.recognize(speechRequest);
            
            // Extract transcription
            const transcript = speechResponse.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            if (!transcript || transcript.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'No speech detected in audio'
                });
            }

            // Step 2: Update msgHis with speech transcript
            let updatedMsgHis = [...msgHis];

            // Reset msgHis if empty or too long (>13 messages)
            if (updatedMsgHis.length === 0 || updatedMsgHis.length > 13) {
                updatedMsgHis = [
                    {
                        role: 'user',
                        parts: [{ text: JSON.stringify({ user_command: transcript, current_pwm: currentPwm }) }]
                    }
                ];
            } else {
                // Add new user message
                updatedMsgHis.push({
                    role: 'user',
                    parts: [{ text: JSON.stringify({ user_command: transcript, current_pwm: currentPwm }) }]
                });
            }

            // Step 3: Send to Google Gemini LLM
            const API_KEY = process.env.GEMINI_API_KEY || req.body.geminiApiKey;
            if (!API_KEY) {
                return res.status(400).json({
                    success: false,
                    error: 'Gemini API key is required. Provide it in request body as geminiApiKey or set GEMINI_API_KEY environment variable.'
                });
            }

            const MODEL_ID = 'gemini-2.0-flash-exp';

            const geminiRequestBody = {
                contents: updatedMsgHis,
                systemInstruction: {
                    parts: [{
                        text: `# System Role
You are an adaptive motor control engine for adult toys, combining **natural language instructions** and **current real-time PWM value** to generate one PWM value. 
if you don't understand  **natural language instructions**, just return **current real-time PWM value**.
**Output Restriction**: Return ONLY the PWM value.

# Input Specification
"user_command": "String",          // natural language instruction
"current_pwm": 0-255 integer       // current real-time PWM value

# Output Specification
0-255 integer   // (ONLY this field)`
                    }]
                },
                generationConfig: {
                    temperature: 1,
                    maxOutputTokens: 65535,
                    topP: 1
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
                ]
            };

            const geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(geminiRequestBody)
                }
            );

            if (!geminiResponse.ok) {
                const errorBody = await geminiResponse.text();
                logger.error('Gemini API error:', errorBody);
                return res.status(500).json({
                    success: false,
                    error: `Gemini API error ${geminiResponse.status}: ${errorBody}`
                });
            }

            const geminiResult = await geminiResponse.json();
            
            // Extract LLM response
            const llmResponse = geminiResult.candidates[0].content;
            const pwmValue = llmResponse.parts[0].text.trim();

            // Step 4: Add LLM response to msgHis
            updatedMsgHis.push(llmResponse);

            // Log the processing for debugging
            logger.log('Speech-to-text with LLM processing completed', {
                transcript: transcript,
                currentPwm: currentPwm,
                newPwmValue: pwmValue,
                msgHisLength: updatedMsgHis.length
            });

            // Step 5: Return final msgHis and processing results
            res.json({
                success: true,
                transcript: transcript,
                currentPwm: currentPwm,
                newPwmValue: pwmValue,
                msgHis: updatedMsgHis,
                detectedLanguage: speechResponse.results[0]?.languageCode || null,
                autoDetected: !req.body.languageCode
            });

        } catch (error) {
            logger.error('Speech-to-text with LLM error:', error);
            res.status(500).json({
                success: false,
                error: 'Speech-to-text with LLM processing failed',
                details: error.message
            });
        }
    }
);