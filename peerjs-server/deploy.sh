#!/bin/bash

# Dulaan PeerJS Server Deployment Script
# This script deploys the PeerJS server to Google App Engine

set -e  # Exit on any error

echo "🚀 Deploying Dulaan PeerJS Server to Google App Engine..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: Google Cloud SDK is not installed."
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with Google Cloud."
    echo "Please run: gcloud auth login"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No Google Cloud project set."
    echo "Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"

# Check if App Engine is enabled
if ! gcloud app describe &> /dev/null; then
    echo "⚠️  App Engine not initialized for this project."
    echo "Initializing App Engine..."
    gcloud app create --region=us-central1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests if they exist
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo "🧪 Running tests..."
    npm test
fi

# Deploy to App Engine
echo "🚀 Deploying to App Engine..."
gcloud app deploy app.yaml --quiet

# Get the deployed URL
APP_URL=$(gcloud app browse --service=default --no-launch-browser)
echo "✅ Deployment successful!"
echo "🌐 PeerJS Server URL: $APP_URL"
echo "🔗 PeerJS Endpoint: $APP_URL/peerjs"

# Test the deployment
echo "🧪 Testing deployment..."
if curl -s "$APP_URL" | grep -q "Dulaan PeerJS Server"; then
    echo "✅ Server is responding correctly!"
else
    echo "⚠️  Server might not be fully ready yet. Please check the logs:"
    echo "   gcloud app logs tail --service=default"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Update your client code to use: $APP_URL/peerjs"
echo "2. Monitor logs: gcloud app logs tail --service=default"
echo "3. View in console: https://console.cloud.google.com/appengine/services"