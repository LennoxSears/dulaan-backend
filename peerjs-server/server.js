const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all routes
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Dulaan PeerJS Server',
    description: 'WebRTC signaling server for peer-to-peer communication',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/',
      peerjs: '/peerjs',
      peers: '/peerjs/peers' // if discovery is enabled
    }
  });
});

// Health check endpoint for App Engine
app.get('/_ah/health', (req, res) => {
  res.status(200).send('OK');
});

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`Dulaan PeerJS Server running on port ${PORT}`);
  console.log(`PeerJS endpoint: http://localhost:${PORT}/peerjs`);
});

// Create PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: process.env.NODE_ENV !== 'production',
  path: '/',
  
  // Security and connection settings
  key: process.env.PEERJS_KEY || 'dulaan-peerjs-key',
  
  // Connection timeouts
  expire_timeout: 5000,      // Message expiration timeout (5 seconds)
  alive_timeout: 60000,      // Connection alive timeout (60 seconds)
  
  // Concurrent connection limit
  concurrent_limit: 5000,
  
  // Allow peer discovery (optional - can be disabled for security)
  allow_discovery: process.env.ALLOW_DISCOVERY === 'true' || false,
  
  // Custom client ID generation
  generateClientId: () => {
    // Generate a random ID with timestamp prefix for uniqueness
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  },
  
  // CORS configuration for PeerJS
  corsOptions: {
    origin: true,
    credentials: true
  }
});

// Handle PeerJS server events
peerServer.on('connection', (client) => {
  console.log(`Peer connected: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`Peer disconnected: ${client.getId()}`);
});

// Mount PeerJS server
app.use('/peerjs', peerServer);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;