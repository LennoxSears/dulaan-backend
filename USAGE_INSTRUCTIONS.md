# Dulaan PeerJS Server - Usage Instructions

## 1. Clean Up Existing Deployments (Windows)

Run the cleanup script to remove all App Engine and Cloud Run deployments:

```cmd
# Download and run the cleanup script
cleanup-google-cloud.cmd
```

**What it does:**
- Removes all Cloud Run services
- Removes all Container Registry images  
- Removes non-serving App Engine versions
- Removes Cloud Build triggers
- Removes PeerJS related firewall rules
- Removes SSL certificates

## 2. Deploy PeerJS Server to Google Cloud Instance

### Quick Commands:

```bash
# 1. Create instance
gcloud compute instances create dulaan-peerjs-server \
    --zone=europe-west1-b \
    --machine-type=e2-micro \
    --tags=peerjs-server \
    --image-family=cos-stable \
    --image-project=cos-cloud

# 2. Create firewall rule
gcloud compute firewall-rules create allow-peerjs-server \
    --allow tcp:9000 \
    --target-tags peerjs-server

# 3. Get external IP
gcloud compute instances describe dulaan-peerjs-server \
    --zone=europe-west1-b \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# 4. SSH into instance
gcloud compute ssh dulaan-peerjs-server --zone=europe-west1-b

# 5. Run PeerJS server (on the instance)
sudo docker run -p 9000:9000 -d --name peerjs-server --restart unless-stopped peerjs/peerjs-server
```

### Detailed Instructions:

See `peerjs-server/DEPLOY_INSTANCE.md` for complete step-by-step instructions.

## 3. Update Client Configuration

After deployment, update your client code with the instance's external IP:

```javascript
// In remote-control-demo.html, uncomment and update:
window.remoteControl.peer = new Peer(hostId, {
    host: 'YOUR_INSTANCE_EXTERNAL_IP',  // Replace with actual IP
    port: 9000,
    path: '/',
    secure: false  // Set to true if using HTTPS
});
```

## 4. Test the Deployment

```bash
# Test server response
curl http://YOUR_INSTANCE_EXTERNAL_IP:9000/

# Should return PeerJS server information
```

## 5. Monitor the Server

```bash
# SSH into instance
gcloud compute ssh dulaan-peerjs-server --zone=europe-west1-b

# Check container status
sudo docker ps

# Check logs
sudo docker logs peerjs-server

# Update container (when needed)
sudo docker pull peerjs/peerjs-server
sudo docker stop peerjs-server
sudo docker rm peerjs-server
sudo docker run -p 9000:9000 -d --name peerjs-server --restart unless-stopped peerjs/peerjs-server
```

## 6. Cost Optimization

- **e2-micro instance**: Free tier eligible (up to 1 instance per month)
- **Minimal resources**: PeerJS server is lightweight
- **Auto-restart**: Container restarts automatically if it crashes
- **No custom images**: Uses official PeerJS image (no build/maintenance costs)

## 7. Security (Optional)

For production, consider:

1. **HTTPS Setup**: Use nginx with Let's Encrypt (see deployment guide)
2. **Firewall restrictions**: Limit access to specific IP ranges
3. **Domain name**: Use a custom domain instead of IP address

## Troubleshooting

### Common Issues:

1. **Connection refused**: Check firewall rules and container status
2. **WebSocket errors**: Ensure port 9000 is open and accessible
3. **Container not running**: Check Docker logs for errors

### Debug Commands:

```bash
# Check instance status
gcloud compute instances list

# Check firewall rules
gcloud compute firewall-rules list | grep peerjs

# Check container
gcloud compute ssh dulaan-peerjs-server --zone=europe-west1-b
sudo docker ps -a
sudo docker logs peerjs-server
```

## Support

- **PeerJS Documentation**: https://peerjs.com/docs/
- **Google Cloud Instance**: https://cloud.google.com/compute/docs/instances
- **Docker**: https://docs.docker.com/