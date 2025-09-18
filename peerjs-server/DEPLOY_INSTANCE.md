# Deploy PeerJS Server to Google Cloud Instance

## Prerequisites
- Google Cloud SDK installed and authenticated
- Docker installed locally (for building)
- Project with billing enabled

## Step 1: Create a Google Cloud Instance

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Create a VM instance
gcloud compute instances create dulaan-peerjs-server \
    --zone=europe-west1-b \
    --machine-type=e2-micro \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --service-account=default \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --tags=http-server,https-server,peerjs-server \
    --create-disk=auto-delete=yes,boot=yes,device-name=dulaan-peerjs-server,image=projects/cos-cloud/global/images/family/cos-stable,mode=rw,size=10,type=pd-balanced \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --labels=environment=production,service=peerjs \
    --reservation-affinity=any
```

## Step 2: Configure Firewall Rules

```bash
# Create firewall rule for PeerJS server
gcloud compute firewall-rules create allow-peerjs-server \
    --allow tcp:9000 \
    --source-ranges 0.0.0.0/0 \
    --target-tags peerjs-server \
    --description "Allow PeerJS server on port 9000"

# Create firewall rule for HTTP (optional, for health checks)
gcloud compute firewall-rules create allow-http-8080 \
    --allow tcp:8080 \
    --source-ranges 0.0.0.0/0 \
    --target-tags peerjs-server \
    --description "Allow HTTP on port 8080"
```

## Step 3: Build and Push Docker Image

```bash
# Build the Docker image
docker build -t gcr.io/$PROJECT_ID/dulaan-peerjs-server .

# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker

# Push the image to Google Container Registry
docker push gcr.io/$PROJECT_ID/dulaan-peerjs-server
```

## Step 4: Deploy to the Instance

```bash
# SSH into the instance
gcloud compute ssh dulaan-peerjs-server --zone=europe-west1-b

# On the instance, run these commands:
# Pull and run the Docker container
sudo docker pull gcr.io/YOUR_PROJECT_ID/dulaan-peerjs-server
sudo docker run -d \
    --name peerjs-server \
    --restart unless-stopped \
    -p 9000:9000 \
    -e NODE_ENV=production \
    -e PEERJS_KEY=dulaan-peerjs-production-key \
    gcr.io/YOUR_PROJECT_ID/dulaan-peerjs-server

# Check if container is running
sudo docker ps

# Check logs
sudo docker logs peerjs-server
```

## Step 5: Get the External IP

```bash
# Get the external IP of your instance
gcloud compute instances describe dulaan-peerjs-server \
    --zone=europe-west1-b \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

## Step 6: Test the Deployment

```bash
# Test the server (replace EXTERNAL_IP with your instance's IP)
curl http://EXTERNAL_IP:9000/
curl http://EXTERNAL_IP:9000/peerjs
```

## Step 7: Update Client Configuration

Update your client code to use the new server:

```javascript
window.remoteControl.peer = new Peer(hostId, {
    host: 'EXTERNAL_IP',  // Your instance's external IP
    port: 9000,
    path: '/peerjs',
    secure: false  // Use true if you set up HTTPS
});
```

## Optional: Set up HTTPS with Let's Encrypt

```bash
# SSH into the instance
gcloud compute ssh dulaan-peerjs-server --zone=europe-west1-b

# Install certbot
sudo apt update
sudo apt install -y certbot

# Get SSL certificate (you'll need a domain name)
sudo certbot certonly --standalone -d your-domain.com

# Update Docker run command to include SSL
sudo docker stop peerjs-server
sudo docker rm peerjs-server
sudo docker run -d \
    --name peerjs-server \
    --restart unless-stopped \
    -p 80:8080 \
    -p 443:9000 \
    -v /etc/letsencrypt:/etc/letsencrypt:ro \
    -e NODE_ENV=production \
    -e PEERJS_KEY=dulaan-peerjs-production-key \
    -e SSL_CERT=/etc/letsencrypt/live/your-domain.com/fullchain.pem \
    -e SSL_KEY=/etc/letsencrypt/live/your-domain.com/privkey.pem \
    gcr.io/YOUR_PROJECT_ID/dulaan-peerjs-server
```

## Monitoring and Maintenance

```bash
# Check container status
gcloud compute ssh dulaan-peerjs-server --zone=europe-west1-b
sudo docker ps
sudo docker logs peerjs-server

# Update the container
sudo docker pull gcr.io/YOUR_PROJECT_ID/dulaan-peerjs-server
sudo docker stop peerjs-server
sudo docker rm peerjs-server
# Run the docker run command again

# Monitor instance
gcloud compute instances list
gcloud logging read "resource.type=gce_instance AND resource.labels.instance_id=INSTANCE_ID"
```

## Cost Optimization

- Use `e2-micro` instance (free tier eligible)
- Set up automatic shutdown during off-hours
- Use preemptible instances for development

## Security Considerations

- Restrict firewall rules to specific IP ranges if possible
- Use HTTPS in production
- Regularly update the Docker image
- Monitor access logs