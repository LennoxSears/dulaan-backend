# Cleanup Google Cloud Deployments

## Remove App Engine Deployments

### 1. List App Engine Services
```bash
gcloud app services list
```

### 2. Delete App Engine Service (if you have a custom service)
```bash
# If you deployed to a custom service (not default)
gcloud app services delete SERVICE_NAME
```

### 3. Delete App Engine Versions
```bash
# List all versions
gcloud app versions list

# Delete specific versions (keep one version of default service)
gcloud app versions delete VERSION_ID --service=default

# Or delete all non-serving versions
gcloud app versions list --filter="traffic_split=0" --format="value(id,service)" | while read version service; do
  gcloud app versions delete "$version" --service="$service" --quiet
done
```

### 4. Disable App Engine (Optional - This is irreversible!)
```bash
# WARNING: This cannot be undone!
# gcloud app disable
```

## Remove Cloud Run Deployments

### 1. List Cloud Run Services
```bash
gcloud run services list
```

### 2. Delete Cloud Run Services
```bash
# Delete specific service
gcloud run services delete dulaan-peerjs-server --region=europe-west1

# Delete all Cloud Run services in a region
gcloud run services list --region=europe-west1 --format="value(metadata.name)" | xargs -I {} gcloud run services delete {} --region=europe-west1 --quiet
```

### 3. List and Delete Cloud Run Revisions
```bash
# List revisions
gcloud run revisions list --region=europe-west1

# Delete specific revision
gcloud run revisions delete REVISION_NAME --region=europe-west1
```

## Remove Container Images

### 1. List Container Images
```bash
# List images in Container Registry
gcloud container images list

# List images for specific repository
gcloud container images list --repository=gcr.io/PROJECT_ID/dulaan-peerjs-server
```

### 2. Delete Container Images
```bash
# Delete specific image
gcloud container images delete gcr.io/PROJECT_ID/dulaan-peerjs-server:TAG

# Delete all images for a repository
gcloud container images list-tags gcr.io/PROJECT_ID/dulaan-peerjs-server --format="get(digest)" | xargs -I {} gcloud container images delete gcr.io/PROJECT_ID/dulaan-peerjs-server@{} --force-delete-tags --quiet
```

### 3. Delete Entire Repository
```bash
gcloud container images delete gcr.io/PROJECT_ID/dulaan-peerjs-server --force-delete-tags
```

## Remove Cloud Build History

### 1. List Cloud Build Triggers
```bash
gcloud builds triggers list
```

### 2. Delete Cloud Build Triggers
```bash
gcloud builds triggers delete TRIGGER_ID
```

### 3. List Build History
```bash
gcloud builds list --limit=50
```

### 4. Cancel Running Builds
```bash
# List running builds
gcloud builds list --ongoing

# Cancel specific build
gcloud builds cancel BUILD_ID
```

## Remove Firewall Rules (if created)

### 1. List Firewall Rules
```bash
gcloud compute firewall-rules list | grep -E "(peerjs|dulaan)"
```

### 2. Delete Firewall Rules
```bash
gcloud compute firewall-rules delete allow-peerjs-server
gcloud compute firewall-rules delete allow-http-8080
```

## Remove Load Balancers (if created)

### 1. List Load Balancers
```bash
gcloud compute url-maps list
gcloud compute backend-services list
gcloud compute target-https-proxies list
```

### 2. Delete Load Balancer Components
```bash
# Delete in this order:
gcloud compute forwarding-rules delete FORWARDING_RULE_NAME --global
gcloud compute target-https-proxies delete TARGET_PROXY_NAME
gcloud compute url-maps delete URL_MAP_NAME
gcloud compute backend-services delete BACKEND_SERVICE_NAME --global
```

## Remove SSL Certificates (if created)

### 1. List SSL Certificates
```bash
gcloud compute ssl-certificates list
```

### 2. Delete SSL Certificates
```bash
gcloud compute ssl-certificates delete CERTIFICATE_NAME
```

## Complete Cleanup Script

```bash
#!/bin/bash

# Set your project ID
PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

echo "🧹 Starting cleanup of Google Cloud deployments..."

# Clean up Cloud Run
echo "Cleaning up Cloud Run services..."
gcloud run services list --region=europe-west1 --format="value(metadata.name)" | grep dulaan | xargs -I {} gcloud run services delete {} --region=europe-west1 --quiet

# Clean up Container Images
echo "Cleaning up container images..."
gcloud container images list --repository=gcr.io/$PROJECT_ID --format="value(name)" | grep dulaan | xargs -I {} gcloud container images delete {} --force-delete-tags --quiet

# Clean up App Engine versions (keep default)
echo "Cleaning up App Engine versions..."
gcloud app versions list --filter="traffic_split=0" --format="value(id,service)" | while read version service; do
  if [ "$service" != "default" ] || [ "$version" != "$(gcloud app versions list --service=default --filter='traffic_split>0' --format='value(id)')" ]; then
    gcloud app versions delete "$version" --service="$service" --quiet
  fi
done

# Clean up Cloud Build triggers
echo "Cleaning up Cloud Build triggers..."
gcloud builds triggers list --format="value(id,name)" | grep dulaan | cut -d' ' -f1 | xargs -I {} gcloud builds triggers delete {} --quiet

echo "✅ Cleanup completed!"
echo "Note: App Engine application itself was not deleted (requires manual action)"
echo "Note: Check for any remaining resources manually"
```

## Verification

After cleanup, verify everything is removed:

```bash
# Check Cloud Run
gcloud run services list

# Check Container Registry
gcloud container images list

# Check App Engine
gcloud app versions list

# Check Cloud Build
gcloud builds triggers list

# Check Firewall Rules
gcloud compute firewall-rules list | grep dulaan

# Check billing to ensure no ongoing charges
gcloud billing accounts list
```

## Important Notes

1. **App Engine Application**: Cannot be deleted, only disabled (irreversible)
2. **Billing**: Check your billing dashboard after cleanup
3. **Logs**: Cloud Logging data may still exist and incur charges
4. **Backups**: Make sure you have backups of any important data
5. **DNS**: Update any DNS records pointing to old services

## Cost Monitoring

```bash
# Check current month's billing
gcloud billing accounts list
gcloud billing projects describe PROJECT_ID

# Set up billing alerts (recommended)
gcloud alpha billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="Dulaan Project Budget" \
    --budget-amount=10USD \
    --threshold-rule=percent=50 \
    --threshold-rule=percent=90
```