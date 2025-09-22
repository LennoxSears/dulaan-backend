# Dulaan Backend - Direct Audio Processing

Backend system for Dulaan motor control with direct audio-to-PWM processing via Gemini 2.0.

## Overview

Dulaan Backend provides real-time audio processing for motor control using Google's Gemini 2.0 AI model. The system processes audio directly without traditional speech-to-text conversion, enabling faster and more contextual motor control commands.

## Architecture

- **Direct Audio Processing**: Audio → Gemini 2.0 → PWM Commands
- **Real-time Control**: WebRTC-based remote control capabilities
- **Cloud Functions**: Serverless API endpoints on Firebase
- **Client SDK**: JavaScript SDK for web and mobile applications

## Project Structure

```
├── functions/           # Firebase Cloud Functions
│   ├── index.js        # Main API endpoints
│   └── package.json    # Server dependencies
├── client/             # Client SDK
│   ├── core/          # Audio processing core
│   ├── modes/         # Control modes (AI voice, ambient, touch)
│   ├── services/      # API and remote services
│   └── utils/         # Utilities and constants
├── peerjs-server/     # WebRTC signaling server
└── test-real-api.html # API testing interface
```

## API Endpoints

### Direct Audio-to-PWM Processing
- **URL**: `https://directaudiotopwm-qveg3gkwxa-ew.a.run.app`
- **Method**: POST
- **Input**: Audio data (Int16Array), current PWM, message history
- **Output**: Transcription, new PWM value, AI response

### User Data Management
- **Store User Data**: `https://storeuserdata-qveg3gkwxa-ew.a.run.app`
- **Store Consent**: `https://storeuserconsent-qveg3gkwxa-ew.a.run.app`
- **Get Consent**: `https://getuserconsent-qveg3gkwxa-ew.a.run.app`

## Key Features

### Audio Processing
- **Direct Audio Input**: Processes raw audio with Gemini 2.0
- **Smart Buffer Management**: Resets on speech start, handles overflow intelligently
- **Multi-language Support**: Automatic language detection
- **Context Awareness**: Maintains conversation history

### Motor Control
- **PWM Commands**: 0-255 range motor control
- **Intent Detection**: Distinguishes motor commands from general conversation
- **Real-time Response**: Sub-second processing times
- **Safety Limits**: Validated PWM ranges

### Client SDK
- **Multiple Control Modes**: AI voice, ambient, touch, remote
- **WebRTC Support**: Real-time remote control
- **Cross-platform**: Web, mobile, and desktop support
- **Modular Architecture**: Easy integration and customization

## Configuration

### Audio Settings
- **Sample Rate**: 16kHz
- **Format**: Int16Array (mono)
- **Buffer Size**: 1600 samples
- **Min Speech Duration**: 500ms

### AI Models
- **Audio Processing**: Gemini 2.0 Flash Experimental
- **Audio Format**: WAV (converted from Int16Array)
- **Context Window**: Last 10 conversation turns

## Development

### Prerequisites
- Node.js 22+
- Firebase CLI
- Google Cloud Project with Gemini API access

### Local Development
```bash
# Install dependencies
npm install

# Start Firebase emulators
npm run serve

# Deploy functions
npm run deploy
```

### Testing
Use `test-real-api.html` to test the direct audio processing API with real microphone input.

## Performance

- **Processing Time**: ~1-2 seconds for audio-to-PWM
- **Cold Start**: <3 seconds (optimized dependencies)
- **Memory Usage**: 1GB allocated per function instance
- **Concurrent Users**: 10 instances max per function

## Security

- **CORS Enabled**: Supports web and mobile clients
- **Input Validation**: All API inputs validated
- **Error Handling**: Graceful degradation on failures
- **Rate Limiting**: Built-in Firebase Functions limits

## License

MIT License - see LICENSE file for details.

## Support

For technical support and documentation, see the inline code comments and API documentation.
- [Python](/Python/quickstarts/uppercase-firestore/)
- [Node 1st gen](/Node-1st-gen/quickstarts/uppercase-firestore/)

This quickstart sample demonstrates using **Cloud Functions** triggered by **Firestore events**. The function transforms message text written to Firestore to uppercase.

### Quickstart: Add numbers and sanitize text with callable functions

- [Node 2nd gen](/Node/quickstarts/callable-functions/)
- [Python](/Python/quickstarts/callable-functions)
- [Node 1st gen](/Node-1st-gen/quickstarts/callable-functions/)

### HTTPS trigger quickstart: Time Server

- [Node 2nd gen](/Node/quickstarts/https-time-server/)
- [Python](/Python/quickstarts/https-time-server/)
- [Node 1st gen](/Node-1st-gen/quickstarts/https-time-server/)

This quickstart sample demonstrates using **Cloud Functions** triggered by **HTTPS requests**. The function returns the current server time and allows for date time formatting.

### Quickstart: Uppercaser for Realtime Database

- [Node 2nd gen](/Node/quickstarts/uppercase-rtdb/)
- [Python](/Python/quickstarts/uppercase-rtdb/)
- [Node 1st gen](/Node-1st-gen/quickstarts/uppercase-rtdb/)

This quickstart sample demonstrates using **Cloud Functions** triggered by **Realtime Database events**. The function transforms message text written to Realtime Database to uppercase.

### Hosting triggered HTTPS function quickstart: Big Ben

- [Node 1st gen](/Node-1st-gen/quickstarts/big-ben/)

This quickstart demonstrates using **Cloud Functions** with an HTTPS trigger that's triggered through a Firebase Hosting URL. The function will display a repeated number of "BONG"s depending on the hour of the day.

### Cloud Storage trigger quickstart: Thumbnail generator

- [Node 2nd gen](/Node/quickstarts/https-time-server/)
- [Python](/Python/quickstarts/https-time-server/)
- [Node 1st gen](/Node-1st-gen/quickstarts/https-time-server/)

This quickstart sample demonstrates using **Cloud Functions** triggered by **Firebase Storage events**. The function generates a thumbnail of uploaded images.

### Auth trigger quickstart: Welcome Email

> Auth user create and delete triggers aren't yet supported by 2nd gen functions

- [Node 1st gen](/Node-1st-gen/quickstarts/email-users/)

This quickstart sample demonstrates using **Cloud Functions** triggered by **Firebase Auth events**. The function sends a Welcome Email when user accounts are created (or when users sign-in using an Identity Provider for the first time) and sends a Goodbye Email when user accounts are deleted.

### Auth blocking trigger quickstart: Validate and check user status

- [Node 2nd gen](/Node/quickstarts/auth-blocking-functions/)
- [Python](/Python/quickstarts/auth-blocking-functions/)
- [Node 1st gen](/Node-1st-gen/quickstarts/auth-blocking-functions/)

This quickstart demonstrates using **Auth blocking functions** to validate a user's email before they are allowed to sign in, and to see if a user is part of a list of banned users in Firestore.

### PubSub trigger quickstart: Hello World

- [Node 2nd gen](/Node/quickstarts/pubsub-helloworld/)
- [Python](/Python/quickstarts/pubsub-helloworld/)
- [Node 1st gen](/Node-1st-gen/quickstarts/pubsub-helloworld/)

This quickstart sample demonstrates using **Cloud Functions** triggered by **PubSub events**. The functions log the PubSub payload in a Hello world message.

### Test Lab trigger quickstart: Log when a matrix completes

- [Node 2nd gen](/Node/quickstarts/testlab-matrix-completed/)
- [Python](/Python/quickstarts/testlab-matrix-completed/)

### Firebase Alerts trigger quickstart: Send crash reports to Discord](/2nd-gen/alerts-to-discord/)

- [Node 2nd gen](/Node/alerts-to-discord/)
- [Python](/Python/alerts-to-discord/)
- Node 1st gen: not supported

Trigger a function based on a Firebase Alert, and send information about the alert to a channel in a Discord server.

### Custom Events: Save image metadata

- [Node 2nd gen](/Node/quickstarts/custom-events/)
- [Python](/Python/quickstarts/custom-events)
- Node 1st gen: not supported

Learn how to trigger a function based on an event sent by an extension

### Unit testing

- [Test with Jest](/Node/test-functions-jest/)
    - [Test with Jest and TypeScript](/Node/test-functions-jest-ts/)
- [Test with Mocha](/Node/test-functions-mocha/)

<a name="environment"></a>
## Development Boilerplates

The Firebase CLI generates sample code for Cloud Functions using JavaScript or TypeScript.

### Server-side generated pages w/ Handlebars templating and user sessions

- [Node (1st gen)](/Node-1st-gen/template-handlebars)

This sample shows how to serve server-side generated HTML pages using the [HandlebarsJs](http://handlebarsjs.com/) templating system and serve user-specific content by always passing the Firebase ID token in a `__session` cookie.

<a name="image"></a>
## Image Processing

Here are a few samples that show how you can process or analyze images using Cloud Functions.

### Image Maker

- [Node (1st gen)](/Node-1st-gen/image-maker)

This sample demonstrates how to create various customized images such as sparkline or sphere charts through Cloud Functions and Hosting and serve it to the client.
Uses an HTTP trigger.

### Convert images after upload

- [Node (1st gen)](/Node-1st-gen/convert-images)

Demonstrates how to automatically convert images that are uploaded to Firebase Storage to JPEG using ImageMagick.
Uses a Firebase Storage trigger.

### Moderate offensive images

- [Node (1st gen)](/Node-1st-gen/moderate-images/)

Demonstrates how to automatically moderate offensive images that are uploaded to Firebase Storage by using the Google Cloud Vision API to detect offensive images and ImageMagick to blur these images.
Uses a Firebase Storage trigger.

### Extract image metadata

- [Node (1st gen)](/Node-1st-gen/exif-images/)

Demonstrates how to automatically extract image's metadata using ImageMagick for images that are uploaded to Firebase Storage.
Uses a Firebase Storage trigger.

### Task Queues: back up images from an API

- [Node 2nd gen](/Node/taskqueues-backup-images/)
- [Python](/Python/taskqueues-backup-images/)

See how to use Task Queues to meter traffic to a rate-limited API.


<a name="rtdb"></a>
## Firebase Realtime Database Data Consistency

These samples show how to implement automatic data consistency such as keeping a count of children, having a max amount of node childs, cleaning up old data etc...

### LastModified Firebase Realtime Database tracking

- [Node (1st gen)](/Node-1st-gen/lastmodified-tracking)

Tracking when the Firebase Database (or a subset) was last modified.
Uses a Realtime Database trigger.

### Firebase Database child nodes count

- [Node (1st gen)](/Node-1st-gen/child-count)

Keeps track of the number of child nodes of a Firebase Database element allowing clients to filter or order results using the child count.
This can be useful to keep track of the number of "likes" or "followers" of something shared through social media.
Uses a Realtime Database trigger.

### Limit number of child nodes

- [Node (1st gen)](/Node-1st-gen/limit-children)

Makes sure that the number of child nodes stays below a certain threshold. This can be useful to limit the number of lines of logs or chat history below a given number.
Uses a Realtime Database trigger.

### Removing old items from a list

- [Node (1st gen)](/Node-1st-gen/delete-old-child-nodes)

This sample shows how to remove child nodes older than 2 hours from a Firebase Database list. This can be useful for removing outdated items from a collection.
Uses a Realtime Database trigger.

<a name="other"></a>
## Solve other common use cases

### Send FCM notifications

- [Node (1st gen)](/Node-1st-gen/fcm-notifications)

This sample demonstrates how to send a Firebase Cloud Messaging (FCM) notification from a Realtime Database triggered Function when users get new followers. The sample also features a Web UI to experience the FCM notification.
Uses a Realtime Database trigger.

### Google Assistant says ordinal of given number

- [Node (1st gen)](/Node-1st-gen/assistant-say-number)

This sample shows how to create an action for the Google Home/Assistant using the Actions SDK hosted on Cloud Functions. The sample action asks users to say a number and reads out the ordinal of that number.
Uses an HTTP trigger.

### Authenticated JSON API

- [Node (1st gen)](/Node-1st-gen/authenticated-json-api)

This sample shows how to authenticate access to a JSON API to only allow access to data for a specific Firebase user.
Uses an HTTP trigger.

### Authorized HTTP endpoint

- [Node (1st gen)](/Node-1st-gen/authorized-https-endpoint)

This sample shows how to restrict an HTTPS Function to only the Firebase users of your app.
Only users who pass a valid Firebase ID token as a Bearer token in the `Authorization` header of the HTTP request or in a `__session` cookie are authorized to use the function.
Checking the ID token is done with an ExpressJs middleware that also passes the decoded ID token in the Express request object.
Uses an HTTP trigger.

### Authorize with 3rd-party authentication providers

[Okta](/Node-1st-gen/okta-auth), [LinkedIn](/Node-1st-gen/linkedin-auth), [Spotify](/Node-1st-gen/spotify-auth), [Instagram](/Node-1st-gen/instagram-auth), or [Basic Auth](/Node-1st-gen/username-password-auth)

Demonstrates how to authorize with a 3rd party sign-in mechanism, create a Firebase custom auth token, update the user's profile and authorize Firebase.
Uses an HTTP trigger.

### Post GitHub commits to Slack channel

- [Node (1st gen)](/Node-1st-gen/github-to-slack)

Demonstrates how to automatically post GitHub commits to a Slack channel using an HTTPS triggered Function.

### Create and charge customers with [Stripe](/Node-1st-gen/stripe) or [Paypal](/Node-1st-gen/paypal)

Demonstrates hows to integrate Firebase Auth and the Realtime database with Stripe via the Stripe Node.js library and shows how to create HTTP endpoints to charge customers via Paypal.

### Text moderation

- [Node (1st gen)](/Node-1st-gen/text-moderation)

Demonstrates how to moderate user input text for bad words. This can be used to moderate usernames, chat or forum messages.
Uses a Realtime Database trigger.

### Email confirmation

- [Node (1st gen)](/Node-1st-gen/email-confirmation)

Sends email confirmation after users subscribed to a mailing list.
Uses a Realtime Database trigger.

### Automatic message translation

- [Node (1st gen)](/Node-1st-gen/message-translation)

Integrates the Google Translate API to perform automatic text translation across any number of languages. Language codes can be stored in Firebase for on the fly changes.
Uses a Realtime Database trigger.

### Automatic URL shortener

- [Node (1st gen)](/Node-1st-gen/url-shortener)

Integrates the Bit.ly API to shorten URLs automatically as they are added to the database.
Uses a Realtime Database trigger.

### Full-text search for [Realtime Database](/Node-1st-gen/fulltext-search) or [Firestore](/Node-1st-gen/fulltext-search-firestore)

Enable full-text search on Firebase Database data or Firestore documents by using a hosted search service.
Uses a Realtime Database or Firestore trigger.

### User data cleanup

- [Node (1st gen)](/Node-1st-gen/user-data-cleanup)

Deletes all associated user data in the Realtime database when a user deletes his Firebase account.
Uses an Auth trigger.
**This code has moved to its own repo at
https://github.com/firebase/user-data-protection**

### Export your data to a Google Spreadsheet

- [Node (1st gen)](/Node-1st-gen/google-sheet-sync)

This sample demonstrates how to sync new data written to a Firebase database to a Google Sheet. It includes a method for obtaining, storing, and using Oauth2 tokens for Google API access.
Uses HTTPS triggers and Realtime Database triggers.

### Export your data to Big Query

- [Node (1st gen)](/Node-1st-gen/bigquery-import)

Copies Firebase Database elements into BigQuery automatically. This can be useful for instance for further logs analysis.
Uses a Realtime Database trigger.

### Webhook upon Firebase Database writes

- [Node (1st gen)](/Node-1st-gen/minimal-webhook)

Writing to the Firebase Database triggers a request to a callback URL (a Webhook). The content of the modified Data is sent to the Webhook.
Uses a Realtime Database trigger.

### Send a survey when users update your app

- [Node (1st gen)](/Node-1st-gen/survey-app-update)

This sample shows how to send a survey to your users who have updated your app. App Update is detected using a Firebase Analytics event.
Uses an Analytics trigger.

### Send a coupon to user who have completed a purchase

- [Node (1st gen)](/Node-1st-gen/coupon-on-purchase)

This sample shows how to send a coupon to your users who have just purchased something. 10% off on your next purchase!
Uses an Analytics trigger.

### Delete inactive users accounts via cron

- [Node (1st gen)](/Node-1st-gen/delete-unused-accounts-cron)

Periodically deletes the accounts of users who have not signed in in the last month.
Uses an HTTPS trigger.

### Developer Motivator

- [Node (1st gen)](/Node-1st-gen/developer-motivator)

This sample demonstrates how to send a Firebase Cloud Messaging (FCM) notification to the developer device each time your app gains or loses a user.
Uses an Analytics trigger.

### Audio Files Conversion

- [Node (1st gen)](/Node-1st-gen/ffmpeg-convert-audio)

This sample uses ffmpeg / fluent-ffmpeg and automatically converts audio files that are uploaded to Cloud Storage to FLAC file format with mono-channel audio @ 16000hz.
Uses a Storage trigger.

### Presence for Firestore

- [Node (1st gen)](/Node-1st-gen/presence-firestore)

Build a simple online / offline status indicator for your users by leveraging Firestore and Realtime Database together.
Uses a Realtime Database trigger.

### Publish Models to Firebase ML

- [Node (1st gen)](/Node-1st-gen/publish-model)

Automatically publishes models to Firebase ML for each TensorFlow Lite file that is uploaded to Firebase Storage.

### Get information about a YouTube channel

- [Node (1st gen)](/Node-1st-gen/youtube)

This sample shows how to query the Youtube Data API.
Uses an HTTPS trigger.

## Contributing

We'd love that you contribute to the project. Before doing so please read our [Contributor guide](CONTRIBUTING.md).

## License

© Google, 2015-2023. Licensed under an [Apache-2](LICENSE) license.

## Build Status

[![Actions Status][gh-actions-badge]][gh-actions]

[gh-actions]: https://github.com/firebase/functions-samples/actions
[gh-actions-badge]: https://github.com/firebase/functions-samples/workflows/CI%20Tests/badge.svg
