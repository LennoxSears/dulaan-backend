# Use Node.js 18 LTS (stable for PeerJS)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port 9000 (standard PeerJS port)
EXPOSE 9000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=9000

# Start the server
CMD ["node", "server.js"]