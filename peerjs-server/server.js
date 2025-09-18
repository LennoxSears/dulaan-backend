const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 9000;

// Enable CORS for all routes
app.use(cors({
  origin: true,
  credentials: true
}));

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Dulaan PeerJS Server',
    description: 'WebRTC signaling server for peer-to-peer communication',
    version: '1.0.0',
    status: 'running',
    port: PORT
  });
});

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`Dulaan PeerJS Server running on port ${PORT}`);
  console.log(`PeerJS endpoint: http://localhost:${PORT}/peerjs`);
});

// Create PeerJS server with standard configuration
const peerServer = ExpressPeerServer(server, {
  debug: process.env.NODE_ENV !== 'production',
  path: '/',
  key: process.env.PEERJS_KEY || 'peerjs',
  allow_discovery: false
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