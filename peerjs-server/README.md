# Dulaan PeerJS Server

A WebRTC signaling server for peer-to-peer communication using PeerJS, deployed on Google App Engine.

## Overview

This PeerJS server enables WebRTC peer-to-peer connections for the Dulaan application. It handles:

- **Peer Registration**: Manages peer IDs and connection metadata
- **Signaling**: Facilitates WebRTC offer/answer exchange between peers
- **Connection Management**: Tracks active connections and handles disconnections
- **CORS Support**: Configured for cross-origin requests from web clients

## Architecture

```
Client A ←→ PeerJS Server ←→ Client B
    ↓                           ↓
    └─── Direct P2P Connection ──┘
```

The server only handles signaling; actual data flows directly between peers.

## Local Development

### Prerequisites

- Node.js 22+
- npm or yarn
- Google Cloud SDK (for deployment)

### Setup

1. **Install dependencies:**
   ```bash
   cd peerjs-server
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Test the server:**
   ```bash
   curl http://localhost:8080/
   ```

### Environment Variables

- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment mode (development/production)
- `PEERJS_KEY`: Authentication key for PeerJS API calls
- `ALLOW_DISCOVERY`: Enable peer discovery endpoint (default: false)

## Deployment to Google App Engine

### Prerequisites

1. **Install Google Cloud SDK:**
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate:**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable App Engine:**
   ```bash
   gcloud app create --region=us-central1
   ```

### Deploy

1. **Deploy to App Engine:**
   ```bash
   cd peerjs-server
   npm run deploy
   ```

2. **View deployment:**
   ```bash
   gcloud app browse --service=peerjs-server
   ```

### Configuration

The `app.yaml` file configures:

- **Runtime**: Node.js 22
- **Scaling**: 1-10 instances with CPU-based scaling
- **Health Checks**: Readiness and liveness probes
- **Session Affinity**: Enabled for WebSocket connections
- **Security**: Peer discovery disabled in production

## Client Usage

### JavaScript/Web Client

```javascript
// Connect to the PeerJS server
const peer = new Peer('unique-peer-id', {
  host: 'your-app-id.appspot.com',
  port: 443,
  path: '/peerjs',
  secure: true
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

### React/Vue/Angular Integration

```javascript
import Peer from 'peerjs';

class PeerService {
  constructor() {
    this.peer = new Peer({
      host: 'your-app-id.appspot.com',
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
  }

  connect(targetPeerId) {
    return this.peer.connect(targetPeerId);
  }

  onConnection(callback) {
    this.peer.on('connection', callback);
  }
}

export default PeerService;
```

## API Endpoints

### Server Information
- **GET** `/` - Server status and information
- **GET** `/_ah/health` - Health check for App Engine

### PeerJS Endpoints
- **POST** `/peerjs/id` - Generate new peer ID
- **GET** `/peerjs/peers` - List active peers (if discovery enabled)
- **WebSocket** `/peerjs/peerjs` - WebSocket endpoint for signaling

## Security Considerations

1. **Authentication**: Configure `PEERJS_KEY` for API access control
2. **CORS**: Properly configured for your domain origins
3. **Peer Discovery**: Disabled by default to prevent peer enumeration
4. **Rate Limiting**: App Engine provides built-in DDoS protection
5. **HTTPS**: Always use secure connections in production

## Monitoring and Logging

### App Engine Logs
```bash
# View recent logs
gcloud app logs tail --service=peerjs-server

# View logs from specific time
gcloud app logs read --service=peerjs-server --since=1h
```

### Metrics
- **Connection Count**: Monitor active peer connections
- **CPU/Memory Usage**: Track resource utilization
- **Error Rate**: Monitor failed connection attempts
- **Latency**: WebSocket connection establishment time

## Troubleshooting

### Common Issues

1. **Connection Failures**
   - Check CORS configuration
   - Verify HTTPS/WSS usage in production
   - Ensure firewall allows WebSocket connections

2. **High Latency**
   - Consider deploying to multiple regions
   - Optimize App Engine instance class
   - Check network connectivity

3. **Scaling Issues**
   - Adjust `max_instances` in app.yaml
   - Monitor CPU/memory usage
   - Consider session affinity settings

### Debug Mode

Enable debug logging in development:
```javascript
// In server.js
const peerServer = ExpressPeerServer(server, {
  debug: true,  // Enable debug logging
  // ... other options
});
```

## Cost Optimization

- **Instance Class**: Start with F2, scale up if needed
- **Min Instances**: Keep 1 instance for availability
- **Auto Scaling**: Configure based on actual usage patterns
- **Regional Deployment**: Deploy close to your users

## Support

For issues related to:
- **PeerJS**: [PeerJS Documentation](https://peerjs.com/docs/)
- **Google App Engine**: [App Engine Documentation](https://cloud.google.com/appengine/docs)
- **WebRTC**: [WebRTC Documentation](https://webrtc.org/getting-started/)

## License

MIT License - see LICENSE file for details.